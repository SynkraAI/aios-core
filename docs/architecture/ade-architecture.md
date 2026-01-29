# ADE Architecture - Autonomous Development Engine

> **Version:** 1.0
> **Last Updated:** 2026-01-29
> **Status:** Official Framework Standard

---

## Table of Contents

- [Overview](#overview)
- [Design Principles](#design-principles)
- [Epic Architecture](#epic-architecture)
- [System Components](#system-components)
- [Integration Points](#integration-points)
- [Runtime State Management](#runtime-state-management)
- [Configuration](#configuration)
- [Workflow Intelligence System (WIS)](#workflow-intelligence-system-wis)
- [Error Handling & Recovery](#error-handling--recovery)

---

## Overview

The **Autonomous Development Engine (ADE)** is AIOS's infrastructure for autonomous development workflows. It enables AI agents to work independently through intelligent pipelines, self-healing loops, and persistent learning.

### Key Capabilities

| Capability                  | Description                                | Epic   |
| --------------------------- | ------------------------------------------ | ------ |
| **Story Isolation**         | Git worktree-based branch isolation        | Epic 1 |
| **Project Status**          | YAML-based project status tracking         | Epic 2 |
| **Spec Pipeline**           | Requirements → Specification automation    | Epic 3 |
| **Implementation Planning** | Plan generation and progress tracking      | Epic 4 |
| **Self-Healing**            | Stuck detection and recovery               | Epic 5 |
| **QA Evolution**            | Automated review → fix loops               | Epic 6 |
| **Memory Layer**            | Pattern learning and gotchas documentation | Epic 7 |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AIOS Framework                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    ADE - Autonomous Development Engine                 │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Epic 1    │  │   Epic 2    │  │   Epic 3    │  │   Epic 4    │   │ │
│  │  │  Worktree   │→│   Status    │→│    Spec     │→│    Plan     │   │ │
│  │  │  Manager    │  │   Loader    │  │  Pipeline   │  │   Tracker   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │         │                │                │                │          │ │
│  │         ▼                ▼                ▼                ▼          │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │                     .aios/ Runtime State                        │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │         │                │                │                │          │ │
│  │         ▼                ▼                ▼                ▼          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Epic 5    │  │   Epic 6    │  │   Epic 7    │  │     WIS     │   │ │
│  │  │ Self-Heal   │←│   QA Loop   │←│   Memory    │←│  Learning   │   │ │
│  │  │   Loop      │  │ Orchestrate │  │   Layer     │  │   Engine    │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. Determinism First

```yaml
Priority:
  1. Deterministic scripts    # Always prefer
  2. SQL/JSON queries         # Predictable, auditable
  3. Regex/pattern matching   # Reproducible
  4. LLM as last resort       # Only when creativity needed
```

### 2. State Persistence

All ADE state is persisted in `.aios/` for:

- Session recovery
- Progress tracking
- Learning continuity

### 3. Composable Pipelines

Workflows are built from composable tasks:

- Each task has defined inputs/outputs
- Tasks can be run independently or in sequence
- Pipelines adapt based on complexity

### 4. Self-Healing Loops

Every pipeline has built-in recovery:

- Stuck detection with configurable thresholds
- Automatic rollback capabilities
- Escalation paths for unrecoverable states

---

## Epic Architecture

### Epic 1: Story Branch Isolation

**Purpose:** Isolate story development in dedicated Git worktrees.

```
Component: worktree-manager.js
Location: .aios-core/infrastructure/scripts/

Flow:
  1. Story started → Create worktree
  2. Development → Work in isolation
  3. Story complete → Merge and cleanup
```

**Key Functions:**

- `createWorktree(storyId)` - Creates isolated branch
- `switchWorktree(storyId)` - Switches context
- `mergeWorktree(storyId)` - Merges back to main
- `cleanupWorktree(storyId)` - Removes worktree

### Epic 2: Project Status System

**Purpose:** Track project status in human-readable YAML.

```
Component: project-status-loader.js
Location: .aios-core/infrastructure/scripts/

State File: .aios/project-status.yaml
```

**Status Schema:**

```yaml
project:
  name: 'project-name'
  currentStory: 'STORY-001'

stories:
  STORY-001:
    status: in_progress
    branch: feat/story-001
    specStatus: approved
    qaStatus: pending
```

### Epic 3: Spec Pipeline

**Purpose:** Transform requirements into specifications.

```
Components:
  - Workflow: spec-pipeline.yaml
  - Tasks: spec-gather-requirements.md
           spec-assess-complexity.md
           spec-research-dependencies.md
           spec-write-spec.md
           spec-critique.md
```

**Pipeline Phases:**

| Phase       | Agent      | Output            |
| ----------- | ---------- | ----------------- |
| 1. Gather   | @pm        | requirements.json |
| 2. Assess   | @architect | complexity.json   |
| 3. Research | @analyst   | research.json     |
| 4. Write    | @pm        | spec.md           |
| 5. Critique | @qa        | critique.json     |

**Complexity Adaptation:**

```yaml
SIMPLE: Gather → Write → Critique
STANDARD: Gather → Assess → Research → Write → Critique → Plan
COMPLEX: Gather → Assess → Research → Write → Critique → Revise → Critique2 → Plan
```

### Epic 4: Implementation Planning

**Purpose:** Generate and track implementation plans.

```
Components:
  - Scripts: plan-tracker.js
             subtask-verifier.js
  - Tasks: plan-create-context.md
           plan-create-implementation.md
           plan-execute-subtask.md
           verify-subtask.md
  - Checklist: self-critique-checklist.md
```

**Plan Structure:**

```json
{
  "storyId": "STORY-001",
  "subtasks": [
    { "id": 1, "status": "completed", "verified": true },
    { "id": 2, "status": "in_progress", "verified": false },
    { "id": 3, "status": "pending", "verified": false }
  ],
  "progress": { "completed": 1, "total": 3, "percentage": 33 }
}
```

### Epic 5: Self-Healing Loops

**Purpose:** Detect stuck states and recover automatically.

```
Components:
  - Scripts: stuck-detector.js
             recovery-tracker.js
             rollback-manager.js
             approach-manager.js
  - Template: current-approach-tmpl.md
```

**Stuck Detection Signals:**

| Signal          | Threshold     | Action              |
| --------------- | ------------- | ------------------- |
| Same error 3x   | 3 occurrences | Suggest alternative |
| No progress     | 10 minutes    | Prompt review       |
| Repeated revert | 2 reverts     | Escalate            |

**Recovery Flow:**

```
Stuck Detected → Log Approach → Try Alternative → Success?
                                      ↓ No
                              Rollback → Escalate
```

### Epic 6: QA Evolution

**Purpose:** Automated QA review with fix loops.

```
Components:
  - Workflow: qa-loop.yaml
  - Scripts: qa-loop-orchestrator.js
             qa-report-generator.js
  - Tasks: qa-review-build.md (10 phases)
           qa-create-fix-request.md
           qa-fix-issues.md
  - Template: qa-report-tmpl.md
```

**QA Loop Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                      QA Loop                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ Review  │ → │ Report  │ → │ Verdict │ → │  Fix?   │  │
│  │ Build   │    │Generate │    │ Check   │    │         │  │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘  │
│                                                     │       │
│                 ┌───────────────────────────────────┘       │
│                 │                                           │
│          ┌──────▼──────┐                                    │
│          │  APPROVED   │ → Done                             │
│          └─────────────┘                                    │
│          ┌──────▼──────┐                                    │
│          │NEEDS_REVISION│ → Create Fix Request → @dev Fix  │
│          └─────────────┘    └────────────────────────┘     │
│                                      │                      │
│                 ┌────────────────────┘                      │
│                 │ (max 5 iterations)                        │
│                 └──────→ Loop back to Review                │
│                                                              │
│          ┌──────▼──────┐                                    │
│          │   BLOCKED   │ → Escalate to @architect           │
│          └─────────────┘                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**10-Phase Review:**

1. Syntax & Formatting
2. Code Structure
3. Naming Conventions
4. Error Handling
5. Security Patterns
6. Performance Patterns
7. Test Coverage
8. Documentation
9. Accessibility
10. Final Assessment

### Epic 7: Memory Layer

**Purpose:** Persistent learning across sessions.

```
Components:
  - Scripts: codebase-mapper.js
             pattern-extractor.js
             gotchas-documenter.js
  - Tasks: capture-session-insights.md
           extract-patterns.md
           document-gotchas.md
```

**Memory Types:**

| Type             | Description                     | Storage                           |
| ---------------- | ------------------------------- | --------------------------------- |
| Code Patterns    | Reusable patterns from codebase | .aios/patterns/code-patterns.json |
| Gotchas          | Known pitfalls and solutions    | .aios/patterns/gotchas.json       |
| Session Insights | Discoveries during sessions     | .aios/sessions/                   |
| Codebase Map     | Project structure analysis      | .aios/codebase-map.json           |

---

## System Components

### Infrastructure Scripts

| Script                     | Epic | Purpose                   |
| -------------------------- | ---- | ------------------------- |
| `worktree-manager.js`      | 1    | Git worktree management   |
| `project-status-loader.js` | 2    | YAML status tracking      |
| `spec-pipeline-runner.js`  | 3    | Spec pipeline automation  |
| `plan-tracker.js`          | 4    | Plan progress tracking    |
| `subtask-verifier.js`      | 4    | Subtask verification      |
| `approach-manager.js`      | 5    | Approach tracking         |
| `stuck-detector.js`        | 5    | Stuck state detection     |
| `recovery-tracker.js`      | 5    | Recovery logging          |
| `rollback-manager.js`      | 5    | Rollback management       |
| `qa-report-generator.js`   | 6    | QA report generation      |
| `qa-loop-orchestrator.js`  | 6    | QA loop automation        |
| `codebase-mapper.js`       | 7    | Project structure mapping |
| `pattern-extractor.js`     | 7    | Pattern extraction        |
| `gotchas-documenter.js`    | 7    | Gotchas documentation     |

### Workflows

| Workflow             | Purpose             | Phases                         |
| -------------------- | ------------------- | ------------------------------ |
| `spec-pipeline.yaml` | Requirements → Spec | 5-8 phases based on complexity |
| `qa-loop.yaml`       | Review → Fix loop   | 5 phases, max 5 iterations     |

### Tasks

**Spec Pipeline Tasks:**

- `spec-gather-requirements.md` - Phase 1: Collect requirements
- `spec-assess-complexity.md` - Phase 2: Evaluate complexity
- `spec-research-dependencies.md` - Phase 3: Research dependencies
- `spec-write-spec.md` - Phase 4: Write specification
- `spec-critique.md` - Phase 5: QA gate

**Implementation Tasks:**

- `plan-create-context.md` - Generate project context
- `plan-create-implementation.md` - Create implementation plan
- `plan-execute-subtask.md` - Execute subtask
- `verify-subtask.md` - Verify subtask completion

**QA Tasks:**

- `qa-review-build.md` - 10-phase review
- `qa-create-fix-request.md` - Generate fix request
- `qa-fix-issues.md` - Fix issues workflow

**Memory Tasks:**

- `capture-session-insights.md` - Capture session learnings
- `extract-patterns.md` - Extract code patterns
- `document-gotchas.md` - Document gotchas

---

## Integration Points

### Agent Integration

ADE integrates with AIOS agents through:

```yaml
autoClaude:
  specPipeline:
    phase: spec-gather
    role: primary

  qaLoop:
    phase: review
    role: reviewer
```

### Status.json Integration

All ADE components update `.aios/status.json`:

```json
{
  "currentStory": "STORY-001",
  "specPipeline": {
    "phase": "critique",
    "iteration": 1
  },
  "qaLoop": {
    "iteration": 2,
    "verdict": "NEEDS_REVISION"
  }
}
```

### devLoadAlwaysFiles Integration

ADE documentation is loaded via devLoadAlwaysFiles:

- `docs/framework/source-tree.md` - Framework structure
- `docs/framework/coding-standards.md` - Coding standards
- `docs/framework/tech-stack.md` - Tech stack reference

---

## Runtime State Management

### State Directory Structure

```
.aios/
├── project-status.yaml        # Project-wide status
├── status.json                # Runtime status
├── patterns/                  # Learned patterns (Epic 7)
│   ├── code-patterns.json
│   └── gotchas.json
├── worktrees/                 # Worktree state (Epic 1)
│   └── story-{id}.json
├── sessions/                  # Session insights (Epic 7)
│   └── session-{timestamp}.json
└── qa-loops/                  # QA loop state (Epic 6)
    └── {story-id}/
        ├── iteration-1.json
        ├── iteration-2.json
        └── qa-report.md
```

### State Lifecycle

```
Session Start → Load State → Execute → Update State → Session End
                   │                        │
                   └── Recovery if needed ──┘
```

---

## Configuration

### Core Config

Located at `.aios-core/core-config.yaml`:

```yaml
ade:
  enabled: true

  worktrees:
    enabled: true
    baseDir: .worktrees
    autoCleanup: true

  specPipeline:
    enabled: true
    maxIterations: 3
    strictGate: true

  qaLoop:
    enabled: true
    maxIterations: 5
    autoFix: true

  memoryLayer:
    enabled: true
    patternStore: .aios/patterns/
    sessionCapture: true

  selfHealing:
    enabled: true
    stuckThreshold: 3
    autoRollback: false
```

---

## Workflow Intelligence System (WIS)

The WIS provides intelligent suggestions based on learned patterns.

### Components

```
.aios-core/workflow-intelligence/
├── engine/
│   ├── confidence-scorer.js   # Pattern confidence scoring
│   ├── output-formatter.js    # Output formatting
│   ├── suggestion-engine.js   # Intelligent suggestions
│   └── wave-analyzer.js       # Wave pattern analysis
├── learning/
│   ├── capture-hook.js        # Pattern capture hooks
│   ├── pattern-capture.js     # Pattern capture engine
│   ├── pattern-store.js       # Pattern persistence
│   └── pattern-validator.js   # Pattern validation
└── registry/
    └── workflow-registry.js   # Workflow registration
```

### Integration with ADE

WIS integrates with ADE through:

1. **Pattern Capture** - Learns from successful workflows
2. **Suggestion Engine** - Suggests approaches based on context
3. **Confidence Scoring** - Ranks suggestions by reliability

---

## Error Handling & Recovery

### Error Categories

| Category    | Handling             | Example         |
| ----------- | -------------------- | --------------- |
| Transient   | Retry (3x)           | Network timeout |
| Recoverable | Alternative approach | Lint failure    |
| Blocking    | Escalate             | Security issue  |
| Fatal       | Halt + notify        | Corruption      |

### Recovery Strategies

```yaml
strategies:
  retry:
    maxAttempts: 3
    delay: exponential

  alternative:
    trigger: same_error_3x
    action: suggest_approach

  rollback:
    trigger: corruption_detected
    action: restore_checkpoint

  escalate:
    trigger: max_iterations
    action: notify_architect
```

---

## Version History

| Version | Date       | Changes                                | Author           |
| ------- | ---------- | -------------------------------------- | ---------------- |
| 1.0     | 2026-01-29 | Initial ADE architecture documentation | Aria (architect) |

---

_This is an official AIOS framework standard documenting the Autonomous Development Engine._
