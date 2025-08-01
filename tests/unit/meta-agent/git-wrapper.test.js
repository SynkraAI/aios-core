const GitWrapper = require('../../../aios-core/utils/git-wrapper');
const { exec } = require('child_process');
const { promisify } = require('util');

// Mock child_process
jest.mock('child_process');
jest.mock('util', () => ({
  ...jest.requireActual('util'),
  promisify: jest.fn()
}));

// Mock chalk to avoid color codes in tests
jest.mock('chalk', () => ({
  green: (text) => text,
  yellow: (text) => text,
  red: (text) => text,
  blue: (text) => text
}));

describe('GitWrapper', () => {
  let gitWrapper;
  let mockExec;

  beforeEach(() => {
    mockExec = jest.fn();
    promisify.mockReturnValue(mockExec);
    gitWrapper = new GitWrapper({ rootPath: '/test/path' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execGit', () => {
    test('should execute git command successfully', async () => {
      mockExec.mockResolvedValue({
        stdout: 'command output\n',
        stderr: ''
      });

      const result = await gitWrapper.execGit('status');
      
      expect(mockExec).toHaveBeenCalledWith('git status', {
        cwd: '/test/path'
      });
      expect(result).toBe('command output');
    });

    test('should handle command errors', async () => {
      mockExec.mockRejectedValue(new Error('Command failed'));

      await expect(gitWrapper.execGit('invalid-command'))
        .rejects.toThrow('Git command failed: Command failed');
    });

    test('should warn on stderr output', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      
      mockExec.mockResolvedValue({
        stdout: 'output',
        stderr: 'warning message'
      });

      await gitWrapper.execGit('status');
      
      expect(consoleWarn).toHaveBeenCalledWith('Git warning: warning message');
      consoleWarn.mockRestore();
    });
  });

  describe('isGitInitialized', () => {
    test('should return true if git is initialized', async () => {
      mockExec.mockResolvedValue({ stdout: 'On branch main', stderr: '' });
      
      const result = await gitWrapper.isGitInitialized();
      
      expect(result).toBe(true);
    });

    test('should return false if git is not initialized', async () => {
      mockExec.mockRejectedValue(new Error('Not a git repository'));
      
      const result = await gitWrapper.isGitInitialized();
      
      expect(result).toBe(false);
    });
  });

  describe('Branch Management', () => {
    test('should get current branch', async () => {
      mockExec.mockResolvedValue({ stdout: 'main\n', stderr: '' });
      
      const branch = await gitWrapper.getCurrentBranch();
      
      expect(branch).toBe('main');
      expect(mockExec).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD', {
        cwd: '/test/path'
      });
    });

    test('should create and checkout new branch', async () => {
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });
      
      await gitWrapper.createBranch('feature/test');
      
      expect(mockExec).toHaveBeenCalledWith('git checkout -b feature/test', {
        cwd: '/test/path'
      });
    });

    test('should create branch without checkout', async () => {
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });
      
      await gitWrapper.createBranch('feature/test', false);
      
      expect(mockExec).toHaveBeenCalledWith('git branch feature/test', {
        cwd: '/test/path'
      });
    });

    test('should handle existing branch', async () => {
      mockExec
        .mockRejectedValueOnce(new Error('branch already exists'))
        .mockResolvedValueOnce({ stdout: '', stderr: '' });
      
      const consoleLog = jest.spyOn(console, 'log').mockImplementation();
      
      await gitWrapper.createBranch('existing-branch');
      
      expect(consoleLog).toHaveBeenCalledWith('Branch already exists: existing-branch');
      expect(mockExec).toHaveBeenCalledTimes(2);
      
      consoleLog.mockRestore();
    });

    test('should create modification branch with timestamp', async () => {
      const mockDate = new Date('2025-01-31T12:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });
      
      const branchName = await gitWrapper.createModificationBranch('enhance-agent');
      
      expect(branchName).toBe('meta-agent/enhance-agent-2025-01-31');
      expect(mockExec).toHaveBeenCalledWith(
        'git checkout -b meta-agent/enhance-agent-2025-01-31',
        { cwd: '/test/path' }
      );
    });
  });

  describe('Staging and Committing', () => {
    test('should stage files', async () => {
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });
      
      await gitWrapper.stageFiles(['file1.js', 'file2.js']);
      
      expect(mockExec).toHaveBeenCalledTimes(2);
      expect(mockExec).toHaveBeenCalledWith('git add "file1.js"', { cwd: '/test/path' });
      expect(mockExec).toHaveBeenCalledWith('git add "file2.js"', { cwd: '/test/path' });
    });

    test('should throw error if no files provided', async () => {
      await expect(gitWrapper.stageFiles([]))
        .rejects.toThrow('No files provided to stage');
    });

    test('should commit with message', async () => {
      mockExec.mockResolvedValue({
        stdout: '[main abc123] Test commit',
        stderr: ''
      });
      
      const hash = await gitWrapper.commit('Test commit');
      
      expect(hash).toBe('abc123');
      expect(mockExec).toHaveBeenCalledWith(
        'git commit -m "Test commit" --author="aios-developer <aios-developer@aios-fullstack.local>" --signoff',
        { cwd: '/test/path' }
      );
    });

    test('should escape quotes in commit message', async () => {
      mockExec.mockResolvedValue({ stdout: '[main abc123] Test', stderr: '' });
      
      await gitWrapper.commit('Test "quoted" message');
      
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('Test \\"quoted\\" message'),
        expect.any(Object)
      );
    });

    test('should commit modification with metadata', async () => {
      mockExec.mockResolvedValue({ stdout: '[main abc123] Test', stderr: '' });
      
      await gitWrapper.commitModification(
        ['agent.md'],
        'enhance capabilities',
        {
          componentType: 'agent',
          componentName: 'test-agent',
          breakingChange: 'Removed deprecated command',
          approvedBy: 'user-123'
        }
      );
      
      // Should stage files first
      expect(mockExec).toHaveBeenCalledWith('git add "agent.md"', { cwd: '/test/path' });
      
      // Should create formatted commit message
      const commitCall = mockExec.mock.calls.find(call => 
        call[0].includes('commit')
      );
      expect(commitCall[0]).toContain('agent(test-agent): enhance capabilities');
      expect(commitCall[0]).toContain('BREAKING CHANGE: Removed deprecated command');
      expect(commitCall[0]).toContain('Approved-by: user-123');
      expect(commitCall[0]).toContain('Generated by: aios-developer meta-agent');
    });
  });

  describe('Status and History', () => {
    test('should get git status', async () => {
      mockExec
        .mockResolvedValueOnce({ stdout: 'M  file1.js\nA  file2.js\n?? file3.js', stderr: '' })
        .mockResolvedValueOnce({ stdout: 'main', stderr: '' });
      
      const status = await gitWrapper.getStatus();
      
      expect(status).toEqual({
        branch: 'main',
        clean: false,
        files: {
          modified: ['file1.js'],
          added: ['file2.js'],
          deleted: [],
          untracked: ['file3.js']
        }
      });
    });

    test('should handle clean repository', async () => {
      mockExec
        .mockResolvedValueOnce({ stdout: '', stderr: '' })
        .mockResolvedValueOnce({ stdout: 'main', stderr: '' });
      
      const status = await gitWrapper.getStatus();
      
      expect(status.clean).toBe(true);
    });

    test('should get commit history', async () => {
      const logOutput = [
        'abc123|John Doe|john@example.com|1706707200|Initial commit',
        'def456|Jane Smith|jane@example.com|1706710800|Add feature'
      ].join('\n');
      
      mockExec.mockResolvedValue({ stdout: logOutput, stderr: '' });
      
      const history = await gitWrapper.getHistory(2);
      
      expect(history).toHaveLength(2);
      expect(history[0]).toEqual({
        hash: 'abc123',
        author: 'John Doe',
        email: 'john@example.com',
        date: new Date(1706707200 * 1000),
        subject: 'Initial commit'
      });
    });
  });

  describe('Merging and Conflicts', () => {
    test('should merge branch successfully', async () => {
      mockExec.mockResolvedValue({ stdout: 'Merge successful', stderr: '' });
      
      const result = await gitWrapper.mergeBranch('feature/test');
      
      expect(result).toEqual({
        success: true,
        message: 'Merge successful'
      });
      expect(mockExec).toHaveBeenCalledWith(
        'git merge feature/test --strategy=recursive --no-ff',
        { cwd: '/test/path' }
      );
    });

    test('should detect merge conflicts', async () => {
      mockExec
        .mockRejectedValueOnce(new Error('Merge conflict'))
        .mockResolvedValueOnce({ stdout: 'file1.js\nfile2.js', stderr: '' });
      
      const result = await gitWrapper.mergeBranch('feature/test');
      
      expect(result).toEqual({
        success: false,
        conflicts: ['file1.js', 'file2.js'],
        error: 'Merge conflicts detected'
      });
    });

    test('should get conflict list', async () => {
      mockExec.mockResolvedValue({ stdout: 'conflicted1.js\nconflicted2.js', stderr: '' });
      
      const conflicts = await gitWrapper.getConflicts();
      
      expect(conflicts).toEqual(['conflicted1.js', 'conflicted2.js']);
      expect(mockExec).toHaveBeenCalledWith(
        'git diff --name-only --diff-filter=U',
        { cwd: '/test/path' }
      );
    });
  });

  describe('Remote Operations', () => {
    test('should push to remote', async () => {
      mockExec
        .mockResolvedValueOnce({ stdout: 'main', stderr: '' })
        .mockResolvedValueOnce({ stdout: '', stderr: '' });
      
      await gitWrapper.push();
      
      expect(mockExec).toHaveBeenCalledWith('git push origin main', { cwd: '/test/path' });
    });

    test('should push with options', async () => {
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });
      
      await gitWrapper.push('upstream', 'develop', { tags: true, force: true });
      
      expect(mockExec).toHaveBeenCalledWith(
        'git push upstream develop --tags --force',
        { cwd: '/test/path' }
      );
    });

    test('should get remotes', async () => {
      const remoteOutput = [
        'origin\thttps://github.com/user/repo.git (fetch)',
        'origin\thttps://github.com/user/repo.git (push)',
        'upstream\thttps://github.com/org/repo.git (fetch)',
        'upstream\thttps://github.com/org/repo.git (push)'
      ].join('\n');
      
      mockExec.mockResolvedValue({ stdout: remoteOutput, stderr: '' });
      
      const remotes = await gitWrapper.getRemotes();
      
      expect(remotes).toEqual([
        {
          name: 'origin',
          fetchUrl: 'https://github.com/user/repo.git',
          pushUrl: 'https://github.com/user/repo.git'
        },
        {
          name: 'upstream',
          fetchUrl: 'https://github.com/org/repo.git',
          pushUrl: 'https://github.com/org/repo.git'
        }
      ]);
    });
  });

  describe('Utility Functions', () => {
    test('should create tag', async () => {
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });
      
      await gitWrapper.createTag('v1.0.0', 'Release version 1.0.0');
      
      expect(mockExec).toHaveBeenCalledWith(
        'git tag -a v1.0.0 -m "Release version 1.0.0"',
        { cwd: '/test/path' }
      );
    });

    test('should stash changes', async () => {
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });
      
      await gitWrapper.stash('Work in progress');
      
      expect(mockExec).toHaveBeenCalledWith(
        'git stash push -m "Work in progress"',
        { cwd: '/test/path' }
      );
    });

    test('should apply stash', async () => {
      mockExec.mockResolvedValue({ stdout: '', stderr: '' });
      
      await gitWrapper.stashApply();
      
      expect(mockExec).toHaveBeenCalledWith(
        'git stash apply stash@{0}',
        { cwd: '/test/path' }
      );
    });

    test('should get diff', async () => {
      mockExec.mockResolvedValue({ stdout: 'diff output', stderr: '' });
      
      const diff = await gitWrapper.getDiff({
        from: 'HEAD~1',
        to: 'HEAD',
        files: ['file1.js'],
        nameOnly: true
      });
      
      expect(diff).toBe('diff output');
      expect(mockExec).toHaveBeenCalledWith(
        'git diff --name-only HEAD~1 HEAD -- file1.js',
        { cwd: '/test/path' }
      );
    });

    test('should generate commit message', () => {
      const message = gitWrapper.generateCommitMessage({
        action: 'feat',
        componentType: 'agent',
        componentName: 'test-agent',
        summary: 'add new capabilities',
        details: ['Added memory integration', 'Enhanced error handling'],
        breakingChanges: ['Removed deprecated API']
      });
      
      expect(message).toBe(
        'feat(agent): add new capabilities\n\n' +
        '- Added memory integration\n' +
        '- Enhanced error handling\n\n' +
        'BREAKING CHANGES:\n' +
        '- Removed deprecated API'
      );
    });
  });
});