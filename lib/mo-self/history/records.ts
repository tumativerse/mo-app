/**
 * MoRecords - "The Historian"
 * Part of MO:SELF / MoHistory
 *
 * "I remember your best performances"
 *
 * Tracks personal records (PRs) for each exercise.
 * Automatically detects new PRs when sets are logged.
 */

import { db } from '@/lib/db';
import { personalRecords, exercises } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  achievedAt: Date;
  isNew?: boolean;
}

export interface PRCheckResult {
  isNewPR: boolean;
  prType: 'weight' | 'reps' | 'estimated1rm' | null;
  newRecord: PersonalRecord | null;
  previousRecord: PersonalRecord | null;
  improvement: {
    weight?: number;
    reps?: number;
    estimated1RM?: number;
  } | null;
}

/**
 * Calculate estimated 1RM using Brzycki formula
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 12) return weight * (1 + reps / 30); // Modified for higher reps
  return weight * (36 / (37 - reps));
}

/**
 * Check if a set is a new PR and record it if so
 */
export async function checkAndRecordPR(
  userId: string,
  exerciseId: string,
  weight: number,
  reps: number,
  setId?: string
): Promise<PRCheckResult> {
  // Get current PR for this exercise
  const currentPR = await db.query.personalRecords.findFirst({
    where: and(eq(personalRecords.userId, userId), eq(personalRecords.exerciseId, exerciseId)),
    orderBy: [desc(personalRecords.estimated1RM)],
  });

  const newEstimated1RM = calculateEstimated1RM(weight, reps);
  const currentEstimated1RM = currentPR ? Number.parseFloat(currentPR.estimated1RM || '0') : 0;

  // Check if this is a new PR (based on estimated 1RM)
  const isNewPR = newEstimated1RM > currentEstimated1RM;

  if (!isNewPR) {
    return {
      isNewPR: false,
      prType: null,
      newRecord: null,
      previousRecord: currentPR
        ? {
            id: currentPR.id,
            exerciseId: currentPR.exerciseId,
            exerciseName: '',
            weight: Number.parseFloat(currentPR.weight),
            reps: currentPR.reps,
            estimated1RM: currentEstimated1RM,
            achievedAt: new Date(currentPR.achievedAt),
          }
        : null,
      improvement: null,
    };
  }

  // Get exercise name
  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
  });

  // Record the new PR
  const [newPR] = await db
    .insert(personalRecords)
    .values({
      userId,
      exerciseId,
      weight: String(weight),
      reps,
      estimated1RM: String(newEstimated1RM.toFixed(2)),
      achievedAt: new Date(),
      workoutSetId: setId || null,
    })
    .returning();

  // Determine PR type
  let prType: PRCheckResult['prType'] = 'estimated1rm';
  if (currentPR) {
    const currentWeight = Number.parseFloat(currentPR.weight);
    if (weight > currentWeight) {
      prType = 'weight';
    } else if (reps > currentPR.reps && weight >= currentWeight) {
      prType = 'reps';
    }
  }

  const newRecord: PersonalRecord = {
    id: newPR.id,
    exerciseId: newPR.exerciseId,
    exerciseName: exercise?.name || '',
    weight,
    reps,
    estimated1RM: newEstimated1RM,
    achievedAt: new Date(newPR.achievedAt),
    isNew: true,
  };

  return {
    isNewPR: true,
    prType,
    newRecord,
    previousRecord: currentPR
      ? {
          id: currentPR.id,
          exerciseId: currentPR.exerciseId,
          exerciseName: exercise?.name || '',
          weight: Number.parseFloat(currentPR.weight),
          reps: currentPR.reps,
          estimated1RM: currentEstimated1RM,
          achievedAt: new Date(currentPR.achievedAt),
        }
      : null,
    improvement: currentPR
      ? {
          weight: weight - Number.parseFloat(currentPR.weight),
          reps: reps - currentPR.reps,
          estimated1RM: newEstimated1RM - currentEstimated1RM,
        }
      : null,
  };
}

/**
 * Get all PRs for a user
 */
export async function getAllPRs(userId: string): Promise<PersonalRecord[]> {
  const records = await db.query.personalRecords.findMany({
    where: eq(personalRecords.userId, userId),
    orderBy: [desc(personalRecords.achievedAt)],
  });

  // Get unique exercise IDs
  const exerciseIds = [...new Set(records.map((r) => r.exerciseId))];

  // Get exercise names
  const exerciseList =
    exerciseIds.length > 0
      ? await db.query.exercises.findMany({
          where: (ex, { inArray }) => inArray(ex.id, exerciseIds),
        })
      : [];

  const exerciseMap = new Map(exerciseList.map((e) => [e.id, e.name]));

  // Get best PR per exercise (by estimated 1RM)
  const bestPRs = new Map<string, (typeof records)[0]>();
  for (const record of records) {
    const existing = bestPRs.get(record.exerciseId);
    if (
      !existing ||
      Number.parseFloat(record.estimated1RM || '0') >
        Number.parseFloat(existing.estimated1RM || '0')
    ) {
      bestPRs.set(record.exerciseId, record);
    }
  }

  return Array.from(bestPRs.values()).map((r) => ({
    id: r.id,
    exerciseId: r.exerciseId,
    exerciseName: exerciseMap.get(r.exerciseId) || '',
    weight: Number.parseFloat(r.weight),
    reps: r.reps,
    estimated1RM: Number.parseFloat(r.estimated1RM || '0'),
    achievedAt: new Date(r.achievedAt),
  }));
}

/**
 * Get PRs for a specific exercise
 */
export async function getExercisePRHistory(
  userId: string,
  exerciseId: string
): Promise<PersonalRecord[]> {
  const records = await db.query.personalRecords.findMany({
    where: and(eq(personalRecords.userId, userId), eq(personalRecords.exerciseId, exerciseId)),
    orderBy: [desc(personalRecords.achievedAt)],
  });

  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
  });

  return records.map((r) => ({
    id: r.id,
    exerciseId: r.exerciseId,
    exerciseName: exercise?.name || '',
    weight: Number.parseFloat(r.weight),
    reps: r.reps,
    estimated1RM: Number.parseFloat(r.estimated1RM || '0'),
    achievedAt: new Date(r.achievedAt),
  }));
}

/**
 * Get current PR for an exercise
 */
export async function getCurrentPR(
  userId: string,
  exerciseId: string
): Promise<PersonalRecord | null> {
  const record = await db.query.personalRecords.findFirst({
    where: and(eq(personalRecords.userId, userId), eq(personalRecords.exerciseId, exerciseId)),
    orderBy: [desc(personalRecords.estimated1RM)],
  });

  if (!record) return null;

  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
  });

  return {
    id: record.id,
    exerciseId: record.exerciseId,
    exerciseName: exercise?.name || '',
    weight: Number.parseFloat(record.weight),
    reps: record.reps,
    estimated1RM: Number.parseFloat(record.estimated1RM || '0'),
    achievedAt: new Date(record.achievedAt),
  };
}

/**
 * Get recent PRs (for dashboard/celebration)
 */
export async function getRecentPRs(userId: string, days: number = 7): Promise<PersonalRecord[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const records = await db.query.personalRecords.findMany({
    where: and(eq(personalRecords.userId, userId)),
    orderBy: [desc(personalRecords.achievedAt)],
  });

  // Filter by date in JS (drizzle gte on timestamp can be tricky)
  const recentRecords = records.filter((r) => new Date(r.achievedAt) >= cutoffDate);

  const exerciseIds = [...new Set(recentRecords.map((r) => r.exerciseId))];
  const exerciseList =
    exerciseIds.length > 0
      ? await db.query.exercises.findMany({
          where: (ex, { inArray }) => inArray(ex.id, exerciseIds),
        })
      : [];

  const exerciseMap = new Map(exerciseList.map((e) => [e.id, e.name]));

  return recentRecords.map((r) => ({
    id: r.id,
    exerciseId: r.exerciseId,
    exerciseName: exerciseMap.get(r.exerciseId) || '',
    weight: Number.parseFloat(r.weight),
    reps: r.reps,
    estimated1RM: Number.parseFloat(r.estimated1RM || '0'),
    achievedAt: new Date(r.achievedAt),
  }));
}
