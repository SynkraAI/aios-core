---
task: Brand System Integration & Final Review
owner: marty-neumeier
phase: 8
elicit: false
atomic_layer: task
Entrada: |
  - all_specialist_deliverables: Entregáveis de todos os 5 especialistas
Saida: |
  - brand_system_report: Final Brand System Report completo
  - coherence_score: Score de coerência entre todos os elementos
  - implementation_roadmap: Próximos passos de implementação
---

# Brand System Integration & Final Review — Marty Neumeier

Integra todos os entregáveis dos especialistas em um Brand System coerente.
Aplica ZAG test, Onliness Statement, e Five Disciplines ao sistema completo.
Entrega o Final Brand System Report e Implementation Roadmap.

## Processo de Integração

### Fase 1: Coleta e Revisão de Todos os Entregáveis

Marty revisa cada entregável dos especialistas:

```
Checklist de Entregáveis Recebidos:
[ ] Brand Briefing Document — @david-aaker
[ ] Consumer Insights Report + Audience Archetypes — @malcolm-gladwell
[ ] Brand Purpose Statement + Golden Circle + Manifesto — @simon-sinek
[ ] Name Candidates + Shortlist + Rationale — @alexandra-watkins
[ ] Visual Identity Brief + Guidelines Direction — @paula-scher
[ ] Brand Voice Guide + Messaging Framework — @ann-handley
```

### Fase 2: Coherence Test

Marty aplica o teste de coerência entre todos os elementos:

**Brand Coherence Matrix:**
```
Para cada par de elementos, verificar se "cantam a mesma música":

WHY ↔ Nome:
[ ] O nome ressoa com o propósito da marca?
[ ] Um estranho conseguiria intuir o WHY pelo nome?
Score: /10

WHY ↔ Visual:
[ ] A identidade visual expressa o propósito visualmente?
[ ] A paleta de cores e tipografia evocam o mesmo feeling do WHY?
Score: /10

WHY ↔ Voz:
[ ] A voz de marca soa como alguém que acredita no WHY?
[ ] O manifesto e os key messages derivam claramente do WHY?
Score: /10

Nome ↔ Visual:
[ ] O logo/sistema visual soa como o nome?
[ ] Há coerência entre o que o nome evoca e o que o visual entrega?
Score: /10

Nome ↔ Voz:
[ ] A voz fala de um jeito que "combina" com o nome?
[ ] O tom é consistente com o que o nome sugere?
Score: /10

Visual ↔ Voz:
[ ] O visual e a voz criam a mesma impressão da marca?
[ ] Alguém que visse apenas o visual esperaria ouvir essa voz?
Score: /10

TOTAL COHERENCE SCORE: /60
Mínimo aceitável para aprovação: 48/60 (80%)
```

### Fase 3: ZAG Test Final

**Aplicação do ZAG Test ao Sistema Completo:**
```
1. Competidores diretos: [lista]
2. O que todos eles fazem? [padrões comuns]
3. No que o nosso brand system ZAGs?
   - WHY diferente: [como difere]
   - Nome diferente: [como difere]
   - Visual diferente: [como difere]
   - Voz diferente: [como difere]

4. ZAG Score (1-10):
   - 9-10: Radicalmente diferente
   - 7-8: Claramente diferenciado
   - 5-6: Diferente mas não suficientemente
   - <5: Volta para revisão — está fazendo o que todos fazem

ZAG SCORE GERAL: /10
Mínimo aceitável: 7/10
```

### Fase 4: Onliness Statement Final

Marty formula o Onliness Statement definitivo:

```
Baseado em todos os entregáveis, completar:

"[MARCA] é a única [CATEGORIA]
que [DIFERENCIADOR PRINCIPAL]
para [AUDIÊNCIA PRIMÁRIA]
que [CONTEXTO/SITUAÇÃO]."

Validação:
[ ] É verdadeiro? (Podemos provar)
[ ] É relevante? (A audiência se importa)
[ ] É sustentável? (Difícil de copiar rapidamente)
[ ] É focado? (Uma frase, sem "e também")
[ ] Resistiria ao teste de tribunal? (Nenhum competidor poderia dizer o mesmo)
```

### Fase 5: Five Disciplines Assessment

Marty avalia o brand system nas Five Disciplines:

```yaml
five_disciplines_assessment:
  differentiate:
    score: X/10
    what_works: "[o que diferencia]"
    gap: "[o que ainda não está suficientemente diferenciado]"
    action: "[o que fazer]"

  collaborate:
    score: X/10
    what_works: "[onde há alinhamento interno]"
    gap: "[onde pode haver conflito ou falta de alinhamento]"
    action: "[como garantir adoção interna]"

  innovate:
    score: X/10
    what_works: "[onde a marca está inovando]"
    gap: "[onde está apenas replicando]"
    action: "[oportunidade de inovação de marca]"

  validate:
    score: X/10
    what_works: "[o que já foi testado com audiência real]"
    gap: "[o que ainda precisa de validação]"
    action: "[testes recomendados antes do lançamento]"

  cultivate:
    score: X/10
    what_works: "[plano de gestão de marca]"
    gap: "[o que falta para crescimento consistente]"
    action: "[sistema de gestão de marca recomendado]"

  total_score: X/50
  minimum_to_launch: 35/50
```

### Fase 6: Implementation Roadmap

```yaml
roadmap:
  immediate_30_days:
    - "Registrar domínios relacionados ao nome escolhido"
    - "Iniciar processo de trademark com advogado"
    - "Contratar designer para executar identidade visual baseada no brief"
    - "Aplicar Brand Voice Guide nas comunicações existentes"

  short_term_90_days:
    - "Finalizar e aprovar identidade visual completa"
    - "Lançar novo site com identidade e voz de marca"
    - "Treinar equipe interna em Brand Voice Guide"
    - "Criar Brand Style Guide consolidado"

  medium_term_6_months:
    - "Validar recepção da marca com audiência (research)"
    - "Iterar em elementos que não performarem como esperado"
    - "Expandir sistema de identidade para novos touchpoints"
    - "Medir brand awareness e brand associations (benchmark)"

  governance:
    brand_owner: "[Quem internamente é guardião da marca]"
    approval_process: "[Quem aprova novos usos da marca]"
    review_cadence: "[Quando revisar a marca — anual / semi-annual]"
```

## Deliverable: Final Brand System Report

```markdown
# Final Brand System Report
## [Nome da Marca]

**Brand Chief:** Marty Neumeier
**Data:** [data]
**Versão:** 1.0

---

## Executive Summary

[3 parágrafos que qualquer executivo pode ler em 2 minutos:
o problema, a solução de marca, e por que vai funcionar]

---

## Brand System Overview

### WHY — Por que Existimos
"[WHY Statement]"

[Conexão: Como o WHY é expresso em cada elemento]

### ONLINESS
"[Marca] é a única [categoria] que [diferenciador]
para [audiência] que [contexto]."

### ZAG SCORE: [X/10]
[O que nos diferencia radicalmente de cada competidor]

---

## Os Elementos do Brand System

### 1. Brand Purpose & Strategy
**WHY:** "[statement]"
**Golden Circle:** [resumo]
**Manifesto:** [excerpt de 2 parágrafos]
**Positioning:** "[statement]"
*Entregue por: @simon-sinek*

### 2. Nome de Marca
**Nome escolhido:** [Nome]
**SMILE Score:** [XX/25]
**Rationale:** [2-3 parágrafos da história e por que funciona]
*Entregue por: @alexandra-watkins*

### 3. Identidade Visual
**Conceito visual:** [Direção criativa em 1 parágrafo]
**Logo:** [Tipo e conceito]
**Tipografia:** [Sistema completo]
**Cores:** [Paleta com razão]
*Entregue por: @paula-scher*

### 4. Voz de Marca
**Personalidade:** "[X, but never Y" — 3 mais importantes]
**Tagline:** "[tagline]"
**Elevator Pitch:** "[1 sentença]"
**Key Messages:** [3 mensagens principais]
*Entregue por: @ann-handley*

### 5. Consumer Intelligence
**Archetype Principal:** "[nome + tagline]"
**Insight Contraintuitiva:** "[a grande revelação]"
**Tipping Point:** "[como essa marca pode se tornar epidemia social]"
*Entregue por: @malcolm-gladwell*

---

## Brand Coherence Score

| Par de Elementos | Score |
|-----------------|-------|
| WHY ↔ Nome | /10 |
| WHY ↔ Visual | /10 |
| WHY ↔ Voz | /10 |
| Nome ↔ Visual | /10 |
| Nome ↔ Voz | /10 |
| Visual ↔ Voz | /10 |
| **TOTAL** | **/60** |

**Avaliação:** [EXCELLENT ≥54 | GOOD 48-53 | NEEDS WORK <48]

---

## Five Disciplines Assessment

| Disciplina | Score | Próximo Passo |
|-----------|-------|--------------|
| Differentiate | /10 | [ação] |
| Collaborate | /10 | [ação] |
| Innovate | /10 | [ação] |
| Validate | /10 | [ação] |
| Cultivate | /10 | [ação] |
| **TOTAL** | **/50** | |

---

## Implementation Roadmap

### 30 Dias
[ações imediatas]

### 90 Dias
[ações de curto prazo]

### 6 Meses
[ações de médio prazo]

---

## Brand Governance

**Brand Owner:** [Nome + cargo]
**Aprovação de novos usos:** [processo]
**Revisão anual agendada:** [data]

---

*"A brand is not what you say it is. It's what they say it is."*
*— Marty Neumeier*
```
