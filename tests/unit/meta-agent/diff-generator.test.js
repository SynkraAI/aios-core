const DiffGenerator = require('../../../aios-core/utils/diff-generator');
const yaml = require('js-yaml');

// Mock chalk for testing
jest.mock('chalk', () => ({
  green: (text) => `[GREEN]${text}[/GREEN]`,
  red: (text) => `[RED]${text}[/RED]`,
  gray: (text) => `[GRAY]${text}[/GRAY]`,
  cyan: (text) => `[CYAN]${text}[/CYAN]`,
  yellow: (text) => `[YELLOW]${text}[/YELLOW]`
}));

describe('DiffGenerator', () => {
  let diffGenerator;

  beforeEach(() => {
    diffGenerator = new DiffGenerator();
  });

  describe('generateUnifiedDiff', () => {
    test('should generate basic diff', () => {
      const original = 'Line 1\nLine 2\nLine 3';
      const modified = 'Line 1\nLine 2 Modified\nLine 3\nLine 4';

      const diff = diffGenerator.generateUnifiedDiff(
        original,
        modified,
        'test.txt',
        { colorize: false }
      );

      expect(diff).toContain('--- test.txt\tCurrent Version');
      expect(diff).toContain('+++ test.txt\tModified Version');
      expect(diff).toContain('-Line 2');
      expect(diff).toContain('+Line 2 Modified');
      expect(diff).toContain('+Line 4');
    });

    test('should colorize diff when enabled', () => {
      const original = 'Line 1\nLine 2';
      const modified = 'Line 1\nLine 2 Modified';

      const diff = diffGenerator.generateUnifiedDiff(
        original,
        modified,
        'test.txt',
        { colorize: true }
      );

      expect(diff).toContain('[RED]');
      expect(diff).toContain('[GREEN]');
      expect(diff).toContain('[CYAN]');
    });
  });

  describe('generateYamlDiff', () => {
    test('should detect added sections', () => {
      const original = yaml.dump({
        name: 'test',
        version: '1.0'
      });

      const modified = yaml.dump({
        name: 'test',
        version: '1.0',
        newSection: { key: 'value' }
      });

      const diff = diffGenerator.generateYamlDiff(original, modified, 'test-component');

      expect(diff.summary.added).toContain('newSection');
      expect(diff.sections.newSection.status).toBe('added');
    });

    test('should detect removed sections', () => {
      const original = yaml.dump({
        name: 'test',
        version: '1.0',
        deprecated: true
      });

      const modified = yaml.dump({
        name: 'test',
        version: '1.0'
      });

      const diff = diffGenerator.generateYamlDiff(original, modified, 'test-component');

      expect(diff.summary.removed).toContain('deprecated');
      expect(diff.sections.deprecated.status).toBe('removed');
    });

    test('should detect modified sections', () => {
      const original = yaml.dump({
        name: 'test',
        version: '1.0',
        dependencies: ['dep1', 'dep2']
      });

      const modified = yaml.dump({
        name: 'test',
        version: '1.1',
        dependencies: ['dep1', 'dep2', 'dep3']
      });

      const diff = diffGenerator.generateYamlDiff(original, modified, 'test-component');

      expect(diff.summary.modified).toContain('version');
      expect(diff.summary.modified).toContain('dependencies');
      expect(diff.sections.version.original).toBe('1.0');
      expect(diff.sections.version.modified).toBe('1.1');
    });
  });

  describe('generateAgentDiff', () => {
    test('should handle agent content format', () => {
      const originalContent = `---
name: test-agent
id: test
dependencies:
  tasks:
    - task1.md
---

# Test Agent

Original content`;

      const modifiedContent = `---
name: test-agent
id: test
dependencies:
  tasks:
    - task1.md
    - task2.md
---

# Test Agent

Modified content`;

      const diff = diffGenerator.generateAgentDiff(
        originalContent,
        modifiedContent,
        'test-agent'
      );

      expect(diff.agent).toBe('test-agent');
      expect(diff.yamlChanges).toBeDefined();
      expect(diff.markdownChanges).toBeDefined();
      expect(diff.impactSummary).toBeInstanceOf(Array);
    });

    test('should throw error for invalid agent content', () => {
      const invalidContent = 'No YAML frontmatter here';

      expect(() => {
        diffGenerator.generateAgentDiff(
          invalidContent,
          invalidContent,
          'test-agent'
        );
      }).toThrow('Invalid agent content format');
    });
  });

  describe('compareValues', () => {
    test('should compare arrays', () => {
      const original = ['a', 'b', 'c'];
      const modified = ['a', 'c', 'd'];

      const changes = diffGenerator.compareValues(original, modified);

      const added = changes.find(c => c.type === 'added');
      const removed = changes.find(c => c.type === 'removed');

      expect(added.items).toEqual(['d']);
      expect(removed.items).toEqual(['b']);
    });

    test('should compare objects', () => {
      const original = { a: 1, b: 2, c: 3 };
      const modified = { a: 1, b: 5, d: 4 };

      const changes = diffGenerator.compareValues(original, modified);

      expect(changes).toContainEqual({
        type: 'removed',
        key: 'c',
        value: 3
      });

      expect(changes).toContainEqual({
        type: 'added',
        key: 'd',
        value: 4
      });

      expect(changes).toContainEqual({
        type: 'modified',
        key: 'b',
        original: 2,
        modified: 5
      });
    });

    test('should compare primitive values', () => {
      const changes = diffGenerator.compareValues('old', 'new');

      expect(changes).toEqual([{
        type: 'value_changed',
        original: 'old',
        modified: 'new'
      }]);
    });
  });

  describe('generateDiffSummary', () => {
    test('should format summary correctly', () => {
      const diff = {
        summary: {
          added: ['feature1', 'feature2'],
          modified: ['config'],
          removed: ['deprecated']
        }
      };

      const summary = diffGenerator.generateDiffSummary(diff);

      expect(summary).toContain('=== Modification Summary ===');
      expect(summary).toContain('[GREEN]+ Added (2):[/GREEN]');
      expect(summary).toContain('[GREEN]  + feature1[/GREEN]');
      expect(summary).toContain('[CYAN]~ Modified (1):[/CYAN]');
      expect(summary).toContain('[RED]- Removed (1):[/RED]');
    });
  });

  describe('generateSideBySideDiff', () => {
    test('should create side-by-side view', () => {
      const original = 'Line 1\nLine 2\nLine 3';
      const modified = 'Line 1\nLine 2 Modified\nLine 3\nLine 4';

      const sideBySide = diffGenerator.generateSideBySideDiff(
        original,
        modified,
        { width: 50, gutter: 3 }
      );

      expect(sideBySide).toContain('Original');
      expect(sideBySide).toContain('Modified');
      expect(sideBySide).toContain('─'.repeat(50));
    });

    test('should highlight differences', () => {
      const original = 'Same\nDifferent';
      const modified = 'Same\nChanged';

      const sideBySide = diffGenerator.generateSideBySideDiff(
        original,
        modified,
        { width: 40 }
      );

      // Line with "Same" should not be colored
      // Line with "Different" vs "Changed" should be colored
      expect(sideBySide).toContain('[RED]');
      expect(sideBySide).toContain('[GREEN]');
    });
  });

  describe('generateImpactSummary', () => {
    test('should identify dependency impacts', () => {
      const yamlDiff = {
        sections: {
          dependencies: {
            changes: [
              { type: 'added', items: ['new-dep.md'] },
              { type: 'removed', items: ['old-dep.md'] }
            ]
          }
        }
      };

      const impacts = diffGenerator.generateImpactSummary(yamlDiff);

      expect(impacts).toContain('New dependency added: new-dep.md');
      expect(impacts).toContain('Dependency removed: old-dep.md');
    });

    test('should identify command changes', () => {
      const yamlDiff = {
        sections: {
          commands: { status: 'modified' }
        }
      };

      const impacts = diffGenerator.generateImpactSummary(yamlDiff);

      expect(impacts).toContain('Commands modified - users may need to update their workflows');
    });

    test('should identify persona changes', () => {
      const yamlDiff = {
        sections: {
          persona: { status: 'modified' }
        }
      };

      const impacts = diffGenerator.generateImpactSummary(yamlDiff);

      expect(impacts).toContain('Agent persona modified - behavior may change');
    });
  });
});