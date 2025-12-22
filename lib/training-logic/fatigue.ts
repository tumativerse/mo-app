import { db } from '@/lib/db';
import { workoutSessions, sessionSets, sessionExercises, recoveryLogs, fatigueLogs } from '@/lib/db/schema';
import { eq, desc, gte, and } from 'drizzle-orm';

// ============================================
// TYPES
// ============================================

export type FatigueLevel = 'fresh' | 'normal' | 'elevated' | 'high' | 'critical';

export interface FatigueFactors {
  rpeCreep: number;        // 0-2: RPE trending up over sessions
  performanceDrop: number; // 0-2: Reps declining at same weight
  recoveryDebt: number;    // 0-3: Poor sleep/energy/soreness
  volumeLoad: number;      // 0-2: High volume relative to baseline
  streak: number;          // 0-1: Many consecutive training days
}

export interface FatigueStatus {
  level: FatigueLevel;
  color: 'green' | 'yellow' | 'orange' | 'red';
  message: string;
  action: string;
}

export interface FatigueResult {
  score: number;
  factors: FatigueFactors;
  status: FatigueStatus;
  recommendations: string[];
}

// ============================================
// FATIGUE CALCULATION
// ============================================

/**
 * Calculate fatigue score for a user based on multiple factors
 * Score ranges from 0-10 where higher = more fatigued
 */
export async function calculateFatigue(userId: string, days: number = 7): Promise<FatigueResult> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Fetch recent data in parallel
  const [sessions, recoveryData] = await Promise.all([
    getRecentSessions(userId, cutoffDate),
    getRecentRecovery(userId, 3),
  ]);

  const factors: FatigueFactors = {
    rpeCreep: 0,
    performanceDrop: 0,
    recoveryDebt: 0,
    volumeLoad: 0,
    streak: 0,
  };

  const recommendations: string[] = [];

  // 1. RPE Creep (0-2 points)
  // Check if RPE is trending upward across recent sessions
  if (sessions.length >= 3) {
    const recentRpes = sessions.slice(0, 5).map(s => Number(s.avgRpe) || 0).filter(r => r > 0);
    if (recentRpes.length >= 3) {
      const isIncreasing = checkIncreasingTrend(recentRpes);
      if (isIncreasing) {
        factors.rpeCreep = 2;
        recommendations.push('RPE trending up - consider reducing intensity');
      }
    }
  }

  // 2. Performance Drop (0-2 points)
  // Check if average RPE > 8.5 (indicating grinding sets)
  if (sessions.length >= 2) {
    const avgRpe = sessions
      .slice(0, 5)
      .reduce((sum, s) => sum + (Number(s.avgRpe) || 0), 0) / Math.min(sessions.length, 5);

    if (avgRpe > 8.5) {
      factors.performanceDrop = 2;
      recommendations.push('High average RPE - workouts are very demanding');
    } else if (avgRpe > 8) {
      factors.performanceDrop = 1;
    }
  }

  // 3. Recovery Debt (0-3 points)
  if (recoveryData.length > 0) {
    const avgSleep = average(recoveryData.map(r => Number(r.sleepHours) || 0).filter(h => h > 0));
    const avgEnergy = average(recoveryData.map(r => r.energyLevel || 0).filter(e => e > 0));
    const avgSoreness = average(recoveryData.map(r => r.overallSoreness || 0).filter(s => s > 0));

    // Sleep debt
    if (avgSleep < 5) {
      factors.recoveryDebt += 2;
      recommendations.push('Severe sleep debt - prioritize 7+ hours');
    } else if (avgSleep < 6) {
      factors.recoveryDebt += 1;
      recommendations.push('Low sleep - aim for 7+ hours');
    }

    // Low energy
    if (avgEnergy > 0 && avgEnergy < 3) {
      factors.recoveryDebt += 1;
      recommendations.push('Low energy levels - consider rest day');
    }

    // High soreness
    if (avgSoreness > 4) {
      factors.recoveryDebt += 1;
      recommendations.push('High muscle soreness - allow recovery');
    }

    // Cap recovery debt at 3
    factors.recoveryDebt = Math.min(factors.recoveryDebt, 3);
  }

  // 4. Volume Load (0-2 points)
  // Compare this week's volume to baseline
  if (sessions.length >= 3) {
    const weeklyVolume = sessions
      .filter(s => isWithinDays(s.date, 7))
      .reduce((sum, s) => sum + (Number(s.totalVolume) || 0), 0);

    const baselineVolume = sessions
      .filter(s => !isWithinDays(s.date, 7))
      .reduce((sum, s) => sum + (Number(s.totalVolume) || 0), 0) / Math.max(1, sessions.filter(s => !isWithinDays(s.date, 7)).length);

    if (baselineVolume > 0) {
      const volumeRatio = weeklyVolume / baselineVolume;
      if (volumeRatio > 1.4) {
        factors.volumeLoad = 2;
        recommendations.push('Volume spike detected - risk of overreaching');
      } else if (volumeRatio > 1.2) {
        factors.volumeLoad = 1;
      }
    }
  }

  // 5. Training Streak (0-1 point)
  const consecutiveDays = getConsecutiveTrainingDays(sessions);
  if (consecutiveDays >= 5) {
    factors.streak = 1;
    recommendations.push(`${consecutiveDays} consecutive training days - schedule rest`);
  }

  // Calculate total score (0-10)
  const score = Math.min(10,
    factors.rpeCreep +
    factors.performanceDrop +
    factors.recoveryDebt +
    factors.volumeLoad +
    factors.streak
  );

  const status = getFatigueStatus(score);

  return {
    score,
    factors,
    status,
    recommendations,
  };
}

/**
 * Get fatigue status based on score
 */
export function getFatigueStatus(score: number): FatigueStatus {
  if (score <= 2) {
    return {
      level: 'fresh',
      color: 'green',
      message: 'Well recovered',
      action: 'Train normally, consider pushing intensity',
    };
  }

  if (score <= 4) {
    return {
      level: 'normal',
      color: 'green',
      message: 'Normal training fatigue',
      action: 'Continue as planned',
    };
  }

  if (score <= 6) {
    return {
      level: 'elevated',
      color: 'yellow',
      message: 'Fatigue accumulating',
      action: 'Monitor closely, prioritize recovery',
    };
  }

  if (score <= 8) {
    return {
      level: 'high',
      color: 'orange',
      message: 'High fatigue - deload recommended',
      action: 'Take a deload week or reduce volume 40%',
    };
  }

  return {
    level: 'critical',
    color: 'red',
    message: 'Risk of overtraining',
    action: 'Mandatory rest day or very light session only',
  };
}

/**
 * Log fatigue score to database for trend tracking
 */
export async function logFatigue(userId: string, result: FatigueResult): Promise<void> {
  const today = new Date();
  today.setHours(12, 0, 0, 0); // Normalize to noon

  await db.insert(fatigueLogs).values({
    userId,
    date: today,
    fatigueScore: result.score,
    fatigueLevel: result.status.level,
    rpeCreepScore: result.factors.rpeCreep,
    performanceScore: result.factors.performanceDrop,
    recoveryDebtScore: result.factors.recoveryDebt,
    volumeLoadScore: result.factors.volumeLoad,
    streakScore: result.factors.streak,
    recommendations: result.recommendations,
  }).onConflictDoUpdate({
    target: [fatigueLogs.userId, fatigueLogs.date],
    set: {
      fatigueScore: result.score,
      fatigueLevel: result.status.level,
      rpeCreepScore: result.factors.rpeCreep,
      performanceScore: result.factors.performanceDrop,
      recoveryDebtScore: result.factors.recoveryDebt,
      volumeLoadScore: result.factors.volumeLoad,
      streakScore: result.factors.streak,
      recommendations: result.recommendations,
    },
  });
}

/**
 * Get recent fatigue history
 */
export async function getFatigueHistory(userId: string, days: number = 7): Promise<typeof fatigueLogs.$inferSelect[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return db.query.fatigueLogs.findMany({
    where: and(
      eq(fatigueLogs.userId, userId),
      gte(fatigueLogs.date, cutoffDate)
    ),
    orderBy: [desc(fatigueLogs.date)],
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getRecentSessions(userId: string, cutoffDate: Date) {
  return db.query.workoutSessions.findMany({
    where: and(
      eq(workoutSessions.userId, userId),
      eq(workoutSessions.status, 'completed'),
      gte(workoutSessions.date, cutoffDate)
    ),
    orderBy: [desc(workoutSessions.date)],
    limit: 20,
  });
}

async function getRecentRecovery(userId: string, days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return db.query.recoveryLogs.findMany({
    where: and(
      eq(recoveryLogs.userId, userId),
      gte(recoveryLogs.date, cutoffDate)
    ),
    orderBy: [desc(recoveryLogs.date)],
    limit: days,
  });
}

function checkIncreasingTrend(values: number[]): boolean {
  if (values.length < 3) return false;

  // Check if most recent values are higher than earlier ones
  const recentAvg = average(values.slice(0, 2));
  const earlierAvg = average(values.slice(2));

  return recentAvg > earlierAvg + 0.5; // Need at least 0.5 RPE increase
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function isWithinDays(date: Date | null, days: number): boolean {
  if (!date) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(date) >= cutoff;
}

function getConsecutiveTrainingDays(sessions: { date: Date | null }[]): number {
  if (sessions.length === 0) return 0;

  const dates = sessions
    .map(s => s.date)
    .filter((d): d is Date => d !== null)
    .map(d => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .sort((a, b) => b - a); // Most recent first

  if (dates.length === 0) return 0;

  let streak = 1;
  const oneDay = 24 * 60 * 60 * 1000;

  for (let i = 1; i < dates.length; i++) {
    const diff = dates[i - 1] - dates[i];
    if (diff === oneDay) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
