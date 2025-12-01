# STORY 2.14: Migration Script v2.0 → v2.1

**ID:** 2.14 | **Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md)
**Sprint:** 2 | **Points:** 13 | **Priority:** 🔴 Critical | **Created:** 2025-01-19
**Updated:** 2025-12-01
**Status:** 🟢 Ready for Dev

**Reference:** [ADR-002 Migration Map](../../architecture/decisions/ADR-002-migration-map.md)
**Quality Gate:** [2.14-migration-script.yml](../../qa/gates/2.14-migration-script.yml)

**Unblocked:** 2025-12-01 - All Sprint 2 dependencies complete (Stories 2.2-2.13 Done)

---

## 📊 User Story

**Como** developer em v2.0, **Quero** script automático de migração, **Para** atualizar para v2.1 sem perder dados

---

## ✅ Acceptance Criteria

### Backup System
- [ ] AC14.1: Creates backup before migration (`.aios-backup-{date}/`)
- [ ] AC14.2: Backup includes all .aios-core files
- [ ] AC14.3: Backup includes relevant config files
- [ ] AC14.4: Backup is verifiable (checksum/manifest)

### Structure Analysis
- [ ] AC14.5: Detects current v2.0 structure
- [ ] AC14.6: Identifies files to migrate per module
- [ ] AC14.7: Reports migration plan before executing
- [ ] AC14.8: Identifies potential conflicts

### Migration Execution
- [ ] AC14.9: Migrates Core module files correctly
- [ ] AC14.10: Migrates Development module files correctly
- [ ] AC14.11: Migrates Product module files correctly
- [ ] AC14.12: Migrates Infrastructure module files correctly
- [ ] AC14.13: Preserves file permissions and metadata

### Import Updates
- [ ] AC14.14: Updates all require/import paths
- [ ] AC14.15: Updates relative path references
- [ ] AC14.16: Updates config file references
- [ ] AC14.17: No broken imports after migration

### Validation
- [ ] AC14.18: Validates migrated structure
- [ ] AC14.19: Runs lint on migrated files
- [ ] AC14.20: Runs tests after migration
- [ ] AC14.21: Reports migration summary with stats

### Rollback
- [ ] AC14.22: `--rollback` flag restores from backup
- [ ] AC14.23: Rollback is atomic (all or nothing)
- [ ] AC14.24: Rollback removes v2.1 artifacts

### CLI
- [ ] AC14.25: `aios migrate` command available
- [ ] AC14.26: `--from=2.0 --to=2.1` version flags
- [ ] AC14.27: `--dry-run` shows plan without executing
- [ ] AC14.28: `--verbose` shows detailed progress

---

## 🔧 Scope

### Migration Flow

```bash
$ aios migrate --from=2.0 --to=2.1

🔄 AIOS Migration v2.0 → v2.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Backup
  ✓ Creating backup...
  ✓ Backup created: .aios-backup-2025-11-30/
  ✓ Backup verified (checksum match)

Phase 2: Analysis
  ✓ Analyzing current structure...
  ✓ Found 98 files to migrate
  ✓ Identified 4 target modules

  Migration Plan:
  ┌─────────────────┬───────┬─────────────┐
  │ Module          │ Files │ Size        │
  ├─────────────────┼───────┼─────────────┤
  │ Core            │ 23    │ 145 KB      │
  │ Development     │ 45    │ 312 KB      │
  │ Product         │ 12    │ 78 KB       │
  │ Infrastructure  │ 18    │ 156 KB      │
  └─────────────────┴───────┴─────────────┘
  Total: 98 files, 691 KB

  Proceed with migration? [Y/n]: Y

Phase 3: Migration
  ✓ Creating module directories...
  ✓ Migrating Core module (23 files)
  ✓ Migrating Development module (45 files)
  ✓ Migrating Product module (12 files)
  ✓ Migrating Infrastructure module (18 files)

Phase 4: Import Updates
  ✓ Scanning for import statements...
  ✓ Found 156 imports to update
  ✓ Updating imports...
  ✓ All imports updated

Phase 5: Validation
  ✓ Validating structure...
  ✓ Running lint... 0 errors
  ✓ Running tests... 156 passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Migration complete! (3 min 42s)

Summary:
  • Files migrated: 98
  • Imports updated: 156
  • Backup location: .aios-backup-2025-11-30/

Next steps:
  1. Test your project: npm test
  2. Review changes: git diff
  3. Report issues: github.com/aios/issues

To rollback: aios migrate --rollback
```

### Module Mapping

```yaml
# Migration mapping v2.0 → v2.1
modules:
  core:
    source: ".aios-core/"
    target: ".aios-core/core/"
    files:
      - registry/**
      - quality-gates/**
      - manifest/**
      - utils/**

  development:
    source: ".aios-core/"
    target: ".aios-core/development/"
    files:
      - agents/**
      - tasks/**
      - templates/**
      - checklists/**
      - scripts/**

  product:
    source: ".aios-core/"
    target: ".aios-core/product/"
    files:
      - cli/**
      - api/**

  infrastructure:
    source: ".aios-core/"
    target: ".aios-core/infrastructure/"
    files:
      - config/**
      - hooks/**
      - telemetry/**
```

### Rollback Mechanism

```bash
$ aios migrate --rollback

🔙 AIOS Migration Rollback
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found backup: .aios-backup-2025-11-30/
  Created: 2025-11-30 14:32:15
  Files: 98
  Size: 691 KB

Restore from this backup? [Y/n]: Y

  ✓ Removing v2.1 structure...
  ✓ Restoring v2.0 files...
  ✓ Restoring configs...
  ✓ Validating restored structure...

✅ Rollback complete!

Your project is now at v2.0 state.
```

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: CLI Tool/Migration
**Secondary Type(s)**: Infrastructure, Data Transformation
**Complexity**: Very High (file operations, path manipulation, validation)

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Core implementation
- @architect: Migration strategy review

**Supporting Agents:**
- @qa: Migration testing with real projects

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@github-devops): Run before creating pull request

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @dev (strict mode)
- Max Iterations: 3
- Timeout: 20 minutes
- Severity Filter: CRITICAL, HIGH

### CodeRabbit Focus Areas

**Primary Focus:**
- File operation safety (no data loss)
- Path manipulation correctness
- Rollback atomicity
- Error handling completeness

**Secondary Focus:**
- Progress reporting
- User confirmation points
- Backup verification

---

## 📋 Tasks

### Backup System (5h)
- [ ] 2.14.1: Implement backup directory creation (1h)
- [ ] 2.14.2: Implement file copy with metadata (2h)
- [ ] 2.14.3: Implement checksum verification (1h)
- [ ] 2.14.4: Create backup manifest (1h)

### Structure Analysis (4h)
- [ ] 2.14.5: Implement v2.0 structure detector (1.5h)
- [ ] 2.14.6: Create module mapping logic (1.5h)
- [ ] 2.14.7: Build migration plan generator (1h)

### Migration Execution (10h)
- [ ] 2.14.8: Implement directory creation (1h)
- [ ] 2.14.9: Implement file migration for Core (2h)
- [ ] 2.14.10: Implement file migration for Development (2.5h)
- [ ] 2.14.11: Implement file migration for Product (2h)
- [ ] 2.14.12: Implement file migration for Infrastructure (2.5h)

### Import Updates (6h)
- [ ] 2.14.13: Build import scanner (2h)
- [ ] 2.14.14: Create path transformer (2h)
- [ ] 2.14.15: Implement import updater (2h)

### Validation (4h)
- [ ] 2.14.16: Structure validator (1h)
- [ ] 2.14.17: Lint integration (1h)
- [ ] 2.14.18: Test runner integration (1h)
- [ ] 2.14.19: Summary reporter (1h)

### Rollback (4h)
- [ ] 2.14.20: Implement rollback command (2h)
- [ ] 2.14.21: Atomic restore logic (1.5h)
- [ ] 2.14.22: Cleanup v2.1 artifacts (0.5h)

### CLI & Testing (5h)
- [ ] 2.14.23: Create `aios migrate` command (1h)
- [ ] 2.14.24: Implement CLI flags (1h)
- [ ] 2.14.25: Unit tests (1.5h)
- [ ] 2.14.26: Test with sample v2.0 projects (1.5h)

**Total Estimated:** 38h

---

## 🧪 Smoke Tests (MIG-01 to MIG-15)

| Test ID | Name | Description | Priority | Pass Criteria |
|---------|------|-------------|----------|---------------|
| MIG-01 | Backup Created | Backup directory created | P0 | Dir exists with files |
| MIG-02 | Backup Verified | Checksum verification passes | P0 | Checksums match |
| MIG-03 | Analysis Works | Structure analysis completes | P0 | Plan generated |
| MIG-04 | Core Migrated | Core module files migrated | P0 | Files in correct location |
| MIG-05 | Dev Migrated | Development module migrated | P0 | Files in correct location |
| MIG-06 | Imports Updated | All imports rewritten | P0 | No broken imports |
| MIG-07 | Validation Pass | Post-migration validation OK | P0 | Lint + tests pass |
| MIG-08 | Rollback Works | Rollback restores v2.0 | P0 | Original state restored |
| MIG-09 | Dry Run | --dry-run shows plan only | P1 | No files changed |
| MIG-10 | Progress Output | Progress shown during migration | P1 | Output visible |
| MIG-11 | Conflict Detection | Detects existing v2.1 files | P1 | Warning shown |
| MIG-12 | Permissions | File permissions preserved | P1 | Permissions match |
| MIG-13 | Large Project | Works on 200+ file project | P2 | Completes < 5 min |
| MIG-14 | Partial Migration | Handles interrupted migration | P2 | Rollback available |
| MIG-15 | Real Project Test | Test on 3+ real v2.0 projects | P2 | All migrate correctly |

**Rollback Triggers:**
- MIG-01 to MIG-08 fails → Critical, rollback and fix
- Data loss detected → Immediate halt, restore backup

---

## 🔗 Dependencies

**Depends on:**
- All Sprint 2 stories (2.2-2.13) - Define target structure
- Stories 2.10, 2.11, 2.12, 2.13 must be complete

**Blocks:**
- Story 2.15 (Update Installer) - Needs migration tested first
- Story 2.16 (Documentation) - Migration guide

---

## 📋 Rollback Plan

| Condition | Action |
|-----------|--------|
| MIG-01 to MIG-08 fails | Immediate rollback |
| Data loss detected | HALT, restore backup, investigate |
| Import errors | Fix transformer, re-run |
| Validation fails | Rollback, fix target structure |

```bash
# Built-in rollback
aios migrate --rollback

# Manual rollback if command fails
cp -r .aios-backup-{date}/* .aios-core/
rm -rf .aios-core/core .aios-core/development .aios-core/product .aios-core/infrastructure
```

---

## 📁 File List

**Created:**
- `.aios-core/cli/commands/migrate/index.js`
- `.aios-core/cli/commands/migrate/backup.js`
- `.aios-core/cli/commands/migrate/analyze.js`
- `.aios-core/cli/commands/migrate/execute.js`
- `.aios-core/cli/commands/migrate/update-imports.js`
- `.aios-core/cli/commands/migrate/validate.js`
- `.aios-core/cli/commands/migrate/rollback.js`
- `.aios-core/core/migration/migration-config.yaml`
- `.aios-core/core/migration/module-mapping.yaml`
- `tests/unit/migration-backup.test.js`
- `tests/unit/migration-analyze.test.js`
- `tests/unit/migration-execute.test.js`
- `tests/integration/full-migration.test.js`

**Modified:**
- `.aios-core/cli/index.js` (register migrate command)

---

## ✅ Definition of Done

- [ ] Backup system creates verified backups
- [ ] All 4 modules migrate correctly
- [ ] All imports updated without breaks
- [ ] Validation passes after migration
- [ ] Rollback restores original state
- [ ] Dry-run works correctly
- [ ] All P0 smoke tests pass (MIG-01 to MIG-08)
- [ ] All P1 smoke tests pass (MIG-09 to MIG-12)
- [ ] All P2 smoke tests pass (MIG-13 to MIG-15)
- [ ] Tested on 3+ real v2.0 projects
- [ ] Story checkboxes updated to [x]
- [ ] QA Review passed
- [ ] PR created and approved

---

## 🤖 Dev Agent Record

### Agent Model Used
_To be filled by @dev agent_

### Debug Log References
_To be filled after implementation_

### Completion Notes
_To be filled after implementation_

---

## ✅ QA Results

### Smoke Tests Results (MIG-01 to MIG-15)

| Test ID | Name | Result | Notes |
|---------|------|--------|-------|
| MIG-01 | Backup Created | ⏳ Pending | |
| MIG-02 | Backup Verified | ⏳ Pending | |
| MIG-03 | Analysis Works | ⏳ Pending | |
| MIG-04 | Core Migrated | ⏳ Pending | |
| MIG-05 | Dev Migrated | ⏳ Pending | |
| MIG-06 | Imports Updated | ⏳ Pending | |
| MIG-07 | Validation Pass | ⏳ Pending | |
| MIG-08 | Rollback Works | ⏳ Pending | |
| MIG-09 | Dry Run | ⏳ Pending | |
| MIG-10 | Progress Output | ⏳ Pending | |
| MIG-11 | Conflict Detection | ⏳ Pending | |
| MIG-12 | Permissions | ⏳ Pending | |
| MIG-13 | Large Project | ⏳ Pending | |
| MIG-14 | Partial Migration | ⏳ Pending | |
| MIG-15 | Real Project Test | ⏳ Pending | |

### Gate Decision
_To be filled by @qa agent_

---

## 📝 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-19 | 0.1 | Story created (bundled in 2.10-2.16) | River |
| 2025-11-30 | 1.0 | Sharded to individual file, full enrichment | Pax |
| 2025-12-01 | 1.1 | Unblocked - All Sprint 2 dependencies complete, Ready for Dev | Pax |

---

**Criado por:** River 🌊
**Refinado por:** Pax 🎯 (PO) - 2025-11-30
