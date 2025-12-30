# Feature Development Workflow

Standard workflow for building features in the Mo app.

---

## Workflow Steps

### 1. Define Requirements

**Goal:** Understand what to build and why.

- [ ] What problem are we solving?
- [ ] What are the success criteria?
- [ ] Are there any constraints? (time, tech, dependencies)
- [ ] Get user approval on scope

**Tools:**
- AskUserQuestion for clarifications
- Review related issues/tickets

---

### 2. Research

**Goal:** Gather context before designing.

**Tasks:**
- [ ] Explore existing codebase for similar patterns
- [ ] Identify files that need changes
- [ ] Research dependencies or libraries needed
- [ ] Check for existing solutions/components
- [ ] Read CLAUDE.md and MEMORY.md for context

**Tools:**
- Explore agent (thorough codebase search)
- researcher agent (web/docs research)
- Glob/Grep for finding files
- Read for understanding existing code

**Deliverable:** Clear understanding of current state and what exists.

---

### 3. Plan Architecture

**Goal:** Design the solution before coding.

**Tasks:**
- [ ] Design component/module structure
- [ ] Identify all files to create/modify
- [ ] Plan data flow and API contracts
- [ ] Consider edge cases and error handling
- [ ] Choose appropriate patterns from codebase

**Tools:**
- Plan agent for complex features
- EnterPlanMode for user approval
- Use Opus for complex architectural decisions

**Deliverable:** Implementation plan with file changes list.

**Skip this step for:** Simple one-file changes, trivial bug fixes.

---

### 4. Write Behavior Tests (Phase 1)

**Goal:** Define expected behavior before building.

**Tasks:**
- [ ] Write acceptance tests for user workflows
- [ ] Define positive scenarios (happy paths)
- [ ] Define negative scenarios (error handling)
- [ ] Define edge cases (boundary conditions)
- [ ] Document expected outcomes

**Test Types:**
- User workflow tests (E2E scenarios)
- API contract tests (request/response format)
- Component behavior tests (user interactions)

**Example:**
```typescript
// Before implementing login
describe('User Login', () => {
  it('should login with valid credentials', async () => {
    // Define expected behavior
    const user = await login('user@example.com', 'password');
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
  });

  it('should reject invalid credentials', async () => {
    await expect(login('wrong', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('should handle empty fields', async () => {
    await expect(login('', '')).rejects.toThrow('Email and password required');
  });
});
```

**Tools:**
- Use `skills/test.md` patterns
- These tests will **fail initially** - that's expected

**Deliverable:** Failing tests that define "done".

---

### 5. Build

**Goal:** Implement the feature to pass Phase 1 tests.

**Tasks:**
- [ ] Follow existing patterns (check rules/ and skills/)
- [ ] Create/modify files as planned
- [ ] Write clean, type-safe code
- [ ] Handle errors gracefully
- [ ] Add inline comments for complex logic
- [ ] Run Phase 1 tests frequently
- [ ] Implementation is done when Phase 1 tests pass

**Patterns to follow:**
- Components: `skills/component.md`
- API routes: `skills/api.md`
- TypeScript: `rules/typescript.md`
- React: `rules/react.md`

**Auto-applied:**
- ESLint fixes (via hooks)
- Prettier formatting (via hooks)
- Type checking (TypeScript)

**Model:** Use Sonnet for standard implementation.

**TDD Loop:**
```
1. Run Phase 1 test → Fails
2. Write code to make it pass
3. Run test again → Passes
4. Refactor if needed
5. Move to next test
```

---

### 6. Write Implementation Tests (Phase 2)

**Goal:** Verify implementation details and coverage.

**Tasks:**
- [ ] Write unit tests for individual functions
- [ ] Write integration tests for API + DB
- [ ] Write component tests for UI rendering
- [ ] Test discovered edge cases
- [ ] Achieve 80%+ code coverage

**Test Types:**
- **Unit tests**: Pure functions, utilities, helpers
- **Integration tests**: API routes with database
- **Component tests**: React components with RTL
- **E2E tests**: Full user flows (optional, expensive)

**Example:**
```typescript
// After implementing login
describe('AuthService', () => {
  it('should hash passwords correctly', () => {
    const hashed = hashPassword('password123');
    expect(hashed).not.toBe('password123');
    expect(verifyPassword('password123', hashed)).toBe(true);
  });

  it('should query database for user', async () => {
    const user = await getUserByEmail('test@example.com');
    expect(user.email).toBe('test@example.com');
  });
});
```

**Patterns:**
- Follow `rules/testing.md`
- Use `skills/test.md` for generation
- React Testing Library for components
- Mock external dependencies

**Tools:**
- `/test` command to run tests
- test-runner agent for analysis

**Deliverable:** Comprehensive passing test suite.

---

### 6. Review

**Goal:** Ensure code quality before finalizing.

**Tasks:**
- [ ] Self-review for obvious issues
- [ ] Check TypeScript errors
- [ ] Verify no security issues
- [ ] Confirm follows project patterns
- [ ] Check accessibility (for UI)

**Tools:**
- code-reviewer agent
- `/review` command
- ui-improver agent (for UI features)
- performance-analyzer agent (if performance-critical)

**Checklist:**
- [ ] No `any` types
- [ ] Proper error handling
- [ ] Auth checks in API routes
- [ ] Zod validation for API inputs
- [ ] Accessible UI (semantic HTML, ARIA)

---

### 7. Verify

**Goal:** Confirm everything builds and works.

**Tasks:**
- [ ] Run full build pipeline
- [ ] Fix any lint/type/test errors
- [ ] Manual testing in browser
- [ ] Test on mobile (if UI changes)
- [ ] Check console for errors

**Tools:**
- `/build` command (lint → typecheck → test → build)
- Browser DevTools

**Deliverable:** Working feature, no build errors.

---

### 8. Document

**Goal:** Capture knowledge for the future.

**Tasks:**
- [ ] Update MEMORY.md with decisions/gotchas
- [ ] Add JSDoc for public APIs/components
- [ ] Update mo-arch docs if needed
- [ ] Add README notes if introducing new patterns
- [ ] Update CHANGELOG.md for significant features

**Documentation types:**

| Type | When | Where |
|------|------|-------|
| Inline comments | Complex logic | Code files |
| JSDoc | Public APIs/components | Code files |
| Architecture decisions | Major design choices | MEMORY.md |
| User-facing docs | New features | mo-arch/docs/ |
| API docs | New endpoints | mo-arch/docs/api/ |

**Tools:**
- doc-writer agent for extensive docs
- `/docs` command

---

### 9. Commit

**Goal:** Version control and create PR.

**Tasks:**
- [ ] Stage relevant files only
- [ ] Review staged changes (`git diff --staged`)
- [ ] Write clear commit message
- [ ] Create PR with description
- [ ] Link related issues

**Commit Message Format:**
```
<type>: <short description>

<detailed description>

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Types:** feat, fix, refactor, docs, test, chore

**Tools:**
- `/review staged` before committing
- `gh pr create` for PRs

---

### 10. Deploy & Monitor (Optional)

**Goal:** Ship to users and verify.

**Tasks:**
- [ ] Deploy to staging
- [ ] Smoke test on staging
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Gather user feedback

---

## Quick Reference

### For Simple Features (< 30 min)
```
1. Research (5 min)
2. Build (15 min)
3. Review (5 min)
4. Commit (5 min)
```

### For Medium Features (1-3 hrs)
```
1. Research (15 min)
2. Plan Architecture (15 min)
3. Build (1-2 hrs)
4. Write Tests (30 min)
5. Review (15 min)
6. Document (15 min)
7. Commit (10 min)
```

### For Complex Features (> 3 hrs)
```
1. Define Requirements (30 min)
2. Research (30 min)
3. Plan Architecture + User Approval (1 hr)
4. Build (2-4 hrs)
5. Write Tests (1 hr)
6. Review (30 min)
7. Verify (30 min)
8. Document (30 min)
9. Commit (15 min)
```

---

## Anti-Patterns to Avoid

❌ **Skip planning for complex features** - leads to rewrites
❌ **Document before building** - documentation becomes stale
❌ **Test at the very end** - bugs are harder to fix
❌ **No review step** - quality issues slip through
❌ **Commit without testing** - breaks main branch
❌ **Over-document simple code** - wastes time
❌ **Skip updating MEMORY.md** - knowledge is lost

---

## Workflow Variations

### Test-Driven Development (TDD)
```
1. Research
2. Plan Architecture
3. Write Tests ← Define behavior first
4. Build ← Implement to pass tests
5. Review
6. Document
7. Commit
```

### Spike/Prototype
```
1. Research
2. Quick prototype (no tests)
3. Demo to user
4. If approved → proper implementation
5. Follow full workflow
```

---

## Model Selection During Workflow

| Step | Recommended Model |
|------|-------------------|
| Research | Sonnet (fast exploration) |
| Plan Architecture (simple) | Sonnet |
| Plan Architecture (complex) | **Opus** (deep reasoning) |
| Build | Sonnet |
| Write Tests | Sonnet |
| Review | Sonnet |
| Document | Sonnet |

Use Opus when:
- Designing new system architecture
- Making critical database schema decisions
- Debugging complex multi-file issues
- Evaluating multiple architectural approaches
