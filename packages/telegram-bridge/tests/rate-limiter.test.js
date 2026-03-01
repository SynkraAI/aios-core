import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RateLimiter } from '../src/rate-limiter.js';

describe('RateLimiter', () => {
  describe('token bucket', () => {
    it('allows burst of requests up to burstSize', async () => {
      const limiter = new RateLimiter({ tokensPerSecond: 10, burstSize: 3 });
      const results = [];

      // Should be able to fire 3 immediately (burst)
      for (let i = 0; i < 3; i++) {
        await limiter.execute(async () => results.push(i));
      }
      assert.equal(results.length, 3);
    });

    it('throttles after burst is exhausted', async () => {
      const limiter = new RateLimiter({ tokensPerSecond: 100, burstSize: 1 });
      const start = Date.now();

      // First goes through immediately
      await limiter.execute(async () => {});
      // Second should wait for a refill
      await limiter.execute(async () => {});

      const elapsed = Date.now() - start;
      assert.ok(elapsed >= 5, `Expected some delay, got ${elapsed}ms`);
    });

    it('executes function and returns result', async () => {
      const limiter = new RateLimiter({ tokensPerSecond: 10, burstSize: 3 });
      const result = await limiter.execute(async () => 42);
      assert.equal(result, 42);
    });

    it('propagates errors from the function', async () => {
      const limiter = new RateLimiter({ tokensPerSecond: 10, burstSize: 3 });
      await assert.rejects(
        () => limiter.execute(async () => { throw new Error('boom'); }),
        { message: 'boom' }
      );
    });
  });

  describe('429 retry', () => {
    it('retries on 429 errors', async () => {
      const limiter = new RateLimiter({ tokensPerSecond: 10, burstSize: 3, maxRetries: 2 });
      let attempts = 0;

      const result = await limiter.execute(async () => {
        attempts++;
        if (attempts < 2) {
          const err = new Error('Too Many Requests');
          err.error_code = 429;
          err.parameters = { retry_after: 0.01 };
          throw err;
        }
        return 'ok';
      });

      assert.equal(result, 'ok');
      assert.equal(attempts, 2);
    });

    it('throws after maxRetries exhausted', async () => {
      const limiter = new RateLimiter({ tokensPerSecond: 10, burstSize: 3, maxRetries: 1 });

      await assert.rejects(
        () => limiter.execute(async () => {
          const err = new Error('Too Many Requests');
          err.error_code = 429;
          err.parameters = { retry_after: 0.01 };
          throw err;
        }),
        { error_code: 429 }
      );
    });

    it('does not retry non-429 errors', async () => {
      const limiter = new RateLimiter({ tokensPerSecond: 10, burstSize: 3 });
      let attempts = 0;

      await assert.rejects(
        () => limiter.execute(async () => {
          attempts++;
          throw new Error('Network error');
        }),
        { message: 'Network error' }
      );
      assert.equal(attempts, 1);
    });
  });

  describe('concurrency', () => {
    it('serializes concurrent execute calls', async () => {
      const limiter = new RateLimiter({ tokensPerSecond: 100, burstSize: 2 });
      const order = [];

      // Fire 3 concurrently — should execute in order due to queue
      const promises = [
        limiter.execute(async () => { order.push(1); }),
        limiter.execute(async () => { order.push(2); }),
        limiter.execute(async () => { order.push(3); }),
      ];
      await Promise.all(promises);

      assert.deepEqual(order, [1, 2, 3]);
    });
  });
});
