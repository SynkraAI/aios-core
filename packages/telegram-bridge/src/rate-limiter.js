/**
 * RateLimiter — Token bucket for Telegram API rate limiting.
 * Default: 1 token/sec, burst 3. Auto-retry with exponential backoff on 429.
 * Uses promise queue to serialize concurrent callers.
 */
export class RateLimiter {
  constructor(options = {}) {
    this.tokensPerSecond = options.tokensPerSecond || 1;
    this.burstSize = options.burstSize || 3;
    this.maxRetries = options.maxRetries || 3;
    this.tokens = this.burstSize;
    this.lastRefill = Date.now();
    this._queue = Promise.resolve(); // serialization queue
  }

  _refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.burstSize, this.tokens + elapsed * this.tokensPerSecond);
    this.lastRefill = now;
  }

  async _waitForToken() {
    this._refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    const waitMs = ((1 - this.tokens) / this.tokensPerSecond) * 1000;
    await new Promise(resolve => setTimeout(resolve, Math.ceil(waitMs)));
    this._refill();
    this.tokens -= 1;
  }

  /**
   * Execute a function with rate limiting and retry on 429 errors.
   * Serializes concurrent callers to prevent token over-consumption.
   * @param {Function} fn - Async function to execute
   * @returns {*} Result of fn
   */
  async execute(fn) {
    // Chain onto the queue to serialize concurrent calls
    const result = this._queue.then(async () => {
      await this._waitForToken();

      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          return await fn();
        } catch (err) {
          const is429 = err?.error_code === 429 || err?.message?.includes('Too Many Requests');
          if (!is429 || attempt === this.maxRetries) {
            throw err;
          }
          const retryAfter = err?.parameters?.retry_after || (2 ** attempt);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        }
      }
    });

    // Update queue head (swallow errors so queue continues)
    this._queue = result.catch(() => {});

    return result;
  }
}
