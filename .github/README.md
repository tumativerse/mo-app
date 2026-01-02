# Mo App - Automated Quality System

## 🎯 Mission Statement

**Zero defects reach production. Every check is mandatory. No exceptions.**

This quality system ensures that **it is literally impossible** to ship:

- Failing tests
- Security vulnerabilities
- TypeScript errors
- Poor code quality
- Accessibility violations
- Performance regressions

---

## 🏗️ System Architecture

### Layer 1: Pre-Commit Hook (Local, < 60 seconds)

**Runs on EVERY commit (25-48x per day)**

```bash
✅ TypeScript type check
✅ ESLint (zero warnings)
✅ Prettier format check
✅ Design system compliance
✅ Secret detection (secretlint)
✅ Fast unit tests
```

**Blocks commit if ANY check fails.**

---

### Layer 2: Pre-Push Hook (Local, < 5 minutes)

**Runs before EVERY push to GitHub (~5x per day)**

```bash
✅ Full test suite
✅ Code coverage (100% threshold)
✅ Production build verification
✅ E2E critical paths
✅ Bundle size check
```

**Blocks push if ANY check fails.**

---

### Layer 3: GitHub Actions (Cloud)

#### Workflow 1: Quick Check

**Trigger:** Every push to any branch
**Duration:** ~2 minutes
**Purpose:** Fast verification that pre-commit didn't lie

```yaml
✅ TypeScript check
✅ ESLint
✅ Prettier
✅ Secret detection
```

**Required status check:** `Quick Check Status`

---

#### Workflow 2: PR Validation

**Trigger:** Pull request to main
**Duration:** ~10 minutes
**Purpose:** Comprehensive validation before merge

```yaml
Job 1: Tests & Coverage
  ✅ Full test suite
  ✅ Coverage report → Codecov
  ✅ Enforce 70% minimum coverage

Job 2: E2E Tests
  ✅ Playwright critical paths
  ✅ Multi-browser testing

Job 3: Build Verification
  ✅ Production build
  ✅ Bundle size check

Job 4: Accessibility
  ✅ axe-core WCAG 2.1 Level AA
  ✅ All major pages scanned
```

**Required status check:** `PR Validation Status`

---

#### Workflow 3: Security Scan

**Trigger:** PR to main + push to main + weekly schedule
**Duration:** ~5 minutes
**Purpose:** Detect security vulnerabilities

```yaml
Job 1: Dependency Scan
  ✅ npm audit (high/critical only)
  ✅ Snyk vulnerability scan

Job 2: Secret Detection
  ✅ secretlint full scan
  ✅ Check all files and history
```

**Required status check:** `Security Status`

---

#### Workflow 4: Code Quality

**Trigger:** PR to main + push to main
**Duration:** ~8 minutes
**Purpose:** Enforce code quality standards

```yaml
Job 1: SonarCloud
  ✅ Quality gate enforcement
  ✅ Bug detection
  ✅ Code smell detection
  ✅ Security hotspot detection
  ✅ Technical debt tracking

Job 2: Code Climate
  ✅ Maintainability grade
  ✅ Complexity analysis
  ✅ Duplication detection
```

**Required status check:** `Code Quality Status`

---

#### Workflow 5: Performance

**Trigger:** Pull request to main
**Duration:** ~10 minutes
**Purpose:** Enforce performance budgets

```yaml
Lighthouse CI: ✅ First Contentful Paint < 2000ms
  ✅ Largest Contentful Paint < 2500ms
  ✅ Cumulative Layout Shift < 0.1
  ✅ Total Blocking Time < 300ms
  ✅ Bundle size budgets enforced
```

**Required status check:** `Performance Status`

---

## 🔒 Branch Protection Rules

**Main branch is LOCKED DOWN:**

```yaml
✅ Pull request required (no direct pushes)
✅ 1 approval required (self-review)
✅ 5 status checks required (all must pass):
   1. Quick Check Status
   2. PR Validation Status
   3. Security Status
   4. Code Quality Status
   5. Performance Status
✅ Conversations must be resolved
✅ Linear history enforced (squash merge only)
✅ No bypassing allowed (even for admins)
✅ Force pushes blocked
✅ Branch deletion blocked
```

**Result:** It is IMPOSSIBLE to merge without passing ALL checks.

---

## 📊 What Gets Checked

### Security 🔒

- ✅ AWS keys, API tokens, private keys (secretlint)
- ✅ Dependency vulnerabilities (Snyk + npm audit)
- ✅ SQL injection patterns (ESLint security rules)
- ✅ XSS vulnerabilities (ESLint security rules)

### Code Quality 📝

- ✅ TypeScript errors (tsc --noEmit)
- ✅ Linting violations (ESLint, zero warnings)
- ✅ Code formatting (Prettier)
- ✅ Design system compliance (custom scanner)
- ✅ Code complexity (SonarCloud + Code Climate)
- ✅ Code duplication (SonarCloud)

### Testing 🧪

- ✅ Unit tests (Vitest)
- ✅ E2E tests (Playwright)
- ✅ Code coverage 100% (statements/functions/lines), 90% (branches)
- ✅ Accessibility tests (axe-core)

### Performance ⚡

- ✅ Bundle size budgets
- ✅ Core Web Vitals (LCP, FCP, CLS, TBT)
- ✅ Resource size limits
- ✅ Third-party script limits

---

## 🚀 Setup Instructions

### One-Time Setup (Do Once)

1. **External Services** (30 minutes)

   ```bash
   # Follow the guide to sign up for all services
   # and configure GitHub secrets

   See: GITHUB_ACTIONS_SETUP.md
   ```

2. **Branch Protection** (10 minutes)

   ```bash
   # Configure main branch protection rules

   See: BRANCH_PROTECTION_SETUP.md
   ```

3. **Test System** (15 minutes)

   ```bash
   # Create test PR to verify all checks work

   git checkout -b test-system
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: verify quality system"
   git push origin test-system
   # Create PR on GitHub, verify all 5 checks pass
   ```

---

## 📋 Daily Workflow

### As a Developer (You)

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# ... write code ...

# 3. Commit (pre-commit hook runs, ~60 sec)
git add .
git commit -m "feat: add new feature"
# → TypeScript, ESLint, Prettier, secretlint, fast tests run
# → Blocks if any fail

# 4. Push (pre-push hook runs, ~5 min)
git push origin feature/new-feature
# → Full tests, build, E2E, coverage run
# → Blocks if any fail

# 5. Create PR on GitHub
# → All 5 workflows start automatically

# 6. Wait for checks (~15 min total)
# → Quick Check: 2 min
# → PR Validation: 10 min
# → Security: 5 min
# → Code Quality: 8 min
# → Performance: 10 min
# → All run in parallel

# 7. Review and approve your own PR
# → Required by branch protection

# 8. Merge (only enabled when ALL green)
# → Squash and merge
# → Feature branch auto-deleted

# 9. Main branch updated
# → Vercel auto-deploys to production
# → Only if all checks still pass
```

### What You Can't Do

```bash
❌ Push directly to main
❌ Merge PR with failing tests
❌ Merge PR with TypeScript errors
❌ Merge PR with security vulnerabilities
❌ Merge PR with low test coverage
❌ Merge PR with accessibility issues
❌ Merge PR with performance regressions
❌ Bypass any checks (even as admin)
❌ Force push to main
❌ Delete main branch
```

**Every single one of these is BLOCKED by the system.**

---

## 📈 Quality Metrics

### Coverage Requirements

```
Statements: 100%
Functions:  100%
Lines:      100%
Branches:    90%
```

### Performance Budgets

```
First Contentful Paint:  < 2000ms
Largest Contentful Paint: < 2500ms
Cumulative Layout Shift:  < 0.1
Total Blocking Time:      < 300ms
JavaScript Bundle:        < 200KB
Total Page Size:          < 800KB
```

### Security Standards

```
Snyk Severity Threshold: HIGH
npm Audit Level: HIGH
Secret Detection: BLOCKING
```

### Code Quality Standards

```
SonarCloud Quality Gate: MUST PASS
Code Climate Grade: A-B acceptable
Complexity: ≤ 10 per function
Duplications: ≤ 3%
```

---

## 🔧 Files

### Workflows

- `quick-check.yml` - Fast checks on every push
- `pr-validation.yml` - Comprehensive PR checks
- `security.yml` - Security scanning
- `code-quality.yml` - Quality analysis
- `performance.yml` - Performance budgets

### Configuration

- `lighthouse-budget.json` - Performance budgets
- `.secretlintrc.json` - Secret detection rules
- `sonar-project.properties` - SonarCloud config
- `.codeclimate.yml` - Code Climate config
- `codecov.yml` - Coverage config

### Documentation

- `README.md` - This file
- `GITHUB_ACTIONS_SETUP.md` - External services setup
- `BRANCH_PROTECTION_SETUP.md` - Branch rules setup

---

## 💰 Cost

### Open Source (Recommended)

```
GitHub Actions:  FREE (810/2000 min = 40.5%)
Codecov:         FREE (unlimited)
Snyk:            FREE (200 tests/month)
SonarCloud:      FREE (unlimited)
Code Climate:    FREE (unlimited)
─────────────────────────────────────
TOTAL:           $0/month
```

### Private Repository

```
GitHub Actions:  FREE (810/2000 min = 40.5%)
Codecov:         FREE (1 private repo)
Snyk:            FREE (200 tests/month)
SonarCloud:      $10/month (required)
Code Climate:    $249/month (optional)
─────────────────────────────────────
TOTAL:           $10-259/month
```

---

## 🎉 Success Criteria

After setup, you should have:

✅ Zero defects can reach production
✅ All checks automated (no manual steps)
✅ Fast local feedback (< 60 sec commits)
✅ Comprehensive cloud validation (< 15 min)
✅ Multiple layers of protection
✅ Quality dashboards for monitoring
✅ Branch protection preventing bypasses
✅ Clear documentation for all processes

**The main branch is ALWAYS in a deployable state.**

---

## 📞 Support

### Documentation

- Setup: `GITHUB_ACTIONS_SETUP.md`
- Branch Protection: `BRANCH_PROTECTION_SETUP.md`
- Testing: `../tests/README.md`
- Quality Plan: `../.claude/QUALITY_SYSTEM_PLAN.md`

### Troubleshooting

Check workflow logs in GitHub Actions tab:
https://github.com/YOUR_USERNAME/mo-app/actions

### Maintenance

- Review dashboards monthly
- Update dependencies monthly
- Verify checks are passing regularly

---

**Built with ❤️ for quality**
