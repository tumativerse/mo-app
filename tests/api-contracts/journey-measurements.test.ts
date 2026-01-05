/**
 * API Contract Test: /api/journey/measurements
 * Verifies request/response schemas and business logic
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/journey/measurements/route';
import * as moSelf from '@/lib/mo-self';
import * as moJourney from '@/lib/mo-journey';

// Mock dependencies
vi.mock('@/lib/mo-self', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/mo-journey', () => ({
  logMeasurement: vi.fn(),
  getMeasurements: vi.fn(),
}));

const mockGetCurrentUser = moSelf.getCurrentUser as ReturnType<typeof vi.fn>;
const mockLogMeasurement = moJourney.logMeasurement as ReturnType<typeof vi.fn>;
const mockGetMeasurements = moJourney.getMeasurements as ReturnType<typeof vi.fn>;

describe('API Contract: /api/journey/measurements', () => {
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

  describe('POST /api/journey/measurements', () => {
    it('should log measurement successfully', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const mockMeasurement = {
        id: 'measurement_123',
        userId: mockUser.id,
        goalId: 'goal_123',
        date: new Date('2026-01-15'),
        weight: '76.50',
        notes: 'Morning weight',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLogMeasurement.mockResolvedValue(mockMeasurement);

      const request = new NextRequest('http://localhost:3000/api/journey/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: 76.5,
          date: '2026-01-15T00:00:00.000Z',
          notes: 'Morning weight',
          goalId: 'goal_123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.measurement).toBeDefined();
      expect(data.measurement.weight).toBe('76.50');
      expect(data.measurement.notes).toBe('Morning weight');
      expect(mockLogMeasurement).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          weight: '76.5',
          goalId: 'goal_123',
        })
      );
    });

    it('should log measurement without optional fields', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const mockMeasurement = {
        id: 'measurement_124',
        userId: mockUser.id,
        goalId: null,
        date: new Date(),
        weight: '75.00',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLogMeasurement.mockResolvedValue(mockMeasurement);

      const request = new NextRequest('http://localhost:3000/api/journey/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: 75.0,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.measurement).toBeDefined();
      expect(data.measurement.weight).toBe('75.00');
    });

    it('should return 401 if user not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/journey/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: 76.5,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate weight is positive', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/journey/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: -10,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid');
    });

    it('should validate date format', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/journey/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: 76.5,
          date: 'invalid-date',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid');
    });
  });

  describe('GET /api/journey/measurements', () => {
    it('should return measurements with default limit', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const mockMeasurements = [
        {
          id: 'measurement_3',
          userId: mockUser.id,
          goalId: 'goal_123',
          date: new Date('2026-01-15'),
          weight: '74.00',
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'measurement_2',
          userId: mockUser.id,
          goalId: 'goal_123',
          date: new Date('2026-01-10'),
          weight: '75.50',
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetMeasurements.mockResolvedValue(mockMeasurements);

      const request = new NextRequest('http://localhost:3000/api/journey/measurements');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.measurements).toBeDefined();
      expect(data.measurements).toHaveLength(2);
      expect(mockGetMeasurements).toHaveBeenCalledWith(mockUser.id, 30);
    });

    it('should respect custom limit parameter', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetMeasurements.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/journey/measurements?limit=10');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetMeasurements).toHaveBeenCalledWith(mockUser.id, 10);
    });

    it('should return empty array when no measurements', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetMeasurements.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/journey/measurements');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.measurements).toEqual([]);
    });

    it('should return 401 if user not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/journey/measurements');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
