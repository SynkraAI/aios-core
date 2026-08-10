---
name: review-story
description: >
  Alias for /aiox-review-story. Use when the user runs /review-story or mentions review-story.
user-invocable: true
metadata:
  short-description: "Alias → /aiox-review-story"
  aiox-alias-of: "aiox-review-story"
---

# review-story (alias)

This is a **short alias** for the AIOX Grok skill `/aiox-review-story`.

## Protocol

1. Load and follow `.grok/skills/aiox-review-story/SKILL.md` exactly.
2. If that file is missing, regenerate with `npm run sync:skills:grok`.
3. Do not invent a parallel workflow — the aliased skill is the source of truth.
