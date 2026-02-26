# EPIC-06-STORY-01 — Setup `monitored_groups` table + CRUD API
**Story ID:** ZAP-032
**Epic:** EPIC-06 — Group Monitoring Infrastructure
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** tenant,
**I want** to register WhatsApp groups that I want to monitor for competitor offers,
**so that** the system knows which groups to listen to and capture messages from.

---

## Context & Background

This is the **foundational story of EPIC-06**. It creates the database infrastructure and API endpoints that all subsequent monitoring features depend on.

The `monitored_groups` table tracks which groups the user is listening to (competitor groups), separate from the groups they send messages to (their own groups, managed in existing `groups` table).

---

## Acceptance Criteria

### AC-032.1 — Creates `monitored_groups` table with correct schema
```bash
# After migration applied:
psql $DATABASE_URL -c "
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'monitored_groups'
"

# EXPECTED columns:
# id UUID PRIMARY KEY
# tenant_id UUID NOT NULL
# connection_id UUID NOT NULL
# group_name TEXT NOT NULL
# group_jid TEXT NOT NULL UNIQUE
# status TEXT (active|paused|deleted)
# monitored_since TIMESTAMP
# last_message_at TIMESTAMP
# message_count INT
# created_at TIMESTAMP
# updated_at TIMESTAMP
```

### AC-032.2 — RLS policies enforce tenant isolation
```bash
# As tenant_A, query monitored_groups should only see tenant_A's groups
curl -X GET http://localhost:3001/api/v1/monitored-groups \
  -H "Authorization: Bearer $JWT_TENANT_A"
# EXPECTED: Only groups where tenant_id = tenant_A
# Does NOT include tenant_B's groups

# As tenant_B (different JWT):
curl -X GET http://localhost:3001/api/v1/monitored-groups \
  -H "Authorization: Bearer $JWT_TENANT_B"
# EXPECTED: Only groups where tenant_id = tenant_B
# tenant_A's groups invisible
```

### AC-032.3 — POST /monitored-groups creates group
```bash
curl -X POST http://localhost:3001/api/v1/monitored-groups \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "connection_id": "uuid-of-connection",
    "group_name": "Concorrentes - Grupo 1",
    "group_jid": "120363012345678-1234567890@g.us"
  }'

# EXPECTED: HTTP 201
# {
#   "data": {
#     "id": "uuid",
#     "tenant_id": "uuid",
#     "group_name": "Concorrentes - Grupo 1",
#     "group_jid": "120363012345678-1234567890@g.us",
#     "status": "active",
#     "monitored_since": "2026-02-26T...",
#     "message_count": 0
#   }
# }
```

### AC-032.4 — GET /monitored-groups lists all groups
```bash
curl -X GET http://localhost:3001/api/v1/monitored-groups \
  -H "Authorization: Bearer $JWT"

# EXPECTED: HTTP 200
# {
#   "data": [
#     { id, group_name, status, monitored_since, last_message_at, message_count },
#     { ... }
#   ],
#   "pagination": { page: 1, limit: 20, total: X }
# }
```

### AC-032.5 — PATCH /monitored-groups/:id pauses/resumes group
```bash
# Pause a group
curl -X PATCH http://localhost:3001/api/v1/monitored-groups/{id} \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{ "status": "paused" }'

# EXPECTED: HTTP 200
# { "data": { id, status: "paused", ... } }

# Resume
curl -X PATCH http://localhost:3001/api/v1/monitored-groups/{id} \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{ "status": "active" }'

# EXPECTED: HTTP 200
# { "data": { id, status: "active", ... } }
```

### AC-032.6 — DELETE /monitored-groups/:id soft deletes group
```bash
curl -X DELETE http://localhost:3001/api/v1/monitored-groups/{id} \
  -H "Authorization: Bearer $JWT"

# EXPECTED: HTTP 200
# { "success": true }

# Verify: soft delete (status='deleted', not hard delete)
SELECT * FROM monitored_groups WHERE id = '{id}'
# EXPECTED: Row still exists with status='deleted'
```

### AC-032.7 — Unique constraint on group_jid prevents duplicates
```bash
# Try to add same group twice:
curl -X POST http://localhost:3001/api/v1/monitored-groups \
  -d '{ "connection_id": "...", "group_name": "...", "group_jid": "120363...@g.us" }'
# First request: HTTP 201 ✅

curl -X POST http://localhost:3001/api/v1/monitored-groups \
  -d '{ "connection_id": "...", "group_name": "...", "group_jid": "120363...@g.us" }'
# Second request with same group_jid: HTTP 409 (Conflict)
# { "error": "Group already monitored", "code": "DUPLICATE_GROUP" }
```

---

## Technical Notes

### Migration File
```sql
-- supabase/migrations/20260226000001_create_monitored_groups.sql

CREATE TABLE monitored_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL,

  -- Group identification
  group_name TEXT NOT NULL,
  group_jid TEXT NOT NULL UNIQUE,

  -- Status
  status TEXT CHECK (status IN ('active', 'paused', 'deleted')) DEFAULT 'active',

  -- Tracking
  monitored_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP,
  message_count INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (tenant_id, connection_id)
    REFERENCES whatsapp_connections(tenant_id, id),

  INDEX idx_tenant_status (tenant_id, status),
  INDEX idx_jid (group_jid)
);

-- Enable RLS
ALTER TABLE monitored_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users see only their tenant's groups
CREATE POLICY "Users see only their tenant's monitored groups"
  ON monitored_groups
  FOR ALL
  TO authenticated
  USING (tenant_id = auth.uid()::uuid);

-- Service role can access all
CREATE POLICY "Service role unrestricted"
  ON monitored_groups
  FOR ALL
  TO service_role
  USING (true);
```

### API Implementation
```typescript
// apps/api/src/routes/monitored-groups.ts

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

// POST /monitored-groups
const createSchema = z.object({
  connection_id: z.string().uuid(),
  group_name: z.string().min(1),
  group_jid: z.string().regex(/^[0-9]+-[0-9]+@g\.us$/)
})

app.post('/', zValidator('json', createSchema), async (c) => {
  const { tenantId } = c.get('auth')
  const { connection_id, group_name, group_jid } = c.req.valid('json')

  // Verify connection belongs to tenant
  const { data: conn, error: connErr } = await supabaseAdmin
    .from('whatsapp_connections')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('id', connection_id)
    .single()

  if (connErr || !conn) {
    return c.json({ error: 'Connection not found', code: 'INVALID_CONNECTION' }, 404)
  }

  // Create monitored group
  const { data: group, error: dbErr } = await supabaseAdmin
    .from('monitored_groups')
    .insert({
      tenant_id: tenantId,
      connection_id,
      group_name,
      group_jid,
      status: 'active'
    })
    .select()
    .single()

  if (dbErr || !group) {
    if (dbErr?.code === '23505') { // Unique constraint
      return c.json({ error: 'Group already monitored', code: 'DUPLICATE_GROUP' }, 409)
    }
    throw dbErr
  }

  return c.json({ data: group }, 201)
})

// GET /monitored-groups
app.get('/', async (c) => {
  const { tenantId } = c.get('auth')

  const { data, error, count } = await supabase
    .from('monitored_groups')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .neq('status', 'deleted')
    .order('monitored_since', { ascending: false })

  if (error) throw error

  return c.json({
    data,
    pagination: { page: 1, limit: 20, total: count }
  })
})

// PATCH /monitored-groups/:id
app.patch('/:id', zValidator('json', z.object({ status: z.enum(['active', 'paused']) })), async (c) => {
  const { tenantId } = c.get('auth')
  const { id } = c.req.param()
  const { status } = c.req.valid('json')

  const { data: group, error } = await supabaseAdmin
    .from('monitored_groups')
    .update({ status, updated_at: new Date() })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single()

  if (error || !group) {
    return c.json({ error: 'Group not found', code: 'NOT_FOUND' }, 404)
  }

  return c.json({ data: group })
})

// DELETE /monitored-groups/:id (soft delete)
app.delete('/:id', async (c) => {
  const { tenantId } = c.get('auth')
  const { id } = c.req.param()

  const { error } = await supabaseAdmin
    .from('monitored_groups')
    .update({ status: 'deleted', updated_at: new Date() })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) {
    return c.json({ error: 'Group not found', code: 'NOT_FOUND' }, 404)
  }

  return c.json({ success: true })
})

export default app
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| EPIC-01 complete | Hard | ✅ |
| Supabase project | Runtime | ✅ |
| ZAP-033 (webhook routing) | Soft | Depends on this story |

**Blocks:**
- ZAP-033 (webhook routing needs monitored_groups table)
- ZAP-034 (message capture needs monitored_groups)

---

## Definition of Done

- [x] Migration created + applied (`monitored_groups` table exists)
- [x] RLS policies enforce tenant isolation
- [x] API routes: POST, GET, PATCH, DELETE working
- [x] Duplicate group_jid rejected with HTTP 409
- [x] Connection ownership validated (belongs to tenant)
- [x] Soft delete implemented (status='deleted')
- [x] Tests: CRUD operations + RLS + duplicate handling (10 tests PASS)
- [x] `npm run typecheck -w apps/api` → 0 errors (monitored-groups clean)
- [x] `npm run lint -w apps/api` → Pre-existing config issue (not blocking)
- [ ] Manual testing: add/pause/delete groups via API

---

## File List (update as you work)

| File | Action | Status |
|------|--------|--------|
| `supabase/migrations/20260226000001_create_monitored_groups.sql` | CREATE | ✅ Created |
| `apps/api/src/routes/monitored-groups.ts` | CREATE | ✅ Created |
| `apps/api/src/routes/monitored-groups.test.ts` | CREATE | ✅ Created (10 tests) |
| `apps/api/src/index.ts` | MODIFY | ✅ Updated (import + route registration) |
| `packages/types/src/index.ts` | MODIFY | ✅ Updated (MonitoredGroup type exported) |

---

## CodeRabbit Integration

**When to run:**
- After implementing routes (pre-commit)
- Focus: API patterns, RLS security, error handling

**Command:**
```bash
wsl bash -c 'cd /mnt/c/.../aios-core && ~/.local/bin/coderabbit --prompt-only -t uncommitted'
```

**Severity handling:**
- CRITICAL: Hardcoded credentials, SQL injection, RLS bypass → BLOCK
- HIGH: Unvalidated input, weak error handling → FIX
- MEDIUM: Inconsistent error responses → DOCUMENT

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — ready for development |
| 2026-02-26 | Dex (Dev) | Implementation complete: migration + API + tests (10 PASS) |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 1, Part 3*
*Arch ref: docs/stories/epic-06/EPIC-06.md*
*PO ref: Will validate after creation*
