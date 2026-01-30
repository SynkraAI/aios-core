# CLI → Dashboard Feature Mapping

> **Reference:** Constitution Article I - CLI First
> **Purpose:** Document relationship between CLI commands and Dashboard features
> **Last Updated:** 2025-01-30

---

## Principle

```
CLI First → Observability Second → UI Third
```

Dashboard features MUST map to CLI capabilities. Dashboard observes, never controls.

---

## Agent Commands → Dashboard Views

### @dev Commands → Monitor View

| CLI Command | Dashboard Feature | Type |
|-------------|-------------------|------|
| `*develop {story}` | Activity Feed - shows dev progress | Observe |
| `*build {story}` | Build status indicator | Observe |
| `*capture-insights` | Insights panel | Observe |
| `*gotchas` | Gotchas list in sidebar | Observe |

### @qa Commands → QA Panel

| CLI Command | Dashboard Feature | Type |
|-------------|-------------------|------|
| `*review {story}` | QA status badge on story | Observe |
| `*analyze` | Analysis report viewer | Observe |
| `*gate {story}` | Gate decision display | Observe |

### @sm/@po Commands → Kanban View

| CLI Command | Dashboard Feature | Type |
|-------------|-------------------|------|
| `*draft` | Story card creation notification | Observe |
| `*create-story` | New story appears on board | Observe |
| Story status changes | Card moves between columns | Observe |

### @devops Commands → GitHub Panel

| CLI Command | Dashboard Feature | Type |
|-------------|-------------------|------|
| `*pre-push` | Quality gate status | Observe |
| `*push` | Push notification | Observe |
| `*create-pr` | PR link display | Observe |

---

## Dashboard Components → CLI Requirements

| Component | Directory | Required CLI | Status |
|-----------|-----------|--------------|--------|
| `agents/` | Agent status display | Agent activation | ✅ |
| `monitor/` | Activity monitoring | All agent commands | ✅ |
| `kanban/` | Story board | @sm/@po commands | ✅ |
| `github/` | GitHub integration | @devops commands | ✅ |
| `qa/` | QA dashboard | @qa commands | ✅ |
| `insights/` | Insights viewer | `*capture-insights` | ✅ |
| `roadmap/` | Roadmap view | Story data | ✅ |
| `settings/` | Configuration | `aios config` | ⚠️ Partial |
| `context/` | Context display | Memory layer | ✅ |
| `layout/` | App layout | N/A (UI only) | N/A |

---

## Event Flow

```
CLI Command Executed
       ↓
   Event Emitted (WebSocket)
       ↓
   Dashboard Receives
       ↓
   UI Updates (Read-only)
```

### Event Types

| Event | Source | Dashboard Action |
|-------|--------|------------------|
| `agent:activated` | Agent activation | Update agent status |
| `command:started` | Any `*command` | Show in activity feed |
| `command:completed` | Command finish | Update status, show result |
| `story:updated` | Story modification | Refresh kanban card |
| `build:progress` | Build operation | Update progress indicator |
| `qa:verdict` | QA gate decision | Show badge on story |
| `push:completed` | Git push | Show notification |

---

## Compliance Checklist

### Article I Compliance

- [x] Every Dashboard feature has CLI equivalent
- [x] Dashboard does not trigger CLI commands (observe only)
- [x] UI is not required for any operation
- [x] Real-time sync is one-way (CLI → Dashboard)

### Missing/Partial

| Feature | CLI Status | Dashboard Status | Action Needed |
|---------|------------|------------------|---------------|
| Settings config | Partial | Exists | Add `aios config` command |

---

## Implementation Notes

### Monitor Server

Location: `apps/monitor-server/`

Responsibilities:
- WebSocket server for real-time events
- Event buffering and delivery
- Connection management

### Dashboard Hooks

Location: `apps/dashboard/src/hooks/`

Key hooks:
- `use-monitor-events.ts` - WebSocket connection
- `use-agent-status.ts` - Agent state tracking

---

*CLI → Dashboard Mapping v1.0.0*
*Constitution Article I Compliance*
