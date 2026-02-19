---
name: architect-generate-documentation
description: "Generate comprehensive pattern library documentation from built components. Creates searchable, navigable docs with usage examples, prop tables, accessibility notes, and live pr..."
owner: "architect"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/generate-documentation.md"
---

# AIOS Task Skill: Generate Pattern Library Documentation

## Agent Context
1. Load `.aios-core/development/agents/architect/architect.md` before this task.
2. Adopt the owner agent persona (`@architect`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/generate-documentation.md`.
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
