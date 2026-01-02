/**
 * MO:SELF Security Layer
 * Application-level encryption for sensitive user data
 *
 * Uses AES-256-GCM for authenticated encryption
 * All personally identifiable information is encrypted before storage
 */

import crypto from 'crypto';

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Get encryption key from environment
 * @throws Error if ENCRYPTION_KEY is not set
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is not set. ' +
        'Generate one using: openssl rand -hex 32'
    );
  }

  // Convert hex string to buffer
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt plaintext data
 * @param plaintext - Data to encrypt (will be converted to string)
 * @returns Base64-encoded encrypted data with IV and auth tag
 */
export function encrypt(plaintext: string | number | boolean | null | undefined): string | null {
  // Handle null/undefined values
  if (plaintext === null || plaintext === undefined || plaintext === '') {
    return null;
  }

  try {
    // Convert to string
    const text = String(plaintext);

    // Generate random IV for this encryption
    const iv = crypto.randomBytes(IV_LENGTH);

    // Get encryption key
    const key = getEncryptionKey();

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + encrypted data
    // Format: [IV(16 bytes)][AuthTag(16 bytes)][EncryptedData]
    const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'base64')]);

    // Return as base64 string for database storage
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Helper: Format error message for logging (exported for testing)
 * @param error - Error object or other value
 * @returns Error message string
 */
export function formatErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

/**
 * Decrypt encrypted data
 * @param ciphertext - Base64-encoded encrypted data
 * @returns Decrypted plaintext
 */
export function decrypt(ciphertext: string | null | undefined): string | null {
  // Handle null/undefined values
  if (!ciphertext) {
    return null;
  }

  try {
    // Decode from base64
    const combined = Buffer.from(ciphertext, 'base64');

    // Check if data is properly formatted for decryption
    // Encrypted data must be at least IV_LENGTH + AUTH_TAG_LENGTH bytes
    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      throw new Error(
        `Data too short to be encrypted (${combined.length} bytes). ` +
          'Expected at least 32 bytes for AES-256-GCM. ' +
          'Data may be corrupted or not encrypted.'
      );
    }

    // Extract components
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    // Get encryption key
    const key = getEncryptionKey();

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Log error for monitoring
    console.error('CRITICAL: Decryption failed:', {
      error: formatErrorMessage(error),
      dataLength: ciphertext.length,
      dataPreview: ciphertext.substring(0, 50) + '...',
    });

    // Throw error with helpful message
    throw new Error(
      'Failed to decrypt data. This could indicate: ' +
        '(1) Data corruption in database, ' +
        '(2) Incorrect ENCRYPTION_KEY, or ' +
        '(3) Data encrypted with different key. ' +
        `Original error: ${formatErrorMessage(error)}`
    );
  }
}

/**
 * Encrypt an object's specified fields
 * @param obj - Object containing data to encrypt
 * @param fields - Array of field names to encrypt
 * @returns New object with specified fields encrypted
 */
export function encryptFields<T extends Record<string, unknown>>(obj: T, fields: (keyof T)[]): T {
  const encrypted = { ...obj };

  for (const field of fields) {
    if (field in obj) {
      encrypted[field] = encrypt(String(obj[field])) as T[keyof T];
    }
  }

  return encrypted;
}

/**
 * Decrypt an object's specified fields
 * @param obj - Object containing encrypted data
 * @param fields - Array of field names to decrypt
 * @returns New object with specified fields decrypted
 */
export function decryptFields<T extends Record<string, unknown>>(obj: T, fields: (keyof T)[]): T {
  const decrypted = { ...obj };

  for (const field of fields) {
    if (field in obj) {
      decrypted[field] = decrypt(String(obj[field])) as T[keyof T];
    }
  }

  return decrypted;
}

/**
 * Generate a new encryption key
 * Use this to generate the ENCRYPTION_KEY for your .env file
 * @returns Hex-encoded 256-bit key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Test encryption/decryption roundtrip
 * Used for verification in tests
 */
export function testEncryption(): boolean {
  try {
    const testData = 'Hello, Mo! 🔒';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);
    return decrypted === testData;
  } catch {
    return false;
  }
}
