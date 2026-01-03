#!/bin/bash
# Coverage Baseline Auto-Update Script
#
# This script automatically updates the MINIMUM_FILES baseline in check-coverage-count.sh
# to match the current coverage count.
#
# Usage:
#   npm run update-coverage-baseline
#
# When to use:
#   - After adding new testable code with tests (coverage count increased)
#   - After removing code (coverage count decreased)
#   - After passing all quality gates with new coverage

set -e

COVERAGE_FILE="coverage/lcov.info"
CHECK_SCRIPT="scripts/check-coverage-count.sh"

# Verify coverage file exists
if [ ! -f "$COVERAGE_FILE" ]; then
  echo "❌ Coverage file not found: $COVERAGE_FILE"
  echo "   Run: npm run test:coverage"
  exit 1
fi

# Verify check script exists
if [ ! -f "$CHECK_SCRIPT" ]; then
  echo "❌ Check script not found: $CHECK_SCRIPT"
  exit 1
fi

# Count actual files with coverage
ACTUAL_FILES=$(grep -c "^SF:" "$COVERAGE_FILE")

# Get current baseline
CURRENT_BASELINE=$(grep "^MINIMUM_FILES=" "$CHECK_SCRIPT" | cut -d'=' -f2)

echo "📊 Coverage baseline update:"
echo "   Current baseline: $CURRENT_BASELINE files"
echo "   Actual coverage: $ACTUAL_FILES files"
echo ""

# Check if update is needed
if [ "$ACTUAL_FILES" -eq "$CURRENT_BASELINE" ]; then
  echo "✅ Baseline is already up to date ($ACTUAL_FILES files)"
  exit 0
fi

# Update the baseline
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/^MINIMUM_FILES=[0-9]*/MINIMUM_FILES=$ACTUAL_FILES/" "$CHECK_SCRIPT"
else
  # Linux
  sed -i "s/^MINIMUM_FILES=[0-9]*/MINIMUM_FILES=$ACTUAL_FILES/" "$CHECK_SCRIPT"
fi

echo "✅ Coverage baseline updated!"
echo "   Old: $CURRENT_BASELINE files"
echo "   New: $ACTUAL_FILES files"
echo ""
echo "   Updated: $CHECK_SCRIPT"
echo ""
echo "   Don't forget to commit this change!"
exit 0
