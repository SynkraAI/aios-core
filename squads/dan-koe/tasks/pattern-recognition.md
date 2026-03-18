# pattern-recognition

## Metadata
```yaml
task_id: KOE_SIN_005
agent: koe-sintetizador
type: diagnosis
complexity: medium
estimated_time: 25min
source: "Dan Koe — Cross-Domain Pattern Recognition + Digital Renaissance"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
  tasks:
    - KOE_COL_002  # processed queue provides inputs
    - KOE_COL_003  # tags enable pattern detection
```

## Purpose
Escanear a queue e inputs do criador para detectar padrões recorrentes entre domínios, identificando temas emergentes e oportunidades de síntese antes que se tornem óbvios.

> "Pattern recognition is the meta-skill. Everything else — writing, business, design — is applied pattern recognition. The person who sees patterns others miss wins the game before it starts." — Dan Koe

## Context
A capacidade de ver padrões onde outros veem ruído é o que Dan Koe chama de "the unfair advantage of the generalist". O especialista vê profundamente em um domínio. O generalista informado vê ENTRE domínios — e é nessa interseção que mora a inovação.

Pattern recognition não é místico. É um processo sistemático:
1. Expor-se a múltiplos domínios (Fill phase)
2. Registrar observações sem julgamento (Queue System)
3. Procurar ativamente por recorrências (este task)
4. Conectar recorrências em insights (KOE_SIN_001)
5. Transformar insights em Big Ideas (KOE_SIN_004)

Este task é o "radar" do sintetizador. Ele não cria — ele DETECTA. A criação vem depois.

---

## Steps

### STEP 1: Definir Escopo do Scan
Determinar o que será escaneado e com qual profundidade:

```yaml
scan_scope:
  data_sources:
    primary:
      - "Queue ativa (todos os items com status 'captured' e 'processing')"
      - "Clusters identificados em KOE_COL_002"
    secondary:
      - "Notas e capturas recentes (últimos 7 dias)"
      - "Conteúdos consumidos na última sessão Fill (KOE_COL_004)"
    tertiary:
      - "Archive (ideias arquivadas nos últimos 30 dias)"
      - "Conteúdos publicados anteriormente (para encontrar temas recorrentes)"

  scan_parameters:
    time_window: "{{7_days|30_days|90_days}}"
    minimum_items: 10  # precisa de pelo menos 10 items para pattern detection
    focus_mode: "{{broad — all domains | narrow — specific domains}}"
```

### STEP 2: Executar Pattern Scan
Aplicar múltiplas lentes de detecção de padrões:

```yaml
pattern_lenses:
  lens_1_frequency:
    description: "O que aparece repetidamente?"
    method: "Contar recorrência de temas, keywords, domínios"
    detection:
      - "Tema X mencionado em 4+ ideias diferentes"
      - "Keyword Y aparece em 3+ domínios distintos"
      - "Mesmo tipo de observação feita em contextos diferentes"
    signal: "Alta frequência = tema importante para o criador (consciente ou não)"
    output:
      - theme: "{{recurring theme}}"
        frequency: "{{N times}}"
        across_domains: ["{{d1}}", "{{d2}}"]
        queue_items: ["Q-{{id1}}", "Q-{{id2}}", "Q-{{id3}}"]

  lens_2_polarity:
    description: "O que provoca reações fortes (positivas OU negativas)?"
    method: "Filtrar por emoção registrada na captura"
    detection:
      - "Ideias que provocaram indignação"
      - "Ideias que provocaram excitação/eureka"
      - "Ideias que provocaram dissonância cognitiva"
    signal: "Reação forte = material para conteúdo contrarian"
    output:
      - observation: "{{what provokes reaction}}"
        polarity: "{{positive|negative|dissonant}}"
        potential: "{{contrarian Big Idea angle}}"

  lens_3_convergence:
    description: "Ideias de domínios diferentes que dizem a mesma coisa?"
    method: "Comparar princípios extraídos de domínios distintos"
    detection:
      - "Psicologia diz X, biologia diz X de outra forma, economia confirma X"
      - "Mesmo insight com vocabulários diferentes"
      - "Pattern universal disfarçado de insight domain-specific"
    signal: "Convergência cross-domain = verdade robusta → Big Idea forte"
    output:
      - universal_pattern: "{{the pattern}}"
        evidence_domains: ["{{d1}}: {{version1}}", "{{d2}}: {{version2}}"]
        synthesis_potential: "{{high|medium|low}}"

  lens_4_contradiction:
    description: "Ideias que contradizem o senso comum ou entre si?"
    method: "Identificar onde as ideias desafiam assumptions"
    detection:
      - "Ideia X contradiz crença popular Y"
      - "Ideia A e Ideia B dizem coisas opostas → paradoxo produtivo"
      - "Expert diz X, experiência mostra NOT-X"
    signal: "Contradição = material provocativo e original"
    output:
      - contradiction: "{{A vs B}}"
        productive_tension: "{{what insight emerges from the tension}}"
        content_angle: "{{provocative angle for content}}"

  lens_5_emergence:
    description: "Que tema está surgindo que não existia 30 dias atrás?"
    method: "Comparar temas atuais com temas de 30 dias atrás"
    detection:
      - "Novo domínio aparecendo na queue"
      - "Novo tipo de pergunta sendo feito"
      - "Novo interesse que não estava no radar"
    signal: "Emergência = evolução do pensamento do criador → autenticidade"
    output:
      - emerging_theme: "{{what's new}}"
        since_when: "{{when it started appearing}}"
        potential: "{{where this might lead}}"

  lens_6_absence:
    description: "O que está faltando? Que padrão DEVERIA existir mas não existe?"
    method: "Procurar gaps na coverage de domínios e temas"
    detection:
      - "Domínio importante sem ideias recentes"
      - "Tema central do criador sem novas perspectivas"
      - "Perguntas da audiência sem resposta no sistema"
    signal: "Ausência intencional ou blind spot? Se blind spot → oportunidade"
    output:
      - absent_pattern: "{{what's missing}}"
        likely_cause: "{{blind_spot|intentional|seasonal}}"
        action: "{{explore|ignore|schedule_fill}}"
```

### STEP 3: Priorizar Padrões Detectados
Ranquear padrões por potencial de Big Idea:

```yaml
pattern_prioritization:
  scoring:
    cross_domain_reach:
      description: "Em quantos domínios o padrão aparece?"
      weight: 0.30
    emotional_charge:
      description: "Quão forte é a reação emocional associada?"
      weight: 0.25
    novelty:
      description: "Quão novo/original é o padrão?"
      weight: 0.20
    audience_relevance:
      description: "A audiência se importaria?"
      weight: 0.15
    actionability:
      description: "Dá para transformar em conteúdo acionável?"
      weight: 0.10

  ranking:
    - rank: 1
      pattern: "{{pattern description}}"
      score: "{{composite}}"
      big_idea_potential: "{{sentence describing potential Big Idea}}"
      recommended_task: "KOE_SIN_001 or KOE_SIN_004"
    # ... top 5 patterns
```

### STEP 4: Mapear Conexões entre Padrões
Verificar se os padrões detectados se conectam entre si:

```yaml
meta_pattern_analysis:
  connections:
    - pattern_a: "{{pattern}}"
      pattern_b: "{{pattern}}"
      connection: "{{how they relate}}"
      meta_insight: "{{what the connection reveals}}"

  meta_pattern:
    description: "O padrão dos padrões — que tema une todos os padrões detectados?"
    hypothesis: "{{meta-pattern description}}"
    implication: "{{what this means for the creator's work}}"

  creative_direction:
    immediate: "{{what to create this week based on patterns}}"
    medium_term: "{{what series/project these patterns suggest}}"
    long_term: "{{what book/course/product these patterns point to}}"
```

### STEP 5: Gerar Pattern Report
Compilar findings em relatório acionável:

```yaml
pattern_report:
  date: "{{ISO_DATE}}"
  analyst: koe-sintetizador
  scan_scope: "{{time_window, N items scanned}}"

  top_patterns:
    - pattern: "{{description}}"
      type: "{{frequency|polarity|convergence|contradiction|emergence|absence}}"
      score: "{{composite}}"
      domains: ["{{d1}}", "{{d2}}"]
      queue_items: ["Q-{{id1}}", "Q-{{id2}}"]
      big_idea_potential: "{{sentence}}"

  meta_pattern: "{{if detected}}"

  recommendations:
    for_sintetizador: "Run KOE_SIN_001 on pattern #{{N}}"
    for_coletor: "Fill session focused on {{domain}} to strengthen pattern #{{N}}"
    for_chief: "This week's theme candidate: {{pattern-based theme}}"

  creative_pipeline:
    ready_for_synthesis: "{{N}} patterns"
    needs_more_data: "{{N}} patterns"
    emerging_watch: "{{N}} patterns to monitor"
```

---

## Input Required
```yaml
recognition_input:
  scan_scope: ""               # broad | narrow
  time_window: ""              # 7_days | 30_days | 90_days
  focus_domains: []            # optional — specific domains to focus on
  queue_reference: ""          # path to queue data
  previous_scan: ""            # optional — reference to last pattern scan for comparison
```

## Output Template
```yaml
recognition_result:
  task_id: KOE_SIN_005
  timestamp: "{{ISO_TIMESTAMP}}"

  scan_summary:
    items_scanned: "{{N}}"
    patterns_detected: "{{N}}"
    lenses_applied: "{{N}}"

  top_patterns:
    - { pattern: "{{desc}}", type: "{{type}}", score: "{{N}}", domains: ["{{d1}}", "{{d2}}"] }
    - { pattern: "{{desc}}", type: "{{type}}", score: "{{N}}", domains: ["{{d1}}", "{{d2}}"] }
    - { pattern: "{{desc}}", type: "{{type}}", score: "{{N}}", domains: ["{{d1}}", "{{d2}}"] }

  meta_pattern: "{{description or none}}"

  recommendations:
    synthesis_ready: ["pattern #{{N}}"]
    fill_needed: ["{{domain}}"]
    weekly_theme_candidate: "{{theme}}"

  next_scan: "{{recommended date}}"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Mínimo 10 items escaneados (sample size adequado)
  - [ ] Pelo menos 4 das 6 lenses aplicadas
  - [ ] Padrões priorizados com scoring composto
  - [ ] Top 3-5 padrões documentados com queue item references
  - [ ] Meta-pattern analysis tentado (mesmo se nenhum encontrado)
  - [ ] Recomendações concretas geradas (para sintetizador, coletor e chief)
  - [ ] Pattern report gerado em formato padronizado
  - [ ] Nenhum padrão forçado (se não existe, documentar ausência)
  - [ ] Comparison com scan anterior se disponível
```

## Handoff
After completion: → koe-sintetizador (KOE_SIN_001/004 para síntese dos padrões mais promissores) e → koe-chief (para informar pipeline kickoff com padrões detectados)

---
*Task: KOE_SIN_005 | Agent: koe-sintetizador | Version: 1.0*
