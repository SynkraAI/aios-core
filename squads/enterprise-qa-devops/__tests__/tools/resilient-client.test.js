/**
 * Resilient Client Unit Tests
 * Enterprise QA DevOps Squad
 */

const {
  ResilientClient,
  CircuitBreaker,
  RateLimiter,
  RetryConfig,
  CircuitState
} = require('../../tools/resilient-client');

describe('CircuitBreaker', () => {
  let breaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 1000
    });
  });

  describe('state transitions', () => {
    it('should start in CLOSED state', () => {
      expect(breaker.getState().state).toBe(CircuitState.CLOSED);
    });

    it('should allow requests when CLOSED', () => {
      expect(breaker.canRequest()).toBe(true);
    });

    it('should transition to OPEN after threshold failures', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.recordFailure();

      expect(breaker.getState().state).toBe(CircuitState.OPEN);
      expect(breaker.canRequest()).toBe(false);
    });

    it('should transition to HALF_OPEN after reset timeout', async () => {
      // Trigger OPEN state
      for (let i = 0; i < 3; i++) {
        breaker.recordFailure();
      }
      expect(breaker.getState().state).toBe(CircuitState.OPEN);

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should transition to HALF_OPEN on next request check
      expect(breaker.canRequest()).toBe(true);
      expect(breaker.getState().state).toBe(CircuitState.HALF_OPEN);
    });

    it('should transition from HALF_OPEN to CLOSED on success', async () => {
      for (let i = 0; i < 3; i++) {
        breaker.recordFailure();
      }

      await new Promise(resolve => setTimeout(resolve, 1100));
      breaker.canRequest(); // Trigger HALF_OPEN

      breaker.recordSuccess();

      expect(breaker.getState().state).toBe(CircuitState.CLOSED);
    });

    it('should transition from HALF_OPEN to OPEN on failure', async () => {
      for (let i = 0; i < 3; i++) {
        breaker.recordFailure();
      }

      await new Promise(resolve => setTimeout(resolve, 1100));
      breaker.canRequest(); // Trigger HALF_OPEN

      breaker.recordFailure();

      expect(breaker.getState().state).toBe(CircuitState.OPEN);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      for (let i = 0; i < 3; i++) {
        breaker.recordFailure();
      }

      breaker.reset();

      expect(breaker.getState().state).toBe(CircuitState.CLOSED);
      expect(breaker.getState().failures).toBe(0);
      expect(breaker.canRequest()).toBe(true);
    });
  });
});

describe('RateLimiter', () => {
  let limiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      maxTokens: 10,
      refillRate: 5 // 5 tokens per second
    });
  });

  describe('token consumption', () => {
    it('should start with max tokens', () => {
      expect(limiter.getTokens()).toBe(10);
    });

    it('should consume tokens on request', () => {
      expect(limiter.tryConsume(1)).toBe(true);
      expect(limiter.getTokens()).toBe(9);
    });

    it('should reject when no tokens available', () => {
      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        limiter.tryConsume(1);
      }

      expect(limiter.tryConsume(1)).toBe(false);
    });

    it('should allow consuming multiple tokens', () => {
      expect(limiter.tryConsume(5)).toBe(true);
      expect(limiter.getTokens()).toBe(5);
    });

    it('should reject if not enough tokens for multi-token request', () => {
      limiter.tryConsume(8); // Use 8, leaving 2
      expect(limiter.tryConsume(5)).toBe(false);
    });
  });

  describe('token refill', () => {
    it('should refill tokens over time', async () => {
      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        limiter.tryConsume(1);
      }
      expect(limiter.getTokens()).toBe(0);

      // Wait 500ms (should refill ~2.5 tokens at 5/sec)
      await new Promise(resolve => setTimeout(resolve, 500));

      const tokens = limiter.getTokens();
      expect(tokens).toBeGreaterThanOrEqual(2);
      expect(tokens).toBeLessThanOrEqual(3);
    });

    it('should not exceed max tokens', async () => {
      // Wait longer than needed to fully refill
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(limiter.getTokens()).toBeLessThanOrEqual(10);
    });
  });

  describe('wait time calculation', () => {
    it('should return 0 when tokens available', () => {
      expect(limiter.getWaitTime(1)).toBe(0);
    });

    it('should calculate wait time when tokens not available', () => {
      for (let i = 0; i < 10; i++) {
        limiter.tryConsume(1);
      }

      const waitTime = limiter.getWaitTime(5);
      // Need 5 tokens at 5/sec = ~1000ms
      expect(waitTime).toBeGreaterThanOrEqual(900);
      expect(waitTime).toBeLessThanOrEqual(1100);
    });
  });
});

describe('RetryConfig', () => {
  let config;

  beforeEach(() => {
    config = new RetryConfig({
      maxRetries: 3,
      baseDelay: 100,
      maxDelay: 5000,
      exponentialBase: 2,
      jitter: false
    });
  });

  describe('delay calculation', () => {
    it('should calculate exponential delays', () => {
      expect(config.getDelay(0)).toBe(100);  // 100 * 2^0
      expect(config.getDelay(1)).toBe(200);  // 100 * 2^1
      expect(config.getDelay(2)).toBe(400);  // 100 * 2^2
      expect(config.getDelay(3)).toBe(800);  // 100 * 2^3
    });

    it('should cap delay at maxDelay', () => {
      expect(config.getDelay(10)).toBe(5000);
    });

    it('should add jitter when enabled', () => {
      const jitterConfig = new RetryConfig({
        baseDelay: 100,
        jitter: true
      });

      const delays = new Set();
      for (let i = 0; i < 10; i++) {
        delays.add(jitterConfig.getDelay(0));
      }

      // With jitter, delays should vary
      expect(delays.size).toBeGreaterThan(1);
    });
  });

  describe('retryable checks', () => {
    it('should identify retryable status codes', () => {
      expect(config.isRetryable({ response: { status: 500 } })).toBe(true);
      expect(config.isRetryable({ response: { status: 503 } })).toBe(true);
      expect(config.isRetryable({ response: { status: 429 } })).toBe(true);
    });

    it('should identify non-retryable status codes', () => {
      expect(config.isRetryable({ response: { status: 400 } })).toBe(false);
      expect(config.isRetryable({ response: { status: 401 } })).toBe(false);
      expect(config.isRetryable({ response: { status: 404 } })).toBe(false);
    });

    it('should identify retryable error codes', () => {
      expect(config.isRetryable({ code: 'ECONNRESET' })).toBe(true);
      expect(config.isRetryable({ code: 'ETIMEDOUT' })).toBe(true);
    });

    it('should identify non-retryable errors', () => {
      expect(config.isRetryable({ code: 'EACCES' })).toBe(false);
      expect(config.isRetryable(new Error('Random error'))).toBe(false);
    });
  });
});

describe('ResilientClient', () => {
  let client;

  beforeEach(() => {
    client = new ResilientClient({
      serviceName: 'TestService',
      timeout: 5000,
      circuitBreaker: {
        failureThreshold: 3,
        resetTimeout: 1000
      },
      rateLimiter: {
        maxTokens: 100,
        refillRate: 10
      },
      retry: {
        maxRetries: 2,
        baseDelay: 50,
        jitter: false
      }
    });
  });

  describe('executeWithResilience', () => {
    it('should execute successful operation', async () => {
      const operation = jest.fn().mockResolvedValue({ data: 'success' });

      const result = await client.executeWithResilience(operation, { operation: 'test' });

      expect(result).toEqual({ data: 'success' });
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ response: { status: 503 } })
        .mockResolvedValue({ data: 'success' });

      const result = await client.executeWithResilience(operation);

      expect(result).toEqual({ data: 'success' });
      expect(operation).toHaveBeenCalledTimes(2);
      expect(client.metrics.retriedRequests).toBe(1);
    });

    it('should not retry on non-retryable error', async () => {
      const operation = jest.fn()
        .mockRejectedValue({ response: { status: 404 } });

      await expect(client.executeWithResilience(operation))
        .rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      const operation = jest.fn()
        .mockRejectedValue({ response: { status: 500 } });

      await expect(client.executeWithResilience(operation))
        .rejects.toThrow();

      // Initial + 2 retries = 3 calls
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should reject when circuit breaker is open', async () => {
      // Trip the circuit breaker
      const failingOp = jest.fn()
        .mockRejectedValue({ response: { status: 500 } });

      for (let i = 0; i < 3; i++) {
        try {
          await client.executeWithResilience(failingOp);
        } catch (e) {
          // Expected
        }
      }

      // Now circuit should be open
      const newOp = jest.fn().mockResolvedValue('success');

      await expect(client.executeWithResilience(newOp))
        .rejects.toThrow('Circuit breaker is OPEN');

      expect(newOp).not.toHaveBeenCalled();
    });

    it('should handle rate limiting from server', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({
          response: {
            status: 429,
            headers: { 'retry-after': '0.1' }
          }
        })
        .mockResolvedValue({ data: 'success' });

      const result = await client.executeWithResilience(operation);

      expect(result).toEqual({ data: 'success' });
    });

    it('should timeout long operations', async () => {
      client.timeout = 50;

      const slowOperation = () => new Promise(resolve =>
        setTimeout(() => resolve('done'), 200)
      );

      await expect(client.executeWithResilience(slowOperation))
        .rejects.toThrow('timed out');
    });
  });

  describe('event emission', () => {
    it('should emit success event', async () => {
      const successHandler = jest.fn();
      client.on('success', successHandler);

      await client.executeWithResilience(
        () => Promise.resolve('ok'),
        { operation: 'test' }
      );

      expect(successHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'TestService',
          operation: 'test'
        })
      );
    });

    it('should emit retry event', async () => {
      const retryHandler = jest.fn();
      client.on('retry', retryHandler);

      const operation = jest.fn()
        .mockRejectedValueOnce({ response: { status: 503 } })
        .mockResolvedValue('ok');

      await client.executeWithResilience(operation);

      expect(retryHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'TestService',
          attempt: 1
        })
      );
    });

    it('should emit failure event', async () => {
      const failureHandler = jest.fn();
      client.on('failure', failureHandler);

      const operation = jest.fn()
        .mockRejectedValue({ response: { status: 404 } });

      try {
        await client.executeWithResilience(operation, { operation: 'test' });
      } catch (e) {
        // Expected
      }

      expect(failureHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'TestService',
          operation: 'test'
        })
      );
    });
  });

  describe('metrics', () => {
    it('should track request metrics', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ response: { status: 503 } })
        .mockResolvedValue('ok');

      await client.executeWithResilience(operation);

      const metrics = client.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.retriedRequests).toBe(1);
    });

    it('should calculate success rate', async () => {
      await client.executeWithResilience(() => Promise.resolve('ok'));
      await client.executeWithResilience(() => Promise.resolve('ok'));

      try {
        await client.executeWithResilience(
          () => Promise.reject({ response: { status: 400 } })
        );
      } catch (e) {
        // Expected
      }

      const metrics = client.getMetrics();
      expect(metrics.successRate).toBe('66.67%');
    });

    it('should reset metrics', async () => {
      await client.executeWithResilience(() => Promise.resolve('ok'));

      client.resetMetrics();

      const metrics = client.getMetrics();
      expect(metrics.totalRequests).toBe(0);
    });
  });

  describe('parseRetryAfter', () => {
    it('should parse numeric seconds', () => {
      const waitTime = client.parseRetryAfter({ 'retry-after': '30' });
      expect(waitTime).toBe(30000);
    });

    it('should handle missing header', () => {
      const waitTime = client.parseRetryAfter({});
      expect(waitTime).toBe(0);
    });

    it('should handle null headers', () => {
      const waitTime = client.parseRetryAfter(null);
      expect(waitTime).toBe(0);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy when circuit is closed', async () => {
      const health = await client.healthCheck();
      expect(health.status).toBe('healthy');
    });

    it('should return degraded when circuit is open', async () => {
      // Trip the circuit
      const failing = jest.fn().mockRejectedValue({ response: { status: 500 } });

      for (let i = 0; i < 3; i++) {
        try {
          await client.executeWithResilience(failing);
        } catch (e) {}
      }

      const health = await client.healthCheck();
      expect(health.status).toBe('degraded');
    });
  });
});
