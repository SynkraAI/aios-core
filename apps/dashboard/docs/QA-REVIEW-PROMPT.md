# QA Review Prompt - AIOS Dashboard

## Objetivo

Revisar completamente o PRD, Epics e Stories do AIOS Dashboard para validar:

1. Implementação vs Especificação
2. Completude de features
3. Consistência de UX
4. Qualidade do código
5. Cobertura de testes

---

## Contexto do Projeto

**Projeto:** AIOS Dashboard
**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand, SWR
**Localização:** `apps/dashboard/`

---

## Documentos para Revisão

### PRD Principal

- [ ] `docs/prd/aios-dashboard-prd-v1.4.md`

### Epics e Stories

- [ ] `docs/stories/epic-0-foundation.md` - Foundation & Setup
- [ ] `docs/stories/epic-1-kanban.md` - Kanban Board
- [ ] `docs/stories/epic-2-agents.md` - Agent Monitor
- [ ] `docs/stories/epic-3-integrations.md` - GitHub Integration
- [ ] `docs/stories/epic-4-terminals.md` - Agent Terminals
- [ ] `docs/stories/epic-5-insights.md` - Analytics Dashboard
- [ ] `docs/stories/epic-6-context.md` - Context Visualization
- [ ] `docs/stories/epic-7-roadmap.md` - Roadmap View

---

## Checklist de Revisão por Epic

### Epic 0: Foundation & Setup

| Item                         | Especificado | Implementado | Status |
| ---------------------------- | ------------ | ------------ | ------ |
| Next.js 16 + Turbopack       |              |              |        |
| TypeScript strict mode       |              |              |        |
| Tailwind CSS + CSS Variables |              |              |        |
| shadcn/ui components         |              |              |        |
| Zustand stores               |              |              |        |
| SWR data fetching            |              |              |        |
| Layout responsivo            |              |              |        |
| Dark/Light theme             |              |              |        |
| Estrutura de pastas          |              |              |        |

**Arquivos a verificar:**

- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `src/app/layout.tsx`
- `src/app/globals.css`

---

### Epic 1: Kanban Board

| Item                        | Especificado | Implementado | Status |
| --------------------------- | ------------ | ------------ | ------ |
| 7 colunas de status         |              |              |        |
| Cards com prioridade visual |              |              |        |
| Filtros por agente          |              |              |        |
| Busca de stories            |              |              |        |
| Modal de detalhes           |              |              |        |
| Indicador de progresso      |              |              |        |
| Badge de agente             |              |              |        |
| Cores semânticas            |              |              |        |

**Arquivos a verificar:**

- `src/components/kanban/KanbanBoard.tsx`
- `src/components/kanban/KanbanColumn.tsx`
- `src/components/stories/StoryCard.tsx`
- `src/components/stories/StoryDetailModal.tsx`
- `src/stores/story-store.ts`
- `src/hooks/use-stories.ts`

---

### Epic 2: Agent Monitor

| Item                   | Especificado | Implementado | Status |
| ---------------------- | ------------ | ------------ | ------ |
| Cards de agente        |              |              |        |
| Status em tempo real   |              |              |        |
| Indicador de atividade |              |              |        |
| Story atual            |              |              |        |
| Fase de trabalho       |              |              |        |
| Polling configurável   |              |              |        |
| Cores por agente       |              |              |        |

**Arquivos a verificar:**

- `src/components/agents/AgentMonitor.tsx`
- `src/components/agents/AgentCard.tsx`
- `src/stores/agent-store.ts`
- `src/hooks/use-agents.ts`

---

### Epic 3: GitHub Integration

| Item              | Especificado | Implementado | Status |
| ----------------- | ------------ | ------------ | ------ |
| Lista de PRs      |              |              |        |
| Lista de Issues   |              |              |        |
| Status de review  |              |              |        |
| Labels            |              |              |        |
| Links externos    |              |              |        |
| Mock data support |              |              |        |

**Arquivos a verificar:**

- `src/components/github/GitHubPanel.tsx`
- `src/app/api/github/route.ts`

---

### Epic 4: Agent Terminals

| Item                | Especificado | Implementado | Status |
| ------------------- | ------------ | ------------ | ------ |
| Grid de terminais   |              |              |        |
| Terminal card       |              |              |        |
| ASCII art Claude    |              |              |        |
| Modelo/API info     |              |              |        |
| Status indicator    |              |              |        |
| Working directory   |              |              |        |
| New terminal button |              |              |        |
| Close terminal      |              |              |        |

**Arquivos a verificar:**

- `src/components/terminals/TerminalGrid.tsx`
- `src/components/terminals/TerminalCard.tsx`
- `src/components/terminals/TerminalOutput.tsx`

---

### Epic 5: Insights Dashboard

| Item                  | Especificado | Implementado | Status |
| --------------------- | ------------ | ------------ | ------ |
| Velocity metric       |              |              |        |
| Cycle time            |              |              |        |
| Error rate            |              |              |        |
| Agent performance     |              |              |        |
| Weekly activity chart |              |              |        |
| Bottlenecks           |              |              |        |
| Time in status        |              |              |        |

**Arquivos a verificar:**

- `src/components/insights/InsightsPanel.tsx`
- `src/lib/mock-data.ts` (MOCK_INSIGHTS)

---

### Epic 6: Context Visualization

| Item                 | Especificado | Implementado | Status |
| -------------------- | ------------ | ------------ | ------ |
| Project info         |              |              |        |
| Active rules         |              |              |        |
| Agent definitions    |              |              |        |
| Config files         |              |              |        |
| MCP servers          |              |              |        |
| Recent files         |              |              |        |
| Collapsible sections |              |              |        |

**Arquivos a verificar:**

- `src/components/context/ContextPanel.tsx`
- `src/lib/mock-data.ts` (MOCK_CONTEXT)

---

### Epic 7: Roadmap View

| Item                                | Especificado | Implementado | Status |
| ----------------------------------- | ------------ | ------------ | ------ |
| MoSCoW prioritization               |              |              |        |
| 4 colunas (Must/Should/Could/Won't) |              |              |        |
| Cards com impact/effort             |              |              |        |
| Tags/labels                         |              |              |        |
| Link para story                     |              |              |        |

**Arquivos a verificar:**

- `src/components/roadmap/RoadmapView.tsx`
- `src/components/roadmap/RoadmapCard.tsx`
- `src/lib/mock-data.ts` (MOCK_ROADMAP_ITEMS)

---

## Checklist de UX/UI

| Item                            | Status | Notas |
| ------------------------------- | ------ | ----- |
| Sem emojis (lucide-react icons) |        |       |
| Cores consistentes              |        |       |
| Responsividade mobile           |        |       |
| Dark mode funcional             |        |       |
| Light mode funcional            |        |       |
| Keyboard shortcuts              |        |       |
| Loading states                  |        |       |
| Error states                    |        |       |
| Empty states                    |        |       |
| Hover/focus states              |        |       |

---

## Checklist de Código

| Item                        | Status | Notas |
| --------------------------- | ------ | ----- |
| TypeScript sem erros        |        |       |
| ESLint sem erros            |        |       |
| Build passa                 |        |       |
| Imports organizados         |        |       |
| Componentes documentados    |        |       |
| Props tipadas               |        |       |
| Sem any explícito           |        |       |
| Hooks customizados testados |        |       |

---

## Checklist de Dados

| Item                      | Status | Notas |
| ------------------------- | ------ | ----- |
| Mock data completo        |        |       |
| Demo mode toggle funciona |        |       |
| API routes funcionam      |        |       |
| SWR caching correto       |        |       |
| Zustand persist funciona  |        |       |

---

## Comandos de Verificação

```bash
# TypeScript
npm run typecheck

# ESLint
npm run lint

# Build
npm run build

# Dev server
npm run dev
```

---

## Formato do Relatório

Para cada item revisado, documentar:

```markdown
### [Epic X] - [Nome do Item]

**Status:** PASS | FAIL | PARTIAL

**Especificado:**

- [O que o PRD/Story define]

**Implementado:**

- [O que foi encontrado no código]

**Gaps:**

- [Diferenças encontradas]

**Recomendações:**

- [Ações sugeridas]
```

---

## Prioridade de Revisão

1. **Crítico:** Funcionalidades core (Kanban, Agents)
2. **Alto:** Integrações (GitHub, Terminals)
3. **Médio:** Analytics (Insights, Context)
4. **Baixo:** Nice-to-have (Roadmap)

---

## Output Esperado

1. Relatório completo de revisão (`docs/QA-REVIEW-REPORT.md`)
2. Lista de bugs encontrados
3. Lista de gaps de implementação
4. Recomendações de melhorias
5. Score de completude por Epic (0-100%)

---

_Use este prompt com: `/qa` ou `@qa`_
