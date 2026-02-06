/**
 * Unified Activation Pipeline - Single Entry Point for All 12 Agents
 *
 * Story ACT-6: Eliminates divergence between Path A (9 agents) and Path B (3 agents)
 * by providing a single activation pipeline with identical context richness for ALL agents.
 *
 * Architecture:
 *   Steps 1-5 load in parallel via Promise.all():
 *     1. AgentConfigLoader.loadComplete(coreConfig)
 *     2. SessionContextLoader.loadContext(agentId)
 *     3. ProjectStatusLoader.loadProjectStatus()
 *     4. GitConfigDetector.get()
 *     5. PermissionMode.load() + getBadge()
 *   Sequential steps (data dependencies):
 *     6. GreetingPreferenceManager.getPreference(userProfile) (sync, fast)
 *     7. ContextDetector.detectSessionType() (depends on session context)
 *     8. WorkflowNavigator.detectWorkflowState() (depends on session + type)
 *   Final:
 *     9. GreetingBuilder.buildGreeting(enrichedContext)
 *
 * Performance Targets:
 *   - Parallel loading: <100ms
 *   - Total activation: <200ms
 *   - Fallback: <10ms
 *
 * Usage:
 *   const { UnifiedActivationPipeline } = require('./unified-activation-pipeline');
 *   const pipeline = new UnifiedActivationPipeline();
 *   const greeting = await pipeline.activate('dev');
 *
 * @module development/scripts/unified-activation-pipeline
 * @see greeting-builder.js - Core greeting class
 * @see generate-greeting.js - CLI wrapper (now thin wrapper around this pipeline)
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');

const GreetingBuilder = require('./greeting-builder');
const { AgentConfigLoader } = require('./agent-config-loader');
const SessionContextLoader = require('../../core/session/context-loader');
const { loadProjectStatus } = require('../../infrastructure/scripts/project-status-loader');
const GitConfigDetector = require('../../infrastructure/scripts/git-config-detector');
const { PermissionMode } = require('../../core/permissions');
const GreetingPreferenceManager = require('./greeting-preference-manager');
const ContextDetector = require('../../core/session/context-detector');
const WorkflowNavigator = require('./workflow-navigator');

/**
 * Per-loader timeout (ms). If any single loader exceeds this, it falls back to defaults.
 * @type {number}
 */
const LOADER_TIMEOUT_MS = 150;

/**
 * Total pipeline timeout (ms). If the entire activation exceeds this, fallback greeting.
 * @type {number}
 */
const PIPELINE_TIMEOUT_MS = 200;

/**
 * All 12 supported agent IDs.
 * @type {string[]}
 */
const ALL_AGENT_IDS = [
  'dev', 'qa', 'architect', 'pm', 'po', 'sm',
  'analyst', 'data-engineer', 'ux-design-expert',
  'devops', 'aios-master', 'squad-creator',
];

class UnifiedActivationPipeline {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.greetingBuilder = options.greetingBuilder || new GreetingBuilder();
    this.preferenceManager = options.preferenceManager || new GreetingPreferenceManager();
    this.contextDetector = options.contextDetector || new ContextDetector();
    this.workflowNavigator = options.workflowNavigator || new WorkflowNavigator();
    this.gitConfigDetector = options.gitConfigDetector || new GitConfigDetector();
  }

  /**
   * Activate an agent through the unified pipeline.
   *
   * @param {string} agentId - Agent identifier (e.g., 'dev', 'qa', 'pm')
   * @param {Object} [options] - Activation options
   * @param {Array} [options.conversationHistory] - Conversation history for context detection
   * @returns {Promise<{greeting: string, context: Object, duration: number}>}
   *   greeting - Formatted greeting string ready for display
   *   context  - The enriched context object assembled by the pipeline
   *   duration - Total activation time in ms
   */
  async activate(agentId, options = {}) {
    const startTime = Date.now();

    try {
      // Race: full pipeline vs timeout (clear timer to prevent leak)
      const { promise: timeoutPromise, timerId } = this._timeoutFallback(agentId, PIPELINE_TIMEOUT_MS);
      const result = await Promise.race([
        this._runPipeline(agentId, options),
        timeoutPromise,
      ]);
      clearTimeout(timerId);

      result.duration = Date.now() - startTime;
      return result;

    } catch (error) {
      console.warn(`[UnifiedActivationPipeline] Activation failed for ${agentId}:`, error.message);
      const fallbackGreeting = this._generateFallbackGreeting(agentId);
      return {
        greeting: fallbackGreeting,
        context: this._getDefaultContext(agentId),
        duration: Date.now() - startTime,
        fallback: true,
      };
    }
  }

  /**
   * Run the full activation pipeline.
   * @private
   * @param {string} agentId - Agent identifier
   * @param {Object} options - Activation options
   * @returns {Promise<{greeting: string, context: Object}>}
   */
  async _runPipeline(agentId, options = {}) {
    // --- Phase 1: Parallel loading (Steps 1-5) ---
    const coreConfig = await this._loadCoreConfig();

    const [
      agentComplete,
      sessionContext,
      projectStatus,
      gitConfig,
      permissionData,
    ] = await Promise.all([
      this._safeLoad('AgentConfigLoader', () => {
        const loader = new AgentConfigLoader(agentId);
        return loader.loadComplete(coreConfig);
      }),
      this._safeLoad('SessionContextLoader', () => {
        const loader = new SessionContextLoader();
        return loader.loadContext(agentId);
      }),
      this._safeLoad('ProjectStatusLoader', () => loadProjectStatus()),
      this._safeLoad('GitConfigDetector', () => this.gitConfigDetector.get()),
      this._safeLoad('PermissionMode', async () => {
        const mode = new PermissionMode(this.projectRoot);
        await mode.load();
        return { mode: mode.currentMode, badge: mode.getBadge() };
      }),
    ]);

    // --- Phase 2: Build agent definition from loaded data ---
    const agentDefinition = this._buildAgentDefinition(agentId, agentComplete);

    // --- Phase 3: Sequential steps with data dependencies ---

    // Step 6: Greeting preference (sync, fast - depends on user profile from builder)
    const userProfile = this.greetingBuilder.loadUserProfile();
    const preference = this._resolvePreference(agentDefinition, userProfile);

    // Step 7: Session type detection (depends on session context)
    const sessionType = this._detectSessionType(sessionContext, options);

    // Step 8: Workflow state detection (depends on session + type)
    const workflowState = this._detectWorkflowState(sessionContext, sessionType);

    // --- Phase 4: Assemble enriched context ---
    const enrichedContext = {
      agent: agentDefinition,
      config: agentComplete?.config || {},
      session: sessionContext || this._getDefaultSessionContext(),
      projectStatus: projectStatus || null,
      gitConfig: gitConfig || { configured: false, type: null, branch: null },
      permissions: permissionData || { mode: 'ask', badge: '[Ask]' },
      preference,
      sessionType,
      workflowState,
      userProfile,
      // Legacy context fields for backward compatibility with GreetingBuilder
      conversationHistory: options.conversationHistory || [],
      lastCommands: sessionContext?.lastCommands || [],
      previousAgent: sessionContext?.previousAgent || null,
      sessionMessage: sessionContext?.message || null,
      workflowActive: sessionContext?.workflowActive || null,
      sessionStory: sessionContext?.currentStory || null,
    };

    // --- Phase 5: Build greeting via GreetingBuilder ---
    const greeting = await this.greetingBuilder.buildGreeting(agentDefinition, enrichedContext);

    return { greeting, context: enrichedContext };
  }

  /**
   * Load core configuration from YAML.
   * @private
   * @returns {Promise<Object>} Core config object
   */
  async _loadCoreConfig() {
    try {
      const configPath = path.join(this.projectRoot, '.aios-core', 'core-config.yaml');
      const content = await fs.readFile(configPath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      console.warn('[UnifiedActivationPipeline] Failed to load core config:', error.message);
      return {};
    }
  }

  /**
   * Safe loader wrapper with per-loader timeout and fallback.
   * @private
   * @param {string} loaderName - Name for logging
   * @param {Function} loaderFn - Async function that performs the load
   * @returns {Promise<*>} Loaded data or null on failure
   */
  async _safeLoad(loaderName, loaderFn) {
    try {
      const result = await Promise.race([
        loaderFn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`${loaderName} timeout (${LOADER_TIMEOUT_MS}ms)`)), LOADER_TIMEOUT_MS),
        ),
      ]);
      return result;
    } catch (error) {
      console.warn(`[UnifiedActivationPipeline] ${loaderName} failed:`, error.message);
      return null;
    }
  }

  /**
   * Build agent definition from loaded config data.
   * @private
   * @param {string} agentId - Agent ID
   * @param {Object|null} agentComplete - Data from AgentConfigLoader.loadComplete()
   * @returns {Object} Agent definition object suitable for GreetingBuilder
   */
  _buildAgentDefinition(agentId, agentComplete) {
    if (agentComplete && agentComplete.agent) {
      return {
        ...agentComplete.agent,
        id: agentComplete.agent.id || agentId,
        persona_profile: agentComplete.persona_profile || agentComplete.definition?.persona_profile,
        persona: agentComplete.definition?.persona || agentComplete.persona,
        commands: agentComplete.commands || agentComplete.definition?.commands || [],
      };
    }

    // Fallback: minimal agent definition
    return {
      id: agentId,
      name: agentId,
      icon: this._getDefaultIcon(agentId),
      persona_profile: {
        greeting_levels: {
          minimal: `${this._getDefaultIcon(agentId)} ${agentId} Agent ready`,
          named: `${this._getDefaultIcon(agentId)} ${agentId} ready`,
          archetypal: `${this._getDefaultIcon(agentId)} ${agentId} ready`,
        },
      },
      persona: { role: agentId },
      commands: [],
    };
  }

  /**
   * Resolve greeting preference, accounting for bob mode and PM agent.
   * @private
   * @param {Object} agentDefinition - Agent definition
   * @param {string} userProfile - User profile ('bob' | 'advanced')
   * @returns {string} Effective preference
   */
  _resolvePreference(agentDefinition, userProfile) {
    // PM agent bypasses bob mode restriction (PM is primary interface in bob mode)
    const effectiveProfile = (userProfile === 'bob' && agentDefinition.id === 'pm')
      ? 'advanced'
      : userProfile;

    return this.preferenceManager.getPreference(effectiveProfile);
  }

  /**
   * Detect session type from session context.
   * @private
   * @param {Object|null} sessionContext - Session context data
   * @param {Object} options - Activation options
   * @returns {string} 'new' | 'existing' | 'workflow'
   */
  _detectSessionType(sessionContext, options) {
    try {
      // If conversation history provided, prefer that
      if (options.conversationHistory && options.conversationHistory.length > 0) {
        return this.contextDetector.detectSessionType(options.conversationHistory);
      }

      // Use pre-detected session type from SessionContextLoader
      if (sessionContext && sessionContext.sessionType) {
        return sessionContext.sessionType;
      }

      // Fallback to file-based detection
      return this.contextDetector.detectSessionType([]);
    } catch (error) {
      console.warn('[UnifiedActivationPipeline] Session type detection failed:', error.message);
      return 'new';
    }
  }

  /**
   * Detect workflow state from session context and session type.
   * Story ACT-5: Relaxed trigger - now detects workflows for any non-new session.
   * Previously required sessionType === 'workflow' which was too restrictive.
   * @private
   * @param {Object|null} sessionContext - Session context data
   * @param {string} sessionType - Detected session type
   * @returns {Object|null} Workflow state or null
   */
  _detectWorkflowState(sessionContext, sessionType) {
    try {
      // Story ACT-5: Relaxed from sessionType !== 'workflow' to sessionType === 'new'
      // Workflow detection should happen for 'existing' and 'workflow' sessions
      if (sessionType === 'new' || !sessionContext) {
        return null;
      }

      const commandHistory = sessionContext.lastCommands || [];
      if (commandHistory.length === 0) {
        return null;
      }

      return this.workflowNavigator.detectWorkflowState(commandHistory, sessionContext);
    } catch (error) {
      console.warn('[UnifiedActivationPipeline] Workflow detection failed:', error.message);
      return null;
    }
  }

  /**
   * Create a timeout promise that resolves with a fallback greeting.
   * @private
   * @param {string} agentId - Agent ID
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise} Resolves after timeout with fallback
   */
  _timeoutFallback(agentId, timeoutMs) {
    let timerId;
    const promise = new Promise((resolve) => {
      timerId = setTimeout(() => {
        console.warn(`[UnifiedActivationPipeline] Pipeline timeout (${timeoutMs}ms) for ${agentId}`);
        resolve({
          greeting: this._generateFallbackGreeting(agentId),
          context: this._getDefaultContext(agentId),
          fallback: true,
        });
      }, timeoutMs);
    });
    return { promise, timerId };
  }

  /**
   * Generate fallback greeting when pipeline fails.
   * @private
   * @param {string} agentId - Agent ID
   * @returns {string} Simple fallback greeting
   */
  _generateFallbackGreeting(agentId) {
    const icon = this._getDefaultIcon(agentId);
    return `${icon} ${agentId} Agent ready\n\nType \`*help\` to see available commands.`;
  }

  /**
   * Get default icon for agent.
   * @private
   * @param {string} agentId - Agent ID
   * @returns {string} Default icon emoji
   */
  _getDefaultIcon(agentId) {
    const icons = {
      'dev': '\uD83D\uDCBB',
      'qa': '\uD83D\uDD0D',
      'architect': '\uD83C\uDFD7\uFE0F',
      'pm': '\uD83D\uDCCA',
      'po': '\uD83D\uDCCB',
      'sm': '\uD83C\uDFC3',
      'analyst': '\uD83D\uDD2C',
      'data-engineer': '\uD83D\uDDC4\uFE0F',
      'ux-design-expert': '\uD83C\uDFA8',
      'devops': '\u2699\uFE0F',
      'aios-master': '\uD83D\uDC51',
      'squad-creator': '\uD83D\uDC65',
    };
    return icons[agentId] || '\uD83E\uDD16';
  }

  /**
   * Get default session context when loader fails.
   * @private
   * @returns {Object} Default session context
   */
  _getDefaultSessionContext() {
    return {
      sessionType: 'new',
      message: null,
      previousAgent: null,
      lastCommands: [],
      workflowActive: null,
      currentStory: null,
    };
  }

  /**
   * Get default enriched context when pipeline fails.
   * @private
   * @param {string} agentId - Agent ID
   * @returns {Object} Default context
   */
  _getDefaultContext(agentId) {
    return {
      agent: { id: agentId, name: agentId, icon: this._getDefaultIcon(agentId) },
      config: {},
      session: this._getDefaultSessionContext(),
      projectStatus: null,
      gitConfig: { configured: false, type: null, branch: null },
      permissions: { mode: 'ask', badge: '[Ask]' },
      preference: 'auto',
      sessionType: 'new',
      workflowState: null,
      userProfile: 'advanced',
      conversationHistory: [],
      lastCommands: [],
      previousAgent: null,
      sessionMessage: null,
      workflowActive: null,
      sessionStory: null,
    };
  }

  /**
   * Get list of all supported agent IDs.
   * @returns {string[]} Array of agent IDs
   */
  static getAllAgentIds() {
    return [...ALL_AGENT_IDS];
  }

  /**
   * Validate that an agent ID is supported.
   * @param {string} agentId - Agent ID to validate
   * @returns {boolean} True if valid
   */
  static isValidAgentId(agentId) {
    return ALL_AGENT_IDS.includes(agentId);
  }
}

module.exports = { UnifiedActivationPipeline, ALL_AGENT_IDS };
