# Story Backlog

**Created:** 2026-02-05
**Last Updated:** 2026-02-05 (Epic 12 fechado! PR #87 merged)
**Owner:** @po (Pax)

---

## Statistics

| Metric | Count |
|--------|-------|
| Total Items | 8 |
| TODO | 3 |
| CANCELLED | 1 |
| IN PROGRESS | 0 |
| BLOCKED | 0 |
| DONE | 4 |

---

## 🔴 HIGH Priority

#### [EPIC12-CLOSE] ~~Fechar Epic 12 — Merge + Branch Protection~~ CONCLUÍDO
- **Status:** ✅ DONE
- **Completed:** 2026-02-05
- **Assignee:** @devops (Gage)
- **Created:** 2026-02-05
- **Delegated by:** @po (Pax)
- **Description:** Finalizar Epic 12 com merge de feat/epic-12 → main e configuração de branch protection.
- **Tasks:**
  - [x] Criar PR feat/epic-12 → main (PR #87)
  - [x] Review e approve (CodeRabbit + CI)
  - [x] Merge (squash) — merged at 2026-02-05T23:03:47Z
  - [x] Mover 12.11.story.md para docs/stories/completed/
  - [x] Atualizar project-status.yaml para 100%
  - [ ] Task 5.2: Adicionar `bob-test` aos required status checks (deferred → EPIC12-BP)
  - [ ] Task 5.4: Verificar squash merge enforced via GitHub Settings (deferred → EPIC12-BP)
- **Success Criteria:**
  - [x] PR merged com squash
  - [x] Story 12.11 em completed/
  - [x] Epic 12 = 100% DONE
  - [ ] `bob-test` em required checks (deferred)
- **Acceptance:** Epic 12 fechado, documentação atualizada. Branch protection pendente como item separado.
- **Evidence:** PR #87 merged by @oalanicolas

---

#### [EPIC12-F1] ~~Shardar stories 12.1-12.12 em arquivos individuais~~ CONCLUÍDO
- **Status:** ✅ DONE
- **Completed:** 2026-02-05
- **Description:** Todas as 13 stories do Epic 12 já existem como arquivos individuais em `docs/stories/active/` e `docs/stories/completed/`.
- **Evidence:** 4 em completed/ (12.1, 12.3, 12.4, 12.10), 9 em active/ (12.2, 12.5-12.9, 12.11-12.13)

---

#### [EPIC12-F2] ~~Resolver dívida técnica: panel-renderer.js faltante~~ CANCELADO
- **Status:** ❌ CANCELLED
- **Reason:** `panel-renderer.js` já existe em `.aios-core/core/ui/panel-renderer.js` (implementado na Story 11.6). Epic 12 continha informação desatualizada. Confirmado via file system check em 2026-02-05.

---

#### [EPIC12-F3] ~~Sincronizar stories 12.10 e 12.1 com ACs do Epic v1.6~~ CONCLUÍDO
- **Source:** Story Validation (PO validate-story-draft)
- **Priority:** 🔴 HIGH
- **Effort:** 30 min
- **Status:** ✅ DONE
- **Assignee:** @sm (River)
- **Completed:** 2026-02-05
- **Description:** Validação identificou ACs do Epic 12 v1.6 que não foram transferidos para os arquivos de story individuais: Story 12.10 faltam ACs 13-15 (OS Compatibility Matrix); Story 12.1 falta AC7 (pm.md activation instructions).
- **Success Criteria:**
  - [x] Story 12.10: ACs 13-15 adicionados + Task 7 com 6 subtasks + Dev Notes (OS Compatibility Matrix YAML)
  - [x] Story 12.1: AC7 adicionado + Task 7 com 4 subtasks + File List (pm.md)
  - [x] Story 12.3: Dev Notes verificados — já corretos (panel-renderer.js corretamente descrito como implementado na 11.6)
- **Acceptance:** Stories atualizadas para v1.1, prontas para re-validação pelo @po.

---

## 🟡 MEDIUM Priority

#### [EPIC12-BP] ~~Configurar Branch Protection para bob-test~~ CONCLUÍDO
- **Source:** Story 12.11 Task 5 (deferred)
- **Priority:** 🟡 MEDIUM
- **Effort:** 15 min
- **Status:** ✅ DONE
- **Completed:** 2026-02-05
- **Assignee:** @devops (Gage)
- **Description:** Adicionar `bob-test` aos required status checks na branch main e verificar que squash merge está enforced.
- **Tasks:**
  - [x] GitHub Settings → Branches → main → Edit (via API)
  - [x] Adicionar `Bob Orchestrator Tests` aos required checks
  - [x] Adicionar `Bob Orchestration Lint` aos required checks
  - [x] Verificar "Require squash merging" está ativo (enforced: only squash allowed)
  - [x] Documentar configuração final
- **Success Criteria:**
  - [x] `bob-test` em required checks
  - [x] Squash merge enforced
- **Acceptance:** PRs não podem mergear sem Bob tests passando.
- **Evidence:** Configurado via GitHub API. Required checks agora incluem 7 checks:
  - ESLint
  - TypeScript Type Checking
  - Jest Tests (Node 18)
  - Jest Tests (Node 20)
  - Validation Summary
  - **Bob Orchestrator Tests** ✓
  - **Bob Orchestration Lint** ✓

---

#### [EPIC12-F4] Script Lifecycle Audit — Deprecação e documentação de coexistência
- **Source:** Feedback do Engenheiro (Sprint Planning)
- **Priority:** 🟡 MEDIUM
- **Effort:** 1-2 horas
- **Status:** 📋 TODO
- **Assignee:** @dev + @architect
- **Sprint:** Pós-sprint (após Fase 1 do Epic 12)
- **Description:** O engenheiro identificou que scripts novos são criados sem deprecar os antigos, gerando conflitos potenciais. Audit completa: (1) Mapear todos os scripts legados que são superseded por módulos Epic 11/12, (2) Adicionar `@deprecated` headers com ponteiros para substitutos, (3) Documentar hierarquia de orquestradores (Bob vs Master vs WorkflowOrchestrator), (4) Avaliar `workflow-navigator.js` para deprecação.
- **Success Criteria:**
  - [ ] `workflow-state-manager.js` marcado `@deprecated` (parcialmente feito em 12.3 AC18)
  - [ ] `workflow-navigator.js` avaliado — deprecar ou documentar scope
  - [ ] Nenhum módulo de orchestration importa scripts deprecated
  - [ ] Doc `docs/architecture/orchestration-hierarchy.md` criado explicando Bob vs Master vs WorkflowOrchestrator
  - [ ] Nenhum task file referencia scripts deprecated sem fallback
- **Acceptance:** Zero conflitos de import entre scripts legados e módulos Epic 11/12. Documentação de coexistência clara.
- **Context:** Mapeamento completo em sessão @po 2026-02-05 identificou: 1 conflito confirmado (workflow-state-manager.js), 1 semi-conflito (workflow-navigator.js), 3 orquestradores complementares (sem conflito real).

---

#### [EPIC12-T1] Criar STORY-BACKLOG.md template reutilizável
- **Source:** Backlog Review (Process Gap)
- **Priority:** 🟡 MEDIUM
- **Effort:** 30 min
- **Status:** 📋 TODO
- **Assignee:** @po (Pax)
- **Sprint:** Backlog
- **Description:** A task `po-manage-story-backlog.md` referencia templates `story-backlog-item-tmpl.yaml` e `story-backlog-report-tmpl.yaml` que não existem. Criar templates para padronizar adição de itens e geração de reports.
- **Success Criteria:**
  - [ ] Template `story-backlog-item-tmpl.yaml` criado em `.aios-core/development/templates/`
  - [ ] Template `story-backlog-report-tmpl.yaml` criado em `.aios-core/development/templates/`
- **Acceptance:** Templates seguem padrão AIOS e são usáveis pelo comando `*backlog-add`.

---

## 🟢 LOW Priority

#### [EPIC12-O1] Atualizar story index após sharding
- **Source:** Backlog Review (Documentation Gap)
- **Priority:** 🟢 LOW
- **Effort:** 15 min
- **Status:** 📋 TODO
- **Assignee:** @po (Pax)
- **Sprint:** Após sharding
- **Description:** O `docs/stories/index.md` lista 13 stories do Epic 12 mas sem links para arquivos individuais (apenas 12.3, 12.10 e 12.13 existem). Após sharding, regenerar o índice com links corretos.
- **Success Criteria:**
  - [ ] Index atualizado com links para todas as 13 stories do Epic 12
  - [ ] Status de cada story reflete realidade
- **Acceptance:** Todos os links no index apontam para arquivos existentes.

---

## Archive

*Nenhum item arquivado ainda.*

---

*Story Backlog criado por @po (Pax) — Sprint Planning 2026-02-05*
*Próxima revisão: Após conclusão da Fase 1 do Epic 12*
