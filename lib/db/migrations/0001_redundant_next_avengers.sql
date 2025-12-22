CREATE TYPE "public"."body_position" AS ENUM('standing', 'seated', 'lying', 'bent_over', 'hanging', 'kneeling', 'prone', 'supine', 'incline', 'decline');--> statement-breakpoint
CREATE TYPE "public"."chain" AS ENUM('anterior', 'posterior', 'lateral');--> statement-breakpoint
CREATE TYPE "public"."day_type" AS ENUM('push', 'pull', 'legs', 'upper', 'lower', 'full_body');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('beginner', 'intermediate', 'advanced', 'elite');--> statement-breakpoint
CREATE TYPE "public"."equipment_category" AS ENUM('barbell', 'dumbbell', 'kettlebell', 'cable', 'machine', 'bodyweight', 'band', 'suspension', 'specialty', 'cardio_machine', 'other');--> statement-breakpoint
CREATE TYPE "public"."equipment_level" AS ENUM('full_gym', 'home_gym', 'bodyweight');--> statement-breakpoint
CREATE TYPE "public"."exercise_use" AS ENUM('training', 'warmup', 'both');--> statement-breakpoint
CREATE TYPE "public"."force_type" AS ENUM('push', 'pull', 'static', 'dynamic');--> statement-breakpoint
CREATE TYPE "public"."grip" AS ENUM('overhand', 'underhand', 'neutral', 'mixed', 'hook', 'false');--> statement-breakpoint
CREATE TYPE "public"."grip_width" AS ENUM('narrow', 'shoulder_width', 'wide');--> statement-breakpoint
CREATE TYPE "public"."kinetic_chain" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."muscle_group" AS ENUM('chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'glutes', 'full_body');--> statement-breakpoint
CREATE TYPE "public"."plane" AS ENUM('sagittal', 'frontal', 'transverse');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('essential', 'common', 'specialized', 'niche');--> statement-breakpoint
CREATE TYPE "public"."relationship_type" AS ENUM('variation', 'alternative', 'progression', 'regression');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('planned', 'warmup', 'in_progress', 'completed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."slot_type" AS ENUM('primary', 'secondary', 'accessory', 'optional');--> statement-breakpoint
CREATE TYPE "public"."stance" AS ENUM('hip_width', 'narrow', 'wide', 'staggered', 'split', 'single_leg');--> statement-breakpoint
CREATE TYPE "public"."warmup_phase_type" AS ENUM('general', 'dynamic', 'movement_prep');--> statement-breakpoint
ALTER TYPE "public"."movement_pattern" ADD VALUE 'carry' BEFORE 'isolation_push';--> statement-breakpoint
ALTER TYPE "public"."movement_pattern" ADD VALUE 'plyometric' BEFORE 'cardio';--> statement-breakpoint
ALTER TYPE "public"."movement_pattern" ADD VALUE 'olympic' BEFORE 'cardio';--> statement-breakpoint
ALTER TYPE "public"."movement_pattern" ADD VALUE 'mobility' BEFORE 'cardio';--> statement-breakpoint
CREATE TABLE "equipment_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"category" "equipment_category" NOT NULL,
	"description" text,
	"is_common" boolean DEFAULT true,
	"is_home_gym" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "equipment_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "exercise_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"related_exercise_id" uuid NOT NULL,
	"relationship_type" "relationship_type" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "muscles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"muscle_group" "muscle_group" NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "muscles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "program_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"days_per_week" integer NOT NULL,
	"goal" varchar(50),
	"experience_level" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "program_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "recovery_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"sleep_hours" numeric(3, 1),
	"sleep_quality" integer,
	"energy_level" integer,
	"overall_soreness" integer,
	"soreness_areas" text[],
	"stress_level" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"slot_id" uuid,
	"exercise_id" uuid NOT NULL,
	"exercise_order" integer NOT NULL,
	"is_substituted" boolean DEFAULT false,
	"is_custom" boolean DEFAULT false,
	"target_sets" integer NOT NULL,
	"target_rep_min" integer NOT NULL,
	"target_rep_max" integer NOT NULL,
	"target_rpe" numeric(3, 1),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_exercise_id" uuid NOT NULL,
	"set_number" integer NOT NULL,
	"weight" numeric(6, 2),
	"weight_unit" varchar(10) DEFAULT 'lbs',
	"reps" integer,
	"rpe" numeric(3, 1),
	"is_warmup" boolean DEFAULT false,
	"notes" text,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "template_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"day_order" integer NOT NULL,
	"day_type" "day_type" NOT NULL,
	"variation" varchar(1),
	"estimated_duration" integer,
	"target_muscles" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"slot_order" integer NOT NULL,
	"slot_type" "slot_type" NOT NULL,
	"movement_pattern" varchar(50) NOT NULL,
	"target_muscles" text[] NOT NULL,
	"sets" integer NOT NULL,
	"rep_range_min" integer NOT NULL,
	"rep_range_max" integer NOT NULL,
	"rpe_target" numeric(3, 1),
	"rest_seconds" integer DEFAULT 120,
	"is_optional" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"fitness_goal" varchar(50),
	"experience_level" varchar(50),
	"training_frequency" integer DEFAULT 6,
	"session_duration" integer DEFAULT 75,
	"focus_areas" text[],
	"default_equipment_level" "equipment_level" DEFAULT 'full_gym',
	"available_equipment" text[],
	"warmup_duration" varchar(20) DEFAULT 'normal',
	"skip_general_warmup" boolean DEFAULT false,
	"include_mobility_work" boolean DEFAULT true,
	"preferred_cardio" varchar(50),
	"weight_unit" varchar(10) DEFAULT 'lbs',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "warmup_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"template_id" uuid,
	"started_at" timestamp,
	"completed_at" timestamp,
	"phases_completed" integer DEFAULT 0,
	"skipped" boolean DEFAULT false,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "warmup_phase_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phase_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"exercise_order" integer NOT NULL,
	"sets" integer DEFAULT 1,
	"reps" integer,
	"duration_seconds" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warmup_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"phase_order" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"phase_type" "warmup_phase_type" NOT NULL,
	"duration_seconds" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warmup_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"day_type" "day_type" NOT NULL,
	"target_muscles" text[],
	"duration_minutes" integer DEFAULT 10,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_day_id" uuid,
	"date" timestamp NOT NULL,
	"equipment_level" "equipment_level" NOT NULL,
	"status" "session_status" DEFAULT 'planned',
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration_minutes" integer,
	"total_sets" integer,
	"total_volume" numeric(10, 2),
	"avg_rpe" numeric(3, 1),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "patterns" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "stabilizers" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "equipment_details" text;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "body_positions" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "grips" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "grip_widths" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "stances" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "force_type" "force_type";--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "plane" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "chain" "chain";--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "kinetic_chain" "kinetic_chain";--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "is_bilateral" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "exercise_types" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "difficulty" "difficulty";--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "priority" "priority";--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "rep_range_strength" text;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "rep_range_hypertrophy" text;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "rep_range_endurance" text;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "default_sets" text;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "default_rest_seconds" integer;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "joints" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "injury_considerations" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "contraindications" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "exercise_use" "exercise_use" DEFAULT 'training';--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "injury_history" text[];--> statement-breakpoint
ALTER TABLE "exercise_relationships" ADD CONSTRAINT "exercise_relationships_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_relationships" ADD CONSTRAINT "exercise_relationships_related_exercise_id_exercises_id_fk" FOREIGN KEY ("related_exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_logs" ADD CONSTRAINT "recovery_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_slot_id_template_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."template_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_sets" ADD CONSTRAINT "session_sets_session_exercise_id_session_exercises_id_fk" FOREIGN KEY ("session_exercise_id") REFERENCES "public"."session_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_days" ADD CONSTRAINT "template_days_template_id_program_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."program_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_slots" ADD CONSTRAINT "template_slots_day_id_template_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."template_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warmup_logs" ADD CONSTRAINT "warmup_logs_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warmup_logs" ADD CONSTRAINT "warmup_logs_template_id_warmup_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."warmup_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warmup_phase_exercises" ADD CONSTRAINT "warmup_phase_exercises_phase_id_warmup_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."warmup_phases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warmup_phase_exercises" ADD CONSTRAINT "warmup_phase_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warmup_phases" ADD CONSTRAINT "warmup_phases_template_id_warmup_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."warmup_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_template_day_id_template_days_id_fk" FOREIGN KEY ("template_day_id") REFERENCES "public"."template_days"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "recovery_logs_user_date_idx" ON "recovery_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "session_exercises_order_idx" ON "session_exercises" USING btree ("session_id","exercise_order");--> statement-breakpoint
CREATE UNIQUE INDEX "template_days_order_idx" ON "template_days" USING btree ("template_id","day_order");--> statement-breakpoint
CREATE UNIQUE INDEX "template_slots_order_idx" ON "template_slots" USING btree ("day_id","slot_order");--> statement-breakpoint
CREATE UNIQUE INDEX "warmup_phase_exercises_order_idx" ON "warmup_phase_exercises" USING btree ("phase_id","exercise_order");--> statement-breakpoint
CREATE UNIQUE INDEX "warmup_phases_order_idx" ON "warmup_phases" USING btree ("template_id","phase_order");--> statement-breakpoint
CREATE UNIQUE INDEX "warmup_templates_day_type_idx" ON "warmup_templates" USING btree ("day_type");--> statement-breakpoint
CREATE UNIQUE INDEX "workout_sessions_user_date_idx" ON "workout_sessions" USING btree ("user_id","date");