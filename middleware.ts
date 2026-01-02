import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/api/webhooks(.*)',
  '/test-theme(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);
const isApiRoute = createRouteMatcher(['/api(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();

    // Get session claims to check onboarding status
    const { sessionClaims } = await auth();
    const publicMetadata = sessionClaims?.publicMetadata as
      | { onboardingCompleted?: boolean }
      | undefined;
    const onboardingCompleted = publicMetadata?.onboardingCompleted;

    // If user hasn't completed onboarding, redirect to onboarding
    // Skip for: onboarding routes themselves and API routes
    if (!isOnboardingRoute(req) && !isApiRoute(req)) {
      if (!onboardingCompleted) {
        const onboardingUrl = new URL('/onboarding/step-1', req.url);
        return NextResponse.redirect(onboardingUrl);
      }
    }

    // If user has completed onboarding but is trying to access onboarding, redirect to dashboard
    if (isOnboardingRoute(req) && onboardingCompleted) {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
