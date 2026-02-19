# EPIC-02-STORY-07 — QR Code SSE Stream
**Story ID:** ZAP-007
**Epic:** EPIC-02 — WhatsApp Connection Management
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 5
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)
**Implementation Order:** Day 3 of EPIC-02 (after ZAP-006)

---

## User Story

**As a** tenant,
**I want** to receive the WhatsApp QR code as a real-time SSE stream,
**so that** I can see a live-updating QR image and have the modal automatically close the moment my phone completes the scan.

---

## Context & Background

The QR code SSE stream is the most user-visible part of the connection flow. It:
1. Provides QR codes refreshed every 5 seconds (Evolution generates new ones automatically)
2. Detects connection success by polling the DB (the webhook handler updates the DB when scan succeeds)
3. Closes the stream automatically on success or timeout

**Current scaffold issues (`connections.ts` lines 68–97):**
- Uses **non-standard SSE format**: `{ data: JSON.stringify({ type: 'qr' }) }` instead of `{ event: 'qr', data: '...' }`
- Only **10 iterations × 3 seconds = 30 seconds** maximum — far too short
- Checks **Evolution directly** for status instead of the DB — bypasses webhook state
- Missing `error` event type

**Correct implementation:** 24 polls × 5 seconds = 120 seconds max. Check DB after each poll.

**Why DB, not Evolution, for connection detection:**
The webhook handler (ZAP-010) receives `connection.update state=open` and immediately updates `whatsapp_connections.status = 'connected'`. The SSE stream must trust this DB state. Polling Evolution directly for status is redundant and creates a race condition.

---

## Acceptance Criteria

### AC-007.1 — Opens SSE stream with correct Content-Type
```bash
curl -N -H "Authorization: Bearer $JWT" \
  http://localhost:3001/api/v1/connections/{id}/qr
# EXPECTED: HTTP 200
# Content-Type: text/event-stream
# Connection: keep-alive
```

### AC-007.2 — Sends `event: qr` every 5 seconds while `connecting`
```bash
# Stream output format (standard SSE named events):
event: qr
data: {"code":"iVBORw0KGgo..."}

event: qr
data: {"code":"iVBORw0KGgo..."}   ← different QR each 5s (Evolution regenerates)
```
Each `qr` event must carry the base64 QR image from `Evolution GET /instance/connect/{instanceName}`.

### AC-007.3 — Sends `event: connected` and closes when status = `connected`
```bash
# When ZAP-010 webhook updates DB status to 'connected':
event: connected
data: {}
# Stream closes immediately after
```

### AC-007.4 — Sends `event: timeout` after exactly 24 polls × 5 seconds = 120 seconds
```bash
# If 120 seconds pass without scan:
event: timeout
data: {}
# Stream closes immediately after
# NOT EXPECTED: stream hanging open past 120s
```

### AC-007.5 — Returns 404 for unknown or foreign connections
```bash
curl -N -H "Authorization: Bearer $JWT" \
  http://localhost:3001/api/v1/connections/non-existent-id/qr
# EXPECTED: HTTP 404

# Also 404 if connection belongs to different tenant:
# EXPECTED: HTTP 404 (tenant isolation enforced)
```

### AC-007.6 — QR data is base64 string from Evolution
```bash
# event: qr data.code must be a valid base64 string
# Frontend renders: <img src={`data:image/png;base64,${code}`} />
```

---

## Technical Notes

### Named SSE Events in Hono

```typescript
return streamSSE(c, async (stream) => {
  const MAX_POLLS = 24        // 24 × 5s = 120s absolute timeout
  const POLL_INTERVAL = 5_000 // milliseconds

  for (let i = 0; i < MAX_POLLS; i++) {
    // 1. Fetch QR code from Evolution
    try {
      const qrBase64 = await sessionManager.getQRCode(tenantId, connectionId)
      if (qrBase64) {
        await stream.writeSSE({
          event: 'qr',
          data: JSON.stringify({ code: qrBase64 }),
        })
      }
    } catch (err) {
      logger.warn('QR fetch failed', { connectionId, err })
      await stream.writeSSE({
        event: 'error',
        data: JSON.stringify({ message: 'QR refresh failed' }),
      })
    }

    // 2. Check DB status — webhook may have updated it asynchronously
    const { data: conn } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('status')
      .eq('id', connectionId)
      .eq('tenant_id', tenantId)
      .single()

    if (conn?.status === 'connected') {
      await stream.writeSSE({ event: 'connected', data: '{}' })
      return  // closes stream
    }

    // 3. Wait before next poll
    await new Promise(r => setTimeout(r, POLL_INTERVAL))
  }

  // 4. Timeout
  await stream.writeSSE({ event: 'timeout', data: '{}' })
})
```

### SSE Event Format Reference

Standard SSE named event format (required for `EventSource.addEventListener('qr', ...)`):
```
event: qr\n
data: {"code":"base64string"}\n
\n
```
Hono `streamSSE` with `{ event: 'qr', data: '...' }` produces exactly this format.

**Non-standard (current scaffold — must be replaced):**
```
data: {"type":"qr","code":"..."}\n  ← no 'event:' line → only 'message' event fires
```

### Frontend Usage Pattern

```typescript
const source = new EventSource(`/api/v1/connections/${id}/qr`, {
  // withCredentials: true  // if needed for cookie auth
})

source.addEventListener('qr', (e) => {
  const { code } = JSON.parse(e.data)
  setQRCode(code)  // render: <img src={`data:image/png;base64,${code}`} />
})

source.addEventListener('connected', () => {
  source.close()
  onSuccess()
})

source.addEventListener('timeout', () => {
  source.close()
  onTimeout()
})
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-006 (sessionManager refactored — `getQRCode(tenantId, connectionId)`) | Hard | Day 2 |
| ZAP-010 (webhook updates DB `status=connected` — stream detects this) | Functional | Day 1 |
| EPIC-01 (`streamSSE` from Hono available) | Hard | ✅ |

**Blocks:**
- ZAP-011 (QR modal uses this endpoint)

---

## Definition of Done

- [x] SSE stream returns `Content-Type: text/event-stream` (AC-007.1)
- [x] Sends `event: qr` every 5 seconds (AC-007.2)
- [x] Sends `event: connected` and closes when DB status = `connected` (AC-007.3)
- [x] Sends `event: timeout` after 24 polls × 5s = 120s (AC-007.4)
- [x] Returns 404 for unknown/foreign connections (AC-007.5)
- [x] QR `data.code` is valid base64 (AC-007.6)
- [x] Non-standard `{ data: JSON.stringify({ type: 'qr' }) }` replaced with `{ event: 'qr', data: '...' }`
- [x] `npm run typecheck -w apps/api` → 0 errors
- [x] Story File List updated

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/routes/connections.ts` | MODIFIED | `GET /:id/qr` reescrito — named events, DB polling (não Evolution), 24×5s |

---

## Dev Agent Record

### Debug Log
- Correção crítica: scaffold checava `sessionManager.getStatus()` (Evolution) para detectar conexão. ZAP-007 spec exige verificar DB (que ZAP-010 webhook atualiza). Alterado para `supabaseAdmin...select('status').eq('id', connectionId)`.
- QR fetch error agora é `soft error`: envia `event: error` mas continua o loop (não quebra).

### Completion Notes
- `GET /:id/qr` reescrito com named SSE events (`event: qr`, `event: connected`, `event: timeout`, `event: error`).
- Loop: 24 iterações × 5s = 120s máximo.
- Detecção de sucesso via DB: webhook ZAP-010 atualiza `status='connected'`, SSE stream detecta na próxima poll.
- QR fetch error (Evolution down) não encerra o stream — envia `event: error` e continua.
- `Content-Type: text/event-stream` gerenciado automaticamente pelo Hono `streamSSE`.

### Agent Model Used
claude-sonnet-4-6

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-19 | River (SM) | Story created — @po validated (10/10) |
| 2026-02-19 | Dex (Dev) | Implementação completa — named SSE events, DB polling, 24×5s timeout. Typecheck 0 erros. Status: Ready for Review |

---

*Source: docs/prd/epic-02-prd.md §9.2, §10 AC-007, §FR-CONN-02*
*Arch ref: docs/architecture/epic-02-arch-validation.md §D-02*
*PO ref: docs/stories/epic-02/EPIC-02-PO-VALIDATION.md §ZAP-007*
