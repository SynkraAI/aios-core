# route-request

## Metadata
```yaml
task_id: KOE_CHIEF_002
agent: koe-chief
type: design
complexity: low
estimated_time: 5min
source: "Dan Koe — Modern Mastery + Digital Economics"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-voice-dna.yaml
  agents:
    - koe-coletor
    - koe-sintetizador
    - koe-arquiteto
    - koe-distribuidor
    - koe-offers
    - koe-brand
    - koe-mindset
    - koe-advisor
```

## Purpose
Rotear requests recebidos para o agente especialista correto com base em análise de intenção rápida, sem necessidade de diagnóstico completo (KOE_CHIEF_001).

> "Simplicity is the ultimate sophistication. Don't overthink the routing — match the intent to the specialist and get out of the way." — Dan Koe

## Context
Nem todo request precisa de diagnóstico completo. Quando o usuário já sabe o que quer — "quero criar uma oferta", "me ajude a escrever um tweet" — o Chief precisa apenas confirmar a intenção e rotear rapidamente. Este task é o fast-path do sistema de orquestração.

A diferença entre KOE_CHIEF_001 (diagnóstico) e KOE_CHIEF_002 (roteamento) é que o diagnóstico é exploratório (o usuário não sabe o que precisa), enquanto o roteamento é direto (o usuário sabe o que quer).

O roteamento rápido respeita o princípio de radical simplicity: não adicionar camadas desnecessárias quando a intenção é clara.

---

## Steps

### STEP 1: Extrair Intenção do Request
Analisar o request do usuário e extrair a intenção primária usando pattern matching:

```yaml
intent_patterns:
  # CAPTURE intents → koe-coletor
  capture:
    keywords: [capturar, anotar, ideia, queue, fila, salvar, registrar, inspiração]
    phrases:
      - "tive uma ideia"
      - "quero anotar"
      - "preciso organizar minhas ideias"
      - "como capturar ideias"
    confidence_threshold: 0.7
    route_to: koe-coletor

  # SYNTHESIS intents → koe-sintetizador
  synthesis:
    keywords: [conectar, padrão, framework, síntese, Big Idea, cross-domain, nomear]
    phrases:
      - "quero criar um framework"
      - "como conectar ideias"
      - "preciso de uma Big Idea"
      - "encontrar padrões"
    confidence_threshold: 0.7
    route_to: koe-sintetizador

  # CREATION intents → koe-arquiteto
  creation:
    keywords: [escrever, criar, newsletter, artigo, curso, APAG, deep work, conteúdo]
    phrases:
      - "quero escrever sobre"
      - "me ajude a criar um artigo"
      - "preciso de uma newsletter"
      - "como estruturar um curso"
    confidence_threshold: 0.7
    route_to: koe-arquiteto

  # DISTRIBUTION intents → koe-distribuidor
  distribution:
    keywords: [distribuir, repurposar, reaproveitar, calendar, tweet, clip, social]
    phrases:
      - "como distribuir meu conteúdo"
      - "quero repurposar"
      - "preciso de um content calendar"
      - "transformar em tweets"
    confidence_threshold: 0.7
    route_to: koe-distribuidor

  # OFFER intents → koe-offers
  offers:
    keywords: [oferta, produto, vender, monetizar, preço, funil, garantia, risk reversal]
    phrases:
      - "quero criar um produto"
      - "como monetizar"
      - "preciso de uma oferta"
      - "como precificar"
    confidence_threshold: 0.7
    route_to: koe-offers

  # BRAND intents → koe-brand
  brand:
    keywords: [marca, nicho, autoridade, personal brand, monopoly, diferenciação, posicionamento]
    phrases:
      - "qual meu nicho"
      - "como construir autoridade"
      - "personal brand"
      - "como me diferenciar"
    confidence_threshold: 0.7
    route_to: koe-brand

  # MINDSET intents → koe-mindset
  mindset:
    keywords: [mindset, hábito, procrastinação, medo, impostor, motivação, disciplina, condicionamento]
    phrases:
      - "não consigo manter consistência"
      - "tenho medo de começar"
      - "procrastinação"
      - "como criar hábitos"
    confidence_threshold: 0.7
    route_to: koe-mindset

  # STRATEGY intents → koe-advisor
  strategy:
    keywords: [estratégia, longo prazo, vida, carreira, soberania, liberdade, direção, futuro]
    phrases:
      - "qual direção tomar"
      - "devo largar meu emprego"
      - "life design"
      - "estratégia de longo prazo"
    confidence_threshold: 0.7
    route_to: koe-advisor
```

### STEP 2: Validar Confiança da Intenção
Se a confiança for >= 0.7: rotear diretamente.
Se a confiança for < 0.7 (intenção ambígua): escalar para KOE_CHIEF_001 (diagnóstico completo).

```yaml
validation_rules:
  high_confidence:
    threshold: 0.7
    action: "Route directly, confirm with user"
    template: |
      Entendi que você quer [INTENT_DESCRIPTION].
      Vou te conectar com @koe-[AGENT] que é especialista nisso.
      Confirma?

  medium_confidence:
    threshold: 0.4
    action: "Present top 2 options"
    template: |
      Sua pergunta pode se encaixar em:
      1. [INTENT_1] → @koe-[AGENT_1]
      2. [INTENT_2] → @koe-[AGENT_2]
      Qual delas?

  low_confidence:
    threshold: 0.0
    action: "Escalate to full diagnostic"
    template: |
      Para te direcionar melhor, preciso entender mais sobre sua situação.
      Vou rodar um diagnóstico rápido. [→ KOE_CHIEF_001]
```

### STEP 3: Executar Roteamento
Após confirmação do usuário, executar o handoff para o agente especialista.

**Handoff package inclui:**
- Request original do usuário (texto completo)
- Intenção classificada
- Confidence score
- Contexto adicional disponível (se existir de sessões anteriores)
- Task sugerida para o agente destino

### STEP 4: Confirmar Recebimento
Garantir que o agente destino recebeu o contexto e está pronto para atuar.

```yaml
handoff_confirmation:
  from: koe-chief
  to: "koe-{{agent}}"
  context_transferred: true
  original_request: "{{user_request}}"
  intent: "{{classified_intent}}"
  suggested_task: "KOE_{{TASK_ID}}"
  timestamp: "{{ISO_TIMESTAMP}}"
```

---

## Input Required
```yaml
routing_input:
  user_request: ""           # the raw request text from user
  session_context: ""        # optional - any prior context from this session
  previous_diagnostic: ""    # optional - reference to KOE_CHIEF_001 result if exists
```

## Output Template
```yaml
routing_result:
  task_id: KOE_CHIEF_002
  timestamp: "{{ISO_TIMESTAMP}}"

  intent_analysis:
    raw_request: "{{user_request}}"
    classified_intent: "{{capture|synthesis|creation|distribution|offers|brand|mindset|strategy}}"
    confidence: "{{0.0-1.0}}"
    keywords_matched: ["{{keyword1}}", "{{keyword2}}"]
    phrases_matched: ["{{phrase1}}"]

  routing_decision:
    action: "{{route_direct|present_options|escalate_diagnostic}}"
    target_agent: "koe-{{agent}}"
    suggested_task: "KOE_{{ID}}"
    reasoning: "{{brief explanation}}"

  handoff:
    status: "{{pending_confirmation|confirmed|escalated}}"
    context_package:
      original_request: "{{text}}"
      intent: "{{intent}}"
      additional_context: "{{context}}"

  fallback:
    escalated_to: "{{KOE_CHIEF_001 if ambiguous}}"
    reason: "{{why escalation was needed}}"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Intenção foi classificada com confidence score explícito
  - [ ] Roteamento segue a tabela de intent_patterns (não inventou agente)
  - [ ] Se confidence < 0.7, opções foram apresentadas ou diagnóstico escalado
  - [ ] Handoff package contém request original completo
  - [ ] Usuário confirmou a direção antes do roteamento (nunca rotear silenciosamente)
  - [ ] Nenhum immune system violation (ex: rotear para hack rápido)
  - [ ] Tempo total < 5 minutos (se excedeu, deveria ser KOE_CHIEF_001)
```

## Handoff
After completion: → koe-[target-agent] for task execution with full context package

---
*Task: KOE_CHIEF_002 | Agent: koe-chief | Version: 1.0*
