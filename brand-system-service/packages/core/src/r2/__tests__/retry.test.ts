/**
 * Tests for retry logic with exponential backoff.
 * AC: 6, 9
 */
import { withRetry, isRetryableError } from '../retry';
import { DEFAULT_RETRY_CONFIG } from '../types';

describe('isRetryableError', () => {
  it('returns true for NetworkingError', () => {
    const error = Object.assign(new Error('network'), { code: 'NetworkingError' });
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for TimeoutError', () => {
    const error = Object.assign(new Error('timeout'), { code: 'TimeoutError' });
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for ThrottlingException', () => {
    const error = Object.assign(new Error('throttle'), { code: 'ThrottlingException' });
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for ECONNRESET', () => {
    const error = Object.assign(new Error('reset'), { code: 'ECONNRESET' });
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for ETIMEDOUT', () => {
    const error = Object.assign(new Error('timed out'), { code: 'ETIMEDOUT' });
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for 500 status code', () => {
    const error = Object.assign(new Error('server error'), {
      $metadata: { httpStatusCode: 500 },
    });
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for 503 status code', () => {
    const error = Object.assign(new Error('unavailable'), {
      $metadata: { httpStatusCode: 503 },
    });
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for 429 too many requests', () => {
    const error = Object.assign(new Error('rate limited'), {
      $metadata: { httpStatusCode: 429 },
    });
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns false for 404 not found', () => {
    const error = Object.assign(new Error('not found'), {
      $metadata: { httpStatusCode: 404 },
    });
    expect(isRetryableError(error)).toBe(false);
  });

  it('returns false for 400 bad request', () => {
    const error = Object.assign(new Error('bad request'), {
      $metadata: { httpStatusCode: 400 },
    });
    expect(isRetryableError(error)).toBe(false);
  });

  it('returns false for 403 forbidden', () => {
    const error = Object.assign(new Error('forbidden'), {
      $metadata: { httpStatusCode: 403 },
    });
    expect(isRetryableError(error)).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isRetryableError('string error')).toBe(false);
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
  });

  it('returns true when error name matches retryable set', () => {
    const error = new Error('service unavailable');
    error.name = 'ServiceUnavailable';
    expect(isRetryableError(error)).toBe(true);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns result on first successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await withRetry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on transient error and succeeds', async () => {
    const transientError = Object.assign(new Error('timeout'), { code: 'TimeoutError' });
    const fn = jest.fn().mockRejectedValueOnce(transientError).mockResolvedValueOnce('recovered');

    const promise = withRetry(fn, undefined, {
      maxRetries: 3,
      baseDelayMs: 10,
      maxDelayMs: 100,
    });

    // Advance past the backoff delay
    await jest.advanceTimersByTimeAsync(200);

    const result = await promise;
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws immediately on non-retryable error', async () => {
    const nonRetryableError = Object.assign(new Error('not found'), {
      $metadata: { httpStatusCode: 404 },
    });
    const fn = jest.fn().mockRejectedValue(nonRetryableError);

    await expect(withRetry(fn)).rejects.toThrow('not found');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('exhausts all retries and throws last error', async () => {
    jest.useRealTimers(); // Use real timers for this test — delays are tiny
    const transientError = Object.assign(new Error('timeout'), { code: 'TimeoutError' });
    const fn = jest.fn().mockRejectedValue(transientError);

    const config = { maxRetries: 2, baseDelayMs: 1, maxDelayMs: 5 };

    await expect(withRetry(fn, undefined, config)).rejects.toThrow('timeout');
    // 1 initial + 2 retries = 3 calls
    expect(fn).toHaveBeenCalledTimes(3);
    jest.useFakeTimers(); // Restore for other tests
  });

  it('uses default config when none provided', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    await withRetry(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    // Just verify default config is applied (maxRetries=3, baseDelay=200, maxDelay=5000)
    expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(3);
    expect(DEFAULT_RETRY_CONFIG.baseDelayMs).toBe(200);
    expect(DEFAULT_RETRY_CONFIG.maxDelayMs).toBe(5000);
  });

  it('logs retry attempts when logger provided', async () => {
    const transientError = Object.assign(new Error('network error'), { code: 'ECONNRESET' });
    const fn = jest.fn().mockRejectedValueOnce(transientError).mockResolvedValueOnce('ok');

    const logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const promise = withRetry(fn, logger, {
      maxRetries: 3,
      baseDelayMs: 10,
      maxDelayMs: 100,
    });

    await jest.advanceTimersByTimeAsync(200);
    await promise;

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Retryable error on attempt 1'),
      expect.objectContaining({ error: 'network error' }),
    );
  });

  it('converts non-Error thrown values to Error', async () => {
    const fn = jest.fn().mockRejectedValue('string error');
    await expect(withRetry(fn)).rejects.toThrow('string error');
  });
});
