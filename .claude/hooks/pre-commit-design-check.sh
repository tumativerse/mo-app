#!/bin/bash

# Design System Enforcement Hook
# Checks for hardcoded values before allowing commit

echo "🔍 Running design system checks..."

# Get staged .tsx and .ts files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(tsx|ts)$')

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No TypeScript/React files to check"
  exit 0
fi

ERRORS=0

# Check for hardcoded Tailwind colors
echo "Checking for hardcoded colors..."
HARDCODED_COLORS=$(echo "$STAGED_FILES" | xargs grep -n "className=.*text-\(red\|blue\|green\|yellow\|orange\|purple\|pink\|gray\|zinc\|slate\)-[0-9]" || true)

if [ -n "$HARDCODED_COLORS" ]; then
  echo "❌ Found hardcoded Tailwind colors:"
  echo "$HARDCODED_COLORS"
  echo ""
  echo "Fix: Use variants from lib/design/variants.ts or CSS variables"
  ERRORS=$((ERRORS + 1))
fi

# Check for hardcoded spacing
echo "Checking for hardcoded spacing..."
HARDCODED_SPACING=$(echo "$STAGED_FILES" | xargs grep -n "className=.*\(p\|m\|pt\|pb\|pl\|pr\|mt\|mb\|ml\|mr\)-[0-9]" | grep -v "sm:\|md:\|lg:\|xl:" || true)

if [ -n "$HARDCODED_SPACING" ]; then
  echo "⚠️  Found hardcoded spacing (may be intentional with responsive modifiers):"
  echo "$HARDCODED_SPACING"
  echo ""
  echo "Warning: Consider using tokens from lib/design/tokens.ts"
  # Don't increment ERRORS - this is a warning
fi

# Check for inline styles
echo "Checking for inline styles..."
INLINE_STYLES=$(echo "$STAGED_FILES" | xargs grep -n 'style={{.*color:' || true)

if [ -n "$INLINE_STYLES" ]; then
  echo "❌ Found inline color styles:"
  echo "$INLINE_STYLES"
  echo ""
  echo "Fix: Use CSS variables like style={{ color: 'var(--primary)' }}"
  ERRORS=$((ERRORS + 1))
fi

# Check for 'any' type
echo "Checking for TypeScript 'any'..."
ANY_TYPES=$(echo "$STAGED_FILES" | xargs grep -n ': any' | grep -v "// @ts-ignore" || true)

if [ -n "$ANY_TYPES" ]; then
  echo "❌ Found 'any' types:"
  echo "$ANY_TYPES"
  echo ""
  echo "Fix: Add proper TypeScript types"
  ERRORS=$((ERRORS + 1))
fi

# Check for div with onClick (accessibility)
echo "Checking for accessibility issues..."
DIV_ONCLICK=$(echo "$STAGED_FILES" | xargs grep -n '<div.*onClick' || true)

if [ -n "$DIV_ONCLICK" ]; then
  echo "⚠️  Found div with onClick (accessibility concern):"
  echo "$DIV_ONCLICK"
  echo ""
  echo "Consider: Use <button> instead or add role/tabIndex/onKeyDown"
  # Don't increment ERRORS - this is a warning
fi

# Check for minimum touch targets in mobile components
echo "Checking for mobile touch targets..."
SMALL_TOUCH=$(echo "$STAGED_FILES" | xargs grep -n 'h-\(1\|2\|3\|4\|5\|6\|7\|8\|9\|10\)' | grep -E '(Button|button|clickable)' || true)

if [ -n "$SMALL_TOUCH" ]; then
  echo "⚠️  Found potentially small touch targets:"
  echo "$SMALL_TOUCH"
  echo ""
  echo "Reminder: Minimum 44px (h-11) for mobile touch targets"
  # Don't increment ERRORS - this is a warning
fi

echo ""
if [ $ERRORS -gt 0 ]; then
  echo "❌ Design system violations found. Please fix before committing."
  echo ""
  echo "📖 See .claude/PRE_BUILD_CHECKLIST.md for guidelines"
  exit 1
else
  echo "✅ Design system checks passed!"
  exit 0
fi
