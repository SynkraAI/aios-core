/**
 * Retry logic with exponential backoff.
 *
 * Retryable conditions (AC 5):
 * - HTTP 429 (rate limit)
 * - HTTP 5xx (server errors)
 *
 * Non-retryable: other 4xx (client errors).
 * Max 3 retries with delays: 1000ms, 2000ms, 4000ms.
 *
 * @module ai-service/retry
 */

import type { RetryOptions } from './types';
import { AIServiceError } from './errors';

/** Default retry configuration. */
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 1000;

/**
 * Execute a function with retry logic and exponential backoff.
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration
 * @returns The result of fn on success
 * @throws The last error after all retries are exhausted
 */
export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelayMs = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If the error is not retryable, throw immediately
      if (error instanceof AIServiceError && !error.retryable) {
        throw error;
      }

      // If we have used all retries, throw
      if (attempt >= maxRetries) {
        throw error;
      }

      // Exponential backoff: baseDelay * 2^attempt
      const delayMs = baseDelayMs * Math.pow(2, attempt);
      await sleep(delayMs);
    }
  }

  // Should not reach here, but satisfy TypeScript
  throw lastError;
}

/**
 * Sleep for a given number of milliseconds.
 * Exposed for test overriding.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
