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

# Check for hardcoded spacing in app/ files only
# Exclude: absolute positioning (right-, left-, top-, bottom-), input padding (pr-10, pr-12, pl-10, pl-12)
# Components/ui may have fixed spacing for consistency
echo "Checking for hardcoded spacing (app/ files only)..."
APP_STAGED_FILES=$(echo "$STAGED_FILES" | grep "^app/" || true)
if [ -n "$APP_STAGED_FILES" ]; then
  HARDCODED_SPACING=$(echo "$APP_STAGED_FILES" | xargs grep -n "className=.*\(p\|m\|pt\|pb\|pl\|pr\|mt\|mb\|ml\|mr\|gap\)-[0-9]" | grep -v "sm:\|md:\|lg:\|xl:" | grep -v "right-\|left-\|top-\|bottom-" | grep -v "pr-10\|pr-12\|pl-10\|pl-12" || true)

  if [ -n "$HARDCODED_SPACING" ]; then
    echo "❌ Found hardcoded spacing without responsive modifiers in app/ files:"
    echo "$HARDCODED_SPACING"
    echo ""
    echo "Fix: Use responsive spacing (e.g., pt-2 sm:pt-4, gap-2 sm:gap-4)"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check for small gaps in app/ files only
# Components in components/ui may have fixed gaps for consistency
echo "Checking for small gaps without responsive sizing (app/ files only)..."
if [ -n "$APP_STAGED_FILES" ]; then
  SMALL_GAP=$(echo "$APP_STAGED_FILES" | xargs grep -n "gap-[12][^0-9]" | grep -v "sm:gap-\|md:gap-\|lg:gap-" | grep -v "gap-1.5" || true)

  if [ -n "$SMALL_GAP" ]; then
    echo "❌ Found small gaps without responsive modifiers in app/ files:"
    echo "$SMALL_GAP"
    echo ""
    echo "Fix: Add responsive gap sizing (e.g., gap-1 sm:gap-2, gap-2 sm:gap-4)"
    ERRORS=$((ERRORS + 1))
  fi
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

# Check for fixed Tailwind widths in flex containers without responsive variants
FIXED_FLEX_WIDTH=$(echo "$STAGED_FILES" | xargs grep -n "flex.*w-[0-9]" | grep -v "sm:w-\|md:w-\|lg:w-\|flex-1\|flex-auto" || true)
if [ -n "$FIXED_FLEX_WIDTH" ]; then
  echo "⚠️  Found fixed widths in flex containers without responsive variants:"
  echo "$FIXED_FLEX_WIDTH"
  echo ""
  echo "Reminder: Fixed widths may overflow on mobile (375px). Use responsive classes:"
  echo "          - Mobile: flex-1 (stretch to fit)"
  echo "          - Desktop: sm:w-12 sm:flex-initial (fixed width)"
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
  echo "❌ Found hover-only styles without active/focus states:"
  echo "$HOVER_ONLY"
  echo ""
  echo "Fix: Add active: and focus: states for mobile/keyboard users"
  echo "     Example: hover:bg-primary/50 active:bg-primary/50 focus:bg-primary"
  ERRORS=$((ERRORS + 1))
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
# Exclude flex-shrink, flex-grow, flex-1, flex-auto as these are flex item properties, not containers
FLEX_NO_ALIGN=$(echo "$STAGED_FILES" | xargs grep -n "className=.*flex[\" ]" | grep -v "items-\|justify-\|gap-\|flex-shrink\|flex-grow\|flex-1\|flex-auto\|flex-none" || true)
if [ -n "$FLEX_NO_ALIGN" ]; then
  echo "❌ Found flex container without alignment properties:"
  echo "$FLEX_NO_ALIGN"
  echo ""
  echo "Fix: Add items-*, justify-*, or gap-* for proper alignment"
  echo "     Example: flex items-center justify-between gap-4"
  ERRORS=$((ERRORS + 1))
fi

# Check for inline margins on icon components (ml-, mr- on Lucide icons)
echo "Checking for inline icon margins..."
ICON_INLINE_MARGIN=$(echo "$STAGED_FILES" | xargs grep -n -E '<(ChevronRight|ChevronLeft|ChevronDown|ChevronUp|Check|X|Plus|Minus|[A-Z][a-zA-Z]+)\s.*className="[^"]*\b(ml-|mr-)[0-9]' || true)

if [ -n "$ICON_INLINE_MARGIN" ]; then
  echo "❌ Found inline margins on icon components:"
  echo "$ICON_INLINE_MARGIN"
  echo ""
  echo "Fix: Remove inline margins (ml-, mr-) from icons"
  echo "     Instead, wrap content in flex container with gap:"
  echo "     Example: <Button className=\"flex items-center gap-2\">"
  echo "                <span>Continue</span>"
  echo "                <ChevronRight className=\"h-5 w-5\" />"
  echo "              </Button>"
  ERRORS=$((ERRORS + 1))
fi

# Check for non-responsive icon sizes in app/ files only
# Components/ui may have fixed icon sizes for consistency
echo "Checking for non-responsive icon sizes (app/ files only)..."
if [ -n "$APP_STAGED_FILES" ]; then
  ICON_NO_RESPONSIVE=$(echo "$APP_STAGED_FILES" | xargs grep -n -E 'className="[^"]*\b(h-[456]\s+w-[456]|w-[456]\s+h-[456])\b' | grep -v "sm:h-\|md:h-\|lg:h-" || true)

  if [ -n "$ICON_NO_RESPONSIVE" ]; then
    echo "❌ Found icon sizes without responsive modifiers in app/ files:"
    echo "$ICON_NO_RESPONSIVE"
    echo ""
    echo "Fix: Make icon sizes responsive (e.g., h-4 w-4 sm:h-5 sm:w-5)"
    ERRORS=$((ERRORS + 1))
  fi
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
      echo "❌ Found multiple max-width values in $file:"
      echo "$MAX_WIDTHS" | sed 's/^/    /'
      echo ""
      echo "Fix: Use consistent max-width for aligned layouts"
      echo "     Different widths cause visible misalignment on desktop"
      echo "     Example: Use max-w-2xl throughout header, content, footer"
      ERRORS=$((ERRORS + 1))
    fi
  fi
done

# Check for inconsistent strategies across breakpoints (comprehensive)
echo "Checking for responsive strategy consistency..."

# Check justify alignment changes
JUSTIFY_CHANGES=$(echo "$STAGED_FILES" | xargs grep -n "justify-\(between\|start\|end\|around\|evenly\).*sm:justify-\|justify-\(between\|start\|end\|around\|evenly\).*md:justify-\|justify-\(between\|start\|end\|around\|evenly\).*lg:justify-" || true)
if [ -n "$JUSTIFY_CHANGES" ]; then
  echo "❌ Found different justify strategies per breakpoint:"
  echo "$JUSTIFY_CHANGES"
  echo ""
  echo "Fix: Use consistent justify (e.g., always justify-center)"
  echo "     Only change gap/spacing: justify-center gap-2 sm:gap-4"
  ERRORS=$((ERRORS + 1))
fi

# Check items alignment changes
ITEMS_CHANGES=$(echo "$STAGED_FILES" | xargs grep -n "items-start.*sm:items-\|items-end.*sm:items-\|items-start.*md:items-\|items-end.*md:items-" || true)
if [ -n "$ITEMS_CHANGES" ]; then
  echo "❌ Found different items alignment per breakpoint:"
  echo "$ITEMS_CHANGES"
  echo ""
  echo "Fix: Use consistent items alignment (e.g., always items-center)"
  ERRORS=$((ERRORS + 1))
fi

# Check display strategy changes
DISPLAY_CHANGES=$(echo "$STAGED_FILES" | xargs grep -n "block.*sm:flex\|flex.*sm:block\|grid.*sm:flex\|flex.*sm:grid\|block.*sm:grid\|grid.*sm:block" || true)
if [ -n "$DISPLAY_CHANGES" ]; then
  echo "⚠️  Found different display strategies per breakpoint:"
  echo "$DISPLAY_CHANGES"
  echo ""
  echo "Consider: Use consistent display type (e.g., always flex)"
  echo "          Change layout with flex-col sm:flex-row if needed"
fi

# Check text alignment changes
TEXT_ALIGN_CHANGES=$(echo "$STAGED_FILES" | xargs grep -n "text-left.*sm:text-\|text-right.*sm:text-\|text-left.*md:text-\|text-right.*md:text-" || true)
if [ -n "$TEXT_ALIGN_CHANGES" ]; then
  echo "⚠️  Found different text alignment per breakpoint:"
  echo "$TEXT_ALIGN_CHANGES"
  echo ""
  echo "Consider: Use consistent text alignment (e.g., always text-center)"
fi

# Check positioning strategy changes
POSITION_CHANGES=$(echo "$STAGED_FILES" | xargs grep -n "static.*sm:absolute\|relative.*sm:absolute\|absolute.*sm:relative\|static.*sm:fixed\|relative.*sm:fixed" || true)
if [ -n "$POSITION_CHANGES" ]; then
  echo "⚠️  Found different positioning strategies per breakpoint:"
  echo "$POSITION_CHANGES"
  echo ""
  echo "Warning: Changing position type across breakpoints can cause layout issues"
  echo "         Consider: Keep same position type, adjust top/left/right/bottom values"
fi

# Check flex wrap changes (often intentional, so just info)
WRAP_CHANGES=$(echo "$STAGED_FILES" | xargs grep -n "flex-wrap.*sm:flex-nowrap\|flex-nowrap.*sm:flex-wrap" || true)
if [ -n "$WRAP_CHANGES" ]; then
  echo "ℹ️  Found flex wrap strategy changes (may be intentional):"
  echo "$WRAP_CHANGES"
fi

# Check for responsive sizes going the wrong direction (smaller on larger screens)
SIZE_DIRECTION=$(echo "$STAGED_FILES" | xargs grep -n "h-\(8\|10\|12\|16\).*sm:h-\(4\|6\)\|w-\(8\|10\|12\|16\).*sm:w-\(4\|6\)\|text-\(base\|lg\|xl\).*sm:text-\(xs\|sm\)" || true)
if [ -n "$SIZE_DIRECTION" ]; then
  echo "❌ Found sizes getting smaller on larger screens:"
  echo "$SIZE_DIRECTION"
  echo ""
  echo "Fix: Sizes should increase with viewport (h-6 sm:h-10, not h-10 sm:h-6)"
  ERRORS=$((ERRORS + 1))
fi

# Check for spacing decreasing on larger screens
SPACING_DIRECTION=$(echo "$STAGED_FILES" | xargs grep -n "gap-\(4\|6\|8\).*sm:gap-\(1\|2\)\|p-\(4\|6\|8\).*sm:p-\(1\|2\)\|m-\(4\|6\|8\).*sm:m-\(1\|2\)" || true)
if [ -n "$SPACING_DIRECTION" ]; then
  echo "❌ Found spacing decreasing on larger screens:"
  echo "$SPACING_DIRECTION"
  echo ""
  echo "Fix: Spacing should increase with viewport (gap-2 sm:gap-4, not gap-4 sm:gap-2)"
  ERRORS=$((ERRORS + 1))
fi

# Check for touch targets below 44px on mobile
SMALL_MOBILE_TOUCH=$(echo "$STAGED_FILES" | xargs grep -n "h-\([1-9]\|10\)[^0-9]" | grep -E "(Button|button|clickable)" | grep -v "sm:h-" || true)
if [ -n "$SMALL_MOBILE_TOUCH" ]; then
  echo "⚠️  Found potentially small mobile touch targets without responsive sizing:"
  echo "$SMALL_MOBILE_TOUCH"
  echo ""
  echo "Reminder: Mobile touch targets should be h-11+ (44px) or use responsive: h-8 sm:h-11"
fi

# Check for inconsistent breakpoint usage (should standardize on sm: for mobile/desktop split)
MD_LG_WITHOUT_SM=$(echo "$STAGED_FILES" | xargs grep -n "md:\|lg:" | grep -v "sm:" || true)
if [ -n "$MD_LG_WITHOUT_SM" ]; then
  echo "ℹ️  Found md: or lg: breakpoints without sm: (may be intentional):"
  echo "$MD_LG_WITHOUT_SM"
  echo ""
  echo "Consider: Use sm: (640px) for mobile/desktop split, md:/lg: for additional breakpoints"
fi

# Check for aspect ratio changes (changes fundamental shape)
ASPECT_CHANGES=$(echo "$STAGED_FILES" | xargs grep -n "aspect-square.*sm:aspect-\|aspect-video.*sm:aspect-\|aspect-\[.*\].*sm:aspect-" || true)
if [ -n "$ASPECT_CHANGES" ]; then
  echo "⚠️  Found aspect ratio changes across breakpoints:"
  echo "$ASPECT_CHANGES"
  echo ""
  echo "Consider: Changing aspect ratios can cause layout shifts"
  echo "          Use consistent aspect ratio, adjust sizes instead"
fi

echo ""
echo "💡 Standardization Principle:"
echo "   Same strategy + Responsive sizing = Consistent UX"
echo "   Example: justify-center gap-2 sm:gap-4 h-6 sm:h-10"
echo "   Sizes/spacing should INCREASE on larger screens (not decrease)"
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
