/**
 * @brand-system/ai-service — AI Provider Abstraction Layer
 *
 * Unified interface for text and image generation with retry,
 * fallback, and structured logging.
 *
 * @module ai-service
 */
export { AIService } from './ai-service';
export type { AIProviderName, TextGenerationOptions, ImageGenerationOptions, AITextResponse, AIImageResponse, AIServiceProvider, RetryOptions, AICallLogEntry, } from './types';
export { AIServiceError } from './errors';
export { isRetryableStatus, extractStatusCode } from './errors';
export { withRetry } from './retry';
export { createCallLogger } from './call-logger';
export type { CostLedgerHook } from './call-logger';
export { JobQueue, QueueFullError } from './queue';
export type { Job, JobStatus, JobType, JobPriority, JobSubmission, QueueMetrics, JobQueueOptions, BudgetGate } from './queue';
export { RateLimiter } from './rate-limiter';
export declare const AI_PROVIDERS: {
    TEXT_PRIMARY: "claude";
    TEXT_FALLBACK: "openai";
    IMAGE_PRIMARY: "replicate";
    IMAGE_FALLBACK: "dalle";
};
//# sourceMappingURL=index.d.ts.map