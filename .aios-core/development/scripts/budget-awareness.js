/**
 * Budget Awareness Module
 *
 * Monitors context window utilization and enforces handoff thresholds.
 * Replaces autocompact with intentional session handoffs.
 *
 * Philosophy: No model was designed to perform well at 95% context utilization.
 * Every model was designed to perform well with clear context and good instructions.
 *
 * Thresholds:
 *   70% — Warning: Consider wrapping up current task
 *   85% — Recommend: Create handoff + start fresh session
 *   95% — Force: Mandatory handoff, quality at risk
 *
 * @version 1.0.0
 * @author Orion (AIOS Master)
 * @created 2026-02-09
 */

const fs = require('fs');
const path = require('path');

// --- Constants ---

const THRESHOLDS = {
  WARNING: 0.70,
  RECOMMEND: 0.85,
  FORCE: 0.95,
};

const STATUS_LABELS = {
  SAFE: 'safe',
  WARNING: 'warning',
  RECOMMEND_HANDOFF: 'recommend-handoff',
  FORCE_HANDOFF: 'force-handoff',
  CRITICAL: 'critical',
};

const BUDGET_STATE_FILE = '.aios/budget-state.json';

// --- Budget Awareness Class ---

class BudgetAwareness {
  /**
   * @param {object} options
   * @param {string} options.projectRoot - Project root directory
   * @param {number} options.maxTokens - Maximum context window tokens (default: 200000)
   * @param {object} options.thresholds - Custom thresholds (optional)
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.maxTokens = options.maxTokens || 200000;
    this.thresholds = { ...THRESHOLDS, ...options.thresholds };
    this.statePath = path.join(this.projectRoot, BUDGET_STATE_FILE);
    this.listeners = [];
  }

  /**
   * Assess current budget status based on estimated token usage.
   *
   * Note: Exact token count isn't available from the model itself.
   * This uses heuristics: conversation turns, file reads, tool calls.
   * The agent should call this periodically with its own estimates.
   *
   * @param {number} estimatedUsage - Estimated tokens used (0.0 to 1.0 ratio, or absolute count)
   * @returns {object} Budget assessment
   */
  assess(estimatedUsage) {
    // Normalize to ratio if absolute count provided
    const ratio = estimatedUsage > 1 ? estimatedUsage / this.maxTokens : estimatedUsage;
    const percent = Math.round(ratio * 100);

    let status;
    let action;
    let urgency;

    if (ratio >= this.thresholds.FORCE) {
      status = STATUS_LABELS.FORCE_HANDOFF;
      action = 'MANDATORY: Create handoff document NOW. Quality is degrading.';
      urgency = 'critical';
    } else if (ratio >= this.thresholds.RECOMMEND) {
      status = STATUS_LABELS.RECOMMEND_HANDOFF;
      action = 'RECOMMENDED: Finish current task, then create handoff and start fresh.';
      urgency = 'high';
    } else if (ratio >= this.thresholds.WARNING) {
      status = STATUS_LABELS.WARNING;
      action = 'WARNING: Context filling up. Plan to wrap up soon.';
      urgency = 'medium';
    } else {
      status = STATUS_LABELS.SAFE;
      action = 'Safe. Continue working.';
      urgency = 'low';
    }

    const assessment = {
      percent,
      ratio: Math.round(ratio * 1000) / 1000,
      status,
      action,
      urgency,
      tokensUsed: Math.round(ratio * this.maxTokens),
      tokensRemaining: Math.round((1 - ratio) * this.maxTokens),
      maxTokens: this.maxTokens,
      timestamp: new Date().toISOString(),
    };

    // Persist state
    this._saveState(assessment);

    // Notify listeners
    this._notify(assessment);

    return assessment;
  }

  /**
   * Get formatted budget status string for display.
   *
   * @param {number} estimatedUsage - Current usage ratio
   * @returns {string} Formatted status line
   */
  getStatusLine(estimatedUsage) {
    const a = this.assess(estimatedUsage);
    const bar = this._progressBar(a.percent);
    const icon = this._statusIcon(a.status);

    return `${icon} Context Budget: ${bar} ${a.percent}% | ${a.action}`;
  }

  /**
   * Check if handoff is recommended at current usage level.
   *
   * @param {number} estimatedUsage - Current usage ratio
   * @returns {boolean}
   */
  shouldHandoff(estimatedUsage) {
    const ratio = estimatedUsage > 1 ? estimatedUsage / this.maxTokens : estimatedUsage;
    return ratio >= this.thresholds.RECOMMEND;
  }

  /**
   * Check if handoff is mandatory at current usage level.
   *
   * @param {number} estimatedUsage - Current usage ratio
   * @returns {boolean}
   */
  mustHandoff(estimatedUsage) {
    const ratio = estimatedUsage > 1 ? estimatedUsage / this.maxTokens : estimatedUsage;
    return ratio >= this.thresholds.FORCE;
  }

  /**
   * Register a callback for threshold crossings.
   *
   * @param {function} callback - fn(assessment) called when threshold crossed
   */
  onThresholdCrossed(callback) {
    this.listeners.push(callback);
  }

  /**
   * Load last saved budget state.
   *
   * @returns {object|null} Last assessment or null
   */
  loadState() {
    try {
      if (fs.existsSync(this.statePath)) {
        return JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
      }
    } catch {
      // Graceful degradation — state is non-critical
    }
    return null;
  }

  // --- Private Methods ---

  _saveState(assessment) {
    try {
      const dir = path.dirname(this.statePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.statePath, JSON.stringify(assessment, null, 2));
    } catch {
      // Non-blocking — budget state is advisory
    }
  }

  _notify(assessment) {
    const previousState = this.loadState();
    const previousStatus = previousState?.status;

    // Only notify on status transitions
    if (previousStatus && previousStatus !== assessment.status) {
      for (const listener of this.listeners) {
        try {
          listener(assessment);
        } catch {
          // Don't let listener errors break budget tracking
        }
      }
    }
  }

  _progressBar(percent, width = 20) {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    const filledChar = percent >= 95 ? '!' : percent >= 85 ? '#' : '=';
    return `[${''.padStart(filled, filledChar)}${''.padStart(empty, '-')}]`;
  }

  _statusIcon(status) {
    const icons = {
      [STATUS_LABELS.SAFE]: '[OK]',
      [STATUS_LABELS.WARNING]: '[!!]',
      [STATUS_LABELS.RECOMMEND_HANDOFF]: '[>>]',
      [STATUS_LABELS.FORCE_HANDOFF]: '[!!]',
      [STATUS_LABELS.CRITICAL]: '[XX]',
    };
    return icons[status] || '[??]';
  }
}

// --- Exports ---

module.exports = {
  BudgetAwareness,
  THRESHOLDS,
  STATUS_LABELS,
};
