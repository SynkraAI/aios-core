---
name: devops-environment-bootstrap
description: "Complete environment bootstrap for new AIOS projects. Verifies and installs all required CLIs, authenticates services, initializes Git/GitHub repository, and validates the devel..."
owner: "devops"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/environment-bootstrap.md"
---

# AIOS Task Skill: environment-bootstrap

## Agent Context
1. Load `.aios-core/development/agents/devops/devops.md` before this task.
2. Adopt the owner agent persona (`@devops`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/environment-bootstrap.md`.
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
