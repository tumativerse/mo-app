# Phase 5: Logic & Auto-Regulation Implementation ✅

> **Status**: Implemented on Dec 22, 2024

## User Workflow Overview

The core user workflow is:
1. **Open app** → See today's workout
2. **Check recovery** → Log how they feel (or see yesterday's)
3. **Start workout** → Progress through exercises
4. **Log sets** → Weight × reps @ RPE
5. **Complete workout** → See summary
6. **Track progress** → View trends, get recommendations

Phase 5 adds **intelligent logic** that makes the system adaptive and prevents overtraining.

---

## Logic Systems to Implement

### 1. Day Rotation Logic (Enhanced)

**Current State**: Simple sequential rotation (Push A → Pull A → Legs A → Push B → Pull B → Legs B → repeat)

**Enhancements Needed**:

#### 1.1 Rest Day Detection
- If user hasn't worked out in 3+ days, check if they need a "ramp-up" session
- If it's been 7+ days, reset to day 1 of the cycle

```typescript
// Logic:
const daysSinceLastWorkout = differenceInDays(today, lastSession.date);

if (daysSinceLastWorkout >= 7) {
  // Reset to day 1 - user needs fresh start
  return { dayNumber: 1, isReset: true, message: "Starting fresh after break" };
}

if (daysSinceLastWorkout >= 3) {
  // Suggest lighter intensity
  return {
    dayNumber: nextInRotation,
    intensityModifier: 0.9,  // 90% of normal weights
    message: "Ease back in after break"
  };
}
```

#### 1.2 Deload Week Integration
- Every 4th week OR when fatigue score ≥ 5 for 3+ days
- During deload: same exercises, 60% volume (fewer sets), same intensity

```typescript
// Check if deload needed
const shouldDeload =
  (weekNumber % 4 === 0) ||
  (recentFatigueScores.filter(s => s >= 5).length >= 3);

if (shouldDeload) {
  return {
    ...todayWorkout,
    isDeloadWeek: true,
    volumeModifier: 0.6,  // 60% of normal sets
    message: "Deload week - recovery focus"
  };
}
```

#### 1.3 Recovery-Aware Scheduling
- If yesterday's soreness was 4-5, suggest active recovery or lighter session
- If sleep < 5 hours, warn user and suggest modified workout

---

### 2. Auto-Regulation System

**Purpose**: Automatically adjust training based on performance and recovery data.

#### 2.1 Weight Progression Gates

Before suggesting weight increases, check:

```typescript
interface ProgressionGate {
  canProgress: boolean;
  reason: string;
  suggestedAction: string;
}

function checkProgressionGates(exerciseId: string, userId: string): ProgressionGate {
  // Gate 1: Fatigue score
  if (fatigueScore >= 5) {
    return {
      canProgress: false,
      reason: "High fatigue detected",
      suggestedAction: "Maintain current weight or reduce slightly"
    };
  }

  // Gate 2: Recent performance
  const lastSessions = getLastNSessions(exerciseId, 3);
  const hitAllReps = lastSessions.every(s => s.reps >= s.targetReps);
  const avgRpe = average(lastSessions.map(s => s.rpe));

  if (!hitAllReps) {
    return {
      canProgress: false,
      reason: "Didn't hit target reps in recent sessions",
      suggestedAction: "Keep weight until you hit all reps"
    };
  }

  if (avgRpe > 8.5) {
    return {
      canProgress: false,
      reason: "RPE too high - need more margin",
      suggestedAction: "Get RPE under 8 before adding weight"
    };
  }

  // Gate 3: Recovery check
  if (avgSleepLast3Days < 6 || avgEnergyLast3Days < 3) {
    return {
      canProgress: false,
      reason: "Recovery metrics suboptimal",
      suggestedAction: "Focus on recovery before progressing"
    };
  }

  // All gates passed
  return {
    canProgress: true,
    reason: "Ready to progress",
    suggestedAction: "Add 2.5-5 lbs next session"
  };
}
```

#### 2.2 Volume Auto-Regulation

Track weekly volume (tonnage) per muscle group:

```typescript
interface WeeklyVolume {
  muscleGroup: string;
  tonnage: number;  // sum of (weight × reps × sets)
  setCount: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

// Thresholds per muscle group
const volumeThresholds = {
  chest: { min: 10, max: 20 },      // sets per week
  back: { min: 10, max: 20 },
  shoulders: { min: 8, max: 16 },
  quads: { min: 8, max: 16 },
  hamstrings: { min: 6, max: 12 },
  biceps: { min: 6, max: 12 },
  triceps: { min: 6, max: 12 },
};

function checkVolumeStatus(muscleGroup: string, currentSets: number): string {
  const threshold = volumeThresholds[muscleGroup];
  if (currentSets < threshold.min) return 'under-volume';
  if (currentSets > threshold.max) return 'over-volume';
  return 'optimal';
}
```

#### 2.3 RPE-Based Set Adjustment

During workout, suggest adjustments based on RPE:

```typescript
function getSuggestionAfterSet(
  setNumber: number,
  targetSets: number,
  rpe: number,
  targetRpe: number
): SetSuggestion {
  const rpeDiff = rpe - targetRpe;

  if (rpeDiff >= 2) {
    // Way harder than expected
    return {
      action: 'reduce',
      message: 'Consider reducing weight by 5-10%',
      skipRemainingSets: setNumber >= targetSets - 1
    };
  }

  if (rpeDiff <= -2 && setNumber === targetSets) {
    // Way easier than expected - on last set
    return {
      action: 'add_set',
      message: 'Feeling strong? Add a bonus set'
    };
  }

  return { action: 'continue', message: null };
}
```

---

### 3. Fatigue & Deload Detection

#### 3.1 Enhanced Fatigue Score (0-10 scale)

Current implementation uses 0-7. Enhance to be more nuanced:

```typescript
interface FatigueFactors {
  rpeCreep: number;        // 0-2: RPE trending up over sessions
  performanceDrop: number; // 0-2: Reps declining at same weight
  recoveryDebt: number;    // 0-3: Poor sleep/energy/soreness
  volumeLoad: number;      // 0-2: High volume relative to baseline
  streak: number;          // 0-1: Many consecutive training days
}

function calculateFatigueScore(userId: string, days: number = 7): number {
  let score = 0;

  // 1. RPE Creep (are workouts getting harder?)
  const recentRpes = getSessionRpes(userId, 5);
  if (isIncreasing(recentRpes)) score += 2;

  // 2. Performance Drop (less reps at same weight?)
  const performanceData = getPerformanceTrend(userId, days);
  if (performanceData.declining) score += 2;

  // 3. Recovery Debt
  const recovery = getRecoveryAvg(userId, 3);
  if (recovery.avgSleep < 6) score += 1;
  if (recovery.avgSleep < 5) score += 1;  // Extra point for severe lack
  if (recovery.avgEnergy < 3) score += 1;
  if (recovery.avgSoreness > 4) score += 1;

  // 4. Volume Load (high tonnage this week?)
  const weeklyVolume = getWeeklyVolume(userId);
  const baselineVolume = getBaselineVolume(userId);
  if (weeklyVolume > baselineVolume * 1.2) score += 1;
  if (weeklyVolume > baselineVolume * 1.4) score += 1;

  // 5. Training Streak
  const consecutiveDays = getConsecutiveTrainingDays(userId);
  if (consecutiveDays >= 5) score += 1;

  return Math.min(score, 10);
}
```

#### 3.2 Fatigue Status Levels

```typescript
type FatigueLevel = 'fresh' | 'normal' | 'elevated' | 'high' | 'critical';

function getFatigueStatus(score: number): {
  level: FatigueLevel;
  color: string;
  message: string;
  action: string;
} {
  if (score <= 2) return {
    level: 'fresh',
    color: 'green',
    message: 'Well recovered',
    action: 'Train normally, consider pushing intensity'
  };

  if (score <= 4) return {
    level: 'normal',
    color: 'green',
    message: 'Normal training fatigue',
    action: 'Continue as planned'
  };

  if (score <= 6) return {
    level: 'elevated',
    color: 'yellow',
    message: 'Fatigue accumulating',
    action: 'Monitor closely, prioritize recovery'
  };

  if (score <= 8) return {
    level: 'high',
    color: 'orange',
    message: 'High fatigue - deload recommended',
    action: 'Take a deload week or reduce volume 40%'
  };

  return {
    level: 'critical',
    color: 'red',
    message: 'Risk of overtraining',
    action: 'Mandatory rest day or very light session only'
  };
}
```

#### 3.3 Auto-Deload Trigger

```typescript
interface DeloadDecision {
  shouldDeload: boolean;
  reason: string;
  deloadType: 'volume' | 'intensity' | 'full_rest';
  durationDays: number;
}

function checkDeloadNeeded(userId: string): DeloadDecision {
  const fatigueScore = calculateFatigueScore(userId);
  const weeksSinceDeload = getWeeksSinceLastDeload(userId);
  const recentFatigueHistory = getFatigueHistory(userId, 7);

  // Rule 1: Scheduled deload (every 4 weeks)
  if (weeksSinceDeload >= 4) {
    return {
      shouldDeload: true,
      reason: 'Scheduled deload week',
      deloadType: 'volume',
      durationDays: 7
    };
  }

  // Rule 2: Fatigue score critical for 2+ days
  const criticalDays = recentFatigueHistory.filter(f => f.score >= 8).length;
  if (criticalDays >= 2) {
    return {
      shouldDeload: true,
      reason: 'Sustained high fatigue detected',
      deloadType: 'full_rest',
      durationDays: 3
    };
  }

  // Rule 3: Fatigue elevated for 5+ days
  const elevatedDays = recentFatigueHistory.filter(f => f.score >= 6).length;
  if (elevatedDays >= 5) {
    return {
      shouldDeload: true,
      reason: 'Prolonged elevated fatigue',
      deloadType: 'volume',
      durationDays: 5
    };
  }

  return {
    shouldDeload: false,
    reason: 'No deload needed',
    deloadType: 'volume',
    durationDays: 0
  };
}
```

---

### 4. Progression Recommendations (Enhanced)

#### 4.1 Exercise-Specific Progression Rules

```typescript
interface ProgressionRule {
  exerciseType: 'compound' | 'isolation';
  minRepsForProgress: number;
  maxRpeForProgress: number;
  weightIncrement: number;  // lbs
  sessionsRequired: number; // consecutive sessions hitting target
}

const progressionRules: Record<string, ProgressionRule> = {
  // Compounds - higher threshold, smaller increments
  compound: {
    exerciseType: 'compound',
    minRepsForProgress: 8,
    maxRpeForProgress: 8,
    weightIncrement: 5,
    sessionsRequired: 2
  },
  // Isolations - can progress faster with smaller weights
  isolation: {
    exerciseType: 'isolation',
    minRepsForProgress: 10,
    maxRpeForProgress: 7,
    weightIncrement: 2.5,
    sessionsRequired: 1
  }
};

function getProgressionRecommendation(
  exerciseId: string,
  recentPerformance: SessionPerformance[]
): ProgressionRecommendation {
  const exercise = getExercise(exerciseId);
  const rule = progressionRules[exercise.isCompound ? 'compound' : 'isolation'];

  // Check last N sessions
  const qualifying = recentPerformance.slice(0, rule.sessionsRequired);
  const allQualify = qualifying.every(p =>
    p.reps >= rule.minRepsForProgress &&
    p.rpe <= rule.maxRpeForProgress
  );

  if (allQualify && qualifying.length >= rule.sessionsRequired) {
    return {
      status: 'ready',
      suggestedWeight: recentPerformance[0].weight + rule.weightIncrement,
      message: `Add ${rule.weightIncrement} lbs next session`
    };
  }

  return {
    status: 'maintain',
    suggestedWeight: recentPerformance[0].weight,
    message: 'Keep current weight until you hit targets'
  };
}
```

#### 4.2 Plateau Breaking Suggestions

```typescript
interface PlateauBreaker {
  strategy: string;
  description: string;
  duration: string;
}

const plateauStrategies: PlateauBreaker[] = [
  {
    strategy: 'rep_range_shift',
    description: 'Try 6-8 reps instead of 8-12 to build strength',
    duration: '2-3 weeks'
  },
  {
    strategy: 'variation_swap',
    description: 'Switch to a similar exercise (e.g., incline instead of flat)',
    duration: '4 weeks'
  },
  {
    strategy: 'volume_increase',
    description: 'Add 1-2 sets per session for this exercise',
    duration: '2 weeks'
  },
  {
    strategy: 'frequency_boost',
    description: 'Train this movement pattern an extra day per week',
    duration: '3 weeks'
  },
  {
    strategy: 'deload_then_push',
    description: 'Take a deload week, then come back at 90% and rebuild',
    duration: '2 weeks'
  }
];
```

---

### 5. Suggested Weight Logic

When user starts a new set, suggest weight based on:

```typescript
interface WeightSuggestion {
  suggestedWeight: number;
  confidence: 'high' | 'medium' | 'low';
  basis: string;
}

function suggestWeight(
  userId: string,
  exerciseId: string,
  setNumber: number,
  isWarmup: boolean
): WeightSuggestion {
  const defaults = getUserExerciseDefaults(userId, exerciseId);
  const todaysFatigue = getFatigueScore(userId);
  const progressionStatus = getProgressionRecommendation(exerciseId);

  if (!defaults) {
    // No history - suggest starting weight
    return {
      suggestedWeight: getExerciseStartingWeight(exerciseId),
      confidence: 'low',
      basis: 'Default starting weight'
    };
  }

  let baseWeight = defaults.lastWeight;

  // Adjust for fatigue
  if (todaysFatigue >= 6) {
    baseWeight = Math.round(baseWeight * 0.9);  // 10% reduction
  }

  // Adjust for progression
  if (progressionStatus.status === 'ready' && setNumber === 1 && !isWarmup) {
    baseWeight = progressionStatus.suggestedWeight;
  }

  // Warmup sets are lighter
  if (isWarmup) {
    const warmupPercentages = [0.5, 0.7, 0.85];  // 50%, 70%, 85%
    const pct = warmupPercentages[Math.min(setNumber - 1, 2)];
    baseWeight = Math.round(baseWeight * pct / 5) * 5;  // Round to nearest 5
  }

  return {
    suggestedWeight: baseWeight,
    confidence: 'high',
    basis: `Based on last session: ${defaults.lastWeight} lbs`
  };
}
```

---

### 6. Rest Timer Logic

```typescript
interface RestTimerConfig {
  defaultSeconds: number;
  autoStart: boolean;
  alertAt: number[];  // seconds remaining to alert
}

const restTimerDefaults: Record<string, RestTimerConfig> = {
  compound_heavy: { defaultSeconds: 180, autoStart: true, alertAt: [30, 10] },
  compound_moderate: { defaultSeconds: 120, autoStart: true, alertAt: [30, 10] },
  isolation: { defaultSeconds: 90, autoStart: true, alertAt: [15] },
  accessory: { defaultSeconds: 60, autoStart: true, alertAt: [15] },
};

function getRestTimerConfig(
  slotType: SlotType,
  exerciseType: 'compound' | 'isolation',
  lastRpe: number
): RestTimerConfig {
  // Higher RPE = longer rest
  let config = restTimerDefaults[`${exerciseType}_moderate`];

  if (slotType === 'primary' && lastRpe >= 8) {
    config = restTimerDefaults.compound_heavy;
  }

  if (slotType === 'accessory' || slotType === 'optional') {
    config = restTimerDefaults.accessory;
  }

  return config;
}
```

---

## Implementation Order

### Step 1: Database Updates ✅
- [x] Add `deload_periods` table to track deload history
- [x] Add `fatigue_logs` table for daily fatigue snapshots
- [x] Add `deload_type` and `fatigue_level` enums

### Step 2: Core Logic Functions ✅
Created `/lib/training-logic/` with:
- [x] `fatigue.ts` - Fatigue calculation and status
- [x] `progression.ts` - Progression gates and recommendations
- [x] `deload.ts` - Deload detection and scheduling
- [x] `suggestions.ts` - Weight and set suggestions
- [x] `index.ts` - Library exports

### Step 3: API Updates ✅
- [x] Update `GET /api/ppl/today` with fatigue-aware rotation
- [x] Update `GET /api/progression` with enhanced logic
- [x] Add `GET /api/training/status` for current fatigue + recommendations
- [x] Add `POST /api/training/status` to trigger/end deload
- [x] Add `GET/POST /api/training/suggest` for weight suggestions

### Step 4: Frontend Integration ✅
- [x] Add fatigue indicator to dashboard
- [x] Add fatigue/deload banners to workout page
- [x] Add rotation messages for breaks
- [x] Rest timer already implemented in Phase 4

### Step 5: Testing & Iteration 🔲
- [ ] Deploy to Vercel
- [ ] Test with real workouts for 2 weeks
- [ ] Adjust thresholds based on feedback

---

## Success Criteria

- [ ] Fatigue score accurately reflects training load
- [ ] Progression suggestions match actual readiness
- [ ] Deload triggers at appropriate times
- [ ] Weight suggestions are within 5% of optimal
- [ ] Rest timer enhances (not interrupts) workflow
- [ ] System prevents overtraining without being overly conservative

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `/lib/training-logic/fatigue.ts` | Fatigue calculation |
| Create | `/lib/training-logic/progression.ts` | Progression rules |
| Create | `/lib/training-logic/deload.ts` | Deload detection |
| Create | `/lib/training-logic/auto-regulation.ts` | Auto adjustments |
| Create | `/lib/training-logic/suggestions.ts` | Weight suggestions |
| Create | `/lib/training-logic/index.ts` | Exports |
| Modify | `/lib/db/schema.ts` | Add new tables |
| Modify | `/app/api/ppl/today/route.ts` | Fatigue-aware rotation |
| Modify | `/app/api/progression/route.ts` | Enhanced logic |
| Create | `/app/api/training/status/route.ts` | Training status endpoint |
| Modify | `/app/(app)/workout/page.tsx` | Weight suggestions, rest timer |
| Modify | `/app/(app)/dashboard/page.tsx` | Fatigue indicator |
