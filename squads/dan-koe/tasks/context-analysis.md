# context-analysis

## Metadata
```yaml
task_id: KOE_CHIEF_003
agent: koe-chief
type: diagnosis
complexity: medium
estimated_time: 20min
source: "Dan Koe — The Art of Focus + Digital Economics + Modern Mastery"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-voice-dna.yaml
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
  tasks:
    - KOE_CHIEF_001  # pode ser chamado após diagnóstico inicial
    - KOE_CHIEF_004  # sovereignty check integrado
```

## Purpose
Análise profunda do contexto do usuário — estágio do negócio, objetivos, blockers, recursos disponíveis — para informar decisões de roteamento e priorização com máxima precisão.

> "You can't solve a problem you don't understand. And most people don't understand their problem because they've never sat down and mapped it. They react to symptoms instead of addressing root causes." — Dan Koe

## Context
Enquanto KOE_CHIEF_001 faz triagem rápida e KOE_CHIEF_002 roteia intenções claras, o Context Analysis é a investigação profunda. É usado quando:

1. O diagnóstico inicial revelou complexidade (múltiplos problemas interligados)
2. O usuário está em transição de fase (ex: de emprego para negócio próprio)
3. Existe conflito entre o que o usuário quer e o que precisa
4. A dor declarada pode ser sintoma de uma causa raiz mais profunda

Dan Koe frequentemente diz que a maioria dos criadores está resolvendo o problema errado. Este task existe para garantir que o Koe Squad resolva o problema CERTO.

A análise de contexto é inspirada no modelo de Dan Koe de "zoom out" — ver o sistema inteiro antes de otimizar uma parte.

---

## Steps

### STEP 1: Mapear o Ecossistema do Criador
Coletar informações detalhadas sobre todas as dimensões do negócio/vida criativa:

```yaml
ecosystem_map:
  identity:
    skills_inventory:
      - skill: ""
        proficiency: ""  # beginner | intermediate | advanced | expert
        monetizable: ""  # yes | no | potential
    domains_of_interest:
      - domain: ""
        depth: ""  # surface | moderate | deep
        content_potential: ""  # low | medium | high
    unique_experiences: []
    anti_vision: ""  # o que o usuário NÃO quer ser/fazer (Polarity Principle)

  business:
    current_revenue: ""  # range or exact
    revenue_sources:
      - source: ""
        percentage: ""
        stability: ""  # volatile | moderate | stable
    products_services:
      - name: ""
        type: ""  # digital | service | physical
        price_range: ""
        satisfaction: ""  # 1-10
    business_model: ""  # freelance | creator | saas | coaching | hybrid

  audience:
    platforms:
      - platform: ""
        followers: ""
        engagement_rate: ""
        growth_trend: ""  # declining | stagnant | growing | accelerating
    email_list_size: ""
    community: ""  # none | small | active | thriving
    ideal_customer_clarity: ""  # vague | emerging | clear | crystallized

  content:
    publishing_frequency: ""
    content_types: []  # newsletter | youtube | twitter | blog | podcast
    content_quality_self_assessment: ""  # 1-10
    biggest_content_challenge: ""
    has_queue_system: ""  # yes | no | improvised

  resources:
    time_available_weekly: ""  # hours
    budget_for_tools: ""
    team: ""  # solo | VA | small_team
    energy_level: ""  # depleted | low | moderate | high | peak
```

### STEP 2: Identificar Gaps e Contradições
Analisar o ecossistema para encontrar:

**Gaps (o que falta):**
- Skill gap: tem a ideia mas não a habilidade para executar
- Audience gap: tem o produto mas não o tráfego
- Offer gap: tem a audiência mas não a oferta
- System gap: tem tudo mas não tem sistemas (queima de energia)

**Contradições (o que não bate):**
- Quer liberdade mas está construindo algo que exige mais tempo
- Quer escala mas se recusa a delegar/automatizar
- Quer autoridade mas não publica consistentemente
- Quer monetizar mas tem aversão a vender

```yaml
gap_analysis:
  identified_gaps:
    - type: "{{skill|audience|offer|system}}"
      description: ""
      severity: ""  # critical | significant | minor
      blocking: ""  # yes | no

  contradictions:
    - stated_goal: ""
      current_behavior: ""
      tension_level: ""  # low | medium | high
      requires_resolution: ""  # yes | no
```

### STEP 3: Mapear Através do Traffic + Offers Framework
Posicionar o usuário na matriz expandida de Dan Koe:

```yaml
traffic_offers_deep_analysis:
  traffic_dimension:
    volume: ""  # quantas pessoas veem seu conteúdo
    quality: ""  # são as pessoas certas?
    consistency: ""  # é previsível ou errático?
    growth_engine: ""  # organic | paid | referral | none
    bottleneck: ""  # o que impede mais traffic

  offers_dimension:
    exists: ""  # yes | no
    irresistibility: ""  # 1-10 (does it sell itself?)
    risk_reversal: ""  # none | weak | strong | iron-clad
    value_clarity: ""  # 1-10 (can they see the transformation?)
    price_alignment: ""  # underpriced | fair | premium | overpriced
    bottleneck: ""  # o que impede mais conversão

  intersection_diagnosis:
    equation_balance: ""  # traffic-heavy | offer-heavy | balanced | both-weak
    primary_lever: ""  # qual lado melhorar primeiro para máximo impacto
    estimated_impact: ""  # o que acontece se resolver o primary lever
```

### STEP 4: Aplicar Sovereignty Filter
Verificar se os objetivos do usuário alinham com soberania (princípio central de Dan Koe):

```yaml
sovereignty_filter:
  time_sovereignty:
    current: ""  # 1-10
    trajectory: ""  # improving | stagnant | declining
    key_constraint: ""

  creative_sovereignty:
    current: ""  # 1-10
    creates_what_they_want: ""  # yes | partially | no
    external_pressure: ""  # none | some | heavy

  financial_sovereignty:
    current: ""  # 1-10
    single_point_of_failure: ""  # yes | no
    diversification: ""  # none | low | moderate | high

  location_sovereignty:
    current: ""  # 1-10
    location_dependent: ""  # yes | partially | no

  relationship_sovereignty:
    current: ""  # 1-10
    toxic_dependencies: ""  # yes | no
    support_system: ""  # weak | moderate | strong

  overall_sovereignty_score: ""  # average of 5 dimensions
  sovereignty_trajectory: ""  # are they moving toward or away from sovereignty?
```

### STEP 5: Gerar Mapa de Prioridades
Com toda a análise, gerar um mapa de prioridades claro:

**Regras de priorização (inspiradas em Dan Koe):**
1. Resolver contradições antes de gaps (contradição = freio ativo)
2. Resolver bloqueios críticos antes de otimizações
3. Sovereignty > Revenue no longo prazo
4. Um passo de cada vez — radical simplicity
5. O passo certo no momento certo > muitos passos ao mesmo tempo

```yaml
priority_map:
  immediate_action:
    what: ""
    why: ""
    agent: "koe-{{agent}}"
    task: "KOE_{{ID}}"
    expected_time: ""

  next_30_days:
    - priority: 1
      action: ""
      agent: "koe-{{agent}}"
    - priority: 2
      action: ""
      agent: "koe-{{agent}}"
    - priority: 3
      action: ""
      agent: "koe-{{agent}}"

  avoid_now:
    - action: ""
      reason: "{{why this would be premature}}"
```

---

## Input Required
```yaml
context_input:
  user_name: ""
  trigger: ""                  # what prompted this deep analysis
  prior_diagnostic: ""         # reference to KOE_CHIEF_001 result if exists
  session_history: ""          # any prior interactions in this session
  self_description: ""         # how the user describes themselves
  stated_goals:
    short_term: ""             # next 30 days
    medium_term: ""            # next 6 months
    long_term: ""              # next 2-3 years
  biggest_frustration: ""      # the thing keeping them up at night
  resources_available:
    time_weekly_hours: ""
    budget_monthly: ""
    existing_assets: []        # courses, audience, email list, etc.
```

## Output Template
```yaml
context_analysis_result:
  task_id: KOE_CHIEF_003
  timestamp: "{{ISO_TIMESTAMP}}"
  analyst: koe-chief

  ecosystem_summary:
    one_sentence: "{{criador em fase X com Y como principal blocker}}"
    stage: "{{1-5}}"
    stage_name: "{{Fundação|Construção|Otimização|Escala|Soberania}}"

  traffic_offers_position:
    traffic: "{{zero|low|medium|high}}"
    offers: "{{none|weak|decent|strong}}"
    primary_lever: "{{traffic|offers}}"

  gaps_identified:
    - type: "{{type}}"
      severity: "{{severity}}"
      description: "{{description}}"

  contradictions_identified:
    - goal_vs_behavior: "{{description}}"
      resolution_needed: "{{yes|no}}"

  sovereignty_score:
    time: "{{1-10}}"
    creative: "{{1-10}}"
    financial: "{{1-10}}"
    location: "{{1-10}}"
    relationship: "{{1-10}}"
    overall: "{{1-10}}"
    trajectory: "{{toward|away}}"

  priority_map:
    immediate:
      action: "{{description}}"
      agent: "koe-{{agent}}"
      task: "KOE_{{ID}}"
    next_30_days:
      - "{{priority 1}}"
      - "{{priority 2}}"
      - "{{priority 3}}"
    avoid_now:
      - "{{what to avoid and why}}"

  routing_recommendation:
    primary_agent: "koe-{{agent}}"
    primary_task: "KOE_{{ID}}"
    reasoning: "{{detailed reasoning}}"
    sequence: ["koe-{{agent1}}", "koe-{{agent2}}", "koe-{{agent3}}"]
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Ecossistema mapeado com pelo menos 3 das 5 dimensões preenchidas
  - [ ] Pelo menos 1 gap identificado com severidade classificada
  - [ ] Contradições analisadas (mesmo que nenhuma encontrada)
  - [ ] Traffic + Offers posicionamento definido com primary lever
  - [ ] Sovereignty Score calculado (5 dimensões)
  - [ ] Priority Map gerado com ação imediata + próximos 30 dias
  - [ ] Mapa inclui "avoid_now" (o que NÃO fazer)
  - [ ] Routing recommendation é coerente com a análise
  - [ ] Tempo de execução dentro do estimado (20min)
  - [ ] Nenhuma violação de immune system
```

## Handoff
After completion: → koe-[primary-agent] for immediate action, with full context analysis package attached

---
*Task: KOE_CHIEF_003 | Agent: koe-chief | Version: 1.0*
