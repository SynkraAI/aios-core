# EPIC-08-STORY-01 — Marketplace credentials storage (encrypted)
**Story ID:** ZAP-043
**Epic:** EPIC-08 — Link Substitution Engine
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** tenant,
**I want** to securely store my marketplace affiliate credentials (API keys, tokens, IDs),
**so that** the system can use them to build affiliate links.

---

## Acceptance Criteria

### AC-043.1 — `marketplace_credentials` table exists
```bash
psql $DATABASE_URL -c "\d marketplace_credentials"

Columns:
- id UUID PRIMARY KEY
- tenant_id UUID UNIQUE NOT NULL
- shopee_affiliate_id TEXT (public, safe)
- shopee_api_key TEXT (encrypted)
- mercadolivre_account_tag TEXT (public)
- mercadolivre_token TEXT (encrypted)
- mercadolivre_token_expires_at TIMESTAMP
- amazon_associates_id TEXT (public)
- amazon_account_id TEXT (optional)
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

### AC-043.2 — Encryption at rest
```bash
# Credentials are encrypted in DB
SELECT shopee_api_key FROM marketplace_credentials

EXPECTED: Encrypted blob (not plaintext)
Example: "enc_xxxxx" or base64 gibberish

# Decryption works correctly
const key = await decryptCredential(encryptedKey, tenantId)
EXPECTED: Decrypted plaintext matches original
```

### AC-043.3 — RLS enforces tenant isolation
```bash
As Tenant A:
SELECT * FROM marketplace_credentials
→ Only sees Tenant A's credentials

As Tenant B:
→ Cannot see Tenant A's credentials
```

### AC-043.4 — Credentials are never logged
```bash
All operations: logging, error messages, etc.
✓ Never log plaintext credentials
✓ OK to log: credential_type, status, updated_at
✓ OK to log: tenant_id, error codes
✗ Never: apikey, token, secret values
```

### AC-043.5 — API: Save credentials per marketplace
```bash
POST /api/v1/marketplace-credentials/shopee
{
  "affiliate_id": "user_123",
  "api_key": "sk_live_xxx"
}

EXPECTED: HTTP 201
{ "data": { "marketplace": "shopee", "affiliate_id": "user_123" } }
```

### AC-043.6 — API: Get credential status (no exposure)
```bash
GET /api/v1/marketplace-credentials

EXPECTED: HTTP 200
{
  "shopee": { "configured": true, "affiliate_id": "user_123" },
  "mercadolivre": { "configured": false },
  "amazon": { "configured": true, "associates_id": "..." }
}

✗ NEVER return plaintext keys/tokens
```

### AC-043.7 — API: Rotate/delete credentials
```bash
DELETE /api/v1/marketplace-credentials/shopee

EXPECTED: HTTP 200
{ "success": true }

Credentials deleted, can reconfigure
```

### AC-043.8 — Amazon token refresh (for future)
```bash
If mercadolivre_token expires:
- Update mercadolivre_token
- Update mercadolivre_token_expires_at
- Keep audit trail (not shown here, for Phase 3)
```

---

## Technical Notes

### Encryption/Decryption Service
```typescript
// apps/api/src/services/encryption.service.ts

import crypto from 'crypto'

export class EncryptionService {
  private algorithm = 'aes-256-gcm'

  // Generate tenant-specific key from master key + tenant ID
  private getDerivedKey(tenantId: string): Buffer {
    const masterKey = process.env.ENCRYPTION_MASTER_KEY // 32 bytes
    return crypto
      .pbkdf2Sync(masterKey, tenantId, 100000, 32, 'sha256')
  }

  encrypt(plaintext: string, tenantId: string): string {
    const key = this.getDerivedKey(tenantId)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, key, iv)

    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Format: iv::authTag::ciphertext
    return `${iv.toString('hex')}::${authTag.toString('hex')}::${encrypted}`
  }

  decrypt(encrypted: string, tenantId: string): string {
    const key = this.getDerivedKey(tenantId)
    const [ivHex, authTagHex, ciphertext] = encrypted.split('::')

    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }
}
```

### Migration SQL
```sql
-- supabase/migrations/20260226000003_create_marketplace_credentials.sql

CREATE TABLE marketplace_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,

  shopee_affiliate_id TEXT,
  shopee_api_key TEXT,

  mercadolivre_account_tag TEXT,
  mercadolivre_token TEXT,
  mercadolivre_token_expires_at TIMESTAMP,

  amazon_associates_id TEXT,
  amazon_account_id TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE marketplace_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access only their credentials"
  ON marketplace_credentials
  FOR ALL
  TO authenticated
  USING (tenant_id = auth.uid()::uuid);

CREATE POLICY "Service role unrestricted"
  ON marketplace_credentials
  FOR ALL
  TO service_role
  USING (true);
```

### API Implementation
```typescript
// apps/api/src/routes/marketplace-credentials.ts

app.post('/:marketplace', zValidator('json', credentialSchema), async (c) => {
  const { tenantId } = c.get('auth')
  const { marketplace } = c.req.param()
  const { affiliate_id, api_key } = c.req.valid('json')

  const encryption = new EncryptionService()

  // Encrypt sensitive fields
  const encrypted_api_key = api_key ? encryption.encrypt(api_key, tenantId) : null

  // Upsert
  const { data, error } = await supabaseAdmin
    .from('marketplace_credentials')
    .upsert(
      {
        tenant_id: tenantId,
        [`${marketplace}_affiliate_id`]: affiliate_id,
        [`${marketplace}_api_key`]: encrypted_api_key
      },
      { onConflict: 'tenant_id' }
    )
    .select()
    .single()

  if (error) throw error

  // Return safe response (no keys)
  return c.json({
    data: {
      marketplace,
      affiliate_id: affiliate_id || undefined,
      configured: true
    }
  }, 201)
})

app.get('/', async (c) => {
  const { tenantId } = c.get('auth')

  const { data, error } = await supabase
    .from('marketplace_credentials')
    .select('shopee_affiliate_id, mercadolivre_account_tag, amazon_associates_id')
    .eq('tenant_id', tenantId)
    .single()

  // Return safe response
  return c.json({
    shopee: { configured: !!data?.shopee_affiliate_id, affiliate_id: data?.shopee_affiliate_id },
    mercadolivre: { configured: !!data?.mercadolivre_account_tag },
    amazon: { configured: !!data?.amazon_associates_id, associates_id: data?.amazon_associates_id }
  })
})
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| Encryption library (crypto) | Built-in | ✅ Node.js |
| Environment variable: ENCRYPTION_MASTER_KEY | Config | Must be set |

**Blocks:**
- ZAP-044 (Shopee integration uses credentials)
- ZAP-045 (ML integration uses credentials)
- ZAP-046 (Amazon integration uses credentials)

---

## Definition of Done

- [x] Table created with all fields
- [x] RLS policies enforced
- [x] Encryption/decryption working correctly
- [x] Credentials never logged
- [x] API endpoints: save, get, delete
- [x] Unit tests: encryption, API, edge cases
- [x] `npm run typecheck` → 0 errors

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `supabase/migrations/20260226000003_create_marketplace_credentials.sql` | CREATE | Migration |
| `apps/api/src/services/encryption.service.ts` | CREATE | Encryption |
| `apps/api/src/routes/marketplace-credentials.ts` | CREATE | API |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — ready for development |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 6*
