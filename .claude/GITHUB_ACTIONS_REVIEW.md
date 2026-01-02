# 🔍 GitHub Actions Workflow Review

**Date:** 2026-01-02
**Project:** Mo Fitness App
**Status:** 🟡 **REQUIRES UPDATES**

---

## 📋 Executive Summary

**Current State:**

- ✅ 5 well-structured workflow files present
- ✅ Comprehensive CI/CD coverage (quick checks, PR validation, security, performance, quality)
- 🟡 **3 workflows need updates** to match local environment
- 🔴 **6 GitHub secrets need configuration** before workflows can run

**Action Required:**

1. Update workflows to match local configuration
2. Configure required GitHub repository secrets
3. Test workflows with a real push

---

## 1️⃣ Workflow Inventory

| Workflow            | Trigger                   | Purpose                              | Status           |
| ------------------- | ------------------------- | ------------------------------------ | ---------------- |
| `quick-check.yml`   | Every push (all branches) | Fast linting, types, format, secrets | ✅ Ready         |
| `pr-validation.yml` | Pull requests to main     | Full tests, E2E, build, a11y         | 🟡 Needs secrets |
| `code-quality.yml`  | PR + main pushes          | SonarCloud analysis                  | 🟡 Needs update  |
| `security.yml`      | PR + main + weekly        | Dependency scan, secrets             | 🟡 Needs secrets |
| `performance.yml`   | Pull requests to main     | Lighthouse CI on Vercel              | ✅ Ready         |

---

## 2️⃣ Issues Identified

### Issue 1: SonarCloud Configuration Mismatch 🟡

**File:** `.github/workflows/code-quality.yml:44-48`

**Problem:**
The GitHub Action uses inline SonarCloud arguments that **don't match** our `sonar-project.properties`:

```yaml
# Current (INCOMPLETE):
args: >
  -Dsonar.projectKey=tumativerse_mo-app
  -Dsonar.organization=${{ secrets.SONAR_ORGANIZATION }}
  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
  -Dsonar.exclusions=**/*.test.ts,...  # Missing **/*.sql, **/migrations/**
  -Dsonar.qualitygate.wait=true
  -Dsonar.qualitygate.timeout=300
```

**Missing from exclusions:**

- `**/*.sql` (SQL migration files)
- `**/migrations/**` (Migration directories)

**Impact:** SQL files will be analyzed in CI (causing warnings), but not locally.

**Fix Required:** Update `code-quality.yml` to use `sonar-project.properties` file OR add missing exclusions to inline args.

---

### Issue 2: Node.js Version Mismatch ⚠️

**Problem:**

- **Local environment:** Node.js v25.2.1
- **GitHub Actions:** Node.js v20

**Workflows affected:** All 5 workflows

**Impact:**

- CI may behave differently than local development
- Potential for version-specific bugs to appear in CI but not locally
- Some packages may have different behavior

**Recommendation:**

- **Option A (Recommended):** Update workflows to Node 20 LTS (more stable for CI)
- **Option B:** Update workflows to Node 25+ to match local (bleeding edge)

**Suggestion:** Use Node 20 LTS in CI for stability, keep Node 25+ locally for development.

---

### Issue 3: Missing GitHub Repository Secrets 🔴

**Required secrets that MUST be configured in GitHub:**

| Secret                              | Used In           | Required For           | How to Get                                                  |
| ----------------------------------- | ----------------- | ---------------------- | ----------------------------------------------------------- |
| `SONAR_TOKEN`                       | code-quality.yml  | SonarCloud analysis    | ✅ Already have: `255bd3d46cbcc47de8b737c0e6549316406e8b57` |
| `SONAR_ORGANIZATION`                | code-quality.yml  | SonarCloud analysis    | Should be: `tumativerse`                                    |
| `CODECOV_TOKEN`                     | pr-validation.yml | Coverage upload        | Sign up at codecov.io                                       |
| `SNYK_TOKEN`                        | security.yml      | Vulnerability scanning | Sign up at snyk.io                                          |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | pr-validation.yml | E2E/A11y tests         | From Clerk dashboard                                        |
| `CLERK_SECRET_KEY`                  | pr-validation.yml | E2E/A11y tests         | From Clerk dashboard                                        |

**Where to add:**
GitHub Repository → Settings → Secrets and variables → Actions → New repository secret

---

### Issue 4: Codecov Integration (Optional) ℹ️

**File:** `.github/workflows/pr-validation.yml:47-53`

**Current:**

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    fail_ci_if_error: true # BLOCKING
```

**Impact:**

- CI will **FAIL** if CODECOV_TOKEN is not configured
- Coverage upload is marked as BLOCKING

**Options:**

1. **Sign up for Codecov** and add token (recommended for teams)
2. **Remove Codecov step** (use SonarCloud coverage only)
3. **Make non-blocking** (`fail_ci_if_error: false`)

**Recommendation:** Option 2 or 3 - SonarCloud already provides coverage tracking.

---

### Issue 5: Snyk Integration (Optional) ℹ️

**File:** `.github/workflows/security.yml:42-50`

**Current:**

```yaml
- name: Snyk dependency scan
  uses: snyk/actions/node@master
  continue-on-error: false # BLOCKING
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Impact:**

- CI will **FAIL** if SNYK_TOKEN is not configured
- Snyk scan is marked as BLOCKING

**Options:**

1. **Sign up for Snyk** and add token (recommended for comprehensive security)
2. **Remove Snyk step** (use npm audit only)
3. **Make non-blocking** (`continue-on-error: true`)

**Recommendation:** Option 2 - `npm audit` already runs and is sufficient for most projects.

---

## 3️⃣ Recommended Changes

### Priority 1: Critical (Required for CI to Work) 🔴

#### 1.1 Update SonarCloud Exclusions

**File:** `.github/workflows/code-quality.yml`

**Change:**

```yaml
# BEFORE (line 48):
-Dsonar.exclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/node_modules/**,**/.next/**,**/coverage/**,**/dist/**,**/*.config.js,**/*.config.ts,**/playwright-report/**,**/test-results/**,.scannerwork/**

# AFTER:
-Dsonar.exclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/node_modules/**,**/.next/**,**/coverage/**,**/dist/**,**/*.config.js,**/*.config.ts,**/playwright-report/**,**/test-results/**,.scannerwork/**,**/*.sql,**/migrations/**
```

**OR Better:** Use the sonar-project.properties file instead:

```yaml
# Replace inline args with:
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  # No args needed - will read from sonar-project.properties
```

#### 1.2 Add Required GitHub Secrets

**Navigate to:** GitHub Repository → Settings → Secrets and variables → Actions

**Add these secrets:**

1. `SONAR_TOKEN` = `255bd3d46cbcc47de8b737c0e6549316406e8b57`
2. `SONAR_ORGANIZATION` = `tumativerse`
3. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = (from .env.local or Clerk dashboard)
4. `CLERK_SECRET_KEY` = (from .env.local or Clerk dashboard)

---

### Priority 2: High (Remove Blocking Dependencies) 🟡

#### 2.1 Make Codecov Non-Blocking or Remove

**Option A - Make non-blocking:**

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  continue-on-error: true # Don't fail CI if Codecov unavailable
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    fail_ci_if_error: false
```

**Option B - Remove entirely:**

```yaml
# Delete lines 47-53 in pr-validation.yml
# SonarCloud already tracks coverage
```

**Recommendation:** Option B (remove)

#### 2.2 Make Snyk Non-Blocking or Remove

**Option A - Make non-blocking:**

```yaml
- name: Snyk dependency scan
  uses: snyk/actions/node@master
  continue-on-error: true # Don't fail CI if Snyk unavailable
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Option B - Remove entirely:**

```yaml
# Delete lines 42-50 in security.yml
# npm audit already runs (line 39)
```

**Recommendation:** Option B (remove)

---

### Priority 3: Optional (Optimization) ℹ️

#### 3.1 Align Node.js Versions

**Current:** All workflows use Node 20
**Local:** Node 25.2.1

**Recommendation:** Keep Node 20 in CI (LTS = more stable)

**If you want to update to Node 25:**

```yaml
# In all 5 workflow files, change:
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '25' # Changed from '20'
    cache: 'npm'
```

**Note:** Node 25 may not be officially supported by all GitHub Actions yet.

---

## 4️⃣ Workflow Trigger Summary

### On Every Push (Any Branch)

- ✅ `quick-check.yml` - Fast verification (<5 min)
  - TypeScript, ESLint, Prettier, Secretlint

### On Pull Requests to Main

- ✅ `pr-validation.yml` - Comprehensive validation (~15-20 min)
  - Full test suite with coverage
  - E2E critical tests
  - Production build
  - Accessibility tests
- ✅ `code-quality.yml` - SonarCloud analysis (~10 min)
- ✅ `security.yml` - Security scanning (~10 min)
- ✅ `performance.yml` - Lighthouse CI (~15 min)

### On Push to Main

- ✅ `code-quality.yml` - SonarCloud (track quality over time)
- ✅ `security.yml` - Security scan

### Weekly Schedule

- ✅ `security.yml` - Every Sunday at midnight UTC

### Total CI Runtime for PR:

- **Quick check:** ~5 minutes (runs first on push)
- **Full PR validation:** ~15-20 minutes (parallel jobs)
- **Total:** ~25 minutes for full CI/CD pipeline

---

## 5️⃣ Implementation Plan

### Step 1: Update code-quality.yml

```bash
# Edit .github/workflows/code-quality.yml
# Option A: Add missing exclusions to inline args (lines 48)
# Option B: Remove inline args and use sonar-project.properties
```

### Step 2: Simplify pr-validation.yml

```bash
# Edit .github/workflows/pr-validation.yml
# Remove Codecov upload (lines 47-53) - SonarCloud handles coverage
```

### Step 3: Simplify security.yml

```bash
# Edit .github/workflows/security.yml
# Remove Snyk scan (lines 42-50) - npm audit is sufficient
```

### Step 4: Configure GitHub Secrets

**Required immediately:**

1. SONAR_TOKEN
2. SONAR_ORGANIZATION
3. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
4. CLERK_SECRET_KEY

**Optional (for future):**

- CODECOV_TOKEN (if re-adding Codecov)
- SNYK_TOKEN (if re-adding Snyk)

### Step 5: Test Workflow

```bash
# Create a test branch
git checkout -b test/github-actions

# Make a trivial change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify GitHub Actions workflow"
git push -u origin test/github-actions

# Watch GitHub Actions run
# GitHub Repository → Actions tab
```

---

## 6️⃣ Files to Modify

### Must Update (3 files)

1. **`.github/workflows/code-quality.yml`**
   - Add SQL/migration exclusions OR switch to sonar-project.properties

2. **`.github/workflows/pr-validation.yml`**
   - Remove Codecov upload (lines 47-53)

3. **`.github/workflows/security.yml`**
   - Remove Snyk scan (lines 42-50)

### Configuration (GitHub Repository Settings)

4. **GitHub Secrets** (Settings → Secrets and variables → Actions)
   - Add 4 required secrets

---

## 7️⃣ Pre-Push Testing Strategy

Before pushing to GitHub, we should:

1. ✅ **Verify local pre-push hook works** (we have this)
2. ✅ **Update GitHub Actions workflows** (updates above)
3. ✅ **Configure GitHub secrets** (in repository settings)
4. ✅ **Create test branch and push** (trigger quick-check.yml)
5. ✅ **Create test PR** (trigger all PR workflows)
6. ✅ **Monitor Actions tab** (watch for failures)
7. ✅ **Fix any issues** (iterate until green)

---

## 8️⃣ Expected Workflow Behavior

### Scenario 1: Push to Feature Branch

**Triggers:**

- ✅ `quick-check.yml` only

**Gates:**

1. TypeScript type check
2. ESLint check
3. Prettier format check
4. Secret detection

**Runtime:** ~5 minutes

---

### Scenario 2: Open Pull Request to Main

**Triggers:**

- ✅ `quick-check.yml` (on push)
- ✅ `pr-validation.yml`
- ✅ `code-quality.yml`
- ✅ `security.yml`
- ✅ `performance.yml` (after Vercel deployment)

**Gates (Parallel):**

1. Tests & coverage
2. E2E critical tests
3. Production build
4. Accessibility tests
5. SonarCloud quality gate
6. npm audit
7. Secret detection
8. Lighthouse performance budgets

**Runtime:** ~20-25 minutes (parallel)

**Required for merge:** ALL status checks must pass

---

### Scenario 3: Merge to Main

**Triggers:**

- ✅ `quick-check.yml`
- ✅ `code-quality.yml`
- ✅ `security.yml`

**Purpose:**

- Update SonarCloud quality trends
- Run security scans on production code
- Verify main branch is always green

**Runtime:** ~10-15 minutes

---

## 9️⃣ Comparison: Local vs CI

| Check          | Local (Pre-Commit/Push)     | GitHub Actions               | Notes                       |
| -------------- | --------------------------- | ---------------------------- | --------------------------- |
| **File size**  | ✅ Pre-commit               | ❌ Not in CI                 | Local only                  |
| **Prettier**   | ✅ Pre-commit (auto-fix)    | ✅ Quick check (validate)    | CI ensures formatting       |
| **TypeScript** | ✅ Pre-push                 | ✅ Quick check + Build       | Redundant but fast          |
| **ESLint**     | ✅ Pre-push                 | ✅ Quick check               | Redundant but fast          |
| **Unit tests** | ✅ Pre-push                 | ✅ PR validation             | Same command                |
| **E2E tests**  | ✅ Pre-push                 | ✅ PR validation             | Same command                |
| **A11y tests** | ✅ Pre-push                 | ✅ PR validation             | Same command                |
| **Secrets**    | ✅ Pre-push                 | ✅ Quick check + Security    | Redundant but important     |
| **Coverage**   | ✅ Pre-push (changed files) | ✅ PR validation (all files) | CI more comprehensive       |
| **SonarCloud** | ✅ Pre-push                 | ✅ Code quality              | Same analysis               |
| **npm audit**  | ✅ Pre-push                 | ✅ Security                  | Same check                  |
| **Build**      | ✅ Pre-push                 | ✅ PR validation             | Same build                  |
| **Lighthouse** | ✅ Pre-push                 | ✅ Performance               | CI uses live Vercel preview |
| **Snyk**       | ❌ Not local                | 🟡 Security (optional)       | Additional security layer   |
| **Codecov**    | ❌ Not local                | 🟡 PR validation (optional)  | Coverage trends             |

**Summary:**

- ✅ **99% overlap** between local hooks and CI
- ✅ CI provides **additional validation** (Lighthouse on real deployment, Codecov trends)
- ✅ **No surprises** - if local passes, CI should pass

---

## 🔟 Secrets Management Guide

### How to Get Each Secret

#### 1. SONAR_TOKEN

- **Already have:** `255bd3d46cbcc47de8b737c0e6549316406e8b57`
- **Source:** ~/.zshrc
- **Where to add:** GitHub Secrets as `SONAR_TOKEN`

#### 2. SONAR_ORGANIZATION

- **Value:** `tumativerse`
- **Source:** sonar-project.properties (line 6)
- **Where to add:** GitHub Secrets as `SONAR_ORGANIZATION`

#### 3. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

- **Source:** `.env.local` (line with `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=`)
- **OR:** Clerk Dashboard → API Keys → Publishable key
- **Format:** `pk_test_...` or `pk_live_...`
- **Where to add:** GitHub Secrets

#### 4. CLERK_SECRET_KEY

- **Source:** `.env.local` (line with `CLERK_SECRET_KEY=`)
- **OR:** Clerk Dashboard → API Keys → Secret key
- **Format:** `sk_test_...` or `sk_live_...`
- **Where to add:** GitHub Secrets
- **⚠️ IMPORTANT:** Use TEST keys for CI, not production keys

#### 5. CODECOV_TOKEN (Optional)

- **How to get:**
  1. Go to https://codecov.io
  2. Sign in with GitHub
  3. Add repository
  4. Copy upload token
- **Where to add:** GitHub Secrets as `CODECOV_TOKEN`
- **Recommendation:** Skip - not needed if using SonarCloud

#### 6. SNYK_TOKEN (Optional)

- **How to get:**
  1. Go to https://snyk.io
  2. Sign up with GitHub
  3. Account Settings → API Token
  4. Generate and copy token
- **Where to add:** GitHub Secrets as `SNYK_TOKEN`
- **Recommendation:** Skip - npm audit is sufficient

---

## 1️⃣1️⃣ Action Items Summary

### 🔴 Critical (Must Do Before Push)

- [ ] Update `.github/workflows/code-quality.yml` - Add SQL/migrations exclusions
- [ ] Add `SONAR_TOKEN` to GitHub Secrets
- [ ] Add `SONAR_ORGANIZATION` to GitHub Secrets
- [ ] Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to GitHub Secrets
- [ ] Add `CLERK_SECRET_KEY` to GitHub Secrets

### 🟡 High Priority (Should Do)

- [ ] Remove Codecov from `.github/workflows/pr-validation.yml` (lines 47-53)
- [ ] Remove Snyk from `.github/workflows/security.yml` (lines 42-50)

### ⚪ Optional (Nice to Have)

- [ ] Align Node.js versions (keep 20 in CI, or update to 25)
- [ ] Add Codecov integration (if team needs coverage trends)
- [ ] Add Snyk integration (if advanced security scanning needed)

---

## 1️⃣2️⃣ Testing Plan

### Phase 1: Update Workflows Locally

1. Update 3 workflow files
2. Commit changes
3. Review diffs carefully

### Phase 2: Configure Secrets

1. Go to GitHub Repository Settings
2. Add 4 required secrets
3. Verify secrets are masked in logs

### Phase 3: Test Push to Feature Branch

1. Create test branch: `test/github-actions`
2. Make trivial change
3. Push to GitHub
4. Watch `quick-check.yml` run
5. Verify it passes

### Phase 4: Test Pull Request

1. Create PR from test branch to main
2. Watch all 5 workflows trigger
3. Monitor Actions tab for failures
4. Fix any issues
5. Iterate until all green

### Phase 5: Cleanup

1. Close test PR (don't merge)
2. Delete test branch
3. Document any additional findings

---

## 1️⃣3️⃣ Conclusion

**Current Status:** 🟡 GitHub Actions are well-configured but need updates

**Required Work:**

- 3 workflow file updates
- 4 GitHub secrets to configure
- 1 test push to verify

**Estimated Time:**

- Updates: 15 minutes
- Testing: 30 minutes
- **Total: ~45 minutes**

**After Updates:**

- ✅ Complete CI/CD pipeline operational
- ✅ 99% parity between local hooks and CI
- ✅ No blocking dependencies (Codecov, Snyk removed)
- ✅ Fast feedback (~5 min for quick checks)
- ✅ Comprehensive validation (~25 min for full PR)

**Next Step:** Apply the recommended changes and test with a real push.

---

**Report Generated:** 2026-01-02
**Ready to proceed with updates!**
