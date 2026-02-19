# EPIC-02-STORY-09 — Delete Connection
**Story ID:** ZAP-009
**Epic:** EPIC-02 — WhatsApp Connection Management
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)
**Implementation Order:** Day 4 of EPIC-02 (after ZAP-006)

---

## User Story

**As a** tenant,
**I want** to delete a WhatsApp connection via the API,
**so that** I can cleanly remove a session when needed, with a safety guard that prevents deletion while a broadcast is actively sending.

---

## Context & Background

The delete flow must:
1. Guard against deletion during active broadcasts (prevents mid-send disruption)
2. Call Evolution in sequence: `logout` first, then `delete`
3. Soft-delete the DB record (set status to `disconnected`)

**Current scaffold issues (`connections.ts:119–134`):**
- No active broadcast check — would silently destroy a live broadcast
- Calls `disconnect(tenantId)` and `deleteInstance(tenantId)` — both missing `connectionId` after ZAP-006 refactor
- Does not verify ownership before deleting

**Soft delete rationale:** The record stays in DB with `status: disconnected` for audit and analytics. If tenants want to reconnect, they create a new connection (new `connectionId`, new Evolution instance).

---

## Acceptance Criteria

### AC-009.1 — Calls Evolution logout + delete in sequence
```bash
curl -X DELETE -H "Authorization: Bearer $JWT" \
  http://localhost:3001/api/v1/connections/{id}
# EXPECTED: HTTP 200 { "data": { "success": true } }
# Evolution: DELETE /instance/logout/{instanceName} called first
# Evolution: DELETE /instance/delete/{instanceName} called second
```

### AC-009.2 — Sets DB record status to `disconnected` (soft delete)
```bash
# After DELETE:
# DB: whatsapp_connections.status = 'disconnected'
# DB: record still exists (not physically deleted)
```

### AC-009.3 — Returns 409 if connection has active broadcasts
```bash
# Setup: broadcast with status='sending' linked to this connection
curl -X DELETE -H "Authorization: Bearer $JWT" \
  http://localhost:3001/api/v1/connections/{id}
# EXPECTED: HTTP 409
# { "error": "Connection has active broadcasts", "code": "ACTIVE_BROADCASTS" }
```

### AC-009.4 — Returns 404 for unknown or foreign connections
```bash
curl -X DELETE -H "Authorization: Bearer $JWT" \
  http://localhost:3001/api/v1/connections/non-existent
# EXPECTED: HTTP 404
```

---

## Technical Notes

### DELETE /:id Implementation

```typescript
app.delete('/:id', async (c) => {
  const { tenantId } = c.get('auth')
  const connectionId = c.req.param('id')

  // 1. Verify ownership
  const { data: connection } = await supabaseAdmin
    .from('whatsapp_connections')
    .select('evolution_instance_id, status')
    .eq('id', connectionId)
    .eq('tenant_id', tenantId)
    .single()

  if (!connection) throw new NotFoundError('Connection', connectionId)

  // 2. Guard: active broadcasts
  const { count: activeBroadcasts } = await supabaseAdmin
    .from('broadcasts')
    .select('id', { count: 'exact', head: true })
    .eq('connection_id', connectionId)
    .eq('status', 'sending')

  if ((activeBroadcasts ?? 0) > 0) {
    return c.json(
      { error: 'Connection has active broadcasts', code: 'ACTIVE_BROADCASTS' },
      409,
    )
  }

  // 3. Evolution cleanup (logout then delete — order matters)
  try {
    await sessionManager.disconnect(tenantId, connectionId)
  } catch (err) {
    logger.warn('Evolution logout failed (proceeding with delete)', { connectionId, err })
  }
  try {
    await sessionManager.deleteInstance(tenantId, connectionId)
  } catch (err) {
    logger.warn('Evolution delete failed (proceeding with soft-delete)', { connectionId, err })
  }

  // 4. Soft-delete in DB
  await supabaseAdmin
    .from('whatsapp_connections')
    .update({ status: 'disconnected' })
    .eq('id', connectionId)
    .eq('tenant_id', tenantId)

  logger.info('WhatsApp connection deleted', { tenantId, connectionId })

  return c.json({ data: { success: true } })
})
```

**Note on Evolution errors:** If Evolution returns an error on logout/delete (e.g., instance already gone), log a warning and proceed with the DB soft-delete. The Evolution instance may already be cleaned up — the DB record must always be updated.

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-006 (sessionManager `disconnect` + `deleteInstance` with `connectionId`) | Hard | Day 2 |

**Blocks:**
- ZAP-011 (delete button in UI)

---

## Definition of Done

- [x] Evolution logout + delete called in sequence (AC-009.1)
- [x] DB record set to `disconnected` after delete (AC-009.2)
- [x] Returns 409 when active broadcasts exist (AC-009.3)
- [x] Returns 404 for unknown/foreign connections (AC-009.4)
- [x] Evolution failures logged but don't block soft-delete
- [x] `npm run typecheck -w apps/api` → 0 errors
- [x] Story File List updated

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/routes/connections.ts` | MODIFIED | `DELETE /:id` com ownership check + active broadcast guard (409) + Evolution logout→delete + soft-delete |

---

## Dev Agent Record

### Debug Log
- Scaffold chamava `disconnect(tenantId)` e `deleteInstance(tenantId)` sem `connectionId` — já corrigido como parte do ZAP-006 refactor do SessionManager.
- Scaffold não verificava ownership nem broadcasts ativos — ambos adicionados.

### Completion Notes
- `DELETE /:id` reescrito: ownership check → broadcast guard (409 se `broadcasts.status='sending'`) → Evolution logout+delete (com try/catch independentes) → soft-delete DB.
- Evolution failures são logados mas não bloqueiam o soft-delete (resiliente a instâncias já deletadas).
- 404 para conexões não encontradas ou de outro tenant.

### Agent Model Used
claude-sonnet-4-6

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-19 | River (SM) | Story created — @po validated (10/10) |
| 2026-02-19 | Dex (Dev) | Implementação completa — broadcast guard, Evolution cleanup, soft-delete. Typecheck 0 erros. Status: Ready for Review |

---

*Source: docs/prd/epic-02-prd.md §9.4, §10 AC-009, §FR-CONN-06*
*PO ref: docs/stories/epic-02/EPIC-02-PO-VALIDATION.md §ZAP-009*
