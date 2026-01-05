import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getGoalProgress } from './calculate-progress';
import * as dbModule from '@/lib/db';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('MoProgressCalculate (embedded intelligence)', () => {
  const mockDb = dbModule.db as unknown as {
    select: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGoalProgress - Fat Loss', () => {
    it('should calculate progress for fat loss goal (on track)', async () => {
      const goalId = 'goal_fat_loss_on_track';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-04-01'); // 90 days
      const now = new Date('2026-02-15'); // Day 45 (halfway)

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00', // Starting: 80kg
        targetWeight: '75.00', // Target: 75kg (5kg loss)
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'measurement_latest',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '77.50', // Lost 2.5kg out of 5kg (50% progress, exactly on track)
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.goalId).toBe(goalId);
      expect(result.currentWeight).toBe(77.5);
      expect(result.targetWeight).toBe(75.0);
      expect(result.startingWeight).toBe(80.0);
      expect(result.percentComplete).toBeCloseTo(50, 0); // 2.5kg / 5kg = 50%
      expect(result.daysElapsed).toBe(45);
      expect(result.daysRemaining).toBe(45);
      expect(result.expectedWeight).toBeCloseTo(77.5, 1); // Should be at 77.5kg (halfway)
      expect(result.status).toBe('on_track'); // Within 0.5kg tolerance
    });

    it('should detect "ahead" status for fat loss', async () => {
      const goalId = 'goal_fat_loss_ahead';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-04-01'); // 90 days
      const now = new Date('2026-02-15'); // Day 45 (halfway)

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'measurement_latest',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '76.00', // Lost 4kg out of 5kg (80% progress, ahead of schedule)
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.percentComplete).toBeCloseTo(80, 0); // 4kg / 5kg = 80%
      expect(result.status).toBe('ahead'); // 76kg < 77.5kg - 0.5kg
      expect(result.currentWeight).toBe(76.0);
    });

    it('should detect "behind" status for fat loss', async () => {
      const goalId = 'goal_fat_loss_behind';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-04-01'); // 90 days
      const now = new Date('2026-02-15'); // Day 45 (halfway)

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'measurement_latest',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '79.00', // Lost only 1kg out of 5kg (20% progress, behind schedule)
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.percentComplete).toBeCloseTo(20, 0); // 1kg / 5kg = 20%
      expect(result.status).toBe('behind'); // 79kg > 77.5kg + 0.5kg
      expect(result.currentWeight).toBe(79.0);
    });
  });

  describe('getGoalProgress - Muscle Building', () => {
    it('should calculate progress for muscle building goal (on track)', async () => {
      const goalId = 'goal_muscle_on_track';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-07-01'); // 180 days
      const now = new Date('2026-04-01'); // Day 90 (halfway)

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'muscle_building',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '70.00', // Starting: 70kg
        targetWeight: '75.00', // Target: 75kg (5kg gain)
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'measurement_latest',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '72.50', // Gained 2.5kg out of 5kg (50% progress)
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.percentComplete).toBeCloseTo(50, 0); // 2.5kg / 5kg = 50%
      expect(result.status).toBe('on_track');
      expect(result.currentWeight).toBe(72.5);
    });

    it('should detect "ahead" status for muscle building', async () => {
      const goalId = 'goal_muscle_ahead';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-07-01'); // 180 days
      const now = new Date('2026-04-01'); // Day 90 (halfway)

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'muscle_building',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '70.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'measurement_latest',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '74.00', // Gained 4kg out of 5kg (80% progress, ahead)
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.percentComplete).toBeCloseTo(80, 0); // 4kg / 5kg = 80%
      expect(result.status).toBe('ahead'); // 74kg > 72.5kg + 0.5kg
    });

    it('should detect "behind" status for muscle building', async () => {
      const goalId = 'goal_muscle_behind';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-07-01'); // 180 days
      const now = new Date('2026-04-01'); // Day 90 (halfway)

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'muscle_building',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '70.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'measurement_latest',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '71.00', // Gained only 1kg out of 5kg (20% progress, behind)
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.percentComplete).toBeCloseTo(20, 0); // 1kg / 5kg = 20%
      expect(result.status).toBe('behind'); // 71kg < 72.5kg - 0.5kg
    });
  });

  describe('getGoalProgress - Body Recomposition', () => {
    it('should calculate progress for recomp goal (same weight target)', async () => {
      const goalId = 'goal_recomp';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-06-01'); // 150 days
      const now = new Date('2026-03-16'); // Day 75 (halfway)

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'recomp',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '75.00', // Starting: 75kg
        targetWeight: '75.00', // Target: 75kg (maintain weight)
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'measurement_latest',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '75.00', // Maintained weight perfectly
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.percentComplete).toBe(100); // Perfect maintenance = 100%
      expect(result.status).toBe('on_track');
      expect(result.currentWeight).toBe(75.0);
      expect(result.expectedWeight).toBe(75.0);
    });

    it('should penalize recomp goal when weight deviates beyond tolerance', async () => {
      const goalId = 'goal_recomp_deviated';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-06-01');
      const now = new Date('2026-03-16');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'recomp',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '75.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'measurement_latest',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '76.50', // Deviated by 1.5kg > 0.5kg tolerance
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      // percentComplete = Math.max(0, 100 - deviation * 20)
      // deviation = 1.5kg, so 100 - 1.5 * 20 = 100 - 30 = 70%
      expect(result.percentComplete).toBe(70);
      expect(result.currentWeight).toBe(76.5);
      expect(result.expectedWeight).toBe(75.0);
    });
  });

  describe('getGoalProgress - Trend Detection', () => {
    it('should detect "improving" trend', async () => {
      const goalId = 'goal_improving_trend';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-04-01');
      const now = new Date('2026-01-20');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        // Last 7 days: 79.0, 78.9, 78.8, 78.7, 78.6, 78.5, 78.4 (avg: 78.7)
        // Previous 7 days: 79.5, 79.4, 79.3, 79.2, 79.1, 79.0, 79.0 (avg: 79.2)
        // Trend: improving (weight decreasing for fat loss)
        {
          id: 'm1',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-20'),
          weight: '78.40',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm2',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-19'),
          weight: '78.50',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm3',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-18'),
          weight: '78.60',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm4',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-17'),
          weight: '78.70',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm5',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-16'),
          weight: '78.80',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm6',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-15'),
          weight: '78.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm7',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-14'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm8',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-13'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm9',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-12'),
          weight: '79.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm10',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-11'),
          weight: '79.20',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm11',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-10'),
          weight: '79.30',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm12',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-09'),
          weight: '79.40',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm13',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-08'),
          weight: '79.50',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm14',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-07'),
          weight: '79.50',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.trend).toBe('improving');
    });

    it('should detect "stable" trend', async () => {
      const goalId = 'goal_stable_trend';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-04-01');
      const now = new Date('2026-01-20');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        // Last 7 days: all around 79.0 (avg: 79.0)
        // Previous 7 days: all around 79.0 (avg: 79.0)
        // Trend: stable (no change > 0.3kg)
        {
          id: 'm1',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-20'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm2',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-19'),
          weight: '79.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm3',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-18'),
          weight: '78.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm4',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-17'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm5',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-16'),
          weight: '79.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm6',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-15'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm7',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-14'),
          weight: '78.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm8',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-13'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm9',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-12'),
          weight: '79.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm10',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-11'),
          weight: '78.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm11',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-10'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm12',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-09'),
          weight: '79.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm13',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-08'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm14',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-07'),
          weight: '78.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.trend).toBe('stable');
    });

    it('should detect "declining" trend', async () => {
      const goalId = 'goal_declining_trend';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-04-01');
      const now = new Date('2026-01-20');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        // Last 7 days: gaining weight (avg: 79.5)
        // Previous 7 days: lower weight (avg: 79.0)
        // Trend: declining (weight increasing for fat loss goal)
        {
          id: 'm1',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-20'),
          weight: '79.60',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm2',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-19'),
          weight: '79.50',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm3',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-18'),
          weight: '79.40',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm4',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-17'),
          weight: '79.50',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm5',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-16'),
          weight: '79.60',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm6',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-15'),
          weight: '79.50',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm7',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-14'),
          weight: '79.40',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm8',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-13'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm9',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-12'),
          weight: '78.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm10',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-11'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm11',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-10'),
          weight: '79.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm12',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-09'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm13',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-08'),
          weight: '78.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm14',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-07'),
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.trend).toBe('declining');
    });

    it('should detect "improving" trend for muscle building', async () => {
      const goalId = 'goal_muscle_improving';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-07-01');
      const now = new Date('2026-01-20');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'muscle_building',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '70.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        // Last 7 days: gaining weight (avg: 71.3)
        // Previous 7 days: lower weight (avg: 70.8)
        // Trend: improving (weight increasing for muscle building)
        {
          id: 'm1',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-20'),
          weight: '71.40',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm2',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-19'),
          weight: '71.30',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm3',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-18'),
          weight: '71.20',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm4',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-17'),
          weight: '71.30',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm5',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-16'),
          weight: '71.40',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm6',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-15'),
          weight: '71.30',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm7',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-14'),
          weight: '71.20',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm8',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-13'),
          weight: '70.80',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm9',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-12'),
          weight: '70.70',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm10',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-11'),
          weight: '70.80',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm11',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-10'),
          weight: '70.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm12',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-09'),
          weight: '70.80',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm13',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-08'),
          weight: '70.70',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm14',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-07'),
          weight: '70.80',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.trend).toBe('improving');
    });

    it('should detect "declining" trend for muscle building', async () => {
      const goalId = 'goal_muscle_declining';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-07-01');
      const now = new Date('2026-01-20');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'muscle_building',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '70.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        // Last 7 days: losing weight (avg: 70.5)
        // Previous 7 days: higher weight (avg: 71.0)
        // Trend: declining (weight decreasing for muscle building)
        {
          id: 'm1',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-20'),
          weight: '70.40',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm2',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-19'),
          weight: '70.50',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm3',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-18'),
          weight: '70.60',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm4',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-17'),
          weight: '70.50',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm5',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-16'),
          weight: '70.40',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm6',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-15'),
          weight: '70.50',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm7',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-14'),
          weight: '70.60',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm8',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-13'),
          weight: '71.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm9',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-12'),
          weight: '71.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm10',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-11'),
          weight: '71.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm11',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-10'),
          weight: '70.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm12',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-09'),
          weight: '71.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm13',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-08'),
          weight: '71.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm14',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-07'),
          weight: '71.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.trend).toBe('declining');
    });

    it('should detect "stable" trend for muscle building', async () => {
      const goalId = 'goal_muscle_stable';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-07-01');
      const now = new Date('2026-01-20');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'muscle_building',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '70.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        // Last 7 days: stable weight (avg: 71.0)
        // Previous 7 days: stable weight (avg: 71.0)
        // Trend: stable (change < 0.3kg)
        {
          id: 'm1',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-20'),
          weight: '71.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm2',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-19'),
          weight: '71.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm3',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-18'),
          weight: '70.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm4',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-17'),
          weight: '71.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm5',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-16'),
          weight: '71.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm6',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-15'),
          weight: '71.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm7',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-14'),
          weight: '70.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm8',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-13'),
          weight: '71.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm9',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-12'),
          weight: '71.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm10',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-11'),
          weight: '70.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm11',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-10'),
          weight: '71.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm12',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-09'),
          weight: '71.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm13',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-08'),
          weight: '71.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm14',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-07'),
          weight: '70.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.trend).toBe('stable');
    });

    it('should return "stable" trend when insufficient historical data', async () => {
      const goalId = 'goal_insufficient_data';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-04-01');
      const now = new Date('2026-01-10');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        // Exactly 7 measurements - passes line 133 (>= 7) but previous.slice(7,14) is empty (line 138)
        {
          id: 'm1',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-10'),
          weight: '79.50',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm2',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-09'),
          weight: '79.60',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm3',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-08'),
          weight: '79.70',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm4',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-07'),
          weight: '79.80',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm5',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-06'),
          weight: '79.90',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm6',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-05'),
          weight: '80.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'm7',
          userId: 'user_123',
          goalId,
          date: new Date('2026-01-04'),
          weight: '80.10',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      // Should return stable when previous.length === 0 (line 138)
      expect(result.trend).toBe('stable');
    });
  });

  describe('getGoalProgress - Recommendations', () => {
    it('should generate recommendations for ahead status', async () => {
      const goalId = 'goal_recommendations_ahead';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-04-01');
      const now = new Date('2026-02-15');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'm1',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '76.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate recommendations for behind status', async () => {
      const goalId = 'goal_recommendations_behind';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-04-01');
      const now = new Date('2026-02-15');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'm1',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '79.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getGoalProgress - Edge Cases', () => {
    it('should throw error when goal not found', async () => {
      const goalId = 'nonexistent_goal';

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.select = mockSelect;

      await expect(getGoalProgress(goalId)).rejects.toThrow('Goal not found');
    });

    it('should use starting weight when no measurements exist', async () => {
      const goalId = 'goal_no_measurements';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-04-01');
      const now = new Date('2026-01-15');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.currentWeight).toBe(80.0); // Should use starting weight
      expect(result.percentComplete).toBe(0); // No progress made
    });

    it('should cap percent complete at 100%', async () => {
      const goalId = 'goal_over_100';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-04-01');
      const now = new Date('2026-02-15');

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'm1',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '73.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        }, // Exceeded goal by 2kg
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.percentComplete).toBeLessThanOrEqual(100); // Should be capped at 100%
    });

    it('should handle goal with 0 days remaining', async () => {
      const goalId = 'goal_zero_days';
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-01-15');
      const now = new Date('2026-01-15'); // Target date is today

      const mockGoal = {
        id: goalId,
        userId: 'user_123',
        goalType: 'fat_loss',
        status: 'active',
        startDate,
        targetDate,
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: startDate,
        updatedAt: startDate,
      };

      const mockMeasurements = [
        {
          id: 'm1',
          userId: 'user_123',
          goalId,
          date: now,
          weight: '76.00',
          notes: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const mockSelect = vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockGoal]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockMeasurements),
              }),
            }),
          }),
        });

      mockDb.select = mockSelect;

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = await getGoalProgress(goalId);

      vi.useRealTimers();

      expect(result.daysRemaining).toBeGreaterThanOrEqual(0); // Should not be negative
    });
  });
});
