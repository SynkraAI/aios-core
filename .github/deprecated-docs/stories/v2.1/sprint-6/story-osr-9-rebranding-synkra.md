# Story OSR-9: Investigação Rebranding Synkra

**Epic:** Open-Source Community Readiness (OSR)
**Story ID:** OSR-9
**Sprint:** 6
**Priority:** 🟡 Medium
**Points:** 3
**Effort:** 3 hours
**Status:** ✅ DONE (Decision Made 2025-12-08)
**Type:** 🔍 Investigation

---

## 🎯 DECISÃO FINAL (2025-12-08)

### Resultado da Investigação

**Decisão do Stakeholder (Pedro Valério):**

| Aspecto | Decisão | Rationale |
|---------|---------|-----------|
| **Nome do Framework** | **AIOS** (mantido) | Framework open-source fica com nome técnico descritivo |
| **Nome do Produto PV** | **Synkra** | Produto comercial de Pedro criado com AIOS |
| **Rebranding** | ❌ Não necessário | Nomes servem propósitos diferentes |

### Implicações Documentadas

1. **AIOS (Framework Open-Source)**
   - Nome oficial: "AIOS - AI-Orchestrated System"
   - Repositório: `aios-fullstack` (ou `aios` se repo separado)
   - npm: `@aios/*` namespace
   - Comunidade cria "AIOS Expansion Packs"

2. **Synkra (Produto de Pedro Valério)**
   - Baseado no expansion-pack `hybrid-ops-pedro-valerio`
   - Será renomeado para `synkra`
   - Desenvolvimento em track paralelo
   - Demonstração de produto criado com AIOS

### Próximos Passos

- [x] Decisão documentada no backlog
- [ ] `hybrid-ops-pedro-valerio` → `synkra` (ID: 1733400000002)
- [ ] Expansion-creator alinhado com OSR (ID: 1733400000001)

---

---

## 📋 User Story

**Como** stakeholder do projeto,
**Quero** investigar a nomenclatura atual e potencial rebranding,
**Para** garantir consistência na identidade do projeto open-source.

---

## 🎯 Objetivo

Analisar o uso atual do nome "Synkra" vs "AIOS" em toda a base de código e documentação, e recomendar uma estratégia de nomenclatura consistente para o lançamento open-source.

---

## 📊 Contexto

### Situação Atual

O projeto utiliza dois nomes:
- **AIOS** - AI-Orchestrated System (nome técnico do framework)
- **Synkra** - Nome de produto/marca comercial

### Questões a Investigar

1. **Onde cada nome é usado atualmente?**
   - Código fonte
   - Documentação
   - Configurações
   - UI/mensagens

2. **Qual nome usar para open-source?**
   - AIOS (técnico, descritivo)
   - Synkra (marca, memorável)
   - Hybrid (Synkra powered by AIOS)

3. **Implicações de cada escolha?**
   - Trademark considerations
   - SEO/discoverability
   - Community recognition

---

## ✅ Deliverables

### 1. Audit de Nomenclatura

**Arquivo de saída:** `docs/investigations/synkra-naming-audit.md`

**Estrutura:**

```markdown
# Synkra/AIOS Naming Audit

## Executive Summary
[Resumo das descobertas]

## Current Usage

### In Source Code
| Location | Current Name | Count | Notes |
|----------|--------------|-------|-------|
| package.json | aios-fullstack | 1 | Main package |
| ... | ... | ... | ... |

### In Documentation
| File | "Synkra" mentions | "AIOS" mentions | Notes |
|------|-------------------|-----------------|-------|
| README.md | X | Y | ... |
| ... | ... | ... | ... |

### In Configuration
| File | Usage | Notes |
|------|-------|-------|
| .aios/ | AIOS | Config directory |
| ... | ... | ... |

### In UI/Messages
| Component | Current | Notes |
|-----------|---------|-------|
| CLI prompts | ... | ... |
| Error messages | ... | ... |

## Analysis

### Option A: Unify as AIOS
**Pros:**
- Descriptive (AI-Orchestrated System)
- Already used in technical contexts
- Easier to explain

**Cons:**
- Generic sounding
- May conflict with other "AIOS" projects
- Loses brand value of Synkra

**Effort:** [X hours to migrate]

### Option B: Unify as Synkra
**Pros:**
- Unique, memorable name
- Strong brand identity
- Already trademarked (if applicable)

**Cons:**
- Requires more changes
- Not self-descriptive
- Community may not know what it is

**Effort:** [X hours to migrate]

### Option C: Hybrid Approach
**Pros:**
- "Synkra" for brand/product
- "AIOS" for technical/internal
- Best of both worlds

**Cons:**
- Can be confusing
- More documentation needed
- Inconsistent

## Recommendation

[Based on analysis, recommend one option with rationale]

## Migration Plan (if needed)

### Phase 1: Documentation
- [ ] Update README
- [ ] Update all docs/
- [ ] Update website (if any)

### Phase 2: Configuration
- [ ] Update package.json names
- [ ] Update directory names (if needed)
- [ ] Update environment variables

### Phase 3: Code
- [ ] Update string literals
- [ ] Update comments
- [ ] Update log messages

### Phase 4: External
- [ ] npm package name
- [ ] GitHub repository description
- [ ] Social media/profiles
```

---

### 2. Tarefas de Investigação

**Tasks:**

- [ ] **Grep por "Synkra"** em todo o repositório
  ```bash
  grep -ri "synkra" --include="*.{ts,js,md,json,yaml,yml}"
  ```

- [ ] **Grep por "AIOS"** em todo o repositório
  ```bash
  grep -ri "aios" --include="*.{ts,js,md,json,yaml,yml}"
  ```

- [ ] **Analisar package.json** de todos os módulos
- [ ] **Verificar configurações** em .aios/
- [ ] **Revisar README** e docs principais
- [ ] **Checar CI/CD** workflows
- [ ] **Verificar mensagens** de CLI/UI

---

### 3. Questões para Stakeholder

**Perguntas a serem respondidas:**

1. **Trademark Status**
   - "Synkra" está registrado como trademark?
   - "AIOS" tem conflitos conhecidos?

2. **Estratégia de Marca**
   - Qual nome a AllFluence quer promover?
   - O open-source deve ter a mesma marca que o produto comercial?

3. **Domínio e Presença Online**
   - Qual domínio será usado? (synkra.io, aios.dev, etc.)
   - Redes sociais existentes?

4. **Futuro do Projeto**
   - Haverá versão "community" vs "enterprise"?
   - Como diferenciar na nomenclatura?

---

### 4. Recomendações Preliminares

Com base no contexto atual, aqui estão considerações iniciais:

**Para Open-Source Community:**

| Aspecto | Recomendação | Razão |
|---------|--------------|-------|
| Repo Name | `aios` ou `synkra` | Simplicidade |
| npm Package | `@synkra/core` ou `@aios/core` | Namespace claro |
| Documentation | Consistente com escolha | Evitar confusão |
| CLI Commands | `synkra` ou `aios` | Memorável |

**Nomenclatura Sugerida (Hybrid):**

```
Produto/Marca: Synkra
Framework/Técnico: AIOS (AI-Orchestrated System)
Tagline: "Synkra - Powered by AIOS"

Exemplos:
- npm: @synkra/aios-core
- CLI: synkra init
- Docs: "Synkra is built on the AIOS framework"
```

---

## 🎯 Acceptance Criteria

```gherkin
GIVEN a need to clarify project naming
WHEN the investigation is complete
THEN the deliverable includes:
  - Complete audit of current name usage
  - Analysis of each naming option
  - Clear recommendation with rationale
  - Migration plan if changes needed
AND stakeholder has enough information to decide
```

---

## 🔗 Dependencies

**Blocked by:**
- OSR-1: Audit Session (valida documentação atual)

**Blocks:**
- OSR-10: Release Checklist (precisa nome definido)

---

## 📋 Definition of Done

- [ ] Audit completo de nomenclatura realizado
- [ ] Documento de análise criado
- [ ] Questões para stakeholder listadas
- [ ] Recomendação documentada
- [ ] Stakeholder revisou e tomou decisão
- [ ] Decisão documentada para referência futura

---

## ⏱️ Estimativa de Esforço

| Tarefa | Tempo |
|--------|-------|
| Grep e análise código | 1h |
| Análise documentação | 1h |
| Escrita do relatório | 0.5h |
| Revisão com stakeholder | 0.5h |
| **Total** | **3h** |

---

## 📎 Notas

### Impacto se Houver Mudança

Se for decidido mudar de "Synkra" para "AIOS" (ou vice-versa):

1. **Baixo impacto:**
   - Apenas documentação
   - Mensagens de UI

2. **Médio impacto:**
   - Nomes de pacotes npm
   - Comandos CLI

3. **Alto impacto:**
   - Estrutura de diretórios
   - URLs/endpoints
   - Banco de dados (se aplicável)

### Decisão Pode Ser Incremental

Não é necessário decidir tudo agora:
- v2.1: Definir direção geral
- v2.2: Completar migração se necessário

---

**Criado por:** River (SM) 🌊
**Data:** 2025-12-05
