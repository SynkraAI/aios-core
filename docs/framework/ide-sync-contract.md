# IDE Sync Contract (OSS)

> CORE-SUPER-UPDATE Wave D1 · Constitution **Article XI** (Squad-First Portability)

## Sources of truth

| Layer | Path | Mutability |
|-------|------|------------|
| Framework agents | `.aiox-core/development/agents/` | Framework (L1/L2) |
| Framework tasks | `.aiox-core/development/tasks/` | Framework |
| Framework skills | `.aiox-core/development/skills/` | Framework |
| Squad packs | `squads/{squad}/` | Project / expansion |
| Runtime projections | `.claude/`, `.grok/`, `.codex/`, `.gemini/` | **Generated / synced** |

## Surfaces

| Surface | Projection | Sync |
|---------|------------|------|
| Claude Code | `.claude/skills/`, `.claude/agents/`, rules | `npm run sync:ide` / installer |
| Grok Build | `.grok/skills/aiox-*`, agents, roles | `npm run sync:skills:grok` |
| Codex | `.codex/skills`, agents | `npm run sync:skills:codex` |
| Gemini | `.gemini/` (when enabled) | `npm run sync:ide:gemini` |

## Rules (must hold)

1. **Never invent parallel AC** in a projection — tasks under `.aiox-core/development/tasks/` remain SOT for SDC.
2. **Direction:** SOT → projection. Do not reverse-sync projection edits into framework core without an explicit PR to SOT.
3. **Grok workflow skills** for SDC live under `.aiox-core/development/skills/` and are copied by `grok-skills-sync` (`DEVELOPMENT_WORKFLOW_SKILLS`).
4. **Parity:** run `npm run validate:parity` (or project equivalent) before release when multi-IDE is supported.
5. **Drift check:** `npm run sync:ide:check` when available.

## Operator cheatsheet

```bash
# After editing agents/skills SOT
npm run sync:skills:grok
npm run sync:ide          # if IDE templates changed
npm run validate:parity   # multi-IDE smoke when configured
```

## Out of scope (product)

- Cockpit panes / companion spawn  
- Multi-BU workspace IDE policies  
- Host-locked executable logic only under `.claude/` for squad-owned skills  

## Related

- Constitution Article XI — `.aiox-core/constitution.md`  
- Story locations — `docs/framework/story-locations.md`  
- ARCH-D — `docs/framework/epics/core-super-update/ARCHITECTURE-WAVE-D.md`  
- Wave B SDC skills — `.aiox-core/development/skills/`  
