/**
 * BOB-VETO-1: Init Loop Prevention Tests
 *
 * Validates that BOB prevents infinite loop by checking if AIOS was already initialized
 * before suggesting 'run_aios_init' action.
 */

const path = require('path');
const fs = require('fs');
const { BobOrchestrator } = require('../../../.aios-core/core/orchestration/bob-orchestrator');

const TEST_PROJECT_ROOT = path.join(__dirname, '../../fixtures/test-project-veto-1');

describe('BOB-VETO-1: Init loop prevention', () => {
  beforeEach(() => {
    // Clean up test project
    if (fs.existsSync(TEST_PROJECT_ROOT)) {
      fs.rmSync(TEST_PROJECT_ROOT, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_PROJECT_ROOT, { recursive: true });
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(TEST_PROJECT_ROOT)) {
      fs.rmSync(TEST_PROJECT_ROOT, { recursive: true, force: true });
    }
  });

  it('should detect already initialized AIOS and suggest repair', async () => {
    // Setup: create .aios dir but no config file
    const aiosDir = path.join(TEST_PROJECT_ROOT, '.aios');
    fs.mkdirSync(aiosDir, { recursive: true });

    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    const result = await bob._handleNoConfig({});

    expect(result.action).toBe('config_repair');
    expect(result.data.vetoCondition).toBe('aios_already_initialized');
    expect(result.data.nextStep).toBe('repair_config');
    expect(result.data.message).toContain('já foi inicializado');
  });

  it('should allow init on fresh project (no .aios directory)', async () => {
    // No .aios directory exists
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    const result = await bob._handleNoConfig({});

    expect(result.action).toBe('onboarding');
    expect(result.data.nextStep).toBe('run_aios_init');
    expect(result.data.message).toContain('Iniciando onboarding');
  });

  it('should correctly identify initialized state with _isAiosInitialized()', () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    // Before creating .aios
    expect(bob._isAiosInitialized()).toBe(false);

    // After creating .aios
    const aiosDir = path.join(TEST_PROJECT_ROOT, '.aios');
    fs.mkdirSync(aiosDir, { recursive: true });
    expect(bob._isAiosInitialized()).toBe(true);
  });

  it('should prevent infinite loop scenario', async () => {
    // Simulate: user runs init → config gets deleted → BOB should NOT suggest init again
    const aiosDir = path.join(TEST_PROJECT_ROOT, '.aios');
    fs.mkdirSync(aiosDir, { recursive: true });

    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    const result = await bob._handleNoConfig({});

    // Should suggest repair, NOT init
    expect(result.action).not.toBe('onboarding');
    expect(result.data.nextStep).not.toBe('run_aios_init');
    expect(result.action).toBe('config_repair');
  });
});
