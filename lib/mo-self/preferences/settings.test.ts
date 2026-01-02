import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPreferences,
  updatePreferences,
  getAvailableEquipment,
  getTrainingGoals,
} from './settings';
import * as dbModule from '@/lib/db';
import * as encryptionModule from '@/lib/security/encryption';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      userPreferences: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/security/encryption', () => ({
  encrypt: vi.fn((value: string) => `encrypted:${value}`),
  decrypt: vi.fn((value: string) => value.replace('encrypted:', '')),
}));

describe('MoSettings', () => {
  const mockUserId = 'user_123';
  const mockDb = dbModule.db as unknown as {
    query: { userPreferences: { findFirst: ReturnType<typeof vi.fn> } };
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('should return decrypted preferences for existing user', async () => {
      const mockDbPrefs = {
        id: 1,
        userId: mockUserId,
        fitnessGoal: 'encrypted:strength',
        experienceLevel: 'encrypted:intermediate',
        trainingFrequency: 'encrypted:4',
        sessionDuration: 'encrypted:60',
        focusAreas: 'encrypted:["chest","back"]',
        preferredTrainingTimes: 'encrypted:["morning"]',
        restDaysPreference: 'encrypted:["sunday"]',
        defaultEquipmentLevel: 'encrypted:full_gym',
        availableEquipment: 'encrypted:["barbell","dumbbells"]',
        activityLevel: 'encrypted:moderately_active',
        occupationType: 'encrypted:desk_job',
        typicalBedtime: 'encrypted:22:30',
        typicalWakeTime: 'encrypted:06:30',
        preferredCardio: 'encrypted:running',
        warmupDuration: '5',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'lbs',
        theme: 'dark',
        accentColor: '#10b981',
      };

      mockDb.query.userPreferences.findFirst.mockResolvedValue(mockDbPrefs);

      const result = await getPreferences(mockUserId);

      expect(result).toEqual({
        fitnessGoal: 'strength',
        experienceLevel: 'intermediate',
        trainingFrequency: 4,
        sessionDuration: 60,
        focusAreas: ['chest', 'back'],
        preferredTrainingTimes: ['morning'],
        restDaysPreference: ['sunday'],
        defaultEquipmentLevel: 'full_gym',
        availableEquipment: ['barbell', 'dumbbells'],
        activityLevel: 'moderately_active',
        occupationType: 'desk_job',
        typicalBedtime: '22:30',
        typicalWakeTime: '06:30',
        preferredCardio: 'running',
        warmupDuration: '5',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'lbs',
        theme: 'dark',
        accentColor: '#10b981',
      });
    });

    it('should create default preferences for new user', async () => {
      mockDb.query.userPreferences.findFirst.mockResolvedValue(null);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              userId: mockUserId,
              fitnessGoal: null,
              experienceLevel: null,
              trainingFrequency: 'encrypted:3',
              sessionDuration: 'encrypted:60',
              focusAreas: null,
              preferredTrainingTimes: null,
              restDaysPreference: null,
              defaultEquipmentLevel: 'encrypted:full_gym',
              availableEquipment: null,
              activityLevel: null,
              occupationType: null,
              typicalBedtime: null,
              typicalWakeTime: null,
              preferredCardio: null,
              warmupDuration: '5',
              skipGeneralWarmup: false,
              includeMobilityWork: true,
              weightUnit: 'lbs',
              theme: 'dark',
              accentColor: '#10b981',
            },
          ]),
        }),
      });

      const result = await getPreferences(mockUserId);

      expect(result.trainingFrequency).toBe(3);
      expect(result.sessionDuration).toBe(60);
      expect(result.defaultEquipmentLevel).toBe('full_gym');
    });

    it('should handle missing optional fields gracefully', async () => {
      mockDb.query.userPreferences.findFirst.mockResolvedValue({
        userId: mockUserId,
        fitnessGoal: null,
        experienceLevel: null,
        trainingFrequency: 'encrypted:4',
        sessionDuration: 'encrypted:60',
        focusAreas: null,
        preferredTrainingTimes: null,
        restDaysPreference: null,
        defaultEquipmentLevel: 'encrypted:bodyweight',
        availableEquipment: null,
        activityLevel: null,
        occupationType: null,
        typicalBedtime: null,
        typicalWakeTime: null,
        preferredCardio: null,
        warmupDuration: '5',
        skipGeneralWarmup: false,
        includeMobilityWork: false,
        weightUnit: 'kg',
        theme: 'light',
        accentColor: '#3b82f6',
      });

      const result = await getPreferences(mockUserId);

      expect(result.fitnessGoal).toBeNull();
      expect(result.focusAreas).toBeNull();
      expect(result.weightUnit).toBe('kg');
      expect(result.theme).toBe('light');
    });
  });

  describe('updatePreferences', () => {
    it('should encrypt sensitive fields before updating', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{}]),
          }),
        }),
      });

      mockDb.update = mockUpdate;
      mockDb.query.userPreferences.findFirst.mockResolvedValue({
        userId: mockUserId,
        fitnessGoal: 'encrypted:muscle_building',
        trainingFrequency: 'encrypted:5',
        sessionDuration: 'encrypted:60',
        defaultEquipmentLevel: 'encrypted:full_gym',
        warmupDuration: '10',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'kg',
        theme: 'dark',
        accentColor: '#10b981',
      });

      const updates = {
        fitnessGoal: 'muscle_building',
        trainingFrequency: 5,
      };

      await updatePreferences(mockUserId, updates);

      // Verify encryption was called for sensitive fields
      expect(encryptionModule.encrypt).toHaveBeenCalledWith('muscle_building');
      expect(encryptionModule.encrypt).toHaveBeenCalledWith('5');
    });

    it('should handle numeric zero values correctly', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{}]),
          }),
        }),
      });

      mockDb.update = mockUpdate;
      mockDb.query.userPreferences.findFirst.mockResolvedValue({
        userId: mockUserId,
        trainingFrequency: 'encrypted:0',
        sessionDuration: 'encrypted:45',
        defaultEquipmentLevel: 'encrypted:full_gym',
        warmupDuration: '5',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'lbs',
        theme: 'dark',
        accentColor: '#10b981',
      });

      const updates = {
        trainingFrequency: 0, // Test 0 value (falsy but valid)
        sessionDuration: 45,
      };

      await updatePreferences(mockUserId, updates);

      // Should encrypt even 0 values (using != null check, not truthy check)
      expect(encryptionModule.encrypt).toHaveBeenCalledWith('0');
      expect(encryptionModule.encrypt).toHaveBeenCalledWith('45');
    });

    it('should handle array fields by JSON stringifying', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{}]),
          }),
        }),
      });

      mockDb.update = mockUpdate;
      mockDb.query.userPreferences.findFirst.mockResolvedValue({
        userId: mockUserId,
        focusAreas: 'encrypted:["legs","shoulders"]',
        availableEquipment: 'encrypted:["kettlebells","bands"]',
        trainingFrequency: 'encrypted:4',
        sessionDuration: 'encrypted:60',
        defaultEquipmentLevel: 'encrypted:full_gym',
        warmupDuration: '5',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'lbs',
        theme: 'dark',
        accentColor: '#10b981',
      });

      const updates = {
        focusAreas: ['legs', 'shoulders'],
        availableEquipment: ['kettlebells', 'bands'],
      };

      await updatePreferences(mockUserId, updates);

      // Arrays should be JSON stringified before encryption
      expect(encryptionModule.encrypt).toHaveBeenCalledWith(JSON.stringify(['legs', 'shoulders']));
      expect(encryptionModule.encrypt).toHaveBeenCalledWith(
        JSON.stringify(['kettlebells', 'bands'])
      );
    });
  });

  describe('getAvailableEquipment', () => {
    it('should return decrypted equipment list', async () => {
      mockDb.query.userPreferences.findFirst.mockResolvedValue({
        availableEquipment: 'encrypted:["barbell","dumbbells","bench"]',
      });

      const result = await getAvailableEquipment(mockUserId);

      expect(result).toEqual(['barbell', 'dumbbells', 'bench']);
    });

    it('should return null when no equipment set', async () => {
      mockDb.query.userPreferences.findFirst.mockResolvedValue({
        availableEquipment: null,
      });

      const result = await getAvailableEquipment(mockUserId);

      expect(result).toBeNull();
    });

    it('should return null when user has no preferences (creates defaults)', async () => {
      mockDb.query.userPreferences.findFirst.mockResolvedValue(null);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              userId: mockUserId,
              availableEquipment: null,
              trainingFrequency: 'encrypted:3',
              sessionDuration: 'encrypted:60',
              defaultEquipmentLevel: 'encrypted:full_gym',
              warmupDuration: '5',
              skipGeneralWarmup: false,
              includeMobilityWork: true,
              weightUnit: 'lbs',
              theme: 'dark',
              accentColor: '#10b981',
            },
          ]),
        }),
      });

      const result = await getAvailableEquipment(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('getTrainingGoals', () => {
    it('should return fitness goal and experience level', async () => {
      mockDb.query.userPreferences.findFirst.mockResolvedValue({
        fitnessGoal: 'encrypted:strength',
        experienceLevel: 'encrypted:advanced',
        focusAreas: 'encrypted:["chest","back"]',
        trainingFrequency: 'encrypted:4',
        sessionDuration: 'encrypted:60',
        defaultEquipmentLevel: 'encrypted:full_gym',
        warmupDuration: '5',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'lbs',
        theme: 'dark',
        accentColor: '#10b981',
      });

      const result = await getTrainingGoals(mockUserId);

      expect(result).toEqual({
        goal: 'strength',
        experience: 'advanced',
        focusAreas: ['chest', 'back'],
      });
    });

    it('should return nulls when not set', async () => {
      mockDb.query.userPreferences.findFirst.mockResolvedValue({
        fitnessGoal: null,
        experienceLevel: null,
        focusAreas: null,
        trainingFrequency: 'encrypted:3',
        sessionDuration: 'encrypted:60',
        defaultEquipmentLevel: 'encrypted:full_gym',
        warmupDuration: '5',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'lbs',
        theme: 'dark',
        accentColor: '#10b981',
      });

      const result = await getTrainingGoals(mockUserId);

      expect(result).toEqual({
        goal: null,
        experience: null,
        focusAreas: null,
      });
    });

    it('should create default prefs and return nulls when user has no preferences', async () => {
      mockDb.query.userPreferences.findFirst.mockResolvedValue(null);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              userId: mockUserId,
              fitnessGoal: null,
              experienceLevel: null,
              focusAreas: null,
              trainingFrequency: 'encrypted:3',
              sessionDuration: 'encrypted:60',
              defaultEquipmentLevel: 'encrypted:full_gym',
              warmupDuration: '5',
              skipGeneralWarmup: false,
              includeMobilityWork: true,
              weightUnit: 'lbs',
              theme: 'dark',
              accentColor: '#10b981',
            },
          ]),
        }),
      });

      const result = await getTrainingGoals(mockUserId);

      expect(result).toEqual({
        goal: null,
        experience: null,
        focusAreas: null,
      });
    });
  });
});
