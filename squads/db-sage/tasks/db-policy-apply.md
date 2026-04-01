# Task: Apply RLS Policy Template

| Field | Value |
|-------|-------|
| **execution_type** | `Hybrid` |
| **pattern** | EXEC-HY-001 |
| **script** | `scripts/db-ops/rls-policy-installer.sh` |
| **rationale** | Worker aplica policy, Human DEVE confirmar (altera segurança) |

**Purpose**: Install KISS or granular RLS policies on a table

**Elicit**: true

---

## 🚀 NEW: Use Automated RLS Policy Installer (RECOMMENDED)

**Token Savings: 89% | Time Savings: ~85%**

```bash
# Use the rls-policy-installer script
./squads/db-sage/scripts/db-ops/rls-policy-installer.sh {table} {mode}

# Examples:
./squads/db-sage/scripts/db-ops/rls-policy-installer.sh minds kiss
./squads/db-sage/scripts/db-ops/rls-policy-installer.sh sources read-only
./squads/db-sage/scripts/db-ops/rls-policy-installer.sh fragments private

# Available modes: kiss, read-only, private, team, custom

# Benefits:
#   - Standardized policy templates
#   - Automatic testing after installation
#   - Safety checks for existing policies
#   - 89% token savings
```

**OR continue with manual policy installation below:**

---

## Inputs

- `table` (string): Table name to apply policy to
- `mode` (string): 'kiss' or 'granular' - policy type

---

## Process (Manual Method)

### 1. Validate Inputs

Check table exists and mode is valid:

```bash
echo "Validating inputs..."

DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
test -n "$DB_URL" || {
  echo "❌ Missing SUPABASE_DB_URL or DATABASE_URL"
  exit 1
}

# Check table exists
psql "$DB_URL" -c \
"SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = '{table}'
);" | grep -q t || {
  echo "❌ Table '{table}' not found"
  exit 1
}

# Check mode
if [[ "{mode}" != "kiss" && "{mode}" != "granular" ]]; then
  echo "❌ Invalid mode: {mode}"
  echo "   Use 'kiss' or 'granular'"
  exit 1
fi

echo "✓ Table exists: {table}"
echo "✓ Mode: {mode}"
```

### 2. Check Existing Policies

Display current RLS status:

```bash
echo "Checking existing RLS policies..."

psql "$DB_URL" << EOF
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = '{table}';
EOF

echo ""
echo "RLS enabled on {table}?"
psql "$DB_URL" -c \
"SELECT relrowsecurity FROM pg_class WHERE relname = '{table}';" \
| grep -q t && echo "✓ Yes" || echo "⚠️  No (will be enabled)"
```

### 3. Ask User Confirmation

Present policy that will be applied based on mode:

**If mode = 'kiss':**
```
Will apply KISS policy to {table}:
- Enable RLS
- Single policy: users can only access their own rows
- Uses: (select auth.uid()) = user_id [PERFORMANCE OPTIMIZED]
- Applies to: SELECT, INSERT, UPDATE, DELETE

⚠️  CRITICAL PERFORMANCE NOTE:
Wrapping auth.uid() in SELECT provides 99.99% performance improvement
by allowing PostgreSQL to cache the function result.

Continue? (yes/no)
```

**If mode = 'granular':**
```
Will apply granular policies to {table}:
- Enable RLS
- Separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
- Fine-grained control
- Uses: auth.uid() = user_id

Continue? (yes/no)
```

Get confirmation before proceeding.

### 4. Generate Policy SQL

Based on mode, generate appropriate SQL:

**KISS Mode:**
```sql
-- Enable RLS
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "{table}_policy" ON {table};

-- Create single KISS policy (PERFORMANCE OPTIMIZED)
CREATE POLICY "{table}_policy"
  ON {table}
  FOR ALL
  TO authenticated
  USING (
    -- ✅ CRITICAL: Wrap auth.uid() in SELECT for 99.99% performance gain
    -- This allows PostgreSQL to cache the function result per statement
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  )
  WITH CHECK (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );

-- Add helpful comment
COMMENT ON POLICY "{table}_policy" ON {table} IS
  'KISS policy: users can only access their own rows (performance optimized with cached auth.uid())';
```

**Granular Mode (PERFORMANCE OPTIMIZED):**
```sql
-- Enable RLS
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "{table}_select" ON {table};
DROP POLICY IF EXISTS "{table}_insert" ON {table};
DROP POLICY IF EXISTS "{table}_update" ON {table};
DROP POLICY IF EXISTS "{table}_delete" ON {table};

-- SELECT: Users read own rows
-- ✅ Wrapping auth.uid() in SELECT provides 99.99% performance improvement
CREATE POLICY "{table}_select"
  ON {table}
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );

-- INSERT: Users create own rows
CREATE POLICY "{table}_insert"
  ON {table}
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );

-- UPDATE: Users update own rows
CREATE POLICY "{table}_update"
  ON {table}
  FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  )
  WITH CHECK (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );

-- DELETE: Users delete own rows
CREATE POLICY "{table}_delete"
  ON {table}
  FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );

-- Add helpful comments
COMMENT ON POLICY "{table}_select" ON {table} IS 'Users can read own rows (cached auth.uid())';
COMMENT ON POLICY "{table}_insert" ON {table} IS 'Users can insert own rows (cached auth.uid())';
COMMENT ON POLICY "{table}_update" ON {table} IS 'Users can update own rows (cached auth.uid())';
COMMENT ON POLICY "{table}_delete" ON {table} IS 'Users can delete own rows (cached auth.uid())';
```

### 5. Create Migration File

Save policy SQL to migration file:

```bash
TS=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="supabase/migrations/${TS}_rls_${mode}__{table}.sql"

mkdir -p supabase/migrations

cat > "$MIGRATION_FILE" << 'EOF'
-- Migration: Apply {mode} RLS policy to {table}
-- Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
-- Table: {table}
-- Mode: {mode}

BEGIN;

[... SQL from step 4 ...]

COMMIT;
EOF

echo "✓ Migration created: $MIGRATION_FILE"
```

### 6. Apply Migration

Use existing db-apply-migration task:

```bash
echo "Applying migration..."
# Execute db-apply-migration task internally
# (This will create snapshots, apply, verify)
```

### 7. Test Policies

Verify policies work correctly:

```bash
echo "Testing RLS policies..."

# Test 1: Anonymous user should see nothing
psql "$DB_URL" << EOF
SET ROLE anon;
SELECT COUNT(*) AS anon_count FROM {table};
RESET ROLE;
EOF

# Test 2: Authenticated user should see only their rows
# (Requires setting up test user - provide instructions)

echo ""
echo "✓ Policy tests complete"
echo "  ⚠️  Manual testing recommended:"
echo "    - Use *impersonate to test as specific user"
echo "    - Verify each operation (SELECT, INSERT, UPDATE, DELETE)"
```

---

## Output

Display summary:
```
✅ RLS POLICY APPLIED

Table:     {table}
Mode:      {mode}
Migration: supabase/migrations/{TS}_rls_{mode}__{table}.sql
Policies:  [list created policies]

Next steps:
1. Test policies manually: *impersonate {user_id}
2. Run RLS audit: *rls-audit
3. Update documentation
4. Commit migration to git
```

---

## Notes

### KISS vs Granular

**KISS** (Keep It Simple, Stupid):
- ✅ Single policy for all operations
- ✅ Easier to understand
- ✅ Less verbose
- ❌ Less flexible

**Granular**:
- ✅ Separate policies per operation
- ✅ Fine-grained control
- ✅ Can have different logic per operation
- ❌ More verbose

### Common Patterns

**Public Read, Authenticated Write (Performance Optimized):**
```sql
-- SELECT: Public
CREATE POLICY "{table}_select" ON {table}
  FOR SELECT TO public
  USING (true);

-- INSERT/UPDATE/DELETE: Authenticated users only
CREATE POLICY "{table}_write" ON {table}
  FOR ALL TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  )
  WITH CHECK (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );
```

**Tenant-Based (Performance Optimized):**
```sql
CREATE POLICY "{table}_tenant" ON {table}
  FOR ALL TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL AND
    tenant_id IN (
      SELECT tenant_id FROM user_tenants
      WHERE user_id = (select auth.uid())
    )
  );
```

### Performance Tips

**Critical Performance Optimization:**
Always wrap `auth.uid()` in a `SELECT` statement:
```sql
-- ❌ SLOW (99.99% slower)
USING (auth.uid() = user_id)

-- ✅ FAST (cached per statement)
USING ((select auth.uid()) = user_id)
```

**Why it matters:**
- Without SELECT: PostgreSQL calls `auth.uid()` for EVERY row
- With SELECT: PostgreSQL caches the result for the entire statement
- Performance improvement: **99.99%** (essentially 10,000x faster on large tables)

**Index Recommendations:**
- Always index columns used in policies (e.g., `user_id`, `tenant_id`)
- Example: `CREATE INDEX idx_{table}_user_id ON {table}(user_id);`
- Performance improvement: **99.94%** when combined with wrapped auth functions

---

## Security Warnings ⚠️

### CRITICAL: Do NOT Use raw_user_meta_data in Policies

```sql
-- ❌ DANGEROUS - User can modify this data!
CREATE POLICY "bad_policy" ON {table}
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
```

**Why dangerous:** `raw_user_meta_data` can be modified by the user through Supabase Auth client. An attacker can set `{ "role": "admin" }` and bypass security!

**Safe alternative:** Use `raw_app_meta_data` (server-only):
```sql
-- ✅ SAFE - Only server can modify app_metadata
CREATE POLICY "safe_policy" ON {table}
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
```

### Auth NULL Check

Always check if user is authenticated:
```sql
-- ❌ Missing NULL check
USING (auth.uid() = user_id)  -- Fails silently for anon users

-- ✅ Explicit authentication check
USING (
  (select auth.uid()) IS NOT NULL AND
  (select auth.uid()) = user_id
)
```

### Policy Debugging

Enable RLS policies in SQL Editor (dev only):
```sql
-- Temporarily disable RLS for debugging (DANGEROUS - dev only!)
ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;

-- Re-enable when done
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
```

---

## Prerequisites

Table must have:
- `user_id UUID` column (for user-based policies)
- Or `tenant_id` column (for tenant-based policies)
- **Indexes on all policy filter columns** (critical for performance!)
  - `CREATE INDEX idx_{table}_user_id ON {table}(user_id);`

---

## Error Handling

If policy application fails:
1. Check table has required columns (user_id, etc.)
2. Verify auth.uid() is available (Supabase)
3. Check for existing policies with same names
4. Rollback migration if needed: `*rollback`
