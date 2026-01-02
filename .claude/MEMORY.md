# Project Memory

This file contains persistent context about the Mo app that should be preserved across sessions.

## Current State

### Active Development

- PPL (Push/Pull/Legs) workout system is the primary focus
- Old workout system is deprecated but tables still exist
- 756 exercises seeded from mo-docs

### Recent Changes

- Fixed PPL API endpoints and frontend integration
- Set up Claude Code configuration (agents, skills, commands)
- Phase 4 frontend plan exists at `~/.claude/plans/`

### Known Issues

- None currently tracked

## Architecture Decisions

### Why PPL?

Push/Pull/Legs split provides:

- Balanced muscle recovery
- Flexible scheduling (3-6 days/week)
- Clear exercise categorization

### Why Template Slots?

Movement pattern slots instead of fixed exercises:

- Allows exercise variation within patterns
- Supports different equipment levels
- Enables intelligent substitutions

### Database Design

- `templateSlots` define movement patterns, not specific exercises
- `sessionExercises` link to the actual exercise performed
- This separation enables flexible workout customization

## User Preferences

(Add user-specific preferences here as they're discovered)

## Gotchas

1. **Movement patterns**: Must match enum values exactly (e.g., `horizontal_push`, not `incline_push`)
2. **Clerk auth**: All API routes require `getCurrentUser()` check
3. **Equipment levels**: `full_gym`, `home_gym`, `bodyweight` - must match enum
4. **Seeding exercises**: Requires `MO_DOCS_PATH` environment variable

## Frequently Referenced Files

- `lib/db/schema.ts` - Database schema
- `app/(app)/workout/page.tsx` - Main workout page
- `app/api/ppl/today/route.ts` - Today's workout API
- `lib/mo-coach/` - Training intelligence logic

---

_Update this file when discovering important context that should persist._
