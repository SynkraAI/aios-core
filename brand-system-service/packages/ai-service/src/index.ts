/**
 * @brand-system/ai-service — AI Provider Abstraction Layer
 *
 * Unified interface for text and image generation with retry,
 * fallback, and structured logging.
 *
 * @module ai-service
 */

// Main orchestrator
export { AIService } from './ai-service';

// Types and interfaces
export type {
  AIProviderName,
  TextGenerationOptions,
  ImageGenerationOptions,
  AITextResponse,
  AIImageResponse,
  AIServiceProvider,
  RetryOptions,
  AICallLogEntry,
} from './types';

// Error types
export { AIServiceError } from './errors';
export { isRetryableStatus, extractStatusCode } from './errors';

// Retry utility
export { withRetry } from './retry';

// Call logger
export { createCallLogger } from './call-logger';
export type { CostLedgerHook } from './call-logger';

// Queue and rate limiting (BSS-3.2)
export { JobQueue, QueueFullError } from './queue';
export type { Job, JobStatus, JobType, JobPriority, JobSubmission, QueueMetrics, JobQueueOptions, BudgetGate } from './queue';
export { RateLimiter } from './rate-limiter';

// Provider constants
export const AI_PROVIDERS = {
  TEXT_PRIMARY: 'claude' as const,
  TEXT_FALLBACK: 'openai' as const,
  IMAGE_PRIMARY: 'replicate' as const,
  IMAGE_FALLBACK: 'dalle' as const,
};
