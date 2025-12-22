import { db } from '@/lib/db';
import { exercises, userExerciseDefaults, templateSlots } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculateFatigue } from './fatigue';
import { getProgressionRecommendation } from './progression';
import { getActiveDeload, applyDeloadModifiers } from './deload';

// ============================================
// TYPES
// ============================================

export interface WeightSuggestion {
  suggestedWeight: number;
  confidence: 'high' | 'medium' | 'low';
  basis: string;
  isDeload: boolean;
  originalWeight?: number; // If adjusted for deload
}

export interface SetSuggestion {
  action: 'continue' | 'reduce' | 'add_set' | 'stop';
  message: string | null;
  suggestedWeightChange?: number; // Percentage change, e.g., -10 for 10% reduction
}

export interface WarmupSuggestion {
  setNumber: number;
  weight: number;
  reps: number;
  percentage: number; // Of working weight
}

export interface RestTimerConfig {
  defaultSeconds: number;
  autoStart: boolean;
  alertAt: number[]; // Seconds remaining to alert
}

// ============================================
// WEIGHT SUGGESTIONS
// ============================================

/**
 * Suggest weight for an exercise based on history, fatigue, and progression status
 */
export async function suggestWeight(
  userId: string,
  exerciseId: string,
  setNumber: number,
  isWarmup: boolean = false
): Promise<WeightSuggestion> {
  // Get user's defaults for this exercise
  const defaults = await db.query.userExerciseDefaults.findFirst({
    where: and(
      eq(userExerciseDefaults.userId, userId),
      eq(userExerciseDefaults.exerciseId, exerciseId)
    ),
  });

  // Get exercise info for category
  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
  });

  // Check for active deload
  const activeDeload = await getActiveDeload(userId);

  // No history - suggest starting weight
  if (!defaults || !defaults.lastWeight) {
    const startingWeight = getStartingWeight(exercise?.category || 'isolation');

    if (isWarmup) {
      const warmup = getWarmupProgression(startingWeight, setNumber);
      return {
        suggestedWeight: warmup.weight,
        confidence: 'low',
        basis: 'Default starting weight (no history)',
        isDeload: false,
      };
    }

    return {
      suggestedWeight: startingWeight,
      confidence: 'low',
      basis: 'Default starting weight (no history)',
      isDeload: false,
    };
  }

  let baseWeight = Number(defaults.lastWeight);

  // Get fatigue and progression status
  const [fatigue, progression] = await Promise.all([
    calculateFatigue(userId),
    getProgressionRecommendation(userId, exerciseId),
  ]);

  // Apply progression if ready (first working set only)
  if (progression.status === 'ready' && setNumber === 1 && !isWarmup) {
    baseWeight = progression.suggestedWeight;
  }

  // Apply fatigue adjustment
  if (fatigue.score >= 6 && !isWarmup) {
    const fatiguePenalty = fatigue.score >= 8 ? 0.85 : 0.9;
    baseWeight = roundToNearest(baseWeight * fatiguePenalty, 5);
  }

  // Apply deload if active
  if (activeDeload && !isWarmup) {
    const adjusted = applyDeloadModifiers(activeDeload, 1, baseWeight);
    return {
      suggestedWeight: adjusted.weight,
      confidence: 'high',
      basis: `Deload: ${Math.round(activeDeload.intensityModifier * 100)}% of normal`,
      isDeload: true,
      originalWeight: baseWeight,
    };
  }

  // Calculate warmup weights
  if (isWarmup) {
    const warmup = getWarmupProgression(baseWeight, setNumber);
    return {
      suggestedWeight: warmup.weight,
      confidence: 'high',
      basis: `Warmup set ${setNumber}: ${warmup.percentage}% of working weight`,
      isDeload: false,
    };
  }

  return {
    suggestedWeight: baseWeight,
    confidence: 'high',
    basis: `Based on last session: ${defaults.lastWeight} lbs`,
    isDeload: false,
  };
}

/**
 * Get suggestion after completing a set based on RPE
 */
export function getSuggestionAfterSet(
  setNumber: number,
  totalSets: number,
  completedReps: number,
  targetReps: number,
  rpe: number,
  targetRpe: number
): SetSuggestion {
  const rpeDiff = rpe - targetRpe;
  const repsDiff = completedReps - targetReps;

  // Way harder than expected (RPE 2+ over target)
  if (rpeDiff >= 2) {
    if (setNumber >= totalSets - 1) {
      // On last set(s), might want to stop
      return {
        action: 'stop',
        message: 'Consider ending here - very high RPE',
      };
    }
    return {
      action: 'reduce',
      message: 'Consider reducing weight by 5-10%',
      suggestedWeightChange: -10,
    };
  }

  // Moderately harder than expected
  if (rpeDiff >= 1) {
    return {
      action: 'continue',
      message: 'Harder than target - maintain weight next set',
    };
  }

  // Much easier than expected on last set - can add set
  if (rpeDiff <= -2 && setNumber === totalSets && completedReps >= targetReps) {
    return {
      action: 'add_set',
      message: 'Feeling strong? Add a bonus set',
    };
  }

  // Easier than expected
  if (rpeDiff <= -1 && setNumber === totalSets) {
    return {
      action: 'continue',
      message: 'Good session - consider adding weight next time',
    };
  }

  return {
    action: 'continue',
    message: null,
  };
}

/**
 * Get warmup set progression
 */
export function getWarmupProgression(workingWeight: number, setNumber: number): WarmupSuggestion {
  // Standard warmup progression: 50% -> 70% -> 85%
  const progressions = [
    { percentage: 50, reps: 10 },
    { percentage: 70, reps: 6 },
    { percentage: 85, reps: 3 },
  ];

  const index = Math.min(setNumber - 1, progressions.length - 1);
  const progression = progressions[index];

  return {
    setNumber,
    weight: roundToNearest(workingWeight * (progression.percentage / 100), 5),
    reps: progression.reps,
    percentage: progression.percentage,
  };
}

/**
 * Get all warmup sets for a given working weight
 */
export function getWarmupSets(workingWeight: number): WarmupSuggestion[] {
  // Skip warmups for very light weights
  if (workingWeight < 50) {
    return [
      { setNumber: 1, weight: roundToNearest(workingWeight * 0.5, 5), reps: 10, percentage: 50 },
    ];
  }

  return [
    { setNumber: 1, weight: roundToNearest(workingWeight * 0.5, 5), reps: 10, percentage: 50 },
    { setNumber: 2, weight: roundToNearest(workingWeight * 0.7, 5), reps: 6, percentage: 70 },
    { setNumber: 3, weight: roundToNearest(workingWeight * 0.85, 5), reps: 3, percentage: 85 },
  ];
}

// ============================================
// REST TIMER SUGGESTIONS
// ============================================

const REST_TIMER_DEFAULTS: Record<string, RestTimerConfig> = {
  compound_heavy: { defaultSeconds: 180, autoStart: true, alertAt: [30, 10] },
  compound_moderate: { defaultSeconds: 120, autoStart: true, alertAt: [30, 10] },
  isolation: { defaultSeconds: 90, autoStart: true, alertAt: [15] },
  accessory: { defaultSeconds: 60, autoStart: true, alertAt: [15] },
};

/**
 * Get rest timer configuration based on slot and RPE
 */
export function getRestTimerConfig(
  slotType: 'primary' | 'secondary' | 'accessory' | 'optional',
  exerciseCategory: 'compound' | 'isolation' | 'cardio' | 'mobility',
  lastRpe?: number
): RestTimerConfig {
  // Primary slots with compound exercises = heavy
  if (slotType === 'primary' && exerciseCategory === 'compound') {
    // Increase rest if RPE was very high
    if (lastRpe && lastRpe >= 9) {
      return {
        ...REST_TIMER_DEFAULTS.compound_heavy,
        defaultSeconds: 240, // Extra rest for grinding sets
      };
    }
    return REST_TIMER_DEFAULTS.compound_heavy;
  }

  // Secondary compound movements
  if (slotType === 'secondary' && exerciseCategory === 'compound') {
    return REST_TIMER_DEFAULTS.compound_moderate;
  }

  // Accessory/optional or isolation exercises
  if (slotType === 'accessory' || slotType === 'optional') {
    return REST_TIMER_DEFAULTS.accessory;
  }

  // Default for isolation
  return REST_TIMER_DEFAULTS.isolation;
}

/**
 * Get rest timer from slot definition
 */
export async function getRestTimerFromSlot(slotId: string): Promise<number> {
  const slot = await db.query.templateSlots.findFirst({
    where: eq(templateSlots.id, slotId),
  });

  return slot?.restSeconds || 120;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStartingWeight(category: string): number {
  // Default starting weights by exercise category
  const defaults: Record<string, number> = {
    compound: 95,   // Bar + 25s each side
    isolation: 20,  // Light dumbbells
    cardio: 0,
    mobility: 0,
  };

  return defaults[category] || 45;
}

function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}
