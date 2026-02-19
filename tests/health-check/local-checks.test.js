/**
 * Unit tests for health-check local environment checks
 *
 * Tests all 8 local checks:
 * - DiskSpaceCheck
 * - EnvironmentVarsCheck
 * - GitInstallCheck
 * - IdeDetectionCheck
 * - MemoryCheck
 * - NetworkCheck
 * - NpmInstallCheck
 * - ShellEnvironmentCheck
 */

// Mock external modules before require
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('os', () => ({
  platform: jest.fn(),
  totalmem: jest.fn(),
  freemem: jest.fn(),
  arch: jest.fn(),
}));

jest.mock('https', () => ({
  request: jest.fn(),
}));

jest.mock('dns', () => ({
  promises: {
    lookup: jest.fn(),
  },
}));

const mockFsPromises = {
  stat: jest.fn(),
  access: jest.fn(),
  readFile: jest.fn(),
};
jest.mock('fs', () => ({
  promises: mockFsPromises,
}));

const { execSync } = require('child_process');
const os = require('os');
const https = require('https');
const dns = require('dns');

const DiskSpaceCheck = require('../../.aios-core/core/health-check/checks/local/disk-space');
const EnvironmentVarsCheck = require('../../.aios-core/core/health-check/checks/local/environment-vars');
const GitInstallCheck = require('../../.aios-core/core/health-check/checks/local/git-install');
const IdeDetectionCheck = require('../../.aios-core/core/health-check/checks/local/ide-detection');
const MemoryCheck = require('../../.aios-core/core/health-check/checks/local/memory');
const NetworkCheck = require('../../.aios-core/core/health-check/checks/local/network');
const NpmInstallCheck = require('../../.aios-core/core/health-check/checks/local/npm-install');
const ShellEnvironmentCheck = require('../../.aios-core/core/health-check/checks/local/shell-environment');

beforeEach(() => {
  jest.resetAllMocks();
});

// ============================================================
// DiskSpaceCheck
// ============================================================
describe('DiskSpaceCheck', () => {
  let check;

  beforeEach(() => {
    check = new DiskSpaceCheck();
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('local.disk-space');
    expect(check.name).toBe('Disk Space');
    expect(check.severity).toBe('MEDIUM');
    expect(check.domain).toBe('local');
    expect(check.cacheable).toBe(false);
    expect(check.healingTier).toBe(3);
    expect(check.tags).toEqual(['disk', 'resources']);
  });

  test('execute returns pass when plenty of free space (Unix)', async () => {
    os.platform.mockReturnValue('darwin');
    const dfOutput = 'Filesystem     1K-blocks     Used Available Use% Mounted on\n/dev/disk1    976762584  500000000 476762584  51% /';
    execSync.mockReturnValue(dfOutput);

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('Disk space OK');
    expect(result.details.details.projectRoot).toBe('/test');
  });

  test('execute returns warning when space is low (Unix)', async () => {
    os.platform.mockReturnValue('linux');
    // 3 GB free (between 1 and 5 GB thresholds)
    const dfOutput = 'Filesystem     1K-blocks     Used Available Use% Mounted on\n/dev/sda1    976762584  973612584  3150000  99% /';
    execSync.mockReturnValue(dfOutput);

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('warning');
    expect(result.message).toContain('running low');
  });

  test('execute returns fail when space is critical (Unix)', async () => {
    os.platform.mockReturnValue('linux');
    // 0.5 GB free (below 1 GB minimum)
    const dfOutput = 'Filesystem     1K-blocks     Used Available Use% Mounted on\n/dev/sda1    976762584  976238584   524000  99% /';
    execSync.mockReturnValue(dfOutput);

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('fail');
    expect(result.message).toContain('Low disk space');
    expect(result.recommendation).toContain('Free up disk space');
  });

  test('execute returns error when execSync throws', async () => {
    os.platform.mockReturnValue('darwin');
    execSync.mockImplementation(() => { throw new Error('df failed'); });

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('error');
    expect(result.message).toContain('Could not check disk space');
  });

  test('execute handles Windows platform with PowerShell', async () => {
    os.platform.mockReturnValue('win32');
    const psOutput = JSON.stringify({ Free: 50 * 1024 * 1024 * 1024, Used: 200 * 1024 * 1024 * 1024 });
    execSync.mockReturnValue(psOutput);

    const result = await check.execute({ projectRoot: 'C:\\test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('Disk space OK');
  });

  test('execute handles Windows wmic fallback', async () => {
    os.platform.mockReturnValue('win32');
    execSync
      .mockImplementationOnce(() => { throw new Error('PowerShell failed'); })
      .mockReturnValueOnce('Node,FreeSpace,Size\nPC,53687091200,268435456000');

    const result = await check.execute({ projectRoot: 'C:\\test' });

    expect(result.status).toBe('pass');
  });

  test('execute handles Windows default fallback when both fail', async () => {
    os.platform.mockReturnValue('win32');
    execSync.mockImplementation(() => { throw new Error('all commands failed'); });

    const result = await check.execute({ projectRoot: 'C:\\test' });

    // Falls back to { free: 10, total: 100, usedPercent: 90 }
    expect(result.status).toBe('pass');
    expect(result.details.details.freeSpace).toBe('10.0 GB');
  });

  test('execute uses process.cwd when no projectRoot', async () => {
    os.platform.mockReturnValue('darwin');
    const dfOutput = 'Filesystem     1K-blocks     Used Available Use% Mounted on\n/dev/disk1    976762584  500000000 476762584  51% /';
    execSync.mockReturnValue(dfOutput);

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.details.details.projectRoot).toBe(process.cwd());
  });

  test('getUnixDiskSpace throws on bad output', () => {
    execSync.mockReturnValue('bad output');

    expect(() => check.getUnixDiskSpace('/test')).toThrow('Could not parse df output');
  });

  test('getHealer returns manual cleanup guide', () => {
    const healer = check.getHealer();

    expect(healer.name).toBe('disk-cleanup-guide');
    expect(healer.action).toBe('manual');
    expect(healer.steps.length).toBeGreaterThan(0);
  });

  test('getMetadata returns check info', () => {
    const meta = check.getMetadata();

    expect(meta.id).toBe('local.disk-space');
    expect(meta.timeout).toBe(5000);
  });
});

// ============================================================
// EnvironmentVarsCheck
// ============================================================
describe('EnvironmentVarsCheck', () => {
  let check;
  let origEnv;

  beforeEach(() => {
    origEnv = { ...process.env };
    check = new EnvironmentVarsCheck();
  });

  afterEach(() => {
    process.env = origEnv;
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('local.environment-vars');
    expect(check.name).toBe('Environment Variables');
    expect(check.severity).toBe('MEDIUM');
    expect(check.cacheable).toBe(true);
  });

  test('execute returns pass when all vars are set', async () => {
    process.env.PATH = '/usr/bin';
    process.env.HOME = '/home/user';
    process.env.USERPROFILE = 'C:\\Users\\user';

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.message).toContain('All required environment variables are set');
  });

  test('execute returns fail when required vars are missing', async () => {
    delete process.env.PATH;

    const result = await check.execute({});

    expect(result.status).toBe('fail');
    expect(result.message).toContain('Missing required');
    expect(result.message).toContain('PATH');
  });

  test('execute returns warning when recommended vars are missing', async () => {
    process.env.PATH = '/usr/bin';
    delete process.env.HOME;
    delete process.env.USERPROFILE;

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('Missing recommended');
  });

  test('execute detects AIOS-specific vars', async () => {
    process.env.PATH = '/usr/bin';
    process.env.HOME = '/home/user';
    process.env.USERPROFILE = 'C:\\Users\\user';
    process.env.AIOS_DEBUG = 'true';

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.details.details.aiosVars.length).toBe(1);
    expect(result.details.details.aiosVars[0].name).toBe('AIOS_DEBUG');
  });

  test('maskValue masks long values', () => {
    const masked = check.maskValue('my-secret-token');
    expect(masked).toBe('my****en');
  });

  test('maskValue masks short values completely', () => {
    expect(check.maskValue('ab')).toBe('****');
    expect(check.maskValue('abcd')).toBe('****');
  });

  test('maskValue handles empty value', () => {
    expect(check.maskValue('')).toBe('');
    expect(check.maskValue(null)).toBe('');
  });
});

// ============================================================
// GitInstallCheck
// ============================================================
describe('GitInstallCheck', () => {
  let check;

  beforeEach(() => {
    check = new GitInstallCheck();
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('local.git-install');
    expect(check.name).toBe('Git Installation');
    expect(check.severity).toBe('CRITICAL');
    expect(check.healingTier).toBe(3);
  });

  test('execute returns pass when git is installed and configured', async () => {
    execSync
      .mockReturnValueOnce('git version 2.39.3')  // git --version
      .mockReturnValueOnce('John Doe')              // git config user.name
      .mockReturnValueOnce('john@example.com');     // git config user.email

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.message).toContain('Git 2.39.3 installed and configured');
  });

  test('execute returns warning when git version is old', async () => {
    execSync
      .mockReturnValueOnce('git version 2.15.0')
      .mockReturnValueOnce('John Doe')
      .mockReturnValueOnce('john@example.com');

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('below recommended');
  });

  test('execute returns fail when git is not installed', async () => {
    execSync.mockImplementation(() => { throw new Error('command not found'); });

    const result = await check.execute({});

    expect(result.status).toBe('fail');
    expect(result.message).toContain('Git is not installed');
  });

  test('execute returns warning when version cannot be parsed', async () => {
    execSync.mockReturnValueOnce('git version unknown');

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('Could not determine Git version');
  });

  test('execute returns warning when user.name not configured', async () => {
    execSync
      .mockImplementationOnce(() => 'git version 2.39.3')
      .mockImplementationOnce(() => { throw new Error('no config'); })  // user.name
      .mockImplementationOnce(() => 'john@example.com');  // user.email

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('user.name not configured');
  });

  test('execute returns warning when user.email not configured', async () => {
    execSync
      .mockImplementationOnce(() => 'git version 2.39.3')
      .mockImplementationOnce(() => 'John Doe')
      .mockImplementationOnce(() => { throw new Error('no config'); });

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('user.email not configured');
  });

  test('compareVersions works correctly', () => {
    expect(check.compareVersions('2.39.3', '2.20.0')).toBe(1);
    expect(check.compareVersions('2.15.0', '2.20.0')).toBe(-1);
    expect(check.compareVersions('2.20.0', '2.20.0')).toBe(0);
    expect(check.compareVersions('3.0.0', '2.99.99')).toBe(1);
  });

  test('getHealer returns installation guide', () => {
    const healer = check.getHealer();

    expect(healer.name).toBe('git-install-guide');
    expect(healer.steps.length).toBeGreaterThan(0);
    expect(healer.documentation).toContain('git-scm.com');
  });
});

// ============================================================
// IdeDetectionCheck
// ============================================================
describe('IdeDetectionCheck', () => {
  let check;

  beforeEach(() => {
    check = new IdeDetectionCheck();
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('local.ide-detection');
    expect(check.severity).toBe('INFO');
    expect(check.cacheable).toBe(true);
  });

  test('execute returns pass when no IDEs detected', async () => {
    mockFsPromises.stat.mockRejectedValue(new Error('ENOENT'));
    mockFsPromises.access.mockRejectedValue(new Error('ENOENT'));

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('No IDE configuration detected');
  });

  test('execute detects VS Code', async () => {
    mockFsPromises.stat.mockImplementation((dirPath) => {
      if (dirPath.endsWith('.vscode')) {
        return Promise.resolve({ isDirectory: () => true });
      }
      return Promise.reject(new Error('ENOENT'));
    });
    mockFsPromises.access.mockImplementation((filePath) => {
      if (filePath.endsWith('settings.json')) return Promise.resolve();
      return Promise.reject(new Error('ENOENT'));
    });
    mockFsPromises.readFile.mockResolvedValue('{"editor.fontSize": 14}');

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('VS Code');
  });

  test('execute detects JetBrains IDE', async () => {
    mockFsPromises.stat.mockImplementation((dirPath) => {
      if (dirPath.endsWith('.idea')) {
        return Promise.resolve({ isDirectory: () => true });
      }
      return Promise.reject(new Error('ENOENT'));
    });
    mockFsPromises.access.mockImplementation((filePath) => {
      if (filePath.endsWith('workspace.xml')) return Promise.resolve();
      return Promise.reject(new Error('ENOENT'));
    });

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('JetBrains');
  });

  test('execute detects multiple IDEs', async () => {
    mockFsPromises.stat.mockImplementation((dirPath) => {
      if (dirPath.endsWith('.vscode') || dirPath.endsWith('.idea') || dirPath.endsWith('.claude')) {
        return Promise.resolve({ isDirectory: () => true });
      }
      return Promise.reject(new Error('ENOENT'));
    });
    mockFsPromises.access.mockResolvedValue(undefined);
    mockFsPromises.readFile.mockResolvedValue('{}');

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('VS Code');
    expect(result.message).toContain('JetBrains');
    expect(result.message).toContain('Claude Code');
  });

  test('execute warns on invalid VS Code settings.json', async () => {
    mockFsPromises.stat.mockImplementation((dirPath) => {
      if (dirPath.endsWith('.vscode')) {
        return Promise.resolve({ isDirectory: () => true });
      }
      return Promise.reject(new Error('ENOENT'));
    });
    mockFsPromises.access.mockResolvedValue(undefined);
    mockFsPromises.readFile.mockResolvedValue('{ invalid json }');

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('warning');
    expect(result.message).toContain('invalid JSON');
  });

  test('execute detects Claude Code config', async () => {
    mockFsPromises.stat.mockRejectedValue(new Error('ENOENT'));
    mockFsPromises.access.mockImplementation((filePath) => {
      if (filePath.endsWith('.claude')) return Promise.resolve();
      return Promise.reject(new Error('ENOENT'));
    });

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('Claude Code');
  });

  test('execute handles stat returning non-directory', async () => {
    mockFsPromises.stat.mockResolvedValue({ isDirectory: () => false });
    mockFsPromises.access.mockRejectedValue(new Error('ENOENT'));

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('No IDE configuration detected');
  });
});

// ============================================================
// MemoryCheck
// ============================================================
describe('MemoryCheck', () => {
  let check;

  beforeEach(() => {
    check = new MemoryCheck();
    jest.spyOn(process, 'memoryUsage').mockReturnValue({
      heapUsed: 100 * 1024 * 1024,
      heapTotal: 200 * 1024 * 1024,
      external: 10 * 1024 * 1024,
      rss: 300 * 1024 * 1024,
      arrayBuffers: 5 * 1024 * 1024,
    });
  });

  afterEach(() => {
    process.memoryUsage.mockRestore();
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('local.memory');
    expect(check.name).toBe('Memory Availability');
    expect(check.severity).toBe('MEDIUM');
    expect(check.cacheable).toBe(false);
  });

  test('execute returns pass when plenty of memory', async () => {
    os.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024);   // 16 GB total
    os.freemem.mockReturnValue(8 * 1024 * 1024 * 1024);     // 8 GB free

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.message).toContain('Memory OK');
  });

  test('execute returns fail when memory critically low', async () => {
    os.totalmem.mockReturnValue(8 * 1024 * 1024 * 1024);    // 8 GB total
    os.freemem.mockReturnValue(256 * 1024 * 1024);           // 256 MB free

    const result = await check.execute({});

    expect(result.status).toBe('fail');
    expect(result.message).toContain('Low memory');
    expect(result.recommendation).toContain('Close unused applications');
  });

  test('execute returns warning when memory low', async () => {
    os.totalmem.mockReturnValue(8 * 1024 * 1024 * 1024);    // 8 GB total
    os.freemem.mockReturnValue(700 * 1024 * 1024);           // 700 MB free

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('running low');
  });

  test('execute returns warning on high usage percentage', async () => {
    os.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024);   // 16 GB total
    os.freemem.mockReturnValue(1.4 * 1024 * 1024 * 1024);   // 1.4 GB free (91% used)

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('High memory usage');
  });

  test('formatMemory formats MB correctly', () => {
    expect(check.formatMemory(512)).toBe('512 MB');
  });

  test('formatMemory formats GB correctly', () => {
    expect(check.formatMemory(2048)).toBe('2.0 GB');
    expect(check.formatMemory(1536)).toBe('1.5 GB');
  });

  test('getHealer returns cleanup guide', () => {
    const healer = check.getHealer();

    expect(healer.name).toBe('memory-cleanup-guide');
    expect(healer.action).toBe('manual');
    expect(healer.steps.length).toBeGreaterThan(0);
  });

  test('execute includes node heap details', async () => {
    os.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024);
    os.freemem.mockReturnValue(8 * 1024 * 1024 * 1024);

    const result = await check.execute({});

    expect(result.details.details.nodeHeap).toBe('100 MB');
  });
});

// ============================================================
// NetworkCheck
// ============================================================
describe('NetworkCheck', () => {
  let check;

  beforeEach(() => {
    check = new NetworkCheck();
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('local.network');
    expect(check.severity).toBe('HIGH');
    expect(check.cacheable).toBe(false);
  });

  test('execute returns pass when all checks succeed', async () => {
    dns.promises.lookup.mockResolvedValue({ address: '1.2.3.4' });
    https.request.mockImplementation((options, callback) => {
      callback({ statusCode: 200 });
      return { on: jest.fn(), end: jest.fn(), destroy: jest.fn() };
    });

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.message).toBe('Network connectivity OK');
  });

  test('execute returns warning when DNS fails but endpoints work', async () => {
    dns.promises.lookup.mockRejectedValue(new Error('DNS error'));
    https.request.mockImplementation((options, callback) => {
      callback({ statusCode: 200 });
      return { on: jest.fn(), end: jest.fn(), destroy: jest.fn() };
    });

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('DNS resolution');
  });

  test('execute returns fail when all checks fail', async () => {
    dns.promises.lookup.mockRejectedValue(new Error('DNS error'));
    https.request.mockImplementation((_options, _callback) => {
      const req = {
        on: jest.fn((event, handler) => {
          if (event === 'error') {
            process.nextTick(() => handler(new Error('connection refused')));
          }
        }),
        end: jest.fn(),
        destroy: jest.fn(),
      };
      return req;
    });

    const result = await check.execute({});

    expect(result.status).toBe('fail');
    expect(result.message).toContain('No network connectivity');
  });

  test('execute returns warning when some endpoints fail', async () => {
    dns.promises.lookup.mockResolvedValue({ address: '1.2.3.4' });
    let callCount = 0;
    https.request.mockImplementation((options, callback) => {
      callCount++;
      if (callCount === 1) {
        // First endpoint succeeds
        callback({ statusCode: 200 });
        return { on: jest.fn(), end: jest.fn(), destroy: jest.fn() };
      }
      // Second endpoint fails
      const req = {
        on: jest.fn((event, handler) => {
          if (event === 'error') {
            process.nextTick(() => handler(new Error('timeout')));
          }
        }),
        end: jest.fn(),
        destroy: jest.fn(),
      };
      return req;
    });

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('unreachable');
  });

  test('checkEndpoint resolves with response time on success', async () => {
    https.request.mockImplementation((options, callback) => {
      callback({ statusCode: 200 });
      return { on: jest.fn(), end: jest.fn(), destroy: jest.fn() };
    });

    const time = await check.checkEndpoint('example.com', '/');

    expect(typeof time).toBe('number');
    expect(time).toBeGreaterThanOrEqual(0);
  });

  test('checkEndpoint rejects on HTTP error status', async () => {
    https.request.mockImplementation((options, callback) => {
      callback({ statusCode: 500 });
      return { on: jest.fn(), end: jest.fn(), destroy: jest.fn() };
    });

    await expect(check.checkEndpoint('example.com', '/')).rejects.toThrow('HTTP 500');
  });

  test('checkEndpoint rejects on timeout', async () => {
    https.request.mockImplementation((_options, _callback) => {
      const req = {
        on: jest.fn((event, handler) => {
          if (event === 'timeout') {
            process.nextTick(() => handler());
          }
        }),
        end: jest.fn(),
        destroy: jest.fn(),
      };
      return req;
    });

    await expect(check.checkEndpoint('example.com', '/')).rejects.toThrow('Timeout');
  });

  test('getHealer returns troubleshooting guide', () => {
    const healer = check.getHealer();

    expect(healer.name).toBe('network-troubleshoot-guide');
    expect(healer.steps.length).toBeGreaterThan(0);
  });
});

// ============================================================
// NpmInstallCheck
// ============================================================
describe('NpmInstallCheck', () => {
  let check;

  beforeEach(() => {
    check = new NpmInstallCheck();
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('local.npm-install');
    expect(check.severity).toBe('CRITICAL');
  });

  test('execute returns pass when npm is installed and working', async () => {
    execSync
      .mockReturnValueOnce('10.2.0')   // npm --version
      .mockReturnValueOnce('')           // npm ping
      .mockReturnValueOnce('https://registry.npmjs.org/');  // npm config get registry

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.message).toContain('npm 10.2.0 installed and working');
    expect(result.details.details.registry).toBe('https://registry.npmjs.org/');
  });

  test('execute returns warning when npm version is old', async () => {
    execSync.mockReturnValueOnce('7.0.0');

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('below recommended');
  });

  test('execute returns fail when npm is not installed', async () => {
    execSync.mockImplementation(() => { throw new Error('command not found'); });

    const result = await check.execute({});

    expect(result.status).toBe('fail');
    expect(result.message).toContain('npm is not installed');
  });

  test('execute returns warning when registry is unreachable', async () => {
    execSync
      .mockReturnValueOnce('10.2.0')
      .mockImplementationOnce(() => { throw new Error('npm ping failed'); });

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('registry unreachable');
  });

  test('execute handles registry config failure gracefully', async () => {
    execSync
      .mockReturnValueOnce('10.2.0')
      .mockReturnValueOnce('')  // npm ping
      .mockImplementationOnce(() => { throw new Error('config failed'); });

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.details.details.registry).toBe('https://registry.npmjs.org/');
  });

  test('compareVersions works correctly', () => {
    expect(check.compareVersions('10.2.0', '8.0.0')).toBe(1);
    expect(check.compareVersions('7.0.0', '8.0.0')).toBe(-1);
    expect(check.compareVersions('8.0.0', '8.0.0')).toBe(0);
  });

  test('getHealer returns npm install guide', () => {
    const healer = check.getHealer();

    expect(healer.name).toBe('npm-install-guide');
    expect(healer.steps.length).toBeGreaterThan(0);
  });
});

// ============================================================
// ShellEnvironmentCheck
// ============================================================
describe('ShellEnvironmentCheck', () => {
  let check;
  let origEnv;

  beforeEach(() => {
    origEnv = { ...process.env };
    check = new ShellEnvironmentCheck();
  });

  afterEach(() => {
    process.env = origEnv;
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('local.shell-environment');
    expect(check.severity).toBe('LOW');
    expect(check.cacheable).toBe(true);
  });

  test('execute returns pass on Unix with good shell', async () => {
    os.platform.mockReturnValue('darwin');
    os.arch.mockReturnValue('arm64');
    process.env.SHELL = '/bin/zsh';
    process.env.USER = 'testuser';
    process.env.PATH = '/usr/local/bin:/usr/bin:/bin';
    process.env.LANG = 'en_US.UTF-8';

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.message).toContain('/bin/zsh');
  });

  test('execute returns warning when using basic sh', async () => {
    os.platform.mockReturnValue('linux');
    os.arch.mockReturnValue('x64');
    process.env.SHELL = '/bin/sh';
    process.env.USER = 'testuser';
    process.env.PATH = '/usr/local/bin:/usr/bin:/bin';
    process.env.LANG = 'en_US.UTF-8';

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('basic sh');
  });

  test('execute returns warning when PATH has few entries', async () => {
    os.platform.mockReturnValue('darwin');
    os.arch.mockReturnValue('arm64');
    process.env.SHELL = '/bin/zsh';
    process.env.USER = 'testuser';
    process.env.PATH = '/usr/bin:/bin';
    process.env.LANG = 'en_US.UTF-8';

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('few entries');
  });

  test('execute returns warning when locale not UTF-8', async () => {
    os.platform.mockReturnValue('linux');
    os.arch.mockReturnValue('x64');
    process.env.SHELL = '/bin/bash';
    process.env.USER = 'testuser';
    process.env.PATH = '/usr/local/bin:/usr/bin:/bin';
    delete process.env.LANG;
    delete process.env.LC_ALL;

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('UTF-8');
  });

  test('execute handles Windows platform', async () => {
    os.platform.mockReturnValue('win32');
    os.arch.mockReturnValue('x64');
    process.env.ComSpec = 'C:\\Windows\\System32\\cmd.exe';
    process.env.USERNAME = 'testuser';
    process.env.PATH = 'C:\\Windows\\System32;C:\\Windows;C:\\Program Files\\nodejs';
    execSync.mockReturnValue('test');

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.details.details.powershellAvailable).toBe(true);
  });

  test('execute handles Windows without PowerShell', async () => {
    os.platform.mockReturnValue('win32');
    os.arch.mockReturnValue('x64');
    process.env.ComSpec = 'C:\\Windows\\System32\\cmd.exe';
    process.env.USERNAME = 'testuser';
    process.env.PATH = 'C:\\Windows\\System32;C:\\Windows;C:\\Program Files\\nodejs';
    execSync.mockImplementation(() => { throw new Error('not found'); });

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.details.details.powershellAvailable).toBe(false);
  });
});
