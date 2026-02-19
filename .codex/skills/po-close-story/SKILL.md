---
name: po-close-story
description: "This task closes the PO story lifecycle that begins with *validate-story-draft. After a story is implemented, tested, and merged, this task:"
owner: "po"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/po-close-story.md"
command: "*close-story"
---

# AIOS Task Skill: PO Task: Close Story

## Agent Context
1. Load `.aios-core/development/agents/po/po.md` before this task.
2. Adopt the owner agent persona (`@po`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/po-close-story.md`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.

## Interaction Rules
- This task requires user interaction points (`elicit=true`). Do not skip them.

## Canonical Command
- `*close-story`

## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
