#!/bin/bash
# Database Detection and Connection Script
# Detects PostgreSQL/Supabase connections for DB Sage activation

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detection result file
DETECTION_RESULT="/tmp/db_detection_$$.json"

# Function to detect database connections
detect_database() {
    local db_type="none"
    local db_url=""
    local db_name=""

    if [ -n "${SUPABASE_DB_URL:-}" ]; then
        db_type="postgresql"
        db_url="$SUPABASE_DB_URL"
        db_name="supabase"
        echo -e "${GREEN}✓${NC} Found SUPABASE_DB_URL (PostgreSQL/Supabase)"

    elif [ -n "${DATABASE_URL:-}" ]; then
        db_type="postgresql"
        db_url="$DATABASE_URL"
        db_name="postgresql"
        echo -e "${GREEN}✓${NC} Found DATABASE_URL (PostgreSQL)"
    fi

    # Write detection result to JSON file
    cat > "$DETECTION_RESULT" <<EOF
{
    "db_type": "$db_type",
    "db_url": "$db_url",
    "db_name": "$db_name",
    "detected_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

    # Return detection result
    if [ "$db_type" = "none" ]; then
        echo -e "${RED}✗${NC} No database connection detected"
        echo -e "${BLUE}ℹ${NC} Please set one of the following environment variables:"
        echo "  - SUPABASE_DB_URL (for Supabase PostgreSQL)"
        echo "  - DATABASE_URL (for PostgreSQL)"
        return 1
    fi

    return 0
}

# Function to test database connection
test_connection() {
    local db_type="$1"
    local db_url="$2"

    echo -e "${BLUE}ℹ${NC} Testing connection..."

    case "$db_type" in
        postgresql)
            if psql "$db_url" -c "SELECT 1" >/dev/null 2>&1; then
                echo -e "${GREEN}✓${NC} Connection successful"
                return 0
            else
                echo -e "${RED}✗${NC} Connection failed"
                return 1
            fi
            ;;

        *)
            echo -e "${RED}✗${NC} Unknown database type: $db_type"
            return 1
            ;;
    esac
}

# Main execution
main() {
    echo "════════════════════════════════════════════"
    echo " Database Detection - Super Agentes Framework"
    echo "════════════════════════════════════════════"
    echo

    # Detect database
    if detect_database; then
        # Read detection result
        db_type=$(grep '"db_type"' "$DETECTION_RESULT" | cut -d'"' -f4)
        db_url=$(grep '"db_url"' "$DETECTION_RESULT" | cut -d'"' -f4)

        # Test connection
        if test_connection "$db_type" "$db_url"; then
            echo
            echo -e "${GREEN}Database ready for use!${NC}"
            echo "Detection result saved to: $DETECTION_RESULT"
        else
            echo
            echo -e "${YELLOW}⚠ Database detected but connection failed${NC}"
            echo "Please check your credentials and network connection"
            exit 1
        fi
    else
        exit 1
    fi
}

# Run main function
main "$@"
