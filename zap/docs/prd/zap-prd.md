# Product Requirements Document — Zap Platform
**Version:** 1.0
**Status:** Approved for Engineering
**Date:** 2026-02-18
**Owner:** Product Team
**Classification:** Internal — Confidential

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Product Vision & Goals](#4-product-vision--goals)
5. [MVP Scope](#5-mvp-scope)
6. [Feature Breakdown](#6-feature-breakdown)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Product Backlog](#9-product-backlog)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Success Metrics](#11-success-metrics)
12. [Out of Scope](#12-out-of-scope)
13. [Dependencies & Constraints](#13-dependencies--constraints)
14. [Glossary](#14-glossary)

---

## 1. Executive Summary

**Zap** is a B2B SaaS platform that enables Brazilian digital product creators ("infoprodutores") to automate WhatsApp group management for product launches and community building.

The platform orchestrates multi-phase group funnels — from lead capture through dynamic tracking links to purchase confirmation via webhook integrations — replacing hours of manual group management with automated, rule-based flows.

**Reference Market:** SendFlow (sendflow.com.br) — validated product in BR market with product gaps that Zap addresses.

**Core Value Proposition:**
- Automated lead routing into WhatsApp groups via fill-first algorithm
- Real-time group funnel visibility and analytics
- Native integration with Brazilian payment platforms (Hotmart, Kiwify)
- Anti-ban compliant bulk broadcasting with humanized rate limiting
- Multi-project, multi-phase group management for complex launches

---

## 2. Problem Statement

### 2.1 The Pain

Brazilian digital product creators running WhatsApp-based launches face a fragmented, manual process:

| Problem | Impact |
|---------|--------|
| Manual group link distribution | Time-consuming, error-prone, does not scale beyond 2-3 groups |
| No lead capture on group joins | Zero visibility on who clicked, from where, or which group they entered |
| Manual broadcast sending | Hours of work per launch day; high risk of phone bans |
| No funnel segmentation | All leads treated equally; no way to identify cold vs. warm vs. buyers |
| Hotmart/Kiwify integrations are manual | Purchase confirmation → group move requires human intervention |
| No multi-tenant tooling | Agencies managing multiple clients have no isolation or management layer |

### 2.2 The Market Gap

Existing tools like SendFlow solve parts of this problem but have documented gaps:
- No API-first architecture (no developer customization)
- Black-box automation with no audit trail
- Limited analytics (click counts only, no funnel visualization)
- No multi-project/multi-phase management per connection
- Pricing not competitive for small creators

### 2.3 The Opportunity

- Market: ~500k active "infoprodutores" in Brazil
- Annual launches average 2-4 per creator, each requiring WhatsApp group infrastructure
- No open-source or affordable alternative to SendFlow
- Evolution API (WhatsApp Web automation) is mature and reliable for this use case

---

## 3. Target Users

### 3.1 Primary User — The Digital Creator (Infoprodutor)

**Profile:**
- Solo creator or small team (1-3 people)
- Sells digital products via Hotmart/Kiwify (courses, mentoring, communities)
- Runs 2-6 product launches per year
- Manages 10-200 WhatsApp groups per launch
- Non-technical: needs UI-driven workflow, not API
- Revenue: R$10k–R$500k/month

**Key Jobs-to-be-Done:**
- JTD-01: Capture leads with tracking (which ad, which link)
- JTD-02: Route leads into the right group automatically
- JTD-03: Send timed broadcast messages without being banned
- JTD-04: Move buyers to a separate group after purchase
- JTD-05: See real-time dashboard of launch progress

### 3.2 Secondary User — The Launch Manager (Gestor de Lançamento)

**Profile:**
- Freelance or agency managing launches for creators
- Manages 3-10 client accounts simultaneously
- Needs multi-tenant workspace isolation
- Technical enough to configure webhooks and integrations

**Key Jobs-to-be-Done:**
- JTD-06: Manage multiple client projects under one account
- JTD-07: Generate reports for clients post-launch
- JTD-08: Configure Hotmart/Kiwify webhooks per client
- JTD-09: Monitor group health and anti-ban status

### 3.3 User Personas

#### Persona A — "Marina, a Nutricionista"
- 45k Instagram followers, sells R$2k online course
- Runs 4 launches/year, each with 20-50 groups
- Problem: spends 3 hours/day manually managing groups during launch week
- Zap value: automates 90% of that work

#### Persona B — "Ricardo, o Gestor de Lançamentos"
- Manages 6 client launches simultaneously
- Currently uses SendFlow but frustrated by the lack of multi-tenant isolation
- Zap value: clean workspace per client, unified billing, proper API

---

## 4. Product Vision & Goals

### 4.1 Vision Statement

> "Make WhatsApp the most powerful and trackable channel for Brazilian digital product launches — without requiring technical expertise."

### 4.2 Strategic Goals

| Goal | Metric | Target (12 months) |
|------|--------|-------------------|
| Product-market fit | NPS | ≥ 50 |
| Revenue | MRR | R$150k |
| Adoption | Paying tenants | 300+ |
| Retention | Monthly churn | < 5% |
| Scale | Groups managed | 50,000+ |

### 4.3 Design Principles

1. **Zero manual intervention during launch** — the platform handles routing, sending, and moving
2. **Anti-ban by design** — all WhatsApp sends go through rate-limited queues
3. **Data before everything** — every click, join, and purchase is recorded
4. **Multi-tenant from day one** — tenant isolation at database level (RLS)
5. **Mobile-first dashboard** — creators check status from their phones during launch

---

## 5. MVP Scope

### 5.1 MVP Definition

The MVP delivers end-to-end value for a single launch scenario:

> A creator can connect a WhatsApp number, create a project with phases and groups, generate a tracking link, and route leads into groups automatically — then send a broadcast to all groups and have purchases automatically move buyers to a buyer group.

### 5.2 MVP Feature Set

| # | Feature | Priority |
|---|---------|----------|
| 1 | WhatsApp connection management (QR code, status) | MUST |
| 2 | Project + phase management (Leads / Aquecimento / Compradores) | MUST |
| 3 | Group registration and WhatsApp group linking | MUST |
| 4 | Dynamic tracking links with fill-first routing | MUST |
| 5 | Link click tracking and redirect analytics | MUST |
| 6 | Broadcast creation and bulk sending (text) | MUST |
| 7 | Hotmart webhook integration (purchase → buyer group) | MUST |
| 8 | Multi-tenant authentication (Supabase Auth) | MUST |
| 9 | Real-time connection status (QR code stream) | MUST |
| 10 | Overview dashboard (groups, participants, clicks) | MUST |

### 5.3 MVP Exclusions (Explicitly Out)

- AI chat assistant (SendIA equivalent)
- Sequence/drip automation
- SMS/email channels
- Custom domain for redirect links
- In-app billing/subscription management
- Mobile app (web-responsive is sufficient for MVP)
- Kiwify integration (V1)
- Lead scoring UI (data is captured, no UI yet)

### 5.4 MVP Success Criteria

- A tenant can complete a full launch cycle end-to-end using only the Zap dashboard
- Zero WhatsApp bans in the first 30 days of production use
- Redirect latency p99 < 200ms
- Dashboard load time < 2s on 4G mobile

---

## 6. Feature Breakdown

### 6.1 MVP Features (Sprint 0–6)

#### F-01: WhatsApp Connection Management
Manage Evolution API instances per tenant. Each tenant gets one or more WhatsApp sessions.

**Capabilities:**
- Create connection → Evolution API instance provisioning
- QR code display (SSE stream) for phone pairing
- Real-time connection status (connecting / connected / disconnected / banned)
- Graceful disconnect and instance cleanup
- Connection health monitoring

#### F-02: Project & Phase Management
Organizational hierarchy: Tenant → Project → Phase → Group → Link.

**Capabilities:**
- CRUD for projects (name, description, associated connection)
- Default phases auto-created: Leads, Aquecimento, Compradores
- Custom phase creation with configurable group capacity
- Phase ordering (drag and reorder)
- Project status: active / paused / archived

#### F-03: Group Management
Register WhatsApp groups into phases. Auto-fetch invite links from Evolution API.

**Capabilities:**
- Register existing WA group by JID
- Auto-import invite link on registration
- Manual invite link refresh
- Participant count tracking (via Evolution webhook events)
- Auto-status update: active → full when participant_count >= capacity
- Fill-first group selection for redirect routing

#### F-04: Dynamic Tracking Links
Unique short links that route visitors to the least-full available group in a phase.

**Capabilities:**
- Link generation per phase with unique token
- Fill-first routing algorithm with Redis cache (30s TTL)
- Link click recording (IP, user-agent, timestamp, group redirected to)
- Fallback URL when all groups in phase are full
- Link activation / deactivation
- Analytics per link (total clicks, daily trend, group distribution)

#### F-05: Broadcast Engine
Send messages to multiple WhatsApp groups simultaneously with anti-ban rate limiting.

**Capabilities:**
- Broadcast creation with message sequence (up to 10 messages)
- Target selection: all groups, specific groups, or entire phase
- Scheduling (future broadcast with datetime picker)
- Immediate send trigger
- Real-time progress tracking (sent_count / total_count)
- Anti-ban: humanized delays (2-8s between messages), max 500 msgs/hour/session
- Status flow: draft → scheduled → sending → sent / failed
- Broadcast cancellation (before send starts)

#### F-06: Hotmart Webhook Integration
Process purchase events from Hotmart to trigger group movements.

**Capabilities:**
- Webhook endpoint: `POST /webhooks/hotmart?tenantId=xxx`
- HMAC-SHA256 signature validation (X-Hotmart-Hottok)
- Event handling: PURCHASE_APPROVED → add buyer to buyer phase group
- Lead upsert on purchase (phone E.164 normalization)
- Lead event recording (purchase, score delta +100)
- Webhook event audit log (payload, signature_valid, processed, actions_taken)

#### F-07: Authentication & Multi-tenancy
Supabase Auth with tenant isolation enforced at database level.

**Capabilities:**
- Email/password authentication
- JWT with tenant_id and role claims
- Row Level Security on all 14 tables
- Role-based access: admin, operator, viewer
- Session persistence (30-day refresh tokens)

#### F-08: Dashboard & Analytics
Real-time overview of launch health metrics.

**Capabilities:**
- Connections status summary
- Projects and group counts
- Total participants and capacity utilization
- Click count (last 30 days)
- Group fill rate visualization (progress bars)
- Broadcast delivery rate tracking

---

### 6.2 V1 Features (Sprint 7–11)

#### F-09: Sequence / Drip Automation
Schedule a series of timed messages to be sent after a trigger event.

**Capabilities:**
- Sequence builder (messages + delays in hours/days)
- Trigger types: group_join, purchase, manual_start
- Per-lead tracking of sequence position
- Sequence pause/resume
- Unsubscribe support (keyword detection)

#### F-10: Kiwify Webhook Integration
Same pattern as Hotmart for the second-largest Brazilian payment platform.

#### F-11: Lead Management UI
Browse, filter, and export leads captured by the platform.

**Capabilities:**
- Lead list with search by phone/name
- Score display and history (lead_events timeline)
- Tags management
- Lead group membership history
- CSV export

#### F-12: Advanced Analytics
Move beyond counts to funnel visualization.

**Capabilities:**
- Funnel: link click → group join → purchase conversion rate
- Group performance comparison
- Broadcast delivery heatmap by time of day
- Lead score distribution histogram
- Date range filtering

#### F-13: Team Members
Add operators and viewers to a tenant workspace.

**Capabilities:**
- Invite by email
- Role assignment (admin / operator / viewer)
- Revoke access
- Activity audit log

---

### 6.3 V2 Features (Sprint 12+)

#### F-14: AI Chat Assistant (SendIA equivalent)
LLM-powered automatic response system for WhatsApp group DMs.

#### F-15: Custom Domains
White-label redirect links using tenant's own domain (e.g., `go.marca.com.br/abc`).

#### F-16: Webhook Builder (No-code)
Visual webhook configuration for generic integrations (Eduzz, Monetizze, custom CRMs).

#### F-17: Agency Multi-Workspace
Sub-accounts for agencies: one billing entity, multiple isolated tenants.

#### F-18: Mobile App (React Native)
Native iOS/Android app for launch-day monitoring.

#### F-19: Billing & Subscription Management
In-app plan management, invoices, and payment via Stripe or Pagar.me.

---

## 7. Functional Requirements

### 7.1 Authentication (FR-AUTH)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-AUTH-01 | System SHALL authenticate users via email/password | MUST |
| FR-AUTH-02 | System SHALL issue JWT with tenant_id and role claims | MUST |
| FR-AUTH-03 | System SHALL enforce RLS on all database queries | MUST |
| FR-AUTH-04 | System SHALL invalidate sessions on logout | MUST |
| FR-AUTH-05 | System SHALL support refresh token rotation (30-day TTL) | MUST |

### 7.2 WhatsApp Connections (FR-CONN)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-CONN-01 | System SHALL provision a new Evolution API instance per connection request | MUST |
| FR-CONN-02 | System SHALL stream QR code via SSE until connection is established or timeout (60s) | MUST |
| FR-CONN-03 | System SHALL poll and update connection status every 30 seconds | MUST |
| FR-CONN-04 | System SHALL detect banned connections via Evolution webhook and update status | MUST |
| FR-CONN-05 | System SHALL enforce plan limits on number of connections per tenant | SHOULD |
| FR-CONN-06 | System SHALL delete Evolution instance on connection deletion | MUST |

### 7.3 Projects & Phases (FR-PROJ)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-PROJ-01 | System SHALL create 3 default phases (Leads, Aquecimento, Compradores) on project creation | MUST |
| FR-PROJ-02 | System SHALL allow custom phases with configurable group capacity | MUST |
| FR-PROJ-03 | System SHALL cascade-delete all phases, groups, and links when a project is archived | MUST |
| FR-PROJ-04 | System SHALL prevent deletion of projects with active broadcasts | SHOULD |

### 7.4 Groups (FR-GROUP)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-GROUP-01 | System SHALL register a WA group by JID and auto-fetch invite link | MUST |
| FR-GROUP-02 | System SHALL automatically mark a group as 'full' when participant_count >= capacity | MUST |
| FR-GROUP-03 | System SHALL update participant_count on Evolution webhook group.participants.update events | MUST |
| FR-GROUP-04 | System SHALL prevent duplicate group registration (same tenant + wa_group_id) | MUST |
| FR-GROUP-05 | System SHALL support manual invite link refresh (generates new WA invite) | SHOULD |

### 7.5 Dynamic Links (FR-LINK)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-LINK-01 | System SHALL generate unique token for each link | MUST |
| FR-LINK-02 | System SHALL redirect to the group with the lowest fill rate in target phase | MUST |
| FR-LINK-03 | System SHALL use Redis cache (30s TTL) for available group lookup | MUST |
| FR-LINK-04 | System SHALL redirect to fallback_url when all groups in phase are full | MUST |
| FR-LINK-05 | System SHALL record click asynchronously (non-blocking redirect) | MUST |
| FR-LINK-06 | System SHALL respond to redirect requests in < 200ms (p99) | MUST |
| FR-LINK-07 | System SHALL increment click_count on dynamic_links atomically | MUST |

### 7.6 Broadcasts (FR-BCAST)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-BCAST-01 | System SHALL enqueue all broadcast messages via BullMQ (never synchronous) | MUST |
| FR-BCAST-02 | System SHALL apply humanized delay (2-8s random) between group sends | MUST |
| FR-BCAST-03 | System SHALL limit sends to 500 messages/hour per WhatsApp session | MUST |
| FR-BCAST-04 | System SHALL track sent_count and failed_count atomically per broadcast | MUST |
| FR-BCAST-05 | System SHALL auto-complete broadcast status when sent_count >= total_count | MUST |
| FR-BCAST-06 | System SHALL support scheduling broadcasts for a future datetime | SHOULD |
| FR-BCAST-07 | System SHALL retry failed message jobs up to 3 times with exponential backoff | MUST |

### 7.7 Webhook Integration (FR-WEBHOOK)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-WEBHOOK-01 | System SHALL validate Hotmart webhook HMAC-SHA256 signature | MUST |
| FR-WEBHOOK-02 | System SHALL reject webhooks with invalid signatures (HTTP 401) | MUST |
| FR-WEBHOOK-03 | System SHALL store all incoming webhook events in audit log regardless of processing result | MUST |
| FR-WEBHOOK-04 | System SHALL normalize phone numbers to E.164 format | MUST |
| FR-WEBHOOK-05 | System SHALL upsert leads (no duplicate phone per tenant) | MUST |
| FR-WEBHOOK-06 | System SHALL enqueue trigger processing via BullMQ for async handling | MUST |
| FR-WEBHOOK-07 | System SHALL return HTTP 200 immediately on valid webhook receipt | MUST |

### 7.8 Analytics (FR-ANALYTICS)

| ID | Requirement | Priority |
|----|------------|---------|
| FR-ANALYTICS-01 | System SHALL provide tenant overview (connections, projects, groups, participants, clicks) | MUST |
| FR-ANALYTICS-02 | System SHALL provide per-link analytics (daily clicks, group distribution) | MUST |
| FR-ANALYTICS-03 | System SHALL provide per-group fill rate analytics | MUST |
| FR-ANALYTICS-04 | System SHALL provide broadcast delivery rate analytics | MUST |

---

## 8. Non-Functional Requirements

### 8.1 Performance (NFR-PERF)

| ID | Requirement | Target |
|----|------------|--------|
| NFR-PERF-01 | Redirect service response time | p50 < 50ms, p99 < 200ms |
| NFR-PERF-02 | API response time (standard endpoints) | p50 < 200ms, p99 < 1s |
| NFR-PERF-03 | Dashboard initial load (web) | < 2s on 4G (10 Mbps) |
| NFR-PERF-04 | Database query timeout | 5s max |
| NFR-PERF-05 | BullMQ job processing concurrency | message:5, broadcast:2, trigger:10 |

### 8.2 Reliability (NFR-REL)

| ID | Requirement | Target |
|----|------------|--------|
| NFR-REL-01 | API uptime | 99.5% monthly |
| NFR-REL-02 | Broadcast job durability | Zero message loss on worker restart |
| NFR-REL-03 | Job retry on failure | 3 attempts, exponential backoff |
| NFR-REL-04 | Redirect service uptime | 99.9% (independent from API) |
| NFR-REL-05 | Database connection pooling | Min 5, Max 50 connections |

### 8.3 Security (NFR-SEC)

| ID | Requirement |
|----|------------|
| NFR-SEC-01 | All API endpoints require valid JWT (except `/r/:token` and `/health`) |
| NFR-SEC-02 | Tenant isolation enforced at DB level via RLS on all 14 tables |
| NFR-SEC-03 | Webhook signatures validated via HMAC-SHA256 (constant-time comparison) |
| NFR-SEC-04 | Service role key (admin DB client) never exposed to frontend |
| NFR-SEC-05 | Rate limiting: 100 req/min per IP, 1000 req/min per tenant |
| NFR-SEC-06 | All secrets in environment variables (never in code) |
| NFR-SEC-07 | CORS restricted to configured origins |
| NFR-SEC-08 | Evolution API key isolated per-tenant (instance naming convention) |

### 8.4 Scalability (NFR-SCALE)

| ID | Requirement | Design Decision |
|----|------------|----------------|
| NFR-SCALE-01 | Support 10k concurrent redirect requests | Redis-cached routing + stateless API |
| NFR-SCALE-02 | Support 500+ active tenants | Database RLS + connection pooling |
| NFR-SCALE-03 | Support 200+ groups per tenant | Indexed queries, paginated API responses |
| NFR-SCALE-04 | Horizontal worker scaling | BullMQ workers stateless; scale by adding instances |
| NFR-SCALE-05 | WhatsApp session isolation | One Evolution instance per tenant |

### 8.5 Compliance & Anti-Spam (NFR-COMPLY)

| ID | Requirement |
|----|------------|
| NFR-COMPLY-01 | All WhatsApp sends comply with humanized delay (2-8s random jitter) |
| NFR-COMPLY-02 | Max 500 messages/hour per WhatsApp session |
| NFR-COMPLY-03 | Max 3,000 messages/day per WhatsApp session |
| NFR-COMPLY-04 | Broadcast messages go through BullMQ queue (never direct HTTP call) |
| NFR-COMPLY-05 | Lead data stored per LGPD requirements (tenant-isolated, deletable) |

### 8.6 Maintainability (NFR-MAINT)

| ID | Requirement |
|----|------------|
| NFR-MAINT-01 | Monorepo structure (Turborepo) with shared packages |
| NFR-MAINT-02 | TypeScript strict mode throughout |
| NFR-MAINT-03 | Structured logging (Winston, JSON in production) |
| NFR-MAINT-04 | All database mutations go through service layer (not direct SQL in routes) |
| NFR-MAINT-05 | Environment-based configuration (no hardcoded values) |

---

## 9. Product Backlog

### 9.1 Epic Overview

| Epic | Title | Phase | Stories | Status |
|------|-------|-------|---------|--------|
| EPIC-01 | Foundation & Infrastructure | MVP | 5 | Ready |
| EPIC-02 | WhatsApp Connection Management | MVP | 6 | Ready |
| EPIC-03 | Project & Group Management | MVP | 7 | Ready |
| EPIC-04 | Dynamic Tracking Links | MVP | 6 | Ready |
| EPIC-05 | Broadcast Engine | MVP | 7 | Ready |
| EPIC-06 | Webhook Integrations | MVP | 5 | Ready |
| EPIC-07 | Dashboard & Analytics | MVP | 6 | Ready |
| EPIC-08 | Sequence Automation | V1 | 8 | Draft |
| EPIC-09 | Lead Management | V1 | 5 | Draft |
| EPIC-10 | Advanced Analytics | V1 | 6 | Draft |
| EPIC-11 | Team Management | V1 | 4 | Draft |
| EPIC-12 | Kiwify Integration | V1 | 3 | Draft |
| EPIC-13 | AI Chat Assistant | V2 | TBD | Concept |
| EPIC-14 | Custom Domains | V2 | TBD | Concept |
| EPIC-15 | Agency Multi-Workspace | V2 | TBD | Concept |
| EPIC-16 | Billing & Subscriptions | V2 | TBD | Concept |
| EPIC-17 | Mobile App | V2 | TBD | Concept |

---

### 9.2 MVP Stories — EPIC-01: Foundation & Infrastructure

| Story ID | Title | Points | Priority |
|----------|-------|--------|---------|
| ZAP-001 | Monorepo setup (Turborepo, packages/types, packages/validators) | 3 | CRITICAL |
| ZAP-002 | Supabase project setup + initial schema migration | 5 | CRITICAL |
| ZAP-003 | Hono API bootstrap (middleware, auth, error handling) | 3 | CRITICAL |
| ZAP-004 | BullMQ + Redis queue infrastructure | 3 | HIGH |
| ZAP-005 | Docker Compose local development environment | 2 | HIGH |

**AC Summary — ZAP-001:**
- `npm run dev` starts all apps from root
- `packages/types` exports all shared interfaces
- `packages/validators` exports all Zod schemas
- TypeScript strict mode passes with 0 errors

**AC Summary — ZAP-002:**
- Migration 000001 creates all 14 tables with RLS enabled
- Migration 000002 creates all helper functions (increment_broadcast_sent, etc.)
- `supabase/seed.sql` creates dev tenant
- All RLS policies enforce tenant isolation

**AC Summary — ZAP-003:**
- `GET /health` returns 200
- All protected routes return 401 without valid JWT
- AppError, NotFoundError, ForbiddenError handled with appropriate HTTP codes
- CORS configured for frontend origin

---

### 9.3 MVP Stories — EPIC-02: WhatsApp Connection Management

| Story ID | Title | Points | Priority |
|----------|-------|--------|---------|
| ZAP-006 | POST /api/v1/connections — create + provision Evolution instance | 5 | CRITICAL |
| ZAP-007 | GET /api/v1/connections/:id/qr — SSE QR code stream | 5 | CRITICAL |
| ZAP-008 | GET /api/v1/connections/:id/status — real-time status check | 3 | HIGH |
| ZAP-009 | DELETE /api/v1/connections/:id — disconnect + cleanup instance | 3 | HIGH |
| ZAP-010 | Evolution webhook → connection status update handler | 5 | CRITICAL |
| ZAP-011 | Connections page UI (list, create, QR modal, status badges) | 5 | HIGH |

**AC Summary — ZAP-007:**
- SSE stream sends QR code image data every 5 seconds
- Stream closes when status changes to 'connected'
- Stream closes after 60-second timeout
- Client receives `event: qr` with base64 image data

**AC Summary — ZAP-010:**
- Evolution sends `connection.update` event
- Handler updates `whatsapp_connections.status` in DB
- Handler handles states: open → connected, close → disconnected, banned
- Webhook endpoint returns 200 within 500ms

---

### 9.4 MVP Stories — EPIC-03: Project & Group Management

| Story ID | Title | Points | Priority |
|----------|-------|--------|---------|
| ZAP-012 | POST /api/v1/projects — create project with default phases | 5 | CRITICAL |
| ZAP-013 | GET /api/v1/projects + GET /api/v1/projects/:id | 3 | CRITICAL |
| ZAP-014 | PATCH /api/v1/projects/:id + DELETE (archive) | 2 | HIGH |
| ZAP-015 | POST /api/v1/projects/:id/phases — custom phase creation | 3 | HIGH |
| ZAP-016 | POST /api/v1/groups — register WA group + auto-fetch invite link | 5 | CRITICAL |
| ZAP-017 | PATCH /api/v1/groups/:id + POST /api/v1/groups/:id/refresh-link | 3 | HIGH |
| ZAP-018 | Projects & Groups UI (project list, project detail, group cards) | 8 | HIGH |

**AC Summary — ZAP-016:**
- Verifies project and phase belong to authenticated tenant
- Calls Evolution API to fetch wa_invite_link
- Stores group with initial participant_count: 0
- Returns 409 if wa_group_id already registered for tenant

---

### 9.5 MVP Stories — EPIC-04: Dynamic Tracking Links

| Story ID | Title | Points | Priority |
|----------|-------|--------|---------|
| ZAP-019 | POST /api/v1/projects/:id/links — link generation | 5 | CRITICAL |
| ZAP-020 | GET /r/:token — fill-first redirect with Redis cache | 8 | CRITICAL |
| ZAP-021 | POST /r/:token click recording (async) | 3 | CRITICAL |
| ZAP-022 | GET /api/v1/links?projectId — list links with click counts | 3 | HIGH |
| ZAP-023 | GET /api/v1/analytics/links/:linkId — click analytics | 5 | HIGH |
| ZAP-024 | Links page UI (list, create, copy, analytics modal) | 5 | HIGH |

**AC Summary — ZAP-020:**
- Redis lookup (30s TTL) for available group in target phase
- Fill-first: group with lowest participant_count / capacity ratio
- Redirects to wa_invite_link (HTTP 302)
- Redirects to fallback_url if all groups full (HTTP 302)
- Returns 404 if link inactive or not found
- p99 response time < 200ms

---

### 9.6 MVP Stories — EPIC-05: Broadcast Engine

| Story ID | Title | Points | Priority |
|----------|-------|--------|---------|
| ZAP-025 | POST /api/v1/broadcasts — create broadcast with messages | 5 | CRITICAL |
| ZAP-026 | POST /api/v1/broadcasts/:id/send — trigger immediate send | 5 | CRITICAL |
| ZAP-027 | broadcast.worker — resolve groups, enqueue message jobs | 8 | CRITICAL |
| ZAP-028 | message.worker — send to group with humanized delay | 8 | CRITICAL |
| ZAP-029 | GET /api/v1/broadcasts/:id/status — progress tracking | 3 | HIGH |
| ZAP-030 | POST /api/v1/broadcasts/:id/cancel | 2 | MEDIUM |
| ZAP-031 | Broadcasts page UI (list, create modal, progress tracking) | 8 | HIGH |

**AC Summary — ZAP-028:**
- Sends each message in sequence with 1-3s delay between messages
- Records successful send via increment_broadcast_sent RPC
- On failure: retries 3x exponential backoff; then increment_broadcast_failed
- Logs all sends with tenantId, broadcastId, waGroupId

---

### 9.7 MVP Stories — EPIC-06: Webhook Integrations

| Story ID | Title | Points | Priority |
|----------|-------|--------|---------|
| ZAP-032 | POST /webhooks/hotmart — signature validation + event parsing | 8 | CRITICAL |
| ZAP-033 | Hotmart purchase handler — lead upsert + event recording | 5 | CRITICAL |
| ZAP-034 | trigger.worker — process trigger jobs, add buyer to group | 8 | CRITICAL |
| ZAP-035 | Evolution /webhooks/evolution — group participant update handler | 5 | HIGH |
| ZAP-036 | Webhook events audit log UI | 3 | MEDIUM |

**AC Summary — ZAP-032:**
- Validates X-Hotmart-Hottok HMAC-SHA256 signature
- Stores raw payload in webhook_events (even if invalid)
- Returns 200 within 500ms (async processing)
- Enqueues trigger:proc job for PURCHASE_APPROVED events

**AC Summary — ZAP-035:**
- Parses `group.participants.update` Evolution event
- Updates group participant_count (increment on join, decrement on leave)
- Calls increment_group_participants or decrement_group_participants RPC
- Auto-transitions group to 'full' status when capacity reached

---

### 9.8 MVP Stories — EPIC-07: Dashboard & Analytics

| Story ID | Title | Points | Priority |
|----------|-------|--------|---------|
| ZAP-037 | GET /api/v1/analytics/overview — tenant stats | 5 | CRITICAL |
| ZAP-038 | GET /api/v1/analytics/groups — fill rates | 3 | HIGH |
| ZAP-039 | GET /api/v1/analytics/broadcasts — delivery rates | 3 | HIGH |
| ZAP-040 | Overview dashboard page (stats, occupancy, click trend) | 8 | CRITICAL |
| ZAP-041 | Analytics page (group fill rate, broadcast summary) | 5 | HIGH |
| ZAP-042 | Real-time dashboard updates (Supabase Realtime subscriptions) | 5 | MEDIUM |

---

## 10. Implementation Roadmap

### Sprint 0 (Week 1-2): Foundation

**Goal:** Working local development environment and database schema.

| Task | Story | Owner |
|------|-------|-------|
| Turborepo monorepo + packages setup | ZAP-001 | @dev |
| Supabase schema migrations (all 14 tables + RLS) | ZAP-002 | @data-engineer |
| Docker Compose (api, worker, redis, evolution) | ZAP-005 | @devops |
| Hono API bootstrap (health, auth, error handling) | ZAP-003 | @dev |
| BullMQ queue infrastructure | ZAP-004 | @dev |

**Exit Criteria:** `npm run dev` starts all services; `GET /health` returns 200; Supabase migrations apply clean.

---

### Sprint 1 (Week 3-4): WhatsApp Core

**Goal:** Connect a WhatsApp number and see QR code in the dashboard.

| Task | Story | Owner |
|------|-------|-------|
| Connection create + Evolution provisioning | ZAP-006 | @dev |
| QR code SSE stream | ZAP-007 | @dev |
| Connection status + delete | ZAP-008, ZAP-009 | @dev |
| Evolution webhook handler | ZAP-010 | @dev |
| Connections page UI | ZAP-011 | @dev |

**Exit Criteria:** Scan QR code with real phone; status changes to 'connected' in real-time.

---

### Sprint 2 (Week 5-6): Projects & Groups

**Goal:** Create a project, add phases, register groups.

| Task | Story | Owner |
|------|-------|-------|
| Project CRUD + auto-phases | ZAP-012, ZAP-013, ZAP-014 | @dev |
| Phase management | ZAP-015 | @dev |
| Group registration + invite link | ZAP-016, ZAP-017 | @dev |
| Projects & Groups UI | ZAP-018 | @dev |

**Exit Criteria:** Full CRUD in dashboard; group registered with valid WA invite link fetched from Evolution API.

---

### Sprint 3 (Week 7-8): Dynamic Links

**Goal:** Generate a tracking link; clicking it redirects to a WhatsApp group.

| Task | Story | Owner |
|------|-------|-------|
| Link generation | ZAP-019 | @dev |
| Redirect service (fill-first + Redis) | ZAP-020 | @dev |
| Async click recording | ZAP-021 | @dev |
| Links API + analytics endpoint | ZAP-022, ZAP-023 | @dev |
| Links page UI | ZAP-024 | @dev |

**Exit Criteria:** Click tracking link → land in WhatsApp group; subsequent clicks fill next group; click analytics visible in dashboard.

---

### Sprint 4 (Week 9-10): Broadcast Engine

**Goal:** Send a message to all groups without getting banned.

| Task | Story | Owner |
|------|-------|-------|
| Broadcast CRUD + send trigger | ZAP-025, ZAP-026 | @dev |
| broadcast.worker (group resolution + job queuing) | ZAP-027 | @dev |
| message.worker (send + rate limit + retry) | ZAP-028 | @dev |
| Broadcast status polling | ZAP-029, ZAP-030 | @dev |
| Broadcasts UI | ZAP-031 | @dev |

**Exit Criteria:** Create broadcast → send to 10 groups → all receive message within 5 minutes; no WhatsApp ban detected.

---

### Sprint 5 (Week 11-12): Webhook Integration

**Goal:** Hotmart purchase → buyer automatically added to buyer group.

| Task | Story | Owner |
|------|-------|-------|
| Hotmart webhook endpoint | ZAP-032 | @dev |
| Purchase handler + lead upsert | ZAP-033 | @dev |
| trigger.worker (lead processing) | ZAP-034 | @dev |
| Evolution group participant update handler | ZAP-035 | @dev |
| Webhook audit log UI | ZAP-036 | @dev |

**Exit Criteria:** Simulate Hotmart PURCHASE_APPROVED → lead upserted → buyer group participant_count incremented → webhook event logged.

---

### Sprint 6 (Week 13-14): Dashboard & Polish

**Goal:** Production-ready dashboard with real-time updates.

| Task | Story | Owner |
|------|-------|-------|
| Analytics overview endpoint | ZAP-037 | @dev |
| Group + broadcast analytics endpoints | ZAP-038, ZAP-039 | @dev |
| Overview dashboard page | ZAP-040 | @dev |
| Analytics page | ZAP-041 | @dev |
| Supabase Realtime subscriptions | ZAP-042 | @dev |
| QA + bug fixes + performance tuning | — | @qa |
| Railway deployment (api + worker + evolution) | — | @devops |
| Vercel deployment (web) | — | @devops |

**Exit Criteria:** All MVP acceptance criteria met; deployed to production; p99 redirect < 200ms; zero bans in 48h smoke test.

---

### Sprint 7–11 (V1 — Weeks 15–24)

| Sprint | Focus | Key Deliverables |
|--------|-------|-----------------|
| Sprint 7 | Lead Management | Lead list UI, score history, CSV export |
| Sprint 8 | Kiwify Integration | webhook + trigger handler |
| Sprint 9 | Sequence Automation (core) | Sequence builder, trigger types, drip engine |
| Sprint 10 | Sequence Automation (UI) | Sequence editor, per-lead tracking |
| Sprint 11 | Team Management + Advanced Analytics | Multi-user, funnel visualization |

### Sprint 12+ (V2 — Weeks 25+)

| Sprint | Focus |
|--------|-------|
| Sprint 12 | AI Chat Assistant (MVP) |
| Sprint 13 | Custom Domains |
| Sprint 14 | Agency Multi-Workspace |
| Sprint 15 | Billing & Subscriptions |
| Sprint 16+ | Mobile App |

---

## 11. Success Metrics

### 11.1 Technical KPIs

| Metric | Target | Measurement |
|--------|--------|------------|
| Redirect p99 latency | < 200ms | Railway metrics |
| API p99 latency | < 1s | Winston logs |
| Uptime (API) | 99.5% | UptimeRobot |
| WhatsApp ban rate | 0% in 30 days | Manual + Evolution status |
| Message delivery rate | > 95% | sent_count / total_count |

### 11.2 Product KPIs (First 90 Days)

| Metric | Target |
|--------|--------|
| Paying tenants | 50 |
| Groups managed | 5,000 |
| Links created | 500 |
| Broadcasts sent | 200 |
| Leads captured | 50,000 |
| MRR | R$25,000 |

---

## 12. Out of Scope

The following are explicitly excluded from all current product phases:

- ❌ WhatsApp Business API (official Meta API) — costs prohibitive for target market
- ❌ SMS or email channels
- ❌ CRM-level lead management (Zap is a funnel tool, not a CRM)
- ❌ Video/audio broadcast support (text only in MVP)
- ❌ A/B testing for links or broadcasts
- ❌ Automated group creation (groups must be pre-created on WhatsApp)
- ❌ WhatsApp Stories integration
- ❌ Payments within WhatsApp (PIX automation)

---

## 13. Dependencies & Constraints

### 13.1 Technical Dependencies

| Dependency | Purpose | Risk |
|-----------|---------|------|
| Evolution API v2 | WhatsApp session management | MEDIUM — relies on WhatsApp Web protocol reverse engineering |
| Supabase | Database + Auth + Realtime | LOW — managed service with SLA |
| Redis (Upstash) | Queue + cache | LOW — managed service |
| Hotmart Webhook API | Purchase event source | LOW — stable, documented API |
| Railway | Backend hosting | LOW — simple Node.js deployment |

### 13.2 External Constraints

- **WhatsApp ToS:** Platform does not store message content beyond metadata; humanized rate limits enforced
- **LGPD:** Lead data is tenant-isolated and deletable on request
- **Evolution API:** Community-maintained; breaking changes possible on WhatsApp protocol updates
- **Plan Limits:** Enforced at application layer (not database) in MVP; database enforcement in V1

### 13.3 Assumptions

- Each tenant manages at least 1 WhatsApp number connected via Evolution API
- All WhatsApp groups must be created manually on the phone before being registered in Zap
- Hotmart webhook secret is configured per-tenant in environment variables (not per-webhook in MVP)
- Redis connection is available before any worker processing begins

---

## 14. Glossary

| Term | Definition |
|------|-----------|
| **Tenant** | An isolated workspace representing one company or creator account |
| **Connection** | A WhatsApp phone number linked to the platform via Evolution API |
| **Project** | A launch or campaign organizing groups and links |
| **Phase** | A stage within a project (e.g., Leads, Aquecimento, Compradores) |
| **Group** | A registered WhatsApp group linked to a project phase |
| **Dynamic Link** | A tracking URL that routes visitors to a WhatsApp group using fill-first logic |
| **Broadcast** | A bulk message sent to multiple WhatsApp groups |
| **Trigger** | An automation rule fired by an external event (e.g., purchase) |
| **Lead** | A person who clicked a link or joined a group |
| **Fill-first** | Group selection algorithm: fills groups to capacity before starting the next one |
| **JID** | WhatsApp group identifier (e.g., `120363xxx@g.us`) |
| **E.164** | International phone format (`+5511999999999`) |
| **Evolution API** | Open-source WhatsApp Web automation library (Baileys-based) |
| **RLS** | Row Level Security — PostgreSQL feature enforcing tenant data isolation |
| **BullMQ** | Redis-based job queue for background processing |
| **Infoprodutor** | Brazilian term for digital product creator / online course seller |

---

*Document prepared by: Pax — Product Owner*
*Reviewed by: Aria (Architect), Atlas (Analyst)*
*Ready for: @sm story creation, @dev implementation*
*Next step: `@sm *draft EPIC-01` to begin story creation*

— Pax, equilibrando prioridades 🎯
