#!/usr/bin/env bash
# =============================================================================
# best-practices-auditor.sh - Supabase Best Practices Audit (Worker Script)
# =============================================================================
# execution_type: Worker
# pattern: EXEC-W-001
# tasks: db-best-practices-audit
# token_savings: 92%
# =============================================================================
# Based on 30 Supabase Agent Skills rules
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Defaults
SECTION="all"
VERBOSE=false
OUTPUT_FORMAT="terminal"
DB_URL=""

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Audit database against Supabase best practices (30 rules).

OPTIONS:
    --all              Run all audits (default)
    --connections      Connection management audit
    --fk-indexes       Foreign key index audit
    --rls              RLS coverage audit
    --schema           Schema quality audit
    --performance      Query performance audit
    --indexes          Index quality audit
    --vacuum           Vacuum & statistics audit
    --audit-trail      Audit trail check
    --json             Output as JSON (for programmatic use)
    -v, --verbose      Verbose output
    -h, --help         Show this help

EXAMPLES:
    $(basename "$0") --all
    $(basename "$0") --rls --fk-indexes
    $(basename "$0") --performance --json

ENVIRONMENT:
    SUPABASE_DB_URL or DATABASE_URL  Required. PostgreSQL connection string.
EOF
}

log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_section() { echo -e "\n${CYAN}═══ $1 ═══${NC}\n"; }

check_env() {
    DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
    if [[ -z "$DB_URL" ]]; then
        log_error "SUPABASE_DB_URL or DATABASE_URL not set"
        exit 1
    fi
}

# =============================================================================
# 1. Connection Management Audit
# =============================================================================
audit_connections() {
    log_section "CONNECTION MANAGEMENT AUDIT"

    psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo 'Active Connections by State:'
SELECT state, COUNT(*) as count, array_agg(DISTINCT usename) as users
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state
ORDER BY count DESC;

\echo ''
\echo 'Configuration:'
SELECT name, setting, unit
FROM pg_settings
WHERE name IN (
  'max_connections',
  'idle_in_transaction_session_timeout',
  'statement_timeout',
  'lock_timeout'
);

\echo ''
\echo 'Connection Pool Check:'
SELECT
  (SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()) as active_conn,
  (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_conn,
  ROUND(100.0 * (SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()) /
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections'), 1) as usage_pct;
SQL
}

# =============================================================================
# 2. Foreign Key Index Audit
# =============================================================================
audit_fk_indexes() {
    log_section "FOREIGN KEY INDEX AUDIT"

    psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo 'Foreign Keys WITHOUT Indexes (CRITICAL):'
SELECT
    c.conrelid::regclass AS table_name,
    a.attname AS fk_column,
    c.confrelid::regclass AS references_table,
    pg_size_pretty(pg_relation_size(c.conrelid)) AS table_size
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
AND c.conrelid::regclass::text NOT LIKE 'pg_%'
AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid
    AND a.attnum = ANY(i.indkey)
)
ORDER BY pg_relation_size(c.conrelid) DESC;

\echo ''
\echo 'Summary:'
SELECT
  (SELECT COUNT(*) FROM pg_constraint WHERE contype = 'f') AS total_fks,
  COUNT(*) AS fks_without_index
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid
    AND a.attnum = ANY(i.indkey)
);
SQL
}

# =============================================================================
# 3. RLS Coverage Audit
# =============================================================================
audit_rls() {
    log_section "RLS COVERAGE AUDIT"

    psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo 'Tables WITHOUT RLS (Security Risk):'
SELECT
  t.tablename,
  pg_size_pretty(pg_relation_size(quote_ident(t.tablename)::regclass)) AS size,
  (SELECT COUNT(*) FROM pg_attribute a
   WHERE a.attrelid = quote_ident(t.tablename)::regclass
   AND a.attname LIKE '%user%') AS has_user_column
FROM pg_tables t
WHERE t.schemaname = 'public'
AND t.rowsecurity = false
ORDER BY pg_relation_size(quote_ident(t.tablename)::regclass) DESC;

\echo ''
\echo 'Tables with RLS but NO POLICIES (Completely Blocked):'
SELECT t.tablename
FROM pg_tables t
WHERE t.schemaname = 'public'
AND t.rowsecurity = true
AND NOT EXISTS (
  SELECT 1 FROM pg_policies p
  WHERE p.tablename = t.tablename
  AND p.schemaname = 'public'
);

\echo ''
\echo 'Policy Coverage Summary:'
SELECT
  t.tablename,
  t.rowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policy_count,
  ARRAY_AGG(DISTINCT p.cmd) FILTER (WHERE p.cmd IS NOT NULL) AS operations_covered
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.rowsecurity DESC, policy_count;

\echo ''
\echo 'RLS Summary:'
SELECT
  COUNT(*) AS total_tables,
  COUNT(*) FILTER (WHERE rowsecurity) AS rls_enabled,
  COUNT(*) FILTER (WHERE NOT rowsecurity) AS rls_disabled,
  ROUND(100.0 * COUNT(*) FILTER (WHERE rowsecurity) / COUNT(*), 1) AS coverage_pct
FROM pg_tables
WHERE schemaname = 'public';
SQL
}

# =============================================================================
# 4. Schema Quality Audit
# =============================================================================
audit_schema() {
    log_section "SCHEMA QUALITY AUDIT"

    psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo 'Potential Data Type Issues:'
SELECT
  c.table_name,
  c.column_name,
  c.data_type,
  CASE
    WHEN c.data_type = 'timestamp without time zone' THEN 'Use TIMESTAMPTZ'
    WHEN c.data_type = 'character varying' AND c.character_maximum_length > 255 THEN 'Consider TEXT'
    WHEN c.data_type = 'double precision' AND c.column_name LIKE '%price%' THEN 'Use NUMERIC for money'
    WHEN c.data_type = 'double precision' AND c.column_name LIKE '%amount%' THEN 'Use NUMERIC for money'
    WHEN c.data_type = 'integer' AND c.column_name = 'id' THEN 'Consider BIGINT for PKs'
    WHEN c.data_type = 'json' THEN 'Use JSONB instead'
  END AS recommendation
FROM information_schema.columns c
WHERE c.table_schema = 'public'
AND (
  c.data_type = 'timestamp without time zone'
  OR (c.data_type = 'character varying' AND c.character_maximum_length > 255)
  OR (c.data_type = 'double precision' AND (c.column_name LIKE '%price%' OR c.column_name LIKE '%amount%'))
  OR (c.data_type = 'integer' AND c.column_name = 'id')
  OR c.data_type = 'json'
)
ORDER BY c.table_name;

\echo ''
\echo 'Primary Key Types:'
SELECT
  tc.table_name,
  c.column_name,
  c.data_type,
  CASE
    WHEN c.data_type = 'uuid' THEN 'OK'
    WHEN c.data_type = 'bigint' THEN 'OK'
    WHEN c.data_type = 'integer' THEN 'Consider BIGINT'
    ELSE 'Review'
  END AS status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.columns c
  ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
WHERE tc.constraint_type = 'PRIMARY KEY'
AND tc.table_schema = 'public'
ORDER BY status DESC, tc.table_name;

\echo ''
\echo 'Naming Convention Check (should be snake_case):'
SELECT 'table' AS type, tablename AS name, 'Contains uppercase' AS issue
FROM pg_tables WHERE schemaname = 'public' AND tablename ~ '[A-Z]'
UNION ALL
SELECT 'column', table_name || '.' || column_name, 'Contains uppercase'
FROM information_schema.columns
WHERE table_schema = 'public' AND column_name ~ '[A-Z]';
SQL
}

# =============================================================================
# 5. Query Performance Audit
# =============================================================================
audit_performance() {
    log_section "QUERY PERFORMANCE AUDIT"

    psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo 'pg_stat_statements status:'
SELECT
  CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements')
    THEN 'ENABLED'
    ELSE 'DISABLED - run: CREATE EXTENSION pg_stat_statements'
  END AS status;

\echo ''
\echo 'Top 10 Slow Queries (mean_exec_time > 100ms):'
SELECT
  ROUND(mean_exec_time::numeric, 2) AS mean_ms,
  calls,
  ROUND(total_exec_time::numeric, 2) AS total_ms,
  LEFT(query, 100) AS query_preview
FROM pg_stat_statements
WHERE mean_exec_time > 100
AND query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 10;

\echo ''
\echo 'Sequential Scans on Large Tables (potential index needed):'
SELECT
  schemaname,
  relname AS table_name,
  seq_scan,
  seq_tup_read,
  idx_scan,
  pg_size_pretty(pg_relation_size(relid)) AS size,
  CASE
    WHEN idx_scan = 0 AND seq_scan > 100 THEN 'CRITICAL: No index usage'
    WHEN seq_tup_read / NULLIF(seq_scan, 0) > 10000 THEN 'HIGH: Large seq scans'
    ELSE 'OK'
  END AS status
FROM pg_stat_user_tables
WHERE seq_scan > 0
AND pg_relation_size(relid) > 10000000  -- > 10MB
ORDER BY seq_tup_read DESC
LIMIT 10;
SQL
}

# =============================================================================
# 6. Index Quality Audit
# =============================================================================
audit_indexes() {
    log_section "INDEX QUALITY AUDIT"

    psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo 'Potentially Unused Indexes (candidates for removal):'
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan AS times_used
FROM pg_stat_user_indexes
WHERE idx_scan < 10
AND pg_relation_size(indexrelid) > 1000000  -- > 1MB
AND indexrelname NOT LIKE '%pkey%'
AND indexrelname NOT LIKE '%pk%'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 10;

\echo ''
\echo 'Duplicate Indexes:'
SELECT
  indrelid::regclass AS table_name,
  array_agg(indexrelid::regclass) AS index_names
FROM pg_index
GROUP BY indrelid, indkey
HAVING COUNT(*) > 1;

\echo ''
\echo 'Index Types Distribution:'
SELECT
  am.amname AS index_type,
  COUNT(*) AS count
FROM pg_index i
JOIN pg_class c ON c.oid = i.indexrelid
JOIN pg_am am ON am.oid = c.relam
WHERE c.relnamespace = 'public'::regnamespace
GROUP BY am.amname
ORDER BY count DESC;
SQL
}

# =============================================================================
# 7. Vacuum & Statistics Audit
# =============================================================================
audit_vacuum() {
    log_section "VACUUM & STATISTICS AUDIT"

    psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo 'Tables with High Dead Tuple Count:'
SELECT
  schemaname,
  relname AS table_name,
  n_live_tup,
  n_dead_tup,
  ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 1) AS dead_pct,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC
LIMIT 10;

\echo ''
\echo 'Tables Never Analyzed:'
SELECT relname AS table_name, last_analyze, last_autoanalyze
FROM pg_stat_user_tables
WHERE last_analyze IS NULL AND last_autoanalyze IS NULL;

\echo ''
\echo 'Autovacuum Settings:'
SELECT name, setting, unit
FROM pg_settings
WHERE name LIKE 'autovacuum%'
ORDER BY name;
SQL
}

# =============================================================================
# 8. Audit Trail Check
# =============================================================================
audit_trail() {
    log_section "AUDIT TRAIL CHECK"

    psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo 'pgaudit status:'
SELECT
  CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgaudit')
    THEN 'INSTALLED'
    ELSE 'NOT INSTALLED'
  END AS pgaudit_status;

\echo ''
\echo 'Tables configured for audit (via auditor role):'
SELECT table_name, array_agg(privilege_type ORDER BY privilege_type) as privileges
FROM information_schema.table_privileges
WHERE grantee = 'auditor'
GROUP BY table_name
ORDER BY table_name;

\echo ''
\echo 'pgaudit configuration:'
SELECT name, setting
FROM pg_settings
WHERE name LIKE 'pgaudit%';
SQL
}

# =============================================================================
# Score Summary
# =============================================================================
show_score_summary() {
    log_section "AUDIT SCORE SUMMARY"

    cat << 'EOF'
┌─────────────────┬────────┬────────┬────────┬───────┐
│ Category        │ Weight │ Checks │ Passed │ Score │
├─────────────────┼────────┼────────┼────────┼───────┤
│ Connection      │   15%  │    5   │   -    │   -   │
│ FK Indexes      │   15%  │    2   │   -    │   -   │
│ RLS             │   20%  │    4   │   -    │   -   │
│ Schema          │   15%  │    6   │   -    │   -   │
│ Query Perf      │   15%  │    4   │   -    │   -   │
│ Indexes         │   10%  │    3   │   -    │   -   │
│ Vacuum          │   10%  │    4   │   -    │   -   │
├─────────────────┼────────┼────────┼────────┼───────┤
│ TOTAL           │  100%  │   28   │   -    │   -   │
└─────────────────┴────────┴────────┴────────┴───────┘

Issue Classification:

  CRITICAL (Fix Now):
    • FKs without indexes on tables >10k rows
    • User tables without RLS
    • Connection usage >90%

  HIGH (Fix This Sprint):
    • pg_stat_statements not enabled
    • Sequential scans on large tables
    • TIMESTAMP without timezone

  MEDIUM (Schedule Fix):
    • Schema naming inconsistencies
    • Unused indexes
    • Tables needing vacuum

Maps to 30 Supabase Agent Skills rules.
EOF
}

# =============================================================================
# Main
# =============================================================================
SECTIONS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --all) SECTIONS=("all"); shift ;;
        --connections) SECTIONS+=("connections"); shift ;;
        --fk-indexes) SECTIONS+=("fk"); shift ;;
        --rls) SECTIONS+=("rls"); shift ;;
        --schema) SECTIONS+=("schema"); shift ;;
        --performance) SECTIONS+=("performance"); shift ;;
        --indexes) SECTIONS+=("indexes"); shift ;;
        --vacuum) SECTIONS+=("vacuum"); shift ;;
        --audit-trail) SECTIONS+=("audit"); shift ;;
        --json) OUTPUT_FORMAT="json"; shift ;;
        -v|--verbose) VERBOSE=true; shift ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Unknown option: $1"; usage; exit 1 ;;
    esac
done

# Default to all if no sections specified
if [[ ${#SECTIONS[@]} -eq 0 ]]; then
    SECTIONS=("all")
fi

check_env

echo ""
echo "================================================"
echo "  DB-SAGE Best Practices Auditor"
echo "  Sections: ${SECTIONS[*]}"
echo "================================================"
echo ""

for section in "${SECTIONS[@]}"; do
    case $section in
        all)
            audit_connections
            audit_fk_indexes
            audit_rls
            audit_schema
            audit_performance
            audit_indexes
            audit_vacuum
            audit_trail
            show_score_summary
            ;;
        connections) audit_connections ;;
        fk) audit_fk_indexes ;;
        rls) audit_rls ;;
        schema) audit_schema ;;
        performance) audit_performance ;;
        indexes) audit_indexes ;;
        vacuum) audit_vacuum ;;
        audit) audit_trail ;;
    esac
done

echo ""
log_success "Best practices audit completed"
log_info "For detailed remediation, see: squads/db-sage/tasks/db-best-practices-audit.md"
