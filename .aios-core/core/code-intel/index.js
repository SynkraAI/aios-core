'use strict';

const { CodeIntelClient } = require('./code-intel-client');
const { CodeIntelEnricher } = require('./code-intel-enricher');
const { CodeIntelProvider, CAPABILITIES } = require('./providers/provider-interface');
const { CodeGraphProvider, TOOL_MAP } = require('./providers/code-graph-provider');

// Singleton client instance (lazily initialized)
let _defaultClient = null;
let _defaultEnricher = null;

/**
 * Get the default CodeIntelClient singleton.
 * @param {Object} [options] - Options to pass on first creation
 * @returns {CodeIntelClient}
 */
function getClient(options) {
  if (!_defaultClient) {
    _defaultClient = new CodeIntelClient(options);
  }
  return _defaultClient;
}

/**
 * Get the default CodeIntelEnricher singleton.
 * @param {Object} [options] - Options to pass to client on first creation
 * @returns {CodeIntelEnricher}
 */
function getEnricher(options) {
  if (!_defaultEnricher) {
    _defaultEnricher = new CodeIntelEnricher(getClient(options));
  }
  return _defaultEnricher;
}

/**
 * Check if any code intelligence provider is available.
 * @returns {boolean}
 */
function isCodeIntelAvailable() {
  return getClient().isCodeIntelAvailable();
}

/**
 * Enrich a base result with code intelligence data.
 * Graceful — never throws, returns baseResult unchanged on failure.
 *
 * @param {*} baseResult - The base result to enrich
 * @param {Object} options - Enrichment options
 * @param {string[]} options.capabilities - List of enricher capabilities to use
 * @param {number} [options.timeout=5000] - Timeout in ms
 * @param {string} [options.fallbackBehavior='warn-and-continue'] - Fallback strategy
 * @returns {Promise<*>} Enriched result or baseResult on failure
 */
async function enrichWithCodeIntel(baseResult, options = {}) {
  if (!isCodeIntelAvailable()) {
    return baseResult;
  }

  const enricher = getEnricher();
  const enrichments = {};

  try {
    const timeout = options.timeout || 5000;
    const capabilities = options.capabilities || [];

    const promises = capabilities.map(async (cap) => {
      if (typeof enricher[cap] === 'function') {
        let timer;
        try {
          const result = await Promise.race([
            enricher[cap](options.target || '.'),
            new Promise((_, reject) => {
              timer = setTimeout(() => reject(new Error('timeout')), timeout);
            }),
          ]);
          enrichments[cap] = result;
        } finally {
          clearTimeout(timer);
        }
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    // Graceful — never throws
    if (options.fallbackBehavior !== 'silent') {
      console.warn('[code-intel] Enrichment failed, returning base result:', error.message);
    }
  }

  return { ...baseResult, _codeIntel: enrichments };
}

/**
 * Reset singletons (for testing).
 */
function _resetForTesting() {
  _defaultClient = null;
  _defaultEnricher = null;
}

module.exports = {
  // Singletons
  getClient,
  getEnricher,

  // Convenience
  isCodeIntelAvailable,
  enrichWithCodeIntel,

  // Classes (for custom instances)
  CodeIntelClient,
  CodeIntelEnricher,
  CodeIntelProvider,
  CodeGraphProvider,

  // Constants
  CAPABILITIES,
  TOOL_MAP,

  // Testing
  _resetForTesting,
};
