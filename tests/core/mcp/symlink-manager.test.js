/**
 * Unit tests for symlink-manager module
 *
 * @module tests/core/mcp/symlink-manager
 * @story 2.11 - MCP System Global
 */

const path = require('path');

// Mock dependencies before requiring the module
jest.mock('fs');
jest.mock('child_process');
jest.mock('../../../.aios-core/core/mcp/os-detector', () => ({
  isWindows: jest.fn(() => false),
  getGlobalMcpDir: jest.fn(() => '/home/user/.aios/mcp'),
  getLinkType: jest.fn(() => 'symlink'),
}));

const fs = require('fs');
const { execSync } = require('child_process');
const { isWindows, getGlobalMcpDir, getLinkType } = require('../../../.aios-core/core/mcp/os-detector');

const {
  LINK_STATUS,
  getProjectMcpPath,
  isLink,
  isWindowsJunction,
  getLinkTarget,
  checkLinkStatus,
  createLink,
  removeLink,
} = require('../../../.aios-core/core/mcp/symlink-manager');

describe('symlink-manager', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Restore default mock return values
    isWindows.mockReturnValue(false);
    getGlobalMcpDir.mockReturnValue('/home/user/.aios/mcp');
    getLinkType.mockReturnValue('symlink');
  });

  // --- LINK_STATUS enum ---

  describe('LINK_STATUS', () => {
    it('should define LINKED status', () => {
      expect(LINK_STATUS.LINKED).toBe('linked');
    });

    it('should define NOT_LINKED status', () => {
      expect(LINK_STATUS.NOT_LINKED).toBe('not_linked');
    });

    it('should define BROKEN status', () => {
      expect(LINK_STATUS.BROKEN).toBe('broken');
    });

    it('should define DIRECTORY status', () => {
      expect(LINK_STATUS.DIRECTORY).toBe('directory');
    });

    it('should define ERROR status', () => {
      expect(LINK_STATUS.ERROR).toBe('error');
    });

    it('should have exactly 5 status values', () => {
      expect(Object.keys(LINK_STATUS)).toHaveLength(5);
    });
  });

  // --- getProjectMcpPath ---

  describe('getProjectMcpPath', () => {
    it('should return correct path for given project root', () => {
      const result = getProjectMcpPath('/my/project');
      expect(result).toBe(path.join('/my/project', '.aios-core', 'tools', 'mcp'));
    });

    it('should default to process.cwd() when no argument is provided', () => {
      const result = getProjectMcpPath();
      expect(result).toBe(path.join(process.cwd(), '.aios-core', 'tools', 'mcp'));
    });

    it('should handle project root with trailing separator', () => {
      const result = getProjectMcpPath('/my/project/');
      expect(result).toBe(path.join('/my/project/', '.aios-core', 'tools', 'mcp'));
    });
  });

  // --- isLink ---

  describe('isLink', () => {
    it('should return true when lstatSync reports symbolic link', () => {
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
      expect(isLink('/some/link')).toBe(true);
    });

    it('should return false when lstatSync reports non-symlink', () => {
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => false });
      expect(isLink('/some/dir')).toBe(false);
    });

    it('should return false on lstatSync error (non-Windows)', () => {
      fs.lstatSync.mockImplementation(() => { throw new Error('ENOENT'); });
      isWindows.mockReturnValue(false);
      expect(isLink('/missing/path')).toBe(false);
    });

    it('should fall back to isWindowsJunction on lstatSync error when on Windows', () => {
      fs.lstatSync.mockImplementation(() => { throw new Error('ENOENT'); });
      isWindows.mockReturnValue(true);
      execSync.mockReturnValue('Symbolic Link');
      expect(isLink('/some/junction')).toBe(true);
    });

    it('should return false on Windows when junction check also fails', () => {
      fs.lstatSync.mockImplementation(() => { throw new Error('ENOENT'); });
      isWindows.mockReturnValue(true);
      execSync.mockImplementation(() => { throw new Error('not a reparse point'); });
      expect(isLink('/some/path')).toBe(false);
    });
  });

  // --- isWindowsJunction ---

  describe('isWindowsJunction', () => {
    it('should return false when not on Windows', () => {
      isWindows.mockReturnValue(false);
      expect(isWindowsJunction('/some/path')).toBe(false);
    });

    it('should return true when fsutil reports Symbolic Link', () => {
      isWindows.mockReturnValue(true);
      execSync.mockReturnValue('Reparse Tag: Symbolic Link');
      expect(isWindowsJunction('C:\\some\\link')).toBe(true);
    });

    it('should return true when fsutil reports Mount Point', () => {
      isWindows.mockReturnValue(true);
      execSync.mockReturnValue('Reparse Tag: Mount Point');
      expect(isWindowsJunction('C:\\some\\junction')).toBe(true);
    });

    it('should return false when fsutil output does not match', () => {
      isWindows.mockReturnValue(true);
      execSync.mockReturnValue('No reparse point data');
      expect(isWindowsJunction('C:\\some\\dir')).toBe(false);
    });

    it('should return false when execSync throws', () => {
      isWindows.mockReturnValue(true);
      execSync.mockImplementation(() => { throw new Error('Access denied'); });
      expect(isWindowsJunction('C:\\some\\path')).toBe(false);
    });

    it('should call execSync with correct fsutil command', () => {
      isWindows.mockReturnValue(true);
      execSync.mockReturnValue('');
      isWindowsJunction('C:\\my\\path');
      expect(execSync).toHaveBeenCalledWith(
        'fsutil reparsepoint query "C:\\my\\path"',
        expect.objectContaining({
          encoding: 'utf8',
          windowsHide: true,
        })
      );
    });
  });

  // --- getLinkTarget ---

  describe('getLinkTarget', () => {
    it('should return target from readlinkSync', () => {
      fs.readlinkSync.mockReturnValue('/home/user/.aios/mcp');
      expect(getLinkTarget('/some/link')).toBe('/home/user/.aios/mcp');
    });

    it('should return null on readlinkSync error (non-Windows)', () => {
      fs.readlinkSync.mockImplementation(() => { throw new Error('EINVAL'); });
      isWindows.mockReturnValue(false);
      expect(getLinkTarget('/some/path')).toBeNull();
    });

    it('should fall back to Windows junction target on readlinkSync error', () => {
      fs.readlinkSync.mockImplementation(() => { throw new Error('EINVAL'); });
      isWindows.mockReturnValue(true);
      execSync.mockReturnValue('Print Name: C:\\Users\\user\\.aios\\mcp\n');
      expect(getLinkTarget('C:\\some\\link')).toBe('C:\\Users\\user\\.aios\\mcp');
    });

    it('should parse Substitute Name when Print Name is not found', () => {
      fs.readlinkSync.mockImplementation(() => { throw new Error('EINVAL'); });
      isWindows.mockReturnValue(true);
      execSync.mockReturnValue('Substitute Name: \\\\?\\C:\\Users\\user\\.aios\\mcp\n');
      expect(getLinkTarget('C:\\some\\link')).toBe('C:\\Users\\user\\.aios\\mcp');
    });

    it('should return null when Windows junction target cannot be parsed', () => {
      fs.readlinkSync.mockImplementation(() => { throw new Error('EINVAL'); });
      isWindows.mockReturnValue(true);
      execSync.mockReturnValue('Some unrecognized output');
      expect(getLinkTarget('C:\\some\\link')).toBeNull();
    });

    it('should return null when Windows and execSync throws', () => {
      fs.readlinkSync.mockImplementation(() => { throw new Error('EINVAL'); });
      isWindows.mockReturnValue(true);
      execSync.mockImplementation(() => { throw new Error('fail'); });
      expect(getLinkTarget('C:\\some\\link')).toBeNull();
    });
  });

  // --- checkLinkStatus ---

  describe('checkLinkStatus', () => {
    const projectRoot = '/my/project';
    const linkPath = path.join(projectRoot, '.aios-core', 'tools', 'mcp');
    const toolsDir = path.join(projectRoot, '.aios-core', 'tools');
    const globalPath = '/home/user/.aios/mcp';

    it('should return NOT_LINKED when tools directory does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = checkLinkStatus(projectRoot);
      expect(result.status).toBe(LINK_STATUS.NOT_LINKED);
      expect(result.message).toBe('Tools directory does not exist');
      expect(result.linkPath).toBe(linkPath);
      expect(result.globalPath).toBe(globalPath);
    });

    it('should return NOT_LINKED when link path does not exist', () => {
      fs.existsSync.mockImplementation((p) => {
        if (p === toolsDir) return true;
        if (p === linkPath) return false;
        return false;
      });

      const result = checkLinkStatus(projectRoot);
      expect(result.status).toBe(LINK_STATUS.NOT_LINKED);
      expect(result.message).toBe('MCP link does not exist');
    });

    it('should return LINKED when symlink points to global MCP dir', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
      fs.readlinkSync.mockReturnValue(globalPath);

      const result = checkLinkStatus(projectRoot);
      expect(result.status).toBe(LINK_STATUS.LINKED);
      expect(result.target).toBe(globalPath);
      expect(result.message).toBe('Linked to global MCP config');
    });

    it('should return BROKEN when symlink points to different location', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
      fs.readlinkSync.mockReturnValue('/some/other/path');

      const result = checkLinkStatus(projectRoot);
      expect(result.status).toBe(LINK_STATUS.BROKEN);
      expect(result.target).toBe('/some/other/path');
      expect(result.message).toContain('Link points to different location');
    });

    it('should return BROKEN when link target cannot be resolved', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
      fs.readlinkSync.mockImplementation(() => { throw new Error('EINVAL'); });
      isWindows.mockReturnValue(false);

      const result = checkLinkStatus(projectRoot);
      expect(result.status).toBe(LINK_STATUS.BROKEN);
      expect(result.message).toBe('Could not resolve link target');
    });

    it('should return DIRECTORY when path exists as regular directory', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => false });

      const result = checkLinkStatus(projectRoot);
      expect(result.status).toBe(LINK_STATUS.DIRECTORY);
      expect(result.message).toBe('Path exists as regular directory (not linked)');
    });

    it('should include link type from getLinkType()', () => {
      fs.existsSync.mockReturnValue(false);
      getLinkType.mockReturnValue('junction');

      const result = checkLinkStatus(projectRoot);
      expect(result.type).toBe('junction');
    });
  });

  // --- createLink ---

  describe('createLink', () => {
    const projectRoot = '/my/project';
    const linkPath = path.join(projectRoot, '.aios-core', 'tools', 'mcp');
    const toolsDir = path.join(projectRoot, '.aios-core', 'tools');
    const globalPath = '/home/user/.aios/mcp';

    it('should fail when global MCP directory does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = createLink(projectRoot);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Global MCP directory does not exist');
    });

    it('should create tools directory if it does not exist', () => {
      let symlinkCreated = false;

      fs.existsSync.mockImplementation((p) => {
        if (p === globalPath) return true;
        if (p === toolsDir) return !symlinkCreated ? false : true;
        if (p === linkPath) return symlinkCreated;
        return false;
      });
      fs.mkdirSync.mockReturnValue(undefined);
      fs.symlinkSync.mockImplementation(() => { symlinkCreated = true; });
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
      fs.readlinkSync.mockReturnValue(globalPath);

      const result = createLink(projectRoot);
      expect(fs.mkdirSync).toHaveBeenCalledWith(toolsDir, { recursive: true });
      expect(result.success).toBe(true);
    });

    it('should fail when tools directory creation fails', () => {
      fs.existsSync.mockImplementation((p) => {
        if (p === globalPath) return true;
        if (p === toolsDir) return false;
        return false;
      });
      fs.mkdirSync.mockImplementation(() => { throw new Error('EACCES'); });

      const result = createLink(projectRoot);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not create tools directory');
    });

    it('should return success with alreadyLinked when already properly linked', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
      fs.readlinkSync.mockReturnValue(globalPath);

      const result = createLink(projectRoot);
      expect(result.success).toBe(true);
      expect(result.alreadyLinked).toBe(true);
    });

    it('should fail when path exists and force is not set', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => false });

      const result = createLink(projectRoot, { force: false });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Use --force to overwrite');
    });

    it('should backup and fail when force is set on directory with config', () => {
      const configFile = path.join(linkPath, 'global-config.json');

      fs.existsSync.mockImplementation((p) => {
        if (p === globalPath) return true;
        if (p === toolsDir) return true;
        if (p === linkPath) return true;
        if (p === configFile) return true;
        return false;
      });
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => false });
      fs.renameSync.mockReturnValue(undefined);

      const result = createLink(projectRoot, { force: true });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Existing config backed up');
      expect(fs.renameSync).toHaveBeenCalled();
    });

    it('should remove existing directory with force when no config file', () => {
      const configFile = path.join(linkPath, 'global-config.json');

      fs.existsSync.mockImplementation((p) => {
        if (p === globalPath) return true;
        if (p === toolsDir) return true;
        if (p === linkPath) return true;
        if (p === configFile) return false;
        return true;
      });

      let callCount = 0;
      fs.lstatSync.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) return { isSymbolicLink: () => false };
        return { isSymbolicLink: () => true };
      });
      fs.rmSync.mockReturnValue(undefined);
      fs.symlinkSync.mockReturnValue(undefined);
      fs.readlinkSync.mockReturnValue(globalPath);

      const result = createLink(projectRoot, { force: true });
      expect(fs.rmSync).toHaveBeenCalledWith(linkPath, { recursive: true });
    });

    it('should remove existing symlink with force and create new one', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });

      let readlinkCount = 0;
      fs.readlinkSync.mockImplementation(() => {
        readlinkCount++;
        if (readlinkCount <= 2) return '/wrong/target';
        return globalPath;
      });
      fs.unlinkSync.mockReturnValue(undefined);
      fs.symlinkSync.mockReturnValue(undefined);

      const result = createLink(projectRoot, { force: true });
      expect(fs.unlinkSync).toHaveBeenCalledWith(linkPath);
    });

    it('should create symlink on Unix systems', () => {
      let symlinkCreated = false;

      fs.existsSync.mockImplementation((p) => {
        if (p === globalPath) return true;
        if (p === toolsDir) return true;
        if (p === linkPath) return symlinkCreated;
        return false;
      });
      fs.symlinkSync.mockImplementation(() => { symlinkCreated = true; });
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
      fs.readlinkSync.mockReturnValue(globalPath);

      const result = createLink(projectRoot);
      expect(fs.symlinkSync).toHaveBeenCalledWith(globalPath, linkPath, 'dir');
      expect(result.success).toBe(true);
    });

    it('should create junction on Windows systems', () => {
      isWindows.mockReturnValue(true);
      let junctionCreated = false;

      fs.existsSync.mockImplementation((p) => {
        if (p === globalPath) return true;
        if (p === toolsDir) return true;
        if (p === linkPath) return junctionCreated;
        return false;
      });

      fs.lstatSync.mockImplementation(() => { throw new Error('ENOENT'); });
      fs.readlinkSync.mockImplementation(() => { throw new Error('EINVAL'); });

      execSync.mockImplementation((cmd) => {
        if (cmd.includes('mklink')) {
          junctionCreated = true;
          return '';
        }
        if (cmd.includes('fsutil')) return 'Mount Point\nPrint Name: /home/user/.aios/mcp\n';
        return '';
      });

      const result = createLink(projectRoot);
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('mklink /J'),
        expect.objectContaining({ windowsHide: true })
      );
    });

    it('should fail when symlink creation throws', () => {
      fs.existsSync.mockImplementation((p) => {
        if (p === globalPath) return true;
        if (p === toolsDir) return true;
        if (p === linkPath) return false;
        return false;
      });
      fs.symlinkSync.mockImplementation(() => { throw new Error('EPERM'); });

      const result = createLink(projectRoot);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not create link');
    });

    it('should include Unix hint on creation failure (non-Windows)', () => {
      isWindows.mockReturnValue(false);
      fs.existsSync.mockImplementation((p) => {
        if (p === globalPath) return true;
        if (p === toolsDir) return true;
        if (p === linkPath) return false;
        return false;
      });
      fs.symlinkSync.mockImplementation(() => { throw new Error('EPERM'); });

      const result = createLink(projectRoot);
      expect(result.hint).toBe('Check directory permissions');
    });

    it('should include Windows hint on creation failure', () => {
      isWindows.mockReturnValue(true);
      fs.existsSync.mockImplementation((p) => {
        if (p === globalPath) return true;
        if (p === toolsDir) return true;
        if (p === linkPath) return false;
        return false;
      });
      execSync.mockImplementation(() => { throw new Error('Access denied'); });

      const result = createLink(projectRoot);
      expect(result.hint).toBe('Try running as Administrator or enable Developer Mode');
    });

    it('should return verification failure when link created but verification fails', () => {
      let symlinkCreated = false;

      fs.existsSync.mockImplementation((p) => {
        if (p === globalPath) return true;
        if (p === toolsDir) return true;
        if (p === linkPath) return symlinkCreated;
        return false;
      });

      fs.symlinkSync.mockImplementation(() => { symlinkCreated = true; });

      // After symlink creation, lstatSync reports it as non-symlink (verification fails)
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => false });

      const result = createLink(projectRoot);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Link created but verification failed');
    });
  });

  // --- removeLink ---

  describe('removeLink', () => {
    const projectRoot = '/my/project';
    const linkPath = path.join(projectRoot, '.aios-core', 'tools', 'mcp');

    it('should return success with alreadyRemoved when not linked', () => {
      fs.existsSync.mockReturnValue(false);

      const result = removeLink(projectRoot);
      expect(result.success).toBe(true);
      expect(result.alreadyRemoved).toBe(true);
    });

    it('should fail when path is a directory (not a link)', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => false });

      const result = removeLink(projectRoot);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Path is a directory, not a link. Cannot remove.');
    });

    it('should remove symlink on Unix', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
      fs.readlinkSync.mockReturnValue('/home/user/.aios/mcp');
      fs.unlinkSync.mockReturnValue(undefined);
      isWindows.mockReturnValue(false);

      const result = removeLink(projectRoot);
      expect(result.success).toBe(true);
      expect(fs.unlinkSync).toHaveBeenCalledWith(linkPath);
    });

    it('should remove junction on Windows using rmdir', () => {
      isWindows.mockReturnValue(true);

      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockImplementation(() => { throw new Error('ENOENT'); });
      fs.readlinkSync.mockImplementation(() => { throw new Error('EINVAL'); });
      getGlobalMcpDir.mockReturnValue('C:\\global\\mcp');

      execSync.mockImplementation((cmd) => {
        if (cmd.includes('fsutil')) return 'Mount Point\nPrint Name: C:\\global\\mcp\n';
        return '';
      });

      const result = removeLink(projectRoot);
      expect(result.success).toBe(true);
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('rmdir'),
        expect.objectContaining({ windowsHide: true })
      );
    });

    it('should fail when unlinkSync throws', () => {
      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockReturnValue({ isSymbolicLink: () => true });
      fs.readlinkSync.mockReturnValue('/home/user/.aios/mcp');
      fs.unlinkSync.mockImplementation(() => { throw new Error('EPERM'); });
      isWindows.mockReturnValue(false);

      const result = removeLink(projectRoot);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not remove link');
    });

    it('should fail when Windows rmdir throws', () => {
      isWindows.mockReturnValue(true);

      fs.existsSync.mockReturnValue(true);
      fs.lstatSync.mockImplementation(() => { throw new Error('ENOENT'); });
      fs.readlinkSync.mockImplementation(() => { throw new Error('EINVAL'); });
      getGlobalMcpDir.mockReturnValue('C:\\global\\mcp');

      execSync.mockImplementation((cmd) => {
        if (cmd.includes('fsutil')) return 'Mount Point\nPrint Name: C:\\global\\mcp\n';
        if (cmd.includes('rmdir')) throw new Error('Access denied');
        return '';
      });

      const result = removeLink(projectRoot);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not remove link');
    });

    it('should include linkPath in all results', () => {
      fs.existsSync.mockReturnValue(false);
      const result = removeLink(projectRoot);
      expect(result.linkPath).toBe(linkPath);
    });
  });
});
