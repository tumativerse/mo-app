# Drizzle Schema Skill

Generate or modify Drizzle ORM schema definitions.

## Usage

`/drizzle <action> <table-name> [fields...]`

Actions:

- `table` - Create new table
- `column` - Add column to existing table
- `relation` - Add relation between tables

## Behavior

### Create Table

`/drizzle table workoutGoals userId:uuid name:text targetDate:timestamp`

Adds to `lib/db/schema.ts`:

```typescript
export const workoutGoals = pgTable('workout_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  targetDate: timestamp('target_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workoutGoalsRelations = relations(workoutGoals, ({ one }) => ({
  user: one(users, {
    fields: [workoutGoals.userId],
    references: [users.id],
  }),
}));
```

### Add Column

`/drizzle column exercises videoUrl:text`

Adds column to existing table:

```typescript
videoUrl: text('video_url'),
```

### Add Relation

`/drizzle relation workoutGoals exercises many`

Adds relation:

```typescript
export const workoutGoalsRelations = relations(workoutGoals, ({ many }) => ({
  exercises: many(exercises),
}));
```

## Field Type Mappings

| Shorthand   | Drizzle Type              |
| ----------- | ------------------------- |
| `text`      | `text('name')`            |
| `int`       | `integer('name')`         |
| `bool`      | `boolean('name')`         |
| `uuid`      | `uuid('name')`            |
| `timestamp` | `timestamp('name')`       |
| `decimal`   | `doublePrecision('name')` |
| `json`      | `jsonb('name')`           |

## Modifiers

| Modifier           | Example                                |
| ------------------ | -------------------------------------- |
| `!` (required)     | `name:text!` → `.notNull()`            |
| `=value` (default) | `active:bool=true` → `.default(true)`  |
| `[]` (array)       | `tags:text[]` → `text('tags').array()` |

## After Changes

1. Run `npm run db:push` to sync schema
2. If adding required columns to existing tables, add as nullable first
3. Create seed data if needed

## Current Tables Reference

- `users`, `userProfiles` - User data
- `exercises` - Exercise library (756 exercises)
- `programTemplates`, `templateDays`, `templateSlots` - PPL structure
- `workoutSessions`, `sessionExercises`, `sessionSets` - Workout logs
- `recoveryLogs`, `progressions` - Tracking data
