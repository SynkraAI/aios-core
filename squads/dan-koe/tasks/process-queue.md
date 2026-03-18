# process-queue

## Metadata
```yaml
task_id: KOE_COL_002
agent: koe-coletor
type: implementation
complexity: medium
estimated_time: 30min
source: "Dan Koe — The Queue System + Modern Mastery"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-voice-dna.yaml
  tasks:
    - KOE_COL_001  # ideas must be captured first
    - KOE_COL_003  # tagging system used during processing
```

## Purpose
Processar a queue inteira: classificar signal strength, aplicar tags definitivos, identificar padrões, arquivar noise, e preparar ideias de alto sinal para síntese.

> "Your queue is not a to-do list. It's a creativity filter. Most ideas are noise. Your job is to find the signal — the 10% that can become something real." — Dan Koe

## Context
Dan Koe recomenda processar a queue regularmente — idealmente diário (5min scan) e semanalmente (30min deep processing). Ideias que ficam mais de 7 dias na queue sem desenvolvimento devem ser avaliadas: ou são promoted para desenvolvimento, ou são archived.

O processamento da queue é onde o Coletor separa signal de noise. Uma queue com 50 ideias brutas deve resultar em:
- 5-8 ideias de alto sinal (signal >= 7) prontas para síntese
- 10-15 ideias de sinal médio (signal 4-6) para marinar mais
- 25-35 ideias de baixo sinal (signal <= 3) para arquivamento

A regra de ouro: nunca deletar, sempre arquivar. Ideias arquivadas podem ressurgir meses depois com relevância renovada (ver KOE_COL_006).

---

## Steps

### STEP 1: Queue Census
Fazer inventário completo da queue atual:

```yaml
queue_census:
  total_items: "{{N}}"
  by_status:
    captured: "{{N}}"       # ideias brutas não processadas
    processing: "{{N}}"     # em avaliação
    developed: "{{N}}"      # já trabalhadas
    archived: "{{N}}"       # guardadas mas inativas
  by_age:
    today: "{{N}}"
    last_3_days: "{{N}}"
    last_7_days: "{{N}}"
    over_7_days: "{{N}}"    # ALERTA: estas precisam de decisão
  by_signal:
    high_8_10: "{{N}}"
    medium_4_7: "{{N}}"
    low_1_3: "{{N}}"
    unscored: "{{N}}"       # capturadas sem signal assessment
  by_domain:
    # contagem por domain tag
```

### STEP 2: Processar Ideias Não-Scored
Para cada ideia sem signal strength, aplicar avaliação completa:

```yaml
scoring_process:
  for_each_unscored_idea:
    step_1: "Reler a ideia bruta com olhos frescos"
    step_2: "Avaliar os 5 critérios de signal strength (KOE_COL_001)"
    step_3: "Calcular score composto"
    step_4: "Atribuir tags definitivos se ainda não tiver"
    step_5: "Registrar connected_to se perceber conexão"

  batch_efficiency:
    tip: "Processar em lotes de 10 — mantém foco sem fadiga de decisão"
    time_per_idea: "1-2 minutos"
    break_after: "10 ideias → pausa de 2 minutos"
```

### STEP 3: Aplicar Regra dos 7 Dias
Ideias com mais de 7 dias na queue precisam de decisão:

```yaml
seven_day_rule:
  evaluation:
    question_1: "Essa ideia ainda me excita quando releio?"
    question_2: "Eu pensaria nela se não estivesse na queue?"
    question_3: "Ela se conecta com algo que estou desenvolvendo agora?"

  decisions:
    promote:
      condition: "2+ perguntas respondidas com 'sim'"
      action: "Aumentar signal strength, marcar como 'ready_for_synthesis'"
      handoff: "→ koe-sintetizador"

    marinate:
      condition: "1 pergunta respondida com 'sim'"
      action: "Resetar timer para +3 dias, adicionar nota de contexto"
      max_marinates: 2  # após 2 extensões, decidir definitivamente

    archive:
      condition: "0 perguntas respondidas com 'sim'"
      action: "Mover para arquivo com tags preservados"
      note: "NUNCA deletar — ideias arquivadas podem ressurgir"
```

### STEP 4: Identificar Clusters e Padrões
Procurar agrupamentos naturais entre ideias:

```yaml
pattern_detection:
  cluster_criteria:
    minimum_size: 3  # precisa de 3+ ideias para ser cluster
    connection_types:
      - "Mesmo domínio + tema similar"
      - "Domínios diferentes + insight complementar"
      - "Mesma emoção/reação em contextos diferentes"
      - "Contra-narrativa ao consenso (padrão contrarian)"

  cluster_analysis:
    for_each_cluster:
      - "Nomear o cluster provisoriamente"
      - "Identificar a ideia âncora (maior signal strength)"
      - "Avaliar se o cluster sugere uma Big Idea"
      - "Se sim: criar referência cruzada e sinalizar para koe-sintetizador"

  examples:
    cluster_1:
      name: "The Simplicity Premium"
      ideas:
        - "Q-2026-01-15-003: Empresas simples crescem mais rápido"
        - "Q-2026-01-17-001: Minimalismo como vantagem competitiva"
        - "Q-2026-01-18-005: Apple cobra mais por fazer MENOS"
      big_idea_potential: "Simplicidade é a nova moeda de valor na economia digital"

    cluster_2:
      name: "The Creator's Paradox"
      ideas:
        - "Q-2026-01-16-002: Quanto mais crio, mais ideias tenho"
        - "Q-2026-01-17-004: Bloqueio criativo é myth — é bloqueio de consumo"
        - "Q-2026-01-19-001: Output gera input (loop virtuoso)"
      big_idea_potential: "Criatividade não é recurso finito — é músculo com retorno crescente"
```

### STEP 5: Gerar Queue Health Report
Produzir relatório de saúde da queue:

```yaml
health_report:
  date: "{{ISO_DATE}}"

  summary:
    total_processed: "{{N}}"
    promoted_to_synthesis: "{{N}}"
    marinating: "{{N}}"
    archived: "{{N}}"
    clusters_identified: "{{N}}"

  signal_distribution:
    high_8_10: "{{N}} ({{%}})"
    medium_4_7: "{{N}} ({{%}})"
    low_1_3: "{{N}} ({{%}})"

  domain_diversity:
    domains_active: ["{{domain1}}", "{{domain2}}", "{{domain3}}"]
    diversity_score: "{{1-10}}"
    underrepresented_domains: ["{{domain}}"]
    recommendation: "{{consume more from X domain}}"

  pipeline_readiness:
    ideas_ready_for_synthesis: "{{N}}"
    big_idea_candidates: "{{N}}"
    clusters_forming: "{{N}}"
    next_newsletter_candidates:
      - "{{idea 1 — signal X}}"
      - "{{idea 2 — signal X}}"
      - "{{idea 3 — signal X}}"

  alerts:
    stale_ideas: "{{N}} ideias com 7+ dias sem ação"
    empty_domains: "{{domains sem ideias recentes}}"
    noise_ratio: "{{%}} da queue é noise (signal <= 3)"

  recommendations:
    fill_needed: "{{yes/no — should koe-coletor run KOE_COL_004?}}"
    synthesis_ready: "{{yes/no — should koe-sintetizador run KOE_SIN_001?}}"
    archive_review_due: "{{yes/no — should koe-coletor run KOE_COL_006?}}"
```

### STEP 6: Executar Handoffs
Distribuir resultados para agentes relevantes:

```yaml
handoffs:
  to_sintetizador:
    condition: "ideias com signal >= 8 ou clusters com Big Idea potential"
    package:
      ideas: ["{{Q-ids}}"]
      clusters: ["{{cluster_names}}"]
      recommended_task: "KOE_SIN_001 ou KOE_SIN_004"

  to_chief:
    condition: "pipeline_readiness para informar kickoff semanal"
    package:
      health_report: "{{full report}}"
      top_candidates: ["{{idea1}}", "{{idea2}}", "{{idea3}}"]
      recommended_theme: "{{suggested weekly theme}}"

  self_tasks:
    condition: "fill_needed ou archive_review_due"
    tasks:
      - "KOE_COL_004 (curated consumption) se fill_needed"
      - "KOE_COL_006 (archive review) se archive_review_due"
```

---

## Input Required
```yaml
process_input:
  queue_location: ""          # path to queue data or reference
  processing_depth: ""        # quick_scan (5min) | standard (30min) | deep (60min)
  focus_domain: ""            # optional — process only ideas from specific domain
  week_theme: ""              # optional — if weekly theme set, prioritize related ideas
```

## Output Template
```yaml
process_result:
  task_id: KOE_COL_002
  timestamp: "{{ISO_TIMESTAMP}}"

  census:
    total: "{{N}}"
    processed: "{{N}}"
    promoted: "{{N}}"
    archived: "{{N}}"
    marinating: "{{N}}"

  clusters:
    - name: "{{cluster_name}}"
      size: "{{N}}"
      anchor_idea: "Q-{{id}}"
      big_idea_potential: "{{description}}"

  health:
    signal_high: "{{N}}"
    domain_diversity: "{{1-10}}"
    noise_ratio: "{{%}}"
    pipeline_readiness: "{{ready|needs_fill|needs_synthesis}}"

  handoffs:
    to_sintetizador: { ideas: "{{N}}", clusters: "{{N}}" }
    to_chief: { report: true, top_3: ["{{id1}}", "{{id2}}", "{{id3}}"] }

  next_processing: "{{recommended date}}"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Census completo antes de iniciar processamento
  - [ ] Todas ideias unscored receberam signal strength
  - [ ] Regra dos 7 dias aplicada (nenhuma ideia 7+ dias sem decisão)
  - [ ] Clusters identificados (ou confirmado que não existem)
  - [ ] Health report gerado com todas as seções
  - [ ] Handoffs preparados para agentes relevantes
  - [ ] Nenhuma ideia deletada (apenas arquivada)
  - [ ] Domain diversity avaliada com recomendação se necessário
  - [ ] Tempo de processamento dentro do estimado
```

## Handoff
After completion: → koe-sintetizador (com ideias de alto sinal e clusters) e → koe-chief (com health report para pipeline kickoff)

---
*Task: KOE_COL_002 | Agent: koe-coletor | Version: 1.0*
