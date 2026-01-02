/**
 * E2E Test Authentication Helpers
 *
 * Provides utilities for authenticating users in E2E tests.
 * Uses Clerk's testing tokens for consistent test environments.
 */

import { Page } from '@playwright/test';

/**
 * Test user credentials
 * NOTE: These should be environment variables in production
 */
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
};

/**
 * Sign in a test user
 *
 * This function handles the Clerk sign-in flow for E2E tests.
 * It waits for Clerk's redirect flow to complete.
 *
 * @param page - Playwright page object
 * @param email - User email (defaults to TEST_USER.email)
 * @param password - User password (defaults to TEST_USER.password)
 */
export async function signIn(
  page: Page,
  email: string = TEST_USER.email,
  password: string = TEST_USER.password
): Promise<void> {
  // Navigate to sign-in page
  await page.goto('/sign-in');

  // Wait for Clerk to load (it may redirect through handshake)
  await page.waitForTimeout(2000);

  // Check if we're already signed in (redirected to dashboard)
  const url = page.url();
  if (url.includes('/dashboard') || url.includes('/app')) {
    console.log('Already signed in, skipping login');
    return;
  }

  // Wait for Clerk's sign-in form to appear
  // Clerk loads in an iframe or embedded component
  try {
    // Try to find email input (Clerk may use different selectors)
    const emailInput = page.locator('input[name="identifier"]').or(page.locator('input[type="email"]'));
    await emailInput.waitFor({ timeout: 10000 });
    await emailInput.fill(email);

    // Click continue/next button
    const continueButton = page.locator('button:has-text("Continue")').or(page.locator('button[type="submit"]'));
    await continueButton.click();

    // Wait for password field
    const passwordInput = page.locator('input[name="password"]').or(page.locator('input[type="password"]'));
    await passwordInput.waitFor({ timeout: 5000 });
    await passwordInput.fill(password);

    // Submit the form
    const submitButton = page.locator('button:has-text("Continue")').or(page.locator('button[type="submit"]'));
    await submitButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL(/\/(dashboard|app)/, { timeout: 15000 });
  } catch (error) {
    console.error('Sign-in failed:', error);
    throw new Error(`Failed to sign in: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sign out the current user
 *
 * @param page - Playwright page object
 */
export async function signOut(page: Page): Promise<void> {
  // Look for user button/menu
  const userButton = page.locator('[data-testid="user-button"]').or(page.locator('button:has-text("Sign out")'));

  try {
    await userButton.click({ timeout: 5000 });

    // Click sign out in dropdown/menu
    const signOutButton = page.locator('text=/sign out/i');
    await signOutButton.click();

    // Wait for redirect to home or sign-in
    await page.waitForURL(/\/(sign-in|$)/, { timeout: 10000 });
  } catch (error) {
    console.log('Sign-out button not found, user may already be signed out');
  }
}

/**
 * Check if user is currently authenticated
 *
 * @param page - Playwright page object
 * @returns true if user is signed in
 */
export async function isSignedIn(page: Page): Promise<boolean> {
  const url = page.url();
  return url.includes('/dashboard') || url.includes('/app') || url.includes('/workout');
}

/**
 * Skip authentication for tests that don't need it
 * This is a marker function to make test intent clear
 */
export function skipAuth(): void {
  // No-op function to mark tests as not requiring auth
}
