/**
 * AI Service error types.
 * Wraps provider-specific errors in a consistent interface.
 *
 * @module ai-service/errors
 */

import type { AIProviderName } from './types';

/**
 * Error thrown by AI service operations.
 * Contains provider context and retryability flag.
 */
export class AIServiceError extends Error {
  public readonly code: string = 'AI_SERVICE_ERROR';
  public readonly provider: AIProviderName;
  public readonly statusCode: number;
  public readonly retryable: boolean;

  constructor(message: string, provider: AIProviderName, statusCode: number, retryable: boolean) {
    super(message);
    this.name = 'AIServiceError';
    this.provider = provider;
    this.statusCode = statusCode;
    this.retryable = retryable;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Determine if an error status code is retryable.
 * Retryable: 429 (rate limit), 5xx (server errors).
 * Non-retryable: other 4xx (client errors).
 */
export function isRetryableStatus(statusCode: number): boolean {
  if (statusCode === 429) return true;
  if (statusCode >= 500 && statusCode < 600) return true;
  return false;
}

/**
 * Extract a status code from an unknown error object.
 * Checks common SDK error shapes.
 */
export function extractStatusCode(error: unknown): number {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    if (typeof err['status'] === 'number') return err['status'];
    if (typeof err['statusCode'] === 'number') return err['statusCode'];
    if (err['response'] && typeof err['response'] === 'object') {
      const resp = err['response'] as Record<string, unknown>;
      if (typeof resp['status'] === 'number') return resp['status'];
    }
  }
  return 500;
}
