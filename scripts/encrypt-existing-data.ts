/**
 * Encrypt Existing Data in Production
 *
 * This script encrypts all plain text data in the database.
 * Run AFTER schema changes have been applied.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '../lib/db';
import { users, userPreferences } from '../lib/db/schema';
import { encrypt } from '../lib/security/encryption';
import { eq } from 'drizzle-orm';

config({ path: resolve(__dirname, '../.env.local') });

const DRY_RUN = process.argv.includes('--dry-run');
const EXECUTE = process.argv.includes('--execute');

async function main() {
  console.log('🔐 Encrypting Existing User Data\n');

  if (!DRY_RUN && !EXECUTE) {
    console.log('❌ Error: You must specify either --dry-run or --execute\n');
    console.log('Usage:');
    console.log('  Dry run:  npx tsx scripts/encrypt-existing-data.ts --dry-run');
    console.log('  Execute:  npx tsx scripts/encrypt-existing-data.ts --execute\n');
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
    process.exit(1);
  }

  console.log('✅ Encryption key found\n');

  try {
    // ===== ENCRYPT USERS TABLE =====
    console.log('📊 Fetching users...');
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users\n`);

    if (allUsers.length === 0) {
      console.log('No users to encrypt\n');
      return;
    }

    for (const user of allUsers) {
      console.log(`User: ${user.email}`);
      const updates: Record<string, string | null> = {};
      let hasUpdates = false;

      // Check and encrypt each field
      const fieldsToEncrypt = [
        'fullName',
        'dateOfBirth',
        'gender',
        'heightCm',
        'currentWeight',
        'goalWeight',
        'injuryHistory',
        'chronicConditions',
        'medications',
      ];

      for (const field of fieldsToEncrypt) {
        const value = (user as Record<string, unknown>)[field];
        if (value && typeof value === 'string') {
          // Check if already encrypted (encrypted data is base64 and much longer)
          const isAlreadyEncrypted = value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value);

          if (!isAlreadyEncrypted) {
            console.log(
              `  - Encrypting ${field}: "${value.substring(0, 20)}${value.length > 20 ? '...' : ''}"`
            );
            updates[field] = encrypt(value);
            hasUpdates = true;
          } else {
            console.log(`  - ${field}: Already encrypted`);
          }
        }
      }

      if (hasUpdates && EXECUTE) {
        console.log(`  ✅ Updating user ${user.id}`);
        await db.update(users).set(updates).where(eq(users.id, user.id));
      } else if (hasUpdates) {
        console.log(`  [DRY RUN] Would update user ${user.id}`);
      } else {
        console.log(`  ℹ️  No updates needed`);
      }

      console.log('');
    }

    // ===== ENCRYPT USER_PREFERENCES TABLE =====
    console.log('📊 Fetching user preferences...');
    const allPrefs = await db.select().from(userPreferences);
    console.log(`Found ${allPrefs.length} preference records\n`);

    for (const pref of allPrefs) {
      console.log(`Preferences for user: ${pref.userId}`);
      const updates: Record<string, string | null> = {};
      let hasUpdates = false;

      const fieldsToEncrypt = [
        'fitnessGoal',
        'experienceLevel',
        'trainingFrequency',
        'sessionDuration',
        'focusAreas',
        'defaultEquipmentLevel',
        'availableEquipment',
        'preferredCardio',
        'preferredTrainingTimes',
        'restDaysPreference',
        'activityLevel',
        'occupationType',
        'typicalBedtime',
        'typicalWakeTime',
      ];

      for (const field of fieldsToEncrypt) {
        const value = (pref as Record<string, unknown>)[field];
        if (value && typeof value === 'string') {
          const isAlreadyEncrypted = value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value);

          if (!isAlreadyEncrypted) {
            console.log(
              `  - Encrypting ${field}: "${value.substring(0, 20)}${value.length > 20 ? '...' : ''}"`
            );
            updates[field] = encrypt(value);
            hasUpdates = true;
          }
        }
      }

      if (hasUpdates && EXECUTE) {
        console.log(`  ✅ Updating preferences ${pref.id}`);
        await db.update(userPreferences).set(updates).where(eq(userPreferences.id, pref.id));
      } else if (hasUpdates) {
        console.log(`  [DRY RUN] Would update preferences ${pref.id}`);
      } else {
        console.log(`  ℹ️  No updates needed`);
      }

      console.log('');
    }

    console.log('✅ Data encryption complete!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main().catch(console.error);
