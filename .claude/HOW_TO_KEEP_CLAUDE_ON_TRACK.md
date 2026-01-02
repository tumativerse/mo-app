# How to Keep Claude Code On Track

## The Problem

Claude Code (or any AI) can sometimes "get carried away" and ignore the rules when building features quickly.

## The Solution

This project has a **6-layer enforcement system** to prevent that.

---

## Quick Commands to Remind Me

If I ever deviate from the rules, just say one of these:

### 1. "Follow the checklist"

I'll immediately read `.claude/PRE_BUILD_CHECKLIST.md` and follow it step-by-step.

### 2. "Check the design system rules"

I'll read `.claude/rules/design-system.md` and verify my code follows it.

### 3. "Did you use tokens and variants?"

I'll check if I imported from `lib/design/tokens.ts` and `lib/design/variants.ts` instead of hardcoding.

### 4. "Run the enforcement checks"

I'll run:

```bash
npm run build && npm run type-check && npm run lint
```

### 5. "Test both themes"

I'll verify the component works in light AND dark mode.

### 6. "Test on mobile"

I'll verify it works at 375px width with 44px touch targets.

---

## What I Do Automatically

### Before Starting Any Work:

✅ I read `.claude/PRE_BUILD_CHECKLIST.md`
✅ I read the relevant rule files
✅ I check if variants already exist
✅ I plan the component structure

### While Building:

✅ I import from `lib/design/*` only
✅ I use TypeScript interfaces
✅ I use semantic HTML
✅ I make components mobile-friendly

### Before Finishing:

✅ I search for hardcoded values
✅ I search for `any` types
✅ I test in both themes
✅ I test on mobile size

---

## The Automated Safety Nets

Even if I forget, the system will catch it:

1. **ESLint** - Shows errors in real-time while I code
2. **Pre-commit Hook** - Blocks commits with violations
3. **TypeScript** - Prevents type errors at build
4. **Build Process** - Won't compile if broken

---

## How to Test if I'm Following Rules

Run this after I build something:

```bash
# 1. Check for hardcoded values
grep -r "text-red-500\|text-blue-500\|bg-orange-500" app/(app)/**/*.tsx

# Should return: nothing (or just imports)

# 2. Check for TypeScript any
grep -r ": any" app/(app)/**/*.tsx

# Should return: nothing

# 3. Check for inline styles
grep -r 'style={{.*color:' app/(app)/**/*.tsx

# Should return: nothing (unless using CSS variables)

# 4. Run the build
npm run build

# Should pass with no errors
```

---

## The Contract

When you hire me to build a page/component, I will:

1. ✅ Read the checklist first
2. ✅ Use only tokens and variants (no hardcoded values)
3. ✅ Use TypeScript properly (no `any`)
4. ✅ Make it mobile-friendly (44px touch targets)
5. ✅ Make it work in both themes
6. ✅ Make it accessible (semantic HTML, ARIA labels)
7. ✅ Test it before finishing

If I break any of these, **call me out immediately** using the quick commands above.

---

## Emergency Reset

If I've built something that violates too many rules, say:

**"Stop. Read PRE_BUILD_CHECKLIST.md and rebuild this properly."**

I'll:

1. Stop what I'm doing
2. Read the entire checklist
3. Delete the violating code
4. Rebuild it correctly from scratch

---

## Your Responsibility

You should:

1. **Check my work occasionally** - Run the test commands above
2. **Remind me when needed** - Use the quick commands
3. **Review PRs/commits** - Make sure automated checks passed
4. **Update rules if needed** - Edit files in `.claude/rules/`

---

## The Files That Control Me

| File                             | Purpose           | When to Read                |
| -------------------------------- | ----------------- | --------------------------- |
| `.claude/PRE_BUILD_CHECKLIST.md` | Master checklist  | Before every page/component |
| `.claude/rules/design-system.md` | Design rules      | Before any UI work          |
| `.claude/rules/architecture.md`  | Code organization | When structuring features   |
| `.claude/rules/typescript.md`    | Type safety rules | When writing TypeScript     |
| `lib/design/tokens.ts`           | All values        | When adding spacing/colors  |
| `lib/design/variants.ts`         | All styles        | When styling components     |

---

## Examples of Staying On Track

### ✅ Good Workflow:

```
You: "Build a workout card for the dashboard"

Me:
1. Reads PRE_BUILD_CHECKLIST.md
2. Checks if variant exists in lib/design/variants.ts
3. Plans the component structure
4. Builds using only tokens and variants
5. Tests in both themes
6. Tests at 375px width
7. Commits (hook validates ✅)
```

### ❌ Bad Workflow (What We're Preventing):

```
You: "Build a workout card for the dashboard"

Me:
1. Immediately starts coding
2. Uses className="bg-orange-500 p-4 rounded"
3. Uses inline styles for colors
4. Forgets to test mobile
5. Commits (hook BLOCKS ❌)
```

---

## Bottom Line

**I will follow the rules IF:**

1. The rule files exist (✅ they do now)
2. You remind me when I deviate
3. The automated checks are in place (✅ they are now)

**The system guarantees:**

- No hardcoded values
- No TypeScript errors
- Theme works everywhere
- Mobile-friendly components
- Accessible UI
- Clean, maintainable code

**Your job:**
Say "Follow the checklist" when needed. That's it.
