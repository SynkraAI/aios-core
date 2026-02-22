# Dev Agent Memory (Dex)

## Key Patterns
- CommonJS (`require`/`module.exports`), NOT ES Modules
- ES2022, Node.js 18+, 2-space indent, single quotes
- Absolute imports always (never relative `../`)
- kebab-case for files, PascalCase for components
- Jest 30.2.0 for testing, `npm test` to run

## Project Structure
- `.aios-core/core/` — Core modules (synapse, session, code-intel, orchestration)
- `.aios-core/development/` — Agents, tasks, templates, scripts
- `.aios-core/infrastructure/` — CI/CD, git detection, project-status
- `tests/` — Test suites (mirrors source structure)
- `docs/stories/` — Story files (active development)

## Git Rules
- NEVER push — delegate to @devops
- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`
- Reference story: `feat: implement feature [Story NOG-18]`

## Common Gotchas
- Windows paths: use forward slashes in code, bash shell not cmd
- `fs.existsSync` for sync checks, `fs.promises` for async
- atomicWriteSync from `.aios-core/core/synapse/utils/atomic-write` for safe file writes
- CodeRabbit runs in WSL, not Windows directly

## Story Workflow
- Read task → Implement → Write tests → Validate → Mark checkbox [x]
- ONLY update: checkboxes, Debug Log, Completion Notes, Change Log, File List
- NEVER modify: Status, Story, AC, Dev Notes, Testing sections
