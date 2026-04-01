#!/bin/bash
# Query Killer - Identify and terminate problematic queries
# Economia: ~70% dos tokens vs gestão manual
# Uso: ./query-killer.sh [action] [threshold]

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check requirements
if [ -z "${SUPABASE_DB_URL:-}" ]; then
    echo -e "${RED}ERROR: SUPABASE_DB_URL not set${NC}"
    exit 1
fi

# Parse arguments
ACTION="${1:-list}"
THRESHOLD="${2:-60}"  # Default 60 seconds

if [ "$ACTION" = "help" ]; then
    echo "Usage: $0 [action] [threshold_seconds]"
    echo ""
    echo "Actions:"
    echo "  list [seconds]     - List queries running longer than threshold (default: 60s)"
    echo "  kill <pid>         - Kill specific query by PID"
    echo "  killall [seconds]  - Kill all queries running longer than threshold"
    echo "  locks              - Show queries waiting on locks"
    echo "  blocking           - Show blocking queries"
    echo "  idle               - Show idle connections"
    echo "  stats              - Show query statistics"
    echo ""
    echo "Examples:"
    echo "  $0 list 30         # List queries running > 30 seconds"
    echo "  $0 kill 12345      # Kill query with PID 12345"
    echo "  $0 killall 120     # Kill all queries running > 2 minutes"
    exit 0
fi

echo "🔪 Query Killer v1.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

case "$ACTION" in
    "list")
        echo -e "${CYAN}Long Running Queries (>${THRESHOLD}s)${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << SQL
SELECT
    pid,
    now() - pg_stat_activity.query_start AS duration,
    usename AS user,
    application_name as app,
    state,
    LEFT(query, 100) AS query_preview
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '${THRESHOLD} seconds'
  AND state != 'idle'
  AND pid <> pg_backend_pid()
ORDER BY duration DESC;

-- Count summary
SELECT
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "",
    'Total: ' || COUNT(*) || ' queries' as ""
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '${THRESHOLD} seconds'
  AND state != 'idle'
  AND pid <> pg_backend_pid();
SQL
        ;;

    "kill")
        PID="${THRESHOLD}"  # Second argument is PID in this case

        if [ -z "$PID" ] || ! [[ "$PID" =~ ^[0-9]+$ ]]; then
            echo -e "${RED}ERROR: Valid PID required${NC}"
            echo "Usage: $0 kill <pid>"
            exit 1
        fi

        echo -e "${YELLOW}Attempting to kill query with PID: $PID${NC}"

        # Get query info before killing
        QUERY_INFO=$(psql "$SUPABASE_DB_URL" -t -A << SQL 2>/dev/null
SELECT
    'User: ' || usename || ', Duration: ' || (now() - query_start)::text || ', Query: ' || LEFT(query, 50)
FROM pg_stat_activity
WHERE pid = $PID;
SQL
        )

        if [ -n "$QUERY_INFO" ]; then
            echo "Query info: $QUERY_INFO"
            echo ""

            # Try graceful termination first
            echo "Attempting graceful termination..."
            RESULT=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT pg_cancel_backend($PID);" 2>/dev/null)

            if [ "$RESULT" = "t" ]; then
                echo -e "${GREEN}✓ Query cancelled successfully${NC}"
            else
                echo -e "${YELLOW}Graceful termination failed, trying force kill...${NC}"

                # Force kill
                RESULT=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT pg_terminate_backend($PID);" 2>/dev/null)

                if [ "$RESULT" = "t" ]; then
                    echo -e "${GREEN}✓ Query terminated successfully${NC}"
                else
                    echo -e "${RED}✗ Failed to terminate query${NC}"
                    exit 1
                fi
            fi
        else
            echo -e "${RED}Query with PID $PID not found${NC}"
            exit 1
        fi
        ;;

    "killall")
        echo -e "${YELLOW}⚠ WARNING: Killing all queries running longer than ${THRESHOLD}s${NC}"

        # Count queries to kill
        COUNT=$(psql "$SUPABASE_DB_URL" -t -A << SQL 2>/dev/null
SELECT COUNT(*)
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '${THRESHOLD} seconds'
  AND state != 'idle'
  AND pid <> pg_backend_pid();
SQL
        )

        if [ "$COUNT" -eq 0 ]; then
            echo "No queries to kill"
            exit 0
        fi

        echo "Found $COUNT queries to kill"
        read -p "Are you sure? (yes/no): " CONFIRM

        if [ "$CONFIRM" != "yes" ]; then
            echo "Cancelled"
            exit 0
        fi

        # Kill all long-running queries
        psql "$SUPABASE_DB_URL" << SQL
SELECT
    pid,
    pg_cancel_backend(pid) as cancelled,
    'Killed: ' || usename || ' - ' || LEFT(query, 50) as info
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '${THRESHOLD} seconds'
  AND state != 'idle'
  AND pid <> pg_backend_pid();
SQL

        echo -e "${GREEN}✓ Killed $COUNT queries${NC}"
        ;;

    "locks")
        echo -e "${CYAN}Queries Waiting on Locks${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.application_name AS blocked_app,
    blocking_activity.application_name AS blocking_app,
    now() - blocked_activity.query_start AS blocked_duration,
    now() - blocking_activity.query_start AS blocking_duration
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted
ORDER BY blocked_duration DESC;
SQL
        ;;

    "blocking")
        echo -e "${CYAN}Blocking Queries${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
SELECT
    pid,
    usename,
    pg_blocking_pids(pid) as blocked_by,
    query_start,
    now() - query_start as duration,
    state,
    LEFT(query, 80) as query
FROM pg_stat_activity
WHERE pg_blocking_pids(pid)::text != '{}'
ORDER BY duration DESC;
SQL
        ;;

    "idle")
        echo -e "${CYAN}Idle Connections${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    now() - state_change as idle_duration,
    state
FROM pg_stat_activity
WHERE state = 'idle'
  AND now() - state_change > interval '10 minutes'
ORDER BY idle_duration DESC
LIMIT 20;

-- Summary
SELECT
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "",
    'Total idle > 10min: ' || COUNT(*) as ""
FROM pg_stat_activity
WHERE state = 'idle'
  AND now() - state_change > interval '10 minutes';
SQL
        ;;

    "stats")
        echo -e "${CYAN}Query Statistics${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
-- Connection states
SELECT
    state,
    COUNT(*) as count
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
GROUP BY state
ORDER BY count DESC;

-- Queries by duration
SELECT
    CASE
        WHEN now() - query_start < interval '1 second' THEN '< 1s'
        WHEN now() - query_start < interval '10 seconds' THEN '1-10s'
        WHEN now() - query_start < interval '30 seconds' THEN '10-30s'
        WHEN now() - query_start < interval '1 minute' THEN '30-60s'
        WHEN now() - query_start < interval '5 minutes' THEN '1-5min'
        ELSE '> 5min'
    END as duration_range,
    COUNT(*) as count
FROM pg_stat_activity
WHERE state != 'idle'
  AND pid <> pg_backend_pid()
GROUP BY duration_range
ORDER BY
    CASE duration_range
        WHEN '< 1s' THEN 1
        WHEN '1-10s' THEN 2
        WHEN '10-30s' THEN 3
        WHEN '30-60s' THEN 4
        WHEN '1-5min' THEN 5
        ELSE 6
    END;

-- Top applications
SELECT
    application_name,
    COUNT(*) as connections,
    COUNT(CASE WHEN state = 'active' THEN 1 END) as active
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
GROUP BY application_name
ORDER BY connections DESC
LIMIT 5;
SQL
        ;;

    *)
        echo -e "${RED}ERROR: Unknown action: $ACTION${NC}"
        echo "Use '$0 help' for usage"
        exit 1
        ;;
esac