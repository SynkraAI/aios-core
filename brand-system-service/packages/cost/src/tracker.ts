/**
 * CostTracker — Per-client cost aggregation, budget checking, and warning emission.
 *
 * Provides:
 * - getClientCost(clientId, period) — aggregated spend summary
 * - getBudget(clientId) — resolved budget cap
 * - canSubmit(clientId) — budget gate for job queue integration
 *
 * Emits BudgetWarningEvent ONCE per period when 80% threshold is crossed.
 *
 * @module cost/tracker
 */

import { CostLedger } from './ledger';
import { readBudgetConfig } from './budget-config';
import { BudgetExceededError } from './errors';
import type {
  BillingPeriod,
  BudgetConfig,
  BudgetWarningEvent,
  CostProvider,
  CostRecord,
  CostSummary,
} from './types';

/** Callback type for budget warning notifications. */
export type BudgetWarningHandler = (event: BudgetWarningEvent) => void;

/** Get the current billing period (UTC). */
function getCurrentPeriod(): BillingPeriod {
  const now = new Date();
  return {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
  };
}

export class CostTracker {
  private readonly ledger: CostLedger;
  private readonly baseDir: string;
  private readonly warningHandlers: BudgetWarningHandler[] = [];

  /**
   * Track which clients have already received the 80% warning
   * for the current period. Key format: "{clientId}:{year}-{month}"
   */
  private readonly warningsEmitted: Set<string> = new Set();

  constructor(ledger: CostLedger, baseDir: string) {
    this.ledger = ledger;
    this.baseDir = baseDir;
  }

  /**
   * Register a callback for budget warning events.
   */
  onBudgetWarning(handler: BudgetWarningHandler): void {
    this.warningHandlers.push(handler);
  }

  /**
   * Get aggregated cost summary for a client in a billing period.
   * Defaults to the current UTC calendar month.
   *
   * This implements monthly reset (AC 6): only records from the
   * specified period are included.
   */
  getClientCost(clientId: string, period?: BillingPeriod): CostSummary {
    const p = period ?? getCurrentPeriod();
    const records = this.ledger.readPeriod(clientId, p.year, p.month);

    let totalCostUsd = 0;
    const byProvider: Partial<Record<CostProvider, number>> = {};

    for (const record of records) {
      totalCostUsd += record.costUsd;
      const current = byProvider[record.provider] ?? 0;
      byProvider[record.provider] = current + record.costUsd;
    }

    return {
      totalCostUsd,
      callCount: records.length,
      breakdown: { byProvider },
    };
  }

  /**
   * Get the resolved budget configuration for a client.
   */
  getBudget(clientId: string): BudgetConfig {
    return readBudgetConfig(this.baseDir, clientId);
  }

  /**
   * Check whether a client can submit a new AI job.
   *
   * Returns true if the client's current-period spend is below
   * their budget cap. Also triggers 80% warning if threshold crossed.
   *
   * @throws BudgetExceededError when spend >= budget cap
   */
  canSubmit(clientId: string): boolean {
    const period = getCurrentPeriod();
    const summary = this.getClientCost(clientId, period);
    const budget = this.getBudget(clientId);

    const percentUsed = (summary.totalCostUsd / budget.budgetUsd) * 100;

    // Check 80% warning threshold
    if (percentUsed >= 80 && percentUsed < 100) {
      this.emitWarningOnce(clientId, summary.totalCostUsd, budget.budgetUsd, percentUsed, period);
    }

    // Check 100% budget cap
    if (summary.totalCostUsd >= budget.budgetUsd) {
      // Emit warning if not yet emitted (edge case: jumped from <80% to >=100%)
      this.emitWarningOnce(clientId, summary.totalCostUsd, budget.budgetUsd, percentUsed, period);
      throw new BudgetExceededError(clientId, summary.totalCostUsd, budget.budgetUsd);
    }

    return true;
  }

  /**
   * Emit the budget warning event once per client per period.
   */
  private emitWarningOnce(
    clientId: string,
    currentSpend: number,
    budgetCap: number,
    percentUsed: number,
    period: BillingPeriod,
  ): void {
    const key = `${clientId}:${period.year}-${period.month}`;
    if (this.warningsEmitted.has(key)) {
      return;
    }
    this.warningsEmitted.add(key);

    const event: BudgetWarningEvent = {
      clientId,
      currentSpend,
      budgetCap,
      percentUsed,
      period,
    };

    for (const handler of this.warningHandlers) {
      try {
        handler(event);
      } catch {
        // Swallow handler errors — warning delivery is best-effort
      }
    }
  }
}
