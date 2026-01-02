# 🔐 GitHub Secrets Setup Guide

**Date:** 2026-01-02
**Project:** Mo Fitness App
**Purpose:** Configure required GitHub secrets for CI/CD workflows

---

## 📋 Overview

After updating the GitHub Actions workflows, you need to configure **6 repository secrets** for the CI/CD pipeline to work properly.

**Time Required:** ~10 minutes

---

## 🎯 Required Secrets (6 Total)

### Critical (Must Have - 4 secrets)

1. ✅ **SONAR_TOKEN** - SonarCloud authentication
2. ✅ **SONAR_ORGANIZATION** - SonarCloud organization name
3. ✅ **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** - Clerk public key for E2E tests
4. ✅ **CLERK_SECRET_KEY** - Clerk secret key for E2E tests

### Optional (For Additional Features - 2 secrets)

5. 🟡 **CODECOV_TOKEN** - Codecov coverage tracking
6. 🟡 **SNYK_TOKEN** - Snyk security scanning

---

## 📍 Where to Add Secrets

**GitHub Repository:**

1. Go to your repository: https://github.com/[YOUR_USERNAME]/mo-app
2. Click **Settings** (top navigation)
3. Click **Secrets and variables** (left sidebar)
4. Click **Actions**
5. Click **New repository secret** button

---

## 1️⃣ SONAR_TOKEN ✅

### What is it?

Authentication token for SonarCloud static code analysis.

### Value

```
255bd3d46cbcc47de8b737c0e6549316406e8b57
```

### Where we found it

This token is already in your `~/.zshrc` file.

### How to add

1. Go to GitHub Secrets page
2. Click **New repository secret**
3. Name: `SONAR_TOKEN`
4. Secret: `255bd3d46cbcc47de8b737c0e6549316406e8b57`
5. Click **Add secret**

### Used in

- `.github/workflows/code-quality.yml` - SonarCloud analysis

---

## 2️⃣ SONAR_ORGANIZATION ✅

### What is it?

Your SonarCloud organization identifier.

### Value

```
tumativerse
```

### Where we found it

From `sonar-project.properties` file (line 6).

### How to add

1. Go to GitHub Secrets page
2. Click **New repository secret**
3. Name: `SONAR_ORGANIZATION`
4. Secret: `tumativerse`
5. Click **Add secret**

### Used in

- `.github/workflows/code-quality.yml` - SonarCloud organization

---

## 3️⃣ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ✅

### What is it?

Clerk's public key for authentication in E2E and accessibility tests.

### Where to find it

**Option 1: From your local .env.local file**

```bash
# Run this command in your terminal:
grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local

# Output will look like:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Option 2: From Clerk Dashboard**

1. Go to https://dashboard.clerk.com
2. Sign in to your account
3. Select your Mo app project
4. Go to **API Keys** (left sidebar under Developers)
5. Find **Publishable key**
6. Copy the key (starts with `pk_test_` or `pk_live_`)

### Format

Should start with `pk_test_` for test environment:

```
pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### ⚠️ Important

**Use TEST keys for CI/CD, NOT production keys!**

- Use `pk_test_...` keys (not `pk_live_...`)
- Test keys are safe to use in GitHub Actions
- Production keys should never be in CI/CD

### How to add

1. Go to GitHub Secrets page
2. Click **New repository secret**
3. Name: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Secret: `pk_test_XXXXXXXXX...` (paste your key)
5. Click **Add secret**

### Used in

- `.github/workflows/pr-validation.yml` - E2E tests
- `.github/workflows/pr-validation.yml` - Accessibility tests

---

## 4️⃣ CLERK_SECRET_KEY ✅

### What is it?

Clerk's private key for server-side authentication in tests.

### Where to find it

**Option 1: From your local .env.local file**

```bash
# Run this command in your terminal:
grep "CLERK_SECRET_KEY" .env.local

# Output will look like:
# CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Option 2: From Clerk Dashboard**

1. Go to https://dashboard.clerk.com
2. Sign in to your account
3. Select your Mo app project
4. Go to **API Keys** (left sidebar under Developers)
5. Find **Secret key**
6. Click **Show** to reveal the key
7. Copy the key (starts with `sk_test_` or `sk_live_`)

### Format

Should start with `sk_test_` for test environment:

```
sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### ⚠️ Critical Security Warning

- **NEVER commit this key to git!**
- **Use TEST keys (sk*test*...) for CI/CD**
- **Do NOT use production keys (sk*live*...)**
- This key grants full access to your Clerk account
- Keep it secret and secure

### How to add

1. Go to GitHub Secrets page
2. Click **New repository secret**
3. Name: `CLERK_SECRET_KEY`
4. Secret: `sk_test_XXXXXXXXX...` (paste your key)
5. Click **Add secret**

### Used in

- `.github/workflows/pr-validation.yml` - E2E tests
- `.github/workflows/pr-validation.yml` - Accessibility tests

---

## 5️⃣ CODECOV_TOKEN 🟡 (Optional)

### What is it?

Token for uploading code coverage reports to Codecov.io for tracking coverage trends.

### Do you need it?

**Optional** - You're already using SonarCloud for coverage tracking.

**Benefits of adding:**

- ✅ Additional coverage trend visualization
- ✅ Coverage badges for README
- ✅ Pull request coverage comments
- ✅ Historical coverage graphs

**If you skip:**

- ✅ CI will still work
- ✅ SonarCloud tracks coverage
- ⚠️ Codecov upload step will be skipped (non-blocking)

### How to get it

1. Go to https://codecov.io
2. Click **Sign up** (or **Log in**)
3. Click **Login with GitHub**
4. Authorize Codecov to access your GitHub account
5. Click **+ Add new repository**
6. Select **mo-app** from the list
7. Copy the **upload token** shown on screen

### How to add

1. Go to GitHub Secrets page
2. Click **New repository secret**
3. Name: `CODECOV_TOKEN`
4. Secret: (paste token from Codecov dashboard)
5. Click **Add secret**

### Used in

- `.github/workflows/pr-validation.yml` - Coverage upload

### To disable Codecov (if skipping)

Edit `.github/workflows/pr-validation.yml` and change line 52:

```yaml
# Before:
fail_ci_if_error: true

# After:
fail_ci_if_error: false
```

---

## 6️⃣ SNYK_TOKEN 🟡 (Optional)

### What is it?

Token for Snyk security scanning of dependencies.

### Do you need it?

**Optional** - You're already using `npm audit` for dependency scanning.

**Benefits of adding:**

- ✅ More comprehensive vulnerability database
- ✅ Automated fix PRs
- ✅ License compliance checking
- ✅ Container scanning (if using Docker)

**If you skip:**

- ✅ CI will still work
- ✅ npm audit runs weekly
- ⚠️ Snyk scan step will be skipped (non-blocking)

### How to get it

1. Go to https://snyk.io
2. Click **Sign up** (or **Log in**)
3. Click **Continue with GitHub**
4. Authorize Snyk to access your GitHub account
5. Click your **name/avatar** (top right)
6. Click **Account settings**
7. Click **General** tab
8. Find **Auth Token** section
9. Click **Show** to reveal token
10. Copy the token

### How to add

1. Go to GitHub Secrets page
2. Click **New repository secret**
3. Name: `SNYK_TOKEN`
4. Secret: (paste token from Snyk dashboard)
5. Click **Add secret**

### Used in

- `.github/workflows/security.yml` - Dependency scanning

### To disable Snyk (if skipping)

Edit `.github/workflows/security.yml` and change line 44:

```yaml
# Before:
continue-on-error: false

# After:
continue-on-error: true
```

---

## ✅ Setup Checklist

### Critical Secrets (Required)

- [ ] **SONAR_TOKEN** = `255bd3d46cbcc47de8b737c0e6549316406e8b57`
- [ ] **SONAR_ORGANIZATION** = `tumativerse`
- [ ] **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** = `pk_test_...` (from .env.local or Clerk dashboard)
- [ ] **CLERK_SECRET_KEY** = `sk_test_...` (from .env.local or Clerk dashboard)

### Optional Secrets (Recommended)

- [ ] **CODECOV_TOKEN** (or make non-blocking in workflow)
- [ ] **SNYK_TOKEN** (or make non-blocking in workflow)

---

## 🔍 How to Verify Secrets Are Set

### After adding secrets:

1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. You should see all 4-6 secrets listed
3. Secrets are masked and can't be viewed after creation

### Test secrets work:

1. Create a test branch and push (triggers `quick-check.yml`)
2. Create a PR to main (triggers all workflows)
3. Go to **Actions** tab
4. Watch workflows run
5. Check for any "Secret not found" errors

---

## 🚨 Troubleshooting

### Error: "SONAR_TOKEN is not set"

**Fix:** Make sure you named it exactly `SONAR_TOKEN` (case-sensitive)

### Error: "CLERK_SECRET_KEY is not set"

**Fix:** Ensure the key starts with `sk_test_` (use test keys, not production)

### Error: "Codecov upload failed"

**Options:**

1. Add CODECOV_TOKEN to GitHub secrets
2. OR edit workflow to make it non-blocking (`fail_ci_if_error: false`)

### Error: "Snyk authentication failed"

**Options:**

1. Add SNYK_TOKEN to GitHub secrets
2. OR edit workflow to make it non-blocking (`continue-on-error: true`)

---

## 📝 Quick Command Reference

### Find Clerk keys in .env.local

```bash
# Run from project root:
grep "CLERK" .env.local

# Should show:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...
```

### Verify secrets are set (after adding to GitHub)

```bash
# This won't show secret values (they're masked)
# But you can see if they exist:
# Go to: https://github.com/[USERNAME]/mo-app/settings/secrets/actions
```

---

## 🎯 Next Steps

After adding all required secrets:

1. ✅ **Test the workflow:**

   ```bash
   # Create test branch
   git checkout -b test/github-actions

   # Make trivial change
   echo "# Test" >> README.md

   # Commit and push
   git add README.md
   git commit -m "test: verify GitHub Actions secrets"
   git push -u origin test/github-actions
   ```

2. ✅ **Monitor Actions:**
   - Go to GitHub → Actions tab
   - Watch `quick-check.yml` run
   - Verify it passes

3. ✅ **Create test PR:**
   - Create PR from test branch to main
   - Watch all workflows trigger
   - Verify all secrets work

4. ✅ **Cleanup:**
   - Close test PR (don't merge)
   - Delete test branch

---

## 📚 Additional Resources

### Clerk Documentation

- **Dashboard:** https://dashboard.clerk.com
- **API Keys Guide:** https://clerk.com/docs/references/backend/overview#api-keys
- **Test vs Production:** https://clerk.com/docs/deployments/environments

### SonarCloud

- **Dashboard:** https://sonarcloud.io/projects
- **Token Management:** https://sonarcloud.io/account/security

### Optional Services

- **Codecov:** https://codecov.io
- **Snyk:** https://snyk.io

### GitHub Secrets

- **Documentation:** https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Best Practices:** https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions

---

**Setup Time:** ~10 minutes for critical secrets, ~20 minutes if adding optional secrets

**Ready to proceed!** Once you've added the 4 critical secrets, you can test the full CI/CD pipeline.
