import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStreak, updateStreakOnWorkout } from './streaks';
import * as dbModule from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      streaks: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe('MoStreaks', () => {
  const mockUserId = 'user_123';
  const mockDb = dbModule.db as unknown as {
    query: { streaks: { findFirst: ReturnType<typeof vi.fn> } };
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
          where: vi.fn(),
        }),
      });

      const result = await getStreak(mockUserId);

      expect(result.streakStatus).toBe('broken');
      expect(result.isStreakActive).toBe(false);
      expect(mockDb.update).toHaveBeenCalled(); // Should reset streak
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
  });
});
