#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LEGACY_SCRIPT="$SCRIPT_DIR/../database-adapters/unified-db-loader.sh"

print_help() {
    cat <<'EOF'
Usage: schema-context-loader.sh

Load current PostgreSQL/Supabase schema context for DB Sage workflows.

ENVIRONMENT:
  SUPABASE_DB_URL or DATABASE_URL  Required. PostgreSQL connection string.
EOF
}

case "${1:-}" in
    -h|--help)
        print_help
        exit 0
        ;;
esac

exec "$LEGACY_SCRIPT" "$@"
