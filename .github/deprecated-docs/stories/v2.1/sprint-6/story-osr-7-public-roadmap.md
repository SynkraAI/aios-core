# Story OSR-7: Public Roadmap para Comunidade

**Epic:** Open-Source Community Readiness (OSR)
**Story ID:** OSR-7
**Sprint:** 6
**Priority:** 🟡 Medium
**Points:** 5
**Effort:** 4 hours
**Status:** ✅ Completed
**Type:** ✨ Enhancement

---

## 📋 User Story

**Como** membro da comunidade,
**Quero** ver o roadmap público do projeto,
**Para** entender a direção do projeto e planejar minhas contribuições.

---

## 🎯 Objetivo

Criar visibilidade do roadmap para a comunidade, mostrando o que está planejado sem comprometer detalhes proprietários ou estratégicos.

---

## 📊 Opções de Implementação

### Opção A: GitHub Projects (Recomendado)

**Prós:**
- Integrado nativamente com GitHub
- Fácil de manter (issues viram cards)
- Suporta diferentes views (board, table, roadmap)
- Gratuito

**Contras:**
- Requer manutenção de issues públicas
- Limitado em customização visual

**Implementação:**
1. Criar projeto público "AIOS Roadmap"
2. Configurar views: Board, Roadmap timeline
3. Usar labels para categorização
4. Linkar com issues/discussions

---

### Opção B: ROADMAP.md no Repositório

**Prós:**
- Simples de manter
- Versionado junto com código
- Fácil de contribuir

**Contras:**
- Menos visual
- Requer atualização manual
- Não interativo

---

### Opção C: Página Dedicada (docs/roadmap/)

**Prós:**
- Mais detalhado
- Pode incluir visualizações customizadas
- Separado do código

**Contras:**
- Mais trabalho de manutenção
- Pode ficar desatualizado

---

## ✅ Deliverables

### 1. GitHub Project "AIOS Public Roadmap"

**Configuração:**

| Campo | Valor |
|-------|-------|
| Nome | AIOS Public Roadmap |
| Visibilidade | Public |
| Descrição | What we're working on and planning |

**Views a criar:**

1. **Board View**
   - Colunas: Backlog | Next Up | In Progress | Done

2. **Roadmap View (Timeline)**
   - Agrupado por Quarter
   - Mostra datas estimadas

3. **Table View**
   - Filtros por área (Core, Agents, Expansion Packs)
   - Ordenação por prioridade

**Custom Fields:**

| Field | Type | Options |
|-------|------|---------|
| Quarter | Single Select | Q1 2026, Q2 2026, Q3 2026, Future |
| Area | Single Select | Core, Agents, Installer, Docs, Community |
| Size | Single Select | Small, Medium, Large, Epic |
| Status | Single Select | Exploring, Planned, In Progress, Done |

---

### 2. ROADMAP.md (Complementar)

**Arquivo:** `ROADMAP.md` na raiz

```markdown
# AIOS Roadmap

This document outlines the planned development direction for AIOS.

> 📌 For detailed tracking, see our [GitHub Project](link-to-project)

## Vision

AIOS aims to be the most comprehensive open-source AI agent framework,
enabling developers to build sophisticated AI-powered applications.

## Current Focus (Q1 2026)

### v2.1 Release
- ✅ Hybrid installer (npx + wizard)
- ✅ 4-module architecture
- ✅ Service Discovery
- 🔄 Quality Gates 3 layers
- 🔄 Template Engine
- ⏳ Open-source community infrastructure

### Community Building
- ⏳ GitHub Discussions setup
- ⏳ Contribution guides
- ⏳ Public roadmap (this!)

## Next Up (Q2 2026)

### v2.2 Planning
- Memory Layer implementation
- Enhanced agent capabilities
- Performance optimizations

### Community Features
- Expansion pack registry
- Contributor recognition system

## Future Exploration

These items are being explored but not yet committed:

- Multi-language support
- Cloud deployment options
- Visual workflow builder
- Plugin marketplace

## How to Influence the Roadmap

1. **Vote on Ideas**: React with 👍 on [Discussions](link)
2. **Propose Features**: Open an [Idea Discussion](link)
3. **Write an RFC**: For significant features, [submit an RFC](link)

## Changelog

For what's already shipped, see [CHANGELOG.md](CHANGELOG.md).

## Disclaimer

This roadmap represents our current plans and is subject to change.
Dates are estimates, not commitments.

---

*Last updated: YYYY-MM-DD*
```

---

### 3. Processo de Atualização

**Frequência:** Mensal (mínimo)

**Responsável:** @pm (Morgan) ou @po (Pax)

**Processo:**
1. Review do progresso atual
2. Atualizar status dos items
3. Adicionar novos items aprovados
4. Remover items cancelados
5. Comunicar mudanças significativas em Announcements

---

### 4. O que NÃO mostrar publicamente

**Excluir do roadmap público:**
- ❌ Detalhes de features proprietárias (Clones)
- ❌ Estratégia de monetização detalhada
- ❌ Expansion packs pagos específicos
- ❌ Timelines comprometedoras
- ❌ Informações competitivas sensíveis

**Manter vago/genérico:**
- Datas (usar quarters, não datas específicas)
- Detalhes técnicos internos
- Dependências de terceiros

---

### 5. Integração com Outros Docs

**Atualizar:**
- [ ] README.md - link para roadmap
- [ ] COMMUNITY.md - seção de roadmap
- [ ] CONTRIBUTING.md - menção ao roadmap

---

## 🎯 Acceptance Criteria

```gherkin
GIVEN a community member wanting to understand project direction
WHEN they access the public roadmap
THEN they can see:
  - Current focus areas
  - Planned features (quarters, not specific dates)
  - Status of major initiatives
  - How to influence the roadmap
AND they understand:
  - This is a plan, not a commitment
  - How to contribute to planned features
```

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

| Attribute | Value |
|-----------|-------|
| **Primary Type** | Documentation/Process |
| **Complexity** | Low |
| **Secondary Types** | GitHub Configuration |

### Specialized Agents

| Agent | Role |
|-------|------|
| **@dev** | Primary - ROADMAP.md creation and documentation updates |
| **@github-devops** | Support - GitHub Project configuration via UI/API |

### Quality Gates

#### Pre-Commit (@dev)
- [ ] ROADMAP.md follows markdown best practices
- [ ] No sensitive information exposed (no proprietary features, timelines, monetization)
- [ ] All links resolve correctly
- [ ] Content aligns with "O que NÃO mostrar" guidelines

#### Pre-PR (@github-devops)
- [ ] GitHub Project exists and is public
- [ ] All 3 views configured (Board, Roadmap, Table)
- [ ] Custom fields defined (Quarter, Area, Size, Status)
- [ ] README.md and COMMUNITY.md updated with links

### Self-Healing Configuration

| Setting | Value |
|---------|-------|
| **Mode** | light |
| **Max Iterations** | 2 |
| **Timeout** | 15 min |
| **Severity Handling** | CRITICAL only |

**Behavior:**
- CRITICAL issues: Auto-fix (broken links, exposed sensitive data)
- HIGH/MEDIUM/LOW: Document and defer to manual review

### Focus Areas
- Markdown formatting consistency
- No hardcoded sensitive data or proprietary information
- Link validation (internal and external)
- Consistent terminology with project vision

---

## 📝 Tasks / Subtasks

### Task 1: Create GitHub Project (AC: 1, 2)
- [x] Create project "AIOS Public Roadmap" in SynkraAI org
- [x] Set visibility to Public
- [x] Add description: "What we're working on and planning"
- [x] Configure project settings

### Task 2: Configure Views (AC: 1)
- [x] Create **Board View**
  - [x] Add columns: Backlog | Next Up | In Progress | Done
  - [x] Set as default view
- [x] Create **Roadmap View** (Timeline)
  - [x] Group by Quarter field
  - [x] Configure date range display
- [x] Create **Table View**
  - [x] Add filters by Area
  - [x] Configure sorting by priority/status

### Task 3: Configure Custom Fields (AC: 2)
- [x] Add **Quarter** field (Single Select)
  - Options: Q1 2026, Q2 2026, Q3 2026, Q4 2026, Future
- [x] Add **Area** field (Single Select)
  - Options: Core, Agents, Installer, Docs, Community, Squads
- [x] Add **Size** field (Single Select)
  - Options: Small, Medium, Large, Epic
- [x] Add **Progress** field (Single Select)
  - Options: Exploring, Planned, In Progress, Done

### Task 4: Populate Initial Items (AC: 3)
- [x] Add current v2.1 release items
- [x] Add community infrastructure items (OSR stories)
- [x] Add v2.2 planned items (high-level only)
- [x] Add "Future Exploration" items
- [x] Verify NO sensitive/proprietary items included

### Task 5: Create ROADMAP.md (AC: 4)
- [x] Create `ROADMAP.md` in repository root
- [x] Add Vision section
- [x] Add Current Focus (Q1 2026) section
- [x] Add Next Up (Q2 2026) section
- [x] Add Future Exploration section
- [x] Add "How to Influence the Roadmap" section with links
- [x] Add Disclaimer
- [x] Link to GitHub Project

### Task 6: Update Documentation (AC: 5)
- [x] Update `README.md` - add Roadmap section/link
- [x] Update `COMMUNITY.md` - add "Project Roadmap" section
- [x] Update `CONTRIBUTING.md` - mention roadmap in "How to Contribute"

### Task 7: Document Update Process (AC: 6)
- [x] Document monthly review cadence
- [x] Document responsible parties (@pm, @po)
- [x] Document communication process for changes
- [x] Add process to ROADMAP.md footer

### Task 8: Final Validation (AC: 7)
- [x] Security review: verify no sensitive information exposed
- [x] Link validation: all links work correctly
- [x] Cross-reference with "O que NÃO mostrar" checklist
- [x] Test public access - GitHub Project is public at https://github.com/orgs/SynkraAI/projects/1

---

## 📓 Dev Notes

### Relevant Context

**GitHub Project API:**
- Projects can be created via GitHub UI or `gh` CLI
- For org projects: `gh project create --owner SynkraAI --title "AIOS Public Roadmap"`
- Views and fields require UI configuration (no direct CLI support)

**File Locations:**
- `ROADMAP.md` → Repository root
- `README.md` → Repository root (add link in "Documentation" or new section)
- `COMMUNITY.md` → Repository root (add "Roadmap" subsection)
- `CONTRIBUTING.md` → Repository root (mention in contribution flow)

**Links to Use:**
- GitHub Project: `https://github.com/orgs/SynkraAI/projects/X`
- Discussions Ideas: `https://github.com/SynkraAI/aios-core/discussions/categories/ideas`
- RFC Template: `/.github/RFC_TEMPLATE.md`
- Feature Process: `/docs/FEATURE_PROCESS.md`

**OSR-9 Decision (Rebranding):**
- Story OSR-9 decided to keep "AIOS" naming for now
- "Squads" terminology adopted for expansion packs
- Reflect this in roadmap content (use "Squads" not "Expansion Packs" where appropriate)

### Testing Standards

**Validation Checklist:**
1. GitHub Project publicly accessible (test logged out)
2. All 3 views render correctly
3. Custom fields appear in item cards
4. ROADMAP.md renders correctly on GitHub
5. All internal links resolve (README, COMMUNITY, etc.)
6. No 404s on external links

**Manual Testing:**
- Open in incognito/private window
- Verify all views load
- Click all links in ROADMAP.md

---

## 🔗 Dependencies

**Blocked by:**
- ~~OSR-6: Features Process~~ ✅ Done (2025-12-10)

**Blocks:**
- OSR-10: Release Checklist (roadmap precisa estar público)

---

## 📋 Definition of Done

- [x] GitHub Project criado e público (https://github.com/orgs/SynkraAI/projects/1)
- [x] Views configuradas (Board, Roadmap, Table)
- [x] Custom fields definidos (Quarter, Area, Size, Progress)
- [x] ROADMAP.md criado
- [x] Links em README, COMMUNITY.md
- [x] Processo de atualização documentado
- [x] Sem informações sensíveis expostas

---

## 📁 File List

| File | Action | Description |
|------|--------|-------------|
| `ROADMAP.md` | Created | Public roadmap with vision, Q1/Q2 2026 plans, community input guide |
| `README.md` | Modified | Added roadmap link to "Suporte & Comunidade" section |
| `COMMUNITY.md` | Modified | Added "Project Roadmap" section with detailed explanation |
| `CONTRIBUTING.md` | Modified | Added roadmap link to "Additional Resources" section |

---

## 📝 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-05 | 1.0 | Story draft created | River (SM) 🌊 |
| 2025-12-10 | 1.1 | Added Tasks, CodeRabbit Integration, Dev Notes sections | Pax (PO) 🎯 |
| 2025-12-10 | 1.2 | Implemented Tasks 5-8: ROADMAP.md, doc updates, validation | Dex (Dev) 💻 |
| 2025-12-10 | 1.3 | Added manual instructions for Tasks 1-4 (GitHub Project) | Gage (DevOps) 🔧 |
| 2025-12-10 | 1.4 | Completed Tasks 1-4: GitHub Project created with fields and items | Gage (DevOps) 🔧 |

---

## 🤖 Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes
- Tasks 1-4 (GitHub Project configuration) require GitHub UI or API access - marked as pending for @github-devops
- Tasks 5-8 (ROADMAP.md, documentation updates) completed successfully
- All referenced files validated: CHANGELOG.md, RFC_TEMPLATE.md, FEATURE_PROCESS.md exist
- Security review passed: No proprietary details, monetization strategy, or specific timelines exposed
- Used "Squads" terminology per OSR-9 decision (instead of "Expansion Packs" where appropriate)

### Debug Log References
N/A - No errors encountered

---

## ✅ QA Results

### Review Date
2025-12-10

### Reviewer
Quinn (QA) ✅

### Gate Decision
**PASS** (for Tasks 5-8 scope)

### Review Summary

| Category | Status | Notes |
|----------|--------|-------|
| **Acceptance Criteria** | ✅ PASS | AC 4-7 fully met for documentation deliverables |
| **Security Review** | ✅ PASS | No sensitive information (monetization, proprietary, timelines) exposed |
| **Link Validation** | ✅ PASS | All internal references verified: CHANGELOG.md, RFC_TEMPLATE.md, FEATURE_PROCESS.md, CONTRIBUTING.md |
| **Content Quality** | ✅ PASS | ROADMAP.md follows story template, uses quarters not dates |
| **Documentation Updates** | ✅ PASS | README.md, COMMUNITY.md, CONTRIBUTING.md properly updated |
| **Terminology** | ✅ PASS | Uses "Squads" per OSR-9 decision |

### Detailed Findings

#### ROADMAP.md Analysis
1. **Vision Section** - Clear, aligned with project goals
2. **Q1 2026 Items** - Appropriate level of detail, no specific dates
3. **Q2 2026 Items** - High-level, vague as required
4. **Future Exploration** - Properly marked as "not committed"
5. **How to Influence** - Links to correct resources (Discussions, RFC, CONTRIBUTING)
6. **Update Process** - Monthly cadence documented, responsible parties identified
7. **Disclaimer** - Present and clear

#### Security Checklist (per "O que NÃO mostrar")
- [x] No proprietary feature details (Clones) - PASS
- [x] No monetization strategy - PASS
- [x] No paid expansion pack details - PASS
- [x] No specific timelines (uses quarters) - PASS
- [x] No competitive information - PASS

#### Link Validation
| Link | Target | Status |
|------|--------|--------|
| `CHANGELOG.md` | Root | ✅ Exists |
| `/.github/RFC_TEMPLATE.md` | .github folder | ✅ Exists |
| `docs/FEATURE_PROCESS.md` | docs folder | ✅ Exists |
| `CONTRIBUTING.md` | Root | ✅ Exists |
| GitHub Project URL | External | ⚠️ Placeholder (expected - Task 1-4 pending) |

### Outstanding Items
- Tasks 1-4 (GitHub Project configuration) require @github-devops agent
- Final "Test public access" validation requires GitHub Project to exist

### Recommendation
**Approve for merge** - Documentation deliverables (Tasks 5-8) meet all acceptance criteria. GitHub Project tasks (1-4) should be tracked separately and completed by @github-devops.

---

## 📋 Manual Instructions for Tasks 1-4

### Prerequisites

The GitHub CLI requires additional scopes for project management. Run this command and complete the authentication in your browser:

```bash
gh auth refresh -h github.com -s project,read:project
```

### Task 1: Create GitHub Project

**Option A: GitHub CLI (after auth refresh)**
```bash
gh project create --owner SynkraAI --title "AIOS Public Roadmap" --format json
```

**Option B: GitHub UI**
1. Navigate to: https://github.com/orgs/SynkraAI/projects/new
2. Select "Board" template
3. Title: `AIOS Public Roadmap`
4. Description: `What we're working on and planning`
5. Visibility: **Public**
6. Click "Create project"

### Task 2: Configure Views

After creating the project, add these views:

1. **Board View** (default)
   - Columns: `Backlog` | `Next Up` | `In Progress` | `Done`
   - Set as default view

2. **Roadmap View**
   - Click "+ New view" → "Roadmap"
   - Name: `Timeline`
   - Group by: `Quarter` field
   - Configure date range display

3. **Table View**
   - Click "+ New view" → "Table"
   - Name: `By Area`
   - Add filters by Area field
   - Sort by Status/Priority

### Task 3: Configure Custom Fields

Add these custom fields via Project Settings → Custom Fields:

| Field | Type | Options |
|-------|------|---------|
| **Quarter** | Single Select | `Q1 2026`, `Q2 2026`, `Q3 2026`, `Q4 2026`, `Future` |
| **Area** | Single Select | `Core`, `Agents`, `Installer`, `Docs`, `Community`, `Squads` |
| **Size** | Single Select | `Small`, `Medium`, `Large`, `Epic` |
| **Status** | Single Select | `Exploring`, `Planned`, `In Progress`, `Done` |

### Task 4: Populate Initial Items

Add these items to the roadmap (via "Add item" or convert from issues):

**Q1 2026 - Current Focus:**
- [x] Hybrid installer (npx + wizard) - Area: Installer, Status: Done
- [x] 4-module architecture - Area: Core, Status: Done
- [x] Service Discovery - Area: Core, Status: Done
- [x] Quality Gates 3 layers - Area: Core, Status: Done
- [x] Template Engine - Area: Core, Status: Done
- [ ] Open-source community infrastructure - Area: Community, Status: In Progress

**Q2 2026 - Next Up:**
- Memory Layer implementation - Area: Core, Status: Planned
- Enhanced agent capabilities - Area: Agents, Status: Exploring
- Performance optimizations - Area: Core, Status: Exploring
- Squads marketplace - Area: Squads, Status: Planned

**Future Exploration:**
- Multi-language support - Area: Core, Status: Exploring
- Cloud deployment options - Area: Core, Status: Exploring
- Visual workflow builder - Area: Core, Status: Exploring
- Plugin marketplace - Area: Community, Status: Exploring

### Verification Checklist

After completing Tasks 1-4:
- [ ] Project is publicly accessible (test in incognito window)
- [ ] All 3 views render correctly
- [ ] Custom fields appear in item cards
- [ ] Update ROADMAP.md with actual project URL
- [ ] Update story Task 8 checkbox for "Test public access"

---

**Criado por:** River (SM) 🌊
**Data:** 2025-12-05
**Validado por:** Pax (PO) 🎯
**Data Validação:** 2025-12-10
