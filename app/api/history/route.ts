import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workouts, workoutSets, programDays } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc, and, gte } from "drizzle-orm";

// GET /api/history - Get workout history
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get days query param (default 30)
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completedWorkouts = await db.query.workouts.findMany({
      where: and(
        eq(workouts.userId, user.id),
        eq(workouts.status, "completed"),
        gte(workouts.completedAt, startDate)
      ),
      orderBy: [desc(workouts.completedAt)],
      with: {
        programDay: true,
        sets: {
          with: {
            exercise: true,
          },
        },
      },
    });

    // Calculate stats for each workout
    const history = completedWorkouts.map((workout) => {
      // Group sets by exercise
      const exerciseMap = new Map<string, { name: string; sets: typeof workout.sets }>();

      for (const set of workout.sets) {
        const existing = exerciseMap.get(set.exerciseId);
        if (existing) {
          existing.sets.push(set);
        } else {
          exerciseMap.set(set.exerciseId, {
            name: set.exercise.name,
            sets: [set],
          });
        }
      }

      const exercises = Array.from(exerciseMap.values()).map((e) => ({
        name: e.name,
        sets: e.sets.length,
        topSet: e.sets.reduce((best, set) => {
          const weight = parseFloat(set.weight || "0");
          const bestWeight = parseFloat(best?.weight || "0");
          return weight > bestWeight ? set : best;
        }, e.sets[0]),
      }));

      return {
        id: workout.id,
        name: workout.programDay?.name || "Workout",
        type: workout.programDay?.workoutType,
        date: workout.completedAt,
        duration: workout.durationMin,
        totalSets: workout.sets.length,
        totalExercises: exerciseMap.size,
        exercises,
      };
    });

    // Calculate summary stats
    const totalWorkouts = history.length;
    const totalSets = history.reduce((sum, w) => sum + w.totalSets, 0);
    const avgDuration = history.length
      ? Math.round(history.reduce((sum, w) => sum + (w.duration || 0), 0) / history.length)
      : 0;

    return NextResponse.json({
      workouts: history,
      stats: {
        totalWorkouts,
        totalSets,
        avgDuration,
        days,
      },
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
