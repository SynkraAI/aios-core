import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EncryptionService } from './encryption.service.js'

describe('EncryptionService', () => {
  let encryption: EncryptionService
  const testTenantId = 'tenant-123'
  const testSecret = 'sk_live_test_secret_key_12345'

  beforeEach(() => {
    // Set master key for tests
    process.env.ENCRYPTION_MASTER_KEY = '0'.repeat(64) // 32 bytes in hex

    encryption = new EncryptionService()
  })

  describe('AC-043.2: Encryption at rest', () => {
    it('encrypts plaintext to encrypted blob', () => {
      const encrypted = encryption.encrypt(testSecret, testTenantId)

      // Should NOT contain plaintext
      expect(encrypted).not.toContain(testSecret)

      // Should be in format: iv::authTag::ciphertext
      const parts = encrypted.split('::')
      expect(parts).toHaveLength(3)

      // Each part should be hex
      parts.forEach((part: string) => {
        expect(/^[0-9a-f]+$/.test(part)).toBe(true)
      })
    })

    it('decrypts correctly back to plaintext', () => {
      const plaintext = testSecret
      const encrypted = encryption.encrypt(plaintext, testTenantId)
      const decrypted = encryption.decrypt(encrypted, testTenantId)

      expect(decrypted).toBe(plaintext)
    })

    it('produces different ciphertext for same plaintext (random IV)', () => {
      const plaintext = testSecret
      const encrypted1 = encryption.encrypt(plaintext, testTenantId)
      const encrypted2 = encryption.encrypt(plaintext, testTenantId)

      // Same plaintext should produce different ciphertexts (due to random IV)
      expect(encrypted1).not.toBe(encrypted2)

      // But both should decrypt to same plaintext
      expect(encryption.decrypt(encrypted1, testTenantId)).toBe(plaintext)
      expect(encryption.decrypt(encrypted2, testTenantId)).toBe(plaintext)
    })

    it('uses tenant-specific keys (cannot decrypt with wrong tenant)', () => {
      const plaintext = testSecret
      const encrypted = encryption.encrypt(plaintext, testTenantId)

      // Should fail to decrypt with different tenant ID
      expect(() => {
        encryption.decrypt(encrypted, 'tenant-different')
      }).toThrow()
    })

    it('detects tampering with ciphertext', () => {
      const plaintext = testSecret
      const encrypted = encryption.encrypt(plaintext, testTenantId)

      // Tamper with ciphertext (change last character)
      const parts = encrypted.split('::')
      const tamperedCiphertext = parts[2].slice(0, -1) + (parts[2].slice(-1) === 'a' ? 'b' : 'a')
      const tampered = `${parts[0]}::${parts[1]}::${tamperedCiphertext}`

      // Should detect tampering and throw
      expect(() => {
        encryption.decrypt(tampered, testTenantId)
      }).toThrow()
    })

    it('detects tampering with auth tag', () => {
      const plaintext = testSecret
      const encrypted = encryption.encrypt(plaintext, testTenantId)

      // Tamper with auth tag
      const parts = encrypted.split('::')
      const tamperedAuthTag = parts[1].slice(0, -1) + (parts[1].slice(-1) === 'a' ? 'b' : 'a')
      const tampered = `${parts[0]}::${tamperedAuthTag}::${parts[2]}`

      // Should detect tampering and throw
      expect(() => {
        encryption.decrypt(tampered, testTenantId)
      }).toThrow()
    })
  })

  describe('AC-043.2: Encryption validation', () => {
    it('handles empty string encryption', () => {
      const encrypted = encryption.encrypt('', testTenantId)
      const decrypted = encryption.decrypt(encrypted, testTenantId)

      expect(decrypted).toBe('')
    })

    it('handles long strings', () => {
      const longString = 'x'.repeat(10000)
      const encrypted = encryption.encrypt(longString, testTenantId)
      const decrypted = encryption.decrypt(encrypted, testTenantId)

      expect(decrypted).toBe(longString)
    })

    it('handles special characters', () => {
      const special = 'test!@#$%^&*()_+-=[]{}|;:,.<>?/\\"\'\n\t'
      const encrypted = encryption.encrypt(special, testTenantId)
      const decrypted = encryption.decrypt(encrypted, testTenantId)

      expect(decrypted).toBe(special)
    })

    it('handles unicode characters', () => {
      const unicode = 'テスト 🔐 مرحبا'
      const encrypted = encryption.encrypt(unicode, testTenantId)
      const decrypted = encryption.decrypt(encrypted, testTenantId)

      expect(decrypted).toBe(unicode)
    })
  })

  describe('AC-043.4: Credentials never logged', () => {
    it('does not log plaintext in encrypt()', () => {
      const loggerSpy = vi.spyOn(console, 'log')
      const plaintext = 'sk_live_secret'

      encryption.encrypt(plaintext, testTenantId)

      // Should not contain plaintext in logs
      const logs = loggerSpy.mock.calls.join(' ')
      expect(logs).not.toContain(plaintext)

      loggerSpy.mockRestore()
    })

    it('does not log plaintext in decrypt()', () => {
      const loggerSpy = vi.spyOn(console, 'log')
      const plaintext = 'sk_live_secret'
      const encrypted = encryption.encrypt(plaintext, testTenantId)

      encryption.decrypt(encrypted, testTenantId)

      const logs = loggerSpy.mock.calls.join(' ')
      expect(logs).not.toContain(plaintext)

      loggerSpy.mockRestore()
    })
  })

  describe('isValidFormat()', () => {
    it('validates correct format', () => {
      const plaintext = testSecret
      const encrypted = encryption.encrypt(plaintext, testTenantId)

      expect(encryption.isValidFormat(encrypted)).toBe(true)
    })

    it('rejects invalid format (wrong parts)', () => {
      expect(encryption.isValidFormat('invalid')).toBe(false)
      expect(encryption.isValidFormat('a::b::c::d')).toBe(false)
    })

    it('rejects invalid format (wrong hex length)', () => {
      expect(encryption.isValidFormat('ff::ff::ff')).toBe(false) // Too short
    })

    it('rejects non-hex characters', () => {
      expect(encryption.isValidFormat('gg::hh::ii')).toBe(false)
    })
  })

  describe('Environment variable validation', () => {
    it('throws when ENCRYPTION_MASTER_KEY not set', () => {
      delete process.env.ENCRYPTION_MASTER_KEY
      const newEncryption = new EncryptionService()

      expect(() => {
        newEncryption.encrypt(testSecret, testTenantId)
      }).toThrow('ENCRYPTION_MASTER_KEY environment variable not set')
    })

    it('throws on invalid master key length', () => {
      process.env.ENCRYPTION_MASTER_KEY = 'tooshort'
      const newEncryption = new EncryptionService()

      expect(() => {
        newEncryption.encrypt(testSecret, testTenantId)
      }).toThrow('ENCRYPTION_MASTER_KEY must be 32 bytes')
    })
  })

  describe('Edge cases', () => {
    it('handles concurrent encryption/decryption', async () => {
      const promises = []

      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve().then(() => {
            const plaintext = `secret-${i}`
            const tenant = `tenant-${i}`
            const encrypted = encryption.encrypt(plaintext, tenant)
            const decrypted = encryption.decrypt(encrypted, tenant)
            expect(decrypted).toBe(plaintext)
          })
        )
      }

      await Promise.all(promises)
    })

    it('handles multiple tenants independently', () => {
      const tenant1 = 'tenant-1'
      const tenant2 = 'tenant-2'
      const plaintext = 'same-secret'

      const encrypted1 = encryption.encrypt(plaintext, tenant1)
      const encrypted2 = encryption.encrypt(plaintext, tenant2)

      // Different tenants = different ciphertexts
      expect(encrypted1).not.toBe(encrypted2)

      // Each decrypts only with its own tenant
      expect(encryption.decrypt(encrypted1, tenant1)).toBe(plaintext)
      expect(encryption.decrypt(encrypted2, tenant2)).toBe(plaintext)

      // Cross-tenant decryption fails
      expect(() => {
        encryption.decrypt(encrypted1, tenant2)
      }).toThrow()
    })
  })
})
