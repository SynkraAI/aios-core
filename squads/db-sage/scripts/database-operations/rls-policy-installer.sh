#!/bin/bash
# RLS Policy Installer - Apply standardized RLS policies to tables
# Economia: ~80% dos tokens vs criação manual de políticas
# Uso: ./rls-policy-installer.sh <table_name> <policy_type> [owner_column]

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
TABLE_NAME="${1:-}"
POLICY_TYPE="${2:-}"
OWNER_COLUMN="${3:-creator_mind_id}"

if [ -z "$TABLE_NAME" ] || [ -z "$POLICY_TYPE" ]; then
    echo "Usage: $0 <table_name> <policy_type> [owner_column]"
    echo ""
    echo "Policy types:"
    echo "  kiss       - Simple KISS policy (all operations check owner)"
    echo "  read-only  - Public read, owner write"
    echo "  private    - Owner only for all operations"
    echo "  team       - Team-based access with roles"
    echo "  custom     - Interactive custom policy builder"
    echo ""
    echo "Examples:"
    echo "  $0 minds kiss"
    echo "  $0 sources read-only user_id"
    echo "  $0 fragments private owner_id"
    exit 1
fi

echo "🔐 RLS Policy Installer v1.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Table: $TABLE_NAME"
echo "Policy Type: $POLICY_TYPE"
echo "Owner Column: $OWNER_COLUMN"
echo ""

# Step 1: Validate table exists
echo -e "${BLUE}[1/5] Validating table...${NC}"

TABLE_EXISTS=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$TABLE_NAME');" 2>/dev/null)

if [ "$TABLE_EXISTS" != "t" ]; then
    echo -e "${RED}ERROR: Table '$TABLE_NAME' does not exist${NC}"
    exit 1
fi

# Check if owner column exists
COLUMN_EXISTS=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '$TABLE_NAME' AND column_name = '$OWNER_COLUMN');" 2>/dev/null)

if [ "$COLUMN_EXISTS" != "t" ]; then
    echo -e "${YELLOW}WARNING: Column '$OWNER_COLUMN' not found in table${NC}"
    echo "Available columns:"
    psql "$SUPABASE_DB_URL" -t -A -c "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '$TABLE_NAME' ORDER BY ordinal_position;" 2>/dev/null | head -10
    echo ""
    read -p "Enter correct owner column name (or press Enter to skip): " NEW_COLUMN
    if [ -n "$NEW_COLUMN" ]; then
        OWNER_COLUMN="$NEW_COLUMN"
    fi
fi

echo -e "  ${GREEN}✓ Table validated${NC}"

# Step 2: Check current RLS status
echo -e "${BLUE}[2/5] Checking current RLS status...${NC}"

RLS_ENABLED=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = '$TABLE_NAME';" 2>/dev/null)
EXISTING_POLICIES=$(psql "$SUPABASE_DB_URL" -t -A -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = '$TABLE_NAME';" 2>/dev/null)

if [ "$RLS_ENABLED" = "t" ]; then
    echo -e "  RLS Status: ${GREEN}ENABLED${NC}"
    echo "  Existing Policies: $EXISTING_POLICIES"

    if [ "$EXISTING_POLICIES" -gt 0 ]; then
        echo ""
        echo "  Current policies:"
        psql "$SUPABASE_DB_URL" -t -A -c "SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = '$TABLE_NAME';" 2>/dev/null | sed 's/|/ - /g' | sed 's/^/    /'

        echo ""
        read -p "  Remove existing policies? (y/N): " REMOVE_EXISTING
        if [ "${REMOVE_EXISTING,,}" = "y" ]; then
            REMOVE_POLICIES=true
        else
            REMOVE_POLICIES=false
        fi
    fi
else
    echo -e "  RLS Status: ${YELLOW}DISABLED${NC}"
    REMOVE_POLICIES=false
fi

# Step 3: Generate policy SQL
echo -e "${BLUE}[3/5] Generating policy SQL...${NC}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
POLICY_FILE="/tmp/rls_policy_${TABLE_NAME}_${TIMESTAMP}.sql"

cat > "$POLICY_FILE" << SQL
-- RLS Policy Installation for $TABLE_NAME
-- Type: $POLICY_TYPE
-- Generated: $(date)
-- ============================================

BEGIN;

-- Enable RLS if not already enabled
ALTER TABLE $TABLE_NAME ENABLE ROW LEVEL SECURITY;

SQL

# Remove existing policies if requested
if [ "$REMOVE_POLICIES" = true ]; then
    cat >> "$POLICY_FILE" << SQL

-- Remove existing policies
DO \$\$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = '$TABLE_NAME'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON $TABLE_NAME', pol.policyname);
    END LOOP;
END \$\$;

SQL
fi

# Add policies based on type
case "$POLICY_TYPE" in
    "kiss")
        cat >> "$POLICY_FILE" << SQL

-- KISS Policy: Simple owner-based access
CREATE POLICY "${TABLE_NAME}_kiss_policy"
ON $TABLE_NAME
FOR ALL
TO authenticated
USING (
    $OWNER_COLUMN = auth.uid()
    OR
    $OWNER_COLUMN IS NULL  -- Allow NULL for initial inserts
)
WITH CHECK (
    $OWNER_COLUMN = auth.uid()
    OR
    $OWNER_COLUMN IS NULL  -- Auto-set on insert
);

-- Service role bypass (for admin operations)
CREATE POLICY "${TABLE_NAME}_service_role_bypass"
ON $TABLE_NAME
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

SQL
        ;;

    "read-only")
        cat >> "$POLICY_FILE" << SQL

-- Read-Only Policy: Public read, owner write

-- Everyone can read
CREATE POLICY "${TABLE_NAME}_public_read"
ON $TABLE_NAME
FOR SELECT
TO authenticated
USING (true);

-- Only owners can insert
CREATE POLICY "${TABLE_NAME}_owner_insert"
ON $TABLE_NAME
FOR INSERT
TO authenticated
WITH CHECK ($OWNER_COLUMN = auth.uid());

-- Only owners can update their records
CREATE POLICY "${TABLE_NAME}_owner_update"
ON $TABLE_NAME
FOR UPDATE
TO authenticated
USING ($OWNER_COLUMN = auth.uid())
WITH CHECK ($OWNER_COLUMN = auth.uid());

-- Only owners can delete their records
CREATE POLICY "${TABLE_NAME}_owner_delete"
ON $TABLE_NAME
FOR DELETE
TO authenticated
USING ($OWNER_COLUMN = auth.uid());

SQL
        ;;

    "private")
        cat >> "$POLICY_FILE" << SQL

-- Private Policy: Owner-only access for all operations

-- Owners can select their records
CREATE POLICY "${TABLE_NAME}_owner_select"
ON $TABLE_NAME
FOR SELECT
TO authenticated
USING ($OWNER_COLUMN = auth.uid());

-- Owners can insert
CREATE POLICY "${TABLE_NAME}_owner_insert"
ON $TABLE_NAME
FOR INSERT
TO authenticated
WITH CHECK ($OWNER_COLUMN = auth.uid() OR $OWNER_COLUMN IS NULL);

-- Owners can update their records
CREATE POLICY "${TABLE_NAME}_owner_update"
ON $TABLE_NAME
FOR UPDATE
TO authenticated
USING ($OWNER_COLUMN = auth.uid())
WITH CHECK ($OWNER_COLUMN = auth.uid());

-- Owners can delete their records
CREATE POLICY "${TABLE_NAME}_owner_delete"
ON $TABLE_NAME
FOR DELETE
TO authenticated
USING ($OWNER_COLUMN = auth.uid());

SQL
        ;;

    "team")
        cat >> "$POLICY_FILE" << SQL

-- Team Policy: Role-based access with team membership

-- Team members can read
CREATE POLICY "${TABLE_NAME}_team_read"
ON $TABLE_NAME
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.team_id = (
            SELECT team_id FROM $TABLE_NAME t
            WHERE t.id = $TABLE_NAME.id
        )
    )
);

-- Team admins can insert
CREATE POLICY "${TABLE_NAME}_team_insert"
ON $TABLE_NAME
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'owner')
        AND tm.team_id = NEW.team_id
    )
);

-- Team admins can update
CREATE POLICY "${TABLE_NAME}_team_update"
ON $TABLE_NAME
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'owner')
        AND tm.team_id = OLD.team_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'owner')
        AND tm.team_id = NEW.team_id
    )
);

-- Team owners can delete
CREATE POLICY "${TABLE_NAME}_team_delete"
ON $TABLE_NAME
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = auth.uid()
        AND tm.role = 'owner'
        AND tm.team_id = OLD.team_id
    )
);

SQL
        ;;

    "custom")
        echo "  Interactive custom policy builder:"
        echo ""

        # Get operations
        read -p "  Allow SELECT? (y/N): " ALLOW_SELECT
        read -p "  Allow INSERT? (y/N): " ALLOW_INSERT
        read -p "  Allow UPDATE? (y/N): " ALLOW_UPDATE
        read -p "  Allow DELETE? (y/N): " ALLOW_DELETE

        # Build custom policies
        if [ "${ALLOW_SELECT,,}" = "y" ]; then
            cat >> "$POLICY_FILE" << SQL

CREATE POLICY "${TABLE_NAME}_custom_select"
ON $TABLE_NAME
FOR SELECT
TO authenticated
USING ($OWNER_COLUMN = auth.uid());

SQL
        fi

        if [ "${ALLOW_INSERT,,}" = "y" ]; then
            cat >> "$POLICY_FILE" << SQL

CREATE POLICY "${TABLE_NAME}_custom_insert"
ON $TABLE_NAME
FOR INSERT
TO authenticated
WITH CHECK ($OWNER_COLUMN = auth.uid());

SQL
        fi

        if [ "${ALLOW_UPDATE,,}" = "y" ]; then
            cat >> "$POLICY_FILE" << SQL

CREATE POLICY "${TABLE_NAME}_custom_update"
ON $TABLE_NAME
FOR UPDATE
TO authenticated
USING ($OWNER_COLUMN = auth.uid())
WITH CHECK ($OWNER_COLUMN = auth.uid());

SQL
        fi

        if [ "${ALLOW_DELETE,,}" = "y" ]; then
            cat >> "$POLICY_FILE" << SQL

CREATE POLICY "${TABLE_NAME}_custom_delete"
ON $TABLE_NAME
FOR DELETE
TO authenticated
USING ($OWNER_COLUMN = auth.uid());

SQL
        fi
        ;;

    *)
        echo -e "${RED}ERROR: Unknown policy type: $POLICY_TYPE${NC}"
        exit 1
        ;;
esac

# Add verification queries
cat >> "$POLICY_FILE" << SQL

-- Verify policies were created
DO \$\$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = '$TABLE_NAME';

    RAISE NOTICE 'Created % policies for table $TABLE_NAME', policy_count;
END \$\$;

COMMIT;

-- Test queries (run these manually to verify)
-- SET role authenticated;
-- SET request.jwt.claims = '{"sub": "test-user-id", "role": "authenticated"}';
-- SELECT * FROM $TABLE_NAME LIMIT 1;
-- RESET role;
-- RESET request.jwt.claims;
SQL

echo -e "  ${GREEN}✓ Policy SQL generated${NC}"

# Step 4: Apply policies
echo -e "${BLUE}[4/5] Applying policies...${NC}"

psql "$SUPABASE_DB_URL" -f "$POLICY_FILE" > /tmp/policy_install_log_$$.txt 2>&1

if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓ Policies applied successfully${NC}"
else
    echo -e "  ${RED}✗ Failed to apply policies${NC}"
    echo "  Error log:"
    tail -20 /tmp/policy_install_log_$$.txt | sed 's/^/    /'
    exit 1
fi

# Step 5: Test policies
echo -e "${BLUE}[5/5] Testing policies...${NC}"

# Quick validation test
TEST_RESULT=$(psql "$SUPABASE_DB_URL" -t -A << SQL 2>/dev/null
-- Check RLS is enabled
SELECT json_build_object(
    'rls_enabled', (SELECT rowsecurity FROM pg_tables WHERE tablename = '$TABLE_NAME'),
    'policy_count', (SELECT COUNT(*) FROM pg_policies WHERE tablename = '$TABLE_NAME'),
    'policies', (
        SELECT json_agg(json_build_object(
            'name', policyname,
            'operation', cmd,
            'type', CASE WHEN permissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END
        ))
        FROM pg_policies
        WHERE tablename = '$TABLE_NAME'
    )
);
SQL
)

# Display results
if [ -n "$TEST_RESULT" ]; then
    RLS_STATUS=$(echo "$TEST_RESULT" | jq -r '.rls_enabled')
    POLICY_COUNT=$(echo "$TEST_RESULT" | jq -r '.policy_count')

    if [ "$RLS_STATUS" = "true" ] && [ "$POLICY_COUNT" -gt 0 ]; then
        echo -e "  ${GREEN}✓ RLS enabled with $POLICY_COUNT policies${NC}"
    else
        echo -e "  ${YELLOW}⚠ Verification needed${NC}"
    fi
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Policy Installation Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Files created:"
echo "  • Policy SQL: $POLICY_FILE"
echo "  • Install log: /tmp/policy_install_log_$$.txt"
echo ""
echo "🧪 Next steps:"
echo "  1. Test with real user: ./rls-test-suite.sh $TABLE_NAME"
echo "  2. Run full audit: *rls-audit"
echo "  3. Monitor performance: ./explain-analyzer.sh \"SELECT * FROM $TABLE_NAME\""
echo ""
echo "📋 Applied policies:"
echo "$TEST_RESULT" | jq -r '.policies[] | "  • \(.name): \(.operation) (\(.type))"' 2>/dev/null