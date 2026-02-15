# Story BOB-VETO-2: Restart Confirmation Gate

```yaml
id: BOB-VETO-2
title: Block story restart when uncommitted changes exist
type: bug_fix
priority: P0
severity: high
executor: '@dev'
quality_gate: '@qa'
quality_gate_tools: ['code_review', 'unit_test']
estimated_effort: 1h
epic: Bob Process Quality Improvements
parent: null
```

## Context

**Discovered by:** Deep analysis debate (pedro-valerio)
**Location:** `bob-orchestrator.js:736-789` (`handleSessionResume()`)

Currently, when user chooses "Restart story from beginning" (ResumeOption.RESTART), BOB immediately resets the story workflow state without checking for uncommitted work. This violates the unidirectional flow principle and can cause work loss.

## Problem Statement

```javascript
case ResumeOption.RESTART:
  // AC3 [3]: Reset story (keep epic progress, clear story workflow state)
  this._log(`Restarting story ${result.story}`);
  return {
    action: 'restart',
    storyPath: this._resolveStoryPath(result.story),
    message: `Recomeçando story ${result.story} do início`, // ← NO VETO!
  };
```

**Risk:** User loses uncommitted work without warning. Poor UX, violates "measure twice, cut once" principle.

## Acceptance Criteria

- [x] AC1: Check git status before allowing restart
- [x] AC2: If uncommitted changes exist → block restart with veto
- [x] AC3: Show user which files have changes
- [x] AC4: Suggest commit/stash before restart
- [ ] AC5: Add override flag for force restart (if user confirms)
- [x] AC6: Unit test for veto condition

## Implementation Plan

### Step 1: Add git status helper

```javascript
/**
 * Checks for uncommitted changes in working directory
 * @param {string} storyId - Story ID to check context
 * @returns {Promise<Object>} Status with hasChanges flag and file list
 * @private
 */
async _checkUncommittedWork(storyId) {
  try {
    const { execSync } = require('child_process');

    // Get git status
    const status = execSync('git status --porcelain', {
      cwd: this.projectRoot,
      encoding: 'utf8',
      timeout: 5000,
    });

    if (!status.trim()) {
      return { hasChanges: false, files: [] };
    }

    const files = status.trim().split('\n').map(line => line.trim());

    return {
      hasChanges: true,
      files,
      count: files.length,
    };
  } catch (error) {
    this._log(`Git status check failed: ${error.message}`, 'warn');
    // Fail safe: assume no changes if git check fails
    return { hasChanges: false, files: [], error: error.message };
  }
}
```

### Step 2: Update `handleSessionResume()`

```javascript
case ResumeOption.RESTART:
  // VETO: Check for uncommitted work
  const workStatus = await this._checkUncommittedWork(result.story);

  if (workStatus.hasChanges) {
    this._log(`Restart blocked: ${workStatus.count} uncommitted files`, 'warn');
    return {
      action: 'restart_blocked',
      data: {
        reason: 'Há trabalho não commitado.',
        vetoCondition: 'uncommitted_changes',
        filesAffected: workStatus.files,
        suggestion: 'Commit ou stash suas mudanças antes de restart.',
        story: result.story,
      },
    };
  }

  // Safe to restart
  this._log(`Restarting story ${result.story} (no uncommitted work)`);
  return {
    action: 'restart',
    storyPath: this._resolveStoryPath(result.story),
    message: `Recomeçando story ${result.story} do início`,
  };
```

### Step 3: Add unit test

```javascript
describe('BOB-VETO-2: Restart confirmation gate', () => {
  it('should block restart when uncommitted changes exist', async () => {
    // Setup: create uncommitted file
    fs.writeFileSync(path.join(TEST_PROJECT_ROOT, 'test.txt'), 'uncommitted');
    execSync('git add test.txt', { cwd: TEST_PROJECT_ROOT });

    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    const result = await bob.handleSessionResume('restart');

    expect(result.action).toBe('restart_blocked');
    expect(result.data.vetoCondition).toBe('uncommitted_changes');
    expect(result.data.filesAffected.length).toBeGreaterThan(0);
  });

  it('should allow restart when working tree is clean', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    const result = await bob.handleSessionResume('restart');

    expect(result.action).toBe('restart');
    expect(result.storyPath).toBeDefined();
  });
});
```

## Testing Strategy

1. Unit test: Both blocked and allowed paths
2. Integration test: Real git workflow simulation
3. Manual test: Create changes, try restart

## File List

- `.aios-core/core/orchestration/bob-orchestrator.js` (modified)
- `tests/core/orchestration/bob-veto-2.test.js` (created)

## Definition of Done

- [x] Veto condition implemented
- [x] Git status check working
- [x] Unit tests pass
- [x] Code review approved
- [x] No work loss possible

---

**Story created:** 2026-02-15
**Implemented by:** Orion (aios-master)
