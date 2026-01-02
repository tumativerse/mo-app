/**
 * MoProgress - "The Challenger"
 * Part of MO:COACH / MoAdapt
 *
 * "I push you when you're ready"
 *
 * Manages progression gates, readiness checks, and plateau detection.
 * Different rules for compound vs isolation exercises.
 */

import { db } from '@/lib/db';
import { exercises, sessionExercises, workoutSessions } from '@/lib/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { calculateFatigue } from './fatigue';

// ============================================
// TYPES
// ============================================

export interface ProgressionGate {
  canProgress: boolean;
  reason: string;
  suggestedAction: string;
  blockedBy?: 'fatigue' | 'performance' | 'recovery' | 'rpe';
}

export interface ProgressionRecommendation {
  status: 'ready' | 'maintain' | 'plateau' | 'regress';
  currentWeight: number;
  suggestedWeight: number;
  message: string;
  sessionsAtWeight: number;
}

export interface ExercisePerformance {
  exerciseId: string;
  exerciseName: string;
  sessionDate: Date;
  weight: number;
  reps: number;
  rpe: number;
  sets: number;
}

export interface ProgressionRule {
  exerciseType: 'compound' | 'isolation';
  minRepsForProgress: number;
  maxRpeForProgress: number;
  weightIncrement: number; // lbs
  sessionsRequired: number; // consecutive sessions hitting target
}

// ============================================
// PROGRESSION RULES
// ============================================

const PROGRESSION_RULES: Record<string, ProgressionRule> = {
  compound: {
    exerciseType: 'compound',
    minRepsForProgress: 8,
    maxRpeForProgress: 8,
    weightIncrement: 5,
    sessionsRequired: 2,
  },
  isolation: {
    exerciseType: 'isolation',
    minRepsForProgress: 10,
    maxRpeForProgress: 7,
    weightIncrement: 2.5,
    sessionsRequired: 1,
  },
};

const PLATEAU_STRATEGIES = [
  {
    strategy: 'rep_range_shift',
    description: 'Try 6-8 reps instead of 8-12 to build strength',
    duration: '2-3 weeks',
  },
  {
    strategy: 'variation_swap',
    description: 'Switch to a similar exercise (e.g., incline instead of flat)',
    duration: '4 weeks',
  },
  {
    strategy: 'volume_increase',
    description: 'Add 1-2 sets per session for this exercise',
    duration: '2 weeks',
  },
  {
    strategy: 'deload_then_push',
    description: 'Take a deload week, then come back at 90% and rebuild',
    duration: '2 weeks',
  },
];

// ============================================
// PROGRESSION GATES
// ============================================

/**
 * Check if user can progress on an exercise
 * Returns gates that must pass before progression is allowed
 */
export async function checkProgressionGates(
  userId: string,
  exerciseId: string
): Promise<ProgressionGate> {
  // Get fatigue data
  const fatigueResult = await calculateFatigue(userId);

  // Gate 1: Fatigue score
  if (fatigueResult.score >= 7) {
    return {
      canProgress: false,
      reason: 'High fatigue detected',
      suggestedAction: 'Maintain current weight or reduce slightly',
      blockedBy: 'fatigue',
    };
  }

  // Gate 2: Recent performance
  const recentPerformance = await getExercisePerformance(userId, exerciseId, 3);

  if (recentPerformance.length === 0) {
    return {
      canProgress: true,
      reason: 'No history - start conservatively',
      suggestedAction: 'Begin with moderate weight and assess',
    };
  }

  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
  });

  const isCompound = exercise?.category === 'compound';
  const rule = PROGRESSION_RULES[isCompound ? 'compound' : 'isolation'];

  // Check if hit target reps in recent sessions
  const hitAllReps = recentPerformance.every((p) => p.reps >= rule.minRepsForProgress);
  if (!hitAllReps) {
    return {
      canProgress: false,
      reason: `Didn't hit target reps (${rule.minRepsForProgress}+) in recent sessions`,
      suggestedAction: 'Keep weight until you hit all reps',
      blockedBy: 'performance',
    };
  }

  // Check average RPE
  const avgRpe = recentPerformance.reduce((sum, p) => sum + p.rpe, 0) / recentPerformance.length;
  if (avgRpe > rule.maxRpeForProgress + 0.5) {
    return {
      canProgress: false,
      reason: `RPE too high (${avgRpe.toFixed(1)} avg) - need more margin`,
      suggestedAction: `Get RPE under ${rule.maxRpeForProgress} before adding weight`,
      blockedBy: 'rpe',
    };
  }

  // Gate 3: Check recovery trend
  if (fatigueResult.factors.recoveryDebt >= 2) {
    return {
      canProgress: false,
      reason: 'Recovery metrics suboptimal',
      suggestedAction: 'Focus on recovery before progressing',
      blockedBy: 'recovery',
    };
  }

  // All gates passed
  return {
    canProgress: true,
    reason: 'Ready to progress',
    suggestedAction: `Add ${rule.weightIncrement} lbs next session`,
  };
}

/**
 * Get progression recommendation for an exercise
 */
export async function getProgressionRecommendation(
  userId: string,
  exerciseId: string
): Promise<ProgressionRecommendation> {
  const performance = await getExercisePerformance(userId, exerciseId, 5);

  if (performance.length === 0) {
    return {
      status: 'maintain',
      currentWeight: 0,
      suggestedWeight: 0,
      message: 'No history for this exercise',
      sessionsAtWeight: 0,
    };
  }

  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
  });

  const isCompound = exercise?.category === 'compound';
  const rule = PROGRESSION_RULES[isCompound ? 'compound' : 'isolation'];
  const currentWeight = performance[0].weight;

  // Count sessions at current weight
  const sessionsAtWeight = performance.filter((p) => p.weight === currentWeight).length;

  // Check for plateau (4+ sessions at same weight)
  if (sessionsAtWeight >= 4) {
    return {
      status: 'plateau',
      currentWeight,
      suggestedWeight: currentWeight,
      message: `Plateaued at ${currentWeight} lbs for ${sessionsAtWeight} sessions`,
      sessionsAtWeight,
    };
  }

  // Check if ready to progress
  const qualifyingSessions = performance
    .slice(0, rule.sessionsRequired)
    .filter(
      (p) =>
        p.weight === currentWeight &&
        p.reps >= rule.minRepsForProgress &&
        p.rpe <= rule.maxRpeForProgress
    );

  if (qualifyingSessions.length >= rule.sessionsRequired) {
    return {
      status: 'ready',
      currentWeight,
      suggestedWeight: currentWeight + rule.weightIncrement,
      message: `Add ${rule.weightIncrement} lbs next session`,
      sessionsAtWeight,
    };
  }

  // Check if weight was too heavy (regression)
  const recentAvgRpe = performance.slice(0, 2).reduce((sum, p) => sum + p.rpe, 0) / 2;
  if (recentAvgRpe > 9.5) {
    return {
      status: 'regress',
      currentWeight,
      suggestedWeight: Math.max(currentWeight - rule.weightIncrement * 2, 0),
      message: 'Weight too heavy - reduce by 10%',
      sessionsAtWeight,
    };
  }

  // Default: maintain
  return {
    status: 'maintain',
    currentWeight,
    suggestedWeight: currentWeight,
    message: 'Keep current weight until you hit targets',
    sessionsAtWeight,
  };
}

/**
 * Get plateau breaking suggestions
 */
export function getPlateauStrategies(): typeof PLATEAU_STRATEGIES {
  return PLATEAU_STRATEGIES;
}

/**
 * Get all exercises that are ready to progress
 */
export async function getExercisesReadyToProgress(
  userId: string,
  limit: number = 5
): Promise<
  Array<{
    exerciseId: string;
    exerciseName: string;
    currentWeight: number;
    suggestedWeight: number;
    message: string;
  }>
> {
  // Get all exercises user has done recently
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 14);

  const recentSessions = await db.query.workoutSessions.findMany({
    where: and(
      eq(workoutSessions.userId, userId),
      eq(workoutSessions.status, 'completed'),
      gte(workoutSessions.date, cutoffDate)
    ),
    with: {
      exercises: {
        with: {
          exercise: true,
        },
      },
    },
  });

  // Get unique exercises
  const exerciseMap = new Map<string, string>();
  recentSessions.forEach((session) => {
    session.exercises.forEach((ex) => {
      if (ex.exercise) {
        exerciseMap.set(ex.exerciseId, ex.exercise.name);
      }
    });
  });

  // Check each exercise
  const readyToProgress: Array<{
    exerciseId: string;
    exerciseName: string;
    currentWeight: number;
    suggestedWeight: number;
    message: string;
  }> = [];

  for (const [exerciseId, exerciseName] of exerciseMap) {
    const gate = await checkProgressionGates(userId, exerciseId);
    if (gate.canProgress) {
      const rec = await getProgressionRecommendation(userId, exerciseId);
      if (rec.status === 'ready') {
        readyToProgress.push({
          exerciseId,
          exerciseName,
          currentWeight: rec.currentWeight,
          suggestedWeight: rec.suggestedWeight,
          message: rec.message,
        });
      }
    }
  }

  return readyToProgress.slice(0, limit);
}

/**
 * Get all exercises that are plateaued
 */
export async function getPlateauedExercises(
  userId: string,
  limit: number = 3
): Promise<
  Array<{
    exerciseId: string;
    exerciseName: string;
    currentWeight: number;
    sessionsAtWeight: number;
    suggestions: typeof PLATEAU_STRATEGIES;
  }>
> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  const recentSessions = await db.query.workoutSessions.findMany({
    where: and(
      eq(workoutSessions.userId, userId),
      eq(workoutSessions.status, 'completed'),
      gte(workoutSessions.date, cutoffDate)
    ),
    with: {
      exercises: {
        with: {
          exercise: true,
        },
      },
    },
  });

  // Get unique exercises
  const exerciseMap = new Map<string, string>();
  recentSessions.forEach((session) => {
    session.exercises.forEach((ex) => {
      if (ex.exercise) {
        exerciseMap.set(ex.exerciseId, ex.exercise.name);
      }
    });
  });

  // Check each exercise for plateau
  const plateaued: Array<{
    exerciseId: string;
    exerciseName: string;
    currentWeight: number;
    sessionsAtWeight: number;
    suggestions: typeof PLATEAU_STRATEGIES;
  }> = [];

  for (const [exerciseId, exerciseName] of exerciseMap) {
    const rec = await getProgressionRecommendation(userId, exerciseId);
    if (rec.status === 'plateau') {
      plateaued.push({
        exerciseId,
        exerciseName,
        currentWeight: rec.currentWeight,
        sessionsAtWeight: rec.sessionsAtWeight,
        suggestions: PLATEAU_STRATEGIES,
      });
    }
  }

  return plateaued.slice(0, limit);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export async function getExercisePerformance(
  userId: string,
  exerciseId: string,
  limit: number
): Promise<ExercisePerformance[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 60);

  // Get sessions with this exercise
  const sessions = await db.query.workoutSessions.findMany({
    where: and(
      eq(workoutSessions.userId, userId),
      eq(workoutSessions.status, 'completed'),
      gte(workoutSessions.date, cutoffDate)
    ),
    with: {
      exercises: {
        where: eq(sessionExercises.exerciseId, exerciseId),
        with: {
          exercise: true,
          sets: true,
        },
      },
    },
    orderBy: [desc(workoutSessions.date)],
  });

  const performance: ExercisePerformance[] = [];

  for (const session of sessions) {
    for (const ex of session.exercises) {
      // Get working sets only (non-warmup)
      const workingSets = ex.sets.filter((s) => !s.isWarmup && s.weight && s.reps);

      if (workingSets.length > 0) {
        // Use the heaviest set as the "performance" for this session
        const bestSet = workingSets.reduce((best, current) => {
          const bestWeight = Number(best.weight) || 0;
          const currentWeight = Number(current.weight) || 0;
          return currentWeight > bestWeight ? current : best;
        }, workingSets[0]);

        performance.push({
          exerciseId,
          exerciseName: ex.exercise?.name || 'Unknown',
          sessionDate: session.date,
          weight: Number(bestSet.weight) || 0,
          reps: bestSet.reps || 0,
          rpe: Number(bestSet.rpe) || 0,
          sets: workingSets.length,
        });
      }
    }

    if (performance.length >= limit) break;
  }

  return performance.slice(0, limit);
}
