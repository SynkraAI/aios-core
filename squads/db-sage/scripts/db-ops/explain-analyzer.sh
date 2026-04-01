#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LEGACY_SCRIPT="$SCRIPT_DIR/../database-operations/explain-analyzer.sh"

print_help() {
    cat <<'EOF'
Usage:
  explain-analyzer.sh "<sql_query>" [--format json|text] [--buffers] [--analyze]
  explain-analyzer.sh

Analyze a specific query or, when called without a query, list hot paths from
pg_stat_statements for follow-up investigation.

OPTIONS:
  --format <json|text>  Output format for query analysis (default: text)
  --buffers             Include buffer metrics when analyzing a query
  --analyze             Execute EXPLAIN ANALYZE for a specific query
  -h, --help            Show this help

EXAMPLES:
  explain-analyzer.sh "SELECT * FROM users LIMIT 10"
  explain-analyzer.sh "SELECT * FROM users" --analyze --buffers
  explain-analyzer.sh

ENVIRONMENT:
  SUPABASE_DB_URL or DATABASE_URL  Required. PostgreSQL connection string.
EOF
}

resolve_db_url() {
    if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
        printf '%s\n' "$SUPABASE_DB_URL"
        return 0
    fi
    if [[ -n "${DATABASE_URL:-}" ]]; then
        export SUPABASE_DB_URL="$DATABASE_URL"
        printf '%s\n' "$DATABASE_URL"
        return 0
    fi
    return 1
}

show_hotpaths() {
    local db_url="$1"
    local has_pg_stat

    has_pg_stat=$(psql "$db_url" -t -A -c "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements');" 2>/dev/null || echo "f")
    if [[ "$has_pg_stat" != "t" ]]; then
        echo "ERROR: pg_stat_statements extension is not enabled; provide a query explicitly or enable the extension."
        exit 1
    fi

    psql "$db_url" -X -P pager=off <<'SQL'
\echo '=== HOT QUERY PATHS (pg_stat_statements) ==='
\echo ''
SELECT
  row_number() OVER (ORDER BY total_exec_time DESC) AS rank,
  calls,
  round(total_exec_time::numeric, 2) AS total_ms,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  rows,
  left(regexp_replace(query, '\s+', ' ', 'g'), 160) AS query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
SQL
}

for arg in "$@"; do
    case "$arg" in
        -h|--help)
            print_help
            exit 0
            ;;
    esac
done

if ! db_url=$(resolve_db_url); then
    echo "ERROR: SUPABASE_DB_URL or DATABASE_URL not set"
    exit 1
fi

if [[ $# -eq 0 ]]; then
    show_hotpaths "$db_url"
    exit 0
fi

exec "$LEGACY_SCRIPT" "$@"
