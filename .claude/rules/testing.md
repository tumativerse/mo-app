---
paths: '**/*.test.ts,**/*.test.tsx,**/*.spec.ts'
---

# Testing Rules

## Structure

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {});
  it('should handle user interaction', () => {});
  it('should show error state', () => {});
});
```

## React Testing Library

- Query by role, label, text (not test-id)
- Use userEvent over fireEvent
- await findBy\* for async content
- Avoid testing implementation details

## What to Test

- User interactions
- Conditional rendering
- Error states
- Loading states
- API integration (mock fetch)

## What NOT to Test

- Internal state
- Implementation details
- Third-party libraries
- Styling (unless critical)

## Mocking

- Mock external modules at top of file
- Reset mocks in beforeEach
- Use realistic mock data

---

## Coverage Requirements

### 100% Enforcement

**Required on ALL files:**

- All API routes (`app/api/**/*.ts`)
- All business logic (`lib/mo-*/**`)
- All utility functions (`lib/utils/**`)
- All UI components (`components/**/*.tsx`)
- Security code (`lib/security/**`)

**Why 100%?**

- Fitness data is sensitive - bugs can cause injury
- Solo developer - automated safety net required
- Prevents regressions during rapid development
- UI bugs can cause incorrect data entry or display

**Enforced by:**

- Vitest: 100% on all files with unit tests (Gate 1.6, 2.13)
- Coverage count: Minimum file baseline (Gate 2.14)
- SonarCloud: 80% overall project coverage (Gate 2.18)

**Coverage Strategy:**

- **UI Components**: 100% unit test coverage on all branches, statements, functions, and lines
- **Pages/Layouts**: E2E tests only (excluded from unit test coverage via vitest.config.ts)
- **API Routes**: 100% unit test coverage including all error paths
- **Business Logic**: 100% unit test coverage including edge cases

### What's Excluded from Unit Test Coverage

- Page files (`app/**/page.tsx`) - tested via E2E only
- Layout files (`app/**/layout.tsx`) - tested via E2E only
- Config files (`*.config.ts`, `*.config.js`)
- Setup files (`*.setup.ts`)
- Type declarations (`*.d.ts`)
- Database schema declarations (`lib/db/schema.ts`, `lib/db/index.ts`)
- Scripts (`scripts/**`)

---

## Phase 1 vs Phase 2 Testing

### Phase 1: Behavior Tests (BEFORE Implementation)

**When:** Write BEFORE building the feature
**Purpose:** Define expected behavior
**Focus:** What should happen (user perspective)

**Example:**

```typescript
// tests/api/progression.behavior.test.ts
it('should return ready-to-progress exercises', async () => {
  const response = await GET('/api/progression');
  expect(response.body.readyToProgress).toBeDefined();
});
```

**Rule:** Write Phase 1 tests first - they act as requirements

### Phase 2: Implementation Tests (AFTER Implementation)

**When:** Write AFTER Phase 1 tests pass
**Purpose:** Verify implementation details
**Focus:** How it works (edge cases, internals)

**Example:**

```typescript
// tests/lib/progression.test.ts
it('should return 0 for no training load', () => {
  const score = calculateFatigue({...});
  expect(score).toBe(0);
});
```

**Rule:** Phase 2 tests ensure 100% coverage
