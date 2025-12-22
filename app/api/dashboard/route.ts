import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  workouts,
  weightEntries,
  streaks,
  userPrograms,
  programDays,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/mo-self";
import { eq, and, gte, desc } from "drizzle-orm";

// GET /api/dashboard - Get dashboard stats
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get this week's date range (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    // Get workouts this week
    const weekWorkouts = await db.query.workouts.findMany({
      where: and(
        eq(workouts.userId, user.id),
        eq(workouts.status, "completed"),
        gte(workouts.completedAt, monday)
      ),
    });

    // Get weight entries this week
    const weekWeights = await db.query.weightEntries.findMany({
      where: and(eq(weightEntries.userId, user.id), gte(weightEntries.date, monday)),
      orderBy: [desc(weightEntries.date)],
    });

    // Get latest weight entry
    const latestWeight = await db.query.weightEntries.findFirst({
      where: eq(weightEntries.userId, user.id),
      orderBy: [desc(weightEntries.date)],
    });

    // Get user's streak
    const userStreak = await db.query.streaks.findFirst({
      where: eq(streaks.userId, user.id),
    });

    // Get active program
    const activeProgram = await db.query.userPrograms.findFirst({
      where: and(
        eq(userPrograms.userId, user.id),
        eq(userPrograms.status, "active")
      ),
      with: {
        program: true,
      },
    });

    // Get today's workout info
    let todayWorkout = null;
    if (activeProgram) {
      const todayProgramDay = await db.query.programDays.findFirst({
        where: and(
          eq(programDays.programId, activeProgram.programId),
          eq(programDays.dayNumber, activeProgram.currentDay || 1)
        ),
      });

      if (todayProgramDay) {
        todayWorkout = {
          name: todayProgramDay.name,
          type: todayProgramDay.workoutType,
          isRestDay: todayProgramDay.isRestDay,
        };
      }
    }

    // Calculate week average weight
    const weekAvgWeight =
      weekWeights.length > 0
        ? Math.round(
            (weekWeights.reduce((acc, w) => acc + parseFloat(w.weight), 0) /
              weekWeights.length) *
              10
          ) / 10
        : null;

    return NextResponse.json({
      workoutsThisWeek: weekWorkouts.length,
      weekAvgWeight,
      currentWeight: latestWeight ? parseFloat(latestWeight.weight) : null,
      streak: userStreak?.currentStreak || 0,
      hasProgram: !!activeProgram,
      program: activeProgram?.program
        ? {
            name: activeProgram.program.name,
            week: activeProgram.currentWeek,
            day: activeProgram.currentDay,
          }
        : null,
      todayWorkout,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
