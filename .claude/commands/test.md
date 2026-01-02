# Run Tests

Run the test suite and report results.

## Arguments

- `$ARGUMENTS` - Optional: specific test file or pattern

## Steps

1. If `$ARGUMENTS` is provided, run:

   ```bash
   npm test -- $ARGUMENTS
   ```

   Otherwise run all tests:

   ```bash
   npm test
   ```

2. Analyze the output:
   - Count passing and failing tests
   - For failures, identify the root cause
   - Check if failures are due to missing mocks, async issues, or logic errors

3. Report results in this format:

   ```
   ## Test Results

   **Status**: X passed, Y failed, Z skipped

   ### Summary
   - Brief overview of what was tested

   ### Failures (if any)
   1. Test name
      - Error: What went wrong
      - Fix: Suggested resolution

   ### Coverage
   - Note any areas with low coverage if visible
   ```

4. If tests fail, offer to fix the issues.
