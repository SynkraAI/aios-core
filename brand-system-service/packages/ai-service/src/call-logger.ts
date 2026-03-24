/**
 * Structured call logger for AI API calls (AC 8).
 *
 * Emits a structured log entry per API call containing all required fields.
 * Uses the existing @bss/core logger as transport.
 * Extends the monitoring/ai-logger pattern from BSS-1.7.
 *
 * @module ai-service/call-logger
 */

import type { AIProviderName, AICallLogEntry } from './types';

/**
 * Logger interface matching @bss/core Logger.
 * Declared here to avoid hard dependency on @bss/core at runtime.
 */
interface LoggerTransport {
  info(message: string, data?: Record<string, unknown>): void;
}

/**
 * CostLedger hook interface.
 * Matches the CostLedger.record() signature from @brand-system/cost.
 * Declared here to avoid hard dependency on the cost package at compile time.
 */
export interface CostLedgerHook {
  record(costRecord: {
    timestamp: string;
    clientId: string;
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    imageCount: number;
    costUsd: number;
    latencyMs: number;
    jobId: string;
    deliverableType: string;
  }): void;
}

/** Default console-based logger transport. */
const defaultTransport: LoggerTransport = {
  info(message: string, data?: Record<string, unknown>): void {
    const entry = {
      level: 'info',
      timestamp: new Date().toISOString(),
      module: 'ai-service',
      message,
      ...(data ? { data } : {}),
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  },
};

/**
 * Create a call logger that emits structured entries for AI API calls.
 *
 * @param transport - Logger transport (defaults to console JSON)
 * @returns Functions to log AI call results
 */
export function createCallLogger(
  transport?: LoggerTransport,
  costLedger?: CostLedgerHook,
) {
  const logger = transport ?? defaultTransport;

  return {
    /**
     * Log a successful or failed AI API call.
     * Ensures credentials are NEVER included in log data (AC 7).
     * Also records to CostLedger if provided (BSS-3.6).
     */
    logCall(entry: AICallLogEntry): void {
      logger.info('AI API call', {
        timestamp: entry.timestamp,
        clientId: entry.clientId,
        provider: entry.provider,
        model: entry.model,
        inputTokens: entry.inputTokens,
        outputTokens: entry.outputTokens,
        costUsd: entry.costUsd,
        latencyMs: entry.latencyMs,
        success: entry.success,
        ...(entry.errorMessage ? { errorMessage: entry.errorMessage } : {}),
      });

      // BSS-3.6: Record to cost ledger as side-effect hook
      if (costLedger && entry.success) {
        try {
          costLedger.record({
            timestamp: entry.timestamp,
            clientId: entry.clientId,
            provider: entry.provider,
            model: entry.model,
            inputTokens: entry.inputTokens,
            outputTokens: entry.outputTokens,
            imageCount: 0, // Call-logger entries are token-based; image count set by caller
            costUsd: entry.costUsd,
            latencyMs: entry.latencyMs,
            jobId: '', // Job ID not available at call-logger level
            deliverableType: '', // Not available at call-logger level
          });
        } catch {
          // Cost ledger recording is best-effort — never fail the API call
        }
      }
    },

    /**
     * Log a provider fallback event (AC 6).
     */
    logFallback(
      primaryProvider: AIProviderName,
      fallbackProvider: AIProviderName,
      reason: string,
    ): void {
      logger.info('AI provider fallback', {
        primaryProvider,
        fallbackProvider,
        reason,
      });
    },
  };
}
