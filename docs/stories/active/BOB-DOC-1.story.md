# Story BOB-DOC-1: Decision Heuristics Documentation

```yaml
id: BOB-DOC-1
title: Create bob-decision-heuristics.md documentation
type: documentation
priority: P1
severity: high
executor: '@dev'
quality_gate: '@qa'
quality_gate_tools: ['code_review']
estimated_effort: 1h
epic: Bob Process Quality Improvements
parent: null
```

## Context

**Discovered by:** Deep analysis debate (pedro-valerio + oalanicolas)
**Location:** New file `.aios-core/core/orchestration/bob-decision-heuristics.md`

Currently, BOB's decision-making logic is scattered across code without centralized documentation. This makes it hard for developers to understand the decision tree, debug issues, or extend functionality.

## Problem Statement

**Missing:** Comprehensive documentation of BOB's decision-making process

**Risk:**
- New developers struggle to understand BOB's logic
- Decision changes lack context and rationale
- Hard to debug unexpected behavior
- Inconsistent decision-making across handlers

## Acceptance Criteria

- [x] AC1: Document all project state detection logic
- [x] AC2: Document routing decision tree (_routeByState)
- [x] AC3: Document surface conditions and when BOB asks user
- [x] AC4: Document veto conditions (VETO-1 through VETO-4)
- [x] AC5: Include decision flow diagrams (mermaid)
- [x] AC6: Add troubleshooting section for common scenarios
- [x] AC7: Link to relevant code sections with line numbers

## Implementation Plan

### Step 1: Create documentation structure

```markdown
# BOB Decision Heuristics

## Overview
- What is BOB?
- Core decision-making philosophy
- Key principles (unidirectional flow, measure twice cut once)

## Project State Detection
- NO_CONFIG: When and why
- EXISTING_NO_DOCS: Brownfield detection
- EXISTING_WITH_DOCS: Resume scenarios
- GREENFIELD: Fresh start detection

## Routing Decision Tree
- _routeByState() flow
- Handler selection logic
- Fallback behaviors

## Surface Conditions
- When to ask user vs auto-decide
- shouldSurface() evaluation
- Trade-off presentation

## Veto Conditions
- BOB-VETO-1: Init loop prevention
- BOB-VETO-2: Restart confirmation
- BOB-VETO-3: Cleanup order
- BOB-VETO-4: Unknown state exception

## Decision Flow Diagrams
[Mermaid diagrams for visual understanding]

## Troubleshooting
- Common scenarios and expected behavior
- How to debug decision points
```

### Step 2: Extract decision logic from code

Read and document:
- `bob-orchestrator.js`: Main decision tree
- `surface-checker.js`: Surface conditions
- `executor-assignment.js`: Agent selection
- `session-state.js`: Resume decisions

### Step 3: Add mermaid diagrams

Create visual flowcharts for:
1. Project state detection → routing
2. Session resume decision flow
3. Veto condition evaluation

### Step 4: Add practical examples

Include real scenarios:
- "User runs aios with existing project"
- "User restarts story with uncommitted changes"
- "Session crashes and user returns"

## File List

- `.aios-core/core/orchestration/bob-decision-heuristics.md` (created)

## Definition of Done

- [x] Documentation file created
- [x] All decision points documented
- [x] Flow diagrams included
- [x] Troubleshooting guide added
- [x] Code review approved by @qa

---

**Story created:** 2026-02-15
**Implemented by:** Orion (aios-master)
