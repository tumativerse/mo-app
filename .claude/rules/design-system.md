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
- [ ] **Flexbox Alignment**: All flex containers have items-*, justify-*, or gap-* properties
- [ ] **Grid Layouts**: Use CSS Grid for complex 2D layouts, Flexbox for 1D
- [ ] **Container Centering**: max-w-* containers use mx-auto for centering
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
- [ ] **Spacing Consistency**: Use gap-* for flex/grid spacing instead of margins
- [ ] **Viewport Units**: Avoid vh on mobile (virtual keyboard issues), use dvh or min-h-screen
- [ ] **Sticky Elements**: Test behavior during scroll on all devices
- [ ] **Content Width**: Main content containers max at 1280px-1440px for readability

### Responsive Standardization Pattern:

**ALWAYS prefer consistent alignment with responsive sizing:**

```tsx
// ✅ CORRECT: Same alignment strategy, different sizes
<div className="flex justify-center gap-2 sm:gap-4">
  <Circle className="h-6 w-6 sm:h-10 sm:w-10" />
</div>

// ❌ WRONG: Different alignment strategies per breakpoint
<div className="flex justify-between sm:justify-center">
  {/* Mobile spreads, desktop centers - inconsistent UX */}
</div>
```

**Why?**
- Consistent visual center point across all devices
- Predictable user experience
- Easier to maintain (one alignment rule)
- Only size/spacing changes, not positioning logic

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
