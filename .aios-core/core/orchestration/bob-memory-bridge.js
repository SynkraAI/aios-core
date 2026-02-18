/**
 * Bob Memory Bridge — Feature-gated MIS consumer for Bob Orchestrator.
 *
 * Thin wrapper over MemoryLoader, GotchasMemory, SessionDigestExtractor,
 * and SelfLearner. Connects Bob's orchestration loop to the Memory
 * Intelligence System (MIS) with per-method feature gates, timeouts,
 * and graceful degradation.
 *
 * GotchasMemory (open-core) always works. Pro features degrade to no-ops
 * when @aios-fullstack/pro is not installed.
 *
 * Pattern reference: memory-bridge.js (SYN-10)
 *
 * @module core/orchestration/bob-memory-bridge
 * @version 1.0.0
 */

'use strict';

const path = require('path');

// Timeouts per method
const TIMEOUTS = {
  loadProjectMemories: 50,
  getPhaseMemories: 15,
  generateSessionDigest: 5000,
  triggerSelfLearning: 30000,
};

/**
 * BobMemoryBridge — Feature-gated MIS consumer for Bob Orchestrator.
 *
 * Provides four integration paths:
 * 1. Pre-orchestration memory load (project-level)
 * 2. Per-phase memory enrichment (agent-scoped)
 * 3. Post-checkpoint session digest generation
 * 4. Post-epic self-learning trigger
 */
class BobMemoryBridge {
  /**
   * @param {string} projectRoot - Project root directory
   * @param {object} [options={}]
   * @param {boolean} [options.debug=false] - Enable debug logging
   */
  constructor(projectRoot, options = {}) {
    if (!projectRoot || typeof projectRoot !== 'string') {
      throw new Error('projectRoot is required and must be a string');
    }

    this.projectRoot = projectRoot;
    this.options = { debug: false, ...options };

    // Lazy-load state
    this._initialized = false;
    this._featureGate = null;
    this._memoryLoader = null;
    this._selfLearner = null;
    this._digestExtractor = null;
    this._gotchasMemory = null;
  }

  // ═══════════════════════════════════════════════════════════════════
  //                         LAZY INIT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Lazy-load feature gate. Isolates pro dependency to runtime only.
   * @private
   */
  _init() {
    if (this._initialized) return;
    this._initialized = true;

    try {
      const { featureGate } = require('../../../../pro/license/feature-gate');
      this._featureGate = featureGate;
    } catch {
      // Pro not installed — feature gate unavailable
      this._featureGate = null;
    }
  }

  /**
   * Check if a pro feature is available.
   * @param {string} featureId - Feature ID (e.g., 'pro.memory.extended')
   * @returns {boolean}
   */
  _isAvailable(featureId) {
    this._init();
    if (!this._featureGate) return false;
    try {
      return this._featureGate.isAvailable(featureId);
    } catch {
      return false;
    }
  }

  /**
   * Lazy-load MemoryLoader (pro).
   * @private
   * @returns {object|null}
   */
  _getMemoryLoader() {
    if (this._memoryLoader) return this._memoryLoader;

    try {
      const { createMemoryLoader } = require('../../../../pro/memory/memory-loader');
      this._memoryLoader = createMemoryLoader(this.projectRoot);
      return this._memoryLoader;
    } catch {
      return null;
    }
  }

  /**
   * Lazy-load SelfLearner (pro).
   * @private
   * @returns {object|null}
   */
  _getSelfLearner() {
    if (this._selfLearner) return this._selfLearner;

    try {
      const { createSelfLearner } = require('../../../../pro/memory/self-learner');
      this._selfLearner = createSelfLearner(this.projectRoot, { debug: this.options.debug });
      return this._selfLearner;
    } catch {
      return null;
    }
  }

  /**
   * Lazy-load SessionDigestExtractor (pro).
   * @private
   * @returns {Function|null}
   */
  _getDigestExtractor() {
    if (this._digestExtractor) return this._digestExtractor;

    try {
      const { extractSessionDigest } = require('../../../../pro/memory/session-digest/extractor');
      this._digestExtractor = extractSessionDigest;
      return this._digestExtractor;
    } catch {
      return null;
    }
  }

  /**
   * Lazy-load GotchasMemory (open-core, always available).
   * @private
   * @returns {object}
   */
  _getGotchasMemory() {
    if (this._gotchasMemory) return this._gotchasMemory;

    try {
      const { GotchasMemory } = require('../memory/gotchas-memory');
      this._gotchasMemory = new GotchasMemory(this.projectRoot, { quiet: true });
      return this._gotchasMemory;
    } catch {
      // Should never fail (open-core), but be defensive
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //                     PUBLIC METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Path 1: Load project-level memories at orchestration start.
   *
   * Pro: queries MemoryLoader for project-relevant memories.
   * Open-core: loads gotchas relevant to epic context.
   *
   * @param {object} epicContext - Epic context
   * @param {string} [epicContext.title] - Epic title
   * @returns {Promise<{memories: Array, gotchas: Array, metadata: object}>}
   */
  async loadProjectMemories(epicContext = {}) {
    const result = { memories: [], gotchas: [], metadata: {} };

    try {
      // GotchasMemory — always available
      const gotchasMemory = this._getGotchasMemory();
      if (gotchasMemory) {
        const taskDesc = epicContext.title || 'project orchestration';
        result.gotchas = gotchasMemory.getContextForTask(taskDesc);
      }

      // Pro memories — feature gated
      if (this._isAvailable('pro.memory.extended')) {
        const loader = this._getMemoryLoader();
        if (loader) {
          const proMemories = await this._executeWithTimeout(
            () => loader.queryMemories({ scope: 'project', context: epicContext }),
            TIMEOUTS.loadProjectMemories,
          );
          if (proMemories && Array.isArray(proMemories)) {
            result.memories = proMemories;
            result.metadata.source = 'pro';
            result.metadata.maxConfidence = proMemories.reduce(
              (max, m) => Math.max(max, m.confidence || 0), 0,
            );
          }
        }
      }

      result.metadata.gotchasCount = result.gotchas.length;
      result.metadata.memoriesCount = result.memories.length;
      result.metadata.timestamp = new Date().toISOString();
    } catch (error) {
      this._log(`loadProjectMemories error: ${error.message}`);
    }

    return result;
  }

  /**
   * Path 2: Get phase-specific memories for agent enrichment.
   *
   * Pro: queries MemoryLoader with agent-scoped context.
   * Open-core: loads gotchas relevant to phase/story.
   *
   * @param {string} phase - Current phase ID
   * @param {string} agentId - Executor agent ID
   * @param {object} storyContext - Story context
   * @returns {Promise<{memories: Array, gotchas: Array, metadata: object}>}
   */
  async getPhaseMemories(phase, agentId, storyContext = {}) {
    const result = { memories: [], gotchas: [], metadata: {} };

    try {
      // GotchasMemory — always available
      const gotchasMemory = this._getGotchasMemory();
      if (gotchasMemory) {
        const taskDesc = `${phase} phase for ${agentId}: ${storyContext.story || ''}`;
        result.gotchas = gotchasMemory.getContextForTask(taskDesc);
      }

      // Pro memories — feature gated
      if (this._isAvailable('pro.memory.pipeline-integration')) {
        const loader = this._getMemoryLoader();
        if (loader) {
          const proMemories = await this._executeWithTimeout(
            () => loader.loadForAgent(agentId, { phase, ...storyContext }),
            TIMEOUTS.getPhaseMemories,
          );
          if (proMemories && Array.isArray(proMemories)) {
            result.memories = proMemories;
            result.metadata.maxConfidence = proMemories.reduce(
              (max, m) => Math.max(max, m.confidence || 0), 0,
            );
          }
        }
      }

      result.metadata.phase = phase;
      result.metadata.agentId = agentId;
      result.metadata.gotchasCount = result.gotchas.length;
      result.metadata.memoriesCount = result.memories.length;
    } catch (error) {
      this._log(`getPhaseMemories error: ${error.message}`);
    }

    return result;
  }

  /**
   * Path 3: Generate a session digest after checkpoint.
   *
   * Pro-only: extracts corrections, patterns, axioms from session.
   *
   * @param {object} sessionContext - Session context
   * @param {string} sessionContext.sessionId - Session identifier
   * @param {string} sessionContext.projectDir - Project directory
   * @param {object} [sessionContext.metadata] - Additional metadata
   * @returns {Promise<{digestPath: string|null, success: boolean}>}
   */
  async generateSessionDigest(sessionContext = {}) {
    const result = { digestPath: null, success: false };

    try {
      if (!this._isAvailable('pro.memory.persistence')) {
        return result;
      }

      const extractor = this._getDigestExtractor();
      if (!extractor) return result;

      const digest = await this._executeWithTimeout(
        () => extractor({
          sessionId: sessionContext.sessionId || `bob-${Date.now()}`,
          projectDir: sessionContext.projectDir || this.projectRoot,
          metadata: sessionContext.metadata || {},
        }),
        TIMEOUTS.generateSessionDigest,
      );

      if (digest && digest.outputPath) {
        result.digestPath = digest.outputPath;
        result.success = true;
      }
    } catch (error) {
      this._log(`generateSessionDigest error: ${error.message}`);
    }

    return result;
  }

  /**
   * Path 4: Trigger self-learning after epic completion.
   *
   * Pro-only: analyzes session history to promote/demote memory tiers.
   * Designed to be called fire-and-forget (non-blocking).
   *
   * @param {object} [options={}]
   * @param {boolean} [options.verbose=false] - Verbose output
   * @returns {Promise<{stats: object, success: boolean}>}
   */
  async triggerSelfLearning(options = {}) {
    const result = { stats: {}, success: false };

    try {
      if (!this._isAvailable('pro.memory.self_learning')) {
        return result;
      }

      const learner = this._getSelfLearner();
      if (!learner) return result;

      const runResult = await this._executeWithTimeout(
        () => learner.run({ verbose: options.verbose || false }),
        TIMEOUTS.triggerSelfLearning,
      );

      if (runResult) {
        result.stats = runResult.stats || runResult;
        result.success = true;
      }
    } catch (error) {
      this._log(`triggerSelfLearning error: ${error.message}`);
    }

    return result;
  }

  // ═══════════════════════════════════════════════════════════════════
  //                         HELPERS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Execute a function with timeout protection.
   * Returns null on timeout instead of throwing.
   *
   * @private
   * @param {Function} fn - Async function to execute
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise<*>} Result or null on timeout
   */
  async _executeWithTimeout(fn, timeoutMs) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this._log(`Timeout after ${timeoutMs}ms`);
        resolve(null);
      }, timeoutMs);

      Promise.resolve(fn())
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          this._log(`Provider error: ${error.message}`);
          resolve(null);
        });
    });
  }

  /**
   * Debug logger.
   * @private
   * @param {string} message
   */
  _log(message) {
    if (this.options.debug) {
      console.log(`[BobMemoryBridge] ${message}`);
    }
  }

  /**
   * Reset internal state. Used for testing.
   * @private
   */
  _reset() {
    this._initialized = false;
    this._featureGate = null;
    this._memoryLoader = null;
    this._selfLearner = null;
    this._digestExtractor = null;
    this._gotchasMemory = null;
  }
}

module.exports = {
  BobMemoryBridge,
  TIMEOUTS,
};
