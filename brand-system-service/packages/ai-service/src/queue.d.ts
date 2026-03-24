/**
 * In-process job queue with backpressure, priority ordering, and
 * per-provider rate limiting for AI API calls.
 *
 * MVP scope: in-memory queue, no external broker (Redis/BullMQ).
 * If the process restarts, pending jobs are lost — acceptable for MVP
 * because jobs are triggered by user actions and can be re-submitted.
 *
 * @see BSS-3.2: Job Queue & Rate Limit Management
 */
import type { AIServiceProvider, AIProviderName } from './types';
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'dead';
export type JobType = 'text-generation' | 'image-generation';
export type JobPriority = 'high' | 'normal' | 'low';
export interface JobSubmission<T = unknown> {
    type: JobType;
    priority: JobPriority;
    client_id: string;
    payload: T;
    provider?: AIProviderName;
}
export interface Job<T = unknown> {
    readonly id: string;
    readonly type: JobType;
    readonly priority: JobPriority;
    readonly client_id: string;
    readonly payload: T;
    readonly provider: AIProviderName;
    status: JobStatus;
    readonly createdAt: number;
    startedAt: number | null;
    completedAt: number | null;
    result: unknown;
    error: string | null;
    retryCount: number;
}
export interface QueueMetrics {
    pendingCount: number;
    inFlightCount: number;
    completedCount: number;
    deadCount: number;
    currentRPM: Record<string, number>;
}
/**
 * Error thrown when the queue is at capacity and cannot accept new jobs.
 */
export declare class QueueFullError extends Error {
    readonly code = "QUEUE_FULL";
    readonly queueSize: number;
    constructor(queueSize: number);
}
/**
 * Budget gate interface matching CostTracker.canSubmit() from @brand-system/cost.
 * Declared here to avoid hard compile-time dependency on the cost package.
 */
export interface BudgetGate {
    canSubmit(clientId: string): boolean;
}
export interface JobQueueOptions {
    aiService: AIServiceProvider;
    maxConcurrent?: number;
    maxSize?: number;
    claudeRpmLimit?: number;
    openaiRpmLimit?: number;
    replicateRpmLimit?: number;
    maxRetries?: number;
    /** Optional budget gate for per-client spend controls (BSS-3.6). */
    budgetGate?: BudgetGate;
}
/**
 * In-process job queue with priority ordering, concurrency control,
 * per-provider rate limiting, and backpressure.
 */
export declare class JobQueue {
    private readonly aiService;
    private readonly maxConcurrent;
    private readonly maxSize;
    private readonly maxRetries;
    private readonly budgetGate;
    private readonly pending;
    private readonly inFlight;
    private readonly completed;
    private readonly dead;
    private readonly rateLimiters;
    private readonly completionCallbacks;
    private running;
    private autoStart;
    private workerPromise;
    constructor(options: JobQueueOptions);
    /**
     * Submit a job to the queue.
     * Throws QueueFullError if the queue is at maxSize.
     */
    submit<T>(submission: JobSubmission<T>): Job<T>;
    /**
     * Register a callback to be invoked when a job completes (or dies).
     */
    onComplete(jobId: string, callback: (job: Job) => void): void;
    /**
     * Get the current status of a job by ID.
     */
    getStatus(jobId: string): JobStatus | undefined;
    /**
     * Return a snapshot of queue metrics.
     */
    getMetrics(): QueueMetrics;
    /**
     * Start the worker loop.
     */
    start(): void;
    /**
     * Stop the worker loop. In-flight jobs will complete but no new jobs
     * will be dequeued.
     */
    stop(): Promise<void>;
    private workerLoop;
    private processJob;
    private fireCallbacks;
    private sleep;
}
//# sourceMappingURL=queue.d.ts.map