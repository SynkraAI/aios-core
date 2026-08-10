---
name: develop-story
description: >
  Alias for /aiox-develop-story. Use when the user runs /develop-story or mentions develop-story.
user-invocable: true
metadata:
  short-description: "Alias → /aiox-develop-story"
  aiox-alias-of: "aiox-develop-story"
---

# develop-story (alias)

This is a **short alias** for the AIOX Grok skill `/aiox-develop-story`.

## Protocol

1. Load and follow `.grok/skills/aiox-develop-story/SKILL.md` exactly.
2. If that file is missing, regenerate with `npm run sync:skills:grok`.
3. Do not invent a parallel workflow — the aliased skill is the source of truth.
