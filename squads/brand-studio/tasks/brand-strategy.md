---
task: Brand Strategy & Purpose
owner: simon-sinek
phase: 4
elicit: false
atomic_layer: task
Entrada: |
  - brand_brief: Brand Briefing Document (de David Aaker)
  - consumer_insights: Consumer Insights Report (de Malcolm Gladwell)
Saida: |
  - why_statement: "To [verb] so that [impact]"
  - golden_circle: WHY → HOW → WHAT mapeado
  - brand_manifesto: Manifesto de marca completo
  - positioning_statement: Posicionamento estratégico
---

# Brand Strategy & Purpose — Simon Sinek

Define o propósito da marca usando o Golden Circle. Entrega WHY Statement,
Golden Circle completo, Brand Manifesto e Positioning Statement.

## Processo

### Fase 1: WHY Discovery

Simon conduz as perguntas de descoberta do WHY:

**Perguntas Existenciais:**
```
1. Por que esta empresa foi fundada?
   (Não "para ganhar dinheiro" — qual foi o impulso humano real?)

2. O que o(s) fundador(es) acredita(m) que outros negam ou ignoram?

3. Se toda concorrência fosse eliminada amanhã, por que esta empresa
   ainda deveria existir?

4. O que esta empresa faria mesmo que não gerasse lucro?

5. Para quem esta empresa é um herói? Como essa pessoa descreveria
   o impacto que a empresa tem na vida dela?

6. Complete: "Quando fazemos nosso trabalho no nível mais alto possível,
   o resultado para o mundo é ___"
```

**Validação do WHY:**
- [ ] É sobre contribuição ao outros, não sobre auto-interesse?
- [ ] Pessoas de fora da empresa conseguem se identificar?
- [ ] Funciona sem o nome da empresa? (É universal o suficiente)
- [ ] Ainda seria verdade se a empresa não gerasse lucro?
- [ ] É diferente dos concorrentes?

### Fase 2: Golden Circle Mapping

```yaml
golden_circle:
  WHY:
    statement: "To [VERB] so that [IMPACT ON OTHERS]"
    belief: "[O que a marca acredita que outros negam]"
    cause: "[A causa maior que a marca serve]"

  HOW:
    differentiators:
      - "[Como #1 — o processo, valor, ou comportamento único]"
      - "[Como #2]"
      - "[Como #3]"
    behaviors:
      - "[O que fazemos que outros não fazem]"
      - "[Como tomamos decisões]"

  WHAT:
    products_services:
      - "[Produto/Serviço como prova do WHY]"
    proof_points:
      - "[Evidência concreta do WHY em ação]"
```

### Fase 3: Brand Manifesto

**Estrutura do Manifesto:**

```markdown
## [Nome da Marca] Manifesto

### O Problema que Vemos
[2-3 frases sobre o que está errado no mundo/categoria que a marca veio corrigir]

### O que Acreditamos
[3-5 declarações de crença, iniciando com "We believe that..." ou "Acreditamos que..."]

### Por que Existimos
[WHY Statement + expansão em 1-2 parágrafos]

### Como Fazemos Diferente
[HOW — 3-4 comportamentos que provam o WHY]

### O Convite
[Chamada para ação — quem se identifica com este propósito, junte-se a nós]
```

**Princípios de escrita do manifesto:**
- Primeira pessoa do plural (WE/NÓS)
- Tempo presente
- Declarações de crença > Promessas de features
- Linguagem que inspira, não que vende
- Específico o suficiente para ser diferenciador

### Fase 4: Positioning Statement

```
Para [AUDIÊNCIA PRIMÁRIA] que [NECESSIDADE OU DESEJO],
[NOME DA MARCA] é a única [CATEGORIA]
que [DIFERENCIADOR PRINCIPAL]
porque [RAZÃO PARA ACREDITAR].
```

**Validação do Positioning:**
- [ ] O diferenciador é realmente único? (ZAG test com Marty)
- [ ] A audiência reconheceria a necessidade descrita?
- [ ] A razão para acreditar é comprovável?
- [ ] Pode-se substituir o nome da marca por um concorrente? (Se sim, não é único)

## Deliverable Template

```markdown
# Brand Purpose & Strategy: [Nome da Marca]

## WHY Statement
"To [verb] so that [impact]."

## Our Belief
[A crença central que anima tudo o que a marca faz]

## Golden Circle

**WHY:** [WHY Statement completo]
> [Expansão: o que isso significa na prática]

**HOW:** [Como o WHY se manifesta em comportamentos]
1. [Comportamento diferenciador #1]
2. [Comportamento diferenciador #2]
3. [Comportamento diferenciador #3]

**WHAT:** [O que vendemos/entregamos — como prova do WHY]
> [Como cada produto/serviço é expressão do WHY]

## Brand Manifesto
[Manifesto completo — 250-400 palavras]

## Positioning Statement
"Para [audiência] que [necessidade], [marca] é a única [categoria]
que [diferenciador] porque [razão para acreditar]."

## Connections to Other Specialists
- Para Watkins (naming): O WHY sugere território de nomes [direção]
- Para Scher (visual): O WHY evoca território visual [direção]
- Para Handley (voice): O WHY define tom [adjetivos derivados]
```
