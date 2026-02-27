import crypto from 'crypto'
import { logger } from '../lib/logger.js'

/**
 * EncryptionService
 *
 * Handles AES-256-GCM encryption/decryption for marketplace credentials.
 * Uses tenant-specific derived keys from a master key + tenant ID.
 *
 * Format: `${iv}::${authTag}::${ciphertext}` (hex encoded)
 */
export class EncryptionService {
  private algorithm = 'aes-256-gcm'
  private ivLength = 16 // bytes
  private tagLength = 16 // bytes
  private saltIterations = 100000
  private hashAlgorithm = 'sha256'
  private keyLength = 32 // 256 bits

  /**
   * Get master encryption key from environment
   * Must be a 32-byte hex string or 64-char base64
   */
  private getMasterKey(): Buffer {
    const masterKey = process.env.ENCRYPTION_MASTER_KEY
    if (!masterKey) {
      throw new Error('ENCRYPTION_MASTER_KEY environment variable not set')
    }

    // Try hex first, then base64
    try {
      if (masterKey.length === 64) {
        return Buffer.from(masterKey, 'hex')
      }
    } catch {}

    try {
      const buf = Buffer.from(masterKey, 'base64')
      if (buf.length === 32) {
        return buf
      }
    } catch {}

    throw new Error('ENCRYPTION_MASTER_KEY must be 32 bytes (64 hex chars or 44 base64 chars)')
  }

  /**
   * Derive tenant-specific key using PBKDF2
   * Ensures each tenant's data encrypted differently
   */
  private getDerivedKey(tenantId: string): Buffer {
    const masterKey = this.getMasterKey()
    return crypto.pbkdf2Sync(
      masterKey,
      tenantId, // salt
      this.saltIterations,
      this.keyLength,
      this.hashAlgorithm
    )
  }

  /**
   * Encrypt plaintext credential
   *
   * @param plaintext - Credential to encrypt (API key, token, etc.)
   * @param tenantId - Tenant ID (used for key derivation)
   * @returns Encrypted string: `${iv}::${authTag}::${ciphertext}` (all hex)
   */
  encrypt(plaintext: string, tenantId: string): string {
    try {
      const key = this.getDerivedKey(tenantId)
      const iv = crypto.randomBytes(this.ivLength)
      const cipher = crypto.createCipheriv(this.algorithm, key, iv)

      // Encrypt plaintext
      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      // Get authentication tag for AEAD
      const authTag = (cipher as any).getAuthTag()

      // Format: iv::authTag::ciphertext (all hex)
      const result = `${iv.toString('hex')}::${authTag.toString('hex')}::${encrypted}`

      // SECURITY: Never log plaintext or unencrypted credentials
      logger.debug(`Credential encrypted for tenant (length: ${plaintext.length})`)

      return result
    } catch (error) {
      logger.error(`Encryption failed for tenant ${tenantId}`, { error })
      throw new Error(`Failed to encrypt credential: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Decrypt encrypted credential
   *
   * @param encrypted - Encrypted string in format `${iv}::${authTag}::${ciphertext}` (hex)
   * @param tenantId - Tenant ID (used for key derivation)
   * @returns Decrypted plaintext
   */
  decrypt(encrypted: string, tenantId: string): string {
    try {
      const key = this.getDerivedKey(tenantId)

      // Parse format: iv::authTag::ciphertext
      const parts = encrypted.split('::')
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted format: expected iv::authTag::ciphertext')
      }

      const [ivHex, authTagHex, ciphertext] = parts

      // Convert from hex
      const iv = Buffer.from(ivHex, 'hex')
      const authTag = Buffer.from(authTagHex, 'hex')

      if (iv.length !== this.ivLength) {
        throw new Error(`Invalid IV length: ${iv.length}, expected ${this.ivLength}`)
      }
      if (authTag.length !== this.tagLength) {
        throw new Error(`Invalid auth tag length: ${authTag.length}, expected ${this.tagLength}`)
      }

      // Decrypt
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv)
      const decipherWithAuth = decipher as any
      decipherWithAuth.setAuthTag(authTag)

      let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      // SECURITY: Never log plaintext
      logger.debug(`Credential decrypted for tenant`)

      return decrypted
    } catch (error) {
      logger.error(`Decryption failed for tenant ${tenantId}`, { error })
      throw new Error(`Failed to decrypt credential: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Test if encrypted string is valid (without decrypting)
   * Useful for validation without exposing plaintext
   */
  isValidFormat(encrypted: string): boolean {
    try {
      const parts = encrypted.split('::')
      if (parts.length !== 3) return false

      const [ivHex, authTagHex] = parts

      // Must be valid hex and correct lengths
      const iv = Buffer.from(ivHex, 'hex')
      const authTag = Buffer.from(authTagHex, 'hex')

      return (
        iv.length === this.ivLength &&
        authTag.length === this.tagLength &&
        ivHex.length === this.ivLength * 2 &&
        authTagHex.length === this.tagLength * 2
      )
    } catch {
      return false
    }
  }
}
