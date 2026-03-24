/**
 * Tests for AI API call logging.
 * Story: BSS-1.7 AC-2, AC-5
 */

import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { logAiApiCall, summarizeAiCosts, calculateCost, rotateLogIfNeeded } from '../ai-logger';
import type { AiApiCallEntry } from '../types';

// Suppress console output
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Mock sentry to prevent actual captures
jest.mock('../sentry', () => ({
  captureError: jest.fn(),
}));

const TEST_LOG_DIR = path.join('output', 'test-ai-logs');
const TEST_LOG_PATH = path.join(TEST_LOG_DIR, 'ai-calls.jsonl');

function makeEntry(overrides: Partial<AiApiCallEntry> = {}): AiApiCallEntry {
  return {
    timestamp: '2026-03-16T12:00:00.000Z',
    clientId: 'acme',
    provider: 'claude',
    model: 'claude-sonnet-4-5',
    inputTokens: 1000,
    outputTokens: 500,
    totalCost: 0.0105,
    latencyMs: 1200,
    success: true,
    ...overrides,
  };
}

beforeEach(() => {
  if (existsSync(TEST_LOG_DIR)) rmSync(TEST_LOG_DIR, { recursive: true });
  mkdirSync(TEST_LOG_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_LOG_DIR)) rmSync(TEST_LOG_DIR, { recursive: true });
});

describe('logAiApiCall', () => {
  it('appends entry as JSONL', async () => {
    await logAiApiCall(makeEntry(), TEST_LOG_PATH);

    const content = readFileSync(TEST_LOG_PATH, 'utf-8').trim();
    const entry = JSON.parse(content);
    expect(entry.clientId).toBe('acme');
    expect(entry.provider).toBe('claude');
  });

  it('appends multiple entries as separate lines', async () => {
    await logAiApiCall(makeEntry({ clientId: 'a' }), TEST_LOG_PATH);
    await logAiApiCall(makeEntry({ clientId: 'b' }), TEST_LOG_PATH);

    const lines = readFileSync(TEST_LOG_PATH, 'utf-8').trim().split('\n');
    expect(lines).toHaveLength(2);
  });

  it('creates directory if needed', async () => {
    const newPath = path.join(TEST_LOG_DIR, 'nested', 'logs', 'ai.jsonl');
    await logAiApiCall(makeEntry(), newPath);
    expect(existsSync(newPath)).toBe(true);
  });
});

describe('rotateLogIfNeeded', () => {
  it('does nothing when file does not exist', async () => {
    await expect(rotateLogIfNeeded(TEST_LOG_PATH)).resolves.not.toThrow();
  });

  it('does nothing when file is under limit', async () => {
    writeFileSync(TEST_LOG_PATH, 'small content', 'utf-8');
    await rotateLogIfNeeded(TEST_LOG_PATH);
    expect(existsSync(TEST_LOG_PATH)).toBe(true);
  });
});

describe('summarizeAiCosts', () => {
  it('returns zero summary for empty log', () => {
    const result = summarizeAiCosts('acme', '2026-03', TEST_LOG_PATH);
    expect(result.callCount).toBe(0);
    expect(result.totalCost).toBe(0);
  });

  it('aggregates costs by client and month', async () => {
    await logAiApiCall(
      makeEntry({ clientId: 'acme', timestamp: '2026-03-16T10:00:00.000Z', totalCost: 0.01 }),
      TEST_LOG_PATH,
    );
    await logAiApiCall(
      makeEntry({ clientId: 'acme', timestamp: '2026-03-16T11:00:00.000Z', totalCost: 0.02 }),
      TEST_LOG_PATH,
    );
    await logAiApiCall(
      makeEntry({ clientId: 'other', timestamp: '2026-03-16T12:00:00.000Z', totalCost: 0.05 }),
      TEST_LOG_PATH,
    );

    const result = summarizeAiCosts('acme', '2026-03', TEST_LOG_PATH);
    expect(result.callCount).toBe(2);
    expect(result.totalCost).toBeCloseTo(0.03);
  });

  it('groups by provider', async () => {
    await logAiApiCall(
      makeEntry({ provider: 'claude', timestamp: '2026-03-16T10:00:00.000Z', totalCost: 0.01 }),
      TEST_LOG_PATH,
    );
    await logAiApiCall(
      makeEntry({ provider: 'openai', timestamp: '2026-03-16T11:00:00.000Z', totalCost: 0.02 }),
      TEST_LOG_PATH,
    );

    const result = summarizeAiCosts('acme', '2026-03', TEST_LOG_PATH);
    expect(result.byProvider['claude']).toBeDefined();
    expect(result.byProvider['openai']).toBeDefined();
    expect(result.byProvider['claude'].calls).toBe(1);
  });

  it('filters by month', async () => {
    await logAiApiCall(
      makeEntry({ timestamp: '2026-02-15T10:00:00.000Z', totalCost: 0.01 }),
      TEST_LOG_PATH,
    );
    await logAiApiCall(
      makeEntry({ timestamp: '2026-03-16T10:00:00.000Z', totalCost: 0.02 }),
      TEST_LOG_PATH,
    );

    const result = summarizeAiCosts('acme', '2026-03', TEST_LOG_PATH);
    expect(result.callCount).toBe(1);
    expect(result.totalCost).toBeCloseTo(0.02);
  });
});

describe('calculateCost', () => {
  it('calculates cost for Claude Sonnet 4.5', () => {
    const cost = calculateCost('claude', 'claude-sonnet-4-5', 1_000_000, 100_000);
    expect(cost).toBeCloseTo(3.0 + 1.5); // $3/M input + $15/M output * 0.1M
  });

  it('calculates cost for GPT-4o', () => {
    const cost = calculateCost('openai', 'gpt-4o', 1_000_000, 100_000);
    expect(cost).toBeCloseTo(2.5 + 1.0);
  });

  it('calculates cost for image model', () => {
    const cost = calculateCost('replicate', 'flux-1.1-pro', 0, 0);
    expect(cost).toBe(0.04);
  });

  it('returns 0 for unknown model', () => {
    const cost = calculateCost('claude', 'unknown-model', 1000, 500);
    expect(cost).toBe(0);
  });
});
