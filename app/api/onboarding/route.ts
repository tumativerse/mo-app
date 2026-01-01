import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, updateProfile, updatePreferences } from '@/lib/mo-self';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Onboarding Data Schema
 * Validates all data collected across 5 onboarding steps
 */
const onboardingSchema = z.object({
  // Step 1: Profile
  fullName: z.string().min(1).max(255),
  preferredName: z.string().min(1).max(100).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']),
  heightCm: z.number().min(50).max(300),
  weightKg: z.number().min(20).max(500),
  unitSystem: z.enum(['metric', 'imperial']),

  // Step 2: Training
  fitnessGoals: z.array(z.string()).min(1), // Array of goals
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  trainingTimes: z.array(z.string()).min(1), // Array of preferred training times
  restDaysPerWeek: z.number().min(1).max(7),

  // Step 3: Equipment
  equipmentLevel: z.enum(['full_gym', 'home_gym', 'bodyweight']),
  availableEquipment: z.array(z.string()), // Can be empty for bodyweight

  // Step 4: Lifestyle
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']),
  sleepHours: z.number().min(3).max(12),
  stressLevel: z.enum(['low', 'moderate', 'high']),

  // Step 5: Preferences
  theme: z.enum(['light', 'dark']),
});

/**
 * Map fitness goals from onboarding to primary fitness goal enum
 * Takes user's goal priorities and selects the primary one
 */
function mapPrimaryFitnessGoal(goals: string[]): string {
  // Priority order: strength > build_muscle > lose_fat > recomp > general
  const goalMap: Record<string, string> = {
    strength: 'strength',
    muscle: 'build_muscle',
    weight_loss: 'lose_fat',
    endurance: 'general', // Endurance maps to general fitness
    general_fitness: 'general',
    athletic_performance: 'strength', // Athletic performance maps to strength
  };

  // Find first matching goal in priority order
  for (const priorityGoal of ['strength', 'muscle', 'weight_loss', 'general_fitness', 'endurance', 'athletic_performance']) {
    if (goals.includes(priorityGoal)) {
      return goalMap[priorityGoal];
    }
  }

  return 'general'; // Default fallback
}

/**
 * Map activity level from onboarding (includes "extremely_active") to database enum
 */
function mapActivityLevel(level: string): 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' {
  if (level === 'extremely_active') {
    return 'very_active'; // Map "extremely_active" to "very_active" for database
  }
  return level as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
}

/**
 * POST /api/onboarding
 * Save all onboarding data (profile + preferences)
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid onboarding data',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Step 1: Update user profile (encrypted personal data)
    await updateProfile(user.id, {
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      heightCm: data.heightCm,
      currentWeight: data.weightKg,
      units: data.unitSystem,
    });

    // Step 2-5: Update user preferences (encrypted training data)
    await updatePreferences(user.id, {
      // Training preferences (Step 2)
      fitnessGoal: JSON.stringify(data.fitnessGoals), // Store full array as JSON
      experienceLevel: data.experienceLevel,
      preferredTrainingTimes: data.trainingTimes,
      restDaysPreference: [String(data.restDaysPerWeek)], // Store as array for consistency

      // Equipment preferences (Step 3)
      defaultEquipmentLevel: data.equipmentLevel,
      availableEquipment: data.availableEquipment.length > 0 ? data.availableEquipment : undefined,

      // Lifestyle preferences (Step 4)
      activityLevel: mapActivityLevel(data.activityLevel),
      // Note: sleepHours and stressLevel could be added to preferences or used for initial recovery log

      // App preferences (Step 5)
      theme: data.theme,
      weightUnit: data.unitSystem === 'metric' ? 'kg' : 'lbs',
    });

    // Mark onboarding as completed
    await db
      .update(users)
      .set({
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      {
        success: true,
        message: 'Onboarding completed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to complete onboarding',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
