# Task: Load CSV Data Safely

| Field | Value |
|-------|-------|
| **execution_type** | `Worker` |
| **pattern** | EXEC-W-001 |
| **script** | `scripts/db-ops/data-loader.sh` |
| **rationale** | COPY de CSV é operação determinística do PostgreSQL |

**Purpose**: Import CSV data using PostgreSQL COPY with staging table and validation

**Elicit**: true

---

## 🚀 NEW: Use Automated Data Loader (RECOMMENDED)

**Token Savings: 86% | Time Savings: ~82%**

```bash
# Load CSV with automatic staging and validation
./squads/db-sage/scripts/db-ops/data-loader.sh {table} {csv_file}

# Load with custom delimiter
./squads/db-sage/scripts/db-ops/data-loader.sh {table} {csv_file} --delimiter "|"

# Load with validation rules
./squads/db-sage/scripts/db-ops/data-loader.sh {table} {csv_file} --validate

# Dry-run mode (preview changes)
./squads/db-sage/scripts/db-ops/data-loader.sh {table} {csv_file} --dry-run

# Benefits:
#   - Automatic staging table creation
#   - Data validation and cleaning
#   - Duplicate detection
#   - Safe rollback on errors
#   - 86% token savings
```

**OR continue with manual CSV load below:**

---

## Inputs

- `table` (string): Target table name
- `csv_file` (string): Path to CSV file

---

## Process

### 1. Validate Inputs

Check file exists and table exists:

```bash
echo "Validating inputs..."

DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
test -n "$DB_URL" || {
  echo "❌ Missing SUPABASE_DB_URL or DATABASE_URL"
  exit 1
}

# Check CSV file exists
[ -f "{csv_file}" ] || {
  echo "❌ File not found: {csv_file}"
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

# Count CSV rows
ROW_COUNT=$(wc -l < "{csv_file}" | tr -d ' ')
echo "✓ CSV file: {csv_file} ($ROW_COUNT rows)"
echo "✓ Target table: {table}"
```

### 2. Preview CSV Structure

Show first few rows:

```bash
echo "CSV Preview (first 5 rows):"
head -n 5 "{csv_file}"
echo ""
echo "Continue with import? (yes/no)"
read CONFIRM
[ "$CONFIRM" = "yes" ] || { echo "Aborted"; exit 0; }
```

### 3. Create Staging Table

Import to staging first for validation:

```bash
echo "Creating staging table..."

psql "$DB_URL" << 'EOF'
-- Create staging table with same structure as target
CREATE TEMP TABLE {table}_staging (LIKE {table} INCLUDING ALL);

-- Or if you need to define structure manually:
-- CREATE TEMP TABLE {table}_staging (
--   id TEXT,
--   name TEXT,
--   created_at TEXT
--   -- Define all columns as TEXT initially for flexible parsing
-- );

SELECT 'Staging table created' AS status;
EOF

echo "✓ Staging table ready"
```

### 4. COPY Data to Staging

Use PostgreSQL COPY command (fastest method):

```bash
echo "Loading CSV into staging table..."

# Method 1: Using psql \copy (client-side file)
psql "$DB_URL" << 'EOF'
\copy {table}_staging FROM '{csv_file}' WITH (
  FORMAT csv,
  HEADER true,
  DELIMITER ',',
  QUOTE '"',
  ESCAPE '"',
  NULL 'NULL'
);
EOF

# Method 2: Server-side COPY (if file is on server)
# COPY {table}_staging FROM '/path/to/file.csv' WITH (FORMAT csv, HEADER true);

echo "✓ Data loaded to staging"
```

### 5. Validate Data

Run validation checks before merging:

```bash
echo "Validating staged data..."

psql "$DB_URL" << 'EOF'
-- Check row count
SELECT COUNT(*) AS staged_rows FROM {table}_staging;

-- Check for NULL in required columns (example)
SELECT COUNT(*) AS null_ids
FROM {table}_staging
WHERE id IS NULL;

-- Check for duplicates (example)
SELECT id, COUNT(*) AS duplicates
FROM {table}_staging
GROUP BY id
HAVING COUNT(*) > 1;

-- Check data types can be converted (example)
SELECT
  COUNT(*) FILTER (WHERE created_at::timestamptz IS NULL) AS invalid_dates
FROM {table}_staging;

-- Any validation failures?
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM {table}_staging WHERE id IS NULL) THEN
      'FAIL: NULL ids found'
    WHEN EXISTS (SELECT 1 FROM {table}_staging GROUP BY id HAVING COUNT(*) > 1) THEN
      'FAIL: Duplicate ids found'
    ELSE
      'PASS: All validations passed'
  END AS validation_status;
EOF

echo ""
echo "Review validation results above."
echo "Continue with merge? (yes/no)"
read CONFIRM
[ "$CONFIRM" = "yes" ] || { echo "Aborted - data in staging table for review"; exit 1; }
```

### 6. Merge to Target Table

Use UPSERT pattern for idempotency:

```bash
echo "Merging to target table..."

psql "$DB_URL" << 'EOF'
BEGIN;

-- Insert new rows or update existing (idempotent)
INSERT INTO {table} (id, name, created_at, ...)
SELECT
  id::uuid,                  -- Cast to proper types
  name,
  created_at::timestamptz,
  ...
FROM {table}_staging
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  created_at = EXCLUDED.created_at,
  updated_at = NOW();  -- Update timestamp

-- Get counts
SELECT
  (SELECT COUNT(*) FROM {table}) AS final_count,
  (SELECT COUNT(*) FROM {table}_staging) AS imported_count;

COMMIT;

SELECT 'Import complete' AS status;
EOF

echo "✓ Data merged successfully"
```

### 7. Cleanup

Drop staging table:

```bash
echo "Cleaning up..."

psql "$DB_URL" << 'EOF'
DROP TABLE IF EXISTS {table}_staging;
EOF

echo "✓ Cleanup complete"
```

---

## Output

Display import summary:

```
✅ CSV IMPORT COMPLETE

CSV File:       {csv_file}
Target Table:   {table}
Rows Imported:  {count}
Duration:       {duration}s

Validation:
✓ No NULL in required columns
✓ No duplicate keys
✓ All data types valid

Next steps:
- Verify data in database
- Run smoke tests if needed
- Update statistics: ANALYZE {table};
```

---

## Best Practices

### CSV Format Requirements

**Required:**
- UTF-8 encoding
- Consistent delimiters (comma recommended)
- Header row with column names
- Quoted strings if they contain delimiters

**Example:**
```csv
id,name,email,created_at
"user-1","John Doe","john@example.com","2024-01-01 00:00:00"
"user-2","Jane Smith","jane@example.com","2024-01-02 00:00:00"
```

### Handling Large Files

For CSV files > 100MB or > 1M rows:

1. **Split the file:**
```bash
split -l 100000 large.csv chunk_
```

2. **Import in batches:**
```bash
for file in chunk_*; do
  *load-csv {table} $file
done
```

3. **Or use streaming COPY:**
```bash
cat large.csv | psql "$DB_URL" -c \
  "COPY {table} FROM STDIN WITH (FORMAT csv, HEADER true);"
```

### Data Type Conversion

Always cast from TEXT to proper types in SELECT:

```sql
SELECT
  id::uuid,                    -- UUID
  amount::numeric(10,2),       -- Decimal
  created_at::timestamptz,     -- Timestamp
  is_active::boolean,          -- Boolean
  metadata::jsonb             -- JSON
FROM {table}_staging
```

---

## Common Issues

### Issue 1: Character Encoding

**Error:** `invalid byte sequence for encoding "UTF8"`

**Fix:**
```bash
# Convert to UTF-8
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
```

### Issue 2: Quote/Delimiter Conflicts

**Error:** `unterminated CSV quoted field`

**Fix:** Adjust COPY parameters:
```sql
COPY table FROM 'file.csv' WITH (
  DELIMITER ';',    -- Change delimiter
  QUOTE '''',       -- Change quote character
  ESCAPE '\'       -- Change escape character
);
```

### Issue 3: NULL Values

**Error:** `null value in column "id" violates not-null constraint`

**Fix:** Define NULL representation:
```sql
COPY table FROM 'file.csv' WITH (
  NULL 'NULL',      -- Treat literal "NULL" as NULL
  -- Or NULL ''     -- Treat empty strings as NULL
);
```

---

## Security Notes

- **Never** COPY from untrusted sources without validation
- Always use staging table first
- Validate data types and constraints before merging
- Check for SQL injection in CSV content (though COPY is safe)
- Consider row-level security (RLS) when loading to Supabase

---

## Performance Tips

1. **Disable triggers during bulk load:**
```sql
ALTER TABLE {table} DISABLE TRIGGER ALL;
-- Load data
ALTER TABLE {table} ENABLE TRIGGER ALL;
```

2. **Drop indexes, load, recreate:**
```sql
-- Only for initial loads, not updates!
DROP INDEX idx_name;
-- Load data
CREATE INDEX CONCURRENTLY idx_name ON {table}(column);
```

3. **Use UNLOGGED tables for staging:**
```sql
CREATE UNLOGGED TABLE {table}_staging (...);
-- Faster writes, but not crash-safe
```

4. **Batch commits:**
```sql
-- For very large loads
BEGIN;
COPY ... -- Load 100k rows
COMMIT;
BEGIN;
COPY ... -- Load next 100k rows
COMMIT;
```

---

## Alternative: INSERT from Application

For small datasets (<1000 rows), can use regular INSERT:

```javascript
// Supabase client example
const { data, error } = await supabase
  .from('table')
  .upsert(csvData, { onConflict: 'id' })
```

But COPY is **10-100x faster** for bulk loads!

---

## References

- [PostgreSQL COPY Documentation](https://www.postgresql.org/docs/current/sql-copy.html)
- [psql \copy Command](https://www.postgresql.org/docs/current/app-psql.html)
