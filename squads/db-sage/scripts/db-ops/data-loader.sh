#!/usr/bin/env bash
# =============================================================================
# data-loader.sh - CSV and Seed Loader (Worker Script)
# =============================================================================
# execution_type: Worker
# pattern: EXEC-W-001
# tasks: db-load-csv, db-seed
# token_savings: 88%
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Defaults
DB_URL=""
DRY_RUN=false
VALIDATE=false
VERBOSE=false
DELIMITER=","
IMPORT_MODE="safe"
ENVIRONMENT=""
MODE=""
TABLE_REF=""
DATA_FILE=""
SEED_FILE=""
TABLE_SCHEMA="public"
TABLE_NAME=""
QUALIFIED_TABLE=""
QUALIFIED_STAGING=""

declare -a TEMP_FILES=()
declare -a HEADER_COLUMNS=()
declare -a PRIMARY_KEY_COLUMNS=()
declare -a NON_PRIMARY_COLUMNS=()

usage() {
    cat << EOF
Usage:
  $(basename "$0") [OPTIONS] <table> <csv_file>
  $(basename "$0") [OPTIONS] --seed <sql_file>
  $(basename "$0") [OPTIONS] <sql_file>

Load CSV data into PostgreSQL/Supabase or apply seed SQL safely.

CSV OPTIONS:
  --mode <safe|fast|upsert>  Import strategy (default: safe)
  --delimiter <char>         CSV delimiter (default: ,)

SEED OPTIONS:
  --seed <path>              Treat input as seed SQL file
  --env <name>               Label target environment for logging

COMMON OPTIONS:
  --dry-run                  Execute inside rollback
  --validate                 Run extra safety validation before execution
  -v, --verbose              Verbose output
  -h, --help                 Show this help

EXAMPLES:
  $(basename "$0") users data/users.csv
  $(basename "$0") users data/users.csv --delimiter '|'
  $(basename "$0") users data/users.csv --dry-run
  $(basename "$0") --seed supabase/seeds/dev.sql
  $(basename "$0") supabase/seeds/dev.sql --validate --dry-run

ENVIRONMENT:
  SUPABASE_DB_URL or DATABASE_URL  Required. PostgreSQL connection string.
EOF
}

log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

cleanup() {
    local file
    for file in "${TEMP_FILES[@]}"; do
        [[ -e "$file" ]] && rm -f "$file"
    done
}

trap cleanup EXIT

register_temp_file() {
    TEMP_FILES+=("$1")
}

escape_sql_literal() {
    printf '%s' "$1" | sed "s/'/''/g"
}

quote_ident() {
    printf '"%s"' "$1"
}

join_sql_list() {
    local joined=""
    local item
    for item in "$@"; do
        if [[ -n "$joined" ]]; then
            joined+=", "
        fi
        joined+="$item"
    done
    printf '%s' "$joined"
}

quoted_identifier_list() {
    local quoted_columns=()
    local column
    for column in "$@"; do
        quoted_columns+=("$(quote_ident "$column")")
    done
    join_sql_list "${quoted_columns[@]}"
}

array_contains() {
    local needle="$1"
    shift
    local item
    for item in "$@"; do
        [[ "$item" == "$needle" ]] && return 0
    done
    return 1
}

check_env() {
    DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
    if [[ -z "$DB_URL" ]]; then
        log_error "SUPABASE_DB_URL or DATABASE_URL not set"
        exit 1
    fi
}

validate_identifier() {
    local value="$1"
    if [[ ! "$value" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
        log_error "Invalid SQL identifier: $value"
        exit 1
    fi
}

resolve_table_reference() {
    TABLE_SCHEMA="public"
    TABLE_NAME="$1"

    if [[ "$1" == *.* ]]; then
        TABLE_SCHEMA="${1%%.*}"
        TABLE_NAME="${1##*.}"
    fi

    validate_identifier "$TABLE_SCHEMA"
    validate_identifier "$TABLE_NAME"
    QUALIFIED_TABLE="$(quote_ident "$TABLE_SCHEMA").$(quote_ident "$TABLE_NAME")"
}

resolve_absolute_path() {
    local input_path="$1"
    if [[ "$input_path" = /* ]]; then
        printf '%s' "$input_path"
    else
        printf '%s/%s' "$(pwd)" "$input_path"
    fi
}

collect_header_columns() {
    local header_line raw_column column

    header_line=$(head -n 1 "$DATA_FILE" | tr -d '\r')
    if [[ -z "$header_line" ]]; then
        log_error "CSV header is empty: $DATA_FILE"
        exit 1
    fi

    HEADER_COLUMNS=()
    IFS="$DELIMITER" read -r -a raw_columns <<< "$header_line"

    for raw_column in "${raw_columns[@]}"; do
        column=$(printf '%s' "$raw_column" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        column="${column#\"}"
        column="${column%\"}"
        validate_identifier "$column"
        HEADER_COLUMNS+=("$column")
    done

    if [[ "${#HEADER_COLUMNS[@]}" -eq 0 ]]; then
        log_error "No columns detected in CSV header"
        exit 1
    fi
}

load_primary_key_columns() {
    PRIMARY_KEY_COLUMNS=()

    while IFS= read -r column; do
        [[ -n "$column" ]] && PRIMARY_KEY_COLUMNS+=("$column")
    done < <(
        psql "$DB_URL" -t -A <<SQL
SELECT a.attname
FROM pg_index i
JOIN pg_class c ON c.oid = i.indrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
WHERE i.indisprimary
  AND n.nspname = '$TABLE_SCHEMA'
  AND c.relname = '$TABLE_NAME'
ORDER BY array_position(i.indkey, a.attnum);
SQL
    )
}

validate_table_exists() {
    local exists
    exists=$(psql "$DB_URL" -t -A <<SQL
SELECT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = '$TABLE_SCHEMA'
    AND table_name = '$TABLE_NAME'
);
SQL
    )

    if [[ "$exists" != "t" ]]; then
        log_error "Table not found: $TABLE_SCHEMA.$TABLE_NAME"
        exit 1
    fi
}

validate_csv_inputs() {
    local available_columns missing_columns="" column

    if [[ ! -f "$DATA_FILE" ]]; then
        log_error "CSV file not found: $DATA_FILE"
        exit 1
    fi

    validate_table_exists
    collect_header_columns

    available_columns=$(psql "$DB_URL" -t -A <<SQL
SELECT column_name
FROM information_schema.columns
WHERE table_schema = '$TABLE_SCHEMA'
  AND table_name = '$TABLE_NAME'
ORDER BY ordinal_position;
SQL
    )

    for column in "${HEADER_COLUMNS[@]}"; do
        if ! printf '%s\n' "$available_columns" | grep -Fxq "$column"; then
            if [[ -n "$missing_columns" ]]; then
                missing_columns+=", "
            fi
            missing_columns+="$column"
        fi
    done

    if [[ -n "$missing_columns" ]]; then
        log_error "CSV columns not found in $TABLE_SCHEMA.$TABLE_NAME: $missing_columns"
        exit 1
    fi
}

build_column_lists() {
    local column quoted_columns=()

    for column in "${HEADER_COLUMNS[@]}"; do
        quoted_columns+=("$(quote_ident "$column")")
    done
    COLUMN_LIST_SQL=$(join_sql_list "${quoted_columns[@]}")

    NON_PRIMARY_COLUMNS=()
    for column in "${HEADER_COLUMNS[@]}"; do
        if ! array_contains "$column" "${PRIMARY_KEY_COLUMNS[@]}"; then
            NON_PRIMARY_COLUMNS+=("$column")
        fi
    done
}

build_merge_sql() {
    local conflict_columns=()
    local update_assignments=()
    local column primary_key_present=true

    if [[ "${#PRIMARY_KEY_COLUMNS[@]}" -eq 0 ]]; then
        log_warning "No primary key detected; falling back to INSERT"
        printf 'INSERT INTO %s (%s) SELECT %s FROM %s' \
            "$QUALIFIED_TABLE" "$COLUMN_LIST_SQL" "$COLUMN_LIST_SQL" "$QUALIFIED_STAGING"
        return
    fi

    for column in "${PRIMARY_KEY_COLUMNS[@]}"; do
        if ! array_contains "$column" "${HEADER_COLUMNS[@]}"; then
            primary_key_present=false
            break
        fi
        conflict_columns+=("$(quote_ident "$column")")
    done

    if [[ "$primary_key_present" != true ]]; then
        log_warning "CSV payload does not include the full primary key; falling back to INSERT"
        printf 'INSERT INTO %s (%s) SELECT %s FROM %s' \
            "$QUALIFIED_TABLE" "$COLUMN_LIST_SQL" "$COLUMN_LIST_SQL" "$QUALIFIED_STAGING"
        return
    fi

    if [[ "${#NON_PRIMARY_COLUMNS[@]}" -eq 0 ]]; then
        printf 'INSERT INTO %s (%s) SELECT %s FROM %s ON CONFLICT (%s) DO NOTHING' \
            "$QUALIFIED_TABLE" \
            "$COLUMN_LIST_SQL" \
            "$COLUMN_LIST_SQL" \
            "$QUALIFIED_STAGING" \
            "$(join_sql_list "${conflict_columns[@]}")"
        return
    fi

    for column in "${NON_PRIMARY_COLUMNS[@]}"; do
        update_assignments+=("$(quote_ident "$column") = EXCLUDED.$(quote_ident "$column")")
    done

    printf 'INSERT INTO %s (%s) SELECT %s FROM %s ON CONFLICT (%s) DO UPDATE SET %s' \
        "$QUALIFIED_TABLE" \
        "$COLUMN_LIST_SQL" \
        "$COLUMN_LIST_SQL" \
        "$QUALIFIED_STAGING" \
        "$(join_sql_list "${conflict_columns[@]}")" \
        "$(join_sql_list "${update_assignments[@]}")"
}

write_csv_sql_file() {
    local sql_file="$1"
    local absolute_file escaped_file escaped_delimiter merge_sql

    absolute_file=$(resolve_absolute_path "$DATA_FILE")
    escaped_file=$(escape_sql_literal "$absolute_file")
    escaped_delimiter=$(escape_sql_literal "$DELIMITER")

    if [[ "$IMPORT_MODE" == "fast" ]]; then
        {
            echo "BEGIN;"
            printf "\\copy %s (%s) FROM '%s' WITH (FORMAT csv, HEADER true, DELIMITER '%s')\n" \
                "$QUALIFIED_TABLE" "$COLUMN_LIST_SQL" "$escaped_file" "$escaped_delimiter"
            printf "SELECT COUNT(*) AS target_rows_after FROM %s;\n" "$QUALIFIED_TABLE"
            if $DRY_RUN; then
                echo "ROLLBACK;"
            else
                echo "COMMIT;"
            fi
        } > "$sql_file"
        return
    fi

    STAGING_TABLE="_db_sage_${TABLE_NAME}_$$"
    QUALIFIED_STAGING="$(quote_ident "$STAGING_TABLE")"
    merge_sql=$(build_merge_sql)

        {
            echo "BEGIN;"
            printf "CREATE TEMP TABLE %s (LIKE %s INCLUDING ALL) ON COMMIT DROP;\n" \
                "$QUALIFIED_STAGING" "$QUALIFIED_TABLE"
            printf "\\copy %s (%s) FROM '%s' WITH (FORMAT csv, HEADER true, DELIMITER '%s')\n" \
                "$QUALIFIED_STAGING" "$COLUMN_LIST_SQL" "$escaped_file" "$escaped_delimiter"
            printf "SELECT COUNT(*) AS staged_rows FROM %s;\n" "$QUALIFIED_STAGING"

        if [[ "${#PRIMARY_KEY_COLUMNS[@]}" -gt 0 ]]; then
            local pk_list_sql
            pk_list_sql=$(quoted_identifier_list "${PRIMARY_KEY_COLUMNS[@]}")
            printf "DO \$\$\nBEGIN\n"
            printf "  IF EXISTS (\n"
            printf "    SELECT 1\n"
            printf "    FROM (\n"
            printf "      SELECT %s\n" "$pk_list_sql"
            printf "      FROM %s\n" "$QUALIFIED_STAGING"
            printf "      GROUP BY %s\n" "$pk_list_sql"
            printf "      HAVING COUNT(*) > 1\n"
            printf "    ) duplicated_keys\n"
            printf "  ) THEN\n"
            printf "    RAISE EXCEPTION 'Duplicate primary key rows detected in CSV payload';\n"
            printf "  END IF;\n"
            printf "END\n\$\$;\n"
        fi

        printf "%s;\n" "$merge_sql"
        printf "SELECT COUNT(*) AS target_rows_after FROM %s;\n" "$QUALIFIED_TABLE"
        if $DRY_RUN; then
            echo "ROLLBACK;"
        else
            echo "COMMIT;"
        fi
    } > "$sql_file"
}

run_csv_import() {
    local sql_file
    local line_count

    if [[ "${#DELIMITER}" -ne 1 ]]; then
        log_error "Delimiter must be a single character"
        exit 1
    fi

    if $VALIDATE; then
        IMPORT_MODE="safe"
    fi

    case "$IMPORT_MODE" in
        safe|fast|upsert) ;;
        *)
            log_error "Invalid import mode: $IMPORT_MODE"
            exit 1
            ;;
    esac

    resolve_table_reference "$TABLE_REF"
    validate_csv_inputs
    load_primary_key_columns
    build_column_lists

    line_count=$(wc -l < "$DATA_FILE" | tr -d ' ')

    log_info "CSV file: $DATA_FILE"
    log_info "Target table: $TABLE_SCHEMA.$TABLE_NAME"
    log_info "Mode: $IMPORT_MODE"
    log_info "Header columns: $(join_sql_list "${HEADER_COLUMNS[@]}")"
    log_info "CSV rows (including header): $line_count"

    sql_file=$(mktemp "/tmp/db-sage-data-loader-XXXXXX.sql")
    register_temp_file "$sql_file"
    write_csv_sql_file "$sql_file"

    psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$sql_file"

    if $DRY_RUN; then
        log_warning "Dry-run complete. Changes were rolled back."
    else
        log_success "CSV load completed."
    fi
}

seed_has_explicit_transaction() {
    grep -Eiq '^[[:space:]]*(BEGIN|START[[:space:]]+TRANSACTION|COMMIT|ROLLBACK)\b' "$SEED_FILE"
}

validate_seed_inputs() {
    if [[ ! -f "$SEED_FILE" ]]; then
        log_error "Seed file not found: $SEED_FILE"
        exit 1
    fi

    if $VALIDATE; then
        if grep -Eiq '(^|[^A-Z_])(TRUNCATE|DELETE[[:space:]]+FROM)\b' "$SEED_FILE"; then
            log_error "Seed validation failed: destructive statements detected"
            exit 1
        fi

        if ! grep -Eiq 'ON[[:space:]]+CONFLICT|WHERE[[:space:]]+NOT[[:space:]]+EXISTS|MERGE[[:space:]]+INTO' "$SEED_FILE"; then
            log_warning "Seed file does not advertise an idempotent pattern (ON CONFLICT / WHERE NOT EXISTS / MERGE)"
        else
            log_success "Seed file exposes an idempotent pattern"
        fi
    fi
}

run_seed() {
    local sql_file

    validate_seed_inputs

    log_info "Seed file: $SEED_FILE"
    if [[ -n "$ENVIRONMENT" ]]; then
        log_info "Target environment: $ENVIRONMENT"
    fi
    if [[ "$ENVIRONMENT" == "production" || "$ENVIRONMENT" == "prod" ]]; then
        log_warning "Production seed requested. Ensure this was explicit."
    fi

    if seed_has_explicit_transaction; then
        if $DRY_RUN; then
            log_error "Dry-run is not supported when the seed file manages its own transaction"
            exit 1
        fi
        psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$SEED_FILE"
        log_success "Seed applied."
        return
    fi

    sql_file=$(mktemp "/tmp/db-sage-seed-loader-XXXXXX.sql")
    register_temp_file "$sql_file"

    {
        echo "BEGIN;"
        cat "$SEED_FILE"
        if $DRY_RUN; then
            echo "ROLLBACK;"
        else
            echo "COMMIT;"
        fi
    } > "$sql_file"

    psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$sql_file"

    if $DRY_RUN; then
        log_warning "Dry-run complete. Seed changes were rolled back."
    else
        log_success "Seed applied."
    fi
}

parse_args() {
    local positional=()

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --seed)
                SEED_FILE="${2:-}"
                MODE="seed"
                shift 2
                ;;
            --delimiter)
                DELIMITER="${2:-}"
                shift 2
                ;;
            --mode)
                IMPORT_MODE="${2:-}"
                shift 2
                ;;
            --env)
                ENVIRONMENT="${2:-}"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --validate)
                VALIDATE=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            --)
                shift
                while [[ $# -gt 0 ]]; do
                    positional+=("$1")
                    shift
                done
                ;;
            *)
                positional+=("$1")
                shift
                ;;
        esac
    done

    if [[ -n "$SEED_FILE" ]]; then
        if [[ "${#positional[@]}" -gt 0 ]]; then
            log_error "Unexpected positional arguments after --seed"
            exit 1
        fi
        return
    fi

    if [[ "${#positional[@]}" -eq 1 ]]; then
        if [[ -f "${positional[0]}" ]]; then
            MODE="seed"
            SEED_FILE="${positional[0]}"
            return
        fi
        log_error "Single positional argument must be a seed file path"
        exit 1
    fi

    if [[ "${#positional[@]}" -eq 2 ]]; then
        MODE="csv"
        TABLE_REF="${positional[0]}"
        DATA_FILE="${positional[1]}"
        return
    fi

    usage
    exit 1
}

main() {
    parse_args "$@"
    check_env

    case "$MODE" in
        csv)
            run_csv_import
            ;;
        seed)
            run_seed
            ;;
        *)
            usage
            exit 1
            ;;
    esac
}

main "$@"
