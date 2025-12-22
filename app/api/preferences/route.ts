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
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

const updatePreferencesSchema = z.object({
  fitnessGoal: z.string().optional(),
  experienceLevel: z.string().optional(),
  trainingFrequency: z.number().min(1).max(7).optional(),
  sessionDuration: z.number().min(15).max(180).optional(),
  focusAreas: z.array(z.string()).optional(),
  defaultEquipmentLevel: z.enum(["full_gym", "home_gym", "bodyweight"]).optional(),
  availableEquipment: z.array(z.string()).optional(),
  warmupDuration: z.string().optional(),
  skipGeneralWarmup: z.boolean().optional(),
  includeMobilityWork: z.boolean().optional(),
  preferredCardio: z.string().optional(),
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
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
