# Mo App - Claude Code Context

## Project Overview

Mo is a fitness tracking application with a PPL (Push/Pull/Legs) workout system.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Auth**: Clerk
- **Styling**: TailwindCSS
- **UI**: Radix UI components, Lucide icons
- **Notifications**: Sonner toasts

## Key Directories

- `app/(app)/` - Authenticated app pages (dashboard, workout, progress, etc.)
- `app/api/` - API routes
- `lib/db/` - Database schema and seeds
- `lib/mo-coach/` - Training intelligence (fatigue, progression, deload)
- `lib/mo-self/` - User management (auth, streaks, PRs)
- `components/` - Reusable UI components

## Database Systems

**Active (PPL System):**

- `programTemplates` - Workout program definitions
- `templateDays` - Days within a program (Push A, Pull A, etc.)
- `templateSlots` - Exercise slots with movement patterns
- `workoutSessions` - User's workout sessions
- `sessionExercises` - Exercises in a session
- `sessionSets` - Individual sets logged
- `exercises` - Exercise library (756 exercises)

**Deprecated (Old System):**

- `programs`, `programDays`, `userPrograms`, `workouts`, `workoutSets`

---

## Code Patterns

### API Route Pattern

```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/mo-self';
import { db } from '@/lib/db';

const schema = z.object({
  /* fields */
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid data',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    // ... business logic with db queries

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed', details: message }, { status: 500 });
  }
}
```

### Page Component Pattern

```typescript
// app/(app)/[page]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/error-state';

interface PageData { /* types */ }

export default function PageName() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/endpoint');
        if (!res.ok) throw new Error('Failed to fetch');
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (/* JSX */);
}
```

### Drizzle Query Patterns

```typescript
// Simple select with conditions
const results = await db
  .select()
  .from(exercises)
  .where(eq(exercises.movementPattern, 'horizontal_push'))
  .limit(10);

// Insert with returning
const [newRecord] = await db
  .insert(workoutSessions)
  .values({ userId, templateDayId, status: 'in_progress' })
  .returning();

// Update
await db
  .update(workoutSessions)
  .set({ status: 'completed', endTime: new Date() })
  .where(eq(workoutSessions.id, sessionId));

// Join query
const slots = await db
  .select({
    slot: templateSlots,
    exercise: exercises,
  })
  .from(templateSlots)
  .leftJoin(exercises, eq(templateSlots.defaultExerciseId, exercises.id))
  .where(eq(templateSlots.templateDayId, dayId));
```

### Component Props Pattern

```typescript
interface ComponentProps {
  data: DataType;
  onAction?: () => void;
  loading?: boolean;
  className?: string;
}

export function Component({
  data,
  onAction,
  loading = false,
  className = '',
}: ComponentProps) {
  return (/* JSX */);
}
```

### Movement Pattern Enum Values

```typescript
// Valid values for movementPattern in templateSlots
type MovementPattern =
  | 'horizontal_push'
  | 'vertical_push'
  | 'chest_isolation'
  | 'tricep_isolation'
  | 'shoulder_isolation'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'rear_delt'
  | 'bicep_isolation'
  | 'forearm'
  | 'hip_hinge'
  | 'squat'
  | 'lunge'
  | 'leg_curl'
  | 'leg_extension'
  | 'calf'
  | 'core';
```

---

## UI Guidelines

**IMPORTANT:** Mo is a **fun, energetic, and motivating** app. See `.claude/DESIGN_SYSTEM.md` for complete design patterns.

### Design Requirements (Always Apply)

- ✅ Use Framer Motion with stagger animations
- ✅ Gradient text headers
- ✅ Cards with gradient backgrounds and colored borders
- ✅ Icons that bounce/rotate on hover
- ✅ Interactive elements scale on hover/tap
- ✅ Shadow effects on primary actions
- ✅ Semantic color tokens (never hardcoded colors)

### Theme Colors (Use Semantic Tokens)

- Background: `bg-background`
- Cards: `bg-card border-border`
- Text: `text-foreground` (primary), `text-muted-foreground` (secondary)
- Primary actions: `bg-primary text-primary-foreground`
- Destructive: `text-destructive`
- Inputs: `bg-secondary border-border`

### Toast Notifications

```typescript
import { toast } from 'sonner';

toast.success('Workout completed!');
toast.error('Failed to save');
toast.loading('Saving...');
```

### Icons

```typescript
import { Dumbbell, Play, Check, X, RefreshCw } from 'lucide-react';
```

---

## Common Commands

```bash
npm run dev          # Start dev server
npm run db:seed      # Seed PPL template
npm run db:push      # Push schema to database
npm run build        # Production build
npm run lint         # Run ESLint
```

## Seeding

1. `npm run db:seed` - Seeds PPL template
2. `MO_DOCS_PATH=/path/to/mo-docs npx tsx lib/db/seed-exercises.ts` - Seeds exercises

---

## Testing Notes

- Use React Testing Library with `@testing-library/react`
- Query by role/label/text, not test-ids
- Mock fetch calls in tests
- Test user interactions, not implementation

---

## Claude Code Resources

- `.claude/MEMORY.md` - Persistent project context and decisions
- `.claude/ONBOARDING.md` - Team onboarding guide
- `.claude/MCP_SETUP.md` - MCP server configuration
- `.claude/rules/` - Path-specific coding standards
- `.claude/agents/` - Specialized task agents
- `.claude/skills/` - Code generation templates
- `.claude/commands/` - Workflow commands

---

## Model Selection

Automatically switch models based on task complexity:

### Use Opus For:

- Designing new system architecture
- Complex database schema design
- Difficult debugging (multi-file, unclear cause)
- Major refactoring decisions
- Performance optimization strategies
- Security-sensitive implementations
- When multiple approaches need evaluation

### Use Sonnet For:

- Daily coding and feature implementation
- Standard debugging
- Code reviews
- Writing tests
- Documentation
- Most agent tasks

### Use Haiku For:

- Quick questions about syntax
- Simple file lookups
- Formatting tasks

---

## Automatic Behaviors

When performing these tasks, automatically follow the patterns in the corresponding skill/command files:

### Code Generation

- **Creating components**: Follow `.claude/skills/component.md` patterns
- **Creating API routes**: Follow `.claude/skills/api.md` patterns
- **Creating tests**: Follow `.claude/skills/test.md` patterns
- **Modifying schema**: Follow `.claude/skills/drizzle.md` patterns

### Workflows

- **After significant code changes**: Run tests and report results (`.claude/commands/test.md`)
- **Before commits**: Review changes for issues (`.claude/commands/review.md`)
- **When asked about the codebase**: Research thoroughly (`.claude/commands/research.md`)
- **When asked to document**: USE the doc-writer agent via Task tool - READ `.claude/agents/doc-writer.md` first

### IMPORTANT: Use Your Agents

Before doing specialized tasks, READ the corresponding agent file and USE the Task tool to spawn it:

- Documentation → spawn `doc-writer` agent
- Research → spawn `researcher` agent
- Code review → spawn `code-reviewer` agent
- Testing → spawn `test-runner` agent
- Performance → spawn `performance-analyzer` agent

DO NOT just do these tasks directly. Use the agents.

### Quality Checks

- After creating/modifying files, verify:
  1. TypeScript compiles without errors
  2. ESLint passes (auto-fixed by hooks)
  3. Tests pass if applicable
  4. Patterns match existing codebase

## Summary Instructions

When compacting, preserve: recent code changes, error messages, current task context, and any active session IDs. Also read `.claude/MEMORY.md` for persistent context.
