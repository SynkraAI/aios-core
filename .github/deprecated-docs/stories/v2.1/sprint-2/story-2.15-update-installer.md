# STORY 2.15: Update Installer for Modules

**ID:** 2.15 | **Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md)
**Sprint:** 2 | **Points:** 3 | **Priority:** 🟠 High | **Created:** 2025-01-19
**Updated:** 2025-12-01
**Status:** ✅ Done

**Reference:** [ADR-002 Migration Map](../../architecture/decisions/ADR-002-migration-map.md)
**Quality Gate:** [2.15-update-installer.yml](../../qa/gates/2.15-update-installer.yml)

**Unblocked:** 2025-12-01 - Story 2.14 (Migration Script) completed and pushed to main

---

## 📊 User Story

**Como** new user, **Quero** installer criar estrutura modular, **Para** começar com v2.1 architecture desde o início

---

## ✅ Acceptance Criteria

### Module Structure Creation
- [x] AC15.1: Installer creates `.aios-core/core/` directory
- [x] AC15.2: Installer creates `.aios-core/development/` directory
- [x] AC15.3: Installer creates `.aios-core/product/` directory
- [x] AC15.4: Installer creates `.aios-core/infrastructure/` directory

### File Generation
- [x] AC15.5: Core module files generated in correct location
- [x] AC15.6: Development module files generated in correct location
- [x] AC15.7: Product module files generated in correct location
- [x] AC15.8: Infrastructure module files generated in correct location

### Manifest Generation
- [x] AC15.9: Manifest files generated during install
- [x] AC15.10: agents.csv populated with default agents
- [x] AC15.11: workers.csv populated with default workers

### Backward Compatibility
- [x] AC15.12: `--legacy` flag creates v2.0 flat structure
- [x] AC15.13: Default behavior is v2.1 modular structure

---

## 🔧 Scope

### Updated Installer Output

```bash
$ npx aios-fullstack init my-project

🚀 AIOS-FullStack Installer v2.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Creating project: my-project

✓ Created project directory
✓ Initialized package.json
✓ Installing dependencies...

Creating modular AIOS structure...
  ✓ .aios-core/core/           (registry, quality-gates, manifest)
  ✓ .aios-core/development/    (agents, tasks, templates, checklists)
  ✓ .aios-core/product/        (cli, api)
  ✓ .aios-core/infrastructure/ (config, hooks, telemetry)

✓ Generated 11 agent definitions
✓ Generated 45 task templates
✓ Generated manifest files
✓ Created CLI structure

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Project created successfully!

cd my-project
aios --help

# Legacy v2.0 structure (if needed)
$ npx aios-fullstack init my-project --legacy
```

### Module Directory Structure

```
my-project/
├── .aios-core/
│   ├── core/
│   │   ├── registry/
│   │   ├── quality-gates/
│   │   ├── manifest/
│   │   └── utils/
│   ├── development/
│   │   ├── agents/
│   │   ├── tasks/
│   │   ├── templates/
│   │   ├── checklists/
│   │   └── scripts/
│   ├── product/
│   │   ├── cli/
│   │   └── api/
│   └── infrastructure/
│       ├── config/
│       ├── hooks/
│       └── telemetry/
├── .aios/
│   └── project-status.yaml
├── docs/
└── package.json
```

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Infrastructure/Installer
**Secondary Type(s)**: File Generation
**Complexity**: Low-Medium (updating existing installer)

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Installer updates

**Supporting Agents:**
- @qa: Fresh install testing

### Quality Gate Tasks

- [x] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@github-devops): Run before creating pull request

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 10 minutes
- Severity Filter: CRITICAL only

---

## 📋 Tasks

### Installer Updates (4h)
- [x] 2.15.1: Update directory creation logic (1.5h)
- [x] 2.15.2: Update file generation paths (1.5h)
- [x] 2.15.3: Add `--legacy` flag support (1h)

### File Generation (2h)
- [x] 2.15.4: Update agent file generation paths (0.5h)
- [x] 2.15.5: Update task file generation paths (0.5h)
- [x] 2.15.6: Add manifest generation step (1h)

### Testing (2h)
- [x] 2.15.7: Test fresh install creates correct structure (1h)
- [x] 2.15.8: Test --legacy flag works (0.5h)
- [x] 2.15.9: Run smoke tests INS-01 to INS-06 (0.5h)

**Total Estimated:** 8h

---

## 🧪 Smoke Tests (INS-01 to INS-06)

| Test ID | Name | Description | Priority | Pass Criteria |
|---------|------|-------------|----------|---------------|
| INS-01 | Core Created | core/ directory exists | P0 | Dir with files |
| INS-02 | Dev Created | development/ directory exists | P0 | Dir with files |
| INS-03 | Product Created | product/ directory exists | P0 | Dir with files |
| INS-04 | Infra Created | infrastructure/ directory exists | P0 | Dir with files |
| INS-05 | Manifests | Manifest files generated | P1 | CSV files exist |
| INS-06 | Legacy Mode | --legacy creates flat structure | P1 | Old structure |

**Rollback Triggers:**
- INS-01 to INS-04 fails → Structure broken, rollback

---

## 🔗 Dependencies

**Depends on:**
- [Story 2.14](./story-2.14-migration-script.md) - Migration script tested

**Blocks:**
- Story 2.16 (Documentation) - Installation docs

---

## 📝 Dev Notes

### Installer File Structure
The installer codebase is split across two locations:
- `tools/installer/` - Core installer logic
- `packages/installer/` - Package-based installer with config/templates

### Key Files to Understand
1. **`tools/installer/lib/installer.js`** - Main Installer class with `install()` method
2. **`tools/installer/lib/file-manager.js`** - FileManager class for copy operations
3. **`tools/installer/lib/module-manager.js`** - ModuleManager (may need v2.1 updates)
4. **`tools/installer/config/install.config.yaml`** - Configuration for installation paths

### Reusable from Story 2.14
The migration script (`.aios-core/cli/commands/migrate/`) created `MODULE_MAPPING` constant that defines the v2.1 module structure. This can be imported/reused:
```javascript
// From .aios-core/cli/commands/migrate/analyze.js
const MODULE_MAPPING = {
  core: { directories: ['registry', 'quality-gates', 'manifest', 'utils'] },
  development: { directories: ['agents', 'tasks', 'templates', 'checklists', 'scripts'] },
  product: { directories: ['cli', 'api'] },
  infrastructure: { directories: ['config', 'hooks', 'telemetry'] }
};
```

### Implementation Approach
1. Create a shared module structure definition (or import from migrate/analyze.js)
2. Update `installer.js` to create 4 module directories under `.aios-core/`
3. Update file generation to place files in correct module paths
4. Add `--legacy` flag that skips module structure (creates flat `.aios-core/`)
5. Add manifest generation (agents.csv, workers.csv) during install

---

## 📋 Rollback Plan

| Condition | Action |
|-----------|--------|
| INS-01-04 fails | Revert installer changes |
| INS-05 fails | Fix manifest generation |

```bash
git revert --no-commit HEAD~N
```

---

## 📁 File List

**Modified:**
- `tools/installer/bin/aios.js` (added --legacy flag to CLI)
- `tools/installer/lib/installer.js` (v2.1 module paths, expansion pack core dependencies)
- `tools/installer/lib/config-loader.js` (v2.1 module paths for agents, teams, dependencies)
- `tools/installer/lib/resource-locator.js` (v2.1 module paths, module mapping, forward-slash normalization)
- `tools/installer/lib/file-manager.js` (path normalization for cross-platform consistency)
- `src/installer/aios-core-installer.js` (added v2.1 modules to FOLDERS_TO_COPY)
- `src/wizard/ide-config-generator.js` (fixed agent source path to development/agents/)
- `.npmignore` (fixed to include .md files inside .aios-core)

**Created:**
- `tests/installer/v21-structure.test.js` (23 tests for v2.1 structure validation)

---

## ✅ Definition of Done

- [x] Fresh install creates 4-module structure
- [x] All default files in correct locations
- [x] Manifest files generated
- [x] --legacy flag works
- [x] All P0 smoke tests pass (INS-01 to INS-04)
- [x] All P1 smoke tests pass (INS-05 to INS-06)
- [x] Story checkboxes updated to [x]
- [x] QA Review passed
- [x] PR created and approved

---

## 🤖 Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References
- All 81 installer tests pass (23 new v2.1 structure tests)
- Linting passes (warnings only, no errors)

### Completion Notes
1. **CLI Update:** Added `--legacy` flag to `tools/installer/bin/aios.js`
2. **Resource Locator:** Updated to use `.aios-core` source with v2.1 modular paths
3. **Config Loader:** Updated all path methods to use v2.1 module structure
4. **Installer:** Updated single-agent paths and expansion pack dependency resolution
5. **Module Mapping:** Implemented consistent mapping across all files:
   - `tasks` → `development/tasks`
   - `agents` → `development/agents`
   - `templates` → `product/templates`
   - `checklists` → `product/checklists`
   - `utils` → `core/utils`
   - etc.
6. **Tests:** Created 23 comprehensive tests for v2.1 structure validation

---

## ✅ QA Results

### Smoke Tests Results (INS-01 to INS-06)

| Test ID | Name | Result | Notes |
|---------|------|--------|-------|
| INS-01 | Core Created | ✅ Pass | `tests/installer/v21-structure.test.js` - core/utils verified |
| INS-02 | Dev Created | ✅ Pass | `tests/installer/v21-structure.test.js` - development/agents, development/tasks verified |
| INS-03 | Product Created | ✅ Pass | `tests/installer/v21-structure.test.js` - product/templates, product/checklists verified |
| INS-04 | Infra Created | ✅ Pass | `tests/installer/v21-structure.test.js` - infrastructure module verified |
| INS-05 | Manifests | ✅ Pass | `tests/installer/v21-structure.test.js` - agents.csv, tasks.csv, workers.csv verified |
| INS-06 | Legacy Mode | ✅ Pass | `tests/installer/v21-structure.test.js` - --legacy flag support verified |

### Gate Decision
**PASS** - QA Review completed by Quinn (QA) on 2025-12-01

All acceptance criteria verified. 81 tests pass (23 new v2.1 structure tests).
All 6 smoke tests (INS-01 to INS-06) passing. Code quality good.

---

## 📝 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-19 | 0.1 | Story created (bundled in 2.10-2.16) | River |
| 2025-11-30 | 1.0 | Sharded to individual file, full enrichment | Pax |
| 2025-12-01 | 1.1 | Unblocked - Story 2.14 complete, Ready for Dev | Pax |
| 2025-12-01 | 1.2 | Fixed file references in File List (validation pass) | Pax |
| 2025-12-01 | 2.0 | Implementation complete - v2.1 module paths, --legacy flag, 23 tests | Dex |
| 2025-12-01 | 2.1 | QA Review PASS - All 81 tests pass, all smoke tests verified | Quinn |
| 2025-12-01 | 2.2 | Hotfix: path normalization (Windows), .npmignore fix for .md files | Dex |
| 2025-12-01 | 2.3 | Hotfix: aios-core-installer.js FOLDERS_TO_COPY missing v2.1 modules | Dex |
| 2025-12-01 | 2.4 | Hotfix: ide-config-generator.js agent source path (development/agents) | Dex |

---

**Criado por:** River 🌊
**Refinado por:** Pax 🎯 (PO) - 2025-11-30
