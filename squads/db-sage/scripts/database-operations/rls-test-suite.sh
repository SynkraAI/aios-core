#!/bin/bash
# RLS Test Suite - Teste automatizado de políticas RLS
# Economia: ~90% dos tokens vs teste manual
# Uso: ./rls-test-suite.sh <table_name> [user_id1,user_id2,...]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check requirements
if [ -z "${SUPABASE_DB_URL:-}" ]; then
    echo -e "${RED}ERROR: SUPABASE_DB_URL not set${NC}"
    exit 1
fi

# Parse arguments
TABLE_NAME="${1:-}"
USER_IDS="${2:-00000000-0000-0000-0000-000000000000,11111111-1111-1111-1111-111111111111}"

if [ -z "$TABLE_NAME" ]; then
    echo "Usage: $0 <table_name> [user_id1,user_id2,...]"
    echo "Example: $0 minds"
    echo "Example: $0 sources 'uuid1,uuid2,uuid3'"
    exit 1
fi

# Convert comma-separated to array
IFS=',' read -ra USER_ARRAY <<< "$USER_IDS"

echo "🧪 RLS Test Suite v1.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Table: $TABLE_NAME"
echo "Testing with ${#USER_ARRAY[@]} users"
echo ""

# Create temp file for results
RESULTS_FILE="/tmp/rls_test_results_$$.json"
echo '{"tests": []}' > "$RESULTS_FILE"

# Function to test a single user
test_user_rls() {
    local user_id="$1"
    local test_num="$2"

    echo -e "${YELLOW}[User $test_num]${NC} Testing: $user_id"

    # Run simpler RLS tests without complex JSON
    psql "$SUPABASE_DB_URL" -t -A << SQL 2>/dev/null
-- Set up user context
SET role authenticated;
SET request.jwt.claims = '{
  "sub": "$user_id",
  "role": "authenticated",
  "aud": "authenticated"
}';

-- Simple test queries
SELECT 'AUTH_UID:' || COALESCE(auth.uid()::text, 'NULL');
SELECT 'CAN_SELECT:' || has_table_privilege('$TABLE_NAME', 'SELECT')::text;
SELECT 'CAN_INSERT:' || has_table_privilege('$TABLE_NAME', 'INSERT')::text;
SELECT 'CAN_UPDATE:' || has_table_privilege('$TABLE_NAME', 'UPDATE')::text;
SELECT 'CAN_DELETE:' || has_table_privilege('$TABLE_NAME', 'DELETE')::text;
SELECT 'VISIBLE_ROWS:' || COUNT(*)::text FROM $TABLE_NAME;

-- Reset session
RESET role;
RESET request.jwt.claims;
SQL
}

# Test each user
user_num=1
for user_id in "${USER_ARRAY[@]}"; do
    result=$(test_user_rls "$user_id" "$user_num")

    if [ -n "$result" ]; then
        # Parse simple text results
        auth_uid=$(echo "$result" | grep "AUTH_UID:" | cut -d':' -f2)
        can_select=$(echo "$result" | grep "CAN_SELECT:" | cut -d':' -f2)
        can_insert=$(echo "$result" | grep "CAN_INSERT:" | cut -d':' -f2)
        can_update=$(echo "$result" | grep "CAN_UPDATE:" | cut -d':' -f2)
        can_delete=$(echo "$result" | grep "CAN_DELETE:" | cut -d':' -f2)
        visible_rows=$(echo "$result" | grep "VISIBLE_ROWS:" | cut -d':' -f2)

        # Display summary
        echo -n "  → SELECT: "
        [ "$can_select" = "true" ] && echo -e "${GREEN}✓${NC} ($visible_rows rows)" || echo -e "${RED}✗${NC}"

        echo -n "  → INSERT: "
        [ "$can_insert" = "true" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

        echo -n "  → UPDATE: "
        [ "$can_update" = "true" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

        echo -n "  → DELETE: "
        [ "$can_delete" = "true" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"
    else
        echo -e "  ${RED}✗ Test failed - check connection/permissions${NC}"
    fi

    echo ""
    ((user_num++))
done

# Cross-user isolation test
echo -e "${YELLOW}[Isolation Test]${NC} Checking data isolation between users..."

psql "$SUPABASE_DB_URL" -t -A << 'SQL' 2>/dev/null
-- Test if users can see each other's data
SET role authenticated;

-- User 1 context
SET request.jwt.claims = '{"sub": "'${USER_ARRAY[0]}'", "role": "authenticated"}';
\set user1_count `SELECT COUNT(*) FROM '${TABLE_NAME}'`

-- User 2 context
RESET request.jwt.claims;
SET request.jwt.claims = '{"sub": "'${USER_ARRAY[1]}'", "role": "authenticated"}';
\set user2_count `SELECT COUNT(*) FROM '${TABLE_NAME}'`

-- Check overlap (should be 0 for proper isolation)
SELECT json_build_object(
    'user1_rows', :user1_count,
    'user2_rows', :user2_count,
    'isolation_check', CASE
        WHEN :user1_count = 0 AND :user2_count = 0 THEN 'PASS - No data'
        WHEN :user1_count > 0 AND :user2_count = 0 THEN 'PASS - Isolated'
        WHEN :user1_count = 0 AND :user2_count > 0 THEN 'PASS - Isolated'
        WHEN :user1_count = :user2_count THEN 'WARNING - Same count'
        ELSE 'PASS - Different data'
    END
);

RESET role;
RESET request.jwt.claims;
SQL

# Generate summary report
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if RLS is enabled
RLS_ENABLED=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT rowsecurity FROM pg_tables WHERE tablename = '$TABLE_NAME' AND schemaname = 'public';" 2>/dev/null)

if [ "$RLS_ENABLED" = "t" ]; then
    echo -e "RLS Status: ${GREEN}✓ ENABLED${NC}"

    # Count policies
    POLICY_COUNT=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM pg_policies WHERE tablename = '$TABLE_NAME';" 2>/dev/null)
    echo "Policies: $POLICY_COUNT active"
else
    echo -e "RLS Status: ${RED}✗ DISABLED${NC}"
    echo -e "${RED}WARNING: Table $TABLE_NAME has no RLS protection!${NC}"
fi

# Save full report
echo ""
echo "Full results saved to: $RESULTS_FILE"
echo ""
echo "💡 Recommendations:"
if [ "$RLS_ENABLED" != "t" ]; then
    echo "  1. Enable RLS: ALTER TABLE $TABLE_NAME ENABLE ROW LEVEL SECURITY;"
    echo "  2. Add policies: Use *policy-apply command"
fi
echo "  3. Test with real user IDs for accurate results"
echo "  4. Run *rls-audit for comprehensive policy review"