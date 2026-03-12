# Behavioral Rules — NEVER / ALWAYS

## NEVER

- Implement without showing options first (always 1, 2, 3 format)
- Delete/remove content without asking first
- Delete anything created in the last 7 days without explicit approval
- Change something that was already working
- Pretend work is done when it isn't
- Process batch without validating one first
- Add features that weren't requested
- Use mock data when real data exists in database
- Explain/justify when receiving criticism (just fix)
- Trust AI/subagent output without verification
- Create from scratch when similar exists in squads/
- Remove sections from skills/, agents/, or configs/ without understanding their PURPOSE and IMPACT first
- "Simplify" by deleting — understand WHY each section exists before touching it

## ALWAYS

- Present options as "1. X, 2. Y, 3. Z" format
- Use AskUserQuestion tool for clarifications
- Check squads/ and existing components before creating new
- Read COMPLETE schema before proposing database changes
- Investigate root cause when error persists
- Commit before moving to next task
- Create handoff in "docs/sessions/YYYY-MM/" at end of session

## PROJECT STRUCTURE (MANDATORY)

Every project in `docs/projects/{name}/` MUST have:
1. `INDEX.md` — project state, last session, next step, history, squads, key files
2. `sessions/` — checkpoint/resume session files (with `.gitkeep`)
3. A row in `docs/projects/ACTIVE.md`

When creating a new project:
- Use `/new-project` slash command (preferred)
- OR manually create the 3 items above following existing INDEX.md as template
- NEVER create a project directory without INDEX.md and sessions/
- ALWAYS update ACTIVE.md when adding or changing project status
