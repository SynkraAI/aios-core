#!/usr/bin/env node
/**
 * Unified Greeting Generator - CLI Orchestrator
 *
 * ARCHITECTURE NOTE:
 * This is a CLI WRAPPER that uses greeting-builder.js internally.
 * It orchestrates context loading before calling GreetingBuilder.
 *
 * - This file: CLI entry point, loads context from filesystem
 * - greeting-builder.js: Core logic, GreetingBuilder class
 *
 * Orchestrates all greeting components for optimal performance:
 * - Agent definition (via expanded agent-config-loader.js)
 * - Session context (session-context-loader.js)
 * - Project status (project-status-loader.js)
 * - User preferences (greeting-preference-manager.js)
 * - Contextual adaptation (greeting-builder.js)
 *
 * Performance Targets:
 * - With cache: <50ms
 * - Without cache: <150ms (timeout protection)
 * - Fallback: <10ms
 *
 * Usage: node generate-greeting.js <agent-id>
 *
 * Used by: @devops, @data-engineer, @ux-design-expert (CLI invocation pattern)
 *
 * @see docs/architecture/greeting-system.md for full architecture documentation
 * @see greeting-builder.js for core greeting logic
 *
 * Part of Story 6.1.4: Unified Greeting System Integration
 */

const GreetingBuilder = require('./greeting-builder');
const SessionContextLoader = require('../../scripts/session-context-loader');
const { loadProjectStatus } = require('../../infrastructure/scripts/project-status-loader');
const { AgentConfigLoader } = require('./agent-config-loader');
const { resolveConfig } = require('../../core/config/config-resolver');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Story 12.5: Bob session check integration
let BobOrchestrator, runStartupCleanup;
try {
  ({ BobOrchestrator } = require('../../core/orchestration/bob-orchestrator'));
  ({ runStartupCleanup } = require('../../core/orchestration/data-lifecycle-manager'));
} catch {
  // Modules not available - bob session check will be skipped
}

/**
 * Generate unified greeting for agent activation
 * 
 * @param {string} agentId - Agent identifier (e.g., 'qa', 'dev')
 * @returns {Promise<string>} Formatted greeting string
 * @throws {Error} If agent file not found or invalid
 * 
 * @example
 * const greeting = await generateGreeting('qa');
 * console.log(greeting);
 */
async function generateGreeting(agentId) {
  const startTime = Date.now();
  const projectRoot = process.cwd();

  try {
    // Story 12.5: Bob session check BEFORE greeting
    const bobSessionResult = await checkBobSession(projectRoot);
    if (bobSessionResult) {
      return bobSessionResult;
    }

    // Load core config
    const coreConfigPath = path.join(projectRoot, '.aios-core', 'core-config.yaml');
    const coreConfigContent = await fs.readFile(coreConfigPath, 'utf8');
    const coreConfig = yaml.load(coreConfigContent);

    // Load everything in parallel using expanded AgentConfigLoader
    const loader = new AgentConfigLoader(agentId);

    const [complete, sessionContext, projectStatus] = await Promise.all([
      loader.loadComplete(coreConfig), // Loads config + definition
      loadSessionContext(agentId),
      loadProjectStatus(),
    ]);
    
    // Build unified context
    const context = {
      conversationHistory: [], // Not available in Claude Code
      sessionType: sessionContext.sessionType, // Pre-detected
      projectStatus: projectStatus, // Pre-loaded
      lastCommands: sessionContext.lastCommands || [],
      previousAgent: sessionContext.previousAgent,
      sessionMessage: sessionContext.message,
      workflowActive: sessionContext.workflowActive,
      sessionStory: sessionContext.currentStory || null, // Session's current story (more accurate than git)
    };
    
    // Ensure agent has persona_profile and persona from definition
    const agentWithPersona = {
      ...complete.agent,
      persona_profile: complete.persona_profile || complete.definition?.persona_profile,
      persona: complete.definition?.persona || complete.persona,
      commands: complete.commands || complete.definition?.commands || [],
    };
    
    // Generate greeting using GreetingBuilder
    const builder = new GreetingBuilder();
    const greeting = await builder.buildGreeting(agentWithPersona, context);
    
    const duration = Date.now() - startTime;
    if (duration > 100) {
      console.warn(`[generate-greeting] Slow generation: ${duration}ms`);
    }
    
    return greeting;
    
  } catch (error) {
    console.error('[generate-greeting] Error:', {
      agentId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    
    // Fallback: Simple greeting
    return generateFallbackGreeting(agentId);
  }
}

/**
 * Story 12.5: Check for existing Bob session before greeting.
 * Only runs when user_profile=bob AND BobOrchestrator is available.
 * Returns formatted session resume prompt, or null to continue with normal greeting.
 *
 * @private
 * @param {string} projectRoot - Project root path
 * @returns {Promise<string|null>} Session resume message or null
 */
async function checkBobSession(projectRoot) {
  if (!BobOrchestrator || !runStartupCleanup) {
    return null;
  }

  try {
    // Check if user_profile is bob
    const result = resolveConfig(projectRoot, { skipCache: true });
    if (result?.config?.user_profile !== 'bob') {
      return null;
    }

    // Run data lifecycle cleanup (non-blocking, best-effort)
    await runStartupCleanup(projectRoot).catch(() => {});

    // Check for existing session
    const orchestrator = new BobOrchestrator(projectRoot);
    const sessionCheck = await orchestrator._checkExistingSession();

    if (!sessionCheck.hasSession) {
      return null;
    }

    // Session found - return formatted resume prompt
    const lines = [];
    if (sessionCheck.formattedMessage) {
      lines.push(sessionCheck.formattedMessage);
    }
    lines.push('');
    lines.push('**Opções:**');
    lines.push('  [1] Continuar de onde parou');
    lines.push('  [2] Revisar estado antes de continuar');
    lines.push('  [3] Recomeçar do zero');
    lines.push('  [4] Descartar sessão anterior');

    return lines.join('\n');
  } catch (error) {
    // Session check failed - continue with normal greeting
    return null;
  }
}

/**
 * Load session context for agent
 * @private
 * @param {string} agentId - Agent ID
 * @returns {Promise<Object>} Session context
 */
async function loadSessionContext(agentId) {
  try {
    const loader = new SessionContextLoader();
    return loader.loadContext(agentId);
  } catch (error) {
    console.warn('[generate-greeting] Session context failed:', error.message);
    return {
      sessionType: 'new',
      message: null,
      previousAgent: null,
      lastCommands: [],
      workflowActive: null,
    };
  }
}

/**
 * Generate fallback greeting if everything fails
 * @private
 * @param {string} agentId - Agent ID
 * @returns {string} Simple fallback greeting
 */
function generateFallbackGreeting(agentId) {
  return `✅ ${agentId} Agent ready\n\nType \`*help\` to see available commands.`;
}

// CLI interface
if (require.main === module) {
  const agentId = process.argv[2];
  
  if (!agentId) {
    console.error('Usage: node generate-greeting.js <agent-id>');
    console.error('\nExamples:');
    console.error('  node generate-greeting.js qa');
    console.error('  node generate-greeting.js dev');
    process.exit(1);
  }
  
  generateGreeting(agentId)
    .then(greeting => {
      console.log(greeting);
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      console.log(generateFallbackGreeting(agentId));
      process.exit(1);
    });
}

module.exports = { generateGreeting };

