#!/bin/bash
# Data Loader - Safe data import for PostgreSQL/Supabase
# Economia: ~80% dos tokens vs importação manual
# Uso: ./data-loader.sh <file> <table> [options]

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
DATA_FILE="${1:-}"
TARGET_TABLE="${2:-}"
MODE="${3:-safe}"  # safe|fast|upsert

if [ -z "$DATA_FILE" ] || [ -z "$TARGET_TABLE" ]; then
    echo "Usage: $0 <file> <table> [mode]"
    echo ""
    echo "Modes:"
    echo "  safe   - Use staging table, validate, then merge (default)"
    echo "  fast   - Direct COPY, no validation"
    echo "  upsert - Update existing, insert new (requires id column)"
    echo ""
    echo "Supported formats:"
    echo "  .csv   - CSV with header"
    echo "  .json  - JSON array or JSONL"
    echo "  .sql   - SQL INSERT statements"
    echo ""
    echo "Examples:"
    echo "  $0 users.csv users"
    echo "  $0 data.json minds safe"
    echo "  $0 backup.sql sources fast"
    exit 1
fi

if [ ! -f "$DATA_FILE" ]; then
    echo -e "${RED}ERROR: File not found: $DATA_FILE${NC}"
    exit 1
fi

# Detect file format
FILE_EXT="${DATA_FILE##*.}"
FILE_SIZE=$(du -h "$DATA_FILE" | cut -f1)
LINE_COUNT=$(wc -l < "$DATA_FILE")
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
STAGING_TABLE="${TARGET_TABLE}_staging_${TIMESTAMP}"

echo "📤 Data Loader v1.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "File: $DATA_FILE ($FILE_SIZE, $LINE_COUNT lines)"
echo "Target: $TARGET_TABLE"
echo "Mode: $MODE"
echo "Format: $FILE_EXT"
echo ""

# Step 1: Analyze target table
echo -e "${BLUE}[1/5] Analyzing target table...${NC}"

TABLE_INFO=$(psql "$SUPABASE_DB_URL" -t -A << SQL 2>/dev/null
SELECT json_build_object(
    'exists', EXISTS(
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = '$TARGET_TABLE'
    ),
    'row_count', (
        SELECT COUNT(*) FROM $TARGET_TABLE
    ),
    'columns', (
        SELECT json_agg(json_build_object(
            'name', column_name,
            'type', data_type,
            'nullable', is_nullable = 'YES',
            'default', column_default
        ) ORDER BY ordinal_position)
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '$TARGET_TABLE'
    )
);
SQL
)

if [ -z "$TABLE_INFO" ] || [ "$TABLE_INFO" = "null" ]; then
    echo -e "${RED}ERROR: Table $TARGET_TABLE does not exist${NC}"
    exit 1
fi

CURRENT_ROWS=$(echo "$TABLE_INFO" | jq -r '.row_count // 0')
echo "  Current rows: $CURRENT_ROWS"

# Step 2: Prepare data based on format
echo -e "${BLUE}[2/5] Preparing data...${NC}"

case "$FILE_EXT" in
    "csv")
        # Get column names from CSV header
        CSV_COLUMNS=$(head -1 "$DATA_FILE")
        echo "  CSV columns: $CSV_COLUMNS"

        if [ "$MODE" = "safe" ]; then
            echo "  Creating staging table..."

            # Create staging table with same structure
            psql "$SUPABASE_DB_URL" << SQL
-- Create staging table
CREATE TABLE $STAGING_TABLE (LIKE $TARGET_TABLE INCLUDING ALL);

-- Copy CSV data to staging
\\COPY $STAGING_TABLE FROM '$DATA_FILE' WITH (FORMAT CSV, HEADER TRUE, DELIMITER ',');

-- Show import stats
SELECT
    '$STAGING_TABLE' as staging_table,
    COUNT(*) as rows_imported
FROM $STAGING_TABLE;
SQL
        elif [ "$MODE" = "fast" ]; then
            echo "  Direct COPY to target table..."

            psql "$SUPABASE_DB_URL" << SQL
-- Direct copy (fast but risky)
\\COPY $TARGET_TABLE FROM '$DATA_FILE' WITH (FORMAT CSV, HEADER TRUE, DELIMITER ',');
SQL
        fi
        ;;

    "json"|"jsonl")
        echo "  Processing JSON data..."

        # Create temp SQL file for JSON import
        TEMP_SQL="/tmp/json_import_${TIMESTAMP}.sql"

        if [ "$FILE_EXT" = "json" ]; then
            # JSON array format
            cat > "$TEMP_SQL" << 'SQL'
-- Import JSON array
WITH json_data AS (
    SELECT json_array_elements('
SQL
            cat "$DATA_FILE" >> "$TEMP_SQL"
            cat >> "$TEMP_SQL" << SQL
'::json) as data
)
INSERT INTO $TARGET_TABLE
SELECT (data->>'id')::uuid as id,
       -- Add more field mappings here based on your JSON structure
       data->>'name' as name,
       (data->>'created_at')::timestamp as created_at
FROM json_data;
SQL
        else
            # JSONL format (one JSON object per line)
            echo "INSERT INTO $TARGET_TABLE SELECT * FROM json_populate_recordset(NULL::$TARGET_TABLE, '[" > "$TEMP_SQL"
            sed 's/$/,/' "$DATA_FILE" | sed '$ s/,$//' >> "$TEMP_SQL"
            echo "]');" >> "$TEMP_SQL"
        fi

        # Execute JSON import
        psql "$SUPABASE_DB_URL" < "$TEMP_SQL"
        rm -f "$TEMP_SQL"
        ;;

    "sql")
        echo "  Executing SQL file..."

        if [ "$MODE" = "safe" ]; then
            # Wrap in transaction
            psql "$SUPABASE_DB_URL" << SQL
BEGIN;
\\i $DATA_FILE
COMMIT;
SQL
        else
            psql "$SUPABASE_DB_URL" < "$DATA_FILE"
        fi
        ;;

    *)
        echo -e "${RED}ERROR: Unsupported file format: $FILE_EXT${NC}"
        exit 1
        ;;
esac

# Step 3: Validate data (for safe mode)
if [ "$MODE" = "safe" ] && [ "$FILE_EXT" = "csv" ]; then
    echo -e "${BLUE}[3/5] Validating data...${NC}"

    VALIDATION=$(psql "$SUPABASE_DB_URL" -t -A << SQL 2>/dev/null
-- Validation checks
SELECT json_build_object(
    'total_rows', (SELECT COUNT(*) FROM $STAGING_TABLE),
    'null_ids', (SELECT COUNT(*) FROM $STAGING_TABLE WHERE id IS NULL),
    'duplicates', (
        SELECT COUNT(*) FROM (
            SELECT id, COUNT(*) as cnt
            FROM $STAGING_TABLE
            GROUP BY id
            HAVING COUNT(*) > 1
        ) t
    ),
    'conflicts', (
        SELECT COUNT(*)
        FROM $STAGING_TABLE s
        JOIN $TARGET_TABLE t ON s.id = t.id
    )
);
SQL
)

    TOTAL_ROWS=$(echo "$VALIDATION" | jq -r '.total_rows')
    NULL_IDS=$(echo "$VALIDATION" | jq -r '.null_ids')
    DUPLICATES=$(echo "$VALIDATION" | jq -r '.duplicates')
    CONFLICTS=$(echo "$VALIDATION" | jq -r '.conflicts')

    echo "  Total rows: $TOTAL_ROWS"
    echo "  Null IDs: $NULL_IDS"
    echo "  Duplicates: $DUPLICATES"
    echo "  Conflicts: $CONFLICTS"

    if [ "$NULL_IDS" -gt 0 ] || [ "$DUPLICATES" -gt 0 ]; then
        echo -e "${YELLOW}⚠ Data quality issues detected${NC}"

        read -p "Continue anyway? (y/N): " CONTINUE
        if [ "${CONTINUE,,}" != "y" ]; then
            echo "Import cancelled. Cleaning up..."
            psql "$SUPABASE_DB_URL" -c "DROP TABLE IF EXISTS $STAGING_TABLE;"
            exit 1
        fi
    fi
fi

# Step 4: Merge data (for safe mode)
if [ "$MODE" = "safe" ] && [ "$FILE_EXT" = "csv" ]; then
    echo -e "${BLUE}[4/5] Merging data...${NC}"

    if [ "$CONFLICTS" -gt 0 ]; then
        echo "  Handling conflicts with UPSERT..."

        psql "$SUPABASE_DB_URL" << SQL
-- UPSERT: Update existing, insert new
INSERT INTO $TARGET_TABLE
SELECT * FROM $STAGING_TABLE
ON CONFLICT (id) DO UPDATE SET
    -- Update all columns except id
    updated_at = EXCLUDED.updated_at,
    -- Add more columns as needed
    name = EXCLUDED.name
WHERE $TARGET_TABLE.updated_at < EXCLUDED.updated_at;  -- Only update if newer

-- Clean up staging
DROP TABLE $STAGING_TABLE;
SQL
    else
        echo "  No conflicts, inserting all rows..."

        psql "$SUPABASE_DB_URL" << SQL
-- Simple insert
INSERT INTO $TARGET_TABLE
SELECT * FROM $STAGING_TABLE;

-- Clean up staging
DROP TABLE $STAGING_TABLE;
SQL
    fi
elif [ "$MODE" = "upsert" ]; then
    echo -e "${BLUE}[4/5] Performing UPSERT...${NC}"

    # For upsert mode with direct file
    case "$FILE_EXT" in
        "csv")
            psql "$SUPABASE_DB_URL" << SQL
-- Create temp table for upsert
CREATE TEMP TABLE temp_import (LIKE $TARGET_TABLE INCLUDING ALL);

-- Import to temp
\\COPY temp_import FROM '$DATA_FILE' WITH (FORMAT CSV, HEADER TRUE, DELIMITER ',');

-- UPSERT
INSERT INTO $TARGET_TABLE
SELECT * FROM temp_import
ON CONFLICT (id) DO UPDATE SET
    updated_at = EXCLUDED.updated_at
    -- Add more columns as needed
;

DROP TABLE temp_import;
SQL
            ;;
    esac
fi

# Step 5: Verify import
echo -e "${BLUE}[5/5] Verifying import...${NC}"

FINAL_ROWS=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM $TARGET_TABLE;" 2>/dev/null)
ROWS_ADDED=$((FINAL_ROWS - CURRENT_ROWS))

echo "  Initial rows: $CURRENT_ROWS"
echo "  Final rows: $FINAL_ROWS"
echo "  Rows added: $ROWS_ADDED"

# Generate summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$ROWS_ADDED" -gt 0 ]; then
    echo -e "${GREEN}✅ Import Success!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 Summary:"
    echo "  • Imported: $ROWS_ADDED rows"
    echo "  • Table: $TARGET_TABLE"
    echo "  • Total rows: $FINAL_ROWS"

    # Sample imported data
    echo ""
    echo "📝 Sample imported data:"
    psql "$SUPABASE_DB_URL" -c "SELECT * FROM $TARGET_TABLE ORDER BY created_at DESC LIMIT 3;"

elif [ "$MODE" = "safe" ]; then
    echo -e "${YELLOW}⚠ No rows imported${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Possible reasons:"
    echo "  • All rows already exist (duplicates)"
    echo "  • Data validation failed"
    echo "  • File format mismatch"
else
    echo -e "${GREEN}✅ Import completed${NC}"
fi

echo ""
echo "🔧 Next steps:"
echo "  1. Verify data: SELECT * FROM $TARGET_TABLE LIMIT 10;"
echo "  2. Check constraints: *health-checker"
echo "  3. Update indexes: ./index-manager.sh analyze $TARGET_TABLE"