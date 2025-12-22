/**
 * MoStreaks - "The Motivator"
 * Part of MO:SELF / MoHistory
 *
 * "I celebrate your consistency"
 *
 * Tracks workout streaks and celebrates consistency.
 * A streak is maintained by working out at least once every 48 hours.
 */

import { db } from "@/lib/db";
import { streaks, workoutSessions, workouts } from "@/lib/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: Date | null;
  isStreakActive: boolean;
  streakStatus: "on_fire" | "active" | "at_risk" | "broken";
  hoursUntilBreak: number | null;
  message: string;
}

/**
 * Get current streak data for a user
 */
export async function getStreak(userId: string): Promise<StreakData> {
  // Get or create streak record
  let streak = await db.query.streaks.findFirst({
    where: eq(streaks.userId, userId),
  });

  if (!streak) {
    // Create initial streak record
    [streak] = await db
      .insert(streaks)
      .values({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
      })
      .returning();
  }

  const now = new Date();
  const lastWorkout = streak.lastWorkoutDate
    ? new Date(streak.lastWorkoutDate)
    : null;

  // Calculate if streak is still active (within 48 hours)
  let isStreakActive = false;
  let hoursUntilBreak: number | null = null;
  let streakStatus: StreakData["streakStatus"] = "broken";

  if (lastWorkout) {
    const hoursSinceLastWorkout =
      (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);
    hoursUntilBreak = Math.max(0, 48 - hoursSinceLastWorkout);

    if (hoursSinceLastWorkout <= 48) {
      isStreakActive = true;
      if (hoursSinceLastWorkout <= 24) {
        streakStatus = streak.currentStreak! >= 7 ? "on_fire" : "active";
      } else {
        streakStatus = "at_risk";
      }
    } else {
      streakStatus = "broken";
      // Reset streak if broken
      if (streak.currentStreak! > 0) {
        await db
          .update(streaks)
          .set({ currentStreak: 0 })
          .where(eq(streaks.id, streak.id));
        streak.currentStreak = 0;
      }
    }
  }

  // Generate motivational message
  const message = getStreakMessage(
    streak.currentStreak!,
    streakStatus,
    hoursUntilBreak
  );

  return {
    currentStreak: streak.currentStreak!,
    longestStreak: streak.longestStreak!,
    lastWorkoutDate: lastWorkout,
    isStreakActive,
    streakStatus,
    hoursUntilBreak,
    message,
  };
}

/**
 * Update streak when a workout is completed
 * Called automatically when a workout session is completed
 */
export async function updateStreakOnWorkout(userId: string): Promise<StreakData> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get current streak
  let streak = await db.query.streaks.findFirst({
    where: eq(streaks.userId, userId),
  });

  if (!streak) {
    // First workout ever - create streak
    [streak] = await db
      .insert(streaks)
      .values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastWorkoutDate: now,
      })
      .returning();
  } else {
    const lastWorkout = streak.lastWorkoutDate
      ? new Date(streak.lastWorkoutDate)
      : null;

    let newStreak = streak.currentStreak!;

    if (!lastWorkout) {
      // First workout
      newStreak = 1;
    } else {
      const lastWorkoutDate = new Date(
        lastWorkout.getFullYear(),
        lastWorkout.getMonth(),
        lastWorkout.getDate()
      );
      const hoursSinceLastWorkout =
        (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);

      // Same day - don't increment
      if (lastWorkoutDate.getTime() === today.getTime()) {
        // Just update the timestamp
      } else if (hoursSinceLastWorkout <= 48) {
        // Within 48 hours - increment streak
        newStreak = streak.currentStreak! + 1;
      } else {
        // Streak broken, start fresh
        newStreak = 1;
      }
    }

    const newLongest = Math.max(streak.longestStreak!, newStreak);

    [streak] = await db
      .update(streaks)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastWorkoutDate: now,
        updatedAt: now,
      })
      .where(eq(streaks.id, streak.id))
      .returning();
  }

  return getStreak(userId);
}

/**
 * Get motivational message based on streak status
 */
function getStreakMessage(
  currentStreak: number,
  status: StreakData["streakStatus"],
  hoursUntilBreak: number | null
): string {
  if (status === "broken") {
    return "Time to start a new streak! Every journey begins with a single workout.";
  }

  if (status === "at_risk" && hoursUntilBreak !== null) {
    const hours = Math.floor(hoursUntilBreak);
    return `Your streak is at risk! ${hours} hours left to keep it alive.`;
  }

  // Milestone messages
  if (currentStreak === 1) {
    return "Great start! Keep it going tomorrow.";
  } else if (currentStreak === 3) {
    return "3 days strong! You're building momentum.";
  } else if (currentStreak === 7) {
    return "One week streak! You're officially on fire!";
  } else if (currentStreak === 14) {
    return "Two weeks! Consistency is becoming a habit.";
  } else if (currentStreak === 30) {
    return "30 days! You're unstoppable!";
  } else if (currentStreak === 50) {
    return "50 days! Elite consistency.";
  } else if (currentStreak === 100) {
    return "100 DAYS! Legendary dedication!";
  } else if (currentStreak >= 7) {
    return `${currentStreak} day streak! Keep the fire burning!`;
  } else {
    return `${currentStreak} day streak! Building momentum.`;
  }
}

/**
 * Get streak history/stats
 */
export async function getStreakStats(userId: string): Promise<{
  current: number;
  longest: number;
  totalWorkouts: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
}> {
  const streak = await getStreak(userId);

  // Count total workouts (from both workout tables)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  // Get from workoutSessions (PPL system)
  const [sessionsThisWeek, sessionsThisMonth, totalSessions] = await Promise.all([
    db.query.workoutSessions.findMany({
      where: and(
        eq(workoutSessions.userId, userId),
        eq(workoutSessions.status, "completed"),
        gte(workoutSessions.completedAt, oneWeekAgo)
      ),
    }),
    db.query.workoutSessions.findMany({
      where: and(
        eq(workoutSessions.userId, userId),
        eq(workoutSessions.status, "completed"),
        gte(workoutSessions.completedAt, oneMonthAgo)
      ),
    }),
    db.query.workoutSessions.findMany({
      where: and(
        eq(workoutSessions.userId, userId),
        eq(workoutSessions.status, "completed")
      ),
    }),
  ]);

  // Also count from legacy workouts table
  const [legacyThisWeek, legacyThisMonth, legacyTotal] = await Promise.all([
    db.query.workouts.findMany({
      where: and(
        eq(workouts.userId, userId),
        eq(workouts.status, "completed"),
        gte(workouts.completedAt, oneWeekAgo)
      ),
    }),
    db.query.workouts.findMany({
      where: and(
        eq(workouts.userId, userId),
        eq(workouts.status, "completed"),
        gte(workouts.completedAt, oneMonthAgo)
      ),
    }),
    db.query.workouts.findMany({
      where: and(
        eq(workouts.userId, userId),
        eq(workouts.status, "completed")
      ),
    }),
  ]);

  return {
    current: streak.currentStreak,
    longest: streak.longestStreak,
    totalWorkouts: totalSessions.length + legacyTotal.length,
    workoutsThisWeek: sessionsThisWeek.length + legacyThisWeek.length,
    workoutsThisMonth: sessionsThisMonth.length + legacyThisMonth.length,
  };
}
