# STORY: Module Structure Design

**ID:** 2.1 | **Épico:** [EPIC-S2](../../../epics/epic-s2-modular-architecture.md)
**Sprint:** 2 | **Points:** 8 | **Priority:** 🔴 Critical | **Created:** 2025-01-19
**Updated:** 2025-11-28 (Done)
**Status:** ✅ Done (Merged to main)

## 📊 User Story
**Como** arquiteto, **Quero** definir estrutura modular clara, **Para** organizar .aios-core/ em 4 modules

## ✅ Acceptance Criteria
- [x] 4 modules definidos: core, development, product, infrastructure
- [x] Cada module com responsabilidades claras (documented in ADR)
- [x] Migration map completo (file → destination module)
- [ ] Zero breaking changes para usuários *(validated post-migration)*
- [x] Architecture Decision Record (ADR) documentado
- [x] **[NEW]** Validação de imports/requires após migração planejada
- [x] **[NEW]** Plano de testes de regressão definido
- [x] **[NEW]** Arquivos duplicados identificados e resolvidos

## 🔧 Implementation
```
.aios-core/
├── core/           # Framework essentials (config, orchestration, validation)
├── development/    # Dev features (agents, workers, tasks, workflows)
├── product/        # PM features (templates, checklists, decisions)
└── infrastructure/ # System (CLI, MCP, integrations, scripts)
```

## 📋 Tasks (8 pts = 3 dias)

### Design Tasks (Original)
- [x] 2.1.1: Define module boundaries (4h) ✅
- [x] 2.1.2: Create migration map (3h) ✅
- [x] 2.1.3: Identify inter-module dependencies (3h) ✅
- [x] 2.1.4: Write ADR (2h) ✅
- [x] 2.1.5: Review by Aria + Pedro clone (2h) ✅

### Validation Tasks (NEW - PO Review)
- [x] 2.1.6: Resolve duplicações identificadas (2h) ✅ **COMPLETED IN STORY 2.0**
  - `config/agent-config-requirements.yaml` vs `data/agent-config-requirements.yaml`
  - Decisão: manter `data/`, remover `config/` → Executado em [Story 2.0](./story-2.0-pre-migration-cleanup.md) (commit 85128d7c)
- [x] 2.1.7: Criar plano de validação de imports (2h) ✅
  - Script para verificar broken imports pós-migração
  - Mapping de requires antigos → novos paths
- [x] 2.1.8: Definir regression test suite (2h) ✅
  - Lista de smoke tests por module
  - Critérios de rollback

**Total:** 18h (ajustado: 2.1.6 já concluído em Story 2.0)

## 📦 Pre-Requisite: Cleanup (Story 2.0)

> ✅ **BLOCKER RESOLVED**: [Story 2.0 - Pre-Migration Cleanup](./story-2.0-pre-migration-cleanup.md) foi **concluída** (commit 85128d7c)
>
> ~~Foram identificados **257 arquivos deprecated** que devem ser removidos ANTES da migração modular~~
> - ✅ 275 arquivos removidos (cleanup completo)
> - ✅ Pasta `config/` duplicada removida
> - ✅ Baseline limpo para migração

## 🗺️ Migration Map (Draft)

| Pasta Atual | Destino | Arquivos |
|-------------|---------|----------|
| `agents/` | `development/agents/` | 15 agents |
| `agent-teams/` | `development/teams/` | 5 configs |
| `tasks/` | `development/tasks/` | ~100 tasks |
| `workflows/` | `development/workflows/` | workflows |
| `templates/` | `product/templates/` | templates |
| `checklists/` | `product/checklists/` | 6 checklists |
| `data/` | `core/data/` | KB, patterns |
| `scripts/` | `infrastructure/scripts/` | 90+ scripts |
| `elicitation/` | `infrastructure/elicitation/` | 3 modules |
| `tools/` | `infrastructure/tools/` | configs |
| `docs/` | `core/docs/` | framework docs |
| `.session/` | `core/.session/` | runtime |
| `tests/` | `infrastructure/tests/` | tests |
| `config/` | ❌ REMOVE | duplicado |

## 🔗 Dependencies
**Depende:** [2.0] Pre-Migration Cleanup, [1.1-1.12] Sprint 1 complete
**Bloqueia:** [2.2-2.5] Module creation

## 📝 Notes (PO Review 2025-01-27)
- Estimativa original de 14h era subdimensionada
- Cleanup de backups deve ser prerequisite, não parte desta story
- Duplicação em `config/` vs `data/` deve ser resolvida aqui

## 📝 PO Validation Notes (2025-11-27)
- ✅ Story 2.0 (blocker) foi concluída - 275 arquivos limpos
- ✅ Task 2.1.6 já executada em Story 2.0 - marcada como concluída
- ✅ Estimativa ajustada de 20h → 18h
- ✅ Story pronta para desenvolvimento

---

## 📁 File List

**Created:**
- `docs/architecture/decisions/ADR-002-modular-architecture.md` - Main ADR document
- `docs/architecture/decisions/ADR-002-migration-map.md` - Detailed file migration mappings
- `docs/architecture/decisions/ADR-002-dependency-matrix.md` - Inter-module dependency analysis
- `docs/architecture/decisions/ADR-002-validation-plan.md` - Import validation procedures
- `docs/architecture/decisions/ADR-002-regression-tests.md` - Regression test suite definition

**Modified:**
- `docs/stories/v2.1/sprint-2/story-2.1-module-structure-design.md` - This story (task updates)

---

## 🤖 Dev Agent Record

### Agent Model Used
- **Model:** claude-opus-4-5-20251101 (Opus 4.5)
- **Agent:** Dex (dev)
- **Mode:** yolo (autonomous)

### Debug Log References
- N/A (clean execution)

### Completion Notes
1. ✅ Created comprehensive ADR-002 with 4 bounded modules: core, development, product, infrastructure
2. ✅ Detailed migration map with 335+ files categorized by destination module
3. ✅ Inter-module dependency analysis identifying 3 critical violations to fix
4. ✅ Import validation plan with scripts for automated verification
5. ✅ Regression test suite with 24 tests across 4 modules + smoke tests
6. ✅ Task 2.1.5 Architecture review APPROVED by Aria

### Architecture Review Summary (2025-11-27)
- **Status:** ✅ APPROVED with Recommendations
- **Reviewer:** Aria (Architect)
- **Key Findings:**
  - Module boundaries correctly defined
  - Dependency DAG is sound
  - 3 dependency violations identified (to fix in Stories 2.2-2.5)
  - Test coverage plan adequate
- **Recommendations:**
  - Add root-level index.js re-export
  - Keep `agent-teams/` name for backward compatibility
  - Add module README files during migration

### Change Log
| Date | Change | By |
|------|--------|-----|
| 2025-11-27 | Initial design implementation | Dex (dev) |
| 2025-11-27 | Created ADR-002 suite (5 documents) | Dex (dev) |
| 2025-11-27 | Architecture review APPROVED | Aria (architect) |
| 2025-11-28 | QA review PASSED | Quinn (qa) |
| 2025-11-28 | Merged to main (commit 9ad1e2ad) | Gage (devops) |
| 2025-11-28 | Status → Done | Pax (po) |

---

## 🧪 QA Agent Record

### Agent Model Used
- **Model:** claude-opus-4-5-20251101 (Opus 4.5)
- **Agent:** Quinn (qa)
- **Mode:** review

### QA Gate Decision: ✅ PASS

### Acceptance Criteria Validation
| Criterion | Status |
|-----------|--------|
| 4 modules definidos: core, development, product, infrastructure | ✅ PASS |
| Cada module com responsabilidades claras | ✅ PASS |
| Migration map completo (file → destination module) | ✅ PASS |
| Zero breaking changes para usuários | ⏳ DEFERRED (post-migration) |
| Architecture Decision Record (ADR) documentado | ✅ PASS |
| Validação de imports/requires após migração planejada | ✅ PASS |
| Plano de testes de regressão definido | ✅ PASS |
| Arquivos duplicados identificados e resolvidos | ✅ PASS |

### Documentation Quality Assessment
- **ADR-002-modular-architecture.md**: Comprehensive, well-structured
- **ADR-002-migration-map.md**: 335+ files mapped with clear destinations
- **ADR-002-dependency-matrix.md**: 3 violations identified with solutions
- **ADR-002-validation-plan.md**: Scripts and procedures complete
- **ADR-002-regression-tests.md**: 24 tests + smoke tests defined

### QA Notes
- Story scope appropriately limited to design phase
- Architect recommendations incorporated for future reference
- Pre-requisite Story 2.0 confirmed complete
- No blocking issues identified

---
**Criado por:** River 🌊
**Revisado por:** Pax 🎯 (PO)
**Validado por:** Pax 🎯 (PO) - 2025-11-27
**Implementado por:** Dex 💻 (dev) - 2025-11-27
**QA por:** Quinn 🧪 (qa) - 2025-11-28
