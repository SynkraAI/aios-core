# Handoff: AIOS Dashboard Implementation

> **Prompt de continuação para implementação do AIOS Dashboard**
> **Branch:** `feat/aios-dashboard`
> **Data:** 2026-01-28
> **Contexto:** Análise completa do Auto-Claude concluída

---

## Contexto

Realizamos uma análise profunda do framework [Auto-Claude](https://github.com/AndyMik90/Auto-Claude) para extrair padrões e práticas que podem ser incorporadas ao AIOS. O repositório foi clonado localmente em `/Users/alan/Code/Auto-Claude/` para análise de código-fonte.

### Documentação Criada

| Arquivo                                               | Conteúdo                                                        | Linhas |
| ----------------------------------------------------- | --------------------------------------------------------------- | ------ |
| `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`  | Análise do backend (spec pipeline, agents, worktrees, recovery) | ~2,800 |
| `docs/architecture/AUTO-CLAUDE-DASHBOARD-ANALYSIS.md` | Análise do frontend + deep dive em código-fonte                 | ~1,850 |

### Branch Atual

```bash
git checkout feat/aios-dashboard
```

---

## Descobertas Principais do Auto-Claude

### Backend (Para melhorar AIOS Framework)

1. **Spec Pipeline** - 6-8 fases estruturadas de especificação
   - SIMPLE: 3 fases (title, description, requirements)
   - STANDARD: 6 fases (+technical approach, test strategy, edge cases)
   - COMPLEX: 8 fases (+architecture, risk analysis)

2. **Git Worktrees** - Isolamento 1:1:1 (spec → worktree → branch)
   - Cada task tem seu próprio worktree
   - Merge automático após aprovação
   - Cleanup automático

3. **Self-Critique Steps** - Steps 5.5 e 6.5 no Coder agent
   - Pre-Implementation Checklist antes de codar
   - Self-Critique após implementação inicial

4. **Recovery System** - Attempt tracking e stuck detection
   - Máximo 3 tentativas por task
   - Detecção automática de loops circulares
   - Fallback para human review

5. **QA Pipeline** - 10 fases de review + 8 fases de fix
   - Validação estruturada
   - Categorização de issues (critical, high, medium, low)

### Frontend (Para AIOS Dashboard)

1. **Zustand Patterns**
   - Listeners FORA do store (evita re-renders)
   - Race condition protection com Sets
   - Task order persistence por coluna

2. **Terminal Management**
   - Callbacks externos ao Zustand
   - Buffer serialization com ANSI codes
   - Deferred initialization (75ms stagger)
   - Claude busy indicator (red/green border)

3. **UX Patterns**
   - Stuck task detection (5s inicial, 30s polling)
   - Draft auto-save em localStorage
   - TransitionEnd listeners para resize
   - IntersectionObserver para pausar animações

4. **Design System**
   - Dark-first (Oscura theme)
   - Near-black background (#0B0B0F)
   - Semantic colors para status
   - Agent-specific colors

---

## Tarefas Planejadas

### Fase 1: Story Board (Kanban) - Core

- [ ] Setup projeto Next.js + Tailwind + shadcn/ui
- [ ] Implementar story-store.ts com patterns do Auto-Claude
- [ ] Criar StoryCard component
- [ ] Criar StoryBoard (Kanban) com @dnd-kit
- [ ] Integrar com .aios/ file system (stories em YAML/MD)
- [ ] Persistência de ordem via localStorage

### Fase 2: Agent Monitor

- [ ] Agent cards com status (idle, working, waiting)
- [ ] Real-time updates (polling ou WebSocket)
- [ ] Agent logs viewer
- [ ] Agent selector (@dev, @qa, @architect, etc.)

### Fase 3: Melhorias no Framework AIOS

- [ ] Implementar Spec Pipeline estruturado
- [ ] Adicionar Self-Critique steps aos agents
- [ ] Implementar Recovery System com attempt tracking
- [ ] Melhorar QA pipeline com categorização

### Fase 4: Integração

- [ ] Terminal embed (se web) ou link para IDE
- [ ] GitHub/GitLab integration
- [ ] Worktree management UI

---

## Padrões a Implementar (Código)

### 1. Store com Listeners Externos

```typescript
// story-store.ts
const storyStatusChangeListeners = new Set<
  (storyId: string, oldStatus: StoryStatus, newStatus: StoryStatus) => void
>();

export function registerStoryStatusListener(
  listener: typeof storyStatusChangeListeners extends Set<infer T> ? T : never
) {
  storyStatusChangeListeners.add(listener);
  return () => storyStatusChangeListeners.delete(listener);
}

// Dentro do store, após update:
queueMicrotask(() => {
  for (const listener of storyStatusChangeListeners) {
    listener(storyId, oldStatus, newStatus);
  }
});
```

### 2. Race Condition Protection

```typescript
const operationsInProgress = new Set<string>();

async function updateStory(storyId: string) {
  if (operationsInProgress.has(storyId)) return;
  operationsInProgress.add(storyId);

  try {
    // ... operação
  } finally {
    operationsInProgress.delete(storyId);
  }
}
```

### 3. Draft Auto-Save

```typescript
const DRAFT_KEY = 'story-draft';

function saveDraft(draft: StoryDraft) {
  localStorage.setItem(
    `${DRAFT_KEY}-${draft.projectId}`,
    JSON.stringify({
      ...draft,
      savedAt: new Date().toISOString(),
    })
  );
}

function loadDraft(projectId: string): StoryDraft | null {
  const stored = localStorage.getItem(`${DRAFT_KEY}-${projectId}`);
  return stored ? JSON.parse(stored) : null;
}
```

### 4. Stuck Detection

```typescript
const STUCK_CHECK_INITIAL_MS = 5000;
const STUCK_CHECK_INTERVAL_MS = 30000;

useEffect(() => {
  if (!isRunning || isTerminalPhase(phase)) return;

  const checkStuck = async () => {
    const isAlive = await checkProcessAlive(storyId);
    setIsStuck(!isAlive);
  };

  const initialTimeout = setTimeout(checkStuck, STUCK_CHECK_INITIAL_MS);
  const interval = setInterval(checkStuck, STUCK_CHECK_INTERVAL_MS);

  return () => {
    clearTimeout(initialTimeout);
    clearInterval(interval);
  };
}, [storyId, isRunning, phase]);
```

---

## Design Tokens AIOS

```css
:root {
  /* Brand - Blue accent */
  --aios-primary: #3b82f6;

  /* Dark Theme */
  --background: #0a0a0f;
  --card: #111116;
  --border: #27272a;
  --foreground: #fafafa;
  --muted-foreground: #a1a1aa;

  /* Agent Colors */
  --agent-dev: #22c55e;
  --agent-qa: #eab308;
  --agent-architect: #8b5cf6;
  --agent-pm: #3b82f6;
  --agent-po: #f97316;
  --agent-analyst: #06b6d4;
  --agent-devops: #ec4899;

  /* Status */
  --status-idle: #6b7280;
  --status-working: #3b82f6;
  --status-success: #22c55e;
  --status-error: #ef4444;
  --status-warning: #f59e0b;
}
```

---

## Arquivos de Referência

### Auto-Claude (clonado em /Users/alan/Code/Auto-Claude/)

| Arquivo                                                      | Padrões                                    |
| ------------------------------------------------------------ | ------------------------------------------ |
| `apps/frontend/src/renderer/stores/task-store.ts`            | Listeners externos, race protection, draft |
| `apps/frontend/src/renderer/stores/terminal-store.ts`        | Callbacks externos, session restore        |
| `apps/frontend/src/renderer/components/KanbanBoard.tsx`      | Drag-drop, column preferences              |
| `apps/frontend/src/renderer/components/TaskCard.tsx`         | Stuck detection, memo optimization         |
| `apps/frontend/src/renderer/components/Terminal.tsx`         | Lifecycle refs, Claude busy indicator      |
| `apps/frontend/src/renderer/components/TerminalGrid.tsx`     | Grid auto-layout, staggered init           |
| `apps/frontend/src/renderer/components/terminal/useXterm.ts` | Buffer serialization, key handlers         |

### AIOS Core

| Arquivo                                               | Propósito                       |
| ----------------------------------------------------- | ------------------------------- |
| `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`  | Análise backend                 |
| `docs/architecture/AUTO-CLAUDE-DASHBOARD-ANALYSIS.md` | Análise frontend + deep dive    |
| `.aios-core/development/agents/`                      | Definições de agents existentes |
| `docs/stories/`                                       | Stories existentes              |

---

## Próximos Passos Recomendados

1. **Validar com Pedro Valério** - Apresentar análise e obter feedback
2. **Decidir stack** - Next.js vs Electron vs ambos
3. **Criar estrutura base** - Setup inicial do projeto dashboard
4. **Implementar Story Board** - Core da experiência
5. **Iterar** - Agent Monitor, melhorias no framework

---

## Comandos Úteis

```bash
# Entrar na branch
git checkout feat/aios-dashboard

# Ver documentação
cat docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md
cat docs/architecture/AUTO-CLAUDE-DASHBOARD-ANALYSIS.md

# Explorar Auto-Claude localmente
ls /Users/alan/Code/Auto-Claude/apps/frontend/src/renderer/

# Ver stores
cat /Users/alan/Code/Auto-Claude/apps/frontend/src/renderer/stores/task-store.ts

# Ver componentes
cat /Users/alan/Code/Auto-Claude/apps/frontend/src/renderer/components/KanbanBoard.tsx
```

---

_Handoff preparado por Aria (Architect Agent) - AIOS Framework_
_Branch: feat/aios-dashboard_
_Commit: 859c518_
