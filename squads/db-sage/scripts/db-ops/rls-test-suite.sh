#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LEGACY_SCRIPT="$SCRIPT_DIR/../database-operations/rls-test-suite.sh"

print_help() {
    cat <<'EOF'
Usage: rls-test-suite.sh <table_name> [user_id1,user_id2,...]

Run deterministic RLS smoke tests against a table.

EXAMPLES:
  rls-test-suite.sh minds
  rls-test-suite.sh sources "uuid1,uuid2,uuid3"

ENVIRONMENT:
  SUPABASE_DB_URL or DATABASE_URL  Required. PostgreSQL connection string.
EOF
}

if [[ -z "${SUPABASE_DB_URL:-}" && -n "${DATABASE_URL:-}" ]]; then
    export SUPABASE_DB_URL="$DATABASE_URL"
fi

case "${1:-}" in
    -h|--help)
        print_help
        exit 0
        ;;
esac

if [[ $# -eq 0 ]]; then
    print_help
    exit 1
fi

exec "$LEGACY_SCRIPT" "$@"
