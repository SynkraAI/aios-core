---
checklist-id: database-migration-documentation-checklist
name: Database Migration Documentation Checklist
version: 1.0
created: 2025-10-28
category: database
purpose: Ensure database documentation is updated after every migration to prevent documentation drift
---

# 📝 Database Migration Documentation Checklist

**Purpose:** This checklist MUST be completed after EVERY schema migration to keep documentation synchronized with the actual database state.

**When to use:** Immediately after applying a migration to production (or staging).

---

## ✅ Mandatory Steps (DO NOT SKIP)

### 1. Update Version Metadata

- [ ] **Determine new version number**
  - Major version (vX.0.0): Breaking changes, new major features
  - Minor version (v0.X.0): New tables, columns, features (backward compatible)
  - Patch version (v0.0.X): Bug fixes, index changes, cleanups

- [ ] **Update `docs/database/README.md` YAML metadata**
  ```yaml
  current_schema:
    version: "vX.Y.Z"  # Update version
    migration: "path/to/latest/migration.sql"  # Update migration file
    snapshot: "path/to/snapshot.sql"  # Update snapshot path
    deployed_date: "YYYY-MM-DD"  # Update date
  ```

- [ ] **Update version history table in README**
  - Add new row with: version, date, description, migration link, docs link
  - Mark previous version as non-current (remove **CURRENT** badge)

### 2. Update Current Schema Section

- [ ] **Update version header**
  ```markdown
  **Version:** vX.Y.Z (Brief Description)
  **Deployed:** YYYY-MM-DD
  ```

- [ ] **Update architecture stats** (if changed)
  - Table count
  - View count
  - Function count
  - RLS policy count
  - Index count

- [ ] **Document changes** (summary)
  - New tables (if any)
  - Modified tables (if any)
  - Removed columns/tables (if any)
  - Index changes
  - Why these changes were made

### 3. Create Version Documentation (for Minor/Major versions)

- [ ] **Create `docs/database/evolution/X.Y_README.md`**
  - Copy template from existing version docs
  - Document all changes in detail
  - Include migration guide
  - Include rollback instructions
  - Include use cases/examples
  - Document breaking changes
  - Add performance impact notes

- [ ] **Update `docs/database/evolution/README.md`**
  - Add new version to timeline
  - Link to new version documentation

### 4. Update Evolution History

- [ ] **Add entry to `database.evolution.versions` in README YAML**
  ```yaml
  - version: "vX.Y.Z"
    date: "YYYY-MM-DD"
    migration: "filename.sql"
    changes: "Brief description"
  ```

### 5. Update Pending Migrations (if applicable)

- [ ] **Remove applied migration from pending list**
  ```yaml
  pending_migrations:
    - version: "vX.Y.Z"  # Remove this if now applied
  ```

### 6. Create Schema Snapshot

- [ ] **Create snapshot after migration**
  ```bash
  ./scripts/db-snapshot.sh vX_Y_Z_$(date +%Y%m%d%H%M%S)_after
  ```

- [ ] **Update snapshot path in README metadata**

### 7. Update Last Audit Info (if audit was performed)

- [ ] **Update audit date in README**
  ```yaml
  last_audit: "YYYY-MM-DD"
  audit_report: "path/to/audit/report.md"
  ```

- [ ] **Link to audit report** (if new audit performed)

---

## 🎯 Version-Specific Guidelines

### For Patch Versions (v0.0.X)

**Examples:** Index changes, constraint fixes, typo corrections

**Required:**
- ✅ Update version metadata in README
- ✅ Update version history table
- ✅ Document changes in "Current Schema" section

**Optional:**
- ⚪ Create standalone version documentation (can be skipped for trivial changes)
- ⚪ Update evolution history YAML (recommended but not critical)

### For Minor Versions (v0.X.0)

**Examples:** New tables, new columns, new features

**Required:**
- ✅ ALL mandatory steps above
- ✅ Create `docs/database/evolution/X.Y_README.md`
- ✅ Document breaking changes (if any)
- ✅ Include migration guide
- ✅ Create schema snapshot

### For Major Versions (vX.0.0)

**Examples:** Major refactoring, breaking changes, architecture changes

**Required:**
- ✅ ALL mandatory steps above
- ✅ Comprehensive version documentation
- ✅ Detailed migration guide with rollback plan
- ✅ Performance impact analysis
- ✅ Breaking changes clearly documented
- ✅ Update all dependent documentation
- ✅ Run full schema audit (`*schema-audit`)

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't Do This

1. **Skip documentation** - "I'll do it later"
   - **Result:** Documentation drift, confusion, lost context

2. **Update only the migration file** - Forget to update README
   - **Result:** DB Sage loads wrong version, documentation is stale

3. **Use wrong version number** - Copy-paste old version
   - **Result:** Version history is incorrect, snapshots mismatched

4. **Forget to update YAML metadata** - Only update prose
   - **Result:** DB Sage can't discover current schema programmatically

5. **Skip snapshot creation** - "We have the migration"
   - **Result:** No baseline for diffs, rollback is harder

6. **Document pending migrations as applied** - Wishful thinking
   - **Result:** Confusion about what's actually in production

### ✅ Do This Instead

1. **Update docs IMMEDIATELY after applying migration**
   - Set reminder/alarm
   - Add to your migration SOP
   - Make it muscle memory

2. **Use this checklist EVERY TIME**
   - Print it
   - Bookmark it
   - Add to your workflow

3. **Double-check version numbers**
   - Query database: `SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;`
   - Match against migration filename
   - Update YAML metadata first, then prose

4. **Keep YAML and prose in sync**
   - YAML is source of truth for DB Sage
   - Prose is source of truth for humans
   - Both must match

5. **Create snapshot BEFORE and AFTER migration**
   - Before: Rollback safety net
   - After: New baseline for future diffs

---

## 🔄 Integration with Migration Workflow

This checklist should be executed as **Step 10** of the `modify-schema-workflow.yaml`:

```yaml
# squads/db-sage/workflows/modify-schema-workflow.yaml
steps:
  - step: 1-9
    action: [validation, migration, smoke-test...]
  - step: 10  # ← DOCUMENTATION STEP
    action: update-documentation
    checklist: squads/db-sage/checklists/database-migration-documentation-checklist.md
  - step: 11
    action: success-summary
```

---

## 📋 Quick Reference Template

**Copy-paste this after every migration:**

```markdown
## Documentation Update Checklist - vX.Y.Z

Date: YYYY-MM-DD
Migration: YYYYMMDDHHMMSS_vX_Y_Z_description.sql

- [ ] Updated version in docs/database/README.md YAML
- [ ] Updated version history table
- [ ] Updated "Current Schema" section
- [ ] Created/updated docs/database/evolution/X.Y_README.md
- [ ] Created schema snapshot (vX_Y_Z_YYYYMMDD_after.sql)
- [ ] Updated evolution history YAML
- [ ] Removed from pending migrations (if applicable)
- [ ] Verified DB Sage can load new version

**Changes Summary:**
[Brief description of what changed]

**Breaking Changes:**
[None / List breaking changes]

**Next Version:** vX.Y.Z+1 (planned)
```

---

## ✅ Verification Steps

After completing this checklist:

1. **Verify DB Sage activation**
   ```bash
   # In Claude Code
   /db-sage
   # Check that it loads correct version in first message
   ```

2. **Verify README YAML is valid**
   ```bash
   # Use any YAML validator
   yamllint docs/database/README.md
   ```

3. **Verify links work**
   - Click all links in README
   - Ensure version docs exist
   - Ensure snapshots exist
   - Ensure migrations exist

4. **Verify version consistency**
   ```bash
   # Should all match
   grep "version:" docs/database/README.md
   grep "Version:" docs/database/README.md
   ls docs/database/evolution/*.md | tail -1
   ```

---

## 🆘 Troubleshooting

**Problem:** "I forgot to update docs after migration, now I'm lost"

**Solution:**
1. Query database: `SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5;`
2. Identify last documented version in README
3. Read migration files between last documented and current
4. Apply this checklist retroactively for each version

**Problem:** "DB Sage loads wrong version"

**Solution:**
1. Check `docs/database/README.md` YAML metadata
2. Verify `current_schema.version` matches actual DB version
3. Verify `current_schema.documentation` path exists
4. Restart DB Sage

**Problem:** "Version numbers are inconsistent"

**Solution:**
1. Decide on canonical version (from database or last snapshot)
2. Update ALL references: README YAML, README prose, evolution docs, snapshot filenames
3. Create new snapshot with correct version
4. Document correction in `docs/database/CHANGELOG.md`

---

## 📚 Related Documentation

- [Database README](../../../docs/database/README.md) - Main database documentation
- [Schema Evolution History](../../../docs/database/evolution/README.md) - Historical versions
- [Migration Workflow](../workflows/modify-schema-workflow.yaml) - Migration process
- [DB Sage Agent](../.claude/agents/SA/agents/db-sage.md) - Database agent

---

**Checklist Version:** 1.0
**Last Updated:** 2025-10-28
**Maintained By:** DB Sage
**Review Frequency:** After every breaking change to migration workflow

---

## 🎓 Training: Why This Matters

**Story:**

"We had v0.7.0 in the README, but the database was actually at v0.8.2. DB Sage kept saying 'loaded v0.7.0' but the schema had 4 new tables. Queries failed. Documentation lied. Team was confused."

**Lesson:**

Documentation drift is **technical debt**. This checklist prevents it by making documentation updates **mandatory and immediate**, not optional and deferred.

**Investment:**

- **Time cost:** 10-15 minutes per migration
- **Time saved:** Hours of confusion, debugging, and re-discovery
- **Quality gain:** Documentation always reflects reality

**Remember:** Your future self (and teammates) will thank you for updating docs today.
