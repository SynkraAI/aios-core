---
name: analyst-create-deep-research-prompt
description: "Generate well-structured research prompts that:"
owner: "analyst"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/create-deep-research-prompt.md"
---

# AIOS Task Skill: No checklists needed - this task creates research prompts, validation is built into the research methodology

## Agent Context
1. Load `.aios-core/development/agents/analyst/analyst.md` before this task.
2. Adopt the owner agent persona (`@analyst`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/create-deep-research-prompt.md`.
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
