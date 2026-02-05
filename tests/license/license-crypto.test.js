/**
 * Unit tests for license-crypto.js
 *
 * @see Story PRO-6 - License Key & Feature Gating System
 * @see AC-9, AC-10 - Tamper resistance, Machine specificity
 */

'use strict';

const crypto = require('crypto');
const {
  generateMachineId,
  deriveCacheKey,
  encrypt,
  decrypt,
  computeHMAC,
  generateSalt,
  verifyHMAC,
  maskKey,
  validateKeyFormat,
  _CONFIG,
} = require('../../pro/license/license-crypto');

describe('license-crypto', () => {
  describe('generateMachineId', () => {
    it('should generate a deterministic machine ID', () => {
      const id1 = generateMachineId();
      const id2 = generateMachineId();

      expect(id1).toBe(id2);
    });

    it('should return a 64-character hex string (SHA-256)', () => {
      const id = generateMachineId();

      expect(typeof id).toBe('string');
      expect(id).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(id)).toBe(true);
    });

    it('should not be empty', () => {
      const id = generateMachineId();
      expect(id).not.toBe('');
    });
  });

  describe('generateSalt', () => {
    it('should generate a 16-byte salt by default', () => {
      const salt = generateSalt();

      expect(Buffer.isBuffer(salt)).toBe(true);
      expect(salt.length).toBe(16);
    });

    it('should generate custom length salt', () => {
      const salt = generateSalt(32);

      expect(salt.length).toBe(32);
    });

    it('should generate unique salts', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      expect(salt1.toString('hex')).not.toBe(salt2.toString('hex'));
    });
  });

  describe('deriveCacheKey', () => {
    const testMachineId = 'abc123def456';
    const testSalt = crypto.randomBytes(16);

    it('should derive a 32-byte key (256 bits)', () => {
      const key = deriveCacheKey(testMachineId, testSalt);

      expect(Buffer.isBuffer(key)).toBe(true);
      expect(key.length).toBe(32);
    });

    it('should be deterministic with same inputs', () => {
      const key1 = deriveCacheKey(testMachineId, testSalt);
      const key2 = deriveCacheKey(testMachineId, testSalt);

      expect(key1.toString('hex')).toBe(key2.toString('hex'));
    });

    it('should produce different keys with different salts', () => {
      const salt1 = crypto.randomBytes(16);
      const salt2 = crypto.randomBytes(16);

      const key1 = deriveCacheKey(testMachineId, salt1);
      const key2 = deriveCacheKey(testMachineId, salt2);

      expect(key1.toString('hex')).not.toBe(key2.toString('hex'));
    });

    it('should produce different keys with different machine IDs', () => {
      const key1 = deriveCacheKey('machine-a', testSalt);
      const key2 = deriveCacheKey('machine-b', testSalt);

      expect(key1.toString('hex')).not.toBe(key2.toString('hex'));
    });

    it('should accept salt as hex string', () => {
      const saltHex = testSalt.toString('hex');
      const key = deriveCacheKey(testMachineId, saltHex);

      expect(key.length).toBe(32);
    });

    it('should use minimum 100000 PBKDF2 iterations', () => {
      expect(_CONFIG.PBKDF2_ITERATIONS).toBeGreaterThanOrEqual(100000);
    });
  });

  describe('encrypt', () => {
    const testKey = crypto.randomBytes(32);
    const testData = { foo: 'bar', count: 42 };

    it('should encrypt data and return ciphertext, iv, and tag', () => {
      const result = encrypt(testData, testKey);

      expect(result).toHaveProperty('ciphertext');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('tag');
    });

    it('should return hex-encoded strings', () => {
      const result = encrypt(testData, testKey);

      expect(/^[a-f0-9]+$/.test(result.ciphertext)).toBe(true);
      expect(/^[a-f0-9]+$/.test(result.iv)).toBe(true);
      expect(/^[a-f0-9]+$/.test(result.tag)).toBe(true);
    });

    it('should generate different IVs for each encryption', () => {
      const result1 = encrypt(testData, testKey);
      const result2 = encrypt(testData, testKey);

      expect(result1.iv).not.toBe(result2.iv);
    });

    it('should encrypt strings directly', () => {
      const result = encrypt('hello world', testKey);

      expect(result.ciphertext).toBeTruthy();
    });

    it('should throw for invalid key length', () => {
      const shortKey = crypto.randomBytes(16);

      expect(() => encrypt(testData, shortKey)).toThrow('256 bits');
    });

    it('should accept key as hex string', () => {
      const keyHex = testKey.toString('hex');
      const result = encrypt(testData, keyHex);

      expect(result.ciphertext).toBeTruthy();
    });
  });

  describe('decrypt', () => {
    const testKey = crypto.randomBytes(32);
    const testData = { foo: 'bar', count: 42 };

    it('should decrypt data back to original', () => {
      const encrypted = encrypt(testData, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toEqual(testData);
    });

    it('should decrypt string data', () => {
      const original = 'hello world';
      const encrypted = encrypt(original, testKey);
      const decrypted = decrypt(encrypted, testKey, false);

      expect(decrypted).toBe(original);
    });

    it('should fail with wrong key', () => {
      const encrypted = encrypt(testData, testKey);
      const wrongKey = crypto.randomBytes(32);

      expect(() => decrypt(encrypted, wrongKey)).toThrow();
    });

    it('should fail with tampered ciphertext', () => {
      const encrypted = encrypt(testData, testKey);
      // Tamper with ciphertext
      encrypted.ciphertext = encrypted.ciphertext.replace(/[a-f]/g, 'f');

      expect(() => decrypt(encrypted, testKey)).toThrow();
    });

    it('should fail with tampered auth tag', () => {
      const encrypted = encrypt(testData, testKey);
      // Tamper with tag
      encrypted.tag = crypto.randomBytes(16).toString('hex');

      expect(() => decrypt(encrypted, testKey)).toThrow();
    });

    it('should fail with tampered IV', () => {
      const encrypted = encrypt(testData, testKey);
      // Tamper with IV
      encrypted.iv = crypto.randomBytes(12).toString('hex');

      expect(() => decrypt(encrypted, testKey)).toThrow();
    });

    it('should throw for invalid key length', () => {
      const encrypted = encrypt(testData, testKey);
      const shortKey = crypto.randomBytes(16);

      expect(() => decrypt(encrypted, shortKey)).toThrow('256 bits');
    });
  });

  describe('computeHMAC', () => {
    const testKey = crypto.randomBytes(32);
    const testData = 'test data string';

    it('should compute a 64-character hex HMAC', () => {
      const hmac = computeHMAC(testData, testKey);

      expect(typeof hmac).toBe('string');
      expect(hmac).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(hmac)).toBe(true);
    });

    it('should be deterministic', () => {
      const hmac1 = computeHMAC(testData, testKey);
      const hmac2 = computeHMAC(testData, testKey);

      expect(hmac1).toBe(hmac2);
    });

    it('should produce different HMACs for different data', () => {
      const hmac1 = computeHMAC('data1', testKey);
      const hmac2 = computeHMAC('data2', testKey);

      expect(hmac1).not.toBe(hmac2);
    });

    it('should produce different HMACs for different keys', () => {
      const key1 = crypto.randomBytes(32);
      const key2 = crypto.randomBytes(32);

      const hmac1 = computeHMAC(testData, key1);
      const hmac2 = computeHMAC(testData, key2);

      expect(hmac1).not.toBe(hmac2);
    });

    it('should accept Buffer data', () => {
      const dataBuffer = Buffer.from(testData, 'utf8');
      const hmac = computeHMAC(dataBuffer, testKey);

      expect(hmac).toHaveLength(64);
    });
  });

  describe('verifyHMAC', () => {
    const testKey = crypto.randomBytes(32);
    const testData = 'test data';

    it('should return true for valid HMAC', () => {
      const hmac = computeHMAC(testData, testKey);
      const result = verifyHMAC(testData, testKey, hmac);

      expect(result).toBe(true);
    });

    it('should return false for invalid HMAC', () => {
      const fakeHmac = crypto.randomBytes(32).toString('hex');
      const result = verifyHMAC(testData, testKey, fakeHmac);

      expect(result).toBe(false);
    });

    it('should return false for tampered data', () => {
      const hmac = computeHMAC(testData, testKey);
      const result = verifyHMAC('tampered data', testKey, hmac);

      expect(result).toBe(false);
    });

    it('should return false for wrong key', () => {
      const hmac = computeHMAC(testData, testKey);
      const wrongKey = crypto.randomBytes(32);
      const result = verifyHMAC(testData, wrongKey, hmac);

      expect(result).toBe(false);
    });

    it('should return false for mismatched length', () => {
      const result = verifyHMAC(testData, testKey, 'short');

      expect(result).toBe(false);
    });
  });

  describe('maskKey', () => {
    it('should mask standard PRO key format', () => {
      const key = 'PRO-ABCD-EFGH-IJKL-MNOP';
      const masked = maskKey(key);

      expect(masked).toBe('PRO-ABCD-****-****-MNOP');
    });

    it('should handle null/undefined', () => {
      expect(maskKey(null)).toBe('****-****-****-****');
      expect(maskKey(undefined)).toBe('****-****-****-****');
    });

    it('should handle non-string input', () => {
      expect(maskKey(12345)).toBe('****-****-****-****');
      expect(maskKey({})).toBe('****-****-****-****');
    });

    it('should handle non-standard format', () => {
      const key = 'ABCDEFGHIJKLMNOP';
      const masked = maskKey(key);

      expect(masked).toBe('ABCD-****-****-MNOP');
    });

    it('should handle short keys', () => {
      expect(maskKey('ABC')).toBe('****');
      expect(maskKey('ABCDEFGH')).toBe('****');
    });

    it('should never reveal middle sections', () => {
      const key = 'PRO-1234-ABCD-EFGH-5678';
      const masked = maskKey(key);

      expect(masked).not.toContain('ABCD');
      expect(masked).not.toContain('EFGH');
    });
  });

  describe('validateKeyFormat', () => {
    it('should accept valid PRO key format', () => {
      expect(validateKeyFormat('PRO-ABCD-EFGH-IJKL-MNOP')).toBe(true);
      expect(validateKeyFormat('PRO-1234-5678-90AB-CDEF')).toBe(true);
    });

    it('should reject lowercase', () => {
      expect(validateKeyFormat('PRO-abcd-efgh-ijkl-mnop')).toBe(false);
      expect(validateKeyFormat('pro-ABCD-EFGH-IJKL-MNOP')).toBe(false);
    });

    it('should reject wrong prefix', () => {
      expect(validateKeyFormat('DEV-ABCD-EFGH-IJKL-MNOP')).toBe(false);
      expect(validateKeyFormat('ABCD-EFGH-IJKL-MNOP-1234')).toBe(false);
    });

    it('should reject wrong segment length', () => {
      expect(validateKeyFormat('PRO-ABC-EFGH-IJKL-MNOP')).toBe(false);
      expect(validateKeyFormat('PRO-ABCDE-EFGH-IJKL-MNOP')).toBe(false);
    });

    it('should reject wrong segment count', () => {
      expect(validateKeyFormat('PRO-ABCD-EFGH-IJKL')).toBe(false);
      expect(validateKeyFormat('PRO-ABCD-EFGH-IJKL-MNOP-QRST')).toBe(false);
    });

    it('should reject special characters', () => {
      expect(validateKeyFormat('PRO-AB@D-EFGH-IJKL-MNOP')).toBe(false);
      expect(validateKeyFormat('PRO-ABCD-EF!H-IJKL-MNOP')).toBe(false);
    });

    it('should reject null/undefined/empty', () => {
      expect(validateKeyFormat(null)).toBe(false);
      expect(validateKeyFormat(undefined)).toBe(false);
      expect(validateKeyFormat('')).toBe(false);
    });

    it('should reject non-string input', () => {
      expect(validateKeyFormat(12345)).toBe(false);
      expect(validateKeyFormat({})).toBe(false);
    });
  });

  describe('AES-256-GCM configuration', () => {
    it('should use AES-256-GCM algorithm', () => {
      expect(_CONFIG.AES_ALGORITHM).toBe('aes-256-gcm');
    });

    it('should use 12-byte IV (96 bits)', () => {
      expect(_CONFIG.AES_IV_LENGTH).toBe(12);
    });

    it('should use 16-byte auth tag (128 bits)', () => {
      expect(_CONFIG.AES_TAG_LENGTH).toBe(16);
    });
  });

  describe('Security: Machine specificity (AC-10)', () => {
    it('should produce different cache keys for different machines', () => {
      const salt = generateSalt();
      const key1 = deriveCacheKey('machine-id-a', salt);
      const key2 = deriveCacheKey('machine-id-b', salt);

      expect(key1.toString('hex')).not.toBe(key2.toString('hex'));
    });

    it('should make encrypted data non-portable between machines', () => {
      const salt = generateSalt();
      const data = { license: 'test', features: ['pro.squads.*'] };

      // Encrypt with machine A's key
      const keyA = deriveCacheKey('machine-a-id', salt);
      const encrypted = encrypt(data, keyA);

      // Try to decrypt with machine B's key
      const keyB = deriveCacheKey('machine-b-id', salt);

      expect(() => decrypt(encrypted, keyB)).toThrow();
    });
  });

  describe('Security: Tamper resistance (AC-9)', () => {
    it('should detect tampered encrypted data via auth tag', () => {
      const key = crypto.randomBytes(32);
      const data = { license: 'test' };
      const encrypted = encrypt(data, key);

      // Tamper with ciphertext
      const tamperedCiphertext = Buffer.from(encrypted.ciphertext, 'hex');
      tamperedCiphertext[0] ^= 0xff; // Flip bits
      encrypted.ciphertext = tamperedCiphertext.toString('hex');

      expect(() => decrypt(encrypted, key)).toThrow();
    });

    it('should detect tampered HMAC', () => {
      const key = crypto.randomBytes(32);
      const data = 'original data';
      const originalHmac = computeHMAC(data, key);

      // Tamper with HMAC
      const tamperedHmac = 'a'.repeat(64);

      expect(verifyHMAC(data, key, originalHmac)).toBe(true);
      expect(verifyHMAC(data, key, tamperedHmac)).toBe(false);
    });
  });
});
