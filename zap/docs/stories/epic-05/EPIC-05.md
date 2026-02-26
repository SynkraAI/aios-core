# EPIC-05 — Broadcast Engine
**Platform:** Zap — WhatsApp Automation SaaS
**Phase:** MVP | **Sprint:** 4 (Weeks 7–8)
**Status:** In Progress
**Owner:** @dev (Dex)
**Prepared by:** Morgan (Product Manager)
**Last updated:** 2026-02-21

---

## Epic Objective

Permitir que o tenant envie mensagens em massa para grupos WhatsApp com delays humanizados (anti-ban), suporte a agendamento e acompanhamento de progresso em tempo real.

O núcleo do Broadcast Engine (API + workers BullMQ) **já foi implementado** durante o desenvolvimento do EPIC-04 como dependência técnica. O que resta é:

1. Documentar formalmente as stories do backend (para rastreabilidade e qualidade)
2. Implementar a UI completa do fluxo de criação de broadcast

> **Estado atual:** Backend 100% funcional. Frontend com lista básica; formulário de criação ausente.

---

## Stories in This Epic

| Story File | ID | Title | Priority | Points | Status |
|-----------|-----|-------|---------|--------|--------|
| [EPIC-05-STORY-27.md](./EPIC-05-STORY-27.md) | ZAP-027 | Broadcasts CRUD API | 🔴 CRITICAL | 5 | Done |
| [EPIC-05-STORY-28.md](./EPIC-05-STORY-28.md) | ZAP-028 | Broadcast Fan-out Worker | 🔴 CRITICAL | 5 | Done |
| [EPIC-05-STORY-29.md](./EPIC-05-STORY-29.md) | ZAP-029 | Message Worker — Anti-ban Send | 🔴 CRITICAL | 5 | Done |
| [EPIC-05-STORY-30.md](./EPIC-05-STORY-30.md) | ZAP-030 | Progress Tracking & Cancel API | 🟠 HIGH | 3 | Done |
| [EPIC-05-STORY-31.md](./EPIC-05-STORY-31.md) | ZAP-031 | Broadcasts Page UI — Formulário Completo | 🟠 HIGH | 8 | Draft |

**Total Story Points:** 26

---

## Implementation Order

```
ZAP-027 (CRUD API)           ← já feito
    └── ZAP-028 (Fan-out Worker)   ← já feito
    └── ZAP-029 (Message Worker)   ← já feito
    └── ZAP-030 (Progress & Cancel)← já feito

ZAP-031 (UI)
    └── depende de todos os endpoints acima  ← A FAZER
```

---

## Architecture Context

### Fluxo de envio

```
POST /api/v1/broadcasts         → cria broadcast em status 'draft' ou 'scheduled'
POST /api/v1/broadcasts/:id/send → muda para 'sending', enfileira broadcastId no BullMQ

broadcast-proc worker           → resolve grupos alvo + faz fan-out de message jobs
  └── messageQueue.add()        → um job por (grupo × mensagem), delay: index × 2000ms

message-send worker             → humanizedDelay(2000, 8000) + sendTextToGroup() via Evolution API
  └── increment_broadcast_sent RPC  → atualiza sent_count no broadcast
  └── increment_broadcast_failed RPC → em caso de falha (3 retries)

GET /api/v1/broadcasts/:id/status → poll a cada 3s enquanto status='sending'
  └── { status, sent_count, total_count, progress (%) }
```

### Filas BullMQ existentes

```typescript
// apps/api/src/queues/index.ts
export const broadcastQueue  // 'broadcast-proc' — concurrency: 2
export const messageQueue    // 'message-send'   — concurrency: 5
```

### Target types suportados

| target_type | Grupos resolvidos |
|-------------|------------------|
| `all_groups` | Todos ativos no projeto |
| `specific_groups` | IDs em `target_ids` |
| `phase` | Todos ativos nas fases em `target_ids` |

### Anti-ban: humanized delay

```typescript
// message.worker.ts
await humanizedDelay(2000, 8000)  // delay aleatório 2-8s antes de cada envio
// + broadcast.worker.ts: delay: jobIndex * 2000ms (stagger entre groups)
```

---

## What's Already Done (Backend)

| Arquivo | Status |
|---------|--------|
| `apps/api/src/routes/broadcasts.ts` | ✅ Completo (POST, GET, GET/:id, GET/:id/status, POST/:id/send, POST/:id/cancel) |
| `apps/api/src/workers/broadcast.worker.ts` | ✅ Completo (fan-out, stagger 2s, concurrency 2) |
| `apps/api/src/workers/message.worker.ts` | ✅ Funcional para `text`; media (image/video) é TODO |
| `apps/api/src/workers/index.ts` | ✅ Ambos workers iniciados |
| `apps/web/src/app/dashboard/broadcasts/page.tsx` | ⚠️ Lista básica OK; sem formulário de criação |

---

## What Needs to Be Built (UI — ZAP-031)

1. **Modal multi-step "Novo Disparo":**
   - Step 1: Selecionar projeto + tipo de alvo (all_groups / phase / specific_groups)
   - Step 2: Compor mensagens (1-10, editor de texto por enquanto)
   - Step 3: Agendamento (imediato ou scheduled_at com datetime picker)
   - Step 4: Review + Confirm
2. **Botão "Enviar Agora"** em cards com status `draft`
3. **Botão "Cancelar"** em cards com status `draft` ou `scheduled`
4. **Progresso animado** em cards com status `sending` (poll a cada 3s)
5. **Link de navegação** no sidebar para `/dashboard/broadcasts`

---

## Dependencies

### Pré-condições (já satisfeitas pelo EPIC-04)
- `supabaseAdmin` client disponível
- `broadcastQueue` e `messageQueue` configurados no BullMQ
- `sessionManager.sendTextToGroup()` funcional
- Tabelas `broadcasts` e `broadcast_messages` existem com RLS

### Variáveis de ambiente necessárias
Já presentes no `apps/api/.env`:
```bash
REDIS_URL=redis://localhost:6379
SUPABASE_SERVICE_ROLE_KEY=...
EVOLUTION_API_URL=http://localhost:8080
```

---

## Risks

| Risco | Prob | Impacto | Mitigação |
|-------|------|---------|-----------|
| Evolution API bane número por envio rápido | MÉDIO | ALTO | humanizedDelay (2-8s) + stagger 2s × index |
| Worker trava em job (sem ack) | BAIXO | MÉDIO | BullMQ `attempts: 3, backoff: exponential` |
| Broadcast fica em `sending` se worker cair | MÉDIO | MÉDIO | `failed` handler no `worker.on('failed')` → status='failed' |
| Media (image/video) sem suporte | ALTO | BAIXO | UI bloqueia tipo, only text no MVP |

---

## Definition of Done (Epic Level)

- [ ] ZAP-027: `POST /broadcasts` cria com status `draft`/`scheduled`; `GET /broadcasts` lista
- [ ] ZAP-028: Worker fan-out resolve grupos e enfileira jobs com stagger 2s
- [ ] ZAP-029: Worker message envia texto com humanized delay; incrementa sent/failed
- [ ] ZAP-030: `GET /:id/status` retorna progress %; `POST /:id/cancel` cancela
- [ ] ZAP-031: Modal multi-step funcional; "Enviar Agora"; progresso animado no card
- [ ] `npm run typecheck` → 0 erros
- [ ] `npm run lint` → 0 erros

---

## Handoff to Next Epic

Após EPIC-05 completo, EPIC-06 (Webhook Integrations — Hotmart/Kiwify) começa.

**Pré-condições para EPIC-06:**
- `trigger:proc` queue configurada (já existe no BullMQ setup)
- `leads` e `lead_events` tables existem (EPIC-01)
- `webhook_events` table existe (EPIC-01)
- Broadcast Engine funcional (para enviar mensagem de boas-vindas ao comprador)

---

*Prepared by: Morgan (Product Manager)*
*Source: docs/stories/zap-user-stories.md § EPIC-05*
*Review: @po *validate-story-draft antes de desenvolvimento do ZAP-031*
