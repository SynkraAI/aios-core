# iceberg-depth

## Metadata
```yaml
task_id: KOE_SIN_003
agent: koe-sintetizador
type: validation
complexity: medium
estimated_time: 30min
source: "Dan Koe — Iceberg Model + The Art of Focus + 2 Hour Writer"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
  tasks:
    - KOE_SIN_001  # synthesis produces the Big Idea
    - KOE_SIN_002  # naming gives it identity
```

## Purpose
Aplicar o Iceberg Depth Test para validar que uma Big Idea tem simplicidade na superfície E substância massiva abaixo — garantindo que não é rasa (all surface) nem inacessível (all depth).

> "The best content looks simple on the surface. One sentence that makes people nod. But underneath? Layers of research, experience, cross-domain connections, and lived truth. That's the iceberg. And the depth is what creates trust." — Dan Koe

## Context
O Iceberg Model de Dan Koe é a métrica de qualidade de conteúdo: a superfície (o que a audiência vê) deve ser surpreendentemente simples. A profundidade (o que sustenta) deve ser surpreendentemente vasta.

Conteúdo que falha no teste:
- **All Surface, No Depth**: "Trabalhe com propósito e tudo dará certo" — soa bonito, zero substância. Clichê disfarçado de insight. A audiência sente que é vazio.
- **All Depth, No Surface**: "A metacognição aplicada à heurística de viés de confirmação no contexto de decisões sob ambiguidade epistêmica..." — substância real, zero acessibilidade. Ninguém lê.
- **The Sweet Spot (Iceberg)**: "You Are The Niche" — 4 palavras que desafiam o consenso. Mas por trás: psicologia da identidade, fracasso de niching prematuro, exemplos de creators que prosperaram como polímatas, framework de como construir marca pessoal sem nicho.

O teste valida ambos os lados do iceberg.

---

## Steps

### STEP 1: Avaliar a Superfície (Surface Test)
A superfície é o que a audiência vê primeiro — título, hook, primeira frase:

```yaml
surface_test:
  big_idea: "{{a Big Idea em 1 frase}}"

  criteria:
    simplicity:
      question: "Um adolescente entenderia essa frase?"
      scoring:
        1: "Precisa de PhD para entender"
        5: "Adulto médio entende com algum esforço"
        10: "Qualquer pessoa entende instantaneamente"
      target: ">= 7"

    surprise:
      question: "A primeira reação é 'hm, nunca pensei nisso assim'?"
      scoring:
        1: "Reação: 'óbvio, todo mundo sabe disso'"
        5: "Reação: 'interessante, talvez'"
        10: "Reação: 'uau, preciso pensar sobre isso'"
      target: ">= 7"

    tension:
      question: "Cria tensão com o que a pessoa já acredita?"
      scoring:
        1: "Confirma o que todo mundo já pensa"
        5: "Levemente provocativo"
        10: "Desafia diretamente uma crença popular"
      target: ">= 6"

    shareability:
      question: "Alguém mandaria isso para um amigo dizendo 'olha isso'?"
      scoring:
        1: "Ninguém compartilharia"
        5: "Alguns compartilhariam"
        10: "Viraliza — as pessoas PRECISAM compartilhar"
      target: ">= 6"

    tweet_test:
      question: "Funciona como tweet standalone?"
      scoring:
        1: "Precisa de contexto para fazer sentido"
        5: "Funciona mas não é forte sozinha"
        10: "Tweet perfeito — standalone, impactante, shareable"
      target: ">= 6"

  surface_score: "{{média dos 5 critérios}}"
  surface_verdict:
    passed: ">= 6.5"
    needs_work: "5.0-6.4"
    failed: "< 5.0"
```

### STEP 2: Avaliar a Profundidade (Depth Test)
A profundidade é o que sustenta a Big Idea — o conteúdo abaixo da superfície:

```yaml
depth_test:
  layers:
    layer_1_personal_experience:
      question: "O criador tem experiência pessoal com isso?"
      description: "Vivência > teoria. Audiência sente quando é real."
      scoring:
        0: "Zero experiência pessoal — puramente teórico"
        5: "Alguma experiência indireta"
        10: "Experiência profunda e pessoal — pode contar histórias reais"
      target: ">= 5"

    layer_2_research_evidence:
      question: "Existe pesquisa, dados ou evidência que sustenta?"
      description: "Não precisa ser acadêmico, mas precisa de substância."
      scoring:
        0: "Nenhuma evidência — opinião pura"
        5: "Evidência anecdotal (exemplos de casos)"
        10: "Pesquisa formal + dados + múltiplos casos"
      target: ">= 5"

    layer_3_cross_domain:
      question: "A ideia se sustenta quando vista de outro domínio?"
      description: "Se psicologia confirma E biologia confirma, a ideia é robusta."
      scoring:
        0: "Funciona apenas no domínio original"
        5: "Funciona em 2 domínios"
        10: "Padrão universal — funciona em 3+ domínios"
      target: ">= 6"

    layer_4_counter_arguments:
      question: "O criador conhece e pode responder aos contra-argumentos?"
      description: "Profundidade real inclui entender o lado oposto."
      scoring:
        0: "Não considerou contra-argumentos"
        5: "Conhece objeções básicas"
        10: "Pode steel-man o argumento oposto e ainda refutar"
      target: ">= 5"

    layer_5_actionability:
      question: "Existe um framework/processo acionável por trás da ideia?"
      description: "Não basta saber — precisa poder FAZER algo."
      scoring:
        0: "Insight filosófico sem aplicação prática"
        5: "Sugestões vagas de ação"
        10: "Framework step-by-step testado e refinado"
      target: ">= 6"

    layer_6_historical_precedent:
      question: "Existe precedente histórico ou exemplo notável?"
      description: "Exemplos concretos de quem aplicou isso com sucesso."
      scoring:
        0: "Nenhum exemplo real"
        5: "1-2 exemplos"
        10: "Múltiplos exemplos em diferentes contextos"
      target: ">= 4"

    layer_7_interconnection:
      question: "Essa ideia conecta com outras Big Ideas do criador?"
      description: "Sistema > ideias isoladas. Cada Big Idea reforça as outras."
      scoring:
        0: "Ideia isolada, não conecta com nada"
        5: "Conecta vagamente com 1-2 outras ideias"
        10: "Parte integral do sistema de pensamento — conecta com 3+ frameworks"
      target: ">= 5"

  depth_score: "{{média das 7 camadas}}"
  depth_verdict:
    passed: ">= 5.5"
    needs_work: "4.0-5.4"
    failed: "< 4.0"
```

### STEP 3: Calcular Iceberg Score Composto
Combinar superfície e profundidade:

```yaml
iceberg_composite:
  formula: "iceberg_score = (surface_score * 0.40) + (depth_score * 0.60)"
  rationale: "Profundidade pesa mais porque é o que cria confiança de longo prazo"

  interpretation:
    9_10:
      label: "MASTERPIECE"
      description: "Big Idea rara. Publicar imediatamente e construir conteúdo sério em volta."
      action: "→ koe-arquiteto para newsletter + YouTube + framework completo"

    7_8:
      label: "STRONG"
      description: "Big Idea sólida. Pronta para publicação com pequenos refinamentos."
      action: "→ koe-arquiteto para conteúdo principal da semana"

    5_6:
      label: "PROMISING"
      description: "Ideia com potencial mas precisa de mais profundidade ou melhor superfície."
      action: "Identificar camadas fracas e fortalecer antes de publicar"

    3_4:
      label: "UNDERDEVELOPED"
      description: "Precisa de trabalho significativo. Não publicar assim."
      action: "Voltar para Fill phase (KOE_COL_004) para pesquisar mais"

    1_2:
      label: "REJECTED"
      description: "Não é Big Idea — é observação comum ou insight superficial."
      action: "Manter na queue como nota, não como Big Idea"
```

### STEP 4: Gerar Plano de Fortalecimento
Para ideias que não passaram (score < 7), criar plano específico:

```yaml
strengthening_plan:
  surface_improvements:
    if_simplicity_low:
      action: "Reescrever a Big Idea como se explicasse para um amigo no bar"
      technique: "Remover jargão, usar metáfora, reduzir a 1 frase"

    if_surprise_low:
      action: "Encontrar o ângulo contrarian — o que é surpreendente sobre isso?"
      technique: "Inverter a expectativa: 'Todo mundo acha X, mas na verdade Y'"

    if_shareability_low:
      action: "Reformular como provocação ou desafio"
      technique: "Adicionar tensão social: 'Isso vai irritar quem...' ou 'Ninguém quer admitir que...'"

  depth_improvements:
    if_experience_low:
      action: "Buscar experiência pessoal relacionada, mesmo indireta"
      technique: "Story mining: 'quando foi a última vez que eu VIVI algo relacionado?'"

    if_research_low:
      action: "Consumir 2-3 fontes sobre o tema (KOE_COL_004 focado)"
      technique: "Buscar dados, estudos, casos documentados"

    if_cross_domain_low:
      action: "Rodar KOE_SIN_001 novamente com foco em outro domínio"
      technique: "Perguntar: 'onde mais esse padrão aparece?'"

    if_counter_arguments_low:
      action: "Steel-man o argumento oposto"
      technique: "Perguntar: 'qual a melhor razão para discordar de mim?'"

    if_actionability_low:
      action: "Criar framework step-by-step (KOE_SIN_002 se não nomeado)"
      technique: "Decompor a ideia em 3-5 passos acionáveis"
```

### STEP 5: Emitir Veredicto Final
Consolidar a avaliação:

```yaml
final_verdict:
  big_idea: "{{a Big Idea}}"
  framework_name: "{{nome do framework se existe}}"

  scores:
    surface: "{{score}}"
    depth: "{{score}}"
    iceberg_composite: "{{score}}"

  verdict: "{{MASTERPIECE|STRONG|PROMISING|UNDERDEVELOPED|REJECTED}}"

  publication_ready: "{{yes|needs_refinement|no}}"

  if_ready:
    recommended_formats: ["{{format1}}", "{{format2}}"]
    primary_content: "{{newsletter|youtube|thread}}"
    cascade_potential: "{{low|medium|high}}"

  if_not_ready:
    weakest_layers: ["{{layer1}}", "{{layer2}}"]
    strengthening_plan: "{{specific actions}}"
    estimated_time_to_ready: "{{hours/days}}"
    retest_after: "{{when to run iceberg test again}}"
```

---

## Input Required
```yaml
iceberg_input:
  big_idea: ""                 # the Big Idea to test (1 sentence)
  framework_name: ""           # optional — name from KOE_SIN_002
  synthesis_id: ""             # optional — reference to KOE_SIN_001 output
  supporting_content: ""       # any existing depth material
  personal_experience: ""      # creator's relationship with this idea
```

## Output Template
```yaml
iceberg_result:
  task_id: KOE_SIN_003
  timestamp: "{{ISO_TIMESTAMP}}"

  big_idea: "{{idea}}"
  framework: "{{name or unnamed}}"

  surface_score: "{{N}}"
  depth_score: "{{N}}"
  iceberg_composite: "{{N}}"
  verdict: "{{MASTERPIECE|STRONG|PROMISING|UNDERDEVELOPED|REJECTED}}"

  publication_ready: "{{yes|needs_refinement|no}}"

  layer_breakdown:
    simplicity: "{{N}}"
    surprise: "{{N}}"
    tension: "{{N}}"
    shareability: "{{N}}"
    experience: "{{N}}"
    research: "{{N}}"
    cross_domain: "{{N}}"
    counter_arguments: "{{N}}"
    actionability: "{{N}}"
    precedent: "{{N}}"
    interconnection: "{{N}}"

  next_action: "{{specific next step based on verdict}}"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Surface test completo (5 critérios scored)
  - [ ] Depth test completo (7 camadas scored)
  - [ ] Iceberg composite calculado com pesos corretos (40/60)
  - [ ] Veredicto corresponde à faixa de score
  - [ ] Se não passou: plano de fortalecimento específico gerado
  - [ ] Se passou: formatos recomendados e cascade potential avaliado
  - [ ] Avaliação é honesta (não inflou scores para aprovar ideia fraca)
  - [ ] Cada score tem justificativa (não apenas número)
  - [ ] Nenhuma Big Idea publicada com iceberg_composite < 5
```

## Handoff
After completion: → koe-arquiteto (se verdict = MASTERPIECE ou STRONG) para criação de conteúdo, ou → koe-coletor/koe-sintetizador (se PROMISING/UNDERDEVELOPED) para fortalecimento

---
*Task: KOE_SIN_003 | Agent: koe-sintetizador | Version: 1.0*
