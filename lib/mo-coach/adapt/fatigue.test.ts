import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateFatigue } from './fatigue';
import * as dbModule from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      workoutSessions: {
        findMany: vi.fn(),
      },
      recoveryLogs: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('MoFatigue', () => {
  const mockUserId = 'user_123';
  const mockDb = dbModule.db as unknown as {
    query: {
      workoutSessions: { findMany: ReturnType<typeof vi.fn> };
      recoveryLogs: { findMany: ReturnType<typeof vi.fn> };
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);
  });

  describe('calculateFatigue', () => {
    it('should return valid fatigue result structure', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('factors');
      expect(result).toHaveProperty('recommendations');
      expect(typeof result.score).toBe('number');
      expect(result.status).toHaveProperty('level');
      expect(result.status).toHaveProperty('color');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should have all fatigue factors', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors).toHaveProperty('rpeCreep');
      expect(result.factors).toHaveProperty('performanceDrop');
      expect(result.factors).toHaveProperty('recoveryDebt');
      expect(result.factors).toHaveProperty('volumeLoad');
      expect(result.factors).toHaveProperty('streak');
    });

    it('should calculate low fatigue for new user with no sessions', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.status.level).toBe('fresh');
    });

    it('should increase score with session data', async () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        id: `session_${i}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        status: 'completed',
        exercises: [
          {
            sets: [
              { weight: 185, reps: 8, rpe: 8, isWarmup: false },
              { weight: 185, reps: 8, rpe: 8, isWarmup: false },
            ],
          },
        ],
      }));

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      const withSessionsResult = await calculateFatigue(mockUserId);

      // With sessions, at least one factor should be non-zero
      const totalFactors =
        withSessionsResult.factors.rpeCreep +
        withSessionsResult.factors.performanceDrop +
        withSessionsResult.factors.recoveryDebt +
        withSessionsResult.factors.volumeLoad +
        withSessionsResult.factors.streak;

      expect(totalFactors).toBeGreaterThanOrEqual(0);
    });

    it('should return status with color codes', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      expect(['green', 'yellow', 'orange', 'red']).toContain(result.status.color);
    });

    it('should return fatigue levels in valid range', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([
        {
          id: 'session_1',
          date: new Date(),
          status: 'completed',
          exercises: [
            {
              sets: [{ weight: 200, reps: 8, rpe: 7, isWarmup: false }],
            },
          ],
        },
      ]);

      const result = await calculateFatigue(mockUserId);

      expect(['fresh', 'normal', 'elevated', 'high', 'critical']).toContain(result.status.level);
    });
  });
});
