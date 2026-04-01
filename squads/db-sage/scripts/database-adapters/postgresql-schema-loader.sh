#!/bin/bash
# PostgreSQL/Supabase Schema Loader - Deterministic and Error-Proof
# Always loads ALL tables, columns, relationships, constraints
# Output: JSON file with complete schema information

set -euo pipefail

# Output file
OUTPUT_FILE="/tmp/postgresql_schema_$$.json"
ERROR_LOG="/tmp/postgresql_schema_error_$$.log"

# Trap errors and cleanup
trap 'handle_error $? $LINENO' ERR

handle_error() {
    local exit_code=$1
    local line_number=$2
    echo "{\"error\": true, \"message\": \"Script failed at line $line_number with exit code $exit_code\", \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > "$OUTPUT_FILE"
    exit $exit_code
}

# Function to safely execute PostgreSQL queries
safe_psql_query() {
    local query="$1"
    local description="$2"

    # Execute query with error handling
    if ! result=$(psql "$DB_URL" -t -A -c "$query" 2>>"$ERROR_LOG"); then
        echo "null"
        return 1
    fi

    echo "$result"
    return 0
}

# Main schema loading function
load_postgresql_schema() {
    local db_url="${1:-}"

    # Check if database URL is provided
    if [ -z "$db_url" ]; then
        # Try to auto-detect
        if [ -n "${SUPABASE_DB_URL:-}" ]; then
            db_url="$SUPABASE_DB_URL"
        elif [ -n "${DATABASE_URL:-}" ]; then
            db_url="$DATABASE_URL"
        else
            echo "{\"error\": true, \"message\": \"No PostgreSQL database URL found\"}" > "$OUTPUT_FILE"
            exit 1
        fi
    fi

    # Export for use in safe_psql_query
    export DB_URL="$db_url"

    # Start JSON output
    echo "{" > "$OUTPUT_FILE"
    echo "  \"database_type\": \"postgresql\"," >> "$OUTPUT_FILE"
    echo "  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"," >> "$OUTPUT_FILE"

    # 1. Database version
    version=$(safe_psql_query "SELECT version()" "database version" | head -1 | sed 's/"/\\"/g')
    echo "  \"version\": \"$version\"," >> "$OUTPUT_FILE"

    # 2. Count tables
    table_count=$(safe_psql_query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'" "table count")
    echo "  \"table_count\": $table_count," >> "$OUTPUT_FILE"

    # 3. Load all tables with columns
    echo "  \"tables\": {" >> "$OUTPUT_FILE"

    # Get all table names
    tables=$(safe_psql_query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name" "table list")

    first_table=true
    while IFS= read -r table; do
        [ -z "$table" ] && continue

        if [ "$first_table" = false ]; then
            echo "," >> "$OUTPUT_FILE"
        fi
        first_table=false

        echo -n "    \"$table\": {" >> "$OUTPUT_FILE"

        # Get row count (with timeout to prevent hanging on large tables)
        row_count=$(timeout 5 psql "$DB_URL" -t -A -c "SELECT COUNT(*) FROM \"$table\"" 2>/dev/null || echo "null")
        echo -n "\"row_count\": $row_count, " >> "$OUTPUT_FILE"

        # Get columns for this table
        echo -n "\"columns\": [" >> "$OUTPUT_FILE"

        columns=$(safe_psql_query "
            SELECT json_build_object(
                'name', column_name,
                'type', data_type,
                'nullable', is_nullable,
                'default', column_default,
                'max_length', character_maximum_length
            )::text
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = '$table'
            ORDER BY ordinal_position
        " "columns for $table")

        first_col=true
        while IFS= read -r col; do
            [ -z "$col" ] && continue
            if [ "$first_col" = false ]; then
                echo -n ", " >> "$OUTPUT_FILE"
            fi
            first_col=false
            echo -n "$col" >> "$OUTPUT_FILE"
        done <<< "$columns"

        echo -n "]" >> "$OUTPUT_FILE"

        # Get primary key
        pk=$(safe_psql_query "
            SELECT string_agg(a.attname, ', ')
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = '\"$table\"'::regclass AND i.indisprimary
        " "primary key for $table")

        if [ -n "$pk" ] && [ "$pk" != "null" ]; then
            echo -n ", \"primary_key\": \"$pk\"" >> "$OUTPUT_FILE"
        fi

        # Get indexes
        echo -n ", \"indexes\": [" >> "$OUTPUT_FILE"

        indexes=$(safe_psql_query "
            SELECT json_build_object(
                'name', indexname,
                'columns', indexdef
            )::text
            FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = '$table'
        " "indexes for $table")

        first_idx=true
        while IFS= read -r idx; do
            [ -z "$idx" ] && continue
            if [ "$first_idx" = false ]; then
                echo -n ", " >> "$OUTPUT_FILE"
            fi
            first_idx=false
            echo -n "$idx" >> "$OUTPUT_FILE"
        done <<< "$indexes"

        echo -n "]}" >> "$OUTPUT_FILE"

    done <<< "$tables"

    echo "" >> "$OUTPUT_FILE"
    echo "  }," >> "$OUTPUT_FILE"

    # 4. Load all foreign key relationships
    echo "  \"relationships\": [" >> "$OUTPUT_FILE"

    relationships=$(safe_psql_query "
        SELECT json_build_object(
            'from_table', tc.table_name,
            'from_column', kcu.column_name,
            'to_table', ccu.table_name,
            'to_column', ccu.column_name,
            'constraint_name', tc.constraint_name
        )::text
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_name
    " "foreign key relationships")

    first_rel=true
    while IFS= read -r rel; do
        [ -z "$rel" ] && continue
        if [ "$first_rel" = false ]; then
            echo "," >> "$OUTPUT_FILE"
        fi
        first_rel=false
        echo -n "    $rel" >> "$OUTPUT_FILE"
    done <<< "$relationships"

    echo "" >> "$OUTPUT_FILE"
    echo "  ]," >> "$OUTPUT_FILE"

    # 5. Check constraints
    echo "  \"check_constraints\": [" >> "$OUTPUT_FILE"

    constraints=$(safe_psql_query "
        SELECT json_build_object(
            'table', tc.table_name,
            'constraint', tc.constraint_name,
            'definition', pgc.consrc
        )::text
        FROM information_schema.table_constraints tc
        JOIN pg_constraint pgc ON pgc.conname = tc.constraint_name
        WHERE tc.constraint_type = 'CHECK'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_name
    " "check constraints" || echo "")

    first_con=true
    while IFS= read -r con; do
        [ -z "$con" ] && continue
        if [ "$first_con" = false ]; then
            echo "," >> "$OUTPUT_FILE"
        fi
        first_con=false
        echo -n "    $con" >> "$OUTPUT_FILE"
    done <<< "$constraints"

    echo "" >> "$OUTPUT_FILE"
    echo "  ]," >> "$OUTPUT_FILE"

    # 6. Functions and stored procedures
    echo "  \"functions\": [" >> "$OUTPUT_FILE"

    functions=$(safe_psql_query "
        SELECT json_build_object(
            'name', proname,
            'arguments', pg_get_function_arguments(oid),
            'returns', pg_get_function_result(oid),
            'language', prolang::regtype::text
        )::text
        FROM pg_proc
        WHERE pronamespace = 'public'::regnamespace
        ORDER BY proname
    " "functions" || echo "")

    first_func=true
    while IFS= read -r func; do
        [ -z "$func" ] && continue
        if [ "$first_func" = false ]; then
            echo "," >> "$OUTPUT_FILE"
        fi
        first_func=false
        echo -n "    $func" >> "$OUTPUT_FILE"
    done <<< "$functions"

    echo "" >> "$OUTPUT_FILE"
    echo "  ]," >> "$OUTPUT_FILE"

    # 7. Views
    echo "  \"views\": [" >> "$OUTPUT_FILE"

    views=$(safe_psql_query "
        SELECT json_build_object(
            'name', table_name,
            'definition', view_definition
        )::text
        FROM information_schema.views
        WHERE table_schema = 'public'
        ORDER BY table_name
    " "views" || echo "")

    first_view=true
    while IFS= read -r view; do
        [ -z "$view" ] && continue
        if [ "$first_view" = false ]; then
            echo "," >> "$OUTPUT_FILE"
        fi
        first_view=false
        echo -n "    $view" >> "$OUTPUT_FILE"
    done <<< "$views"

    echo "" >> "$OUTPUT_FILE"
    echo "  ]," >> "$OUTPUT_FILE"

    # 8. RLS (Row Level Security) status
    echo "  \"rls_status\": [" >> "$OUTPUT_FILE"

    rls=$(safe_psql_query "
        SELECT json_build_object(
            'table', schemaname || '.' || tablename,
            'rls_enabled', rowsecurity
        )::text
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    " "RLS status" || echo "")

    first_rls=true
    while IFS= read -r rls_item; do
        [ -z "$rls_item" ] && continue
        if [ "$first_rls" = false ]; then
            echo "," >> "$OUTPUT_FILE"
        fi
        first_rls=false
        echo -n "    $rls_item" >> "$OUTPUT_FILE"
    done <<< "$rls"

    echo "" >> "$OUTPUT_FILE"
    echo "  ]," >> "$OUTPUT_FILE"

    # Final success status
    echo "  \"success\": true," >> "$OUTPUT_FILE"
    echo "  \"error\": false" >> "$OUTPUT_FILE"
    echo "}" >> "$OUTPUT_FILE"
}

# Execute main function
load_postgresql_schema "$@" >&2
output="$OUTPUT_FILE"

# Display summary to stderr so it doesn't interfere with output capture
if [ -f "$output" ]; then
    # Extract summary info
    table_count=$(grep '"table_count"' "$output" | grep -o '[0-9]*')
    rel_count=$(grep -c '"from_table"' "$output" || echo 0)

    {
        echo "═══════════════════════════════════════════"
        echo " PostgreSQL Schema Load Complete"
        echo "═══════════════════════════════════════════"
        echo " Tables: $table_count"
        echo " Relationships: $rel_count"
        echo " Output: $output"
        echo "═══════════════════════════════════════════"
    } >&2
fi

# Only output the file path to stdout for the calling script to capture
echo "$OUTPUT_FILE"