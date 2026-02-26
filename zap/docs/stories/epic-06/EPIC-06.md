# EPIC-06 — Group Monitoring Infrastructure
**Platform:** Zap — WhatsApp Automation SaaS
**Phase:** RedirectFlow | **Sprint:** 1-2 (Weeks 1-2)
**Status:** Ready for Development
**Owner:** @dev (Dex)
**Prepared by:** Morgan (Product Manager)
**Last updated:** 2026-02-26

---

## Epic Objective

Enable the RedirectFlow system to listen to and capture messages from competitor WhatsApp groups 24/7. This epic establishes the foundation for offer monitoring by implementing group tracking, webhook routing, and message capture infrastructure.

No other RedirectFlow feature can work until this epic is complete.

---

## Stories in This Epic

| Story File | ID | Title | Priority | Points | Status |
|-----------|-----|-------|---------|--------|--------|
| [EPIC-06-STORY-01.md](./EPIC-06-STORY-01.md) | ZAP-032 | Setup `monitored_groups` table + CRUD API | 🔴 CRITICAL | 3 | Ready |
| [EPIC-06-STORY-02.md](./EPIC-06-STORY-02.md) | ZAP-033 | Evolution webhook routing (monitored vs target groups) | 🔴 CRITICAL | 3 | Ready |
| [EPIC-06-STORY-03.md](./EPIC-06-STORY-03.md) | ZAP-034 | Message capture from monitored groups | 🔴 CRITICAL | 3 | Ready |
| [EPIC-06-STORY-04.md](./EPIC-06-STORY-04.md) | ZAP-035 | Dashboard: Manage monitored groups (UI) | 🟠 HIGH | 2 | Ready |
| [EPIC-06-STORY-05.md](./EPIC-06-STORY-05.md) | ZAP-036 | GroupMonitorService worker tests | 🟠 HIGH | 2 | Ready |

**Total Story Points:** 13

---

## Implementation Order

Stories MUST be implemented in this sequence due to hard dependencies:

```
STORY-01 (Database)
    └── STORY-02 (Webhook routing)
    └── STORY-03 (Message capture)

STORY-02 + STORY-03 (Parallel after STORY-01)
    └── STORY-04 (Dashboard UI)
    └── STORY-05 (Tests)
```

**Safe execution sequence:**
```
Day 1:  STORY-01 (foundation) — must be first
Day 2:  STORY-02 + STORY-03 in parallel
Day 3:  STORY-04 + STORY-05 in parallel
```

---

## Architecture Context

### Data Model
```
Monitored Group (competitor groups user is listening to)
├─ id: UUID
├─ tenant_id: UUID
├─ connection_id: UUID (which WhatsApp account)
├─ group_name: TEXT
├─ group_jid: TEXT (WhatsApp identifier)
├─ status: 'active'|'paused'|'deleted'
└─ monitored_since: TIMESTAMP

Message Flow:
Evolution Webhook (all groups)
    ↓
GroupMonitorService
    ├─ Is group in monitored_groups?
    │   ├─ YES → Parse & enqueue to OfferParserQueue (EPIC-07)
    │   └─ NO → Route to BroadcastWorker (existing)
```

### Service Architecture
```
GroupMonitorService (new TypeScript service)
├─ Receives Evolution webhook for message_create events
├─ Checks: is group_jid in monitored_groups table?
├─ If yes: extracts message text, enqueues to parser
├─ If no: passes to existing broadcast routing

Integration points:
- Database: monitored_groups table (RLS policies)
- Queue: BullMQ (OfferParserQueue - created in EPIC-07)
- API: /api/v1/monitored-groups CRUD endpoints
```

---

## Dependencies

### External Services Required
| Service | Purpose | Status |
|---------|---------|--------|
| Supabase | monitored_groups table + RLS | ✅ Existing |
| Evolution API | Webhook data | ✅ Existing |
| BullMQ | Queue for offer parsing | ✅ Existing |
| Redis | Queue backend | ✅ Existing |

### Blocking on EPIC-06
- EPIC-07 (Offer Detection) — needs message capture
- EPIC-08 (Link Substitution) — needs captured offers
- EPIC-09 (Replication) — needs all above

---

## Definition of Done (Epic Level)

All stories in this epic are complete when:

- [ ] `monitored_groups` table created with RLS policies ✅ ZAP-032
- [ ] CRUD API working: GET/POST/DELETE/PATCH `/monitored-groups` ✅ ZAP-032
- [ ] Evolution webhook routes monitored vs target groups correctly ✅ ZAP-033
- [ ] Message capture from monitored groups tested end-to-end ✅ ZAP-034
- [ ] Dashboard UI allows adding/pausing/removing groups ✅ ZAP-035
- [ ] GroupMonitorService has 80%+ code coverage ✅ ZAP-036
- [ ] `npm run typecheck` passes (0 errors) ✅ All
- [ ] `npm run lint` passes (0 errors) ✅ All
- [ ] Manual testing: can monitor 10 groups simultaneously ✅ ZAP-034

---

## Handoff to Next Epic

After EPIC-06 is complete, EPIC-07 (Offer Detection & Parsing) begins.

**Pre-conditions for EPIC-07:**
- `monitored_groups` table created and populated
- Evolution webhook routing working
- Message capture pipeline stable
- GroupMonitorService available for import

---

## Product Context

**From Architecture Design:** `docs/architecture/redirectflow-architecture-design.md`

This epic is **Phase 1, Layer 1** of the RedirectFlow system:

```
Layer 1: Monitoring (Inbound) ← THIS EPIC
├─ Receive Evolution webhooks
├─ Filter monitored groups
├─ Extract message content
└─ Enqueue to parser

Layer 2: Parsing & Deduplication
Layer 3: Link Substitution
Layer 4: Replication (Outbound)
Layer 5: Analytics & Tracking
```

---

*Prepared by: Morgan — Product Manager*
*Source: docs/architecture/redirectflow-architecture-design.md § Part 1*
*Review: @po *validate-story-draft EPIC-06 before development starts*
