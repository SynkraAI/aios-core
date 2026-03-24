/**
 * Types for infrastructure monitoring.
 * Used by Sentry integration, AI API logging, and error rate monitoring.
 *
 * @module monitoring/types
 */

/** Supported AI API providers. */
export type AiProvider = 'claude' | 'openai' | 'replicate' | 'elevenlabs';

/**
 * Entry for a single AI API call log.
 * Written as one JSON line in ai-api-calls.jsonl.
 */
export interface AiApiCallEntry {
  readonly timestamp: string;
  readonly clientId: string;
  readonly provider: AiProvider;
  readonly model: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly totalCost: number;
  readonly latencyMs: number;
  readonly success: boolean;
  readonly errorMessage?: string;
}

/**
 * Aggregated cost summary for a client in a given month.
 */
export interface AiCostSummary {
  readonly clientId: string;
  readonly month: string;
  readonly totalCost: number;
  readonly totalInputTokens: number;
  readonly totalOutputTokens: number;
  readonly callCount: number;
  readonly byProvider: Record<string, { cost: number; calls: number }>;
}

/**
 * Error rate report for a time window.
 */
export interface ErrorRateReport {
  readonly errorCount: number;
  readonly windowHours: number;
  readonly rate: number;
  readonly topErrors: string[];
  readonly generatedAt: string;
}

/**
 * Health check result for a single service.
 */
export interface HealthCheckResult {
  readonly r2: 'ok' | 'error';
  readonly sentry: 'ok' | 'error';
  readonly timestamp: string;
}

/**
 * Cost per token for AI models.
 * Prices in USD. Token-based models use input/output.
 * Image-based models use perImage.
 */
export interface TokenCost {
  readonly input: number;
  readonly output: number;
}

export interface ImageCost {
  readonly perImage: number;
}

export type ModelCost = TokenCost | ImageCost;

/**
 * Cost constants for AI API providers.
 * Prices in USD per token (already divided by 1M).
 */
export const AI_COST_PER_TOKEN: Record<string, ModelCost> = {
  'claude/claude-sonnet-4-5': { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
  'openai/gpt-4o': { input: 2.5 / 1_000_000, output: 10.0 / 1_000_000 },
  'replicate/flux-1.1-pro': { perImage: 0.04 },
  'elevenlabs/eleven-multilingual-v2': { input: 0, output: 0 },
} as const;

/**
 * Type guard to check if a cost is token-based.
 */
export function isTokenCost(cost: ModelCost): cost is TokenCost {
  return 'input' in cost && 'output' in cost;
}
