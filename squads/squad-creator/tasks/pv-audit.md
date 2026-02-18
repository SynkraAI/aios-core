# Task: Process Audit (*audit)

> Pedro Valério | Loaded on-demand when `*audit {squad}` is invoked

**Execution Type:** Agent

## Purpose

Auditar squad/workflow por falhas de processo usando framework "Impossibilitar Caminhos"

## CRITICAL: Token Budget

**VETO CONDITION:** Audit que estoura contexto é audit quebrado.

```
Budget máximo por fase:
- Phase 1: ~2k tokens (overview)
- Phase 2: ~5k tokens (sample)
- Phase 3: ~3k tokens (deep-dive sob demanda)
TOTAL MÁXIMO: ~10k tokens
```

**NUNCA:**
- Ler TODOS os agents de uma vez
- Ler DNA files sem pedido explícito
- Ler mais de 3 arquivos por fase

## Input

- Squad name ou workflow file path
- `--all` flag para audit 100% (com batching)

## Parâmetros

| Flag | Comportamento |
|------|---------------|
| (default) | 3-Phase Staged - sample representativo |
| `--all` | Audit 100% em batches de 3 agents |

---

## Mode: Full Audit (`*audit {squad} --all`)

**ATENÇÃO:** Audit completo consome mais tokens. Usa batching pra não estourar.

### Step 1: Estimate & Confirm

```bash
# Calcular custo estimado
wc -l squads/{squad}/agents/*.md | tail -1  # total lines
```

**Mostrar estimativa:**
```
⚠️ FULL AUDIT MODE

Squad: {name}
Agents: {N}
Total lines: {X}
Estimated tokens: ~{X * 2}

Batches necessários: {ceil(N/3)}
Tokens por batch: ~{batch_estimate}

Confirma? (y/n)
```

**HALT:** Aguardar confirmação.

### Step 2: Batch Execution

Processar em batches de 3 agents:

```
Batch 1/N: agent-1, agent-2, agent-3
→ Ler 3 agents
→ Aplicar diagnostic framework
→ Output parcial
→ [CONTINUE para próximo batch]

Batch 2/N: agent-4, agent-5, agent-6
→ ...
```

**Entre batches:** Mostrar progresso e perguntar se continua.

### Step 3: Consolidate

Após todos os batches:
- Consolidar findings
- Gerar report final com 100% coverage

---

## Mode: Staged Audit (default)

### Phase 1: Structural Overview (~2k tokens)

**Objetivo:** Mapear estrutura SEM ler conteúdo completo.

```bash
# Comandos a executar:
ls -la squads/{squad}/agents/     # Lista agents (não lê)
ls -la squads/{squad}/workflows/  # Lista workflows (não lê)
wc -l squads/{squad}/agents/*.md  # Conta linhas por agent
```

**Ler APENAS:**
- `config.yaml` (estrutura do squad)

**Output Phase 1:**
```yaml
squad_overview:
  name: "{squad}"
  agent_count: N
  workflow_count: N
  total_lines: N
  largest_agents: [top 3 por linhas]
  has_dna_files: true/false
  has_checklists: true/false
```

**HALT:** Mostrar overview e perguntar direção.

---

### Phase 2: Pattern Sample (~5k tokens)

**Objetivo:** Identificar padrões com AMOSTRA representativa.

**Ler APENAS (máximo 3 arquivos):**
- 1 agent PEQUENO (< 200 linhas)
- 1 agent MÉDIO (200-400 linhas)
- 1 workflow principal (se existir)

**Aplicar Diagnostic Framework na amostra:**
- "Se o executor não ler as instruções, o que acontece?"
- "Se o executor tentar pular um passo, consegue?"
- "Se o executor errar, o sistema detecta automaticamente?"

**Check Red Flags:**
- [ ] Processo depende de boa vontade do executor
- [ ] Instruções fora do sistema
- [ ] Caminhos errados possíveis mas "não recomendados"
- [ ] Sem veto conditions

**Check Green Flags:**
- [ ] Veto conditions bloqueiam caminhos errados
- [ ] Checklist inline na própria task
- [ ] Handoff rules definidos
- [ ] Smoke tests especificados

**Output Phase 2:**
```yaml
sample_analysis:
  agents_sampled: ["{small}", "{medium}"]
  workflow_sampled: "{name}"

  patterns_found:
    consistent:
      - "{pattern que se repete}"
    inconsistent:
      - "{pattern que varia}"

  red_flags: [list]
  green_flags: [list]

  extrapolation: |
    "Baseado na amostra de 2/{total} agents..."
```

**HALT:** Mostrar análise e perguntar se quer deep-dive.

---

### Phase 3: Deep-Dive (sob demanda, ~3k tokens)

**Trigger:** Usuário pede análise específica.

**Comandos:**
- `*audit {squad} agent:{name}` - Auditar 1 agent específico
- `*audit {squad} workflow:{name}` - Auditar 1 workflow específico
- `*audit {squad} dna` - Verificar DNA files

**Ler APENAS o arquivo pedido.**

**Output Phase 3:**
```yaml
deep_dive:
  target: "{agent/workflow name}"

  wrong_paths_found:
    - point: "{decision point}"
      wrong_path: "{what can go wrong}"
      current_protection: "none | alert | block"
      recommendation: "{veto condition}"

  veto_conditions_proposed:
    - id: "V{n}"
      condition: "{description}"
      check: "{how to verify}"
      action: "VETO - {what to do}"

  verdict: "PASS | NEEDS WORK | REDESIGN"
```

---

## Final Report (após todas as fases)

```yaml
audit_report:
  squad: "{name}"
  date: "{date}"
  auditor: "@pedro-valerio"

  scope:
    agents_total: N
    agents_sampled: N
    coverage: "X%"

  token_usage:
    phase_1: "~Xk"
    phase_2: "~Xk"
    phase_3: "~Xk (se aplicável)"
    total: "~Xk / 10k budget"

  findings:
    critical: [bloqueiam uso]
    major: [precisam correção]
    minor: [melhorias]

  verdict: "PASS | NEEDS WORK | REDESIGN"

  next_actions:
    - "{ação 1}"
    - "{ação 2}"
```

## Completion Criteria

- [ ] Phase 1 completa com overview estrutural
- [ ] Phase 2 completa com sample analysis
- [ ] Token budget respeitado (< 10k total)
- [ ] Usuário direcionou deep-dives (se necessário)
- [ ] Veto conditions propostas para problemas encontrados
