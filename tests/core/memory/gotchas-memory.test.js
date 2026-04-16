'use strict';

/**
 * Unit tests for GotchasMemory
 *
 * Tests the auto-capture logic, error tracking window, manual CRUD,
 * filtering, statistics, and context injection.
 *
 * Fixes #475 — errorWindowMs was never applied to trackError() counts
 */

const path = require('path');
const os = require('os');
const fs = require('fs');
const {
  GotchasMemory,
  GotchaCategory,
  Severity,
  Events,
  CONFIG,
} = require('../../../.aiox-core/core/memory/gotchas-memory');

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'gotchas-test-'));
}

function makeMemory(opts = {}) {
  const root = makeTmpDir();
  // quiet suppresses console.log noise during tests
  return new GotchasMemory(root, { quiet: true, ...opts });
}

// ── Exports ────────────────────────────────────────────────────────────────────

describe('exports', () => {
  test('exports GotchasMemory class', () => {
    expect(typeof GotchasMemory).toBe('function');
  });

  test('exports GotchaCategory enum', () => {
    expect(GotchaCategory.BUILD).toBe('build');
    expect(GotchaCategory.TEST).toBe('test');
    expect(GotchaCategory.LINT).toBe('lint');
    expect(GotchaCategory.RUNTIME).toBe('runtime');
    expect(GotchaCategory.INTEGRATION).toBe('integration');
    expect(GotchaCategory.SECURITY).toBe('security');
    expect(GotchaCategory.GENERAL).toBe('general');
  });

  test('exports Severity enum', () => {
    expect(Severity.INFO).toBe('info');
    expect(Severity.WARNING).toBe('warning');
    expect(Severity.CRITICAL).toBe('critical');
  });

  test('exports Events constants', () => {
    expect(Events.GOTCHA_ADDED).toBeDefined();
    expect(Events.AUTO_CAPTURED).toBeDefined();
    expect(Events.ERROR_TRACKED).toBeDefined();
    expect(Events.GOTCHA_RESOLVED).toBeDefined();
    expect(Events.GOTCHA_REMOVED).toBeDefined();
    expect(Events.CONTEXT_INJECTED).toBeDefined();
  });

  test('exports CONFIG with expected defaults', () => {
    expect(CONFIG.repeatThreshold).toBe(3);
    expect(CONFIG.errorWindowMs).toBe(24 * 60 * 60 * 1000);
  });
});

// ── Constructor ────────────────────────────────────────────────────────────────

describe('constructor', () => {
  test('initializes with empty maps', () => {
    const m = makeMemory();
    expect(m.gotchas.size).toBe(0);
    expect(m.errorTracking.size).toBe(0);
  });

  test('uses default thresholds when not provided', () => {
    const m = makeMemory();
    expect(m.options.repeatThreshold).toBe(CONFIG.repeatThreshold);
    expect(m.options.errorWindowMs).toBe(CONFIG.errorWindowMs);
  });

  test('accepts custom thresholds', () => {
    const m = makeMemory({ repeatThreshold: 2, errorWindowMs: 5000 });
    expect(m.options.repeatThreshold).toBe(2);
    expect(m.options.errorWindowMs).toBe(5000);
  });

  test('falls back to process.cwd() when no rootPath provided', () => {
    // Only verify it constructs without error
    const m = new GotchasMemory(null, { quiet: true });
    expect(m.rootPath).toBe(process.cwd());
  });
});

// ── addGotcha ─────────────────────────────────────────────────────────────────

describe('addGotcha', () => {
  let m;
  beforeEach(() => { m = makeMemory(); });

  test('adds a gotcha to in-memory map', () => {
    const g = m.addGotcha({ title: 'Test gotcha', description: 'Something to watch out for' });
    expect(m.gotchas.has(g.id)).toBe(true);
  });

  test('returned gotcha has expected fields', () => {
    const g = m.addGotcha({ title: 'Test', description: 'Desc', severity: 'critical' });
    expect(g.id).toMatch(/^gotcha-/);
    expect(g.title).toBe('Test');
    expect(g.description).toBe('Desc');
    expect(g.severity).toBe(Severity.CRITICAL);
    expect(g.resolved).toBe(false);
    expect(g.source.type).toBe('manual');
  });

  test('emits GOTCHA_ADDED event', () => {
    const handler = jest.fn();
    m.on(Events.GOTCHA_ADDED, handler);
    m.addGotcha({ title: 'T', description: 'D' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('auto-detects category when not provided', () => {
    const g = m.addGotcha({ title: 'Jest mock issue', description: 'test coverage fails' });
    expect(g.category).toBe(GotchaCategory.TEST);
  });

  test('uses provided category', () => {
    const g = m.addGotcha({ title: 'T', description: 'D', category: GotchaCategory.BUILD });
    expect(g.category).toBe(GotchaCategory.BUILD);
  });

  test('severity defaults to warning when not provided', () => {
    const g = m.addGotcha({ title: 'T', description: 'D' });
    expect(g.severity).toBe(Severity.WARNING);
  });

  test('persists to filesystem JSON', () => {
    m.addGotcha({ title: 'Persistent', description: 'D' });
    const content = fs.readFileSync(m.gotchasJsonPath, 'utf-8');
    const data = JSON.parse(content);
    expect(data.gotchas.length).toBe(1);
    expect(data.gotchas[0].title).toBe('Persistent');
  });
});

// ── trackError ────────────────────────────────────────────────────────────────

describe('trackError', () => {
  let m;
  beforeEach(() => {
    m = makeMemory({ repeatThreshold: 3, errorWindowMs: 1000 });
  });

  test('returns null before threshold', () => {
    const result1 = m.trackError({ message: 'Cannot read property foo of undefined' });
    const result2 = m.trackError({ message: 'Cannot read property foo of undefined' });
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  test('returns auto-captured gotcha at threshold', () => {
    m.trackError({ message: 'Module not found: lodash' });
    m.trackError({ message: 'Module not found: lodash' });
    const gotcha = m.trackError({ message: 'Module not found: lodash' });
    expect(gotcha).not.toBeNull();
    expect(gotcha.source.type).toBe('auto_detected');
  });

  test('emits AUTO_CAPTURED event at threshold', () => {
    const handler = jest.fn();
    m.on(Events.AUTO_CAPTURED, handler);
    const err = { message: 'TypeError: x is not a function' };
    m.trackError(err);
    m.trackError(err);
    m.trackError(err);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('emits ERROR_TRACKED on every call', () => {
    const handler = jest.fn();
    m.on(Events.ERROR_TRACKED, handler);
    m.trackError({ message: 'some error' });
    m.trackError({ message: 'some error' });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  test('does not re-capture if gotcha already exists for same pattern', () => {
    const err = { message: 'ECONNREFUSED 127.0.0.1:5432' };
    m.trackError(err);
    m.trackError(err);
    const first = m.trackError(err); // creates gotcha
    const second = m.trackError(err); // same pattern — should NOT create another
    expect(first).not.toBeNull();
    expect(second).toBeNull();
    expect(m.gotchas.size).toBe(1);
  });

  // ── BUG #475 regression — error window must be applied ────────────────────

  describe('error window (fix #475)', () => {
    test('resets count when last occurrence is outside errorWindowMs', () => {
      jest.useFakeTimers();
      try {
        // Track error twice within window
        m.trackError({ message: 'Stale repeated error' });
        m.trackError({ message: 'Stale repeated error' });
        expect(m.errorTracking.size).toBe(1);

        // Advance time past the window (errorWindowMs = 1000ms)
        jest.advanceTimersByTime(1001);

        // Third occurrence comes in — should NOT trigger auto-capture
        // because previous occurrences are outside the window (count reset)
        const gotcha = m.trackError({ message: 'Stale repeated error' });
        expect(gotcha).toBeNull(); // window reset — count is 1 now, not 3
      } finally {
        jest.useRealTimers();
      }
    });

    test('count accumulates normally when within window', () => {
      jest.useFakeTimers();
      try {
        m.trackError({ message: 'Fast recurring error' });
        jest.advanceTimersByTime(500); // still within 1000ms window
        m.trackError({ message: 'Fast recurring error' });
        jest.advanceTimersByTime(300); // still within window
        const gotcha = m.trackError({ message: 'Fast recurring error' });
        expect(gotcha).not.toBeNull(); // threshold reached within window
      } finally {
        jest.useRealTimers();
      }
    });

    test('samples are cleared on window reset', () => {
      jest.useFakeTimers();
      try {
        m.trackError({ message: 'Some error', file: 'old.js' });
        jest.advanceTimersByTime(1001);
        m.trackError({ message: 'Some error', file: 'new.js' });

        const tracking = [...m.errorTracking.values()][0];
        // After window reset, only the new occurrence should be in samples
        expect(tracking.count).toBe(1);
        expect(tracking.samples.length).toBe(1);
        expect(tracking.samples[0].file).toBe('new.js');
      } finally {
        jest.useRealTimers();
      }
    });
  });
});

// ── listGotchas ───────────────────────────────────────────────────────────────

describe('listGotchas', () => {
  let m;
  beforeEach(() => {
    m = makeMemory();
    m.addGotcha({ title: 'Build fail', description: 'D', category: GotchaCategory.BUILD, severity: 'critical' });
    m.addGotcha({ title: 'Test flake', description: 'D', category: GotchaCategory.TEST, severity: 'info' });
    m.addGotcha({ title: 'Runtime crash', description: 'D', category: GotchaCategory.RUNTIME, severity: 'warning' });
  });

  test('returns all gotchas when no filter', () => {
    expect(m.listGotchas().length).toBe(3);
  });

  test('filters by category', () => {
    const result = m.listGotchas({ category: GotchaCategory.BUILD });
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Build fail');
  });

  test('filters by severity', () => {
    const result = m.listGotchas({ severity: 'info' });
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Test flake');
  });

  test('filters unresolved only', () => {
    const first = m.listGotchas()[0];
    m.resolveGotcha(first.id);
    expect(m.listGotchas({ unresolved: true }).length).toBe(2);
  });

  test('sorts critical first', () => {
    const list = m.listGotchas();
    expect(list[0].severity).toBe(Severity.CRITICAL);
  });
});

// ── resolveGotcha ─────────────────────────────────────────────────────────────

describe('resolveGotcha', () => {
  let m;
  beforeEach(() => { m = makeMemory(); });

  test('marks gotcha as resolved', () => {
    const g = m.addGotcha({ title: 'T', description: 'D' });
    const updated = m.resolveGotcha(g.id);
    expect(updated.resolved).toBe(true);
    expect(updated.resolvedAt).toBeTruthy();
    expect(updated.resolvedBy).toBe('manual');
  });

  test('returns null for unknown id', () => {
    expect(m.resolveGotcha('nonexistent-id')).toBeNull();
  });

  test('emits GOTCHA_RESOLVED event', () => {
    const handler = jest.fn();
    m.on(Events.GOTCHA_RESOLVED, handler);
    const g = m.addGotcha({ title: 'T', description: 'D' });
    m.resolveGotcha(g.id);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: g.id }));
  });

  test('accepts custom resolvedBy', () => {
    const g = m.addGotcha({ title: 'T', description: 'D' });
    const updated = m.resolveGotcha(g.id, '@dev');
    expect(updated.resolvedBy).toBe('@dev');
  });
});

// ── removeGotcha ──────────────────────────────────────────────────────────────

describe('removeGotcha', () => {
  let m;
  beforeEach(() => { m = makeMemory(); });

  test('removes gotcha from map', () => {
    const g = m.addGotcha({ title: 'T', description: 'D' });
    m.removeGotcha(g.id);
    expect(m.gotchas.has(g.id)).toBe(false);
  });

  test('returns true when removed', () => {
    const g = m.addGotcha({ title: 'T', description: 'D' });
    expect(m.removeGotcha(g.id)).toBe(true);
  });

  test('returns false for unknown id', () => {
    expect(m.removeGotcha('not-a-real-id')).toBe(false);
  });

  test('emits GOTCHA_REMOVED event', () => {
    const handler = jest.fn();
    m.on(Events.GOTCHA_REMOVED, handler);
    const g = m.addGotcha({ title: 'T', description: 'D' });
    m.removeGotcha(g.id);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ── search ────────────────────────────────────────────────────────────────────

describe('search', () => {
  let m;
  beforeEach(() => {
    m = makeMemory();
    m.addGotcha({ title: 'Webpack chunk splitting', description: 'Chunk too large error' });
    m.addGotcha({ title: 'Jest mock timing', description: 'Async spy not called' });
    m.addGotcha({ title: 'CORS header missing', description: 'API returns 403' });
  });

  test('returns matching gotchas', () => {
    expect(m.search('webpack').length).toBe(1);
    expect(m.search('jest').length).toBe(1);
  });

  test('returns empty array for no matches', () => {
    expect(m.search('kubernetes')).toHaveLength(0);
  });

  test('search is case-insensitive', () => {
    expect(m.search('CORS').length).toBe(1);
    expect(m.search('cors').length).toBe(1);
  });

  test('matches on description field', () => {
    expect(m.search('spy not called').length).toBe(1);
  });
});

// ── getStatistics ─────────────────────────────────────────────────────────────

describe('getStatistics', () => {
  let m;
  beforeEach(() => {
    m = makeMemory({ repeatThreshold: 2 });
    m.addGotcha({ title: 'A', description: 'D', severity: 'critical', category: GotchaCategory.BUILD });
    m.addGotcha({ title: 'B', description: 'D', severity: 'info', category: GotchaCategory.BUILD });
  });

  test('counts total, resolved, unresolved', () => {
    const first = m.listGotchas()[0];
    m.resolveGotcha(first.id);

    const stats = m.getStatistics();
    expect(stats.totalGotchas).toBe(2);
    expect(stats.resolved).toBe(1);
    expect(stats.unresolved).toBe(1);
  });

  test('groups by category', () => {
    const stats = m.getStatistics();
    expect(stats.byCategory[GotchaCategory.BUILD]).toBe(2);
  });

  test('groups by severity', () => {
    const stats = m.getStatistics();
    expect(stats.bySeverity.critical).toBe(1);
    expect(stats.bySeverity.info).toBe(1);
    expect(stats.bySeverity.warning).toBe(0);
  });

  test('counts trackedErrors', () => {
    m.trackError({ message: 'some error' });
    const stats = m.getStatistics();
    expect(stats.trackedErrors).toBe(1);
  });
});

// ── getContextForTask ─────────────────────────────────────────────────────────

describe('getContextForTask', () => {
  let m;
  beforeEach(() => {
    m = makeMemory();
    m.addGotcha({
      title: 'Jest mock issue',
      description: 'Always restore mocks in afterEach',
      category: GotchaCategory.TEST,
    });
    m.addGotcha({
      title: 'Supabase RLS policy',
      description: 'Row Level Security blocks unauthenticated reads',
      category: GotchaCategory.SECURITY,
    });
    m.addGotcha({
      title: 'Vite build fails on symlinks',
      description: 'Build error on symbolic links in src/',
      category: GotchaCategory.BUILD,
    });
  });

  test('returns gotchas relevant to task description', () => {
    const result = m.getContextForTask('writing jest tests with mocks');
    expect(result.some((g) => g.title.includes('Jest'))).toBe(true);
  });

  test('emits CONTEXT_INJECTED when results found', () => {
    const handler = jest.fn();
    m.on(Events.CONTEXT_INJECTED, handler);
    m.getContextForTask('jest unit tests');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('does not emit CONTEXT_INJECTED when no results', () => {
    const handler = jest.fn();
    m.on(Events.CONTEXT_INJECTED, handler);
    m.getContextForTask('completely unrelated gardening task');
    expect(handler).not.toHaveBeenCalled();
  });

  test('skips resolved gotchas', () => {
    const g = m.listGotchas().find((x) => x.title.includes('Jest'));
    m.resolveGotcha(g.id);
    const result = m.getContextForTask('jest tests mocks');
    expect(result.every((x) => !x.resolved)).toBe(true);
  });

  test('returns at most 5 results', () => {
    // Add more gotchas that all match
    for (let i = 0; i < 8; i++) {
      m.addGotcha({ title: `Jest issue ${i}`, description: 'test jest mock spy' });
    }
    const result = m.getContextForTask('jest tests');
    expect(result.length).toBeLessThanOrEqual(5);
  });
});

// ── formatForPrompt ───────────────────────────────────────────────────────────

describe('formatForPrompt', () => {
  let m;
  beforeEach(() => { m = makeMemory(); });

  test('returns empty string for empty array', () => {
    expect(m.formatForPrompt([])).toBe('');
    expect(m.formatForPrompt(null)).toBe('');
  });

  test('returns markdown with gotcha title and description', () => {
    const g = m.addGotcha({ title: 'My Gotcha', description: 'Some description', severity: 'critical' });
    const output = m.formatForPrompt([g]);
    expect(output).toContain('My Gotcha');
    expect(output).toContain('Some description');
    expect(output).toContain('[CRITICAL]');
  });

  test('includes workaround when present', () => {
    const g = m.addGotcha({ title: 'T', description: 'D', workaround: 'Use X instead of Y' });
    const output = m.formatForPrompt([g]);
    expect(output).toContain('Use X instead of Y');
  });
});

// ── persistence ───────────────────────────────────────────────────────────────

describe('persistence', () => {
  test('loads gotchas persisted in previous session', () => {
    const root = makeTmpDir();
    const m1 = new GotchasMemory(root, { quiet: true });
    m1.addGotcha({ title: 'Persistent gotcha', description: 'D' });

    // New instance at same root should load the saved data
    const m2 = new GotchasMemory(root, { quiet: true });
    expect(m2.gotchas.size).toBe(1);
    expect([...m2.gotchas.values()][0].title).toBe('Persistent gotcha');
  });

  test('loads error tracking persisted in previous session', () => {
    const root = makeTmpDir();
    const m1 = new GotchasMemory(root, { quiet: true, repeatThreshold: 5 });
    m1.trackError({ message: 'Recurring failure' });
    m1.trackError({ message: 'Recurring failure' });

    const m2 = new GotchasMemory(root, { quiet: true, repeatThreshold: 5 });
    expect(m2.errorTracking.size).toBe(1);
    const tracking = [...m2.errorTracking.values()][0];
    expect(tracking.count).toBe(2);
  });

  test('gracefully handles corrupt JSON file', () => {
    const root = makeTmpDir();
    const aiosDir = path.join(root, '.aios');
    fs.mkdirSync(aiosDir, { recursive: true });
    fs.writeFileSync(path.join(aiosDir, 'gotchas.json'), 'not valid json', 'utf-8');

    // Should not throw — just start fresh
    expect(() => new GotchasMemory(root, { quiet: true })).not.toThrow();
  });
});

// ── toJSON / toMarkdown ───────────────────────────────────────────────────────

describe('toJSON', () => {
  let m;
  beforeEach(() => { m = makeMemory(); });

  test('includes schema and version', () => {
    const json = m.toJSON();
    expect(json.schema).toBe(CONFIG.schemaVersion);
    expect(json.version).toBe(CONFIG.version);
  });

  test('includes gotchas array', () => {
    m.addGotcha({ title: 'T', description: 'D' });
    const json = m.toJSON();
    expect(json.gotchas.length).toBe(1);
  });
});

describe('toMarkdown', () => {
  let m;
  beforeEach(() => { m = makeMemory(); });

  test('returns a markdown string', () => {
    const md = m.toMarkdown();
    expect(typeof md).toBe('string');
    expect(md).toContain('# Known Gotchas');
  });

  test('includes gotcha titles in output', () => {
    m.addGotcha({ title: 'Custom Gotcha Title', description: 'D' });
    const md = m.toMarkdown();
    expect(md).toContain('Custom Gotcha Title');
  });
});
