# Project Memory

This file contains persistent context about the Mo app that should be preserved across sessions.

**Last Updated:** 2026-01-02

---

## Current State (January 2026)

### Phase: Pre-Production Development

**Status:** Infrastructure complete, ready for feature development

**Recent Milestones:**

- ✅ Complete quality workflow implemented (27 gates, 100% coverage)
- ✅ GitHub Actions CI/CD configured
- ✅ SonarCloud integration with quality gates
- ✅ Pre-commit and pre-push hooks optimized
- ✅ 378 passing tests with 100% coverage
- ✅ Database schema encrypted (AES-256-GCM)
- ✅ PPL workout system foundation built

**Next Up:**

- Start building user-facing features
- Implement workout session flow
- Build progress tracking UI

---

## Architecture Decisions

### Workout System: PPL (Push/Pull/Legs)

**Why PPL?**

- Balanced muscle recovery between sessions
- Flexible scheduling (3-6 days/week)
- Clear exercise categorization by movement pattern
- Industry-standard split for intermediate+ lifters

**Template Slots Design:**

- Movement pattern slots instead of fixed exercises
- Allows exercise variation within patterns (e.g., barbell bench → dumbbell bench)
- Supports different equipment levels (full gym, home gym, bodyweight)
- Enables intelligent substitutions based on user equipment

**Database Flow:**

```
programTemplates → templateDays → templateSlots (movement patterns)
                                         ↓
workoutSessions → sessionExercises (actual exercises) → sessionSets
```

### Security: Encrypted PII

**Decision:** Encrypt all personally identifiable information
**Implementation:** AES-256-GCM encryption for:

- Full name
- Date of birth
- Height, weight
- Health conditions, injuries
- Medications

**Why:** HIPAA-like protection even though not medically required

### Quality: 100% Test Coverage

**Decision:** Enforce 100% coverage on all business logic
**Why:**

- Fitness data is sensitive - bugs can cause injury
- Solo developer - need automated safety net
- Prevents regressions during rapid development

---

## Deprecated Systems

### Old Workout System (Pre-PPL)

**Tables (still exist, not used):**

- `programs`, `programDays`, `userPrograms`
- `workouts`, `workoutSets`

**Status:** Marked for deletion after PPL migration complete
**Migration:** Not needed - fresh users only

---

## Technology Stack

### Core

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM
- **Auth:** Clerk

### Frontend

- **Styling:** TailwindCSS 4
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Notifications:** Sonner toasts
- **Charts:** Recharts

### Backend

- **Validation:** Zod schemas
- **Encryption:** crypto (Node.js built-in)
- **Security:** AES-256-GCM

### Testing & Quality

- **Unit/Integration:** Vitest + Testing Library
- **E2E:** Playwright
- **Accessibility:** Axe-core + Playwright
- **Coverage:** 100% enforced (V8)
- **Linting:** ESLint 9
- **Formatting:** Prettier
- **Type Checking:** TypeScript strict
- **Code Quality:** SonarCloud
- **Security:** Secretlint, npm audit, Snyk

### CI/CD

- **Platform:** GitHub Actions
- **Deployment:** Vercel
- **Quality Gates:** 27 checks across 4 layers
- **Monitoring:** Codecov, SonarCloud, Lighthouse CI

---

## Key Gotchas

### 1. Movement Patterns (Strict Enum)

Movement patterns must match enum values exactly:

```typescript
// ✅ CORRECT
movementPattern: 'horizontal_push';
movementPattern: 'vertical_pull';

// ❌ WRONG
movementPattern: 'incline_push'; // Not in enum
movementPattern: 'Horizontal Push'; // Wrong case
```

**Enum values:**

- Push: `horizontal_push`, `vertical_push`, `chest_isolation`, `tricep_isolation`, `shoulder_isolation`
- Pull: `horizontal_pull`, `vertical_pull`, `rear_delt`, `bicep_isolation`, `forearm`
- Legs: `hip_hinge`, `squat`, `lunge`, `leg_curl`, `leg_extension`, `calf`, `core`

### 2. Clerk Authentication

All API routes **must** check authentication:

```typescript
import { getCurrentUser } from '@/lib/mo-self';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of logic
}
```

### 3. Equipment Levels

Must match exact enum values:

- `full_gym` - Commercial gym equipment
- `home_gym` - Home gym setup (rack, barbell, dumbbells)
- `bodyweight` - No equipment

### 4. Seeding Exercises

Requires `MO_DOCS_PATH` environment variable:

```bash
export MO_DOCS_PATH=/path/to/mo-docs
npx tsx lib/db/seed-exercises.ts
```

### 5. Encrypted Data Access

Always use encryption utilities:

```typescript
import { encrypt, decrypt } from '@/lib/security/encryption';

// Writing
const encrypted = encrypt(sensitiveData);
await db.insert(users).values({ ...data, fullName: encrypted });

// Reading
const user = await db.select().from(users).where(...);
const decrypted = decrypt(user.fullName);
```

### 6. Test Coverage

Creating new testable code **requires** tests:

```bash
# ❌ This will fail pre-commit
touch lib/utils/new-utility.ts
git add .
git commit -m "feat: add utility"
# Error: Source files changed but no test files modified

# ✅ This will pass
touch lib/utils/new-utility.ts
touch lib/utils/new-utility.test.ts
git add .
git commit -m "feat: add utility"
```

---

## Frequently Referenced Files

### Database

- `lib/db/schema.ts` - Complete database schema
- `lib/db/seed-ppl-template.ts` - PPL program seeder
- `lib/db/seed-exercises.ts` - 756 exercise seeder

### API Routes

- `app/api/onboarding/route.ts` - User onboarding flow
- `app/api/preferences/route.ts` - User preferences
- `app/api/user/profile/route.ts` - User profile (encrypted)
- `app/api/webhooks/clerk/route.ts` - Clerk webhook handler

### Business Logic

- `lib/mo-self/` - User management (auth, profile, preferences, streaks, PRs)
- `lib/mo-coach/` - Training intelligence (fatigue, progression, deload, suggestions)
- `lib/mo-pulse/` - Movement features (warmup templates, execution)
- `lib/security/encryption.ts` - AES-256-GCM encryption utilities

### Configuration

- `.claude/WORKFLOW_GUIDE.md` - Complete development workflow
- `.husky/pre-commit` - 6 quality checks
- `.husky/pre-push` - 21 quality checks
- `.github/workflows/` - CI/CD workflows

---

## Environment Variables

### Required (Production)

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Encryption (Generate: openssl rand -hex 32)
ENCRYPTION_KEY="64-char-hex-string"
```

### Development Only

```bash
# For seeding exercises
MO_DOCS_PATH="/path/to/mo-docs"

# For SonarCloud local analysis
SONAR_TOKEN="your-sonar-token"
```

---

## Known Issues

**None currently tracked.**

When issues are discovered, add them here with:

- **Issue:** Description
- **Workaround:** Temporary solution
- **Fix planned:** When/how it will be fixed

---

## User Preferences & Patterns

### Solo Developer Workflow

- **No PR requirement** - Direct pushes to `main`
- **Quality over speed** - Comprehensive validation enforced
- **100% coverage** - No compromises on test coverage
- **Conventional commits** - Enforced via commitlint

### Code Style Preferences

- **Verbosity:** Clear variable names over brevity
- **Comments:** Only where logic isn't self-evident
- **Error handling:** Comprehensive, with specific error messages
- **Type safety:** Strict TypeScript, no `any` types

---

_Update this file when discovering important context that should persist across sessions._
