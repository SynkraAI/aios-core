# Forge Plugin System — Plano de Implementação

> **Status:** COMPLETO ✅
> **Criado em:** 2026-04-03
> **Objetivo:** Sistema de plugins interno que centraliza comportamentos cross-cutting e torna o Forge extensível sem editar o core.

---

## Princípio Fundamental: Zero Config pro Usuário

O plugin system é INTERNO ao Forge. O usuário nunca precisa saber que plugins existem. Quando alguém roda `/forge`, o Forge carrega tudo automaticamente de `{FORGE_HOME}/plugins/`. Nenhum arquivo é criado no projeto do usuário.

**Analogia:** Plugins são como os órgãos internos do Forge. O usuário vê o Forge funcionando (o corpo), mas não precisa saber que tem um fígado (lifecycle plugin) ou rins (ecosystem scanner plugin) trabalhando por baixo.

---

## Arquitetura

### Hook Taxonomy

| Hook | Quando dispara | O que pode fazer |
|------|---------------|-----------------|
| `before:run` | Após init, antes da Phase 0 | Setup, validar precondições |
| `before:phase:*` | Antes de entrar em qualquer fase | Injetar contexto, escrever `started_at` |
| `after:phase:*` | Após fase completar | Validar outputs, escrever `completed_at` |
| `on:agent-dispatch` | Antes de despachar agente | Injetar contexto extra no prompt |
| `on:agent-return` | Após agente retornar | Validar output, logar métricas |
| `on:error` | Quando error recovery dispara | Injetar contexto de recuperação |
| `on:checkpoint` | Antes de mostrar checkpoint | Adicionar info ao display |
| `on:veto` | Quando veto condition dispara | Adicionar checks, modificar severity |
| `on:story-complete` | Após story passar QA | Logar métricas, validações cross-story |
| `after:run` | Após todas as fases, antes do banner final | Validações finais, cleanup |

### Plugin YAML Schema

```yaml
plugin:
  name: "{kebab-case}"
  version: "1.0.0"
  description: "{o que faz}"

activation:
  enabled: true
  modes: [FULL_APP, SINGLE_FEATURE]  # ou "all"

priority: 50  # 0-99, menor = roda primeiro

hooks:
  - event: "after:phase:0"
    action: inject|validate|log
    source: "{FORGE_HOME}/path/to/file.md"
    section: "Section Name"  # opcional
    description: "O que faz neste hook"
    filter:
      phases: [1, 2, 3]  # opcional

state_key: "plugin_name"  # namespace em state.json → plugins.{key}

config:  # valores configuráveis
  key: value
```

### Faixas de Prioridade

| Range | Uso |
|-------|-----|
| 1-9 | Core/lifecycle (sempre primeiro) |
| 10-29 | Ecosystem (scanner, contexto) |
| 30-69 | Quality gates |
| 70-89 | Opcionais |
| 90-99 | Logging/sync (sempre último) |

---

## Checklist de Implementação

### Fase 1: Fundação (Core)

- [x] **1.1** Criar diretório `skills/forge/plugins/`
- [x] **1.2** Criar `plugins/SCHEMA.md` — schema YAML, hook taxonomy, faixas de prioridade, guia de criação
- [x] **1.3** Criar `plugins/lifecycle.yaml` (priority: 1) — centraliza entry/exit de fase, atomic writes, error handling, checkpoint rendering
- [x] **1.4** Modificar `runner.md` — adicionar Section 2.5: Plugin System (boot + firing + fallback)
- [x] **1.5** Adicionar hook points no `runner.md` existente:
  - [x] Section 2 Step 1 (Enter Phase): fire `before:phase:{N}`
  - [x] Section 2 Step 2 (Execute Phase): fire `on:agent-dispatch`, `on:agent-return`, `on:checkpoint`
  - [x] Section 2 Step 3 (Exit Phase): fire `after:phase:{N}`
  - [x] Section 3.5 (Progress): fire `on:story-complete`
  - [x] Section 4 (Error Recovery): fire `on:error`
  - [x] Section 5 (Veto Conditions): fire `on:veto`
  - [x] Section 7 (Completion): fire `after:run`

### Fase 2: Migração dos Quality Gates

- [x] **2.1** Criar `plugins/bulletproof-test.yaml` (priority: 30)
- [x] **2.2** Criar `plugins/vulnerability-scanner.yaml` (priority: 31)
- [x] **2.3** Criar `plugins/tier-s-checklist.yaml` (priority: 32)
- [x] **2.4** Criar `plugins/tokenizacao.yaml` (priority: 33)
- [x] **2.5** Criar `plugins/code-refactoring.yaml` (priority: 34)
- [x] **2.6** Criar `plugins/cloud-pentest.yaml` (priority: 35, enabled: false)
- [x] **2.7** Simplificar `phase-4-integration.md` Step 4 — delegar pra plugins
- [x] **2.8** Deprecar `extended_quality` no `config.yaml` com comentário

### Fase 3: Plugins de Ecossistema

- [x] **3.1** Criar `plugins/ecosystem-scanner.yaml` (priority: 10) — wrap do ecosystem-scanner.md
- [x] **3.2** Criar `plugins/quest-sync.yaml` (priority: 90) — sync via state.json
- [x] **3.3** Atualizar `phase-0-discovery.md` — nota sobre ecosystem scan plugin-driven

### Fase 4: Polish e Documentação

- [x] **4.1** Atualizar `SKILL.md`:
  - [x] Section 3 (Init): step "Load plugins"
  - [x] Section 5 (Agent Dispatch): hooks `on:agent-dispatch` e `on:agent-return`
  - [x] Section 9 (Selective Reading): `plugins/*.yaml` para ALL modes
- [x] **4.2** Atualizar `WORKFLOW-GUIDE.md` — seção "Plugin Integration"
- [x] **4.3** Atualizar `config.yaml` — adicionar `plugins.dir: "plugins/"`

---

## Arquivos

### Criar (10 arquivos — todos em `skills/forge/plugins/`)

| Arquivo | Propósito |
|---------|-----------|
| `plugins/SCHEMA.md` | Schema reference para devs do Forge |
| `plugins/lifecycle.yaml` | Phase entry/exit, atomic writes, error, checkpoint |
| `plugins/ecosystem-scanner.yaml` | Wrap do ecosystem-scanner.md |
| `plugins/quest-sync.yaml` | Sync Forge → Quest via state.json |
| `plugins/bulletproof-test.yaml` | Migrado de extended_quality |
| `plugins/vulnerability-scanner.yaml` | Migrado de extended_quality |
| `plugins/tier-s-checklist.yaml` | Migrado de extended_quality |
| `plugins/tokenizacao.yaml` | Migrado de extended_quality |
| `plugins/code-refactoring.yaml` | Migrado de extended_quality |
| `plugins/cloud-pentest.yaml` | Migrado de extended_quality |

### Modificar (6 arquivos)

| Arquivo | O que muda |
|---------|-----------|
| `runner.md` | Nova Section 2.5 + hook points nas Sections 2, 4, 7 |
| `config.yaml` | Adicionar `plugins.dir`, deprecar `extended_quality` |
| `SKILL.md` | Plugin loading (S3), agent dispatch hooks (S5), selective reading (S9) |
| `phases/phase-4-integration.md` | Simplificar Step 4 |
| `phases/phase-0-discovery.md` | Nota sobre ecosystem scan |
| `WORKFLOW-GUIDE.md` | Seção "Plugin Integration" |

---

## Backwards Compatibility

1. **Sem `plugins/`** → comportamento atual intacto
2. **Phase files inalterados inicialmente** → duplicações existentes continuam funcionando, removidas gradualmente
3. **`extended_quality` preservado** → fallback se plugin correspondente não existir
4. **Workflows intocados** → plugins se anexam a hooks, independente do workflow
