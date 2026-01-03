import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as moSelfModule from '@/lib/mo-self';
import * as dbModule from '@/lib/db';

// Mock dependencies
vi.mock('@/lib/mo-self', () => ({
  getCurrentUser: vi.fn(),
  updateProfile: vi.fn(),
  updatePreferences: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    update: vi.fn(),
  },
}));

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(() =>
    Promise.resolve({
      users: {
        updateUserMetadata: vi.fn(),
      },
    })
  ),
}));

describe('/api/onboarding', () => {
  const mockUser = {
    id: 'user_123',
    clerkId: 'clerk_123',
    email: 'test@example.com',
    fullName: null,
    dateOfBirth: null,
    gender: null,
    heightCm: null,
    currentWeight: null,
    goalWeight: null,
    injuryHistory: null,
    chronicConditions: null,
    medications: null,
    units: null,
    experience: null,
    fitnessGoal: null,
    availableEquipment: null,
    onboardingCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const validOnboardingData = {
    fullName: 'John Doe',
    preferredName: 'John',
    dateOfBirth: '1990-01-15',
    gender: 'male' as const,
    heightCm: 180,
    weightKg: 75,
    unitSystem: 'metric' as const,
    fitnessGoals: ['get_stronger', 'lose_weight'], // Updated to new goal values
    experienceLevel: 'intermediate' as const,
    trainingTimes: ['morning', 'evening'], // Now optional
    restDaysPerWeek: 2, // Now optional
    equipmentLevel: 'full_gym' as const,
    availableEquipment: ['barbell', 'dumbbells', 'squat_rack'],
    activityLevel: 'moderately_active' as const,
    sleepHours: 7,
    stressLevel: 'moderate' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock for database update chain
    const whereMock = vi.fn().mockResolvedValue(undefined);
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    const updateMock = vi.fn().mockReturnValue({ set: setMock });
    vi.mocked(dbModule.db.update).mockImplementation(updateMock as never);
  });

  describe('POST /api/onboarding', () => {
    it('should successfully complete onboarding with valid data', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockResolvedValue(undefined as never);
      vi.mocked(moSelfModule.updatePreferences).mockResolvedValue(undefined as never);

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(validOnboardingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Onboarding completed successfully');

      // Verify updateProfile was called with correct data
      expect(moSelfModule.updateProfile).toHaveBeenCalledWith(mockUser.id, {
        fullName: 'John Doe',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        heightCm: 180,
        currentWeight: 75,
        units: 'metric',
      });

      // Verify updatePreferences was called
      expect(moSelfModule.updatePreferences).toHaveBeenCalledWith(mockUser.id, {
        fitnessGoal: JSON.stringify(['get_stronger', 'lose_weight']),
        experienceLevel: 'intermediate',
        preferredTrainingTimes: ['morning', 'evening'],
        restDaysPreference: ['2'],
        defaultEquipmentLevel: 'full_gym',
        availableEquipment: ['barbell', 'dumbbells', 'squat_rack'],
        activityLevel: 'moderately_active',
        weightUnit: 'kg',
      });

      // Verify database was updated
      expect(dbModule.db.update).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated user', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(validOnboardingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(moSelfModule.updateProfile).not.toHaveBeenCalled();
      expect(moSelfModule.updatePreferences).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid data - missing required field', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const invalidData = { ...validOnboardingData };
      delete (invalidData as Partial<typeof validOnboardingData>).fullName;

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid onboarding data');
      expect(data.details).toBeDefined();
      expect(moSelfModule.updateProfile).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid data - wrong date format', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const invalidData = {
        ...validOnboardingData,
        dateOfBirth: '01/15/1990', // Wrong format, should be YYYY-MM-DD
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid onboarding data');
      expect(moSelfModule.updateProfile).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid data - invalid gender', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const invalidData = {
        ...validOnboardingData,
        gender: 'other', // Not in enum
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid onboarding data');
    });

    it('should return 400 for invalid data - height out of range', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const invalidData = {
        ...validOnboardingData,
        heightCm: 400, // Too tall
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid onboarding data');
    });

    it('should map extremely_active to very_active for database compatibility', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockResolvedValue(undefined as never);
      vi.mocked(moSelfModule.updatePreferences).mockResolvedValue(undefined as never);

      const dataWithExtremelyActive = {
        ...validOnboardingData,
        activityLevel: 'extremely_active' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(dataWithExtremelyActive),
      });

      const response = await POST(request);
      await response.json();

      expect(response.status).toBe(200);

      // Verify activityLevel was mapped
      expect(moSelfModule.updatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          activityLevel: 'very_active', // Mapped from extremely_active
        })
      );
    });

    it('should handle imperial units correctly', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockResolvedValue(undefined as never);
      vi.mocked(moSelfModule.updatePreferences).mockResolvedValue(undefined as never);

      const imperialData = {
        ...validOnboardingData,
        unitSystem: 'imperial' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(imperialData),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);

      // Verify weightUnit was set to lbs for imperial
      expect(moSelfModule.updatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          weightUnit: 'lbs',
        })
      );
    });

    it('should handle empty available equipment for bodyweight training', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockResolvedValue(undefined as never);
      vi.mocked(moSelfModule.updatePreferences).mockResolvedValue(undefined as never);

      const bodyweightData = {
        ...validOnboardingData,
        equipmentLevel: 'bodyweight' as const,
        availableEquipment: [],
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(bodyweightData),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);

      // Verify availableEquipment is undefined (not passed) when empty
      expect(moSelfModule.updatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          availableEquipment: undefined,
        })
      );
    });

    it('should handle missing optional training fields (trainingTimes and restDaysPerWeek)', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockResolvedValue(undefined as never);
      vi.mocked(moSelfModule.updatePreferences).mockResolvedValue(undefined as never);

      const dataWithoutOptionalFields = {
        ...validOnboardingData,
      };
      delete (dataWithoutOptionalFields as Partial<typeof validOnboardingData>).trainingTimes;
      delete (dataWithoutOptionalFields as Partial<typeof validOnboardingData>).restDaysPerWeek;

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(dataWithoutOptionalFields),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);

      // Verify optional fields default to empty arrays
      expect(moSelfModule.updatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          preferredTrainingTimes: [],
          restDaysPreference: [],
        })
      );
    });

    it('should return 500 on database error', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(validOnboardingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to complete onboarding');
      expect(data.details).toBe('Database connection failed');
    });

    it('should return 500 on Clerk API error', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockResolvedValue(undefined as never);
      vi.mocked(moSelfModule.updatePreferences).mockResolvedValue(undefined as never);

      // Mock Clerk client to throw error
      const { clerkClient } = await import('@clerk/nextjs/server');
      vi.mocked(clerkClient).mockRejectedValue(new Error('Clerk API error'));

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(validOnboardingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to complete onboarding');
    });

    it('should return 500 with "Unknown error" for non-Error exceptions', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockRejectedValue('String error' as never);

      const request = new NextRequest('http://localhost:3000/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(validOnboardingData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to complete onboarding');
      expect(data.details).toBe('Unknown error');
    });
  });
});
