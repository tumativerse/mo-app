import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Onboarding Entry Point
 *
 * Redirects to the first step of onboarding.
 */
export default function OnboardingPage() {
  redirect('/onboarding/step-1');
}
