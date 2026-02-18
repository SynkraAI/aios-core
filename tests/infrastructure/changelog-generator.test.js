/**
 * Tests for ChangelogGenerator
 * @see .aios-core/infrastructure/scripts/changelog-generator.js
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
}));

const ChangelogGenerator = require('../../.aios-core/infrastructure/scripts/changelog-generator');

describe('ChangelogGenerator', () => {
  let generator;

  beforeEach(() => {
    jest.clearAllMocks();
    generator = new ChangelogGenerator({ rootPath: '/test/root' });
  });

  // ─── Constructor ───────────────────────────────────────────────

  describe('constructor', () => {
    it('should use provided rootPath', () => {
      const g = new ChangelogGenerator({ rootPath: '/custom/path' });
      expect(g.rootPath).toBe('/custom/path');
    });

    it('should default rootPath to cwd', () => {
      const g = new ChangelogGenerator();
      expect(g.rootPath).toBe(process.cwd());
    });

    it('should set custom changelogPath', () => {
      const g = new ChangelogGenerator({ changelogPath: '/custom/CHANGELOG.md' });
      expect(g.changelogPath).toBe('/custom/CHANGELOG.md');
    });

    it('should set custom jsonPath', () => {
      const g = new ChangelogGenerator({ jsonPath: '/custom/changelog.json' });
      expect(g.jsonPath).toBe('/custom/changelog.json');
    });

    it('should set default changelogPath based on rootPath', () => {
      expect(generator.changelogPath).toBe(path.join('/test/root', 'docs', 'CHANGELOG.md'));
    });

    it('should set default jsonPath based on rootPath', () => {
      expect(generator.jsonPath).toBe(path.join('/test/root', '.aios', 'changelog.json'));
    });

    it('should initialize category mapping with conventional commit types', () => {
      expect(generator.categories.feat).toBe('Added');
      expect(generator.categories.fix).toBe('Fixed');
      expect(generator.categories.perf).toBe('Performance');
      expect(generator.categories.refactor).toBe('Changed');
      expect(generator.categories.docs).toBe('Documentation');
      expect(generator.categories.breaking).toBe('Breaking Changes');
      expect(generator.categories.deprecated).toBe('Deprecated');
      expect(generator.categories.removed).toBe('Removed');
      expect(generator.categories.security).toBe('Security');
    });

    it('should exclude chores, tests, and CI from categories', () => {
      expect(generator.categories.chore).toBeNull();
      expect(generator.categories.test).toBeNull();
      expect(generator.categories.ci).toBeNull();
    });

    it('should define category order', () => {
      expect(generator.categoryOrder).toEqual([
        'Breaking Changes',
        'Added',
        'Changed',
        'Deprecated',
        'Removed',
        'Fixed',
        'Security',
        'Performance',
        'Documentation',
      ]);
    });

    it('should define story patterns for extraction', () => {
      expect(generator.storyPatterns).toHaveLength(4);
    });
  });

  // ─── extractCommitType ─────────────────────────────────────────

  describe('extractCommitType', () => {
    it('should extract type from conventional commit format', () => {
      expect(generator.extractCommitType('feat: add new feature')).toBe('feat');
    });

    it('should extract type with scope', () => {
      expect(generator.extractCommitType('fix(core): resolve bug')).toBe('fix');
    });

    it('should extract type with breaking change indicator', () => {
      expect(generator.extractCommitType('feat!: breaking change')).toBe('feat');
    });

    it('should extract type with scope and breaking indicator', () => {
      expect(generator.extractCommitType('refactor(api)!: remove endpoint')).toBe('refactor');
    });

    it('should fallback to fix for messages starting with fix', () => {
      expect(generator.extractCommitType('fix the login bug')).toBe('fix');
    });

    it('should fallback to fix for messages containing bug', () => {
      expect(generator.extractCommitType('resolve a nasty bug')).toBe('fix');
    });

    it('should fallback to feat for messages starting with add', () => {
      expect(generator.extractCommitType('add new button component')).toBe('feat');
    });

    it('should parse feature as conventional commit type', () => {
      expect(generator.extractCommitType('feature: something new')).toBe('feature');
    });

    it('should fallback to removed for messages starting with remove', () => {
      expect(generator.extractCommitType('remove deprecated API')).toBe('removed');
    });

    it('should fallback to removed for messages starting with delete', () => {
      expect(generator.extractCommitType('delete old files')).toBe('removed');
    });

    it('should fallback to deprecated for messages starting with deprecate', () => {
      expect(generator.extractCommitType('deprecate old API')).toBe('deprecated');
    });

    it('should fallback to docs for messages starting with doc', () => {
      expect(generator.extractCommitType('document the process')).toBe('docs');
    });

    it('should default to change for unrecognized messages', () => {
      expect(generator.extractCommitType('some random message')).toBe('change');
    });

    it('should handle null message', () => {
      expect(generator.extractCommitType(null)).toBe('change');
    });

    it('should handle undefined message', () => {
      expect(generator.extractCommitType(undefined)).toBe('change');
    });

    it('should handle empty string', () => {
      expect(generator.extractCommitType('')).toBe('change');
    });

    it('should be case insensitive for keyword fallbacks', () => {
      expect(generator.extractCommitType('FIX something')).toBe('fix');
      expect(generator.extractCommitType('Add feature')).toBe('feat');
    });
  });

  // ─── extractStoryRef ───────────────────────────────────────────

  describe('extractStoryRef', () => {
    it('should extract [Story X.Y] pattern', () => {
      expect(generator.extractStoryRef('feat: add thing [Story 2.1]')).toBe('Story 2.1');
    });

    it('should extract (Story X.Y) pattern', () => {
      expect(generator.extractStoryRef('fix: bug (Story 3.5)')).toBe('Story 3.5');
    });

    it('should extract Story-X pattern', () => {
      expect(generator.extractStoryRef('fix: resolve Story-4.2 issue')).toBe('Story 4.2');
    });

    it('should extract #N pattern', () => {
      expect(generator.extractStoryRef('feat: implement #42')).toBe('Story 42');
    });

    it('should extract integer story ID', () => {
      expect(generator.extractStoryRef('feat: thing [Story 5]')).toBe('Story 5');
    });

    it('should return null for no story ref', () => {
      expect(generator.extractStoryRef('just a plain commit')).toBeNull();
    });

    it('should be case insensitive', () => {
      expect(generator.extractStoryRef('feat: thing [STORY 2.1]')).toBe('Story 2.1');
    });
  });

  // ─── parseStory ────────────────────────────────────────────────

  describe('parseStory', () => {
    it('should extract title from markdown heading', () => {
      const result = generator.parseStory('# My Story Title\nSome content', 'story-1.md');
      expect(result.title).toBe('My Story Title');
    });

    it('should extract title from yaml title field', () => {
      const result = generator.parseStory('title: YAML Title\nstatus: done', 'story.yaml');
      expect(result.title).toBe('YAML Title');
    });

    it('should use filename as fallback title', () => {
      const result = generator.parseStory('no heading here', 'my-feature.md');
      expect(result.title).toBe('my-feature');
    });

    it('should strip Story: prefix from title', () => {
      const result = generator.parseStory('# Story: My Feature\n', 'story.md');
      expect(result.title).toBe('My Feature');
    });

    it('should extract story ID from filename', () => {
      const result = generator.parseStory('# Title', 'story-2.1.md');
      expect(result.id).toBe('2.1');
    });

    it('should extract story ID from yaml content', () => {
      const result = generator.parseStory('id: 3.5\ntitle: Test', 'file.yaml');
      expect(result.id).toBe('3.5');
    });

    it('should detect fix type', () => {
      const result = generator.parseStory('# Fix login bug\nfixing something', 'fix.md');
      expect(result.type).toBe('fix');
    });

    it('should detect refactor type', () => {
      const result = generator.parseStory('# Refactor core\nrefactor the module', 'story.md');
      expect(result.type).toBe('refactor');
    });

    it('should detect docs type', () => {
      const result = generator.parseStory('# Update documentation\ndocs for API', 'story.md');
      expect(result.type).toBe('docs');
    });

    it('should default to feature type', () => {
      const result = generator.parseStory('# New awesome thing\n', 'story.md');
      expect(result.type).toBe('feature');
    });

    it('should extract user story if present', () => {
      const content = '**As a** developer, **I want** better tests, **so that** code is reliable';
      const result = generator.parseStory(content, 'story.md');
      expect(result.userStory).not.toBeNull();
      expect(result.userStory.role).toBe('developer');
      expect(result.userStory.action).toBe('better tests');
      expect(result.userStory.benefit).toBe('code is reliable');
    });

    it('should return null userStory when not present', () => {
      const result = generator.parseStory('# Simple story', 'story.md');
      expect(result.userStory).toBeNull();
    });
  });

  // ─── storyToCategory ──────────────────────────────────────────

  describe('storyToCategory', () => {
    it('should map feature to Added', () => {
      expect(generator.storyToCategory({ type: 'feature' })).toBe('Added');
    });

    it('should map feat to Added', () => {
      expect(generator.storyToCategory({ type: 'feat' })).toBe('Added');
    });

    it('should map fix to Fixed', () => {
      expect(generator.storyToCategory({ type: 'fix' })).toBe('Fixed');
    });

    it('should map bugfix to Fixed', () => {
      expect(generator.storyToCategory({ type: 'bugfix' })).toBe('Fixed');
    });

    it('should map refactor to Changed', () => {
      expect(generator.storyToCategory({ type: 'refactor' })).toBe('Changed');
    });

    it('should map docs to Documentation', () => {
      expect(generator.storyToCategory({ type: 'docs' })).toBe('Documentation');
    });

    it('should map breaking to Breaking Changes', () => {
      expect(generator.storyToCategory({ type: 'breaking' })).toBe('Breaking Changes');
    });

    it('should default to Added for unknown types', () => {
      expect(generator.storyToCategory({ type: 'unknown' })).toBe('Added');
    });
  });

  // ─── formatCommit ─────────────────────────────────────────────

  describe('formatCommit', () => {
    it('should strip conventional commit prefix', () => {
      const result = generator.formatCommit({ message: 'feat: add new feature', hash: 'abc12345' });
      expect(result).toBe('Add new feature');
    });

    it('should strip prefix with scope', () => {
      const result = generator.formatCommit({ message: 'fix(core): resolve issue', hash: 'abc12345' });
      expect(result).toBe('Resolve issue');
    });

    it('should capitalize first letter', () => {
      const result = generator.formatCommit({ message: 'feat: something cool', hash: 'abc' });
      expect(result).toMatch(/^S/);
    });

    it('should append story reference', () => {
      const result = generator.formatCommit({ message: 'feat: add thing [Story 2.1]', hash: 'abc' });
      expect(result).toContain('[Story 2.1]');
    });

    it('should handle commit with no message', () => {
      const result = generator.formatCommit({ hash: 'abc12345' });
      expect(result).toBe('abc12345');
    });

    it('should handle commit with undefined message', () => {
      const result = generator.formatCommit({ message: undefined, hash: 'def' });
      expect(result).toBe('def');
    });

    it('should return Unknown commit when no message and no hash', () => {
      const result = generator.formatCommit({});
      expect(result).toBe('Unknown commit');
    });
  });

  // ─── formatStory ──────────────────────────────────────────────

  describe('formatStory', () => {
    it('should format story with ID', () => {
      const result = generator.formatStory({ title: 'New Feature', id: '2.1' });
      expect(result).toBe('New Feature [Story 2.1]');
    });

    it('should format story without ID', () => {
      const result = generator.formatStory({ title: 'Another Feature', id: null });
      expect(result).toBe('Another Feature');
    });
  });

  // ─── categorize ───────────────────────────────────────────────

  describe('categorize', () => {
    it('should categorize feat commits as Added', () => {
      const commits = [{ message: 'feat: add widget', hash: 'abc' }];
      const result = generator.categorize(commits, []);
      expect(result['Added']).toHaveLength(1);
    });

    it('should categorize fix commits as Fixed', () => {
      const commits = [{ message: 'fix: resolve crash', hash: 'abc' }];
      const result = generator.categorize(commits, []);
      expect(result['Fixed']).toHaveLength(1);
    });

    it('should skip chore commits', () => {
      const commits = [{ message: 'chore: update deps', hash: 'abc' }];
      const result = generator.categorize(commits, []);
      const totalEntries = Object.values(result).flat().length;
      expect(totalEntries).toBe(0);
    });

    it('should skip test commits', () => {
      const commits = [{ message: 'test: add tests', hash: 'abc' }];
      const result = generator.categorize(commits, []);
      const totalEntries = Object.values(result).flat().length;
      expect(totalEntries).toBe(0);
    });

    it('should detect breaking changes from BREAKING keyword', () => {
      const commits = [{ message: 'feat: BREAKING remove old API', hash: 'abc' }];
      const result = generator.categorize(commits, []);
      expect(result['Breaking Changes']).toHaveLength(1);
    });

    it('should detect breaking changes from !: marker', () => {
      const commits = [{ message: 'feat!: something big', hash: 'abc' }];
      const result = generator.categorize(commits, []);
      expect(result['Breaking Changes']).toHaveLength(1);
    });

    it('should detect breaking changes from body', () => {
      const commits = [{ message: 'feat: something', body: 'BREAKING: changes API', hash: 'abc' }];
      const result = generator.categorize(commits, []);
      expect(result['Breaking Changes']).toHaveLength(1);
    });

    it('should process stories into correct categories', () => {
      const stories = [{ title: 'New Dashboard', type: 'feature', id: '5.1' }];
      const result = generator.categorize([], stories);
      expect(result['Added']).toHaveLength(1);
    });

    it('should not duplicate stories already present from commits', () => {
      const commits = [{ message: 'feat: New Dashboard', hash: 'abc' }];
      const stories = [{ title: 'New Dashboard', type: 'feature', id: '5.1' }];
      const result = generator.categorize(commits, stories);
      expect(result['Added']).toHaveLength(1);
    });

    it('should skip null/invalid commits', () => {
      const commits = [null, { message: null }, { message: 'feat: valid', hash: 'abc' }];
      const result = generator.categorize(commits, []);
      expect(result['Added']).toHaveLength(1);
    });

    it('should initialize all category arrays', () => {
      const result = generator.categorize([], []);
      for (const category of generator.categoryOrder) {
        expect(result[category]).toEqual([]);
      }
    });
  });

  // ─── format ───────────────────────────────────────────────────

  describe('format', () => {
    it('should generate markdown with version header', () => {
      const categorized = { Added: ['Feature 1'], Fixed: [], Changed: [] };
      // Initialize all categories
      for (const cat of generator.categoryOrder) {
        if (!categorized[cat]) categorized[cat] = [];
      }
      const result = generator.format(categorized, '1.0.0');
      expect(result).toContain('## [1.0.0]');
    });

    it('should include date in header', () => {
      const categorized = {};
      for (const cat of generator.categoryOrder) categorized[cat] = [];
      categorized['Added'] = ['Test'];
      const result = generator.format(categorized, '1.0.0');
      const today = new Date().toISOString().split('T')[0];
      expect(result).toContain(today);
    });

    it('should include category headings for non-empty categories', () => {
      const categorized = {};
      for (const cat of generator.categoryOrder) categorized[cat] = [];
      categorized['Added'] = ['Feature A'];
      categorized['Fixed'] = ['Bug B'];
      const result = generator.format(categorized, '1.0.0');
      expect(result).toContain('### Added');
      expect(result).toContain('### Fixed');
    });

    it('should skip empty categories', () => {
      const categorized = {};
      for (const cat of generator.categoryOrder) categorized[cat] = [];
      categorized['Added'] = ['Feature A'];
      const result = generator.format(categorized, '1.0.0');
      expect(result).not.toContain('### Fixed');
      expect(result).not.toContain('### Changed');
    });

    it('should format items as bullet points', () => {
      const categorized = {};
      for (const cat of generator.categoryOrder) categorized[cat] = [];
      categorized['Added'] = ['Feature 1', 'Feature 2'];
      const result = generator.format(categorized, '1.0.0');
      expect(result).toContain('- Feature 1');
      expect(result).toContain('- Feature 2');
    });

    it('should handle Unreleased version', () => {
      const categorized = {};
      for (const cat of generator.categoryOrder) categorized[cat] = [];
      const result = generator.format(categorized, 'Unreleased');
      expect(result).toContain('## [Unreleased]');
    });
  });

  // ─── getLastReleaseTag ─────────────────────────────────────────

  describe('getLastReleaseTag', () => {
    it('should return latest tag when available', async () => {
      execSync.mockReturnValueOnce('v1.2.3\n');
      const tag = await generator.getLastReleaseTag();
      expect(tag).toBe('v1.2.3');
    });

    it('should fallback to first commit when no tags', async () => {
      execSync.mockImplementationOnce(() => { throw new Error('no tags'); });
      execSync.mockReturnValueOnce('abc123\n');
      const tag = await generator.getLastReleaseTag();
      expect(tag).toBe('abc123');
    });

    it('should fallback to HEAD~100 when no commits found', async () => {
      execSync.mockImplementationOnce(() => { throw new Error('no tags'); });
      execSync.mockImplementationOnce(() => { throw new Error('no commits'); });
      const tag = await generator.getLastReleaseTag();
      expect(tag).toBe('HEAD~100');
    });

    it('should pass rootPath as cwd', async () => {
      execSync.mockReturnValueOnce('v1.0.0\n');
      await generator.getLastReleaseTag();
      expect(execSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: '/test/root' })
      );
    });
  });

  // ─── getCommits ────────────────────────────────────────────────

  describe('getCommits', () => {
    it('should parse git log output into commit objects', async () => {
      const sep = '|||CHANGELOG_SEP|||';
      const log = `abc12345${sep}feat: add thing${sep}Author${sep}2026-01-01T00:00:00Z`;
      execSync.mockReturnValueOnce(log);

      const commits = await generator.getCommits('v1.0.0', 'HEAD');
      expect(commits).toHaveLength(1);
      expect(commits[0].hash).toBe('abc12345');
      expect(commits[0].message).toBe('feat: add thing');
      expect(commits[0].author).toBe('Author');
      expect(commits[0].date).toBe('2026-01-01T00:00:00Z');
    });

    it('should handle multiple commits', async () => {
      const sep = '|||CHANGELOG_SEP|||';
      const log = [
        `abc${sep}feat: one${sep}Auth1${sep}2026-01-01`,
        `def${sep}fix: two${sep}Auth2${sep}2026-01-02`,
      ].join('\n');
      execSync.mockReturnValueOnce(log);

      const commits = await generator.getCommits('v1.0.0', 'HEAD');
      expect(commits).toHaveLength(2);
    });

    it('should skip malformed entries', async () => {
      const sep = '|||CHANGELOG_SEP|||';
      const log = `abc${sep}feat: one${sep}Auth${sep}2026-01-01\nmalformed line\n`;
      execSync.mockReturnValueOnce(log);

      const commits = await generator.getCommits('v1.0.0', 'HEAD');
      expect(commits).toHaveLength(1);
    });

    it('should return empty array on error', async () => {
      execSync.mockImplementationOnce(() => { throw new Error('git error'); });
      const commits = await generator.getCommits('v1.0.0', 'HEAD');
      expect(commits).toEqual([]);
    });

    it('should skip empty lines', async () => {
      const sep = '|||CHANGELOG_SEP|||';
      const log = `\nabc${sep}feat: one${sep}Auth${sep}2026-01-01\n\n`;
      execSync.mockReturnValueOnce(log);

      const commits = await generator.getCommits('v1.0.0', 'HEAD');
      expect(commits).toHaveLength(1);
    });

    it('should truncate hash to 8 characters', async () => {
      const sep = '|||CHANGELOG_SEP|||';
      const log = `abcdefghijklmnop${sep}feat: test${sep}Author${sep}2026-01-01`;
      execSync.mockReturnValueOnce(log);

      const commits = await generator.getCommits('v1.0.0', 'HEAD');
      expect(commits[0].hash).toBe('abcdefgh');
    });
  });

  // ─── getCompletedStories ───────────────────────────────────────

  describe('getCompletedStories', () => {
    it('should return empty array when stories dir does not exist', async () => {
      fs.existsSync.mockReturnValue(false);
      const stories = await generator.getCompletedStories('HEAD');
      expect(stories).toEqual([]);
    });

    it('should read and parse completed story files', async () => {
      fs.existsSync.mockReturnValue(true);
      execSync.mockReturnValueOnce('2026-01-01T00:00:00Z\n');
      fs.readdirSync.mockReturnValue([
        { name: 'story-1.md', isDirectory: () => false },
      ]);
      fs.readFileSync.mockReturnValue('# My Story\nStatus: Done');
      fs.statSync.mockReturnValue({ mtime: new Date('2026-02-01') });

      const stories = await generator.getCompletedStories('v1.0.0');
      expect(stories).toHaveLength(1);
      expect(stories[0].title).toBe('My Story');
    });

    it('should skip non-completed stories', async () => {
      fs.existsSync.mockReturnValue(true);
      execSync.mockReturnValueOnce('2026-01-01T00:00:00Z\n');
      fs.readdirSync.mockReturnValue([
        { name: 'story-1.md', isDirectory: () => false },
      ]);
      fs.readFileSync.mockReturnValue('# My Story\nStatus: In Progress');
      fs.statSync.mockReturnValue({ mtime: new Date('2026-02-01') });

      const stories = await generator.getCompletedStories('v1.0.0');
      expect(stories).toHaveLength(0);
    });

    it('should walk subdirectories recursively', async () => {
      fs.existsSync.mockReturnValue(true);
      execSync.mockReturnValueOnce('2026-01-01T00:00:00Z\n');

      // First call: root dir
      fs.readdirSync.mockReturnValueOnce([
        { name: 'subdir', isDirectory: () => true },
      ]);
      // Second call: subdir
      fs.readdirSync.mockReturnValueOnce([
        { name: 'story-2.md', isDirectory: () => false },
      ]);
      fs.readFileSync.mockReturnValue('# Sub Story\nStatus: Done');
      fs.statSync.mockReturnValue({ mtime: new Date('2026-02-01') });

      const stories = await generator.getCompletedStories('v1.0.0');
      expect(stories).toHaveLength(1);
    });

    it('should skip files older than since date', async () => {
      fs.existsSync.mockReturnValue(true);
      execSync.mockReturnValueOnce('2026-02-01T00:00:00Z\n');
      fs.readdirSync.mockReturnValue([
        { name: 'old-story.md', isDirectory: () => false },
      ]);
      fs.readFileSync.mockReturnValue('# Old Story\nStatus: Done');
      fs.statSync.mockReturnValue({ mtime: new Date('2026-01-01') });

      const stories = await generator.getCompletedStories('v1.0.0');
      expect(stories).toHaveLength(0);
    });

    it('should accept Status: Complete as completed', async () => {
      fs.existsSync.mockReturnValue(true);
      execSync.mockReturnValueOnce('2026-01-01T00:00:00Z\n');
      fs.readdirSync.mockReturnValue([
        { name: 'story-1.md', isDirectory: () => false },
      ]);
      fs.readFileSync.mockReturnValue('# Story\nStatus: Complete');
      fs.statSync.mockReturnValue({ mtime: new Date('2026-02-01') });

      const stories = await generator.getCompletedStories('v1.0.0');
      expect(stories).toHaveLength(1);
    });

    it('should accept lowercase status: done', async () => {
      fs.existsSync.mockReturnValue(true);
      execSync.mockReturnValueOnce('2026-01-01T00:00:00Z\n');
      fs.readdirSync.mockReturnValue([
        { name: 'story-1.yaml', isDirectory: () => false },
      ]);
      fs.readFileSync.mockReturnValue('title: Story\nstatus: done');
      fs.statSync.mockReturnValue({ mtime: new Date('2026-02-01') });

      const stories = await generator.getCompletedStories('v1.0.0');
      expect(stories).toHaveLength(1);
    });

    it('should handle git date parse failure gracefully', async () => {
      fs.existsSync.mockReturnValue(true);
      execSync.mockImplementationOnce(() => { throw new Error('bad ref'); });
      fs.readdirSync.mockReturnValue([
        { name: 'story-1.md', isDirectory: () => false },
      ]);
      fs.readFileSync.mockReturnValue('# Story\nStatus: Done');
      fs.statSync.mockReturnValue({ mtime: new Date('2026-02-01') });

      // Should still work, falling back to epoch date
      const stories = await generator.getCompletedStories('invalid-ref');
      expect(stories).toHaveLength(1);
    });
  });

  // ─── save ─────────────────────────────────────────────────────

  describe('save', () => {
    it('should create directories if they do not exist', async () => {
      fs.existsSync.mockReturnValue(false);
      await generator.save('changelog content', { Added: [] }, '1.0.0');
      expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
    });

    it('should create new changelog file if none exists', async () => {
      // Dirs exist, but changelog file and json file do not
      const changelogPath = generator.changelogPath;
      const jsonPath = generator.jsonPath;
      fs.existsSync.mockImplementation((p) => {
        if (p === changelogPath || p === jsonPath) return false;
        return true; // dirs exist
      });
      await generator.save('## [1.0.0] content', {}, '1.0.0');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        changelogPath,
        expect.stringContaining('# Changelog')
      );
    });

    it('should insert new version after header in existing changelog', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('# Changelog\n\n## [0.9.0] - old content\n');
      await generator.save('## [1.0.0] new content\n', {}, '1.0.0');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        generator.changelogPath,
        expect.stringContaining('## [1.0.0] new content')
      );
    });

    it('should append if no existing version header found', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('# Changelog\nSome intro text only');
      await generator.save('## [1.0.0] content\n', {}, '1.0.0');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        generator.changelogPath,
        expect.stringContaining('## [1.0.0] content')
      );
    });

    it('should save JSON data with metadata', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('# Changelog\n\n## [0.9.0] old');
      const categorized = { Added: ['Feature 1'] };
      await generator.save('changelog', categorized, '1.0.0');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        generator.jsonPath,
        expect.stringContaining('"version"')
      );
    });
  });

  // ─── generate ─────────────────────────────────────────────────

  describe('generate', () => {
    beforeEach(() => {
      // Default mock for getLastReleaseTag
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('describe --tags')) return 'v1.0.0\n';
        if (cmd.includes('git log')) return '';
        return '';
      });
      fs.existsSync.mockReturnValue(false);
    });

    it('should return result object with expected properties', async () => {
      const result = await generator.generate();
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('since');
      expect(result).toHaveProperty('until');
      expect(result).toHaveProperty('commitCount');
      expect(result).toHaveProperty('storyCount');
      expect(result).toHaveProperty('changelog');
      expect(result).toHaveProperty('categorized');
    });

    it('should use Unreleased as default version', async () => {
      const result = await generator.generate();
      expect(result.version).toBe('Unreleased');
    });

    it('should use provided version', async () => {
      const result = await generator.generate({ version: '2.0.0' });
      expect(result.version).toBe('2.0.0');
    });

    it('should use provided since ref', async () => {
      const result = await generator.generate({ since: 'v0.5.0' });
      expect(result.since).toBe('v0.5.0');
    });

    it('should call save when save option is true', async () => {
      fs.existsSync.mockReturnValue(false);
      await generator.generate({ save: true });
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should not call save when save option is false', async () => {
      await generator.generate({ save: false });
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  // ─── preview ──────────────────────────────────────────────────

  describe('preview', () => {
    it('should return changelog string without saving', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('describe --tags')) return 'v1.0.0\n';
        if (cmd.includes('git log')) return '';
        return '';
      });
      fs.existsSync.mockReturnValue(false);

      const result = await generator.preview();
      expect(typeof result).toBe('string');
      expect(result).toContain('## [Unreleased]');
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  // ─── Module exports ───────────────────────────────────────────

  describe('module exports', () => {
    it('should export ChangelogGenerator class as default', () => {
      expect(ChangelogGenerator).toBeInstanceOf(Function);
    });

    it('should export ChangelogGenerator as named export', () => {
      const mod = require('../../.aios-core/infrastructure/scripts/changelog-generator');
      expect(mod.ChangelogGenerator).toBe(ChangelogGenerator);
    });
  });
});
