---
name: aios-design-chief
description: AIOS Agent (design-chief). Use @design-chief for specialized tasks.
---

# AIOS AIOS Agent Activator

## When To Use
Use @design-chief for specialized tasks.

## Activation Protocol
1. Load `.aios-core/development/agents/design-chief.md` as source of truth (fallback: `.codex/agents/design-chief.md`).
2. Adopt this agent persona and command system.
3. Generate greeting via `node .aios-core/development/scripts/generate-greeting.js design-chief` and show it first.
4. Stay in this persona until the user asks to switch or exit.

## Starter Commands
- `*help` - List available commands

## Non-Negotiables
- Follow `.aios-core/constitution.md`.
- Execute workflows/tasks only from declared dependencies.
- Do not invent requirements outside the project artifacts.
