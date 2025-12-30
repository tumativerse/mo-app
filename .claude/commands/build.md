# Build and Verify

Run a production build and verify everything works.

## Steps

1. **Run linting**:
   ```bash
   npm run lint
   ```
   Fix any lint errors before proceeding.

2. **Run type check**:
   ```bash
   npx tsc --noEmit
   ```
   Report any TypeScript errors.

3. **Run tests**:
   ```bash
   npm test -- --passWithNoTests
   ```
   Report any test failures.

4. **Run production build**:
   ```bash
   npm run build
   ```
   Capture build output and bundle sizes.

5. **Report results**:
   ```
   ## Build Report

   ### Lint: PASS/FAIL
   - Issues found (if any)

   ### TypeScript: PASS/FAIL
   - Errors (if any)

   ### Tests: PASS/FAIL
   - X passed, Y failed

   ### Build: PASS/FAIL
   - Build time: Xs
   - Bundle analysis:
     - First Load JS: X kB
     - Largest pages: list

   ### Overall Status
   Ready to deploy: YES/NO
   ```

6. If any step fails, offer to fix the issues.
