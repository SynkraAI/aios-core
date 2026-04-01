#!/bin/bash
# Explain Analyzer - Analyze query performance with automatic recommendations
# Economia: ~85% dos tokens vs análise manual
# Uso: ./explain-analyzer.sh "<query>" [--format json|text] [--buffers] [--analyze]

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check requirements
DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
if [ -z "$DB_URL" ]; then
    echo -e "${RED}ERROR: SUPABASE_DB_URL or DATABASE_URL not set${NC}"
    exit 1
fi

# Parse arguments
QUERY="${1:-}"
FORMAT="text"
USE_BUFFERS=false
USE_ANALYZE=false

if [ -z "$QUERY" ]; then
    echo "Usage: $0 \"<query>\" [--format json|text] [--buffers] [--analyze]"
    echo "Example: $0 \"SELECT * FROM minds WHERE creator_mind_id = 'uuid'\""
    echo "Example: $0 \"SELECT * FROM sources JOIN fragments ON ...\" --analyze --buffers"
    exit 1
fi

# Parse flags
shift
while [ $# -gt 0 ]; do
    case "$1" in
        --format)
            shift
            FORMAT="$1"
            ;;
        --buffers)
            USE_BUFFERS=true
            ;;
        --analyze)
            USE_ANALYZE=true
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
    shift || true
done

# Build EXPLAIN command
EXPLAIN_CMD="EXPLAIN "
if [ "$USE_ANALYZE" = true ]; then
    EXPLAIN_CMD+="(ANALYZE true, "
else
    EXPLAIN_CMD+="("
fi
if [ "$USE_BUFFERS" = true ]; then
    EXPLAIN_CMD+="BUFFERS true, "
fi
EXPLAIN_CMD+="FORMAT JSON) "

echo "🔍 Query Performance Analyzer v1.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Run EXPLAIN
echo -e "${BLUE}Running EXPLAIN analysis...${NC}"

EXPLAIN_RESULT=$(psql "$DB_URL" -t -A << SQL 2>/dev/null
${EXPLAIN_CMD}${QUERY}
SQL
)

if [ -z "$EXPLAIN_RESULT" ]; then
    echo -e "${RED}ERROR: Failed to analyze query${NC}"
    exit 1
fi

# Step 2: Extract metrics from JSON
PLAN=$(echo "$EXPLAIN_RESULT" | jq -r '.[0].Plan' 2>/dev/null)

if [ -z "$PLAN" ] || [ "$PLAN" = "null" ]; then
    echo -e "${RED}ERROR: Could not parse EXPLAIN output${NC}"
    echo "Raw output:"
    echo "$EXPLAIN_RESULT"
    exit 1
fi

# Extract key metrics
TOTAL_COST=$(echo "$PLAN" | jq -r '.["Total Cost"] // .["cost"] // 0' 2>/dev/null)
STARTUP_COST=$(echo "$PLAN" | jq -r '.["Startup Cost"] // .["startup_cost"] // 0' 2>/dev/null)
PLAN_ROWS=$(echo "$PLAN" | jq -r '.["Plan Rows"] // .["rows"] // 0' 2>/dev/null)
PLAN_WIDTH=$(echo "$PLAN" | jq -r '.["Plan Width"] // .["width"] // 0' 2>/dev/null)
NODE_TYPE=$(echo "$PLAN" | jq -r '.["Node Type"] // "Unknown"' 2>/dev/null)

# If ANALYZE was used, get actual metrics
if [ "$USE_ANALYZE" = true ]; then
    ACTUAL_ROWS=$(echo "$PLAN" | jq -r '.["Actual Rows"] // 0' 2>/dev/null)
    ACTUAL_TIME=$(echo "$PLAN" | jq -r '.["Actual Total Time"] // 0' 2>/dev/null)
    ACTUAL_LOOPS=$(echo "$PLAN" | jq -r '.["Actual Loops"] // 1' 2>/dev/null)
fi

# Step 3: Analyze for issues
echo ""
echo -e "${CYAN}📊 Query Metrics:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Node Type: $NODE_TYPE"
echo "  Total Cost: $TOTAL_COST"
echo "  Estimated Rows: $PLAN_ROWS"

if [ "$USE_ANALYZE" = true ]; then
    echo "  Actual Rows: $ACTUAL_ROWS"
    echo "  Execution Time: ${ACTUAL_TIME}ms"

    # Check estimation accuracy
    if [ "$PLAN_ROWS" -gt 0 ] && [ "$ACTUAL_ROWS" -gt 0 ]; then
        ESTIMATION_RATIO=$(echo "scale=2; $ACTUAL_ROWS / $PLAN_ROWS" | bc 2>/dev/null || echo "1")
        if (( $(echo "$ESTIMATION_RATIO > 10" | bc -l) )) || (( $(echo "$ESTIMATION_RATIO < 0.1" | bc -l) )); then
            echo -e "  ${YELLOW}⚠ Poor estimation accuracy (${ESTIMATION_RATIO}x off)${NC}"
        fi
    fi
fi

# Step 4: Detect performance issues
echo ""
echo -e "${CYAN}🔎 Performance Analysis:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ISSUES_FOUND=0
RECOMMENDATIONS=()

# Check for sequential scans on large tables
if echo "$EXPLAIN_RESULT" | grep -q "Seq Scan"; then
    TABLE_NAME=$(echo "$EXPLAIN_RESULT" | jq -r '.. | select(.["Node Type"]? == "Seq Scan") | .["Relation Name"] // "unknown"' 2>/dev/null | head -1)
    echo -e "  ${YELLOW}⚠ Sequential Scan detected on: $TABLE_NAME${NC}"
    RECOMMENDATIONS+=("Consider adding an index on frequently queried columns of $TABLE_NAME")
    ((ISSUES_FOUND++))
fi

# Check for missing indexes on joins
if echo "$EXPLAIN_RESULT" | grep -q "Nested Loop" && [ "$TOTAL_COST" -gt 1000 ]; then
    echo -e "  ${YELLOW}⚠ Expensive Nested Loop Join detected${NC}"
    RECOMMENDATIONS+=("Consider adding indexes on join columns")
    ((ISSUES_FOUND++))
fi

# Check for sorts without indexes
if echo "$EXPLAIN_RESULT" | grep -q "Sort" && ! echo "$EXPLAIN_RESULT" | grep -q "Index Scan"; then
    echo -e "  ${YELLOW}⚠ Sort without index detected${NC}"
    RECOMMENDATIONS+=("Consider adding an index on ORDER BY columns")
    ((ISSUES_FOUND++))
fi

# Check for high cost operations
if (( $(echo "$TOTAL_COST > 10000" | bc -l) )); then
    echo -e "  ${RED}⚠ Very high query cost: $TOTAL_COST${NC}"
    RECOMMENDATIONS+=("Query may need significant optimization")
    ((ISSUES_FOUND++))
fi

# Check buffer usage if available
if [ "$USE_BUFFERS" = true ]; then
    SHARED_HIT=$(echo "$EXPLAIN_RESULT" | jq -r '.. | .["Shared Hit Blocks"]? // 0' | awk '{s+=$1} END {print s}')
    SHARED_READ=$(echo "$EXPLAIN_RESULT" | jq -r '.. | .["Shared Read Blocks"]? // 0' | awk '{s+=$1} END {print s}')

    if [ "$SHARED_READ" -gt 0 ] && [ "$SHARED_HIT" -gt 0 ]; then
        HIT_RATIO=$(echo "scale=2; $SHARED_HIT / ($SHARED_HIT + $SHARED_READ) * 100" | bc 2>/dev/null || echo "0")
        echo "  Buffer Cache Hit Ratio: ${HIT_RATIO}%"

        if (( $(echo "$HIT_RATIO < 90" | bc -l) )); then
            echo -e "  ${YELLOW}⚠ Low cache hit ratio${NC}"
            RECOMMENDATIONS+=("Consider increasing shared_buffers or warming cache")
            ((ISSUES_FOUND++))
        fi
    fi
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "  ${GREEN}✓ No major performance issues detected${NC}"
fi

# Step 5: Index suggestions
echo ""
echo -e "${CYAN}🔧 Index Analysis:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Extract table names from query
TABLES=$(echo "$QUERY" | grep -oE 'FROM\s+(\w+)|JOIN\s+(\w+)' | awk '{print $2}' | sort -u)

if [ -n "$TABLES" ]; then
    for TABLE in $TABLES; do
        # Check existing indexes
        INDEX_COUNT=$(psql "$DB_URL" -t -A -c "SELECT COUNT(*) FROM pg_indexes WHERE tablename = '$TABLE';" 2>/dev/null || echo "0")
        echo "  Table: $TABLE (${INDEX_COUNT} indexes)"

        # Check if table appears in WHERE clause
        if echo "$QUERY" | grep -q "WHERE.*$TABLE"; then
            WHERE_COLUMNS=$(echo "$QUERY" | grep -oE "$TABLE\.\w+|WHERE\s+\w+" | grep -oE '\w+$' | sort -u)
            if [ -n "$WHERE_COLUMNS" ]; then
                echo "    → Check indexes on WHERE columns: $WHERE_COLUMNS"
            fi
        fi
    done
else
    echo "  Unable to extract table names from query"
fi

# Step 6: Generate recommendations
if [ ${#RECOMMENDATIONS[@]} -gt 0 ]; then
    echo ""
    echo -e "${CYAN}💡 Recommendations:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    i=1
    for rec in "${RECOMMENDATIONS[@]}"; do
        echo "  $i. $rec"
        ((i++))
    done
fi

# Step 7: Generate optimization script
if [ $ISSUES_FOUND -gt 0 ]; then
    OPTIMIZE_SCRIPT="/tmp/optimize_query_$(date +%Y%m%d_%H%M%S).sql"

    echo "" > "$OPTIMIZE_SCRIPT"
    echo "-- Query Optimization Suggestions" >> "$OPTIMIZE_SCRIPT"
    echo "-- Generated: $(date)" >> "$OPTIMIZE_SCRIPT"
    echo "" >> "$OPTIMIZE_SCRIPT"
    echo "-- Original Query:" >> "$OPTIMIZE_SCRIPT"
    echo "-- $QUERY" >> "$OPTIMIZE_SCRIPT"
    echo "" >> "$OPTIMIZE_SCRIPT"

    # Add index creation templates
    for TABLE in $TABLES; do
        echo "-- Index suggestions for $TABLE:" >> "$OPTIMIZE_SCRIPT"
        echo "-- CREATE INDEX idx_${TABLE}_column ON $TABLE (column_name);" >> "$OPTIMIZE_SCRIPT"
        echo "" >> "$OPTIMIZE_SCRIPT"
    done

    echo "-- Run ANALYZE after creating indexes:" >> "$OPTIMIZE_SCRIPT"
    echo "-- ANALYZE $TABLES;" >> "$OPTIMIZE_SCRIPT"

    echo ""
    echo "  Optimization script saved to: $OPTIMIZE_SCRIPT"
fi

# Step 8: Output full plan if requested
if [ "$FORMAT" = "json" ]; then
    echo ""
    echo -e "${CYAN}📋 Full Execution Plan (JSON):${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$EXPLAIN_RESULT" | jq '.'
elif [ "$FORMAT" = "text" ] && [ $ISSUES_FOUND -gt 0 ]; then
    echo ""
    echo -e "${CYAN}📋 Query Plan Tree:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Re-run with text format for readability
    psql "$DB_URL" << SQL 2>/dev/null | head -30
EXPLAIN (COSTS, FORMAT TEXT) ${QUERY};
SQL
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ Query Performance: GOOD${NC}"
else
    echo -e "${YELLOW}⚠ Query Performance: NEEDS OPTIMIZATION${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review recommendations above"
    echo "  2. Test with ANALYZE for actual metrics: $0 \"$QUERY\" --analyze"
    echo "  3. Create missing indexes"
    echo "  4. Re-test after optimization"
fi
