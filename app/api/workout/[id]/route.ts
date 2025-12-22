import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workouts, userPrograms, workoutSets } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const completeWorkoutSchema = z.object({
  notes: z.string().optional(),
});

// PATCH /api/workout/[id] - Update workout (complete, add notes, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    if (action === "complete") {
      // Get workout with sets for summary
      const existingWorkout = await db.query.workouts.findFirst({
        where: and(eq(workouts.id, id), eq(workouts.userId, user.id)),
        with: {
          programDay: true,
          sets: {
            with: {
              exercise: true,
            },
          },
        },
      });

      if (!existingWorkout) {
        return NextResponse.json({ error: "Workout not found" }, { status: 404 });
      }

      // Calculate duration
      const startedAt = existingWorkout.startedAt;
      const completedAt = new Date();
      const durationMin = startedAt
        ? Math.round((completedAt.getTime() - new Date(startedAt).getTime()) / 60000)
        : null;

      // Complete the workout
      const [workout] = await db
        .update(workouts)
        .set({
          status: "completed",
          completedAt,
          durationMin,
          notes: body.notes || null,
        })
        .where(eq(workouts.id, id))
        .returning();

      // Calculate summary stats
      const sets = existingWorkout.sets;
      const totalSets = sets.length;

      // Group by exercise
      const exerciseMap = new Map<string, {
        name: string;
        sets: number;
        topWeight: number;
        topReps: number;
      }>();
      let totalVolume = 0;

      for (const set of sets) {
        const weight = parseFloat(set.weight || "0");
        const reps = set.reps || 0;
        const volume = weight * reps;
        totalVolume += volume;

        const existing = exerciseMap.get(set.exerciseId);
        if (existing) {
          existing.sets += 1;
          // Update top set if this weight is heavier
          if (weight > existing.topWeight) {
            existing.topWeight = weight;
            existing.topReps = reps;
          }
        } else {
          exerciseMap.set(set.exerciseId, {
            name: set.exercise.name,
            sets: 1,
            topWeight: weight,
            topReps: reps,
          });
        }
      }

      const exercises = Array.from(exerciseMap.values());

      // Advance to next day in program
      const activeProgram = await db.query.userPrograms.findFirst({
        where: and(
          eq(userPrograms.userId, user.id),
          eq(userPrograms.status, "active")
        ),
        with: {
          program: true,
        },
      });

      if (activeProgram) {
        const currentDay = activeProgram.currentDay || 1;
        const daysPerWeek = activeProgram.program.daysPerWeek;

        let nextDay = currentDay + 1;
        let nextWeek = activeProgram.currentWeek || 1;

        if (nextDay > daysPerWeek) {
          nextDay = 1;
          nextWeek += 1;
        }

        await db
          .update(userPrograms)
          .set({
            currentDay: nextDay,
            currentWeek: nextWeek,
          })
          .where(eq(userPrograms.id, activeProgram.id));
      }

      return NextResponse.json({
        workout,
        summary: {
          name: existingWorkout.programDay?.name || "Workout",
          durationMin,
          totalSets,
          totalVolume: Math.round(totalVolume),
          exerciseCount: exercises.length,
          exercises,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json(
      { error: "Failed to update workout" },
      { status: 500 }
    );
  }
}
