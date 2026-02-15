# Story BOB-VETO-4: Throw Exception on Unknown State

```yaml
id: BOB-VETO-4
title: Fail-fast on unknown project state
type: bug_fix
priority: P0
severity: medium
executor: '@dev'
quality_gate: '@qa'
quality_gate_tools: ['code_review', 'unit_test']
estimated_effort: 15min
epic: Bob Process Quality Improvements
parent: null
```

## Context

**Discovered by:** Deep analysis debate (pedro-valerio)
**Location:** `bob-orchestrator.js:870-889` (`_routeByState()`)

Currently, when `_routeByState()` encounters an unknown project state, it returns an error object but doesn't throw an exception. This allows execution to continue with invalid state, leading to unpredictable behavior.

## Problem Statement

```javascript
async _routeByState(projectState, context) {
  switch (projectState) {
    case ProjectState.NO_CONFIG:
      return this._handleNoConfig(context);
    // ... other cases ...
    default:
      return {
        action: 'unknown_state', // ← Returns error but doesn't throw!
        error: `Unknown project state: ${projectState}`,
      };
  }
}
```

**Risk:** Execution continues with invalid state → unpredictable behavior, hard-to-debug issues.

## Acceptance Criteria

- [x] AC1: Throw exception on unknown project state
- [x] AC2: Include valid states in error message
- [x] AC3: Mark as FATAL error
- [x] AC4: Log error before throwing
- [x] AC5: Unit test catches exception

## Implementation Plan

### Step 1: Update default case

```javascript
async _routeByState(projectState, context) {
  switch (projectState) {
    case ProjectState.NO_CONFIG:
      return this._handleNoConfig(context);

    case ProjectState.EXISTING_NO_DOCS:
      return this._handleBrownfield(context);

    case ProjectState.EXISTING_WITH_DOCS:
      return this._handleExistingProject(context);

    case ProjectState.GREENFIELD:
      return this._handleGreenfield(context);

    default:
      // VETO: Fail-fast on unknown state
      const validStates = Object.values(ProjectState).join(', ');
      const errorMsg =
        `FATAL: Unknown project state '${projectState}'. ` +
        `Valid states: ${validStates}`;

      this._log(errorMsg, 'error');

      throw new Error(errorMsg);
  }
}
```

### Step 2: Update caller to handle exception

Ensure `orchestrate()` catches and handles this properly:

```javascript
async orchestrate(context = {}) {
  try {
    // ...
    const result = await this._routeByState(projectState, context);
    // ...
  } catch (error) {
    this._log(`Orchestration failed: ${error.message}`, 'error');

    // Story 12.6: Stop observability panel on error
    this.observabilityPanel.stop();
    await this.bobStatusWriter.complete().catch(() => {});
    await this.lockManager.releaseLock(resource).catch(() => {});

    return {
      success: false,
      projectState: null,
      action: 'error',
      error: `Orchestration failed: ${error.message}`,
    };
  }
}
```

### Step 3: Add unit test

```javascript
describe('BOB-VETO-4: Throw on unknown state', () => {
  it('should throw exception on invalid project state', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    await expect(
      bob._routeByState('INVALID_STATE', {})
    ).rejects.toThrow('FATAL: Unknown project state');

    await expect(
      bob._routeByState('INVALID_STATE', {})
    ).rejects.toThrow('Valid states:');
  });

  it('should include valid states in error message', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    try {
      await bob._routeByState('INVALID', {});
    } catch (error) {
      expect(error.message).toContain('NO_CONFIG');
      expect(error.message).toContain('GREENFIELD');
      expect(error.message).toContain('EXISTING_NO_DOCS');
      expect(error.message).toContain('EXISTING_WITH_DOCS');
    }
  });
});
```

## Testing Strategy

1. Unit test: Exception is thrown
2. Unit test: Error message format
3. Integration test: Orchestrate catches exception
4. Manual test: Force invalid state

## File List

- `.aios-core/core/orchestration/bob-orchestrator.js` (modified)
- `tests/core/orchestration/bob-veto-4.test.js` (created)

## Definition of Done

- [x] Exception thrown on unknown state
- [x] Valid states included in error
- [x] Unit tests pass
- [x] Fail-fast behavior verified
- [x] Code review approved

---

**Story created:** 2026-02-15
**Implemented by:** Orion (aios-master)
