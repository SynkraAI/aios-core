---
name: close-story
description: >
  Alias for /aiox-close-story. Use when the user runs /close-story or mentions close-story.
user-invocable: true
metadata:
  short-description: "Alias → /aiox-close-story"
  aiox-alias-of: "aiox-close-story"
---

# close-story (alias)

This is a **short alias** for the AIOX Grok skill `/aiox-close-story`.

## Protocol

1. Load and follow `.grok/skills/aiox-close-story/SKILL.md` exactly.
2. If that file is missing, regenerate with `npm run sync:skills:grok`.
3. Do not invent a parallel workflow — the aliased skill is the source of truth.
