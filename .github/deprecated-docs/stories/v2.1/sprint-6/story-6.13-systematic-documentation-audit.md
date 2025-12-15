# Story 6.13: Systematic Documentation Audit for Open-Source Release

**Epic:** Open-Source Readiness (OSR)
**Story ID:** 6.13
**Sprint:** 6
**Priority:** 🔴 Critical
**Points:** 13
**Effort:** 8-12 hours (multi-agent, multi-phase)
**Status:** 📋 Ready
**Type:** 🔍 Audit / Cleanup

---

## 📋 User Story

**Como** mantenedor preparando o release open-source,
**Quero** uma auditoria sistemática de TODOS os arquivos de documentação,
**Para** garantir que apenas documentação atualizada, relevante e alinhada com a implementação atual seja mantida no repositório público.

---

## 🎯 Objetivo

Ler e avaliar **cada arquivo** do projeto (864+ arquivos) para:
1. Verificar se está atualizado com a implementação atual
2. Remover referências obsoletas (aios-fullstack, padrões antigos)
3. Arquivar documentação de desenvolvimento interno
4. Manter apenas o que está implementado em `.aios-core/`
5. Alinhar com o futuro do projeto: **aios-squads** e **mcp-ecosystem**

---

## 📊 Scope

| Área | Arquivos | Status |
|------|----------|--------|
| `docs/` | 559 | 📋 Pending |
| `.aios-core/` | 296 | 📋 Pending |
| Root (`*.md`) | 9 | 📋 Pending |
| **TOTAL** | **864** | - |

---

## ✅ Acceptance Criteria

### AC1: Phase 1 - Root Level Files Audit
- [ ] Audit all 9 root MD files (README, CHANGELOG, etc.)
- [ ] Verify CHANGELOG is up to date with actual releases
- [ ] Update any references to "aios-fullstack" → proper naming
- [ ] Ensure README reflects current project state

### AC2: Phase 2 - docs/ Structure Audit
- [ ] Remove `docs/aios-developer/` (merged into aios-master)
- [ ] Audit `docs/architecture/` - remove deprecated files
- [ ] Audit `docs/framework/` - verify against .aios-core implementation
- [ ] Audit `docs/guides/` - ensure guides work with current system
- [ ] Audit `docs/installation/` - verify installation instructions
- [ ] Audit `docs/standards/` - consolidate with framework/

### AC3: Phase 3 - Internal Documentation Archive
- [ ] Archive `docs/stories/` (280 files) - internal sprint tracking
- [ ] Archive `docs/epics/` (36 files) - internal epic tracking
- [ ] Archive `docs/prd/` (10 files) - internal product requirements
- [ ] Archive `docs/decisions/` (15 files) - internal decisions
- [ ] Archive `docs/qa/` - internal QA reports
- [ ] Archive `docs/one-pagers/` - internal decision docs
- [ ] Archive remaining internal folders

### AC4: Phase 4 - .aios-core/ Validation
- [ ] Verify all agents reference existing files
- [ ] Verify all tasks are functional and up-to-date
- [ ] Remove orphaned/unused files
- [ ] Validate tool references (Playwright, desktop-commander, docker-gateway)

### AC5: Phase 5 - Cross-Reference Validation
- [ ] No broken internal links
- [ ] No references to archived files from kept files
- [ ] All paths in agents/tasks resolve correctly
- [ ] Documentation matches actual implementation

---

## 📝 Tasks

### Task 1: Root Level Audit (30min) - @architect
**Files:** README.md, CHANGELOG.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md,
         COMMUNITY.md, PRIVACY.md, ROADMAP.md, SECURITY.md, TERMS.md

**Check for each file:**
- [ ] Is content current and accurate?
- [ ] Any "aios-fullstack" references to update?
- [ ] Does it reflect current project vision (aios-squads, mcp-ecosystem)?
- [ ] Are links valid?

### Task 2: docs/architecture/ Audit (1h) - @architect
**Known issues:**
- `SYNKRA-REBRANDING-SPECIFICATION.md` - Archive (historical)
- `agent-tool-integration-guide.md` - Archive (old system, now using MCPs)
- `architect-validation-expansion-pack-stories.md` - Archive
- `coderabbit-integration-decisions.md` - Archive (decision doc, not implementation)
- `coding-standards.md` - Archive (official in framework/)
- `source-tree.md` - Archive (deprecated)
- `tech-stack.md` - Archive (deprecated, official in framework/)

**Action:** Read each file, classify as KEEP/UPDATE/ARCHIVE

### Task 3: docs/framework/ Audit (1h) - @architect
**Verify:**
- Files match actual .aios-core/ implementation
- No outdated patterns or references
- Coding standards are current

### Task 4: docs/guides/ Audit (45min) - @pm
**Verify:**
- Guides work with current system
- Installation steps are accurate
- No references to removed features

### Task 5: docs/installation/ Audit (30min) - @devops
**Verify:**
- Installation instructions work
- Platform-specific guides are accurate
- Prerequisites are current

### Task 6: Internal Documentation Archive (1h) - @devops
**Archive to `.github/deprecated-docs/`:**
- docs/stories/ (280 files)
- docs/epics/ (36 files)
- docs/prd/ (10 files)
- docs/decisions/ (15 files)
- docs/qa/ (10 files)
- docs/one-pagers/ (5 files)
- docs/validation/ (1 file)
- docs/requirements/ (1 file)
- docs/specifications/ (1 file)
- docs/backlog/ (1 file)
- docs/installer/ (1 file)
- docs/migration/ (7 files)
- docs/security/ (1 file)
- Root internal files (5 files)

### Task 7: .aios-core/ Validation (2h) - @data-engineer
**For each agent file:**
- [ ] All dependency paths exist
- [ ] Tool references are current (Playwright, desktop-commander, docker-gateway)
- [ ] No references to deprecated patterns

**For each task file:**
- [ ] Task is functional
- [ ] References valid templates/checklists
- [ ] No orphaned tasks

### Task 8: Cross-Reference Validation (30min) - @devops
- [ ] Run link checker on remaining docs
- [ ] Verify no broken references
- [ ] Test documentation navigation

### Task 9: Final Commit & Push (15min) - @devops
- [ ] Single commit with all changes
- [ ] Update backlog
- [ ] Push to main

---

## 🔍 Audit Criteria per File

For EACH file, document:

```markdown
| File | Status | Action | Notes |
|------|--------|--------|-------|
| path/to/file.md | CURRENT/OUTDATED/DEPRECATED | KEEP/UPDATE/ARCHIVE | Brief reason |
```

### Status Definitions:
- **CURRENT**: Content matches implementation, no updates needed
- **OUTDATED**: Content partially correct, needs updates
- **DEPRECATED**: Content no longer relevant, should be archived

### Action Definitions:
- **KEEP**: File stays in public repo as-is
- **UPDATE**: File stays but needs content updates
- **ARCHIVE**: Move to `.github/deprecated-docs/`
- **DELETE**: Remove entirely (only for duplicates/empty)

---

## 🔗 Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Story 6.12 | ✅ Done | Initial cleanup completed |
| OSR-10 | 🟡 In Progress | Release checklist |

---

## ⚠️ Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking valid docs | Medium | High | Read each file before action |
| Missing important content | Medium | High | Audit in phases with review |
| Time overrun | High | Medium | Parallelize with multiple agents |

---

## 📋 Definition of Done

- [ ] All 864 files audited and documented
- [ ] Root files updated (README, CHANGELOG current)
- [ ] Internal docs archived (~400 files)
- [ ] No "aios-fullstack" references in public docs
- [ ] All agent/task dependencies validated
- [ ] No broken links
- [ ] Tests pass
- [ ] PR merged to main

---

## 📊 Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| docs/ files | 559 | ~100 |
| Total documentation | 864 | ~350 |
| Broken references | Unknown | 0 |
| Outdated content | High | None |

---

## 🤖 Agent Assignments

| Agent | Responsibility | Phase |
|-------|---------------|-------|
| @architect | Architecture, framework, standards docs | 1-3 |
| @pm | User guides, community docs | 2 |
| @data-engineer | .aios-core validation, agent deps | 4 |
| @devops | Archive execution, validation, push | 3, 5 |

---

*Story created: 2025-12-15*
*Analysis by: Gage (DevOps Agent)*
