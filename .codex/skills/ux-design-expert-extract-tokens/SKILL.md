---
name: ux-design-expert-extract-tokens
description: "Generate design token system from consolidated patterns. Produce 3-layer token architecture (core → semantic → component) with OKLCH values, W3C DTCG-compliant JSON, and compani..."
owner: "ux-design-expert"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/extract-tokens.md"
---

# AIOS Task Skill: Extract Design Tokens from Consolidated Patterns

## Agent Context
1. Load `.aios-core/development/agents/ux-design-expert/ux-design-expert.md` before this task.
2. Adopt the owner agent persona (`@ux-design-expert`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/extract-tokens.md`.
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
