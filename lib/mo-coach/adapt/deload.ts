/**
 * MoDeload - "The Healer"
 * Part of MO:COACH / MoAdapt
 *
 * "I know when you need rest"
 *
 * Detects when deload is needed based on fatigue patterns,
 * manages deload periods, and applies training modifiers.
 */

import { db } from '@/lib/db';
import { deloadPeriods, workoutSessions } from '@/lib/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { calculateFatigue, getFatigueHistory, type FatigueResult } from './fatigue';

// ============================================
// TYPES
// ============================================

export type DeloadType = 'volume' | 'intensity' | 'full_rest';

export interface DeloadDecision {
  shouldDeload: boolean;
  reason: string;
  deloadType: DeloadType;
  durationDays: number;
  volumeModifier: number;   // e.g., 0.6 = 60% volume
  intensityModifier: number; // e.g., 0.9 = 90% weight
}

export interface ActiveDeload {
  id: string;
  startDate: Date;
  endDate: Date;
  deloadType: DeloadType;
  volumeModifier: number;
  intensityModifier: number;
  daysRemaining: number;
  triggerReason: string;
}

// ============================================
// DELOAD DETECTION
// ============================================

/**
 * Check if user needs a deload based on multiple factors
 */
export async function checkDeloadNeeded(userId: string): Promise<DeloadDecision> {
  // Get current fatigue
  const fatigueResult = await calculateFatigue(userId);
  const weeksSinceDeload = await getWeeksSinceLastDeload(userId);
  const fatigueHistory = await getFatigueHistory(userId, 7);

  // Rule 1: Scheduled deload (every 4 weeks)
  if (weeksSinceDeload >= 4) {
    return {
      shouldDeload: true,
      reason: 'Scheduled deload week (4 week cycle)',
      deloadType: 'volume',
      durationDays: 7,
      volumeModifier: 0.6,
      intensityModifier: 1.0,
    };
  }

  // Rule 2: Fatigue score critical for 2+ days
  const criticalDays = fatigueHistory.filter(f => f.fatigueScore >= 8).length;
  if (criticalDays >= 2) {
    return {
      shouldDeload: true,
      reason: 'Sustained critical fatigue (2+ days)',
      deloadType: 'full_rest',
      durationDays: 3,
      volumeModifier: 0,
      intensityModifier: 0,
    };
  }

  // Rule 3: Fatigue elevated (6+) for 5+ days
  const elevatedDays = fatigueHistory.filter(f => f.fatigueScore >= 6).length;
  if (elevatedDays >= 5) {
    return {
      shouldDeload: true,
      reason: 'Prolonged elevated fatigue (5+ days)',
      deloadType: 'volume',
      durationDays: 5,
      volumeModifier: 0.5,
      intensityModifier: 0.9,
    };
  }

  // Rule 4: High fatigue with poor recovery factors
  if (fatigueResult.score >= 7 && fatigueResult.factors.recoveryDebt >= 2) {
    return {
      shouldDeload: true,
      reason: 'High fatigue combined with poor recovery',
      deloadType: 'intensity',
      durationDays: 5,
      volumeModifier: 0.7,
      intensityModifier: 0.85,
    };
  }

  // No deload needed
  return {
    shouldDeload: false,
    reason: 'No deload needed',
    deloadType: 'volume',
    durationDays: 0,
    volumeModifier: 1.0,
    intensityModifier: 1.0,
  };
}

/**
 * Start a deload period
 */
export async function startDeload(
  userId: string,
  decision: DeloadDecision,
  fatigueScore?: number
): Promise<string> {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + decision.durationDays);

  // End any existing active deload
  await db.update(deloadPeriods)
    .set({
      isActive: false,
      completedAt: new Date(),
    })
    .where(and(
      eq(deloadPeriods.userId, userId),
      eq(deloadPeriods.isActive, true)
    ));

  // Create new deload period
  const [newDeload] = await db.insert(deloadPeriods).values({
    userId,
    startDate,
    endDate,
    durationDays: decision.durationDays,
    deloadType: decision.deloadType,
    volumeModifier: String(decision.volumeModifier),
    intensityModifier: String(decision.intensityModifier),
    triggerReason: decision.reason,
    fatigueScoreAtTrigger: fatigueScore,
    isActive: true,
  }).returning();

  return newDeload.id;
}

/**
 * End an active deload early
 */
export async function endDeload(userId: string): Promise<void> {
  await db.update(deloadPeriods)
    .set({
      isActive: false,
      completedAt: new Date(),
    })
    .where(and(
      eq(deloadPeriods.userId, userId),
      eq(deloadPeriods.isActive, true)
    ));
}

/**
 * Get currently active deload if any
 */
export async function getActiveDeload(userId: string): Promise<ActiveDeload | null> {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const activeDeload = await db.query.deloadPeriods.findFirst({
    where: and(
      eq(deloadPeriods.userId, userId),
      eq(deloadPeriods.isActive, true),
      lte(deloadPeriods.startDate, today),
      gte(deloadPeriods.endDate, today)
    ),
  });

  if (!activeDeload) return null;

  const daysRemaining = Math.ceil(
    (new Date(activeDeload.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    id: activeDeload.id,
    startDate: activeDeload.startDate,
    endDate: activeDeload.endDate,
    deloadType: activeDeload.deloadType as DeloadType,
    volumeModifier: Number(activeDeload.volumeModifier) || 0.6,
    intensityModifier: Number(activeDeload.intensityModifier) || 1.0,
    daysRemaining,
    triggerReason: activeDeload.triggerReason,
  };
}

/**
 * Get weeks since last deload
 */
async function getWeeksSinceLastDeload(userId: string): Promise<number> {
  const lastDeload = await db.query.deloadPeriods.findFirst({
    where: eq(deloadPeriods.userId, userId),
    orderBy: [desc(deloadPeriods.endDate)],
  });

  if (!lastDeload) {
    // Check when user started training
    const firstSession = await db.query.workoutSessions.findFirst({
      where: and(
        eq(workoutSessions.userId, userId),
        eq(workoutSessions.status, 'completed')
      ),
      orderBy: [workoutSessions.date],
    });

    if (!firstSession?.date) return 0;

    const daysSinceStart = Math.floor(
      (new Date().getTime() - new Date(firstSession.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.floor(daysSinceStart / 7);
  }

  const daysSinceDeload = Math.floor(
    (new Date().getTime() - new Date(lastDeload.endDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.floor(daysSinceDeload / 7);
}

/**
 * Get deload history
 */
export async function getDeloadHistory(
  userId: string,
  limit: number = 5
): Promise<typeof deloadPeriods.$inferSelect[]> {
  return db.query.deloadPeriods.findMany({
    where: eq(deloadPeriods.userId, userId),
    orderBy: [desc(deloadPeriods.startDate)],
    limit,
  });
}

/**
 * Apply deload modifiers to a workout
 */
export function applyDeloadModifiers(
  deload: ActiveDeload | null,
  originalSets: number,
  originalWeight: number
): { sets: number; weight: number; isDeload: boolean } {
  if (!deload) {
    return {
      sets: originalSets,
      weight: originalWeight,
      isDeload: false,
    };
  }

  // Apply volume modifier (reduce sets)
  const adjustedSets = Math.max(1, Math.round(originalSets * deload.volumeModifier));

  // Apply intensity modifier (reduce weight)
  const adjustedWeight = Math.round(originalWeight * deload.intensityModifier / 5) * 5; // Round to nearest 5

  return {
    sets: adjustedSets,
    weight: adjustedWeight,
    isDeload: true,
  };
}
