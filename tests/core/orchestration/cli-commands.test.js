/**
 * Unit tests for cli-commands module
 *
 * Tests the CLI command handlers for orchestrator control:
 * orchestrate, orchestrate-status, orchestrate-stop, orchestrate-resume.
 */

jest.mock('fs-extra');
jest.mock('../../../.aios-core/core/orchestration/master-orchestrator');

const fs = require('fs-extra');
const MasterOrchestrator = require('../../../.aios-core/core/orchestration/master-orchestrator');

const {
  orchestrate,
  orchestrateStatus,
  orchestrateStop,
  orchestrateResume,
  commands,
} = require('../../../.aios-core/core/orchestration/cli-commands');

describe('cli-commands', () => {
  let consoleSpy;

  beforeEach(() => {
    jest.resetAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    fs.ensureDir.mockResolvedValue(undefined);
    fs.writeJson.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // ============================================================
  // exports
  // ============================================================
  describe('exports', () => {
    test('exports all command functions', () => {
      expect(typeof orchestrate).toBe('function');
      expect(typeof orchestrateStatus).toBe('function');
      expect(typeof orchestrateStop).toBe('function');
      expect(typeof orchestrateResume).toBe('function');
    });

    test('exports commands map', () => {
      expect(commands.orchestrate).toBe(orchestrate);
      expect(commands['orchestrate-status']).toBe(orchestrateStatus);
      expect(commands['orchestrate-stop']).toBe(orchestrateStop);
      expect(commands['orchestrate-resume']).toBe(orchestrateResume);
    });
  });

  // ============================================================
  // orchestrate
  // ============================================================
  describe('orchestrate', () => {
    test('returns error when no storyId', async () => {
      const result = await orchestrate(null);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(3);
      expect(result.error).toContain('Story ID');
    });

    test('returns error for empty storyId', async () => {
      const result = await orchestrate('');
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(3);
    });

    test('executes full pipeline successfully', async () => {
      const mockOrchestrator = {
        startDashboard: jest.fn().mockResolvedValue(undefined),
        stopDashboard: jest.fn(),
        executeFullPipeline: jest.fn().mockResolvedValue({
          success: true,
          epics: { executed: [3, 4, 6, 7] },
        }),
        on: jest.fn(),
        constructor: { EPIC_CONFIG: {} },
      };
      MasterOrchestrator.mockImplementation(() => mockOrchestrator);

      const result = await orchestrate('story-1', { projectRoot: '/project' });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(mockOrchestrator.executeFullPipeline).toHaveBeenCalled();
    });

    test('resumes from specific epic', async () => {
      const mockOrchestrator = {
        startDashboard: jest.fn().mockResolvedValue(undefined),
        stopDashboard: jest.fn(),
        resumeFromEpic: jest.fn().mockResolvedValue({
          success: true,
          epics: { executed: [4, 6, 7] },
        }),
        on: jest.fn(),
        constructor: { EPIC_CONFIG: {} },
      };
      MasterOrchestrator.mockImplementation(() => mockOrchestrator);

      const result = await orchestrate('story-1', { epic: 4, projectRoot: '/p' });

      expect(result.success).toBe(true);
      expect(mockOrchestrator.resumeFromEpic).toHaveBeenCalledWith(4);
    });

    test('handles blocked result', async () => {
      const mockOrchestrator = {
        startDashboard: jest.fn().mockResolvedValue(undefined),
        stopDashboard: jest.fn(),
        executeFullPipeline: jest.fn().mockResolvedValue({
          success: false,
          blocked: true,
        }),
        on: jest.fn(),
        constructor: { EPIC_CONFIG: {} },
      };
      MasterOrchestrator.mockImplementation(() => mockOrchestrator);

      const result = await orchestrate('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(2);
    });

    test('handles failed result', async () => {
      const mockOrchestrator = {
        startDashboard: jest.fn().mockResolvedValue(undefined),
        stopDashboard: jest.fn(),
        executeFullPipeline: jest.fn().mockResolvedValue({
          success: false,
          blocked: false,
        }),
        on: jest.fn(),
        constructor: { EPIC_CONFIG: {} },
      };
      MasterOrchestrator.mockImplementation(() => mockOrchestrator);

      const result = await orchestrate('story-1', { projectRoot: '/p' });

      expect(result.exitCode).toBe(1);
    });

    test('catches exceptions', async () => {
      MasterOrchestrator.mockImplementation(() => {
        throw new Error('init failed');
      });

      const result = await orchestrate('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.error).toBe('init failed');
    });

    test('delegates to dry run when flag set', async () => {
      const mockOrchestrator = {
        initialize: jest.fn().mockResolvedValue(undefined),
        executionState: {},
        constructor: {
          EPIC_CONFIG: {
            3: { name: 'Spec' },
            4: { name: 'Execute' },
            5: { name: 'Recovery', onDemand: true },
            6: { name: 'QA' },
            7: { name: 'Memory' },
          },
        },
      };
      MasterOrchestrator.mockImplementation(() => mockOrchestrator);

      const result = await orchestrate('story-1', { dryRun: true, projectRoot: '/p' });

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(mockOrchestrator.initialize).toHaveBeenCalled();
    });
  });

  // ============================================================
  // orchestrateStatus
  // ============================================================
  describe('orchestrateStatus', () => {
    test('returns error when no storyId', async () => {
      const result = await orchestrateStatus(null);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(3);
    });

    test('returns error when state not found', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await orchestrateStatus('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('State not found');
    });

    test('displays status for existing state', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({
        status: 'in_progress',
        currentEpic: 4,
        epics: {
          3: { status: 'completed' },
          4: { status: 'in_progress' },
        },
        startedAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T01:00:00Z',
        errors: [],
      });
      MasterOrchestrator.EPIC_CONFIG = {
        3: { name: 'Spec' },
        4: { name: 'Execute' },
      };

      const result = await orchestrateStatus('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(true);
      expect(result.state).toBeDefined();
    });

    test('catches read errors', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockRejectedValue(new Error('corrupt JSON'));

      const result = await orchestrateStatus('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('corrupt JSON');
    });
  });

  // ============================================================
  // orchestrateStop
  // ============================================================
  describe('orchestrateStop', () => {
    test('returns error when no storyId', async () => {
      const result = await orchestrateStop(null);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(3);
    });

    test('returns error when state not found', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await orchestrateStop('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('State not found');
    });

    test('stops orchestrator and updates state', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({
        status: 'in_progress',
        currentEpic: 4,
      });

      const result = await orchestrateStop('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ status: 'stopped' }),
        expect.any(Object),
      );
    });

    test('catches write errors', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({ status: 'in_progress' });
      fs.writeJson.mockRejectedValue(new Error('disk full'));

      const result = await orchestrateStop('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('disk full');
    });
  });

  // ============================================================
  // orchestrateResume
  // ============================================================
  describe('orchestrateResume', () => {
    test('returns error when no storyId', async () => {
      const result = await orchestrateResume(null);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(3);
    });

    test('returns error when state not found', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await orchestrateResume('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('State not found');
    });

    test('returns error when already completed', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({ status: 'complete' });

      const result = await orchestrateResume('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(2);
      expect(result.error).toContain('Already completed');
    });

    test('resumes from current epic', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({
        status: 'stopped',
        currentEpic: 4,
        epics: { 3: { status: 'completed' }, 4: { status: 'in_progress' } },
        updatedAt: '2025-01-01T00:00:00Z',
      });

      const mockOrchestrator = {
        startDashboard: jest.fn().mockResolvedValue(undefined),
        stopDashboard: jest.fn(),
        resumeFromEpic: jest.fn().mockResolvedValue({
          success: true,
          epics: { executed: [4, 6, 7] },
        }),
        on: jest.fn(),
        constructor: { EPIC_CONFIG: {} },
      };
      MasterOrchestrator.mockImplementation(() => mockOrchestrator);

      const result = await orchestrateResume('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(true);
      expect(mockOrchestrator.resumeFromEpic).toHaveBeenCalledWith(4);
    });

    test('finds next incomplete epic when current is completed', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({
        status: 'stopped',
        currentEpic: 3,
        epics: {
          3: { status: 'completed' },
          4: { status: 'completed' },
          6: { status: 'pending' },
        },
        updatedAt: '2025-01-01T00:00:00Z',
      });

      const mockOrchestrator = {
        startDashboard: jest.fn().mockResolvedValue(undefined),
        stopDashboard: jest.fn(),
        resumeFromEpic: jest.fn().mockResolvedValue({ success: true }),
        on: jest.fn(),
        constructor: { EPIC_CONFIG: {} },
      };
      MasterOrchestrator.mockImplementation(() => mockOrchestrator);

      await orchestrateResume('story-1', { projectRoot: '/p' });

      expect(mockOrchestrator.resumeFromEpic).toHaveBeenCalledWith(6);
    });

    test('catches exceptions during resume', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({
        status: 'stopped',
        currentEpic: 4,
        updatedAt: '2025-01-01',
      });

      MasterOrchestrator.mockImplementation(() => {
        throw new Error('orchestrator init failed');
      });

      const result = await orchestrateResume('story-1', { projectRoot: '/p' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator init failed');
    });
  });
});
