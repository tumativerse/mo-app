---
paths: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts"
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
- await findBy* for async content
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
