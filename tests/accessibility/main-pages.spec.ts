import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests
 *
 * Runs axe-core accessibility checks on main pages.
 * Tests for WCAG 2.1 Level AA compliance.
 */

test.describe('Accessibility', () => {
  test('home page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('sign-in page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/sign-in');

    // Wait for Clerk iframe to load
    await page.waitForSelector('iframe', { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test.skip('dashboard should not have any automatically detectable accessibility issues', async ({ page }) => {
    // TODO: Add authenticated session
    await page.goto('/dashboard');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
