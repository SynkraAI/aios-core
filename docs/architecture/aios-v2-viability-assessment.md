# AIOS v2.0 "Projeto Bob" — Viability Assessment

```yaml
assessment_id: aios-v2-viability-001
prd_reference: docs/prd/aios-v2-bob.md
date: 2026-02-04
assessor: Morgan (PM) + Exploration Agents
status: COMPLETE
confidence: HIGH
```

---

## Executive Summary

Este assessment compara o PRD v2.1.0 com o estado atual do código para identificar gaps, riscos, e dependências antes de criar épicos de implementação.

### Resultado Geral

| Área | Status | Gap |
|------|--------|-----|
| **Bob como PM** | ✅ JÁ IMPLEMENTADO | Mínimo |
| **Epic Context (PO)** | ✅ SPEC COMPLETA | Implementação de tools |
| **Executor Assignment** | ✅ JÁ IMPLEMENTADO | Mínimo |
| **Workflows** | ✅ JÁ IMPLEMENTADO | Nenhum |
| **User Profile** | ❌ NÃO EXISTE | Total |
| **Config Separation** | ⚠️ PARCIAL | Médio |
| **AIOS Master** | ⚠️ INCOMPLETO | Significativo |
| **Terminal Spawning (Bob)** | ❌ NÃO EXISTE | Total |

**Conclusão:** ~60% do PRD já está implementado ou especificado. Os gaps principais são: User Profile, Terminal Spawning do Bob, e refatoração do AIOS Master.

---

## 1. Estado Atual — Inventário

### 1.1 PM Agent (Bob)

| Aspecto | PRD Requer | Estado Atual | Status |
|---------|------------|--------------|--------|
| Nome "Bob" | Bob como alias do PM | ✅ JÁ É BOB (não mais Morgan) | ✅ DONE |
| Archetype "O Construtor" | Interface amigável | ✅ Archetype atualizado | ✅ DONE |
| Comando *brownfield-enhancement | Workflow PM-exclusive | ✅ Existe e funciona | ✅ DONE |
| Executor Assignment | PM define executor por story | ✅ No workflow v2.0 | ✅ DONE |
| Gateway para novos usuários | Ponto de entrada único | ✅ Persona configurada | ✅ DONE |
| Terminal Spawning | Abrir terminais para agentes | ❌ NÃO IMPLEMENTADO | ❌ GAP |
| Orquestração automática | Bob decide qual agente chamar | ⚠️ Manual ainda | ⚠️ PARCIAL |

**Arquivos modificados:**
- `.aios-core/development/agents/pm.md` — Bob (O Construtor), Gateway AIOS

### 1.2 PO Agent (Epic Context Guardian)

| Aspecto | PRD Requer | Estado Atual | Status |
|---------|------------|--------------|--------|
| Comando *epic-context | Mostrar contexto acumulado | ✅ EXISTE | ✅ DONE |
| Task po-epic-context.md | 7-step workflow | ✅ EXISTE | ✅ DONE |
| Epic Context Guardian role | Core principle | ✅ Definido no agente | ✅ DONE |
| validate-next-story Step 8 | Epic Context Awareness | ✅ SPEC COMPLETA (118 linhas) | ✅ DONE |
| File overlap detection | Detectar conflitos | ✅ ESPECIFICADO | ⚠️ SPEC ONLY |
| Executor coherence matrix | Risk assessment | ✅ ESPECIFICADO | ⚠️ SPEC ONLY |
| validation-engine.js | Implementação | ❌ NÃO ENCONTRADO | ❌ GAP |

**Arquivos modificados:**
- `.aios-core/development/agents/po.md` — Epic Context Guardian, *epic-context
- `.aios-core/development/tasks/po-epic-context.md` — NOVO
- `.aios-core/development/tasks/validate-next-story.md` — Step 8 adicionado

**⚠️ ALERTA:** A especificação está completa mas os tools de implementação (validation-engine.js, run-validation.js) não foram encontrados no codebase.

### 1.3 AIOS Master

| Aspecto | PRD Requer | Estado Atual | Status |
|---------|------------|--------------|--------|
| Papel de Educador | Ensinar sobre AIOS | ❌ NÃO IMPLEMENTADO | ❌ GAP |
| Papel de Guardião | Proteger integridade | ❌ NÃO IMPLEMENTADO | ❌ GAP |
| Grafo de relacionamentos | Agentes ↔ tasks ↔ files | ❌ NÃO EXISTE | ❌ GAP |
| Propagação de mudanças | Ajustar impactos em cascata | ❌ NÃO EXISTE | ❌ GAP |
| Manutenção do CLAUDE.md | Sync automático | ❌ NÃO EXISTE | ❌ GAP |
| *analyze-impact | Análise de impacto | ❌ NÃO EXISTE | ❌ GAP |
| Diferenciação do Bob | Escopo Framework vs Projeto | ✅ CLARO | ✅ DONE |

**Estado atual:** AIOS Master é apenas um Orchestrator puro. Não tem funções de educador nem guardião.

### 1.4 Core Config

| Aspecto | PRD Requer | Estado Atual | Status |
|---------|------------|--------------|--------|
| user_profile setting | "bob" \| "advanced" | ❌ NÃO EXISTE | ❌ GAP |
| coderabbit_integration | Toggle master | ✅ EXISTE e funciona | ✅ DONE |
| Separação core vs project | 3 tiers | ⚠️ 2 TIERS apenas | ⚠️ PARCIAL |
| Feature toggles | Múltiplos | ✅ 13+ toggles existem | ✅ DONE |
| Lazy loading | Por agente | ✅ IMPLEMENTADO | ✅ DONE |
| Config validation | Schema | ✅ EXISTE | ✅ DONE |

**Estrutura atual:**
```
Tier 1: Global (~/.aios/mcp/) — ✅ EXISTE
Tier 2: Project (.aios-core/core-config.yaml) — ✅ EXISTE
Tier 3: Local (.aios-core/local/) — ❌ INCOMPLETO
```

### 1.5 Workflows

| Workflow | PRD Requer | Estado Atual | Status |
|----------|------------|--------------|--------|
| brownfield-enhancement.yaml | v2.0 com executor matrix | ✅ EXISTE e completo | ✅ DONE |
| story-development-cycle.yaml | Ciclo por story | ✅ EXISTE | ✅ DONE |
| Executor Matrix | Competency-based | ✅ 11 competências mapeadas | ✅ DONE |
| Dynamic executor dispatch | Ler do story.yaml | ✅ IMPLEMENTADO | ✅ DONE |
| Quality gates dinâmicos | Por competência | ✅ IMPLEMENTADO | ✅ DONE |
| Context-aware validation | PO valida com contexto | ✅ ESPECIFICADO | ✅ DONE |

**Executor Matrix atual:**
```yaml
backend/frontend/fullstack → @dev + code-review-checklist
database/data_pipeline → @data-engineer + db-migration-checklist
infrastructure/ci_cd/security → @devops + deploy-safety-checklist
design/accessibility → @ux-expert + design-qa-checklist
architecture → @architect + arch-review-checklist
```

### 1.6 Agentes Atualizados (Referências ao Bob)

| Agente | Mudança | Status |
|--------|---------|--------|
| analyst.md | Morgan → Bob (2 refs) | ✅ DONE |
| architect.md | Morgan → Bob (2 refs) | ✅ DONE |
| pm.md | Renomeado para Bob | ✅ DONE |
| po.md | Epic Context Guardian | ✅ DONE |

---

## 2. Gap Analysis — PRD vs Realidade

### 2.1 Gaps Críticos (Bloqueiam adoção)

| # | Gap | PRD Section | Impacto | Esforço Est. |
|---|-----|-------------|---------|--------------|
| G1 | **user_profile não existe** | §2, §12 | Não há modo Bob vs Avançado | MÉDIO |
| G2 | **Terminal Spawning não existe** | §3.4 | Bob não pode orquestrar agentes isoladamente | ALTO |
| G3 | **AIOS Master sem papel Guardião** | §18 | Não protege integridade do framework | MÉDIO |
| G4 | **validation-engine.js não existe** | §6 | Epic Context spec existe mas não executa | MÉDIO |

### 2.2 Gaps Médios (Funcionalidade reduzida)

| # | Gap | PRD Section | Impacto | Esforço Est. |
|---|-----|-------------|---------|--------------|
| G5 | Config separation incompleta | §12 | Sem tier local | BAIXO |
| G6 | AIOS Master sem grafo | §18.3 | Sem análise de impacto automática | MÉDIO |
| G7 | Bob orquestração manual | §3.3 | Usuário ainda decide fluxo | ALTO |

### 2.3 Gaps Menores (Nice to have)

| # | Gap | PRD Section | Impacto | Esforço Est. |
|---|-----|-------------|---------|--------------|
| G8 | AIOS Master educador | §18.2 | Sem guia interativo | BAIXO |
| G9 | CLAUDE.md sync automático | §18.4 | Manutenção manual | BAIXO |

---

## 3. Dependency Map — O que bloqueia o quê

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY CHAIN                              │
└─────────────────────────────────────────────────────────────────┘

[G1] user_profile
  ↓ BLOQUEIA
  ├── Modo Bob vs Avançado
  ├── Help system condicional
  └── Onboarding flow completo

[G2] Terminal Spawning
  ↓ BLOQUEIA
  ├── Bob orquestração automática [G7]
  ├── Isolamento de contexto
  └── Multi-agent execution

[G4] validation-engine.js
  ↓ BLOQUEIA
  ├── Epic Context Awareness execução
  ├── File overlap detection runtime
  └── Executor coherence checks

[G3] AIOS Master Guardião
  ↓ BLOQUEIA
  ├── Grafo de relacionamentos [G6]
  ├── Propagação de mudanças
  └── CLAUDE.md sync [G9]

┌─────────────────────────────────────────────────────────────────┐
│                    ORDEM RECOMENDADA                             │
└─────────────────────────────────────────────────────────────────┘

1. [G4] validation-engine.js     ← Habilita Epic Context que JÁ ESTÁ SPEC
2. [G1] user_profile             ← Habilita modo Bob/Avançado
3. [G2] Terminal Spawning        ← Habilita orquestração real
4. [G3] AIOS Master Guardião     ← Habilita proteção do framework
5. [G5-G9] Nice to haves         ← Depois de estabilizar
```

---

## 4. Risk Assessment

### 4.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **R1:** Terminal Spawning complexo demais | ALTA | ALTO | Começar com script simples (mmos.sh), evoluir |
| **R2:** Epic Context consome muitos tokens | ALTA | MÉDIO | Limitar a últimos N stories, resumir contexto |
| **R3:** user_profile quebra agentes existentes | MÉDIA | ALTO | Feature flag, rollout gradual |
| **R4:** validation-engine.js difícil de implementar | MÉDIA | MÉDIO | Começar com validações básicas, evoluir |
| **R5:** Grafo de relacionamentos é escopo grande | ALTA | MÉDIO | MVP com mapeamento manual, automatizar depois |

### 4.2 Riscos de Processo

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **R6:** Usuários confusos com dois modos | MÉDIA | MÉDIO | Onboarding claro, documentação visual |
| **R7:** Regressão em funcionalidades existentes | MÉDIA | ALTO | Testes antes de cada mudança |
| **R8:** Mudanças no AIOS Master afetam todo sistema | ALTA | ALTO | Incremental, não big bang |

---

## 5. Decision Validation (D1-D15)

| # | Decisão | Viável? | Notas |
|---|---------|---------|-------|
| D1 | NPX é forma oficial | ✅ SIM | Já funciona, installer existe |
| D2 | CodeRabbit CLI | ✅ SIM | Já configurado em core-config |
| D3 | Playwright/DC/N8N fora Docker | ✅ SIM | Arquitetura já suporta |
| D4 | MCPs via Docker Gateway | ✅ SIM | Já funciona |
| D5 | GitHub Pro recomendado | ✅ SIM | Documentação existe |
| D6 | Vercel substituindo Railway | ✅ SIM | Sem impacto técnico |
| D7 | 1 executor + 1 quality gate | ✅ SIM | **JÁ IMPLEMENTADO** no workflow |
| D8 | PO faz fix direto | ✅ SIM | Sem bloqueio técnico |
| D9 | 2 perfis (Bob/Avançado) | ⚠️ REQUER user_profile | Gap G1 |
| D10 | Brownfield não sobrescreve | ✅ SIM | Installer já tem merge strategy |
| D11 | Bob = PM reformulado | ✅ SIM | **JÁ IMPLEMENTADO** |
| D12 | Cloud Code containerizado futuro | ✅ SIM | Não bloqueia nada agora |
| D13 | AIOS Master ≠ Bob | ⚠️ REQUER refatoração | Gap G3 |
| D14 | core vs project config | ⚠️ PARCIAL | Gap G5 |
| D15 | AIOS Master grafo | ❌ NÃO EXISTE | Gap G6 |

---

## 6. Recommended Implementation Sequence

### Fase 0: Quick Wins (JÁ PRONTOS — validar apenas)

| Item | Status | Ação |
|------|--------|------|
| Bob como PM | ✅ DONE | Validar funcionamento |
| Epic Context spec | ✅ DONE | Validar spec completa |
| Executor Assignment | ✅ DONE | Validar workflow |
| brownfield-enhancement | ✅ DONE | Testar end-to-end |

### Fase 1: Habilitar o que já existe (1-2 dias)

| Item | Gap | Prioridade | Entrega |
|------|-----|------------|---------|
| validation-engine.js | G4 | 🔴 CRÍTICA | Implementar engine básica para Epic Context |
| Testar Epic Context | — | 🔴 CRÍTICA | Validar Step 8 funciona |

### Fase 2: User Profile System (2-3 dias)

| Item | Gap | Prioridade | Entrega |
|------|-----|------------|---------|
| user_profile em core-config | G1 | 🔴 CRÍTICA | Adicionar campo |
| Onboarding detection | G1 | 🔴 CRÍTICA | Perguntar no bootstrap |
| Help system condicional | G1 | 🟡 ALTA | /help baseado no perfil |
| Agent visibility | G1 | 🟡 ALTA | Ocultar agentes em modo Bob |

### Fase 3: Terminal Spawning (3-5 dias)

| Item | Gap | Prioridade | Entrega |
|------|-----|------------|---------|
| mmos.sh script | G2 | 🔴 CRÍTICA | Script de orquestração |
| Bob decision tree | G7 | 🔴 CRÍTICA | Lógica de routing |
| Context isolation | G2 | 🟡 ALTA | Terminais separados |

### Fase 4: AIOS Master Refactor (3-4 dias)

| Item | Gap | Prioridade | Entrega |
|------|-----|------------|---------|
| Papel Guardião | G3 | 🟡 ALTA | Adicionar responsabilidades |
| Grafo básico | G6 | 🟢 MÉDIA | Mapeamento manual inicial |
| *analyze-impact | G6 | 🟢 MÉDIA | Task de análise |

---

## 7. Go/No-Go Recommendation

### ✅ GO — Com ressalvas

**Recomendação:** Prosseguir com implementação **incremental**, começando pelos quick wins e gaps críticos.

**Justificativa:**
1. **~60% já está implementado** — Bob, Epic Context spec, Executor Assignment, Workflows
2. **Gaps são bem definidos** — user_profile, terminal spawning, validation-engine
3. **Riscos são gerenciáveis** — Nenhum bloqueio técnico fundamental
4. **Decisões D1-D15 são viáveis** — Apenas 3 requerem implementação

**Ressalvas:**
1. **NÃO começar por Terminal Spawning** — É o mais complexo, fazer depois de user_profile
2. **Validar Epic Context primeiro** — Spec existe, implementar engine básica
3. **AIOS Master Guardião é scope creep** — Pode ser fase separada

---

## 8. Appendix: Arquivos Analisados

```
Agents:
├── .aios-core/development/agents/pm.md (Bob)
├── .aios-core/development/agents/po.md (Epic Context Guardian)
├── .aios-core/development/agents/aios-master.md
├── .aios-core/development/agents/analyst.md
└── .aios-core/development/agents/architect.md

Tasks:
├── .aios-core/development/tasks/validate-next-story.md (Step 8)
├── .aios-core/development/tasks/po-epic-context.md (NEW)
└── .aios-core/development/tasks/dev-validate-next-story.md

Workflows:
├── .aios-core/development/workflows/brownfield-enhancement.yaml (v2.0)
├── .aios-core/development/workflows/story-development-cycle.yaml
└── .aios-core/development/workflows/brownfield-discovery.yaml

Config:
├── .aios-core/core-config.yaml (532 lines)
├── .aios-core/core/config/config-loader.js (deprecated)
├── .aios-core/core/config/config-cache.js
└── packages/installer/src/config/templates/core-config-template.js

PRD:
└── docs/prd/aios-v2-bob.md (v2.1.0)
```

---

```yaml
# Assessment Metadata
assessment_version: 1.0.0
created: 2026-02-04
confidence: HIGH
next_action: Create Epic 1 focusing on validation-engine.js and user_profile
```
