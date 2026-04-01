# Task: Analyze Hot Query Paths

| Field | Value |
|-------|-------|
| **execution_type** | `Hybrid` |
| **pattern** | EXEC-HY-001 |
| **script** | `scripts/db-ops/explain-analyzer.sh` |
| **rationale** | Worker coleta pg_stat_statements, Agent analisa e prioriza |

**Purpose**: Run EXPLAIN ANALYZE on common/critical queries to identify performance issues

**Elicit**: true

---

## 🚀 NEW: Use Automated Query Analyzer (RECOMMENDED)

**Token Savings: 89% | Time Savings: ~85%**

```bash
# Analyze hot paths automatically with performance recommendations
./squads/db-sage/scripts/db-ops/explain-analyzer.sh

# Analyze specific query
./squads/db-sage/scripts/db-ops/explain-analyzer.sh "{sql}"

# With execution statistics and buffer analysis
./squads/db-sage/scripts/db-ops/explain-analyzer.sh "{sql}" --analyze --buffers

# Get JSON output for parsing
./squads/db-sage/scripts/db-ops/explain-analyzer.sh "{sql}" --format json

# Benefits:
#   - Automatic hot path detection from pg_stat_statements
#   - Performance issue identification
#   - Index recommendations
#   - Buffer cache analysis
#   - 89% token savings
```

**OR continue with manual analysis below:**

---

## Inputs

- `queries_file` (optional): Path to file with labeled queries to analyze
- If not provided, analyze common patterns from pg_stat_statements

---

## Process

### 1. Enable Required Extensions

Ensure performance monitoring is available:

```bash
echo "Enabling performance extensions..."

psql "$SUPABASE_DB_URL" << 'EOF'
-- Enable pg_stat_statements (should already be enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Optionally enable index_advisor (Supabase extension)
CREATE EXTENSION IF NOT EXISTS index_advisor;

SELECT 'Extensions ready' AS status;
EOF

echo "✓ Extensions enabled"
```

### 2. Identify Hot Queries

If no queries_file provided, find slowest queries from pg_stat_statements:

```bash
echo "Finding slow queries from pg_stat_statements..."

psql "$SUPABASE_DB_URL" << 'EOF'
SELECT
  query,
  calls,
  ROUND(total_exec_time::numeric, 2) AS total_time_ms,
  ROUND(mean_exec_time::numeric, 2) AS mean_time_ms,
  ROUND(max_exec_time::numeric, 2) AS max_time_ms,
  ROUND((100 * total_exec_time / SUM(total_exec_time) OVER ())::numeric, 2) AS pct_total_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%pg_catalog%'
ORDER BY mean_exec_time DESC
LIMIT 20;
EOF
```

Ask user:
```
Top 20 slow queries found.
Select query numbers to analyze (comma-separated, e.g., 1,3,5):
Or type 'all' to analyze all:
```

### 3. Run EXPLAIN ANALYZE with BUFFERS

For each selected query, run comprehensive analysis:

```bash
echo "Analyzing query performance..."

# CRITICAL: Always use ANALYZE, BUFFERS for complete picture
psql "$SUPABASE_DB_URL" << 'EOF'
-- Query being analyzed
\echo '=========================================='
\echo 'QUERY: {query_label}'
\echo '=========================================='

-- Option 1: EXPLAIN ANALYZE with BUFFERS (recommended)
EXPLAIN (
  ANALYZE true,
  BUFFERS true,
  VERBOSE true,
  COSTS true,
  TIMING true
)
{actual_query};

\echo ''
\echo 'BUFFERS LEGEND:'
\echo '  - shared hit = blocks found in buffer cache (good)'
\echo '  - shared read = blocks read from disk (bad if high)'
\echo '  - temp read/written = temporary files (bad if present)'
\echo ''

EOF
```

### 4. Generate Index Recommendations

Use index_advisor extension (Supabase-specific):

```bash
echo "Generating index recommendations..."

psql "$SUPABASE_DB_URL" << 'EOF'
-- Use index_advisor to get suggestions
SELECT *
FROM index_advisor('{actual_query}');

-- Alternative: Supabase Studio has Index Advisor UI
-- Navigate to: Query Performance Report → Select query → "indexes" tab
EOF
```

### 5. Analyze Results

Identify common performance issues:

```bash
echo "Performance Issue Checklist:"
echo ""
echo "🔍 Sequential Scans:"
echo "   - Look for: 'Seq Scan on table_name'"
echo "   - Problem if: Large tables (>1000 rows) + filter removes many rows"
echo "   - Fix: Add index on filter columns"
echo ""
echo "🔍 Row Count Mismatches:"
echo "   - Compare: rows=XXXX (estimated) vs actual rows=YYYY"
echo "   - Problem if: Estimate differs by >10x from actual"
echo "   - Fix: ANALYZE table_name; (update statistics)"
echo ""
echo "🔍 Buffer Cache Misses:"
echo "   - Look for: 'shared read' in BUFFERS output"
echo "   - Problem if: High compared to 'shared hit'"
echo "   - Fix: Increase shared_buffers, optimize query, add indexes"
echo ""
echo "🔍 Temporary Files:"
echo "   - Look for: 'temp read' or 'temp written' in BUFFERS"
echo "   - Problem: Query using disk for sorting/hashing (work_mem too small)"
echo "   - Fix: Increase work_mem, optimize query, add indexes"
echo ""
echo "🔍 Nested Loops:"
echo "   - Look for: 'Nested Loop' with high row counts"
echo "   - Problem if: Loops=10000+ iterations"
echo "   - Fix: Add indexes on join columns, consider Hash Join"
echo ""
```

### 6. Create Analysis Report

Generate markdown report with findings:

```bash
REPORT_FILE="supabase/docs/performance-analysis-$(date +%Y%m%d%H%M%S).md"
mkdir -p supabase/docs

cat > "$REPORT_FILE" << 'MDEOF'
# Query Performance Analysis

**Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Database**: [redacted]
**Tool**: DB Sage db-analyze-hotpaths

---

## Executive Summary

- Queries analyzed: {count}
- Avg execution time: {avg_time}ms
- Indexes recommended: {index_count}

---

## Detailed Findings

### Query 1: {query_label}

**Current Performance:**
- Mean execution time: {mean_time}ms
- Calls: {calls}
- % of total time: {pct_time}%

**EXPLAIN ANALYZE Output:**
```
{explain_output}
```

**Issues Identified:**
1. {issue_1}
2. {issue_2}

**Recommended Indexes:**
```sql
{recommended_indexes}
```

**Expected Improvement:** {estimated_improvement}

---

[Repeat for each query...]

---

## Action Items

- [ ] Create migration for recommended indexes
- [ ] Update statistics: ANALYZE {tables}
- [ ] Re-run analysis after changes
- [ ] Monitor with pg_stat_statements

MDEOF

echo "✓ Report: $REPORT_FILE"
```

---

## Output

Display summary and next steps:

```
✅ HOT PATH ANALYSIS COMPLETE

Queries analyzed: {count}
Report: supabase/docs/performance-analysis-{timestamp}.md

Key Findings:
- {finding_1}
- {finding_2}
- {finding_3}

Recommended Actions:
1. Review report: cat {report_file}
2. Create index migration for recommended indexes
3. Update statistics: ANALYZE {affected_tables}
4. Re-run analysis: *analyze-hotpaths

Index Recommendations:
{list of CREATE INDEX statements}
```

---

## Common Query Patterns to Check

### Pattern 1: User-Specific Data
```sql
-- Hot path: Get user's posts
SELECT * FROM posts WHERE user_id = 'xxx';

-- Check: Index on user_id exists?
-- Verify: USING (auth.uid() = user_id) is wrapped in SELECT for RLS performance
```

### Pattern 2: Joins
```sql
-- Hot path: Posts with author info
SELECT p.*, u.name
FROM posts p
JOIN users u ON p.user_id = u.id;

-- Check: Index on posts(user_id)? Index on users(id) should exist (PK)
```

### Pattern 3: Filters + Sorts
```sql
-- Hot path: Recent published posts
SELECT * FROM posts
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 10;

-- Check: Index on (status, created_at DESC)?
```

### Pattern 4: Aggregations
```sql
-- Hot path: User post count
SELECT user_id, COUNT(*)
FROM posts
GROUP BY user_id;

-- Check: Index on user_id? Or denormalize count?
```

---

## BUFFERS Output Interpretation

**Good (Cached):**
```
Buffers: shared hit=100
```
= 100 blocks found in cache (no disk I/O)

**Bad (Disk Reads):**
```
Buffers: shared hit=10 read=990
```
= Only 10 blocks cached, 990 read from disk

**Very Bad (Temp Files):**
```
Buffers: temp read=5000 written=5000
```
= Query spilled to disk (work_mem too small)

**Target:** Maximize "shared hit", minimize "shared read", zero "temp"

---

## Supabase-Specific Notes

### Using with Supabase Client (PostgREST)

Enable explain in SQL editor first (dev only):
```sql
-- Run once in Dashboard SQL Editor
ALTER DATABASE postgres SET app.settings.explain TO 'on';
```

Then use in code:
```javascript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .explain({ analyze: true, buffers: true })
```

### Supabase Studio Integration

- Navigate to: **Query Performance Report**
- Select slow query
- Click **"indexes" tab** for index_advisor recommendations
- One-click to create migration

---

## Prerequisites

- pg_stat_statements extension enabled (default in Supabase)
- Sufficient database activity to populate statistics
- For index_advisor: index_advisor extension (Supabase Pro+)

---

## Best Practices

1. **Always use BUFFERS**: `EXPLAIN (ANALYZE, BUFFERS)`
2. **Look for patterns**: One slow query often indicates a systemic issue
3. **Update statistics**: Run `ANALYZE` after significant data changes
4. **Test indexes**: Create indexes CONCURRENTLY in production
5. **Re-measure**: After optimizations, re-run this analysis
6. **RLS Performance**: Wrap auth functions in SELECT for 19x speedup

---

## References

- [PostgreSQL EXPLAIN Documentation](https://www.postgresql.org/docs/current/sql-explain.html)
- [Supabase Query Optimization](https://supabase.com/docs/guides/database/query-optimization)
- [Supabase RLS Performance](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- [index_advisor Extension](https://supabase.com/docs/guides/database/extensions/index_advisor)
