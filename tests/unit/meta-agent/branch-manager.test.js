const BranchManager = require('../../../aios-core/utils/branch-manager');
const GitWrapper = require('../../../aios-core/utils/git-wrapper');
const inquirer = require('inquirer');
const chalk = require('chalk');

// Mock dependencies
jest.mock('../../../aios-core/utils/git-wrapper');
jest.mock('inquirer');
jest.mock('chalk', () => ({
  green: jest.fn(text => text),
  yellow: jest.fn(text => text),
  red: jest.fn(text => text),
  blue: jest.fn(text => text),
  gray: jest.fn(text => text)
}));

describe('BranchManager', () => {
  let branchManager;
  let mockGit;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock git instance
    mockGit = {
      getCurrentBranch: jest.fn().mockResolvedValue('main'),
      createBranch: jest.fn().mockResolvedValue(undefined),
      checkoutBranch: jest.fn().mockResolvedValue(undefined),
      execGit: jest.fn(),
      getStatus: jest.fn().mockResolvedValue({ clean: true }),
      mergeBranch: jest.fn(),
      stash: jest.fn(),
      commit: jest.fn(),
      stageFiles: jest.fn(),
      defaultBranch: 'main'
    };
    
    GitWrapper.mockImplementation(() => mockGit);
    
    branchManager = new BranchManager();
  });

  describe('createModificationBranch', () => {
    test('should create branch with proper naming', async () => {
      const modification = {
        type: 'agent',
        target: 'test-agent',
        action: 'enhance',
        ticketId: null
      };

      const result = await branchManager.createModificationBranch(modification);

      expect(result.success).toBe(true);
      expect(result.branchName).toMatch(/^meta-agent\/agent\/test-agent-enhance-\d+$/);
      expect(result.baseBranch).toBe('main');
      expect(mockGit.createBranch).toHaveBeenCalledWith(
        expect.stringMatching(/^meta-agent\/agent\/test-agent-enhance-\d+$/),
        true
      );
    });

    test('should create branch with ticket ID when provided', async () => {
      const modification = {
        type: 'agent',
        target: 'test-agent',
        action: 'enhance',
        ticketId: 'AIOS-123'
      };

      const result = await branchManager.createModificationBranch(modification);

      expect(result.success).toBe(true);
      expect(result.branchName).toBe('meta-agent/AIOS-123/agent-test-agent');
    });

    test('should switch to default branch if not on it', async () => {
      mockGit.getCurrentBranch.mockResolvedValueOnce('feature/other');

      await branchManager.createModificationBranch({
        type: 'task',
        target: 'test-task',
        action: 'update'
      });

      expect(mockGit.checkoutBranch).toHaveBeenCalledWith('main');
    });

    test('should handle branch creation errors', async () => {
      mockGit.createBranch.mockRejectedValueOnce(new Error('Branch exists'));

      const result = await branchManager.createModificationBranch({
        type: 'agent',
        target: 'test',
        action: 'update'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Branch exists');
    });
  });

  describe('getModificationBranches', () => {
    test('should return list of modification branches', async () => {
      mockGit.execGit
        .mockResolvedValueOnce('  main\n* meta-agent/agent-test-1234\n  meta-agent/task-update-5678\n  feature/other')
        .mockResolvedValueOnce('abc123|1706788800|feat: enhance agent')
        .mockResolvedValueOnce('def456|1706702400|fix: update task');

      const branches = await branchManager.getModificationBranches();

      expect(branches).toHaveLength(2);
      expect(branches[0].name).toBe('meta-agent/agent-test-1234');
      expect(branches[0].lastCommitHash).toBe('abc123');
      expect(branches[0].lastCommitMessage).toBe('feat: enhance agent');
      expect(branches[1].name).toBe('meta-agent/task-update-5678');
    });

    test('should handle errors gracefully', async () => {
      mockGit.execGit.mockRejectedValueOnce(new Error('Git error'));

      const branches = await branchManager.getModificationBranches();

      expect(branches).toEqual([]);
    });
  });

  describe('switchToBranch', () => {
    test('should switch to branch when working tree is clean', async () => {
      mockGit.getStatus.mockResolvedValueOnce({ clean: true });

      const result = await branchManager.switchToBranch('meta-agent/test-branch');

      expect(result.success).toBe(true);
      expect(result.branchName).toBe('meta-agent/test-branch');
      expect(mockGit.checkoutBranch).toHaveBeenCalledWith('meta-agent/test-branch');
    });

    test('should handle uncommitted changes with stash option', async () => {
      mockGit.getStatus.mockResolvedValueOnce({ 
        clean: false,
        files: { modified: ['test.js'] }
      });
      inquirer.prompt.mockResolvedValueOnce({ action: 'stash' });

      const result = await branchManager.switchToBranch('meta-agent/test-branch');

      expect(result.success).toBe(true);
      expect(mockGit.stash).toHaveBeenCalledWith(
        expect.stringContaining('Auto-stash before switching')
      );
    });

    test('should handle uncommitted changes with commit option', async () => {
      mockGit.getStatus.mockResolvedValueOnce({ 
        clean: false,
        files: { modified: ['test.js'] }
      });
      inquirer.prompt.mockResolvedValueOnce({ action: 'commit' });

      const result = await branchManager.switchToBranch('meta-agent/test-branch');

      expect(result.success).toBe(true);
      expect(mockGit.stageFiles).toHaveBeenCalledWith(['.']);
      expect(mockGit.commit).toHaveBeenCalledWith('WIP: Auto-commit before branch switch');
    });

    test('should cancel switch when user chooses cancel', async () => {
      mockGit.getStatus.mockResolvedValueOnce({ clean: false });
      inquirer.prompt.mockResolvedValueOnce({ action: 'cancel' });

      const result = await branchManager.switchToBranch('meta-agent/test-branch');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('User cancelled');
      expect(mockGit.checkoutBranch).not.toHaveBeenCalled();
    });
  });

  describe('mergeModificationBranch', () => {
    test('should merge branch successfully', async () => {
      mockGit.mergeBranch.mockResolvedValueOnce({
        success: true,
        message: 'Merge successful'
      });

      const result = await branchManager.mergeModificationBranch(
        'meta-agent/test-branch',
        { deleteBranch: false }
      );

      expect(result.success).toBe(true);
      expect(mockGit.checkoutBranch).toHaveBeenCalledWith('main');
      expect(mockGit.mergeBranch).toHaveBeenCalledWith(
        'meta-agent/test-branch',
        expect.objectContaining({
          message: expect.stringContaining('Merge modification branch'),
          noFastForward: true
        })
      );
    });

    test('should delete branch after merge if requested', async () => {
      mockGit.mergeBranch.mockResolvedValueOnce({ success: true });
      mockGit.execGit.mockResolvedValueOnce(''); // deleteBranch

      const result = await branchManager.mergeModificationBranch(
        'meta-agent/test-branch',
        { deleteBranch: true }
      );

      expect(result.success).toBe(true);
      expect(mockGit.execGit).toHaveBeenCalledWith('branch -d meta-agent/test-branch');
    });

    test('should handle merge conflicts', async () => {
      mockGit.mergeBranch.mockResolvedValueOnce({
        success: false,
        conflicts: ['file1.js', 'file2.js']
      });

      const result = await branchManager.mergeModificationBranch('meta-agent/test-branch');

      expect(result.success).toBe(false);
      expect(result.conflicts).toEqual(['file1.js', 'file2.js']);
      expect(result.message).toBe('Merge conflicts detected');
    });
  });

  describe('deleteBranch', () => {
    test('should delete branch successfully', async () => {
      mockGit.execGit.mockResolvedValueOnce('');

      const result = await branchManager.deleteBranch('meta-agent/old-branch');

      expect(result.success).toBe(true);
      expect(mockGit.execGit).toHaveBeenCalledWith('branch -d meta-agent/old-branch');
    });

    test('should force delete when requested', async () => {
      mockGit.execGit.mockResolvedValueOnce('');

      await branchManager.deleteBranch('meta-agent/old-branch', true);

      expect(mockGit.execGit).toHaveBeenCalledWith('branch -D meta-agent/old-branch');
    });

    test('should handle not fully merged error', async () => {
      mockGit.execGit.mockRejectedValueOnce(
        new Error('error: The branch is not fully merged')
      );

      const result = await branchManager.deleteBranch('meta-agent/old-branch');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not fully merged');
    });
  });

  describe('cleanupOldBranches', () => {
    test('should cleanup branches older than specified days', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40);
      
      mockGit.execGit
        .mockResolvedValueOnce('  main\n* current\n  meta-agent/old-branch')
        .mockResolvedValueOnce(`abc123|${Math.floor(oldDate.getTime() / 1000)}|old commit`);
      
      mockGit.getCurrentBranch.mockResolvedValueOnce('current');
      inquirer.prompt.mockResolvedValueOnce({ confirm: true });
      
      // Mock successful deletion
      mockGit.execGit.mockResolvedValueOnce(''); // for delete

      const result = await branchManager.cleanupOldBranches(30);

      expect(result.deleted).toBe(1);
      expect(result.total).toBe(1);
    });

    test('should not delete current branch', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40);
      
      mockGit.execGit
        .mockResolvedValueOnce('  main\n* meta-agent/current-old')
        .mockResolvedValueOnce(`abc123|${Math.floor(oldDate.getTime() / 1000)}|old commit`);
      
      mockGit.getCurrentBranch.mockResolvedValueOnce('meta-agent/current-old');

      const result = await branchManager.cleanupOldBranches(30);

      expect(result.deleted).toBe(0);
    });

    test('should handle user cancellation', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40);
      
      mockGit.execGit
        .mockResolvedValueOnce('  meta-agent/old-branch')
        .mockResolvedValueOnce(`abc123|${Math.floor(oldDate.getTime() / 1000)}|old commit`);
      
      inquirer.prompt.mockResolvedValueOnce({ confirm: false });

      const result = await branchManager.cleanupOldBranches(30);

      expect(result.deleted).toBe(0);
      expect(result.cancelled).toBe(true);
    });
  });

  describe('compareBranches', () => {
    test('should compare branches successfully', async () => {
      mockGit.execGit
        .mockResolvedValueOnce('5') // ahead
        .mockResolvedValueOnce('2'); // behind
      
      mockGit.getDiff.mockResolvedValueOnce('file1.js\nfile2.js\nfile3.js');

      const result = await branchManager.compareBranches('feature/test');

      expect(result.branch).toBe('feature/test');
      expect(result.compareTo).toBe('main');
      expect(result.ahead).toBe(5);
      expect(result.behind).toBe(2);
      expect(result.changedFiles).toEqual(['file1.js', 'file2.js', 'file3.js']);
      expect(result.canFastForward).toBe(false);
    });

    test('should detect fast-forward possibility', async () => {
      mockGit.execGit
        .mockResolvedValueOnce('3') // ahead
        .mockResolvedValueOnce('0'); // behind
      
      mockGit.getDiff.mockResolvedValueOnce('file1.js');

      const result = await branchManager.compareBranches('feature/test');

      expect(result.canFastForward).toBe(true);
    });
  });

  describe('getBranchStrategy', () => {
    test('should return correct strategy for enhancement', () => {
      const strategy = branchManager.getBranchStrategy('enhancement');
      
      expect(strategy.prefix).toBe('feature/');
      expect(strategy.baseFrom).toBe('main');
      expect(strategy.protectByDefault).toBe(false);
      expect(strategy.autoMerge).toBe(false);
    });

    test('should return correct strategy for self-modification', () => {
      const strategy = branchManager.getBranchStrategy('self-modification');
      
      expect(strategy.prefix).toBe('self-mod/');
      expect(strategy.protectByDefault).toBe(true);
      expect(strategy.requireApproval).toBe(true);
    });

    test('should return default strategy for unknown type', () => {
      const strategy = branchManager.getBranchStrategy('unknown');
      
      expect(strategy.prefix).toBe('feature/');
    });
  });
});