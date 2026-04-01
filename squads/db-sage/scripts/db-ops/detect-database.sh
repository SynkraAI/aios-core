#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LEGACY_SCRIPT="$SCRIPT_DIR/../database-adapters/detect-database.sh"

print_help() {
    cat <<'EOF'
Usage: detect-database.sh

Detect and test the PostgreSQL/Supabase connection configured for DB Sage.

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
