# GitHub Actions Setup Guide - Complete Configuration

## Overview

This guide configures **ALL** required external services and secrets for the automated quality system. **Complete every step** to ensure all workflows function properly.

---

## 📋 Checklist

Track your progress:

- [ ] Codecov account and token
- [ ] Snyk account and token
- [ ] SonarCloud account and token
- [ ] Code Climate account and token
- [ ] All secrets added to GitHub
- [ ] Branch protection rules configured
- [ ] Test workflow run completed
- [ ] All 5 required status checks passing

---

## 1. Codecov Setup (Test Coverage)

### Sign Up

1. Go to: https://about.codecov.io
2. Click "Sign up with GitHub"
3. Authorize Codecov

### Configure Repository

1. In Codecov dashboard, click "Add new repository"
2. Find `mo-app` and click "Setup repo"
3. Copy the upload token shown

### Add Secret to GitHub

1. Go to: https://github.com/YOUR_USERNAME/mo-app/settings/secrets/actions
2. Click "New repository secret"
3. Name: `CODECOV_TOKEN`
4. Value: Paste the Codecov upload token
5. Click "Add secret"

### Configure Quality Thresholds

1. In Codecov dashboard, go to repo settings
2. Set "Target coverage": **70%**
3. Set "Patch coverage": **80%**
4. Enable "Require CI to pass": **YES**

**Cost:** FREE (unlimited for open source, 1 private repo free)

---

## 2. Snyk Setup (Security Scanning)

### Sign Up

1. Go to: https://snyk.io
2. Click "Sign up with GitHub"
3. Authorize Snyk

### Get API Token

1. In Snyk dashboard, click account name (top right)
2. Click "Account settings"
3. Scroll to "API Token" section
4. Click "Generate" (or "Show" if exists)
5. Copy the token (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Add Secret to GitHub

1. Go to: https://github.com/YOUR_USERNAME/mo-app/settings/secrets/actions
2. Click "New repository secret"
3. Name: `SNYK_TOKEN`
4. Value: Paste the Snyk API token
5. Click "Add secret"

### Import Project

1. In Snyk dashboard, click "Add project"
2. Select "GitHub"
3. Find and select `mo-app`
4. Click "Add selected repository"
5. Snyk will run initial scan

### Configure Severity Threshold

1. In project settings, set severity threshold: **High**
2. This blocks PRs if high/critical vulnerabilities found

**Cost:** FREE (200 tests/month)

---

## 3. SonarCloud Setup (Code Quality)

### Sign Up

1. Go to: https://sonarcloud.io
2. Click "Sign up with GitHub"
3. Authorize SonarCloud

### Create Organization

1. Click "Analyze new project"
2. Click "Create organization"
3. Choose your GitHub username
4. Name: Same as GitHub username
5. Plan: **Free** (for open source)

### Import Project

1. Click "Analyze new project"
2. Select your organization
3. Find `mo-app` repository
4. Click "Set up"

### Get Tokens

1. Click "Administration" → "Analysis Method"
2. Select "With GitHub Actions"
3. Copy the `SONAR_TOKEN` shown
4. Note your organization key (e.g., `your-username`)

### Add Secrets to GitHub

1. Go to: https://github.com/YOUR_USERNAME/mo-app/settings/secrets/actions

**Secret 1:**

- Name: `SONAR_TOKEN`
- Value: Paste the token from SonarCloud

**Secret 2:**

- Name: `SONAR_ORGANIZATION`
- Value: Your organization key (e.g., `your-username`)

### Configure Quality Gate

1. In SonarCloud project, go to "Quality Gates"
2. Set as default: **Sonar way** (recommended)
3. Or create custom with these thresholds:
   - Coverage: **≥ 70%**
   - Duplications: **≤ 3%**
   - Maintainability Rating: **A**
   - Reliability Rating: **A**
   - Security Rating: **A**

**Important:** Enable "Quality Gate Status" check:

1. Go to project "Administration" → "General Settings"
2. Enable "Enforce quality gate"
3. This makes SonarCloud **BLOCK** PRs that fail

**Cost:** FREE (unlimited for open source)

---

## 4. Code Climate Setup (Maintainability)

### Sign Up

1. Go to: https://codeclimate.com/quality
2. Click "Sign up with GitHub"
3. Authorize Code Climate

### Add Repository

1. Click "Add a repository"
2. Find `mo-app`
3. Click "Add Repo"

### Get Test Reporter ID

1. In Code Climate dashboard, click on `mo-app`
2. Go to "Repo Settings" → "Test Coverage"
3. Copy "TEST REPORTER ID" (format: long hex string)

### Add Secret to GitHub

1. Go to: https://github.com/YOUR_USERNAME/mo-app/settings/secrets/actions
2. Click "New repository secret"
3. Name: `CC_TEST_REPORTER_ID`
4. Value: Paste the Test Reporter ID
5. Click "Add secret"

### Configure Quality Thresholds

1. In Code Climate, go to "Repo Settings" → "Maintainability"
2. Set thresholds:
   - Cognitive Complexity: **≤ 10**
   - Method Lines: **≤ 25**
   - Argument Count: **≤ 4**
   - File Lines: **≤ 250**

**Cost:** FREE (unlimited for open source), $249/month for private repos (optional)

---

## 5. Secretlint Configuration (Local Secret Detection)

This runs **locally** in pre-commit hook, no external service needed.

### Create Configuration File

File: `.secretlintrc.json`

```json
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
    },
    {
      "id": "@secretlint/secretlint-rule-npm",
      "severity": "error"
    },
    {
      "id": "@secretlint/secretlint-rule-gcp",
      "severity": "error"
    }
  ]
}
```

Already included in `devDependencies`.

**Cost:** FREE (runs locally)

---

## 6. GitHub Secrets Summary

Verify all secrets are added:

Go to: https://github.com/YOUR_USERNAME/mo-app/settings/secrets/actions

You should see **4 secrets:**

```
✅ CODECOV_TOKEN          (from Codecov)
✅ SNYK_TOKEN             (from Snyk)
✅ SONAR_TOKEN            (from SonarCloud)
✅ SONAR_ORGANIZATION     (your SonarCloud org key)
✅ CC_TEST_REPORTER_ID    (from Code Climate)
```

**Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions.

---

## 7. Test All Workflows

### Step 1: Push to Feature Branch

```bash
git checkout -b test-workflows
echo "# Testing workflows" >> README.md
git add README.md
git commit -m "test: verify all workflows"
git push origin test-workflows
```

**Expected:** "Quick Check" workflow runs and passes

### Step 2: Create Pull Request

1. Go to GitHub repository
2. Click "Pull requests" → "New pull request"
3. Base: `main`, Compare: `test-workflows`
4. Click "Create pull request"
5. Title: "Test: Verify all workflows"

**Expected:** All 5 workflows start running:

- Quick Check Status
- PR Validation Status (tests, E2E, build, accessibility)
- Security Status (Snyk, npm audit, secretlint)
- Code Quality Status (SonarCloud, Code Climate)
- Performance Status (Lighthouse CI)

### Step 3: Verify All Pass

Wait for all checks to complete (5-15 minutes).

**All should show:** ✅ Green checkmarks

If any fail:

1. Click "Details" to see error
2. Fix the issue (likely configuration)
3. Push fix to same branch
4. Checks re-run automatically

### Step 4: Merge PR

Once all checks pass:

1. Review the PR yourself
2. Click "Approve" (required by branch protection)
3. Click "Merge pull request"
4. Select "Squash and merge"

**Expected:** PR merges successfully, `test-workflows` branch deleted

---

## 8. Verify Branch Protection

### Attempt Direct Push (Should Fail)

```bash
git checkout main
git pull
echo "test" >> README.md
git add README.md
git commit -m "test: direct push"
git push origin main
```

**Expected:**

```
❌ remote: error: GH006: Protected branch update failed
❌ error: failed to push some refs
```

**Success!** Branch protection is working.

---

## 9. Monitor Quality Dashboards

### Codecov Dashboard

- URL: https://app.codecov.io/gh/YOUR_USERNAME/mo-app
- Shows: Test coverage trends
- Alerts: If coverage drops below threshold

### Snyk Dashboard

- URL: https://app.snyk.io
- Shows: Security vulnerabilities
- Alerts: New vulnerabilities in dependencies

### SonarCloud Dashboard

- URL: https://sonarcloud.io/dashboard?id=mo-app
- Shows: Code quality, bugs, code smells, security hotspots
- Alerts: Quality gate failures

### Code Climate Dashboard

- URL: https://codeclimate.com/github/YOUR_USERNAME/mo-app
- Shows: Maintainability grade (A-F)
- Alerts: Complexity issues

---

## 10. Monthly Maintenance

### First Monday of Each Month

**Review Dashboards:**

1. Codecov: Is coverage trending up or down?
2. Snyk: Any new vulnerabilities to address?
3. SonarCloud: Any recurring code quality issues?
4. Code Climate: Is maintainability grade stable?

**Update Dependencies:**

```bash
npm outdated
npm update
npm audit fix
```

**Verify Workflows:**

1. Check GitHub Actions usage (should be < 50% of 2000 min limit)
2. Review failed workflow runs in last 30 days
3. Update workflow configurations if needed

---

## 11. Troubleshooting

### "CODECOV_TOKEN secret not found"

**Solution:** Go back to step 1, ensure secret is added exactly as `CODECOV_TOKEN`

### "SNYK_TOKEN authentication failed"

**Solution:** Regenerate token in Snyk dashboard, update GitHub secret

### "SonarCloud quality gate failed"

**Solution:**

1. Check SonarCloud dashboard for specific issues
2. Fix code quality issues
3. Re-run workflow

### "Lighthouse CI cannot find preview URL"

**Solution:**

1. Ensure Vercel is connected to GitHub repo
2. Check Vercel is deploying preview for PRs
3. Wait longer (up to 5 minutes for Vercel deployment)

### "All workflows are skipped"

**Solution:**

1. Ensure `.github/workflows/` directory exists
2. Check workflow YAML syntax is valid
3. Ensure branch names match triggers (e.g., PR to `main`)

---

## 12. Cost Summary

### Current Setup (Open Source)

```
Codecov:      $0/month (unlimited for open source)
Snyk:         $0/month (200 tests/month)
SonarCloud:   $0/month (unlimited for open source)
Code Climate: $0/month (unlimited for open source)
GitHub Actions: $0/month (810/2000 min used = 40.5%)
──────────────────────────────────────
TOTAL:        $0/month
```

### If Private Repository

```
Codecov:      $0/month (1 private repo free)
Snyk:         $0/month (200 tests/month)
SonarCloud:   $10/month (required for private)
Code Climate: $0/month (skip) or $249/month (optional)
GitHub Actions: $0/month (within free tier)
──────────────────────────────────────
TOTAL:        $10/month (without Code Climate)
              $259/month (with Code Climate)
```

**Recommendation:** Start with $10/month (SonarCloud only), add Code Climate later if needed.

---

## 13. Success Criteria

After completing this setup, you should have:

✅ All 5 GitHub secrets configured
✅ All 4 external services connected
✅ Branch protection rules enabled with all 5 required checks
✅ Test PR successfully created and merged
✅ Direct pushes to main blocked
✅ All quality dashboards accessible
✅ Zero manual intervention needed for future PRs

**Result:** Automated quality system is fully operational and enforcing all checks.

---

## Next Steps

1. ✅ **Complete this setup** (you are here)
2. ✅ **Configure branch protection** (see BRANCH_PROTECTION_SETUP.md)
3. ✅ **Create first PR** to test system
4. ✅ **Verify all checks pass**
5. ✅ **Begin normal development workflow**

All future development will automatically flow through this quality system.
