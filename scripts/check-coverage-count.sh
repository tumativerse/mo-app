#!/bin/bash
# Coverage Count Check - Simple untested file detector
#
# This script ensures you don't accidentally add untested files.
# Instead of maintaining exclusion lists, it just counts files in coverage report.
#
# How it works:
# 1. Counts files in coverage/lcov.info
# 2. Compares against minimum threshold
# 3. Fails if count drops below threshold
#
# When to update MINIMUM_FILES:
# - After adding new testable code with tests: Increase the number
# - After removing code: Decrease the number
# - Current baseline: 15 files (as of 2026-01-02)

# MINIMUM number of files that MUST have coverage
# Update this number when you add new testable code
MINIMUM_FILES=15

# Count files in coverage report
COVERAGE_FILE="coverage/lcov.info"

if [ ! -f "$COVERAGE_FILE" ]; then
  echo "❌ Coverage file not found: $COVERAGE_FILE"
  echo "   Run: npm run test:coverage"
  exit 1
fi

COVERED_FILES=$(grep -c "^SF:" "$COVERAGE_FILE")

echo "📊 Coverage file count check:"
echo "   Files with coverage: $COVERED_FILES"
echo "   Minimum required: $MINIMUM_FILES"
echo ""

if [ "$COVERED_FILES" -lt "$MINIMUM_FILES" ]; then
  echo "❌ COVERAGE COUNT DROPPED!"
  echo ""
  echo "   Expected at least $MINIMUM_FILES files with coverage,"
  echo "   but only found $COVERED_FILES files."
  echo ""
  echo "   This usually means:"
  echo "   - You deleted tests (fix: restore tests)"
  echo "   - You refactored and removed code (fix: update MINIMUM_FILES in this script)"
  echo "   - Coverage report is stale (fix: run npm run test:coverage)"
  echo ""
  exit 1
fi

if [ "$COVERED_FILES" -gt "$MINIMUM_FILES" ]; then
  echo "✅ Coverage count increased! ($COVERED_FILES > $MINIMUM_FILES)"
  echo ""
  echo "   You added new testable code with tests. Great!"
  echo "   Consider updating MINIMUM_FILES to $COVERED_FILES in:"
  echo "   scripts/check-coverage-count.sh"
  echo ""
else
  echo "✅ Coverage count matches baseline ($COVERED_FILES files)"
  echo ""
fi

exit 0
