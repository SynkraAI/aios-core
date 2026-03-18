# cross-domain-synthesis

## Metadata
```yaml
task_id: KOE_SIN_001
agent: koe-sintetizador
type: creation
complexity: high
estimated_time: 45min
source: "Dan Koe — Digital Renaissance Framework + Modern Mastery"
framework: "Digital Renaissance"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-voice-dna.yaml
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
  tasks:
    - KOE_COL_002  # queue processing provides inputs
    - KOE_SIN_002  # framework naming follows synthesis
    - KOE_SIN_003  # iceberg validation follows
```

## Purpose
Conectar insights de 2+ domínios distintos para encontrar padrões não-óbvios, gerando Big Ideas originais que vivem na interseção — o coração da metodologia Digital Renaissance de Dan Koe.

> "The people who change the world are the ones who connect ideas that nobody else connected. That's the Digital Renaissance — becoming a modern polymath who sees patterns across domains that specialists miss entirely." — Dan Koe

## Context
O Digital Renaissance é o framework central de Dan Koe para criação de conteúdo diferenciado. A premissa: num mundo de especialistas, o generalista informado que conecta domínios tem vantagem competitiva absoluta.

A síntese cross-domain é o que separa:
- **Conteúdo genérico**: "5 dicas de produtividade" (single-domain, zero originalidade)
- **Conteúdo diferenciado**: "Por que a filosofia Estóica é o melhor framework de produtividade — e o que startup founders podem aprender com Marcus Aurelius" (cross-domain, Big Idea original)

Dan Koe faz isso constantemente: conecta psicologia + negócios, filosofia + marketing, espiritualidade + empreendedorismo. O resultado são insights que NINGUÉM mais está oferecendo, porque ninguém mais tem essa combinação de lentes.

Este task é o motor de inovação do Koe Squad. É onde ideias brutas viram propriedade intelectual.

---

## Steps

### STEP 1: Selecionar Domínios para Síntese
Identificar os domínios que serão conectados:

```yaml
domain_selection:
  sources:
    - "Queue items de alto sinal (signal >= 7)"
    - "Clusters identificados em KOE_COL_002"
    - "Domínios subrepresentados que precisam de conexão"
    - "Tema semanal definido em KOE_CHIEF_005"

  selection_criteria:
    distance: "Quanto mais distantes os domínios, mais original o insight"
    depth: "Precisa de profundidade mínima em ambos os domínios"
    audience_relevance: "A conexão precisa resolver algo para a audiência"
    personal_experience: "Conexões que o criador viveu são mais autênticas"

  domain_distance_matrix:
    close_domains:  # fácil de conectar, menos original
      examples: ["business ↔ economics", "psychology ↔ education"]
      originality: "baixa"
      difficulty: "baixa"

    medium_domains:  # sweet spot
      examples: ["psychology ↔ business", "philosophy ↔ technology"]
      originality: "média-alta"
      difficulty: "média"

    distant_domains:  # difícil mas altamente original
      examples: ["spirituality ↔ business", "biology ↔ marketing"]
      originality: "muito alta"
      difficulty: "alta"
      warning: "Precisa de profundidade real em ambos — não forçar conexões superficiais"

  selected_domains:
    domain_a: "{{domain}}"
    domain_a_depth: "{{surface|moderate|deep}}"
    domain_a_key_insights: ["{{insight1}}", "{{insight2}}"]
    domain_b: "{{domain}}"
    domain_b_depth: "{{surface|moderate|deep}}"
    domain_b_key_insights: ["{{insight1}}", "{{insight2}}"]
    distance: "{{close|medium|distant}}"
```

### STEP 2: Extrair Princípios de Cada Domínio
Antes de sintetizar, isolar os princípios fundamentais de cada domínio:

```yaml
principle_extraction:
  domain_a_principles:
    - principle: "{{nome do princípio}}"
      description: "{{como funciona neste domínio}}"
      evidence: "{{exemplo concreto}}"
      transferability: "{{1-10 — quão bem transfere para outros contextos}}"

  domain_b_principles:
    - principle: "{{nome do princípio}}"
      description: "{{como funciona neste domínio}}"
      evidence: "{{exemplo concreto}}"
      transferability: "{{1-10}}"

  extraction_technique:
    method: "First Principles Thinking"
    steps:
      - "O que é fundamentalmente verdade neste domínio?"
      - "Que padrão se repete independente do contexto?"
      - "Se eu explicasse isso para uma criança, qual seria a essência?"
      - "Onde mais esse padrão aparece na natureza/vida?"
```

### STEP 3: Encontrar Padrões na Interseção
O coração da síntese — buscar onde os princípios se cruzam:

```yaml
intersection_mapping:
  technique_1_analogy:
    description: "Princípio A é para Domínio A como ??? é para Domínio B"
    example:
      domain_a: "Biologia"
      principle_a: "Antifragilidade — sistemas biológicos ficam mais fortes sob stress moderado"
      domain_b: "Negócios"
      connection: "Negócios antifragile crescem com crises — cada problema resolvido = muscle"
      big_idea: "Seu negócio deveria funcionar como um sistema imunológico — cada objeção é um treino"

  technique_2_inversion:
    description: "Se Princípio A é verdade, o que é CONTRAINTUITIVAMENTE verdade em Domínio B?"
    example:
      domain_a: "Psicologia"
      principle_a: "Paradoxo da escolha — mais opções = mais paralisia"
      domain_b: "Marketing"
      connection: "Oferecer menos produtos converte mais — constraint é feature, não bug"
      big_idea: "O segredo das ofertas irresistíveis: remova opções até sobrar uma decisão óbvia"

  technique_3_pattern_match:
    description: "O mesmo padrão aparece em ambos os domínios?"
    example:
      domain_a: "Física (termodinâmica)"
      principle_a: "Entropia — sistemas tendem à desordem sem energia aplicada"
      domain_b: "Criação de conteúdo"
      connection: "Content entropy — sem sistema, criação tende ao caos e inconsistência"
      big_idea: "A Queue System é a anti-entropia do criador — ordem emerge do sistema, não da motivação"

  technique_4_contradiction:
    description: "O que é verdade em Domínio A contradiz o que se assume em Domínio B?"
    example:
      domain_a: "Ecologia"
      principle_a: "Monoculturas são frágeis — diversidade = resiliência"
      domain_b: "Branding"
      assumption_b: "'Nicho down' = especializar numa coisa só"
      contradiction: "Nichar demais é monocultura intelectual — você se torna frágil"
      big_idea: "You Are The Niche — diversidade de interesses é sua vantagem competitiva"

  technique_5_metaphor:
    description: "Usar Domínio A como metáfora para iluminar Domínio B"
    example:
      domain_a: "Jardinagem"
      metaphor: "Ideias são sementes. Queue é o solo. Fill é a irrigação. Empty é o sol. Use é a colheita."
      domain_b: "Criação de conteúdo"
      big_idea: "Você não cria conteúdo — você cultiva ideias. E jardins precisam de sistema, não de motivação."
```

### STEP 4: Formular a Big Idea
Cristalizar a síntese em uma Big Idea clara e comunicável:

```yaml
big_idea_formulation:
  structure:
    core_insight: "{{a verdade não-óbvia que emerge da interseção}}"
    domains_connected: ["{{domain_a}}", "{{domain_b}}"]
    technique_used: "{{analogy|inversion|pattern_match|contradiction|metaphor}}"

  tests:
    surprise_test:
      question: "Isso surpreende quando ouve pela primeira vez?"
      target: "sim — se não surpreende, não é Big Idea"

    simplicity_test:
      question: "Pode ser dito em 1 frase?"
      target: "sim — complexidade vem na explicação, não na ideia"

    depth_test:
      question: "Dá para falar sobre isso por 30 minutos?"
      target: "sim — uma frase com profundidade infinita"

    actionability_test:
      question: "A audiência pode fazer algo diferente por causa disso?"
      target: "sim — insight sem ação é filosofia de bar"

    uniqueness_test:
      question: "Alguém mais está dizendo isso desta forma?"
      target: "não — ou pelo menos não com essa combinação de domínios"

  big_idea_output:
    one_sentence: "{{a Big Idea em 1 frase}}"
    expanded: "{{3-5 frases expandindo}}"
    domains: ["{{domain_a}}", "{{domain_b}}"]
    audience_takeaway: "{{o que a audiência leva para casa}}"
    content_potential: "{{tweet|thread|newsletter|video|framework}}"
    framework_name_candidate: "{{tentativa de nome — refinado em KOE_SIN_002}}"
```

### STEP 5: Documentar a Síntese
Registrar o processo completo para referência e aprendizado:

```yaml
synthesis_documentation:
  id: "SYN-{{YYYY-MM-DD}}-{{N}}"
  date: "{{ISO_TIMESTAMP}}"

  inputs:
    domain_a: "{{domain}}"
    domain_a_sources: ["Q-{{id1}}", "Q-{{id2}}"]
    domain_b: "{{domain}}"
    domain_b_sources: ["Q-{{id3}}", "Q-{{id4}}"]

  process:
    principles_extracted: "{{N}}"
    techniques_tried: ["{{technique1}}", "{{technique2}}"]
    technique_that_worked: "{{technique}}"
    dead_ends: ["{{tentativa que não funcionou}}"]

  output:
    big_idea: "{{one sentence}}"
    quality_score: "{{1-10}}"
    iceberg_validated: "{{pending KOE_SIN_003}}"
    framework_named: "{{pending KOE_SIN_002}}"

  meta:
    time_spent: "{{minutes}}"
    difficulty: "{{easy|moderate|hard|breakthrough}}"
    learnings: "{{o que funcionou/não funcionou para próximas sínteses}}"
```

---

## Input Required
```yaml
synthesis_input:
  queue_items: []              # high-signal queue items to synthesize
  clusters: []                 # clusters identified by KOE_COL_002
  domain_a: ""                 # optional — force specific domain
  domain_b: ""                 # optional — force specific domain
  weekly_theme: ""             # optional — align synthesis with weekly theme
  synthesis_goal: ""           # optional — specific outcome desired
```

## Output Template
```yaml
synthesis_result:
  task_id: KOE_SIN_001
  timestamp: "{{ISO_TIMESTAMP}}"

  big_idea:
    one_sentence: "{{the Big Idea}}"
    domains: ["{{domain_a}}", "{{domain_b}}"]
    technique: "{{technique used}}"
    surprise_score: "{{1-10}}"
    depth_score: "{{1-10}}"
    actionability_score: "{{1-10}}"

  content_potential:
    formats: ["{{format1}}", "{{format2}}"]
    framework_candidate: "{{name attempt}}"
    newsletter_angle: "{{angle}}"

  next_steps:
    - "KOE_SIN_002 — Name the framework"
    - "KOE_SIN_003 — Iceberg depth validation"
    - "koe-arquiteto — Create content from Big Idea"

  documentation:
    synthesis_id: "SYN-{{id}}"
    time_spent: "{{minutes}}"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Mínimo 2 domínios distintos conectados (não single-domain)
  - [ ] Princípios extraídos de cada domínio antes de sintetizar
  - [ ] Pelo menos 2 técnicas de interseção tentadas
  - [ ] Big Idea passa no surprise test (é não-óbvia)
  - [ ] Big Idea passa no simplicity test (1 frase)
  - [ ] Big Idea passa no depth test (expandível por 30min+)
  - [ ] Big Idea passa no actionability test (audiência pode agir)
  - [ ] Síntese documentada com inputs, processo e output
  - [ ] Content potential avaliado (quais formatos servem)
  - [ ] Nenhuma conexão forçada (se domínios não conectam naturalmente, não forçar)
```

## Handoff
After completion: → koe-sintetizador (KOE_SIN_002 para naming + KOE_SIN_003 para iceberg validation) → depois koe-arquiteto para criação de conteúdo

---
*Task: KOE_SIN_001 | Agent: koe-sintetizador | Version: 1.0*
