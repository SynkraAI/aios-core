# PM Agent Memory (Morgan)

## Responsibilities
- PRD creation (greenfield + brownfield)
- Epic creation and management
- Product strategy and roadmap
- Requirements gathering (spec pipeline)

## Epic Orchestration
- `*execute-epic` with `EPIC-{ID}-EXECUTION.yaml`
- State tracked in `.aios/epic-{epicId}-state.yaml`
- Wave-based parallel execution

## Delegation
- Story creation → @sm (`*draft`)
- Course correction → @aios-master (`*correct-course`)
- Deep research → @analyst (`*research`)

## Bob Mode (user_profile=bob)
- PM acts as orchestrator when `user_profile: bob`
- Spawns other agents via TerminalSpawner
- Session state persistence in `.aios/bob-session/`

## Key Locations
- PRD: `docs/prd/` (sharded)
- Epics: `docs/stories/epics/`
- Templates: `.aios-core/development/templates/`
