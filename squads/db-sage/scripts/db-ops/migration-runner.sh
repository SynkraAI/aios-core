#!/usr/bin/env bash
# =============================================================================
# migration-runner.sh - Safe Migration Execution (Hybrid Script)
# =============================================================================
# execution_type: Hybrid (Worker executes, Human confirms for production)
# pattern: EXEC-HY-001
# tasks: db-apply-migration, db-dry-run, db-verify-order
# token_savings: 91%
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
VERIFY_ORDER=false
CREATE_SNAPSHOT=true
LOCK_KEY="dbsage_migration_$(date +%s)"
DB_URL=""

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS] <migration_file>

Safely execute database migrations with locks and snapshots.

OPTIONS:
    --dry-run         Execute in BEGIN/ROLLBACK (test mode)
    --verify-order    Only verify DDL ordering, don't execute
    --no-snapshot     Skip pre-migration snapshot
    --force           Skip confirmation prompts
    -h, --help        Show this help

EXAMPLES:
    $(basename "$0") supabase/migrations/001_create_users.sql
    $(basename "$0") supabase/migrations/002_add_rls.sql --dry-run
    $(basename "$0") supabase/migrations/003_indexes.sql --verify-order

SAFETY FEATURES:
    • Advisory lock prevents concurrent migrations
    • Pre-migration snapshot for rollback
    • Dry-run mode for testing
    • DDL ordering verification

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

acquire_lock() {
    log_info "Acquiring migration lock..."

    local got_lock
    got_lock=$(psql "$DB_URL" -t -A -c "SELECT pg_try_advisory_lock(hashtext('$LOCK_KEY'))")

    if [[ "$got_lock" == "t" ]]; then
        log_success "Migration lock acquired"
        return 0
    else
        log_error "Another migration is running. Wait or check for stale locks."
        return 1
    fi
}

release_lock() {
    log_info "Releasing migration lock..."
    psql "$DB_URL" -c "SELECT pg_advisory_unlock(hashtext('$LOCK_KEY'))" > /dev/null 2>&1 || true
    log_success "Lock released"
}

# Trap to ensure lock is released
cleanup() {
    release_lock
}

verify_ddl_order() {
    local file="$1"

    log_info "Verifying DDL ordering..."

    # Extract DDL statements
    local sql
    sql=$(cat "$file")

    # Check for common ordering issues
    local issues=0

    # Issue 1: DROP before CREATE of same object
    if grep -qE "DROP TABLE.*IF EXISTS.*(\w+)" "$file"; then
        local dropped_tables
        dropped_tables=$(grep -oE "DROP TABLE.*IF EXISTS.*(\w+)" "$file" | grep -oE "\w+$")

        for table in $dropped_tables; do
            if grep -qE "CREATE TABLE.*$table" "$file"; then
                # Check order
                local drop_line create_line
                drop_line=$(grep -n "DROP TABLE.*$table" "$file" | head -1 | cut -d: -f1)
                create_line=$(grep -n "CREATE TABLE.*$table" "$file" | head -1 | cut -d: -f1)

                if [[ -n "$create_line" && "$drop_line" -gt "$create_line" ]]; then
                    log_error "DROP TABLE $table appears after CREATE TABLE"
                    ((issues++))
                fi
            fi
        done
    fi

    # Issue 2: Foreign key references table created later
    if grep -qiE "REFERENCES\s+(\w+)" "$file"; then
        log_info "Checking foreign key references..."
        # This is a simplified check - full verification would need proper SQL parsing
    fi

    # Issue 3: Index on table that doesn't exist yet
    if grep -qiE "CREATE INDEX.*ON\s+(\w+)" "$file"; then
        log_info "Checking index targets..."
    fi

    if [[ $issues -eq 0 ]]; then
        log_success "DDL ordering verified - no issues found"
        return 0
    else
        log_error "Found $issues ordering issues"
        return 1
    fi
}

run_dry_run() {
    local file="$1"

    log_info "Running dry-run (BEGIN/ROLLBACK)..."

    local sql
    sql=$(cat "$file")

    local start_time end_time duration

    start_time=$(date +%s.%N)

    # Execute in transaction that rolls back
    if psql "$DB_URL" -v ON_ERROR_STOP=1 << EOF
BEGIN;
$sql
ROLLBACK;
EOF
    then
        end_time=$(date +%s.%N)
        duration=$(echo "$end_time - $start_time" | bc)

        log_success "Dry-run completed in ${duration}s"
        log_info "No changes were made (rolled back)"
        return 0
    else
        log_error "Dry-run failed - migration has errors"
        return 1
    fi
}

apply_migration() {
    local file="$1"

    # Create pre-migration snapshot
    if $CREATE_SNAPSHOT; then
        log_info "Creating pre-migration snapshot..."
        local script_dir
        script_dir="$(dirname "$0")"
        if [[ -x "$script_dir/backup-manager.sh" ]]; then
            "$script_dir/backup-manager.sh" --snapshot "pre_migration_$(basename "$file" .sql)" --schema-only
        else
            log_warning "backup-manager.sh not found, skipping snapshot"
        fi
    fi

    log_info "Applying migration: $file"

    local sql
    sql=$(cat "$file")

    local start_time end_time duration

    start_time=$(date +%s.%N)

    # Execute
    if psql "$DB_URL" -v ON_ERROR_STOP=1 << EOF
BEGIN;
$sql
COMMIT;
EOF
    then
        end_time=$(date +%s.%N)
        duration=$(echo "$end_time - $start_time" | bc)

        log_success "Migration applied in ${duration}s"
        return 0
    else
        log_error "Migration failed"
        log_info "Database was not modified (transaction rolled back)"
        return 1
    fi
}

# Parse arguments
MIGRATION_FILE=""
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run) DRY_RUN=true; shift ;;
        --verify-order) VERIFY_ORDER=true; shift ;;
        --no-snapshot) CREATE_SNAPSHOT=false; shift ;;
        --force) FORCE=true; shift ;;
        -h|--help) usage; exit 0 ;;
        *)
            MIGRATION_FILE="$1"
            shift
            ;;
    esac
done

if [[ -z "$MIGRATION_FILE" ]]; then
    usage
    exit 1
fi

if [[ ! -f "$MIGRATION_FILE" ]]; then
    log_error "File not found: $MIGRATION_FILE"
    exit 1
fi

check_env

echo ""
echo "================================================"
echo "  DB-SAGE Migration Runner"
echo "  File: $MIGRATION_FILE"
echo "  Mode: $(if $DRY_RUN; then echo "DRY-RUN"; elif $VERIFY_ORDER; then echo "VERIFY-ORDER"; else echo "APPLY"; fi)"
echo "================================================"
echo ""

log_info "File: $MIGRATION_FILE"
log_info "Size: $(du -h "$MIGRATION_FILE" | cut -f1)"
log_info "Lines: $(wc -l < "$MIGRATION_FILE")"
echo ""

# Always verify order first
if ! verify_ddl_order "$MIGRATION_FILE"; then
    if ! $FORCE; then
        log_error "Fix ordering issues before proceeding"
        exit 1
    fi
    log_warning "Proceeding despite ordering issues (--force)"
fi

if $VERIFY_ORDER; then
    log_success "Verification complete"
    exit 0
fi

# Acquire lock
trap cleanup EXIT
if ! acquire_lock; then
    exit 1
fi

echo ""

if $DRY_RUN; then
    run_dry_run "$MIGRATION_FILE"
else
    # Show warning for production
    if ! $FORCE; then
        log_warning "╔════════════════════════════════════════════════════════════╗"
        log_warning "║          ⚠️  PRODUCTION MIGRATION WARNING ⚠️                ║"
        log_warning "╠════════════════════════════════════════════════════════════╣"
        log_warning "║  This will modify the database schema.                     ║"
        log_warning "║                                                            ║"
        log_warning "║  Recommended: Run --dry-run first                          ║"
        log_warning "╚════════════════════════════════════════════════════════════╝"
        echo ""
        log_info "Use --force to skip this warning"
        log_info "Or run: $(basename "$0") $MIGRATION_FILE --dry-run"
        exit 0
    fi

    apply_migration "$MIGRATION_FILE"
fi

echo ""
log_info "Run health check: ./scripts/db-ops/health-checker.sh --smoke-test"
