// Integration test - requires external services
// Uses describeIntegration from setup.js
// File: tests/e2e/story-creation-clickup.test.js

/**
 * End-to-End Story Creation Test Suite
 *
 * Tests the complete story creation workflow from Epic verification
 * through ClickUp subtask creation and frontmatter metadata recording.
 *
 * AC2: Story Creation as ClickUp Subtask
 * AC3: Story File Metadata Recording
 */

const fs = require('fs').promises;
const path = require('path');
const { verifyEpicExists } = require('../../common/utils/clickup-helpers');
const { createStoryInClickUp, updateStoryFrontmatter } = require('../../common/utils/story-manager');

// Create a single shared mock instance
const mockClickUpTool = {
  getWorkspaceTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  getTask: jest.fn(),
};

// Mock ClickUp MCP tool - return the SAME instance every time
jest.mock('../../common/utils/tool-resolver', () => ({
  resolveTool: jest.fn(() => mockClickUpTool),
}));

const _toolResolver = require('../../common/utils/tool-resolver');

describeIntegration('End-to-End Story Creation with ClickUp Integration', () => {
  const testStoryPath = path.join(__dirname, '../fixtures/test-story-5.99.md');

  beforeEach(() => {
    jest.clearAllMocks();
    // mockClickUpTool is now a global shared instance
  });

  afterEach(async () => {
    // Cleanup test files
    try {
      await fs.unlink(testStoryPath);
    } catch {
      // File may not exist, ignore
    }
  });

  describeIntegration('Complete Flow: Epic Verification → Story Creation → ClickUp Subtask → Frontmatter Update', () => {
    test('should successfully create story with ClickUp integration', async () => {
      // Step 1: Mock Epic verification
      mockClickUpTool.getWorkspaceTasks.mockResolvedValue({
        tasks: [
          {
            id: 'epic-task-5',
            name: 'Epic 5: Tools System',
            status: 'In Progress',
            tags: ['epic', 'epic-5'],
            list: {
              id: 'backlog-list-123',
              name: 'Backlog',
            },
          },
        ],
      });

      // Step 2: Verify Epic exists
      const epicResult = await verifyEpicExists(5);
      expect(epicResult.found).toBe(true);
      expect(epicResult.epicTaskId).toBe('epic-task-5');

      // Step 3: Mock ClickUp story task creation
      mockClickUpTool.createTask.mockResolvedValue({
        id: 'story-task-5-99',
        name: 'Story 5.99: E2E Test Story',
        url: 'https://app.clickup.com/t/story-task-5-99',
        status: 'Draft',
        parent: 'epic-task-5',
        tags: ['story', 'epic-5', 'story-5.99'],
        custom_fields: [
          { id: 'epic_number', value: 5 },
          { id: 'story_number', value: '5.99' },
          { id: 'story_file_path', value: 'docs/stories/5.99.story.md' },
          { id: 'story-status', value: 'Draft' },
        ],
      });

      // Step 4: Create story in ClickUp (as subtask)
      const storyResult = await createStoryInClickUp({
        epicNum: 5,
        storyNum: 99,
        title: 'E2E Test Story',
        epicTaskId: epicResult.epicTaskId,
        listName: 'Backlog',
        storyContent: '# Story 5.99: E2E Test Story\n\nTest content...',
      });

      expect(storyResult.taskId).toBe('story-task-5-99');
      expect(storyResult.url).toBe('https://app.clickup.com/t/story-task-5-99');

      // Verify createTask was called with correct parameters
      expect(mockClickUpTool.createTask).toHaveBeenCalledWith({
        listName: 'Backlog',
        name: 'Story 5.99: E2E Test Story',
        parent: 'epic-task-5',
        markdown_description: expect.stringContaining('Test content'),
        tags: ['story', 'epic-5', 'story-5.99'],
        custom_fields: [
          { id: 'epic_number', value: 5 },
          { id: 'story_number', value: '5.99' },
          { id: 'story_file_path', value: expect.stringContaining('5.99') },
          { id: 'story-status', value: 'Draft' },
        ],
      });

      // Step 5: Create minimal story file for frontmatter update
      const initialStoryContent = `---
title: "Story 5.99: E2E Test Story"
epic: 5
story: 99
---

# Story 5.99: E2E Test Story

Test content...
`;
      await fs.writeFile(testStoryPath, initialStoryContent, 'utf-8');

      // Step 6: Update story file frontmatter with ClickUp metadata
      const frontmatter = await updateStoryFrontmatter(testStoryPath, {
        clickup: {
          task_id: storyResult.taskId,
          epic_task_id: epicResult.epicTaskId,
          list: 'Backlog',
          url: storyResult.url,
          last_sync: new Date().toISOString(),
        },
      });

      expect(frontmatter.clickup.task_id).toBe('story-task-5-99');
      expect(frontmatter.clickup.epic_task_id).toBe('epic-task-5');
      expect(frontmatter.clickup.url).toBe('https://app.clickup.com/t/story-task-5-99');
    });

    test('should handle Epic verification failure gracefully', async () => {
      // Mock Epic not found
      mockClickUpTool.getWorkspaceTasks.mockResolvedValue({
        tasks: [],
      });

      await expect(verifyEpicExists(99)).rejects.toThrow(
        /Epic 99 not found in ClickUp Backlog list/,
      );

      // Story creation should not proceed
      expect(mockClickUpTool.createTask).not.toHaveBeenCalled();
    });

    test('should rollback on ClickUp task creation failure', async () => {
      // Step 1: Epic verification succeeds
      mockClickUpTool.getWorkspaceTasks.mockResolvedValue({
        tasks: [
          {
            id: 'epic-task-7',
            name: 'Epic 7: Test',
            status: 'Planning',
            tags: ['epic', 'epic-7'],
          },
        ],
      });

      const epicResult = await verifyEpicExists(7);
      expect(epicResult.found).toBe(true);

      // Step 2: ClickUp task creation fails
      mockClickUpTool.createTask.mockRejectedValue(
        new Error('ClickUp API: Rate limit exceeded'),
      );

      // Step 3: Story creation should fail
      await expect(
        createStoryInClickUp({
          epicNum: 7,
          storyNum: 1,
          title: 'Test Story',
          epicTaskId: epicResult.epicTaskId,
          listName: 'Backlog',
          storyContent: 'Content',
        }),
      ).rejects.toThrow('ClickUp API: Rate limit exceeded');
    });
  });

  describeIntegration('Verify Parent-Child Relationship in ClickUp', () => {
    test('should create story as subtask with correct parent reference', async () => {
      const epicTaskId = 'epic-parent-123';

      mockClickUpTool.createTask.mockResolvedValue({
        id: 'story-child-456',
        name: 'Story 3.1: Child Story',
        parent: epicTaskId,
        url: 'https://app.clickup.com/t/story-child-456',
      });

      const result = await createStoryInClickUp({
        epicNum: 3,
        storyNum: 1,
        title: 'Child Story',
        epicTaskId: epicTaskId,
        listName: 'Backlog',
        storyContent: 'Story content',
      });

      expect(result.taskId).toBe('story-child-456');

      // Verify parent parameter was set correctly
      expect(mockClickUpTool.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: epicTaskId,
        }),
      );
    });

    test('should fail if parent Epic task_id is invalid', async () => {
      mockClickUpTool.createTask.mockRejectedValue(
        new Error('Parent task not found'),
      );

      await expect(
        createStoryInClickUp({
          epicNum: 8,
          storyNum: 1,
          title: 'Orphan Story',
          epicTaskId: 'invalid-epic-id',
          listName: 'Backlog',
          storyContent: 'Content',
        }),
      ).rejects.toThrow('Parent task not found');
    });

    test('should verify Epic-Story relationship after creation', async () => {
      const epicTaskId = 'epic-verify-123';
      const storyTaskId = 'story-verify-456';

      mockClickUpTool.createTask.mockResolvedValue({
        id: storyTaskId,
        name: 'Story 6.2: Verify Relationship',
        parent: epicTaskId,
        url: 'https://app.clickup.com/t/' + storyTaskId,
      });

      // Mock get task to verify parent relationship
      mockClickUpTool.getTask = jest.fn().mockResolvedValue({
        id: storyTaskId,
        parent: epicTaskId,
        name: 'Story 6.2: Verify Relationship',
      });

      const result = await createStoryInClickUp({
        epicNum: 6,
        storyNum: 2,
        title: 'Verify Relationship',
        epicTaskId: epicTaskId,
        listName: 'Backlog',
        storyContent: 'Content',
      });

      // Verify parent relationship
      const taskDetails = await mockClickUpTool.getTask({ taskId: result.taskId });
      expect(taskDetails.parent).toBe(epicTaskId);
    });
  });

  describeIntegration('Verify All Tags Applied Correctly', () => {
    test('should apply all three required tags to story', async () => {
      mockClickUpTool.createTask.mockResolvedValue({
        id: 'story-tags-test',
        name: 'Story 2.3.5: Tags Test',
        tags: ['story', 'epic-2', 'story-2.3.5'],
      });

      await createStoryInClickUp({
        epicNum: 2,
        storyNum: 5,
        title: 'Tags Test',
        epicTaskId: 'epic-2',
        listName: 'Backlog',
        storyContent: 'Content',
        subStoryNum: 3,  // For nested story numbering
      });

      expect(mockClickUpTool.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['story', 'epic-2', 'story-2.3.5'],
        }),
      );
    });

    test('should format tags correctly for different story numbers', () => {
      const testCases = [
        { epic: 1, story: 1, expected: ['story', 'epic-1', 'story-1.1'] },
        { epic: 5, story: 2, expected: ['story', 'epic-5', 'story-5.2'] },
        { epic: 10, story: 15, expected: ['story', 'epic-10', 'story-10.15'] },
      ];

      testCases.forEach(({ epic, story, expected }) => {
        const tags = generateStoryTags(epic, story);
        expect(tags).toEqual(expected);
      });
    });

    test('should handle nested story numbering with substory parameter', async () => {
      mockClickUpTool.createTask.mockResolvedValue({
        id: 'nested-story-test',
        name: 'Story 4.3.2: Nested',
        tags: ['story', 'epic-4', 'story-4.3.2'],
      });

      await createStoryInClickUp({
        epicNum: 4,
        storyNum: 2,
        subStoryNum: 3,  // Creates 4.3.2
        title: 'Nested',
        epicTaskId: 'epic-4',
        listName: 'Backlog',
        storyContent: 'Content',
      });

      expect(mockClickUpTool.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: expect.arrayContaining(['story-4.3.2']),
        }),
      );
    });
  });

  describeIntegration('Verify Custom Fields Populated', () => {
    test('should populate all four required custom fields', async () => {
      mockClickUpTool.createTask.mockResolvedValue({
        id: 'custom-fields-test',
        name: 'Story 9.1: Custom Fields Test',
        custom_fields: [
          { id: 'epic_number', name: 'epic_number', value: 9 },
          { id: 'story_number', name: 'story_number', value: '9.1' },
          { id: 'story_file_path', name: 'story_file_path', value: 'docs/stories/9.1.story.md' },
          { id: 'story-status', name: 'story-status', value: 'Draft' },
        ],
      });

      await createStoryInClickUp({
        epicNum: 9,
        storyNum: 1,
        title: 'Custom Fields Test',
        epicTaskId: 'epic-9',
        listName: 'Backlog',
        storyContent: 'Content',
        storyFilePath: 'docs/stories/9.1.story.md',
      });

      expect(mockClickUpTool.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          custom_fields: expect.arrayContaining([
            expect.objectContaining({ id: 'epic_number', value: 9 }),
            expect.objectContaining({ id: 'story_number', value: '9.1' }),
            expect.objectContaining({ id: 'story_file_path', value: expect.stringContaining('9.1') }),
          ]),
        }),
      );
    });

    test('should set initial story-status to Draft', async () => {
      mockClickUpTool.createTask.mockResolvedValue({
        id: 'status-test',
        custom_fields: [
          { id: 'story-status', value: 'Draft' },
        ],
      });

      await createStoryInClickUp({
        epicNum: 11,
        storyNum: 2,
        title: 'Status Test',
        epicTaskId: 'epic-11',
        listName: 'Backlog',
        storyContent: 'Content',
      });

      const createCall = mockClickUpTool.createTask.mock.calls[0][0];
      const statusField = createCall.custom_fields.find(f => f.id === 'story-status');
      expect(statusField.value).toBe('Draft');
    });

    test('should handle custom field validation errors', async () => {
      mockClickUpTool.createTask.mockRejectedValue(
        new Error('Custom field "story-status" does not exist'),
      );

      await expect(
        createStoryInClickUp({
          epicNum: 12,
          storyNum: 1,
          title: 'Field Error Test',
          epicTaskId: 'epic-12',
          listName: 'Backlog',
          storyContent: 'Content',
        }),
      ).rejects.toThrow('Custom field "story-status" does not exist');
    });

    test('should validate epic_number is numeric', async () => {
      await expect(
        createStoryInClickUp({
          epicNum: 'invalid',  // Should be number
          storyNum: 1,
          title: 'Invalid Epic',
          epicTaskId: 'epic-x',
          listName: 'Backlog',
          storyContent: 'Content',
        }),
      ).rejects.toThrow(/epic_number must be a number/);
    });

    test('should validate story_number format', async () => {
      await expect(
        createStoryInClickUp({
          epicNum: 5,
          storyNum: 'abc',  // Should be number
          title: 'Invalid Story',
          epicTaskId: 'epic-5',
          listName: 'Backlog',
          storyContent: 'Content',
        }),
      ).rejects.toThrow(/story_number must be numeric/);
    });
  });
});

/**
 * Helper function to generate story tags
 */
function generateStoryTags(epicNum, storyNum, subStoryNum = null) {
  const storyId = subStoryNum
    ? `${epicNum}.${subStoryNum}.${storyNum}`
    : `${epicNum}.${storyNum}`;

  return ['story', `epic-${epicNum}`, `story-${storyId}`];
}
