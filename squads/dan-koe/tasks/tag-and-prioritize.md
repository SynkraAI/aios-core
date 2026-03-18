# tag-and-prioritize

## Metadata
```yaml
task_id: KOE_COL_003
agent: koe-coletor
type: implementation
complexity: low
estimated_time: 15min
source: "Dan Koe — The Queue System + Modern Mastery"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
  tasks:
    - KOE_COL_001  # capture must happen first
```

## Purpose
Aplicar taxonomia de tags e scoring de prioridade a itens da queue, garantindo que cada ideia seja classificável, buscável e priorizável dentro do sistema.

> "A system without categories is a junk drawer. You need to be able to find the right idea at the right time. Tags are how you build a searchable creative mind." — Dan Koe

## Context
O tagging é o sistema nervoso da Queue. Sem tags adequados, a queue vira uma lista linear impossível de navegar. Com tags, ela se torna um mapa multidimensional de ideias que pode ser filtrado por domínio, tipo, urgência, formato e potencial.

Dan Koe não fala explicitamente sobre taxonomia de tags, mas seu sistema implica organização por domínio (cross-domain synthesis requer saber quais domínios estão representados), tipo de conteúdo (tweet vs newsletter vs framework), e urgência (timely vs evergreen).

Este task pode ser executado standalone ou como parte do KOE_COL_002 (process-queue).

A priorização usa um composite score que combina signal strength com urgência e fit estratégico. Isso permite que o pipeline semanal (KOE_CHIEF_005) sempre tenha as melhores ideias no topo.

---

## Steps

### STEP 1: Verificar Taxonomia Atual
Carregar a taxonomia de tags e verificar se está atualizada:

```yaml
tag_taxonomy_v1:
  # DOMAIN TAGS — em qual área do conhecimento
  domains:
    - { tag: "psychology", description: "Comportamento, cognição, motivação, viés" }
    - { tag: "philosophy", description: "Propósito, existência, consciência, valores" }
    - { tag: "business", description: "Monetização, ofertas, mercado, vendas" }
    - { tag: "technology", description: "Ferramentas, AI, automação, plataformas" }
    - { tag: "creativity", description: "Processo criativo, arte, escrita, flow" }
    - { tag: "health", description: "Corpo, energia, sono, exercício, nutrição" }
    - { tag: "relationships", description: "Conexões humanas, networking, comunidade" }
    - { tag: "spirituality", description: "Meditação, transcendência, mindfulness" }
    - { tag: "education", description: "Aprendizado, ensino, pedagogia, cursos" }
    - { tag: "economics", description: "Dinheiro, mercados, valor, precificação" }
    max_per_idea: 3  # máximo 3 domain tags por ideia

  # TYPE TAGS — que tipo de insight é
  content_types:
    - { tag: "observation", description: "Algo notado no mundo" }
    - { tag: "connection", description: "Link entre 2+ ideias/domínios" }
    - { tag: "framework", description: "Estrutura ou modelo emergente" }
    - { tag: "contrarian", description: "Posição contra o consenso" }
    - { tag: "story", description: "Narrativa pessoal ou de terceiros" }
    - { tag: "question", description: "Pergunta que merece exploração profunda" }
    - { tag: "metaphor", description: "Analogia ou metáfora poderosa" }
    - { tag: "data_point", description: "Estatística ou fato surpreendente" }
    - { tag: "principle", description: "Regra ou verdade extraída da experiência" }
    max_per_idea: 2

  # URGENCY TAGS — timing
  urgency:
    - { tag: "timely", description: "Relevante agora por evento/tendência", decay: "7 days" }
    - { tag: "evergreen", description: "Relevante sempre", decay: "none" }
    - { tag: "seasonal", description: "Relevante em certas épocas do ano", decay: "contextual" }
    max_per_idea: 1

  # FORMAT TAGS — em que formato pode virar conteúdo
  format_potential:
    - { tag: "tweet", description: "Cabe em 280 chars" }
    - { tag: "thread", description: "Precisa de 5-10 tweets" }
    - { tag: "newsletter", description: "Merece 2000+ palavras" }
    - { tag: "video", description: "Melhor em formato visual/oral" }
    - { tag: "framework", description: "Pode virar framework nomeado" }
    - { tag: "carousel", description: "Bom para formato visual slide-by-slide" }
    - { tag: "course_module", description: "Material para módulo de curso" }
    max_per_idea: 3

  # STAGE TAGS — estágio de desenvolvimento
  development_stage:
    - { tag: "seed", description: "Ideia bruta, sem desenvolvimento" }
    - { tag: "sprout", description: "Ideia com algum desenvolvimento, precisa de mais" }
    - { tag: "bloom", description: "Ideia desenvolvida, pronta para criação" }
    - { tag: "fruit", description: "Ideia transformada em conteúdo publicado" }
    max_per_idea: 1
```

### STEP 2: Aplicar Tags a Itens Não-Tagueados
Para cada item da queue sem tags completos:

```yaml
tagging_process:
  step_1: "Ler a ideia bruta"
  step_2: "Atribuir domain tags (1-3 domínios)"
  step_3: "Atribuir content type (1-2 tipos)"
  step_4: "Atribuir urgency (1 tipo)"
  step_5: "Avaliar format potential (1-3 formatos)"
  step_6: "Definir development stage"

  rules:
    - "SEMPRE atribuir pelo menos 1 domain tag"
    - "SEMPRE atribuir urgency"
    - "Na dúvida entre 2 domínios, aplicar ambos (cross-domain é valioso)"
    - "Se a ideia parece genérica, provavelmente é — signal baixo"
    - "Tags devem ser da taxonomia existente — não criar tags ad hoc"
```

### STEP 3: Calcular Priority Score
Combinar signal strength com fatores estratégicos para gerar priority score:

```yaml
priority_calculation:
  formula: "priority = (signal_strength * 0.50) + (urgency_factor * 0.20) + (strategic_fit * 0.20) + (development_readiness * 0.10)"

  urgency_factor:
    timely: 10
    seasonal: 5
    evergreen: 3  # evergreen tem valor mas não urgência

  strategic_fit:
    description: "Quão bem a ideia se encaixa no tema semanal ou objetivos atuais"
    scoring:
      0: "Sem relação com prioridades atuais"
      5: "Relação tangencial"
      10: "Diretamente alinhada com tema/objetivo da semana"

  development_readiness:
    description: "Quão pronta está para virar conteúdo"
    scoring:
      seed: 2
      sprout: 5
      bloom: 9
      fruit: 10  # já desenvolvida

  priority_bands:
    A_priority: "score >= 8 — desenvolver AGORA"
    B_priority: "score 5-7.9 — desenvolver esta semana"
    C_priority: "score 3-4.9 — manter na queue, marinar"
    D_priority: "score < 3 — arquivar"
```

### STEP 4: Reordenar Queue por Prioridade
Após scoring, reorganizar a queue:

```yaml
queue_reorder:
  primary_sort: "priority_score DESC"
  secondary_sort: "urgency (timely first)"
  tertiary_sort: "days_in_queue ASC (newer first within same priority)"

  display_format:
    - "🅰️ [P:9.2] Q-2026-02-14-001 | psychology, business | newsletter | timely"
    - "🅰️ [P:8.7] Q-2026-02-13-005 | creativity, philosophy | framework | evergreen"
    - "🅱️ [P:7.1] Q-2026-02-12-003 | technology | tweet | timely"
    - "🅲️ [P:4.5] Q-2026-02-10-008 | health | observation | evergreen"
    - "🅳️ [P:2.1] Q-2026-02-08-002 | relationships | story | evergreen"
```

### STEP 5: Gerar Tag Analytics
Produzir análise da distribuição de tags para informar consumo curado:

```yaml
tag_analytics:
  domain_distribution:
    # quantidade de ideias por domínio
    psychology: "{{N}} ({{%}})"
    business: "{{N}} ({{%}})"
    # ... etc

  content_type_distribution:
    observation: "{{N}}"
    connection: "{{N}}"
    framework: "{{N}}"
    contrarian: "{{N}}"
    # ... etc

  format_demand:
    # quais formatos estão sendo mais demandados pelas ideias
    newsletter_ready: "{{N}}"
    tweet_ready: "{{N}}"
    framework_potential: "{{N}}"

  diversity_health:
    score: "{{1-10}}"
    overrepresented: ["{{domain}}"]
    underrepresented: ["{{domain}}"]
    recommendation: "{{consumir mais de X para balancear}}"

  cross_domain_opportunities:
    pairs_with_most_ideas: [["{{domain1}}", "{{domain2}}"]]
    unexplored_pairs: [["{{domain1}}", "{{domain2}}"]]
    synthesis_candidates: "{{N}} ideias prontas para cross-domain synthesis"
```

---

## Input Required
```yaml
tag_input:
  queue_items: []              # list of queue items to tag (or "all_untagged")
  current_weekly_theme: ""     # optional — for strategic_fit scoring
  current_goals: ""            # optional — for strategic_fit scoring
  taxonomy_version: "v1"       # which taxonomy to use
```

## Output Template
```yaml
tag_result:
  task_id: KOE_COL_003
  timestamp: "{{ISO_TIMESTAMP}}"

  items_processed: "{{N}}"
  items_tagged: "{{N}}"
  items_prioritized: "{{N}}"

  priority_distribution:
    A_priority: "{{N}}"
    B_priority: "{{N}}"
    C_priority: "{{N}}"
    D_priority: "{{N}}"

  top_5_by_priority:
    - { id: "Q-{{id}}", score: "{{score}}", domains: ["{{d1}}"], type: "{{type}}" }
    - { id: "Q-{{id}}", score: "{{score}}", domains: ["{{d1}}"], type: "{{type}}" }
    - { id: "Q-{{id}}", score: "{{score}}", domains: ["{{d1}}"], type: "{{type}}" }
    - { id: "Q-{{id}}", score: "{{score}}", domains: ["{{d1}}"], type: "{{type}}" }
    - { id: "Q-{{id}}", score: "{{score}}", domains: ["{{d1}}"], type: "{{type}}" }

  analytics:
    domain_diversity: "{{1-10}}"
    overrepresented: ["{{domain}}"]
    underrepresented: ["{{domain}}"]
    cross_domain_candidates: "{{N}}"

  recommendations:
    consume_more: ["{{domain}}"]
    ready_for_synthesis: "{{N}} ideas"
    archive_candidates: "{{N}} ideas"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Taxonomia carregada e verificada antes de iniciar
  - [ ] Todos os itens processados receberam pelo menos domain + urgency tags
  - [ ] Priority score calculado com a fórmula completa (4 fatores)
  - [ ] Queue reordenada por prioridade
  - [ ] Tag analytics gerado com diversity score
  - [ ] Nenhum tag inventado fora da taxonomia
  - [ ] Recomendações de consumo geradas para domínios subrepresentados
  - [ ] Cross-domain opportunities identificadas
```

## Handoff
After completion: → koe-coletor (self — para KOE_COL_004 se consumo curado necessário) ou → koe-sintetizador (para KOE_SIN_005 se padrões cross-domain detectados)

---
*Task: KOE_COL_003 | Agent: koe-coletor | Version: 1.0*
