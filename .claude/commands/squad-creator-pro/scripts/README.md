# Squad Creator Pro -- Scripts

> Inventory: 20 operational scripts, 17 test scripts, 2 cross-provider scripts
> Audit source: SCP-1 (2026-03-06), verified SCP-5

## Convention

- **Operational scripts:** `scripts/` root (20 files)
- **Test scripts:** `scripts/tests/` (17 files + conftest.py + `__init__.py`)
- **Cross-provider tooling:** `scripts/cross-provider/` (2 files)
- **Counting convention:** `config.yaml` `pro_stats.scripts` counts ONLY operational scripts in `scripts/` root (established SCP-2)

---

## Operational Scripts (20)

| # | Script | Language | Called By | Description | Status |
|---|--------|----------|----------|-------------|--------|
| 1 | `assess-sources.sh` | Bash | tasks/an-assess-sources.md | Source quality assessment and scoring | ACTIVE |
| 2 | `clone-review.sh` | Bash | tasks/an-clone-review.md, config/model-routing.yaml | Clone review execution with model routing | ACTIVE |
| 3 | `coherence-validator.py` | Python | workflows/wf-create-squad.yaml, data/hybridops-patterns.md | Squad coherence validation (also delegated from base adapter) | ACTIVE |
| 4 | `create-agent-preflight.py` | Python | NONE | Deterministic preflight checks for create-agent task | DEPRECATED |
| 5 | `fidelity-score.sh` | Bash | tasks/an-fidelity-score.md, tasks/optimize.md, config/model-routing.yaml | Fidelity scoring with multi-task reference | ACTIVE |
| 6 | `model-tier-validator.cjs` | Node.js | tasks/qualify-task.md, tasks/smoke-test-model-routing.md, workflows/wf-model-tier-qualification.yaml, config/scoring-rubric.yaml | Model tier validation and cost enforcement | ACTIVE |
| 7 | `model-usage-logger.cjs` | Node.js | tasks/smoke-test-model-routing.md | Model usage logging for cost tracking | ACTIVE |
| 8 | `modernization-score.sh` | Bash | tasks/pv-modernization-score.md | Process Vanguard modernization scoring | ACTIVE |
| 9 | `on-specialist-complete.py` | Python | skills/squad.md (SubagentStop hook) | Post-specialist completion handler | ACTIVE |
| 10 | `quality_gate.py` | Python | NONE (has test suite: test_quality_gate.py) | Quality gate evaluation engine | KEPT (planned wiring) |
| 11 | `save-session-metrics.py` | Python | skills/squad.md (Stop hook) | Session metrics persistence on stop | ACTIVE |
| 12 | `scoring.py` | Python | NONE directly (delegated from base adapter) | Modular scoring engine | ACTIVE (cross-squad) |
| 13 | `squad-context-loader.cjs` | Node.js | squad-workflow-runner.cjs (internal) | Pipeline context loader for agent wrappers | KEPT (infra trio) |
| 14 | `squad-state-manager.cjs` | Node.js | squad-workflow-runner.cjs, squad-context-loader.cjs (internal) | Pipeline state persistence (init/update/get/list) | KEPT (infra trio) |
| 15 | `squad-workflow-runner.cjs` | Node.js | NONE (CLI entrypoint, references state-manager + context-loader) | Pipeline orchestrator (start/resume/next/status/approve/revise/abort) | KEPT (infra trio) |
| 16 | `sync-chief-codex-skill.js` | Node.js | tasks/sync-chief-codex-skill.md | Generates skill file from squad config | ACTIVE |
| 17 | `validate-agent-output.py` | Python | skills/squad.md (PreToolUse hook) | Agent output validation hook | ACTIVE |
| 18 | `validate-clone.sh` | Bash | tasks/an-validate-clone.md | Clone validation execution | ACTIVE |
| 19 | `validate-squad.sh` | Bash | workflows/validate-squad.yaml, tasks/optimize.md, tasks/workspace-integration-hardening.md, workflows/wf-optimize-squad.yaml | Squad-level validation (multi-workflow reference) | ACTIVE |
| 20 | `validate-workspace-contract.py` | Python | tasks/workspace-integration-hardening.md | Workspace contract validation | ACTIVE |

---

## Orphan Scripts (Not Referenced in Tasks/Workflows)

From SCP-1 audit: 6 scripts had no direct task or workflow consumer. Each was evaluated using the decision framework (git history, cross-references, test coverage, isolation level).

| # | Script | Decision | Rationale |
|---|--------|----------|-----------|
| 1 | `squad-state-manager.cjs` | KEEP | Infrastructure trio -- CLI tool for pipeline state. Cross-referenced by workflow-runner and context-loader. |
| 2 | `squad-workflow-runner.cjs` | KEEP | Infrastructure trio -- CLI entrypoint for pipeline orchestration (start/resume/next/status/approve/revise/abort). |
| 3 | `squad-context-loader.cjs` | KEEP | Infrastructure trio -- Called as Step 1 in agent wrappers during squad creation. |
| 4 | `scoring.py` | KEEP | Cross-squad dependency: `squads/squad-creator/scripts/scoring.py` is an adapter that delegates to this Pro script. |
| 5 | `quality_gate.py` | KEEP | Has full test suite (`test_quality_gate.py`). Planned for future task/workflow wiring. |
| 6 | `create-agent-preflight.py` | DEPRECATE | Fully isolated: no task, workflow, skill, or cross-squad references. No test suite. Last modified in initial upgrade pack (SCPRO.3). |

### Infrastructure Trio Detail

The three CJS scripts form a self-contained CLI pipeline runtime:

```
squad-workflow-runner.cjs (entrypoint)
  |-- requires squad-state-manager.cjs (state persistence)
  |-- requires squad-context-loader.cjs (agent context)
       |-- reads from squad-state-manager.cjs (state lookup)
```

These are NOT invoked by task markdown files or workflow YAML. They are standalone CLI tools intended for direct node execution:

```bash
node squad-workflow-runner.cjs start <slug> --name "Name"
node squad-workflow-runner.cjs resume [slug]
node squad-state-manager.cjs init <slug>
node squad-state-manager.cjs status [slug]
node squad-context-loader.cjs <agent_key> [slug]
```

---

## Cross-Squad Dependencies

| Script | External Reference | Direction | Detail |
|--------|-------------------|-----------|--------|
| `scoring.py` | `squads/squad-creator/scripts/scoring.py` (adapter) | base --> pro delegation | Base adapter checks if Pro script exists, delegates with full argv passthrough |
| `coherence-validator.py` | `squads/squad-creator/scripts/coherence-validator.py` (adapter) | base --> pro delegation | Same adapter pattern: exists check + subprocess delegation |

Both adapters follow the same pattern:
1. Check if `squad-creator-pro/scripts/{script}` exists
2. If yes: `subprocess.run([sys.executable, pro_script, *sys.argv[1:]])` and mirror exit code
3. If no: return `SKIPPED_PRO_ONLY` payload with fallback hint

---

## Test Scripts (17)

Located in `scripts/tests/`. Convention: `test_{script_name}.{ext}` mirrors the operational script.

| # | Test Script | Tests For | Language |
|---|-------------|-----------|----------|
| 1 | `test_assess_sources.sh` | assess-sources.sh | Bash |
| 2 | `test_checklist_validator.py` | (checklist validation logic) | Python |
| 3 | `test_clone_review.sh` | clone-review.sh | Bash |
| 4 | `test_coherence_validator.py` | coherence-validator.py | Python |
| 5 | `test_dependency_check.py` | (dependency checking logic) | Python |
| 6 | `test_fidelity_score.sh` | fidelity-score.sh | Bash |
| 7 | `test_inventory.py` | (inventory validation logic) | Python |
| 8 | `test_modernization_score.sh` | modernization-score.sh | Bash |
| 9 | `test_naming_validator.py` | (naming convention validation) | Python |
| 10 | `test_quality_gate.py` | quality_gate.py | Python |
| 11 | `test_refresh_registry.py` | (registry refresh logic) | Python |
| 12 | `test_scoring.py` | scoring.py | Python |
| 13 | `test_security_scanner.py` | (security scanning logic) | Python |
| 14 | `test_squad_analytics.py` | (squad analytics logic) | Python |
| 15 | `test_validate_clone.sh` | validate-clone.sh | Bash |
| 16 | `test_yaml_validator.py` | (YAML validation logic) | Python |
| 17 | `run_bash_tests.sh` | (test runner for all bash tests) | Bash |

Supporting files: `conftest.py` (pytest fixtures), `__init__.py` (package marker).

---

## Cross-Provider Scripts (2)

Located in `scripts/cross-provider/`. Used for multi-provider comparison workflows.

| # | Script | Language | Description |
|---|--------|----------|-------------|
| 1 | `compare-results.js` | Node.js | Compare outputs across different LLM providers |
| 2 | `cross-provider-runner.js` | Node.js | Execute tasks across multiple providers for benchmarking |

---

## Deprecated Scripts

| Script | Deprecated Since | Reason | Removal Target |
|--------|-----------------|--------|----------------|
| `create-agent-preflight.py` | SCP-5 (2026-03-06) | Fully isolated: no task, workflow, skill, or test references. Original purpose (preflight checks for create-agent) was never wired into any consumer. | Next major version or cleanup pass |
