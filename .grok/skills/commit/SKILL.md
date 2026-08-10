---
name: commit
description: >
  Alias for /aiox-commit. Use when the user runs /commit or mentions commit.
user-invocable: true
metadata:
  short-description: "Alias → /aiox-commit"
  aiox-alias-of: "aiox-commit"
---

# commit (alias)

This is a **short alias** for the AIOX Grok skill `/aiox-commit`.

## Protocol

1. Load and follow `.grok/skills/aiox-commit/SKILL.md` exactly.
2. If that file is missing, regenerate with `npm run sync:skills:grok`.
3. Do not invent a parallel workflow — the aliased skill is the source of truth.
