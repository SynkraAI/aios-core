# Task: Apply Seed Data

| Field | Value |
|-------|-------|
| **execution_type** | `Worker` |
| **pattern** | EXEC-W-001 |
| **script** | `scripts/db-ops/data-loader.sh` |
| **rationale** | INSERT de seed data é operação determinística |

**Purpose**: Safely apply seed data to database with idempotent operations

**Elicit**: true

---

## 🚀 NEW: Use Automated Data Loader (RECOMMENDED)

**Token Savings: 87% | Time Savings: ~83%**

```bash
# Apply seed data with idempotency checks
./squads/db-sage/scripts/db-ops/data-loader.sh --seed {path}

# Apply seed with validation
./squads/db-sage/scripts/db-ops/data-loader.sh --seed {path} --validate

# Dry-run mode (preview without applying)
./squads/db-sage/scripts/db-ops/data-loader.sh --seed {path} --dry-run

# Apply to specific environment
./squads/db-sage/scripts/db-ops/data-loader.sh --seed {path} --env production

# Benefits:
#   - Automatic idempotency validation
#   - Environment safety checks
#   - Conflict detection and resolution
#   - Rollback on errors
#   - 87% token savings
```

**OR continue with manual seed application below:**

---

## Inputs

- `path` (string): Path to SQL seed file

---

## Process

### 1. Pre-Flight Checks

Ask user to confirm:
- Seed file: `{path}`
- Database: active `SUPABASE_DB_URL` or `DATABASE_URL` (redacted)
- Environment: (dev/staging/production)
- Idempotent? (uses INSERT...ON CONFLICT or similar)

**CRITICAL**: Never seed production without explicit confirmation!

### 2. Validate Seed File

Check that seed file is idempotent:

```bash
echo "Validating seed file..."

DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
test -n "$DB_URL" || {
  echo "❌ Missing SUPABASE_DB_URL or DATABASE_URL"
  exit 1
}

# Check for dangerous patterns
if grep -qi "TRUNCATE\|DELETE FROM" {path}; then
  echo "⚠️  WARNING: Seed contains TRUNCATE/DELETE"
  echo "   This is destructive. Continue? (yes/no)"
  read CONFIRM
  [ "$CONFIRM" != "yes" ] && { echo "Aborted"; exit 1; }
fi

# Check for INSERT...ON CONFLICT (idempotent pattern)
if ! grep -qi "ON CONFLICT" {path}; then
  echo "⚠️  WARNING: No ON CONFLICT detected"
  echo "   Seed may not be idempotent. Continue? (yes/no)"
  read CONFIRM
  [ "$CONFIRM" != "yes" ] && { echo "Aborted"; exit 1; }
fi

echo "✓ Seed file validated"
```

### 3. Create Snapshot (Optional but Recommended)

```bash
TS=$(date +%Y%m%d%H%M%S)
mkdir -p supabase/snapshots

echo "Creating pre-seed snapshot..."
pg_dump "$DB_URL" --schema-only --clean --if-exists \
  > "supabase/snapshots/${TS}_before_seed.sql"

echo "✓ Snapshot: supabase/snapshots/${TS}_before_seed.sql"
```

### 4. Apply Seed Data

Run seed in transaction with error handling:

```bash
echo "Applying seed data..."

psql "$DB_URL" \
  -v ON_ERROR_STOP=1 \
  -f {path}

if [ $? -eq 0 ]; then
  echo "✓ Seed data applied successfully"
else
  echo "❌ Seed failed"
  echo "   Rollback snapshot: supabase/snapshots/${TS}_before_seed.sql"
  exit 1
fi
```

### 5. Verify Seed Data

Run basic verification:

```bash
echo "Verifying seed data..."

# Count inserted rows (example - customize per seed)
psql "$DB_URL" -c \
"SELECT
  'users' AS table, COUNT(*) AS rows FROM users
UNION ALL
SELECT
  'categories', COUNT(*) FROM categories
ORDER BY table;"

echo "✓ Verification complete"
```

### 6. Document Seed

Log what was seeded:

```bash
cat >> supabase/docs/SEED_LOG.md << EOF

## Seed Applied: ${TS}
- File: {path}
- Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- Environment: ${ENVIRONMENT:-unknown}
- Applied by: ${USER:-unknown}

EOF

echo "✓ Logged to supabase/docs/SEED_LOG.md"
```

---

## Output

Display summary:
```
✅ SEED COMPLETE

File:      {path}
Timestamp: {TS}
Snapshot:  supabase/snapshots/{TS}_before_seed.sql
Log:       supabase/docs/SEED_LOG.md

Next steps:
- Verify data manually in database
- Run smoke tests if appropriate
- Commit seed file to git
```

---

## Idempotent Seed Pattern

Best practice example for seed files:

```sql
-- ✅ GOOD: Idempotent seed
INSERT INTO categories (id, name, slug)
VALUES
  ('cat-1', 'Technology', 'technology'),
  ('cat-2', 'Design', 'design')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug;

-- ✅ GOOD: Conditional insert
INSERT INTO users (id, email, role)
SELECT 'user-1', 'admin@example.com', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@example.com'
);

-- ❌ BAD: Not idempotent
INSERT INTO categories (name, slug)
VALUES ('Technology', 'technology');  -- Will fail on retry
```

---

## Error Handling

If seed fails:
1. Check error message in terminal
2. Fix seed file
3. Restore snapshot if needed: `*rollback {TS}_before_seed`
4. Re-run seed: `*seed {path}`

---

## Notes

- Seeds should be idempotent (safe to run multiple times)
- Use `ON CONFLICT` or `INSERT...WHERE NOT EXISTS`
- Never TRUNCATE in production seeds
- Test seeds in dev/staging first
- Version seed files in git (supabase/seeds/)
