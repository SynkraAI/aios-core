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
export declare class AIServiceError extends Error {
    readonly code: string;
    readonly provider: AIProviderName;
    readonly statusCode: number;
    readonly retryable: boolean;
    constructor(message: string, provider: AIProviderName, statusCode: number, retryable: boolean);
}
/**
 * Determine if an error status code is retryable.
 * Retryable: 429 (rate limit), 5xx (server errors).
 * Non-retryable: other 4xx (client errors).
 */
export declare function isRetryableStatus(statusCode: number): boolean;
/**
 * Extract a status code from an unknown error object.
 * Checks common SDK error shapes.
 */
export declare function extractStatusCode(error: unknown): number;
//# sourceMappingURL=errors.d.ts.map