import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exercises, exerciseRelationships, userExerciseDefaults } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, ne, inArray, or } from 'drizzle-orm';

// GET /api/exercises/alternatives - Get alternative exercises for a slot
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const movementPattern = searchParams.get('pattern');
    const exerciseId = searchParams.get('exerciseId');
    const equipmentLevel = searchParams.get('equipment') || 'full_gym';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!movementPattern) {
      return NextResponse.json(
        { error: 'Movement pattern is required' },
        { status: 400 }
      );
    }

    // Find exercises matching the movement pattern
    let matchingExercises = await db.query.exercises.findMany({
      where: and(
        eq(exercises.movementPattern, movementPattern as any),
        eq(exercises.isActive, true),
        exerciseId ? ne(exercises.id, exerciseId) : undefined
      ),
      limit: limit + 10, // Get extra for filtering
    });

    // If we have a specific exercise, also get its direct alternatives
    let directAlternatives: typeof matchingExercises = [];
    if (exerciseId) {
      const relationships = await db.query.exerciseRelationships.findMany({
        where: and(
          eq(exerciseRelationships.exerciseId, exerciseId),
          or(
            eq(exerciseRelationships.relationshipType, 'alternative'),
            eq(exerciseRelationships.relationshipType, 'variation')
          )
        ),
        with: {
          relatedExercise: true,
        },
      });

      directAlternatives = relationships
        .map((r) => r.relatedExercise)
        .filter((e) => e.isActive);
    }

    // Merge and deduplicate
    const allExercises = [
      ...directAlternatives,
      ...matchingExercises.filter(
        (e) => !directAlternatives.find((da) => da.id === e.id)
      ),
    ];

    // Filter by equipment level
    const filteredExercises = allExercises.filter((ex) => {
      if (!ex.equipment || ex.equipment.length === 0) return true;

      switch (equipmentLevel) {
        case 'bodyweight':
          return ex.equipment.includes('bodyweight') || ex.equipment.includes('none');
        case 'home_gym':
          return (
            ex.equipment.includes('bodyweight') ||
            ex.equipment.includes('dumbbell') ||
            ex.equipment.includes('band') ||
            ex.equipment.includes('kettlebell') ||
            ex.equipment.includes('pull-up-bar')
          );
        case 'full_gym':
        default:
          return true;
      }
    });

    // Get user's previous performance for ranking
    const exerciseIds = filteredExercises.map((e) => e.id);
    const previousDefaults =
      exerciseIds.length > 0
        ? await db.query.userExerciseDefaults.findMany({
            where: and(
              eq(userExerciseDefaults.userId, user.id),
              inArray(userExerciseDefaults.exerciseId, exerciseIds)
            ),
          })
        : [];

    const previousMap = new Map(
      previousDefaults.map((d) => [
        d.exerciseId,
        { weight: d.lastWeight, reps: d.lastReps },
      ])
    );

    // Score and rank exercises
    const scoredExercises = filteredExercises.map((ex) => {
      let score = 0;

      // Is direct alternative (higher priority)
      if (directAlternatives.find((da) => da.id === ex.id)) score += 15;

      // Priority scoring
      if (ex.priority === 'essential') score += 10;
      else if (ex.priority === 'common') score += 7;
      else if (ex.priority === 'specialized') score += 4;

      // Has previous data (user familiarity)
      if (previousMap.has(ex.id)) score += 5;

      // Difficulty match (prefer beginner/intermediate for most users)
      if (ex.difficulty === 'intermediate') score += 3;
      else if (ex.difficulty === 'beginner') score += 2;

      return {
        id: ex.id,
        name: ex.name,
        slug: ex.slug,
        category: ex.category,
        movementPattern: ex.movementPattern,
        primaryMuscles: ex.primaryMuscles,
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        priority: ex.priority,
        description: ex.description,
        score,
        previous: previousMap.get(ex.id) || null,
        isDirectAlternative: directAlternatives.some((da) => da.id === ex.id),
      };
    });

    // Sort by score and limit
    scoredExercises.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      exercises: scoredExercises.slice(0, limit),
      total: scoredExercises.length,
      filters: {
        movementPattern,
        equipmentLevel,
        excludedExerciseId: exerciseId,
      },
    });
  } catch (error) {
    console.error('Error fetching alternatives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alternatives' },
      { status: 500 }
    );
  }
}
