import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStreak, updateStreakOnWorkout, getStreakStats } from './streaks';
import * as dbModule from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      streaks: {
        findFirst: vi.fn(),
      },
      workoutSessions: {
        findMany: vi.fn(),
      },
      workouts: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe('MoStreaks', () => {
  const mockUserId = 'user_123';
  const mockDb = dbModule.db as unknown as {
    query: {
      streaks: { findFirst: ReturnType<typeof vi.fn> };
      workoutSessions: { findMany: ReturnType<typeof vi.fn> };
      workouts: { findMany: ReturnType<typeof vi.fn> };
    };
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStreak', () => {
    it('should return active streak within 48 hours', async () => {
      const now = new Date();
      const lastWorkout = new Date(now.getTime() - 20 * 60 * 60 * 1000); // 20 hours ago

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 5,
        longestStreak: 10,
        lastWorkoutDate: lastWorkout,
      });

      const result = await getStreak(mockUserId);

      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(10);
      expect(result.isStreakActive).toBe(true);
      expect(result.streakStatus).toBe('active');
      expect(result.hoursUntilBreak).toBeGreaterThan(0);
    });

    it('should mark streak as at_risk when between 24-48 hours', async () => {
      const now = new Date();
      const lastWorkout = new Date(now.getTime() - 36 * 60 * 60 * 1000); // 36 hours ago

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 5,
        longestStreak: 10,
        lastWorkoutDate: lastWorkout,
      });

      const result = await getStreak(mockUserId);

      expect(result.streakStatus).toBe('at_risk');
      expect(result.isStreakActive).toBe(true);
    });

    it('should mark streak as broken and reset after 48 hours', async () => {
      const now = new Date();
      const lastWorkout = new Date(now.getTime() - 50 * 60 * 60 * 1000); // 50 hours ago

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 5,
        longestStreak: 10,
        lastWorkoutDate: lastWorkout,
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined), // Complete the Promise chain
        }),
      });

      const result = await getStreak(mockUserId);

      expect(result.streakStatus).toBe('broken');
      expect(result.isStreakActive).toBe(false);
      expect(mockDb.update).toHaveBeenCalled(); // Should reset streak
    });

    it('should handle broken streak that is already at 0', async () => {
      const now = new Date();
      const lastWorkout = new Date(now.getTime() - 50 * 60 * 60 * 1000); // 50 hours ago

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 0, // Already at 0
        longestStreak: 10,
        lastWorkoutDate: lastWorkout,
      });

      const result = await getStreak(mockUserId);

      expect(result.streakStatus).toBe('broken');
      expect(result.isStreakActive).toBe(false);
      expect(result.currentStreak).toBe(0);
      expect(mockDb.update).not.toHaveBeenCalled(); // Should not update when already 0
    });

    it('should create new streak for new user', async () => {
      mockDb.query.streaks.findFirst.mockResolvedValue(null);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: '1',
              userId: mockUserId,
              currentStreak: 0,
              longestStreak: 0,
              lastWorkoutDate: null,
            },
          ]),
        }),
      });

      const result = await getStreak(mockUserId);

      expect(result.currentStreak).toBe(0);
      expect(result.streakStatus).toBe('broken');
      expect(result.lastWorkoutDate).toBeNull();
    });

    it('should mark as on_fire when streak >= 7 and within 24 hours', async () => {
      const now = new Date();
      const lastWorkout = new Date(now.getTime() - 10 * 60 * 60 * 1000); // 10 hours ago

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 7,
        longestStreak: 10,
        lastWorkoutDate: lastWorkout,
      });

      const result = await getStreak(mockUserId);

      expect(result.streakStatus).toBe('on_fire');
    });
  });

  describe('updateStreakOnWorkout', () => {
    it('should increment streak for consecutive workouts', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // First call in updateStreakOnWorkout - returns old streak
      mockDb.query.streaks.findFirst.mockResolvedValueOnce({
        id: '1',
        userId: mockUserId,
        currentStreak: 3,
        longestStreak: 5,
        lastWorkoutDate: yesterday,
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                id: '1',
                userId: mockUserId,
                currentStreak: 4,
                longestStreak: 5,
                lastWorkoutDate: new Date(),
              },
            ]),
          }),
        }),
      });

      // Second call in getStreak (called at end of updateStreakOnWorkout) - returns updated streak
      mockDb.query.streaks.findFirst.mockResolvedValueOnce({
        id: '1',
        userId: mockUserId,
        currentStreak: 4,
        longestStreak: 5,
        lastWorkoutDate: new Date(),
      });

      const result = await updateStreakOnWorkout(mockUserId);

      expect(result.currentStreak).toBe(4);
    });

    it('should not double-count workouts on same day', async () => {
      const today = new Date();

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 3,
        longestStreak: 5,
        lastWorkoutDate: today,
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                userId: mockUserId,
                currentStreak: 3, // Should stay same
                longestStreak: 5,
                lastWorkoutDate: today,
              },
            ]),
          }),
        }),
      });

      const result = await updateStreakOnWorkout(mockUserId);

      expect(result.currentStreak).toBe(3); // Not incremented
    });

    it('should reset streak when broken and start fresh', async () => {
      const now = new Date();
      const oldWorkout = new Date(now.getTime() - 60 * 60 * 60 * 1000); // 60 hours ago

      // First call - get existing streak (will be broken)
      mockDb.query.streaks.findFirst.mockResolvedValueOnce({
        id: '1',
        userId: mockUserId,
        currentStreak: 5,
        longestStreak: 10,
        lastWorkoutDate: oldWorkout,
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                id: '1',
                userId: mockUserId,
                currentStreak: 1, // Reset to 1
                longestStreak: 10,
                lastWorkoutDate: now,
              },
            ]),
          }),
        }),
      });

      // Second call - getStreak called at end
      mockDb.query.streaks.findFirst.mockResolvedValueOnce({
        id: '1',
        userId: mockUserId,
        currentStreak: 1,
        longestStreak: 10,
        lastWorkoutDate: now,
      });

      const result = await updateStreakOnWorkout(mockUserId);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(10);
    });
  });

  describe('updateStreakOnWorkout - edge cases', () => {
    it('should handle broken streak that is already at 0', async () => {
      const now = new Date();
      const oldWorkout = new Date(now.getTime() - 60 * 60 * 60 * 1000); // 60 hours ago

      // Streak is already 0 (broken previously)
      mockDb.query.streaks.findFirst.mockResolvedValueOnce({
        id: '1',
        userId: mockUserId,
        currentStreak: 0, // Already at 0
        longestStreak: 10,
        lastWorkoutDate: oldWorkout,
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                id: '1',
                userId: mockUserId,
                currentStreak: 1, // Start fresh
                longestStreak: 10,
                lastWorkoutDate: now,
              },
            ]),
          }),
        }),
      });

      mockDb.query.streaks.findFirst.mockResolvedValueOnce({
        id: '1',
        userId: mockUserId,
        currentStreak: 1,
        longestStreak: 10,
        lastWorkoutDate: now,
      });

      const result = await updateStreakOnWorkout(mockUserId);

      expect(result.currentStreak).toBe(1);
      // Should NOT call update with currentStreak: 0 since it's already 0
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should create streak for first workout ever', async () => {
      const now = new Date();

      // No existing streak
      mockDb.query.streaks.findFirst.mockResolvedValueOnce(null);

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: '1',
              userId: mockUserId,
              currentStreak: 1,
              longestStreak: 1,
              lastWorkoutDate: now,
            },
          ]),
        }),
      });

      // Second call - getStreak called at end
      mockDb.query.streaks.findFirst.mockResolvedValueOnce({
        id: '1',
        userId: mockUserId,
        currentStreak: 1,
        longestStreak: 1,
        lastWorkoutDate: now,
      });

      const result = await updateStreakOnWorkout(mockUserId);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
    });

    it('should handle streak record with null lastWorkoutDate', async () => {
      const now = new Date();

      // Streak exists but lastWorkoutDate is null
      mockDb.query.streaks.findFirst.mockResolvedValueOnce({
        id: '1',
        userId: mockUserId,
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                id: '1',
                userId: mockUserId,
                currentStreak: 1,
                longestStreak: 1,
                lastWorkoutDate: now,
              },
            ]),
          }),
        }),
      });

      // Second call - getStreak called at end
      mockDb.query.streaks.findFirst.mockResolvedValueOnce({
        id: '1',
        userId: mockUserId,
        currentStreak: 1,
        longestStreak: 1,
        lastWorkoutDate: now,
      });

      const result = await updateStreakOnWorkout(mockUserId);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
    });
  });

  describe('getStreak - milestone messages', () => {
    it('should show 3-day milestone message', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 20 * 60 * 60 * 1000); // 20 hours ago

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 3,
        longestStreak: 5,
        lastWorkoutDate: yesterday,
      });

      const result = await getStreak(mockUserId);

      expect(result.currentStreak).toBe(3);
      expect(result.message).toContain('3 days strong');
    });

    it('should show generic message for streaks >= 7 (not milestones)', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 20 * 60 * 60 * 1000);

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 9, // Not a specific milestone
        longestStreak: 10,
        lastWorkoutDate: yesterday,
      });

      const result = await getStreak(mockUserId);

      expect(result.currentStreak).toBe(9);
      expect(result.message).toContain('9 day streak');
      expect(result.message).toContain('Keep the fire burning');
    });

    it('should show 14-day milestone message', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 20 * 60 * 60 * 1000);

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 14,
        longestStreak: 14,
        lastWorkoutDate: yesterday,
      });

      const result = await getStreak(mockUserId);

      expect(result.currentStreak).toBe(14);
      expect(result.message).toContain('Two weeks');
      expect(result.message).toContain('habit');
    });

    it('should show 30-day milestone message', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 20 * 60 * 60 * 1000);

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 30,
        longestStreak: 30,
        lastWorkoutDate: yesterday,
      });

      const result = await getStreak(mockUserId);

      expect(result.currentStreak).toBe(30);
      expect(result.message).toContain('30 days');
      expect(result.message).toContain('unstoppable');
    });

    it('should show 50-day milestone message', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 20 * 60 * 60 * 1000);

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 50,
        longestStreak: 50,
        lastWorkoutDate: yesterday,
      });

      const result = await getStreak(mockUserId);

      expect(result.currentStreak).toBe(50);
      expect(result.message).toContain('50 days');
      expect(result.message).toContain('Elite consistency');
    });

    it('should show 100-day milestone message', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 20 * 60 * 60 * 1000);

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 100,
        longestStreak: 100,
        lastWorkoutDate: yesterday,
      });

      const result = await getStreak(mockUserId);

      expect(result.currentStreak).toBe(100);
      expect(result.message).toContain('100 DAYS');
      expect(result.message).toContain('Legendary dedication');
    });
  });

  describe('getStreakStats', () => {
    it('should return workout statistics', async () => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 7,
        longestStreak: 10,
        lastWorkoutDate: now,
      });

      // Mock workout sessions (called 3 times in order: thisWeek, thisMonth, total)
      mockDb.query.workoutSessions.findMany
        .mockResolvedValueOnce([
          // This week
          { id: '1', userId: mockUserId, status: 'completed', completedAt: now },
          { id: '2', userId: mockUserId, status: 'completed', completedAt: oneWeekAgo },
        ])
        .mockResolvedValueOnce([
          // This month
          { id: '1', userId: mockUserId, status: 'completed', completedAt: now },
          { id: '2', userId: mockUserId, status: 'completed', completedAt: oneWeekAgo },
          { id: '3', userId: mockUserId, status: 'completed', completedAt: oneMonthAgo },
        ])
        .mockResolvedValueOnce([
          // Total
          { id: '1', userId: mockUserId, status: 'completed', completedAt: now },
          { id: '2', userId: mockUserId, status: 'completed', completedAt: oneWeekAgo },
          { id: '3', userId: mockUserId, status: 'completed', completedAt: oneMonthAgo },
        ]);

      // Mock legacy workouts (called 3 times: thisWeek, thisMonth, total) - empty for this test
      mockDb.query.workouts.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await getStreakStats(mockUserId);

      expect(result.current).toBe(7);
      expect(result.longest).toBe(10);
      expect(result.totalWorkouts).toBeGreaterThan(0);
      expect(result.workoutsThisWeek).toBeGreaterThan(0);
      expect(result.workoutsThisMonth).toBeGreaterThan(0);
    });

    it('should include legacy workouts in count', async () => {
      const now = new Date();

      mockDb.query.streaks.findFirst.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        currentStreak: 5,
        longestStreak: 5,
        lastWorkoutDate: now,
      });

      // Mock new system workouts (3 calls)
      mockDb.query.workoutSessions.findMany
        .mockResolvedValueOnce([
          { id: '1', userId: mockUserId, status: 'completed', completedAt: now },
        ])
        .mockResolvedValueOnce([
          { id: '1', userId: mockUserId, status: 'completed', completedAt: now },
        ])
        .mockResolvedValueOnce([
          { id: '1', userId: mockUserId, status: 'completed', completedAt: now },
        ]);

      // Mock legacy system workouts (3 calls)
      const legacyWorkouts = [
        { id: 'legacy1', userId: mockUserId, status: 'completed', completedAt: now },
        { id: 'legacy2', userId: mockUserId, status: 'completed', completedAt: now },
      ];
      mockDb.query.workouts.findMany
        .mockResolvedValueOnce(legacyWorkouts)
        .mockResolvedValueOnce(legacyWorkouts)
        .mockResolvedValueOnce(legacyWorkouts);

      const result = await getStreakStats(mockUserId);

      // Should combine both systems
      expect(result.totalWorkouts).toBeGreaterThanOrEqual(3);
    });

    it('should handle new user with no workouts', async () => {
      mockDb.query.streaks.findFirst.mockResolvedValue(null);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: '1',
              userId: mockUserId,
              currentStreak: 0,
              longestStreak: 0,
              lastWorkoutDate: null,
            },
          ]),
        }),
      });

      // No workouts (3 calls each)
      mockDb.query.workoutSessions.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockDb.query.workouts.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await getStreakStats(mockUserId);

      expect(result.current).toBe(0);
      expect(result.longest).toBe(0);
      expect(result.totalWorkouts).toBe(0);
      expect(result.workoutsThisWeek).toBe(0);
      expect(result.workoutsThisMonth).toBe(0);
    });
  });
});
