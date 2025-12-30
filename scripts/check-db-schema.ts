import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

config({ path: resolve(__dirname, '../.env.local') });

async function checkSchema() {
  console.log('Checking production database schema...\n');

  // Check users table
  const usersColumns = await db.execute(sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  `);

  console.log('=== USERS TABLE COLUMNS ===');
  usersColumns.rows.forEach((r: any) => {
    console.log(`  ${r.column_name.padEnd(25)} ${r.data_type}`);
  });

  // Check user_preferences table
  const prefsColumns = await db.execute(sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'user_preferences'
    ORDER BY ordinal_position
  `);

  console.log('\n=== USER_PREFERENCES TABLE COLUMNS ===');
  prefsColumns.rows.forEach((r: any) => {
    console.log(`  ${r.column_name.padEnd(25)} ${r.data_type}`);
  });

  // Count existing users
  const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
  console.log(`\n=== DATA ===`);
  console.log(`Total users: ${userCount.rows[0].count}`);

  process.exit(0);
}

checkSchema().catch(console.error);
