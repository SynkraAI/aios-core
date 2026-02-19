---
name: architect-plan-create-implementation
description: "Gerar planos de implementacao executaveis a partir de specs aprovados. Transforma o spec.md em uma sequencia de subtasks atomicas, cada uma com verificacao, formando um roadmap..."
owner: "architect"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/plan-create-implementation.md"
---

# AIOS Task Skill: Execution Pipeline: Create Implementation Plan

## Agent Context
1. Load `.aios-core/development/agents/architect/architect.md` before this task.
2. Adopt the owner agent persona (`@architect`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/plan-create-implementation.md`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.

## Interaction Rules
- This task requires user interaction points (`elicit=true`). Do not skip them.

## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
