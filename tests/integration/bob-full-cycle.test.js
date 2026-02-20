/**
 * Bob Full Cycle Integration Tests
 *
 * Story BOB-COV-7: Integration E2E Tests
 * Tests complete workflows with all modules integrated
 *
 * @module tests/integration/bob-full-cycle
 */

'use strict';

const { BobOrchestrator } = require('../../.aios-core/core/orchestration/bob-orchestrator');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

/**
 * Helper: Creates a BobOrchestrator with all heavy services mocked out.
 * The orchestrator is created normally (testing constructor integration),
 * then internal services are replaced with lightweight mocks to isolate
 * the routing/session logic under test.
 */
function mockOrchestratorServices(orchestrator) {
  // Mock lock manager
  orchestrator.lockManager = {
    acquireLock: jest.fn().mockResolvedValue(true),
    releaseLock: jest.fn().mockResolvedValue(true),
  };

  // Mock observability panel (no-op)
  orchestrator.observabilityPanel = {
    start: jest.fn(),
    stop: jest.fn(),
    setMode: jest.fn(),
  };

  // Mock bob status writer (no file I/O)
  orchestrator.bobStatusWriter = {
    initialize: jest.fn().mockResolvedValue(undefined),
    complete: jest.fn().mockResolvedValue(undefined),
  };

  // Mock dashboard emitter
  orchestrator.dashboardEmitter = {
    emitBobPhaseChange: jest.fn(),
    emitBobAgentSpawned: jest.fn(),
  };

  // Mock data lifecycle manager
  orchestrator.dataLifecycleManager = {
    runStartupCleanup: jest.fn().mockResolvedValue({ cleaned: 0 }),
  };

  // Mock dependency check (always healthy)
  orchestrator._checkDependencies = jest.fn().mockResolvedValue({ healthy: true });

  // Mock disk space check (always safe)
  orchestrator._checkDiskSpace = jest.fn().mockResolvedValue({ safe: true, available: 5000 });

  // Mock orphan cleanup (no-op)
  orchestrator._cleanupOrphanMonitors = jest.fn();

  return orchestrator;
}

describe('Bob Full Cycle - Integration Tests (FASE 7)', () => {
  let tempDir;
  let orchestrator;

  beforeEach(async () => {
    // Create temporary directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-e2e-'));
  });

  afterEach(async () => {
    // Cleanup orchestrator resources
    if (orchestrator) {
      if (orchestrator.observabilityPanel?.stop) {
        orchestrator.observabilityPanel.stop();
      }
      if (orchestrator.bobStatusWriter?.complete) {
        await orchestrator.bobStatusWriter.complete().catch(() => {});
      }
      if (orchestrator.lockManager?.releaseLock) {
        await orchestrator.lockManager.releaseLock('bob-orchestration').catch(() => {});
      }
    }

    // Remove temp directory
    await fs.remove(tempDir);
    await new Promise(resolve => setImmediate(resolve));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // FASE 7 - AC1: Greenfield state detection
  describe('Greenfield Workflow', () => {
    it('should detect GREENFIELD state for empty project', async () => {
      // Given - Empty project (no package.json, .git, docs)
      orchestrator = new BobOrchestrator(tempDir, {
        debug: false,
        observability: false,
      });

      // When
      const state = await orchestrator.detectProjectState();

      // Then
      expect(state).toBe('GREENFIELD');
    });

    // AC3: Greenfield routing through orchestrate()
    it('should route to greenfield handler for GREENFIELD state', async () => {
      // Given - Empty project (greenfield)
      orchestrator = new BobOrchestrator(tempDir, {
        debug: false,
        observability: false,
      });
      mockOrchestratorServices(orchestrator);

      // Mock session state — no existing session
      orchestrator.sessionState = {
        exists: jest.fn().mockResolvedValue(false),
        loadSessionState: jest.fn().mockResolvedValue(null),
        detectCrash: jest.fn().mockResolvedValue({ isCrash: false }),
        getResumeOptions: jest.fn().mockReturnValue([]),
        getResumeSummary: jest.fn().mockReturnValue(''),
        getSessionOverride: jest.fn().mockReturnValue(null),
        clear: jest.fn().mockResolvedValue(undefined),
      };

      // Mock greenfield handler to capture the call
      const greenfieldResult = {
        action: 'greenfield_surface',
        data: { phase: 1, decision: 'GO' },
      };
      orchestrator.greenfieldHandler = {
        handle: jest.fn().mockResolvedValue(greenfieldResult),
      };

      // When
      const result = await orchestrator.orchestrate({ userGoal: 'build an app' });

      // Then
      expect(result.success).toBe(true);
      expect(result.projectState).toBe('GREENFIELD');
      expect(result.action).toBe('greenfield_surface');
      expect(orchestrator.greenfieldHandler.handle).toHaveBeenCalled();
    });
  });

  // FASE 7 - AC2: Brownfield state detection and routing
  describe('Brownfield Workflow', () => {
    beforeEach(async () => {
      // Setup brownfield project (code exists, no AIOS docs)
      await fs.writeFile(path.join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));
      await fs.mkdirp(path.join(tempDir, 'src'));
      await fs.writeFile(path.join(tempDir, 'src/index.js'), 'console.log("Hello");');
    });

    it('should detect EXISTING_NO_DOCS state for brownfield project', async () => {
      // Given - Project with code but no AIOS docs
      // Create minimal config to avoid NO_CONFIG
      const configPath = path.join(tempDir, '.aios-core', 'core-config.yaml');
      await fs.mkdirp(path.dirname(configPath));
      await fs.writeFile(configPath, 'project:\n  name: test');

      orchestrator = new BobOrchestrator(tempDir, {
        debug: false,
        observability: false,
      });

      // When
      const state = await orchestrator.detectProjectState();

      // Then
      expect(state).toBe('EXISTING_NO_DOCS');
    });

    // AC3: Brownfield routing through orchestrate()
    it('should route to brownfield handler for EXISTING_NO_DOCS state', async () => {
      // Given - Brownfield project with config
      const configPath = path.join(tempDir, '.aios-core', 'core-config.yaml');
      await fs.mkdirp(path.dirname(configPath));
      await fs.writeFile(configPath, 'project:\n  name: test');

      orchestrator = new BobOrchestrator(tempDir, {
        debug: false,
        observability: false,
      });
      mockOrchestratorServices(orchestrator);

      // Mock session state — no existing session
      orchestrator.sessionState = {
        exists: jest.fn().mockResolvedValue(false),
        loadSessionState: jest.fn().mockResolvedValue(null),
        detectCrash: jest.fn().mockResolvedValue({ isCrash: false }),
        getResumeOptions: jest.fn().mockReturnValue([]),
        getResumeSummary: jest.fn().mockReturnValue(''),
        getSessionOverride: jest.fn().mockReturnValue(null),
        clear: jest.fn().mockResolvedValue(undefined),
      };

      // Mock brownfield handler to capture the call
      const brownfieldResult = {
        action: 'brownfield_welcome',
        data: { decision: 'ACCEPTED' },
      };
      orchestrator.brownfieldHandler = {
        handle: jest.fn().mockResolvedValue(brownfieldResult),
      };

      // When
      const result = await orchestrator.orchestrate({ userGoal: 'enhance app' });

      // Then
      expect(result.success).toBe(true);
      expect(result.projectState).toBe('EXISTING_NO_DOCS');
      expect(result.action).toBe('brownfield_welcome');
      expect(orchestrator.brownfieldHandler.handle).toHaveBeenCalled();
    });
  });

  // FASE 7 - AC4: Session resume after crash
  describe('Session Resume After Crash', () => {
    it('should detect crashed session via _checkExistingSession', async () => {
      // Given - Orchestrator with mocked sessionState that reports crash
      orchestrator = new BobOrchestrator(tempDir, {
        debug: false,
        observability: false,
      });

      const oldTimestamp = new Date(Date.now() - 40 * 60 * 1000).toISOString();
      const mockState = {
        session_state: {
          last_updated: oldTimestamp,
          epic: { id: 'TEST-1', title: 'Test Epic', total_stories: 3 },
          progress: { current_story: '1.1', stories_done: [], stories_pending: ['1.1', '1.2'] },
          workflow: { current_phase: 'development' },
        },
      };

      orchestrator.sessionState = {
        exists: jest.fn().mockResolvedValue(true),
        loadSessionState: jest.fn().mockResolvedValue(mockState),
        detectCrash: jest.fn().mockResolvedValue({
          isCrash: true,
          minutesSinceUpdate: 40,
        }),
        getResumeSummary: jest.fn().mockReturnValue('Epic: Test Epic, Story: 1.1, Phase: development'),
      };

      // When
      const session = await orchestrator._checkExistingSession();

      // Then
      expect(session.hasSession).toBe(true);
      expect(session.crashInfo.isCrash).toBe(true);
      expect(session.crashInfo.minutesSinceUpdate).toBe(40);
      expect(session.formattedMessage).toContain('crashado');
      expect(session.epicTitle).toBe('Test Epic');
    });
  });

  // FASE 7 - AC5: Session PAUSE/CONTINUE/RESTART/DISCARD
  describe('Session Management', () => {
    beforeEach(async () => {
      orchestrator = new BobOrchestrator(tempDir, {
        debug: false,
        observability: false,
      });
    });

    it('should handle CONTINUE option', async () => {
      // Given - SessionState returns continue action
      orchestrator.sessionState = {
        handleResumeOption: jest.fn().mockResolvedValue({
          action: 'continue',
          story: '1.1',
          phase: 'development',
        }),
      };

      // When
      const result = await orchestrator.handleSessionResume('continue');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('continue');
      expect(result.phase).toBe('development');
      expect(result.message).toContain('1.1');
      expect(orchestrator.sessionState.handleResumeOption).toHaveBeenCalledWith('continue');
    });

    it('should handle PAUSE option (review)', async () => {
      // Given - SessionState returns review action
      orchestrator.sessionState = {
        handleResumeOption: jest.fn().mockResolvedValue({
          action: 'review',
          summary: { epic: { title: 'Test Epic' } },
        }),
      };

      // When
      const result = await orchestrator.handleSessionResume('review');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('review');
      expect(result.needsReprompt).toBe(true);
      expect(result.summary).toBeDefined();
    });

    it('should handle RESTART option (no uncommitted work)', async () => {
      // Given - SessionState returns restart, no uncommitted work
      orchestrator.sessionState = {
        handleResumeOption: jest.fn().mockResolvedValue({
          action: 'restart',
          story: '1.1',
        }),
      };

      // Mock _checkUncommittedWork to report clean state
      orchestrator._checkUncommittedWork = jest.fn().mockResolvedValue({
        hasChanges: false,
        count: 0,
        files: [],
      });

      // When
      const result = await orchestrator.handleSessionResume('restart');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('restart');
      expect(result.message).toContain('1.1');
    });

    it('should handle DISCARD option', async () => {
      // Given - SessionState returns discard
      orchestrator.sessionState = {
        handleResumeOption: jest.fn().mockResolvedValue({
          action: 'discard',
          message: 'Session discarded. Ready for new epic.',
        }),
      };

      // When
      const result = await orchestrator.handleSessionResume('discard');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('discard');
      expect(result.message).toContain('descartada');
    });
  });
});
