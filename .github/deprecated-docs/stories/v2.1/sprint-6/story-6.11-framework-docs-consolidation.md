# Story 6.11: Framework Documentation Consolidation

**Epic:** Open-Source Readiness (OSR)
**Story ID:** 6.11
**Sprint:** 6
**Priority:** 🟠 Medium
**Points:** 3
**Effort:** 2-3 hours
**Status:** ✅ Done
**Type:** 📝 Documentation / Refactoring

---

## 📊 Status

- [x] Draft
- [x] Validated (PO Review)
- [x] Approved
- [x] In Progress
- [x] Ready for Review
- [x] Done

---

## 📋 User Story

**Como** desenvolvedor ou agente AIOS,
**Quero** que os documentos oficiais do framework estejam em um único local bem definido (`docs/framework/`),
**Para** evitar confusão entre documentos portáveis do framework e análises específicas do projeto.

---

## 🎯 Objetivo

Consolidar a documentação oficial do framework em `docs/framework/` e organizar `docs/architecture/` para conter apenas documentos específicos do projeto.

### Problemas Identificados (Story 6.10 QA)

| Problema | Impacto |
|----------|---------|
| `core-config.yaml` aponta para `docs/architecture/` | Inconsistência |
| `agent-config-requirements.yaml` aponta para `docs/framework/` | Conflito de referências |
| `docs/framework/` está desatualizado (v1.0, aios/aios-core) | Documentação incorreta |
| `docs/architecture/` tem 39 arquivos misturados | Difícil navegação |
| Duplicação de source-tree, coding-standards, tech-stack | Manutenção difícil |

---

## 🔍 Contexto

### Análise de Padrões da Indústria

| Fonte | Recomendação |
|-------|--------------|
| Microsoft Engineering Playbook | Separar docs do repo vs docs do projeto |
| Nx (Monorepo Tool) | Agrupar por scope/propósito |
| GitHub Best Practices | README + estrutura clara por propósito |

### Estrutura Atual vs Proposta

```
ATUAL (Problemático):
docs/
├── architecture/           # 39 arquivos misturados
│   ├── source-tree.md      # ✅ Atualizado (v1.1)
│   ├── coding-standards.md # ✅ Atualizado
│   ├── tech-stack.md       # ✅ Atualizado
│   ├── mcp-optimization-1mcp.md  # Análise de projeto
│   ├── tools-system-analysis-log.md  # Análise de projeto
│   └── ... (36 outros arquivos)
│
├── framework/              # 4 arquivos desatualizados
│   ├── source-tree.md      # ❌ v1.0 (aios/aios-core)
│   ├── coding-standards.md # ❌ Desatualizado
│   ├── tech-stack.md       # ❌ Desatualizado
│   └── README.md

PROPOSTO (Limpo):
docs/
├── framework/              # Docs OFICIAIS do framework (portáveis)
│   ├── source-tree.md      # ✅ Sincronizado de architecture/
│   ├── coding-standards.md # ✅ Sincronizado
│   ├── tech-stack.md       # ✅ Sincronizado
│   └── README.md           # ✅ Atualizado
│
├── architecture/           # Docs ESPECÍFICOS do projeto
│   ├── decisions/          # ADRs e decisões arquiteturais
│   ├── analysis/           # Análises técnicas (mcp, tools, etc.)
│   ├── diagrams/           # Diagramas de arquitetura
│   └── ARCHITECTURE-INDEX.md
```

---

## ✅ Acceptance Criteria

### AC1: Framework Docs Synchronized
- [x] `docs/framework/source-tree.md` sincronizado com versão v1.1
- [x] `docs/framework/coding-standards.md` sincronizado
- [x] `docs/framework/tech-stack.md` sincronizado
- [x] `docs/framework/README.md` atualizado com Migration Notice para `SynkraAI/aios-core`

### AC2: core-config.yaml Updated
- [x] `devLoadAlwaysFiles` aponta para `docs/framework/`
- [x] `devLoadAlwaysFilesFallback` inclui fallback para `docs/architecture/`
- [x] Comentário explicando a preferência por `docs/framework/`

### AC3: Architecture Folder Organized
- [x] Subpasta `docs/architecture/analysis/` criada
- [x] Arquivos de análise movidos para `analysis/`
- [x] `ARCHITECTURE-INDEX.md` atualizado com nova estrutura

### AC4: References Updated
- [x] Grep confirma nenhuma referência quebrada
- [x] Agent loaders funcionam corretamente
- [x] `npm test` passa (1498 passed, 13 pre-existing failures)

### AC5: Duplicates Deprecated
- [x] `docs/architecture/source-tree.md` marcado como DEPRECATED (aponta para framework/)
- [x] `docs/architecture/coding-standards.md` marcado como DEPRECATED
- [x] `docs/architecture/tech-stack.md` marcado como DEPRECATED

---

## 📝 Tasks

### Task 1: Sync Framework Docs (30min)

**Files:**
- `docs/framework/source-tree.md`
- `docs/framework/coding-standards.md`
- `docs/framework/tech-stack.md`
- `docs/framework/README.md`

**Actions:**
1. [x] Copy content from `docs/architecture/source-tree.md` (v1.1) to `docs/framework/source-tree.md`
2. [x] Copy content from `docs/architecture/coding-standards.md` to `docs/framework/coding-standards.md`
3. [x] Copy content from `docs/architecture/tech-stack.md` to `docs/framework/tech-stack.md`
4. [x] Update `docs/framework/README.md` with SynkraAI migration notice

### Task 2: Update core-config.yaml (15min)

**File:** `.aios-core/core-config.yaml`

**Actions:**
1. [x] Change `devLoadAlwaysFiles` paths from `docs/architecture/` to `docs/framework/`
2. [x] Add `docs/architecture/` paths to `devLoadAlwaysFilesFallback`
3. [x] Add comment explaining the change
4. [x] Bump version to 2.3.0

### Task 3: Organize Architecture Folder (45min)

**Actions:**
1. [x] Create `docs/architecture/analysis/` directory
2. [x] Move analysis files to `analysis/`:
   - mcp-optimization-1mcp.md
   - mcp-context-optimization-strategy.md
   - mcp-solution-comparison-checklist.md
   - tools-system-analysis-log.md
   - tools-system-gap-analysis.md
   - expansion-packs-dependency-analysis.md
   - expansion-packs-structure-inventory.md
   - scripts-consolidation-analysis.md
   - subdirectory-migration-impact-analysis.md
   - repository-strategy-analysis.md
3. [x] Update `ARCHITECTURE-INDEX.md` with new structure
4. [x] Verify no broken links

### Task 4: Deprecate Duplicates (15min)

**Actions:**
1. [x] Add DEPRECATED notice to `docs/architecture/source-tree.md`
2. [x] Add DEPRECATED notice to `docs/architecture/coding-standards.md`
3. [x] Add DEPRECATED notice to `docs/architecture/tech-stack.md`
4. [x] Each notice should point to `docs/framework/` equivalent

### Task 5: Validation (30min)

**Actions:**
1. [x] Run `npm test` (1498 passed, 13 pre-existing failures)
2. [x] Verify dev agent loads correctly with new paths
3. [x] Grep for broken references (archive files have historical refs - expected)
4. [x] Manual review of changes

---

## 📁 Files to Modify

| File | Action | Priority |
|------|--------|----------|
| `docs/framework/source-tree.md` | Sync | 🔴 High |
| `docs/framework/coding-standards.md` | Sync | 🔴 High |
| `docs/framework/tech-stack.md` | Sync | 🔴 High |
| `docs/framework/README.md` | Update | 🔴 High |
| `.aios-core/core-config.yaml` | Update | 🔴 High |
| `docs/architecture/source-tree.md` | Deprecate | 🟠 Medium |
| `docs/architecture/coding-standards.md` | Deprecate | 🟠 Medium |
| `docs/architecture/tech-stack.md` | Deprecate | 🟠 Medium |
| `docs/architecture/ARCHITECTURE-INDEX.md` | Update | 🟠 Medium |
| `docs/architecture/analysis/` | Create | 🟡 Low |
| Multiple analysis files | Move | 🟡 Low |

---

## 🔗 Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Story 6.10 | ✅ Done | Documentation cleanup complete |
| OSR-8 | ✅ Done | Squads guide created |
| OSR-9 | ✅ Done | Rebranding to Synkra complete |

---

## ⚠️ Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking agent loaders | Medium | High | Add fallback paths in core-config |
| Broken internal links | Medium | Low | Grep validation + manual review |
| Confusion during transition | Low | Medium | Clear DEPRECATED notices |

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
- **Primary Type:** Documentation/Refactoring
- **Complexity:** Low
- **Secondary Types:** Configuration

### Specialized Agents
- **Primary:** @dev
- **Supporting:** @architect (for structure validation)

### Quality Gates
- [ ] Pre-Commit (@dev): Lint/format all modified files
- [ ] Pre-PR (@qa): Verify no broken paths/references

### Self-Healing Configuration
- **Mode:** light
- **Max Iterations:** 2
- **Timeout:** 15 minutes

---

## 📝 Dev Notes

### Technical Context
- Framework docs should be portable across all AIOS projects
- `docs/framework/` was created in Story 6.1.2.6 (Jan 2025) but never fully activated
- `agent-config-requirements.yaml` already references `docs/framework/` (future-ready)
- This story completes the migration started in 6.1.2.6

### Key Files Reference
```
Framework Docs (TARGET):
├── docs/framework/source-tree.md      # Official structure
├── docs/framework/tech-stack.md       # Official tech stack
├── docs/framework/coding-standards.md # Official standards

Configuration:
├── .aios-core/core-config.yaml        # devLoadAlwaysFiles
├── .aios-core/data/agent-config-requirements.yaml  # Already correct

Architecture (ORGANIZE):
├── docs/architecture/analysis/        # NEW: Analysis docs
├── docs/architecture/decisions/       # EXISTS: ADRs
└── docs/architecture/ARCHITECTURE-INDEX.md
```

### Deprecation Notice Template
```markdown
> ⚠️ **DEPRECATED**: This file is maintained for backward compatibility only.
>
> **Official version:** [docs/framework/{filename}](../framework/{filename})
>
> This file will be removed in Q2 2026 after migration to `SynkraAI/aios-core`.
```

---

## 🎯 Definition of Done

- [x] All framework docs in `docs/framework/` are current (v1.1+)
- [x] `core-config.yaml` references `docs/framework/`
- [x] Fallback paths ensure backward compatibility
- [x] Architecture folder organized with `analysis/` subdir
- [x] Duplicate files marked DEPRECATED
- [x] All tests pass (pre-existing failures only)
- [x] Agent loaders work correctly
- [x] PR merged to main (commit `9ff1a7f`)

---

## 📝 Notes

This story completes the documentation consolidation started in Story 6.1.2.6 and addresses technical debt identified during Story 6.10 QA review.

**Rationale for `docs/framework/` name:**
- Semantically correct (these are framework standards)
- Already exists with README explaining purpose
- Referenced in `agent-config-requirements.yaml`
- Industry patterns favor separation by purpose
- Minimal changes required (sync vs restructure)

---

## 📋 Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-14 | 1.0 | Initial story creation | Quinn (QA) |

---

*Story created as follow-up to Story 6.10 QA review findings*

---

## 🔧 Dev Agent Record

### Agent Model Used
- **Model:** claude-opus-4-5-20251101 (Opus 4.5)
- **Mode:** yolo (autonomous)

### Debug Log References
- N/A (no debugging required)

### Completion Notes
1. All 5 tasks completed successfully
2. Framework documentation synced from docs/architecture/ to docs/framework/:
   - source-tree.md, coding-standards.md, tech-stack.md copied
   - README.md updated with SynkraAI migration notice
3. core-config.yaml updated:
   - devLoadAlwaysFiles now points to docs/framework/
   - Fallback includes docs/architecture/ for backward compatibility
   - Version bumped to 2.3.0
4. Architecture folder organized:
   - Created docs/architecture/analysis/ subdirectory
   - Moved 10 analysis files to new location
   - Updated ARCHITECTURE-INDEX.md with new structure
5. Duplicates deprecated:
   - Added DEPRECATED notice to 3 files in docs/architecture/
   - Each points to official docs/framework/ version
6. Validation complete:
   - Tests: 1498 passed (13 pre-existing failures)
   - Lint: Pre-existing warnings only
   - Paths verified

### Change Log
| File | Change Type | Summary |
|------|-------------|---------|
| docs/framework/source-tree.md | Synced | Copied from docs/architecture/ |
| docs/framework/coding-standards.md | Synced | Copied from docs/architecture/ |
| docs/framework/tech-stack.md | Synced | Copied from docs/architecture/ |
| docs/framework/README.md | Modified | Updated migration notice to SynkraAI |
| .aios-core/core-config.yaml | Modified | devLoadAlwaysFiles → docs/framework/, v2.3.0 |
| docs/architecture/analysis/ | Created | New subdirectory for analysis docs |
| 10 analysis files | Moved | Relocated to docs/architecture/analysis/ |
| docs/architecture/ARCHITECTURE-INDEX.md | Modified | Updated structure, links, version 2.1.1 |
| docs/architecture/source-tree.md | Modified | Added DEPRECATED notice |
| docs/architecture/coding-standards.md | Modified | Added DEPRECATED notice |
| docs/architecture/tech-stack.md | Modified | Added DEPRECATED notice |

---

## ✅ QA Results

### Review Summary
**Reviewer:** Quinn (QA Agent)
**Date:** 2025-12-14
**Gate Decision:** ✅ **PASS**

### Acceptance Criteria Verification

| AC | Criteria | Status | Evidence |
|----|----------|--------|----------|
| AC1 | Framework Docs Synchronized | ✅ PASS | All 4 files in docs/framework/ verified current |
| AC2 | core-config.yaml Updated | ✅ PASS | devLoadAlwaysFiles → docs/framework/, fallback configured, v2.3.0 |
| AC3 | Architecture Folder Organized | ✅ PASS | analysis/ created with 10 files, INDEX updated |
| AC4 | References Updated | ✅ PASS | Paths verified, tests pass (1498/1498 relevant) |
| AC5 | Duplicates Deprecated | ✅ PASS | 3 files have DEPRECATED notice with correct links |

### File Changes Verified

| File | Change | Verified |
|------|--------|----------|
| `docs/framework/source-tree.md` | Synced from architecture/ | ✅ |
| `docs/framework/coding-standards.md` | Synced from architecture/ | ✅ |
| `docs/framework/tech-stack.md` | Synced from architecture/ | ✅ |
| `docs/framework/README.md` | Updated SynkraAI migration notice | ✅ |
| `.aios-core/core-config.yaml` | v2.3.0, devLoadAlwaysFiles updated | ✅ |
| `docs/architecture/analysis/` | Created with 10 files | ✅ |
| `docs/architecture/ARCHITECTURE-INDEX.md` | v2.1.1, structure updated | ✅ |
| `docs/architecture/source-tree.md` | DEPRECATED notice added | ✅ |
| `docs/architecture/coding-standards.md` | DEPRECATED notice added | ✅ |
| `docs/architecture/tech-stack.md` | DEPRECATED notice added | ✅ |

### Path Verification

| Path | Expected | Actual |
|------|----------|--------|
| `docs/framework/` | 4 files | ✅ 4 files (coding-standards.md, README.md, source-tree.md, tech-stack.md) |
| `docs/architecture/analysis/` | 10 files | ✅ 10 files verified |
| `devLoadAlwaysFiles` | `docs/framework/` | ✅ Verified in core-config.yaml:41-44 |
| `devLoadAlwaysFilesFallback` | includes `docs/architecture/` | ✅ Verified lines 48-52 |

### Test Results
- **Unit Tests:** 1498 passed (13 pre-existing failures unrelated to this story)
- **Lint:** Pre-existing warnings only (no new errors introduced)

### Deprecation Notice Quality
All 3 deprecated files contain proper notices:
- ✅ Clear DEPRECATED warning at top
- ✅ Link to official version in docs/framework/
- ✅ Removal timeline (Q2 2026)
- ✅ Status field updated to "DEPRECATED"

### Minor Observations (LOW Severity)
1. **Template files not updated:** `.aios-core/infrastructure/templates/core-config/` still reference `docs/architecture/` as primary location
   - **Impact:** None - templates are for new installations, fallback ensures compatibility
   - **Recommendation:** Consider updating in future cleanup story

### Final Assessment
All acceptance criteria met. Implementation is clean, well-documented, and follows the deprecation strategy. The dual-location approach with fallback ensures zero breakage during transition. Pre-existing test failures and lint warnings are unrelated to this story's scope.

**Recommendation:** Proceed to merge.

— Quinn, guardião da qualidade 🛡️
