# Task: Extract Framework (Trinity)

**Command:** `*extract-framework {source}`
**Execution Type:** Agent
**Model:** Opus
**Haiku Eligible:** NO
**Load:** — (uses core knowledge)

## Checklist Reference

Before marking this task complete, verify against: `checklists/mental-model-integration-checklist.md`

## Veto Conditions

| ID | Condition | Check | Result |
|----|-----------|-------|--------|
| VETO-AEF-001 | Source quality classification must be completed before Trinity extraction | Verify source is classified as OURO/BRONZE and rationale is documented in Step 1 | VETO - BLOCK. Classify source quality before extracting Playbook/Framework/Swipe File. |
| VETO-AEF-002 | Existing Trinity artifacts must be backed up before overwrite | Check whether target playbook/framework/swipe files already exist and confirm backup creation | VETO - BLOCK. Create backup snapshot for existing Trinity artifacts before proceeding. |
| VETO-AEF-003 | Trinity output must include all three legs with evidence | Verify final output has Playbook + Framework (SE/ENTAO) + Swipe File (real examples) with `[SOURCE:]` | VETO - BLOCK. Extraction incomplete; do not hand off until all Trinity legs are present. |

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

### Step 1.5: GAP Analysis (Prometido vs Entregue)

Antes de investir tempo extraindo, analisar a DISTÂNCIA entre o que a fonte promete e o que realmente entrega.

**Perguntas:**
- "O que o expert DISSE que ia ensinar vs o que REALMENTE ensinou?"
- "Onde o conteúdo desviou da promessa original?"
- "Que temas surgiram espontaneamente (não planejados)?"

**Por que importa:**
- Gap grande em fonte ouro = pensamento REAL exposto (desvios revelam prioridades verdadeiras)
- Gap pequeno = script decorado (menos autêntico)
- Desvios espontâneos = frameworks mentais operando ao vivo

Template:
```yaml
gap_analysis:
  fonte: "{nome da fonte}"
  prometido: "{o que disse que seria o tema}"
  entregue: "{o que realmente foi discutido}"
  gap_size: "ALTO / MEDIO / BAIXO"
  desvios_espontaneos:
    - desvio: "{para onde foi}"
      sinal: "{o que revela sobre o pensamento real}"
  implicacao: "{o que o gap diz sobre autenticidade e prioridades do expert}"
```

#### >>> CHECKPOINT: Gap como sinal de autenticidade <<<

```yaml
checkpoint_gap_analysis:
  consult: "VALUES.autenticidade_integral"
  question: "O gap entre prometido e entregue revela pensamento REAL ou indica fonte scripted?"
  if_gap_alto: "Fonte mais autêntica — desvios são ouro. Priorizar extração dos desvios."
  if_gap_baixo: "Fonte possivelmente scripted — rebaixar para BRONZE se outros sinais confirmarem."
  rationale: "Expert que desvia do roteiro está pensando ao vivo. Expert que segue script está performando."
```

#### >>> ADVERSARIAL: Steel Man o gap <<<

```yaml
adversarial_gap:
  consult: "MODELS.first_principles_thinking"
  steel_man: "E se o gap é INTENCIONAL? Expert conscientemente mudou o plano porque sentiu a audiência."
  attack: "E se é simplesmente DESORGANIZAÇÃO? Expert não preparou, divagou sem propósito."
  test: "Desvio levou a framework/insight ou levou a nada? Se framework emergiu → autêntico. Se divagação sem estrutura → desorganização."
  rationale: "Nem todo gap é autenticidade. Distinguir desvio produtivo de divagação improdutiva."
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

### Step 4.5: Extract Paradigm Inversions

Identificar onde o expert INVERTE paradigmas estabelecidos. Inversões são onde mora o Thinking DNA mais valioso.

**Perguntas:**
- "Que crença convencional do campo o expert REJEITA?"
- "Antes se pensava X → o expert argumenta Y. Qual o raciocínio?"
- "Que 'verdade aceita' é tratada como erro?"

**Por que importa:**
- Inversões revelam os frameworks mentais mais profundos do expert
- Onde ele diverge do campo = onde está seu 0,8% de genialidade
- Cada inversão é um SE/ENTÃO disfarçado: "SE o campo diz X → expert faz o OPOSTO porque Y"

Template:
```yaml
paradigm_inversions:
  - id: "INV-001"
    conventional: "{o que o campo acredita}"
    expert_position: "{o que o expert defende}"
    reasoning: "{por que inverte}"
    evidence: "{citação}" # [SOURCE: página/minuto]
    hidden_framework: "SE {campo diz X} → ENTÃO {expert faz Y} PORQUE {razão}"
```

#### >>> CHECKPOINT: Inversão real vs reformulação <<<

```yaml
checkpoint_inversao_real:
  consult: "MODELS.first_principles_thinking"
  question: "Isso é uma INVERSÃO real de paradigma ou apenas reformulação do óbvio?"
  if_inversao: "Documentar com [SOURCE:] e extrair framework oculto"
  if_reformulacao: "Descartar — não é insight, é ruído"
  rationale: "'Qualidade importa' não é inversão. 'Volume é inimigo da qualidade' é."
```

#### >>> ADVERSARIAL: Steel Man a inversão <<<

```yaml
adversarial_inversion:
  consult: "PARADOXES.humble_expert"
  steel_man: "Qual a versão MAIS FORTE desta inversão? Se eu fosse o expert, como defenderia com a melhor evidência?"
  attack: "E se é EGO, não insight? E se o campo mainstream está CERTO e o expert é contrarian por marketing?"
  test: "A inversão tem [SOURCE:] com raciocínio E evidência? Ou é apenas opinião contrária sem fundamento?"
  survive_criteria:
    - "Raciocínio lógico documentado (não só 'eu acho')"
    - "Evidência de resultado (cases, números, dados)"
    - "Consistência com outros frameworks do mesmo expert"
  rationale: "Contrarian por ego ≠ contrarian por insight. A evidência separa os dois."
```

### Step 4.7: Cross-Lens Integration Map

Cruzar os achados das 3 lentes (GAP Analysis + Inversions + Evasion Scan) para gerar um mapa integrado do expert. As lentes isoladas produzem listas. Integradas, produzem um **mapa de território cognitivo**.

**Lógica de integração:**

```
GAP Analysis ──► revela ONDE o expert pensa ao vivo
                     │
                     ▼
              Desvios espontâneos = CANDIDATOS a inversão
                     │
                     ▼
Paradigm Inversions ──► revela O QUE o expert pensa diferente
                     │
                     ▼
              Temas que inverte vs temas que evade = FRONTEIRAS
                     │
                     ▼
Evasion Scan ──► revela ONDE o expert NÃO opera
```

**Perguntas de integração:**
- "O expert desvia do script (GAP) PARA falar de quê? Esse desvio contém inversão?"
- "Onde o expert inverte paradigma (confiante) vs onde evade (fragilidade)? O que a fronteira revela?"
- "O GAP mostra o expert indo para tema X. Mas ele EVADE tema Y. Relação entre X e Y?"

**Template:**
```yaml
cross_lens_map:
  expert: "{nome}"

  territory_of_strength:
    description: "Onde o expert opera com confiança (inversões + desvios espontâneos)"
    evidence:
      - from_gap: "{desvio espontâneo que revelou inversão}"
      - from_inversion: "{paradigma invertido com confiança}"

  territory_of_avoidance:
    description: "Onde o expert NÃO opera (evasões + ausências no GAP)"
    evidence:
      - from_evasion: "{tema evitado}"
      - from_gap: "{tema prometido mas não entregue}"

  boundary_insights:
    description: "O que a fronteira entre strength e avoidance revela"
    pattern: "{padrão observado}"
    implication_for_clone: "{como isso afeta o design do clone}"

  cross_source_signals:
    description: "Padrões que se repetem em múltiplas fontes"
    confirmed_patterns:
      - pattern: "{descrição}"
        sources: ["{fonte 1}", "{fonte 2}", "{fonte 3}"]
        confidence: "ALTA (3+ fontes) / MEDIA (2 fontes) / BAIXA (1 fonte)"
```

#### >>> CHECKPOINT: Integração real vs colagem <<<

```yaml
checkpoint_integracao:
  consult: "OBSESSIONS.clareza_compreensao_profunda"
  question: "O mapa integrado revela algo NOVO que nenhuma lente sozinha mostrou?"
  if_novo: "Integração real — insight emergente documentado"
  if_colagem: "Apenas juntou listas. Refazer perguntando: 'O que a FRONTEIRA entre as lentes revela?'"
  rationale: "A integração existe para revelar o que vive na INTERSECÇÃO, não para somar listas."
```

### Step 5: Validate Completeness

Checklist da Trindade:
- [ ] Playbook tem passos claros e sequenciais
- [ ] Framework tem regras SE/ENTAO (nao so teoria)
- [ ] Swipe File tem exemplos REAIS (nao inventados)
- [ ] Os tres se complementam (playbook diz O QUE, framework diz QUANDO, swipe mostra COMO)
- [ ] Cross-Lens Integration Map gerado (território de força + evasão + fronteira)

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

- [ ] GAP Analysis executado (prometido vs entregue + adversarial test)
- [ ] Playbook extraido (passo a passo)
- [ ] Framework extraido (regras SE/ENTAO)
- [ ] Swipe File extraido (exemplos validados)
- [ ] Paradigm Inversions extraidas (≥ 1 + adversarial test)
- [ ] Cross-Lens Integration Map gerado (território força + evasão + fronteira)
- [ ] Completude validada (3 pernas + lentes integradas)
