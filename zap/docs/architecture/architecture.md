# Zap — Full-Stack Technical Architecture
**Architect:** Aria | **Data:** 2026-02-18 | **Versão:** 1.0

## 1. ARCHITECTURE OVERVIEW

### Visão Macro do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL ACTORS                                 │
│   Browser User  │  Lead (WhatsApp)  │  Hotmart Webhook  │  Evolution API    │
└────────┬────────┴────────┬──────────┴────────┬──────────┴────────┬──────────┘
         │                 │                   │                   │
┌────────▼─────────────────────────────────────────────────────────▼──────────┐
│                            EDGE / CDN LAYER                                  │
│                    Cloudflare (DDoS, Cache, DNS, WAF)                        │
└────────┬─────────────────────────────────────────────────────────┬──────────┘
         │                                                         │
┌────────▼──────────────────────────┐   ┌───────────────────────────▼────────┐
│         FRONTEND                  │   │         REDIRECT SERVICE            │
│   Next.js 14 (App Router)         │   │   Hono (Edge) — /r/:token           │
│   Vercel / Cloudflare Pages       │   │   Link tracking + group routing     │
│   React 18 + TanStack Query       │   └────────────────────────────────────┘
│   Tailwind + shadcn/ui            │
│   WebSocket Client (Realtime)     │
└────────┬──────────────────────────┘
         │ HTTPS + WebSocket
┌────────▼──────────────────────────────────────────────────────────────────┐
│                          API GATEWAY (Hono / Node.js)                      │
│  Route: /api/v1/*   Auth Middleware   Rate Limiter   Tenant Resolver       │
│  WebSocket: /ws/*   CORS   Request Validation (Zod)   Error Handler        │
└────────┬─────────────────────────┬────────────────────┬────────────────────┘
         │                         │                    │
┌────────▼──────────┐  ┌───────────▼──────────┐  ┌─────▼──────────────────┐
│   CORE API        │  │  AUTOMATION ENGINE    │  │  WEBHOOK SERVICE        │
│   (Hono)          │  │  (BullMQ Workers)     │  │  (Hono)                 │
│   CRUD entities   │  │  Message queues       │  │  Hotmart, Kiwify, etc   │
│   Business logic  │  │  Sequence engine      │  │  Event processing       │
│   Auth (Supabase) │  │  Trigger processor    │  │  Action dispatcher      │
└────────┬──────────┘  └───────────┬──────────┘  └─────┬──────────────────┘
         │                         │                    │
┌────────▼─────────────────────────▼────────────────────▼───────────────────┐
│                           INFRASTRUCTURE LAYER                              │
│                                                                             │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────────────────┐  │
│  │  Supabase         │  │  Redis           │  │  Evolution API Pool       │  │
│  │  PostgreSQL + RLS │  │  (Upstash)       │  │  WhatsApp Sessions        │  │
│  │  Realtime         │  │  BullMQ + Cache  │  │  1 instance / tenant      │  │
│  │  Auth             │  │  Session store   │  │  REST + WebSocket         │  │
│  └──────────────────┘  └─────────────────┘  └───────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

### Princípios Arquiteturais

| Princípio | Decisão |
|-----------|---------|
| **Monolith-first** | Monorepo modular — velocidade de desenvolvimento no MVP |
| **Multi-tenant by design** | `tenant_id` em todas as tabelas + RLS Supabase |
| **Async-first messaging** | Nenhuma mensagem WhatsApp enviada de forma síncrona |
| **Edge tracking** | Redirect service isolado no edge para latência <50ms |
| **Session isolation** | Uma instância Evolution API por tenant |
| **Real-time built-in** | Supabase Realtime + WebSocket para status ao vivo |

---

## 2. TECH STACK

### Stack Completa

| Camada | Tecnologia | Justificativa |
|--------|-----------|--------------|
| **Frontend** | Next.js 14 (App Router) | SSR + RSC + API routes |
| **UI** | Tailwind CSS + shadcn/ui | Utility-first, componentes acessíveis |
| **State** | TanStack Query v5 + Zustand | Server state + client state separados |
| **Forms** | React Hook Form + Zod | Validação tipada end-to-end |
| **Charts** | Recharts | Analytics dashboard |
| **Backend** | Node.js 20 + Hono.js | Edge-ready, TypeScript-first, 5x mais rápido que Express |
| **Validation** | Zod | Schemas compartilhados frontend/backend |
| **Queue** | BullMQ + Redis | Job queues com retry automático |
| **Realtime** | Socket.IO + Supabase Realtime | Status ao vivo |
| **Database** | Supabase (PostgreSQL 15) | Auth built-in, RLS, Realtime |
| **Cache** | Redis (Upstash) | BullMQ + cache de queries |
| **WhatsApp** | Evolution API v2 | Multi-sessão, battle-tested, open source |
| **Email** | Resend | Emails transacionais |
| **Deploy FE** | Vercel | Next.js optimizado |
| **Deploy BE** | Railway | Containers persistentes (Evolution API) |
| **CDN/Edge** | Cloudflare | DNS + WAF + DDoS + cache |

---

## 3. FOLDER STRUCTURE

```
zap/
├── apps/
│   ├── web/                          # Next.js 14 frontend
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/           # Login, register, onboarding
│   │       │   ├── (dashboard)/      # App principal
│   │       │   │   ├── page.tsx
│   │       │   │   ├── connections/
│   │       │   │   ├── projects/
│   │       │   │   │   └── [id]/
│   │       │   │   │       ├── groups/
│   │       │   │   │       ├── links/
│   │       │   │   │       ├── broadcasts/
│   │       │   │   │       └── analytics/
│   │       │   │   ├── settings/
│   │       │   │   └── billing/
│   │       │   └── r/[token]/        # Edge redirect
│   │       ├── components/
│   │       │   ├── ui/
│   │       │   ├── connections/
│   │       │   ├── groups/
│   │       │   ├── broadcasts/
│   │       │   └── analytics/
│   │       ├── hooks/
│   │       ├── stores/               # Zustand
│   │       └── lib/
│   │
│   └── api/                         # Hono backend
│       └── src/
│           ├── index.ts
│           ├── routes/
│           │   ├── auth.ts
│           │   ├── connections.ts
│           │   ├── projects.ts
│           │   ├── groups.ts
│           │   ├── links.ts
│           │   ├── broadcasts.ts
│           │   ├── webhooks.ts
│           │   └── analytics.ts
│           ├── middleware/
│           │   ├── auth.ts
│           │   ├── rate-limit.ts
│           │   └── validate.ts
│           ├── services/
│           │   ├── whatsapp/
│           │   │   ├── session-manager.ts
│           │   │   ├── group-service.ts
│           │   │   └── message-service.ts
│           │   ├── automation/
│           │   │   ├── trigger-engine.ts
│           │   │   ├── sequence-service.ts
│           │   │   └── welcome-service.ts
│           │   └── tracking/
│           │       ├── link-service.ts
│           │       └── analytics-service.ts
│           ├── workers/
│           │   ├── message.worker.ts
│           │   ├── broadcast.worker.ts
│           │   ├── sequence.worker.ts
│           │   └── trigger.worker.ts
│           ├── queues/
│           ├── realtime/
│           └── db/
│
├── packages/
│   ├── types/                        # Shared TypeScript types
│   ├── validators/                   # Shared Zod schemas
│   └── config/                       # Plans, constants
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── docs/
│   ├── architecture/
│   ├── prd/
│   └── stories/
│
├── turbo.json
├── package.json
└── docker-compose.yml
```

---

## 4. DATABASE DESIGN OVERVIEW

### Entidades e Relacionamentos

```
tenants (1)
    ├── (N) users
    ├── (N) whatsapp_connections
    ├── (N) projects
    │       ├── (N) project_phases
    │       │       └── (N) groups
    │       │               └── (N) group_participants
    │       ├── (N) dynamic_links
    │       ├── (N) broadcasts
    │       └── (N) sequences
    │               └── (N) sequence_steps
    ├── (N) leads
    │       └── (N) lead_events
    ├── (N) webhook_configs
    └── (N) integrations
```

### Tabelas Principais

| Tabela | Campos Críticos | Índices |
|--------|----------------|---------|
| `tenants` | id, slug, plan_id, limits_json | slug UNIQUE |
| `whatsapp_connections` | id, tenant_id, phone, status, evolution_instance_id | tenant_id, status |
| `projects` | id, tenant_id, name | tenant_id |
| `groups` | id, tenant_id, project_id, wa_group_id, capacity, participant_count | tenant_id, wa_group_id |
| `group_participants` | id, group_id, lead_id, joined_at, removed_at | group_id, lead_id |
| `leads` | id, tenant_id, phone, name, score, tags[] | tenant_id, phone |
| `lead_events` | id, tenant_id, lead_id, type, metadata, created_at | tenant_id, lead_id, created_at |
| `dynamic_links` | id, tenant_id, token, project_id, click_count | token UNIQUE |
| `link_clicks` | id, link_id, ip, redirected_to, created_at | link_id, created_at |
| `broadcasts` | id, tenant_id, connection_id, status, scheduled_at | tenant_id, status, scheduled_at |
| `webhook_events` | id, tenant_id, source, payload, processed | tenant_id, processed |

### Padrão RLS (Multi-tenancy)

```sql
-- Todas as tabelas têm tenant_id + RLS habilitado
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON groups
  USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

---

## 5. API STRUCTURE

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me

GET    /api/v1/connections
POST   /api/v1/connections
GET    /api/v1/connections/:id/qr          # SSE stream
GET    /api/v1/connections/:id/status

GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
GET    /api/v1/projects/:id/groups
POST   /api/v1/projects/:id/groups
POST   /api/v1/projects/:id/groups/import
DELETE /api/v1/groups/:id/participants

GET    /api/v1/projects/:id/links
POST   /api/v1/projects/:id/links

POST   /api/v1/broadcasts
GET    /api/v1/broadcasts/:id/status

GET    /api/v1/analytics/overview
GET    /api/v1/analytics/projects/:id

POST   /api/v1/webhooks/hotmart
POST   /api/v1/webhooks/:tenantId/generic

GET    /r/:token                           # Edge redirect service
```

---

## 6. SERVICE ARCHITECTURE

### WhatsApp Rate Limiting (Anti-Ban)

```typescript
const MESSAGE_RATE = {
  minDelay: 2000,    // 2s mínimo entre mensagens
  maxDelay: 8000,    // 8s máximo (humanizado)
  maxPerHour: 500,
  maxPerDay: 3000,
}
```

### BullMQ Queues

| Queue | Worker | Propósito |
|-------|--------|---------|
| `message:send` | message.worker.ts | Envio individual |
| `broadcast:proc` | broadcast.worker.ts | Broadcasts em massa |
| `sequence:tick` | sequence.worker.ts | Sequências agendadas |
| `trigger:proc` | trigger.worker.ts | Eventos externos |

### Redirect Algorithm (Fill-First)

```
GET /r/:token
  → Cache lookup (Redis 30s TTL)
  → Query: grupo com mais participantes mas ainda com vagas
  → Record click (async)
  → Redirect 302 → WhatsApp invite link (<50ms target)
```

---

## 7. DEPLOYMENT

### Production Stack

| Serviço | Plataforma | Custo/mês |
|---------|-----------|---------|
| Frontend (Next.js) | Vercel Pro | $20 |
| API + Worker | Railway | $20-30 |
| Evolution API | Railway | $15 |
| Database | Supabase Pro | $25 |
| Redis | Upstash | $0-10 |
| CDN/WAF | Cloudflare | $0 |
| **Total MVP** | | **~$80-100** |

### Scaling Path

```
MVP    (0-500 tenants):  Railway + Supabase Cloud
Growth (500-5k):         Railway autoscale + PgBouncer + Read replicas
Scale  (5k+):            Kubernetes (EKS/GKE) + ClickHouse analytics
```

---

## 8. SECURITY LAYERS

| Camada | Mecanismo |
|--------|-----------|
| Edge | Cloudflare WAF, rate limit por IP, DDoS protection |
| API | JWT validation, tenant resolution, rate limit por tenant |
| Database | RLS policies, service role apenas no backend |
| WhatsApp | Session isolation por tenant, rate limiting anti-ban |
| Webhooks | HMAC signature validation |

---

## 9. ARCHITECTURE DECISION RECORDS

| ADR | Decisão | Motivo |
|-----|---------|--------|
| ADR-01 | Monorepo (Turborepo) | Tipos compartilhados, DX, deploy coordenado |
| ADR-02 | Hono vs Express | Edge-ready, 5x mais rápido, TypeScript-first |
| ADR-03 | Evolution API | Multi-sessão, battle-tested, sem custo por msg |
| ADR-04 | BullMQ vs SQS | Redis-based (já usado), TypeScript-native |
| ADR-05 | Railway vs AWS | 5x mais barato no MVP, sem lock-in |
| ADR-06 | Supabase vs Prisma+PG | Auth + RLS + Realtime built-in |
| ADR-07 | Fill-first routing | Grupos cheios geram escassez percebida → mais conversão |

---

*Gerado por @architect (Aria) — 2026-02-18*
