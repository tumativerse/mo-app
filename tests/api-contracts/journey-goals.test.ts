/**
 * API Contract Test: /api/journey/goals
 * Verifies request/response schemas and business logic
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/journey/goals/route';
import { PATCH, DELETE } from '@/app/api/journey/goals/[id]/route';
import * as moSelf from '@/lib/mo-self';
import * as moJourney from '@/lib/mo-journey';

// Mock dependencies
vi.mock('@/lib/mo-self', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/mo-journey', () => ({
  createGoal: vi.fn(),
  getActiveGoal: vi.fn(),
  updateGoal: vi.fn(),
}));

const mockGetCurrentUser = moSelf.getCurrentUser as ReturnType<typeof vi.fn>;
const mockCreateGoal = moJourney.createGoal as ReturnType<typeof vi.fn>;
const mockGetActiveGoal = moJourney.getActiveGoal as ReturnType<typeof vi.fn>;
const mockUpdateGoal = moJourney.updateGoal as ReturnType<typeof vi.fn>;

describe('API Contract: /api/journey/goals', () => {
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

  describe('POST /api/journey/goals', () => {
    it('should create a goal successfully', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetActiveGoal.mockResolvedValue(null); // No existing goal

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

      mockCreateGoal.mockResolvedValue(mockGoal);

      const request = new NextRequest('http://localhost:3000/api/journey/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalType: 'fat_loss',
          startingWeight: 80.0,
          targetWeight: 75.0,
          targetDate: '2026-04-01T00:00:00.000Z',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.goal).toBeDefined();
      expect(data.goal.goalType).toBe('fat_loss');
      expect(mockCreateGoal).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          goalType: 'fat_loss',
          startingWeight: '80',
          targetWeight: '75',
        })
      );
    });

    it('should reject if user already has active goal', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const existingGoal = {
        id: 'goal_existing',
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

      mockGetActiveGoal.mockResolvedValue(existingGoal);

      const request = new NextRequest('http://localhost:3000/api/journey/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalType: 'fat_loss',
          startingWeight: 80.0,
          targetWeight: 75.0,
          targetDate: '2026-04-01T00:00:00.000Z',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already have an active goal');
      expect(mockCreateGoal).not.toHaveBeenCalled();
    });

    it('should return 401 if user not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/journey/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalType: 'fat_loss',
          startingWeight: 80.0,
          targetWeight: 75.0,
          targetDate: '2026-04-01T00:00:00.000Z',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate input data', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/journey/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalType: 'invalid_type',
          startingWeight: -10,
          targetWeight: -5,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid');
    });
  });

  describe('GET /api/journey/goals', () => {
    it('should return active goal', async () => {
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

      mockGetActiveGoal.mockResolvedValue(mockGoal);

      const request = new NextRequest('http://localhost:3000/api/journey/goals');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.goal).toBeDefined();
      expect(data.goal.id).toBe('goal_123');
      expect(data.goal.goalType).toBe('fat_loss');
    });

    it('should return null when no active goal', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetActiveGoal.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/journey/goals');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.goal).toBeNull();
    });

    it('should return 401 if user not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/journey/goals');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('PATCH /api/journey/goals/[id]', () => {
    it('should update goal successfully', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const updatedGoal = {
        id: 'goal_123',
        userId: mockUser.id,
        goalType: 'fat_loss',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-05-01'),
        startingWeight: '80.00',
        targetWeight: '73.00',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-15'),
      };

      mockUpdateGoal.mockResolvedValue(updatedGoal);

      const request = new NextRequest('http://localhost:3000/api/journey/goals/goal_123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDate: '2026-05-01T00:00:00.000Z',
          targetWeight: 73.0,
        }),
      });

      const response = await PATCH(request, { params: { id: 'goal_123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.goal).toBeDefined();
      expect(data.goal.targetWeight).toBe('73.00');
      expect(mockUpdateGoal).toHaveBeenCalledWith(
        'goal_123',
        expect.objectContaining({
          targetWeight: '73',
        })
      );
    });

    it('should return 401 if user not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/journey/goals/goal_123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetWeight: 73.0,
        }),
      });

      const response = await PATCH(request, { params: { id: 'goal_123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/journey/goals/[id]', () => {
    it('should archive goal successfully', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const archivedGoal = {
        id: 'goal_123',
        userId: mockUser.id,
        goalType: 'fat_loss',
        status: 'archived',
        startDate: new Date('2026-01-01'),
        targetDate: new Date('2026-04-01'),
        startingWeight: '80.00',
        targetWeight: '75.00',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-15'),
      };

      mockUpdateGoal.mockResolvedValue(archivedGoal);

      const request = new NextRequest('http://localhost:3000/api/journey/goals/goal_123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'goal_123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockUpdateGoal).toHaveBeenCalledWith('goal_123', { status: 'archived' });
    });

    it('should return 401 if user not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/journey/goals/goal_123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'goal_123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
