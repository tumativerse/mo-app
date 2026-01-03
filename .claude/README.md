# Claude Code Configuration

**Last Updated:** 2026-01-02
**Status:** Organized & Production-Ready ✅

This directory contains all Claude Code configuration for the Mo App project.

---

## 📁 Organization Structure

### Core Documentation (Read These First)

```
/CLAUDE.md                    # Main context file (in project root)
.claude/
├── MEMORY.md                 # Persistent project context & decisions
├── WORKFLOW_GUIDE.md         # Complete development workflow (27 quality gates)
├── WORKFLOW_ANALYSIS.md      # Industry comparison & workflow deep-dive
├── ONBOARDING.md             # Team onboarding guide
└── README.md                 # This file
```

### Rules (Path-Specific Coding Standards)

```
.claude/rules/
├── api.md                    # API route patterns & validation
├── architecture.md           # File organization & component structure
├── design-system.md          # UI/UX guidelines & responsive design
├── react.md                  # React patterns & hooks
├── testing.md                # Test organization & coverage
└── typescript.md             # Type safety & patterns
```

**When these apply:**

- Rules automatically apply when Claude works on matching file types
- Example: `api.md` rules apply when editing files in `app/api/**`

### Skills (Code Generation Templates)

```
.claude/skills/
├── api.md                    # Generate API routes
├── component.md              # Generate React components
├── drizzle.md                # Database schema & migrations
├── test.md                   # Generate test files
└── readme.md                 # Skill system documentation
```

**How to use:**

- Reference in prompts: "Use the API skill to create a new endpoint"
- Claude automatically follows patterns when creating new files

### Commands (Workflow Automation)

```
.claude/commands/
├── build.md                  # Build & verify production readiness
├── changelog.md              # Generate changelogs
├── db-status.md              # Database status & health
├── docs.md                   # Generate documentation
├── research.md               # Research codebase
├── review.md                 # Code review workflow
└── test.md                   # Run tests & report results
```

**How to use:**

- Shorthand: `/test`, `/build`, `/review`
- Commands trigger specific workflows

### Agents (Specialized Task Runners)

```
.claude/agents/
├── api-debugger.md           # Debug API issues
├── code-reviewer.md          # Review code quality
├── database-migrator.md      # Handle schema changes
├── doc-writer.md             # Write documentation
├── performance-analyzer.md   # Analyze performance
├── researcher.md             # Research codebase
├── test-runner.md            # Execute test suites
└── ui-improver.md            # Improve UI/UX
```

**How to use:**

- Claude spawns these automatically for specialized tasks
- Example: "Review this code" → spawns code-reviewer agent

### Setup Guides

```
.claude/
├── SONARCLOUD_SETUP.md       # SonarCloud configuration
├── ALL_GITHUB_SECRETS.md     # Required GitHub secrets
├── GITHUB_SECRETS_SETUP.md   # Secret configuration guide
├── MCP_SETUP.md              # MCP server setup
└── DEVOPS_INFRASTRUCTURE.md  # Complete DevOps overview
```

### Historical Documentation (Archived)

```
.claude/archive/
├── WEEK_1_COMPLETE.md        # Week 1 milestone (archived)
├── WEEK_3_COMPLETE.md        # Week 3 milestone (archived)
├── FIXES_APPLIED.md          # Historical bug fixes
├── WORKFLOW_*.md             # Old workflow docs (superseded by WORKFLOW_GUIDE.md)
└── ... (14 archived files)
```

**Note:** Archived files are kept for historical reference but superseded by current docs.

---

## 🚀 Quick Start for Claude

### For New Sessions

1. **Read first:** `CLAUDE.md` (project root) - Main context
2. **Then read:** `.claude/MEMORY.md` - Current state & decisions
3. **For workflow:** `.claude/WORKFLOW_GUIDE.md` - How to commit/push

### For Specific Tasks

| Task              | Read                                                                |
| ----------------- | ------------------------------------------------------------------- |
| Building features | `CLAUDE.md` + relevant rules                                        |
| API development   | `.claude/rules/api.md` + `.claude/skills/api.md`                    |
| UI components     | `.claude/rules/design-system.md` + `.claude/skills/component.md`    |
| Database changes  | `.claude/skills/drizzle.md` + `.claude/agents/database-migrator.md` |
| Testing           | `.claude/rules/testing.md` + `.claude/skills/test.md`               |
| Code review       | `.claude/agents/code-reviewer.md`                                   |
| Workflow issues   | `.claude/WORKFLOW_GUIDE.md`                                         |

---

## 📋 Key Information for Claude

### Project Status

- **Phase:** Pre-production development
- **Infrastructure:** Complete (27 quality gates, 100% coverage)
- **Next:** Building user-facing features

### Workflow

- **Solo developer** - No PR requirement
- **Direct pushes to main** - Allowed
- **21 pre-push checks** - ~3 minutes validation
- **100% test coverage** - Enforced on all business logic

### Architecture

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **Auth:** Clerk
- **Workout System:** PPL (Push/Pull/Legs)

### Critical Rules

1. **All API routes** must check auth with `getCurrentUser()`
2. **All business logic** must have 100% test coverage
3. **All PII** must be encrypted with AES-256-GCM
4. **Movement patterns** must match exact enum values
5. **Conventional commits** enforced via commitlint

---

## 🔧 Settings

### Claude Code Settings

**File:** `.claude/settings.json`

```json
{
  "model": "sonnet",
  "permissions": {
    "allow": ["Bash", "Read", "Edit", "Write", "Task", ...],
    "deny": ["Read(.env)", "Bash(rm -rf:*)", ...]
  },
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "eslint --fix" }] },
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "prettier --write" }] }
    ]
  }
}
```

**Auto-formatting:**

- ESLint auto-fixes on every file edit
- Prettier auto-formats on every file edit

---

## 📚 Documentation Hierarchy

### Primary (Always Current)

1. `CLAUDE.md` - Main context
2. `.claude/MEMORY.md` - Project state
3. `.claude/WORKFLOW_GUIDE.md` - Development workflow

### Secondary (Task-Specific)

4. `.claude/rules/**` - Coding standards
5. `.claude/skills/**` - Code generation
6. `.claude/commands/**` - Workflows
7. `.claude/agents/**` - Specialized tasks

### Tertiary (Reference)

8. `.claude/WORKFLOW_ANALYSIS.md` - Industry comparison
9. `.claude/SONARCLOUD_SETUP.md` - SonarCloud config
10. `.claude/DEVOPS_INFRASTRUCTURE.md` - DevOps overview

### Archive (Historical)

11. `.claude/archive/**` - Old docs (reference only)

---

## ✅ Maintenance

### When to Update

**CLAUDE.md:**

- Major architecture changes
- New key directories
- Common patterns change

**MEMORY.md:**

- Project phase changes
- New architecture decisions
- Important gotchas discovered
- Environment variables change

**WORKFLOW_GUIDE.md:**

- Quality gate count changes
- New git hooks added
- CI/CD workflow updates

**Rules:**

- Coding standards change
- New patterns established
- Framework updates

---

## 🎯 For Solo Developer

As the solo developer on this project, you benefit from:

✅ **No PR overhead** - Direct pushes to main
✅ **Fast feedback** - 45 sec pre-commit, 3 min pre-push
✅ **Comprehensive validation** - 27 quality gates
✅ **Auto-formatting** - ESLint + Prettier on every save
✅ **100% coverage** - Bugs caught before production
✅ **Clear workflows** - Documented processes

---

_This configuration is optimized for solo development with enterprise-grade quality enforcement._
