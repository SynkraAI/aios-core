/**
 * @file error-registry.js
 * @description Central error registration and persistence module for Synkra AIOX.
 * Part of Principle VII: Error Governance.
 */

const fs = require('fs');
const path = require('path');
const AIOXError = require('../utils/aiox-error');

/**
 * Manages the persistence and classification of errors across the framework.
 */
class ErrorRegistry {
  constructor() {
    this.logDir = path.join(process.cwd(), '.aiox', 'logs');
    this.logFile = path.join(this.logDir, 'errors.json');
    this._initialized = false;
  }

  /**
   * Initializes the log directory and file.
   * @private
   */
  _init() {
    if (this._initialized) return;

    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }

      if (!fs.existsSync(this.logFile)) {
        fs.writeFileSync(this.logFile, JSON.stringify([], null, 2), 'utf8');
      }
      this._initialized = true;
    } catch (err) {
      // Inception error: Cannot log the failure of the logger to the logger
      console.error('[ErrorRegistry] Failed to initialize logs:', err.message);
    }
  }

  /**
   * Registers an error into the persistent log.
   * 
   * @param {Error|AIOXError|string} error - The error object or message to log.
   * @param {Object} [options={}] - Additional context and log options.
   * @returns {AIOXError} The normalized AIOXError that was logged.
   */
  log(error, options = {}) {
    this._init();

    // Normalize error to AIOXError
    let aioxError;
    if (error instanceof AIOXError) {
      aioxError = error;
      // Merge additional options if provided
      Object.assign(aioxError, options);
    } else if (error instanceof Error) {
      aioxError = new AIOXError(error.message, {
        category: 'SYSTEM',
        ...options,
        metadata: { ...options.metadata, originalStack: error.stack }
      });
    } else {
      aioxError = new AIOXError(String(error), {
        category: 'OPERATIONAL',
        ...options
      });
    }

    // Output to console unless silent
    if (!aioxError.silent) {
      const icon = aioxError.category === 'SYSTEM' ? '🔴' : '🟡';
      console.error(`${icon} [${aioxError.category}] ${aioxError.message} (${aioxError.agentId})`);
    }

    this._persist(aioxError);
    return aioxError;
  }

  /**
   * Persists the error to the JSON log file.
   * @private
   * @param {AIOXError} aioxError 
   */
  _persist(aioxError) {
    try {
      const data = fs.readFileSync(this.logFile, 'utf8');
      const logs = JSON.parse(data);
      
      logs.push(aioxError.toJSON());

      // Limit log size to last 500 entries to prevent bloating
      const limitedLogs = logs.slice(-500);

      fs.writeFileSync(this.logFile, JSON.stringify(limitedLogs, null, 2), 'utf8');
    } catch (err) {
      console.error('[ErrorRegistry] Persistence failure:', err.message);
    }
  }

  /**
   * Retrieves the last N errors from the log.
   * @param {number} [count=10]
   * @returns {Array<Object>}
   */
  getRecentErrors(count = 10) {
    this._init();
    try {
      const data = fs.readFileSync(this.logFile, 'utf8');
      const logs = JSON.parse(data);
      return logs.slice(-count);
    } catch (err) {
      return [];
    }
  }
}

// Export singleton instance
module.exports = new ErrorRegistry();
