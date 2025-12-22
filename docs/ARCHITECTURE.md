# The Mo Universe - System Architecture

> Mo isn't just an app — it's your training partner.

This document defines the complete system architecture for the Mo fitness platform, organized into domains, verticals, and systems.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [The Four Domains](#the-four-domains)
3. [MO:SELF - Foundation Domain](#moself---foundation-domain)
4. [MO:PULSE - Tracking Domain](#mopulse---tracking-domain)
5. [MO:COACH - Intelligence Domain](#mocoach---intelligence-domain)
6. [MO:CONNECT - Ecosystem Domain](#moconnect---ecosystem-domain)
7. [Data Flow](#data-flow)
8. [Interface Contracts](#interface-contracts)
9. [Current Implementation Status](#current-implementation-status)
10. [Code Organization](#code-organization)
11. [Future Roadmap](#future-roadmap)

---

## Architecture Overview

### Hierarchy

```
DOMAIN (4) → VERTICAL (12) → SYSTEM (30+)
```

| Level | Purpose | Naming Pattern | Example |
|-------|---------|----------------|---------|
| Domain | Strategic boundaries | `MO:NAME` | MO:COACH |
| Vertical | Functional areas | `MoName` | MoAdapt |
| System | Specific implementations | `MoName` | MoFatigue |

### The Mo Universe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                           ✦  THE MO UNIVERSE  ✦                             │
│                                                                             │
│         "Mo knows yourself, tracks your pulse, coaches you,                 │
│                    and connects you to the world."                          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│   │   MO:SELF     │ │   MO:PULSE    │ │   MO:COACH    │ │  MO:CONNECT   │  │
│   │               │ │               │ │               │ │               │  │
│   │  "This is     │ │ "Your daily   │ │  "Your smart  │ │ "Your link to │  │
│   │     you"      │ │    rhythm"    │ │    trainer"   │ │  the world"   │  │
│   └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘  │
│                                                                             │
│         Foundation        Tracking        Intelligence       Ecosystem      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Four Domains

| Domain | Name | Personality | Role |
|--------|------|-------------|------|
| Foundation | **MO:SELF** | "The Memory" | Knows who you are, what you want, where you've been |
| Tracking | **MO:PULSE** | "The Observer" | Watches everything — workouts, body, recovery, fuel |
| Intelligence | **MO:COACH** | "The Brain" | Thinks, adapts, learns, coaches |
| Ecosystem | **MO:CONNECT** | "The Connector" | Links you to devices, community, knowledge |

### Domain Flow

```
MO:SELF      →    MO:PULSE    →    MO:COACH     →    MO:CONNECT
   │                  │                │                  │
"Who you are"  "What you do"   "How to improve"   "Share & sync"
```

---

## MO:SELF - Foundation Domain

> *"The Memory"* — "I remember everything about you"

MO:SELF is the foundation layer that stores user identity, preferences, and history. All other domains reference MO:SELF to understand context.

### Verticals & Systems

#### MoIdentity — *"I know who you are"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoAuth | *"The Gatekeeper"* | Authentication, user accounts | ✅ Built |
| MoProfile | *"The Record"* | User profile, fitness level, goals | ✅ Built |
| MoGoals | *"The Target"* | Training goals, target metrics | ⚠️ Partial |

#### MoPrefs — *"I know what you like"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoSettings | *"The Customizer"* | Training prefs, equipment level, units, warmup settings | ✅ Built |
| MoGear | *"The Inventory"* | Available equipment, gym setup | ✅ Built |
| MoAlerts | *"The Notifier"* | Notification preferences, reminders | ❌ Future |

#### MoHistory — *"I remember your journey"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoRecords | *"The Historian"* | Personal records with auto-detection, estimated 1RM | ✅ Built |
| MoBadges | *"The Trophy Case"* | Achievements, milestones, badges | ❌ Future |
| MoStreaks | *"The Motivator"* | Workout streaks (48hr window), auto-update on completion | ✅ Built |

### MO:SELF Data Model

```typescript
interface MoSelfContext {
  identity: {
    userId: string;
    profile: UserProfile;
    goals: UserGoals;
  };
  preferences: {
    equipment: EquipmentLevel;
    settings: AppSettings;
  };
  history: {
    records: PersonalRecord[];
    streaks: StreakData;
    achievements: Achievement[];
  };
}
```

---

## MO:PULSE - Tracking Domain

> *"The Observer"* — "I see everything you do"

MO:PULSE captures all user activity and health data. It's the primary input layer that feeds MO:COACH with data for analysis.

### Verticals & Systems

#### MoMove — *"I track every rep, every mile"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoStrength | *"The Iron Counter"* | Weight training, sets, reps, RPE | ✅ Built |
| MoCardio | *"The Distance Tracker"* | Running, cycling, swimming, rowing | ❌ Future |
| MoMobility | *"The Flexibility Guide"* | Stretching, yoga, mobility work | ⚠️ Partial |
| MoSession | *"The Workout Manager"* | Active session state, timers, flow | ✅ Built |
| MoWarmup | *"The Preparer"* | Warmup templates, phase tracking, skip/complete | ✅ Built |

#### MoBody — *"I watch your transformation"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoWeight | *"The Scale"* | Daily weight logging, trends | ✅ Built |
| MoMeasure | *"The Tape"* | Body measurements (chest, waist, arms) | ❌ Future |
| MoComposition | *"The Analyzer"* | Body fat %, muscle mass estimates | ❌ Future |

#### MoRecover — *"I monitor how you heal"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoSleep | *"The Night Watcher"* | Sleep hours, quality tracking | ✅ Built |
| MoEnergy | *"The Battery"* | Daily energy levels (1-5) | ✅ Built |
| MoSoreness | *"The Pain Map"* | Muscle soreness tracking | ✅ Built |
| MoStrain | *"The Load Monitor"* | Daily strain from wearables | ❌ Future |

#### MoFuel — *"I track what powers you"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoMeals | *"The Food Log"* | Meal logging, food diary | ❌ Future |
| MoMacros | *"The Nutrient Counter"* | Protein, carbs, fats tracking | ❌ Future |
| MoHydration | *"The Water Tracker"* | Daily water intake | ❌ Future |

### MO:PULSE Data Model

```typescript
interface MoPulseData {
  activity: {
    sessions: WorkoutSession[];
    exercises: ExerciseLog[];
    cardioActivities: CardioActivity[];
  };
  body: {
    weightEntries: WeightEntry[];
    measurements: BodyMeasurement[];
  };
  recovery: {
    sleepLogs: SleepLog[];
    energyLevels: EnergyLog[];
    sorenessLogs: SorenessLog[];
  };
  nutrition: {
    meals: MealLog[];
    macros: DailyMacros[];
    hydration: HydrationLog[];
  };
}
```

---

## MO:COACH - Intelligence Domain

> *"The Brain"* — "I think so you don't have to"

MO:COACH is the intelligence layer that analyzes data from MO:PULSE, applies training science, and provides personalized guidance.

### Verticals & Systems

#### MoInsight — *"I find meaning in your data"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoTrends | *"The Pattern Finder"* | Long-term trend analysis | ⚠️ Partial |
| MoReports | *"The Summarizer"* | Weekly/monthly progress reports | ❌ Future |
| MoPatterns | *"The Detective"* | Behavioral pattern recognition | ❌ Future |

#### MoAdapt — *"I adjust your training"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoFatigue | *"The Guardian"* | Fatigue scoring (0-10), protection from overtraining | ✅ Built |
| MoProgress | *"The Challenger"* | Progression gates, readiness checks | ✅ Built |
| MoDeload | *"The Healer"* | Deload detection, recovery weeks | ✅ Built |
| MoSuggest | *"The Advisor"* | Weight, set, and rest recommendations | ✅ Built |

#### MoChat — *"I speak to you directly"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoVoice | *"The Conversationalist"* | AI chat interface | ❌ Future |
| MoAdvice | *"The Counselor"* | Contextual recommendations | ⚠️ Partial |
| MoEducate | *"The Teacher"* | Training education, explanations | ❌ Future |

### MO:COACH Data Model

```typescript
interface MoCoachOutput {
  insight: {
    trends: TrendAnalysis[];
    patterns: PatternInsight[];
  };
  adaptation: {
    fatigue: FatigueResult;
    progression: ProgressionStatus;
    deload: DeloadDecision;
    suggestions: WorkoutSuggestions;
  };
  coaching: {
    recommendations: Recommendation[];
    education: EducationContent[];
  };
}
```

### MoAdapt Logic Summary

#### MoFatigue — Fatigue Calculation

```
Fatigue Score (0-10) = Sum of:
├── RPE Creep (0-2)        → Detects upward RPE trend
├── Performance Drop (0-2)  → High average RPE
├── Recovery Debt (0-3)     → Poor sleep/energy/soreness
├── Volume Load (0-2)       → Training volume spike
└── Streak Score (0-1)      → 5+ consecutive days
```

| Score | Level | Color | Action |
|-------|-------|-------|--------|
| 0-3 | Fresh | Green | Train normally |
| 4-5 | Normal | Yellow | Monitor closely |
| 6-7 | Elevated | Orange | Consider reducing |
| 8-9 | High | Red | Reduce intensity |
| 10 | Critical | Red | Rest day recommended |

#### MoProgress — Progression Gates

Before allowing weight increase, all gates must pass:

```
┌─────────────────────────────────────────┐
│           PROGRESSION GATES             │
├─────────────────────────────────────────┤
│ 1. Fatigue Gate    → Score < 7          │
│ 2. Performance Gate → Hit target reps   │
│ 3. RPE Gate        → RPE in range       │
│ 4. Recovery Gate   → Adequate recovery  │
└─────────────────────────────────────────┘
```

| Exercise Type | Target Reps | Max RPE | Weight Jump |
|---------------|-------------|---------|-------------|
| Compound | 8 | 8 | +5 lbs |
| Isolation | 10 | 7 | +2.5 lbs |

#### MoDeload — Deload Triggers

| Trigger | Condition | Deload Type |
|---------|-----------|-------------|
| Scheduled | Every 4 weeks | Volume (60% volume, 100% intensity) |
| Critical Fatigue | 2+ days at score 8+ | Intensity (70% volume, 85% intensity) |
| Prolonged Elevated | 5+ days at score 6+ | Volume |
| Combined Factors | High fatigue + poor recovery | Full Rest |

---

## MO:CONNECT - Ecosystem Domain

> *"The Connector"* — "I link you to everything"

MO:CONNECT handles all external connections — social features, device integrations, and content delivery.

### Verticals & Systems

#### MoCommunity — *"I connect you to others"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoShare | *"The Broadcaster"* | Workout sharing, social posts | ❌ Future |
| MoChallenges | *"The Competitor"* | Weekly/monthly challenges | ❌ Future |
| MoLeaderboard | *"The Ranks"* | Friend and global leaderboards | ❌ Future |

#### MoSync — *"I talk to your devices"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoWearables | *"The Device Whisperer"* | Apple Watch, Garmin, WHOOP, Fitbit | ❌ Future |
| MoHealth | *"The Health Bridge"* | Apple Health, Google Fit integration | ❌ Future |
| MoAPIs | *"The Translator"* | Third-party API connections | ❌ Future |

#### MoLibrary — *"I hold the knowledge"*

| System | Name | Description | Status |
|--------|------|-------------|--------|
| MoExercises | *"The Encyclopedia"* | Exercise database, demos, cues | ✅ Built |
| MoPrograms | *"The Curriculum"* | Training program templates | ✅ Built |
| MoLearn | *"The Classroom"* | Educational content, articles | ❌ Future |

### MO:CONNECT Data Model

```typescript
interface MoConnectServices {
  community: {
    posts: SocialPost[];
    challenges: Challenge[];
    friends: Friend[];
  };
  sync: {
    connectedDevices: Device[];
    healthPlatforms: HealthPlatform[];
    syncStatus: SyncStatus;
  };
  library: {
    exercises: Exercise[];
    programs: ProgramTemplate[];
    content: EducationalContent[];
  };
}
```

---

## Data Flow

### Primary Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │  MO:COACH   │
                              │             │
                              │  Analyzes   │
                              │  Decides    │
                              │  Recommends │
                              └──────┬──────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     │
┌─────────────┐    ┌─────────────┐              │
│  MO:SELF    │───▶│  MO:PULSE   │──────────────┘
│             │    │             │
│  Provides   │    │  Collects   │
│  Context    │    │  Data       │
└─────────────┘    └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ MO:CONNECT  │
                   │             │
                   │  Syncs      │
                   │  Shares     │
                   │  Provides   │
                   └─────────────┘
```

### Detailed Interactions

```
MO:SELF provides to all domains:
├── User identity and preferences
├── Equipment availability
├── Training history context
└── Goal information

MO:PULSE sends to MO:COACH:
├── Workout session data (sets, reps, RPE)
├── Recovery logs (sleep, energy, soreness)
├── Body metrics (weight, measurements)
└── Nutrition data (meals, macros)

MO:COACH returns to MO:PULSE:
├── Fatigue status and recommendations
├── Progression decisions
├── Weight and set suggestions
└── Deload instructions

MO:CONNECT exchanges with all:
├── Syncs wearable data → MO:PULSE
├── Provides exercise library → MO:PULSE
├── Shares achievements → MO:SELF
└── Publishes workouts → External
```

---

## Interface Contracts

### Domain Interfaces

Each domain exposes a clean interface for other domains to consume.

#### MO:SELF Interface

```typescript
interface MoSelfInterface {
  // Get user context
  getContext(): Promise<MoSelfContext>;

  // Profile
  getProfile(): Promise<UserProfile>;
  updateProfile(data: Partial<UserProfile>): Promise<void>;

  // Preferences
  getPreferences(): Promise<UserPreferences>;
  getEquipment(): Promise<EquipmentLevel>;

  // History
  getPersonalRecords(exerciseId?: string): Promise<PersonalRecord[]>;
  getStreak(): Promise<StreakData>;
}
```

#### MO:PULSE Interface

```typescript
interface MoPulseInterface {
  // Activity
  getTodayWorkout(): Promise<WorkoutTemplate>;
  startSession(templateDayId: string): Promise<Session>;
  logSet(data: SetLogData): Promise<void>;
  completeSession(sessionId: string): Promise<SessionSummary>;

  // Body
  logWeight(weight: number): Promise<void>;
  getWeightHistory(days: number): Promise<WeightEntry[]>;

  // Recovery
  logRecovery(data: RecoveryData): Promise<void>;
  getRecovery(date: Date): Promise<RecoveryLog>;
}
```

#### MO:COACH Interface

```typescript
interface MoCoachInterface {
  // Fatigue
  calculateFatigue(userId: string): Promise<FatigueResult>;
  getFatigueStatus(): Promise<FatigueStatus>;

  // Progression
  checkProgressionGates(exerciseId: string): Promise<ProgressionGates>;
  getProgressionRecommendation(exerciseId: string): Promise<ProgressionRec>;

  // Deload
  checkDeloadNeeded(): Promise<DeloadDecision>;
  startDeload(type: DeloadType): Promise<void>;

  // Suggestions
  suggestWeight(exerciseId: string): Promise<WeightSuggestion>;
  getTrainingStatus(): Promise<TrainingStatus>;
}
```

#### MO:CONNECT Interface

```typescript
interface MoConnectInterface {
  // Library
  getExercise(id: string): Promise<Exercise>;
  getExerciseAlternatives(pattern: string): Promise<Exercise[]>;
  getPrograms(): Promise<ProgramTemplate[]>;

  // Sync
  syncWearable(device: DeviceType): Promise<SyncResult>;
  pushToHealthKit(data: HealthData): Promise<void>;

  // Social
  shareWorkout(sessionId: string): Promise<ShareResult>;
  getChallenges(): Promise<Challenge[]>;
}
```

---

## Current Implementation Status

### By Domain

| Domain | Verticals | Systems | Completion |
|--------|-----------|---------|------------|
| MO:SELF | 3/3 | 7/9 | 78% |
| MO:PULSE | 3/4 | 8/13 | 62% |
| MO:COACH | 2/3 | 5/9 | 56% |
| MO:CONNECT | 1/3 | 2/9 | 22% |

### By System

```
✅ Built        ⚠️ Partial      ❌ Future

MO:SELF
├── MoIdentity
│   ├── ✅ MoAuth          → lib/mo-self/identity/auth.ts
│   ├── ✅ MoProfile       → DB schema + user API
│   └── ⚠️ MoGoals         → DB schema only
├── MoPrefs
│   ├── ✅ MoSettings      → lib/mo-self/preferences/settings.ts + /api/preferences
│   ├── ✅ MoGear          → DB schema + preferences API
│   └── ❌ MoAlerts
└── MoHistory
    ├── ✅ MoRecords       → lib/mo-self/history/records.ts + /api/records
    ├── ❌ MoBadges
    └── ✅ MoStreaks       → lib/mo-self/history/streaks.ts + /api/streaks

MO:PULSE
├── MoMove
│   ├── ✅ MoStrength      → /api/ppl/session/sets
│   ├── ❌ MoCardio
│   ├── ⚠️ MoMobility      → DB schema only
│   ├── ✅ MoSession       → /api/ppl/session
│   └── ✅ MoWarmup        → lib/mo-pulse/move/warmup.ts + /api/warmup
├── MoBody
│   ├── ✅ MoWeight        → /api/weight
│   ├── ❌ MoMeasure
│   └── ❌ MoComposition
├── MoRecover
│   ├── ✅ MoSleep         → /api/recovery
│   ├── ✅ MoEnergy        → /api/recovery
│   ├── ✅ MoSoreness      → /api/recovery
│   └── ❌ MoStrain
└── MoFuel
    ├── ❌ MoMeals
    ├── ❌ MoMacros
    └── ❌ MoHydration

MO:COACH
├── MoInsight
│   ├── ⚠️ MoTrends        → In /api/progression
│   ├── ❌ MoReports
│   └── ❌ MoPatterns
├── MoAdapt
│   ├── ✅ MoFatigue       → lib/mo-coach/adapt/fatigue.ts
│   ├── ✅ MoProgress      → lib/mo-coach/adapt/progression.ts
│   ├── ✅ MoDeload        → lib/mo-coach/adapt/deload.ts
│   └── ✅ MoSuggest       → lib/mo-coach/adapt/suggestions.ts
└── MoChat
    ├── ❌ MoVoice
    ├── ⚠️ MoAdvice        → In progression recommendations
    └── ❌ MoEducate

MO:CONNECT
├── MoCommunity
│   ├── ❌ MoShare
│   ├── ❌ MoChallenges
│   └── ❌ MoLeaderboard
├── MoSync
│   ├── ❌ MoWearables
│   ├── ❌ MoHealth
│   └── ❌ MoAPIs
└── MoLibrary
    ├── ✅ MoExercises     → /api/exercises
    ├── ✅ MoPrograms      → /api/programs + /api/ppl/today
    └── ❌ MoLearn
```

---

## Code Organization

### Current Structure (Mo Universe Architecture)

```
/lib
├── /mo-self                 → MO:SELF domain
│   ├── /identity
│   │   └── auth.ts          → MoAuth - Authentication
│   ├── /preferences
│   │   └── settings.ts      → MoSettings - User preferences
│   ├── /history
│   │   ├── streaks.ts       → MoStreaks - Workout streaks
│   │   └── records.ts       → MoRecords - Personal records
│   └── index.ts             → Domain exports
├── /mo-pulse                → MO:PULSE domain
│   ├── /move
│   │   └── warmup.ts        → MoWarmup - Warmup tracking
│   └── index.ts             → Domain exports
├── /mo-coach                → MO:COACH domain
│   ├── /adapt
│   │   ├── fatigue.ts       → MoFatigue - Fatigue calculation
│   │   ├── progression.ts   → MoProgress - Progression gates
│   │   ├── deload.ts        → MoDeload - Deload detection
│   │   └── suggestions.ts   → MoSuggest - Weight suggestions
│   └── index.ts             → Domain exports
├── /mo-connect              → MO:CONNECT domain (placeholder)
│   └── index.ts
└── /db
    ├── schema.ts            → All domains (data models)
    ├── seed-*.ts            → MO:CONNECT / MoLibrary
    └── index.ts             → Database connection

/app/api
├── /dashboard               → Cross-domain aggregation
├── /ppl                     → MO:PULSE / MoMove
│   ├── /today               → MoSession (get today's workout)
│   └── /session             → MoSession (active workout)
│       └── /sets            → Set logging with PR detection
├── /weight                  → MO:PULSE / MoBody / MoWeight
├── /recovery                → MO:PULSE / MoRecover
├── /warmup                  → MO:PULSE / MoMove / MoWarmup
├── /streaks                 → MO:SELF / MoHistory / MoStreaks
├── /records                 → MO:SELF / MoHistory / MoRecords
├── /preferences             → MO:SELF / MoPrefs / MoSettings
├── /progression             → MO:COACH / MoAdapt / MoProgress
├── /training
│   ├── /status              → MO:COACH / MoAdapt (aggregated)
│   └── /suggest             → MO:COACH / MoAdapt / MoSuggest
├── /exercises               → MO:CONNECT / MoLibrary / MoExercises
└── /programs                → MO:CONNECT / MoLibrary / MoPrograms

/app/(app)
├── /dashboard               → Cross-domain UI
├── /workout                 → MO:PULSE / MoMove UI
├── /weight                  → MO:PULSE / MoBody UI
├── /progress                → MO:COACH / MoInsight UI
├── /history                 → MO:SELF / MoHistory UI
└── /programs                → MO:CONNECT / MoLibrary UI

/components
├── recovery-checkin.tsx     → MO:PULSE / MoRecover
├── strength-chart.tsx       → MO:COACH / MoInsight
├── weight-chart.tsx         → MO:PULSE / MoBody
└── ...
```

### Import Patterns

```typescript
// MO:SELF imports
import { getCurrentUser, getPreferences, getStreak } from '@/lib/mo-self';

// MO:PULSE imports
import { startWarmup, completeWarmup } from '@/lib/mo-pulse';

// MO:COACH imports
import { calculateFatigue, checkProgressionGates } from '@/lib/mo-coach';
```

---

## Future Roadmap

### Phase 7: MO:PULSE Expansion
- [ ] MoCardio — Running, cycling, swimming support
- [ ] MoMeasure — Body measurements tracking
- [ ] MoStrain — Wearable strain integration

### Phase 8: MO:COACH AI
- [ ] MoVoice — AI chat interface
- [ ] MoEducate — Training education content
- [ ] MoReports — Automated progress reports

### Phase 9: MO:CONNECT Ecosystem
- [ ] MoWearables — Apple Watch, Garmin, WHOOP integration
- [ ] MoHealth — Apple Health, Google Fit sync
- [ ] MoShare — Social workout sharing

### Phase 10: MO:CONNECT Community
- [ ] MoChallenges — Weekly/monthly competitions
- [ ] MoLeaderboard — Friend rankings
- [ ] MoLearn — Educational content library

### Phase 11: MO:PULSE Nutrition
- [ ] MoMeals — Food logging
- [ ] MoMacros — Macro tracking
- [ ] MoHydration — Water intake

---

## Design Principles

### 1. Domain Isolation
Each domain should be as independent as possible. Cross-domain communication happens through defined interfaces only.

### 2. Data Ownership
Each system owns its data. Other systems request data through the owning system's interface.

### 3. Single Responsibility
Each system does one thing well. If a system grows too complex, split it.

### 4. Progressive Enhancement
Core features (MO:PULSE, MO:COACH) work without optional features (MO:CONNECT social, wearables).

### 5. User-Centric Flow
The architecture follows the user's daily journey:
```
Wake up → Log recovery (MO:PULSE)
Check app → See status (MO:COACH)
Workout → Log sets (MO:PULSE)
Post-workout → See progress (MO:COACH)
Share → Post results (MO:CONNECT)
```

---

## Glossary

| Term | Definition |
|------|------------|
| Domain | Top-level architectural boundary (MO:SELF, MO:PULSE, MO:COACH, MO:CONNECT) |
| Vertical | Functional area within a domain (MoMove, MoAdapt, MoLibrary) |
| System | Specific implementation unit (MoFatigue, MoWeight, MoExercises) |
| Interface | Contract defining how domains/verticals communicate |
| Gate | Checkpoint that must pass before an action (e.g., progression gate) |

---

*Last updated: December 22, 2024*
*Version: 1.1*

### Recent Updates (v1.1)
- Added MoWarmup system to MO:PULSE/MoMove
- Completed MoSettings (was partial) with full preferences API
- Added MoRecords with auto-PR detection and Brzycki 1RM formula
- Added MoStreaks with 48-hour window and auto-update on workout completion
- Reorganized codebase into Mo Universe directory structure (/lib/mo-*)
- Added import patterns documentation
