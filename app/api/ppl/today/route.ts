import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  programTemplates,
  templateDays,
  templateSlots,
  workoutSessions,
  sessionExercises,
  exercises,
  userPreferences,
  userExerciseDefaults,
  warmupTemplates,
} from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/mo-self';
import { eq, and, desc, inArray } from 'drizzle-orm';
import {
  calculateFatigue,
  logFatigue,
  checkDeloadNeeded,
  getActiveDeload,
  suggestWeight,
} from '@/lib/mo-coach';

// GET /api/ppl/today - Get today's PPL workout based on rotation
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences
    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id),
    });

    const equipmentLevel = prefs?.defaultEquipmentLevel || 'full_gym';

    // Get the PPL template
    const template = await db.query.programTemplates.findFirst({
      where: eq(programTemplates.slug, 'ppl-recomp-6'),
      with: {
        days: {
          orderBy: (d, { asc }) => [asc(d.dayOrder)],
          with: {
            slots: {
              orderBy: (s, { asc }) => [asc(s.slotOrder)],
            },
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'PPL template not found. Run seed script first.' },
        { status: 404 }
      );
    }

    // Get the user's last completed session to determine rotation
    const lastSession = await db.query.workoutSessions.findFirst({
      where: and(
        eq(workoutSessions.userId, user.id),
        eq(workoutSessions.status, 'completed')
      ),
      orderBy: [desc(workoutSessions.completedAt)],
      with: {
        templateDay: true,
      },
    });

    // Calculate fatigue and check for deload
    const [fatigueResult, deloadDecision, activeDeload] = await Promise.all([
      calculateFatigue(user.id),
      checkDeloadNeeded(user.id),
      getActiveDeload(user.id),
    ]);

    // Log fatigue for trend tracking
    await logFatigue(user.id, fatigueResult);

    // Calculate days since last workout
    let daysSinceLastWorkout = 0;
    let intensityModifier = 1.0;
    let volumeModifier = 1.0;
    let rotationMessage: string | null = null;

    if (lastSession?.completedAt) {
      const lastDate = new Date(lastSession.completedAt);
      const today = new Date();
      daysSinceLastWorkout = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Adjust for time away
      if (daysSinceLastWorkout >= 7) {
        // Reset to day 1 after a week off
        rotationMessage = 'Starting fresh after extended break';
        intensityModifier = 0.85; // Start lighter after break
      } else if (daysSinceLastWorkout >= 3) {
        rotationMessage = 'Ease back in after break';
        intensityModifier = 0.9;
      }
    }

    // Apply deload modifiers if active
    if (activeDeload) {
      volumeModifier = activeDeload.volumeModifier;
      intensityModifier = Math.min(intensityModifier, activeDeload.intensityModifier);
      rotationMessage = `Deload week: ${Math.round(volumeModifier * 100)}% volume`;
    }

    // Determine today's day in rotation
    let todayDayOrder: number;
    if (!lastSession?.templateDay || daysSinceLastWorkout >= 7) {
      // First workout or reset after week off - start with day 1 (Push A)
      todayDayOrder = 1;
    } else {
      // Advance to next day in rotation
      const lastDayOrder = lastSession.templateDay.dayOrder;
      todayDayOrder = lastDayOrder >= template.daysPerWeek ? 1 : lastDayOrder + 1;
    }

    const todayDay = template.days.find((d) => d.dayOrder === todayDayOrder);

    if (!todayDay) {
      return NextResponse.json({ error: 'Template day not found' }, { status: 500 });
    }

    // Check if there's an existing session for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSession = await db.query.workoutSessions.findFirst({
      where: and(
        eq(workoutSessions.userId, user.id),
        eq(workoutSessions.templateDayId, todayDay.id)
      ),
      orderBy: [desc(workoutSessions.createdAt)],
      with: {
        exercises: {
          orderBy: (e, { asc }) => [asc(e.exerciseOrder)],
          with: {
            exercise: true,
            sets: {
              orderBy: (s, { asc }) => [asc(s.setNumber)],
            },
          },
        },
      },
    });

    // Get suggested exercises for each slot
    const slotsWithSuggestions = await Promise.all(
      todayDay.slots.map(async (slot) => {
        // Find matching exercises by movement pattern
        const matchingExercises = await db.query.exercises.findMany({
          where: and(
            eq(exercises.movementPattern, slot.movementPattern as any),
            eq(exercises.isActive, true)
          ),
          limit: 5,
        });

        // Get user's previous performance for these exercises
        const exerciseIds = matchingExercises.map((e) => e.id);
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
            { weight: d.lastWeight, reps: d.lastReps, rpe: d.lastRpe },
          ])
        );

        // Score and rank exercises
        const scoredExercises = matchingExercises.map((ex) => {
          let score = 0;

          // Priority scoring
          if (ex.priority === 'essential') score += 10;
          else if (ex.priority === 'common') score += 7;
          else if (ex.priority === 'specialized') score += 4;

          // Has previous data (user familiarity)
          if (previousMap.has(ex.id)) score += 5;

          // Equipment availability (simplified)
          if (equipmentLevel === 'full_gym') score += 3;
          else if (equipmentLevel === 'home_gym' && ex.equipment?.includes('dumbbell'))
            score += 3;
          else if (equipmentLevel === 'bodyweight' && ex.equipment?.includes('bodyweight'))
            score += 3;

          return { ...ex, score, previous: previousMap.get(ex.id) || null };
        });

        scoredExercises.sort((a, b) => b.score - a.score);

        return {
          id: slot.id,
          order: slot.slotOrder,
          type: slot.slotType,
          movementPattern: slot.movementPattern,
          targetMuscles: slot.targetMuscles,
          sets: slot.sets,
          repMin: slot.repRangeMin,
          repMax: slot.repRangeMax,
          rpeTarget: slot.rpeTarget,
          restSeconds: slot.restSeconds,
          isOptional: slot.isOptional,
          notes: slot.notes,
          suggestedExercise: scoredExercises[0] || null,
          alternatives: scoredExercises.slice(1, 4),
        };
      })
    );

    // Get warmup template for this day type
    const warmupTemplate = await db.query.warmupTemplates.findFirst({
      where: and(
        eq(warmupTemplates.dayType, todayDay.dayType as any),
        eq(warmupTemplates.isActive, true)
      ),
      with: {
        phases: {
          orderBy: (p, { asc }) => [asc(p.phaseOrder)],
          with: {
            exercises: {
              orderBy: (e, { asc }) => [asc(e.exerciseOrder)],
              with: {
                exercise: true,
              },
            },
          },
        },
      },
    });

    // Get total completed sessions for rotation info
    const allCompletedSessions = await db.query.workoutSessions.findMany({
      where: and(
        eq(workoutSessions.userId, user.id),
        eq(workoutSessions.status, 'completed')
      ),
    });

    return NextResponse.json({
      // Template info
      template: {
        id: template.id,
        name: template.name,
      },
      // Today's template day (renamed from 'today' to match frontend)
      templateDay: {
        id: todayDay.id,
        dayNumber: todayDay.dayOrder,
        name: todayDay.name,
        dayType: todayDay.dayType,
        targetMuscles: todayDay.targetMuscles || [],
        estimatedDuration: todayDay.estimatedDuration || 60,
        notes: null,
      },
      // Slots at root level (moved from today.slots)
      slots: slotsWithSuggestions.map((slot) => ({
        id: slot.id,
        slotOrder: slot.order,
        slotType: slot.type,
        movementPattern: slot.movementPattern,
        targetMuscles: slot.targetMuscles,
        sets: slot.sets,
        repRangeMin: slot.repMin,
        repRangeMax: slot.repMax,
        rpeTarget: slot.rpeTarget,
        restSeconds: slot.restSeconds,
        notes: slot.notes,
        isOptional: slot.isOptional,
        suggestedExercise: slot.suggestedExercise,
        alternatives: slot.alternatives,
      })),
      // Warmup template
      warmup: warmupTemplate
        ? {
            id: warmupTemplate.id,
            name: warmupTemplate.name,
            durationMinutes: warmupTemplate.durationMinutes,
            phases: warmupTemplate.phases.map((phase) => ({
              id: phase.id,
              name: phase.name,
              phaseType: phase.phaseType,
              durationSeconds: phase.durationSeconds,
              exercises: phase.exercises.map((pe) => ({
                id: pe.id,
                exerciseId: pe.exerciseId,
                name: pe.exercise?.name || 'Unknown',
                sets: pe.sets,
                reps: pe.reps,
                durationSeconds: pe.durationSeconds,
                notes: pe.notes,
              })),
            })),
          }
        : null,
      // Existing session (renamed from 'session')
      existingSession: existingSession
        ? {
            id: existingSession.id,
            status: existingSession.status,
            startedAt: existingSession.startedAt,
            completedAt: existingSession.completedAt,
            exercises: existingSession.exercises,
            sets: existingSession.exercises.flatMap((ex) => ex.sets || []),
          }
        : null,
      equipmentLevel,
      // Rotation info (renamed currentDay to dayNumber)
      rotation: {
        dayNumber: todayDayOrder,
        totalDays: template.daysPerWeek,
        sessionsCompleted: allCompletedSessions.length,
        lastWorkout: lastSession?.templateDay?.name || null,
        daysSinceLastWorkout,
        message: rotationMessage,
      },
      // Phase 5: Fatigue & Auto-regulation
      fatigue: {
        score: fatigueResult.score,
        level: fatigueResult.status.level,
        color: fatigueResult.status.color,
        message: fatigueResult.status.message,
        action: fatigueResult.status.action,
        recommendations: fatigueResult.recommendations,
      },
      deload: activeDeload
        ? {
            isActive: true,
            type: activeDeload.deloadType,
            daysRemaining: activeDeload.daysRemaining,
            reason: activeDeload.triggerReason,
          }
        : deloadDecision.shouldDeload
        ? {
            isActive: false,
            recommended: true,
            reason: deloadDecision.reason,
            suggestedDuration: deloadDecision.durationDays,
          }
        : {
            isActive: false,
            recommended: false,
          },
      modifiers: {
        volume: volumeModifier,
        intensity: intensityModifier,
      },
    });
  } catch (error) {
    console.error('Error fetching PPL workout:', error);
    return NextResponse.json({ error: 'Failed to fetch workout' }, { status: 500 });
  }
}
