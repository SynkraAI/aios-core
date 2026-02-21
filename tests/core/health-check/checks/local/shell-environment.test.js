/**
 * Unit tests for ShellEnvironmentCheck
 *
 * Tests shell environment detection: platform detection, shell type,
 * PATH validation, locale/encoding, and edge cases.
 */

const { execSync } = require('child_process');
const os = require('os');
const ShellEnvironmentCheck = require('../../../../../.aios-core/core/health-check/checks/local/shell-environment');

jest.mock('child_process');
jest.mock('os');

describe('ShellEnvironmentCheck', () => {
  let check;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = {
      ...originalEnv,
      SHELL: '/bin/zsh',
      USER: 'testuser',
      PATH: '/usr/local/bin:/usr/bin:/bin:/sbin',
      LANG: 'en_US.UTF-8',
    };
    os.platform.mockReturnValue('darwin');
    os.arch.mockReturnValue('arm64');
    check = new ShellEnvironmentCheck();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('local.shell-environment');
    });

    test('has LOW severity', () => {
      expect(check.severity).toBe('LOW');
    });
  });

  describe('execute - healthy unix', () => {
    test('passes with proper shell config', async () => {
      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.message).toContain('/bin/zsh');
    });
  });

  describe('execute - basic sh shell', () => {
    test('warns when using basic sh', async () => {
      process.env.SHELL = '/bin/sh';

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('sh shell');
    });
  });

  describe('execute - few PATH entries', () => {
    test('warns when PATH has very few entries', async () => {
      process.env.PATH = '/usr/bin:/bin';

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('PATH');
    });
  });

  describe('execute - no UTF-8 locale', () => {
    test('warns when locale not UTF-8', async () => {
      process.env.LANG = 'C';
      delete process.env.LC_ALL;

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('UTF-8');
    });
  });

  describe('execute - windows', () => {
    test('detects windows shell', async () => {
      os.platform.mockReturnValue('win32');
      process.env.ComSpec = 'C:\\Windows\\System32\\cmd.exe';
      process.env.USERNAME = 'winuser';
      process.env.PATH = 'C:\\Windows;C:\\Windows\\System32;C:\\Node';

      execSync.mockReturnValue('test');

      const result = await check.execute({});
      expect(result.status).toBe('pass');
    });
  });

  describe('execute - no SHELL env', () => {
    test('falls back to /bin/sh when SHELL not set', async () => {
      delete process.env.SHELL;

      const result = await check.execute({});
      expect(result.status).toBe('warning');
    });
  });
});
