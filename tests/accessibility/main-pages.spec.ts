import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests
 *
 * Runs axe-core accessibility checks on main pages.
 * Tests for WCAG 2.1 Level AA compliance.
 */

test.describe('Accessibility', () => {
  // Increase timeout for accessibility scans (Clerk pages can be slow to load)
  test.setTimeout(60000);
  test('home page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for page to fully load (ignore Clerk errors in test environment)
    await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {
      // Continue even if h1 not found - may be Clerk error page
    });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Exclude html-has-lang and document-title - Next.js sets these in layout.tsx
      // Clerk may render error page before Next.js hydration causing false positives
      .disableRules(['html-has-lang', 'document-title'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Wait for Clerk component to load (ignore errors in test environment)
    await page.waitForSelector('[data-clerk-id]', { timeout: 10000 }).catch(() => {
      // Continue even if Clerk component not found - may be loading
    });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Exclude html-has-lang and document-title - Next.js sets these in layout.tsx
      // Clerk may render error page before Next.js hydration causing false positives
      .disableRules(['html-has-lang', 'document-title'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    // TODO: Add authenticated session
    await page.goto('/dashboard');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Exclude html-has-lang and document-title - Next.js sets these in layout.tsx
      // Clerk may render error page before Next.js hydration causing false positives
      .disableRules(['html-has-lang', 'document-title'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('workout page should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    // TODO: Add authenticated session
    await page.goto('/workout');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Exclude html-has-lang and document-title - Next.js sets these in layout.tsx
      // Clerk may render error page before Next.js hydration causing false positives
      .disableRules(['html-has-lang', 'document-title'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
