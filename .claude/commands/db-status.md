# Database Status

Check database schema and data status.

## Steps

1. **Check schema sync**:
   ```bash
   npx drizzle-kit push --dry-run 2>&1 | head -50
   ```
   Report if schema is in sync with database.

2. **Check table counts**:
   Query main tables and report row counts:
   - exercises
   - programTemplates
   - templateDays
   - templateSlots
   - workoutSessions
   - users

3. **Report format**:
   ```
   ## Database Status

   ### Schema
   - Status: In sync / Needs migration
   - Changes needed: (if any)

   ### Data Summary
   | Table | Rows |
   |-------|------|
   | exercises | X |
   | programTemplates | X |
   | ... | ... |

   ### Recommendations
   - Any seeding needed
   - Any migrations to run
   ```

4. If schema is out of sync, offer to run `npm run db:push`.
