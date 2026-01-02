# Branch Protection Rules - MANDATORY SETUP

## ⚠️ CRITICAL: Complete this setup IMMEDIATELY after first push

This document configures **MANDATORY** branch protection for the `main` branch. **Nothing can merge without passing ALL checks**.

---

## Step 1: Navigate to Branch Protection Settings

1. Go to: https://github.com/YOUR_USERNAME/mo-app/settings/branches
2. Click "Add branch protection rule"
3. Branch name pattern: `main`

---

## Step 2: Configure Required Settings

### ✅ Require a pull request before merging

- [x] **Enable this setting**
- [x] Require approvals: **1** (you must review your own PRs)
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require review from Code Owners (if you add CODEOWNERS file later)

### ✅ Require status checks to pass before merging

- [x] **Enable this setting**
- [x] Require branches to be up to date before merging

**Required status checks (add ALL of these):**

```
Quick Check Status
PR Validation Status
Security Status
Code Quality Status
Performance Status
```

**How to add status checks:**

1. After first PR/push, GitHub will show available checks
2. Search for each check name above
3. Click to add it to required list
4. All 5 must be present

### ✅ Require conversation resolution before merging

- [x] **Enable this setting**
- All PR comments must be resolved

### ✅ Require signed commits

- [ ] Optional (recommended for production)

### ✅ Require linear history

- [x] **Enable this setting**
- No merge commits allowed, only squash or rebase

### ✅ Do not allow bypassing the above settings

- [x] **Enable this setting**
- Not even admins can bypass (you can't bypass your own rules)

### ✅ Restrict who can push to matching branches

- [x] **Enable this setting**
- Add yourself to allowed list
- Prevents accidental direct pushes to main

### ✅ Allow force pushes

- [ ] **DO NOT enable**
- Force pushes are dangerous

### ✅ Allow deletions

- [ ] **DO NOT enable**
- Prevent accidental branch deletion

---

## Step 3: Verify Configuration

After saving, your branch protection should show:

```
✅ Require pull request reviews before merging (1 approval)
✅ Require status checks to pass:
   - Quick Check Status
   - PR Validation Status
   - Security Status
   - Code Quality Status
   - Performance Status
✅ Require conversation resolution
✅ Require linear history
✅ Do not allow bypassing settings
✅ Restrict pushes
❌ Force pushes blocked
❌ Deletions blocked
```

---

## Step 4: Test the Protection

### Test 1: Try to push directly to main

```bash
git checkout main
echo "test" >> README.md
git add README.md
git commit -m "test direct push"
git push origin main
```

**Expected result:** `❌ BLOCKED - remote: error: GH006: Protected branch update failed`

### Test 2: Create PR with failing tests

```bash
git checkout -b test-branch
# Make a change that breaks tests
git push origin test-branch
# Create PR on GitHub
```

**Expected result:** `❌ PR shows failing checks, merge button disabled`

### Test 3: Create PR with all checks passing

```bash
git checkout -b feature-branch
# Make a valid change
git push origin feature-branch
# Create PR on GitHub
```

**Expected result:** `✅ All checks pass, merge button enabled after approval`

---

## What This Prevents

### ❌ BLOCKED Actions:

1. **Direct pushes to main** - must use PR workflow
2. **Merging PRs with failing tests** - all tests must pass
3. **Merging PRs with security issues** - security scan must pass
4. **Merging PRs with poor code quality** - SonarCloud/Code Climate must pass
5. **Merging PRs with performance issues** - Lighthouse must pass
6. **Merging without review** - you must review your own PR
7. **Merging with unresolved comments** - all discussions must be resolved
8. **Force pushing** - no history rewriting
9. **Branch deletion** - can't accidentally delete main

### ✅ REQUIRED Actions:

1. **Create feature branch** for all changes
2. **Push to feature branch** triggers quick checks
3. **Create PR** to main
4. **Wait for all 5 status checks** to complete and pass
5. **Review and approve PR** yourself
6. **Resolve all comments**
7. **Merge PR** (only enabled when everything passes)

---

## Enforcement Summary

With these rules, **it is IMPOSSIBLE to:**

- Ship code with failing tests
- Ship code with TypeScript errors
- Ship code with ESLint errors
- Ship code with security vulnerabilities
- Ship code with poor test coverage
- Ship code with accessibility violations
- Ship code with performance regressions
- Ship code without review
- Bypass any checks (even as admin)

**Result:** The main branch is ALWAYS in a deployable state.

---

## Troubleshooting

### "I can't find the status checks to add"

**Solution:** Status checks only appear after they've run at least once. Push a commit to any branch or create a PR first, then return to add the checks.

### "I accidentally pushed to main before setting this up"

**Solution:**

1. Set up branch protection now
2. Going forward, all changes must go through PR workflow
3. Previous direct pushes are okay, but future ones are blocked

### "I need to make an emergency hotfix"

**Solution:**

1. **DO NOT bypass protection rules**
2. Create hotfix branch
3. Make fix
4. Create PR
5. Wait for checks (or debug why they're failing)
6. Merge when green

Emergency doesn't mean "skip quality checks" - it means "work fast but safely".

### "A required check is failing but I think it's wrong"

**Solution:**

1. **DO NOT disable the check**
2. Review the failure carefully
3. Fix the underlying issue
4. If it's truly a false positive, update the check configuration
5. Re-run the check
6. Only proceed when it passes

---

## Maintenance

### Monthly Review (1st of each month)

1. Review failed checks in last 30 days
2. Identify patterns (same check always failing?)
3. Update check configurations if needed
4. Ensure all 5 required checks are still enabled
5. Verify no one has disabled protections

### When Adding New Checks

If you add a new workflow that should be required:

1. Add workflow to `.github/workflows/`
2. Ensure workflow has summary job that's the status check
3. Push to trigger the workflow
4. Go to branch protection settings
5. Add new status check to required list
6. Document here

---

## Emergency Contact

If you need to temporarily disable protections (e.g., GitHub Actions outage):

1. **Document why** in GitHub issue
2. Disable specific failing check only (not all protections)
3. Merge critical changes
4. **Re-enable immediately** after emergency
5. Add tests to prevent similar issues

**NEVER disable all protections - only the specific failing check.**
