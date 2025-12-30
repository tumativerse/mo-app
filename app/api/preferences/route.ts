import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getPreferences, updatePreferences } from "@/lib/mo-self";
import { z } from "zod";

// GET /api/preferences - Get user preferences
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await getPreferences(user.id);
    return NextResponse.json({ preferences });
  } catch (error) {
    // Check if this is a decryption error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isDecryptionError = errorMessage.includes("Failed to decrypt data");

    if (isDecryptionError) {
      // Log critical security error for monitoring
      console.error("CRITICAL: Preferences decryption failed", {
        userId: (await getCurrentUser())?.id,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          error: "Data integrity error",
          message: "Unable to read your preferences data. Please contact support.",
          code: "DECRYPTION_FAILED",
        },
        { status: 500 }
      );
    }

    // Generic error handling
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

const updatePreferencesSchema = z.object({
  // Training
  fitnessGoal: z.string().optional(),
  experienceLevel: z.string().optional(),
  trainingFrequency: z.number().min(1).max(7).optional(),
  sessionDuration: z.number().min(15).max(180).optional(),
  focusAreas: z.array(z.string()).optional(),
  preferredTrainingTimes: z.array(z.string()).optional(),
  restDaysPreference: z.array(z.string()).optional(),

  // Equipment
  defaultEquipmentLevel: z.enum(["full_gym", "home_gym", "bodyweight"]).optional(),
  availableEquipment: z.array(z.string()).optional(),

  // Lifestyle
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active"]).optional(),
  occupationType: z.enum(["desk_job", "standing_job", "physical_labor", "mixed", "student", "retired", "other"]).optional(),
  typicalBedtime: z.string().optional(), // "HH:mm" format
  typicalWakeTime: z.string().optional(), // "HH:mm" format

  // Cardio
  preferredCardio: z.string().optional(),

  // App settings
  warmupDuration: z.string().optional(),
  skipGeneralWarmup: z.boolean().optional(),
  includeMobilityWork: z.boolean().optional(),
  weightUnit: z.enum(["lbs", "kg"]).optional(),
});

// PATCH /api/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updatePreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const preferences = await updatePreferences(user.id, parsed.data);
    return NextResponse.json({ preferences });
  } catch (error) {
    // Check if this is a decryption error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isDecryptionError = errorMessage.includes("Failed to decrypt data");

    if (isDecryptionError) {
      // Log critical security error for monitoring
      console.error("CRITICAL: Preferences decryption failed during update", {
        userId: (await getCurrentUser())?.id,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          error: "Data integrity error",
          message: "Unable to read your existing preferences data. Please contact support.",
          code: "DECRYPTION_FAILED",
        },
        { status: 500 }
      );
    }

    // Generic error handling
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
