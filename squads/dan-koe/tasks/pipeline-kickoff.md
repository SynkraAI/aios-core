# pipeline-kickoff

## Metadata
```yaml
task_id: KOE_CHIEF_005
agent: koe-chief
type: creation
complexity: medium
estimated_time: 15min
source: "Dan Koe — 2 Hour Writer + Modern Mastery + Content Cascade"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-voice-dna.yaml
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
  agents:
    - koe-coletor
    - koe-sintetizador
    - koe-arquiteto
    - koe-distribuidor
  workflows:
    - wf-content-pipeline
```

## Purpose
Inicializar o pipeline semanal de conteúdo, definindo tema central, objetivos de distribuição e assignments para cada agente do Tier 1 (Coletor → Sintetizador → Arquiteto → Distribuidor).

> "The one-person business runs on a content engine. Every week: fill your brain, empty it into ideas, and use those ideas to build assets. That's the entire system." — Dan Koe

## Context
Dan Koe opera com um ciclo semanal disciplinado: Fill (consumir inputs curados) → Empty (processar e sintetizar) → Use (criar assets de conteúdo). O pipeline kickoff é o momento em que o Chief configura a semana, define o tema central (a Big Idea da semana), e distribui responsabilidades entre os agentes.

O Content Cascade de Dan Koe transforma 1 Big Idea semanal em:
- 1 Newsletter (2000-3000 palavras)
- 1 YouTube script/video
- 1 Blog post
- 5-10 tweets/threads
- 3-5 short-form clips
- 1 carousel (Instagram/LinkedIn)

Isso é "1 hora de criação = 10 horas de conteúdo" na prática. O kickoff define QUAL ideia vira tudo isso.

---

## Steps

### STEP 1: Revisar Queue Atual
Solicitar ao koe-coletor o estado atual da queue de ideias:

```yaml
queue_review:
  request_to: koe-coletor
  data_needed:
    - total_items_in_queue: ""
    - high_signal_items: []      # items com signal_strength >= 8
    - trending_themes: []        # padrões recorrentes nos últimos 7 dias
    - aged_items: []             # items com 5+ dias sem desenvolvimento
    - domains_represented: []    # quais domínios estão na queue

  queue_health:
    items_count: "{{N}}"
    freshness: "{{fresh|stale|mixed}}"
    diversity: "{{low|medium|high}}"  # diversidade de domínios
    ready_for_synthesis: "{{N items com signal >= 8}}"
```

### STEP 2: Selecionar Tema Central da Semana
Com base na queue, selecionar a Big Idea que será o tema central:

**Critérios de seleção (em ordem de prioridade):**
1. **Signal Strength** — ideias com mais energia/relevância
2. **Cross-Domain Potential** — ideias que conectam 2+ domínios (Digital Renaissance)
3. **Audience Resonance** — ideias que resolvem dor real da audiência
4. **Personal Passion** — ideias que o criador genuinamente quer explorar
5. **Timeliness** — relevância temporal (eventos, tendências, conversas)

```yaml
theme_selection:
  candidate_ideas:
    - idea: ""
      signal_strength: ""  # 1-10
      cross_domain: ""     # yes/no + domains
      audience_fit: ""     # 1-10
      personal_passion: "" # 1-10
      timeliness: ""       # 1-10
      composite_score: ""  # weighted average

  selected_theme:
    big_idea: ""           # the core concept in 1 sentence
    working_title: ""      # tentative title for newsletter
    angle: ""              # the unique perspective
    domains_connected: []  # which domains it synthesizes
    target_emotion: ""     # what should the reader feel

  alternatives:
    - idea: ""
      reason_not_selected: ""
      save_for_later: true
```

### STEP 3: Definir Objetivos da Semana
Estabelecer métricas e goals concretos para a semana:

```yaml
weekly_objectives:
  content_goals:
    newsletter:
      due: "{{day}}"
      word_count_target: "2000-3000"
      structure: "APAG"
      assigned_to: koe-arquiteto

    youtube:
      due: "{{day}}"
      length_target: "10-15min"
      hook_required: true
      assigned_to: koe-arquiteto

    social_posts:
      tweets_count: 7
      threads_count: 2
      carousels_count: 1
      assigned_to: koe-distribuidor

    short_form:
      clips_count: 3
      source: "youtube script repurposed"
      assigned_to: koe-distribuidor

  engagement_goals:
    newsletter_open_rate_target: ""
    social_engagement_rate_target: ""
    new_subscribers_target: ""

  business_goals:
    offer_mention: ""      # which offer to naturally mention
    cta_type: ""           # soft | medium | hard
    funnel_stage_focus: "" # awareness | consideration | decision
```

### STEP 4: Distribuir Assignments por Agente
Criar o plano de execução com responsabilidades claras:

```yaml
agent_assignments:
  monday_tuesday:  # FILL phase
    agent: koe-coletor
    tasks:
      - "Curated consumption session (KOE_COL_004)"
      - "Capturar ideias relacionadas ao tema: {{big_idea}}"
      - "Processar queue e alimentar sintetizador"
    deliverable: "Queue processada com inputs relevantes ao tema"
    handoff_to: koe-sintetizador

  wednesday:  # EMPTY + SYNTHESIZE phase
    agent: koe-sintetizador
    tasks:
      - "Cross-domain synthesis dos inputs (KOE_SIN_001)"
      - "Refinar Big Idea com framework naming (KOE_SIN_002)"
      - "Validar profundidade com Iceberg Test (KOE_SIN_003)"
    deliverable: "Big Idea refinada, nomeada, com profundidade validada"
    handoff_to: koe-arquiteto

  thursday:  # USE + CREATE phase
    agent: koe-arquiteto
    tasks:
      - "Deep work session: newsletter (APAG structure)"
      - "YouTube script baseado no mesmo tema"
      - "Blog post (adapted from newsletter)"
    deliverable: "Newsletter + YouTube script + blog post rascunho"
    handoff_to: koe-distribuidor

  friday:  # DISTRIBUTE phase
    agent: koe-distribuidor
    tasks:
      - "Extrair tweets/threads da newsletter"
      - "Criar carousel do conceito principal"
      - "Cortar clips do YouTube script"
      - "Agendar tudo no content calendar"
    deliverable: "7 tweets + 2 threads + 1 carousel + 3 clips agendados"
    handoff_to: koe-chief

  weekend:  # REVIEW + FILL
    agent: koe-chief
    tasks:
      - "Revisar métricas da semana"
      - "Identificar o que funcionou e o que não"
      - "Preparar inputs para próxima semana"
    deliverable: "Weekly review + seeds para próximo kickoff"
```

### STEP 5: Gerar Kickoff Summary
Compilar tudo em um documento de kickoff que serve como contrato da semana:

```yaml
kickoff_summary:
  week_of: "{{date_range}}"
  theme: "{{big_idea}}"

  one_line_pitch: "{{em 1 frase, o que esta semana vai produzir}}"

  content_pipeline:
    input: "Queue items + curated consumption"
    synthesis: "Big Idea: {{name}}"
    output:
      - "1 newsletter ({{working_title}})"
      - "1 YouTube video"
      - "1 blog post"
      - "7 tweets + 2 threads"
      - "1 carousel"
      - "3 short-form clips"

  business_integration:
    offer_mentioned: "{{offer}}"
    cta: "{{call to action}}"
    funnel_stage: "{{stage}}"

  sovereignty_alignment: "{{como este conteúdo aumenta soberania}}"

  agent_roster:
    - agent: koe-coletor
      phase: "Fill"
      days: "Mon-Tue"
    - agent: koe-sintetizador
      phase: "Empty/Synthesize"
      days: "Wed"
    - agent: koe-arquiteto
      phase: "Use/Create"
      days: "Thu"
    - agent: koe-distribuidor
      phase: "Distribute"
      days: "Fri"
    - agent: koe-chief
      phase: "Review"
      days: "Weekend"
```

---

## Input Required
```yaml
kickoff_input:
  week_start_date: ""          # YYYY-MM-DD
  queue_state: ""              # reference to current queue or ask koe-coletor
  theme_preference: ""         # optional — user can suggest theme
  business_priority: ""        # optional — specific business goal for the week
  time_available: ""           # hours available for content this week
  platforms_active: []         # which platforms to target
  offer_to_promote: ""         # optional — specific offer to weave in
```

## Output Template
```yaml
pipeline_kickoff_result:
  task_id: KOE_CHIEF_005
  timestamp: "{{ISO_TIMESTAMP}}"

  week: "{{date_range}}"
  theme:
    big_idea: "{{concept}}"
    working_title: "{{title}}"
    angle: "{{perspective}}"
    domains: ["{{domain1}}", "{{domain2}}"]

  content_plan:
    newsletter: { due: "{{day}}", assigned: "koe-arquiteto" }
    youtube: { due: "{{day}}", assigned: "koe-arquiteto" }
    blog: { due: "{{day}}", assigned: "koe-arquiteto" }
    social: { count: "{{N}}", assigned: "koe-distribuidor" }
    short_form: { count: "{{N}}", assigned: "koe-distribuidor" }

  agent_schedule:
    - { agent: "koe-coletor", phase: "Fill", days: "{{days}}" }
    - { agent: "koe-sintetizador", phase: "Synthesize", days: "{{days}}" }
    - { agent: "koe-arquiteto", phase: "Create", days: "{{days}}" }
    - { agent: "koe-distribuidor", phase: "Distribute", days: "{{days}}" }

  business_integration:
    offer: "{{offer}}"
    cta: "{{cta}}"
    funnel_stage: "{{stage}}"

  status: "kickoff_complete"
  next_action: "koe-coletor starts Fill phase"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Tema central selecionado com base em critérios objetivos (não aleatório)
  - [ ] Big Idea tem potencial cross-domain (2+ domínios conectados)
  - [ ] Todos os 4 agentes Tier 1 têm assignments claros
  - [ ] Timeline é realista para o tempo disponível do criador
  - [ ] Content Cascade completo planejado (newsletter + social + video)
  - [ ] Business integration definida (oferta + CTA + estágio do funil)
  - [ ] Sovereignty alignment verificado (conteúdo aumenta soberania)
  - [ ] Kickoff summary gerado em formato padronizado
  - [ ] Alternativas de tema foram documentadas para semanas futuras
```

## Handoff
After completion: → koe-coletor for Fill Phase (curated consumption + idea capture around the weekly theme)

---
*Task: KOE_CHIEF_005 | Agent: koe-chief | Version: 1.0*
