/**
 * @brand-system/cost — Type Definitions
 *
 * Core types for AI cost tracking and budget controls.
 *
 * @module cost/types
 */

/** Supported AI provider categories for cost attribution. */
export type CostProvider = 'claude' | 'openai-text' | 'flux' | 'openai-image';

/** Billing period represented as year + month (UTC). */
export interface BillingPeriod {
  readonly year: number;
  readonly month: number;
}

/**
 * A single cost record logged for an AI API call.
 * Stored in the ledger as an append-only entry.
 */
export interface CostRecord {
  readonly timestamp: string;
  readonly clientId: string;
  readonly provider: CostProvider;
  readonly model: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly imageCount: number;
  readonly costUsd: number;
  readonly latencyMs: number;
  readonly jobId: string;
  readonly deliverableType: string;
}

/** Breakdown of costs by provider. */
export type ProviderBreakdown = Partial<Record<CostProvider, number>>;

/** Aggregated cost summary for a client over a billing period. */
export interface CostSummary {
  readonly totalCostUsd: number;
  readonly callCount: number;
  readonly breakdown: {
    readonly byProvider: ProviderBreakdown;
  };
}

/** Per-client budget configuration. */
export interface BudgetConfig {
  readonly budgetUsd: number;
  readonly currency: string;
  readonly resetDay: number;
}

/** Event emitted when a client's spend crosses the 80% threshold. */
export interface BudgetWarningEvent {
  readonly clientId: string;
  readonly currentSpend: number;
  readonly budgetCap: number;
  readonly percentUsed: number;
  readonly period: BillingPeriod;
}

/**
 * Rate configuration for a text-based model.
 * Costs are per 1 million tokens.
 */
export interface TextModelRate {
  readonly inputPer1MTok: number;
  readonly outputPer1MTok: number;
}

/** Rate configuration for an image-based model. Cost per image. */
export interface ImageModelRate {
  readonly perImage: number;
}

/** Union type for any model rate entry. */
export type ModelRate = TextModelRate | ImageModelRate;

/** Full cost rates configuration file shape. */
export interface CostRatesConfig {
  readonly version: string;
  readonly lastUpdated: string;
  readonly rates: Record<string, ModelRate>;
}
