# EPIC-08-STORY-02 — Shopee integration (Phase 1)
**Story ID:** ZAP-044
**Epic:** EPIC-08 — Link Substitution Engine
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** link substitution engine,
**I want** to construct Shopee affiliate links using the user's affiliate ID,
**so that** offers can be sent with proper tracking.

---

## Acceptance Criteria

### AC-044.1 — Shopee link construction works
```bash
Input: productId='123456', affiliateId='user_123'
Output: "https://shopee.com.br/p-123456?af_id=user_123"

EXPECTED: Correct format with af_id parameter
```

### AC-044.2 — Retrieves credential from marketplace_credentials table
```bash
1. Fetch tenant's credentials
2. Extract shopee_affiliate_id
3. Use in link construction
4. If no credential: return error "Shopee not configured"
```

### AC-044.3 — Handles missing credentials gracefully
```bash
If tenant hasn't configured Shopee:
- Return: { error: "Shopee not configured", code: "SHOPEE_UNCONFIGURED" }
- Do NOT offer to non-monitored users
```

### AC-044.4 — Validates product ID format
```bash
✓ Valid: "123456" → uses as-is
✗ Invalid: "ABC", "", null → returns error
```

### AC-044.5 — Link construction is idempotent
```bash
buildShopeeLink(productId, affiliateId)
  →  "https://shopee.com.br/p-123456?af_id=user_123"

buildShopeeLink(productId, affiliateId) [same inputs]
  →  "https://shopee.com.br/p-123456?af_id=user_123" [identical]
```

---

## Technical Notes

### Shopee Strategy Implementation
```typescript
// apps/api/src/services/offers/strategies/shopee.strategy.ts

export class ShopeeStrategy implements MarketplaceStrategy {
  constructor(private encryption: EncryptionService) {}

  async buildLink(
    productId: string,
    tenantId: string
  ): Promise<string> {
    // Validate product ID
    if (!productId || !/^\d+$/.test(productId)) {
      throw new Error(`Invalid Shopee product ID: ${productId}`)
    }

    // Fetch credentials
    const { data: creds, error } = await supabaseAdmin
      .from('marketplace_credentials')
      .select('shopee_affiliate_id')
      .eq('tenant_id', tenantId)
      .single()

    if (error || !creds?.shopee_affiliate_id) {
      throw new Error('Shopee not configured')
    }

    const affiliateId = creds.shopee_affiliate_id

    // Build link
    const baseUrl = 'https://shopee.com.br'
    const link = `${baseUrl}/p-${productId}?af_id=${affiliateId}`

    return link
  }
}
```

### Unit Tests
```typescript
describe('ShopeeStrategy', () => {
  let strategy: ShopeeStrategy

  beforeEach(() => {
    strategy = new ShopeeStrategy(mockEncryption)
  })

  test('builds valid Shopee link', async () => {
    const link = await strategy.buildLink('123456', 'tenant-1')
    expect(link).toBe('https://shopee.com.br/p-123456?af_id=user_123')
  })

  test('throws if product ID invalid', async () => {
    expect(() => strategy.buildLink('ABC', 'tenant-1')).toThrow()
  })

  test('throws if Shopee not configured', async () => {
    mockSupabase.select.mockResolvedValue({ data: null })
    expect(() => strategy.buildLink('123456', 'tenant-1')).toThrow()
  })

  test('is idempotent', async () => {
    const link1 = await strategy.buildLink('123456', 'tenant-1')
    const link2 = await strategy.buildLink('123456', 'tenant-1')
    expect(link1).toBe(link2)
  })
})
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-043 (credentials storage) | Hard | Must exist |
| ZAP-038 (URL extraction) | Soft | For context |

**Blocks:**
- ZAP-047 (LinkSubstitutionService factory uses this)
- EPIC-09 (replication uses substitution service)

---

## Definition of Done

- [x] ShopeeStrategy class implemented
- [x] Link construction correct format
- [x] Retrieves affiliate ID from credentials
- [x] Handles missing credentials
- [x] Validates product ID
- [x] Idempotent
- [x] Unit tests: all cases
- [x] `npm run typecheck` → 0 errors

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/services/offers/strategies/shopee.strategy.ts` | CREATE | Shopee strategy |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — Phase 1 |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 2*
