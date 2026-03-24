/**
 * Rolling-window rate limiter for abuse detection.
 * Tracks signed URL generation requests per clientId.
 *
 * MVP: File-based persistent counter (JSON files).
 * Production: Redis or Cloudflare KV.
 *
 * @module security/rate-limiter
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { logSecurityEvent } from './security-logger';

/** Default rate limit: 100 requests per rolling 1-hour window. */
const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/** Result of a rate limit check. */
export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetAt: string;
  readonly retryAfterSeconds?: number;
}

/** Internal rate limit record persisted as JSON. */
interface RateLimitRecord {
  timestamps: number[];
}

/** Configuration for the rate limiter. */
export interface RateLimiterConfig {
  readonly maxRequests: number;
  readonly windowMs: number;
  readonly storageDir: string;
}

/**
 * Rolling-window rate limiter.
 * Uses file-based storage for persistence across restarts.
 */
export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly storageDir: string;

  constructor(config?: Partial<RateLimiterConfig>) {
    this.maxRequests = config?.maxRequests ?? DEFAULT_MAX_REQUESTS;
    this.windowMs = config?.windowMs ?? DEFAULT_WINDOW_MS;
    this.storageDir = config?.storageDir ?? 'output/.rate-limits';
  }

  /**
   * Check if a client is within the rate limit.
   * Records the current request timestamp if allowed.
   *
   * @param clientId - Client identifier
   * @returns Rate limit check result
   */
  checkLimit(clientId: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const record = this.loadRecord(clientId);

    // Filter to only timestamps within the rolling window
    const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (activeTimestamps.length >= this.maxRequests) {
      // Rate limit exceeded
      const oldestInWindow = Math.min(...activeTimestamps);
      const resetAt = new Date(oldestInWindow + this.windowMs).toISOString();
      const retryAfterSeconds = Math.ceil((oldestInWindow + this.windowMs - now) / 1000);

      logSecurityEvent({
        event: 'RATE_LIMIT_BREACH',
        severity: 'WARN',
        clientId,
        timestamp: new Date(now).toISOString(),
        details: {
          maxRequests: this.maxRequests,
          windowMs: this.windowMs,
          currentCount: activeTimestamps.length,
        },
      });

      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }

    // Record this request
    activeTimestamps.push(now);
    this.saveRecord(clientId, { timestamps: activeTimestamps });

    const remaining = this.maxRequests - activeTimestamps.length;
    const resetAt = new Date(now + this.windowMs).toISOString();

    return { allowed: true, remaining, resetAt };
  }

  /**
   * Get the current count for a client without recording a request.
   */
  getCount(clientId: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const record = this.loadRecord(clientId);
    return record.timestamps.filter((ts) => ts > windowStart).length;
  }

  /**
   * Reset the rate limit for a client (used in tests).
   */
  reset(clientId: string): void {
    this.saveRecord(clientId, { timestamps: [] });
  }

  private getFilePath(clientId: string): string {
    // Sanitize clientId to prevent path traversal
    const safeId = clientId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.storageDir, `${safeId}.json`);
  }

  private loadRecord(clientId: string): RateLimitRecord {
    const filePath = this.getFilePath(clientId);

    if (!existsSync(filePath)) {
      return { timestamps: [] };
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      const record = JSON.parse(content) as RateLimitRecord;
      if (!Array.isArray(record.timestamps)) {
        return { timestamps: [] };
      }
      return record;
    } catch {
      return { timestamps: [] };
    }
  }

  private saveRecord(clientId: string, record: RateLimitRecord): void {
    const filePath = this.getFilePath(clientId);

    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true });
    }

    writeFileSync(filePath, JSON.stringify(record), 'utf-8');
  }
}
