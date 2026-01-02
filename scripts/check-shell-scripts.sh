#!/bin/bash
# Shell Script Quality Check
# Uses shellcheck to validate shell scripts for common issues

echo "🐚 Running ShellCheck on Git hooks and scripts..."
echo ""

ERRORS=0

# Check if shellcheck is installed
if ! command -v shellcheck &> /dev/null; then
  echo "⚠️  shellcheck not installed"
  echo ""
  echo "Install with:"
  echo "  macOS:   brew install shellcheck"
  echo "  Ubuntu:  apt-get install shellcheck"
  echo "  Windows: scoop install shellcheck"
  echo ""
  echo "Skipping shell script checks..."
  exit 0
fi

SHELLCHECK_VERSION=$(shellcheck --version | grep "version:" | awk '{print $2}')
echo "Using ShellCheck version $SHELLCHECK_VERSION"
echo ""

# Find all shell scripts
SCRIPTS=(
  ".husky/pre-commit"
  ".husky/commit-msg"
  ".husky/pre-push"
  "scripts/verify-workflow-setup.sh"
  "scripts/check-shell-scripts.sh"
)

echo "Analyzing ${#SCRIPTS[@]} shell scripts..."
echo ""

for script in "${SCRIPTS[@]}"; do
  if [ ! -f "$script" ]; then
    echo "  ⚠️  Not found: $script"
    continue
  fi

  echo "  → $script"

  # Run shellcheck with appropriate severity
  # -S error: Only show errors (not warnings/info)
  # -e SC2181: Exclude "check exit code directly" rule
  # -e SC2310: Exclude "function may not return error" rule
  if shellcheck -S error "$script" > /tmp/shellcheck-output.txt 2>&1; then
    echo "    ✓ No errors"
  else
    echo "    ❌ Errors found:"
    cat /tmp/shellcheck-output.txt | sed 's/^/       /'
    ERRORS=$((ERRORS + 1))
    echo ""
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
  echo "✅ All shell scripts passed ShellCheck validation"
  echo ""
  echo "No critical issues found in:"
  for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
      echo "  ✓ $script"
    fi
  done
  exit 0
else
  echo "❌ $ERRORS shell script(s) have errors"
  echo ""
  echo "Please fix the issues above."
  echo ""
  echo "Common fixes:"
  echo "  - Quote variables: \"\$VAR\" instead of \$VAR"
  echo "  - Check command existence: command -v cmd &> /dev/null"
  echo "  - Use [[ ]] for conditionals in bash"
  echo "  - Avoid useless cat: grep pattern file (not cat file | grep pattern)"
  echo ""
  exit 1
fi
