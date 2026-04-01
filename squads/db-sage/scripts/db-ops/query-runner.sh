#!/usr/bin/env bash
# =============================================================================
# query-runner.sh - Safe SQL Execution (Worker Script)
# =============================================================================
# execution_type: Worker
# pattern: EXEC-W-001
# tasks: db-run-sql
# token_savings: 85%
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Defaults
DRY_RUN=false
TIMEOUT=30
TRANSACTION=true
DB_URL=""

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS] <sql_file_or_statement>

Execute SQL safely with transaction support and timing.

OPTIONS:
    --file <path>     Execute SQL file
    --sql <statement> Execute inline SQL
    --dry-run         Rollback after execution (test mode)
    --no-transaction  Execute without transaction wrapper
    --timeout <sec>   Statement timeout in seconds (default: 30)
    -v, --verbose     Verbose output
    -h, --help        Show this help

EXAMPLES:
    $(basename "$0") --file migrations/001_create_users.sql
    $(basename "$0") --sql "SELECT * FROM users LIMIT 10"
    $(basename "$0") --file script.sql --dry-run
    $(basename "$0") --sql "UPDATE users SET active=true" --timeout 60

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
}

execute_sql() {
    local sql="$1"
    local start_time end_time duration

    # Build psql options
    local psql_opts="-v ON_ERROR_STOP=1"

    if $TRANSACTION; then
        if $DRY_RUN; then
            log_info "Mode: DRY-RUN (will rollback)"
            sql="BEGIN; $sql; ROLLBACK;"
        else
            sql="BEGIN; $sql; COMMIT;"
        fi
    fi

    # Set timeout
    sql="SET statement_timeout = '${TIMEOUT}s'; $sql"

    log_info "Executing SQL..."
    echo ""

    start_time=$(date +%s.%N)

    # Execute
    if echo "$sql" | psql "$DB_URL" $psql_opts; then
        end_time=$(date +%s.%N)
        duration=$(echo "$end_time - $start_time" | bc)

        echo ""
        log_success "Execution completed in ${duration}s"

        if $DRY_RUN; then
            log_warning "DRY-RUN: Changes were rolled back"
        fi
    else
        log_error "Execution failed"
        exit 1
    fi
}

execute_file() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        log_error "File not found: $file"
        exit 1
    fi

    log_info "File: $file"
    log_info "Size: $(du -h "$file" | cut -f1)"
    log_info "Lines: $(wc -l < "$file")"

    local sql
    sql=$(cat "$file")

    execute_sql "$sql"
}

# Parse arguments
SQL_FILE=""
SQL_INLINE=""
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --file) SQL_FILE="$2"; shift 2 ;;
        --sql) SQL_INLINE="$2"; shift 2 ;;
        --dry-run) DRY_RUN=true; shift ;;
        --no-transaction) TRANSACTION=false; shift ;;
        --timeout) TIMEOUT="$2"; shift 2 ;;
        -v|--verbose) VERBOSE=true; shift ;;
        -h|--help) usage; exit 0 ;;
        *)
            # Assume it's a file or SQL
            if [[ -f "$1" ]]; then
                SQL_FILE="$1"
            else
                SQL_INLINE="$1"
            fi
            shift
            ;;
    esac
done

if [[ -z "$SQL_FILE" && -z "$SQL_INLINE" ]]; then
    usage
    exit 1
fi

check_env

echo ""
echo "================================================"
echo "  DB-SAGE Query Runner"
echo "  Timeout: ${TIMEOUT}s"
echo "  Transaction: $TRANSACTION"
echo "  Dry-run: $DRY_RUN"
echo "================================================"
echo ""

if [[ -n "$SQL_FILE" ]]; then
    execute_file "$SQL_FILE"
elif [[ -n "$SQL_INLINE" ]]; then
    log_info "Inline SQL: ${SQL_INLINE:0:100}..."
    execute_sql "$SQL_INLINE"
fi
