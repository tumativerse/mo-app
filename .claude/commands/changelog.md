# Changelog Command

Generate or update the changelog based on recent commits.

## Arguments
- `$ARGUMENTS` - Optional: version number (e.g., "1.2.0") or "unreleased"

## Steps

1. **Get recent commits**:
   ```bash
   git log --oneline -50
   ```

2. **Categorize changes**:
   - **Added**: New features
   - **Changed**: Changes to existing functionality
   - **Fixed**: Bug fixes
   - **Removed**: Removed features
   - **Security**: Security fixes

3. **Generate changelog entry**:
   ```markdown
   ## [$VERSION] - YYYY-MM-DD

   ### Added
   - Feature description (#PR)

   ### Changed
   - Change description (#PR)

   ### Fixed
   - Bug fix description (#PR)
   ```

4. **Update CHANGELOG.md**:
   - If file exists, prepend new entry
   - If file doesn't exist, create with header:
     ```markdown
     # Changelog

     All notable changes to this project will be documented in this file.

     The format is based on [Keep a Changelog](https://keepachangelog.com/).

     ## [Unreleased]
     ```

5. Show the generated entry and ask for confirmation before writing.
