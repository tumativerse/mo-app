import { test, expect } from '@playwright/test';

/**
 * Critical Path: Onboarding Flow
 *
 * Tests the complete onboarding flow from step 1 to completion.
 * Verifies data persistence, validation, and navigation.
 * Runs on every pre-push hook.
 */

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/onboarding');
    await page.evaluate(() => localStorage.clear());
  });

  test('displays onboarding landing page with start button', async ({ page }) => {
    await page.goto('/onboarding');

    // Should show welcome/landing page
    await expect(page).toHaveURL('/onboarding');

    // Should have a way to start onboarding
    const startButton = page.getByRole('button', { name: /start|begin|let's go/i });
    await expect(startButton).toBeVisible();
  });

  test('step 1: validates required fields before allowing continue', async ({ page }) => {
    await page.goto('/onboarding/step-1');

    // Try to continue without filling anything
    const continueButton = page.getByRole('button', { name: /continue/i });
    await continueButton.click();

    // Should show specific validation error for full name
    await expect(page.getByText(/enter your full name/i)).toBeVisible();
  });

  test('step 1: validates date of birth is required', async ({ page }) => {
    await page.goto('/onboarding/step-1');

    // Fill only name
    await page.getByLabel(/full name/i).fill('John Doe');

    // Try to continue
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error for date of birth
    await expect(page.getByText(/select your date of birth/i)).toBeVisible();
  });

  test('step 1: validates gender is required', async ({ page }) => {
    await page.goto('/onboarding/step-1');

    // Fill name and DOB but not gender
    await page.getByLabel(/full name/i).fill('John Doe');

    // Click the date picker button to open it
    const datePickerButton = page
      .locator('button')
      .filter({ hasText: /select date/i })
      .or(page.locator('[role="button"]').filter({ hasText: /pick a date/i }));
    await datePickerButton.first().click();

    // Select a date (click on day 15)
    await page.locator('button').filter({ hasText: /^15$/ }).first().click();

    // Try to continue
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error for gender
    await expect(page.getByText(/select your gender/i)).toBeVisible();
  });

  test('step 1: validates height is required (imperial)', async ({ page }) => {
    await page.goto('/onboarding/step-1');

    // Fill required fields except height
    await page.getByLabel(/full name/i).fill('John Doe');

    // Select DOB
    const datePickerButton = page
      .locator('button')
      .filter({ hasText: /select date/i })
      .or(page.locator('[role="button"]').filter({ hasText: /pick a date/i }));
    await datePickerButton.first().click();
    await page.locator('button').filter({ hasText: /^15$/ }).first().click();

    // Select gender - click the dropdown placeholder
    await page.locator('text=Select gender').click();
    await page.getByRole('option', { name: /male/i }).click();

    // Try to continue without height
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error for height
    await expect(page.getByText(/enter your height/i)).toBeVisible();
  });

  test('step 1: validates weight is required (imperial)', async ({ page }) => {
    await page.goto('/onboarding/step-1');

    // Fill all fields except weight
    await page.getByLabel(/full name/i).fill('John Doe');

    // Select DOB
    const datePickerButton = page
      .locator('button')
      .filter({ hasText: /select date/i })
      .or(page.locator('[role="button"]').filter({ hasText: /pick a date/i }));
    await datePickerButton.first().click();
    await page.locator('button').filter({ hasText: /^15$/ }).first().click();

    // Select gender
    await page.locator('text=Select gender').click();
    await page.getByRole('option', { name: /male/i }).click();

    // Fill height (imperial - feet and inches)
    await page
      .getByLabel(/height.*ft/i)
      .or(page.locator('input[placeholder="5"]'))
      .fill('5');
    await page
      .getByLabel(/height.*in/i)
      .or(page.locator('input[placeholder="10"]'))
      .fill('10');

    // Try to continue without weight
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error for weight
    await expect(page.getByText(/enter your weight/i)).toBeVisible();
  });

  test('step 1: successfully saves data and navigates to step 2', async ({ page }) => {
    await page.goto('/onboarding/step-1');

    // Fill all required fields (imperial units)
    await page.getByLabel(/full name/i).fill('John Doe');
    await page.getByLabel(/what should mo call you/i).fill('Johnny');

    // Select DOB
    const datePickerButton = page
      .locator('button')
      .filter({ hasText: /select date/i })
      .or(page.locator('[role="button"]').filter({ hasText: /pick a date/i }));
    await datePickerButton.first().click();
    await page.locator('button').filter({ hasText: /^15$/ }).first().click();

    // Select gender
    await page.locator('text=Select gender').click();
    await page.getByRole('option', { name: /male/i }).click();

    // Fill height and weight (imperial)
    await page
      .getByLabel(/height.*ft/i)
      .or(page.locator('input[placeholder="5"]'))
      .fill('5');
    await page
      .getByLabel(/height.*in/i)
      .or(page.locator('input[placeholder="10"]'))
      .fill('10');
    await page
      .getByLabel(/weight/i)
      .or(page.locator('input[placeholder="154"]'))
      .fill('180');

    // Click continue
    await page.getByRole('button', { name: /continue/i }).click();

    // Should navigate to step 2
    await expect(page).toHaveURL('/onboarding/step-2');

    // Verify data was saved to localStorage
    const savedData = await page.evaluate(() => {
      const data = localStorage.getItem('onboarding_step1');
      return data ? JSON.parse(data) : null;
    });

    expect(savedData).toBeTruthy();
    expect(savedData.fullName).toBe('John Doe');
    expect(savedData.preferredName).toBe('Johnny');
    expect(savedData.gender).toBe('male');
  });

  test('step 2: validates at least one fitness goal is selected', async ({ page }) => {
    await page.goto('/onboarding/step-2');

    // Try to continue without selecting any goals
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error
    await expect(page.getByText(/select at least one fitness goal/i)).toBeVisible();
  });

  test('step 2: validates experience level is required', async ({ page }) => {
    await page.goto('/onboarding/step-2');

    // Select a fitness goal
    await page.getByText(/build muscle/i).click();

    // Try to continue without experience level
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error for experience level
    await expect(page.getByText(/select your experience level/i)).toBeVisible();
  });

  test('step 2: successfully saves data and navigates to step 3', async ({ page }) => {
    await page.goto('/onboarding/step-2');

    // Select fitness goals
    await page.getByText(/build muscle/i).click();
    await page.getByText(/increase strength/i).click();

    // Select experience level
    await page.getByText(/intermediate/i).click();

    // Click continue
    await page.getByRole('button', { name: /continue/i }).click();

    // Should navigate to step 3
    await expect(page).toHaveURL('/onboarding/step-3');
  });

  test('step 3: validates equipment level is required', async ({ page }) => {
    await page.goto('/onboarding/step-3');

    // Try to continue without selecting equipment level
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error
    await expect(page.getByText(/select your equipment level/i)).toBeVisible();
  });

  test('step 3: validates at least one equipment item for full gym', async ({ page }) => {
    await page.goto('/onboarding/step-3');

    // Select full gym
    await page.getByText(/full gym/i).click();

    // Try to continue without selecting equipment
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error
    await expect(page.getByText(/select at least one available equipment/i)).toBeVisible();
  });

  test('step 3: successfully saves data and navigates to step 4', async ({ page }) => {
    await page.goto('/onboarding/step-3');

    // Select equipment level
    await page.getByText(/home gym/i).click();

    // Select equipment items
    await page.getByText(/dumbbells/i).click();
    await page.getByText(/barbell/i).click();

    // Click continue
    await page.getByRole('button', { name: /continue/i }).click();

    // Should navigate to step 4
    await expect(page).toHaveURL('/onboarding/step-4');
  });

  test('step 4: validates activity level is required', async ({ page }) => {
    await page.goto('/onboarding/step-4');

    // Try to continue without selecting activity level
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error
    await expect(page.getByText(/select your activity level/i)).toBeVisible();
  });

  test('step 4: validates sleep hours is required', async ({ page }) => {
    await page.goto('/onboarding/step-4');

    // Select activity level
    await page.getByText(/moderately active/i).click();

    // Try to continue without sleep hours
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error
    await expect(page.getByText(/select your average sleep hours/i)).toBeVisible();
  });

  test('step 4: validates stress level is required', async ({ page }) => {
    await page.goto('/onboarding/step-4');

    // Select activity level and sleep
    await page.getByText(/moderately active/i).click();
    await page.getByText(/7-8 hours/i).click();

    // Try to continue without stress level
    await page.getByRole('button', { name: /continue/i }).click();

    // Should show error
    await expect(page.getByText(/select your stress level/i)).toBeVisible();
  });

  test('step 4: successfully saves data and navigates to step 5', async ({ page }) => {
    await page.goto('/onboarding/step-4');

    // Fill all required fields
    await page.getByText(/moderately active/i).click();
    await page.getByText(/7-8 hours/i).click();
    await page.getByText(/moderate/i).click();

    // Click continue
    await page.getByRole('button', { name: /continue/i }).click();

    // Should navigate to step 5
    await expect(page).toHaveURL('/onboarding/step-5');
  });

  test('step 5: successfully completes onboarding', async ({ page }) => {
    await page.goto('/onboarding/step-5');

    // Step 5 is theme selection - has default so no validation needed
    // Just click finish
    await page.getByRole('button', { name: /finish|complete/i }).click();

    // Should save all data to backend and redirect (to dashboard or success page)
    await page.waitForTimeout(2000);

    // Should NOT be on onboarding anymore
    const url = page.url();
    expect(url).not.toContain('/onboarding/step-');
  });

  test('complete flow: can complete all steps from start to finish', async ({ page }) => {
    // Start at landing page
    await page.goto('/onboarding');

    // Click start if there's a start button
    const startButton = page.getByRole('button', { name: /start|begin|let's go/i });
    if (await startButton.isVisible()) {
      await startButton.click();
    } else {
      // Otherwise navigate directly to step 1
      await page.goto('/onboarding/step-1');
    }

    // Step 1: Profile
    await page.getByLabel(/full name/i).fill('Test User');

    const datePickerButton = page
      .locator('button')
      .filter({ hasText: /select date/i })
      .or(page.locator('[role="button"]').filter({ hasText: /pick a date/i }));
    await datePickerButton.first().click();
    await page.locator('button').filter({ hasText: /^15$/ }).first().click();

    await page.locator('text=Select gender').click();
    await page.getByRole('option', { name: /male/i }).click();

    await page
      .getByLabel(/height.*ft/i)
      .or(page.locator('input[placeholder="5"]'))
      .fill('6');
    await page
      .getByLabel(/height.*in/i)
      .or(page.locator('input[placeholder="10"]'))
      .fill('0');
    await page
      .getByLabel(/weight/i)
      .or(page.locator('input[placeholder="154"]'))
      .fill('200');

    await page.getByRole('button', { name: /continue/i }).click();

    // Step 2: Goals & Experience
    await expect(page).toHaveURL('/onboarding/step-2');
    await page.getByText(/build muscle/i).click();
    await page.getByText(/beginner/i).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 3: Equipment
    await expect(page).toHaveURL('/onboarding/step-3');
    await page.getByText(/bodyweight/i).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 4: Lifestyle
    await expect(page).toHaveURL('/onboarding/step-4');
    await page.getByText(/lightly active/i).click();
    await page.getByText(/6-7 hours/i).click();
    await page.getByText(/low/i).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 5: Theme
    await expect(page).toHaveURL('/onboarding/step-5');
    await page.getByRole('button', { name: /finish|complete/i }).click();

    // Wait for completion
    await page.waitForTimeout(2000);

    // Should complete and redirect away from onboarding
    const url = page.url();
    expect(url).not.toContain('/onboarding/step-');
  });

  test('allows navigating back to previous steps', async ({ page }) => {
    // Go to step 2
    await page.goto('/onboarding/step-2');

    // Click back button if exists
    const backButton = page.getByRole('button', { name: /back|previous/i });
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL('/onboarding/step-1');
    }
    // If no back button, browser back should work (test that separately if needed)
  });
});
