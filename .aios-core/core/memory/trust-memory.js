/**
 * Trust Memory Module for AIOS
 *
 * Provides persistent storage for trust-related data:
 * - Agent trust profiles
 * - Trust patterns and anti-patterns
 * - Audit trails
 * - Verification evidence
 *
 * Integrates with existing AIOS memory systems.
 *
 * @module trust-memory
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Trust Memory Manager
 * Handles persistent storage of trust data
 */
class TrustMemory {
  constructor(options = {}) {
    this.baseDir = options.baseDir || '.aios/trust-memory';
    this.profiles = new Map();
    this.patterns = [];
    this.antiPatterns = [];
    this.auditTrail = [];
    this._initialized = false;
  }

  /**
   * Initialize memory storage
   */
  async initialize() {
    if (this._initialized) return;

    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      await fs.mkdir(path.join(this.baseDir, 'profiles'), { recursive: true });
      await fs.mkdir(path.join(this.baseDir, 'patterns'), { recursive: true });
      await fs.mkdir(path.join(this.baseDir, 'audit'), { recursive: true });
      await fs.mkdir(path.join(this.baseDir, 'evidence'), { recursive: true });

      await this._loadAll();
      this._initialized = true;
    } catch (err) {
      console.warn('[TrustMemory] Initialization error:', err.message);
    }
  }

  async _loadAll() {
    await this._loadProfiles();
    await this._loadPatterns();
    await this._loadAuditTrail();
  }

  // ================== Profile Management ==================

  async _loadProfiles() {
    try {
      const dir = path.join(this.baseDir, 'profiles');
      const files = await fs.readdir(dir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const data = await fs.readFile(path.join(dir, file), 'utf-8');
          const profile = JSON.parse(data);
          this.profiles.set(profile.agentId, profile);
        }
      }
    } catch (err) {
      // No profiles yet
    }
  }

  /**
   * Save agent trust profile
   */
  async saveProfile(profile) {
    await this.initialize();

    const filePath = path.join(this.baseDir, 'profiles', `${profile.agentId}.json`);
    await fs.writeFile(filePath, JSON.stringify(profile, null, 2));
    this.profiles.set(profile.agentId, profile);

    return profile;
  }

  /**
   * Load agent trust profile
   */
  async loadProfile(agentId) {
    await this.initialize();

    if (this.profiles.has(agentId)) {
      return this.profiles.get(agentId);
    }

    try {
      const filePath = path.join(this.baseDir, 'profiles', `${agentId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const profile = JSON.parse(data);
      this.profiles.set(agentId, profile);
      return profile;
    } catch (err) {
      return null;
    }
  }

  /**
   * List all agent profiles
   */
  async listProfiles() {
    await this.initialize();
    return Array.from(this.profiles.values());
  }

  // ================== Pattern Management ==================

  async _loadPatterns() {
    try {
      const patternsFile = path.join(this.baseDir, 'patterns', 'patterns.json');
      const data = await fs.readFile(patternsFile, 'utf-8');
      const loaded = JSON.parse(data);
      this.patterns = loaded.patterns || [];
      this.antiPatterns = loaded.antiPatterns || [];
    } catch (err) {
      // No patterns yet
    }
  }

  async _savePatterns() {
    const filePath = path.join(this.baseDir, 'patterns', 'patterns.json');
    await fs.writeFile(
      filePath,
      JSON.stringify(
        { patterns: this.patterns, antiPatterns: this.antiPatterns },
        null,
        2
      )
    );
  }

  /**
   * Store a successful trust pattern
   */
  async storePattern(pattern) {
    await this.initialize();

    const entry = {
      id: `pattern-${Date.now()}`,
      ...pattern,
      createdAt: new Date().toISOString(),
      successCount: 1,
    };

    // Check for similar patterns to merge
    const existing = this.patterns.find(
      (p) =>
        p.taskType === pattern.taskType &&
        p.verificationStrategy === pattern.verificationStrategy
    );

    if (existing) {
      existing.successCount++;
      existing.lastUsed = new Date().toISOString();
    } else {
      this.patterns.push(entry);
    }

    await this._savePatterns();
    return entry;
  }

  /**
   * Store a trust violation as anti-pattern
   */
  async storeAntiPattern(antiPattern) {
    await this.initialize();

    const entry = {
      id: `antipattern-${Date.now()}`,
      ...antiPattern,
      createdAt: new Date().toISOString(),
      occurrenceCount: 1,
    };

    // Check for similar anti-patterns to merge
    const existing = this.antiPatterns.find(
      (p) =>
        p.behavior === antiPattern.behavior && p.context === antiPattern.context
    );

    if (existing) {
      existing.occurrenceCount++;
      existing.lastOccurred = new Date().toISOString();
    } else {
      this.antiPatterns.push(entry);
    }

    await this._savePatterns();
    return entry;
  }

  /**
   * Retrieve patterns relevant to a task
   */
  async retrievePatterns(taskType, limit = 5) {
    await this.initialize();

    return this.patterns
      .filter((p) => p.taskType === taskType || p.taskType === 'general')
      .sort((a, b) => b.successCount - a.successCount)
      .slice(0, limit);
  }

  /**
   * Retrieve anti-patterns (warnings) for a task
   */
  async retrieveAntiPatterns(taskType, agentId = null, limit = 5) {
    await this.initialize();

    return this.antiPatterns
      .filter(
        (p) =>
          (p.taskType === taskType || p.taskType === 'general') &&
          (!agentId || p.agentId === agentId)
      )
      .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
      .slice(0, limit);
  }

  /**
   * Generate warnings based on anti-patterns
   */
  async generateWarnings(taskType, agentId = null) {
    const antiPatterns = await this.retrieveAntiPatterns(taskType, agentId);
    const warnings = [];

    for (const ap of antiPatterns) {
      if (ap.occurrenceCount >= 2) {
        warnings.push({
          message: `Repeated issue: ${ap.description}`,
          suggestion: ap.remediation || 'Review past violations',
          severity: ap.severity || 'medium',
          occurrences: ap.occurrenceCount,
        });
      }
    }

    return warnings;
  }

  // ================== Audit Trail ==================

  async _loadAuditTrail() {
    try {
      const auditFile = path.join(this.baseDir, 'audit', 'trail.json');
      const data = await fs.readFile(auditFile, 'utf-8');
      this.auditTrail = JSON.parse(data);
    } catch (err) {
      // No audit trail yet
    }
  }

  async _saveAuditTrail() {
    const filePath = path.join(this.baseDir, 'audit', 'trail.json');
    // Keep only last 10000 entries
    const toSave = this.auditTrail.slice(-10000);
    await fs.writeFile(filePath, JSON.stringify(toSave, null, 2));
  }

  /**
   * Record an audit entry
   */
  async recordAudit(entry) {
    await this.initialize();

    const auditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
    };

    this.auditTrail.push(auditEntry);

    // Save periodically (every 100 entries or on important events)
    if (
      this.auditTrail.length % 100 === 0 ||
      entry.type === 'trust_violation' ||
      entry.type === 'permission_denied'
    ) {
      await this._saveAuditTrail();
    }

    return auditEntry;
  }

  /**
   * Query audit trail
   */
  async queryAudit(options = {}) {
    await this.initialize();

    let results = [...this.auditTrail];

    // Filter by agent
    if (options.agentId) {
      results = results.filter((e) => e.agentId === options.agentId);
    }

    // Filter by type
    if (options.type) {
      results = results.filter((e) => e.type === options.type);
    }

    // Filter by time range
    if (options.since) {
      const sinceDate = new Date(options.since);
      results = results.filter((e) => new Date(e.timestamp) >= sinceDate);
    }

    if (options.until) {
      const untilDate = new Date(options.until);
      results = results.filter((e) => new Date(e.timestamp) <= untilDate);
    }

    // Sort and limit
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  // ================== Evidence Storage ==================

  /**
   * Store verification evidence
   */
  async storeEvidence(evidence) {
    await this.initialize();

    const entry = {
      id: `evidence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...evidence,
      storedAt: new Date().toISOString(),
    };

    const filePath = path.join(this.baseDir, 'evidence', `${entry.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(entry, null, 2));

    return entry;
  }

  /**
   * Retrieve evidence by ID
   */
  async retrieveEvidence(evidenceId) {
    await this.initialize();

    try {
      const filePath = path.join(this.baseDir, 'evidence', `${evidenceId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      return null;
    }
  }

  /**
   * List evidence for a session/task
   */
  async listEvidence(options = {}) {
    await this.initialize();

    try {
      const dir = path.join(this.baseDir, 'evidence');
      const files = await fs.readdir(dir);
      const evidence = [];

      for (const file of files.slice(-100)) {
        // Last 100 files
        if (file.endsWith('.json')) {
          const data = await fs.readFile(path.join(dir, file), 'utf-8');
          const entry = JSON.parse(data);

          if (options.agentId && entry.agentId !== options.agentId) continue;
          if (options.taskId && entry.taskId !== options.taskId) continue;

          evidence.push(entry);
        }
      }

      return evidence.sort(
        (a, b) => new Date(b.storedAt) - new Date(a.storedAt)
      );
    } catch (err) {
      return [];
    }
  }

  // ================== Context for Agents ==================

  /**
   * Build trust context for injection into agent prompts
   */
  async buildTrustContext(agentId, taskType) {
    await this.initialize();

    const profile = await this.loadProfile(agentId);
    const patterns = await this.retrievePatterns(taskType);
    const warnings = await this.generateWarnings(taskType, agentId);
    const recentAudit = await this.queryAudit({
      agentId,
      limit: 10,
    });

    return {
      trustProfile: profile
        ? {
            currentTrust: profile.currentTrust,
            trustLevel: this._getTrustLabel(profile.currentTrust),
            sessionsCompleted: profile.sessionsCompleted,
            cleanStreak: profile.consecutiveCleanSessions,
          }
        : null,
      verificationStrategies: patterns.map((p) => ({
        strategy: p.verificationStrategy,
        successCount: p.successCount,
      })),
      warnings: warnings,
      recentHistory: recentAudit.map((a) => ({
        type: a.type,
        passed: a.passed,
        timestamp: a.timestamp,
      })),
    };
  }

  _getTrustLabel(score) {
    if (score >= 1.0) return 'FULL';
    if (score >= 0.85) return 'HIGH';
    if (score >= 0.7) return 'GOOD';
    if (score >= 0.5) return 'MODERATE';
    if (score >= 0.4) return 'LOW';
    if (score >= 0.2) return 'MINIMAL';
    return 'UNTRUSTED';
  }

  // ================== Cross-Session Learning ==================

  /**
   * Learn from completed task
   */
  async learnFromTask(taskResult) {
    await this.initialize();

    const {
      agentId,
      taskType,
      outcome,
      verificationStrategy,
      violations,
      evidence,
    } = taskResult;

    // Store patterns or anti-patterns based on outcome
    if (outcome === 'success' && violations.length === 0) {
      await this.storePattern({
        agentId,
        taskType,
        verificationStrategy,
        evidenceTypes: evidence.map((e) => e.type),
      });
    }

    for (const violation of violations) {
      await this.storeAntiPattern({
        agentId,
        taskType,
        behavior: violation.behavior,
        description: violation.message,
        severity: violation.severity,
        remediation: violation.remediation,
        context: violation.context,
      });
    }

    // Record audit entry
    await this.recordAudit({
      type: 'task_completed',
      agentId,
      taskType,
      outcome,
      violationCount: violations.length,
      evidenceCount: evidence.length,
    });

    return {
      patternsLearned: outcome === 'success' && violations.length === 0 ? 1 : 0,
      antiPatternsRecorded: violations.length,
    };
  }
}

// Singleton instance
const trustMemory = new TrustMemory();

module.exports = {
  TrustMemory,
  trustMemory,

  // Convenience exports
  async initialize(baseDir) {
    trustMemory.baseDir = baseDir || trustMemory.baseDir;
    return trustMemory.initialize();
  },

  saveProfile: (profile) => trustMemory.saveProfile(profile),
  loadProfile: (agentId) => trustMemory.loadProfile(agentId),
  listProfiles: () => trustMemory.listProfiles(),

  storePattern: (pattern) => trustMemory.storePattern(pattern),
  storeAntiPattern: (antiPattern) => trustMemory.storeAntiPattern(antiPattern),
  retrievePatterns: (taskType, limit) =>
    trustMemory.retrievePatterns(taskType, limit),
  retrieveAntiPatterns: (taskType, agentId, limit) =>
    trustMemory.retrieveAntiPatterns(taskType, agentId, limit),
  generateWarnings: (taskType, agentId) =>
    trustMemory.generateWarnings(taskType, agentId),

  recordAudit: (entry) => trustMemory.recordAudit(entry),
  queryAudit: (options) => trustMemory.queryAudit(options),

  storeEvidence: (evidence) => trustMemory.storeEvidence(evidence),
  retrieveEvidence: (id) => trustMemory.retrieveEvidence(id),
  listEvidence: (options) => trustMemory.listEvidence(options),

  buildTrustContext: (agentId, taskType) =>
    trustMemory.buildTrustContext(agentId, taskType),
  learnFromTask: (taskResult) => trustMemory.learnFromTask(taskResult),
};
