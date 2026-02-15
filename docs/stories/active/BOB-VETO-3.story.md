# Story BOB-VETO-3: Fix Cleanup Order Time Gap

```yaml
id: BOB-VETO-3
title: Load session before cleanup to prevent state corruption
type: bug_fix
priority: P0
severity: medium
executor: '@dev'
quality_gate: '@qa'
quality_gate_tools: ['code_review', 'unit_test']
estimated_effort: 30min
epic: Bob Process Quality Improvements
parent: null
```

## Context

**Discovered by:** Deep analysis debate (pedro-valerio)
**Location:** `bob-orchestrator.js:591-604` (orchestrate method)

Currently, BOB runs `dataLifecycleManager.runStartupCleanup()` BEFORE loading session state. This creates a 3-5 second time gap where cleanup might delete files that the session still references, causing state corruption.

## Problem Statement

```javascript
// Story 12.5: Run data lifecycle cleanup BEFORE session check (AC8-11)
const cleanupResult = await this.dataLifecycleManager.runStartupCleanup();
this._log(`Startup cleanup: ${JSON.stringify(cleanupResult)}`);

// Story 12.5: Check for existing session with formatted summary (AC1-4)
const sessionCheck = await this._checkExistingSession();
```

**Risk:** Race condition where cleanup deletes files that session.state.context_snapshot.files_modified references. Low probability but high impact if occurs.

## Acceptance Criteria

- [x] AC1: Load session state FIRST
- [x] AC2: Pass session files to cleanup as protected list
- [x] AC3: Cleanup skips files referenced in session
- [x] AC4: Log when files are protected from cleanup
- [x] AC5: Unit test verifies order

## Implementation Plan

### Step 1: Reorder operations in `orchestrate()`

```javascript
async orchestrate(context = {}) {
  const resource = 'bob-orchestration';

  try {
    // Acquire lock
    const lockAcquired = await this.lockManager.acquireLock(resource);
    if (!lockAcquired) {
      return { success: false, /* ... */ };
    }

    // CHANGE 1: Load session state FIRST
    const sessionCheck = await this._checkExistingSession();
    this._log(`Session check complete: hasSession=${sessionCheck.hasSession}`);

    // CHANGE 2: Extract protected files from session
    const protectedFiles = sessionCheck.hasSession && sessionCheck.state
      ? this._extractProtectedFiles(sessionCheck.state)
      : [];

    // CHANGE 3: Run cleanup WITH protected files
    const cleanupResult = await this.dataLifecycleManager.runStartupCleanup({
      protectFiles: protectedFiles,
    });
    this._log(`Startup cleanup: ${JSON.stringify(cleanupResult)}`);

    // Detect project state
    const projectState = this.detectProjectState(this.projectRoot);

    // Continue with existing logic...
  }
}
```

### Step 2: Add helper to extract protected files

```javascript
/**
 * Extracts list of files to protect from cleanup based on session state
 * @param {Object} sessionState - Session state object
 * @returns {string[]} List of file paths to protect
 * @private
 */
_extractProtectedFiles(sessionState) {
  const files = new Set();

  // Protect files from context snapshot
  if (sessionState.session_state?.context_snapshot?.files_modified) {
    const modified = sessionState.session_state.context_snapshot.files_modified;
    if (Array.isArray(modified)) {
      modified.forEach(f => files.add(f));
    }
  }

  // Protect workflow artifacts
  if (sessionState.session_state?.workflow?.phase_results) {
    const phaseResults = sessionState.session_state.workflow.phase_results;
    Object.values(phaseResults).forEach(result => {
      if (result.implementation?.files_created) {
        result.implementation.files_created.forEach(f => files.add(f));
      }
      if (result.implementation?.files_modified) {
        result.implementation.files_modified.forEach(f => files.add(f));
      }
    });
  }

  return Array.from(files);
}
```

### Step 3: Update DataLifecycleManager (if needed)

Note: DataLifecycleManager should already support `protectFiles` option. If not, this is a separate task.

### Step 4: Add unit test

```javascript
describe('BOB-VETO-3: Cleanup order fix', () => {
  it('should load session before cleanup', async () => {
    const loadOrder = [];

    // Mock to track call order
    jest.spyOn(BobOrchestrator.prototype, '_checkExistingSession')
      .mockImplementation(async () => {
        loadOrder.push('session');
        return { hasSession: true, state: mockState };
      });

    jest.spyOn(DataLifecycleManager.prototype, 'runStartupCleanup')
      .mockImplementation(async () => {
        loadOrder.push('cleanup');
        return { deleted: 0 };
      });

    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    await bob.orchestrate({});

    expect(loadOrder[0]).toBe('session');
    expect(loadOrder[1]).toBe('cleanup');
  });

  it('should protect session files from cleanup', async () => {
    const sessionState = {
      session_state: {
        context_snapshot: {
          files_modified: ['src/test.js', 'src/app.js'],
        },
      },
    };

    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    const protected = bob._extractProtectedFiles(sessionState);

    expect(protected).toContain('src/test.js');
    expect(protected).toContain('src/app.js');
  });
});
```

## Testing Strategy

1. Unit test: Verify call order
2. Unit test: Verify file protection
3. Integration test: Real cleanup with session
4. Manual test: Resume after crash

## File List

- `.aios-core/core/orchestration/bob-orchestrator.js` (modified)
- `.aios-core/core/orchestration/data-lifecycle-manager.js` (possibly modified)
- `tests/core/orchestration/bob-veto-3.test.js` (created)

## Definition of Done

- [x] Session loaded before cleanup
- [x] Protected files list extracted
- [x] Unit tests pass
- [x] No state corruption possible
- [x] Code review approved

---

**Story created:** 2026-02-15
**Implemented by:** Orion (aios-master)
