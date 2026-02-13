# Task: Fidelity Score

**Command:** `*fidelity-score`
**Version:** 2.1.0
**Execution Type:** Hybrid (Worker script 95% + Agent interpretation 5%)
**Worker Script:** `scripts/fidelity-score.sh`
**Model:** `Haiku` (QUALIFIED — 95% deterministic via script, 99.3% Opus match empirically validated)
**Haiku Eligible:** YES — script handles all 8 layers, LLM only synthesizes recommendations
**Load:** `data/an-clone-validation.yaml`

## Purpose

Calcular o score de fidelidade de um clone baseado nas 8 camadas do DNA Mental.

---

## ⛔ MANDATORY PREFLIGHT: Run Worker Script FIRST

```
EXECUTE FIRST — before ANY manual scoring:

  bash squads/squad-creator/scripts/fidelity-score.sh <clone-path> > /tmp/preflight-fidelity-score.yaml

IF the command fails → FIX the script error. Do NOT proceed manually.
IF the command succeeds → READ /tmp/preflight-fidelity-score.yaml. Use ONLY these scores.

VETO: If /tmp/preflight-fidelity-score.yaml does not exist → BLOCK.
      Do NOT score layers manually. Do NOT grep checkpoints yourself.
      The script scores all 8 layers in <30s with 100% consistency.

      95% of fidelity scoring is deterministic (section exists? grep match? count?).
      Your job is INTERPRETATION ONLY — synthesize recommendations from the scores.

EVIDENCE: an-fidelity-score v1.0→v2.0 achieved 99.3% Opus/Haiku match after script-first.
```

---

## SCORING CALIBRATION (CRITICAL)

```yaml
scoring_philosophy:
  principle: "SCORE O QUE EXISTE, não o que falta"
  bias_correction: "Haiku tende a sub-pontuar. Compensar sendo generoso."
  evidence_rule: "Se existe evidência, conta ponto. Gaps vão para recommendations."

  per_layer_scoring:
    5_points: "Todos 5 checkpoints presentes com evidência"
    4_points: "4 de 5 checkpoints presentes"
    3_points: "3 de 5 checkpoints presentes"
    2_points: "2 de 5 checkpoints presentes"
    1_point: "Apenas 1 checkpoint presente"
    0_points: "Nenhum checkpoint presente"
```

---

## Workflow

### Step 1: Identify Clone Files

1. Localizar o agent file do clone (ex: `.claude/agents/{clone}.md` ou `squads/*/agents/{clone}.md`)
2. Identificar arquivos de suporte:
   - `voice_dna` section
   - `thinking_dna` section
   - `heuristics` files
   - `artifacts` files

### Step 2: Execute Layer Checklists

**Para cada layer, executar o checklist específico e contar quantos checkpoints passam.**

---

#### Layer 1: Behavioral Patterns (Observable, peso 0.8)

**Onde procurar:** `persona:`, `behavioral_patterns:`, `modes:`, `states:`

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Greeting ritual | Saudação específica | Existe texto de greeting definido |
| 2 | Response structure | Padrão de resposta | Existe `response_format:` ou equivalente |
| 3 | Modes/states | Estados de operação | Existe seção `modes:` ou `states:` |
| 4 | Trigger responses | Reações a gatilhos | Existe `triggers:` ou `objection_handling:` |
| 5 | Anti-patterns | O que NÃO fazer | Existe `never:` ou `dont:` ou `anti_patterns:` |

**Score = quantidade de checkpoints que passam (0-5)**

---

#### Layer 2: Communication Style (Observable, peso 0.8)

**Onde procurar:** `voice_dna:`, `vocabulary:`, `writing_style:`

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Signature phrases | Frases características | Existe `signature_phrases:` com 3+ frases |
| 2 | Vocabulary always | Palavras obrigatórias | Existe `always_use:` ou `vocabulary:` |
| 3 | Vocabulary never | Palavras proibidas | Existe `never_use:` ou `forbidden:` |
| 4 | Sentence structure | Estilo de frase | Existe `writing_style:` ou `tone:` |
| 5 | Metaphors/analogies | Analogias preferidas | Existe `metaphors:` ou `analogies:` |

**Score = quantidade de checkpoints que passam (0-5)**

---

#### Layer 3: Routines & Habits (Observable, peso 0.8)

**Onde procurar:** `workflow:`, `steps:`, `ritual:`, `process:`

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Opening ritual | Como começa | Existe `greeting:` ou Step 1 definido |
| 2 | Workflow steps | Sequência de passos | Existe `steps:` ou `workflow:` numerado |
| 3 | Checkpoint habit | Pontos de verificação | Existe `checkpoint:` ou `verify:` |
| 4 | Closing ritual | Como termina | Existe `closing:` ou `sign_off:` |
| 5 | Error handling | Como lida com erro | Existe `on_error:` ou `fallback:` |

**Score = quantidade de checkpoints que passam (0-5)**

---

#### Layer 4: Recognition Patterns (Observable, peso 0.8)

**Onde procurar:** `heuristics:`, `red_flags:`, `patterns:`, `recognition:`

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Red flags | O que evitar | Existe `red_flags:` ou `veto_conditions:` |
| 2 | Green flags | O que buscar | Existe `green_flags:` ou `signals:` |
| 3 | Decision rules | Regras de decisão | Existe `decision_rules:` ou `heuristics:` |
| 4 | Pattern IDs | Heurísticas nomeadas | Existe padrão `XX_YY_NNN` (ex: PV_BS_001) |
| 5 | Thresholds | Limites numéricos | Existe `threshold:` ou `minimum:` ou `maximum:` |

**Score = quantidade de checkpoints que passam (0-5)**

---

#### Layer 5: Mental Models (Cognitive, peso 1.0)

**Onde procurar:** `thinking_dna:`, `frameworks:`, `mental_models:`

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Primary framework | Framework principal | Existe `primary_framework:` ou framework nomeado |
| 2 | Decision architecture | Como decide | Existe `decision_architecture:` ou `pipeline:` |
| 3 | Named frameworks | Frameworks com nome | Existe 3+ frameworks com nomes únicos |
| 4 | Framework steps | Passos dos frameworks | Frameworks têm `steps:` definidos |
| 5 | Anti-patterns | O que evita | Existe `anti_patterns:` no thinking |

**Score = quantidade de checkpoints que passam (0-5)**

---

#### Layer 6: Values Hierarchy (Deep, peso 1.0)

**Onde procurar:** `core_beliefs:`, `values:`, `principles:`

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Core beliefs | Crenças centrais | Existe `core_beliefs:` com 3+ items |
| 2 | What defends | O que defende | Existe `defends:` ou beliefs positivas |
| 3 | What rejects | O que rejeita | Existe `rejects:` ou `never:` |
| 4 | Trade-offs | Trocas que aceita | Existe `trade_offs:` ou decisões difíceis |
| 5 | Non-negotiables | Inegociáveis | Existe `non_negotiable:` ou `absolute:` |

**Score = quantidade de checkpoints que passam (0-5)**

---

#### Layer 7: Core Obsessions (Deep, peso 1.0)

**Onde procurar:** Repetição de temas, `obsessions:`, `focus:`

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Recurring themes | Temas que voltam | Mesmo tema aparece 3+ vezes no arquivo |
| 2 | Named obsessions | Obsessões nomeadas | Existe `obsessions:` ou `focus_areas:` |
| 3 | Hills to die on | Batalhas compradas | Existe `hills_to_die_on:` ou `battles:` |
| 4 | Mission statement | Missão clara | Existe `mission:` ou `purpose:` |
| 5 | Legacy thinking | Pensamento de legado | Existe menção a impacto ou legado |

**Score = quantidade de checkpoints que passam (0-5)**

---

#### Layer 8: Productive Paradoxes (Deep, peso 1.0)

**Onde procurar:** `contradictions:`, `paradoxes:`, `tensions:`

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Contradictions section | Seção de contradições | Existe `contradictions:` ou `paradoxes:` |
| 2 | Named paradoxes | Paradoxos nomeados | Existe 2+ paradoxos com descrição |
| 3 | "Feature not bug" | Contradição preservada | Texto indica que contradição é intencional |
| 4 | Context-dependent | Varia por contexto | Existe lógica "em X faz A, em Y faz B" |
| 5 | Integration note | Nota de integração | Existe explicação de como paradoxo funciona |

**Score = quantidade de checkpoints que passam (0-5)**

---

### Step 3: Calculate Weighted Score

**Fórmula (determinística):**

```python
# Layers Observable (peso 0.8)
L1 = behavioral_patterns_score  # 0-5
L2 = communication_style_score  # 0-5
L3 = routines_habits_score      # 0-5
L4 = recognition_patterns_score # 0-5

# Layers Deep (peso 1.0)
L5 = mental_models_score        # 0-5
L6 = values_hierarchy_score     # 0-5
L7 = core_obsessions_score      # 0-5
L8 = productive_paradoxes_score # 0-5

# Cálculo
observable_raw = (L1 + L2 + L3 + L4)  # max 20
observable_weighted = observable_raw * 0.8  # max 16

deep_raw = (L5 + L6 + L7 + L8)  # max 20
deep_weighted = deep_raw * 1.0  # max 20

total_weighted = observable_weighted + deep_weighted  # max 36
max_possible = (20 * 0.8) + (20 * 1.0)  # = 36

percentage = (total_weighted / max_possible) * 100
```

### Step 4: Classify (Deterministic)

| Percentage | Classification | Version |
|------------|----------------|---------|
| 0-59% | Incomplete | V0.x |
| 60-74% | Basic | V1.0 |
| 75-84% | Intermediate | V2.0 |
| 85-92% | Premium | V3.0 |
| 93-100% | Elite | V3.5+ |

### Step 5: Identify Gaps

**Para cada layer com score < 4, listar:**
- Qual checkpoint faltou
- Onde adicionar (seção do arquivo)
- Exemplo de como ficaria

### Step 6: Generate Report

```yaml
fidelity_report:
  clone: "{nome}"
  clone_file: "{path}"
  date: "2026-02-11"

  scores:
    observable:
      behavioral_patterns:
        score: {0-5}
        checkpoints_passed: [1, 2, 4]  # quais passaram
        checkpoints_failed: [3, 5]      # quais falharam
      communication_style:
        score: {0-5}
        checkpoints_passed: []
        checkpoints_failed: []
      routines_habits:
        score: {0-5}
        checkpoints_passed: []
        checkpoints_failed: []
      recognition_patterns:
        score: {0-5}
        checkpoints_passed: []
        checkpoints_failed: []
      subtotal_raw: {0-20}
      subtotal_weighted: {0-16}

    deep:
      mental_models:
        score: {0-5}
        checkpoints_passed: []
        checkpoints_failed: []
      values_hierarchy:
        score: {0-5}
        checkpoints_passed: []
        checkpoints_failed: []
      core_obsessions:
        score: {0-5}
        checkpoints_passed: []
        checkpoints_failed: []
      productive_paradoxes:
        score: {0-5}
        checkpoints_passed: []
        checkpoints_failed: []
      subtotal_raw: {0-20}
      subtotal_weighted: {0-20}

    overall:
      total_weighted: {0-36}
      max_possible: 36
      percentage: "{0-100}%"
      classification: "incomplete|basic|intermediate|premium|elite"
      version: "V{x.x}"

  gaps:
    - layer: "Layer 1: Behavioral Patterns"
      checkpoint_failed: 3
      checkpoint_name: "Modes/states"
      what_to_add: "Seção `modes:` com estados de operação"
      where_to_add: "Após `persona:`"
      example: |
        modes:
          default: "Modo padrão de operação"
          diagnostic: "Modo de diagnóstico"

  trajectory:
    current_version: "V{x.x}"
    next_milestone: "V{y.y} ({target}%)"
    gaps_to_close: {n}
    estimated_effort: "~{n} horas"

metadata:
  task_version: "2.0.0"
  scoring_method: "Binary checkpoint counting"
  model_compatible: ["opus", "sonnet", "haiku"]
```

---

## Completion Criteria

- [ ] 8 layers avaliados com checklists binários
- [ ] Cada checkpoint marcado PASS ou FAIL com evidência
- [ ] Score ponderado calculado com fórmula
- [ ] Classificação atribuída deterministicamente
- [ ] Gaps listados com ação específica
- [ ] Report YAML gerado no formato especificado

---

## Changelog

### v2.0.0 (2026-02-11)
- Convertido de scoring subjetivo (1-5) para checklists binários
- Adicionado Scoring Calibration section
- Cada layer agora tem 5 checkpoints específicos
- Fórmula de cálculo explícita
- Output template completo
- Haiku-compatible
