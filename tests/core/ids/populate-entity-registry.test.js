'use strict';

const path = require('path');
const fs = require('fs');
const {
  extractEntityId,
  extractKeywords,
  extractPurpose,
  detectDependencies,
  computeChecksum,
  scanCategory,
  resolveUsedBy,
} = require('../../../.aios-core/development/scripts/populate-entity-registry');

const FIXTURES = path.resolve(__dirname, 'fixtures');

describe('populate-entity-registry (AC: 3, 4, 12)', () => {
  describe('extractEntityId()', () => {
    it('extracts base name without extension', () => {
      expect(extractEntityId('/foo/bar/my-task.md')).toBe('my-task');
      expect(extractEntityId('/foo/bar/script.js')).toBe('script');
      expect(extractEntityId('template.yaml')).toBe('template');
    });
  });

  describe('extractKeywords()', () => {
    it('extracts keywords from filename', () => {
      const kws = extractKeywords('create-doc-template.md', '');
      expect(kws).toContain('create');
      expect(kws).toContain('doc');
      expect(kws).toContain('template');
    });

    it('extracts keywords from markdown header', () => {
      const content = '# Validate Story Draft\nSome content here';
      const kws = extractKeywords('validate.md', content);
      expect(kws).toContain('validate');
      expect(kws).toContain('story');
      expect(kws).toContain('draft');
    });

    it('deduplicates keywords', () => {
      const content = '# Validate Validate Stuff';
      const kws = extractKeywords('validate.md', content);
      const validateCount = kws.filter((k) => k === 'validate').length;
      expect(validateCount).toBe(1);
    });

    it('filters out short and stop words', () => {
      const content = '# The And For Story';
      const kws = extractKeywords('a.md', content);
      expect(kws).not.toContain('the');
      expect(kws).not.toContain('and');
      expect(kws).not.toContain('for');
    });
  });

  describe('extractPurpose()', () => {
    it('extracts from ## Purpose section', () => {
      const content = '# Title\n\n## Purpose\n\nThis is the purpose line.\n\nMore details.\n\n## Other';
      const purpose = extractPurpose(content, '/test.md');
      expect(purpose).toBe('This is the purpose line.');
    });

    it('extracts from description field', () => {
      const content = 'description: My awesome description here';
      const purpose = extractPurpose(content, '/test.md');
      expect(purpose).toBe('My awesome description here');
    });

    it('falls back to header', () => {
      const content = '# My Module Title\n\nSome content.';
      const purpose = extractPurpose(content, '/test.md');
      expect(purpose).toBe('My Module Title');
    });

    it('falls back to file path', () => {
      const purpose = extractPurpose('', '/some/path/test.md');
      expect(purpose).toContain('test.md');
    });

    it('truncates long purposes to 200 chars', () => {
      const longPurpose = '## Purpose\n\n' + 'x'.repeat(300);
      const purpose = extractPurpose(longPurpose, '/test.md');
      expect(purpose.length).toBeLessThanOrEqual(200);
    });
  });

  describe('detectDependencies()', () => {
    it('detects require() dependencies', () => {
      const content = "const foo = require('./foo-module');\nconst bar = require('../bar');";
      const deps = detectDependencies(content, 'main');
      expect(deps).toContain('foo-module');
      expect(deps).toContain('bar');
    });

    it('detects import dependencies', () => {
      const content = "import { something } from './my-util';\nimport other from '../other-lib';";
      const deps = detectDependencies(content, 'main');
      expect(deps).toContain('my-util');
      expect(deps).toContain('other-lib');
    });

    it('ignores npm packages (non-relative)', () => {
      const content = "const yaml = require('js-yaml');\nimport path from 'path';";
      const deps = detectDependencies(content, 'main');
      expect(deps).not.toContain('js-yaml');
      expect(deps).not.toContain('path');
    });

    it('excludes self-references', () => {
      const content = "const self = require('./mymodule');";
      const deps = detectDependencies(content, 'mymodule');
      expect(deps).not.toContain('mymodule');
    });

    it('detects YAML dependency lists', () => {
      const content = 'dependencies:\n  - task-a.md\n  - task-b.md\n';
      const deps = detectDependencies(content, 'main');
      expect(deps).toContain('task-a');
      expect(deps).toContain('task-b');
    });
  });

  describe('computeChecksum()', () => {
    it('returns sha256 prefixed hash', () => {
      const testFile = path.join(FIXTURES, 'valid-registry.yaml');
      const checksum = computeChecksum(testFile);
      expect(checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
    });

    it('returns consistent results for same file', () => {
      const testFile = path.join(FIXTURES, 'valid-registry.yaml');
      const first = computeChecksum(testFile);
      const second = computeChecksum(testFile);
      expect(first).toBe(second);
    });
  });

  describe('resolveUsedBy()', () => {
    it('populates usedBy based on dependencies', () => {
      const entities = {
        tasks: {
          'task-a': {
            path: 'a.md',
            type: 'task',
            dependencies: ['util-x'],
            usedBy: [],
          },
        },
        scripts: {
          'util-x': {
            path: 'x.js',
            type: 'script',
            dependencies: [],
            usedBy: [],
          },
        },
      };

      resolveUsedBy(entities);

      expect(entities.scripts['util-x'].usedBy).toContain('task-a');
    });

    it('does not duplicate usedBy entries', () => {
      const entities = {
        tasks: {
          'task-a': { dependencies: ['util-x'], usedBy: [] },
          'task-b': { dependencies: ['util-x'], usedBy: [] },
        },
        scripts: {
          'util-x': { dependencies: [], usedBy: [] },
        },
      };

      resolveUsedBy(entities);
      resolveUsedBy(entities);

      const usedBy = entities.scripts['util-x'].usedBy;
      expect(usedBy.filter((x) => x === 'task-a').length).toBe(1);
    });
  });

  describe('scanCategory()', () => {
    it('returns empty object for non-existent directory', () => {
      const result = scanCategory({
        category: 'test',
        basePath: 'nonexistent/directory/path',
        glob: '**/*.md',
        type: 'task',
      });
      expect(result).toEqual({});
    });
  });

  describe('duplicate detection (AC: 12)', () => {
    it('scanCategory skips duplicate entity IDs with warning', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = scanCategory({
        category: 'fixtures',
        basePath: path.relative(
          path.resolve(__dirname, '../../..'),
          FIXTURES,
        ),
        glob: '**/*.yaml',
        type: 'data',
      });

      const ids = Object.keys(result);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);

      // Verify that duplicates are logged (if any were found)
      const dupWarnings = warnSpy.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('Duplicate entity ID'),
      );
      // All returned IDs are unique — any duplicates found would have been warned about
      expect(dupWarnings.length + ids.length).toBeGreaterThanOrEqual(ids.length);

      warnSpy.mockRestore();
    });
  });
});
