# ÉPICO: Modular Architecture + Service Discovery

**ID:** EPIC-S2  
**Sprint:** Sprint 2  
**Status:** 📋 Backlog  
**Owner:** River (SM) + Aria (Architect Agent)  
**Created:** 2025-01-19  
**Updated:** 2025-01-19

---

## 📊 Overview

### Objetivo
Refatorar AIOS para arquitetura modular (4 modules: core/development/product/infrastructure) + implementar Service Discovery para 97+ workers + Quality Gate Manager unificado.

### Justificativa
**Decisões do Pedro:**
- [Decisão 3](../audits/PEDRO-DECISION-LOG.md#decisão-3) - Modular por Domínio (unanimidade roundtable)
- [Decisão 5](../audits/PEDRO-DECISION-LOG.md#decisão-5) - Framework Standards Migration
- [Decisão 6](../audits/PEDRO-DECISION-LOG.md#decisão-6) - Quality Gate Manager Unificado
- [Decisão 10](../audits/PEDRO-DECISION-LOG.md#decisão-10) - Service Discovery (Sprint 2, unanimidade Task-First)

**Problema Atual (v2.0):**
- Estrutura flat `.aios-core/` (tudo misturado)
- Workers fechados (sem discovery)
- No reuse (developers rebuild scripts)
- No systematic quality gates

**Solução (v2.1):**
- 4 modules claros (core/development/product/infrastructure)
- Service Registry com 97+ workers catalogados
- Discovery CLI (search/info/list em < 30s)
- Quality Gate Manager unificado

### Scope

**In Scope:**
- ✅ Arquitetura modular (4 modules)
- ✅ Migration de flat → modular
- ✅ Service Registry (service-registry.json)
- ✅ Discovery CLI (aios workers search/info/list)
- ✅ Quality Gate Manager unificado
- ✅ MCP System global (symlinks user-level)
- ✅ Framework standards migration (.aios-core/docs/)
- ✅ Manifest System (agents/workers/tasks CSV)
- ✅ Migration script v2.0 → v2.1
- ✅ Installer update (criar estrutura modular)

**Out of Scope:**
- ❌ CodeRabbit integration (Sprint 3)
- ❌ Template Engine complete (Sprint 3)
- ❌ DevOps automation (Sprint 4)

---

## 🎯 Goals & Metrics

### Success Criteria
- [ ] Estrutura modular 100% funcional
- [ ] 97+ workers catalogados no registry
- [ ] Discovery CLI funcionando (search < 30s)
- [ ] Quality Gate Manager orquestrando 3 layers
- [ ] MCP System global funcionando
- [ ] Framework docs migrados para .aios-core/docs/
- [ ] Migration script testado (v2.0 → v2.1)
- [ ] Zero breaking changes

### Metrics
- **Module separation:** 100%
- **Workers cataloged:** 97+
- **Discovery time:** < 30s (vs. N/A in v2.0)
- **Search accuracy:** > 90%
- **Reuse rate:** 50% tasks reuse existing workers (vs. 0% in v2.0)
- **Migration success rate:** > 90%

---

## 📚 Referências

### Decisões do Pedro
- [Decisão 3](../audits/PEDRO-DECISION-LOG.md#decisão-3) - Modular Architecture
- [Decisão 5](../audits/PEDRO-DECISION-LOG.md#decisão-5) - Standards Migration
- [Decisão 6](../audits/PEDRO-DECISION-LOG.md#decisão-6) - QG Manager
- [Decisão 10](../audits/PEDRO-DECISION-LOG.md#decisão-10) - Service Discovery
- [ROUNDTABLE-TASK-FIRST](../audits/ROUNDTABLE-TASK-FIRST-CRITICAL-ANALYSIS-2025-01-19.md) - Unanimidade

### Documentação Técnica
- [AIOS-LIVRO-DE-OURO-V2.1](../standards/AIOS-LIVRO-DE-OURO-V2.1-SUMMARY.md) - Architecture Revolution + Service Discovery
- [source-tree.md](../framework/source-tree.md) - Estrutura atual v2.0
- [INSTALLER-ROADMAP-V2.1](../audits/INSTALLER-ROADMAP-V2.1.md) - Sprint 2 details
- [TASK-FORMAT-SPECIFICATION-V1](../standards/TASK-FORMAT-SPECIFICATION-V1.md) - Task format para workers

---

## 📝 Stories

### Stories Criadas (16 total)

1. [Story 2.1 - Module Structure Design](../stories/v2.1/sprint-2/story-2.1-module-structure-design.md) - 5 pts
2. [Story 2.2 - Core Module Creation](../stories/v2.1/sprint-2/story-2.2-core-module-creation.md) - 5 pts
3. [Story 2.3 - Development Module Creation](../stories/v2.1/sprint-2/story-2.3-development-module-creation.md) - 5 pts
4. [Story 2.4 - Product Module Creation](../stories/v2.1/sprint-2/story-2.4-product-module-creation.md) - 3 pts
5. [Story 2.5 - Infrastructure Module Creation](../stories/v2.1/sprint-2/story-2.5-infrastructure-module-creation.md) - 5 pts
6. [Story 2.6 - Service Registry Creation](../stories/v2.1/sprint-2/story-2.6-service-registry-creation.md) - 8 pts
7. [Story 2.7 - Discovery CLI - Search](../stories/v2.1/sprint-2/story-2.7-discovery-cli-search.md) - 8 pts
8. [Story 2.8 - Discovery CLI - Info](../stories/v2.1/sprint-2/story-2.8-discovery-cli-info.md) - 3 pts
9. [Story 2.9 - Discovery CLI - List](../stories/v2.1/sprint-2/story-2.9-discovery-cli-list.md) - 5 pts
10. [Story 2.10 - Quality Gate Manager Unificado](../stories/v2.1/sprint-2/story-2.10-quality-gate-manager.md) - 8 pts
11. [Story 2.11 - MCP System Global](../stories/v2.1/sprint-2/story-2.11-mcp-system-global.md) - 8 pts
12. [Story 2.12 - Framework Standards Migration](../stories/v2.1/sprint-2/story-2.12-framework-standards-migration.md) - 3 pts
13. [Story 2.13 - Manifest System](../stories/v2.1/sprint-2/story-2.13-manifest-system.md) - 5 pts
14. [Story 2.14 - Migration Script v2.0 → v2.1](../stories/v2.1/sprint-2/story-2.14-migration-script.md) - 8 pts
15. [Story 2.15 - Update Installer for Modules](../stories/v2.1/sprint-2/story-2.15-update-installer-modules.md) - 3 pts
16. [Story 2.16 - Documentation Sprint 2](../stories/v2.1/sprint-2/story-2.16-documentation-sprint-2.md) - 5 pts

**Total Points:** 91 pontos

---

## 🔗 Dependencies

### Depende De
- [EPIC-S1] - Installer Foundation (precisa de installer funcional)

### Bloqueia
- [EPIC-S3] - Quality & Templates (precisa de módulos + QG Manager)
- [EPIC-S4] - DevOps Setup (precisa de estrutura modular)

---

## 📅 Timeline

**Start Date:** 2025-02-03 (proposto)  
**Target Date:** 2025-02-28 (3 semanas = 15 dias úteis) ← **EXTENDED per PO approval**  
**Actual End Date:** _TBD_

**Breakdown:**
- Week 1: Module structure design + creation (Stories 2.1-2.5)
- Week 2: Service Discovery implementation (Stories 2.6-2.9)
- Week 3: QG Manager + MCP + Migration + Installer + Docs (Stories 2.10-2.16)

**Velocity:** 30.3 pts/week (comfortable pace for complex architecture work)

---

## 🚨 Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Breaking changes na migração** | High | Medium | Extensive testing + rollback script |
| **Workers não task-compatible** | Medium | Medium | Validate all 97 workers against TASK-FORMAT-SPEC |
| **Semantic search accuracy baixa** | Medium | Low | Use embeddings (OpenAI/local) + keyword fallback |
| **MCP symlinks quebram em Windows** | High | Medium | Test junction points, provide manual setup |
| **Module boundaries unclear** | Medium | Low | Architecture review by Aria before implementation |
| **Migration script falha edge cases** | High | Medium | Test with 10+ real projects, comprehensive error handling |

---

## ✅ Acceptance Checklist

- [ ] Todas 16 stories completadas
- [ ] Testes passando (unit + integration)
- [ ] Module structure validated by Aria (Architect)
- [ ] Service Registry com 97+ workers
- [ ] Discovery CLI testado por 5+ developers
- [ ] Quality Gate Manager orquestrando 3 layers
- [ ] MCP System testado em 3 OS
- [ ] Migration script testado em 10+ projetos
- [ ] Documentation completa
- [ ] Code review completado
- [ ] QA validation por Quinn
- [ ] PO (Nova) sign-off

---

## 📝 Notes & Learnings

### Pre-Implementation Notes
- Este é o sprint mais complexo arquiteturalmente
- Roundtable unânime: modular por domínio é a decisão correta
- Service Discovery é foundational para Task-First Architecture
- MCP global requer cuidado com Windows (symlinks vs. junction points)

### Critical Success Factors
1. **Zero breaking changes:** v2.0 projects must continue working
2. **Module boundaries:** Clear, no circular dependencies
3. **Worker catalog quality:** Each worker must have complete metadata
4. **Migration testing:** Test with diverse project types

### During Implementation
_Espaço para anotações durante desenvolvimento_

### Post-Implementation Retrospective
_Espaço para learnings após conclusão_

---

## 🔄 Epic History

| Date | Event | By |
|------|-------|-----|
| 2025-01-19 | Epic created | River (SM) |
| _TBD_ | Sprint 2 started | Team |
| _TBD_ | Sprint 2 completed | Team |
| _TBD_ | PO sign-off | Nova (PO) |

---

**Criado por:** River (SM - Facilitator)  
**Baseado em:** [HANDOFF-SM-PO-V2.1](../audits/HANDOFF-SM-PO-V2.1-EPIC-STORIES-2025-01-19.md)  
**Aprovado por:** _Aguardando review do PO (Nova)_

