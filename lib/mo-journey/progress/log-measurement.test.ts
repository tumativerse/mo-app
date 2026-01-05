import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logMeasurement } from './log-measurement';
import * as dbModule from '@/lib/db';
import { measurements } from '@/lib/db/schema';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
  },
}));

describe('MoProgress (log)', () => {
  const mockUserId = 'user_test123';
  const mockDb = dbModule.db as unknown as {
    insert: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logMeasurement', () => {
    it('should log measurement with weight and date', async () => {
      const measurementData = {
        weight: '76.5',
        date: new Date('2026-01-15'),
      };

      const mockCreatedMeasurement = {
        id: 'measurement_123',
        userId: mockUserId,
        goalId: null,
        date: new Date('2026-01-15'),
        weight: '76.50',
        notes: null,
        createdAt: new Date('2026-01-15T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedMeasurement]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await logMeasurement(mockUserId, measurementData);

      expect(mockInsert).toHaveBeenCalledWith(measurements);
      expect(result).toEqual(mockCreatedMeasurement);
      expect(result.weight).toBe('76.50');
      expect(result.userId).toBe(mockUserId);
    });

    it('should log measurement with goalId', async () => {
      const measurementData = {
        weight: '76.0',
        date: new Date('2026-01-15'),
        goalId: 'goal_123',
      };

      const mockCreatedMeasurement = {
        id: 'measurement_with_goal',
        userId: mockUserId,
        goalId: 'goal_123',
        date: new Date('2026-01-15'),
        weight: '76.00',
        notes: null,
        createdAt: new Date('2026-01-15T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedMeasurement]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await logMeasurement(mockUserId, measurementData);

      expect(result.goalId).toBe('goal_123');
    });

    it('should log measurement with notes', async () => {
      const measurementData = {
        weight: '75.5',
        date: new Date('2026-01-15'),
        notes: 'Morning weight, after workout',
      };

      const mockCreatedMeasurement = {
        id: 'measurement_with_notes',
        userId: mockUserId,
        goalId: null,
        date: new Date('2026-01-15'),
        weight: '75.50',
        notes: 'Morning weight, after workout',
        createdAt: new Date('2026-01-15T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedMeasurement]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await logMeasurement(mockUserId, measurementData);

      expect(result.notes).toBe('Morning weight, after workout');
    });

    it('should use current date when date not provided', async () => {
      const measurementData = {
        weight: '77.0',
      };

      const now = new Date();
      const mockCreatedMeasurement = {
        id: 'measurement_default_date',
        userId: mockUserId,
        goalId: null,
        date: now,
        weight: '77.00',
        notes: null,
        createdAt: now,
        updatedAt: now,
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedMeasurement]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await logMeasurement(mockUserId, measurementData);

      expect(result).toEqual(mockCreatedMeasurement);
      // Date should be close to now (within 1 second)
      expect(Math.abs(result.date.getTime() - now.getTime())).toBeLessThan(1000);
    });

    it('should handle decimal weight precision', async () => {
      const measurementData = {
        weight: '75.55',
        date: new Date('2026-01-15'),
      };

      const mockCreatedMeasurement = {
        id: 'measurement_precision',
        userId: mockUserId,
        goalId: null,
        date: new Date('2026-01-15'),
        weight: '75.55',
        notes: null,
        createdAt: new Date('2026-01-15T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedMeasurement]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await logMeasurement(mockUserId, measurementData);

      expect(result.weight).toBe('75.55');
    });

    it('should throw error if database insertion fails', async () => {
      const measurementData = {
        weight: '76.0',
        date: new Date('2026-01-15'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      mockDb.insert = mockInsert;

      await expect(logMeasurement(mockUserId, measurementData)).rejects.toThrow('Database error');
    });

    it('should handle duplicate measurement for same date (unique constraint)', async () => {
      const measurementData = {
        weight: '76.0',
        date: new Date('2026-01-15'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockRejectedValue(new Error('unique constraint "measurements_user_date_idx"')),
        }),
      });

      mockDb.insert = mockInsert;

      await expect(logMeasurement(mockUserId, measurementData)).rejects.toThrow(
        'unique constraint'
      );
    });

    it('should handle empty array return from database', async () => {
      const measurementData = {
        weight: '76.0',
        date: new Date('2026-01-15'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await logMeasurement(mockUserId, measurementData);

      expect(result).toBeUndefined();
    });

    it('should log measurement with all optional fields', async () => {
      const measurementData = {
        weight: '74.8',
        date: new Date('2026-01-15'),
        goalId: 'goal_456',
        notes: 'Feeling great today!',
      };

      const mockCreatedMeasurement = {
        id: 'measurement_full',
        userId: mockUserId,
        goalId: 'goal_456',
        date: new Date('2026-01-15'),
        weight: '74.80',
        notes: 'Feeling great today!',
        createdAt: new Date('2026-01-15T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedMeasurement]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await logMeasurement(mockUserId, measurementData);

      expect(result.weight).toBe('74.80');
      expect(result.goalId).toBe('goal_456');
      expect(result.notes).toBe('Feeling great today!');
    });
  });
});
