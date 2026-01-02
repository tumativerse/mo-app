import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateFatigue,
  getFatigueStatus,
  logFatigue,
  getFatigueHistory,
  checkIncreasingTrend,
  average,
  isWithinDays,
} from './fatigue';
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
      fatigueLogs: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
  },
}));

describe('MoFatigue - Comprehensive Tests', () => {
  const mockUserId = 'user_123';
  const mockDb = dbModule.db as unknown as {
    query: {
      workoutSessions: { findMany: ReturnType<typeof vi.fn> };
      recoveryLogs: { findMany: ReturnType<typeof vi.fn> };
      fatigueLogs: { findMany: ReturnType<typeof vi.fn> };
    };
    insert: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);
    mockDb.query.workoutSessions.findMany.mockResolvedValue([]);
  });

  describe('calculateFatigue - Factor 1: RPE Creep', () => {
    it('should detect RPE creep when recent RPEs are higher than earlier ones', async () => {
      // Realistic scenario: User's RPE increasing over 5 sessions
      const sessions = [
        // Most recent (higher RPE)
        {
          id: '5',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '9.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '4',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '8.5',
          totalVolume: '1000',
          status: 'completed',
        },
        // Earlier (lower RPE)
        {
          id: '3',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          avgRpe: '7.5',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '1',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.rpeCreep).toBe(2);
      expect(result.recommendations).toContain('RPE trending up - consider reducing intensity');
    });

    it('should not detect RPE creep when RPE is stable or decreasing', async () => {
      const sessions = [
        {
          id: '3',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '7.5',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '1',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          avgRpe: '8.0',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.rpeCreep).toBe(0);
    });

    it('should require at least 3 sessions to detect RPE creep', async () => {
      const sessions = [
        {
          id: '2',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '9.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '1',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.rpeCreep).toBe(0);
    });
  });

  describe('calculateFatigue - Factor 2: Performance Drop', () => {
    it('should score 2 when average RPE > 8.5 (grinding sets)', async () => {
      const sessions = [
        {
          id: '3',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '9.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '9.0',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.performanceDrop).toBe(2);
      expect(result.recommendations).toContain('High average RPE - workouts are very demanding');
    });

    it('should score 1 when average RPE between 8.0 and 8.5', async () => {
      const sessions = [
        {
          id: '2',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '8.2',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '1',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '8.3',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.performanceDrop).toBe(1);
    });

    it('should score 0 when average RPE <= 8.0', async () => {
      const sessions = [
        {
          id: '2',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '7.5',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '1',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '7.5',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.performanceDrop).toBe(0);
    });
  });

  describe('calculateFatigue - Factor 3: Recovery Debt', () => {
    it('should score +2 for severe sleep debt (< 5 hours)', async () => {
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([
        {
          userId: mockUserId,
          date: new Date(),
          sleepHours: '4.5',
          energyLevel: 5,
          overallSoreness: 3,
        },
        {
          userId: mockUserId,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          sleepHours: '4.0',
          energyLevel: 5,
          overallSoreness: 3,
        },
      ]);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.recoveryDebt).toBeGreaterThanOrEqual(2);
      expect(result.recommendations).toContain('Severe sleep debt - prioritize 7+ hours');
    });

    it('should score +1 for low sleep (< 6 hours)', async () => {
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([
        {
          userId: mockUserId,
          date: new Date(),
          sleepHours: '5.5',
          energyLevel: 5,
          overallSoreness: 3,
        },
      ]);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.recoveryDebt).toBeGreaterThanOrEqual(1);
      expect(result.recommendations).toContain('Low sleep - aim for 7+ hours');
    });

    it('should score +1 for low energy (< 3)', async () => {
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([
        {
          userId: mockUserId,
          date: new Date(),
          sleepHours: '8.0',
          energyLevel: 2,
          overallSoreness: 3,
        },
      ]);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.recoveryDebt).toBeGreaterThanOrEqual(1);
      expect(result.recommendations).toContain('Low energy levels - consider rest day');
    });

    it('should score +1 for high soreness (> 4)', async () => {
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([
        {
          userId: mockUserId,
          date: new Date(),
          sleepHours: '8.0',
          energyLevel: 5,
          overallSoreness: 5,
        },
      ]);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.recoveryDebt).toBeGreaterThanOrEqual(1);
      expect(result.recommendations).toContain('High muscle soreness - allow recovery');
    });

    it('should cap recovery debt at 3 points', async () => {
      // All recovery metrics are bad
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([
        {
          userId: mockUserId,
          date: new Date(),
          sleepHours: '4.0',
          energyLevel: 2,
          overallSoreness: 5,
        },
        {
          userId: mockUserId,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          sleepHours: '4.0',
          energyLevel: 2,
          overallSoreness: 5,
        },
      ]);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.recoveryDebt).toBeLessThanOrEqual(3);
      expect(result.factors.recoveryDebt).toBe(3); // Should be maxed out
    });

    it('should handle missing recovery data gracefully', async () => {
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.recoveryDebt).toBe(0);
    });
  });

  describe('calculateFatigue - Factor 4: Volume Load', () => {
    it('should detect high volume spike (> 140% of baseline)', async () => {
      const sessions = [
        // This week (high volume)
        {
          id: '4',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '5000',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '5000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '5000',
          status: 'completed',
        },
        // Previous weeks (baseline)
        {
          id: '1',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '3000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.volumeLoad).toBe(2);
      expect(result.recommendations).toContain('Volume spike detected - risk of overreaching');
    });

    it('should detect moderate volume increase (> 120% of baseline)', async () => {
      const sessions = [
        // This week - total 3900 (weekly volume)
        {
          id: '5',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1300',
          status: 'completed',
        },
        {
          id: '4',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1300',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1300',
          status: 'completed',
        },
        // Baseline sessions (older than 7 days)
        // baselineVolume = (3000 + 3000 + 3000) / 3 = 3000
        // Ratio: 3900 / 3000 = 1.3 (between 1.2 and 1.4)
        {
          id: '2',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '3000',
          status: 'completed',
        },
        {
          id: '1',
          date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '3000',
          status: 'completed',
        },
        {
          id: '0',
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '3000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      // With ratio between 1.2 and 1.4, should score 1 (moderate increase)
      expect(result.factors.volumeLoad).toBe(1);
    });

    it('should not penalize normal volume', async () => {
      const sessions = [
        {
          id: '3',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '3000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '3000',
          status: 'completed',
        },
        {
          id: '1',
          date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '3000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.volumeLoad).toBe(0);
    });
  });

  describe('calculateFatigue - Factor 5: Training Streak', () => {
    it('should score 1 for 5+ consecutive training days', async () => {
      const sessions = Array.from({ length: 6 }, (_, i) => ({
        id: `session_${i}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Consecutive days
        avgRpe: '7.0',
        totalVolume: '1000',
        status: 'completed' as const,
      }));

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.streak).toBe(1);
      // Message includes number of consecutive days
      expect(result.recommendations.some((r) => r.includes('consecutive training days'))).toBe(
        true
      );
    });

    it('should score 0 for < 5 consecutive days', async () => {
      const sessions = [
        {
          id: '3',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        // Gap here - not consecutive
        {
          id: '1',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      expect(result.factors.streak).toBe(0);
    });
  });

  describe('calculateFatigue - Score Calculation', () => {
    it('should cap total score at 10 even if factors sum to more', async () => {
      // Create scenario with all max factors (would be 2+2+3+2+1 = 10)
      const sessions = Array.from({ length: 6 }, (_, i) => ({
        id: `${i}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        avgRpe: '9.5', // High RPE
        totalVolume: '10000', // High volume
        status: 'completed' as const,
      }));

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([
        {
          userId: mockUserId,
          date: new Date(),
          sleepHours: '4.0',
          energyLevel: 2,
          overallSoreness: 5,
        },
      ]);

      const result = await calculateFatigue(mockUserId);

      expect(result.score).toBeLessThanOrEqual(10);
    });

    it('should calculate correct total from all factors', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      const expectedScore =
        result.factors.rpeCreep +
        result.factors.performanceDrop +
        result.factors.recoveryDebt +
        result.factors.volumeLoad +
        result.factors.streak;

      expect(result.score).toBe(Math.min(10, expectedScore));
    });
  });

  describe('getFatigueStatus', () => {
    it('should return "fresh" for score 0-2', () => {
      const status = getFatigueStatus(0);
      expect(status.level).toBe('fresh');
      expect(status.color).toBe('green');

      const status2 = getFatigueStatus(2);
      expect(status2.level).toBe('fresh');
    });

    it('should return "normal" for score 3-4', () => {
      const status = getFatigueStatus(3);
      expect(status.level).toBe('normal');
      expect(status.color).toBe('green');

      const status2 = getFatigueStatus(4);
      expect(status2.level).toBe('normal');
    });

    it('should return "elevated" for score 5-6', () => {
      const status = getFatigueStatus(5);
      expect(status.level).toBe('elevated');
      expect(status.color).toBe('yellow');

      const status2 = getFatigueStatus(6);
      expect(status2.level).toBe('elevated');
    });

    it('should return "high" for score 7-8', () => {
      const status = getFatigueStatus(7);
      expect(status.level).toBe('high');
      expect(status.color).toBe('orange');

      const status2 = getFatigueStatus(8);
      expect(status2.level).toBe('high');
    });

    it('should return "critical" for score 9-10', () => {
      const status = getFatigueStatus(9);
      expect(status.level).toBe('critical');
      expect(status.color).toBe('red');

      const status2 = getFatigueStatus(10);
      expect(status2.level).toBe('critical');
    });

    it('should handle boundary conditions exactly', () => {
      // Test exact boundaries
      expect(getFatigueStatus(2).level).toBe('fresh');
      expect(getFatigueStatus(3).level).toBe('normal'); // Crosses boundary

      expect(getFatigueStatus(4).level).toBe('normal');
      expect(getFatigueStatus(5).level).toBe('elevated'); // Crosses boundary

      expect(getFatigueStatus(6).level).toBe('elevated');
      expect(getFatigueStatus(7).level).toBe('high'); // Crosses boundary

      expect(getFatigueStatus(8).level).toBe('high');
      expect(getFatigueStatus(9).level).toBe('critical'); // Crosses boundary
    });
  });

  describe('logFatigue', () => {
    it('should insert fatigue log with correct data', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn(),
        }),
      });
      mockDb.insert = mockInsert;

      const fatigueResult = {
        score: 5,
        status: {
          level: 'elevated' as const,
          color: 'yellow' as const,
          message: 'Test',
          action: 'Test',
        },
        factors: {
          rpeCreep: 1,
          performanceDrop: 1,
          recoveryDebt: 2,
          volumeLoad: 1,
          streak: 0,
        },
        recommendations: ['Test recommendation'],
      };

      await logFatigue(mockUserId, fatigueResult);

      expect(mockInsert).toHaveBeenCalled();
      const insertCall = mockInsert.mock.calls[0];
      expect(insertCall).toBeDefined();
    });
  });

  describe('getFatigueHistory', () => {
    it('should fetch fatigue history for specified days', async () => {
      const mockLogs = [
        { userId: mockUserId, date: new Date(), fatigueScore: 5 },
        { userId: mockUserId, date: new Date(Date.now() - 24 * 60 * 60 * 1000), fatigueScore: 4 },
      ];

      mockDb.query.fatigueLogs.findMany.mockResolvedValue(mockLogs);

      const history = await getFatigueHistory(mockUserId, 7);

      expect(history).toEqual(mockLogs);
      expect(mockDb.query.fatigueLogs.findMany).toHaveBeenCalled();
    });

    it('should use default 7 days if not specified', async () => {
      mockDb.query.fatigueLogs.findMany.mockResolvedValue([]);

      await getFatigueHistory(mockUserId);

      expect(mockDb.query.fatigueLogs.findMany).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty workout history', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      expect(result.score).toBe(0);
      expect(result.factors.rpeCreep).toBe(0);
      expect(result.factors.performanceDrop).toBe(0);
      expect(result.factors.recoveryDebt).toBe(0);
      expect(result.factors.volumeLoad).toBe(0);
      expect(result.factors.streak).toBe(0);
    });

    it('should handle null/missing avgRpe values', async () => {
      const sessions = [
        { id: '1', date: new Date(), avgRpe: null, totalVolume: '1000', status: 'completed' },
        {
          id: '2',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          avgRpe: '',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      // Should not crash, should handle gracefully
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should handle null/missing totalVolume values', async () => {
      const sessions = [
        { id: '1', date: new Date(), avgRpe: '7.0', totalVolume: null, status: 'completed' },
        {
          id: '2',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      expect(result).toBeDefined();
      expect(result.factors.volumeLoad).toBe(0);
    });

    it('should handle sessions with null dates', async () => {
      const sessions = [
        { id: '1', date: null, avgRpe: '7.0', totalVolume: '1000', status: 'completed' },
        { id: '2', date: new Date(), avgRpe: '7.0', totalVolume: '1000', status: 'completed' },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);

      const result = await calculateFatigue(mockUserId);

      // Should not crash
      expect(result).toBeDefined();
    });

    it('should use custom days parameter', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      await calculateFatigue(mockUserId, 14); // 14 days

      // Should still work
      expect(mockDb.query.workoutSessions.findMany).toHaveBeenCalled();
    });

    it('should calculate volume load with baseline from old sessions', async () => {
      // This week sessions (within 7 days) - total 3900
      const thisWeek = [
        {
          id: '1',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1300',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1300',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1300',
          status: 'completed',
        },
      ];

      // Baseline sessions (older than 7 days but within 14 days) - avg 3000
      const baseline = [
        {
          id: '4',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '3000',
          status: 'completed',
        },
        {
          id: '5',
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '3000',
          status: 'completed',
        },
      ];

      const sessions = [...thisWeek, ...baseline];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      // Use 14 days to include baseline sessions
      const result = await calculateFatigue(mockUserId, 14);

      // 3900 / 3000 = 1.3 (moderate increase)
      expect(result.factors.volumeLoad).toBe(1);
    });

    it('should handle empty baseline sessions', async () => {
      // Only sessions within 7 days, no baseline
      const sessions = [
        {
          id: '1',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      // No baseline to compare, should not crash
      expect(result).toBeDefined();
      expect(result.factors.volumeLoad).toBe(0);
    });

    it('should handle sessions with null dates in volume calculation', async () => {
      const sessions = [
        {
          id: '1',
          date: null, // Null date - filtered out
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '2',
          date: null, // Null date - filtered out
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '3',
          date: null, // Null date - filtered out
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      // All sessions filtered out due to null dates
      expect(result).toBeDefined();
      expect(result.factors.volumeLoad).toBe(0);
    });

    it('should handle empty weekly volume (all sessions outside 7 days)', async () => {
      const sessions = [
        {
          id: '1',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      // Use 21 days to include these sessions
      const result = await calculateFatigue(mockUserId, 21);

      // weeklyVolume will be 0 (no sessions within last 7 days)
      expect(result).toBeDefined();
      expect(result.factors.volumeLoad).toBe(0);
    });
  });

  describe('RPE creep detection', () => {
    it('should detect increasing RPE trend', async () => {
      // Create sessions with increasing RPE values
      const sessions = [
        {
          id: '1',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '9.0', // Recent - high
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '8.5', // Recent - high
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0', // Earlier - lower
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '4',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          avgRpe: '7.0', // Earlier - lower
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      // Should detect increasing trend
      expect(result.factors.rpeCreep).toBe(2);
      expect(result.recommendations).toContain('RPE trending up - consider reducing intensity');
    });

    it('should handle less than 3 RPE values after filtering', async () => {
      const sessions = [
        {
          id: '1',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '9.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '8.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          avgRpe: '0', // Invalid RPE (filtered out)
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      // Should not crash - only 2 valid RPEs (less than 3 required for trend)
      expect(result).toBeDefined();
      expect(result.factors.rpeCreep).toBe(0);
    });

    it('should handle all zero RPE values', async () => {
      const sessions = [
        {
          id: '1',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avgRpe: '0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avgRpe: '0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          avgRpe: '0',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId);

      // Should handle empty RPE array
      expect(result).toBeDefined();
      expect(result.factors.rpeCreep).toBe(0);
    });
  });

  describe('Recovery debt with filtered values', () => {
    it('should handle all zero sleep hours', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([
        { sleepHours: 0, energyLevel: 5, overallSoreness: 2 },
        { sleepHours: 0, energyLevel: 5, overallSoreness: 2 },
      ]);

      const result = await calculateFatigue(mockUserId);

      // Should handle empty array after filter
      expect(result).toBeDefined();
    });

    it('should handle all zero energy levels', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([
        { sleepHours: 7, energyLevel: 0, overallSoreness: 2 },
        { sleepHours: 7, energyLevel: 0, overallSoreness: 2 },
      ]);

      const result = await calculateFatigue(mockUserId);

      // Should handle empty array after filter
      expect(result).toBeDefined();
    });

    it('should handle all zero soreness values', async () => {
      mockDb.query.workoutSessions.findMany.mockResolvedValue([]);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([
        { sleepHours: 7, energyLevel: 5, overallSoreness: 0 },
        { sleepHours: 7, energyLevel: 5, overallSoreness: 0 },
      ]);

      const result = await calculateFatigue(mockUserId);

      // Should handle empty array after filter
      expect(result).toBeDefined();
    });
  });

  describe('getFatigueHistory', () => {
    it('should return empty array when no fatigue logs', async () => {
      mockDb.query.fatigueLogs.findMany.mockResolvedValue([]);

      const result = await getFatigueHistory(mockUserId);

      expect(result).toEqual([]);
    });

    it('should return fatigue history with increasing trend detection', async () => {
      const logs = [
        {
          id: '1',
          userId: mockUserId,
          fatigueScore: 8.5,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          userId: mockUserId,
          fatigueScore: 8.0,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: '3',
          userId: mockUserId,
          fatigueScore: 7.0,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ];

      mockDb.query.fatigueLogs.findMany.mockResolvedValue(logs);

      const result = await getFatigueHistory(mockUserId);

      expect(result).toHaveLength(3);
      expect(result[0].fatigueScore).toBe(8.5);
    });

    it('should handle less than 3 logs for trend detection', async () => {
      const logs = [
        {
          id: '1',
          userId: mockUserId,
          fatigueScore: 8.0,
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: mockUserId,
          fatigueScore: 7.0,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      mockDb.query.fatigueLogs.findMany.mockResolvedValue(logs);

      const result = await getFatigueHistory(mockUserId, 7);

      expect(result).toHaveLength(2);
    });
  });

  describe('Volume Load Filter Branches', () => {
    it('should execute both filter branches in volume calculation', async () => {
      // Create a precise scenario with sessions both within and outside 7 days
      const withinSevenDays = [
        {
          id: '1',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago - WITHIN
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago - WITHIN
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago - WITHIN
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
      ];

      const outsideSevenDays = [
        {
          id: '4',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago - OUTSIDE
          avgRpe: '7.0',
          totalVolume: '500',
          status: 'completed',
        },
        {
          id: '5',
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago - OUTSIDE
          avgRpe: '7.0',
          totalVolume: '500',
          status: 'completed',
        },
      ];

      const allSessions = [...withinSevenDays, ...outsideSevenDays];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(allSessions);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      // Use 14 days to include both groups
      const result = await calculateFatigue(mockUserId, 14);

      // Weekly volume: 3000 (from 3 sessions within 7 days)
      // Baseline volume: 1000 (avg of 2 sessions outside 7 days)
      // Ratio: 3000 / 1000 = 3.0 (very high spike)
      expect(result.factors.volumeLoad).toBe(2);
      expect(result.recommendations).toContain('Volume spike detected - risk of overreaching');
    });

    it('should handle sessions at exact 7 day boundary', async () => {
      const withinSevenDays = new Date(Date.now() - 6.9 * 24 * 60 * 60 * 1000); // Just under 7 days
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

      const sessions = [
        {
          id: '1',
          date: withinSevenDays, // Just under 7 days - should be WITHIN
          avgRpe: '7.0',
          totalVolume: '2000',
          status: 'completed',
        },
        {
          id: '2',
          date: eightDaysAgo, // 8 days - should be OUTSIDE
          avgRpe: '7.0',
          totalVolume: '1000',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day - WITHIN
          avgRpe: '7.0',
          totalVolume: '2000',
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      const result = await calculateFatigue(mockUserId, 10);

      // Weekly: 4000 (2 sessions within 7 days)
      // Baseline: 1000 (1 session outside 7 days)
      // Ratio: 4000 / 1000 = 4.0
      expect(result.factors.volumeLoad).toBe(2);
    });

    it('should handle null/empty totalVolume in both filter branches', async () => {
      const sessions = [
        {
          id: '1',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // WITHIN 7 days
          avgRpe: '7.0',
          totalVolume: null, // NULL - triggers || 0 branch
          status: 'completed',
        },
        {
          id: '2',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // WITHIN 7 days
          avgRpe: '7.0',
          totalVolume: '', // EMPTY - triggers || 0 branch
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // WITHIN 7 days
          avgRpe: '7.0',
          totalVolume: '1000', // Valid
          status: 'completed',
        },
        {
          id: '4',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // OUTSIDE 7 days
          avgRpe: '7.0',
          totalVolume: null, // NULL - triggers || 0 branch in baseline filter
          status: 'completed',
        },
        {
          id: '5',
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // OUTSIDE 7 days
          avgRpe: '7.0',
          totalVolume: '', // EMPTY - triggers || 0 branch in baseline filter
          status: 'completed',
        },
        {
          id: '6',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // OUTSIDE 7 days
          avgRpe: '7.0',
          totalVolume: '500', // Valid
          status: 'completed',
        },
      ];

      mockDb.query.workoutSessions.findMany.mockResolvedValue(sessions);
      mockDb.query.recoveryLogs.findMany.mockResolvedValue([]);

      // Use 21 days to include all sessions
      const result = await calculateFatigue(mockUserId, 21);

      // Weekly volume: 1000 (only 1 valid session)
      // Baseline volume: 500 (only 1 valid session / 3 total sessions outside 7 days)
      // Ratio: 1000 / (500/3) = 1000 / 166.67 = 6.0 (very high)
      expect(result.factors.volumeLoad).toBe(2);
    });
  });

  describe('Helper Functions - Direct Unit Tests', () => {
    describe('checkIncreasingTrend', () => {
      it('should return false for less than 3 values', () => {
        expect(checkIncreasingTrend([])).toBe(false);
        expect(checkIncreasingTrend([8.0])).toBe(false);
        expect(checkIncreasingTrend([8.0, 7.5])).toBe(false);
      });

      it('should return true for increasing trend', () => {
        // Recent avg: (9.0 + 8.5) / 2 = 8.75
        // Earlier avg: (7.0 + 7.0) / 2 = 7.0
        // Diff: 8.75 - 7.0 = 1.75 > 0.5 ✓
        expect(checkIncreasingTrend([9.0, 8.5, 7.0, 7.0])).toBe(true);
      });

      it('should return false for decreasing trend', () => {
        // Recent avg: (7.0 + 7.0) / 2 = 7.0
        // Earlier avg: (8.0 + 8.5) / 2 = 8.25
        // Diff: 7.0 - 8.25 = -1.25 < 0.5 ✗
        expect(checkIncreasingTrend([7.0, 7.0, 8.0, 8.5])).toBe(false);
      });

      it('should return false for stable trend', () => {
        // Recent avg: (7.5 + 7.5) / 2 = 7.5
        // Earlier avg: (7.5 + 7.5) / 2 = 7.5
        // Diff: 0 < 0.5 ✗
        expect(checkIncreasingTrend([7.5, 7.5, 7.5, 7.5])).toBe(false);
      });

      it('should require at least 0.5 RPE increase', () => {
        // Recent avg: (7.3 + 7.2) / 2 = 7.25
        // Earlier avg: (7.0 + 7.0) / 2 = 7.0
        // Diff: 7.25 - 7.0 = 0.25 < 0.5 ✗
        expect(checkIncreasingTrend([7.3, 7.2, 7.0, 7.0])).toBe(false);

        // Recent avg: (7.6 + 7.5) / 2 = 7.55
        // Earlier avg: (7.0 + 7.0) / 2 = 7.0
        // Diff: 7.55 - 7.0 = 0.55 > 0.5 ✓
        expect(checkIncreasingTrend([7.6, 7.5, 7.0, 7.0])).toBe(true);
      });
    });

    describe('average', () => {
      it('should return 0 for empty array', () => {
        expect(average([])).toBe(0);
      });

      it('should calculate average correctly', () => {
        expect(average([1, 2, 3, 4, 5])).toBe(3);
        expect(average([10])).toBe(10);
        expect(average([5, 10])).toBe(7.5);
      });

      it('should handle decimal values', () => {
        expect(average([1.5, 2.5, 3.0])).toBe(2.3333333333333335);
      });

      it('should handle negative values', () => {
        expect(average([-5, 5])).toBe(0);
        expect(average([-10, -20, -30])).toBe(-20);
      });
    });

    describe('isWithinDays', () => {
      it('should return false for null date', () => {
        expect(isWithinDays(null, 7)).toBe(false);
      });

      it('should return true for date within threshold', () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        expect(isWithinDays(yesterday, 7)).toBe(true);

        const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
        expect(isWithinDays(sixDaysAgo, 7)).toBe(true);
      });

      it('should return false for date outside threshold', () => {
        const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
        expect(isWithinDays(eightDaysAgo, 7)).toBe(false);

        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
        expect(isWithinDays(tenDaysAgo, 7)).toBe(false);
      });

      it('should handle boundary condition (exactly 7 days)', () => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        expect(isWithinDays(sevenDaysAgo, 7)).toBe(true);
      });

      it('should work with different day thresholds', () => {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        expect(isWithinDays(threeDaysAgo, 3)).toBe(true);
        expect(isWithinDays(threeDaysAgo, 2)).toBe(false);

        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        expect(isWithinDays(fourteenDaysAgo, 14)).toBe(true);
        expect(isWithinDays(fourteenDaysAgo, 7)).toBe(false);
      });
    });
  });
});
