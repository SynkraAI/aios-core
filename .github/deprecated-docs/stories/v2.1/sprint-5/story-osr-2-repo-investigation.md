# Story OSR-2: Investigação - Repositório Separado vs. Cleanup

**Epic:** Open-Source Community Readiness (OSR)
**Story ID:** OSR-2
**Sprint:** 5
**Priority:** 🔴 Critical
**Points:** 8
**Effort:** 8 hours
**Status:** ✅ DONE (2025-12-08)
**Type:** 🔬 Investigation

---

## 📋 User Story

**Como** stakeholder do AIOS,
**Quero** uma análise comparativa entre criar um novo repositório para open-source ou limpar o aios-fullstack existente,
**Para** tomar uma decisão informada sobre a melhor estratégia de release público.

---

## 🎯 Objetivo

Investigar e recomendar a melhor abordagem para o release open-source, considerando código deprecated, proprietário e a experiência da comunidade.

---

## 📊 Análise Comparativa

### Opção A: Novo Repositório (Clean Start)

**Nome sugerido:** `synkra-core` ou `aios-oss`

| Critério | Avaliação | Notas |
|----------|-----------|-------|
| Histórico git | ❌ Perdido | Commits anteriores não migram |
| Clean start | ✅ Excelente | Zero código legado |
| Esforço | 🟡 Médio | Setup novo + migração seletiva |
| Confusão comunidade | ✅ Baixa | Repo claramente novo |
| SEO/Links | ❌ Quebrados | URLs antigas não funcionam |
| Secrets exposure risk | ✅ Baixo | Sem histórico com possíveis leaks |

**Prós:**
- Começo limpo, sem bagagem
- Menor risco de expor código proprietário acidentalmente
- Naming alinhado com Synkra (se aplicável)
- Estrutura otimizada desde o início

**Contras:**
- Perde histórico de commits (contributors)
- Requer setup completo de CI/CD
- Links/referências externas quebram
- Duplicação temporária de esforço

---

### Opção B: Cleanup do aios-fullstack

| Critério | Avaliação | Notas |
|----------|-----------|-------|
| Histórico git | ✅ Mantido | Preserva contribuições |
| Clean start | ⚠️ Parcial | Pode ter resquícios |
| Esforço | 🟠 Alto | Limpeza extensiva necessária |
| Confusão comunidade | ⚠️ Média | Transição pode confundir |
| SEO/Links | ✅ Mantidos | URLs continuam funcionando |
| Secrets exposure risk | 🟠 Médio | Histórico pode ter leaks |

**Prós:**
- Mantém histórico de commits
- URLs e links existentes funcionam
- Não precisa reconfigurar CI/CD do zero
- Contribuidores mantêm crédito

**Contras:**
- Risco de deixar código proprietário
- Histórico git pode ter secrets expostos
- Mais trabalho de auditoria
- Possível confusão durante transição

---

## ✅ Tasks de Investigação

### 1. Mapeamento de Código Deprecated
- [x] Listar todas as pastas `*-deprecated` ou `*.backup*`
- [x] Identificar código não utilizado (dead code analysis)
- [x] Documentar motivo de cada item deprecated
- [x] Estimar esforço de remoção

**Output:** Lista de arquivos/pastas deprecated com recomendação

### 2. Identificação de Código Proprietário
- [x] Mapear código de Clones (DNA Mental™)
- [x] Mapear Expansion Packs proprietários
- [x] Identificar código específico de serviço (não open-source)
- [x] Verificar dependências proprietárias
- [x] Listar secrets/credentials em código ou histórico

**Categorias Proprietárias (NÃO vão para open-source):**
```
- expansion-packs/mmos/minds/          # Clones/DNA Mental
- expansion-packs/*-proprietary/       # Packs pagos
- services/                            # Backend services
- .env*, credentials*, secrets*        # Configurações sensíveis
```

**Output:** Lista completa de código proprietário a excluir

### 3. Análise de Histórico Git
- [x] Verificar se há secrets commitados no histórico
- [x] Identificar arquivos grandes que podem ser removidos
- [x] Avaliar necessidade de git filter-branch ou BFG
- [x] Documentar riscos de exposição

**Comandos úteis:**
```bash
# Buscar possíveis secrets no histórico
git log -p --all -S "password" --source --all
git log -p --all -S "API_KEY" --source --all
git log -p --all -S "secret" --source --all

# Arquivos grandes no histórico
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)'
```

**Output:** Relatório de riscos do histórico git

### 4. Estimativa de Esforço por Opção

| Tarefa | Opção A (Novo Repo) | Opção B (Cleanup) |
|--------|---------------------|-------------------|
| Setup inicial | 4h | 0h |
| Migração de código | 8h | 0h |
| Limpeza de código | 2h | 16h |
| CI/CD setup | 4h | 2h |
| Documentação | 4h | 4h |
| Auditoria segurança | 2h | 8h |
| **TOTAL** | **24h** | **30h** |

### 5. Recomendação Final
- [x] Consolidar análises
- [x] Pesar prós/contras
- [x] Considerar timeline de release
- [x] Documentar recomendação com justificativa
- [x] Apresentar para decisão do stakeholder

---

## 📝 Template de Documento de Decisão

```markdown
# Decisão: Estratégia de Repositório Open-Source

**Data:** YYYY-MM-DD
**Autor:** @sm (River)
**Status:** Proposta / Aprovada / Rejeitada

## Contexto
[Resumo do problema]

## Opções Avaliadas
### Opção A: Novo Repositório
[Análise detalhada]

### Opção B: Cleanup
[Análise detalhada]

## Recomendação
**Opção escolhida:** [A ou B]
**Justificativa:** [Razões principais]

## Riscos e Mitigações
[Lista de riscos identificados]

## Próximos Passos
[Ações a tomar]

## Aprovação
- [ ] Stakeholder
- [ ] @pm (Morgan)
- [ ] @po (Pax)
```

---

## 🎯 Acceptance Criteria

```gherkin
GIVEN a complete investigation of repository options
WHEN the analysis is presented to stakeholder
THEN it includes:
  - Complete list of deprecated code
  - Complete list of proprietary code
  - Git history risk assessment
  - Effort estimation for both options
  - Clear recommendation with justification
AND stakeholder can make informed decision
```

---

## 🔗 Dependencies

**Blocked by:**
- ~~OSR-1: Audit Session~~ ✅ DONE (2025-12-08)

**Blocks:**
- OSR-3: Legal Foundation (estrutura de repos definida)
- OSR-4: GitHub Community Setup (estrutura de repos definida)
- OSR-8: Expansion Pack Guide (precisa saber estrutura do repo)
- OSR-10: Release Checklist (depende da decisão)

**Recomendação Arquitetural:**
- ⚠️ Criar `docs/architecture/multi-repo-strategy.md` **ANTES** de OSR-4 (GitHub Community Setup)

---

## 📋 Definition of Done

- [x] Código deprecated mapeado
- [x] Código proprietário identificado
- [x] Histórico git analisado
- [x] Esforço estimado para ambas opções
- [x] Documento de decisão criado
- [x] Recomendação apresentada
- [x] Decisão do stakeholder obtida

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

| Attribute | Value |
|-----------|-------|
| **Primary Type** | Investigation / Analysis |
| **Secondary Types** | Documentation, Decision |
| **Complexity** | Medium |
| **Risk Level** | Low |

### Specialized Agent Assignment

| Agent | Role | Responsibility |
|-------|------|----------------|
| **@sm (River)** | Primary | Conduzir investigação, consolidar análises |
| **@dev (Dex)** | Support | Análise técnica de código, git history |
| **@po (Pax)** | Review | Validar documento de decisão, aprovar recomendação |
| **@architect (Aria)** | Consult | Input sobre implicações arquiteturais |

### Quality Gate Tasks

#### Pre-Investigation (@sm)
- [x] OSR-1 completado e aprovado
- [x] Acesso ao repositório confirmado
- [x] Ferramentas de análise disponíveis (git, grep, etc.)
- [x] Template de decisão revisado

#### During Investigation (@dev + @sm)
- [x] Deprecated code scan executado
- [x] Proprietary code mapping completo
- [x] Git history analysis sem exposição de secrets
- [x] Estimativas documentadas com justificativa

#### Pre-Decision (@po)
- [x] Documento de decisão preenchido
- [x] Prós/contras balanceados
- [x] Recomendação clara e justificada
- [x] Riscos identificados com mitigações

### Self-Healing Configuration

```yaml
self_healing:
  mode: report_only  # Investigation story - no code to auto-fix
  max_iterations: 1
  timeout_minutes: 30
  severity_behavior:
    CRITICAL: report_and_flag
    HIGH: report_only
    MEDIUM: skip
    LOW: skip
```

### Focus Areas

| Area | Validations |
|------|-------------|
| **Code Analysis** | Deprecated detection, proprietary identification |
| **Security** | Git history secrets scan, credential exposure check |
| **Documentation** | Decision document completeness, recommendation clarity |

---

## ⚠️ Edge Cases & Fallbacks

### Se Análise Incompleta

| Situação | Ação |
|----------|------|
| Não consegue acessar todo o código | Documentar áreas não analisadas, criar follow-up |
| Ferramenta de scan falha | Usar análise manual, documentar limitações |
| Histórico git muito grande | Amostrar períodos críticos, documentar metodologia |
| Ambiguidade proprietário/open | Marcar como "requires review", escalar para stakeholder |

### Se Descobertas Inesperadas

| Descoberta | Ação |
|------------|------|
| Secrets expostos no histórico | PARAR, reportar imediatamente, não publicar |
| Código proprietário em área "open" | Documentar, adicionar à lista de exclusão |
| Dependências com licenças incompatíveis | Listar, avaliar alternativas, incluir na decisão |
| Mais código deprecated que esperado | Atualizar estimativas, considerar impacto na decisão |

### Se Decisão Não Clara

- Documentar empate de critérios
- Listar fatores de desempate (timeline, recursos, risco)
- Apresentar ambas opções igualmente ao stakeholder
- Preparar plano de execução para ambas

---

## 📝 Session Log

**Date:** 2025-12-08
**Duration:** ~2 hours
**Participants:** @dev (Dex) - Technical Investigation

### Investigation Progress

| Task | Status | Findings |
|------|--------|----------|
| Deprecated code scan | ✅ Done | 8+ root directories, ~500+ files |
| Proprietary code mapping | ✅ Done | 44 MMOS minds, 4 expansion packs |
| Git history analysis | ✅ Done | MEDIUM risk, patterns found but likely docs |
| Effort estimation | ✅ Done | Option A: 36h vs Option B: 60h |
| Decision document | ✅ Done | Created decision-osr-2-repository-strategy-investigation.md |

### Key Findings

**Deprecated Code (8+ directories):**
- `.aios-core.backup-pre-consolidation-20250114-temp/`
- `.deprecated/`
- `aios-core.backup-pre-consolidation-20250114-temp/`
- `aios-core.backup-pre-mmos-merge/`
- `aios-core-depracated/` (typo in name)
- `archived-utilities/`
- `expansion-packs.backup-20251112/`
- `temp-repos/`
- `expansion-packs/etl/deprecated/`

**Proprietary Code (44 MMOS Minds):**
- Tech Leaders: andrej_karpathy, linus_torvalds, etc.
- Business: alex_hormozi, naval_ravikant, paul_graham, peter_thiel, etc.
- Marketing: dan_kennedy, gary_halbert, seth_godin, etc.
- All 44 minds must go to REPO 5 (private)

**Git History Risk: MEDIUM**
- Secret patterns (pk_, ghp_, sk-) found
- Appear to be documentation examples, not actual leaks
- Recommend full audit before public release

**Effort Comparison:**
- Option A (New Repo): 36 hours
- Option B (Cleanup): 60 hours
- Option A is 40% less effort

### Blockers Encountered

- PowerShell command for repo size failed (syntax issue)
- Workaround: proceeded without exact size data

### Recommendation

**Option A: Novo Repositorio (Clean Start)** - See decision document for full justification

### Decisão Adicional: GitHub Organization (2025-12-08)

**Problema:** Nome `aios` indisponível no GitHub
**Opções Avaliadas:**
- `pedrovaleriolopez` (personal)
- `allfluence` (org Team plan)
- `aios-team` (org Free plan)

**Decisão:** Usar `allfluence` organization
**Motivo:** Team plan ativo, repos privados ilimitados, profissional

---

## 🎯 Follow-up Actions (para @po adicionar em próximas stories)

### Recomendação Arquitetural (@architect - Aria)

**Ação Obrigatória antes de OSR-4:**

Criar documento `docs/architecture/multi-repo-strategy.md` contendo:

| Seção | Conteúdo |
|-------|----------|
| **Interfaces entre Repos** | Definir contratos de API entre aios-core, expansion-packs e mcp-ecosystem |
| **Versionamento Cross-Repo** | Estratégia de semantic versioning coordenado |
| **Coordenação de Releases** | Processo para releases que afetam múltiplos repos |
| **Dependências Permitidas** | Grafo de dependências permitidas entre repositórios |
| **CI/CD Templates** | Templates reutilizáveis de GitHub Actions |

**Justificativa:** Garantir consistência arquitetural durante a criação dos 5 repositórios na organização `allfluence/`.

**Story Sugerida:** Criar task em OSR-3 ou OSR-4 para este documento.

### Aprovações Registradas

| Aprovador | Data | Observação |
|-----------|------|------------|
| Stakeholder (Pedro) | 2025-12-08 | - |
| @pm (Morgan) | 2025-12-08 | Brand consistency com AllFluence |
| @po (Pax) | 2025-12-08 | - |
| @architect (Aria) | 2025-12-08 | Estrutura sólida, criar multi-repo-strategy.md |

---

## 📎 Anexos

### Estrutura Atual do Repositório (para referência)
```
aios-fullstack/
├── .aios-core/           # ✅ Open-source
├── expansion-packs/      # ⚠️ Mixed (free vs proprietary)
├── docs/                 # ✅ Open-source
├── packages/             # ✅ Open-source
├── *-deprecated/         # ❌ Remover
├── *.backup*/            # ❌ Remover
└── [outros]              # Avaliar caso a caso
```

### Estrutura Final Aprovada (allfluence org)
```
GitHub Organization: allfluence/

PUBLIC REPOSITORIES:
├── allfluence/aios-core          (Commons Clause)
├── allfluence/expansion-packs    (MIT)
└── allfluence/mcp-ecosystem      (Apache 2.0)

PRIVATE REPOSITORIES:
├── allfluence/certified-partners (Proprietary)
├── allfluence/mmos               (Proprietary + NDA)
└── [repos existentes não relacionados ao AIOS]

ARCHIVED:
└── pedrovaleriolopez/aios-fullstack (Read-only)
```

---

**Criado por:** River (SM) 🌊
**Data:** 2025-12-05
**Atualizado:** 2025-12-08 (Investigation completed by @dev - Decision document created, @architect review added)

---

## 📁 File List

### Files Created
| File | Description |
|------|-------------|
| `docs/decisions/decision-osr-2-repository-strategy-investigation.md` | Decision document with full analysis and recommendation |

### Files Modified
| File | Changes |
|------|---------|
| `docs/stories/v2.1/sprint-5/story-osr-2-repo-investigation.md` | Updated checkboxes, session log, findings, follow-up actions, architect review |
| `docs/decisions/decision-osr-2-repository-strategy-investigation.md` | Added @pm and @architect approval notes |
