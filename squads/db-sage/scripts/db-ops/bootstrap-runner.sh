#!/usr/bin/env bash
# =============================================================================
# bootstrap-runner.sh - Deterministic Supabase Project Bootstrap (Worker Script)
# =============================================================================
# execution_type: Worker
# pattern: EXEC-W-001
# tasks: db-bootstrap
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROFILE="standard"
PROJECT_NAME=""
FORCE=false

usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Create the standard DB Sage / Supabase project scaffold.

OPTIONS:
    --profile <minimal|standard|full>   Scaffold level (default: standard)
    --project-name <name>               Optional project name for comments
    --force                             Overwrite managed files
    -h, --help                          Show this help

EXAMPLES:
    $(basename "$0") --profile minimal
    $(basename "$0") --profile standard --project-name my-project
    $(basename "$0") --profile full --force
EOF
}

log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

write_managed_file() {
    local path="$1"
    local content="$2"

    mkdir -p "$(dirname "$path")"

    if [[ -f "$path" && "$FORCE" != true ]]; then
        log_warning "Skipping existing file: $path"
        return 0
    fi

    printf '%s\n' "$content" > "$path"
    log_success "Wrote $path"
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --profile)
            PROFILE="${2:-}"
            shift 2
            ;;
        --project-name)
            PROJECT_NAME="${2:-}"
            shift 2
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown argument: $1"
            usage
            exit 1
            ;;
    esac
done

case "$PROFILE" in
    minimal|standard|full) ;;
    *)
        log_error "Invalid profile: $PROFILE"
        usage
        exit 1
        ;;
esac

ROOT="supabase"
PROJECT_LABEL="${PROJECT_NAME:-current-project}"

log_info "Bootstrapping DB Sage structure"
log_info "Profile: $PROFILE"
log_info "Project: $PROJECT_LABEL"

mkdir -p "$ROOT"/{migrations,seeds,tests,rollback,snapshots,docs}
log_success "Created directory structure under $ROOT/"

if [[ "$PROFILE" == "standard" || "$PROFILE" == "full" ]]; then
    write_managed_file "$ROOT/migrations/README.md" "# Migrations

Naming: YYYYMMDDHHMMSS_description.sql

Recommended order inside each migration:
1. Extensions
2. Tables and constraints
3. Functions
4. Triggers
5. RLS enablement and policies
6. Views

Suggested workflow:
*verify-order migration.sql
*dry-run migration.sql
*snapshot pre_migration
*apply-migration migration.sql
*smoke-test
"

    write_managed_file "$ROOT/seeds/README.md" "# Seeds

Naming: YYYYMMDDHHMMSS_description_seed.sql

Keep seeds idempotent:
- prefer INSERT ... ON CONFLICT
- avoid destructive cleanup in shared environments
- test with *run-sql or *seed before production use
"

    write_managed_file "$ROOT/tests/README.md" "# Tests

Smoke tests should validate:
- tables exist
- RLS is enabled where expected
- policies are installed
- critical functions execute
- basic queries still work

Run with:
*smoke-test
"

    write_managed_file "$ROOT/rollback/README.md" "# Rollback

Automatic snapshots live in ../snapshots/.

Use explicit rollback scripts for complex migrations:
YYYYMMDDHHMMSS_rollback_description.sql
"

    write_managed_file "$ROOT/.gitignore" "# Local development
.branches
.temp

# OS noise
.DS_Store
Thumbs.db

# Optional local snapshots
# snapshots/*.sql
"

    write_managed_file "$ROOT/config.toml" "# Supabase local development config

[api]
enabled = true
port = 54321

[db]
port = 54322
shadow_port = 54320
major_version = 15

[db.pooler]
enabled = true
port = 54329
pool_mode = \"transaction\"

[studio]
enabled = true
port = 54323

[auth]
enabled = true
site_url = \"http://localhost:3000\"
"
fi

if [[ "$PROFILE" == "full" ]]; then
    write_managed_file "$ROOT/migrations/00000000000000_baseline.sql" "-- Baseline schema for $PROJECT_LABEL

BEGIN;

CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS \"Users can view own profile\" ON public.profiles;
CREATE POLICY \"Users can view own profile\"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS \"Users can update own profile\" ON public.profiles;
CREATE POLICY \"Users can update own profile\"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

COMMIT;
"
fi

echo ""
log_success "Bootstrap complete"
echo "Profile: $PROFILE"
echo "Root: $ROOT/"
echo ""
echo "Next steps:"
echo "  1. *env-check"
echo "  2. *domain-modeling"
echo "  3. *create-schema"
echo "  4. *smoke-test"
