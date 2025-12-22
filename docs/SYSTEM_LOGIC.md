# Mo Fitness App - System Logic Documentation

> Complete reference for all training logic, auto-regulation, and progression systems.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Fatigue System](#fatigue-system)
3. [Progression System](#progression-system)
4. [Deload System](#deload-system)
5. [Day Rotation](#day-rotation)
6. [Weight Suggestions](#weight-suggestions)
7. [Recovery Integration](#recovery-integration)
8. [API Reference](#api-reference)
9. [Database Schema](#database-schema)

---

## System Overview

### User Workflow

```
1. Open App        → See today's workout + fatigue status
2. Log Recovery    → Sleep, energy, soreness (optional daily)
3. Start Workout   → View exercises with suggested weights
4. Log Sets        → Weight × reps @ RPE
5. Complete        → See summary, update progression status
6. Track Progress  → View trends, get recommendations
```

### Core Principles

1. **Prevent Overtraining** - Fatigue tracking blocks progression when recovery is poor
2. **Auto-Regulate** - System adjusts based on performance and recovery data
3. **Progressive Overload** - Structured weight increases when ready
4. **Intelligent Deloads** - Automatic detection and scheduling

---

## Fatigue System

### Fatigue Score Calculation (0-10)

The fatigue score is calculated from 5 factors:

```
Total Score = RPE Creep + Performance + Recovery Debt + Volume Load + Streak
```

| Factor | Points | How It's Calculated |
|--------|--------|---------------------|
| **RPE Creep** | 0-2 | Compare recent RPE avg to earlier sessions. If RPE increasing by >0.5, add 2 points |
| **Performance Drop** | 0-2 | If average RPE across recent sessions >8.5, add 2 points |
| **Recovery Debt** | 0-3 | Sleep <6h (+1), Sleep <5h (+2), Energy <3 (+1), Soreness >4 (+1) |
| **Volume Load** | 0-2 | If weekly volume >120% of baseline (+1), >140% (+2) |
| **Training Streak** | 0-1 | If 5+ consecutive training days, add 1 point |

### Fatigue Levels

| Score | Level | Color | Message | Recommended Action |
|-------|-------|-------|---------|-------------------|
| 0-2 | Fresh | Green | "Well recovered" | Train normally, can push intensity |
| 3-4 | Normal | Green | "Normal training fatigue" | Continue as planned |
| 5-6 | Elevated | Yellow | "Fatigue accumulating" | Monitor closely, prioritize recovery |
| 7-8 | High | Orange | "High fatigue - deload recommended" | Take deload week or reduce volume 40% |
| 9-10 | Critical | Red | "Risk of overtraining" | Mandatory rest day or very light session |

### Fatigue Logging

- Fatigue is calculated and logged daily when user accesses `/api/ppl/today` or `/api/progression`
- Historical fatigue data stored in `fatigue_logs` table
- Component scores saved for debugging/analysis
- Used for trend detection and deload triggers

---

## Progression System

### Progression Gates

Before suggesting a weight increase, the system checks 4 gates. ALL must pass:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PROGRESSION GATES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Gate 1: FATIGUE                                                │
│  ├── Check: Is fatigue score < 7?                               │
│  ├── BLOCK: "High fatigue - maintain or reduce weight"          │
│  └── Blocked by: 'fatigue'                                      │
│                                                                 │
│  Gate 2: PERFORMANCE                                            │
│  ├── Check: Did user hit target reps in last N sessions?        │
│  ├── BLOCK: "Didn't hit target reps in recent sessions"         │
│  └── Blocked by: 'performance'                                  │
│                                                                 │
│  Gate 3: RPE MARGIN                                             │
│  ├── Check: Is average RPE ≤ threshold?                         │
│  ├── BLOCK: "RPE too high - need more margin"                   │
│  └── Blocked by: 'rpe'                                          │
│                                                                 │
│  Gate 4: RECOVERY                                               │
│  ├── Check: Is recovery debt score < 2?                         │
│  ├── BLOCK: "Recovery metrics suboptimal"                       │
│  └── Blocked by: 'recovery'                                     │
│                                                                 │
│  ALL PASS → canProgress: true                                   │
│             "Ready to progress: Add X lbs next session"         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Progression Rules by Exercise Type

| Exercise Type | Min Reps for Progress | Max RPE for Progress | Weight Increment | Sessions Required |
|---------------|----------------------|---------------------|------------------|-------------------|
| **Compound** (squat, bench, deadlift, rows, etc.) | 8 reps | RPE 8 | 5 lbs | 2 consecutive |
| **Isolation** (curls, extensions, raises, etc.) | 10 reps | RPE 7 | 2.5 lbs | 1 session |

### Progression Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| `ready` | All gates passed, ready to add weight | Suggest new weight |
| `maintain` | Not ready yet, keep current weight | Show current weight |
| `plateau` | Same weight for 4+ sessions | Suggest plateau-breaking strategies |
| `regress` | Recent RPE >9.5, weight too heavy | Suggest reducing weight |

### Plateau Detection & Breaking

**Plateau Detected When:**
- Same weight used for 4+ consecutive sessions
- Not hitting target reps consistently

**Plateau-Breaking Strategies:**

| Strategy | Description | Duration |
|----------|-------------|----------|
| Rep Range Shift | Try 6-8 reps instead of 8-12 to build strength | 2-3 weeks |
| Variation Swap | Switch to similar exercise (e.g., incline instead of flat) | 4 weeks |
| Volume Increase | Add 1-2 sets per session for this exercise | 2 weeks |
| Deload Then Push | Take deload week, come back at 90% and rebuild | 2 weeks |

---

## Deload System

### Deload Triggers

The system checks for deload needs in this priority order:

```
┌─────────────────────────────────────────────────────────────────┐
│                     DELOAD CHECKS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Check 1: SCHEDULED                                             │
│  ├── Trigger: Weeks since last deload ≥ 4                       │
│  ├── Type: Volume deload                                        │
│  ├── Duration: 7 days                                           │
│  └── Modifiers: 60% volume, 100% intensity                      │
│                                                                 │
│  Check 2: CRITICAL FATIGUE                                      │
│  ├── Trigger: Fatigue score ≥ 8 for 2+ days                     │
│  ├── Type: Full rest                                            │
│  ├── Duration: 3 days                                           │
│  └── Modifiers: 0% volume, 0% intensity                         │
│                                                                 │
│  Check 3: PROLONGED ELEVATED FATIGUE                            │
│  ├── Trigger: Fatigue score ≥ 6 for 5+ days                     │
│  ├── Type: Volume deload                                        │
│  ├── Duration: 5 days                                           │
│  └── Modifiers: 50% volume, 90% intensity                       │
│                                                                 │
│  Check 4: HIGH FATIGUE + POOR RECOVERY                          │
│  ├── Trigger: Fatigue ≥ 7 AND recovery debt ≥ 2                 │
│  ├── Type: Intensity deload                                     │
│  ├── Duration: 5 days                                           │
│  └── Modifiers: 70% volume, 85% intensity                       │
│                                                                 │
│  None triggered → No deload needed                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Deload Types

| Type | Volume Modifier | Intensity Modifier | When to Use |
|------|-----------------|-------------------|-------------|
| **Volume** | 60% (fewer sets) | 100% (same weight) | Scheduled deloads, moderate fatigue |
| **Intensity** | 70% | 85% (lighter weight) | High fatigue with poor recovery |
| **Full Rest** | 0% | 0% | Critical fatigue, risk of injury |

### Deload Application

When deload is active:
1. `volumeModifier` applied to target sets (e.g., 4 sets → 2-3 sets)
2. `intensityModifier` applied to suggested weights (e.g., 100 lbs → 85 lbs)
3. Banner shown on workout page with days remaining
4. Progression blocked during deload period

---

## Day Rotation

### PPL 6-Day Rotation

```
Day 1: Push A  (Horizontal push primary)
Day 2: Pull A  (Vertical pull primary)
Day 3: Legs A  (Squat primary)
Day 4: Push B  (Incline push primary)
Day 5: Pull B  (Horizontal pull primary)
Day 6: Legs B  (Hinge primary)
→ Repeat
```

### Rotation Logic

```
Normal Progression:
├── Get last completed session's day number
├── Advance to next day (wrap at 6 → 1)
└── Return that day's template

After Extended Break:
├── IF 3-6 days since last workout:
│   ├── Continue normal rotation
│   ├── Apply 90% intensity modifier
│   └── Show message: "Ease back in after break"
│
└── IF 7+ days since last workout:
    ├── Reset to Day 1
    ├── Apply 85% intensity modifier
    └── Show message: "Starting fresh after extended break"

During Deload:
├── Continue normal rotation
├── Apply deload modifiers
└── Show message: "Deload week: X% volume"
```

### Rotation Messages

| Condition | Message |
|-----------|---------|
| 3-6 days off | "Ease back in after break" |
| 7+ days off | "Starting fresh after extended break" |
| Deload active | "Deload week: 60% volume" |
| Normal | (no message) |

---

## Weight Suggestions

### Suggestion Algorithm

```
1. Get user's last weight for this exercise (from userExerciseDefaults)

2. IF no history:
   └── Return starting weight (95 lbs compound, 20 lbs isolation)

3. Apply adjustments in order:

   a. Progression check:
      └── IF progression status = 'ready' AND set 1 AND not warmup
          └── Add weight increment (5 or 2.5 lbs)

   b. Fatigue adjustment:
      ├── IF fatigue score 6-7 → multiply by 0.90
      └── IF fatigue score 8+ → multiply by 0.85

   c. Deload adjustment:
      └── IF deload active → multiply by intensityModifier

   d. Warmup adjustment:
      └── IF warmup set → apply warmup percentage

4. Round to nearest 5 lbs

5. Return suggestion with confidence level
```

### Warmup Progression

| Set | Percentage | Reps |
|-----|------------|------|
| Warmup 1 | 50% of working weight | 10 |
| Warmup 2 | 70% of working weight | 6 |
| Warmup 3 | 85% of working weight | 3 |

### Post-Set Suggestions

After completing a set, compare actual RPE to target:

```
RPE Difference = Actual RPE - Target RPE

┌───────────┬─────────────────────────────────────────────────────┐
│ Diff      │ Suggestion                                          │
├───────────┼─────────────────────────────────────────────────────┤
│ ≥ +2      │ "Consider reducing weight by 5-10%"                 │
│           │ OR "Consider ending here" (if near last set)        │
├───────────┼─────────────────────────────────────────────────────┤
│ +1        │ "Harder than target - maintain weight next set"     │
├───────────┼─────────────────────────────────────────────────────┤
│ 0         │ (no message - on target)                            │
├───────────┼─────────────────────────────────────────────────────┤
│ -1        │ "Good session - consider adding weight next time"   │
│           │ (shown on last set only)                            │
├───────────┼─────────────────────────────────────────────────────┤
│ ≤ -2      │ "Feeling strong? Add a bonus set"                   │
│           │ (shown on last set only, if hit all reps)           │
└───────────┴─────────────────────────────────────────────────────┘
```

---

## Recovery Integration

### Recovery Data Collection

Users can log daily (via dashboard or recovery page):

| Metric | Range | Impact on Fatigue |
|--------|-------|-------------------|
| Sleep Hours | 0-24 | <6h: +1 fatigue, <5h: +2 fatigue |
| Sleep Quality | 1-5 | Currently tracked, not used in score |
| Energy Level | 1-5 | <3: +1 fatigue |
| Soreness | 1-5 | >4: +1 fatigue |
| Stress Level | 1-5 | Currently tracked, not used in score |

### Recovery Averages

The progression page shows rolling averages:
- Average sleep (last N days)
- Average energy (last N days)
- Average soreness (last N days)

### Recovery Impact on Training

```
Low Sleep (<6h avg over 3 days):
├── +1 fatigue point
├── Blocks progression (recovery gate)
└── Recommendation: "Low sleep - aim for 7+ hours"

Very Low Sleep (<5h):
├── +2 fatigue points
└── Recommendation: "Severe sleep debt - prioritize 7+ hours"

Low Energy (<3 avg):
├── +1 fatigue point
├── Blocks progression (recovery gate)
└── Recommendation: "Low energy levels - consider rest day"

High Soreness (>4 avg):
├── +1 fatigue point
└── Recommendation: "High muscle soreness - allow recovery"
```

---

## API Reference

### Training Status

```
GET /api/training/status

Response:
{
  fatigue: {
    score: 4,
    level: "normal",
    color: "green",
    message: "Normal training fatigue",
    action: "Continue as planned",
    factors: { rpeCreep: 0, performanceDrop: 1, recoveryDebt: 2, volumeLoad: 1, streak: 0 }
  },
  deload: {
    status: "none" | "active" | "recommended",
    type?: "volume" | "intensity" | "full_rest",
    daysRemaining?: 5,
    reason?: "Scheduled deload week"
  },
  canTrain: true,
  shouldReduce: false
}
```

### Trigger/End Deload

```
POST /api/training/status

Body (start deload):
{
  action: "start_deload",
  deloadType?: "volume",  // optional, uses system recommendation if omitted
  durationDays?: 7        // optional
}

Body (end deload):
{
  action: "end_deload"
}
```

### Weight Suggestions

```
GET /api/training/suggest?exerciseId=xxx&setNumber=1&isWarmup=false

Response:
{
  weight: {
    suggestedWeight: 135,
    confidence: "high",
    basis: "Based on last session: 130 lbs",
    isDeload: false
  },
  restTimer: {
    defaultSeconds: 120,
    autoStart: true,
    alertAt: [30, 10]
  },
  warmupSets: [
    { setNumber: 1, weight: 65, reps: 10, percentage: 50 },
    { setNumber: 2, weight: 95, reps: 6, percentage: 70 },
    { setNumber: 3, weight: 115, reps: 3, percentage: 85 }
  ]
}
```

### Post-Set Suggestion

```
POST /api/training/suggest

Body:
{
  setNumber: 2,
  totalSets: 4,
  completedReps: 8,
  targetReps: 8,
  rpe: 9,
  targetRpe: 7.5
}

Response:
{
  action: "reduce",
  message: "Consider reducing weight by 5-10%",
  suggestedWeightChange: -10
}
```

---

## Database Schema

### fatigue_logs

```sql
CREATE TABLE fatigue_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  date TIMESTAMP NOT NULL,

  -- Calculated score
  fatigue_score INTEGER NOT NULL,        -- 0-10
  fatigue_level fatigue_level NOT NULL,  -- enum

  -- Component scores (for analysis)
  rpe_creep_score INTEGER DEFAULT 0,     -- 0-2
  performance_score INTEGER DEFAULT 0,   -- 0-2
  recovery_debt_score INTEGER DEFAULT 0, -- 0-3
  volume_load_score INTEGER DEFAULT 0,   -- 0-2
  streak_score INTEGER DEFAULT 0,        -- 0-1

  recommendations TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, date)
);
```

### deload_periods

```sql
CREATE TABLE deload_periods (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),

  -- Timing
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  duration_days INTEGER NOT NULL,

  -- Configuration
  deload_type deload_type NOT NULL,           -- 'volume', 'intensity', 'full_rest'
  volume_modifier DECIMAL(3,2) DEFAULT 0.60,  -- e.g., 0.60 = 60%
  intensity_modifier DECIMAL(3,2) DEFAULT 1.00,

  -- Trigger info
  trigger_reason VARCHAR(100) NOT NULL,       -- 'scheduled', 'fatigue_high', 'manual'
  fatigue_score_at_trigger INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMP,

  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Enums

```sql
CREATE TYPE fatigue_level AS ENUM (
  'fresh',     -- 0-2
  'normal',    -- 3-4
  'elevated',  -- 5-6
  'high',      -- 7-8
  'critical'   -- 9-10
);

CREATE TYPE deload_type AS ENUM (
  'volume',     -- Reduce sets, keep weight
  'intensity',  -- Reduce weight, fewer sets
  'full_rest'   -- Complete rest
);
```

---

## Flow Diagrams

### Overall System Flow

```
                    ┌─────────────────┐
                    │   User Opens    │
                    │      App        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Calculate     │
                    │ Fatigue Score   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │  Log to   │ │  Check    │ │  Display  │
        │    DB     │ │  Deload   │ │  Status   │
        └───────────┘ └─────┬─────┘ └───────────┘
                            │
                   ┌────────┴────────┐
                   │                 │
                   ▼                 ▼
             Deload Needed      No Deload
                   │                 │
                   ▼                 ▼
            ┌────────────┐    ┌────────────┐
            │   Apply    │    │   Normal   │
            │  Modifiers │    │  Workout   │
            └─────┬──────┘    └─────┬──────┘
                  │                 │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  User Starts    │
                  │    Workout      │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Get Weight     │
                  │  Suggestions    │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   User Logs     │
                  │     Sets        │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Post-Set       │
                  │  Suggestions    │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │    Complete     │
                  │    Workout      │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Update User    │
                  │   Defaults      │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Check Progress  │
                  │  Gates for      │
                  │  Next Session   │
                  └─────────────────┘
```

### Progression Decision Flow

```
                    ┌─────────────────┐
                    │  Can Progress?  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Gate 1: Fatigue │
                    │   Score < 7?    │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                   Yes               No
                    │                 │
                    ▼                 ▼
           ┌─────────────┐    ┌─────────────┐
           │   Gate 2:   │    │    BLOCK    │
           │ Hit Reps?   │    │  (fatigue)  │
           └──────┬──────┘    └─────────────┘
                  │
         ┌────────┴────────┐
         │                 │
        Yes               No
         │                 │
         ▼                 ▼
  ┌─────────────┐   ┌─────────────┐
  │   Gate 3:   │   │    BLOCK    │
  │ RPE ≤ Max?  │   │(performance)│
  └──────┬──────┘   └─────────────┘
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    ▼         ▼
┌────────┐ ┌─────────────┐
│ Gate 4:│ │    BLOCK    │
│Recovery│ │    (rpe)    │
│ OK?    │ └─────────────┘
└───┬────┘
    │
┌───┴───┐
│       │
Yes     No
│       │
▼       ▼
PASS    BLOCK
        (recovery)
```

---

## Configuration Constants

### Fatigue Thresholds

```typescript
const FATIGUE_THRESHOLDS = {
  fresh: { min: 0, max: 2 },
  normal: { min: 3, max: 4 },
  elevated: { min: 5, max: 6 },
  high: { min: 7, max: 8 },
  critical: { min: 9, max: 10 },
};

const FATIGUE_BLOCKS_PROGRESSION = 7;
const FATIGUE_TRIGGERS_DELOAD = 8;
```

### Progression Rules

```typescript
const PROGRESSION_RULES = {
  compound: {
    minRepsForProgress: 8,
    maxRpeForProgress: 8,
    weightIncrement: 5,
    sessionsRequired: 2,
  },
  isolation: {
    minRepsForProgress: 10,
    maxRpeForProgress: 7,
    weightIncrement: 2.5,
    sessionsRequired: 1,
  },
};

const PLATEAU_THRESHOLD_SESSIONS = 4;
```

### Deload Configuration

```typescript
const DELOAD_SCHEDULE_WEEKS = 4;

const DELOAD_MODIFIERS = {
  volume: { volume: 0.6, intensity: 1.0 },
  intensity: { volume: 0.7, intensity: 0.85 },
  full_rest: { volume: 0, intensity: 0 },
};
```

### Rest Timer Defaults

```typescript
const REST_TIMERS = {
  compound_heavy: { seconds: 180, alertAt: [30, 10] },
  compound_moderate: { seconds: 120, alertAt: [30, 10] },
  isolation: { seconds: 90, alertAt: [15] },
  accessory: { seconds: 60, alertAt: [15] },
};
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `/lib/training-logic/fatigue.ts` | Fatigue calculation, status, logging |
| `/lib/training-logic/progression.ts` | Progression gates, recommendations, plateau detection |
| `/lib/training-logic/deload.ts` | Deload detection, triggers, management |
| `/lib/training-logic/suggestions.ts` | Weight suggestions, warmups, rest timers |
| `/lib/training-logic/index.ts` | Library exports |
| `/app/api/training/status/route.ts` | Training status endpoint |
| `/app/api/training/suggest/route.ts` | Weight suggestion endpoint |
| `/app/api/ppl/today/route.ts` | Today's workout with fatigue/deload data |
| `/app/api/progression/route.ts` | Progression analysis endpoint |
