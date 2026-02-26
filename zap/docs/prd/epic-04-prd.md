# PRD — EPIC-04: Dynamic Tracking Links
**Platform:** Zap — WhatsApp Automation SaaS
**Version:** 1.0
**Status:** Ready for Engineering
**Date:** 2026-02-20
**Phase:** MVP | **Sprint:** 3 (Weeks 7–8)
**Prepared by:** Morgan (Product Manager)
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

**Epic ID:** EPIC-04
**Title:** Dynamic Tracking Links
**Stories:** ZAP-020 → ZAP-025 (6 stories, ~29 points)
**Sprint:** 3 | **Weeks:** 7–8

> **Nota de numeração:** ZAP-019 foi utilizado no EPIC-03 (Group Management Actions — follow-up do QA gate ZAP-018). EPIC-04 inicia em ZAP-020.

### One-Sentence Value Proposition

> Permitir que tenants gerem links de rastreamento únicos que redirecionam visitantes automaticamente para o grupo WhatsApp com menor taxa de ocupação — capturando analytics de cada clique e rotacionando grupos conforme enchem, eliminando 100% do trabalho manual de distribuição de links.

### Exit Criteria

> Um tenant pode criar um link de rastreamento vinculado a uma fase do projeto, compartilhá-lo em suas redes/anúncios, e qualquer pessoa que clicar será redirecionada automaticamente para o grupo WhatsApp menos cheio via HTTP 302 deeplink — com o histórico de cliques, grupos distribuídos e métricas visíveis no dashboard. Quando todos os grupos de uma fase enchem, o link redireciona para uma URL de fallback configurável.

### Contexto de Negócio — Fluxo do Usuário Final

```
[Anúncio / Bio / Landing Page]
         ↓
Pessoa clica no link (ex: zap.app/r/abc123)
         ↓
GET /r/:token — resposta < 200ms (p99)
         ↓
Redis cache (30s TTL): qual grupo tem menor fill rate?
         ↓
HTTP 302 → https://chat.whatsapp.com/XXXXX
         ↓  (deeplink — abre WhatsApp direto no mobile)
Pessoa entra no grupo ✓
         ↓
Async: click registrado (IP, device, grupo, timestamp)
         ↓
Grupo cheio? → Próximo grupo (fill-first)
Todos cheios? → Redireciona para fallback_url
```

**Prioridade de negócio:** Este epic é o **core diferenciador** do Zap. Sem os links de rastreamento, os grupos cadastrados no EPIC-03 são inatingíveis — o tenant não tem como distribuir leads automaticamente.

---

## 2. Problem Statement

### 2.1 The User Problem

Após conectar o WhatsApp (EPIC-02) e cadastrar os grupos no funil (EPIC-03), o tenant enfrenta o problema crítico de **distribuição**:

| Dor | Impacto |
|-----|---------|
| Distribuir manualmente links de grupos diferentes | Humano tem que decidir qual grupo enviar para cada lead — não escala |
| Sem rastreamento de origem dos leads | Zero visibilidade sobre qual anúncio/link converteu mais |
| Link de convite expira ou grupo enche | Lead cai em grupo cheio ou tenta entrar com link inválido |
| Sem rotação automática | Quando grupo 1 enche, precisa trocar o link manualmente em todos os lugares |
| Sem dados de analytics | Não sabe quantas pessoas clicaram, em qual hora, de qual dispositivo |

### 2.2 O Fluxo Ideal (Zap)

O tenant cria **um único link** por fase → compartilha em todos os seus canais → o sistema rotaciona automaticamente os grupos conforme enchem → analytics em tempo real.

---

## 3. Current State Analysis

### 3.1 O que já existe (EPIC-01/02/03)

| Componente | Status | Localização |
|-----------|--------|-------------|
| Tabela `dynamic_links` | ✅ Migração aplicada | `supabase/migrations/` |
| Tabela `link_clicks` | ✅ Migração aplicada | `supabase/migrations/` |
| Redis/Upstash configurado | ✅ Disponível | `apps/api/src/db/redis.ts` |
| BullMQ configurado | ✅ Disponível | `apps/api/src/queue/` |
| Grupos com `wa_invite_link` | ✅ Preenchido | EPIC-03 |
| Auth middleware | ✅ Implementado | `apps/api/src/middleware/auth.ts` |
| Frontend base (Next.js) | ✅ Estruturado | `apps/web/src/` |

### 3.2 O que precisa ser implementado

| Story | Componente | Complexidade |
|-------|-----------|-------------|
| ZAP-020 | CRUD de links (`POST`, `GET /api/v1/links`) | MEDIUM |
| ZAP-021 | Redirect engine (`GET /r/:token`) + Redis | HIGH |
| ZAP-022 | Click recording assíncrono | MEDIUM |
| ZAP-023 | Analytics endpoint de links | MEDIUM |
| ZAP-024 | Links page UI | MEDIUM |
| ZAP-025 | Analytics modal UI | MEDIUM |

> **Nota de descoberta pré-implementação:** Verificar se `apps/api/src/routes/links.ts` existe. Durante EPIC-02, a API de groups foi pré-construída. Pode haver scaffolding ou implementação parcial de links.

---

## 4. Business Value

### 4.1 Por que EPIC-04 é o mais crítico do MVP

```
EPIC-03 entregou: grupos cadastrados, fases organizadas
EPIC-04 entrega: a ponte entre o mundo externo e os grupos

Sem EPIC-04:
  - Grupos existem mas são inatingíveis automaticamente
  - Tenant volta ao processo manual de enviar links
  - Zero dados de rastreamento de leads
  - Produto não tem valor diferencial vs. simplesmente copiar links do WhatsApp
```

### 4.2 Jobs-to-be-Done Atendidos

| JTD | Antes do Zap | Com EPIC-04 |
|-----|-------------|------------|
| JTD-01: Capturar leads com rastreamento | Impossível — link direto sem dados | ✅ Cada clique registrado |
| JTD-02: Rotear leads automaticamente | Manual — human decides | ✅ Fill-first automático |
| JTD-05: Ver dashboard de progresso | Zero visibilidade | ✅ Click analytics por link |

### 4.3 ROI para o Tenant

- Lançamento com 50 grupos: sem Zap = 1 pessoa gerenciando links manualmente o dia inteiro
- Com Zap: zero intervenção humana na distribuição
- Redução estimada: 8h/dia → 0h/dia durante semana de lançamento

---

## 5. Functional Scope

### 5.1 Entidades de Dados

**`dynamic_links`** (já na migration):
```sql
id            UUID PK
tenant_id     UUID FK (tenants) — RLS
project_id    UUID FK (projects)
phase_id      UUID FK (project_phases)
token         VARCHAR(16) UNIQUE NOT NULL
name          VARCHAR(200)
fallback_url  TEXT
is_active     BOOLEAN DEFAULT true
click_count   INTEGER DEFAULT 0
created_at    TIMESTAMPTZ
updated_at    TIMESTAMPTZ
```

**`link_clicks`** (já na migration):
```sql
id            UUID PK
link_id       UUID FK (dynamic_links)
tenant_id     UUID FK — RLS
group_id      UUID FK (groups) NULLABLE
clicked_at    TIMESTAMPTZ
ip_address    TEXT
user_agent    TEXT
country       TEXT NULLABLE
device_type   TEXT ('mobile'|'desktop'|'tablet')
redirected_to TEXT (wa_invite_link usado)
```

### 5.2 Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/v1/links` | JWT | Criar link de rastreamento |
| GET | `/api/v1/links?projectId=` | JWT | Listar links do projeto |
| GET | `/api/v1/links/:id` | JWT | Detalhe do link |
| PATCH | `/api/v1/links/:id` | JWT | Atualizar (name, fallback_url, is_active) |
| DELETE | `/api/v1/links/:id` | JWT | Deletar link |
| GET | `/r/:token` | **PÚBLICO** | Redirect engine (fill-first) |
| GET | `/api/v1/analytics/links/:linkId` | JWT | Analytics do link |

> **CRÍTICO:** `GET /r/:token` é o único endpoint público do sistema (sem JWT). É o coração do produto.

---

## 6. Technical Scope

### 6.1 Redirect Engine — Arquitetura

```
GET /r/:token
    │
    ├─ Redis GET "link:{token}" → link metadata (30s TTL)
    │   └─ MISS: Supabase query → Redis SET
    │
    ├─ Redis GET "phase_groups:{phaseId}" → available groups (30s TTL)
    │   └─ MISS: Supabase query → filter active + not full → Redis SET
    │
    ├─ Fill-first: sort by (participant_count / capacity) ASC
    │   └─ Select group with lowest fill ratio
    │
    ├─ return HTTP 302 Location: group.wa_invite_link
    │
    └─ Async (setImmediate/Promise): record click in link_clicks
        └─ increment dynamic_links.click_count (atomic RPC)
```

### 6.2 Fill-First Algorithm

```typescript
// Seleciona o grupo com MENOR taxa de ocupação
const groups = await getAvailableGroups(phaseId) // Redis cache 30s
const sorted = groups
  .filter(g => g.status !== 'archived' && g.status !== 'full')
  .sort((a, b) => (a.participant_count / a.capacity) - (b.participant_count / b.capacity))

const target = sorted[0] // Menor fill ratio
if (!target) return redirect(link.fallback_url ?? '/full') // todos cheios
return redirect(target.wa_invite_link) // HTTP 302
```

### 6.3 Deeplink Mobile

O `wa_invite_link` já está no formato `https://chat.whatsapp.com/XXXXX`.

No mobile, navegadores modernos interceptam este esquema e abrem o WhatsApp diretamente (deeplink). **Nenhum código adicional é necessário** — o HTTP 302 para `https://chat.whatsapp.com/` já funciona como deeplink no iOS e Android.

**Opcional (ZAP-024 UI):** Adicionar meta tag `<meta http-equiv="refresh">` na landing page para garantir redirecionamento em browsers que bloqueiam HTTP 302.

### 6.4 Performance — Alvo

| Métrica | Target | Estratégia |
|---------|--------|-----------|
| p50 latência redirect | < 50ms | Redis cache |
| p99 latência redirect | < 200ms | Redis + índice em `token` |
| Click recording | Non-blocking | `setImmediate()` / async |
| Cache invalidation | 30s TTL | Supabase webhook → Redis flush |

### 6.5 Workers (BullMQ)

Para garantir zero perda de clicks em caso de falha:

```typescript
// Opção A (simples): Registro direto async no handler
setImmediate(() => recordClick(clickData))

// Opção B (robusto): BullMQ job
await clickQueue.add('record-click', clickData)
// Worker: insere em link_clicks + incrementa click_count
```

**Recomendação:** Opção A para MVP (simples, direto). Opção B se analytics forem críticos.

---

## 7. What Is Included

- ✅ CRUD completo de `dynamic_links` (POST, GET, PATCH, DELETE)
- ✅ Redirect engine público `GET /r/:token` com fill-first e Redis cache
- ✅ Click recording assíncrono (não bloqueia redirect)
- ✅ Analytics endpoint: clicks por dia, distribuição por grupo, device breakdown
- ✅ Links page UI: list, create modal, copy link, toggle ativo/inativo
- ✅ Analytics modal: gráfico de clicks por dia (últimos 7 dias)
- ✅ Tenant isolation: RLS em `dynamic_links` e `link_clicks`
- ✅ Fallback URL quando todos os grupos da fase estão cheios

---

## 8. What Is NOT Included

- ❌ Custom domains (V2 — EPIC-14)
- ❌ QR Code gerado para o link (V1)
- ❌ A/B testing entre links (fora de escopo)
- ❌ Geo-routing por país (analytics capturam mas não usam para routing)
- ❌ Link expiration por data (V1)
- ❌ Redirect landing page customizada (link vai direto para WA)
- ❌ UTM parameters passthrough (out of scope)

---

## 9. Functional Requirements

### 9.1 Link Management (FR-LINK)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-LINK-01 | Sistema SHALL gerar token único (16 chars, URL-safe) para cada link | MUST |
| FR-LINK-02 | Sistema SHALL vincular link a uma `phase_id` específica | MUST |
| FR-LINK-03 | Sistema SHALL permitir configurar `fallback_url` (onde redirecionar se fase cheia) | MUST |
| FR-LINK-04 | Sistema SHALL permitir ativar/desativar link sem deletar | MUST |
| FR-LINK-05 | Sistema SHALL retornar 404 para link inativo ou inexistente | MUST |
| FR-LINK-06 | Sistema SHALL manter `click_count` atualizado atomicamente | MUST |

### 9.2 Redirect Engine (FR-REDIRECT)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-REDIRECT-01 | `GET /r/:token` SHALL responder em < 200ms p99 | MUST |
| FR-REDIRECT-02 | Sistema SHALL usar Redis (30s TTL) para cache de grupos disponíveis | MUST |
| FR-REDIRECT-03 | Fill-first: SHALL selecionar grupo com menor `participant_count / capacity` | MUST |
| FR-REDIRECT-04 | SHALL retornar HTTP 302 para `wa_invite_link` do grupo selecionado | MUST |
| FR-REDIRECT-05 | SHALL retornar HTTP 302 para `fallback_url` quando fase está cheia | MUST |
| FR-REDIRECT-06 | SHALL registrar click de forma não-bloqueante (não adiciona latência) | MUST |
| FR-REDIRECT-07 | SHALL excluir grupos com status `archived` ou `full` do algoritmo | MUST |
| FR-REDIRECT-08 | SHALL funcionar sem autenticação (endpoint público) | MUST |

### 9.3 Click Recording (FR-CLICK)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-CLICK-01 | Sistema SHALL registrar: link_id, group_id, clicked_at, ip, user_agent | MUST |
| FR-CLICK-02 | Sistema SHALL detectar device_type (mobile/desktop/tablet) via user_agent | SHOULD |
| FR-CLICK-03 | Sistema SHALL incrementar `dynamic_links.click_count` atomicamente | MUST |
| FR-CLICK-04 | Click recording SHALL ser assíncrono (não bloquear redirect) | MUST |

### 9.4 Analytics (FR-ANALYTICS-LINK)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-ANALYTICS-01 | Analytics endpoint SHALL retornar clicks por dia (últimos 30 dias) | MUST |
| FR-ANALYTICS-02 | SHALL retornar distribuição de clicks por grupo | MUST |
| FR-ANALYTICS-03 | SHALL retornar breakdown por device_type | SHOULD |
| FR-ANALYTICS-04 | SHALL retornar click_count total do link | MUST |

---

## 10. Acceptance Criteria Summary

### ZAP-020 — Link CRUD API

```
POST /api/v1/links com { phaseId, name, fallbackUrl? }
→ HTTP 201 com { id, token, phase_id, name, is_active: true, click_count: 0 }
→ token é único, URL-safe, 16 chars

GET /api/v1/links?projectId=X
→ HTTP 200 com array de links do projeto
→ Inclui click_count de cada link
→ Tenant isolation verificado

PATCH /api/v1/links/:id com { name?, fallbackUrl?, isActive? }
→ HTTP 200 com link atualizado

DELETE /api/v1/links/:id
→ HTTP 200; link não aparece mais na listagem
```

### ZAP-021 — Redirect Engine

```
GET /r/:token (link ativo, grupo disponível)
→ HTTP 302 Location: https://chat.whatsapp.com/XXXXX
→ Latência p99 < 200ms

GET /r/:token (link ativo, fase cheia)
→ HTTP 302 Location: fallback_url configurada

GET /r/:token (link inativo ou não encontrado)
→ HTTP 404

Após redirect:
→ link_clicks contém 1 novo registro
→ dynamic_links.click_count incrementado
```

### ZAP-022 — Click Recording

```
Após GET /r/:token bem-sucedido:
→ link_clicks.group_id = grupo selecionado
→ link_clicks.ip_address = IP do visitante
→ link_clicks.device_type detectado via user_agent
→ link_clicks.clicked_at = timestamp UTC
→ Recording não adiciona latência mensurável ao redirect
```

### ZAP-023 — Analytics Endpoint

```
GET /api/v1/analytics/links/:linkId
→ HTTP 200 com:
  {
    total_clicks: number,
    clicks_by_day: [{ date, count }],  // últimos 30 dias
    clicks_by_group: [{ group_name, count }],
    clicks_by_device: { mobile, desktop, tablet }
  }
→ Tenant isolation verificado (não retorna analytics de outro tenant)
```

### ZAP-024 — Links Page UI

```
GIVEN tenant está na página /projects/:id (Project Detail)
THEN existe aba ou seção "Links de Rastreamento"

WHEN clica em "Novo Link"
THEN abre modal com: nome (opcional), fase target, fallback URL (opcional)
WHEN confirma
THEN POST /api/v1/links → link aparece na lista com token copiável

GIVEN link existe na lista
THEN botão "Copiar" copia URL completa (https://[domain]/r/:token)
THEN toggle ativo/inativo disponível
THEN botão "Analytics" abre modal com métricas

TypeScript: 0 erros em apps/web
```

### ZAP-025 — Analytics Modal UI

```
GIVEN usuário clica em "Analytics" no link card
THEN abre modal com:
  - Total de clicks
  - Gráfico de linha: clicks por dia (últimos 7 dias)
  - Lista: distribuição por grupo (nome + count)
  - Breakdown: mobile / desktop / tablet
WHEN fecha modal
THEN retorna à lista sem alterações
```

---

## 11. Dependencies

| Dependência | Tipo | Status | Story |
|------------|------|--------|-------|
| EPIC-03: grupos com `wa_invite_link` | HARD | ✅ Entregue | ZAP-016 |
| EPIC-03: fases do projeto | HARD | ✅ Entregue | ZAP-012 |
| Redis/Upstash configurado | HARD | ✅ Disponível | ZAP-004 |
| Tabela `dynamic_links` (migration) | HARD | ✅ Aplicada | ZAP-002 |
| Tabela `link_clicks` (migration) | HARD | ✅ Aplicada | ZAP-002 |
| Auth middleware | HARD | ✅ Implementado | ZAP-003 |

> **CRITICAL:** Verificar na migration se `token` tem índice UNIQUE e `link_clicks` tem índice em `link_id + clicked_at`. Performance do redirect depende disso.

---

## 12. Risks

| Risco | Probabilidade | Impacto | Mitigação |
|-------|-------------|---------|-----------|
| Redis indisponível durante redirect | LOW | CRITICAL | Fallback: query Supabase direta (aceita latência > 200ms) |
| wa_invite_link expirado no cache | MEDIUM | HIGH | TTL 30s é curto; grupo marcado como 'full' invalida cache |
| Link token collision | LOW | HIGH | Token 16 chars URL-safe = 62^16 combinações; verificar UNIQUE constraint |
| Alto volume simultâneo de redirects | MEDIUM | MEDIUM | Redis stateless; horizontal scaling transparente |
| Grupos em 'full' permanecem no cache | MEDIUM | HIGH | Cache TTL 30s limita janela; Evolution webhook invalida proativamente |

---

## 13. Success Metrics

| Métrica | Target | Como Medir |
|---------|--------|-----------|
| Redirect p99 latência | < 200ms | Winston logs + Railway metrics |
| Click recording loss rate | < 0.1% | `click_count` vs `link_clicks` COUNT |
| Cache hit rate | > 90% | Redis `INFO stats` |
| Links criados por tenant (30 dias) | > 3 | Analytics query |
| TypeScript 0 erros | 100% | `npm run typecheck` |

---

## 14. Agent Execution Handoff

### Sequência de Implementação

```
Wave 1 (Backend Core):
  ZAP-020: Link CRUD API          → @dev (~5pts)
  ZAP-021: Redirect Engine        → @dev (~8pts) ← MAIS CRÍTICO
  ZAP-022: Click Recording        → @dev (~3pts)

Wave 2 (Backend Analytics + Frontend):
  ZAP-023: Analytics Endpoint     → @dev (~5pts)
  ZAP-024: Links Page UI          → @dev (~5pts)
  ZAP-025: Analytics Modal UI     → @dev (~3pts)
```

### Notas para @dev

1. **ZAP-021 é o mais crítico** — testar latência p99 com `wrk` ou similar
2. **Redis client:** usar `ioredis` ou `@upstash/redis` já configurado no projeto
3. **Token generation:** `nanoid(16)` ou `crypto.randomBytes(12).toString('base64url').slice(0, 16)`
4. **Não usar JWT no redirect endpoint** — é público, sem autenticação
5. **Click recording:** `setImmediate(() => recordClick(data))` — não await
6. **Cache key pattern:** `link:{token}` e `phase_groups:{phaseId}`

### Notas para @qa

- AC mais crítico: ZAP-021 latência p99 < 200ms (testar com Redis cold/warm)
- Verificar que grupos com `status = 'full'` ou `status = 'archived'` são excluídos do fill-first
- Verificar tenant isolation em analytics (um tenant não pode ver clicks de outro)
- TypeScript strict — sem `any`

### CodeRabbit Integration

| Field | Value |
|-------|-------|
| Primary Story Type | Backend (ZAP-020/021/022/023) + Frontend (ZAP-024/025) |
| Primary Executor | @dev |
| QA Gate | @qa |
| Severity Focus | CRITICAL + HIGH |
| Key Checks | Redis cache correctness, fill-first algorithm, tenant isolation, p99 latency |

---

## Story Index

| Story ID | Título | Points | Priority | Wave |
|----------|--------|--------|----------|------|
| ZAP-020 | Link CRUD API (POST, GET, PATCH, DELETE) | 5 | CRITICAL | 1 |
| ZAP-021 | Redirect Engine — GET /r/:token (fill-first + Redis) | 8 | CRITICAL | 1 |
| ZAP-022 | Click Recording assíncrono | 3 | CRITICAL | 1 |
| ZAP-023 | Analytics Endpoint — GET /api/v1/analytics/links/:id | 5 | HIGH | 2 |
| ZAP-024 | Links Page UI (list, create, copy, toggle) | 5 | HIGH | 2 |
| ZAP-025 | Analytics Modal UI (clicks por dia, por grupo, por device) | 3 | HIGH | 2 |
| **Total** | | **29 pts** | | |

---

*Prepared by: Morgan (Product Manager)*
*Validated by: Pax (Product Owner)*
*Source: docs/prd/zap-prd.md §9.5 EPIC-04*
*Next step: `@sm *draft ZAP-020` para iniciar criação das stories*

— Morgan, planejando o futuro 📊
