# EPIC-08-STORY-04 — Amazon integration (Phase 4)
**Story ID:** ZAP-046
**Epic:** EPIC-08 — Link Substitution Engine
**Sprint:** 7 | **Phase:** Phase 4
**Priority:** 🟠 HIGH
**Story Points:** 2
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** link substitution engine,
**I want** to construct Amazon Associates links using the user's associates ID,
**so that** Amazon offers can be sent with proper tracking.

---

## Acceptance Criteria

### AC-046.1 — Amazon link construction works
```bash
Input: asin='B0123456789', associatesId='user-id-20'
Output: "https://amazon.com.br/dp/B0123456789?tag=user-id-20"

EXPECTED: Correct format with tag parameter
```

### AC-046.2 — Handles 90-day link expiry
```bash
Amazon Associate links expire 90 days after generation

Implementation:
- captured_offers.expires_at = captured_at + 90 days
- Daily worker checks: if expires_at < NOW(), mark status='expired'
- Do NOT send expired offers

Log: "Amazon offer expired, not replicated: {product_id}"
```

### AC-046.3 — Expiry worker runs daily
```bash
Scheduled job (e.g., cron: 0 1 * * *)
- Query: WHERE marketplace='amazon' AND expires_at < NOW() AND status != 'expired'
- Update: status='expired'
- Log counts: "X Amazon offers expired today"
```

### AC-046.4 — Handles missing credentials gracefully
```bash
If tenant hasn't configured Amazon:
- Return: { error: "Amazon not configured" }
```

### AC-046.5 — Link construction is deterministic
```bash
Same asin + associatesId → Same output
```

---

## Technical Notes

### Amazon Strategy + Expiry Worker
```typescript
// apps/api/src/services/offers/strategies/amazon.strategy.ts

export class AmazonStrategy implements MarketplaceStrategy {
  async buildLink(asin: string, tenantId: string): Promise<string> {
    if (!asin || !/^B[A-Z0-9]{9}$/.test(asin)) {
      throw new Error(`Invalid Amazon ASIN: ${asin}`)
    }

    const { data: creds } = await supabaseAdmin
      .from('marketplace_credentials')
      .select('amazon_associates_id')
      .eq('tenant_id', tenantId)
      .single()

    if (!creds?.amazon_associates_id) {
      throw new Error('Amazon not configured')
    }

    const link = `https://amazon.com.br/dp/${asin}?tag=${creds.amazon_associates_id}`
    return link
  }
}

// apps/api/src/workers/amazon-expiry.worker.ts

export async function checkAmazonExpiry() {
  const { data: expired, error } = await supabaseAdmin
    .from('captured_offers')
    .update({ status: 'expired', updated_at: new Date() })
    .eq('marketplace', 'amazon')
    .lt('expires_at', new Date())
    .neq('status', 'expired')
    .select('id')

  const count = expired?.length || 0
  logger.info(`Amazon expiry check: ${count} offers expired`)

  return { expired_count: count }
}

// Scheduled in: apps/api/src/workers/index.ts
// Uses node-cron or similar: scheduleJob('0 1 * * *', checkAmazonExpiry)
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-043 (credentials storage) | Hard | Must exist |
| ZAP-039 (captured_offers table has expires_at) | Hard | Must exist |

**Blocks:**
- ZAP-047 (LinkSubstitutionService factory)
- EPIC-09 (replication)

---

## Definition of Done

- [x] AmazonStrategy class implemented
- [x] Link construction correct (with tag parameter)
- [x] ASIN validation working
- [x] Expiry worker implemented + scheduled daily
- [x] Expired offers marked status='expired'
- [x] Unit tests: construction, expiry, edge cases
- [x] `npm run typecheck` → 0 errors

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/services/offers/strategies/amazon.strategy.ts` | CREATE | Amazon strategy |
| `apps/api/src/workers/amazon-expiry.worker.ts` | CREATE | Expiry check worker |
| `apps/api/src/workers/index.ts` | MODIFY | Schedule expiry worker |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — Phase 4 |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 2*
