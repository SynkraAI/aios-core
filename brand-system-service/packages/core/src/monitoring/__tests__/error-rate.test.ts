/**
 * Tests for error rate monitoring.
 * Story: BSS-1.7 AC-4
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { checkErrorRate } from '../error-rate';

const TEST_LOGS_DIR = path.join('output', 'test-error-rate-logs');

beforeEach(() => {
  if (existsSync(TEST_LOGS_DIR)) rmSync(TEST_LOGS_DIR, { recursive: true });
  mkdirSync(TEST_LOGS_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_LOGS_DIR)) rmSync(TEST_LOGS_DIR, { recursive: true });
});

describe('checkErrorRate', () => {
  it('returns zero for non-existent directory', () => {
    const result = checkErrorRate(24, path.join(TEST_LOGS_DIR, 'nonexistent'));
    expect(result.errorCount).toBe(0);
    expect(result.rate).toBe(0);
    expect(result.topErrors).toEqual([]);
  });

  it('returns zero for empty directory', () => {
    const result = checkErrorRate(24, TEST_LOGS_DIR);
    expect(result.errorCount).toBe(0);
  });

  it('counts errors within the time window', () => {
    const now = new Date();
    const entries = [
      { level: 'ERROR', timestamp: now.toISOString(), message: 'Something failed' },
      { level: 'ERROR', timestamp: now.toISOString(), message: 'Another failure' },
      { level: 'INFO', timestamp: now.toISOString(), message: 'This is fine' },
    ];

    const logContent = entries.map((e) => JSON.stringify(e)).join('\n');
    writeFileSync(path.join(TEST_LOGS_DIR, 'app.jsonl'), logContent, 'utf-8');

    const result = checkErrorRate(24, TEST_LOGS_DIR);
    expect(result.errorCount).toBe(2);
  });

  it('filters out errors outside the window', () => {
    const old = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h ago
    const recent = new Date();
    const entries = [
      { level: 'ERROR', timestamp: old.toISOString(), message: 'Old error' },
      { level: 'ERROR', timestamp: recent.toISOString(), message: 'Recent error' },
    ];

    const logContent = entries.map((e) => JSON.stringify(e)).join('\n');
    writeFileSync(path.join(TEST_LOGS_DIR, 'app.jsonl'), logContent, 'utf-8');

    const result = checkErrorRate(24, TEST_LOGS_DIR);
    expect(result.errorCount).toBe(1);
  });

  it('handles CRITICAL severity as error', () => {
    const now = new Date();
    const entries = [
      { severity: 'CRITICAL', timestamp: now.toISOString(), event: 'MALWARE_DETECTED' },
    ];

    const logContent = entries.map((e) => JSON.stringify(e)).join('\n');
    writeFileSync(path.join(TEST_LOGS_DIR, 'security.jsonl'), logContent, 'utf-8');

    const result = checkErrorRate(24, TEST_LOGS_DIR);
    expect(result.errorCount).toBe(1);
  });

  it('calculates error rate correctly', () => {
    const now = new Date();
    const entries = Array.from({ length: 12 }, (_, i) => ({
      level: 'ERROR',
      timestamp: now.toISOString(),
      message: `Error ${i}`,
    }));

    const logContent = entries.map((e) => JSON.stringify(e)).join('\n');
    writeFileSync(path.join(TEST_LOGS_DIR, 'app.jsonl'), logContent, 'utf-8');

    const result = checkErrorRate(24, TEST_LOGS_DIR);
    expect(result.errorCount).toBe(12);
    expect(result.rate).toBe(0.5); // 12 errors / 24 hours
  });

  it('returns top errors sorted by frequency', () => {
    const now = new Date();
    const entries = [
      { level: 'ERROR', timestamp: now.toISOString(), message: 'Frequent error' },
      { level: 'ERROR', timestamp: now.toISOString(), message: 'Frequent error' },
      { level: 'ERROR', timestamp: now.toISOString(), message: 'Frequent error' },
      { level: 'ERROR', timestamp: now.toISOString(), message: 'Rare error' },
    ];

    const logContent = entries.map((e) => JSON.stringify(e)).join('\n');
    writeFileSync(path.join(TEST_LOGS_DIR, 'app.jsonl'), logContent, 'utf-8');

    const result = checkErrorRate(24, TEST_LOGS_DIR);
    expect(result.topErrors[0]).toContain('Frequent error');
    expect(result.topErrors[0]).toContain('3x');
  });

  it('includes generatedAt timestamp', () => {
    const result = checkErrorRate(24, TEST_LOGS_DIR);
    expect(result.generatedAt).toBeDefined();
    expect(() => new Date(result.generatedAt)).not.toThrow();
  });
});
