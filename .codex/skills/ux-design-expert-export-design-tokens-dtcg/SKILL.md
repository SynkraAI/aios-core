---
name: ux-design-expert-export-design-tokens-dtcg
description: "Produce W3C Design Tokens (DTCG v2025.10) exports from the canonical YAML tokens file. Validates schema compliance, OKLCH color usage, and publishes artifacts for downstream pla..."
owner: "ux-design-expert"
intent: "aios-task-workflow"
source: ".aios-core/development/tasks/export-design-tokens-dtcg.md"
---

# AIOS Task Skill: Export Design Tokens to W3C DTCG

## Agent Context
1. Load `.aios-core/development/agents/ux-design-expert/ux-design-expert.md` before this task.
2. Adopt the owner agent persona (`@ux-design-expert`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load `.aios-core/development/tasks/export-design-tokens-dtcg.md`.
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
