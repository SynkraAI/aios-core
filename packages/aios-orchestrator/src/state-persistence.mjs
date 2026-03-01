/**
 * State Persistence — Atomic read/write for workflow state.
 *
 * Implements CP-12 fix: writes to .tmp then renames to final path.
 * This prevents partial writes from corrupting state on crash.
 *
 * State directory: `{projectRoot}/.aios/orchestrator/`
 * State file:      `{projectRoot}/.aios/orchestrator/workflow-state.json`
 * Reports dir:     `{projectRoot}/.aios/orchestrator/reports/`
 *
 * Story: E7.1.3
 * Architecture: sdk-orchestrator-architecture.md Section 6.2
 * Validation: CP-12 (atomic writes)
 *
 * @module state-persistence
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  unlinkSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default state directory relative to project root */
const STATE_DIR = '.aios/orchestrator';

/** Default state file name (when no storyFile provided) */
const STATE_FILE = 'workflow-state.json';

/** Reports subdirectory */
const REPORTS_DIR = 'reports';

/**
 * Derive a slug from a story file path for per-story state isolation.
 * e.g., "docs/stories/active/poc-test-story.md" -> "poc-test-story"
 *
 * @param {string} storyFile
 * @returns {string}
 */
function storySlug(storyFile) {
  return storyFile
    .replace(/^.*[\\/]/, '')     // Remove directory path
    .replace(/\.md$/, '')         // Remove .md extension
    .replace(/[^a-zA-Z0-9_-]/g, '_'); // Sanitize
}

// ---------------------------------------------------------------------------
// WorkflowState Factory
// ---------------------------------------------------------------------------

/**
 * @typedef {object} PhaseHistoryEntry
 * @property {string} phase - Phase ID (e.g., 'SM:CREATE')
 * @property {string} status - 'completed' | 'skipped'
 * @property {string} [completedAt] - ISO timestamp
 * @property {number} [costUsd] - Cost for this phase
 * @property {string} [verdict] - Decision verdict (GO, PASS, etc.)
 * @property {string} [summary] - Truncated agent output
 */

/**
 * @typedef {object} WorkflowState
 * @property {string} workflowId - Unique identifier
 * @property {string} workflow - Workflow type ('sdc' | 'qa-loop')
 * @property {string} storyFile - Path to story file
 * @property {string} currentPhase - Current phase ID
 * @property {PhaseHistoryEntry[]} phaseHistory - Completed phases
 * @property {Record<string, number>} retries - Retry counters per phase
 * @property {number} totalCostUsd - Cumulative cost
 * @property {number} maxCostUsd - Budget ceiling
 * @property {string} startedAt - ISO timestamp
 * @property {string} lastUpdatedAt - ISO timestamp
 * @property {string} status - 'running' | 'done' | 'aborted'
 * @property {string|null} error - Error message if aborted
 * @property {string[]} [concerns] - QA concerns accumulated
 */

/**
 * Create a fresh WorkflowState object.
 *
 * @param {object} opts
 * @param {string} opts.workflow - 'sdc' | 'qa-loop'
 * @param {string} opts.storyFile - Path to the story file
 * @param {number} [opts.maxCostUsd=25] - Budget ceiling
 * @param {string} [opts.workflowId] - Custom ID (defaults to auto-generated)
 * @returns {WorkflowState}
 */
export function createWorkflowState({ workflow, storyFile, maxCostUsd = 25, workflowId }) {
  return {
    workflowId: workflowId || `${workflow}-${Date.now()}-${randomUUID().slice(0, 8)}`,
    workflow,
    storyFile,
    currentPhase: '',
    phaseHistory: [],
    retries: {},
    totalCostUsd: 0,
    maxCostUsd,
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    status: 'running',
    error: null,
    concerns: [],
  };
}

// ---------------------------------------------------------------------------
// State Persistence
// ---------------------------------------------------------------------------

/**
 * Create a StatePersistence instance for a given project root.
 *
 * @param {object} opts
 * @param {string} opts.projectRoot - Absolute path to project root
 * @param {string} [opts.storyFile] - Story file path for per-story state isolation
 * @param {object} [opts.logger] - Logger instance
 * @returns {StatePersistence}
 */
export function createStatePersistence({ projectRoot, storyFile, logger }) {
  const log = logger || { info() {}, warn() {}, error() {}, debug() {} };
  const stateDir = join(projectRoot, STATE_DIR);
  // Per-story state file: "workflow-state-{slug}.json" for parallel isolation
  const stateFileName = storyFile
    ? `workflow-state-${storySlug(storyFile)}.json`
    : STATE_FILE;
  const stateFilePath = join(stateDir, stateFileName);
  const reportsDir = join(stateDir, REPORTS_DIR);

  /**
   * Ensure the state directory exists (creates recursively).
   */
  function ensureDir() {
    if (!existsSync(stateDir)) {
      mkdirSync(stateDir, { recursive: true });
      log.debug({ dir: stateDir }, 'Created state directory');
    }
  }

  /**
   * Ensure the reports directory exists.
   */
  function ensureReportsDir() {
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
      log.debug({ dir: reportsDir }, 'Created reports directory');
    }
  }

  /**
   * Save workflow state atomically (CP-12 fix).
   * Writes to .tmp file then renames to final path.
   *
   * @param {WorkflowState} state
   */
  function saveState(state) {
    ensureDir();

    state.lastUpdatedAt = new Date().toISOString();

    const tmpPath = stateFilePath + '.tmp';
    const data = JSON.stringify(state, null, 2);

    try {
      writeFileSync(tmpPath, data, 'utf8');
      renameSync(tmpPath, stateFilePath);
      log.debug(
        { workflowId: state.workflowId, phase: state.currentPhase },
        'State persisted'
      );
    } catch (err) {
      // Clean up tmp file on failure
      try {
        if (existsSync(tmpPath)) unlinkSync(tmpPath);
      } catch {
        // Ignore cleanup errors
      }
      throw err;
    }
  }

  /**
   * Load workflow state from disk.
   *
   * @returns {WorkflowState|null} State object, or null if no state file exists
   */
  function loadState() {
    if (!existsSync(stateFilePath)) {
      return null;
    }

    try {
      const raw = readFileSync(stateFilePath, 'utf8');
      const state = JSON.parse(raw);
      log.debug(
        { workflowId: state.workflowId, status: state.status, phase: state.currentPhase },
        'State loaded from disk'
      );
      return state;
    } catch (err) {
      log.error({ err, path: stateFilePath }, 'Failed to load state file');
      return null;
    }
  }

  /**
   * Clear the state file (e.g., after workflow completion).
   */
  function clearState() {
    try {
      if (existsSync(stateFilePath)) {
        unlinkSync(stateFilePath);
        log.debug('State file cleared');
      }
    } catch (err) {
      log.warn({ err }, 'Failed to clear state file');
    }
  }

  /**
   * Save a workflow report to the reports directory.
   *
   * @param {object} report
   * @param {string} report.workflowId
   */
  function saveReport(report) {
    ensureReportsDir();

    const filename = `${report.workflowId}.json`;
    const filepath = join(reportsDir, filename);
    const tmpPath = filepath + '.tmp';

    try {
      const data = JSON.stringify(
        { ...report, generatedAt: new Date().toISOString() },
        null,
        2
      );
      writeFileSync(tmpPath, data, 'utf8');
      renameSync(tmpPath, filepath);
      log.info({ filepath }, 'Workflow report saved');
      return filepath;
    } catch (err) {
      try {
        if (existsSync(tmpPath)) unlinkSync(tmpPath);
      } catch {
        // Ignore cleanup errors
      }
      log.error({ err }, 'Failed to save workflow report');
      return null;
    }
  }

  return {
    saveState,
    loadState,
    clearState,
    saveReport,
    stateFilePath,
    stateDir,
    reportsDir,
  };
}
