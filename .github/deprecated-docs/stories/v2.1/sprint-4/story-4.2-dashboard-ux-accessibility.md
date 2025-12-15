# STORY 4.2: Dashboard UX - Linguagem Acessível

**ID:** 4.2 | **Epic:** [EPIC-S4](../../../epics/epic-s4-stabilization.md)
**Sprint:** 4 | **Points:** 5 | **Priority:** 🟡 Medium | **Created:** 2025-12-05
**Updated:** 2025-12-05
**Status:** ✅ Done

**Predecessor:** Story 3.11b (Quality Dashboard UI) ✅

---

## User Story

**Como** usuário não-técnico (PM, PO, stakeholder),
**Quero** entender o dashboard de qualidade sem conhecimento técnico,
**Para que** possa acompanhar a saúde do projeto e tomar decisões informadas.

---

## Background

O dashboard atual usa terminologia técnica (Layer 1, Pre-Commit, Pass Rate, etc.) que dificulta o entendimento por pessoas não-desenvolvedoras. Esta story implementa uma camada de linguagem acessível mantendo a precisão técnica para desenvolvedores.

### Problema Atual

```
┌─────────────────────────────────────┐
│ 🔵 Layer 1                    Fair  │
│ Pre-Commit                          │
│                                     │
│ Pass Rate: 83.3%                    │
│ Avg Time: 1.0s                      │
│ Runs: 36                            │
└─────────────────────────────────────┘
```

**Problemas identificados:**
- "Layer 1" não significa nada para não-técnicos
- "Pre-Commit" é jargão de desenvolvimento
- "Pass Rate" requer contexto
- Sem explicação do que cada métrica significa

### Solução Proposta

```
┌─────────────────────────────────────────────────────┐
│ 1. Pre-Commit - Verificação Automática    (i) 🟡   │
│                                                     │
│ ✅ 83% aprovados    ⏱️ 1 segundo    📊 36 vezes    │
│                                                     │
│ Última verificação: 55 min atrás                    │
└─────────────────────────────────────────────────────┘
         │
         ▼ (clique no i)
┌─────────────────────────────────────────────────────┐
│ ℹ️ O que é isso?                                    │
│                                                     │
│ Como se fosse o corretor ortográfico do código.    │
│ Verifica erros básicos antes de enviar.            │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ O que verifica:                                 ││
│ │ • Formatação - código segue as regras          ││
│ │ • Tipos - número onde é número, texto onde é   ││
│ │ • Testes - cada pedaço funciona sozinho        ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ Entendendo os números:                         ││
│ │ • 83% aprovados = 8 de 10 entregas ok          ││
│ │ • 1 segundo = tempo para verificar             ││
│ │ • 36 vezes = total de verificações             ││
│ │ • 🟡 = pode melhorar (meta: 90%+)              ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria

### Nomenclatura dos Cards
- [x] AC4.2.1: Remover "Layer" e usar apenas número + nome técnico + descrição
  - Layer 1 → `1. Pre-Commit - Verificação Automática`
  - Layer 2 → `2. PR Review - Análise com IA`
  - Layer 3 → `3. Human Review - Aprovação do Especialista`
- [x] AC4.2.2: Manter nome técnico para desenvolvedores reconhecerem
- [x] AC4.2.3: Adicionar descrição amigável após o hífen

### Ícone de Informação (i)
- [x] AC4.2.4: Adicionar ícone (i) clicável em cada card
- [x] AC4.2.5: Ícone abre modal/popover com explicações
- [x] AC4.2.6: Modal fecha com clique fora, ESC ou botão X
- [x] AC4.2.7: Ícone tem ARIA label para acessibilidade

### Conteúdo do Modal de Informação
- [x] AC4.2.8: Cada layer tem analogia do mundo real
  - Layer 1: "Como o corretor ortográfico do código"
  - Layer 2: "Como um revisor profissional lendo seu texto"
  - Layer 3: "Como o editor-chefe que dá aprovação final"
- [x] AC4.2.9: Tabela "O que verifica" com **termo técnico oficial + explicação**
  - Formato: `Linting | Verifica se o código segue as regras de formatação`
  - Objetivo: Usuário aprende o termo técnico correlacionando com a explicação
- [x] AC4.2.10: Tabela "Entendendo os números" com **métrica oficial + significado**
  - Formato: `Pass Rate 83% | 8 de cada 10 entregas estavam ok de primeira`
- [x] AC4.2.10a: Termos técnicos em **negrito/uppercase** para destaque visual
- [x] AC4.2.10b: Correlação educacional - termos iguais aos que aparecem na IDE durante `*review`
  - Objetivo: Usuário lê "LINTING" no modal e reconhece quando @qa menciona no review
  - Benefício: Cria vocabulário comum entre dashboard e fluxo de desenvolvimento

### Métricas Simplificadas
- [x] AC4.2.11: Usar ícones visuais para cada métrica
  - ✅ para Pass Rate
  - ⏱️ para Avg Time
  - 📊 para Runs
- [x] AC4.2.12: Formato humanizado: "83% aprovados" em vez de "Pass Rate: 83.3%"
- [x] AC4.2.13: Tempo humanizado: "1 segundo" em vez de "1.0s"

### Status Badges
- [x] AC4.2.14: Manter badges coloridos (🟢🟡🔴) sem texto
- [x] AC4.2.15: Tooltip no hover explica: "Excelente", "Pode melhorar", "Atenção"
- [x] AC4.2.16: Explicação do status no modal de informação

### Resumo Executivo (Header)
- [x] AC4.2.17: Adicionar seção de resumo no topo do dashboard
- [x] AC4.2.18: Mostrar "Saúde Geral: ✅ BOA / 🟡 ATENÇÃO / 🔴 CRÍTICO"
- [x] AC4.2.19: Listar destaques em bullets (máx 3)
- [x] AC4.2.20: Destacar alertas se houver problemas

---

## Design Specifications

### Estrutura do Card (Nova)

```jsx
<LayerCard
  number={1}
  technicalName="Pre-Commit"
  friendlyName="Verificação Automática"
  analogy="Como o corretor ortográfico do código"
  metrics={{
    passRate: 0.833,
    avgTime: "1 segundo",
    runs: 36
  }}
  status="fair" // excellent | fair | poor
  infoContent={{
    whatItDoes: [
      { technical: "Linting", simple: "Verifica se o código segue as regras de formatação" },
      { technical: "Type checking", simple: "Verifica se não há erros de tipos" },
      { technical: "Unit tests", simple: "Testa se cada pedaço funciona sozinho" }
    ],
    metricsExplained: [
      { metric: "83% aprovados", meaning: "8 de cada 10 entregas estavam ok de primeira" },
      { metric: "1 segundo", meaning: "Tempo para verificar cada entrega" },
      { metric: "36 vezes", meaning: "Total de verificações realizadas" }
    ]
  }}
/>
```

### Conteúdo por Layer

#### Layer 1: Pre-Commit - Verificação Automática

| Campo | Valor |
|-------|-------|
| **Analogia** | "Como o corretor ortográfico do código" |

**📋 O que verifica (Glossário Técnico):**

| Termo Técnico | O que significa |
|---------------|-----------------|
| **Linting** | Verifica se o código segue as regras de formatação e estilo |
| **Type Checking** | Verifica se não há erros de tipos (como colocar texto onde deveria ser número) |
| **Unit Tests** | Testa se cada pedaço do código funciona sozinho, isoladamente |

**📊 Entendendo os números:**

| Métrica Oficial | O que significa |
|-----------------|-----------------|
| **Pass Rate** 83% | 8 de cada 10 entregas estavam ok de primeira |
| **Avg Time** 1.0s | Tempo médio para verificar cada entrega |
| **Runs** 36 | Total de verificações realizadas no período |

**🎯 Status:**

| Indicador | Significado |
|-----------|-------------|
| 🟢 **Excellent** | Excelente - acima de 90% |
| 🟡 **Fair** | Pode melhorar - entre 70% e 89% |
| 🔴 **Poor** | Atenção necessária - abaixo de 70% |

---

#### Layer 2: PR Review - Análise com IA

| Campo | Valor |
|-------|-------|
| **Analogia** | "Como um revisor profissional lendo seu texto antes de publicar" |

**📋 O que verifica (Glossário Técnico):**

| Termo Técnico | O que significa |
|---------------|-----------------|
| **CodeRabbit** | IA externa que analisa o código e encontra problemas automaticamente |
| **Quinn (@qa)** | Nosso agente de qualidade interno que verifica padrões AIOS |
| **PR (Pull Request)** | Solicitação para incluir código novo no projeto principal |
| **Code Review** | Processo de revisão do código por ferramentas ou pessoas |

**📊 Severidades (Glossário Técnico):**

| Severidade | O que significa | Ação necessária |
|------------|-----------------|-----------------|
| 🔴 **Critical** | Problemas graves de segurança | Bloqueia - deve corrigir antes de continuar |
| 🟠 **High** | Problemas sérios de qualidade | Deve corrigir antes do merge |
| 🟡 **Medium** | Melhorias recomendadas | Recomendado corrigir |
| 🟢 **Low** | Sugestões opcionais | Opcional - pode ignorar se justificado |

**📊 Entendendo os números:**

| Métrica Oficial | O que significa |
|-----------------|-----------------|
| **Pass Rate** 100% | Todas as entregas passaram na revisão automática |
| **Avg Time** 2.5min | Tempo médio que a IA leva para analisar |
| **Findings** 30 | Total de observações/problemas encontrados |
| **Auto-Catch Rate** | % de problemas pegos automaticamente (antes do humano) |

---

#### Layer 3: Human Review - Aprovação do Especialista

| Campo | Valor |
|-------|-------|
| **Analogia** | "Como o editor-chefe que dá a aprovação final antes de publicar" |

**📋 O que verifica (Glossário Técnico):**

| Termo Técnico | O que significa |
|---------------|-----------------|
| **Code Review** | Revisão manual do código por um desenvolvedor experiente |
| **Approval** | Aprovação formal necessária para fazer o merge |
| **Merge** | Juntar o código novo ao código principal do projeto |
| **Revision** | Pedido de correção antes de aprovar |

**📊 Entendendo os números:**

| Métrica Oficial | O que significa |
|-----------------|-----------------|
| **Pass Rate** 100% | Aprovados na primeira revisão (sem pedir correções) |
| **Avg Time** 10min | Tempo médio que o especialista humano leva para revisar |
| **Runs** 6 | Total de revisões humanas realizadas |
| **Revision Rate** | % de entregas que precisaram de correção antes de aprovar |

### Resumo Executivo (Header Component)

```jsx
<ExecutiveSummary
  overallHealth="good" // good | attention | critical
  highlights={[
    "Automação pegando 94% dos problemas",
    "Zero problemas críticos de segurança",
    "Todas as entregas aprovadas pelo time"
  ]}
  alerts={[
    "Verificação automática abaixo da meta (83%)"
  ]}
/>
```

**Regras de cálculo:**
- `good`: Layer 1 >= 90% E zero Critical findings
- `attention`: Layer 1 >= 70% OU até 2 Critical findings
- `critical`: Layer 1 < 70% OU 3+ Critical findings

---

## Component Structure

### Novos Componentes

```
src/components/
├── InfoModal.jsx           # Modal de informações
├── InfoButton.jsx          # Botão (i) com tooltip
├── ExecutiveSummary.jsx    # Resumo no header
├── MetricDisplay.jsx       # Métrica com ícone + formato humanizado
└── StatusBadge.jsx         # Badge colorido com tooltip
```

### Dados de Conteúdo

```
src/content/
├── layer-info.js           # Textos de cada layer
├── metrics-explanations.js # Explicações das métricas
└── analogies.js            # Analogias do mundo real
```

---

## Tasks

### Task 1: Componente InfoModal (2h)
- [x] 4.2.1: Criar componente InfoModal reutilizável
- [x] 4.2.2: Implementar animação de entrada/saída
- [x] 4.2.3: Adicionar suporte a keyboard (ESC fecha)
- [x] 4.2.4: Garantir acessibilidade (focus trap, ARIA)

### Task 2: Refatorar LayerCard (3h)
- [x] 4.2.5: Atualizar header com novo formato (número + nome + descrição)
- [x] 4.2.6: Adicionar InfoButton com modal
- [x] 4.2.7: Criar MetricDisplay com ícones
- [x] 4.2.8: Implementar tooltips nos badges

### Task 3: Conteúdo Explicativo (2h)
- [x] 4.2.9: Criar arquivo layer-info.js com todos os textos
- [x] 4.2.10: Definir analogias para cada layer
- [x] 4.2.11: Criar explicações das métricas
- [x] 4.2.12: Revisar linguagem com não-técnico

### Task 4: Executive Summary (2h)
- [x] 4.2.13: Criar componente ExecutiveSummary
- [x] 4.2.14: Implementar lógica de cálculo de saúde
- [x] 4.2.15: Adicionar highlights e alerts dinâmicos
- [x] 4.2.16: Integrar no Dashboard.jsx

### Task 5: Testes e Documentação (2h)
- [x] 4.2.17: Testes unitários para novos componentes
- [x] 4.2.18: Testes de acessibilidade (axe-core)
- [x] 4.2.19: Atualizar README com novas features
- [x] 4.2.20: Screenshot do novo design

**Total Estimado:** 11h (~1.5 dias)

---

## Wireframes

### Card Atual vs Novo

```
ANTES:
┌─────────────────────────────────────┐
│ 🔵 Layer 1                    Fair  │
│ Pre-Commit                          │
│                                     │
│ Pass Rate    Avg Time    Runs       │
│ 83.3%        1.0s        36         │
│                                     │
│ Last run: 55min ago                 │
└─────────────────────────────────────┘

DEPOIS:
┌─────────────────────────────────────────────────────┐
│ 1. Pre-Commit - Verificação Automática    (i)  🟡  │
│                                                     │
│ ✅ 83% aprovados   ⏱️ 1 segundo   📊 36 vezes      │
│                                                     │
│ Última verificação: 55 min atrás                    │
└─────────────────────────────────────────────────────┘
```

### Modal de Informação

```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️ Pre-Commit - Verificação Automática                  ✕  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 💡 Como se fosse o corretor ortográfico do código.         │
│    Verifica erros básicos antes de enviar.                 │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ 📋 O que verifica (Glossário Técnico):                     │
│                                                             │
│ ┌──────────────────┬──────────────────────────────────────┐│
│ │ LINTING          │ Verifica se o código segue as        ││
│ │                  │ regras de formatação e estilo        ││
│ ├──────────────────┼──────────────────────────────────────┤│
│ │ TYPE CHECKING    │ Verifica se não há erros de tipos    ││
│ │                  │ (como texto onde deveria ser número) ││
│ ├──────────────────┼──────────────────────────────────────┤│
│ │ UNIT TESTS       │ Testa se cada pedaço do código       ││
│ │                  │ funciona sozinho, isoladamente       ││
│ └──────────────────┴──────────────────────────────────────┘│
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ 📊 Entendendo os números:                                  │
│                                                             │
│ ┌──────────────────┬──────────────────────────────────────┐│
│ │ PASS RATE 83%    │ 8 de cada 10 entregas estavam        ││
│ │                  │ ok de primeira                       ││
│ ├──────────────────┼──────────────────────────────────────┤│
│ │ AVG TIME 1.0s    │ Tempo médio para verificar           ││
│ │                  │ cada entrega                         ││
│ ├──────────────────┼──────────────────────────────────────┤│
│ │ RUNS 36          │ Total de verificações realizadas     ││
│ │                  │ no período                           ││
│ └──────────────────┴──────────────────────────────────────┘│
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ 🎯 Status atual: FAIR 🟡                                   │
│    "Pode melhorar" - Meta: 90%+ para EXCELLENT 🟢          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Nota de Design:** Os termos técnicos (LINTING, TYPE CHECKING, PASS RATE, etc.)
aparecem em destaque visual (negrito, uppercase ou cor diferente) para que o
usuário possa correlacionar com o que vê na IDE durante o `*review` do @qa.

### Executive Summary (Header)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Saúde Geral: ✅ BOA                                               │
│                                                                     │
│  ✓ Automação pegando 94% dos problemas                             │
│  ✓ Zero problemas críticos de segurança                            │
│  ✓ Todas as entregas aprovadas pelo time                           │
│                                                                     │
│  ⚠️ Verificação automática abaixo da meta (83% vs 90%)             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Definition of Done

- [x] Todos os 20 ACs marcados como complete
- [x] Testes unitários passando (novos componentes)
- [x] Testes de acessibilidade passando
- [x] Dashboard funcional com novo design
- [ ] Validação com usuário não-técnico (feedback)
- [ ] PR aprovado com code review
- [x] Screenshots atualizados no README

---

## Dependencies

- **Requires:** Story 3.11b (Dashboard UI) ✅
- **Blocks:** Nenhum (enhancement independente)

---

## References

- [Story 3.11b - Dashboard UI](story-3.11b-quality-dashboard-ui.md)
- [Quality Dashboard Guide](../../../guides/quality-dashboard.md)
- [Tailwind Config](../../../../tools/quality-dashboard/tailwind.config.js)

---

## Notes

### Validação com Não-Técnicos

Antes de finalizar, validar com:
- [ ] Product Owner (Pax)
- [ ] Stakeholder não-técnico

Perguntas a fazer:
1. "Você entende o que cada número significa?"
2. "A analogia faz sentido?"
3. "Ficou claro o que precisa de atenção?"

### i18n Consideration

Os textos explicativos estão em português BR. Se necessário internacionalizar no futuro, os arquivos em `src/content/` facilitam a extração.

---

*AIOS-FULLSTACK Story 4.2 - Dashboard UX Accessibility*
