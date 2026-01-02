/**
 * Test Encryption Setup
 *
 * Verifies that encryption is properly configured and working.
 * Usage: npx tsx scripts/test-encryption.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { encrypt, decrypt } from '../lib/security/encryption';

console.log('🔐 Testing MO:SELF Encryption Setup\n');

// Check if ENCRYPTION_KEY is set
if (!process.env.ENCRYPTION_KEY) {
  console.log('❌ ENCRYPTION_KEY not found in environment');
  console.log('   Run: npx tsx scripts/generate-encryption-key.ts');
  process.exit(1);
}

console.log('✅ ENCRYPTION_KEY found in environment\n');

// Test basic encryption/decryption
console.log('Testing encryption/decryption...');

try {
  const testCases = [
    'John Doe',
    '1990-05-15',
    '180',
    'Male',
    'I have a history of lower back pain',
    '',
    null,
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const encrypted = encrypt(testCase);
      const decrypted = decrypt(encrypted);

      if (testCase === null || testCase === '') {
        if (encrypted === null && decrypted === null) {
          console.log(`  ✅ Null/empty handling: PASS`);
          passed++;
        } else {
          console.log(`  ❌ Null/empty handling: FAIL`);
          failed++;
        }
      } else {
        if (decrypted === testCase) {
          console.log(`  ✅ "${testCase.substring(0, 20)}...": PASS`);
          passed++;
        } else {
          console.log(`  ❌ "${testCase}": FAIL (got: ${decrypted})`);
          failed++;
        }
      }
    } catch (error) {
      console.log(
        `  ❌ "${testCase}": ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('✅ All encryption tests passed!');
    console.log('   Your encryption setup is working correctly.\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check your encryption setup.\n');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Encryption test failed:');
  console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  process.exit(1);
}
