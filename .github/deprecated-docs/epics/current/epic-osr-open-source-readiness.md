# Epic: Open-Source Community Readiness (OSR)

**Epic ID:** OSR
**Status:** ✅ APPROVED - Ready for Story Draft
**Created:** 2025-12-05
**Approved by:** PM (Morgan) + Stakeholder
**PO:** Pax (Balancer)
**Target Sprint:** Sprint 5-6
**Total Stories:** 10 stories
**Total Effort:** ~45 hours

---

## 🎯 Epic Goal

Preparar o AIOS-FULLSTACK (ou novo repositório) para release open-source público completo, incluindo:
1. **Infraestrutura técnica** validada
2. **Community enablement** completo
3. **Governance** e políticas
4. **Expansion Pack ecosystem** (MVP - apenas free/community)

---

## 📋 Decisões Estratégicas (PM Session 2025-12-05)

### Q1. Escopo v2.1
**Decisão:** B) Completo (toda estrutura de community)
**Adicional:** Investigação se melhor criar repo separado para open-source

### Q2. Dependências Externas
**Decisão:** Templates padrão (sem advogado/empresa externa para v2.1)

### Q3. Expansion Pack Marketplace
**Decisão:** A) MVP - apenas guia para expansion packs free/community
**Rationale:** Foco em colaboração, não em monetização neste momento
**Adicional:** Investigação de rebranding nomenclatura para Synkra

### Q4. Phase 1 (Validação)
**Decisão:** A) Consolidar em 1 sessão de audit (1 story)

---

## 📊 Stories Consolidadas (10 Total)

### Sprint 5 - Foundation (5 stories, ~25h)

**Location:** [docs/stories/v2.1/sprint-5/](../stories/v2.1/sprint-5/)

| ID | Story | Tipo | Priority | Effort | Deps |
|----|-------|------|----------|--------|------|
| **[OSR-1](../stories/v2.1/sprint-5/story-osr-1-validation-audit.md)** | Audit Session: Validar Infraestrutura Existente | 🔍 Audit | 🔴 Critical | 4h | - |
| **[OSR-2](../stories/v2.1/sprint-5/story-osr-2-repo-investigation.md)** | Investigação: Repositório Separado vs. Cleanup | 🔬 Investigation | 🔴 Critical | 8h | OSR-1 |
| **[OSR-3](../stories/v2.1/sprint-5/story-osr-3-legal-foundation.md)** | Legal Foundation (CHANGELOG, Privacy, ToS) | 🔧 Tech Debt | 🔴 Critical | 6h | - |
| **[OSR-4](../stories/v2.1/sprint-5/story-osr-4-github-community-setup.md)** | GitHub Community Setup (Discussions, Labels) | 📌 Follow-up | 🟠 High | 3h | - |
| **[OSR-5](../stories/v2.1/sprint-5/story-osr-5-community-handbook.md)** | COMMUNITY.md - Handbook para Contributors | ✨ Enhancement | 🟠 High | 4h | OSR-1 |

### Sprint 6 - Community & Release (5 stories, ~20h)

**Location:** [docs/stories/v2.1/sprint-6/](../stories/v2.1/sprint-6/)

| ID | Story | Tipo | Priority | Effort | Deps |
|----|-------|------|----------|--------|------|
| **[OSR-6](../stories/v2.1/sprint-6/story-osr-6-features-process.md)** | Processo Público para Features/Backlog | ✨ Enhancement | 🟠 High | 4h | OSR-5 |
| **[OSR-7](../stories/v2.1/sprint-6/story-osr-7-public-roadmap.md)** | Public Roadmap para Comunidade | ✨ Enhancement | 🟡 Medium | 4h | OSR-6 |
| **[OSR-8](../stories/v2.1/sprint-6/story-osr-8-expansion-pack-guide.md)** | Guia para Publicar Expansion Packs (Free) | ✨ Enhancement | 🟡 Medium | 4h | OSR-2 |
| **[OSR-9](../stories/v2.1/sprint-6/story-osr-9-rebranding-synkra.md)** | Investigação: Rebranding Synkra - Nomenclatura | 🔬 Investigation | 🟡 Medium | 4h | - |
| **[OSR-10](../stories/v2.1/sprint-6/story-osr-10-release-checklist.md)** | Public Release Checklist Final | ✨ Enhancement | 🟠 High | 4h | All |

---

## 📝 Detalhamento das Stories

### OSR-1: Audit Session - Validar Infraestrutura Existente

**Objetivo:** Revisar toda infraestrutura open-source existente em 1 sessão com PO

**Checklist de Validação:**
- [ ] `LICENSE` - MIT License válida
- [ ] `CODE_OF_CONDUCT.md` - Contributor Covenant
- [ ] `CONTRIBUTING.md` - 371 linhas, processo completo
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` + `expansion-pack.md`
- [ ] `.github/ISSUE_TEMPLATE/` - 3 templates (bug, feature, expansion)
- [ ] `.github/workflows/` - 9 workflows CI/CD
- [ ] `.github/CODEOWNERS` + `FUNDING.yaml`
- [ ] `docs/audits/ROUNDTABLE-OPEN-SOURCE-STRATEGY-2025-01-19.md`
- [ ] `.aios-core/docs/standards/OPEN-SOURCE-VS-SERVICE-DIFFERENCES.md`

**Output:** Relatório de audit com issues identificadas

---

### OSR-2: Investigação - Repositório Separado vs. Cleanup

**Objetivo:** Decidir entre criar repo novo para open-source ou limpar aios-fullstack

**Escopo:**
- [ ] Mapear todo código deprecated em aios-fullstack
- [ ] Identificar código proprietário que NÃO vai para open-source:
  - Clones (DNA Mental™)
  - Expansion Packs proprietários
  - Código específico de serviço
- [ ] Listar pastas/arquivos a serem excluídos
- [ ] Avaliar prós/contras:

| Critério | Opção A: Novo Repo | Opção B: Cleanup |
|----------|-------------------|------------------|
| Histórico git | ❌ Perdido | ✅ Mantido |
| Clean start | ✅ Limpo | ⚠️ Resquícios |
| Esforço | 🟡 Médio | 🟠 Alto |
| Confusão comunidade | ✅ Claro | ⚠️ Possível |
| SEO/Links existentes | ❌ Quebrados | ✅ Mantidos |

- [ ] Propor estratégia de migração
- [ ] Estimar esforço de cada opção

**Output:** Documento de decisão com recomendação clara

---

### OSR-3: Legal Foundation

**Objetivo:** Criar documentação legal usando templates padrão

**Deliverables:**
- [ ] `CHANGELOG.md` - Histórico de releases desde v1.0
- [ ] `PRIVACY.md` - Privacy Policy (template padrão open-source)
- [ ] `TERMS.md` - Terms of Service (template padrão)
- [ ] Atualizar `LICENSE` se necessário

**Templates Sugeridos:**
- Privacy: [Standard Privacy Policy for Open Source](https://www.freeprivacypolicy.com/)
- Terms: [Open Source Terms Template](https://opensource.org/)

---

### OSR-4: GitHub Community Setup

**Objetivo:** Configurar features de community no GitHub

**Deliverables:**
- [ ] Habilitar GitHub Discussions
- [ ] Configurar categorias de discussions (Q&A, Ideas, Show & Tell, etc.)
- [ ] Criar sistema de labels:
  - `good-first-issue` - Para iniciantes
  - `help-wanted` - Precisamos de ajuda
  - `community` - Contribuição da comunidade
  - `expansion-pack` - Relacionado a packs
  - `documentation` - Docs
  - `bug`, `enhancement`, `question`
- [ ] Configurar issue templates com labels automáticos
- [ ] Testar fluxo completo

---

### OSR-5: COMMUNITY.md - Handbook para Contributors

**Objetivo:** Criar handbook completo para novos contributors

**Estrutura Proposta:**
```markdown
# COMMUNITY.md

## Welcome to AIOS Community! 🎉

## How to Contribute
- Finding issues to work on
- Development setup
- PR process
- Code review expectations

## Communication Channels
- GitHub Discussions (primary)
- Discord (real-time)
- Issue tracker

## Recognition
- Contributors wall
- Release credits

## Governance
- Decision making process
- Maintainer roles
- Escalation path

## Resources
- Documentation
- Tutorials
- FAQ
```

---

### OSR-6: Processo Público para Features/Backlog

**Objetivo:** Permitir comunidade propor e votar em features

**Escopo:**
- [ ] Documentar processo de proposição de features
- [ ] Criar template de RFC (Request for Comments)
- [ ] Definir critérios de aceitação
- [ ] Configurar GitHub Discussions category "Feature Proposals"
- [ ] Documentar processo de votação/priorização
- [ ] Integrar com backlog interno

---

### OSR-7: Public Roadmap para Comunidade

**Objetivo:** Dar visibilidade do roadmap para comunidade

**Opções a Avaliar:**
- [ ] GitHub Projects (public board)
- [ ] Roadmap.md no repo
- [ ] Página dedicada em docs

**Conteúdo:**
- [ ] Visão de curto prazo (próximos 2 sprints)
- [ ] Visão de médio prazo (próximo quarter)
- [ ] Visão de longo prazo (próximo ano)
- [ ] Status de features em desenvolvimento

---

### OSR-8: Guia para Publicar Expansion Packs (Free)

**Objetivo:** Permitir comunidade criar e publicar expansion packs gratuitos

**Escopo:**
- [ ] Documentar estrutura de um expansion pack
- [ ] Template de expansion pack (scaffold)
- [ ] Checklist de qualidade
- [ ] Processo de submissão (PR)
- [ ] Critérios de aprovação
- [ ] Como listar no registry (docs)

**Importante:**
- ⚠️ NÃO mencionar marketplace futuro
- ⚠️ Foco em colaboração, não monetização
- ✅ Apenas expansion packs gratuitos/community

---

### OSR-9: Investigação - Rebranding Synkra - Nomenclatura

**Objetivo:** Propor nova nomenclatura para "expansion-packs" alinhada com Synkra

**Escopo:**
- [ ] Pesquisar nomenclaturas em frameworks similares:
  - VS Code: Extensions
  - Terraform: Modules
  - Kubernetes: Operators
  - WordPress: Plugins
  - npm: Packages
- [ ] Propor 3-5 alternativas para "expansion-pack"
- [ ] Avaliar impacto de migração:
  - Paths no código
  - Documentação
  - URLs/Links
  - Branding/Marketing
- [ ] Validar alinhamento com visão Synkra
- [ ] Recomendar nomenclatura final

**Candidatos Iniciais:**
1. Synkra Modules
2. Synkra Extensions
3. Synkra Kits
4. Synkra Packs
5. Synkra Plugins

---

### OSR-10: Public Release Checklist Final

**Objetivo:** Gate final antes de tornar repo público

**Checklist:**
- [ ] Todos os OSR-1 a OSR-9 completos
- [ ] Decisão de repo (OSR-2) implementada
- [ ] Zero secrets/credentials expostos
- [ ] Zero código proprietário exposto
- [ ] Documentação 100% em inglês (ou bilíngue)
- [ ] README atualizado para comunidade
- [ ] Links funcionando
- [ ] CI/CD verde
- [ ] Security scan limpo
- [ ] Comunicação de launch preparada

---

## 🔄 Fluxo de Dependências

```
Sprint 5 (Foundation)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  OSR-1 (Audit) ──────┬──────► OSR-2 (Repo Investigation)   │
│                      │                                      │
│                      └──────► OSR-5 (COMMUNITY.md)         │
│                                                             │
│  OSR-3 (Legal) ─────────────► Parallel                     │
│                                                             │
│  OSR-4 (GitHub Setup) ──────► Parallel                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
Sprint 6 (Community & Release)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  OSR-5 ────► OSR-6 (Features Process) ────► OSR-7 (Roadmap)│
│                                                             │
│  OSR-2 ────► OSR-8 (Expansion Pack Guide)                  │
│                                                             │
│  OSR-9 (Rebranding) ─────────► Parallel                    │
│                                                             │
│  ALL ────────────────────────► OSR-10 (Release Checklist)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ❌ Itens Removidos/Adiados

| Item Original | Decisão | Motivo | Quando |
|---------------|---------|--------|--------|
| Security Audit externo | Adiado | Templates padrão suficientes para v2.1 | v2.2 |
| Expansion Pack Marketplace | Removido | Foco em colaboração | v2.2+ |
| Processo aprovação pago | Removido | Não mostrar monetização ainda | v2.2+ |
| Contributor recognition system | Simplificado | Incluído em COMMUNITY.md | - |

---

## 🎯 Critérios de Sucesso do Epic

### Infraestrutura
- [ ] 100% dos arquivos existentes validados
- [ ] Decisão de repo (novo vs. cleanup) tomada
- [ ] Documentação legal completa

### Community
- [ ] GitHub Discussions ativo
- [ ] Sistema de labels configurado
- [ ] COMMUNITY.md publicado
- [ ] Processo de features documentado
- [ ] Public roadmap visível

### Expansion Packs
- [ ] Guia de publicação disponível (free only)
- [ ] Template de pack disponível
- [ ] Investigação de nomenclatura completa

### Release
- [ ] Release checklist validado
- [ ] Zero blockers identificados
- [ ] Comunicação de launch preparada

---

## 📅 Timeline

| Sprint | Stories | Effort | Milestone |
|--------|---------|--------|-----------|
| Sprint 5 | OSR-1 a OSR-5 | ~25h | Foundation Complete |
| Sprint 6 | OSR-6 a OSR-10 | ~20h | Ready for Public Release |

---

## 📝 Histórico de Decisões

| Data | Decisão | Stakeholder |
|------|---------|-------------|
| 2025-12-05 | Epic criado por @po | Pax |
| 2025-12-05 | Consolidação aprovada por @pm | Morgan |
| 2025-12-05 | Escopo completo aprovado | Stakeholder |
| 2025-12-05 | Repo investigation adicionada | Stakeholder |
| 2025-12-05 | Rebranding investigation adicionada | Stakeholder |

---

## 🔗 Referências

- [Story OSR-1 Detalhada](story-osr-1-validation-audit.md)
- [Roundtable Open-Source Strategy](../../audits/ROUNDTABLE-OPEN-SOURCE-STRATEGY-2025-01-19.md)
- [Open-Source vs Service](../../../.aios-core/docs/standards/OPEN-SOURCE-VS-SERVICE-DIFFERENCES.md)
- [Backlog](../backlog.md)

---

## 🚀 Próximos Passos

1. ✅ Epic consolidado e aprovado
2. ⏳ @sm (River) draftar stories detalhadas
3. ⏳ @po (Pax) validar e adicionar ao sprint
4. ⏳ Executar Sprint 5 stories
5. ⏳ Review e ajustes
6. ⏳ Executar Sprint 6 stories
7. ⏳ Public Release! 🎉

---

**Criado por:** Pax (PO) 🎯
**Consolidado por:** Morgan (PM) 📋
**Data:** 2025-12-05
**Status:** ✅ APPROVED - Ready for @sm Story Draft

---

*Epic criado como parte do processo de preparação para open-source release do AIOS-FULLSTACK*
