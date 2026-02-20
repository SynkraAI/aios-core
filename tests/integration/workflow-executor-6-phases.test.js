/**
 * WorkflowExecutor 6-Phase E2E Validation
 *
 * Story BOB-P0-1-VAL: Validates the complete 6-phase development cycle
 * executed by WorkflowExecutor with mocked dependencies.
 *
 * Phases tested:
 *   1. Validation (AC1)
 *   2. Development (AC2)
 *   3. Self-Healing (AC3)
 *   4. Quality Gate (AC4)
 *   5. Push (AC5)
 *   6. Checkpoint (AC6)
 *   + State Persistence (AC7)
 *   + Error Handling (AC8)
 *
 * @module tests/integration/workflow-executor-6-phases
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');

// Mock TerminalSpawner before requiring WorkflowExecutor
jest.mock('../../.aios-core/core/orchestration/terminal-spawner', () => ({
  isSpawnerAvailable: jest.fn().mockReturnValue(true),
  spawnAgent: jest.fn().mockResolvedValue({
    success: true,
    output: 'mock agent output',
    outputFile: '/tmp/mock-output.md',
    pid: 12345,
    duration: 1000,
  }),
}));

// Mock session-state to avoid schema validation / disk I/O
jest.mock('../../.aios-core/core/orchestration/session-state', () => {
  const ActionType = {
    GO: 'GO',
    PAUSE: 'PAUSE',
    REVIEW: 'REVIEW',
    ABORT: 'ABORT',
    PHASE_CHANGE: 'PHASE_CHANGE',
    EPIC_STARTED: 'EPIC_STARTED',
    STORY_STARTED: 'STORY_STARTED',
    STORY_COMPLETED: 'STORY_COMPLETED',
    CHECKPOINT_REACHED: 'CHECKPOINT_REACHED',
    ERROR_OCCURRED: 'ERROR_OCCURRED',
  };

  class SessionState {
    constructor() {
      this.state = null;
    }
    async exists() { return false; }
    async loadSessionState() { return null; }
    async updateSessionState() {}
    async clear() {}
  }

  return { SessionState, ActionType };
});

const {
  WorkflowExecutor,
  PhaseStatus,
  CheckpointDecision,
} = require('../../.aios-core/core/orchestration/workflow-executor');

const TerminalSpawner = require('../../.aios-core/core/orchestration/terminal-spawner');

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Builds a complete 6-phase workflow YAML string matching
 * the production development-cycle.yaml structure.
 */
function buildWorkflowYaml() {
  return yaml.dump({
    workflow: {
      id: 'development-cycle',
      name: 'Development Cycle (Test)',
      phases: {
        '1_validation': {
          id: 'validation',
          name: 'Story Validation',
          agent: '@po',
          task: 'validate-story-draft',
          on_success: '2_development',
          on_failure: 'reject_with_feedback',
        },
        '2_development': {
          id: 'development',
          name: 'Development',
          agent: '${story.executor}',
          task: 'develop',
          spawn_in_terminal: true,
          on_success: '3_self_healing',
          on_failure: 'return_to_po',
        },
        '3_self_healing': {
          id: 'self_healing',
          name: 'Self-Healing',
          agent: '@dev',
          task: 'self-heal',
          condition: '${config.coderabbit_integration.enabled} == true',
          config: { max_iterations: 2, severity_filter: ['CRITICAL', 'HIGH'] },
          on_success: '4_quality_gate',
          on_failure: '4_quality_gate',
          on_skip: '4_quality_gate',
        },
        '4_quality_gate': {
          id: 'quality_gate',
          name: 'Quality Gate',
          agent: '${story.quality_gate}',
          task: 'quality-review',
          spawn_in_terminal: true,
          on_success: '5_push',
          on_failure: 'return_to_development',
        },
        '5_push': {
          id: 'push',
          name: 'Push & PR',
          agent: '@devops',
          task: 'push-and-pr',
          spawn_in_terminal: true,
          on_success: '6_checkpoint',
          on_failure: 'return_to_quality_gate',
        },
        '6_checkpoint': {
          id: 'checkpoint',
          name: 'Story Checkpoint',
          agent: '@po',
          task: 'story-checkpoint',
          elicit: true,
        },
      },
      error_handlers: {
        reject_with_feedback: {
          description: 'Story rejected',
          actions: [{ log: 'Validation failed' }],
        },
        return_to_po: {
          description: 'Dev failed',
          actions: [{ log: 'Dev failed' }],
        },
        return_to_development: {
          description: 'QG failed, return to dev',
          actions: [
            { log: 'Quality gate failed' },
            { increment_attempt: true },
            { max_attempts: 3 },
          ],
        },
        return_to_quality_gate: {
          description: 'Push failed',
          actions: [{ log: 'Push failed' }],
        },
      },
    },
  });
}

/**
 * Builds a minimal story markdown with YAML frontmatter.
 */
function buildStoryFile(overrides = {}) {
  const meta = {
    executor: '@dev',
    quality_gate: '@architect',
    quality_gate_tools: ['code_review'],
    ...overrides,
  };
  return [
    '# Test Story',
    '',
    '```yaml',
    yaml.dump(meta).trim(),
    '```',
    '',
    '## Description',
    'Test story for 6-phase validation.',
  ].join('\n');
}

/**
 * Builds a core-config YAML string.
 */
function buildConfig(coderabbitEnabled = false) {
  return yaml.dump({
    coderabbit_integration: {
      enabled: coderabbitEnabled,
      self_healing: { max_iterations: 2, timeout_minutes: 5 },
      graceful_degradation: {
        skip_if_not_installed: true,
        fallback_message: 'CodeRabbit not available',
      },
    },
  });
}

// ─── Test Suite ─────────────────────────────────────────────────────

describe('WorkflowExecutor 6-Phase Validation (BOB-P0-1-VAL)', () => {
  let tempDir;
  let executor;
  let storyPath;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wf-6phase-'));

    // Create directory structure
    await fs.ensureDir(path.join(tempDir, '.aios-core/development/workflows'));
    await fs.ensureDir(path.join(tempDir, '.aios/workflow-state'));
    await fs.ensureDir(path.join(tempDir, '.aios-core'));

    // Write workflow YAML
    await fs.writeFile(
      path.join(tempDir, '.aios-core/development/workflows/development-cycle.yaml'),
      buildWorkflowYaml(),
    );

    // Write config
    await fs.writeFile(
      path.join(tempDir, '.aios-core/core-config.yaml'),
      buildConfig(false),
    );

    // Write story file
    storyPath = path.join(tempDir, 'test-story.story.md');
    await fs.writeFile(storyPath, buildStoryFile());

    // Create executor with session state disabled
    executor = new WorkflowExecutor(tempDir, {
      debug: false,
      saveState: true,
      useSessionState: false,
    });

    // Reset mocks
    TerminalSpawner.isSpawnerAvailable.mockReturnValue(true);
    TerminalSpawner.spawnAgent.mockResolvedValue({
      success: true,
      output: 'mock agent output',
      outputFile: '/tmp/mock-output.md',
      pid: 12345,
      duration: 1000,
    });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  // ── Phase 1: Validation (AC1) ──────────────────────────────────

  describe('Phase 1: Validation (AC1)', () => {
    it('should complete with valid story metadata', async () => {
      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor;
      executor.state.qualityGate = metadata.quality_gate;

      const result = await executor.executePhase('1_validation', storyPath, {});

      expect(result.status).toBe(PhaseStatus.COMPLETED);
      expect(result.validation_result.passed).toBe(true);
      expect(result.validation_result.issues).toEqual([]);
    });

    it('should fail when executor === quality_gate', async () => {
      // Write story with same agent for both roles
      const badStory = buildStoryFile({
        executor: '@dev',
        quality_gate: '@dev',
        quality_gate_tools: ['code_review'],
      });
      await fs.writeFile(storyPath, badStory);

      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor;
      executor.state.qualityGate = metadata.quality_gate;

      const result = await executor.executePhase('1_validation', storyPath, {});

      expect(result.status).toBe(PhaseStatus.FAILED);
      expect(result.validation_result.issues.length).toBeGreaterThan(0);
      expect(
        result.validation_result.issues.some((i) =>
          i.toLowerCase().includes('different') || i.toLowerCase().includes('same'),
        ),
      ).toBe(true);
    });
  });

  // ── Phase 2: Development (AC2) ─────────────────────────────────

  describe('Phase 2: Development (AC2)', () => {
    it('should assign correct executor and spawn terminal', async () => {
      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor;
      executor.state.qualityGate = metadata.quality_gate;

      const result = await executor.executePhase('2_development', storyPath, {});

      expect(result.status).toBe(PhaseStatus.COMPLETED);
      expect(TerminalSpawner.spawnAgent).toHaveBeenCalledWith(
        'dev', // @dev without @
        'develop',
        expect.objectContaining({
          timeout: expect.any(Number),
        }),
      );
    });

    it('should handle terminal spawn failure gracefully', async () => {
      TerminalSpawner.spawnAgent.mockResolvedValue({
        success: false,
        output: '',
        outputFile: '',
        pid: null,
        duration: 500,
        error: 'Terminal not available',
      });

      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor;
      executor.state.qualityGate = metadata.quality_gate;

      const result = await executor.executePhase('2_development', storyPath, {});

      expect(result.status).toBe(PhaseStatus.FAILED);
    });
  });

  // ── Phase 3: Self-Healing (AC3) ────────────────────────────────

  describe('Phase 3: Self-Healing (AC3)', () => {
    it('should skip when CodeRabbit disabled', async () => {
      // Config already has coderabbit disabled (default)
      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor;
      executor.state.qualityGate = metadata.quality_gate;

      const result = await executor.executePhase('3_self_healing', storyPath, {});

      expect(result.status).toBe(PhaseStatus.SKIPPED);
      expect(result.reason).toContain('Condition not met');
    });

    it('should execute when CodeRabbit enabled', async () => {
      // Rewrite config with coderabbit enabled + graceful degradation
      await fs.writeFile(
        path.join(tempDir, '.aios-core/core-config.yaml'),
        yaml.dump({
          coderabbit_integration: {
            enabled: true,
            self_healing: { max_iterations: 2, timeout_minutes: 1 },
            graceful_degradation: {
              skip_if_not_installed: true,
              fallback_message: 'CodeRabbit not available',
            },
          },
        }),
      );

      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor;
      executor.state.qualityGate = metadata.quality_gate;

      // Mock runCodeRabbitAnalysis to simulate CLI not installed (graceful degradation)
      executor.runCodeRabbitAnalysis = jest.fn().mockResolvedValue({
        success: false,
        error: 'CodeRabbit CLI not installed',
        issues: [],
      });

      const result = await executor.executePhase('3_self_healing', storyPath, {});

      // Should complete via graceful degradation (CodeRabbit not installed)
      expect(result.status).toBe(PhaseStatus.COMPLETED);
      expect(result.healed_code).toBeDefined();
      expect(result.healed_code.note).toContain('CodeRabbit CLI not installed');
      expect(executor.runCodeRabbitAnalysis).toHaveBeenCalled();
    });
  });

  // ── Phase 4: Quality Gate (AC4) ────────────────────────────────

  describe('Phase 4: Quality Gate (AC4)', () => {
    it('should use different agent than executor', async () => {
      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor; // @dev
      executor.state.qualityGate = metadata.quality_gate; // @architect

      const result = await executor.executePhase('4_quality_gate', storyPath, {});

      expect(result.status).toBe(PhaseStatus.COMPLETED);
      // Verify spawnAgent was called with quality_gate agent, not executor
      const spawnCalls = TerminalSpawner.spawnAgent.mock.calls;
      const qgCall = spawnCalls.find((c) => c[1] === 'quality-review');
      expect(qgCall).toBeDefined();
      expect(qgCall[0]).toBe('architect'); // @architect without @
    });

    it('should fail when quality gate agent equals executor', async () => {
      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      // Force executor and quality gate to be the same
      executor.state.executor = '@dev';
      executor.state.qualityGate = '@dev';

      // The phase resolves quality_gate via resolveAgent → state.qualityGate
      // But executeQualityGatePhase checks agent === this.state.executor
      const result = await executor.executePhase('4_quality_gate', storyPath, {});

      expect(result.status).toBe(PhaseStatus.FAILED);
      expect(result.error).toContain('different');
    });
  });

  // ── Phase 5: Push (AC5) ────────────────────────────────────────

  describe('Phase 5: Push (AC5)', () => {
    it('should delegate to @devops', async () => {
      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor;
      executor.state.qualityGate = metadata.quality_gate;

      const result = await executor.executePhase('5_push', storyPath, {});

      expect(result.status).toBe(PhaseStatus.COMPLETED);
      const pushCall = TerminalSpawner.spawnAgent.mock.calls.find(
        (c) => c[1] === 'push-and-pr',
      );
      expect(pushCall).toBeDefined();
      expect(pushCall[0]).toBe('devops'); // @devops without @
    });

    it('should handle push failure', async () => {
      TerminalSpawner.spawnAgent.mockResolvedValue({
        success: false,
        output: 'push rejected',
        outputFile: '',
        pid: null,
        duration: 200,
        error: 'Push rejected by remote',
      });

      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor;
      executor.state.qualityGate = metadata.quality_gate;

      const result = await executor.executePhase('5_push', storyPath, {});

      expect(result.status).toBe(PhaseStatus.FAILED);
    });
  });

  // ── Phase 6: Checkpoint (AC6) ──────────────────────────────────

  describe('Phase 6: Checkpoint (AC6)', () => {
    it('should return GO/PAUSE/REVIEW/ABORT options', async () => {
      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor;
      executor.state.qualityGate = metadata.quality_gate;

      const result = await executor.executePhase('6_checkpoint', storyPath, {});

      expect(result.status).toBe(PhaseStatus.COMPLETED);
      expect(result.options).toBeDefined();
      expect(Object.keys(result.options)).toEqual(
        expect.arrayContaining(['GO', 'PAUSE', 'ABORT']),
      );
    });

    it('should route correctly per decision', async () => {
      await executor.loadWorkflow();

      // GO → loop back to 1_validation
      const goResult = executor.getNextPhase('6_checkpoint', {
        status: PhaseStatus.COMPLETED,
        decision: CheckpointDecision.GO,
      });
      expect(goResult).toBe('1_validation');

      // PAUSE → workflow_paused
      const pauseResult = executor.getNextPhase('6_checkpoint', {
        status: PhaseStatus.COMPLETED,
        decision: CheckpointDecision.PAUSE,
      });
      expect(pauseResult).toBe('workflow_paused');

      // ABORT → workflow_aborted
      const abortResult = executor.getNextPhase('6_checkpoint', {
        status: PhaseStatus.COMPLETED,
        decision: CheckpointDecision.ABORT,
      });
      expect(abortResult).toBe('workflow_aborted');

      // REVIEW → stay at checkpoint
      const reviewResult = executor.getNextPhase('6_checkpoint', {
        status: PhaseStatus.COMPLETED,
        decision: CheckpointDecision.REVIEW,
      });
      expect(reviewResult).toBe('6_checkpoint');
    });
  });

  // ── State Persistence (AC7) ────────────────────────────────────

  describe('State Persistence (AC7)', () => {
    it('should persist state after each phase via saveState', async () => {
      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor;
      executor.state.qualityGate = metadata.quality_gate;

      // Execute Phase 1
      const result = await executor.executePhase('1_validation', storyPath, {});
      executor.state.phaseResults['1_validation'] = result;
      await executor.saveState();

      // Verify state file exists
      const stateFile = executor.getStateFilePath(storyPath);
      const exists = await fs.pathExists(stateFile);
      expect(exists).toBe(true);

      // Verify state content
      const content = await fs.readFile(stateFile, 'utf8');
      const saved = yaml.load(content);
      expect(saved.phaseResults['1_validation']).toBeDefined();
      expect(saved.phaseResults['1_validation'].status).toBe(PhaseStatus.COMPLETED);
    });

    it('should resume from persisted state', async () => {
      // Pre-seed a state file as if Phase 1 already completed
      const stateDir = path.join(tempDir, '.aios/workflow-state');
      await fs.ensureDir(stateDir);

      const seededState = {
        workflowId: 'development-cycle',
        currentPhase: '2_development',
        currentStory: storyPath,
        executor: '@dev',
        qualityGate: '@architect',
        attemptCount: 0,
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        phaseResults: {
          '1_validation': {
            status: 'completed',
            validation_result: { passed: true, score: 100, issues: [] },
          },
        },
        accumulatedContext: { validatedAt: new Date().toISOString() },
      };

      const stateFile = path.join(stateDir, 'test-story-state.yaml');
      await fs.writeFile(stateFile, yaml.dump(seededState));

      // Create executor with autoResume enabled
      const resumeExecutor = new WorkflowExecutor(tempDir, {
        debug: false,
        saveState: true,
        autoResume: true,
        useSessionState: false,
      });

      await resumeExecutor.initializeState(storyPath);

      // Should have resumed from Phase 2
      expect(resumeExecutor.state.currentPhase).toBe('2_development');
      expect(resumeExecutor.state.phaseResults['1_validation']).toBeDefined();
      expect(resumeExecutor.state.phaseResults['1_validation'].status).toBe('completed');
    });
  });

  // ── Error Handling (AC8) ───────────────────────────────────────

  describe('Error Handling (AC8)', () => {
    it('should set FAILED status with error message on unknown phase', async () => {
      await executor.loadWorkflow();
      await executor.loadConfig();
      await executor.initializeState(storyPath);

      const metadata = await executor.readStoryMetadata(storyPath);
      executor.state.executor = metadata.executor;
      executor.state.qualityGate = metadata.quality_gate;

      const result = await executor.executePhase('99_nonexistent', storyPath, {});

      expect(result.status).toBe(PhaseStatus.FAILED);
      expect(result.error).toContain('Phase not found');
    });

    it('should retry within max_attempts via error handler', async () => {
      await executor.loadWorkflow();

      // Simulate return_to_development handler with attempts left
      executor.state = {
        attemptCount: 1,
        phaseResults: {},
      };

      const handlerResult = await executor.handleError('return_to_development', {
        status: PhaseStatus.FAILED,
        error: 'Quality gate failed',
      });

      expect(handlerResult.nextPhase).toBe('2_development');

      // Simulate max attempts reached
      executor.state.attemptCount = 3;
      const maxResult = await executor.handleError('return_to_development', {
        status: PhaseStatus.FAILED,
        error: 'Quality gate failed again',
      });

      expect(maxResult.retry).toBe(false);
      expect(maxResult.escalate).toBe(true);
    });
  });

  // ── Full E2E: All 6 Phases in Sequence ─────────────────────────

  describe('Full E2E: All 6 Phases in Sequence', () => {
    it('should execute complete workflow with mocked agents', async () => {
      // Clear all mock call history from prior tests
      TerminalSpawner.spawnAgent.mockClear();
      TerminalSpawner.isSpawnerAvailable.mockClear();

      // Track phase changes via callback
      const phaseChanges = [];
      executor.onPhaseChange((phase, storyId, agent) => {
        phaseChanges.push({ phase, storyId, agent });
      });

      // Override checkpoint to return PAUSE (prevents infinite loop from GO)
      const originalCheckpoint = executor.executeCheckpointPhase.bind(executor);
      executor.executeCheckpointPhase = async (phase, agent, sp) => {
        const base = await originalCheckpoint(phase, agent, sp);
        return { ...base, decision: CheckpointDecision.PAUSE };
      };

      const result = await executor.execute(storyPath, {});

      // Workflow should succeed
      expect(result.success).toBe(true);

      // All 6 phases should have results (Phase 3 may be skipped)
      expect(result.phaseResults['1_validation']).toBeDefined();
      expect(result.phaseResults['1_validation'].status).toBe(PhaseStatus.COMPLETED);

      expect(result.phaseResults['2_development']).toBeDefined();
      expect(result.phaseResults['2_development'].status).toBe(PhaseStatus.COMPLETED);

      expect(result.phaseResults['3_self_healing']).toBeDefined();
      expect(result.phaseResults['3_self_healing'].status).toBe(PhaseStatus.SKIPPED);

      expect(result.phaseResults['4_quality_gate']).toBeDefined();
      expect(result.phaseResults['4_quality_gate'].status).toBe(PhaseStatus.COMPLETED);

      expect(result.phaseResults['5_push']).toBeDefined();
      expect(result.phaseResults['5_push'].status).toBe(PhaseStatus.COMPLETED);

      expect(result.phaseResults['6_checkpoint']).toBeDefined();
      expect(result.phaseResults['6_checkpoint'].status).toBe(PhaseStatus.COMPLETED);

      // Phase callbacks: 5 emitted (Phase 3 skipped before callback — condition check)
      expect(phaseChanges.length).toBe(5);
      expect(phaseChanges.map((p) => p.phase)).toEqual([
        '1_validation',
        '2_development',
        // '3_self_healing' — skipped before callback (condition not met)
        '4_quality_gate',
        '5_push',
        '6_checkpoint',
      ]);

      // Verify terminal spawner was called for phases 2, 4, 5
      const spawnCalls = TerminalSpawner.spawnAgent.mock.calls;
      expect(spawnCalls.length).toBe(3);
      expect(spawnCalls[0][0]).toBe('dev');      // Phase 2: @dev
      expect(spawnCalls[1][0]).toBe('architect');   // Phase 4: @architect
      expect(spawnCalls[2][0]).toBe('devops');    // Phase 5: @devops

      // State file should exist
      const stateFile = executor.getStateFilePath(storyPath);
      const stateExists = await fs.pathExists(stateFile);
      expect(stateExists).toBe(true);
    }, 15000);
  });
});
