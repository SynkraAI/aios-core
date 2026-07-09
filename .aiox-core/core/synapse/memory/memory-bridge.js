/**
 * Memory Bridge — MIS consumer for SYNAPSE engine.
 *
 * Connects SynapseEngine to the Memory Intelligence System (MIS)
 * via SynapseMemoryProvider. Implements bracket-aware retrieval with
 * agent-scoped sector filtering and token budget enforcement.
 *
 * Also: session-digest heuristic reinforcement (optional worker).
 *
 * Consumer-only for MIS reads. Graceful no-op when MIS module is not installed.
 *
 * @module core/synapse/memory/memory-bridge
 * @version 2.1.0
 * @created Story SYN-10 - Pro Memory Bridge (Feature-Gated MIS Consumer)
 * @migrated Story INS-4.11 - Removed pro feature gate (AC9)
 * @enhanced CORE-SU memory-bridge heuristics (hub port, OSS-safe)
 */

'use strict';

const { estimateTokens } = require('../utils/tokens');

/** Memory bridge timeout for warm calls (provider already used successfully). */
const BRIDGE_TIMEOUT_MS = 15;
/** Memory bridge timeout for cold calls (first successful retrieval not yet done). */
const BRIDGE_TIMEOUT_COLD_MS = 150;

/**
 * Build heuristic ID regex dynamically from optional registries.
 * Falls back to a broad but safe pattern if registries are unavailable.
 * Cached after first load.
 *
 * @private
 * @returns {RegExp}
 */
let _heuristicRegex = null;
function _getHeuristicRegex() {
  if (_heuristicRegex) return _heuristicRegex;

  try {
    const fs = require('fs');
    const path = require('path');

    // OSS-primary: governance hints. Optional project learning dirs as secondary.
    // Squad expansion configs are optional if present (not required).
    const sources = [
      path.join(__dirname, '..', '..', '..', 'governance', 'global-heuristic-hints.yaml'),
      path.join(process.cwd(), '.aiox', 'learning', 'approved'),
    ];

    const allPrefixes = new Set();
    for (const src of sources) {
      try {
        const stat = fs.statSync(src);
        if (stat.isDirectory()) {
          for (const name of fs.readdirSync(src)) {
            if (!/\.ya?ml$/i.test(name)) continue;
            const content = fs.readFileSync(path.join(src, name), 'utf8');
            for (const id of content.match(/[A-Z]{2,4}_[A-Z]{2,3}_\d{3}/g) || []) {
              allPrefixes.add(id.replace(/_\d{3}$/, ''));
            }
          }
        } else {
          const content = fs.readFileSync(src, 'utf8');
          for (const id of content.match(/[A-Z]{2,4}_[A-Z]{2,3}_\d{3}/g) || []) {
            allPrefixes.add(id.replace(/_\d{3}$/, ''));
          }
        }
      } catch {
        /* source not available */
      }
    }

    if (allPrefixes.size > 0) {
      _heuristicRegex = new RegExp(`\\b(?:${[...allPrefixes].join('|')})_\\d{3}\\b`, 'g');
      return _heuristicRegex;
    }
  } catch {
    // All sources unavailable — use fallback
  }

  // Fallback: [2-4 uppercase]_[2-3 uppercase]_[3 digits]
  _heuristicRegex = /\b[A-Z]{2,4}_[A-Z]{2,3}_\d{3}\b/g;
  return _heuristicRegex;
}

/**
 * Bracket-to-memory-layer mapping.
 *
 * FRESH   → skip (no memory needed)
 * MODERATE → Layer 1 metadata (~50 tokens)
 * DEPLETED → Layer 2 chunks (~200 tokens)
 * CRITICAL → Layer 3 full content (~1000 tokens)
 */
const BRACKET_LAYER_MAP = {
  FRESH: { layer: 0, maxTokens: 0 },
  MODERATE: { layer: 1, maxTokens: 50 },
  DEPLETED: { layer: 2, maxTokens: 200 },
  CRITICAL: { layer: 3, maxTokens: 1000 },
};

/** Default sector for unknown agents. */
const DEFAULT_SECTORS = ['semantic'];

/**
 * MemoryBridge — MIS consumer for SYNAPSE engine.
 */
class MemoryBridge {
  /**
   * @param {object} [options={}]
   * @param {number} [options.timeout=15] - Warm max execution time in ms
   */
  constructor(options = {}) {
    this._timeoutExplicit = options.timeout != null;
    this._timeout = this._timeoutExplicit ? options.timeout : BRIDGE_TIMEOUT_MS;
    this._provider = null;
    /** True after first successful getMemoryHints provider call. */
    this._initialized = false;
    this._pendingIds = null;
    this._flushTimer = null;
  }

  /**
   * Lazy-load the SynapseMemoryProvider (open-source).
   * @private
   * @returns {object|null}
   */
  _getProvider() {
    if (this._provider) return this._provider;

    try {
      const { SynapseMemoryProvider } = require('./synapse-memory-provider');
      this._provider = new SynapseMemoryProvider();
      return this._provider;
    } catch {
      return null;
    }
  }

  /**
   * Get memory hints for the current prompt context.
   *
   * @param {string} agentId
   * @param {string} bracket
   * @param {number} tokenBudget
   * @returns {Promise<Array>}
   */
  async getMemoryHints(agentId, bracket, tokenBudget) {
    try {
      const bracketConfig = BRACKET_LAYER_MAP[bracket];
      if (!bracketConfig || bracketConfig.layer === 0) {
        return [];
      }

      const effectiveBudget = Math.min(
        bracketConfig.maxTokens,
        tokenBudget > 0 ? tokenBudget : bracketConfig.maxTokens,
      );

      if (effectiveBudget <= 0) {
        return [];
      }

      const provider = this._getProvider();
      if (!provider) {
        return [];
      }

      // Cold start: first successful retrieval path not yet completed.
      // Explicit constructor timeout always wins (tests + callers that need hard budgets).
      const effectiveTimeout = this._timeoutExplicit
        ? this._timeout
        : this._initialized
          ? BRIDGE_TIMEOUT_MS
          : BRIDGE_TIMEOUT_COLD_MS;
      const result = await this._executeWithTimeout(
        () => provider.getMemories(agentId, bracket, effectiveBudget),
        effectiveTimeout,
      );

      // Timeout/error path returns { ok: false }; only warm after real success
      if (!result || result.ok === false) {
        return [];
      }
      this._initialized = true;
      return this._enforceTokenBudget(result.value || [], effectiveBudget);
    } catch (error) {
      console.warn(`[synapse:memory-bridge] Error getting memory hints: ${error.message}`);
      return [];
    }
  }

  /**
   * @private
   */
  async _executeWithTimeout(fn, timeoutMs) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        console.warn(`[synapse:memory-bridge] Timeout after ${timeoutMs}ms`);
        resolve({ ok: false, reason: 'timeout' });
      }, timeoutMs);

      Promise.resolve(fn())
        .then((result) => {
          clearTimeout(timer);
          resolve({ ok: true, value: result });
        })
        .catch((error) => {
          clearTimeout(timer);
          console.warn(`[synapse:memory-bridge] Provider error: ${error.message}`);
          resolve({ ok: false, reason: 'error' });
        });
    });
  }

  /**
   * @private
   */
  _enforceTokenBudget(hints, budget) {
    if (!Array.isArray(hints) || hints.length === 0) {
      return [];
    }

    const result = [];
    let tokensUsed = 0;

    for (const hint of hints) {
      const hintTokens = hint.tokens || estimateTokens(hint.content || '');
      if (tokensUsed + hintTokens > budget) {
        break;
      }
      result.push({ ...hint, tokens: hintTokens });
      tokensUsed += hintTokens;
    }

    return result;
  }

  /**
   * Clear provider cache. Used for testing and session reset.
   */
  clearCache() {
    if (this._provider && typeof this._provider.clearCache === 'function') {
      this._provider.clearCache();
    }
  }

  /**
   * Process a session digest to extract and reinforce applied heuristics.
   * Fire-and-forget via setImmediate + 5s debounce batching.
   *
   * @param {string} digestText
   * @returns {void}
   */
  processSessionDigest(digestText) {
    if (!digestText || typeof digestText !== 'string') return;

    setImmediate(() => {
      try {
        const heuristicRegex = _getHeuristicRegex();
        const rawMatches = digestText.match(heuristicRegex) || [];
        const uniqueIds = [...new Set(rawMatches)];

        if (uniqueIds.length > 0) {
          this._queueReinforcement(uniqueIds);
        }
      } catch (error) {
        console.warn(`[synapse:memory-bridge] Error processing digest: ${error.message}`);
      }
    });
  }

  /**
   * @private
   * @param {string[]} heuristicIds
   */
  _queueReinforcement(heuristicIds) {
    if (!this._pendingIds) this._pendingIds = new Set();

    for (const id of heuristicIds) {
      this._pendingIds.add(id);
    }

    if (this._flushTimer) clearTimeout(this._flushTimer);

    this._flushTimer = setTimeout(() => {
      const batch = [...this._pendingIds];
      this._pendingIds.clear();
      this._flushTimer = null;

      if (batch.length > 0) {
        this._reinforceHeuristics(batch);
      }
    }, 5000);

    // Allow process to exit in tests / short-lived CLI if nothing else holds the loop
    if (typeof this._flushTimer.unref === 'function') {
      this._flushTimer.unref();
    }
  }

  /**
   * Dispatch reinforcement update to a background worker (best-effort).
   * @private
   * @param {string[]} heuristicIds
   */
  _reinforceHeuristics(heuristicIds) {
    const path = require('path');
    const { spawn } = require('child_process');

    const workerPath = path.join(__dirname, '..', '..', '..', 'scripts', 'reinforce-heuristic.js');

    try {
      const worker = spawn('node', [workerPath, ...heuristicIds], {
        detached: true,
        stdio: 'ignore',
      });
      worker.on('error', (error) => {
        console.warn(
          `[synapse:memory-bridge] Reinforcement worker error: ${error.message}`,
        );
      });
      worker.unref();
    } catch (error) {
      console.warn(
        `[synapse:memory-bridge] Failed to dispatch reinforcement worker: ${error.message}`,
      );
    }
  }

  /**
   * Reset internal state. Used for testing.
   * @private
   */
  _reset() {
    this._provider = null;
    this._initialized = false;
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
      this._flushTimer = null;
    }
    this._pendingIds = null;
  }
}

module.exports = {
  MemoryBridge,
  BRACKET_LAYER_MAP,
  BRIDGE_TIMEOUT_MS,
  BRIDGE_TIMEOUT_COLD_MS,
  DEFAULT_SECTORS,
  // test helper: reset module-level regex cache
  _resetHeuristicRegexCache() {
    _heuristicRegex = null;
  },
};
