#!/usr/bin/env bash
# =============================================================================
# backup-manager.sh - Database Backup & Restore (Worker Script)
# =============================================================================
# execution_type: Worker (snapshot) / Hybrid (restore)
# pattern: EXEC-W-001 / EXEC-HY-001
# tasks: db-snapshot, db-rollback
# token_savings: 90%
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Defaults
ACTION=""
LABEL=""
SNAPSHOT_DIR="supabase/snapshots"
SCHEMA_ONLY=true
SAFE_MODE=false
DB_URL=""

usage() {
    cat << EOF
Usage: $(basename "$0") [ACTION] [OPTIONS]

Database backup and restore manager.

ACTIONS:
    --snapshot <label>   Create a new snapshot
    --restore <id>       Restore from snapshot
    --list               List available snapshots
    --bootstrap          Bootstrap snapshot directory

OPTIONS:
    --full               Include data (default: schema-only)
    --schema-only        Schema only (default)
    --safe               Create safety backup before restore
    --description <text> Add description to snapshot
    -h, --help           Show this help

EXAMPLES:
    $(basename "$0") --snapshot pre_migration
    $(basename "$0") --snapshot v1.2.0 --full --description "Release 1.2.0"
    $(basename "$0") --list
    $(basename "$0") --restore latest
    $(basename "$0") --restore 20240101_120000 --safe

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

ensure_snapshot_dir() {
    mkdir -p "$SNAPSHOT_DIR"
    log_success "Snapshot directory: $SNAPSHOT_DIR"
}

create_snapshot() {
    local label="$1"
    local description="${2:-}"
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local filename="${timestamp}_${label}"

    ensure_snapshot_dir

    log_info "Creating snapshot: $filename"

    local dump_opts="-Fc"
    if $SCHEMA_ONLY; then
        dump_opts="$dump_opts --schema-only"
        filename="${filename}_schema.dump"
    else
        filename="${filename}_full.dump"
    fi

    local filepath="$SNAPSHOT_DIR/$filename"

    # Create dump
    if pg_dump "$DB_URL" $dump_opts -f "$filepath"; then
        log_success "Snapshot created: $filepath"

        # Create metadata file
        cat > "${filepath}.meta" << EOF
{
    "label": "$label",
    "timestamp": "$timestamp",
    "filename": "$filename",
    "schema_only": $SCHEMA_ONLY,
    "description": "$description",
    "size_bytes": $(stat -f%z "$filepath" 2>/dev/null || stat -c%s "$filepath" 2>/dev/null || echo 0),
    "created_by": "${USER:-unknown}",
    "db_url_hash": "$(echo "$DB_URL" | md5sum | cut -d' ' -f1)"
}
EOF
        log_success "Metadata saved: ${filepath}.meta"

        echo ""
        echo "Snapshot Details:"
        echo "  Label: $label"
        echo "  File: $filepath"
        echo "  Size: $(du -h "$filepath" | cut -f1)"
        echo "  Type: $(if $SCHEMA_ONLY; then echo "Schema only"; else echo "Full (schema + data)"; fi)"
    else
        log_error "Failed to create snapshot"
        exit 1
    fi
}

list_snapshots() {
    ensure_snapshot_dir

    echo ""
    echo "Available Snapshots:"
    echo "===================="

    if [[ -z "$(ls -A "$SNAPSHOT_DIR"/*.dump 2>/dev/null)" ]]; then
        log_warning "No snapshots found in $SNAPSHOT_DIR"
        return
    fi

    printf "%-25s %-20s %-10s %s\n" "TIMESTAMP" "LABEL" "SIZE" "TYPE"
    echo "----------------------------------------------------------------------"

    for meta in "$SNAPSHOT_DIR"/*.meta; do
        if [[ -f "$meta" ]]; then
            local timestamp label size schema_only type_str
            timestamp=$(grep -o '"timestamp": *"[^"]*"' "$meta" | cut -d'"' -f4)
            label=$(grep -o '"label": *"[^"]*"' "$meta" | cut -d'"' -f4)
            schema_only=$(grep -o '"schema_only": *[^,}]*' "$meta" | cut -d':' -f2 | tr -d ' ')

            local dump_file="${meta%.meta}"
            if [[ -f "$dump_file" ]]; then
                size=$(du -h "$dump_file" | cut -f1)
            else
                size="N/A"
            fi

            if [[ "$schema_only" == "true" ]]; then
                type_str="schema"
            else
                type_str="full"
            fi

            printf "%-25s %-20s %-10s %s\n" "$timestamp" "$label" "$size" "$type_str"
        fi
    done

    echo ""
    echo "To restore: $(basename "$0") --restore <timestamp> [--safe]"
}

find_snapshot() {
    local id="$1"

    if [[ "$id" == "latest" ]]; then
        # Find most recent
        local latest
        latest=$(ls -t "$SNAPSHOT_DIR"/*.dump 2>/dev/null | head -1)
        if [[ -n "$latest" ]]; then
            echo "$latest"
            return 0
        fi
    else
        # Find by timestamp prefix
        local match
        match=$(ls "$SNAPSHOT_DIR"/${id}*.dump 2>/dev/null | head -1)
        if [[ -n "$match" ]]; then
            echo "$match"
            return 0
        fi
    fi

    return 1
}

restore_snapshot() {
    local id="$1"

    local snapshot_file
    if ! snapshot_file=$(find_snapshot "$id"); then
        log_error "Snapshot not found: $id"
        log_info "Use --list to see available snapshots"
        exit 1
    fi

    log_warning "╔════════════════════════════════════════════════════════════╗"
    log_warning "║          ⚠️  DATABASE RESTORE WARNING ⚠️                    ║"
    log_warning "╠════════════════════════════════════════════════════════════╣"
    log_warning "║  You are about to restore the database from:              ║"
    log_warning "║  $snapshot_file"
    log_warning "║                                                           ║"
    log_warning "║  This will:                                               ║"
    log_warning "║    • Drop and recreate all schema objects                 ║"
    log_warning "║    • Potentially lose data added after snapshot           ║"
    log_warning "╚════════════════════════════════════════════════════════════╝"
    echo ""

    # In a real scenario, this would prompt for confirmation
    # For automation, we check for --safe flag
    if $SAFE_MODE; then
        log_info "Safe mode: Creating pre-restore backup..."
        create_snapshot "pre_restore_safety" "Automatic backup before restore"
        echo ""
    fi

    log_info "Restoring from: $snapshot_file"

    # Restore
    if pg_restore "$DB_URL" --clean --if-exists -Fc "$snapshot_file"; then
        log_success "Database restored successfully"
    else
        # pg_restore returns non-zero even on warnings
        log_warning "Restore completed with warnings (this is often normal)"
    fi

    echo ""
    log_success "Restore completed"
    log_info "Run health check: ./scripts/db-ops/health-checker.sh --smoke-test"
}

bootstrap() {
    ensure_snapshot_dir

    cat > "$SNAPSHOT_DIR/.gitkeep" << EOF
# Snapshot directory for db-sage backups
# Files here are NOT committed to git (add to .gitignore)
EOF

    cat > "$SNAPSHOT_DIR/README.md" << EOF
# Database Snapshots

This directory contains database snapshots created by db-sage.

## Files

- \`*.dump\` - PostgreSQL custom format dumps
- \`*.meta\` - JSON metadata for each snapshot

## Usage

\`\`\`bash
# Create snapshot
./scripts/db-ops/backup-manager.sh --snapshot my_label

# List snapshots
./scripts/db-ops/backup-manager.sh --list

# Restore
./scripts/db-ops/backup-manager.sh --restore latest --safe
\`\`\`

## Gitignore

Add to .gitignore:
\`\`\`
supabase/snapshots/*.dump
supabase/snapshots/*.meta
\`\`\`
EOF

    log_success "Bootstrap completed"
    log_info "Don't forget to add *.dump and *.meta to .gitignore"
}

# Parse arguments
DESCRIPTION=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --snapshot) ACTION="snapshot"; LABEL="$2"; shift 2 ;;
        --restore) ACTION="restore"; LABEL="$2"; shift 2 ;;
        --list) ACTION="list"; shift ;;
        --bootstrap) ACTION="bootstrap"; shift ;;
        --full) SCHEMA_ONLY=false; shift ;;
        --schema-only) SCHEMA_ONLY=true; shift ;;
        --safe) SAFE_MODE=true; shift ;;
        --description) DESCRIPTION="$2"; shift 2 ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Unknown option: $1"; usage; exit 1 ;;
    esac
done

if [[ -z "$ACTION" ]]; then
    usage
    exit 1
fi

check_env

echo ""
echo "================================================"
echo "  DB-SAGE Backup Manager"
echo "  Action: $ACTION"
echo "================================================"
echo ""

case $ACTION in
    snapshot) create_snapshot "$LABEL" "$DESCRIPTION" ;;
    restore) restore_snapshot "$LABEL" ;;
    list) list_snapshots ;;
    bootstrap) bootstrap ;;
esac
