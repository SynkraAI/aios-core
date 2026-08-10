---
name: apply-qa-fixes
description: >
  Alias for /aiox-apply-qa-fixes. Use when the user runs /apply-qa-fixes or mentions apply-qa-fixes.
user-invocable: true
metadata:
  short-description: "Alias → /aiox-apply-qa-fixes"
  aiox-alias-of: "aiox-apply-qa-fixes"
---

# apply-qa-fixes (alias)

This is a **short alias** for the AIOX Grok skill `/aiox-apply-qa-fixes`.

## Protocol

1. Load and follow `.grok/skills/aiox-apply-qa-fixes/SKILL.md` exactly.
2. If that file is missing, regenerate with `npm run sync:skills:grok`.
3. Do not invent a parallel workflow — the aliased skill is the source of truth.
