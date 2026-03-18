# name-framework

## Metadata
```yaml
task_id: KOE_SIN_002
agent: koe-sintetizador
type: creation
complexity: medium
estimated_time: 20min
source: "Dan Koe — Modern Mastery + 2 Hour Writer"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-voice-dna.yaml
  tasks:
    - KOE_SIN_001  # synthesis produces the idea to name
```

## Purpose
Nomear um framework usando o sistema MAGIC (Memorable, Actionable, Graphical, Intriguing, Concise), transformando uma Big Idea abstrata em propriedade intelectual comunicável.

> "A framework without a name is a thought. A framework with a name is intellectual property. The name is what makes it spreadable, memorable, and ultimately — monetizable." — Dan Koe

## Context
Dan Koe é mestre em nomear frameworks: Queue System, Fill/Empty/Use Cycle, APAG Structure, Content Cascade, Digital Renaissance, Leverage Stack. Cada nome transforma um conceito abstrato em algo concreto, shareable e proprietário.

O naming é estratégico porque:
1. **Propriedade Intelectual** — um nome torna o conceito SEU (ninguém pode dizer "Queue System" sem pensar em Dan Koe)
2. **Shareability** — nomes viram memes. "You Are The Niche" se espalha sozinho
3. **Memorability** — audiência lembra de "APAG" mais do que "a estrutura de conteúdo com atenção, perspectiva, vantagem e gamificação"
4. **Authority** — quem nomeia o framework é visto como a autoridade

O sistema MAGIC é uma síntese das melhores práticas de naming observadas em Dan Koe e outros criadores de frameworks.

---

## Steps

### STEP 1: Entender o Framework a Nomear
Mapear completamente o que está sendo nomeado:

```yaml
framework_mapping:
  big_idea: "{{a Big Idea de KOE_SIN_001}}"
  core_mechanism: "{{como funciona — o mecanismo central}}"
  components: ["{{parte 1}}", "{{parte 2}}", "{{parte 3}}"]
  transformation: "{{de X para Y — o que muda para quem aplica}}"
  domains_involved: ["{{domain1}}", "{{domain2}}"]

  existing_names_check:
    similar_frameworks:
      - name: "{{nome existente}}"
        similarity: "{{%}}"
        differentiation: "{{como nosso framework difere}}"
    verdict: "{{nome pode ser similar mas deve ser claramente diferente}}"
```

### STEP 2: Gerar Candidatos com MAGIC Criteria
O sistema MAGIC avalia nomes em 5 dimensões:

```yaml
magic_system:
  M_memorable:
    description: "O nome gruda na mente? Fácil de lembrar depois de ouvir 1 vez?"
    scoring:
      1: "Esquecível — genérico, complexo demais"
      5: "Lembra depois de 2-3 exposições"
      10: "Impossível de esquecer — ouviu uma vez, nunca mais esquece"
    techniques:
      - "Aliteração: Fill/Empty/Use, Content Cascade"
      - "Ritmo: APAG tem batida natural (A-PAG)"
      - "Contraste: Anti-Vision (combina prefixo negativo com palavra positiva)"
      - "Imagem: Queue System evoca fila visual"
    weight: 0.25

  A_actionable:
    description: "O nome implica AÇÃO? Alguém sabe o que fazer ao ouvir?"
    scoring:
      1: "Puramente descritivo — não sugere ação"
      5: "Sugere direção mas não ação específica"
      10: "O nome É a instrução — 'Fill/Empty/Use' = verbo, verbo, verbo"
    techniques:
      - "Usar verbos: Fill, Empty, Use, Build, Stack"
      - "Processo implícito: Cascade = algo que flui naturalmente"
      - "Comando suave: 'You Are The Niche' = imperativo disfarçado"
    weight: 0.25

  G_graphical:
    description: "O nome cria imagem mental? Dá para visualizar?"
    scoring:
      1: "Abstrato — não evoca imagem"
      5: "Evoca imagem vaga"
      10: "Imagem vívida e imediata — iceberg, cascade, queue"
    techniques:
      - "Metáfora visual: Iceberg (superfície simples, profundidade enorme)"
      - "Objeto concreto: Queue (fila), Stack (pilha), Cascade (cascata)"
      - "Cenário: Renaissance (evoca era de polímatas)"
    weight: 0.20

  I_intriguing:
    description: "O nome gera curiosidade? Alguém perguntaria 'o que é isso?'"
    scoring:
      1: "Óbvio — não gera pergunta"
      5: "Levemente curioso"
      10: "Impossível não perguntar — 'Digital Renaissance? Me conta mais'"
    techniques:
      - "Justaposição inesperada: Digital + Renaissance (tech + clássico)"
      - "Paradoxo: 'Less Is More Framework' (contradição que intriga)"
      - "Insider language: 'APAG' soa como código secreto"
    weight: 0.20

  C_concise:
    description: "O nome é curto? Máximo 3-4 palavras?"
    scoring:
      1: "5+ palavras — impossível de usar em conversa"
      5: "4 palavras — usável mas não ideal"
      10: "1-2 palavras ou acrônimo — APAG, Queue, Cascade"
    techniques:
      - "Acrônimo: APAG (4 palavras comprimidas em 1)"
      - "Compound: Mindset (mind + set em 1 palavra)"
      - "Brand name: 'The Leverage Stack' (3 palavras, artigo incluso)"
    weight: 0.10
```

### STEP 3: Brainstorm de Nomes (Mínimo 10 Candidatos)
Gerar pelo menos 10 candidatos usando diferentes técnicas:

```yaml
brainstorm_session:
  techniques_to_use:
    metaphor_names:
      description: "Usar metáfora de outro domínio"
      generate: 3
      examples: ["The Content Garden", "Idea Ecosystem", "Knowledge Cascade"]

    acronym_names:
      description: "Criar acrônimo dos componentes"
      generate: 2
      examples: ["APAG", "FIRE (Focus-Iterate-Release-Expand)"]

    action_names:
      description: "Usar verbos que descrevem o processo"
      generate: 2
      examples: ["Fill/Empty/Use", "Capture-Connect-Create"]

    paradox_names:
      description: "Usar justaposição ou contradição"
      generate: 2
      examples: ["Digital Renaissance", "Productive Laziness", "Simple Complexity"]

    brand_names:
      description: "Nomes que funcionam como marca"
      generate: 2
      examples: ["The Queue System", "The Leverage Stack", "The Sovereignty Test"]

  candidates:
    - name: "{{candidate 1}}"
      technique: "{{technique used}}"
      magic_scores: { M: 0, A: 0, G: 0, I: 0, C: 0 }
      composite: 0
    # ... repeat for all candidates
```

### STEP 4: Avaliar e Ranquear
Aplicar MAGIC scoring a cada candidato:

```yaml
evaluation:
  for_each_candidate:
    score_M: "{{1-10}}"
    score_A: "{{1-10}}"
    score_G: "{{1-10}}"
    score_I: "{{1-10}}"
    score_C: "{{1-10}}"
    composite: "{{M*0.25 + A*0.25 + G*0.20 + I*0.20 + C*0.10}}"

  additional_tests:
    say_it_out_loud:
      instruction: "Diga o nome 3 vezes em voz alta"
      check: "Soa natural? Trava na língua? Flui?"

    explain_test:
      instruction: "Tente dizer 'My framework is called [NAME]' para alguém"
      check: "A pessoa pede para explicar com curiosidade ou com confusão?"

    google_test:
      instruction: "Buscar o nome no Google"
      check: "Já existe algo com esse nome? Se sim, é domínio diferente? Pode coexistir?"

    tweet_test:
      instruction: "Cabe num tweet com espaço para explicação?"
      check: "Nome + 1 frase explicativa < 280 chars?"

  ranking:
    - rank: 1
      name: "{{name}}"
      composite_score: "{{score}}"
      strengths: "{{why it's best}}"
    - rank: 2
      name: "{{name}}"
      composite_score: "{{score}}"
      strengths: "{{why it's good}}"
    - rank: 3
      name: "{{name}}"
      composite_score: "{{score}}"
      strengths: "{{why it's option}}"
```

### STEP 5: Selecionar e Formalizar
Escolher o nome final e documentar:

```yaml
final_selection:
  chosen_name: "{{name}}"
  composite_score: "{{score}}"

  formalization:
    full_name: "The {{Name}} Framework"
    short_name: "{{Name}}"
    acronym: "{{if applicable}}"
    pronunciation: "{{how to say it}}"

    elevator_pitch: "{{1 sentence: [Name] is the framework that...}}"

    usage_examples:
      in_headline: "How The {{Name}} Changed My Business"
      in_conversation: "I use something called {{Name}} — basically it means..."
      in_tweet: "The {{Name}} → {{1 line explanation}}"
      in_newsletter: "Today I want to share a framework I call {{Name}}..."

  alternatives_saved:
    - name: "{{name 2}}"
      saved_for: "{{possible future framework or sub-framework}}"
    - name: "{{name 3}}"
      saved_for: "{{possible angle for different content}}"
```

---

## Input Required
```yaml
naming_input:
  big_idea: ""                 # the Big Idea to name (from KOE_SIN_001)
  framework_components: []     # the parts of the framework
  transformation: ""           # what changes for the user
  tone: ""                     # serious | playful | provocative | authoritative
  audience: ""                 # who will hear this name
  domains: []                  # domains involved
```

## Output Template
```yaml
naming_result:
  task_id: KOE_SIN_002
  timestamp: "{{ISO_TIMESTAMP}}"

  chosen_name: "{{name}}"
  magic_score: { M: "{{N}}", A: "{{N}}", G: "{{N}}", I: "{{N}}", C: "{{N}}", composite: "{{N}}" }

  formalization:
    full: "The {{Name}}"
    short: "{{Name}}"
    elevator_pitch: "{{1 sentence}}"

  alternatives:
    - { name: "{{name2}}", score: "{{N}}", saved_for: "{{purpose}}" }
    - { name: "{{name3}}", score: "{{N}}", saved_for: "{{purpose}}" }

  next_steps:
    - "KOE_SIN_003 — Validate depth with Iceberg Test"
    - "koe-arquiteto — Create content using this named framework"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Framework completamente mapeado antes de nomear (não nomear no vácuo)
  - [ ] Mínimo 10 candidatos gerados (diversidade de abordagens)
  - [ ] Todos candidatos scored com MAGIC (5 dimensões)
  - [ ] Testes adicionais aplicados (say it loud, google, tweet)
  - [ ] Nome escolhido tem composite score >= 7
  - [ ] Elevator pitch criado (1 frase clara)
  - [ ] Usage examples gerados (headline, conversation, tweet, newsletter)
  - [ ] Alternativas salvas para uso futuro
  - [ ] Nenhum conflito com frameworks existentes de Dan Koe
```

## Handoff
After completion: → koe-sintetizador (KOE_SIN_003 para Iceberg Depth Test) → depois koe-arquiteto para criação de conteúdo com framework nomeado

---
*Task: KOE_SIN_002 | Agent: koe-sintetizador | Version: 1.0*
