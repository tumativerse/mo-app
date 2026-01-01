#!/bin/bash

# Full Codebase Scanner
# Runs design system checks on ALL files, not just staged ones
# Use this for comprehensive quality checks before pushing to production

echo "🔍 Running FULL codebase design system scan..."
echo "   This may take a moment - scanning all app/ and components/ files"
echo ""

# Get ALL .tsx and .ts files from app/ and components/
ALL_FILES=$(find app components -type f \( -name "*.tsx" -o -name "*.ts" \) 2>/dev/null)

if [ -z "$ALL_FILES" ]; then
  echo "⚠️  No TypeScript/React files found in app/ or components/"
  exit 0
fi

FILE_COUNT=$(echo "$ALL_FILES" | wc -l | tr -d ' ')
echo "📁 Scanning $FILE_COUNT files..."
echo ""

ERRORS=0

# Check for hardcoded Tailwind colors
echo "Checking for hardcoded colors..."
HARDCODED_COLORS=$(echo "$ALL_FILES" | xargs grep -n "className=.*text-\(red\|blue\|green\|yellow\|orange\|purple\|pink\|gray\|zinc\|slate\)-[0-9]" 2>/dev/null || true)

if [ -n "$HARDCODED_COLORS" ]; then
  echo "❌ Found hardcoded Tailwind colors:"
  echo "$HARDCODED_COLORS" | head -20
  if [ $(echo "$HARDCODED_COLORS" | wc -l) -gt 20 ]; then
    echo "   ... and $(( $(echo "$HARDCODED_COLORS" | wc -l) - 20 )) more"
  fi
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# Check for hardcoded spacing in app/ files only
# Exclude: absolute positioning (right-, left-, top-, bottom-), input padding (pr-10, pr-12, pl-10, pl-12)
# Components/ui may have fixed spacing for consistency
echo "Checking for hardcoded spacing (app/ files only)..."
APP_FILES=$(echo "$ALL_FILES" | grep "^app/")
if [ -n "$APP_FILES" ]; then
  HARDCODED_SPACING=$(echo "$APP_FILES" | xargs grep -n "className=.*\(p\|m\|pt\|pb\|pl\|pr\|mt\|mb\|ml\|mr\|gap\)-[0-9]" 2>/dev/null | grep -v "sm:\|md:\|lg:\|xl:" | grep -v "right-\|left-\|top-\|bottom-" | grep -v "pr-10\|pr-12\|pl-10\|pl-12" || true)

  if [ -n "$HARDCODED_SPACING" ]; then
    echo "❌ Found hardcoded spacing without responsive modifiers in app/ files:"
    echo "$HARDCODED_SPACING" | head -20
    if [ $(echo "$HARDCODED_SPACING" | wc -l) -gt 20 ]; then
      echo "   ... and $(( $(echo "$HARDCODED_SPACING" | wc -l) - 20 )) more"
    fi
    echo ""
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check for small gaps without responsive modifiers in app/ files only
# Components in components/ui may have fixed gaps for consistency
echo "Checking for small gaps without responsive sizing (app/ files only)..."
APP_FILES=$(echo "$ALL_FILES" | grep "^app/")
if [ -n "$APP_FILES" ]; then
  SMALL_GAP=$(echo "$APP_FILES" | xargs grep -n "gap-[12][^0-9]" 2>/dev/null | grep -v "sm:gap-\|md:gap-\|lg:gap-" | grep -v "gap-1.5" || true)

  if [ -n "$SMALL_GAP" ]; then
    echo "❌ Found small gaps without responsive modifiers in app/ files:"
    echo "$SMALL_GAP" | head -20
    if [ $(echo "$SMALL_GAP" | wc -l) -gt 20 ]; then
      echo "   ... and $(( $(echo "$SMALL_GAP" | wc -l) - 20 )) more"
    fi
    echo ""
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check for 'any' type
echo "Checking for TypeScript 'any'..."
ANY_TYPES=$(echo "$ALL_FILES" | xargs grep -n -E '(: any|<any>|<any,|, any>)' 2>/dev/null | grep -v "// @ts-ignore" || true)

if [ -n "$ANY_TYPES" ]; then
  echo "❌ Found 'any' types:"
  echo "$ANY_TYPES" | head -20
  if [ $(echo "$ANY_TYPES" | wc -l) -gt 20 ]; then
    echo "   ... and $(( $(echo "$ANY_TYPES" | wc -l) - 20 )) more"
  fi
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# Check for hover-only interactions (mobile accessibility)
echo "Checking for hover-only styles..."
HOVER_ONLY=$(echo "$ALL_FILES" | xargs grep -n 'hover:' 2>/dev/null | grep -v 'active:\|focus:' || true)

if [ -n "$HOVER_ONLY" ]; then
  echo "❌ Found hover-only styles without active/focus states:"
  echo "$HOVER_ONLY" | head -20
  if [ $(echo "$HOVER_ONLY" | wc -l) -gt 20 ]; then
    echo "   ... and $(( $(echo "$HOVER_ONLY" | wc -l) - 20 )) more"
  fi
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# Check for flexbox without proper alignment
echo "Checking for flex containers without alignment..."
FLEX_NO_ALIGN=$(echo "$ALL_FILES" | xargs grep -n "className=.*flex[\" ]" 2>/dev/null | grep -v "items-\|justify-\|gap-\|flex-shrink\|flex-grow\|flex-1\|flex-auto\|flex-none" || true)

if [ -n "$FLEX_NO_ALIGN" ]; then
  echo "❌ Found flex containers without alignment properties:"
  echo "$FLEX_NO_ALIGN" | head -20
  if [ $(echo "$FLEX_NO_ALIGN" | wc -l) -gt 20 ]; then
    echo "   ... and $(( $(echo "$FLEX_NO_ALIGN" | wc -l) - 20 )) more"
  fi
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# Check for inline margins on icon components
echo "Checking for inline icon margins..."
ICON_INLINE_MARGIN=$(echo "$ALL_FILES" | xargs grep -n -E '<(ChevronRight|ChevronLeft|ChevronDown|ChevronUp|Check|X|Plus|Minus|[A-Z][a-zA-Z]+)\s.*className="[^"]*\b(ml-|mr-)[0-9]' 2>/dev/null || true)

if [ -n "$ICON_INLINE_MARGIN" ]; then
  echo "❌ Found inline margins on icon components:"
  echo "$ICON_INLINE_MARGIN" | head -20
  if [ $(echo "$ICON_INLINE_MARGIN" | wc -l) -gt 20 ]; then
    echo "   ... and $(( $(echo "$ICON_INLINE_MARGIN" | wc -l) - 20 )) more"
  fi
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# Check for non-responsive icon sizes in app/ files only
# Components/ui may have fixed icon sizes for consistency
echo "Checking for non-responsive icon sizes (app/ files only)..."
if [ -n "$APP_FILES" ]; then
  ICON_NO_RESPONSIVE=$(echo "$APP_FILES" | xargs grep -n -E 'className="[^"]*\b(h-[456]\s+w-[456]|w-[456]\s+h-[456])\b' 2>/dev/null | grep -v "sm:h-\|md:h-\|lg:h-" || true)

  if [ -n "$ICON_NO_RESPONSIVE" ]; then
    echo "❌ Found icon sizes without responsive modifiers in app/ files:"
    echo "$ICON_NO_RESPONSIVE" | head -20
    if [ $(echo "$ICON_NO_RESPONSIVE" | wc -l) -gt 20 ]; then
      echo "   ... and $(( $(echo "$ICON_NO_RESPONSIVE" | wc -l) - 20 )) more"
    fi
    echo ""
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check for inconsistent max-width values in layout files
echo "Checking for container width consistency..."
for file in $(echo "$ALL_FILES" | grep -E "(layout\.tsx|page\.tsx)"); do
  MAX_WIDTHS=$(grep -o "max-w-[a-z0-9]*" "$file" 2>/dev/null | sort -u || true)
  if [ -n "$MAX_WIDTHS" ]; then
    WIDTH_COUNT=$(echo "$MAX_WIDTHS" | grep -c "max-w-" || echo "0")
    if [ "$WIDTH_COUNT" -gt 1 ]; then
      echo "❌ Found multiple max-width values in $file:"
      echo "$MAX_WIDTHS" | sed 's/^/    /'
      echo ""
      ERRORS=$((ERRORS + 1))
    fi
  fi
done

# Check justify alignment changes
echo "Checking for responsive strategy consistency..."
JUSTIFY_CHANGES=$(echo "$ALL_FILES" | xargs grep -n "justify-\(between\|start\|end\|around\|evenly\).*sm:justify-\|justify-\(between\|start\|end\|around\|evenly\).*md:justify-\|justify-\(between\|start\|end\|around\|evenly\).*lg:justify-" 2>/dev/null || true)

if [ -n "$JUSTIFY_CHANGES" ]; then
  echo "❌ Found different justify strategies per breakpoint:"
  echo "$JUSTIFY_CHANGES" | head -20
  if [ $(echo "$JUSTIFY_CHANGES" | wc -l) -gt 20 ]; then
    echo "   ... and $(( $(echo "$JUSTIFY_CHANGES" | wc -l) - 20 )) more"
  fi
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# Check items alignment changes
ITEMS_CHANGES=$(echo "$ALL_FILES" | xargs grep -n "items-start.*sm:items-\|items-end.*sm:items-\|items-start.*md:items-\|items-end.*md:items-" 2>/dev/null || true)

if [ -n "$ITEMS_CHANGES" ]; then
  echo "❌ Found different items alignment per breakpoint:"
  echo "$ITEMS_CHANGES" | head -20
  if [ $(echo "$ITEMS_CHANGES" | wc -l) -gt 20 ]; then
    echo "   ... and $(( $(echo "$ITEMS_CHANGES" | wc -l) - 20 )) more"
  fi
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# Check for sizes decreasing on larger screens
SIZE_DIRECTION=$(echo "$ALL_FILES" | xargs grep -n "h-\(8\|10\|12\|16\).*sm:h-\(4\|6\)\|w-\(8\|10\|12\|16\).*sm:w-\(4\|6\)\|text-\(base\|lg\|xl\).*sm:text-\(xs\|sm\)" 2>/dev/null || true)

if [ -n "$SIZE_DIRECTION" ]; then
  echo "❌ Found sizes getting smaller on larger screens:"
  echo "$SIZE_DIRECTION" | head -20
  if [ $(echo "$SIZE_DIRECTION" | wc -l) -gt 20 ]; then
    echo "   ... and $(( $(echo "$SIZE_DIRECTION" | wc -l) - 20 )) more"
  fi
  echo ""
  ERRORS=$((ERRORS + 1))
fi

# Check for spacing decreasing on larger screens
SPACING_DIRECTION=$(echo "$ALL_FILES" | xargs grep -n "gap-\(4\|6\|8\).*sm:gap-\(1\|2\)\|p-\(4\|6\|8\).*sm:p-\(1\|2\)\|m-\(4\|6\|8\).*sm:m-\(1\|2\)" 2>/dev/null || true)

if [ -n "$SPACING_DIRECTION" ]; then
  echo "❌ Found spacing decreasing on larger screens:"
  echo "$SPACING_DIRECTION" | head -20
  if [ $(echo "$SPACING_DIRECTION" | wc -l) -gt 20 ]; then
    echo "   ... and $(( $(echo "$SPACING_DIRECTION" | wc -l) - 20 )) more"
  fi
  echo ""
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ $ERRORS -gt 0 ]; then
  echo "❌ SCAN FAILED: Found $ERRORS category(s) with violations"
  echo ""
  echo "📖 See .claude/rules/design-system.md for guidelines"
  echo ""
  echo "💡 Run this script again after fixing violations"
  exit 1
else
  echo "✅ SCAN PASSED: All $FILE_COUNT files comply with design system!"
  echo ""
  echo "🎉 Codebase is ready for production"
  exit 0
fi
