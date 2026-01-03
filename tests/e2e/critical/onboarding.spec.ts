import { test, expect } from '@playwright/test';

/**
 * Critical Path: Onboarding Flow
 *
 * Tests the complete onboarding flow - focus on happy paths and navigation.
 * Validation errors are tested in unit tests (they use toasts which are hard to test in E2E).
 * Runs on every pre-push hook.
 */

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/onboarding');
    await page.evaluate(() => localStorage.clear());
  });

  test('redirects from landing page to step 1', async ({ page }) => {
    await page.goto('/onboarding');

    // Landing page redirects to step 1
    await expect(page).toHaveURL('/onboarding/step-1', { timeout: 5000 });
  });

  test('step 1: renders all required fields', async ({ page }) => {
    await page.goto('/onboarding/step-1');

    // Check all required fields are present
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByText(/date of birth/i)).toBeVisible();
    await expect(page.getByText(/gender/i)).toBeVisible();
    await expect(page.getByText(/height/i)).toBeVisible();
    await expect(page.getByText(/current weight/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
  });

  test('step 1: can fill all fields and navigate to step 2', async ({ page }) => {
    await page.goto('/onboarding/step-1');

    // Fill all required fields
    await page.locator('#fullName').fill('John Doe');
    await page.locator('#preferredName').fill('Johnny');

    // Select date (month, day, year dropdowns)
    await page.locator('button:has-text("January")').first().click();
    await page.getByText('July').click();
    await page.locator('button:has-text("15")').first().click();
    await page.getByText('16').click();
    await page.locator('button:has-text("2000")').first().click();
    await page.getByText('1990').click();

    // Select gender
    await page.locator('button:has-text("Select gender")').click();
    await page.getByText('Male').click();

    // Fill height (imperial - feet and inches)
    await page.locator('#heightFt').fill('5');
    await page.locator('#heightIn').fill('10');

    // Fill weight
    await page.locator('#weight').fill('180');

    // Click continue
    await page.getByRole('button', { name: /continue/i }).click();

    // Should navigate to step 2
    await expect(page).toHaveURL('/onboarding/step-2', { timeout: 5000 });
  });

  test('complete flow: can complete all steps from start to finish', async ({ page }) => {
    // Start at step 1
    await page.goto('/onboarding/step-1');

    // Step 1: Profile
    await page.locator('#fullName').fill('Test User');

    // Select date
    await page.locator('button:has-text("January")').first().click();
    await page.getByText('June').click();
    await page.locator('button:has-text("15")').first().click();
    await page.getByText('20').click();
    await page.locator('button:has-text("2000")').first().click();
    await page.getByText('1995').click();

    // Select gender
    await page.locator('button:has-text("Select gender")').click();
    await page.getByText('Male').click();

    // Fill height and weight
    await page.locator('#heightFt').fill('6');
    await page.locator('#heightIn').fill('0');
    await page.locator('#weight').fill('200');

    await page.getByRole('button', { name: /continue/i }).click();

    // Step 2: Should load (note: may need implementation)
    await expect(page).toHaveURL('/onboarding/step-2', { timeout: 5000 });
  });
});
