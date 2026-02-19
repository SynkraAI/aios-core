# Zap Platform — User Stories
**Version:** 1.0
**Status:** Ready for Development
**Date:** 2026-02-18
**Source:** zap-prd.md v1.0
**Owner:** Pax (Product Owner)

---

## Index

| Epic | Title | Phase | Stories |
|------|-------|-------|---------|
| [EPIC-01](#epic-01-foundation--infrastructure) | Foundation & Infrastructure | MVP | ZAP-001 → ZAP-005 |
| [EPIC-02](#epic-02-whatsapp-connection-management) | WhatsApp Connection Management | MVP | ZAP-006 → ZAP-011 |
| [EPIC-03](#epic-03-project--group-management) | Project & Group Management | MVP | ZAP-012 → ZAP-018 |
| [EPIC-04](#epic-04-dynamic-tracking-links) | Dynamic Tracking Links | MVP | ZAP-019 → ZAP-024 |
| [EPIC-05](#epic-05-broadcast-engine) | Broadcast Engine | MVP | ZAP-025 → ZAP-031 |
| [EPIC-06](#epic-06-webhook-integrations) | Webhook Integrations | MVP | ZAP-032 → ZAP-036 |
| [EPIC-07](#epic-07-dashboard--analytics) | Dashboard & Analytics | MVP | ZAP-037 → ZAP-042 |
| [EPIC-08](#epic-08-sequence-automation) | Sequence Automation | V1 | ZAP-043 → ZAP-050 |
| [EPIC-09](#epic-09-lead-management) | Lead Management | V1 | ZAP-051 → ZAP-055 |
| [EPIC-10](#epic-10-advanced-analytics) | Advanced Analytics | V1 | ZAP-056 → ZAP-061 |
| [EPIC-11](#epic-11-team-management) | Team Management | V1 | ZAP-062 → ZAP-065 |
| [EPIC-12](#epic-12-kiwify-integration) | Kiwify Integration | V1 | ZAP-066 → ZAP-068 |

---

## Story Priority Legend

| Priority | Description |
|---------|------------|
| 🔴 CRITICAL | Blocks launch; must complete before MVP go-live |
| 🟠 HIGH | Required for MVP; no workaround |
| 🟡 MEDIUM | Important; acceptable workaround exists |
| 🟢 LOW | Nice to have; can defer |

---

## EPIC-01: Foundation & Infrastructure

> **Goal:** Establish the technical foundation — monorepo, database schema, API bootstrap, queuing, and local dev environment.
> **Sprint:** 0 | **Phase:** MVP

---

### ZAP-001 — Monorepo Setup 🔴

**As a** developer,
**I want** a Turborepo monorepo with shared packages configured,
**so that** all apps share types, validators, and config without duplication.

**Acceptance Criteria:**

- [ ] AC-001.1: `npm run dev` from root starts `apps/api` and `apps/web` concurrently
- [ ] AC-001.2: `packages/types` exports all shared TypeScript interfaces (Tenant, Connection, Project, Phase, Group, Lead, Broadcast, Link, WebhookEvent)
- [ ] AC-001.3: `packages/validators` exports all Zod schemas (createProject, createGroup, createBroadcast, createLink, hotmartWebhook)
- [ ] AC-001.4: `npm run typecheck` passes with 0 errors across all packages
- [ ] AC-001.5: `npm run lint` passes with 0 errors across all packages
- [ ] AC-001.6: `turbo.json` defines correct pipeline: `build → dev → test → lint → typecheck`
- [ ] AC-001.7: TypeScript strict mode enabled in all tsconfig files

**Implementation Notes:**
- File: `package.json` (root), `turbo.json`, `packages/types/src/index.ts`, `packages/validators/src/index.ts`
- No circular dependencies between packages

---

### ZAP-002 — Database Schema & Migrations 🔴

**As a** backend engineer,
**I want** all database tables created with RLS policies enforced,
**so that** tenant data is isolated at the database layer from day one.

**Acceptance Criteria:**

- [ ] AC-002.1: Migration `20260218000001` creates all 14 tables: `plans`, `tenants`, `tenant_users`, `whatsapp_connections`, `projects`, `project_phases`, `groups`, `group_participants`, `leads`, `lead_events`, `dynamic_links`, `link_clicks`, `broadcasts`, `broadcast_messages`, `webhook_events`
- [ ] AC-002.2: RLS enabled on all 14 tables with `tenant_isolation` policy
- [ ] AC-002.3: `auth_tenant_id()` SQL function extracts tenant_id from JWT
- [ ] AC-002.4: Migration `20260218000002` creates helper RPCs: `increment_broadcast_sent`, `increment_broadcast_failed`, `increment_group_participants`, `decrement_group_participants`, `get_tenant_overview`
- [ ] AC-002.5: Critical indexes created: `idx_groups_available` (fill-first lookup), `idx_leads_phone` (unique per tenant), `idx_broadcasts_scheduled`, `idx_links_token` (unique)
- [ ] AC-002.6: `updated_at` triggers on: `tenants`, `whatsapp_connections`, `projects`, `groups`, `broadcasts`
- [ ] AC-002.7: `supabase/seed.sql` creates dev tenant with id `a0000000-0000-0000-0000-000000000001`
- [ ] AC-002.8: `supabase db reset` runs clean with no errors

**Implementation Notes:**
- File: `supabase/migrations/20260218000001_initial_schema.sql`, `supabase/migrations/20260218000002_helper_functions.sql`, `supabase/seed.sql`

---

### ZAP-003 — Hono API Bootstrap 🔴

**As a** developer,
**I want** the Hono API server configured with auth, CORS, logging, and error handling,
**so that** all future routes have consistent middleware behavior.

**Acceptance Criteria:**

- [ ] AC-003.1: `GET /health` returns `{ status: 'ok', timestamp: ... }` with HTTP 200
- [ ] AC-003.2: All routes under `/api/*` require valid Supabase JWT — return 401 without it
- [ ] AC-003.3: `authMiddleware` extracts `tenant_id` and `role` from JWT claims and attaches to context
- [ ] AC-003.4: `AppError` → HTTP response with `{ error, code, details }` and correct status code
- [ ] AC-003.5: `NotFoundError` → HTTP 404; `UnauthorizedError` → HTTP 401; `ForbiddenError` → HTTP 403
- [ ] AC-003.6: CORS configured for `NEXT_PUBLIC_APP_URL` and `http://localhost:3000`
- [ ] AC-003.7: Unhandled errors log to Winston and return generic HTTP 500
- [ ] AC-003.8: Pretty JSON enabled in `NODE_ENV=development`

**Implementation Notes:**
- File: `apps/api/src/index.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/lib/errors.ts`, `apps/api/src/lib/logger.ts`

---

### ZAP-004 — BullMQ Queue Infrastructure 🔴

**As a** backend engineer,
**I want** BullMQ queues and workers configured with Redis,
**so that** all async operations (WhatsApp sends, broadcasts, triggers) are processed reliably.

**Acceptance Criteria:**

- [ ] AC-004.1: Four queues defined: `message:send`, `broadcast:proc`, `sequence:tick`, `trigger:proc`
- [ ] AC-004.2: IORedis connection configured from `REDIS_URL` env variable
- [ ] AC-004.3: `humanizedDelay(min, max)` function implemented with random jitter
- [ ] AC-004.4: Worker graceful shutdown on `SIGTERM` and `SIGINT`
- [ ] AC-004.5: `apps/api/src/workers/index.ts` starts all 3 workers: `messageWorker`, `broadcastWorker`, `triggerWorker`
- [ ] AC-004.6: Failed jobs logged to Winston with jobId, error message, and job data
- [ ] AC-004.7: `npm run worker:dev` starts workers in watch mode

**Implementation Notes:**
- File: `apps/api/src/queues/index.ts`, `apps/api/src/workers/*.ts`

---

### ZAP-005 — Docker Compose Local Environment 🟠

**As a** developer,
**I want** a Docker Compose file that starts all services locally,
**so that** any developer can run the full stack with one command.

**Acceptance Criteria:**

- [ ] AC-005.1: `docker-compose up` starts: `api` (port 3001), `redis` (port 6379), `evolution` (port 8080)
- [ ] AC-005.2: API service mounts `apps/api/src` with hot reload via tsx
- [ ] AC-005.3: Redis uses `redis:7-alpine` with persistent volume
- [ ] AC-005.4: Evolution API v2 configured with `AUTHENTICATION_API_KEY` from env
- [ ] AC-005.5: `.env.example` documents all required environment variables with descriptions
- [ ] AC-005.6: `docker-compose down -v` cleans up all volumes

---

## EPIC-02: WhatsApp Connection Management

> **Goal:** Connect a WhatsApp number to the platform via QR code and maintain session health.
> **Sprint:** 1 | **Phase:** MVP

---

### ZAP-006 — Create Connection 🔴

**As a** tenant admin,
**I want** to create a new WhatsApp connection,
**so that** I can start managing groups and sending messages.

**Acceptance Criteria:**

- [ ] AC-006.1: `POST /api/v1/connections` creates a `whatsapp_connections` record with status `connecting`
- [ ] AC-006.2: API calls Evolution API to create a new instance named `zap_{tenantId}_{connectionId}`
- [ ] AC-006.3: Enforces plan limit (lite: 1, standard: 3, black: 5) — returns 403 if exceeded
- [ ] AC-006.4: Returns new connection object with `id`, `status: 'connecting'`
- [ ] AC-006.5: HTTP 201 on success

---

### ZAP-007 — QR Code SSE Stream 🔴

**As a** tenant admin,
**I want** to see the QR code to pair my WhatsApp,
**so that** I can scan it with my phone.

**Acceptance Criteria:**

- [ ] AC-007.1: `GET /api/v1/connections/:id/qr` opens SSE stream with `Content-Type: text/event-stream`
- [ ] AC-007.2: Sends `event: qr` with base64 QR image every 5 seconds while status is `connecting`
- [ ] AC-007.3: Sends `event: connected` and closes stream when status changes to `connected`
- [ ] AC-007.4: Sends `event: timeout` and closes stream after 120 seconds
- [ ] AC-007.5: Returns 404 if connection not found or not owned by tenant
- [ ] AC-007.6: QR code data sourced from Evolution API `GET /instance/qrcode/{instanceName}`

---

### ZAP-008 — Connection Status 🟠

**As a** tenant user,
**I want** to check my WhatsApp connection status,
**so that** I know if my number is active.

**Acceptance Criteria:**

- [ ] AC-008.1: `GET /api/v1/connections/:id/status` returns `{ status, phone, display_name, last_seen_at }`
- [ ] AC-008.2: Status values: `connecting | connected | disconnected | banned`
- [ ] AC-008.3: Fetches live status from Evolution API and syncs DB if different
- [ ] AC-008.4: Returns 404 if connection not found

---

### ZAP-009 — Delete Connection 🟠

**As a** tenant admin,
**I want** to delete a WhatsApp connection,
**so that** I can free up my connection slot or clean up old numbers.

**Acceptance Criteria:**

- [ ] AC-009.1: `DELETE /api/v1/connections/:id` deletes Evolution instance
- [ ] AC-009.2: Soft-deletes or cascades deletion in DB
- [ ] AC-009.3: Returns 409 if connection has active running broadcasts
- [ ] AC-009.4: Returns 200 `{ success: true }` on success

---

### ZAP-010 — Evolution Webhook → Connection Status Handler 🔴

**As a** system,
**I want** to receive Evolution API webhook events and update connection status,
**so that** the dashboard reflects real-time WhatsApp session state.

**Acceptance Criteria:**

- [ ] AC-010.1: `POST /webhooks/evolution` receives and parses Evolution events
- [ ] AC-010.2: Event `connection.update` with state `open` → updates status to `connected`, records `phone` and `display_name`
- [ ] AC-010.3: Event `connection.update` with state `close` → updates status to `disconnected`
- [ ] AC-010.4: Event `connection.update` with state `conflict` or `banned` → updates status to `banned`
- [ ] AC-010.5: Extracts `tenantId` from instance name format `zap_{tenantId}_{connectionId}`
- [ ] AC-010.6: Returns HTTP 200 within 500ms (async DB update)

---

### ZAP-011 — Connections Page UI 🟠

**As a** tenant user,
**I want** a dashboard page to manage my WhatsApp connections,
**so that** I can see status and connect new numbers.

**Acceptance Criteria:**

- [ ] AC-011.1: Lists all connections with status badge (color-coded: green=connected, yellow=connecting, gray=disconnected, red=banned)
- [ ] AC-011.2: "Nova Conexão" button creates connection and opens QR modal
- [ ] AC-011.3: QR modal displays QR code image with 5s auto-refresh
- [ ] AC-011.4: QR modal closes automatically when connection becomes `connected`
- [ ] AC-011.5: Delete button with confirmation dialog
- [ ] AC-011.6: Page auto-refreshes connection list every 5 seconds
- [ ] AC-011.7: Shows phone number and display name when connected

---

## EPIC-03: Project & Group Management

> **Goal:** Organize WhatsApp groups into projects and phases for structured launch management.
> **Sprint:** 2 | **Phase:** MVP

---

### ZAP-012 — Create Project 🔴

**As a** tenant user,
**I want** to create a project associated with a WhatsApp connection,
**so that** I can organize groups for a specific launch.

**Acceptance Criteria:**

- [ ] AC-012.1: `POST /api/v1/projects` accepts `{ name, description?, connectionId }`
- [ ] AC-012.2: Validates `connectionId` belongs to tenant
- [ ] AC-012.3: Auto-creates 3 default phases: `Leads (order:0)`, `Aquecimento (order:1)`, `Compradores (order:2)` each with `capacity_per_group: 256`
- [ ] AC-012.4: Returns project with nested phases array
- [ ] AC-012.5: HTTP 201 on success

---

### ZAP-013 — List & Get Projects 🔴

**As a** tenant user,
**I want** to see all my projects and project details,
**so that** I can navigate and manage my launches.

**Acceptance Criteria:**

- [ ] AC-013.1: `GET /api/v1/projects` returns all non-archived projects with connection info and phases
- [ ] AC-013.2: `GET /api/v1/projects/:id` returns full project with phases and groups nested
- [ ] AC-013.3: Only returns projects belonging to authenticated tenant
- [ ] AC-013.4: Results ordered by `created_at DESC`

---

### ZAP-014 — Update & Archive Project 🟠

**As a** tenant user,
**I want** to update project details and archive completed projects,
**so that** I can keep my workspace organized.

**Acceptance Criteria:**

- [ ] AC-014.1: `PATCH /api/v1/projects/:id` accepts `{ name?, description?, status? }`
- [ ] AC-014.2: `DELETE /api/v1/projects/:id` sets status to `archived` (soft delete)
- [ ] AC-014.3: Archived projects not returned in list by default

---

### ZAP-015 — Custom Phase Creation 🟠

**As a** tenant user,
**I want** to add custom phases to a project,
**so that** I can model my specific launch funnel structure.

**Acceptance Criteria:**

- [ ] AC-015.1: `POST /api/v1/projects/:id/phases` accepts `{ name, capacity_per_group? }`
- [ ] AC-015.2: New phase assigned `order = max(existing_orders) + 1`
- [ ] AC-015.3: `capacity_per_group` defaults to 256 if not provided
- [ ] AC-015.4: Returns created phase object

---

### ZAP-016 — Register WhatsApp Group 🔴

**As a** tenant user,
**I want** to register an existing WhatsApp group into a project phase,
**so that** Zap can route leads into it and track participants.

**Acceptance Criteria:**

- [ ] AC-016.1: `POST /api/v1/groups` accepts `{ projectId, phaseId, waGroupId, name, capacity? }`
- [ ] AC-016.2: Validates `projectId` and `phaseId` belong to tenant
- [ ] AC-016.3: Calls Evolution API to fetch `wa_invite_link` for the group
- [ ] AC-016.4: Stores group with `participant_count: 0`, `status: active`
- [ ] AC-016.5: Returns HTTP 409 if `waGroupId` already registered for this tenant
- [ ] AC-016.6: Gracefully handles Evolution API failure (stores group without invite link, logs warning)

---

### ZAP-017 — Update Group & Refresh Invite Link 🟠

**As a** tenant user,
**I want** to update group details and refresh the WhatsApp invite link,
**so that** I can keep group info current.

**Acceptance Criteria:**

- [ ] AC-017.1: `PATCH /api/v1/groups/:id` accepts `{ name?, capacity?, status?, phaseId? }`
- [ ] AC-017.2: `POST /api/v1/groups/:id/refresh-link` calls Evolution API to revoke and re-fetch invite link
- [ ] AC-017.3: Updates `wa_invite_link` and `invite_link_refreshed_at` in DB

---

### ZAP-018 — Projects & Groups UI 🟠

**As a** tenant user,
**I want** a dashboard to manage projects and their groups,
**so that** I can visually organize my launch funnel.

**Acceptance Criteria:**

- [ ] AC-018.1: Projects list page shows card grid with name, status, phase count, connection info
- [ ] AC-018.2: "Novo Projeto" opens a form modal (name, description, connection selector)
- [ ] AC-018.3: Project detail page shows phases as columns with group cards inside each
- [ ] AC-018.4: Group card shows: name, participant count, capacity, fill percentage progress bar, status badge
- [ ] AC-018.5: "Adicionar Grupo" button opens form (waGroupId, name, capacity)
- [ ] AC-018.6: "Refresh Link" button on group card calls refresh endpoint
- [ ] AC-018.7: Phases with no groups show empty state with CTA

---

## EPIC-04: Dynamic Tracking Links

> **Goal:** Generate trackable links that automatically route visitors into WhatsApp groups using fill-first logic.
> **Sprint:** 3 | **Phase:** MVP

---

### ZAP-019 — Create Tracking Link 🔴

**As a** tenant user,
**I want** to generate a tracking link for a project phase,
**so that** I can share it and have leads automatically routed to groups.

**Acceptance Criteria:**

- [ ] AC-019.1: `POST /api/v1/projects/:id/links` accepts `{ phaseId, fallbackUrl? }`
- [ ] AC-019.2: Generates cryptographically random 8-character token (URL-safe)
- [ ] AC-019.3: Constructs `short_url` as `{APP_URL}/r/{token}`
- [ ] AC-019.4: Validates `phaseId` belongs to project
- [ ] AC-019.5: Returns link object with `short_url` and `token`
- [ ] AC-019.6: HTTP 201 on success

---

### ZAP-020 — Fill-First Redirect 🔴

**As a** lead clicking a tracking link,
**I want** to be redirected to a WhatsApp group with available space,
**so that** I join the group without any friction.

**Acceptance Criteria:**

- [ ] AC-020.1: `GET /r/:token` resolves link from DB (5-minute Redis cache)
- [ ] AC-020.2: Returns HTTP 302 redirect to `wa_invite_link` of the least-full active group in target phase
- [ ] AC-020.3: "Least full" = lowest `participant_count / capacity` ratio among `status = 'active'` groups
- [ ] AC-020.4: Group lookup uses Redis cache (30-second TTL) — cache miss → DB query → cache set
- [ ] AC-020.5: If all groups full → HTTP 302 redirect to `fallback_url` (if set) or HTTP 503 with JSON error
- [ ] AC-020.6: If link not found or `active = false` → HTTP 404 JSON error
- [ ] AC-020.7: Click recording fired asynchronously after redirect (non-blocking)
- [ ] AC-020.8: Response time p99 < 200ms (measured in production)

---

### ZAP-021 — Click Recording 🔴

**As a** system,
**I want** to record every link click asynchronously,
**so that** analytics data is captured without slowing down the redirect.

**Acceptance Criteria:**

- [ ] AC-021.1: Click record stored in `link_clicks` table with: `link_id`, `tenant_id`, `ip`, `user_agent`, `redirected_to_group_id`, `created_at`
- [ ] AC-021.2: `dynamic_links.click_count` incremented atomically
- [ ] AC-021.3: Click recording happens after HTTP redirect is sent (non-blocking)
- [ ] AC-021.4: Failure to record click does NOT affect redirect response
- [ ] AC-021.5: IP extracted from `X-Forwarded-For` header (Cloudflare proxy aware)

---

### ZAP-022 — List Links 🟠

**As a** tenant user,
**I want** to see all tracking links for a project,
**so that** I can manage and share them.

**Acceptance Criteria:**

- [ ] AC-022.1: `GET /api/v1/links?projectId=xxx` returns all links for project
- [ ] AC-022.2: Each link includes: `token`, `short_url`, `click_count`, `active`, `phase_id`
- [ ] AC-022.3: Only returns links belonging to tenant

---

### ZAP-023 — Link Analytics 🟠

**As a** tenant user,
**I want** to see click analytics for a specific link,
**so that** I can measure the performance of my traffic sources.

**Acceptance Criteria:**

- [ ] AC-023.1: `GET /api/v1/analytics/links/:linkId` returns: `totalClicks`, `clicksByDay` (last 30 days), `groupDistribution`
- [ ] AC-023.2: `clicksByDay` is an array of `{ date: 'YYYY-MM-DD', count: number }`
- [ ] AC-023.3: `groupDistribution` shows clicks per `redirected_to_group_id`

---

### ZAP-024 — Links Page UI 🟠

**As a** tenant user,
**I want** a dashboard page for managing tracking links,
**so that** I can generate, share, and monitor them.

**Acceptance Criteria:**

- [ ] AC-024.1: Lists all links with click count, phase name, active toggle
- [ ] AC-024.2: "Gerar Link" button opens form (phase selector, fallback URL)
- [ ] AC-024.3: Copy button copies `short_url` to clipboard with toast feedback
- [ ] AC-024.4: Click on link row opens analytics modal (click trend chart, group distribution)
- [ ] AC-024.5: Toggle to deactivate/reactivate link

---

## EPIC-05: Broadcast Engine

> **Goal:** Send bulk messages to WhatsApp groups with anti-ban rate limiting and real-time progress tracking.
> **Sprint:** 4 | **Phase:** MVP

---

### ZAP-025 — Create Broadcast 🔴

**As a** tenant user,
**I want** to create a broadcast with messages targeting specific groups or phases,
**so that** I can prepare mass communication campaigns.

**Acceptance Criteria:**

- [ ] AC-025.1: `POST /api/v1/broadcasts` accepts `{ projectId, connectionId, name, target_type, target_ids, messages, scheduled_at? }`
- [ ] AC-025.2: `messages` array: 1-10 items, each with `{ order, content_type, content }`
- [ ] AC-025.3: `target_type` values: `all_groups`, `specific_groups`, `phase`
- [ ] AC-025.4: Status set to `scheduled` if `scheduled_at` provided; `draft` otherwise
- [ ] AC-025.5: Messages stored in `broadcast_messages` table
- [ ] AC-025.6: Returns broadcast object with ID; HTTP 201

---

### ZAP-026 — Trigger Broadcast Send 🔴

**As a** tenant user,
**I want** to trigger immediate sending of a draft broadcast,
**so that** my launch day messages go out now.

**Acceptance Criteria:**

- [ ] AC-026.1: `POST /api/v1/broadcasts/:id/send` changes status to `sending`, sets `started_at`
- [ ] AC-026.2: Enqueues `broadcast:proc` job to BullMQ with `broadcastId` and `tenantId`
- [ ] AC-026.3: Only triggers from `draft` or `scheduled` status; returns 403 otherwise
- [ ] AC-026.4: Returns `{ success: true, message: 'Broadcast queued for sending' }`

---

### ZAP-027 — Broadcast Worker 🔴

**As a** system,
**I want** the broadcast worker to resolve target groups and enqueue individual message jobs,
**so that** each group receives the message independently with rate limiting.

**Acceptance Criteria:**

- [ ] AC-027.1: Worker reads broadcast from DB including messages
- [ ] AC-027.2: Resolves groups based on `target_type`:
  - `all_groups` → all active groups in project
  - `specific_groups` → groups with IDs in `target_ids`
  - `phase` → all active groups in phases in `target_ids`
- [ ] AC-027.3: Updates `total_count` on broadcast before queuing jobs
- [ ] AC-027.4: Enqueues one `message:send` job per group with staggered `delay` (2000ms × index)
- [ ] AC-027.5: On worker failure → updates broadcast status to `failed`
- [ ] AC-027.6: Worker concurrency: 2

---

### ZAP-028 — Message Worker 🔴

**As a** system,
**I want** the message worker to send messages to a single WhatsApp group with anti-ban delays,
**so that** messages are delivered safely without triggering WhatsApp's spam detection.

**Acceptance Criteria:**

- [ ] AC-028.1: Worker sends each message in sequence order
- [ ] AC-028.2: For `content_type: text` → calls `sessionManager.sendTextToGroup(tenantId, waGroupId, text)`
- [ ] AC-028.3: Applies 1-3s humanized delay between consecutive messages in same broadcast
- [ ] AC-028.4: On success → calls `increment_broadcast_sent` RPC
- [ ] AC-028.5: On failure after 3 retries → calls `increment_broadcast_failed` RPC
- [ ] AC-028.6: All sends logged: tenantId, broadcastId, waGroupId, content_type, success/fail
- [ ] AC-028.7: Worker concurrency: 5 parallel group sends max
- [ ] AC-028.8: Broadcast status auto-transitions to `sent` when `sent_count >= total_count`

---

### ZAP-029 — Broadcast Progress Tracking 🟠

**As a** tenant user,
**I want** to see real-time progress of a running broadcast,
**so that** I can monitor my launch day communications.

**Acceptance Criteria:**

- [ ] AC-029.1: `GET /api/v1/broadcasts/:id/status` returns `{ status, total_count, sent_count, failed_count, progress, started_at, completed_at }`
- [ ] AC-029.2: `progress` = `Math.round((sent_count / total_count) * 100)`
- [ ] AC-029.3: Frontend polls this endpoint every 3 seconds while status is `sending`

---

### ZAP-030 — Cancel Broadcast 🟡

**As a** tenant user,
**I want** to cancel a scheduled or draft broadcast,
**so that** I can abort mistaken campaigns.

**Acceptance Criteria:**

- [ ] AC-030.1: `POST /api/v1/broadcasts/:id/cancel` sets status to `failed`
- [ ] AC-030.2: Only allowed from `draft` or `scheduled` status
- [ ] AC-030.3: Returns 403 if broadcast is already `sending` or `sent`

---

### ZAP-031 — Broadcasts Page UI 🟠

**As a** tenant user,
**I want** a dashboard page to manage broadcasts,
**so that** I can create, monitor, and review my mass messages.

**Acceptance Criteria:**

- [ ] AC-031.1: Lists broadcasts with: name, status badge, delivery progress bar, timestamps
- [ ] AC-031.2: Status badges color-coded: draft=gray, scheduled=blue, sending=yellow (animated), sent=green, failed=red
- [ ] AC-031.3: "Novo Disparo" opens multi-step form: target selector → message editor → review → confirm
- [ ] AC-031.4: Progress bar shows `sent_count / total_count` with percentage
- [ ] AC-031.5: Sends page auto-refreshes every 5 seconds while any broadcast is in `sending` state
- [ ] AC-031.6: "Enviar Agora" button triggers immediate send for draft broadcasts

---

## EPIC-06: Webhook Integrations

> **Goal:** Process purchase events from payment platforms to automate lead and group management.
> **Sprint:** 5 | **Phase:** MVP

---

### ZAP-032 — Hotmart Webhook Endpoint 🔴

**As a** system,
**I want** to receive and validate Hotmart purchase webhooks,
**so that** purchase events trigger automated lead processing.

**Acceptance Criteria:**

- [ ] AC-032.1: `POST /webhooks/hotmart?tenantId={uuid}` receives webhook payload
- [ ] AC-032.2: Validates `X-Hotmart-Hottok` header using HMAC-SHA256 with tenant's Hotmart secret
- [ ] AC-032.3: Stores raw webhook in `webhook_events` table with `signature_valid` flag (even if invalid)
- [ ] AC-032.4: Returns HTTP 200 immediately (within 500ms) — processing is async
- [ ] AC-032.5: Returns HTTP 400 if `tenantId` query param missing
- [ ] AC-032.6: Invalid signature still stored but not processed (`signature_valid: false`)

---

### ZAP-033 — Hotmart Purchase Handler 🔴

**As a** system,
**I want** to process Hotmart PURCHASE_APPROVED events,
**so that** buyers are captured as leads and their score updated.

**Acceptance Criteria:**

- [ ] AC-033.1: Extracts buyer phone from `data.buyer.phone.phone` (normalizes to E.164)
- [ ] AC-033.2: Extracts buyer name from `data.buyer.name`
- [ ] AC-033.3: Upserts lead in `leads` table (unique constraint: `tenant_id + phone`)
- [ ] AC-033.4: Creates `lead_events` record with `type: 'purchase'`, `score_delta: +100`
- [ ] AC-033.5: Enqueues `trigger:proc` job to BullMQ with event data
- [ ] AC-033.6: Updates `webhook_events.processed: true` and `processed_at` after successful handling

---

### ZAP-034 — Trigger Worker (Purchase → Group Move) 🔴

**As a** system,
**I want** the trigger worker to process purchase events and add buyers to the buyer group,
**so that** purchase confirmation is automated end-to-end.

**Acceptance Criteria:**

- [ ] AC-034.1: Worker processes `trigger:proc` jobs with event `purchase`
- [ ] AC-034.2: Upserts lead record with phone, name, email, `last_active_at`
- [ ] AC-034.3: Records `lead_events` entry with `score_delta: +100` for purchase
- [ ] AC-034.4: Updates `leads.score` atomically
- [ ] AC-034.5: Worker concurrency: 10
- [ ] AC-034.6: Failed jobs logged with lead phone and error message

---

### ZAP-035 — Evolution Webhook → Group Participant Handler 🟠

**As a** system,
**I want** to process Evolution API group participant events,
**so that** group participant counts stay accurate automatically.

**Acceptance Criteria:**

- [ ] AC-035.1: `POST /webhooks/evolution` handles `group.participants.update` event
- [ ] AC-035.2: On participant `add` action → calls `increment_group_participants(groupId)` RPC
- [ ] AC-035.3: On participant `remove` action → calls `decrement_group_participants(groupId)` RPC
- [ ] AC-035.4: Looks up group by `wa_group_id` scoped to tenant
- [ ] AC-035.5: Auto-transition: group → `full` when `participant_count >= capacity` (handled in RPC)
- [ ] AC-035.6: Returns HTTP 200 within 200ms

---

### ZAP-036 — Webhook Audit Log UI 🟡

**As a** tenant admin,
**I want** to see a log of all incoming webhook events,
**so that** I can debug integration issues.

**Acceptance Criteria:**

- [ ] AC-036.1: Dashboard page lists `webhook_events` for tenant (last 100)
- [ ] AC-036.2: Shows: source, event type, received_at, signature_valid, processed
- [ ] AC-036.3: Click to expand raw payload JSON
- [ ] AC-036.4: Filter by source (hotmart / evolution / generic)

---

## EPIC-07: Dashboard & Analytics

> **Goal:** Provide real-time visibility into launch health and performance metrics.
> **Sprint:** 6 | **Phase:** MVP

---

### ZAP-037 — Analytics Overview Endpoint 🔴

**As a** tenant user,
**I want** an API endpoint that returns all key metrics in one call,
**so that** the dashboard loads fast with a single request.

**Acceptance Criteria:**

- [ ] AC-037.1: `GET /api/v1/analytics/overview` returns: connections (total, connected), projects (total, active), groups (total, active, full, totalParticipants, totalCapacity, occupancyRate), leads (total, avgScore), clicks (last30Days)
- [ ] AC-037.2: `occupancyRate = Math.round(totalParticipants / totalCapacity * 100)`
- [ ] AC-037.3: Response time < 500ms (optimized with parallel queries)
- [ ] AC-037.4: Supports optional `?projectId=xxx` to scope to a single project

---

### ZAP-038 — Group Analytics Endpoint 🟠

**As a** tenant user,
**I want** to query group fill rates via API,
**so that** the analytics page can visualize group performance.

**Acceptance Criteria:**

- [ ] AC-038.1: `GET /api/v1/analytics/groups?projectId=xxx` returns groups with `fillRate` field
- [ ] AC-038.2: `fillRate = Math.round(participant_count / capacity * 100)`
- [ ] AC-038.3: Results ordered by `participant_count DESC`

---

### ZAP-039 — Broadcast Analytics Endpoint 🟠

**As a** tenant user,
**I want** to query broadcast delivery rates via API,
**so that** I can measure broadcast effectiveness.

**Acceptance Criteria:**

- [ ] AC-039.1: `GET /api/v1/analytics/broadcasts?projectId=xxx` returns last 50 broadcasts with `deliveryRate`
- [ ] AC-039.2: `deliveryRate = Math.round(sent_count / total_count * 100)`

---

### ZAP-040 — Overview Dashboard Page 🔴

**As a** tenant user,
**I want** a dashboard homepage with key metrics,
**so that** I can assess launch health at a glance.

**Acceptance Criteria:**

- [ ] AC-040.1: Shows 4 stat cards: connections, projects, participants, leads
- [ ] AC-040.2: Shows link clicks (last 30 days) as a prominent number
- [ ] AC-040.3: Shows group occupancy progress bar
- [ ] AC-040.4: Skeleton loaders while data fetches
- [ ] AC-040.5: Refreshes data every 30 seconds automatically
- [ ] AC-040.6: Mobile-responsive layout (single column on < 768px)

---

### ZAP-041 — Analytics Page 🟠

**As a** tenant user,
**I want** an analytics page with group and broadcast metrics,
**so that** I can evaluate the performance of my launch funnel.

**Acceptance Criteria:**

- [ ] AC-041.1: Shows group fill rate list (name, phase, fill %, participant bar)
- [ ] AC-041.2: Shows broadcast delivery summary (name, status, delivery rate)
- [ ] AC-041.3: Empty states with descriptive messages when no data

---

### ZAP-042 — Realtime Updates (Supabase Realtime) 🟡

**As a** tenant user,
**I want** the dashboard to update automatically when data changes,
**so that** I don't need to manually refresh during a launch.

**Acceptance Criteria:**

- [ ] AC-042.1: `useRealtimeConnection` hook subscribes to `whatsapp_connections` changes for active connection
- [ ] AC-042.2: `useRealtimeBroadcasts` hook subscribes to `broadcasts` table changes
- [ ] AC-042.3: `useRealtimeGroups` hook subscribes to `groups` table changes
- [ ] AC-042.4: On DB change → corresponding TanStack Query cache is invalidated
- [ ] AC-042.5: Subscriptions cleaned up on component unmount

---

## EPIC-08: Sequence Automation

> **Goal:** Enable drip campaigns triggered by lead events.
> **Phase:** V1 | **Sprint:** 9-10

---

### ZAP-043 — Sequence Data Model 🔴

**As a** backend engineer,
**I want** database tables for sequences and sequence enrollments,
**so that** per-lead drip automation can be tracked.

**Acceptance Criteria:**
- [ ] `sequences` table: id, tenant_id, project_id, name, trigger_type, status
- [ ] `sequence_steps` table: id, sequence_id, order, delay_hours, messages (JSONB)
- [ ] `sequence_enrollments` table: id, sequence_id, lead_id, current_step, enrolled_at, completed_at, paused
- [ ] Migration applies clean with no errors
- [ ] RLS policies enforce tenant isolation

---

### ZAP-044 — Sequence Builder API 🟠

**As a** tenant user,
**I want** to create and manage sequences via API,
**so that** I can configure automated message campaigns.

**Acceptance Criteria:**
- [ ] CRUD for sequences (create, list, get, update, delete)
- [ ] CRUD for sequence steps (add, reorder, remove)
- [ ] Trigger types: `group_join`, `purchase`, `manual`
- [ ] Sequence status: `active`, `paused`, `archived`

---

### ZAP-045 — Sequence Enrollment on Trigger 🔴

**As a** system,
**I want** leads to be automatically enrolled in sequences when a trigger event fires,
**so that** automation starts without manual intervention.

**Acceptance Criteria:**
- [ ] Purchase event → enroll lead in all active `purchase`-triggered sequences for project
- [ ] Group join event → enroll lead in all active `group_join`-triggered sequences for phase
- [ ] Upsert enrollment (no duplicate enrollments for same lead + sequence)
- [ ] Enrollment starts at `current_step = 0`

---

### ZAP-046 — Sequence Tick Worker 🔴

**As a** system,
**I want** a worker that processes sequence steps on schedule,
**so that** drip messages are sent at the configured delay after enrollment.

**Acceptance Criteria:**
- [ ] `sequence:tick` queue processed by worker every 5 minutes
- [ ] Worker queries enrollments where `enrolled_at + step.delay_hours <= NOW()`
- [ ] Sends messages for due step via message worker
- [ ] Advances `current_step` after successful send
- [ ] Marks enrollment `completed` when all steps sent
- [ ] Respects pause state on enrollment

---

### ZAP-047 — Sequence Unsubscribe 🟡

**As a** lead,
**I want** to stop receiving sequence messages by sending a keyword,
**so that** I can opt out of automated messages.

**Acceptance Criteria:**
- [ ] Evolution incoming message handler detects keywords: "PARAR", "STOP", "CANCELAR"
- [ ] Pauses all active enrollments for the lead's phone
- [ ] Sends confirmation message: "Você foi removido da sequência."

---

### ZAP-048 → ZAP-050 — Sequence UI 🟠

- ZAP-048: Sequence list page (name, trigger, steps, active toggle)
- ZAP-049: Sequence builder (step editor with delay and message inputs)
- ZAP-050: Sequence enrollment tracking (per-lead step status)

---

## EPIC-09: Lead Management

> **Goal:** Provide visibility into leads captured by the platform.
> **Phase:** V1 | **Sprint:** 7

---

### ZAP-051 — Lead List API 🟠

**Acceptance Criteria:**
- [ ] `GET /api/v1/leads?page&limit&search&tag` returns paginated lead list
- [ ] Search by phone or name
- [ ] Filter by tags
- [ ] Ordered by `last_active_at DESC`

### ZAP-052 — Lead Detail API 🟡

**Acceptance Criteria:**
- [ ] `GET /api/v1/leads/:id` returns lead with group history and event timeline
- [ ] Event timeline ordered by `created_at DESC`

### ZAP-053 — Lead Tags API 🟡

**Acceptance Criteria:**
- [ ] `PATCH /api/v1/leads/:id/tags` updates tags array
- [ ] Supports add and remove operations

### ZAP-054 — Lead CSV Export 🟡

**Acceptance Criteria:**
- [ ] `GET /api/v1/leads/export` returns CSV with: phone, name, email, score, tags, first_seen_at
- [ ] Scoped to tenant only

### ZAP-055 — Lead Management UI 🟠

**Acceptance Criteria:**
- [ ] Table with search, filter by tags, pagination
- [ ] Lead detail slide-over with event history
- [ ] Score badge with color gradient (0-50 gray, 51-100 yellow, 100+ green)
- [ ] Export CSV button

---

## EPIC-10: Advanced Analytics

> **Goal:** Enable funnel analysis and conversion insights.
> **Phase:** V1 | **Sprint:** 11

---

### ZAP-056 — Funnel Conversion Analytics 🟠

**Acceptance Criteria:**
- [ ] `GET /api/v1/analytics/funnel?projectId` returns: link_clicks → group_joins → purchases (conversion %)
- [ ] Calculated from `link_clicks`, `group_participants`, `lead_events` tables

### ZAP-057 — Broadcast Performance Heatmap 🟡

**Acceptance Criteria:**
- [ ] `GET /api/v1/analytics/broadcasts/heatmap` returns message delivery counts by hour of day
- [ ] Identifies optimal send times

### ZAP-058 → ZAP-061 — Analytics UI Components 🟡

- ZAP-058: Funnel visualization (bar chart with conversion percentages)
- ZAP-059: Broadcast heatmap (time-of-day grid)
- ZAP-060: Lead score distribution histogram
- ZAP-061: Date range filter component for all analytics

---

## EPIC-11: Team Management

> **Goal:** Allow multiple users to access a tenant workspace with role-based permissions.
> **Phase:** V1 | **Sprint:** 11

---

### ZAP-062 — Invite Team Member 🟠

**Acceptance Criteria:**
- [ ] `POST /api/v1/team/invite` sends email invitation (via Resend) with magic link
- [ ] Creates pending `tenant_users` record with `role`
- [ ] Roles: `admin` (full access), `operator` (no team management), `viewer` (read-only)

### ZAP-063 — Accept Invitation 🟠

**Acceptance Criteria:**
- [ ] Magic link creates Supabase auth user and links to tenant_users record
- [ ] JWT claims include `role` for RLS enforcement

### ZAP-064 — Revoke Access 🟠

**Acceptance Criteria:**
- [ ] `DELETE /api/v1/team/:userId` removes tenant_users record
- [ ] Only admins can revoke access

### ZAP-065 — Team Settings UI 🟠

**Acceptance Criteria:**
- [ ] Lists team members with role badges
- [ ] "Convidar" form with email and role selector
- [ ] Revoke button with confirmation

---

## EPIC-12: Kiwify Integration

> **Goal:** Process Kiwify purchase webhooks with the same flow as Hotmart.
> **Phase:** V1 | **Sprint:** 8

---

### ZAP-066 — Kiwify Webhook Endpoint 🟠

**Acceptance Criteria:**
- [ ] `POST /webhooks/kiwify?tenantId={uuid}` validates Kiwify webhook signature
- [ ] Stores event in `webhook_events` with `source: 'kiwify'`
- [ ] Returns HTTP 200 immediately

### ZAP-067 — Kiwify Purchase Handler 🟠

**Acceptance Criteria:**
- [ ] Extracts buyer phone from Kiwify payload schema
- [ ] Same lead upsert + event recording flow as Hotmart handler
- [ ] Enqueues `trigger:proc` job

### ZAP-068 — Kiwify Docs & Setup Guide 🟡

**Acceptance Criteria:**
- [ ] In-app documentation page showing how to configure Kiwify webhook URL
- [ ] Shows tenant-specific webhook URL
- [ ] Step-by-step with screenshots placeholder

---

## Implementation Priority Matrix

| Priority | Stories | Sprint |
|---------|---------|--------|
| 🔴 CRITICAL (must ship MVP) | ZAP-001, 002, 003, 004, 006, 007, 010, 012, 016, 019, 020, 021, 025, 026, 027, 028, 032, 033, 034, 037, 040 | 0-6 |
| 🟠 HIGH (complete MVP) | ZAP-005, 008, 009, 011, 013, 014, 015, 017, 018, 022, 023, 024, 029, 031, 035, 038, 039, 041 | 0-6 |
| 🟡 MEDIUM (V1 must-have) | ZAP-030, 036, 042, 044, 045, 046, 051, 052, 055, 056, 062, 063, 064, 065, 066, 067 | 7-11 |
| 🟢 LOW (V1 nice-to-have) | ZAP-043, 047-050, 053, 054, 057-061, 068 | 11+ |

---

## Story Template Reference

```yaml
# Story template for @sm when creating individual story files
id: ZAP-XXX
title: "Story title"
epic: EPIC-0X
sprint: N
priority: CRITICAL | HIGH | MEDIUM | LOW
points: N
status: Ready

user_story:
  as_a: "role"
  i_want: "capability"
  so_that: "benefit"

acceptance_criteria:
  - id: AC-XXX.1
    description: "Testable criterion"
    status: pending

implementation_notes:
  files_affected: []
  dependencies: []
  risks: []

definition_of_done:
  - [ ] All AC passing
  - [ ] Unit tests written
  - [ ] No lint/typecheck errors
  - [ ] Code reviewed
  - [ ] Story file updated with File List
```

---

*Prepared by: Pax — Product Owner*
*Reference: docs/prd/zap-prd.md v1.0*
*Ready for: `@sm *draft EPIC-01` — start story creation workflow*

— Pax, equilibrando prioridades 🎯
