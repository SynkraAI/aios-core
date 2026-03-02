---
task: Consumer Insights Research
owner: malcolm-gladwell
phase: 3
elicit: false
atomic_layer: task
Entrada: |
  - brand_brief: Brand Briefing Document (de David Aaker)
Saida: |
  - insights_report: Consumer Insights Report
  - audience_archetypes: 3-4 archetypes comportamentais
  - specialist_feed: Insights direcionados para cada especialista
---

# Consumer Insights Research — Malcolm Gladwell

Pesquisa de audiência, análise cultural e identificação de tipping points.
Entrega Consumer Insights Report com archetypes comportamentais que alimentam todos os especialistas.

## Processo

### Fase 1: O Contexto Cultural

Gladwell nunca começa pelo produto — começa pelo mundo:

```
Perguntas de contexto cultural:

1. Que forças culturais, sociais ou tecnológicas estão remodelando
   esta categoria hoje?

2. O que o mundo acreditava sobre esta categoria há 10 anos
   que hoje está sendo questionado?

3. Qual é o "momento" desta categoria — em ascensão, maturidade,
   ou reinvenção?

4. Há um movimento cultural, social ou geracional que esta marca
   poderia (ou deveria) surfar?

5. O que seria um "tipping point" para que esta marca se tornasse
   um fenômeno — não apenas um produto?
```

### Fase 2: A Insight Contraintuitiva

**Assinatura Gladwell — o não-óbvio:**
```
Para cada categoria, há uma insight que contradiz a sabedoria convencional.
Encontrá-la é nosso trabalho mais valioso.

Estrutura da insight contraintuitiva:
"Todo mundo pensa [X sobre esta audiência/categoria/comportamento],
mas na verdade [Y] — e isso muda tudo para a marca."

Fontes para encontrar a insight:
- Reviews negativos de competidores (o que os clientes REALMENTE odeiam)
- Comportamentos de uso inesperado do produto
- Quem compra mas "não deveria" (o usuário surpresa)
- Quem não compra mas "deveria" (a barreira oculta)
- O que pessoas dizem em privado vs. em público sobre a categoria
```

### Fase 3: Audience Archetypes

**Por que archetypes, não personas:**
```
Personas demográficas descrevem QUEM.
Archetypes comportamentais descrevem POR QUÊ.

Mulher, 35-45, renda média, nível superior → inútil para branding.
"Alguém que acredita que pode reinventar a si mesma mas precisa
de permissão para começar" → isso é o que guia decisões de marca.
```

**Estrutura de Archetype:**
```yaml
archetype:
  name: "[Nome evocativo — não demográfico]"
  tagline: "[Uma frase que captura sua essência]"

  identity:
    who_they_are: "[Além da demografia — como pensam, o que valorizam]"
    life_context: "[O que está acontecendo na vida deles]"

  psychology:
    core_belief: "[O que acreditam sobre o mundo]"
    unspoken_desire: "[O que querem desesperadamente mas não articulam]"
    core_fear: "[O que os assombra nesta categoria]"
    self_narrative: "[A história que contam para si mesmos]"

  behavior:
    how_they_discover: "[Como descobrem marcas novas]"
    how_they_decide: "[O que os faz comprar vs. não comprar]"
    how_they_talk: "[Como falam sobre a categoria com amigos]"
    trigger: "[O que os faria agir imediatamente]"

  tipping_point_role:
    type: "[Maven | Connector | Salesman | Laggard]"
    rationale: "[Por que este archetype desempenha este papel]"
    activation: "[Como ativar este archetype como agente de espalhamento]"

  brand_implication:
    message_for_them: "[O que a marca deve dizer para este archetype]"
    where_to_reach: "[Canais e contextos onde encontrar]"
    what_to_never_say: "[O que instantaneamente os aliena]"
```

### Fase 4: Tipping Point Analysis

**Mapeamento dos Três Agentes:**
```yaml
tipping_point_analysis:
  mavens:
    definition: "Information brokers — os que sabem tudo sobre a categoria"
    who_they_are: "[Descrição específica para ESTA categoria]"
    what_motivates_them: "[O que os move a compartilhar informação]"
    how_to_reach: "[Canais e contextos]"
    activation_strategy: "[Como fazer mavens evangelizarem esta marca]"
    example: "[Exemplo concreto de maven nesta categoria]"

  connectors:
    definition: "Social hubs — pessoas com conexões excepcionalmente amplas"
    who_they_are: "[Descrição específica]"
    their_network: "[Que comunidades e grupos conectam]"
    how_to_reach: "[Canais e contextos]"
    activation_strategy: "[Como fazer connectors espalharem a marca]"

  salesmen:
    definition: "Natural persuaders — evangelizadores inatos"
    who_they_are: "[Descrição específica]"
    what_makes_them_persuasive: "[Qual é o poder de persuasão deles]"
    activation_strategy: "[O que dar a eles para espalharem]"
    content_for_them: "[Que tipo de mensagem eles vão propagar]"
```

### Fase 5: Blink Analysis — First Impressions

**Thin-Slicing da Categoria:**
```
Antes de ver qualquer lógica racional, o que a audiência sente
nos primeiros 3 segundos de contato com:

1. O nome da categoria (ex: "serviços de coaching")
   → Reação visceral: [o que vem à mente]
   → Preconceito existente: [crença que a marca deve endereçar]

2. Os competidores (percepção visual imediata)
   → O que transmitem instantaneamente
   → Oportunidade de diferenciação no thin-slicing

3. O território de nomes (que nomes "soam certos" para esta categoria)
   → Padrões de fonologia preferidos pela audiência

Implicação: Nossa marca deve [confirmar / romper / recontextualizar]
as expectativas de thin-slicing desta categoria.
```

### Fase 6: Competitive Behavior Mapping

```
Para cada competidor principal:

[Competidor]:
- Como a audiência fala SOBRE eles (não para eles)
- O que amam (e por que isso cria lealdade)
- O que odeiam (e por que não migram mesmo assim)
- Qual necessidade emocional profunda este competidor atende
- Qual necessidade emocional profunda NÃO atende (oportunidade)
```

## Deliverable: Consumer Insights Report

```markdown
# Consumer Insights Report: [Nome do Projeto]
**Consumer Insights Analyst:** Malcolm Gladwell
**Data:** [data]

---

## O Contexto Cultural

[2-3 parágrafos sobre as forças culturais que moldam esta categoria agora.
O que mudou, o que está mudando, o que vai mudar.]

---

## A Insight Contraintuitiva

> "Todo mundo pensa [X], mas na verdade [Y] — e isso muda tudo."

[Expansão em 2-3 parágrafos explicando a insight e suas implicações
para a estratégia de marca]

---

## Audience Archetypes

### Archetype 1: "[Nome Evocativo]"
> "[Tagline do archetype]"

**Quem são:** [Identidade comportamental]
**Crença central:** [O que acreditam]
**Desejo não-articulado:** [O que querem mas não conseguem dizer]
**Medo na categoria:** [O que os assombra]
**Trigger de ação:** [O que os faria agir agora]
**Papel no tipping point:** Maven / Connector / Salesman
**O que a marca deve dizer a eles:** [mensagem específica]
**Onde alcançar:** [canais]

### Archetype 2: "[Nome Evocativo]"
[mesma estrutura]

### Archetype 3: "[Nome Evocativo]"
[mesma estrutura]

---

## Tipping Point Analysis

**Mavens desta categoria:** [quem são, como ativar]
**Connectors desta categoria:** [quem são, como ativar]
**Salesmen desta categoria:** [quem são, o que dar a eles]

**O Tipping Point:** Para que esta marca vire epidemia social,
precisaria que [EVENTO/CONDIÇÃO/AÇÃO]. A estratégia para chegar lá: [...]

---

## First Impressions (Blink Analysis)

**Thin-Slicing da Categoria:** [o que as pessoas sentem nos primeiros 3 segundos]
**Preconceito a Endereçar:** [crença que a marca deve transformar]
**Oportunidade de Thin-Slicing:** [como esta marca pode causar uma primeira impressão radicalmente diferente]

---

## Implicações para Especialistas

**Para @simon-sinek (Purpose):**
[Insight específica sobre o que move emocionalmente esta audiência — conectada ao WHY]

**Para @alexandra-watkins (Naming):**
[Como esta audiência percebe e reage a nomes — padrões fonológicos, gatilhos]

**Para @paula-scher (Visual):**
[Como esta audiência responde visualmente — estilos que criam confiança vs. alienação]

**Para @ann-handley (Voice):**
[Como esta audiência quer ser falada — tom, vocabulário, nível de formalidade]
```
