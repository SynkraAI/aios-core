/**
 * @fileoverview Tests for ProjectStatusLoader - ADE Story 6.1.2.4
 * @description Unit tests for project status loading and caching
 */

const path = require('path');

// Mock execa before requiring the module
jest.mock('execa', () => jest.fn());

// Mock WorktreeManager
jest.mock('../../.aios-core/infrastructure/scripts/worktree-manager', () => {
  return jest.fn().mockImplementation(() => ({
    list: jest.fn().mockResolvedValue([]),
  }));
});

// Mock fs.promises
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    readFileSync: jest.fn(),
    promises: {
      readFile: jest.fn(),
      writeFile: jest.fn().mockResolvedValue(undefined),
      mkdir: jest.fn().mockResolvedValue(undefined),
      access: jest.fn(),
      readdir: jest.fn(),
      unlink: jest.fn(),
    },
  };
});

// Mock js-yaml
jest.mock('js-yaml', () => ({
  load: jest.fn(),
  dump: jest.fn((obj) => JSON.stringify(obj)),
}));

const execa = require('execa');
const fs = require('fs');
const yaml = require('js-yaml');
const WorktreeManager = require('../../.aios-core/infrastructure/scripts/worktree-manager');
const {
  ProjectStatusLoader,
  loadProjectStatus,
  clearCache,
  formatStatusDisplay,
} = require('../../.aios-core/infrastructure/scripts/project-status-loader');

describe('ProjectStatusLoader', () => {
  const projectRoot = '/test/project';
  let loader;

  beforeEach(() => {
    jest.clearAllMocks();
    loader = new ProjectStatusLoader(projectRoot);

    // Default mocks
    execa.mockResolvedValue({ stdout: '', stderr: '' });
    fs.readFileSync.mockReturnValue(''); // For config loading
    fs.promises.readFile.mockResolvedValue('');
    fs.promises.access.mockResolvedValue(undefined);
    fs.promises.readdir.mockResolvedValue([]);
    yaml.load.mockReturnValue(null);
  });

  describe('constructor', () => {
    it('should use project root from parameter', () => {
      const customLoader = new ProjectStatusLoader('/custom/path');
      expect(customLoader.rootPath).toBe('/custom/path');
    });

    it('should use process.cwd() when no root provided', () => {
      const defaultLoader = new ProjectStatusLoader();
      expect(defaultLoader.rootPath).toBe(process.cwd());
    });

    it('should set default cache TTL to 60 seconds', () => {
      expect(loader.cacheTTL).toBe(60);
    });

    it('should load config and apply settings', () => {
      fs.readFileSync.mockReturnValue('projectStatus:\n  maxModifiedFiles: 10');
      yaml.load.mockReturnValue({
        projectStatus: {
          maxModifiedFiles: 10,
          maxRecentCommits: 5,
        },
      });

      const configuredLoader = new ProjectStatusLoader(projectRoot);
      expect(configuredLoader.maxModifiedFiles).toBe(10);
      expect(configuredLoader.maxRecentCommits).toBe(5);
    });

    it('should use defaults when config not found', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });

      const defaultsLoader = new ProjectStatusLoader(projectRoot);
      expect(defaultsLoader.maxModifiedFiles).toBe(5);
      expect(defaultsLoader.maxRecentCommits).toBe(2);
    });
  });

  describe('isGitRepository', () => {
    it('should return true for git repository', async () => {
      execa.mockResolvedValue({ stdout: 'true', stderr: '' });

      const result = await loader.isGitRepository();

      expect(result).toBe(true);
      expect(execa).toHaveBeenCalledWith(
        'git',
        ['rev-parse', '--is-inside-work-tree'],
        expect.objectContaining({ cwd: projectRoot }),
      );
    });

    it('should return false for non-git directory', async () => {
      execa.mockRejectedValue(new Error('Not a git repo'));

      const result = await loader.isGitRepository();

      expect(result).toBe(false);
    });
  });

  describe('getGitBranch', () => {
    it('should return branch name from git branch --show-current', async () => {
      execa.mockResolvedValue({ stdout: 'main\n', stderr: '' });

      const result = await loader.getGitBranch();

      expect(result).toBe('main');
    });

    it('should fallback to rev-parse for older git', async () => {
      execa
        .mockRejectedValueOnce(new Error('Unknown option'))
        .mockResolvedValueOnce({ stdout: 'develop\n', stderr: '' });

      const result = await loader.getGitBranch();

      expect(result).toBe('develop');
    });

    it('should return "unknown" when both methods fail', async () => {
      execa.mockRejectedValue(new Error('Git error'));

      const result = await loader.getGitBranch();

      expect(result).toBe('unknown');
    });
  });

  describe('getModifiedFiles', () => {
    it('should parse git status porcelain output', async () => {
      const statusOutput = ` M src/index.js
 M src/utils.js
?? new-file.txt`;
      execa.mockResolvedValue({ stdout: statusOutput, stderr: '' });

      const result = await loader.getModifiedFiles();

      expect(result.files).toContain('src/index.js');
      expect(result.files).toContain('src/utils.js');
      expect(result.files).toContain('new-file.txt');
      expect(result.totalCount).toBe(3);
    });

    it('should limit files to maxModifiedFiles', async () => {
      const manyFiles = Array(10)
        .fill(null)
        .map((_, i) => ` M file${i}.js`)
        .join('\n');
      execa.mockResolvedValue({ stdout: manyFiles, stderr: '' });

      const result = await loader.getModifiedFiles();

      expect(result.files.length).toBe(5); // Default maxModifiedFiles
      expect(result.totalCount).toBe(10);
    });

    it('should return empty array on error', async () => {
      execa.mockRejectedValue(new Error('Git error'));

      const result = await loader.getModifiedFiles();

      expect(result.files).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('getRecentCommits', () => {
    it('should parse git log output', async () => {
      const logOutput = `abc1234 feat: add new feature
def5678 fix: bug fix`;
      execa.mockResolvedValue({ stdout: logOutput, stderr: '' });

      const result = await loader.getRecentCommits();

      expect(result).toContain('feat: add new feature');
      expect(result).toContain('fix: bug fix');
    });

    it('should return empty array when no commits', async () => {
      execa.mockResolvedValue({ stdout: '', stderr: '' });

      const result = await loader.getRecentCommits();

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      execa.mockRejectedValue(new Error('No commits'));

      const result = await loader.getRecentCommits();

      expect(result).toEqual([]);
    });
  });

  describe('getWorktreesStatus', () => {
    it('should return null when no worktrees', async () => {
      WorktreeManager.mockImplementation(() => ({
        list: jest.fn().mockResolvedValue([]),
      }));

      const result = await loader.getWorktreesStatus();

      expect(result).toBeNull();
    });

    it('should return worktrees status object', async () => {
      WorktreeManager.mockImplementation(() => ({
        list: jest.fn().mockResolvedValue([
          {
            storyId: 'STORY-42',
            path: '/project/.aios/worktrees/STORY-42',
            branch: 'auto-claude/STORY-42',
            createdAt: new Date('2026-01-29'),
            uncommittedChanges: 3,
            status: 'active',
          },
        ]),
      }));

      const result = await loader.getWorktreesStatus();

      expect(result).toBeDefined();
      expect(result['STORY-42']).toBeDefined();
      expect(result['STORY-42'].branch).toBe('auto-claude/STORY-42');
      expect(result['STORY-42'].uncommittedChanges).toBe(3);
    });

    it('should return null on WorktreeManager error', async () => {
      WorktreeManager.mockImplementation(() => ({
        list: jest.fn().mockRejectedValue(new Error('Not a git repo')),
      }));

      const result = await loader.getWorktreesStatus();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentStoryInfo', () => {
    it('should detect story with InProgress status', async () => {
      fs.promises.access.mockResolvedValue(undefined);
      fs.promises.readdir.mockResolvedValue([
        { name: 'story-42.md', isFile: () => true, isDirectory: () => false },
      ]);
      fs.promises.readFile.mockResolvedValue(`
# Story 42
**Story ID:** STORY-42
**Epic:** Epic 1 - Setup
**Status:** InProgress
      `);

      const result = await loader.getCurrentStoryInfo();

      expect(result.story).toBe('STORY-42');
      expect(result.epic).toBe('Epic 1 - Setup');
    });

    it('should return null when no story in progress', async () => {
      fs.promises.access.mockResolvedValue(undefined);
      fs.promises.readdir.mockResolvedValue([]);

      const result = await loader.getCurrentStoryInfo();

      expect(result.story).toBeNull();
      expect(result.epic).toBeNull();
    });

    it('should return null when stories dir not found', async () => {
      fs.promises.access.mockRejectedValue(new Error('ENOENT'));

      const result = await loader.getCurrentStoryInfo();

      expect(result.story).toBeNull();
    });
  });

  describe('cache', () => {
    describe('loadCache', () => {
      it('should load cache from file', async () => {
        const cached = {
          status: { branch: 'main' },
          timestamp: Date.now(),
          ttl: 60,
        };
        fs.promises.readFile.mockResolvedValue(JSON.stringify(cached));
        yaml.load.mockReturnValue(cached);

        const result = await loader.loadCache();

        expect(result).toEqual(cached);
      });

      it('should return null when cache file not found', async () => {
        fs.promises.readFile.mockRejectedValue(new Error('ENOENT'));

        const result = await loader.loadCache();

        expect(result).toBeNull();
      });
    });

    describe('isCacheValid', () => {
      it('should return true for fresh cache', () => {
        const cache = {
          timestamp: Date.now() - 30000, // 30 seconds ago
          ttl: 60,
        };

        const result = loader.isCacheValid(cache);

        expect(result).toBe(true);
      });

      it('should return false for expired cache', () => {
        const cache = {
          timestamp: Date.now() - 120000, // 2 minutes ago
          ttl: 60,
        };

        const result = loader.isCacheValid(cache);

        expect(result).toBe(false);
      });

      it('should return false for null cache', () => {
        expect(loader.isCacheValid(null)).toBe(false);
        expect(loader.isCacheValid(undefined)).toBe(false);
        expect(loader.isCacheValid({})).toBe(false);
      });
    });

    describe('saveCache', () => {
      it('should write cache to file', async () => {
        const status = { branch: 'main' };

        await loader.saveCache(status);

        expect(fs.promises.mkdir).toHaveBeenCalled();
        expect(fs.promises.writeFile).toHaveBeenCalled();
      });

      it('should handle write errors gracefully', async () => {
        fs.promises.writeFile.mockRejectedValue(new Error('Permission denied'));
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        await loader.saveCache({ branch: 'main' });

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe('clearCache', () => {
      it('should delete cache file', async () => {
        fs.promises.unlink.mockResolvedValue(undefined);

        const result = await loader.clearCache();

        expect(result).toBe(true);
        expect(fs.promises.unlink).toHaveBeenCalledWith(loader.cacheFile);
      });

      it('should return false when file not found', async () => {
        fs.promises.unlink.mockRejectedValue(new Error('ENOENT'));

        const result = await loader.clearCache();

        expect(result).toBe(false);
      });
    });
  });

  describe('loadProjectStatus', () => {
    it('should return cached status if valid', async () => {
      const cachedStatus = { branch: 'cached-branch', isGitRepo: true };
      const cache = {
        status: cachedStatus,
        timestamp: Date.now() - 30000,
        ttl: 60,
      };
      fs.promises.readFile.mockResolvedValue(JSON.stringify(cache));
      yaml.load.mockReturnValue(cache);

      const result = await loader.loadProjectStatus();

      expect(result).toEqual(cachedStatus);
    });

    it('should generate fresh status when cache expired', async () => {
      const expiredCache = {
        status: { branch: 'old' },
        timestamp: Date.now() - 120000,
        ttl: 60,
      };
      fs.promises.readFile.mockResolvedValue(JSON.stringify(expiredCache));
      yaml.load.mockReturnValue(expiredCache);

      execa.mockImplementation((cmd, args) => {
        if (args.includes('--is-inside-work-tree')) {
          return Promise.resolve({ stdout: 'true' });
        }
        if (args.includes('--show-current')) {
          return Promise.resolve({ stdout: 'fresh-branch' });
        }
        return Promise.resolve({ stdout: '' });
      });

      const result = await loader.loadProjectStatus();

      expect(result.branch).toBe('fresh-branch');
    });

    it('should return default status on error', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('Read error'));
      execa.mockRejectedValue(new Error('Git error'));
      fs.promises.writeFile.mockRejectedValue(new Error('Write error'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = await loader.loadProjectStatus();
      consoleSpy.mockRestore();

      // When git fails, returns non-git status (branch: null)
      expect(result.isGitRepo).toBe(false);
      expect(result.branch).toBeNull();
    });
  });

  describe('getNonGitStatus', () => {
    it('should return status for non-git project', () => {
      const status = loader.getNonGitStatus();

      expect(status.branch).toBeNull();
      expect(status.isGitRepo).toBe(false);
      expect(status.modifiedFiles).toEqual([]);
    });
  });

  describe('formatStatusDisplay', () => {
    it('should format git project status', () => {
      const status = {
        isGitRepo: true,
        branch: 'main',
        modifiedFiles: ['file1.js', 'file2.js'],
        modifiedFilesTotalCount: 2,
        recentCommits: ['feat: add feature'],
        currentStory: 'STORY-42',
      };

      const display = loader.formatStatusDisplay(status);

      expect(display).toContain('Branch: main');
      expect(display).toContain('Modified: file1.js, file2.js');
      expect(display).toContain('Recent: feat: add feature');
      expect(display).toContain('Story: STORY-42');
    });

    it('should show truncation message for many files', () => {
      const status = {
        isGitRepo: true,
        branch: 'main',
        modifiedFiles: ['file1.js', 'file2.js'],
        modifiedFilesTotalCount: 10,
      };

      const display = loader.formatStatusDisplay(status);

      expect(display).toContain('...and 8 more');
    });

    it('should show worktrees info', () => {
      const status = {
        isGitRepo: true,
        branch: 'main',
        worktrees: {
          'STORY-42': { status: 'active', uncommittedChanges: 3 },
          'STORY-43': { status: 'active', uncommittedChanges: 0 },
        },
      };

      const display = loader.formatStatusDisplay(status);

      expect(display).toContain('Worktrees: 2/2 active, 1 with changes');
    });

    it('should show message for non-git repo', () => {
      const status = { isGitRepo: false };

      const display = loader.formatStatusDisplay(status);

      expect(display).toContain('Not a git repository');
    });

    it('should show message for no activity', () => {
      const status = {
        isGitRepo: true,
        modifiedFiles: [],
        recentCommits: [],
      };

      const display = loader.formatStatusDisplay(status);

      expect(display).toContain('No recent activity');
    });
  });
});

describe('Module Exports', () => {
  it('should export loadProjectStatus function', () => {
    expect(typeof loadProjectStatus).toBe('function');
  });

  it('should export clearCache function', () => {
    expect(typeof clearCache).toBe('function');
  });

  it('should export formatStatusDisplay function', () => {
    expect(typeof formatStatusDisplay).toBe('function');
  });

  it('should export ProjectStatusLoader class', () => {
    expect(ProjectStatusLoader).toBeDefined();
    expect(typeof ProjectStatusLoader).toBe('function');
  });
});
