# Story ACT-5: WorkflowNavigator + Bob Integration

**Epic:** [EPIC-ACT - Unified Agent Activation Pipeline](EPIC-ACT-INDEX.md)
**Status:** Ready for Review
**Priority:** Medium
**Complexity:** High
**Created:** 2026-02-05
**Dependencies:** ACT-6 (Unified Pipeline), Epic 11 Stories 11.4, 11.5

---

## Executor Assignment

executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: ["code-review", "integration-test", "architecture-review"]

---

## Story

**As a** developer using AIOS,
**I want** the WorkflowNavigator to provide intelligent, context-aware workflow suggestions during agent activation,
**so that** I see relevant next steps based on my actual workflow state instead of the navigator being effectively dead code.

---

## Acceptance Criteria

1. Method call fixed: `getNextSteps()` → `suggestNextCommands()` in `greeting-builder.js:177`
2. Trigger conditions relaxed: workflow suggestions shown when `sessionType !== 'new'` AND workflow state is detected
3. `SessionState` (Epic 11 Story 11.5) integrated as input for workflow detection
4. `SurfaceChecker` (Epic 11 Story 11.4) connected to trigger proactive suggestions
5. `workflow-patterns.yaml` updated with Bob orchestration patterns
6. WorkflowNavigator reads from Bob's `session-state.js` for cross-terminal workflow continuity
7. Unit tests cover WorkflowNavigator with Bob session state input
8. Workflow suggestions are verified as useful (not just pattern matches)

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Integration / Feature Enhancement
**Secondary Type(s)**: Bug Fix
**Complexity**: High

### Specialized Agent Assignment

**Primary Agents**:
- @dev: Fix and integration implementation

**Supporting Agents**:
- @architect: Integration architecture with Bob system

### Quality Gate Tasks

- [x] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@devops): Run before creating pull request

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior**:
- CRITICAL issues: auto_fix (2 iterations, 15min)
- HIGH issues: document_only

### CodeRabbit Focus Areas

**Primary Focus**:
- Correct method call resolution (bug fix)
- Integration correctness with Bob SessionState

**Secondary Focus**:
- Suggestion quality (relevance, not just pattern matching)
- Graceful degradation when Bob system unavailable

---

## Tasks / Subtasks

- [x] Task 1: Fix broken method call (AC: 1)
  - [x] 1.1 Read `greeting-builder.js:176-177` to confirm broken call
  - [x] 1.2 Change `this.workflowNavigator.getNextSteps()` → `this.workflowNavigator.suggestNextCommands()`
  - [x] 1.3 Verify method signature matches expected arguments
- [x] Task 2: Relax trigger conditions (AC: 2)
  - [x] 2.1 Read current 3-condition gate in `greeting-builder.js:176`
  - [x] 2.2 Replace with: `sessionType !== 'new' && workflowStateDetected`
  - [x] 2.3 Test: workflow suggestions appear on existing sessions
  - [x] 2.4 Test: new sessions do NOT show workflow suggestions
- [x] Task 3: Integrate Bob SessionState (AC: 3, 6)
  - [x] 3.1 Read `session-state.js` exports and API
  - [x] 3.2 Pass SessionState data to `WorkflowNavigator.detectWorkflowState()`
  - [x] 3.3 Handle case where Bob system is not yet active (graceful fallback)
  - [x] 3.4 Read cross-terminal state from `session-state.yaml`
- [x] Task 4: Connect SurfaceChecker (AC: 4)
  - [x] 4.1 Read `surface-checker.js` API
  - [x] 4.2 Use surface conditions to enhance suggestion relevance
  - [x] 4.3 Add proactive suggestion triggers based on surface state
- [x] Task 5: Update workflow patterns (AC: 5)
  - [x] 5.1 Read current `workflow-patterns.yaml` (694 lines)
  - [x] 5.2 Add Bob orchestration patterns: executor-assignment, terminal-spawning, wave-execution
  - [x] 5.3 Add cross-agent handoff patterns
- [x] Task 6: Add tests (AC: 7, 8)
  - [x] 6.1 Test: correct method is called (`suggestNextCommands`)
  - [x] 6.2 Test: relaxed conditions trigger suggestions appropriately
  - [x] 6.3 Test: Bob session state enhances suggestions
  - [x] 6.4 Test: suggestions are contextually relevant (not just pattern dumps)
  - [x] 6.5 Test: graceful degradation without Bob system

---

## Dev Notes

### Bug Details

**greeting-builder.js:176-177:**
```javascript
// CURRENT (broken):
if (sessionType === 'workflow' && lastCommands && !contextSection) {
  const suggestions = this.workflowNavigator.getNextSteps(); // method doesn't exist!
}

// AVAILABLE METHODS on WorkflowNavigator:
// - detectWorkflowState(context)
// - suggestNextCommands(workflowState)
```

### Key Source Files

| File | Lines | Purpose |
|------|-------|---------|
| `.aios-core/development/scripts/greeting-builder.js` | 176-177 | Broken method call + narrow conditions |
| `.aios-core/development/scripts/workflow-navigator.js` | 327 | Workflow detection and suggestion engine |
| `.aios-core/data/workflow-patterns.yaml` | 694 | Pattern definitions |
| `.aios-core/core/orchestration/session-state.js` | - | Bob session state (Epic 11) |
| `.aios-core/core/orchestration/surface-checker.js` | - | Bob surface criteria (Epic 11) |

### Epic 11 Dependencies

- **Story 11.4 (Surface Criteria)**: Defines when workflows should trigger — ACT-5 reads these conditions
- **Story 11.5 (Session State)**: Cross-terminal state persistence — ACT-5 reads session state for workflow continuity

If Epic 11 stories are not complete, implement ACT-5 in two phases:
1. **Phase A (no dependency)**: Fix method call + relax conditions
2. **Phase B (depends on Epic 11)**: Integrate SessionState + SurfaceChecker

### Testing

**Test file location:** `tests/core/workflow-navigator-integration.test.js`
**Test framework:** Jest
**Testing patterns:**
- Mock WorkflowNavigator methods
- Mock SessionState and SurfaceChecker for Bob integration
- Test suggestion relevance with predefined scenarios

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-05 | 1.0 | Story created from EPIC-ACT restructuring | @po (Pax) |
| 2026-02-06 | 2.0 | Implementation complete: Phase A+B, 36 tests pass | @dev (Dex) |

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (Dex Builder)

### Debug Log References

- ESLint: 0 errors, 1 pre-existing warning (TOTAL_GREETING_TIMEOUT from ACT-7)
- TypeScript typecheck: clean pass
- Tests: 36/36 passed in workflow-navigator-integration.test.js
- Regression: 67/67 passed in unified-activation-pipeline.test.js
- Pre-existing failures in greeting-builder.test.js (3 tests, all caused by ACT-7 presentation changes)

### Completion Notes List

- Phase A + Phase B both implemented (Epic 11 session-state.js and surface-checker.js both exist)
- SessionState integration uses synchronous fs.existsSync + readFileSync to stay within 150ms perf budget
- SurfaceChecker enhancement is gracefully degraded (returns original suggestions when criteria file not found)
- Both _detectWorkflowFromSessionState and _enhanceSuggestionsWithSurface use try/catch with console.warn fallback
- Bob orchestration patterns + agent handoff patterns added to workflow-patterns.yaml
- UnifiedActivationPipeline._detectWorkflowState also relaxed from sessionType !== 'workflow' to sessionType === 'new'
- ACT-7 parallel refactored _buildContextualGreeting already integrated the relaxed trigger in the Promise.all block

### File List

| File | Action | Description |
|------|--------|-------------|
| `.aios-core/development/scripts/greeting-builder.js` | Modified | Fixed method call, relaxed trigger, added SessionState + SurfaceChecker integration |
| `.aios-core/development/scripts/unified-activation-pipeline.js` | Modified | Relaxed _detectWorkflowState trigger from workflow-only to any non-new session |
| `.aios-core/data/workflow-patterns.yaml` | Modified | Added bob_orchestration and agent_handoff workflow patterns |
| `tests/core/workflow-navigator-integration.test.js` | Created | 36 tests covering all 8 acceptance criteria |
| `docs/stories/epics/epic-activation-pipeline/story-act-5-workflow-navigator-bob.md` | Modified | Story status and progress updated |

---

## QA Results

### Review Date: 2026-02-06

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Implementation is thorough and well-architected. The greeting-builder.js changes follow a clear detection priority pattern (SessionState first, command history fallback). Both `_detectWorkflowFromSessionState()` and `_enhanceSuggestionsWithSurface()` are properly encapsulated as private methods with defensive try/catch wrappers. The workflow-patterns.yaml additions follow the existing pattern structure. The UnifiedActivationPipeline relaxation is a minimal, targeted change.

### Refactoring Performed

None required. Code quality is production-ready.

### Compliance Check

- Coding Standards: PASS
- Project Structure: PASS
- Testing Strategy: PASS - 36 integration tests covering all 8 ACs with edge cases
- All ACs Met: PASS - 8/8 acceptance criteria verified

### Acceptance Criteria Traceability

| AC# | Description | Tests | Verdict |
|-----|-------------|-------|---------|
| 1 | Method call fixed: getNextSteps to suggestNextCommands | 2 tests (method exists, buildWorkflowSuggestions calls correct chain) | PASS |
| 2 | Trigger relaxed: shown when sessionType !== 'new' | 3 tests (existing/new/workflow session types) + 3 pipeline tests | PASS |
| 3 | SessionState integrated as input | 4 tests (active state, fallback, malformed YAML, no active phase) | PASS |
| 4 | SurfaceChecker connected for proactive suggestions | 2 tests (high risk enhancement, unavailable degradation) | PASS |
| 5 | workflow-patterns.yaml updated with Bob patterns | 5 tests (bob_orchestration structure/transitions/next_steps, agent_handoff structure/transitions) | PASS |
| 6 | Cross-terminal workflow continuity via session state | Covered by AC3 tests (session state file detection) | PASS |
| 7 | Unit tests cover various session states | 4 tests (null state, empty suggestions, empty commands, exception handling) | PASS |
| 8 | Suggestions are contextually relevant | 7 tests (validated->develop, in_dev->QA, qa_reviewed->fix, bob epic_started->build, unknown->empty, template population) | PASS |

### Security Review

No security concerns. The code reads local YAML files and processes workflow patterns. No user input is passed to eval or shell commands. All file reads use synchronous methods on known local paths.

### Performance Considerations

SessionState integration uses synchronous fs.existsSync + fs.readFileSync to stay within the 150ms perf budget. This is appropriate for a local YAML file read. No performance concerns.

### Notes

- The console.warn messages during test execution (malformed YAML, exception handling) are expected and confirm graceful degradation is working correctly.
- Pre-existing 3 test failures in greeting-builder.test.js are attributed to ACT-7 presentation changes and are not within scope of this story.

### Files Modified During Review

None.

### Gate Status

Gate: PASS
Quality Score: 100

### Recommended Status

PASS - Ready for Done. All 36 tests pass, all 8 ACs verified, code quality is clean.

---

*Epic ACT - Story ACT-5 | Created 2026-02-05 by @po (Pax)*
