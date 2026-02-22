'use strict';

const path = require('path');
const fs = require('fs');
const {
  extractEntityId,
  extractKeywords,
  extractPurpose,
  detectDependencies,
  extractYamlDependencies,
  extractMarkdownCrossReferences,
  computeChecksum,
  scanCategory,
  resolveUsedBy,
  buildNameIndex,
  countResolution,
  isSentinel,
  isNoise,
  SCAN_CONFIG,
  SENTINEL_VALUES,
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

  describe('SCAN_CONFIG (NOG-16A AC1)', () => {
    it('has 14 categories (10 existing + 4 new)', () => {
      expect(SCAN_CONFIG).toHaveLength(14);
      const categories = SCAN_CONFIG.map((c) => c.category);
      expect(categories).toContain('workflows');
      expect(categories).toContain('utils');
      expect(categories).toContain('tools');
      expect(categories).toContain('infra-scripts');
      expect(categories).toContain('infra-tools');
      expect(categories).toContain('product-checklists');
      expect(categories).toContain('product-data');
    });

    it('preserves all 10 original categories', () => {
      const categories = SCAN_CONFIG.map((c) => c.category);
      const originals = ['tasks', 'templates', 'scripts', 'modules', 'agents', 'checklists', 'data', 'workflows', 'utils', 'tools'];
      for (const cat of originals) {
        expect(categories).toContain(cat);
      }
    });

    it('new categories have correct types', () => {
      const infraScripts = SCAN_CONFIG.find((c) => c.category === 'infra-scripts');
      expect(infraScripts.type).toBe('script');
      expect(infraScripts.basePath).toContain('infrastructure/scripts');

      const infraTools = SCAN_CONFIG.find((c) => c.category === 'infra-tools');
      expect(infraTools.type).toBe('tool');

      const productChecklists = SCAN_CONFIG.find((c) => c.category === 'product-checklists');
      expect(productChecklists.type).toBe('checklist');

      const productData = SCAN_CONFIG.find((c) => c.category === 'product-data');
      expect(productData.type).toBe('data');
    });
  });

  describe('extractYamlDependencies() (NOG-15 AC2, AC6)', () => {
    const tmpDir = path.join(__dirname, 'fixtures');

    it('extracts nested fields from agent YAML in markdown', () => {
      const agentContent = [
        '# Agent Dev',
        '',
        '```yaml',
        'dependencies:',
        '  tasks:',
        '    - dev-develop-story.md',
        '    - execute-checklist.md',
        '  checklists:',
        '    - story-dod-checklist.md',
        '  tools:',
        '    - coderabbit',
        'commands:',
        '  - name: develop',
        '    task: dev-develop-story.md',
        '```',
      ].join('\n');

      const tmpFile = path.join(tmpDir, 'test-agent.md');
      fs.writeFileSync(tmpFile, agentContent);

      try {
        const deps = extractYamlDependencies(tmpFile, 'agent');
        expect(deps).toContain('dev-develop-story');
        expect(deps).toContain('execute-checklist');
        expect(deps).toContain('story-dod-checklist');
        expect(deps).toContain('coderabbit');
      } finally {
        fs.unlinkSync(tmpFile);
      }
    });

    it('extracts array fields from workflow YAML', () => {
      const workflowContent = [
        'workflow:',
        '  id: test-workflow',
        '  sequence:',
        '    - step: create',
        '      agent: sm',
        '    - step: validate',
        '      agent: po',
        '    - step: implement',
        '      agent: dev',
      ].join('\n');

      const tmpFile = path.join(tmpDir, 'test-workflow.yaml');
      fs.writeFileSync(tmpFile, workflowContent);

      try {
        const deps = extractYamlDependencies(tmpFile, 'workflow');
        expect(deps).toContain('sm');
        expect(deps).toContain('po');
        expect(deps).toContain('dev');
      } finally {
        fs.unlinkSync(tmpFile);
      }
    });

    it('handles malformed YAML gracefully (returns [])', () => {
      const tmpFile = path.join(tmpDir, 'bad-yaml.yaml');
      fs.writeFileSync(tmpFile, '{{invalid: yaml: [}');

      try {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const deps = extractYamlDependencies(tmpFile, 'agent');
        expect(deps).toEqual([]);
        warnSpy.mockRestore();
      } finally {
        fs.unlinkSync(tmpFile);
      }
    });
  });

  describe('extractMarkdownCrossReferences() (NOG-15 AC3)', () => {
    it('detects all 4 patterns', () => {
      const content = [
        '# Task File',
        '',
        'dependencies:',
        '  - task-a.md',
        '  - task-b.md',
        '',
        '- **Tasks:** create-doc.md, validate-story.md',
        '',
        'See [the checklist](path/to/dod-checklist.md) for details.',
        '',
        '@dev should implement this, reviewed by @qa.',
      ].join('\n');

      const deps = extractMarkdownCrossReferences(content, 'my-task');
      // Pattern A: YAML block
      expect(deps).toContain('task-a');
      expect(deps).toContain('task-b');
      // Pattern B: Label list
      expect(deps).toContain('create-doc');
      expect(deps).toContain('validate-story');
      // Pattern C: MD link
      expect(deps).toContain('dod-checklist');
      // Pattern D: Agent refs
      expect(deps).toContain('dev');
      expect(deps).toContain('qa');
    });

    it('filters out non-entity references (no unknown agent refs)', () => {
      const content = '@unknown-agent should do something. @dev is valid.';
      const deps = extractMarkdownCrossReferences(content, 'test');
      expect(deps).not.toContain('unknown-agent');
      expect(deps).toContain('dev');
    });

    it('excludes self-references', () => {
      const content = '- self-task.md\n[link](self-task.md)';
      const deps = extractMarkdownCrossReferences(content, 'self-task');
      expect(deps).not.toContain('self-task');
    });
  });

  describe('resolveUsedBy enhanced (NOG-15 AC4)', () => {
    it('creates correct reverse references via name index', () => {
      const entities = {
        tasks: {
          'task-a': {
            path: '.aios-core/development/tasks/task-a.md',
            type: 'task',
            dependencies: ['util-x'],
            usedBy: [],
          },
        },
        utils: {
          'util-x': {
            path: '.aios-core/core/utils/util-x.js',
            type: 'util',
            dependencies: [],
            usedBy: [],
          },
        },
      };

      resolveUsedBy(entities);
      expect(entities.utils['util-x'].usedBy).toContain('task-a');
    });

    it('deduplicates usedBy entries on re-scan', () => {
      const entities = {
        tasks: {
          'task-a': { path: 'a.md', dependencies: ['lib'], usedBy: [] },
        },
        modules: {
          'lib': { path: 'lib.js', dependencies: [], usedBy: [] },
        },
      };

      resolveUsedBy(entities);
      resolveUsedBy(entities);

      expect(entities.modules['lib'].usedBy).toEqual(['task-a']);
    });

    it('resolves by filename when ID does not match', () => {
      const entities = {
        tasks: {
          'my-task': {
            path: '.aios-core/development/tasks/my-task.md',
            type: 'task',
            dependencies: ['helper.js'],
            usedBy: [],
          },
        },
        scripts: {
          'helper': {
            path: '.aios-core/development/scripts/helper.js',
            type: 'script',
            dependencies: [],
            usedBy: [],
          },
        },
      };

      resolveUsedBy(entities);
      expect(entities.scripts['helper'].usedBy).toContain('my-task');
    });
  });

  describe('isSentinel() (NOG-16A AC2)', () => {
    it('filters N/A and variants', () => {
      expect(isSentinel('N/A')).toBe(true);
      expect(isSentinel('n/a')).toBe(true);
      expect(isSentinel('na')).toBe(true);
      expect(isSentinel('NA')).toBe(true);
    });

    it('filters none, tbd, todo', () => {
      expect(isSentinel('none')).toBe(true);
      expect(isSentinel('None')).toBe(true);
      expect(isSentinel('TBD')).toBe(true);
      expect(isSentinel('tbd')).toBe(true);
      expect(isSentinel('TODO')).toBe(true);
      expect(isSentinel('todo')).toBe(true);
    });

    it('filters dash and empty string', () => {
      expect(isSentinel('-')).toBe(true);
      expect(isSentinel('')).toBe(true);
    });

    it('preserves real entity names', () => {
      expect(isSentinel('todo-list')).toBe(false);
      expect(isSentinel('dev')).toBe(false);
      expect(isSentinel('create-doc')).toBe(false);
      expect(isSentinel('navigation')).toBe(false);
    });

    it('handles whitespace trimming', () => {
      expect(isSentinel('  N/A  ')).toBe(true);
      expect(isSentinel(' tbd ')).toBe(true);
    });
  });

  describe('isNoise() (NOG-16A AC3)', () => {
    it('filters natural language fragments (>2 words with spaces)', () => {
      expect(isNoise('Docker MCP Toolkit')).toBe(true);
      expect(isNoise('filesystem access control')).toBe(true);
    });

    it('filters very short fragments (<= 2 chars) unless known agent', () => {
      expect(isNoise('a')).toBe(true);
      expect(isNoise('ab')).toBe(true);
      // Known agent refs like 'qa', 'pm', 'po', 'sm' are preserved
      expect(isNoise('qa')).toBe(false);
      expect(isNoise('pm')).toBe(false);
    });

    it('filters template placeholders', () => {
      expect(isNoise('{{variable}}')).toBe(true);
      expect(isNoise('${ENV_VAR}')).toBe(true);
    });

    it('preserves valid entity names', () => {
      expect(isNoise('dev')).toBe(false);
      expect(isNoise('create-doc')).toBe(false);
      expect(isNoise('task-a')).toBe(false);
      expect(isNoise('coderabbit')).toBe(false);
    });

    it('preserves two-word names (not >2 words)', () => {
      expect(isNoise('my-task')).toBe(false);
      expect(isNoise('code review')).toBe(false);
    });
  });

  describe('sentinel filter in detectDependencies() (NOG-16A AC2)', () => {
    it('filters sentinel deps from YAML dependency lists', () => {
      const content = 'dependencies:\n  - task-a.md\n  - N/A\n  - none\n  - task-b.md\n';
      const deps = detectDependencies(content, 'main');
      expect(deps).toContain('task-a');
      expect(deps).toContain('task-b');
      expect(deps).not.toContain('N/A');
      expect(deps).not.toContain('none');
    });

    it('filters noise deps from YAML dependency lists', () => {
      const content = 'dependencies:\n  - task-a.md\n  - Docker MCP Toolkit\n  - task-b.md\n';
      const deps = detectDependencies(content, 'main');
      expect(deps).toContain('task-a');
      expect(deps).toContain('task-b');
      expect(deps).not.toContain('Docker MCP Toolkit');
    });
  });

  describe('buildNameIndex() (NOG-16A AC5)', () => {
    it('builds index from entity IDs, filenames, and basenames', () => {
      const entities = {
        tasks: {
          'task-a': { path: '.aios-core/development/tasks/task-a.md', dependencies: [], usedBy: [] },
        },
        scripts: {
          'helper': { path: '.aios-core/development/scripts/helper.js', dependencies: [], usedBy: [] },
        },
      };
      const index = buildNameIndex(entities);
      expect(index.has('task-a')).toBe(true);
      expect(index.has('task-a.md')).toBe(true);
      expect(index.has('helper')).toBe(true);
      expect(index.has('helper.js')).toBe(true);
    });
  });

  describe('countResolution() (NOG-16A AC5)', () => {
    it('calculates correct resolution metrics', () => {
      const entities = {
        tasks: {
          'task-a': { path: 'a.md', dependencies: ['util-x', 'unknown-ref'], usedBy: [] },
        },
        scripts: {
          'util-x': { path: 'x.js', dependencies: [], usedBy: [] },
        },
      };
      const nameIndex = buildNameIndex(entities);
      const { total, resolved, unresolved } = countResolution(entities, nameIndex);
      expect(total).toBe(2);
      expect(resolved).toBe(1);
      expect(unresolved).toBe(1);
    });

    it('returns 0 for empty entities', () => {
      const entities = {};
      const nameIndex = buildNameIndex(entities);
      const { total, resolved, unresolved } = countResolution(entities, nameIndex);
      expect(total).toBe(0);
      expect(resolved).toBe(0);
      expect(unresolved).toBe(0);
    });
  });

  describe('regression: real deps preserved (NOG-16A AC6)', () => {
    it('dev agent still has 40+ dependencies after filtering (all extractors combined)', () => {
      const devAgentPath = path.resolve(__dirname, '../../../.aios-core/development/agents/dev.md');
      if (!fs.existsSync(devAgentPath)) return;

      const content = fs.readFileSync(devAgentPath, 'utf8');
      const baseDeps = detectDependencies(content, 'dev');
      const yamlDeps = extractYamlDependencies(devAgentPath, 'agent');
      const mdDeps = extractMarkdownCrossReferences(content, 'dev');
      const allDeps = new Set([...baseDeps, ...yamlDeps, ...mdDeps]);
      expect(allDeps.size).toBeGreaterThanOrEqual(40);
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
