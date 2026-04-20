/**
 * Unit tests for pro-setup.js email auth flow (PRO-11)
 *
 * @see Story PRO-11 - Email Authentication & Buyer-Based Pro Activation
 * @see AC-7 - Backward compatibility with license key
 */

'use strict';

const childProcess = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const proSetup = require('../../packages/installer/src/wizard/pro-setup');

describe('pro-setup auth constants', () => {
  it('should export EMAIL_PATTERN', () => {
    const { EMAIL_PATTERN } = proSetup._testing;

    expect(EMAIL_PATTERN.test('valid@email.com')).toBe(true);
    expect(EMAIL_PATTERN.test('user+tag@domain.co')).toBe(true);
    expect(EMAIL_PATTERN.test('invalid')).toBe(false);
    expect(EMAIL_PATTERN.test('@no-user.com')).toBe(false);
    expect(EMAIL_PATTERN.test('no-domain@')).toBe(false);
    expect(EMAIL_PATTERN.test('')).toBe(false);
  });

  it('should have MIN_PASSWORD_LENGTH of 8', () => {
    expect(proSetup._testing.MIN_PASSWORD_LENGTH).toBe(8);
  });

  it('should have VERIFY_POLL_INTERVAL_MS of 5000', () => {
    expect(proSetup._testing.VERIFY_POLL_INTERVAL_MS).toBe(5000);
  });

  it('should have VERIFY_POLL_TIMEOUT_MS of 10 minutes', () => {
    expect(proSetup._testing.VERIFY_POLL_TIMEOUT_MS).toBe(10 * 60 * 1000);
  });
});

describe('pro-setup CI auth (AC-7, Task 4.6)', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restore env
    process.env = { ...originalEnv };
  });

  it('should prefer email+password over key in CI mode', async () => {
    const mockClient = {
      isOnline: jest.fn().mockResolvedValue(true),
      login: jest.fn().mockResolvedValue({
        sessionToken: 'test-session',
        userId: 'user-1',
        emailVerified: true,
      }),
      activateByAuth: jest.fn().mockResolvedValue({
        key: 'PRO-AUTO-1234-5678-ABCD',
        features: ['pro.squads.*'],
        seats: { used: 1, max: 2 },
        cacheValidDays: 30,
        gracePeriodDays: 7,
      }),
    };

    const mockLicenseApi = {
      LicenseApiClient: jest.fn().mockReturnValue(mockClient),
    };

    // Override the loader
    proSetup._testing.loadLicenseApi = () => mockLicenseApi;

    const result = await proSetup._testing.stepLicenseGateCI({
      email: 'ci@test.com',
      password: 'CIPassword123',
      key: 'PRO-SKIP-THIS-KEY0-XXXX',
    });

    expect(result.success).toBe(true);
    expect(mockClient.login).toHaveBeenCalledWith('ci@test.com', 'CIPassword123');
    // Key should NOT be used when email is present
    expect(result.key).toBe('PRO-AUTO-1234-5678-ABCD');

    // Cleanup
    proSetup._testing.loadLicenseApi = undefined;
  });

  it('should fall back to key when no email in CI mode', async () => {
    const mockClient = {
      isOnline: jest.fn().mockResolvedValue(true),
      activate: jest.fn().mockResolvedValue({
        key: 'PRO-KEY0-1234-5678-ABCD',
        features: ['pro.squads.*'],
        seats: { used: 1, max: 2 },
        cacheValidDays: 30,
        gracePeriodDays: 7,
      }),
      syncPendingDeactivation: jest.fn().mockResolvedValue(false),
    };

    const mockLicenseApi = {
      LicenseApiClient: jest.fn().mockReturnValue(mockClient),
    };

    proSetup._testing.loadLicenseApi = () => mockLicenseApi;

    const result = await proSetup._testing.stepLicenseGateCI({
      key: 'PRO-KEY0-1234-5678-ABCD',
    });

    // Should validate via key flow
    expect(result.success).toBeDefined();

    proSetup._testing.loadLicenseApi = undefined;
  });

  it('should return error when no credentials in CI mode', async () => {
    const result = await proSetup._testing.stepLicenseGateCI({});

    expect(result.success).toBe(false);
    expect(result.error).toContain('AIOX_PRO_EMAIL');
  });
});

describe('pro-setup backward compatibility (AC-7)', () => {
  it('should still export validateKeyFormat', () => {
    expect(typeof proSetup.validateKeyFormat).toBe('function');
    expect(proSetup.validateKeyFormat('PRO-ABCD-1234-5678-WXYZ')).toBe(true);
    expect(proSetup.validateKeyFormat('invalid')).toBe(false);
  });

  it('should still export maskLicenseKey', () => {
    expect(typeof proSetup.maskLicenseKey).toBe('function');
    expect(proSetup.maskLicenseKey('PRO-ABCD-1234-5678-WXYZ')).toBe('PRO-ABCD-****-****-WXYZ');
  });

  it('should export all original functions', () => {
    expect(typeof proSetup.runProWizard).toBe('function');
    expect(typeof proSetup.stepLicenseGate).toBe('function');
    expect(typeof proSetup.stepInstallScaffold).toBe('function');
    expect(typeof proSetup.stepVerify).toBe('function');
    expect(typeof proSetup.isCIEnvironment).toBe('function');
    expect(typeof proSetup.showProHeader).toBe('function');
  });

  it('should export new auth testing helpers', () => {
    expect(typeof proSetup._testing.authenticateWithEmail).toBe('function');
    expect(typeof proSetup._testing.waitForEmailVerification).toBe('function');
    expect(typeof proSetup._testing.activateProByAuth).toBe('function');
    expect(typeof proSetup._testing.stepLicenseGateCI).toBe('function');
  });
});

describe('InlineLicenseClient current auth contract', () => {
  let server;
  let baseUrl;

  function createMockServer(handler) {
    return new Promise((resolve) => {
      server = http.createServer(handler);
      server.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  }

  function closeMockServer() {
    return new Promise((resolve) => {
      if (server) {
        if (typeof server.closeAllConnections === 'function') {
          server.closeAllConnections();
        }
        server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  afterEach(async () => {
    await closeMockServer();
  });

  it('normalizes login accessToken to sessionToken for existing wizard flows', async () => {
    await createMockServer((req, res) => {
      expect(req.method).toBe('POST');
      expect(req.url).toBe('/api/v1/auth/login');

      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        expect(JSON.parse(body)).toEqual({
          email: 'user@example.com',
          password: 'TestPass123',
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          accessToken: 'live-access-token',
          refreshToken: 'refresh-token',
          emailVerified: true,
        }));
      });
    });

    const client = new proSetup._testing.InlineLicenseClient(baseUrl);
    const result = await client.login('user@example.com', 'TestPass123');

    expect(result.accessToken).toBe('live-access-token');
    expect(result.sessionToken).toBe('live-access-token');
    expect(result.emailVerified).toBe(true);
  });

  it('uses POST /verify-status with accessToken body and normalizes emailVerified', async () => {
    await createMockServer((req, res) => {
      expect(req.method).toBe('POST');
      expect(req.url).toBe('/api/v1/auth/verify-status');

      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        expect(JSON.parse(body)).toEqual({ accessToken: 'live-access-token' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          email: 'user@example.com',
          emailVerified: true,
        }));
      });
    });

    const client = new proSetup._testing.InlineLicenseClient(baseUrl);
    const result = await client.checkEmailVerified('live-access-token');

    expect(result.email).toBe('user@example.com');
    expect(result.verified).toBe(true);
  });

  it('sends accessToken to activate-pro and normalizes licenseKey to key', async () => {
    await createMockServer((req, res) => {
      expect(req.method).toBe('POST');
      expect(req.url).toBe('/api/v1/auth/activate-pro');
      expect(req.headers.authorization).toBe('Bearer live-access-token');

      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const parsed = JSON.parse(body);
        expect(parsed.accessToken).toBe('live-access-token');
        expect(parsed.machineId).toBe('machine-id');
        expect(parsed.aioxCoreVersion).toBe('4.1.0');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          activated: true,
          licenseKey: 'PRO-ABCD-1234-EFGH-5678',
          features: ['pro'],
        }));
      });
    });

    const client = new proSetup._testing.InlineLicenseClient(baseUrl);
    const result = await client.activateByAuth('live-access-token', 'machine-id', '4.1.0');

    expect(result.key).toBe('PRO-ABCD-1234-EFGH-5678');
    expect(result.licenseKey).toBe('PRO-ABCD-1234-EFGH-5678');
  });
});

describe('resolveProSourceDir', () => {
  const bundledProDir = path.resolve(__dirname, '../../pro');
  const bundledSquadsDir = path.join(bundledProDir, 'squads');
  const gitmodulesPath = path.resolve(__dirname, '../../.gitmodules');
  const npmProDir = path.join('/tmp/aiox-project', 'node_modules', '@aiox-fullstack', 'pro');

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prefers bundled pro content when available', () => {
    jest.spyOn(fs, 'existsSync').mockImplementation((target) => target === bundledSquadsDir);

    const result = proSetup._testing.resolveProSourceDir('/tmp/aiox-project');

    expect(result).toEqual({ proSourceDir: bundledProDir });
  });

  it('bootstraps the pro submodule in source checkouts when needed', () => {
    let squadsVisible = false;

    jest.spyOn(fs, 'existsSync').mockImplementation((target) => {
      if (target === bundledSquadsDir) {
        return squadsVisible;
      }
      if (target === bundledProDir || target === gitmodulesPath) {
        return true;
      }
      return false;
    });

    jest.spyOn(childProcess, 'execFileSync').mockImplementation(() => {
      squadsVisible = true;
      return Buffer.from('');
    });

    const result = proSetup._testing.resolveProSourceDir('/tmp/aiox-project');

    expect(childProcess.execFileSync).toHaveBeenCalledWith(
      'git',
      ['submodule', 'update', '--init', '--recursive', 'pro'],
      expect.objectContaining({
        cwd: path.resolve(__dirname, '../..'),
        stdio: 'ignore',
      }),
    );
    expect(result).toEqual({ proSourceDir: bundledProDir });
  });

  it('falls back to target node_modules pro package when bundled content is unavailable', () => {
    jest.spyOn(fs, 'existsSync').mockImplementation((target) => target === npmProDir);

    const result = proSetup._testing.resolveProSourceDir('/tmp/aiox-project');

    expect(result).toEqual({ proSourceDir: npmProDir });
  });

  it('returns bootstrapError when git submodule initialization fails', () => {
    jest.spyOn(fs, 'existsSync').mockImplementation((target) => {
      if (target === bundledProDir || target === gitmodulesPath) {
        return true;
      }
      return false;
    });

    jest.spyOn(childProcess, 'execFileSync').mockImplementation(() => {
      throw new Error('git unavailable');
    });

    const result = proSetup._testing.resolveProSourceDir('/tmp/aiox-project');

    expect(result).toEqual({
      proSourceDir: null,
      bootstrapError: 'git unavailable',
    });
  });
});
