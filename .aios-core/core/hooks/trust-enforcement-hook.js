/**
 * Trust Enforcement Hook for AIOS
 *
 * Integrates Veritas-style trust enforcement into AIOS agent workflows.
 * Provides cross-session trust persistence, mode-aware verification,
 * and permission-based access control.
 *
 * @module trust-enforcement-hook
 */

const fs = require('fs').promises;
const path = require('path');

// Trust level constants
const TrustLevel = {
  UNTRUSTED: 0.0,
  MINIMAL: 0.2,
  LOW: 0.4,
  MODERATE: 0.5,
  GOOD: 0.7,
  HIGH: 0.85,
  FULL: 1.0,

  label(score) {
    if (score >= this.FULL) return 'FULL';
    if (score >= this.HIGH) return 'HIGH';
    if (score >= this.GOOD) return 'GOOD';
    if (score >= this.MODERATE) return 'MODERATE';
    if (score >= this.LOW) return 'LOW';
    if (score >= this.MINIMAL) return 'MINIMAL';
    return 'UNTRUSTED';
  },
};

// Task modes with verification requirements
const TaskMode = {
  PLANNING: 'planning',
  EXECUTION: 'execution',
  DEBUGGING: 'debugging',
  REVIEW: 'review',
  RESEARCH: 'research',
};

const MODE_CONFIGS = {
  [TaskMode.PLANNING]: {
    requireEvidence: false,
    allowSpeculation: true,
    confidenceThreshold: 0.6,
    strictMode: false,
  },
  [TaskMode.EXECUTION]: {
    requireEvidence: true,
    requireVerifiableCommand: true,
    confidenceThreshold: 0.8,
    strictMode: true,
  },
  [TaskMode.DEBUGGING]: {
    requireEvidence: true,
    allowHypotheses: true,
    confidenceThreshold: 0.7,
    strictMode: true,
  },
  [TaskMode.REVIEW]: {
    requireEvidence: true,
    requiredEvidenceCount: 2,
    confidenceThreshold: 0.9,
    strictMode: true,
  },
  [TaskMode.RESEARCH]: {
    requireEvidence: false,
    allowSpeculation: true,
    confidenceThreshold: 0.5,
    strictMode: false,
  },
};

// Permission thresholds by action type and risk level
const PERMISSION_THRESHOLDS = {
  execute: { low: 0.3, medium: 0.5, high: 0.7, critical: 0.85 },
  modify: { low: 0.4, medium: 0.6, high: 0.8, critical: 0.9 },
  delete: { low: 0.5, medium: 0.7, high: 0.85, critical: 0.95 },
  deploy: { low: 0.6, medium: 0.75, high: 0.9, critical: 0.95 },
  approve: { low: 0.7, medium: 0.8, high: 0.9, critical: 1.0 },
};

// Severity multipliers for trust reduction
const SEVERITY_MULTIPLIERS = {
  low: 0.95,
  medium: 0.9,
  high: 0.8,
  critical: 0.6,
};

/**
 * Agent Trust Profile - tracks trust across sessions
 */
class AgentTrustProfile {
  constructor(agentId, data = {}) {
    this.agentId = agentId;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.baseTrust = data.baseTrust ?? TrustLevel.MODERATE;
    this.currentTrust = data.currentTrust ?? TrustLevel.MODERATE;

    // Session history
    this.sessionsCompleted = data.sessionsCompleted || 0;
    this.totalActions = data.totalActions || 0;
    this.totalViolations = data.totalViolations || 0;

    // Streaks
    this.consecutiveCleanSessions = data.consecutiveCleanSessions || 0;
    this.consecutiveViolationSessions = data.consecutiveViolationSessions || 0;

    // Timing
    this.lastSession = data.lastSession || null;
    this.trustHalfLifeDays = data.trustHalfLifeDays || 30;

    // Per-behavior trust
    this.behaviorTrust = data.behaviorTrust || this._initBehaviorTrust();
  }

  _initBehaviorTrust() {
    return {
      verification_before_claim: { score: 1.0, violations: 0 },
      loud_failure: { score: 1.0, violations: 0 },
      honest_uncertainty: { score: 1.0, violations: 0 },
      paper_trail: { score: 1.0, violations: 0 },
      diligent_execution: { score: 1.0, violations: 0 },
    };
  }

  /**
   * Calculate current trust with decay and all factors
   */
  calculateTrust() {
    if (this.sessionsCompleted === 0) {
      return this.baseTrust;
    }

    // Factor 1: Performance (inverse of violation rate)
    const performanceScore =
      this.totalActions > 0
        ? 1.0 - this.totalViolations / this.totalActions
        : this.baseTrust;

    // Factor 2: Behavior average
    const behaviorScores = Object.values(this.behaviorTrust).map((b) => b.score);
    const behaviorAvg =
      behaviorScores.reduce((a, b) => a + b, 0) / behaviorScores.length;

    // Factor 3: Time decay
    const decayFactor = this._calculateDecayFactor();

    // Factor 4: Streak adjustments
    const streakBonus = Math.min(0.1, this.consecutiveCleanSessions * 0.02);
    const streakPenalty = Math.min(0.2, this.consecutiveViolationSessions * 0.05);

    // Combine factors
    const rawTrust =
      performanceScore * 0.35 + behaviorAvg * 0.35 + this.baseTrust * 0.3;

    // Apply adjustments
    const adjustedTrust =
      rawTrust * decayFactor + streakBonus - streakPenalty;

    this.currentTrust = Math.max(0.0, Math.min(1.0, adjustedTrust));
    return this.currentTrust;
  }

  _calculateDecayFactor() {
    if (!this.lastSession) return 1.0;

    const daysSince = Math.floor(
      (Date.now() - new Date(this.lastSession).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Exponential decay with half-life
    const decay = Math.exp((-0.693 * daysSince) / this.trustHalfLifeDays);
    return Math.max(0.5, decay);
  }

  /**
   * Record a violation
   */
  recordViolation(behavior, severity = 'medium') {
    this.totalViolations++;

    if (this.behaviorTrust[behavior]) {
      const bt = this.behaviorTrust[behavior];
      bt.violations++;
      bt.score *= SEVERITY_MULTIPLIERS[severity] || 0.9;
      bt.score = Math.max(0, bt.score);
    }

    this.consecutiveCleanSessions = 0;
    this.consecutiveViolationSessions++;
    this.calculateTrust();
  }

  /**
   * Record successful action
   */
  recordSuccess(behavior = null) {
    if (behavior && this.behaviorTrust[behavior]) {
      this.behaviorTrust[behavior].score = Math.min(
        1.0,
        this.behaviorTrust[behavior].score + 0.02
      );
    }
    this.calculateTrust();
  }

  /**
   * End session and update
   */
  endSession(hadViolations = false) {
    this.sessionsCompleted++;
    this.lastSession = new Date().toISOString();

    if (hadViolations) {
      this.consecutiveCleanSessions = 0;
      this.consecutiveViolationSessions++;
    } else {
      this.consecutiveCleanSessions++;
      this.consecutiveViolationSessions = 0;
    }

    this.calculateTrust();
  }

  /**
   * Get trust summary
   */
  getSummary() {
    return {
      agentId: this.agentId,
      currentTrust: this.currentTrust,
      trustLevel: TrustLevel.label(this.currentTrust),
      sessionsCompleted: this.sessionsCompleted,
      cleanStreak: this.consecutiveCleanSessions,
      violationStreak: this.consecutiveViolationSessions,
      weakestBehaviors: this._getWeakestBehaviors(),
    };
  }

  _getWeakestBehaviors() {
    return Object.entries(this.behaviorTrust)
      .sort((a, b) => a[1].score - b[1].score)
      .slice(0, 3)
      .map(([name, data]) => ({ behavior: name, score: data.score }));
  }

  toJSON() {
    return {
      agentId: this.agentId,
      createdAt: this.createdAt,
      baseTrust: this.baseTrust,
      currentTrust: this.currentTrust,
      sessionsCompleted: this.sessionsCompleted,
      totalActions: this.totalActions,
      totalViolations: this.totalViolations,
      consecutiveCleanSessions: this.consecutiveCleanSessions,
      consecutiveViolationSessions: this.consecutiveViolationSessions,
      lastSession: this.lastSession,
      trustHalfLifeDays: this.trustHalfLifeDays,
      behaviorTrust: this.behaviorTrust,
    };
  }
}

/**
 * Trust Enforcement Hook - singleton manager
 */
class TrustEnforcementHook {
  constructor() {
    this._profiles = new Map();
    this._auditLog = [];
    this._currentMode = TaskMode.EXECUTION;
    this._storageDir = null;
  }

  /**
   * Initialize with storage location
   */
  async initialize(storageDir = '.aios/trust') {
    this._storageDir = storageDir;
    try {
      await fs.mkdir(storageDir, { recursive: true });
      await this._loadProfiles();
    } catch (err) {
      console.warn('[TrustHook] Could not initialize storage:', err.message);
    }
  }

  async _loadProfiles() {
    if (!this._storageDir) return;

    try {
      const profilesFile = path.join(this._storageDir, 'profiles.json');
      const data = await fs.readFile(profilesFile, 'utf-8');
      const profiles = JSON.parse(data);

      for (const [agentId, profileData] of Object.entries(profiles)) {
        this._profiles.set(agentId, new AgentTrustProfile(agentId, profileData));
      }
    } catch (err) {
      // No existing profiles, start fresh
    }
  }

  async _saveProfiles() {
    if (!this._storageDir) return;

    try {
      const profilesFile = path.join(this._storageDir, 'profiles.json');
      const data = {};
      for (const [agentId, profile] of this._profiles) {
        data[agentId] = profile.toJSON();
      }
      await fs.writeFile(profilesFile, JSON.stringify(data, null, 2));
    } catch (err) {
      console.warn('[TrustHook] Could not save profiles:', err.message);
    }
  }

  /**
   * Get or create trust profile for agent
   */
  getProfile(agentId) {
    if (!this._profiles.has(agentId)) {
      this._profiles.set(agentId, new AgentTrustProfile(agentId));
    }
    return this._profiles.get(agentId);
  }

  /**
   * Set current task mode
   */
  setMode(mode, reason = '') {
    const oldMode = this._currentMode;
    this._currentMode = mode;

    this._recordAudit({
      type: 'mode_change',
      oldMode,
      newMode: mode,
      reason,
      timestamp: new Date().toISOString(),
    });

    return MODE_CONFIGS[mode];
  }

  /**
   * Auto-detect mode from task description
   */
  detectMode(taskDescription) {
    const desc = taskDescription.toLowerCase();

    const modeKeywords = {
      [TaskMode.PLANNING]: ['plan', 'design', 'architect', 'brainstorm', 'outline'],
      [TaskMode.EXECUTION]: ['implement', 'code', 'write', 'create', 'build', 'develop'],
      [TaskMode.DEBUGGING]: ['debug', 'fix', 'investigate', 'troubleshoot', 'diagnose'],
      [TaskMode.REVIEW]: ['review', 'audit', 'verify', 'validate', 'check'],
      [TaskMode.RESEARCH]: ['research', 'explore', 'learn', 'understand', 'analyze'],
    };

    for (const [mode, keywords] of Object.entries(modeKeywords)) {
      if (keywords.some((kw) => desc.includes(kw))) {
        return mode;
      }
    }

    return TaskMode.EXECUTION; // Default
  }

  /**
   * Check permission for an action
   */
  checkPermission(agentId, actionType, riskLevel = 'medium') {
    const profile = this.getProfile(agentId);
    const trust = profile.calculateTrust();

    const thresholds = PERMISSION_THRESHOLDS[actionType];
    if (!thresholds) {
      return { allowed: true, reason: 'Unknown action type - allowing' };
    }

    const threshold = thresholds[riskLevel] || thresholds.medium;
    const allowed = trust >= threshold;

    const result = {
      allowed,
      agentId,
      actionType,
      riskLevel,
      currentTrust: trust,
      trustLevel: TrustLevel.label(trust),
      requiredTrust: threshold,
      requiredLevel: TrustLevel.label(threshold),
      reason: allowed
        ? `Trust ${(trust * 100).toFixed(0)}% meets threshold ${(threshold * 100).toFixed(0)}%`
        : `Trust ${(trust * 100).toFixed(0)}% below threshold ${(threshold * 100).toFixed(0)}%`,
    };

    this._recordAudit({
      type: 'permission_check',
      ...result,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  /**
   * Verify action meets mode requirements
   */
  verifyAction(agentId, actionData) {
    const config = MODE_CONFIGS[this._currentMode];
    const violations = [];

    // Check evidence requirements
    if (config.requireEvidence && !actionData.hasEvidence) {
      violations.push({
        behavior: 'verification_before_claim',
        message: 'Evidence required but not provided',
        severity: 'medium',
      });
    }

    // Check verifiable command
    if (config.requireVerifiableCommand && !actionData.verifiableCommand) {
      violations.push({
        behavior: 'verification_before_claim',
        message: 'Verifiable command required',
        severity: 'low',
      });
    }

    // Check confidence
    if (actionData.confidence && actionData.confidence < config.confidenceThreshold) {
      if (!actionData.uncertaintyAcknowledged) {
        violations.push({
          behavior: 'honest_uncertainty',
          message: `Confidence ${(actionData.confidence * 100).toFixed(0)}% below threshold, uncertainty not acknowledged`,
          severity: 'low',
        });
      }
    }

    // Check speculation
    if (actionData.isSpeculation && !config.allowSpeculation) {
      violations.push({
        behavior: 'honest_uncertainty',
        message: 'Speculation not allowed in current mode',
        severity: 'medium',
      });
    }

    // Record violations
    const profile = this.getProfile(agentId);
    for (const v of violations) {
      profile.recordViolation(v.behavior, v.severity);
    }

    const passed = violations.length === 0;

    this._recordAudit({
      type: 'action_verification',
      agentId,
      mode: this._currentMode,
      passed,
      violations,
      timestamp: new Date().toISOString(),
    });

    if (!passed && config.strictMode) {
      throw new TrustViolationError(violations);
    }

    return { passed, violations };
  }

  /**
   * Record action completion
   */
  recordActionComplete(agentId, behavior = null, success = true) {
    const profile = this.getProfile(agentId);
    profile.totalActions++;

    if (success) {
      profile.recordSuccess(behavior);
    }

    this._saveProfiles();
  }

  /**
   * End session for agent
   */
  async endSession(agentId, hadViolations = false) {
    const profile = this.getProfile(agentId);
    profile.endSession(hadViolations);
    await this._saveProfiles();

    return profile.getSummary();
  }

  /**
   * Get trust report for agent
   */
  getTrustReport(agentId) {
    const profile = this.getProfile(agentId);
    return {
      ...profile.getSummary(),
      mode: this._currentMode,
      modeConfig: MODE_CONFIGS[this._currentMode],
      recentAudit: this._auditLog.slice(-10),
    };
  }

  /**
   * Get guidance for improving trust
   */
  getTrustGuidance(agentId) {
    const profile = this.getProfile(agentId);
    const trust = profile.currentTrust;
    const guidance = [];

    if (trust < TrustLevel.MODERATE) {
      guidance.push('Trust is below moderate. Focus on completing tasks without violations.');
    }

    const weakest = profile._getWeakestBehaviors();
    if (weakest.length > 0 && weakest[0].score < 0.8) {
      const behaviors = weakest
        .filter((b) => b.score < 0.8)
        .map((b) => b.behavior.replace(/_/g, ' '));
      guidance.push(`Improve adherence to: ${behaviors.join(', ')}`);
    }

    if (profile.consecutiveViolationSessions > 0) {
      guidance.push(
        `Break the ${profile.consecutiveViolationSessions}-session violation streak.`
      );
    }

    if (guidance.length === 0) {
      guidance.push('Continue consistent verification and avoid violations to build trust.');
    }

    return guidance;
  }

  _recordAudit(entry) {
    this._auditLog.push(entry);
    // Keep last 1000 entries
    if (this._auditLog.length > 1000) {
      this._auditLog = this._auditLog.slice(-1000);
    }
  }
}

/**
 * Custom error for trust violations
 */
class TrustViolationError extends Error {
  constructor(violations) {
    const messages = violations.map((v) => `- ${v.behavior}: ${v.message}`);
    super(`Trust violations detected:\n${messages.join('\n')}`);
    this.name = 'TrustViolationError';
    this.violations = violations;
  }
}

// Singleton instance
const trustHook = new TrustEnforcementHook();

// Export for use in AIOS
module.exports = {
  TrustLevel,
  TaskMode,
  MODE_CONFIGS,
  PERMISSION_THRESHOLDS,
  AgentTrustProfile,
  TrustEnforcementHook,
  TrustViolationError,
  trustHook,

  // Convenience methods
  async initialize(storageDir) {
    return trustHook.initialize(storageDir);
  },

  getProfile(agentId) {
    return trustHook.getProfile(agentId);
  },

  setMode(mode, reason) {
    return trustHook.setMode(mode, reason);
  },

  detectMode(taskDescription) {
    return trustHook.detectMode(taskDescription);
  },

  checkPermission(agentId, actionType, riskLevel) {
    return trustHook.checkPermission(agentId, actionType, riskLevel);
  },

  verifyAction(agentId, actionData) {
    return trustHook.verifyAction(agentId, actionData);
  },

  recordActionComplete(agentId, behavior, success) {
    return trustHook.recordActionComplete(agentId, behavior, success);
  },

  async endSession(agentId, hadViolations) {
    return trustHook.endSession(agentId, hadViolations);
  },

  getTrustReport(agentId) {
    return trustHook.getTrustReport(agentId);
  },

  getTrustGuidance(agentId) {
    return trustHook.getTrustGuidance(agentId);
  },
};
