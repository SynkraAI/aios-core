/**
 * Unit tests for WorkflowDependenciesCheck
 *
 * Tests workflow dependency validation: YAML scanning, dependency extraction,
 * missing task/workflow detection, and edge cases.
 */

const fs = require('fs').promises;
const path = require('path');
const WorkflowDependenciesCheck = require('../../../../../.aios-core/core/health-check/checks/project/workflow-dependencies');

jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('WorkflowDependenciesCheck', () => {
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
    check = new WorkflowDependenciesCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('project.workflow-dependencies');
    });

    test('has LOW severity', () => {
      expect(check.severity).toBe('LOW');
    });
  });

  describe('execute - no workflows', () => {
    test('passes when no workflow directories found', async () => {
      fs.readdir.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('No workflows');
    });
  });

  describe('execute - satisfied dependencies', () => {
    test('passes when all dependencies satisfied', async () => {
      fs.readdir.mockImplementation((dir) => {
        if (dir.includes('tasks')) {
          return Promise.resolve([
            { name: 'deploy-task.yaml', isDirectory: () => false },
          ]);
        }
        if (dir.includes('workflows')) {
          return Promise.resolve([
            { name: 'main.yaml', isDirectory: () => false },
          ]);
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('steps:\n  - task: deploy-task\n');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('satisfied');
    });
  });

  describe('execute - missing dependencies', () => {
    test('warns when workflow references missing task', async () => {
      fs.readdir.mockImplementation((dir) => {
        if (dir.includes('workflows')) {
          return Promise.resolve([
            { name: 'main.yaml', isDirectory: () => false },
          ]);
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('steps:\n  - task: nonexistent-task\n');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('issue');
    });
  });

  describe('extractDependencies', () => {
    test('extracts task dependencies from steps', () => {
      const content = 'steps:\n  - task: build\n  - task: test\n';
      const deps = check.extractDependencies(content);
      expect(deps.tasks).toContain('build');
      expect(deps.tasks).toContain('test');
    });

    test('extracts workflow dependencies from steps', () => {
      const content = 'steps:\n  - workflow: deploy\n';
      const deps = check.extractDependencies(content);
      expect(deps.workflows).toContain('deploy');
    });

    test('extracts from dependencies section', () => {
      const content = 'dependencies:\n  tasks:\n    - lint\n  workflows:\n    - ci\n';
      const deps = check.extractDependencies(content);
      expect(deps.tasks).toContain('lint');
      expect(deps.workflows).toContain('ci');
    });

    test('returns empty for invalid YAML', () => {
      const deps = check.extractDependencies('{{bad yaml');
      expect(deps.tasks).toHaveLength(0);
      expect(deps.workflows).toHaveLength(0);
    });
  });
});
