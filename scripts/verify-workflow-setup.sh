#!/bin/bash
# Workflow Setup Verification
# Verifies all prerequisites for the quality workflow are met
# Run this before your first commit/push

echo "🔍 Verifying Quality Workflow Setup..."
echo ""

ERRORS=0
WARNINGS=0

# =============================================================================
# 1. Check Node.js and npm versions
# =============================================================================
echo "📦 Checking Node.js and npm..."

NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//')
if [ $? -ne 0 ]; then
  echo "  ❌ Node.js not found"
  ERRORS=$((ERRORS + 1))
else
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -lt 20 ]; then
    echo "  ❌ Node.js version $NODE_VERSION (need v20+)"
    ERRORS=$((ERRORS + 1))
  else
    echo "  ✓ Node.js $NODE_VERSION"
  fi
fi

NPM_VERSION=$(npm --version 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "  ❌ npm not found"
  ERRORS=$((ERRORS + 1))
else
  NPM_MAJOR=$(echo "$NPM_VERSION" | cut -d. -f1)
  if [ "$NPM_MAJOR" -lt 10 ]; then
    echo "  ❌ npm version $NPM_VERSION (need v10+)"
    ERRORS=$((ERRORS + 1))
  else
    echo "  ✓ npm $NPM_VERSION"
  fi
fi

echo ""

# =============================================================================
# 2. Check dependencies
# =============================================================================
echo "📚 Checking dependencies..."

if [ ! -d "node_modules" ]; then
  echo "  ❌ node_modules not found - run 'npm install'"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ node_modules exists"

  # Check critical dependencies
  CRITICAL_DEPS=(
    "npm-run-all"
    "@commitlint/cli"
    "@lhci/cli"
    "@playwright/test"
    "vitest"
    "secretlint"
    "ts-prune"
  )

  for dep in "${CRITICAL_DEPS[@]}"; do
    if [ ! -d "node_modules/$dep" ]; then
      echo "  ❌ Missing dependency: $dep"
      ERRORS=$((ERRORS + 1))
    fi
  done

  if [ $ERRORS -eq 0 ]; then
    echo "  ✓ All critical dependencies installed"
  fi
fi

echo ""

# =============================================================================
# 3. Check Playwright browsers
# =============================================================================
echo "🎭 Checking Playwright browsers..."

if [ -d "$HOME/Library/Caches/ms-playwright" ] || [ -d "$HOME/.cache/ms-playwright" ]; then
  echo "  ✓ Playwright browsers installed"
else
  echo "  ❌ Playwright browsers not installed"
  echo "     Run: npx playwright install"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# =============================================================================
# 4. Check environment variables
# =============================================================================
echo "🔐 Checking environment variables..."

if [ -z "$SONAR_TOKEN" ]; then
  echo "  ⚠️  SONAR_TOKEN not set"
  echo "     Pre-push will fail without this"
  echo "     Get token: https://sonarcloud.io/account/security"
  echo "     Set: export SONAR_TOKEN=your-token"
  WARNINGS=$((WARNINGS + 1))
else
  echo "  ✓ SONAR_TOKEN set"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "  ⚠️  DATABASE_URL not set"
  echo "     Database-dependent tests may fail"
  WARNINGS=$((WARNINGS + 1))
else
  echo "  ✓ DATABASE_URL set"
fi

if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ] || [ -z "$CLERK_SECRET_KEY" ]; then
  echo "  ⚠️  Clerk keys not set"
  echo "     Authentication tests may fail"
  WARNINGS=$((WARNINGS + 1))
else
  echo "  ✓ Clerk keys set"
fi

echo ""

# =============================================================================
# 5. Check Git hooks
# =============================================================================
echo "🪝 Checking Git hooks..."

if [ ! -d ".husky" ]; then
  echo "  ❌ .husky directory not found"
  echo "     Run: npm run prepare"
  ERRORS=$((ERRORS + 1))
else
  HOOKS=("pre-commit" "commit-msg" "pre-push")
  for hook in "${HOOKS[@]}"; do
    if [ ! -f ".husky/$hook" ]; then
      echo "  ❌ Missing hook: $hook"
      ERRORS=$((ERRORS + 1))
    elif [ ! -x ".husky/$hook" ]; then
      echo "  ⚠️  Hook not executable: $hook"
      echo "     Run: chmod +x .husky/$hook"
      WARNINGS=$((WARNINGS + 1))
    else
      echo "  ✓ $hook exists and executable"
    fi
  done
fi

echo ""

# =============================================================================
# 6. Check test directories
# =============================================================================
echo "🧪 Checking test directories..."

TEST_DIRS=(
  "tests/e2e"
  "tests/e2e/critical"
  "tests/accessibility"
  "tests/api-contracts"
  "tests/fixtures"
  "tests/helpers"
)

for dir in "${TEST_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "  ⚠️  Missing test directory: $dir"
    echo "     Run: mkdir -p $dir"
    WARNINGS=$((WARNINGS + 1))
  else
    echo "  ✓ $dir exists"
  fi
done

echo ""

# =============================================================================
# 7. Check configuration files
# =============================================================================
echo "⚙️  Checking configuration files..."

CONFIG_FILES=(
  "vitest.config.ts"
  "playwright.config.ts"
  "lighthouserc.json"
  "commitlint.config.js"
  ".secretlintrc.json"
  "tsconfig.json"
)

for file in "${CONFIG_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "  ❌ Missing config file: $file"
    ERRORS=$((ERRORS + 1))
  else
    echo "  ✓ $file exists"
  fi
done

echo ""

# =============================================================================
# 8. Check coverage scripts
# =============================================================================
echo "📊 Checking coverage scripts..."

SCRIPTS=(
  "scripts/check-e2e-coverage.js"
  "scripts/check-a11y-coverage.js"
  "scripts/check-api-coverage.js"
)

for script in "${SCRIPTS[@]}"; do
  if [ ! -f "$script" ]; then
    echo "  ❌ Missing script: $script"
    ERRORS=$((ERRORS + 1))
  elif [ ! -x "$script" ]; then
    echo "  ⚠️  Script not executable: $script"
    echo "     Run: chmod +x $script"
    WARNINGS=$((WARNINGS + 1))
  else
    echo "  ✓ $script exists and executable"
  fi
done

echo ""

# =============================================================================
# 9. Test npm scripts
# =============================================================================
echo "🔧 Testing npm scripts..."

SCRIPTS_TO_TEST=(
  "check:types"
  "check:lint"
  "check:secrets"
)

for script in "${SCRIPTS_TO_TEST[@]}"; do
  if npm run $script --if-present > /dev/null 2>&1; then
    echo "  ✓ $script runs"
  else
    echo "  ⚠️  $script may have issues (this is OK if no relevant files exist yet)"
    WARNINGS=$((WARNINGS + 1))
  fi
done

echo ""

# =============================================================================
# 10. Git repository check
# =============================================================================
echo "📁 Checking Git repository..."

if [ ! -d ".git" ]; then
  echo "  ❌ Not a Git repository"
  echo "     Run: git init"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ Git repository exists"

  # Check if user has git config
  GIT_USER=$(git config user.name 2>/dev/null)
  GIT_EMAIL=$(git config user.email 2>/dev/null)

  if [ -z "$GIT_USER" ] || [ -z "$GIT_EMAIL" ]; then
    echo "  ⚠️  Git user not configured"
    echo "     Run: git config user.name 'Your Name'"
    echo "     Run: git config user.email 'your@email.com'"
    WARNINGS=$((WARNINGS + 1))
  else
    echo "  ✓ Git user configured: $GIT_USER <$GIT_EMAIL>"
  fi
fi

echo ""

# =============================================================================
# Summary
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SETUP VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ Perfect! All checks passed."
  echo ""
  echo "You're ready to use the quality workflow."
  echo ""
  echo "Next steps:"
  echo "  1. Make a change to your code"
  echo "  2. git add ."
  echo "  3. git commit -m 'feat: your change'"
  echo "  4. git push"
  echo ""
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  Setup complete with $WARNINGS warning(s)."
  echo ""
  echo "Warnings are non-critical but should be addressed:"
  echo "  - Some features may not work correctly"
  echo "  - Pre-push may fail if environment variables missing"
  echo ""
  echo "Review warnings above and fix as needed."
  echo ""
  exit 0
else
  echo "❌ Setup incomplete - $ERRORS error(s), $WARNINGS warning(s)"
  echo ""
  echo "Please fix the errors above before using the workflow."
  echo ""
  echo "Common fixes:"
  echo "  - npm install                    # Install dependencies"
  echo "  - npx playwright install        # Install browsers"
  echo "  - npm run prepare               # Setup Git hooks"
  echo "  - export SONAR_TOKEN=your-token # Set environment variable"
  echo ""
  exit 1
fi
