import { db } from '../lib/db/index';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('Running migration: Adding onboarding_completed column...');

  try {
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false`);
    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

runMigration();
