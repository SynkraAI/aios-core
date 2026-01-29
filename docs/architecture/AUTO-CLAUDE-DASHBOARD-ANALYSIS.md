# Análise de Dashboard: Auto-Claude UI Components

> **Documento de Análise de Interface para Dashboard AIOS**
>
> **Preparado por:** Aria (Architect Agent)
> **Data:** 2026-01-28
> **Versão:** 1.0
> **Para:** Pedro Valério, Alan

---

## Sumário Executivo

Este documento analisa os componentes de interface do Auto-Claude para informar o design de um dashboard para o AIOS. O Auto-Claude possui uma interface desktop completa construída em Electron com React, oferecendo visualização de agentes, Kanban de tasks, terminais múltiplos e insights.

### Principais Componentes Identificados

| Categoria          | Componentes                       | Relevância AIOS |
| ------------------ | --------------------------------- | --------------- |
| **Kanban Board**   | Drag-and-drop, colunas por status | 🔴 Alta         |
| **Terminal Grid**  | Até 12 terminais simultâneos      | 🔴 Alta         |
| **Task Cards**     | Status, progresso, ações          | 🔴 Alta         |
| **Phase Progress** | Indicadores visuais de fases      | 🟡 Média        |
| **Agent Profiles** | Seleção e config de agentes       | 🟡 Média        |
| **Insights Chat**  | Interface conversacional          | 🟢 Baixa        |
| **Design System**  | Dark-first, tokens, temas         | 🔴 Alta         |

---

## Índice

1. [Arquitetura de UI](#1-arquitetura-de-ui)
2. [Design System](#2-design-system)
3. [Componentes Principais](#3-componentes-principais)
4. [Stores de Estado](#4-stores-de-estado)
5. [Padrões de UX](#5-padrões-de-ux)
6. [Proposta para AIOS Dashboard](#6-proposta-para-aios-dashboard)

---

## 1. Arquitetura de UI

### 1.1 Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTO-CLAUDE FRONTEND STACK                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Framework:     Electron + React + TypeScript                       │
│  State:         Zustand (16 stores)                                 │
│  Styling:       Tailwind CSS + CSS Variables                        │
│  Drag & Drop:   @dnd-kit/core + @dnd-kit/sortable                  │
│  Terminal:      xterm.js + node-pty                                 │
│  Panels:        react-resizable-panels                              │
│  Icons:         Lucide React                                        │
│  i18n:          react-i18next                                       │
│  Markdown:      ReactMarkdown + remark-gfm                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Estrutura de Diretórios

```
apps/frontend/src/renderer/
├── components/           # 51+ componentes React
│   ├── KanbanBoard.tsx
│   ├── Terminal.tsx
│   ├── TerminalGrid.tsx
│   ├── TaskCard.tsx
│   ├── TaskCreationWizard.tsx
│   ├── PhaseProgressIndicator.tsx
│   ├── AgentProfileSelector.tsx
│   ├── Sidebar.tsx
│   ├── Insights.tsx
│   ├── Ideation.tsx
│   ├── Roadmap.tsx
│   └── ... (40+ mais)
│
├── stores/               # 16 stores Zustand
│   ├── task-store.ts
│   ├── terminal-store.ts
│   ├── project-store.ts
│   └── ... (13+ mais)
│
├── contexts/             # React Context providers
├── hooks/                # Custom hooks
├── lib/                  # Utilitários
├── styles/               # CSS global
│
├── App.tsx               # Componente principal
├── main.tsx              # Entry point
└── index.html
```

### 1.3 Layout Principal

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AUTO-CLAUDE UI                              │
├───────────┬─────────────────────────────────────────────────────────┤
│           │  Project Tabs (draggable)                               │
│           │  ┌────┐ ┌────┐ ┌────┐                                  │
│           │  │Proj│ │Proj│ │ +  │                                  │
│           │  │ A  │ │ B  │ │    │                                  │
│           │  └────┘ └────┘ └────┘                                  │
│  Sidebar  ├─────────────────────────────────────────────────────────┤
│           │                                                         │
│  ┌─────┐  │              Active View                               │
│  │Kanb │  │                                                         │
│  │Term │  │   ┌─────────────────────────────────────────────┐      │
│  │Road │  │   │                                             │      │
│  │Ctxt │  │   │    Kanban / Terminals / Roadmap / etc      │      │
│  │Idea │  │   │                                             │      │
│  │Insi │  │   │                                             │      │
│  │GitH │  │   └─────────────────────────────────────────────┘      │
│  │Work │  │                                                         │
│  │Tool │  │                                                         │
│  └─────┘  │                                                         │
│           │                                                         │
├───────────┴─────────────────────────────────────────────────────────┤
│  Status Bar: Auth | Rate Limit | Claude Status | Updates           │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.4 Views Disponíveis

| View            | Descrição                         | Componente         |
| --------------- | --------------------------------- | ------------------ |
| **Kanban**      | Quadro de tasks com drag-and-drop | `KanbanBoard.tsx`  |
| **Terminals**   | Grade de terminais de agentes     | `TerminalGrid.tsx` |
| **Roadmap**     | Planejamento de features          | `Roadmap.tsx`      |
| **Context**     | Contexto do projeto               | `Context.tsx`      |
| **Ideation**    | Brainstorming de melhorias        | `Ideation.tsx`     |
| **Insights**    | Chat com análise de codebase      | `Insights.tsx`     |
| **GitHub**      | Issues e PRs                      | `GitHubIssues.tsx` |
| **GitLab**      | Issues e MRs                      | `GitLabIssues.tsx` |
| **Worktrees**   | Gerenciamento de worktrees        | `Worktrees.tsx`    |
| **Agent Tools** | Ferramentas do agente             | `AgentTools.tsx`   |
| **Changelog**   | Histórico de alterações           | `Changelog.tsx`    |

---

## 2. Design System

### 2.1 Filosofia

> _"A modern dark-first design system inspired by Fey/Oscura aesthetics. Minimal, data-focused interfaces optimized for dark mode with near-black backgrounds and warm yellow accents reserving color primarily for semantic meaning."_

### 2.2 Paleta de Cores (Dark Mode)

```css
/* Core Colors - Oscura Midnight Theme */
:root {
  /* Backgrounds */
  --background: #0b0b0f; /* Near-black, OLED optimized */
  --card: #121216; /* Subtle elevation */
  --card-hover: #18181c; /* Hover state */
  --popover: #161619; /* Popovers/modals */

  /* Text */
  --foreground: #e6e6e6; /* Primary text */
  --muted-foreground: #8f8f8f; /* Secondary text */

  /* Semantic Colors */
  --primary: #d6d876; /* Saturated yellow - accent */
  --success: #4ebe96; /* Teal - success states */
  --error: #ff5c5c; /* Soft red - errors */
  --warning: #d2d714; /* Yellow-green - warnings */
  --info: #479ffa; /* Blue - information */

  /* Borders */
  --border: #2a2a2e; /* Subtle borders */
  --border-hover: #3a3a3e; /* Hover borders */

  /* Interactive */
  --ring: #d6d876; /* Focus ring */
  --input: #1a1a1e; /* Input backgrounds */
}
```

### 2.3 Paleta de Cores (Light Mode)

```css
:root.light {
  --background: #f2f2ed; /* Warm off-white */
  --card: #ffffff; /* Pure white cards */
  --foreground: #0b0b0f; /* Near-black text */
  --primary: #a5a66a; /* Muted olive accent */
  --muted-foreground: #6b6b6b; /* Secondary text */
}
```

### 2.4 Tipografia

```css
/* Font Families */
--font-primary: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-display-lg: 36px; /* weight: 700 */
--text-heading-lg: 24px; /* weight: 600 */
--text-heading-md: 20px; /* weight: 600 */
--text-body-lg: 16px; /* weight: 400 */
--text-body-md: 14px; /* weight: 400 */
--text-body-sm: 13px; /* weight: 400 */
--text-label-sm: 12px; /* weight: 500 */
--text-label-xs: 11px; /* weight: 500 */
```

### 2.5 Spacing Scale

```css
/* Base: 4px */
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;

/* Semantic Spacing */
--card-padding: 24px; /* space-6 */
--section-gap: 32px; /* space-8 */
--element-gap: 12px; /* space-3 */
```

### 2.6 Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 20px;
--radius-3xl: 24px;
--radius-full: 9999px;
```

### 2.7 Shadows (Dark Mode)

```css
/* Dark mode usa borders ao invés de shadows para cards */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.5);

/* Para cards, usar border ao invés de shadow */
.card {
  border: 1px solid var(--border);
}
```

### 2.8 Temas Alternativos

| Tema                 | Accent Dark      | Accent Light    |
| -------------------- | ---------------- | --------------- |
| **Oscura (default)** | #D6D876 yellow   | #A5A66A olive   |
| **Dusk**             | #B8A9C9 lavender | #8B7B9B purple  |
| **Lime**             | #B4D455 lime     | #8FAA3D green   |
| **Ocean**            | #5BC0DE cyan     | #3A8A9E teal    |
| **Retro**            | #FF9F43 orange   | #CC7A2E rust    |
| **Neo**              | #A855F7 purple   | #7C3AED violet  |
| **Forest**           | #22C55E green    | #15803D emerald |

---

## 3. Componentes Principais

### 3.1 KanbanBoard

```typescript
// Estrutura do KanbanBoard
interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onNewTaskClick?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// Colunas do Kanban
const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'gray' },
  { id: 'in_progress', label: 'In Progress', color: 'blue' },
  { id: 'ai_review', label: 'AI Review', color: 'purple' },
  { id: 'human_review', label: 'Human Review', color: 'yellow' },
  { id: 'pr_created', label: 'PR Created', color: 'cyan' },
  { id: 'done', label: 'Done', color: 'green' },
  { id: 'error', label: 'Error', color: 'red' },
];
```

**Funcionalidades:**

- Drag-and-drop entre colunas (@dnd-kit)
- Reordenação dentro da coluna
- Seleção múltipla para bulk actions
- Mapeamento visual (pr_created → done, error → human_review)
- Persistência de ordem em localStorage

**Layout Visual:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔄 Refresh                                    + New Task           │
├─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬────────┤
│ Backlog │In Progr │AI Review│Hum Revw │PR Create│  Done   │ Error  │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ ┌─────┐ │ ┌─────┐ │ ┌─────┐ │ ┌─────┐ │         │ ┌─────┐ │        │
│ │Task │ │ │Task │ │ │Task │ │ │Task │ │         │ │Task │ │        │
│ │Card │ │ │Card │ │ │Card │ │ │Card │ │         │ │Card │ │        │
│ └─────┘ │ └─────┘ │ └─────┘ │ └─────┘ │         │ └─────┘ │        │
│ ┌─────┐ │         │         │ ☐ ☐ ☐  │         │         │        │
│ │Task │ │         │         │ Select │         │         │        │
│ │Card │ │         │         │ for PR │         │         │        │
│ └─────┘ │         │         │         │         │         │        │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴────────┘
```

### 3.2 TaskCard

```typescript
interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

interface Task {
  id: string;
  specId: string;
  title: string;
  description: string;
  status: TaskStatus;
  category?: 'feature' | 'fix' | 'refactor' | 'docs';
  complexity?: 'simple' | 'standard' | 'complex';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  impact?: 'low' | 'medium' | 'high';
  executionProgress?: ExecutionProgress;
  createdAt: string;
  updatedAt: string;
}
```

**Elementos Visuais:**

```
┌─────────────────────────────────────────┐
│ ⚠️ Stuck                    [Feature]   │  ← Warning badge + Category
├─────────────────────────────────────────┤
│ Task Title Here                         │  ← Título
│ Brief description of the task...        │  ← Descrição truncada
├─────────────────────────────────────────┤
│ ● Planning ────────○ Coding ○ QA        │  ← Phase indicator
│ ████████░░░░░░░░░░░░░░░░░░░░░ 35%       │  ← Progress bar
│ ● ● ● ○ ○ ○ ○ ○                         │  ← Subtask dots
├─────────────────────────────────────────┤
│ [Standard] [High] [Medium]              │  ← Badges
├─────────────────────────────────────────┤
│                        [Recover] [▶️]    │  ← Action buttons
└─────────────────────────────────────────┘
```

**Badges de Categoria:**

```typescript
const CATEGORY_COLORS = {
  feature: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  fix: { bg: 'bg-red-500/10', text: 'text-red-400' },
  refactor: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  docs: { bg: 'bg-green-500/10', text: 'text-green-400' },
};

const COMPLEXITY_COLORS = {
  simple: { bg: 'bg-green-500/10', text: 'text-green-400' },
  standard: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  complex: { bg: 'bg-red-500/10', text: 'text-red-400' },
};
```

**Detecção de Tasks Travadas:**

- Verificação inicial após 5 segundos
- Re-verificação a cada 30 segundos
- Pula em fases terminais (complete, failed, planning)
- Exibe badge de warning + botão "Recover"

### 3.3 PhaseProgressIndicator

```typescript
interface PhaseProgressIndicatorProps {
  phase: 'planning' | 'coding' | 'validation' | 'complete' | 'failed';
  progress?: number; // 0-100 for coding phase
  subtasks?: Subtask[];
  isStuck?: boolean;
}
```

**Elementos Visuais:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PHASE PROGRESS INDICATOR                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Activity Dot                                                    │
│     ● (pulsing) - durante planning/validation                       │
│                                                                     │
│  2. Progress Bar                                                    │
│     Determinado:    ████████░░░░░░░░░░░░ 45%  (coding)             │
│     Indeterminado:  ░░░████░░░░░░░████░░░     (planning/validation)│
│     Stuck:          ████████████████████      (pulsing warning)    │
│                                                                     │
│  3. Subtask Dots                                                    │
│     ● ● ● ◐ ○ ○ ○ ○                                                │
│     ↑ ↑ ↑ ↑ ↑                                                      │
│     │ │ │ │ └── Pending (gray, dim)                                │
│     │ │ │ └──── In Progress (blue, pulsing)                        │
│     │ │ └────── Failed (red)                                       │
│     │ └──────── Completed (green)                                  │
│     └────────── Completed (green)                                  │
│                                                                     │
│  4. Phase Flow                                                      │
│     ✓ Planning ──── ● Coding ──── ○ Validation                     │
│     (complete)      (active)      (pending)                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Otimização:**

- `IntersectionObserver` para pausar animações quando não visível
- Reduz uso de CPU em cards fora da viewport

### 3.4 TerminalGrid

```typescript
interface TerminalGridProps {
  projectId: string;
  onTerminalSelect?: (terminalId: string) => void;
}

// Layout automático baseado em quantidade
const LAYOUTS = {
  1: { rows: 1, cols: 1 }, // 1x1
  2: { rows: 1, cols: 2 }, // 1x2
  3: { rows: 2, cols: 2 }, // 2x2 (1 vazio)
  4: { rows: 2, cols: 2 }, // 2x2
  5: { rows: 2, cols: 3 }, // 2x3 (1 vazio)
  6: { rows: 2, cols: 3 }, // 2x3
  7: { rows: 3, cols: 3 }, // 3x3 (2 vazios)
  9: { rows: 3, cols: 3 }, // 3x3
  10: { rows: 3, cols: 4 }, // 3x4 (2 vazios)
  12: { rows: 3, cols: 4 }, // 3x4 (máximo)
};
```

**Layout Visual:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Terminals                              + New  | History | Claude All│
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────┬─────────┬─────────┐    Tabs: [T1] [T2] [T3] [+]       │
│  │ Tab 1   │ Tab 2   │ Tab 3   │    (draggable)                     │
│  ├─────────┼─────────┼─────────┤                                    │
│  │         │         │         │                                    │
│  │ Term 1  │ Term 2  │ Term 3  │    Each terminal:                  │
│  │ (idle)  │ (claude)│ (busy)  │    - xterm.js instance             │
│  │         │         │         │    - PTY process                   │
│  │         │         │         │    - Claude mode toggle            │
│  │ $ _     │ claude> │ $ npm   │    - Task association              │
│  │         │         │ install │    - Worktree config               │
│  │         │         │         │                                    │
│  ├─────────┼─────────┼─────────┤                                    │
│  │ Tab 4   │ Tab 5   │ Tab 6   │                                    │
│  ├─────────┼─────────┼─────────┤                                    │
│  │         │         │         │    Status indicators:              │
│  │ Term 4  │ Term 5  │ Term 6  │    🟢 Idle                         │
│  │         │         │         │    🔴 Claude busy                  │
│  │         │         │         │    🟡 Running                      │
│  └─────────┴─────────┴─────────┘                                    │
│                                                                     │
│  [File Explorer Panel]  (optional sidebar)                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**

- Máximo 12 terminais por projeto (memória ~1MB cada)
- Reordenação de abas via drag-and-drop
- Expansão para tela cheia
- Histórico de sessões com restauração
- "Invoke Claude All" para ativar em múltiplos
- File explorer lateral
- Atalhos: Ctrl+T (novo), Ctrl+W (fechar), Ctrl+Shift+E (expandir)

### 3.5 Terminal

```typescript
interface TerminalProps {
  id: string;
  title: string;
  directory: string;
  isActive: boolean;
  claudeMode: boolean;
  associatedTaskId?: string;
  worktreeConfig?: WorktreeConfig;
}

// Estados do terminal
type TerminalStatus =
  | 'idle' // Aguardando input
  | 'running' // Comando executando
  | 'claude-active' // Claude respondendo
  | 'exited'; // Processo encerrado
```

**Indicadores Visuais:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Terminal                                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                                                               │ │
│  │  $ npm install                                                │ │
│  │  added 1234 packages in 45s                                   │ │
│  │                                                               │ │
│  │  $ claude                                                     │ │
│  │  Claude Code activated. How can I help?                       │ │
│  │                                                               │ │
│  │  > Help me implement user authentication                      │ │
│  │  ▌                                                            │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Border colors:                                                     │
│  ├── 🟢 Green border = Claude idle, ready                          │
│  ├── 🔴 Red border = Claude busy, processing                       │
│  └── ⬜ No color = Normal terminal mode                            │
│                                                                     │
│  Actions:                                                           │
│  [Invoke Claude] [Associate Task] [Create Worktree] [Open in IDE]  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.6 AgentProfileSelector

```typescript
interface AgentProfileSelectorProps {
  selectedProfile: string;
  onProfileChange: (profile: AgentProfile) => void;
  onPhaseConfigChange?: (configs: PhaseConfigs) => void;
}

interface AgentProfile {
  id: string;
  name: string;
  model: string;
  thinkingLevel: 'none' | 'low' | 'medium' | 'high';
}

// Perfis pré-definidos
const PROFILES = [
  { id: 'auto', name: 'Auto', model: 'auto', thinking: 'auto' },
  { id: 'complex', name: 'Complex', model: 'claude-opus', thinking: 'high' },
  { id: 'balanced', name: 'Balanced', model: 'claude-sonnet', thinking: 'medium' },
  { id: 'quick', name: 'Quick', model: 'claude-haiku', thinking: 'low' },
  { id: 'custom', name: 'Custom', model: 'user-selected', thinking: 'user-selected' },
];

// Configuração por fase
interface PhaseConfigs {
  spec: { model: string; thinking: string };
  planning: { model: string; thinking: string };
  coding: { model: string; thinking: string };
  qa: { model: string; thinking: string };
}
```

**Layout Visual:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Agent Profile                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Profile:  [Auto ▼] [Complex] [Balanced] [Quick] [Custom]          │
│                                                                     │
│  ┌─ Phase Configuration (for non-custom) ─────────────────────────┐│
│  │                                                                 ││
│  │  Spec Phase:     Model: [Claude Sonnet ▼]  Thinking: [High ▼]  ││
│  │  Planning Phase: Model: [Claude Sonnet ▼]  Thinking: [High ▼]  ││
│  │  Coding Phase:   Model: [Claude Sonnet ▼]  Thinking: [Med  ▼]  ││
│  │  QA Phase:       Model: [Claude Haiku  ▼]  Thinking: [Low  ▼]  ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─ Custom Mode ──────────────────────────────────────────────────┐│
│  │                                                                 ││
│  │  Model:    [Select Model ▼]                                    ││
│  │  Thinking: [Select Level ▼]                                    ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.7 Sidebar

```typescript
interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  collapsed?: boolean;
}

type ViewType =
  | 'kanban'
  | 'terminals'
  | 'roadmap'
  | 'context'
  | 'ideation'
  | 'insights'
  | 'github'
  | 'gitlab'
  | 'worktrees'
  | 'agent-tools'
  | 'changelog'
  | 'settings';
```

**Layout Visual:**

```
┌─────────────┐
│   ≡ Menu    │  ← Collapse toggle
├─────────────┤
│             │
│  📋 Kanban  │  ← Active indicator
│  💻 Terms   │
│  🗺️ Roadmap │
│  📁 Context │
│  💡 Ideate  │
│  📊 Insights│
│             │
├─────────────┤
│  🔗 GitHub  │  ← Integrations
│  🦊 GitLab  │
│             │
├─────────────┤
│  🌳 Trees   │  ← Tools
│  🔧 Tools   │
│  📝 Changes │
│             │
├─────────────┤
│  ⚙️ Settings│
└─────────────┘
```

### 3.8 TaskCreationWizard

```typescript
interface TaskCreationWizardProps {
  projectId: string;
  onClose: () => void;
  onCreated: (task: Task) => void;
  initialDraft?: TaskDraft;
}

interface TaskDraft {
  title: string;
  description: string;
  category: TaskCategory;
  priority: Priority;
  complexity: Complexity;
  impact: Impact;
  agentProfile: string;
  baseBranch?: string;
  useWorktree: boolean;
  fileReferences: string[];
  images: string[];
}
```

**Funcionalidades:**

- Auto-save para localStorage (draft persistence)
- Autocomplete com @ para mencionar arquivos
- File explorer lateral
- Seleção de branch Git
- Configuração de worktree
- Upload de imagens
- Seleção de perfil de agente

**Layout Visual:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Create New Task                                               [X]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Title: [________________________________________________]         │
│                                                                     │
│  Description:                                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Describe the task...                                          │ │
│  │ Use @filename to reference files                              │ │
│  │                                                  [📁 Browse]  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Classification ──────────────────────────────────────────────┐ │
│  │ Category:   [Feature ▼]    Priority: [Medium ▼]               │ │
│  │ Complexity: [Standard ▼]   Impact:   [Medium ▼]               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Agent Configuration ─────────────────────────────────────────┐ │
│  │ Profile: [Auto ▼]                                             │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Git Configuration ───────────────────────────────────────────┐ │
│  │ Base Branch: [main ▼]                                         │ │
│  │ ☑ Create isolated worktree                                    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Referenced Files:                                                  │
│  [src/api/users.ts] [src/web/pages/login.tsx] [+]                  │
│                                                                     │
│  Images:                                                            │
│  [📷 screenshot.png] [+]                                           │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                    [Cancel]  [Create Task]          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Stores de Estado

### 4.1 Visão Geral das Stores

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ZUSTAND STORES (16)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Core:                                                              │
│  ├── task-store.ts        # Tasks e execução                       │
│  ├── terminal-store.ts    # Terminais e sessões                    │
│  ├── project-store.ts     # Projetos abertos                       │
│  └── settings-store.ts    # Configurações do app                   │
│                                                                     │
│  Features:                                                          │
│  ├── roadmap-store.ts     # Roadmap e features                     │
│  ├── ideation-store.ts    # Ideas e brainstorming                  │
│  ├── insights-store.ts    # Análises e métricas                    │
│  ├── changelog-store.ts   # Histórico de mudanças                  │
│  └── context-store.ts     # Contexto do projeto                    │
│                                                                     │
│  Integrations:                                                      │
│  ├── github/              # GitHub integration                     │
│  ├── gitlab-store.ts      # GitLab integration                     │
│  └── claude-profile-store.ts  # Claude profiles                    │
│                                                                     │
│  System:                                                            │
│  ├── auth-failure-store.ts    # Auth errors                        │
│  ├── rate-limit-store.ts      # Rate limiting                      │
│  ├── download-store.ts        # Downloads                          │
│  ├── release-store.ts         # App releases                       │
│  └── file-explorer-store.ts   # File browser                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Task Store (Detalhado)

```typescript
interface TaskState {
  // State
  tasks: Task[];
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;
  taskOrder: TaskOrderState | null;

  // CRUD Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => Promise<void>;

  // Execution
  updateTaskFromPlan: (taskId: string, plan: ImplementationPlan) => void;
  updateExecutionProgress: (taskId: string, progress: ExecutionProgress) => void;

  // Logs
  appendLog: (taskId: string, log: string) => void;
  batchAppendLogs: (taskId: string, logs: string[]) => void;

  // Kanban Order
  setTaskOrder: (order: TaskOrderState) => void;
  reorderTasksInColumn: (status: TaskStatus, activeId: string, overId: string) => void;
  moveTaskToColumnTop: (taskId: string, targetStatus: TaskStatus) => void;
  loadTaskOrder: (projectId: string) => void;
  saveTaskOrder: (projectId: string) => boolean;

  // Async Operations
  loadTasks: (projectId: string) => Promise<void>;
  createTask: (projectId: string, title: string, description: string) => Promise<Task>;
  persistTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  forceCompleteTask: (taskId: string) => Promise<void>;
  archiveTasks: (projectId: string, taskIds: string[]) => Promise<void>;
  recoverStuckTask: (taskId: string) => Promise<void>;

  // Draft Management
  saveDraft: (draft: TaskDraft) => void;
  loadDraft: (projectId: string) => TaskDraft | null;
  clearDraft: (projectId: string) => void;

  // Selectors
  getSelectedTask: () => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
}

// Task Order State (persisted in localStorage)
interface TaskOrderState {
  backlog: string[];
  in_progress: string[];
  ai_review: string[];
  human_review: string[];
  pr_created: string[];
  done: string[];
  error: string[];
}
```

### 4.3 Terminal Store (Detalhado)

```typescript
interface TerminalState {
  // State
  terminals: Terminal[];
  activeTerminalId: string | null;
  outputBuffers: Map<string, string[]>;

  // Lifecycle
  addTerminal: (terminal: Partial<Terminal>) => string;
  addRestoredTerminal: (terminal: Terminal) => void;
  removeTerminal: (terminalId: string) => void;

  // Terminal Actions
  setActiveTerminal: (terminalId: string) => void;
  updateTerminal: (terminalId: string, updates: Partial<Terminal>) => void;
  setTerminalStatus: (terminalId: string, status: TerminalStatus) => void;
  setClaudeMode: (terminalId: string, enabled: boolean) => void;

  // Output
  appendOutput: (terminalId: string, data: string) => void;
  clearOutput: (terminalId: string) => void;
  getOutput: (terminalId: string) => string[];

  // Task Association
  associateTask: (terminalId: string, taskId: string) => void;
  disassociateTask: (terminalId: string) => void;

  // Session Management
  restoreTerminalSessions: (projectId: string) => Promise<void>;
  persistTerminalSessions: (projectId: string) => void;

  // Order
  reorderTerminals: (startIndex: number, endIndex: number) => void;
  getTerminalsByProject: (projectId: string) => Terminal[];
}

interface Terminal {
  id: string;
  title: string;
  projectId: string;
  directory: string;
  status: TerminalStatus;
  claudeMode: boolean;
  associatedTaskId?: string;
  worktreeConfig?: WorktreeConfig;
  displayOrder: number;
  createdAt: string;
}
```

---

## 5. Padrões de UX

### 5.1 Feedback Visual

```yaml
Loading States:
  - Spinner para operações < 3s
  - Progress bar para operações longas
  - Skeleton screens para carregamento inicial
  - Pulsing animation para "thinking"

Success States:
  - Toast notification verde
  - Checkmark animation
  - Border flash verde

Error States:
  - Toast notification vermelha
  - Shake animation
  - Inline error messages
  - Modal para erros críticos

Warning States:
  - Badge amarelo pulsante
  - Banner de warning
  - Tooltip com detalhes
```

### 5.2 Interações

```yaml
Drag & Drop:
  - Visual feedback durante drag (opacity, scale)
  - Drop zones highlighted
  - Smooth reordering animation
  - Ghost element seguindo cursor

Click Actions:
  - Single click: select/focus
  - Double click: edit/expand
  - Right click: context menu
  - Long press (touch): drag mode

Keyboard:
  - Tab: navigate
  - Enter: confirm/execute
  - Escape: cancel/close
  - Ctrl+S: save
  - Ctrl+Z: undo
```

### 5.3 Responsividade

```yaml
Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

Adaptações:
  - Sidebar: collapses em < lg
  - Terminal grid: reduz colunas
  - Kanban: horizontal scroll em mobile
  - Modals: full-screen em < md
```

### 5.4 Acessibilidade

```yaml
ARIA:
  - Labels em todos os botões
  - Roles semânticos
  - Live regions para updates

Focus:
  - Visible focus rings
  - Focus trap em modals
  - Skip links

Color:
  - Contraste WCAG AA mínimo
  - Não depende apenas de cor
  - Ícones acompanham texto
```

---

## 6. Proposta para AIOS Dashboard

### 6.1 Escopo da Proposta

Criar um **dashboard web** para visualização e controle de agentes AIOS, inspirado na interface do Auto-Claude mas adaptado para nosso contexto.

### 6.2 Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AIOS DASHBOARD ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Frontend:                                                          │
│  ├── Framework: Next.js 14+ (App Router)                           │
│  ├── State: Zustand                                                │
│  ├── Styling: Tailwind CSS + shadcn/ui                             │
│  ├── Drag & Drop: @dnd-kit                                         │
│  ├── Terminal: xterm.js (se necessário)                            │
│  └── Charts: Recharts ou Tremor                                    │
│                                                                     │
│  Backend:                                                           │
│  ├── API: Next.js API Routes ou tRPC                               │
│  ├── WebSocket: Socket.io (real-time updates)                      │
│  ├── File System: Via MCP ou API                                   │
│  └── Process: Node.js child_process ou MCP                         │
│                                                                     │
│  Storage:                                                           │
│  ├── State: localStorage + Zustand persist                         │
│  ├── Preferences: cookies ou localStorage                          │
│  └── Data: File system (.aios/)                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Views Propostas

```yaml
Core Views:
  1. Stories Board (Kanban):
    - Colunas: Backlog, In Progress, Review, Done
    - Cards com status de agente atual
    - Drag-and-drop entre colunas
    - Quick actions (start, pause, assign agent)

  2. Agent Monitor:
    - Grid de agentes ativos (@dev, @qa, @architect, etc.)
    - Status real-time (idle, working, waiting)
    - Logs de cada agente
    - Métricas de uso

  3. Terminal View:
    - Terminal integrado (se web)
    - Ou link para IDE/terminal externo
    - Output de comandos executados

  4. Story Detail:
    - Spec completo
    - Implementation plan
    - Progress tracking
    - File changes

  5. Insights:
    - Métricas de produtividade
    - Padrões aprendidos
    - Histórico de sessões

Secondary Views:
  6. Settings:
    - Configuração de agentes
    - Perfis de modelo
    - Integrações

  7. Worktrees:
    - Lista de worktrees ativos
    - Status de cada um
    - Actions (merge, cleanup)
```

### 6.4 Componentes Necessários

```
aios-dashboard/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── ProjectTabs.tsx
│   │   └── StatusBar.tsx
│   │
│   ├── stories/
│   │   ├── StoryBoard.tsx        # Kanban principal
│   │   ├── StoryCard.tsx         # Card de story
│   │   ├── StoryDetail.tsx       # Modal de detalhes
│   │   ├── StoryCreateWizard.tsx # Criação de story
│   │   └── StoryProgress.tsx     # Indicador de progresso
│   │
│   ├── agents/
│   │   ├── AgentMonitor.tsx      # Grid de agentes
│   │   ├── AgentCard.tsx         # Card individual
│   │   ├── AgentSelector.tsx     # Seletor de agente
│   │   ├── AgentLogs.tsx         # Logs do agente
│   │   └── AgentMetrics.tsx      # Métricas
│   │
│   ├── progress/
│   │   ├── PhaseIndicator.tsx    # Indicador de fase
│   │   ├── SubtaskProgress.tsx   # Progresso de subtasks
│   │   └── TimelineView.tsx      # Timeline de execução
│   │
│   ├── terminal/
│   │   ├── TerminalEmbed.tsx     # Terminal embarcado
│   │   └── TerminalOutput.tsx    # Output read-only
│   │
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Dialog.tsx
│       ├── Dropdown.tsx
│       ├── Input.tsx
│       ├── Progress.tsx
│       ├── Tabs.tsx
│       ├── Toast.tsx
│       └── Tooltip.tsx
│
├── stores/
│   ├── story-store.ts
│   ├── agent-store.ts
│   ├── project-store.ts
│   └── settings-store.ts
│
├── lib/
│   ├── api.ts
│   ├── websocket.ts
│   └── utils.ts
│
└── styles/
    ├── globals.css
    └── themes/
        ├── oscura.css
        └── light.css
```

### 6.5 Design System AIOS

```css
/* AIOS Design Tokens - Based on Auto-Claude but customized */

:root {
  /* Brand Colors - AIOS Blue accent instead of yellow */
  --aios-primary: #3b82f6; /* Blue-500 */
  --aios-primary-dark: #2563eb; /* Blue-600 */

  /* Dark Theme (default) */
  --background: #0a0a0f;
  --card: #111116;
  --card-hover: #18181d;
  --border: #27272a;
  --foreground: #fafafa;
  --muted-foreground: #a1a1aa;

  /* Agent Colors */
  --agent-dev: #22c55e; /* Green */
  --agent-qa: #eab308; /* Yellow */
  --agent-architect: #8b5cf6; /* Purple */
  --agent-pm: #3b82f6; /* Blue */
  --agent-po: #f97316; /* Orange */
  --agent-analyst: #06b6d4; /* Cyan */
  --agent-devops: #ec4899; /* Pink */

  /* Status Colors */
  --status-idle: #6b7280; /* Gray */
  --status-working: #3b82f6; /* Blue */
  --status-success: #22c55e; /* Green */
  --status-error: #ef4444; /* Red */
  --status-warning: #f59e0b; /* Amber */

  /* Story Status Colors */
  --story-backlog: #6b7280;
  --story-progress: #3b82f6;
  --story-review: #8b5cf6;
  --story-done: #22c55e;
}
```

### 6.6 Mockup: Story Board

```
┌─────────────────────────────────────────────────────────────────────┐
│  AIOS Dashboard                                    🔔  👤  ⚙️       │
├───────────┬─────────────────────────────────────────────────────────┤
│           │  Project: aios-core                    [+ New Story]    │
│  📋 Board │─────────────────────────────────────────────────────────│
│  🤖 Agents│                                                         │
│  📊 Stats │  ┌─ Backlog ──┐ ┌─ Progress ─┐ ┌─ Review ──┐ ┌─ Done ─┐│
│  ⚙️ Config │  │            │ │            │ │           │ │        ││
│           │  │ ┌────────┐ │ │ ┌────────┐ │ │ ┌───────┐ │ │ ┌────┐ ││
│           │  │ │STORY-45│ │ │ │STORY-42│ │ │ │STORY-│ │ │ │S-40│ ││
│           │  │ │────────│ │ │ │────────│ │ │ │  41   │ │ │ │────│ ││
│           │  │ │Add auth│ │ │ │Fix API │ │ │ │───────│ │ │ │Done│ ││
│           │  │ │        │ │ │ │        │ │ │ │Review │ │ │ └────┘ ││
│           │  │ │[Simple]│ │ │ │🟢 @dev │ │ │ │       │ │ │        ││
│           │  │ └────────┘ │ │ │▓▓▓▓░░░ │ │ │ │🟡 @qa │ │ │ ┌────┐ ││
│           │  │            │ │ │ 65%    │ │ │ └───────┘ │ │ │S-39│ ││
│           │  │ ┌────────┐ │ │ └────────┘ │ │           │ │ └────┘ ││
│           │  │ │STORY-46│ │ │            │ │           │ │        ││
│           │  │ │────────│ │ │ ┌────────┐ │ │           │ │        ││
│           │  │ │Refactor│ │ │ │STORY-43│ │ │           │ │        ││
│           │  │ │utils   │ │ │ │────────│ │ │           │ │        ││
│           │  │ │        │ │ │ │New feat│ │ │           │ │        ││
│           │  │ │[Medium]│ │ │ │        │ │ │           │ │        ││
│           │  │ └────────┘ │ │ │🟣 @arch│ │ │           │ │        ││
│           │  │            │ │ │Planning│ │ │           │ │        ││
│           │  │            │ │ └────────┘ │ │           │ │        ││
│           │  └────────────┘ └────────────┘ └───────────┘ └────────┘│
│           │                                                         │
├───────────┴─────────────────────────────────────────────────────────┤
│  Agents: 🟢 @dev (STORY-42) | 🟡 @qa (STORY-41) | 🟣 @arch (S-43)  │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.7 Mockup: Agent Monitor

```
┌─────────────────────────────────────────────────────────────────────┐
│  AIOS Dashboard > Agent Monitor                    🔔  👤  ⚙️       │
├───────────┬─────────────────────────────────────────────────────────┤
│           │  Active Agents (3/11)                   [Refresh]       │
│  📋 Board │─────────────────────────────────────────────────────────│
│  🤖 Agents│                                                         │
│  📊 Stats │  ┌─────────────────┐  ┌─────────────────┐              │
│  ⚙️ Config │  │  🟢 @dev        │  │  🟡 @qa         │              │
│           │  │  ─────────────  │  │  ─────────────  │              │
│           │  │  Story: S-42    │  │  Story: S-41    │              │
│           │  │  Phase: Coding  │  │  Phase: Review  │              │
│           │  │  ▓▓▓▓▓▓▓░░░ 70% │  │  ▓▓▓▓▓▓▓▓░░ 80% │              │
│           │  │                 │  │                 │              │
│           │  │  Subtask: 4/6   │  │  Tests: 12/15   │              │
│           │  │  [View Logs]    │  │  [View Logs]    │              │
│           │  └─────────────────┘  └─────────────────┘              │
│           │                                                         │
│           │  ┌─────────────────┐  ┌─────────────────┐              │
│           │  │  🟣 @architect  │  │  ⚫ @pm         │              │
│           │  │  ─────────────  │  │  ─────────────  │              │
│           │  │  Story: S-43    │  │  Idle           │              │
│           │  │  Phase: Planning│  │                 │              │
│           │  │  ░░░░░░░░░░ 10% │  │  Last: 2h ago   │              │
│           │  │                 │  │                 │              │
│           │  │  Creating plan  │  │  [Activate]     │              │
│           │  │  [View Logs]    │  │                 │              │
│           │  └─────────────────┘  └─────────────────┘              │
│           │                                                         │
│           │  ── Idle Agents ──────────────────────────────────────  │
│           │  ⚫ @po  ⚫ @analyst  ⚫ @sm  ⚫ @devops  ⚫ @ux        │
│           │                                                         │
├───────────┴─────────────────────────────────────────────────────────┤
│  Total: 3 active | 8 idle | Stories in progress: 4                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.8 Mockup: Story Detail

```
┌─────────────────────────────────────────────────────────────────────┐
│  STORY-42: Fix API response handling                          [X]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Status: 🔵 In Progress    Agent: 🟢 @dev    Complexity: Standard  │
│                                                                     │
│  ┌─ Progress ──────────────────────────────────────────────────────┐│
│  │                                                                 ││
│  │  ✓ Gather ──── ✓ Plan ──── ● Code ──── ○ Review ──── ○ Done    ││
│  │                                                                 ││
│  │  ████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░ 65%    ││
│  │                                                                 ││
│  │  Subtasks: ● ● ● ● ○ ○                                         ││
│  │  4 of 6 completed                                               ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─ Tabs ──────────────────────────────────────────────────────────┐│
│  │ [Spec] [Plan] [Changes] [Logs]                                  ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │                                                                 ││
│  │  ## Implementation Plan                                         ││
│  │                                                                 ││
│  │  ### Phase 1: Backend (3/4 ✓)                                   ││
│  │  - [x] 1.1 Update error handler                                 ││
│  │  - [x] 1.2 Add response types                                   ││
│  │  - [x] 1.3 Update tests                                         ││
│  │  - [ ] 1.4 Add validation ← Current                             ││
│  │                                                                 ││
│  │  ### Phase 2: Frontend (0/2)                                    ││
│  │  - [ ] 2.1 Update API client                                    ││
│  │  - [ ] 2.2 Add error handling UI                                ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  [Pause] [Reassign Agent] [View in IDE]                [Close]     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.9 Roadmap de Implementação

```yaml
Fase 1: MVP (2-3 semanas)
  - Setup Next.js + Tailwind + shadcn/ui
  - Story Board (Kanban básico)
  - Story Card component
  - Story Detail modal
  - Integração com .aios/ file system

Fase 2: Agent Monitor (2 semanas)
  - Agent cards com status
  - Real-time updates (polling ou WebSocket)
  - Agent logs viewer
  - Agent selector

Fase 3: Progress Tracking (1-2 semanas)
  - Phase indicators
  - Subtask progress
  - Timeline view
  - Notifications

Fase 4: Polish (1 semana)
  - Dark/light themes
  - Responsive design
  - Keyboard shortcuts
  - Settings page

Fase 5: Advanced (opcional)
  - Terminal embed
  - GitHub/GitLab integration
  - Metrics dashboard
  - Export/import
```

---

## 7. Deep Dive: Código-Fonte Local

> **Nota:** Esta seção foi adicionada após análise local do repositório clonado em `/Users/alan/Code/Auto-Claude/`

### 7.1 task-store.ts - Padrões Avançados de Estado

**Arquivo:** `apps/frontend/src/renderer/stores/task-store.ts` (1,108 linhas)

#### 7.1.1 Arquitetura de Listeners para Status Change

```typescript
// Listeners armazenados FORA do Zustand para evitar re-renders
const taskStatusChangeListeners = new Set<
  (taskId: string, oldStatus: TaskStatus | undefined, newStatus: TaskStatus) => void
>();

// Notify via queueMicrotask para garantir execução após state update
queueMicrotask(() => {
  notifyTaskStatusChange(taskId, oldStatus, status);
});
```

**Por que isso importa:** Permite que o sistema de Queue auto-promotion reaja a mudanças de status sem causar re-renders desnecessários.

#### 7.1.2 Validação de Planos de Implementação

```typescript
function validatePlanData(plan: ImplementationPlan): boolean {
  // Valida phases array
  if (!plan.phases || !Array.isArray(plan.phases)) return false;

  // Valida cada phase tem subtasks
  for (const phase of plan.phases) {
    if (!phase.subtasks || !Array.isArray(phase.subtasks)) return false;

    // Valida cada subtask tem description (crítico para UI)
    for (const subtask of phase.subtasks) {
      if (!subtask.description?.trim()) return false;
    }
  }
  return true;
}
```

#### 7.1.3 Proteção contra Race Conditions (Flip-Flop Bug)

```typescript
// RACE CONDITION FIX: ANY active phase means NO status recalculation from plan data
const activePhases: ExecutionPhase[] = ['planning', 'coding', 'qa_review', 'qa_fixing'];
const isInActivePhase = Boolean(
  t.executionProgress?.phase && activePhases.includes(t.executionProgress.phase)
);

// Terminal phases should NOT trigger status recalculation
const isInTerminalPhase = Boolean(
  t.executionProgress?.phase && isTerminalPhase(t.executionProgress.phase)
);

// Terminal task statuses NEVER recalculated from plan data
const TERMINAL_TASK_STATUSES: TaskStatus[] = ['pr_created', 'done', 'error'];
const isInTerminalStatus = TERMINAL_TASK_STATUSES.includes(t.status);
```

#### 7.1.4 Task Order por Coluna (Kanban Persistence)

```typescript
interface TaskOrderState {
  backlog: string[];
  queue: string[];
  in_progress: string[];
  ai_review: string[];
  human_review: string[];
  done: string[];
  pr_created: string[];
  error: string[];
}

// Persistência via localStorage com prefixo por projeto
const TASK_ORDER_KEY_PREFIX = 'task-order-state';
function getTaskOrderKey(projectId: string): string {
  return `${TASK_ORDER_KEY_PREFIX}-${projectId}`;
}
```

#### 7.1.5 Draft Management para Task Creation

```typescript
interface TaskDraft {
  projectId: string;
  title: string;
  description: string;
  images: ImageAttachment[];
  category?: string;
  priority?: string;
  complexity?: string;
  impact?: string;
  savedAt?: Date;
}

// Imagens armazenadas sem data (evita limite de localStorage)
const draftToStore = {
  ...draft,
  images: draft.images.map((img) => ({
    ...img,
    data: undefined, // Don't store full image data
  })),
};
```

#### 7.1.6 Helpers de Detecção de Estado

```typescript
// Detecta tasks em human_review que crasharam antes de implementar
function isIncompleteHumanReview(task: Task): boolean {
  if (task.status !== 'human_review') return false;
  if (task.reviewReason === 'errors') return false; // JSON errors são intencionais
  if (!task.subtasks?.length) return true;
  return task.subtasks.filter((s) => s.status === 'completed').length === 0;
}
```

---

### 7.2 terminal-store.ts - Padrões de Gerenciamento de Terminal

**Arquivo:** `apps/frontend/src/renderer/stores/terminal-store.ts` (549 linhas)

#### 7.2.1 Callbacks FORA do Zustand (Crítico!)

```typescript
/**
 * Module-level Map to store terminal ID -> xterm write callback mappings.
 *
 * DESIGN NOTE: This is stored outside of Zustand state because:
 * 1. Callbacks are functions and shouldn't be serialized in state
 * 2. The callbacks need to be accessible from the global terminal listener
 * 3. Registration/unregistration happens on terminal mount/unmount
 */
const xtermCallbacks = new Map<string, (data: string) => void>();

export function registerOutputCallback(terminalId: string, callback: (data: string) => void): void {
  xtermCallbacks.set(terminalId, callback);
}

export function writeToTerminal(terminalId: string, data: string): void {
  // Always buffer the data to ensure persistence
  terminalBufferManager.append(terminalId, data);

  // If terminal has callback, write to xterm immediately
  const callback = xtermCallbacks.get(terminalId);
  if (callback) callback(data);
}
```

#### 7.2.2 Interface de Terminal

```typescript
export interface Terminal {
  id: string;
  title: string;
  status: TerminalStatus; // 'idle' | 'running' | 'claude-active' | 'exited'
  cwd: string;
  createdAt: Date;
  isClaudeMode: boolean;
  claudeSessionId?: string; // Para resume
  isRestored?: boolean; // Restaurado de sessão salva
  associatedTaskId?: string; // Task associada
  projectPath?: string; // Multi-project support
  worktreeConfig?: TerminalWorktreeConfig;
  isClaudeBusy?: boolean; // Visual indicator (red/green border)
  pendingClaudeResume?: boolean; // Resume diferido até aba ativada
  displayOrder?: number; // Persistência de ordem de abas
  claudeNamedOnce?: boolean; // Evita renomear múltiplas vezes
}
```

#### 7.2.3 Limites por Projeto

```typescript
// Maximum terminals per project - limited to 12 to prevent:
// - Excessive memory usage from terminal buffers (~1MB each)
// - PTY process resource exhaustion
maxTerminals: (12,
  function getActiveProjectTerminalCount(terminals: Terminal[], projectPath?: string): number {
    return terminals.filter((t) => t.status !== 'exited' && t.projectPath === projectPath).length;
  });
```

#### 7.2.4 Restauração de Sessões com Race Protection

```typescript
// Track in-progress restore operations to prevent race conditions
const restoringProjects = new Set<string>();

export async function restoreTerminalSessions(projectPath: string): Promise<void> {
  // Prevent concurrent restores for same project
  if (restoringProjects.has(projectPath)) return;
  restoringProjects.add(projectPath);

  try {
    // Check if PTY processes are alive for existing terminals
    const aliveChecks = await Promise.all(
      projectTerminals.map(async (terminal) => {
        const result = await window.electronAPI.checkTerminalPtyAlive(terminal.id);
        return { terminal, alive: result.success && result.data?.alive === true };
      })
    );

    // Remove dead terminals from store
    // ...
  } finally {
    restoringProjects.delete(projectPath);
  }
}
```

---

### 7.3 Terminal.tsx - Padrões de Componente Complexo

**Arquivo:** `apps/frontend/src/renderer/components/Terminal.tsx` (597 linhas)

#### 7.3.1 Refs para Controle de Ciclo de Vida

```typescript
const isMountedRef = useRef(true);
const isCreatedRef = useRef(false);
// Track deliberate recreation (prevents exit handlers during controlled recreation)
const isRecreatingRef = useRef(false);
// Store pending worktree config during recreation (race condition fix)
const pendingWorktreeConfigRef = useRef<TerminalWorktreeConfig | null>(null);
// Track last sent PTY dimensions to prevent redundant resize calls
const lastPtyDimensionsRef = useRef<{ cols: number; rows: number } | null>(null);
```

#### 7.3.2 Claude Busy Indicator (Borda Visual)

```typescript
// Red (busy) = Claude is actively processing
// Green (idle) = Claude is ready for input
const isClaudeBusy = terminal?.isClaudeBusy;
const showClaudeBusyIndicator = terminal?.isClaudeMode && isClaudeBusy !== undefined;

<div className={cn(
  'flex h-full flex-col rounded-lg border bg-[#0B0B0F]',
  isActive ? 'border-primary ring-1 ring-primary/20' : 'border-border',
  showClaudeBusyIndicator && isClaudeBusy && 'border-red-500/60 ring-1 ring-red-500/20',
  showClaudeBusyIndicator && !isClaudeBusy && 'border-green-500/60 ring-1 ring-green-500/20'
)}>
```

#### 7.3.3 Deferred Claude Resume (Evita Crash)

```typescript
// Trigger deferred Claude resume when terminal becomes active
// Prevents all terminals from resuming simultaneously on app startup
useEffect(() => {
  if (isActive && terminal?.pendingClaudeResume) {
    useTerminalStore.getState().setPendingClaudeResume(id, false);
    window.electronAPI.activateDeferredClaudeResume(id);
  }
}, [isActive, id, terminal?.pendingClaudeResume]);
```

#### 7.3.4 TransitionEnd para Resize Confiável

```typescript
// RAF fallback for test environments
const raf =
  typeof requestAnimationFrame !== 'undefined'
    ? requestAnimationFrame
    : (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0);

const handleTransitionEnd = (e: TransitionEvent) => {
  const relevantProps = ['height', 'width', 'flex', 'max-height', 'max-width'];
  if (relevantProps.some((prop) => e.propertyName.includes(prop))) {
    retryCount = 0;
    fitSucceeded = false;
    performFit();
  }
};

container.addEventListener('transitionend', handleTransitionEnd);
container.parentElement?.addEventListener('transitionend', handleTransitionEnd);
```

---

### 7.4 TerminalGrid.tsx - Layout e Drag-Drop

**Arquivo:** `apps/frontend/src/renderer/components/TerminalGrid.tsx` (618 linhas)

#### 7.4.1 Grid Auto-Layout

```typescript
const gridLayout = useMemo(() => {
  const count = terminals.length;
  if (count === 0) return { rows: 0, cols: 0 };
  if (count === 1) return { rows: 1, cols: 1 };
  if (count === 2) return { rows: 1, cols: 2 };
  if (count <= 4) return { rows: 2, cols: 2 };
  if (count <= 6) return { rows: 2, cols: 3 };
  if (count <= 9) return { rows: 3, cols: 3 };
  return { rows: 3, cols: 4 }; // Max 12 terminals = 3x4
}, [terminals.length]);
```

#### 7.4.2 Staggered Terminal Initialization

```typescript
// Stagger terminal initialization to prevent race conditions when multiple
// terminals try to initialize and measure dimensions simultaneously
const TERMINAL_INIT_STAGGER_MS = 75;

for (const sessionResult of result.data.sessions) {
  if (sessionResult.success) {
    const fullSession = sortedSessions.find((s) => s.id === sessionResult.id);
    if (fullSession) {
      addRestoredTerminal(fullSession);
      // Stagger terminal initialization to prevent race conditions
      await new Promise((resolve) => setTimeout(resolve, TERMINAL_INIT_STAGGER_MS));
    }
  }
}
```

#### 7.4.3 Expanded Terminal Mode

```typescript
const [expandedTerminalId, setExpandedTerminalId] = useState<string | null>(null);

// Toggle terminal expand state
const handleToggleExpand = useCallback((terminalId: string) => {
  setExpandedTerminalId(prev => prev === terminalId ? null : terminalId);
}, []);

{expandedTerminalId ? (
  // Show only the expanded terminal (fullscreen)
  <SortableTerminalWrapper
    id={expandedTerminal.id}
    isExpanded={true}
    onToggleExpand={() => handleToggleExpand(expandedTerminal.id)}
  />
) : (
  // Show the normal grid layout
  <SortableContext items={terminalIds} strategy={rectSortingStrategy}>
    {/* react-resizable-panels grid */}
  </SortableContext>
)}
```

#### 7.4.4 Session History com Restore por Data

```typescript
interface SessionDateInfo {
  date: string;
  label: string;
  sessionCount: number;
}

const [sessionDates, setSessionDates] = useState<SessionDateInfo[]>([]);

const handleRestoreFromDate = useCallback(
  async (date: string) => {
    // Close all existing terminals
    for (const terminal of terminals) {
      await window.electronAPI.destroyTerminal(terminal.id);
      removeTerminal(terminal.id);
    }

    // Restore sessions from selected date
    const result = await window.electronAPI.restoreTerminalSessionsFromDate(date, projectPath);
    // ...
  },
  [projectPath, terminals, removeTerminal]
);
```

---

### 7.5 useXterm.ts - Hook de Terminal

**Arquivo:** `apps/frontend/src/renderer/components/terminal/useXterm.ts` (518 linhas)

#### 7.5.1 Buffer Serialization com ANSI Codes

```typescript
import { SerializeAddon } from '@xterm/addon-serialize';

const serializeBuffer = useCallback(() => {
  if (xtermRef.current && serializeAddonRef.current) {
    // Preserves ANSI escape codes for colors, formatting, and prompt
    const serialized = serializeAddonRef.current.serialize();
    if (serialized && serialized.length > 0) {
      terminalBufferManager.set(terminalId, serialized);
    }
  }
}, [terminalId]);

const dispose = useCallback(() => {
  // Serialize buffer before disposing to preserve ANSI formatting
  serializeBuffer();
  if (xtermRef.current) {
    xtermRef.current.dispose();
    xtermRef.current = null;
  }
}, [serializeBuffer]);
```

#### 7.5.2 Custom Key Handlers por OS

```typescript
xterm.attachCustomKeyEventHandler((event) => {
  const isMod = event.metaKey || event.ctrlKey;

  // SHIFT+Enter for multi-line input (matches VS Code/Cursor behavior)
  if (event.key === 'Enter' && event.shiftKey && !isMod && event.type === 'keydown') {
    xterm.input('\x1b\n'); // ESC + newline
    return false;
  }

  // CMD+Backspace (Mac) or Ctrl+Backspace (Win/Linux) to delete line
  if (event.key === 'Backspace' && event.type === 'keydown' && isMod) {
    xterm.input('\x15'); // Ctrl+U (kill line backward)
    return false;
  }

  // Smart copy: copy if selected, send ^C if not
  if (isMod && !event.shiftKey && (event.key === 'c' || event.key === 'C')) {
    if (handleCopyToClipboard()) return false; // Copy performed
    return true; // Let ^C pass through (interrupt signal)
  }

  // ...
});
```

#### 7.5.3 Font Settings Reactivas via Subscription

```typescript
// Subscribe to store changes reactively
useEffect(() => {
  const xterm = xtermRef.current;
  if (!xterm) return;

  const unsubscribe = useTerminalFontSettingsStore.subscribe(() => {
    const latestSettings = useTerminalFontSettingsStore.getState();

    xterm.options.cursorBlink = settings.cursorBlink;
    xterm.options.cursorStyle = settings.cursorStyle;
    xterm.options.fontSize = settings.fontSize;
    xterm.options.fontWeight = settings.fontWeight;
    xterm.options.fontFamily = settings.fontFamily.join(', ');
    // ...

    xterm.refresh(0, xterm.rows - 1);
  });

  return unsubscribe;
}, [terminalId]);
```

#### 7.5.4 Dimensions Ready Callback

```typescript
interface UseXtermOptions {
  terminalId: string;
  onCommandEnter?: (command: string) => void;
  onResize?: (cols: number, rows: number) => void;
  onDimensionsReady?: (cols: number, rows: number) => void; // Critical for PTY creation
}

// Call onDimensionsReady once when we have valid dimensions
if (!dimensionsReadyCalledRef.current && cols > 0 && rows > 0) {
  dimensionsReadyCalledRef.current = true;
  onDimensionsReady?.(cols, rows);
}
```

---

### 7.6 Resumo dos Padrões para AIOS

| Padrão                          | Benefício                           | Aplicação AIOS               |
| ------------------------------- | ----------------------------------- | ---------------------------- |
| **Listeners fora do Zustand**   | Evita re-renders, permite callbacks | Story status change handlers |
| **Race condition protection**   | Previne flip-flop bugs              | Story phase transitions      |
| **Task order persistence**      | Kanban drag-drop survives refresh   | Story Board persistence      |
| **Draft management**            | Salva trabalho não finalizado       | Story creation wizard        |
| **Terminal callbacks externos** | Performance com xterm               | Se implementar terminal      |
| **Deferred initialization**     | Previne crash por sobrecarga        | Agent initialization         |
| **Staggered loading**           | Evita race conditions               | Multiple agent startup       |
| **Claude busy indicator**       | UX de status visual                 | Agent busy/idle indicator    |
| **TransitionEnd listeners**     | Resize confiável após animações     | Panel resize handling        |
| **Buffer serialization**        | Preserva ANSI formatting            | Log persistence              |

---

## Conclusão

A análise do frontend do Auto-Claude revela uma interface bem estruturada com:

1. **Componentes Modulares** - 51+ componentes reutilizáveis
2. **Estado Centralizado** - 16 stores Zustand especializadas
3. **Design System Coeso** - Tokens, temas, tipografia definidos
4. **UX Consistente** - Padrões de interação bem definidos

Para o AIOS Dashboard, recomendamos:

1. **Começar pelo Story Board** - É o core da experiência
2. **Usar shadcn/ui** - Componentes prontos, customizáveis
3. **Zustand para estado** - Leve, eficiente, patterns conhecidos
4. **Design dark-first** - Seguindo tendência do Auto-Claude

**Próximo passo:** Criar protótipo interativo do Story Board para validação.

---

_Documento gerado por Aria (Architect Agent) - AIOS Framework_
_Data: 2026-01-28_
