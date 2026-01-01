# Complete Quality System Plan for Mo-App
**Based on Actual Project Statistics**

## 📊 Real Usage Analysis

```
Project Created: Dec 21, 2025
Last Push: Jan 1, 2026
Project Age: 11 days
Total Commits: 126 commits
Active Days: 5 days (you work in bursts, not daily)

USAGE PATTERNS:
- Calendar day average: 11.5 commits/day
- Active day average: 25.2 commits/day
- Peak day: 48 commits (Jan 1)
- Median on active days: 31 commits
- Projected monthly: ~346 commits/month

DEVELOPMENT PATTERN:
Dec 21: 1 commit   (setup)
Dec 22: 15 commits (initial dev)
Dec 30: 31 commits (heavy work)
Dec 31: 31 commits (heavy work)
Jan 1:  48 commits (peak)
```

## 🎯 Tool Capacity Analysis

### **Based on 346 commits/month across ~13 active days:**

| Tool | Free Limit | Your Usage | Status | Strategy |
|------|------------|------------|--------|----------|
| **GitHub Actions** | 2,000 min/mo | TBD | ⚠️ Risk | Local-first |
| **Snyk** | 200 tests/mo | ~60 tests/mo | ✅ OK | Main branch only |
| **SonarCloud** | Unlimited (open) | Unlimited | ✅ OK | PR + main |
| **Code Climate** | Unlimited (open) | Unlimited | ✅ OK | PR + main |
| **Codecov** | 1 private repo | 1 repo needed | ✅ Perfect | All pushes |
| **GitGuardian** | 25 commits/day | 25-48/day | ❌ Over | Use local alternative |
| **Vercel** | Unlimited | Unlimited | ✅ OK | Auto-deploy |
| **Lighthouse CI** | Unlimited | Unlimited | ✅ OK | PR only |

---

## 🚨 Critical Findings

### **1. GitGuardian Will Fail**
```
Your peak: 48 commits/day
GitGuardian free: 25 commits/day
Result: 192% over limit on heavy days

SOLUTION: Use local secretlint instead (unlimited, free)
```

### **2. GitHub Actions Must Be Optimized**
```
Worst case (every commit triggers full CI):
48 commits/day × 12 min = 576 min/day
576 min × 13 active days = 7,488 min/month ❌ 374% over limit

SOLUTION: Local hooks + selective CI
```

### **3. Everything Else is Fine**
```
✅ Snyk: Use selectively (60/200 tests)
✅ SonarCloud/Code Climate: Unlimited
✅ Codecov: 1 repo is perfect
✅ Vercel/Lighthouse: Unlimited
```

---

## 🏗️ Complete Automated System Architecture

### **Layer 1: PRE-COMMIT (Local - Runs 346x/month)**
**Target: < 60 seconds per commit**

```bash
#!/bin/sh
# .husky/pre-commit
# Runs EVERY TIME Claude commits (25-48x/day on active days)

echo "🔍 Pre-commit: Fast quality checks..."

# 1. TypeScript (10 sec)
npm run type-check || exit 1

# 2. ESLint - fast mode (10 sec)
npm run lint:fast || exit 1

# 3. Prettier (5 sec)
npm run prettier:check || exit 1

# 4. Design system (10 sec)
bash .claude/hooks/pre-commit-design-check.sh || exit 1

# 5. Secret detection - LOCAL (10 sec)
npx secretlint "**/*" --secretlintrc .secretlintrc.json || exit 1

# 6. Import linting (5 sec)
npx eslint . --rule 'import/order: error' --fix || exit 1

# 7. Fast unit tests (10 sec)
npm run test:fast || exit 1

echo "✅ Pre-commit passed (60 sec)"
```

**Tools Used:**
- TypeScript compiler (free)
- ESLint (free)
- Prettier (free)
- Custom design scanner (free)
- secretlint (free) - replaces GitGuardian
- Fast unit tests (free)

**Result:** Blocks bad commits BEFORE they even exist
**Cost:** $0
**Usage:** Unlimited

---

### **Layer 2: PRE-PUSH (Local - Runs ~60x/month)**
**Target: < 5 minutes**

```bash
#!/bin/sh
# .husky/pre-push
# Runs when Claude pushes to GitHub (~5x/day on active days)

echo "🚀 Pre-push: Comprehensive validation..."

# 1. Full codebase scan (30 sec)
bash .claude/hooks/full-codebase-scan.sh || exit 1

# 2. Full unit test suite (2 min)
npm run test || exit 1

# 3. Build verification (1 min)
npm run build || exit 1

# 4. E2E critical paths (1.5 min)
npm run test:e2e:critical || exit 1

# 5. Bundle size check (30 sec)
npm run analyze:bundle:check || exit 1

echo "✅ Pre-push passed (5 min)"
```

**Tools Used:**
- Full test suite (free)
- Production build (free)
- Playwright E2E (free)
- Bundle analyzer (free)

**Result:** Code is production-ready before hitting GitHub
**Cost:** $0
**Usage:** Unlimited

---

### **Layer 3: GITHUB ACTIONS (Cloud - Strategic)**

#### **Workflow 1: Quick Checks (On every push)**
**Target: 2 minutes, runs ~60x/month**

```yaml
# .github/workflows/quick-check.yml
name: Quick Check
on:
  push:
    branches: ['**']  # All branches

jobs:
  quick-verify:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      # Just verify pre-commit didn't lie
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint:fast

# Usage: 60 pushes × 2 min = 120 min/month (6% of limit)
```

#### **Workflow 2: Full Validation (PR only)**
**Target: 10 minutes, runs ~10x/month**

```yaml
# .github/workflows/pr-validation.yml
name: PR Validation
on:
  pull_request:
    branches: [main]

jobs:
  # Job 1: Testing with coverage
  test-and-coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload to Codecov
        uses: codecov/codecov-action@v3
        with:
          fail_ci_if_error: true
          files: ./coverage/lcov.info

      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 70" | bc -l) )); then
            echo "❌ Coverage $COVERAGE% < 70% minimum"
            exit 1
          fi

  # Job 2: E2E Tests
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  # Job 3: Build verification
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build

      - name: Bundle size check
        uses: andresz1/size-limit-action@v1

  # Job 4: Accessibility
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run start &
      - run: npx wait-on http://localhost:3000
      - run: npm run test:axe

# Usage: 10 PRs × 10 min = 100 min/month (5% of limit)
```

#### **Workflow 3: Security Scan (Main branch only)**
**Target: 5 minutes, runs ~30x/month**

```yaml
# .github/workflows/security.yml
name: Security Scan
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Snyk dependency scan
      - name: Snyk test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      # npm audit
      - name: npm audit
        run: npm audit --audit-level=high

      # Secret detection (backup to local)
      - name: GitGuardian fallback scan
        run: |
          npm install -g @gitguardian/ggshield
          ggshield secret scan repo .

# Usage: 30 main pushes + 4 weekly = 34 scans/month
# Time: 34 × 5 min = 170 min/month (8.5% of limit)
```

#### **Workflow 4: Code Quality (PR + Main)**
**Target: 8 minutes, runs ~40x/month**

```yaml
# .github/workflows/code-quality.yml
name: Code Quality
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  sonarcloud:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.qualitygate.wait=true
            -Dsonar.coverage.exclusions=**/*.test.ts

  codeclimate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Code Climate
        uses: paambaati/codeclimate-action@v5
        env:
          CC_TEST_REPORTER_ID: ${{ secrets.CC_REPORTER_ID }}
        with:
          coverageLocations: ./coverage/lcov.info:lcov

# Usage: 10 PRs + 30 main = 40 runs × 8 min = 320 min/month (16% of limit)
```

#### **Workflow 5: Performance (PR only)**
**Target: 10 minutes, runs ~10x/month**

```yaml
# .github/workflows/performance.yml
name: Performance Check
on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Wait for Vercel preview
        uses: patrickedqvist/wait-for-vercel-preview@v1.3.1
        id: waitForDeploy
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 300

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: ${{ steps.waitForDeploy.outputs.url }}
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true

# Usage: 10 PRs × 10 min = 100 min/month (5% of limit)
```

---

### **GitHub Actions Total:**

```
Quick checks:    60 × 2 min  = 120 min (6%)
PR validation:   10 × 10 min = 100 min (5%)
Security:        34 × 5 min  = 170 min (8.5%)
Code quality:    40 × 8 min  = 320 min (16%)
Performance:     10 × 10 min = 100 min (5%)
────────────────────────────────────────
TOTAL:                         810 min/month

Free tier: 2,000 min/month
Usage: 810 min (40.5%)
Status: ✅ SAFE with 60% buffer
```

---

## 📦 Required Package Installations

```json
{
  "devDependencies": {
    // Testing
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "@axe-core/playwright": "^4.8.0",

    // Linting & Formatting
    "eslint": "^8.55.0",
    "eslint-plugin-security": "^2.1.0",
    "eslint-plugin-import": "^2.29.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "prettier": "^3.1.0",

    // Security
    "secretlint": "^8.0.0",
    "@secretlint/secretlint-rule-preset-recommend": "^8.0.0",
    "@secretlint/secretlint-rule-aws": "^8.0.0",
    "@secretlint/secretlint-rule-privatekey": "^8.0.0",

    // Build & Analysis
    "@next/bundle-analyzer": "^14.0.0",
    "size-limit": "^11.0.0",
    "@size-limit/file": "^11.0.0",

    // Git hooks
    "husky": "^8.0.0",

    // Utilities
    "wait-on": "^7.2.0"
  }
}
```

---

## 🔧 Configuration Files

### **1. secretlint Configuration**
```json
// .secretlintrc.json
{
  "rules": [
    {
      "id": "@secretlint/secretlint-rule-preset-recommend"
    },
    {
      "id": "@secretlint/secretlint-rule-aws",
      "severity": "error"
    },
    {
      "id": "@secretlint/secretlint-rule-privatekey",
      "severity": "error"
    }
  ]
}
```

### **2. SonarCloud Configuration**
```properties
# sonar-project.properties
sonar.projectKey=mo-app
sonar.organization=your-org

# Quality gate (BLOCKING)
sonar.qualitygate.wait=true
sonar.qualitygate.timeout=300

# Coverage
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.ts,**/*.spec.ts

# Thresholds
sonar.coverage.minimum=70
sonar.duplications.maximum=3

# Block on issues
sonar.qualitygate.criteria.new_coverage=80
sonar.qualitygate.criteria.new_duplications=3
```

### **3. Code Climate Configuration**
```yaml
# .codeclimate.yml
version: "2"
checks:
  argument-count:
    config:
      threshold: 4
  cognitive-complexity:
    config:
      threshold: 10
  file-lines:
    config:
      threshold: 250
  method-complexity:
    config:
      threshold: 5

plugins:
  eslint:
    enabled: true
  duplication:
    enabled: true
    config:
      languages:
        javascript:
          mass_threshold: 30

exclude_patterns:
  - "**/*.test.ts"
  - "**/node_modules/"
```

### **4. Codecov Configuration**
```yaml
# codecov.yml
coverage:
  status:
    project:
      default:
        target: 70%
        threshold: 2%
    patch:
      default:
        target: 80%
        threshold: 0%

comment:
  layout: "reach,diff,files"
  behavior: default

github_checks:
  annotations: true
```

### **5. Lighthouse Budget**
```json
// lighthouse-budget.json
[
  {
    "path": "/*",
    "timings": [
      { "metric": "first-contentful-paint", "budget": 2000 },
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "cumulative-layout-shift", "budget": 0.1 },
      { "metric": "total-blocking-time", "budget": 300 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 150 },
      { "resourceType": "total", "budget": 500 }
    ]
  }
]
```

### **6. Package.json Scripts**
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",

    "lint": "next lint --max-warnings 0",
    "lint:fast": "next lint --max-warnings 0 --quiet",

    "prettier:check": "prettier --check .",
    "prettier:fix": "prettier --write .",

    "test": "vitest run",
    "test:fast": "vitest run --reporter=dot --bail=1 --changed",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest",

    "test:e2e": "playwright test",
    "test:e2e:critical": "playwright test tests/critical/",
    "test:axe": "playwright test tests/accessibility/",

    "build": "next build",
    "analyze:bundle": "ANALYZE=true npm run build",
    "analyze:bundle:check": "npm run build && npx size-limit",

    "lighthouse:ci": "lhci autorun"
  }
}
```

---

## 🎯 Monthly Cost Breakdown

### **If Open Source:**
```
✅ GitHub Actions: FREE (within 810/2000 min)
✅ Snyk: FREE (within 60/200 tests)
✅ SonarCloud: FREE (unlimited)
✅ Code Climate: FREE (unlimited)
✅ Codecov: FREE (unlimited for open source)
✅ Vercel: FREE (unlimited)
✅ secretlint: FREE (runs locally)
✅ Lighthouse CI: FREE (unlimited)

TOTAL: $0/month
```

### **If Private Repo:**
```
✅ GitHub Actions: FREE (within 810/2000 min)
✅ Snyk: FREE (within 60/200 tests)
✅ SonarCloud: $10/month
✅ Code Climate: $249/month (optional)
✅ Codecov: FREE (1 private repo)
✅ Vercel: FREE
✅ secretlint: FREE
✅ Lighthouse CI: FREE

TOTAL: $10-259/month
Recommended: $10/month (skip Code Climate initially)
```

---

## 📋 Implementation Checklist

### **Week 1: Foundation (4 hours)**
- [ ] Install all npm packages
- [ ] Configure Husky pre-commit hook
- [ ] Configure Husky pre-push hook
- [ ] Add secretlint configuration
- [ ] Test hooks locally (commit + push)

### **Week 2: Testing Setup (6 hours)**
- [ ] Setup Vitest for unit tests
- [ ] Setup Playwright for E2E tests
- [ ] Setup axe for accessibility tests
- [ ] Write initial test suite (50% coverage target)
- [ ] Configure coverage thresholds

### **Week 3: GitHub Actions (4 hours)**
- [ ] Create all 5 workflow files
- [ ] Sign up for SonarCloud
- [ ] Sign up for Code Climate
- [ ] Sign up for Codecov
- [ ] Sign up for Snyk
- [ ] Generate all tokens/secrets
- [ ] Add secrets to GitHub repo
- [ ] Test all workflows

### **Week 4: Configuration & Testing (4 hours)**
- [ ] Configure SonarCloud quality gates
- [ ] Configure Code Climate checks
- [ ] Configure Codecov thresholds
- [ ] Configure Lighthouse budgets
- [ ] Test entire system end-to-end
- [ ] Fix any issues found
- [ ] Document the system

---

## 🔄 Daily Workflow (Claude's Perspective)

### **Scenario: User asks "Add login page"**

```
1. Me (Claude): Write login page code
   ↓
2. Pre-commit hook runs (60 sec):
   ✅ TypeScript check
   ✅ ESLint
   ✅ Prettier
   ✅ Design system
   ✅ Secret scan
   ✅ Fast tests
   → If ANY fail: commit blocked, I must fix
   ↓
3. Commit succeeds locally
   ↓
4. Me: Push to GitHub
   ↓
5. Pre-push hook runs (5 min):
   ✅ Full codebase scan
   ✅ Full test suite
   ✅ Build check
   ✅ E2E critical paths
   ✅ Bundle size
   → If ANY fail: push blocked, I must fix
   ↓
6. Push succeeds
   ↓
7. GitHub Actions: Quick check (2 min)
   ✅ Verify TypeScript
   ✅ Verify lint
   → Reports back to GitHub
   ↓
8. You: "Looks good, merge to main"
   ↓
9. Me: Create PR
   ↓
10. GitHub Actions: Full validation (10 min)
    ✅ Tests with coverage → Codecov
    ✅ E2E tests → Playwright report
    ✅ Build → Vercel preview
    ✅ Accessibility → axe results
    → All must pass for PR to merge
    ↓
11. PR merged to main
    ↓
12. GitHub Actions: Security + Quality (13 min)
    ✅ Snyk scan → Security report
    ✅ SonarCloud → Code quality dashboard
    ✅ Code Climate → Maintainability score
    ✅ Lighthouse → Performance score
    → Vercel auto-deploys if all pass
    ↓
13. Production deployment ✅
```

**Total time for Claude:**
- Pre-commit: 60 sec (local)
- Pre-push: 5 min (local)
- GitHub Actions: runs in cloud (Claude doesn't wait)

**I can't commit/push broken code - system prevents it!**

---

## 📊 What This System Catches

### **Security (Blocks deployment)**
```typescript
❌ Leaked AWS keys (secretlint)
❌ Database passwords in code (secretlint)
❌ Vulnerable dependencies (Snyk)
❌ SQL injection patterns (ESLint security)
❌ XSS vulnerabilities (ESLint security)
```

### **Code Quality (Blocks merge)**
```typescript
❌ TypeScript errors (type-check)
❌ Linting violations (ESLint)
❌ Formatting issues (Prettier)
❌ Design system violations (custom scanner)
❌ Test coverage drop (Codecov)
❌ Failed tests (Vitest)
❌ Failed E2E tests (Playwright)
```

### **Performance (Blocks merge)**
```typescript
❌ Bundle size too large (size-limit)
❌ LCP > 2.5s (Lighthouse)
❌ CLS > 0.1 (Lighthouse)
❌ TBT > 300ms (Lighthouse)
```

### **Accessibility (Blocks merge)**
```typescript
❌ Missing alt text (axe)
❌ Insufficient color contrast (axe)
❌ Missing ARIA labels (axe)
❌ Keyboard navigation broken (Playwright)
```

### **Maintainability (Informational, doesn't block)**
```typescript
📊 Code complexity too high (Code Climate)
📊 Code duplication > 3% (SonarCloud)
📊 Function too long (Code Climate)
📊 Too many parameters (Code Climate)
```

---

## ✅ Success Criteria

After implementation, you should have:

1. ✅ **Zero security vulnerabilities** can reach production
2. ✅ **Zero failing tests** can be merged
3. ✅ **Zero TypeScript errors** can be committed
4. ✅ **Zero design violations** can be committed
5. ✅ **Minimum 70% test coverage** maintained
6. ✅ **Performance budgets** enforced
7. ✅ **Accessibility standards** met
8. ✅ **All checks run automatically** - no manual intervention
9. ✅ **Fast feedback** (< 60 sec for commits)
10. ✅ **Comprehensive coverage** (8 different quality dimensions)

**Result:** Claude literally cannot ship broken code to production.

---

## 🚀 Ready to Implement?

This plan gives you:
- ✅ Comprehensive quality enforcement
- ✅ Well within all free tier limits (40% of GitHub Actions)
- ✅ Fast local feedback (< 60 sec commits)
- ✅ Multiple layers of protection
- ✅ Automated from start to finish
- ✅ Zero manual intervention needed
- ✅ Works perfectly with Claude as sole developer

Total cost: $0-10/month
Total setup time: ~18 hours over 4 weeks
