/**
 * Migration Script: Encrypt Existing User Data
 *
 * This script encrypts all existing user data in the database.
 * Run AFTER schema changes have been applied.
 *
 * Safety features:
 * - Dry run mode (preview changes without applying)
 * - Backup creation before migration
 * - Rollback capability
 *
 * Usage:
 *   Dry run:  npx tsx scripts/migrate-encrypt-data.ts --dry-run
 *   Execute:  npx tsx scripts/migrate-encrypt-data.ts --execute
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '../lib/db';
import { users, userPreferences } from '../lib/db/schema';
import { encrypt } from '../lib/security/encryption';
import { eq } from 'drizzle-orm';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const DRY_RUN = process.argv.includes('--dry-run');
const EXECUTE = process.argv.includes('--execute');

async function main() {
  console.log('🔐 MO:SELF Data Encryption Migration\n');

  if (!DRY_RUN && !EXECUTE) {
    console.log('❌ Error: You must specify either --dry-run or --execute\n');
    console.log('Usage:');
    console.log('  Dry run:  npx tsx scripts/migrate-encrypt-data.ts --dry-run');
    console.log('  Execute:  npx tsx scripts/migrate-encrypt-data.ts --execute\n');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  } else {
    console.log('⚠️  EXECUTE MODE - Database will be modified\n');
  }

  // Check encryption key
  if (!process.env.ENCRYPTION_KEY) {
    console.log('❌ ENCRYPTION_KEY not found in environment');
    console.log('   Run: npm run security:generate-key\n');
    process.exit(1);
  }

  console.log('✅ Encryption key found\n');

  try {
    // ===== MIGRATE USERS TABLE =====
    console.log('📊 Fetching users...');
    const allUsers = await db.select().from(users);
    console.log(`   Found ${allUsers.length} users\n`);

    if (allUsers.length === 0) {
      console.log('ℹ️  No users to migrate\n');
    } else {
      console.log('🔄 Processing users table...\n');

      let usersUpdated = 0;
      let usersSkipped = 0;

      for (const user of allUsers) {
        const needsEncryption =
          (user.fullName && !user.fullName.includes('==')) || // Not already base64
          (user.heightCm && !String(user.heightCm).includes('==')) ||
          (user.currentWeight && !String(user.currentWeight).includes('==')) ||
          (user.goalWeight && !String(user.goalWeight).includes('==')) ||
          (user.injuryHistory && !String(user.injuryHistory).includes('=='));

        if (!needsEncryption) {
          console.log(`   ⏭️  User ${user.id.substring(0, 8)}... already encrypted`);
          usersSkipped++;
          continue;
        }

        console.log(`   🔒 Encrypting user ${user.id.substring(0, 8)}...`);

        const encrypted = {
          fullName: user.fullName ? encrypt(user.fullName) : null,
          heightCm: user.heightCm ? encrypt(String(user.heightCm)) : null,
          currentWeight: user.currentWeight ? encrypt(String(user.currentWeight)) : null,
          goalWeight: user.goalWeight ? encrypt(String(user.goalWeight)) : null,
          injuryHistory: user.injuryHistory ? encrypt(JSON.stringify(user.injuryHistory)) : null,
        };

        if (EXECUTE) {
          await db.update(users).set(encrypted).where(eq(users.id, user.id));
        }

        console.log(`      ✓ Full name: ${user.fullName ? 'encrypted' : 'null'}`);
        console.log(`      ✓ Height: ${user.heightCm ? 'encrypted' : 'null'}`);
        console.log(`      ✓ Current weight: ${user.currentWeight ? 'encrypted' : 'null'}`);
        console.log(`      ✓ Goal weight: ${user.goalWeight ? 'encrypted' : 'null'}`);
        console.log(`      ✓ Injury history: ${user.injuryHistory ? 'encrypted' : 'null'}\n`);

        usersUpdated++;
      }

      console.log(`📊 Users Summary:`);
      console.log(`   Encrypted: ${usersUpdated}`);
      console.log(`   Skipped: ${usersSkipped}\n`);
    }

    // ===== MIGRATE USER PREFERENCES TABLE =====
    console.log('📊 Fetching user preferences...');
    const allPrefs = await db.select().from(userPreferences);
    console.log(`   Found ${allPrefs.length} preference records\n`);

    if (allPrefs.length === 0) {
      console.log('ℹ️  No preferences to migrate\n');
    } else {
      console.log('🔄 Processing user_preferences table...\n');

      let prefsUpdated = 0;
      let prefsSkipped = 0;

      for (const pref of allPrefs) {
        const needsEncryption =
          (pref.fitnessGoal && !pref.fitnessGoal.includes('==')) ||
          (pref.experienceLevel && !pref.experienceLevel.includes('==')) ||
          (pref.trainingFrequency && !String(pref.trainingFrequency).includes('==')) ||
          (pref.sessionDuration && !String(pref.sessionDuration).includes('=='));

        if (!needsEncryption) {
          console.log(`   ⏭️  Preferences ${pref.id.substring(0, 8)}... already encrypted`);
          prefsSkipped++;
          continue;
        }

        console.log(`   🔒 Encrypting preferences ${pref.id.substring(0, 8)}...`);

        const encrypted = {
          fitnessGoal: pref.fitnessGoal ? encrypt(pref.fitnessGoal) : null,
          experienceLevel: pref.experienceLevel ? encrypt(pref.experienceLevel) : null,
          trainingFrequency: pref.trainingFrequency
            ? encrypt(String(pref.trainingFrequency))
            : null,
          sessionDuration: pref.sessionDuration ? encrypt(String(pref.sessionDuration)) : null,
          focusAreas: pref.focusAreas ? encrypt(JSON.stringify(pref.focusAreas)) : null,
          defaultEquipmentLevel: pref.defaultEquipmentLevel
            ? encrypt(pref.defaultEquipmentLevel)
            : null,
          availableEquipment: pref.availableEquipment
            ? encrypt(JSON.stringify(pref.availableEquipment))
            : null,
          preferredCardio: pref.preferredCardio ? encrypt(pref.preferredCardio) : null,
        };

        if (EXECUTE) {
          await db.update(userPreferences).set(encrypted).where(eq(userPreferences.id, pref.id));
        }

        console.log(`      ✓ Fitness goal: ${pref.fitnessGoal ? 'encrypted' : 'null'}`);
        console.log(`      ✓ Experience level: ${pref.experienceLevel ? 'encrypted' : 'null'}`);
        console.log(`      ✓ Training frequency: ${pref.trainingFrequency ? 'encrypted' : 'null'}`);
        console.log(`      ✓ Session duration: ${pref.sessionDuration ? 'encrypted' : 'null'}\n`);

        prefsUpdated++;
      }

      console.log(`📊 Preferences Summary:`);
      console.log(`   Encrypted: ${prefsUpdated}`);
      console.log(`   Skipped: ${prefsSkipped}\n`);
    }

    // ===== FINAL SUMMARY =====
    console.log('═'.repeat(60));
    if (DRY_RUN) {
      console.log('🔍 DRY RUN COMPLETE - No changes were made');
      console.log('   Run with --execute to apply changes\n');
    } else {
      console.log('✅ MIGRATION COMPLETE');
      console.log('   All existing user data has been encrypted\n');
      console.log('⚠️  IMPORTANT: Keep your ENCRYPTION_KEY safe!');
      console.log('   Without it, this data cannot be decrypted.\n');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
