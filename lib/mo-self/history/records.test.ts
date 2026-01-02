import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkAndRecordPR,
  calculateEstimated1RM,
  getAllPRs,
  getExercisePRHistory,
  getCurrentPR,
  getRecentPRs,
} from './records';
import * as dbModule from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      personalRecords: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      exercises: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe('MoRecords - Comprehensive Tests', () => {
  const mockUserId = 'user_123';
  const mockExerciseId = 'exercise_456';
  const mockDb = dbModule.db as unknown as {
    query: {
      personalRecords: {
        findFirst: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
      };
      exercises: {
        findFirst: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
      };
    };
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for exercise lookup
    mockDb.query.exercises.findFirst.mockResolvedValue({
      id: mockExerciseId,
      name: 'Bench Press',
    });
  });

  describe('calculateEstimated1RM', () => {
    it('should return weight for 1 rep (actual 1RM)', () => {
      const result = calculateEstimated1RM(225, 1);
      expect(result).toBe(225);
    });

    it('should use Brzycki formula for 2-12 reps', () => {
      // 185 lbs × 5 reps
      // Formula: weight × (36 / (37 - reps))
      // 185 × (36 / 32) = 185 × 1.125 = 208.125
      const result = calculateEstimated1RM(185, 5);
      expect(result).toBeCloseTo(208.125, 2);
    });

    it('should use modified formula for >12 reps', () => {
      // weight × (1 + reps / 30)
      // 135 × (1 + 15/30) = 135 × 1.5 = 202.5
      const result = calculateEstimated1RM(135, 15);
      expect(result).toBeCloseTo(202.5, 2);
    });

    it('should handle boundary at 12 reps correctly', () => {
      // At exactly 12 reps, should use Brzycki
      // 200 × (36 / 25) = 200 × 1.44 = 288
      const result = calculateEstimated1RM(200, 12);
      expect(result).toBeCloseTo(288, 2);
    });

    it('should handle boundary at 13 reps correctly', () => {
      // At 13 reps, should use modified formula
      // 200 × (1 + 13/30) = 200 × 1.433... = 286.67
      const result = calculateEstimated1RM(200, 13);
      expect(result).toBeCloseTo(286.67, 2);
    });
  });

  describe('checkAndRecordPR', () => {
    it('should create new PR for first lift', async () => {
      mockDb.query.personalRecords.findFirst.mockResolvedValue(null);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'pr_1',
              userId: mockUserId,
              exerciseId: mockExerciseId,
              weight: '185',
              reps: 5,
              estimated1RM: '200',
              achievedAt: new Date(),
            },
          ]),
        }),
      });

      const result = await checkAndRecordPR(mockUserId, mockExerciseId, 185, 5);

      expect(result.isNewPR).toBe(true);
      expect(result.prType).toBe('estimated1rm'); // First lift defaults to estimated1rm
    });

    it('should detect weight PR when lifting heavier', async () => {
      mockDb.query.personalRecords.findFirst.mockResolvedValue({
        id: 'pr_old',
        userId: mockUserId,
        exerciseId: mockExerciseId,
        weight: '185',
        reps: 5,
        estimated1RM: '200',
        achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        workoutSetId: null,
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'pr_new',
              userId: mockUserId,
              exerciseId: mockExerciseId,
              weight: '205',
              reps: 5,
              estimated1RM: '220',
              achievedAt: new Date(),
              workoutSetId: null,
            },
          ]),
        }),
      });

      const result = await checkAndRecordPR(
        mockUserId,
        mockExerciseId,
        205, // Heavier
        5
      );

      expect(result.isNewPR).toBe(true);
      expect(result.prType).toBe('weight');
      expect(result.improvement?.weight).toBeGreaterThan(0);
    });

    it('should detect rep PR when doing more reps at same weight', async () => {
      mockDb.query.personalRecords.findFirst.mockResolvedValue({
        id: 'pr_old',
        userId: mockUserId,
        exerciseId: mockExerciseId,
        weight: '185',
        reps: 5,
        estimated1RM: '200',
        achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        workoutSetId: null,
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'pr_new',
              userId: mockUserId,
              exerciseId: mockExerciseId,
              weight: '185',
              reps: 8,
              estimated1RM: '215',
              achievedAt: new Date(),
              workoutSetId: null,
            },
          ]),
        }),
      });

      const result = await checkAndRecordPR(
        mockUserId,
        mockExerciseId,
        185,
        8 // More reps
      );

      expect(result.isNewPR).toBe(true);
      expect(result.prType).toBe('reps');
    });

    it('should detect estimated 1RM PR', async () => {
      mockDb.query.personalRecords.findFirst.mockResolvedValue({
        id: 'pr_old',
        userId: mockUserId,
        exerciseId: mockExerciseId,
        weight: '185',
        reps: 5,
        estimated1RM: '200',
        achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        workoutSetId: null,
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'pr_new',
              userId: mockUserId,
              exerciseId: mockExerciseId,
              weight: '175',
              reps: 10,
              estimated1RM: '225',
              achievedAt: new Date(),
              workoutSetId: null,
            },
          ]),
        }),
      });

      const result = await checkAndRecordPR(
        mockUserId,
        mockExerciseId,
        175,
        10 // More volume
      );

      expect(result.isNewPR).toBe(true);
      expect(result.prType).toBe('estimated1rm');
    });

    it('should return no PR when performance is worse', async () => {
      mockDb.query.personalRecords.findFirst.mockResolvedValue({
        id: 'pr_old',
        userId: mockUserId,
        exerciseId: mockExerciseId,
        weight: '225',
        reps: 5,
        estimated1RM: '245',
        achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        workoutSetId: null,
      });

      const result = await checkAndRecordPR(
        mockUserId,
        mockExerciseId,
        185, // Lighter weight
        5
      );

      expect(result.isNewPR).toBe(false);
      expect(result.prType).toBeNull();
    });

    it('should include improvement metrics for new PRs', async () => {
      mockDb.query.personalRecords.findFirst.mockResolvedValue({
        id: 'pr_old',
        userId: mockUserId,
        exerciseId: mockExerciseId,
        weight: '185',
        reps: 5,
        estimated1RM: '200',
        achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        workoutSetId: null,
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'pr_new',
              userId: mockUserId,
              exerciseId: mockExerciseId,
              weight: '205',
              reps: 5,
              estimated1RM: '220',
              achievedAt: new Date(),
              workoutSetId: null,
            },
          ]),
        }),
      });

      const result = await checkAndRecordPR(mockUserId, mockExerciseId, 205, 5);

      expect(result.improvement).toBeDefined();
      expect(result.improvement?.weight).toBe(20); // 205 - 185
      expect(result.improvement?.estimated1RM).toBeGreaterThan(0);
    });

    it('should handle missing exercise gracefully', async () => {
      mockDb.query.personalRecords.findFirst.mockResolvedValue(null);
      mockDb.query.exercises.findFirst.mockResolvedValue(null); // No exercise found

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'pr_1',
              userId: mockUserId,
              exerciseId: mockExerciseId,
              weight: '185',
              reps: 5,
              estimated1RM: '200',
              achievedAt: new Date(),
            },
          ]),
        }),
      });

      const result = await checkAndRecordPR(mockUserId, mockExerciseId, 185, 5);

      expect(result.isNewPR).toBe(true);
      expect(result.newRecord?.exerciseName).toBe(''); // Empty string for missing exercise
    });
  });

  describe('getAllPRs', () => {
    it('should return best PR per exercise', async () => {
      const mockRecords = [
        // Bench Press - older, lower
        {
          id: 'pr_1',
          userId: mockUserId,
          exerciseId: 'bench',
          weight: '185',
          reps: 5,
          estimated1RM: '200',
          achievedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        // Bench Press - newer, higher (should be selected)
        {
          id: 'pr_2',
          userId: mockUserId,
          exerciseId: 'bench',
          weight: '205',
          reps: 5,
          estimated1RM: '220',
          achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        // Squat
        {
          id: 'pr_3',
          userId: mockUserId,
          exerciseId: 'squat',
          weight: '315',
          reps: 5,
          estimated1RM: '340',
          achievedAt: new Date(),
        },
      ];

      mockDb.query.personalRecords.findMany.mockResolvedValue(mockRecords);
      mockDb.query.exercises.findMany.mockResolvedValue([
        { id: 'bench', name: 'Bench Press' },
        { id: 'squat', name: 'Squat' },
      ]);

      const result = await getAllPRs(mockUserId);

      expect(result).toHaveLength(2); // One per exercise
      const benchPR = result.find((r) => r.exerciseId === 'bench');
      expect(benchPR?.weight).toBe(205); // Should pick the higher PR
      expect(benchPR?.estimated1RM).toBe(220);
    });

    it('should handle user with no PRs', async () => {
      mockDb.query.personalRecords.findMany.mockResolvedValue([]);

      const result = await getAllPRs(mockUserId);

      expect(result).toEqual([]);
    });

    it('should handle missing exercise names gracefully', async () => {
      mockDb.query.personalRecords.findMany.mockResolvedValue([
        {
          id: 'pr_1',
          userId: mockUserId,
          exerciseId: 'unknown_exercise',
          weight: '185',
          reps: 5,
          estimated1RM: '200',
          achievedAt: new Date(),
        },
      ]);
      mockDb.query.exercises.findMany.mockResolvedValue([]); // No exercises found

      const result = await getAllPRs(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].exerciseName).toBe(''); // Empty string for missing
    });
  });

  describe('getExercisePRHistory', () => {
    it('should return all PRs for specific exercise in chronological order', async () => {
      const mockRecords = [
        {
          id: 'pr_3',
          userId: mockUserId,
          exerciseId: mockExerciseId,
          weight: '205',
          reps: 5,
          estimated1RM: '220',
          achievedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Most recent
        },
        {
          id: 'pr_2',
          userId: mockUserId,
          exerciseId: mockExerciseId,
          weight: '195',
          reps: 5,
          estimated1RM: '210',
          achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'pr_1',
          userId: mockUserId,
          exerciseId: mockExerciseId,
          weight: '185',
          reps: 5,
          estimated1RM: '200',
          achievedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Oldest
        },
      ];

      mockDb.query.personalRecords.findMany.mockResolvedValue(mockRecords);
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        name: 'Bench Press',
      });

      const result = await getExercisePRHistory(mockUserId, mockExerciseId);

      expect(result).toHaveLength(3);
      expect(result[0].weight).toBe(205); // Most recent first
      expect(result[2].weight).toBe(185); // Oldest last
      expect(result[0].exerciseName).toBe('Bench Press');
    });

    it('should return empty array if no PRs for exercise', async () => {
      mockDb.query.personalRecords.findMany.mockResolvedValue([]);

      const result = await getExercisePRHistory(mockUserId, mockExerciseId);

      expect(result).toEqual([]);
    });
  });

  describe('getCurrentPR', () => {
    it('should return current best PR by estimated 1RM', async () => {
      mockDb.query.personalRecords.findFirst.mockResolvedValue({
        id: 'pr_best',
        userId: mockUserId,
        exerciseId: mockExerciseId,
        weight: '205',
        reps: 5,
        estimated1RM: '220',
        achievedAt: new Date(),
      });
      mockDb.query.exercises.findFirst.mockResolvedValue({
        id: mockExerciseId,
        name: 'Bench Press',
      });

      const result = await getCurrentPR(mockUserId, mockExerciseId);

      expect(result).not.toBeNull();
      expect(result?.weight).toBe(205);
      expect(result?.estimated1RM).toBe(220);
      expect(result?.exerciseName).toBe('Bench Press');
    });

    it('should return null if no PR exists', async () => {
      mockDb.query.personalRecords.findFirst.mockResolvedValue(null);

      const result = await getCurrentPR(mockUserId, mockExerciseId);

      expect(result).toBeNull();
    });

    it('should handle missing exercise name', async () => {
      mockDb.query.personalRecords.findFirst.mockResolvedValue({
        id: 'pr_1',
        userId: mockUserId,
        exerciseId: mockExerciseId,
        weight: '185',
        reps: 5,
        estimated1RM: '200',
        achievedAt: new Date(),
      });
      mockDb.query.exercises.findFirst.mockResolvedValue(null); // No exercise

      const result = await getCurrentPR(mockUserId, mockExerciseId);

      expect(result?.exerciseName).toBe('');
    });
  });

  describe('getRecentPRs', () => {
    it('should return PRs within specified days', async () => {
      const now = new Date();
      const mockRecords = [
        // Recent (within 7 days)
        {
          id: 'pr_recent_1',
          userId: mockUserId,
          exerciseId: 'bench',
          weight: '205',
          reps: 5,
          estimated1RM: '220',
          achievedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
          id: 'pr_recent_2',
          userId: mockUserId,
          exerciseId: 'squat',
          weight: '315',
          reps: 5,
          estimated1RM: '340',
          achievedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        // Old (more than 7 days)
        {
          id: 'pr_old',
          userId: mockUserId,
          exerciseId: 'deadlift',
          weight: '405',
          reps: 1,
          estimated1RM: '405',
          achievedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        },
      ];

      mockDb.query.personalRecords.findMany.mockResolvedValue(mockRecords);
      mockDb.query.exercises.findMany.mockResolvedValue([
        { id: 'bench', name: 'Bench Press' },
        { id: 'squat', name: 'Squat' },
      ]);

      const result = await getRecentPRs(mockUserId, 7);

      expect(result).toHaveLength(2); // Only recent PRs
      expect(result.find((r) => r.exerciseId === 'deadlift')).toBeUndefined(); // Old PR filtered out
    });

    it('should use default 7 days if not specified', async () => {
      mockDb.query.personalRecords.findMany.mockResolvedValue([
        {
          id: 'pr_1',
          userId: mockUserId,
          exerciseId: 'bench',
          weight: '205',
          reps: 5,
          estimated1RM: '220',
          achievedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
      ]);
      mockDb.query.exercises.findMany.mockResolvedValue([
        { id: 'bench', name: 'Bench Press' },
      ]);

      const result = await getRecentPRs(mockUserId); // No days parameter

      expect(result).toHaveLength(1);
    });

    it('should return empty array if no recent PRs', async () => {
      mockDb.query.personalRecords.findMany.mockResolvedValue([
        {
          id: 'pr_old',
          userId: mockUserId,
          exerciseId: 'bench',
          weight: '205',
          reps: 5,
          estimated1RM: '220',
          achievedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      ]);

      const result = await getRecentPRs(mockUserId, 7);

      expect(result).toEqual([]);
    });

    it('should handle empty PR list', async () => {
      mockDb.query.personalRecords.findMany.mockResolvedValue([]);

      const result = await getRecentPRs(mockUserId, 7);

      expect(result).toEqual([]);
    });
  });
});
