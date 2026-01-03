# Development Workflow Guide

**Last Updated:** 2026-01-02
**Status:** Production-ready ✅

---

**Related Documentation:**

- [Development Workflow](../../mo-arch/docs/development/workflow.md) - Feature development methodology
- [Quality Gates & Deployment](../../mo-arch/docs/development/quality-gates.md) - 27 quality gates explained

---

## Quick Reference

### Solo Developer Workflow (Current)

```bash
# 1. Make changes
git add .
git commit -m "feat: description"  # Pre-commit: 6 checks (~45 sec)

# 2. Push to main
git push origin main  # Pre-push: 21 checks (~3 min)

# 3. Post-merge validation runs automatically on main
```

**No PR required** - Direct pushes to `main` allowed for solo development.

---

## Quality Gates (27 Total)

### Layer 1: Pre-Commit (6 checks, ~45 sec)

Runs automatically on `git commit`:

1. File size limits (source: 100KB, config: 500KB, images: 2MB)
2. Auto-formatting (Prettier)
3. Test coverage gate (ensures tests exist for changed files)
4. New test execution (verifies new tests run)
5. Parallel quality checks (secrets, TypeScript, all tests, ESLint)
6. Coverage verification (100% threshold)

**Purpose:** Fail fast, prevent bad code from entering git history

### Layer 2: Pre-Push (21 checks, ~3 min)

Runs automatically on `git push`:

**Phase 1: Static Analysis** (12 checks, parallel, ~20 sec)

- Secret detection, TypeScript, ESLint, debug code
- Dead code, license compliance
- Database schema & migration safety
- Privacy leak detection
- E2E/Accessibility/API coverage verification

**Phase 2: Heavy Validation** (7 checks, ~2 min)

- Unit tests with 100% coverage
- Coverage count check (detects untested files)
- Production build
- E2E critical flows
- Accessibility tests
- Lighthouse performance (in CI)
- Bundle size validation

**Phase 3: SonarCloud** (2 checks, ~30 sec)

- Quality analysis (80% coverage minimum)
- Quality gate blocking

**Purpose:** Comprehensive validation before code reaches remote

### Layer 3: Post-Merge (6 jobs on main)

Runs automatically after push to `main`:

1. Full test suite with Codecov upload
2. Production build + bundle analysis
3. E2E critical flows
4. Database migration safety
5. Code quality verification
6. Summary status (blocks if any fail)

**Purpose:** Safety net, main branch health monitoring

---

## Common Commands

### Development

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run test             # Run unit tests
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests
npm run test:axe         # Run accessibility tests
```

### Quality Checks (Run Manually)

```bash
npm run check:all        # Run all checks (parallel)
npm run check:types      # TypeScript check
npm run check:lint       # ESLint
npm run check:secrets    # Secret detection
npm run check:coverage-count  # Coverage file count
npm run sonar            # SonarCloud analysis (requires SONAR_TOKEN)
```

### Database

```bash
npm run db:push          # Push schema to database
npm run db:seed          # Seed PPL template
npm run db:studio        # Open Drizzle Studio
```

---

## Auto-Formatting

**Configuration:** `.claude/settings.json`

Every time Claude edits or writes a file, two hooks run automatically:

1. **ESLint auto-fix** - Fixes linting issues
2. **Prettier auto-format** - Formats code

**Hooks configuration:**

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "command": "eslint --fix" }] },
      { "matcher": "Edit|Write", "hooks": [{ "command": "prettier --write" }] }
    ]
  }
}
```

**What this means:**

- ✅ No need to manually run `npm run lint:fix`
- ✅ No need to manually run `prettier --write`
- ✅ All code is formatted consistently before commit

**File types covered:**

- ESLint: `.ts`, `.tsx`, `.js`, `.jsx`
- Prettier: `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md`

**Note:** These hooks run BEFORE the pre-commit hook (Gate 1.2), so formatting is already done by the time git commit runs.

---

## Writing Commits

### Conventional Commits (Enforced by commitlint)

```bash
# Format: <type>(<scope>): <description>
#
# Types:
#   feat     - New feature
#   fix      - Bug fix
#   chore    - Maintenance (dependencies, config)
#   docs     - Documentation only
#   refactor - Code restructuring (no behavior change)
#   test     - Adding/updating tests
#   perf     - Performance improvement

# Examples:
git commit -m "feat(workout): add rest timer"
git commit -m "fix(api): handle missing user profile"
git commit -m "chore: update dependencies"
```

### Auto-Added Footer

All commits include:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## When Checks Fail

### Pre-Commit Failures

```bash
# Fix the issue, then:
git add .
git commit -m "your message"  # Runs checks again
```

### Pre-Push Failures

```bash
# Common failures and fixes:

# 1. Coverage count dropped
# → You removed tests or added untested code
# Fix: Add tests or update MINIMUM_FILES in scripts/check-coverage-count.sh

# 2. SonarCloud quality gate failed
# → Coverage < 80% or code quality issues
# Fix: Add tests, reduce duplication, fix code smells

# 3. E2E tests failed
# → Integration issues or UI changes
# Fix: Update tests or fix the code

# 4. Build failed
# → TypeScript errors or build issues
# Fix: Run `npm run build` locally and fix errors
```

---

## Branch Protection (Current Settings)

✅ **Linear history** - No merge commits
✅ **No force pushes** - Cannot rewrite history
✅ **No branch deletion** - Main branch cannot be deleted
❌ **No PR requirement** - Direct pushes allowed (solo dev)
❌ **No required approvals** - Not needed for solo dev

---

## Coverage Philosophy

### 100% Coverage Required

**What's covered:**

- All API routes (`app/api/**/*.ts`)
- All business logic (`lib/mo-*/**`)
- All utility functions (`lib/utils/**`)
- Reusable components with logic

**What's excluded:**

- Next.js page/layout files (tested via E2E)
- Pure UI components (tested via E2E)
- Configuration files
- Database schema declarations
- Type definition files

**How it's enforced:**

1. **Vitest** - 100% on files that are tested (pre-commit + pre-push)
2. **Coverage count** - Detects if files drop out of coverage (pre-push)
3. **SonarCloud** - 80% minimum on all source files (pre-push + CI)

---

## CI/CD (GitHub Actions)

Workflows run automatically on push to `main`:

- **Quick Check** - Fast sanity checks (~1 min)
- **PR Validation** - Tests, build, E2E (~4 min)
- **Code Quality** - SonarCloud analysis (~2 min)
- **Security** - Dependency + secret scanning (~2 min)
- **Post-Merge** - Full validation suite (~5 min)

**Deployment:**

- Vercel deploys automatically on push to `main`
- Preview URLs created for all deployments

---

## When to Use PRs (Optional)

Even though PR requirement is disabled, you can still create PRs manually:

**Use PRs for:**

- Large refactoring (want to review changes in GitHub UI)
- Experimental features (want deployment preview)
- Breaking changes (want extra validation)

```bash
# Create feature branch
git checkout -b feat/feature-name

# Push and create PR
git push origin feat/feature-name
gh pr create --title "Add feature" --body "Description"

# Merge when ready
gh pr merge --squash
```

---

## Troubleshooting

### "Pre-push hook taking too long"

- Normal: ~2.5-3 minutes
- If longer: Check `SonarCloud` step (requires SONAR_TOKEN)
- Skip SonarCloud locally: Comment out in `.husky/pre-push` (not recommended)

### "Coverage count check failed"

- Check: `scripts/check-coverage-count.sh`
- Update `MINIMUM_FILES` if you intentionally added/removed code
- Current baseline: 15 files

### "Git hook not running"

- Ensure Husky installed: `npm install`
- Check hooks enabled: `git config core.hooksPath`
- Should show: `.husky`

---

## SonarCloud Setup

**Required for:** Pre-push Gate 2.18 (SonarCloud analysis)

**Get Token:**

1. Visit: https://sonarcloud.io/account/security
2. Generate new token with name "Local Development"
3. Copy token value

**Set in Environment:**

```bash
# Add to ~/.zshrc or ~/.bashrc
export SONAR_TOKEN=your-token-here

# Reload shell
source ~/.zshrc
```

**Verify:**

```bash
echo $SONAR_TOKEN  # Should output your token
npm run sonar      # Should run successfully
```

**Without Token:** Pre-push will fail at Phase 3 (line 171-176 in .husky/pre-push)

**Dashboard:** https://sonarcloud.io/dashboard?id=tumativerse_mo-app

---

## For Future Team Members

When adding collaborators:

1. **Enable PR requirement:**

   ```bash
   gh api repos/tumativerse/mo-app/branches/main/protection -X PUT --input @.github/protection-with-pr.json
   ```

2. **Set required approvals:**
   - 1 approval for <5 developers
   - 2 approvals for 5+ developers

3. **Add to CODEOWNERS file** (optional):
   ```
   # .github/CODEOWNERS
   * @tumativerse
   lib/security/** @tumativerse @security-lead
   ```

---

## Resources

- Workflow analysis: `.claude/WORKFLOW_ANALYSIS.md`
- SonarCloud setup: `.claude/SONARCLOUD_SETUP.md`
- Branch protection: `.github/BRANCH_PROTECTION_SETUP.md`
- GitHub Actions: `.github/README.md`
