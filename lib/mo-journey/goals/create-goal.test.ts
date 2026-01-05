import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createGoal } from './create-goal';
import * as dbModule from '@/lib/db';
import { goals } from '@/lib/db/schema';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
  },
}));

describe('MoGoalCreate', () => {
  const mockUserId = 'user_test123';
  const mockDb = dbModule.db as unknown as {
    insert: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createGoal', () => {
    it('should create a goal with correct data and return it', async () => {
      const goalData = {
        goalType: 'fat_loss' as const,
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.5',
        targetWeight: '75.0',
      };

      const mockCreatedGoal = {
        id: 'goal_123',
        userId: mockUserId,
        goalType: 'fat_loss',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.50',
        targetWeight: '75.00',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedGoal]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await createGoal(mockUserId, goalData);

      expect(mockInsert).toHaveBeenCalledWith(goals);
      expect(result).toEqual(mockCreatedGoal);
      expect(result.status).toBe('active');
      expect(result.userId).toBe(mockUserId);
    });

    it('should create a muscle_building goal', async () => {
      const goalData = {
        goalType: 'muscle_building' as const,
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-07-01'),
        startingWeight: '70.0',
        targetWeight: '75.0',
      };

      const mockCreatedGoal = {
        id: 'goal_456',
        userId: mockUserId,
        goalType: 'muscle_building',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-07-01'),
        startingWeight: '70.00',
        targetWeight: '75.00',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedGoal]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await createGoal(mockUserId, goalData);

      expect(result.goalType).toBe('muscle_building');
      expect(result.status).toBe('active');
    });

    it('should create a recomp goal', async () => {
      const goalData = {
        goalType: 'recomp' as const,
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-06-01'),
        startingWeight: '75.0',
        targetWeight: '75.0',
      };

      const mockCreatedGoal = {
        id: 'goal_789',
        userId: mockUserId,
        goalType: 'recomp',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-06-01'),
        startingWeight: '75.00',
        targetWeight: '75.00',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedGoal]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await createGoal(mockUserId, goalData);

      expect(result.goalType).toBe('recomp');
      expect(result.startingWeight).toBe(result.targetWeight);
    });

    it('should set status to active automatically', async () => {
      const goalData = {
        goalType: 'fat_loss' as const,
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.0',
        targetWeight: '75.0',
      };

      const mockCreatedGoal = {
        id: 'goal_status_test',
        userId: mockUserId,
        goalType: 'fat_loss',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreatedGoal]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await createGoal(mockUserId, goalData);

      // Verify the status was set to 'active' in the values call
      const valuesCall = mockInsert().values;
      expect(valuesCall).toHaveBeenCalled();
      expect(result.status).toBe('active');
    });

    it('should throw error if database insertion fails', async () => {
      const goalData = {
        goalType: 'fat_loss' as const,
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.0',
        targetWeight: '75.0',
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      mockDb.insert = mockInsert;

      await expect(createGoal(mockUserId, goalData)).rejects.toThrow('Database error');
    });

    it('should handle empty array return from database', async () => {
      const goalData = {
        goalType: 'fat_loss' as const,
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.0',
        targetWeight: '75.0',
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      mockDb.insert = mockInsert;

      const result = await createGoal(mockUserId, goalData);

      expect(result).toBeUndefined();
    });
  });
});
