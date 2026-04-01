#!/bin/bash
# Connection Monitor - Monitor and manage database connections
# Economia: ~75% dos tokens vs monitoramento manual
# Uso: ./connection-monitor.sh [mode] [interval]

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
MODE="${1:-status}"
INTERVAL="${2:-5}"  # Default 5 seconds for watch mode

if [ "$MODE" = "help" ]; then
    echo "Usage: $0 [mode] [interval]"
    echo ""
    echo "Modes:"
    echo "  status        - Show current connection status (default)"
    echo "  watch [sec]   - Monitor connections in real-time"
    echo "  details       - Show detailed connection info"
    echo "  pool          - Analyze connection pooling"
    echo "  leaks         - Detect potential connection leaks"
    echo "  optimize      - Suggest connection pool optimizations"
    echo "  by-app        - Group connections by application"
    echo "  by-user       - Group connections by user"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 watch 10     # Update every 10 seconds"
    echo "  $0 leaks"
    exit 0
fi

case "$MODE" in
    "status")
        echo "🔌 Connection Monitor v1.0"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""

        # Get connection metrics
        METRICS=$(psql "$SUPABASE_DB_URL" -t -A << 'SQL' 2>/dev/null
SELECT json_build_object(
    'max_connections', current_setting('max_connections')::int,
    'total_connections', (SELECT COUNT(*) FROM pg_stat_activity),
    'active_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active'),
    'idle_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle'),
    'idle_in_transaction', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle in transaction'),
    'waiting_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE wait_event_type IS NOT NULL),
    'percentage_used', ROUND((SELECT COUNT(*)::numeric FROM pg_stat_activity) * 100 / current_setting('max_connections')::numeric, 2)
);
SQL
        )

        # Parse metrics
        MAX_CONN=$(echo "$METRICS" | jq -r '.max_connections')
        TOTAL_CONN=$(echo "$METRICS" | jq -r '.total_connections')
        ACTIVE_CONN=$(echo "$METRICS" | jq -r '.active_connections')
        IDLE_CONN=$(echo "$METRICS" | jq -r '.idle_connections')
        IDLE_IN_TX=$(echo "$METRICS" | jq -r '.idle_in_transaction')
        WAITING=$(echo "$METRICS" | jq -r '.waiting_connections')
        PERCENT=$(echo "$METRICS" | jq -r '.percentage_used')

        # Display status with visual indicators
        echo -e "${CYAN}Connection Pool Status${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Max Connections: $MAX_CONN"
        echo "Used: $TOTAL_CONN ($PERCENT%)"

        # Visual bar
        BAR_LENGTH=30
        FILLED=$(echo "scale=0; $PERCENT * $BAR_LENGTH / 100" | bc)
        EMPTY=$((BAR_LENGTH - FILLED))

        echo -n "Usage: ["
        if (( $(echo "$PERCENT > 80" | bc -l) )); then
            echo -n -e "${RED}"
        elif (( $(echo "$PERCENT > 60" | bc -l) )); then
            echo -n -e "${YELLOW}"
        else
            echo -n -e "${GREEN}"
        fi

        for i in $(seq 1 $FILLED); do echo -n "█"; done
        echo -n -e "${NC}"
        for i in $(seq 1 $EMPTY); do echo -n "░"; done
        echo "] $PERCENT%"

        echo ""
        echo -e "${CYAN}Connection Breakdown${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  Active: $ACTIVE_CONN"
        echo "  Idle: $IDLE_CONN"

        if [ "$IDLE_IN_TX" -gt 0 ]; then
            echo -e "  Idle in Transaction: ${YELLOW}$IDLE_IN_TX ⚠${NC}"
        else
            echo "  Idle in Transaction: $IDLE_IN_TX"
        fi

        if [ "$WAITING" -gt 0 ]; then
            echo -e "  Waiting: ${YELLOW}$WAITING ⚠${NC}"
        else
            echo "  Waiting: $WAITING"
        fi

        # Health assessment
        echo ""
        echo -e "${CYAN}Health Assessment${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        if (( $(echo "$PERCENT < 50" | bc -l) )); then
            echo -e "${GREEN}✓ Healthy${NC} - Connection pool usage is optimal"
        elif (( $(echo "$PERCENT < 70" | bc -l) )); then
            echo -e "${GREEN}✓ Good${NC} - Connection pool has sufficient capacity"
        elif (( $(echo "$PERCENT < 85" | bc -l) )); then
            echo -e "${YELLOW}⚠ Warning${NC} - Connection pool usage is high"
            echo "  Consider increasing max_connections or optimizing queries"
        else
            echo -e "${RED}✗ Critical${NC} - Connection pool is nearly exhausted"
            echo "  Immediate action required to prevent connection failures"
        fi

        if [ "$IDLE_IN_TX" -gt 5 ]; then
            echo -e "${YELLOW}⚠ Issue:${NC} High number of idle transactions"
            echo "  These can cause locks and should be investigated"
        fi
        ;;

    "watch")
        echo "🔌 Connection Monitor - Live View"
        echo "Updating every ${INTERVAL} seconds. Press Ctrl+C to stop."
        echo ""

        while true; do
            clear
            echo "🔌 Connection Monitor - $(date '+%H:%M:%S')"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

            psql "$SUPABASE_DB_URL" << 'SQL' 2>/dev/null
SELECT
    state,
    COUNT(*) as count,
    STRING_AGG(DISTINCT application_name, ', ' ORDER BY application_name) as apps
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
GROUP BY state
ORDER BY count DESC;

\echo ''
\echo 'Top Active Queries:'
\echo '━━━━━━━━━━━━━━━━━━━'

SELECT
    pid,
    usename,
    now() - query_start as duration,
    LEFT(query, 60) as query
FROM pg_stat_activity
WHERE state = 'active'
  AND pid <> pg_backend_pid()
ORDER BY duration DESC
LIMIT 5;
SQL

            sleep "$INTERVAL"
        done
        ;;

    "details")
        echo -e "${CYAN}Detailed Connection Information${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
SELECT
    pid,
    usename as user,
    application_name as app,
    client_addr as client,
    state,
    CASE
        WHEN state = 'active' THEN now() - query_start
        WHEN state = 'idle' THEN now() - state_change
        ELSE NULL
    END as duration,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
ORDER BY
    CASE state
        WHEN 'active' THEN 1
        WHEN 'idle in transaction' THEN 2
        WHEN 'idle' THEN 3
        ELSE 4
    END,
    duration DESC
LIMIT 30;
SQL
        ;;

    "pool")
        echo -e "${CYAN}Connection Pool Analysis${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
-- Pool configuration
SELECT
    name,
    setting,
    CASE name
        WHEN 'max_connections' THEN 'Maximum allowed connections'
        WHEN 'superuser_reserved_connections' THEN 'Reserved for superuser'
        WHEN 'max_wal_senders' THEN 'Reserved for replication'
    END as description
FROM pg_settings
WHERE name IN ('max_connections', 'superuser_reserved_connections', 'max_wal_senders');

\echo ''
\echo 'Connection Pool Efficiency:'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━'

WITH pool_stats AS (
    SELECT
        COUNT(*) FILTER (WHERE state = 'active') as active,
        COUNT(*) FILTER (WHERE state = 'idle') as idle,
        COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_tx,
        COUNT(*) as total,
        current_setting('max_connections')::int as max_conn
    FROM pg_stat_activity
)
SELECT
    active || '/' || max_conn as "Active/Max",
    ROUND(active::numeric * 100 / NULLIF(total, 0), 2) || '%' as "Active %",
    ROUND(idle::numeric * 100 / NULLIF(total, 0), 2) || '%' as "Idle %",
    ROUND(total::numeric * 100 / max_conn, 2) || '%' as "Pool Usage",
    CASE
        WHEN total::numeric / max_conn < 0.5 THEN 'Underutilized'
        WHEN total::numeric / max_conn < 0.8 THEN 'Optimal'
        WHEN total::numeric / max_conn < 0.9 THEN 'High'
        ELSE 'Critical'
    END as "Status"
FROM pool_stats;
SQL
        ;;

    "leaks")
        echo -e "${CYAN}Detecting Connection Leaks${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
-- Idle connections that might be leaks
\echo 'Potential Connection Leaks (idle > 10 minutes):'

SELECT
    pid,
    usename,
    application_name,
    client_addr,
    now() - state_change as idle_time,
    query
FROM pg_stat_activity
WHERE state = 'idle'
  AND now() - state_change > interval '10 minutes'
ORDER BY idle_time DESC;

\echo ''
\echo 'Idle in Transaction (potential locks):'

SELECT
    pid,
    usename,
    application_name,
    now() - state_change as idle_time,
    LEFT(query, 80) as last_query
FROM pg_stat_activity
WHERE state = 'idle in transaction'
ORDER BY idle_time DESC;

\echo ''
\echo 'Applications with Most Connections:'

SELECT
    application_name,
    COUNT(*) as connections,
    COUNT(*) FILTER (WHERE state = 'idle' AND now() - state_change > interval '5 minutes') as long_idle,
    ROUND(AVG(EXTRACT(EPOCH FROM (now() - backend_start))), 2) as avg_age_seconds
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
GROUP BY application_name
HAVING COUNT(*) > 2
ORDER BY connections DESC;
SQL

        echo ""
        echo -e "${YELLOW}Recommendations:${NC}"
        echo "• Review applications with many long-idle connections"
        echo "• Implement connection pooling (PgBouncer/pgpool)"
        echo "• Set appropriate connection timeouts in your application"
        echo "• Use connection.close() properly in your code"
        ;;

    "optimize")
        echo -e "${CYAN}Connection Pool Optimization Recommendations${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        # Get metrics for analysis
        ANALYSIS=$(psql "$SUPABASE_DB_URL" -t -A << 'SQL' 2>/dev/null
SELECT json_build_object(
    'max_connections', current_setting('max_connections')::int,
    'avg_connections', (
        SELECT AVG(numbackends)::int
        FROM pg_stat_database
        WHERE datname = current_database()
    ),
    'peak_connections', (SELECT COUNT(*) FROM pg_stat_activity),
    'idle_ratio', ROUND(
        COUNT(*) FILTER (WHERE state = 'idle')::numeric * 100 /
        NULLIF(COUNT(*), 0), 2
    ),
    'avg_query_time', (
        SELECT ROUND(AVG(mean_exec_time), 2)
        FROM pg_stat_statements
        LIMIT 100
    )
) FROM pg_stat_activity;
SQL
        )

        MAX_CONN=$(echo "$ANALYSIS" | jq -r '.max_connections')
        AVG_CONN=$(echo "$ANALYSIS" | jq -r '.avg_connections')
        PEAK_CONN=$(echo "$ANALYSIS" | jq -r '.peak_connections')
        IDLE_RATIO=$(echo "$ANALYSIS" | jq -r '.idle_ratio')

        echo "Current Configuration:"
        echo "  Max Connections: $MAX_CONN"
        echo "  Average Usage: $AVG_CONN"
        echo "  Peak Usage: $PEAK_CONN"
        echo "  Idle Ratio: ${IDLE_RATIO}%"
        echo ""

        echo -e "${CYAN}Recommendations:${NC}"

        # Calculate recommendations
        RECOMMENDED_MAX=$((PEAK_CONN * 130 / 100))  # 30% headroom

        if [ "$RECOMMENDED_MAX" -lt "$MAX_CONN" ]; then
            echo "1. ✓ max_connections ($MAX_CONN) is sufficient"
        else
            echo "1. ⚠ Consider increasing max_connections to $RECOMMENDED_MAX"
        fi

        if (( $(echo "$IDLE_RATIO > 50" | bc -l) )); then
            echo "2. ⚠ High idle ratio - implement connection pooling:"
            echo "   • PgBouncer in transaction mode"
            echo "   • Pool size: $((AVG_CONN * 2))"
        else
            echo "2. ✓ Idle ratio is acceptable"
        fi

        echo ""
        echo -e "${CYAN}Suggested PgBouncer Configuration:${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        cat << EOF
[databases]
mydb = host=localhost dbname=mydb

[pgbouncer]
pool_mode = transaction
max_client_conn = $((MAX_CONN * 5))
default_pool_size = $((AVG_CONN * 2))
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = $MAX_CONN
EOF
        ;;

    "by-app")
        echo -e "${CYAN}Connections by Application${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
SELECT
    application_name as "Application",
    COUNT(*) as "Total",
    COUNT(*) FILTER (WHERE state = 'active') as "Active",
    COUNT(*) FILTER (WHERE state = 'idle') as "Idle",
    COUNT(*) FILTER (WHERE state = 'idle in transaction') as "Idle TX",
    ROUND(AVG(EXTRACT(EPOCH FROM (now() - backend_start))), 2) || 's' as "Avg Age"
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
GROUP BY application_name
ORDER BY "Total" DESC;
SQL
        ;;

    "by-user")
        echo -e "${CYAN}Connections by User${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
SELECT
    usename as "User",
    COUNT(*) as "Total",
    COUNT(*) FILTER (WHERE state = 'active') as "Active",
    COUNT(*) FILTER (WHERE state = 'idle') as "Idle",
    STRING_AGG(DISTINCT application_name, ', ') as "Applications",
    COUNT(DISTINCT client_addr) as "Unique IPs"
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
GROUP BY usename
ORDER BY "Total" DESC;
SQL
        ;;

    *)
        echo -e "${RED}ERROR: Unknown mode: $MODE${NC}"
        echo "Use '$0 help' for usage"
        exit 1
        ;;
esac