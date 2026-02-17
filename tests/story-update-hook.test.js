// File: tests/story-update-hook.test.js

/**
 * Story Update Hook Test Suite
 *
 * Tests the story change detection, changelog generation, and ClickUp synchronization
 * functionality of the story-update-hook module.
 */

const {
  detectChanges,
  generateChangelog,
  syncStoryToClickUp,
  updateFrontmatterTimestamp,
} = require('../common/utils/story-update-hook');

// Mock ClickUp helper functions
jest.mock('../common/utils/clickup-helpers', () => ({
  updateStoryStatus: jest.fn(),
  updateTaskDescription: jest.fn(),
  addTaskComment: jest.fn(),
  verifyEpicExists: jest.fn(),
}));

const clickupHelpers = require('../common/utils/clickup-helpers');

describe('Story Update Hook - Change Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectChanges() - Status Changes', () => {
    test('should detect status change from Draft to In Progress', () => {
      const oldContent = '---\nstatus: Draft\n---\nStory content';
      const newContent = '---\nstatus: In Progress\n---\nStory content';

      const changes = detectChanges(oldContent, newContent);

      expect(changes.status).toEqual({
        changed: true,
        from: 'Draft',
        to: 'In Progress',
      });
    });

    test('should not detect status change when status is unchanged', () => {
      const oldContent = '---\nstatus: In Progress\n---\nStory content';
      const newContent = '---\nstatus: In Progress\n---\nUpdated story content';

      const changes = detectChanges(oldContent, newContent);

      expect(changes.status).toEqual({
        changed: false,
        from: 'In Progress',
        to: 'In Progress',
      });
    });

    test('should handle missing status in old content', () => {
      const oldContent = '---\ntitle: My Story\n---\nContent';
      const newContent = '---\nstatus: Draft\n---\nContent';

      const changes = detectChanges(oldContent, newContent);

      expect(changes.status).toEqual({
        changed: true,
        from: undefined,
        to: 'Draft',
      });
    });
  });

  describe('detectChanges() - Task Completion', () => {
    test('should detect newly completed tasks', () => {
      const oldContent = `
## Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
      `;
      const newContent = `
## Tasks
- [x] Task 1
- [ ] Task 2
- [x] Task 3
      `;

      const changes = detectChanges(oldContent, newContent);

      expect(changes.tasksCompleted).toHaveLength(2);
      expect(changes.tasksCompleted).toContain('Task 1');
      expect(changes.tasksCompleted).toContain('Task 3');
    });

    test('should ignore already completed tasks', () => {
      const oldContent = `
## Tasks
- [x] Task 1
- [ ] Task 2
      `;
      const newContent = `
## Tasks
- [x] Task 1
- [x] Task 2
      `;

      const changes = detectChanges(oldContent, newContent);

      expect(changes.tasksCompleted).toHaveLength(1);
      expect(changes.tasksCompleted).toContain('Task 2');
    });

    test('should handle no task completions', () => {
      const oldContent = '- [ ] Task 1\n- [ ] Task 2';
      const newContent = '- [ ] Task 1\n- [ ] Task 2';

      const changes = detectChanges(oldContent, newContent);

      expect(changes.tasksCompleted).toEqual([]);
    });
  });

  describe('detectChanges() - File List Updates', () => {
    test('should detect new files added to File List section', () => {
      const oldContent = `
## File List
**New Files:**
- common/utils/file1.js
      `;
      const newContent = `
## File List
**New Files:**
- common/utils/file1.js
- common/utils/file2.js
- tests/file2.test.js
      `;

      const changes = detectChanges(oldContent, newContent);

      expect(changes.filesAdded).toHaveLength(2);
      expect(changes.filesAdded).toContain('common/utils/file2.js');
      expect(changes.filesAdded).toContain('tests/file2.test.js');
    });

    test('should handle File List section with no changes', () => {
      const oldContent = '## File List\n- file1.js\n- file2.js';
      const newContent = '## File List\n- file1.js\n- file2.js';

      const changes = detectChanges(oldContent, newContent);

      expect(changes.filesAdded).toEqual([]);
    });
  });

  describe('detectChanges() - Dev Notes', () => {
    test('should detect new Dev Notes added', () => {
      const oldContent = '## Dev Notes\n\nNote 1';
      const newContent = '## Dev Notes\n\nNote 1\n\nNote 2: Implementation details';

      const changes = detectChanges(oldContent, newContent);

      expect(changes.devNotesAdded).toBe(true);
      expect(changes.devNotesContent).toContain('Note 2');
    });

    test('should not detect dev notes when unchanged', () => {
      const oldContent = '## Dev Notes\n\nNote 1';
      const newContent = '## Dev Notes\n\nNote 1';

      const changes = detectChanges(oldContent, newContent);

      expect(changes.devNotesAdded).toBe(false);
    });
  });

  describe('detectChanges() - Acceptance Criteria', () => {
    test('should detect changes to Acceptance Criteria section', () => {
      const oldContent = '## Acceptance Criteria\n- AC1: Original';
      const newContent = '## Acceptance Criteria\n- AC1: Updated\n- AC2: New';

      const changes = detectChanges(oldContent, newContent);

      expect(changes.acceptanceCriteriaChanged).toBe(true);
    });

    test('should not detect AC changes when unchanged', () => {
      const oldContent = '## Acceptance Criteria\n- AC1: Test';
      const newContent = '## Acceptance Criteria\n- AC1: Test';

      const changes = detectChanges(oldContent, newContent);

      expect(changes.acceptanceCriteriaChanged).toBe(false);
    });
  });
});

describe('Story Update Hook - Changelog Generation', () => {
  test('should generate changelog for status change', () => {
    const changes = {
      status: { changed: true, from: 'Draft', to: 'In Progress' },
      tasksCompleted: [],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: false,
    };

    const changelog = generateChangelog(changes);

    expect(changelog).toContain('Status: Draft → In Progress');
  });

  test('should generate changelog for completed tasks', () => {
    const changes = {
      status: { changed: false },
      tasksCompleted: ['Task 1', 'Task 2'],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: false,
    };

    const changelog = generateChangelog(changes);

    expect(changelog).toContain('Completed tasks:');
    expect(changelog).toContain('• Task 1');
    expect(changelog).toContain('• Task 2');
  });

  test('should generate changelog for added files', () => {
    const changes = {
      status: { changed: false },
      tasksCompleted: [],
      filesAdded: ['common/utils/new-file.js', 'tests/new-test.js'],
      devNotesAdded: false,
      acceptanceCriteriaChanged: false,
    };

    const changelog = generateChangelog(changes);

    expect(changelog).toContain('Files added:');
    expect(changelog).toContain('• common/utils/new-file.js');
    expect(changelog).toContain('• tests/new-test.js');
  });

  test('should generate changelog for dev notes', () => {
    const changes = {
      status: { changed: false },
      tasksCompleted: [],
      filesAdded: [],
      devNotesAdded: true,
      devNotesContent: 'Implementation note',
      acceptanceCriteriaChanged: false,
    };

    const changelog = generateChangelog(changes);

    expect(changelog).toContain('Dev notes updated');
  });

  test('should generate changelog for acceptance criteria changes', () => {
    const changes = {
      status: { changed: false },
      tasksCompleted: [],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: true,
    };

    const changelog = generateChangelog(changes);

    expect(changelog).toContain('Acceptance criteria modified');
  });

  test('should generate comprehensive changelog with multiple changes', () => {
    const changes = {
      status: { changed: true, from: 'Draft', to: 'In Progress' },
      tasksCompleted: ['Setup environment', 'Write tests'],
      filesAdded: ['src/module.js'],
      devNotesAdded: true,
      devNotesContent: 'Note',
      acceptanceCriteriaChanged: false,
    };

    const changelog = generateChangelog(changes);

    expect(changelog).toContain('Status: Draft → In Progress');
    expect(changelog).toContain('Completed tasks:');
    expect(changelog).toContain('Files added:');
    expect(changelog).toContain('Dev notes updated');
  });

  test('should return empty string when no changes detected', () => {
    const changes = {
      status: { changed: false },
      tasksCompleted: [],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: false,
    };

    const changelog = generateChangelog(changes);

    expect(changelog).toBe('');
  });
});

describe('Story Update Hook - ClickUp Synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should sync status change to ClickUp', async () => {
    clickupHelpers.updateStoryStatus.mockResolvedValue({ success: true });

    const storyFile = {
      metadata: {
        clickup_task_id: 'story-123',
        status: 'In Progress',
      },
      content: '---\nstatus: In Progress\n---\nContent',
    };

    const changes = {
      status: { changed: true, from: 'Draft', to: 'In Progress' },
      tasksCompleted: [],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: false,
    };

    await syncStoryToClickUp(storyFile, changes);

    expect(clickupHelpers.updateStoryStatus).toHaveBeenCalledWith(
      'story-123',
      'In Progress',
    );
  });

  test('should add changelog comment to ClickUp', async () => {
    clickupHelpers.addTaskComment.mockResolvedValue({ success: true });

    const storyFile = {
      metadata: {
        clickup_task_id: 'story-456',
      },
    };

    const changes = {
      status: { changed: false },
      tasksCompleted: ['Task 1', 'Task 2'],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: false,
    };

    await syncStoryToClickUp(storyFile, changes);

    expect(clickupHelpers.addTaskComment).toHaveBeenCalledWith(
      'story-456',
      expect.stringContaining('Completed tasks:'),
    );
  });

  test('should update task description when acceptance criteria changed', async () => {
    clickupHelpers.updateTaskDescription.mockResolvedValue({ success: true });

    const storyFile = {
      metadata: {
        clickup_task_id: 'story-789',
      },
      content: '## Acceptance Criteria\n- AC1: Updated',
    };

    const changes = {
      status: { changed: false },
      tasksCompleted: [],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: true,
    };

    await syncStoryToClickUp(storyFile, changes);

    expect(clickupHelpers.updateTaskDescription).toHaveBeenCalledWith(
      'story-789',
      expect.stringContaining('AC1: Updated'),
    );
  });

  test('should handle sync when no changes detected', async () => {
    const storyFile = {
      metadata: { clickup_task_id: 'story-000' },
    };

    const changes = {
      status: { changed: false },
      tasksCompleted: [],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: false,
    };

    await syncStoryToClickUp(storyFile, changes);

    expect(clickupHelpers.updateStoryStatus).not.toHaveBeenCalled();
    expect(clickupHelpers.addTaskComment).not.toHaveBeenCalled();
    expect(clickupHelpers.updateTaskDescription).not.toHaveBeenCalled();
  });
});

describe('Story Update Hook - Frontmatter Timestamp Update', () => {
  test('should update last_updated timestamp in frontmatter', () => {
    const content = '---\ntitle: My Story\nstatus: Draft\n---\nStory content';

    const updated = updateFrontmatterTimestamp(content);

    expect(updated).toMatch(/last_updated: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('should preserve existing frontmatter fields', () => {
    const content = '---\ntitle: My Story\nstatus: In Progress\nepic: 5\n---\nContent';

    const updated = updateFrontmatterTimestamp(content);

    expect(updated).toContain('title: My Story');
    expect(updated).toContain('status: In Progress');
    expect(updated).toContain('epic: 5');
  });

  test('should replace existing last_updated timestamp', () => {
    const content = '---\nlast_updated: 2024-01-01T00:00:00Z\n---\nContent';

    const updated = updateFrontmatterTimestamp(content);

    expect(updated).not.toContain('2024-01-01T00:00:00Z');
    expect(updated).toMatch(/last_updated: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('should handle content without frontmatter', () => {
    const content = 'Story content without frontmatter';

    const updated = updateFrontmatterTimestamp(content);

    expect(updated).toBe(content); // Should return unchanged
  });
});

describe('Story Update Hook - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle missing metadata gracefully', async () => {
    const storyFile = {
      content: 'Story content',
      // No metadata
    };

    const changes = {
      status: { changed: true, from: 'Draft', to: 'In Progress' },
      tasksCompleted: [],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: false,
    };

    await expect(syncStoryToClickUp(storyFile, changes)).resolves.not.toThrow();
    expect(clickupHelpers.updateStoryStatus).not.toHaveBeenCalled();
  });

  test('should handle network failures during status update', async () => {
    clickupHelpers.updateStoryStatus.mockRejectedValue(
      new Error('Network error'),
    );

    const storyFile = {
      metadata: {
        clickup_task_id: 'story-fail-1',
        status: 'In Progress',
      },
    };

    const changes = {
      status: { changed: true, from: 'Draft', to: 'In Progress' },
      tasksCompleted: [],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: false,
    };

    await expect(syncStoryToClickUp(storyFile, changes)).rejects.toThrow('Network error');
  });

  test('should handle invalid task_id in metadata', async () => {
    clickupHelpers.updateStoryStatus.mockRejectedValue(
      new Error('Task not found'),
    );

    const storyFile = {
      metadata: {
        clickup_task_id: 'invalid-task-id',
        status: 'In Progress',
      },
    };

    const changes = {
      status: { changed: true, from: 'Draft', to: 'In Progress' },
      tasksCompleted: [],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: false,
    };

    await expect(syncStoryToClickUp(storyFile, changes)).rejects.toThrow('Task not found');
  });

  test('should handle ClickUp API rate limit errors', async () => {
    clickupHelpers.addTaskComment.mockRejectedValue(
      new Error('Rate limit exceeded'),
    );

    const storyFile = {
      metadata: { clickup_task_id: 'story-rate-limit' },
    };

    const changes = {
      status: { changed: false },
      tasksCompleted: ['Task 1'],
      filesAdded: [],
      devNotesAdded: false,
      acceptanceCriteriaChanged: false,
    };

    await expect(syncStoryToClickUp(storyFile, changes)).rejects.toThrow('Rate limit exceeded');
  });

  test('should handle malformed story content in detectChanges', () => {
    const oldContent = null;
    const newContent = '---\nstatus: Draft\n---\nContent';

    expect(() => detectChanges(oldContent, newContent)).not.toThrow();
  });
});
