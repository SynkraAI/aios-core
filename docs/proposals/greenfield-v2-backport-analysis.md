# PR: Backport Ship-It Workflow Improvements to Greenfield Native

## Summary

Deep comparative analysis between the **native AIOS greenfield workflow** (`greenfield-fullstack.yaml` — 384 lines, single file, 4 phases) and the **Ship-It squad workflow** (`squads/ship-it/workflows/` — 8,340 lines, 14 files, 8 phases) revealing **20 major improvements** developed in Ship-It v3.3 that should be backported to the AIOS core framework.

Ship-It evolved from a fork of the original greenfield into a production-grade workflow system with structured gates, fail-staged protocols, cascade invalidation, physical verification, and a complete delivery phase — all absent from the current native workflow.

## Test plan

- [ ] Verify Ship-It file structure matches documented 14 files
- [ ] Confirm line counts for each Ship-It phase file
- [ ] Validate gate inventory (69 checks: 34 HB + 24 FS + 11 V)
- [ ] Review accuracy of comparative metrics table
- [ ] Verify all referenced Ship-It features exist in source files
- [ ] Validate that existing greenfield-fullstack.yaml consumers are not broken
- [ ] Verify gate structures parse correctly (YAML schema validation)
- [ ] Confirm phase files load independently (each < 1000 lines)
- [ ] Test cascade_invalidation logic with mock state.yaml
- [ ] Verify Framework 9 Passos structure is consistent across all phases
- [ ] Run ship-it smoke tests against new greenfield structure
- [ ] Validate verify_type classifications (shell commands executable, state paths valid)

---

## Comparative Metrics

| Dimension | Greenfield Native (current) | Ship-It v3.3 | Gap |
|-----------|---------------------------|--------------|-----|
| Architecture | 1 file, 384 lines | 14 files, 8,340 lines | Monolith vs sharded |
| Phases | 4 (0-3) | 8 (0-7) + brownfield alt | Missing 4 phases |
| Formal gates | 0 | 10 (structured YAML) | No quality control |
| Verify types | None | 3 (shell/state/manual) | No automation readiness |
| Severity levels | None | 3 (halt/block/warn) | No triage system |
| Framework 9 Passos | None | All phases | No execution standard |
| State tracking | None | state.yaml persisted | No session persistence |
| Delivery phase | ABSENT | Complete (E2E/deploy/rollback/handoff) | Critical gap |
| Definition of Done | None | 21 criteria (Phase 7) | No completion standard |
| Cascade invalidation | None | All gates | No change propagation |
| Fail-staged protocol | None | 5 supervisor rules | Silent degradation risk |
| Reconciliation | None | Triple + PRD vs deployed | No consistency check |

---

## Improvement Categories

### Category A: Workflow Architecture (Structural)

#### A1. Phase File Sharding
**Problem:** Native greenfield is a single 384-line monolith. Agents must load the entire file even when working on a single phase.

**Ship-It solution:** Sharded into 14 independent files:
- `manifest.yaml` — phase registry, gate registry, scope modes, verify/severity types
- `metadata.yaml` — version history, changelog, guarantees
- `phase-{N}-{name}.yaml` — one file per phase (300-1200 lines each)

**Impact:** Agents read only their phase. Token efficiency. Independent validation per file.

**Files:**
```text
manifest.yaml          (465 lines)  — orchestration metadata
metadata.yaml          (100 lines)  — version history
phase-0-bootstrap.yaml (1019 lines) — environment setup
phase-0b-brownfield.yaml (306 lines) — brownfield alt entry
phase-1-brief.yaml     (397 lines)  — project brief
phase-2-research.yaml  (423 lines)  — research & discovery
phase-3-prd.yaml       (625 lines)  — PRD creation
phase-4-design.yaml    (832 lines)  — design controller
phase-4a-track-arch.yaml (353 lines) — architecture track
phase-4b-track-data.yaml (339 lines) — data track
phase-4c-track-ux.yaml (656 lines)  — UX track
phase-5-planning.yaml  (1284 lines) — planning + sharding
phase-6-execution.yaml (845 lines)  — implementation loop
phase-7-delivery.yaml  (696 lines)  — delivery + handoff
```

---

#### A2. Manifest with Phase Registry
**Problem:** Native workflow has an implicit phase list with no machine-readable metadata.

**Ship-It solution:** Structured phase registry:
```yaml
phases:
  - id: "bootstrap"
    name: "Environment Bootstrap"
    order: 0
    file: "phase-0-bootstrap.yaml"
    estimated_duration: "1-2 horas"
    skippable: true
    critical: false
    gate_in: null
    gate_out: "bootstrap_to_brief"
```

**Impact:** Runtime engine can orchestrate phases programmatically. Duration estimates enable project planning.

---

#### A3. Scope Modes (Multiple Entry Points)
**Problem:** Native greenfield has a single entry point — always starts from Phase 0.

**Ship-It solution:** 4 scope modes:

| Mode | Phases | Duration | Command | Use Case |
|------|--------|----------|---------|----------|
| `full` | 0-7 | 2-8 weeks | `*ship-completa` | Greenfield from scratch |
| `light` | 5-7 | 1-3 weeks | `*ship-rapida` | Existing PRD/architecture |
| `hotfix` | 6-7 | 2-8 hours | `*hotfix` | Emergency fix |
| `quick_fix` | 6-7 | 1-4 hours | `*quick-fix` | Small feature/fix |

**Impact:** Teams don't re-run discovery for hotfixes. Flexible entry based on context.

---

#### A4. Brownfield Alternative Entry Point
**Problem:** Native greenfield assumes green-field only. No path for existing codebases.

**Ship-It solution:** Phase 0b Brownfield Discovery:
```yaml
- id: "brownfield_discovery"
  order: "0b"
  file: "phase-0b-brownfield-discovery.yaml"
  mode: "brownfield"
  replaces_phases: ["brief", "research"]
  gate_out: "brownfield_to_planning"
```

**Impact:** Existing projects enter directly at PRD phase after brownfield discovery, skipping Brief + Research.

---

### Category B: Gate System (Quality Control)

#### B1. Three-Layer Gate Structure
**Problem:** Native greenfield has `requires:` fields (boolean conditions) with no severity, no enforcement, no user involvement.

**Ship-It solution:** Every gate has 3 structured layers:
```yaml
gate_config:
  hard_blocks:        # HALT — absolute block, no bypass
    - id: "HB-PRD-001"
      condition: "PRD document must exist"
      verify_type: "shell"
      verify: "test -f docs/02_PRD.md"
      severity: "halt"
      message: "PRD not found — cannot proceed to Design"

  fail_staged_checks: # STAGED — requires user acknowledgment
    - id: "FS-PRD-001"
      condition: "Zero placeholders in PRD"
      verify_type: "shell"
      verify: "grep -qE '\\{[^}]+\\}' docs/02_PRD.md"
      severity: "block"
      impact: "Incomplete PRD will cascade to broken Design"
      requires: "user_acknowledgment"

  veto_conditions:    # CONSTITUTIONAL — blocks advance
    - id: "V-PRD-001"
      condition: "PRD must be self-sufficient"
      severity: "block"
      action: "BLOCK_ADVANCE"
      message: "PRD ruim = Design ruim = Planning ruim = Execution ruim"
```

**Gate inventory across all phases:**

| Gate | Hard Blocks | Fail Staged | Veto Conditions |
|------|-------------|-------------|-----------------|
| bootstrap_to_brief | 3 | 2 | 1 |
| brief_to_research | 3 | 2 | 2 |
| research_to_prd | 5 | 4 | 2 |
| prd_to_design | 4 | 4 | 1 |
| design_to_planning | 4 | 4 | 1 |
| planning_to_execution | 4 | 3 | 1 |
| plan-before-execute | 1 | 0 | 0 |
| execution_to_delivery | 3 | 2 | 1 |
| delivery_to_done | 7 | 3 | 2 |
| **TOTAL** | **34** | **24** | **11** |

**Impact:** 69 structured quality checks vs 0 in native greenfield.

---

#### B2. Cascade Invalidation Protocol
**Problem:** Native greenfield has no mechanism to detect/propagate upstream changes. If PRD changes after architecture is done, architecture proceeds with stale data.

**Ship-It solution:** Every gate has cascade_invalidation:
```yaml
cascade_invalidation:
  trigger: "If PRD changes after Design starts"
  action: "Invalidate Design + all downstream"
  downstream_impact: ["design", "planning", "execution", "delivery"]
```

**Full cascade map:**

| Gate | Trigger | Invalidates |
|------|---------|-------------|
| bootstrap_to_brief | Environment changes | All 7 downstream |
| brief_to_research | Brief modified | Research + 5 downstream |
| research_to_prd | Research modified | PRD + 4 downstream |
| prd_to_design | PRD modified | Design + 3 downstream |
| design_to_planning | Any design doc changes | Planning + 2 downstream |
| planning_to_execution | Planning artifacts change | Execution + Delivery |
| execution_to_delivery | Code/stories change | Delivery only |

**Impact:** Changes propagate correctly. No stale artifacts downstream.

---

#### B3. Checkpoint Idempotency
**Problem:** Native has no checkpoint system. No re-run safety.

**Ship-It solution:**
```yaml
checkpoint_idempotency: "Re-running updates existing entry, safe to re-run"
```

**Impact:** Gates can be re-executed without duplicating state. Essential for recovery from failures.

---

### Category C: Fail-Staged Protocol (Zero Silent Degradation)

#### C1. Five Supervisor Rules
**Problem:** Native greenfield silently skips optional steps with no tracking.

**Ship-It solution:** 5 mandatory rules enforced across all phases:

| Rule | Description |
|------|-------------|
| 1. NEVER skip silently | Silent fallback is a VIOLATION |
| 2. Force conscious decision | User MUST choose: fix / accept with justification / cancel |
| 3. Log everything | Every degradation in `state.yaml degradation_log` |
| 4. Propagate visibility | Every checkpoint/handoff shows `[DEGRADED: N checks — {list}]` |
| 5. Accumulate, never reset | Degradations are CUMULATIVE. `degradation_percentage` = project's quality tax |

**Impact:** Quality degradation is always visible, never hidden. User owns the decision.

---

#### C2. Cross-Squad Degradation Protocol
**Problem:** Native has no cross-squad dependency handling.

**Ship-It solution (Phase 5 — pedro-valerio integration):**
```text
If squad dependency not installed:

STEP F1 — STOP & INFORM (inline warning with affected checks)
STEP F2 — User chooses: install / accept degradation with justification / cancel
STEP F3 — If accepted: state.yaml tracks all skipped checks + justification
```

**Impact:** External dependencies fail gracefully with full user awareness.

---

### Category D: Verification & Classification System

#### D1. Verify Type Classification
**Problem:** Native greenfield has prose descriptions ("Can do brainstorming first"). No machine-executable checks.

**Ship-It solution:** 3 verify types:

| Type | Description | Automatable | Example |
|------|-------------|-------------|---------|
| `shell` | Executable command | Yes | `test -f docs/02_PRD.md` |
| `state` | State.yaml dotpath | Yes | `state.yaml: prd.checkpoint.user_approval == true` |
| `manual` | Human judgment | No | `Alan validates PRD is self-sufficient` |

**Impact:** Runtime engine knows what to automate vs what requires human input.

---

#### D2. Severity Standardization
**Problem:** Native has no severity levels. Everything is either optional or required (binary).

**Ship-It solution:** 3 severity levels:

| Severity | Action | Bypass | Example |
|----------|--------|--------|---------|
| `halt` | STOP workflow entirely | None | Deploy not in production |
| `block` | Block phase advance, allow fix | Escalation | Artifact missing |
| `warn` | Log + continue with tracking | User acknowledgment | Optional tool not configured |

**Impact:** Proportional response to failures. Not everything is a hard stop.

---

#### D3. Physical Verification Enforcement
**Problem:** Native relies on declarations ("creates: prd.md") without verifying.

**Ship-It solution:**
```yaml
rule: "All verification MUST be executed (ls, grep, test -f), not declared"
on_skip: "BLOCK — Declared verification without execution = INVALID"
```

**Impact:** Every artifact claim is backed by shell evidence.

---

### Category E: Framework 9 Passos (Execution Standard)

#### E1. Consistent Phase Structure
**Problem:** Native phases have inconsistent structure. Some have `notes:`, some have `condition:`, no standard.

**Ship-It solution:** Every phase follows 9 steps:
```yaml
step_1_input:          # Context + prerequisites + input_from
step_2_input_value:    # User input format + validation
step_3_pre_checklist:  # Entry quality gate (typed checks)
step_4_executor:       # Agent assignment + delegation rules
step_5_prompt:         # Detailed execution instructions
step_6_tools:          # Tool inventory (required + optional)
step_7_output:         # Artifact definitions (path + format)
step_8_pos_checklist:  # Exit quality gate (typed checks)
step_9_definition_of_done:  # Completion criteria + gate_config
```

**Impact:** Consistent execution contract. Any agent knows exactly what to expect from any phase.

---

#### E2. Plan Approval Sub-Step
**Problem:** Native jumps directly from prerequisites to execution.

**Ship-It solution:** `step_3_5_execution_plan` — agent presents structural plan BEFORE generating artifacts:
- Structural plan for PRD (which sections, derivation sources)
- Architecture plan (stack, modules, deploy strategy)
- Execution plan (story order, dependencies, agent assignments)
- Supervisor validates: coverage, derivation correctness, no feature creep
- 2-cycle max approval loop

**Impact:** Prevents "generate first, fix later" waste.

---

#### E3. Post-Phase Audit Module
**Problem:** Native has no independent verification after execution.

**Ship-It solution:** `step_8_5_post_phase_audit` (permanent module in Phases 6+7):
```yaml
audit_checks:
  - "Physical count vs state.yaml"
  - "QA coverage real vs declared"
  - "Deploy evidence verification"
  - "Epic integrity"
output: "docs/audit/phase-{N}-audit.md"
on_fail: "BLOCK step_9 (DoD)"
```

**Impact:** Independent verification catches state.yaml inflation.

---

### Category F: Missing Phases (New Capabilities)

#### F1. Phase 2: Research & Discovery
**Problem:** Native jumps from Brief directly to PRD creation. No structured research.

**Ship-It solution:** Dedicated research phase with 6 steps:
1. **Validate Problem** — rewrite with clarity + measurable metrics
2. **Map Functional Requirements** — filter by MVP scope (RF-01, RF-02...)
3. **Derive Non-Functional Requirements** — from success metrics + stack constraints
4. **Map Risks & Mitigations** — probability/impact/mitigation per risk
5. **Benchmark Analysis** — analyze references or WebSearch similar solutions
6. **Resolve Pending Questions** — identify gaps → AskUserQuestion → incorporate

**Gate:** min 3 RFs, 3 RNFs, 2 risks, zero placeholders.

**Impact:** PRD receives validated, structured input instead of raw brief.

---

#### F2. Phase 3: PRD with 4 Robustness Protocols
**Problem:** Native PRD creation is a single step (`pm-create-prd`) with no quality enforcement.

**Ship-It solution:** 4 protocols embedded in PRD creation:

| Protocol | Purpose | Example |
|----------|---------|---------|
| P1: Caminho Infeliz | Edge case handling per feature | Loading states, error messages, retry logic |
| P2: Fricção Zero | Manual fallback for every automation | Degraded behavior, support diagnostics |
| P3: Inteligência de Interface | Search/input field logic | Fuzzy search, autocomplete, debounce, empty states |
| P4: Validação Técnica | Exact technical parameters | Hex colors, fonts, coordinates for exports/PDFs |

Plus: **Auto-Revisão QA Preventivo** — PM self-audits PRD before presenting to user.

**Impact:** PRD is production-ready, not a wishlist.

---

#### F3. Phase 4: Design Track System (Semi-Parallel)
**Problem:** Native design is sequential (architect → UX → architect review). No data track. No cross-validation.

**Ship-It solution:** 3 tracks with dependency management:
```text
Track A (PARALLEL):  Architect + UX → read PRD independently
Track B (SEQUENTIAL): Data-engineer → blocked until architecture exists
Track C (CONSOLIDATION): Architect → validates alignment across all 3
```

Includes:
- **Sub-sharded track files** (4a/4b/4c) — agents read only their track
- **Conflict resolution protocol** — source-of-truth per conflict type
- **UX anti-hallucination rules** — ONLY work from PRD, zero orphan components
- **Design token hierarchy** — 3 layers (primitive → semantic → component)
- **UI states specification** — 5 mandatory tables (loading/error/empty/retry/fallback)

**Impact:** Parallel execution, cross-validation, zero orphan components.

---

#### F4. Phase 5: Planning with QA Traceability Audit
**Problem:** Native "Document Sharding" is a single step. No traceability, no backlog validation.

**Ship-It solution:** Planning phase includes:
- **Delegation matrix** — exclusive ownership per artifact type
- **QA traceability audit** — 3 mandatory reports:
  - RF coverage: PRD §4 vs epics vs stories (COBERTO/ÓRFÃO)
  - UX coverage: screens/flows vs epics vs stories
  - Integration analysis: glue features with stories
- **Backlog DAG validation** — zero circular dependencies, sanity bounds (3-30 stories)
- **Document sharding** — PRD (5 shards), architecture (3), data (2), UX (3)
- **Cross-squad handoff** — pedro-valerio squad with fail-staged protocol

**Impact:** 100% feature coverage guaranteed before execution starts.

---

#### F5. Phase 6: Execution with Structured Loop
**Problem:** Native Phase 3 is: SM creates → Dev implements → optional QA → repeat. No planning, no enforcement.

**Ship-It solution:**
- **Plan-before-execute gate** — ordered story list with dependencies approved BEFORE any story starts
- **Execution modes** — Supervised (checkpoint between stories) vs YOLO (autonomous)
- **Hard delegation locks** — @dev implements (exclusive), @qa validates (mandatory), @devops deploys (exclusive)
- **DONE.md artifact gate** — physical evidence per story
- **Triple reconciliation** — backlog × DONE.md count × state.yaml MUST match
- **QA 100% hard block** — no bypass, no `*ship-force`, no user override
- **Atomic loop enforcement** — ONE story at a time, complete dev→qa→devops BEFORE next
- **Rejection cycle tracking** — 3 cycles → escalate to user
- **CodeRabbit self-healing** — 3 fix cycles before QA
- **Compaction awareness** — save state between stories for context survival
- **State.yaml write rules** — counters increment ONLY with physical evidence

**Impact:** Structured, gated, audited execution vs loose "implement and hope".

---

#### F6. Phase 7: Delivery (CRITICAL — Currently ABSENT)
**Problem:** Native greenfield has NO delivery phase. Development "completes" with no deploy, no testing, no handoff.

**Ship-It solution:** Complete delivery with 5 sub-phases:
1. **E2E Testing** — derived from PRD §4, 1 happy-path + 1 sad-path per feature, min 6 scenarios, 3 failure cycle escalation
2. **Deploy** — pre-checks (schema/env/entry-point), rollback plan MANDATORY before deploy, smoke tests (5 checks), deploy report
3. **PRD Reconciliation** — each PRD feature verified accessible in production, 100% coverage or BLOCK
4. **Handoff** — template-based with operational runbook (crash recovery, logs, rollback, emergency contacts), zero placeholders
5. **User Acceptance** — user tests production, explicit approval

**Gate:** 7 hard blocks, 3 fail-staged, 2 veto conditions. **Hardest gate in the entire workflow.**

**21 Definition of Done criteria:**
1. E2E test plan approved
2. E2E passed 100%
3. Rollback plan documented BEFORE deploy
4. Pre-checks passed
5. Deploy confirmed with smoke tests
6. Deploy report exists
7. Health check responds
8. System accessible (URL works)
9. Reconciliation PRD vs Deployed = 100%
10. Monitoring configured (with evidence)
11. Backup configured (with evidence)
12. Handoff documented with operational runbook
13. Handoff presented inline to user
14. Handoff covers 100% PRD §4
15. Zero placeholders in handoff
16. Audit executed and PASS
17. User tested and accepted
18. State.yaml updated
19. Mentee profile updated
20. Degradation summary in handoff
21. Project marked DONE

**Impact:** Projects actually ship to production with verified quality.

---

### Category G: UX & Interaction Patterns

#### G1. Inline Presentation Rule
**Problem:** Native workflow tells users to "save output to docs/ folder" and open files externally.

**Ship-It solution:**
```yaml
rule: "User NEVER opens files. Complete artifact rendered in conversation."
- All sections with visual separators
- Progress tracking ("Bloco X de 8")
- Confirmation after each block
```

**Impact:** Zero context switch. User reviews everything inline.

---

#### G2. Interactive Validation Loop
**Problem:** Native has no structured validation. Optional PO review.

**Ship-It solution:** Every phase artifact goes through:
```text
Present inline → 3 options: Approve / Adjust sections / Redo
→ If adjust: modify specific sections → re-present → re-validate
→ Loop until explicit user approval
→ Approval tracked in state.yaml
```

**Impact:** User explicitly approves every artifact before advancing.

---

### Category H: State & Memory

#### H1. State.yaml Persistence
**Problem:** Native has no state persistence. Progress lost between sessions.

**Ship-It solution:** Real-time state tracking with write rules:
```yaml
state_write_rules:
  - "stories.completed ONLY after DONE.md exists + @qa approval"
  - "deployed_to_production ONLY after smoke tests + health check"
  - "NEVER increment counters by declaration"
  - "On divergence: STOP, reconcile, correct"
```

**Impact:** Sessions can resume. Progress is verifiable.

---

#### H2. Shared Memory System
**Problem:** Native has no shared memory between phases.

**Ship-It solution:** 7 memory templates:
- `decisions.md` — architectural decisions
- `lessons-learned.md` — what worked/didn't
- `corrections.md` — fixes applied
- `gate-failures.md` — gates that failed and why
- `agent-handoffs.md` — handoff context
- `design-tokens.md` — design system tokens
- `component-inventory.md` — component registry

Plus hooks: PostToolUse (validate-artifacts, save-to-memory, auto-reshard), SessionStart (inject-date, load-lessons), Stop (capture-feedback).

**Impact:** Cross-phase knowledge accumulation. Lessons learned persist.

---

## Backport Priority Matrix

| Priority | Category | Items | Effort | Impact |
|----------|----------|-------|--------|--------|
| **P0 (Critical)** | Gate System | B1, B2, B3 | High | Enables all quality control |
| **P0 (Critical)** | Delivery Phase | F6 | High | Fills the most dangerous gap |
| **P1 (High)** | Architecture | A1, A2 | Medium | Unblocks agent efficiency |
| **P1 (High)** | Verification | D1, D2, D3 | Medium | Enables automation |
| **P1 (High)** | Framework 9 Passos | E1, E2, E3 | High | Consistent execution standard |
| **P2 (Medium)** | Fail-Staged | C1, C2 | Medium | Zero silent degradation |
| **P2 (Medium)** | Missing Phases | F1, F2, F3, F4, F5 | High | Feature completeness |
| **P2 (Medium)** | State & Memory | H1, H2 | Medium | Session persistence |
| **P3 (Low)** | Scope Modes | A3, A4 | Low | Flexibility |
| **P3 (Low)** | UX Patterns | G1, G2 | Low | Better interaction |

---

## Implementation Strategy

### Option 1: Full Backport (Recommended)
Replace `greenfield-fullstack.yaml` with sharded structure mirroring Ship-It.
- **Pros:** Parity with Ship-It. Single standard.
- **Cons:** Breaking change for existing consumers.
- **Effort:** 2-3 weeks

### Option 2: Incremental Adoption
Add gate system and Framework 9 Passos to existing monolith, then shard later.
- **Pros:** Non-breaking. Gradual improvement.
- **Cons:** Temporary inconsistency. Double maintenance.
- **Effort:** 1 week per priority level

### Option 3: Promote Ship-It to Core
Move `squads/ship-it/workflows/` to `.aios-core/development/workflows/greenfield-fullstack/` as the new standard.
- **Pros:** Zero duplication. Ship-It IS the greenfield v2.
- **Cons:** Ship-It has squad-specific references (alan, pedro-valerio) that need generalization.
- **Effort:** 1 week (mostly renaming/generalizing)

---

## Files Changed

### Source (Ship-It — reference)
```text
squads/ship-it/workflows/manifest.yaml
squads/ship-it/workflows/metadata.yaml
squads/ship-it/workflows/phase-0-bootstrap.yaml
squads/ship-it/workflows/phase-0b-brownfield-discovery.yaml
squads/ship-it/workflows/phase-1-brief.yaml
squads/ship-it/workflows/phase-2-research.yaml
squads/ship-it/workflows/phase-3-prd.yaml
squads/ship-it/workflows/phase-4-design.yaml
squads/ship-it/workflows/phase-4a-track-architecture.yaml
squads/ship-it/workflows/phase-4b-track-data.yaml
squads/ship-it/workflows/phase-4c-track-ux.yaml
squads/ship-it/workflows/phase-5-planning.yaml
squads/ship-it/workflows/phase-6-execution.yaml
squads/ship-it/workflows/phase-7-delivery.yaml
```

### Target (Greenfield Native — to be updated)
```text
.aios-core/development/workflows/greenfield-fullstack.yaml  (current — to be replaced/sharded)
```

---

*Analysis performed by @squad-chief on 2026-02-15*
*Ship-It v3.3 created by @pedro-valerio + @alan, audited 2026-02-11*
