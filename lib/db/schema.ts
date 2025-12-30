import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS (MVP only)
// ============================================

export const experienceEnum = pgEnum('experience', [
  'beginner',
  'intermediate',
  'advanced',
]);

export const fitnessGoalEnum = pgEnum('fitness_goal', [
  'lose_fat',
  'build_muscle',
  'recomp',
  'strength',
  'general',
]);

export const unitsEnum = pgEnum('units', ['imperial', 'metric']);

export const genderEnum = pgEnum('gender', [
  'male',
  'female',
  'non_binary',
  'prefer_not_to_say',
]);

export const activityLevelEnum = pgEnum('activity_level', [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
]);

export const occupationTypeEnum = pgEnum('occupation_type', [
  'desk_job',
  'standing_job',
  'physical_labor',
  'mixed',
  'student',
  'retired',
  'other',
]);

export const workoutStatusEnum = pgEnum('workout_status', [
  'planned',
  'in_progress',
  'completed',
  'skipped',
]);

export const workoutTypeEnum = pgEnum('workout_type', [
  'push',
  'pull',
  'legs',
  'upper',
  'lower',
  'full',
  'rest',
]);

export const exerciseCategoryEnum = pgEnum('exercise_category', [
  'compound',
  'isolation',
  'cardio',
  'mobility',
]);

export const movementPatternEnum = pgEnum('movement_pattern', [
  'horizontal_push',
  'vertical_push',
  'horizontal_pull',
  'vertical_pull',
  'squat',
  'hinge',
  'lunge',
  'carry',
  'isolation_push',
  'isolation_pull',
  'isolation_legs',
  'core',
  'plyometric',
  'olympic',
  'mobility',
  'cardio',
]);

export const difficultyEnum = pgEnum('difficulty', [
  'beginner',
  'intermediate',
  'advanced',
  'elite',
]);

export const priorityEnum = pgEnum('priority', [
  'essential',
  'common',
  'specialized',
  'niche',
]);

export const forceTypeEnum = pgEnum('force_type', [
  'push',
  'pull',
  'static',
  'dynamic',
]);

export const planeEnum = pgEnum('plane', [
  'sagittal',
  'frontal',
  'transverse',
]);

export const chainEnum = pgEnum('chain', [
  'anterior',
  'posterior',
  'lateral',
]);

export const kineticChainEnum = pgEnum('kinetic_chain', [
  'open',
  'closed',
]);

export const bodyPositionEnum = pgEnum('body_position', [
  'standing',
  'seated',
  'lying',
  'bent_over',
  'hanging',
  'kneeling',
  'prone',
  'supine',
  'incline',
  'decline',
]);

export const gripEnum = pgEnum('grip', [
  'overhand',
  'underhand',
  'neutral',
  'mixed',
  'hook',
  'false',
]);

export const gripWidthEnum = pgEnum('grip_width', [
  'narrow',
  'shoulder_width',
  'wide',
]);

export const stanceEnum = pgEnum('stance', [
  'hip_width',
  'narrow',
  'wide',
  'staggered',
  'split',
  'single_leg',
]);

export const relationshipTypeEnum = pgEnum('relationship_type', [
  'variation',
  'alternative',
  'progression',
  'regression',
]);

export const equipmentCategoryEnum = pgEnum('equipment_category', [
  'barbell',
  'dumbbell',
  'kettlebell',
  'cable',
  'machine',
  'bodyweight',
  'band',
  'suspension',
  'specialty',
  'cardio_machine',
  'other',
]);

export const muscleGroupEnum = pgEnum('muscle_group', [
  'chest',
  'back',
  'shoulders',
  'arms',
  'core',
  'legs',
  'glutes',
  'full_body',
]);

export const programStatusEnum = pgEnum('program_status', [
  'active',
  'paused',
  'completed',
]);

// ============================================
// PPL SYSTEM ENUMS
// ============================================

export const exerciseUseEnum = pgEnum('exercise_use', [
  'training',
  'warmup',
  'both',
]);

export const slotTypeEnum = pgEnum('slot_type', [
  'primary',
  'secondary',
  'accessory',
  'optional',
]);

export const dayTypeEnum = pgEnum('day_type', [
  'push',
  'pull',
  'legs',
  'upper',
  'lower',
  'full_body',
]);

export const warmupPhaseTypeEnum = pgEnum('warmup_phase_type', [
  'general',
  'dynamic',
  'movement_prep',
]);

export const equipmentLevelEnum = pgEnum('equipment_level', [
  'full_gym',
  'home_gym',
  'bodyweight',
]);

export const sessionStatusEnum = pgEnum('session_status', [
  'planned',
  'warmup',
  'in_progress',
  'completed',
  'skipped',
]);

// ============================================
// USERS
// ============================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),

  // ===== ENCRYPTED PERSONAL DATA =====
  // All fields below are AES-256-GCM encrypted at application level

  // Personal Info (encrypted)
  fullName: text('full_name'), // encrypted
  dateOfBirth: text('date_of_birth'), // encrypted - ISO date string
  gender: text('gender'), // encrypted - enum value as string

  // Body Metrics (encrypted)
  heightCm: text('height_cm'), // encrypted - number as string
  currentWeight: text('current_weight'), // encrypted - number as string
  goalWeight: text('goal_weight'), // encrypted - number as string

  // Health & Safety (encrypted)
  injuryHistory: text('injury_history'), // encrypted - JSON array as string
  chronicConditions: text('chronic_conditions'), // encrypted - text
  medications: text('medications'), // encrypted - text

  // ===== NON-ENCRYPTED DATA =====
  // These are app preferences, not personally identifiable

  // Fitness Profile
  experience: experienceEnum('experience'),
  fitnessGoal: fitnessGoalEnum('fitness_goal'),

  // Equipment Access
  availableEquipment: text('available_equipment').array(),

  // Preferences
  units: unitsEnum('units').default('imperial'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// EXERCISES
// ============================================

export const exercises = pgTable('exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),

  // === CATEGORIZATION ===
  category: exerciseCategoryEnum('category').notNull(),
  movementPattern: movementPatternEnum('movement_pattern'),
  patterns: text('patterns').array(), // All applicable patterns

  // === MUSCLES ===
  primaryMuscles: text('primary_muscles').array(),
  secondaryMuscles: text('secondary_muscles').array(),
  stabilizers: text('stabilizers').array(),

  // === EQUIPMENT & SETUP ===
  equipment: text('equipment').array(),
  equipmentDetails: text('equipment_details'),
  bodyPositions: text('body_positions').array(),
  grips: text('grips').array(),
  gripWidths: text('grip_widths').array(),
  stances: text('stances').array(),

  // === MOVEMENT CHARACTERISTICS ===
  forceType: forceTypeEnum('force_type'),
  plane: text('plane').array(),
  chain: chainEnum('chain'),
  kineticChain: kineticChainEnum('kinetic_chain'),
  isBilateral: boolean('is_bilateral').default(true),

  // === CLASSIFICATION ===
  exerciseTypes: text('exercise_types').array(), // strength, power, hypertrophy, endurance
  difficulty: difficultyEnum('difficulty'),
  priority: priorityEnum('priority'),

  // === PROGRAMMING DEFAULTS ===
  repRangeStrength: text('rep_range_strength'),
  repRangeHypertrophy: text('rep_range_hypertrophy'),
  repRangeEndurance: text('rep_range_endurance'),
  defaultSets: text('default_sets'),
  defaultRestSeconds: integer('default_rest_seconds'),

  // === ANATOMY ===
  joints: text('joints').array(),

  // === SAFETY ===
  injuryConsiderations: text('injury_considerations').array(),
  contraindications: text('contraindications').array(),

  // === CONTENT ===
  instructions: text('instructions'),
  videoUrl: varchar('video_url', { length: 500 }),

  // === META ===
  isActive: boolean('is_active').default(true),
  exerciseUse: exerciseUseEnum('exercise_use').default('training'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// EXERCISE RELATIONSHIPS (variations, alternatives, progressions)
// ============================================

export const exerciseRelationships = pgTable('exercise_relationships', {
  id: uuid('id').defaultRandom().primaryKey(),
  exerciseId: uuid('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  relatedExerciseId: uuid('related_exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  relationshipType: relationshipTypeEnum('relationship_type').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// MUSCLES (lookup table)
// ============================================

export const muscles = pgTable('muscles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  muscleGroup: muscleGroupEnum('muscle_group').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
});

// ============================================
// EQUIPMENT ITEMS (lookup table)
// ============================================

export const equipmentItems = pgTable('equipment_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  category: equipmentCategoryEnum('category').notNull(),
  description: text('description'),
  isCommon: boolean('is_common').default(true), // Common gym equipment
  isHomeGym: boolean('is_home_gym').default(false), // Typical home gym item
  isActive: boolean('is_active').default(true),
});

// ============================================
// PROGRAMS (DEPRECATED - Use programTemplates instead)
// These tables are from the old simple program system.
// The new PPL system uses: programTemplates, templateDays, templateSlots
// TODO: Remove these tables after confirming no data migration needed
// ============================================

export const programs = pgTable('programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  durationWeeks: integer('duration_weeks'),
  experience: experienceEnum('experience'),
  goal: fitnessGoalEnum('goal'),
  daysPerWeek: integer('days_per_week').notNull(),
  isActive: boolean('is_active').default(true),
});

export const programDays = pgTable('program_days', {
  id: uuid('id').defaultRandom().primaryKey(),
  programId: uuid('program_id')
    .notNull()
    .references(() => programs.id, { onDelete: 'cascade' }),
  dayNumber: integer('day_number').notNull(), // 1-7 for weekly cycle
  name: varchar('name', { length: 100 }).notNull(),
  workoutType: workoutTypeEnum('workout_type'),
  isRestDay: boolean('is_rest_day').default(false),
});

export const programExercises = pgTable('program_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  programDayId: uuid('program_day_id')
    .notNull()
    .references(() => programDays.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  sets: integer('sets').notNull(),
  repsMin: integer('reps_min'),
  repsMax: integer('reps_max'),
  restSeconds: integer('rest_seconds'),
  notes: text('notes'),
});

// ============================================
// USER PROGRAMS
// ============================================

export const userPrograms = pgTable('user_programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  programId: uuid('program_id')
    .notNull()
    .references(() => programs.id, { onDelete: 'cascade' }),
  currentDay: integer('current_day').default(1),
  currentWeek: integer('current_week').default(1),
  status: programStatusEnum('status').default('active'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// ============================================
// WORKOUTS (DEPRECATED - Use workoutSessions instead)
// These tables are from the old simple workout system.
// The new PPL system uses: workoutSessions, sessionExercises, sessionSets
// TODO: Remove these tables after confirming no data migration needed
// ============================================

export const workouts = pgTable('workouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  programDayId: uuid('program_day_id').references(() => programDays.id),
  date: timestamp('date').notNull(),
  status: workoutStatusEnum('status').default('planned'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  durationMin: integer('duration_min'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workoutSets = pgTable('workout_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  workoutId: uuid('workout_id')
    .notNull()
    .references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id')
    .notNull()
    .references(() => exercises.id),
  setNumber: integer('set_number').notNull(),
  weight: decimal('weight', { precision: 6, scale: 2 }),
  reps: integer('reps'),
  rpe: decimal('rpe', { precision: 3, scale: 1 }), // Rate of Perceived Exertion 1-10
  isWarmup: boolean('is_warmup').default(false),
  completedAt: timestamp('completed_at'),
});

// ============================================
// WEIGHT TRACKING
// ============================================

export const weightEntries = pgTable(
  'weight_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    weight: decimal('weight', { precision: 5, scale: 2 }).notNull(),
    date: timestamp('date').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('weight_user_date_idx').on(table.userId, table.date)]
);

// ============================================
// PERSONAL RECORDS
// ============================================

export const personalRecords = pgTable('personal_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id')
    .notNull()
    .references(() => exercises.id),
  weight: decimal('weight', { precision: 6, scale: 2 }).notNull(),
  reps: integer('reps').notNull(),
  estimated1RM: decimal('estimated_1rm', { precision: 6, scale: 2 }),
  achievedAt: timestamp('achieved_at').notNull(),
  workoutSetId: uuid('workout_set_id').references(() => workoutSets.id),
});

// ============================================
// STREAKS
// ============================================

export const streaks = pgTable('streaks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastWorkoutDate: timestamp('last_workout_date'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// USER EXERCISE DEFAULTS (for quick logging)
// ============================================

export const userExerciseDefaults = pgTable(
  'user_exercise_defaults',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    lastWeight: decimal('last_weight', { precision: 6, scale: 2 }),
    lastReps: integer('last_reps'),
    lastRpe: decimal('last_rpe', { precision: 3, scale: 1 }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_exercise_defaults_idx').on(table.userId, table.exerciseId),
  ]
);

// ============================================
// USER PREFERENCES (PPL System)
// ============================================

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  // ===== ENCRYPTED TRAINING PREFERENCES =====
  // All personal training data encrypted at application level

  // Training Profile (encrypted)
  fitnessGoal: text('fitness_goal'), // encrypted - enum value as string
  experienceLevel: text('experience_level'), // encrypted - enum value as string
  trainingFrequency: text('training_frequency'), // encrypted - number as string
  sessionDuration: text('session_duration'), // encrypted - number as string
  focusAreas: text('focus_areas'), // encrypted - JSON array as string
  preferredTrainingTimes: text('preferred_training_times'), // encrypted - JSON array of time strings
  restDaysPreference: text('rest_days_preference'), // encrypted - JSON array of day strings

  // Equipment (encrypted)
  defaultEquipmentLevel: text('default_equipment_level'), // encrypted - enum value as string
  availableEquipment: text('available_equipment'), // encrypted - JSON array as string

  // Lifestyle Context (encrypted)
  activityLevel: text('activity_level'), // encrypted - enum value as string
  occupationType: text('occupation_type'), // encrypted - enum value as string
  typicalBedtime: text('typical_bedtime'), // encrypted - time string (HH:mm)
  typicalWakeTime: text('typical_wake_time'), // encrypted - time string (HH:mm)

  // Cardio Preference (encrypted)
  preferredCardio: text('preferred_cardio'), // encrypted - string

  // ===== NON-ENCRYPTED APP SETTINGS =====
  // These are app display preferences, not personal data

  // Warmup Settings
  warmupDuration: varchar('warmup_duration', { length: 20 }).default('normal'),
  skipGeneralWarmup: boolean('skip_general_warmup').default(false),
  includeMobilityWork: boolean('include_mobility_work').default(true),

  // Units
  weightUnit: varchar('weight_unit', { length: 10 }).default('lbs'),

  // Theme Settings
  theme: varchar('theme', { length: 10 }).default('dark'),
  accentColor: varchar('accent_color', { length: 7 }).default('#10b981'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// RECOVERY LOGS (PPL System)
// ============================================

export const recoveryLogs = pgTable(
  'recovery_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: timestamp('date').notNull(),

    // Sleep
    sleepHours: decimal('sleep_hours', { precision: 3, scale: 1 }),
    sleepQuality: integer('sleep_quality'), // 1-5

    // Subjective measures
    energyLevel: integer('energy_level'), // 1-5
    overallSoreness: integer('overall_soreness'), // 1-5
    sorenessAreas: text('soreness_areas').array(),
    stressLevel: integer('stress_level'), // 1-5

    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('recovery_logs_user_date_idx').on(table.userId, table.date)]
);

// ============================================
// PROGRAM TEMPLATES (PPL System)
// ============================================

export const programTemplates = pgTable('program_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  daysPerWeek: integer('days_per_week').notNull(),
  goal: varchar('goal', { length: 50 }),
  experienceLevel: varchar('experience_level', { length: 50 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const templateDays = pgTable(
  'template_days',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    templateId: uuid('template_id')
      .notNull()
      .references(() => programTemplates.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 50 }).notNull(),
    dayOrder: integer('day_order').notNull(),
    dayType: dayTypeEnum('day_type').notNull(),
    variation: varchar('variation', { length: 1 }), // 'A' or 'B'
    estimatedDuration: integer('estimated_duration'), // minutes
    targetMuscles: text('target_muscles').array(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('template_days_order_idx').on(table.templateId, table.dayOrder)]
);

export const templateSlots = pgTable(
  'template_slots',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    dayId: uuid('day_id')
      .notNull()
      .references(() => templateDays.id, { onDelete: 'cascade' }),
    slotOrder: integer('slot_order').notNull(),
    slotType: slotTypeEnum('slot_type').notNull(),
    movementPattern: varchar('movement_pattern', { length: 50 }).notNull(),
    targetMuscles: text('target_muscles').array().notNull(),

    // Set/rep scheme
    sets: integer('sets').notNull(),
    repRangeMin: integer('rep_range_min').notNull(),
    repRangeMax: integer('rep_range_max').notNull(),
    rpeTarget: decimal('rpe_target', { precision: 3, scale: 1 }),
    restSeconds: integer('rest_seconds').default(120),

    isOptional: boolean('is_optional').default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('template_slots_order_idx').on(table.dayId, table.slotOrder)]
);

// ============================================
// WORKOUT SESSIONS (PPL System)
// ============================================

export const workoutSessions = pgTable(
  'workout_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    templateDayId: uuid('template_day_id').references(() => templateDays.id),
    date: timestamp('date').notNull(),
    equipmentLevel: equipmentLevelEnum('equipment_level').notNull(),
    status: sessionStatusEnum('status').default('planned'),

    // Timing
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    durationMinutes: integer('duration_minutes'),

    // Metrics
    totalSets: integer('total_sets'),
    totalVolume: decimal('total_volume', { precision: 10, scale: 2 }),
    avgRpe: decimal('avg_rpe', { precision: 3, scale: 1 }),

    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('workout_sessions_user_date_idx').on(table.userId, table.date)]
);

export const sessionExercises = pgTable(
  'session_exercises',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => workoutSessions.id, { onDelete: 'cascade' }),
    slotId: uuid('slot_id').references(() => templateSlots.id),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id),
    exerciseOrder: integer('exercise_order').notNull(),

    // Whether user swapped the suggestion
    isSubstituted: boolean('is_substituted').default(false),
    isCustom: boolean('is_custom').default(false),

    // Target (from slot or custom)
    targetSets: integer('target_sets').notNull(),
    targetRepMin: integer('target_rep_min').notNull(),
    targetRepMax: integer('target_rep_max').notNull(),
    targetRpe: decimal('target_rpe', { precision: 3, scale: 1 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('session_exercises_order_idx').on(table.sessionId, table.exerciseOrder)]
);

export const sessionSets = pgTable('session_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionExerciseId: uuid('session_exercise_id')
    .notNull()
    .references(() => sessionExercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  weight: decimal('weight', { precision: 6, scale: 2 }),
  weightUnit: varchar('weight_unit', { length: 10 }).default('lbs'),
  reps: integer('reps'),
  rpe: decimal('rpe', { precision: 3, scale: 1 }),
  isWarmup: boolean('is_warmup').default(false),
  notes: text('notes'),
  completedAt: timestamp('completed_at'),
});

// ============================================
// WARMUP TEMPLATES (PPL System)
// ============================================

export const warmupTemplates = pgTable(
  'warmup_templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    dayType: dayTypeEnum('day_type').notNull(),
    targetMuscles: text('target_muscles').array(),
    durationMinutes: integer('duration_minutes').default(10),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('warmup_templates_day_type_idx').on(table.dayType)]
);

export const warmupPhases = pgTable(
  'warmup_phases',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    templateId: uuid('template_id')
      .notNull()
      .references(() => warmupTemplates.id, { onDelete: 'cascade' }),
    phaseOrder: integer('phase_order').notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    phaseType: warmupPhaseTypeEnum('phase_type').notNull(),
    durationSeconds: integer('duration_seconds'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('warmup_phases_order_idx').on(table.templateId, table.phaseOrder)]
);

export const warmupPhaseExercises = pgTable(
  'warmup_phase_exercises',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    phaseId: uuid('phase_id')
      .notNull()
      .references(() => warmupPhases.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id),
    exerciseOrder: integer('exercise_order').notNull(),

    // Rep scheme (one of reps or duration)
    sets: integer('sets').default(1),
    reps: integer('reps'),
    durationSeconds: integer('duration_seconds'),

    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('warmup_phase_exercises_order_idx').on(table.phaseId, table.exerciseOrder)]
);

// ============================================
// WARMUP LOGS (PPL System)
// ============================================

export const warmupLogs = pgTable('warmup_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => workoutSessions.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => warmupTemplates.id),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  phasesCompleted: integer('phases_completed').default(0),
  skipped: boolean('skipped').default(false),
  notes: text('notes'),
});

// ============================================
// FATIGUE & DELOAD TRACKING (Phase 5)
// ============================================

export const deloadTypeEnum = pgEnum('deload_type', [
  'volume',     // Reduce sets, keep intensity
  'intensity',  // Reduce weight, keep volume
  'full_rest',  // Complete rest days
]);

export const fatigueLevelEnum = pgEnum('fatigue_level', [
  'fresh',      // 0-2: Well recovered
  'normal',     // 3-4: Normal training fatigue
  'elevated',   // 5-6: Fatigue accumulating
  'high',       // 7-8: Deload recommended
  'critical',   // 9-10: Risk of overtraining
]);

// Daily fatigue snapshots for trend tracking
export const fatigueLogs = pgTable(
  'fatigue_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: timestamp('date').notNull(),

    // Calculated fatigue score (0-10)
    fatigueScore: integer('fatigue_score').notNull(),
    fatigueLevel: fatigueLevelEnum('fatigue_level').notNull(),

    // Component scores (for debugging/analysis)
    rpeCreepScore: integer('rpe_creep_score').default(0),       // 0-2
    performanceScore: integer('performance_score').default(0),  // 0-2
    recoveryDebtScore: integer('recovery_debt_score').default(0), // 0-3
    volumeLoadScore: integer('volume_load_score').default(0),   // 0-2
    streakScore: integer('streak_score').default(0),            // 0-1

    // Recommendations generated
    recommendations: text('recommendations').array(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('fatigue_logs_user_date_idx').on(table.userId, table.date)]
);

// Deload period tracking
export const deloadPeriods = pgTable(
  'deload_periods',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Period timing
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    durationDays: integer('duration_days').notNull(),

    // Deload configuration
    deloadType: deloadTypeEnum('deload_type').notNull(),
    volumeModifier: decimal('volume_modifier', { precision: 3, scale: 2 }).default('0.60'), // e.g., 0.60 = 60%
    intensityModifier: decimal('intensity_modifier', { precision: 3, scale: 2 }).default('1.00'),

    // Trigger info
    triggerReason: varchar('trigger_reason', { length: 100 }).notNull(), // 'scheduled', 'fatigue_high', 'manual'
    fatigueScoreAtTrigger: integer('fatigue_score_at_trigger'),

    // Status
    isActive: boolean('is_active').default(true),
    completedAt: timestamp('completed_at'),

    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('deload_periods_user_active_idx').on(table.userId, table.isActive)]
);

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many, one }) => ({
  userPrograms: many(userPrograms),
  workouts: many(workouts),
  weightEntries: many(weightEntries),
  personalRecords: many(personalRecords),
  streak: one(streaks),
  exerciseDefaults: many(userExerciseDefaults),
  // PPL System
  preferences: one(userPreferences),
  recoveryLogs: many(recoveryLogs),
  workoutSessions: many(workoutSessions),
  // Phase 5: Fatigue & Deload
  fatigueLogs: many(fatigueLogs),
  deloadPeriods: many(deloadPeriods),
}));

export const programsRelations = relations(programs, ({ many }) => ({
  days: many(programDays),
  userPrograms: many(userPrograms),
}));

export const programDaysRelations = relations(programDays, ({ one, many }) => ({
  program: one(programs, {
    fields: [programDays.programId],
    references: [programs.id],
  }),
  exercises: many(programExercises),
}));

export const programExercisesRelations = relations(programExercises, ({ one }) => ({
  programDay: one(programDays, {
    fields: [programExercises.programDayId],
    references: [programDays.id],
  }),
  exercise: one(exercises, {
    fields: [programExercises.exerciseId],
    references: [exercises.id],
  }),
}));

export const userProgramsRelations = relations(userPrograms, ({ one }) => ({
  user: one(users, {
    fields: [userPrograms.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [userPrograms.programId],
    references: [programs.id],
  }),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  programDay: one(programDays, {
    fields: [workouts.programDayId],
    references: [programDays.id],
  }),
  sets: many(workoutSets),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutSets.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workoutSets.exerciseId],
    references: [exercises.id],
  }),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  programExercises: many(programExercises),
  workoutSets: many(workoutSets),
  personalRecords: many(personalRecords),
  userDefaults: many(userExerciseDefaults),
  // Relationships where this exercise is the source
  relationships: many(exerciseRelationships, { relationName: 'exerciseRelationships' }),
  // Relationships where this exercise is the target
  relatedFrom: many(exerciseRelationships, { relationName: 'relatedExerciseRelationships' }),
  // PPL System
  sessionExercises: many(sessionExercises),
  warmupPhaseExercises: many(warmupPhaseExercises),
}));

export const exerciseRelationshipsRelations = relations(exerciseRelationships, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseRelationships.exerciseId],
    references: [exercises.id],
    relationName: 'exerciseRelationships',
  }),
  relatedExercise: one(exercises, {
    fields: [exerciseRelationships.relatedExerciseId],
    references: [exercises.id],
    relationName: 'relatedExerciseRelationships',
  }),
}));

export const musclesRelations = relations(muscles, ({ many }) => ({
  // Future: could link to exercises through junction table
}));

export const equipmentItemsRelations = relations(equipmentItems, ({ many }) => ({
  // Future: could link to exercises through junction table
}));

export const weightEntriesRelations = relations(weightEntries, ({ one }) => ({
  user: one(users, {
    fields: [weightEntries.userId],
    references: [users.id],
  }),
}));

export const personalRecordsRelations = relations(personalRecords, ({ one }) => ({
  user: one(users, {
    fields: [personalRecords.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [personalRecords.exerciseId],
    references: [exercises.id],
  }),
  workoutSet: one(workoutSets, {
    fields: [personalRecords.workoutSetId],
    references: [workoutSets.id],
  }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id],
  }),
}));

export const userExerciseDefaultsRelations = relations(userExerciseDefaults, ({ one }) => ({
  user: one(users, {
    fields: [userExerciseDefaults.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [userExerciseDefaults.exerciseId],
    references: [exercises.id],
  }),
}));

// ============================================
// PPL SYSTEM RELATIONS
// ============================================

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const recoveryLogsRelations = relations(recoveryLogs, ({ one }) => ({
  user: one(users, {
    fields: [recoveryLogs.userId],
    references: [users.id],
  }),
}));

export const programTemplatesRelations = relations(programTemplates, ({ many }) => ({
  days: many(templateDays),
}));

export const templateDaysRelations = relations(templateDays, ({ one, many }) => ({
  template: one(programTemplates, {
    fields: [templateDays.templateId],
    references: [programTemplates.id],
  }),
  slots: many(templateSlots),
  workoutSessions: many(workoutSessions),
}));

export const templateSlotsRelations = relations(templateSlots, ({ one, many }) => ({
  day: one(templateDays, {
    fields: [templateSlots.dayId],
    references: [templateDays.id],
  }),
  sessionExercises: many(sessionExercises),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [workoutSessions.userId],
    references: [users.id],
  }),
  templateDay: one(templateDays, {
    fields: [workoutSessions.templateDayId],
    references: [templateDays.id],
  }),
  exercises: many(sessionExercises),
  warmupLog: one(warmupLogs),
}));

export const sessionExercisesRelations = relations(sessionExercises, ({ one, many }) => ({
  session: one(workoutSessions, {
    fields: [sessionExercises.sessionId],
    references: [workoutSessions.id],
  }),
  slot: one(templateSlots, {
    fields: [sessionExercises.slotId],
    references: [templateSlots.id],
  }),
  exercise: one(exercises, {
    fields: [sessionExercises.exerciseId],
    references: [exercises.id],
  }),
  sets: many(sessionSets),
}));

export const sessionSetsRelations = relations(sessionSets, ({ one }) => ({
  sessionExercise: one(sessionExercises, {
    fields: [sessionSets.sessionExerciseId],
    references: [sessionExercises.id],
  }),
}));

export const warmupTemplatesRelations = relations(warmupTemplates, ({ many }) => ({
  phases: many(warmupPhases),
  logs: many(warmupLogs),
}));

export const warmupPhasesRelations = relations(warmupPhases, ({ one, many }) => ({
  template: one(warmupTemplates, {
    fields: [warmupPhases.templateId],
    references: [warmupTemplates.id],
  }),
  exercises: many(warmupPhaseExercises),
}));

export const warmupPhaseExercisesRelations = relations(warmupPhaseExercises, ({ one }) => ({
  phase: one(warmupPhases, {
    fields: [warmupPhaseExercises.phaseId],
    references: [warmupPhases.id],
  }),
  exercise: one(exercises, {
    fields: [warmupPhaseExercises.exerciseId],
    references: [exercises.id],
  }),
}));

export const warmupLogsRelations = relations(warmupLogs, ({ one }) => ({
  session: one(workoutSessions, {
    fields: [warmupLogs.sessionId],
    references: [workoutSessions.id],
  }),
  template: one(warmupTemplates, {
    fields: [warmupLogs.templateId],
    references: [warmupTemplates.id],
  }),
}));

// ============================================
// FATIGUE & DELOAD RELATIONS (Phase 5)
// ============================================

export const fatigueLogsRelations = relations(fatigueLogs, ({ one }) => ({
  user: one(users, {
    fields: [fatigueLogs.userId],
    references: [users.id],
  }),
}));

export const deloadPeriodsRelations = relations(deloadPeriods, ({ one }) => ({
  user: one(users, {
    fields: [deloadPeriods.userId],
    references: [users.id],
  }),
}));
