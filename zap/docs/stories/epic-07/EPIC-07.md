# EPIC-07 — Offer Detection & Parsing
**Platform:** Zap — WhatsApp Automation SaaS
**Phase:** RedirectFlow | **Sprint:** 1-4 (Weeks 1-4)
**Status:** Ready for Development
**Owner:** @dev (Dex)
**Prepared by:** Morgan (Product Manager)
**Last updated:** 2026-02-26

---

## Epic Objective

Extract offer data from captured messages with marketplace-specific pattern detection and intelligent deduplication. This epic transforms raw message text into structured offer records that can be substituted and replicated.

---

## Stories in This Epic

| Story File | ID | Title | Priority | Points | Status |
|-----------|-----|-------|---------|--------|--------|
| [EPIC-07-STORY-01.md](./EPIC-07-STORY-01.md) | ZAP-037 | Marketplace pattern detection (Shopee, ML regex) | 🔴 CRITICAL | 2 | Ready |
| [EPIC-07-STORY-02.md](./EPIC-07-STORY-02.md) | ZAP-038 | URL extraction + normalization (Phase 1: Shopee) | 🔴 CRITICAL | 3 | Ready |
| [EPIC-07-STORY-03.md](./EPIC-07-STORY-03.md) | ZAP-039 | `captured_offers` table + RLS + migrations | 🔴 CRITICAL | 2 | Ready |
| [EPIC-07-STORY-04.md](./EPIC-07-STORY-04.md) | ZAP-040 | Deduplication engine (hash-based, daily window) | 🔴 CRITICAL | 3 | Ready |
| [EPIC-07-STORY-05.md](./EPIC-07-STORY-05.md) | ZAP-041 | OfferParserWorker (BullMQ job processing) | 🔴 CRITICAL | 3 | Ready |
| [EPIC-07-STORY-06.md](./EPIC-07-STORY-06.md) | ZAP-042 | Dashboard: View captured offers (with filters) | 🟠 HIGH | 3 | Ready |

**Total Story Points:** 16

---

## Implementation Order

Stories MUST be implemented in this sequence:

```
STORY-03 (Database)
    └── STORY-39 (Dedup)
    └── STORY-41 (Parser worker)

STORY-01 + STORY-02 (Patterns & extraction)
    └── Feeds into STORY-41 (Parser)

STORY-41 (Parser worker)
    └── STORY-42 (Dashboard)
```

**Safe execution sequence:**
```
Day 1:  STORY-03 (foundation) — must be first
Day 2:  STORY-01 + STORY-02 + STORY-40 in parallel
Day 3:  STORY-41 + STORY-42 in parallel
```

---

## Architecture Context

### Data Model
```
Captured Offer (offer extracted from competitor message)
├─ id: UUID
├─ tenant_id: UUID
├─ marketplace: 'shopee'|'mercadolivre'|'amazon'
├─ product_id: TEXT (ASIN for Amazon, item_id for ML, etc)
├─ product_title: TEXT
├─ product_image_url: TEXT
├─ original_price: DECIMAL
├─ discounted_price: DECIMAL
├─ discount_percent: INT
├─ original_url: TEXT
├─ source_group_jid: TEXT
├─ captured_at: TIMESTAMP
├─ dedup_hash: TEXT (format: {marketplace}:{product_id}:{YYYY-MM-DD})
├─ is_duplicate: BOOLEAN
├─ duplicate_of_offer_id: UUID
├─ expires_at: TIMESTAMP (for Amazon 90-day expiry)
└─ status: 'new'|'pending_substitution'|'ready'|'sent'|'expired'
```

### Parser Flow
```
Message: "Shopee: iPhone 14 R$1.999 → R$1.299 https://shopee.com.br/p-123456"
    ↓
ZAP-037: Detect marketplace = 'shopee'
    ↓
ZAP-038: Extract product_id = '123456', price = 1299
    ↓
ZAP-040: Generate dedup_hash = 'shopee:123456:2026-02-26'
    ↓
ZAP-040: Check duplicate (same hash today?) → NO
    ↓
ZAP-041: Create captured_offer record, status='new'
    ↓
→ EPIC-08 (Link Substitution)
```

---

## Dependencies

### Blocks
- EPIC-08 (Link Substitution) — needs captured offers
- EPIC-09 (Replication) — needs substituted offers

### Blocked by
- EPIC-06 (Group Monitoring) — message capture must work first

---

## Definition of Done (Epic Level)

- [ ] Shopee pattern detection >95% accuracy ✅ ZAP-037
- [ ] Mercado Livre pattern detection >95% accuracy ✅ ZAP-037 (Phase 3)
- [ ] Amazon ASIN detection >95% accuracy ✅ ZAP-038 (Phase 4)
- [ ] `captured_offers` table created with RLS + indexes ✅ ZAP-039
- [ ] Deduplication reduces same-day duplicates by >90% ✅ ZAP-040
- [ ] OfferParserWorker processes 100+ messages/sec ✅ ZAP-041
- [ ] Dashboard displays offers with marketplace filter ✅ ZAP-042
- [ ] `npm run typecheck` passes (0 errors) ✅ All
- [ ] `npm run lint` passes (0 errors) ✅ All
- [ ] Integration test: capture 100 messages → extract 80+ valid offers ✅ ZAP-041

---

## Product Context

**From Architecture Design:** `docs/architecture/redirectflow-architecture-design.md`

This epic is **Phase 1-3, Layer 2** of the RedirectFlow system:

```
Layer 1: Monitoring (Inbound) — EPIC-06
Layer 2: Parsing & Deduplication ← THIS EPIC
├─ Pattern detection (ZAP-037)
├─ URL extraction (ZAP-038)
├─ Deduplication (ZAP-040)
└─ Worker processing (ZAP-041)
Layer 3: Link Substitution — EPIC-08
Layer 4: Replication (Outbound) — EPIC-09
Layer 5: Analytics & Tracking — EPIC-09
```

**Marketplace Phases:**
- Phase 1 (Week 1): Shopee detection + extraction
- Phase 2 (Week 2): Full Shopee parser worker
- Phase 3 (Week 5): Mercado Livre detection + extraction
- Phase 4 (Week 7): Amazon ASIN extraction

---

*Prepared by: Morgan — Product Manager*
*Source: docs/architecture/redirectflow-architecture-design.md § Part 2*
*Review: @po *validate-story-draft EPIC-07 before development starts*
