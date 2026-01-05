/**
 * API Contract Test: /api/journey/goals/[id]/progress
 * Verifies request/response schemas and business logic
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/journey/goals/[id]/progress/route';
import * as moSelf from '@/lib/mo-self';
import * as moJourney from '@/lib/mo-journey';

// Mock dependencies
vi.mock('@/lib/mo-self', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/mo-journey', () => ({
  getGoalById: vi.fn(),
  getGoalProgress: vi.fn(),
}));

const mockGetCurrentUser = moSelf.getCurrentUser as ReturnType<typeof vi.fn>;
const mockGetGoalById = moJourney.getGoalById as ReturnType<typeof vi.fn>;
const mockGetGoalProgress = moJourney.getGoalProgress as ReturnType<typeof vi.fn>;

describe('API Contract: /api/journey/goals/[id]/progress', () => {
  const mockUser = {
    id: 'user_test123',
    clerkId: 'clerk_test123',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/journey/goals/[id]/progress', () => {
    it('should return progress for valid goal', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const mockGoal = {
        id: 'goal_123',
        userId: mockUser.id,
        goalType: 'fat_loss',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProgress = {
        goalId: 'goal_123',
        percentComplete: 50,
        currentWeight: 77.5,
        targetWeight: 75.0,
        startingWeight: 80.0,
        daysElapsed: 45,
        daysRemaining: 45,
        expectedWeight: 77.5,
        status: 'on_track' as const,
        recommendations: ["You're on track to reach your goal!"],
        trend: 'improving' as const,
      };

      mockGetGoalById.mockResolvedValue(mockGoal);
      mockGetGoalProgress.mockResolvedValue(mockProgress);

      const request = new NextRequest('http://localhost:3000/api/journey/goals/goal_123/progress');
      const response = await GET(request, { params: { id: 'goal_123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.progress).toBeDefined();
      expect(data.progress.goalId).toBe('goal_123');
      expect(data.progress.percentComplete).toBe(50);
      expect(data.progress.status).toBe('on_track');
      expect(data.progress.trend).toBe('improving');
      expect(data.progress.recommendations).toHaveLength(1);
    });

    it('should return progress for ahead status', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const mockGoal = {
        id: 'goal_123',
        userId: mockUser.id,
        goalType: 'fat_loss',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProgress = {
        goalId: 'goal_123',
        percentComplete: 80,
        currentWeight: 76.0,
        targetWeight: 75.0,
        startingWeight: 80.0,
        daysElapsed: 45,
        daysRemaining: 45,
        expectedWeight: 77.5,
        status: 'ahead' as const,
        recommendations: ["Great job! You're ahead of schedule."],
        trend: 'improving' as const,
      };

      mockGetGoalById.mockResolvedValue(mockGoal);
      mockGetGoalProgress.mockResolvedValue(mockProgress);

      const request = new NextRequest('http://localhost:3000/api/journey/goals/goal_123/progress');
      const response = await GET(request, { params: { id: 'goal_123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.progress.status).toBe('ahead');
      expect(data.progress.currentWeight).toBeLessThan(data.progress.expectedWeight);
    });

    it('should return progress for behind status', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const mockGoal = {
        id: 'goal_123',
        userId: mockUser.id,
        goalType: 'fat_loss',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProgress = {
        goalId: 'goal_123',
        percentComplete: 20,
        currentWeight: 79.0,
        targetWeight: 75.0,
        startingWeight: 80.0,
        daysElapsed: 45,
        daysRemaining: 45,
        expectedWeight: 77.5,
        status: 'behind' as const,
        recommendations: ["You're behind schedule. Consider adjusting your plan."],
        trend: 'declining' as const,
      };

      mockGetGoalById.mockResolvedValue(mockGoal);
      mockGetGoalProgress.mockResolvedValue(mockProgress);

      const request = new NextRequest('http://localhost:3000/api/journey/goals/goal_123/progress');
      const response = await GET(request, { params: { id: 'goal_123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.progress.status).toBe('behind');
      expect(data.progress.currentWeight).toBeGreaterThan(data.progress.expectedWeight);
    });

    it('should return 404 if goal not found', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetGoalById.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/journey/goals/nonexistent/progress'
      );
      const response = await GET(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Goal not found');
    });

    it('should return 403 if goal belongs to different user', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const otherUserGoal = {
        id: 'goal_other',
        userId: 'other_user_id',
        goalType: 'fat_loss',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetGoalById.mockResolvedValue(otherUserGoal);

      const request = new NextRequest(
        'http://localhost:3000/api/journey/goals/goal_other/progress'
      );
      const response = await GET(request, { params: { id: 'goal_other' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('should return 401 if user not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/journey/goals/goal_123/progress');
      const response = await GET(request, { params: { id: 'goal_123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should include all progress metrics', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const mockGoal = {
        id: 'goal_123',
        userId: mockUser.id,
        goalType: 'muscle_building',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-07-01'),
        startingWeight: '70.00',
        targetWeight: '75.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProgress = {
        goalId: 'goal_123',
        percentComplete: 60,
        currentWeight: 73.0,
        targetWeight: 75.0,
        startingWeight: 70.0,
        daysElapsed: 90,
        daysRemaining: 90,
        expectedWeight: 72.5,
        status: 'ahead' as const,
        recommendations: [
          "Great job! You're ahead of schedule.",
          'Your trend is improving - keep it up!',
        ],
        trend: 'improving' as const,
      };

      mockGetGoalById.mockResolvedValue(mockGoal);
      mockGetGoalProgress.mockResolvedValue(mockProgress);

      const request = new NextRequest('http://localhost:3000/api/journey/goals/goal_123/progress');
      const response = await GET(request, { params: { id: 'goal_123' } });
      const data = await response.json();

      expect(response.status).toBe(200);

      // Verify all required fields are present
      expect(data.progress).toHaveProperty('goalId');
      expect(data.progress).toHaveProperty('percentComplete');
      expect(data.progress).toHaveProperty('currentWeight');
      expect(data.progress).toHaveProperty('targetWeight');
      expect(data.progress).toHaveProperty('startingWeight');
      expect(data.progress).toHaveProperty('daysElapsed');
      expect(data.progress).toHaveProperty('daysRemaining');
      expect(data.progress).toHaveProperty('expectedWeight');
      expect(data.progress).toHaveProperty('status');
      expect(data.progress).toHaveProperty('recommendations');
      expect(data.progress).toHaveProperty('trend');

      // Verify data types
      expect(typeof data.progress.percentComplete).toBe('number');
      expect(typeof data.progress.currentWeight).toBe('number');
      expect(typeof data.progress.daysElapsed).toBe('number');
      expect(typeof data.progress.daysRemaining).toBe('number');
      expect(Array.isArray(data.progress.recommendations)).toBe(true);
      expect(['ahead', 'on_track', 'behind']).toContain(data.progress.status);
      expect(['improving', 'stable', 'declining']).toContain(data.progress.trend);
    });
  });
});
