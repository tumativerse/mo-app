# Claude Code + DevOps Setup - Complete Guide

This document ties together all the Claude Code configuration and DevOps infrastructure for the Mo app.

---

## What We Built

### 1. Claude Code Configuration ✅

**Location:** `.claude/`

| Component         | Files                          | Purpose                       |
| ----------------- | ------------------------------ | ----------------------------- |
| **Settings**      | `settings.json`                | Permissions, hooks, security  |
| **Rules**         | `rules/*.md` (4 files)         | Auto-applied coding standards |
| **Agents**        | `agents/*.md` (8 files)        | Specialized task assistants   |
| **Skills**        | `skills/*.md` (5 files)        | Code generation templates     |
| **Commands**      | `commands/*.md` (7 files)      | Workflow automation           |
| **Documentation** | `CLAUDE.md`, `MEMORY.md`, etc. | Project context               |

**Model Strategy:**

- **Opus:** Complex architecture, difficult problems
- **Sonnet:** Daily development (default)
- **Haiku:** Quick questions

---

### 2. Development Workflow ✅

**Location:** `.claude/WORKFLOW.md`

**Two-Phase Testing Approach:**

```
1. Research
2. Plan Architecture (if complex)
3. Write Behavior Tests (Phase 1) ← Define expected behavior
4. Build ← Implement to pass tests
5. Write Implementation Tests (Phase 2) ← Verify details
6. Review
7. Verify
8. Document
9. Commit
```

**Why Two Phases?**

- **Phase 1 (Before Build):** Defines requirements, acceptance criteria
- **Phase 2 (After Build):** Verifies implementation, coverage

---

### 3. DevOps Infrastructure (Planned)

**Location:** `.claude/DEVOPS_INFRASTRUCTURE.md`

**Host:** vault.tumati.me

**Components:**

1. **Jenkins** - CI/CD pipeline
2. **Grafana + Prometheus** - Metrics & dashboards
3. **Loki** - Log aggregation
4. **Sentry** - Error tracking
5. **SonarQube** - Code quality
6. **Playwright** - E2E testing
7. **PostgreSQL Test DB** - Isolated testing

**Cost:** ~$30/month

---

## How It All Works Together

### Development Flow

```
┌─────────────────────────────────────────────────┐
│ 1. You: "Add recovery check-in to dashboard"   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 2. Claude: Research (Explore agent)             │
│    - Checks existing dashboard                  │
│    - Finds recovery-checkin component           │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 3. Claude: Plan (if complex, uses Opus)         │
│    - Proposes integration approach              │
│    - Gets your approval                          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 4. Claude: Write Behavior Tests (Phase 1)       │
│    - Tests that dashboard shows recovery prompt │
│    - Tests successful submission                │
│    - Tests already logged state                 │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 5. Claude: Build (uses Sonnet)                  │
│    - Follows component.md patterns              │
│    - Auto-formatted via hooks                   │
│    - Runs Phase 1 tests to verify               │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 6. Claude: Write Implementation Tests (Phase 2) │
│    - Unit tests for helpers                     │
│    - Component render tests                     │
│    - API integration tests                      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 7. Claude: Review (code-reviewer agent)         │
│    - Checks TypeScript, security, accessibility │
│    - Runs /review command                       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 8. Claude: Verify                                │
│    - Runs /build (lint → test → build)          │
│    - Manual browser testing                     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 9. Claude: Document                              │
│    - Updates MEMORY.md with gotchas             │
│    - Adds JSDoc if needed                       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 10. You: git add . && git commit                │
│     Claude assists with commit message          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 11. Push to GitHub                               │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 12. Jenkins (vault.tumati.me)                   │
│     - Runs full test suite                      │
│     - Builds app                                 │
│     - Runs E2E tests                             │
│     - Deploys to staging                         │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ 13. Monitoring (Grafana + Sentry)               │
│     - Tracks errors                              │
│     - Monitors performance                       │
│     - Alerts on issues                           │
└─────────────────────────────────────────────────┘
```

---

## Quick Commands Reference

### Development

```bash
# Use agents automatically
"Research the workout system"  # Uses Explore agent
"Review my changes"            # Uses code-reviewer agent
"Run all tests"                # Uses test-runner agent

# Manual commands
/test [file]                   # Run tests
/review [staged|file]          # Code review
/build                         # Full verification
/research [topic]              # Research topic
/docs [file]                   # Generate docs

# Generate code
/component WorkoutTimer        # Generate component
/api goals                     # Generate API route
/test path/to/file             # Generate tests
```

### CI/CD (Once Deployed)

```bash
# Check build status
https://vault.tumati.me/jenkins/job/mo-app-test/

# View metrics
https://vault.tumati.me/grafana

# Check errors
https://sentry.io/mo-app
```

---

## File Organization

```
mo-app/
├── .claude/
│   ├── settings.json          # Permissions, hooks
│   ├── CLAUDE.md              # Project context
│   ├── MEMORY.md              # Persistent decisions
│   ├── WORKFLOW.md            # Development workflow
│   ├── DEVOPS_INFRASTRUCTURE.md  # Infrastructure plan
│   ├── ONBOARDING.md          # Team onboarding
│   ├── MCP_SETUP.md           # MCP servers guide
│   ├── agents/                # 8 specialized agents
│   ├── rules/                 # 4 coding standards
│   ├── skills/                # 5 code generators
│   └── commands/              # 7 workflow commands
│
├── app/                       # Next.js app
├── components/                # React components
├── lib/                       # Utilities
├── tests/                     # Test files
├── e2e/                       # E2E tests (future)
├── scripts/                   # Deployment scripts (future)
└── Jenkinsfile                # CI/CD pipeline (future)
```

---

## Next Steps

### Immediate (Now)

- [x] Claude Code configuration complete
- [x] Workflow documented
- [x] DevOps plan created

### Short-term (This Week)

- [ ] Start using two-phase testing for new features
- [ ] Practice workflow on next feature
- [ ] Review and refine as needed

### Medium-term (Next Month)

- [ ] Set up Jenkins on vault.tumati.me
- [ ] Configure basic CI pipeline
- [ ] Add E2E tests with Playwright
- [ ] Set up Prometheus + Grafana

### Long-term (Next Quarter)

- [ ] Full monitoring dashboards
- [ ] Alert system with Slack
- [ ] Automated deployments
- [ ] Performance optimization based on metrics

---

## Benefits of This Setup

### For Development

✅ **Faster development** - Code generation, auto-formatting
✅ **Higher quality** - Agents review code, tests verify
✅ **Consistency** - Rules enforce standards
✅ **Less context switching** - Claude follows patterns
✅ **Knowledge retention** - MEMORY.md preserves decisions

### For Testing

✅ **Better test coverage** - Two-phase approach
✅ **Clearer requirements** - Phase 1 defines behavior
✅ **Faster debugging** - Tests fail at right level
✅ **Confidence** - Multiple test layers

### For Operations

✅ **Visibility** - Metrics, logs, errors all in one place
✅ **Faster incident response** - Alerts + runbooks
✅ **Data-driven decisions** - Analytics on usage
✅ **Automated deployments** - Less manual work
✅ **Quality gates** - Can't deploy broken code

---

## Cost Summary

| Category       | Tool             | Cost            |
| -------------- | ---------------- | --------------- |
| **Claude**     | API usage        | ~$50-100/mo     |
| **DevOps**     | vault.tumati.me  | $24/mo          |
| **DevOps**     | Storage/backups  | $5/mo           |
| **Monitoring** | Sentry free tier | $0              |
| **Total**      |                  | **~$80-130/mo** |

**ROI:**

- Faster development (saves hours)
- Fewer bugs (saves customer support time)
- Better uptime (fewer incidents)
- Data-driven optimization

---

## Support & Resources

- **Claude Code Docs:** `.claude/ONBOARDING.md`
- **Workflow Guide:** `.claude/WORKFLOW.md`
- **DevOps Plan:** `.claude/DEVOPS_INFRASTRUCTURE.md`
- **Project Context:** `.claude/CLAUDE.md`
- **Persistent Memory:** `.claude/MEMORY.md`

---

## Questions?

Ask Claude:

- "How do I use the test-runner agent?"
- "What's the workflow for adding a new feature?"
- "How do I set up monitoring?"
- "Show me examples of two-phase testing"
