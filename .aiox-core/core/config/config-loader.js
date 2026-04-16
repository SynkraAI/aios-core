/**
 * @deprecated Use config-resolver.js for config resolution, agent-config-loader.js for agent configs.
 * This file will be removed in v4.0.0.
 *
 * Migration guide:
 * - Config resolution: const { resolveConfig } = require('./config-resolver');
 *                      const config = await resolveConfig(projectRoot);
 * - Agent config:      const { AgentConfigLoader } = require('./agent-config-loader');
 *                      const loader = new AgentConfigLoader(agentId);
 *                      const config = await loader.load(coreConfig);
 *
 * AIOX Config Loader with Lazy Loading
 *
 * Intelligent configuration loader that only loads what each agent needs,
 * significantly reducing memory footprint and load times.
 *
 * @module core/config/config-loader
 * @version 1.0.0
 * @created 2025-01-16 (Story 6.1.2.6)
 * @migrated Story 2.2 - Core Module Creation
 * @deprecated Since Story 6.1.4 - Use agent-config-loader.js instead
 * @deprecated Since Story PRO-4 - Use config-resolver.js for layered config resolution
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Config cache with TTL
 */
const configCache = {
  full: null,
  sections: {},
  lastLoad: null,
  TTL: 5 * 60 * 1000,  // 5 minutes
};

/**
 * Agent requirements mapping (from agent-config-requirements.yaml)
 */
const agentRequirements = {
  dev: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations', 'pvMindContext', 'hybridOpsConfig'],
  qa: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  po: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  pm: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading'],
  sm: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  architect: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  analyst: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  'data-engineer': ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations', 'pvMindContext', 'hybridOpsConfig'],
  devops: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  'aiox-master': ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'registry', 'expansionPacks', 'toolConfigurations'],
  'ux-expert': ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
  'db-sage': ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations', 'pvMindContext', 'hybridOpsConfig'],
  security: ['frameworkDocsLocation', 'projectDocsLocation', 'devLoadAlwaysFiles', 'lazyLoading', 'toolConfigurations'],
};

/**
 * Always-loaded sections (lightweight, needed by all)
 */
const ALWAYS_LOADED = [
  'frameworkDocsLocation',
  'projectDocsLocation',
  'devLoadAlwaysFiles',
  'lazyLoading',
];

/**
 * Performance tracking
 */
const performanceMetrics = {
  loads: 0,
  cacheHits: 0,
  cacheMisses: 0,
  avgLoadTime: 0,
  totalLoadTime: 0,
};

/**
 * Checks if the configuration cache is still valid based on TTL
 *
 * @returns {boolean} True if cache exists and has not expired
 */
function isCacheValid() {
  if (!configCache.lastLoad) return false;

  const now = Date.now();
  const age = now - configCache.lastLoad;

  return age < configCache.TTL;
}

/**
 * Loads the full core-config.yaml file from disk
 *
 * Used for initial load or cache refresh. The result is cached internally
 * and subsequent calls within the TTL window return the cached version.
 *
 * @returns {Promise<Object>} Parsed configuration object
 * @throws {Error} If the config file cannot be read or parsed
 */
async function loadFullConfig() {
  const configPath = path.join('.aiox-core', 'core-config.yaml');

  const startTime = Date.now();

  try {
    const content = await fs.readFile(configPath, 'utf8');
    const config = yaml.load(content);

    const loadTime = Date.now() - startTime;

    // Update performance metrics
    performanceMetrics.loads++;
    performanceMetrics.totalLoadTime += loadTime;
    performanceMetrics.avgLoadTime = performanceMetrics.totalLoadTime / performanceMetrics.loads;

    // Cache full config
    configCache.full = config;
    configCache.lastLoad = Date.now();

    return config;
  } catch (error) {
    console.error('Failed to load core-config.yaml:', error.message);
    throw new Error(`Config load failed: ${error.message}`);
  }
}

/**
 * Loads specific config sections on demand
 *
 * If the cache is valid, returns sections from cache. Otherwise performs
 * a full config reload and extracts the requested sections.
 * Sections that do not exist in the config are silently omitted.
 *
 * @param {string[]} sections - Array of section names to load
 * @returns {Promise<Object>} Config object containing only the requested sections
 * @throws {Error} If config file cannot be read or parsed (on cache miss)
 */
async function loadConfigSections(sections) {
  const startTime = Date.now();

  // Check cache first
  if (isCacheValid() && configCache.full) {
    performanceMetrics.cacheHits++;

    const config = {};
    sections.forEach(section => {
      if (configCache.full[section] !== undefined) {
        config[section] = configCache.full[section];
      }
    });

    return config;
  }

  // Cache miss - load full config
  performanceMetrics.cacheMisses++;
  const fullConfig = await loadFullConfig();

  // Extract requested sections
  const config = {};
  sections.forEach(section => {
    if (fullConfig[section] !== undefined) {
      config[section] = fullConfig[section];
    }
  });

  const loadTime = Date.now() - startTime;
  console.log(`⚡ Loaded ${sections.length} sections in ${loadTime}ms`);

  return config;
}

/**
 * Loads config for a specific agent with lazy loading
 *
 * Only loads the configuration sections required by the given agent,
 * as defined in the agentRequirements mapping. Falls back to
 * ALWAYS_LOADED sections for unknown agent IDs.
 *
 * @param {string} agentId - Agent ID (e.g., 'dev', 'qa', 'po', 'architect')
 * @returns {Promise<Object>} Config object with only the sections needed by the agent
 * @throws {Error} If config file cannot be read or parsed
 * @example
 * const config = await loadAgentConfig('dev');
 * // Returns { frameworkDocsLocation, projectDocsLocation, toolConfigurations, ... }
 */
async function loadAgentConfig(agentId) {
  const startTime = Date.now();

  // Get required sections for this agent
  const requiredSections = agentRequirements[agentId] || ALWAYS_LOADED;

  console.log(`📦 Loading config for @${agentId} (${requiredSections.length} sections)...`);

  const config = await loadConfigSections(requiredSections);

  const loadTime = Date.now() - startTime;

  // Calculate size estimate
  const sizeKB = (JSON.stringify(config).length / 1024).toFixed(1);

  console.log(`✅ Config loaded in ${loadTime}ms (~${sizeKB} KB)`);

  return config;
}

/**
 * Loads only the always-loaded (minimal) configuration sections
 *
 * Returns the lightweight subset of config needed by all agents:
 * frameworkDocsLocation, projectDocsLocation, devLoadAlwaysFiles, and lazyLoading.
 *
 * @returns {Promise<Object>} Minimal config with always-loaded sections
 * @throws {Error} If config file cannot be read or parsed
 */
async function loadMinimalConfig() {
  return await loadConfigSections(ALWAYS_LOADED);
}

/**
 * Preloads the full configuration into cache for startup optimization
 *
 * Call this during application initialization to avoid cold cache
 * misses on the first config access.
 *
 * @returns {Promise<void>}
 */
async function preloadConfig() {
  console.log('🔄 Preloading config into cache...');
  await loadFullConfig();
  console.log('✅ Config preloaded');
}

/**
 * Clears the entire config cache, forcing a full reload on next access
 *
 * Useful for testing scenarios or when the config file has been
 * modified externally and a fresh load is required.
 *
 * @returns {void}
 */
function clearCache() {
  configCache.full = null;
  configCache.sections = {};
  configCache.lastLoad = null;
  console.log('🗑️ Config cache cleared');
}

/**
 * Gets performance metrics
 *
 * @returns {Object} Performance statistics
 */
function getPerformanceMetrics() {
  return {
    ...performanceMetrics,
    cacheHitRate: (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) > 0
      ? ((performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses)) * 100).toFixed(1) + '%'
      : '0%',
    avgLoadTimeMs: Math.round(performanceMetrics.avgLoadTime),
  };
}

/**
 * Validates that all required config sections exist for a given agent
 *
 * Loads the full config and checks that every section listed in the
 * agent's requirements is present. Returns a detailed validation result
 * including any missing sections.
 *
 * @param {string} agentId - Agent ID to validate (e.g., 'dev', 'qa')
 * @returns {Promise<{valid: boolean, agentId: string, requiredSections: string[], missingSections: string[], availableSections: string[]}>} Validation result
 * @throws {Error} If config file cannot be read or parsed
 */
async function validateAgentConfig(agentId) {
  const requiredSections = agentRequirements[agentId] || ALWAYS_LOADED;

  const config = await loadFullConfig();

  const missingSections = requiredSections.filter(
    section => config[section] === undefined,
  );

  return {
    valid: missingSections.length === 0,
    agentId,
    requiredSections,
    missingSections,
    availableSections: Object.keys(config),
  };
}

/**
 * Gets a single config section on demand via async lazy load
 *
 * Leverages the caching layer so repeated calls for the same section
 * within the TTL window are served from cache.
 *
 * @param {string} sectionName - Section name to load (e.g., 'toolConfigurations')
 * @returns {Promise<*>} Section content, or undefined if the section does not exist
 * @example
 * const tools = await getConfigSection('toolConfigurations');
 */
async function getConfigSection(sectionName) {
  const config = await loadConfigSections([sectionName]);
  return config[sectionName];
}

// Export functions
module.exports = {
  loadAgentConfig,
  loadConfigSections,
  loadMinimalConfig,
  loadFullConfig,
  preloadConfig,
  clearCache,
  getPerformanceMetrics,
  validateAgentConfig,
  getConfigSection,
  agentRequirements,
  ALWAYS_LOADED,
};
