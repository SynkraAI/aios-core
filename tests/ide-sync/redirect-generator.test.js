'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const {
  DEFAULT_REDIRECTS,
  generateRedirectContent,
  generateRedirect,
  generateAllRedirects,
  writeRedirects,
  getRedirectFilenames,
} = require('../../.aios-core/infrastructure/scripts/ide-sync/redirect-generator');

describe('redirect-generator', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'redirect-gen-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  describe('DEFAULT_REDIRECTS', () => {
    it('should contain expected deprecated agent mappings', () => {
      expect(DEFAULT_REDIRECTS).toHaveProperty('aios-developer', 'aios-master');
      expect(DEFAULT_REDIRECTS).toHaveProperty('aios-orchestrator', 'aios-master');
      expect(DEFAULT_REDIRECTS).toHaveProperty('db-sage', 'data-engineer');
      expect(DEFAULT_REDIRECTS).toHaveProperty('github-devops', 'devops');
    });

    it('should have exactly 4 entries', () => {
      expect(Object.keys(DEFAULT_REDIRECTS)).toHaveLength(4);
    });
  });

  describe('generateRedirectContent', () => {
    it('should generate full-markdown-yaml format with header and table', () => {
      const content = generateRedirectContent('db-sage', 'data-engineer', 'full-markdown-yaml');

      expect(content).toContain('# Agent Redirect: db-sage → data-engineer');
      expect(content).toContain('**DEPRECATED:**');
      expect(content).toContain('Use `@data-engineer` instead.');
      expect(content).toContain('| Old ID | @db-sage |');
      expect(content).toContain('| New ID | @data-engineer |');
      expect(content).toContain('AIOS Redirect - Synced automatically');
    });

    it('should generate xml-tagged-markdown format with redirect tags', () => {
      const content = generateRedirectContent('aios-developer', 'aios-master', 'xml-tagged-markdown');

      expect(content).toContain('<redirect>');
      expect(content).toContain('Old: @aios-developer');
      expect(content).toContain('New: @aios-master');
      expect(content).toContain('</redirect>');
      expect(content).toContain('<notice>');
    });

    it('should generate condensed-rules format', () => {
      const content = generateRedirectContent('github-devops', 'devops', 'condensed-rules');

      expect(content).toContain('# Agent Redirect: github-devops → devops');
      expect(content).toContain('> **DEPRECATED:**');
      expect(content).not.toContain('<redirect>');
      expect(content).not.toContain('| Property |');
    });

    it('should generate cursor-style format (same as condensed)', () => {
      const content = generateRedirectContent('github-devops', 'devops', 'cursor-style');

      expect(content).toContain('# Agent Redirect: github-devops → devops');
      expect(content).toContain('> **DEPRECATED:**');
    });

    it('should use condensed format as default for unknown formats', () => {
      const content = generateRedirectContent('db-sage', 'data-engineer', 'unknown-format');

      expect(content).toContain('# Agent Redirect: db-sage → data-engineer');
      expect(content).toContain('> **DEPRECATED:**');
      expect(content).not.toContain('<redirect>');
    });
  });

  describe('generateRedirect', () => {
    it('should return an object with correct properties', () => {
      const result = generateRedirect('db-sage', 'data-engineer', tmpDir, 'full-markdown-yaml');

      expect(result.oldId).toBe('db-sage');
      expect(result.newId).toBe('data-engineer');
      expect(result.filename).toBe('db-sage.md');
      expect(result.path).toBe(path.join(tmpDir, 'db-sage.md'));
      expect(result.content).toContain('Agent Redirect');
    });

    it('should generate correct filename from oldId', () => {
      const result = generateRedirect('aios-orchestrator', 'aios-master', tmpDir, 'condensed-rules');

      expect(result.filename).toBe('aios-orchestrator.md');
    });
  });

  describe('generateAllRedirects', () => {
    it('should generate redirects from custom config', () => {
      const config = {
        'old-agent': 'new-agent',
        'legacy-bot': 'modern-bot',
      };

      const results = generateAllRedirects(config, tmpDir, 'full-markdown-yaml');

      expect(results).toHaveLength(2);
      expect(results[0].oldId).toBe('old-agent');
      expect(results[0].newId).toBe('new-agent');
      expect(results[1].oldId).toBe('legacy-bot');
      expect(results[1].newId).toBe('modern-bot');
    });

    it('should use DEFAULT_REDIRECTS when config is null', () => {
      const results = generateAllRedirects(null, tmpDir, 'full-markdown-yaml');

      expect(results).toHaveLength(4);
      const oldIds = results.map((r) => r.oldId);
      expect(oldIds).toContain('aios-developer');
      expect(oldIds).toContain('db-sage');
    });

    it('should apply the specified format to all redirects', () => {
      const config = { 'test-old': 'test-new' };
      const results = generateAllRedirects(config, tmpDir, 'xml-tagged-markdown');

      expect(results[0].content).toContain('<redirect>');
    });

    it('should handle empty config', () => {
      const results = generateAllRedirects({}, tmpDir, 'full-markdown-yaml');

      expect(results).toHaveLength(0);
    });
  });

  describe('writeRedirects', () => {
    it('should write redirect files to disk', () => {
      const redirects = generateAllRedirects({ 'old-a': 'new-a' }, tmpDir, 'full-markdown-yaml');
      const result = writeRedirects(redirects, false);

      expect(result.written).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(fs.existsSync(path.join(tmpDir, 'old-a.md'))).toBe(true);

      const content = fs.readFileSync(path.join(tmpDir, 'old-a.md'), 'utf8');
      expect(content).toContain('Agent Redirect: old-a → new-a');
    });

    it('should not write files in dry-run mode', () => {
      const redirects = generateAllRedirects({ 'dry-old': 'dry-new' }, tmpDir, 'full-markdown-yaml');
      const result = writeRedirects(redirects, true);

      // In dry-run, written tracks what *would* be written, but no file is created
      expect(result.written).toHaveLength(1);
      expect(fs.existsSync(path.join(tmpDir, 'dry-old.md'))).toBe(false);
    });

    it('should create subdirectories if needed', () => {
      const nestedDir = path.join(tmpDir, 'nested', 'deep');
      const redirects = generateAllRedirects({ 'nested-old': 'nested-new' }, nestedDir, 'condensed-rules');
      const result = writeRedirects(redirects, false);

      expect(result.written).toHaveLength(1);
      expect(fs.existsSync(path.join(nestedDir, 'nested-old.md'))).toBe(true);
    });

    it('should handle write errors gracefully', () => {
      // Use os.devNull for cross-platform compatibility
      const impossiblePath = path.join(os.devNull, 'impossible', 'bad.md');
      const redirects = [
        {
          oldId: 'bad',
          newId: 'target',
          filename: 'bad.md',
          path: impossiblePath,
          content: 'test',
        },
      ];

      const result = writeRedirects(redirects, false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should write multiple redirects', () => {
      const config = {
        'agent-a': 'target-a',
        'agent-b': 'target-b',
        'agent-c': 'target-c',
      };
      const redirects = generateAllRedirects(config, tmpDir, 'full-markdown-yaml');
      const result = writeRedirects(redirects, false);

      expect(result.written).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getRedirectFilenames', () => {
    it('should return filenames from custom config', () => {
      const filenames = getRedirectFilenames({ 'old-x': 'new-x', 'old-y': 'new-y' });

      expect(filenames).toEqual(['old-x.md', 'old-y.md']);
    });

    it('should return filenames from DEFAULT_REDIRECTS when config is null', () => {
      const filenames = getRedirectFilenames(null);

      expect(filenames).toHaveLength(4);
      expect(filenames).toContain('aios-developer.md');
      expect(filenames).toContain('db-sage.md');
    });
  });
});
