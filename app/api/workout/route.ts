import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  userPrograms,
  programDays,
  programExercises,
  programs,
  exercises,
  workouts,
  workoutSets,
  userExerciseDefaults,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/mo-self";
import { eq, and, desc, inArray } from "drizzle-orm";
import { z } from "zod";

// GET /api/workout - Get today's workout for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's active program
    const activeProgram = await db.query.userPrograms.findFirst({
      where: and(
        eq(userPrograms.userId, user.id),
        eq(userPrograms.status, "active")
      ),
      with: {
        program: true,
      },
    });

    if (!activeProgram) {
      return NextResponse.json({
        hasProgram: false,
        message: "No active program. Enroll in a program to start.",
      });
    }

    // Get today's program day based on current day
    const todayProgramDay = await db.query.programDays.findFirst({
      where: and(
        eq(programDays.programId, activeProgram.programId),
        eq(programDays.dayNumber, activeProgram.currentDay || 1)
      ),
      with: {
        exercises: {
          orderBy: (pe, { asc }) => [asc(pe.order)],
          with: {
            exercise: true,
          },
        },
      },
    });

    if (!todayProgramDay) {
      return NextResponse.json({
        hasProgram: true,
        isRestDay: true,
        program: activeProgram.program,
        currentDay: activeProgram.currentDay,
        currentWeek: activeProgram.currentWeek,
      });
    }

    // Check if there's an existing workout for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingWorkout = await db.query.workouts.findFirst({
      where: and(
        eq(workouts.userId, user.id),
        eq(workouts.programDayId, todayProgramDay.id)
      ),
      orderBy: [desc(workouts.createdAt)],
      with: {
        sets: {
          with: {
            exercise: true,
          },
        },
      },
    });

    // Get previous performance for each exercise
    const exerciseIds = todayProgramDay.exercises.map((pe) => pe.exercise.id);

    const previousDefaults = exerciseIds.length > 0
      ? await db.query.userExerciseDefaults.findMany({
          where: and(
            eq(userExerciseDefaults.userId, user.id),
            inArray(userExerciseDefaults.exerciseId, exerciseIds)
          ),
        })
      : [];

    // Create a map for quick lookup
    const previousMap = new Map(
      previousDefaults.map((d) => [d.exerciseId, {
        weight: d.lastWeight,
        reps: d.lastReps,
      }])
    );

    return NextResponse.json({
      hasProgram: true,
      isRestDay: todayProgramDay.isRestDay,
      program: {
        id: activeProgram.program.id,
        name: activeProgram.program.name,
        week: activeProgram.currentWeek,
        day: activeProgram.currentDay,
      },
      today: {
        id: todayProgramDay.id,
        name: todayProgramDay.name,
        type: todayProgramDay.workoutType,
        exercises: todayProgramDay.exercises.map((pe) => ({
          id: pe.id,
          exerciseId: pe.exercise.id,
          name: pe.exercise.name,
          category: pe.exercise.category,
          sets: pe.sets,
          repsMin: pe.repsMin,
          repsMax: pe.repsMax,
          restSeconds: pe.restSeconds || (pe.exercise.category === 'compound' ? 120 : 90),
          notes: pe.notes,
          previous: previousMap.get(pe.exercise.id) || null,
        })),
      },
      workout: existingWorkout
        ? {
            id: existingWorkout.id,
            status: existingWorkout.status,
            startedAt: existingWorkout.startedAt,
            completedAt: existingWorkout.completedAt,
            sets: existingWorkout.sets,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching workout:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout" },
      { status: 500 }
    );
  }
}

const startWorkoutSchema = z.object({
  programDayId: z.string().uuid(),
});

// POST /api/workout - Start a new workout
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = startWorkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { programDayId } = parsed.data;

    // Create new workout
    const [workout] = await db
      .insert(workouts)
      .values({
        userId: user.id,
        programDayId,
        date: new Date(),
        status: "in_progress",
        startedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ workout }, { status: 201 });
  } catch (error) {
    console.error("Error starting workout:", error);
    return NextResponse.json(
      { error: "Failed to start workout" },
      { status: 500 }
    );
  }
}
