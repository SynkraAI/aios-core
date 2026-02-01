/**
 * Epic7Executor - Memory Layer Executor
 *
 * Story: 0.3 - Epic Executors (AC6)
 * Epic: Epic 0 - ADE Master Orchestrator
 *
 * Wraps workflow-intelligence to capture patterns, learn from execution,
 * and provide suggestions for future runs.
 *
 * @module core/orchestration/executors/epic-7-executor
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const EpicExecutor = require('./epic-executor');

/**
 * Epic 7 Executor - Memory Layer
 * Manages pattern learning and workflow intelligence
 */
class Epic7Executor extends EpicExecutor {
  constructor(orchestrator) {
    super(orchestrator, 7);

    // Lazy-load workflow intelligence
    this._workflowIntelligence = null;
  }

  /**
   * Get Workflow Intelligence module
   * @private
   */
  _getWorkflowIntelligence() {
    if (!this._workflowIntelligence) {
      try {
        this._workflowIntelligence = require('../../../workflow-intelligence');
      } catch (error) {
        this._log(`Workflow Intelligence not available: ${error.message}`, 'warn');
      }
    }
    return this._workflowIntelligence;
  }

  /**
   * Execute Memory Layer
   * @param {Object} context - Execution context
   * @param {Object} context.qaReport - QA report from Epic 6
   * @param {Array} context.patterns - Patterns detected during execution
   * @param {Object} context.sessionInsights - Session insights
   * @returns {Promise<Object>} Memory layer result
   */
  async execute(context) {
    this._startExecution();

    try {
      const { qaReport, patterns: _patterns, sessionInsights, storyId, techStack } = context;

      this._log(`Executing Memory Layer for ${storyId}`);

      // Capture patterns from this execution
      const capturedPatterns = await this._capturePatterns(context);
      this._log(`Captured ${capturedPatterns.length} patterns`);

      // Store session learnings
      const learnings = await this._storeLearnings({
        storyId,
        patterns: capturedPatterns,
        qaReport,
        techStack,
        sessionInsights,
      });

      // Generate suggestions for future runs
      const suggestions = await this._generateSuggestions(context);

      // Update workflow registry
      await this._updateRegistry(storyId, context);

      // Create session summary
      const summaryPath = await this._createSessionSummary(storyId, {
        patterns: capturedPatterns,
        learnings,
        suggestions,
        sessionInsights,
      });

      this._addArtifact('session-summary', summaryPath);
      this._addArtifact('patterns', JSON.stringify(capturedPatterns));

      return this._completeExecution({
        patternsCaptures: capturedPatterns.length,
        learningsStored: learnings.length,
        suggestionsGenerated: suggestions.length,
        summaryPath,
        patterns: capturedPatterns,
        suggestions,
      });
    } catch (error) {
      return this._failExecution(error);
    }
  }

  /**
   * Capture patterns from execution
   * @private
   */
  async _capturePatterns(context) {
    const patterns = [];
    const WIS = this._getWorkflowIntelligence();

    if (WIS && WIS.PatternCapture) {
      try {
        const capturer = new WIS.PatternCapture({
          projectRoot: this.projectRoot,
        });

        const captured = await capturer.captureFromSession(context);
        patterns.push(...captured);
      } catch (error) {
        this._log(`Pattern capture error: ${error.message}`, 'warn');
      }
    }

    // Always capture basic patterns
    patterns.push(...this._captureBasicPatterns(context));

    return patterns;
  }

  /**
   * Capture basic patterns without WIS
   * @private
   */
  _captureBasicPatterns(context) {
    const patterns = [];
    const { qaReport, sessionInsights, techStack } = context;

    // Tech stack pattern
    if (techStack) {
      patterns.push({
        type: 'tech_stack',
        data: {
          hasFrontend: techStack.hasFrontend,
          hasBackend: techStack.hasBackend,
          hasDatabase: techStack.hasDatabase,
          framework: techStack.frontend?.framework,
          database: techStack.database?.type,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Execution pattern
    if (sessionInsights) {
      patterns.push({
        type: 'execution',
        data: {
          duration: sessionInsights.duration,
          errorsEncountered: sessionInsights.errorsEncountered,
          recoveryAttempts: sessionInsights.recoveryAttempts,
          completedEpics: sessionInsights.completedEpics,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // QA pattern
    if (qaReport) {
      patterns.push({
        type: 'qa_result',
        data: {
          verdict: qaReport.verdict,
          iterations: qaReport.iterations,
          passed: qaReport.passed,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return patterns;
  }

  /**
   * Store learnings for future use
   * @private
   */
  async _storeLearnings(data) {
    const learnings = [];
    const { storyId, patterns, qaReport, techStack } = data;

    // Create learning entry
    const learning = {
      storyId,
      timestamp: new Date().toISOString(),
      techStack: techStack
        ? {
          frontend: techStack.frontend?.framework,
          database: techStack.database?.type,
        }
        : null,
      outcome: qaReport?.passed ? 'success' : 'needs_improvement',
      patternsCount: patterns.length,
    };

    learnings.push(learning);

    // Store in WIS if available
    const WIS = this._getWorkflowIntelligence();
    if (WIS && WIS.PatternStore) {
      try {
        const store = new WIS.PatternStore({
          projectRoot: this.projectRoot,
        });

        await store.addLearning(learning);
      } catch (error) {
        this._log(`Failed to store learning: ${error.message}`, 'warn');
      }
    }

    // Also store locally
    const learningsPath = this._getPath('.aios', 'learnings', `${storyId}.json`);
    await fs.ensureDir(path.dirname(learningsPath));

    let existingLearnings = [];
    if (await fs.pathExists(learningsPath)) {
      existingLearnings = await fs.readJson(learningsPath).catch(() => []);
    }

    existingLearnings.push(learning);
    await fs.writeJson(learningsPath, existingLearnings, { spaces: 2 });

    return learnings;
  }

  /**
   * Generate suggestions for future runs
   * @private
   */
  async _generateSuggestions(context) {
    const suggestions = [];
    const { qaReport, sessionInsights, techStack } = context;

    // Suggestion based on QA results
    if (qaReport && !qaReport.passed) {
      suggestions.push({
        type: 'qa_improvement',
        priority: 'high',
        message: 'Consider adding more tests or improving code quality checks',
      });
    }

    // Suggestion based on errors
    if (sessionInsights?.errorsEncountered > 0) {
      suggestions.push({
        type: 'error_prevention',
        priority: 'medium',
        message: `${sessionInsights.errorsEncountered} errors encountered. Review error patterns for prevention.`,
      });
    }

    // Suggestion based on tech stack
    if (techStack?.hasDatabase && !techStack?.database?.hasSchema) {
      suggestions.push({
        type: 'database',
        priority: 'low',
        message: 'Consider defining database schema for better type safety',
      });
    }

    return suggestions;
  }

  /**
   * Update workflow registry
   * @private
   */
  async _updateRegistry(storyId, context) {
    const WIS = this._getWorkflowIntelligence();

    if (WIS && WIS.WorkflowRegistry) {
      try {
        const registry = new WIS.WorkflowRegistry({
          projectRoot: this.projectRoot,
        });

        await registry.recordExecution({
          storyId,
          timestamp: new Date().toISOString(),
          success: context.qaReport?.passed ?? true,
        });
      } catch (error) {
        this._log(`Failed to update registry: ${error.message}`, 'warn');
      }
    }
  }

  /**
   * Create session summary document
   * @private
   */
  async _createSessionSummary(storyId, data) {
    const summaryPath = this._getPath('.aios', 'session-summaries', `${storyId}-${Date.now()}.md`);
    const { patterns, learnings: _learnings, suggestions, sessionInsights } = data;

    let summary = `# Session Summary: ${storyId}

**Generated:** ${new Date().toISOString()}

---

## Execution Metrics

| Metric | Value |
|--------|-------|
| Duration | ${sessionInsights?.duration ? Math.round(sessionInsights.duration / 1000) + 's' : 'N/A'} |
| Errors | ${sessionInsights?.errorsEncountered || 0} |
| Recovery Attempts | ${sessionInsights?.recoveryAttempts || 0} |
| Completed Epics | ${sessionInsights?.completedEpics || 0} |

## Patterns Captured

${patterns.length} patterns captured during this session.

`;

    for (const pattern of patterns) {
      summary += `- **${pattern.type}**: ${JSON.stringify(pattern.data)}\n`;
    }

    summary += `
## Suggestions for Future Runs

`;

    for (const suggestion of suggestions) {
      const emoji =
        suggestion.priority === 'high' ? '🔴' : suggestion.priority === 'medium' ? '🟡' : '🟢';
      summary += `${emoji} **${suggestion.type}**: ${suggestion.message}\n`;
    }

    summary += `
---
*Generated by Epic 7 Memory Layer Executor*
`;

    await fs.ensureDir(path.dirname(summaryPath));
    await fs.writeFile(summaryPath, summary);

    return summaryPath;
  }
}

module.exports = Epic7Executor;
