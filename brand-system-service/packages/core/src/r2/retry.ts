/**
 * Retry logic for transient R2/S3 errors.
 * Implements exponential backoff with jitter.
 *
 * @module r2/retry
 */

import type { Logger } from '../logger';

import type { RetryConfig } from './types';
import { DEFAULT_RETRY_CONFIG } from './types';

/** Errors that are considered transient and safe to retry. */
const RETRYABLE_ERROR_CODES = new Set([
  'NetworkingError',
  'TimeoutError',
  'RequestTimeout',
  'ThrottlingException',
  'TooManyRequestsException',
  'ServiceUnavailable',
  'InternalError',
  'SlowDown',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EPIPE',
]);

/**
 * Determine whether an error is retryable.
 *
 * @param error - The error to check
 * @returns True if the error is transient and safe to retry
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const name = error.name;
    const code = (error as Error & { code?: string }).code;
    const statusCode = (error as Error & { $metadata?: { httpStatusCode?: number } }).$metadata
      ?.httpStatusCode;

    // Check by error code
    if (code && RETRYABLE_ERROR_CODES.has(code)) {
      return true;
    }

    // Check by error name
    if (RETRYABLE_ERROR_CODES.has(name)) {
      return true;
    }

    // Check by HTTP status code (5xx are retryable, 429 too many requests)
    if (statusCode && (statusCode >= 500 || statusCode === 429)) {
      return true;
    }
  }

  return false;
}

/**
 * Execute a function with retry logic.
 * Uses exponential backoff with jitter.
 *
 * @param fn - Async function to execute
 * @param logger - Logger instance for retry tracking
 * @param config - Retry configuration
 * @returns The result of fn
 * @throws The last error if all retries are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  logger?: Logger,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === config.maxRetries || !isRetryableError(error)) {
        throw lastError;
      }

      const delayMs = calculateBackoff(attempt, config.baseDelayMs, config.maxDelayMs);

      logger?.warn(
        `Retryable error on attempt ${attempt + 1}/${config.maxRetries + 1}, retrying in ${delayMs}ms`,
        {
          error: lastError.message,
          attempt: attempt + 1,
          delayMs,
        },
      );

      await sleep(delayMs);
    }
  }

  // Unreachable but satisfies TypeScript
  throw lastError;
}

/**
 * Calculate exponential backoff with jitter.
 */
function calculateBackoff(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * baseDelayMs;
  return Math.min(exponentialDelay + jitter, maxDelayMs);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
