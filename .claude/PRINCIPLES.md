# Mo-App Development Principles

## Core Principle: Quality > Time

**"Quality is greater than time"** - User directive, January 1, 2026

### What This Means:

- ✅ Fix ALL issues thoroughly, not just the easy ones
- ✅ Take the time needed to do things right
- ✅ No shortcuts or "good enough" solutions
- ✅ Comprehensive fixes over quick patches
- ✅ Proper types over `any` workarounds
- ✅ Complete test coverage over partial
- ✅ Clean code over fast code

### Application:

- When given choice between fast (incomplete) vs thorough (complete): **choose thorough**
- When estimating 30 min (strategic) vs 3 hours (complete): **choose complete**
- When tempted to skip "non-critical" files: **fix everything**
- When considering "fix later": **fix now**

### Examples:

- ❌ "Let's skip scripts/ folder, they're not critical"
- ✅ "Let's fix ALL 42 'any' types across all files"

- ❌ "We can remove unused variables later"
- ✅ "Let's remove ALL unused variables now"

- ❌ "This test is hard to write, skip it"
- ✅ "This test is hard to write, let's figure it out"

### Why This Matters:

1. **No Technical Debt:** Problems fixed now don't compound
2. **Higher Standards:** Code quality improves over time
3. **Better Learning:** Thorough fixes teach more than shortcuts
4. **Easier Maintenance:** Clean code is easier to work with
5. **Professional Pride:** Quality work feels better

### When Quality Meets Reality:

- If a fix truly requires external resources (API keys, etc.), document what's needed
- If a fix requires user decision, ask clearly
- If blocked, explain thoroughly why

**Bottom Line:** Take the time to do it right. Every time.

---

**This principle guides all development decisions for Mo-App.**
