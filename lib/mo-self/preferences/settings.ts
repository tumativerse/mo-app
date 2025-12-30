/**
 * MoSettings - "The Customizer"
 * Part of MO:SELF / MoPrefs
 *
 * "I adapt to your needs"
 *
 * Manages user training preferences, equipment settings,
 * and workout customizations.
 *
 * NOTE: Encrypted fields are automatically encrypted/decrypted
 * using AES-256-GCM encryption from @/lib/security/encryption
 */

import { db } from "@/lib/db";
import { userPreferences, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/security/encryption";

export interface UserPreferences {
  // Training preferences (encrypted)
  fitnessGoal: string | null;
  experienceLevel: string | null;
  trainingFrequency: number;
  sessionDuration: number;
  focusAreas: string[] | null;
  preferredTrainingTimes: string[] | null; // NEW: ["morning", "afternoon", etc.]
  restDaysPreference: string[] | null; // NEW: ["sunday", "wednesday", etc.]

  // Equipment (encrypted)
  defaultEquipmentLevel: "full_gym" | "home_gym" | "bodyweight";
  availableEquipment: string[] | null;

  // Lifestyle (encrypted)
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null; // NEW
  occupationType: "desk_job" | "standing_job" | "physical_labor" | "mixed" | "student" | "retired" | "other" | null; // NEW
  typicalBedtime: string | null; // NEW: "22:30"
  typicalWakeTime: string | null; // NEW: "06:30"

  // Cardio preference (encrypted)
  preferredCardio: string | null;

  // App settings (NOT encrypted)
  warmupDuration: string;
  skipGeneralWarmup: boolean;
  includeMobilityWork: boolean;
  weightUnit: string;

  // Theme settings (NOT encrypted)
  theme: "light" | "dark";
  accentColor: string;
}

export interface UpdatePreferencesInput {
  // Training
  fitnessGoal?: string;
  experienceLevel?: string;
  trainingFrequency?: number;
  sessionDuration?: number;
  focusAreas?: string[];
  preferredTrainingTimes?: string[];
  restDaysPreference?: string[];

  // Equipment
  defaultEquipmentLevel?: "full_gym" | "home_gym" | "bodyweight";
  availableEquipment?: string[];

  // Lifestyle
  activityLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active";
  occupationType?: "desk_job" | "standing_job" | "physical_labor" | "mixed" | "student" | "retired" | "other";
  typicalBedtime?: string;
  typicalWakeTime?: string;

  // Cardio
  preferredCardio?: string;

  // App settings
  warmupDuration?: string;
  skipGeneralWarmup?: boolean;
  includeMobilityWork?: boolean;
  weightUnit?: string;

  // Theme settings
  theme?: "light" | "dark";
  accentColor?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  // Training
  fitnessGoal: null,
  experienceLevel: null,
  trainingFrequency: 6,
  sessionDuration: 75,
  focusAreas: null,
  preferredTrainingTimes: null,
  restDaysPreference: null,

  // Equipment
  defaultEquipmentLevel: "full_gym",
  availableEquipment: null,

  // Lifestyle
  activityLevel: null,
  occupationType: null,
  typicalBedtime: null,
  typicalWakeTime: null,

  // Cardio
  preferredCardio: null,

  // App settings
  warmupDuration: "normal",
  skipGeneralWarmup: false,
  includeMobilityWork: true,
  weightUnit: "lbs",

  // Theme settings
  theme: "dark",
  accentColor: "#10b981",
};

/**
 * Get user preferences, creating defaults if none exist
 * Automatically decrypts encrypted fields
 */
export async function getPreferences(userId: string): Promise<UserPreferences> {
  let prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  if (!prefs) {
    // Create default preferences (will be encrypted on insert)
    const encrypted = encryptPreferencesForDb(DEFAULT_PREFERENCES);
    [prefs] = await db
      .insert(userPreferences)
      .values({
        userId,
        ...encrypted,
        // Non-encrypted fields
        warmupDuration: DEFAULT_PREFERENCES.warmupDuration,
        skipGeneralWarmup: DEFAULT_PREFERENCES.skipGeneralWarmup,
        includeMobilityWork: DEFAULT_PREFERENCES.includeMobilityWork,
        weightUnit: DEFAULT_PREFERENCES.weightUnit,
      })
      .returning();
  }

  // Decrypt encrypted fields from database
  return decryptPreferencesFromDb(prefs);
}

/**
 * Helper: Encrypt preferences for database storage
 */
function encryptPreferencesForDb(prefs: Partial<UserPreferences>): Record<string, string | null> {
  return {
    // Training (encrypted)
    fitnessGoal: prefs.fitnessGoal ? encrypt(prefs.fitnessGoal) : null,
    experienceLevel: prefs.experienceLevel ? encrypt(prefs.experienceLevel) : null,
    trainingFrequency: prefs.trainingFrequency !== undefined ? encrypt(String(prefs.trainingFrequency)) : null,
    sessionDuration: prefs.sessionDuration !== undefined ? encrypt(String(prefs.sessionDuration)) : null,
    focusAreas: prefs.focusAreas ? encrypt(JSON.stringify(prefs.focusAreas)) : null,
    preferredTrainingTimes: prefs.preferredTrainingTimes ? encrypt(JSON.stringify(prefs.preferredTrainingTimes)) : null,
    restDaysPreference: prefs.restDaysPreference ? encrypt(JSON.stringify(prefs.restDaysPreference)) : null,

    // Equipment (encrypted)
    defaultEquipmentLevel: prefs.defaultEquipmentLevel ? encrypt(prefs.defaultEquipmentLevel) : null,
    availableEquipment: prefs.availableEquipment ? encrypt(JSON.stringify(prefs.availableEquipment)) : null,

    // Lifestyle (encrypted)
    activityLevel: prefs.activityLevel ? encrypt(prefs.activityLevel) : null,
    occupationType: prefs.occupationType ? encrypt(prefs.occupationType) : null,
    typicalBedtime: prefs.typicalBedtime ? encrypt(prefs.typicalBedtime) : null,
    typicalWakeTime: prefs.typicalWakeTime ? encrypt(prefs.typicalWakeTime) : null,

    // Cardio (encrypted)
    preferredCardio: prefs.preferredCardio ? encrypt(prefs.preferredCardio) : null,
  };
}

/**
 * Helper: Decrypt preferences from database
 */
function decryptPreferencesFromDb(prefs: any): UserPreferences {
  return {
    // Training (decrypted)
    fitnessGoal: prefs.fitnessGoal ? decrypt(prefs.fitnessGoal) : null,
    experienceLevel: prefs.experienceLevel ? decrypt(prefs.experienceLevel) : null,
    trainingFrequency: prefs.trainingFrequency ? Number(decrypt(prefs.trainingFrequency)) : 6,
    sessionDuration: prefs.sessionDuration ? Number(decrypt(prefs.sessionDuration)) : 75,
    focusAreas: prefs.focusAreas ? JSON.parse(decrypt(prefs.focusAreas)!) : null,
    preferredTrainingTimes: prefs.preferredTrainingTimes ? JSON.parse(decrypt(prefs.preferredTrainingTimes)!) : null,
    restDaysPreference: prefs.restDaysPreference ? JSON.parse(decrypt(prefs.restDaysPreference)!) : null,

    // Equipment (decrypted)
    defaultEquipmentLevel: prefs.defaultEquipmentLevel ? (decrypt(prefs.defaultEquipmentLevel) as UserPreferences["defaultEquipmentLevel"]) : "full_gym",
    availableEquipment: prefs.availableEquipment ? JSON.parse(decrypt(prefs.availableEquipment)!) : null,

    // Lifestyle (decrypted)
    activityLevel: prefs.activityLevel ? (decrypt(prefs.activityLevel) as UserPreferences["activityLevel"]) : null,
    occupationType: prefs.occupationType ? (decrypt(prefs.occupationType) as UserPreferences["occupationType"]) : null,
    typicalBedtime: prefs.typicalBedtime ? decrypt(prefs.typicalBedtime) : null,
    typicalWakeTime: prefs.typicalWakeTime ? decrypt(prefs.typicalWakeTime) : null,

    // Cardio (decrypted)
    preferredCardio: prefs.preferredCardio ? decrypt(prefs.preferredCardio) : null,

    // App settings (NOT encrypted)
    warmupDuration: prefs.warmupDuration || "normal",
    skipGeneralWarmup: prefs.skipGeneralWarmup || false,
    includeMobilityWork: prefs.includeMobilityWork !== undefined ? prefs.includeMobilityWork : true,
    weightUnit: prefs.weightUnit || "lbs",

    // Theme settings (NOT encrypted)
    theme: prefs.theme || "dark",
    accentColor: prefs.accentColor || "#10b981",
  };
}

/**
 * Update user preferences
 * Automatically encrypts encrypted fields before saving
 */
export async function updatePreferences(
  userId: string,
  updates: UpdatePreferencesInput
): Promise<UserPreferences> {
  // Separate encrypted and non-encrypted updates
  const encryptedUpdates = encryptPreferencesForDb(updates);

  const nonEncryptedUpdates: Record<string, any> = {};
  if (updates.warmupDuration !== undefined) nonEncryptedUpdates.warmupDuration = updates.warmupDuration;
  if (updates.skipGeneralWarmup !== undefined) nonEncryptedUpdates.skipGeneralWarmup = updates.skipGeneralWarmup;
  if (updates.includeMobilityWork !== undefined) nonEncryptedUpdates.includeMobilityWork = updates.includeMobilityWork;
  if (updates.weightUnit !== undefined) nonEncryptedUpdates.weightUnit = updates.weightUnit;
  if (updates.theme !== undefined) nonEncryptedUpdates.theme = updates.theme;
  if (updates.accentColor !== undefined) nonEncryptedUpdates.accentColor = updates.accentColor;

  // Ensure preferences record exists
  const existing = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  if (!existing) {
    // Create with defaults + updates (encrypted)
    const defaultsEncrypted = encryptPreferencesForDb(DEFAULT_PREFERENCES);
    await db.insert(userPreferences).values({
      userId,
      ...defaultsEncrypted,
      ...encryptedUpdates,
      ...nonEncryptedUpdates,
      warmupDuration: nonEncryptedUpdates.warmupDuration || DEFAULT_PREFERENCES.warmupDuration,
      skipGeneralWarmup: nonEncryptedUpdates.skipGeneralWarmup ?? DEFAULT_PREFERENCES.skipGeneralWarmup,
      includeMobilityWork: nonEncryptedUpdates.includeMobilityWork ?? DEFAULT_PREFERENCES.includeMobilityWork,
      weightUnit: nonEncryptedUpdates.weightUnit || DEFAULT_PREFERENCES.weightUnit,
      theme: nonEncryptedUpdates.theme || DEFAULT_PREFERENCES.theme,
      accentColor: nonEncryptedUpdates.accentColor || DEFAULT_PREFERENCES.accentColor,
      updatedAt: new Date(),
    });
  } else {
    // Update existing (encrypt updates)
    await db
      .update(userPreferences)
      .set({
        ...encryptedUpdates,
        ...nonEncryptedUpdates,
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
