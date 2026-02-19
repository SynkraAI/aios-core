# EPIC-02 — PO Validation Record
**Status:** ✅ All 6 Stories APPROVED — Ready for @sm
**Date:** 2026-02-19
**PO:** Pax (Product Owner)
**Source:** `docs/prd/epic-02-prd.md` + `docs/architecture/epic-02-arch-validation.md`

---

## Pre-Validation Decisions

### Decision 1 — `plans.slug` Column (Blocking ZAP-006)

**Choice:** Option A — Add migration ✅

**Rationale:** Adding an explicit `slug` column is architecturally correct:
- Consistent with `tenants.slug` convention already in schema
- `name` column should hold display names; `slug` holds programmatic identifiers
- Enables future API filtering by plan slug without string comparison on name

**Action taken:** Migration created at `supabase/migrations/20260219000001_plans_add_slug.sql`
- `ALTER TABLE plans ADD COLUMN slug TEXT UNIQUE NOT NULL`
- Seeds: `lite`, `standard`, `black` (derived from existing `name` values)

**ZAP-006 plan limit query must use:**
```typescript
supabaseAdmin.from('tenants')
  .select('plan_id, plans(slug, max_connections)')
  .eq('id', tenantId)
  .single()
```

### Decision 2 — `plans.max_broadcasts_per_month` Values

**Status:** Deferred — not blocking EPIC-02 ✅

**Discrepancy:** PRD Appendix A specifies lite=20, standard=100, black=500. Migration seeds lite=100, standard=500, black=999.

**Ruling:** This column is not used in any EPIC-02 story. Difference only matters in EPIC-05 (Broadcasts). Decision deferred to EPIC-05 planning.

**No action required for ZAP-006 through ZAP-011.**

### Decision 3 — `plans` Table Name vs Slug Alignment

The migration column `name` stores `'lite'`, `'standard'`, `'black'` — which are already slug-like. After migration, both `slug` and `name` will have the same value. `name` can be updated in a future migration to display-friendly values (e.g. `'Lite'`, `'Standard'`, `'Black'`) without breaking the `slug` identifiers. **Not blocking.**

---

## Story Validation — 10-Point Checklist

### ✅ ZAP-006 — Create Connection

**Score: 9/10 | Verdict: GO**

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Clear title | ✅ | "Create Connection" |
| 2 | Complete description | ✅ | POST /connections + Evolution + plan limit |
| 3 | Testable AC | ✅ | AC-006.1–006.5 all verifiable |
| 4 | Well-defined scope | ⚠️ | sessionManager refactor must be explicit in story File List |
| 5 | Dependencies mapped | ✅ | EPIC-01 ✅, plans.slug migration ✅ (created) |
| 6 | Complexity estimate | ✅ | 5 pts (medium-high; includes refactor) |
| 7 | Business value | ✅ | Prerequisite for all other EPIC-02 stories |
| 8 | Risks documented | ✅ | Evolution fail → rollback; plan limit enforcement |
| 9 | DoD clear | ✅ | 5 ACs + typecheck 0 errors |
| 10 | PRD alignment | ✅ | FR-CONN-01, FR-CONN-01a–c, FR-CONN-05 |

**Corrections for @sm when drafting:**
1. **Scope (critical):** Story must explicitly list `sessionManager` refactor tasks in Task list:
   - Add `connectionId` param to all 10 methods of `SessionManager`
   - Update `assertHealthy(tenantId, connectionId)` signature
   - Update `message.worker.ts:34` to pass `connectionId`
2. **Migration dependency:** Add `supabase/migrations/20260219000001_plans_add_slug.sql` to File List
3. **Dev Note:** Plan limit query must use `plans.slug` (migration created, safe to use)
4. **Dev Note:** Verify Evolution `fetchInstances` response shape on first run — log raw response once

---

### ✅ ZAP-007 — QR Code SSE Stream

**Score: 10/10 | Verdict: GO**

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Clear title | ✅ | "QR Code SSE Stream" |
| 2 | Complete description | ✅ | SSE stream with named events, 120s timeout |
| 3 | Testable AC | ✅ | AC-007.1–007.6 all verifiable |
| 4 | Well-defined scope | ✅ | GET /connections/:id/qr only |
| 5 | Dependencies mapped | ✅ | ZAP-006 (connectionId exists before QR is fetched) |
| 6 | Complexity estimate | ✅ | 5 pts (SSE + polling logic) |
| 7 | Business value | ✅ | UX during QR pairing — most critical UX moment |
| 8 | Risks documented | ✅ | QR expiry, SSE browser reconnect |
| 9 | DoD clear | ✅ | 6 ACs + SSE format verification |
| 10 | PRD alignment | ✅ | FR-CONN-02, FR-CONN-02a–d |

**Corrections for @sm when drafting:**
1. **AC-007.4 clarification:** Specify `24 polls × 5 seconds = 120s` explicitly in AC text (prevents regression to 10×3s=30s from current scaffold)
2. **Dev Note:** Current `connections.ts` scaffold uses 10 iterations × 3s — must be replaced with 24 × 5s
3. **Dev Note:** Check DB status (not Evolution directly) after each poll — webhook may have already updated status asynchronously

---

### ✅ ZAP-008 — Connection Status

**Score: 10/10 | Verdict: GO**

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Clear title | ✅ | "Connection Status" |
| 2 | Complete description | ✅ | Live status + DB sync strategy |
| 3 | Testable AC | ✅ | AC-008.1–008.4 verifiable |
| 4 | Well-defined scope | ✅ | GET /:id/status — live fetch + persist if differs |
| 5 | Dependencies mapped | ✅ | ZAP-006 |
| 6 | Complexity estimate | ✅ | 3 pts (straightforward) |
| 7 | Business value | ✅ | Dashboard health visibility |
| 8 | Risks documented | ✅ | Evolution unreachable → `stale: true` flag |
| 9 | DoD clear | ✅ | 4 ACs |
| 10 | PRD alignment | ✅ | FR-CONN-03, FR-CONN-03a |

**Corrections for @sm when drafting:**
1. **Dev Note (Decision 4 - Arch):** Status response strategy — always fetch live from Evolution; if live ≠ DB → update DB; if Evolution unreachable → return DB status with `{ stale: true }`
2. **Dev Note:** Current scaffold (`connections.ts:114`) calls `getStatus(tenantId)` without `connectionId` — must be fixed in ZAP-006 refactor

---

### ✅ ZAP-009 — Delete Connection

**Score: 10/10 | Verdict: GO**

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Clear title | ✅ | "Delete Connection" |
| 2 | Complete description | ✅ | Delete with active broadcast guard |
| 3 | Testable AC | ✅ | AC-009.1–009.4 verifiable |
| 4 | Well-defined scope | ✅ | DELETE /:id + Evolution logout + delete |
| 5 | Dependencies mapped | ✅ | ZAP-006 |
| 6 | Complexity estimate | ✅ | 3 pts |
| 7 | Business value | ✅ | Lifecycle completeness |
| 8 | Risks documented | ✅ | Active broadcast guard (409) |
| 9 | DoD clear | ✅ | 4 ACs |
| 10 | PRD alignment | ✅ | FR-CONN-06, FR-CONN-06a–b |

**Corrections for @sm when drafting:**
1. **Dev Note:** Current scaffold (`connections.ts:124`) doesn't check for active broadcasts — must add `broadcasts` table query for `status = 'sending'` before deleting
2. **Dev Note:** Two Evolution calls required in sequence: `DELETE /instance/logout/{name}` then `DELETE /instance/delete/{name}` — not just one
3. **Dev Note:** Status set to `disconnected` (soft delete) — record is NOT deleted from DB

---

### ✅ ZAP-010 — Evolution Webhook Handler

**Score: 9/10 | Verdict: GO**

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Clear title | ✅ | "Evolution Webhook Handler" |
| 2 | Complete description | ✅ | connection.update + group.participants.update stub |
| 3 | Testable AC | ✅ | AC-010.1–010.7 verifiable |
| 4 | Well-defined scope | ✅ | POST /webhooks/evolution, no auth |
| 5 | Dependencies mapped | ⚠️ | Should implement AFTER ZAP-006 naming finalized; but code can be written independently |
| 6 | Complexity estimate | ✅ | 5 pts (state machine + Redis + DB) |
| 7 | Business value | ✅ | Real-time status + ban detection |
| 8 | Risks documented | ✅ | Evolution payload schema changes |
| 9 | DoD clear | ✅ | 7 ACs |
| 10 | PRD alignment | ✅ | FR-CONN-04, FR-CONN-WH-01–07 |

**Corrections for @sm when drafting:**
1. **Dependency clarification:** ZAP-010 is the safest Day 1 start — it doesn't depend on the ZAP-006 sessionManager refactor being COMPLETE, but it must USE the `zap_{tenantId}_{connectionId}` naming convention from the start. Include note: "Instance parsing must assume format `zap_{tenantId}_{connectionId}`"
2. **Dev Note (CRITICAL):** Current stub at `webhooks.ts:53` uses `replace('zap_', '')` — produces `'{tenantId}_{connectionId}'`. Must replace with `indexOf`/`slice` parsing as documented in `docs/architecture/epic-02-arch-validation.md §D-01`
3. **Dev Note:** For `webhook_events` logging — use `supabaseAdmin` (service role); no JWT on this endpoint
4. **Dev Note:** AC-010.6 (500ms response) requires async DB update — fire-and-forget pattern: respond HTTP 200 immediately, process async
5. **Dev Note (Redis):** On `state=conflict|banned` → set Redis key `session_banned:{tenantId}:{connectionId}` with TTL or no-expiry (per session lifecycle)

---

### ✅ ZAP-011 — Connections Page UI

**Score: 10/10 | Verdict: GO**

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Clear title | ✅ | "Connections Page UI" |
| 2 | Complete description | ✅ | List + QR modal + status badges |
| 3 | Testable AC | ✅ | AC-011.1–011.8 verifiable |
| 4 | Well-defined scope | ✅ | Next.js frontend only; no new API routes |
| 5 | Dependencies mapped | ✅ | ZAP-006+007+008+009 all must be complete |
| 6 | Complexity estimate | ✅ | 5 pts (UI + SSE hook + TanStack Query) |
| 7 | Business value | ✅ | First UX moment post-login |
| 8 | Risks documented | ✅ | SSE browser reconnect (native EventSource handles) |
| 9 | DoD clear | ✅ | 8 ACs + visual review |
| 10 | PRD alignment | ✅ | FR-CONN-UI-01–07 |

**Corrections for @sm when drafting:**
1. **Dev Note:** Use TanStack Query for list + 5s refetch while any connection is `connecting` or `disconnected`
2. **Dev Note:** `useQRStream` hook wraps native `EventSource` API — must call `source.close()` on component unmount to prevent memory leaks
3. **Dev Note:** QR code display — `<img src={`data:image/png;base64,${code}`} />` (base64 from Evolution API is already image data)
4. **Dev Note:** Status badge colors per PRD §6.5: connected=green, connecting=yellow, disconnected=gray, banned=red

---

## Summary Validation Matrix

| Story | Score | Verdict | Blocking Issues | Priority |
|-------|-------|---------|-----------------|---------|
| ZAP-006 Create Connection | 9/10 | ✅ GO | plans.slug migration (CREATED ✅) | CRITICAL |
| ZAP-007 QR SSE Stream | 10/10 | ✅ GO | Depends on ZAP-006 | CRITICAL |
| ZAP-008 Connection Status | 10/10 | ✅ GO | Depends on ZAP-006 | HIGH |
| ZAP-009 Delete Connection | 10/10 | ✅ GO | Depends on ZAP-006 | HIGH |
| ZAP-010 Webhook Handler | 9/10 | ✅ GO | Instance naming convention (documented) | CRITICAL |
| ZAP-011 Connections UI | 10/10 | ✅ GO | Depends on ZAP-006+007+008+009 | HIGH |

**All 6 stories: APPROVED for @sm story creation.**

---

## Scope Confirmation

### ✅ Confirmed In-Scope for EPIC-02

- `sessionManager` full refactor (included in ZAP-006)
- `message.worker.ts` connectionId fix (1 line — included in ZAP-006)
- Evolution webhook handler — full implementation (ZAP-010)
- `group.participants.update` stub only — log and return 200 (EPIC-06 handles full processing)
- Migration `20260219000001_plans_add_slug.sql` (created — in ZAP-006 File List)

### ✅ Confirmed Out-of-Scope for EPIC-02

- `plans.max_broadcasts_per_month` values correction → deferred to EPIC-05
- Production webhook security (IP allowlist, secret validation) → V1
- Connection name/alias column → V1 (schema doesn't have it)
- QR regeneration button → Out of scope (auto-refreshes every 5s)
- Supabase Realtime for status updates → Polling sufficient for MVP

---

## Implementation Order Recommendation

Confirming @analyst recommendation with adjustment:

```
Day 1: ZAP-010  — Webhook handler (standalone, no API deps, sets naming convention)
Day 2: ZAP-006  — Create connection (sessionManager refactor + POST /connections)
Day 3: ZAP-007  — QR SSE stream
Day 3: ZAP-008  — Connection status (parallel with ZAP-007 — independent GET routes)
Day 4: ZAP-009  — Delete connection
Day 5: ZAP-011  — Connections UI (all API endpoints complete)
```

**Rationale for ZAP-010 first:**
ZAP-010 establishes the `zap_{tenantId}_{connectionId}` parsing contract in `webhooks.ts` before any other code depends on it. ZAP-006 can then implement `createInstance` knowing the webhook handler is already aligned with the naming convention. This order reduces integration risk.

---

## @sm Handoff — Story Creation Instructions

**Create in `docs/stories/epic-02/`:**

```
EPIC-02-STORY-06.md  — ZAP-006 [5 pts | CRITICAL | Day 2]
EPIC-02-STORY-07.md  — ZAP-007 [5 pts | CRITICAL | Day 3]
EPIC-02-STORY-08.md  — ZAP-008 [3 pts | HIGH    | Day 3]
EPIC-02-STORY-09.md  — ZAP-009 [3 pts | HIGH    | Day 4]
EPIC-02-STORY-10.md  — ZAP-010 [5 pts | CRITICAL | Day 1]
EPIC-02-STORY-11.md  — ZAP-011 [5 pts | HIGH    | Day 5]
```

**Each story must include:**
- All corrections listed in this document under "Corrections for @sm"
- Dev Notes section with architecture-specific implementation warnings
- File List pre-populated with files to create/modify (from PRD §6.1–6.2)
- Reference to this validation record and `docs/architecture/epic-02-arch-validation.md`
- Status: `Ready` (PO has approved — transition from Draft → Ready happens at story creation)

**ZAP-006 specific File List must include:**
- `apps/api/src/services/whatsapp/session-manager.ts` — MODIFY (refactor)
- `apps/api/src/routes/connections.ts` — MODIFY (plan limit + fix POST)
- `apps/api/src/workers/message.worker.ts` — MODIFY (add connectionId to sendTextToGroup call)
- `supabase/migrations/20260219000001_plans_add_slug.sql` — CREATED (apply migration)

**ZAP-010 specific File List must include:**
- `apps/api/src/routes/webhooks.ts` — MODIFY (replace stub with full handler)

---

*— Pax, equilibrando prioridades 🎯*
*Validation complete. All blockers resolved. Handing off to @sm for story creation.*
