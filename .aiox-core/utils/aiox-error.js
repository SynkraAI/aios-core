/**
 * @file aiox-error.js
 * @description Standard base class for all AIOX framework errors.
 * Part of Principle VII: Error Governance.
 */

/**
 * Custom Error class for the AIOX framework.
 * Standardizes metadata capture for observability and automatic registration.
 */
class AIOXError extends Error {
  /**
   * @param {string} message - Human-readable error message.
   * @param {Object} options - Error metadata options.
   * @param {string} [options.category='SYSTEM'] - ERROR_CATEGORY: SYSTEM | OPERATIONAL | NETWORK | AGENT.
   * @param {string} [options.agentId] - ID of the agent that triggered the error.
   * @param {string} [options.action] - Action being performed when the error occurred.
   * @param {Object} [options.metadata] - Additional context-specific metadata.
   * @param {boolean} [options.silent=false] - If true, the error registry should not shout in the console.
   */
  constructor(message, options = {}) {
    super(message);
    
    this.name = this.constructor.name;
    this.category = options.category || 'SYSTEM';
    this.agentId = options.agentId || process.env.AIOX_AGENT_ID || 'unknown';
    this.action = options.action || 'execute';
    this.metadata = options.metadata || {};
    this.silent = options.silent || false;
    this.timestamp = new Date().toISOString();

    // Ensure proper stack trace captured in Node.js
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Converts the error to a plain object for serialization.
   * @returns {Object} Plain object representation of the error.
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      agentId: this.agentId,
      action: this.action,
      timestamp: this.timestamp,
      silent: this.silent,
      metadata: this.metadata,
      stack: this.stack
    };
  }
}

module.exports = AIOXError;
