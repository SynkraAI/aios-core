# Supabase Best Practices Audit Checklist

**Purpose:** Validate database against 30 Supabase Agent Skills rules
**Version:** 1.0 (January 2026)
**Reference:** `squads/db-sage/data/supabase-agent-skills.md`

---

## PHASE 1: CRITICAL (Must Pass)

### Connection Management
- [ ] Connection pooling configured (PgBouncer/Supavisor on port 6543)
- [ ] `max_connections` appropriate for workload
- [ ] Active connections < 80% of max_connections
- [ ] `idle_in_transaction_session_timeout` configured (recommended: 60s)
- [ ] `statement_timeout` configured (recommended: 30s)

### Query Performance (Missing Indexes)
- [ ] All foreign keys have corresponding indexes
- [ ] Columns in WHERE clauses indexed
- [ ] Columns in JOIN conditions indexed
- [ ] No sequential scans on tables >10k rows

### Security (RLS Basics)
- [ ] RLS enabled on all public-facing tables
- [ ] Policies exist for all tables with RLS enabled
- [ ] `FORCE ROW LEVEL SECURITY` on tables accessed by service role
- [ ] No tables with RLS enabled but zero policies

---

## PHASE 2: HIGH PRIORITY

### Schema Design
- [ ] Data types correct (BIGINT/UUID, TIMESTAMPTZ, TEXT, NUMERIC)
- [ ] Primary keys using IDENTITY or UUID (not SERIAL)
- [ ] All identifiers in `lowercase_snake_case`
- [ ] No `VARCHAR` where `TEXT` suffices
- [ ] No `TIMESTAMP` where `TIMESTAMPTZ` needed
- [ ] No `FLOAT` for monetary values (use NUMERIC)

### Index Strategy
- [ ] Composite indexes for multi-column queries
- [ ] Index column order matches query selectivity
- [ ] Covering indexes with INCLUDE for hot queries
- [ ] Partial indexes for subset queries
- [ ] GIN indexes for JSONB columns with containment queries
- [ ] BRIN indexes for time-series/append-only tables

### Bulk Operations
- [ ] Bulk inserts use multi-row VALUES
- [ ] Large imports use COPY
- [ ] Upserts use ON CONFLICT (not SELECT-then-INSERT)

### Locking
- [ ] Advisory locks for exclusive operations
- [ ] No API calls inside transactions
- [ ] Lock ordering consistent (alphabetical/by ID)

---

## PHASE 3: MEDIUM-HIGH

### Data Access Patterns
- [ ] N+1 queries eliminated (use JOINs or Supabase relationships)
- [ ] Cursor/keyset pagination (not OFFSET for large tables)
- [ ] Row-level locks use NOWAIT or SKIP LOCKED where appropriate

### Index Optimization
- [ ] Expression indexes for function-based queries
- [ ] No unused indexes (check `pg_stat_user_indexes`)

### Complex Queries
- [ ] Materialized views for expensive aggregations
- [ ] Materialized views have refresh strategy

---

## PHASE 4: MEDIUM

### Transaction Best Practices
- [ ] Transactions are short (no external calls inside)
- [ ] Proper error handling with SAVEPOINT
- [ ] Appropriate isolation level selected

### RLS Performance
- [ ] `auth.uid()` wrapped in SELECT for caching
- [ ] Complex policies use SECURITY DEFINER functions
- [ ] Policy columns indexed

### Advanced Indexing
- [ ] JSONB queries use GIN or expression indexes
- [ ] Large tables (>100M rows) partitioned
- [ ] Partition pruning verified in EXPLAIN

---

## PHASE 5: MONITORING & SECURITY

### Query Analysis
- [ ] `pg_stat_statements` extension enabled
- [ ] Top slow queries identified and optimized
- [ ] EXPLAIN ANALYZE used for problematic queries

### Maintenance
- [ ] VACUUM running (autovacuum enabled)
- [ ] ANALYZE statistics current
- [ ] Dead tuple count acceptable
- [ ] Per-table autovacuum thresholds tuned for large tables

### Splinter Security Checks (Supabase Advisor)
- [ ] `auth_users_exposed`: Auth table NOT accessible via API
- [ ] `rls_disabled_in_public`: No tables without RLS
- [ ] `unindexed_foreign_keys`: All FKs indexed
- [ ] `unused_index`: No indexes consuming resources unnecessarily

### API Keys Migration (2025-2026)
- [ ] Aware of `anon`/`service_role` deprecation (end of 2026)
- [ ] Plan to migrate to `sb_publishable_*` / `sb_secret_*` keys
- [ ] No hardcoded legacy JWT keys in codebase

### Audit Trail
- [ ] Audit solution chosen (pgaudit / supa_audit / custom triggers)
- [ ] Sensitive tables identified (user data, financial, credentials)
- [ ] Audit logging enabled for sensitive tables
- [ ] Log retention policy defined

---

## EVIDENCE COLLECTION

Run these queries and record results:

### Connection Check
```sql
SELECT COUNT(*), state FROM pg_stat_activity GROUP BY state;
SHOW max_connections;
SHOW idle_in_transaction_session_timeout;
```
**Result:** _____ active / _____ max_connections

### FK Index Check
```sql
SELECT c.conrelid::regclass AS table_name, a.attname AS column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
AND NOT EXISTS (
  SELECT 1 FROM pg_index i
  WHERE i.indrelid = c.conrelid
  AND a.attnum = ANY(i.indkey)
);
```
**Result:** _____ FKs without indexes

### RLS Coverage Check
```sql
SELECT
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND rowsecurity=false) AS no_rls,
  (SELECT COUNT(*) FROM pg_tables t
   WHERE t.schemaname='public' AND t.rowsecurity=true
   AND NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename=t.tablename)) AS rls_no_policy;
```
**Result:** _____ tables without RLS, _____ tables with RLS but no policies

### Slow Queries Check
```sql
SELECT round(mean_exec_time::numeric, 2) AS mean_ms, calls, query
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC LIMIT 10;
```
**Result:** _____ slow queries identified

### Vacuum Status Check
```sql
SELECT relname, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000
ORDER BY n_dead_tup DESC;
```
**Result:** _____ tables need vacuum attention

---

## SCORING

| Phase | Total Checks | Passed | Score |
|-------|--------------|--------|-------|
| 1. CRITICAL | 12 | __ | __% |
| 2. HIGH | 18 | __ | __% |
| 3. MEDIUM-HIGH | 6 | __ | __% |
| 4. MEDIUM | 9 | __ | __% |
| 5. MONITORING | 7 | __ | __% |
| **TOTAL** | **52** | **__** | **__%** |

*Note: 52 checks map to 30 Supabase Agent Skills rules (some rules have multiple validation points)*

### Compliance Level

| Score | Level | Action |
|-------|-------|--------|
| 90-100% | Excellent | Maintain |
| 75-89% | Good | Address HIGH issues |
| 50-74% | Needs Work | Address CRITICAL + HIGH |
| <50% | Critical | Stop and remediate |

---

## CRITICAL STOPS

**DO NOT DEPLOY IF:**
- [ ] Any CRITICAL check failed
- [ ] Tables without RLS hold user data
- [ ] FKs without indexes on tables >10k rows
- [ ] Connection pool not configured

---

## REMEDIATION PRIORITY

1. **Immediate (This Sprint)**
   - Connection pooling
   - RLS on all user tables
   - FK indexes

2. **Short-term (Next Sprint)**
   - Data type corrections
   - Composite indexes
   - N+1 query elimination

3. **Medium-term (Backlog)**
   - Partitioning large tables
   - Materialized views
   - Monitoring setup

---

## SIGN-OFF

| Role | Name | Date | Passed |
|------|------|------|--------|
| DBA | | | [ ] |
| Tech Lead | | | [ ] |
| Security | | | [ ] |

**Final Score:** __/52 checks passed (__%)

**Rules Compliance:** __/30 Supabase Agent Skills rules

**Next Audit Date:** ________________

---

**Version History:**
- v1.0 (2026-01): Initial checklist based on Supabase Agent Skills
