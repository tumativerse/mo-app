import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock dependencies
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

// Create a mock verify function that can be controlled in tests
const mockVerify = vi.fn();

vi.mock('svix', () => ({
  Webhook: class {
    verify = mockVerify;
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe('/api/webhooks/clerk', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test123';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST /api/webhooks/clerk', () => {
    it('should return 500 if webhook secret is not configured', async () => {
      delete process.env.CLERK_WEBHOOK_SECRET;

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook secret not configured');
    });

    it('should return 400 if svix headers are missing', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn().mockReturnValue(null),
      } as never);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing svix headers');
    });

    it('should return 400 for invalid webhook signature', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,invalid_signature';
          return null;
        }),
      } as never);

      mockVerify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({ type: 'user.created', data: { id: 'user_123' } }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid signature');
    });

    it('should handle user.created event successfully', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com', id: 'email_123' }],
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const { db } = await import('@/lib/db');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null as never);

      const returningMock = vi.fn().mockResolvedValue([{ id: 'new_user_id' }]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as never);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.insert).toHaveBeenCalled();
      expect(valuesMock).toHaveBeenCalledWith({
        clerkId: 'user_123',
        email: 'test@example.com',
        units: 'imperial',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should not create user if they already exist', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com', id: 'email_123' }],
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const { db } = await import('@/lib/db');
      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        id: 'existing_user_id',
        clerkId: 'user_123',
        email: 'test@example.com',
      } as never);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.insert).not.toHaveBeenCalled();
    });

    it('should handle user.created with empty email array (test events)', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [], // Empty for test events
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle user.updated event successfully', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.updated',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'newemail@example.com', id: 'email_123' }],
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const { db } = await import('@/lib/db');
      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        id: 'existing_user_id',
        clerkId: 'user_123',
        email: 'oldemail@example.com',
      } as never);

      const whereMock = vi.fn().mockResolvedValue(undefined);
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db.update).mockReturnValue({ set: setMock } as never);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalledWith({
        email: 'newemail@example.com',
        updatedAt: expect.any(Date),
      });
    });

    it('should not update user if email has not changed', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.updated',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'same@example.com', id: 'email_123' }],
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const { db } = await import('@/lib/db');
      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        id: 'existing_user_id',
        clerkId: 'user_123',
        email: 'same@example.com',
      } as never);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should create user on user.updated if they do not exist', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.updated',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com', id: 'email_123' }],
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const { db } = await import('@/lib/db');
      // First call for updated check, second call inside handleUserCreated
      vi.mocked(db.query.users.findFirst)
        .mockResolvedValueOnce(null as never)
        .mockResolvedValueOnce(null as never);

      const returningMock = vi.fn().mockResolvedValue([{ id: 'new_user_id' }]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as never);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.insert).toHaveBeenCalled();
    });

    it('should handle user.deleted event successfully', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.deleted',
        data: {
          id: 'user_123',
          email_addresses: [],
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const { db } = await import('@/lib/db');
      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        id: 'existing_user_id',
        clerkId: 'user_123',
        email: 'test@example.com',
      } as never);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle user.deleted for non-existent user', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.deleted',
        data: {
          id: 'user_123',
          email_addresses: [],
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const { db } = await import('@/lib/db');
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null as never);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 500 on database error during user.created', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com', id: 'email_123' }],
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const { db } = await import('@/lib/db');
      vi.mocked(db.query.users.findFirst).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook handler failed');
    });

    it('should handle unknown event type gracefully', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.unknown_event' as never,
        data: {
          id: 'user_123',
          email_addresses: [],
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should throw error for user.created with malformed email data', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ id: 'email_123' }], // Missing email_address field
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook handler failed');
    });

    it('should throw error for user.updated with malformed email data', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.updated',
        data: {
          id: 'user_123',
          email_addresses: [{ id: 'email_123' }], // Missing email_address field
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook handler failed');
    });

    it('should handle user.updated with empty email array (test events)', async () => {
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn((key: string) => {
          if (key === 'svix-id') return 'msg_123';
          if (key === 'svix-timestamp') return '1234567890';
          if (key === 'svix-signature') return 'v1,valid_signature';
          return null;
        }),
      } as never);

      const eventData = {
        type: 'user.updated',
        data: {
          id: 'user_123',
          email_addresses: [], // Empty for test events
          created_at: 1234567890,
        },
      };

      mockVerify.mockReturnValue(eventData);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
