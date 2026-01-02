import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH } from './route';
import * as moSelfModule from '@/lib/mo-self';

// Mock dependencies
vi.mock('@/lib/mo-self', () => ({
  getCurrentUser: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

describe('/api/user/profile', () => {
  const mockUser = {
    id: 'user_123',
    clerkId: 'clerk_123',
    email: 'test@example.com',
    fullName: null,
    dateOfBirth: null,
    gender: null,
    heightCm: null,
    currentWeight: null,
    goalWeight: null,
    injuryHistory: null,
    chronicConditions: null,
    medications: null,
    units: null,
    experience: null,
    fitnessGoal: null,
    availableEquipment: null,
    onboardingCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/user/profile', () => {
    it('should return profile for authenticated user', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.getProfile).mockResolvedValue({
        id: 'profile_123',
        clerkId: 'clerk_123',
        email: 'test@example.com',
        fullName: 'John Doe',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        heightCm: 180,
        currentWeight: 80,
        goalWeight: 75,
        injuryHistory: null,
        chronicConditions: null,
        medications: null,
        units: 'metric',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.profile).toEqual({
        id: 'profile_123',
        clerkId: 'clerk_123',
        email: 'test@example.com',
        fullName: 'John Doe',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        heightCm: 180,
        currentWeight: 80,
        goalWeight: 75,
        injuryHistory: null,
        chronicConditions: null,
        medications: null,
        units: 'metric',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when profile is not found', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.getProfile).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Profile not found');
    });

    it('should handle decryption errors with specific error code', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.getProfile).mockRejectedValue(
        new Error('Failed to decrypt data: Invalid encryption key')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Data integrity error');
      expect(data.code).toBe('DECRYPTION_FAILED');
      expect(data.message).toContain('contact support');
    });

    it('should handle generic errors', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.getProfile).mockRejectedValue(new Error('Database connection failed'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch profile');
    });
  });

  describe('PATCH /api/user/profile', () => {
    it('should update profile with valid data', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockResolvedValue({
        id: 'profile_123',
        clerkId: 'clerk_123',
        email: 'test@example.com',
        fullName: 'Jane Smith',
        dateOfBirth: '1992-05-20',
        gender: 'female',
        heightCm: 165,
        currentWeight: 60,
        goalWeight: 58,
        injuryHistory: null,
        chronicConditions: null,
        medications: null,
        units: 'metric',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: 'Jane Smith',
          dateOfBirth: '1992-05-20',
          gender: 'female',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.profile.fullName).toBe('Jane Smith');
      expect(moSelfModule.updateProfile).toHaveBeenCalledWith(mockUser.id, {
        fullName: 'Jane Smith',
        dateOfBirth: '1992-05-20',
        gender: 'female',
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ fullName: 'Test User' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid dateOfBirth format', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ dateOfBirth: '01/15/1990' }), // Wrong format
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
      expect(data.details).toBeDefined();
    });

    it('should accept valid dateOfBirth format (YYYY-MM-DD)', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockResolvedValue({
        id: 'profile_123',
        clerkId: 'clerk_123',
        email: 'test@example.com',
        fullName: 'Test User',
        dateOfBirth: '1995-12-25',
        gender: 'male',
        heightCm: 175,
        currentWeight: 70,
        goalWeight: 68,
        injuryHistory: null,
        chronicConditions: null,
        medications: null,
        units: 'metric',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ dateOfBirth: '1995-12-25' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.profile.dateOfBirth).toBe('1995-12-25');
    });

    it('should return 400 for invalid heightCm (too short)', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ heightCm: 30 }), // Below 50cm minimum
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
    });

    it('should return 400 for invalid heightCm (too tall)', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ heightCm: 350 }), // Above 300cm maximum
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
    });

    it('should return 400 for invalid currentWeight (too light)', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ currentWeight: 15 }), // Below 20kg minimum
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
    });

    it('should return 400 for invalid gender', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ gender: 'unknown' }), // Invalid enum value
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
    });

    it('should accept all valid gender values', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const genders = ['male', 'female', 'non_binary', 'prefer_not_to_say'];

      for (const gender of genders) {
        vi.mocked(moSelfModule.updateProfile).mockResolvedValue({
          id: 'profile_123',
          clerkId: 'clerk_123',
          email: 'test@example.com',
          fullName: 'Test User',
          dateOfBirth: '1990-01-01',
          gender: gender as 'male' | 'female' | 'non_binary' | 'prefer_not_to_say',
          heightCm: 175,
          currentWeight: 70,
          goalWeight: 68,
          injuryHistory: null,
          chronicConditions: null,
          medications: null,
          units: 'metric',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const request = new NextRequest('http://localhost:3000/api/user/profile', {
          method: 'PATCH',
          body: JSON.stringify({ gender }),
        });

        const response = await PATCH(request);
        expect(response.status).toBe(200);
      }
    });

    it('should return 400 for fullName that is too long', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ fullName: 'a'.repeat(300) }), // Over 255 character limit
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
    });

    it('should return 400 for injuryHistory that is too long', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ injuryHistory: 'a'.repeat(1100) }), // Over 1000 character limit
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid data');
    });

    it('should handle decryption errors during update', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockRejectedValue(
        new Error('Failed to decrypt data: Corrupted encryption')
      );

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ fullName: 'Test User' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Data integrity error');
      expect(data.code).toBe('DECRYPTION_FAILED');
    });

    it('should handle generic errors during update', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockRejectedValue(new Error('Database write failed'));

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ fullName: 'Test User' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update profile');
    });

    it('should update health information fields', async () => {
      vi.mocked(moSelfModule.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(moSelfModule.updateProfile).mockResolvedValue({
        id: 'profile_123',
        clerkId: 'clerk_123',
        email: 'test@example.com',
        fullName: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        heightCm: 175,
        currentWeight: 70,
        goalWeight: 68,
        injuryHistory: 'Previous knee injury in 2020',
        chronicConditions: 'Mild asthma',
        medications: 'Inhaler as needed',
        units: 'metric',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          injuryHistory: 'Previous knee injury in 2020',
          chronicConditions: 'Mild asthma',
          medications: 'Inhaler as needed',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.profile.injuryHistory).toBe('Previous knee injury in 2020');
      expect(data.profile.chronicConditions).toBe('Mild asthma');
      expect(data.profile.medications).toBe('Inhaler as needed');
    });
  });
});
