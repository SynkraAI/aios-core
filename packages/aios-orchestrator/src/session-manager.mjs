/**
 * Session Manager — SDK query() Wrapper
 *
 * Wraps the Claude Agent SDK `query()` function to create isolated sessions
 * per agent. Handles system prompt assembly (3 layers), tool restrictions,
 * budget enforcement, streaming, retry on transient errors, and structured
 * result extraction.
 *
 * Story: E7.1.2
 * Architecture: docs/architecture/sdk-orchestrator-architecture.md Section 7
 *
 * @module session-manager
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  OrchestratorError,
  ConfigError,
  BudgetError,
  TransientError,
} from './errors.mjs';

// ---------------------------------------------------------------------------
// SDK Import — graceful degradation if not installed
// ---------------------------------------------------------------------------

let sdkQuery = null;

try {
  const sdk = await import('@anthropic-ai/claude-agent-sdk');
  sdkQuery = sdk.query;
} catch {
  // SDK not installed — will be handled at runtime when run() is called.
  // Tests inject a mock via the queryFn option.
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default max retries for transient errors */
const DEFAULT_MAX_RETRIES = 2;

/** Base delay for exponential backoff (ms) */
const BASE_BACKOFF_MS = 2000;

/** Patterns that identify transient / retryable errors */
const TRANSIENT_PATTERNS = [
  'ECONNRESET',
  'EPIPE',
  'ETIMEDOUT',
  'ECONNABORTED',
  'timeout',
  'socket hang up',
];

/** HTTP status codes that are transient */
const TRANSIENT_STATUS_CODES = [429, 500, 502, 503, 504];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determine if an error is transient and should be retried.
 *
 * @param {Error} err
 * @returns {boolean}
 */
function isTransientError(err) {
  if (!err) return false;

  const message = (err.message || '').toLowerCase();
  const code = err.code || '';

  // Check error code patterns
  for (const pattern of TRANSIENT_PATTERNS) {
    if (code === pattern || message.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  // Check HTTP status codes
  const status = err.status || err.statusCode || 0;
  if (TRANSIENT_STATUS_CODES.includes(status)) {
    return true;
  }

  return false;
}

/**
 * Determine if an error is a budget exceeded error from the SDK.
 *
 * @param {Error} err
 * @returns {boolean}
 */
function isBudgetError(err) {
  if (!err) return false;
  const message = (err.message || '').toLowerCase();
  return (
    message.includes('budget') ||
    message.includes('cost') ||
    message.includes('spending limit') ||
    err.code === 'BUDGET_EXCEEDED'
  );
}

/**
 * Determine if an error is a configuration/auth error.
 *
 * @param {Error} err
 * @returns {boolean}
 */
function isConfigError(err) {
  if (!err) return false;
  const message = (err.message || '').toLowerCase();
  return (
    message.includes('authentication') ||
    message.includes('api key') ||
    message.includes('invalid_api_key') ||
    message.includes('permission denied') ||
    message.includes('unauthorized') ||
    err.code === 'AUTH_ERROR' ||
    err.code === 'CONFIG_ERROR'
  );
}

/**
 * Extract cost from SDK messages defensively (AC8 / CP-8 mitigation).
 *
 * Attempts multiple extraction strategies. Falls back to 0 if no cost data
 * is found, and never throws.
 *
 * @param {Array} messages - Raw SDK messages
 * @param {object} [logger] - Logger instance for warnings
 * @returns {number} Cost in USD
 */
export function extractCost(messages, logger) {
  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      if (logger) logger.warn({ event: 'cost_extraction_no_data' }, 'No messages to extract cost from');
      return 0;
    }

    // Strategy 1: Look for usage.cost field on any message
    for (const msg of messages) {
      if (msg?.usage?.cost !== undefined && msg.usage.cost !== null) {
        return Number(msg.usage.cost) || 0;
      }
    }

    // Strategy 2: Look for costUsd or cost_usd on any message
    for (const msg of messages) {
      if (msg?.costUsd !== undefined) return Number(msg.costUsd) || 0;
      if (msg?.cost_usd !== undefined) return Number(msg.cost_usd) || 0;
    }

    // Strategy 3: Look for usage.total_cost on the last message
    const last = messages[messages.length - 1];
    if (last?.usage?.total_cost !== undefined) {
      return Number(last.usage.total_cost) || 0;
    }

    // Strategy 4: Compute from input/output token counts if available
    // (rough estimate based on Claude Sonnet pricing)
    if (last?.usage?.input_tokens && last?.usage?.output_tokens) {
      const inputCost = (last.usage.input_tokens / 1_000_000) * 3; // $3/MTok
      const outputCost = (last.usage.output_tokens / 1_000_000) * 15; // $15/MTok
      return inputCost + outputCost;
    }

    if (logger) {
      logger.warn({ event: 'cost_extraction_fallback', messageCount: messages.length },
        'Cost data not found in SDK messages, falling back to 0');
    }
    return 0;
  } catch {
    // Never throw from cost extraction
    if (logger) {
      logger.warn({ event: 'cost_extraction_error' }, 'Error during cost extraction, falling back to 0');
    }
    return 0;
  }
}

/**
 * Extract the final text content from the last assistant message.
 *
 * @param {Array} messages
 * @returns {string}
 */
function extractSummary(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return '';

  // Walk backwards to find the last assistant message with text content
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];

    // SDK message formats vary. Handle common shapes.
    if (msg?.role === 'assistant' && typeof msg?.content === 'string') {
      return msg.content;
    }

    if (msg?.role === 'assistant' && Array.isArray(msg?.content)) {
      const textParts = msg.content
        .filter((part) => part.type === 'text')
        .map((part) => part.text);
      if (textParts.length > 0) return textParts.join('\n');
    }

    // Some SDK versions use a flat `text` field
    if (msg?.type === 'assistant' && typeof msg?.text === 'string') {
      return msg.text;
    }

    // Result message format
    if (msg?.type === 'result' && typeof msg?.result === 'string') {
      return msg.result;
    }
  }

  return '';
}

/**
 * Extract tool calls from SDK messages.
 *
 * @param {Array} messages
 * @returns {Array<{ name: string, input: * }>}
 */
function extractToolCalls(messages) {
  if (!Array.isArray(messages)) return [];

  const toolCalls = [];

  for (const msg of messages) {
    // Format 1: tool_use blocks inside assistant content
    if (msg?.role === 'assistant' && Array.isArray(msg?.content)) {
      for (const block of msg.content) {
        if (block.type === 'tool_use') {
          toolCalls.push({ name: block.name, input: block.input });
        }
      }
    }

    // Format 2: Flat tool_use message
    if (msg?.type === 'tool_use') {
      toolCalls.push({ name: msg.name, input: msg.input });
    }

    // Format 3: tool_calls array on a message
    if (Array.isArray(msg?.tool_calls)) {
      for (const tc of msg.tool_calls) {
        toolCalls.push({ name: tc.name || tc.function?.name, input: tc.input || tc.function?.arguments });
      }
    }
  }

  return toolCalls;
}

/**
 * Load the system prompt for an agent (Layer 1).
 *
 * Layer 1: Agent persona file (read from disk)
 * Layer 2: CLAUDE.md + rules (auto-loaded by SDK via settingSources)
 * Layer 3: Workflow context (appended to user prompt by caller)
 *
 * @param {object} agentConfig - Agent configuration from registry
 * @param {string} projectRoot - Project root directory
 * @returns {string} System prompt content
 */
function loadSystemPrompt(agentConfig, projectRoot) {
  const promptPath = resolve(projectRoot, agentConfig.systemPromptFile);

  let persona;
  try {
    persona = readFileSync(promptPath, 'utf-8');
  } catch (err) {
    throw new ConfigError(
      `Failed to read system prompt file "${agentConfig.systemPromptFile}": ${err.message}`,
      { agentId: agentConfig.id, cause: err }
    );
  }

  // Append systemPromptAppend if non-empty
  if (agentConfig.systemPromptAppend) {
    persona += '\n' + agentConfig.systemPromptAppend;
  }

  return persona;
}

/**
 * Build the user prompt with workflow context appended (Layer 3).
 *
 * @param {string} prompt - Original user prompt
 * @param {object} [workflowContext] - Optional workflow context
 * @returns {string}
 */
function buildPromptWithContext(prompt, workflowContext) {
  if (!workflowContext) return prompt;

  const contextParts = [];

  if (workflowContext.storyFile) {
    contextParts.push(`Story file: ${workflowContext.storyFile}`);
  }

  if (workflowContext.phase) {
    contextParts.push(`Workflow phase: ${workflowContext.phase}`);
  }

  if (workflowContext.previousResult) {
    contextParts.push(`Previous phase result:\n${workflowContext.previousResult}`);
  }

  // Allow arbitrary extra context
  if (workflowContext.extra) {
    contextParts.push(workflowContext.extra);
  }

  if (contextParts.length === 0) return prompt;

  return `${prompt}\n\n--- Workflow Context ---\n${contextParts.join('\n')}`;
}

/**
 * Sleep for a given number of milliseconds.
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// SessionManager
// ---------------------------------------------------------------------------

/**
 * Create a SessionManager instance.
 *
 * @param {object} opts
 * @param {object} opts.registry - Registry object from loadRegistry()
 * @param {string} opts.projectRoot - Project root directory
 * @param {object} [opts.logger] - Pino-compatible logger
 * @param {Function} [opts.queryFn] - Override for SDK query() (for testing)
 * @returns {{ run: Function }}
 */
export function createSessionManager(opts) {
  const { registry, projectRoot, logger, queryFn } = opts;
  if (!registry) throw new ConfigError('registry is required');
  if (!projectRoot) throw new ConfigError('projectRoot is required');

  // Resolve the query function: explicit override > SDK import > error
  // When queryFn key is explicitly present (even if null), respect it.
  // Only fall back to SDK import when queryFn is not in the options at all.
  const resolvedQuery = ('queryFn' in opts) ? queryFn : sdkQuery;

  // Null logger that swallows all calls
  const log = logger || {
    info() {},
    warn() {},
    error() {},
    debug() {},
  };

  /**
   * Run an agent session.
   *
   * @param {object} params
   * @param {string} params.agentId - Agent ID from registry
   * @param {string} params.prompt - User prompt
   * @param {object} [params.workflowContext] - Workflow context (Layer 3)
   * @param {Function} [params.onMessage] - Streaming callback for each message
   * @param {object} [params.hooks] - Governance hooks to pass to query()
   * @param {number} [params.maxRetries] - Override max retries (default 2)
   * @returns {Promise<SessionResult>}
   */
  async function run({ agentId, prompt, workflowContext, onMessage, hooks, maxRetries }) {
    const startTime = Date.now();
    const retryLimit = maxRetries ?? DEFAULT_MAX_RETRIES;

    // --- AC1: Look up agent in registry; throw ConfigError if not found ---
    let agentConfig;
    try {
      agentConfig = registry.getAgent(agentId);
    } catch (err) {
      throw new ConfigError(
        `Agent "${agentId}" not found in registry`,
        { agentId, cause: err }
      );
    }

    // --- AC2: Load system prompt (Layer 1) ---
    const systemPrompt = loadSystemPrompt(agentConfig, projectRoot);
    log.debug(
      { event: 'system_prompt_loaded', agentId, length: systemPrompt.length },
      `System prompt loaded for ${agentId}: ${systemPrompt.length} chars`
    );

    // --- AC2 Layer 3: Append workflow context to user prompt ---
    const fullPrompt = buildPromptWithContext(prompt, workflowContext);

    // --- Verify query function is available ---
    if (!resolvedQuery) {
      throw new ConfigError(
        'SDK query() function is not available. Install @anthropic-ai/claude-agent-sdk or provide queryFn option.',
        { agentId }
      );
    }

    // --- AC12: Log session start ---
    log.info(
      {
        event: 'session_start',
        agentId,
        model: agentConfig.model,
        maxBudgetUsd: agentConfig.maxBudgetUsd,
      },
      `Session starting for agent ${agentId}`
    );

    // --- AC9: Retry wrapper ---
    let lastError = null;
    for (let attempt = 0; attempt <= retryLimit; attempt++) {
      if (attempt > 0) {
        const backoffMs = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        log.info(
          { event: 'session_retry', agentId, attempt, backoffMs },
          `Retrying agent ${agentId} (attempt ${attempt}/${retryLimit}, backoff ${backoffMs}ms)`
        );
        await sleep(backoffMs);
      }

      try {
        const messages = [];

        // --- Build query options ---
        const queryOptions = {
          prompt: fullPrompt,
          systemPrompt,
          model: agentConfig.model,
          permissionMode: agentConfig.permissionMode, // AC5
          cwd: projectRoot,
          // AC2 Layer 2: SDK auto-loads CLAUDE.md and rules
          settingSources: ['user', 'project'],
        };

        // AC3: Tool restrictions
        if (agentConfig.allowedTools && agentConfig.allowedTools.length > 0) {
          queryOptions.allowedTools = agentConfig.allowedTools;
        }
        if (agentConfig.disallowedTools && agentConfig.disallowedTools.length > 0) {
          queryOptions.disallowedTools = agentConfig.disallowedTools;
        }

        // AC4: Budget enforcement
        if (agentConfig.maxBudgetUsd > 0) {
          queryOptions.maxCostUsd = agentConfig.maxBudgetUsd;
        }

        // AC6: Governance hooks (optional)
        if (hooks) {
          queryOptions.hooks = hooks;
        }

        // --- Strip CLAUDECODE env var to prevent nested-session guard ---
        // The SDK's cli.js checks CLAUDECODE=1 and exits with code 1 if set.
        // Since the orchestrator runs inside Claude Code, we must strip it.
        const cleanEnv = { ...process.env };
        delete cleanEnv.CLAUDECODE;
        queryOptions.env = cleanEnv;

        // --- Execute query and stream messages ---
        const result = resolvedQuery(queryOptions);

        for await (const msg of result) {
          messages.push(msg);
          if (onMessage) {
            try {
              onMessage(msg);
            } catch {
              // Callback errors should not break the session
            }
          }
        }

        // --- AC7, AC8: Build result ---
        const durationMs = Date.now() - startTime;
        const costUsd = extractCost(messages, log);
        const toolCalls = extractToolCalls(messages);
        const summary = extractSummary(messages);

        // --- AC12: Log session end ---
        log.info(
          {
            event: 'session_end',
            agentId,
            costUsd,
            durationMs,
            toolCallCount: toolCalls.length,
          },
          `Session completed for agent ${agentId} in ${durationMs}ms ($${costUsd.toFixed(4)})`
        );

        return {
          agentId,
          messages,
          costUsd,
          summary,
          toolCalls,
          durationMs,
        };
      } catch (err) {
        lastError = err;

        // --- AC4: Budget error — no retry ---
        if (isBudgetError(err)) {
          throw new BudgetError(
            `Budget exceeded for agent "${agentId}": ${err.message}`,
            { agentId, costUsd: err.costUsd || 0, cause: err }
          );
        }

        // --- AC10: Config/auth error — no retry ---
        if (isConfigError(err)) {
          throw new ConfigError(
            `Configuration error for agent "${agentId}": ${err.message}`,
            { agentId, cause: err }
          );
        }

        // --- AC9: Transient error — retry if attempts remain ---
        if (isTransientError(err)) {
          if (attempt < retryLimit) {
            log.warn(
              { event: 'session_transient_error', agentId, attempt, error: err.message },
              `Transient error for ${agentId}, will retry`
            );
            continue;
          }

          // All retries exhausted
          throw new TransientError(
            `All ${retryLimit} retries exhausted for agent "${agentId}": ${err.message}`,
            { agentId, attempts: retryLimit + 1, cause: err }
          );
        }

        // --- AC10: Unknown error — wrap in OrchestratorError, no retry ---
        throw new OrchestratorError(
          `Unexpected error for agent "${agentId}": ${err.message}`,
          { agentId, cause: err }
        );
      }
    }

    // Should not reach here, but safety net
    throw new TransientError(
      `All retries exhausted for agent "${agentId}"`,
      { agentId, attempts: retryLimit + 1, cause: lastError }
    );
  }

  return { run };
}
