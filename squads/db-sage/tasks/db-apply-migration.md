# Task: Apply Migration (with snapshot + advisory lock)

| Field | Value |
|-------|-------|
| **execution_type** | `Hybrid` |
| **pattern** | EXEC-HY-001 |
| **script** | `scripts/db-ops/migration-runner.sh` |
| **rationale** | Worker executa migration, Human DEVE aprovar antes (altera schema produção) |

**Purpose**: Safely apply a migration with pre/post snapshots and exclusive lock

**Elicit**: true

---

## Inputs

- `path` (string): Path to SQL migration file

---

## Process

### 1. Pre-Flight Checks

Ask user to confirm:
- Migration file: `{path}`
- Database: `$SUPABASE_DB_URL` (redacted)
- Dry-run completed? (yes/no)
- Backup/snapshot taken? (will be done automatically)

**CRITICAL**: If user says dry-run not done, stop and recommend: `*dry-run {path}`

### 2. Use Migration Safe Runner Script (RECOMMENDED)

**NEW: Use the automated script for safer execution:**

```bash
# Use the migration-safe-runner script for complete safety
./squads/db-sage/scripts/db-ops/migration-runner.sh {path} --verify-order
./squads/db-sage/scripts/db-ops/migration-runner.sh {path} --dry-run
./squads/db-sage/scripts/db-ops/migration-runner.sh {path} --force

# The canonical worker-first path automatically handles:
# - Advisory locks
# - Pre/post snapshots
# - Dry-run validation
# - Rollback preparation
# - Error handling
```

**OR continue with manual steps below:**

### 3. Acquire Advisory Lock (Manual Method)

Ensure no concurrent migrations:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -c \
"SELECT pg_try_advisory_lock(hashtext('dbsage:migrate')) AS got" \
| grep -q t || { echo "❌ Another migration is running"; exit 1; }

echo "✓ Migration lock acquired"
```

### 4. Pre-Migration Snapshot (Manual Method)

Create schema-only snapshot before changes:

```bash
TS=$(date +%Y%m%d%H%M%S)
mkdir -p supabase/snapshots supabase/rollback

pg_dump "$SUPABASE_DB_URL" --schema-only --clean --if-exists \
  > "supabase/snapshots/${TS}_before.sql"

echo "✓ Pre-migration snapshot: supabase/snapshots/${TS}_before.sql"
echo $TS > /tmp/dbsage_migration_ts
```

### 4. Apply Migration

Run migration in transaction:

```bash
echo "Applying migration..."
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f {path}

if [ $? -eq 0 ]; then
  echo "✓ Migration applied successfully"
else
  echo "❌ Migration failed - rolling back..."
  # Advisory lock will be released on disconnect
  exit 1
fi
```

### 5. Post-Migration Snapshot

Create snapshot after changes:

```bash
TS=$(cat /tmp/dbsage_migration_ts)

pg_dump "$SUPABASE_DB_URL" --schema-only --clean --if-exists \
  > "supabase/snapshots/${TS}_after.sql"

echo "✓ Post-migration snapshot: supabase/snapshots/${TS}_after.sql"
```

### 6. Generate Diff (Optional)

```bash
diff -u "supabase/snapshots/${TS}_before.sql" \
        "supabase/snapshots/${TS}_after.sql" \
  > "supabase/snapshots/${TS}_diff.patch" || true

echo "✓ Diff saved: supabase/snapshots/${TS}_diff.patch"
```

### 7. Release Advisory Lock

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -c \
"SELECT pg_advisory_unlock(hashtext('dbsage:migrate'));"

echo "✓ Migration lock released"
```

### 8. Post-Migration Actions

Present options to user:

**1. Run smoke tests** - `*smoke-test`  
**2. Check RLS coverage** - `*rls-audit`  
**3. Verify query performance** - `*analyze-hotpaths`  
**4. Done for now**

---

## Success Output

```
✅ Migration Applied Successfully

Timestamp: {TS}
Migration: {path}
Snapshots:
  - Before: supabase/snapshots/{TS}_before.sql
  - After:  supabase/snapshots/{TS}_after.sql
  - Diff:   supabase/snapshots/{TS}_diff.patch

Next steps:
  *smoke-test     - Validate migration
  *rls-audit      - Check security
  *rollback {TS}  - Undo if needed
```

---

## Rollback Instructions

If migration needs to be undone:

```bash
*rollback supabase/snapshots/{TS}_before.sql
```

Or create manual rollback script in `supabase/rollback/{TS}_rollback.sql`

---

## Error Handling

### Migration Fails Mid-Execution

1. PostgreSQL transaction is rolled back automatically
2. Advisory lock released on disconnect
3. Pre-migration snapshot still available
4. Database unchanged

### Lock Already Held

```
❌ Another migration is running
Wait for completion or check for stuck locks:

SELECT * FROM pg_locks WHERE locktype = 'advisory';
```

### Snapshot Creation Fails

- Check disk space
- Verify pg_dump version compatibility
- Check database permissions

---

## Safety Features

✅ Advisory lock prevents concurrent migrations  
✅ Pre/post snapshots for comparison  
✅ ON_ERROR_STOP prevents partial application  
✅ Transaction-wrapped execution  
✅ Automatic diff generation  
✅ Rollback instructions provided
