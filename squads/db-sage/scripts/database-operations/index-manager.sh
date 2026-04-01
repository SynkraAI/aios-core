#!/bin/bash
# Index Manager - Intelligent index management for PostgreSQL/Supabase
# Economia: ~75% dos tokens vs gestão manual
# Uso: ./index-manager.sh <action> [options]

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
ACTION="${1:-}"

if [ -z "$ACTION" ]; then
    echo "Usage: $0 <action> [options]"
    echo ""
    echo "Actions:"
    echo "  list [table]         - List all indexes or indexes for a specific table"
    echo "  analyze [table]      - Analyze index usage and suggest optimizations"
    echo "  create <table> <column> [type] - Create an index on specified column"
    echo "  drop <index_name>    - Drop an index (with safety check)"
    echo "  unused               - Find unused indexes"
    echo "  duplicate            - Find duplicate indexes"
    echo "  missing              - Find missing indexes based on queries"
    echo "  rebuild <index>      - Rebuild an index (REINDEX)"
    echo ""
    echo "Examples:"
    echo "  $0 list minds"
    echo "  $0 analyze"
    echo "  $0 create minds creator_mind_id btree"
    echo "  $0 unused"
    exit 1
fi

echo "📊 Index Manager v1.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

case "$ACTION" in
    "list")
        TABLE_NAME="${2:-}"

        if [ -n "$TABLE_NAME" ]; then
            echo -e "${CYAN}Indexes for table: $TABLE_NAME${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

            psql "$SUPABASE_DB_URL" << SQL
SELECT
    indexname as "Index Name",
    pg_size_pretty(pg_relation_size(indexname::regclass)) as "Size",
    CASE
        WHEN indexdef LIKE '%UNIQUE%' THEN '✓'
        ELSE ''
    END as "Unique",
    CASE
        WHEN indexdef LIKE '%USING btree%' THEN 'btree'
        WHEN indexdef LIKE '%USING hash%' THEN 'hash'
        WHEN indexdef LIKE '%USING gin%' THEN 'gin'
        WHEN indexdef LIKE '%USING gist%' THEN 'gist'
        ELSE 'other'
    END as "Type"
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = '$TABLE_NAME'
ORDER BY indexname;
SQL
        else
            echo -e "${CYAN}All indexes in database${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

            psql "$SUPABASE_DB_URL" << 'SQL'
SELECT
    schemaname || '.' || tablename as "Table",
    indexname as "Index",
    pg_size_pretty(pg_relation_size((schemaname||'.'||indexname)::regclass)) as "Size",
    CASE
        WHEN indexdef LIKE '%UNIQUE%' THEN 'UNIQUE'
        ELSE ''
    END as "Type"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname
LIMIT 50;

SELECT
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "",
    'Total: ' || COUNT(*) || ' indexes' as "",
    'Size: ' || pg_size_pretty(SUM(pg_relation_size((schemaname||'.'||indexname)::regclass))) as ""
FROM pg_indexes
WHERE schemaname = 'public';
SQL
        fi
        ;;

    "analyze")
        TABLE_NAME="${2:-}"

        echo -e "${CYAN}Index Usage Analysis${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        # Index usage statistics
        psql "$SUPABASE_DB_URL" << 'SQL'
-- Index usage statistics
WITH index_stats AS (
    SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size((schemaname||'.'||indexname)::regclass)) as index_size,
        pg_relation_size((schemaname||'.'||indexname)::regclass) as size_bytes
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
)
SELECT
    tablename as "Table",
    indexname as "Index",
    idx_scan as "Scans",
    CASE
        WHEN idx_scan = 0 THEN '❌ UNUSED'
        WHEN idx_scan < 100 THEN '⚠️  LOW USE'
        ELSE '✅ ACTIVE'
    END as "Status",
    index_size as "Size"
FROM index_stats
ORDER BY idx_scan ASC, size_bytes DESC
LIMIT 20;

-- Tables without indexes on foreign keys
\echo ''
\echo 'Foreign Keys Without Indexes:'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT
    tc.table_name as "Table",
    kcu.column_name as "FK Column",
    'CREATE INDEX idx_' || tc.table_name || '_' || kcu.column_name ||
    ' ON ' || tc.table_name || '(' || kcu.column_name || ');' as "Suggested Index"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indrelid = (tc.table_schema || '.' || tc.table_name)::regclass
      AND a.attname = kcu.column_name
  )
LIMIT 10;
SQL
        ;;

    "create")
        TABLE_NAME="${2:-}"
        COLUMN_NAME="${3:-}"
        INDEX_TYPE="${4:-btree}"

        if [ -z "$TABLE_NAME" ] || [ -z "$COLUMN_NAME" ]; then
            echo -e "${RED}ERROR: Table and column required${NC}"
            echo "Usage: $0 create <table> <column> [type]"
            exit 1
        fi

        INDEX_NAME="idx_${TABLE_NAME}_${COLUMN_NAME}"

        echo -e "${BLUE}Creating index: $INDEX_NAME${NC}"

        # Check if index already exists
        EXISTS=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM pg_indexes WHERE indexname = '$INDEX_NAME';" 2>/dev/null)

        if [ "$EXISTS" -gt 0 ]; then
            echo -e "${YELLOW}⚠ Index already exists${NC}"
            exit 0
        fi

        # Create index
        psql "$SUPABASE_DB_URL" << SQL
-- Create index with progress reporting
\timing on
CREATE INDEX CONCURRENTLY IF NOT EXISTS ${INDEX_NAME}
ON ${TABLE_NAME} USING ${INDEX_TYPE} (${COLUMN_NAME});

-- Analyze table to update statistics
ANALYZE ${TABLE_NAME};

-- Show new index info
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as size,
    indexdef
FROM pg_indexes
WHERE indexname = '${INDEX_NAME}';
SQL

        echo -e "${GREEN}✓ Index created successfully${NC}"
        ;;

    "drop")
        INDEX_NAME="${2:-}"

        if [ -z "$INDEX_NAME" ]; then
            echo -e "${RED}ERROR: Index name required${NC}"
            exit 1
        fi

        echo -e "${YELLOW}Preparing to drop index: $INDEX_NAME${NC}"

        # Check index usage before dropping
        USAGE=$(psql "$SUPABASE_DB_URL" -t -A << SQL 2>/dev/null
SELECT idx_scan
FROM pg_stat_user_indexes
WHERE indexname = '$INDEX_NAME';
SQL
        )

        if [ -n "$USAGE" ] && [ "$USAGE" -gt 1000 ]; then
            echo -e "${YELLOW}⚠ Warning: This index has been used $USAGE times${NC}"
            read -p "Are you sure you want to drop it? (yes/no): " CONFIRM

            if [ "$CONFIRM" != "yes" ]; then
                echo "Drop cancelled"
                exit 0
            fi
        fi

        # Drop index
        psql "$SUPABASE_DB_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS $INDEX_NAME;"

        echo -e "${GREEN}✓ Index dropped${NC}"
        ;;

    "unused")
        echo -e "${CYAN}Unused Indexes (never scanned)${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
SELECT
    schemaname || '.' || tablename as "Table",
    indexname as "Index",
    pg_size_pretty(pg_relation_size((schemaname||'.'||indexname)::regclass)) as "Size",
    'DROP INDEX CONCURRENTLY ' || indexname || ';' as "Drop Command"
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexname NOT LIKE '%_pkey'  -- Don't suggest dropping primary keys
ORDER BY pg_relation_size((schemaname||'.'||indexname)::regclass) DESC;

-- Summary
SELECT
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "",
    COUNT(*) || ' unused indexes' as "",
    'Total size: ' || pg_size_pretty(SUM(pg_relation_size((schemaname||'.'||indexname)::regclass))) as ""
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexname NOT LIKE '%_pkey';
SQL
        ;;

    "duplicate")
        echo -e "${CYAN}Duplicate Indexes${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
-- Find duplicate indexes (same columns, same order)
WITH index_columns AS (
    SELECT
        n.nspname as schema_name,
        t.relname as table_name,
        i.relname as index_name,
        array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)) as column_names,
        pg_size_pretty(pg_relation_size(i.oid)) as index_size,
        ix.indisunique as is_unique,
        ix.indisprimary as is_primary
    FROM pg_index ix
    JOIN pg_class t ON t.oid = ix.indrelid
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE n.nspname = 'public'
    GROUP BY n.nspname, t.relname, i.relname, ix.indisunique, ix.indisprimary, i.oid
)
SELECT
    ic1.table_name as "Table",
    ic1.index_name as "Index 1",
    ic2.index_name as "Index 2",
    ic1.column_names::text as "Columns",
    ic1.index_size as "Size 1",
    ic2.index_size as "Size 2"
FROM index_columns ic1
JOIN index_columns ic2
    ON ic1.table_name = ic2.table_name
    AND ic1.column_names = ic2.column_names
    AND ic1.index_name < ic2.index_name
WHERE NOT (ic1.is_primary OR ic2.is_primary);  -- Don't suggest dropping primary keys
SQL
        ;;

    "missing")
        echo -e "${CYAN}Potentially Missing Indexes${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        psql "$SUPABASE_DB_URL" << 'SQL'
-- Find columns used in WHERE but not indexed
WITH missing_indexes AS (
    SELECT
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
    FROM pg_stats
    WHERE schemaname = 'public'
      AND n_distinct > 100  -- Only suggest for high-cardinality columns
      AND correlation < 0.5  -- Not well-correlated with physical order
      AND NOT EXISTS (
        SELECT 1
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid
        WHERE a.attname = attname
          AND a.attnum = ANY(i.indkey)
      )
)
SELECT
    tablename as "Table",
    attname as "Column",
    n_distinct::int as "Distinct Values",
    'CREATE INDEX idx_' || tablename || '_' || attname ||
    ' ON ' || tablename || '(' || attname || ');' as "Suggested Index"
FROM missing_indexes
ORDER BY n_distinct DESC
LIMIT 10;
SQL
        ;;

    "rebuild")
        INDEX_NAME="${2:-}"

        if [ -z "$INDEX_NAME" ]; then
            echo -e "${RED}ERROR: Index name required${NC}"
            exit 1
        fi

        echo -e "${BLUE}Rebuilding index: $INDEX_NAME${NC}"

        # Get size before rebuild
        SIZE_BEFORE=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT pg_size_pretty(pg_relation_size('$INDEX_NAME'::regclass));" 2>/dev/null)

        echo "Size before: $SIZE_BEFORE"
        echo "Rebuilding..."

        # Rebuild index
        psql "$SUPABASE_DB_URL" -c "REINDEX INDEX CONCURRENTLY $INDEX_NAME;"

        # Get size after rebuild
        SIZE_AFTER=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT pg_size_pretty(pg_relation_size('$INDEX_NAME'::regclass));" 2>/dev/null)

        echo "Size after: $SIZE_AFTER"
        echo -e "${GREEN}✓ Index rebuilt successfully${NC}"
        ;;

    *)
        echo -e "${RED}ERROR: Unknown action: $ACTION${NC}"
        exit 1
        ;;
esac