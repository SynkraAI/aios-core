/**
 * Job Queue & Rate Limit Management Tests
 *
 * @see BSS-3.2: Job Queue & Rate Limit Management
 */

import { JobQueue, QueueFullError } from '../queue';
import { RateLimiter } from '../rate-limiter';
import type { AIServiceProvider, AITextResponse, AIImageResponse } from '../types';

// ---------------------------------------------------------------------------
// Mock AIService
// ---------------------------------------------------------------------------

function createMockAIService(options?: {
  textDelay?: number;
  imageDelay?: number;
  failCount?: number;
}): AIServiceProvider & { callCount: number; concurrentCalls: number; maxConcurrent: number } {
  let failsRemaining = options?.failCount ?? 0;
  const service = {
    callCount: 0,
    concurrentCalls: 0,
    maxConcurrent: 0,

    async generateText(): Promise<AITextResponse> {
      service.callCount++;
      service.concurrentCalls++;
      service.maxConcurrent = Math.max(service.maxConcurrent, service.concurrentCalls);

      if (failsRemaining > 0) {
        failsRemaining--;
        service.concurrentCalls--;
        throw new Error('Simulated failure');
      }

      if (options?.textDelay) {
        await new Promise((r) => setTimeout(r, options.textDelay));
      }
      service.concurrentCalls--;

      return {
        text: 'generated text',
        provider: 'claude',
        model: 'claude-3-sonnet',
        inputTokens: 100,
        outputTokens: 50,
        costUsd: 0.001,
        latencyMs: 200,
      };
    },

    async generateImage(): Promise<AIImageResponse> {
      service.callCount++;
      service.concurrentCalls++;
      service.maxConcurrent = Math.max(service.maxConcurrent, service.concurrentCalls);

      if (options?.imageDelay) {
        await new Promise((r) => setTimeout(r, options.imageDelay));
      }
      service.concurrentCalls--;

      return {
        imageUrl: 'https://example.com/image.png',
        provider: 'replicate',
        model: 'flux-1.1-pro',
        costUsd: 0.01,
        latencyMs: 5000,
      };
    },
  };

  return service;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function waitForCondition(
  condition: () => boolean,
  timeoutMs: number = 5000,
  intervalMs: number = 10,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (condition()) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Condition not met within ${timeoutMs}ms`));
        return;
      }
      setTimeout(check, intervalMs);
    };
    check();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests under the limit', async () => {
    const limiter = new RateLimiter(5, 60_000);

    // Should resolve immediately for first 5 calls
    for (let i = 0; i < 5; i++) {
      await limiter.acquire();
    }

    expect(limiter.getCurrentRPM()).toBe(5);
  });

  it('should block when at limit and resume when window slides', async () => {
    const limiter = new RateLimiter(3, 60_000);

    // Fill the limit
    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();

    expect(limiter.getCurrentRPM()).toBe(3);

    // Next acquire should wait
    let acquired = false;
    const acquirePromise = limiter.acquire().then(() => {
      acquired = true;
    });

    // Not yet acquired
    expect(acquired).toBe(false);

    // Advance time past the window
    jest.advanceTimersByTime(60_001);

    await acquirePromise;
    expect(acquired).toBe(true);
  });
});

describe('JobQueue', () => {
  afterEach(async () => {
    jest.useRealTimers();
  });

  describe('Job Submission (Task 1)', () => {
    it('should accept and track job submissions', async () => {
      const service = createMockAIService({ textDelay: 50 });
      const queue = new JobQueue({
        aiService: service,
        maxConcurrent: 5,
        maxSize: 100,
        claudeRpmLimit: 100,
      });

      const job = queue.submit({
        type: 'text-generation',
        priority: 'normal',
        client_id: 'test-client',
        payload: { prompt: 'Hello' },
      });

      expect(job.id).toBeDefined();
      // Job may already be in_progress since worker starts immediately
      expect(['pending', 'in_progress', 'completed']).toContain(job.status);
      expect(job.type).toBe('text-generation');
      expect(job.priority).toBe('normal');
      expect(job.client_id).toBe('test-client');
      expect(job.createdAt).toBeGreaterThan(0);

      await waitForCondition(() => job.status === 'completed', 5000);
      await queue.stop();
    });

    it('should return job status via getStatus()', async () => {
      const service = createMockAIService({ textDelay: 50 });
      const queue = new JobQueue({
        aiService: service,
        maxConcurrent: 5,
        maxSize: 100,
        claudeRpmLimit: 100,
      });

      const job = queue.submit({
        type: 'text-generation',
        priority: 'normal',
        client_id: 'client-1',
        payload: { prompt: 'test' },
      });

      expect(queue.getStatus(job.id)).toBeDefined();
      expect(queue.getStatus('nonexistent')).toBeUndefined();

      await queue.stop();
    });
  });

  describe('Priority Ordering', () => {
    it('should process high priority jobs before normal and low', async () => {
      const completionOrder: string[] = [];
      const service = createMockAIService({ textDelay: 10 });

      // Create queue, immediately stop to prevent auto-start
      const queue = new JobQueue({
        aiService: service,
        maxConcurrent: 1, // Process one at a time to verify order
        maxSize: 100,
        claudeRpmLimit: 100,
      });
      await queue.stop();

      // Submit in reverse priority order (low first)
      const low = queue.submit({
        type: 'text-generation',
        priority: 'low',
        client_id: 'c1',
        payload: { prompt: 'low' },
      });
      const normal = queue.submit({
        type: 'text-generation',
        priority: 'normal',
        client_id: 'c1',
        payload: { prompt: 'normal' },
      });
      const high = queue.submit({
        type: 'text-generation',
        priority: 'high',
        client_id: 'c1',
        payload: { prompt: 'high' },
      });

      queue.onComplete(high.id, () => completionOrder.push('high'));
      queue.onComplete(normal.id, () => completionOrder.push('normal'));
      queue.onComplete(low.id, () => completionOrder.push('low'));

      // Now start processing — priority sort should ensure high→normal→low
      queue.start();

      await waitForCondition(() => completionOrder.length === 3, 10000);
      await queue.stop();

      expect(completionOrder[0]).toBe('high');
      expect(completionOrder[1]).toBe('normal');
      expect(completionOrder[2]).toBe('low');
    });
  });

  describe('Concurrency Limit (Task 3, AC 2)', () => {
    it('should enforce max concurrent workers', async () => {
      const service = createMockAIService({ textDelay: 100 });
      const queue = new JobQueue({
        aiService: service,
        maxConcurrent: 5,
        maxSize: 100,
        claudeRpmLimit: 100,
      });

      // Submit 10 jobs
      for (let i = 0; i < 10; i++) {
        queue.submit({
          type: 'text-generation',
          priority: 'normal',
          client_id: `client-${i}`,
          payload: { prompt: `prompt ${i}` },
        });
      }

      // Wait for some to start processing
      await waitForCondition(() => service.concurrentCalls > 0, 2000);

      // Max concurrent should never exceed 5
      expect(service.maxConcurrent).toBeLessThanOrEqual(5);

      // Wait for all to complete
      await waitForCondition(() => service.callCount >= 10, 10000);
      await queue.stop();

      expect(service.maxConcurrent).toBeLessThanOrEqual(5);
    }, 15000);
  });

  describe('Backpressure / QueueFullError (Task 3, AC 4)', () => {
    it('should throw QueueFullError when queue is at maxSize', async () => {
      const service = createMockAIService({ textDelay: 1000 });
      const queue = new JobQueue({
        aiService: service,
        maxConcurrent: 1,
        maxSize: 3,
        claudeRpmLimit: 100,
      });

      // Fill the queue
      queue.submit({ type: 'text-generation', priority: 'normal', client_id: 'c1', payload: { prompt: '1' } });
      queue.submit({ type: 'text-generation', priority: 'normal', client_id: 'c1', payload: { prompt: '2' } });
      queue.submit({ type: 'text-generation', priority: 'normal', client_id: 'c1', payload: { prompt: '3' } });

      // Next should throw
      expect(() => {
        queue.submit({ type: 'text-generation', priority: 'normal', client_id: 'c1', payload: { prompt: '4' } });
      }).toThrow(QueueFullError);

      await queue.stop();
    });

    it('should include queueSize in QueueFullError', () => {
      const error = new QueueFullError(100);
      expect(error.queueSize).toBe(100);
      expect(error.code).toBe('QUEUE_FULL');
      expect(error.message).toContain('100');
    });
  });

  describe('Job Lifecycle (Task 3, AC 6)', () => {
    it('should transition pending → in_progress → completed', async () => {
      const service = createMockAIService({ textDelay: 50 });
      const queue = new JobQueue({
        aiService: service,
        maxConcurrent: 5,
        maxSize: 100,
        claudeRpmLimit: 100,
      });

      const job = queue.submit({
        type: 'text-generation',
        priority: 'normal',
        client_id: 'lifecycle-test',
        payload: { prompt: 'test' },
      });

      // Job may already be picked up by worker since auto-start is on
      expect(['pending', 'in_progress']).toContain(job.status);

      await waitForCondition(() => job.status === 'completed', 5000);

      expect(job.status).toBe('completed');
      expect(job.result).toBeDefined();
      expect(job.completedAt).toBeGreaterThan(0);
      expect(job.startedAt).toBeGreaterThan(0);

      await queue.stop();
    });

    it('should fire onComplete callback when job finishes', async () => {
      const service = createMockAIService({ textDelay: 20 });
      const queue = new JobQueue({
        aiService: service,
        maxConcurrent: 5,
        maxSize: 100,
        claudeRpmLimit: 100,
      });

      const job = queue.submit({
        type: 'text-generation',
        priority: 'normal',
        client_id: 'callback-test',
        payload: { prompt: 'test' },
      });

      let callbackFired = false;
      queue.onComplete(job.id, (completedJob) => {
        callbackFired = true;
        expect(completedJob.status).toBe('completed');
      });

      await waitForCondition(() => callbackFired, 5000);
      await queue.stop();

      expect(callbackFired).toBe(true);
    });
  });

  describe('Dead-letter after retries (Task 3, AC 7)', () => {
    it('should mark job as dead after 2 failures', async () => {
      // Service fails all calls (3 fails: initial + 2 retries = dead)
      const service = createMockAIService({ failCount: 3 });
      const queue = new JobQueue({
        aiService: service,
        maxConcurrent: 5,
        maxSize: 100,
        maxRetries: 2,
        claudeRpmLimit: 100,
      });

      const job = queue.submit({
        type: 'text-generation',
        priority: 'normal',
        client_id: 'dead-test',
        payload: { prompt: 'will fail' },
      });

      let deadCallbackFired = false;
      queue.onComplete(job.id, (j) => {
        deadCallbackFired = true;
        expect(j.status).toBe('dead');
      });

      await waitForCondition(() => deadCallbackFired, 5000);
      await queue.stop();

      expect(job.status).toBe('dead');
      expect(job.retryCount).toBe(2);
      expect(job.error).toContain('Dead after 2 retries');
    });

    it('should succeed on retry if failure is transient', async () => {
      // Fail once, then succeed
      const service = createMockAIService({ failCount: 1 });
      const queue = new JobQueue({
        aiService: service,
        maxConcurrent: 5,
        maxSize: 100,
        maxRetries: 2,
        claudeRpmLimit: 100,
      });

      const job = queue.submit({
        type: 'text-generation',
        priority: 'normal',
        client_id: 'retry-test',
        payload: { prompt: 'retry me' },
      });

      await waitForCondition(() => job.status === 'completed', 5000);
      await queue.stop();

      expect(job.status).toBe('completed');
      expect(job.retryCount).toBe(1);
    });
  });

  describe('Queue Metrics (Task 3, AC 8)', () => {
    it('should return accurate metrics snapshot', async () => {
      const service = createMockAIService({ textDelay: 100 });
      const queue = new JobQueue({
        aiService: service,
        maxConcurrent: 2,
        maxSize: 100,
        claudeRpmLimit: 100,
      });

      queue.submit({ type: 'text-generation', priority: 'normal', client_id: 'c1', payload: { prompt: '1' } });
      queue.submit({ type: 'text-generation', priority: 'normal', client_id: 'c1', payload: { prompt: '2' } });
      queue.submit({ type: 'text-generation', priority: 'normal', client_id: 'c1', payload: { prompt: '3' } });

      // Wait for some to be in flight
      await waitForCondition(() => queue.getMetrics().inFlightCount > 0, 2000);

      const metrics = queue.getMetrics();
      expect(metrics.pendingCount + metrics.inFlightCount + metrics.completedCount).toBeLessThanOrEqual(3);
      expect(metrics.currentRPM).toBeDefined();
      expect(typeof metrics.currentRPM['claude']).toBe('number');

      // Wait for all to complete
      await waitForCondition(
        () => queue.getMetrics().completedCount === 3,
        10000,
      );

      const finalMetrics = queue.getMetrics();
      expect(finalMetrics.completedCount).toBe(3);
      expect(finalMetrics.pendingCount).toBe(0);
      expect(finalMetrics.inFlightCount).toBe(0);

      await queue.stop();
    }, 15000);
  });

  describe('Image Generation', () => {
    it('should process image generation jobs', async () => {
      const service = createMockAIService({ imageDelay: 20 });
      const queue = new JobQueue({
        aiService: service,
        maxConcurrent: 5,
        maxSize: 100,
        replicateRpmLimit: 100,
      });

      const job = queue.submit({
        type: 'image-generation',
        priority: 'normal',
        client_id: 'img-test',
        payload: { prompt: 'a beautiful sunset' },
      });

      await waitForCondition(() => job.status === 'completed', 5000);
      await queue.stop();

      expect(job.status).toBe('completed');
      expect(job.provider).toBe('replicate');
    });
  });
});
