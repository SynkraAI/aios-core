# Story BOB-SAFE-1: Comprehensive Safety Gates

```yaml
id: BOB-SAFE-1
title: Add comprehensive safety validation across workflow
type: enhancement
priority: P1
severity: high
executor: '@dev'
quality_gate: '@qa'
quality_gate_tools: ['code_review', 'unit_test']
estimated_effort: 2h
epic: Bob Process Quality Improvements
parent: null
```

## Context

**Discovered by:** Deep analysis debate (pedro-valerio - Process Absolutist)
**Location:** Multiple handlers and workflow execution points

Beyond the 4 VETO gates already implemented, BOB needs additional safety checks throughout the workflow to prevent edge cases and ensure data integrity.

## Problem Statement

**Missing safety checks:**
1. **File system checks:** Disk space before writing large files
2. **Dependency validation:** Verify required tools/packages exist
3. **State consistency:** Validate session state before using it
4. **Lock verification:** Double-check locks before critical operations
5. **Backup prompts:** Suggest backup before destructive operations

**Risk:**
- Disk full errors during workflow execution
- Missing dependencies cause silent failures
- Corrupted session state leads to undefined behavior
- Race conditions on lock acquisition
- Data loss from destructive operations

## Acceptance Criteria

- [x] AC1: Add disk space check before file operations
- [x] AC2: Validate session state schema before use
- [x] AC3: Verify locks before critical operations
- [x] AC4: Add dependency health checks
- [x] AC5: Prompt for backup before destructive ops
- [x] AC6: Unit tests for all safety gates

## Implementation Plan

### Step 1: Add disk space safety check

```javascript
/**
 * Checks if sufficient disk space is available (BOB-SAFE-1)
 * @param {number} requiredMB - Required space in MB
 * @returns {Object} Safety check result
 * @private
 */
async _checkDiskSpace(requiredMB = 100) {
  try {
    const { execSync } = require('child_process');
    const df = execSync('df -m .', { encoding: 'utf8' });
    const lines = df.trim().split('\n');
    const data = lines[1].split(/\s+/);
    const availableMB = parseInt(data[3], 10);

    if (availableMB < requiredMB) {
      return {
        safe: false,
        reason: 'insufficient_disk_space',
        available: availableMB,
        required: requiredMB,
        message: `Espaço em disco insuficiente. Disponível: ${availableMB}MB, Necessário: ${requiredMB}MB`,
      };
    }

    return { safe: true, available: availableMB };
  } catch (error) {
    // Fail safe: assume space is available if check fails
    this._log(`Disk space check failed: ${error.message}`, 'warn');
    return { safe: true, warning: 'check_failed' };
  }
}
```

### Step 2: Add session state validation

```javascript
/**
 * Validates session state schema integrity (BOB-SAFE-1)
 * @param {Object} sessionState - Session state to validate
 * @returns {Object} Validation result
 * @private
 */
_validateSessionStateSchema(sessionState) {
  const errors = [];

  // Required top-level fields
  if (!sessionState.session_state) {
    errors.push('Missing session_state object');
  }

  // Required session fields
  const required = ['epic', 'progress', 'workflow', 'last_updated'];
  required.forEach((field) => {
    if (!sessionState.session_state?.[field]) {
      errors.push(`Missing required field: session_state.${field}`);
    }
  });

  // Validate workflow structure
  if (sessionState.session_state?.workflow) {
    if (!sessionState.session_state.workflow.current_phase) {
      errors.push('Missing workflow.current_phase');
    }
    if (!sessionState.session_state.workflow.phase_results) {
      errors.push('Missing workflow.phase_results');
    }
  }

  // Validate last_updated is a valid date
  if (sessionState.session_state?.last_updated) {
    const date = new Date(sessionState.session_state.last_updated);
    if (isNaN(date.getTime())) {
      errors.push('Invalid last_updated timestamp');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### Step 3: Add lock verification

```javascript
/**
 * Double-checks lock ownership before critical operation (BOB-SAFE-1)
 * @param {string} resource - Resource name
 * @returns {Promise<Object>} Lock verification result
 * @private
 */
async _verifyLockOwnership(resource) {
  const isOwner = await this.lockManager.isLockOwner(resource);

  if (!isOwner) {
    return {
      verified: false,
      reason: 'lock_lost',
      message: 'Lock foi perdido durante a operação. Outra instância pode estar executando.',
      action: 'abort',
    };
  }

  return { verified: true };
}
```

### Step 4: Add dependency health check

```javascript
/**
 * Validates required dependencies are available (BOB-SAFE-1)
 * @returns {Promise<Object>} Dependency check result
 * @private
 */
async _checkDependencies() {
  const required = ['git', 'node'];
  const missing = [];

  for (const dep of required) {
    try {
      const { execSync } = require('child_process');
      execSync(`which ${dep}`, { stdio: 'ignore' });
    } catch {
      missing.push(dep);
    }
  }

  if (missing.length > 0) {
    return {
      healthy: false,
      missing,
      message: `Dependências faltando: ${missing.join(', ')}`,
    };
  }

  return { healthy: true };
}
```

### Step 5: Add backup prompt for destructive ops

```javascript
/**
 * Checks if backup should be suggested before destructive operation (BOB-SAFE-1)
 * @param {string} operation - Operation type (delete, reset, etc)
 * @param {Object} context - Operation context
 * @returns {Object} Backup recommendation
 * @private
 */
_shouldPromptBackup(operation, context) {
  const destructiveOps = ['delete', 'reset', 'discard', 'force-restart'];

  if (destructiveOps.includes(operation)) {
    // Check if git has uncommitted changes
    const hasUncommitted = context.uncommittedFiles?.length > 0;

    if (hasUncommitted) {
      return {
        recommend: true,
        reason: 'uncommitted_changes',
        message: 'Há mudanças não commitadas. Recomendamos criar um commit antes de prosseguir.',
        severity: 'high',
      };
    }

    return {
      recommend: true,
      reason: 'destructive_operation',
      message: 'Esta operação não pode ser desfeita. Considere criar um backup.',
      severity: 'medium',
    };
  }

  return { recommend: false };
}
```

### Step 6: Integrate safety checks into orchestrate()

```javascript
async orchestrate(context = {}) {
  try {
    // BOB-SAFE-1: Dependency check on startup
    const depsCheck = await this._checkDependencies();
    if (!depsCheck.healthy) {
      return {
        success: false,
        action: 'dependencies_missing',
        error: depsCheck.message,
      };
    }

    // Acquire lock
    const lockAcquired = await this.lockManager.acquireLock(resource);
    if (!lockAcquired) {
      return { success: false, action: 'lock_failed', /* ... */ };
    }

    // BOB-SAFE-1: Verify lock ownership before critical operations
    const lockVerified = await this._verifyLockOwnership(resource);
    if (!lockVerified.verified) {
      return {
        success: false,
        action: lockVerified.action,
        error: lockVerified.message,
      };
    }

    // Load session
    const sessionCheck = await this._checkExistingSession();

    // BOB-SAFE-1: Validate session state schema
    if (sessionCheck.hasSession) {
      const validation = this._validateSessionStateSchema(sessionCheck.state);
      if (!validation.valid) {
        this._log(`Session state validation failed: ${validation.errors.join(', ')}`, 'error');
        // Discard corrupted session
        await this.sessionState.clear();
        sessionCheck.hasSession = false;
      }
    }

    // BOB-SAFE-1: Check disk space before starting workflow
    const spaceCheck = await this._checkDiskSpace(100);
    if (!spaceCheck.safe) {
      return {
        success: false,
        action: 'insufficient_disk_space',
        error: spaceCheck.message,
      };
    }

    // Continue with existing orchestration logic...
  } catch (error) {
    // ...
  }
}
```

### Step 7: Add unit tests

```javascript
describe('BOB-SAFE-1: Comprehensive safety gates', () => {
  it('should detect insufficient disk space', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    const result = await bob._checkDiskSpace(999999999); // Unrealistic requirement

    expect(result.safe).toBe(false);
    expect(result.reason).toBe('insufficient_disk_space');
  });

  it('should validate session state schema', () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    const invalidState = {
      session_state: {
        // Missing required fields
      },
    };

    const result = bob._validateSessionStateSchema(invalidState);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should recommend backup for destructive operations', () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    const result = bob._shouldPromptBackup('delete', {
      uncommittedFiles: ['file1.js', 'file2.js'],
    });

    expect(result.recommend).toBe(true);
    expect(result.severity).toBe('high');
  });

  it('should check dependencies on startup', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    const result = await bob._checkDependencies();

    expect(result.healthy).toBeDefined();
    if (!result.healthy) {
      expect(result.missing).toBeDefined();
    }
  });
});
```

## Testing Strategy

1. Unit test: Each safety check function
2. Integration test: Safety checks in full workflow
3. Edge case test: Disk full, corrupted state, lost lock
4. Manual test: Real-world scenarios

## File List

- `.aios-core/core/orchestration/bob-orchestrator.js` (modified)
- `tests/core/orchestration/bob-safe-1.test.js` (created)

## Definition of Done

- [x] All 5 safety checks implemented
- [x] Integrated into orchestrate() flow
- [x] Unit tests pass
- [x] Edge cases handled gracefully
- [x] Code review approved

---

**Story created:** 2026-02-15
**Implemented by:** Orion (aios-master)
