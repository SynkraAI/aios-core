# Sprint 5 Stories - Complete Documentation v2.1

**Sprint:** 5 | **Duration:** 1 semana | **Points:** 86 | **Stories:** 13

## 📋 Stories List

### Documentation Stories (5.1-5.6)

| ID | Story | Points | Priority | Status |
|----|-------|--------|----------|--------|
| 5.1 | Migration Guide Complete | 8 | 🔴 Critical | ⏳ Planned |
| 5.2 | Getting Started Guide | 5 | 🔴 Critical | ⏳ Planned |
| 5.3 | API Reference | 5 | 🟠 High | ⏳ Planned |
| 5.4 | Video Tutorials | 13 | 🟠 High | ⏳ Planned |
| 5.5 | FAQ Compilation | 5 | 🟡 Medium | ⏳ Planned |
| 5.6 | Final Review & Polish | 3 | 🟡 Medium | ⏳ Planned |
| **5.10** | **[GitHub DevOps Setup for User Projects](story-5.10-github-devops-user-projects.md)** | **8** | **🔴 Critical** | **✅ DONE** |
| **5.11** | **[Docker MCP Toolkit Migration](story-5.11-docker-mcp-migration.md)** | **13** | **🔴 Critical** | **⚪ Ready** |

### Open-Source Readiness Stories (OSR-1 to OSR-5)

| ID | Story | Points | Priority | Status |
|----|-------|--------|----------|--------|
| OSR-1 | [Audit Session: Validate Infrastructure](story-osr-1-validation-audit.md) | 5 | 🔴 Critical | ⚪ Ready |
| OSR-2 | [Investigation: Separate Repo vs Cleanup](story-osr-2-repo-investigation.md) | 8 | 🔴 Critical | ⚪ Ready |
| OSR-3 | [Legal Foundation (CHANGELOG, Privacy, ToS)](story-osr-3-legal-foundation.md) | 5 | 🔴 Critical | ⚪ Ready |
| OSR-4 | [GitHub Community Setup (Discussions, Labels)](story-osr-4-github-community-setup.md) | 3 | 🟠 High | ⚪ Ready |
| OSR-5 | [COMMUNITY.md - Handbook for Contributors](story-osr-5-community-handbook.md) | 5 | 🟠 High | ⚪ Ready |

**Total:** 86 pontos (39 Documentation + 21 Infrastructure + 26 OSR)

## 🎯 Sprint Goals
- ✅ Documentation 100% completa
- ✅ Migration guide testado
- ✅ 5 video tutorials publicados
- ✅ 50+ FAQ entries
- ✅ v2.1 launch ready
- ✅ **DONE:** User projects get full DevOps setup via `*setup-github`
- ⏳ Docker MCP Toolkit migration (98.7% token reduction, Code Mode)
- ⏳ Open-source community readiness foundation (OSR-1 to OSR-5)

## 📝 Story 5.10 Details

**Added:** 2025-12-08 | **Validated by:** Pax (PO) | **Score:** 89/90 | **Status:** ✅ DONE (PR #29)

Story 5.10 foi criada para resolver o gap identificado onde projetos de usuários criados via `*environment-bootstrap` não recebem configuração DevOps completa (GitHub Actions, CodeRabbit, Branch Protection, Secrets).

**Supersedes:** Stories 4.1-4.7 (marked OBSOLETE)

## 📝 Story 5.11 Details

**Added:** 2025-12-08 | **Created by:** Aria (Architect) | **Points:** 13 | **Status:** ⚪ Ready

Story 5.11 implementa a migração do sistema de MCP do 1MCP para Docker MCP Toolkit, habilitando:
- **Code Mode:** Execução de workflows no sandbox (98.7% menos tokens)
- **Dynamic MCP:** mcp-find, mcp-add, mcp-remove em runtime
- **Gateway Centralizado:** 270+ MCPs disponíveis via catálogo Docker
- **Segurança:** Containers isolados em vez de processos npx

**Dependencies:**
- ✅ Blocked by: OSR-2 (DONE)
- ⚠️ Blocks: OSR-4, Migração para allfluence/mcp-ecosystem (REPO 3)

**Tasks a criar:**
- `*setup-mcp-docker` - Setup completo do Docker MCP Toolkit
- `*add-mcp` - Adicionar MCP do catálogo
- `*mcp-workflow` - Criar workflows Code Mode

## 📝 OSR Stories (Epic: Open-Source Community Readiness)

**Epic:** [OSR - Open-Source Readiness](../../epics/epic-osr-open-source-readiness.md)

As stories OSR-1 a OSR-5 fazem parte do Sprint 5 Foundation do Epic OSR:
- **OSR-1:** Audit session para validar infraestrutura existente
- **OSR-2:** Investigação repo separado vs cleanup
- **OSR-3:** Documentação legal (CHANGELOG, PRIVACY, TERMS)
- **OSR-4:** GitHub community setup (Discussions, Labels)
- **OSR-5:** COMMUNITY.md handbook para contributors

---

**Criado por:** River 🌊
**Atualizado:** 2025-12-08 (Story 5.10 DONE, Story 5.11 Docker MCP added by Aria, OSR stories moved by Pax)

