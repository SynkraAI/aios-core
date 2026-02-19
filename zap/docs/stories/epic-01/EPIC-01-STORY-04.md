# EPIC-01-STORY-04 — BullMQ Queue Infrastructure
**Story ID:** ZAP-004
**Epic:** EPIC-01 — Foundation & Infrastructure
**Sprint:** 0 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** backend engineer building the Zap automation engine,
**I want** BullMQ v5 queues and workers bootstrapped with IORedis, typed job payloads, and graceful shutdown,
**so that** all async workloads (message sending, broadcast processing, trigger handling) run reliably without blocking the HTTP API and can be scaled independently.

---

## Context & Background

The Zap platform's async workloads are too heavy to handle synchronously in HTTP request handlers:
- **Message sending** — Each message needs a humanized 2–8s delay to avoid WhatsApp anti-ban detection
- **Broadcast processing** — Fan-out to hundreds of groups must be enqueued, not blocking
- **Trigger processing** — Hotmart/Kiwify webhook events need reliable processing with retries

BullMQ v5 (not v4 — API changed significantly) with IORedis provides:
- Persistent queue state in Redis
- Automatic retries with exponential backoff
- Concurrency control per worker
- Job lifecycle events for observability

All queue configuration files were scaffolded in `apps/api/src/queues/index.ts` and individual worker files in `apps/api/src/workers/`. The developer must verify the implementation is correct and ensure the worker process starts cleanly.

**Key design decisions:**
- Workers run as a **separate process** from the HTTP server (different entry point)
- `apps/api/src/workers/index.ts` is the worker process entry point
- HTTP API only **enqueues jobs** — it never processes them
- Redis is shared between API (enqueue) and workers (process)

---

## Acceptance Criteria

### AC-004.1 — Four queues defined with correct configuration
```typescript
// apps/api/src/queues/index.ts must export:
export const messageQueue    // name: 'message:send'
export const broadcastQueue  // name: 'broadcast:proc'
export const sequenceQueue   // name: 'sequence:tick'
export const triggerQueue    // name: 'trigger:proc'
```

Each queue must have:
```typescript
{
  connection: redisConnection,  // IORedis instance from config.redis.url
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  }
}
```

Verification:
```bash
# After worker:dev starts, check Redis keys:
redis-cli keys "bull:*"
# EXPECTED: bull:message:send, bull:broadcast:proc, bull:sequence:tick, bull:trigger:proc
```

### AC-004.2 — Three workers start without errors
```bash
npm run worker:dev -w apps/api
# EXPECTED log lines (all three must appear):
# "message:send worker started" { concurrency: 5 }
# "broadcast:proc worker started" { concurrency: 2 }
# "trigger:proc worker started" { concurrency: 10 }
# NO "Cannot find module" errors
# NO TypeScript errors
```

### AC-004.3 — Job payload types are defined for all queues

```typescript
// apps/api/src/queues/index.ts must define and export:

export interface MessageJobData {
  broadcastId: string
  groupId: string
  tenantId: string
  connectionId: string
  content: { type: string; text?: string }
  scheduledFor?: string
}

export interface BroadcastJobData {
  broadcastId: string
  tenantId: string
}

export interface TriggerJobData {
  source: 'hotmart' | 'kiwify' | 'generic'
  event: string
  tenantId: string
  email: string
  phone?: string
  productId?: string
  purchaseId?: string
  payload: unknown
}
```

Workers must be typed: `Worker<MessageJobData>`, etc. — TypeScript must enforce this.

### AC-004.4 — humanizedDelay() in messageWorker
The message worker must NOT send messages immediately. It must call a delay function:

```typescript
// The delay function must produce a random value between min and max:
async function humanizedDelay(minMs = 2000, maxMs = 8000): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs
  await new Promise(resolve => setTimeout(resolve, delay))
}
```

Verification: Trigger a test broadcast and observe the logs — messages should appear with 2–8s gaps between them, not instantly.

### AC-004.5 — Failed jobs are logged
When a job fails (after all retry attempts exhausted), the worker must log:
```typescript
worker.on('failed', (job, err) => {
  logger.error('Job failed permanently', {
    queue: 'message:send',  // or appropriate queue name
    jobId: job?.id,
    data: job?.data,
    error: err.message,
  })
})
```

Verification: Submit a job that throws an error and confirm Winston logs a structured error entry with `level: 'error'`.

### AC-004.6 — Graceful shutdown on SIGTERM/SIGINT
```bash
# Start workers:
npm run worker:dev -w apps/api

# Send SIGTERM:
kill -TERM <pid>

# EXPECTED log lines (in order):
# "Shutting down workers..."
# "message:send worker closed"
# "broadcast:proc worker closed"
# "trigger:proc worker closed"
# "All workers shut down" (or similar)
# Process exits with code 0
```

Implementation required:
```typescript
// apps/api/src/workers/index.ts
async function shutdown() {
  logger.info('Shutting down workers...')
  await Promise.all([
    messageWorker.close(),
    broadcastWorker.close(),
    triggerWorker.close(),
  ])
  await redisConnection.quit()
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
```

### AC-004.7 — API can enqueue jobs
The HTTP API must be able to enqueue jobs WITHOUT requiring workers to be running:

```typescript
// In apps/api/src/routes/broadcasts.ts:
await broadcastQueue.add('process', { broadcastId, tenantId })
// EXPECTED: Returns job with id, does NOT throw if worker is offline
```

Queues are decoupled from workers — Redis holds the jobs; workers pick them up when running.

### AC-004.8 — npm scripts defined for worker process
```json
// apps/api/package.json must include:
{
  "scripts": {
    "worker:dev": "tsx watch src/workers/index.ts",
    "worker:start": "node dist/workers/index.js"
  }
}
```

```bash
npm run worker:dev -w apps/api
# EXPECTED: tsx watch starts, workers initialize, no errors
```

---

## Technical Notes

### Files to Verify / Fix

| File | Status | Key things to check |
|------|--------|---------------------|
| `apps/api/src/queues/index.ts` | Exists | 4 queues, IORedis connection, job payload types |
| `apps/api/src/workers/message.worker.ts` | Exists | `Worker<MessageJobData>`, humanizedDelay, failed handler |
| `apps/api/src/workers/broadcast.worker.ts` | Exists | `Worker<BroadcastJobData>`, fan-out logic |
| `apps/api/src/workers/trigger.worker.ts` | Exists | `Worker<TriggerJobData>`, lead upsert logic |
| `apps/api/src/workers/index.ts` | Exists | All 3 workers started, graceful shutdown |
| `apps/api/package.json` | Exists | `worker:dev` and `worker:start` scripts |

### IORedis connection pattern
```typescript
// apps/api/src/queues/index.ts
import IORedis from 'ioredis'
import { Queue, Worker } from 'bullmq'
import { config } from '../lib/config.js'

export const redisConnection = new IORedis(config.redis.url, {
  maxRetriesPerRequest: null,  // REQUIRED by BullMQ
  enableReadyCheck: false,     // REQUIRED for BullMQ compatibility
})
```

**Critical:** `maxRetriesPerRequest: null` is REQUIRED by BullMQ v5. Without it, BullMQ throws an error on startup.

### BullMQ v5 Worker constructor (changed from v4)
```typescript
// BullMQ v5 — CORRECT:
const worker = new Worker<MessageJobData>(
  'message:send',
  async (job) => {
    // processor function
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
)

// BullMQ v4 — WRONG (do not use):
// new Worker('name', processor, { createClient: ... })
```

### messageWorker anti-ban logic
```typescript
// apps/api/src/workers/message.worker.ts
// Message sending flow:
// 1. humanizedDelay(2000, 8000)  — wait 2-8 seconds
// 2. Call Evolution API to send message
// 3. On success: increment_broadcast_sent RPC
// 4. On failure: increment_broadcast_failed RPC + throw (triggers retry)
```

### broadcastWorker fan-out
```typescript
// apps/api/src/workers/broadcast.worker.ts
// Fan-out flow:
// 1. Load broadcast record (target_type, target_ids, content)
// 2. Resolve target groups (all_groups / specific_groups / phase)
// 3. Update broadcast.total_count = resolved groups count
// 4. Enqueue one MessageJobData per group into messageQueue
//    with 2-second staggered delay per job (scheduledFor offset)
// 5. Update broadcast status → 'sending'
```

### triggerWorker lead processing
```typescript
// apps/api/src/workers/trigger.worker.ts
// Trigger flow:
// 1. Parse source-specific payload (hotmart vs kiwify vs generic)
// 2. Upsert lead (INSERT ON CONFLICT UPDATE) in leads table
// 3. Insert lead_event record with event_type and metadata
// 4. Update lead.score based on event type:
//    purchase → +50 pts, refund → -50 pts
// 5. (Future) Trigger sequence enrollment if applicable
```

### config.redis
```typescript
// apps/api/src/lib/config.ts must include:
export const config = {
  // ...
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  // ...
}
```

### Rate limiting between API and workers
The `rate-limit.ts` middleware also uses Redis. Make sure the same `redisConnection` is NOT shared between rate limiter and BullMQ worker — use separate IORedis instances:
- `rateLimitRedis` — for rate limiting middleware (in API process)
- `redisConnection` — for BullMQ queues (exported from `queues/index.ts`)

---

## Dependencies

| Dependency | Type | Blocking? |
|-----------|------|----------|
| EPIC-01-STORY-03 | Hard | YES — workers import `supabaseAdmin`, `logger` from API lib; `queues/index.ts` must exist for API routes to enqueue |
| Redis running | Runtime | YES — BullMQ cannot initialize without Redis; `docker-compose up redis` before testing |
| Evolution API running | Runtime | Soft — messageWorker will fail jobs if Evolution is down, but workers still start |

**Blocks:**
- EPIC-02-STORY-03 (Connection monitoring — `sequence:tick` queue needed)
- EPIC-04 (Broadcast execution workers)
- EPIC-06 (Trigger processing for Hotmart/Kiwify)

---

## Definition of Done

- [x] `npm run worker:dev -w apps/api` starts all 3 workers with no errors (AC-004.2)
- [x] Four queues visible in Redis after worker start (AC-004.1)
- [x] All job payload interfaces exported from `queues/index.ts` (AC-004.3)
- [x] `humanizedDelay()` implemented in messageWorker with 2-8s range (AC-004.4)
- [x] Failed jobs log structured error via Winston (AC-004.5)
- [x] SIGTERM/SIGINT triggers graceful shutdown, exits code 0 (AC-004.6)
- [x] `broadcastQueue.add()` works from API routes without worker running (AC-004.7)
- [x] `worker:dev` and `worker:start` scripts in `apps/api/package.json` (AC-004.8)
- [x] `npm run typecheck -w apps/api` passes with 0 errors
- [x] Story file updated with file list

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/queues/index.ts` | fixed | Queue names hyphens→colons; MessageJobData + TriggerJobData updated |
| `apps/api/src/workers/message.worker.ts` | fixed | humanizedDelay before send, new MessageJobData shape, failed handler |
| `apps/api/src/workers/broadcast.worker.ts` | fixed | Fan-out one job per (group×message), 2s stagger, new MessageJobData |
| `apps/api/src/workers/trigger.worker.ts` | fixed | New TriggerJobData, email-only lead support, payload field |
| `apps/api/src/workers/index.ts` | fixed | redisConnection.quit() on shutdown, per-worker close logs |
| `apps/api/src/services/integrations/hotmart.ts` | fixed | Updated enqueue to new TriggerJobData shape |
| `apps/api/package.json` | verified | worker:dev + worker:start scripts present |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-18 | River (SM) | Story created |
| 2026-02-19 | Dex (Dev) | Fixed queue names (hyphens→colons), MessageJobData/TriggerJobData shapes, worker startup logs, graceful shutdown, hotmart.ts enqueue, 0 TypeScript errors |

---

*Source: docs/prd/zap-prd.md § FR-MSG-01–04, § NFR-PERF-02 (async processing)*
*Source: docs/stories/zap-user-stories.md § ZAP-004*
*Source: docs/architecture/system-architecture.md § 5 (Queue Architecture)*
*Next story: EPIC-01-STORY-05*
