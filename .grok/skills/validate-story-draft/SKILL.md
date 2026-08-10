---
name: validate-story-draft
description: >
  Alias for /aiox-validate-story-draft. Use when the user runs /validate-story-draft or mentions validate-story-draft.
user-invocable: true
metadata:
  short-description: "Alias → /aiox-validate-story-draft"
  aiox-alias-of: "aiox-validate-story-draft"
---

# validate-story-draft (alias)

This is a **short alias** for the AIOX Grok skill `/aiox-validate-story-draft`.

## Protocol

1. Load and follow `.grok/skills/aiox-validate-story-draft/SKILL.md` exactly.
2. If that file is missing, regenerate with `npm run sync:skills:grok`.
3. Do not invent a parallel workflow — the aliased skill is the source of truth.
