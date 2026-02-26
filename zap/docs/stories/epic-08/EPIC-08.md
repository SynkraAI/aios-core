# EPIC-08 — Link Substitution Engine
**Platform:** Zap — WhatsApp Automation SaaS
**Phase:** RedirectFlow | **Sprint:** 1-8 (Weeks 1-2, 5-8)
**Status:** Ready for Development
**Owner:** @dev (Dex)
**Prepared by:** Morgan (Product Manager)
**Last updated:** 2026-02-26

---

## Epic Objective

Build marketplace-specific affiliate link construction service. Transform captured offers with the user's affiliate/account credentials to create substitution-ready links for Shopee, Mercado Livre, and Amazon.

---

## Stories in This Epic

| Story File | ID | Title | Priority | Points | Status |
|-----------|-----|-------|---------|--------|--------|
| [EPIC-08-STORY-01.md](./EPIC-08-STORY-01.md) | ZAP-043 | Marketplace credentials storage (encrypted) | 🔴 CRITICAL | 3 | Ready |
| [EPIC-08-STORY-02.md](./EPIC-08-STORY-02.md) | ZAP-044 | Shopee integration (Phase 1) | 🔴 CRITICAL | 3 | Ready |
| [EPIC-08-STORY-03.md](./EPIC-08-STORY-03.md) | ZAP-045 | Mercado Livre integration (Phase 3) | 🟠 HIGH | 4 | Ready |
| [EPIC-08-STORY-04.md](./EPIC-08-STORY-04.md) | ZAP-046 | Amazon integration (Phase 4) | 🟠 HIGH | 2 | Ready |
| [EPIC-08-STORY-05.md](./EPIC-08-STORY-05.md) | ZAP-047 | LinkSubstitutionService (factory pattern) | 🔴 CRITICAL | 2 | Ready |

**Total Story Points:** 14

---

## Implementation Order

Stories MUST be implemented in this sequence:

```
STORY-01 (Credentials storage)
    ├── STORY-02 (Shopee integration) — Phase 1
    ├── STORY-03 (Mercado Livre integration) — Phase 3
    └── STORY-04 (Amazon integration) — Phase 4

All feed into:
    └── STORY-05 (Factory service)
```

**Safe execution sequence:**
```
Day 1:  STORY-01 (credentials) — must be first
Day 2:  STORY-02 (Shopee) — Phase 1
Week 5: STORY-03 (ML) — Phase 3
Week 7: STORY-04 (Amazon) + STORY-05 (Factory) — Phase 4
```

---

## Architecture Context

### Credentials Model
```
Marketplace Credentials (per tenant, encrypted)
├─ Shopee:
│   ├─ affiliate_id: TEXT (public, safe)
│   └─ api_key: TEXT (encrypted)
├─ Mercado Livre:
│   ├─ account_tag: TEXT (public, safe)
│   ├─ token: TEXT (encrypted)
│   └─ token_expires_at: TIMESTAMP
└─ Amazon:
    ├─ associates_id: TEXT (public, safe)
    └─ account_id: TEXT (optional)
```

### Link Substitution Strategy Pattern
```
LinkSubstitutionEngine (factory)
├─ getStrategy(marketplace) → MarketplaceStrategy
│   ├─ ShopeeStrategy
│   │   └─ buildLink(productId, affiliateId) → URL
│   ├─ MLStrategy
│   │   └─ buildLink(productId, accountTag) → URL
│   └─ AmazonStrategy
│       └─ buildLink(asin, associatesId) → URL
```

### Marketplace-Specific Implementation

**Shopee (Phase 1):**
```
Original: https://shopee.com.br/p-123456?af_id=competitor_id
Yours:    https://shopee.com.br/p-123456?af_id={USER_AFFILIATE_ID}
```

**Mercado Livre (Phase 3):**
```
Original: https://mercadolivre.com.br/...#item_id=12345&user_id=rival_tag
Yours:    https://mercadolivre.com.br/...#item_id=12345&user_id={USER_TAG}

Setup: Chrome extension captures token + account_tag
```

**Amazon (Phase 4):**
```
Original: https://amazon.com.br/dp/B0123456789?tag=rival-20
Yours:    https://amazon.com.br/dp/B0123456789?tag={USER_ASSOCIATES_ID}

Expiry: 90 days after capture → daily check worker
```

---

## Dependencies

### Blocks
- EPIC-09 (Intelligent Replication) — needs substituted links

### Blocked by
- EPIC-06 (Group Monitoring) — indirect (via EPIC-07)
- EPIC-07 (Offer Detection) — needs captured offers to substitute

---

## Definition of Done (Epic Level)

- [ ] Marketplace credentials table created + encrypted ✅ ZAP-043
- [ ] Credentials API working: GET/POST/DELETE per marketplace ✅ ZAP-043
- [ ] Shopee link substitution 100% accurate ✅ ZAP-044
- [ ] Mercado Livre Chrome extension flow complete ✅ ZAP-045
- [ ] Amazon link generation + 90-day expiry worker ✅ ZAP-046
- [ ] LinkSubstitutionService factory pattern implemented ✅ ZAP-047
- [ ] All 3 marketplaces tested end-to-end ✅ ZAP-047
- [ ] `npm run typecheck` passes (0 errors) ✅ All
- [ ] `npm run lint` passes (0 errors) ✅ All
- [ ] Encryption tests: credentials never logged/leaked ✅ ZAP-043

---

## Product Context

**From Architecture Design:** `docs/architecture/redirectflow-architecture-design.md`

This epic is **Phase 1-4, Layer 3** of the RedirectFlow system:

```
Layer 1: Monitoring (Inbound) — EPIC-06
Layer 2: Parsing & Deduplication — EPIC-07
Layer 3: Link Substitution ← THIS EPIC
├─ Credential storage (ZAP-043)
├─ Shopee strategy (ZAP-044) — Phase 1
├─ ML strategy (ZAP-045) — Phase 3
├─ Amazon strategy (ZAP-046) — Phase 4
└─ Factory service (ZAP-047)
Layer 4: Replication (Outbound) — EPIC-09
Layer 5: Analytics & Tracking — EPIC-09
```

**Key Decision:** Marketplace-specific strategies (not merged) to handle different URL patterns and APIs.

---

*Prepared by: Morgan — Product Manager*
*Source: docs/architecture/redirectflow-architecture-design.md § Part 2*
*Review: @po *validate-story-draft EPIC-08 before development starts*
