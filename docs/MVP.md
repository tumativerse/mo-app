# Mo Fitness App — MVP Specification

## Problem Statement

I want to build muscle and reduce body fat (currently 165 lbs, 25% BF) through consistent strength training. Existing apps are either too complex, clunky to use mid-workout, or lock useful features behind paywalls. I need something simple that helps me follow a program, log quickly, and see progress.

## Target User

Me. For the next 3 months minimum.

## Goal

Build a minimal fitness app that I actually use every workout.

---

## MVP Features (v0.1)

### Must Have (Launch)

1. **Authentication** — Clerk (email/OAuth)
2. **Program library** — 1-2 pre-built programs (PPL, Upper/Lower)
3. **Today's workout** — Show what exercises to do today
4. **Quick logging** — Enter sets/reps/weight with minimal taps
5. **Workout history** — View past workouts
6. **Progress charts** — Weight lifted over time per exercise
7. **Body weight tracking** — Log and chart weight

### Not in MVP (Defer)

- Custom program builder
- AI coaching
- Exercise video demos
- Rest timers
- Social features / sharing
- Nutrition / calorie tracking
- Mobile native app (web-first, responsive)
- Admin panel
- Payments

---

## Data Model

### Core Tables
```
users
├── Basic profile (clerk_id, email, name)
├── Body metrics (height, weight, goal)
└── Preferences (units, goal)

exercises
├── name, slug, category, movementPattern
├── primaryMuscles, secondaryMuscles, equipment
├── difficulty, priority, exerciseUse (training/warmup/both)
└── instructions, tips, commonMistakes

exercise_relationships
├── exerciseId, relatedExerciseId
└── relationshipType (variation/progression/alternative)

weight_entries
├── user_id, date, weight

personal_records
├── exercise_id, weight, reps
└── estimated_1rm

streaks
├── current_streak, longest_streak
```

### PPL Training System (Phase 1)
```
program_templates
├── name, slug, description
├── daysPerWeek, goal, experienceLevel
└── isActive

template_days
├── templateId, dayNumber, name
├── dayType (push/pull/legs/upper/lower/full_body)
├── targetMuscles[], estimatedDuration
└── notes

template_slots (movement pattern slots, not fixed exercises)
├── dayId, slotOrder, slotType (primary/secondary/accessory/optional)
├── movementPattern (horizontal_push, squat, hinge, etc.)
├── targetMuscles[], sets, repRangeMin, repRangeMax
├── rpeTarget, restSeconds
└── notes, isOptional

user_preferences
├── userId, equipmentLevel (full_gym/home_gym/bodyweight)
├── preferredUnits, sessionDurationTarget
└── autoProgressionEnabled

user_exercise_defaults
├── userId, exerciseId
├── lastWeight, lastReps, lastRpe
└── preferredWeightUnit

recovery_logs
├── userId, date
├── sleepHours, sleepQuality (1-5)
├── energyLevel (1-5), overallSoreness (1-5)
├── sorenessAreas[], stressLevel (1-5)
└── notes
```

### Workout Sessions (Phase 1)
```
workout_sessions
├── userId, templateDayId, sessionNumber
├── status (planned/warmup/in_progress/completed/skipped)
├── startedAt, completedAt, totalDuration
├── totalVolume, totalSets, avgRpe
└── notes

session_exercises
├── sessionId, exerciseId, slotId
├── exerciseOrder, targetSets, targetReps
└── notes

session_sets
├── sessionExerciseId, setNumber
├── weight, weightUnit, reps, rpe
├── isWarmup, completedAt
└── notes
```

### Warmup System (Phase 1)
```
warmup_templates
├── name, dayType (push/pull/legs)
├── estimatedDuration, description
└── isActive

warmup_phases
├── templateId, phaseOrder, phaseType
├── name (general/dynamic/movement_prep)
├── durationSeconds, description

warmup_phase_exercises
├── phaseId, exerciseId, exerciseOrder
├── sets, reps, durationSeconds
└── notes

warmup_logs
├── userId, templateId, sessionId
├── completedAt, duration
└── skippedPhases[], notes
```

---

## API Endpoints (Phase 3)

### PPL Workout APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ppl/today` | GET | Get today's PPL workout based on rotation |
| `/api/ppl/session` | POST | Start a new workout session |
| `/api/ppl/session` | PATCH | Complete a workout session |
| `/api/ppl/session/sets` | POST | Log a set (weight, reps, RPE) |
| `/api/ppl/session/sets` | DELETE | Remove a set |

### Exercise APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/exercises/alternatives` | GET | Get alternative exercises for a slot |

**Query params:** `pattern`, `exerciseId`, `equipment`, `limit`

**Features:**
- Filters by movement pattern
- Scores by priority, user history, difficulty
- Returns direct alternatives from exercise_relationships

### Recovery APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recovery` | GET | Get recovery logs with summary stats |
| `/api/recovery` | POST | Log daily recovery (sleep, energy, soreness) |

**Query params:** `days` (default 7), `date` (specific day)

### Progression APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/progression` | GET | Get progression status & recommendations |

**Query params:** `exerciseId` (optional), `days` (default 14)

**Returns:**
- Fatigue score (0-7) based on RPE trends & recovery
- Exercises ready for progression
- Plateau detection
- Deload recommendations

---

## Tech Stack

| Layer | Choice | Status |
|-------|--------|--------|
| **Framework** | Next.js 15 (App Router) | ✅ Set up |
| **Language** | TypeScript | ✅ Set up |
| **Styling** | Tailwind CSS | ✅ Set up |
| **Database** | Neon (PostgreSQL) | ✅ Connected |
| **ORM** | Drizzle | ✅ Schema + Migrations |
| **Auth** | Clerk | ✅ Configured |
| **Charts** | Recharts | ✅ Installed |
| **Hosting** | Vercel | ✅ Deployed |

---

## Project Structure

```
mo-app/
├── app/
│   ├── (app)/                    # Authenticated routes
│   │   ├── dashboard/            # Home with today's workout
│   │   ├── workout/              # Active workout logging
│   │   ├── history/              # Past workouts
│   │   ├── progress/             # Charts & PRs
│   │   ├── weight/               # Weight tracking
│   │   └── programs/             # Program selection
│   ├── (auth)/                   # Login/signup
│   └── api/
│       ├── ppl/
│       │   ├── today/            # GET today's workout
│       │   └── session/          # POST/PATCH session + sets
│       ├── exercises/alternatives/
│       ├── training/status/      # Fatigue & deload status
│       ├── training/suggest/     # Weight suggestions
│       ├── progression/          # Progression analysis
│       ├── recovery/             # Recovery logging
│       ├── weight/               # Weight tracking
│       ├── streaks/              # Streak data
│       ├── records/              # Personal records
│       ├── preferences/          # User preferences
│       └── warmup/               # Warmup tracking
├── components/
│   ├── ui/                       # Base components (shadcn)
│   ├── dashboard-stats.tsx
│   ├── recovery-checkin.tsx
│   ├── weight-chart.tsx
│   └── strength-chart.tsx
├── lib/
│   ├── mo-self/                  # MO:SELF domain
│   │   ├── identity/auth.ts      # MoAuth
│   │   ├── preferences/settings.ts # MoSettings
│   │   ├── history/streaks.ts    # MoStreaks
│   │   ├── history/records.ts    # MoRecords
│   │   └── index.ts
│   ├── mo-pulse/                 # MO:PULSE domain
│   │   ├── move/warmup.ts        # MoWarmup
│   │   └── index.ts
│   ├── mo-coach/                 # MO:COACH domain
│   │   ├── adapt/fatigue.ts      # MoFatigue
│   │   ├── adapt/progression.ts  # MoProgress
│   │   ├── adapt/deload.ts       # MoDeload
│   │   ├── adapt/suggestions.ts  # MoSuggest
│   │   └── index.ts
│   ├── mo-connect/               # MO:CONNECT domain (placeholder)
│   │   └── index.ts
│   ├── db/
│   │   ├── index.ts              # Drizzle client
│   │   ├── schema.ts             # Full schema (~1190 lines)
│   │   ├── migrations/           # SQL migrations
│   │   ├── seed-exercises.ts     # Exercise library (~500 exercises)
│   │   ├── seed-ppl-template.ts  # PPL template (6 days, 36 slots)
│   │   └── seed-warmup-*.ts      # Warmup templates
│   └── utils.ts
└── docs/
    ├── MVP.md                    # This file
    └── ARCHITECTURE.md           # Mo Universe architecture
```

---

## Reused from mo-archive

| Category | Files | Lines Saved |
|----------|-------|-------------|
| UI Components | button, card, input, label | ~250 |
| Feature Components | charts, stats, workout card | ~500 |
| Database | schema (simplified from 1900 → 280) | N/A |
| Auth | Clerk integration | ~100 |
| Config | drizzle, env setup | ~50 |

**Skipped**: 22 coach components, 50+ API routes, 1600+ lines of coaching logic

---

## User Flows (v0.1)

### Flow 1: Start a Workout
```
Dashboard → "Start Workout" → See exercises → Log each set → Complete
```

### Flow 2: Log a Set
```
Exercise card → Tap set → Enter weight/reps → Save → Next set
```

### Flow 3: View Progress
```
Progress tab → Select exercise → See weight over time chart
```

---

## Success Criteria

**v0.1 is successful when:**

- [ ] I use it for every workout for 2 weeks
- [ ] Logging a set takes < 5 seconds
- [ ] I can see my bench/squat/deadlift progress charted
- [ ] The app doesn't confuse me or slow me down

---

## Implementation Progress

### Phase 1: Database Schema ✅
- [x] Configure Clerk auth
- [x] Set up Neon database
- [x] Run initial migration
- [x] Add PPL training system tables (13 new tables)
- [x] Add 6 new enums (exerciseUse, slotType, dayType, warmupPhaseType, equipmentLevel, sessionStatus)

### Phase 2: Seed Data ✅
- [x] Seed exercise library (~500 exercises)
- [x] Seed PPL template (6 days, 36 slots)
- [x] Seed warmup templates (3 templates, 9 phases)
- [x] Seed warmup exercises (30 exercises, 20 phase links)

### Phase 3: API Endpoints ✅
- [x] GET /api/ppl/today - Today's workout with rotation
- [x] POST/PATCH /api/ppl/session - Start/complete sessions
- [x] POST/DELETE /api/ppl/session/sets - Log sets
- [x] GET /api/exercises/alternatives - Exercise swaps
- [x] GET/POST /api/recovery - Recovery logging
- [x] GET /api/progression - Progression & fatigue tracking

### PPL Template Design
The PPL (Push/Pull/Legs) system uses **movement pattern slots** instead of fixed exercises:

| Day | Slots | Example Exercises |
|-----|-------|-------------------|
| **Push A** | Horizontal Push (primary), Vertical Push, Triceps, Side Delts | Bench Press, OHP, Tricep Pushdowns, Lateral Raises |
| **Push B** | Incline Push (primary), Vertical Push, Triceps, Chest Fly | Incline DB Press, Arnold Press, Skull Crushers, Cable Fly |
| **Pull A** | Vertical Pull (primary), Horizontal Pull, Biceps, Rear Delts | Pull-ups, Barbell Rows, Curls, Face Pulls |
| **Pull B** | Horizontal Pull (primary), Vertical Pull, Biceps, Rear Delts | Cable Rows, Lat Pulldowns, Hammer Curls, Reverse Fly |
| **Legs A** | Squat (primary), Hinge, Leg Curl, Calves | Squats, RDL, Leg Curls, Calf Raises |
| **Legs B** | Hinge (primary), Squat, Leg Extension, Calves | Deadlifts, Leg Press, Leg Extensions, Calf Raises |

**Key Features:**
- Exercises are suggested based on movement pattern, equipment, and user history
- Users can swap exercises within the same movement pattern
- RPE targets and rep ranges defined per slot
- Warmup templates specific to each day type

---

### Phase 4: Frontend Components ✅

#### Workout Page (`/app/(app)/workout/page.tsx`)
Complete rewrite with two-mode design:

**Mode A: Day Overview (Before Workout)**
- Shows all exercises/slots for the day
- Movement pattern badges (primary/secondary/accessory)
- Target muscles and estimated duration
- Warmup section (collapsible) showing all phases
- Swap exercise button per slot
- "Start Workout" button

**Mode B: Focused Exercise View (During Workout)**
- Full-page single exercise focus
- Progress dots navigation (● ● ○ ○ ○ ○)
- Exercise header with muscles and equipment badges
- Previous performance display (last weight × reps @ RPE)
- Large set logging grid:
  ```
  Set 1: [weight] × [reps] @ RPE [selector]  ✓
  Set 2: [weight] × [reps] @ RPE [selector]
  + Add Set
  ```
- Rest timer (auto-starts after logging set)
- Tips & form cues section (collapsible)
- Previous/Next navigation buttons
- "View All" toggle to return to overview
- Workout notes textarea
- "Complete Workout" button when all sets done
- Summary modal with stats (duration, sets, volume, avg RPE)

**Exercise Swap Modal (built into workout page)**
- Fetches alternatives from `/api/exercises/alternatives`
- Filters by movement pattern
- Shows equipment badges
- "Previously used" indicator
- Current selection highlighted

#### Recovery Check-in Component (`/components/recovery-checkin.tsx`)
Reusable component with two modes:

**Compact Mode (for dashboard)**
- Sleep hours input
- Energy level (1-5 buttons)
- Soreness level (1-5 buttons)
- Quick submit

**Full Mode**
- Sleep duration (hours input)
- Sleep quality (1-5: Poor → Great)
- Energy level (1-5: Low → High)
- Muscle soreness (1-5: None → Severe)
- Stress level (1-5: Low → High)
- Submit to `/api/recovery`

#### Dashboard Updates (`/app/(app)/dashboard/page.tsx`)
- Recovery check-in prompt (if not logged today)
- Recovery summary display (if already logged)
- Quick actions: Log Weight, View Progress
- Link to new Progress page

#### Progression Dashboard (`/app/(app)/progress/page.tsx`)
New analytics page:

**Fatigue Score Gauge**
- Score 0-7 with visual gauge
- Status levels: normal (green), monitor (yellow), deload (red)
- Message and recommended action

**Quick Stats**
- Sessions count (in selected period)
- Average session RPE

**Recovery Averages**
- Average sleep hours
- Average energy level
- Average soreness

**Ready to Progress Section**
- Exercises where user hit all reps at RPE ≤ 8
- Recommendation to add 2.5-5 lbs

**Plateaued Section**
- Exercises stuck at same weight for 4+ sessions
- Suggestions: different rep range, variation, deload

**Time Range Selector**
- 7, 14, or 30 day analysis

---

#### Phase 4 Files Summary

| File | Lines | Description |
|------|-------|-------------|
| `/app/(app)/workout/page.tsx` | ~1,270 | PPL workout page with two-mode design |
| `/components/recovery-checkin.tsx` | ~180 | Recovery check-in component |
| `/app/(app)/dashboard/page.tsx` | ~290 | Updated dashboard with recovery |
| `/app/(app)/progress/page.tsx` | ~280 | Progression analytics page |

---

### Phase 5: Logic & Auto-Regulation ✅

#### Database Schema Additions
- `fatigue_logs` table - Daily fatigue snapshots with component scores
- `deload_periods` table - Track deload weeks and triggers
- `deload_type` enum - volume, intensity, full_rest
- `fatigue_level` enum - fresh, normal, elevated, high, critical

#### Training Logic Library (`/lib/training-logic/`)

**Fatigue Calculation** (`fatigue.ts`)
- 0-10 scale fatigue score based on multiple factors:
  - RPE creep (0-2 points): Are workouts getting harder?
  - Performance drop (0-2 points): High average RPE?
  - Recovery debt (0-3 points): Sleep, energy, soreness metrics
  - Volume load (0-2 points): Volume spike vs baseline
  - Training streak (0-1 point): Consecutive training days
- Status levels: fresh (0-2), normal (3-4), elevated (5-6), high (7-8), critical (9-10)
- Auto-logs to database for trend tracking

**Progression Gates** (`progression.ts`)
- Checks multiple gates before allowing weight progression:
  1. Fatigue score (blocks if ≥7)
  2. Recent performance (hit target reps?)
  3. Average RPE (under threshold?)
  4. Recovery metrics (adequate sleep/energy?)
- Different rules for compound vs isolation exercises
- Plateau detection (4+ sessions at same weight)
- Plateau-breaking strategies

**Deload Detection** (`deload.ts`)
- Auto-triggers deload based on:
  - Scheduled (every 4 weeks)
  - Sustained critical fatigue (2+ days at score ≥8)
  - Prolonged elevated fatigue (5+ days at score ≥6)
  - High fatigue + poor recovery combo
- Deload types:
  - Volume: 60% sets, 100% weight
  - Intensity: 70% sets, 85% weight
  - Full rest: Complete rest days
- Applies modifiers to workout suggestions

**Weight Suggestions** (`suggestions.ts`)
- Suggests weight based on:
  - User's last performance on exercise
  - Current fatigue level
  - Active deload modifiers
  - Progression readiness
- Warmup set progression (50% → 70% → 85%)
- Rest timer configuration by slot type and RPE

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ppl/today` | GET | Enhanced with fatigue, deload, modifiers |
| `/api/progression` | GET | Uses training-logic for enhanced analysis |
| `/api/training/status` | GET | Current fatigue score, deload status |
| `/api/training/status` | POST | Trigger/end deload manually |
| `/api/training/suggest` | GET | Weight suggestions for exercise |
| `/api/training/suggest` | POST | Get suggestion after completing set |

#### Frontend Updates

**Dashboard** (`/app/(app)/dashboard/page.tsx`)
- Fatigue indicator card with score and level
- Deload active/recommended banners
- Color-coded status (green/yellow/orange/red)

**Workout Page** (`/app/(app)/workout/page.tsx`)
- Fatigue warning banner when score ≥6
- Deload week indicator with days remaining
- Rotation message for breaks ("Ease back in", "Starting fresh")
- Volume modifier display during deload

#### Phase 5 Files Summary

| File | Lines | Description |
|------|-------|-------------|
| `/lib/training-logic/fatigue.ts` | ~230 | Fatigue calculation & status |
| `/lib/training-logic/progression.ts` | ~280 | Progression gates & recommendations |
| `/lib/training-logic/deload.ts` | ~170 | Deload detection & management |
| `/lib/training-logic/suggestions.ts` | ~200 | Weight & set suggestions |
| `/lib/training-logic/index.ts` | ~50 | Library exports |
| `/app/api/training/status/route.ts` | ~130 | Training status endpoint |
| `/app/api/training/suggest/route.ts` | ~100 | Weight suggestion endpoint |
| `/lib/db/schema.ts` | +80 | fatigue_logs, deload_periods tables |

---

### Phase 6: Deploy & Iterate ✅
- [x] Deploy to Vercel
- [ ] Use for 2 weeks
- [ ] Adjust fatigue thresholds based on real usage
- [ ] Fine-tune progression rules

---

### Phase 7: Mo Universe Architecture ✅

Reorganized codebase into domain-based architecture and wired up previously built database schemas.

#### Architecture Reorganization
- [x] Created Mo Universe directory structure (`/lib/mo-*`)
- [x] Moved auth to `/lib/mo-self/identity/`
- [x] Moved training-logic to `/lib/mo-coach/adapt/`
- [x] Created barrel exports for clean imports
- [x] Updated all 15+ API route imports

#### New Systems Wired Up

**MoStreaks** (`/lib/mo-self/history/streaks.ts`)
- 48-hour window for streak maintenance
- Auto-updates on workout completion
- Motivational messages by streak status
- `GET /api/streaks` - Current streak + stats

**MoRecords** (`/lib/mo-self/history/records.ts`)
- Auto-detects PRs when sets are logged
- Brzycki formula for estimated 1RM
- PR history per exercise
- `GET /api/records` - All PRs

**MoSettings** (`/lib/mo-self/preferences/settings.ts`)
- Training preferences (frequency, duration, goals)
- Equipment level (full_gym/home_gym/bodyweight)
- Warmup settings
- `GET/PATCH /api/preferences`

**MoWarmup** (`/lib/mo-pulse/move/warmup.ts`)
- Start/progress/complete/skip warmup
- Template integration by day type
- Phase completion tracking
- `GET/POST /api/warmup`

#### Auto-hooks Added
- Streak updates on session completion (`PATCH /api/ppl/session`)
- PR detection on set logging (`POST /api/ppl/session/sets`)

#### Phase 7 Files Summary

| File | Lines | Description |
|------|-------|-------------|
| `/lib/mo-self/history/streaks.ts` | ~230 | Streak tracking + motivation |
| `/lib/mo-self/history/records.ts` | ~250 | PR detection + history |
| `/lib/mo-self/preferences/settings.ts` | ~180 | User preferences |
| `/lib/mo-pulse/move/warmup.ts` | ~220 | Warmup tracking |
| `/app/api/streaks/route.ts` | ~30 | Streaks endpoint |
| `/app/api/records/route.ts` | ~30 | PRs endpoint |
| `/app/api/preferences/route.ts` | ~65 | Preferences endpoint |
| `/app/api/warmup/route.ts` | ~110 | Warmup endpoint |

---

## Archive Reference

Previous complex version archived at:
```
/Users/stumati/Developer/mo-archive/
```

Contains: AI coaching system, plan builder, nutrition tracking, and more.
Can cherry-pick features later if needed.
