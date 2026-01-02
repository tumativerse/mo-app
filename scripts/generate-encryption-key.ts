/**
 * Generate Encryption Key for MO:SELF
 *
 * Run this script to generate a new encryption key for securing user data.
 * Usage: npx tsx scripts/generate-encryption-key.ts
 */

import { generateEncryptionKey } from '../lib/security/encryption';

console.log('🔐 MO:SELF Encryption Key Generator\n');
console.log('Generating 256-bit AES encryption key...\n');

const key = generateEncryptionKey();

console.log('✅ Key generated successfully!\n');
console.log('Add this to your .env.local file:\n');
console.log('─'.repeat(60));
console.log(`ENCRYPTION_KEY=${key}`);
console.log('─'.repeat(60));
console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('   • Never commit this key to version control');
console.log('   • Keep this key secret and secure');
console.log('   • Store it in .env.local (already in .gitignore)');
console.log('   • Use the same key across all environments for the same database');
console.log('   • If you lose this key, encrypted data cannot be recovered');
console.log('\n📝 Next steps:');
console.log('   1. Copy the ENCRYPTION_KEY line above');
console.log('   2. Add it to mo/mo-app/.env.local');
console.log('   3. Restart your development server');
console.log('   4. Run encryption test: npm run test:encryption\n');
