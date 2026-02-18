/**
 * E2E Tests - Visual Context System
 *
 * Tests the complete integration of the visual context system across:
 * - Workflow lifecycle
 * - Agent activation
 * - Story progress tracking
 * - Permission mode changes
 * - CLI commands
 *
 * Story CLI-DX-1: Phase 5 - Testing & Polish
 */

const { SessionStateManager } = require('../../.aios-core/core/session/state-manager');
const { StoryTracker } = require('../../.aios-core/core/session/story-tracker');
const { workflowStart, workflowStep, workflowComplete } = require('../../.aios-core/core/session/workflow-integration');
const { PermissionMode } = require('../../.aios-core/core/permissions');
const { UnifiedActivationPipeline } = require('../../.aios-core/development/scripts/unified-activation-pipeline');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = util.promisify(exec);

describe('Visual Context System - E2E', () => {
  let tmpDir;
  let stateManager;

  beforeEach(async () => {
    // Create temporary test directory
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-e2e-'));

    // Create .aios directory
    await fs.mkdir(path.join(tmpDir, '.aios'), { recursive: true });

    stateManager = new SessionStateManager(tmpDir);
  });

  afterEach(async () => {
    // Cleanup
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  describe('Workflow Lifecycle', () => {
    test('should update context through all workflow phases', async () => {
      const workflow = {
        name: 'Test Workflow',
        emoji: '🧪',
        steps: [
          { name: 'Step 1', emoji: '1️⃣' },
          { name: 'Step 2', emoji: '2️⃣' },
          { name: 'Step 3', emoji: '3️⃣' }
        ]
      };

      // Start workflow
      await workflowStart(workflow, tmpDir);

      let session = await stateManager.read();
      expect(session.status.phase).toBe('workflow');
      expect(session.status.progress).toBe('0/3');
      expect(session.status.emoji).toBe('🧪');
      expect(session.metadata.workflowActive).toBe('Test Workflow');

      // Step 1
      await workflowStep(workflow.steps[0], 0, 3, tmpDir);
      session = await stateManager.read();
      expect(session.status.progress).toBe('1/3');
      expect(session.status.emoji).toBe('1️⃣');

      // Step 2
      await workflowStep(workflow.steps[1], 1, 3, tmpDir);
      session = await stateManager.read();
      expect(session.status.progress).toBe('2/3');
      expect(session.status.emoji).toBe('2️⃣');

      // Complete
      await workflowComplete(workflow, tmpDir);
      session = await stateManager.read();
      expect(session.status.phase).toBe('completed');
      expect(session.status.progress).toBe('3/3');
      expect(session.status.emoji).toBe('✅');
      expect(session.metadata.workflowActive).toBeNull();
    });

    test('should handle workflow error state', async () => {
      const workflow = {
        name: 'Failing Workflow',
        steps: []
      };

      await workflowStart(workflow, tmpDir);

      const { workflowError } = require('../../.aios-core/core/session/workflow-integration');
      await workflowError(new Error('Test error'), tmpDir);

      const session = await stateManager.read();
      expect(session.status.phase).toBe('error');
      expect(session.status.emoji).toBe('❌');
      expect(session.metadata.lastError).toBe('Test error');
      expect(session.metadata.workflowActive).toBeNull();
    });
  });

  describe('Agent Activation', () => {
    test('should update context when agent activates', async () => {
      // Mock minimal project structure for pipeline
      await fs.mkdir(path.join(tmpDir, '.aios-core'), { recursive: true });

      const pipeline = new UnifiedActivationPipeline({ projectRoot: tmpDir });

      // Note: This will partially fail due to missing agent files,
      // but should still update session context
      try {
        await pipeline.activate('dev');
      } catch {
        // Expected to fail in test environment
      }

      const session = await stateManager.read();
      expect(session.metadata.activeAgent).toBe('dev');
      expect(session.project.emoji).toBe('💻');
      expect(session.metadata.lastActivated).toBeDefined();
    });

    test('should use correct emoji for each agent type', async () => {
      const agentEmojis = {
        'dev': '💻',
        'architect': '🏗️',
        'qa': '🧪',
        'pm': '📊',
        'devops': '🚀'
      };

      for (const [agentId, expectedEmoji] of Object.entries(agentEmojis)) {
        const pipeline = new UnifiedActivationPipeline({ projectRoot: tmpDir });

        try {
          await pipeline.activate(agentId);
        } catch {
          // Expected to fail in test environment
        }

        const session = await stateManager.read();
        expect(session.project.emoji).toBe(expectedEmoji);
      }
    });
  });

  describe('Story Progress Tracking', () => {
    test('should track checkbox progress from story markdown', async () => {
      const storyContent = `# Story TEST-1

## Tasks

- [x] Task 1 complete
- [x] Task 2 complete
- [ ] Task 3 pending
- [ ] Task 4 pending
- [ ] Task 5 pending

Story ID: TEST-1
`;

      const storyPath = path.join(tmpDir, 'story-test.md');
      await fs.writeFile(storyPath, storyContent, 'utf8');

      const tracker = new StoryTracker(tmpDir);
      const progress = await tracker.trackStory(storyPath);

      expect(progress).toEqual({
        completed: 2,
        total: 5,
        percentage: 40
      });

      const session = await stateManager.read();
      expect(session.status.progress).toBe('2/5');
      expect(session.metadata.story).toBe('TEST-1');
    });

    test('should extract story ID from various formats', async () => {
      const formats = [
        { content: 'Story ID: CLI-DX-1', expected: 'CLI-DX-1' },
        { content: '# Story ACT-123', expected: 'ACT-123' },
        { content: 'story-epic-42', expected: 'epic-42' }
      ];

      for (const { content, expected } of formats) {
        const fullContent = `${content}\n\n- [ ] Task\n- [x] Done`;
        const storyPath = path.join(tmpDir, `story-${expected}.md`);
        await fs.writeFile(storyPath, fullContent, 'utf8');

        const tracker = new StoryTracker(tmpDir);
        await tracker.trackStory(storyPath);

        const session = await stateManager.read();
        expect(session.metadata.story).toBe(expected);
      }
    });
  });

  describe('Permission Mode Integration', () => {
    test('should update context when permission mode changes', async () => {
      const permissionMode = new PermissionMode(tmpDir);

      // Cycle through modes
      await permissionMode.setMode('explore');
      let session = await stateManager.read();
      expect(session.status.emoji).toBe('🧭');
      expect(session.metadata.permissionMode).toBe('explore');

      await permissionMode.setMode('ask');
      session = await stateManager.read();
      expect(session.status.emoji).toBe('🛡️');
      expect(session.metadata.permissionMode).toBe('ask');

      await permissionMode.setMode('auto');
      session = await stateManager.read();
      expect(session.status.emoji).toBe('⚡');
      expect(session.metadata.permissionMode).toBe('auto');
    });

    test('should update context when cycling modes', async () => {
      const permissionMode = new PermissionMode(tmpDir);

      await permissionMode.setMode('explore');
      await permissionMode.cycleMode(); // explore -> ask

      let session = await stateManager.read();
      expect(session.metadata.permissionMode).toBe('ask');
      expect(session.status.emoji).toBe('🛡️');

      await permissionMode.cycleMode(); // ask -> auto
      session = await stateManager.read();
      expect(session.metadata.permissionMode).toBe('auto');
      expect(session.status.emoji).toBe('⚡');
    });
  });

  describe('Session State Persistence', () => {
    test('should persist context across multiple updates', async () => {
      // Initial update
      await stateManager.update({
        project: { name: 'Test Project', emoji: '🧪' }
      });

      // Workflow start
      await workflowStart({ name: 'Test', steps: [] }, tmpDir);

      // Permission mode change
      const permissionMode = new PermissionMode(tmpDir);
      await permissionMode.setMode('auto');

      // Final read
      const session = await stateManager.read();

      expect(session.project.name).toBe('Test Project');
      expect(session.status.phase).toBe('workflow');
      expect(session.metadata.permissionMode).toBe('auto');
    });

    test('should maintain session continuity through updates', async () => {
      const sessionId = 'test-session-123';

      await stateManager.update({
        sessionId,
        project: { name: 'Project A' }
      });

      // Multiple updates should preserve sessionId
      await stateManager.update({
        status: { phase: 'testing' }
      });

      await stateManager.update({
        metadata: { activeAgent: 'dev' }
      });

      const session = await stateManager.read();
      expect(session.sessionId).toBe(sessionId);
      expect(session.project.name).toBe('Project A');
      expect(session.status.phase).toBe('testing');
      expect(session.metadata.activeAgent).toBe('dev');
    });
  });

  describe('Performance', () => {
    test('session read should be fast (cached)', async () => {
      await stateManager.update({ project: { name: 'Test' } });

      // First read (uncached)
      const start1 = Date.now();
      await stateManager.read();
      const duration1 = Date.now() - start1;

      // Second read (cached)
      const start2 = Date.now();
      await stateManager.read();
      const duration2 = Date.now() - start2;

      expect(duration1).toBeLessThan(50); // <50ms uncached
      expect(duration2).toBeLessThan(10); // <10ms cached
    });

    test('context update should be fast', async () => {
      const start = Date.now();

      await stateManager.update({
        status: { phase: 'testing', emoji: '🧪' },
        metadata: { timestamp: Date.now() }
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50); // <50ms for update
    });
  });
});
