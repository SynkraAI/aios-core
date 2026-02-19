# Zap — System Architecture Document
**Version:** 1.0 | **Date:** 2026-02-18 | **Author:** @architect (Aria)
**Project:** Zap — WhatsApp Automation & Group Funnel SaaS

---

## TABLE OF CONTENTS

1. [Executive Architecture Summary](#1-executive-architecture-summary)
2. [Tech Stack](#2-tech-stack)
3. [System Components](#3-system-components)
4. [Backend Design](#4-backend-design)
5. [Frontend Design](#5-frontend-design)
6. [Database Schema Overview](#6-database-schema-overview)
7. [Deployment Architecture](#7-deployment-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Architecture Decision Records](#9-architecture-decision-records)

---

## 1. EXECUTIVE ARCHITECTURE SUMMARY

### What is Zap?

Zap is a multi-tenant SaaS platform for WhatsApp automation and group funnel management, targeting digital marketers and infoproduct producers in Brazil. It automates the entire lead lifecycle: capture → group routing → automated messaging → purchase event → group transition.

### Core Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Architecture pattern** | Modular monorepo (Turborepo) | Speed over complexity at MVP scale |
| **Multi-tenancy** | Database-level isolation (RLS) | Security + simplicity over schema-per-tenant |
| **WhatsApp layer** | Evolution API (Baileys-based) | Multi-session, no per-message cost, battle-tested |
| **Messaging** | Async queues (BullMQ) | No synchronous WA calls, rate limiting, retry |
| **Real-time** | Supabase Realtime + Socket.IO | Status updates without polling |
| **Database** | Supabase (PostgreSQL + Auth + RLS) | Auth + multi-tenancy + real-time built-in |

### System Topology

```
                        ┌─────────────────┐
                        │   CLOUDFLARE    │
                        │  WAF · CDN · DNS│
                        └────────┬────────┘
               ┌─────────────────┼─────────────────┐
               │                 │                 │
        ┌──────▼──────┐  ┌───────▼───────┐  ┌─────▼──────┐
        │   VERCEL    │  │   RAILWAY     │  │  SUPABASE  │
        │  Next.js 14 │  │  API + Worker │  │  PostgreSQL│
        │  Frontend   │  │  Evolution    │  │  Auth      │
        │  Edge /r/:t │  │  BullMQ       │  │  Realtime  │
        └─────────────┘  └───────┬───────┘  └────────────┘
                                 │
                          ┌──────▼──────┐
                          │   UPSTASH   │
                          │   Redis     │
                          │  (BullMQ +  │
                          │   Cache)    │
                          └─────────────┘
```

---

## 2. TECH STACK

### 2.1 Complete Stack Reference

#### Frontend

| Technology | Version | Role |
|-----------|---------|------|
| Next.js | 14.x (App Router) | Framework principal — SSR, RSC, routing |
| TypeScript | 5.x | Type safety em toda a aplicação |
| Tailwind CSS | 3.x | Styling utility-first |
| shadcn/ui | latest | Component library (Radix UI + Tailwind) |
| TanStack Query | v5 | Server state management, caching, mutations |
| TanStack Table | v8 | Tabelas de dados performáticas |
| Recharts | 2.x | Gráficos de analytics |
| Zustand | 4.x | Client state (UI apenas, mínimo) |
| React Hook Form | 7.x | Forms performáticos |
| Zod | 3.x | Validação de formulários (schemas compartilhados) |
| Socket.IO Client | 4.x | Real-time connection status e broadcasts |
| date-fns | 3.x | Manipulação de datas |

#### Backend

| Technology | Version | Role |
|-----------|---------|------|
| Node.js | 20 LTS (ESM) | Runtime |
| Hono.js | 4.x | API framework — edge-ready, TypeScript-first |
| TypeScript | 5.x | Type safety |
| Zod | 3.x | Request/response validation |
| BullMQ | 5.x | Job queues — messaging, sequences, triggers |
| Socket.IO | 4.x | WebSocket server para real-time |
| @supabase/supabase-js | 2.x | Database client |
| Resend | 3.x | Emails transacionais |
| winston | 3.x | Structured logging |
| pino | 8.x | Alta performance logging (alternativa) |

#### Infrastructure & Services

| Service | Role | Alternative Considered |
|---------|------|----------------------|
| Supabase | PostgreSQL + Auth + RLS + Realtime | PlanetScale + Clerk |
| Evolution API v2 | WhatsApp session pool | Baileys direto, WA Business API |
| Redis (Upstash) | BullMQ + Cache + Session store | AWS ElastiCache |
| Vercel | Frontend deployment | Cloudflare Pages |
| Railway | Backend + Workers + Evolution API | AWS ECS, Render |
| Cloudflare | DNS + WAF + CDN + DDoS | AWS CloudFront |
| Resend | Emails transacionais | SendGrid, AWS SES |
| Turborepo | Monorepo build system | Nx, Lerna |

### 2.2 Why These Choices

**Hono.js (not Express/Fastify/NestJS):**
- 3-5x faster than Express in benchmarks
- Edge-runtime compatible (Cloudflare Workers, Vercel Edge)
- TypeScript-first with built-in type inference for routes
- 12KB bundle vs Express 200KB+
- Native Zod middleware integration

**Evolution API (not direct Baileys or official Meta API):**
- Battle-tested multi-session management (no session cross-contamination)
- REST API abstraction over raw WebSocket protocol
- Built-in session persistence across restarts
- No per-message cost (vs Meta API $0.04/msg in Brazil)
- Active open-source community (15k+ GitHub stars)

**Supabase (not Prisma + plain PostgreSQL):**
- Auth, RLS, and Realtime built-in — eliminates 3 separate services
- Row Level Security enforces multi-tenancy at database level
- Supabase Realtime provides websocket subscriptions to DB changes
- TypeScript types auto-generated from schema

**BullMQ (not AWS SQS or RabbitMQ):**
- Built on Redis (already in stack for cache)
- TypeScript-native with full type inference
- No additional infrastructure cost
- Supports delayed jobs (essential for sequences)
- Built-in retry with exponential backoff

**Railway (not AWS/GCP for MVP):**
- Evolution API requires persistent containers — rules out serverless
- Railway deploys from Dockerfile in 2 commands
- 5x cheaper than AWS ECS equivalent at MVP scale
- No VPC/IAM/networking configuration overhead
- Clear migration path to Kubernetes when needed

---

## 3. SYSTEM COMPONENTS

### 3.1 Component Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ZAP SYSTEM COMPONENTS                           │
├─────────────────────┬───────────────────────────────────────────────────────┤
│    FRONTEND (Web)   │                    BACKEND                             │
│                     │                                                        │
│  ┌───────────────┐  │  ┌─────────────────────────────────────────────────┐  │
│  │   Dashboard   │  │  │                 API GATEWAY                      │  │
│  │  (Next.js 14) │◄─┼──┤  Hono · Auth Middleware · Rate Limiter          │  │
│  │               │  │  │  Tenant Resolver · Zod Validation · CORS        │  │
│  │  ┌─────────┐  │  │  └──────────┬──────────────┬──────────────┬───────┘  │
│  │  │Realtime │  │  │             │              │              │           │
│  │  │ Client  │  │  │  ┌──────────▼──┐  ┌───────▼──────┐  ┌───▼────────┐  │
│  │  │(Socket) │  │  │  │  CORE API   │  │  AUTOMATION  │  │  WEBHOOK   │  │
│  │  └────┬────┘  │  │  │  Services:  │  │  ENGINE      │  │  SERVICE   │  │
│  └───────┼───────┘  │  │  - Auth     │  │  BullMQ:     │  │  Hotmart   │  │
│          │          │  │  - Groups   │  │  - msg:send  │  │  Kiwify    │  │
│  ┌───────┼───────┐  │  │  - Links    │  │  - broadcast │  │  Generic   │  │
│  │ Edge  │Redir  │  │  │  - Analyts  │  │  - sequence  │  │  webhook   │  │
│  │ /r/:t │oken   │  │  └─────────────┘  │  - trigger   │  └────────────┘  │
│  └───────────────┘  │                   └──────────────┘                   │
└─────────────────────┤  ┌──────────────────────────────────────────────────┐ │
                      │  │           WHATSAPP SESSION POOL                   │ │
                      │  │  Evolution API · Per-tenant isolation             │ │
                      │  │  QR Code · Groups · Messages · Events            │ │
                      │  └──────────────────────────────────────────────────┘ │
                      │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
                      │  │  Supabase    │  │    Redis     │  │  Realtime  │  │
                      │  │  PostgreSQL  │  │   (Upstash)  │  │  (Socket   │  │
                      │  │  Auth + RLS  │  │  BullMQ +    │  │   Server)  │  │
                      │  │  Realtime    │  │  Cache       │  │            │  │
                      │  └──────────────┘  └──────────────┘  └────────────┘  │
                      └────────────────────────────────────────────────────────┘
```

### 3.2 Service Responsibilities

#### API Service (Hono)
- **Responsibility:** HTTP request handling, authentication, CRUD operations, business logic orchestration
- **Port:** 3001
- **Routes:** `/api/v1/*`, `/webhooks/*`, WebSocket upgrade
- **Scales:** Horizontally (stateless, Redis for state)

#### Worker Service (BullMQ)
- **Responsibility:** Async message processing, broadcasts, sequences, trigger evaluation
- **Queues processed:** `message:send`, `broadcast:proc`, `sequence:tick`, `trigger:proc`
- **Scales:** Horizontally (more workers = more concurrency)
- **Critical config:** Per-session rate limiting (2-8s delay between messages)

#### Evolution API Service
- **Responsibility:** WhatsApp Web session management (one instance per tenant)
- **Interface:** REST API + WebSocket events
- **Isolation:** Each tenant gets a named instance (`instance_${tenantId}`)
- **Scales:** Vertically (more RAM = more concurrent sessions)

#### Redirect Edge Service (Next.js Edge Route)
- **Responsibility:** `/r/:token` — track click, find available group, redirect
- **Target latency:** < 50ms (runs at edge, close to user)
- **Logic:** Redis cache lookup → DB query → async click recording → 302 redirect

---

## 4. BACKEND DESIGN

### 4.1 Route Architecture

```
/api/v1/
├── auth/
│   ├── POST   register          # Create account + workspace
│   ├── POST   login             # Email/password login
│   ├── POST   logout            # Invalidate session
│   └── GET    me                # Current user + workspace info
│
├── connections/
│   ├── GET    /                 # List WA connections (tenant)
│   ├── POST   /                 # Create new connection
│   ├── GET    /:id              # Connection details
│   ├── GET    /:id/qr           # QR code stream (SSE)
│   ├── GET    /:id/status       # Live status
│   └── DELETE /:id             # Disconnect + remove
│
├── projects/
│   ├── GET    /                 # List projects
│   ├── POST   /                 # Create project
│   ├── GET    /:id              # Project details + phases
│   ├── PATCH  /:id              # Update project
│   ├── DELETE /:id              # Archive project
│   │
│   └── /:id/
│       ├── groups/
│       │   ├── GET    /         # List groups
│       │   ├── POST   /         # Create group in WA
│       │   └── POST   /import   # Import existing groups
│       │
│       ├── links/
│       │   ├── GET    /         # List dynamic links
│       │   └── POST   /         # Generate new link
│       │
│       ├── broadcasts/
│       │   ├── GET    /         # List broadcasts
│       │   ├── POST   /         # Create/schedule broadcast
│       │   └── GET    /:id/status # Live progress
│       │
│       └── analytics/
│           ├── GET    /overview  # Project metrics summary
│           ├── GET    /clicks    # Link click timeline
│           └── GET    /groups    # Participants per group
│
├── groups/
│   └── /:id/
│       ├── GET    participants   # List participants
│       └── DELETE participants  # Remove by phone list
│
├── links/
│   └── /:id/
│       └── GET    analytics     # Click analytics for link
│
├── analytics/
│   └── GET    /overview         # Tenant-wide metrics
│
└── webhooks/
    ├── POST   /hotmart           # Hotmart events
    ├── POST   /kiwify            # Kiwify events (V1)
    └── POST   /:tenantId/custom  # Generic webhook

/r/:token                        # Edge redirect (not under /api)
```

### 4.2 Middleware Stack

```typescript
// Applied in order for every /api/v1/* request

app.use('/api/v1/*',
  cors(corsConfig),              // 1. CORS headers
  requestId(),                   // 2. X-Request-ID header
  logger(),                      // 3. Structured request logging
  rateLimit(rateLimitConfig),    // 4. Per-IP rate limiting (Cloudflare)
  jwtAuth(),                     // 5. JWT validation → ctx.user
  tenantResolver(),              // 6. Resolve tenant from JWT → ctx.tenant
  tenantRateLimit(),             // 7. Per-tenant rate limiting
  validatePlanLimits(),          // 8. Check plan limits (connections, groups, etc.)
)
```

### 4.3 WhatsApp Session Manager

```typescript
// apps/api/src/services/whatsapp/session-manager.ts

export class SessionManager {
  private evolutionBaseUrl: string
  private evolutionApiKey: string

  // Create isolated instance per tenant
  async createInstance(tenantId: string): Promise<{ instanceName: string }> {
    const instanceName = `zap_${tenantId}`
    await this.evolutionClient.post('/instance/create', {
      instanceName,
      token: generateInstanceToken(tenantId),
      qrcode: true,
    })
    return { instanceName }
  }

  // Stream QR code via SSE until connected or timeout
  async *streamQRCode(instanceName: string): AsyncIterable<QRCodeEvent> {
    // Polls Evolution API /instance/fetchInstances
    // Emits { type: 'qr', code: base64 } or { type: 'connected' }
  }

  // Group operations
  async createGroup(instanceName: string, config: CreateGroupConfig): Promise<WAGroup>
  async getGroupInviteLink(instanceName: string, groupId: string): Promise<string>
  async removeParticipants(instanceName: string, groupId: string, phones: string[]): Promise<void>

  // Messaging (always via queue — never called directly from route handlers)
  async enqueueMessage(job: MessageJob): Promise<void> {
    await messageQueue.add('message:send', job, {
      delay: calculateHumanizedDelay(), // 2000-8000ms
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    })
  }
}
```

### 4.4 Automation Engine

```typescript
// Trigger → Action pipeline

// 1. External event arrives (webhook, WA event)
// 2. Event published to trigger:proc queue
// 3. TriggerWorker evaluates configured automations
// 4. Matching actions enqueued to appropriate queues

interface AutomationRule {
  tenantId: string
  projectId: string
  trigger: {
    event: 'participant_joined' | 'purchase_confirmed' | 'refund_processed'
    conditions?: Condition[]
  }
  actions: Array<
    | { type: 'send_message'; config: MessageConfig }
    | { type: 'move_to_group'; config: { targetPhaseId: string } }
    | { type: 'apply_tag'; config: { tag: string } }
    | { type: 'start_sequence'; config: { sequenceId: string } }
  >
}

// Hotmart webhook processing
async function processHotmartEvent(payload: HotmartPayload, tenantId: string) {
  // Validate HMAC signature
  validateSignature(payload, process.env.HOTMART_SECRET)

  const lead = await findLeadByContact({
    email: payload.data.buyer.email,
    phone: payload.data.buyer.phone,
    tenantId,
  })

  // Enqueue trigger for processing
  await triggerQueue.add('trigger:proc', {
    type: 'purchase_confirmed',
    tenantId,
    leadId: lead.id,
    productId: payload.data.product.id,
    metadata: payload.data,
  })
}
```

### 4.5 BullMQ Queue Configuration

```typescript
// apps/api/src/queues/index.ts

import { Queue, Worker, QueueEvents } from 'bullmq'
import { redis } from '../db/redis'

const connection = redis

// Queue definitions
export const messageQueue = new Queue('message:send', { connection })
export const broadcastQueue = new Queue('broadcast:proc', { connection })
export const sequenceQueue = new Queue('sequence:tick', { connection })
export const triggerQueue = new Queue('trigger:proc', { connection })

// Worker concurrency per queue
const CONCURRENCY = {
  'message:send': 5,     // 5 parallel message sends per worker instance
  'broadcast:proc': 2,   // 2 parallel broadcasts (resource intensive)
  'sequence:tick': 10,   // 10 sequence steps in parallel
  'trigger:proc': 20,    // 20 trigger evaluations in parallel
}

// Message send worker with rate limiting
export const messageWorker = new Worker('message:send', async (job) => {
  const { instanceName, to, message, tenantId } = job.data

  // Per-session rate limit check
  await checkSessionRateLimit(instanceName, tenantId)

  // Send via Evolution API
  await evolutionClient.sendMessage(instanceName, to, message)

  // Update broadcast progress in Supabase (triggers Realtime to frontend)
  await updateBroadcastProgress(job.data.broadcastId)

}, { connection, concurrency: CONCURRENCY['message:send'] })
```

---

## 5. FRONTEND DESIGN

### 5.1 Application Structure

```
apps/web/src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (fonts, providers)
│   ├── (auth)/                       # Auth pages (no sidebar)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── onboarding/
│   │       ├── page.tsx              # Step 1: Workspace name/slug
│   │       ├── connect/page.tsx      # Step 2: QR code scan
│   │       └── project/page.tsx      # Step 3: First project
│   │
│   ├── (dashboard)/                  # Protected app
│   │   ├── layout.tsx                # Sidebar + Header + RT provider
│   │   ├── page.tsx                  # Overview: all project metrics
│   │   ├── connections/
│   │   │   ├── page.tsx              # Connection cards + status badges
│   │   │   └── new/page.tsx          # QR code flow (SSE stream)
│   │   ├── projects/
│   │   │   ├── page.tsx              # Project list + create CTA
│   │   │   ├── new/page.tsx          # Project wizard
│   │   │   └── [id]/
│   │   │       ├── layout.tsx        # Tab navigation
│   │   │       ├── page.tsx          # Project overview
│   │   │       ├── groups/
│   │   │       │   ├── page.tsx      # Groups + capacity bars
│   │   │       │   └── [gid]/page.tsx
│   │   │       ├── links/
│   │   │       │   └── page.tsx      # Dynamic links + click chart
│   │   │       ├── broadcasts/
│   │   │       │   ├── page.tsx      # Broadcast history + status
│   │   │       │   └── new/page.tsx  # Compose + schedule
│   │   │       └── analytics/
│   │   │           └── page.tsx      # Full project analytics
│   │   ├── settings/
│   │   │   ├── page.tsx              # Workspace settings
│   │   │   ├── integrations/
│   │   │   │   └── page.tsx          # Hotmart, webhooks config
│   │   │   └── billing/
│   │   │       └── page.tsx          # Plan + usage + upgrade
│   │   └── ...
│   │
│   └── r/[token]/
│       └── route.ts                  # Edge runtime redirect (no React)
│
├── components/
│   ├── ui/                           # shadcn/ui base components
│   ├── layout/
│   │   ├── sidebar.tsx               # Navigation sidebar
│   │   ├── header.tsx                # Top bar + workspace switcher
│   │   └── page-header.tsx           # Page title + actions
│   ├── connections/
│   │   ├── connection-card.tsx       # Status card with live badge
│   │   ├── qr-scanner.tsx            # QR code display (SSE)
│   │   └── connection-status.tsx     # Realtime status indicator
│   ├── groups/
│   │   ├── group-card.tsx            # Group with capacity progress bar
│   │   ├── groups-grid.tsx           # Responsive grid of groups
│   │   └── participant-list.tsx      # Participants table
│   ├── broadcasts/
│   │   ├── broadcast-composer.tsx    # Message editor with media
│   │   ├── broadcast-scheduler.tsx   # Date/time picker
│   │   └── broadcast-progress.tsx    # Real-time progress bar
│   └── analytics/
│       ├── metrics-overview.tsx      # KPI cards
│       ├── clicks-chart.tsx          # Line chart (Recharts)
│       └── groups-chart.tsx          # Bar chart
│
├── hooks/
│   ├── use-realtime.ts               # Supabase Realtime subscription
│   ├── use-connection-status.ts      # Live connection status
│   ├── use-broadcast-progress.ts     # Live broadcast progress
│   └── use-tenant.ts                 # Current tenant context
│
├── stores/
│   └── ui.store.ts                   # Zustand: sidebar, active project, drafts
│
├── lib/
│   ├── api.ts                        # Type-safe API client (fetch wrapper)
│   ├── supabase.ts                   # Supabase browser client
│   └── utils.ts                      # cn(), formatDate(), etc
│
└── types/
    └── index.ts                      # Frontend-specific types
```

### 5.2 State Management Strategy

```typescript
// SERVER STATE — TanStack Query (all API data)
// Never duplicate in Zustand — single source of truth

const { data: connections, isLoading } = useQuery({
  queryKey: ['connections', tenantId],
  queryFn: () => api.connections.list(),
  staleTime: 30_000,           // 30s before refetch
  refetchOnWindowFocus: true,
})

// Mutations with optimistic updates
const createGroup = useMutation({
  mutationFn: api.groups.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['groups', projectId] })
  },
})

// CLIENT STATE — Zustand (UI state only)
// Only state that doesn't need to persist or sync with server

interface UIStore {
  sidebarCollapsed: boolean
  activeProjectId: string | null
  broadcastComposerOpen: boolean
  toggle: (key: keyof UIStore) => void
}

// REAL-TIME — Supabase Realtime (live DB changes)

function useRealtimeConnections() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('connections')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'whatsapp_connections',
        filter: `tenant_id=eq.${tenantId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['connections'] })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId])
}
```

### 5.3 Key UI Patterns

**QR Code Connection Flow:**
```
User clicks "Connect number"
  → Opens dialog with QR placeholder
  → SSE connection to GET /api/v1/connections/:id/qr
  → Server streams { type: 'qr', code: base64 } events
  → Frontend renders QR image, refreshes every 30s
  → On { type: 'connected' } → close dialog, show success toast
  → Query cache invalidated → connection card shows "Online"
```

**Broadcast Composer:**
```
Textarea (text) + MediaUpload (image/video/audio/doc)
  → Preview panel (shows how message will look)
  → Target selector: All groups in project | Specific groups | By phase
  → Schedule: Now | Custom date/time
  → Submit → POST /api/v1/broadcasts
  → Redirect to broadcast detail with progress bar (Realtime)
```

**Dynamic Link Dashboard:**
```
Link card: short URL + copy button + QR code + click count
  → Line chart: clicks per day (last 30 days)
  → Bar chart: entries per group (from link)
  → Alert: "Group 2 is 90% full — Group 3 will open automatically"
```

---

## 6. DATABASE SCHEMA OVERVIEW

> Full DDL to be defined by @data-engineer. This section covers entities, relationships, critical indexes, and patterns.

### 6.1 Entity Relationship Overview

```
tenants
  │ id (UUID PK)
  │ slug (UNIQUE)
  │ name
  │ plan_id → plans.id
  │ limits (JSONB: max_connections, max_groups, max_broadcasts_per_month)
  │ created_at
  │
  ├──[1:N]── users
  │            id, tenant_id, email, role (admin|operator|viewer), auth_user_id
  │
  ├──[1:N]── whatsapp_connections
  │            id, tenant_id, phone, display_name
  │            evolution_instance_id (VARCHAR, unique per tenant)
  │            status (ENUM: connecting|connected|disconnected|banned)
  │            last_seen_at
  │
  ├──[1:N]── projects
  │            id, tenant_id, name, description, status, connection_id
  │            │
  │            ├──[1:N]── project_phases
  │            │            id, project_id, name, order, capacity_per_group
  │            │            │
  │            │            └──[1:N]── groups
  │            │                         id, tenant_id, project_id, phase_id
  │            │                         wa_group_id (VARCHAR)
  │            │                         wa_invite_link (TEXT)
  │            │                         name, capacity, participant_count
  │            │                         status (ENUM: active|full|archived)
  │            │                         │
  │            │                         └──[1:N]── group_participants
  │            │                                      id, group_id, lead_id
  │            │                                      phone, joined_at, removed_at
  │            │
  │            ├──[1:N]── dynamic_links
  │            │            id, tenant_id, project_id, phase_id
  │            │            token (VARCHAR UNIQUE — used in /r/:token)
  │            │            short_url, click_count, active
  │            │            fallback_url
  │            │
  │            ├──[1:N]── broadcasts
  │            │            id, tenant_id, project_id, connection_id
  │            │            name, status (ENUM: draft|scheduled|sending|sent|failed)
  │            │            target_type (ENUM: all_groups|specific_groups|phase)
  │            │            target_ids (UUID[])
  │            │            scheduled_at, started_at, completed_at
  │            │            total_count, sent_count, failed_count
  │            │            │
  │            │            └──[1:N]── broadcast_messages
  │            │                         id, broadcast_id, order
  │            │                         content_type (ENUM: text|image|video|audio|document)
  │            │                         content (JSONB: text | { url, caption, filename })
  │            │
  │            └──[1:N]── automation_rules
  │                         id, tenant_id, project_id, name, active
  │                         trigger_event, trigger_conditions (JSONB)
  │                         actions (JSONB[])
  │
  ├──[1:N]── leads
  │            id, tenant_id
  │            phone (VARCHAR — normalized E.164 format)
  │            name, email, score (INTEGER default 0)
  │            tags (TEXT[])
  │            source_link_id → dynamic_links.id
  │            first_seen_at, last_active_at
  │            │
  │            └──[1:N]── lead_events
  │                         id, tenant_id, lead_id
  │                         type (ENUM: link_click|group_join|group_leave|purchase|refund|message_sent|sequence_step)
  │                         score_delta (INTEGER)
  │                         metadata (JSONB)
  │                         created_at
  │
  ├──[1:N]── webhook_events
  │            id, tenant_id
  │            source (ENUM: hotmart|kiwify|generic)
  │            payload (JSONB)
  │            signature_valid (BOOLEAN)
  │            processed (BOOLEAN)
  │            actions_taken (JSONB[])
  │            received_at, processed_at
  │
  └──[1:N]── link_clicks
               id, link_id (→ dynamic_links.id), tenant_id
               ip (INET), user_agent
               redirected_to_group_id
               created_at
```

### 6.2 Critical Indexes

```sql
-- 1. REDIRECT SERVICE: Find group with space (hit on every link click)
CREATE INDEX idx_groups_available ON groups (phase_id, participant_count, capacity)
  WHERE status = 'active' AND removed_at IS NULL;

-- 2. WEBHOOK: Find lead by phone (hit on every purchase event)
CREATE INDEX idx_leads_phone ON leads (tenant_id, phone);

-- 3. BROADCAST WORKER: Find scheduled broadcasts to process
CREATE INDEX idx_broadcasts_scheduled ON broadcasts (scheduled_at, status)
  WHERE status = 'scheduled';

-- 4. LEAD SCORING: Aggregate events for score calculation
CREATE INDEX idx_lead_events_scoring ON lead_events (lead_id, type, created_at DESC);

-- 5. ANALYTICS: Time-series queries for charts
CREATE INDEX idx_link_clicks_time ON link_clicks (link_id, created_at DESC);
CREATE INDEX idx_lead_events_tenant_time ON lead_events (tenant_id, created_at DESC);

-- 6. TENANT ISOLATION: All foreign key lookups are tenant-scoped
-- (These are created via RLS policies implicitly + explicit FK indexes)
```

### 6.3 RLS Policy Pattern

```sql
-- Pattern applied to ALL tables with tenant_id

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- User access: only own tenant data
CREATE POLICY "users_own_tenant" ON leads
  FOR ALL
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Service role: full access (used by backend workers)
-- No policy needed — service role bypasses RLS

-- Webhook service: insert-only for webhook_events
CREATE POLICY "webhook_insert" ON webhook_events
  FOR INSERT
  WITH CHECK (true); -- Validated at application level by HMAC
```

### 6.4 Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Lead identity | Phone (E.164 normalized) | WhatsApp is phone-centric, no email required |
| Score | Denormalized on leads table | Fast reads for segmentation queries |
| Group capacity | Denormalized `participant_count` | Avoids COUNT(*) on every redirect |
| Webhook payloads | JSONB (not parsed columns) | Schema varies by provider; parse at query time |
| Timestamps | All in UTC | Avoid timezone conversion bugs |
| Soft deletes | `removed_at` for participants | Preserve history for analytics |

---

## 7. DEPLOYMENT ARCHITECTURE

### 7.1 Environment Configuration

| Environment | Domain | Purpose |
|-------------|--------|---------|
| Development | localhost:3000 / :3001 | Local dev (Docker Compose) |
| Staging | staging.app.zap.io | Pre-production testing |
| Production | app.zap.io | Live users |

### 7.2 Production Infrastructure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLOUDFLARE                                      │
│  DNS (zap.io)  │  WAF Rules  │  DDoS L3/L4  │  Cache (static assets)       │
│  Rate limit per IP  │  Bot detection  │  SSL termination                     │
└───────────────────────────────────────────────────────────────────────────┬─┘
                                                                            │
                          ┌─────────────────────────────────────────────────┘
                          │
              ┌───────────┼────────────────────────────────┐
              │           │                                │
    ┌─────────▼─────┐  ┌──▼──────────────────────────┐  ┌─▼────────────┐
    │     VERCEL     │  │          RAILWAY             │  │   SUPABASE   │
    │                │  │                              │  │   CLOUD      │
    │  Next.js App   │  │  ┌────────────────────────┐ │  │              │
    │  (SSR + RSC)   │  │  │   api service          │ │  │  PostgreSQL  │
    │                │  │  │   Hono + Socket.IO     │ │  │  + Auth      │
    │  Edge Routes:  │  │  │   PORT 3001            │ │  │  + Realtime  │
    │  /r/[token]    │  │  │   RAM: 512MB           │ │  │              │
    │  (Redirect)    │  │  └────────────────────────┘ │  │  Region: SA  │
    │                │  │  ┌────────────────────────┐ │  │  (São Paulo) │
    │  Region: Auto  │  │  │   worker service       │ │  │              │
    │  (Edge CDN)    │  │  │   BullMQ consumers     │ │  └──────────────┘
    └────────────────┘  │  │   PORT: internal       │ │
                        │  │   RAM: 512MB           │ │  ┌──────────────┐
                        │  └────────────────────────┘ │  │   UPSTASH    │
                        │  ┌────────────────────────┐ │  │   REDIS      │
                        │  │   evolution service    │ │  │              │
                        │  │   Evolution API v2     │ │  │  BullMQ      │
                        │  │   PORT 8080            │ │  │  + Cache     │
                        │  │   RAM: 1-2GB           │ │  │  + Sessions  │
                        │  │   Volume: persistent   │ │  │              │
                        │  └────────────────────────┘ │  └──────────────┘
                        └──────────────────────────────┘
                                                           ┌──────────────┐
                                                           │    RESEND    │
                                                           │  Transact.   │
                                                           │  Email       │
                                                           └──────────────┘
```

### 7.3 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.9'

services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    env_file:
      - .env.local
    depends_on:
      - redis
      - evolution
    volumes:
      - ./apps/api/src:/app/src
    command: npm run dev

  worker:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.dev
    env_file:
      - .env.local
    depends_on:
      - redis
      - evolution
    volumes:
      - ./apps/api/src:/app/src
    command: npm run worker:dev

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  evolution:
    image: atendai/evolution-api:v2-latest
    ports:
      - "8080:8080"
    environment:
      SERVER_TYPE: http
      SERVER_PORT: 8080
      DATABASE_CONNECTION_URI: ${EVOLUTION_DB_URL}
      DATABASE_CONNECTION_CLIENT_NAME: evolution_v2
      REDIS_URI: redis://redis:6379
      AUTHENTICATION_TYPE: apikey
      AUTHENTICATION_API_KEY: ${EVOLUTION_API_KEY}
      LOG_LEVEL: ERROR
    volumes:
      - evolution_instances:/evolution/instances
    depends_on:
      - redis

volumes:
  redis_data:
  evolution_instances:
```

### 7.4 Railway Deployment Configuration

```toml
# railway.toml (api service)
[build]
builder = "DOCKERFILE"
dockerfilePath = "apps/api/Dockerfile"

[deploy]
startCommand = "node dist/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[[services]]
name = "api"
source = "."
healthcheck = "/health"
port = 3001

[[services]]
name = "worker"
source = "."
startCommand = "node dist/workers/index.js"
```

### 7.5 Cost Projection by Stage

| Service | MVP (<500 users) | Growth (500-5k) | Scale (5k+) |
|---------|-----------------|-----------------|-------------|
| Vercel | $20/mo (Pro) | $20/mo | $40+/mo |
| Railway API | $10/mo | $20-50/mo | Kubernetes |
| Railway Worker | $10/mo | $20-50/mo | Kubernetes |
| Railway Evolution | $15/mo | $30-100/mo | Dedicated |
| Supabase | $25/mo (Pro) | $25-100/mo | Enterprise |
| Upstash Redis | $0-10/mo | $10-50/mo | Dedicated |
| Cloudflare | $0 | $0-20/mo | $20+/mo |
| Resend | $0-20/mo | $20-100/mo | $100+/mo |
| **TOTAL** | **~$80-100/mo** | **~$150-400/mo** | **$500+/mo** |

### 7.6 Scaling Milestones

```
MVP Phase (0-500 tenants, ~5k WA sessions):
  Infrastructure as defined above
  Manual monitoring + alerts via Uptime Robot

Growth Phase (500-5k tenants, ~50k WA sessions):
  → Evolution API: horizontal scaling (multiple Railway services)
  → PostgreSQL: add PgBouncer connection pooling
  → Add read replicas for analytics queries
  → Consider ClickHouse for analytics (separate from OLTP)

Scale Phase (5k+ tenants):
  → Migrate to Kubernetes (EKS or GKE)
  → Evolution API: dedicated cluster per tenant tier
  → Multi-region deployment (Brazil + US)
  → Dedicated Redis cluster (not Upstash)
  → CDN for media files (WhatsApp images/videos cached)
```

---

## 8. SECURITY ARCHITECTURE

### 8.1 Defense Layers

| Layer | Controls |
|-------|---------|
| **Network edge** | Cloudflare WAF, DDoS protection, IP rate limiting, bot score filtering |
| **API gateway** | JWT validation, request signing, per-tenant rate limits, CORS |
| **Application** | Input validation (Zod), business rule enforcement, audit logging |
| **Database** | RLS policies (tenant isolation), encrypted at rest, parameterized queries only |
| **WhatsApp** | Session isolation per tenant, rate limiting anti-ban, no shared sessions |
| **Webhooks** | HMAC-SHA256 signature validation, replay attack prevention (timestamp check) |
| **Secrets** | Environment variables via Railway/Vercel secrets manager, never in code |

### 8.2 Authentication Flow

```
1. User registers → Supabase Auth creates user
2. Backend creates tenant record → associates user
3. Custom JWT claims set: { sub, tenant_id, role, plan_id }
4. JWT signed with Supabase JWT secret (RS256)
5. All API requests include: Authorization: Bearer <jwt>
6. API middleware:
   a. Validates JWT signature
   b. Checks expiration
   c. Extracts tenant_id from claims
   d. Sets ctx.user and ctx.tenant
7. Supabase RLS uses auth.jwt() → tenant_id for all DB queries
8. Backend service role (for workers/webhooks) bypasses RLS via service_role key
```

### 8.3 WhatsApp Anti-Ban Strategy

```typescript
// Humanized delay between messages
function calculateDelay(): number {
  return Math.floor(Math.random() * (8000 - 2000 + 1)) + 2000 // 2-8 seconds
}

// Per-session daily limits (enforced in Redis)
const LIMITS = {
  messagesPerHour: 500,
  messagesPerDay: 3000,
  groupsCreatedPerDay: 20,
  broadcastsPerDay: 5,
}

// Circuit breaker: if session gets banned, pause all operations
async function checkSessionHealth(instanceName: string) {
  const status = await evolutionClient.getStatus(instanceName)
  if (status === 'banned') {
    await alertTenant(instanceName) // notify user
    await pauseAllJobs(instanceName) // stop queue processing
    throw new SessionBannedError(instanceName)
  }
}
```

---

## 9. ARCHITECTURE DECISION RECORDS

| # | Decision | Alternatives | Rationale |
|---|----------|-------------|-----------|
| ADR-01 | Monorepo (Turborepo) over multi-repo | Nx, separate repos | Shared types eliminate type drift; coordinated deploys; single CI |
| ADR-02 | Hono.js over Express/NestJS | Fastify, Express, NestJS | Edge-ready, 5x faster, minimal overhead, TypeScript-native |
| ADR-03 | Evolution API over raw Baileys | Direct Baileys, Meta Business API | REST abstraction, session persistence, battle-tested multi-tenant |
| ADR-04 | BullMQ over SQS/RabbitMQ | AWS SQS, RabbitMQ, Inngest | Redis already in stack; TypeScript-native; delayed jobs; no extra cost |
| ADR-05 | Railway over AWS/GCP | ECS Fargate, Cloud Run, Render | 5x cheaper MVP; no IaC overhead; Evolution needs persistent containers |
| ADR-06 | Supabase over Prisma+RDS | PlanetScale, Neon, Firebase | Auth + RLS + Realtime built-in; eliminates 3 separate service integrations |
| ADR-07 | Fill-first routing | Round-robin, random | Fuller groups create perceived scarcity → higher conversion psychology |
| ADR-08 | Phone as lead identifier | Email, UUID | WhatsApp is phone-native; no email required to join group |
| ADR-09 | JSONB for webhook payloads | Typed columns | Providers have different schemas; JSONB flexible, queryable |
| ADR-10 | Per-tenant Evolution instances | Shared pool | Session isolation prevents cross-tenant data leaks; simpler debugging |

---

## NEXT STEPS FOR IMPLEMENTATION

| Priority | Agent | Action | Output |
|----------|-------|--------|--------|
| P0 | `@devops` | Provision Railway + Supabase + Vercel + Upstash | Environments ready |
| P0 | `@data-engineer` | Create detailed SQL schema + migrations | `supabase/migrations/` |
| P1 | `@sm` | Create stories for Sprint 0 (infra) + Sprint 1 (EPIC-01) | `docs/stories/` |
| P1 | `@dev` | Initialize monorepo (Turborepo + Next.js + Hono) | Working scaffold |
| P2 | `@dev` | Implement EPIC-01: Auth + Workspace | Auth working |
| P2 | `@dev` | Implement EPIC-02: WhatsApp Connection | QR code flow working |

---

*Document: `docs/architecture/system-architecture.md`*
*Generated by @architect (Aria) — 2026-02-18 — Version 1.0*
