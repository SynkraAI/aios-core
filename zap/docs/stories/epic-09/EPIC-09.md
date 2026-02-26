# EPIC-09 — Intelligent Replication & Analytics
**Platform:** Zap — WhatsApp Automation SaaS
**Phase:** RedirectFlow | **Sprint:** 2-4 (Weeks 3-8)
**Status:** Ready for Development
**Owner:** @dev (Dex)
**Prepared by:** Morgan (Product Manager)
**Last updated:** 2026-02-26

---

## Epic Objective

Send captured and substituted offers to user's WhatsApp groups with intelligent rate limiting to prevent bans. Build analytics and spy dashboard to track performance by marketplace and provide competitive insights.

This epic completes the RedirectFlow feature set.

---

## Stories in This Epic

| Story File | ID | Title | Priority | Points | Status |
|-----------|-----|-------|---------|--------|--------|
| [EPIC-09-STORY-01.md](./EPIC-09-STORY-01.md) | ZAP-048 | OfferReplicationQueue + rate limiting (BullMQ) | 🔴 CRITICAL | 3 | Ready |
| [EPIC-09-STORY-02.md](./EPIC-09-STORY-02.md) | ZAP-049 | Extend BroadcastWorker for replicated_offers | 🔴 CRITICAL | 2 | Ready |
| [EPIC-09-STORY-03.md](./EPIC-09-STORY-03.md) | ZAP-050 | Anti-ban delay engine (jitter + exponential backoff) | 🔴 CRITICAL | 3 | Ready |
| [EPIC-09-STORY-04.md](./EPIC-09-STORY-04.md) | ZAP-051 | Analytics dashboard (conversions, ROI, spy insights) | 🟠 HIGH | 4 | Ready |

**Total Story Points:** 12

---

## Implementation Order

Stories MUST be implemented in this sequence:

```
STORY-01 (Rate limiting queue)
    ├── STORY-02 (Broadcast worker extension)
    └── STORY-03 (Anti-ban delays)

All converge in:
    └── STORY-04 (Analytics dashboard)
```

**Safe execution sequence:**
```
Day 1:  STORY-01 (queue infrastructure) — must be first
Day 2:  STORY-02 + STORY-03 in parallel
Day 3:  STORY-04 (analytics dashboard)
```

---

## Architecture Context

### Rate Limiting Strategy
```
Per Group:
- Max 1 offer / 2 minutes
- Base delay: 2:00
- Jitter: +0-30 seconds
- Result: 2:00-2:30 per send

Per Connection (WhatsApp number):
- Max 3 offers / 5 minutes
- Exponential backoff if rate limit detected
  ├─ Attempt 1: wait 5 min
  ├─ Attempt 2: wait 10 min
  ├─ Attempt 3: wait 20 min
  └─ Attempt 4+: wait 60 min or mark restricted
```

### Replication Flow
```
Replicated Offer (queued)
    ↓
OfferReplicationQueue (BullMQ)
├─ Calculate delay: 2:00 + jitter(0:30)
├─ Apply group backoff multiplier (if restricted)
└─ Schedule job with delay
    ↓
[After delay expires]
    ↓
BroadcastWorker (extended)
├─ Fetch connection + group data
├─ Send via SessionManager (existing)
└─ Update: sent_at, target_group_id
    ↓
Link tracking (EPIC-05)
├─ User clicks affiliate link
├─ LinkService records click
└─ Optional: webhook on conversion
```

### Analytics Data Model
```
ReplicatedOffers dashboard:
├─ Offers captured today / this week
├─ Offers sent / success rate
├─ Clicks per marketplace
├─ Conversions per marketplace
├─ Estimated revenue

Spy Insights (competitive intelligence):
├─ Trending products (most seen across groups)
├─ Marketplace distribution (which marketplace most active?)
├─ Competitor analysis (which groups post most?)
├─ Timing patterns (when do competitors post?)
└─ Price distribution (discount patterns)

User Performance:
├─ Conversion rate by marketplace
├─ ROI by marketplace
├─ Top performing offers
└─ Top performing source groups (which competitors to watch)
```

---

## Dependencies

### Blocks
- Nothing (final epic)

### Blocked by
- EPIC-06 (Group Monitoring)
- EPIC-07 (Offer Detection)
- EPIC-08 (Link Substitution)

---

## Definition of Done (Epic Level)

- [ ] OfferReplicationQueue implements per-group rate limiting ✅ ZAP-048
- [ ] Rate limiter: 1 offer / 2 min per group ✅ ZAP-048
- [ ] BroadcastWorker extended for offer context ✅ ZAP-049
- [ ] Anti-ban jitter variation is unpredictable ✅ ZAP-050
- [ ] Exponential backoff on rate limit errors ✅ ZAP-050
- [ ] Analytics dashboard loads <1 second ✅ ZAP-051
- [ ] Spy insights show trending products ✅ ZAP-051
- [ ] Conversion tracking by marketplace works ✅ ZAP-051
- [ ] Zero WhatsApp bans in testing ✅ ZAP-050
- [ ] `npm run typecheck` passes (0 errors) ✅ All
- [ ] `npm run lint` passes (0 errors) ✅ All
- [ ] Load test: 100 offers/hour to 20 groups (stable) ✅ ZAP-049

---

## Product Context

**From Architecture Design:** `docs/architecture/redirectflow-architecture-design.md`

This epic is **Phase 2-4, Layers 4-5** of the RedirectFlow system:

```
Layer 1: Monitoring (Inbound) — EPIC-06
Layer 2: Parsing & Deduplication — EPIC-07
Layer 3: Link Substitution — EPIC-08
Layer 4: Replication (Outbound) ← THIS EPIC (ZAP-048, ZAP-049, ZAP-050)
├─ OfferReplicationQueue
├─ Rate limiting
├─ Anti-ban delays
└─ BroadcastWorker extension

Layer 5: Analytics & Tracking ← THIS EPIC (ZAP-051)
├─ Conversion tracking
├─ ROI calculation
└─ Spy insights
```

**Success Metrics:**
- Zero WhatsApp bans (rate limiting effective)
- 2-5 minute latency (capture → send)
- >99% send success rate
- Conversion rate tracked per marketplace

---

## Anti-Ban Safety

**Implementation validates:**
- ✅ Rate limiting prevents pattern detection
- ✅ Jitter randomization unpredictable
- ✅ Per-group delays avoid burst traffic
- ✅ Exponential backoff on errors
- ✅ No hardcoded timing patterns

**Testing:**
- Load test: 100 offers/hour to 20 groups
- Verify: no WhatsApp errors (HTTP 429)
- Verify: delays vary ±random within range
- Verify: backoff increases on failures

---

*Prepared by: Morgan — Product Manager*
*Source: docs/architecture/redirectflow-architecture-design.md § Part 4-5*
*Review: @po *validate-story-draft EPIC-09 before development starts*
