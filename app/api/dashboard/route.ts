import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  workoutSessions,
  weightEntries,
  streaks,
  programTemplates,
  templateDays,
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

    // Get completed sessions this week (NEW system)
    const weekSessions = await db.query.workoutSessions.findMany({
      where: and(
        eq(workoutSessions.userId, user.id),
        eq(workoutSessions.status, "completed"),
        gte(workoutSessions.completedAt, monday)
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

    // Check if PPL template exists (NEW system)
    const pplTemplate = await db.query.programTemplates.findFirst({
      where: eq(programTemplates.slug, "ppl-recomp-6"),
      with: {
        days: {
          orderBy: (d, { asc }) => [asc(d.dayOrder)],
        },
      },
    });

    // Get today's workout info based on rotation
    let todayWorkout = null;
    let programInfo = null;

    if (pplTemplate) {
      // Get the user's last completed session to determine rotation
      const lastSession = await db.query.workoutSessions.findFirst({
        where: and(
          eq(workoutSessions.userId, user.id),
          eq(workoutSessions.status, "completed")
        ),
        orderBy: [desc(workoutSessions.completedAt)],
        with: {
          templateDay: true,
        },
      });

      // Calculate days since last workout
      let daysSinceLastWorkout = 999;
      if (lastSession?.completedAt) {
        const lastDate = new Date(lastSession.completedAt);
        const today = new Date();
        daysSinceLastWorkout = Math.floor(
          (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      // Determine today's day in rotation
      let todayDayOrder: number;
      if (!lastSession?.templateDay || daysSinceLastWorkout >= 7) {
        todayDayOrder = 1;
      } else {
        const lastDayOrder = lastSession.templateDay.dayOrder;
        todayDayOrder = lastDayOrder >= pplTemplate.daysPerWeek ? 1 : lastDayOrder + 1;
      }

      const todayDay = pplTemplate.days.find((d) => d.dayOrder === todayDayOrder);

      if (todayDay) {
        todayWorkout = {
          name: todayDay.name,
          type: todayDay.dayType,
          isRestDay: false, // PPL doesn't have rest days in rotation
        };
      }

      // Calculate current "week" based on total completed sessions
      const totalSessions = await db.query.workoutSessions.findMany({
        where: and(
          eq(workoutSessions.userId, user.id),
          eq(workoutSessions.status, "completed")
        ),
      });

      const currentWeek = Math.floor(totalSessions.length / pplTemplate.daysPerWeek) + 1;

      programInfo = {
        name: pplTemplate.name,
        week: currentWeek,
        day: todayDayOrder,
      };
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
      workoutsThisWeek: weekSessions.length,
      weekAvgWeight,
      currentWeight: latestWeight ? parseFloat(latestWeight.weight) : null,
      streak: userStreak?.currentStreak || 0,
      hasProgram: !!pplTemplate,
      program: programInfo,
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
