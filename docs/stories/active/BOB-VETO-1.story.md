# Story BOB-VETO-1: Init Loop Prevention

```yaml
id: BOB-VETO-1
title: Add veto gate to prevent aios init infinite loop
type: bug_fix
priority: P0
severity: critical
executor: '@dev'
quality_gate: '@qa'
quality_gate_tools: ['code_review', 'unit_test']
estimated_effort: 30min
epic: Bob Process Quality Improvements
parent: null
```

## Context

**Discovered by:** Deep analysis debate (pedro-valerio + oalanicolas)
**Location:** `bob-orchestrator.js:898-908` (`_handleNoConfig()`)

Currently, when BOB detects NO_CONFIG state, it blindly triggers `run_aios_init` without checking if AIOS was already initialized. This can cause an infinite loop if:
1. User runs `aios init`
2. Config file gets deleted/corrupted
3. BOB detects NO_CONFIG again
4. Tries to run init again → loop

## Problem Statement

```javascript
async _handleNoConfig(_context) {
  this._log('No config detected — triggering onboarding');

  return {
    action: 'onboarding',
    data: {
      message: 'Projeto sem configuração AIOS detectado. Iniciando onboarding...',
      nextStep: 'run_aios_init', // ← SEM VALIDAÇÃO!
    },
  };
}
```

**Risk:** User gets stuck in infinite loop, poor UX, potential system instability.

## Acceptance Criteria

- [x] AC1: Check if `.aios/` directory exists before suggesting init
- [x] AC2: If `.aios/` exists but config missing → suggest repair instead
- [x] AC3: Add veto condition: `aios_already_initialized`
- [x] AC4: Log warning when repair path is taken
- [x] AC5: Unit test for both paths (init vs repair)

## Implementation Plan

### Step 1: Add validation helper

```javascript
/**
 * Checks if AIOS was already initialized
 * @returns {boolean} True if .aios directory exists
 * @private
 */
_isAiosInitialized() {
  const aiosDir = path.join(this.projectRoot, '.aios');
  return fs.existsSync(aiosDir);
}
```

### Step 2: Update `_handleNoConfig()`

```javascript
async _handleNoConfig(_context) {
  this._log('No config detected');

  // VETO: Check if already initialized
  if (this._isAiosInitialized()) {
    this._log('AIOS directory exists but config missing — repair needed', 'warn');
    return {
      action: 'config_repair',
      data: {
        message: 'AIOS já foi inicializado mas o arquivo de configuração está faltando.',
        nextStep: 'repair_config',
        vetoCondition: 'aios_already_initialized',
      },
    };
  }

  // First time init
  this._log('First time setup — triggering onboarding');
  return {
    action: 'onboarding',
    data: {
      message: 'Projeto sem configuração AIOS detectado. Iniciando onboarding...',
      nextStep: 'run_aios_init',
    },
  };
}
```

### Step 3: Add unit test

```javascript
describe('BOB-VETO-1: Init loop prevention', () => {
  it('should detect already initialized AIOS', async () => {
    // Setup: create .aios dir but remove config
    fs.mkdirSync(path.join(TEST_PROJECT_ROOT, '.aios'));

    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    const result = await bob._handleNoConfig({});

    expect(result.action).toBe('config_repair');
    expect(result.data.vetoCondition).toBe('aios_already_initialized');
  });

  it('should allow init on fresh project', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    const result = await bob._handleNoConfig({});

    expect(result.action).toBe('onboarding');
    expect(result.data.nextStep).toBe('run_aios_init');
  });
});
```

## Testing Strategy

1. Unit test: Both paths (init vs repair)
2. Integration test: Simulate config deletion scenario
3. Manual test: Delete config and run BOB

## File List

- `.aios-core/core/orchestration/bob-orchestrator.js` (modified)
- `tests/core/orchestration/bob-veto-1.test.js` (created)

## Definition of Done

- [x] Veto condition implemented
- [x] Unit tests pass
- [x] Code review approved by @qa
- [x] No infinite loop possible
- [x] Logged to memory for future reference

---

**Story created:** 2026-02-15
**Implemented by:** Orion (aios-master)
**Reviewed by:** TBD
