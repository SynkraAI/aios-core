/**
 * Typed error classes for the AIOS Orchestrator.
 *
 * Error hierarchy:
 *   OrchestratorError (base)
 *     ├── ConfigError       — agent not found, invalid config, auth failures
 *     ├── BudgetError       — SDK budget cap exceeded
 *     └── TransientError    — retryable network/timeout errors
 *
 * All errors include `agentId` for tracing.
 *
 * @module errors
 */

/**
 * Base error for all orchestrator errors.
 * Wraps an optional original error for chaining.
 */
export class OrchestratorError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {object} [opts]
   * @param {string} [opts.agentId] - Agent that caused the error
   * @param {Error}  [opts.cause]   - Original error being wrapped
   */
  constructor(message, { agentId, cause } = {}) {
    super(message);
    this.name = 'OrchestratorError';
    this.agentId = agentId ?? null;
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Thrown when agent configuration is invalid or missing.
 * Also used for SDK auth/configuration failures.
 */
export class ConfigError extends OrchestratorError {
  constructor(message, { agentId, cause } = {}) {
    super(message, { agentId, cause });
    this.name = 'ConfigError';
  }
}

/**
 * Thrown when the SDK reports budget exceeded.
 */
export class BudgetError extends OrchestratorError {
  /**
   * @param {string} message
   * @param {object} [opts]
   * @param {string} [opts.agentId]
   * @param {number} [opts.costUsd] - Cost at time of budget breach
   * @param {Error}  [opts.cause]
   */
  constructor(message, { agentId, costUsd, cause } = {}) {
    super(message, { agentId, cause });
    this.name = 'BudgetError';
    this.costUsd = costUsd ?? 0;
  }
}

/**
 * Thrown when all retry attempts are exhausted for a transient error.
 */
export class TransientError extends OrchestratorError {
  /**
   * @param {string} message
   * @param {object} [opts]
   * @param {string} [opts.agentId]
   * @param {number} [opts.attempts] - Number of attempts made
   * @param {Error}  [opts.cause]    - Last error encountered
   */
  constructor(message, { agentId, attempts, cause } = {}) {
    super(message, { agentId, cause });
    this.name = 'TransientError';
    this.attempts = attempts ?? 0;
  }
}
