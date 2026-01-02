/**
 * Test Data Fixtures
 *
 * Shared test data for unit and E2E tests.
 */

export const mockUser = {
  id: 'test-user-id',
  clerkId: 'clerk-test-id',
  email: 'test@example.com',
  fullName: 'Test User',
  dateOfBirth: '1990-01-01',
  gender: 'prefer_not_to_say' as const,
  heightCm: 175,
  currentWeight: 75,
  goalWeight: 70,
  injuryHistory: null,
  chronicConditions: null,
  medications: null,
  units: 'metric' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockPreferences = {
  fitnessGoal: 'strength',
  experienceLevel: 'intermediate',
  trainingFrequency: 6,
  sessionDuration: 75,
  focusAreas: ['push', 'pull', 'legs'],
  preferredTrainingTimes: ['morning'],
  restDaysPreference: ['sunday'],
  defaultEquipmentLevel: 'full_gym' as const,
  availableEquipment: ['barbell', 'dumbbells', 'squat_rack'],
  activityLevel: 'moderately_active' as const,
  occupationType: 'desk_job' as const,
  typicalBedtime: '22:30',
  typicalWakeTime: '06:30',
  preferredCardio: 'treadmill',
  warmupDuration: 'normal',
  skipGeneralWarmup: false,
  includeMobilityWork: true,
  weightUnit: 'kg',
  theme: 'dark' as const,
  accentColor: '#10b981',
};

export const mockWorkoutSession = {
  id: 'test-session-id',
  userId: 'test-user-id',
  programId: 'test-program-id',
  templateDayId: 'test-day-id',
  status: 'in_progress' as const,
  startTime: new Date('2024-01-01T10:00:00Z'),
  endTime: null,
  notes: null,
  createdAt: new Date('2024-01-01'),
};
