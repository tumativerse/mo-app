import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessionSets, sessionExercises, workoutSessions } from '@/lib/db/schema';
import { getCurrentUser, checkAndRecordPR } from '@/lib/mo-self';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Schema for logging a set
const logSetSchema = z.object({
  sessionExerciseId: z.string().uuid(),
  setNumber: z.number().min(1),
  weight: z.number().min(0).optional(),
  weightUnit: z.enum(['kg', 'lbs']).optional(),
  reps: z.number().min(0).optional(),
  rpe: z.number().min(1).max(10).optional(),
  isWarmup: z.boolean().optional(),
  notes: z.string().optional(),
});

// POST /api/ppl/session/sets - Log a set
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = logSetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      sessionExerciseId,
      setNumber,
      weight,
      weightUnit,
      reps,
      rpe,
      isWarmup,
      notes,
    } = parsed.data;

    // Verify the session exercise belongs to the user
    const sessionExercise = await db.query.sessionExercises.findFirst({
      where: eq(sessionExercises.id, sessionExerciseId),
      with: {
        session: true,
      },
    });

    if (!sessionExercise || sessionExercise.session.userId !== user.id) {
      return NextResponse.json({ error: 'Session exercise not found' }, { status: 404 });
    }

    // Check if set already exists (update) or needs to be created
    const existingSet = await db.query.sessionSets.findFirst({
      where: and(
        eq(sessionSets.sessionExerciseId, sessionExerciseId),
        eq(sessionSets.setNumber, setNumber)
      ),
    });

    let set;
    if (existingSet) {
      // Update existing set
      [set] = await db
        .update(sessionSets)
        .set({
          weight: weight ? String(weight) : null,
          weightUnit: weightUnit || 'lbs',
          reps,
          rpe: rpe ? String(rpe) : null,
          isWarmup: isWarmup || false,
          notes,
          completedAt: new Date(),
        })
        .where(eq(sessionSets.id, existingSet.id))
        .returning();
    } else {
      // Create new set
      [set] = await db
        .insert(sessionSets)
        .values({
          sessionExerciseId,
          setNumber,
          weight: weight ? String(weight) : null,
          weightUnit: weightUnit || 'lbs',
          reps,
          rpe: rpe ? String(rpe) : null,
          isWarmup: isWarmup || false,
          notes,
          completedAt: new Date(),
        })
        .returning();
    }

    // Check for PR if this is a working set with weight and reps
    let prResult = null;
    if (!isWarmup && weight && reps && weight > 0 && reps > 0) {
      prResult = await checkAndRecordPR(
        user.id,
        sessionExercise.exerciseId,
        weight,
        reps,
        set.id
      );
    }

    return NextResponse.json({
      set,
      pr: prResult?.isNewPR ? prResult : null,
    }, { status: existingSet ? 200 : 201 });
  } catch (error) {
    console.error('Error logging set:', error);
    return NextResponse.json({ error: 'Failed to log set' }, { status: 500 });
  }
}

// DELETE /api/ppl/session/sets - Delete a set
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const setId = searchParams.get('setId');

    if (!setId) {
      return NextResponse.json({ error: 'Set ID required' }, { status: 400 });
    }

    // Get the set and verify ownership
    const set = await db.query.sessionSets.findFirst({
      where: eq(sessionSets.id, setId),
      with: {
        sessionExercise: {
          with: {
            session: true,
          },
        },
      },
    });

    if (!set || set.sessionExercise.session.userId !== user.id) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 });
    }

    await db.delete(sessionSets).where(eq(sessionSets.id, setId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting set:', error);
    return NextResponse.json({ error: 'Failed to delete set' }, { status: 500 });
  }
}
