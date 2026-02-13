# Task: Extract Framework (Trinity)

**Command:** `*extract-framework {source}`
**Execution Type:** Agent
**Load:** — (uses core knowledge)

## Purpose

Extrair a Trindade completa (Playbook + Framework + Swipe File) de uma fonte especifica.

## Workflow

### Step 1: Identify Source Type

Perguntar: "Qual a fonte? (entrevista, livro, curso, post, video)"

Avaliar qualidade:
- OURO → proceder com extracao completa
- BRONZE → avisar que resultado sera limitado, sugerir buscar ouro

#### >>> CHECKPOINT: Filtrar autenticidade ANTES de investir tempo <<<

```yaml
checkpoint_autenticidade:
  consult: "VALUES.autenticidade_integral"
  question: "Fonte é autêntica o suficiente para extrair Framework confiável?"
  if_autentica: "Proceder com extração completa"
  if_nao: "Avisar limitação, sugerir buscar ouro. Framework de bronze = genérico do campo."
  rationale: "Framework de fonte scripted = framework genérico, não do expert."
```

### Step 2: Extract Playbook

O Playbook e a RECEITA — passo a passo da metodologia.

Buscar na fonte:
- "Como ele faz X?" → sequencia de passos
- "Qual o processo dele?" → workflow
- "O que faz primeiro, segundo, terceiro?" → ordem

Template:
```yaml
playbook:
  name: "{nome da metodologia}"
  steps:
    - step: 1
      action: "{o que fazer}"
      details: "{como fazer}"
    - step: 2
      action: "{proximo passo}"
```

### Step 3: Extract Framework

O Framework e a FORMA — regras de decisao SE/ENTAO.

Buscar na fonte:
- "Quando ele ve X, o que faz?" → regra condicional
- "Como decide entre A e B?" → criterio
- "O que NUNCA faria?" → veto condition

Template:
```yaml
framework:
  rules:
    - condition: "SE {situacao}"
      action: "ENTAO {decisao}"
      rationale: "{por que}"
  veto:
    - condition: "SE {situacao}"
      action: "NUNCA {acao proibida}"
```

#### >>> CHECKPOINTS: Validar profundidade da extração <<<

```yaml
checkpoint_clareza_radical:
  consult: "VALUES.clareza_radical"
  question: "Framework extraído tem regras claras SE/ENTÃO?"
  if_claras: "Framework válido"
  if_vagas: "Refazer extração buscando condições explícitas"
  rationale: "Framework sem regras claras = Playbook disfarçado."

checkpoint_profundidade:
  consult: "OBSESSIONS.clareza_compreensao_profunda"
  question: "Extraí FRAMEWORK (SE/ENTÃO) ou só PLAYBOOK (passos)?"
  if_framework: "Regras de decisão documentadas — válido"
  if_playbook: "Continuar extração até achar regras condicionais"
  rationale: "Playbook = O QUE fazer. Framework = QUANDO e POR QUE."
```

### Step 4: Extract Swipe File

O Swipe File sao EXEMPLOS — provas que funcionam.

Buscar na fonte:
- Casos reais com numeros
- Exemplos especificos citados
- Analogias e metaforas usadas
- Historias contadas repetidamente

Template:
```yaml
swipe_file:
  cases:
    - title: "{caso}"
      context: "{situacao}"
      result: "{resultado}"
      lesson: "{licao}"
  analogies:
    - concept: "{conceito}"
      analogy: "{analogia usada}"
```

#### >>> CHECKPOINT: Validar autenticidade dos exemplos <<<

```yaml
checkpoint_swipe_autenticidade:
  consult: "VALUES.autenticidade_integral"
  question: "Exemplos são REAIS do expert ou GENÉRICOS do campo?"
  if_reais: "Swipe File válido"
  if_genericos: "Marcar como [GENERIC] e buscar casos reais do expert"
  rationale: "Swipe File genérico = qualquer LLM inventa. Precisa ser do EXPERT."
```

### Step 5: Validate Completeness

Checklist da Trindade:
- [ ] Playbook tem passos claros e sequenciais
- [ ] Framework tem regras SE/ENTAO (nao so teoria)
- [ ] Swipe File tem exemplos REAIS (nao inventados)
- [ ] Os tres se complementam (playbook diz O QUE, framework diz QUANDO, swipe mostra COMO)

Se falta alguma perna: avisar qual e sugerir onde buscar.

#### >>> CHECKPOINT: Humildade sobre a extração <<<

```yaml
checkpoint_humble_expert:
  consult: "PARADOXES.humble_expert"
  question: "Estou CONFIANTE no processo mas HUMILDE sobre o conteúdo extraído?"
  if_sim: "Validação com abertura para erro"
  if_nao: "Marcar pontos de incerteza como [NEEDS_VALIDATION]"
  rationale: "Overconfidence no conteúdo = blind spots. Expert em processo, humilde sobre conteúdo."
```

## Completion Criteria

- [ ] Playbook extraido (passo a passo)
- [ ] Framework extraido (regras SE/ENTAO)
- [ ] Swipe File extraido (exemplos validados)
- [ ] Completude validada (3 pernas presentes)
