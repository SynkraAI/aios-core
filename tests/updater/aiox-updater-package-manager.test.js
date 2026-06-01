const path = require('path');
const fs = require('fs-extra');
const os = require('os');

describe('AIOXUpdater package manager dispatch', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiox-updater-pm-test-'));
    await fs.ensureDir(path.join(tempDir, '.aiox-core'));
    await fs.ensureDir(path.join(tempDir, '.aiox'));
    await fs.writeJson(path.join(tempDir, 'package.json'), {
      name: 'test-project',
      packageManager: 'pnpm@11.1.3',
    });
    await fs.ensureDir(path.join(tempDir, 'node_modules', '@aiox-squads', 'core', '.aiox-core'));
    await fs.writeJson(path.join(tempDir, 'node_modules', '@aiox-squads', 'core', 'package.json'), {
      name: '@aiox-squads/core',
      version: '5.2.7',
    });
    await fs.writeFile(
      path.join(tempDir, 'node_modules', '@aiox-squads', 'core', '.aiox-core', 'install-manifest.yaml'),
      'version: 5.2.8\n',
      'utf8',
    );
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetModules();
    if (tempDir) {
      await fs.remove(tempDir);
    }
  });

  it('uses pnpm add --save-exact when the project declares pnpm', async () => {
    const execFileSync = jest.fn();

    await jest.isolateModulesAsync(async () => {
      jest.doMock('child_process', () => ({ execFileSync }));
      jest.doMock('../../packages/installer/src/installer/brownfield-upgrader', () => ({
        loadSourceManifest: jest.fn(() => ({
          version: '5.2.8',
          files: [{ path: 'install-manifest.yaml', hash: 'sha256:test' }],
        })),
        loadInstalledManifest: jest.fn(() => null),
        generateUpgradeReport: jest.fn(() => ({})),
        applyUpgrade: jest.fn(async () => ({ success: true, filesInstalled: ['foo'] })),
        updateInstalledManifest: jest.fn(),
      }));

      const { AIOXUpdater } = require('../../packages/installer/src/updater');
      const updater = new AIOXUpdater(tempDir, { verbose: false });

      const result = await updater.applyUpdate('5.2.8');

      expect(result.success).toBe(true);
    });

    expect(execFileSync).toHaveBeenCalledWith(
      'pnpm',
      ['add', '--save-exact', '@aiox-squads/core@5.2.8'],
      expect.objectContaining({ cwd: tempDir }),
    );
  });

  it('uses yarn add --exact when the project lockfile indicates yarn', async () => {
    const execFileSync = jest.fn();
    await fs.writeJson(path.join(tempDir, 'package.json'), { name: 'test-project' });
    await fs.writeFile(path.join(tempDir, 'yarn.lock'), '', 'utf8');

    await jest.isolateModulesAsync(async () => {
      jest.doMock('child_process', () => ({ execFileSync }));
      jest.doMock('../../packages/installer/src/installer/brownfield-upgrader', () => ({
        loadSourceManifest: jest.fn(() => ({
          version: '5.2.8',
          files: [{ path: 'install-manifest.yaml', hash: 'sha256:test' }],
        })),
        loadInstalledManifest: jest.fn(() => null),
        generateUpgradeReport: jest.fn(() => ({})),
        applyUpgrade: jest.fn(async () => ({ success: true, filesInstalled: ['foo'] })),
        updateInstalledManifest: jest.fn(),
      }));

      const { AIOXUpdater } = require('../../packages/installer/src/updater');
      const updater = new AIOXUpdater(tempDir, { verbose: false });

      const result = await updater.applyUpdate('5.2.8');

      expect(result.success).toBe(true);
    });

    expect(execFileSync).toHaveBeenCalledWith(
      'yarn',
      ['add', '--exact', '@aiox-squads/core@5.2.8'],
      expect.objectContaining({ cwd: tempDir }),
    );
  });
});
