/**
 * Unit tests for NodeVersionCheck
 *
 * Tests Node.js version validation: minimum version, engine spec parsing,
 * version comparison, warning thresholds, and healer guide.
 */

const fs = require('fs').promises;
const NodeVersionCheck = require('../../../../../.aios-core/core/health-check/checks/project/node-version');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe('NodeVersionCheck', () => {
  let check;
  const originalVersion = process.version;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new NodeVersionCheck();
  });

  afterAll(() => {
    Object.defineProperty(process, 'version', { value: originalVersion, configurable: true });
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('project.node-version');
    });

    test('has CRITICAL severity', () => {
      expect(check.severity).toBe('CRITICAL');
    });

    test('is cacheable', () => {
      expect(check.cacheable).toBe(true);
    });

    test('has healingTier 3', () => {
      expect(check.healingTier).toBe(3);
    });
  });

  // ============================================================
  // execute - pass (modern Node)
  // ============================================================
  describe('execute - pass', () => {
    test('passes with Node 20+', async () => {
      Object.defineProperty(process, 'version', { value: 'v20.10.0', configurable: true });
      fs.readFile.mockRejectedValue(new Error('no package.json'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('20.10.0');
      expect(result.message).toContain('meets requirements');
    });

    test('passes with Node 22', async () => {
      Object.defineProperty(process, 'version', { value: 'v22.1.0', configurable: true });
      fs.readFile.mockRejectedValue(new Error('no package.json'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });

    test('reads engine version from package.json', async () => {
      Object.defineProperty(process, 'version', { value: 'v20.5.0', configurable: true });
      fs.readFile.mockResolvedValue(JSON.stringify({
        engines: { node: '>=18.0.0' }
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });

  // ============================================================
  // execute - warning (old but valid)
  // ============================================================
  describe('execute - warning', () => {
    test('warns when Node version is 18.x', async () => {
      Object.defineProperty(process, 'version', { value: 'v18.19.0', configurable: true });
      fs.readFile.mockRejectedValue(new Error('no package.json'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('18.19.0');
    });

    test('warns when Node version is 19.x', async () => {
      Object.defineProperty(process, 'version', { value: 'v19.0.0', configurable: true });
      fs.readFile.mockRejectedValue(new Error('no package.json'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.details.recommended).toContain('20.x');
    });
  });

  // ============================================================
  // execute - fail (below minimum)
  // ============================================================
  describe('execute - fail', () => {
    test('fails when Node version is below minimum', async () => {
      Object.defineProperty(process, 'version', { value: 'v16.20.0', configurable: true });
      fs.readFile.mockRejectedValue(new Error('no package.json'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('16.20.0');
      expect(result.message).toContain('below required');
      expect(result.recommendation).toContain('Upgrade');
    });

    test('fails with package.json requiring higher version', async () => {
      Object.defineProperty(process, 'version', { value: 'v18.0.0', configurable: true });
      fs.readFile.mockResolvedValue(JSON.stringify({
        engines: { node: '>=20.0.0' }
      }));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('below required');
    });
  });

  // ============================================================
  // parseEngineVersion
  // ============================================================
  describe('parseEngineVersion', () => {
    test('parses >=18.0.0', () => {
      expect(check.parseEngineVersion('>=18.0.0')).toBe('18.0.0');
    });

    test('parses ^18.0.0', () => {
      expect(check.parseEngineVersion('^18.0.0')).toBe('18.0.0');
    });

    test('parses 18.x', () => {
      expect(check.parseEngineVersion('18.x')).toBe('18.0.0');
    });

    test('parses bare major version', () => {
      expect(check.parseEngineVersion('20')).toBe('20.0.0');
    });

    test('returns default for invalid spec', () => {
      expect(check.parseEngineVersion('latest')).toBe('18.0.0');
    });
  });

  // ============================================================
  // compareVersions
  // ============================================================
  describe('compareVersions', () => {
    test('returns 0 for equal versions', () => {
      expect(check.compareVersions('18.0.0', '18.0.0')).toBe(0);
    });

    test('returns -1 when v1 < v2', () => {
      expect(check.compareVersions('16.0.0', '18.0.0')).toBe(-1);
    });

    test('returns 1 when v1 > v2', () => {
      expect(check.compareVersions('20.0.0', '18.0.0')).toBe(1);
    });

    test('compares minor versions', () => {
      expect(check.compareVersions('18.1.0', '18.2.0')).toBe(-1);
    });

    test('compares patch versions', () => {
      expect(check.compareVersions('18.0.1', '18.0.0')).toBe(1);
    });
  });

  // ============================================================
  // getHealer
  // ============================================================
  describe('getHealer', () => {
    test('returns manual upgrade guide', () => {
      const healer = check.getHealer();
      expect(healer.name).toBe('node-upgrade-guide');
      expect(healer.action).toBe('manual');
      expect(healer.steps.length).toBeGreaterThan(0);
      expect(healer.warning).toContain('nvm');
    });
  });
});
