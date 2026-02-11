# Architect Agent Memory

## EPIC-ACT Wave 2 Quality Gate Review (2026-02-06)
- Reviewed: ACT-6 (Unified Activation Pipeline, 67 tests, APPROVED)
- Total EPIC-ACT: 255 tests pass across 4 test suites (0 regressions)
- UnifiedActivationPipeline: single entry point, 5-way parallel load, 3-phase sequential, GreetingBuilder final
- Timeout architecture: 150ms per-loader, 200ms total pipeline, fallback greeting on failure
- Timer leak concern: _timeoutFallback setTimeout not cancelled when pipeline wins the race (advisory, not blocking)
- generate-greeting.js refactored to thin wrapper; backward compatible
- All 12 agent .md files updated with unified STEP 3 reference
- *validate-agents command added to aios-master (validate-agents.md task file)

## EPIC-ACT Wave 1 Quality Gate Review (2026-02-06)
- Reviewed: ACT-1 (config fix, merged), ACT-2 (user_profile audit, 31 tests), ACT-3 (ProjectStatusLoader, 90 tests), ACT-4 (PermissionMode, 67 tests)
- All 188 tests pass across 3 test suites
- Key patterns: fingerprint-based cache invalidation, file locking with wx flag, mode cycling (ask>auto>explore)
- PermissionMode reads from `.aios/config.yaml`, NOT from `.aios-core/core-config.yaml` - different config hierarchy
- GreetingPreferenceManager reads from `.aios-core/core-config.yaml` (agentIdentity.greeting.preference)
- The *yolo command cycles PermissionMode; it does NOT directly change greeting preference

## Architecture Patterns to Track
- Agent activation: UnifiedActivationPipeline is now THE single entry point for all 12 agents (ACT-6)
- Previous two paths (Direct 9 agents + CLI wrapper 3 agents) are now unified
- generate-greeting.js is thin wrapper around UnifiedActivationPipeline (backward compat)
- user_profile cascades: config-resolver > validate-user-profile > greeting-preference-manager > greeting-builder
- Permission system: permission-mode.js + operation-guard.js + index.js (facade)
- ProjectStatusLoader: .aios/project-status.yaml (runtime cache), separate from .aios-core/ (framework config)
- PM agent bypasses bob mode restriction in _resolvePreference()

## Key File Locations
- Unified Pipeline: `.aios-core/development/scripts/unified-activation-pipeline.js`
- Permissions: `.aios-core/core/permissions/`
- Greeting system: `.aios-core/development/scripts/greeting-builder.js`, `greeting-preference-manager.js`
- Project status: `.aios-core/infrastructure/scripts/project-status-loader.js`
- User profile validation: `.aios-core/infrastructure/scripts/validate-user-profile.js`
- Post-commit hook: `.aios-core/infrastructure/scripts/git-hooks/post-commit.js` + `.husky/post-commit`
- Validate agents task: `.aios-core/development/tasks/validate-agents.md`

## Video Media Content Downloader Architecture (2026-02-10)
- v1.2.0 restored from backup after v2.0/v2.1 regression (context window overflow)
- Full architectural review completed: 10 findings (2 CRITICAL, 3 HIGH, 3 MEDIUM, 2 LOW)
- CRITICAL P1: No context window management instructions (texts >15k words overflow)
- CRITICAL P2: 3 bundled scripts duplicate CLI functionality (CLI is superior in all cases)
- HIGH P3: "Ready text" flow has no pre-processing or size gating
- HIGH P4: Script paths ambiguous (`scripts/` vs absolute skill-resources path)
- HIGH P5: CLI missing `chunk` standalone and `ingest` commands for ready text
- Architecture principle: CLI = Hands (I/O), Skill = Brain (LLM analysis)
- CLI at `tools/video-transcriber/` (Python, Typer); supports mlx-whisper, bundled scripts don't
- Key gap: CLI `process` only accepts URL/file, not ready text (VTT/SRT/TXT)
- Recommended: Add Context Window Management section + `ingest` CLI command
- Bundled scripts should be REMOVED; CLI is canonical implementation
- Text size gates: <5k direct, 5-15k cautious, 15-30k chunked, >30k CLI-assisted

## Master Prompt Best Practices Research (2026-02-10)
- Full research document: `docs/architecture/master-prompt-best-practices.md`
- Key insight (Anthropic): "Intelligence is not the bottleneck, context is"
- Goldilocks zone: not over-specified (brittle if-else) nor under-specified (vague)
- Claude 4.6 change: CRITICAL/MUST/NEVER language now causes over-triggering; use natural language
- AIOS strengths: numbered options, elicit=true, persona profiles, dependency loading, permission modes
- AIOS gaps: aggressive language, no context rot prevention, no NOTES.md pattern, prompts too long
- Persona research: effective for creative tasks, ineffective for factual accuracy tasks
- 3 requirements for good personas: Specific + Detailed + Automated
- Context rot has 4 forms: Poisoning, Distraction, Confusion, Clash
- Top recommendations: R1-audit aggressive language, R4-separate core from modules, R5-NOTES.md pattern

## Pre-existing Test Failures (not EPIC-ACT related)
- squads/mmos-squad/ (6 suites): missing clickup module
- tests/core/orchestration/ (2 suites): greenfield-handler, terminal-spawner
