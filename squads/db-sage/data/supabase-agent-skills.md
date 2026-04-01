# Supabase Agent Skills - Knowledge Base

**Source:** [supabase-community/supabase-agent-skills](https://github.com/supabase-community/supabase-agent-skills)
**Version:** 1.0 (January 2026)
**Purpose:** 30 essential database rules for Supabase optimization

---

## Priority Levels

| Priority | Count | Impact |
|----------|-------|--------|
| CRITICAL | 4 | Production-breaking if ignored |
| HIGH | 8 | Major performance/security issues |
| MEDIUM-HIGH | 6 | Significant optimization opportunities |
| MEDIUM | 9 | Best practices for maintainability |
| LOW-MEDIUM | 3 | Monitoring and observability |

---

## CRITICAL PRIORITY (Must Fix Immediately)

### 1. conn-pooling - Connection Pooling Configuration

**Problem:** Direct database connections exhaust `max_connections` quickly.

**Impact:** Database refuses new connections, application downtime.

```sql
-- ❌ WRONG: Direct connection without pooling
postgres://user:pass@db.xxx.supabase.co:5432/postgres

-- ✅ CORRECT: Use Supavisor/PgBouncer (port 6543)
postgres://user:pass@db.xxx.supabase.co:6543/postgres?pgbouncer=true
```

**Supavisor Port Selection (2025+):**
| Scenario | Port | Mode |
|----------|------|------|
| Edge Functions, Serverless | 6543 | Transaction |
| Persistent servers (EC2, VMs) | 5432 | Direct |
| Migrations | 5432 | Direct |
| Prepared statements | 5432 | Session |

**Pool Sizing Rules:**
- With PostgREST active: ≤40% of max_connections
- Without PostgREST: up to 80%
- Always reserve 20% for Auth, Realtime, internal services

---

### 2. conn-limits - Connection Limits Management

**Problem:** Exhausting max_connections causes connection refused errors.

**Impact:** Application cannot connect, cascading failures.

```sql
-- Check current connections
SELECT COUNT(*), state, usename
FROM pg_stat_activity
GROUP BY state, usename
ORDER BY count DESC;

-- Check max connections
SHOW max_connections;

-- ✅ CORRECT: Set appropriate timeouts
SET idle_in_transaction_session_timeout = '60s';
SET statement_timeout = '30s';
```

**Rule:** Active connections should never exceed 80% of max_connections.

---

### 3. query-missing-indexes - Critical Missing Indexes

**Problem:** Queries on large tables without indexes cause full table scans.

**Impact:** 10-1000x slower queries, database CPU spike.

```sql
-- ❌ WRONG: FK without index
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES users(id) -- No index!
);

-- ✅ CORRECT: Always index foreign keys
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES users(id)
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

**Detection Query:**
```sql
-- Find FKs without indexes
SELECT
    c.conrelid::regclass AS table_name,
    a.attname AS column_name,
    c.confrelid::regclass AS referenced_table
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid
    AND a.attnum = ANY(i.indkey)
);
```

---

### 4. security-rls-basics - Row Level Security Fundamentals

**Problem:** Tables without RLS expose data to all authenticated users.

**Impact:** Data breach, GDPR violations, security incident.

```sql
-- ❌ WRONG: No RLS
CREATE TABLE user_data (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  data JSONB
);
-- Anyone can SELECT * FROM user_data!

-- ✅ CORRECT: Enable RLS with policies
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users own their data"
ON user_data FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Detection Query:**
```sql
-- Find tables without RLS
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
```

---

## HIGH PRIORITY

### 5. schema-foreign-key-indexes - FK Index Strategy

**Problem:** JOINs and ON DELETE CASCADE without FK indexes.

**Impact:** Exponentially slower deletes, blocking operations.

```sql
-- ✅ CORRECT: Index pattern for FKs
-- For every: REFERENCES other_table(id)
-- Create: INDEX idx_table_column ON table(column);

-- Generate CREATE INDEX statements for missing FK indexes
SELECT format(
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_%s_%s ON %s(%I);',
    replace(c.conrelid::regclass::text, '.', '_'),
    a.attname,
    c.conrelid::regclass,
    a.attname
) AS create_index_sql
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid
                   AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid
    AND a.attnum = ANY(i.indkey)
);
-- Copy output and run each statement separately (CONCURRENTLY cannot be in DO block)
```

---

### 6. query-composite-indexes - Multi-Column Index Design

**Problem:** Single-column indexes don't optimize multi-column WHERE clauses.

**Impact:** Query uses only partial index, still scans more data than needed.

```sql
-- ❌ WRONG: Separate indexes for multi-column query
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at);
-- Query: WHERE status = 'pending' AND created_at > '2025-01-01'

-- ✅ CORRECT: Composite index (most selective first)
CREATE INDEX idx_orders_status_date ON orders(status, created_at);
```

**Rule:** Order columns by selectivity (most selective → least selective).

---

### 7. schema-data-types - Correct Data Type Selection

**Problem:** Wrong data types cause storage bloat and comparison issues.

**Impact:** 2-10x storage overhead, timezone bugs, precision errors.

```sql
-- ❌ WRONG choices
id SERIAL,                      -- Use BIGINT or UUID
created_at TIMESTAMP,           -- Loses timezone
price FLOAT,                    -- Precision errors
status VARCHAR(20),             -- Unnecessary limit
description VARCHAR(10000),     -- Use TEXT

-- ✅ CORRECT choices
id BIGINT GENERATED ALWAYS AS IDENTITY,  -- Or UUID
created_at TIMESTAMPTZ DEFAULT now(),
price NUMERIC(10,2),
status TEXT CHECK (status IN ('draft', 'active', 'archived')),
description TEXT
```

---

### 8. schema-primary-keys - Primary Key Strategy

**Problem:** Auto-increment SERIAL reveals data patterns, has replication issues.

**Impact:** Security risk (enumerable IDs), distributed DB conflicts.

```sql
-- ❌ WRONG: SERIAL in 2025
id SERIAL PRIMARY KEY,  -- Reveals insertion order, conflict in multi-region

-- ✅ CORRECT: IDENTITY or UUID v7
-- Option 1: IDENTITY (PostgreSQL 10+)
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

-- Option 2: UUID v7 (time-sortable, better for indexes)
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

-- Option 3: UUID v7 (PostgreSQL 18+, September 2025)
-- Native support - time-sortable, better B-tree performance
id UUID DEFAULT uuidv7() PRIMARY KEY

-- For PostgreSQL <18, use extension:
-- CREATE EXTENSION IF NOT EXISTS pg_uuidv7;
-- id UUID DEFAULT uuid_generate_v7() PRIMARY KEY
```

---

### 9. schema-naming - Consistent Naming Convention

**Problem:** Mixed naming conventions cause confusion and SQL errors.

**Impact:** Developer confusion, case-sensitivity issues.

```sql
-- ❌ WRONG: Mixed conventions
CREATE TABLE UserProfiles (    -- PascalCase
  userId UUID,                 -- camelCase
  "First Name" TEXT,           -- Spaces (requires quotes)
  CREATED_AT TIMESTAMP         -- UPPERCASE
);

-- ✅ CORRECT: snake_case everywhere
CREATE TABLE user_profiles (
  user_id UUID,
  first_name TEXT,
  created_at TIMESTAMPTZ
);
```

**Rule:** All identifiers in `lowercase_snake_case`.

---

### 10. data-bulk-operations - Efficient Bulk Operations

**Problem:** Row-by-row inserts/updates are 100-1000x slower than bulk.

**Impact:** Slow imports, high WAL generation, lock contention.

```sql
-- ❌ WRONG: Row-by-row insert
INSERT INTO users (name) VALUES ('Alice');
INSERT INTO users (name) VALUES ('Bob');
INSERT INTO users (name) VALUES ('Charlie');

-- ✅ CORRECT: Bulk insert
INSERT INTO users (name) VALUES
  ('Alice'),
  ('Bob'),
  ('Charlie');

-- ✅ BETTER: Use COPY for large datasets
COPY users (name) FROM '/tmp/users.csv' WITH CSV HEADER;

-- ✅ BEST: Batch with unnest for programmatic inserts
INSERT INTO users (name, email)
SELECT * FROM unnest(
  ARRAY['Alice', 'Bob', 'Charlie'],
  ARRAY['alice@x.com', 'bob@x.com', 'charlie@x.com']
);
```

---

### 11. lock-advisory - Advisory Locks for Coordination

**Problem:** Race conditions in concurrent operations.

**Impact:** Duplicate records, inconsistent state, deadlocks.

```sql
-- ✅ CORRECT: Advisory lock pattern
-- Use for operations that must be exclusive

-- Acquire lock (blocks if held by another session)
SELECT pg_advisory_lock(hashtext('process_daily_report'));

-- Do exclusive work...
UPDATE reports SET status = 'processing' WHERE date = CURRENT_DATE;

-- Release lock
SELECT pg_advisory_unlock(hashtext('process_daily_report'));

-- For try-lock (non-blocking)
SELECT pg_try_advisory_lock(hashtext('unique_operation_name'));
```

---

### 12. data-upsert - Efficient Upsert Pattern

**Problem:** SELECT-then-INSERT/UPDATE pattern has race conditions.

**Impact:** Duplicate key errors, lost updates.

```sql
-- ❌ WRONG: Check-then-insert
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'x@y.com') THEN
  INSERT INTO users (email) VALUES ('x@y.com');
END IF;

-- ✅ CORRECT: ON CONFLICT (upsert)
INSERT INTO users (email, name, updated_at)
VALUES ('x@y.com', 'New Name', now())
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    updated_at = now();

-- For insert-only (ignore duplicates)
INSERT INTO users (email, name)
VALUES ('x@y.com', 'New Name')
ON CONFLICT (email) DO NOTHING;
```

---

## MEDIUM-HIGH PRIORITY

### 13. data-n-plus-one - N+1 Query Prevention

**Problem:** Fetching parent then looping to fetch children.

**Impact:** N+1 round trips to database, linear slowdown.

```sql
-- ❌ WRONG: N+1 pattern
-- Query 1: SELECT * FROM authors
-- Query 2-N: SELECT * FROM books WHERE author_id = ?

-- ✅ CORRECT: Single query with JOIN
SELECT a.*,
       json_agg(b.*) AS books
FROM authors a
LEFT JOIN books b ON b.author_id = a.id
GROUP BY a.id;

-- ✅ ALTERNATIVE: Use Supabase relationships
-- In Supabase client:
-- supabase.from('authors').select('*, books(*)');
```

---

### 14. lock-deadlock-prevention - Deadlock Prevention

**Problem:** Multiple transactions locking resources in different order.

**Impact:** Transactions abort, user errors, performance degradation.

```sql
-- ❌ WRONG: Random lock order
-- Transaction 1: UPDATE table_a WHERE id=1; UPDATE table_b WHERE id=2;
-- Transaction 2: UPDATE table_b WHERE id=2; UPDATE table_a WHERE id=1;

-- ✅ CORRECT: Consistent lock order (alphabetical/by ID)
-- Always lock in same order: table_a before table_b, lower ID first
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = LEAST(1, 2);
UPDATE accounts SET balance = balance + 100 WHERE id = GREATEST(1, 2);
COMMIT;

-- ✅ BETTER: Use SKIP LOCKED for queues
SELECT * FROM tasks
WHERE status = 'pending'
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED;
```

---

### 15. data-pagination - Efficient Pagination

**Problem:** OFFSET pagination scales poorly with large datasets.

**Impact:** OFFSET 1000000 still reads 1M rows before skipping.

```sql
-- ❌ WRONG: Offset pagination
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 10000;  -- Reads 10020 rows!

-- ✅ CORRECT: Cursor/keyset pagination
SELECT * FROM posts
WHERE created_at < '2025-01-01T00:00:00Z'  -- Cursor from last item
ORDER BY created_at DESC
LIMIT 20;

-- ✅ With composite cursor (when created_at isn't unique)
SELECT * FROM posts
WHERE (created_at, id) < ('2025-01-01T00:00:00Z', 'abc-123')
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

---

### 16. lock-row-level - Row-Level Locking

**Problem:** Holding locks too long or locking more than necessary.

**Impact:** Blocked queries, timeouts, deadlocks.

```sql
-- ❌ WRONG: Lock for entire transaction
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- ... slow API call ...
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- ✅ CORRECT: Lock only when needed
BEGIN;
-- Do API call first, get data
-- Then quick lock + update
SELECT * FROM accounts WHERE id = 1 FOR UPDATE NOWAIT;  -- Fail fast
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- ✅ For read-heavy with occasional writes: FOR SHARE
SELECT * FROM products WHERE id = 1 FOR SHARE;  -- Allows concurrent reads
```

---

### 17. query-covering-indexes - Covering Indexes

**Problem:** Index lookup still requires table access for additional columns.

**Impact:** Extra I/O for every matching row.

```sql
-- ❌ WRONG: Index doesn't cover SELECT columns
CREATE INDEX idx_orders_user ON orders(user_id);
SELECT user_id, total, created_at FROM orders WHERE user_id = 'abc';
-- Index finds rows, then reads table for total, created_at

-- ✅ CORRECT: Covering index with INCLUDE
CREATE INDEX idx_orders_user_covering
ON orders(user_id)
INCLUDE (total, created_at);
-- Index-only scan, no table access needed
```

---

### 18. advanced-partial-indexes - Partial Indexes

**Problem:** Full index when only subset of data is queried.

**Impact:** Larger index, slower updates, more storage.

```sql
-- ❌ WRONG: Full index for status queries
CREATE INDEX idx_orders_status ON orders(status);
-- But 90% of orders are 'completed', rarely queried

-- ✅ CORRECT: Partial index for active records only
CREATE INDEX idx_orders_active
ON orders(status, created_at)
WHERE status IN ('pending', 'processing');

-- Query must include the WHERE condition
SELECT * FROM orders
WHERE status = 'pending'  -- Uses partial index
AND created_at > '2025-01-01';
```

---

## MEDIUM PRIORITY

### 19. data-batch-inserts - Batch Insert Optimization

**Problem:** Many small transactions instead of batched operations.

**Impact:** High WAL write, fsync overhead, slow performance.

```sql
-- ❌ WRONG: Individual transactions
BEGIN; INSERT INTO logs VALUES (...); COMMIT;
BEGIN; INSERT INTO logs VALUES (...); COMMIT;
-- N transactions = N fsyncs

-- ✅ CORRECT: Batch in single transaction
BEGIN;
INSERT INTO logs VALUES
  (...),
  (...),
  (...);
COMMIT;
-- 1 transaction = 1 fsync

-- ✅ BETTER: Use COPY for bulk
COPY logs FROM STDIN WITH (FORMAT csv);
```

**Rule:** Batch size 100-1000 rows optimal.

---

### 20. security-rls-performance - RLS Performance Optimization

**Problem:** Complex RLS policies executed for every row.

**Impact:** 10-100x slower queries with poorly written policies.

```sql
-- ❌ WRONG: Subquery in every row evaluation
CREATE POLICY "team_access" ON documents
USING (team_id IN (
  SELECT team_id FROM team_members
  WHERE user_id = auth.uid()  -- Executed per row!
));

-- ✅ CORRECT: Wrap auth functions in SELECT
CREATE POLICY "team_access" ON documents
USING (team_id IN (
  SELECT team_id FROM team_members
  WHERE user_id = (SELECT auth.uid())  -- Cached!
));

-- ✅ BETTER: Use security definer function
CREATE OR REPLACE FUNCTION get_user_teams()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT team_id FROM team_members WHERE user_id = auth.uid();
$$;

CREATE POLICY "team_access" ON documents
USING (team_id IN (SELECT * FROM get_user_teams()));
```

---

### 21. advanced-jsonb-indexing - JSONB Index Strategies

**Problem:** JSONB queries without appropriate indexes.

**Impact:** Full table scan for JSON property lookups.

```sql
-- ❌ WRONG: No index for JSONB query
SELECT * FROM events WHERE data->>'type' = 'purchase';

-- ✅ CORRECT: GIN index for containment
CREATE INDEX idx_events_data ON events USING GIN (data);
-- Query with containment operator
SELECT * FROM events WHERE data @> '{"type": "purchase"}';

-- ✅ ALTERNATIVE: Expression index for specific paths
CREATE INDEX idx_events_type ON events ((data->>'type'));
-- Query normally
SELECT * FROM events WHERE data->>'type' = 'purchase';

-- ✅ For jsonb_path queries
CREATE INDEX idx_events_path ON events
USING GIN (data jsonb_path_ops);
```

---

### 22. advanced-brin-indexes - BRIN Indexes for Time-Series

**Problem:** B-tree indexes too large for append-only time-series data.

**Impact:** Large index storage, slower updates.

```sql
-- ❌ WRONG: B-tree on time-series
CREATE INDEX idx_logs_created ON logs(created_at);
-- Large index for billions of rows

-- ✅ CORRECT: BRIN for naturally ordered data
CREATE INDEX idx_logs_created_brin
ON logs USING BRIN (created_at)
WITH (pages_per_range = 128);

-- BRIN is 100-1000x smaller
-- Works because new rows have larger created_at values
-- Best for: logs, events, time-series data
```

**Rule:** Use BRIN when data is inserted in approximately sorted order.

---

### 22.5. advanced-hnsw-indexes - Vector Search Indexes (pgvector)

**Problem:** AI/ML applications need efficient similarity search on embeddings.

**Impact:** Without proper indexing, vector searches scan entire tables.

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table with vector column
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  content TEXT,
  embedding vector(1536)  -- OpenAI ada-002 dimension
);

-- ✅ HNSW index for approximate nearest neighbor search
CREATE INDEX idx_documents_embedding ON documents
USING hnsw (embedding vector_cosine_ops);

-- Query with similarity search
SELECT id, content, embedding <=> '[0.1, 0.2, ...]'::vector AS distance
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;
```

**Index types for pgvector:**
| Type | Best For | Trade-off |
|------|----------|-----------|
| `hnsw` | <1M vectors | Faster queries, more memory |
| `ivfflat` | >1M vectors | Less memory, needs training |

**Distance operators:**
- `<=>`: Cosine distance (normalized vectors)
- `<->`: L2/Euclidean distance
- `<#>`: Inner product (negative)

---

### 23. advanced-expression-indexes - Expression/Functional Indexes

**Problem:** Functions in WHERE clause prevent index usage.

**Impact:** Full table scan even with index on base column.

```sql
-- ❌ WRONG: Function prevents index use
CREATE INDEX idx_users_email ON users(email);
SELECT * FROM users WHERE lower(email) = 'user@example.com';
-- Index not used!

-- ✅ CORRECT: Expression index
CREATE INDEX idx_users_email_lower ON users(lower(email));
SELECT * FROM users WHERE lower(email) = 'user@example.com';
-- Index used!

-- Common patterns:
CREATE INDEX idx_date_trunc ON events (date_trunc('day', created_at));
CREATE INDEX idx_jsonb_field ON data ((payload->>'type'));
```

---

### 24. advanced-table-partitioning - Table Partitioning

**Problem:** Large tables (>100M rows) slow for all operations.

**Impact:** Slow queries, vacuum takes hours, backup issues.

```sql
-- ✅ CORRECT: Range partitioning for time-series
CREATE TABLE logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ NOT NULL,
  data JSONB
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE logs_2025_01 PARTITION OF logs
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE logs_2025_02 PARTITION OF logs
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Automate with pg_partman extension
CREATE EXTENSION pg_partman;
SELECT partman.create_parent('public.logs', 'created_at', 'native', 'monthly');
```

---

### 25. advanced-materialized-views - Materialized Views

**Problem:** Complex aggregations computed on every query.

**Impact:** Slow dashboard queries, repeated expensive calculations.

```sql
-- ❌ WRONG: Calculate on every request
SELECT
  date_trunc('day', created_at) AS day,
  COUNT(*) AS orders,
  SUM(total) AS revenue
FROM orders
GROUP BY 1;

-- ✅ CORRECT: Materialized view
CREATE MATERIALIZED VIEW daily_stats AS
SELECT
  date_trunc('day', created_at) AS day,
  COUNT(*) AS orders,
  SUM(total) AS revenue
FROM orders
GROUP BY 1;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_daily_stats_day ON daily_stats(day);

-- Refresh periodically (via cron or pg_cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_stats;
```

---

### 26. data-transactions - Transaction Best Practices

**Problem:** Long transactions, no error handling, inconsistent isolation.

**Impact:** Lock contention, data inconsistency, deadlocks.

```sql
-- ❌ WRONG: Long transaction
BEGIN;
SELECT * FROM accounts WHERE id = 1;
-- ... wait for API response ...
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- ✅ CORRECT: Short transactions
-- Get data first
SELECT * FROM accounts WHERE id = 1;

-- Make API call outside transaction

-- Quick transaction for update
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- ✅ With proper error handling
BEGIN;
  SAVEPOINT before_update;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  -- If error: ROLLBACK TO before_update;
COMMIT;
```

---

### 27. advanced-query-optimization - Query Optimization Techniques

**Problem:** Inefficient queries with unnecessary operations.

**Impact:** Wasted resources, slow responses.

```sql
-- ❌ WRONG: SELECT * when only need few columns
SELECT * FROM orders WHERE user_id = 'abc';

-- ✅ CORRECT: Select only needed columns
SELECT id, total, status FROM orders WHERE user_id = 'abc';

-- ❌ WRONG: Inefficient EXISTS alternative
SELECT * FROM users u
WHERE (SELECT COUNT(*) FROM orders WHERE user_id = u.id) > 0;

-- ✅ CORRECT: Use EXISTS
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders WHERE user_id = u.id);

-- ✅ Use EXPLAIN ANALYZE to verify
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 'abc';
```

---

## LOW-MEDIUM PRIORITY (Monitoring)

### 28. monitor-explain-analyze - EXPLAIN ANALYZE Usage

**Problem:** Not understanding query execution plans.

**Impact:** Unable to diagnose slow queries.

```sql
-- ✅ CORRECT: Full analysis
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 'abc-123';

-- Key metrics to check:
-- - Seq Scan on large tables (needs index)
-- - Nested Loop with many rows (needs optimization)
-- - High "actual time" vs low "rows" (inefficient)
-- - Buffer reads much higher than expected

-- ✅ For production (no execution)
EXPLAIN (COSTS, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 'abc-123';
```

---

### 29. monitor-pg-stat-statements - Query Statistics

**Problem:** No visibility into query patterns and performance.

**Impact:** Slow queries go undetected until users complain.

```sql
-- Enable extension (requires superuser)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top queries by total time
SELECT
  round(total_exec_time::numeric, 2) AS total_ms,
  calls,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;

-- Top queries by calls
SELECT
  calls,
  round(total_exec_time::numeric, 2) AS total_ms,
  query
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 20;

-- Reset statistics
SELECT pg_stat_statements_reset();
```

---

### 30. monitor-vacuum-analyze - Vacuum and Analyze

**Problem:** Stale statistics, table bloat, transaction ID wraparound.

**Impact:** Wrong query plans, wasted space, potential database freeze.

```sql
-- Check last vacuum/analyze
SELECT
  schemaname,
  relname,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- Manual ANALYZE after bulk operations
ANALYZE orders;

-- Manual VACUUM for immediate space reclaim
VACUUM (VERBOSE, ANALYZE) orders;

-- Check autovacuum settings
SHOW autovacuum;
SHOW autovacuum_vacuum_threshold;
SHOW autovacuum_analyze_threshold;

-- For large tables, tune per-table
ALTER TABLE logs SET (
  autovacuum_vacuum_threshold = 10000,
  autovacuum_analyze_threshold = 5000
);
```

---

## Quick Reference Queries

### Full Audit Query
```sql
-- Run all checks in one query
WITH checks AS (
  -- Tables without RLS
  SELECT 'no_rls' AS check_type, tablename AS item
  FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false

  UNION ALL

  -- FKs without indexes (checking each FK column individually)
  SELECT 'fk_no_index', c.conrelid::regclass::text || '.' || a.attname
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
  WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid
    AND a.attnum = ANY(i.indkey)
  )
)
SELECT check_type, COUNT(*) AS issues, array_agg(item ORDER BY item) AS items
FROM checks
GROUP BY check_type;
```

---

## References

- [Supabase Agent Skills Repository](https://github.com/supabase-community/supabase-agent-skills)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL Performance Wiki](https://wiki.postgresql.org/wiki/Performance_Optimization)
