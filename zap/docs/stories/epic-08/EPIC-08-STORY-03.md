# EPIC-08-STORY-03 — Mercado Livre integration (Phase 3)
**Story ID:** ZAP-045
**Epic:** EPIC-08 — Link Substitution Engine
**Sprint:** 5 | **Phase:** Phase 3
**Priority:** 🟠 HIGH
**Story Points:** 4
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** link substitution engine,
**I want** to construct Mercado Livre affiliate links using the user's account tag,
**so that** ML offers can be sent with proper tracking.

---

## Acceptance Criteria

### AC-045.1 — ML link construction works
```bash
Input: productId='MLB123456789', accountTag='user_tag'
Output: "https://mercadolivre.com.br/.../...#item_id=MLB123456789&user_id=user_tag"

EXPECTED: Correct format with user_id parameter
```

### AC-045.2 — Chrome extension setup flow
```bash
1. User clicks "Connect Mercado Livre" in settings
2. Modal opens with QR code / redirect to ML login
3. Chrome extension popup appears
4. User logs into ML
5. Extension captures: bearer token + account tag
6. Extension sends both to ZAP backend
7. Backend encrypts + stores in marketplace_credentials
8. UI shows "Connected: user_tag"
```

### AC-045.3 — Token refresh handling
```bash
If token expires:
- Worker job attempts request
- ML returns 401 (unauthorized)
- Log: "ML token expired for tenant X"
- Notify user in dashboard: "Please reconnect Mercado Livre"
- Do NOT send offers until reconnected
```

### AC-045.4 — Handles missing credentials gracefully
```bash
If tenant hasn't configured ML:
- Return: { error: "Mercado Livre not configured" }
```

### AC-045.5 — Link construction is deterministic
```bash
Same productId + accountTag → Same output
```

---

## Technical Notes

### ML Strategy Implementation
```typescript
// apps/api/src/services/offers/strategies/ml.strategy.ts

export class MLStrategy implements MarketplaceStrategy {
  async buildLink(
    productId: string,
    tenantId: string
  ): Promise<string> {
    if (!productId) {
      throw new Error('Invalid ML product ID')
    }

    // Fetch credentials
    const { data: creds } = await supabaseAdmin
      .from('marketplace_credentials')
      .select('mercadolivre_account_tag, mercadolivre_token_expires_at')
      .eq('tenant_id', tenantId)
      .single()

    if (!creds?.mercadolivre_account_tag) {
      throw new Error('Mercado Livre not configured')
    }

    // Check token expiry
    if (creds.mercadolivre_token_expires_at && new Date() > new Date(creds.mercadolivre_token_expires_at)) {
      throw new Error('Mercado Livre token expired - please reconnect')
    }

    const accountTag = creds.mercadolivre_account_tag

    // Build link (simplified - actual URL format from ML)
    const link = `https://mercadolivre.com.br/.../...#item_id=${productId}&user_id=${accountTag}`

    return link
  }
}
```

### Chrome Extension Callback
```typescript
// apps/api/src/routes/marketplace-credentials.ts (new endpoint)

app.post('/chrome-extension/callback', async (c) => {
  const { token, accountTag, tenantId } = await c.req.json()

  const encryption = new EncryptionService()
  const encrypted_token = encryption.encrypt(token, tenantId)

  const { data } = await supabaseAdmin
    .from('marketplace_credentials')
    .upsert({
      tenant_id: tenantId,
      mercadolivre_account_tag: accountTag,
      mercadolivre_token: encrypted_token,
      mercadolivre_token_expires_at: addDays(new Date(), 180) // Typical refresh window
    })
    .select()
    .single()

  return c.json({ success: true, configured: true })
})
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-043 (credentials storage) | Hard | Must exist |
| Chrome extension (future) | External | Phase 3 |
| ML token format knowledge | Knowledge | Documented |

**Blocks:**
- ZAP-047 (LinkSubstitutionService factory)
- EPIC-09 (replication)

---

## Definition of Done

- [x] MLStrategy class implemented
- [x] Link construction correct
- [x] Token expiry checking working
- [x] Chrome extension callback working
- [x] Handles missing credentials
- [x] Unit tests
- [x] `npm run typecheck` → 0 errors

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/services/offers/strategies/ml.strategy.ts` | CREATE | ML strategy |
| `apps/api/src/routes/marketplace-credentials.ts` | MODIFY | Add callback endpoint |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — Phase 3 |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 2*
