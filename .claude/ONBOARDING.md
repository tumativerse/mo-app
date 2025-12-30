# Claude Code Configuration for Mo App

Complete documentation of the Claude Code setup for the Mo fitness app.

---

## Quick Start

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Open project
cd /path/to/mo-app
claude
```

---

## Model Selection

Claude automatically selects the appropriate model based on task complexity:

| Model | When Used | Examples |
|-------|-----------|----------|
| **Opus** | Complex tasks requiring deep reasoning | Architecture design, complex schema, difficult multi-file bugs, major refactoring, security implementations |
| **Sonnet** | Daily development work | Feature implementation, standard debugging, code reviews, writing tests, documentation |
| **Haiku** | Quick simple tasks | Syntax questions, simple file lookups, formatting |

### Manual Override
```
You: Use opus - help me redesign the authentication flow
```

---

## Directory Structure

```
.claude/
├── settings.json          # Permissions, hooks, model default
├── settings.local.json    # Personal overrides (gitignored)
├── CLAUDE.md             # → Project root (symlinked)
├── MEMORY.md              # Persistent project context
├── ONBOARDING.md          # This file
├── MCP_SETUP.md           # MCP server guide
├── agents/                # Specialized task agents
│   ├── code-reviewer.md
│   ├── ui-improver.md
│   ├── api-debugger.md
│   ├── test-runner.md
│   ├── database-migrator.md
│   ├── performance-analyzer.md
│   ├── researcher.md
│   └── doc-writer.md
├── rules/                 # Path-specific coding standards
│   ├── typescript.md
│   ├── react.md
│   ├── api.md
│   └── testing.md
├── skills/                # Code generation templates
│   ├── component.md
│   ├── api.md
│   ├── test.md
│   ├── drizzle.md
│   └── readme.md
└── commands/              # Workflow commands
    ├── test.md
    ├── review.md
    ├── build.md
    ├── db-status.md
    ├── research.md
    ├── docs.md
    └── changelog.md
```

---

## Settings & Security

### Permissions (`settings.json`)

**Allowed:**
- `npm run`, `npm install`, `npm test`, `npx`
- Git operations: `status`, `diff`, `log`, `branch`, `checkout`, `add`
- File operations: `ls`, `mkdir`
- All Claude tools: Read, Edit, Write, Glob, Grep, WebFetch, WebSearch

**Denied (Security):**
- Reading `.env`, `.env.local`, `.env.production` files
- Reading `./secrets/**` directory
- Reading `.git/config`
- Running `curl`, `wget`, `rm -rf`

### Hooks (Auto-run on file changes)

| Hook | Trigger | Action |
|------|---------|--------|
| ESLint | Edit/Write `.ts`, `.tsx`, `.js`, `.jsx` | Auto-fix lint issues |
| Prettier | Edit/Write `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md` | Auto-format |

---

## Rules (Auto-Applied)

Rules are automatically applied based on file path patterns:

| Rule | Files | Key Points |
|------|-------|------------|
| `typescript.md` | `*.ts`, `*.tsx` | No `any`, strict types, proper interfaces |
| `react.md` | `*.tsx`, `components/**` | Functional components, hooks rules, accessibility |
| `api.md` | `app/api/**/*.ts` | Auth check, Zod validation, error format |
| `testing.md` | `*.test.ts`, `*.spec.ts` | React Testing Library, query by role |

---

## Agents

Agents are specialized assistants that Claude uses automatically for specific tasks:

| Agent | Purpose | Model |
|-------|---------|-------|
| `code-reviewer` | Review code for quality, security, best practices | Sonnet |
| `ui-improver` | Suggest UI/UX improvements | Sonnet |
| `api-debugger` | Debug API issues, trace requests | Sonnet |
| `test-runner` | Run tests, analyze failures | Sonnet |
| `database-migrator` | Handle schema changes, migrations | Sonnet |
| `performance-analyzer` | Find performance issues | Sonnet |
| `researcher` | Research codebase or web | Sonnet |
| `doc-writer` | Write documentation | Sonnet |

**Usage:** Claude automatically selects the appropriate agent based on your request.

---

## Skills (Manual Invocation)

Skills are code generation templates invoked with `/`:

### `/component <Name> [options]`
Generate React components.

```
/component WorkoutTimer
/component ProgressPage --page
/component ExerciseCard --with-api
```

Options:
- `--page` - Create as page in `app/(app)/`
- `--with-api` - Also create API route

### `/api <route-name> [methods]`
Generate API routes.

```
/api goals
/api stats GET POST
```

### `/test <file-path>`
Generate tests for a file.

```
/test components/WorkoutTimer.tsx
/test app/api/workout/route.ts
```

### `/drizzle <action> <table> [fields]`
Generate database schema.

```
/drizzle table goals userId:uuid name:text targetDate:timestamp
/drizzle column exercises videoUrl:text
/drizzle relation goals exercises many
```

### `/readme [section]`
Generate or update README.

```
/readme
/readme setup
/readme api
```

---

## Commands (Manual Invocation)

Commands are workflows invoked with `/`:

### `/test [pattern]`
Run tests and analyze results.

```
/test                      # Run all tests
/test workout              # Run tests matching "workout"
/test app/(app)/workout    # Run specific test file
```

### `/review [scope]`
Review code changes.

```
/review                    # Review unstaged changes
/review staged             # Review staged changes
/review app/api/workout    # Review specific file
```

### `/build`
Full build verification: lint → typecheck → test → build.

### `/db-status`
Check database schema sync and table counts.

### `/research <topic>`
Research codebase or web for information.

```
/research how does exercise selection work
/research best practices for rest timers
```

### `/docs <target>`
Generate documentation.

```
/docs app/api/workout/route.ts
/docs workout feature
```

### `/changelog [version]`
Generate changelog from commits.

```
/changelog
/changelog 1.2.0
```

---

## Automatic Behaviors

Claude automatically follows these patterns without explicit commands:

### Code Generation
- Creating components → follows `skills/component.md`
- Creating API routes → follows `skills/api.md`
- Creating tests → follows `skills/test.md`
- Modifying schema → follows `skills/drizzle.md`

### Workflows
- After significant changes → runs tests
- Before commits → reviews changes
- Research questions → thorough investigation
- Documentation requests → proper formatting

### Quality Checks
After file changes:
1. TypeScript compiles
2. ESLint passes (auto-fixed)
3. Tests pass if applicable
4. Patterns match codebase

---

## Memory & Context

### `CLAUDE.md` (Project Root)
Main context file containing:
- Tech stack overview
- Directory structure
- Code patterns and examples
- Database schema reference
- UI guidelines

### `MEMORY.md`
Persistent context that survives sessions:
- Current development state
- Architecture decisions
- Known issues
- Gotchas and tips

**Update `MEMORY.md`** when you discover important context that should persist.

---

## MCP Servers (Optional)

See `MCP_SETUP.md` for configuring:
- **GitHub MCP** - PR and issue management
- **PostgreSQL MCP** - Direct database queries

---

## Common Workflows

### Starting a New Feature
```
You: I want to add a rest timer to the workout page
Claude: [Uses Opus for architecture, plans implementation, creates components]
```

### Fixing a Bug
```
You: The workout page crashes when completing a set
Claude: [Uses api-debugger agent, traces issue, fixes code, runs tests]
```

### Code Review
```
You: Review my changes before I commit
Claude: [Uses code-reviewer agent, reports issues]
```

### Research
```
You: How does the progression system work?
Claude: [Uses researcher agent, explores codebase, explains]
```

---

## Local Overrides

Create `.claude/settings.local.json` for personal settings (gitignored):

```json
{
  "model": "opus",
  "env": {
    "MO_DOCS_PATH": "/path/to/mo-docs"
  }
}
```

---

## Common Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint

# Database
npm run db:push          # Push schema to database
npm run db:seed          # Seed PPL template
MO_DOCS_PATH=/path/to/mo-docs npx tsx lib/db/seed-exercises.ts

# Testing
npm test                 # Run all tests
npm test -- workout      # Run matching tests
```

---

## Getting Help

- `/help` - Claude Code built-in help
- `CLAUDE.md` - Project patterns
- `MEMORY.md` - Persistent context
- GitHub Issues - Report bugs
