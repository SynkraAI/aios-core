# 🏛️ AIOS Dashboard - Arquitectura Completa

> **Versión:** 2.0.0
> **Fecha:** 2026-01-29
> **Estado:** Producción
> **Autor:** @architect (Aria)

> **ES** | [EN](../architecture/dashboard-architecture.md) | [PT](../pt/architecture/dashboard-architecture.md)

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura de Directorios](#estructura-de-directorios)
4. [Arquitectura de Componentes](#arquitectura-de-componentes)
5. [Sistema de Gestión de Estado](#sistema-de-gestión-de-estado)
6. [APIs y Comunicación](#apis-y-comunicación)
7. [Design System](#design-system)
8. [Flujo de Datos](#flujo-de-datos)
9. [Patrones y Convenciones](#patrones-y-convenciones)
10. [Extensibilidad](#extensibilidad)

### 📚 Documentos Relacionados

| Documento                                        | Descripción                                                |
| ------------------------------------------------ | -------------------------------------------------------- |
| [dashboard-realtime.md](./dashboard-realtime.md) | Arquitectura de Observabilidad en Tiempo Real (CLI → Dashboard) |

---

## Visión General

El AIOS Dashboard es una aplicación Next.js que proporciona una interfaz visual para monitorear y gestionar el sistema AIOS. Se comunica con el CLI/AIOS a través de archivos de estado en el sistema de archivos y Server-Sent Events (SSE).

### Principios Arquitectónicos

1. **CLI-First**: Dashboard es complementario al CLI, no sustituto
2. **File-Based Communication**: Estado a través de `.aios/dashboard/status.json`
3. **Real-Time Updates**: SSE con fallback a polling
4. **Offline-Capable**: Funciona con datos mock en desarrollo
5. **Type-Safe**: TypeScript en toda la pila

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AIOS DASHBOARD                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         PRESENTATION LAYER                        │   │
│  │  ┌─────────┐ ┌──────────────────────────────────────────────┐    │   │
│  │  │ Sidebar │ │               Main Content                    │    │   │
│  │  │         │ │  ┌────────────────────────────────────────┐  │    │   │
│  │  │ Kanban  │ │  │           ProjectTabs                  │  │    │   │
│  │  │ Agents  │ │  ├────────────────────────────────────────┤  │    │   │
│  │  │ Termnls │ │  │                                        │  │    │   │
│  │  │ Insight │ │  │    Page Content (KanbanBoard,          │  │    │   │
│  │  │ Context │ │  │    AgentMonitor, TerminalGrid, etc)    │  │    │   │
│  │  │ Roadmap │ │  │                                        │  │    │   │
│  │  │ GitHub  │ │  └────────────────────────────────────────┘  │    │   │
│  │  │ Settngs │ │                                              │    │   │
│  │  └─────────┘ └──────────────────────────────────────────────┘    │   │
│  │  ┌───────────────────────────────────────────────────────────┐   │   │
│  │  │                      StatusBar                             │   │   │
│  │  │  [Connection] [Rate Limit] [Claude]    [@agent] [Notifs]  │   │   │
│  │  └───────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         STATE LAYER (Zustand)                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │  story   │ │  agent   │ │ terminal │ │    ui    │ │settings│ │   │
│  │  │  store   │ │  store   │ │  store   │ │  store   │ │ store  │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         DATA LAYER (SWR + Hooks)                  │   │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐│   │
│  │  │  useStories()  │ │  useAgents()   │ │  useRealtimeStatus()   ││   │
│  │  │  useAiosStatus │ │                │ │  (SSE + Polling)       ││   │
│  │  └────────────────┘ └────────────────┘ └────────────────────────┘│   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         API LAYER (Next.js Routes)                │   │
│  │  /api/stories  │  /api/status  │  /api/events  │  /api/github    │   │
│  │      (CRUD)    │   (polling)   │    (SSE)      │   (webhook)     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ File I/O + SSE
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              FILESYSTEM                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ .aios/dashboard/         │  │ docs/stories/                        │ │
│  │   status.json (CLI→UI)   │  │   *.md (Stories Markdown)            │ │
│  └──────────────────────────┘  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     ▲
                                     │ Write
                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLI / AIOS AGENTS                                │
│  @dev │ @qa │ @architect │ @pm │ @po │ @analyst │ @devops               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Core Framework

| Tecnología     | Versión | Propósito                           |
| -------------- | ------- | ----------------------------------- |
| **Next.js**    | 16.1.6  | Framework full-stack con App Router |
| **React**      | 19.2.3  | Librería UI con Server Components    |
| **TypeScript** | 5.x     | Seguridad de tipos en toda la base de código      |

### Gestión de Estado

| Tecnología  | Versión | Propósito                     |
| ----------- | ------- | ----------------------------- |
| **Zustand** | 5.0.10  | Estado global con persistencia |
| **SWR**     | 2.3.8   | Obtención de datos y caché         |

### UI y Estilos

| Tecnología       | Versión  | Propósito                                    |
| ---------------- | -------- | -------------------------------------------- |
| **Tailwind CSS** | 4.x      | CSS de utilidad                            |
| **Radix UI**     | latest   | Primitivos accesibles (Dialog, Context Menu) |
| **Lucide React** | 0.563.0  | Sistema de iconos SVG                        |
| **dnd-kit**      | 6.3.1    | Arrastra y suelta para Kanban                    |

### Utilidades

| Tecnología         | Versión | Propósito                             |
| ------------------ | ------- | ------------------------------------- |
| **gray-matter**    | 4.0.3   | Parseo de frontmatter YAML en Markdown |
| **clsx**           | 2.1.1   | Nombres de clases condicionales               |
| **tailwind-merge** | 3.4.0   | Fusión de clases Tailwind             |

---

## Estructura de Directorios

```
apps/dashboard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (dashboard)/              # Grupo de ruta Dashboard
│   │   │   ├── layout.tsx            # Layout de Dashboard (AppShell)
│   │   │   ├── agents/page.tsx       # Página de monitor de agentes
│   │   │   ├── github/page.tsx       # Integración con GitHub
│   │   │   ├── kanban/page.tsx       # Tablero de stories
│   │   │   ├── settings/page.tsx     # Panel de configuración
│   │   │   └── terminals/page.tsx    # Sesiones de terminal
│   │   ├── api/                      # Rutas de API
│   │   │   ├── events/route.ts       # Endpoint SSE
│   │   │   ├── github/route.ts       # Proxy de API GitHub
│   │   │   ├── logs/route.ts         # Streaming de logs
│   │   │   ├── qa/metrics/route.ts   # Métricas QA
│   │   │   ├── status/route.ts       # Polling de estado AIOS
│   │   │   └── stories/              # CRUD de stories
│   │   │       ├── route.ts          # GET/POST /api/stories
│   │   │       └── [id]/route.ts     # GET/PUT/DELETE /api/stories/:id
│   │   ├── globals.css               # Tokens de diseño + utilidades
│   │   ├── layout.tsx                # Layout raíz
│   │   └── page.tsx                  # Redirección raíz
│   │
│   ├── components/                   # Componentes React
│   │   ├── agents/                   # Componentes relacionados con agentes
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentMonitor.tsx
│   │   │   └── index.ts
│   │   ├── context/                  # Panel de contexto
│   │   │   ├── ContextPanel.tsx
│   │   │   └── index.ts
│   │   ├── github/                   # Integración con GitHub
│   │   │   ├── GitHubPanel.tsx
│   │   │   └── index.ts
│   │   ├── insights/                 # Análisis/insights
│   │   │   ├── InsightsPanel.tsx
│   │   │   └── index.ts
│   │   ├── kanban/                   # Tablero Kanban
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── SortableStoryCard.tsx
│   │   │   └── index.ts
│   │   ├── layout/                   # Componentes de layout
│   │   │   ├── AppShell.tsx
│   │   │   ├── ProjectTabs.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   └── index.ts
│   │   ├── qa/                       # Componentes QA
│   │   │   └── QAMetricsPanel.tsx
│   │   ├── roadmap/                  # Vista de roadmap
│   │   │   ├── RoadmapCard.tsx
│   │   │   ├── RoadmapView.tsx
│   │   │   └── index.ts
│   │   ├── settings/                 # Configuración
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── index.ts
│   │   ├── stories/                  # Componentes de stories
│   │   │   ├── StoryCard.tsx
│   │   │   ├── StoryCreateModal.tsx
│   │   │   ├── StoryDetailModal.tsx
│   │   │   ├── StoryEditModal.tsx
│   │   │   └── index.ts
│   │   ├── terminal/                 # Salida de terminal
│   │   │   ├── TerminalOutput.tsx
│   │   │   └── index.ts
│   │   ├── terminals/                # Grid de sesiones de terminal
│   │   │   ├── TerminalCard.tsx
│   │   │   ├── TerminalGrid.tsx
│   │   │   ├── TerminalOutput.tsx
│   │   │   ├── TerminalStream.tsx
│   │   │   └── index.ts
│   │   └── ui/                       # Componentes UI base
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── fab.tsx
│   │       ├── icon.tsx
│   │       ├── progress-bar.tsx
│   │       ├── section-label.tsx
│   │       ├── skeleton.tsx
│   │       ├── status-badge.tsx
│   │       ├── status-dot.tsx
│   │       └── tag.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── index.ts
│   │   ├── use-agents.ts             # Datos de agentes + polling
│   │   ├── use-aios-status.ts        # Estado con SWR
│   │   ├── use-realtime-status.ts    # Conexión SSE
│   │   └── use-stories.ts            # Obtención de datos de stories
│   │
│   ├── lib/                          # Utilidades
│   │   ├── icons.ts                  # Sistema de iconos (mapeo de lucide)
│   │   ├── mock-data.ts              # Datos mock para dev/demo
│   │   └── utils.ts                  # cn(), formatDate(), etc.
│   │
│   ├── stores/                       # Stores de Zustand
│   │   ├── agent-store.ts            # Estado de agentes
│   │   ├── index.ts
│   │   ├── projects-store.ts         # Tabs de múltiples proyectos
│   │   ├── settings-store.ts         # Configuración de usuario
│   │   ├── story-store.ts            # Stories + orden de Kanban
│   │   ├── terminal-store.ts         # Sesiones de terminal
│   │   └── ui-store.ts               # Estado de UI (sidebar, vista)
│   │
│   └── types/                        # Tipos TypeScript
│       └── index.ts                  # Todos los tipos compartidos
│
├── components.json                   # Configuración shadcn/ui
├── next-env.d.ts                     # Tipos de Next.js
├── next.config.ts                    # Configuración de Next.js
├── package.json                      # Dependencias
├── tailwind.config.ts                # Configuración de Tailwind (si se usa)
└── tsconfig.json                     # Configuración de TypeScript
```

---

## Arquitectura de Componentes

### Jerarquía de Componentes

```
<RootLayout>                          # src/app/layout.tsx
  └── <DashboardLayout>               # src/app/(dashboard)/layout.tsx
        └── <AppShell>                # Wrapper principal
              ├── <Sidebar>           # Navegación lateral
              │     └── <SidebarNavItem>[]
              │
              ├── <Main>              # Área de contenido
              │     ├── <ProjectTabs> # Tabs de proyectos
              │     └── {children}    # Contenido de la página
              │
              └── <StatusBar>         # Barra de estado
                    ├── <StatusIndicator>
                    ├── <RateLimitDisplay>
                    ├── <ActiveAgentBadge>
                    └── <NotificationBadge>
```

### Componentes Principales

#### AppShell

```typescript
// Responsabilidades:
// - Layout maestro (sidebar + contenido + barra de estado)
// - Atajos de teclado globales ([ para alternar sidebar)
// - Prevención de desajuste de hidratación

interface AppShellProps {
  children: React.ReactNode;
}
```

#### KanbanBoard

```typescript
// Responsabilidades:
// - Renderizar columnas de estado
// - Arrastra y suelta entre columnas
// - Gestionar modales (crear/editar story)

interface KanbanBoardProps {
  onStoryClick?: (story: Story) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}
```

#### AgentMonitor

```typescript
// Responsabilidades:
// - Grid de agentes activos/inactivos
// - Toggle de auto-refresh (En Vivo/Pausado)
// - Indicador de estado de polling
```

---

## Sistema de Gestión de Estado

### Arquitectura de Stores

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ZUSTAND STORES                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        story-store                               │    │
│  │  Estado:                                                          │    │
│  │    - stories: Record<string, Story>                             │    │
│  │    - storyOrder: Record<StoryStatus, string[]>  ← PERSISTIDO    │    │
│  │    - isLoading, error                                           │    │
│  │  Acciones:                                                        │    │
│  │    - setStories(), addStory(), updateStory(), deleteStory()     │    │
│  │    - moveStory(), reorderInColumn()                             │    │
│  │  Selectores:                                                      │    │
│  │    - getStoriesByStatus(), getStoryById(), getEpics()           │    │
│  │  Características:                                                       │    │
│  │    - Protección de condición de carrera (operationsInProgress)            │    │
│  │    - Listeners de cambio de estado (patrón pub/sub)                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        agent-store                               │    │
│  │  Estado:                                                          │    │
│  │    - agents: Record<AgentId, Agent>                             │    │
│  │    - activeAgentId: AgentId | null                              │    │
│  │    - pollingInterval, isPolling, lastPolledAt                   │    │
│  │  Acciones:                                                        │    │
│  │    - setActiveAgent(), clearActiveAgent(), updateAgent()        │    │
│  │    - handleRealtimeUpdate()  ← Manejador SSE                      │    │
│  │  Selectores:                                                      │    │
│  │    - getActiveAgents(), getIdleAgents(), getAgentById()         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        ui-store                                  │    │
│  │  Estado:  (PERSISTIDO)                                            │    │
│  │    - sidebarCollapsed: boolean                                  │    │
│  │    - activeView: SidebarView                                    │    │
│  │  Acciones:                                                        │    │
│  │    - toggleSidebar(), setSidebarCollapsed(), setActiveView()    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        projects-store                            │    │
│  │  Estado:  (PERSISTIDO)                                            │    │
│  │    - projects: Project[]                                        │    │
│  │    - activeProjectId: string | null                             │    │
│  │  Acciones:                                                        │    │
│  │    - addProject(), removeProject(), setActiveProject()          │    │
│  │    - reorderProjects(), closeOtherProjects(), closeAllProjects()│    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        settings-store                            │    │
│  │  Estado:  (PERSISTIDO)                                            │    │
│  │    - settings: DashboardSettings                                │    │
│  │      - theme: 'dark' | 'light' | 'system'                       │    │
│  │      - useMockData: boolean                                     │    │
│  │      - autoRefresh: boolean                                     │    │
│  │      - refreshInterval: number                                  │    │
│  │      - storiesPath: string                                      │    │
│  │      - agentColors: Record<string, string>                      │    │
│  │  Acciones:                                                        │    │
│  │    - updateSettings(), setTheme(), resetToDefaults()            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        terminal-store                            │    │
│  │  Estado:                                                          │    │
│  │    - terminals: Record<string, Terminal>                        │    │
│  │    - activeTerminalId: string | null                            │    │
│  │  Acciones:                                                        │    │
│  │    - createTerminal(), removeTerminal()                         │    │
│  │    - appendLine(), appendLines(), clearTerminal()               │    │
│  │    - setTerminalStatus()                                        │    │
│  │  Características:                                                       │    │
│  │    - Buffer de líneas máximo (por defecto 1000)                            │    │
│  │    - Auto-trim cuando excede el límite                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Persistencia

| Store            | Clave de localStorage          | Lo que persiste                   |
| ---------------- | ----------------------------- | -------------------------------- |
| `story-store`    | `aios-stories`            | `storyOrder` (orden de las columnas) |
| `ui-store`       | `aios-ui`                 | `sidebarCollapsed`, `activeView` |
| `projects-store` | `aios-projects`           | `projects`, `activeProjectId`    |
| `settings-store` | `aios-dashboard-settings` | Todo el objeto `settings`         |

### Patrón de Listeners

Los stores utilizan un patrón pub/sub para notificar cambios:

```typescript
// Registrar listener (fuera del componente React)
const unsubscribe = registerStoryStatusListener((storyId, oldStatus, newStatus) => {
  console.log(`Story ${storyId} se movió de ${oldStatus} a ${newStatus}`);
});

// Limpieza
unsubscribe();
```

---

## APIs y Comunicación

### Endpoints

#### GET /api/status

```typescript
// Retorna estado actual de AIOS
// Lee de: .aios/dashboard/status.json

interface AiosStatus {
  version: string;
  updatedAt: string;
  connected: boolean;
  project: { name: string; path: string } | null;
  activeAgent: {
    id: AgentId;
    name: string;
    activatedAt: string;
    currentStory?: string;
  } | null;
  session: {
    startedAt: string;
    commandsExecuted: number;
    lastCommand?: string;
  } | null;
  stories: {
    inProgress: string[];
    completed: string[];
  };
  rateLimit?: {
    used: number;
    limit: number;
    resetsAt?: string;
  };
}
```

#### GET /api/events (SSE)

```typescript
// Server-Sent Events para actualizaciones en tiempo real
// Eventos:
//   - status:update     → AiosStatus
//   - connection:status → { connected: boolean }
//   - heartbeat         → { alive: true }
//   - error             → { message: string }

// Formato del evento:
interface SSEEvent {
  type: 'status:update' | 'connection:status' | 'heartbeat' | 'error';
  data: unknown;
  timestamp: string;
}
```

#### GET/POST /api/stories

```typescript
// GET: Enumera todas las stories de docs/stories/
// POST: Crea nueva story

interface StoriesResponse {
  stories: Story[];
  source: 'filesystem' | 'mock' | 'empty' | 'error';
  count?: number;
  message?: string;
}

interface CreateStoryRequest {
  title: string;
  description?: string;
  status?: StoryStatus;
  type?: StoryType;
  priority?: StoryPriority;
  complexity?: StoryComplexity;
  category?: StoryCategory;
  agent?: AgentId;
  epicId?: string;
  acceptanceCriteria?: string[];
  technicalNotes?: string;
}
```

### Comunicación CLI ↔ Dashboard

```
┌─────────────┐                              ┌──────────────────┐
│   CLI/AIOS  │                              │    Dashboard     │
│   (Claude)  │                              │    (Next.js)     │
└──────┬──────┘                              └────────┬─────────┘
       │                                              │
       │  1. Agente activado                         │
       │  ─────────────────────────────────────────▶  │
       │     Escribe .aios/dashboard/status.json      │
       │                                              │
       │                                              │ 2. Dashboard detecta
       │                                              │    (SSE poll 2s)
       │                                              │
       │                                              │ 3. UI actualiza
       │                                              │    (en tiempo real)
       │                                              │
       │  4. Estado de story cambia                   │
       │  ─────────────────────────────────────────▶  │
       │     Escribe status.json                      │
       │                                              │
       │                                              │ 5. Kanban actualiza
       │                                              │    posición de la tarjeta
       │                                              │
       │  6. Agente termina                           │
       │  ─────────────────────────────────────────▶  │
       │     status.json: activeAgent = null          │
       │                                              │
       │                                              │ 7. Agente va a
       │                                              │    "Standby" en la UI
       │                                              │
```

### Hooks de Obtención de Datos

#### useAiosStatus

```typescript
// Polling basado en SWR del estado
const { status, isLoading, isConnected, statusError, mutate } = useAiosStatus({
  interval: 5000, // Poll cada 5s
  paused: false, // Pausar polling
});
```

#### useRealtimeStatus

```typescript
// Conexión SSE con fallback a polling
const { status, isConnected, isRealtime, lastUpdate, reconnect } = useRealtimeStatus({
  enabled: true,
  fallbackInterval: 5000,
  maxReconnectAttempts: 3,
  onStatusUpdate: (status) => {
    /* ... */
  },
  onConnectionChange: (connected) => {
    /* ... */
  },
});
```

#### useStories

```typescript
// Stories con toggle mock/real
const { isLoading, isError, source, useMockData, refresh } = useStories({
  refreshInterval: 30000, // Auto-refresh cada 30s
});
```

---

## Design System

### Tokens de Diseño

El dashboard utiliza un sistema de tokens de diseño CSS personalizados definidos en `globals.css`:

#### Colores de Fondo

```css
--bg-base: #000000; /* Fondo principal */
--bg-elevated: #050505; /* Sidebar, modales */
--bg-surface: #0a0a0a; /* Cards */
--bg-surface-hover: #0f0f0f;
```

#### Jerarquía de Texto (WCAG AA)

```css
--text-primary: #fafaf8; /* 19.5:1 contraste */
--text-secondary: #b8b8ac; /* 8.2:1 contraste */
--text-tertiary: #8a8a7f; /* 4.8:1 contraste */
--text-muted: #6a6a5e; /* 3.2:1 - decorativo */
--text-disabled: #3a3a32; /* Estado deshabilitado */
```

#### Sistema de Colores por Agente

```css
--agent-dev: #22c55e; /* Verde */
--agent-qa: #eab308; /* Amarillo */
--agent-architect: #8b5cf6; /* Púrpura */
--agent-pm: #3b82f6; /* Azul */
--agent-po: #f97316; /* Naranja */
--agent-analyst: #06b6d4; /* Cyan */
--agent-devops: #ec4899; /* Rosa */
```

#### Sistema de Acento Dorado

```css
--accent-gold: #c9b298;
--accent-gold-light: #e4d8ca;
--accent-gold-bg: rgba(201, 178, 152, 0.08);
--border-gold: rgba(201, 178, 152, 0.25);
```

#### Colores de Estado

```css
--status-success: #4ade80;
--status-warning: #fbbf24;
--status-error: #f87171;
--status-info: #60a5fa;
--status-idle: #4a4a42;
```

### Sistema de Iconos

El dashboard utiliza `lucide-react` con un mapeo centralizado en `src/lib/icons.ts`:

```typescript
import type { IconName } from '@/lib/icons';

// Uso en componentes:
const { iconMap } = require('@/lib/icons');
const IconComponent = iconMap['code']; // <Code /> de Lucide
```

Iconos disponibles por categoría:

- **Navigation**: dashboard, kanban, terminal, settings, menu, chevron-*
- **Status**: circle, check-circle, x-circle, alert-circle, clock, loader
- **Actions**: play, pause, refresh, search, copy, plus, trash, edit, save
- **Agents**: bot, code, test-tube, building, bar-chart, target, wrench

### Clases Utilitarias

```css
/* Transiciones elegantes */
.transition-luxury {
  transition: all 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* Cards refinadas */
.card-refined {
  background: var(--card);
  border: 1px solid var(--border);
}
.card-refined:hover {
  transform: translateY(-1px);
  border-color: var(--border-medium);
}

/* Hover con acento dorado */
.hover-gold:hover {
  border-color: var(--border-gold);
}

/* Scrollbar personalizada */
.scrollbar-refined::-webkit-scrollbar {
  width: 6px;
}
```

---

## Flujo de Datos

### Ciclo de Vida de Story

```
                    ┌─────────────────────────────────────────────────────┐
                    │               STORY LIFECYCLE                        │
                    └─────────────────────────────────────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
              ┌──────────┐          ┌──────────┐          ┌──────────┐
              │ CREATE   │          │ UPDATE   │          │ DELETE   │
              └────┬─────┘          └────┬─────┘          └────┬─────┘
                   │                     │                     │
                   ▼                     ▼                     ▼
         ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
         │StoryCreateModal │   │ StoryEditModal  │   │ Confirm Dialog  │
         │  onCreated()    │   │  onUpdated()    │   │  onDeleted()    │
         └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
                  │                     │                     │
                  └──────────┬──────────┴──────────┬──────────┘
                             │                     │
                             ▼                     ▼
                    ┌─────────────────┐   ┌─────────────────┐
                    │  story-store    │   │  /api/stories   │
                    │  addStory()     │   │  POST/PUT/DELETE│
                    │  updateStory()  │   │                 │
                    │  deleteStory()  │   └────────┬────────┘
                    └────────┬────────┘            │
                             │                     │
                             │                     ▼
                             │            ┌─────────────────┐
                             │            │ docs/stories/   │
                             │            │   *.md files    │
                             │            └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  KanbanBoard    │
                    │  re-renders     │
                    └─────────────────┘
```

### Flujo de Arrastra y Suelta

```
El usuario arrastra la tarjeta de story
         │
         ▼
┌─────────────────────────────────────┐
│     DndContext.onDragStart()        │
│  1. Encontrar story por activeId    │
│  2. setActiveStory(story)           │
│  3. Mostrar DragOverlay             │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│     DndContext.onDragEnd()          │
│  1. Determinar columna destino      │
│  2. Calcular nuevo índice           │
│  3. ¿Misma columna? reorderInColumn()  │
│  4. ¿Diferente? moveStory()         │
│  5. Limpiar activeStory             │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│     story-store.moveStory()         │
│  1. Verificar condición de carrera  │
│  2. Remover de posición antigua     │
│  3. Insertar en nueva posición      │
│  4. Actualizar story.status         │
│  5. notifyStatusChange()            │
│  6. Limpiar bloqueo de operación    │
└─────────────────────────────────────┘
```

---

## Patrones y Convenciones

### Convenciones de Nomenclatura

| Tipo        | Patrón                  | Ejemplo                  |
| ----------- | ----------------------- | ------------------------ |
| Components  | PascalCase              | `StoryCard.tsx`          |
| Hooks       | camelCase con `use`     | `useStories.ts`          |
| Stores      | kebab-case con `-store` | `story-store.ts`         |
| Types       | PascalCase              | `StoryStatus`            |
| CSS Classes | kebab-case              | `card-refined`           |
| Files       | kebab-case              | `use-realtime-status.ts` |

### Estructura de Componentes

```typescript
// Orden recomendado en componentes
'use client';

// 1. Imports - React primero
import { useState, useEffect, useCallback } from 'react';

// 2. Imports - Third-party
import { DndContext } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

// 3. Imports - Types
import type { Story, StoryStatus } from '@/types';

// 4. Imports - Componentes internos
import { StoryCard } from '@/components/stories';

// 5. Imports - Hooks & Stores
import { useStoryStore } from '@/stores/story-store';

// 6. Interface Props
interface ComponentProps {
  story: Story;
  onUpdate?: (story: Story) => void;
}

// 7. Componente
export function Component({ story, onUpdate }: ComponentProps) {
  // 7a. Hooks
  const [state, setState] = useState();
  const { action } = useStore();

  // 7b. Callbacks
  const handleClick = useCallback(() => {}, []);

  // 7c. Effects
  useEffect(() => {}, []);

  // 7d. Render
  return <div>...</div>;
}
```

### Patrón de Exportación

Cada directorio de componentes tiene un `index.ts`:

```typescript
// components/stories/index.ts
export { StoryCard } from './StoryCard';
export { StoryCreateModal } from './StoryCreateModal';
export { StoryEditModal } from './StoryEditModal';
export { StoryDetailModal } from './StoryDetailModal';
```

---

## Extensibilidad

### Agregar Nueva Vista

1. **Crear página**: `src/app/(dashboard)/nova-vista/page.tsx`
2. **Crear componente**: `src/components/nova-vista/NovaVistaPanel.tsx`
3. **Agregar a sidebar**: `src/types/index.ts` → `SidebarView` e `SIDEBAR_ITEMS`
4. **Crear store (si es necesario)**: `src/stores/nova-vista-store.ts`

### Agregar Nuevo Agente

1. **Agregar tipo**: `src/types/index.ts` → `AgentId`
2. **Agregar configuración**: `src/types/index.ts` → `AGENT_CONFIG`
3. **Agregar color**: `src/app/globals.css` → `--agent-{id}`
4. **Agregar mock**: `src/lib/mock-data.ts` → `MOCK_AGENTS`

### Agregar Nuevo Estado (Kanban)

1. **Agregar tipo**: `src/types/index.ts` → `StoryStatus`
2. **Agregar columna**: `src/types/index.ts` → `KANBAN_COLUMNS`
3. **Agregar color**: `src/types/index.ts` → `STATUS_COLORS`
4. **Agregar CSS**: `src/app/globals.css` → variables si es necesario
5. **Actualizar store**: `src/stores/story-store.ts` → `DEFAULT_ORDER`

### Agregar Nueva API

1. **Crear ruta**: `src/app/api/nueva-ruta/route.ts`
2. **Implementar manejadores**: GET, POST, PUT, DELETE
3. **Crear hook (opcional)**: `src/hooks/use-nueva-ruta.ts`
4. **Agregar tipos**: `src/types/index.ts`

---

## Próximos Pasos (Roadmap)

> 📖 **Arquitectura detallada de Tiempo Real:** Ver [dashboard-realtime.md](./dashboard-realtime.md)

### Prioridad Alta

- [ ] **Observabilidad en Tiempo Real** - CLI → Dashboard en tiempo real ([arquitectura](./dashboard-realtime.md))
- [ ] **UI de Tasks en Segundo Plano** - Visualizar tasks ADE en ejecución
- [ ] **Sistema de Estado Dinámico** - Estados personalizables por proyecto
- [ ] **Vista de Diff Multi-Archivo** - Ver cambios antes de aprobar

### Prioridad Media

- [ ] **UI de Modos de Permiso** - Toggle visual de permisos
- [ ] **Sistema de Notificaciones** - Toast notifications para eventos
- [ ] **Streaming de Terminal** - Salida en tiempo real de los agentes

### Prioridad Baja

- [ ] **Vista de Worktrees** - Gestionar git worktrees
- [ ] **Panel de Ideas** - Capturar ideas durante desarrollo
- [ ] **Export/Import** - Backup de configuraciones

---

_Documentación generada por @architect (Aria) - AIOS Core v2.0_
