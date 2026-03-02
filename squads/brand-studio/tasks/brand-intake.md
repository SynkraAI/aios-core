---
task: Brand Intake
owner: marty-neumeier
phase: 1
elicit: true
atomic_layer: task
Entrada: |
  - client_request: Descrição inicial do projeto de marca
Saida: |
  - project_scope: Escopo definido
  - brief_for_aaker: Contexto inicial para David Aaker iniciar o briefing
---

# Brand Intake — Marty Neumeier

Coleta inicial do projeto de marca. Marty avalia o escopo, define o que é necessário,
e prepara o contexto para David Aaker coletar o briefing completo.

## Processo de Intake

### 1. Perguntas Iniciais de Diagnóstico

Marty faz as seguintes perguntas ao cliente:

```
1. Esta é uma marca nova ou uma reforma/refresh de marca existente?

2. Em uma frase — o que essa empresa faz?

3. Por que agora? O que mudou que faz este projeto urgente?

4. Quais marcas admira (dentro ou fora da categoria) e por quê?

5. Se esta marca fosse uma pessoa famosa, quem seria?

6. Qual é o maior equívoco que o mercado tem sobre vocês hoje?

7. Qual seria o maior sucesso desta marca daqui a 5 anos?
```

### 2. ZAG Preliminary Test

Marty aplica o ZAG test preliminar:

```
- Quem são seus competidores diretos?
- O que eles todos fazem igual?
- O que você faz que absolutamente nenhum deles faz?
- Se sua empresa desaparecesse amanhã, as pessoas sentiriam falta?
```

### 3. Definição de Escopo

Com base nas respostas, Marty define:

- [ ] Escopo completo (nova marca, identidade visual, naming, voice)
- [ ] Escopo parcial (especificar: só naming / só visual / só voice)
- [ ] Brand refresh (manter elementos existentes, atualizar outros)
- [ ] Brand audit (avaliar marca existente antes de decidir)

### 4. Handoff para David Aaker

Marty documenta e passa para `@david-aaker *brand-briefing`:

```yaml
project_handoff:
  type: [new_brand | brand_refresh | brand_audit | partial]
  client_summary: "[resumo em 2-3 frases]"
  urgency_context: "[por que agora]"
  admired_brands: ["brand1", "brand2"]
  zag_opportunity: "[o que ninguém mais faz nessa categoria]"
  scope:
    naming: [true | false]
    visual_identity: [true | false]
    brand_voice: [true | false]
    strategy_purpose: [true | false]
    consumer_research: [true | false]
  initial_zag_test:
    competitors: ["comp1", "comp2"]
    what_they_all_do: "[commonality]"
    what_client_does_differently: "[initial hypothesis]"
```

## Output

Marty entrega o Project Scope Document e passa o handoff para David Aaker.
O fluxo de agência está iniciado.
