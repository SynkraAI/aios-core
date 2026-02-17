/**
 * Tests for Dependency Installer Module
 *
 * Story 1.7: Dependency Installation
 * Comprehensive test coverage for package manager detection, installation, retry logic,
 * and offline mode.
 */

const fs = require('fs');
const { spawn } = require('child_process');
const {
  detectPackageManager,
  validatePackageManager,
  hasExistingDependencies,
  installDependencies,
  executeInstall,
  categorizeError,
  installWithRetry,
} = require('../../packages/installer/src/installer/dependency-installer');

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');
jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
  }));
});

describe('Dependency Installer', () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('detectPackageManager (AC1)', () => {
    it('should detect bun from bun.lockb', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.endsWith('bun.lockb');
      });

      const pm = detectPackageManager('/test/project');
      expect(pm).toBe('bun');
    });

    it('should detect pnpm from pnpm-lock.yaml', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.endsWith('pnpm-lock.yaml');
      });

      const pm = detectPackageManager('/test/project');
      expect(pm).toBe('pnpm');
    });

    it('should detect yarn from yarn.lock', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.endsWith('yarn.lock');
      });

      const pm = detectPackageManager('/test/project');
      expect(pm).toBe('yarn');
    });

    it('should detect npm from package-lock.json', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.endsWith('package-lock.json');
      });

      const pm = detectPackageManager('/test/project');
      expect(pm).toBe('npm');
    });

    it('should fallback to npm when no lock file exists', () => {
      fs.existsSync.mockReturnValue(false);

      const pm = detectPackageManager('/test/project');
      expect(pm).toBe('npm');
    });

    it('should respect priority order (bun > pnpm > yarn > npm)', () => {
      fs.existsSync.mockImplementation((filePath) => {
        // Both pnpm and npm lock files exist
        return filePath.endsWith('pnpm-lock.yaml') || filePath.endsWith('package-lock.json');
      });

      const pm = detectPackageManager('/test/project');
      expect(pm).toBe('pnpm'); // pnpm has higher priority
    });
  });

  describe('validatePackageManager (Security - AC1)', () => {
    it('should accept npm', () => {
      expect(() => validatePackageManager('npm')).not.toThrow();
    });

    it('should accept yarn', () => {
      expect(() => validatePackageManager('yarn')).not.toThrow();
    });

    it('should accept pnpm', () => {
      expect(() => validatePackageManager('pnpm')).not.toThrow();
    });

    it('should accept bun', () => {
      expect(() => validatePackageManager('bun')).not.toThrow();
    });

    it('should reject invalid package manager (command injection prevention)', () => {
      expect(() => validatePackageManager('malicious')).toThrow('Invalid package manager');
      expect(() => validatePackageManager('rm -rf /')).toThrow('Invalid package manager');
      expect(() => validatePackageManager('npm && curl')).toThrow('Invalid package manager');
    });
  });

  describe('hasExistingDependencies (AC6 - Offline Mode)', () => {
    it('should return false when node_modules does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = hasExistingDependencies('/test/project');
      expect(result).toBe(false);
    });

    it('should return false when node_modules is empty', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue([]);

      const result = hasExistingDependencies('/test/project');
      expect(result).toBe(false);
    });

    it('should return false when node_modules only has hidden files', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['.bin', '.cache']);

      const result = hasExistingDependencies('/test/project');
      expect(result).toBe(false);
    });

    it('should return true when node_modules has packages', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['.bin', 'lodash', 'express', 'react']);

      const result = hasExistingDependencies('/test/project');
      expect(result).toBe(true);
    });

    it('should return false on readdir error', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = hasExistingDependencies('/test/project');
      expect(result).toBe(false);
    });
  });

  describe('executeInstall (AC2 - Spawn Security)', () => {
    it('should spawn package manager with correct args', async () => {
      const mockChild = {
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 10);
          }
        }),
      };
      spawn.mockReturnValue(mockChild);

      await executeInstall('npm', '/test/project');

      // Windows requires shell: true because npm is actually npm.cmd
      // Unix can use shell: false for better security
      const isWindows = process.platform === 'win32';
      expect(spawn).toHaveBeenCalledWith('npm', ['install'], {
        cwd: '/test/project',
        stdio: 'inherit',
        shell: isWindows, // Windows needs shell, Unix doesn't
      });
    });

    it('should resolve with success on exit code 0', async () => {
      const mockChild = {
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 10);
          }
        }),
      };
      spawn.mockReturnValue(mockChild);

      const result = await executeInstall('npm');
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
    });

    it('should resolve with error on non-zero exit code', async () => {
      const mockChild = {
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(1), 10);
          }
        }),
      };
      spawn.mockReturnValue(mockChild);

      const result = await executeInstall('npm');
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
    });

    it('should handle spawn errors', async () => {
      const mockChild = {
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('ENOENT')), 10);
          }
        }),
      };
      spawn.mockReturnValue(mockChild);

      const result = await executeInstall('npm');
      expect(result.success).toBe(false);
      expect(result.error).toContain('ENOENT');
    });
  });

  describe('categorizeError (AC4 - Error Handling)', () => {
    it('should detect network errors', () => {
      const error1 = categorizeError(new Error('ENOTFOUND registry.npmjs.org'));
      expect(error1.category).toBe('network');
      expect(error1.solution).toContain('internet connection');

      const error2 = categorizeError('ETIMEDOUT');
      expect(error2.category).toBe('network');
    });

    it('should detect permission errors', () => {
      const error = categorizeError(new Error('EACCES: permission denied'));
      expect(error.category).toBe('permission');
      expect(error.solution).toContain('elevated permissions');
    });

    it('should detect disk space errors', () => {
      const error = categorizeError(new Error('ENOSPC: no space left'));
      expect(error.category).toBe('diskspace');
      expect(error.solution).toContain('disk space');
    });

    it('should handle unknown errors', () => {
      const error = categorizeError(new Error('Something weird happened'));
      expect(error.category).toBe('unknown');
    });
  });

  describe('installWithRetry (AC5 - Retry Logic)', () => {
    it('should return immediately on success', async () => {
      const mockChild = {
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
      };
      spawn.mockReturnValue(mockChild);

      const result = await installWithRetry('npm', '/test/project', 3, 1);
      expect(result.success).toBe(true);
      expect(spawn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      let attempts = 0;
      spawn.mockImplementation(() => {
        attempts++;
        return {
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              // First attempt fails, second succeeds
              setTimeout(() => callback(attempts < 2 ? 1 : 0), 10);
            }
          }),
        };
      });

      // Use fake timers for faster test
      jest.useFakeTimers();

      const promise = installWithRetry('npm', '/test/project', 3, 1);

      // Run all timers and wait for promises
      jest.runAllTimers();

      // Restore real timers before awaiting
      jest.useRealTimers();

      const result = await promise;

      expect(spawn).toHaveBeenCalledTimes(2); // First fail, then success
      expect(result.success).toBe(true);
    }, 15000);

    it('should stop after maxRetries', async () => {
      const mockChild = {
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(1), 10);
        }),
      };
      spawn.mockReturnValue(mockChild);

      jest.useFakeTimers();
      const promise = installWithRetry('npm', '/test/project', 3, 3);
      jest.runAllTimers();

      const result = await promise;
      expect(result.success).toBe(false);
      jest.useRealTimers();
    });
  });

  describe('installDependencies (Full Integration)', () => {
    beforeEach(() => {
      fs.existsSync.mockImplementation((filePath) => {
        if (filePath.endsWith('package-lock.json')) return true;
        if (filePath.endsWith('node_modules')) return false;
        return false;
      });
    });

    it('should detect package manager and install (AC1 + AC2)', async () => {
      const mockChild = {
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
      };
      spawn.mockReturnValue(mockChild);

      const result = await installDependencies({
        projectPath: '/test/project',
      });

      expect(result.success).toBe(true);
      expect(result.packageManager).toBe('npm');
    });

    it('should use provided package manager override', async () => {
      const mockChild = {
        on: jest.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
        }),
      };
      spawn.mockReturnValue(mockChild);

      await installDependencies({
        packageManager: 'yarn',
        projectPath: '/test/project',
      });

      expect(spawn).toHaveBeenCalledWith('yarn', ['install'], expect.any(Object));
    });

    it('should skip installation in offline mode (AC6)', async () => {
      fs.existsSync.mockImplementation(() => {
        return true; // Both lock file and node_modules exist
      });
      fs.readdirSync.mockReturnValue(['lodash', 'express']);

      const result = await installDependencies({
        projectPath: '/test/project',
      });

      expect(result.success).toBe(true);
      expect(result.offlineMode).toBe(true);
      expect(spawn).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('offline mode'),
      );
    });

    it('should reject invalid package manager', async () => {
      const result = await installDependencies({
        packageManager: 'malicious-pm',
        projectPath: '/test/project',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid package manager');
    });

    it('should return error info on installation failure (AC4)', async () => {
      const mockChild = {
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(1), 10);
          }
        }),
      };
      spawn.mockReturnValue(mockChild);

      const result = await installDependencies({
        projectPath: '/test/project',
        skipRetry: true,
      });

      expect(result.success).toBe(false);
      expect(result.errorCategory).toBeDefined();
      expect(result.solution).toBeDefined();
    });
  });
});
