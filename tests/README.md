# Mo App Testing Guide

## Overview

This testing suite provides comprehensive coverage for the Mo fitness tracking application:

- **Unit Tests**: Test individual functions and utilities (Vitest)
- **E2E Tests**: Test full user workflows across browsers (Playwright)
- **Accessibility Tests**: WCAG 2.1 Level AA compliance (axe)

## Quick Start

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run only critical E2E tests (faster)
npm run test:e2e:critical

# Run E2E tests in UI mode (interactive debugging)
npm run test:e2e:ui

# Run accessibility tests
npm run test:axe
```

---

## Unit Testing (Vitest)

### Running Unit Tests

```bash
# Run once
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Fast mode (only changed files, stop on first failure)
npm run test:fast
```

### Coverage Thresholds

The project enforces strict coverage requirements:
- **Statements**: 100%
- **Functions**: 100%
- **Lines**: 100%
- **Branches**: 90% (defensive error handling allowed)

### Writing Unit Tests

**Location**: Place tests next to the code they test
```
lib/
├── utils.ts
└── utils.test.ts
```

**Pattern**:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { functionToTest } from './module';

describe('Module Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should handle normal case', () => {
    const result = functionToTest('input');
    expect(result).toBe('expected output');
  });

  it('should handle edge case', () => {
    const result = functionToTest('');
    expect(result).toBeNull();
  });

  it('should throw error for invalid input', () => {
    expect(() => functionToTest(null)).toThrow('Invalid input');
  });
});
```

**Test Data**: Use shared fixtures in `tests/fixtures/test-data.ts` to avoid duplication:
```typescript
import { mockUser, mockPreferences } from '@/tests/fixtures/test-data';

it('should process user data', () => {
  const result = processUser(mockUser);
  expect(result).toBeDefined();
});
```

---

## E2E Testing (Playwright)

### Setup: Configure Test Credentials

E2E tests require a test user account in Clerk. Follow these steps:

#### 1. Create Test User in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your Mo app project
3. Go to **Users** → **Create User**
4. Create a test user:
   - Email: `test+mo@yourdomain.com` (or similar)
   - Password: A secure password (store safely!)
   - Verify the account

#### 2. Set Environment Variables

Create a `.env.test` file (NOT committed to git):

```bash
# .env.test
TEST_USER_EMAIL=test+mo@yourdomain.com
TEST_USER_PASSWORD=YourSecurePassword123!
```

Or export in your shell:
```bash
export TEST_USER_EMAIL=test+mo@yourdomain.com
export TEST_USER_PASSWORD=YourSecurePassword123!
```

#### 3. Install Playwright Browsers

```bash
npx playwright install
```

This installs Chromium, Firefox, and WebKit browsers for cross-browser testing.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run only critical path tests (faster, ~1.5 min)
npm run test:e2e:critical

# Run in UI mode (visual debugging)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/critical/workout-flow.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run on specific browser
npx playwright test --project=chromium
```

### Test Organization

```
tests/
├── e2e/
│   ├── critical/          # Critical user flows (runs in pre-push hook)
│   │   ├── auth.spec.ts           # Authentication redirects
│   │   ├── dashboard.spec.ts      # Dashboard navigation
│   │   └── workout-flow.spec.ts   # Workout creation and logging
│   └── feature/           # Feature-specific tests
│       ├── settings.spec.ts       # Settings page
│       └── progress.spec.ts       # Progress tracking
├── accessibility/         # WCAG compliance tests
│   └── main-pages.spec.ts
└── helpers/              # Reusable test utilities
    ├── auth.ts           # Authentication helpers
    └── test-utils.ts     # Common utilities
```

### Writing E2E Tests

#### Basic Pattern

```typescript
import { test, expect } from '@playwright/test';
import { signIn, TEST_USER } from '../../helpers/auth';
import { navigateTo, waitForPageReady } from '../../helpers/test-utils';

const hasTestCredentials = Boolean(
  process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD
);

test.describe('Feature Name', () => {
  // Skip tests if credentials not configured
  test.skip(!hasTestCredentials, 'Skipping - no test credentials configured');

  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await signIn(page, TEST_USER.email, TEST_USER.password);
  });

  test('should perform user action', async ({ page }) => {
    // Navigate to page
    await navigateTo(page, '/dashboard');

    // Interact with page
    const button = page.locator('button:has-text("Start Workout")');
    await button.click();
    await waitForPageReady(page);

    // Assert expected result
    expect(page.url()).toContain('/workout');
  });
});
```

#### Authentication Helpers

**Sign In**:
```typescript
import { signIn, TEST_USER } from '../../helpers/auth';

await signIn(page, TEST_USER.email, TEST_USER.password);
```

**Sign Out**:
```typescript
import { signOut } from '../../helpers/auth';

await signOut(page);
```

**Check if Signed In**:
```typescript
import { isSignedIn } from '../../helpers/auth';

const signedIn = await isSignedIn(page);
```

**Skip Auth (for public page tests)**:
```typescript
import { skipAuth } from '../../helpers/auth';

test('can access landing page', async ({ page }) => {
  skipAuth(); // Marker function - makes intent clear
  await page.goto('/');
  // Test public page...
});
```

#### Test Utilities

**Navigation**:
```typescript
import { navigateTo, waitForPageReady } from '../../helpers/test-utils';

// Navigate and wait for page to be fully loaded
await navigateTo(page, '/workout');

// Or wait after other navigation
await page.click('a[href="/progress"]');
await waitForPageReady(page);
```

**Form Filling**:
```typescript
import { fillFieldByLabel } from '../../helpers/test-utils';

await fillFieldByLabel(page, 'Weight', '135');
await fillFieldByLabel(page, 'Reps', '10');
```

**Toast Notifications**:
```typescript
import { waitForToast } from '../../helpers/test-utils';

await page.click('button:has-text("Save")');
await waitForToast(page, 'Workout saved!');
```

**API Calls**:
```typescript
import { waitForApiCall } from '../../helpers/test-utils';

await page.click('button:has-text("Load")');
await waitForApiCall(page, '/api/workout', 'GET');
```

**Debugging**:
```typescript
import { takeDebugScreenshot } from '../../helpers/test-utils';

// Take screenshot for debugging
await takeDebugScreenshot(page, 'workout-page-error');
```

### Locator Patterns

**Best Practices**:
```typescript
// ✅ GOOD: Use semantic selectors
const button = page.locator('button:has-text("Start")');
const heading = page.getByRole('heading', { name: 'Dashboard' });
const link = page.getByRole('link', { name: 'Settings' });

// ✅ GOOD: Use data-testid for dynamic content
const exerciseCard = page.locator('[data-testid="exercise-card"]');

// ⚠️  OK: Use .or() for flexible matching
const startButton = page.locator('button:has-text("Start")')
  .or(page.locator('a:has-text("Start Workout")'));

// ❌ BAD: Fragile selectors that break easily
const button = page.locator('div.flex > button.bg-primary'); // CSS classes change
const text = page.locator('xpath=/html/body/div[2]/p'); // Brittle structure
```

### Mobile Testing

Test on mobile viewports:
```typescript
test('is responsive on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await navigateTo(page, '/workout');

  // Verify no horizontal scroll
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
});
```

Playwright automatically tests Mobile Chrome and Mobile Safari (configured in `playwright.config.ts`).

### Cross-Browser Testing

Tests run on all configured browsers:
- Desktop Chrome (Chromium)
- Desktop Firefox
- Desktop Safari (WebKit)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

To run on specific browser:
```bash
npx playwright test --project=chromium
npx playwright test --project=webkit
```

---

## Adding New E2E Tests

### Step-by-Step Guide

**1. Identify the User Flow**

What is the user trying to accomplish?
- Examples: "Create a new workout", "View progress chart", "Update settings"

**2. Determine Criticality**

- **Critical Path**: Core functionality that MUST always work (goes in `tests/e2e/critical/`)
  - Authentication, workout logging, dashboard access
  - These run in pre-push hooks
- **Feature Tests**: Important but not blocking (goes in `tests/e2e/feature/`)
  - Settings changes, progress views, profile updates

**3. Create Test File**

```bash
# For critical path
touch tests/e2e/critical/my-feature.spec.ts

# For feature tests
touch tests/e2e/feature/my-feature.spec.ts
```

**4. Write Tests Using Helpers**

```typescript
import { test, expect } from '@playwright/test';
import { signIn, TEST_USER } from '../../helpers/auth';
import { navigateTo, waitForPageReady } from '../../helpers/test-utils';

const hasTestCredentials = Boolean(
  process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD
);

test.describe('My Feature - Critical Path', () => {
  test.skip(!hasTestCredentials, 'Skipping - no test credentials');

  test.beforeEach(async ({ page }) => {
    await signIn(page, TEST_USER.email, TEST_USER.password);
  });

  test('should complete main user action', async ({ page }) => {
    await navigateTo(page, '/my-feature');

    // Your test steps...
    const button = page.locator('button:has-text("Action")');
    await button.click();

    // Assertions
    expect(page.url()).toContain('/success');
  });

  test('should handle error state', async ({ page }) => {
    // Test error handling...
  });
});

test.describe('My Feature - Edge Cases', () => {
  test.skip(!hasTestCredentials, 'Skipping - no test credentials');

  test.beforeEach(async ({ page }) => {
    await signIn(page, TEST_USER.email, TEST_USER.password);
  });

  test('should handle empty state', async ({ page }) => {
    // Edge case tests...
  });

  test('is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    // Mobile-specific tests...
  });
});
```

**5. Run Tests Locally**

```bash
npm run test:e2e:ui  # Visual debugging
npm run test:e2e     # Full test run
```

**6. Verify Tests Pass in CI**

Push to GitHub and check the pre-push hook passes.

---

## Accessibility Testing

### Running Accessibility Tests

```bash
npm run test:axe
```

### Writing Accessibility Tests

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should have no accessibility violations on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

---

## Test Data Fixtures

### Using Shared Test Data

**Location**: `tests/fixtures/test-data.ts`

```typescript
// Import fixtures
import { mockUser, mockPreferences, mockWorkoutSession } from '@/tests/fixtures/test-data';

// Use in tests
it('should process user', () => {
  const result = processUser(mockUser);
  expect(result.fullName).toBe('Test User');
});
```

### Adding New Fixtures

Edit `tests/fixtures/test-data.ts`:

```typescript
export const mockExercise = {
  id: 'test-exercise-id',
  name: 'Bench Press',
  movementPattern: 'horizontal_push',
  equipment: 'barbell',
  difficulty: 'intermediate',
};
```

---

## CI/CD Integration

### Pre-Push Hook

The pre-push hook runs:
1. Full unit test suite with coverage (`npm run test:coverage`)
2. Production build verification (`npm run build`)
3. Critical E2E tests (`npm run test:e2e:critical`)

**Estimated time**: < 5 minutes

### Skipping Tests Without Credentials

Tests gracefully skip when `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` are not set:

```
✓ [chromium] › critical/auth.spec.ts:12:3 › redirects unauthenticated users
↓ [chromium] › critical/dashboard.spec.ts:26:3 › Dashboard (skipped - no credentials)
↓ [chromium] › critical/workout-flow.spec.ts:18:3 › Workout Flow (skipped - no credentials)
```

This allows:
- Local development without test credentials
- CI/CD environments with credentials to run full suite

---

## Debugging

### Visual Debugging

```bash
# UI Mode (interactive debugging)
npm run test:e2e:ui

# Headed mode (see browser)
npx playwright test --headed

# Debug specific test
npx playwright test --debug tests/e2e/critical/workout-flow.spec.ts
```

### Screenshots and Videos

Playwright automatically captures:
- **Screenshots**: On test failure
- **Videos**: On test failure (retained)
- **Traces**: On first retry

Find them in `test-results/` directory.

### Console Logs

Add `console.log` to tests:
```typescript
test('debugging test', async ({ page }) => {
  console.log('Current URL:', page.url());

  const text = await page.locator('h1').textContent();
  console.log('Heading text:', text);
});
```

View with `--headed` or in UI mode.

---

## Best Practices

### Do's ✅

1. **Use semantic selectors**: `button:has-text("Save")` not `.btn-primary`
2. **Wait for page ready**: Use `waitForPageReady()` after navigation
3. **Use helper functions**: Don't duplicate auth/navigation logic
4. **Test user flows**: Not implementation details
5. **Handle async properly**: Use `await` for all Playwright actions
6. **Write descriptive test names**: "should complete workout when all sets logged"
7. **Test error states**: Don't just test happy paths
8. **Skip gracefully**: Use `test.skip()` when credentials missing
9. **Test mobile**: Set viewport for responsive tests
10. **Keep tests independent**: Each test should work in isolation

### Don'ts ❌

1. **Don't hardcode credentials**: Use `TEST_USER` from helper
2. **Don't use brittle selectors**: Avoid CSS classes, XPath, indexes
3. **Don't test implementation**: Test user-facing behavior
4. **Don't skip error handling**: Test what happens when things fail
5. **Don't ignore timeouts**: Investigate and fix flaky tests
6. **Don't duplicate code**: Extract helpers for repeated patterns
7. **Don't test third-party**: Don't test Clerk's auth flow itself
8. **Don't mix concerns**: Keep critical tests separate from feature tests
9. **Don't ignore accessibility**: Run axe tests regularly
10. **Don't commit secrets**: Use environment variables

---

## Troubleshooting

### Tests Skipped: "No test credentials configured"

**Solution**: Set `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` environment variables.

### "Executable doesn't exist" (Playwright browsers)

**Solution**: Run `npx playwright install`

### Tests Timing Out

**Causes**:
- Slow network (increase timeout in config)
- Page not loading (check dev server running)
- Wrong selector (page waiting for element that doesn't exist)

**Debug**: Run with `--headed` to see what's happening

### Clerk Authentication Not Working

**Causes**:
- Test user doesn't exist in Clerk dashboard
- Incorrect credentials in environment variables
- Clerk handshake redirect changed

**Debug**: Check Clerk dashboard, verify user exists and is active

### Coverage Below Threshold

**Solution**: Add tests for uncovered lines (see coverage report in `coverage/index.html`)

---

## Next Steps

1. **Run the tests**: `npm run test:e2e:critical`
2. **Configure credentials**: Follow setup instructions above
3. **Add new tests**: As you build features, add corresponding E2E tests
4. **Review coverage**: Regularly check `npm run test:coverage`
5. **Keep tests fast**: Critical tests should run in < 2 minutes

---

## Resources

- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [Clerk Testing Guide](https://clerk.com/docs/testing)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
- [axe Accessibility Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
