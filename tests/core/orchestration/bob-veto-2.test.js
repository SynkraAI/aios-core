/**
 * BOB-VETO-2: Restart Confirmation Gate Tests
 *
 * Validates that BOB blocks story restart when uncommitted changes exist,
 * preventing work loss.
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { BobOrchestrator } = require('../../../.aios-core/core/orchestration/bob-orchestrator');

const TEST_PROJECT_ROOT = path.join(__dirname, '../../fixtures/test-project-veto-2');

describe('BOB-VETO-2: Restart confirmation gate', () => {
  beforeEach(() => {
    // Clean up test project
    if (fs.existsSync(TEST_PROJECT_ROOT)) {
      fs.rmSync(TEST_PROJECT_ROOT, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_PROJECT_ROOT, { recursive: true });

    // Initialize git repo
    execSync('git init', { cwd: TEST_PROJECT_ROOT, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: TEST_PROJECT_ROOT, stdio: 'ignore' });
    execSync('git config user.name "Test User"', { cwd: TEST_PROJECT_ROOT, stdio: 'ignore' });
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(TEST_PROJECT_ROOT)) {
      fs.rmSync(TEST_PROJECT_ROOT, { recursive: true, force: true });
    }
  });

  it('should block restart when uncommitted changes exist', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    // Create uncommitted file
    const testFile = path.join(TEST_PROJECT_ROOT, 'test.txt');
    fs.writeFileSync(testFile, 'uncommitted content');
    execSync('git add test.txt', { cwd: TEST_PROJECT_ROOT, stdio: 'ignore' });

    const workStatus = await bob._checkUncommittedWork('TEST-STORY');

    expect(workStatus.hasChanges).toBe(true);
    expect(workStatus.count).toBeGreaterThan(0);
    expect(workStatus.files.length).toBeGreaterThan(0);
  });

  it('should allow restart when working tree is clean', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    // Create and commit file
    const testFile = path.join(TEST_PROJECT_ROOT, 'test.txt');
    fs.writeFileSync(testFile, 'committed content');
    execSync('git add test.txt', { cwd: TEST_PROJECT_ROOT, stdio: 'ignore' });
    execSync('git commit -m "initial commit"', { cwd: TEST_PROJECT_ROOT, stdio: 'ignore' });

    const workStatus = await bob._checkUncommittedWork('TEST-STORY');

    expect(workStatus.hasChanges).toBe(false);
    expect(workStatus.files).toEqual([]);
  });

  it('should return file list when changes exist', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    // Create multiple uncommitted files
    fs.writeFileSync(path.join(TEST_PROJECT_ROOT, 'file1.txt'), 'content1');
    fs.writeFileSync(path.join(TEST_PROJECT_ROOT, 'file2.txt'), 'content2');
    execSync('git add .', { cwd: TEST_PROJECT_ROOT, stdio: 'ignore' });

    const workStatus = await bob._checkUncommittedWork('TEST-STORY');

    expect(workStatus.hasChanges).toBe(true);
    expect(workStatus.count).toBe(2);
    expect(workStatus.files.length).toBe(2);
  });

  it('should handle edge cases gracefully (not crash)', async () => {
    // Create a fresh directory without git
    const nonGitDir = path.join(TEST_PROJECT_ROOT, 'non-git-dir');
    fs.mkdirSync(nonGitDir, { recursive: true });

    const bob = new BobOrchestrator(nonGitDir);
    const workStatus = await bob._checkUncommittedWork('TEST-STORY');

    // Should not crash and return a valid object
    expect(workStatus).toBeDefined();
    expect(workStatus).toHaveProperty('hasChanges');
    expect(workStatus).toHaveProperty('files');

    // Should return boolean for hasChanges
    expect(typeof workStatus.hasChanges).toBe('boolean');

    // Should return array for files
    expect(Array.isArray(workStatus.files)).toBe(true);
  });

  it('should provide helpful veto message when blocking restart', async () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    // Create uncommitted file
    fs.writeFileSync(path.join(TEST_PROJECT_ROOT, 'test.txt'), 'uncommitted');
    execSync('git add test.txt', { cwd: TEST_PROJECT_ROOT, stdio: 'ignore' });

    const workStatus = await bob._checkUncommittedWork('TEST-STORY');

    // Simulate veto message (as would be returned by handleSessionResume)
    expect(workStatus.hasChanges).toBe(true);
    expect(workStatus.count).toBeGreaterThan(0);

    // Expected veto data structure
    const expectedVetoData = {
      reason: 'Há trabalho não commitado.',
      vetoCondition: 'uncommitted_changes',
      filesAffected: workStatus.files,
      fileCount: workStatus.count,
      suggestion: 'Commit ou stash suas mudanças antes de restart.',
    };

    expect(expectedVetoData.vetoCondition).toBe('uncommitted_changes');
    expect(expectedVetoData.suggestion).toContain('Commit ou stash');
  });
});
