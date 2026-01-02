# API Contract Tests

API contract tests verify that endpoints match their documented schemas.

## What to Test

1. **Request validation**: Verify Zod schemas reject invalid input
2. **Response shape**: Verify response structure matches spec
3. **Status codes**: Verify correct HTTP status codes
4. **Authentication**: Verify auth requirements are enforced

## Coverage Requirement

100% of API endpoints in `app/api/` must have contract tests here.
