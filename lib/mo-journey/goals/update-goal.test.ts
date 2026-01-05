import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateGoal } from './update-goal';
import * as dbModule from '@/lib/db';
import { goals } from '@/lib/db/schema';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    update: vi.fn(),
  },
}));

describe('MoGoalUpdate', () => {
  const mockDb = dbModule.db as unknown as {
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateGoal', () => {
    it('should update goal and return updated record', async () => {
      const goalId = 'goal_update_test';
      const updates = {
        targetDate: new Date('2026-05-01'),
        targetWeight: '73.0',
      };

      const mockUpdatedGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-05-01'),
        startingWeight: '80.00',
        targetWeight: '73.00',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z'),
      };

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedGoal]),
          }),
        }),
      });

      mockDb.update = mockUpdate;

      const result = await updateGoal(goalId, updates);

      expect(mockUpdate).toHaveBeenCalledWith(goals);
      expect(result).toEqual(mockUpdatedGoal);
      expect(result?.targetDate).toEqual(new Date('2026-05-01'));
      expect(result?.targetWeight).toBe('73.00');
    });

    it('should update goal status to paused', async () => {
      const goalId = 'goal_pause_test';
      const updates = {
        status: 'paused' as const,
      };

      const mockUpdatedGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'muscle_building',
        status: 'paused',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-07-01'),
        startingWeight: '70.00',
        targetWeight: '75.00',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z'),
      };

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedGoal]),
          }),
        }),
      });

      mockDb.update = mockUpdate;

      const result = await updateGoal(goalId, updates);

      expect(result?.status).toBe('paused');
    });

    it('should update goal status to completed', async () => {
      const goalId = 'goal_complete_test';
      const updates = {
        status: 'completed' as const,
      };

      const mockUpdatedGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'completed',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-04-01T00:00:00Z'),
      };

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedGoal]),
          }),
        }),
      });

      mockDb.update = mockUpdate;

      const result = await updateGoal(goalId, updates);

      expect(result?.status).toBe('completed');
    });

    it('should update goal status to archived', async () => {
      const goalId = 'goal_archive_test';
      const updates = {
        status: 'archived' as const,
      };

      const mockUpdatedGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'recomp',
        status: 'archived',
        startDate: new Date('2025-01-01'),
        targetDate: new Date('2025-06-01'),
        startingWeight: '75.00',
        targetWeight: '75.00',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z'),
      };

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedGoal]),
          }),
        }),
      });

      mockDb.update = mockUpdate;

      const result = await updateGoal(goalId, updates);

      expect(result?.status).toBe('archived');
    });

    it('should update multiple fields at once', async () => {
      const goalId = 'goal_multi_update';
      const updates = {
        targetDate: new Date('2026-06-01'),
        targetWeight: '72.0',
        status: 'active' as const,
      };

      const mockUpdatedGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-06-01'),
        startingWeight: '80.00',
        targetWeight: '72.00',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z'),
      };

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedGoal]),
          }),
        }),
      });

      mockDb.update = mockUpdate;

      const result = await updateGoal(goalId, updates);

      expect(result?.targetDate).toEqual(new Date('2026-06-01'));
      expect(result?.targetWeight).toBe('72.00');
      expect(result?.status).toBe('active');
    });

    it('should update updatedAt timestamp', async () => {
      const goalId = 'goal_timestamp_test';
      const updates = {
        targetWeight: '74.0',
      };

      const originalUpdatedAt = new Date('2026-01-01T00:00:00Z');
      const newUpdatedAt = new Date('2026-01-15T12:30:00Z');

      const mockUpdatedGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.00',
        targetWeight: '74.00',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: newUpdatedAt,
      };

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedGoal]),
          }),
        }),
      });

      mockDb.update = mockUpdate;

      const result = await updateGoal(goalId, updates);

      expect(result?.updatedAt).toEqual(newUpdatedAt);
      expect(result?.updatedAt).not.toEqual(originalUpdatedAt);
    });

    it('should return undefined when goal does not exist', async () => {
      const goalId = 'nonexistent_goal';
      const updates = {
        targetWeight: '70.0',
      };

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.update = mockUpdate;

      const result = await updateGoal(goalId, updates);

      expect(result).toBeUndefined();
    });

    it('should throw error if database update fails', async () => {
      const goalId = 'goal_error_test';
      const updates = {
        targetWeight: '70.0',
      };

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockRejectedValue(new Error('Database update failed')),
          }),
        }),
      });

      mockDb.update = mockUpdate;

      await expect(updateGoal(goalId, updates)).rejects.toThrow('Database update failed');
    });

    it('should handle empty updates object', async () => {
      const goalId = 'goal_empty_update';
      const updates = {};

      const mockUpdatedGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-15T00:00:00Z'),
      };

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedGoal]),
          }),
        }),
      });

      mockDb.update = mockUpdate;

      const result = await updateGoal(goalId, updates);

      expect(result).toEqual(mockUpdatedGoal);
    });
  });
});
