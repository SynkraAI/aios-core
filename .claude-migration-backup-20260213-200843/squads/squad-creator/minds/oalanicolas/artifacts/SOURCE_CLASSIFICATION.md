# SOURCE_CLASSIFICATION - Ouro vs Bronze

**Type:** Classification Artifact
**Agent:** @oalanicolas
**Purpose:** Critérios para classificar fontes de conhecimento

## Core Principle

> "Se entrar cocô, sai cocô do outro lado."
> — Alan Nicolas

Menos material ouro > muito material bronze.

---

## Classification Tiers

### 🥇 OURO (Tier 1) - Autenticidade Máxima

Fontes onde o expert fala sem filtro, responde perguntas reais, revela pensamento genuíno.

```yaml
ouro_sources:
  tier_1a_pure_gold:
    - type: "Comentários em posts"
      why: "Respostas espontâneas, sem edição"
      signal: "Expert respondendo dúvidas específicas"
      example: "Comentário no YouTube explicando decisão"

    - type: "Entrevistas longas (2h+)"
      why: "Profundidade, repetição revela padrões"
      signal: "Mesma história contada de formas diferentes"
      example: "Lex Fridman, Joe Rogan, podcasts de 3h"

    - type: "Stories/lives espontâneos"
      why: "Sem preparação, autêntico"
      signal: "Bastidores, decisões em tempo real"
      example: "Instagram stories explicando o dia"

  tier_1b_high_quality:
    - type: "Livros próprios"
      why: "Pensamento estruturado, revisado"
      signal: "Frameworks completos, citações verificáveis"
      caution: "Pode ser ghostwritten, verificar voz"

    - type: "Podcast próprio"
      why: "Controle editorial, temas escolhidos"
      signal: "Repetição de princípios core"
      example: "The Game w/ Alex Hormozi"

    - type: "Cases documentados"
      why: "Prova de resultados, não teoria"
      signal: "Números, antes/depois, contexto"
      example: "Portfolio company transformations"

extraction_priority: "1a > 1b sempre"
minimum_ratio: "60% ouro no total de fontes"
```

### 🥉 BRONZE (Tier 2) - Usar com Cautela

Fontes editadas, genéricas, ou de contexto limitado.

```yaml
bronze_sources:
  tier_2a_acceptable:
    - type: "Palestras em eventos"
      why: "Preparado, audience genérica"
      signal: "Mesmas histórias, menos profundidade"
      use_when: "Não tem ouro suficiente"

    - type: "Entrevistas curtas (<30min)"
      why: "Superficial, talking points"
      signal: "Respostas ensaiadas"
      caution: "Não revela decision-making"

    - type: "Posts de blog/LinkedIn"
      why: "Editado, otimizado para engagement"
      signal: "Pode ter ghostwriter"
      use_for: "Signature phrases, não frameworks"

  tier_2b_low_quality:
    - type: "Conteúdo antigo (5+ anos)"
      why: "Pessoa mudou, contexto diferente"
      signal: "Contradiz posições atuais"
      action: "Marcar [OUTDATED] se usar"

    - type: "Terceiros falando sobre expert"
      why: "Interpretação, não fonte primária"
      signal: "Telephone game effect"
      action: "NUNCA usar como fonte única"

    - type: "Clips sem contexto"
      why: "Cherry-picked, pode distorcer"
      signal: "Viral mas incompleto"
      action: "Buscar fonte original"

maximum_ratio: "40% bronze no total"
veto_trigger: "> 50% bronze = VETO"
```

### ⛔ ELIMINAR (Tier 3) - Não Usar

```yaml
eliminate_sources:
  - type: "Conteúdo de fãs/admiradores"
    reason: "Fanfic, não realidade"

  - type: "Resumos de terceiros"
    reason: "Interpretação da interpretação"

  - type: "IA-generated sobre expert"
    reason: "Circularidade, sem source real"

  - type: "Gossip/especulação"
    reason: "Sem verificação possível"

action: "DELETE do pipeline, não marcar bronze"
```

---

## Classification Process

### Step 1: Inventory

```yaml
inventory_template:
  source_name: ""
  source_type: ""
  date: ""
  duration_length: ""
  url_reference: ""
  initial_tier: "ouro | bronze | eliminate"
  classification_reason: ""
```

### Step 2: Scoring

| Criterion | Weight | Ouro Threshold | Bronze Threshold |
|-----------|--------|----------------|------------------|
| Spontaneity | 0.9 | Unscripted | Scripted |
| Depth | 0.8 | 2h+ or detailed | < 30min or surface |
| Specificity | 0.8 | Answers real questions | Generic advice |
| Recency | 0.6 | < 3 years | 3-5 years |
| Primary source | 1.0 | Expert directly | Third party |

### Step 3: Ratio Check

```yaml
ratio_validation:
  calculate: "ouro_count / total_count"

  thresholds:
    green: ">= 0.7"   # Proceed confidently
    yellow: "0.6-0.7" # Proceed with caution
    red: "< 0.6"      # VETO - curate more

  action_on_red:
    - "Search for more ouro sources"
    - "OR eliminate bronze sources"
    - "OR scope down extraction"
```

---

## Quality Signals

### Ouro Signals (Look For)

```yaml
positive_signals:
  - "Expert corrigindo mal-entendido"
  - "Contradição explicada (mostra nuance)"
  - "Bastidores de decisão"
  - "Admissão de erro"
  - "Resposta a crítica"
  - "Explicação do 'porquê' não só 'o quê'"
  - "Mesma história com detalhes diferentes (triangulação)"
```

### Bronze Signals (Watch Out)

```yaml
warning_signals:
  - "Parece muito polished"
  - "Mesma história sempre igual"
  - "Só highlights, nunca failures"
  - "Muito genérico, aplicável a qualquer um"
  - "Otimizado para viralizar"
  - "Não responde perguntas diretas"
```

---

## Veto Conditions

| Condition | Action | Recovery |
|-----------|--------|----------|
| ouro_ratio < 0.6 | VETO | Curate more ouro sources |
| zero ouro sources | HARD VETO | Cannot proceed |
| > 50% tier 2b | VETO | Eliminate low quality |
| any tier 3 in final set | VETO | Remove immediately |

---

## Examples

### Good Classification

```yaml
project: "Hormozi Clone"
status: "APPROVED"

sources:
  ouro:
    - "Lex Fridman interview (3h)"
    - "MFCEO Project interview (2h)"
    - "Instagram comments (47 responses)"
    - "$100M Offers book"
    - "$100M Leads book"
    count: 5

  bronze:
    - "Grant Cardone interview (20min)"
    - "Conference keynote 2022"
    count: 2

ratio: "5/7 = 71%" # GREEN
```

### Bad Classification

```yaml
project: "Generic Business Clone"
status: "VETO"

sources:
  ouro:
    - "One podcast episode (45min)"
    count: 1

  bronze:
    - "10 LinkedIn posts"
    - "5 YouTube shorts"
    - "2 conference talks"
    - "1 blog post by fan"
    count: 18

ratio: "1/19 = 5%" # HARD RED
reason: "Volume without curation - will produce generic clone"
```

---

**Pattern Compliance:** Source Classification Standard
**Veto Mapping:** AN_VC_001, AN_VC_003
**Integration:** Step 1 of AN_KE_001 pipeline
