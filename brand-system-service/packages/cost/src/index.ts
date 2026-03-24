/**
 * @brand-system/cost — AI Cost Tracking & Budget Controls
 *
 * Per-client cost tracking with configurable budget caps,
 * 80% warning alerts, and 100% auto-throttle.
 *
 * @module cost
 */

// Core classes
export { CostLedger } from './ledger';
export { CostTracker } from './tracker';
export type { BudgetWarningHandler } from './tracker';

// Rate calculation
export { loadRates, calculateCost, resolveRatesPath } from './rate-loader';

// Budget configuration
export { readBudgetConfig } from './budget-config';

// Error types
export { UnknownModelError, BudgetExceededError } from './errors';

// Type definitions
export type {
  CostRecord,
  CostSummary,
  BudgetConfig,
  BudgetWarningEvent,
  BillingPeriod,
  CostProvider,
  ProviderBreakdown,
  TextModelRate,
  ImageModelRate,
  ModelRate,
  CostRatesConfig,
} from './types';
