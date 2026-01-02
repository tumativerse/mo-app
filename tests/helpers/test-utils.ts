/**
 * E2E Test Utilities
 *
 * Common utilities for E2E tests to reduce boilerplate
 * and ensure consistent test patterns.
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for page to be fully loaded and ready
 *
 * @param page - Playwright page object
 * @param timeout - Maximum wait time in ms (default: 10000)
 */
export async function waitForPageReady(page: Page, timeout: number = 10000): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout });
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Navigate to a page and wait for it to be ready
 *
 * @param page - Playwright page object
 * @param path - Path to navigate to (e.g., '/dashboard')
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForPageReady(page);
}

/**
 * Click a button by text and wait for navigation
 *
 * @param page - Playwright page object
 * @param buttonText - Text content of the button
 */
export async function clickAndWaitForNavigation(page: Page, buttonText: string): Promise<void> {
  await Promise.all([page.waitForNavigation(), page.click(`button:has-text("${buttonText}")`)]);
}

/**
 * Fill a form field by label
 *
 * @param page - Playwright page object
 * @param label - Label text of the input
 * @param value - Value to fill
 */
export async function fillFieldByLabel(page: Page, label: string, value: string): Promise<void> {
  const input = page.locator(
    `label:has-text("${label}") + input, label:has-text("${label}") input`
  );
  await input.fill(value);
}

/**
 * Check if an element is visible on the page
 *
 * @param page - Playwright page object
 * @param selector - CSS selector or text content
 * @returns true if element is visible
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    await page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for a toast/notification to appear with specific text
 *
 * @param page - Playwright page object
 * @param text - Expected toast text
 * @param timeout - Maximum wait time in ms (default: 5000)
 */
export async function waitForToast(
  page: Page,
  text: string,
  timeout: number = 5000
): Promise<void> {
  // Sonner toasts typically appear in a toast container
  const toast = page
    .locator(`[data-sonner-toast]:has-text("${text}")`)
    .or(page.locator(`.toast:has-text("${text}")`));
  await toast.waitFor({ state: 'visible', timeout });
}

/**
 * Screenshot helper for debugging failed tests
 *
 * @param page - Playwright page object
 * @param name - Screenshot name
 */
export async function takeDebugScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Wait for API call to complete
 *
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to match (e.g., '/api/workout')
 * @param method - HTTP method (default: 'GET')
 */
export async function waitForApiCall(
  page: Page,
  urlPattern: string,
  method: string = 'GET'
): Promise<void> {
  await page.waitForResponse(
    (response) =>
      response.url().includes(urlPattern) &&
      response.request().method() === method &&
      response.status() === 200,
    { timeout: 10000 }
  );
}

/**
 * Assert that user is redirected to a specific path
 *
 * @param page - Playwright page object
 * @param expectedPath - Expected path or regex
 */
export async function expectRedirectTo(page: Page, expectedPath: string | RegExp): Promise<void> {
  await page.waitForURL(expectedPath, { timeout: 10000 });
  await expect(page).toHaveURL(expectedPath);
}

/**
 * Assert that an element contains specific text
 *
 * @param page - Playwright page object
 * @param selector - CSS selector
 * @param text - Expected text content
 */
export async function expectTextContent(page: Page, selector: string, text: string): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toContainText(text);
}
