# big-idea-generation

## Metadata
```yaml
task_id: KOE_SIN_004
agent: koe-sintetizador
type: creation
complexity: high
estimated_time: 60min
source: "Dan Koe — Digital Renaissance + Iceberg Model + Modern Mastery"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-voice-dna.yaml
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
  tasks:
    - KOE_COL_002  # queue items as raw material
    - KOE_SIN_001  # cross-domain synthesis engine
    - KOE_SIN_002  # framework naming
    - KOE_SIN_003  # iceberg validation
```

## Purpose
Gerar uma Big Idea completa a partir de um cluster de ideias da queue, usando cross-domain synthesis, naming e iceberg validation — o pipeline completo de propriedade intelectual do criador.

> "A Big Idea is not a topic. It's not a take. It's a lens through which everything looks different. When you find one, it changes how you see the world — and when you share it, it changes how your audience sees theirs." — Dan Koe

## Context
Este é o task mais complexo e de maior valor do koe-sintetizador. Enquanto KOE_SIN_001 faz síntese pontual entre 2 domínios, este task executa o pipeline COMPLETO de geração de Big Idea:

1. **Mining** — Explorar a queue e clusters por matéria-prima
2. **Synthesis** — Aplicar cross-domain synthesis (KOE_SIN_001)
3. **Naming** — Nomear o framework (KOE_SIN_002)
4. **Validation** — Iceberg Depth Test (KOE_SIN_003)
5. **Packaging** — Empacotar para criação de conteúdo

Uma Big Idea de Dan Koe é reconhecível por estas características:
- **Contrarian** mas não controversa por shock value
- **Cross-domain** — vem de interseção de 2+ áreas
- **Simples na superfície** — 1 frase que faz sentido
- **Profunda no subsolo** — horas de conteúdo possível
- **Acionável** — a audiência pode fazer algo diferente
- **Nomeável** — pode virar framework com nome proprietário

Este task demora 60 minutos porque Big Ideas de verdade não aparecem em 5 minutos. Elas são construídas, camada por camada, com intenção.

---

## Steps

### STEP 1: Mining — Explorar Matéria-Prima
Vasculhar a queue e clusters por material com potencial:

```yaml
mining_phase:
  duration: "10-15 min"

  sources_to_scan:
    queue_high_signal:
      filter: "signal_strength >= 7"
      look_for: "Ideias que provocaram reação forte, especialmente cross-domain"

    clusters:
      filter: "clusters com 3+ ideias"
      look_for: "Padrão emergente que conecta as ideias do cluster"

    archive_phoenixes:
      filter: "ideias resgatadas em KOE_COL_006"
      look_for: "Ideias que ganharam relevância renovada"

    personal_experience:
      filter: "ideias tagadas com 'story' ou alta emoção"
      look_for: "Experiências pessoais que validam uma verdade não-óbvia"

    contrarian_observations:
      filter: "ideias tagadas com 'contrarian'"
      look_for: "Posições que desafiam o consenso com base em evidência"

  mining_output:
    raw_materials:
      - material: "{{idea/cluster description}}"
        source: "Q-{{id}} or cluster {{name}}"
        signal: "{{1-10}}"
        cross_domain: "{{yes/no}}"
        personal_experience: "{{yes/no}}"
        contrarian_angle: "{{yes/no}}"

    selected_for_synthesis:
      primary_cluster: "{{cluster name or top ideas}}"
      domains_involved: ["{{domain1}}", "{{domain2}}", "{{domain3}}"]
      hypothesis: "{{initial guess at what the Big Idea might be}}"
```

### STEP 2: Incubation — Formular Hipóteses
Antes de sintetizar formalmente, gerar múltiplas hipóteses de Big Ideas:

```yaml
incubation_phase:
  duration: "10 min"

  hypothesis_generation:
    technique_1_what_if:
      prompt: "E se [coisa que todo mundo assume] estiver errado?"
      generate: 3
      examples:
        - "E se nichar não fosse necessário? → You Are The Niche"
        - "E se mais horas trabalhadas reduzisse produtividade? → 2-4h Deep Work"
        - "E se consumir conteúdo fosse tão importante quanto criar? → Fill/Empty/Use"

    technique_2_pattern:
      prompt: "Que padrão aparece em [domínio A] E em [domínio B]?"
      generate: 3
      examples:
        - "Simplicidade é vantagem em design E em negócios → Radical Simplicity Premium"
        - "Diversidade gera resiliência em ecossistemas E em carreiras → Digital Renaissance"

    technique_3_inversion:
      prompt: "O oposto do conselho convencional funciona melhor em que contexto?"
      generate: 2
      examples:
        - "Convencional: 'planeje mais' → Inversão: 'execute imperfeito e itere'"
        - "Convencional: 'especialize-se' → Inversão: 'generalize estrategicamente'"

    technique_4_first_principles:
      prompt: "Se eu começasse do zero, sem assumptions, o que seria verdade?"
      generate: 2
      examples:
        - "Princípio: Negócio = Tráfego + Oferta. Ponto. Todo o resto é otimização."
        - "Princípio: Conteúdo = 1 ideia comunicada com clareza. Quantidade é irrelevante."

  hypotheses:
    - hypothesis: "{{Big Idea candidate}}"
      strength: "{{1-10}}"
      domains: ["{{d1}}", "{{d2}}"]
      technique: "{{technique used}}"
    # minimum 5 hypotheses

  selected_hypothesis:
    primary: "{{most promising hypothesis}}"
    backup: "{{second most promising}}"
    reasoning: "{{why these two}}"
```

### STEP 3: Synthesis — Construir a Big Idea
Aplicar o motor de cross-domain synthesis (KOE_SIN_001) na hipótese selecionada:

```yaml
synthesis_phase:
  duration: "15-20 min"

  execute_sin_001:
    domain_a: "{{domain}}"
    domain_a_principles: ["{{p1}}", "{{p2}}"]
    domain_b: "{{domain}}"
    domain_b_principles: ["{{p1}}", "{{p2}}"]

    intersection_techniques_applied:
      - technique: "{{technique}}"
        result: "{{connection found or dead end}}"
      - technique: "{{technique}}"
        result: "{{connection found or dead end}}"

    raw_big_idea: "{{a Big Idea bruta, sem polimento}}"

  refinement:
    simplification:
      step: "Reduzir a Big Idea para 1 frase"
      result: "{{1 sentence}}"

    provocation:
      step: "Tornar provocativa sem ser ofensiva"
      result: "{{refined provocative version}}"

    actionability:
      step: "Adicionar implicação de ação"
      result: "{{version with implied action}}"

    final_form:
      big_idea: "{{a Big Idea final em 1 frase}}"
      expanded: "{{3-5 frases expandidas}}"
      contrarian_angle: "{{o que desafia}}"
      audience_transformation: "{{como muda a perspectiva da audiência}}"
```

### STEP 4: Naming — Dar Nome ao Framework
Executar KOE_SIN_002 para nomear:

```yaml
naming_phase:
  duration: "10 min"

  execute_sin_002:
    big_idea: "{{the refined Big Idea}}"
    components: ["{{part1}}", "{{part2}}", "{{part3}}"]
    transformation: "{{from → to}}"
    tone: "{{appropriate tone}}"

  naming_result:
    chosen_name: "{{framework name}}"
    magic_score: "{{composite}}"
    elevator_pitch: "{{1 sentence with name}}"
```

### STEP 5: Validation — Iceberg Depth Test
Executar KOE_SIN_003 para validar:

```yaml
validation_phase:
  duration: "10 min"

  execute_sin_003:
    big_idea: "{{the named Big Idea}}"
    framework_name: "{{name}}"

  iceberg_result:
    surface_score: "{{N}}"
    depth_score: "{{N}}"
    iceberg_composite: "{{N}}"
    verdict: "{{verdict}}"

  if_passed:
    action: "Proceed to packaging"

  if_not_passed:
    weakest_layers: ["{{layer1}}", "{{layer2}}"]
    strengthening_action: "{{specific action}}"
    iterate: true  # go back and strengthen, then retest
    max_iterations: 2  # se não passa em 2 tentativas, guardar e marinar
```

### STEP 6: Packaging — Empacotar para Criação
Preparar a Big Idea completa para handoff ao koe-arquiteto:

```yaml
packaging_phase:
  duration: "5 min"

  big_idea_package:
    # Identity
    name: "{{framework name}}"
    big_idea: "{{1 sentence}}"
    expanded: "{{3-5 sentences}}"
    domains: ["{{d1}}", "{{d2}}"]

    # Depth Material
    personal_stories: ["{{story1}}", "{{story2}}"]
    evidence: ["{{evidence1}}", "{{evidence2}}"]
    counter_arguments: ["{{objection1 + rebuttal}}"]
    cross_domain_proof: ["{{domain: principle that supports}}"]
    actionable_steps: ["{{step1}}", "{{step2}}", "{{step3}}"]
    examples: ["{{example1}}", "{{example2}}"]

    # Content Blueprint
    newsletter_angle: "{{angle for 2000+ word piece}}"
    youtube_hook: "{{first 30 seconds hook}}"
    tweet_version: "{{280 char version}}"
    thread_outline: ["{{tweet1}}", "{{tweet2}}", "{{tweet3}}"]
    carousel_slides: ["{{slide1}}", "{{slide2}}", "{{slide3}}"]

    # Quality Metrics
    iceberg_composite: "{{score}}"
    magic_naming_score: "{{score}}"
    signal_strength: "{{score}}"

    # Metadata
    synthesis_id: "SYN-{{id}}"
    source_queue_items: ["Q-{{id1}}", "Q-{{id2}}"]
    creation_time: "{{minutes}}"
    iteration_count: "{{N}}"
```

---

## Input Required
```yaml
generation_input:
  queue_items: []              # high-signal items to work with
  clusters: []                 # clusters from KOE_COL_002
  weekly_theme: ""             # optional alignment
  forced_domains: []           # optional — force specific domain combination
  audience_pain: ""            # optional — specific audience problem to address
  personal_experience: ""      # optional — creator's relevant experience
```

## Output Template
```yaml
generation_result:
  task_id: KOE_SIN_004
  timestamp: "{{ISO_TIMESTAMP}}"

  big_idea:
    name: "{{framework name}}"
    statement: "{{1 sentence Big Idea}}"
    domains: ["{{d1}}", "{{d2}}"]
    contrarian_angle: "{{what it challenges}}"

  quality:
    iceberg_composite: "{{N}}"
    magic_score: "{{N}}"
    signal_strength: "{{N}}"
    verdict: "{{MASTERPIECE|STRONG|PROMISING}}"

  content_blueprint:
    newsletter: "{{angle}}"
    youtube: "{{hook}}"
    tweet: "{{280 chars}}"
    thread_length: "{{N tweets}}"

  depth_material:
    stories: "{{N}}"
    evidence_points: "{{N}}"
    actionable_steps: "{{N}}"

  source_materials: ["Q-{{id1}}", "Q-{{id2}}"]
  creation_time: "{{minutes}}"

  status: "{{ready_for_content|needs_strengthening|deferred}}"
  next_action: "{{specific next step}}"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Mining phase explorou pelo menos 3 fontes (queue, clusters, archive)
  - [ ] Mínimo 5 hipóteses geradas usando técnicas diversas
  - [ ] Cross-domain synthesis realizada com 2+ domínios
  - [ ] Big Idea reduzida a 1 frase clara e provocativa
  - [ ] Framework nomeado com MAGIC score >= 7
  - [ ] Iceberg Depth Test executado e passed (composite >= 7)
  - [ ] Content blueprint gerado (newsletter + tweet + thread mínimo)
  - [ ] Depth material presente (stories + evidence + steps)
  - [ ] Package completo para handoff ao koe-arquiteto
  - [ ] Total time <= 60 minutos (se excedeu, marcar e continuar depois)
  - [ ] Big Idea não viola immune system (não é hack, clichê ou superficial)
```

## Handoff
After completion: → koe-arquiteto para criação de conteúdo usando o Big Idea Package completo (newsletter + video + social)

---
*Task: KOE_SIN_004 | Agent: koe-sintetizador | Version: 1.0*
