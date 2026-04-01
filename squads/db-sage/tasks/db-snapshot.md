# Task: Create Database Snapshot

| Field | Value |
|-------|-------|
| **execution_type** | `Worker` |
| **pattern** | EXEC-W-001 |
| **script** | `scripts/db-ops/backup-manager.sh` |
| **rationale** | Backup é operação determinística de pg_dump |

**Purpose**: Create schema-only snapshot for rollback capability

**Elicit**: true

---

## 🚀 NEW: Use Automated Backup Manager (RECOMMENDED)

**Token Savings: 90% | Time Savings: ~87%**

```bash
# Create snapshot with automatic labeling
./squads/db-sage/scripts/db-ops/backup-manager.sh --snapshot {label}

# Create snapshot with metadata
./squads/db-sage/scripts/db-ops/backup-manager.sh --snapshot {label} --description "Purpose description"

# Schema-only snapshot (default, faster)
./squads/db-sage/scripts/db-ops/backup-manager.sh --snapshot {label} --schema-only

# Full snapshot (schema + data)
./squads/db-sage/scripts/db-ops/backup-manager.sh --snapshot {label} --full

# Benefits:
#   - Automatic timestamp and versioning
#   - Metadata tracking (timestamp, user, description)
#   - Retention policy management
#   - Easy restore with --list and --restore
#   - 90% token savings
```

**OR continue with manual snapshot below:**

---

## Inputs

- `label` (string): Snapshot label/name (e.g., "baseline", "pre_migration", "v1_2_0")

---

## Process

### 1. Confirm Snapshot Details

Ask user:
- Snapshot label: `{label}`
- Purpose of this snapshot (e.g., "before adding user_roles table")
- Include data? (schema-only is default, safer, faster)

### 2. Create Snapshots Directory

```bash
mkdir -p supabase/snapshots
```

### 3. Generate Snapshot

```bash
TS=$(date +%Y%m%d_%H%M%S)
LABEL="{label}"
FILENAME="supabase/snapshots/${TS}_${LABEL}.sql"

echo "Creating snapshot: $FILENAME"

pg_dump "$SUPABASE_DB_URL" \
  --schema-only \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > "$FILENAME"

if [ $? -eq 0 ]; then
  echo "✅ Snapshot created: $FILENAME"
  ls -lh "$FILENAME"
else
  echo "❌ Snapshot failed"
  exit 1
fi
```

### 4. Verify Snapshot

Quick sanity check:

```bash
# Check file size (should be > 0)
if [ ! -s "$FILENAME" ]; then
  echo "⚠️ Snapshot file is empty"
  exit 1
fi

# Count schema objects
echo ""
echo "=== Snapshot Contents ==="
grep -c "CREATE TABLE" "$FILENAME" && echo "tables found" || echo "no tables"
grep -c "CREATE FUNCTION" "$FILENAME" && echo "functions found" || echo "no functions"
grep -c "CREATE POLICY" "$FILENAME" && echo "policies found" || echo "no policies"
```

### 5. Create Snapshot Metadata

```bash
cat > "supabase/snapshots/${TS}_${LABEL}.meta" <<EOF
Snapshot: ${TS}_${LABEL}
Created: $(date -Iseconds)
Label: ${LABEL}
Database: $(echo "$SUPABASE_DB_URL" | sed 's/:.*/:[REDACTED]/')
Purpose: [user provided purpose]
File: ${FILENAME}
Size: $(ls -lh "$FILENAME" | awk '{print $5}')

To restore:
  *rollback supabase/snapshots/${TS}_${LABEL}.sql

Or manually:
  psql "\$SUPABASE_DB_URL" -f "${FILENAME}"
EOF

cat "supabase/snapshots/${TS}_${LABEL}.meta"
```

---

## Output

```
✅ Snapshot Created Successfully

File: supabase/snapshots/20251026_143022_pre_migration.sql
Size: 45.2 KB
Timestamp: 20251026_143022
Label: pre_migration

Contents:
  - 12 tables
  - 8 functions
  - 15 policies

To restore this snapshot:
  *rollback supabase/snapshots/20251026_143022_pre_migration.sql

Metadata saved to:
  supabase/snapshots/20251026_143022_pre_migration.meta
```

---

## Snapshot Options

### Schema-Only (Default)
- ✅ Fast (seconds)
- ✅ Small file size
- ✅ Safe to apply to any environment
- ❌ No data preserved
- **Use for**: Migration rollback, schema versioning

### Schema + Data
```bash
pg_dump "$SUPABASE_DB_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > "$FILENAME"
```
- ⚠️ Slower (minutes to hours)
- ⚠️ Large file size
- ⚠️ Data may conflict on restore
- ✅ Complete backup
- **Use for**: Disaster recovery, environment cloning

### Specific Tables Only
```bash
pg_dump "$SUPABASE_DB_URL" \
  --schema-only \
  --table="users" \
  --table="profiles" \
  > "$FILENAME"
```
- ✅ Targeted snapshot
- ✅ Smaller file
- **Use for**: Testing specific table changes

---

## Best Practices

### When to Snapshot

**Always before:**
- Migrations
- Schema changes
- RLS policy changes
- Function modifications
- Major data operations

**Regularly:**
- Daily schema snapshots (automated)
- Before each deployment
- After successful migrations (post-snapshot)

### Snapshot Naming

**Good names:**
- `baseline` - Initial schema state
- `pre_migration` - Before any migration
- `pre_v1_2_0` - Before version deployment
- `working_state` - Known good state

**Bad names:**
- `backup` - Too generic
- `test` - Unclear purpose
- `snapshot1` - No context

### Retention

Keep snapshots for:
- Last 7 days: All snapshots
- Last 30 days: Daily snapshots
- Last year: Monthly snapshots
- Forever: Major version snapshots

```bash
# Example cleanup (keep last 10)
cd supabase/snapshots
ls -t *.sql | tail -n +11 | xargs rm -f
```

---

## Snapshot vs Backup

| Feature | Snapshot (pg_dump) | Supabase Backup |
|---------|-------------------|-----------------|
| Speed | Fast | Depends |
| Scope | Schema only (default) | Full database |
| Storage | Local files | Supabase managed |
| Restore | Manual psql | Supabase dashboard |
| Version control | ✅ Git-friendly | ❌ Binary |
| Automation | Easy (script) | Automatic |

**Use snapshots for:**
- Schema version control
- Migration rollback
- Development workflows
- Quick local backups

**Use Supabase backups for:**
- Disaster recovery
- Point-in-time restore
- Production incidents
- Long-term retention

---

## Troubleshooting

### "pg_dump: error: connection failed"

**Problem**: Cannot connect to database  
**Fix**: Check SUPABASE_DB_URL

```bash
*env-check
```

### "pg_dump: error: permission denied"

**Problem**: Insufficient privileges  
**Fix**: Use connection string with sufficient permissions

### "Snapshot file is empty"

**Problem**: No schema objects or connection failed  
**Fix**: 
1. Verify database has tables: `SELECT * FROM pg_tables WHERE schemaname='public';`
2. Check pg_dump version compatibility
3. Verify network connectivity

### "Snapshot is huge"

**Problem**: Including data unintentionally  
**Fix**: Use `--schema-only` flag explicitly

---

## Integration with Workflow

### Pre-Migration Workflow
```bash
*snapshot pre_migration      # Create rollback point
*verify-order migration.sql  # Check DDL order
*dry-run migration.sql       # Test safely
*apply-migration migration.sql  # Apply
*snapshot post_migration     # Capture new state
```

### Comparison Workflow
```bash
*snapshot before_changes
# ... make changes ...
*snapshot after_changes
diff supabase/snapshots/*_before_changes.sql \
     supabase/snapshots/*_after_changes.sql
```

---

## Advanced Usage

### Compare Two Snapshots

```bash
# Visual diff
diff -u snapshot1.sql snapshot2.sql | less

# Summary of changes
diff snapshot1.sql snapshot2.sql | grep "^[<>]" | head -20
```

### Extract Specific Objects

```bash
# Just table definitions
grep -A 20 "CREATE TABLE" snapshot.sql

# Just functions
sed -n '/CREATE FUNCTION/,/\$\$/p' snapshot.sql
```

### Version in Git

```bash
# Snapshot before commit
*snapshot before_feature_x
git add supabase/snapshots/*_before_feature_x.sql
git commit -m "snapshot: schema before feature X"
```

---

## Security Notes

⚠️ **Snapshots may contain sensitive schema info**:
- Table names reveal business logic
- Function names expose features
- Comments may contain internal notes

**In public repos:**
- Consider .gitignore for snapshots
- Or sanitize before committing
- Or use private repos only

**Do NOT commit:**
- Snapshots with `--data-included`
- Files containing passwords/secrets
- Connection strings in metadata

---

## Automation

### Daily Snapshot Script

```bash
#!/bin/bash
# Save as: scripts/daily-snapshot.sh

DATE=$(date +%Y%m%d)
*snapshot "daily_${DATE}"

# Cleanup old snapshots (keep 7 days)
find supabase/snapshots -name "daily_*.sql" -mtime +7 -delete
```

### Pre-Deploy Hook

```bash
# In CI/CD pipeline
- name: Create pre-deploy snapshot
  run: |
    /db-sage
    *snapshot "pre_deploy_${CI_COMMIT_SHA}"
```

---

## Related Commands

- `*rollback {snapshot}` - Restore snapshot
- `*apply-migration {path}` - Includes automatic snapshots
- `*env-check` - Verify pg_dump available
