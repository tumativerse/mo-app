import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  workoutSessions,
  sessionExercises,
  sessionSets,
  templateSlots,
  exercises,
  userExerciseDefaults,
  userPreferences,
} from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

// Schema for starting a session
const startSessionSchema = z.object({
  templateDayId: z.string().uuid(),
  equipmentLevel: z.enum(['full_gym', 'home_gym', 'bodyweight']),
  exercises: z.array(
    z.object({
      slotId: z.string().uuid(),
      exerciseId: z.string().uuid(),
      targetSets: z.number().min(1),
      targetRepMin: z.number().min(1),
      targetRepMax: z.number().min(1),
      targetRpe: z.number().min(1).max(10).optional(),
    })
  ),
});

// POST /api/ppl/session - Start a new workout session
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = startSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { templateDayId, equipmentLevel, exercises: exercisesList } = parsed.data;

    // Create the session
    const [session] = await db
      .insert(workoutSessions)
      .values({
        userId: user.id,
        templateDayId,
        date: new Date(),
        equipmentLevel,
        status: 'in_progress',
        startedAt: new Date(),
      })
      .returning();

    // Create session exercises
    const sessionExerciseValues = exercisesList.map((ex, index) => ({
      sessionId: session.id,
      slotId: ex.slotId,
      exerciseId: ex.exerciseId,
      exerciseOrder: index + 1,
      targetSets: ex.targetSets,
      targetRepMin: ex.targetRepMin,
      targetRepMax: ex.targetRepMax,
      targetRpe: ex.targetRpe ? String(ex.targetRpe) : null,
    }));

    await db.insert(sessionExercises).values(sessionExerciseValues);

    // Fetch the created session with exercises
    const createdSession = await db.query.workoutSessions.findFirst({
      where: eq(workoutSessions.id, session.id),
      with: {
        exercises: {
          orderBy: (e, { asc }) => [asc(e.exerciseOrder)],
          with: {
            exercise: true,
          },
        },
        templateDay: true,
      },
    });

    return NextResponse.json({ session: createdSession }, { status: 201 });
  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}

// Schema for completing a session
const completeSessionSchema = z.object({
  sessionId: z.string().uuid(),
  notes: z.string().optional(),
});

// PATCH /api/ppl/session - Complete a workout session
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = completeSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, notes } = parsed.data;

    // Verify session belongs to user
    const session = await db.query.workoutSessions.findFirst({
      where: and(
        eq(workoutSessions.id, sessionId),
        eq(workoutSessions.userId, user.id)
      ),
      with: {
        exercises: {
          with: {
            sets: true,
            exercise: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Calculate session metrics
    let totalSets = 0;
    let totalVolume = 0;
    let totalRpe = 0;
    let rpeCount = 0;

    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (!set.isWarmup) {
          totalSets++;
          if (set.weight && set.reps) {
            totalVolume += Number(set.weight) * set.reps;
          }
          if (set.rpe) {
            totalRpe += Number(set.rpe);
            rpeCount++;
          }
        }
      }
    }

    const avgRpe = rpeCount > 0 ? totalRpe / rpeCount : null;
    const durationMinutes = session.startedAt
      ? Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000)
      : null;

    // Update session
    const [updatedSession] = await db
      .update(workoutSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
        durationMinutes,
        totalSets,
        totalVolume: String(totalVolume),
        avgRpe: avgRpe ? String(avgRpe.toFixed(1)) : null,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(workoutSessions.id, sessionId))
      .returning();

    // Update user exercise defaults with last used weights
    for (const ex of session.exercises) {
      const lastSet = ex.sets.filter((s) => !s.isWarmup).pop();
      if (lastSet && lastSet.weight) {
        await db
          .insert(userExerciseDefaults)
          .values({
            userId: user.id,
            exerciseId: ex.exerciseId,
            lastWeight: lastSet.weight,
            lastReps: lastSet.reps,
            lastRpe: lastSet.rpe,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [userExerciseDefaults.userId, userExerciseDefaults.exerciseId],
            set: {
              lastWeight: lastSet.weight,
              lastReps: lastSet.reps,
              lastRpe: lastSet.rpe,
              updatedAt: new Date(),
            },
          });
      }
    }

    return NextResponse.json({
      session: updatedSession,
      metrics: {
        totalSets,
        totalVolume,
        avgRpe,
        durationMinutes,
      },
    });
  } catch (error) {
    console.error('Error completing session:', error);
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
  }
}
