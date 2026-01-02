import { test, expect } from '@playwright/test';
import { signIn, TEST_USER } from '../../helpers/auth';
import { navigateTo, waitForPageReady } from '../../helpers/test-utils';

/**
 * Critical Path: Dashboard and Navigation
 *
 * Tests core app navigation and dashboard functionality.
 * Requires authenticated session.
 *
 * NOTE: These tests are skipped by default until TEST_USER_EMAIL and
 * TEST_USER_PASSWORD environment variables are configured.
 *
 * To enable these tests:
 * 1. Create a test user in Clerk dashboard
 * 2. Set environment variables:
 *    TEST_USER_EMAIL=your-test@email.com
 *    TEST_USER_PASSWORD=YourTestPassword123!
 * 3. Run: npm run test:e2e:critical
 */

const hasTestCredentials = Boolean(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);

test.describe('Dashboard - Authenticated Users', () => {
  // Skip all tests in this suite if credentials are not configured
  test.skip(!hasTestCredentials, 'Skipping authenticated tests - no test credentials configured');

  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await signIn(page, TEST_USER.email, TEST_USER.password);
  });

  test('can access dashboard after login', async ({ page }) => {
    await navigateTo(page, '/dashboard');

    // Should be on dashboard (not redirected to sign-in)
    expect(page.url()).toContain('/dashboard');

    // Should see dashboard content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('can navigate to workout page from dashboard', async ({ page }) => {
    await navigateTo(page, '/dashboard');

    // Look for workout navigation (link, button, or nav item)
    const workoutLink = page
      .locator('a[href*="workout"]')
      .or(page.locator('button:has-text("Workout")'))
      .or(page.locator('nav >> text=/workout/i'));

    await workoutLink.first().click();
    await waitForPageReady(page);

    // Should navigate to workout page
    expect(page.url()).toMatch(/\/workout/);
  });

  test('can navigate to progress page from dashboard', async ({ page }) => {
    await navigateTo(page, '/dashboard');

    // Look for progress navigation
    const progressLink = page
      .locator('a[href*="progress"]')
      .or(page.locator('button:has-text("Progress")'))
      .or(page.locator('nav >> text=/progress/i'));

    await progressLink.first().click();
    await waitForPageReady(page);

    // Should navigate to progress page
    expect(page.url()).toMatch(/\/progress/);
  });

  test('can navigate to settings page from dashboard', async ({ page }) => {
    await navigateTo(page, '/dashboard');

    // Look for settings navigation
    const settingsLink = page
      .locator('a[href*="settings"]')
      .or(page.locator('button:has-text("Settings")'))
      .or(page.locator('nav >> text=/settings/i'));

    await settingsLink.first().click();
    await waitForPageReady(page);

    // Should navigate to settings page
    expect(page.url()).toMatch(/\/settings/);
  });

  test('dashboard displays user-specific content', async ({ page }) => {
    await navigateTo(page, '/dashboard');

    // Dashboard should show some personalized content
    // This could be workout stats, streak counter, upcoming workouts, etc.
    const mainContent = page.locator('main').or(page.locator('[role="main"]'));
    await expect(mainContent).toBeVisible();

    // Should have at least some content cards or sections
    const cards = page.locator('[class*="card"]').or(page.locator('[data-testid*="card"]'));
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });
});
