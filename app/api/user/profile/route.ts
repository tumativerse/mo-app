import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getProfile, updateProfile } from '@/lib/mo-self';
import { z } from 'zod';

// GET /api/user/profile - Get user profile
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getProfile(user.id);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    // Check if this is a decryption error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isDecryptionError = errorMessage.includes('Failed to decrypt data');

    if (isDecryptionError) {
      // Log critical security error for monitoring
      console.error('CRITICAL: Profile decryption failed', {
        userId: (await getCurrentUser())?.id,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          error: 'Data integrity error',
          message: 'Unable to read your profile data. Please contact support.',
          code: 'DECRYPTION_FAILED',
        },
        { status: 500 }
      );
    }

    // Generic error handling
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

const updateProfileSchema = z.object({
  // Personal Info
  fullName: z.string().min(1).max(255).optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // YYYY-MM-DD
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']).optional(),

  // Body Metrics
  heightCm: z.number().min(50).max(300).optional(), // 50cm to 300cm (1'8" to 9'10")
  currentWeight: z.number().min(20).max(500).optional(), // 20kg to 500kg (44lbs to 1100lbs)
  goalWeight: z.number().min(20).max(500).optional(),

  // Health & Safety
  injuryHistory: z.string().max(1000).optional(),
  chronicConditions: z.string().max(1000).optional(),
  medications: z.string().max(1000).optional(),

  // Preferences
  units: z.enum(['imperial', 'metric']).optional(),
});

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const profile = await updateProfile(user.id, parsed.data);
    return NextResponse.json({ profile });
  } catch (error) {
    // Check if this is a decryption error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isDecryptionError = errorMessage.includes('Failed to decrypt data');

    if (isDecryptionError) {
      // Log critical security error for monitoring
      console.error('CRITICAL: Profile decryption failed during update', {
        userId: (await getCurrentUser())?.id,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          error: 'Data integrity error',
          message: 'Unable to read your existing profile data. Please contact support.',
          code: 'DECRYPTION_FAILED',
        },
        { status: 500 }
      );
    }

    // Generic error handling
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
