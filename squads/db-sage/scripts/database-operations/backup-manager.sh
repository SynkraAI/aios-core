#!/bin/bash
# Backup Manager - Intelligent backup and restore for PostgreSQL/Supabase
# Economia: ~85% dos tokens vs backup manual
# Uso: ./backup-manager.sh <action> [options]

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Config
BACKUP_DIR="${BACKUP_DIR:-/tmp/db_backups}"
MAX_BACKUPS="${MAX_BACKUPS:-10}"  # Keep last 10 backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Check requirements
if [ -z "${SUPABASE_DB_URL:-}" ]; then
    echo -e "${RED}ERROR: SUPABASE_DB_URL not set${NC}"
    exit 1
fi

# Parse arguments
ACTION="${1:-}"

if [ -z "$ACTION" ]; then
    echo "Usage: $0 <action> [options]"
    echo ""
    echo "Actions:"
    echo "  backup [name]        - Create backup (schema+data)"
    echo "  schema [name]        - Backup schema only"
    echo "  data [name]          - Backup data only"
    echo "  list                 - List available backups"
    echo "  restore <file>       - Restore from backup"
    echo "  compare <file>       - Compare backup with current DB"
    echo "  clean                - Remove old backups (keep last $MAX_BACKUPS)"
    echo "  schedule             - Show cron schedule example"
    echo ""
    echo "Examples:"
    echo "  $0 backup daily"
    echo "  $0 restore /tmp/db_backups/backup_20251104.sql"
    echo "  $0 schema pre-migration"
    exit 1
fi

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

echo "💾 Backup Manager v1.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backup Directory: $BACKUP_DIR"
echo ""

case "$ACTION" in
    "backup")
        NAME="${2:-backup}"
        BACKUP_FILE="$BACKUP_DIR/${NAME}_${TIMESTAMP}.sql"
        METADATA_FILE="$BACKUP_DIR/${NAME}_${TIMESTAMP}.json"

        echo -e "${BLUE}Creating full backup...${NC}"

        # Get database info
        DB_NAME=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT current_database();" 2>/dev/null)
        DB_SIZE=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null)
        TABLE_COUNT=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null)

        echo "  Database: $DB_NAME"
        echo "  Size: $DB_SIZE"
        echo "  Tables: $TABLE_COUNT"
        echo ""

        # Create backup with progress
        echo "  Backing up schema..."
        pg_dump "$SUPABASE_DB_URL" \
            --verbose \
            --no-owner \
            --no-privileges \
            --format=plain \
            --if-exists \
            --clean \
            --create \
            --file="$BACKUP_FILE" 2>&1 | while read line; do
                echo -n "."
            done

        echo ""
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

        # Compress backup
        echo "  Compressing..."
        gzip -9 "$BACKUP_FILE"
        BACKUP_FILE="${BACKUP_FILE}.gz"
        COMPRESSED_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

        # Save metadata
        cat > "$METADATA_FILE" << JSON
{
    "timestamp": "$TIMESTAMP",
    "type": "full",
    "database": "$DB_NAME",
    "original_size": "$DB_SIZE",
    "backup_size": "$BACKUP_SIZE",
    "compressed_size": "$COMPRESSED_SIZE",
    "table_count": $TABLE_COUNT,
    "file": "$BACKUP_FILE"
}
JSON

        echo ""
        echo -e "${GREEN}✓ Backup created successfully${NC}"
        echo "  File: $BACKUP_FILE"
        echo "  Size: $COMPRESSED_SIZE (compressed from $BACKUP_SIZE)"
        ;;

    "schema")
        NAME="${2:-schema}"
        BACKUP_FILE="$BACKUP_DIR/${NAME}_${TIMESTAMP}.sql"

        echo -e "${BLUE}Creating schema-only backup...${NC}"

        pg_dump "$SUPABASE_DB_URL" \
            --schema-only \
            --no-owner \
            --no-privileges \
            --if-exists \
            --clean \
            --file="$BACKUP_FILE"

        gzip -9 "$BACKUP_FILE"
        BACKUP_FILE="${BACKUP_FILE}.gz"
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

        echo -e "${GREEN}✓ Schema backup created${NC}"
        echo "  File: $BACKUP_FILE"
        echo "  Size: $SIZE"
        ;;

    "data")
        NAME="${2:-data}"
        BACKUP_FILE="$BACKUP_DIR/${NAME}_${TIMESTAMP}.sql"

        echo -e "${BLUE}Creating data-only backup...${NC}"

        pg_dump "$SUPABASE_DB_URL" \
            --data-only \
            --no-owner \
            --no-privileges \
            --disable-triggers \
            --file="$BACKUP_FILE"

        gzip -9 "$BACKUP_FILE"
        BACKUP_FILE="${BACKUP_FILE}.gz"
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

        echo -e "${GREEN}✓ Data backup created${NC}"
        echo "  File: $BACKUP_FILE"
        echo "  Size: $SIZE"
        ;;

    "list")
        echo -e "${CYAN}Available Backups${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        if [ -d "$BACKUP_DIR" ]; then
            # List backups with metadata
            for metadata in $(ls -1t "$BACKUP_DIR"/*.json 2>/dev/null | head -20); do
                if [ -f "$metadata" ]; then
                    TYPE=$(jq -r '.type' "$metadata" 2>/dev/null || echo "unknown")
                    SIZE=$(jq -r '.compressed_size' "$metadata" 2>/dev/null || echo "?")
                    TABLES=$(jq -r '.table_count' "$metadata" 2>/dev/null || echo "?")
                    FILE=$(jq -r '.file' "$metadata" 2>/dev/null || echo "?")

                    if [ -f "$FILE" ]; then
                        STATUS="${GREEN}✓${NC}"
                    else
                        STATUS="${RED}✗${NC}"
                    fi

                    echo -e "$STATUS $(basename "$FILE") [$TYPE, $SIZE, $TABLES tables]"
                fi
            done

            # Summary
            echo ""
            TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
            BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.gz 2>/dev/null | wc -l)
            echo "Total: $BACKUP_COUNT backups, $TOTAL_SIZE"
        else
            echo "No backups found"
        fi
        ;;

    "restore")
        BACKUP_FILE="${2:-}"

        if [ -z "$BACKUP_FILE" ]; then
            echo -e "${RED}ERROR: Backup file required${NC}"
            exit 1
        fi

        if [ ! -f "$BACKUP_FILE" ]; then
            echo -e "${RED}ERROR: Backup file not found: $BACKUP_FILE${NC}"
            exit 1
        fi

        echo -e "${YELLOW}⚠ WARNING: This will replace the current database${NC}"
        echo "Backup file: $BACKUP_FILE"

        # Get current DB info for comparison
        CURRENT_TABLES=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null)
        echo "Current tables: $CURRENT_TABLES"

        read -p "Are you sure? (yes/no): " CONFIRM

        if [ "$CONFIRM" != "yes" ]; then
            echo "Restore cancelled"
            exit 0
        fi

        # Create safety backup first
        echo -e "${BLUE}Creating safety backup before restore...${NC}"
        ./backup-manager.sh backup pre-restore

        echo -e "${BLUE}Restoring database...${NC}"

        # Decompress if needed
        if [[ "$BACKUP_FILE" == *.gz ]]; then
            echo "  Decompressing backup..."
            TEMP_FILE="/tmp/restore_${TIMESTAMP}.sql"
            gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
        else
            TEMP_FILE="$BACKUP_FILE"
        fi

        # Restore
        psql "$SUPABASE_DB_URL" < "$TEMP_FILE"
        RESULT=$?

        # Clean up temp file
        if [[ "$BACKUP_FILE" == *.gz ]]; then
            rm -f "$TEMP_FILE"
        fi

        if [ $RESULT -eq 0 ]; then
            echo -e "${GREEN}✓ Database restored successfully${NC}"

            # Verify
            NEW_TABLES=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null)
            echo "Tables restored: $NEW_TABLES"
        else
            echo -e "${RED}✗ Restore failed${NC}"
            echo "You can restore the safety backup:"
            echo "  $0 restore $BACKUP_DIR/pre-restore_*.sql.gz"
            exit 1
        fi
        ;;

    "compare")
        BACKUP_FILE="${2:-}"

        if [ -z "$BACKUP_FILE" ]; then
            echo -e "${RED}ERROR: Backup file required${NC}"
            exit 1
        fi

        echo -e "${CYAN}Comparing backup with current database${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        # Decompress to temp if needed
        if [[ "$BACKUP_FILE" == *.gz ]]; then
            TEMP_FILE="/tmp/compare_${TIMESTAMP}.sql"
            gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
        else
            TEMP_FILE="$BACKUP_FILE"
        fi

        # Extract table list from backup
        echo "Tables in backup:"
        grep -E "^CREATE TABLE" "$TEMP_FILE" | sed 's/CREATE TABLE /  - /' | head -20

        echo ""
        echo "Current database tables:"
        psql "$SUPABASE_DB_URL" -t -A -c "SELECT '  - ' || tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename LIMIT 20;" 2>/dev/null

        # Clean up
        if [[ "$BACKUP_FILE" == *.gz ]]; then
            rm -f "$TEMP_FILE"
        fi
        ;;

    "clean")
        echo -e "${BLUE}Cleaning old backups...${NC}"

        # Count backups
        BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.gz 2>/dev/null | wc -l)

        if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
            TO_DELETE=$((BACKUP_COUNT - MAX_BACKUPS))
            echo "Removing $TO_DELETE old backups (keeping last $MAX_BACKUPS)"

            # Delete oldest backups
            ls -1t "$BACKUP_DIR"/*.gz | tail -n "$TO_DELETE" | while read file; do
                echo "  Removing: $(basename "$file")"
                rm -f "$file"
                rm -f "${file%.sql.gz}.json"  # Remove metadata too
            done

            echo -e "${GREEN}✓ Cleaned $TO_DELETE old backups${NC}"
        else
            echo "No cleanup needed ($BACKUP_COUNT backups, max: $MAX_BACKUPS)"
        fi
        ;;

    "schedule")
        echo -e "${CYAN}Cron Schedule Examples${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Add to crontab with: crontab -e"
        echo ""
        echo "# Daily backup at 2 AM"
        echo "0 2 * * * $PWD/$0 backup daily >> /var/log/db_backup.log 2>&1"
        echo ""
        echo "# Weekly backup on Sunday at 3 AM"
        echo "0 3 * * 0 $PWD/$0 backup weekly >> /var/log/db_backup.log 2>&1"
        echo ""
        echo "# Clean old backups daily at 4 AM"
        echo "0 4 * * * $PWD/$0 clean >> /var/log/db_backup.log 2>&1"
        echo ""
        echo "# Schema backup before each deploy (call from CI/CD)"
        echo "$PWD/$0 schema pre-deploy"
        ;;

    *)
        echo -e "${RED}ERROR: Unknown action: $ACTION${NC}"
        exit 1
        ;;
esac