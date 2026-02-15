/**
 * BOB-VETO-4: Throw Exception on Unknown State Tests
 *
 * Validates that BOB throws exception (fail-fast) on unknown project state,
 * preventing unpredictable behavior from continuing with invalid state.
 */

const path = require('path');
const fs = require('fs');
const { BobOrchestrator } = require('../../../.aios-core/core/orchestration/bob-orchestrator');

const TEST_PROJECT_ROOT = path.join(__dirname, '../../fixtures/test-project-veto-4');

describe('BOB-VETO-4: Throw on unknown state', () => {
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
      // Should not reach here
      fail('Expected exception to be thrown');
    } catch (error) {
      expect(error.message).toContain('NO_CONFIG');
      expect(error.message).toContain('GREENFIELD');
      expect(error.message).toContain('EXISTING_NO_DOCS');
      expect(error.message).toContain('EXISTING_WITH_DOCS');
    }
  });

  it('should include the invalid state name in error message', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
    const invalidState = 'TOTALLY_INVALID_STATE';

    await expect(
      bob._routeByState(invalidState, {})
    ).rejects.toThrow(invalidState);
  });

  it('should mark error as FATAL', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    await expect(
      bob._routeByState('BAD_STATE', {})
    ).rejects.toThrow(/^FATAL:/);
  });

  it('should NOT throw for valid project states', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    // Mock handlers to prevent actual execution
    bob._handleNoConfig = jest.fn().mockResolvedValue({ action: 'onboarding' });
    bob._handleBrownfield = jest.fn().mockResolvedValue({ action: 'brownfield' });
    bob._handleExistingProject = jest.fn().mockResolvedValue({ action: 'existing' });
    bob._handleGreenfield = jest.fn().mockResolvedValue({ action: 'greenfield' });

    // All valid states should NOT throw
    await expect(bob._routeByState('NO_CONFIG', {})).resolves.toBeDefined();
    await expect(bob._routeByState('EXISTING_NO_DOCS', {})).resolves.toBeDefined();
    await expect(bob._routeByState('EXISTING_WITH_DOCS', {})).resolves.toBeDefined();
    await expect(bob._routeByState('GREENFIELD', {})).resolves.toBeDefined();
  });

  it('should fail-fast (throw immediately, not return error object)', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    let threwException = false;
    let returnedObject = null;

    try {
      returnedObject = await bob._routeByState('INVALID', {});
    } catch (error) {
      threwException = true;
      expect(error).toBeInstanceOf(Error);
    }

    expect(threwException).toBe(true);
    expect(returnedObject).toBeNull();
  });

  it('should be catchable by orchestrate() try-catch', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    // Mock detectProjectState to return invalid state
    bob.detectProjectState = jest.fn().mockReturnValue('INVALID_STATE_FROM_DETECTOR');

    // Mock other dependencies to prevent actual execution
    bob.lockManager = {
      acquireLock: jest.fn().mockResolvedValue(true),
      releaseLock: jest.fn().mockResolvedValue(true),
    };
    bob.observabilityPanel = {
      start: jest.fn(),
      stop: jest.fn(),
      setMode: jest.fn(),
    };
    bob.bobStatusWriter = {
      initialize: jest.fn().mockResolvedValue(true),
      complete: jest.fn().mockResolvedValue(true),
    };
    bob.dataLifecycleManager = {
      runStartupCleanup: jest.fn().mockResolvedValue({ deleted: 0 }),
    };
    bob._checkExistingSession = jest.fn().mockResolvedValue({ hasSession: false });
    bob.surfaceChecker = {
      shouldSurface: jest.fn().mockReturnValue({ should_surface: false }),
    };

    const result = await bob.orchestrate({});

    // Should return error object, not throw
    expect(result.success).toBe(false);
    expect(result.action).toBe('error');
    expect(result.error).toContain('Orchestration failed');
    expect(result.error).toContain('FATAL');
  });
});
