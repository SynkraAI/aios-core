# Migration Safety Guide

## Before Migration
1. Take snapshot/backup
2. Test in staging
3. Run dry-run
4. Prepare rollback plan
5. Schedule maintenance window

## During Migration
1. Use transactions (BEGIN/COMMIT)
2. Create indexes CONCURRENTLY
3. Add constraints NOT VALID first
4. Validate constraints separately
5. Monitor logs

## Zero-Downtime Patterns

### Add Column (Safe)
```sql
ALTER TABLE t ADD COLUMN new_col TEXT DEFAULT 'default';
```

### Drop Column (Risky)
```sql
-- Step 1: Stop using column in app
-- Step 2: Deploy app
-- Step 3: Drop column
ALTER TABLE t DROP COLUMN old_col;
```

### Rename Column (Expand/Contract)
```sql
-- Step 1: Add new column
ALTER TABLE t ADD COLUMN new_name TEXT;
-- Step 2: Backfill data
UPDATE t SET new_name = old_name;
-- Step 3: Deploy app using both
-- Step 4: Deploy app using new_name only
-- Step 5: Drop old column
ALTER TABLE t DROP COLUMN old_name;
```

### Add Index (Use CONCURRENTLY)
```sql
CREATE INDEX CONCURRENTLY idx_name ON table(column);
```

### Add Constraint (NOT VALID first)
```sql
-- Step 1: Add NOT VALID (no scan)
ALTER TABLE t ADD CONSTRAINT c CHECK (condition) NOT VALID;
-- Step 2: Validate later (can cancel if takes too long)
ALTER TABLE t VALIDATE CONSTRAINT c;
```

## Rollback Strategies
1. **Roll Forward** (Preferred): New migration to undo
2. **PITR**: Restore to before migration
3. **Manual**: Run rollback script (emergency only)

**References:**
- https://www.postgresql.org/docs/current/sql-altertable.html
- https://medium.com/@jonathangfischoff/what-should-a-postgresql-migrator-do-47fd34804be
