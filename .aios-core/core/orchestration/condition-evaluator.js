/**
 * Condition Evaluator - Evaluates workflow conditions using TechStackProfile
 *
 * DETERMINISTIC: All evaluations use profile data,
 * no AI involvement in condition evaluation.
 *
 * Responsibilities:
 * - Evaluate condition strings against tech stack profile
 * - Determine if workflow phases should execute
 * - Provide skip reasons for non-applicable phases
 *
 * @module core/orchestration/condition-evaluator
 * @version 1.0.0
 */

/**
 * @typedef {import('./tech-stack-detector').TechStackProfile} TechStackProfile
 */

/**
 * @typedef {Object} PhaseEvaluationResult
 * @property {boolean} shouldExecute - Whether the phase should execute
 * @property {string} reason - Reason for the decision
 */

/**
 * Evaluates workflow conditions based on detected tech stack
 */
class ConditionEvaluator {
  /**
   * @param {TechStackProfile} techStackProfile - Profile from TechStackDetector
   */
  constructor(techStackProfile) {
    this.profile = techStackProfile;

    // Context for QA approval tracking (updated externally)
    this._qaApproved = false;
    this._phaseOutputs = {};
  }

  /**
   * Update QA approval status
   * @param {boolean} approved
   */
  setQAApproval(approved) {
    this._qaApproved = approved;
  }

  /**
   * Update phase outputs for context-aware conditions
   * @param {Object} outputs - Map of phase number to output data
   */
  setPhaseOutputs(outputs) {
    this._phaseOutputs = outputs;
  }

  /**
   * Evaluate a condition string
   * @param {string} condition - Condition like 'project_has_database'
   * @returns {boolean} Whether condition is met
   */
  evaluate(condition) {
    // Handle null/undefined conditions
    if (!condition) {
      return true;
    }

    // Built-in condition evaluators
    const evaluators = {
      // Tech stack conditions
      project_has_database: () => this.profile.hasDatabase,
      project_has_frontend: () => this.profile.hasFrontend,
      project_has_backend: () => this.profile.hasBackend,
      project_has_typescript: () => this.profile.hasTypeScript,
      project_has_tests: () => this.profile.hasTests,

      // Database-specific conditions
      supabase_configured: () =>
        this.profile.database.type === 'supabase' &&
        this.profile.database.envVarsConfigured,
      database_has_rls: () => this.profile.database.hasRLS,
      database_has_migrations: () => this.profile.database.hasMigrations,

      // Frontend-specific conditions
      frontend_has_react: () => this.profile.frontend.framework === 'react',
      frontend_has_vue: () => this.profile.frontend.framework === 'vue',
      frontend_has_tailwind: () => this.profile.frontend.styling === 'tailwind',

      // Workflow state conditions
      qa_review_approved: () => this._checkQAApproval(),
      phase_2_completed: () => this._checkPhaseCompleted(2),
      phase_3_completed: () => this._checkPhaseCompleted(3),
      all_collection_phases_complete: () =>
        this._checkPhaseCompleted(1) &&
        this._checkPhaseCompleted(2) &&
        this._checkPhaseCompleted(3),

      // Composite conditions
      has_any_data_to_analyze: () =>
        this.profile.hasDatabase ||
        this.profile.hasFrontend ||
        this.profile.hasBackend,
    };

    // Check for built-in evaluator
    const evaluator = evaluators[condition];
    if (evaluator) {
      return evaluator();
    }

    // Handle complex condition expressions
    if (condition.includes('&&')) {
      return condition.split('&&').every((c) => this.evaluate(c.trim()));
    }

    if (condition.includes('||')) {
      return condition.split('||').some((c) => this.evaluate(c.trim()));
    }

    if (condition.startsWith('!')) {
      return !this.evaluate(condition.substring(1).trim());
    }

    // Handle dot-notation access to profile
    if (condition.includes('.')) {
      return this._evaluateDotNotation(condition);
    }

    // Unknown condition - default to true (permissive)
    console.warn(`[ConditionEvaluator] Unknown condition: ${condition}`);
    return true;
  }

  /**
   * Evaluate dot-notation condition against profile
   * @private
   * @param {string} condition - e.g., 'database.type === "supabase"'
   * @returns {boolean}
   */
  _evaluateDotNotation(condition) {
    // Handle equality checks
    const eqMatch = condition.match(
      /^(\w+(?:\.\w+)*)\s*===?\s*["']?(\w+)["']?$/
    );
    if (eqMatch) {
      const [, path, value] = eqMatch;
      const actualValue = this._getProfileValue(path);
      return actualValue === value;
    }

    // Handle boolean checks (e.g., "database.hasRLS")
    const value = this._getProfileValue(condition);
    return Boolean(value);
  }

  /**
   * Get value from profile using dot notation
   * @private
   * @param {string} path - e.g., 'database.type'
   * @returns {any}
   */
  _getProfileValue(path) {
    const parts = path.split('.');
    let value = this.profile;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Check if QA review was approved
   * @private
   * @returns {boolean}
   */
  _checkQAApproval() {
    // Check external flag
    if (this._qaApproved) {
      return true;
    }

    // Check phase outputs for QA review
    const qaOutput = this._phaseOutputs[7];
    if (qaOutput) {
      return (
        qaOutput.status === 'approved' ||
        qaOutput.status === 'success' ||
        (qaOutput.result && qaOutput.result.approved)
      );
    }

    return false;
  }

  /**
   * Check if a phase was completed
   * @private
   * @param {number} phaseNum
   * @returns {boolean}
   */
  _checkPhaseCompleted(phaseNum) {
    const output = this._phaseOutputs[phaseNum];
    if (!output) {
      return false;
    }

    // Phase is complete if status is success or skipped
    return output.status === 'success' || output.status === 'skipped';
  }

  /**
   * Check if a phase should be executed based on its conditions
   * @param {Object} phase - Phase configuration from workflow
   * @returns {PhaseEvaluationResult}
   */
  shouldExecutePhase(phase) {
    // No condition means always execute
    if (!phase.condition) {
      return {
        shouldExecute: true,
        reason: 'no_condition',
      };
    }

    const result = this.evaluate(phase.condition);

    return {
      shouldExecute: result,
      reason: result
        ? 'condition_met'
        : `condition_not_met:${phase.condition}`,
    };
  }

  /**
   * Get all conditions that failed for a phase
   * @param {Object} phase - Phase configuration from workflow
   * @returns {string[]} List of failed conditions
   */
  getFailedConditions(phase) {
    const failed = [];

    if (!phase.condition) {
      return failed;
    }

    // Handle composite conditions
    const conditions = phase.condition.includes('&&')
      ? phase.condition.split('&&').map((c) => c.trim())
      : [phase.condition];

    for (const condition of conditions) {
      if (!this.evaluate(condition)) {
        failed.push(condition);
      }
    }

    return failed;
  }

  /**
   * Get a human-readable explanation of why a phase was skipped
   * @param {Object} phase - Phase configuration
   * @returns {string} Explanation
   */
  getSkipExplanation(phase) {
    const failed = this.getFailedConditions(phase);

    if (failed.length === 0) {
      return 'Phase should execute (all conditions met)';
    }

    const explanations = {
      project_has_database: 'No database detected in project',
      project_has_frontend: 'No frontend framework detected',
      project_has_backend: 'No backend framework detected',
      supabase_configured: 'Supabase not configured or missing environment variables',
      qa_review_approved: 'QA review not yet approved',
    };

    const reasons = failed.map(
      (c) => explanations[c] || `Condition not met: ${c}`
    );

    return reasons.join('; ');
  }

  /**
   * Create a summary of which phases will execute
   * @param {Object[]} phases - Array of phase configurations
   * @returns {Object} Summary with applicable/skipped phases
   */
  evaluateAllPhases(phases) {
    const summary = {
      applicable: [],
      skipped: [],
      details: {},
    };

    for (const phase of phases) {
      const phaseNum = phase.phase || phase.step;
      const evaluation = this.shouldExecutePhase(phase);

      summary.details[phaseNum] = {
        name: phase.phase_name || phase.step,
        condition: phase.condition || null,
        ...evaluation,
      };

      if (evaluation.shouldExecute) {
        summary.applicable.push(phaseNum);
      } else {
        summary.skipped.push(phaseNum);
      }
    }

    return summary;
  }
}

module.exports = ConditionEvaluator;
