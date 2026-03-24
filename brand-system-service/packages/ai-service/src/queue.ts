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
import { RateLimiter } from './rate-limiter';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'dead';

export type JobType = 'text-generation' | 'image-generation';

export type JobPriority = 'high' | 'normal' | 'low';

const PRIORITY_ORDER: Record<JobPriority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

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
export class QueueFullError extends Error {
  public readonly code = 'QUEUE_FULL';
  public readonly queueSize: number;

  constructor(queueSize: number) {
    super(`Queue is full (${queueSize} jobs). Cannot accept new submissions.`);
    this.name = 'QueueFullError';
    this.queueSize = queueSize;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Queue Options
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// JobQueue
// ---------------------------------------------------------------------------

let jobCounter = 0;

/**
 * In-process job queue with priority ordering, concurrency control,
 * per-provider rate limiting, and backpressure.
 */
export class JobQueue {
  private readonly aiService: AIServiceProvider;
  private readonly maxConcurrent: number;
  private readonly maxSize: number;
  private readonly maxRetries: number;
  private readonly budgetGate: BudgetGate | undefined;

  private readonly pending: Job[] = [];
  private readonly inFlight: Map<string, Job> = new Map();
  private readonly completed: Job[] = [];
  private readonly dead: Job[] = [];

  private readonly rateLimiters: Record<string, RateLimiter>;
  private readonly completionCallbacks: Map<string, Array<(job: Job) => void>> = new Map();

  private running = false;
  private autoStart = true;
  private workerPromise: Promise<void> | null = null;

  constructor(options: JobQueueOptions) {
    this.aiService = options.aiService;
    this.budgetGate = options.budgetGate;
    this.maxConcurrent = options.maxConcurrent
      ?? parseInt(process.env['QUEUE_MAX_CONCURRENT'] ?? '5', 10);
    this.maxSize = options.maxSize
      ?? parseInt(process.env['QUEUE_MAX_SIZE'] ?? '100', 10);
    this.maxRetries = options.maxRetries ?? 2;

    const claudeRpm = options.claudeRpmLimit
      ?? parseInt(process.env['CLAUDE_RPM_LIMIT'] ?? '40', 10);
    const openaiRpm = options.openaiRpmLimit
      ?? parseInt(process.env['OPENAI_RPM_LIMIT'] ?? '60', 10);
    const replicateRpm = options.replicateRpmLimit
      ?? parseInt(process.env['REPLICATE_RPM_LIMIT'] ?? '20', 10);

    this.rateLimiters = {
      claude: new RateLimiter(claudeRpm),
      openai: new RateLimiter(openaiRpm),
      replicate: new RateLimiter(replicateRpm),
      dalle: new RateLimiter(openaiRpm), // DALL-E shares OpenAI limits
    };
  }

  /**
   * Submit a job to the queue.
   * Throws QueueFullError if the queue is at maxSize.
   */
  submit<T>(submission: JobSubmission<T>): Job<T> {
    const totalPending = this.pending.length + this.inFlight.size;
    if (totalPending >= this.maxSize) {
      throw new QueueFullError(totalPending);
    }

    const defaultProvider: AIProviderName =
      submission.type === 'text-generation' ? 'claude' : 'replicate';

    const job: Job<T> = {
      id: `job_${++jobCounter}_${Date.now()}`,
      type: submission.type,
      priority: submission.priority,
      client_id: submission.client_id,
      payload: submission.payload,
      provider: submission.provider ?? defaultProvider,
      status: 'pending',
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null,
      retryCount: 0,
    };

    // Insert sorted by priority
    const insertIdx = this.pending.findIndex(
      (p) => PRIORITY_ORDER[p.priority] > PRIORITY_ORDER[job.priority],
    );
    if (insertIdx === -1) {
      this.pending.push(job);
    } else {
      this.pending.splice(insertIdx, 0, job);
    }

    // Auto-start worker if not already running and autoStart is enabled
    if (!this.running && this.autoStart) {
      this.start();
    }

    return job;
  }

  /**
   * Register a callback to be invoked when a job completes (or dies).
   */
  onComplete(jobId: string, callback: (job: Job) => void): void {
    const existing = this.completionCallbacks.get(jobId) ?? [];
    existing.push(callback);
    this.completionCallbacks.set(jobId, existing);
  }

  /**
   * Get the current status of a job by ID.
   */
  getStatus(jobId: string): JobStatus | undefined {
    const inPending = this.pending.find((j) => j.id === jobId);
    if (inPending) return inPending.status;

    const inFlightJob = this.inFlight.get(jobId);
    if (inFlightJob) return inFlightJob.status;

    const inCompleted = this.completed.find((j) => j.id === jobId);
    if (inCompleted) return inCompleted.status;

    const inDead = this.dead.find((j) => j.id === jobId);
    if (inDead) return inDead.status;

    return undefined;
  }

  /**
   * Return a snapshot of queue metrics.
   */
  getMetrics(): QueueMetrics {
    const currentRPM: Record<string, number> = {};
    for (const [provider, limiter] of Object.entries(this.rateLimiters)) {
      currentRPM[provider] = limiter.getCurrentRPM();
    }

    return {
      pendingCount: this.pending.length,
      inFlightCount: this.inFlight.size,
      completedCount: this.completed.length,
      deadCount: this.dead.length,
      currentRPM,
    };
  }

  /**
   * Start the worker loop.
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.autoStart = true;
    this.workerPromise = this.workerLoop();
  }

  /**
   * Stop the worker loop. In-flight jobs will complete but no new jobs
   * will be dequeued.
   */
  async stop(): Promise<void> {
    this.running = false;
    this.autoStart = false;
    if (this.workerPromise) {
      await this.workerPromise;
    }
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------

  private async workerLoop(): Promise<void> {
    while (this.running || this.inFlight.size > 0) {
      if (!this.running && this.pending.length === 0) break;

      // Check if we can pick up more work
      if (
        this.inFlight.size < this.maxConcurrent &&
        this.pending.length > 0 &&
        this.running
      ) {
        const job = this.pending.shift()!;
        this.processJob(job); // fire-and-forget (tracked via inFlight)
      }

      // Small yield to prevent tight loop
      await this.sleep(10);
    }
  }

  private async processJob(job: Job): Promise<void> {
    job.status = 'in_progress';
    job.startedAt = Date.now();
    this.inFlight.set(job.id, job);

    try {
      // BSS-3.6: Check budget gate before making any API call
      if (this.budgetGate) {
        this.budgetGate.canSubmit(job.client_id); // throws BudgetExceededError if over budget
      }

      // Acquire rate limit slot for the provider
      const limiter = this.rateLimiters[job.provider];
      if (limiter) {
        await limiter.acquire();
      }

      // Execute via AIService
      let result: unknown;
      if (job.type === 'text-generation') {
        result = await this.aiService.generateText({
          prompt: (job.payload as Record<string, string>)['prompt'] ?? '',
          systemPrompt: (job.payload as Record<string, string>)['systemPrompt'],
          provider: job.provider,
          clientId: job.client_id,
        });
      } else {
        result = await this.aiService.generateImage({
          prompt: (job.payload as Record<string, string>)['prompt'] ?? '',
          provider: job.provider,
          clientId: job.client_id,
        });
      }

      job.status = 'completed';
      job.completedAt = Date.now();
      job.result = result;

      this.inFlight.delete(job.id);
      this.completed.push(job);
      this.fireCallbacks(job);
    } catch (error: unknown) {
      job.retryCount++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      if (job.retryCount >= this.maxRetries) {
        // Mark as dead after max retries
        job.status = 'dead';
        job.completedAt = Date.now();
        job.error = `Dead after ${this.maxRetries} retries: ${errorMsg}`;

        this.inFlight.delete(job.id);
        this.dead.push(job);
        this.fireCallbacks(job);
      } else {
        // Re-queue for retry
        job.status = 'pending';
        job.startedAt = null;
        job.error = `Retry ${job.retryCount}/${this.maxRetries}: ${errorMsg}`;

        this.inFlight.delete(job.id);
        // Insert at front of same-priority group for retry
        this.pending.unshift(job);
      }
    }
  }

  private fireCallbacks(job: Job): void {
    const callbacks = this.completionCallbacks.get(job.id);
    if (callbacks) {
      for (const cb of callbacks) {
        try {
          cb(job);
        } catch {
          // Swallow callback errors
        }
      }
      this.completionCallbacks.delete(job.id);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
