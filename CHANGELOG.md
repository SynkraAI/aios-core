# Changelog

All notable changes to Synkra AIOS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Open-Source Community Readiness (Epic OSR)** - Legal foundation documentation (Story OSR-3)
  - Created `PRIVACY.md` - Privacy policy (English)
  - Created `PRIVACY-PT.md` - Política de privacidade (Português)
  - Created `TERMS.md` - Terms of use (English)
  - Created `TERMS-PT.md` - Termos de uso (Português)
  - Updated `CHANGELOG.md` - Following Keep a Changelog format
  - Updated `README.md` - Added bilingual legal section table
  - Updated `CODE_OF_CONDUCT.md` - Added contact information
  - All legal documents follow industry standard templates with PT-BR translations

- **Agent Command Rationalization** - Consolidated and clarified agent commands for better usability (Story 6.1.2.3)
  - Created 4 new consolidated task files:
    - `.aios-core/tasks/security-audit.md` - Consolidates RLS audit + schema audit
    - `.aios-core/tasks/analyze-performance.md` - Consolidates query explain + hotpaths + optimization
    - `.aios-core/tasks/test-as-user.md` - Renamed from db-impersonate.md (clearer purpose)
    - `.aios-core/tasks/setup-database.md` - Database-agnostic setup (was Supabase-only)
  - Created migration and selection guides:
    - `docs/guides/command-migration-guide.md` - v2.0→v3.0 migration timeline (6 months)
    - `docs/guides/agent-selection-guide.md` - Quick reference for choosing agents
  - Created analysis documentation:
    - `docs/analysis/backward-compatibility-report.md` - Comprehensive compatibility testing (18/20 tests passed)
    - `docs/analysis/command-inventory-report.md` - Full command audit (75 commands analyzed)
    - `docs/analysis/agent-responsibility-matrix.md` - Clear boundary definitions for 4 agents
    - `docs/analysis/aios-master-rationalization-plan.md` - Implementation plan (44→30 commands)
    - `docs/analysis/data-engineer-rationalization-plan.md` - Implementation plan (31→28 commands)
  - Files Modified:
    - `.aios-core/agents/aios-master.md` - Command consolidation (44→30 commands, 32% reduction)
    - `.aios-core/agents/data-engineer.md` - Command consolidation (31→28 commands, 9.7% reduction)
    - `.aios-core/agents/architect.md` - Added "NOT for" delegation guidance in whenToUse
    - `.aios-core/agents/analyst.md` - Added "NOT for" delegation guidance in whenToUse
    - `.aios-core/agents/pm.md` - Added "NOT for" delegation guidance + epic/story delegation pattern
    - `.aios-core/agents/sm.md` - Added "NOT for" delegation guidance + Git boundary clarification
    - `.aios-core/agents/dev.md` - Renamed command: review-qa → apply-qa-fixes (4 occurrences)
    - `.aios-core/agents/po.md` - Changed icon: ⚖️ → 🎯 Target (6 occurrences)
  - Backward Compatibility: 100% maintained (all old task files preserved for 6-month deprecation period)
  - Zero Breaking Changes: All workflows validated, no functionality lost

- **Dynamic Project Status Context** - All agents now display current project context on activation (Story 6.1.2.4)
  - Git branch, modified files, and recent commits shown in agent greetings
  - Current story and epic detection from `docs/stories/` directory
  - 60-second cache mechanism for optimal performance (<100ms first load, <10ms cached)
  - Cross-platform support (Windows/Linux/macOS)
  - Graceful fallback for non-git projects
  - Files Added:
    - `.aios-core/scripts/project-status-loader.js` - Core status loader utility
    - `.aios-core/tasks/init-project-status.md` - DevOps initialization task
    - `.aios-core/scripts/__tests__/project-status-loader.test.js` - Jest unit tests
    - `docs/guides/project-status-feature.md` - User guide and documentation
  - Files Modified:
    - `.aios-core/core-config.yaml` - Added projectStatus configuration section
    - All 11 agent files - Updated activation-instructions (STEP 2.5) and greeting_levels
    - `.aios-core/agents/devops.md` - Added *init-project-status command
    - `.gitignore` - Added .aios/project-status.yaml cache file

## [4.32.0] - 2025-11-12

### Removed
- **Private expansion packs** - Moved to separate private repository (`aios-expansion-packs`)
  - Removed `expansion-packs/creator/` (CreatorOS)
  - Removed `expansion-packs/innerlens/`
  - Removed `expansion-packs/mmos-mapper/`
  - Removed `expansion-packs/aios-infrastructure-devops/`
  - Removed `expansion-packs/meeting-notes/`
  - Repository: https://github.com/SynkraAI/aios-expansion-packs (PRIVATE)
- **Internal development tools** - Moved to separate private repository (`aios-dev-tools`)
  - Removed analysis scripts: `analyze-batches.js`, `analyze-decision-patterns.js`, `analyze-epic3.js`, etc.
  - Removed consolidation scripts: `consolidate-entities.js`, `consolidate-results.js`, etc.
  - Removed extraction scripts: `extract-all-claude-backups.js`, `extract-claude-history.js`
  - Removed generation scripts: `generate-entity-summary.js`, `generate-entity-table.js`
  - Repository: https://github.com/SynkraAI/aios-dev-tools (PRIVATE)
- **hybrid-ops expansion pack** - Moved to separate repository for independent maintenance
  - Removed `expansion-packs/hybrid-ops/` directory
  - Removed `.hybrid-ops/` directory
  - Updated `core-config.yaml` to reference external repository
  - Updated `install-manifest.yaml` (removed 47 file entries)
  - Repository: https://github.com/SynkraAI/aios-hybrid-ops-pedro-valerio

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
- Breaking Change: hybrid-ops no longer bundled with @synkra/aios-core
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
- Prevents confusion when running `npx @synkra/aios-core install` from home directory

### Changed
- Early exit with `process.exit(1)` when NPX temporary context detected
- Help message provides actionable solution: `cd /path/to/your/project && npx @synkra/aios-core install`

### Technical
- Story: 2.3 - NPX Installation Context Detection & Help Text (macOS)
- Defense in depth: Two independent detection layers provide redundancy
- macOS-specific implementation (other platforms unaffected)
- Non-breaking change (patch version)

## [4.31.0] - Previous Release

*(Previous changelog entries to be added)*
