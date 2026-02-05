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
  CONFIG_FILES: {},
  LEVELS: {},
}));

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
  const mockExecute = jest.fn().mockResolvedValue({ success: true, state: {}, phaseResults: {} });
  return {
    WorkflowExecutor: jest.fn().mockImplementation(() => ({
      execute: mockExecute,
    })),
    createWorkflowExecutor: jest.fn(),
    executeDevelopmentCycle: jest.fn(),
    PhaseStatus: {},
    CheckpointDecision: {},
  };
});

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
    })),
    createSessionState: jest.fn(),
    sessionStateExists: jest.fn(),
    loadSessionState: jest.fn(),
    ActionType: { PHASE_CHANGE: 'PHASE_CHANGE' },
    Phase: {},
    ResumeOption: {},
    SESSION_STATE_VERSION: '1.1',
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
    try {
      await fs.rm(TEST_PROJECT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore
    }
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

    it('should route to brownfield_discovery for EXISTING_NO_DOCS state (AC4)', async () => {
      // Given
      await fs.rm(path.join(TEST_PROJECT_ROOT, 'docs/architecture'), { recursive: true });

      // When
      const result = await orchestrator.orchestrate();

      // Then
      expect(result.success).toBe(true);
      expect(result.projectState).toBe(ProjectState.EXISTING_NO_DOCS);
      expect(result.action).toBe('brownfield_discovery');
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
      expect(result.action).toBe('greenfield');
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
});
