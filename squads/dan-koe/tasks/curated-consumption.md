# curated-consumption

## Metadata
```yaml
task_id: KOE_COL_004
agent: koe-coletor
type: design
complexity: medium
estimated_time: 20min
source: "Dan Koe — Fill/Empty/Use Brain Cycle + Modern Mastery"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
  tasks:
    - KOE_COL_003  # tag analytics informs what to consume
```

## Purpose
Planejar uma sessão de consumo curado (fase FILL do ciclo Fill/Empty/Use) com fontes otimizadas por ROI de aprendizado, garantindo inputs de alta qualidade para alimentar o Queue System.

> "Most people consume randomly. They scroll, click, watch whatever the algorithm shows. That's not learning — that's entertainment disguised as productivity. Curated consumption means choosing your inputs with the same care you choose your outputs." — Dan Koe

## Context
O ciclo Fill/Empty/Use é central na metodologia de Dan Koe:
- **Fill** (tarde): consumo curado — ler, assistir, ouvir conteúdo de alta qualidade
- **Empty** (noite): caminhada, meditação, deixar o subconsciente conectar
- **Use** (manhã): deep work — transformar insights em conteúdo/assets

Este task foca na fase FILL. O consumo curado NÃO é scrollar redes sociais. É selecionar intencionalmente fontes que:
1. Alimentam os domínios subrepresentados na queue (diversidade)
2. Aprofundam domínios já fortes (mastery)
3. Criam oportunidades de cross-domain synthesis (inovação)

O ROI de consumo é: quanto de input se transforma em output capturável. Um livro inteiro pode gerar 1 ideia. Uma conversa de 10 minutos pode gerar 10. O ROI não é sobre volume — é sobre densidade de insights.

---

## Steps

### STEP 1: Diagnosticar Necessidades de Input
Analisar tag analytics (KOE_COL_003) para identificar gaps:

```yaml
input_diagnosis:
  from_tag_analytics:
    underrepresented_domains: ["{{domain1}}", "{{domain2}}"]
    overrepresented_domains: ["{{domain1}}"]
    format_gaps: ["{{format sem ideias prontas}}"]
    cross_domain_opportunities: ["{{pair1}}", "{{pair2}}"]

  from_weekly_theme:
    theme: "{{tema da semana se definido}}"
    domains_needed: ["{{domains relevantes ao tema}}"]
    depth_needed: "{{surface para inspiração | deep para substância}}"

  from_personal_goals:
    skill_gaps: ["{{skills que precisa desenvolver}}"]
    curiosity_pulls: ["{{tópicos que genuinamente interessam}}"]

  consumption_prescription:
    primary_goal: "{{diversificar | aprofundar | sintetizar}}"
    domains_to_fill: ["{{domain1}}", "{{domain2}}"]
    estimated_time: "{{60-120 min}}"
```

### STEP 2: Curar Fontes por ROI
Selecionar fontes de alta densidade de insight:

```yaml
source_curation:
  tier_1_highest_roi:
    type: "Conversas com pessoas inteligentes"
    roi: "10 insights / 30min"
    examples:
      - "Podcast com especialista no domínio-alvo"
      - "Conversa com mentor/peer"
      - "AMA (Ask Me Anything) de expert"
    why: "Informação filtrada por outra mente + serendipity das perguntas"

  tier_2_high_roi:
    type: "Livros/artigos densos lidos com intenção"
    roi: "5-8 insights / 60min"
    examples:
      - "Capítulo de livro no domínio subrepresentado"
      - "Artigo acadêmico traduzido para leigos"
      - "Long-form essay de pensador respeitado"
    why: "Profundidade que redes sociais não oferecem"

  tier_3_medium_roi:
    type: "YouTube videos/podcasts educativos"
    roi: "3-5 insights / 60min"
    examples:
      - "Talk de conferência (TED, conference keynote)"
      - "Entrevista longa com expert (Joe Rogan, Lex Fridman style)"
      - "Documentário sobre tema relevante"
    why: "Bom para domínios visuais/complexos, menor densidade que leitura"

  tier_4_low_roi:
    type: "Redes sociais curadas"
    roi: "1-2 insights / 60min"
    examples:
      - "Twitter lists curadas por tema"
      - "Subreddits especializados"
      - "Newsletter de terceiros"
    why: "Útil para pulso do mercado, mas baixa densidade. Usar com timer."

  tier_5_avoid:
    type: "Consumo passivo/algorítmico"
    roi: "0-1 insights / 60min"
    examples:
      - "Feed do Instagram/TikTok sem curadoria"
      - "YouTube autoplay"
      - "Notícias generalistas"
    why: "Entretenimento disfarçado de produtividade. EVITAR na fase Fill."
```

### STEP 3: Construir Plano de Sessão
Montar o plano detalhado da sessão de consumo:

```yaml
session_plan:
  duration: "{{60-120 min}}"
  structure:
    warmup:
      time: "5min"
      activity: "Revisar tag analytics e weekly theme"
      purpose: "Ativar filtros mentais antes de consumir"

    primary_block:
      time: "{{30-45 min}}"
      source: "{{Tier 1 ou Tier 2 source}}"
      domain: "{{domínio prioritário}}"
      capture_mode: "active"
      rule: "Pausar a cada insight e capturar (KOE_COL_001)"

    secondary_block:
      time: "{{20-30 min}}"
      source: "{{Tier 2 ou Tier 3 source}}"
      domain: "{{segundo domínio}}"
      capture_mode: "active"
      rule: "Mesma regra: pausar e capturar"

    exploration_block:
      time: "{{15-20 min}}"
      source: "{{fonte outside comfort zone}}"
      domain: "{{domínio completamente diferente}}"
      capture_mode: "relaxed"
      rule: "Consumir sem pressão de captura — deixar conexões emergirem"

    cooldown:
      time: "5min"
      activity: "Quick scan das ideias capturadas durante a sessão"
      purpose: "Identificar conexões imediatas antes do Empty phase"

  rules_during_session:
    - "SEMPRE ter ferramenta de captura aberta (app, caderno, voz)"
    - "Pausar e capturar a cada insight — não confiar na memória"
    - "Não julgar qualidade durante consumo — capturar tudo, filtrar depois"
    - "Não seguir rabbit holes — marcar para explorar depois"
    - "Timer por bloco — respeitar os limites de tempo"
    - "Sem multitask — uma fonte de cada vez"
```

### STEP 4: Definir Fontes Específicas
Recomendar fontes concretas baseadas nos domínios necessários:

```yaml
source_recommendations:
  by_domain:
    psychology:
      books: ["Thinking Fast and Slow", "Influence", "Atomic Habits"]
      podcasts: ["Huberman Lab", "Hidden Brain"]
      thinkers: ["Robert Cialdini", "Daniel Kahneman", "BJ Fogg"]

    philosophy:
      books: ["Meditations", "The Almanack of Naval Ravikant", "Man's Search for Meaning"]
      podcasts: ["The Tim Ferriss Show", "Philosophize This"]
      thinkers: ["Naval Ravikant", "Alan Watts", "Marcus Aurelius"]

    business:
      books: ["$100M Offers", "The 1-Page Marketing Plan", "Company of One"]
      podcasts: ["My First Million", "The Knowledge Project"]
      thinkers: ["Alex Hormozi", "Seth Godin", "Paul Graham"]

    technology:
      newsletters: ["Stratechery", "The Pragmatic Engineer", "AI Supremacy"]
      podcasts: ["Lex Fridman", "a16z Podcast"]
      thinkers: ["Andrej Karpathy", "Paul Graham", "Kevin Kelly"]

    creativity:
      books: ["Steal Like an Artist", "The War of Art", "Show Your Work"]
      podcasts: ["The Creative Penn", "Design Matters"]
      thinkers: ["Austin Kleon", "Steven Pressfield", "Rick Rubin"]

  cross_domain_gold:
    description: "Fontes que naturalmente cruzam domínios"
    recommendations:
      - "Naval Ravikant (philosophy + business + technology)"
      - "Tim Ferriss (health + business + psychology)"
      - "James Clear (psychology + habits + productivity)"
      - "Kevin Kelly (technology + philosophy + creativity)"
      - "Dan Koe himself (creativity + business + philosophy + psychology)"
```

### STEP 5: Preparar Active Capture Kit
Configurar ferramentas de captura para a sessão:

```yaml
capture_kit:
  primary_tool: "{{app ou método preferido do usuário}}"
  backup_tool: "Voice memo no celular"

  capture_template:
    quick_capture: "[FILL] {{raw idea}} | source: {{what I was consuming}}"
    connection_capture: "[FILL-CONNECT] {{idea A}} ↔ {{idea B}} | insight: {{connection}}"
    framework_capture: "[FILL-FW] {{framework name attempt}} | structure: {{pattern noticed}}"

  post_session_process:
    step_1: "Transferir todas as capturas para Queue System (KOE_COL_001 batch)"
    step_2: "Tag iniciais rápidos (domínio + tipo)"
    step_3: "Sinalizar conexões encontradas durante a sessão"
    step_4: "Transicionar para Empty phase (KOE_COL_005)"
```

---

## Input Required
```yaml
consumption_input:
  time_available: ""           # minutes available for Fill session
  tag_analytics: ""            # reference to KOE_COL_003 output (or ask for it)
  weekly_theme: ""             # optional — current week's theme
  domains_to_explore: []       # optional — specific domains requested
  preferred_formats: []        # books | podcasts | videos | articles | conversations
  current_reading: ""          # optional — what user is already reading/watching
```

## Output Template
```yaml
consumption_result:
  task_id: KOE_COL_004
  timestamp: "{{ISO_TIMESTAMP}}"

  diagnosis:
    primary_goal: "{{diversificar|aprofundar|sintetizar}}"
    domains_to_fill: ["{{domain1}}", "{{domain2}}"]

  session_plan:
    total_duration: "{{minutes}}"
    blocks:
      - { time: "{{min}}", source: "{{source}}", domain: "{{domain}}" }
      - { time: "{{min}}", source: "{{source}}", domain: "{{domain}}" }
      - { time: "{{min}}", source: "{{source}}", domain: "{{domain}}" }

  sources_recommended:
    - { title: "{{source}}", type: "{{book|podcast|video}}", domain: "{{domain}}", roi_tier: "{{1-5}}" }
    - { title: "{{source}}", type: "{{type}}", domain: "{{domain}}", roi_tier: "{{1-5}}" }

  capture_kit:
    tool: "{{primary tool}}"
    template: "{{capture template}}"

  next_phase: "KOE_COL_005 (Active Recovery) → then queue processing"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Diagnóstico de necessidades baseado em dados (tag analytics), não intuição
  - [ ] Fontes selecionadas são Tier 1-3 (não Tier 5 consumo passivo)
  - [ ] Sessão tem estrutura com blocos de tempo definidos
  - [ ] Pelo menos 2 domínios cobertos na sessão
  - [ ] Cross-domain source incluída quando possível
  - [ ] Capture kit preparado antes de iniciar consumo
  - [ ] Timer definido para evitar consumo infinito
  - [ ] Post-session process definido (transferir para queue)
  - [ ] Exploration block presente (consumo fora da zona de conforto)
```

## Handoff
After completion: → koe-coletor (KOE_COL_005 — Active Recovery para processamento subconsciente) → depois koe-coletor (KOE_COL_001 batch para capturar ideias da sessão)

---
*Task: KOE_COL_004 | Agent: koe-coletor | Version: 1.0*
