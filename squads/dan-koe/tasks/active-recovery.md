# active-recovery

## Metadata
```yaml
task_id: KOE_COL_005
agent: koe-coletor
type: design
complexity: low
estimated_time: 10min
source: "Dan Koe — Fill/Empty/Use Brain Cycle + The Art of Focus"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
  tasks:
    - KOE_COL_004  # typically follows curated consumption
```

## Purpose
Projetar sessão de Active Recovery — caminhada, meditação ou atividade low-stimulation — para permitir que o subconsciente processe e conecte ideias absorvidas na fase Fill.

> "The best ideas don't come when you're working. They come when you're walking, showering, or doing nothing. Your subconscious needs space to connect the dots. That's the Empty phase — and most people skip it entirely." — Dan Koe

## Context
A fase EMPTY do ciclo Fill/Empty/Use é onde a mágica acontece. Após consumir inputs curados (Fill), o cérebro precisa de espaço para processar. Dan Koe descreve isso como "esvaziar o copo" — dar ao subconsciente tempo sem estimulação para fazer conexões que a mente consciente não consegue.

A neurociência confirma: o Default Mode Network (DMN) do cérebro — ativo durante descanso, caminhada e meditação — é responsável por criatividade, insight e síntese. Quando você está focado em uma tarefa, o DMN desliga. Quando você "não faz nada", ele liga e começa a conectar informações aparentemente desconectadas.

Dan Koe pratica isso com caminhadas diárias (30-60min) sem podcast, sem música, sem telefone. Apenas pensamento livre. É durante essas caminhadas que Big Ideas emergem.

Este task planeja a sessão de recovery, define protocolos de captura mínima (para não perder insights que surgem), e prepara a transição para a fase Use (deep work).

---

## Steps

### STEP 1: Selecionar Modalidade de Recovery
Escolher a atividade baseada no contexto e preferência:

```yaml
recovery_modalities:
  walking:
    description: "Caminhada sem estímulos externos"
    ideal_for: "Conectar ideias, resolver problemas, gerar insights"
    duration: "20-60 min"
    rules:
      - "Sem fone de ouvido"
      - "Sem podcast ou música"
      - "Sem verificar celular"
      - "Rota conhecida (não precisa pensar em navegação)"
      - "Levar apenas ferramenta de captura mínima (voz ou notepad)"
    effectiveness: 9  # 1-10
    accessibility: 10

  meditation:
    description: "Meditação sentada ou guiada (sem mantra complexo)"
    ideal_for: "Clareza mental, redução de noise, foco"
    duration: "10-30 min"
    rules:
      - "Ambiente silencioso"
      - "Sem guia verbal longo — apenas sino de início/fim"
      - "Respiração como âncora"
      - "Pensamentos vêm e vão — não segurar nem rejeitar"
    effectiveness: 8
    accessibility: 9

  nature_immersion:
    description: "Tempo ao ar livre em ambiente natural"
    ideal_for: "Reset completo, especialmente após overwork"
    duration: "30-90 min"
    rules:
      - "Parque, trilha, praia — qualquer ambiente natural"
      - "Atenção nos sentidos (visual, auditivo, tátil)"
      - "Sem agenda, sem pressa"
    effectiveness: 10
    accessibility: 5  # depende de acesso a natureza

  manual_activity:
    description: "Atividade manual repetitiva (cozinhar, limpar, jardinagem)"
    ideal_for: "Processamento enquanto faz algo útil"
    duration: "15-45 min"
    rules:
      - "Atividade que não exige pensamento consciente"
      - "Mãos ocupadas, mente livre"
      - "Sem conteúdo de fundo (TV, podcast)"
    effectiveness: 7
    accessibility: 10

  shower_bath:
    description: "Banho longo ou banho de imersão"
    ideal_for: "Insights rápidos, especialmente após sessão intensa de Fill"
    duration: "10-20 min"
    rules:
      - "Água quente, ambiente fechado"
      - "Sem pressa"
      - "Ferramenta de captura à prova d'água ou logo ao sair"
    effectiveness: 7
    accessibility: 10
```

### STEP 2: Configurar Protocolo de Captura Mínima
O desafio do Empty phase é: você precisa capturar insights que surgem SEM interromper o processo subconsciente.

```yaml
minimal_capture_protocol:
  principle: "Capturar o suficiente para reconstruir depois, sem quebrar o flow"

  methods:
    voice_memo:
      description: "Gravar 10-15 segundos de voz quando insight surge"
      trigger: "Sensação de 'eureka' ou 'preciso lembrar disso'"
      format: "Frase-chave + contexto mínimo"
      example: "Voice memo: 'Simplicidade como moeda — conectar com leverage stack — empresas simples escalam melhor'"
      return_to: "Voltar imediatamente ao empty state após gravar"

    keyword_note:
      description: "Anotar 3-5 palavras-chave no celular/papel"
      trigger: "Mesmo trigger que voice memo"
      format: "Apenas palavras que reativem a memória depois"
      example: "Nota: 'simplicidade > moeda > leverage > Apple > Koe'"
      return_to: "Guardar o celular/papel imediatamente"

    mental_bookmark:
      description: "Se não pode anotar, criar âncora mental"
      technique: "Associar o insight a algo visual no ambiente"
      example: "Viu uma árvore quando teve o insight → 'árvore = simplicidade como moeda'"
      reliability: "Baixa para múltiplos insights, boa para 1-2"

  rules:
    - "MÁXIMO 3 capturas por sessão de recovery — mais que isso, você está trabalhando"
    - "Cada captura deve levar < 30 segundos"
    - "Não desenvolver a ideia durante o recovery — apenas marcar"
    - "O desenvolvimento completo acontece na fase Use (deep work)"
```

### STEP 3: Definir Sessão de Recovery
Montar o plano concreto:

```yaml
session_design:
  pre_session:
    duration: "2min"
    activities:
      - "Revisar mentalmente o que consumiu na fase Fill"
      - "NÃO formular perguntas específicas — deixar aberto"
      - "Preparar ferramenta de captura mínima"
      - "Definir timer se necessário (para não estender demais)"

  session:
    modality: "{{walking|meditation|nature|manual|shower}}"
    duration: "{{minutes}}"
    intention: "open"  # NUNCA forçar um resultado — deixar emergir

    mental_state_target:
      - "Mente relaxada mas alerta"
      - "Atenção difusa (não focada em problema específico)"
      - "Receptividade a conexões inesperadas"
      - "Sem julgamento — toda conexão é válida"

  post_session:
    duration: "5min"
    activities:
      - "Imediatamente após: expandir capturas mínimas em anotações completas"
      - "Cada keyword/voice memo → ideia estruturada (KOE_COL_001)"
      - "Registrar estado mental: energizado? Clareza? Novas conexões?"
      - "Avaliar se precisa de mais recovery ou está pronto para Use phase"

    transition_check:
      ready_for_use:
        signs:
          - "Sente clareza sobre o que criar"
          - "Tem pelo menos 1 insight que quer desenvolver"
          - "Energia mental renovada"
        action: "→ Deep Work (koe-arquiteto)"

      needs_more_recovery:
        signs:
          - "Mente ainda agitada"
          - "Fadiga mental persistente"
          - "Sem insights — mente em branco"
        action: "Mais 15-20min de recovery, ou adiar Use para amanhã"
```

### STEP 4: Registrar Insights do Recovery
Após a sessão, processar todas as capturas:

```yaml
recovery_harvest:
  insights_captured:
    - raw: "{{captura mínima}}"
      expanded: "{{versão expandida pós-sessão}}"
      queue_entry: "Q-{{id}}"
      signal_estimate: "{{1-10}}"
      connected_to_fill: "{{que input da fase Fill gerou isso}}"

  connections_made:
    - "{{ideia A}} ↔ {{ideia B}}: {{natureza da conexão}}"

  state_assessment:
    clarity: "{{1-10}}"
    energy: "{{1-10}}"
    readiness_for_use: "{{ready|needs_more|defer}}"

  meta_observation:
    what_worked: "{{o que facilitou insights}}"
    what_blocked: "{{o que atrapalhou}}"
    adjustment_for_next: "{{o que mudar na próxima sessão}}"
```

---

## Input Required
```yaml
recovery_input:
  time_available: ""           # minutes available
  modality_preference: ""      # walking | meditation | nature | manual | shower | auto
  recent_fill_session: ""      # reference to KOE_COL_004 output
  current_energy: ""           # low | moderate | high
  environment: ""              # home | office | outdoor | other
  capture_tool: ""             # voice_memo | notepad | phone | mental
```

## Output Template
```yaml
recovery_result:
  task_id: KOE_COL_005
  timestamp: "{{ISO_TIMESTAMP}}"

  session:
    modality: "{{modality}}"
    duration: "{{minutes}}"
    capture_protocol: "{{voice|keyword|mental}}"

  harvest:
    insights_count: "{{N}}"
    connections_count: "{{N}}"
    queue_entries_created: ["Q-{{id1}}", "Q-{{id2}}"]

  state:
    clarity: "{{1-10}}"
    energy: "{{1-10}}"
    readiness: "{{ready|needs_more|defer}}"

  next_phase:
    action: "{{deep_work|more_recovery|defer_to_tomorrow}}"
    agent: "{{koe-arquiteto if ready | koe-coletor if needs more}}"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Modalidade selecionada é adequada ao contexto (tempo, local, energia)
  - [ ] Protocolo de captura mínima definido (máximo 3 capturas/sessão)
  - [ ] Sessão não inclui estímulos externos (podcast, música, social media)
  - [ ] Post-session harvest realizado (capturas expandidas em anotações)
  - [ ] State assessment registrado (clarity + energy + readiness)
  - [ ] Insights capturados foram processados via KOE_COL_001
  - [ ] Meta-observação sobre a sessão registrada para melhoria contínua
  - [ ] Transição para próxima fase definida (Use ou mais Recovery)
```

## Handoff
After completion: → koe-arquiteto (se readiness = ready, para deep work na fase Use) ou → koe-coletor (KOE_COL_001 batch para registrar insights capturados)

---
*Task: KOE_COL_005 | Agent: koe-coletor | Version: 1.0*
