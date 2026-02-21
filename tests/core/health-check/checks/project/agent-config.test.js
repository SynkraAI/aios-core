/**
 * Unit tests for AgentConfigCheck
 *
 * Tests agent config validation: directory scanning, MD frontmatter,
 * YAML validation, and edge cases.
 */

const fs = require('fs').promises;
const path = require('path');
const AgentConfigCheck = require('../../../../../.aios-core/core/health-check/checks/project/agent-config');

jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('AgentConfigCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    check = new AgentConfigCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('project.agent-config');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });
  });

  describe('execute - no agents', () => {
    test('passes when no agent directories found', async () => {
      fs.readdir.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('No agent configurations');
    });
  });

  describe('execute - valid agents', () => {
    test('passes with valid MD agents', async () => {
      fs.readdir.mockImplementation((p) => {
        if (p.includes('agents')) return Promise.resolve(['dev.md', 'qa.md']);
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('---\nname: Dev Agent\n---\n# Dev\n');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('2');
    });

    test('passes with valid YAML agents', async () => {
      fs.readdir.mockImplementation((p) => {
        if (p.includes('agents')) return Promise.resolve(['config.yml']);
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('name: test\nversion: 1.0\n');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });

  describe('execute - invalid agents', () => {
    test('warns with invalid frontmatter', async () => {
      fs.readdir.mockImplementation((p) => {
        if (p.includes('agents')) return Promise.resolve(['bad.md']);
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('# No frontmatter\nJust content.\n');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('issues');
    });

    test('warns with unreadable files', async () => {
      fs.readdir.mockImplementation((p) => {
        if (p.includes('agents')) return Promise.resolve(['broken.md']);
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockRejectedValue(new Error('EPERM'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
    });
  });

  describe('validateMarkdownAgent', () => {
    test('returns true with valid frontmatter', () => {
      expect(check.validateMarkdownAgent('---\nname: Test\n---\n# Test')).toBe(true);
    });

    test('returns true with id field', () => {
      expect(check.validateMarkdownAgent('---\nid: test-agent\n---\n')).toBe(true);
    });

    test('returns false without frontmatter', () => {
      expect(check.validateMarkdownAgent('# Just markdown\nNo frontmatter')).toBe(false);
    });
  });

  describe('validateYaml', () => {
    test('returns false for YAML with tab indentation', () => {
      const result = check.validateYaml('key:\n\tvalue: bad\n');
      expect(result).toBe(false);
    });

    test('returns true for valid YAML', () => {
      const result = check.validateYaml('name: agent\nversion: 1\n');
      expect(result).toBe(true);
    });
  });
});
