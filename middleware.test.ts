import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextFetchEvent } from 'next/server';

/**
 * Middleware Unit Tests
 *
 * Tests the authentication and onboarding redirect logic.
 * Critical for security - ensures users can't access protected routes.
 */

// Mock Clerk middleware
const mockProtect = vi.fn();
const mockAuth = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (
    callback: (
      auth: typeof mockAuth & { protect: typeof mockProtect },
      req: NextRequest
    ) => Promise<unknown>
  ) => {
    return async (req: NextRequest) => {
      // Create auth function with protect method
      const auth = mockAuth as typeof mockAuth & { protect: typeof mockProtect };
      auth.protect = mockProtect;
      return callback(auth, req);
    };
  },
  createRouteMatcher: (patterns: string[]) => {
    return (req: { url: string }) => {
      const url = new URL(req.url);
      return patterns.some((pattern) => {
        // Convert Clerk's route pattern to regex
        // /login(.*) becomes /^\/login.*/
        const regexPattern = pattern.replace(/\(\.\*\)/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(url.pathname);
      });
    };
  },
}));

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      redirect: vi.fn((url: URL) => ({ redirected: true, url: url.toString() })),
      next: vi.fn(() => ({ redirected: false })),
    },
  };
});

describe('Middleware', () => {
  // Mock NextFetchEvent
  const mockEvent = {} as NextFetchEvent;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules(); // Clear module cache to ensure mocks are applied
    // Configure default mock return values
    mockProtect.mockResolvedValue(undefined);
    mockAuth.mockResolvedValue({ sessionClaims: null });
  });

  describe('Public Routes', () => {
    it('should allow access to homepage without auth', async () => {
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(mockProtect).not.toHaveBeenCalled();
    });

    it('should allow access to /login without auth', async () => {
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/login', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(mockProtect).not.toHaveBeenCalled();
    });

    it('should allow access to /signup without auth', async () => {
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/signup', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(mockProtect).not.toHaveBeenCalled();
    });

    it('should allow access to /api/webhooks without auth', async () => {
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/api/webhooks/clerk', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(mockProtect).not.toHaveBeenCalled();
    });

    it('should allow access to /test-theme without auth', async () => {
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/test-theme', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(mockProtect).not.toHaveBeenCalled();
    });
  });

  describe('Protected Routes - Authentication', () => {
    it('should call auth.protect() for /dashboard', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: true },
        },
      });

      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/dashboard', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(mockProtect).toHaveBeenCalled();
    });

    it('should call auth.protect() for /workout', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: true },
        },
      });

      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/workout', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(mockProtect).toHaveBeenCalled();
    });

    it('should call auth.protect() for /onboarding routes', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: false },
        },
      });

      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/onboarding/step-1', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(mockProtect).toHaveBeenCalled();
    });
  });

  describe('Onboarding Redirects - Incomplete Onboarding', () => {
    it('should redirect to /onboarding/step-1 when user has not completed onboarding and tries to access /dashboard', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: false },
        },
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/dashboard', { method: 'GET' });

      const result = await middleware(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/onboarding/step-1',
        })
      );
      expect(result).toEqual({ redirected: true, url: 'http://localhost:3000/onboarding/step-1' });
    });

    it('should redirect to /onboarding/step-1 when user has not completed onboarding and tries to access /workout', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: false },
        },
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/workout', { method: 'GET' });

      const result = await middleware(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/onboarding/step-1',
        })
      );
      expect(result).toEqual({ redirected: true, url: 'http://localhost:3000/onboarding/step-1' });
    });

    it('should redirect to /onboarding/step-1 when publicMetadata is undefined', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: undefined,
        },
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/dashboard', { method: 'GET' });

      const result = await middleware(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/onboarding/step-1',
        })
      );
      expect(result).toEqual({ redirected: true, url: 'http://localhost:3000/onboarding/step-1' });
    });

    it('should redirect to /onboarding/step-1 when onboardingCompleted is false', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: false },
        },
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/progress', { method: 'GET' });

      const result = await middleware(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/onboarding/step-1',
        })
      );
      expect(result).toEqual({ redirected: true, url: 'http://localhost:3000/onboarding/step-1' });
    });
  });

  describe('Onboarding Redirects - Exception Cases', () => {
    it('should NOT redirect when user is already on /onboarding route (even with incomplete onboarding)', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: false },
        },
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/onboarding/step-2', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should NOT redirect API routes even with incomplete onboarding', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: false },
        },
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/api/user/profile', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe('Onboarding Redirects - Completed Onboarding', () => {
    it('should redirect to /dashboard when completed user tries to access /onboarding', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: true },
        },
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/onboarding/step-1', { method: 'GET' });

      const result = await middleware(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/dashboard',
        })
      );
      expect(result).toEqual({ redirected: true, url: 'http://localhost:3000/dashboard' });
    });

    it('should redirect to /dashboard when completed user tries to access /onboarding/step-3', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: true },
        },
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/onboarding/step-3', { method: 'GET' });

      const result = await middleware(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/dashboard',
        })
      );
      expect(result).toEqual({ redirected: true, url: 'http://localhost:3000/dashboard' });
    });

    it('should allow access to /dashboard when onboarding is completed', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: true },
        },
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/dashboard', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should allow access to /workout when onboarding is completed', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: { onboardingCompleted: true },
        },
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/workout', { method: 'GET' });

      await middleware(req, mockEvent);

      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing sessionClaims gracefully', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: null,
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/dashboard', { method: 'GET' });

      const result = await middleware(req, mockEvent);

      // Should redirect to onboarding when sessionClaims is null
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/onboarding/step-1',
        })
      );
      expect(result).toEqual({ redirected: true, url: 'http://localhost:3000/onboarding/step-1' });
    });

    it('should handle empty publicMetadata object', async () => {
      mockAuth.mockResolvedValue({
        sessionClaims: {
          publicMetadata: {},
        },
      });

      const { NextResponse } = await import('next/server');
      const middleware = (await import('./middleware')).default;
      const req = new NextRequest('http://localhost:3000/dashboard', { method: 'GET' });

      const result = await middleware(req, mockEvent);

      // Should redirect to onboarding when onboardingCompleted is not set
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/onboarding/step-1',
        })
      );
      expect(result).toEqual({ redirected: true, url: 'http://localhost:3000/onboarding/step-1' });
    });
  });
});
