/**
 * Tests for Sentry integration.
 * Story: BSS-1.7 AC-1
 */

jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn((cb: (scope: unknown) => void) => {
    cb({ setExtra: jest.fn() });
  }),
}));

import * as Sentry from '@sentry/node';

import { initSentry, captureError, sentrySendTestPing, resetSentryState } from '../sentry';
import type { BSSConfig } from '../../config';

// Suppress console output
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

function makeConfig(overrides?: Partial<BSSConfig['sentry']>): BSSConfig {
  return {
    clientId: 'test',
    outputDir: 'output',
    hostingTarget: 'generic',
    debug: false,
    r2: {
      accountId: '',
      accessKeyId: '',
      secretAccessKey: '',
      bucketName: 'test',
      publicUrl: '',
    },
    sentry: {
      dsn: 'https://test@sentry.io/123',
      environment: 'test',
      ...overrides,
    },
  };
}

describe('initSentry', () => {
  const origEnv = process.env;

  beforeEach(() => {
    process.env = { ...origEnv };
    resetSentryState();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = origEnv;
  });

  it('calls Sentry.init with dsn and environment', () => {
    initSentry(makeConfig());
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
        tracesSampleRate: 0.1,
      }),
    );
  });

  it('skips init when BSS_SENTRY_ENABLED=false', () => {
    process.env['BSS_SENTRY_ENABLED'] = 'false';
    initSentry(makeConfig());
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('skips init when dsn is empty', () => {
    initSentry(makeConfig({ dsn: '' }));
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('does not re-initialize when called twice', () => {
    initSentry(makeConfig());
    initSentry(makeConfig());
    expect(Sentry.init).toHaveBeenCalledTimes(1);
  });
});

describe('captureError', () => {
  const origEnv = process.env;

  beforeEach(() => {
    process.env = { ...origEnv };
    resetSentryState();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = origEnv;
  });

  it('captures error after init', () => {
    initSentry(makeConfig());
    const error = new Error('test error');
    captureError(error);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('does nothing when not initialized', () => {
    captureError(new Error('test'));
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('passes context via withScope', () => {
    initSentry(makeConfig());
    captureError(new Error('test'), { clientId: 'acme' });
    expect(Sentry.withScope).toHaveBeenCalled();
  });
});

describe('sentrySendTestPing', () => {
  beforeEach(() => {
    resetSentryState();
    jest.clearAllMocks();
  });

  it('returns false when not initialized', () => {
    expect(sentrySendTestPing()).toBe(false);
  });

  it('sends test message when initialized', () => {
    initSentry(makeConfig());
    const result = sentrySendTestPing();
    expect(result).toBe(true);
    expect(Sentry.captureMessage).toHaveBeenCalledWith('health-check-ping', 'debug');
  });
});
