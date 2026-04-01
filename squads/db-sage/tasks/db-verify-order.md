# Task: Verify DDL Ordering

| Field | Value |
|-------|-------|
| **execution_type** | `Worker` |
| **pattern** | EXEC-W-001 |
| **script** | `scripts/db-ops/migration-runner.sh` |
| **rationale** | Análise de dependências DDL é parsing determinístico |

**Purpose**: Lint DDL for safe execution order to avoid dependency errors

**Elicit**: true

---

## 🚀 NEW: Use Automated Migration Safe Runner (RECOMMENDED)

**Token Savings: 92% | Time Savings: ~89%**

```bash
# Verify DDL ordering automatically
./squads/db-sage/scripts/db-ops/migration-runner.sh {path} --verify-order

# Verify order and proceed only if safe
./squads/db-sage/scripts/db-ops/migration-runner.sh {path} --verify-order
./squads/db-sage/scripts/db-ops/migration-runner.sh {path} --dry-run

# Benefits:
#   - Automatic DDL section detection
#   - Dependency graph analysis
#   - Safe execution order recommendation
#   - Circular dependency detection
#   - 92% token savings
```

**OR continue with manual DDL verification below:**

---

## Inputs

- `path` (string): Path to SQL migration file

---

## Process

### 1. Extract DDL Sections

Parse migration file and identify sections:

```bash
awk 'BEGIN{IGNORECASE=1}
  /create extension|alter extension/ {print "EXT:", NR, $0}
  /create table/ {print "TAB:", NR, $0}
  /create or replace function|create function/ {print "FUN:", NR, $0}
  /create trigger/ {print "TRG:", NR, $0}
  /enable row level security|create policy/ {print "RLS:", NR, $0}
  /create .* view/ {print "VIEW:", NR, $0}
' {path} > /tmp/ddl_order.txt

echo "=== DDL Section Analysis ==="
cat /tmp/ddl_order.txt
```

### 2. Analyze Ordering

Show recommended order and actual order:

```
Recommended Execution Order:
1. Extensions (CREATE EXTENSION)
2. Tables & Constraints (CREATE TABLE, ALTER TABLE)
3. Functions (CREATE FUNCTION)
4. Triggers (CREATE TRIGGER)
5. RLS (ENABLE RLS, CREATE POLICY)
6. Views & Materialized Views (CREATE VIEW)

Actual Order in File:
[output from grep above]
```

### 3. Run Heuristic Checks

Detect common ordering problems:

```bash
# Check: Functions before tables
FIRST_TAB=$(grep '^TAB:' /tmp/ddl_order.txt | head -1 | cut -d: -f2)
FIRST_FUN=$(grep '^FUN:' /tmp/ddl_order.txt | head -1 | cut -d: -f2)

if [ -n "$FIRST_TAB" ] && [ -n "$FIRST_FUN" ] && [ "$FIRST_FUN" -lt "$FIRST_TAB" ]; then
  echo "❌ Functions appear before tables. Reorder recommended."
  exit 2
fi

# Check: RLS before tables exist
FIRST_RLS=$(grep '^RLS:' /tmp/ddl_order.txt | head -1 | cut -d: -f2)
if [ -n "$FIRST_RLS" ] && [ -n "$FIRST_TAB" ] && [ "$FIRST_RLS" -lt "$FIRST_TAB" ]; then
  echo "❌ RLS commands before table creation. Reorder required."
  exit 2
fi

# Check: Triggers before functions
FIRST_TRG=$(grep '^TRG:' /tmp/ddl_order.txt | head -1 | cut -d: -f2)
if [ -n "$FIRST_TRG" ] && [ -n "$FIRST_FUN" ] && [ "$FIRST_TRG" -lt "$FIRST_FUN" ]; then
  echo "⚠️ Triggers before functions. May fail if trigger calls function."
fi

echo "✓ Ordering looks reasonable by heuristics"
```

### 4. Report Results

**If all checks pass:**
```
✅ DDL Ordering Validation Passed

Sections found:
  - Extensions: X
  - Tables: Y
  - Functions: Z
  - Triggers: N
  - RLS: M
  - Views: V

Order appears correct. Safe to proceed with:
  *dry-run {path}
```

**If issues found:**
```
❌ DDL Ordering Issues Detected

Problems:
  - Functions defined before tables (line X vs line Y)
  - Triggers reference functions not yet created
  
Recommended fixes:
  1. Move CREATE EXTENSION to top
  2. Group CREATE TABLE statements
  3. Then CREATE FUNCTION
  4. Then CREATE TRIGGER
  5. Then ENABLE RLS + policies
  6. Finally CREATE VIEW

After fixing, re-run: *verify-order {path}
```

---

## Correct Ordering Examples

### ✅ Good Order

```sql
-- 1. Extensions first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tables and constraints
CREATE TABLE users (...);
CREATE TABLE fragments (...);
ALTER TABLE fragments ADD CONSTRAINT fk_user ...;

-- 3. Functions
CREATE OR REPLACE FUNCTION current_user_id() ...;
CREATE OR REPLACE FUNCTION update_timestamp() ...;

-- 4. Triggers
CREATE TRIGGER set_timestamp 
BEFORE UPDATE ON users ...;

-- 5. RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_all" ON users ...;

-- 6. Views
CREATE VIEW user_fragments_view AS ...;
```

### ❌ Bad Order (Will Fail)

```sql
-- ❌ Function before table it references
CREATE FUNCTION get_user_name(user_id UUID) 
RETURNS TEXT AS $$
  SELECT name FROM users WHERE id = user_id;  -- users doesn't exist yet!
$$ LANGUAGE sql;

-- ❌ Table created after function
CREATE TABLE users (...);

-- ❌ RLS before table
CREATE POLICY "users_policy" ON users ...;  -- Can't create policy on non-existent table
```

---

## Common Dependency Patterns

### Pattern 1: Functions Calling Other Functions

**Order**: Base functions → Composite functions

```sql
-- First: Base function
CREATE FUNCTION base_func() ...;

-- Second: Function that calls base_func
CREATE FUNCTION composite_func() AS $$
BEGIN
  RETURN base_func();  -- Safe, base_func exists
END;
$$ LANGUAGE plpgsql;
```

### Pattern 2: Tables with Foreign Keys

**Order**: Referenced tables → Referencing tables

```sql
-- First: Parent table
CREATE TABLE users (id UUID PRIMARY KEY);

-- Second: Child table
CREATE TABLE posts (
  user_id UUID REFERENCES users(id)  -- Safe, users exists
);
```

### Pattern 3: Views on Views

**Order**: Base views → Derived views

```sql
-- First: Base view
CREATE VIEW active_users AS 
SELECT * FROM users WHERE deleted_at IS NULL;

-- Second: View on view
CREATE VIEW active_users_with_posts AS
SELECT u.*, COUNT(p.id) 
FROM active_users u  -- Safe, active_users exists
LEFT JOIN posts p ON p.user_id = u.id;
```

### Pattern 4: RLS Using Functions

**Order**: Tables → Functions → RLS Policies

```sql
-- First: Table
CREATE TABLE data (...);

-- Second: Helper function
CREATE FUNCTION user_can_access(data_id UUID) ...;

-- Third: RLS policy using function
CREATE POLICY "access_check" ON data
USING (user_can_access(id));  -- Safe, function exists
```

---

## Manual Review Checklist

After automated checks, manually verify:

- [ ] All CREATE EXTENSION at top
- [ ] Foreign key references come after parent tables
- [ ] Triggers reference existing functions
- [ ] RLS policies reference existing tables
- [ ] Views reference existing tables/views
- [ ] Functions called by other functions defined first
- [ ] No circular dependencies

---

## Integration with Workflow

Typical validation workflow:

1. Write migration
2. `*verify-order migration.sql` - Check ordering
3. Fix any issues found
4. `*dry-run migration.sql` - Test execution
5. `*apply-migration migration.sql` - Apply if dry-run passes

---

## Advanced: Dependency Graph

For complex migrations, visualize dependencies:

```bash
# Extract CREATE statements
grep -i "create" {path} | \
  grep -E "(table|function|view|trigger)" > /tmp/creates.txt

# Manual review of dependencies
cat /tmp/creates.txt
```

Look for:
- Table → Foreign Key → Other Table
- Function → Calls → Other Function
- Trigger → Calls → Function
- View → Selects → Table/View
- Policy → Uses → Function

---

## Why This Matters

**Problem**: Wrong order causes migration failures

```
ERROR: relation "users" does not exist
ERROR: function "user_can_access" does not exist
ERROR: table "data" does not exist for policy creation
```

**Solution**: Verify order before running

- Catch issues in seconds (not after failed migration)
- No partial schema state
- No rollback needed for ordering errors
- Faster development cycle

---

## Limitations

This is a heuristic check, not a full parser:

✅ **Catches**: Most common ordering issues  
✅ **Fast**: Runs in < 1 second  
✅ **Safe**: No database connection needed  

❌ **Misses**: Complex cross-file dependencies  
❌ **Misses**: Dynamic SQL  
❌ **Misses**: Subtle type dependencies  

For 100% validation, use: `*dry-run {path}`
