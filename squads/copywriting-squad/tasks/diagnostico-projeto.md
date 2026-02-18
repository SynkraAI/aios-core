# Task: Diagnostico de Projeto

```yaml
task_id: diagnostico-projeto
task_name: "Diagnosticar Projeto e Recomendar Clones"
version: 1.1.0
estimated_time: "15-30min"
status: pending
responsible_executor: "@copy-maestro"
execution_type: Agent
elicit: true
```

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Diagnosticar Projeto e Recomendar Clones |
| **status** | `pending` |
| **responsible_executor** | @copy-maestro |
| **execution_type** | `Agent` |
| **input** | Tipo de projeto, produto/servico, publico-alvo, output desejado |
| **output** | Diagnostico completo com clones recomendados, ordem de execucao, workflow sugerido |
| **action_items** | 5 etapas de elicitacao |
| **acceptance_criteria** | 5 criteria |

---

## Overview

Diagnosticar as necessidades de um projeto de copy e recomendar os clones ideais para cada etapa. Funciona como triagem inicial obrigatoria antes de qualquer execucao.

## Quando Usar

- Iniciando um novo projeto de copy
- Sem clareza sobre qual clone usar
- Precisa de orientacao estrategica
- Primeiro contato com a squad

---

## Pre-Conditions

- Usuario tem um projeto ou necessidade de copy definida (mesmo que vaga)
- Squad copywriting-squad esta disponivel com todos os 15 clones

## Post-Conditions

- Diagnostico documentado com nivel de awareness identificado
- Clones recomendados por tier (estrategia → execucao → otimizacao)
- Workflow ou task apropriado identificado
- Primeiro passo de execucao claro

---

## FLUXO DE DIAGNOSTICO

### Etapa 1: Identificar o Tipo de Projeto

**Perguntar ao usuario:**

"Qual o tipo de projeto? Escolha uma opcao:

1. **Lancamento Completo** - Produto novo, campanha do zero
2. **Trafego Pago Rapido** - Ads + Landing Page
3. **High-Ticket Sales** - Vendas acima de R$5.000
4. **Conteudo Organico** - Posts, threads, newsletter
5. **Email Marketing** - Sequencias ou emails diarios
6. **Otimizacao** - Melhorar copy existente
7. **Outro** - Descreva"

---

### Etapa 2: Identificar o Produto/Servico

**Perguntar:**

"Qual o tipo de produto/servico?

1. Curso Online / Infoproduto
2. Mentoria / Consultoria (High-Ticket)
3. SaaS / Software
4. E-commerce / Produto Fisico
5. Suplemento / Saude
6. Financeiro / Investimentos
7. Servico Local / B2B
8. Personal Brand / Creator
9. Outro - Descreva"

---

### Etapa 3: Diagnosticar Awareness

**Perguntar:**

"Qual o nivel de consciencia do seu publico principal?

1. **Unaware** - Nao sabem que tem o problema
2. **Problem Aware** - Sabem do problema, nao conhecem solucoes
3. **Solution Aware** - Conhecem solucoes, nao conhecem voce
4. **Product Aware** - Conhecem voce, ainda nao compraram
5. **Most Aware** - Conhecem tudo, so precisam de oferta
6. **Nao sei** - Preciso ajuda para descobrir"

Se "Nao sei", ativar @eugene-schwartz para diagnostico.

---

### Etapa 4: Identificar Output Necessario

**Perguntar:**

"Qual o principal output que precisa criar?

1. Headlines
2. Sales Page Longa
3. VSL (Video Sales Letter)
4. Emails de Venda
5. Emails de Relacionamento
6. Ads (Facebook, Google, etc.)
7. Posts Organicos
8. Landing Page Curta
9. Webinar
10. Script de Venda (Call)
11. Multiplos - Descreva"

---

### Etapa 5: Gerar Recomendacao

**Baseado nas respostas, gerar:**

```
## DIAGNOSTICO DO PROJETO

**Tipo:** [tipo de projeto]
**Produto:** [tipo de produto]
**Awareness:** [nivel identificado]
**Output Principal:** [output necessario]

---

## CLONES RECOMENDADOS

### Fase Estrategica (usar PRIMEIRO)
- @[clone-1]: [razao]
- @[clone-2]: [razao]

### Fase de Execucao (usar para ESCREVER)
- @[clone-3]: [razao]
- @[clone-4]: [razao]

### Fase de Otimizacao (usar DEPOIS)
- @[clone-5]: [razao]
- Sugarman Triggers: [triggers prioritarios]

---

## ORDEM DE EXECUCAO

1. [passo 1]
2. [passo 2]
3. [passo 3]
...

---

## WORKFLOW RECOMENDADO

[link para workflow apropriado]
```

---

## REGRAS DE RECOMENDACAO

### SEMPRE Comecar Com:
- @eugene-schwartz (diagnostico de awareness)

### Por Tipo de Produto:

| Produto | Estrategia | Execucao | Email |
|---------|------------|----------|-------|
| Curso | Schwartz+Hormozi | Benson+Bencivenga | Chaperon |
| Mentoria | Kennedy+Hormozi | Makepeace+Halbert | Kennedy+Chaperon |
| SaaS | Todd Brown+Schwartz | Ogilvy+Carlton | Settle/Chaperon |
| E-commerce | Hormozi+Schwartz | Carlton+Bencivenga | Settle+Chaperon |
| Suplemento | Todd Brown+Schwartz | Makepeace+Benson | Chaperon |
| Financeiro | Kennedy+Todd Brown | Makepeace+Ogilvy | Chaperon |
| Personal Brand | Hormozi+Todd Brown | Koe+Halbert | Settle |

### Por Awareness:

| Awareness | Clone Principal | Extensao | Tom |
|-----------|-----------------|----------|-----|
| Unaware | Halbert | Longo | Narrativo |
| Problem Aware | Makepeace | Medio-Longo | Emocional |
| Solution Aware | Todd Brown+Bencivenga | Medio | Educativo |
| Product Aware | Bencivenga+Hormozi | Medio-Curto | Persuasivo |
| Most Aware | Carlton | Curto | Direto |

---

## Acceptance Criteria

- [ ] **AC1:** Tipo de projeto identificado e documentado
- [ ] **AC2:** Nivel de awareness diagnosticado (ou escalado para @eugene-schwartz)
- [ ] **AC3:** Minimo 3 clones recomendados com justificativa (1 por tier)
- [ ] **AC4:** Ordem de execucao definida com passos claros
- [ ] **AC5:** Workflow ou task apropriado indicado como proximo passo

## Veto Conditions

- **VETO-DP-1:** Recomendar clones sem identificar awareness → PARAR, voltar Etapa 3
- **VETO-DP-2:** Recomendar apenas executores sem estrategista → ADICIONAR pelo menos 1 Tier 1
- **VETO-DP-3:** Diagnostico sem output claro (proximo passo vago) → REFINAR ate ter acao concreta
- **VETO-DP-4:** Usuario diz "Nao sei" para awareness e diagnostico e ignorado → ESCALAR para @eugene-schwartz

## Anti-Patterns

- Pular etapas de elicitacao para ir direto a recomendacao
- Recomendar todos os 15 clones — selecionar 3-5 relevantes
- Ignorar awareness e recomendar baseado apenas no tipo de output
- Recomendar workflow complexo para projeto simples (1 clone basta)
- Aceitar respostas vagas sem aprofundar ("quero copy bom" → de que tipo?)

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | Task ou workflow recomendado no diagnostico |
| **Trigger** | Diagnostico completo e aceito pelo usuario |
| **Executor** | @copy-maestro orquestra handoff para primeiro clone |

---

_Task Version: 1.1.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Squad: copywriting-squad_
