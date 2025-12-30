-- Schema Migration: Add Encryption Support to MO:SELF
-- Generated from drizzle-kit push output
-- Execute this to apply schema changes directly

-- Create new ENUM types
CREATE TYPE IF NOT EXISTS "public"."activity_level" AS ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active');
CREATE TYPE IF NOT EXISTS "public"."gender" AS ENUM('male', 'female', 'non_binary', 'prefer_not_to_say');
CREATE TYPE IF NOT EXISTS "public"."occupation_type" AS ENUM('desk_job', 'standing_job', 'physical_labor', 'mixed', 'student', 'retired', 'other');

-- Alter users table columns to TEXT (for encryption)
ALTER TABLE "users" ALTER COLUMN "full_name" SET DATA TYPE text;
ALTER TABLE "users" ALTER COLUMN "height_cm" SET DATA TYPE text;
ALTER TABLE "users" ALTER COLUMN "current_weight" SET DATA TYPE text;
ALTER TABLE "users" ALTER COLUMN "goal_weight" SET DATA TYPE text;
ALTER TABLE "users" ALTER COLUMN "injury_history" SET DATA TYPE text;

-- Add new encrypted columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_of_birth" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "chronic_conditions" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "medications" text;

-- Alter user_preferences table columns to TEXT (for encryption)
ALTER TABLE "user_preferences" ALTER COLUMN "fitness_goal" SET DATA TYPE text;
ALTER TABLE "user_preferences" ALTER COLUMN "experience_level" SET DATA TYPE text;
ALTER TABLE "user_preferences" ALTER COLUMN "training_frequency" SET DATA TYPE text;
ALTER TABLE "user_preferences" ALTER COLUMN "training_frequency" DROP DEFAULT;
ALTER TABLE "user_preferences" ALTER COLUMN "session_duration" SET DATA TYPE text;
ALTER TABLE "user_preferences" ALTER COLUMN "session_duration" DROP DEFAULT;
ALTER TABLE "user_preferences" ALTER COLUMN "focus_areas" SET DATA TYPE text;
ALTER TABLE "user_preferences" ALTER COLUMN "default_equipment_level" SET DATA TYPE text;
ALTER TABLE "user_preferences" ALTER COLUMN "default_equipment_level" DROP DEFAULT;
ALTER TABLE "user_preferences" ALTER COLUMN "available_equipment" SET DATA TYPE text;
ALTER TABLE "user_preferences" ALTER COLUMN "preferred_cardio" SET DATA TYPE text;

-- Add new encrypted columns to user_preferences table
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "preferred_training_times" text;
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "rest_days_preference" text;
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "activity_level" text;
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "occupation_type" text;
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "typical_bedtime" text;
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "typical_wake_time" text;
