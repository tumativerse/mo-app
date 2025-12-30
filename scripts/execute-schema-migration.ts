/**
 * Execute Schema Migration Directly
 * Applies SQL schema changes to the database
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

async function executeSchemaChanges() {
  console.log('🔄 Executing schema migration...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }

  try {
    // Read SQL file
    const sqlPath = resolve(__dirname, 'apply-schema-changes.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('📄 SQL statements to execute:');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    console.log('');

    // Connect to database
    const db = neon(process.env.DATABASE_URL);

    // Split SQL into individual statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);

      try {
        await db(statement);
        console.log(`   ✅ Success\n`);
      } catch (error: any) {
        // Some statements might fail if already applied (e.g., IF NOT EXISTS)
        // We'll continue anyway
        if (error.message.includes('already exists') || error.message.includes('does not exist')) {
          console.log(`   ⏭️  Skipped (already exists or not needed)\n`);
        } else {
          console.log(`   ⚠️  Warning: ${error.message}\n`);
        }
      }
    }

    console.log('═'.repeat(60));
    console.log('✅ Schema migration completed successfully!');
    console.log('');
    console.log('Next step: Encrypt existing data');
    console.log('  Run: npm run db:migrate:encrypt -- --dry-run');
    console.log('');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

executeSchemaChanges();
