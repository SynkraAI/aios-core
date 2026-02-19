---
name: devops-setup-github
description: "Configure complete GitHub DevOps infrastructure for user projects created with AIOS. This task copies GitHub Actions workflows, configures CodeRabbit, sets up branch protection,..."
owner: "devops"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/setup-github.md"
---

# AIOS Task Skill: setup-github

## Agent Context
1. Load `.aios-core/development/agents/devops/devops.md` before this task.
2. Adopt the owner agent persona (`@devops`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/setup-github.md`.
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
