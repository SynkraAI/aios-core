# EPIC-05-STORY-27 — Broadcasts CRUD API
**Story ID:** ZAP-027
**Epic:** EPIC-05 — Broadcast Engine
**Sprint:** 4 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 5
**Status:** Done
**Assigned to:** Dex (Dev)
**Prepared by:** Morgan (Product Manager)
**Depends on:** ZAP-002 (tabelas broadcasts/broadcast_messages), ZAP-003 (authMiddleware), ZAP-004 (broadcastQueue)

---

## User Story

**As a** tenant gerenciando uma campanha de lançamento,
**I want** criar, listar e gerenciar disparos com mensagens personalizadas,
**so that** eu possa preparar campanhas de massa com texto, alvo e agendamento definidos antes de enviar.

---

## Context & Background

O Broadcast Engine permite enviar mensagens em massa para grupos WhatsApp de forma controlada e assíncrona. Esta story cobre o **CRUD completo** de broadcasts — a camada de API que antecede o processamento pelos workers.

**Schema já existe** (migration ZAP-002):
```sql
broadcasts: id, tenant_id, project_id, connection_id, name, status, target_type, target_ids,
            total_count, sent_count, failed_count, scheduled_at, started_at, completed_at

broadcast_messages: id, broadcast_id, order, content_type, content (JSONB)
```

**Status flow:**
```
draft → sending (via /send) → sent
draft → failed (via /cancel ou falha do worker)
draft → scheduled (se scheduled_at definido)
scheduled → sending (via /send ou scheduler futuro)
```

---

## Acceptance Criteria

### AC-027.1 — POST /api/v1/broadcasts cria broadcast
```bash
curl -X POST http://localhost:3001/api/v1/broadcasts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "connectionId": "'$CONN_ID'",
    "name": "Disparo Dia de Lançamento",
    "target_type": "all_groups",
    "target_ids": [],
    "messages": [
      { "order": 0, "content_type": "text", "content": { "text": "🎉 Chegou a hora! Bem-vindo ao grupo." } },
      { "order": 1, "content_type": "text", "content": { "text": "Acesse agora: https://meusite.com" } }
    ]
  }'

# Expected: HTTP 201
# { "data": { "id": "uuid", "status": "draft", "name": "...", ... } }
```

### AC-027.2 — Status 'scheduled' quando scheduled_at fornecido
```
GIVEN payload com "scheduled_at": "2026-02-25T10:00:00Z"
WHEN POST /broadcasts
THEN broadcast criado com status = 'scheduled'

GIVEN payload SEM scheduled_at
WHEN POST /broadcasts
THEN broadcast criado com status = 'draft'
```

### AC-027.3 — Validações de entrada
```
GIVEN messages com 0 itens → HTTP 422 (min 1)
GIVEN messages com 11 itens → HTTP 422 (max 10)
GIVEN target_type inválido → HTTP 422
GIVEN projectId não pertence ao tenant → HTTP 404
GIVEN connectionId não pertence ao tenant → HTTP 404
```

### AC-027.4 — GET /api/v1/broadcasts lista broadcasts do tenant
```bash
GET /api/v1/broadcasts?projectId=xxx
# Inclui messages: broadcast_messages[]
# Ordenado por created_at DESC
# Apenas broadcasts do tenant autenticado
```

### AC-027.5 — GET /api/v1/broadcasts/:id retorna broadcast individual
```
GIVEN id pertencente ao tenant → HTTP 200 com broadcast + messages
GIVEN id de outro tenant → HTTP 404
GIVEN id inexistente → HTTP 404
```

---

## Dev Notes

### Arquivo implementado

```
apps/api/src/routes/broadcasts.ts
```

### Schema Zod de criação

```typescript
const messageSchema = z.object({
  order: z.number().int().min(0),
  content_type: z.enum(['text', 'image', 'video', 'audio', 'document']),
  content: z.record(z.unknown()),
})

const createBroadcastSchema = z.object({
  projectId: z.string().uuid(),
  connectionId: z.string().uuid(),
  name: z.string().min(1).max(200),
  target_type: z.enum(['all_groups', 'specific_groups', 'phase']).default('all_groups'),
  target_ids: z.array(z.string().uuid()).default([]),
  messages: z.array(messageSchema).min(1).max(10),
  scheduled_at: z.string().datetime().optional(),
})
```

### Estrutura de `content` por type

| content_type | campos esperados em `content` |
|-------------|-------------------------------|
| `text` | `{ text: string }` |
| `image` | `{ url: string, caption?: string }` |
| `video` | `{ url: string, caption?: string }` |
| `audio` | `{ url: string }` |
| `document` | `{ url: string, filename: string }` |

> **MVP:** apenas `text` é processado pelo message.worker.ts. Demais tipos requerem ZAP-033+.

---

## Tasks / Subtasks

### Task 1: CRUD API
- [x] 1.1 `POST /broadcasts` — criar com Zod validation
- [x] 1.2 `POST /broadcasts` — inserir em `broadcast_messages` após broadcast criado
- [x] 1.3 `GET /broadcasts?projectId` — listar com messages nested
- [x] 1.4 `GET /broadcasts/:id` — detalhe com messages
- [x] 1.5 Verificar que project e connection pertencem ao tenant

### Task 2: Quality
- [x] 2.1 `npm run typecheck -w apps/api` → 0 erros
- [x] 2.2 Testar POST → 201 com status 'draft'
- [x] 2.3 Testar POST com scheduled_at → status 'scheduled'
- [x] 2.4 Testar GET list → mensagens aninhadas

---

## Definition of Done

- [x] AC-027.1: POST /broadcasts cria com HTTP 201
- [x] AC-027.2: status 'scheduled' quando scheduled_at fornecido
- [x] AC-027.3: Validações retornam 422/404 corretos
- [x] AC-027.4: GET /broadcasts lista apenas broadcasts do tenant
- [x] AC-027.5: GET /broadcasts/:id com ownership check

---

## File List

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/routes/broadcasts.ts` | CREATE | CRUD completo |
| `apps/api/src/index.ts` | MODIFY | Registrar broadcastsRouter em /api/v1/broadcasts |

---

## Dev Agent Record

### Completion Notes

- Endpoint registrado em `index.ts` como `app.route('/api/v1/broadcasts', broadcastsRouter)`
- `messages` armazenadas em `broadcast_messages` com `broadcast_id` foreign key
- `target_ids` é UUID[] no DB — Supabase aceita array JSON diretamente
- Verificação de ownership para project e connection antes de criar

### Agent Model Used

claude-sonnet-4-6

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | Morgan (PM) | Story criada — documentação retroativa do Broadcasts CRUD API |

---

*Source: docs/stories/zap-user-stories.md § ZAP-025, ZAP-026*
*FR: FR-BROADCAST-01 a FR-BROADCAST-06*
