#!/usr/bin/env node

/**
 * AIOS Orchestrator — CLI Entry Point
 *
 * Wires together all Phase 1 components (registry, session manager,
 * workflow engine, governance hooks, comms bridge) into a single
 * executable CLI.
 *
 * Story: E7.1.6
 * Architecture: docs/architecture/sdk-orchestrator-architecture.md
 *
 * Commands:
 *   --workflow sdc --story <path>          Start SDC workflow
 *   --workflow qa-loop --story <path>      Start QA Loop workflow
 *   --status                               Show workflow state
 *   --abort                                Abort active workflow
 *   --help                                 Print usage
 *   --dry-run --workflow sdc --story <path> Simulate without calling query()
 *
 * Exit codes:
 *   0 — success
 *   1 — workflow failed (agent error, parse failure, max retries)
 *   2 — configuration error (bad args, missing file, invalid registry)
 *   3 — budget exceeded
 *
 * @module orchestrator
 */

import { parseArgs } from 'node:util';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import pino from 'pino';

import { loadRegistry } from './src/registry.mjs';
import { createSessionManager } from './src/session-manager.mjs';
import { createGovernanceHooks, setLogger } from './src/governance-hooks.mjs';
import { createCommsBridge } from './src/comms-bridge.mjs';
import { BudgetError, ConfigError } from './src/errors.mjs';
import { createWorkflowEngine as createRealWorkflowEngine } from './src/workflow-engine.mjs';
import { createStatePersistence } from './src/state-persistence.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_WORKFLOWS = ['sdc', 'qa-loop'];
const VALID_OUTPUT_FORMATS = ['text', 'json'];
const SHUTDOWN_TIMEOUT_MS = 30_000;

/** Path to workflow state file (relative to project root) */
const STATE_DIR = '.aios/orchestrator';
const STATE_FILE = 'workflow-state.json';
const LOG_DIR = '.aios/logs';
const LOG_FILE = 'orchestrator.log';

// ---------------------------------------------------------------------------
// Argument Parsing (AC1, AC9)
// ---------------------------------------------------------------------------

/**
 * Parse and validate CLI arguments.
 *
 * Uses Node.js built-in parseArgs (node:util) — zero external dependencies.
 *
 * @returns {{ values: object }} Parsed arguments
 */
function parseCliArgs() {
  try {
    const { values } = parseArgs({
      options: {
        workflow: { type: 'string' },
        story: { type: 'string' },
        'max-budget': { type: 'string' },
        'output-format': { type: 'string', default: 'text' },
        status: { type: 'boolean', default: false },
        abort: { type: 'boolean', default: false },
        'dry-run': { type: 'boolean', default: false },
        'no-interactive': { type: 'boolean', default: false },
        'no-resume': { type: 'boolean', default: false },
        help: { type: 'boolean', default: false },
        verbose: { type: 'boolean', default: false },
      },
      strict: true,
    });
    return values;
  } catch (err) {
    printError(`Invalid arguments: ${err.message}`);
    printUsage();
    process.exit(2);
  }
}

/**
 * Validate parsed arguments and return a normalized config.
 *
 * @param {object} args - Parsed args from parseCliArgs()
 * @param {string} projectRoot - Project root directory
 * @returns {object} Normalized configuration
 */
function validateArgs(args, projectRoot) {
  // --help and --status/--abort are standalone commands
  if (args.help || args.status || args.abort) {
    return args;
  }

  // --workflow is required for execution
  if (!args.workflow) {
    printError('Missing required argument: --workflow <name>');
    printUsage();
    process.exit(2);
  }

  // Validate workflow name (AC9)
  if (!VALID_WORKFLOWS.includes(args.workflow)) {
    printError(`Invalid workflow: "${args.workflow}". Must be one of: ${VALID_WORKFLOWS.join(', ')}`);
    process.exit(2);
  }

  // --story is required for workflow execution
  if (!args.story) {
    printError('Missing required argument: --story <path>');
    process.exit(2);
  }

  // Validate story file exists (AC9)
  const storyPath = resolve(projectRoot, args.story);
  if (!existsSync(storyPath)) {
    printError(`Story file not found: ${args.story}`);
    process.exit(2);
  }

  // Validate --max-budget (AC9)
  if (args['max-budget'] !== undefined) {
    const budget = parseFloat(args['max-budget']);
    if (isNaN(budget) || budget <= 0) {
      printError(`Invalid --max-budget: "${args['max-budget']}". Must be a positive number.`);
      process.exit(2);
    }
    args._maxBudgetUsd = budget;
  }

  // Validate --output-format (AC9)
  const outputFormat = args['output-format'] || 'text';
  if (!VALID_OUTPUT_FORMATS.includes(outputFormat)) {
    printError(`Invalid --output-format: "${outputFormat}". Must be one of: ${VALID_OUTPUT_FORMATS.join(', ')}`);
    process.exit(2);
  }

  args._storyPath = storyPath;
  args._outputFormat = outputFormat;

  return args;
}

// ---------------------------------------------------------------------------
// Help / Usage (AC1)
// ---------------------------------------------------------------------------

const USAGE = `
AIOS Orchestrator — Multi-agent workflow orchestration

USAGE:
  node orchestrator.mjs --workflow <name> --story <path> [options]
  node orchestrator.mjs --status
  node orchestrator.mjs --abort
  node orchestrator.mjs --help

WORKFLOWS:
  sdc         Story Development Cycle (SM -> PO -> DEV -> QA)
  qa-loop     QA Loop (QA review -> DEV fix, max 5 iterations)

OPTIONS:
  --workflow <name>       Workflow to execute (sdc, qa-loop)
  --story <path>          Path to story file
  --max-budget <usd>      Override maximum budget in USD
  --output-format <fmt>   Output format: text (default) or json
  --dry-run               Simulate without calling query()
  --no-interactive        Skip interactive prompts (for systemd)
  --no-resume             Do not resume interrupted workflow, start fresh
  --verbose               Enable debug logging
  --status                Show current workflow state
  --abort                 Abort active workflow
  --help                  Show this help message

EXIT CODES:
  0  Workflow completed successfully
  1  Workflow failed (agent error, parse failure, max retries)
  2  Configuration error (bad args, missing file, invalid registry)
  3  Budget exceeded

EXAMPLES:
  node orchestrator.mjs --workflow sdc --story docs/stories/active/7.1.6.story.md
  node orchestrator.mjs --workflow sdc --story story.md --max-budget 5.00
  node orchestrator.mjs --dry-run --workflow sdc --story story.md
  node orchestrator.mjs --status
  node orchestrator.mjs --abort
`.trim();

function printUsage() {
  console.log(USAGE);
}

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

function printError(message) {
  console.error(`[ERROR] ${message}`);
}

function printText(message) {
  console.log(message);
}

function printJson(data) {
  console.log(JSON.stringify(data));
}

function output(format, textMsg, jsonData) {
  if (format === 'json') {
    printJson(jsonData);
  } else {
    printText(textMsg);
  }
}

// ---------------------------------------------------------------------------
// Logger Setup (AC3)
// ---------------------------------------------------------------------------

/**
 * Initialize structured pino logger.
 *
 * - File transport to .aios/logs/orchestrator.log
 * - Log level from AIOS_LOG_LEVEL env var (default: info)
 * - JSON format (pino default)
 * - name: "aios-orchestrator" in every entry
 *
 * @param {string} projectRoot
 * @param {boolean} verbose - Enable debug level
 * @returns {object} Pino logger instance
 */
function initLogger(projectRoot, verbose) {
  const logDir = resolve(projectRoot, LOG_DIR);
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }

  const logPath = resolve(logDir, LOG_FILE);
  const level = verbose ? 'debug' : (process.env.AIOS_LOG_LEVEL || 'info');

  const transport = pino.transport({
    targets: [
      {
        target: 'pino/file',
        options: { destination: logPath },
        level,
      },
    ],
  });

  const logger = pino({ name: 'aios-orchestrator', level }, transport);
  return logger;
}

// ---------------------------------------------------------------------------
// State File Operations (AC6, AC7)
// ---------------------------------------------------------------------------

/**
 * Get the path to the workflow state file.
 *
 * @param {string} projectRoot
 * @returns {string}
 */
function getStatePath(projectRoot) {
  return resolve(projectRoot, STATE_DIR, STATE_FILE);
}

/**
 * Read the workflow state from disk.
 *
 * @param {string} projectRoot
 * @returns {object|null} State object or null if no state file
 */
function readState(projectRoot) {
  const statePath = getStatePath(projectRoot);
  if (!existsSync(statePath)) return null;

  try {
    const raw = readFileSync(statePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Write the workflow state to disk.
 *
 * @param {string} projectRoot
 * @param {object} state
 */
function writeState(projectRoot, state) {
  const stateDir = resolve(projectRoot, STATE_DIR);
  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true });
  }

  const statePath = getStatePath(projectRoot);
  writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Metrics (AC4)
// ---------------------------------------------------------------------------

/**
 * Create a WorkflowMetrics accumulator.
 *
 * @returns {object} Metrics accumulator with track methods
 */
function createMetrics() {
  const startTime = Date.now();

  const metrics = {
    costUsd: { perQuery: [], perPhase: {}, total: 0 },
    durationMs: { perQuery: [], perPhase: {}, total: 0 },
    toolCalls: {},
    retries: {},
    errors: { perQuery: [], total: 0 },
  };

  return {
    /**
     * Record a query execution.
     */
    trackQuery(phase, result) {
      const cost = result?.costUsd || 0;
      const duration = result?.durationMs || 0;

      metrics.costUsd.perQuery.push({ phase, cost });
      metrics.costUsd.total += cost;
      metrics.costUsd.perPhase[phase] = (metrics.costUsd.perPhase[phase] || 0) + cost;

      metrics.durationMs.perQuery.push({ phase, duration });
      metrics.durationMs.perPhase[phase] = (metrics.durationMs.perPhase[phase] || 0) + duration;

      // Aggregate tool calls per agent
      if (result?.toolCalls) {
        for (const tc of result.toolCalls) {
          if (!metrics.toolCalls[result.agentId]) {
            metrics.toolCalls[result.agentId] = {};
          }
          const agentTools = metrics.toolCalls[result.agentId];
          agentTools[tc.name] = (agentTools[tc.name] || 0) + 1;
        }
      }
    },

    /**
     * Record a retry for a phase.
     */
    trackRetry(phase) {
      metrics.retries[phase] = (metrics.retries[phase] || 0) + 1;
    },

    /**
     * Record an error for a query.
     */
    trackError(phase, error) {
      metrics.errors.perQuery.push({ phase, error: error.message || String(error) });
      metrics.errors.total += 1;
    },

    /**
     * Finalize metrics (set total duration).
     */
    finalize() {
      metrics.durationMs.total = Date.now() - startTime;
      return { ...metrics };
    },

    /**
     * Get current metrics snapshot.
     */
    snapshot() {
      return {
        ...metrics,
        durationMs: {
          ...metrics.durationMs,
          total: Date.now() - startTime,
        },
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Signal Handling (AC5 — CP-6 fix)
// ---------------------------------------------------------------------------

/** Shutdown flag — shared with workflow engine phase loop */
let shutdownRequested = false;

/** Watchdog timer reference (for cleanup) */
let watchdogTimer = null;

/**
 * Check if shutdown has been requested.
 * Passed to workflow engine as a callback.
 *
 * @returns {boolean}
 */
export function isShutdownRequested() {
  return shutdownRequested;
}

/**
 * Register SIGTERM/SIGINT handlers.
 *
 * On signal:
 * 1. Set shutdownRequested = true (do NOT call process.exit immediately)
 * 2. Log the event
 * 3. Start 30s watchdog — if current phase does not complete, force exit
 *
 * @param {object} logger - Pino logger
 * @param {object} commsBridge - CommsBridge instance for notifications
 * @param {string} storyFile - Current story file path
 */
function registerSignalHandlers(logger, commsBridge, storyFile) {
  const handler = (signal) => {
    if (shutdownRequested) {
      // Second signal — force exit
      logger.error({ event: 'forced_shutdown', signal }, 'Forced shutdown on second signal');
      process.exit(1);
    }

    shutdownRequested = true;

    logger.info(
      { event: 'shutdown_requested', signal, currentPhase: 'unknown' },
      'Graceful shutdown initiated'
    );

    // Notify via comms bridge (AC5)
    if (commsBridge) {
      try {
        commsBridge.notifyError(
          'shutdown',
          `Orchestrator shutting down (${signal}). Resume with --workflow sdc --story ${storyFile || 'unknown'}`,
          'shutdown'
        );
      } catch {
        // Best effort notification
      }
    }

    // 30s watchdog (AC5 — CP-6 fix)
    watchdogTimer = setTimeout(() => {
      logger.error({ event: 'shutdown_timeout' }, 'Shutdown timeout (30s). Forcing exit.');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    // Unref so the timer does not keep the process alive if everything else completes
    if (watchdogTimer.unref) {
      watchdogTimer.unref();
    }
  };

  process.on('SIGTERM', handler);
  process.on('SIGINT', handler);
}

// ---------------------------------------------------------------------------
// Crash Recovery (AC6)
// ---------------------------------------------------------------------------

/**
 * Check for interrupted workflow state and handle recovery.
 *
 * @param {string} projectRoot
 * @param {object} args - Parsed CLI arguments
 * @param {object} logger
 * @returns {Promise<object|null>} State to resume from, or null for fresh start
 */
async function checkCrashRecovery(projectRoot, args, logger) {
  // Use per-story state file for parallel isolation
  const persistence = createStatePersistence({
    projectRoot,
    storyFile: args.story,
    logger,
  });
  const state = persistence.loadState();

  if (!state || state.status !== 'running') {
    return null;
  }

  logger.info(
    { event: 'interrupted_workflow_found', workflowId: state.workflowId, phase: state.currentPhase },
    'Found interrupted workflow'
  );

  // --no-resume: mark as aborted and start fresh (AC6)
  if (args['no-resume']) {
    state.status = 'aborted';
    state.abortedAt = new Date().toISOString();
    persistence.saveState(state);
    logger.info({ event: 'workflow_aborted', workflowId: state.workflowId }, 'Interrupted workflow marked as aborted');
    return null;
  }

  // --no-interactive (systemd): auto-resume (AC6)
  if (args['no-interactive']) {
    logger.info(
      { event: 'workflow_resumed', workflowId: state.workflowId, fromPhase: state.currentPhase },
      'Auto-resuming interrupted workflow (--no-interactive)'
    );
    return state;
  }

  // Interactive prompt (AC6)
  const answer = await askUser(
    `Found interrupted workflow: ${state.workflowId} at phase ${state.currentPhase}. Resume? [y/N] `
  );

  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    logger.info(
      { event: 'workflow_resumed', workflowId: state.workflowId, fromPhase: state.currentPhase },
      'Resuming interrupted workflow'
    );
    return state;
  }

  // User said no — mark as aborted
  state.status = 'aborted';
  state.abortedAt = new Date().toISOString();
  persistence.saveState(state);
  logger.info({ event: 'workflow_aborted', workflowId: state.workflowId }, 'Interrupted workflow marked as aborted');
  return null;
}

/**
 * Prompt user for input via readline.
 *
 * @param {string} question
 * @returns {Promise<string>}
 */
function askUser(question) {
  return new Promise((resolvePromise) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolvePromise(answer.trim());
    });
  });
}

// ---------------------------------------------------------------------------
// Workflow Engine Stub (placeholder until E7.1.3)
// ---------------------------------------------------------------------------

/**
 * Create a stub workflow engine.
 *
 * This placeholder will be replaced when E7.1.3 is implemented.
 * For now, it provides the interface the CLI needs to validate wiring.
 *
 * @param {object} deps - Dependencies
 * @param {object} deps.sessionManager
 * @param {object} deps.commsBridge
 * @param {object} deps.governanceHooks
 * @param {object} deps.registry
 * @param {object} deps.logger
 * @param {Function} deps.isShutdownRequested
 * @returns {object} Workflow engine stub
 */
function createWorkflowEngine(deps) {
  const { logger } = deps;

  return {
    /**
     * Run SDC workflow for a story.
     *
     * @param {object} opts
     * @param {string} opts.storyFile - Path to story file
     * @param {number} [opts.maxBudgetUsd] - Budget override
     * @param {boolean} [opts.dryRun] - If true, simulate without calling query()
     * @param {string} [opts.outputFormat] - text or json
     * @returns {Promise<object>} Workflow result
     */
    async runSDC({ storyFile, maxBudgetUsd, dryRun, outputFormat }) {
      if (dryRun) {
        const phases = ['SM:CREATE', 'PO:VALIDATE', 'DEV:IMPLEMENT', 'QA:GATE'];
        const agents = ['sm', 'po', 'dev', 'qa'];

        logger.info({ event: 'dry_run_start', storyFile, workflow: 'sdc' }, 'Dry run started');

        const dryResult = {
          workflowId: `sdc-dry-${Date.now()}`,
          workflow: 'sdc',
          storyFile,
          dryRun: true,
          phases: phases.map((phase, i) => ({
            phase,
            agentId: agents[i],
            wouldExecute: true,
            budgetUsd: maxBudgetUsd || deps.registry.getAgent(agents[i]).maxBudgetUsd,
          })),
          status: 'dry_run_complete',
        };

        return dryResult;
      }

      throw new Error('Workflow engine not yet implemented (E7.1.3). Use --dry-run to validate setup.');
    },

    /**
     * Run QA Loop workflow.
     *
     * @param {object} opts
     * @param {string} opts.storyFile
     * @param {boolean} [opts.dryRun]
     * @returns {Promise<object>}
     */
    async runQALoop({ storyFile, dryRun }) {
      if (dryRun) {
        logger.info({ event: 'dry_run_start', storyFile, workflow: 'qa-loop' }, 'Dry run started');
        return {
          workflowId: `qa-loop-dry-${Date.now()}`,
          workflow: 'qa-loop',
          storyFile,
          dryRun: true,
          phases: [
            { phase: 'QA:REVIEW', agentId: 'qa', wouldExecute: true },
            { phase: 'DEV:FIX', agentId: 'dev', wouldExecute: true },
          ],
          status: 'dry_run_complete',
        };
      }

      throw new Error('Workflow engine not yet implemented (E7.1.3). Use --dry-run to validate setup.');
    },

    /**
     * Resume a workflow from saved state.
     *
     * @param {object} state - Saved workflow state
     * @returns {Promise<object>}
     */
    async resume(state) {
      throw new Error('Workflow engine resume not yet implemented (E7.1.3).');
    },
  };
}

// ---------------------------------------------------------------------------
// Command: --status (AC1)
// ---------------------------------------------------------------------------

/**
 * Print current workflow state.
 *
 * @param {string} projectRoot
 * @param {string} outputFormat
 */
function handleStatus(projectRoot, outputFormat) {
  const state = readState(projectRoot);

  if (!state) {
    output(outputFormat, 'No active workflow.', { status: 'none', message: 'No active workflow' });
    return;
  }

  if (outputFormat === 'json') {
    printJson(state);
  } else {
    printText(`Workflow: ${state.workflowId || 'unknown'}`);
    printText(`Status:   ${state.status || 'unknown'}`);
    printText(`Phase:    ${state.currentPhase || 'unknown'}`);
    printText(`Story:    ${state.storyFile || 'unknown'}`);
    if (state.startedAt) printText(`Started:  ${state.startedAt}`);
    if (state.costUsd !== undefined) printText(`Cost:     $${state.costUsd.toFixed(2)}`);
  }
}

// ---------------------------------------------------------------------------
// Command: --abort (AC1)
// ---------------------------------------------------------------------------

/**
 * Abort active workflow.
 *
 * @param {string} projectRoot
 * @param {string} outputFormat
 */
function handleAbort(projectRoot, outputFormat) {
  const state = readState(projectRoot);

  if (!state || state.status !== 'running') {
    output(outputFormat, 'No active workflow to abort.', { status: 'none', message: 'No active workflow to abort' });
    return;
  }

  state.status = 'aborted';
  state.abortedAt = new Date().toISOString();
  writeState(projectRoot, state);

  output(
    outputFormat,
    `Workflow ${state.workflowId} aborted.`,
    { status: 'aborted', workflowId: state.workflowId, abortedAt: state.abortedAt }
  );
}

// ---------------------------------------------------------------------------
// Component Wiring (AC8)
// ---------------------------------------------------------------------------

/**
 * Initialize all orchestrator components in correct order.
 *
 * Order: registry -> logger -> comms -> governance -> session -> workflow
 *
 * @param {string} projectRoot
 * @param {object} args - Parsed CLI arguments
 * @returns {object} Initialized components
 */
function initializeComponents(projectRoot, args) {
  // 1. Load agent registry
  const registry = loadRegistry(undefined, projectRoot);

  // 2. Initialize pino logger (already done before this, passed in)
  // The logger is created at the top level and passed in

  // 3. Initialize comms bridge
  let commsBridge = null;
  try {
    commsBridge = createCommsBridge({
      baseDir: projectRoot,
      workflowId: `${args.workflow}-${Date.now()}`,
    });
  } catch (err) {
    // Comms bridge is non-critical — degrade gracefully
    // Will be null and checked before use
  }

  // 4. Initialize governance hooks
  const governanceHooks = createGovernanceHooks(registry);

  // 5. Initialize session manager
  const sessionManager = createSessionManager({
    registry,
    projectRoot,
  });

  return { registry, commsBridge, governanceHooks, sessionManager };
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Main CLI execution flow.
 */
async function main() {
  // Determine project root (three levels up from this file: packages/aios-orchestrator/ -> aios-core/)
  const projectRoot = resolve(__dirname, '..', '..');

  // Parse arguments
  const args = parseCliArgs();

  // Handle --help
  if (args.help) {
    printUsage();
    process.exit(0);
  }

  // Determine output format early for --status and --abort
  const outputFormat = args['output-format'] || 'text';

  // Handle --status (standalone command)
  if (args.status) {
    handleStatus(projectRoot, outputFormat);
    process.exit(0);
  }

  // Handle --abort (standalone command)
  if (args.abort) {
    handleAbort(projectRoot, outputFormat);
    process.exit(0);
  }

  // Validate remaining arguments
  const validatedArgs = validateArgs(args, projectRoot);

  // Initialize logger (AC3)
  const logger = initLogger(projectRoot, validatedArgs.verbose);

  logger.info(
    { event: 'cli_start', args: { workflow: args.workflow, story: args.story, dryRun: args['dry-run'] } },
    'AIOS Orchestrator starting'
  );

  // Initialize components (AC8)
  let registry, commsBridge, governanceHooks, sessionManager;
  try {
    const components = initializeComponents(projectRoot, validatedArgs);
    registry = components.registry;
    commsBridge = components.commsBridge;
    governanceHooks = components.governanceHooks;
    sessionManager = components.sessionManager;
  } catch (err) {
    logger.error({ event: 'init_error', error: err.message }, 'Failed to initialize components');
    printError(`Initialization failed: ${err.message}`);
    process.exit(2);
  }

  // Inject logger into governance hooks
  setLogger(logger);

  // Register signal handlers (AC5)
  registerSignalHandlers(logger, commsBridge, validatedArgs.story);

  // Create workflow engine (E7.1.3)
  const workflowEngine = createRealWorkflowEngine({
    sessionManager,
    governance: governanceHooks,
    commsBridge,
    registry,
    projectRoot,
    logger,
  });

  // Create metrics tracker (AC4)
  const metrics = createMetrics();

  // Check for crash recovery (AC6)
  const resumeState = await checkCrashRecovery(projectRoot, validatedArgs, logger);

  // Execute workflow
  try {
    let result;

    if (resumeState) {
      // Resume interrupted workflow — pass workflowId string and storyFile hint
      result = await workflowEngine.resume(resumeState.workflowId, {
        storyFile: resumeState.storyFile,
      });
    } else if (validatedArgs.workflow === 'sdc') {
      // Dry-run or full SDC
      if (validatedArgs._outputFormat === 'text') {
        printText(`Starting SDC workflow for ${validatedArgs.story}${validatedArgs['dry-run'] ? ' (dry-run)' : ''}...`);
      }

      if (validatedArgs['dry-run']) {
        // Dry-run uses stub logic (no real query calls)
        const phases = ['SM:CREATE', 'PO:VALIDATE', 'DEV:IMPLEMENT', 'QA:GATE'];
        const agents = ['sm', 'po', 'dev', 'qa'];
        result = {
          workflowId: `sdc-dry-${Date.now()}`,
          workflow: 'sdc',
          storyFile: validatedArgs._storyPath,
          dryRun: true,
          phases: phases.map((phase, i) => ({
            phase,
            agentId: agents[i],
            wouldExecute: true,
            budgetUsd: validatedArgs._maxBudgetUsd || registry.getAgent(agents[i]).maxBudgetUsd,
          })),
          status: 'dry_run_complete',
        };
      } else {
        result = await workflowEngine.runSDC({
          storyFile: validatedArgs._storyPath,
          maxBudgetUsd: validatedArgs._maxBudgetUsd,
        });
      }
    } else if (validatedArgs.workflow === 'qa-loop') {
      if (validatedArgs._outputFormat === 'text') {
        printText(`Starting QA Loop for ${validatedArgs.story}${validatedArgs['dry-run'] ? ' (dry-run)' : ''}...`);
      }

      if (validatedArgs['dry-run']) {
        result = {
          workflowId: `qa-loop-dry-${Date.now()}`,
          workflow: 'qa-loop',
          storyFile: validatedArgs._storyPath,
          dryRun: true,
          phases: [
            { phase: 'QA:REVIEW', agentId: 'qa', wouldExecute: true },
            { phase: 'DEV:FIX', agentId: 'dev', wouldExecute: true },
          ],
          status: 'dry_run_complete',
        };
      } else {
        result = await workflowEngine.runQALoop({
          storyFile: validatedArgs._storyPath,
          maxBudgetUsd: validatedArgs._maxBudgetUsd,
        });
      }
    }

    // Finalize metrics (AC4)
    const finalMetrics = metrics.finalize();

    // Output result and metrics
    if (result) {
      if (validatedArgs._outputFormat === 'json') {
        printJson({ result, metrics: finalMetrics });
      } else {
        if (result.dryRun) {
          printText('\n--- Dry Run Result ---');
          printText(`Workflow: ${result.workflow}`);
          printText(`Story:    ${result.storyFile}`);
          printText('\nPhases that would execute:');
          for (const phase of result.phases) {
            const budget = phase.budgetUsd ? ` (budget: $${phase.budgetUsd.toFixed(2)})` : '';
            printText(`  ${phase.phase} -> @${phase.agentId}${budget}`);
          }
          printText(`\nStatus: ${result.status}`);
        } else {
          printText('\n--- Workflow Result ---');
          printText(`Status:   ${result.status}`);
          printText(`Cost:     $${finalMetrics.costUsd.total.toFixed(2)}`);
          printText(`Duration: ${formatDuration(finalMetrics.durationMs.total)}`);
        }
      }
    }

    // Send metrics to comms bridge (AC4)
    if (commsBridge && result && !result.dryRun) {
      try {
        commsBridge.notifyWorkflowComplete({
          workflowId: result.workflowId,
          status: result.status || 'completed',
          storyFile: validatedArgs.story,
          totalCostUsd: finalMetrics.costUsd.total,
          totalDurationMs: finalMetrics.durationMs.total,
          phases: result.phases || [],
        });
      } catch {
        // Best effort
      }
    }

    logger.info(
      { event: 'cli_end', status: 'success', metrics: finalMetrics },
      'AIOS Orchestrator completed successfully'
    );

    // Clear watchdog if set
    if (watchdogTimer) clearTimeout(watchdogTimer);

    process.exit(0);
  } catch (err) {
    const finalMetrics = metrics.finalize();

    if (err instanceof BudgetError || err.name === 'BudgetError') {
      logger.error({ event: 'budget_exceeded', error: err.message, metrics: finalMetrics }, 'Budget exceeded');
      printError(`Budget exceeded: ${err.message}`);

      if (commsBridge) {
        try {
          commsBridge.notifyError('budget_exceeded', err.message, 'workflow', finalMetrics.costUsd.total);
        } catch { /* best effort */ }
      }

      process.exit(3);
    }

    if (err instanceof ConfigError || err.name === 'ConfigError') {
      logger.error({ event: 'config_error', error: err.message }, 'Configuration error');
      printError(`Configuration error: ${err.message}`);
      process.exit(2);
    }

    // General workflow failure
    logger.error(
      { event: 'workflow_failed', error: err.message, metrics: finalMetrics },
      'Workflow failed'
    );
    printError(`Workflow failed: ${err.message}`);

    if (commsBridge) {
      try {
        commsBridge.notifyError('workflow_failed', err.message, 'workflow', finalMetrics.costUsd.total);
      } catch { /* best effort */ }
    }

    // Persist state for crash recovery (AC6)
    if (validatedArgs && validatedArgs._storyPath) {
      try {
        writeState(projectRoot, {
          workflowId: `${validatedArgs.workflow}-${Date.now()}`,
          workflow: validatedArgs.workflow,
          storyFile: validatedArgs.story,
          status: 'running',
          currentPhase: 'unknown',
          startedAt: new Date().toISOString(),
          error: err.message,
        });
      } catch { /* best effort */ }
    }

    if (watchdogTimer) clearTimeout(watchdogTimer);
    process.exit(1);
  }
}

/**
 * Format milliseconds to human-readable duration.
 *
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// ---------------------------------------------------------------------------
// Exports (for testing)
// ---------------------------------------------------------------------------

export {
  parseCliArgs,
  validateArgs,
  handleStatus,
  handleAbort,
  initLogger,
  readState,
  writeState,
  createMetrics,
  createWorkflowEngine,
  registerSignalHandlers,
  checkCrashRecovery,
  formatDuration,
  USAGE,
  VALID_WORKFLOWS,
  VALID_OUTPUT_FORMATS,
  SHUTDOWN_TIMEOUT_MS,
  main,
};

// ---------------------------------------------------------------------------
// Run if executed directly
// ---------------------------------------------------------------------------

// Check if this module is being run directly (not imported)
const isDirectRun = process.argv[1] && resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  main().catch((err) => {
    console.error(`[FATAL] ${err.message}`);
    process.exit(2);
  });
}
