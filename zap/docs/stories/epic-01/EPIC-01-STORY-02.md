# EPIC-01-STORY-02 — Database Schema & Migrations
**Story ID:** ZAP-002
**Epic:** EPIC-01 — Foundation & Infrastructure
**Sprint:** 0 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 5
**Status:** Ready
**Assigned to:** @dev (Dex) + @data-engineer review
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** backend engineer,
**I want** all 14 database tables created via Supabase migrations with Row Level Security (RLS) enforced on all of them,
**so that** tenant data isolation is guaranteed at the database layer from the very first day, with no possibility of cross-tenant data leaks.

---

## Context & Background

The Zap platform uses **database-level multi-tenancy**: every table has a `tenant_id` column and RLS policies enforce that queries only return rows where `tenant_id` matches the authenticated user's tenant (extracted from JWT).

This story creates the complete schema that ALL other epics depend on. Migration files were scaffolded in the architecture session and need to be verified for correctness and completeness.

**Two migrations total:**
1. `20260218000001_initial_schema.sql` — All 14 tables + RLS + indexes + triggers
2. `20260218000002_helper_functions.sql` — RPC functions for atomic counters

**Supabase local dev** must be running before this story can be tested:
```bash
supabase start   # starts local Supabase on port 54321
supabase db reset  # applies migrations + seed
```

---

## Acceptance Criteria

### AC-002.1 — All 14 tables created
After `supabase db reset`, the following tables must exist in the `public` schema:

```sql
-- Verify with:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
```

Expected tables:
1. `plans` — subscription plans (lite / standard / black)
2. `tenants` — workspace entities
3. `tenant_users` — user-to-tenant membership with role
4. `whatsapp_connections` — WhatsApp sessions per tenant
5. `projects` — launch projects
6. `project_phases` — funnel phases per project (Leads / Aquecimento / Compradores)
7. `groups` — registered WhatsApp groups per phase
8. `group_participants` — individual participant records (phone + join/leave events)
9. `leads` — deduplicated lead records (unique by tenant+phone)
10. `lead_events` — immutable event log (purchases, joins, leaves, etc.)
11. `dynamic_links` — tracking links with tokens
12. `link_clicks` — individual click records (ip, ua, timestamp, group redirected)
13. `broadcasts` — bulk message jobs
14. `broadcast_messages` — individual messages within a broadcast
15. `webhook_events` — incoming webhook audit log

### AC-002.2 — RLS enabled and policies applied
```sql
-- Verify all tables have RLS enabled:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- EXPECTED: rowsecurity = true for all 14 tables
```

Every table must have a `tenant_isolation` policy using `auth_tenant_id()`:
```sql
-- Example verification for whatsapp_connections:
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'whatsapp_connections';
-- EXPECTED: policy "tenant_isolation" with qual = "(tenant_id = auth_tenant_id())"
```

Special cases (no direct tenant_id column — use subquery):
- `project_phases` → `project_id IN (SELECT id FROM projects WHERE tenant_id = auth_tenant_id())`
- `group_participants` → `group_id IN (SELECT id FROM groups WHERE tenant_id = auth_tenant_id())`
- `broadcast_messages` → `broadcast_id IN (SELECT id FROM broadcasts WHERE tenant_id = auth_tenant_id())`

### AC-002.3 — auth_tenant_id() function exists
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'auth_tenant_id';
-- EXPECTED: 1 row returned
```

Function definition must be:
```sql
CREATE OR REPLACE FUNCTION auth_tenant_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'tenant_id')::UUID;
$$ LANGUAGE sql STABLE;
```

### AC-002.4 — Helper RPCs exist (migration 000002)
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'increment_broadcast_sent',
  'increment_broadcast_failed',
  'increment_group_participants',
  'decrement_group_participants',
  'get_tenant_overview'
);
-- EXPECTED: 5 rows returned
```

### AC-002.5 — Critical indexes exist
```sql
SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
ORDER BY indexname;
```

Must include ALL of:
- `idx_groups_available` — partial index WHERE status = 'active', for fill-first lookup
- `idx_groups_tenant` — groups by tenant + status
- `idx_groups_wa_id` — unique index on (tenant_id, wa_group_id)
- `idx_leads_phone` — unique index on (tenant_id, phone)
- `idx_leads_tenant_score` — for lead score queries
- `idx_connections_tenant` — connections by tenant + status
- `idx_projects_tenant` — projects by tenant + status
- `idx_phases_project` — phases by project + order
- `idx_participants_active` — partial unique on (group_id, phone) WHERE removed_at IS NULL
- `idx_participants_group` — participants by group + joined_at
- `idx_lead_events_lead_time` — events by lead + created_at
- `idx_broadcasts_scheduled` — partial index WHERE status = 'scheduled'
- `idx_broadcasts_tenant` — broadcasts by tenant + status
- `idx_clicks_link_time` — clicks by link + created_at
- `idx_links_tenant` — links by tenant + active
- `idx_links_project` — links by project
- `idx_webhook_events_tenant` — events by tenant + processed

### AC-002.6 — updated_at triggers on the right tables
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;
```

Must exist for: `tenants`, `whatsapp_connections`, `projects`, `groups`, `broadcasts`

### AC-002.7 — Seed data exists for dev tenant
```sql
SELECT id, slug, name FROM tenants;
-- EXPECTED: row with slug='dev-tenant', id='a0000000-0000-0000-0000-000000000001'

SELECT name, price_brl FROM plans ORDER BY price_brl;
-- EXPECTED: 3 rows: lite (197.00), standard (497.00), black (997.00)
```

### AC-002.8 — Clean reset
```bash
supabase db reset
# EXPECTED: Exits with code 0
# EXPECTED: No SQL errors in output
# EXPECTED: "Seeding data..." line appears at end
```

---

## Technical Notes

### Files to Verify / Fix

| File | Status | Key things to check |
|------|--------|---------------------|
| `supabase/config.toml` | Exists | `project_id = "zap"`, `db.major_version = 15` |
| `supabase/migrations/20260218000001_initial_schema.sql` | Exists | All 14 tables, all ENUMs, all indexes, RLS, triggers |
| `supabase/migrations/20260218000002_helper_functions.sql` | Exists | All 5 RPCs, GRANT statements |
| `supabase/seed.sql` | Exists | Dev tenant insert with IF NOT EXISTS guard |

### ENUMs to verify exist
```sql
SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;
```
Must include:
- `broadcast_status` (draft, scheduled, sending, sent, failed)
- `connection_status` (connecting, connected, disconnected, banned)
- `content_type` (text, image, video, audio, document)
- `group_status` (active, full, archived)
- `lead_event_type` (link_click, group_join, group_leave, purchase, refund, message_sent, sequence_step)
- `project_status` (active, paused, archived)
- `target_type` (all_groups, specific_groups, phase)
- `user_role` (admin, operator, viewer)
- `webhook_source` (hotmart, kiwify, generic, evolution)

### Two Supabase clients (in apps/api)
```typescript
// apps/api/src/db/client.ts
// supabase  → uses SUPABASE_ANON_KEY → respects RLS → for user routes
// supabaseAdmin → uses SUPABASE_SERVICE_ROLE_KEY → bypasses RLS → for workers/webhooks ONLY
```
The `supabaseAdmin` client MUST use `createClient(url, serviceRoleKey)` — never expose service key to frontend.

### Local Supabase setup
```bash
# Prerequisites:
brew install supabase/tap/supabase  # or: npm install -g supabase

# Start local Supabase:
cd zap/
supabase start

# Apply migrations:
supabase db reset

# Studio URL (verify tables visually):
open http://localhost:54323
```

### Common migration issues
1. **Enum already exists** — If re-running partial migration, `CREATE TYPE` fails. Use `CREATE TYPE IF NOT EXISTS` or run `supabase db reset` (full reset).
2. **RLS blocks service_role** — It shouldn't. `supabaseAdmin` with service_role key bypasses RLS by default in Supabase.
3. **`auth.jwt()` returns null in local tests** — Set `SUPABASE_AUTH_EXTERNAL_GITHUB_ENABLED=false` and use Supabase local auth for testing RLS.

---

## Dependencies

| Dependency | Type | Blocking? |
|-----------|------|----------|
| EPIC-01-STORY-01 | Hard | YES — needs `packages/types` interfaces to match schema |
| Supabase CLI installed | Tool | YES — `supabase` command must work |
| Local Supabase running | Runtime | YES — `supabase start` before testing |

**Blocks:**
- EPIC-01-STORY-03 (API needs DB client to connect to Supabase)
- All EPIC-02 through EPIC-07 stories

---

## Definition of Done

- [x] `supabase db reset` completes with exit code 0, zero SQL errors
- [x] All 14 tables exist in public schema (AC-002.1)
- [x] RLS enabled on all 14 tables with correct tenant isolation policies (AC-002.2)
- [x] `auth_tenant_id()` function exists and correct (AC-002.3)
- [x] All 5 helper RPCs exist and have GRANT statements (AC-002.4)
- [x] All 17 indexes verified (AC-002.5)
- [x] All 5 `updated_at` triggers exist (AC-002.6)
- [x] Dev tenant seed data present (AC-002.7)
- [x] All 9 ENUMs exist in database
- [x] Story file updated with file list

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `supabase/config.toml` | verified | project_id="zap", db.major_version=15 ✓ |
| `supabase/migrations/20260218000001_initial_schema.sql` | fixed | Fixed `increment` fn: RETURNS VOID + actual UPDATE + GRANT |
| `supabase/migrations/20260218000002_helper_functions.sql` | verified | All 5 RPCs + GRANT statements ✓ |
| `supabase/seed.sql` | verified | Dev tenant idempotent insert ✓ |
| `apps/api/src/db/client.ts` | verified | supabase (anon) + supabaseAdmin (service_role) ✓ |
| `apps/api/src/services/tracking/link-service.ts` | fixed | `findAvailableGroup`: removed invalid `get_capacity` RPC, filter in app code; `recordClick`: use `rpc('increment')` correctly |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-18 | River (SM) | Story created |
| 2026-02-19 | Dex (Dev) | Verified all ACs; fixed `increment` fn in migration (VOID + UPDATE + GRANT); fixed link-service `findAvailableGroup` (removed invalid get_capacity RPC, filter in app); fixed `recordClick` to use `rpc('increment')` directly |

---

*Source: docs/prd/zap-prd.md § FR-AUTH-03, § 7.1–7.8 (all functional requirements)*
*Source: docs/stories/zap-user-stories.md § ZAP-002*
*Source: docs/architecture/system-architecture.md § 6 (Database Schema)*
*Next story: EPIC-01-STORY-03*
