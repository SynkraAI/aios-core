/**
 * Sliding-window rate limiter for AI provider API calls.
 *
 * Tracks timestamps in a circular buffer and enforces RPM limits
 * per provider. Workers call `acquire()` before making API calls;
 * the method resolves when a slot is available.
 *
 * @see BSS-3.2: Job Queue & Rate Limit Management
 */

/**
 * Sliding-window rate limiter.
 * Tracks request timestamps and delays callers when the limit is reached.
 */
export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly timestamps: number[] = [];

  constructor(maxRequests: number, windowMs: number = 60_000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Acquire a rate limit slot. Resolves immediately if under the limit,
   * or waits until the oldest request falls out of the sliding window.
   */
  async acquire(): Promise<void> {
    this.pruneExpired();

    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(Date.now());
      return;
    }

    // Wait until the oldest timestamp expires
    const oldest = this.timestamps[0];
    const waitMs = oldest + this.windowMs - Date.now() + 1;

    if (waitMs > 0) {
      await this.sleep(waitMs);
    }

    this.pruneExpired();
    this.timestamps.push(Date.now());
  }

  /**
   * Returns the current number of requests in the sliding window.
   */
  getCurrentRPM(): number {
    this.pruneExpired();
    return this.timestamps.length;
  }

  /**
   * Remove timestamps that have fallen out of the sliding window.
   */
  private pruneExpired(): void {
    const cutoff = Date.now() - this.windowMs;
    while (this.timestamps.length > 0 && this.timestamps[0] <= cutoff) {
      this.timestamps.shift();
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
