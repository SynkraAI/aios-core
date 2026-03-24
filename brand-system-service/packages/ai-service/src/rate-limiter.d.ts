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
export declare class RateLimiter {
    private readonly maxRequests;
    private readonly windowMs;
    private readonly timestamps;
    constructor(maxRequests: number, windowMs?: number);
    /**
     * Acquire a rate limit slot. Resolves immediately if under the limit,
     * or waits until the oldest request falls out of the sliding window.
     */
    acquire(): Promise<void>;
    /**
     * Returns the current number of requests in the sliding window.
     */
    getCurrentRPM(): number;
    /**
     * Remove timestamps that have fallen out of the sliding window.
     */
    private pruneExpired;
    private sleep;
}
//# sourceMappingURL=rate-limiter.d.ts.map