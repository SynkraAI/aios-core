/**
 * Unit tests for checklist-runner module
 *
 * Tests the ChecklistRunner class that executes validation checklists
 * programmatically using code-based rules.
 */

jest.mock('fs-extra');
jest.mock('js-yaml');

const fs = require('fs-extra');
const yaml = require('js-yaml');

const ChecklistRunner = require('../../../.aios-core/core/orchestration/checklist-runner');

describe('ChecklistRunner', () => {
  let runner;

  beforeEach(() => {
    jest.resetAllMocks();
    runner = new ChecklistRunner('/project');
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('sets project root and checklists path', () => {
      expect(runner.projectRoot).toBe('/project');
      expect(runner.checklistsPath).toContain('product/checklists');
    });
  });

  // ============================================================
  // loadChecklist
  // ============================================================
  describe('loadChecklist', () => {
    test('loads checklist file', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('- [ ] Check 1');

      const content = await runner.loadChecklist('quality-gate');
      expect(content).toBe('- [ ] Check 1');
    });

    test('appends .md extension', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('content');

      await runner.loadChecklist('quality-gate');
      expect(fs.pathExists).toHaveBeenCalledWith(expect.stringContaining('quality-gate.md'));
    });

    test('does not double append .md', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('content');

      await runner.loadChecklist('quality-gate.md');
      expect(fs.pathExists).toHaveBeenCalledWith(expect.stringContaining('quality-gate.md'));
      expect(fs.pathExists).not.toHaveBeenCalledWith(expect.stringContaining('.md.md'));
    });

    test('returns null when not found', async () => {
      fs.pathExists.mockResolvedValue(false);
      expect(await runner.loadChecklist('missing')).toBeNull();
    });
  });

  // ============================================================
  // parseChecklistItems
  // ============================================================
  describe('parseChecklistItems', () => {
    test('parses markdown checkboxes', () => {
      const content = '- [ ] Check files exist\n- [x] Validate schema\n* [ ] Review code';
      const items = runner.parseChecklistItems(content);

      expect(items).toHaveLength(3);
      expect(items[0].description).toBe('Check files exist');
      expect(items[0].tipo).toBe('manual');
      expect(items[0].blocker).toBe(false);
    });

    test('parses YAML blocks with pre-conditions', () => {
      const content = '```yaml\npre-conditions:\n  - Check requirements\n```';
      yaml.load.mockReturnValue({
        'pre-conditions': ['Check requirements'],
      });

      const items = runner.parseChecklistItems(content);

      expect(items).toHaveLength(1);
      expect(items[0].tipo).toBe('pre-conditions');
      expect(items[0].blocker).toBe(true);
    });

    test('parses YAML blocks with post-conditions and acceptance-criteria', () => {
      const content = '```yml\npost-conditions:\n  - Verify output\nacceptance-criteria:\n  - Meets spec\n```';
      yaml.load.mockReturnValue({
        'post-conditions': ['Verify output'],
        'acceptance-criteria': ['Meets spec'],
      });

      const items = runner.parseChecklistItems(content);
      expect(items).toHaveLength(2);
    });

    test('handles invalid YAML gracefully', () => {
      const content = '```yaml\n{invalid\n```\n- [ ] Manual item';
      yaml.load.mockImplementation(() => { throw new Error('parse error'); });

      const items = runner.parseChecklistItems(content);
      expect(items).toHaveLength(1);
      expect(items[0].description).toBe('Manual item');
    });

    test('skips duplicate items from YAML and markdown', () => {
      const content = '```yaml\npre-conditions:\n  - Check files exist for deployment\n```\n- [ ] Check files exist for deployment readiness';
      yaml.load.mockReturnValue({
        'pre-conditions': ['Check files exist for deployment'],
      });

      const items = runner.parseChecklistItems(content);
      // The markdown checkbox matches first 30 chars of YAML item, so should be skipped
      expect(items).toHaveLength(1);
    });
  });

  // ============================================================
  // normalizeItem
  // ============================================================
  describe('normalizeItem', () => {
    test('normalizes string item', () => {
      const item = runner.normalizeItem('Check files', 'pre-conditions');

      expect(item.description).toBe('Check files');
      expect(item.tipo).toBe('pre-conditions');
      expect(item.blocker).toBe(true);
    });

    test('normalizes string item for post-conditions (not blocker)', () => {
      const item = runner.normalizeItem('Verify', 'post-conditions');
      expect(item.blocker).toBe(false);
    });

    test('normalizes object item with validation', () => {
      const raw = {
        '[ ] Output file exists': null,
        tipo: 'acceptance-criteria',
        blocker: true,
        validação: 'file exists',
        error_message: 'Output missing',
      };

      const item = runner.normalizeItem(raw, 'acceptance-criteria');

      expect(item.description).toBe('Output file exists');
      expect(item.validation).toBe('file exists');
      expect(item.errorMessage).toBe('Output missing');
    });

    test('normalizes object with validation key', () => {
      const raw = {
        'Check structure': null,
        validation: 'not empty',
      };

      const item = runner.normalizeItem(raw, 'post-conditions');
      expect(item.validation).toBe('not empty');
    });
  });

  // ============================================================
  // evaluateItem
  // ============================================================
  describe('evaluateItem', () => {
    test('manual items pass with message', async () => {
      const item = { description: 'Review code', tipo: 'manual', blocker: false, validation: null };
      const result = await runner.evaluateItem(item, '/file.js');

      expect(result.passed).toBe(true);
      expect(result.message).toContain('Manual verification');
    });

    test('items with validation execute it', async () => {
      fs.pathExists.mockResolvedValue(true);
      const item = {
        description: 'File exists',
        tipo: 'pre-conditions',
        blocker: true,
        validation: 'file exists',
      };

      const result = await runner.evaluateItem(item, '/src/index.js');
      expect(result.passed).toBe(true);
    });

    test('handles validation errors', async () => {
      fs.pathExists.mockRejectedValue(new Error('permission denied'));
      const item = {
        description: 'Check file',
        tipo: 'pre-conditions',
        blocker: true,
        validation: 'file exists',
      };

      const result = await runner.evaluateItem(item, '/secret');
      expect(result.passed).toBe(false);
      expect(result.message).toContain('Validation error');
    });

    test('uses custom error message', async () => {
      fs.pathExists.mockResolvedValue(false);
      const item = {
        description: 'Output exists',
        blocker: true,
        validation: 'file exists',
        errorMessage: 'Output file was not generated',
      };

      const result = await runner.evaluateItem(item, '/output.md');
      expect(result.passed).toBe(false);
      expect(result.message).toBe('Output file was not generated');
    });
  });

  // ============================================================
  // executeValidation
  // ============================================================
  describe('executeValidation', () => {
    test('file exists - passes', async () => {
      fs.pathExists.mockResolvedValue(true);
      expect(await runner.executeValidation('file exists', '/src/app.js')).toBe(true);
    });

    test('file exists - fails', async () => {
      fs.pathExists.mockResolvedValue(false);
      expect(await runner.executeValidation('file exists', '/missing.js')).toBe(false);
    });

    test('file exists with array paths', async () => {
      fs.pathExists.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
      expect(await runner.executeValidation('file exists', ['/a.js', '/b.js'])).toBe(true);
    });

    test('directory exists - passes', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      expect(await runner.executeValidation('directory exists', '/src')).toBe(true);
    });

    test('directory exists - fails for file', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => false });
      expect(await runner.executeValidation('directory exists', '/file.txt')).toBe(false);
    });

    test('not empty - passes for non-empty file', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('content here');
      expect(await runner.executeValidation('not empty', '/file.md')).toBe(true);
    });

    test('not empty - fails for empty file', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('   ');
      expect(await runner.executeValidation('not empty', '/file.md')).toBe(false);
    });

    test('contains check - passes', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('# architecture\n## components');
      expect(await runner.executeValidation("contains 'architecture'", '/doc.md')).toBe(true);
    });

    test('contains check - fails', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('# empty doc');
      expect(await runner.executeValidation("contains 'architecture'", '/doc.md')).toBe(false);
    });

    test('contains check - fails for missing file', async () => {
      fs.pathExists.mockResolvedValue(false);
      expect(await runner.executeValidation("contains 'something'", '/missing.md')).toBe(false);
    });

    test('minimum size check - passes', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: 500 });
      expect(await runner.executeValidation('minimum size: 100', '/file.md')).toBe(true);
    });

    test('minimum size check - fails', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockResolvedValue({ size: 50 });
      expect(await runner.executeValidation('min size: 100', '/file.md')).toBe(false);
    });

    test('minimum size - fails for missing file', async () => {
      fs.pathExists.mockResolvedValue(false);
      expect(await runner.executeValidation('min size: 100', '/missing.md')).toBe(false);
    });

    test('unknown validation defaults to true', async () => {
      expect(await runner.executeValidation('some human description', '/file')).toBe(true);
    });
  });

  // ============================================================
  // run (integration)
  // ============================================================
  describe('run', () => {
    test('returns error when checklist not found', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await runner.run('missing-checklist', '/file.js');

      expect(result.passed).toBe(false);
      expect(result.errors).toContain('Checklist not found: missing-checklist');
    });

    test('runs checklist and passes', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('- [ ] Review code\n- [ ] Check formatting');

      const result = await runner.run('quality', '/src/app.js');

      expect(result.passed).toBe(true);
      expect(result.items).toHaveLength(2);
      expect(result.timestamp).toBeDefined();
    });

    test('fails when blocker item fails', async () => {
      fs.pathExists.mockImplementation((p) => {
        if (p.includes('checklists')) return true;
        return false;
      });
      fs.readFile.mockResolvedValue('```yaml\npre-conditions:\n  - Output exists\n```');
      yaml.load.mockReturnValue({
        'pre-conditions': [{
          'Output exists': null,
          validation: 'file exists',
          blocker: true,
        }],
      });

      const result = await runner.run('pre-check', '/output.md');

      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // getSummary
  // ============================================================
  describe('getSummary', () => {
    test('returns null when checklist not found', async () => {
      fs.pathExists.mockResolvedValue(false);
      expect(await runner.getSummary('missing')).toBeNull();
    });

    test('returns summary with categories', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('- [ ] Item 1\n- [ ] Item 2\n- [x] Item 3');

      const summary = await runner.getSummary('quality');

      expect(summary.name).toBe('quality');
      expect(summary.totalItems).toBe(3);
      expect(summary.categories.manual).toBe(3);
    });
  });
});
