/**
 * Bob Orchestrator - Decision Tree Entry Point
 *
 * Story 12.3: Bob Orchestration Logic (Decision Tree)
 * PRD Reference: §3.3 (Decision Tree), §3.7 (Router not God Class)
 *
 * This is the main entry point for Bob (PM agent). It detects project state
 * and routes to the appropriate workflow using codified decision logic
 * (no LLM reasoning for routing decisions).
 *
 * Integrates all Epic 11 modules:
 * - ExecutorAssignment (11.1) — agent selection
 * - TerminalSpawner (11.2) — agent spawning
 * - WorkflowExecutor (11.3) — development cycle
 * - SurfaceChecker (11.4) — human decision criteria
 * - SessionState (11.5) — session persistence
 *
 * Constraint: < 50 lines of other-agent-specific logic (PRD §3.7)
 *
 * @module core/orchestration/bob-orchestrator
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { resolveConfig } = require('../config/config-resolver');
const ExecutorAssignment = require('./executor-assignment');
const { WorkflowExecutor } = require('./workflow-executor');
const { SurfaceChecker } = require('./surface-checker');
const { SessionState } = require('./session-state');
const LockManager = require('./lock-manager');

/**
 * Project state enum — detected by decision tree
 * @enum {string}
 */
const ProjectState = {
  NO_CONFIG: 'NO_CONFIG',
  EXISTING_NO_DOCS: 'EXISTING_NO_DOCS',
  EXISTING_WITH_DOCS: 'EXISTING_WITH_DOCS',
  GREENFIELD: 'GREENFIELD',
};

/**
 * Orchestration result
 * @typedef {Object} OrchestrationResult
 * @property {boolean} success - Whether orchestration completed successfully
 * @property {string} projectState - Detected project state
 * @property {string} action - Action taken
 * @property {Object} [data] - Additional result data
 * @property {string} [error] - Error message if failed
 */

/**
 * BobOrchestrator — Main decision tree and orchestration entry point
 */
class BobOrchestrator {
  /**
   * Creates a new BobOrchestrator instance
   * @param {string} projectRoot - Project root directory
   * @param {Object} [options] - Orchestrator options
   * @param {boolean} [options.debug=false] - Enable debug logging
   */
  constructor(projectRoot, options = {}) {
    if (!projectRoot || typeof projectRoot !== 'string') {
      throw new Error('projectRoot is required and must be a string');
    }

    this.projectRoot = projectRoot;
    this.options = {
      debug: false,
      ...options,
    };

    // Initialize Epic 11 dependencies
    this.surfaceChecker = new SurfaceChecker();
    this.sessionState = new SessionState(projectRoot, { debug: this.options.debug });
    this.workflowExecutor = new WorkflowExecutor(projectRoot, { debug: this.options.debug });
    this.lockManager = new LockManager(projectRoot, { debug: this.options.debug });

    this._log('BobOrchestrator initialized');
  }

  /**
   * Main entry point — executes the decision tree and routes to workflow
   *
   * @param {Object} [context] - Optional execution context
   * @param {string} [context.userGoal] - User's stated goal
   * @param {string} [context.storyPath] - Path to story file (if known)
   * @returns {Promise<OrchestrationResult>} Orchestration result
   */
  async orchestrate(context = {}) {
    const resource = 'bob-orchestration';

    try {
      // Acquire orchestration lock (AC14)
      const lockAcquired = await this.lockManager.acquireLock(resource);
      if (!lockAcquired) {
        return {
          success: false,
          projectState: null,
          action: 'lock_failed',
          error: 'Another Bob orchestration is already running. Wait or check .aios/locks/',
        };
      }

      // Cleanup stale locks on startup (AC16, AC17)
      await this.lockManager.cleanupStaleLocks();

      // Step 1: Detect project state (AC3-6)
      const projectState = this.detectProjectState(this.projectRoot);
      this._log(`Detected project state: ${projectState}`);

      // Step 2: Check for existing session to resume (AC12)
      const existingSession = await this.sessionState.loadSessionState();
      if (existingSession) {
        const crashInfo = await this.sessionState.detectCrash();
        if (crashInfo.isCrash) {
          this._log(`Crash detected: ${crashInfo.reason}`);
        }

        // Surface to ask user about resume (AC11)
        const surfaceResult = this.surfaceChecker.shouldSurface({
          valid_options_count: 4,
          options_with_tradeoffs: this.sessionState.getResumeSummary(),
        });

        if (surfaceResult.should_surface) {
          await this.lockManager.releaseLock(resource);
          return {
            success: true,
            projectState,
            action: 'resume_prompt',
            data: {
              surfaceResult,
              resumeOptions: this.sessionState.getResumeOptions(),
              summary: this.sessionState.getResumeSummary(),
              crashInfo,
            },
          };
        }
      }

      // Step 3: Route based on project state (AC7 — codified decision tree)
      const result = await this._routeByState(projectState, context);

      // Release lock
      await this.lockManager.releaseLock(resource);

      return {
        success: true,
        projectState,
        ...result,
      };
    } catch (error) {
      // Ensure lock is released on error
      await this.lockManager.releaseLock(resource).catch(() => {});

      return {
        success: false,
        projectState: null,
        action: 'error',
        error: `Orchestration failed: ${error.message}`,
      };
    }
  }

  /**
   * Detects the current project state (AC3-6)
   *
   * Decision tree implemented as pure if/else statements (AC7 — no LLM).
   *
   * @param {string} projectRoot - Project root directory
   * @returns {string} ProjectState enum value
   */
  detectProjectState(projectRoot) {
    // Check 1: Is this a greenfield project? (AC6)
    // No package.json, no .git, no docs/ → brand new project
    const hasPackageJson = fs.existsSync(path.join(projectRoot, 'package.json'));
    const hasGit = fs.existsSync(path.join(projectRoot, '.git'));
    const hasDocs = fs.existsSync(path.join(projectRoot, 'docs'));

    if (!hasPackageJson && !hasGit && !hasDocs) {
      return ProjectState.GREENFIELD;
    }

    // Check 2: Does config exist? (AC3)
    let configExists = false;
    try {
      const result = resolveConfig(projectRoot, { skipCache: true });
      configExists = result && result.config && Object.keys(result.config).length > 0;
    } catch {
      configExists = false;
    }

    if (!configExists) {
      return ProjectState.NO_CONFIG;
    }

    // Check 3: Does AIOS documentation exist? (AC4, AC5)
    const hasArchDocs = fs.existsSync(path.join(projectRoot, 'docs/architecture'));

    if (!hasArchDocs) {
      return ProjectState.EXISTING_NO_DOCS;
    }

    return ProjectState.EXISTING_WITH_DOCS;
  }

  /**
   * Routes to the appropriate workflow based on project state (AC7)
   *
   * All routing is codified — no LLM reasoning involved.
   *
   * @param {string} projectState - Detected project state
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Route result
   * @private
   */
  async _routeByState(projectState, context) {
    switch (projectState) {
      case ProjectState.NO_CONFIG:
        return this._handleNoConfig(context);

      case ProjectState.EXISTING_NO_DOCS:
        return this._handleBrownfield(context);

      case ProjectState.EXISTING_WITH_DOCS:
        return this._handleExistingProject(context);

      case ProjectState.GREENFIELD:
        return this._handleGreenfield(context);

      default:
        return {
          action: 'unknown_state',
          error: `Unknown project state: ${projectState}`,
        };
    }
  }

  /**
   * Handles NO_CONFIG state — onboarding or defaults (AC3)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Handler result
   * @private
   */
  async _handleNoConfig(_context) {
    this._log('No config detected — triggering onboarding');

    return {
      action: 'onboarding',
      data: {
        message: 'Projeto sem configuração AIOS detectado. Iniciando onboarding...',
        nextStep: 'run_aios_init',
      },
    };
  }

  /**
   * Handles EXISTING_NO_DOCS state — Brownfield Discovery (AC4)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Handler result
   * @private
   */
  async _handleBrownfield(_context) {
    this._log('Existing project without AIOS docs — Brownfield Discovery');

    return {
      action: 'brownfield_discovery',
      data: {
        message: 'Projeto existente sem documentação AIOS. Iniciando Brownfield Discovery...',
        nextStep: 'analyze_codebase',
      },
    };
  }

  /**
   * Handles EXISTING_WITH_DOCS state — ask user goal (AC5)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Handler result
   * @private
   */
  async _handleExistingProject(context) {
    this._log('Existing project with docs — asking objective');

    // If user already provided a story, execute it directly (AC8-10)
    if (context.storyPath) {
      return this._executeStory(context.storyPath);
    }

    // Surface to ask user what they want to do (AC11)
    const surfaceResult = this.surfaceChecker.shouldSurface({
      valid_options_count: 4,
      options_with_tradeoffs: [
        '1. Feature — Adicionar funcionalidade nova',
        '2. Bug Fix — Corrigir um problema',
        '3. Refactor — Melhorar código existente',
        '4. Tech Debt — Resolver dívida técnica',
      ].join('\n'),
    });

    return {
      action: 'ask_objective',
      data: {
        message: 'Projeto configurado. O que você quer fazer?',
        options: ['feature', 'bug', 'refactor', 'debt'],
        surfaceResult,
      },
    };
  }

  /**
   * Handles GREENFIELD state — delegates to greenfield handler (AC6)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Handler result
   * @private
   */
  async _handleGreenfield(_context) {
    this._log('Greenfield project — delegating to greenfield-handler');

    // Placeholder until Story 12.13
    return {
      action: 'greenfield',
      data: {
        message: 'Projeto novo detectado. Greenfield Workflow será iniciado.',
        nextStep: 'greenfield_handler',
        note: 'greenfield-handler.js será implementado na Story 12.13',
      },
    };
  }

  /**
   * Executes a story through the development cycle (AC8-10)
   *
   * Delegates to Epic 11 modules:
   * - ExecutorAssignment for agent selection (AC8)
   * - TerminalSpawner for agent spawning (AC9)
   * - WorkflowExecutor for development cycle (AC10)
   *
   * @param {string} storyPath - Path to story file
   * @returns {Promise<Object>} Execution result
   * @private
   */
  async _executeStory(storyPath) {
    this._log(`Executing story: ${storyPath}`);

    // AC8: Assign executor using story content
    const storyContent = fs.readFileSync(storyPath, 'utf8');
    const assignment = ExecutorAssignment.assignExecutorFromContent(storyContent);

    this._log(`Assigned executor: ${assignment.executor}, gate: ${assignment.quality_gate}`);

    // AC12: Save progress to session state
    const sessionExists = await this.sessionState.exists();
    if (sessionExists) {
      await this.sessionState.loadSessionState();
      await this.sessionState.recordPhaseChange('development', path.basename(storyPath), assignment.executor);
    }

    // AC10: Execute development cycle via WorkflowExecutor
    const result = await this.workflowExecutor.execute(storyPath);

    return {
      action: 'story_executed',
      data: {
        assignment,
        result,
        storyPath,
      },
    };
  }

  /**
   * Debug logger
   * @param {string} message - Log message
   * @private
   */
  _log(message) {
    if (this.options.debug) {
      console.log(`[BobOrchestrator] ${message}`);
    }
  }
}

module.exports = {
  BobOrchestrator,
  ProjectState,
};
