# Task: Query Optimization Session

| Field | Value |
|-------|-------|
| **execution_type** | `Hybrid` |
| **pattern** | EXEC-HY-001 |
| **script** | `scripts/db-ops/explain-analyzer.sh` |
| **rationale** | Worker coleta EXPLAIN, Agent/Human interpreta e sugere otimizações |

**Purpose**: Interactive session to optimize slow queries

**Elicit**: true

---

## 🚀 NEW: Use Automated Query Tools (RECOMMENDED)

**Token Savings: 88% | Time Savings: ~84%**

```bash
# Analyze query with execution metrics and buffer usage
./squads/db-sage/scripts/db-ops/explain-analyzer.sh "{query}" --analyze --buffers

# Get machine-readable output for downstream recommendation logic
./squads/db-sage/scripts/db-ops/explain-analyzer.sh "{query}" --format json

# Fast deterministic baseline without running the query
./squads/db-sage/scripts/db-ops/explain-analyzer.sh "{query}"

# Benefits:
#   - Automatic slow query detection
#   - Index recommendations
#   - Query rewrite suggestions
#   - Before/after comparison
#   - 88% token savings
```

**OR continue with manual query optimization below:**

---

## Inputs

- `query` (string): SQL query to optimize (optional - can discover from pg_stat_statements)

---

## Process

### 1. Identify Slow Query

If query not provided, find it:

```bash
echo "Finding slow queries..."

psql "$SUPABASE_DB_URL" << 'EOF'
SELECT
  queryid,
  LEFT(query, 100) AS query_preview,
  calls,
  ROUND(mean_exec_time::numeric, 2) AS avg_ms,
  ROUND(total_exec_time::numeric, 2) AS total_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;
EOF

echo ""
echo "Select query to optimize (enter queryid or paste full query):"
read QUERY_INPUT
```

### 2. Run EXPLAIN ANALYZE

Analyze current performance:

```bash
echo "Running EXPLAIN ANALYZE..."

psql "$SUPABASE_DB_URL" << EOF
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
{query};
EOF
```

### 3. Identify Issues

Guide user through analysis:

```
Analyzing EXPLAIN output...

Check the following (in order of importance):

1. ❌ Sequential Scans on large tables?
   Look for: "Seq Scan on table_name"
   Filter removes many rows: rows=1000000 → actual rows=10
   → FIX: Add index on WHERE clause columns

2. ❌ Row count estimate mismatches?
   Compare: rows=100 (plan) vs actual rows=10000 (reality)
   Difference > 10x is problematic
   → FIX: Run ANALYZE table_name;

3. ❌ Nested Loops with high iteration count?
   Look for: "Nested Loop (actual ... loops=10000)"
   → FIX: Add index on join columns, or force Hash Join

4. ❌ Disk reads (buffer cache misses)?
   Look for: "Buffers: shared read=1000"
   High compared to "shared hit"
   → FIX: Add indexes, increase shared_buffers, optimize query

5. ❌ Temporary files (work_mem exceeded)?
   Look for: "Buffers: temp read=5000 written=5000"
   → FIX: Increase work_mem, optimize query, add indexes

6. ❌ Sort operations on large datasets?
   Look for: "Sort Method: external merge Disk: 50000kB"
   → FIX: Add index on ORDER BY columns, increase work_mem

7. ❌ Expensive function calls in WHERE?
   Look for: Functions evaluated on every row
   → FIX: Use expression index, or filter before function call
```

### 4. Generate Recommendations

Based on issues found:

```bash
echo "Generating optimization recommendations..."

cat << 'MDEOF'
## Optimization Recommendations

### Issue 1: Sequential Scan on 'users' table

**Current:**
```
Seq Scan on users (cost=0.00..1829.00 rows=1000 width=100)
  Filter: (email = 'user@example.com')
  Rows Removed by Filter: 99999
  Buffers: shared read=829
```

**Problem:** Full table scan for email lookup

**Solution:** Add index on email
```sql
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

**Expected Improvement:** 99%+ faster (1000ms → <10ms)

---

### Issue 2: Row count mismatch

**Current:**
```
Estimated rows: 100
Actual rows: 10000
```

**Problem:** Stale statistics causing bad query plan

**Solution:** Update table statistics
```sql
ANALYZE users;
```

**Expected Improvement:** Better query plan selection

---

[Continue for each issue...]

MDEOF
```

### 5. Create Optimization Migration

Generate migration with recommended indexes:

```bash
TS=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="supabase/migrations/${TS}_optimize_query.sql"

cat > "$MIGRATION_FILE" << 'EOF'
-- Query Optimization Migration
-- Generated: $(date -u)
-- Target: {query_description}

BEGIN;

-- Add recommended indexes (CONCURRENTLY for zero downtime)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email
  ON users(email);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_created
  ON posts(user_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Update statistics
ANALYZE users;
ANALYZE posts;

COMMIT;

-- Verify improvement
EXPLAIN (ANALYZE, BUFFERS)
{original_query};
EOF

echo "✓ Migration: $MIGRATION_FILE"
```

### 6. Test Optimization

Apply and measure improvement:

```bash
echo "Applying optimization..."

# Run migration
psql "$SUPABASE_DB_URL" -f "$MIGRATION_FILE"

echo "Re-running EXPLAIN ANALYZE..."

# Compare before/after
psql "$SUPABASE_DB_URL" << EOF
EXPLAIN (ANALYZE, BUFFERS)
{query};
EOF

echo ""
echo "Compare execution times:"
echo "  Before: {before_time}ms"
echo "  After:  {after_time}ms"
echo "  Improvement: {percentage}%"
```

---

## Output

Display optimization summary:

```
✅ QUERY OPTIMIZATION COMPLETE

Query: {query_summary}

Performance Improvement:
  Before:  {before_time}ms
  After:   {after_time}ms
  Speedup: {speedup}x ({percentage}% faster)

Changes Applied:
  ✓ Added index on users(email)
  ✓ Added index on posts(user_id, created_at)
  ✓ Updated table statistics

Migration: supabase/migrations/{TS}_optimize_query.sql

Next Steps:
1. Monitor query performance in production
2. Update application to use optimized query
3. Consider denormalization if still slow
4. Review similar queries for same patterns
```

---

## Common Optimization Patterns

### Pattern 1: Simple Filter

**Before:**
```sql
SELECT * FROM users WHERE email = 'user@example.com';
-- Seq Scan: 1000ms
```

**After:**
```sql
CREATE INDEX idx_users_email ON users(email);
-- Index Scan: 5ms
```

### Pattern 2: Composite Filter

**Before:**
```sql
SELECT * FROM posts
WHERE user_id = 'xxx' AND status = 'published'
ORDER BY created_at DESC
LIMIT 10;
-- Seq Scan: 500ms
```

**After:**
```sql
CREATE INDEX idx_posts_user_status_created
  ON posts(user_id, status, created_at DESC)
  WHERE deleted_at IS NULL;
-- Index Scan: 2ms
```

### Pattern 3: Join Optimization

**Before:**
```sql
SELECT p.*, u.name
FROM posts p
JOIN users u ON p.user_id = u.id;
-- Nested Loop: 2000ms
```

**After:**
```sql
-- Add index on FK
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Or force Hash Join for large datasets
SELECT /*+ HashJoin(p u) */ p.*, u.name
FROM posts p
JOIN users u ON p.user_id = u.id;
-- Hash Join: 200ms
```

### Pattern 4: Partial Index

**Before:**
```sql
-- Index on all rows
CREATE INDEX idx_posts_created ON posts(created_at);
-- Index size: 100MB
```

**After:**
```sql
-- Index only active rows
CREATE INDEX idx_posts_active_created
  ON posts(created_at)
  WHERE deleted_at IS NULL;
-- Index size: 20MB, same performance for active queries
```

### Pattern 5: Covering Index

**Before:**
```sql
SELECT id, title, created_at FROM posts WHERE user_id = 'xxx';
-- Index Scan + Table Lookup
```

**After:**
```sql
CREATE INDEX idx_posts_user_covering
  ON posts(user_id)
  INCLUDE (title, created_at);
-- Index-Only Scan (no table lookup)
```

### Pattern 6: Expression Index

**Before:**
```sql
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';
-- Seq Scan (can't use regular index)
```

**After:**
```sql
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
-- Index Scan
```

---

## Advanced Techniques

### 1. Denormalization

When joins are too expensive:

```sql
-- Add redundant column
ALTER TABLE posts ADD COLUMN author_name TEXT;

-- Populate from join
UPDATE posts p
SET author_name = u.name
FROM users u
WHERE p.user_id = u.id;

-- Keep in sync with trigger
CREATE OR REPLACE FUNCTION sync_author_name()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET author_name = NEW.name
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_author_name
  AFTER UPDATE OF name ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_author_name();
```

### 2. Materialized Views

For expensive aggregations:

```sql
CREATE MATERIALIZED VIEW user_stats AS
SELECT
  user_id,
  COUNT(*) AS post_count,
  MAX(created_at) AS last_post_at
FROM posts
GROUP BY user_id;

CREATE UNIQUE INDEX ON user_stats(user_id);

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
```

### 3. Partitioning

For very large tables:

```sql
-- Time-based partitioning
CREATE TABLE posts (
  id UUID,
  created_at TIMESTAMPTZ,
  ...
) PARTITION BY RANGE (created_at);

CREATE TABLE posts_2024_01 PARTITION OF posts
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Queries automatically use partition pruning
SELECT * FROM posts
WHERE created_at >= '2024-01-15'
  AND created_at < '2024-01-20';
-- Only scans posts_2024_01 partition
```

---

## Measurement Tools

### 1. Query Timing (Basic)

```sql
\timing on
{your_query}
```

### 2. pg_stat_statements (Production Monitoring)

**Best for:** Cumulative performance analysis and trend tracking

```sql
-- Enable extension (should already be enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries (by mean execution time)
SELECT
  LEFT(query, 100) AS query_preview,
  calls,
  ROUND(mean_exec_time::numeric, 2) AS avg_ms,
  ROUND(total_exec_time::numeric, 2) AS total_ms,
  ROUND((100 * total_exec_time / SUM(total_exec_time) OVER())::numeric, 2) AS pct_total
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- NEW in PostgreSQL 13+: Planning vs Execution time
SELECT
  LEFT(query, 100) AS query_preview,
  calls,
  ROUND(mean_plan_time::numeric, 2) AS avg_plan_ms,
  ROUND(mean_exec_time::numeric, 2) AS avg_exec_ms,
  ROUND((mean_plan_time / NULLIF(mean_exec_time, 0) * 100)::numeric, 2) AS plan_pct
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_plan_time DESC
LIMIT 10;
-- If plan_pct > 20%, consider using prepared statements
```

### 3. auto_explain (Automatic Slow Query Logging)

**Best for:** Production debugging without manual EXPLAIN

```sql
-- Enable the extension
LOAD 'auto_explain';

-- Configure (Supabase Dashboard → Database → Settings or ALTER SYSTEM)
ALTER SYSTEM SET auto_explain.log_min_duration = 1000;  -- Log queries > 1s
ALTER SYSTEM SET auto_explain.log_analyze = on;
ALTER SYSTEM SET auto_explain.log_buffers = on;
ALTER SYSTEM SET auto_explain.log_timing = on;  -- Include timing info
ALTER SYSTEM SET auto_explain.log_verbose = on;  -- Verbose output

-- Reload configuration
SELECT pg_reload_conf();

-- Slow queries are now logged automatically to PostgreSQL logs
-- Access via Supabase Dashboard → Logs or pg_stat_statements
```

**Real-world benefit:** Invaluable for identifying problematic queries in production without manual intervention.

### 4. Modern Visualization Tools (2025)

**Postgres Explain Visualizer 2 (pev2)** - Interactive browser-based tool:
- Visual execution plan with collapsible nodes
- Color-coded operation costs and timings
- Automatic bottleneck detection
- https://explain.dalibo.com/ (online tool)

**pgMustard** - AI-powered plan analysis:
- Automated performance recommendations
- Visual execution plan with insights
- https://www.pgmustard.com/

**Example workflow:**
```bash
# 1. Get EXPLAIN output as JSON
psql "$DB_URL" -c "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT ..." > plan.json

# 2. Upload to https://explain.dalibo.com/
# Visual analysis with recommendations
```

### 5. Emerging: AI-Assisted Tuning (2025+)

**pgai extension** - Machine learning for query optimization:
```sql
-- Install pgai (if available)
CREATE EXTENSION IF NOT EXISTS pgai;

-- Analyze query and get AI suggestions
SELECT pgai.suggest_indexes('SELECT * FROM users WHERE email = $1');

-- Returns: AI-generated index recommendations based on query patterns
```

**Self-learning query caching:**
- ML models predict which queries will run next
- Pre-load data before query execution
- Significant latency reduction for predictable workloads

---

## Regular Maintenance

**Critical:** Database performance degrades without maintenance!

```sql
-- Update statistics (run after significant data changes)
ANALYZE;  -- All tables
ANALYZE users;  -- Specific table

-- Vacuum and analyze (scheduled maintenance)
VACUUM ANALYZE;

-- Check table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_dead_tup AS dead_rows
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

---

## References

- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Supabase Query Optimization](https://supabase.com/docs/guides/database/query-optimization)
- [Use The Index, Luke](https://use-the-index-luke.com/)
