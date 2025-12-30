/**
 * MoProfile - "Your Foundation"
 * Part of MO:SELF / MoIdentity
 *
 * "Your personal data, securely stored"
 *
 * Manages user profile data with encryption for sensitive fields.
 * All personal data (name, DOB, gender, body metrics, health info) is encrypted.
 */

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/security/encryption";

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;

  // Personal Info (encrypted)
  fullName: string | null;
  dateOfBirth: string | null; // ISO date string "YYYY-MM-DD"
  gender: "male" | "female" | "non_binary" | "prefer_not_to_say" | null;

  // Body Metrics (encrypted)
  heightCm: number | null;
  currentWeight: number | null;
  goalWeight: number | null;

  // Health & Safety (encrypted)
  injuryHistory: string | null; // Free text
  chronicConditions: string | null; // Free text
  medications: string | null; // Free text

  // Non-encrypted metadata
  units: "imperial" | "metric";
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileInput {
  fullName?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "non_binary" | "prefer_not_to_say";
  heightCm?: number;
  currentWeight?: number;
  goalWeight?: number;
  injuryHistory?: string;
  chronicConditions?: string;
  medications?: string;
  units?: "imperial" | "metric";
}

/**
 * Get user profile by user ID
 * Automatically decrypts encrypted fields
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return null;
  }

  return decryptProfileFromDb(user);
}

/**
 * Get user profile by Clerk ID
 * Automatically decrypts encrypted fields
 */
export async function getProfileByClerkId(clerkId: string): Promise<UserProfile | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    return null;
  }

  return decryptProfileFromDb(user);
}

/**
 * Update user profile
 * Automatically encrypts encrypted fields before saving
 */
export async function updateProfile(
  userId: string,
  updates: UpdateProfileInput
): Promise<UserProfile> {
  // Encrypt sensitive fields
  const encryptedUpdates = encryptProfileForDb(updates);

  // Non-encrypted updates
  const nonEncryptedUpdates: Record<string, any> = {};
  if (updates.units !== undefined) nonEncryptedUpdates.units = updates.units;

  // Update user
  await db
    .update(users)
    .set({
      ...encryptedUpdates,
      ...nonEncryptedUpdates,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  const profile = await getProfile(userId);
  if (!profile) {
    throw new Error("Failed to retrieve updated profile");
  }

  return profile;
}

/**
 * Helper: Encrypt profile data for database storage
 */
function encryptProfileForDb(profile: Partial<UpdateProfileInput>): Record<string, string | null> {
  const encrypted: Record<string, string | null> = {};

  // Personal Info
  if (profile.fullName !== undefined) {
    encrypted.fullName = profile.fullName ? encrypt(profile.fullName) : null;
  }
  if (profile.dateOfBirth !== undefined) {
    encrypted.dateOfBirth = profile.dateOfBirth ? encrypt(profile.dateOfBirth) : null;
  }
  if (profile.gender !== undefined) {
    encrypted.gender = profile.gender ? encrypt(profile.gender) : null;
  }

  // Body Metrics
  if (profile.heightCm !== undefined) {
    encrypted.heightCm = profile.heightCm ? encrypt(String(profile.heightCm)) : null;
  }
  if (profile.currentWeight !== undefined) {
    encrypted.currentWeight = profile.currentWeight ? encrypt(String(profile.currentWeight)) : null;
  }
  if (profile.goalWeight !== undefined) {
    encrypted.goalWeight = profile.goalWeight ? encrypt(String(profile.goalWeight)) : null;
  }

  // Health & Safety
  if (profile.injuryHistory !== undefined) {
    encrypted.injuryHistory = profile.injuryHistory ? encrypt(profile.injuryHistory) : null;
  }
  if (profile.chronicConditions !== undefined) {
    encrypted.chronicConditions = profile.chronicConditions ? encrypt(profile.chronicConditions) : null;
  }
  if (profile.medications !== undefined) {
    encrypted.medications = profile.medications ? encrypt(profile.medications) : null;
  }

  return encrypted;
}

/**
 * Helper: Decrypt profile data from database
 */
function decryptProfileFromDb(user: any): UserProfile {
  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,

    // Personal Info (decrypted)
    fullName: user.fullName ? decrypt(user.fullName) : null,
    dateOfBirth: user.dateOfBirth ? decrypt(user.dateOfBirth) : null,
    gender: user.gender ? (decrypt(user.gender) as UserProfile["gender"]) : null,

    // Body Metrics (decrypted)
    heightCm: user.heightCm ? Number(decrypt(user.heightCm)) : null,
    currentWeight: user.currentWeight ? Number(decrypt(user.currentWeight)) : null,
    goalWeight: user.goalWeight ? Number(decrypt(user.goalWeight)) : null,

    // Health & Safety (decrypted)
    injuryHistory: user.injuryHistory ? decrypt(user.injuryHistory) : null,
    chronicConditions: user.chronicConditions ? decrypt(user.chronicConditions) : null,
    medications: user.medications ? decrypt(user.medications) : null,

    // Non-encrypted metadata
    units: user.units || "imperial",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;

  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
