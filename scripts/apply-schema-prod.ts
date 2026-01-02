import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

config({ path: resolve(__dirname, '../.env.local') });

const statements = [
  // Create ENUMs
  `CREATE TYPE IF NOT EXISTS "public"."activity_level" AS ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active')`,
  `CREATE TYPE IF NOT EXISTS "public"."gender" AS ENUM('male', 'female', 'non_binary', 'prefer_not_to_say')`,
  `CREATE TYPE IF NOT EXISTS "public"."occupation_type" AS ENUM('desk_job', 'standing_job', 'physical_labor', 'mixed', 'student', 'retired', 'other')`,

  // Users table - convert to text
  `ALTER TABLE "users" ALTER COLUMN "full_name" SET DATA TYPE text`,
  `ALTER TABLE "users" ALTER COLUMN "height_cm" SET DATA TYPE text USING height_cm::text`,
  `ALTER TABLE "users" ALTER COLUMN "current_weight" SET DATA TYPE text USING current_weight::text`,
  `ALTER TABLE "users" ALTER COLUMN "goal_weight" SET DATA TYPE text USING goal_weight::text`,
  `ALTER TABLE "users" ALTER COLUMN "injury_history" SET DATA TYPE text USING array_to_string(injury_history, ',')`,

  // Users table - add new columns
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_of_birth" text`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" text`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "chronic_conditions" text`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "medications" text`,

  // User preferences - convert to text
  `ALTER TABLE "user_preferences" ALTER COLUMN "fitness_goal" SET DATA TYPE text`,
  `ALTER TABLE "user_preferences" ALTER COLUMN "experience_level" SET DATA TYPE text`,
  `ALTER TABLE "user_preferences" ALTER COLUMN "training_frequency" SET DATA TYPE text USING training_frequency::text`,
  `ALTER TABLE "user_preferences" ALTER COLUMN "session_duration" SET DATA TYPE text USING session_duration::text`,
  `ALTER TABLE "user_preferences" ALTER COLUMN "focus_areas" SET DATA TYPE text USING array_to_string(focus_areas, ',')`,
  `ALTER TABLE "user_preferences" ALTER COLUMN "default_equipment_level" SET DATA TYPE text`,
  `ALTER TABLE "user_preferences" ALTER COLUMN "available_equipment" SET DATA TYPE text USING array_to_string(available_equipment, ',')`,
  `ALTER TABLE "user_preferences" ALTER COLUMN "preferred_cardio" SET DATA TYPE text`,

  // User preferences - add new columns
  `ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "preferred_training_times" text`,
  `ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "rest_days_preference" text`,
  `ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "activity_level" text`,
  `ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "occupation_type" text`,
  `ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "typical_bedtime" text`,
  `ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "typical_wake_time" text`,
];

async function applySchema() {
  console.log('🔄 Applying schema changes to production...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 70) + (stmt.length > 70 ? '...' : '');

    try {
      console.log(`[${i + 1}/${statements.length}] ${preview}`);
      await db.execute(sql.raw(stmt));
      successCount++;
    } catch (error: unknown) {
      // Some statements may fail if already applied (e.g., column already exists)
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('already exists') || message.includes('does not exist')) {
        console.log(`   ⚠️  Already applied or not applicable`);
        successCount++;
      } else {
        console.log(`   ❌ Error: ${message}`);
        failCount++;
      }
    }
  }

  console.log(`\n✅ Schema migration complete!`);
  console.log(`   Success: ${successCount}/${statements.length}`);
  console.log(`   Failed: ${failCount}/${statements.length}`);

  process.exit(failCount > 0 ? 1 : 0);
}

applySchema().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
