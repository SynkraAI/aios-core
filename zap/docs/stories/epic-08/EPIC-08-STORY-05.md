# EPIC-08-STORY-05 — LinkSubstitutionService (factory pattern)
**Story ID:** ZAP-047
**Epic:** EPIC-08 — Link Substitution Engine
**Sprint:** 4 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 2
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** offer replication system,
**I want** a unified LinkSubstitutionService that handles all 3 marketplaces via a strategy pattern,
**so that** I can build affiliate links transparently regardless of marketplace.

---

## Acceptance Criteria

### AC-047.1 — Factory pattern implemented
```typescript
const service = new LinkSubstitutionService()

const link = await service.buildAffiliateLink(
  marketplace: 'shopee',
  productId: '123456',
  tenantId: 'tenant-uuid'
)

EXPECTED: "https://shopee.com.br/p-123456?af_id=user_123"
```

### AC-047.2 — Shopee strategy loaded
```bash
service.buildAffiliateLink('shopee', '123456', 'tenant-1')
→ Uses ShopeeStrategy
→ Returns Shopee link with affiliate ID
```

### AC-047.3 — Mercado Livre strategy loaded
```bash
service.buildAffiliateLink('mercadolivre', 'MLB789', 'tenant-1')
→ Uses MLStrategy
→ Returns ML link with account tag
```

### AC-047.4 — Amazon strategy loaded
```bash
service.buildAffiliateLink('amazon', 'B0123456789', 'tenant-1')
→ Uses AmazonStrategy
→ Returns Amazon link with associates ID
```

### AC-047.5 — Error handling for unconfigured marketplace
```bash
If marketplace strategy not configured:
- Return: { error: "Marketplace not configured" }
- Do NOT throw, log gracefully
```

### AC-047.6 — Usable from OfferReplicationQueue
```typescript
// In replication worker:
const substitutionService = new LinkSubstitutionService()

const affiliateUrl = await substitutionService.buildAffiliateLink(
  offer.marketplace,
  offer.product_id,
  tenantId
)

// Insert into replicated_offers
```

---

## Technical Notes

### LinkSubstitutionService (Factory)
```typescript
// apps/api/src/services/offers/link-substitution.service.ts

export interface MarketplaceStrategy {
  buildLink(productId: string, tenantId: string): Promise<string>
}

export class LinkSubstitutionService {
  private strategies: Map<string, MarketplaceStrategy>

  constructor(private encryption: EncryptionService) {
    this.strategies = new Map([
      ['shopee', new ShopeeStrategy(encryption)],
      ['mercadolivre', new MLStrategy(encryption)],
      ['amazon', new AmazonStrategy(encryption)]
    ])
  }

  async buildAffiliateLink(
    marketplace: string,
    productId: string,
    tenantId: string
  ): Promise<string> {
    const strategy = this.strategies.get(marketplace)

    if (!strategy) {
      throw new Error(`Unknown marketplace: ${marketplace}`)
    }

    try {
      return await strategy.buildLink(productId, tenantId)
    } catch (error) {
      logger.error(`Failed to build ${marketplace} link`, {
        error: error.message,
        marketplace,
        productId,
        tenantId
      })
      throw error
    }
  }

  async buildAllAffiliateLinks(
    productId: string,
    marketplaces: string[],
    tenantId: string
  ): Promise<Record<string, string>> {
    const links: Record<string, string> = {}

    for (const marketplace of marketplaces) {
      try {
        links[marketplace] = await this.buildAffiliateLink(marketplace, productId, tenantId)
      } catch (error) {
        logger.warn(`Could not build ${marketplace} link`, { error: error.message })
        // Continue with next marketplace
      }
    }

    return links
  }
}
```

### Usage in Offer Replication (pseudo)
```typescript
// In OfferReplicationWorker (EPIC-09):

const substitutionService = new LinkSubstitutionService(encryption)

// For each captured offer:
const affiliateUrl = await substitutionService.buildAffiliateLink(
  offer.marketplace,
  offer.product_id,
  tenantId
)

const replicatedOffer = {
  tenant_id: tenantId,
  captured_offer_id: offer.id,
  affiliate_url: affiliateUrl,
  marketplace: offer.marketplace,
  target_group_ids: userGroupIds,
  status: 'queued'
}

await supabaseAdmin
  .from('replicated_offers')
  .insert(replicatedOffer)
```

### Unit Tests
```typescript
describe('LinkSubstitutionService', () => {
  let service: LinkSubstitutionService
  let mockEncryption: any
  let mockSupabase: any

  beforeEach(() => {
    mockEncryption = new EncryptionService()
    service = new LinkSubstitutionService(mockEncryption)
  })

  test('builds Shopee link', async () => {
    const link = await service.buildAffiliateLink('shopee', '123456', 'tenant-1')
    expect(link).toContain('shopee.com.br')
    expect(link).toContain('af_id=')
  })

  test('builds ML link', async () => {
    const link = await service.buildAffiliateLink('mercadolivre', 'MLB789', 'tenant-1')
    expect(link).toContain('mercadolivre.com.br')
    expect(link).toContain('user_id=')
  })

  test('builds Amazon link', async () => {
    const link = await service.buildAffiliateLink('amazon', 'B0123456789', 'tenant-1')
    expect(link).toContain('amazon.com.br')
    expect(link).toContain('tag=')
  })

  test('throws for unknown marketplace', async () => {
    expect(() => service.buildAffiliateLink('unknown', 'id', 'tenant-1')).toThrow()
  })

  test('handles multiple marketplaces', async () => {
    const links = await service.buildAllAffiliateLinks(
      'product-123',
      ['shopee', 'mercadolivre', 'amazon'],
      'tenant-1'
    )

    expect(Object.keys(links)).toContain('shopee')
    expect(Object.keys(links)).toContain('mercadolivre')
    expect(Object.keys(links)).toContain('amazon')
  })

  test('continues if one marketplace unconfigured', async () => {
    // Mock Shopee as configured, ML as not
    mockSupabase.select = jest.fn()
      .mockResolvedValueOnce({ data: { shopee_affiliate_id: 'user_123' } })
      .mockResolvedValueOnce({ data: null })

    const links = await service.buildAllAffiliateLinks(
      'product-123',
      ['shopee', 'mercadolivre'],
      'tenant-1'
    )

    expect(links.shopee).toBeDefined()
    expect(links.mercadolivre).toBeUndefined()
  })
})
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-044 (ShopeeStrategy) | Hard | Must exist |
| ZAP-045 (MLStrategy) | Hard | Must exist (Phase 3) |
| ZAP-046 (AmazonStrategy) | Hard | Must exist (Phase 4) |

**Blocks:**
- EPIC-09 (OfferReplicationWorker uses this)

---

## Definition of Done

- [x] LinkSubstitutionService implements factory pattern
- [x] All 3 strategies integrated
- [x] Unified API: buildAffiliateLink(marketplace, productId, tenantId)
- [x] Error handling for unconfigured marketplaces
- [x] buildAllAffiliateLinks() for multi-marketplace support
- [x] Unit tests: all marketplaces, error cases
- [x] Integration test: works with OfferReplicationWorker
- [x] `npm run typecheck` → 0 errors

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/services/offers/link-substitution.service.ts` | CREATE | Factory service |
| `apps/api/src/services/offers/link-substitution.service.test.ts` | CREATE | Tests |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — unifies all strategies |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 2-3*
