# digital-renaissance-audit

## Metadata
```yaml
task_id: KOE_SIN_006
agent: koe-sintetizador
type: validation
complexity: medium
estimated_time: 30min
source: "Dan Koe — Digital Renaissance Framework + The Art of Focus + Modern Mastery"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-voice-dna.yaml
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
  tasks:
    - KOE_COL_003  # tag analytics for domain distribution
    - KOE_SIN_005  # pattern recognition for cross-pollination data
```

## Purpose
Auditar a diversidade de domínios do criador e a efetividade da cross-pollination entre eles, validando se o criador está praticando o Digital Renaissance ou caindo na armadilha da monocultura intelectual.

> "The Digital Renaissance is not about knowing a little about everything. It's about knowing enough about several things to see what nobody else can see. It's the intersection that creates the innovation — and most people are too specialized to ever get there." — Dan Koe

## Context
O Digital Renaissance é a filosofia central de Dan Koe sobre criação de conteúdo e negócios: ser um polímata moderno que conecta múltiplos domínios para criar insights originais. O oposto é a monocultura intelectual — saber muito sobre 1 coisa e nada sobre o resto.

Este audit avalia:
1. **Breadth** — Quantos domínios o criador realmente explora?
2. **Depth** — Tem profundidade suficiente em cada domínio para sintetizar?
3. **Cross-Pollination** — Está efetivamente conectando domínios ou são silos?
4. **Balance** — A distribuição é saudável ou tem viés excessivo?
5. **Evolution** — Os domínios estão crescendo ou estagnados?

Um criador Digital Renaissance saudável deve ter:
- 2-3 domínios de profundidade forte (core domains)
- 3-5 domínios de profundidade moderada (supporting domains)
- Atividade de cross-pollination regular (conexões entre domínios)
- Exploração de 1-2 novos domínios por trimestre (growth)

---

## Steps

### STEP 1: Mapear Domínios Atuais
Inventariar todos os domínios que o criador explora:

```yaml
domain_inventory:
  data_sources:
    - "Tag analytics de KOE_COL_003 (distribuição de domain tags)"
    - "Conteúdo publicado nos últimos 90 dias"
    - "Queue items dos últimos 30 dias"
    - "Fontes consumidas (livros, podcasts, courses)"
    - "Experiência profissional e pessoal"

  domain_map:
    core_domains:  # profundidade forte, presença constante
      - domain: "{{domain}}"
        depth: "{{1-10}}"
        activity: "{{1-10 — quão ativo nos últimos 30 dias}}"
        content_produced: "{{N pieces nos últimos 90 dias}}"
        expertise_source: "{{study|experience|both}}"

    supporting_domains:  # profundidade moderada, presença regular
      - domain: "{{domain}}"
        depth: "{{1-10}}"
        activity: "{{1-10}}"
        content_produced: "{{N}}"
        expertise_source: "{{study|experience|both}}"

    exploration_domains:  # profundidade superficial, curiosidade
      - domain: "{{domain}}"
        depth: "{{1-10}}"
        activity: "{{1-10}}"
        status: "{{exploring|abandoned|growing}}"

    absent_domains:  # domínios relevantes mas não explorados
      - domain: "{{domain}}"
        relevance: "{{why it might be valuable}}"
        barrier: "{{why not exploring}}"

  total_domains:
    core: "{{N}}"
    supporting: "{{N}}"
    exploration: "{{N}}"
    total_active: "{{N}}"
```

### STEP 2: Avaliar Cross-Pollination
Medir quão efetivamente os domínios estão sendo conectados:

```yaml
cross_pollination_assessment:
  connection_matrix:
    description: "Para cada par de domínios, quantas conexões foram feitas?"
    matrix:
      # domain_a × domain_b → connection count
      "{{d1}} × {{d2}}": "{{N connections}}"
      "{{d1}} × {{d3}}": "{{N connections}}"
      # ... all pairs

  pollination_metrics:
    total_connections_made: "{{N}}"
    unique_pairs_connected: "{{N}}"
    possible_pairs: "{{N choose 2}}"
    pollination_rate: "{{unique_pairs / possible_pairs * 100}}%"

    most_connected_pair:
      domains: ["{{d1}}", "{{d2}}"]
      connections: "{{N}}"
      example: "{{best cross-domain insight from this pair}}"

    least_connected_pair:
      domains: ["{{d1}}", "{{d2}}"]
      connections: "{{N}}"
      opportunity: "{{what could be synthesized}}"

    orphan_domains:
      description: "Domínios sem conexão com nenhum outro"
      domains: ["{{domain}}"]
      risk: "Domínio isolado = conhecimento sem leverage"

  synthesis_output_quality:
    big_ideas_generated_90_days: "{{N}}"
    frameworks_named_90_days: "{{N}}"
    cross_domain_content_pieces: "{{N}}"
    average_iceberg_score: "{{N}}"
```

### STEP 3: Diagnosticar Saúde do Digital Renaissance
Classificar o estado atual:

```yaml
renaissance_health:
  dimensions:
    breadth:
      score: "{{1-10}}"
      assessment:
        1_3: "Monocultura — 1-2 domínios apenas. Risco alto de conteúdo genérico."
        4_6: "Diversidade limitada — precisa explorar mais domínios."
        7_8: "Boa diversidade — multiple active domains."
        9_10: "Excelente — verdadeiro polímata com múltiplas lentes."

    depth:
      score: "{{1-10}}"
      assessment:
        1_3: "Superficial em tudo — 'mile wide, inch deep'. Precisa de foco."
        4_6: "Profundidade desigual — alguns domínios rasos demais."
        7_8: "Boa profundidade nos core domains."
        9_10: "Profundidade excepcional — expert em múltiplos domínios."

    cross_pollination:
      score: "{{1-10}}"
      assessment:
        1_3: "Silos — domínios não se conectam. Perde o valor do polímata."
        4_6: "Conexões esporádicas — potencial não realizado."
        7_8: "Conexões regulares — Big Ideas emergindo."
        9_10: "Síntese masterful — cada domínio enriquece os outros."

    balance:
      score: "{{1-10}}"
      assessment:
        1_3: "Altamente enviesado — 80%+ em 1 domínio."
        4_6: "Desbalanceado — 2-3 domínios dominam excessivamente."
        7_8: "Equilibrado — core domains fortes sem negligenciar supporting."
        9_10: "Perfeitamente balanceado — como a própria Digital Renaissance."

    evolution:
      score: "{{1-10}}"
      assessment:
        1_3: "Estagnado — mesmos domínios há 6+ meses sem novos."
        4_6: "Evolução lenta — novos domínios a cada 6 meses."
        7_8: "Evolução saudável — explorando 1-2 novos por trimestre."
        9_10: "Evolução dinâmica — constantemente expandindo horizontes."

  overall_renaissance_score: "{{média das 5 dimensões}}"

  classification:
    1_3: "SPECIALIST TRAP — Precisa urgentemente diversificar"
    4_5: "EMERGING RENAISSANCE — No caminho mas precisa de mais"
    6_7: "ACTIVE RENAISSANCE — Praticando bem, com espaço para crescer"
    8_10: "FULL RENAISSANCE — Operando como verdadeiro polímata moderno"
```

### STEP 4: Gerar Plano de Melhoria
Para cada dimensão abaixo de 7:

```yaml
improvement_plan:
  breadth_improvements:
    if_low:
      immediate: "Escolher 1 novo domínio para explorar esta semana"
      domains_suggested:
        - "{{domain based on existing interests that's unexplored}}"
        - "{{domain that would complement existing core}}"
      method: "1 livro + 3 podcasts + 5 artigos no novo domínio"

  depth_improvements:
    if_low:
      immediate: "Identificar domínio mais raso e investir 2 semanas aprofundando"
      method: "Livro técnico/acadêmico + prática + escrita sobre o tema"
      warning: "Não abandonar breadth para ganhar depth — balancear"

  cross_pollination_improvements:
    if_low:
      immediate: "Forçar 3 conexões cross-domain esta semana usando KOE_SIN_001"
      method: "Pegar top idea de Domain A + top idea de Domain B → sintetizar"
      exercise: "Daily cross-domain question: 'Como [conceito de A] se aplica em [domínio B]?'"

  balance_improvements:
    if_low:
      immediate: "Reduzir consumo do domínio dominante em 30%"
      method: "Substituir 30% do tempo de consumo com domínios subrepresentados"
      curated_consumption: "KOE_COL_004 focado em domínios negligenciados"

  evolution_improvements:
    if_low:
      immediate: "Escolher 1 domínio completamente fora da zona de conforto"
      method: "Commitment mínimo: 30 dias de exploração, depois avaliar"
      examples:
        - "Se é tech-focused: explorar arte/filosofia"
        - "Se é business-focused: explorar ciência/natureza"
        - "Se é creative: explorar economia/dados"
```

### STEP 5: Definir Metas para Próximo Trimestre
Estabelecer targets mensuráveis:

```yaml
quarterly_targets:
  breadth:
    current: "{{N domains}}"
    target: "{{N+1 or N+2}}"
    new_domain_to_explore: "{{domain}}"

  depth:
    current_weakest: "{{domain at depth X}}"
    target: "{{depth Y}}"
    investment: "{{specific resources}}"

  cross_pollination:
    current_rate: "{{%}}"
    target_rate: "{{%}}"
    target_connections: "{{N new cross-domain connections}}"
    target_big_ideas: "{{N Big Ideas from synthesis}}"

  content_goals:
    cross_domain_pieces: "{{N content pieces that cross 2+ domains}}"
    new_frameworks_named: "{{N}}"
    iceberg_average_target: "{{score}}"

  check_in_date: "{{date — 90 days from now}}"
  audit_recurrence: "quarterly"
```

---

## Input Required
```yaml
audit_input:
  tag_analytics: ""            # reference to KOE_COL_003 output
  pattern_scan: ""             # reference to KOE_SIN_005 output
  content_published_90_days: "" # list or reference to published content
  consumption_log: ""          # what was consumed recently (books, podcasts, etc.)
  time_period: ""              # 30_days | 90_days | 180_days
```

## Output Template
```yaml
audit_result:
  task_id: KOE_SIN_006
  timestamp: "{{ISO_TIMESTAMP}}"

  domain_map:
    core: [{ domain: "{{d}}", depth: "{{N}}" }]
    supporting: [{ domain: "{{d}}", depth: "{{N}}" }]
    exploration: [{ domain: "{{d}}", status: "{{status}}" }]
    total_active: "{{N}}"

  renaissance_scores:
    breadth: "{{1-10}}"
    depth: "{{1-10}}"
    cross_pollination: "{{1-10}}"
    balance: "{{1-10}}"
    evolution: "{{1-10}}"
    overall: "{{1-10}}"

  classification: "{{SPECIALIST_TRAP|EMERGING|ACTIVE|FULL}}"

  cross_pollination:
    total_connections: "{{N}}"
    pollination_rate: "{{%}}"
    most_connected: "{{pair}}"
    orphan_domains: ["{{domain}}"]

  improvements:
    priority_1: { dimension: "{{dim}}", action: "{{action}}" }
    priority_2: { dimension: "{{dim}}", action: "{{action}}" }

  quarterly_targets:
    new_domain: "{{domain}}"
    connections_target: "{{N}}"
    big_ideas_target: "{{N}}"
    next_audit: "{{date}}"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Domain inventory completo (core + supporting + exploration + absent)
  - [ ] Cross-pollination matrix construída com dados reais
  - [ ] Todas as 5 dimensões scored com justificativa
  - [ ] Classification corresponde ao overall score
  - [ ] Plano de melhoria gerado para dimensões abaixo de 7
  - [ ] Metas trimestrais definidas com métricas mensuráveis
  - [ ] Recomendações são específicas (não genéricas)
  - [ ] Audit é honesto (não inflou scores para parecer melhor)
  - [ ] Conexão com KOE_COL_004 (consumo curado) para domínios a melhorar
  - [ ] Data de próximo audit definida (cadência trimestral)
```

## Handoff
After completion: → koe-chief (para informar pipeline strategy com base na saúde do Digital Renaissance) e → koe-coletor (KOE_COL_004 para consumo curado nos domínios que precisam de reforço)

---
*Task: KOE_SIN_006 | Agent: koe-sintetizador | Version: 1.0*
