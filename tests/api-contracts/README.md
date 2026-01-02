# API Contract Tests

This directory contains contract tests that validate API request/response schemas match their specifications.

## Coverage Requirement

**100% of API endpoints must have contract tests.**

The `check:api-coverage` script validates that every route in `app/api/**/route.ts` has a corresponding test in this directory.

## What Are Contract Tests?

Contract tests verify that:

1. **Request schemas** are validated correctly
2. **Response schemas** match the API specification
3. **Error responses** follow the expected format
4. **Status codes** are appropriate

## Example Test

```typescript
import { describe, it, expect } from 'vitest';

describe('POST /api/preferences', () => {
  it('validates request schema', async () => {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'invalid-value' }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('validates response schema', async () => {
    const response = await fetch('/api/preferences', {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('theme');
    expect(data).toHaveProperty('accentColor');
    expect(data.theme).toMatch(/^(light|dark)$/);
    expect(data.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('returns proper error format', async () => {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toMatchObject({
      error: expect.any(String),
      details: expect.any(Object),
    });
  });
});
```

## Best Practices

1. **Test all HTTP methods** supported by the endpoint
2. **Test validation** - both valid and invalid inputs
3. **Test error cases** - 400, 401, 403, 404, 500
4. **Test edge cases** - empty strings, null values, very large values
5. **Validate exact schema** - not just "has property", but type and format
6. **Use TypeScript types** - import types from `lib/types/` for consistency

## Running Contract Tests

```bash
# Run all contract tests
npm run test -- tests/api-contracts

# Run specific endpoint tests
npm run test -- tests/api-contracts/preferences.test.ts

# Check API contract coverage
npm run check:api-coverage
```

## File Naming Convention

Match the API route structure:

- `/api/preferences` → `tests/api-contracts/preferences.test.ts`
- `/api/user/profile` → `tests/api-contracts/user-profile.test.ts`
- `/api/workout/active` → `tests/api-contracts/workout-active.test.ts`

## What to Test

### ✅ DO Test

- Request schema validation (Zod schemas)
- Response schema validation
- Error response formats
- Status codes
- Required vs optional fields
- Data types and formats
- Enum values
- Array vs object distinctions

### ❌ DON'T Test

- Business logic (use unit tests)
- Database operations (use integration tests)
- UI rendering (use component tests)
- User flows (use E2E tests)

## Integration with Pre-Push

The pre-push hook runs `check:api-coverage` in Phase 1, which will fail if:

- Any API endpoint lacks a contract test
- The test file doesn't mention the endpoint path

This ensures 100% API contract coverage is maintained.
