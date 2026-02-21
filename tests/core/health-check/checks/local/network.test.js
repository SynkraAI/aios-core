/**
 * Unit tests for NetworkCheck
 *
 * Tests network connectivity verification: DNS lookup, endpoint checks,
 * partial/total failure, and healer guide.
 */

const https = require('https');
const dns = require('dns');
const NetworkCheck = require('../../../../../.aios-core/core/health-check/checks/local/network');

jest.mock('https');
jest.mock('dns', () => ({
  promises: {
    lookup: jest.fn(),
  },
}));

describe('NetworkCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new NetworkCheck();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('local.network');
    });

    test('has HIGH severity', () => {
      expect(check.severity).toBe('HIGH');
    });

    test('is not cacheable', () => {
      expect(check.cacheable).toBe(false);
    });

    test('has healingTier 3', () => {
      expect(check.healingTier).toBe(3);
    });
  });

  // ============================================================
  // execute - all OK
  // ============================================================
  describe('execute - pass', () => {
    test('passes when DNS and all endpoints succeed', async () => {
      dns.promises.lookup.mockResolvedValue({ address: '1.2.3.4' });

      // Mock https.request to simulate successful responses
      https.request.mockImplementation((_options, callback) => {
        const res = { statusCode: 200 };
        setTimeout(() => callback(res), 0);
        return {
          on: jest.fn(),
          end: jest.fn(),
        };
      });

      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.message).toContain('OK');
    });
  });

  // ============================================================
  // execute - partial failure
  // ============================================================
  describe('execute - warning', () => {
    test('warns when some endpoints fail', async () => {
      dns.promises.lookup.mockResolvedValue({ address: '1.2.3.4' });

      let callCount = 0;
      https.request.mockImplementation((_options, callback) => {
        callCount++;
        const req = {
          on: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
        if (callCount === 1) {
          // First endpoint succeeds
          setTimeout(() => callback({ statusCode: 200 }), 0);
        } else {
          // Second endpoint fails
          setTimeout(() => {
            const errorHandler = req.on.mock.calls.find(c => c[0] === 'error');
            if (errorHandler) errorHandler[1](new Error('ECONNREFUSED'));
          }, 0);
        }
        return req;
      });

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('unreachable');
    });
  });

  // ============================================================
  // execute - total failure
  // ============================================================
  describe('execute - fail', () => {
    test('fails when DNS and all endpoints fail', async () => {
      dns.promises.lookup.mockRejectedValue(new Error('DNS failed'));

      https.request.mockImplementation((_options, _callback) => {
        const req = {
          on: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
        setTimeout(() => {
          const errorHandler = req.on.mock.calls.find(c => c[0] === 'error');
          if (errorHandler) errorHandler[1](new Error('ECONNREFUSED'));
        }, 0);
        return req;
      });

      const result = await check.execute({});
      expect(result.status).toBe('fail');
      expect(result.message).toContain('No network connectivity');
    });
  });

  // ============================================================
  // checkEndpoint
  // ============================================================
  describe('checkEndpoint', () => {
    test('resolves with response time on success', async () => {
      https.request.mockImplementation((_options, callback) => {
        setTimeout(() => callback({ statusCode: 200 }), 0);
        return {
          on: jest.fn(),
          end: jest.fn(),
        };
      });

      const time = await check.checkEndpoint('example.com', '/');
      expect(typeof time).toBe('number');
      expect(time).toBeGreaterThanOrEqual(0);
    });

    test('rejects on HTTP error status', async () => {
      https.request.mockImplementation((_options, callback) => {
        setTimeout(() => callback({ statusCode: 500 }), 0);
        return {
          on: jest.fn(),
          end: jest.fn(),
        };
      });

      await expect(check.checkEndpoint('example.com', '/')).rejects.toThrow('HTTP 500');
    });

    test('rejects on connection error', async () => {
      https.request.mockImplementation((_options, _callback) => {
        const req = {
          on: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
        setTimeout(() => {
          const errorHandler = req.on.mock.calls.find(c => c[0] === 'error');
          if (errorHandler) errorHandler[1](new Error('ECONNREFUSED'));
        }, 0);
        return req;
      });

      await expect(check.checkEndpoint('example.com', '/')).rejects.toThrow('ECONNREFUSED');
    });
  });

  // ============================================================
  // getHealer
  // ============================================================
  describe('getHealer', () => {
    test('returns network troubleshoot guide', () => {
      const healer = check.getHealer();
      expect(healer.name).toBe('network-troubleshoot-guide');
      expect(healer.action).toBe('manual');
      expect(healer.steps.length).toBeGreaterThan(0);
    });
  });
});
