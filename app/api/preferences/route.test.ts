import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH } from './route';
import * as moSelfModule from '@/lib/mo-self';

// Mock dependencies
vi.mock('@/lib/mo-self', () => ({
  getCurrentUser: vi.fn(),
  getPreferences: vi.fn(),
  updatePreferences: vi.fn(),
}));

describe('/api/preferences', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/preferences', () => {
    it('should return preferences for authenticated user', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.getPreferences).mockResolvedValue({
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
        warmupDuration: 'normal',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'lbs',
        theme: 'dark',
        accentColor: '#10b981',
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.preferences).toEqual({
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
        warmupDuration: 'normal',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'lbs',
        theme: 'dark',
        accentColor: '#10b981',
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle decryption errors with specific error code', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.getPreferences).mockRejectedValue(
        new Error('Failed to decrypt data: Invalid encryption key')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Data integrity error');
      expect(data.code).toBe('DECRYPTION_FAILED');
      expect(data.message).toContain('contact support');
    });

    it('should handle generic errors', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.getPreferences).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch preferences');
    });
  });

  describe('PATCH /api/preferences', () => {
    it('should update preferences with valid data', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updatePreferences).mockResolvedValue({
        fitnessGoal: 'muscle_building',
        experienceLevel: 'beginner',
        trainingFrequency: 5,
        sessionDuration: 75,
        focusAreas: null,
        preferredTrainingTimes: null,
        restDaysPreference: null,
        defaultEquipmentLevel: 'full_gym',
        availableEquipment: null,
        activityLevel: null,
        occupationType: null,
        typicalBedtime: null,
        typicalWakeTime: null,
        preferredCardio: null,
        warmupDuration: 'normal',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'lbs',
        theme: 'dark',
        accentColor: '#10b981',
      });

      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          fitnessGoal: 'muscle_building',
          experienceLevel: 'beginner',
          trainingFrequency: 5,
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.preferences.fitnessGoal).toBe('muscle_building');
      expect(moSelfModule.updatePreferences).toHaveBeenCalledWith(mockUser.id, {
        fitnessGoal: 'muscle_building',
        experienceLevel: 'beginner',
        trainingFrequency: 5,
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ fitnessGoal: 'strength' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid trainingFrequency (too low)', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ trainingFrequency: 0 }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
      expect(data.details).toBeDefined();
    });

    it('should return 400 for invalid trainingFrequency (too high)', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ trainingFrequency: 8 }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
    });

    it('should return 400 for invalid sessionDuration (too short)', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ sessionDuration: 10 }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
    });

    it('should return 400 for invalid equipmentLevel', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ defaultEquipmentLevel: 'invalid_level' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
    });

    it('should return 400 for invalid accentColor format', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ accentColor: 'invalid-color' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
    });

    it('should accept valid hex color', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updatePreferences).mockResolvedValue({
        fitnessGoal: null,
        experienceLevel: null,
        trainingFrequency: 4,
        sessionDuration: 60,
        focusAreas: null,
        preferredTrainingTimes: null,
        restDaysPreference: null,
        defaultEquipmentLevel: 'full_gym',
        availableEquipment: null,
        activityLevel: null,
        occupationType: null,
        typicalBedtime: null,
        typicalWakeTime: null,
        preferredCardio: null,
        warmupDuration: 'normal',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'lbs',
        theme: 'light',
        accentColor: '#3b82f6',
      });

      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ theme: 'light', accentColor: '#3b82f6' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.preferences.theme).toBe('light');
      expect(data.preferences.accentColor).toBe('#3b82f6');
    });

    it('should handle decryption errors during update', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updatePreferences).mockRejectedValue(
        new Error('Failed to decrypt data: Corrupted encryption')
      );

      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ fitnessGoal: 'strength' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Data integrity error');
      expect(data.code).toBe('DECRYPTION_FAILED');
    });

    it('should handle generic errors during update', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updatePreferences).mockRejectedValue(
        new Error('Database write failed')
      );

      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ fitnessGoal: 'strength' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update preferences');
    });

    it('should accept array fields', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updatePreferences).mockResolvedValue({
        fitnessGoal: null,
        experienceLevel: null,
        trainingFrequency: 4,
        sessionDuration: 60,
        focusAreas: ['chest', 'legs'],
        preferredTrainingTimes: ['morning', 'evening'],
        restDaysPreference: ['sunday', 'wednesday'],
        defaultEquipmentLevel: 'full_gym',
        availableEquipment: ['barbell', 'dumbbells', 'bench'],
        activityLevel: null,
        occupationType: null,
        typicalBedtime: null,
        typicalWakeTime: null,
        preferredCardio: null,
        warmupDuration: 'normal',
        skipGeneralWarmup: false,
        includeMobilityWork: true,
        weightUnit: 'lbs',
        theme: 'dark',
        accentColor: '#10b981',
      });

      const request = new NextRequest('http://localhost:3000/api/preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          focusAreas: ['chest', 'legs'],
          preferredTrainingTimes: ['morning', 'evening'],
          restDaysPreference: ['sunday', 'wednesday'],
          availableEquipment: ['barbell', 'dumbbells', 'bench'],
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.preferences.focusAreas).toEqual(['chest', 'legs']);
      expect(data.preferences.preferredTrainingTimes).toEqual(['morning', 'evening']);
    });
  });
});
