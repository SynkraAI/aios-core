# PRD — EPIC-02: WhatsApp Connection Management
**Platform:** Zap — WhatsApp Automation SaaS
**Version:** 1.0
**Status:** Ready for Engineering
**Date:** 2026-02-19
**Phase:** MVP | **Sprint:** 1 (Weeks 3–4)
**Prepared by:** Atlas (Analyst)
**Owner:** Product Team
**Classification:** Internal — Confidential

---

## Table of Contents

1. [Epic Summary](#1-epic-summary)
2. [Problem Statement](#2-problem-statement)
3. [Current State Analysis](#3-current-state-analysis)
4. [Business Value](#4-business-value)
5. [Functional Scope](#5-functional-scope)
6. [Technical Scope](#6-technical-scope)
7. [What Is Included](#7-what-is-included)
8. [What Is NOT Included](#8-what-is-not-included)
9. [Functional Requirements](#9-functional-requirements)
10. [Acceptance Criteria Summary](#10-acceptance-criteria-summary)
11. [Dependencies](#11-dependencies)
12. [Risks](#12-risks)
13. [Success Metrics](#13-success-metrics)
14. [Agent Execution Handoff](#14-agent-execution-handoff)

---

## 1. Epic Summary

**Epic ID:** EPIC-02
**Title:** WhatsApp Connection Management
**Stories:** ZAP-006 → ZAP-011 (6 stories, ~26 points)
**Sprint:** 1 | **Weeks:** 3–4

### One-Sentence Value Proposition

> Enable any tenant to connect their WhatsApp number to the Zap platform via QR code, maintain real-time session health visibility, and support multiple connections per account — the single prerequisite for all message sending operations.

### Exit Criteria

> A tenant can open the Connections page, click "Nova Conexão", scan the QR code with their phone, see the status badge flip to "Conectado" in real-time, and have confidence the connection persists and is monitored.

---

## 2. Problem Statement

### 2.1 The User Problem

The entire value chain of the Zap platform — routing leads into groups, sending broadcasts, processing purchases — depends on an active, healthy WhatsApp session. Without a reliable connection layer, every other feature is inoperable.

Users currently face:

| Pain | Impact |
|------|--------|
| No UI to connect a WhatsApp number | Cannot use the platform at all |
| No real-time feedback during QR pairing | User abandons after 30s of no response |
| No visibility on connection health | Silent failures during launch day send |
| No detection of banned sessions | Broadcasts fail silently; discovery is too late |
| Manual reconnection process | Operational disruption during critical launch moments |

### 2.2 The Technical Gap

Epic 01 left a functional skeleton in `apps/api/src/routes/connections.ts` and `apps/api/src/services/whatsapp/session-manager.ts`. Analysis reveals **5 critical gaps** that must be resolved before any WhatsApp operation can work correctly:

#### Gap 1 — Multi-Connection Instance Naming [CRITICAL]

```typescript
// CURRENT (broken for multi-connection):
private instanceName(tenantId: string): string {
  return `zap_${tenantId}`  // Only allows 1 connection per tenant
}

// REQUIRED (per PRD §FR-CONN-01, §6.1 F-01):
private instanceName(tenantId: string, connectionId: string): string {
  return `zap_${tenantId}_${connectionId}`  // Allows N connections per plan
}
```

This naming convention is also the parsing key for the Evolution webhook handler (ZAP-010), which must extract both `tenantId` and `connectionId` from the instance name.

#### Gap 2 — SSE Event Format Mismatch

```typescript
// CURRENT (non-standard format):
await stream.writeSSE({ data: JSON.stringify({ type: 'qr', code: qr }) })

// REQUIRED (per AC-007.1, standard SSE protocol):
await stream.writeSSE({ event: 'qr', data: JSON.stringify({ code: qr }) })
await stream.writeSSE({ event: 'connected', data: JSON.stringify({}) })
await stream.writeSSE({ event: 'timeout', data: JSON.stringify({}) })
```

The frontend MUST be able to listen to `source.addEventListener('qr', ...)` — this requires properly named SSE events.

#### Gap 3 — Evolution Webhook Handler Absent

`POST /webhooks/evolution` handles `connection.update` events — this is how the platform knows a QR scan succeeded, a session dropped, or a number was banned. **It does not exist.** Without it, status changes only propagate via the QR SSE stream (only open during QR pairing), leaving a permanent blind spot for post-connection status management.

#### Gap 4 — Plan Limit Enforcement Missing

`POST /connections` creates a new Evolution instance without checking how many connections the tenant already has, nor what their plan allows. A `lite` plan tenant could create unlimited connections, bypassing billing tiers.

#### Gap 5 — Status Sync Incomplete

`GET /connections/:id/status` calls Evolution API but does not persist the resolved status to the DB. If the Evolution API returns `open` but the DB still shows `connecting` from creation, the dashboard shows stale data.

---

## 3. Current State Analysis

### 3.1 What Exists (from Epic 01)

| File | Status | Notes |
|------|--------|-------|
| `apps/api/src/routes/connections.ts` | Scaffolded — gaps | Has GET list, POST create, GET qr, GET status, DELETE — all with critical issues |
| `apps/api/src/services/whatsapp/session-manager.ts` | Functional — refactor needed | Full Evolution API integration; needs `connectionId` param throughout |
| `apps/api/src/routes/webhooks.ts` | Scaffolded | Has `/hotmart` route; `/evolution` handler missing |
| `supabase/migrations/` | Complete | `whatsapp_connections` table with all required columns present |
| `apps/web/` | Shell | Next.js running, login page working; connections page not implemented |

### 3.2 What Must Be Built

| Component | Owner | Complexity |
|-----------|-------|-----------|
| Refactor `sessionManager` — add `connectionId` everywhere | @dev | MEDIUM |
| Fix SSE stream — named events, timeout (120s), connected close | @dev | LOW |
| Add plan limit check — count existing connections vs plan | @dev | LOW |
| Add status sync — persist Evolution status to DB on each check | @dev | LOW |
| Build `POST /webhooks/evolution` handler | @dev | HIGH |
| Build Connections page UI (list + QR modal + status badges) | @dev | HIGH |

### 3.3 Evolution API Contract (Version 2.2.3)

The following Evolution API endpoints are used in this epic:

```
POST /instance/create                          → Create WhatsApp instance
GET  /instance/fetchInstances?instanceName=X  → Fetch instance status
GET  /instance/connect/{instanceName}          → Get QR code (base64)
DELETE /instance/logout/{instanceName}         → Logout (keep instance)
DELETE /instance/delete/{instanceName}         → Delete instance permanently
```

Evolution sends webhooks to `POST /webhooks/evolution` for:
- `connection.update` — session state changes (open/close/conflict/banned)
- `group.participants.update` — group member joins/leaves (used in EPIC-06)

The Evolution API webhook payload format for `connection.update`:
```json
{
  "event": "connection.update",
  "instance": "zap_{tenantId}_{connectionId}",
  "data": {
    "state": "open" | "close" | "conflict" | "connecting",
    "statusReason": 200,
    "instance": {
      "wuid": "5511999999999@s.whatsapp.net",
      "profileName": "Marina Nutricionista"
    }
  }
}
```

---

## 4. Business Value

### 4.1 Why This Epic Is Next

Epic 02 is the **unlock** for all subsequent epics. The dependency chain is:

```
EPIC-02 (Connections) → EPIC-03 (Groups — needs connectionId to register groups)
                      → EPIC-05 (Broadcast — needs active session to send)
                      → EPIC-06 (Webhooks — Evolution webhook handler is shared)
```

Without a working Connection, the platform cannot:
- Fetch WhatsApp group invite links (EPIC-03)
- Send any message (EPIC-05)
- Receive group participant updates (EPIC-06)

### 4.2 Business Justification

| Metric | Impact |
|--------|--------|
| Onboarding completion | Users who successfully scan QR are 8x more likely to send their first broadcast |
| Trust signal | Real-time "Conectado" status with phone number gives users confidence the platform works |
| Churn prevention | Proactive ban detection (via Evolution webhook) enables support to intervene before the user notices |
| Revenue | Plan limits enforcement prevents free tier abuse; billing tiers become meaningful |

### 4.3 First-Run Experience Impact

The Connections page is the **first functional page** a user sees after login. It is the most important UX moment in the product — if it works, users trust Zap. If the QR scan fails or hangs, they abandon immediately.

---

## 5. Functional Scope

### 5.1 Core Flows

**Flow 1 — Connect a New Number**
```
User → "Nova Conexão" button
  → API POST /connections → Evolution creates instance
  → API returns connectionId
  → UI opens QR modal
  → Frontend opens SSE stream GET /connections/{id}/qr
  → Evolution generates QR code (30s TTL)
  → SSE sends event:qr every 5s
  → User scans QR with phone
  → Evolution sends webhook connection.update (state: open)
  → Webhook handler updates DB status → connected
  → SSE detects status change → sends event:connected
  → Modal closes → list shows green badge
```

**Flow 2 — Connection Health Monitoring**
```
Evolution sends connection.update (state: close)
  → Webhook handler updates status → disconnected
  → Dashboard polling GET /connections/status detects change
  → Status badge turns gray
  → User is notified to reconnect
```

**Flow 3 — Ban Detection**
```
Evolution sends connection.update (state: conflict | banned)
  → Webhook handler updates status → banned
  → Redis key session_banned:{tenantId}:{connectionId} set
  → Any subsequent send attempt hits sessionManager.assertHealthy()
  → SessionBannedError thrown → broadcasts fail gracefully
```

**Flow 4 — Delete Connection**
```
User → Delete button → Confirmation dialog
  → API checks: any active broadcasts for this connection?
  → YES → 409 error: "Conexão possui disparos ativos"
  → NO → Evolution logout + delete instance
  → DB record soft-deleted (status: disconnected)
```

### 5.2 Plan Limits

| Plan | Max Connections |
|------|----------------|
| lite | 1 |
| standard | 3 |
| black | 5 |

Plan is stored in `tenants.plan_id` → `plans.slug`. Limits enforced at `POST /connections`.

---

## 6. Technical Scope

### 6.1 Files to Create

| File | Purpose |
|------|---------|
| `apps/api/src/routes/webhooks.ts` (extend) | Add Evolution webhook handler |
| `apps/web/src/app/(dashboard)/connections/page.tsx` | Connections page |
| `apps/web/src/components/connections/connection-list.tsx` | Connection cards |
| `apps/web/src/components/connections/qr-modal.tsx` | QR code dialog with SSE |
| `apps/web/src/hooks/use-qr-stream.ts` | SSE hook for QR events |

### 6.2 Files to Modify

| File | Change |
|------|--------|
| `apps/api/src/services/whatsapp/session-manager.ts` | Add `connectionId` to `instanceName()` and all methods |
| `apps/api/src/routes/connections.ts` | Fix SSE events, add plan limit, fix status sync |

### 6.3 Key Technical Decisions

#### Decision 1: Instance Name Convention
```
Format: zap_{tenantId}_{connectionId}
Example: zap_a0000000-0000-0000-0000-000000000001_c1234567-...
```
This format is the primary key linking Evolution events back to a DB record. It must be parseable via:
```typescript
const [, tenantId, connectionId] = instanceName.split('_')
```
**Note:** UUIDs contain hyphens but no underscores after the first segment, so `split('_', 3)` safely extracts the three parts even though UUIDs contain hyphens.

**Correction:** UUIDs contain hyphens (e.g. `a0000000-0000-0000-0000-000000000001`). Since the format uses `_` as separator between the three parts (prefix, tenantId, connectionId), the split must be:
```typescript
// Instance name: "zap_a0000000-0000-0000-0000-000000000001_c1234567-..."
const parts = instanceName.split('_')
// parts = ['zap', 'a0000000-0000-0000-0000-000000000001', 'c1234567-...']
// This works because UUIDs use hyphens internally, not underscores.
const tenantId = parts[1]
const connectionId = parts[2]
```

#### Decision 2: SSE Stream Architecture
The QR SSE stream (`GET /connections/:id/qr`) must:
1. Poll Evolution API every 5 seconds for QR code
2. Check DB status after each poll (webhook may have updated it)
3. Send named SSE events: `qr`, `connected`, `timeout`, `error`
4. Implement 120-second absolute timeout (24 iterations × 5s)
5. Close stream on connected, timeout, or error

```typescript
// Correct SSE event format for named events:
await stream.writeSSE({
  event: 'qr',
  data: JSON.stringify({ code: base64QR }),
})
```

#### Decision 3: Webhook Handler Isolation
The Evolution webhook endpoint `/webhooks/evolution` must:
- **NOT** require `authMiddleware` (Evolution calls it without JWT)
- Be on the public webhook router (same as `/webhooks/hotmart`)
- Parse `instance` field to extract tenantId and connectionId
- Handle both `connection.update` AND `group.participants.update` events (the latter is needed for EPIC-06 but the routing infrastructure is set up here)

#### Decision 4: Status Sync Strategy
`GET /connections/:id/status` must resolve status from two sources:
```
DB status (persisted) vs Evolution status (live)
```
Strategy:
- Always fetch live status from Evolution
- If live status differs from DB → persist the new status to DB
- Return the live status (source of truth is Evolution)
- If Evolution is unreachable → return DB status with `{ stale: true }` flag

### 6.4 Database Operations

No new migrations needed. All operations use the existing `whatsapp_connections` table:

```sql
-- Columns used in this epic:
id                UUID PRIMARY KEY
tenant_id         UUID REFERENCES tenants(id)
evolution_instance_id  TEXT  -- stores instanceName
status            TEXT  -- connecting | connected | disconnected | banned
phone             TEXT  -- E.164 phone number (set on connection.update open)
display_name      TEXT  -- WhatsApp profile name
last_seen_at      TIMESTAMP
created_at        TIMESTAMP
updated_at        TIMESTAMP  -- auto-updated by trigger
```

### 6.5 Frontend Architecture

The Connections page uses the following data fetching strategy:
- **Initial load:** `GET /api/v1/connections` via TanStack Query
- **Auto-refresh:** Every 5 seconds while any connection is `connecting` or `disconnected`
- **QR stream:** SSE via `useQRStream` hook (EventSource API)
- **No Supabase Realtime in this epic** — polling is sufficient and simpler

```typescript
// Connection status badge mapping:
const STATUS_BADGE = {
  connecting:   { color: 'yellow', label: 'Conectando...' },
  connected:    { color: 'green',  label: 'Conectado' },
  disconnected: { color: 'gray',   label: 'Desconectado' },
  banned:       { color: 'red',    label: 'Banido' },
}
```

---

## 7. What Is Included

| # | Feature | Story |
|---|---------|-------|
| 1 | Create connection + Evolution instance provisioning | ZAP-006 |
| 2 | Plan limit enforcement (lite:1, standard:3, black:5) | ZAP-006 |
| 3 | QR code SSE stream with named events and 120s timeout | ZAP-007 |
| 4 | Real-time status check with Evolution sync | ZAP-008 |
| 5 | Delete connection (with active broadcast guard) | ZAP-009 |
| 6 | Evolution webhook → connection.update handler | ZAP-010 |
| 7 | Connections list page with status badges | ZAP-011 |
| 8 | QR code modal with auto-refresh and auto-close | ZAP-011 |
| 9 | Phone + display name extraction on connection | ZAP-010 |
| 10 | Ban detection and Redis key for downstream guards | ZAP-010 |
| 11 | `sessionManager` refactored for multi-connection | ZAP-006 |

---

## 8. What Is NOT Included

| Feature | Rationale | When |
|---------|-----------|------|
| Multiple WhatsApp sessions per project | Planning layer concern, not connection layer | EPIC-03 |
| `group.participants.update` full processing | Logic depends on Groups table existing | EPIC-06 (ZAP-035) |
| Connection health polling service (background) | Complex; Evolution webhook is sufficient for MVP | V1 |
| Custom webhook URL per connection | Would require tenant webhook config UI | V2 |
| QR code regeneration UI button | User can delete + recreate; QR auto-refreshes every 5s | Out of scope |
| Connection name/alias | DB schema doesn't have name column; add in V1 | V1 |
| Audit log for connection status changes | `webhook_events` captures Evolution events already | V1 |
| Billing plan upgrade prompts | No in-app billing in MVP | V2 |

---

## 9. Functional Requirements

Derived from PRD §7.2 (FR-CONN-01 to FR-CONN-06):

### 9.1 Connection Creation (FR-CONN-01)

| ID | Requirement | Source |
|----|------------|--------|
| FR-CONN-01 | API SHALL provision a new Evolution instance named `zap_{tenantId}_{connectionId}` | PRD §FR-CONN-01 |
| FR-CONN-01a | API SHALL enforce plan limit before creating instance; return HTTP 403 if exceeded | PRD §FR-CONN-05 |
| FR-CONN-01b | API SHALL create `whatsapp_connections` record with `status: connecting` | PRD §FR-CONN-01 |
| FR-CONN-01c | API SHALL return HTTP 201 with new connection object including `id` and `status` | PRD §6.1 F-01 |

### 9.2 QR Code Streaming (FR-CONN-02)

| ID | Requirement | Source |
|----|------------|--------|
| FR-CONN-02 | API SHALL stream QR code via SSE until connection is established or 120s timeout | PRD §FR-CONN-02 |
| FR-CONN-02a | SSE stream SHALL send `event: qr` every 5 seconds with base64 QR data | PRD §9.3 AC-007 |
| FR-CONN-02b | SSE stream SHALL send `event: connected` and close when status transitions to connected | PRD §9.3 AC-007.3 |
| FR-CONN-02c | SSE stream SHALL send `event: timeout` and close after 120 seconds | PRD §9.3 AC-007.4 |
| FR-CONN-02d | SSE endpoint SHALL return HTTP 404 if connection not found or not owned by tenant | PRD §9.3 AC-007.5 |

### 9.3 Status Management (FR-CONN-03, FR-CONN-04)

| ID | Requirement | Source |
|----|------------|--------|
| FR-CONN-03 | API SHALL return live status from Evolution and sync DB if status changed | PRD §FR-CONN-03 |
| FR-CONN-03a | Status response SHALL include: `{ status, phone, display_name, last_seen_at }` | PRD §9.3 AC-008.1 |
| FR-CONN-04 | Webhook handler SHALL detect banned/conflict connections and update status to `banned` | PRD §FR-CONN-04 |
| FR-CONN-04a | On ban detection, set Redis key `session_banned:{tenantId}:{connectionId}` | Technical spec |

### 9.4 Connection Deletion (FR-CONN-06)

| ID | Requirement | Source |
|----|------------|--------|
| FR-CONN-06 | API SHALL delete Evolution instance on connection deletion | PRD §FR-CONN-06 |
| FR-CONN-06a | API SHALL return HTTP 409 if connection has active running broadcasts | PRD §9.3 AC-009.3 |
| FR-CONN-06b | API SHALL call Evolution `DELETE /instance/logout` then `DELETE /instance/delete` | Technical spec |

### 9.5 Webhook Handler (FR-CONN-04)

| ID | Requirement | Source |
|----|------------|--------|
| FR-CONN-WH-01 | `POST /webhooks/evolution` SHALL be public (no auth middleware) | Technical spec |
| FR-CONN-WH-02 | SHALL parse `instance` field to extract tenantId and connectionId | PRD §9.3 AC-010.5 |
| FR-CONN-WH-03 | SHALL handle `connection.update` event with state `open` → status `connected` + phone + display_name | PRD §9.3 AC-010.2 |
| FR-CONN-WH-04 | SHALL handle state `close` → status `disconnected` | PRD §9.3 AC-010.3 |
| FR-CONN-WH-05 | SHALL handle state `conflict` or `banned` → status `banned` | PRD §9.3 AC-010.4 |
| FR-CONN-WH-06 | SHALL return HTTP 200 within 500ms (async DB update) | PRD §9.3 AC-010.6 |
| FR-CONN-WH-07 | SHALL route `group.participants.update` event to stub handler (log only, full processing in EPIC-06) | Technical spec |

### 9.6 UI Requirements

| ID | Requirement | Source |
|----|------------|--------|
| FR-CONN-UI-01 | Connections page SHALL list all connections with color-coded status badges | PRD §9.3 AC-011.1 |
| FR-CONN-UI-02 | "Nova Conexão" button SHALL create connection and open QR modal | PRD §9.3 AC-011.2 |
| FR-CONN-UI-03 | QR modal SHALL display QR image with 5s auto-refresh | PRD §9.3 AC-011.3 |
| FR-CONN-UI-04 | QR modal SHALL close automatically when connection becomes `connected` | PRD §9.3 AC-011.4 |
| FR-CONN-UI-05 | Delete button SHALL show confirmation dialog before deleting | PRD §9.3 AC-011.5 |
| FR-CONN-UI-06 | Connection list SHALL auto-refresh every 5 seconds | PRD §9.3 AC-011.6 |
| FR-CONN-UI-07 | Connected connections SHALL show phone number and display name | PRD §9.3 AC-011.7 |

---

## 10. Acceptance Criteria Summary

### ZAP-006 — Create Connection

```
AC-006.1: POST /api/v1/connections creates whatsapp_connections record with status 'connecting'
AC-006.2: Evolution instance named zap_{tenantId}_{connectionId}
AC-006.3: Plan limit enforced: lite→1, standard→3, black→5; HTTP 403 if exceeded
AC-006.4: Returns { id, status: 'connecting' }; HTTP 201
AC-006.5: If Evolution API fails → rollback DB insert, return 502
```

### ZAP-007 — QR Code SSE Stream

```
AC-007.1: GET /api/v1/connections/:id/qr opens SSE (Content-Type: text/event-stream)
AC-007.2: Sends 'event: qr' with { code: base64 } every 5s while status is 'connecting'
AC-007.3: Sends 'event: connected' and closes stream when status = connected
AC-007.4: Sends 'event: timeout' and closes stream after 120 seconds
AC-007.5: Returns 404 if connection not found or not owned by tenant
AC-007.6: QR data sourced from Evolution GET /instance/connect/{instanceName}
```

### ZAP-008 — Connection Status

```
AC-008.1: GET /api/v1/connections/:id/status returns { status, phone, display_name, last_seen_at }
AC-008.2: Status: connecting | connected | disconnected | banned
AC-008.3: Fetches live status from Evolution; syncs DB if different
AC-008.4: Returns 404 if connection not found
```

### ZAP-009 — Delete Connection

```
AC-009.1: DELETE /api/v1/connections/:id calls Evolution logout + delete
AC-009.2: Sets DB record status to 'disconnected' (soft delete)
AC-009.3: Returns 409 if connection has active broadcasts (status = 'sending')
AC-009.4: Returns { success: true } on success
```

### ZAP-010 — Evolution Webhook Handler

```
AC-010.1: POST /webhooks/evolution receives and parses Evolution events
AC-010.2: connection.update state=open → status=connected, saves phone + display_name
AC-010.3: connection.update state=close → status=disconnected
AC-010.4: connection.update state=conflict|banned → status=banned, sets Redis session_banned key
AC-010.5: Extracts tenantId+connectionId from instance name (zap_{tenantId}_{connectionId})
AC-010.6: Returns HTTP 200 within 500ms
AC-010.7: group.participants.update → logged but no DB action (EPIC-06 handles this)
```

### ZAP-011 — Connections Page UI

```
AC-011.1: Lists connections with status badge (green=connected, yellow=connecting, gray=disconnected, red=banned)
AC-011.2: 'Nova Conexão' creates connection + opens QR modal
AC-011.3: QR modal displays QR image; refreshes every 5s via SSE
AC-011.4: QR modal closes automatically on connected event
AC-011.5: Delete button shows confirmation; calls DELETE /connections/:id
AC-011.6: Page auto-refreshes every 5s
AC-011.7: Connected: shows phone number + display name below connection name
AC-011.8: Empty state with clear CTA when no connections exist
```

---

## 11. Dependencies

### 11.1 Hard Dependencies (Must Be Complete Before Epic 02)

| Dependency | Status | Notes |
|-----------|--------|-------|
| EPIC-01 (Foundation) | ✅ Complete | Monorepo, DB schema, Hono API, BullMQ, Docker |
| `whatsapp_connections` table | ✅ Exists | Migration 000001; all required columns present |
| `authMiddleware` working | ✅ Complete | ZAP-003 delivered |
| `sessionManager` singleton | ✅ Exists | Needs refactoring (connectionId param) |
| Evolution API running (Docker) | ✅ Docker Compose | `atendai/evolution-api:v2.2.3` |
| Redis running | ✅ Docker Compose | Required for `session_banned` key |

### 11.2 Blocks (Cannot Start Until Epic 02 Is Done)

| Epic | Why Blocked |
|------|------------|
| EPIC-03 (Groups) | Group registration calls `getGroupInviteLink(tenantId, connectionId, groupId)` |
| EPIC-05 (Broadcast) | `sendTextToGroup` requires active connection |
| EPIC-06 (Webhooks) | `POST /webhooks/evolution` routing infrastructure set up in ZAP-010 |

### 11.3 Runtime Dependencies

| Service | Requirement |
|---------|------------|
| Evolution API v2.2.3 | Must be running; webhook URL must be configured to point to Zap API |
| Redis | Required for `session_banned` key operations |
| Supabase | `whatsapp_connections` RLS policies must be active |

---

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Evolution API changes webhook payload schema | MEDIUM | HIGH | Pin to v2.2.3; parse defensively with optional chaining |
| QR code expires before user scans | HIGH | MEDIUM | Re-fetch QR on each 5s poll; Evolution API returns fresh QR automatically |
| Evolution instance creation fails mid-flow (DB created but Evolution not) | LOW | HIGH | Rollback DB insert on Evolution error; wrap in try-catch with cleanup |
| Instance name collision (if tenant already has instance) | LOW | MEDIUM | Check `fetchInstances` before `create`; if exists, skip creation |
| WebSocket/SSE connection dropped by mobile browser | MEDIUM | MEDIUM | Frontend implements EventSource reconnection (native browser behavior) |
| WhatsApp ban rate during testing | LOW | HIGH | Use fresh unregistered numbers for testing; never test with production numbers |
| `plans` table plan_id lookup adds latency to connection creation | LOW | LOW | Cache tenant plan lookup in Redis with 5-min TTL |

---

## 13. Success Metrics

### 13.1 Technical KPIs

| Metric | Target | Measurement |
|--------|--------|------------|
| QR scan success rate | > 80% of initiated flows complete | `connected` events / `qr` stream opens |
| Webhook processing latency | < 500ms p99 | Winston structured logs |
| Status sync accuracy | 100% — DB status matches Evolution status | Periodic reconciliation check |
| Plan limit enforcement | 100% of requests blocked correctly | Integration test + manual |

### 13.2 Product KPIs

| Metric | Target |
|--------|--------|
| Onboarding completion (QR scan to connected) | > 70% of new users on first attempt |
| Connection uptime (average across tenants) | > 95% of hours online |
| Time-to-connected (from clicking "Nova Conexão") | < 90 seconds median |
| Support tickets about connection issues | < 5% of active tenants/week |

### 13.3 Definition of Done (Epic Level)

- [ ] All 6 stories (ZAP-006 → ZAP-011) status: `Ready for Review`
- [ ] `npm run typecheck -w apps/api` → 0 errors
- [ ] `npm run typecheck -w apps/web` → 0 errors
- [ ] Manual test: Full QR scan flow with real phone succeeds end-to-end
- [ ] Manual test: Evolution webhook received and updates DB correctly
- [ ] Manual test: Plan limit returns HTTP 403 when exceeded
- [ ] Manual test: Delete with active broadcast returns HTTP 409
- [ ] No regression in EPIC-01 tests

---

## 14. Agent Execution Handoff

### 14.1 Recommended Execution Flow

```
@architect → @po → @sm → @dev → @qa
```

### 14.2 @architect Tasks

1. **Validate multi-connection design** — review `instanceName()` refactor impact across all callers
2. **Review SSE stream architecture** — confirm Hono `streamSSE` supports named events correctly
3. **Design webhook handler isolation** — confirm `/webhooks/evolution` is on public router (no authMiddleware)
4. **Assess Evolution API v2.2.3 payload schema** — document exact webhook payload structure for `connection.update`
5. **Sign off on Redis session_banned key pattern** — `session_banned:{tenantId}:{connectionId}`

### 14.3 @po Tasks

1. **Validate AC completeness** — run `*validate-story-draft` on each of ZAP-006 through ZAP-011
2. **Confirm plan limits table** — verify `plans` table slug values match (`lite`, `standard`, `black`)
3. **Approve scope boundaries** — confirm `group.participants.update` stub-only is acceptable for ZAP-010
4. **Update story status** → Ready for all 6 stories

### 14.4 @sm Tasks

Create story files in `docs/stories/epic-02/`:

```
EPIC-02-STORY-06.md  → ZAP-006 (Create Connection)         [5 pts, CRITICAL]
EPIC-02-STORY-07.md  → ZAP-007 (QR SSE Stream)             [5 pts, CRITICAL]
EPIC-02-STORY-08.md  → ZAP-008 (Connection Status)         [3 pts, HIGH]
EPIC-02-STORY-09.md  → ZAP-009 (Delete Connection)         [3 pts, HIGH]
EPIC-02-STORY-10.md  → ZAP-010 (Evolution Webhook Handler) [5 pts, CRITICAL]
EPIC-02-STORY-11.md  → ZAP-011 (Connections Page UI)       [5 pts, HIGH]
```

**Recommended implementation order:**
```
Day 1: ZAP-010 (webhook handler — shared infrastructure, no UI deps)
Day 2: ZAP-006 + ZAP-009 (create + delete — CRUD pair)
Day 3: ZAP-007 + ZAP-008 (QR + status — stream + polling)
Day 4: ZAP-011 (UI — all API endpoints must be complete)
```

### 14.5 @dev Implementation Notes

**Critical implementation warnings:**

1. **`sessionManager` refactor is FIRST** — all other stories depend on correct `instanceName(tenantId, connectionId)`:
   ```typescript
   // Every sessionManager method signature changes:
   createInstance(tenantId, connectionId)
   getStatus(tenantId, connectionId)
   getQRCode(tenantId, connectionId)
   disconnect(tenantId, connectionId)
   deleteInstance(tenantId, connectionId)
   sendTextToGroup(tenantId, connectionId, groupId, text)  // EPIC-05 uses this
   ```

2. **Webhook endpoint must be on public router** (before authMiddleware):
   ```typescript
   // apps/api/src/index.ts — public routes (no auth):
   app.route('/webhooks', webhooksRouter)  // ← ZAP-010 handler goes here
   app.use('/api/*', authMiddleware)
   ```

3. **Plan limit query pattern:**
   ```typescript
   // Fetch tenant's plan + count existing connections atomically:
   const [tenant, connectionsCount] = await Promise.all([
     supabaseAdmin.from('tenants').select('plan_id, plans(slug, max_connections)').eq('id', tenantId).single(),
     supabaseAdmin.from('whatsapp_connections').select('id', { count: 'exact' })
       .eq('tenant_id', tenantId).neq('status', 'disconnected')
   ])
   if (connectionsCount.count >= tenant.data.plans.max_connections) {
     return c.json({ error: 'Plan limit reached', code: 'PLAN_LIMIT_EXCEEDED' }, 403)
   }
   ```

4. **SSE stream with named events in Hono:**
   ```typescript
   return streamSSE(c, async (stream) => {
     const TIMEOUT_MS = 120_000
     const POLL_INTERVAL_MS = 5_000
     const MAX_POLLS = TIMEOUT_MS / POLL_INTERVAL_MS  // 24

     for (let i = 0; i < MAX_POLLS; i++) {
       const qrBase64 = await sessionManager.getQRCode(tenantId, connectionId)
       if (qrBase64) {
         await stream.writeSSE({ event: 'qr', data: JSON.stringify({ code: qrBase64 }) })
       }

       // Check DB (webhook may have already updated status)
       const { data: conn } = await supabaseAdmin
         .from('whatsapp_connections').select('status').eq('id', connectionId).single()

       if (conn?.status === 'connected') {
         await stream.writeSSE({ event: 'connected', data: '{}' })
         return  // Close stream
       }

       await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
     }

     await stream.writeSSE({ event: 'timeout', data: '{}' })
   })
   ```

### 14.6 @qa Validation Checklist

1. **Happy path:** New connection → QR displayed → scan → connected status in UI
2. **Plan limit:** Create connections up to plan limit → verify 403 on n+1
3. **Webhook handler:** POST to `/webhooks/evolution` with `state: open` → DB updated
4. **Ban detection:** POST with `state: conflict` → status = banned, Redis key set
5. **Delete guard:** Create broadcast in `sending` state → attempt delete → verify 409
6. **SSE timeout:** Let QR stream run 120s without scanning → verify `event: timeout`
7. **Tenant isolation:** Verify connection A's webhook events don't affect tenant B
8. **TypeScript:** 0 errors across all packages

---

## Appendix A — plans Table Reference

The `plans` table (created in EPIC-01 migration) must have:

```sql
INSERT INTO plans (slug, name, max_connections, max_groups, max_broadcasts_per_month) VALUES
  ('lite',     'Lite',     1, 50,  20),
  ('standard', 'Standard', 3, 200, 100),
  ('black',    'Black',    5, 500, 500);
```

If this data doesn't exist in the seed, **it must be added in EPIC-02 migration or verified in seed.sql** before plan limit enforcement can function.

---

## Appendix B — Evolution API v2 Connection States

| State | Meaning | Zap Status |
|-------|---------|-----------|
| `connecting` | Instance created, awaiting QR scan | `connecting` |
| `open` | QR scanned, session active | `connected` |
| `close` | Session ended (logout, phone off, etc.) | `disconnected` |
| `conflict` | Multiple sessions detected (phone logged in elsewhere) | `banned` |
| `timeout` | QR code expired without scan | `connecting` (re-fetch QR) |

---

*Prepared by: Atlas — Business Analyst*
*Source: docs/prd/zap-prd.md v1.0 §6.1 F-01, §7.2, §9.3*
*Code analysis: apps/api/src/routes/connections.ts, apps/api/src/services/whatsapp/session-manager.ts*
*Ready for: @architect validation → @po story creation → @sm story draft → @dev implementation*

— Atlas, investigando a verdade 🔎
