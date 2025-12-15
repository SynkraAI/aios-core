# Sprint 6: Technical Debt, CI Optimization & Open-Source Release

**Sprint Duration:** TBD
**Sprint Goal:** Resolver technical debt prioritário, otimizar CI e preparar release open-source

---

## Sprint Overview

O Sprint 6 combina:
1. **Technical Debt** - Resolver itens identificados durante Sprints 3-5
2. **Open-Source Release** - Completar Epic OSR (Community & Release phase)

---

## Stories

### Technical Debt & Infrastructure (6.1-6.4)

| Story | Title | Points | Priority | Status |
|-------|-------|--------|----------|--------|
| [6.1](story-6.1-github-actions-optimization.md) | GitHub Actions Cost Optimization | 5 | 🟡 Medium | 📋 Ready |
| [6.2](story-6.2-test-coverage-improvement.md) | Test Coverage Improvement to 80% | 8 | 🟡 Medium | 📋 Ready |
| [6.3](story-6.3-isolated-vm-investigation.md) | isolated-vm macOS Investigation | 3 | 🟡 Medium | 📋 Ready |
| [6.4](story-6.4-mcp-task-integration.md) | MCP-Task Integration Investigation | 21 | 🔴 Critical | ⚪ Ready |
| [6.9](story-6.9-documentation-integrity-system.md) | Documentation Integrity System | 13 | 🔴 Critical | ✅ DONE |

### Open-Source Readiness - Community & Release (OSR-6 to OSR-10)

| Story | Title | Points | Priority | Status |
|-------|-------|--------|----------|--------|
| [OSR-6](story-osr-6-features-process.md) | Feature Request Process | 5 | 🟠 High | ✅ DONE |
| [OSR-7](story-osr-7-public-roadmap.md) | Public Roadmap | 5 | 🟡 Medium | ✅ DONE |
| [OSR-8](story-osr-8-expansion-pack-guide.md) | Squads Guide (Community) | 5 | 🟠 High | ✅ DONE |
| [OSR-9](story-osr-9-rebranding-synkra.md) | Rebranding Investigation (Synkra) | 3 | 🟡 Medium | ✅ DONE |
| [6.10](story-6.10-documentation-cleanup-open-source.md) | Documentation Cleanup for OSR | 5 | 🔴 Critical | ⚪ Ready |
| [OSR-10](story-osr-10-release-checklist.md) | Release Checklist Final | 3 | 🔴 Critical | ⚪ Ready |

**Total Points:** 63 (37 Technical Debt & Infrastructure + 26 OSR)

---

## Sprint Backlog Origin

### Technical Debt Stories
| Story | Backlog ID | Origin |
|-------|------------|--------|
| 6.1 | 1733679600001 | CI billing issues durante PR #29 |
| 6.2 | 1733682000001 | Coverage threshold reduzido para desbloquear CI |
| 6.3 | 1733427600002 | SIGSEGV em macOS durante cross-platform tests |

### OSR Stories
| Story | Epic | Origin |
|-------|------|--------|
| OSR-6 to OSR-10 | [OSR - Open-Source Readiness](../../epics/epic-osr-open-source-readiness.md) | Community & Release phase do Epic OSR |

---

## Dependencies

### Technical Debt
- **Story 6.1** pode ser iniciada imediatamente
- **Story 6.2** pode ser iniciada em paralelo com 6.1
- **Story 6.3** é independente, pode ser investigada a qualquer momento
- **Story 6.4** depende de Story 5.11 (Docker MCP) ✅ - pode ser iniciada

### OSR Stories
- **OSR-6** depende de OSR-4 e OSR-5 (Sprint 5)
- **OSR-7** depende de OSR-6
- **OSR-8** depende de OSR-2 (Sprint 5)
- **OSR-9** pode ser iniciada em paralelo
- **Story 6.10** depende de Story 6.9 e OSR-8 (ambos ✅ DONE) - **BLOCKER para OSR-10**
- **OSR-10** depende de 6.10 e todas as outras stories OSR

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| CI changes quebram main | High | Testar extensivamente em branch |
| Coverage increase introduz flaky tests | Medium | Seguir padrões do PR #27 |
| isolated-vm sem solução | Low | Documentar limitação |
| OSR-10 bloqueada por outras stories | Medium | Priorizar stories críticas primeiro |

---

## Definition of Done (Sprint)

### Technical Debt
- [ ] Tempo de CI reduzido em 50%+
- [ ] Coverage restaurado para 80%
- [ ] isolated-vm investigado e documentado
- [ ] MCP-Task integration POC com 10 tasks

### Open-Source Release
- [x] Feature process documentado (OSR-6)
- [x] Public roadmap publicado (OSR-7)
- [x] Squads guide criado (OSR-8)
- [x] Decisão de naming tomada (OSR-9)
- [ ] Documentation cleanup para OSR (Story 6.10)
- [ ] Release checklist executado (OSR-10)

### General
- [ ] Todas as stories merged em main
- [ ] Backlog atualizado com status

---

*Sprint 6 Planning - Created by @po (Pax) - 2025-12-08*
*Updated: OSR stories moved from epic-open-source-readiness folder*
