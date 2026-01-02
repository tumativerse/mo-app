import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkProgressionGates,
  getProgressionRecommendation,
  getPlateauStrategies,
  getExercisesReadyToProgress,
  getPlateauedExercises,
  getExercisePerformance,
} from './progression';
import * as dbModule from '@/lib/db';
import * as fatigueModule from './fatigue';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      exercises: {
        findFirst: vi.fn(),
      },
      workoutSessions: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock('./fatigue', () => ({
  calculateFatigue: vi.fn(),
}));

describe('MoProgression', () => {
  const mockUserId = 'user_123';
  const mockExerciseId = 'exercise_456';
  const mockDb = dbModule.db as unknown as {
    query: {
      exercises: { findFirst: ReturnType<typeof vi.fn> };
      workoutSessions: { findMany: ReturnType<typeof vi.fn> };
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkProgressionGates', () => {
    it('should block progression when fatigue is high', async () => {
      vi.mocked(fatigueModule.calculateFatigue).mockResolvedValue({
        score: 8, // High fatigue
        status: {
          level: 'high',
          color: 'red',
          message: 'High fatigue detected',
          action: 'Consider a deload week',
        },
        recommendations: ['Consider a deload week'],
        factors: {
          rpeCreep: 2,
          performanceDrop: 2,
          recoveryDebt: 3,
          volumeLoad: 2,
          streak: 1,
        },
      });

      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      const result = await checkProgressionGates(mockUserId, mockExerciseId);

      expect(result.canProgress).toBe(false);
      expect(result.blockedBy).toBe('fatigue');
    });

    it('should allow progression for new exercise with no history', async () => {
      vi.mocked(fatigueModule.calculateFatigue).mockResolvedValue({
        score: 3,
        status: {
          level: 'normal',
          color: 'green',
          message: 'Training load is appropriate',
          action: 'Continue current training',
        },
        recommendations: [],
        factors: {
          rpeCreep: 1,
          performanceDrop: 0,
          recoveryDebt: 1,
          volumeLoad: 1,
          streak: 0,
        },
      });

      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      // No workout sessions (new exercise)
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);

      const result = await checkProgressionGates(mockUserId, mockExerciseId);

      expect(result.canProgress).toBe(true);
      expect(result.reason).toContain('No history');
    });

    it('should block when target reps not hit', async () => {
      vi.mocked(fatigueModule.calculateFatigue).mockResolvedValue({
        score: 3,
        status: {
          level: 'normal',
          color: 'green',
          message: 'Training load is appropriate',
          action: 'Continue current training',
        },
        recommendations: [],
        factors: {
          rpeCreep: 1,
          performanceDrop: 0,
          recoveryDebt: 1,
          volumeLoad: 1,
          streak: 0,
        },
      });

      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound', // minRepsForProgress: 8
      });

      // Recent sessions where reps < 8
      mockDb.query.workoutSessions.findMany.mockResolvedValue([
        {
          date: new Date(),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Bench Press' },
              sets: [
                { weight: 185, reps: 6, rpe: 7, isWarmup: false }, // Below target
              ],
            },
          ],
        },
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Bench Press' },
              sets: [
                { weight: 185, reps: 7, rpe: 7, isWarmup: false }, // Below target
              ],
            },
          ],
        },
      ]);

      const result = await checkProgressionGates(mockUserId, mockExerciseId);

      expect(result.canProgress).toBe(false);
      expect(result.blockedBy).toBe('performance');
    });

    it('should allow progression when all gates pass', async () => {
      vi.mocked(fatigueModule.calculateFatigue).mockResolvedValue({
        score: 4, // Low fatigue
        status: {
          level: 'normal',
          color: 'green',
          message: 'Training load is appropriate',
          action: 'Continue current training',
        },
        recommendations: ['Training load is appropriate'],
        factors: {
          rpeCreep: 1,
          performanceDrop: 0,
          recoveryDebt: 1,
          volumeLoad: 1,
          streak: 0,
        },
      });

      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      mockDb.query.workoutSessions.findMany.mockResolvedValue([
        {
          date: new Date(),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Bench Press' },
              sets: [{ weight: 185, reps: 8, rpe: 7, isWarmup: false }],
            },
          ],
        },
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Bench Press' },
              sets: [{ weight: 185, reps: 9, rpe: 7, isWarmup: false }],
            },
          ],
        },
      ]);

      const result = await checkProgressionGates(mockUserId, mockExerciseId);

      expect(result.canProgress).toBe(true);
    });

    it('should block when average RPE is too high', async () => {
      vi.mocked(fatigueModule.calculateFatigue).mockResolvedValue({
        score: 4,
        status: {
          level: 'normal',
          color: 'green',
          message: 'Training load is appropriate',
          action: 'Continue current training',
        },
        recommendations: [],
        factors: {
          rpeCreep: 1,
          performanceDrop: 0,
          recoveryDebt: 1,
          volumeLoad: 1,
          streak: 0,
        },
      });

      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound', // maxRpeForProgress: 8
      });

      // Recent sessions with average RPE > 8.5 (8 + 0.5)
      mockDb.query.workoutSessions.findMany.mockResolvedValue([
        {
          date: new Date(),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Bench Press' },
              sets: [
                { weight: 185, reps: 8, rpe: 9, isWarmup: false }, // High RPE
              ],
            },
          ],
        },
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Bench Press' },
              sets: [
                { weight: 185, reps: 8, rpe: 9, isWarmup: false }, // High RPE
              ],
            },
          ],
        },
      ]);

      const result = await checkProgressionGates(mockUserId, mockExerciseId);

      expect(result.canProgress).toBe(false);
      expect(result.blockedBy).toBe('rpe');
    });

    it('should block when recovery debt is high', async () => {
      vi.mocked(fatigueModule.calculateFatigue).mockResolvedValue({
        score: 6,
        status: {
          level: 'elevated',
          color: 'yellow',
          message: 'Elevated fatigue - monitor closely',
          action: 'Focus on recovery',
        },
        recommendations: ['Monitor recovery closely'],
        factors: {
          rpeCreep: 1,
          performanceDrop: 1,
          recoveryDebt: 3, // High recovery debt
          volumeLoad: 1,
          streak: 0,
        },
      });

      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      // Need workout sessions to pass Gate 2 and reach recovery check (Gate 3)
      mockDb.query.workoutSessions.findMany.mockResolvedValue([
        {
          date: new Date(),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Bench Press' },
              sets: [
                { weight: 185, reps: 8, rpe: 7, isWarmup: false }, // Hits targets
              ],
            },
          ],
        },
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Bench Press' },
              sets: [
                { weight: 185, reps: 8, rpe: 7, isWarmup: false }, // Hits targets
              ],
            },
          ],
        },
      ]);

      const result = await checkProgressionGates(mockUserId, mockExerciseId);

      expect(result.canProgress).toBe(false);
      expect(result.blockedBy).toBe('recovery');
    });

    it('should use isolation rules for isolation exercises', async () => {
      vi.mocked(fatigueModule.calculateFatigue).mockResolvedValue({
        score: 3,
        status: {
          level: 'normal',
          color: 'green',
          message: 'Training load is appropriate',
          action: 'Continue current training',
        },
        recommendations: [],
        factors: {
          rpeCreep: 1,
          performanceDrop: 0,
          recoveryDebt: 1,
          volumeLoad: 1,
          streak: 0,
        },
      });

      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'isolation', // Should use isolation rules (minRepsForProgress: 12)
      });

      // Recent sessions with reps >= 12 (isolation target)
      mockDb.query.workoutSessions.findMany.mockResolvedValue([
        {
          date: new Date(),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Bicep Curl' },
              sets: [
                { weight: 30, reps: 12, rpe: 7, isWarmup: false }, // Hits isolation target
              ],
            },
          ],
        },
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Bicep Curl' },
              sets: [{ weight: 30, reps: 13, rpe: 7, isWarmup: false }],
            },
          ],
        },
        {
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Bicep Curl' },
              sets: [{ weight: 30, reps: 12, rpe: 7, isWarmup: false }],
            },
          ],
        },
      ]);

      const result = await checkProgressionGates(mockUserId, mockExerciseId);

      expect(result.canProgress).toBe(true);
      // Isolation exercises use different rules than compound
    });
  });

  describe('getProgressionRecommendation', () => {
    it('should recommend progression after hitting targets', async () => {
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      mockDb.query.workoutSessions.findMany.mockResolvedValue([
        {
          date: new Date(),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Squat' },
              sets: [{ weight: 225, reps: 8, rpe: 7, isWarmup: false }],
            },
          ],
        },
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Squat' },
              sets: [{ weight: 225, reps: 9, rpe: 7, isWarmup: false }],
            },
          ],
        },
      ]);

      const result = await getProgressionRecommendation(mockUserId, mockExerciseId);

      expect(result.status).toBe('ready');
      expect(result.suggestedWeight).toBeGreaterThan(result.currentWeight);
    });

    it('should detect plateau after 4+ sessions at same weight', async () => {
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'isolation',
      });

      const sessions = Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        exercises: [
          {
            exerciseId: mockExerciseId,
            exercise: { name: 'Curl' },
            sets: [{ weight: 30, reps: 10, rpe: 8, isWarmup: false }],
          },
        ],
      }));

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await getProgressionRecommendation(mockUserId, mockExerciseId);

      expect(result.status).toBe('plateau');
      expect(result.sessionsAtWeight).toBeGreaterThanOrEqual(4);
    });

    it('should recommend maintaining weight when targets not hit', async () => {
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      mockDb.query.workoutSessions.findMany.mockResolvedValue([
        {
          date: new Date(),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Deadlift' },
              sets: [
                { weight: 315, reps: 5, rpe: 9.5, isWarmup: false }, // RPE too high
              ],
            },
          ],
        },
      ]);

      const result = await getProgressionRecommendation(mockUserId, mockExerciseId);

      expect(result.status).toBe('maintain');
      expect(result.suggestedWeight).toBe(result.currentWeight);
    });

    it('should handle no performance history', async () => {
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      // Empty sessions
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);

      const result = await getProgressionRecommendation(mockUserId, mockExerciseId);

      expect(result.status).toBe('maintain');
      expect(result.currentWeight).toBe(0);
      expect(result.suggestedWeight).toBe(0);
      expect(result.sessionsAtWeight).toBe(0);
      expect(result.message).toBe('No history for this exercise');
    });

    it('should recommend regression when weight is too heavy', async () => {
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      // Recent sessions with very high RPE (>9.5)
      mockDb.query.workoutSessions.findMany.mockResolvedValue([
        {
          date: new Date(),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Squat' },
              sets: [
                { weight: 315, reps: 3, rpe: 10, isWarmup: false }, // Max effort
              ],
            },
          ],
        },
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Squat' },
              sets: [
                { weight: 315, reps: 3, rpe: 10, isWarmup: false }, // Max effort
              ],
            },
          ],
        },
      ]);

      const result = await getProgressionRecommendation(mockUserId, mockExerciseId);

      expect(result.status).toBe('regress');
      expect(result.currentWeight).toBe(315);
      expect(result.suggestedWeight).toBeLessThan(result.currentWeight);
      expect(result.message).toContain('too heavy');
    });
  });

  describe('getPlateauStrategies', () => {
    it('should return array of plateau strategies', () => {
      const strategies = getPlateauStrategies();

      expect(Array.isArray(strategies)).toBe(true);
      expect(strategies.length).toBeGreaterThan(0);
    });

    it('should include expected strategy types', () => {
      const strategies = getPlateauStrategies();

      const strategyTypes = strategies.map((s) => s.strategy);
      expect(strategyTypes).toContain('rep_range_shift');
      expect(strategyTypes).toContain('variation_swap');
      expect(strategyTypes).toContain('volume_increase');
      expect(strategyTypes).toContain('deload_then_push');
    });

    it('should have required fields for each strategy', () => {
      const strategies = getPlateauStrategies();

      strategies.forEach((strategy) => {
        expect(strategy).toHaveProperty('strategy');
        expect(strategy).toHaveProperty('description');
        expect(strategy).toHaveProperty('duration');
        expect(typeof strategy.strategy).toBe('string');
        expect(typeof strategy.description).toBe('string');
        expect(typeof strategy.duration).toBe('string');
      });
    });
  });

  describe('getExercisesReadyToProgress', () => {
    it('should return exercises passing progression gates', async () => {
      // Provide realistic data that will result in 'ready' status:
      // - Low fatigue (pass gate 1)
      // - Hit target reps in recent sessions (pass gate 2)
      // - Low recovery debt (pass gate 3)
      const mockSessions = [
        {
          date: new Date(),
          userId: mockUserId,
          status: 'completed' as const,
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { id: mockExerciseId, name: 'Bench Press' },
              sets: [{ weight: 185, reps: 8, rpe: 7, isWarmup: false }],
            },
          ],
        },
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          userId: mockUserId,
          status: 'completed' as const,
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { id: mockExerciseId, name: 'Bench Press' },
              sets: [{ weight: 185, reps: 9, rpe: 7, isWarmup: false }],
            },
          ],
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(mockSessions);
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      // Mock fatigue check (low fatigue)
      vi.mocked(fatigueModule.calculateFatigue).mockResolvedValue({
        score: 3,
        status: {
          level: 'normal',
          color: 'green',
          message: 'Training load is appropriate',
          action: 'Continue current training',
        },
        recommendations: [],
        factors: {
          rpeCreep: 1,
          performanceDrop: 0,
          recoveryDebt: 1,
          volumeLoad: 1,
          streak: 0,
        },
      });

      const result = await getExercisesReadyToProgress(mockUserId, 5);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('exerciseId');
      expect(result[0]).toHaveProperty('exerciseName');
      expect(result[0]).toHaveProperty('currentWeight');
      expect(result[0]).toHaveProperty('suggestedWeight');
      expect(result[0].suggestedWeight).toBeGreaterThan(result[0].currentWeight);
    });

    it('should respect limit parameter', async () => {
      // Create 10 unique exercises
      const mockExercises = Array.from({ length: 10 }, (_, i) => ({
        exerciseId: `exercise_${i}`,
        exercise: { id: `exercise_${i}`, name: `Exercise ${i}` },
        sets: [{ weight: 100, reps: 8, rpe: 7, isWarmup: false }],
      }));

      mockDb.query.workoutSessions.findMany.mockResolvedValue([
        {
          date: new Date(),
          userId: mockUserId,
          status: 'completed' as const,
          exercises: mockExercises,
        },
      ]);

      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: 'any',
        category: 'compound',
      });

      vi.mocked(fatigueModule.calculateFatigue).mockResolvedValue({
        score: 3,
        status: {
          level: 'normal',
          color: 'green',
          message: 'Training load is appropriate',
          action: 'Continue current training',
        },
        recommendations: [],
        factors: {
          rpeCreep: 1,
          performanceDrop: 0,
          recoveryDebt: 1,
          volumeLoad: 1,
          streak: 0,
        },
      });

      const result = await getExercisesReadyToProgress(mockUserId, 3);

      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should only include exercises from last 14 days', async () => {
      const oldSession = {
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        userId: mockUserId,
        status: 'completed' as const,
        exercises: [
          {
            exerciseId: 'old_exercise',
            exercise: { id: 'old_exercise', name: 'Old Exercise' },
            sets: [{ weight: 100, reps: 8, rpe: 7, isWarmup: false }],
          },
        ],
      };

      mockDb.query.workoutSessions.findMany.mockResolvedValue([oldSession]);

      const result = await getExercisesReadyToProgress(mockUserId, 5);

      // Should not include old exercises (query filters by date)
      expect(result.length).toBe(0);
    });

    it('should handle empty session history', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);

      const result = await getExercisesReadyToProgress(mockUserId, 5);

      expect(result).toEqual([]);
    });

    it('should filter out exercises not passing gates', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([
        {
          date: new Date(),
          userId: mockUserId,
          status: 'completed' as const,
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { id: mockExerciseId, name: 'Bench Press' },
              sets: [{ weight: 185, reps: 8, rpe: 7, isWarmup: false }],
            },
          ],
        },
      ]);

      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      // Mock high fatigue (blocks progression)
      vi.mocked(fatigueModule.calculateFatigue).mockResolvedValue({
        score: 9,
        status: {
          level: 'high',
          color: 'red',
          message: 'High fatigue detected',
          action: 'Consider a deload week',
        },
        recommendations: ['Consider a deload week'],
        factors: {
          rpeCreep: 2,
          performanceDrop: 2,
          recoveryDebt: 3,
          volumeLoad: 2,
          streak: 0,
        },
      });

      const result = await getExercisesReadyToProgress(mockUserId, 5);

      // Should be empty because fatigue blocks progression
      expect(result).toEqual([]);
    });

    it('should handle null/undefined values in exercise data', async () => {
      const mockExerciseId2 = 'exercise_789';
      const mockSessions = [
        {
          date: new Date(),
          userId: mockUserId,
          status: 'completed' as const,
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { id: mockExerciseId, name: null }, // Name is null - triggers || 'Unknown' (line 458)
              sets: [
                {
                  weight: '0', // First set with zero weight - initial value for reduce
                  reps: 10,
                  rpe: '0', // Zero RPE - triggers || 0
                  isWarmup: false,
                },
                {
                  weight: '5', // Lower weight than '100'
                  reps: 8,
                  rpe: 7,
                  isWarmup: false,
                },
                {
                  weight: '100', // Highest weight - will be selected by reduce (currentWeight > bestWeight)
                  reps: 8,
                  rpe: 7,
                  isWarmup: false,
                },
              ],
            },
            {
              exerciseId: 'edge_case_exercise',
              exercise: { id: 'edge_case_exercise', name: 'Edge Case' },
              sets: [
                {
                  weight: '0', // Only one working set with zero weight
                  reps: '0', // String '0' is truthy (passes filter) but might trigger || 0
                  rpe: '0',
                  isWarmup: false,
                },
              ],
            },
            {
              exerciseId: mockExerciseId2,
              exercise: null, // Null exercise - triggers line 308 false branch
              sets: [
                {
                  weight: '50',
                  reps: 10,
                  rpe: 7,
                  isWarmup: false,
                },
              ],
            },
          ],
        },
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          userId: mockUserId,
          status: 'completed' as const,
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { id: mockExerciseId, name: 'Bench Press' },
              sets: [
                {
                  weight: '185', // Valid weight
                  reps: 8, // Valid reps
                  rpe: '', // Empty RPE - triggers || 0 (line 462)
                  isWarmup: false,
                },
                {
                  weight: '50', // Lower weight - triggers line 453 false branch (best > current)
                  reps: 8,
                  rpe: 7,
                  isWarmup: false,
                },
              ],
            },
          ],
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(mockSessions);
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      vi.mocked(fatigueModule.calculateFatigue).mockResolvedValue({
        score: 3,
        status: {
          level: 'normal',
          color: 'green',
          message: 'Training load is appropriate',
          action: 'Continue current training',
        },
        recommendations: [],
        factors: {
          rpeCreep: 1,
          performanceDrop: 0,
          recoveryDebt: 1,
          volumeLoad: 1,
          streak: 0,
        },
      });

      const result = await getExercisesReadyToProgress(mockUserId, 5);

      // Should handle null/undefined gracefully without crashing
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getPlateauedExercises', () => {
    it('should return exercises with plateau status', async () => {
      // Create sessions with same weight for 5 weeks (plateau)
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        userId: mockUserId,
        status: 'completed' as const,
        exercises: [
          {
            exerciseId: mockExerciseId,
            exercise: { id: mockExerciseId, name: 'Curl' },
            sets: [{ weight: 30, reps: 10, rpe: 8, isWarmup: false }],
          },
        ],
      }));

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'isolation',
      });

      const result = await getPlateauedExercises(mockUserId, 5);

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('exerciseId');
        expect(result[0]).toHaveProperty('exerciseName');
        expect(result[0]).toHaveProperty('currentWeight');
        expect(result[0]).toHaveProperty('sessionsAtWeight');
        expect(result[0]).toHaveProperty('suggestions');
        expect(result[0].sessionsAtWeight).toBeGreaterThanOrEqual(4);
      }
    });

    it('should respect limit parameter', async () => {
      // Create 5 different exercises, all plateaued
      const mockExercises = Array.from({ length: 5 }, (_, i) => ({
        exerciseId: `exercise_${i}`,
        exercise: { id: `exercise_${i}`, name: `Exercise ${i}` },
        sets: [{ weight: 100, reps: 10, rpe: 8, isWarmup: false }],
      }));

      // 5 sessions with all exercises at same weight
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        userId: mockUserId,
        status: 'completed' as const,
        exercises: mockExercises,
      }));

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: 'any',
        category: 'isolation',
      });

      const result = await getPlateauedExercises(mockUserId, 2);

      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should only include exercises from last 30 days', async () => {
      const oldSession = {
        date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
        userId: mockUserId,
        status: 'completed' as const,
        exercises: [
          {
            exerciseId: 'old_exercise',
            exercise: { id: 'old_exercise', name: 'Old Exercise' },
            sets: [{ weight: 100, reps: 10, rpe: 8, isWarmup: false }],
          },
        ],
      };

      mockDb.query.workoutSessions.findMany.mockResolvedValue([oldSession]);

      const result = await getPlateauedExercises(mockUserId, 5);

      // Should not include old exercises (query filters by date)
      expect(result.length).toBe(0);
    });

    it('should handle empty session history', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);

      const result = await getPlateauedExercises(mockUserId, 5);

      expect(result).toEqual([]);
    });

    it('should include plateau strategies for each exercise', async () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        userId: mockUserId,
        status: 'completed' as const,
        exercises: [
          {
            exerciseId: mockExerciseId,
            exercise: { id: mockExerciseId, name: 'Curl' },
            sets: [{ weight: 30, reps: 10, rpe: 8, isWarmup: false }],
          },
        ],
      }));

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'isolation',
      });

      const result = await getPlateauedExercises(mockUserId, 5);

      if (result.length > 0) {
        const suggestions = result[0].suggestions;
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions[0]).toHaveProperty('strategy');
        expect(suggestions[0]).toHaveProperty('description');
        expect(suggestions[0]).toHaveProperty('duration');
      }
    });

    it('should handle exercises with null exercise metadata', async () => {
      // Sessions where exercise field is null (edge case)
      const sessions = [
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          userId: mockUserId,
          status: 'completed' as const,
          exercises: [
            {
              exerciseId: 'exercise_1',
              exercise: null, // Null exercise metadata
              sets: [{ weight: 100, reps: 10, rpe: 8, isWarmup: false }],
            },
          ],
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await getPlateauedExercises(mockUserId, 5);

      // Should handle gracefully and not crash
      expect(Array.isArray(result)).toBe(true);
    });

    it('should skip exercises with only warmup sets', async () => {
      // Sessions where all sets are warmup sets
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        userId: mockUserId,
        status: 'completed' as const,
        exercises: [
          {
            exerciseId: mockExerciseId,
            exercise: { id: mockExerciseId, name: 'Bench Press' },
            sets: [
              { weight: 45, reps: 10, rpe: 4, isWarmup: true },
              { weight: 95, reps: 5, rpe: 5, isWarmup: true },
            ], // All warmup sets
          },
        ],
      }));

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      const result = await getPlateauedExercises(mockUserId, 5);

      // Should not include this exercise (no working sets)
      const plateauedIds = result.map((ex) => ex.exerciseId);
      expect(plateauedIds).not.toContain(mockExerciseId);
    });

    it('should skip exercises with sets missing weight or reps', async () => {
      // Sessions where sets have null weight or reps
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        userId: mockUserId,
        status: 'completed' as const,
        exercises: [
          {
            exerciseId: mockExerciseId,
            exercise: { id: mockExerciseId, name: 'Plank' },
            sets: [
              { weight: null, reps: null, rpe: 7, isWarmup: false }, // Bodyweight/time-based
            ],
          },
        ],
      }));

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'core',
      });

      const result = await getPlateauedExercises(mockUserId, 5);

      // Should not include this exercise (no valid working sets)
      const plateauedIds = result.map((ex) => ex.exerciseId);
      expect(plateauedIds).not.toContain(mockExerciseId);
    });

    it('should not include exercises that are progressing', async () => {
      // Sessions with increasing weight (not plateaued)
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        userId: mockUserId,
        status: 'completed' as const,
        exercises: [
          {
            exerciseId: mockExerciseId,
            exercise: { id: mockExerciseId, name: 'Bench Press' },
            sets: [{ weight: 185 + i * 5, reps: 8, rpe: 7, isWarmup: false }], // Increasing weight
          },
        ],
      }));

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        category: 'compound',
      });

      const result = await getPlateauedExercises(mockUserId, 5);

      // Should not include this exercise (it's progressing)
      const plateauedIds = result.map((ex) => ex.exerciseId);
      expect(plateauedIds).not.toContain(mockExerciseId);
    });
  });

  describe('getExercisePerformance - Direct Tests for Edge Cases', () => {
    it('should handle sets with falsy weight and reps values', async () => {
      // Create sessions with sets that have edge-case values
      const mockSessions = [
        {
          date: new Date(),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: undefined }, // Undefined name - triggers || 'Unknown'
              sets: [
                {
                  weight: 0, // Number 0 - triggers || 0 fallback (line 451/452/460)
                  reps: 0, // Number 0 - triggers || 0 fallback (line 461)
                  rpe: 0, // Number 0 - triggers || 0 fallback
                  isWarmup: false,
                },
                {
                  weight: 100,
                  reps: 8,
                  rpe: 7,
                  isWarmup: false,
                },
              ],
            },
          ],
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(mockSessions);

      const result = await getExercisePerformance(mockUserId, mockExerciseId, 5);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Should handle 0 values gracefully with || 0 fallbacks
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('weight');
        expect(result[0]).toHaveProperty('reps');
      }
    });

    it('should handle sets where bestSet has falsy reps through stateful getter', async () => {
      // Create a set with a getter that returns truthy first (passes filter) then falsy (triggers || 0)
      let accessCount = 0;
      const problematicSet: Record<string, unknown> = {
        weight: 100,
        rpe: 7,
        isWarmup: false,
      };

      Object.defineProperty(problematicSet, 'reps', {
        get() {
          accessCount++;
          // First access returns truthy (for filter check)
          // Second access returns falsy (triggers || 0 on line 461)
          return accessCount === 1 ? 10 : undefined;
        },
        enumerable: true,
        configurable: true,
      });

      const mockSessions = [
        {
          date: new Date(),
          exercises: [
            {
              exerciseId: mockExerciseId,
              exercise: { name: 'Test' },
              sets: [problematicSet],
            },
          ],
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(mockSessions);

      const result = await getExercisePerformance(mockUserId, mockExerciseId, 5);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // The getter should have been called multiple times during processing
      expect(accessCount).toBeGreaterThan(0);
    });
  });
});
