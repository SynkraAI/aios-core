/**
 * Cost rate loader — loads model pricing from .ai/cost-rates.json
 * and exposes a calculateCost() function.
 *
 * @module cost/rate-loader
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CostRatesConfig, TextModelRate, ImageModelRate } from './types';
import { UnknownModelError } from './errors';

/** Type guard for text model rates. */
function isTextModelRate(rate: unknown): rate is TextModelRate {
  return (
    typeof rate === 'object' &&
    rate !== null &&
    'inputPer1MTok' in rate &&
    'outputPer1MTok' in rate
  );
}

/** Type guard for image model rates. */
function isImageModelRate(rate: unknown): rate is ImageModelRate {
  return typeof rate === 'object' && rate !== null && 'perImage' in rate;
}

/**
 * Load cost rates from the specified file path.
 *
 * @param ratesFilePath - Absolute path to the cost-rates.json file
 * @returns Parsed CostRatesConfig
 */
export function loadRates(ratesFilePath: string): CostRatesConfig {
  const raw = fs.readFileSync(ratesFilePath, 'utf-8');
  return JSON.parse(raw) as CostRatesConfig;
}

/**
 * Calculate the cost of an AI API call based on loaded rates.
 *
 * @param rates - The loaded cost rates config
 * @param model - The model identifier (must match a key in rates.rates)
 * @param inputTokens - Number of input tokens (text models)
 * @param outputTokens - Number of output tokens (text models)
 * @param imageCount - Number of images generated (image models)
 * @returns Cost in USD
 * @throws UnknownModelError if model not found in rates
 */
export function calculateCost(
  rates: CostRatesConfig,
  model: string,
  inputTokens: number,
  outputTokens: number,
  imageCount: number,
): number {
  const rate = rates.rates[model];
  if (!rate) {
    throw new UnknownModelError(model);
  }

  if (isTextModelRate(rate)) {
    const inputCost = (inputTokens / 1_000_000) * rate.inputPer1MTok;
    const outputCost = (outputTokens / 1_000_000) * rate.outputPer1MTok;
    return inputCost + outputCost;
  }

  if (isImageModelRate(rate)) {
    return imageCount * rate.perImage;
  }

  throw new UnknownModelError(model);
}

/**
 * Resolve the default cost rates file path.
 * Looks for .ai/cost-rates.json relative to the provided base directory.
 */
export function resolveRatesPath(baseDir: string): string {
  return path.join(baseDir, '.ai', 'cost-rates.json');
}
