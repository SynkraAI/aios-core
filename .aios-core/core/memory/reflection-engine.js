#!/usr/bin/env node

/**
 * AIOX Agent Reflection Engine
 *
 * Story: 9.6 - Agent Reflection Engine
 * Epic: Epic 9 - Persistent Memory Layer
 *
 * Enables agents to reflect on past executions, extract lessons,
 * and autonomously improve their strategies over time.
 *
 * Features:
 * - AC1: reflection-engine.js in .aios-core/core/memory/
 * - AC2: Persists in .aiox/reflections.json
 * - AC3: Records execution reflections with outcome, duration, strategy used
 * - AC4: Extracts recurring patterns from reflections (success/failure clusters)
 * - AC5: Recommends strategies before similar tasks based on historical outcomes
 * - AC6: Tracks performance trends per agent, task type, and strategy
 * - AC7: Injects relevant reflections as context before task execution
 * - AC8: Prunes stale reflections beyond retention window
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  reflectionsPath: '.aiox/reflections.json',
  maxReflections: 500,
  retentionDays: 90,
  minReflectionsForPattern: 3,
  maxRecommendations: 5,
  similarityThreshold: 0.3,
  version: '1.0.0',
  schemaVersion: 'aiox-reflections-v1',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ENUMS
// ═══════════════════════════════════════════════════════════════════════════════════

const Outcome = {
  SUCCESS: 'success',
  PARTIAL: 'partial',
  FAILURE: 'failure',
  ABORTED: 'aborted',
};

const TaskType = {
  IMPLEMENTATION: 'implementation',
  DEBUGGING: 'debugging',
  REFACTORING: 'refactoring',
  TESTING: 'testing',
  REVIEW: 'review',
  ARCHITECTURE: 'architecture',
  DEPLOYMENT: 'deployment',
  RESEARCH: 'research',
  GENERAL: 'general',
};

const Events = {
  REFLECTION_RECORDED: 'reflection:recorded',
  PATTERN_DETECTED: 'pattern:detected',
  STRATEGY_RECOMMENDED: 'strategy:recommended',
  REFLECTIONS_PRUNED: 'reflections:pruned',
  TREND_SHIFT: 'trend:shift',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              REFLECTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════

class ReflectionEngine extends EventEmitter {
  constructor(options = {}) {
    super();
    this.projectRoot = options.projectRoot || process.cwd();
    this.config = { ...CONFIG, ...options.config };
    this.reflections = [];
    this.patterns = [];
    this._loaded = false;
  }

  /**
   * Get the reflections file path
   */
  _getFilePath() {
    return path.join(this.projectRoot, this.config.reflectionsPath);
  }

  /**
   * Load reflections from disk
   */
  async load() {
    const filePath = this._getFilePath();
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);

        if (data.schemaVersion !== this.config.schemaVersion) {
          this.reflections = [];
          this.patterns = [];
          this._loaded = true;
          return;
        }

        this.reflections = Array.isArray(data.reflections) ? data.reflections : [];
        this.patterns = Array.isArray(data.patterns) ? data.patterns : [];
      }
    } catch {
      this.reflections = [];
      this.patterns = [];
    }
    this._loaded = true;
  }

  /**
   * Save reflections to disk
   */
  async save() {
    const filePath = this._getFilePath();
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = {
      schemaVersion: this.config.schemaVersion,
      version: this.config.version,
      savedAt: new Date().toISOString(),
      reflections: this.reflections,
      patterns: this.patterns,
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  /**
   * Record a new reflection after task execution
   *
   * @param {Object} reflection
   * @param {string} reflection.taskType - Type of task (from TaskType enum)
   * @param {string} reflection.agentId - Agent that executed the task
   * @param {string} reflection.outcome - Outcome (from Outcome enum)
   * @param {string} reflection.strategy - Strategy used (free text)
   * @param {string} reflection.description - What was attempted
   * @param {string[]} [reflection.tags] - Searchable tags
   * @param {number} [reflection.durationMs] - Execution time in ms
   * @param {string} [reflection.lesson] - Key lesson learned
   * @param {string} [reflection.context] - Additional context
   * @returns {Object} The recorded reflection with generated ID
   */
  recordReflection(reflection) {
    if (!reflection.taskType || !reflection.agentId || !reflection.outcome || !reflection.strategy) {
      throw new Error('Required fields: taskType, agentId, outcome, strategy');
    }

    const entry = {
      id: this._generateId(),
      taskType: reflection.taskType,
      agentId: reflection.agentId,
      outcome: reflection.outcome,
      strategy: reflection.strategy,
      description: reflection.description || '',
      tags: reflection.tags || [],
      durationMs: reflection.durationMs ?? null,
      lesson: reflection.lesson ?? null,
      context: reflection.context ?? null,
      createdAt: new Date().toISOString(),
    };

    this.reflections.push(entry);

    // Enforce max reflections
    if (this.reflections.length > this.config.maxReflections) {
      const removed = this.reflections.shift();
      this.emit(Events.REFLECTIONS_PRUNED, { count: 1, reason: 'max_limit', removed: [removed.id] });
      this._recomputePatterns();
    }

    // Check for new patterns
    this._detectPatterns(entry);

    this.emit(Events.REFLECTION_RECORDED, entry);
    return entry;
  }

  /**
   * Get strategy recommendations for a given task context
   *
   * @param {Object} context
   * @param {string} context.taskType - Type of upcoming task
   * @param {string} [context.agentId] - Agent that will execute
   * @param {string[]} [context.tags] - Relevant tags
   * @returns {Object[]} Ranked strategy recommendations
   */
  getRecommendations(context) {
    if (!context.taskType) {
      return [];
    }

    // Find relevant reflections
    const relevant = this.reflections.filter((r) => {
      if (r.taskType !== context.taskType) return false;
      if (context.agentId && r.agentId !== context.agentId) return false;
      return true;
    });

    if (relevant.length === 0) return [];

    // Boost by tag overlap
    const scored = relevant.map((r) => {
      let score = r.outcome === Outcome.SUCCESS ? 1.0 : r.outcome === Outcome.PARTIAL ? 0.5 : 0.0;
      if (context.tags && r.tags) {
        const overlap = context.tags.filter((t) => r.tags.includes(t)).length;
        score += overlap * 0.2;
      }
      // Time decay: newer reflections are more relevant
      const ageMs = Date.now() - new Date(r.createdAt).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      const decay = Math.max(0.1, 1.0 - ageDays / this.config.retentionDays);
      score *= decay;
      return { reflection: r, score };
    });

    // Group by strategy and aggregate scores
    const strategyMap = new Map();
    for (const { reflection, score } of scored) {
      const key = reflection.strategy;
      if (!strategyMap.has(key)) {
        strategyMap.set(key, {
          strategy: key,
          totalScore: 0,
          count: 0,
          successes: 0,
          failures: 0,
          lessons: [],
          avgDurationMs: null,
          durations: [],
        });
      }
      const entry = strategyMap.get(key);
      entry.totalScore += score;
      entry.count += 1;
      if (reflection.outcome === Outcome.SUCCESS) entry.successes++;
      if (reflection.outcome === Outcome.FAILURE) entry.failures++;
      if (reflection.lesson) entry.lessons.push(reflection.lesson);
      if (reflection.durationMs) entry.durations.push(reflection.durationMs);
    }

    // Calculate averages and sort
    const recommendations = Array.from(strategyMap.values())
      .map((s) => {
        s.successRate = s.count > 0 ? s.successes / s.count : 0;
        s.avgScore = s.count > 0 ? s.totalScore / s.count : 0;
        if (s.durations.length > 0) {
          s.avgDurationMs = Math.round(s.durations.reduce((a, b) => a + b, 0) / s.durations.length);
        }
        delete s.durations;
        return s;
      })
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, this.config.maxRecommendations);

    if (recommendations.length > 0) {
      this.emit(Events.STRATEGY_RECOMMENDED, {
        taskType: context.taskType,
        topStrategy: recommendations[0].strategy,
        count: recommendations.length,
      });
    }

    return recommendations;
  }

  /**
   * Inject reflection context before task execution
   *
   * @param {Object} context - Task context (taskType, agentId, tags)
   * @returns {Object} Context with injected reflections
   */
  injectContext(context) {
    const recommendations = this.getRecommendations(context);
    const relevantPatterns = this.patterns.filter(
      (p) => p.taskType === context.taskType || (p.tags && context.tags && context.tags.some((t) => p.tags.includes(t))),
    );

    return {
      ...context,
      reflections: {
        recommendations,
        patterns: relevantPatterns,
        totalReflections: this.reflections.filter((r) => r.taskType === context.taskType).length,
      },
    };
  }

  /**
   * Get performance trends for an agent or task type
   *
   * @param {Object} filter
   * @param {string} [filter.agentId]
   * @param {string} [filter.taskType]
   * @param {number} [filter.windowDays=30]
   * @returns {Object} Performance trend data
   */
  getTrends(filter = {}) {
    const windowDays = filter.windowDays || 30;
    const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;

    const relevant = this.reflections.filter((r) => {
      if (filter.agentId && r.agentId !== filter.agentId) return false;
      if (filter.taskType && r.taskType !== filter.taskType) return false;
      return new Date(r.createdAt).getTime() >= cutoff;
    });

    if (relevant.length === 0) {
      return { total: 0, successRate: 0, avgDurationMs: null, trend: 'insufficient_data' };
    }

    const successes = relevant.filter((r) => r.outcome === Outcome.SUCCESS).length;
    const durations = relevant.filter((r) => r.durationMs).map((r) => r.durationMs);

    // Split into halves for trend detection
    const mid = Math.floor(relevant.length / 2);
    const firstHalf = relevant.slice(0, mid);
    const secondHalf = relevant.slice(mid);

    const firstRate =
      firstHalf.length > 0
        ? firstHalf.filter((r) => r.outcome === Outcome.SUCCESS).length / firstHalf.length
        : 0;
    const secondRate =
      secondHalf.length > 0
        ? secondHalf.filter((r) => r.outcome === Outcome.SUCCESS).length / secondHalf.length
        : 0;

    let trend = 'stable';
    if (secondRate - firstRate > 0.15) trend = 'improving';
    else if (firstRate - secondRate > 0.15) trend = 'declining';

    return {
      total: relevant.length,
      successes,
      successRate: successes / relevant.length,
      avgDurationMs:
        durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : null,
      trend,
      firstHalfRate: firstRate,
      secondHalfRate: secondRate,
    };
  }

  /**
   * Prune reflections older than retention window
   * @returns {number} Number of pruned reflections
   */
  prune() {
    const cutoff = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    const before = this.reflections.length;
    const removed = [];

    this.reflections = this.reflections.filter((r) => {
      const keep = new Date(r.createdAt).getTime() >= cutoff;
      if (!keep) removed.push(r.id);
      return keep;
    });

    const pruned = before - this.reflections.length;
    if (pruned > 0) {
      this._recomputePatterns();
      this.emit(Events.REFLECTIONS_PRUNED, { count: pruned, reason: 'retention_window', removed });
    }
    return pruned;
  }

  /**
   * Get statistics summary
   */
  getStats() {
    const byOutcome = {};
    const byTaskType = {};
    const byAgent = {};

    for (const r of this.reflections) {
      byOutcome[r.outcome] = (byOutcome[r.outcome] || 0) + 1;
      byTaskType[r.taskType] = (byTaskType[r.taskType] || 0) + 1;
      byAgent[r.agentId] = (byAgent[r.agentId] || 0) + 1;
    }

    return {
      totalReflections: this.reflections.length,
      totalPatterns: this.patterns.length,
      byOutcome,
      byTaskType,
      byAgent,
    };
  }

  /**
   * List reflections with optional filtering
   */
  listReflections(filter = {}) {
    let results = [...this.reflections];

    if (filter.taskType) results = results.filter((r) => r.taskType === filter.taskType);
    if (filter.agentId) results = results.filter((r) => r.agentId === filter.agentId);
    if (filter.outcome) results = results.filter((r) => r.outcome === filter.outcome);
    if (filter.tag) results = results.filter((r) => r.tags && r.tags.includes(filter.tag));

    if (filter.limit) results = results.slice(-filter.limit);

    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              INTERNAL METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Detect patterns from accumulated reflections
   * @private
   */
  _detectPatterns(newEntry) {
    // Find reflections with same taskType and strategy
    const similar = this.reflections.filter(
      (r) => r.id !== newEntry.id && r.taskType === newEntry.taskType && r.strategy === newEntry.strategy,
    );

    if (similar.length < this.config.minReflectionsForPattern - 1) return;

    const all = [...similar, newEntry];
    const successes = all.filter((r) => r.outcome === Outcome.SUCCESS).length;
    const successRate = successes / all.length;

    // Collect all tags
    const tagSet = new Set();
    for (const r of all) {
      if (r.tags) r.tags.forEach((t) => tagSet.add(t));
    }

    // Check if pattern already exists
    const existingIdx = this.patterns.findIndex(
      (p) => p.taskType === newEntry.taskType && p.strategy === newEntry.strategy,
    );

    const pattern = {
      taskType: newEntry.taskType,
      strategy: newEntry.strategy,
      sampleSize: all.length,
      successRate,
      tags: Array.from(tagSet),
      confidence: Math.min(1.0, all.length / 10),
      verdict: successRate >= 0.7 ? 'recommended' : successRate <= 0.3 ? 'avoid' : 'neutral',
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      this.patterns[existingIdx] = pattern;
    } else {
      this.patterns.push(pattern);
      this.emit(Events.PATTERN_DETECTED, pattern);
    }
  }


  /**
   * Recompute all patterns from the current set of reflections.
   * Called after pruning to ensure patterns stay consistent with remaining data.
   * @private
   */
  _recomputePatterns() {
    // Group reflections by taskType + strategy
    const groups = new Map();
    for (const r of this.reflections) {
      const key = `${r.taskType}::${r.strategy}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(r);
    }

    const newPatterns = [];
    for (const [, group] of groups) {
      if (group.length < this.config.minReflectionsForPattern) continue;

      const successes = group.filter((r) => r.outcome === Outcome.SUCCESS).length;
      const successRate = successes / group.length;

      const tagSet = new Set();
      for (const r of group) {
        if (r.tags) r.tags.forEach((t) => tagSet.add(t));
      }

      newPatterns.push({
        taskType: group[0].taskType,
        strategy: group[0].strategy,
        sampleSize: group.length,
        successRate,
        tags: Array.from(tagSet),
        confidence: Math.min(1.0, group.length / 10),
        verdict: successRate >= 0.7 ? 'recommended' : successRate <= 0.3 ? 'avoid' : 'neutral',
        updatedAt: new Date().toISOString(),
      });
    }

    this.patterns = newPatterns;
  }

  /**
   * Generate a unique ID
   * @private
   */
  _generateId() {
    return `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = ReflectionEngine;
module.exports.ReflectionEngine = ReflectionEngine;
module.exports.Outcome = Outcome;
module.exports.TaskType = TaskType;
module.exports.Events = Events;
module.exports.CONFIG = CONFIG;
