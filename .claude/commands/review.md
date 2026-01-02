# Code Review

Review recent changes or specified files for issues.

## Arguments

- `$ARGUMENTS` - Optional: file path, PR number, or "staged" for git staged changes

## Steps

1. **Identify scope**:
   - If `$ARGUMENTS` is a file path: review that file
   - If `$ARGUMENTS` is a number: fetch PR from GitHub
   - If `$ARGUMENTS` is "staged": review `git diff --staged`
   - If empty: review `git diff` (unstaged changes)

2. **Review criteria**:
   - TypeScript: No `any`, proper types, null handling
   - React: Hooks rules, memo usage, accessibility
   - API: Auth check, validation, error handling
   - Security: No secrets, injection risks, XSS
   - Performance: N+1 queries, unnecessary renders
   - Tests: Coverage for changes

3. **Output format**:

   ```
   ## Code Review

   ### Files Reviewed
   - list of files

   ### Issues Found

   #### Critical
   - Issue with file:line reference

   #### Suggestions
   - Improvement ideas

   ### Looks Good
   - What's done well

   ### Recommendations
   - Action items
   ```

4. Offer to fix any issues found.
