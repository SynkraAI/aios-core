# ÉPICO: Quality Gates 3 Layers + Template Engine

**ID:** EPIC-S3
**Sprint:** Sprint 3
**Status:** 🟡 In Progress
**Owner:** River (SM) + Quinn (QA Agent)
**Created:** 2025-01-19
**Updated:** 2025-12-02

---

## 📊 Overview

### Objetivo
Implementar sistema completo de Quality Gates (3 layers) + Template Engine para todos document types + CodeRabbit integration (local IDE extension).

### Justificativa
**Decisões do Pedro:**
- [Decisão 4](../audits/PEDRO-DECISION-LOG.md#decisão-4) - Quality Gates 3 Layers + CodeRabbit Integration Complete
- [Decisão 8](../audits/PEDRO-DECISION-LOG.md#decisão-8) - CodeRabbit Phase 1 (Sprint 3)
- [Decisão 9](../audits/PEDRO-DECISION-LOG.md#decisão-9) - Template Engine Rollout (Sprint 3)

**Problema Atual (v2.0):**
- Quality validation 100% manual
- Human reviewers exhausted
- Many issues slip through (catch rate ~20%)
- No systematic document generation

**Solução (v2.1):**
- Layer 1 (Local): Pre-commit hooks, ESLint, Prettier, TypeScript (< 5s)
- Layer 2 (PR): CodeRabbit AI + Quinn + integration tests (< 3min)
- Layer 3 (Human): Strategic review only (30min vs. 2-4h)
- **Result:** 80% issues caught automatically, 75% human time saved

### Scope

**In Scope:**
- ✅ Layer 1: Pre-commit hooks (Husky + lint-staged) - **DONE (Story 3.1)**
- ✅ CodeRabbit CLI + GitHub App integration - **DONE (supersedes IDE extension)**
- ✅ Layer 2: PR automation (GitHub Actions + CodeRabbit + Quinn)
- ✅ Layer 3: Human review orchestration
- ✅ Template Engine core refactor
- ✅ Templates: PRD v2.0, ADR, PMDR, DBDR
- ✅ Quality Gates Dashboard (metrics visualization)

**Out of Scope:**
- ~~❌ CodeRabbit GitHub App (Sprint 4 - requires repo setup)~~ → **NOW INSTALLED ✅**
- ❌ Memory Layer (v2.2)

**Scope Change (2025-12-01):**
- Story 3.2 (CodeRabbit IDE Extension) **CANCELLED** - Superseded by CLI + GitHub App architecture
- CodeRabbit integration now uses dual-mode: CLI (local) + GitHub App (PR reviews)

**Scope Change (2025-12-02):**
- Stories 3.3-3.4 **ADJUSTED** - Reduced from 13 to 8 pts due to existing infrastructure
- @devops (Gage) confirmed as owner of PR automation (not @qa/Quinn)
- Combined story file: `story-3.3-3.4-pr-automation.md`

---

## 🎯 Goals & Metrics

### Success Criteria
- [ ] 80% of issues caught automatically (layers 1+2)
- [ ] Human review time reduced 75%
- [ ] Template engine covering 100% doc types
- [x] ~~CodeRabbit functioning locally in all supported IDEs~~ → CodeRabbit CLI + GitHub App working ✅
- [ ] False positive rate < 15%

### Metrics
- **Auto-catch rate:** > 80% (vs. 0% manual)
- **Human review time:** 30min (vs. 2-4h)
- **Template coverage:** 100% doc types
- **False positives:** < 15%
- **Quality improvement:** +20% in issue detection

---

## 📚 Referências

### Decisões do Pedro
- [Decisão 4](../audits/PEDRO-DECISION-LOG.md#decisão-4) - Quality Gates complete analysis
- [Decisão 8](../audits/PEDRO-DECISION-LOG.md#decisão-8) - CodeRabbit timing
- [Decisão 9](../audits/PEDRO-DECISION-LOG.md#decisão-9) - Template Engine
- [DECISION-4-INVESTIGATION](../audits/DECISION-4-QUALITY-GATES-INVESTIGATION-REPORT.md) - Complete investigation
- [EXECUTOR-DECISION-TREE](../standards/EXECUTOR-DECISION-TREE.md) - Executor types per layer

---

## 📝 Stories

### Stories Criadas (10 active + 1 cancelled + 1 combined = 12 original)

1. ✅ [Story 3.1 - Pre-Commit Hooks Layer 1](../stories/v2.1/sprint-3/story-3.1-pre-commit-hooks.md) - 5 pts - **DONE**
2. ❌ [Story 3.2 - CodeRabbit Local Extension](../stories/v2.1/sprint-3/story-3.2-coderabbit-local.md) - ~~5 pts~~ 0 pts - **CANCELLED** (superseded by CLI+App)
3. 🟢 [Story 3.3-3.4 - PR Automation Layer 2 (@devops)](../stories/v2.1/sprint-3/story-3.3-3.4-pr-automation.md) - ~~13 pts~~ 8 pts - **READY** (scope adjusted)
4. [Story 3.5 - Human Review Orchestration Layer 3](../stories/v2.1/sprint-3/story-3.5-human-review-layer-3.md) - 5 pts
5. [Story 3.6 - Template Engine Core Refactor](../stories/v2.1/sprint-3/story-3.6-template-engine-core-refactor.md) - 8 pts
6. [Story 3.7 - Template PRD v2.0](../stories/v2.1/sprint-3/story-3.7-template-prd-v2.md) - 3 pts
7. [Story 3.8 - Template ADR](../stories/v2.1/sprint-3/story-3.8-template-adr.md) - 3 pts
8. [Story 3.9 - Template PMDR](../stories/v2.1/sprint-3/story-3.9-template-pmdr.md) - 3 pts
9. [Story 3.10 - Template DBDR](../stories/v2.1/sprint-3/story-3.10-template-dbdr.md) - 3 pts
10. [Story 3.11 - Quality Gates Dashboard](../stories/v2.1/sprint-3/story-3.11-quality-gates-dashboard.md) - 8 pts
11. [Story 3.12 - Documentation Sprint 3](../stories/v2.1/sprint-3/story-3.12-documentation-sprint-3.md) - 5 pts

**Total Points:** 54 pontos (was 64: -5 Story 3.2 cancelled, -5 Story 3.3-3.4 scope adjusted)
**Completed:** 5 pts (Story 3.1)

---

## 🔗 Dependencies

### Depende De
- [EPIC-S1] - Installer Foundation
- [EPIC-S2] - Modular Architecture (Quality Gate Manager)

### Bloqueia
- [EPIC-S4] - DevOps Setup (GitHub App integration)

---

## 📅 Timeline

**Start Date:** 2025-03-03 (proposto) ← **UPDATED for Sprint 2 extension**  
**Target Date:** 2025-03-14 (2 semanas = 10 dias úteis)  
**Actual End Date:** _TBD_

---

## 🚨 Risks & Mitigation

| Risk | Impact | Probability | Mitigation | Status |
|------|--------|-------------|------------|--------|
| ~~**CodeRabbit IDE extension incompatível**~~ | ~~High~~ | ~~Low~~ | ~~Test in all 6 IDEs~~ | ✅ RESOLVED - Using CLI instead |
| **Pre-commit hooks muito lentos** | Medium | Medium | Optimize checks, allow skip for emergencies | ✅ MITIGATED - ~4.5s execution |
| **False positives frustram devs** | High | Medium | Tune rules, easy override mechanism | 🔄 Monitoring |
| **Quinn LLM calls expensive** | Medium | Low | Cache results, batch analysis | 🔄 Pending |

---

## ✅ Acceptance Checklist

- [ ] Todas 11 stories ativas completadas (Story 3.2 cancelled)
- [ ] 80% auto-catch rate confirmed
- [x] ~~CodeRabbit working in 6 IDEs~~ → CodeRabbit CLI + GitHub App working ✅
- [ ] Template engine 100% coverage
- [ ] Dashboard showing real metrics
- [ ] Documentation completa
- [ ] QA validation por Quinn
- [ ] PO sign-off

---

**Criado por:** River (SM - Facilitator)
**Baseado em:** [HANDOFF-SM-PO-V2.1](../audits/HANDOFF-SM-PO-V2.1-EPIC-STORIES-2025-01-19.md)
**Aprovado por:** _Aguardando review do PO_
**Atualizado por:** Pax (@po) - 2025-12-02 (Story 3.3-3.4 scope adjustment)

