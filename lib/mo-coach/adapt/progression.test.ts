import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkProgressionGates, getProgressionRecommendation } from './progression';
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
              sets: [
                { weight: 185, reps: 8, rpe: 7, isWarmup: false },
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
                { weight: 185, reps: 9, rpe: 7, isWarmup: false },
              ],
            },
          ],
        },
      ]);

      const result = await checkProgressionGates(mockUserId, mockExerciseId);

      expect(result.canProgress).toBe(true);
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
              sets: [
                { weight: 225, reps: 8, rpe: 7, isWarmup: false },
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
                { weight: 225, reps: 9, rpe: 7, isWarmup: false },
              ],
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
            sets: [
              { weight: 30, reps: 10, rpe: 8, isWarmup: false },
            ],
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
  });
});
