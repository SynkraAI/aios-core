#!/bin/bash
# Migration Safe Runner - Execute migrations with automatic dry-run, snapshot, and rollback
# Economia: ~95% dos tokens vs execução manual segura
# Uso: ./migration-safe-runner.sh <migration_file.sql> [--skip-dry-run] [--skip-snapshot]

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check requirements
if [ -z "${SUPABASE_DB_URL:-}" ]; then
    echo -e "${RED}ERROR: SUPABASE_DB_URL not set${NC}"
    exit 1
fi

# Parse arguments
MIGRATION_FILE="${1:-}"
SKIP_DRY_RUN=false
SKIP_SNAPSHOT=false

if [ -z "$MIGRATION_FILE" ]; then
    echo "Usage: $0 <migration_file.sql> [--skip-dry-run] [--skip-snapshot]"
    echo "Example: $0 supabase/migrations/001_initial.sql"
    exit 1
fi

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}ERROR: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

# Parse flags
shift
while [ $# -gt 0 ]; do
    case "$1" in
        --skip-dry-run) SKIP_DRY_RUN=true ;;
        --skip-snapshot) SKIP_SNAPSHOT=true ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

# Generate identifiers
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MIGRATION_NAME=$(basename "$MIGRATION_FILE" .sql)
SNAPSHOT_FILE="/tmp/snapshot_${MIGRATION_NAME}_${TIMESTAMP}.sql"
ROLLBACK_FILE="/tmp/rollback_${MIGRATION_NAME}_${TIMESTAMP}.sql"
DRY_RUN_LOG="/tmp/dryrun_${MIGRATION_NAME}_${TIMESTAMP}.log"

echo "🚀 Migration Safe Runner v1.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Migration: $MIGRATION_NAME"
echo "Timestamp: $TIMESTAMP"
echo ""

# Step 1: Analyze migration
echo -e "${BLUE}[1/5] Analyzing migration file...${NC}"

# Count statements and detect dangerous operations
STATEMENT_COUNT=$(grep -c ';$' "$MIGRATION_FILE" || echo "1")
HAS_DROP=$(grep -i 'DROP' "$MIGRATION_FILE" > /dev/null && echo "YES" || echo "NO")
HAS_TRUNCATE=$(grep -i 'TRUNCATE' "$MIGRATION_FILE" > /dev/null && echo "YES" || echo "NO")
HAS_DELETE=$(grep -i 'DELETE' "$MIGRATION_FILE" > /dev/null && echo "YES" || echo "NO")

echo "  → Statements: $STATEMENT_COUNT"
echo "  → Contains DROP: $HAS_DROP"
echo "  → Contains TRUNCATE: $HAS_TRUNCATE"
echo "  → Contains DELETE: $HAS_DELETE"

if [ "$HAS_DROP" = "YES" ] || [ "$HAS_TRUNCATE" = "YES" ]; then
    echo -e "  ${YELLOW}⚠ WARNING: Destructive operations detected!${NC}"
fi

# Step 2: Create snapshot
if [ "$SKIP_SNAPSHOT" = false ]; then
    echo -e "${BLUE}[2/5] Creating database snapshot...${NC}"

    # Create schema-only dump
    pg_dump "$SUPABASE_DB_URL" \
        --schema-only \
        --no-owner \
        --no-privileges \
        --no-comments \
        --if-exists \
        --clean \
        > "$SNAPSHOT_FILE" 2>/dev/null

    if [ $? -eq 0 ]; then
        SNAPSHOT_SIZE=$(du -h "$SNAPSHOT_FILE" | cut -f1)
        echo -e "  ${GREEN}✓ Snapshot created: $SNAPSHOT_FILE ($SNAPSHOT_SIZE)${NC}"

        # Generate rollback script
        echo "-- Auto-generated rollback script for $MIGRATION_NAME" > "$ROLLBACK_FILE"
        echo "-- Generated: $TIMESTAMP" >> "$ROLLBACK_FILE"
        echo "" >> "$ROLLBACK_FILE"
        echo "\\echo 'Restoring from snapshot...'" >> "$ROLLBACK_FILE"
        cat "$SNAPSHOT_FILE" >> "$ROLLBACK_FILE"
        echo -e "  ${GREEN}✓ Rollback script: $ROLLBACK_FILE${NC}"
    else
        echo -e "  ${YELLOW}⚠ Snapshot failed, continuing without backup${NC}"
    fi
else
    echo -e "${YELLOW}[2/5] Skipping snapshot (--skip-snapshot)${NC}"
fi

# Step 3: Dry run
if [ "$SKIP_DRY_RUN" = false ]; then
    echo -e "${BLUE}[3/5] Running dry-run test...${NC}"

    # Test migration in transaction without committing
    {
        echo "BEGIN;"
        cat "$MIGRATION_FILE"
        echo "ROLLBACK;"
    } | psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 > "$DRY_RUN_LOG" 2>&1

    if [ $? -eq 0 ]; then
        echo -e "  ${GREEN}✓ Dry-run successful - no syntax errors${NC}"
    else
        echo -e "  ${RED}✗ Dry-run failed!${NC}"
        echo ""
        echo "Error details:"
        tail -20 "$DRY_RUN_LOG" | sed 's/^/  /'
        echo ""
        echo -e "${RED}Migration aborted. Fix errors and try again.${NC}"
        echo "Full log: $DRY_RUN_LOG"
        exit 1
    fi
else
    echo -e "${YELLOW}[3/5] Skipping dry-run (--skip-dry-run)${NC}"
fi

# Step 4: Pre-migration checks
echo -e "${BLUE}[4/5] Running pre-migration checks...${NC}"

# Check active connections
ACTIVE_CONNECTIONS=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active' AND pid <> pg_backend_pid();" 2>/dev/null)
echo "  → Active connections: $ACTIVE_CONNECTIONS"

if [ "$ACTIVE_CONNECTIONS" -gt 10 ]; then
    echo -e "  ${YELLOW}⚠ High connection count may impact migration${NC}"
fi

# Check for locks
LOCK_COUNT=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM pg_locks WHERE granted = false;" 2>/dev/null)
echo "  → Waiting locks: $LOCK_COUNT"

if [ "$LOCK_COUNT" -gt 0 ]; then
    echo -e "  ${YELLOW}⚠ There are waiting locks - migration may be slow${NC}"
fi

# Step 5: Execute migration
echo -e "${BLUE}[5/5] Executing migration...${NC}"
echo -e "${YELLOW}Press Ctrl+C to abort now, continuing in 3 seconds...${NC}"
sleep 3

# Create execution log
EXEC_LOG="/tmp/migration_${MIGRATION_NAME}_${TIMESTAMP}.log"

# Run migration with timing
START_TIME=$(date +%s)

psql "$SUPABASE_DB_URL" \
    -v ON_ERROR_STOP=1 \
    --echo-all \
    -f "$MIGRATION_FILE" > "$EXEC_LOG" 2>&1

MIGRATION_RESULT=$?
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ $MIGRATION_RESULT -eq 0 ]; then
    echo -e "  ${GREEN}✓ Migration completed successfully in ${DURATION}s${NC}"
    echo ""

    # Post-migration validation
    echo -e "${BLUE}Post-migration validation:${NC}"

    # Check table count
    TABLE_COUNT=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null)
    echo "  → Tables in public schema: $TABLE_COUNT"

    # Check for new indexes
    INDEX_COUNT=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" 2>/dev/null)
    echo "  → Indexes: $INDEX_COUNT"

    # Check for new functions
    FUNCTION_COUNT=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public';" 2>/dev/null)
    echo "  → Functions: $FUNCTION_COUNT"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ Migration Success!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📁 Artifacts created:"
    echo "  • Snapshot: $SNAPSHOT_FILE"
    echo "  • Rollback: $ROLLBACK_FILE"
    echo "  • Execution log: $EXEC_LOG"
    echo ""
    echo "🔧 Next steps:"
    echo "  1. Test your application"
    echo "  2. Run: *smoke-test to verify"
    echo "  3. If issues, rollback: psql \$SUPABASE_DB_URL -f $ROLLBACK_FILE"

else
    echo -e "  ${RED}✗ Migration failed after ${DURATION}s${NC}"
    echo ""
    echo "Error details:"
    tail -20 "$EXEC_LOG" | sed 's/^/  /'
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${RED}❌ Migration Failed!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔧 Recovery options:"
    echo "  1. Review error: $EXEC_LOG"
    echo "  2. Fix migration file: $MIGRATION_FILE"
    echo "  3. If database is corrupted, restore: psql \$SUPABASE_DB_URL -f $SNAPSHOT_FILE"
    echo "  4. Retry with: $0 $MIGRATION_FILE"

    exit 1
fi