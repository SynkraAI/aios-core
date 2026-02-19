---
name: qa-trace-requirements
description: "Create a requirements traceability matrix that ensures every acceptance criterion has corresponding test coverage. This task helps identify gaps in testing and ensures all requi..."
owner: "qa"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/qa-trace-requirements.md"
---

# AIOS Task Skill: trace-requirements

## Agent Context
1. Load `.aios-core/development/agents/qa/qa.md` before this task.
2. Adopt the owner agent persona (`@qa`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/qa-trace-requirements.md`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.

## Interaction Rules
- Execute non-interactive flow unless blocked by missing context.

## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
