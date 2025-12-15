# OSR-2: Repository Strategy Investigation - Decision Document

**Date:** 2025-12-08
**Author:** @dev (Dex) + @sm (River)
**Status:** ✅ APROVADO (2025-12-08)
**Story:** OSR-2 (Open-Source Community Readiness)
**Related Decisions:** Decision #4, Decision #5

---

## Executive Summary

**Recommendation:** Option A - Novo Repositorio (Clean Start) com migracao seletiva

**Justificativa Principal:** O volume de codigo deprecated (8+ diretorios raiz), a presenca de 44 minds MMOS proprietarios, e o risco MEDIO no historico git tornam a opcao de limpeza mais arriscada e demorada do que criar repositorios novos alinhados com a arquitetura de 5 repos definida na Decision #5.

---

## 1. Mapeamento de Codigo Deprecated

### Diretorios Deprecated no Root

| Diretorio | Tamanho Estimado | Risco de Exposicao | Recomendacao |
|-----------|------------------|-------------------|--------------|
| `.aios-core.backup-pre-consolidation-20250114-temp/` | Grande | BAIXO | Remover |
| `.deprecated/` | Medio | BAIXO | Remover |
| `aios-core.backup-pre-consolidation-20250114-temp/` | Grande | BAIXO | Remover |
| `aios-core.backup-pre-mmos-merge/` | Grande | MEDIO | Remover |
| `aios-core-depracated/` | Grande | BAIXO | Remover (typo no nome) |
| `archived-utilities/` | Medio | BAIXO | Remover |
| `expansion-packs.backup-20251112/` | Grande | MEDIO | Remover |
| `temp-repos/` | Medio | BAIXO | Remover |

### Diretorios Deprecated Nested

| Caminho | Conteudo | Recomendacao |
|---------|----------|--------------|
| `expansion-packs/etl/deprecated/` | ETL deprecated code | Remover antes de open-source |

### Arquivos .backup Encontrados

- Multiplos arquivos `.backup*` espalhados pelo projeto
- Pattern encontrado: `*.backup`, `*.bak`, `*-backup-*`

**Total Estimado para Remocao:** ~500+ arquivos em deprecated/backup directories

---

## 2. Identificacao de Codigo Proprietario

### MMOS - Minds Proprietarios (NAO PODEM IR PARA OPEN-SOURCE)

**Location:** `expansion-packs/mmos/minds/`

**Total de Minds:** 44 cognitive clones

| Categoria | Minds | Status |
|-----------|-------|--------|
| **Tech Leaders** | andrej_karpathy, guillermo_rauch, kent_beck, linus_torvalds, mitchell_hashimoto | PROPRIETARIO |
| **Business/Startup** | alex_hormozi, elon_musk, naval_ravikant, paul_graham, peter_thiel, sam_altman | PROPRIETARIO |
| **Marketing/Sales** | dan_kennedy, dan_koe, gary_halbert, gary_vee, russel_brunson, seth_godin | PROPRIETARIO |
| **Product** | cagan_patton, jeff_patton, marty_cagan, steve_jobs | PROPRIETARIO |
| **Philosophy/Science** | daniel_kahneman, leonardo_da_vinci, napoleon_hill, ray_kurzweil, steven_pinker, yuval_harari | PROPRIETARIO |
| **Personal** | pedro_valerio, joao_lozano, jose_amorim | PROPRIETARIO |
| **Outros** | abilio_diniz, adriano_de_marqui, alan_nicolas, brad_frost, don_norman, jesus_cristo, jon_benson, kapil_gupta, mark_manson, ricky_and_morty, thiago_finch, tim_ferriss, walt_disney, eugene_schwartz | PROPRIETARIO |

**Acao Necessaria:** Mover para REPO 5 (mmos) conforme Decision #5

### Expansion Packs

| Pack | Status | Destino |
|------|--------|---------|
| `etl/` | FREE (com deprecated) | REPO 2 (limpar deprecated primeiro) |
| `example-pack/` | FREE (template) | REPO 2 |
| `expansion-creator/` | FREE (tool) | REPO 2 |
| `mmos/` | PROPRIETARIO | REPO 5 |

### Arquivos de Configuracao Sensiveis

| Arquivo | Conteudo | Acao |
|---------|----------|------|
| `aios-guide-app/.env.local` | Variaveis locais | Verificar, nao commitar |
| `aios-memory-layer-mvp/.env.example` | Template | OK para open-source |
| `aios-memory-layer-mvp/.env.production` | Producao | VERIFICAR - pode ter secrets |
| `benchmarks/toon-parsing/.env.example` | Template | OK para open-source |
| `templates/env/.env.example` | Template | OK para open-source |
| `templates/env/.env.template` | Template | OK para open-source |

---

## 3. Analise de Historico Git

### Busca por Secrets

**Patterns Pesquisados:**
- `pk_` (Stripe public keys)
- `ghp_` (GitHub personal access tokens)
- `sk-` (OpenAI/Stripe secret keys)

**Resultados:**

| Pattern | Ocorrencias | Avaliacao |
|---------|-------------|-----------|
| `pk_` | Encontradas | Aparentam ser exemplos de documentacao |
| `ghp_` | Encontradas | Referencias em docs, nao keys reais |
| `sk-` | Encontradas | Padroes em docs/exemplos |

### Avaliacao de Risco

**Nivel de Risco:** MEDIO

**Justificativa:**
- Nenhum secret real confirmado exposto
- Patterns existem mas parecem ser documentacao/exemplos
- Recomendado audit completo com ferramentas especializadas (truffleHog, git-secrets) antes de release publico
- Opcao segura: usar BFG Repo-Cleaner ou git filter-branch se criar novo repo

### Arquivos Grandes no Historico

- Nao foi possivel completar analise de tamanho (erro de comando)
- Recomendacao: executar `git rev-list --objects --all | head -1000` manualmente

---

## 4. Estimativa de Esforco por Opcao

### Opcao A: Novo Repositorio (Clean Start)

| Tarefa | Esforco | Notas |
|--------|---------|-------|
| Criar 5 repos conforme Decision #5 | 4h | GitHub org setup |
| Migrar aios-core seletivamente | 8h | Copiar apenas codigo limpo |
| Migrar expansion-packs (exceto mmos) | 4h | etl, example-pack, creator |
| Configurar REPO 5 (mmos) privado | 2h | 44 minds |
| Setup CI/CD para cada repo | 6h | GitHub Actions |
| Migrar documentacao | 4h | docs/ relevantes |
| Configurar mcp-ecosystem | 4h | Presets, configs |
| Audit final de security | 4h | Verificar nenhum secret migrado |
| **TOTAL OPCAO A** | **36h** | |

### Opcao B: Cleanup do aios-fullstack

| Tarefa | Esforco | Notas |
|--------|---------|-------|
| Remover 8+ diretorios deprecated | 4h | rm -rf + verify |
| Limpar arquivos .backup | 2h | find + delete |
| Separar MMOS para repo privado | 8h | Mover + git history cleanup |
| Audit completo de git history | 16h | BFG/truffleHog scanning |
| Potencial git filter-branch | 8h | Se secrets encontrados |
| Reestruturar para 5-repo split | 12h | git subtree/sparse checkout |
| Configurar branch protection | 2h | Main branch rules |
| Audit final de security | 8h | Mais extenso devido historico |
| **TOTAL OPCAO B** | **60h** | |

### Comparativo de Esforco

| Criterio | Opcao A (Novo) | Opcao B (Cleanup) |
|----------|----------------|-------------------|
| **Esforco Total** | 36h | 60h |
| **Risco de Exposicao** | BAIXO | MEDIO |
| **Complexidade** | MEDIA | ALTA |
| **Alinhamento Decision #5** | ALTO | MEDIO |
| **Historico Git** | Limpo | Bagagem |
| **SEO/Stars** | Zero inicial | Mantido |
| **URLs Existentes** | Quebrados | Mantidos |

---

## 5. Recomendacao Final

### Opcao Escolhida: A - Novo Repositorio (Clean Start)

### Justificativa

1. **Menor Esforco (40% menos):** 36h vs 60h

2. **Menor Risco de Exposicao:**
   - Sem historico git com potenciais secrets
   - Migracao seletiva garante apenas codigo limpo

3. **Alinhamento Total com Decision #5:**
   - 5 repos ja definidos e aprovados
   - Estrutura limpa desde o inicio

4. **44 Minds MMOS Protegidos:**
   - Nunca passam pelo repo publico
   - Direto para REPO 5 privado

5. **Codigo Deprecated Eliminado:**
   - Nao migrar = nao precisa limpar
   - ~500+ arquivos nao vao para novo repo

### Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Perda de historico git | BAIXO | Arquivar aios-fullstack como readonly |
| URLs quebrados | MEDIO | Redirect docs ou README com nova localizacao |
| Contributors perdem credito | BAIXO | Mencionar no README, CONTRIBUTORS.md |
| SEO reset | MEDIO | Naming otimizado (aios/aios-core) compensa |

### Proximos Passos

1. **Aprovar esta recomendacao** com stakeholder
2. **Criar organizacao** `aios/` no GitHub
3. **Iniciar REPO 3** (mcp-ecosystem) primeiro conforme Decision #5
4. **Migrar REPO 5** (mmos) para privado
5. **Seguir phased timeline** da Decision #5

---

## 6. Estrutura Final Aprovada

> **Nota:** O nome `aios` está ocupado no GitHub. Decisão aprovada: usar organização `allfluence` existente (Team plan).

```
GitHub Organization: allfluence/

PUBLIC REPOSITORIES (Open-Source):
├── REPO 1: allfluence/aios-core          (Commons Clause) - Q2 2026
├── REPO 2: allfluence/expansion-packs    (MIT) - Q3 2026
└── REPO 3: allfluence/mcp-ecosystem      (Apache 2.0) - Q2 2026

PRIVATE REPOSITORIES:
├── REPO 4: allfluence/certified-partners (Proprietary)
├── REPO 5: allfluence/mmos               (Proprietary + NDA)
├── allfluence/ttcx-workflow-api          (Existente - não relacionado)
└── allfluence/ttcx-casting-system        (Existente - não relacionado)

ARCHIVED:
└── pedrovaleriolopez/aios-fullstack      (Read-only archive)
```

### Vantagens da Escolha `allfluence`

| Benefício | Descrição |
|-----------|-----------|
| **Team Plan Ativo** | Repos privados ilimitados, features enterprise |
| **Já Configurado** | Sem setup adicional de billing |
| **Profissional** | URL profissional para open-source |
| **Escalável** | Pode adicionar teams e membros facilmente |
| **Brand** | AllFluence como empresa por trás do AIOS |

---

## Aprovacao

- [x] Stakeholder (Pedro Valerio) - 2025-12-08
- [x] @pm (Morgan) - 2025-12-08 ✅ **Aprovado com observação: brand consistency com AllFluence**
- [x] @po (Pax) - 2025-12-08
- [x] @architect (Aria) - 2025-12-08 ✅ **Aprovado: estrutura de 5 repos arquiteturalmente sólida, separação de concerns correta, licenciamento apropriado. Recomendação: criar docs/architecture/multi-repo-strategy.md antes de OSR-4**

### Decisão Adicional: GitHub Organization

**Data:** 2025-12-08
**Decisão:** Usar organização `allfluence` existente (Team plan)
**Motivo:** Nome `aios` indisponível no GitHub; `allfluence` já tem Team plan pago e setup completo

---

**Documento Version:** 1.0
**Data de Criacao:** 2025-12-08
**Autor:** @dev (Dex) - Investigacao Tecnica
**Revisor:** @sm (River) - Consolidacao e Formato

---

*Este documento de decisao foi criado como deliverable da Story OSR-2*
