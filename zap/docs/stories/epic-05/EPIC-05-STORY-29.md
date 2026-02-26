# EPIC-05-STORY-29 — Message Worker — Anti-ban Send
**Story ID:** ZAP-029
**Epic:** EPIC-05 — Broadcast Engine
**Sprint:** 4 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 5
**Status:** Done
**Assigned to:** Dex (Dev)
**Prepared by:** Morgan (Product Manager)
**Depends on:** ZAP-028 (fan-out enfileira message jobs), ZAP-006 (sessionManager com sendTextToGroup)

---

## User Story

**As a** sistema enviando mensagens para grupos WhatsApp,
**I want** que cada mensagem seja enviada com delay humanizado e de forma independente por grupo,
**so that** o WhatsApp não detecte padrão de spam e o número não seja banido.

---

## Context & Background

O `message-send` worker é o **ponto de contato real com o WhatsApp** via Evolution API. É responsável por:

1. Aguardar delay humanizado (2-8s aleatório) antes de enviar — **anti-ban crítico**
2. Chamar `sessionManager.sendTextToGroup()` para texto
3. Registrar sucesso/falha no contador do broadcast

### Por que humanized delay é crítico

O WhatsApp detecta automação por padrões de timing. Mensagens enviadas em intervalos regulares (ex: exatamente 2s cada) são suspeitas. O delay aleatório entre 2-8s imita comportamento humano.

```
Sem delay: 100 grupos recebem mensagem em ~1 segundo → BAN garantido
Com delay: 100 grupos × 5s médio = ~8 minutos de envio → Comportamento natural
```

### Limite atual: apenas texto

O MVP suporta apenas `content_type: 'text'`. Image/video/audio/document têm TODO comment e precisarão de endpoints separados da Evolution API (ZAP-033, pós-MVP).

---

## Acceptance Criteria

### AC-029.1 — Delay humanizado antes de cada envio
```
GIVEN job message-send recebido
WHEN worker processa
THEN aguarda entre 2000ms e 8000ms (aleatório) ANTES de chamar Evolution API
THEN nunca envia imediatamente (delay mínimo 2s)
```

### AC-029.2 — Envio de texto via sessionManager
```
GIVEN content.type = 'text' e content.text preenchido
WHEN worker processa
THEN chama sessionManager.sendTextToGroup(tenantId, connectionId, waGroupId, content.text)
THEN Evolution API recebe a mensagem e a envia ao grupo
```

### AC-029.3 — Incremento atômico de sent_count no sucesso
```
GIVEN envio bem-sucedido (sem exceção)
AFTER sessionManager.sendTextToGroup() retornar sem erro
THEN supabaseAdmin.rpc('increment_broadcast_sent', { broadcast_id }) executado
THEN broadcasts.sent_count incrementado em 1
```

### AC-029.4 — Incremento de failed_count em falha permanente (após 3 retries)
```
GIVEN sessionManager.sendTextToGroup() lança exceção
WHEN job esgota 3 tentativas (backoff exponencial)
THEN messageWorker.on('failed') dispara
THEN supabaseAdmin.rpc('increment_broadcast_failed', { broadcast_id }) executado
THEN broadcasts.failed_count incrementado em 1
```

### AC-029.5 — Transição automática para 'sent' quando completo
```
GIVEN increment_broadcast_sent chama
  AND sent_count + failed_count >= total_count
THEN broadcasts.status = 'sent'
THEN broadcasts.completed_at = now()

Nota: esta lógica pode estar no RPC do banco ou verificada após incremento
```

### AC-029.6 — Concurrency do worker: 5
```
GIVEN múltiplos message jobs na fila
THEN até 5 jobs processados em paralelo (5 grupos simultâneos)
THEN combinado com humanizedDelay evita burst no WhatsApp
```

### AC-029.7 — content_type != 'text' é ignorado silenciosamente no MVP
```
GIVEN content.type = 'image'
WHEN worker processa
THEN nenhuma exceção lançada
THEN job concluído sem envio (log info: "content type not supported yet")
THEN sent_count NÃO incrementado (job "pulado")
```

---

## Dev Notes

### Arquivo implementado

```
apps/api/src/workers/message.worker.ts
```

### humanizedDelay function

```typescript
// apps/api/src/queues/index.ts
export function humanizedDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

// Usado no worker:
await humanizedDelay(2000, 8000)  // 2-8 segundos aleatório
```

### sessionManager.sendTextToGroup signature

```typescript
// apps/api/src/services/whatsapp/session-manager.ts
async sendTextToGroup(
  tenantId: string,
  connectionId: string,
  waGroupId: string,
  text: string
): Promise<void>
```

Internamente chama a Evolution API:
```
POST /message/sendText/{instanceName}
{ "number": "{waGroupId}@g.us", "text": "{text}" }
```

### RPCs utilizadas

```sql
-- increment_broadcast_sent (em supabase/migrations/)
UPDATE broadcasts SET sent_count = sent_count + 1 WHERE id = broadcast_id;
-- Se sent_count + failed_count >= total_count → status = 'sent', completed_at = now()

-- increment_broadcast_failed
UPDATE broadcasts SET failed_count = failed_count + 1 WHERE id = broadcast_id;
```

---

## Tasks / Subtasks

### Task 1: Message Worker
- [x] 1.1 Criar `apps/api/src/workers/message.worker.ts`
- [x] 1.2 Importar e chamar `humanizedDelay(2000, 8000)` antes do envio
- [x] 1.3 Lógica para content_type='text' → `sessionManager.sendTextToGroup()`
- [x] 1.4 `on('failed')` → `increment_broadcast_failed` RPC
- [x] 1.5 Após sucesso → `increment_broadcast_sent` RPC
- [x] 1.6 Concurrency = 5

### Task 2: Verificar RPCs
- [x] 2.1 Confirmar que `increment_broadcast_sent` existe nas migrations
- [x] 2.2 Confirmar que `increment_broadcast_failed` existe nas migrations
- [x] 2.3 Verificar se RPC faz transição automática para 'sent' quando completo

### Task 3: Quality
- [x] 3.1 `npm run typecheck -w apps/api` → 0 erros
- [x] 3.2 Testar envio de texto real para grupo (em dev com conexão ativa)

---

## Definition of Done

- [x] AC-029.1: humanizedDelay(2000, 8000) aplicado antes de cada envio
- [x] AC-029.2: sendTextToGroup chamado para content_type='text'
- [x] AC-029.3: increment_broadcast_sent após sucesso
- [x] AC-029.4: increment_broadcast_failed após 3 falhas
- [x] AC-029.5: Transição automática para 'sent' via RPC
- [x] AC-029.6: concurrency = 5
- [x] AC-029.7: content_type != 'text' ignorado sem exceção

---

## File List

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/workers/message.worker.ts` | CREATE | Anti-ban message sender |
| `apps/api/src/workers/index.ts` | MODIFY | Exportar e iniciar messageWorker |
| `apps/api/src/queues/index.ts` | VERIFY | humanizedDelay exportada |

---

## Dev Agent Record

### Completion Notes

- `humanizedDelay` exportada de `queues/index.ts` — reutilizável para future workers
- content_type != 'text' resulta em job concluído sem envio (não falha o job)
- Backoff exponencial 10s: retry 1=10s, retry 2=20s, retry 3=40s

### Known Limitations (TODO pós-MVP)

- Image/video/audio/document não suportados → precisam de endpoints de media da Evolution API
- Sem verificação se grupo ainda aceita mensagens (grupo banido, arquivado, etc.)
- Sem deduplicação de jobs (se worker restartado, pode re-enviar)

### Agent Model Used

claude-sonnet-4-6

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | Morgan (PM) | Story criada — documentação retroativa do Message Worker Anti-ban |

---

*Source: docs/stories/zap-user-stories.md § ZAP-028*
*FR: FR-MSG-WORKER-01 a FR-MSG-WORKER-08*
*NFR: NFR-ANTIBÁN-01 (humanized delay obrigatório)*
