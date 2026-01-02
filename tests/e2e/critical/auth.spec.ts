import { test, expect } from '@playwright/test';
import { skipAuth } from '../../helpers/auth';

/**
 * Critical Path: Authentication Flow
 *
 * These tests verify the authentication redirects and Clerk integration.
 * Runs on every pre-push hook.
 */

test.describe('Authentication - Unauthenticated Users', () => {
  test('redirects unauthenticated users from dashboard to Clerk', async ({ page }) => {
    // Attempt to visit protected dashboard page
    await page.goto('/dashboard');

    // Wait for Clerk redirect
    await page.waitForTimeout(2000);

    // Should redirect to Clerk (either /sign-in or Clerk's handshake URL)
    const url = page.url();
    expect(
      url.includes('sign-in') || url.includes('clerk.accounts.dev') || url.includes('clerk')
    ).toBeTruthy();
  });

  test('redirects unauthenticated users from workout page to Clerk', async ({ page }) => {
    // Attempt to visit protected workout page
    await page.goto('/workout');

    // Wait for Clerk redirect
    await page.waitForTimeout(2000);

    // Should redirect to Clerk authentication
    const url = page.url();
    expect(
      url.includes('sign-in') || url.includes('clerk.accounts.dev') || url.includes('clerk')
    ).toBeTruthy();
  });

  test('can access sign-in page', async ({ page }) => {
    skipAuth(); // This test doesn't require authentication

    await page.goto('/sign-in');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Should be on a Clerk-related page (may redirect through handshake)
    const url = page.url();
    expect(url.includes('sign-in') || url.includes('clerk')).toBeTruthy();
  });

  test('can access sign-up page', async ({ page }) => {
    skipAuth(); // This test doesn't require authentication

    await page.goto('/sign-up');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Should be on a Clerk-related page (may redirect through handshake)
    const url = page.url();
    expect(url.includes('sign-up') || url.includes('clerk')).toBeTruthy();
  });
});
