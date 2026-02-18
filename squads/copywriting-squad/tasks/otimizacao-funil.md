# Task: Otimizacao de Funil

```yaml
task_id: otimizacao-funil
task_name: "Otimizar Copy de Funil Existente"
version: 1.0.0
estimated_time: "3-5h"
status: pending
responsible_executor: "@copy-maestro (orquestra clones)"
execution_type: Agent
elicit: true
```

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Otimizar Copy de Funil Existente |
| **status** | `pending` |
| **responsible_executor** | @copy-maestro → delega para clones por fase |
| **execution_type** | `Agent` |
| **input** | Funil existente (paginas, emails, ads), metricas atuais, objetivo |
| **output** | Diagnostico, copy otimizada, plano de testes A/B |
| **action_items** | 6 steps |
| **acceptance_criteria** | 7 criteria |

---

## Overview

Workflow para diagnosticar e otimizar copy de um funil existente. Foco em identificar gargalos de conversao, reescrever pontos fracos, e criar plano de testes A/B sistematico. Nao cria do zero — melhora o que ja existe.

## Quando Usar

- Funil funcionando mas com conversao abaixo do esperado
- Queda de performance em campanha existente
- Audit periodico de copy (mensal/trimestral)
- Antes de escalar investimento em ads
- Pos-lancamento: otimizar baseado em dados reais

---

## Input

- **Funil Atual** (obrigatorio): Links/textos de todas as paginas e emails do funil
- **Metricas Atuais** (obrigatorio): CTR, conversao, open rate, bounce rate, etc.
- **Objetivo** (obrigatorio): Aumentar conversao, reduzir custo, melhorar retencao
- **Orcamento de Teste** (opcional): Quanto pode investir em testes A/B
- **Historico** (opcional): Testes anteriores e resultados
- **Benchmark** (opcional): Metricas de referencia do mercado

## Output

- **Diagnostico Completo**: Mapa do funil com gargalos identificados
- **Copy Otimizada**: Versoes novas dos pontos fracos
- **Plano de Testes A/B**: Priorizado por impacto potencial
- **Quick Wins**: 3-5 mudancas de alto impacto e baixo esforco
- **Relatorio de Audit**: Documento completo com recomendacoes

---

## Action Items

### Step 1: Audit Cientifico
**Clone:** @claude-hopkins

1. Mapear todas as etapas do funil (ad → pagina → email → checkout → thank you)
2. Registrar metricas por etapa
3. Identificar pontos de maior drop-off
4. Comparar com benchmarks do mercado
5. Classificar severidade: Critico, Alto, Medio, Baixo

**Output:** Mapa do funil com diagnostico por etapa

---

### Step 2: Diagnostico de Awareness
**Clone:** @eugene-schwartz

1. Verificar se awareness level do copy corresponde ao publico
2. Checar transicoes de awareness entre etapas do funil
3. Identificar mismatch (ex: ad para Most Aware → pagina para Unaware)
4. Recomendar ajustes de tom e extensao

**Output:** Diagnostico de awareness com mismatches

---

### Step 3: Audit de Oferta
**Clone:** @alex-hormozi

1. Avaliar oferta atual contra Value Equation
2. Verificar stack de valor (esta claro e atrativo?)
3. Checar garantia (reduz risco suficiente?)
4. Avaliar ancoragem de preco
5. Identificar objecoes nao respondidas

**Output:** Oferta auditada com recomendacoes

---

### Step 4: Reescrita de Gargalos
**Clone:** Depende do gargalo identificado

| Gargalo | Clone | Acao |
|---------|-------|------|
| Headlines fracas | @gary-bencivenga | Reescrever com curiosidade + beneficio |
| Lead fraco | @gary-halbert | Reescrever com storytelling |
| Falta de emocao | @clayton-makepeace | Injetar linguagem visceral |
| Oferta confusa | @alex-hormozi | Reestruturar stack de valor |
| Emails com baixo open rate | @ben-settle | Reescrever subject lines + formato |
| VSL com alto abandono | @jon-benson | Reestruturar script + hooks |
| Copy generico | @john-carlton | Reescrever mais direto e agressivo |

1. Priorizar top 3 gargalos por impacto potencial
2. Reescrever cada ponto com clone especializado
3. Criar versao A (original) vs B (otimizada) para cada

**Output:** Copy otimizada para os top 3 gargalos

---

### Step 5: Injecao de Triggers
**Ferramenta:** Sugarman 31 Triggers

1. Revisar copy otimizada contra lista de triggers
2. Identificar triggers ausentes de alto impacto
3. Injetar 3-5 triggers por peca de copy
4. Verificar que nao exagerou (naturalidade)

**Output:** Copy com triggers injetados

---

### Step 6: Plano de Testes A/B
**Clone:** @claude-hopkins

1. Criar plano de testes priorizado:
   - Prioridade 1: Headlines (maior impacto, facil de testar)
   - Prioridade 2: CTAs (segundo maior impacto)
   - Prioridade 3: Lead/abertura (impacta engajamento)
   - Prioridade 4: Oferta/preco (impacta conversao final)
2. Definir metricas de sucesso por teste
3. Calcular tamanho de amostra necessario
4. Definir duracao minima de cada teste
5. Criar calendario de testes

**Output:** Plano de testes A/B com calendario

---

## Acceptance Criteria

- [ ] **AC1:** Mapa do funil com metricas e gargalos identificados
- [ ] **AC2:** Top 3 gargalos priorizados por impacto potencial
- [ ] **AC3:** Copy otimizada para cada gargalo (versao A vs B)
- [ ] **AC4:** 3-5 quick wins identificados (alto impacto, baixo esforco)
- [ ] **AC5:** Triggers de Sugarman injetados nas pecas otimizadas
- [ ] **AC6:** Plano de testes A/B priorizado com calendario
- [ ] **AC7:** Relatorio de audit completo entregue

## Veto Conditions

- **VETO-OF-1:** Otimizar sem metricas atuais → PARAR, coletar dados primeiro
- **VETO-OF-2:** Reescrever tudo de uma vez → PARAR, priorizar top 3 gargalos
- **VETO-OF-3:** Testar multiplas variaveis simultaneamente → 1 variavel por teste
- **VETO-OF-4:** Ignorar awareness mismatch entre etapas → CORRIGIR transicoes primeiro
- **VETO-OF-5:** Otimizar copy sem verificar oferta → VERIFICAR oferta antes de reescrever

## Anti-Patterns

- Reescrever tudo do zero quando so precisa otimizar pontos especificos
- Otimizar baseado em intuicao em vez de dados — sempre comecar com metricas
- Testar mudancas insignificantes (cor de botao) antes de testar headlines
- Ignorar a sequencia do funil — otimizar pagina de vendas quando o problema esta no ad
- Fazer muitas mudancas de uma vez — impossivel saber o que funcionou
- Otimizar so o copy sem checar a oferta — oferta fraca nao se resolve com copy melhor

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | Implementacao de testes + monitoramento |
| **Trigger** | Plano de testes aprovado + copy otimizada |
| **Executor** | Usuario (implementacao na plataforma) |

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Squad: copywriting-squad_
