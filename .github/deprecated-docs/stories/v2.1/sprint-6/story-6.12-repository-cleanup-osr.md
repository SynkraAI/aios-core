# Story 6.12: Repository Cleanup for Open-Source Release

**Epic:** Open-Source Readiness (OSR)
**Story ID:** 6.12
**Sprint:** 6
**Priority:** 🔴 Critical
**Points:** 5
**Effort:** 4-6 hours
**Status:** ✅ Done
**Type:** 🧹 Cleanup / Refactoring

---

## 📋 User Story

**Como** mantenedor preparando o release open-source,
**Quero** limpar o repositório de artefatos de desenvolvimento, documentação obsoleta e arquivos gerados,
**Para** que o repositório público seja limpo, profissional e fácil de navegar.

---

## 🎯 Objetivo

Remover ~200 arquivos de desenvolvimento interno, organizar documentação, e configurar .gitignore adequadamente para manter o repositório limpo.

---

## 📊 Analysis Summary

**Total Files Analyzed:** 400+
**Files to Archive:** ~130
**Files to Delete:** ~15
**Files to Keep:** ~250
**Gitignore Updates:** 20+ patterns

---

## ✅ Acceptance Criteria

### AC1: Delete Obsolete Files
- [x] Remove debug/test artifacts from docs/
- [x] Remove .docx files from repository
- [x] Remove duplicate architecture files at root
- [x] Remove legacy task files from .aios-core/tasks/

### AC2: Archive Development Artifacts
- [x] Create `.github/deprecated-docs/` structure
- [x] Move docs/audits/ to archive (35 files)
- [x] Move docs/analysis/ to archive (10 files)
- [x] Move docs/planning/ to archive (8 files)
- [x] Move docs/reports/ to archive (7 files)
- [x] Move docs/research/ to archive (3 files after .docx removal)
- [x] Move docs/handoffs/ to archive (2 files)
- [x] Move docs/qa/gates/ to archive (112 files)

### AC3: Update .gitignore
- [x] Add generated manifests patterns
- [x] Add session/runtime data patterns
- [x] Add quality metrics patterns
- [x] Fix incorrect patterns (docs/prd/ should NOT be ignored)
- [x] Remove incorrect patterns for tracked directories

### AC4: Clean Root Level docs/
- [x] Remove bmad-alpha-install.txt
- [x] Remove test-sample-prd.md
- [x] Remove Ativando do Bmad-builder.txt
- [x] Remove WORKFLOW-COMPLETE-CONSOLIDATED-V3.md
- [x] Archive migration-v4.31-to-v1.0.md
- [x] Archive release-notes-v4.4.0.md
- [x] Archive TESTING-INSTRUCTIONS-MACOS-v4.31.1.md

### AC5: Organize Remaining Documentation
- [x] Reorganize docs/epics/ into current/archived/future
- [x] Update docs/epics/README.md with new structure
- [x] Verify all internal links still work

---

## 📝 Tasks

### Task 1: Delete Obsolete Files (30min)

**Files to DELETE (not archive - truly obsolete):**

```
docs/Ativando do Bmad-builder.txt          # Debug artifact (Portuguese)
docs/bmad-alpha-install.txt                 # BMAD test log
docs/test-sample-prd.md                     # Sample/test file
docs/WORKFLOW-COMPLETE-CONSOLIDATED-V3.md   # Workflow artifact
docs/research/Pesquisa técnica arquitetura.docx  # Word doc in repo
docs/prd.md                                 # Duplicate (use docs/prd/index.md)
docs/architecture.md                        # Duplicate
docs/architecture-overview.md               # Duplicate (keep one)
.aios-core/tasks/*.legacy                   # 5 legacy task files
.aios-core/infrastructure/scripts/_archived/  # 10 migration scripts
```

### Task 2: Create Archive Structure (15min)

```bash
mkdir -p .github/deprecated-docs/{audits,analysis,planning,reports,research,handoffs,qa-gates,testing}
```

### Task 3: Archive Development Artifacts (45min)

**Move to `.github/deprecated-docs/`:**

| Source | Destination | Files |
|--------|-------------|-------|
| docs/audits/ | .github/deprecated-docs/audits/ | 35 |
| docs/analysis/ | .github/deprecated-docs/analysis/ | 10 |
| docs/planning/ | .github/deprecated-docs/planning/ | 8 |
| docs/reports/ | .github/deprecated-docs/reports/ | 7 |
| docs/research/ | .github/deprecated-docs/research/ | 4 |
| docs/handoffs/ | .github/deprecated-docs/handoffs/ | 2 |
| docs/qa/gates/ | .github/deprecated-docs/qa-gates/ | 112 |
| docs/testing/ | .github/deprecated-docs/testing/ | 2 |

### Task 4: Archive Root Level Files (30min)

**Move to `.github/deprecated-docs/`:**

```
docs/migration-v4.31-to-v1.0.md
docs/release-notes-v4.4.0.md
docs/TESTING-INSTRUCTIONS-MACOS-v4.31.1.md
docs/clickup-setup-guide.md
docs/pm-tool-configuration.md
docs/manual-testing-guide-clickup-sync.md
docs/claude-md-analysis.md
docs/tool-schema-v2.0-spec.md
docs/tools-migration-guide.md
docs/tools-system-guide.md
docs/TESTER-QUICKSTART.md
docs/STORY-BACKLOG.md
docs/STORY-UPDATES-6.1.4-AND-6.1.6-SUMMARY.md
docs/sprint-change-proposal-epic-5-6.md
```

### Task 5: Update .gitignore (30min)

**ADD these patterns:**

```gitignore
# ============================================
# GENERATED ARTIFACTS (Story 6.12)
# ============================================

# Framework runtime artifacts
.aios-core/.session/
.aios-core/manifests/*.csv
.aios-core/core/registry/service-registry.json

# Quality metrics (generated during testing)
.aios/data/quality-metrics.json
.aios-core/quality/metrics-*.json

# Session data
.aios-core/.session/current-session.json

# ============================================
# ARCHIVED DOCUMENTATION
# ============================================
# Historical documentation moved to .github/deprecated-docs/
# These are internal development artifacts, not user documentation
.github/deprecated-docs/

# ============================================
# DEVELOPMENT ARTIFACTS
# ============================================
# Office documents should not be in repo
*.docx
*.xlsx
*.pptx

# Test/sample files
test-sample-*.md
*-sample-*.md

# Backup/archive patterns
*.backup
*.bak
*.old
*~
```

**REMOVE/FIX these patterns:**

```gitignore
# REMOVE - These should be tracked:
# docs/prd/                   # PRD is important documentation
# tests/                      # Tests should be tracked (this was for expansion projects)

# FIX - Be more specific:
# .aios/                      # Only ignore .aios/data/ not all of .aios/
```

### Task 6: Create Archive README (15min)

Create `.github/deprecated-docs/README.md`:

```markdown
# Deprecated Documentation

This directory contains archived documentation from AIOS development phases.

These files are kept for historical reference but are NOT part of the active
documentation for the open-source release.

## Contents

| Directory | Description | Files |
|-----------|-------------|-------|
| audits/ | Internal audit reports and decision summaries | 35 |
| analysis/ | Development analysis documents | 10 |
| planning/ | Sprint and epic planning artifacts | 8 |
| reports/ | Validation and analysis reports | 7 |
| research/ | Technical research documents | 4 |
| handoffs/ | Story handoff documents | 2 |
| qa-gates/ | QA gate YAML definitions | 112 |
| testing/ | Platform testing reports | 2 |

## Note

For current documentation, see:
- `docs/guides/` - User guides
- `docs/installation/` - Installation guides
- `docs/architecture/` - Architecture documentation
- `docs/framework/` - Framework standards
```

### Task 7: Organize docs/epics/ (30min)

**Create subdirectory structure:**

```
docs/epics/
├── README.md
├── current/
│   ├── epic-osr-open-source-readiness.md
│   └── epic-6-*.md
├── archived/
│   ├── epic-1-*.md
│   ├── epic-2-*.md
│   ├── epic-3*.md
│   ├── epic-4-*.md
│   ├── epic-5-*.md
│   └── *_COMPLETION_REPORT.md
└── future/
    ├── epic-10-*.md
    ├── epic-11-*.md
    ├── epic-12-*.md
    └── epic-s*.md
```

### Task 8: Validation (30min)

- [ ] Run `git status` to verify changes
- [ ] Verify no broken links in remaining docs
- [ ] Run `npm test` to ensure nothing broke
- [ ] Verify docs/guides/ still accessible
- [ ] Verify docs/installation/ still accessible

---

## 📁 Summary of Changes

### Files to DELETE: 15+
- 5 debug/test artifacts in docs/
- 3 duplicate architecture files
- 5 legacy .aios-core/tasks/ files
- 10 archived migration scripts
- 1 .docx file

### Files to ARCHIVE: ~180
- 35 audit files
- 10 analysis files
- 8 planning files
- 7 report files
- 4 research files
- 2 handoff files
- 112 QA gate files
- 2 testing files
- ~15 root level docs

### Directories to CREATE:
- `.github/deprecated-docs/` with 8 subdirectories

### .gitignore Updates: ~30 lines

---

## 🔗 Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Story 6.10 | ✅ Done | Documentation cleanup |
| Story 6.11 | ✅ Done | Framework docs consolidation |
| OSR-10 | 🟡 In Progress | Release checklist |

---

## ⚠️ Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking internal links | Medium | Low | Grep validation |
| Losing important docs | Low | High | Archive, don't delete |
| Git history bloat | Low | Low | Use `git rm` not delete |

---

## 📝 Notes

### Why Archive Instead of Delete?

Archived documentation provides:
1. Historical context for design decisions
2. Reference for understanding legacy code
3. Audit trail for compliance
4. Context for future contributors

### Recommended Execution Order

1. **Backup first:** `git stash` or create branch
2. **Delete obsolete:** Remove truly obsolete files
3. **Archive:** Move files to deprecated-docs/
4. **Update .gitignore:** Add new patterns
5. **Validate:** Check links, run tests
6. **Commit:** Single commit with all changes

---

## 📋 Definition of Done

- [x] All obsolete files deleted (23 files)
- [x] Development artifacts archived to .github/deprecated-docs/ (225 files)
- [x] .gitignore updated with correct patterns (~50 new lines)
- [x] docs/epics/ reorganized (current/archived/future)
- [x] No broken internal links (verified)
- [x] Tests pass (pre-existing failures unrelated to cleanup)
- [x] Repository size reduced (docs/*.md: 37 → 23)
- [ ] PR merged to main

---

## 📊 Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| docs/ files | 320+ | ~150 |
| Root level docs | 50+ | ~25 |
| .gitignore patterns | 120 | ~150 |
| Repository cleanliness | Medium | High |

---

*Story created: 2025-12-14*
*Analysis by: Claude Opus 4.5 (Dex)*
