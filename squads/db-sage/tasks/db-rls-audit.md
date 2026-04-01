# Task: RLS Audit

| Field | Value |
|-------|-------|
| **execution_type** | `Worker` |
| **pattern** | EXEC-W-001 |
| **script** | `scripts/db-ops/rls-test-suite.sh` |
| **rationale** | Query de metadados pg_policies é determinística |

**Purpose**: Report tables with/without RLS and list all policies

**Elicit**: false

---

## 🚀 NEW: Use Automated RLS Test Suite (RECOMMENDED)

**Token Savings: 93% | Time Savings: ~85%**

```bash
# Test specific table with automated script
./squads/db-sage/scripts/db-ops/rls-test-suite.sh {table_name}

# Test all tables with RLS
DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
for table in $(psql "$DB_URL" -t -A -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND rowsecurity=true"); do
  ./squads/db-sage/scripts/db-ops/rls-test-suite.sh $table
done

# Benefits:
#   - Automated multi-user testing
#   - Isolation verification
#   - Permission matrix generation
#   - 93% token savings
```

**OR continue with manual SQL audit below:**

---

## Process (Manual Method)

### Run Comprehensive RLS Audit

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== RLS Coverage Audit ==='
\echo ''

-- Tables with/without RLS
WITH t AS (
  SELECT tablename, rowsecurity
  FROM pg_tables WHERE schemaname='public'
)
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✓ ENABLED' ELSE '❌ DISABLED' END AS rls_status,
  (SELECT json_agg(json_build_object(
    'policy', policyname,
    'cmd', cmd,
    'roles', roles,
    'qual', qual,
    'with_check', with_check
  ))
   FROM pg_policies p 
   WHERE p.tablename=t.tablename 
   AND p.schemaname='public') AS policies
FROM t
ORDER BY rowsecurity DESC, tablename;

\echo ''
\echo '=== Summary ==='

SELECT 
  COUNT(*) AS total_tables,
  COUNT(*) FILTER (WHERE rowsecurity) AS rls_enabled,
  COUNT(*) FILTER (WHERE NOT rowsecurity) AS rls_disabled
FROM pg_tables 
WHERE schemaname='public';

\echo ''
\echo '=== Tables Without RLS (Security Risk) ==='

SELECT tablename 
FROM pg_tables 
WHERE schemaname='public' 
AND rowsecurity = false
ORDER BY tablename;

\echo ''
\echo '=== Policy Coverage ==='

SELECT 
  t.tablename,
  COUNT(p.policyname) AS policy_count,
  ARRAY_AGG(p.cmd) AS commands_covered
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
AND t.rowsecurity = true
GROUP BY t.tablename
ORDER BY policy_count, t.tablename;

SQL
```

---

## Output Interpretation

### RLS Status

**✓ ENABLED** - Table has RLS active (good)  
**❌ DISABLED** - Table has no RLS (security risk)

### Policy Coverage

**Good coverage:**
- 1 policy with `FOR ALL` (KISS approach), OR
- 4 policies covering SELECT, INSERT, UPDATE, DELETE (granular)

**Incomplete coverage:**
- Enabled RLS but 0 policies = nobody can access
- 1-3 policies (granular) = some operations not covered

**No coverage:**
- RLS disabled = full access without restrictions

---

## Common Issues & Fixes

### Issue: Table has RLS but no policies

**Problem**: RLS enabled but no policies defined  
**Impact**: Table is inaccessible to all users  
**Fix**: Add policies or disable RLS

```sql
-- Add KISS policy
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "table_name_all"
ON table_name FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

Or use: `*policy-apply table_name kiss`

### Issue: Table has no RLS

**Problem**: Table accessible without restrictions  
**Impact**: Security vulnerability, data exposure  
**Fix**: Enable RLS and add policies

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
-- Then add policies
```

### Issue: Incomplete policy coverage (granular)

**Problem**: RLS enabled with 1-3 policies (not covering all operations)  
**Impact**: Some operations may be blocked unexpectedly  
**Fix**: Either add missing policies or switch to KISS approach

---

## Recommended Actions

### For Public Data
Tables that should be publicly readable:

```sql
-- Public read, authenticated write
CREATE POLICY "public_read"
ON table_name FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "authenticated_write"
ON table_name FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### For User-Owned Data
Use KISS policy:

```bash
*policy-apply table_name kiss
```

### For Multi-Tenant Data
Organization-scoped access:

```sql
CREATE POLICY "org_isolation"
ON table_name FOR ALL
TO authenticated
USING (org_id = (auth.jwt() ->> 'org_id')::uuid)
WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);
```

---

## Testing RLS Policies

After fixing issues, test with:

```bash
*impersonate {user_id}
# Then run queries to verify access
```

---

## Best Practices

✅ **Enable RLS on all tables with sensitive data**  
✅ **Use KISS policies for simple owner-based access**  
✅ **Document why RLS is disabled if intentional**  
✅ **Test policies with real user contexts**  
✅ **Index columns used in RLS policies**  
✅ **Run this audit after every migration**

❌ **Don't enable RLS without policies**  
❌ **Don't use service role to bypass RLS in app code**  
❌ **Don't forget to test negative cases**

---

## Integration with Workflow

Run RLS audit:
1. After migrations: `*smoke-test` → `*rls-audit`
2. Before production deploy: `*rls-audit`
3. Regular security reviews: `*rls-audit`
4. When adding new tables: `*rls-audit`
