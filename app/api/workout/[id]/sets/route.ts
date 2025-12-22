import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workoutSets, workouts, userExerciseDefaults } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/mo-self";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const logSetSchema = z.object({
  exerciseId: z.string().uuid(),
  setNumber: z.number().int().positive(),
  weight: z.number().positive().optional(),
  reps: z.number().int().positive().optional(),
  rpe: z.number().min(1).max(10).optional(),
  isWarmup: z.boolean().optional(),
});

// POST /api/workout/[id]/sets - Log a set
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: workoutId } = await params;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify workout belongs to user
    const workout = await db.query.workouts.findFirst({
      where: and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)),
    });

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = logSetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { exerciseId, setNumber, weight, reps, rpe, isWarmup } = parsed.data;

    // Check if set already exists (upsert)
    const existingSet = await db.query.workoutSets.findFirst({
      where: and(
        eq(workoutSets.workoutId, workoutId),
        eq(workoutSets.exerciseId, exerciseId),
        eq(workoutSets.setNumber, setNumber)
      ),
    });

    let set;
    if (existingSet) {
      [set] = await db
        .update(workoutSets)
        .set({
          weight: weight?.toString() || null,
          reps: reps || null,
          rpe: rpe?.toString() || null,
          isWarmup: isWarmup || false,
          completedAt: new Date(),
        })
        .where(eq(workoutSets.id, existingSet.id))
        .returning();
    } else {
      [set] = await db
        .insert(workoutSets)
        .values({
          workoutId,
          exerciseId,
          setNumber,
          weight: weight?.toString() || null,
          reps: reps || null,
          rpe: rpe?.toString() || null,
          isWarmup: isWarmup || false,
          completedAt: new Date(),
        })
        .returning();
    }

    // Update user's exercise defaults for quick logging next time
    if (weight && reps) {
      const existingDefault = await db.query.userExerciseDefaults.findFirst({
        where: and(
          eq(userExerciseDefaults.userId, user.id),
          eq(userExerciseDefaults.exerciseId, exerciseId)
        ),
      });

      if (existingDefault) {
        await db
          .update(userExerciseDefaults)
          .set({
            lastWeight: weight.toString(),
            lastReps: reps,
            lastRpe: rpe?.toString() || null,
            updatedAt: new Date(),
          })
          .where(eq(userExerciseDefaults.id, existingDefault.id));
      } else {
        await db.insert(userExerciseDefaults).values({
          userId: user.id,
          exerciseId,
          lastWeight: weight.toString(),
          lastReps: reps,
          lastRpe: rpe?.toString() || null,
        });
      }
    }

    return NextResponse.json({ set }, { status: existingSet ? 200 : 201 });
  } catch (error) {
    console.error("Error logging set:", error);
    return NextResponse.json(
      { error: "Failed to log set" },
      { status: 500 }
    );
  }
}

// GET /api/workout/[id]/sets - Get all sets for a workout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: workoutId } = await params;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sets = await db.query.workoutSets.findMany({
      where: eq(workoutSets.workoutId, workoutId),
      with: {
        exercise: true,
      },
    });

    return NextResponse.json({ sets });
  } catch (error) {
    console.error("Error fetching sets:", error);
    return NextResponse.json(
      { error: "Failed to fetch sets" },
      { status: 500 }
    );
  }
}
