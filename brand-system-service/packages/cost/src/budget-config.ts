/**
 * Budget configuration loader.
 *
 * Reads per-client budget from .ai/budgets/{client_id}.json,
 * falling back to DEFAULT_CLIENT_BUDGET_USD env var (default: 200).
 *
 * @module cost/budget-config
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { BudgetConfig } from './types';

/** Default monthly budget in USD when no override exists. */
const FALLBACK_BUDGET_USD = 200;

/**
 * Read the budget configuration for a specific client.
 *
 * Resolution order:
 * 1. .ai/budgets/{client_id}.json (per-client override)
 * 2. DEFAULT_CLIENT_BUDGET_USD environment variable
 * 3. Hardcoded $200/month fallback
 */
export function readBudgetConfig(baseDir: string, clientId: string): BudgetConfig {
  const filePath = path.join(baseDir, '.ai', 'budgets', `${clientId}.json`);

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<BudgetConfig>;
      return {
        budgetUsd: parsed.budgetUsd ?? getDefaultBudget(),
        currency: parsed.currency ?? 'USD',
        resetDay: parsed.resetDay ?? 1,
      };
    } catch {
      // Corrupted config — fall back to defaults
    }
  }

  return {
    budgetUsd: getDefaultBudget(),
    currency: 'USD',
    resetDay: 1,
  };
}

/** Get the default budget from env or hardcoded fallback. */
function getDefaultBudget(): number {
  const envVal = process.env['DEFAULT_CLIENT_BUDGET_USD'];
  if (envVal) {
    const parsed = parseFloat(envVal);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return FALLBACK_BUDGET_USD;
}
