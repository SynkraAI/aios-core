# ÉPICO: Installer Híbrido Foundation

**ID:** EPIC-S1  
**Sprint:** Sprint 1  
**Status:** 📋 Backlog  
**Owner:** River (SM) + Dex (Dev Agent)  
**Created:** 2025-01-19  
**Updated:** 2025-01-19

---

## 📊 Overview

### Objetivo
Implementar installer híbrido (npx + wizard interativo) para AIOS v2.1, reduzindo tempo de instalação de 2-4 horas para 5 minutos com 98% success rate.

### Justificativa
**Decisões do Pedro:**
- [Decisão 1](../audits/PEDRO-DECISION-LOG.md#decisão-1) - Installer Híbrido (npx focus)
- [Decisão 2](../audits/PEDRO-DECISION-LOG.md#decisão-2) - Sprint 1 MÍNIMO (foundation sólida)

**Problema Atual (v2.0):**
- Instalação manual: 2-4 horas
- Success rate: 60%
- 15+ etapas manuais
- Alta taxa de desistência

**Solução (v2.1):**
- `npx @allfluence/aios@latest init`
- Wizard interativo
- 5 minutos total
- 98% success rate

### Scope

**In Scope:**
- ✅ npx command funcional (sem npm install -g)
- ✅ Interactive wizard (inquirer.js)
- ✅ Project type detection (greenfield/brownfield)
- ✅ IDE selection (6 IDEs: Cursor, Windsurf, Trae, Zed, Antigravity, Continue.dev)
- ✅ MCP installation project-level (4 MCPs: Browser, Context7, Exa, Desktop Commander)
- ✅ Environment configuration (.env, core-config.yaml)
- ✅ Dependency installation (npm/yarn/pnpm)
- ✅ Installation validation (health checks)
- ✅ Error handling + rollback
- ✅ Cross-platform support (Windows, macOS, Linux)
- ✅ First-run experience
- ✅ Documentation

**Out of Scope (Sprints Futuros):**
- ❌ MCP System global (Sprint 2)
- ❌ CLI Tools installation (Sprint 2)
- ❌ Module refactor (Sprint 2)
- ❌ CodeRabbit integration (Sprint 3)
- ❌ GitHub setup automation (Sprint 4)

---

## 🎯 Goals & Metrics

### Success Criteria
- [ ] npx command funciona em Windows, macOS, Linux
- [ ] Installation time < 5 minutos
- [ ] Success rate > 95%
- [ ] 4 MCPs configurados e funcionando
- [ ] 6 IDEs suportadas
- [ ] Zero breaking changes para v2.0 users
- [ ] Documentation completa

### Metrics
- **Time to install:** < 5 min (target) vs. 2-4h (current)
- **Success rate:** > 95% (target) vs. 60% (current)
- **User satisfaction:** > 8/10
- **Steps required:** 1 command vs. 15+ steps
- **Error rate:** < 5%

---

## 📚 Referências

### Decisões do Pedro
- [Decisão 1: Installer Approach](../audits/PEDRO-DECISION-LOG.md#decisão-1) - Híbrido aprovado
- [Decisão 2: Sprint 1 Scope](../audits/PEDRO-DECISION-LOG.md#decisão-2) - MÍNIMO aprovado
- [PEDRO-COMPLETE-DECISIONS](../audits/PEDRO-COMPLETE-DECISIONS-CONSOLIDATED-2025-01-19.md) - Todas decisões

### Documentação Técnica
- [INSTALLER-HYBRID-V2-COMPLETE](../audits/INSTALLER-HYBRID-V2-COMPLETE.md) - Proposta completa
- [INSTALLER-ROADMAP-V2.1](../audits/INSTALLER-ROADMAP-V2.1.md) - Roadmap 5 sprints
- [AIOS-LIVRO-DE-OURO-V2.1](../standards/AIOS-LIVRO-DE-OURO-V2.1-SUMMARY.md) - Installation Revolution
- [source-tree.md](../framework/source-tree.md) - Estrutura de arquivos
- [bin/aios-init.js](../../bin/aios-init.js) - Installer atual v2.0

### Context & Standards
- [AIOS-FRAMEWORK-MASTER](../standards/AIOS-FRAMEWORK-MASTER.md) - Framework completo
- [.aios-core/tools/mcp/](../../.aios-core/tools/mcp/) - Configs MCP atuais

---

## 📝 Stories

### Stories Criadas (12 total)

1. [Story 1.1 - npx Command Setup](../stories/v2.1/sprint-1/story-1.1-npx-command-setup.md) - 3 pts
2. [Story 1.2 - Interactive Wizard Foundation](../stories/v2.1/sprint-1/story-1.2-interactive-wizard-foundation.md) - 5 pts
3. [Story 1.3 - Project Type Detection](../stories/v2.1/sprint-1/story-1.3-project-type-detection.md) - 3 pts
4. [Story 1.4 - IDE Selection (6 IDEs)](../stories/v2.1/sprint-1/story-1.4-ide-selection.md) - 8 pts
5. [Story 1.5 - MCP Installation Project-Level](../stories/v2.1/sprint-1/story-1.5-mcp-installation-project-level.md) - 5 pts
6. [Story 1.6 - Environment Configuration](../stories/v2.1/sprint-1/story-1.6-environment-configuration.md) - 3 pts
7. [Story 1.7 - Dependency Installation](../stories/v2.1/sprint-1/story-1.7-dependency-installation.md) - 3 pts
8. [Story 1.8 - Installation Validation](../stories/v2.1/sprint-1/story-1.8-installation-validation.md) - 5 pts
9. [Story 1.9 - Error Handling & Rollback](../stories/v2.1/sprint-1/story-1.9-error-handling-rollback.md) - 5 pts
10. [Story 1.10 - Cross-Platform Support](../stories/v2.1/sprint-1/story-1.10-cross-platform-support.md) - 8 pts
11. [Story 1.11 - First-Run Experience](../stories/v2.1/sprint-1/story-1.11-first-run-experience.md) - 2 pts
12. [Story 1.12 - Documentation Sprint 1](../stories/v2.1/sprint-1/story-1.12-documentation-sprint-1.md) - 3 pts

**Total Points:** 53 pontos

---

## 🔗 Dependencies

### Depende De
- Nenhuma dependência externa (Sprint 1 é foundation)

### Bloqueia
- [EPIC-S2] - Modular Architecture (precisa de installer funcional)
- [EPIC-S3] - Quality & Templates (precisa de installer funcional)
- [EPIC-S4] - DevOps Setup (precisa de installer funcional)

---

## 📅 Timeline

**Start Date:** 2025-01-27 (proposto)  
**Target Date:** 2025-01-31 (1 semana)  
**Actual End Date:** _TBD_

**Breakdown:**
- Days 1-2: Stories 1.1-1.3 (npx + wizard + detection)
- Days 2-3: Stories 1.4-1.5 (IDE + MCP)
- Days 3-4: Stories 1.6-1.8 (env + deps + validation)
- Day 4: Story 1.9 (error handling)
- Day 5: Stories 1.10-1.12 (cross-platform + UX + docs)

---

## 🚨 Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **npx não funciona em todos OS** | High | Medium | Testar em VM Windows/Mac/Linux desde dia 1 |
| **IDEs não suportam config automática** | Medium | Low | Criar configs manuais como fallback |
| **MCPs falharem instalação** | High | Medium | Health checks + retry logic + manual setup guide |
| **Dependency conflicts** | Medium | Medium | Lock versions, testar com npm/yarn/pnpm |
| **Cross-platform path issues** | High | High | Usar path.join(), testar em 3 OS |
| **Users abandonam wizard** | Medium | Low | Progress bar, allow skip, save state |

---

## ✅ Acceptance Checklist

- [ ] Todas 12 stories completadas
- [ ] Testes passando (unit + integration + e2e)
- [ ] Documentação atualizada
- [ ] Code review completado por Aria (Architect)
- [ ] QA validation por Quinn (QA Agent)
- [ ] Cross-platform tested (Windows + macOS + Linux)
- [ ] Performance < 5 min confirmado
- [ ] Success rate > 95% confirmado
- [ ] PO (Nova) sign-off

---

## 📝 Notes & Learnings

### Pre-Implementation Notes
- Este é o sprint mais crítico: sem installer funcional, v2.1 não decola
- Priorizar estabilidade sobre features: better 98% success com menos features do que 60% com todas
- MCP global fica para Sprint 2 por decisão do Pedro (evitar complexidade inicial)

### During Implementation
_Espaço para anotações durante desenvolvimento_

### Post-Implementation Retrospective
_Espaço para learnings após conclusão_

---

## 🔄 Epic History

| Date | Event | By |
|------|-------|-----|
| 2025-01-19 | Epic created | River (SM) |
| _TBD_ | Sprint 1 started | Team |
| _TBD_ | Sprint 1 completed | Team |
| _TBD_ | PO sign-off | Nova (PO) |

---

**Criado por:** River (SM - Facilitator)  
**Baseado em:** [HANDOFF-SM-PO-V2.1](../audits/HANDOFF-SM-PO-V2.1-EPIC-STORIES-2025-01-19.md)  
**Aprovado por:** _Aguardando review do PO (Nova)_

