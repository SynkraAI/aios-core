/**
 * Unit tests for os-detector
 *
 * Tests cross-platform OS detection, path utilities, OS info,
 * symlink support detection, and link type selection.
 */

jest.mock('os');

const os = require('os');

const {
  OS_TYPES,
  detectOS,
  isWindows,
  isMacOS,
  isLinux,
  isUnix,
  getHomeDir,
  getGlobalAiosDir,
  getGlobalMcpDir,
  getGlobalConfigPath,
  getServersDir,
  getCacheDir,
  getCredentialsDir,
  getOSInfo,
  hasWindowsSymlinkSupport,
  getLinkType,
} = require('../../../.aios-core/core/mcp/os-detector');

describe('os-detector', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    os.homedir.mockReturnValue('/home/user');
  });

  describe('OS_TYPES', () => {
    test('defines all OS types', () => {
      expect(OS_TYPES.WINDOWS).toBe('windows');
      expect(OS_TYPES.MACOS).toBe('macos');
      expect(OS_TYPES.LINUX).toBe('linux');
      expect(OS_TYPES.UNKNOWN).toBe('unknown');
    });
  });

  describe('detectOS', () => {
    test('detects Windows', () => {
      os.platform.mockReturnValue('win32');
      expect(detectOS()).toBe('windows');
    });

    test('detects macOS', () => {
      os.platform.mockReturnValue('darwin');
      expect(detectOS()).toBe('macos');
    });

    test('detects Linux', () => {
      os.platform.mockReturnValue('linux');
      expect(detectOS()).toBe('linux');
    });

    test('returns unknown for unrecognized platform', () => {
      os.platform.mockReturnValue('freebsd');
      expect(detectOS()).toBe('unknown');
    });
  });

  describe('platform checkers', () => {
    test('isWindows returns true on win32', () => {
      os.platform.mockReturnValue('win32');
      expect(isWindows()).toBe(true);
    });

    test('isWindows returns false on darwin', () => {
      os.platform.mockReturnValue('darwin');
      expect(isWindows()).toBe(false);
    });

    test('isMacOS returns true on darwin', () => {
      os.platform.mockReturnValue('darwin');
      expect(isMacOS()).toBe(true);
    });

    test('isMacOS returns false on linux', () => {
      os.platform.mockReturnValue('linux');
      expect(isMacOS()).toBe(false);
    });

    test('isLinux returns true on linux', () => {
      os.platform.mockReturnValue('linux');
      expect(isLinux()).toBe(true);
    });

    test('isLinux returns false on win32', () => {
      os.platform.mockReturnValue('win32');
      expect(isLinux()).toBe(false);
    });

    test('isUnix returns true on darwin', () => {
      os.platform.mockReturnValue('darwin');
      expect(isUnix()).toBe(true);
    });

    test('isUnix returns true on linux', () => {
      os.platform.mockReturnValue('linux');
      expect(isUnix()).toBe(true);
    });

    test('isUnix returns false on win32', () => {
      os.platform.mockReturnValue('win32');
      expect(isUnix()).toBe(false);
    });
  });

  describe('path utilities', () => {
    test('getHomeDir returns os.homedir()', () => {
      expect(getHomeDir()).toBe('/home/user');
    });

    test('getGlobalAiosDir returns ~/.aios', () => {
      expect(getGlobalAiosDir()).toMatch(/\.aios$/);
    });

    test('getGlobalMcpDir returns ~/.aios/mcp', () => {
      expect(getGlobalMcpDir()).toMatch(/\.aios.mcp$/);
    });

    test('getGlobalConfigPath returns global-config.json path', () => {
      expect(getGlobalConfigPath()).toMatch(/global-config\.json$/);
    });

    test('getServersDir returns servers path', () => {
      expect(getServersDir()).toMatch(/servers$/);
    });

    test('getCacheDir returns cache path', () => {
      expect(getCacheDir()).toMatch(/cache$/);
    });

    test('getCredentialsDir returns credentials path', () => {
      expect(getCredentialsDir()).toMatch(/credentials$/);
    });
  });

  describe('getOSInfo', () => {
    test('returns OS information object', () => {
      os.platform.mockReturnValue('darwin');
      os.release.mockReturnValue('23.0.0');
      os.arch.mockReturnValue('arm64');
      const info = getOSInfo();
      expect(info.type).toBe('macos');
      expect(info.platform).toBe('darwin');
      expect(info.release).toBe('23.0.0');
      expect(info.arch).toBe('arm64');
      expect(info.homeDir).toBe('/home/user');
      expect(info.supportsSymlinks).toBe(true);
    });

    test('Windows reports symlink support based on hasWindowsSymlinkSupport', () => {
      os.platform.mockReturnValue('win32');
      os.release.mockReturnValue('10.0.0');
      os.arch.mockReturnValue('x64');
      const info = getOSInfo();
      expect(info.type).toBe('windows');
      expect(info.supportsSymlinks).toBe(true); // junctions always work
    });
  });

  describe('hasWindowsSymlinkSupport', () => {
    test('returns true on non-Windows', () => {
      os.platform.mockReturnValue('darwin');
      expect(hasWindowsSymlinkSupport()).toBe(true);
    });

    test('returns true on Windows (junction support)', () => {
      os.platform.mockReturnValue('win32');
      expect(hasWindowsSymlinkSupport()).toBe(true);
    });
  });

  describe('getLinkType', () => {
    test('returns junction on Windows', () => {
      os.platform.mockReturnValue('win32');
      expect(getLinkType()).toBe('junction');
    });

    test('returns symlink on macOS', () => {
      os.platform.mockReturnValue('darwin');
      expect(getLinkType()).toBe('symlink');
    });

    test('returns symlink on Linux', () => {
      os.platform.mockReturnValue('linux');
      expect(getLinkType()).toBe('symlink');
    });
  });
});
