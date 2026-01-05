import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMeasurements } from './get-measurements';
import * as dbModule from '@/lib/db';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('MoProgress (fetch measurements)', () => {
  const mockUserId = 'user_test123';
  const mockDb = dbModule.db as unknown as {
    select: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMeasurements', () => {
    it('should return measurements ordered by date DESC (newest first)', async () => {
      const mockMeasurements = [
        {
          id: 'measurement_3',
          userId: mockUserId,
          goalId: null,
          date: new Date('2026-01-15'),
          weight: '74.00',
          notes: null,
          createdAt: new Date('2026-01-15T00:00:00Z'),
          updatedAt: new Date('2026-01-15T00:00:00Z'),
        },
        {
          id: 'measurement_2',
          userId: mockUserId,
          goalId: null,
          date: new Date('2026-01-10'),
          weight: '75.50',
          notes: null,
          createdAt: new Date('2026-01-10T00:00:00Z'),
          updatedAt: new Date('2026-01-10T00:00:00Z'),
        },
        {
          id: 'measurement_1',
          userId: mockUserId,
          goalId: null,
          date: new Date('2026-01-05'),
          weight: '77.00',
          notes: null,
          createdAt: new Date('2026-01-05T00:00:00Z'),
          updatedAt: new Date('2026-01-05T00:00:00Z'),
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockMeasurements),
            }),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getMeasurements(mockUserId, 30);

      expect(result).toEqual(mockMeasurements);
      expect(result[0].date).toEqual(new Date('2026-01-15')); // Newest first
      expect(result[2].date).toEqual(new Date('2026-01-05')); // Oldest last
    });

    it('should limit results to default 30', async () => {
      const mockMeasurements = Array.from({ length: 30 }, (_, i) => ({
        id: `measurement_${i}`,
        userId: mockUserId,
        goalId: null,
        date: new Date(`2026-01-${30 - i}`),
        weight: `${80 - i * 0.5}`,
        notes: null,
        createdAt: new Date(`2026-01-${30 - i}T00:00:00Z`),
        updatedAt: new Date(`2026-01-${30 - i}T00:00:00Z`),
      }));

      const mockLimit = vi.fn().mockResolvedValue(mockMeasurements);
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: mockLimit,
            }),
          }),
        }),
      });

      mockDb.select = mockSelect;

      await getMeasurements(mockUserId);

      expect(mockLimit).toHaveBeenCalledWith(30);
    });

    it('should respect custom limit parameter', async () => {
      const mockMeasurements = Array.from({ length: 10 }, (_, i) => ({
        id: `measurement_${i}`,
        userId: mockUserId,
        goalId: null,
        date: new Date(`2026-01-${10 - i}`),
        weight: `${80 - i * 0.5}`,
        notes: null,
        createdAt: new Date(`2026-01-${10 - i}T00:00:00Z`),
        updatedAt: new Date(`2026-01-${10 - i}T00:00:00Z`),
      }));

      const mockLimit = vi.fn().mockResolvedValue(mockMeasurements);
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: mockLimit,
            }),
          }),
        }),
      });

      mockDb.select = mockSelect;

      await getMeasurements(mockUserId, 10);

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('should return empty array when no measurements exist', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getMeasurements(mockUserId, 30);

      expect(result).toEqual([]);
    });

    it('should return measurements with notes', async () => {
      const mockMeasurements = [
        {
          id: 'measurement_with_notes',
          userId: mockUserId,
          goalId: null,
          date: new Date('2026-01-15'),
          weight: '74.00',
          notes: 'Morning weight, feeling good',
          createdAt: new Date('2026-01-15T00:00:00Z'),
          updatedAt: new Date('2026-01-15T00:00:00Z'),
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockMeasurements),
            }),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getMeasurements(mockUserId, 30);

      expect(result[0].notes).toBe('Morning weight, feeling good');
    });

    it('should return measurements with goalId', async () => {
      const mockMeasurements = [
        {
          id: 'measurement_with_goal',
          userId: mockUserId,
          goalId: 'goal_123',
          date: new Date('2026-01-15'),
          weight: '74.00',
          notes: null,
          createdAt: new Date('2026-01-15T00:00:00Z'),
          updatedAt: new Date('2026-01-15T00:00:00Z'),
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockMeasurements),
            }),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getMeasurements(mockUserId, 30);

      expect(result[0].goalId).toBe('goal_123');
    });

    it('should filter measurements by userId only', async () => {
      const mockMeasurements = [
        {
          id: 'measurement_user123_1',
          userId: mockUserId,
          goalId: null,
          date: new Date('2026-01-15'),
          weight: '74.00',
          notes: null,
          createdAt: new Date('2026-01-15T00:00:00Z'),
          updatedAt: new Date('2026-01-15T00:00:00Z'),
        },
        {
          id: 'measurement_user123_2',
          userId: mockUserId,
          goalId: null,
          date: new Date('2026-01-10'),
          weight: '75.50',
          notes: null,
          createdAt: new Date('2026-01-10T00:00:00Z'),
          updatedAt: new Date('2026-01-10T00:00:00Z'),
        },
      ];

      const mockWhere = vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(mockMeasurements),
        }),
      });

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: mockWhere,
        }),
      });

      mockDb.select = mockSelect;

      const result = await getMeasurements(mockUserId, 30);

      expect(mockWhere).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.userId === mockUserId)).toBe(true);
    });

    it('should throw error if database query fails', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockRejectedValue(new Error('Database connection error')),
            }),
          }),
        }),
      });

      mockDb.select = mockSelect;

      await expect(getMeasurements(mockUserId, 30)).rejects.toThrow('Database connection error');
    });

    it('should handle limit of 1', async () => {
      const mockMeasurements = [
        {
          id: 'measurement_latest',
          userId: mockUserId,
          goalId: null,
          date: new Date('2026-01-15'),
          weight: '74.00',
          notes: null,
          createdAt: new Date('2026-01-15T00:00:00Z'),
          updatedAt: new Date('2026-01-15T00:00:00Z'),
        },
      ];

      const mockLimit = vi.fn().mockResolvedValue(mockMeasurements);
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: mockLimit,
            }),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getMeasurements(mockUserId, 1);

      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });

    it('should handle large limit (100)', async () => {
      const mockMeasurements = Array.from({ length: 100 }, (_, i) => ({
        id: `measurement_${i}`,
        userId: mockUserId,
        goalId: null,
        date: new Date(`2026-01-${(i % 30) + 1}`),
        weight: `${80 - i * 0.1}`,
        notes: null,
        createdAt: new Date(`2026-01-${(i % 30) + 1}T00:00:00Z`),
        updatedAt: new Date(`2026-01-${(i % 30) + 1}T00:00:00Z`),
      }));

      const mockLimit = vi.fn().mockResolvedValue(mockMeasurements);
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: mockLimit,
            }),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getMeasurements(mockUserId, 100);

      expect(mockLimit).toHaveBeenCalledWith(100);
      expect(result).toHaveLength(100);
    });
  });
});
