# Plano: 9 Features para o Forge Perfeito

> **Status:** IMPLEMENTADO + AUDITADO ✅
> **Criado em:** 2026-04-04
> **Auditoria Codex:** 2026-04-04 — todos os gaps corrigidos (ver FORGE-EVOLUTION-CHECKLIST-FOR-CLAUDE.md)
> **Objetivo:** 9 features que transformam o Forge de um orquestrador poderoso em um sistema que aprende, prevê, paraleliza e se auto-avalia.
>
> **Notas de implementação:**
> - Todas as 9 features têm artefatos criados e integrados
> - Novos modos (DRY_RUN, REPLAY, TEMPLATE) propagados para SCHEMA.md, validate-plugins.cjs, e plugins relevantes
> - DRY_RUN usa modelo híbrido: Discovery + Scan reais, simulação read-only a partir de SIM-2
> - Todos os workflows seguem o template de WORKFLOW-GUIDE.md (Progress Display, Quest Integration, Error Recovery)
> - 13 plugins validados com zero erros

---

## Context

O Forge já é um orquestrador poderoso com plugin system, 9 workflows, 6 phases, e 11 plugins. Mas falta:
- **Memória entre runs** — cada run começa do zero
- **Preview antes de executar** — usuário não sabe o que vai acontecer
- **Dependências entre stories** — execução é linear, sem paralelismo
- **Refazer com ajustes** — tem que começar do zero se quer mudar algo
- **Monitoramento pós-deploy** — Forge entrega e desaparece
- **Decisões técnicas inteligentes** — baseadas em evidências, não tabelas estáticas
- **Execução paralela** — stories independentes rodam uma de cada vez
- **Templates** — projetos similares refazem Discovery do zero
- **Feedback loop** — Forge nunca sabe se o resultado foi bom

---

## Grafo de Dependências

```
Feature 1 (Memory)         ← base para 6 e 9
Feature 3 (Dep Graph)      ← base para 7
Feature 9 (Feedback)       ← depende de 1
Feature 6 (Advisor)        ← depende de 1
Feature 7 (Parallel)       ← depende de 3
Features 2, 4, 5, 8        ← independentes
```

## Sequência de Implementação (5 Fases)

| Fase | Features | Justificativa |
|------|----------|---------------|
| **A — Fundação** | 1 (Memory), 3 (Dep Graph), 2 (Dry Run) | Sem dependências, habilitam features futuras |
| **B — Consumidores** | 9 (Feedback), 6 (Advisor) | Dependem de Memory |
| **C — Orquestração** | 7 (Multi-Agent Parallel) | Depende de Dep Graph |
| **D — Workflows** | 4 (Replay), 8 (Templates) | Independentes, menor prioridade |
| **E — Pós-Deploy** | 5 (Watch) | Independente, estende Phase 5 |

---

## Feature 1: Forge Memory — Aprendizado entre runs

**Tipo:** Plugin + arquivo fonte + storage YAML
**Complexidade:** Média
**Depende de:** Nada (fundacional)

### Arquivos a criar

| Arquivo | Propósito |
|---------|-----------|
| `skills/forge/plugins/forge-memory.yaml` | Plugin (priority 5) com hooks before:run + after:run + on:error |
| `skills/forge/forge-memory.md` | Protocolo de load/save/error learning com 3 seções |

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `skills/forge/SKILL.md` | §9: adicionar `forge-memory.md` como ALWAYS |
| `skills/forge/config.yaml` | Adicionar seção `memory:` com dir, max_entries, retention_days |

### Plugin Schema

```yaml
plugin:
  name: forge-memory
  version: "1.0.0"
  description: "Saves learnings after each run and loads them on next run in same project"

activation:
  enabled: true

priority: 5  # Core — loads early to inject context into all phases

hooks:
  - event: "before:run"
    action: inject
    source: "{FORGE_HOME}/forge-memory.md"
    section: "1. Load Protocol"
    description: |
      Check .aiox/memory/forge/learnings.yaml.
      If found: parse, filter by project path, inject top 5 relevant learnings.
      Categories: tech_decision, error_pattern, agent_performance, quality_gate.

  - event: "after:run"
    action: log
    source: "{FORGE_HOME}/forge-memory.md"
    section: "2. Save Protocol"
    description: |
      Extract from completed state.json:
      - tech_decisions + user_overrides
      - errors[] with types and resolutions
      - agent retry rates
      - quality gate results
      Append to .aiox/memory/forge/learnings.yaml.

  - event: "on:error"
    action: log
    source: "{FORGE_HOME}/forge-memory.md"
    section: "3. Error Learning"
    description: |
      When error resolves: capture { error_type, root_cause, resolution, agent }.
      Buffer in state.json plugins.forge_memory.error_patterns[].
      Flushed to learnings.yaml at after:run.

state_key: "forge_memory"
config:
  learnings_file: ".aiox/memory/forge/learnings.yaml"
  max_entries: 50
  inject_top_n: 5
```

### Learnings YAML (criado em runtime em `.aiox/memory/forge/learnings.yaml`)

```yaml
learnings:
  - id: "learn-001"
    run_id: "forge-app-20260403-1430"
    project: "/Users/luiz/CODE/Projects/my-app"
    timestamp: "2026-04-03T16:00:00Z"
    category: "error_pattern"
    content: "Prisma migration fails with circular references"
    resolution: "Break into two migrations"
    tags: ["prisma", "migration"]
```

### state.json additions

```json
"plugins": {
  "forge_memory": {
    "learnings_loaded": 3,
    "learnings_injected": ["tech-stack-nextjs", "prisma-pattern"],
    "error_patterns": [],
    "new_learnings_count": 0
  }
}
```

---

## Feature 2: Forge Dry Run — Simular sem executar

**Tipo:** Novo workflow
**Complexidade:** Baixa
**Depende de:** Nada (beneficia de Memory para estimativas)

### Arquivos a criar

| Arquivo | Propósito |
|---------|-----------|
| `skills/forge/workflows/dry-run.md` | Workflow read-only que simula sem despachar agentes |

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `skills/forge/SKILL.md` | §2: `/forge dry-run {desc}` → DRY_RUN. §9: workflow file |

### Lógica do workflow

1. **Discovery normal** — perguntas ao usuário (Phase 0)
2. **Ecosystem scan normal** — encontrar recursos relevantes
3. **Simulação** (em vez de Phases 1-5):
   - Qual workflow seria selecionado e quais fases rodariam
   - Quais agentes seriam despachados em cada fase
   - Quais plugins disparariam
   - Estimativa de stories (baseada em complexidade)
   - Se Memory existe: estimativa de duração baseada em runs anteriores
4. **Simulation Report** — resumo visual formatado
5. **Opções**: "Executar de verdade" (reclassifica e roda) | "Salvar plano" (export .md)

**Zero Agent tool dispatches.** Lê os mesmos arquivos mas nunca chama agentes.

### state.json

```json
{
  "mode": "DRY_RUN",
  "simulation": {
    "detected_mode": "FULL_APP",
    "phases_planned": [0,1,2,3,4,5],
    "agents_planned": ["pm","architect","sm","po","dev","qa","devops"],
    "plugins_active": ["lifecycle","ecosystem-scanner","bulletproof-test"],
    "estimated_stories": 8,
    "ecosystem_resources": 3
  }
}
```

---

## Feature 3: Story Dependency Graph

**Tipo:** Modificação de phases (phase-2, phase-3) + schema
**Complexidade:** Média
**Depende de:** Nada (fundacional para Feature 7)

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `skills/forge/phases/phase-2-stories.md` | @sm declara `depends_on` por story. Validação de ciclos. Display com setas de dependência no checkpoint. |
| `skills/forge/phases/phase-3-build.md` | Ordenação por topological sort respeitando depends_on. Validação antes de cada story: depends_on all Done. |
| `.aiox-core/product/templates/story-tmpl.yaml` | Novo campo `depends_on: []` no template |

### Mudanças no phase-2

Step 1 (@sm): Instrução para declarar `depends_on: ["story_id"]` em cada story. Stories base (sem deps) recebem `depends_on: []`.

Step 3 (agrupamento): Topological sort. Se ciclo detectado → @sm deve quebrar. Display no checkpoint:
```
Stories (ordem de execução):
  Level 0: 1.1 "Auth" (base)
  Level 1: 1.2 "Feed" (← 1.1) | 1.4 "Landing" (base) ← paralelizáveis!
  Level 2: 1.3 "Dashboard" (← 1.1, 1.2)
```

### Mudanças no phase-3

Step 2: Trocar ordenação linear por topological sort. Dentro do mesmo nível, ordenar por priority. Antes de iniciar story: verificar que todas as deps têm status Done.

### state.json

```json
"phases": {
  "2": {
    "stories": [
      { "id": "1.1", "depends_on": [], "priority": 1, "mvp": true },
      { "id": "1.2", "depends_on": ["1.1"], "priority": 2, "mvp": true },
      { "id": "1.4", "depends_on": [], "priority": 4, "mvp": false }
    ],
    "dependency_graph": {
      "levels": [["1.1","1.4"], ["1.2"], ["1.3"]],
      "has_cycles": false
    }
  }
}
```

---

## Feature 4: Forge Replay — Refazer com ajustes

**Tipo:** Novo workflow
**Complexidade:** Média
**Depende de:** Nada (beneficia de Memory)

### Arquivos a criar

| Arquivo | Propósito |
|---------|-----------|
| `skills/forge/workflows/replay.md` | Workflow que carrega run anterior e re-executa com mudanças |

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `skills/forge/SKILL.md` | §2: `/forge replay {run_id} [--from phase:{N}]` → REPLAY. §9: workflow file |

### Lógica do workflow

1. **Carregar run anterior:** Ler `.aiox/forge-runs/{run_id}/state.json`
2. **Mostrar decisões:** Stack, MVP scope, stories, erros, quality gates
3. **Perguntar o que mudar:**
   ```
   > 1. Stack/tecnologia
   > 2. Stories (add/remove/reorder)
   > 3. Escopo MVP
   > 4. Nada, só re-executar
   ```
4. **Criar novo run:** `{run_id}-replay` com state copiado + mudanças aplicadas
5. **Executar a partir de --from:** Default = fase após última completada

### state.json

```json
"replay": {
  "source_run_id": "forge-app-20260321-1430",
  "from_phase": 3,
  "changes_applied": [
    { "field": "tech_decisions.database", "old": "postgresql", "new": "supabase" }
  ]
}
```

---

## Feature 5: Forge Watch — Monitoramento pós-deploy

**Tipo:** Plugin + novo hook `after:deploy` + arquivo fonte
**Complexidade:** Média
**Depende de:** Nada

### Arquivos a criar

| Arquivo | Propósito |
|---------|-----------|
| `skills/forge/plugins/forge-watch.yaml` | Plugin (priority 85) com hook after:deploy |
| `skills/forge/forge-watch.md` | Protocolo de monitoramento |

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `skills/forge/runner.md` | §7: novo hook `after:deploy` entre after:run e state update |
| `skills/forge/phases/phase-5-deploy.md` | Step 3b: fire `after:deploy` após PR criado |
| `skills/forge/plugins/SCHEMA.md` | Hook taxonomy: adicionar `after:deploy` |
| `skills/forge/SKILL.md` | §9: `forge-watch.md` em Phase 5 |

### Novo hook: `after:deploy`

Distinto de `after:phase:5` — só dispara quando deploy REALMENTE aconteceu (push + PR). Não dispara se usuário escolheu "não deployar".

### Plugin Schema

```yaml
plugin:
  name: forge-watch
  version: "1.0.0"
  description: "Post-deploy monitoring: health checks, CI status, error detection"

activation:
  enabled: true
  modes: [FULL_APP, SINGLE_FEATURE, BUG_FIX]

priority: 85

hooks:
  - event: "after:deploy"
    action: validate
    source: "{FORGE_HOME}/forge-watch.md"
    severity: optional  # INFO only — never blocks
    description: |
      1. CI Status: gh pr checks via Bash
      2. Health Check: WebFetch na deploy_url (se disponível)
      3. Build Verification: status do Vercel/Netlify
      4. Error Monitoring: Sentry (se configurado)
      All checks INFO-level — never block completion.

state_key: "forge_watch"
```

---

## Feature 6: Forge Advisor — Decisões técnicas inteligentes

**Tipo:** Plugin + arquivo fonte
**Complexidade:** Alta
**Depende de:** Feature 1 (Memory)

### Arquivos a criar

| Arquivo | Propósito |
|---------|-----------|
| `skills/forge/plugins/forge-advisor.yaml` | Plugin (priority 8) com hooks before:phase:0 + on:checkpoint |
| `skills/forge/forge-advisor.md` | Protocolo de evidência: learnings + WebSearch + project-context |

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `skills/forge/SKILL.md` | §9: `forge-advisor.md` em Phase 0 |
| `skills/forge/phases/phase-0-discovery.md` | Step 4: nota que advisor injeta antes dos defaults |
| `skills/forge/references/tech-decisions-guide.md` | Nova seção "Advisor Integration" |

### Plugin Schema

```yaml
plugin:
  name: forge-advisor
  version: "1.0.0"
  description: "Evidence-based tech decisions using learnings, web research, and project context"

activation:
  enabled: true
  modes: [FULL_APP, SINGLE_FEATURE]

priority: 8  # Core — injects before ecosystem scanner

hooks:
  - event: "before:phase:0"
    action: inject
    source: "{FORGE_HOME}/forge-advisor.md"
    section: "1. Gather Evidence"
    description: |
      1. Load learnings from forge-memory (category: tech_decision)
      2. Read project-context.md for existing decisions
      3. Prepare advisor context for Phase 0 Step 4

  - event: "on:checkpoint"
    action: inject
    source: "{FORGE_HOME}/forge-advisor.md"
    section: "2. Validate Recommendations"
    filter:
      phases: [0]
    description: |
      When user wants to understand a tech decision:
      1. WebSearch for current benchmarks
      2. Cross-reference with learnings
      3. Present: "Baseado em {N} runs + dados atuais: ..."

state_key: "forge_advisor"
```

---

## Feature 7: Forge Multi-Agent Parallel

**Tipo:** Modificação do runner + phase-3 + config
**Complexidade:** Alta
**Depende de:** Feature 3 (Dep Graph)

### Arquivos a criar

| Arquivo | Propósito |
|---------|-----------|
| `skills/forge/forge-parallel.md` | Protocolo de execução paralela: worktrees, merge, conflitos |

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `skills/forge/runner.md` | §3: novo §3.0 "Parallel Execution Mode" antes do loop per-story |
| `skills/forge/phases/phase-3-build.md` | Step 2: agrupar por dependency level. Step 2c: "Parallel SDC Subloop" |
| `skills/forge/config.yaml` | Nova seção `parallel:` com enabled, max_concurrent, conflict_strategy |
| `skills/forge/SKILL.md` | §9: `forge-parallel.md` em Phase 3 |

### Lógica do parallel SDC

```
Para cada dependency level com 2+ stories paralelizáveis:
1. git worktree add .forge-wt-{story_id} HEAD (um por story)
2. Dispatch @dev para CADA story simultaneamente (múltiplos Agent tool calls)
3. Esperar TODAS completarem
4. Merge worktrees: git merge para cada uma
5. Se conflito: CHECKPOINT — resolver ou @architect
6. Cleanup: git worktree remove
7. Rodar veto conditions no resultado merged
```

### Config

```yaml
parallel:
  enabled: false              # Opt-in
  max_concurrent_agents: 3
  use_worktrees: true
  conflict_strategy: "checkpoint"  # checkpoint | auto-merge | abort
```

---

## Feature 8: Forge Templates — Projetos pré-configurados

**Tipo:** Novo workflow
**Complexidade:** Baixa
**Depende de:** Nada

### Arquivos a criar

| Arquivo | Propósito |
|---------|-----------|
| `skills/forge/workflows/template.md` | Workflow que carrega template e pula Phase 0+1 |

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `skills/forge/SKILL.md` | §2: `/forge template {name}` + `/forge template list` → TEMPLATE. §9: workflow file |

### Lógica do workflow

1. **Listar templates:** Glob `skills/app-builder/templates/*/TEMPLATE.md` (14 existentes)
2. **Carregar selecionado:** Ler stack, arquitetura, stories template
3. **Mini-Discovery** (3 perguntas): nome, descrição, customizações
4. **Pular Phase 0 + Phase 1** → direto pra Phase 2 com stories pré-carregadas
5. **Phase 2+ normal** — @sm refina, @po valida, SDC loop

---

## Feature 9: Forge Feedback Loop — Avaliação do resultado

**Tipo:** Plugin + arquivo fonte
**Complexidade:** Baixa
**Depende de:** Feature 1 (Memory)

### Arquivos a criar

| Arquivo | Propósito |
|---------|-----------|
| `skills/forge/plugins/forge-feedback.yaml` | Plugin (priority 88) com hooks before:run + after:run |
| `skills/forge/forge-feedback.md` | Protocolo de feedback: perguntas, scoring, salvamento |

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `skills/forge/SKILL.md` | §9: `forge-feedback.md` como ALWAYS |

### Plugin Schema

```yaml
plugin:
  name: forge-feedback
  version: "1.0.0"
  description: "Captures user feedback on run quality and feeds into Forge Memory"

activation:
  enabled: true

priority: 88

hooks:
  - event: "before:run"
    action: inject
    source: "{FORGE_HOME}/forge-feedback.md"
    section: "1. Previous Run Feedback"
    description: |
      Se existe run completo sem feedback no mesmo projeto:
      "Como foi o último run?"
      > 1. Ficou ótimo
      > 2. Ficou bom, mas... (follow-up: o que melhorar?)
      > 3. Não ficou bom (follow-up: o que deu errado?)
      > 4. Pular
      Salvar em .aiox/memory/forge/feedback.yaml via forge-memory.

  - event: "after:run"
    action: inject
    source: "{FORGE_HOME}/forge-feedback.md"
    section: "2. Current Run Feedback"
    description: |
      Feedback rápido (opcional, não bloqueia):
      > 1. 👍 Tudo certo
      > 2. 👎 Teve problemas
      > 3. Pular

state_key: "forge_feedback"
```

---

## Resumo de Impacto

### Novos Hooks

| Hook | Feature | Quando dispara |
|------|---------|---------------|
| `after:deploy` | 5 (Watch) | Após push + PR criados com sucesso (NÃO se usuário optou por não deployar) |

### Novas Entradas no Intent Classification (SKILL.md §2)

| Comando | Mode | Feature |
|---------|------|---------|
| `/forge dry-run {desc}` | DRY_RUN | 2 |
| `/forge replay {run_id} [--from phase:{N}]` | REPLAY | 4 |
| `/forge template {name}` | TEMPLATE | 8 |
| `/forge template list` | TEMPLATE | 8 |

### Novos Arquivos (total: 14)

| Tipo | Qtd | Arquivos |
|------|-----|----------|
| Plugins (.yaml) | 4 | forge-memory, forge-watch, forge-advisor, forge-feedback |
| Source files (.md) | 5 | forge-memory, forge-watch, forge-advisor, forge-parallel, forge-feedback |
| Workflows (.md) | 3 | dry-run, replay, template |
| Config (parcial) | 1 | config.yaml (seções memory + parallel) |

### Arquivos Modificados (total: 10)

| Arquivo | Tocado por Features |
|---------|-------------------|
| `SKILL.md` | 1, 2, 4, 5, 6, 7, 8, 9 (todas menos 3) |
| `runner.md` | 5, 7 |
| `config.yaml` | 1, 7 |
| `phases/phase-0-discovery.md` | 6 |
| `phases/phase-2-stories.md` | 3 |
| `phases/phase-3-build.md` | 3, 7 |
| `phases/phase-5-deploy.md` | 5 |
| `references/tech-decisions-guide.md` | 6 |
| `plugins/SCHEMA.md` | 5 |
| `.aiox-core/product/templates/story-tmpl.yaml` | 3 |

---

## Checklist de Implementação

### Fase A — Fundação

- [x] **A1** Feature 1 (Memory): Criar `plugins/forge-memory.yaml`
- [x] **A2** Feature 1 (Memory): Criar `forge-memory.md` com 3 seções (Load, Save, Error Learning)
- [x] **A3** Feature 1 (Memory): Atualizar `config.yaml` com seção `memory:`
- [x] **A4** Feature 1 (Memory): Atualizar `SKILL.md` §9
- [x] **A5** Feature 3 (Dep Graph): Modificar `phase-2-stories.md` (depends_on + topological sort)
- [x] **A6** Feature 3 (Dep Graph): Modificar `phase-3-build.md` (ordering + validation)
- [x] **A7** Feature 3 (Dep Graph): Atualizar `story-tmpl.yaml` com campo depends_on
- [x] **A8** Feature 2 (Dry Run): Criar `workflows/dry-run.md`
- [x] **A9** Feature 2 (Dry Run): Atualizar `SKILL.md` §2 + §9

### Fase B — Consumidores de Memory

- [x] **B1** Feature 9 (Feedback): Criar `plugins/forge-feedback.yaml`
- [x] **B2** Feature 9 (Feedback): Criar `forge-feedback.md`
- [x] **B3** Feature 9 (Feedback): Atualizar `SKILL.md` §9
- [x] **B4** Feature 6 (Advisor): Criar `plugins/forge-advisor.yaml`
- [x] **B5** Feature 6 (Advisor): Criar `forge-advisor.md`
- [x] **B6** Feature 6 (Advisor): Atualizar `phase-0-discovery.md`
- [x] **B7** Feature 6 (Advisor): Atualizar `tech-decisions-guide.md`
- [x] **B8** Feature 6 (Advisor): Atualizar `SKILL.md` §9

### Fase C — Orquestração Avançada

- [x] **C1** Feature 7 (Parallel): Criar `forge-parallel.md`
- [x] **C2** Feature 7 (Parallel): Modificar `runner.md` §3 (Parallel Execution Mode)
- [x] **C3** Feature 7 (Parallel): Modificar `phase-3-build.md` (Parallel SDC Subloop)
- [x] **C4** Feature 7 (Parallel): Atualizar `config.yaml` com seção `parallel:`
- [x] **C5** Feature 7 (Parallel): Atualizar `SKILL.md` §9

### Fase D — Novos Workflows

- [x] **D1** Feature 8 (Templates): Criar `workflows/template.md`
- [x] **D2** Feature 8 (Templates): Atualizar `SKILL.md` §2 + §9
- [x] **D3** Feature 4 (Replay): Criar `workflows/replay.md`
- [x] **D4** Feature 4 (Replay): Atualizar `SKILL.md` §2 + §9

### Fase E — Pós-Deploy

- [x] **E1** Feature 5 (Watch): Criar `plugins/forge-watch.yaml`
- [x] **E2** Feature 5 (Watch): Criar `forge-watch.md`
- [x] **E3** Feature 5 (Watch): Modificar `runner.md` §7 (hook after:deploy)
- [x] **E4** Feature 5 (Watch): Modificar `phase-5-deploy.md` (Step 3b)
- [x] **E5** Feature 5 (Watch): Atualizar `plugins/SCHEMA.md` (novo hook)
- [x] **E6** Feature 5 (Watch): Atualizar `SKILL.md` §9

---

## Verificação (para cada feature)

1. `node skills/forge/scripts/validate-plugins.cjs` — plugins válidos
2. Verificar que SKILL.md §2 tem o novo comando no intent classification
3. Verificar que SKILL.md §9 tem o novo arquivo no selective reading
4. Simular mentalmente um `/forge {command}`: boot → plugins load → workflow dispatch → hooks fire → completion
5. Verificar backwards compatibility: rodar sem a feature ativada não quebra nada

---

## Critérios de Aceitação Global

- [ ] Todas as 9 features implementadas
- [ ] `validate-plugins.cjs` passa com 0 erros para todos os novos plugins
- [ ] Nenhuma feature quebra o comportamento existente (backwards compatible)
- [ ] Cada plugin segue o schema de `plugins/SCHEMA.md`
- [ ] Cada novo workflow segue o template de `WORKFLOW-GUIDE.md`
- [ ] SKILL.md §2 tem todos os novos comandos
- [ ] SKILL.md §9 tem todos os novos arquivos
- [ ] config.yaml tem as novas seções (memory, parallel)
- [ ] Hook `after:deploy` documentado em `plugins/SCHEMA.md`
- [ ] Novos modos (DRY_RUN, REPLAY, TEMPLATE) presentes na lista de activation.modes dos plugins relevantes
