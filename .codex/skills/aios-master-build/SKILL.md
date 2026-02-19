---
name: aios-master-build
description: "Execute a complete autonomous build for a story with a single command."
owner: "master"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/build.md"
command: "*build {story-id}"
---

# AIOS Task Skill: Task: Build (Autonomous)

## Agent Context
1. Load `.aios-core/development/agents/aios-master/aios-master.md` before this task.
2. Adopt the owner agent persona (`@master`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/build.md`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.

## Interaction Rules
- Execute non-interactive flow unless blocked by missing context.

## Canonical Command
- `*build {story-id}`

## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
