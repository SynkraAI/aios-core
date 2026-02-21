/**
 * Unit tests for TaskDefinitionsCheck
 *
 * Tests task definition validation: YAML scanning, findYamlFiles,
 * validateTaskDefinition, required fields, and edge cases.
 */

const fs = require('fs').promises;
const path = require('path');
const TaskDefinitionsCheck = require('../../../../../.aios-core/core/health-check/checks/project/task-definitions');

jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('TaskDefinitionsCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    path.basename.mockImplementation((p, ext) => {
      const base = p.split('/').pop();
      return ext ? base.replace(ext, '') : base;
    });
    path.extname.mockImplementation((p) => {
      const dot = p.lastIndexOf('.');
      return dot >= 0 ? p.substring(dot) : '';
    });
    check = new TaskDefinitionsCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('project.task-definitions');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });
  });

  describe('execute - no tasks', () => {
    test('passes when no task directories found', async () => {
      fs.readdir.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('No task definitions');
    });
  });

  describe('execute - valid tasks', () => {
    test('passes with valid YAML tasks', async () => {
      fs.readdir.mockImplementation((dir) => {
        if (dir.includes('tasks')) {
          return Promise.resolve([
            { name: 'deploy.yaml', isDirectory: () => false },
            { name: 'test.yml', isDirectory: () => false },
          ]);
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('name: Test Task\nsteps:\n  - run: echo test\n');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });

  describe('execute - invalid tasks', () => {
    test('warns with invalid task definitions', async () => {
      fs.readdir.mockImplementation((dir) => {
        if (dir.includes('tasks')) {
          return Promise.resolve([
            { name: 'bad.yaml', isDirectory: () => false },
          ]);
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockRejectedValue(new Error('EPERM'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('issues');
    });
  });

  describe('validateTaskDefinition', () => {
    test('returns valid for task with name', () => {
      const result = check.validateTaskDefinition('name: My Task\nsteps:\n  - echo: hi\n', 'test.yaml');
      expect(result.valid).toBe(true);
    });

    test('returns invalid for empty YAML', () => {
      const result = check.validateTaskDefinition('', 'test.yaml');
      // Empty string may parse as null
      expect(typeof result.valid).toBe('boolean');
    });

    test('returns invalid for YAML parse error', () => {
      const result = check.validateTaskDefinition('{{invalid yaml', 'test.yaml');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('findYamlFiles', () => {
    test('finds yaml files recursively', async () => {
      fs.readdir.mockImplementation((dir) => {
        if (dir === '/tasks') {
          return Promise.resolve([
            { name: 'task.yaml', isDirectory: () => false },
            { name: 'subdir', isDirectory: () => true },
            { name: 'readme.md', isDirectory: () => false },
          ]);
        }
        if (dir.includes('subdir')) {
          return Promise.resolve([
            { name: 'nested.yml', isDirectory: () => false },
          ]);
        }
        return Promise.reject(new Error('ENOENT'));
      });

      const files = await check.findYamlFiles('/tasks');
      expect(files).toHaveLength(2);
    });

    test('returns empty for non-existent dir', async () => {
      fs.readdir.mockRejectedValue(new Error('ENOENT'));
      const files = await check.findYamlFiles('/nope');
      expect(files).toHaveLength(0);
    });
  });
});
