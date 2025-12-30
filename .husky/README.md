# Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to manage git hooks that ensure code quality before commits.

## Pre-Commit Hook

**Location**: `.husky/pre-commit`

**What it does**:
- Runs TypeScript type checking (`npm run type-check`)
- Prevents commits if TypeScript errors are found
- Ensures production builds won't fail due to type errors

**Why**:
Without this hook, TypeScript errors can slip into commits and cause production build failures on Vercel. This hook catches errors early, before they reach CI/CD.

## Available Scripts

```bash
npm run type-check   # Run TypeScript type checking (no emit)
```

## How It Works

1. You run `git commit`
2. Husky automatically runs `.husky/pre-commit`
3. The hook runs `npm run type-check`
4. If TypeScript errors are found:
   - ❌ Commit is blocked
   - Error messages are displayed
   - You must fix errors before committing
5. If no errors:
   - ✅ Commit proceeds normally

## Example Output

**Success**:
```
🔍 Running pre-commit checks...
📝 Checking TypeScript...
✅ TypeScript check passed!
[main 5230c4d] Your commit message
```

**Failure**:
```
🔍 Running pre-commit checks...
📝 Checking TypeScript...

./app/api/user/profile/route.ts:2:1
Type error: Export getProfile doesn't exist in target module

❌ TypeScript errors found. Please fix them before committing.
```

## Bypassing the Hook (Not Recommended)

In rare cases where you need to commit despite errors:

```bash
git commit --no-verify -m "Your message"
```

⚠️ **Warning**: Only use `--no-verify` if you're certain the errors won't break production builds.

## Troubleshooting

**Hook not running?**
```bash
# Reinstall hooks
npm run prepare
```

**Permission errors?**
```bash
chmod +x .husky/pre-commit
```

## Development Workflow

**Before this hook**:
1. ❌ Commit code
2. ❌ Push to git
3. ❌ Vercel build fails
4. ❌ Fix errors and push again

**With this hook**:
1. ✅ Commit blocked if errors exist
2. ✅ Fix errors locally
3. ✅ Commit succeeds
4. ✅ Vercel build succeeds on first try

## Performance

The `type-check` script runs TypeScript's type checker without emitting files, which is much faster than a full build:

- Full build (`npm run build`): ~30-45 seconds
- Type check (`npm run type-check`): ~3-5 seconds

This makes the pre-commit hook fast enough to not interrupt your workflow.
