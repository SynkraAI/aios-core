# Zap — Formal Analysis Document
**Analyst:** Atlas (@analyst) | **Date:** 2026-02-18 | **Version:** 1.0
**Project:** Zap — WhatsApp Automation & Group Funnel SaaS
**Reference Platform:** SendFlow (sendflow.com.br)

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Reference Platform Analysis — SendFlow](#2-reference-platform-analysis--sendflow)
3. [Feature Breakdown](#3-feature-breakdown)
4. [System Modules Identified](#4-system-modules-identified)
5. [User Flow Analysis](#5-user-flow-analysis)
6. [Automation Logic Analysis](#6-automation-logic-analysis)
7. [Technical Requirements](#7-technical-requirements)
8. [Hidden System Logic](#8-hidden-system-logic)
9. [Scalability Considerations](#9-scalability-considerations)
10. [Opportunities and Improvements](#10-opportunities-and-improvements)

---

## 1. EXECUTIVE SUMMARY

### Context

SendFlow is a Brazilian SaaS platform focused on a highly specific niche: **WhatsApp group automation for digital product launches** (lançamentos). It serves producers, affiliates, and digital marketers who sell online courses and infoproducts via platforms like Hotmart and Kiwify, typically priced between R$297–R$2,000.

### Market Opportunity

The Brazilian digital product market moves R$15B+/year. WhatsApp is the dominant communication channel, with 120M+ daily users in Brazil alone. The entire "lançamento" (product launch) strategy revolves around WhatsApp groups as the primary lead nurturing and conversion channel.

SendFlow has validated this market with a real product, paying customers, and official sponsorship at Hotmart FIRE 2024 and 2025 — the largest digital marketing event in Latin America.

### Strategic Thesis for Zap

The market is validated. SendFlow's technical execution has significant gaps:
- Outdated UX/design
- No visual flow builder for complex automations
- Basic AI (no real LLM integration)
- Limited analytics (no funnel analysis, cohort, ML)
- No public API for custom integrations
- Limited mobile experience

**Zap's opportunity:** Build a technically superior platform with modern UX, real AI, visual automation flows, and developer-friendly integrations — all optimized for the Brazilian digital launch market.

### Key Metrics Reference (SendFlow)

| Metric | Value |
|--------|-------|
| Pricing range | R$197–R$997/month |
| WhatsApp connections | 1–5 per plan |
| Team access | 1–5 users per plan |
| Notable integrations | Hotmart, ActiveCampaign, Clint |
| Market events sponsored | Hotmart FIRE 2024, 2025 |
| Guarantee | 14-day money-back |

---

## 2. REFERENCE PLATFORM ANALYSIS — SENDFLOW

### 2.1 Platform Overview

SendFlow (sendflow.com.br) is positioned as "the complete solution for WhatsApp group management in product launches." Its core value proposition centers on eliminating manual, repetitive tasks in the launch workflow — group creation, lead routing, message sending, and post-launch cleanup.

**Positioning statement (inferred):** "You focus on launching, SendFlow handles the WhatsApp infrastructure."

### 2.2 Target Audience

| Persona | Need | Pain Point |
|---------|------|-----------|
| **Produtor Digital** (Course Creator) | Manage hundreds of leads in groups | Manual group creation, forgotten welcome messages |
| **Gestor de Lançamento** (Launch Manager) | Orchestrate multiple launches simultaneously | Tracking across 20+ groups manually |
| **Afiliado** (Affiliate) | Automate engagement without team | No automation → no scale |
| **Gestor de Tráfego** (Traffic Manager) | Prove ROI of traffic to client | No tracking on group entry links |

### 2.3 Core Value Propositions

1. **"Disparos ilimitados"** — Unlimited message sends (no per-message cost, using unofficial WhatsApp Web API)
2. **Criação automática de grupos** — Auto-creation when groups reach capacity
3. **Lead Scoring** — Know which leads are most engaged
4. **SendIA** — 24/7 AI assistant (basic chatbot, not true LLM)
5. **Suporte premium** — VIP support 8am–10pm including weekends/holidays
6. **Anti-ban manual** — Best practices guide included with subscription

### 2.4 Pricing Model

| Plan | Price (BR) | WhatsApp Numbers | Team Users |
|------|-----------|-----------------|------------|
| Lite | ~R$197/month | 1 | 1 |
| Standard | ~R$497/month | 3 | 2 |
| Black | ~R$997/month | 5 | 5 |

**Revenue model:** Monthly SaaS subscription. No per-message fees (critical competitive advantage over official Meta API). Annual plans available with ~40% discount.

### 2.5 Competitive Positioning

**vs. Meta WhatsApp Business API:**
- No per-message cost
- Supports group management (Meta API doesn't support groups)
- No formal approval process required

**vs. generic chatbot platforms (Manychat, Take Blip):**
- Specific to launch funnel use case
- Group-centric (not individual conversation-centric)
- Deeper Hotmart integration

**vs. manual management:**
- Eliminates 10-20 hours/week of manual group work per launch
- Enables simultaneous management of hundreds of groups

### 2.6 Inferred Technology Stack

Based on product behavior, Evolution API patterns, and the Brazilian SaaS ecosystem:

| Component | Likely Technology |
|-----------|-----------------|
| WhatsApp sessions | Baileys (via custom implementation or WPPConnect) |
| Frontend | React or Vue.js (SPA) |
| Backend | Node.js |
| Database | PostgreSQL or MySQL |
| Queuing | Custom or Bull |
| AI (SendIA) | Simple rule-based chatbot or GPT-3.5 |
| Hosting | Brazilian cloud or AWS São Paulo region |

### 2.7 Identified Product Weaknesses

| Area | Weakness | Evidence |
|------|---------|---------|
| UX | Dated interface, complex onboarding | Vocal.media review, user reports |
| AI | Basic keyword/rule matching, not true LLM | Product description avoids specifics |
| Analytics | Limited to counters and bar charts | Screenshot evidence in marketing |
| Automations | Linear sequences only, no branching logic | No mention of conditional flows |
| API | No public API documented | No developer docs found |
| Mobile | Basic app with limited functionality | App store reviews |
| Multi-channel | WhatsApp only | No mention of Telegram/Instagram |

---

## 3. FEATURE BREAKDOWN

### 3.1 Feature Matrix — SendFlow vs Zap MVP vs Zap V1

| Feature | SendFlow | Zap MVP | Zap V1 |
|---------|---------|---------|--------|
| WhatsApp QR connection | ✅ | ✅ | ✅ |
| Multi-number support | ✅ (per plan) | ✅ | ✅ |
| Auto group creation | ✅ | ✅ | ✅ |
| Group import from WA | ✅ | ✅ | ✅ |
| Dynamic invite links | ✅ | ✅ | ✅ |
| Click tracking on links | Basic | ✅ Full | ✅ |
| Fill-first group routing | ✅ | ✅ | ✅ |
| Broadcast to groups | ✅ | ✅ | ✅ |
| Media broadcasts (img/vid/audio) | ✅ | ✅ | ✅ |
| Message scheduling | ✅ | ✅ | ✅ |
| @everyone mention | ✅ | ✅ | ✅ |
| Welcome message automation | ✅ | ✅ | ✅ |
| Automated sequences (timeline) | ✅ | ❌ | ✅ |
| Conditional automation flows | ❌ | ❌ | ❌ (V2) |
| Visual flow builder | ❌ | ❌ | ❌ (V2) |
| Hotmart integration | ✅ | ✅ | ✅ |
| Kiwify integration | Unknown | ❌ | ✅ |
| ActiveCampaign integration | ✅ | ❌ | ✅ |
| Generic webhooks | ✅ | ✅ | ✅ |
| Lead scoring | ✅ (basic) | ❌ | ✅ |
| Lead segmentation/tags | ✅ | ❌ | ✅ |
| Analytics dashboard | Basic | ✅ Core | ✅ Advanced |
| AI Chat assistant | Basic bot | ❌ | ✅ (LLM) |
| Team access | ✅ (per plan) | ❌ | ✅ |
| Anti-ban protection | Manual guide | Rate limiting | Smart rate limiting |
| Mobile app | Basic | ❌ | ❌ (V2) |
| Public API | ❌ | ❌ | ❌ (V2) |
| Multi-channel (Telegram, IG) | ❌ | ❌ | ❌ (V2) |

### 3.2 Feature Priority Rationale

**P0 (MVP — must work to launch):**
- WhatsApp connection, groups, links, broadcasts, Hotmart webhook, analytics
- Without these: product is not functional for any launch scenario

**P1 (V1 — needed for retention and upsell):**
- Sequences, lead scoring, AI chat, multi-number, team access
- Without these: users churn to SendFlow for these specific capabilities

**P2 (V2 — differentiation and moat):**
- Visual flow builder, marketplace, multi-channel, public API
- These create switching costs and a network effect moat

---

## 4. SYSTEM MODULES IDENTIFIED

### Module 1: Identity & Multi-Tenancy

**Purpose:** Isolate each customer's data, configuration, and WhatsApp sessions
**Critical for:** Security, compliance, product packaging (plan limits)

**Components:**
- Authentication (email/password + OAuth)
- Workspace management (tenant isolation)
- User roles within workspace (admin, operator, viewer)
- Plan management (limits enforcement)
- Billing integration

**Key constraint:** Every database record must be scoped to `tenant_id`. RLS enforces this at the database level, not just application level.

---

### Module 2: WhatsApp Session Pool

**Purpose:** Manage WhatsApp Web sessions for each connected number
**Critical for:** All messaging and group operations

**Components:**
- Session lifecycle (create, connect via QR, monitor, disconnect)
- Status monitoring (connected/disconnected/banned)
- Auto-reconnect with exponential backoff
- Health checks and alerting
- Session isolation per tenant

**Key constraint:** Sessions use unofficial WhatsApp Web protocol (via Evolution API / Baileys). This means:
- Sessions can be banned by WhatsApp at any time
- Rate limiting must be enforced to minimize ban risk
- No session can be shared between tenants

---

### Module 3: Group Management

**Purpose:** Create, configure, and monitor WhatsApp groups
**Critical for:** Core product functionality

**Components:**
- Group CRUD (create via WA, import existing)
- Project/phase organization (leads → warm → buyers)
- Capacity management (participant count vs max)
- Participant operations (remove by list, move between groups)
- Invite link generation and refresh

**Key insight:** WhatsApp groups have a 256-participant limit (or 1024 for Communities). The platform must track capacity in real-time and create new groups automatically when approaching limits.

---

### Module 4: Dynamic Link & Tracking

**Purpose:** Route leads to the correct group and track all engagement
**Critical for:** Traffic attribution and group load balancing

**Components:**
- Short link generation with unique tokens
- Fill-first routing algorithm
- Click event recording (IP, user agent, timestamp)
- Group capacity cache (Redis, 30s TTL)
- Fallback URL when all groups are full
- Analytics per link (clicks, conversions)

**Key insight:** This module runs at the edge (sub-50ms latency) and is hit on every lead capture. It must be extremely fast and resilient. Redis caching of available groups is non-negotiable.

---

### Module 5: Messaging & Broadcast Engine

**Purpose:** Send messages to groups at scale with scheduling and rate limiting
**Critical for:** Core automation value

**Components:**
- Broadcast composer (text, image, video, audio, document)
- Job scheduler (immediate or future scheduling)
- BullMQ worker pool with per-session rate limiting
- Progress tracking (real-time via Supabase Realtime)
- Welcome message triggers (participant joined event)
- Mention-all functionality

**Key constraint:** No message can be sent synchronously in the request-response cycle. All sends go through the queue. This is non-negotiable for anti-ban compliance.

---

### Module 6: Automation & Trigger Engine

**Purpose:** Execute actions automatically based on events
**Critical for:** V1 differentiation

**Components:**
- Event bus (participant_joined, purchase_confirmed, refund, score_threshold)
- Rule engine (trigger event + conditions → actions)
- Action executors (send_message, move_participant, apply_tag, start_sequence)
- Webhook inbound processing (Hotmart, Kiwify, generic)
- Sequence engine (timeline of messages with delays)

**Key insight:** The trigger engine is the "brain" of automation. Its design determines how flexible and scalable automations will be. Starting with a simple rule-based system and evolving to a visual flow builder avoids premature complexity.

---

### Module 7: Lead Management & Scoring

**Purpose:** Track, segment, and score leads throughout the funnel
**Critical for:** V1 upsell feature

**Components:**
- Lead record creation (from group entry events)
- Score calculation (event-driven: +points per action)
- Tag management (manual + automated)
- Segmentation queries (filter by score, tag, group, phase)
- Export (CSV for external use)

**Key insight:** Lead scoring without a proper event log is impossible. The `lead_events` table is the foundation — it must be designed with time-series query performance in mind.

---

### Module 8: Analytics & Reporting

**Purpose:** Give users visibility into their launch performance
**Critical for:** Retention and upgrade motivation

**Components:**
- Tenant overview dashboard (total leads, active groups, messages sent)
- Project-level metrics (participants per phase, conversion funnel)
- Link analytics (clicks per day, click-to-join conversion)
- Broadcast reports (delivery status, reach)
- Webhook event log (purchases, refunds by day)

---

### Module 9: Integration Hub

**Purpose:** Connect with external platforms for event-driven automations
**Critical for:** MVP (Hotmart) and V1 (expanded)

**Components:**
- Webhook receiver (per-tenant endpoints)
- HMAC signature validation
- Event parsing per provider (Hotmart, Kiwify, ActiveCampaign)
- Outbound webhooks (notify external systems of events)
- Integration configuration UI

---

### Module 10: AI Chat Assistant (V1)

**Purpose:** Automate 1:1 conversations on the connected WhatsApp number
**Critical for:** V1 differentiation

**Components:**
- Knowledge base builder (FAQ, product info, pricing)
- LLM integration (GPT-4o or Claude as backbone)
- Conversation history per contact
- Handoff detection (when to escalate to human)
- Response quality monitoring

---

## 5. USER FLOW ANALYSIS

### Flow 1: New User Onboarding

```
User discovers Zap (ad, referral, organic)
    ↓
Landing page → Sign up (email + password or Google OAuth)
    ↓
Email verification → First login
    ↓
Onboarding wizard:
  Step 1: Workspace name + slug (e.g., "meu-lancamento.zap.io")
  Step 2: Connect WhatsApp (QR code scan)
  Step 3: Create first project (launch name, product, dates)
  Step 4: Generate first dynamic link
    ↓
Dashboard → Full platform access
```

**Critical success metric:** User connects WhatsApp and gets first link in < 5 minutes.

---

### Flow 2: Launch Setup

```
User creates "Projeto de Lançamento" (Launch Project)
    ↓
Defines phases: [Leads] → [Aquecimento] → [Compradores]
    ↓
Platform creates groups in WhatsApp for each phase
  - "Leads [Nome do Produto] - 1" (capacity: 250)
  - "Aquecimento [Nome do Produto] - 1" (capacity: 250)
  - "Compradores [Nome do Produto] - 1" (capacity: 250)
    ↓
Platform generates dynamic links per phase
  - Link de captação: zap.io/r/abc123 → Leads phase
  - Link de aquecimento: zap.io/r/def456 → Aquecimento phase
    ↓
User configures automations:
  - Welcome message for Leads phase
  - Welcome message for Compradores phase
  - Hotmart webhook: purchase → move Leads → Compradores
    ↓
User copies link de captação → uses in ads, bio, landing page
```

---

### Flow 3: Lead Entry and Routing

```
Lead clicks link (e.g., zap.io/r/abc123)
    ↓
Edge service receives request
    ↓
Redis cache lookup: "available_group:phase_id_leads"
  → Cache HIT: return cached group invite link (< 10ms)
  → Cache MISS: DB query → find group with space → cache result
    ↓
Record click event (async — doesn't block redirect)
  { link_id, ip, user_agent, redirected_to_group_id, timestamp }
    ↓
302 Redirect → WhatsApp group invite link
    ↓
Lead opens WhatsApp → Joins group
    ↓
Evolution API fires webhook: "participant.added"
    ↓
Platform processes event:
  a. Create/update Lead record (phone → lead_id)
  b. Update group.participant_count (increment)
  c. Enqueue welcome message job
  d. Record lead_event: { type: 'group_join', score_delta: +5 }
    ↓
Welcome message sent (2-8 second humanized delay)
```

---

### Flow 4: Broadcast Execution

```
User opens Broadcast Composer
    ↓
Composes message (text, media, @everyone)
    ↓
Selects target: All groups in Leads phase (3 groups, 650 people)
    ↓
Schedules: Tomorrow at 10:00 AM (Brazil timezone)
    ↓
Platform creates broadcast record + message record
    ↓
At 10:00 AM: Scheduler triggers broadcast processing
    ↓
BullMQ job created per target group × message
    ↓
Workers process jobs with rate limiting:
  - Humanized delay: 2-8 seconds between messages
  - Per-session limit: checked before each send
    ↓
Evolution API sends each message
    ↓
Supabase Realtime emits progress events → Frontend updates bar
    ↓
Broadcast marked as "Sent" — summary: 648/650 delivered, 2 failed
```

---

### Flow 5: Purchase Conversion

```
Lead makes purchase on Hotmart
    ↓
Hotmart fires webhook to: POST /api/v1/webhooks/hotmart
  Payload: { event: 'PURCHASE_APPROVED', buyer: { email, phone }, product: {...} }
    ↓
Platform validates HMAC signature
    ↓
Platform finds lead by phone (normalized E.164)
    ↓
TriggerEngine evaluates configured automations:
  Rule: "ON purchase_confirmed → move_to_group(compradores_phase)"
    ↓
Actions executed:
  1. Remove lead from Leads group
  2. Add lead to Compradores group (generate new group invite, send directly)
  3. Send buyer welcome message
  4. Apply tag: "comprador"
  5. Update lead score: +100 (purchase event)
  6. Log webhook_event as processed
    ↓
Dashboard notification: "Nova compra registrada! João Silva → Compradores"
```

---

## 6. AUTOMATION LOGIC ANALYSIS

### 6.1 Trigger System

The automation system operates on an **Event → Condition → Action** pattern:

```
EVENTS (triggers):
  participant_joined  → when a phone joins a group
  participant_left    → when a phone leaves a group
  purchase_confirmed  → Hotmart/Kiwify webhook received
  refund_processed    → Hotmart/Kiwify refund webhook
  score_threshold     → when lead.score crosses a configured value
  sequence_step       → time-based, no external event needed
  message_received    → when someone replies (for AI module, V1)

CONDITIONS (filters):
  lead.tag = "X"
  lead.score >= N
  group.phase = "leads"
  time_since_joined >= Xh

ACTIONS (outputs):
  send_message        → enqueue message job
  move_participant    → remove from group A, add to group B
  apply_tag           → update lead.tags
  remove_tag          → remove tag from lead.tags
  start_sequence      → initialize sequence runner for lead
  send_notification   → notify workspace admin (in-app/email)
  call_webhook        → POST to external URL with lead data
```

### 6.2 Sequence Engine Logic

```
Sequence = ordered list of Steps with delays

Step {
  order: 1
  delay: 0h          (send immediately on sequence start)
  content: "Bem-vindo! Aqui está o conteúdo de hoje..."
}

Step {
  order: 2
  delay: 24h         (send 24 hours after previous step)
  content: "Dia 2: Vídeo especial para você..."
}

Step {
  order: 3
  delay: 48h
  content: "Abertura do carrinho em 2 horas! Acesse..."
}

Sequence Runner (per lead):
  1. Start event triggers sequence for lead
  2. Step 1 enqueued immediately (delay: 0)
  3. Step 2 enqueued with delay: 24h from step 1 sent_at
  4. Step 3 enqueued with delay: 48h from step 2 sent_at
  5. Each step can be cancelled if lead purchases (stop_on_purchase flag)
```

### 6.3 Rate Limiting Strategy

All WhatsApp message sends go through a layered rate limiting system:

```
Layer 1: Request-level (Cloudflare WAF)
  → Max 100 API requests per minute per IP

Layer 2: Tenant-level (API middleware + Redis)
  → Max 1000 broadcast jobs per hour per tenant
  → Configurable per plan

Layer 3: Session-level (BullMQ worker + Redis)
  → Max 500 messages per hour per WhatsApp session
  → Max 3000 messages per day per WhatsApp session
  → Humanized delay: 2-8 seconds between consecutive sends
  → FIFO queue ensures ordering

Layer 4: Circuit breaker (Evolution API health check)
  → If session status = 'banned': pause all jobs for that session
  → Alert tenant: "Your number has been restricted"
  → Attempt automatic reconnect after 1 hour
```

### 6.4 Group Capacity Management

```
Group capacity management is continuous, not just at redirect time:

1. participant_joined event → increment group.participant_count
2. participant_left event → decrement group.participant_count
3. When count reaches (capacity * 0.90):
   → Pre-create next group in phase
   → Refresh invite link cache
4. When count reaches capacity:
   → Mark group as 'full'
   → Redirect cache updated to next group
   → Admin notification: "Grupo X está cheio — Grupo Y criado automaticamente"
```

---

## 7. TECHNICAL REQUIREMENTS

### 7.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|---------|
| FR-01 | System must support multiple users per workspace with role-based access | MVP |
| FR-02 | Each workspace must have isolated WhatsApp sessions | MVP |
| FR-03 | System must create WhatsApp groups automatically without user intervention | MVP |
| FR-04 | Dynamic links must redirect leads to groups with available capacity in < 100ms | MVP |
| FR-05 | All message sends must be async via queue with retry on failure | MVP |
| FR-06 | System must process Hotmart purchase webhooks within 30 seconds of event | MVP |
| FR-07 | Dashboard must show real-time updates without page refresh | MVP |
| FR-08 | System must enforce per-plan limits (connections, groups, broadcasts) | MVP |
| FR-09 | All user data must be isolated per tenant at database level | MVP |
| FR-10 | System must rate-limit message sending to prevent WhatsApp bans | MVP |
| FR-11 | Automated sequences must survive server restarts (persistent queue) | V1 |
| FR-12 | Lead scoring must update in real-time as events occur | V1 |
| FR-13 | AI assistant must respond to messages within 10 seconds | V1 |

### 7.2 Non-Functional Requirements

| Category | Requirement | Target |
|----------|-------------|--------|
| **Performance** | Redirect latency | < 100ms p95 |
| **Performance** | API response time | < 500ms p95 |
| **Performance** | Broadcast throughput | 500 msgs/hour/session |
| **Availability** | Platform uptime | 99.5% (MVP), 99.9% (V1+) |
| **Scalability** | Concurrent tenants | 500 (MVP), 5000 (V1) |
| **Scalability** | WA sessions | 2000 (MVP), 25000 (V1) |
| **Security** | Data isolation | 100% tenant isolation (RLS) |
| **Security** | HMAC validation | All inbound webhooks validated |
| **Compliance** | Data residency | Brazil region (Supabase SA) |
| **Observability** | Error tracking | 100% errors logged with context |
| **Observability** | Queue monitoring | Dead-letter queue alerting |

### 7.3 Integration Requirements

| Platform | Event Type | Required Action |
|---------|-----------|----------------|
| Hotmart | PURCHASE_APPROVED | Move lead to buyers group |
| Hotmart | PURCHASE_REFUNDED | Remove from buyers group |
| Hotmart | PURCHASE_CANCELLED | Remove from buyers group |
| Kiwify (V1) | order.paid | Move lead to buyers group |
| ActiveCampaign (V1) | Contact tagged | Apply tag to lead |
| Generic webhook | Any | Configure custom action |

---

## 8. HIDDEN SYSTEM LOGIC

### 8.1 Lead Identity Resolution

**Problem:** A lead may enter via a link (phone unknown at click time), then join the group (phone revealed), then make a purchase via email. How do we unify these events?

**Solution:**
```
Click event     → link_clicks { ip, user_agent, created_at }
Group join      → group_participants { phone } → Lead created
Hotmart webhook → { buyer.email, buyer.phone }
                → Match by phone (primary) → email (secondary)
                → Merge lead records if multiple exist
```

**Key insight:** Phone number in E.164 format is the golden identifier for WhatsApp-based funnels. Always normalize on input.

### 8.2 Group Invite Link Freshness

**Problem:** WhatsApp invite links expire or get revoked when the group admin resets them.

**Solution:**
```
Platform periodically refreshes invite links (every 24h via scheduled job)
On redirect: check if link was refreshed in last 24h → if not, refresh before redirect
Store refresh_at timestamp on groups table
Alert admin if link refresh fails (group may have been deleted)
```

### 8.3 Participant Count Accuracy

**Problem:** participant_count on the `groups` table can drift from reality if webhook events are missed.

**Solution:**
```
Reconciliation job: runs every 4 hours
  → Calls Evolution API: getGroupParticipants(groupId)
  → Compares API count vs database count
  → If delta > 5: update database, log discrepancy
  → Alert if reconciliation fails 3+ consecutive times
```

### 8.4 Session Recovery After Disconnection

**Problem:** WhatsApp Web sessions disconnect frequently (phone offline, battery, network). The platform must auto-recover without user intervention.

**Solution:**
```
Evolution API fires webhook: connection.update { status: 'disconnected' }
  ↓
Platform receives event
  ↓
Attempt auto-reconnect: exponential backoff (30s, 2m, 5m, 15m, 1h)
  ↓
If reconnected: resume all paused queues for that session
  ↓
If not reconnected after 1 hour:
  → Alert user: "Your WhatsApp number is disconnected — please reconnect"
  → Pause all broadcasts scheduled for that session
  → Queue them for retry after reconnection
```

### 8.5 Anti-Ban Evasion Patterns

**Observed patterns that trigger WhatsApp bans:**
- Sending identical messages to many groups rapidly
- Sending to contacts who have not interacted before
- Mass group joins/removals in short windows
- Accounts with no profile picture or recent activity

**Platform mitigations:**
```
1. Message variation: inject subtle variations (different emoji, word order)
2. Humanized delays: random 2-8s between sends (not uniform intervals)
3. Session warmup: new accounts start with low volume, gradually increase
4. Off-hours limiting: option to only send during business hours (8am-10pm BR)
5. Blocklist: detect banned contacts, stop sending to them
6. Instance health scoring: track ban incidents, alert on pattern
```

### 8.6 Webhook Idempotency

**Problem:** Hotmart and other platforms may send the same webhook event multiple times (retry on failure).

**Solution:**
```
webhook_events table has a unique constraint on (source, external_event_id)
ON INSERT: IF duplicate → log and skip (return 200 to provider)
Processed flag: only execute actions if processed = false
Transaction: mark processed = true and execute actions atomically
```

---

## 9. SCALABILITY CONSIDERATIONS

### 9.1 Primary Bottlenecks

| Bottleneck | Description | Mitigation |
|-----------|-------------|-----------|
| **WhatsApp Sessions** | Each session is a persistent WA Web connection; more sessions = more RAM | Horizontal scaling: more Evolution API pods; session affinity routing |
| **Message throughput** | 500K daily users × 10 msgs = 5M messages/day | BullMQ concurrency tuning; multiple worker pods per queue |
| **Redirect latency** | Every link click hits the redirect service | Redis cache for group lookup; edge deployment; pre-warm cache |
| **Database writes** | Lead events create high write volume | TimescaleDB or ClickHouse for events; Supabase for OLTP |
| **WebSocket connections** | Each dashboard user holds a WS connection | Supabase Realtime handles fan-out; Redis pub/sub for scaling |
| **AI response latency** | LLM calls take 1-5 seconds | Async queue for AI responses; streaming support; local caching |

### 9.2 Data Volume Projections

| Metric | MVP (mo 6) | Year 1 | Year 2 |
|--------|-----------|--------|--------|
| Tenants | 200 | 2,000 | 10,000 |
| WA Sessions | 400 | 6,000 | 40,000 |
| Groups managed | 10,000 | 200,000 | 2,000,000 |
| Daily messages | 500K | 10M | 100M |
| Lead events/day | 1M | 20M | 200M |
| Link clicks/day | 50K | 1M | 10M |

### 9.3 Database Scaling Strategy

```
Phase 1 (MVP — Supabase Pro):
  → PostgreSQL 15 with connection pooling (PgBouncer via Supabase)
  → All entities in single DB, RLS for tenant isolation
  → Indexes on all critical query paths
  → Supabase's built-in 500 connections limit is sufficient

Phase 2 (Growth — Supabase Business or self-hosted):
  → Read replicas for analytics queries
  → Separate analytics schema (time-series optimized)
  → Consider ClickHouse for lead_events and link_clicks (OLAP)
  → Table partitioning on lead_events by created_at (monthly)

Phase 3 (Scale — Self-hosted or managed PostgreSQL):
  → Tenant sharding by account tier
  → Dedicated read replicas per region
  → ClickHouse cluster for all analytics
  → Event streaming via Kafka for high-throughput events
```

### 9.4 WhatsApp Session Scaling

```
MVP: Single Evolution API instance (multi-session mode)
  → Supports ~100-500 concurrent sessions on 2GB RAM
  → 1 Railway service instance

Growth: Horizontal pod scaling
  → Multiple Evolution API services
  → Session-to-pod affinity (via Redis mapping)
  → Load balancer routes requests to correct pod

Scale: Dedicated infrastructure
  → Evolution API cluster per region
  → Geographic routing (sessions in BR region for lower latency)
  → Kubernetes deployment with session affinity ingress
```

### 9.5 Queue Processing Scaling

```
BullMQ Workers (Railway):

MVP:
  message:send   → 1 worker, 5 concurrency
  broadcast:proc → 1 worker, 2 concurrency
  sequence:tick  → 1 worker, 10 concurrency
  trigger:proc   → 1 worker, 20 concurrency

Growth (auto-scale based on queue depth):
  message:send   → 3-10 workers (Railway autoscale)
  broadcast:proc → 2-5 workers
  Total throughput: ~50,000 messages/hour

Scale:
  Kubernetes HPA based on BullMQ queue depth metrics
  Separate worker pools per tenant tier (premium gets priority)
```

---

## 10. OPPORTUNITIES AND IMPROVEMENTS

### 10.1 UX & Product Experience

| Opportunity | Current State (SendFlow) | Zap Improvement |
|-------------|------------------------|-----------------|
| **Onboarding** | Complex, requires manual setup | 3-step guided wizard, < 5min to first link |
| **Design system** | Dated, inconsistent | Modern design system (shadcn/ui + custom tokens) |
| **Mobile experience** | Basic app, limited features | Progressive Web App first, native V2 |
| **Error messages** | Generic, unhelpful | Contextual, actionable error guidance |
| **Empty states** | Blank screens | Guided empty states with next steps |
| **Help system** | External support only | In-app contextual help + interactive walkthroughs |

### 10.2 AI & Intelligence

| Opportunity | SendFlow | Zap |
|-------------|---------|-----|
| **AI Chat** | Rule-based keyword matching | True LLM (GPT-4o/Claude) with conversation memory |
| **Sentiment analysis** | None | Detect negative sentiment → alert operator |
| **Lead scoring** | Manual rules | Event-driven + ML-powered probability score |
| **Content suggestions** | None | AI-powered message content suggestions |
| **Anomaly detection** | None | Detect unusual patterns (ban risk, low engagement) |
| **Optimal send time** | Manual scheduling | AI-predicted optimal send time per audience |

### 10.3 Automation Capabilities

| Opportunity | SendFlow | Zap |
|-------------|---------|-----|
| **Flow complexity** | Linear sequences only | Conditional branching flows |
| **Flow builder** | None | Visual drag-and-drop (V2) |
| **Trigger types** | Basic event types | Rich event set + custom webhooks |
| **A/B testing** | None | A/B test message variants |
| **Flow templates** | None | Marketplace of proven launch flows |

### 10.4 Analytics & Reporting

| Opportunity | SendFlow | Zap |
|-------------|---------|-----|
| **Funnel view** | No | Full funnel: clicks → joins → engaged → purchased |
| **Cohort analysis** | No | Cohort by entry date, source, phase |
| **Revenue attribution** | Basic | Link purchase → first touch attribution |
| **Engagement heatmap** | No | Time-of-day engagement patterns |
| **Predictive analytics** | No | Likelihood-to-purchase score (V2) |
| **Export** | CSV | CSV + Google Sheets integration |

### 10.5 Developer Experience & Integrations

| Opportunity | SendFlow | Zap |
|-------------|---------|-----|
| **Public API** | None documented | Full REST API (OpenAPI/Swagger docs) |
| **Webhooks** | Limited | Rich outbound webhooks for all events |
| **Native integrations** | Hotmart, ActiveCampaign, Clint | Hotmart, Kiwify, Eduzz, ActiveCampaign, HubSpot, Zapier |
| **SDK** | None | JavaScript SDK for custom integrations |

### 10.6 Business Model Opportunities

| Opportunity | Description |
|-------------|-------------|
| **Usage-based pricing** | Charge per group or per 1000 leads managed (not just per connection) |
| **Marketplace revenue** | Template marketplace with revenue share for creators |
| **Agency tier** | Multi-workspace management for launch managers |
| **White-label** | Reseller program for agencies (rebrand the platform) |
| **AI add-on** | Premium AI chat feature as paid add-on to base plans |

### 10.7 Strategic Differentiation Summary

**The three pillars that will differentiate Zap from SendFlow:**

1. **Superior DX and UX** — Modern, fast, intuitive. Onboard in 5 minutes. Design that feels like a premium product.

2. **Real AI, not fake** — GPT-4o-powered chat that actually understands context and adapts. Lead scoring with ML. Content suggestions. Anti-ban intelligence.

3. **Automation depth** — Visual flow builder with conditional logic. A/B testing. Multi-trigger sequences. The automation power of Make/n8n applied specifically to WhatsApp launches.

---

## APPENDIX: KEY REFERENCES

| Source | URL | Data Extracted |
|--------|-----|----------------|
| SendFlow Main | https://sendflow.com.br/ | Core features, positioning, pricing |
| SendFlow ES | https://sendflow.com.br/sendflow-es/ | Detailed features, integrations |
| Evolution API | GitHub (atendai/evolution-api) | WhatsApp session infrastructure |
| Baileys | GitHub (WhiskeySockets/Baileys) | Underlying WA protocol library |
| WhatsApp Stats 2025 | wapikit.com | 120M daily BR users, 3.2B global |
| WATI Brazil Analysis | wati.io | Competitor analysis, market sizing |
| WhatsApp Lead Funnel | wetarseel.ai | Lead routing best practices |
| Banco Mercantil Case | infobip.com | 40% of sales via WhatsApp (BR) |

---

*Document: `docs/analysis/zap-analysis.md`*
*Generated by @analyst (Atlas) — 2026-02-18 — Version 1.0*
