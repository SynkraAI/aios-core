/**
 * Resilient HTTP Client Base
 * Enterprise QA DevOps Squad
 *
 * Provides retry with exponential backoff, circuit breaker,
 * rate limit handling, and consistent error management.
 */

const EventEmitter = require('events');

/**
 * Circuit Breaker States
 */
const CircuitState = {
  CLOSED: 'CLOSED',     // Normal operation
  OPEN: 'OPEN',         // Failing, reject requests
  HALF_OPEN: 'HALF_OPEN' // Testing if service recovered
};

/**
 * Circuit Breaker Implementation
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.halfOpenRequests = options.halfOpenRequests || 1;

    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.halfOpenAttempts = 0;
  }

  /**
   * Check if request should be allowed
   */
  canRequest() {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      // Check if reset timeout has passed
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
        return true;
      }
      return false;
    }

    // HALF_OPEN: allow limited requests
    return this.halfOpenAttempts < this.halfOpenRequests;
  }

  /**
   * Record successful request
   */
  recordSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.halfOpenRequests) {
        this.reset();
      }
    } else {
      this.failures = Math.max(0, this.failures - 1);
    }
  }

  /**
   * Record failed request
   */
  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
    } else if (this.failures >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.halfOpenAttempts = 0;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Rate Limiter Implementation (Token Bucket)
 */
class RateLimiter {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 100;
    this.refillRate = options.refillRate || 10; // tokens per second
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  /**
   * Refill tokens based on elapsed time
   */
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Try to consume a token
   */
  tryConsume(tokens = 1) {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  /**
   * Get wait time until tokens available
   */
  getWaitTime(tokens = 1) {
    this.refill();

    if (this.tokens >= tokens) {
      return 0;
    }

    const tokensNeeded = tokens - this.tokens;
    return Math.ceil(tokensNeeded / this.refillRate * 1000);
  }

  /**
   * Get current token count
   */
  getTokens() {
    this.refill();
    return Math.floor(this.tokens);
  }
}

/**
 * Retry Configuration
 */
class RetryConfig {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.exponentialBase = options.exponentialBase || 2;
    this.jitter = options.jitter !== false;
    this.retryableStatuses = options.retryableStatuses || [408, 429, 500, 502, 503, 504];
    this.retryableErrors = options.retryableErrors || ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
  }

  /**
   * Calculate delay for retry attempt
   */
  getDelay(attempt) {
    let delay = this.baseDelay * Math.pow(this.exponentialBase, attempt);
    delay = Math.min(delay, this.maxDelay);

    if (this.jitter) {
      // Add random jitter (0-25% of delay)
      delay += Math.random() * delay * 0.25;
    }

    return Math.floor(delay);
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error) {
    // Check for retryable status codes
    if (error.response?.status) {
      return this.retryableStatuses.includes(error.response.status);
    }

    // Check for retryable error codes
    if (error.code) {
      return this.retryableErrors.includes(error.code);
    }

    return false;
  }
}

/**
 * Resilient Client Base Class
 */
class ResilientClient extends EventEmitter {
  constructor(options = {}) {
    super();

    this.serviceName = options.serviceName || 'unknown';
    this.timeout = options.timeout || 30000;

    // Initialize resilience components
    this.circuitBreaker = new CircuitBreaker(options.circuitBreaker);
    this.rateLimiter = new RateLimiter(options.rateLimiter);
    this.retryConfig = new RetryConfig(options.retry);

    // Metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      circuitBreakerTrips: 0,
      rateLimitHits: 0
    };
  }

  /**
   * Execute request with resilience patterns
   */
  async executeWithResilience(operation, context = {}) {
    const operationName = context.operation || 'unknown';

    // Check circuit breaker
    if (!this.circuitBreaker.canRequest()) {
      this.metrics.circuitBreakerTrips++;
      this.emit('circuitOpen', { service: this.serviceName, operation: operationName });

      throw new Error(
        `Circuit breaker is OPEN for ${this.serviceName}. ` +
        `Service appears to be unavailable. Retry after ${this.circuitBreaker.resetTimeout}ms.`
      );
    }

    // Check rate limiter
    if (!this.rateLimiter.tryConsume()) {
      this.metrics.rateLimitHits++;
      const waitTime = this.rateLimiter.getWaitTime();
      this.emit('rateLimited', { service: this.serviceName, waitTime });

      throw new Error(
        `Rate limit exceeded for ${this.serviceName}. ` +
        `Retry after ${waitTime}ms.`
      );
    }

    this.metrics.totalRequests++;

    // Execute with retry
    let lastError;
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.metrics.retriedRequests++;
          const delay = this.retryConfig.getDelay(attempt - 1);

          this.emit('retry', {
            service: this.serviceName,
            operation: operationName,
            attempt,
            delay
          });

          await this.sleep(delay);
        }

        const result = await this.executeWithTimeout(operation, this.timeout);

        this.circuitBreaker.recordSuccess();
        this.metrics.successfulRequests++;

        this.emit('success', {
          service: this.serviceName,
          operation: operationName,
          attempt
        });

        return result;

      } catch (error) {
        lastError = error;

        // Check for rate limit response (429)
        if (error.response?.status === 429) {
          const retryAfter = this.parseRetryAfter(error.response.headers);
          if (retryAfter > 0) {
            this.emit('rateLimited', {
              service: this.serviceName,
              operation: operationName,
              retryAfter
            });
            await this.sleep(retryAfter);
            continue;
          }
        }

        // Check if retryable
        if (!this.retryConfig.isRetryable(error) || attempt === this.retryConfig.maxRetries) {
          this.circuitBreaker.recordFailure();
          this.metrics.failedRequests++;

          this.emit('failure', {
            service: this.serviceName,
            operation: operationName,
            error: error.message,
            attempt
          });

          throw this.enhanceError(error, operationName, attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute operation with timeout
   */
  async executeWithTimeout(operation, timeout) {
    return Promise.race([
      operation(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout)
      )
    ]);
  }

  /**
   * Parse Retry-After header
   */
  parseRetryAfter(headers) {
    const retryAfter = headers?.['retry-after'] || headers?.['Retry-After'];

    if (!retryAfter) {
      return 0;
    }

    // Could be seconds or HTTP date
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }

    const date = new Date(retryAfter);
    if (!isNaN(date.getTime())) {
      return Math.max(0, date.getTime() - Date.now());
    }

    return 0;
  }

  /**
   * Enhance error with context
   */
  enhanceError(error, operation, attempt) {
    const enhanced = new Error(
      `${this.serviceName} API error during ${operation}: ${error.message}`
    );

    enhanced.originalError = error;
    enhanced.service = this.serviceName;
    enhanced.operation = operation;
    enhanced.attempt = attempt;
    enhanced.statusCode = error.response?.status;
    enhanced.timestamp = new Date().toISOString();

    return enhanced;
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      circuitBreaker: this.circuitBreaker.getState(),
      rateLimiter: {
        availableTokens: this.rateLimiter.getTokens()
      },
      successRate: this.metrics.totalRequests > 0
        ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      circuitBreakerTrips: 0,
      rateLimitHits: 0
    };
  }

  /**
   * Health check with circuit breaker awareness
   */
  async healthCheck() {
    const circuitState = this.circuitBreaker.getState();

    if (circuitState.state === CircuitState.OPEN) {
      return {
        status: 'degraded',
        message: `Circuit breaker is OPEN (${circuitState.failures} failures)`,
        circuitBreaker: circuitState
      };
    }

    return {
      status: 'healthy',
      message: 'Service operational',
      circuitBreaker: circuitState,
      metrics: this.getMetrics()
    };
  }
}

module.exports = {
  ResilientClient,
  CircuitBreaker,
  RateLimiter,
  RetryConfig,
  CircuitState
};
