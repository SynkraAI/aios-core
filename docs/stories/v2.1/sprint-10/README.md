# Sprint 10 - WIS Core Implementation

**Sprint:** 10
**Epic:** WIS (Workflow Intelligence System) - Implementation Phase
**Focus:** Core WIS Functionality + Service Templates

---

## Sprint Goals

### Track A: WIS Core (from WIS-1)
1. Enhance workflow patterns with transitions and confidence scoring (WIS-2)
2. Implement `*next` task for workflow guidance (WIS-3)

### Track B: Incremental Feature Workflow (from WIS-9)
3. Implement service-template foundation (WIS-10)
4. Create `*create-service` task for @dev (WIS-11)
5. Create `*analyze-project-structure` task for @architect (WIS-15)

---

## Stories

### Track A: WIS Core

| ID | Story | Status | Effort | Priority | Lead |
|----|-------|--------|--------|----------|------|
| **WIS-2** | Workflow Registry Enhancement | Draft | 6h | 🟡 MEDIUM | @dev |
| **WIS-3** | `*next` Task Implementation | Draft | 11h | 🟡 MEDIUM | @dev |

### Track B: Incremental Feature Workflow

| ID | Story | Status | Effort | Priority | Lead |
|----|-------|--------|--------|----------|------|
| **WIS-10** | Service Template Implementation | Draft | 8-10h | 🔴 HIGH | @dev |
| **WIS-11** | `*create-service` Task | Draft | 6-8h | 🔴 HIGH | @dev |
| **WIS-15** | `*analyze-project-structure` Task | Draft | 4-6h | 🔴 HIGH | @architect |

---

## Story Files

### Track A: WIS Core
- [WIS-2: Workflow Registry Enhancement](./story-wis-2-workflow-registry.md) - Implementation
- [WIS-3: `*next` Task Implementation](./story-wis-3-next-task.md) - Implementation

### Track B: Incremental Feature
- [WIS-10: Service Template Implementation](./story-wis-10-service-template.md) - Implementation
- [WIS-11: `*create-service` Task](./story-wis-11-create-service-task.md) - Implementation
- [WIS-15: `*analyze-project-structure` Task](./story-wis-15-analyze-project-structure.md) - Implementation

---

## Dependencies

### From Sprint 9
| Dependency | Status | Notes |
|------------|--------|-------|
| WIS-1: Investigation & Design | ✅ Complete | ADR, MVP scope, viability report |
| WIS-9: Incremental Feature Investigation | ✅ Done | Provides specs for WIS-10, WIS-11, WIS-15 |

### Internal Sprint 10
| Story | Depends On | Notes |
|-------|------------|-------|
| WIS-2 | WIS-1 | Uses architecture from ADR-WIS-001 |
| WIS-3 | WIS-2 | Uses registry and confidence scorer |
| WIS-10 | WIS-9 | Uses template specs from investigation |
| WIS-11 | WIS-10 | Uses templates created in WIS-10 |
| WIS-15 | None | Can start in parallel |

---

## Execution Plan

```
Track A: WIS Core
─────────────────
Wave 1:
└── WIS-2: Workflow Registry Enhancement (6h) [@dev]

Wave 2 (After WIS-2):
└── WIS-3: *next Task Implementation (11h) [@dev]

Track B: Incremental Feature (Parallel with Track A)
────────────────────────────────────────────────────
Wave 1 (Parallel):
├── WIS-10: Service Template Implementation (8-10h) [@dev]
└── WIS-15: *analyze-project-structure Task (4-6h) [@architect]

Wave 2 (After WIS-10):
└── WIS-11: *create-service Task (6-8h) [@dev]
```

---

## Key Deliverables

### Track A: WIS Core

#### WIS-2: Workflow Registry Enhancement
- Enhanced `workflow-patterns.yaml` with transitions for all 10 workflows
- `.aios-core/workflow-intelligence/engine/confidence-scorer.js`
- `.aios-core/workflow-intelligence/registry/workflow-registry.js`

#### WIS-3: `*next` Task
- `.aios-core/development/tasks/next.md`
- `.aios-core/workflow-intelligence/engine/suggestion-engine.js`
- Task completion hook in context-loader.js

### Track B: Incremental Feature

#### WIS-10: Service Template
- `.aios-core/development/templates/service-template/`
- Handlebars templates for service scaffolding
- TypeScript strict mode, factory pattern

#### WIS-11: `*create-service` Task
- `.aios-core/development/tasks/create-service.md`
- @dev agent command integration
- Input validation and elicitation

#### WIS-15: `*analyze-project-structure` Task
- `.aios-core/development/tasks/analyze-project-structure.md`
- @architect agent command integration
- Project analysis output templates

---

## Sprint Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Stories Completed | 5/5 | 0/5 |
| WIS Core Components | 3 | 0 |
| Tasks Created | 3 | 0 |
| Templates Created | 1 | 0 |

---

## Effort Summary

| Track | Category | Effort |
|-------|----------|--------|
| **Track A** | WIS-2: Workflow Registry | 6h |
| **Track A** | WIS-3: `*next` Task | 11h |
| **Track B** | WIS-10: Service Template | 8-10h |
| **Track B** | WIS-11: `*create-service` | 6-8h |
| **Track B** | WIS-15: Analyze Structure | 4-6h |
| | **Sprint Total** | **35-41h** |

---

## Risks

1. **Track A scope** - Mitigate by leveraging existing infrastructure (75% exists)
2. **Template complexity** - Mitigate by starting with minimal viable template
3. **Handlebars learning curve** - Mitigate by using existing patterns from AIOS
4. **Testing coverage** - Mitigate by requiring 70% coverage

---

*Sprint 10: WIS Core Implementation + Incremental Feature Foundation*
