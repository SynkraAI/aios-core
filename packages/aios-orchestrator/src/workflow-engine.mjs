/**
 * Workflow Engine — SDC State Machine and QA Loop.
 *
 * Implements the Story Development Cycle (SDC) as an index-based while loop
 * with backward-jump retry logic, crash recovery, budget tracking, and
 * QA Loop as a secondary workflow.
 *
 * Addresses validation concerns:
 *   CP-3:  Backward jump is explicit index reset (not for..of)
 *   CP-4:  Max retries exhausted throws WorkflowAbortError with full context
 *   CP-9:  Decision parsing via decision-parsers.mjs (JSON-first, regex fallback)
 *   CP-10: SM:CREATE skip predicate disabled on retry
 *   CP-11: QA CONCERNS is non-blocking (proceed with note)
 *   CP-12: Atomic state persistence via state-persistence.mjs
 *
 * Story: E7.1.3
 * Architecture: sdk-orchestrator-architecture.md Section 6
 *
 * @module workflow-engine
 */

import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { checkGoNoGo, checkQaVerdict, DECISIONS } from './decision-parsers.mjs';
import { createWorkflowState, createStatePersistence } from './state-persistence.mjs';
import { OrchestratorError, BudgetError } from './errors.mjs';

// ---------------------------------------------------------------------------
// WorkflowAbortError
// ---------------------------------------------------------------------------

/**
 * Thrown when a workflow aborts due to max retries exhausted or other
 * non-recoverable conditions.
 */
export class WorkflowAbortError extends OrchestratorError {
  /**
   * @param {string} message
   * @param {object} opts
   * @param {string} opts.reason - 'max_retries' | 'budget_exceeded' | 'max_iterations'
   * @param {string} [opts.phase] - Phase where abort occurred
   * @param {number} [opts.retriesUsed] - Number of retries used
   * @param {object} [opts.workflowState] - Full state snapshot for debugging
   */
  constructor(message, { reason, phase, retriesUsed, workflowState, agentId } = {}) {
    super(message, { agentId });
    this.name = 'WorkflowAbortError';
    this.reason = reason || 'unknown';
    this.phase = phase || null;
    this.retriesUsed = retriesUsed ?? 0;
    this.workflowState = workflowState || null;
  }
}

/**
 * Thrown when workflow budget is exceeded.
 */
export class BudgetExceededError extends BudgetError {
  /**
   * @param {string} message
   * @param {object} opts
   * @param {number} opts.totalCostUsd
   * @param {number} opts.maxCostUsd
   * @param {string} [opts.phase]
   * @param {object} [opts.workflowState]
   */
  constructor(message, { totalCostUsd, maxCostUsd, phase, workflowState, agentId } = {}) {
    super(message, { agentId, costUsd: totalCostUsd });
    this.name = 'BudgetExceededError';
    this.totalCostUsd = totalCostUsd ?? 0;
    this.maxCostUsd = maxCostUsd ?? 0;
    this.phase = phase || null;
    this.workflowState = workflowState || null;
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Retry target map: when a phase decision is "retry", which phase to jump back to.
 * PO NO-GO  -> jump back to SM:CREATE (rewrite the story)
 * QA FAIL   -> jump back to DEV:IMPLEMENT (fix the code)
 */
const RETRY_TARGETS = {
  'PO:VALIDATE': 'SM:CREATE',
  'QA:GATE': 'DEV:IMPLEMENT',
};

/** Max retries per phase */
const MAX_RETRIES = {
  'PO:VALIDATE': 2,
  'QA:GATE': 3,
};

/** Default budget caps */
const DEFAULT_SDC_BUDGET = 25;
const DEFAULT_QA_LOOP_BUDGET = 15;

/** Max QA Loop iterations */
const DEFAULT_QA_LOOP_MAX_ITERATIONS = 5;

/** Budget alert threshold (80%) */
const BUDGET_ALERT_THRESHOLD = 0.8;

// ---------------------------------------------------------------------------
// SDC Phase Definitions
// ---------------------------------------------------------------------------

/**
 * Build the SDC phase array (AC1, AC2).
 * Phase sequence: SM:CREATE -> PO:VALIDATE -> DEV:IMPLEMENT -> QA:GATE -> DEVOPS:PUSH
 *
 * @param {string} storyFile - Path to story file
 * @param {object} state - Current workflow state
 * @returns {Array<PhaseConfig>}
 */
function buildSDCPhases(storyFile, state) {
  return [
    {
      id: 'SM:CREATE',
      agent: 'sm',
      /**
       * Skip SM:CREATE if story file already exists AND this is the first attempt
       * (not a retry from PO NO-GO). CP-10 fix: if PO has rejected the story,
       * SM must re-run to rewrite it even if the file exists.
       */
      skip: () => {
        const poRetries = state.retries['PO:VALIDATE'] || 0;
        if (poRetries > 0) return false; // CP-10: PO rejected, must re-run SM
        return existsSync(storyFile);
      },
      promptTemplate: (ctx) =>
        `Create a development story for the following requirements.\n\n` +
        `Story file path: ${ctx.storyFile}\n` +
        (ctx.previousResult ? `\nPrevious PO feedback:\n${ctx.previousResult}` : ''),
    },
    {
      id: 'PO:VALIDATE',
      agent: 'po',
      onResult: checkGoNoGo,
      retryTarget: 'SM:CREATE',
      maxRetries: MAX_RETRIES['PO:VALIDATE'],
      promptTemplate: (ctx) =>
        `Validate the following story using the 10-point checklist.\n\n` +
        `Story file: ${ctx.storyFile}\n` +
        `Story content:\n${ctx.storyContent}\n` +
        (ctx.previousResult ? `\nSM output:\n${ctx.previousResult}` : '') +
        `\n\nReturn your decision as GO or NO-GO with a score.`,
    },
    {
      id: 'DEV:IMPLEMENT',
      agent: 'dev',
      promptTemplate: (ctx) => {
        let prompt =
          `Implement the story following all acceptance criteria.\n\n` +
          `Story file: ${ctx.storyFile}\n` +
          `Story content:\n${ctx.storyContent}\n`;
        if (ctx.previousResult) {
          prompt += `\nPrevious phase output:\n${ctx.previousResult}`;
        }
        if (ctx.dirtyState) {
          prompt += `\n\nGit working directory has uncommitted changes:\n${ctx.dirtyState}\nReview and account for these before implementing.`;
        }
        return prompt;
      },
    },
    {
      id: 'QA:GATE',
      agent: 'qa',
      onResult: checkQaVerdict,
      retryTarget: 'DEV:IMPLEMENT',
      maxRetries: MAX_RETRIES['QA:GATE'],
      promptTemplate: (ctx) =>
        `Run QA gate validation on the implemented story.\n\n` +
        `Story file: ${ctx.storyFile}\n` +
        `Story content:\n${ctx.storyContent}\n` +
        (ctx.previousResult ? `\nDev output:\n${ctx.previousResult}` : '') +
        `\n\nReturn your verdict as PASS, CONCERNS, or FAIL.`,
    },
    {
      id: 'DEVOPS:PUSH',
      agent: 'devops',
      promptTemplate: (ctx) =>
        `Push the completed story implementation.\n\n` +
        `Story file: ${ctx.storyFile}\n` +
        (ctx.previousResult ? `\nQA output:\n${ctx.previousResult}` : ''),
    },
  ];
}

// ---------------------------------------------------------------------------
// Phase Index Helper
// ---------------------------------------------------------------------------

/**
 * Find the index of a phase by its ID.
 *
 * @param {Array<{ id: string }>} phases
 * @param {string} phaseId
 * @returns {number}
 * @throws {Error} If phase not found
 */
function findPhaseIndex(phases, phaseId) {
  const idx = phases.findIndex((p) => p.id === phaseId);
  if (idx === -1) {
    throw new Error(`Unknown phase: ${phaseId}`);
  }
  return idx;
}

// ---------------------------------------------------------------------------
// Dirty State Detection (AC11 — FR-023)
// ---------------------------------------------------------------------------

/**
 * Check for uncommitted changes in git working directory.
 *
 * @param {string} projectRoot
 * @returns {string} Git status output (empty string if clean)
 */
function detectDirtyState(projectRoot) {
  try {
    const output = execSync('git status --short', {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 10000,
    });
    return (output || '').trim();
  } catch {
    // git not available or not a repo — proceed without dirty state
    return '';
  }
}

// ---------------------------------------------------------------------------
// Story Content Loader
// ---------------------------------------------------------------------------

/**
 * Load story file content for passing to agents.
 *
 * @param {string} storyFile
 * @param {string} projectRoot
 * @returns {string}
 */
function loadStoryContent(storyFile, projectRoot) {
  try {
    const fullPath = resolve(projectRoot, storyFile);
    return readFileSync(fullPath, 'utf8');
  } catch {
    return `[Story file not found: ${storyFile}]`;
  }
}

// ---------------------------------------------------------------------------
// Workflow Engine Factory
// ---------------------------------------------------------------------------

/**
 * Create a WorkflowEngine instance.
 *
 * @param {object} opts
 * @param {object} opts.sessionManager - SessionManager with run() method
 * @param {object} [opts.governance] - GovernanceHooks with forAgent() method
 * @param {object} [opts.commsBridge] - CommsBridge with notify methods
 * @param {object} [opts.registry] - Agent registry (not used directly, but available)
 * @param {string} opts.projectRoot - Absolute path to project root
 * @param {object} [opts.logger] - Logger instance
 * @returns {WorkflowEngine}
 */
export function createWorkflowEngine({
  sessionManager,
  governance,
  commsBridge,
  registry,
  projectRoot,
  logger,
} = {}) {
  if (!sessionManager) throw new Error('sessionManager is required');
  if (!projectRoot) throw new Error('projectRoot is required');

  const log = logger || { info() {}, warn() {}, error() {}, debug() {} };

  /**
   * Create a per-story persistence instance for parallel isolation.
   * Each story gets its own state file: workflow-state-{slug}.json
   */
  function getPersistence(storyFile) {
    return createStatePersistence({ projectRoot, storyFile, logger: log });
  }

  // Default persistence for backward-compat (status checks, etc.)
  const defaultPersistence = createStatePersistence({ projectRoot, logger: log });

  // Null comms bridge for when none is provided
  const comms = commsBridge || {
    notifyPhaseStart() {},
    notifyPhaseEnd() {},
    notifyError() {},
    notifyBudgetAlert() {},
    notifyWorkflowComplete() {},
  };

  // -------------------------------------------------------------------------
  // SDC Workflow (AC1-AC11, AC13)
  // -------------------------------------------------------------------------

  /**
   * Run the full Story Development Cycle.
   *
   * @param {object} opts
   * @param {string} opts.storyFile - Path to story file (relative to projectRoot)
   * @param {number} [opts.maxBudgetUsd=25] - Maximum budget for the workflow
   * @returns {Promise<WorkflowReport>}
   */
  async function runSDC({ storyFile, maxBudgetUsd } = {}) {
    if (!storyFile) throw new Error('storyFile is required');

    const budget = maxBudgetUsd ?? DEFAULT_SDC_BUDGET;
    const persistence = getPersistence(storyFile);

    // AC10: Check for existing state (crash recovery)
    let state = persistence.loadState();
    let resuming = false;

    if (state && state.status === 'running' && state.storyFile === storyFile) {
      log.info(
        { workflowId: state.workflowId, phase: state.currentPhase },
        'Resuming workflow from crash'
      );
      resuming = true;
    } else if (state && (state.status === 'done' || state.status === 'aborted')) {
      log.info(
        { workflowId: state.workflowId, status: state.status },
        'Previous workflow already completed/aborted, starting fresh'
      );
      state = null;
    } else {
      state = null;
    }

    if (!state) {
      state = createWorkflowState({
        workflow: 'sdc',
        storyFile,
        maxCostUsd: budget,
      });
    }

    const phases = buildSDCPhases(
      resolve(projectRoot, storyFile),
      state
    );

    const startTime = Date.now();
    let previousResult = '';

    // Determine starting index (for resume)
    let phaseIndex = 0;
    if (resuming && state.currentPhase) {
      const resumeIdx = phases.findIndex((p) => p.id === state.currentPhase);
      if (resumeIdx >= 0) {
        phaseIndex = resumeIdx;
        log.info({ phase: state.currentPhase, index: resumeIdx }, 'Resuming from phase');
      }
    }

    // CP-3 fix: index-based while loop for backward jumps
    while (phaseIndex < phases.length) {
      const phase = phases[phaseIndex];

      // AC6: Skip predicate (e.g., SM:CREATE skipped if story exists and not retry)
      // Rebuild skip dynamically since state.retries may have changed
      if (phase.skip && phase.skip()) {
        log.info(
          { event: 'phase_skipped', phase: phase.id, reason: 'story_exists' },
          `Phase ${phase.id} skipped`
        );
        state.phaseHistory.push({
          phase: phase.id,
          status: 'skipped',
          completedAt: new Date().toISOString(),
        });
        phaseIndex++;
        continue;
      }

      // Update state and persist before execution
      state.currentPhase = phase.id;
      persistence.saveState(state);

      // Notify phase start
      const attempt = (state.retries[phase.id] || 0) + 1;
      comms.notifyPhaseStart(phase.id, phase.agent, storyFile, attempt);

      // AC11: Dirty state detection before DEV:IMPLEMENT
      let dirtyState = '';
      if (phase.id === 'DEV:IMPLEMENT') {
        dirtyState = detectDirtyState(projectRoot);
        if (dirtyState) {
          log.info(
            { event: 'dirty_state_detected', phase: phase.id, files: dirtyState },
            'Dirty state detected before DEV:IMPLEMENT'
          );
        }
      }

      // Build phase prompt with context
      const storyContent = loadStoryContent(storyFile, projectRoot);
      const promptContext = {
        storyFile,
        storyContent,
        previousResult,
        dirtyState,
      };
      const prompt = phase.promptTemplate(promptContext);

      // Build governance hooks for the agent
      const hooks = governance ? governance.forAgent(phase.agent) : undefined;

      // Execute phase via SessionManager
      const phaseStartTime = Date.now();
      let result;
      try {
        result = await sessionManager.run({
          agentId: phase.agent,
          prompt,
          hooks,
        });
      } catch (err) {
        // Phase execution failed — abort workflow
        state.status = 'aborted';
        state.error = `Phase ${phase.id} failed: ${err.message}`;
        persistence.saveState(state);
        comms.notifyError('phase_execution_error', err.message, phase.id, state.totalCostUsd);
        throw new WorkflowAbortError(
          `Phase ${phase.id} execution failed: ${err.message}`,
          {
            reason: 'phase_error',
            phase: phase.id,
            workflowState: { ...state },
          }
        );
      }

      const phaseDurationMs = Date.now() - phaseStartTime;
      const phaseCost = result.costUsd || 0;

      // AC7: Budget tracking
      state.totalCostUsd += phaseCost;

      // Budget alert at 80%
      if (state.totalCostUsd >= BUDGET_ALERT_THRESHOLD * state.maxCostUsd) {
        comms.notifyBudgetAlert(state.totalCostUsd, state.maxCostUsd, storyFile);
      }

      // Budget exceeded check
      if (state.totalCostUsd > state.maxCostUsd) {
        state.status = 'aborted';
        state.error = `Budget exceeded: $${state.totalCostUsd.toFixed(2)} > $${state.maxCostUsd.toFixed(2)}`;
        persistence.saveState(state);
        comms.notifyError('budget_exceeded', state.error, phase.id, state.totalCostUsd);
        throw new BudgetExceededError(
          state.error,
          {
            totalCostUsd: state.totalCostUsd,
            maxCostUsd: state.maxCostUsd,
            phase: phase.id,
            workflowState: { ...state },
          }
        );
      }

      // Record phase in history
      const historyEntry = {
        phase: phase.id,
        agent: phase.agent,
        status: 'completed',
        completedAt: new Date().toISOString(),
        costUsd: phaseCost,
        durationMs: phaseDurationMs,
      };

      // Decision handling with backward-jump retry (CP-3 fix)
      if (phase.onResult) {
        const decision = phase.onResult(result);
        historyEntry.verdict = decision;

        if (decision === DECISIONS.RETRY) {
          // Check max retries (CP-4 fix)
          const retryCount = state.retries[phase.id] || 0;
          const maxRetries = phase.maxRetries || 0;

          if (retryCount >= maxRetries) {
            // AC5: Max retries exhausted — abort
            state.status = 'aborted';
            state.error = `${phase.id} exhausted ${maxRetries} retries. Workflow aborted.`;
            state.phaseHistory.push(historyEntry);
            persistence.saveState(state);
            comms.notifyError(
              'max_retries_exhausted',
              state.error,
              phase.id,
              state.totalCostUsd
            );
            throw new WorkflowAbortError(state.error, {
              reason: 'max_retries',
              phase: phase.id,
              retriesUsed: retryCount,
              workflowState: { ...state },
            });
          }

          // Increment retry counter
          state.retries[phase.id] = retryCount + 1;
          state.phaseHistory.push(historyEntry);

          // Backward jump to target phase
          const targetPhaseId = phase.retryTarget || RETRY_TARGETS[phase.id] || phase.id;
          const targetIndex = findPhaseIndex(phases, targetPhaseId);

          log.info(
            {
              event: 'backward_jump',
              from: phase.id,
              to: targetPhaseId,
              retry: retryCount + 1,
              maxRetries,
            },
            `${phase.id} returned retry (${retryCount + 1}/${maxRetries}). Jumping back to ${targetPhaseId}.`
          );

          comms.notifyPhaseEnd(phase.id, phase.agent, 'RETRY', phaseCost, phaseDurationMs);
          persistence.saveState(state);

          previousResult = result.summary || '';
          phaseIndex = targetIndex; // CP-3: actual backward jump
          continue;
        }

        if (decision === DECISIONS.PROCEED_WITH_NOTE) {
          // AC4: QA CONCERNS — non-blocking (CP-11)
          const concerns = result.summary || 'QA raised concerns (no details extracted)';
          state.concerns = state.concerns || [];
          state.concerns.push(concerns);
          log.warn(
            { event: 'qa_concerns', phase: phase.id, concerns },
            `QA CONCERNS: proceeding with note`
          );
          historyEntry.verdict = 'CONCERNS';
          comms.notifyPhaseEnd(phase.id, phase.agent, 'CONCERNS', phaseCost, phaseDurationMs);
        } else {
          // PROCEED
          const verdictLabel = phase.id === 'PO:VALIDATE' ? 'GO' : 'PASS';
          comms.notifyPhaseEnd(phase.id, phase.agent, verdictLabel, phaseCost, phaseDurationMs);
        }
      } else {
        // No decision function — just proceed
        comms.notifyPhaseEnd(phase.id, phase.agent, 'done', phaseCost, phaseDurationMs);
      }

      state.phaseHistory.push(historyEntry);
      persistence.saveState(state);

      previousResult = result.summary || '';
      phaseIndex++;
    }

    // Workflow complete
    state.status = 'done';
    state.currentPhase = '';
    persistence.saveState(state);

    const totalDurationMs = Date.now() - startTime;

    // AC13: Generate workflow report
    const report = {
      workflowId: state.workflowId,
      workflow: 'sdc',
      status: 'success',
      storyFile,
      phases: state.phaseHistory,
      totalCostUsd: state.totalCostUsd,
      totalDurationMs,
      concerns: state.concerns || [],
    };

    persistence.saveReport(report);
    comms.notifyWorkflowComplete(report);

    // Clear running state (workflow done)
    persistence.clearState();

    log.info(
      {
        event: 'workflow_complete',
        workflowId: state.workflowId,
        totalCostUsd: state.totalCostUsd,
        totalDurationMs,
      },
      `SDC workflow completed for ${storyFile}`
    );

    return report;
  }

  // -------------------------------------------------------------------------
  // Resume (AC10 — FR-022)
  // -------------------------------------------------------------------------

  /**
   * Resume a crashed workflow by workflowId.
   *
   * @param {string} workflowId - The workflow ID to resume
   * @returns {Promise<WorkflowReport>}
   */
  async function resume(workflowId, { storyFile: storyFileHint } = {}) {
    // Use story-specific persistence if we have a hint, otherwise default
    const persistence = storyFileHint
      ? getPersistence(storyFileHint)
      : defaultPersistence;
    const state = persistence.loadState();

    if (!state) {
      throw new Error(`No workflow state found to resume`);
    }

    if (state.workflowId !== workflowId) {
      throw new Error(
        `State file contains workflow "${state.workflowId}", not "${workflowId}"`
      );
    }

    if (state.status === 'done') {
      log.info({ workflowId }, 'Workflow already completed');
      return {
        workflowId: state.workflowId,
        workflow: state.workflow,
        status: 'already_done',
        storyFile: state.storyFile,
        phases: state.phaseHistory,
        totalCostUsd: state.totalCostUsd,
        totalDurationMs: 0,
      };
    }

    if (state.status === 'aborted') {
      log.info({ workflowId, error: state.error }, 'Workflow was aborted');
      return {
        workflowId: state.workflowId,
        workflow: state.workflow,
        status: 'previously_aborted',
        storyFile: state.storyFile,
        phases: state.phaseHistory,
        totalCostUsd: state.totalCostUsd,
        totalDurationMs: 0,
        error: state.error,
      };
    }

    // State is 'running' — resume by re-running SDC
    // The runSDC function will detect the existing state and resume from currentPhase
    return runSDC({
      storyFile: state.storyFile,
      maxBudgetUsd: state.maxCostUsd,
    });
  }

  // -------------------------------------------------------------------------
  // QA Loop (AC12 — FR-005)
  // -------------------------------------------------------------------------

  /**
   * Run the QA Loop: QA:REVIEW -> DEV:FIX alternating until approval or max iterations.
   *
   * @param {object} opts
   * @param {string} opts.storyFile - Path to story file
   * @param {number} [opts.maxIterations=5] - Max iterations
   * @param {number} [opts.maxBudgetUsd=15] - Maximum budget
   * @returns {Promise<WorkflowReport>}
   */
  async function runQALoop({ storyFile, maxIterations, maxBudgetUsd } = {}) {
    if (!storyFile) throw new Error('storyFile is required');

    const maxIter = maxIterations ?? DEFAULT_QA_LOOP_MAX_ITERATIONS;
    const budget = maxBudgetUsd ?? DEFAULT_QA_LOOP_BUDGET;
    const persistence = getPersistence(storyFile);

    const state = createWorkflowState({
      workflow: 'qa-loop',
      storyFile,
      maxCostUsd: budget,
    });

    const startTime = Date.now();
    let iteration = 0;
    let previousResult = '';
    let approved = false;

    while (iteration < maxIter) {
      iteration++;

      // Phase 1: QA:REVIEW
      state.currentPhase = 'QA:REVIEW';
      persistence.saveState(state);

      comms.notifyPhaseStart('QA:REVIEW', 'qa', storyFile, iteration);

      const storyContent = loadStoryContent(storyFile, projectRoot);
      const qaPrompt =
        `Review the story implementation for quality issues.\n\n` +
        `Story file: ${storyFile}\n` +
        `Story content:\n${storyContent}\n` +
        `Iteration: ${iteration}/${maxIter}\n` +
        (previousResult ? `\nPrevious fix output:\n${previousResult}` : '') +
        `\n\nReturn your verdict as APPROVE, CONCERNS, or REJECT.`;

      const hooks = governance ? governance.forAgent('qa') : undefined;

      let qaResult;
      try {
        qaResult = await sessionManager.run({
          agentId: 'qa',
          prompt: qaPrompt,
          hooks,
        });
      } catch (err) {
        state.status = 'aborted';
        state.error = `QA:REVIEW failed: ${err.message}`;
        persistence.saveState(state);
        throw new WorkflowAbortError(
          `QA:REVIEW failed at iteration ${iteration}: ${err.message}`,
          { reason: 'phase_error', phase: 'QA:REVIEW', workflowState: { ...state } }
        );
      }

      const qaCost = qaResult.costUsd || 0;
      state.totalCostUsd += qaCost;
      state.phaseHistory.push({
        phase: 'QA:REVIEW',
        agent: 'qa',
        status: 'completed',
        completedAt: new Date().toISOString(),
        costUsd: qaCost,
        iteration,
      });

      // Budget check
      if (state.totalCostUsd > state.maxCostUsd) {
        state.status = 'aborted';
        state.error = `Budget exceeded in QA Loop: $${state.totalCostUsd.toFixed(2)}`;
        persistence.saveState(state);
        throw new BudgetExceededError(state.error, {
          totalCostUsd: state.totalCostUsd,
          maxCostUsd: state.maxCostUsd,
          phase: 'QA:REVIEW',
          workflowState: { ...state },
        });
      }

      // Parse QA verdict
      const verdict = checkQaVerdict(qaResult);
      comms.notifyPhaseEnd('QA:REVIEW', 'qa', verdict, qaCost, 0);

      if (verdict === DECISIONS.PROCEED || verdict === DECISIONS.PROCEED_WITH_NOTE) {
        approved = true;
        if (verdict === DECISIONS.PROCEED_WITH_NOTE) {
          state.concerns = state.concerns || [];
          state.concerns.push(qaResult.summary || 'QA concerns noted');
        }
        break;
      }

      // QA rejected — run DEV:FIX (unless we're at max iterations)
      if (iteration >= maxIter) {
        break; // Will be caught below as MAX_ITERATIONS
      }

      // Phase 2: DEV:FIX
      state.currentPhase = 'DEV:FIX';
      persistence.saveState(state);

      comms.notifyPhaseStart('DEV:FIX', 'dev', storyFile, iteration);

      const dirtyState = detectDirtyState(projectRoot);
      const devPrompt =
        `Fix the QA issues identified in the review.\n\n` +
        `Story file: ${storyFile}\n` +
        `Story content:\n${storyContent}\n` +
        `QA feedback:\n${qaResult.summary || 'No details'}\n` +
        `Iteration: ${iteration}/${maxIter}\n` +
        (dirtyState ? `\nGit working directory has uncommitted changes:\n${dirtyState}` : '');

      const devHooks = governance ? governance.forAgent('dev') : undefined;

      let devResult;
      try {
        devResult = await sessionManager.run({
          agentId: 'dev',
          prompt: devPrompt,
          hooks: devHooks,
        });
      } catch (err) {
        state.status = 'aborted';
        state.error = `DEV:FIX failed: ${err.message}`;
        persistence.saveState(state);
        throw new WorkflowAbortError(
          `DEV:FIX failed at iteration ${iteration}: ${err.message}`,
          { reason: 'phase_error', phase: 'DEV:FIX', workflowState: { ...state } }
        );
      }

      const devCost = devResult.costUsd || 0;
      state.totalCostUsd += devCost;
      state.phaseHistory.push({
        phase: 'DEV:FIX',
        agent: 'dev',
        status: 'completed',
        completedAt: new Date().toISOString(),
        costUsd: devCost,
        iteration,
      });

      // Budget check
      if (state.totalCostUsd > state.maxCostUsd) {
        state.status = 'aborted';
        state.error = `Budget exceeded in QA Loop: $${state.totalCostUsd.toFixed(2)}`;
        persistence.saveState(state);
        throw new BudgetExceededError(state.error, {
          totalCostUsd: state.totalCostUsd,
          maxCostUsd: state.maxCostUsd,
          phase: 'DEV:FIX',
          workflowState: { ...state },
        });
      }

      comms.notifyPhaseEnd('DEV:FIX', 'dev', 'done', devCost, 0);
      persistence.saveState(state);

      previousResult = devResult.summary || '';
    }

    const totalDurationMs = Date.now() - startTime;

    if (approved) {
      state.status = 'done';
      persistence.saveState(state);

      const report = {
        workflowId: state.workflowId,
        workflow: 'qa-loop',
        status: 'APPROVED',
        storyFile,
        phases: state.phaseHistory,
        totalCostUsd: state.totalCostUsd,
        totalDurationMs,
        iterations: iteration,
        concerns: state.concerns || [],
      };

      persistence.saveReport(report);
      comms.notifyWorkflowComplete(report);
      persistence.clearState();
      return report;
    }

    // Max iterations reached without approval
    state.status = 'aborted';
    state.error = `QA Loop max iterations (${maxIter}) reached without approval`;
    persistence.saveState(state);

    comms.notifyError('max_iterations', state.error, 'QA:REVIEW', state.totalCostUsd);

    const report = {
      workflowId: state.workflowId,
      workflow: 'qa-loop',
      status: 'MAX_ITERATIONS',
      storyFile,
      phases: state.phaseHistory,
      totalCostUsd: state.totalCostUsd,
      totalDurationMs,
      iterations: iteration,
      concerns: state.concerns || [],
    };

    persistence.saveReport(report);

    throw new WorkflowAbortError(state.error, {
      reason: 'max_iterations',
      phase: 'QA:REVIEW',
      retriesUsed: iteration,
      workflowState: { ...state },
    });
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  return {
    runSDC,
    resume,
    runQALoop,
  };
}
