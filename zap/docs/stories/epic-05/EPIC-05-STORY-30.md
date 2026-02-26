# EPIC-05-STORY-30 — Trigger Send, Progress Tracking & Cancel
**Story ID:** ZAP-030
**Epic:** EPIC-05 — Broadcast Engine
**Sprint:** 4 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 3
**Status:** Done
**Assigned to:** Dex (Dev)
**Prepared by:** Morgan (Product Manager)
**Depends on:** ZAP-027 (broadcast existe), ZAP-028 (fan-out worker ouve broadcastQueue)

---

## User Story

**As a** tenant que criou um disparo,
**I want** disparar o envio imediato, acompanhar o progresso em tempo real e cancelar se necessário,
**so that** eu tenha controle total sobre minha campanha de mensagens.

---

## Context & Background

Esta story cobre 3 endpoints complementares do CRUD de broadcast:

1. **Trigger** (`POST /broadcasts/:id/send`) — inicia o envio enfileirando o job no BullMQ
2. **Status** (`GET /broadcasts/:id/status`) — polling de progresso (% enviado)
3. **Cancel** (`POST /broadcasts/:id/cancel`) — aborta antes do início

Todos os 3 já estão implementados em `broadcasts.ts` como parte do desenvolvimento do EPIC-04.

---

## Acceptance Criteria

### AC-030.1 — POST /broadcasts/:id/send dispara envio
```bash
curl -X POST http://localhost:3001/api/v1/broadcasts/$BROADCAST_ID/send \
  -H "Authorization: Bearer $TOKEN"

# Expected: HTTP 200
# { "success": true, "message": "Broadcast queued for sending" }

# DB: broadcast.status = 'sending', broadcast.started_at = now()
# BullMQ: job 'broadcast-process' enfileirado em 'broadcast-proc' queue
```

### AC-030.2 — /send retorna 403 se não estiver em draft/scheduled
```
GIVEN broadcast.status = 'sending'
WHEN POST /broadcasts/:id/send
THEN HTTP 403 — "Broadcast is already sending or completed"

GIVEN broadcast.status = 'sent'
THEN HTTP 403

GIVEN broadcast.status = 'failed'
THEN HTTP 403
```

### AC-030.3 — GET /broadcasts/:id/status retorna progresso
```bash
GET /api/v1/broadcasts/$BROADCAST_ID/status
# Expected: HTTP 200
# {
#   "data": {
#     "status": "sending",
#     "total_count": 20,
#     "sent_count": 12,
#     "failed_count": 1,
#     "progress": 60,      ← Math.round(12/20 * 100)
#     "started_at": "2026-02-21T10:00:00Z",
#     "completed_at": null
#   }
# }
```

### AC-030.4 — progress calculado corretamente
```
GIVEN sent_count=0, total_count=0
THEN progress = 0 (não divide por zero)

GIVEN sent_count=10, total_count=20
THEN progress = 50

GIVEN sent_count=20, total_count=20
THEN progress = 100 e status = 'sent'
```

### AC-030.5 — POST /broadcasts/:id/cancel aborta broadcast
```bash
POST /api/v1/broadcasts/$BROADCAST_ID/cancel
# Expected: HTTP 200
# { "success": true }
# DB: broadcast.status = 'failed'
```

### AC-030.6 — /cancel retorna 403 se já enviando/enviado
```
GIVEN broadcast.status = 'sending'
WHEN POST /broadcasts/:id/cancel
THEN HTTP 403 — "Cannot cancel a broadcast that is already sending"

GIVEN broadcast.status = 'sent'
THEN HTTP 403
```

---

## Dev Notes

### Endpoints implementados em

```
apps/api/src/routes/broadcasts.ts
```

### /send: job payload para broadcast-proc

```typescript
await broadcastQueue.add(
  'broadcast-process',
  { broadcastId: id, tenantId },
  {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  }
)
```

### /status: cálculo de progress

```typescript
const progress = data.total_count > 0
  ? Math.round((data.sent_count / data.total_count) * 100)
  : 0
```

### Frontend: polling strategy

```typescript
// apps/web: usar react-query com refetchInterval
const { data } = useQuery({
  queryKey: ['broadcast-status', broadcastId],
  queryFn: () => apiBroadcasts.getStatus(broadcastId),
  refetchInterval: (data) => data?.data?.status === 'sending' ? 3000 : false,
})
```

---

## Tasks / Subtasks

### Task 1: Trigger Send
- [x] 1.1 `POST /:id/send` — verificar ownership do tenant
- [x] 1.2 Guard: apenas de 'draft' ou 'scheduled'
- [x] 1.3 Update status → 'sending' + started_at
- [x] 1.4 Enqueue job em broadcastQueue

### Task 2: Progress Status
- [x] 2.1 `GET /:id/status` — select apenas campos de progresso
- [x] 2.2 Calcular progress com guard zero-division

### Task 3: Cancel
- [x] 3.1 `POST /:id/cancel` — verificar ownership
- [x] 3.2 Guard: apenas 'draft' ou 'scheduled'
- [x] 3.3 Update status → 'failed'

### Task 4: Quality
- [x] 4.1 Testar /send → job no Redis verificado com `redis-cli`
- [x] 4.2 Testar /status → progress % correto
- [x] 4.3 Testar /cancel → 403 quando 'sending'

---

## Definition of Done

- [x] AC-030.1: POST /send → status='sending', job enfileirado, HTTP 200
- [x] AC-030.2: POST /send em broadcast não-draft → HTTP 403
- [x] AC-030.3: GET /status retorna todos os campos de progresso
- [x] AC-030.4: progress calculado sem divisão por zero
- [x] AC-030.5: POST /cancel → status='failed', HTTP 200
- [x] AC-030.6: POST /cancel em broadcast 'sending'/'sent' → HTTP 403

---

## File List

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/routes/broadcasts.ts` | MODIFY | Adicionar /send, /status, /cancel |

---

## Dev Agent Record

### Completion Notes

- Todos os 3 endpoints implementados no mesmo arquivo `broadcasts.ts`
- ForbiddenError (HTTP 403) e NotFoundError (HTTP 404) importados de `lib/errors.ts`
- `/cancel` usa status='failed' por alinhamento com PRD (simplifica state machine)

### Agent Model Used

claude-sonnet-4-6

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | Morgan (PM) | Story criada — Trigger Send, Progress & Cancel |

---

*Source: docs/stories/zap-user-stories.md § ZAP-026, ZAP-029, ZAP-030*
*FR: FR-BROADCAST-SEND-01 a FR-BROADCAST-CANCEL-03*
