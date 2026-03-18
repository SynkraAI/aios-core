# diagnostico-koe

## Metadata
```yaml
task_id: KOE_CHIEF_001
agent: koe-chief
type: diagnosis
complexity: medium
estimated_time: 15min
source: "Dan Koe — The Art of Focus + Modern Mastery"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-voice-dna.yaml
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
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
Diagnosticar a situação atual do usuário e rotear para o agente/workflow correto do Koe Squad, garantindo que cada problema receba o especialista adequado.

> "Most people don't have a strategy problem. They have a clarity problem. They don't know what to focus on because they haven't diagnosed where they actually are." — Dan Koe

## Context
O Koe Chief é o Tier 0 — o orquestrador mestre. Antes de qualquer ação, é necessário um diagnóstico preciso. Este task implementa o processo de triagem que Dan Koe usa implicitamente em todo seu conteúdo: primeiro entender o estágio do criador, depois prescrever a ação correta.

A maioria dos criadores falha não por falta de informação, mas por aplicar a informação errada no momento errado. Um criador no estágio de captura de ideias não precisa de uma estratégia de distribuição — precisa do Queue System. Um criador com 1000 ideias sem monetização não precisa capturar mais — precisa do framework Traffic + Offers.

Este diagnóstico evita o erro mais comum: pular etapas.

---

## Steps

### STEP 1: Coletar Contexto do Usuário
Solicitar informações estruturadas sobre a situação atual do criador. Usar elicitação ativa — não aceitar respostas vagas.

**Dimensões obrigatórias:**
1. **Estágio do Business** — Não existe / Ideia / Primeiros clientes / Crescendo / Maduro
2. **Fonte de Renda Atual** — Emprego CLT / Freelance / Produtos digitais / Mix / Nenhuma
3. **Audiência** — Zero / <1K / 1K-10K / 10K-100K / 100K+
4. **Produção de Conteúdo** — Nunca / Esporádico / Semanal / Diário
5. **Dor Principal** — O que está impedindo progresso AGORA

**Template de elicitação:**
```
Para diagnosticar corretamente, preciso entender 5 coisas:

1. Em que estágio está seu negócio? (não existe / ideia / primeiros clientes / crescendo / maduro)
2. Como você ganha dinheiro hoje? (emprego / freelance / produtos digitais / mix)
3. Qual o tamanho da sua audiência? (zero / <1K / 1K-10K / 10K-100K / 100K+)
4. Com que frequência você produz conteúdo? (nunca / esporádico / semanal / diário)
5. Qual a maior dor que está impedindo seu progresso agora?
```

### STEP 2: Classificar no Framework Traffic + Offers
Usando as respostas, classificar o usuário no diagnóstico central de Dan Koe:

```yaml
diagnostic_matrix:
  traffic_level:
    zero: "Sem audiência — precisa de Content System antes de tudo"
    low: "Audiência pequena — precisa de Content Cascade + Distribution"
    medium: "Audiência razoável — precisa de otimização + offers"
    high: "Audiência forte — foco em monetização e leverage"

  offer_level:
    none: "Sem produto — precisa de Offer Architecture"
    weak: "Produto existe mas não converte — precisa de Risk Reversal"
    decent: "Produto ok mas sem escala — precisa de Leverage Stack"
    strong: "Produto forte — precisa de Distribution + Brand"

  diagnosis:
    traffic_zero_offer_none: "Fase 1 — Fundação. Foco: Queue System + primeira Big Idea"
    traffic_low_offer_none: "Fase 2 — Construção. Foco: Content Pipeline + primeiro produto"
    traffic_low_offer_weak: "Fase 3 — Otimização. Foco: APAG + Risk Reversal"
    traffic_medium_offer_decent: "Fase 4 — Escala. Foco: Content Cascade + Leverage Stack"
    traffic_high_offer_strong: "Fase 5 — Soberania. Foco: Personal Monopoly + Automation"
```

### STEP 3: Mapear para Agente Especialista
Com base no diagnóstico, rotear para o agente correto:

```yaml
routing_table:
  # Problemas de CAPTURA → koe-coletor
  signals:
    - "Tenho muitas ideias mas perco todas"
    - "Não sei o que criar"
    - "Me sinto sem inspiração"
    - "Consumo muito conteúdo mas não produzo"
  route_to: koe-coletor
  tasks: [KOE_COL_001, KOE_COL_002, KOE_COL_004]

  # Problemas de SÍNTESE → koe-sintetizador
  signals:
    - "Tenho ideias mas não sei conectar"
    - "Meu conteúdo é genérico"
    - "Não tenho uma Big Idea"
    - "Quero criar um framework próprio"
  route_to: koe-sintetizador
  tasks: [KOE_SIN_001, KOE_SIN_004, KOE_SIN_002]

  # Problemas de CRIAÇÃO → koe-arquiteto
  signals:
    - "Não consigo escrever/gravar"
    - "Meu conteúdo não engaja"
    - "Preciso de uma newsletter/curso"
    - "Quero estrutura APAG"
  route_to: koe-arquiteto
  tasks: []  # arquiteto tasks not yet created

  # Problemas de DISTRIBUIÇÃO → koe-distribuidor
  signals:
    - "Crio conteúdo mas ninguém vê"
    - "Não sei como distribuir"
    - "Quero repurposar conteúdo"
    - "Preciso de um content calendar"
  route_to: koe-distribuidor
  tasks: []  # distribuidor tasks not yet created

  # Problemas de OFERTA → koe-offers
  signals:
    - "Não tenho produto para vender"
    - "Meu produto não vende"
    - "Preciso de uma oferta irresistível"
    - "Como precificar meu produto"
  route_to: koe-offers
  tasks: []  # offers tasks not yet created

  # Problemas de MARCA → koe-brand
  signals:
    - "Não sei qual é meu nicho"
    - "Quero construir autoridade"
    - "Personal brand confusa"
    - "Como me diferenciar"
  route_to: koe-brand
  tasks: []  # brand tasks not yet created

  # Problemas de MINDSET → koe-mindset
  signals:
    - "Procrastinação"
    - "Síndrome do impostor"
    - "Não consigo manter consistência"
    - "Padrões negativos"
  route_to: koe-mindset
  tasks: []  # mindset tasks not yet created

  # Problemas ESTRATÉGICOS → koe-advisor
  signals:
    - "Devo largar meu emprego?"
    - "Qual direção tomar?"
    - "Life design"
    - "Longo prazo"
  route_to: koe-advisor
  tasks: []  # advisor tasks not yet created
```

### STEP 4: Gerar Diagnóstico Estruturado
Compilar o diagnóstico em formato padronizado para handoff ao agente especialista.

**O diagnóstico deve incluir:**
1. Resumo da situação em 2-3 frases
2. Classificação Traffic + Offers
3. Fase identificada (1-5)
4. Agente recomendado + justificativa
5. Task(s) específica(s) sugerida(s)
6. Sovereignty Score preliminar (rodar KOE_CHIEF_004 se necessário)

### STEP 5: Apresentar Opções ao Usuário
Nunca prescrever sem confirmar. Apresentar diagnóstico + opções:

```
Diagnóstico: [resumo]

Recomendo:
1. [Ação principal] → via @koe-[agente]
2. [Ação alternativa] → via @koe-[agente]
3. [Explorar mais antes de agir] → continuar com @koe-chief

Qual direção?
```

---

## Input Required
```yaml
user_context:
  business_stage: ""        # none | idea | early | growing | mature
  income_source: ""         # employment | freelance | digital_products | mix | none
  audience_size: ""         # zero | sub_1k | 1k_10k | 10k_100k | over_100k
  content_frequency: ""     # never | sporadic | weekly | daily
  main_pain: ""             # free text - the core blocker
  additional_context: ""    # optional free text
```

## Output Template
```yaml
diagnostic_result:
  task_id: KOE_CHIEF_001
  timestamp: "{{ISO_TIMESTAMP}}"

  user_profile:
    business_stage: "{{stage}}"
    income_source: "{{income}}"
    audience_size: "{{audience}}"
    content_frequency: "{{frequency}}"
    main_pain: "{{pain_description}}"

  classification:
    traffic_level: "{{zero|low|medium|high}}"
    offer_level: "{{none|weak|decent|strong}}"
    phase: "{{1-5}}"
    phase_name: "{{Fundação|Construção|Otimização|Escala|Soberania}}"

  routing:
    primary_agent: "koe-{{agent}}"
    primary_task: "KOE_{{ID}}"
    reasoning: "{{why this agent/task}}"
    alternative_agent: "koe-{{agent2}}"
    alternative_task: "KOE_{{ID2}}"

  sovereignty_score:
    preliminary: "{{0-10 or 'pending KOE_CHIEF_004'}}"
    notes: "{{observations}}"

  options_presented:
    - option: 1
      action: "{{description}}"
      agent: "koe-{{agent}}"
    - option: 2
      action: "{{description}}"
      agent: "koe-{{agent}}"
    - option: 3
      action: "{{description}}"
      agent: "koe-chief"

  user_choice: "{{pending}}"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Todas as 5 dimensões do contexto foram coletadas (sem campos vazios)
  - [ ] Classificação Traffic + Offers é coerente com os dados
  - [ ] Fase identificada (1-5) corresponde à matrix diagnóstica
  - [ ] Agente recomendado tem relação direta com a dor principal
  - [ ] Task específica foi sugerida (não apenas o agente genérico)
  - [ ] 3 opções foram apresentadas ao usuário (nunca prescrição unilateral)
  - [ ] Sovereignty Score preliminar foi registrado ou marcado como pendente
  - [ ] Output segue o template YAML completo
  - [ ] Nenhuma violação do immune system (ex: sugerir hack rápido)
```

## Handoff
After completion: → koe-[agent-identified] for specialized task execution based on diagnostic routing

---
*Task: KOE_CHIEF_001 | Agent: koe-chief | Version: 1.0*
