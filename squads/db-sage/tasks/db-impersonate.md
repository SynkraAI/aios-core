# Task: Impersonate User (RLS Testing)

| Field | Value |
|-------|-------|
| **execution_type** | `Worker` |
| **pattern** | EXEC-W-001 |
| **script** | `scripts/db-ops/rls-test-suite.sh` |
| **rationale** | SET LOCAL de claims é operação determinística |

**Purpose**: Set session claims to emulate authenticated user for RLS testing

**Elicit**: true

---

## 🚀 NEW: Use Automated RLS Test Suite (RECOMMENDED)

**Token Savings: 93% | Time Savings: ~90%**

```bash
# Baseline RLS test against a table
./squads/db-sage/scripts/db-ops/rls-test-suite.sh {table_name}

# Test one specific user id
./squads/db-sage/scripts/db-ops/rls-test-suite.sh {table_name} "{user_id}"

# Test isolation across multiple users
./squads/db-sage/scripts/db-ops/rls-test-suite.sh {table_name} "{user_id_1},{user_id_2}"

# Benefits:
#   - Automatic session claims configuration
#   - Multi-user isolation testing
#   - Permission matrix generation
#   - Positive/negative test cases
#   - 93% token savings
```

**OR continue with manual impersonation below:**

---

## Inputs

- `user_id` (uuid): User ID to impersonate

---

## Process

### 1. Confirm Impersonation

Ask user:
- User ID to impersonate: `{user_id}`
- Purpose of impersonation (testing what?)
- Queries you plan to run

**CRITICAL WARNING**: This is for testing only. Never use in production application code.

### 2. Set Session Claims

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<SQL
-- Set JWT claims for current session
SELECT
  set_config('request.jwt.claims', 
    jsonb_build_object(
      'sub', '{user_id}',
      'role', 'authenticated'
    )::text, 
    true
  ) AS jwt_claims,
  set_config('request.jwt.claim.sub', '{user_id}', true) AS sub,
  set_config('role', 'authenticated', true) AS role;

-- Verify settings
SELECT 
  current_setting('request.jwt.claims', true) AS jwt_claims,
  current_setting('request.jwt.claim.sub', true) AS user_id,
  current_setting('role', true) AS role;

\echo ''
\echo '✓ Impersonating user: {user_id}'
\echo 'Run your test queries now.'
\echo 'To exit, close this session or run: RESET ALL;'
SQL
```

### 3. Interactive SQL Session

Open interactive psql for testing:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1
```

User can now run queries as this user:

```sql
-- Test queries
SELECT * FROM my_table;  -- Should respect RLS for this user

-- Check current context
SELECT 
  auth.uid() AS current_user_id,
  current_setting('role') AS current_role;

-- Exit impersonation
RESET ALL;
```

---

## Testing Scenarios

### Positive Test (Should Succeed)

Test that user CAN access their own data:

```sql
-- User should see their own records
SELECT * FROM users WHERE id = auth.uid();

-- User should see their own fragments
SELECT * FROM fragments WHERE user_id = auth.uid();
```

### Negative Test (Should Fail or Return Empty)

Test that user CANNOT access others' data:

```sql
-- Should return empty (not their data)
SELECT * FROM fragments WHERE user_id != auth.uid();

-- Should fail if trying to insert as another user
INSERT INTO fragments (user_id, content) 
VALUES ('00000000-0000-0000-0000-000000000000', 'test');
-- Expected: RLS policy violation
```

### Multi-Tenant Test

If using org-based isolation:

```sql
-- Set org_id in JWT
SELECT set_config('request.jwt.claims', 
  jsonb_build_object(
    'sub', '{user_id}',
    'role', 'authenticated',
    'org_id', '{org_id}'
  )::text, 
  true
);

-- Test org isolation
SELECT * FROM projects;  -- Should only see org's projects
```

---

## Common Use Cases

### Test New RLS Policy

```sql
-- 1. Apply new policy
CREATE POLICY "new_policy" ON table_name ...;

-- 2. Impersonate user
*impersonate {user_id}

-- 3. Test access
SELECT * FROM table_name;

-- 4. Reset and test as different user
RESET ALL;
*impersonate {other_user_id}
SELECT * FROM table_name;
```

### Debug Access Issues

User reports "can't see their data":

```sql
-- 1. Impersonate the user
*impersonate {user_id}

-- 2. Try their query
SELECT * FROM table_name WHERE ...;

-- 3. Check what RLS policies are active
SELECT * FROM pg_policies 
WHERE tablename = 'table_name';

-- 4. Verify user_id matches
SELECT auth.uid(), user_id FROM table_name LIMIT 5;
```

### Validate Multi-User Scenario

```sql
-- User A
*impersonate {user_a_id}
SELECT COUNT(*) FROM fragments;  -- Returns A's count

-- User B
*impersonate {user_b_id}
SELECT COUNT(*) FROM fragments;  -- Returns B's count

-- Verify isolation
SELECT user_id, COUNT(*) FROM fragments GROUP BY user_id;
-- Should only show current user in impersonation
```

---

## Important Notes

### Session-Local Only

Settings are session-local and reset when:
- Session closes
- `RESET ALL;` is executed
- New connection is established

### Not for Production

**Never use this in application code:**
- ❌ Setting claims manually in app
- ❌ Bypassing Supabase Auth
- ✅ Only for testing and debugging

### Service Role Bypasses RLS

If using service role key, RLS is bypassed completely:
- Cannot test RLS with service role
- Must use authenticated role
- Service role sees ALL data

### Works with Functions

RLS policies respect these settings even in functions:

```sql
CREATE FUNCTION get_user_data() 
RETURNS TABLE(...)
LANGUAGE sql
SECURITY DEFINER  -- Function runs as owner
AS $$
  SELECT * FROM table_name;  -- Still respects RLS
$$;
```

---

## Exit Impersonation

To stop impersonating:

```sql
-- Reset all session variables
RESET ALL;

-- Or just close the psql session
\q
```

---

## Troubleshooting

### "auth.uid() returns NULL"

**Problem**: Claims not set correctly  
**Fix**: Verify claim format and role setting

```sql
-- Check current settings
SELECT 
  current_setting('request.jwt.claims', true),
  current_setting('role', true);
```

### "Still seeing all data"

**Problem**: Using service role or RLS not enabled  
**Fix**: 
1. Check connection string (should not be service role)
2. Verify RLS enabled: `*rls-audit`
3. Confirm policies exist

### "Permission denied"

**Problem**: Role not set to authenticated  
**Fix**: Ensure role is set:

```sql
SELECT set_config('role', 'authenticated', true);
```

---

## Integration with Workflow

Typical testing workflow:

1. Create/modify RLS policy
2. `*dry-run migration.sql` - Syntax check
3. `*apply-migration migration.sql` - Apply changes
4. `*impersonate {test_user_id}` - Test as user
5. Run test queries
6. `*impersonate {other_user_id}` - Test isolation
7. `*rls-audit` - Verify coverage

---

## Security Reminder

🔒 **This is a testing tool only**  

Never bypass Supabase Auth in production. Always use:
- Supabase client with user authentication
- Proper JWT tokens from auth.users
- Real user sessions with valid credentials
