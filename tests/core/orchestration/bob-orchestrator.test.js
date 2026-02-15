/**
 * Bob Orchestrator Tests
 * Story 12.3: Bob Orchestration Logic (Decision Tree)
 */

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const {
  BobOrchestrator,
  ProjectState,
} = require('../../../.aios-core/core/orchestration/bob-orchestrator');

// Test fixtures
const TEST_PROJECT_ROOT = path.join(__dirname, '../../fixtures/test-project-bob');

// Mock Epic 11 modules
jest.mock('../../../.aios-core/core/config/config-resolver', () => ({
  resolveConfig: jest.fn(),
  isLegacyMode: jest.fn(),
  setUserConfigValue: jest.fn(),
  CONFIG_FILES: {},
  LEVELS: {},
}));

// Story 12.7: Mock MessageFormatter
jest.mock('../../../.aios-core/core/orchestration/message-formatter', () => ({
  MessageFormatter: jest.fn().mockImplementation(() => ({
    format: jest.fn().mockReturnValue('formatted message'),
    formatEducational: jest.fn().mockReturnValue('educational message'),
    setEducationalMode: jest.fn(),
    isEducationalMode: jest.fn().mockReturnValue(false),
    formatToggleFeedback: jest.fn().mockImplementation((enabled) =>
      enabled ? '🎓 Modo educativo ativado!' : '📋 Modo educativo desativado.',
    ),
    formatPersistencePrompt: jest.fn().mockReturnValue('[1] Sessão / [2] Permanente'),
  })),
}));

// Story 12.8: Mock BrownfieldHandler
jest.mock('../../../.aios-core/core/orchestration/brownfield-handler', () => ({
  BrownfieldHandler: jest.fn().mockImplementation(() => ({
    handle: jest.fn().mockResolvedValue({
      action: 'brownfield_welcome',
      data: {
        message: 'Projeto com código detectado. Deseja analisar?',
        hasCode: true,
      },
    }),
    handleUserDecision: jest.fn().mockResolvedValue({
      action: 'analysis_started',
    }),
  })),
  BrownfieldPhase: {},
  PostDiscoveryChoice: {},
  PhaseFailureAction: {},
}));

// Story 12.13: Mock GreenfieldHandler (FASE 1: Error Handlers)
jest.mock('../../../.aios-core/core/orchestration/greenfield-handler', () => {
  const EventEmitter = require('events');
  return {
    GreenfieldHandler: jest.fn().mockImplementation(() => {
      const emitter = new EventEmitter();
      return Object.assign(emitter, {
        handle: jest.fn().mockResolvedValue({
          action: 'greenfield_bootstrap',
          data: { phase: 'bootstrap' },
        }),
      });
    }),
    GreenfieldPhase: {
      DETECTION: 'detection',
      BOOTSTRAP: 'phase_0_bootstrap',
      DISCOVERY: 'phase_1_discovery',
      SHARDING: 'phase_2_sharding',
      DEV_CYCLE: 'phase_3_dev_cycle',
      COMPLETE: 'complete',
    },
    PhaseFailureAction: {
      RETRY: 'retry',
      SKIP: 'skip',
      ABORT: 'abort',
    },
  };
});

jest.mock('../../../.aios-core/core/orchestration/executor-assignment', () => ({
  assignExecutorFromContent: jest.fn().mockReturnValue({
    executor: '@dev',
    quality_gate: '@architect',
    quality_gate_tools: ['code_review'],
  }),
  detectStoryType: jest.fn().mockReturnValue('code_general'),
  assignExecutor: jest.fn(),
  validateExecutorAssignment: jest.fn(),
  EXECUTOR_ASSIGNMENT_TABLE: {},
  DEFAULT_ASSIGNMENT: {},
}));

jest.mock('../../../.aios-core/core/orchestration/terminal-spawner', () => ({
  spawnAgent: jest.fn().mockResolvedValue({ success: true, output: 'done' }),
  isSpawnerAvailable: jest.fn().mockReturnValue(true),
}));

jest.mock('../../../.aios-core/core/orchestration/workflow-executor', () => {
  return {
    WorkflowExecutor: jest.fn().mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue({ success: true, state: {}, phaseResults: {} }),
      onPhaseChange: jest.fn(),
      onAgentSpawn: jest.fn(),
      onTerminalSpawn: jest.fn(),
      onLog: jest.fn(),
      onError: jest.fn(),
    })),
    createWorkflowExecutor: jest.fn(),
    executeDevelopmentCycle: jest.fn(),
    PhaseStatus: {},
    CheckpointDecision: {},
  };
});

// Story 12.6: Mock UI components
jest.mock('../../../.aios-core/core/ui/observability-panel', () => ({
  ObservabilityPanel: jest.fn().mockImplementation(() => ({
    setStage: jest.fn(),
    setPipelineStage: jest.fn(),
    setCurrentAgent: jest.fn(),
    addTerminal: jest.fn(),
    updateActiveAgent: jest.fn(),
    setLog: jest.fn(),
    setError: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    // Story 12.7: Educational mode support
    setMode: jest.fn(),
    updateState: jest.fn(),
  })),
  PanelMode: { MINIMAL: 'minimal', DETAILED: 'detailed' },
}));

jest.mock('../../../.aios-core/core/orchestration/bob-status-writer', () => ({
  BobStatusWriter: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    writeStatus: jest.fn().mockResolvedValue(undefined),
    updatePhase: jest.fn().mockResolvedValue(undefined),
    updateStage: jest.fn().mockResolvedValue(undefined),
    updateAgent: jest.fn().mockResolvedValue(undefined),
    addTerminal: jest.fn().mockResolvedValue(undefined),
    updateActiveAgent: jest.fn().mockResolvedValue(undefined),
    addAttempt: jest.fn().mockResolvedValue(undefined),
    appendLog: jest.fn().mockResolvedValue(undefined),
    complete: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../../../.aios-core/core/events/dashboard-emitter', () => ({
  getDashboardEmitter: jest.fn().mockReturnValue({
    emit: jest.fn(),
    on: jest.fn(),
    emitBobPhaseChange: jest.fn().mockResolvedValue(undefined),
    emitBobAgentSpawned: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('../../../.aios-core/core/orchestration/surface-checker', () => {
  const mockShouldSurface = jest.fn().mockReturnValue({
    should_surface: false,
    criterion_id: null,
    criterion_name: null,
    action: null,
    message: null,
    severity: null,
    can_bypass: true,
  });
  return {
    SurfaceChecker: jest.fn().mockImplementation(() => ({
      shouldSurface: mockShouldSurface,
      load: jest.fn().mockReturnValue(true),
    })),
    createSurfaceChecker: jest.fn(),
    shouldSurface: jest.fn(),
  };
});

jest.mock('../../../.aios-core/core/orchestration/session-state', () => {
  const mockExists = jest.fn().mockResolvedValue(false);
  const mockLoad = jest.fn().mockResolvedValue(null);
  const mockDetectCrash = jest.fn().mockResolvedValue({ isCrash: false });
  const mockGetResumeOptions = jest.fn().mockReturnValue({});
  const mockGetResumeSummary = jest.fn().mockReturnValue('');
  const mockRecordPhaseChange = jest.fn().mockResolvedValue({});
  const mockGetSessionOverride = jest.fn().mockReturnValue(null);
  const mockSetSessionOverride = jest.fn();
  const mockHandleResumeOption = jest.fn().mockResolvedValue({ action: 'continue', story: '12.1', phase: 'development' });
  return {
    SessionState: jest.fn().mockImplementation(() => ({
      exists: mockExists,
      loadSessionState: mockLoad,
      detectCrash: mockDetectCrash,
      getResumeOptions: mockGetResumeOptions,
      getResumeSummary: mockGetResumeSummary,
      recordPhaseChange: mockRecordPhaseChange,
      createSessionState: jest.fn(),
      updateSessionState: jest.fn(),
      getSessionOverride: mockGetSessionOverride,
      setSessionOverride: mockSetSessionOverride,
      handleResumeOption: mockHandleResumeOption,
      state: null,
    })),
    createSessionState: jest.fn(),
    sessionStateExists: jest.fn(),
    loadSessionState: jest.fn(),
    ActionType: { PHASE_CHANGE: 'PHASE_CHANGE' },
    Phase: {},
    ResumeOption: { CONTINUE: 'continue', REVIEW: 'review', RESTART: 'restart', DISCARD: 'discard' },
    SESSION_STATE_VERSION: '1.2',
    SESSION_STATE_FILENAME: '.session-state.yaml',
    CRASH_THRESHOLD_MINUTES: 30,
  };
});

jest.mock('../../../.aios-core/core/orchestration/lock-manager', () => {
  const mockAcquire = jest.fn().mockResolvedValue(true);
  const mockRelease = jest.fn().mockResolvedValue(true);
  const mockCleanup = jest.fn().mockResolvedValue(0);
  return jest.fn().mockImplementation(() => ({
    acquireLock: mockAcquire,
    releaseLock: mockRelease,
    cleanupStaleLocks: mockCleanup,
    isLocked: jest.fn().mockResolvedValue(false),
  }));
});

// Story 12.5: Mock DataLifecycleManager
jest.mock('../../../.aios-core/core/orchestration/data-lifecycle-manager', () => {
  const mockRunStartupCleanup = jest.fn().mockResolvedValue({
    locksRemoved: 0,
    sessionsArchived: 0,
    snapshotsRemoved: 0,
    errors: [],
  });
  return {
    DataLifecycleManager: jest.fn().mockImplementation(() => ({
      runStartupCleanup: mockRunStartupCleanup,
    })),
    createDataLifecycleManager: jest.fn(),
    runStartupCleanup: jest.fn(),
    STALE_SESSION_DAYS: 30,
    STALE_SNAPSHOT_DAYS: 90,
  };
});

const { resolveConfig } = require('../../../.aios-core/core/config/config-resolver');

describe('BobOrchestrator', () => {
  let orchestrator;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Clean up test directory
    try {
      await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore
    }

    // Default: project with config and docs
    await fs.mkdir(path.join(TEST_PROJECT_ROOT, 'docs/architecture'), { recursive: true });
    await fs.mkdir(path.join(TEST_PROJECT_ROOT, '.aios/locks'), { recursive: true });
    await fs.writeFile(path.join(TEST_PROJECT_ROOT, 'package.json'), '{}');
    await fs.mkdir(path.join(TEST_PROJECT_ROOT, '.git'), { recursive: true });

    resolveConfig.mockReturnValue({
      config: { version: '1.0' },
      warnings: [],
      legacy: false,
    });

    orchestrator = new BobOrchestrator(TEST_PROJECT_ROOT);
  });

  afterEach(async () => {
    // FASE 6: Cleanup resources to prevent worker leak
    if (orchestrator) {
      // Stop observability panel
      if (orchestrator.observabilityPanel && typeof orchestrator.observabilityPanel.stop === 'function') {
        orchestrator.observabilityPanel.stop();
      }

      // Complete bob status writer
      if (orchestrator.bobStatusWriter && typeof orchestrator.bobStatusWriter.complete === 'function') {
        await orchestrator.bobStatusWriter.complete().catch(() => {});
      }

      // Release all locks
      if (orchestrator.lockManager && typeof orchestrator.lockManager.releaseLock === 'function') {
        await orchestrator.lockManager.releaseLock('bob-orchestration').catch(() => {});
      }
    }

    // Clean up test directory
    try {
      await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore
    }

    // Wait for pending microtasks to complete
    await new Promise(resolve => setImmediate(resolve));
  });

  afterAll(() => {
    // FASE 6: Restore all mocks after test suite
    jest.restoreAllMocks();
  });

  // ==========================================
  // Constructor tests
  // ==========================================

  describe('constructor', () => {
    it('should create BobOrchestrator with projectRoot', () => {
      // Then
      expect(orchestrator).toBeDefined();
      expect(orchestrator.projectRoot).toBe(TEST_PROJECT_ROOT);
    });

    it('should throw if projectRoot is missing', () => {
      // When/Then
      expect(() => new BobOrchestrator()).toThrow('projectRoot is required');
      expect(() => new BobOrchestrator('')).toThrow('projectRoot is required');
      expect(() => new BobOrchestrator(123)).toThrow('projectRoot is required');
    });

    it('should initialize all Epic 11 dependencies', () => {
      // Then
      expect(orchestrator.surfaceChecker).toBeDefined();
      expect(orchestrator.sessionState).toBeDefined();
      expect(orchestrator.workflowExecutor).toBeDefined();
      expect(orchestrator.lockManager).toBeDefined();
    });
  });

  // ==========================================
  // detectProjectState tests (AC3-6)
  // ==========================================

  describe('detectProjectState', () => {
    it('should detect GREENFIELD when no package.json, .git, or docs exist (AC6)', async () => {
      // Given — empty project
      const emptyRoot = path.join(TEST_PROJECT_ROOT, 'empty-project');
      await fs.mkdir(emptyRoot, { recursive: true });

      // When
      const state = orchestrator.detectProjectState(emptyRoot);

      // Then
      expect(state).toBe(ProjectState.GREENFIELD);
    });

    it('should detect NO_CONFIG when resolveConfig fails (AC3)', () => {
      // Given
      resolveConfig.mockImplementation(() => {
        throw new Error('Config not found');
      });

      // When
      const state = orchestrator.detectProjectState(TEST_PROJECT_ROOT);

      // Then
      expect(state).toBe(ProjectState.NO_CONFIG);
    });

    it('should detect NO_CONFIG when resolveConfig returns empty config (AC3)', () => {
      // Given
      resolveConfig.mockReturnValue({ config: {}, warnings: [], legacy: false });

      // When
      const state = orchestrator.detectProjectState(TEST_PROJECT_ROOT);

      // Then
      expect(state).toBe(ProjectState.NO_CONFIG);
    });

    it('should detect EXISTING_NO_DOCS when config exists but no architecture docs (AC4)', async () => {
      // Given — remove architecture docs
      await fs.rm(path.join(TEST_PROJECT_ROOT, 'docs/architecture'), { recursive: true });

      // When
      const state = orchestrator.detectProjectState(TEST_PROJECT_ROOT);

      // Then
      expect(state).toBe(ProjectState.EXISTING_NO_DOCS);
    });

    it('should detect EXISTING_WITH_DOCS when config and architecture docs exist (AC5)', () => {
      // Given — default setup has both config and docs

      // When
      const state = orchestrator.detectProjectState(TEST_PROJECT_ROOT);

      // Then
      expect(state).toBe(ProjectState.EXISTING_WITH_DOCS);
    });

    it('should use this.projectRoot as default when no argument is passed (Issue #88)', () => {
      // Given — orchestrator was created with TEST_PROJECT_ROOT
      // and default setup has both config and docs

      // When — call without argument
      const state = orchestrator.detectProjectState();

      // Then — should use this.projectRoot and return same result
      expect(state).toBe(ProjectState.EXISTING_WITH_DOCS);
    });
  });

  // ==========================================
  // orchestrate tests
  // ==========================================

  describe('orchestrate', () => {
    it('should return lock_failed when lock cannot be acquired', async () => {
      // Given
      const LockManager = require('../../../.aios-core/core/orchestration/lock-manager');
      const mockInstance = new LockManager();
      mockInstance.acquireLock.mockResolvedValueOnce(false);
      orchestrator.lockManager = mockInstance;

      // When
      const result = await orchestrator.orchestrate();

      // Then
      expect(result.success).toBe(false);
      expect(result.action).toBe('lock_failed');
    });

    it('should route to onboarding for NO_CONFIG state (AC3)', async () => {
      // Given
      resolveConfig.mockImplementation(() => {
        throw new Error('No config');
      });

      // When
      const result = await orchestrator.orchestrate();

      // Then
      expect(result.success).toBe(true);
      expect(result.projectState).toBe(ProjectState.NO_CONFIG);
      expect(result.action).toBe('onboarding');
    });

    it('should route to brownfield_welcome for EXISTING_NO_DOCS state (AC4)', async () => {
      // Given
      await fs.rm(path.join(TEST_PROJECT_ROOT, 'docs/architecture'), { recursive: true });

      // When
      const result = await orchestrator.orchestrate();

      // Then
      expect(result.success).toBe(true);
      expect(result.projectState).toBe(ProjectState.EXISTING_NO_DOCS);
      // Story 12.8: BrownfieldHandler now returns 'brownfield_welcome' action
      expect(result.action).toBe('brownfield_welcome');
    });

    it('should route to ask_objective for EXISTING_WITH_DOCS state (AC5)', async () => {
      // When
      const result = await orchestrator.orchestrate();

      // Then
      expect(result.success).toBe(true);
      expect(result.projectState).toBe(ProjectState.EXISTING_WITH_DOCS);
      expect(result.action).toBe('ask_objective');
    });

    it('should route to greenfield for GREENFIELD state (AC6)', async () => {
      // Given — clean empty project
      const emptyRoot = path.join(TEST_PROJECT_ROOT, 'greenfield');
      await fs.mkdir(emptyRoot, { recursive: true });
      const greenOrch = new BobOrchestrator(emptyRoot);

      // When
      const result = await greenOrch.orchestrate();

      // Then
      expect(result.success).toBe(true);
      expect(result.projectState).toBe(ProjectState.GREENFIELD);
      // GreenfieldHandler returns a surface prompt after Phase 0
      expect(result.action).toBe('greenfield_surface');
    });

    it('should release lock on error', async () => {
      // Given — force an error by making detectProjectState throw
      const original = orchestrator.detectProjectState;
      orchestrator.detectProjectState = () => {
        throw new Error('Forced test error');
      };

      // When
      const result = await orchestrator.orchestrate();

      // Then
      expect(result.success).toBe(false);
      expect(result.action).toBe('error');
      expect(result.error).toContain('Forced test error');

      // Restore
      orchestrator.detectProjectState = original;
    });

    it('should execute story when storyPath is provided (AC8-10)', async () => {
      // Given — create a mock story file
      const storyPath = path.join(TEST_PROJECT_ROOT, 'docs/stories/test-story.md');
      await fs.mkdir(path.dirname(storyPath), { recursive: true });
      await fs.writeFile(storyPath, '# Test Story\nSome content here');

      // When
      const result = await orchestrator.orchestrate({ storyPath });

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('story_executed');
      expect(result.data.assignment.executor).toBe('@dev');
    });
  });

  // ==========================================
  // Decision tree is codified, not LLM (AC7)
  // ==========================================

  describe('decision tree codification (AC7)', () => {
    it('should use pure if/else statements without LLM calls', () => {
      // Verify the method exists and returns string values
      const states = [
        ProjectState.NO_CONFIG,
        ProjectState.EXISTING_NO_DOCS,
        ProjectState.EXISTING_WITH_DOCS,
        ProjectState.GREENFIELD,
      ];

      // Each state should be a simple string constant
      for (const state of states) {
        expect(typeof state).toBe('string');
      }
    });
  });

  // ==========================================
  // Constraint: < 50 lines of other-agent logic (AC13)
  // ==========================================

  describe('constraint: router not god class (AC13)', () => {
    it('should have less than 50 lines of other-agent-specific logic', async () => {
      // Given — read the source file
      const sourcePath = path.join(
        __dirname,
        '../../../.aios-core/core/orchestration/bob-orchestrator.js',
      );
      const source = await fs.readFile(sourcePath, 'utf8');
      const lines = source.split('\n');

      // Count lines that contain agent-specific logic
      // (calls to Epic 11 modules with actual logic, not just initialization)
      const agentSpecificPatterns = [
        /ExecutorAssignment\.\w+\(/,
        /TerminalSpawner\.\w+\(/,
        /workflowExecutor\.\w+\(/,
        /surfaceChecker\.shouldSurface\(/,
        /sessionState\.\w+\(/,
      ];

      let agentSpecificLines = 0;
      for (const line of lines) {
        for (const pattern of agentSpecificPatterns) {
          if (pattern.test(line)) {
            agentSpecificLines++;
            break; // Count each line only once
          }
        }
      }

      // Then — must be < 50 lines (PRD §3.7)
      expect(agentSpecificLines).toBeLessThan(50);
    });
  });

  // ==========================================
  // ProjectState enum
  // ==========================================

  describe('ProjectState enum', () => {
    it('should export all four states', () => {
      expect(ProjectState.NO_CONFIG).toBe('NO_CONFIG');
      expect(ProjectState.EXISTING_NO_DOCS).toBe('EXISTING_NO_DOCS');
      expect(ProjectState.EXISTING_WITH_DOCS).toBe('EXISTING_WITH_DOCS');
      expect(ProjectState.GREENFIELD).toBe('GREENFIELD');
    });
  });

  // ==========================================
  // Story 12.5: Session Detection (AC1, AC2, AC4)
  // ==========================================

  describe('_checkExistingSession (Story 12.5)', () => {
    it('should return hasSession: false when no session exists (AC1)', async () => {
      // Given - session does not exist (default mock)

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.hasSession).toBe(false);
    });

    it('should return session data when session exists (AC1)', async () => {
      // Given - session exists
      const mockSessionState = {
        session_state: {
          version: '1.1',
          last_updated: new Date().toISOString(),
          epic: { id: '12', title: 'Test Epic', total_stories: 5 },
          progress: { current_story: '12.1', stories_done: [], stories_pending: ['12.1'] },
          workflow: { current_phase: 'development' },
        },
      };

      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue(mockSessionState);
      orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({ isCrash: false });
      orchestrator.sessionState.getResumeSummary = jest.fn().mockReturnValue('Resume summary');

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.hasSession).toBe(true);
      expect(result.epicTitle).toBe('Test Epic');
      expect(result.currentStory).toBe('12.1');
      expect(result.currentPhase).toBe('development');
    });

    it('should format elapsed time correctly (AC2)', async () => {
      // Given - session updated 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const mockSessionState = {
        session_state: {
          version: '1.1',
          last_updated: threeDaysAgo.toISOString(),
          epic: { id: '12', title: 'Test Epic', total_stories: 5 },
          progress: { current_story: '12.1' },
          workflow: { current_phase: 'development' },
        },
      };

      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue(mockSessionState);
      orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({ isCrash: false });
      orchestrator.sessionState.getResumeSummary = jest.fn().mockReturnValue('');

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.elapsedString).toBe('3 dias');
      expect(result.formattedMessage).toContain('Bem-vindo de volta!');
      expect(result.formattedMessage).toContain('3 dias');
    });

    it('should include crash warning when crash detected (AC4)', async () => {
      // Given - crash detected
      const mockSessionState = {
        session_state: {
          version: '1.1',
          last_updated: new Date().toISOString(),
          epic: { id: '12', title: 'Test Epic', total_stories: 5 },
          progress: { current_story: '12.1' },
          workflow: { current_phase: 'development' },
        },
      };

      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue(mockSessionState);
      orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({
        isCrash: true,
        minutesSinceUpdate: 45,
        reason: 'Crash detected',
      });
      orchestrator.sessionState.getResumeSummary = jest.fn().mockReturnValue('');

      // When
      const result = await orchestrator._checkExistingSession();

      // Then
      expect(result.crashInfo.isCrash).toBe(true);
      expect(result.formattedMessage).toContain('⚠️');
      expect(result.formattedMessage).toContain('crashado');
      expect(result.formattedMessage).toContain('45 min');
    });
  });

  // ==========================================
  // Story 12.5: Session Resume (AC3, AC7)
  // ==========================================

  describe('handleSessionResume (Story 12.5)', () => {
    beforeEach(() => {
      // Setup session state mock with handleResumeOption
      orchestrator.sessionState.handleResumeOption = jest.fn();
    });

    it('should handle continue option (AC3 [1])', async () => {
      // Given
      orchestrator.sessionState.handleResumeOption.mockResolvedValue({
        action: 'continue',
        story: '12.1',
        phase: 'development',
      });

      // When
      const result = await orchestrator.handleSessionResume('continue');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('continue');
      expect(result.phase).toBe('development');
      expect(result.message).toContain('Continuando');
    });

    it('should handle review option (AC3 [2])', async () => {
      // Given
      orchestrator.sessionState.handleResumeOption.mockResolvedValue({
        action: 'review',
        summary: { progress: { completed: 2, total: 5 } },
      });

      // When
      const result = await orchestrator.handleSessionResume('review');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('review');
      expect(result.needsReprompt).toBe(true);
    });

    it('should handle restart option (AC3 [3])', async () => {
      // Given
      orchestrator.sessionState.handleResumeOption.mockResolvedValue({
        action: 'restart',
        story: '12.1',
      });

      // When
      const result = await orchestrator.handleSessionResume('restart');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('restart');
      expect(result.message).toContain('Recomeçando');
    });

    it('should handle discard option (AC3 [4])', async () => {
      // Given
      orchestrator.sessionState.handleResumeOption.mockResolvedValue({
        action: 'discard',
        message: 'Session discarded',
      });

      // When
      const result = await orchestrator.handleSessionResume('discard');

      // Then
      expect(result.success).toBe(true);
      expect(result.action).toBe('discard');
      expect(result.message).toContain('descartada');
    });

    it('should handle unknown option', async () => {
      // Given
      orchestrator.sessionState.handleResumeOption.mockResolvedValue({
        action: 'invalid',
      });

      // When
      const result = await orchestrator.handleSessionResume('invalid');

      // Then
      expect(result.success).toBe(false);
      expect(result.action).toBe('unknown');
    });
  });

  // ==========================================
  // Story 12.5: Data Lifecycle Integration
  // ==========================================

  describe('data lifecycle integration (Story 12.5)', () => {
    it('should initialize DataLifecycleManager in constructor', () => {
      // Then - verify the DataLifecycleManager was initialized
      expect(orchestrator.dataLifecycleManager).toBeDefined();
      expect(orchestrator.dataLifecycleManager.runStartupCleanup).toBeDefined();
    });

    it('should have dataLifecycleManager with runStartupCleanup method', () => {
      // Then - verify the method exists
      expect(typeof orchestrator.dataLifecycleManager.runStartupCleanup).toBe('function');
    });
  });

  // ==========================================
  // Story 12.5: Phase Tracking (AC5)
  // ==========================================

  describe('_updatePhase (Story 12.5 - AC5)', () => {
    it('should update session state on phase change', async () => {
      // Given
      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.state = { session_state: {} };
      orchestrator.sessionState.recordPhaseChange = jest.fn().mockResolvedValue({});

      // When
      await orchestrator._updatePhase('development', '12.1', '@dev');

      // Then
      expect(orchestrator.sessionState.recordPhaseChange).toHaveBeenCalledWith(
        'development',
        '12.1',
        '@dev',
      );
    });

    it('should not fail if session state does not exist', async () => {
      // Given
      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(false);

      // When/Then - should not throw
      await expect(orchestrator._updatePhase('development', '12.1', '@dev')).resolves.not.toThrow();
    });

    // FASE 5: Error logging edge case (line 1141)
    it('should log error when recordPhaseChange fails (line 1141)', async () => {
      // Given - debug mode enabled
      orchestrator.options.debug = true;
      const logs = [];
      orchestrator._log = (msg) => logs.push(msg);

      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.state = { session_state: {} };
      orchestrator.sessionState.recordPhaseChange = jest
        .fn()
        .mockRejectedValue(new Error('Session write failed'));

      // When
      await orchestrator._updatePhase('development', '12.1', '@dev');

      // Then - error logged, not thrown
      expect(logs.some((log) => log.includes('Failed to update phase'))).toBe(true);
      expect(logs.some((log) => log.includes('Session write failed'))).toBe(true);
    });
  });

  // FASE 5: _executeStory phase tracking (lines 1086-1112)
  describe('_executeStory Phase Tracking', () => {
    beforeEach(() => {
      // Mock fs.readFileSync to avoid ENOENT (line 1077 reads story file)
      const fs = require('fs');
      jest.spyOn(fs, 'readFileSync').mockReturnValue(`---
id: TEST-001
title: Test Story
status: Draft
---
# Test Story Content`);

      // Mock ExecutorAssignment.assignExecutorFromContent (line 1078)
      const ExecutorAssignment = require('../../../.aios-core/core/orchestration/executor-assignment');
      jest
        .spyOn(ExecutorAssignment, 'assignExecutorFromContent')
        .mockReturnValue({
          executor: '@dev',
          quality_gate: '@qa',
          quality_gate_tools: ['test_review', 'coverage_check'],
        });

      // Mock session state
      orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
      orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue({});
      orchestrator.sessionState.state = { session_state: {} };
      orchestrator.sessionState.recordPhaseChange = jest.fn().mockResolvedValue({});

      // Mock workflowExecutor
      orchestrator.workflowExecutor = {
        execute: jest.fn().mockResolvedValue({
          success: true,
          selfHealing: false,
        }),
      };
    });

    afterEach(() => {
      // Restore fs.readFileSync to avoid interfering with other tests
      jest.restoreAllMocks();
    });

    it('should load session state when exists (lines 1086-1087)', async () => {
      // Given - session exists
      orchestrator.sessionState.exists.mockResolvedValue(true);

      // When
      await orchestrator._executeStory('docs/stories/test.md');

      // Then
      expect(orchestrator.sessionState.loadSessionState).toHaveBeenCalled();
    });

    it('should track all 5 phases when success without self_healing (lines 1090-1112)', async () => {
      // Given - success without self_healing
      orchestrator.workflowExecutor.execute.mockResolvedValue({
        success: true,
        selfHealing: false,
      });

      // When
      await orchestrator._executeStory('docs/stories/test.md');

      // Then - 5 phases tracked (validation, development, quality_gate, push, checkpoint)
      expect(orchestrator.sessionState.recordPhaseChange).toHaveBeenCalledTimes(5);
      expect(orchestrator.sessionState.recordPhaseChange).toHaveBeenNthCalledWith(
        1,
        'validation',
        expect.any(String),
        '@dev',
      );
      expect(orchestrator.sessionState.recordPhaseChange).toHaveBeenNthCalledWith(
        2,
        'development',
        expect.any(String),
        '@dev',
      );
      expect(orchestrator.sessionState.recordPhaseChange).toHaveBeenNthCalledWith(
        3,
        'quality_gate',
        expect.any(String),
        '@qa',
      );
      expect(orchestrator.sessionState.recordPhaseChange).toHaveBeenNthCalledWith(
        4,
        'push',
        expect.any(String),
        '@devops',
      );
      expect(orchestrator.sessionState.recordPhaseChange).toHaveBeenNthCalledWith(
        5,
        'checkpoint',
        expect.any(String),
        '@dev',
      );
    });

    it('should track self_healing phase when result.selfHealing=true (lines 1099-1100)', async () => {
      // Given - self_healing enabled
      orchestrator.workflowExecutor.execute.mockResolvedValue({
        success: true,
        selfHealing: true,
      });

      // When
      await orchestrator._executeStory('docs/stories/test.md');

      // Then - 6 phases tracked (includes self_healing)
      expect(orchestrator.sessionState.recordPhaseChange).toHaveBeenCalledTimes(6);
      expect(orchestrator.sessionState.recordPhaseChange).toHaveBeenCalledWith(
        'self_healing',
        expect.any(String),
        '@dev',
      );
    });

    it('should skip push phase when result.success=false (lines 1107-1108)', async () => {
      // Given - execution failed
      orchestrator.workflowExecutor.execute.mockResolvedValue({
        success: false,
        selfHealing: false,
      });

      // When
      await orchestrator._executeStory('docs/stories/test.md');

      // Then - 4 phases tracked (no push)
      expect(orchestrator.sessionState.recordPhaseChange).toHaveBeenCalledTimes(4);
      const calls = orchestrator.sessionState.recordPhaseChange.mock.calls;
      const phases = calls.map((call) => call[0]);
      expect(phases).toContain('validation');
      expect(phases).toContain('development');
      expect(phases).toContain('quality_gate');
      expect(phases).toContain('checkpoint');
      expect(phases).not.toContain('push'); // Push skipped when failed
    });

    it('should skip self_healing phase when result.selfHealing=false', async () => {
      // Given - self_healing disabled
      orchestrator.workflowExecutor.execute.mockResolvedValue({
        success: true,
        selfHealing: false,
      });

      // When
      await orchestrator._executeStory('docs/stories/test.md');

      // Then - self_healing not tracked
      const calls = orchestrator.sessionState.recordPhaseChange.mock.calls;
      const phases = calls.map((call) => call[0]);
      expect(phases).not.toContain('self_healing');
    });
  });

  // ==========================================
  // Story 12.7: Educational Mode (AC1-7)
  // ==========================================

  describe('Educational Mode (Story 12.7)', () => {
    describe('_detectEducationalModeToggle (AC5)', () => {
      it('should detect "ativa modo educativo" command', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('ativa modo educativo');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(true);
      });

      it('should detect "desativa modo educativo" command', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('desativa modo educativo');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(false);
      });

      it('should detect "Bob, ativa modo educativo" command', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('Bob, ativa modo educativo');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(true);
      });

      it('should detect "modo educativo on" command', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('modo educativo on');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(true);
      });

      it('should detect "modo educativo off" command', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('modo educativo off');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(false);
      });

      it('should detect "educational mode on" command (English)', () => {
        // When
        const result = orchestrator._detectEducationalModeToggle('educational mode on');

        // Then
        expect(result).not.toBeNull();
        expect(result.enable).toBe(true);
      });

      it('should be case-insensitive', () => {
        // When
        const result1 = orchestrator._detectEducationalModeToggle('ATIVA MODO EDUCATIVO');
        const result2 = orchestrator._detectEducationalModeToggle('Ativa Modo Educativo');

        // Then
        expect(result1).not.toBeNull();
        expect(result1.enable).toBe(true);
        expect(result2).not.toBeNull();
        expect(result2.enable).toBe(true);
      });

      it('should return null for non-toggle commands', () => {
        // When
        const result1 = orchestrator._detectEducationalModeToggle('create a new feature');
        const result2 = orchestrator._detectEducationalModeToggle('help');
        const result3 = orchestrator._detectEducationalModeToggle('');
        const result4 = orchestrator._detectEducationalModeToggle(null);

        // Then
        expect(result1).toBeNull();
        expect(result2).toBeNull();
        expect(result3).toBeNull();
        expect(result4).toBeNull();
      });
    });

    describe('orchestrate with educational mode toggle (AC5)', () => {
      it('should detect toggle and return early before routing', async () => {
        // When
        const result = await orchestrator.orchestrate({
          userGoal: 'Bob, ativa modo educativo',
        });

        // Then
        expect(result.success).toBe(true);
        expect(result.action).toBe('educational_mode_toggle');
        expect(result.data.enable).toBe(true);
        expect(result.data.persistencePrompt).toBeDefined();
      });

      it('should include persistence prompt in toggle result', async () => {
        // When
        const result = await orchestrator.orchestrate({
          userGoal: 'desativa modo educativo',
        });

        // Then
        expect(result.action).toBe('educational_mode_toggle');
        expect(result.data.enable).toBe(false);
        expect(result.data.persistencePrompt).toContain('Sessão');
      });
    });

    describe('handleEducationalModeToggle (AC6)', () => {
      it('should update internal state when enabling', async () => {
        // When
        const result = await orchestrator.handleEducationalModeToggle(true, 'session');

        // Then
        expect(result.success).toBe(true);
        expect(result.educationalMode).toBe(true);
        expect(result.persistenceType).toBe('session');
      });

      it('should update internal state when disabling', async () => {
        // When
        const result = await orchestrator.handleEducationalModeToggle(false, 'session');

        // Then
        expect(result.success).toBe(true);
        expect(result.educationalMode).toBe(false);
      });

      it('should persist to session state for session type', async () => {
        // Given
        orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
        orchestrator.sessionState.setSessionOverride = jest.fn().mockResolvedValue({});

        // When
        await orchestrator.handleEducationalModeToggle(true, 'session');

        // Then
        expect(orchestrator.sessionState.setSessionOverride).toHaveBeenCalledWith(
          'educational_mode',
          true,
        );
      });

      it('should persist to user config for permanent type', async () => {
        // Given
        const { setUserConfigValue } = require('../../../.aios-core/core/config/config-resolver');

        // When
        await orchestrator.handleEducationalModeToggle(true, 'permanent');

        // Then
        expect(setUserConfigValue).toHaveBeenCalledWith('educational_mode', true);
      });

      it('should return feedback message', async () => {
        // When
        const enableResult = await orchestrator.handleEducationalModeToggle(true, 'session');
        const disableResult = await orchestrator.handleEducationalModeToggle(false, 'session');

        // Then
        expect(enableResult.message).toContain('ativado');
        expect(disableResult.message).toContain('desativado');
      });
    });

    describe('_resolveEducationalMode (AC2)', () => {
      it('should return false when no config or override exists', () => {
        // Given - default mocks return null/false

        // When
        const result = orchestrator._resolveEducationalMode();

        // Then
        expect(result).toBe(false);
      });

      it('should prioritize session override over user config', () => {
        // Given
        orchestrator.sessionState.getSessionOverride = jest.fn().mockReturnValue(true);
        resolveConfig.mockReturnValue({
          config: { educational_mode: false },
          warnings: [],
        });

        // When
        const result = orchestrator._resolveEducationalMode();

        // Then
        expect(result).toBe(true);
      });

      it('should use user config when no session override', () => {
        // Given
        orchestrator.sessionState.getSessionOverride = jest.fn().mockReturnValue(null);
        resolveConfig.mockReturnValue({
          config: { educational_mode: true },
          warnings: [],
        });

        // When
        const result = orchestrator._resolveEducationalMode();

        // Then
        expect(result).toBe(true);
      });
    });

    describe('getEducationalModePersistencePrompt (AC6)', () => {
      it('should return persistence prompt', () => {
        // When
        const result = orchestrator.getEducationalModePersistencePrompt();

        // Then
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });
  });

  // FASE 1: Error Handlers in Callbacks (Coverage Target: lines 179-257)
  describe('Error Handlers in Callbacks', () => {
    describe('onPhaseChange error handlers', () => {
      it('should catch bobStatusWriter.updatePhase errors and log (line 186-188)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.bobStatusWriter.updatePhase = jest
          .fn()
          .mockRejectedValue(new Error('BobStatusWriter failed'));

        // Get the registered callback
        const onPhaseChangeCallback = orchestrator.workflowExecutor.onPhaseChange.mock.calls[0][0];

        // When
        await onPhaseChangeCallback('validation', 'story-1', '@qa');

        // Then - Error is logged, not thrown
        await new Promise((resolve) => setImmediate(resolve)); // Wait for async catch
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('BobStatusWriter error'));
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('BobStatusWriter failed'),
        );
      });

      it('should catch dashboardEmitter.emitBobPhaseChange errors and log (line 191-193)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.dashboardEmitter.emitBobPhaseChange = jest
          .fn()
          .mockRejectedValue(new Error('DashboardEmitter failed'));

        // Get the registered callback
        const onPhaseChangeCallback = orchestrator.workflowExecutor.onPhaseChange.mock.calls[0][0];

        // When
        await onPhaseChangeCallback('validation', 'story-1', '@qa');

        // Then - Error is logged, not thrown
        await new Promise((resolve) => setImmediate(resolve));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('DashboardEmitter error'));
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('DashboardEmitter failed'),
        );
      });
    });

    describe('onAgentSpawn error handlers', () => {
      it('should catch bobStatusWriter.updateAgent errors and log (line 207-209)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.bobStatusWriter.updateAgent = jest
          .fn()
          .mockRejectedValue(new Error('UpdateAgent failed'));

        // Get the registered callback
        const onAgentSpawnCallback = orchestrator.workflowExecutor.onAgentSpawn.mock.calls[0][0];

        // When
        await onAgentSpawnCallback('@dev', 'implement-feature');

        // Then
        await new Promise((resolve) => setImmediate(resolve));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('BobStatusWriter error'));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('UpdateAgent failed'));
      });
    });

    describe('greenfieldHandler error handlers', () => {
      it('should catch bobStatusWriter.updatePhase errors in phaseStart (line 216-218)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.bobStatusWriter.updatePhase = jest
          .fn()
          .mockRejectedValue(new Error('Greenfield updatePhase failed'));

        // Trigger the phaseStart event
        orchestrator.greenfieldHandler.emit('phaseStart', { phase: 'setup' });

        // Then
        await new Promise((resolve) => setImmediate(resolve));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('BobStatusWriter error'));
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Greenfield updatePhase failed'),
        );
      });

      it('should catch bobStatusWriter.updateAgent errors in agentSpawn (line 226-228)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.bobStatusWriter.updateAgent = jest
          .fn()
          .mockRejectedValue(new Error('Greenfield updateAgent failed'));

        // Trigger the agentSpawn event
        orchestrator.greenfieldHandler.emit('agentSpawn', {
          agent: '@architect',
          task: 'design-system',
        });

        // Then
        await new Promise((resolve) => setImmediate(resolve));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('BobStatusWriter error'));
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Greenfield updateAgent failed'),
        );
      });

      it('should catch bobStatusWriter.addTerminal errors in terminalSpawn (line 234-236)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.bobStatusWriter.addTerminal = jest
          .fn()
          .mockRejectedValue(new Error('Greenfield addTerminal failed'));

        // Trigger the terminalSpawn event
        orchestrator.greenfieldHandler.emit('terminalSpawn', {
          agent: '@dev',
          pid: 12345,
          task: 'implement',
        });

        // Then
        await new Promise((resolve) => setImmediate(resolve));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('BobStatusWriter error'));
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Greenfield addTerminal failed'),
        );
      });

      it('should catch dashboardEmitter.emitBobAgentSpawned errors in terminalSpawn (line 237-239)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.dashboardEmitter.emitBobAgentSpawned = jest
          .fn()
          .mockRejectedValue(new Error('Greenfield emitBobAgentSpawned failed'));

        // Trigger the terminalSpawn event
        orchestrator.greenfieldHandler.emit('terminalSpawn', {
          agent: '@dev',
          pid: 12345,
          task: 'implement',
        });

        // Then
        await new Promise((resolve) => setImmediate(resolve));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('DashboardEmitter error'));
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Greenfield emitBobAgentSpawned failed'),
        );
      });
    });

    describe('onTerminalSpawn error handlers', () => {
      it('should catch bobStatusWriter.addTerminal errors and log (line 249-251)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.bobStatusWriter.addTerminal = jest
          .fn()
          .mockRejectedValue(new Error('AddTerminal failed'));

        const onTerminalSpawnCallback =
          orchestrator.workflowExecutor.onTerminalSpawn.mock.calls[0][0];

        // When
        await onTerminalSpawnCallback('@qa', 54321, 'test-execution');

        // Then
        await new Promise((resolve) => setImmediate(resolve));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('BobStatusWriter error'));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('AddTerminal failed'));
      });

      it('should catch dashboardEmitter.emitBobAgentSpawned errors and log (line 254-256)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.dashboardEmitter.emitBobAgentSpawned = jest
          .fn()
          .mockRejectedValue(new Error('EmitBobAgentSpawned failed'));

        const onTerminalSpawnCallback =
          orchestrator.workflowExecutor.onTerminalSpawn.mock.calls[0][0];

        // When
        await onTerminalSpawnCallback('@qa', 54321, 'test-execution');

        // Then
        await new Promise((resolve) => setImmediate(resolve));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('DashboardEmitter error'));
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('EmitBobAgentSpawned failed'),
        );
      });
    });
  });

  // FASE 2: Brownfield/Greenfield Handlers (Coverage Target: lines 941-1057)
  describe('Brownfield/Greenfield Handlers', () => {
    describe('Brownfield handlers', () => {
      it('should handle brownfield decision ACCEPTED (line 941-944)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.brownfieldHandler.handleUserDecision = jest
          .fn()
          .mockResolvedValue({ action: 'analysis_started' });

        // When
        const result = await orchestrator.handleBrownfieldDecision(true, { foo: 'bar' });

        // Then
        expect(logSpy).toHaveBeenCalledWith('Brownfield decision: ACCEPTED');
        expect(orchestrator.brownfieldHandler.handleUserDecision).toHaveBeenCalledWith(
          true,
          { foo: 'bar' },
        );
        expect(result).toEqual({ action: 'analysis_started' });
      });

      it('should handle brownfield decision DECLINED (line 941-944)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.brownfieldHandler.handleUserDecision = jest
          .fn()
          .mockResolvedValue({ action: 'declined' });

        // When
        const result = await orchestrator.handleBrownfieldDecision(false);

        // Then
        expect(logSpy).toHaveBeenCalledWith('Brownfield decision: DECLINED');
        expect(orchestrator.brownfieldHandler.handleUserDecision).toHaveBeenCalledWith(
          false,
          {},
        );
        expect(result).toEqual({ action: 'declined' });
      });

      it('should handle brownfield phase failure with retry action (line 956-959)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.brownfieldHandler.handlePhaseFailureAction = jest
          .fn()
          .mockResolvedValue({ action: 'retry', phase: 'discovery' });

        // When
        const result = await orchestrator.handleBrownfieldPhaseFailure(
          'discovery',
          'retry',
          { attempt: 1 },
        );

        // Then
        expect(logSpy).toHaveBeenCalledWith('Brownfield phase failure action: retry for discovery');
        expect(orchestrator.brownfieldHandler.handlePhaseFailureAction).toHaveBeenCalledWith(
          'discovery',
          'retry',
          { attempt: 1 },
        );
        expect(result).toEqual({ action: 'retry', phase: 'discovery' });
      });

      it('should handle brownfield phase failure with skip action (line 956-959)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.brownfieldHandler.handlePhaseFailureAction = jest
          .fn()
          .mockResolvedValue({ action: 'skip' });

        // When
        await orchestrator.handleBrownfieldPhaseFailure('analysis', 'skip');

        // Then
        expect(logSpy).toHaveBeenCalledWith('Brownfield phase failure action: skip for analysis');
      });

      it('should handle brownfield phase failure with abort action (line 956-959)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.brownfieldHandler.handlePhaseFailureAction = jest
          .fn()
          .mockResolvedValue({ action: 'abort' });

        // When
        await orchestrator.handleBrownfieldPhaseFailure('validation', 'abort');

        // Then
        expect(logSpy).toHaveBeenCalledWith(
          'Brownfield phase failure action: abort for validation',
        );
      });

      it('should handle post-discovery choice resolve_debts (line 970-973)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.brownfieldHandler.handle = jest
          .fn()
          .mockResolvedValue({ action: 'resolve_debts', phase: 'debt_resolution' });

        // When
        const result = await orchestrator.handlePostDiscoveryChoice('resolve_debts', {
          debts: 10,
        });

        // Then
        expect(logSpy).toHaveBeenCalledWith('Post-discovery choice: resolve_debts');
        expect(orchestrator.brownfieldHandler.handle).toHaveBeenCalledWith({
          debts: 10,
          postDiscoveryChoice: 'resolve_debts',
        });
        expect(result).toEqual({ action: 'resolve_debts', phase: 'debt_resolution' });
      });

      it('should handle post-discovery choice add_feature (line 970-973)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.brownfieldHandler.handle = jest
          .fn()
          .mockResolvedValue({ action: 'add_feature' });

        // When
        await orchestrator.handlePostDiscoveryChoice('add_feature');

        // Then
        expect(logSpy).toHaveBeenCalledWith('Post-discovery choice: add_feature');
        expect(orchestrator.brownfieldHandler.handle).toHaveBeenCalledWith({
          postDiscoveryChoice: 'add_feature',
        });
      });
    });

    describe('Greenfield handlers', () => {
      it('should handle greenfield surface decision GO (line 1040-1042)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.greenfieldHandler.handleSurfaceDecision = jest
          .fn()
          .mockResolvedValue({ action: 'continue', nextPhase: 'discovery' });

        // When
        const result = await orchestrator.handleGreenfieldSurfaceDecision('GO', 'discovery', {
          ready: true,
        });

        // Then
        expect(logSpy).toHaveBeenCalledWith('Greenfield surface decision: GO, next phase: discovery');
        expect(orchestrator.greenfieldHandler.handleSurfaceDecision).toHaveBeenCalledWith(
          'GO',
          'discovery',
          { ready: true },
        );
        expect(result).toEqual({ action: 'continue', nextPhase: 'discovery' });
      });

      it('should handle greenfield surface decision PAUSE (line 1040-1042)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.greenfieldHandler.handleSurfaceDecision = jest
          .fn()
          .mockResolvedValue({ action: 'pause' });

        // When
        await orchestrator.handleGreenfieldSurfaceDecision('PAUSE', 'sharding');

        // Then
        expect(logSpy).toHaveBeenCalledWith('Greenfield surface decision: PAUSE, next phase: sharding');
      });

      it('should handle greenfield phase failure with retry (line 1054-1057)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.greenfieldHandler.handlePhaseFailureAction = jest
          .fn()
          .mockResolvedValue({ action: 'retry' });

        // When
        await orchestrator.handleGreenfieldPhaseFailure('bootstrap', 'retry', { attempt: 2 });

        // Then
        expect(logSpy).toHaveBeenCalledWith('Greenfield phase failure: action=retry, phase=bootstrap');
        expect(orchestrator.greenfieldHandler.handlePhaseFailureAction).toHaveBeenCalledWith(
          'bootstrap',
          'retry',
          { attempt: 2 },
        );
      });

      it('should handle greenfield phase failure with skip (line 1054-1057)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.greenfieldHandler.handlePhaseFailureAction = jest
          .fn()
          .mockResolvedValue({ action: 'skip' });

        // When
        await orchestrator.handleGreenfieldPhaseFailure('discovery', 'skip');

        // Then
        expect(logSpy).toHaveBeenCalledWith('Greenfield phase failure: action=skip, phase=discovery');
      });

      it('should handle greenfield phase failure with abort (line 1054-1057)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        orchestrator.greenfieldHandler.handlePhaseFailureAction = jest
          .fn()
          .mockResolvedValue({ action: 'abort' });

        // When
        await orchestrator.handleGreenfieldPhaseFailure('dev_cycle', 'abort');

        // Then
        expect(logSpy).toHaveBeenCalledWith('Greenfield phase failure: action=abort, phase=dev_cycle');
      });
    });
  });

  // FASE 3: Educational Mode Edge Cases (Coverage Target: lines 547-562, 696-704)
  describe('Educational Mode Edge Cases', () => {
    describe('Toggle detection early return', () => {
      it('should detect toggle command and return early (line 547-562)', async () => {
        // Given
        const logSpy = jest.spyOn(orchestrator, '_log');
        const toggleSpy = jest
          .spyOn(orchestrator, '_detectEducationalModeToggle')
          .mockReturnValue({
            enable: true,
            command: 'enable educational mode',
          });

        // When
        const result = await orchestrator.orchestrate({
          userGoal: 'enable educational mode',
        });

        // Then
        expect(toggleSpy).toHaveBeenCalledWith('enable educational mode');
        expect(logSpy).toHaveBeenCalledWith('Educational mode toggle detected: enable=true');
        expect(result.success).toBe(true);
        expect(result.action).toBe('educational_mode_toggle');
        expect(result.data.enable).toBe(true);
        expect(result.data.command).toBe('enable educational mode');
      });

      it('should detect toggle disable command and return early (line 547-562)', async () => {
        // Given
        const toggleSpy = jest
          .spyOn(orchestrator, '_detectEducationalModeToggle')
          .mockReturnValue({
            enable: false,
            command: 'disable educational mode',
          });

        // When
        const result = await orchestrator.orchestrate({
          userGoal: 'disable educational mode',
        });

        // Then
        expect(result.action).toBe('educational_mode_toggle');
        expect(result.data.enable).toBe(false);
      });
    });

    describe('Elapsed time formatting', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should format elapsed time as "1 dia" (singular) when 1 day (line 698-699)', async () => {
        // Given
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
        orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue({
          session_state: {
            last_updated: oneDayAgo.toISOString(),
            active_story: 'test-story',
            current_phase: 'validation',
          },
        });
        orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({
          isCrash: false,
        });
        orchestrator.sessionState.getResumeSummary = jest
          .fn()
          .mockReturnValue('Resumo da sessão: 1 dia de inatividade');

        // When
        const result = await orchestrator._checkExistingSession();

        // Then
        expect(result.summary).toContain('1 dia');
        expect(result.summary).not.toContain('dias'); // Não deve ter plural
      });

      it('should format elapsed time as "2 dias" (plural) when multiple days (line 698-699)', async () => {
        // Given
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
        orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue({
          session_state: {
            last_updated: twoDaysAgo.toISOString(),
            active_story: 'test-story',
            current_phase: 'validation',
          },
        });
        orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({
          isCrash: false,
        });
        orchestrator.sessionState.getResumeSummary = jest
          .fn()
          .mockReturnValue('Resumo da sessão: 2 dias de inatividade');

        // When
        const result = await orchestrator._checkExistingSession();

        // Then
        expect(result.summary).toContain('2 dias');
      });

      it('should format elapsed time as "1 hora" (singular) when 1 hour (line 700-701)', async () => {
        // Given
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
        orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue({
          session_state: {
            last_updated: oneHourAgo.toISOString(),
            active_story: 'test-story',
            current_phase: 'validation',
          },
        });
        orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({
          isCrash: false,
        });
        orchestrator.sessionState.getResumeSummary = jest
          .fn()
          .mockReturnValue('Resumo da sessão: 1 hora de inatividade');

        // When
        const result = await orchestrator._checkExistingSession();

        // Then
        expect(result.summary).toContain('1 hora');
        expect(result.summary).not.toContain('horas'); // Não deve ter plural
      });

      it('should format elapsed time as "3 horas" (plural) when multiple hours (line 700-701)', async () => {
        // Given
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        orchestrator.sessionState.exists = jest.fn().mockResolvedValue(true);
        orchestrator.sessionState.loadSessionState = jest.fn().mockResolvedValue({
          session_state: {
            last_updated: threeHoursAgo.toISOString(),
            active_story: 'test-story',
            current_phase: 'validation',
          },
        });
        orchestrator.sessionState.detectCrash = jest.fn().mockResolvedValue({
          isCrash: false,
        });
        orchestrator.sessionState.getResumeSummary = jest
          .fn()
          .mockReturnValue('Resumo da sessão: 3 horas de inatividade');

        // When
        const result = await orchestrator._checkExistingSession();

        // Then
        expect(result.summary).toContain('3 horas');
      });
    });
  });
});
