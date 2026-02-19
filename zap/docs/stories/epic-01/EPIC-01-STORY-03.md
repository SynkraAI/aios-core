# EPIC-01-STORY-03 — Hono API Bootstrap
**Story ID:** ZAP-003
**Epic:** EPIC-01 — Foundation & Infrastructure
**Sprint:** 0 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Ready
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** developer building the Zap API,
**I want** the Hono server bootstrapped with authentication middleware, CORS, structured logging, and a consistent error-handling layer,
**so that** every future route handler inherits secure defaults and the codebase has a single, predictable pattern for errors and auth.

---

## Context & Background

The API lives at `apps/api/src/index.ts`. It uses **Hono.js v4** (not Express) running on Node.js 20 with ESM modules.

All scaffold files for this story were created during the architecture session. The developer must verify each file is correct, ensure all middleware chains work end-to-end, and confirm the server starts cleanly.

**Key design decisions:**
- Two Supabase clients: `supabase` (anon, respects RLS) and `supabaseAdmin` (service-role, bypasses RLS)
- `authMiddleware` extracts `tenant_id` and `role` from Supabase JWT and attaches them to Hono's context via typed `ContextVariableMap`
- All errors are typed (`AppError` subclasses) — route handlers `throw`, the global handler catches
- `@hono/zod-validator` used for request body validation in all routes

---

## Acceptance Criteria

### AC-003.1 — Health check responds correctly
```bash
curl http://localhost:3001/health
# EXPECTED HTTP 200:
# { "status": "ok", "timestamp": "2026-02-18T..." }
```

### AC-003.2 — Protected routes reject unauthenticated requests
```bash
# Without token:
curl http://localhost:3001/api/v1/connections
# EXPECTED HTTP 401:
# { "error": "Unauthorized", "code": "UNAUTHORIZED" }

# With invalid token:
curl -H "Authorization: Bearer invalid.jwt.token" http://localhost:3001/api/v1/connections
# EXPECTED HTTP 401
```

### AC-003.3 — authMiddleware attaches tenant context
When a valid Supabase JWT is provided, the middleware must:
1. Verify the JWT signature with Supabase
2. Extract `tenant_id` from JWT claims (custom claim set by auth hook)
3. Extract `role` from JWT claims
4. Attach both to Hono context (`c.get('tenantId')`, `c.get('role')`)

```typescript
// In any route handler, these must work:
const tenantId = c.get('tenantId')  // string (UUID)
const role = c.get('role')          // 'admin' | 'operator' | 'viewer'
```

TypeScript must enforce this via `ContextVariableMap`:
```typescript
// apps/api/src/middleware/auth.ts
declare module 'hono' {
  interface ContextVariableMap {
    tenantId: string
    role: string
  }
}
```

### AC-003.4 — AppError produces correct HTTP responses

| Error Class | HTTP Status | Response body |
|------------|-------------|--------------|
| `AppError('msg', 'CODE', 400)` | 400 | `{ error: 'msg', code: 'CODE', details: undefined }` |
| `NotFoundError('Connection')` | 404 | `{ error: 'Connection not found', code: 'NOT_FOUND' }` |
| `UnauthorizedError()` | 401 | `{ error: 'Unauthorized', code: 'UNAUTHORIZED' }` |
| `ForbiddenError('reason')` | 403 | `{ error: 'reason', code: 'FORBIDDEN' }` |
| `PlanLimitError('connections')` | 403 | `{ error: '...', code: 'PLAN_LIMIT_EXCEEDED' }` |
| Unhandled JS Error | 500 | `{ error: 'Internal server error', code: 'INTERNAL_ERROR' }` |

Test with:
```bash
curl http://localhost:3001/api/v1/connections/nonexistent-id \
  -H "Authorization: Bearer $VALID_JWT"
# EXPECTED HTTP 404: { "error": "Connection not found", "code": "NOT_FOUND" }
```

### AC-003.5 — CORS configured correctly
```bash
# From a browser origin of http://localhost:3000:
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:3001/api/v1/connections
# EXPECTED: Response has header:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

CORS must allow origins from both `APP_URL` env variable and `http://localhost:3000`.

### AC-003.6 — Structured logging works
```bash
NODE_ENV=development npm run dev -w apps/api
# EXPECTED: Colorized Winston output in terminal
# EXPECTED: Every API request logged with method, path, status, duration

NODE_ENV=production npm start -w apps/api
# EXPECTED: JSON log output (not colorized)
# EXPECTED: Each log line is valid JSON with { level, message, timestamp, ... }
```

### AC-003.7 — Unhandled errors logged and return 500
```typescript
// If a route throws an unexpected Error (not AppError):
// - Winston logs: { level: 'error', message: 'Unhandled error', error: {...} }
// - Response: HTTP 500 { error: 'Internal server error', code: 'INTERNAL_ERROR' }
// - Original error details NOT exposed to client
```

### AC-003.8 — Pretty JSON in development
```bash
NODE_ENV=development curl http://localhost:3001/health
# EXPECTED: Indented JSON response

NODE_ENV=production curl http://localhost:3001/health
# EXPECTED: Minified JSON response
```

### AC-003.9 — All routes registered without import errors
```bash
npm run dev -w apps/api
# EXPECTED: Server starts on port 3001 with log line:
# "Zap API running on port 3001" { env: 'development', url: 'http://localhost:3001' }
# EXPECTED: No "Cannot find module" errors
# EXPECTED: No TypeScript compile errors (tsx handles this in dev)
```

The following routes must be registered (even if empty stubs):
- `GET /health`
- `GET /r/:token` (redirect service)
- `GET|POST|PATCH|DELETE /api/v1/connections`
- `GET|POST|PATCH|DELETE /api/v1/projects`
- `GET|POST|PATCH|DELETE /api/v1/groups`
- `GET|POST /api/v1/links`
- `GET|POST /api/v1/broadcasts`
- `GET /api/v1/analytics/overview`
- `POST /webhooks/hotmart`
- `POST /webhooks/evolution`

---

## Technical Notes

### Files to Verify / Fix

| File | Status | Key things to check |
|------|--------|---------------------|
| `apps/api/src/index.ts` | Exists | All 7 routers imported, middleware order correct |
| `apps/api/src/lib/config.ts` | Exists | All env vars typed, `required()` throws on missing |
| `apps/api/src/lib/logger.ts` | Exists | Winston, colorized dev / JSON prod |
| `apps/api/src/lib/errors.ts` | Exists | AppError + 5 subclasses all defined |
| `apps/api/src/db/client.ts` | Exists | `supabase` (anon) + `supabaseAdmin` (service_role) |
| `apps/api/src/middleware/auth.ts` | Exists | JWT validation, `ContextVariableMap` declaration |
| `apps/api/src/middleware/rate-limit.ts` | Exists | Per-IP and per-tenant Redis rate limiters |

### Middleware execution order in index.ts
```typescript
// CORRECT ORDER — do not change:
app.use('*', cors({...}))              // 1. CORS first (handles preflight)
app.use('/api/*', honoLogger())        // 2. Request logging
app.use('*', prettyJSON())             // 3. Pretty JSON (dev only, guarded by if)

// Routes AFTER middleware:
app.get('/health', ...)                // 4. Health (no auth)
app.route('/', redirectRouter)         // 5. Redirect (no auth — public)
app.route('/api/v1/...', router)       // 6. Protected routes (auth applied inside each router)
app.route('/webhooks/...', router)     // 7. Webhooks (no JWT auth — use secret validation)
```

### authMiddleware implementation pattern
```typescript
// apps/api/src/middleware/auth.ts
import { createMiddleware } from 'hono/factory'
import { supabase } from '../db/client.js'

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }
  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }
  const tenantId = user.user_metadata?.tenant_id as string
  const role = user.user_metadata?.role as string ?? 'operator'
  if (!tenantId) {
    return c.json({ error: 'No tenant associated', code: 'NO_TENANT' }, 403)
  }
  c.set('tenantId', tenantId)
  c.set('role', role)
  await next()
})
```

**Important:** `authMiddleware` is applied INSIDE each router (not globally), because:
- `/health`, `/r/:token`, `/webhooks/*` are public/unauthenticated
- Only `/api/v1/*` routes require JWT auth

### Error class hierarchy
```typescript
// apps/api/src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: unknown
  ) { super(message) }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}
// UnauthorizedError(401), ForbiddenError(403), PlanLimitError(403), SessionBannedError(403)
```

### config.ts pattern
```typescript
// All env vars must go through typed helpers:
function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

export const config = {
  port: parseInt(process.env.PORT ?? '3001'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDev: process.env.NODE_ENV !== 'production',
  supabase: {
    url: required('SUPABASE_URL'),
    anonKey: required('SUPABASE_ANON_KEY'),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  },
  // ... rest of config
}
```

### Rate limit middleware (verify, don't break)
`apps/api/src/middleware/rate-limit.ts` uses Redis INCR/EXPIRE pattern. It must not crash if Redis is unavailable — degrade gracefully (log warning, allow request through).

---

## Dependencies

| Dependency | Type | Blocking? |
|-----------|------|----------|
| EPIC-01-STORY-01 | Hard | YES — needs `@zap/types` and `@zap/validators` |
| EPIC-01-STORY-02 | Soft | NO — API can start without DB connected (health check works) |
| Redis running | Runtime | Soft — rate limiter degrades gracefully if Redis down |

**Blocks:**
- EPIC-01-STORY-04 (workers import from `apps/api/src/queues/index.ts`)
- All EPIC-02 stories (all route handlers need this foundation)

---

## Definition of Done

- [x] `GET /health` returns HTTP 200 with `{ status: 'ok', timestamp }` (AC-003.1)
- [x] Unauthenticated requests to `/api/*` return HTTP 401 (AC-003.2)
- [x] Valid JWT → `c.get('tenantId')` and `c.get('role')` populated (AC-003.3)
- [x] All 5 error subclasses produce correct HTTP responses (AC-003.4)
- [x] CORS works from `http://localhost:3000` origin (AC-003.5)
- [x] Winston logging: colorized in dev, JSON in prod (AC-003.6)
- [x] Unhandled errors return 500 without leaking stack traces (AC-003.7)
- [x] Pretty JSON in development mode (AC-003.8)
- [x] Server starts with zero import errors, all 10 route groups registered (AC-003.9)
- [x] `npm run typecheck -w apps/api` passes with 0 errors
- [x] Story file updated with file list

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/index.ts` | verified | All 7 routers, CORS, logger, prettyJSON, error handler ✓ |
| `apps/api/src/lib/config.ts` | verified | required()/optional() helpers, all env vars typed ✓ |
| `apps/api/src/lib/logger.ts` | verified | Winston colorized dev / JSON prod ✓ |
| `apps/api/src/lib/errors.ts` | fixed | PlanLimitError 402 → 403 (per AC-003.4) |
| `apps/api/src/db/client.ts` | verified | supabase (anon) + supabaseAdmin (service_role) ✓ |
| `apps/api/src/middleware/auth.ts` | fixed | HTTPException throws → c.json() returns with code:'UNAUTHORIZED' (per AC-003.2); removed unused HTTPException import |
| `apps/api/src/middleware/rate-limit.ts` | fixed | try-catch around Redis calls for graceful degradation when Redis unavailable |
| `apps/api/src/routes/links.ts` | fixed | group.waInviteLink (camelCase type) → wa_invite_link (snake_case DB column) |
| `apps/api/.env` | created | Local dev env with default Supabase local instance credentials |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-18 | River (SM) | Story created |
| 2026-02-19 | Dex (Dev) | Verified all files; fixed auth.ts (401→c.json with UNAUTHORIZED code); fixed rate-limit.ts (graceful Redis degradation); fixed errors.ts (PlanLimitError 402→403); fixed links.ts (wa_invite_link snake_case); created apps/api/.env for local dev |

---

*Source: docs/prd/zap-prd.md § FR-AUTH-01–05, § NFR-SEC-01–07*
*Source: docs/stories/zap-user-stories.md § ZAP-003*
*Source: docs/architecture/system-architecture.md § 4 (Backend Design)*
*Next story: EPIC-01-STORY-04*
