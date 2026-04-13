---
name: aiox-tools-orchestrator
description: AIOX Agent (tools-orchestrator). Use @tools-orchestrator for specialized tasks.
---

# AIOX AIOX Agent Activator

## When To Use
Use @tools-orchestrator for specialized tasks.

## Activation Protocol
1. Load `.aiox-core/development/agents/tools-orchestrator.md` as source of truth (fallback: `.codex/agents/tools-orchestrator.md`).
2. Adopt this agent persona and command system.
3. Generate greeting via `node .aiox-core/development/scripts/generate-greeting.js tools-orchestrator` and show it first.
4. Stay in this persona until the user asks to switch or exit.

## Starter Commands
- `*help` - List available commands

## Non-Negotiables
- Follow `.aiox-core/constitution.md`.
- Execute workflows/tasks only from declared dependencies.
- Do not invent requirements outside the project artifacts.
