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

### Theme Checklist:
- [ ] Uses CSS variables (hsl(var(--primary)))
- [ ] Works in both light AND dark mode
- [ ] No hardcoded colors that break in one theme
- [ ] Test with theme toggle before committing
