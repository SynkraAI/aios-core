# EPIC-02 Architectural Validation Record
**Status:** ✅ Approved with Corrections
**Date:** 2026-02-19
**Architect:** Aria (Architect Agent)
**Source PRD:** `docs/prd/epic-02-prd.md`
**Codebase reviewed:** `apps/api/src/routes/connections.ts`, `session-manager.ts`, `webhooks.ts`, `broadcast.worker.ts`, `message.worker.ts`, `supabase/migrations/20260218000001_initial_schema.sql`

---

## Summary

The EPIC-02 design is **architecturally sound** and approved for implementation with the corrections documented below. One critical correction affects the `plans` table schema. Three secondary corrections affect implementation details in the story specs.

| Decision | Status | Notes |
|---------|--------|-------|
| D-01: Instance Name `zap_{tenantId}_{connectionId}` | ✅ APPROVED | `split('_')` works; UUID hyphens don't interfere |
| D-02: SSE Stream with named events | ✅ APPROVED | Correct pattern; poll count must be 24×5s |
| D-03: Webhook Handler Isolation | ✅ APPROVED | Already public — no authMiddleware in webhooksRouter |
| D-04: Redis `session_banned:{tenantId}:{connectionId}` | ✅ APPROVED | Correct Redis key pattern |
| D-05: `plans` table data | ⚠️ CORRECTION | Column `slug` does NOT exist; must use `name` or add migration |

---

## D-01 — Instance Name Convention

**Decision:** Use `zap_{tenantId}_{connectionId}` as Evolution instance name.

**Validation:** APPROVED ✅

**Reasoning:**
Standard UUID v4 format uses hyphens (`-`) as internal separators — never underscores. Therefore `instanceName.split('_')` on `zap_a0000000-0000-0000-0000-000000000001_c1234567-...` safely produces exactly 3 parts:

```
parts[0] = 'zap'
parts[1] = 'a0000000-0000-0000-0000-000000000001'  ← tenantId
parts[2] = 'c1234567-1234-1234-1234-123456789012'  ← connectionId
```

**Recommended implementation** (defensive parsing):
```typescript
// Prefer indexOf over split — explicit about separator positions
private parseInstanceName(instanceName: string): { tenantId: string; connectionId: string } {
  const firstUnderscore = instanceName.indexOf('_')    // after 'zap'
  const secondUnderscore = instanceName.indexOf('_', firstUnderscore + 1)
  return {
    tenantId: instanceName.slice(firstUnderscore + 1, secondUnderscore),
    connectionId: instanceName.slice(secondUnderscore + 1),
  }
}
```

Using `indexOf`+`slice` is preferred over `split` because:
1. It's explicit about where the boundaries are
2. It works even if future prefixes contain underscores
3. Zero ambiguity about array indices

**Impact on ZAP-010:** The webhook handler in `webhooks.ts` (line 53) currently uses:
```typescript
const tenantId = body.instance?.replace('zap_', '')
// ⚠️ WRONG with new format — produces '{tenantId}_{connectionId}'
```
This **must be replaced** with the `parseInstanceName` method from sessionManager, or equivalent `indexOf`/`slice` parsing.

---

## D-02 — SSE Stream Architecture

**Decision:** Hono `streamSSE` with named events (`event: 'qr'`), 24 polls × 5s = 120s timeout.

**Validation:** APPROVED ✅

**Named event format is correct:**
```typescript
await stream.writeSSE({ event: 'qr', data: JSON.stringify({ code: base64QR }) })
await stream.writeSSE({ event: 'connected', data: '{}' })
await stream.writeSSE({ event: 'timeout', data: '{}' })
```
This enables `EventSource.addEventListener('qr', handler)` on the frontend.

**Current code gap (connections.ts lines 70-96):**
The current scaffold uses 10 iterations × 3s sleep = **30 seconds maximum**, not 120s.
Also checks Evolution status directly (`sessionManager.getStatus`) instead of checking the DB.

**Required implementation:**
```typescript
return streamSSE(c, async (stream) => {
  const MAX_POLLS = 24       // 24 × 5s = 120s
  const POLL_INTERVAL = 5000 // 5 seconds

  for (let i = 0; i < MAX_POLLS; i++) {
    const qrBase64 = await sessionManager.getQRCode(tenantId, connectionId)
    if (qrBase64) {
      await stream.writeSSE({ event: 'qr', data: JSON.stringify({ code: qrBase64 }) })
    }

    // Check DB — webhook handler (ZAP-010) updates status asynchronously
    const { data: conn } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('status')
      .eq('id', connectionId)
      .single()

    if (conn?.status === 'connected') {
      await stream.writeSSE({ event: 'connected', data: '{}' })
      return  // close stream
    }

    await new Promise(r => setTimeout(r, POLL_INTERVAL))
  }

  await stream.writeSSE({ event: 'timeout', data: '{}' })
})
```

**Design note:** Checking DB (not Evolution) for connected status is the correct pattern. The webhook handler (ZAP-010) is the authoritative source — when Evolution sends `connection.update state=open`, the webhook updates the DB. The SSE stream polls DB, ensuring both paths (webhook-driven and SSE-driven) converge correctly.

---

## D-03 — Webhook Handler Isolation

**Decision:** `POST /webhooks/evolution` must be public (no authMiddleware).

**Validation:** APPROVED ✅

**Current architecture in `index.ts`:**
```typescript
app.route('/webhooks', webhooksRouter)  // ← public; no global auth applied here
app.route('/api/v1/connections', connectionsRouter)  // ← authMiddleware applied INSIDE router
```

The `connectionsRouter` applies `app.use('*', authMiddleware)` internally. The `webhooksRouter` has no middleware — it's already public. The Evolution webhook endpoint (`/webhooks/evolution`) is already scaffolded in `webhooks.ts` as a stub at line 43.

**Stub parsing bug (must fix in ZAP-010):**
Current stub at `webhooks.ts:53`:
```typescript
const tenantId = body.instance?.replace('zap_', '')  // ❌ produces 'tenantId_connectionId'
```
Must be replaced with proper parsing:
```typescript
const firstUnderscore = body.instance?.indexOf('_') ?? -1
const secondUnderscore = body.instance?.indexOf('_', firstUnderscore + 1) ?? -1
const tenantId = body.instance?.slice(firstUnderscore + 1, secondUnderscore)
const connectionId = body.instance?.slice(secondUnderscore + 1)
```

**Security note for production:** The Evolution webhook endpoint has no authentication. In the Docker development environment, Evolution and the API are on the same bridge network (`zap_network`), so external access is not possible. For production deployment, consider:
1. Webhook secret validation (Evolution v2 supports configurable webhook headers)
2. IP allowlist for webhook endpoints
This is a V1 concern — acceptable for MVP.

---

## D-04 — Redis `session_banned` Key Pattern

**Decision:** `session_banned:{tenantId}:{connectionId}`

**Validation:** APPROVED ✅

**Current code gap (`session-manager.ts:102`):**
```typescript
const bannedKey = `session_banned:${tenantId}`  // ❌ single connection per tenant
```

**Required after refactor:**
```typescript
const bannedKey = `session_banned:${tenantId}:${connectionId}`
```

**Pattern rationale:**
- Colon (`:`) separator is Redis namespace convention
- Allows wildcard scan: `SCAN 0 MATCH session_banned:{tenantId}:*` → lists all banned connections for a tenant
- Does not collide with existing Redis keys (BullMQ uses different prefix patterns)

**`assertHealthy` signature must change:**
```typescript
// Before:
async assertHealthy(tenantId: string): Promise<void>

// After (ZAP-006 refactor):
async assertHealthy(tenantId: string, connectionId: string): Promise<void>
```

**Caller impact:** `message.worker.ts` calls `sessionManager.sendTextToGroup(tenantId, waGroupId, text)` — note that `broadcast.worker.ts` already propagates `connectionId` via the message job payload (`connectionId: broadcast.connection_id`). The `message.worker.ts` must pass this `connectionId` when calling `sessionManager.sendTextToGroup(tenantId, connectionId, waGroupId, text)` after the refactor.

---

## D-05 — `plans` Table Data

**Decision (PRD Appendix A):** Query using `plans.slug` for plan limit enforcement.

**Validation:** ⚠️ CORRECTION REQUIRED

**Critical finding:** The `plans` table in `20260218000001_initial_schema.sql` does **not** have a `slug` column. The schema has only `name`:

```sql
-- Actual schema:
CREATE TABLE plans (
  id            UUID PRIMARY KEY,
  name          TEXT NOT NULL,           -- 'lite', 'standard', 'black'
  max_connections INT NOT NULL DEFAULT 1,
  ...
);
```

The PRD §14.5 code sample references `plans(slug, max_connections)`:
```typescript
supabaseAdmin.from('tenants').select('plan_id, plans(slug, max_connections)')
// ❌ 'slug' column does not exist
```

**Two valid resolutions:**

### Option A — Add `slug` column via migration (RECOMMENDED)
```sql
-- New migration: 20260219000001_plans_add_slug.sql
ALTER TABLE plans ADD COLUMN slug TEXT UNIQUE;
UPDATE plans SET slug = name;  -- 'lite', 'standard', 'black' already are slugs
ALTER TABLE plans ALTER COLUMN slug SET NOT NULL;
```
Then update the seed data in the migration and the Appendix A seed script.

### Option B — Use `name` instead of `slug` in application code
Change the PRD code sample and ZAP-006 implementation to query `plans(name, max_connections)`.
Since `plans.name` already contains `'lite'`, `'standard'`, `'black'`, the behavior is identical.

**Recommendation: Option A** — Adding a proper `slug` column follows the Zap schema conventions (e.g., `tenants.slug`), is more explicit, and avoids naming confusion between `name` (display name) and identifier (slug).

**Impact:** ZAP-006 is blocked until this is resolved. Resolution must happen in one of:
1. A new migration file added to `supabase/migrations/`
2. Or a seed file that updates the `plans` table before ZAP-006 implementation

**plans.max_broadcasts_per_month discrepancy:**
PRD Appendix A shows `lite=20, standard=100, black=500` but the migration seeds `lite=100, standard=500, black=999`. These values differ — the PRD values are likely the intended product spec. The @po must confirm which values are authoritative before ZAP-006 implementation.

---

## Additional Findings

### Finding A — `message.worker.ts` connectionId gap

`broadcast.worker.ts:98` already propagates `connectionId: broadcast.connection_id` to message jobs. However `message.worker.ts:34` calls:
```typescript
await sessionManager.sendTextToGroup(tenantId, waGroupId, content.text)
// ❌ connectionId from job.data is available but not passed
```

After the `sessionManager` refactor, this must become:
```typescript
await sessionManager.sendTextToGroup(tenantId, connectionId, waGroupId, content.text)
```

The `connectionId` is already in the job data — this is a 1-line fix included in ZAP-006 scope (sessionManager refactor story).

### Finding B — `getStatus` response shape mismatch

`session-manager.ts:71-77` returns `result[0]` which is typed as `EvolutionInstance`:
```typescript
interface EvolutionInstance {
  instanceName: string
  status: 'open' | 'close' | 'connecting'
  qrcode?: string
}
```

The Evolution API v2.2.3 `fetchInstances` response actually returns objects under the `instance` key with a nested structure. The current code may work coincidentally or may need adjustment. This should be verified against the live Evolution API during ZAP-006 implementation. If the response shape is wrong, `getStatus()` will return `undefined` silently.

**Recommended verification step in ZAP-006:** Log the raw `fetchInstances` response once and confirm the expected shape.

### Finding C — `webhook_events` table tenant isolation for Evolution events

The Evolution webhook handler receives events without a JWT. When logging to `webhook_events` (which has `tenant_id NOT NULL`), the handler must:
1. Parse `tenantId` from the instance name
2. Verify the tenant exists before inserting
3. Use `supabaseAdmin` (service role) — not the authenticated client

This pattern is already correct in the hotmart handler. ZAP-010 should follow the same approach.

---

## Architecture Sign-Off Checklist

- [x] **Instance naming** — `zap_{tenantId}_{connectionId}` safe to split on `_`
- [x] **SSE named events** — Hono `streamSSE` supports `{ event, data }` format
- [x] **Webhook isolation** — `/webhooks` router is already public in `index.ts`
- [x] **Redis key pattern** — `session_banned:{tenantId}:{connectionId}` approved
- [x] **No new migrations needed** except `plans.slug` column (if Option A chosen)
- [x] **No new tables needed** — `whatsapp_connections` has all required columns
- [x] **Worker propagation** — `broadcast.worker` already passes `connectionId` to message jobs
- [x] **Webhook stub exists** — `webhooks.ts:43` already has the `POST /webhooks/evolution` stub

---

## Corrections Required Before @sm Creates Stories

| Correction | Story | Priority |
|-----------|-------|---------|
| Add `plans.slug` column via migration OR change code to use `plans.name` | ZAP-006 | BLOCKING |
| Fix `webhooks.ts:53` instance name parsing stub | ZAP-010 | Required |
| Confirm `plans.max_broadcasts_per_month` values (PRD vs migration differ) | ZAP-006 | Required |
| Verify Evolution `fetchInstances` response shape | ZAP-006 | Required |

---

## Handoff to @po

**Ready for:** `@po *validate-story-draft` on ZAP-006 through ZAP-011

**Blocking item:** Confirm which `plans.slug` resolution path to take (Option A — add migration, or Option B — use `name` column). This decision must be in ZAP-006 AC before implementation starts.

**Non-blocking observations to document in stories:**
1. ZAP-007 (SSE): Specify 24 iterations × 5s explicitly in AC (not just "120 seconds") to prevent the 10×3s regression
2. ZAP-010 (Webhook): Document that the stub in `webhooks.ts:53` must be replaced with `indexOf`/`slice` parsing
3. ZAP-006 (Create): The `sessionManager` refactor must include updating `message.worker.ts` in File List

---

*— Aria, arquitetando o futuro 🏗️*
*Validation complete. Handoff to @po for story validation.*
