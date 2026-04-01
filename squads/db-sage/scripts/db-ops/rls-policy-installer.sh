#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LEGACY_SCRIPT="$SCRIPT_DIR/../database-operations/rls-policy-installer.sh"

print_help() {
    cat <<'EOF'
Usage: rls-policy-installer.sh <table_name> <policy_type> [owner_column]

Apply canonical RLS policy templates to a PostgreSQL/Supabase table.

POLICY TYPES:
  kiss       Simple owner-based policy
  read-only  Public read, owner write
  private    Owner only
  team       Team-based access
  custom     Interactive policy builder

EXAMPLES:
  rls-policy-installer.sh minds kiss
  rls-policy-installer.sh sources read-only user_id
  rls-policy-installer.sh fragments private owner_id

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
