import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { hasCompletedOnboarding } from "@/lib/mo-self";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/api/webhooks(.*)",
  "/test-theme(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();

    // Check onboarding status for authenticated users
    // Skip onboarding check for:
    // - Onboarding routes themselves
    // - API routes (they handle their own logic)
    if (!isOnboardingRoute(req) && !isApiRoute(req)) {
      const completed = await hasCompletedOnboarding();

      // If user hasn't completed onboarding, redirect to step 1
      if (completed === false) {
        const onboardingUrl = new URL("/onboarding/step-1", req.url);
        return NextResponse.redirect(onboardingUrl);
      }
    }

    // If user has completed onboarding but is trying to access onboarding, redirect to dashboard
    if (isOnboardingRoute(req)) {
      const completed = await hasCompletedOnboarding();
      if (completed === true) {
        const dashboardUrl = new URL("/dashboard", req.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
