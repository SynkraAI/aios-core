#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

print_help() {
    cat <<'EOF'
Usage: squad-integration-preflight.sh <squad_name_or_path> [--include-schema]

Scan a target squad for data touchpoints before the hybrid integration design
phase. This script inventories likely inputs, outputs, state artifacts, and
database-related references. Optionally it also samples the current live schema.

OPTIONS:
  --include-schema  Include a lightweight live schema summary when DB env is set
  -h, --help        Show this help

EXAMPLES:
  squad-integration-preflight.sh copy
  squad-integration-preflight.sh squads/copy --include-schema

ENVIRONMENT:
  SUPABASE_DB_URL or DATABASE_URL  Optional for --include-schema.
EOF
}

resolve_target_dir() {
    local target="$1"

    if [[ -d "$target" ]]; then
        printf '%s\n' "$target"
        return 0
    fi

    if [[ -d "$ROOT_DIR/$target" ]]; then
        printf '%s\n' "$ROOT_DIR/$target"
        return 0
    fi

    if [[ -d "$ROOT_DIR/squads/$target" ]]; then
        printf '%s\n' "$ROOT_DIR/squads/$target"
        return 0
    fi

    return 1
}

count_refs() {
    local pattern="$1"
    local dir="$2"
    rg -n "$pattern" "$dir" \
        -g '*.md' -g '*.yaml' -g '*.yml' -g '*.json' -g '*.js' -g '*.ts' -g '*.sh' \
        2>/dev/null | wc -l | tr -d ' '
}

list_sample_files() {
    local pattern="$1"
    local dir="$2"
    rg -l "$pattern" "$dir" \
        -g '*.md' -g '*.yaml' -g '*.yml' -g '*.json' -g '*.js' -g '*.ts' -g '*.sh' \
        2>/dev/null | head -5
}

TARGET=""
INCLUDE_SCHEMA=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --include-schema)
            INCLUDE_SCHEMA=true
            shift
            ;;
        -h|--help)
            print_help
            exit 0
            ;;
        *)
            if [[ -z "$TARGET" ]]; then
                TARGET="$1"
                shift
            else
                echo "ERROR: Unexpected argument: $1"
                print_help
                exit 1
            fi
            ;;
    esac
done

if [[ -z "$TARGET" ]]; then
    print_help
    exit 1
fi

if ! TARGET_DIR=$(resolve_target_dir "$TARGET"); then
    echo "ERROR: Could not resolve squad or path: $TARGET"
    exit 1
fi

SQUAD_NAME="$(basename "$TARGET_DIR")"
CONFIG_COUNT=$(find "$TARGET_DIR" -maxdepth 3 -type f \( -name '*.yaml' -o -name '*.yml' -o -name '*.json' -o -name '.env.example' \) 2>/dev/null | wc -l | tr -d ' ')
INPUT_REFS=$(count_refs 'inputs/|sources/|uploads/' "$TARGET_DIR")
OUTPUT_REFS=$(count_refs 'outputs/|generated/|artifacts/' "$TARGET_DIR")
STATE_REFS=$(count_refs 'state\.json|progress\.txt|handoff\.md|cache|runtime' "$TARGET_DIR")
DB_REFS=$(count_refs 'SUPABASE_DB_URL|DATABASE_URL|postgres|psql|migration|sql|db/' "$TARGET_DIR")

echo "=== SQUAD INTEGRATION PREFLIGHT ==="
echo "Target: $SQUAD_NAME"
echo "Path: $TARGET_DIR"
echo ""
echo "Config files:  $CONFIG_COUNT"
echo "Input refs:    $INPUT_REFS"
echo "Output refs:   $OUTPUT_REFS"
echo "State refs:    $STATE_REFS"
echo "DB refs:       $DB_REFS"
echo ""

echo "Sample data-touchpoint files:"
SAMPLES=$(list_sample_files 'inputs/|sources/|uploads/|outputs/|generated/|artifacts/|state\.json|SUPABASE_DB_URL|DATABASE_URL|migration|sql' "$TARGET_DIR")
if [[ -n "$SAMPLES" ]]; then
    while IFS= read -r sample; do
        [[ -n "$sample" ]] || continue
        echo "  - ${sample#$ROOT_DIR/}"
    done <<< "$SAMPLES"
else
    echo "  - No obvious data-touchpoint files found"
fi

if [[ "$INCLUDE_SCHEMA" == true ]]; then
    DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
    echo ""
    echo "Live schema summary:"
    if [[ -z "$DB_URL" ]]; then
        echo "  - Skipped (SUPABASE_DB_URL or DATABASE_URL not set)"
    else
        TABLE_COUNT=$(psql "$DB_URL" -t -A -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';" 2>/dev/null || echo "")
        FK_COUNT=$(psql "$DB_URL" -t -A -c "SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema='public' AND constraint_type='FOREIGN KEY';" 2>/dev/null || echo "")
        SAMPLE_TABLES=$(psql "$DB_URL" -t -A -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name LIMIT 5;" 2>/dev/null || echo "")

        if [[ -z "$TABLE_COUNT" ]]; then
            echo "  - Skipped (connection/query failed)"
        else
            echo "  - Tables: $TABLE_COUNT"
            echo "  - Foreign keys: ${FK_COUNT:-0}"
            if [[ -n "$SAMPLE_TABLES" ]]; then
                echo "  - Sample tables:"
                while IFS= read -r table; do
                    [[ -n "$table" ]] || continue
                    echo "    - $table"
                done <<< "$SAMPLE_TABLES"
            fi
        fi
    fi
fi
