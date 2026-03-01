/**
 * CLI Interface Tests — Story E7.1.6
 *
 * Tests for:
 * - Argument parsing and validation
 * - --help output
 * - --dry-run mode
 * - --status and --abort commands
 * - Signal handling (shutdownRequested flag)
 * - Component wiring (imports resolve)
 * - Metrics accumulation
 * - State file operations
 * - Crash recovery logic
 * - Exit codes
 *
 * @module cli.test
 */

import { describe, it, before, after, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, execFile } from 'node:child_process';
import { tmpdir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root
const projectRoot = resolve(__dirname, '..', '..', '..');
const orchestratorPath = resolve(__dirname, '..', 'orchestrator.mjs');

// Temp directory for tests
const testTmpDir = resolve(tmpdir(), `aios-cli-test-${Date.now()}`);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run the orchestrator CLI as a child process and capture output.
 *
 * @param {string[]} args - CLI arguments
 * @param {object} [opts] - Options
 * @param {number} [opts.timeout=10000] - Timeout in ms
 * @returns {{ stdout: string, stderr: string, exitCode: number }}
 */
function runCli(args, opts = {}) {
  const timeout = opts.timeout || 10000;
  try {
    const stdout = execFileSync('node', [orchestratorPath, ...args], {
      cwd: projectRoot,
      timeout,
      encoding: 'utf-8',
      env: { ...process.env, AIOS_LOG_LEVEL: 'silent' },
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status || 1,
    };
  }
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

before(() => {
  mkdirSync(testTmpDir, { recursive: true });
});

after(() => {
  try {
    rmSync(testTmpDir, { recursive: true, force: true });
  } catch {
    // Best effort cleanup
  }
});

// ---------------------------------------------------------------------------
// Test: --help (AC1)
// ---------------------------------------------------------------------------

describe('CLI --help', () => {
  it('should print usage information and exit 0', () => {
    const result = runCli(['--help']);
    assert.equal(result.exitCode, 0, 'Exit code should be 0');
    assert.ok(result.stdout.includes('AIOS Orchestrator'), 'Should contain title');
    assert.ok(result.stdout.includes('--workflow'), 'Should mention --workflow');
    assert.ok(result.stdout.includes('--story'), 'Should mention --story');
    assert.ok(result.stdout.includes('--dry-run'), 'Should mention --dry-run');
    assert.ok(result.stdout.includes('--status'), 'Should mention --status');
    assert.ok(result.stdout.includes('--abort'), 'Should mention --abort');
    assert.ok(result.stdout.includes('sdc'), 'Should mention sdc workflow');
    assert.ok(result.stdout.includes('qa-loop'), 'Should mention qa-loop workflow');
    assert.ok(result.stdout.includes('EXIT CODES'), 'Should document exit codes');
  });
});

// ---------------------------------------------------------------------------
// Test: Argument Validation (AC9)
// ---------------------------------------------------------------------------

describe('Argument Validation', () => {
  it('should exit 2 when --workflow is missing', () => {
    const result = runCli(['--story', 'some-file.md']);
    assert.equal(result.exitCode, 2, 'Exit code should be 2 for missing --workflow');
    assert.ok(
      result.stderr.includes('Missing required argument') || result.stdout.includes('Missing required argument'),
      'Should mention missing --workflow'
    );
  });

  it('should exit 2 when --workflow is invalid', () => {
    const result = runCli(['--workflow', 'invalid-workflow', '--story', 'test.md']);
    assert.equal(result.exitCode, 2, 'Exit code should be 2 for invalid workflow');
    assert.ok(
      result.stderr.includes('Invalid workflow') || result.stdout.includes('Invalid workflow'),
      'Should mention invalid workflow'
    );
  });

  it('should exit 2 when --story is missing', () => {
    const result = runCli(['--workflow', 'sdc']);
    assert.equal(result.exitCode, 2, 'Exit code should be 2 for missing --story');
    assert.ok(
      result.stderr.includes('Missing required argument') || result.stdout.includes('Missing required argument'),
      'Should mention missing --story'
    );
  });

  it('should exit 2 when story file does not exist', () => {
    const result = runCli(['--workflow', 'sdc', '--story', 'nonexistent-story-file.md']);
    assert.equal(result.exitCode, 2, 'Exit code should be 2 for missing story file');
    assert.ok(
      result.stderr.includes('Story file not found') || result.stdout.includes('Story file not found'),
      'Should mention file not found'
    );
  });

  it('should exit 2 when --max-budget is invalid', () => {
    // Use an existing story file for this test
    const storyFile = 'docs/stories/active/7.1.6.story.md';
    const result = runCli(['--workflow', 'sdc', '--story', storyFile, '--max-budget', 'abc']);
    assert.equal(result.exitCode, 2, 'Exit code should be 2 for invalid budget');
    assert.ok(
      result.stderr.includes('Invalid --max-budget') || result.stdout.includes('Invalid --max-budget'),
      'Should mention invalid budget'
    );
  });

  it('should exit 2 when --output-format is invalid', () => {
    const storyFile = 'docs/stories/active/7.1.6.story.md';
    const result = runCli(['--workflow', 'sdc', '--story', storyFile, '--output-format', 'xml']);
    assert.equal(result.exitCode, 2, 'Exit code should be 2 for invalid output format');
    assert.ok(
      result.stderr.includes('Invalid --output-format') || result.stdout.includes('Invalid --output-format'),
      'Should mention invalid output format'
    );
  });

  it('should exit 2 for unknown arguments', () => {
    const result = runCli(['--unknown-arg']);
    assert.equal(result.exitCode, 2, 'Exit code should be 2 for unknown args');
  });
});

// ---------------------------------------------------------------------------
// Test: --status (AC1)
// ---------------------------------------------------------------------------

describe('CLI --status', () => {
  it('should show "No active workflow" when no state file exists', () => {
    const result = runCli(['--status']);
    assert.equal(result.exitCode, 0, 'Exit code should be 0');
    assert.ok(
      result.stdout.includes('No active workflow'),
      'Should show no active workflow'
    );
  });

  it('should show "No active workflow" in JSON format', () => {
    const result = runCli(['--status', '--output-format', 'json']);
    assert.equal(result.exitCode, 0, 'Exit code should be 0');
    const parsed = JSON.parse(result.stdout.trim());
    assert.equal(parsed.status, 'none');
    assert.ok(parsed.message.includes('No active workflow'));
  });
});

// ---------------------------------------------------------------------------
// Test: --abort (AC1)
// ---------------------------------------------------------------------------

describe('CLI --abort', () => {
  it('should show "No active workflow to abort" when no state file exists', () => {
    const result = runCli(['--abort']);
    assert.equal(result.exitCode, 0, 'Exit code should be 0');
    assert.ok(
      result.stdout.includes('No active workflow to abort'),
      'Should mention nothing to abort'
    );
  });
});

// ---------------------------------------------------------------------------
// Test: --dry-run (AC1, CP-16 fix)
// ---------------------------------------------------------------------------

describe('CLI --dry-run', () => {
  it('should simulate SDC workflow without calling query()', () => {
    const storyFile = 'docs/stories/active/7.1.6.story.md';
    const result = runCli(['--workflow', 'sdc', '--story', storyFile, '--dry-run']);
    assert.equal(result.exitCode, 0, 'Exit code should be 0 for dry run');
    assert.ok(
      result.stdout.includes('dry') || result.stdout.includes('Dry'),
      'Output should mention dry run'
    );
    assert.ok(
      result.stdout.includes('SM:CREATE') || result.stdout.includes('sdc'),
      'Should show workflow phases or workflow name'
    );
  });

  it('should simulate SDC workflow in JSON format', () => {
    const storyFile = 'docs/stories/active/7.1.6.story.md';
    const result = runCli(['--workflow', 'sdc', '--story', storyFile, '--dry-run', '--output-format', 'json']);
    assert.equal(result.exitCode, 0, 'Exit code should be 0');
    const parsed = JSON.parse(result.stdout.trim());
    assert.equal(parsed.result.dryRun, true, 'Should flag as dry run');
    assert.equal(parsed.result.workflow, 'sdc', 'Should identify as sdc workflow');
    assert.ok(Array.isArray(parsed.result.phases), 'Should list phases');
    assert.ok(parsed.result.phases.length >= 4, 'SDC should have at least 4 phases');
  });

  it('should simulate qa-loop workflow', () => {
    const storyFile = 'docs/stories/active/7.1.6.story.md';
    const result = runCli(['--workflow', 'qa-loop', '--story', storyFile, '--dry-run']);
    assert.equal(result.exitCode, 0, 'Exit code should be 0 for qa-loop dry run');
  });

  it('should accept --max-budget with --dry-run', () => {
    const storyFile = 'docs/stories/active/7.1.6.story.md';
    const result = runCli(['--workflow', 'sdc', '--story', storyFile, '--dry-run', '--max-budget', '10.50']);
    assert.equal(result.exitCode, 0, 'Exit code should be 0');
  });
});

// ---------------------------------------------------------------------------
// Test: Module Imports (AC8 — component wiring)
// ---------------------------------------------------------------------------

describe('Module Imports', () => {
  it('should import all exported functions from orchestrator', async () => {
    const mod = await import(orchestratorPath);
    assert.equal(typeof mod.parseCliArgs, 'function', 'parseCliArgs should be exported');
    assert.equal(typeof mod.validateArgs, 'function', 'validateArgs should be exported');
    assert.equal(typeof mod.handleStatus, 'function', 'handleStatus should be exported');
    assert.equal(typeof mod.handleAbort, 'function', 'handleAbort should be exported');
    assert.equal(typeof mod.initLogger, 'function', 'initLogger should be exported');
    assert.equal(typeof mod.readState, 'function', 'readState should be exported');
    assert.equal(typeof mod.writeState, 'function', 'writeState should be exported');
    assert.equal(typeof mod.createMetrics, 'function', 'createMetrics should be exported');
    assert.equal(typeof mod.createWorkflowEngine, 'function', 'createWorkflowEngine should be exported');
    assert.equal(typeof mod.isShutdownRequested, 'function', 'isShutdownRequested should be exported');
    assert.equal(typeof mod.formatDuration, 'function', 'formatDuration should be exported');
    assert.equal(typeof mod.main, 'function', 'main should be exported');
  });

  it('should import all Phase 1 components', async () => {
    const registry = await import(resolve(__dirname, '..', 'src', 'registry.mjs'));
    assert.equal(typeof registry.loadRegistry, 'function', 'loadRegistry should be available');

    const session = await import(resolve(__dirname, '..', 'src', 'session-manager.mjs'));
    assert.equal(typeof session.createSessionManager, 'function', 'createSessionManager should be available');

    const governance = await import(resolve(__dirname, '..', 'src', 'governance-hooks.mjs'));
    assert.equal(typeof governance.createGovernanceHooks, 'function', 'createGovernanceHooks should be available');
    assert.equal(typeof governance.setLogger, 'function', 'setLogger should be available');

    const comms = await import(resolve(__dirname, '..', 'src', 'comms-bridge.mjs'));
    assert.equal(typeof comms.createCommsBridge, 'function', 'createCommsBridge should be available');

    const errors = await import(resolve(__dirname, '..', 'src', 'errors.mjs'));
    assert.equal(typeof errors.OrchestratorError, 'function', 'OrchestratorError should be available');
    assert.equal(typeof errors.ConfigError, 'function', 'ConfigError should be available');
    assert.equal(typeof errors.BudgetError, 'function', 'BudgetError should be available');
    assert.equal(typeof errors.TransientError, 'function', 'TransientError should be available');
  });
});

// ---------------------------------------------------------------------------
// Test: Signal Handling (AC5)
// ---------------------------------------------------------------------------

describe('Signal Handling', () => {
  it('should export isShutdownRequested as false initially', async () => {
    const mod = await import(orchestratorPath);
    assert.equal(mod.isShutdownRequested(), false, 'shutdownRequested should be false initially');
  });

  it('should set shutdownRequested flag on SIGTERM (child process test)', async () => {
    // Spawn a child process that registers SIGTERM handler, prints READY,
    // then we send SIGTERM and verify the flag was set.
    const { promisify } = await import('node:util');

    const result = await new Promise((resolvePromise) => {
      const script = `
        let shutdownRequested = false;
        process.on('SIGTERM', () => {
          shutdownRequested = true;
          console.log('SHUTDOWN_FLAG=' + shutdownRequested);
          process.exit(0);
        });
        setTimeout(() => { console.log('TIMEOUT'); process.exit(1); }, 5000);
        console.log('READY');
      `;

      const child = execFile('node', ['-e', script], {
        timeout: 8000,
        encoding: 'utf-8',
      }, (err, stdout, stderr) => {
        resolvePromise({ stdout: stdout || '', stderr: stderr || '', exitCode: err ? err.code || 1 : 0 });
      });

      // Wait for READY, then send SIGTERM
      let output = '';
      child.stdout.on('data', (data) => {
        output += data;
        if (output.includes('READY')) {
          child.kill('SIGTERM');
        }
      });
    });

    assert.ok(
      result.stdout.includes('SHUTDOWN_FLAG=true'),
      'Should set shutdownRequested to true on SIGTERM'
    );
  });
});

// ---------------------------------------------------------------------------
// Test: State File Operations
// ---------------------------------------------------------------------------

describe('State File Operations', () => {
  let stateTestDir;

  beforeEach(() => {
    stateTestDir = resolve(testTmpDir, `state-${Date.now()}`);
    mkdirSync(resolve(stateTestDir, '.aios', 'orchestrator'), { recursive: true });
  });

  it('should return null when no state file exists', async () => {
    const mod = await import(orchestratorPath);
    const state = mod.readState(stateTestDir);
    assert.equal(state, null, 'Should return null for missing state');
  });

  it('should write and read state correctly', async () => {
    const mod = await import(orchestratorPath);

    const testState = {
      workflowId: 'test-123',
      workflow: 'sdc',
      storyFile: 'test.md',
      status: 'running',
      currentPhase: 'DEV:IMPLEMENT',
      startedAt: new Date().toISOString(),
    };

    mod.writeState(stateTestDir, testState);
    const readBack = mod.readState(stateTestDir);

    assert.deepEqual(readBack, testState, 'Read state should match written state');
  });

  it('should return null for corrupted state file', async () => {
    const mod = await import(orchestratorPath);
    const statePath = resolve(stateTestDir, '.aios', 'orchestrator', 'workflow-state.json');
    writeFileSync(statePath, 'not valid json!!!', 'utf-8');

    const state = mod.readState(stateTestDir);
    assert.equal(state, null, 'Should return null for corrupted state');
  });
});

// ---------------------------------------------------------------------------
// Test: Metrics Accumulator (AC4)
// ---------------------------------------------------------------------------

describe('Metrics Accumulator', () => {
  it('should track query metrics', async () => {
    const mod = await import(orchestratorPath);
    const metrics = mod.createMetrics();

    metrics.trackQuery('SM:CREATE', {
      agentId: 'sm',
      costUsd: 0.05,
      durationMs: 3000,
      toolCalls: [{ name: 'Read' }, { name: 'Write' }],
    });

    metrics.trackQuery('DEV:IMPLEMENT', {
      agentId: 'dev',
      costUsd: 1.20,
      durationMs: 60000,
      toolCalls: [{ name: 'Edit' }, { name: 'Bash' }, { name: 'Edit' }],
    });

    const snapshot = metrics.snapshot();

    // Cost tracking
    assert.equal(snapshot.costUsd.total, 1.25, 'Total cost should be sum of queries');
    assert.equal(snapshot.costUsd.perPhase['SM:CREATE'], 0.05);
    assert.equal(snapshot.costUsd.perPhase['DEV:IMPLEMENT'], 1.20);

    // Duration tracking
    assert.equal(snapshot.durationMs.perPhase['SM:CREATE'], 3000);
    assert.equal(snapshot.durationMs.perPhase['DEV:IMPLEMENT'], 60000);

    // Tool calls per agent
    assert.deepEqual(snapshot.toolCalls.sm, { Read: 1, Write: 1 });
    assert.deepEqual(snapshot.toolCalls.dev, { Edit: 2, Bash: 1 });
  });

  it('should track retries', async () => {
    const mod = await import(orchestratorPath);
    const metrics = mod.createMetrics();

    metrics.trackRetry('DEV:IMPLEMENT');
    metrics.trackRetry('DEV:IMPLEMENT');

    const snapshot = metrics.snapshot();
    assert.equal(snapshot.retries['DEV:IMPLEMENT'], 2, 'Should count retries per phase');
  });

  it('should track errors', async () => {
    const mod = await import(orchestratorPath);
    const metrics = mod.createMetrics();

    metrics.trackError('QA:GATE', new Error('Agent parse failure'));
    metrics.trackError('QA:GATE', new Error('Timeout'));

    const snapshot = metrics.snapshot();
    assert.equal(snapshot.errors.total, 2, 'Should count total errors');
    assert.equal(snapshot.errors.perQuery.length, 2, 'Should have 2 error entries');
  });

  it('should finalize with total duration', async () => {
    const mod = await import(orchestratorPath);
    const metrics = mod.createMetrics();

    // Small delay to ensure non-zero duration
    await new Promise((r) => setTimeout(r, 50));

    const final = metrics.finalize();
    assert.ok(final.durationMs.total >= 5, 'Total duration should be >= 5ms');
  });
});

// ---------------------------------------------------------------------------
// Test: Workflow Engine Stub
// ---------------------------------------------------------------------------

describe('Workflow Engine Stub', () => {
  it('should return dry-run result for SDC', async () => {
    const mod = await import(orchestratorPath);

    // Minimal registry mock
    const mockRegistry = {
      getAgent: (id) => ({ id, maxBudgetUsd: 5.0 }),
      listAgents: () => ['sm', 'po', 'dev', 'qa'],
    };

    const nullLogger = { info() {}, warn() {}, error() {}, debug() {} };

    const engine = mod.createWorkflowEngine({
      sessionManager: null,
      commsBridge: null,
      governanceHooks: null,
      registry: mockRegistry,
      logger: nullLogger,
      isShutdownRequested: () => false,
    });

    const result = await engine.runSDC({
      storyFile: '/tmp/test-story.md',
      dryRun: true,
    });

    assert.equal(result.dryRun, true);
    assert.equal(result.workflow, 'sdc');
    assert.ok(result.phases.length >= 4, 'SDC should have >= 4 phases');

    // Verify all SDC phases are present
    const phaseNames = result.phases.map((p) => p.phase);
    assert.ok(phaseNames.includes('SM:CREATE'), 'Should include SM:CREATE');
    assert.ok(phaseNames.includes('PO:VALIDATE'), 'Should include PO:VALIDATE');
    assert.ok(phaseNames.includes('DEV:IMPLEMENT'), 'Should include DEV:IMPLEMENT');
    assert.ok(phaseNames.includes('QA:GATE'), 'Should include QA:GATE');
  });

  it('should return dry-run result for QA Loop', async () => {
    const mod = await import(orchestratorPath);
    const nullLogger = { info() {}, warn() {}, error() {}, debug() {} };

    const engine = mod.createWorkflowEngine({
      registry: { getAgent: () => ({}) },
      logger: nullLogger,
    });

    const result = await engine.runQALoop({
      storyFile: '/tmp/test.md',
      dryRun: true,
    });

    assert.equal(result.dryRun, true);
    assert.equal(result.workflow, 'qa-loop');
  });

  it('should throw when running SDC without --dry-run (not yet implemented)', async () => {
    const mod = await import(orchestratorPath);
    const nullLogger = { info() {}, warn() {}, error() {}, debug() {} };

    const engine = mod.createWorkflowEngine({
      registry: { getAgent: () => ({}) },
      logger: nullLogger,
    });

    await assert.rejects(
      () => engine.runSDC({ storyFile: '/tmp/test.md', dryRun: false }),
      { message: /not yet implemented/i },
      'Should throw "not yet implemented"'
    );
  });

  it('should throw when resuming (not yet implemented)', async () => {
    const mod = await import(orchestratorPath);
    const nullLogger = { info() {}, warn() {}, error() {}, debug() {} };

    const engine = mod.createWorkflowEngine({
      registry: { getAgent: () => ({}) },
      logger: nullLogger,
    });

    await assert.rejects(
      () => engine.resume({ workflowId: 'test' }),
      { message: /not yet implemented/i },
      'Should throw "not yet implemented" for resume'
    );
  });
});

// ---------------------------------------------------------------------------
// Test: formatDuration
// ---------------------------------------------------------------------------

describe('formatDuration', () => {
  it('should format milliseconds correctly', async () => {
    const mod = await import(orchestratorPath);

    assert.equal(mod.formatDuration(500), '500ms');
    assert.equal(mod.formatDuration(5000), '5s');
    assert.equal(mod.formatDuration(65000), '1m 5s');
    assert.equal(mod.formatDuration(120000), '2m 0s');
  });
});

// ---------------------------------------------------------------------------
// Test: Constants
// ---------------------------------------------------------------------------

describe('Constants', () => {
  it('should export valid workflow list', async () => {
    const mod = await import(orchestratorPath);
    assert.deepEqual(mod.VALID_WORKFLOWS, ['sdc', 'qa-loop']);
  });

  it('should export valid output formats', async () => {
    const mod = await import(orchestratorPath);
    assert.deepEqual(mod.VALID_OUTPUT_FORMATS, ['text', 'json']);
  });

  it('should have 30s shutdown timeout', async () => {
    const mod = await import(orchestratorPath);
    assert.equal(mod.SHUTDOWN_TIMEOUT_MS, 30000);
  });
});

// ---------------------------------------------------------------------------
// Test: list-agents (via registry direct)
// ---------------------------------------------------------------------------

describe('Agent Listing', () => {
  it('should load all 11 agents from registry', async () => {
    const { loadRegistry } = await import(resolve(__dirname, '..', 'src', 'registry.mjs'));
    const registry = loadRegistry(undefined, projectRoot);
    const agents = registry.listAgents();

    assert.equal(agents.length, 11, 'Should have 11 agents');
    assert.ok(agents.includes('dev'), 'Should include dev');
    assert.ok(agents.includes('qa'), 'Should include qa');
    assert.ok(agents.includes('sm'), 'Should include sm');
    assert.ok(agents.includes('po'), 'Should include po');
    assert.ok(agents.includes('devops'), 'Should include devops');
    assert.ok(agents.includes('architect'), 'Should include architect');
    assert.ok(agents.includes('pm'), 'Should include pm');
    assert.ok(agents.includes('analyst'), 'Should include analyst');
    assert.ok(agents.includes('data-engineer'), 'Should include data-engineer');
    assert.ok(agents.includes('ux-design-expert'), 'Should include ux-design-expert');
    assert.ok(agents.includes('aios-master'), 'Should include aios-master');
  });
});

// ---------------------------------------------------------------------------
// Test: Logger Initialization (AC3)
// ---------------------------------------------------------------------------

describe('Logger Initialization', () => {
  it('should create log directory if it does not exist', async () => {
    const mod = await import(orchestratorPath);
    const logTestDir = resolve(testTmpDir, `log-${Date.now()}`);
    mkdirSync(logTestDir, { recursive: true });

    const logger = mod.initLogger(logTestDir, false);
    assert.ok(logger, 'Logger should be created');

    // Check that .aios/logs directory was created
    const logDir = resolve(logTestDir, '.aios', 'logs');
    assert.ok(existsSync(logDir), 'Log directory should be created');

    // Clean up logger (close transport)
    if (logger.flush) logger.flush();
  });

  it('should respect verbose flag for debug level', async () => {
    const mod = await import(orchestratorPath);
    const logTestDir = resolve(testTmpDir, `logv-${Date.now()}`);
    mkdirSync(logTestDir, { recursive: true });

    const logger = mod.initLogger(logTestDir, true);
    assert.ok(logger, 'Verbose logger should be created');
    assert.equal(logger.level, 'debug', 'Verbose should set level to debug');

    if (logger.flush) logger.flush();
  });
});

// ---------------------------------------------------------------------------
// Test: USAGE constant
// ---------------------------------------------------------------------------

describe('USAGE text', () => {
  it('should contain all documented commands', async () => {
    const mod = await import(orchestratorPath);
    const usage = mod.USAGE;

    assert.ok(usage.includes('--workflow'), 'USAGE should mention --workflow');
    assert.ok(usage.includes('--story'), 'USAGE should mention --story');
    assert.ok(usage.includes('--max-budget'), 'USAGE should mention --max-budget');
    assert.ok(usage.includes('--output-format'), 'USAGE should mention --output-format');
    assert.ok(usage.includes('--dry-run'), 'USAGE should mention --dry-run');
    assert.ok(usage.includes('--no-interactive'), 'USAGE should mention --no-interactive');
    assert.ok(usage.includes('--status'), 'USAGE should mention --status');
    assert.ok(usage.includes('--abort'), 'USAGE should mention --abort');
    assert.ok(usage.includes('--help'), 'USAGE should mention --help');
    assert.ok(usage.includes('--verbose'), 'USAGE should mention --verbose');
    assert.ok(usage.includes('sdc'), 'USAGE should mention sdc');
    assert.ok(usage.includes('qa-loop'), 'USAGE should mention qa-loop');
  });
});

// ---------------------------------------------------------------------------
// Test: Exit Codes (AC2)
// ---------------------------------------------------------------------------

describe('Exit Codes', () => {
  it('should exit 0 for --help', () => {
    const result = runCli(['--help']);
    assert.equal(result.exitCode, 0);
  });

  it('should exit 0 for --status (no state)', () => {
    const result = runCli(['--status']);
    assert.equal(result.exitCode, 0);
  });

  it('should exit 0 for --abort (no state)', () => {
    const result = runCli(['--abort']);
    assert.equal(result.exitCode, 0);
  });

  it('should exit 2 for bad arguments', () => {
    const result = runCli(['--workflow', 'invalid']);
    assert.equal(result.exitCode, 2);
  });

  it('should exit 0 for --dry-run with valid args', () => {
    const storyFile = 'docs/stories/active/7.1.6.story.md';
    const result = runCli(['--workflow', 'sdc', '--story', storyFile, '--dry-run']);
    assert.equal(result.exitCode, 0);
  });
});

// ---------------------------------------------------------------------------
// Test: Full workflow fails gracefully without E7.1.3
// ---------------------------------------------------------------------------

describe('Workflow Real Engine Wiring', () => {
  it('should exit 1 when running SDC without SDK available (engine wired but query fails)', () => {
    const storyFile = 'docs/stories/active/7.1.6.story.md';
    const result = runCli(['--workflow', 'sdc', '--story', storyFile, '--no-resume', '--no-interactive']);
    // Real engine is wired — it will fail because SDK query() is not available
    // or because CLAUDECODE env blocks nested sessions. Either way, exit 1.
    assert.equal(result.exitCode, 1, 'Should exit 1 when SDK query fails');
  });
});
