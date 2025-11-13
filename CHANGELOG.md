# Changelog

All notable changes to AIOS-FULLSTACK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.32.0] - 2025-11-12

### Removed
- **Private expansion packs** - Moved to separate private repository (`aios-expansion-packs`)
  - Removed `expansion-packs/creator/` (CreatorOS)
  - Removed `expansion-packs/innerlens/`
  - Removed `expansion-packs/mmos-mapper/`
  - Removed `expansion-packs/aios-infrastructure-devops/`
  - Removed `expansion-packs/meeting-notes/`
  - Repository: https://github.com/Pedrovaleriolopez/aios-expansion-packs (PRIVATE)
- **Internal development tools** - Moved to separate private repository (`aios-dev-tools`)
  - Removed analysis scripts: `analyze-batches.js`, `analyze-decision-patterns.js`, `analyze-epic3.js`, etc.
  - Removed consolidation scripts: `consolidate-entities.js`, `consolidate-results.js`, etc.
  - Removed extraction scripts: `extract-all-claude-backups.js`, `extract-claude-history.js`
  - Removed generation scripts: `generate-entity-summary.js`, `generate-entity-table.js`
  - Repository: https://github.com/Pedrovaleriolopez/aios-dev-tools (PRIVATE)
- **hybrid-ops expansion pack** - Moved to separate repository for independent maintenance
  - Removed `expansion-packs/hybrid-ops/` directory
  - Removed `.hybrid-ops/` directory
  - Updated `core-config.yaml` to reference external repository
  - Updated `install-manifest.yaml` (removed 47 file entries)
  - Repository: https://github.com/Pedrovaleriolopez/aios-hybrid-ops-pedro-valerio

### Changed
- README.md - hybrid-ops now listed under "Expansion Packs Externos"
- Expansion pack can now be installed independently via GitHub
- **Expansion-packs naming convention** - Applied consistent `{agent-id}-` prefix to agent-specific tasks across all 6 expansion-packs
  - ETL pack: 4 tasks renamed (youtube-specialist, social-specialist, web-specialist)
  - Creator pack: 4 tasks already renamed (pre-existing migration)
  - Innerlens pack: 4 tasks renamed (fragment-extractor, psychologist, quality-assurance)
  - Mmos-mapper pack: 7 tasks renamed (cognitive-analyst, research-specialist, system-prompt-architect, emulator, mind-pm)
  - Aios-infrastructure-devops pack: 2 tasks already renamed (pre-existing)
  - Meeting-notes pack: 1 task already renamed (pre-existing)
  - All agent dependencies updated to reference new task names
  - Shared tasks correctly have NO prefix (conservative approach)

### Technical
- Story: 4.6 - Move Hybrid-Ops to Separate Repository
- Breaking Change: hybrid-ops no longer bundled with aios-fullstack
- Migration: Users can install from external repo to `expansion-packs/hybrid-ops/`
- Story: 4.7 - Removed `expansion-packs/hybrid-ops.legacy/` directory (legacy backup no longer needed)
- Story: 4.5.3 - Expansion-Packs Naming Convention Migration
  - Applied naming convention from Story 4.5.2 to all 6 expansion-packs
  - Total: 15 tasks renamed (11 new + 4 pre-existing)
  - 18 agent files updated with new dependencies
  - Validation: 100% compliance, 0 broken references

## [4.31.1] - 2025-10-22

### Added
- NPX temporary directory detection with defense-in-depth architecture
- PRIMARY detection layer in `tools/aios-npx-wrapper.js` using `__dirname`
- SECONDARY fallback detection in `tools/installer/bin/aios.js` using `process.cwd()`
- User-friendly help message with chalk styling when NPX temp directory detected
- Regex patterns to identify macOS NPX temporary paths (`/private/var/folders/.*/npx-/`, `/.npm/_npx/`)
- JSDoc documentation for NPX detection functions

### Fixed
- NPX installation from temporary directory no longer attempts IDE detection
- Clear error message guides users to correct installation directory
- Prevents confusion when running `npx aios-fullstack install` from home directory

### Changed
- Early exit with `process.exit(1)` when NPX temporary context detected
- Help message provides actionable solution: `cd /path/to/your/project && npx aios-fullstack install`

### Technical
- Story: 2.3 - NPX Installation Context Detection & Help Text (macOS)
- Defense in depth: Two independent detection layers provide redundancy
- macOS-specific implementation (other platforms unaffected)
- Non-breaking change (patch version)

## [4.31.0] - Previous Release

*(Previous changelog entries to be added)*
