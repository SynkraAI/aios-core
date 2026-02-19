# EPIC-02-STORY-08 — Connection Status
**Story ID:** ZAP-008
**Epic:** EPIC-02 — WhatsApp Connection Management
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)
**Implementation Order:** Day 3 of EPIC-02 (parallel with ZAP-007)

---

## User Story

**As a** tenant,
**I want** to query the real-time status of my WhatsApp connection,
**so that** the dashboard always shows accurate connection health and proactively detects disconnections.

---

## Context & Background

The status endpoint is the polling heartbeat used by the frontend (every 5 seconds while any connection is `connecting` or `disconnected`). It must:
1. Fetch live status from Evolution (source of truth)
2. Sync the DB if the live status differs from stored status
3. Gracefully return stale DB data if Evolution is unreachable

**Current scaffold issue (`connections.ts:101–117`):**
- Calls `sessionManager.getStatus(tenantId)` — missing `connectionId` after ZAP-006 refactor
- Returns `{ connectionId, status: waStatus.status }` but Evolution status values (`open`, `close`) differ from Zap status values (`connected`, `disconnected`)
- Does not persist status changes to DB

**Evolution → Zap status mapping:**
| Evolution | Zap |
|-----------|-----|
| `open` | `connected` |
| `close` | `disconnected` |
| `conflict` | `banned` |
| `connecting` | `connecting` |

---

## Acceptance Criteria

### AC-008.1 — Returns `{ status, phone, display_name, last_seen_at }`
```bash
curl -H "Authorization: Bearer $JWT" \
  http://localhost:3001/api/v1/connections/{id}/status
# EXPECTED: HTTP 200
# {
#   "data": {
#     "status": "connected",
#     "phone": "5511999999999@s.whatsapp.net",
#     "display_name": "Marina Nutricionista",
#     "last_seen_at": "2026-02-19T12:00:00.000Z"
#   }
# }
```

### AC-008.2 — Status values are Zap values (not Evolution values)
```bash
# Valid status values: connecting | connected | disconnected | banned
# NOT EXPECTED: 'open', 'close', 'conflict' (Evolution raw values)
```

### AC-008.3 — Syncs DB if live status differs from stored
```bash
# Scenario: DB has status='connecting', Evolution returns 'open'
# EXPECTED after GET /status:
#   DB whatsapp_connections.status = 'connected'
#   Response returns status='connected'
```

### AC-008.4 — Returns 404 for unknown or foreign connections
```bash
curl -H "Authorization: Bearer $JWT" \
  http://localhost:3001/api/v1/connections/non-existent/status
# EXPECTED: HTTP 404
```

### AC-008.5 — Returns stale DB data if Evolution unreachable
```bash
# If Evolution API is down:
# EXPECTED: HTTP 200
# { "data": { "status": "connected", ..., "stale": true } }
# NOT EXPECTED: HTTP 500
```

---

## Technical Notes

### Status Translation

```typescript
function evolutionStateToZapStatus(state: string): string {
  switch (state) {
    case 'open':       return 'connected'
    case 'close':      return 'disconnected'
    case 'conflict':   return 'banned'
    case 'connecting': return 'connecting'
    default:           return 'disconnected'
  }
}
```

### GET /:id/status Implementation

```typescript
app.get('/:id/status', async (c) => {
  const { tenantId } = c.get('auth')
  const connectionId = c.req.param('id')

  // 1. Fetch DB record
  const { data: connection } = await supabaseAdmin
    .from('whatsapp_connections')
    .select('*')
    .eq('id', connectionId)
    .eq('tenant_id', tenantId)
    .single()

  if (!connection) throw new NotFoundError('Connection', connectionId)

  // 2. Fetch live status from Evolution
  let liveStatus: string | null = null
  try {
    const waStatus = await sessionManager.getStatus(tenantId, connectionId)
    liveStatus = evolutionStateToZapStatus(waStatus?.status ?? 'close')
  } catch {
    // Evolution unreachable — return stale DB data
    logger.warn('Evolution unreachable for status check', { connectionId })
    return c.json({
      data: {
        status: connection.status,
        phone: connection.phone,
        display_name: connection.display_name,
        last_seen_at: connection.last_seen_at,
        stale: true,
      },
    })
  }

  // 3. Sync DB if status changed
  if (liveStatus !== connection.status) {
    await supabaseAdmin
      .from('whatsapp_connections')
      .update({ status: liveStatus as any, last_seen_at: new Date().toISOString() })
      .eq('id', connectionId)
  }

  return c.json({
    data: {
      status: liveStatus,
      phone: connection.phone,
      display_name: connection.display_name,
      last_seen_at: connection.last_seen_at,
    },
  })
})
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-006 (sessionManager `getStatus(tenantId, connectionId)`) | Hard | Day 2 |

**Blocks:**
- ZAP-011 (status polling in UI)

---

## Definition of Done

- [x] Returns `{ status, phone, display_name, last_seen_at }` (AC-008.1)
- [x] Status uses Zap values (`connected`, not `open`) (AC-008.2)
- [x] DB updated when live status differs (AC-008.3)
- [x] Returns 404 for unknown/foreign connections (AC-008.4)
- [x] Returns stale + `stale: true` if Evolution down (AC-008.5)
- [x] `npm run typecheck -w apps/api` → 0 errors
- [x] Story File List updated

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/routes/connections.ts` | MODIFIED | `GET /:id/status` + `evolutionStateToZapStatus()` — tradução + DB sync + stale flag |

---

## Dev Agent Record

### Debug Log
- Scaffold retornava `waStatus.status` (valores Evolution: `open`/`close`) diretamente. Adicionado `evolutionStateToZapStatus()` para mapear para valores Zap.
- Scaffold não tinha DB sync. Adicionado: se `liveStatus !== connection.status`, faz update com `last_seen_at`.

### Completion Notes
- `evolutionStateToZapStatus()` implementado: `open→connected`, `close→disconnected`, `conflict→banned`, `connecting→connecting`, default→disconnected.
- Evolution unreachable → retorna dados do DB com `stale: true` (não retorna 500).
- DB sync automático quando status difere do Evolution (AC-008.3).
- Todos os campos `{ status, phone, display_name, last_seen_at }` retornados (AC-008.1).

### Agent Model Used
claude-sonnet-4-6

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-19 | River (SM) | Story created — @po validated (10/10) |
| 2026-02-19 | Dex (Dev) | Implementação completa — evolutionStateToZapStatus + DB sync + stale flag. Typecheck 0 erros. Status: Ready for Review |

---

*Source: docs/prd/epic-02-prd.md §9.3, §10 AC-008, §FR-CONN-03*
*Arch ref: docs/architecture/epic-02-arch-validation.md §D-02 (Decision 4 — Status Sync)*
*PO ref: docs/stories/epic-02/EPIC-02-PO-VALIDATION.md §ZAP-008*
