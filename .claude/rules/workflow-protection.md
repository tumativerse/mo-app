# Workflow Protection Rules

## CRITICAL: Never Modify These Files Without User Permission

**BLOCKED FILES:**
- `.husky/*` - Git hooks (pre-commit, pre-push)
- `.github/workflows/*` - GitHub Actions workflows
- `scripts/check-*.js` - Quality gate check scripts
- `scripts/check-*.sh` - Quality gate check scripts
- `.claude/WORKFLOW_GUIDE.md` - Workflow documentation
- `.claude/WORKFLOW.md` - Workflow methodology
- `.claude/ENFORCEMENT_SYSTEM.md` - Quality gate documentation
- `package.json` - Scripts that run quality gates

**WHY:** These files control the entire quality gate system (27 checks). Modifying them without approval can break the development workflow or weaken quality standards.

---

## MANDATORY PROCESS

If the user asks for changes that would require modifying these files:

1. ❌ **DO NOT** use Write or Edit tools on these files
2. ✅ **USE** AskUserQuestion tool to request permission
3. ✅ **EXPLAIN** why the change is needed and what it will affect
4. ✅ **WAIT** for explicit approval before proceeding

---

## Examples

### ❌ WRONG - Direct Modification

```
User: "Make the pre-commit hook faster"
Assistant: [Uses Edit tool on .husky/pre-commit]
```

### ✅ CORRECT - Ask First

```
User: "Make the pre-commit hook faster"
Assistant: [Uses AskUserQuestion tool]

"This would require modifying .husky/pre-commit to remove or optimize some checks.
Possible approaches:
1. Run checks in parallel (may reduce time by 30%)
2. Skip certain checks (reduces quality assurance)
3. Move some checks to pre-push only (delays feedback)

Should I proceed with modifying the workflow files? Which approach do you prefer?"
```

### ❌ WRONG - Assuming Permission

```
User: "The coverage check is too strict"
Assistant: "I'll relax the coverage threshold in the pre-commit hook"
[Modifies .husky/pre-commit]
```

### ✅ CORRECT - Explain Trade-offs

```
User: "The coverage check is too strict"
Assistant: [Uses AskUserQuestion tool]

"The current coverage threshold is 100% on all tested files.
Lowering it would require modifying .husky/pre-commit.

Trade-offs:
- Lower threshold = Faster commits, but regressions can slip through
- Current 100% = Slower commits, but bulletproof safety net

Should I modify the workflow to lower the threshold? If so, to what percentage?"
```

---

## What If User Explicitly Requests Workflow Changes?

Even if the user explicitly says "modify the pre-commit hook", **STILL ASK** to confirm they understand the implications:

```
User: "Change the pre-commit hook to skip tests"
Assistant: [Uses AskUserQuestion tool]

"I can modify .husky/pre-commit to skip tests, but this means:
- Broken code can be committed
- CI/CD will catch it later (slower feedback loop)
- Quality gate count drops from 6 to 5 checks

Are you sure you want to proceed with this change?"
```

---

## Emergency Override

If the workflow files are BLOCKING the user from working (e.g., hook is broken), you may suggest:

```
"The pre-commit hook appears to be broken. You can bypass it with:
git commit --no-verify

Then we can fix the hook file together."
```

But **NEVER** modify the hook file without permission.

---

## NEVER Bypass This Rule

Workflow stability is critical. These files control:
- 6 pre-commit checks (~45 seconds)
- 21 pre-push checks (~3 minutes)
- All CI/CD quality gates
- The entire 100% coverage enforcement system

**One bad change can break the entire development workflow.**

Always ask. Always explain. Always wait for approval.
