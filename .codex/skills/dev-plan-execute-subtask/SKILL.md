---
name: dev-plan-execute-subtask
description: "Execute a single subtask from an implementation.yaml plan following the 13-step Coder Agent workflow. Includes mandatory self-critique phases (5.5 and 6.5) to catch bugs, edge c..."
owner: "dev"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/plan-execute-subtask.md"
---

# AIOS Task Skill: Execute Subtask (Coder Agent)

## Agent Context
1. Load `.aios-core/development/agents/dev/dev.md` before this task.
2. Adopt the owner agent persona (`@dev`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/plan-execute-subtask.md`.
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
