# Story 6.13 - Audit Report: Systematic Documentation Review

**Date:** 2025-12-15
**Auditor:** Gage (DevOps Agent) + Aria (Architect)
**Status:** ⚠️ CRITICAL FINDINGS - Awaiting Approval

---

## 🚨 CRITICAL FINDINGS

### 1. Personal Data in Repository
**Location:** `.claude/commands/hybridOps/minds/pedro_valerio/`
**Files:** 50 personal files including:
- Personal artifacts and analysis
- Meeting notes (reuniões)
- Personal documents
- Personal system prompts

**ACTION REQUIRED:** DELETE ENTIRELY before open-source release

### 2. Obsolete Terminology Throughout
- "AIOS-FULLSTACK" → "Synkra AIOS" (100+ files)
- "expansion-pack" → "Squad" (50+ files)
- "aios-developer" references (16 files) - agent was removed
- "Pedrovaleriolopez" repo references (30+ files)
- "allfluence" org references (30+ files)

### 3. .claude/commands/ Structure Review
**Location:** `.claude/commands/`
**Contents:**
- `AIOS/` - Core AIOS commands (KEEP)
- `creator/` - Creator Squad (KEEP - rename internally?)
- `etl/` - ETL Squad (KEEP)
- `expansionCreator/` - Old name (RENAME → squadCreator?)
- `hybridOps/` - Contains personal data (CLEAN)
- `innerlens/` - Innerlens Squad (KEEP or REMOVE for OSS?)
- `mmosMapper/` - MMOS Mapper Squad (KEEP or REMOVE for OSS?)

**Question:** Which Squads should be included in OSS release?

### 4. Files Referencing Deleted/Archived Content
- 100+ files reference `docs/stories/` (will be archived)
- 50+ files reference `docs/prd/` (will be archived)
- Links will break after archive

---

## 📋 Decisões Base (Confirmadas pelo Usuário)

| Decisão | Valor |
|---------|-------|
| Nome do Projeto | **Synkra AIOS** |
| aios-developer | **REMOVIDO** (merged em aios-master) |
| expansion-packs | **→ Squads** (nova terminologia) |
| GitHub Repo | **SynkraAI/aios-core** |
| NPM Package | **@synkra/aios-core** |

---

## 📊 Resumo Executivo

| Área | Total | Arquivar | Atualizar | Manter |
|------|-------|----------|-----------|--------|
| Root (`*.md`) | 9 | 0 | 6 | 3 |
| `docs/architecture/` | 35+ | 25 | 5 | 5 |
| `docs/framework/` | 4 | 0 | 1 | 3 |
| `docs/guides/` | 24 | 3 | 5 | 16 |
| `docs/stories/` | 280 | **280** | 0 | 0 |
| `docs/epics/` | 36 | **36** | 0 | 0 |
| `docs/prd/` | 10 | **10** | 0 | 0 |
| `docs/decisions/` | 15 | **15** | 0 | 0 |
| `docs/aios-developer/` | 1 | **1** | 0 | 0 |
| Outras pastas internas | 50+ | **50** | 0 | 0 |
| **TOTAL** | ~450 | ~420 | ~17 | ~30 |

---

## 🔴 ARQUIVAR (.github/deprecated-docs/)

### 1. Documentação Interna de Desenvolvimento

| Pasta | Arquivos | Motivo |
|-------|----------|--------|
| `docs/stories/` | 280 | Tracking interno de sprints |
| `docs/epics/` | 36 | Planejamento interno |
| `docs/prd/` | 10 | Requisitos internos |
| `docs/decisions/` | 15 | Logs de decisão internos |
| `docs/one-pagers/` | 5 | Decision docs internos |
| `docs/qa/` | 10 | Relatórios QA internos |
| `docs/validation/` | 1 | Validação interna |
| `docs/requirements/` | 1 | Requisitos internos |
| `docs/specifications/` | 1 | Specs internas |
| `docs/backlog/` | 1 | Backlog interno |
| `docs/installer/` | 1 | Doc interna do installer |
| `docs/migration/` | 7 | Docs de migração interna |
| `docs/security/` | 1 | Scan report interno |
| `docs/aios-developer/` | 1 | Removido (merged em aios-master) |

### 2. docs/architecture/ - Arquivos para Arquivar

| Arquivo | Motivo |
|---------|--------|
| `source-tree.md` | Duplicado - oficial em framework/ |
| `coding-standards.md` | Duplicado - oficial em framework/ |
| `tech-stack.md` | Duplicado - oficial em framework/ |
| `introduction.md` | v2.0 legacy |
| `mvp-components.md` | v2.0 legacy |
| `tools-system-brownfield.md` | Análise interna (187KB!) |
| `tools-system-schema-refinement.md` | Análise interna |
| `tools-system-handoff.md` | Handoff interno |
| `technical-review-greeting-system-unification.md` | Review interno |
| `schema-comparison-sqlite-supabase.md` | Comparação interna |
| `SYNKRA-REBRANDING-SPECIFICATION.md` | Decisão histórica |
| `coderabbit-integration-decisions.md` | Doc de decisão (não implementação) |
| `agent-tool-integration-guide.md` | **OBSOLETO** (mudou para MCPs) |
| `architect-expansion-pack-rearchitecture.md` | Terminologia antiga |
| `architect-validation-expansion-pack-stories.md` | Validação interna |
| `hybrid-ops-pv-mind-integration.md` | Integração específica |
| `agent-config-audit.md` | Auditoria interna |
| `internal-tools-analysis.md` | Análise interna |
| `dependency-resolution-plan.md` | Plano interno |
| `repository-migration-plan.md` | Migração interna |
| `decisions/` (pasta inteira) | ADRs internos |
| `project-decisions/` (pasta inteira) | Decisões internas |
| `analysis/` (pasta inteira) | Análises internas |
| `_archived/` (pasta inteira) | Já arquivado |

### 3. docs/ Root - Arquivos para Arquivar

| Arquivo | Motivo |
|---------|--------|
| `backlog-prioritization.md` | Planejamento interno |
| `expansion-packs.md` | Terminologia antiga + interno |
| `launch-checklist.md` | Checklist interno |
| `technical-debt-register.md` | Tracking interno |
| `versions.md` | Notas internas |

### 4. docs/guides/ - Arquivos para Arquivar

| Arquivo | Motivo |
|---------|--------|
| `command-migration-guide.md` | Migração interna v2→v3 |
| `community-to-backlog.md` | Processo interno |
| `coderabbit/` | Configs internas |

---

## 🟡 ATUALIZAR

### 1. Root Files (6 arquivos)

| Arquivo | Mudanças Necessárias |
|---------|---------------------|
| `README.md` | **REESCREVER**: "Synkra AIOS", @synkra/aios-core, SynkraAI/aios-core, remover aios-developer, expansion-packs→squads, remover links quebrados |
| `CHANGELOG.md` | Simplificar, remover refs a stories internas, atualizar nome |
| `CONTRIBUTING.md` | "Synkra AIOS", SynkraAI/aios-core, remover refs a stories |
| `COMMUNITY.md` | Padronizar SynkraAI/, remover refs a expansion-packs |
| `PRIVACY.md` | "Synkra AIOS", SynkraAI/aios-core |
| `TERMS.md` | "Synkra AIOS", SynkraAI/aios-core |

### 2. docs/architecture/ (5 arquivos)

| Arquivo | Mudanças |
|---------|----------|
| `ARCHITECTURE-INDEX.md` | SynkraAI/, remover refs arquivados |
| `high-level-architecture.md` | Verificar terminologia |
| `multi-repo-strategy.md` | allfluence→SynkraAI |
| `multi-repo-strategy-pt.md` | allfluence→SynkraAI |
| `agent-responsibility-matrix.md` | expansion-packs→squads |

### 3. docs/framework/ (1 arquivo)

| Arquivo | Mudanças |
|---------|----------|
| `README.md` | Verificar links |

### 4. docs/guides/ (5 arquivos)

| Arquivo | Mudanças |
|---------|----------|
| `README.md` | Atualizar links |
| `1mcp-*.md` | Verificar paths |
| `squads-guide.md` | Verificar se completo |
| `squad-examples/` | Verificar conteúdo |
| `contextual-greeting-system-guide.md` | Verificar refs |

---

## ✅ MANTER (Sem Alterações Necessárias)

### Root Files (3)
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `ROADMAP.md` (minor update to remove backlog ref)

### docs/architecture/ (5 arquivos essenciais)
- `module-system.md`
- `mcp-system-diagrams.md`
- `mcp-api-keys-management.md`
- `memory-layer.md`
- `utility-integration-guide.md`

### docs/framework/ (3)
- `coding-standards.md` (oficial)
- `source-tree.md` (oficial)
- `tech-stack.md` (oficial)

### docs/guides/ (16+ guias de usuário)
- `1mcp-*.md` (5 arquivos)
- `squads-guide.md`
- `quality-gates.md`
- `quality-dashboard.md`
- `service-discovery.md`
- `template-engine-v2.md`
- `llm-routing.md`
- `mcp-global-setup.md`
- `multi-mode-story-development.md`
- `project-status-feature.md`
- `decision-logging-guide.md`
- `branch-protection.md`
- `agent-selection-guide.md`

### Outras Pastas a Manter
- `docs/installation/`
- `docs/agents/`
- `docs/community/`
- `docs/standards/`

---

## 📝 Plano de Execução

### Fase 1: Arquivar Documentação Interna (~400 arquivos)
```bash
# Criar estrutura de arquivo
mkdir -p .github/deprecated-docs/{stories,epics,prd,decisions,qa,one-pagers,validation,requirements,specifications,backlog,installer,migration,security,aios-developer,architecture-internal}

# Mover pastas inteiras
git mv docs/stories/ .github/deprecated-docs/stories/
git mv docs/epics/ .github/deprecated-docs/epics/
git mv docs/prd/ .github/deprecated-docs/prd/
git mv docs/decisions/ .github/deprecated-docs/decisions/
git mv docs/qa/ .github/deprecated-docs/qa/
git mv docs/one-pagers/ .github/deprecated-docs/one-pagers/
git mv docs/validation/ .github/deprecated-docs/validation/
git mv docs/requirements/ .github/deprecated-docs/requirements/
git mv docs/specifications/ .github/deprecated-docs/specifications/
git mv docs/backlog/ .github/deprecated-docs/backlog/
git mv docs/installer/ .github/deprecated-docs/installer/
git mv docs/migration/ .github/deprecated-docs/migration/
git mv docs/security/ .github/deprecated-docs/security/
git mv docs/aios-developer/ .github/deprecated-docs/aios-developer/

# Mover arquivos específicos de architecture/
git mv docs/architecture/source-tree.md .github/deprecated-docs/architecture-internal/
# ... (continua para cada arquivo)
```

### Fase 2: Atualizar Arquivos (~17 arquivos)
- Search & Replace global
- Atualização manual de conteúdo onde necessário

### Fase 3: Validação
- Verificar links quebrados
- Testar builds
- Revisar estrutura final

### Fase 4: Commit & Push

---

## ⚠️ Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Links quebrados | Grep validation antes do push |
| Perda de contexto histórico | Arquivar, não deletar |
| Referências em código | Verificar .aios-core/ deps |

---

## ❓ Decisões Pendentes

1. **docs/agents/** - Manter ou revisar conteúdo?
2. **docs/community/** - Manter snippets de README?
3. **.aios-core/** - Auditoria completa necessária separadamente?

---

**Aguardando aprovação para executar o plano.**

*Relatório gerado: 2025-12-15*
