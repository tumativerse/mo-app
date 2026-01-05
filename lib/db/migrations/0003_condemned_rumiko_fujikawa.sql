CREATE TYPE "public"."activity_level" AS ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'non_binary', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."occupation_type" AS ENUM('desk_job', 'standing_job', 'physical_labor', 'mixed', 'student', 'retired', 'other');--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"goal_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"target_date" timestamp NOT NULL,
	"starting_weight" numeric(5, 2) NOT NULL,
	"target_weight" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"goal_id" uuid,
	"date" timestamp DEFAULT now() NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "fitness_goal" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "experience_level" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "training_frequency" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "training_frequency" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "session_duration" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "session_duration" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "focus_areas" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "default_equipment_level" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "default_equipment_level" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "available_equipment" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "preferred_cardio" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "full_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "height_cm" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "current_weight" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "goal_weight" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "injury_history" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "preferred_training_times" text;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "rest_days_preference" text;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "activity_level" text;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "occupation_type" text;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "typical_bedtime" text;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "typical_wake_time" text;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "theme" varchar(10) DEFAULT 'dark';--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "accent_color" varchar(7) DEFAULT '#10b981';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "chronic_conditions" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "medications" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "goals_user_id_idx" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goals_status_idx" ON "goals" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "measurements_user_date_idx" ON "measurements" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "measurements_user_id_idx" ON "measurements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "measurements_goal_id_idx" ON "measurements" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "measurements_date_idx" ON "measurements" USING btree ("date");