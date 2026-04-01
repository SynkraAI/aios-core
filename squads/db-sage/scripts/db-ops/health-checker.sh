#!/usr/bin/env bash
# =============================================================================
# health-checker.sh - Database Health Check (Worker Script)
# =============================================================================
# execution_type: Worker
# pattern: EXEC-W-001
# tasks: db-env-check, db-smoke-test, schema-audit
# token_savings: 95%
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Defaults
MODE="quick"
VERBOSE=false
DB_URL=""

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Database health checker for Supabase/PostgreSQL.

OPTIONS:
    --quick          Quick health check (default)
    --full           Full health check with all metrics
    --smoke-test     Post-migration smoke tests
    --schema-audit   Schema quality audit
    --security-audit Security-focused audit
    -v, --verbose    Verbose output
    -h, --help       Show this help

EXAMPLES:
    $(basename "$0") --quick
    $(basename "$0") --smoke-test
    $(basename "$0") --schema-audit --verbose

ENVIRONMENT:
    SUPABASE_DB_URL or DATABASE_URL  Required. PostgreSQL connection string.
EOF
}

log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

check_env() {
    DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
    if [[ -z "$DB_URL" ]]; then
        log_error "SUPABASE_DB_URL or DATABASE_URL not set"
        exit 1
    fi
    if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
        log_success "SUPABASE_DB_URL present (redacted)"
    else
        log_success "DATABASE_URL present (redacted)"
    fi
}

check_connection() {
    log_info "Testing database connection..."
    if psql "$DB_URL" -c "SELECT 1" > /dev/null 2>&1; then
        log_success "Database connection OK"
        return 0
    else
        log_error "Database connection FAILED"
        return 1
    fi
}

check_ssl() {
    log_info "Checking SSL configuration..."
    if echo "$DB_URL" | grep -q "sslmode="; then
        log_success "SSL mode configured"
    else
        log_warning "Consider adding sslmode=require"
    fi
}

check_pooler() {
    log_info "Checking connection pooler..."
    if echo "$DB_URL" | grep -q "pooler"; then
        log_success "Using connection pooler"
    else
        log_warning "Consider using pooler host for better performance"
    fi
}

check_client_tools() {
    log_info "Checking PostgreSQL client tools..."
    local tools_ok=true

    if command -v psql &> /dev/null; then
        log_success "psql: $(psql --version | head -1)"
    else
        log_error "psql not found"
        tools_ok=false
    fi

    if command -v pg_dump &> /dev/null; then
        log_success "pg_dump: $(pg_dump --version | head -1)"
    else
        log_error "pg_dump not found"
        tools_ok=false
    fi

    $tools_ok
}

get_db_stats() {
    log_info "Collecting database statistics..."

    psql "$DB_URL" -t -A << 'SQL'
SELECT json_build_object(
    'version', version(),
    'database_size', pg_size_pretty(pg_database_size(current_database())),
    'table_count', (SELECT count(*) FROM pg_tables WHERE schemaname = 'public'),
    'index_count', (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public'),
    'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')
);
SQL
}

run_smoke_tests() {
    log_info "Running smoke tests..."

    # Test 1: Tables exist
    local table_count
    table_count=$(psql "$DB_URL" -t -A -c "SELECT count(*) FROM pg_tables WHERE schemaname = 'public'")
    if [[ "$table_count" -gt 0 ]]; then
        log_success "Tables exist: $table_count tables in public schema"
    else
        log_warning "No tables in public schema"
    fi

    # Test 2: RLS enabled
    local rls_enabled
    rls_enabled=$(psql "$DB_URL" -t -A -c "SELECT count(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true")
    log_info "Tables with RLS enabled: $rls_enabled"

    # Test 3: No pending migrations (if using supabase)
    if [[ -d "supabase/migrations" ]]; then
        local migration_count
        migration_count=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l || echo "0")
        log_info "Local migrations: $migration_count files"
    fi

    # Test 4: Connection pool health
    local idle_connections
    idle_connections=$(psql "$DB_URL" -t -A -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'idle'")
    if [[ "$idle_connections" -lt 50 ]]; then
        log_success "Connection pool healthy: $idle_connections idle connections"
    else
        log_warning "High idle connections: $idle_connections (consider reviewing)"
    fi

    log_success "Smoke tests completed"
}

run_schema_audit() {
    log_info "Running schema audit..."

    psql "$DB_URL" << 'SQL'
\echo ''
\echo '=== SCHEMA AUDIT REPORT ==='
\echo ''

-- Tables without primary key
\echo '--- Tables without PRIMARY KEY ---'
SELECT tablename
FROM pg_tables t
WHERE schemaname = 'public'
AND NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    WHERE c.conrelid = (schemaname || '.' || tablename)::regclass
    AND c.contype = 'p'
);

-- Tables without RLS
\echo ''
\echo '--- Tables without RLS ---'
SELECT tablename,
    CASE WHEN rowsecurity THEN '✓ Enabled' ELSE '✗ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY rowsecurity, tablename;

-- Columns without NOT NULL that probably should have it
\echo ''
\echo '--- Nullable columns (potential issues) ---'
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND is_nullable = 'YES'
AND column_name IN ('id', 'created_at', 'updated_at', 'user_id')
ORDER BY table_name, column_name;

-- Indexes
\echo ''
\echo '--- Index coverage ---'
SELECT
    t.tablename,
    count(i.indexname) as index_count
FROM pg_tables t
LEFT JOIN pg_indexes i ON t.tablename = i.tablename AND t.schemaname = i.schemaname
WHERE t.schemaname = 'public'
GROUP BY t.tablename
ORDER BY index_count, t.tablename;

\echo ''
\echo '=== END OF AUDIT ==='
SQL

    log_success "Schema audit completed"
}

run_security_audit() {
    log_info "Running security audit..."

    psql "$DB_URL" << 'SQL'
\echo ''
\echo '=== SECURITY AUDIT REPORT ==='
\echo ''

-- RLS policies
\echo '--- RLS Policies by Table ---'
SELECT
    schemaname || '.' || tablename as table_name,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Public functions
\echo ''
\echo '--- Public Functions (review for security) ---'
SELECT
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Grants on public schema
\echo ''
\echo '--- Grants on public schema ---'
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
GROUP BY grantee, privilege_type
ORDER BY grantee;

\echo ''
\echo '=== END OF SECURITY AUDIT ==='
SQL

    log_success "Security audit completed"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --quick) MODE="quick"; shift ;;
        --full) MODE="full"; shift ;;
        --smoke-test) MODE="smoke"; shift ;;
        --schema-audit) MODE="schema"; shift ;;
        --security-audit) MODE="security"; shift ;;
        -v|--verbose) VERBOSE=true; shift ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Unknown option: $1"; usage; exit 1 ;;
    esac
done

# Main execution
echo ""
echo "================================================"
echo "  DB-SAGE Health Checker"
echo "  Mode: $MODE"
echo "================================================"
echo ""

check_env
check_client_tools
check_connection || exit 1

case $MODE in
    quick)
        check_ssl
        check_pooler
        get_db_stats
        ;;
    full)
        check_ssl
        check_pooler
        get_db_stats
        run_smoke_tests
        run_schema_audit
        ;;
    smoke)
        run_smoke_tests
        ;;
    schema)
        run_schema_audit
        ;;
    security)
        run_security_audit
        ;;
esac

echo ""
log_success "Health check completed"
