/**
 * MoSettings - "The Customizer"
 * Part of MO:SELF / MoPrefs
 *
 * "I adapt to your needs"
 *
 * Manages user training preferences, equipment settings,
 * and workout customizations.
 */

import { db } from "@/lib/db";
import { userPreferences, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface UserPreferences {
  // Training preferences
  fitnessGoal: string | null;
  experienceLevel: string | null;
  trainingFrequency: number;
  sessionDuration: number;
  focusAreas: string[] | null;

  // Equipment
  defaultEquipmentLevel: "full_gym" | "home_gym" | "bodyweight";
  availableEquipment: string[] | null;

  // Workout preferences
  warmupDuration: string;
  skipGeneralWarmup: boolean;
  includeMobilityWork: boolean;
  preferredCardio: string | null;

  // Units
  weightUnit: string;
}

export interface UpdatePreferencesInput {
  fitnessGoal?: string;
  experienceLevel?: string;
  trainingFrequency?: number;
  sessionDuration?: number;
  focusAreas?: string[];
  defaultEquipmentLevel?: "full_gym" | "home_gym" | "bodyweight";
  availableEquipment?: string[];
  warmupDuration?: string;
  skipGeneralWarmup?: boolean;
  includeMobilityWork?: boolean;
  preferredCardio?: string;
  weightUnit?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  fitnessGoal: null,
  experienceLevel: null,
  trainingFrequency: 6,
  sessionDuration: 75,
  focusAreas: null,
  defaultEquipmentLevel: "full_gym",
  availableEquipment: null,
  warmupDuration: "normal",
  skipGeneralWarmup: false,
  includeMobilityWork: true,
  preferredCardio: null,
  weightUnit: "lbs",
};

/**
 * Get user preferences, creating defaults if none exist
 */
export async function getPreferences(userId: string): Promise<UserPreferences> {
  let prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  if (!prefs) {
    // Create default preferences
    [prefs] = await db
      .insert(userPreferences)
      .values({
        userId,
        ...DEFAULT_PREFERENCES,
      })
      .returning();
  }

  return {
    fitnessGoal: prefs.fitnessGoal,
    experienceLevel: prefs.experienceLevel,
    trainingFrequency: prefs.trainingFrequency!,
    sessionDuration: prefs.sessionDuration!,
    focusAreas: prefs.focusAreas,
    defaultEquipmentLevel: prefs.defaultEquipmentLevel as UserPreferences["defaultEquipmentLevel"],
    availableEquipment: prefs.availableEquipment,
    warmupDuration: prefs.warmupDuration!,
    skipGeneralWarmup: prefs.skipGeneralWarmup!,
    includeMobilityWork: prefs.includeMobilityWork!,
    preferredCardio: prefs.preferredCardio,
    weightUnit: prefs.weightUnit!,
  };
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  userId: string,
  updates: UpdatePreferencesInput
): Promise<UserPreferences> {
  // Ensure preferences record exists
  const existing = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  if (!existing) {
    // Create with defaults + updates
    await db.insert(userPreferences).values({
      userId,
      ...DEFAULT_PREFERENCES,
      ...updates,
      updatedAt: new Date(),
    });
  } else {
    // Update existing
    await db
      .update(userPreferences)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId));
  }

  return getPreferences(userId);
}

/**
 * Get equipment level for workouts
 */
export async function getEquipmentLevel(
  userId: string
): Promise<"full_gym" | "home_gym" | "bodyweight"> {
  const prefs = await getPreferences(userId);
  return prefs.defaultEquipmentLevel;
}

/**
 * Get user's preferred weight unit
 */
export async function getWeightUnit(userId: string): Promise<string> {
  const prefs = await getPreferences(userId);
  return prefs.weightUnit;
}

/**
 * Check if user prefers to skip warmup
 */
export async function shouldSkipWarmup(userId: string): Promise<boolean> {
  const prefs = await getPreferences(userId);
  return prefs.skipGeneralWarmup;
}

/**
 * Get user's available equipment list
 */
export async function getAvailableEquipment(
  userId: string
): Promise<string[] | null> {
  const prefs = await getPreferences(userId);
  return prefs.availableEquipment;
}

/**
 * Get training goals for weight suggestions
 */
export async function getTrainingGoals(
  userId: string
): Promise<{
  goal: string | null;
  experience: string | null;
  focusAreas: string[] | null;
}> {
  const prefs = await getPreferences(userId);
  return {
    goal: prefs.fitnessGoal,
    experience: prefs.experienceLevel,
    focusAreas: prefs.focusAreas,
  };
}
