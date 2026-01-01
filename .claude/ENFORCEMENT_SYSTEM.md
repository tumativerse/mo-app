# Mo App - Enforcement System

## How This System Keeps You On Track

This document explains the multi-layer system that ensures all code follows our design system and best practices.

---

## Layer 1: Documentation (Read First)

### Files to Read Before ANY Work:
1. **`.claude/PRE_BUILD_CHECKLIST.md`** - Master checklist for every page/component
2. **`.claude/rules/design-system.md`** - Design system rules
3. **`.claude/rules/architecture.md`** - Code organization rules
4. **`.claude/rules/typescript.md`** - TypeScript rules
5. **`CLAUDE.md`** - Project overview

### When to Read:
- ✅ Before starting a new page
- ✅ Before creating a new component
- ✅ When you forgot the rules
- ✅ After a long break from the project

---

## Layer 2: Design System Files (Use These)

### Source of Truth Files:
```
lib/design/
├── tokens.ts          # ALL values (colors, spacing, sizes)
├── variants.ts        # ALL component styles
└── theme-config.ts    # Theme setup
```

### Rule:
**NEVER hardcode values in components. ALWAYS import from these files.**

```typescript
// ❌ WRONG
<button className="bg-orange-500 px-4 py-2 rounded-lg">Click</button>

// ✅ CORRECT
import { buttonVariants } from '@/lib/design/variants';
<button className={buttonVariants({ variant: 'primary', size: 'md' })}>Click</button>
```

---

## Layer 3: ESLint (Automated Checks)

### What it Catches:
- ❌ TypeScript `any` types
- ❌ Missing function return types
- ❌ Accessibility violations
- ❌ React anti-patterns
- ⚠️  Unused variables

### How to Use:
```bash
# Run manually
npm run lint

# Auto-fix what's possible
npm run lint -- --fix

# Check in editor (VS Code)
# Install ESLint extension - it shows errors in real-time
```

### Setup in VS Code:
```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "typescript",
    "typescriptreact"
  ]
}
```

---

## Layer 4: Pre-Commit Hook (Last Line of Defense)

### What it Does:
Runs **before every commit** and checks for:
- ❌ Hardcoded Tailwind colors (`text-red-500`)
- ❌ Hardcoded spacing (`p-4`, `m-2`)
- ❌ Inline color styles (`style={{ color: '#ff0000' }}`)
- ❌ TypeScript `any` types
- ⚠️  Accessibility issues (`<div onClick>`)
- ⚠️  Small touch targets on mobile

### Setup:
```bash
# Install husky (Git hooks manager)
npm install --save-dev husky

# Initialize husky
npx husky init

# Create pre-commit hook
echo '#!/bin/sh
bash .claude/hooks/pre-commit-design-check.sh' > .husky/pre-commit

# Make executable
chmod +x .husky/pre-commit
chmod +x .claude/hooks/pre-commit-design-check.sh
```

### What Happens:
```bash
git commit -m "feat: add workout card"

# Hook runs automatically:
🔍 Running design system checks...
Checking for hardcoded colors...
Checking for hardcoded spacing...
Checking for inline styles...
Checking for TypeScript 'any'...
Checking for accessibility issues...
Checking for mobile touch targets...

✅ Design system checks passed!
# Commit proceeds
```

If violations found:
```bash
❌ Design system violations found. Please fix before committing.

📖 See .claude/PRE_BUILD_CHECKLIST.md for guidelines
# Commit blocked!
```

---

## Layer 5: TypeScript Compiler (Type Safety)

### What it Does:
- Catches type errors at build time
- Ensures type safety across the app
- Prevents runtime type errors

### Commands:
```bash
# Type check only (no build)
npm run type-check

# Build (includes type check)
npm run build
```

### Strict Mode Enabled:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

---

## Layer 6: Manual Review (You)

### Before Every Commit, Check:
1. ✅ Read the checklist in `.claude/PRE_BUILD_CHECKLIST.md`
2. ✅ Test in light AND dark theme
3. ✅ Test at 375px width (mobile)
4. ✅ Run `npm run build` - passes
5. ✅ Run `npm run type-check` - passes
6. ✅ Run `npm run lint` - passes

### Use This Command Before Committing:
```bash
# Run all checks
npm run build && npm run type-check && npm run lint
```

---

## How Claude Code Uses This System

### When I Start Working:
1. ✅ I read `.claude/PRE_BUILD_CHECKLIST.md`
2. ✅ I read relevant rule files (`design-system.md`, etc.)
3. ✅ I check if variants exist in `lib/design/variants.ts`
4. ✅ I check if tokens exist in `lib/design/tokens.ts`
5. ✅ I follow the component template from checklist

### While I'm Building:
1. ✅ I only import from `lib/design/*`
2. ✅ I use TypeScript interfaces for all props
3. ✅ I use semantic HTML
4. ✅ I test responsive breakpoints
5. ✅ I ensure 44px touch targets

### Before I Finish:
1. ✅ I search my code for hardcoded values
2. ✅ I search my code for `any` types
3. ✅ I verify it works in both themes
4. ✅ I verify it works on mobile

### You Can Remind Me:
If I ever forget or get carried away, just say:
- "Follow the checklist"
- "Check the design system rules"
- "Did you read PRE_BUILD_CHECKLIST.md?"

And I'll immediately stop and review the rules.

---

## Summary: The Enforcement Layers

1. **📖 Documentation** - Read before starting (human)
2. **🎨 Design System** - Import tokens/variants (human + enforced)
3. **🔍 ESLint** - Real-time editor feedback (automated)
4. **🪝 Pre-commit Hook** - Block bad commits (automated)
5. **⚙️ TypeScript** - Type safety at build (automated)
6. **👤 Manual Review** - Final human check (human)

### The Workflow:
```
Read Checklist → Build Component → ESLint Validates →
→ Manual Test → Git Commit → Hook Validates →
→ TypeScript Compiles → Push to Prod ✅
```

---

## Quick Reference Card

### Before Writing Code:
```bash
# 1. Read the checklist
cat .claude/PRE_BUILD_CHECKLIST.md

# 2. Check if variant exists
cat lib/design/variants.ts | grep "buttonVariants"

# 3. Check if token exists
cat lib/design/tokens.ts | grep "spacing"
```

### While Writing Code:
```typescript
// Always import these
import { tokens } from '@/lib/design/tokens';
import { buttonVariants } from '@/lib/design/variants';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
```

### Before Committing:
```bash
# Run all checks
npm run build && npm run type-check && npm run lint

# If all pass, commit
git add .
git commit -m "feat: add new component"
# Hook runs automatically ✅
```

### If Hook Blocks You:
```bash
# See what's wrong
git diff --cached

# Fix the issues
# Then try again
git commit -m "feat: add new component"
```

---

## This System Guarantees:

✅ No hardcoded colors
✅ No hardcoded spacing
✅ No TypeScript `any`
✅ Consistent component styling
✅ Mobile-friendly (44px touch targets)
✅ Theme works everywhere
✅ Accessible components
✅ Clean, maintainable code

**Result:** Fast, consistent development with no technical debt.
