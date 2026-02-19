---
name: dev-validate-next-story
description: "To comprehensively validate a story draft before implementation begins, ensuring it is complete, accurate, and provides sufficient context for successful development. This task..."
owner: "dev"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/dev-validate-next-story.md"
---

# AIOS Task Skill: Validate Next Story Task

## Agent Context
1. Load `.aios-core/development/agents/dev/dev.md` before this task.
2. Adopt the owner agent persona (`@dev`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/dev-validate-next-story.md`.
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
