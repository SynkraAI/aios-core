# EPIC-05-STORY-28 — Broadcast Fan-out Worker
**Story ID:** ZAP-028
**Epic:** EPIC-05 — Broadcast Engine
**Sprint:** 4 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 5
**Status:** Done
**Assigned to:** Dex (Dev)
**Prepared by:** Morgan (Product Manager)
**Depends on:** ZAP-027 (broadcast existe no DB), ZAP-004 (BullMQ queues), ZAP-016 (grupos com wa_group_id)

---

## User Story

**As a** sistema processando um disparo,
**I want** que o broadcast worker resolva os grupos alvo e distribua os envios de forma independente por grupo,
**so that** cada grupo receba as mensagens de maneira controlada com anti-ban, sem bloquear outros grupos.

---

## Context & Background

Quando o tenant clica em "Enviar" (`POST /broadcasts/:id/send`), o `broadcast-proc` worker é ativado. Sua responsabilidade é:

1. Ler o broadcast e suas mensagens do banco
2. Resolver os grupos alvo com base em `target_type`
3. Calcular `total_count = grupos × mensagens`
4. Fazer **fan-out**: enfileirar um job `message-send` por (grupo × mensagem) no BullMQ
5. Aplicar **stagger** de 2s por slot para distribuir carga

O processamento real do envio é feito pelo `message-send` worker (ZAP-029).

### Arquitetura fan-out

```
broadcast-proc job
  ├── Resolve grupos (DB query)
  ├── Update total_count no broadcast
  └── Para cada grupo × mensagem:
        messageQueue.add('message-send', payload, { delay: index * 2000 })

Ex: 10 grupos × 2 mensagens = 20 jobs
    job 0: delay=0ms   (grupo 1, msg 1)
    job 1: delay=2000ms (grupo 1, msg 2)
    job 2: delay=4000ms (grupo 2, msg 1)
    ...
    job 19: delay=38000ms (grupo 10, msg 2)
```

---

## Acceptance Criteria

### AC-028.1 — Worker resolve grupos por target_type
```
GIVEN broadcast.target_type = 'all_groups'
THEN busca todos groups com status='active' no project

GIVEN broadcast.target_type = 'specific_groups'
THEN busca grupos com IDs em broadcast.target_ids

GIVEN broadcast.target_type = 'phase'
THEN busca todos grupos ativos nas fases em broadcast.target_ids
```

### AC-028.2 — total_count atualizado antes do fan-out
```
GIVEN broadcast com 5 grupos e 2 mensagens
WHEN worker resolve grupos
THEN broadcasts.total_count = 10 (5 × 2)
THEN atualizado ANTES de enfileirar os message jobs
```

### AC-028.3 — Stagger 2s entre jobs
```
GIVEN 3 grupos × 2 mensagens = 6 jobs
THEN jobs enfileirados com delays: 0ms, 2000ms, 4000ms, 6000ms, 8000ms, 10000ms
THEN nenhum grupo começa ao mesmo tempo (evita ban)
```

### AC-028.4 — Worker não reprocessa broadcast que não está em 'sending'
```
GIVEN broadcast.status != 'sending'
WHEN worker ativado
THEN worker termina sem enfileirar jobs
THEN log warn emitido
```

### AC-028.5 — Falha permanente do worker marca broadcast como failed
```
GIVEN erro não-recuperável no worker (ex: DB offline)
WHEN job falha após 3 retries
THEN broadcasts.status = 'failed'
THEN broadcasts.completed_at = now()
```

### AC-028.6 — Concurrency do worker: 2
```
GIVEN múltiplos broadcasts simultâneos
THEN apenas 2 broadcast-proc jobs rodam em paralelo
THEN demais ficam em fila (BullMQ queue)
```

---

## Dev Notes

### Arquivo implementado

```
apps/api/src/workers/broadcast.worker.ts
```

### Job payload para message-send

```typescript
interface MessageJobData {
  tenantId: string
  broadcastId: string
  groupId: string         // UUID do grupo no DB
  waGroupId: string       // ID do grupo no WhatsApp (para Evolution API)
  connectionId: string    // UUID da conexão WhatsApp
  content: {
    type: string          // 'text' | 'image' | ...
    text?: string
    url?: string
    caption?: string
    filename?: string
  }
}
```

### Configuração BullMQ

```typescript
await messageQueue.add(
  'message-send',
  payload,
  {
    delay: jobIndex * 2000,      // stagger 2s por slot
    attempts: 3,                  // 3 tentativas
    backoff: { type: 'exponential', delay: 10000 },  // backoff exp 10s
  }
)
```

### Handler de falha permanente

```typescript
broadcastWorker.on('failed', (job, err) => {
  if (job?.data.broadcastId) {
    void supabaseAdmin
      .from('broadcasts')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', job.data.broadcastId)
  }
})
```

---

## Tasks / Subtasks

### Task 1: Fan-out Worker
- [x] 1.1 Criar `apps/api/src/workers/broadcast.worker.ts`
- [x] 1.2 Implementar resolução de grupos por target_type (3 variantes)
- [x] 1.3 Update `total_count` antes do fan-out
- [x] 1.4 Fan-out com `delay: jobIndex * 2000`
- [x] 1.5 Guard: skip se status != 'sending'
- [x] 1.6 Handler `on('failed')` → status='failed' + completed_at

### Task 2: Registrar worker no processo
- [x] 2.1 Exportar `broadcastWorker` em workers/index.ts
- [x] 2.2 Verificar que worker inicia junto com a API (`npm run worker:dev`)

### Task 3: Quality
- [x] 3.1 `npm run typecheck -w apps/api` → 0 erros
- [x] 3.2 Testar fan-out: 3 grupos → 3 jobs no Redis

---

## Definition of Done

- [x] AC-028.1: Worker resolve grupos por target_type (3 variantes)
- [x] AC-028.2: total_count atualizado antes dos jobs
- [x] AC-028.3: Stagger 2s entre jobs (delay: index × 2000)
- [x] AC-028.4: Guard para status != 'sending'
- [x] AC-028.5: Falha permanente → status='failed'
- [x] AC-028.6: Concurrency = 2

---

## File List

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/workers/broadcast.worker.ts` | CREATE | Fan-out worker |
| `apps/api/src/workers/index.ts` | MODIFY | Exportar e iniciar broadcastWorker |

---

## Dev Agent Record

### Completion Notes

- `supabaseAdmin` usado (bypassa RLS — necessário pois worker não tem contexto de usuário)
- Messages aninhadas via `select('*, messages:broadcast_messages(*)')` em uma única query
- Stagger linear simples (não aleatório) — suficiente para MVP; ZAP-033 pode adicionar jitter

### Agent Model Used

claude-sonnet-4-6

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | Morgan (PM) | Story criada — documentação retroativa do Broadcast Fan-out Worker |

---

*Source: docs/stories/zap-user-stories.md § ZAP-027*
*FR: FR-BROADCAST-WORKER-01 a FR-BROADCAST-WORKER-06*
