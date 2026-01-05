import { db } from '@/lib/db';
import { goals, measurements } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { GoalProgress } from '../types';

/**
 * Calculates progress for a goal with embedded intelligence.
 * Phase 1: Embedded in MO:JOURNEY
 * Phase 2: Will be extracted to MO:MIND Journey Agent
 *
 * @param goalId - Goal ID
 * @returns Goal progress with recommendations
 */
export async function getGoalProgress(goalId: string): Promise<GoalProgress> {
  // Fetch goal
  const [goal] = await db.select().from(goals).where(eq(goals.id, goalId)).limit(1);

  if (!goal) {
    throw new Error('Goal not found');
  }

  // Fetch latest measurements
  const userMeasurements = await db
    .select()
    .from(measurements)
    .where(eq(measurements.userId, goal.userId))
    .orderBy(desc(measurements.date))
    .limit(30); // Last 30 measurements for trend analysis

  if (userMeasurements.length === 0) {
    // No measurements yet
    return {
      goalId: goal.id,
      percentComplete: 0,
      currentWeight: parseFloat(goal.startingWeight),
      targetWeight: parseFloat(goal.targetWeight),
      startingWeight: parseFloat(goal.startingWeight),
      daysElapsed: 0,
      daysRemaining: Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      expectedWeight: parseFloat(goal.startingWeight),
      status: 'on_track',
      recommendations: ['Log your first weight measurement to track progress'],
      trend: 'stable',
    };
  }

  // Calculate progress
  const latest = userMeasurements[0];
  const currentWeight = parseFloat(latest.weight);
  const startingWeight = parseFloat(goal.startingWeight);
  const targetWeight = parseFloat(goal.targetWeight);

  const totalDistance = Math.abs(targetWeight - startingWeight);
  const currentDistance = Math.abs(currentWeight - startingWeight);

  // Handle recomp goals (same starting and target weight)
  let percentComplete: number;
  if (totalDistance === 0) {
    // Recomp goal: percent complete based on maintaining weight within tolerance
    const tolerance = 0.5; // 0.5 kg tolerance
    const deviation = Math.abs(currentWeight - targetWeight);
    percentComplete = deviation <= tolerance ? 100 : Math.max(0, 100 - deviation * 20);
  } else {
    percentComplete = Math.min(100, (currentDistance / totalDistance) * 100);
  }

  // Calculate time-based metrics
  const startDate = goal.startDate.getTime();
  const targetDate = goal.targetDate.getTime();
  const now = Date.now();

  const daysElapsed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));

  // Expected weight based on linear progress
  const expectedProgress = daysElapsed / totalDays;
  const expectedWeight = startingWeight + (targetWeight - startingWeight) * expectedProgress;

  // Determine status (ahead/on_track/behind)
  const tolerance = 0.5; // 0.5 kg tolerance
  let status: 'ahead' | 'on_track' | 'behind';

  if (goal.goalType === 'fat_loss') {
    // Lower is better for fat loss
    if (currentWeight < expectedWeight - tolerance) status = 'ahead';
    else if (currentWeight > expectedWeight + tolerance) status = 'behind';
    else status = 'on_track';
  } else {
    // Higher is better for muscle building
    if (currentWeight > expectedWeight + tolerance) status = 'ahead';
    else if (currentWeight < expectedWeight - tolerance) status = 'behind';
    else status = 'on_track';
  }

  // Trend analysis (last 7 days vs previous 7 days)
  const trend = calculateTrend(userMeasurements, goal.goalType);

  // Generate recommendations (embedded intelligence)
  const recommendations = generateRecommendations(
    goal,
    currentWeight,
    expectedWeight,
    status,
    trend,
    daysRemaining
  );

  return {
    goalId: goal.id,
    percentComplete,
    currentWeight,
    targetWeight,
    startingWeight,
    daysElapsed,
    daysRemaining,
    expectedWeight,
    status,
    recommendations,
    trend,
  };
}

/**
 * Calculate trend from measurements.
 */
function calculateTrend(
  measurements: Array<{ weight: string; date: Date }>,
  goalType: string
): 'improving' | 'stable' | 'declining' {
  if (measurements.length < 7) return 'stable';

  const recent = measurements.slice(0, 7);
  const previous = measurements.slice(7, 14);

  if (previous.length === 0) return 'stable';

  const recentAvg = recent.reduce((sum, m) => sum + parseFloat(m.weight), 0) / recent.length;
  const previousAvg = previous.reduce((sum, m) => sum + parseFloat(m.weight), 0) / previous.length;

  const change = recentAvg - previousAvg;

  if (goalType === 'fat_loss') {
    if (change < -0.3) return 'improving'; // Losing weight
    if (change > 0.3) return 'declining'; // Gaining weight
    return 'stable';
  } else {
    // muscle_building or recomp
    if (change > 0.3) return 'improving'; // Gaining weight
    if (change < -0.3) return 'declining'; // Losing weight
    return 'stable';
  }
}

/**
 * Generate recommendations based on progress.
 * Phase 1: Simple embedded logic
 * Phase 2: Will be extracted to MO:MIND Journey Agent
 */
function generateRecommendations(
  goal: { goalType: string; targetWeight: string },
  currentWeight: number,
  expectedWeight: number,
  status: 'ahead' | 'on_track' | 'behind',
  trend: 'improving' | 'stable' | 'declining',
  daysRemaining: number
): string[] {
  const recommendations: string[] = [];

  // Status-based recommendations
  if (status === 'ahead') {
    recommendations.push("Great job! You're ahead of schedule.");
  } else if (status === 'on_track') {
    recommendations.push("You're on track to reach your goal!");
  } else {
    recommendations.push("You're behind schedule. Consider adjusting your plan.");
  }

  // Trend-based recommendations
  if (trend === 'improving') {
    recommendations.push('Your trend is improving - keep it up!');
  } else if (trend === 'declining') {
    recommendations.push('Your trend is declining. Review your plan.');
  }

  // Time-based recommendations
  if (daysRemaining < 7) {
    recommendations.push(`Only ${daysRemaining} days left!`);
  }

  // Goal-type specific recommendations
  if (goal.goalType === 'fat_loss') {
    if (status === 'behind') {
      recommendations.push('Consider increasing cardio or reviewing your nutrition.');
    }
  } else if (goal.goalType === 'muscle_building') {
    if (status === 'behind') {
      recommendations.push('Consider increasing calorie intake or training volume.');
    }
  }

  return recommendations;
}
