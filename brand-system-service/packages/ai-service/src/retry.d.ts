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
/**
 * Execute a function with retry logic and exponential backoff.
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration
 * @returns The result of fn on success
 * @throws The last error after all retries are exhausted
 */
export declare function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
/**
 * Sleep for a given number of milliseconds.
 * Exposed for test overriding.
 */
export declare function sleep(ms: number): Promise<void>;
//# sourceMappingURL=retry.d.ts.map