import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workoutSessions, recoveryLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc, gte } from 'drizzle-orm';
import {
  calculateFatigue,
  logFatigue,
  checkProgressionGates,
  getProgressionRecommendation,
  getExercisesReadyToProgress,
  getPlateauedExercises,
  checkDeloadNeeded,
  getActiveDeload,
} from '@/lib/training-logic';

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
