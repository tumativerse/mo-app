import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { decrypt } from '../lib/security/encryption';

config({ path: resolve(__dirname, '../.env.local') });

async function verifyEncryption() {
  console.log('🔍 Verifying Data Encryption\n');

  const allUsers = await db.select().from(users);

  console.log(`Found ${allUsers.length} users\n`);

  for (const user of allUsers) {
    console.log(`User: ${user.email}`);
    console.log(`  ID: ${user.id}`);

    const fieldsToCheck = [
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

    for (const field of fieldsToCheck) {
      const value = (user as Record<string, unknown>)[field];
      if (value && typeof value === 'string') {
        // Try to decrypt it - if it decrypts, it's encrypted
        try {
          const decrypted = decrypt(value);
          if (decrypted && decrypted !== value) {
            console.log(`  ✅ ${field}: ENCRYPTED (decrypts to "${decrypted.substring(0, 30)}...")`);
          } else {
            console.log(`  ⚠️  ${field}: PLAIN TEXT - "${value}"`);
          }
        } catch {
          console.log(`  ⚠️  ${field}: Failed to decrypt (corrupted?) - "${value.substring(0, 30)}..."`);
        }
      } else {
        console.log(`  -  ${field}: null`);
      }
    }

    console.log('');
  }

  process.exit(0);
}

verifyEncryption().catch(console.error);
