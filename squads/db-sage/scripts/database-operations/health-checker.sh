#!/bin/bash
# Database Health Checker - Comprehensive health check for PostgreSQL/Supabase
# Economia: ~90% dos tokens vs verificação manual
# Uso: ./health-checker.sh [--json] [--verbose] [--quick]
# v2.0 - Now using secure .pgpass authentication

set -euo pipefail

# Import common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh" 2>/dev/null || {
    # Fallback if common.sh doesn't exist
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    NC='\033[0m'
    log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
    log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
    log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1" >&2; }
}

# Check for secure authentication
if [ -f "$SCRIPT_DIR/../.pgenv" ]; then
    # Use secure .pgpass method
    source "$SCRIPT_DIR/../.pgenv"
    log_info "Using secure .pgpass authentication"
elif [ -n "${SUPABASE_DB_URL:-}" ]; then
    # Fallback to SUPABASE_DB_URL (less secure, for compatibility)
    log_warning "Using SUPABASE_DB_URL (consider running setup-pgpass.sh for secure auth)"
    DB_CONNECTION="$SUPABASE_DB_URL"
else
    log_error "No database connection configured"
    echo "Please run: $SCRIPT_DIR/setup-pgpass.sh"
    exit 1
fi

# Database query helper function
db_query() {
    local query="$1"
    if [ -n "${PGHOST:-}" ]; then
        # Using secure .pgpass method
        psql -t -A -c "$query" 2>/dev/null
    else
        # Using SUPABASE_DB_URL fallback
        psql "$DB_CONNECTION" -t -A -c "$query" 2>/dev/null
    fi
}

# Database query with multiline SQL
db_query_multi() {
    local query="$1"
    if [ -n "${PGHOST:-}" ]; then
        # Using secure .pgpass method
        psql -t -A 2>/dev/null << SQL
$query
SQL
    else
        # Using SUPABASE_DB_URL fallback
        psql "$DB_CONNECTION" -t -A 2>/dev/null << SQL
$query
SQL
    fi
}

# Parse arguments
OUTPUT_JSON=false
VERBOSE=false
QUICK_CHECK=false

while [ $# -gt 0 ]; do
    case "$1" in
        --json)
            OUTPUT_JSON=true
            ;;
        --verbose)
            VERBOSE=true
            ;;
        --quick)
            QUICK_CHECK=true
            ;;
        *)
            echo "Usage: $0 [--json] [--verbose] [--quick]"
            exit 1
            ;;
    esac
    shift
done

# Initialize health score
HEALTH_SCORE=100
ISSUES_FOUND=0
WARNINGS_FOUND=0

# Create temp file for JSON output
JSON_OUTPUT="/tmp/health_check_$$.json"
echo '{"timestamp":"'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'","checks":[]}' > "$JSON_OUTPUT"

# Function to add check result
add_check_result() {
    local category="$1"
    local check_name="$2"
    local status="$3"
    local value="$4"
    local message="$5"

    if [ "$OUTPUT_JSON" = true ]; then
        jq --arg cat "$category" \
           --arg name "$check_name" \
           --arg stat "$status" \
           --arg val "$value" \
           --arg msg "$message" \
           '.checks += [{"category":$cat,"name":$name,"status":$stat,"value":$val,"message":$msg}]' \
           "$JSON_OUTPUT" > "$JSON_OUTPUT.tmp" && mv "$JSON_OUTPUT.tmp" "$JSON_OUTPUT"
    fi

    if [ "$status" = "ERROR" ]; then
        ((ISSUES_FOUND++))
        ((HEALTH_SCORE-=10))
    elif [ "$status" = "WARNING" ]; then
        ((WARNINGS_FOUND++))
        ((HEALTH_SCORE-=5))
    fi
}

if [ "$OUTPUT_JSON" = false ]; then
    echo "🏥 Database Health Checker v1.0"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

# =============================================================================
# 1. CONNECTION & BASIC INFO
# =============================================================================
if [ "$OUTPUT_JSON" = false ]; then
    echo -e "${CYAN}📊 Database Connection & Info${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

# Check connection
DB_VERSION=$(db_query "SELECT version();" 2>/dev/null | head -1 || echo "Connection failed")

if [ "$DB_VERSION" != "Connection failed" ]; then
    PG_VERSION=$(echo "$DB_VERSION" | grep -oE 'PostgreSQL [0-9]+\.[0-9]+' || echo "Unknown")

    if [ "$OUTPUT_JSON" = false ]; then
        echo -e "  Database: ${GREEN}✓ Connected${NC}"
        echo "  Version: $PG_VERSION"
    fi

    add_check_result "connection" "database_connection" "OK" "$PG_VERSION" "Connected successfully"
else
    if [ "$OUTPUT_JSON" = false ]; then
        echo -e "  Database: ${RED}✗ Connection failed${NC}"
    fi
    add_check_result "connection" "database_connection" "ERROR" "N/A" "Connection failed"
    exit 1
fi

# Get database size
DB_SIZE=$(db_query "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null)
if [ "$OUTPUT_JSON" = false ]; then
    echo "  Size: $DB_SIZE"
fi
add_check_result "connection" "database_size" "OK" "$DB_SIZE" "Database size"

# =============================================================================
# 2. CONNECTION POOL
# =============================================================================
if [ "$OUTPUT_JSON" = false ]; then
    echo ""
    echo -e "${CYAN}🔌 Connection Pool Status${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

# Active connections
ACTIVE_CONN=$(db_query "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active' AND pid <> pg_backend_pid();" 2>/dev/null)
IDLE_CONN=$(db_query "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle';" 2>/dev/null)
MAX_CONN=$(db_query "SHOW max_connections;" 2>/dev/null)

CONN_PERCENTAGE=$(echo "scale=2; ($ACTIVE_CONN + $IDLE_CONN) * 100 / $MAX_CONN" | bc 2>/dev/null || echo "0")

if [ "$OUTPUT_JSON" = false ]; then
    echo "  Active: $ACTIVE_CONN"
    echo "  Idle: $IDLE_CONN"
    echo "  Max: $MAX_CONN"
    echo -n "  Usage: ${CONN_PERCENTAGE}% "
fi

if (( $(echo "$CONN_PERCENTAGE > 80" | bc -l) )); then
    if [ "$OUTPUT_JSON" = false ]; then
        echo -e "${RED}⚠ HIGH${NC}"
    fi
    add_check_result "connections" "connection_usage" "WARNING" "${CONN_PERCENTAGE}%" "Connection pool usage high"
elif (( $(echo "$CONN_PERCENTAGE > 60" | bc -l) )); then
    if [ "$OUTPUT_JSON" = false ]; then
        echo -e "${YELLOW}⚠ MODERATE${NC}"
    fi
    add_check_result "connections" "connection_usage" "WARNING" "${CONN_PERCENTAGE}%" "Connection pool usage moderate"
else
    if [ "$OUTPUT_JSON" = false ]; then
        echo -e "${GREEN}✓ GOOD${NC}"
    fi
    add_check_result "connections" "connection_usage" "OK" "${CONN_PERCENTAGE}%" "Connection pool usage normal"
fi

# =============================================================================
# 3. PERFORMANCE METRICS
# =============================================================================
if [ "$QUICK_CHECK" = false ]; then
    if [ "$OUTPUT_JSON" = false ]; then
        echo ""
        echo -e "${CYAN}⚡ Performance Metrics${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi

    # Cache hit ratio
    CACHE_HIT_RATIO=$(db_query_multi "
SELECT
    ROUND(
        100.0 * SUM(blks_hit) / NULLIF(SUM(blks_hit) + SUM(blks_read), 0),
        2
    )::text || '%'
FROM pg_stat_database
WHERE datname = current_database();")

    if [ "$OUTPUT_JSON" = false ]; then
        echo -n "  Cache Hit Ratio: $CACHE_HIT_RATIO "
    fi

    CACHE_VALUE=$(echo "$CACHE_HIT_RATIO" | tr -d '%')
    if (( $(echo "$CACHE_VALUE < 90" | bc -l 2>/dev/null) )); then
        if [ "$OUTPUT_JSON" = false ]; then
            echo -e "${YELLOW}⚠ LOW${NC}"
        fi
        add_check_result "performance" "cache_hit_ratio" "WARNING" "$CACHE_HIT_RATIO" "Cache hit ratio below optimal"
    else
        if [ "$OUTPUT_JSON" = false ]; then
            echo -e "${GREEN}✓${NC}"
        fi
        add_check_result "performance" "cache_hit_ratio" "OK" "$CACHE_HIT_RATIO" "Cache hit ratio good"
    fi

    # Long running queries
    LONG_QUERIES=$(db_query "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '1 minute';" 2>/dev/null)

    if [ "$OUTPUT_JSON" = false ]; then
        echo -n "  Long Running Queries: $LONG_QUERIES "
    fi

    if [ "$LONG_QUERIES" -gt 0 ]; then
        if [ "$OUTPUT_JSON" = false ]; then
            echo -e "${YELLOW}⚠${NC}"
        fi
        add_check_result "performance" "long_queries" "WARNING" "$LONG_QUERIES" "Long running queries detected"
    else
        if [ "$OUTPUT_JSON" = false ]; then
            echo -e "${GREEN}✓${NC}"
        fi
        add_check_result "performance" "long_queries" "OK" "$LONG_QUERIES" "No long running queries"
    fi

    # Deadlocks
    DEADLOCKS=$(db_query "SELECT deadlocks FROM pg_stat_database WHERE datname = current_database();" 2>/dev/null)

    if [ "$OUTPUT_JSON" = false ]; then
        echo -n "  Deadlocks: $DEADLOCKS "
    fi

    if [ "$DEADLOCKS" -gt 0 ]; then
        if [ "$OUTPUT_JSON" = false ]; then
            echo -e "${RED}⚠${NC}"
        fi
        add_check_result "performance" "deadlocks" "WARNING" "$DEADLOCKS" "Deadlocks detected"
    else
        if [ "$OUTPUT_JSON" = false ]; then
            echo -e "${GREEN}✓${NC}"
        fi
        add_check_result "performance" "deadlocks" "OK" "$DEADLOCKS" "No deadlocks"
    fi
fi

# =============================================================================
# 4. TABLE & INDEX HEALTH
# =============================================================================
if [ "$OUTPUT_JSON" = false ]; then
    echo ""
    echo -e "${CYAN}📋 Table & Index Health${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

# Table count and bloat
TABLE_COUNT=$(db_query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null)
INDEX_COUNT=$(db_query "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" 2>/dev/null)

if [ "$OUTPUT_JSON" = false ]; then
    echo "  Tables: $TABLE_COUNT"
    echo "  Indexes: $INDEX_COUNT"
fi

add_check_result "schema" "table_count" "OK" "$TABLE_COUNT" "Number of tables"
add_check_result "schema" "index_count" "OK" "$INDEX_COUNT" "Number of indexes"

# Check for tables without primary keys
TABLES_WITHOUT_PK=$(db_query_multi "
SELECT COUNT(*)
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc
    ON t.table_schema = tc.table_schema
    AND t.table_name = tc.table_name
    AND tc.constraint_type = 'PRIMARY KEY'
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND tc.constraint_name IS NULL;")

if [ "$OUTPUT_JSON" = false ]; then
    echo -n "  Tables without PK: $TABLES_WITHOUT_PK "
fi

if [ "$TABLES_WITHOUT_PK" -gt 0 ]; then
    if [ "$OUTPUT_JSON" = false ]; then
        echo -e "${YELLOW}⚠${NC}"
    fi
    add_check_result "schema" "tables_without_pk" "WARNING" "$TABLES_WITHOUT_PK" "Tables without primary key"
else
    if [ "$OUTPUT_JSON" = false ]; then
        echo -e "${GREEN}✓${NC}"
    fi
    add_check_result "schema" "tables_without_pk" "OK" "$TABLES_WITHOUT_PK" "All tables have primary keys"
fi

# =============================================================================
# 5. SECURITY (RLS)
# =============================================================================
if [ "$OUTPUT_JSON" = false ]; then
    echo ""
    echo -e "${CYAN}🔐 Security Status${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

# Tables with/without RLS
TABLES_WITH_RLS=$(db_query "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;" 2>/dev/null)
TABLES_WITHOUT_RLS=$(db_query "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false;" 2>/dev/null)

if [ "$OUTPUT_JSON" = false ]; then
    echo "  Tables with RLS: $TABLES_WITH_RLS"
    echo -n "  Tables without RLS: $TABLES_WITHOUT_RLS "
fi

if [ "$TABLES_WITHOUT_RLS" -gt 0 ]; then
    if [ "$OUTPUT_JSON" = false ]; then
        echo -e "${YELLOW}⚠${NC}"
    fi
    add_check_result "security" "tables_without_rls" "WARNING" "$TABLES_WITHOUT_RLS" "Tables without RLS protection"
else
    if [ "$OUTPUT_JSON" = false ]; then
        echo -e "${GREEN}✓${NC}"
    fi
    add_check_result "security" "tables_without_rls" "OK" "$TABLES_WITHOUT_RLS" "All tables have RLS"
fi

# Total policies
TOTAL_POLICIES=$(db_query "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';" 2>/dev/null)

if [ "$OUTPUT_JSON" = false ]; then
    echo "  Total Policies: $TOTAL_POLICIES"
fi

add_check_result "security" "total_policies" "OK" "$TOTAL_POLICIES" "Number of RLS policies"

# =============================================================================
# 6. REPLICATION LAG (if applicable)
# =============================================================================
if [ "$QUICK_CHECK" = false ] && [ "$VERBOSE" = true ]; then
    if [ "$OUTPUT_JSON" = false ]; then
        echo ""
        echo -e "${CYAN}🔄 Replication Status${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi

    REPLICATION_LAG=$(db_query_multi "
SELECT
    CASE
        WHEN pg_is_in_recovery() THEN
            EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))::text || ' seconds'
        ELSE
            'Primary (no lag)'
    END;")

    if [ "$OUTPUT_JSON" = false ]; then
        echo "  Replication Lag: $REPLICATION_LAG"
    fi

    add_check_result "replication" "lag" "OK" "$REPLICATION_LAG" "Replication status"
fi

# =============================================================================
# 7. VACUUM & MAINTENANCE
# =============================================================================
if [ "$OUTPUT_JSON" = false ]; then
    echo ""
    echo -e "${CYAN}🧹 Maintenance Status${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

# Tables needing vacuum
TABLES_NEED_VACUUM=$(db_query_multi "
SELECT COUNT(*)
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
AND n_dead_tup > n_live_tup * 0.2;")

if [ "$OUTPUT_JSON" = false ]; then
    echo -n "  Tables needing vacuum: $TABLES_NEED_VACUUM "
fi

if [ "$TABLES_NEED_VACUUM" -gt 0 ]; then
    if [ "$OUTPUT_JSON" = false ]; then
        echo -e "${YELLOW}⚠${NC}"
    fi
    add_check_result "maintenance" "vacuum_needed" "WARNING" "$TABLES_NEED_VACUUM" "Tables need vacuum"
else
    if [ "$OUTPUT_JSON" = false ]; then
        echo -e "${GREEN}✓${NC}"
    fi
    add_check_result "maintenance" "vacuum_needed" "OK" "$TABLES_NEED_VACUUM" "Vacuum status good"
fi

# Last vacuum time
OLDEST_VACUUM=$(db_query_multi "
SELECT
    COALESCE(
        EXTRACT(DAY FROM (now() - MIN(last_vacuum)))::text || ' days ago',
        'Never'
    )
FROM pg_stat_user_tables
WHERE schemaname = 'public';")

if [ "$OUTPUT_JSON" = false ]; then
    echo "  Oldest vacuum: $OLDEST_VACUUM"
fi

add_check_result "maintenance" "oldest_vacuum" "OK" "$OLDEST_VACUUM" "Time since oldest vacuum"

# =============================================================================
# FINAL SUMMARY
# =============================================================================

# Calculate final health score
if [ $HEALTH_SCORE -lt 0 ]; then
    HEALTH_SCORE=0
fi

if [ "$OUTPUT_JSON" = true ]; then
    # Add summary to JSON
    jq --arg score "$HEALTH_SCORE" \
       --arg issues "$ISSUES_FOUND" \
       --arg warnings "$WARNINGS_FOUND" \
       '.health_score = ($score | tonumber) | .issues = ($issues | tonumber) | .warnings = ($warnings | tonumber)' \
       "$JSON_OUTPUT"
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${CYAN}📊 Health Summary${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    echo -n "  Health Score: "
    if [ $HEALTH_SCORE -ge 90 ]; then
        echo -e "${GREEN}${HEALTH_SCORE}/100 ✅ EXCELLENT${NC}"
    elif [ $HEALTH_SCORE -ge 70 ]; then
        echo -e "${YELLOW}${HEALTH_SCORE}/100 ⚠ GOOD${NC}"
    elif [ $HEALTH_SCORE -ge 50 ]; then
        echo -e "${YELLOW}${HEALTH_SCORE}/100 ⚠ NEEDS ATTENTION${NC}"
    else
        echo -e "${RED}${HEALTH_SCORE}/100 ❌ CRITICAL${NC}"
    fi

    echo "  Issues Found: $ISSUES_FOUND"
    echo "  Warnings: $WARNINGS_FOUND"

    echo ""
    if [ $HEALTH_SCORE -lt 90 ]; then
        echo "🔧 Recommendations:"

        if [ "$TABLES_WITHOUT_RLS" -gt 0 ]; then
            echo "  • Enable RLS on unprotected tables"
        fi

        if [ "$TABLES_NEED_VACUUM" -gt 0 ]; then
            echo "  • Run VACUUM on bloated tables"
        fi

        if [ "$LONG_QUERIES" -gt 0 ]; then
            echo "  • Investigate and optimize long-running queries"
        fi

        if [ "$TABLES_WITHOUT_PK" -gt 0 ]; then
            echo "  • Add primary keys to all tables"
        fi

        CACHE_VALUE=$(echo "$CACHE_HIT_RATIO" | tr -d '%')
        if (( $(echo "$CACHE_VALUE < 90" | bc -l 2>/dev/null) )); then
            echo "  • Increase shared_buffers or optimize queries"
        fi
    else
        echo "🎉 Database is healthy! Keep up the good work."
    fi

    echo ""
    echo "💾 Full report saved to: $JSON_OUTPUT"
fi