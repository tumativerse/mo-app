# Research Command

Research a topic in the codebase or web.

## Arguments
- `$ARGUMENTS` - The topic or question to research

## Steps

1. **Determine research type**:
   - If about this codebase: search files and code
   - If about external topic: use web search
   - If about a library: check docs and package.json

2. **Gather information**:
   - For code: Use Glob and Grep to find relevant files, then Read them
   - For web: Use WebSearch and WebFetch
   - For libraries: Check package.json, node_modules, and official docs

3. **Analyze and synthesize**:
   - Identify key findings
   - Note patterns and best practices
   - Find potential issues or improvements

4. **Report format**:
   ```
   ## Research: $ARGUMENTS

   ### Quick Answer
   1-2 sentence summary

   ### Details
   - Key finding 1
   - Key finding 2
   - Key finding 3

   ### Relevant Files/Sources
   - file1.ts - description
   - file2.ts - description
   - https://... - description

   ### Recommendations
   - What to do based on findings
   ```

5. Offer to take action based on findings if applicable.
