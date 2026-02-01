/**
 * Subagent Dispatcher
 * Story 10.2 - Parallel Agent Execution
 *
 * Dispatches tasks to specialized subagents based on task type.
 * Injects relevant context from Memory Layer.
 */

const EventEmitter = require('events');
const { spawn } = require('child_process');
const _path = require('path');

// Import dependencies with fallbacks
let MemoryQuery, GotchasMemory;
try {
  MemoryQuery = require('../memory/memory-query');
} catch {
  MemoryQuery = null;
}
try {
  GotchasMemory = require('../memory/gotchas-memory');
} catch {
  GotchasMemory = null;
}

class SubagentDispatcher extends EventEmitter {
  constructor(config = {}) {
    super();

    // Agent mapping: task type → agent
    this.agentMapping = config.agentMapping || {
      database: '@data-engineer',
      db: '@data-engineer',
      migration: '@data-engineer',
      api: '@dev',
      backend: '@dev',
      frontend: '@dev',
      component: '@dev',
      feature: '@dev',
      bugfix: '@dev',
      test: '@qa',
      testing: '@qa',
      review: '@qa',
      deploy: '@devops',
      infrastructure: '@devops',
      ci: '@devops',
      architecture: '@architect',
      design: '@architect',
      documentation: '@pm',
      docs: '@pm',
      planning: '@pm',
      analysis: '@analyst',
      research: '@analyst',
    };

    // Default agent when no match
    this.defaultAgent = config.defaultAgent || '@dev';

    // Retry configuration
    this.maxRetries = config.maxRetries || 2;
    this.retryDelay = config.retryDelay || 2000;

    // Dependencies
    this.memoryQuery = config.memoryQuery || (MemoryQuery ? new MemoryQuery() : null);
    this.gotchasMemory = config.gotchasMemory || (GotchasMemory ? new GotchasMemory() : null);

    // Dispatch log
    this.dispatchLog = [];
    this.maxLogSize = 100;

    // Root path for project
    this.rootPath = config.rootPath || process.cwd();
  }

  /**
   * Dispatch a task to the appropriate subagent
   * @param {Object} task - Task to dispatch
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Dispatch result
   */
  async dispatch(task, context = {}) {
    const agentId = this.resolveAgent(task);
    const startTime = Date.now();

    // Create dispatch record
    const dispatchRecord = {
      id: `dispatch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId: task.id,
      agentId,
      startedAt: new Date().toISOString(),
      attempts: 0,
    };

    this.emit('dispatch_started', dispatchRecord);
    this.log('dispatch_started', dispatchRecord);

    // Enrich context
    const enrichedContext = await this.enrichContext(task, context);
    dispatchRecord.contextSize = JSON.stringify(enrichedContext).length;

    // Execute with retries
    let lastError = null;
    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      dispatchRecord.attempts = attempt;

      try {
        const result = await this.spawnSubagent(agentId, task, enrichedContext);

        dispatchRecord.completedAt = new Date().toISOString();
        dispatchRecord.success = result.success;
        dispatchRecord.duration = Date.now() - startTime;
        dispatchRecord.outputSize = result.output?.length || 0;

        this.emit('dispatch_completed', dispatchRecord);
        this.log('dispatch_completed', dispatchRecord);

        return {
          success: result.success,
          output: result.output,
          agentId,
          taskId: task.id,
          duration: dispatchRecord.duration,
          filesModified: result.filesModified || [],
        };
      } catch (error) {
        lastError = error;

        this.log('dispatch_attempt_failed', {
          ...dispatchRecord,
          attempt,
          error: error.message,
        });

        if (attempt <= this.maxRetries) {
          this.emit('dispatch_retry', { taskId: task.id, attempt, error: error.message });
          await this.sleep(this.retryDelay);
        }
      }
    }

    // All retries failed
    dispatchRecord.completedAt = new Date().toISOString();
    dispatchRecord.success = false;
    dispatchRecord.error = lastError?.message || 'Unknown error';
    dispatchRecord.duration = Date.now() - startTime;

    this.emit('dispatch_failed', dispatchRecord);
    this.log('dispatch_failed', dispatchRecord);

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      agentId,
      taskId: task.id,
      duration: dispatchRecord.duration,
      filesModified: [],
    };
  }

  /**
   * Resolve which agent should handle a task
   * @param {Object} task - Task to resolve agent for
   * @returns {string} - Agent identifier
   */
  resolveAgent(task) {
    // Check explicit agent assignment
    if (task.agent) {
      return task.agent.startsWith('@') ? task.agent : `@${task.agent}`;
    }

    // Check task type
    if (task.type && this.agentMapping[task.type.toLowerCase()]) {
      return this.agentMapping[task.type.toLowerCase()];
    }

    // Check task tags
    if (task.tags && Array.isArray(task.tags)) {
      for (const tag of task.tags) {
        if (this.agentMapping[tag.toLowerCase()]) {
          return this.agentMapping[tag.toLowerCase()];
        }
      }
    }

    // Infer from task description
    const description = (task.description || '').toLowerCase();

    const inferencePatterns = [
      { patterns: ['database', 'sql', 'migration', 'schema'], agent: '@data-engineer' },
      { patterns: ['test', 'spec', 'coverage', 'assert'], agent: '@qa' },
      { patterns: ['deploy', 'docker', 'ci/cd', 'pipeline', 'kubernetes'], agent: '@devops' },
      { patterns: ['architect', 'design pattern', 'structure'], agent: '@architect' },
      { patterns: ['document', 'readme', 'guide'], agent: '@pm' },
      { patterns: ['analyze', 'research', 'investigate'], agent: '@analyst' },
    ];

    for (const { patterns, agent } of inferencePatterns) {
      if (patterns.some((p) => description.includes(p))) {
        return agent;
      }
    }

    // Default
    return this.defaultAgent;
  }

  /**
   * Enrich context with memory and gotchas
   * @param {Object} task - Task being dispatched
   * @param {Object} context - Base context
   * @returns {Promise<Object>} - Enriched context
   */
  async enrichContext(task, context) {
    const enriched = { ...context };

    // Get relevant memory
    if (this.memoryQuery) {
      try {
        const memory = await this.memoryQuery.getContextForAgent(
          this.resolveAgent(task),
          task.description,
        );
        enriched.memory = memory.relevantMemory || [];
        enriched.patterns = memory.suggestedPatterns || [];
      } catch (error) {
        this.log('memory_query_failed', { taskId: task.id, error: error.message });
      }
    }

    // Get relevant gotchas
    if (this.gotchasMemory) {
      try {
        const gotchas = await this.gotchasMemory.getContextForTask(task.description);
        enriched.gotchas = gotchas.filter((g) => this.isRelevantGotcha(g, task));
      } catch (error) {
        this.log('gotchas_query_failed', { taskId: task.id, error: error.message });
      }
    }

    // Add project context
    enriched.projectContext = await this.getProjectContext();

    return enriched;
  }

  /**
   * Check if a gotcha is relevant to a task
   * @param {Object} gotcha - Gotcha to check
   * @param {Object} task - Task being executed
   * @returns {boolean} - True if relevant
   */
  isRelevantGotcha(gotcha, task) {
    const taskText =
      `${task.description} ${task.type || ''} ${(task.tags || []).join(' ')}`.toLowerCase();

    // Check if gotcha pattern appears in task
    if (gotcha.pattern && taskText.includes(gotcha.pattern.toLowerCase())) {
      return true;
    }

    // Check if gotcha category matches task type
    if (gotcha.category && task.type && gotcha.category.toLowerCase() === task.type.toLowerCase()) {
      return true;
    }

    // Check for keyword overlap
    const gotchaKeywords = (gotcha.description || '').toLowerCase().split(/\s+/);
    const taskKeywords = taskText.split(/\s+/);
    const overlap = gotchaKeywords.filter((k) => taskKeywords.includes(k) && k.length > 3);

    return overlap.length >= 2;
  }

  /**
   * Get project context
   * @returns {Promise<Object>} - Project context
   */
  async getProjectContext() {
    // This would read from .aios/codebase-map.json or similar
    return {
      rootPath: this.rootPath,
      framework: 'aios-core',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Spawn a subagent to execute a task
   * @param {string} agentId - Agent identifier
   * @param {Object} task - Task to execute
   * @param {Object} context - Enriched context
   * @returns {Promise<Object>} - Execution result
   */
  async spawnSubagent(agentId, task, context) {
    // Build the prompt
    const prompt = this.buildPrompt(agentId, task, context);

    // Execute via Claude CLI
    return this.executeClaude(prompt);
  }

  /**
   * Build prompt for subagent
   * @param {string} agentId - Agent identifier
   * @param {Object} task - Task to execute
   * @param {Object} context - Context
   * @returns {string} - Formatted prompt
   */
  buildPrompt(agentId, task, context) {
    let prompt = `You are ${agentId}, a specialized agent in the AIOS framework.\n\n`;

    prompt += '## Task\n';
    prompt += `**ID:** ${task.id}\n`;
    prompt += `**Description:** ${task.description}\n\n`;

    if (task.acceptanceCriteria) {
      prompt += '## Acceptance Criteria\n';
      const criteria = Array.isArray(task.acceptanceCriteria)
        ? task.acceptanceCriteria
        : [task.acceptanceCriteria];
      criteria.forEach((ac, i) => {
        prompt += `${i + 1}. ${ac}\n`;
      });
      prompt += '\n';
    }

    if (task.files && task.files.length > 0) {
      prompt += '## Files to Modify\n';
      task.files.forEach((f) => {
        prompt += `- \`${f}\`\n`;
      });
      prompt += '\n';
    }

    if (context.gotchas && context.gotchas.length > 0) {
      prompt += '## Active Gotchas (Avoid These Mistakes)\n';
      context.gotchas.forEach((g) => {
        prompt += `⚠️ **${g.title || g.pattern}**: ${g.workaround || g.description}\n`;
      });
      prompt += '\n';
    }

    if (context.patterns && context.patterns.length > 0) {
      prompt += '## Suggested Patterns\n';
      context.patterns.slice(0, 3).forEach((p) => {
        prompt += `- ${p.name || p}: ${p.description || ''}\n`;
      });
      prompt += '\n';
    }

    prompt += '## Instructions\n';
    prompt += '1. Implement the task completely\n';
    prompt += '2. Follow existing patterns in the codebase\n';
    prompt += '3. After completing, verify your changes work\n';
    prompt += '4. Respond with a summary of what you did\n';

    return prompt;
  }

  /**
   * Execute prompt via Claude CLI
   * @param {string} prompt - Prompt to execute
   * @returns {Promise<Object>} - Execution result
   */
  executeClaude(prompt) {
    return new Promise((resolve, reject) => {
      const args = ['--print', '--dangerously-skip-permissions'];
      const escapedPrompt = prompt.replace(/'/g, "'\\''");
      const fullCommand = `echo '${escapedPrompt}' | claude ${args.join(' ')}`;

      const child = spawn('sh', ['-c', fullCommand], {
        cwd: this.rootPath,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: stdout,
            filesModified: this.extractModifiedFiles(stdout),
          });
        } else {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Extract modified files from Claude output
   * @param {string} output - Claude output
   * @returns {Array<string>} - List of modified files
   */
  extractModifiedFiles(output) {
    const files = [];

    // Match common patterns
    const patterns = [
      /(?:created|modified|updated|wrote|edited).*?[`']([^`']+)[`']/gi,
      /(?:file|path):\s*[`']?([^\s`']+\.[a-z]+)[`']?/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(output)) !== null) {
        const file = match[1];
        if ((!files.includes(file) && file.includes('/')) || file.includes('.')) {
          files.push(file);
        }
      }
    }

    return files;
  }

  /**
   * Log an event
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  log(type, data) {
    const entry = {
      type,
      timestamp: new Date().toISOString(),
      ...data,
    };

    this.dispatchLog.push(entry);

    if (this.dispatchLog.length > this.maxLogSize) {
      this.dispatchLog.shift();
    }
  }

  /**
   * Get dispatch log
   * @param {number} limit - Max entries
   * @returns {Array} - Log entries
   */
  getLog(limit = 20) {
    return this.dispatchLog.slice(-limit);
  }

  /**
   * Sleep for milliseconds
   * @param {number} ms - Milliseconds
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get agent mapping
   * @returns {Object} - Current agent mapping
   */
  getAgentMapping() {
    return { ...this.agentMapping };
  }

  /**
   * Update agent mapping
   * @param {Object} mapping - New mappings to add/update
   */
  updateAgentMapping(mapping) {
    this.agentMapping = { ...this.agentMapping, ...mapping };
  }

  /**
   * Format status for CLI
   * @returns {string} - Formatted status
   */
  formatStatus() {
    const recentDispatches = this.getLog(10);

    let output = '📤 Subagent Dispatcher Status\n';
    output += '━'.repeat(40) + '\n\n';

    output += '**Agent Mapping:**\n';
    const agents = [...new Set(Object.values(this.agentMapping))];
    for (const agent of agents) {
      const types = Object.entries(this.agentMapping)
        .filter(([_, a]) => a === agent)
        .map(([t]) => t);
      output += `  ${agent}: ${types.slice(0, 4).join(', ')}${types.length > 4 ? '...' : ''}\n`;
    }
    output += '\n';

    if (recentDispatches.length > 0) {
      output += '**Recent Dispatches:**\n';
      for (const dispatch of recentDispatches.slice(-5)) {
        const icon = dispatch.success === true ? '✅' : dispatch.success === false ? '❌' : '🔄';
        output += `  ${icon} ${dispatch.taskId || 'N/A'} → ${dispatch.agentId || 'N/A'}`;
        if (dispatch.duration) output += ` (${dispatch.duration}ms)`;
        output += '\n';
      }
    }

    return output;
  }
}

module.exports = SubagentDispatcher;
module.exports.SubagentDispatcher = SubagentDispatcher;
