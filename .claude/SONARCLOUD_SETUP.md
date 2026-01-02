# SonarCloud 100% Coverage Setup

## Current Configuration

Your `sonar-project.properties` is configured to **wait for and block on quality gate failures**.

However, the **100% coverage threshold** must be set in the SonarCloud web UI.

---

## Setting 100% Coverage Requirement

### Option 1: Create Custom Quality Gate (Recommended)

1. Go to https://sonarcloud.io/organizations/tumativerse/quality_gates
2. Click **"Create"**
3. Name it: **"Mo App - 100% Coverage"**
4. Add the following conditions:

   **On Overall Code:**
   - Coverage on New Code: **is less than 100%** → FAIL
   - Coverage: **is less than 100%** → FAIL
   - Duplicated Lines (%): **is greater than 3%** → FAIL
   - Maintainability Rating: **is worse than A** → FAIL
   - Reliability Rating: **is worse than A** → FAIL
   - Security Rating: **is worse than A** → FAIL

5. Click **"Set as Default"** or assign it to your project:
   - Go to https://sonarcloud.io/project/quality_gate?id=tumativerse_mo-app
   - Select your custom quality gate

### Option 2: Modify Default Quality Gate

1. Go to https://sonarcloud.io/organizations/tumativerse/quality_gates
2. Find **"Sonar way"** (the default)
3. **Copy** it to create your own version
4. Edit the coverage conditions to require 100%

---

## Verification

After configuring:

1. **Local test:**

   ```bash
   npm run sonar
   ```

   Should fail if coverage < 100%

2. **Pre-push test:**

   ```bash
   git push
   ```

   Pre-push hook runs SonarCloud and will block if quality gate fails

3. **CI test:**
   Push to a branch and create a PR - GitHub Actions will run SonarCloud

---

## Current Quality Gate Status

Check your current settings at:

- Project Quality Gate: https://sonarcloud.io/project/quality_gate?id=tumativerse_mo-app
- Organization Quality Gates: https://sonarcloud.io/organizations/tumativerse/quality_gates

---

## Why 100% Coverage?

Your pre-push hook already enforces 100% via Vitest (`vitest.config.ts`):

```typescript
thresholds: {
  lines: 100,
  functions: 100,
  branches: 100,
  statements: 100,
}
```

SonarCloud's 100% threshold provides a **redundant safety net** in case:

- Someone bypasses git hooks (rare but possible)
- Vitest coverage calculation differs from SonarCloud's
- Integration issues slip through local checks

---

## Notes

- SonarCloud's default quality gate requires **80% coverage**
- Your custom gate will require **100%** to match local enforcement
- The quality gate blocks merges via GitHub branch protection
