# Documentation Command

Generate or update documentation.

## Arguments
- `$ARGUMENTS` - What to document (file path, feature name, or "api")

## Steps

1. **Identify scope**:
   - If file path: document that specific file
   - If "api": document all API routes
   - If feature name: document the feature

2. **Gather information**:
   - Read the relevant source files
   - Check for existing documentation
   - Understand the implementation

3. **Generate documentation**:

   For API routes:
   ```markdown
   ## [METHOD] /api/[route]

   [Description]

   ### Authentication
   Required / Not required

   ### Request
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|

   ### Response
   [Example response]

   ### Errors
   | Status | Error | Description |
   |--------|-------|-------------|
   ```

   For components:
   ```markdown
   ## ComponentName

   [Description]

   ### Props
   | Prop | Type | Default | Description |
   |------|------|---------|-------------|

   ### Usage
   [Code example]
   ```

   For features:
   ```markdown
   ## Feature Name

   ### Overview
   [Description]

   ### User Flow
   1. Step 1
   2. Step 2

   ### Technical Details
   [Implementation notes]

   ### Related Files
   - file1.ts
   - file2.ts
   ```

4. **Output location**:
   - API docs: `docs/api/[route].md`
   - Component docs: inline JSDoc or `docs/components/[name].md`
   - Feature docs: `docs/features/[name].md`

5. Ask where to save the documentation.
