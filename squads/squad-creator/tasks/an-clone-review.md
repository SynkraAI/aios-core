# Task: Clone Review

**Command:** `*clone-review`
**Version:** 2.2.0
**Execution Type:** Hybrid (Worker script 90% + Agent interpretation 10%)
**Worker Script:** `scripts/clone-review.sh`
**Model:** `Haiku` (QUALIFIED — 90% deterministic via script, Agent interprets pre-computed data only)
**Haiku Eligible:** YES — script handles grep/count/validation, LLM only synthesizes
**Load:** `data/an-source-tiers.yaml`

## Purpose

Review completo de um clone existente: fontes, trindade, estagios, fidelidade. Equivalente a um audit geral.

---

## SCOPE DEFINITION (CRITICAL)

```yaml
scope_definition:
  principle: "Review clone = wrapper + TODOS arquivos referenciados"

  include_in_scope:
    - "Wrapper file (.md) - o arquivo principal do clone"
    - "Persona delegada - SE wrapper tem '@persona-file' ou 'persona:' → incluir arquivo referenciado"
    - "Data files - SE wrapper referencia 'data/*.yaml' → incluir no escopo"
    - "Heuristics files - SE wrapper referencia 'heuristics/*.yaml' → incluir"

  explicit_rules:
    delegation_rule: |
      SE wrapper contém pattern '@{filename}' ou 'Read {path}'
      ENTÃO incluir {filename}/{path} no escopo de avaliação

    persona_rule: |
      SE wrapper delega para persona (ex: "You are @gary-halbert")
      ENTÃO avaliar Trinity no arquivo da PERSONA, não só no wrapper

    combined_rule: |
      Trinity score = checkpoints no WRAPPER + checkpoints em DELEGATED FILES
      Não penalizar wrapper vazio se persona delegada tem conteúdo

  anti_patterns:
    - "NÃO avaliar só o wrapper se ele delega para persona"
    - "NÃO ignorar conteúdo em arquivos referenciados"
    - "NÃO dar score 0 para swipe_file se exemplos estão na persona"

  examples:
    correto:
      - "mmos-tim.md referencia @research-specialist → incluir research-specialist.md"
      - "Wrapper tem 'persona: gary-halbert' → avaliar gary-halbert.md junto"
    incorreto:
      - "Wrapper vazio = Trinity 0/15 (ERRADO se delega)"
      - "Avaliar só wrapper quando tem @delegation (ERRADO)"
```

---

## ⛔ MANDATORY PREFLIGHT: Run Worker Script FIRST

```
EXECUTE FIRST — before ANY manual analysis:

  bash squads/squad-creator/scripts/clone-review.sh <clone-file.md> [sources-dir] > /tmp/preflight-clone-review.yaml

IF the command fails → FIX the script error. Do NOT proceed manually.
IF the command succeeds → READ /tmp/preflight-clone-review.yaml. Use ONLY these numbers.

VETO: If /tmp/preflight-clone-review.yaml does not exist → BLOCK.
      Do NOT count sources manually. Do NOT grep for checkpoints yourself.
      The script does this faster, cheaper, and 100% consistently.

      90% of this review is deterministic (file exists? count? grep match?).
      Your job is INTERPRETATION ONLY — not data collection.
```

---

## SCORING CALIBRATION (CRITICAL)

```yaml
scoring_philosophy:
  principle: "SCORE O QUE EXISTE, não o que falta"
  bias_correction: "Haiku tende a sub-pontuar. Compensar sendo generoso."
  evidence_rule: "Se existe evidência, conta ponto. Gaps vão para recommendations."

  checkpoint_scoring:
    per_component: "Count checkpoints passed (0-5)"
    trinity_total: "Sum of 3 components (0-15)"
    percentage: "(passed / total) × 100"
```

---

## Workflow

### Step 1: Source Quality Review

**Onde procurar:** `sources/`, `metadata.yaml`, arquivos de referência

**Checkpoints para cada fonte:**

| # | Checkpoint | Passa se... |
|---|------------|-------------|
| 1 | Source file exists | Arquivo existe em sources/ |
| 2 | Source has type | Campo `type:` definido |
| 3 | Source classified | Campo `tier:` = ouro ou bronze |
| 4 | Source has content | Arquivo tem >100 linhas úteis |
| 5 | Source is primary | É referenciado no agent file |

**Cálculo:**
```python
total_sources = count(sources/)
ouro_sources = count(tier == "ouro")
ouro_percentage = (ouro_sources / total_sources) * 100

curadoria_score:
  if ouro_percentage >= 80: "excelente"
  elif ouro_percentage >= 60: "aceitavel"
  else: "critico"
```

---

### Step 2: Trinity Verification (Binary Checkpoints)

**Para cada perna da trindade, verificar 5 checkpoints:**

#### Playbook (5 checkpoints)

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Section exists | `playbook:` ou `workflow:` | Seção existe no arquivo |
| 2 | Has steps | `steps:` ou lista numerada | 3+ passos definidos |
| 3 | Steps are sequential | Ordem lógica | Passos têm números ou sequência clara |
| 4 | Steps are actionable | Verbos de ação | Cada passo começa com verbo |
| 5 | Has output definition | `output:` por passo | Pelo menos 1 passo tem output definido |

**Score Playbook = count(passed) → 0-5**

---

#### Framework (5 checkpoints)

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Section exists | `framework:` ou `heuristics:` | Seção existe |
| 2 | Has rules | `rules:` ou `SE/ENTAO` | 3+ regras definidas |
| 3 | Rules are conditional | `if:`, `when:`, `SE:` | Regras têm condições |
| 4 | Rules have actions | `then:`, `ENTAO:`, `action:` | Regras têm consequências |
| 5 | Has decision tree | Estrutura aninhada | Regras têm ramificações |

**Score Framework = count(passed) → 0-5**

---

#### Swipe File (5 checkpoints)

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Section exists | `examples:` ou `swipe:` | Seção existe |
| 2 | Has examples | Lista de exemplos | 3+ exemplos |
| 3 | Examples are real | `[SOURCE:]` tags | Exemplos têm citação |
| 4 | Examples show input/output | Pares de antes/depois | Pelo menos 2 pares |
| 5 | Examples are diverse | Tipos diferentes | 2+ tipos de exemplo |

**Score Swipe File = count(passed) → 0-5**

---

#### Trinity Total Score

```python
playbook_score = count(playbook_checkpoints_passed)  # 0-5
framework_score = count(framework_checkpoints_passed)  # 0-5
swipe_score = count(swipe_checkpoints_passed)  # 0-5

trinity_total = playbook_score + framework_score + swipe_score  # 0-15
trinity_percentage = (trinity_total / 15) * 100

trinity_verdict:
  if trinity_percentage >= 80: "SOLID"
  elif trinity_percentage >= 60: "NEEDS_WORK"
  else: "REBUILD"
```

---

### Step 3: Stage Architecture Review (Binary Checkpoints)

**Primeiro verificar se clone usa estágios:**

```yaml
has_stages: grep -c "stages:" file.md > 0
```

**SE tem estágios (5 checkpoints):**

| # | Checkpoint | Passa se... |
|---|------------|-------------|
| 1 | Stages defined | `stages:` section existe |
| 2 | 2+ stages | Pelo menos 2 estágios definidos |
| 3 | Each stage has trigger | Cada estágio tem `trigger:` ou `when:` |
| 4 | Each stage has behavior | Cada estágio tem `behavior:` ou `response:` |
| 5 | Transitions defined | Existe `transition:` ou fluxo entre estágios |

**SE não tem estágios, verificar se PRECISA:**

| # | Check | Resultado |
|---|-------|-----------|
| 1 | Prompt > 500 linhas? | Se sim → provavelmente precisa |
| 2 | Múltiplos contextos? | Se sim → provavelmente precisa |
| 3 | Comportamento varia? | Se sim → provavelmente precisa |

---

### Step 4: Quick Fidelity Check (Binary Checkpoints)

**5 checkpoints rápidos (não é full fidelity score):**

| # | Checkpoint | O que procurar | Passa se... |
|---|------------|----------------|-------------|
| 1 | Voice DNA exists | `voice_dna:` section | Seção existe |
| 2 | Has signature phrases | `signature_phrases:` | 3+ frases |
| 3 | Thinking DNA exists | `thinking_dna:` section | Seção existe |
| 4 | Has frameworks | `frameworks:` ou `mental_models:` | 2+ frameworks |
| 5 | Has immune system | `veto:` ou `never:` ou `objection:` | Seção de proteção existe |

**Quick Fidelity Score = count(passed) / 5 × 100**

---

### Step 5: Generate Review Report

```yaml
clone_review:
  clone: "{nome}"
  clone_file: "{path}"
  date: "2026-02-11"

  source_quality:
    total_sources: {n}
    ouro_count: {n}
    bronze_count: {n}
    ouro_percentage: "{%}"
    curadoria_score: "excelente|aceitavel|critico"
    sources_checked:
      - file: "{nome}"
        tier: "ouro|bronze"
        checkpoints_passed: [1,2,3,4,5]

  trinity:
    playbook:
      checkpoints_passed: [1,2,3,4]
      checkpoints_failed: [5]
      score: 4
      gaps: ["Missing output definition per step"]
    framework:
      checkpoints_passed: [1,2,3,4,5]
      checkpoints_failed: []
      score: 5
      gaps: []
    swipe_file:
      checkpoints_passed: [1,2]
      checkpoints_failed: [3,4,5]
      score: 2
      gaps: ["Examples lack SOURCE tags", "No input/output pairs", "Not diverse"]
    total_score: 11
    max_score: 15
    percentage: "73.3%"
    verdict: "NEEDS_WORK"

  stages:
    has_stages: true|false
    needs_stages: true|false
    stage_score: {0-5}
    gaps: []

  quick_fidelity:
    checkpoints_passed: [1,2,3,4]
    checkpoints_failed: [5]
    score: 4
    percentage: "80%"
    estimate: "Intermediate (V2.0)"

  overall:
    trinity_percentage: "{%}"
    fidelity_estimate: "{%}"
    verdict: "SOLID|NEEDS_WORK|REBUILD"

  priority_actions:
    - action: "{o que fazer primeiro}"
      target_component: "playbook|framework|swipe|stages|fidelity"
      checkpoints_to_fix: [3,5]
      impact: "alto|medio"

  next_version_path: "De {current}% para {target}% fechando {n} gaps"

metadata:
  task_version: "2.0.0"
  scoring_method: "Binary checkpoint counting"
  model_compatible: ["opus", "sonnet", "haiku"]
```

---

## Completion Criteria

- [ ] Fontes avaliadas com checkpoints binários
- [ ] Trindade verificada (15 checkpoints total)
- [ ] Estágios revisados com checkpoints
- [ ] Quick fidelity com 5 checkpoints
- [ ] Report com percentages e gaps específicos

---

## Changelog

### v2.2.0 (2026-02-11)
- ADD: SCOPE DEFINITION - wrapper + delegated files included in scope
- FIX: Haiku scope interpretation issue (73% vs 93% - Opus included delegated persona)

### v2.1.0 (2026-02-11)
- Script-first with clone-review.sh

### v2.0.0 (2026-02-11)
- Convertido Trinity quality 1-5 para 5 checkpoints binários cada
- Adicionado Scoring Calibration section
- Stage review agora tem checkpoints específicos
- Quick fidelity com 5 checkpoints definidos
- Output template completo com checkpoints_passed/failed
- Haiku-compatible
