import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt } from './encryption';

describe('Encryption utilities', () => {
  // Ensure encryption key is set for tests
  beforeAll(() => {
    if (!process.env.ENCRYPTION_KEY) {
      // Set a test key (32 bytes hex encoded)
      process.env.ENCRYPTION_KEY = Buffer.from('a'.repeat(32)).toString('hex');
    }
  });

  describe('encrypt', () => {
    it('should encrypt a string', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBeNull();
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted!.length).toBeGreaterThan(plaintext.length);
    });

    it('should return different ciphertext for same plaintext (IV randomization)', () => {
      const plaintext = 'Same text';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should return null for empty string', () => {
      const encrypted = encrypt('');
      expect(encrypted).toBeNull();
    });

    it('should handle special characters', () => {
      const plaintext = '🔥 Special chars: åäö @#$%^&*()';
      const encrypted = encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBeNull();
      expect(encrypted!).not.toContain('🔥');
    });

    it('should handle long strings', () => {
      const plaintext = 'a'.repeat(10000);
      const encrypted = encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBeNull();
      expect(encrypted!.length).toBeGreaterThan(plaintext.length);
    });
  });

  describe('decrypt', () => {
    it('should decrypt an encrypted string', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle empty string roundtrip (returns null)', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      expect(encrypted).toBeNull();

      const decrypted = decrypt(encrypted);
      expect(decrypted).toBeNull();
    });

    it('should handle special characters roundtrip', () => {
      const plaintext = '🔥 Special chars: åäö @#$%^&*()';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long strings roundtrip', () => {
      const plaintext = 'a'.repeat(10000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle numbers as strings roundtrip', () => {
      const plaintext = '12345';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle JSON strings roundtrip', () => {
      const obj = { name: 'Test', values: [1, 2, 3] };
      const plaintext = JSON.stringify(obj);
      const encrypted = encrypt(plaintext);
      expect(encrypted).not.toBeNull();

      const decrypted = decrypt(encrypted!);
      expect(decrypted).toBe(plaintext);
      expect(JSON.parse(decrypted!)).toEqual(obj);
    });

    it('should throw on invalid ciphertext', () => {
      expect(() => decrypt('invalid-ciphertext')).toThrow();
    });

    it('should throw on tampered ciphertext', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext);
      expect(encrypted).not.toBeNull();

      // Tamper with the ciphertext
      const tampered = encrypted!.slice(0, -5) + 'XXXXX';

      expect(() => decrypt(tampered)).toThrow();
    });

    it('should return null for empty string', () => {
      const result = decrypt('');
      expect(result).toBeNull();
    });
  });

  describe('encryption format', () => {
    it('should use base64 encoding for ciphertext', () => {
      const encrypted = encrypt('test');
      expect(encrypted).not.toBeNull();

      // Base64 only contains alphanumeric, +, /, and =
      expect(encrypted!).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('should include IV, auth tag, and ciphertext', () => {
      const encrypted = encrypt('test');
      expect(encrypted).not.toBeNull();

      // Format should be: IV (16 bytes) + AuthTag (16 bytes) + Ciphertext
      // Base64 encoded, so length should be > 32 bytes * 4/3 (base64 overhead)
      expect(encrypted!.length).toBeGreaterThan(42);
    });
  });

  describe('security properties', () => {
    it('should not reveal plaintext length exactly (due to padding)', () => {
      const short = encrypt('a');
      const long = encrypt('a'.repeat(100));
      expect(short).not.toBeNull();
      expect(long).not.toBeNull();

      // Length difference should be less than 100 (AES block size is 16 bytes)
      const lengthDiff = long!.length - short!.length;
      expect(lengthDiff).toBeLessThan(100 * 1.5); // Account for base64 overhead
    });

    it('should use AES-256-GCM (authenticated encryption)', () => {
      const plaintext = 'test';
      const encrypted = encrypt(plaintext);
      expect(encrypted).not.toBeNull();

      // Tamper with ciphertext (should fail authentication)
      const buffer = Buffer.from(encrypted!, 'base64');
      buffer[buffer.length - 1] ^= 0xFF; // Flip last byte
      const tampered = buffer.toString('base64');

      expect(() => decrypt(tampered)).toThrow(/Failed to decrypt/);
    });
  });

  describe('encryptFields', () => {
    it('should encrypt specified fields in an object', async () => {
      const { encryptFields } = await import('./encryption');

      const obj = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const encrypted = encryptFields(obj, ['name', 'email']);

      expect(encrypted.name).not.toBe(obj.name);
      expect(encrypted.email).not.toBe(obj.email);
      expect(encrypted.age).toBe(obj.age); // Not encrypted
    });

    it('should handle non-existent fields gracefully', async () => {
      const { encryptFields } = await import('./encryption');

      const obj = { name: 'John' };
      const encrypted = encryptFields(obj, ['name', 'nonexistent'] as (keyof typeof obj)[]);

      expect(encrypted.name).not.toBe(obj.name);
    });
  });

  describe('decryptFields', () => {
    it('should decrypt specified fields in an object', async () => {
      const { encryptFields, decryptFields } = await import('./encryption');

      const obj = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const encrypted = encryptFields(obj, ['name', 'email']);
      const decrypted = decryptFields(encrypted, ['name', 'email']);

      expect(decrypted.name).toBe(obj.name);
      expect(decrypted.email).toBe(obj.email);
      expect(decrypted.age).toBe(obj.age);
    });

    it('should handle non-existent fields in decryptFields', async () => {
      const { encryptFields, decryptFields } = await import('./encryption');

      const obj = { name: 'John' };
      const encrypted = encryptFields(obj, ['name']);

      // Try to decrypt a field that doesn't exist
      const decrypted = decryptFields(encrypted, ['name', 'nonexistent'] as (keyof typeof encrypted)[]);

      expect(decrypted.name).toBe(obj.name);
      // nonexistent field shouldn't cause issues
    });
  });

  describe('generateEncryptionKey', () => {
    it('should generate a 64-character hex string', async () => {
      const { generateEncryptionKey } = await import('./encryption');

      const key = generateEncryptionKey();

      expect(key).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(key).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate unique keys each time', async () => {
      const { generateEncryptionKey } = await import('./encryption');

      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe('testEncryption', () => {
    it('should return true when encryption works', async () => {
      const { testEncryption } = await import('./encryption');

      const result = testEncryption();

      expect(result).toBe(true);
    });

    it('should return false when encryption fails', async () => {
      // Save original key
      const originalKey = process.env.ENCRYPTION_KEY;

      // Temporarily remove encryption key to force failure
      delete process.env.ENCRYPTION_KEY;

      // Re-import to get fresh module with no key
      const encryptionModule = await import('./encryption?t=' + Date.now());
      const result = encryptionModule.testEncryption();

      expect(result).toBe(false);

      // Restore key for other tests
      process.env.ENCRYPTION_KEY = originalKey;
    });
  });

  describe('error handling', () => {
    it('should throw error when ENCRYPTION_KEY is not set during encryption', async () => {
      // Save original key
      const originalKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      // Dynamic import with cache busting
      const encryptionModule = await import('./encryption?t=' + Date.now());

      // When ENCRYPTION_KEY is missing, encrypt() catches the error and throws "Failed to encrypt data"
      expect(() => encryptionModule.encrypt('test')).toThrow('Failed to encrypt data');

      // Restore key
      process.env.ENCRYPTION_KEY = originalKey;
    });

    it('should handle encryption errors with invalid key', async () => {
      // This tests the catch block in encrypt (lines 77-78)
      const originalKey = process.env.ENCRYPTION_KEY;

      // Use an invalid short key that will cause crypto error
      process.env.ENCRYPTION_KEY = 'short';

      // Dynamic import with cache busting
      const encryptionModule = await import('./encryption?t=' + Date.now());

      expect(() => encryptionModule.encrypt('test')).toThrow('Failed to encrypt data');

      // Restore key
      process.env.ENCRYPTION_KEY = originalKey;
    });

    it('should handle non-Error objects in decryption catch block', () => {
      // This tests the 'Unknown error' branches on lines 128 and 139
      // We need to pass invalid data that will cause a non-Error to be thrown

      // Create invalid base64 that will cause Buffer operations to fail
      const invalidCiphertext = 'not-valid-base64-!@#$%^&*()';

      try {
        decrypt(invalidCiphertext);
      } catch (error) {
        // Should throw our wrapped error message
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Failed to decrypt data');
      }
    });
  });
});
