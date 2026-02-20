'use strict';

const { checkDependency, checkDockerRunning, DEPENDENCIES, REQUIREMENT } = require('../src/dep-checker');

// Mock execa — in execa v5 CJS, sync function is exported as `sync`
jest.mock('execa', () => ({
  sync: jest.fn(),
}));

const { sync: execaSync } = require('execa');

const mockOsInfo = {
  installInstructions: {
    node: 'brew install node@18',
    git: 'brew install git',
    docker: 'brew install --cask docker',
    gh: 'brew install gh',
  },
};

describe('dep-checker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkDependency - PATH inheritance', () => {
    it('should pass env: process.env to execaSync', () => {
      execaSync.mockReturnValue({ stdout: 'v20.20.0' });

      checkDependency(DEPENDENCIES.node, mockOsInfo);

      expect(execaSync).toHaveBeenCalledWith('node', ['--version'], {
        timeout: 5000,
        reject: false,
        env: process.env,
      });
    });

    it('should detect Node.js installed via nvm (custom PATH)', () => {
      execaSync.mockReturnValue({ stdout: 'v20.20.0' });

      const result = checkDependency(DEPENDENCIES.node, mockOsInfo);

      expect(result.installed).toBe(true);
      expect(result.version).toBe('20.20.0');
      expect(result.meetsMinVersion).toBe(true);
    });

    it('should detect Git installed via Homebrew (custom PATH)', () => {
      execaSync.mockReturnValue({ stdout: 'git version 2.52.0' });

      const result = checkDependency(DEPENDENCIES.git, mockOsInfo);

      expect(result.installed).toBe(true);
      expect(result.version).toBe('2.52.0');
      expect(result.meetsMinVersion).toBe(true);
    });

    it('should handle command not found gracefully', () => {
      execaSync.mockImplementation(() => {
        throw new Error('ENOENT: command not found');
      });

      const result = checkDependency(DEPENDENCIES.node, mockOsInfo);

      expect(result.installed).toBe(false);
      expect(result.error).toContain('ENOENT');
    });

    it('should handle empty stdout', () => {
      execaSync.mockReturnValue({ stdout: '' });

      const result = checkDependency(DEPENDENCIES.node, mockOsInfo);

      expect(result.installed).toBe(false);
      expect(result.version).toBeNull();
    });

    it('should detect version below minimum', () => {
      execaSync.mockReturnValue({ stdout: 'v16.0.0' });

      const result = checkDependency(DEPENDENCIES.node, mockOsInfo);

      expect(result.installed).toBe(true);
      expect(result.version).toBe('16.0.0');
      expect(result.meetsMinVersion).toBe(false);
    });

    it('should handle optional dependencies without minVersion', () => {
      execaSync.mockReturnValue({ stdout: 'Docker version 24.0.7, build afdd53b' });

      const result = checkDependency(DEPENDENCIES.docker, mockOsInfo);

      expect(result.installed).toBe(true);
      expect(result.version).toBe('24.0.7');
      expect(result.meetsMinVersion).toBe(true);
      expect(result.requirement).toBe(REQUIREMENT.OPTIONAL);
    });
  });

  describe('checkDockerRunning - PATH inheritance', () => {
    it('should pass env: process.env to execaSync', () => {
      execaSync.mockReturnValue({ stdout: 'Docker info output', exitCode: 0 });

      checkDockerRunning();

      expect(execaSync).toHaveBeenCalledWith('docker', ['info'], {
        timeout: 10000,
        reject: false,
        env: process.env,
      });
    });

    it('should detect running Docker daemon', () => {
      execaSync.mockReturnValue({ stdout: 'Docker info output', exitCode: 0 });

      const result = checkDockerRunning();

      expect(result.running).toBe(true);
    });

    it('should detect Docker daemon not running', () => {
      execaSync.mockReturnValue({ stdout: '', exitCode: 1 });

      const result = checkDockerRunning();

      expect(result.running).toBe(false);
    });

    it('should handle Docker not installed', () => {
      execaSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });

      const result = checkDockerRunning();

      expect(result.running).toBe(false);
      expect(result.info).toBeNull();
    });
  });
});
