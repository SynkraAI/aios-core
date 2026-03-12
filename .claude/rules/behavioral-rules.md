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

Every project MUST have INDEX.md — em `docs/projects/{name}/` (interno) OU `.aios/` (externo):

**CENTRALIZED** (dentro de aios-core):
1. `docs/projects/{name}/INDEX.md` — project state
2. `docs/projects/{name}/sessions/` — session files
3. Row em `docs/projects/ACTIVE.md` com `[INDEX]({name}/INDEX.md)`

**HYBRID** (projetos externos — ~/CODE/Projects/ ou caminho customizado):
1. `{project-path}/.aios/INDEX.md` — project state (governança local)
2. `{project-path}/.aios/sessions/` — session files
3. `{project-path}/.claude/CLAUDE.md` — ponte de contexto
4. Row em `docs/projects/ACTIVE.md` com `[INDEX]({path}/.aios/INDEX.md)`

**Detecção:** `.aios/INDEX.md` no cwd → HYBRID | cwd em `aios-core` → CENTRALIZED | ambos → ERRO

When creating a new project:
- Use `/new-project` slash command (preferred)
- NEVER create INDEX.md avulso sem a estrutura completa do `/new-project`
- ALWAYS update ACTIVE.md when adding or changing project status
