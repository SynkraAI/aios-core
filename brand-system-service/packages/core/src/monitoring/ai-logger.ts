/**
 * AI API call logging with cost tracking.
 * Logs each AI API call to JSONL and provides cost aggregation.
 *
 * @module monitoring/ai-logger
 */

import { existsSync, mkdirSync, appendFileSync, readFileSync, renameSync, statSync } from 'node:fs';
import { dirname } from 'node:path';

import type { AiApiCallEntry, AiCostSummary, AiProvider } from './types';
import { AI_COST_PER_TOKEN, isTokenCost } from './types';
import { createLogger, type Logger } from '../logger';
import { captureError } from './sentry';

/** Default log file path. */
const DEFAULT_LOG_PATH = 'output/logs/ai-api-calls.jsonl';

/** Maximum log file size before rotation (10MB). */
const MAX_LOG_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Log an AI API call to the JSONL log file.
 * Rotates the log file if it exceeds 10MB.
 *
 * @param entry - AI API call entry
 * @param logPath - Path to log file (defaults to output/logs/ai-api-calls.jsonl)
 */
export async function logAiApiCall(
  entry: AiApiCallEntry,
  logPath: string = DEFAULT_LOG_PATH,
): Promise<void> {
  const dir = dirname(logPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  await rotateLogIfNeeded(logPath);

  const line = JSON.stringify(entry) + '\n';
  appendFileSync(logPath, line, 'utf-8');

  // If the call failed, capture error in Sentry
  if (!entry.success && entry.errorMessage) {
    captureError(new Error(`AI API error: ${entry.errorMessage}`), {
      clientId: entry.clientId,
      provider: entry.provider,
      model: entry.model,
    });
  }
}

/**
 * Rotate log file if it exceeds MAX_LOG_SIZE_BYTES.
 * Renames to ai-api-calls-{YYYY-MM}.jsonl.
 *
 * @param logPath - Path to the log file
 */
export async function rotateLogIfNeeded(logPath: string): Promise<void> {
  if (!existsSync(logPath)) return;

  try {
    const stats = statSync(logPath);
    if (stats.size >= MAX_LOG_SIZE_BYTES) {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const rotatedPath = logPath.replace('.jsonl', `-${month}.jsonl`);
      renameSync(logPath, rotatedPath);
    }
  } catch {
    // Rotation is best-effort
  }
}

/**
 * Summarize AI costs for a client in a given month.
 *
 * @param clientId - Client identifier
 * @param month - Month in YYYY-MM format
 * @param logPath - Path to the log file
 * @returns Cost summary
 */
export function summarizeAiCosts(
  clientId: string,
  month: string,
  logPath: string = DEFAULT_LOG_PATH,
): AiCostSummary {
  const summary: AiCostSummary = {
    clientId,
    month,
    totalCost: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    callCount: 0,
    byProvider: {},
  };

  if (!existsSync(logPath)) {
    return summary;
  }

  const content = readFileSync(logPath, 'utf-8').trim();
  if (!content) return summary;

  const lines = content.split('\n');
  let totalCost = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let callCount = 0;
  const byProvider: Record<string, { cost: number; calls: number }> = {};

  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as AiApiCallEntry;

      // Filter by clientId and month
      if (entry.clientId !== clientId) continue;
      if (!entry.timestamp.startsWith(month)) continue;

      callCount++;
      totalCost += entry.totalCost;
      totalInputTokens += entry.inputTokens;
      totalOutputTokens += entry.outputTokens;

      if (!byProvider[entry.provider]) {
        byProvider[entry.provider] = { cost: 0, calls: 0 };
      }
      byProvider[entry.provider].cost += entry.totalCost;
      byProvider[entry.provider].calls++;
    } catch {
      // Skip malformed lines
    }
  }

  return {
    clientId,
    month,
    totalCost,
    totalInputTokens,
    totalOutputTokens,
    callCount,
    byProvider,
  };
}

/**
 * Calculate the cost of an AI API call based on token usage.
 *
 * @param provider - AI provider
 * @param model - Model name
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @returns Total cost in USD
 */
export function calculateCost(
  provider: AiProvider,
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const key = `${provider}/${model}`;
  const cost = AI_COST_PER_TOKEN[key];

  if (!cost) return 0;

  if (isTokenCost(cost)) {
    return inputTokens * cost.input + outputTokens * cost.output;
  }

  // Image-based models: cost per invocation
  return cost.perImage;
}

/**
 * Create a pre-configured logger with AI metadata.
 *
 * @param clientId - Client identifier
 * @param provider - AI provider
 * @returns Logger with AI context pre-populated
 */
export function createAiLogger(clientId: string, provider: AiProvider): Logger {
  const baseLogger = createLogger(`ai:${provider}`);

  return {
    info: (message, data) => baseLogger.info(message, { clientId, provider, ...data }),
    warn: (message, data) => baseLogger.warn(message, { clientId, provider, ...data }),
    error: (message, data) => baseLogger.error(message, { clientId, provider, ...data }),
    debug: (message, data) => baseLogger.debug(message, { clientId, provider, ...data }),
  };
}
