import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getActiveGoal, getGoalById } from './get-goal';
import * as dbModule from '@/lib/db';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('MoGoals (fetch)', () => {
  const mockUserId = 'user_test123';
  const mockDb = dbModule.db as unknown as {
    select: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveGoal', () => {
    it('should return active goal for user', async () => {
      const mockActiveGoal = {
        id: 'goal_active',
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

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockActiveGoal]),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getActiveGoal(mockUserId);

      expect(result).toEqual(mockActiveGoal);
      expect(result?.status).toBe('active');
      expect(result?.userId).toBe(mockUserId);
    });

    it('should return null when no active goal exists', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getActiveGoal(mockUserId);

      expect(result).toBeNull();
    });

    it('should return null when goal is paused', async () => {
      // Should only return active goals, not paused ones
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getActiveGoal(mockUserId);

      expect(result).toBeNull();
    });

    it('should return null when goal is completed', async () => {
      // Should only return active goals, not completed ones
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getActiveGoal(mockUserId);

      expect(result).toBeNull();
    });

    it('should limit results to 1', async () => {
      const mockActiveGoal = {
        id: 'goal_active',
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

      const mockLimit = vi.fn().mockResolvedValue([mockActiveGoal]);
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: mockLimit,
          }),
        }),
      });

      mockDb.select = mockSelect;

      await getActiveGoal(mockUserId);

      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it('should throw error if database query fails', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Database connection error')),
          }),
        }),
      });

      mockDb.select = mockSelect;

      await expect(getActiveGoal(mockUserId)).rejects.toThrow('Database connection error');
    });
  });

  describe('getGoalById', () => {
    it('should return goal by ID', async () => {
      const mockGoal = {
        id: 'goal_specific',
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

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockGoal]),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getGoalById('goal_specific');

      expect(result).toEqual(mockGoal);
      expect(result?.id).toBe('goal_specific');
    });

    it('should return null when goal does not exist', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getGoalById('nonexistent_goal');

      expect(result).toBeNull();
    });

    it('should return goal regardless of status', async () => {
      // getGoalById should return goals with any status (active, paused, completed, archived)
      const mockArchivedGoal = {
        id: 'goal_archived',
        userId: mockUserId,
        goalType: 'fat_loss',
        status: 'archived',
        startDate: new Date('2025-01-01'),
        targetDate: new Date('2025-04-01'),
        startingWeight: '85.00',
        targetWeight: '80.00',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-04-01T00:00:00Z'),
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockArchivedGoal]),
          }),
        }),
      });

      mockDb.select = mockSelect;

      const result = await getGoalById('goal_archived');

      expect(result).toEqual(mockArchivedGoal);
      expect(result?.status).toBe('archived');
    });

    it('should limit results to 1', async () => {
      const mockGoal = {
        id: 'goal_limit_test',
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

      const mockLimit = vi.fn().mockResolvedValue([mockGoal]);
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: mockLimit,
          }),
        }),
      });

      mockDb.select = mockSelect;

      await getGoalById('goal_limit_test');

      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it('should throw error if database query fails', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      });

      mockDb.select = mockSelect;

      await expect(getGoalById('goal_error')).rejects.toThrow('Database error');
    });
  });
});
