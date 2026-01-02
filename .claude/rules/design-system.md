# Design System Rules

## CRITICAL: Read Before ANY UI Work

### 🚫 NEVER DO THESE:

1. ❌ Hardcode colors: `className="text-red-500"`
2. ❌ Hardcode spacing: `className="p-4"`
3. ❌ Hardcode sizes: `className="w-[127px]"`
4. ❌ Inline styles: `style={{ color: '#ff0000' }}`
5. ❌ Random values not in tokens
6. ❌ Duplicate component variants

### ✅ ALWAYS DO THESE:

1. ✅ Import from `lib/design/tokens.ts` for values
2. ✅ Use variants from `lib/design/variants.ts`
3. ✅ Use CSS variables for theme colors
4. ✅ Mobile-first: 44px minimum touch targets
5. ✅ 16px base font size (prevents iOS zoom)
6. ✅ Semantic HTML (button not div with onClick)

### Required Imports

```typescript
import { tokens } from '@/lib/design/tokens';
import { buttonVariants, cardVariants } from '@/lib/design/variants';
import { cn } from '@/lib/utils';
```

### Component Pattern

```tsx
// ✅ CORRECT
<Button variant="primary" size="lg">Start</Button>

// ❌ WRONG
<button className="bg-orange-500 px-4 py-2 rounded">Start</button>
```

### Before You Write ANY Component:

1. Check if variant exists in `lib/design/variants.ts`
2. If not, CREATE the variant first
3. Then use the variant in the component
4. NEVER hardcode values in the component itself

### Mobile Checklist (Every Component):

- [ ] Touch targets ≥ 44px height
- [ ] Text inputs use text-base (16px+)
- [ ] Responsive spacing (sm: md: lg:)
- [ ] Works on 375px width (iPhone SE)
- [ ] No horizontal scroll

### Browser & Device Compatibility Checklist:

- [ ] **Cross-Browser Testing**: Works on Chrome, Safari, Firefox, Edge
- [ ] **Responsive Design**: Mobile (375px), Tablet (768px), Desktop (1024px+)
- [ ] **Touch & Mouse**: Hover states have active/focus alternatives for touch devices
- [ ] **Images**: All `<img>` tags have alt text for accessibility and SEO
- [ ] **Fixed Widths**: Use responsive breakpoints (sm:, md:, lg:) or relative units
- [ ] **Input Zoom Prevention**: All inputs use text-base (16px) or larger to prevent iOS zoom
- [ ] **Browser Prefixes**: CSS autoprefixer handles vendor prefixes automatically
- [ ] **Performance**: Images use Next.js Image component with lazy loading
- [ ] **Viewport**: Meta viewport tag present in layout: `width=device-width, initial-scale=1`
- [ ] **Orientation**: Works in both portrait and landscape on mobile/tablet

### Device-Specific Optimizations:

- **iOS**:
  - [ ] No text-sm or smaller on inputs (prevents zoom)
  - [ ] Touch targets minimum 44px height
  - [ ] Safe area insets for notched devices
- **Android**:
  - [ ] Works on Chrome Mobile and Samsung Internet
  - [ ] Handles different screen densities (1x, 2x, 3x)
- **Desktop**:
  - [ ] Keyboard navigation works (Tab, Enter, Space, Arrows)
  - [ ] Hover states visible but not required for interaction
  - [ ] Focus indicators always visible

### Layout & Positioning Checklist:

- [ ] **Flexbox Alignment**: All flex containers have items-_, justify-_, or gap-\* properties
- [ ] **Grid Layouts**: Use CSS Grid for complex 2D layouts, Flexbox for 1D
- [ ] **Container Centering**: max-w-\* containers use mx-auto for centering
- [ ] **Container Width Consistency**: Use same max-width across header, content, footer for alignment
  - Example: If content is max-w-2xl, header/footer should also be max-w-2xl
  - Different widths create visible misalignment on desktop browsers
  - Exception: Hero sections or full-width backgrounds (intentional design)
- [ ] **Fixed Positioning**: Test with virtual keyboards on mobile (may shift viewport)
- [ ] **Absolute Positioning**: Only use within positioned parent (relative/absolute/fixed)
- [ ] **Z-Index Scale**: Use consistent scale (modals: 50, dropdowns: 40, tooltips: 30, sticky: 20)
- [ ] **Overflow Handling**:
  - [ ] No overflow-hidden that cuts off content
  - [ ] Horizontal scroll only for intentional cases (carousels, tables)
  - [ ] Scrollable areas have visible indicators
- [ ] **Safe Areas**: Fixed headers/footers account for notches and home indicators
- [ ] **Spacing Consistency**: Use gap-\* for flex/grid spacing instead of margins
- [ ] **Viewport Units**: Avoid vh on mobile (virtual keyboard issues), use dvh or min-h-screen
- [ ] **Sticky Elements**: Test behavior during scroll on all devices
- [ ] **Content Width**: Main content containers max at 1280px-1440px for readability

### Responsive Standardization Pattern:

**CORE PRINCIPLE: Same Strategy + Responsive Sizing = Consistent UX**

ALWAYS use the same strategy across all breakpoints. Only change:

- ✅ Sizes (h-6 sm:h-10, w-6 sm:w-10)
- ✅ Spacing (gap-2 sm:gap-4, p-2 sm:p-4)
- ✅ Margins/Padding values (mx-2 sm:mx-4)

NEVER change:

- ❌ Alignment strategy (justify-between sm:justify-center)
- ❌ Display type (block sm:flex, grid sm:flex)
- ❌ Positioning type (relative sm:absolute)
- ❌ Text alignment (text-left sm:text-center)
- ❌ Flex direction behavior (different approaches per breakpoint)

### Examples by Category:

**Flexbox Alignment:**

```tsx
// ✅ CORRECT: Same justify, different spacing
<div className="flex justify-center gap-2 sm:gap-4">
  <Item />
</div>

// ❌ WRONG: Different justify per breakpoint
<div className="flex justify-between sm:justify-center">
  <Item />
</div>
```

**Items Alignment:**

```tsx
// ✅ CORRECT: Same alignment, different sizes
<div className="flex items-center gap-2 sm:gap-4">
  <Icon className="h-4 sm:h-6" />
</div>

// ❌ WRONG: Different items alignment
<div className="flex items-start sm:items-center">
  <Icon />
</div>
```

**Display Type:**

```tsx
// ✅ CORRECT: Always flex, change direction
<div className="flex flex-col sm:flex-row gap-4">
  <Item />
</div>

// ❌ WRONG: Different display types
<div className="block sm:flex">
  <Item />
</div>
```

**Text Alignment:**

```tsx
// ✅ CORRECT: Same alignment always
<p className="text-center text-sm sm:text-base">
  Text
</p>

// ❌ WRONG: Different text alignment
<p className="text-left sm:text-center">
  Text
</p>
```

**Positioning:**

```tsx
// ✅ CORRECT: Same position type, different offsets
<div className="absolute top-2 sm:top-4 right-2 sm:right-4">
  <Badge />
</div>

// ❌ WRONG: Different positioning types
<div className="relative sm:absolute">
  <Badge />
</div>
```

**Why This Matters:**

- Consistent visual center point across all devices
- Predictable user experience - no surprises
- Easier to maintain (one strategy rule, not multiple)
- Prevents layout bugs from breakpoint transitions
- Simpler mental model for the team

### Responsive Direction Rules:

**Sizes and spacing should ALWAYS increase (or stay same) on larger screens:**

```tsx
// ✅ CORRECT: Sizes increase with viewport
<div className="h-6 sm:h-10 w-6 sm:w-10">  // 24px → 40px
<p className="text-sm sm:text-base">         // 14px → 16px
<div className="gap-2 sm:gap-4">            // 8px → 16px

// ❌ WRONG: Sizes decrease on larger screens
<div className="h-10 sm:h-6">              // 40px → 24px (backwards!)
<p className="text-base sm:text-sm">       // 16px → 14px (backwards!)
<div className="gap-4 sm:gap-2">           // 16px → 8px (backwards!)
```

**Why?** Larger screens have more space - use it! Smaller values on desktop look cramped.

### Breakpoint Standardization:

**Use `sm:` (640px) as primary mobile/desktop breakpoint:**

```tsx
// ✅ CORRECT: sm: for mobile/desktop split
<div className="h-6 sm:h-10">             // Mobile (0-639px) vs Desktop (640px+)
<div className="grid grid-cols-1 sm:grid-cols-2">  // 1 col mobile, 2 cols desktop

// ✅ ALSO CORRECT: Add md:/lg: for additional refinement
<div className="h-6 sm:h-10 md:h-12 lg:h-14">  // Progressive enhancement

// ⚠️  AVOID: Skipping sm: and using only md:/lg:
<div className="h-6 md:h-10">             // What about sm: (640-768px)?
```

**Breakpoint Guidelines:**

- `sm:` (640px) - **Primary split** - Mobile vs Desktop
- `md:` (768px) - Tablet landscape, small desktop refinements
- `lg:` (1024px) - Desktop refinements, multi-column layouts
- `xl:` (1280px) - Large desktop, max-width containers

### Grid Responsive Patterns:

**Standard grid patterns for responsive layouts:**

```tsx
// ✅ Single column mobile, multi-column desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>

// ✅ Auto-fit with minimum card width
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
  <Card />
</div>

// ✅ Responsive gap sizing
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
  <Item />
</div>
```

### Hidden/Block Patterns - When It's OK:

**Acceptable use cases for hiding/showing elements:**

```tsx
// ✅ OK: Mobile-specific navigation (hamburger menu)
<button className="block sm:hidden">Menu</button>
<nav className="hidden sm:block">Desktop Nav</nav>

// ✅ OK: Responsive text variants (shorter on mobile)
<p className="block sm:hidden">Short text for mobile</p>
<p className="hidden sm:block">Longer descriptive text for desktop</p>

// ✅ OK: Different layouts for different contexts
<div className="hidden sm:block">Sidebar on desktop</div>
<div className="block sm:hidden">Mobile drawer</div>

// ⚠️  AVOID: Hiding important content on mobile
<button className="hidden sm:block">Primary CTA</button>  // Users can't click on mobile!

// ⚠️  AVOID: Duplicating content (bad for SEO, accessibility)
<div className="block sm:hidden">Same content</div>
<div className="hidden sm:block">Same content</div>  // Just resize instead!
```

**When to hide vs resize:**

- Hide: Different UI patterns (hamburger vs nav bar, drawer vs sidebar)
- Resize: Same content, different sizes (images, text, buttons)

### Aspect Ratio Consistency:

```tsx
// ✅ CORRECT: Consistent aspect ratio, different sizes
<div className="aspect-square w-20 sm:w-32">
  <Image />
</div>

// ⚠️  CAUTION: Changing aspect ratios causes layout shifts
<div className="aspect-square sm:aspect-video">  // Shape fundamentally changes
  <Image />  // May cause cumulative layout shift (CLS)
</div>

// ✅ BETTER: Use same aspect ratio, change object-fit
<div className="aspect-video">
  <Image className="object-cover sm:object-contain" />
</div>
```

### Mobile Width Calculation:

**Ensure elements fit in 375px (iPhone SE) viewport:**

```tsx
// Formula: (elements × size) + (gaps × spacing) + (margins × 2) ≤ 375px - 32px (padding)

// ✅ CORRECT: Fits in mobile viewport
// 5 circles (5×24px=120px) + 4 gaps (4×8px=32px) + padding (32px) = 184px ✓
<div className="flex gap-2">
  <Circle className="h-6 w-6" />  {/* ×5 */}
</div>

// ❌ WRONG: Overflows mobile viewport
// 5 circles (5×40px=200px) + 4 gaps (4×16px=64px) + padding (32px) = 296px ✗ (needs 343px total)
<div className="flex gap-4">
  <Circle className="h-10 w-10" />  {/* ×5 */}
</div>
```

**Quick calculation guide:**

- Available width: 375px - 32px padding = **343px**
- Always test on real mobile device or Chrome DevTools (375×667)

### Component Positioning Patterns:

```tsx
// ✅ CORRECT: Centered container
<div className="mx-auto max-w-4xl px-4">
  <Content />
</div>

// ✅ CORRECT: Flex with alignment (consistent across breakpoints)
<div className="flex items-center justify-center gap-2 sm:gap-4">
  <Item className="h-6 sm:h-10" />
</div>

// ✅ CORRECT: Fixed with safe area
<header className="fixed top-0 inset-x-0 pt-safe bg-background">
  <Nav />
</header>

// ❌ WRONG: Max width without centering
<div className="max-w-4xl"> {/* Will stick to left */}

// ❌ WRONG: Flex without alignment
<div className="flex"> {/* Items may not align as expected */}

// ❌ WRONG: Different alignment per breakpoint
<div className="justify-between sm:justify-center"> {/* Inconsistent */}

// ❌ WRONG: Fixed without safe area
<header className="fixed top-0"> {/* May be hidden by notch */}
```

### Theme Checklist:

- [ ] Uses CSS variables (hsl(var(--primary)))
- [ ] Works in both light AND dark mode
- [ ] No hardcoded colors that break in one theme
- [ ] Test with theme toggle before committing
