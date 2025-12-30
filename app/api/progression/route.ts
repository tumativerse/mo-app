import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workoutSessions, recoveryLogs, fatigueLogs, sessionSets } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/mo-self';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import {
  calculateFatigue,
  logFatigue,
  checkProgressionGates,
  getProgressionRecommendation,
  getExercisesReadyToProgress,
  getPlateauedExercises,
  checkDeloadNeeded,
  getActiveDeload,
} from '@/lib/mo-coach';

// GET /api/progression - Get progression status and recommendations
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');
    const days = parseInt(searchParams.get('days') || '14');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Calculate fatigue and check progression gates
    const [fatigueResult, deloadDecision, activeDeload] = await Promise.all([
      calculateFatigue(user.id, days),
      checkDeloadNeeded(user.id),
      getActiveDeload(user.id),
    ]);

    // Log fatigue for trend tracking
    await logFatigue(user.id, fatigueResult);

    // If specific exercise requested, get progression data for it
    if (exerciseId) {
      const [gate, recommendation] = await Promise.all([
        checkProgressionGates(user.id, exerciseId),
        getProgressionRecommendation(user.id, exerciseId),
      ]);

      return NextResponse.json({
        exercise: {
          exerciseId,
          gate,
          recommendation,
        },
        fatigue: {
          score: fatigueResult.score,
          level: fatigueResult.status.level,
          color: fatigueResult.status.color,
          message: fatigueResult.status.message,
          action: fatigueResult.status.action,
        },
        recommendations: generateExerciseRecommendations(recommendation, gate, fatigueResult),
      });
    }

    // Get recent sessions for aggregate stats
    const recentSessions = await db.query.workoutSessions.findMany({
      where: and(
        eq(workoutSessions.userId, user.id),
        eq(workoutSessions.status, 'completed'),
        gte(workoutSessions.completedAt, startDate)
      ),
      orderBy: [desc(workoutSessions.completedAt)],
    });

    // Get recent recovery logs
    const recentRecovery = await db.query.recoveryLogs.findMany({
      where: and(
        eq(recoveryLogs.userId, user.id),
        gte(recoveryLogs.date, startDate)
      ),
      orderBy: [desc(recoveryLogs.date)],
    });

    // Get exercises ready to progress and plateaued
    const [readyToProgress, plateaued] = await Promise.all([
      getExercisesReadyToProgress(user.id, 5),
      getPlateauedExercises(user.id, 3),
    ]);

    // Calculate recovery averages
    const recoveryWithValues = recentRecovery.filter(r =>
      r.sleepHours || r.energyLevel || r.overallSoreness
    );
    const avgSleep = recoveryWithValues.length > 0
      ? recoveryWithValues.reduce((sum, r) => sum + (Number(r.sleepHours) || 0), 0) / recoveryWithValues.length
      : 0;
    const avgEnergy = recoveryWithValues.length > 0
      ? recoveryWithValues.reduce((sum, r) => sum + (r.energyLevel || 0), 0) / recoveryWithValues.length
      : 0;
    const avgSoreness = recoveryWithValues.length > 0
      ? recoveryWithValues.reduce((sum, r) => sum + (r.overallSoreness || 0), 0) / recoveryWithValues.length
      : 0;

    // Calculate session stats
    const avgSessionRpe = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + (Number(s.avgRpe) || 0), 0) / recentSessions.length
      : 0;

    // Get fatigue history for chart
    const fatigueHistory = await getFatigueHistory(user.id, days);

    // Calculate weekly volume for chart
    const volumeByWeek = await getWeeklyVolume(user.id, recentSessions);

    return NextResponse.json({
      // Enhanced fatigue tracking (0-10 scale)
      fatigueScore: fatigueResult.score,
      fatigueStatus: {
        level: fatigueResult.status.level,
        color: fatigueResult.status.color,
        message: fatigueResult.status.message,
        action: fatigueResult.status.action,
      },
      fatigueFactors: fatigueResult.factors,

      // Deload status
      deload: {
        isActive: !!activeDeload,
        recommended: deloadDecision.shouldDeload,
        reason: activeDeload?.triggerReason || deloadDecision.reason,
        daysRemaining: activeDeload?.daysRemaining,
        volumeModifier: activeDeload?.volumeModifier || deloadDecision.volumeModifier,
        intensityModifier: activeDeload?.intensityModifier || deloadDecision.intensityModifier,
      },

      // Session stats
      sessionCount: recentSessions.length,
      avgSessionRpe: Math.round(avgSessionRpe * 10) / 10,

      // Recovery averages
      recovery: {
        avgSleep: Math.round(avgSleep * 10) / 10,
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        avgSoreness: Math.round(avgSoreness * 10) / 10,
        logsCount: recoveryWithValues.length,
      },

      // Chart data
      fatigueHistory,
      volumeByWeek,

      // Exercises ready to progress
      readyToProgress: readyToProgress.map(ex => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        latestWeight: ex.currentWeight,
        suggestedWeight: ex.suggestedWeight,
        recommendation: ex.message,
      })),

      // Plateaued exercises
      plateaued: plateaued.map(ex => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        latestWeight: ex.currentWeight,
        sessionsAtWeight: ex.sessionsAtWeight,
        suggestions: ex.suggestions.slice(0, 3).map(s => s.description),
      })),

      // Overall recommendations
      recommendations: generateOverallRecommendations(
        fatigueResult,
        deloadDecision,
        activeDeload,
        recentSessions.length
      ),
    });
  } catch (error) {
    console.error('Error fetching progression:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progression data' },
      { status: 500 }
    );
  }
}

// Helper: Generate exercise-specific recommendations
function generateExerciseRecommendations(
  recommendation: { status: string; currentWeight: number; suggestedWeight: number; message: string },
  gate: { canProgress: boolean; reason: string; suggestedAction: string; blockedBy?: string },
  fatigue: { score: number; status: { level: string } }
): string[] {
  const recommendations: string[] = [];

  // Fatigue-based recommendation
  if (fatigue.score >= 7) {
    recommendations.push('High fatigue detected - maintain or reduce weight');
    return recommendations;
  }

  // Gate-based recommendation
  if (!gate.canProgress && gate.blockedBy) {
    recommendations.push(gate.suggestedAction);
    return recommendations;
  }

  // Status-based recommendations
  switch (recommendation.status) {
    case 'ready':
      recommendations.push(`Ready to progress: Add weight to ${recommendation.suggestedWeight} lbs`);
      break;
    case 'plateau':
      recommendations.push('Progress has stalled - consider these strategies:');
      recommendations.push('Try a different rep range (6-8 instead of 8-12)');
      recommendations.push('Switch to a variation of this exercise');
      recommendations.push('Take a deload week, then push harder');
      break;
    case 'maintain':
      recommendations.push('Keep working at current weight until you hit all target reps at RPE 8');
      break;
    case 'regress':
      recommendations.push(`Weight too heavy - reduce to ${recommendation.suggestedWeight} lbs`);
      break;
  }

  return recommendations;
}

// Helper: Generate overall recommendations
function generateOverallRecommendations(
  fatigue: { score: number; status: { level: string }; recommendations: string[] },
  deloadDecision: { shouldDeload: boolean; reason: string },
  activeDeload: { daysRemaining: number } | null,
  sessionCount: number
): string[] {
  const recommendations: string[] = [];

  // Active deload message
  if (activeDeload) {
    recommendations.push(
      `Currently in deload - ${activeDeload.daysRemaining} days remaining`
    );
  }
  // Deload recommendation
  else if (deloadDecision.shouldDeload) {
    recommendations.push(`Deload recommended: ${deloadDecision.reason}`);
  }

  // Fatigue-based recommendations
  if (fatigue.score >= 8) {
    recommendations.push('Critical fatigue level - prioritize rest and recovery');
  } else if (fatigue.score >= 6) {
    recommendations.push('Elevated fatigue - monitor closely and reduce volume if needed');
  } else if (fatigue.score <= 2) {
    recommendations.push('Well recovered - can push intensity if desired');
  }

  // Add specific fatigue recommendations
  fatigue.recommendations.forEach(rec => {
    if (!recommendations.includes(rec)) {
      recommendations.push(rec);
    }
  });

  // Session count advisory
  if (sessionCount < 3) {
    recommendations.push('Complete more workouts for accurate progression analysis');
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

// Helper: Get fatigue history for chart
async function getFatigueHistory(userId: string, days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await db.query.fatigueLogs.findMany({
    where: and(
      eq(fatigueLogs.userId, userId),
      gte(fatigueLogs.date, startDate)
    ),
    orderBy: [desc(fatigueLogs.date)],
    limit: 14,
  });

  return logs.map(log => {
    const score = Number(log.fatigueScore) || 0;
    let level: 'fresh' | 'manageable' | 'accumulating' | 'high';
    if (score < 4) level = 'fresh';
    else if (score < 6) level = 'manageable';
    else if (score < 8) level = 'accumulating';
    else level = 'high';

    return {
      date: log.date.toISOString(),
      score,
      level,
    };
  }).reverse(); // Oldest first for chart
}

// Helper: Calculate weekly volume
async function getWeeklyVolume(userId: string, sessions: typeof workoutSessions.$inferSelect[]) {
  if (sessions.length === 0) return [];

  // Group sessions by week
  const weekMap = new Map<string, { volume: number; count: number }>();

  for (const session of sessions) {
    if (!session.completedAt) continue;

    // Get week start (Monday)
    const date = new Date(session.completedAt);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(date.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const weekKey = weekStart.toISOString().split('T')[0];

    // Get session volume
    const sets = await db.query.sessionSets.findMany({
      where: and(
        eq(sessionSets.sessionExerciseId, sql`ANY(
          SELECT id FROM session_exercises WHERE session_id = ${session.id}
        )`),
        eq(sessionSets.isWarmup, false)
      ),
    });

    const sessionVolume = sets.reduce((sum, set) => {
      const weight = parseFloat(set.weight || '0');
      const reps = set.reps || 0;
      return sum + (weight * reps);
    }, 0);

    const week = weekMap.get(weekKey) || { volume: 0, count: 0 };
    week.volume += sessionVolume;
    week.count += 1;
    weekMap.set(weekKey, week);
  }

  // Calculate baseline (average of all weeks)
  const weeks = Array.from(weekMap.entries());
  const totalVolume = weeks.reduce((sum, [, data]) => sum + data.volume, 0);
  const baseline = weeks.length > 0 ? totalVolume / weeks.length : 0;

  // Format for chart (last 4-6 weeks)
  return weeks
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([weekKey, data]) => ({
      week: new Date(weekKey).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      volume: Math.round(data.volume),
      baseline: Math.round(baseline),
    }));
}
