---
name: data-engineer-db-verify-order
description: "Lint DDL for safe execution order to avoid dependency errors"
owner: "data-engineer"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/db-verify-order.md"
---

# AIOS Task Skill: Task: Verify DDL Ordering

## Agent Context
1. Load `.aios-core/development/agents/data-engineer/data-engineer.md` before this task.
2. Adopt the owner agent persona (`@data-engineer`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/db-verify-order.md`.
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
