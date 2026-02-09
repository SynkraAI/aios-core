# Session Handoff Protocol — Universal Rule

## CRITICAL: Handoff Over Autocompact

**This rule applies to ALL agents, ALL sessions, ALL projects.**

When your context window fills up, DO NOT rely on autocompact. Autocompact degrades quality by summarizing conversations, truncating history, and compressing context. No model performs well at 95% context utilization.

**Use session handoffs instead.**

---

## Budget Awareness Thresholds

Monitor your context usage throughout the session:

| Threshold | Action | Urgency |
|-----------|--------|---------|
| **< 70%** | Safe. Continue working normally. | Low |
| **70%** | WARNING: Plan to wrap up current task. Avoid starting new large tasks. | Medium |
| **85%** | RECOMMEND HANDOFF: Finish current task, create handoff, suggest fresh session. | High |
| **95%** | FORCE HANDOFF: Stop immediately. Create handoff document NOW. | Critical |

## How to Create a Handoff

When reaching 85%+ or when explicitly requested (`*handoff`), create a handoff document:

### 1. Gather Context
- Recent git commits (last 10)
- Modified/uncommitted files
- Current task progress
- Active blockers

### 2. Write Handoff Document

Save to `.aios/handoffs/handoff-YYYY-MM-DD-HHMMSS.md` AND `.aios/handoffs/LATEST.md`:

```markdown
# Handoff: [Topic]

**Date:** YYYY-MM-DD
**Project:** {project-name}
**Branch:** `{branch}` @ `{commit}`
**Budget at handoff:** {percent}%

---

## Completed
- Task A (commit: abc123)
- Task B (commit: def456)

## Pending
- [ ] Task C (blocked by: external API)
- [ ] Task D (ready to start)

## Blockers
- External API not responding (since 2026-02-02)

## Next Steps
1. Start with Task D (no blockers) [S]
2. Monitor API for Task C [M]
3. Consider fallback if API still down [L]

## Context for Next Session
- Feature X is 80% complete
- Tests passing except integration test
- User wants deployment by Friday
- Key file: `src/services/auth.ts` — new JWT logic here
```

### 3. Suggest Fresh Start
After creating the handoff, tell the user:
- Handoff saved to `.aios/handoffs/LATEST.md`
- Recommend starting a fresh session
- The new session should read the handoff first (`*handoff-read` or `cat .aios/handoffs/LATEST.md`)

## How to Resume From a Handoff

At the START of a new session, check for existing handoffs:

1. Check if `.aios/handoffs/LATEST.md` exists
2. If yes, read it and use it as your primary context
3. Verify git state matches what the handoff describes
4. Continue from the "Next Steps" section

## Commands

| Command | Description |
|---------|-------------|
| `*handoff` | Create a handoff document for current session |
| `*handoff-read` | Read the latest handoff and resume |
| `*budget` | Show current context budget status |

## Key Principle

> A compacted context gives you a degraded version of everything.
> A handoff gives you a clean version of what matters.
> Fresh sessions don't lose context. They lose noise.

---
*AIOS Session Handoff Protocol v1.0 — 2026-02-09*
