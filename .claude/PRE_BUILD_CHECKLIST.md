# Pre-Build Checklist for Mo App

## 📋 BEFORE WRITING ANY CODE - READ THIS ENTIRE FILE

### Step 1: Read the Rules (MANDATORY)

- [ ] Read `.claude/rules/design-system.md`
- [ ] Read `.claude/rules/architecture.md`
- [ ] Read `.claude/rules/typescript.md`
- [ ] Read `CLAUDE.md` for project context

### Step 2: Plan the Page/Component

**Answer these questions:**

1. What is this page/component for? (write 1 sentence)
2. What data does it need? (list data requirements)
3. Is it a Server or Client Component? (default: Server)
4. What variants/tokens does it need? (check if they exist)
5. Does it work on mobile (375px width)?
6. Does it work in light AND dark theme?

### Step 3: Check Design System

**Variants Exist?**

- [ ] Check `lib/design/variants.ts` - does the variant exist?
- [ ] If NO → Create the variant FIRST
- [ ] If YES → Use existing variant

**Tokens Exist?**

- [ ] Check `lib/design/tokens.ts` - do values exist?
- [ ] If NO → Add to tokens FIRST
- [ ] If YES → Use existing tokens

### Step 4: Architecture Check

**File Structure:**

- [ ] Putting component in correct location (feature-based)?
- [ ] Creating hook in right place (colocation)?
- [ ] Types going in `lib/types/` if shared?

**Server vs Client:**

- [ ] Marked `'use client'` ONLY if needed
- [ ] Using Server Component if possible

### Step 5: Build the Component

**TypeScript:**

- [ ] All props have interface
- [ ] No `any` types
- [ ] Shared types imported from `lib/types`
- [ ] API responses typed

**Design System:**

- [ ] NO hardcoded colors
- [ ] NO hardcoded spacing
- [ ] NO hardcoded sizes
- [ ] Using variants from `lib/design/variants.ts`
- [ ] Using tokens from `lib/design/tokens.ts`
- [ ] Using CSS variables for theme colors

**Mobile:**

- [ ] Touch targets ≥ 44px
- [ ] Text inputs ≥ 16px (text-base)
- [ ] Responsive breakpoints (sm: md: lg:)
- [ ] No horizontal scroll
- [ ] Tested at 375px width

**Accessibility:**

- [ ] Semantic HTML (button not div)
- [ ] ARIA labels for icon buttons
- [ ] Keyboard navigation works
- [ ] Focus states visible

### Step 6: Test Before Committing

**Build Test:**

- [ ] `npm run build` - no errors
- [ ] `npm run type-check` - passes
- [ ] No ESLint errors

**Manual Test:**

- [ ] Works in Light theme
- [ ] Works in Dark theme
- [ ] Works on mobile (375px)
- [ ] Works on desktop (1920px)
- [ ] All interactions work
- [ ] Loading states show
- [ ] Error states show

### Step 7: Code Review (Self)

**Design System Compliance:**

- [ ] Searched for hardcoded colors (text-red-500, etc.) → NONE
- [ ] Searched for hardcoded spacing (p-4, m-2, etc.) → NONE
- [ ] Searched for inline styles → NONE (unless absolutely required)
- [ ] All values come from tokens or variants

**TypeScript Compliance:**

- [ ] Searched for `any` → NONE
- [ ] All functions have types
- [ ] All props have interfaces

**Architecture Compliance:**

- [ ] Component < 200 lines (if bigger, extracted)
- [ ] No prop drilling > 2 levels
- [ ] Hooks extracted to separate files
- [ ] Data fetching uses standard pattern

### Step 8: Git Commit

**Conventional Commit:**

```bash
feat: add workout card to dashboard
fix: correct theme toggle in settings
refactor: extract button variants
```

**Before Push:**

- [ ] All tests above passed
- [ ] Committed with conventional commit message
- [ ] Ready for production

---

## 🚨 RED FLAGS - Stop and Fix Immediately

If you see ANY of these, STOP and fix:

1. ❌ `className="text-red-500"` → Use variant
2. ❌ `className="p-4"` → Use tokens
3. ❌ `style={{ color: '#ff0000' }}` → Use CSS variable
4. ❌ `const data: any` → Add proper type
5. ❌ `<div onClick={...}>` → Use `<button>`
6. ❌ Component > 200 lines → Extract
7. ❌ Same type defined twice → Use shared type
8. ❌ Prop drilling 3+ levels → Use context

---

## 💡 Quick Reference

**Import Always:**

```typescript
import { tokens } from '@/lib/design/tokens';
import { buttonVariants, cardVariants } from '@/lib/design/variants';
import { cn } from '@/lib/utils';
import type { User, WorkoutSession } from '@/lib/types';
```

**Component Template:**

```tsx
'use client'; // Only if needed

import { useState } from 'react';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/lib/design/variants';
import { cn } from '@/lib/utils';

interface ComponentProps {
  title: string;
  variant?: 'primary' | 'secondary';
  onAction?: () => void;
}

/**
 * ComponentName - Brief description
 *
 * @param title - The title to display
 * @param variant - Visual style variant
 * @param onAction - Callback when action is triggered
 */
export function ComponentName({ title, variant = 'primary', onAction }: ComponentProps) {
  return (
    <button className={cn(buttonVariants({ variant }))} onClick={onAction}>
      {title}
    </button>
  );
}
```

---

## Remember: Quality > Speed

Better to take 30 minutes and follow all rules than rush in 5 minutes and create technical debt.
