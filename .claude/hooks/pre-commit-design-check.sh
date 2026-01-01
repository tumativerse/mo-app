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

# Check for 'any' type (both : any and <any>)
echo "Checking for TypeScript 'any'..."
ANY_TYPES=$(echo "$STAGED_FILES" | xargs grep -n -E '(: any|<any>|<any,|, any>)' | grep -v "// @ts-ignore" || true)

if [ -n "$ANY_TYPES" ]; then
  echo "❌ Found 'any' types:"
  echo "$ANY_TYPES"
  echo ""
  echo "Fix: Add proper TypeScript types"
  ERRORS=$((ERRORS + 1))
fi

# Run TypeScript compiler to catch implicit any and other type errors
echo "Running TypeScript type check..."
if command -v npm &> /dev/null; then
  if npm run type-check --silent 2>&1 | grep -q "error TS"; then
    echo "❌ TypeScript compilation errors found:"
    npm run type-check 2>&1 | grep "error TS" | head -20
    echo ""
    echo "Fix: Run 'npm run type-check' to see all errors"
    ERRORS=$((ERRORS + 1))
  fi
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

# Check for browser compatibility issues
echo "Checking for browser compatibility..."

# Check for webkit-specific styles without fallbacks
WEBKIT_ONLY=$(echo "$STAGED_FILES" | xargs grep -n '\-webkit-' | grep -v 'appearance' || true)
if [ -n "$WEBKIT_ONLY" ]; then
  echo "⚠️  Found webkit-specific CSS (may need cross-browser fallbacks):"
  echo "$WEBKIT_ONLY"
  echo ""
  echo "Reminder: Consider adding fallbacks for Firefox, Safari, Chrome, Edge"
  # Don't increment ERRORS - this is a warning
fi

# Check for img tags without alt (accessibility + SEO)
IMG_NO_ALT=$(echo "$STAGED_FILES" | xargs grep -n '<img' | grep -v 'alt=' || true)
if [ -n "$IMG_NO_ALT" ]; then
  echo "⚠️  Found img tags without alt attribute:"
  echo "$IMG_NO_ALT"
  echo ""
  echo "Fix: Add alt text for accessibility and SEO"
  # Don't increment ERRORS - this is a warning
fi

# Check for fixed widths without responsive breakpoints
FIXED_WIDTH=$(echo "$STAGED_FILES" | xargs grep -n "w-\[.*px\]" | grep -v "sm:\|md:\|lg:" || true)
if [ -n "$FIXED_WIDTH" ]; then
  echo "⚠️  Found fixed pixel widths without responsive breakpoints:"
  echo "$FIXED_WIDTH"
  echo ""
  echo "Reminder: Use responsive breakpoints (sm:, md:, lg:) or relative units"
  # Don't increment ERRORS - this is a warning
fi

# Check for text size below 16px on inputs (causes iOS zoom)
SMALL_INPUT_TEXT=$(echo "$STAGED_FILES" | xargs grep -n '<Input' | grep -E 'text-(xs|sm)' || true)
if [ -n "$SMALL_INPUT_TEXT" ]; then
  echo "❌ Found input fields with text smaller than 16px:"
  echo "$SMALL_INPUT_TEXT"
  echo ""
  echo "Fix: Use text-base (16px) or larger on inputs to prevent iOS zoom"
  ERRORS=$((ERRORS + 1))
fi

# Check for hover-only interactions (mobile accessibility)
HOVER_ONLY=$(echo "$STAGED_FILES" | xargs grep -n 'hover:' | grep -v 'active:\|focus:' || true)
if [ -n "$HOVER_ONLY" ]; then
  echo "⚠️  Found hover-only styles (may not work on touch devices):"
  echo "$HOVER_ONLY"
  echo ""
  echo "Reminder: Add active: and focus: states for mobile/keyboard users"
  # Don't increment ERRORS - this is a warning
fi

# Check for layout and positioning issues
echo "Checking for layout and positioning..."

# Check for fixed/absolute positioning without proper context
FIXED_POS=$(echo "$STAGED_FILES" | xargs grep -n "position.*fixed\|position.*absolute" || true)
if [ -n "$FIXED_POS" ]; then
  echo "⚠️  Found fixed/absolute positioning (verify mobile behavior):"
  echo "$FIXED_POS"
  echo ""
  echo "Reminder: Test on mobile - may cause layout issues with virtual keyboards"
  # Don't increment ERRORS - this is a warning
fi

# Check for overflow-hidden that might hide content
OVERFLOW_HIDDEN=$(echo "$STAGED_FILES" | xargs grep -n "overflow-hidden" | grep -v "overflow-x-hidden\|overflow-y-hidden" || true)
if [ -n "$OVERFLOW_HIDDEN" ]; then
  echo "⚠️  Found overflow-hidden (verify content isn't being cut off):"
  echo "$OVERFLOW_HIDDEN"
  echo ""
  echo "Reminder: Ensure all content is accessible, especially on mobile"
  # Don't increment ERRORS - this is a warning
fi

# Check for hardcoded z-index values
ZINDEX=$(echo "$STAGED_FILES" | xargs grep -n "z-\[.*\]" || true)
if [ -n "$ZINDEX" ]; then
  echo "⚠️  Found hardcoded z-index values:"
  echo "$ZINDEX"
  echo ""
  echo "Reminder: Use consistent z-index scale (modals: 50, dropdowns: 40, tooltips: 30, etc.)"
  # Don't increment ERRORS - this is a warning
fi

# Check for flexbox without proper alignment
FLEX_NO_ALIGN=$(echo "$STAGED_FILES" | xargs grep -n "className=.*flex" | grep -v "items-\|justify-\|gap-" || true)
if [ -n "$FLEX_NO_ALIGN" ]; then
  echo "⚠️  Found flex without alignment properties:"
  echo "$FLEX_NO_ALIGN"
  echo ""
  echo "Reminder: Add items-*, justify-*, or gap-* for proper alignment"
  # Don't increment ERRORS - this is a warning
fi

# Check for max-width containers without centering
MAX_WIDTH_NO_CENTER=$(echo "$STAGED_FILES" | xargs grep -n "max-w-" | grep -v "mx-auto" || true)
if [ -n "$MAX_WIDTH_NO_CENTER" ]; then
  echo "⚠️  Found max-width without horizontal centering:"
  echo "$MAX_WIDTH_NO_CENTER"
  echo ""
  echo "Reminder: Add mx-auto to center max-width containers"
  # Don't increment ERRORS - this is a warning
fi

# Check for horizontal scroll issues
OVERFLOW_X=$(echo "$STAGED_FILES" | xargs grep -n "overflow-x-scroll\|overflow-x-auto" || true)
if [ -n "$OVERFLOW_X" ]; then
  echo "⚠️  Found horizontal scroll (verify it's intentional):"
  echo "$OVERFLOW_X"
  echo ""
  echo "Reminder: Horizontal scroll should be intentional (carousels, tables)"
  # Don't increment ERRORS - this is a warning
fi

# Check for safe area insets on iOS
NO_SAFE_AREA=$(echo "$STAGED_FILES" | xargs grep -n "fixed.*top-0\|fixed.*bottom-0" | grep -v "safe-" || true)
if [ -n "$NO_SAFE_AREA" ]; then
  echo "⚠️  Found fixed positioning at top/bottom without safe area handling:"
  echo "$NO_SAFE_AREA"
  echo ""
  echo "Reminder: Consider safe-top, safe-bottom, or padding for notched devices"
  # Don't increment ERRORS - this is a warning
fi

# Check for inconsistent max-width values in layout files
echo "Checking for container width consistency..."
for file in $STAGED_FILES; do
  if [[ $file == *"layout.tsx"* ]] || [[ $file == *"page.tsx"* ]]; then
    MAX_WIDTHS=$(grep -o "max-w-[a-z0-9]*" "$file" 2>/dev/null | sort -u)
    WIDTH_COUNT=$(echo "$MAX_WIDTHS" | grep -c "max-w-" || true)

    if [ "$WIDTH_COUNT" -gt 1 ]; then
      echo "⚠️  Found multiple max-width values in $file:"
      echo "$MAX_WIDTHS" | sed 's/^/    /'
      echo ""
      echo "Reminder: Consider using consistent max-width for aligned layouts"
      echo "          (Different widths may cause misalignment on desktop)"
      # Don't increment ERRORS - this is a warning
    fi
  fi
done

echo ""
if [ $ERRORS -gt 0 ]; then
  echo "❌ Design system violations found. Please fix before committing."
  echo ""
  echo "📖 See .claude/rules/design-system.md for guidelines"
  exit 1
else
  echo "✅ Design system checks passed!"
  exit 0
fi
