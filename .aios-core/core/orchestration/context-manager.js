/**
 * Context Manager - Persists workflow state between phases
 *
 * DETERMINISTIC: All operations use file system operations (fs-extra),
 * no AI involvement in state management.
 *
 * Responsibilities:
 * - Save phase outputs to JSON files
 * - Provide context to subsequent phases
 * - Track workflow execution state
 * - Enable workflow resume from any phase
 *
 * @module core/orchestration/context-manager
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Manages workflow execution context and state persistence
 */
class ContextManager {
  /**
   * @param {string} workflowId - Unique workflow identifier
   * @param {string} projectRoot - Project root directory
   */
  constructor(workflowId, projectRoot) {
    this.workflowId = workflowId;
    this.projectRoot = projectRoot;

    // State file path
    this.stateDir = path.join(projectRoot, '.aios', 'workflow-state');
    this.statePath = path.join(this.stateDir, `${workflowId}.json`);

    // In-memory cache
    this._stateCache = null;
  }

  /**
   * Ensure state directory exists
   * DETERMINISTIC: Pure fs operation
   */
  async ensureStateDir() {
    await fs.ensureDir(this.stateDir);
  }

  /**
   * Initialize or load existing workflow state
   * @returns {Promise<Object>} Current state
   */
  async initialize() {
    await this.ensureStateDir();

    if (await fs.pathExists(this.statePath)) {
      this._stateCache = await fs.readJson(this.statePath);
    } else {
      this._stateCache = this._createInitialState();
      await this._saveState();
    }

    return this._stateCache;
  }

  /**
   * Create initial state structure
   * @private
   */
  _createInitialState() {
    return {
      workflowId: this.workflowId,
      status: 'initialized',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentPhase: 0,
      phases: {},
      metadata: {
        projectRoot: this.projectRoot,
      },
    };
  }

  /**
   * Load state from disk (or cache)
   * @returns {Promise<Object>} Current state
   */
  async loadState() {
    if (this._stateCache) {
      return this._stateCache;
    }

    if (await fs.pathExists(this.statePath)) {
      this._stateCache = await fs.readJson(this.statePath);
      return this._stateCache;
    }

    return this._createInitialState();
  }

  /**
   * Save state to disk
   * DETERMINISTIC: Pure fs operation
   * @private
   */
  async _saveState() {
    await this.ensureStateDir();
    this._stateCache.updatedAt = new Date().toISOString();
    await fs.writeJson(this.statePath, this._stateCache, { spaces: 2 });
  }

  /**
   * Save phase output and update state
   * @param {number} phaseNum - Phase number
   * @param {Object} output - Phase output data
   */
  async savePhaseOutput(phaseNum, output) {
    const state = await this.loadState();

    state.phases[phaseNum] = {
      ...output,
      completedAt: new Date().toISOString(),
    };

    state.currentPhase = phaseNum;
    state.status = 'in_progress';

    this._stateCache = state;
    await this._saveState();
  }

  /**
   * Get context for a specific phase
   * Includes outputs from all previous phases
   * @param {number} phaseNum - Target phase number
   * @returns {Promise<Object>} Context for the phase
   */
  async getContextForPhase(phaseNum) {
    const state = await this.loadState();

    // Collect outputs from all previous phases
    const previousPhases = {};
    for (let i = 1; i < phaseNum; i++) {
      if (state.phases[i]) {
        previousPhases[i] = state.phases[i];
      }
    }

    return {
      workflowId: this.workflowId,
      currentPhase: phaseNum,
      previousPhases,
      metadata: state.metadata,
    };
  }

  /**
   * Get all previous phase outputs
   * @returns {Object} Map of phase number to output
   */
  getPreviousPhaseOutputs() {
    if (!this._stateCache) {
      return {};
    }
    return this._stateCache.phases || {};
  }

  /**
   * Get output from a specific phase
   * @param {number} phaseNum - Phase number
   * @returns {Object|null} Phase output or null
   */
  getPhaseOutput(phaseNum) {
    const outputs = this.getPreviousPhaseOutputs();
    return outputs[phaseNum] || null;
  }

  /**
   * Mark workflow as completed
   */
  async markCompleted() {
    const state = await this.loadState();
    state.status = 'completed';
    state.completedAt = new Date().toISOString();
    this._stateCache = state;
    await this._saveState();
  }

  /**
   * Mark workflow as failed
   * @param {string} error - Error message
   * @param {number} failedPhase - Phase that failed
   */
  async markFailed(error, failedPhase) {
    const state = await this.loadState();
    state.status = 'failed';
    state.error = error;
    state.failedPhase = failedPhase;
    state.failedAt = new Date().toISOString();
    this._stateCache = state;
    await this._saveState();
  }

  /**
   * Update workflow metadata
   * @param {Object} metadata - Metadata to merge
   */
  async updateMetadata(metadata) {
    const state = await this.loadState();
    state.metadata = { ...state.metadata, ...metadata };
    this._stateCache = state;
    await this._saveState();
  }

  /**
   * Get the last completed phase number
   * @returns {number} Last completed phase number (0 if none)
   */
  getLastCompletedPhase() {
    const phases = this.getPreviousPhaseOutputs();
    const phaseNums = Object.keys(phases).map(Number);
    return phaseNums.length > 0 ? Math.max(...phaseNums) : 0;
  }

  /**
   * Check if a specific phase was completed
   * @param {number} phaseNum - Phase number
   * @returns {boolean} True if phase was completed
   */
  isPhaseCompleted(phaseNum) {
    const output = this.getPhaseOutput(phaseNum);
    return output !== null && output.completedAt !== undefined;
  }

  /**
   * Get workflow execution summary
   * @returns {Object} Execution summary
   */
  getSummary() {
    const state = this._stateCache || this._createInitialState();
    const phases = Object.keys(state.phases || {}).map(Number);

    return {
      workflowId: state.workflowId,
      status: state.status,
      startedAt: state.startedAt,
      completedAt: state.completedAt,
      currentPhase: state.currentPhase,
      completedPhases: phases,
      totalPhases: phases.length,
    };
  }

  /**
   * Reset workflow state (for re-execution)
   * @param {boolean} keepMetadata - Whether to preserve metadata
   */
  async reset(keepMetadata = true) {
    const metadata = keepMetadata ? this._stateCache?.metadata : {};
    this._stateCache = this._createInitialState();
    this._stateCache.metadata = metadata;
    await this._saveState();
  }

  /**
   * Export state for external use
   * @returns {Object} Complete state object
   */
  exportState() {
    return { ...this._stateCache };
  }

  /**
   * Import state from external source
   * @param {Object} state - State to import
   */
  async importState(state) {
    this._stateCache = state;
    await this._saveState();
  }
}

module.exports = ContextManager;
