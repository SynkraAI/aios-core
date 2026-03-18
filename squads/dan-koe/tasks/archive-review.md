# archive-review

## Metadata
```yaml
task_id: KOE_COL_006
agent: koe-coletor
type: validation
complexity: medium
estimated_time: 25min
source: "Dan Koe — The Queue System + Modern Mastery"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
  tasks:
    - KOE_COL_002  # queue processing creates the archive
    - KOE_COL_003  # tag system used for analysis
```

## Purpose
Revisão mensal do arquivo de ideias para detectar padrões emergentes, relevância renovada e oportunidades que não existiam quando as ideias foram arquivadas.

> "Ideas have seasons. Something that seemed irrelevant 3 months ago might be exactly what you need today. That's why you archive instead of delete — your past ideas are seeds waiting for the right conditions." — Dan Koe

## Context
O arquivo (archive) é onde ideias de baixo sinal vão quando não sobrevivem ao processamento da queue. Mas "baixo sinal" é relativo ao momento. Uma ideia arquivada em janeiro pode ser explosiva em março por causa de:

1. **Mudança de contexto** — o criador aprendeu algo novo que dá relevância à ideia
2. **Tendência emergente** — o mercado se moveu na direção da ideia
3. **Padrão acumulado** — múltiplas ideias arquivadas formam um cluster que antes não era visível
4. **Experiência pessoal** — o criador viveu algo que dá peso emocional à ideia

Dan Koe implicitamente pratica isso: muitas de suas Big Ideas são combinações de insights que marinaram por meses. O archive review é o mecanismo formal para pescar essas conexões latentes.

A revisão mensal é um ritual — não reativo, mas proativo. Agendado, protegido, tratado como investimento no pipeline criativo.

---

## Steps

### STEP 1: Inventário do Arquivo
Listar todo o conteúdo do arquivo com metadados:

```yaml
archive_inventory:
  total_archived_items: "{{N}}"
  oldest_item: "{{date}}"
  newest_item: "{{date}}"

  by_month_archived:
    "{{YYYY-MM}}": "{{N}} items"
    # ...

  by_original_signal:
    was_low_1_3: "{{N}}"
    was_medium_4_6: "{{N}}"
    was_high_7_10: "{{N}}"  # ideias que eram boas mas não foram desenvolvidas a tempo

  by_domain:
    psychology: "{{N}}"
    business: "{{N}}"
    # ... todas as domain tags

  by_archive_reason:
    low_signal: "{{N}}"
    stale_7_day_rule: "{{N}}"
    duplicate: "{{N}}"
    timing_wrong: "{{N}}"
    too_niche: "{{N}}"
```

### STEP 2: Aplicar Filtros de Relevância Renovada
Passar o arquivo por múltiplos filtros para detectar ideias que ganharam relevância:

```yaml
relevance_filters:
  context_change_filter:
    description: "Ideias que se tornaram relevantes por mudança de contexto"
    check: "O criador aprendeu algo novo, entrou em novo mercado, ou mudou de direção?"
    process:
      - "Listar mudanças significativas no último mês"
      - "Cruzar com tags do arquivo"
      - "Ideias em domínios relacionados às mudanças ganham bonus de relevância"
    bonus: "+3 ao signal strength"

  trend_filter:
    description: "Ideias alinhadas com tendências atuais"
    check: "Alguma tendência de mercado/cultura/tecnologia tornou essas ideias quentes?"
    process:
      - "Listar 3-5 tendências atuais no nicho do criador"
      - "Cruzar com tags e keywords do arquivo"
      - "Ideias alinhadas com tendências ganham bonus"
    bonus: "+4 ao signal strength (timeliness)"

  pattern_accumulation_filter:
    description: "Ideias que formam clusters com ideias mais recentes"
    check: "Alguma ideia arquivada completa um pattern com ideias da queue ativa?"
    process:
      - "Comparar domain + content_type tags do arquivo com queue ativa"
      - "Buscar complementaridade (ideia A no arquivo + ideia B na queue = insight C)"
      - "Clusters de 3+ ganham flag de Big Idea potential"
    bonus: "+5 ao signal strength (pattern emergence)"

  emotional_resonance_filter:
    description: "Ideias que agora provocam reação emocional diferente"
    check: "Ao reler, alguma ideia gera reação que não gerou antes?"
    process:
      - "Reler ideias rapidamente (scan, não deep read)"
      - "Marcar qualquer uma que provoque 'hmm, isso é interessante agora'"
      - "Body response test: arrepio, excitação, curiosidade = resgate"
    bonus: "+3 ao signal strength (renewed body response)"

  cross_pollination_filter:
    description: "Ideias de domínio A que conectam com domínio B que o criador agora domina melhor"
    check: "O criador aprofundou em algum domínio que torna ideias de outro domínio mais ricas?"
    process:
      - "Identificar domínios com mais atividade recente na queue"
      - "Buscar ideias arquivadas de domínios complementares"
      - "Se conexão existe: potencial de cross-domain synthesis"
    bonus: "+4 ao signal strength (synthesis potential)"
```

### STEP 3: Resgate e Repromoção
Para ideias que passaram nos filtros:

```yaml
rescue_process:
  for_each_rescued_idea:
    step_1: "Recalcular signal strength com bonus dos filtros aplicáveis"
    step_2: "Atualizar tags (podem ter mudado de relevância)"
    step_3: "Adicionar nota de contexto: 'Resgatada do arquivo em {{date}} — relevante agora porque {{reason}}'"
    step_4: "Mover de 'archived' para 'captured' com novo signal strength"
    step_5: "Verificar conexões com queue ativa (cross-reference)"
    step_6: "Se signal >= 8: flaggar para síntese imediata"

  rescue_categories:
    phoenix:
      description: "Ideia que 'morreu' mas ressurgiu poderosa"
      signal_range: "8-10 após bonus"
      action: "→ koe-sintetizador para Big Idea development"

    support:
      description: "Ideia que não é Big Idea mas suporta uma existente"
      signal_range: "5-7 após bonus"
      action: "Adicionar como supporting evidence a uma ideia na queue ativa"

    seed_upgraded:
      description: "Seed que agora tem condições de germinar"
      signal_range: "4-6 após bonus"
      action: "Retornar à queue para marinar com novo contexto"
```

### STEP 4: Análise de Padrões de Arquivamento
Entender POR QUE ideias estão sendo arquivadas para melhorar o processo:

```yaml
archive_pattern_analysis:
  questions:
    - "Estou arquivando demais de um domínio? (pode indicar que consumo demais desse domínio)"
    - "Estou arquivando por signal baixo ou por falta de tempo para desenvolver?"
    - "Ideias arquivadas por timing errado voltam frequentemente?"
    - "O signal scoring está calibrado? (muitas phoenixes = scoring muito rígido)"

  insights:
    over_archiving:
      symptom: "> 50% das ideias sendo arquivadas regularmente"
      diagnosis: "Possível scoring muito rígido OU consumo pouco curado"
      action: "Calibrar signal thresholds ou melhorar curadoria (KOE_COL_004)"

    under_archiving:
      symptom: "< 20% sendo arquivada"
      diagnosis: "Possível scoring muito permissivo OU queue acumulando"
      action: "Apertar signal thresholds ou processar queue mais frequentemente"

    domain_bias:
      symptom: "Um domínio tem 3x+ mais itens no arquivo que outros"
      diagnosis: "Consumindo demais desse domínio sem converter em output"
      action: "Reduzir consumo desse domínio ou encontrar melhor ângulo"

    phoenix_rate:
      healthy: "5-15% das ideias arquivadas são eventualmente resgatadas"
      too_low: "< 5% — arquivo é cemitério, scoring pode ser muito rígido no rescue"
      too_high: "> 20% — scoring original é fraco, ideias boas estão sendo arquivadas cedo demais"
```

### STEP 5: Gerar Archive Review Report
Compilar resultados da revisão:

```yaml
review_report:
  date: "{{ISO_DATE}}"
  reviewer: koe-coletor

  archive_health:
    total_items: "{{N}}"
    items_reviewed: "{{N}}"
    items_rescued: "{{N}}"
    rescue_rate: "{{%}}"
    phoenix_items: "{{N}}"

  rescued_ideas:
    - id: "Q-{{id}}"
      original_signal: "{{X}}"
      new_signal: "{{Y}}"
      rescue_reason: "{{filter that triggered rescue}}"
      destination: "{{queue_ativa|sintetizador|support_evidence}}"

  patterns_observed:
    archive_rate_assessment: "{{healthy|over|under}}"
    domain_bias: "{{domain if exists | none}}"
    phoenix_rate: "{{healthy|too_low|too_high}}"
    recommendation: "{{calibration action if needed}}"

  cross_references_created:
    count: "{{N}}"
    notable: ["Q-{{id}} ↔ Q-{{id}}: {{connection}}"]

  next_review: "{{date — monthly cadence}}"
```

---

## Input Required
```yaml
review_input:
  archive_path: ""              # path to archive data
  time_available: ""            # minutes (standard: 25min)
  recent_changes: ""            # what changed in the creator's context recently
  current_trends: []            # relevant trends in the creator's niche
  queue_active_themes: []       # themes currently active in the queue
```

## Output Template
```yaml
review_result:
  task_id: KOE_COL_006
  timestamp: "{{ISO_TIMESTAMP}}"

  summary:
    reviewed: "{{N}}"
    rescued: "{{N}}"
    phoenix: "{{N}}"
    rescue_rate: "{{%}}"

  rescued_ideas:
    - { id: "Q-{{id}}", new_signal: "{{N}}", reason: "{{reason}}", destination: "{{dest}}" }

  archive_health:
    status: "{{healthy|needs_calibration}}"
    action_needed: "{{description or none}}"

  next_review: "{{date}}"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Inventário completo do arquivo realizado
  - [ ] Todos os 5 filtros de relevância aplicados
  - [ ] Ideias resgatadas receberam novo signal strength com bonus justificado
  - [ ] Tags atualizados nas ideias resgatadas
  - [ ] Nota de contexto adicionada em cada ideia resgatada
  - [ ] Padrões de arquivamento analisados
  - [ ] Report gerado com métricas de saúde do arquivo
  - [ ] Próxima review agendada (cadência mensal)
  - [ ] Phoenix rate avaliado e calibração sugerida se necessário
```

## Handoff
After completion: → koe-sintetizador (com ideias phoenix de signal >= 8) e → koe-chief (com archive health report para informar estratégia)

---
*Task: KOE_COL_006 | Agent: koe-coletor | Version: 1.0*
