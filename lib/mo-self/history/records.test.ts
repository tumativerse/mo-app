import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkAndRecordPR } from './records';
import * as dbModule from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      personalRecords: {
        findFirst: vi.fn(),
      },
      exercises: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe('MoRecords', () => {
  const mockUserId = 'user_123';
  const mockExerciseId = 'exercise_456';
  const mockDb = dbModule.db as unknown as {
    query: {
      personalRecords: { findFirst: ReturnType<typeof vi.fn> };
      exercises: { findFirst: ReturnType<typeof vi.fn> };
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

  describe('checkAndRecordPR', () => {
    it('should create new PR for first lift', async () => {
      mockDb.query.personalRecords.findFirst.mockResolvedValue(null);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              userId: mockUserId,
              exerciseId: mockExerciseId,
              weight: '185',
              reps: 5,
              estimated1RM: '200',
              achievedAt: new Date(),
              id: 'pr_1',
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
        weight: '225',
        reps: 5,
        estimated1RM: '245',
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
  });
});
