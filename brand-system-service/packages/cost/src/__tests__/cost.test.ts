/**
 * Unit tests for @brand-system/cost package.
 *
 * Covers: cost logging, aggregation, 80% warning, 100% throttle,
 * monthly reset, rate calculation, unknown model error.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { CostLedger } from '../ledger';
import { CostTracker } from '../tracker';
import type { BudgetWarningEvent } from '../tracker';
import { loadRates, calculateCost } from '../rate-loader';
import { readBudgetConfig } from '../budget-config';
import { UnknownModelError, BudgetExceededError } from '../errors';
import type { CostRecord, CostRatesConfig } from '../types';

// ---------------------------------------------------------------------------
// Mock fs module
// ---------------------------------------------------------------------------

jest.mock('node:fs');

const mockFs = fs as jest.Mocked<typeof fs>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_DIR = '/test-project';

function makeCostRecord(overrides: Partial<CostRecord> = {}): CostRecord {
  return {
    timestamp: '2026-03-15T10:00:00.000Z',
    clientId: 'client-1',
    provider: 'claude',
    model: 'claude-sonnet-4-6',
    inputTokens: 1000,
    outputTokens: 500,
    imageCount: 0,
    costUsd: 0.0105,
    latencyMs: 450,
    jobId: 'job_1',
    deliverableType: 'brand-book',
    ...overrides,
  };
}

const DEFAULT_RATES: CostRatesConfig = {
  version: '1.0',
  lastUpdated: '2026-03-16',
  rates: {
    'claude-sonnet-4-6': { inputPer1MTok: 3.0, outputPer1MTok: 15.0 },
    'claude-opus-4-5': { inputPer1MTok: 15.0, outputPer1MTok: 75.0 },
    'flux-1.1-pro': { perImage: 0.04 },
    'dall-e-3-standard': { perImage: 0.04 },
  },
};

// ---------------------------------------------------------------------------
// Rate Loader Tests
// ---------------------------------------------------------------------------

describe('rate-loader', () => {
  describe('loadRates', () => {
    it('loads and parses cost rates from file', () => {
      mockFs.readFileSync.mockReturnValue(JSON.stringify(DEFAULT_RATES));
      const rates = loadRates('/some/path/cost-rates.json');
      expect(rates.version).toBe('1.0');
      expect(rates.rates['claude-sonnet-4-6']).toBeDefined();
    });
  });

  describe('calculateCost', () => {
    it('calculates text model cost correctly', () => {
      // 1000 input tokens at $3/1M = $0.003
      // 500 output tokens at $15/1M = $0.0075
      // Total = $0.0105
      const cost = calculateCost(DEFAULT_RATES, 'claude-sonnet-4-6', 1000, 500, 0);
      expect(cost).toBeCloseTo(0.0105, 6);
    });

    it('calculates image model cost correctly', () => {
      const cost = calculateCost(DEFAULT_RATES, 'flux-1.1-pro', 0, 0, 3);
      expect(cost).toBeCloseTo(0.12, 6);
    });

    it('throws UnknownModelError for unknown model', () => {
      expect(() => calculateCost(DEFAULT_RATES, 'nonexistent-model', 100, 100, 0))
        .toThrow(UnknownModelError);
    });

    it('UnknownModelError has correct properties', () => {
      try {
        calculateCost(DEFAULT_RATES, 'bad-model', 0, 0, 0);
        fail('Expected UnknownModelError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnknownModelError);
        expect((err as UnknownModelError).model).toBe('bad-model');
        expect((err as UnknownModelError).code).toBe('UNKNOWN_MODEL');
      }
    });
  });
});

// ---------------------------------------------------------------------------
// CostLedger Tests
// ---------------------------------------------------------------------------

describe('CostLedger', () => {
  let ledger: CostLedger;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.existsSync.mockReturnValue(false);
    mockFs.writeFileSync.mockReturnValue(undefined);
    ledger = new CostLedger(BASE_DIR);
  });

  describe('record', () => {
    it('creates directory and writes record to correct file path', () => {
      const record = makeCostRecord();
      ledger.record(record);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        path.join(BASE_DIR, '.ai', 'cost-ledger', 'client-1'),
        { recursive: true },
      );

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(BASE_DIR, '.ai', 'cost-ledger', 'client-1', '2026-03.json'),
        expect.any(String),
        'utf-8',
      );

      const written = JSON.parse(
        (mockFs.writeFileSync as jest.Mock).mock.calls[0][1] as string,
      );
      expect(written).toHaveLength(1);
      expect(written[0].clientId).toBe('client-1');
    });

    it('appends to existing records', () => {
      const existing = [makeCostRecord({ costUsd: 0.01 })];
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(existing));

      ledger.record(makeCostRecord({ costUsd: 0.02 }));

      const written = JSON.parse(
        (mockFs.writeFileSync as jest.Mock).mock.calls[0][1] as string,
      );
      expect(written).toHaveLength(2);
      expect(written[0].costUsd).toBe(0.01);
      expect(written[1].costUsd).toBe(0.02);
    });
  });

  describe('readPeriod', () => {
    it('returns empty array when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      const records = ledger.readPeriod('client-1', 2026, 3);
      expect(records).toEqual([]);
    });

    it('returns parsed records when file exists', () => {
      const records = [makeCostRecord()];
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(records));

      const result = ledger.readPeriod('client-1', 2026, 3);
      expect(result).toHaveLength(1);
      expect(result[0].clientId).toBe('client-1');
    });
  });
});

// ---------------------------------------------------------------------------
// Budget Config Tests
// ---------------------------------------------------------------------------

describe('readBudgetConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env['DEFAULT_CLIENT_BUDGET_USD'];
  });

  it('returns default budget when no client file exists', () => {
    mockFs.existsSync.mockReturnValue(false);
    const config = readBudgetConfig(BASE_DIR, 'client-1');
    expect(config.budgetUsd).toBe(200);
    expect(config.currency).toBe('USD');
  });

  it('reads per-client override from file', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({ budgetUsd: 500, currency: 'USD', resetDay: 1 }),
    );

    const config = readBudgetConfig(BASE_DIR, 'premium-client');
    expect(config.budgetUsd).toBe(500);
  });

  it('respects DEFAULT_CLIENT_BUDGET_USD env var', () => {
    process.env['DEFAULT_CLIENT_BUDGET_USD'] = '350';
    mockFs.existsSync.mockReturnValue(false);

    const config = readBudgetConfig(BASE_DIR, 'client-1');
    expect(config.budgetUsd).toBe(350);
  });
});

// ---------------------------------------------------------------------------
// CostTracker Tests
// ---------------------------------------------------------------------------

describe('CostTracker', () => {
  let ledger: CostLedger;
  let tracker: CostTracker;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env['DEFAULT_CLIENT_BUDGET_USD'];
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.writeFileSync.mockReturnValue(undefined);

    ledger = new CostLedger(BASE_DIR);
    tracker = new CostTracker(ledger, BASE_DIR);
  });

  describe('getClientCost', () => {
    it('aggregates multiple records correctly', () => {
      const records = [
        makeCostRecord({ costUsd: 10, provider: 'claude' }),
        makeCostRecord({ costUsd: 5, provider: 'openai-text' }),
        makeCostRecord({ costUsd: 3, provider: 'claude' }),
      ];
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(records));

      const summary = tracker.getClientCost('client-1', { year: 2026, month: 3 });
      expect(summary.totalCostUsd).toBe(18);
      expect(summary.callCount).toBe(3);
      expect(summary.breakdown.byProvider['claude']).toBe(13);
      expect(summary.breakdown.byProvider['openai-text']).toBe(5);
    });

    it('returns zero when no records exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const summary = tracker.getClientCost('client-1', { year: 2026, month: 3 });
      expect(summary.totalCostUsd).toBe(0);
      expect(summary.callCount).toBe(0);
    });
  });

  describe('canSubmit — 80% warning', () => {
    it('emits BudgetWarningEvent at 80% threshold', () => {
      // Budget is $200, spend is $165 (82.5%)
      const records = [makeCostRecord({ costUsd: 165 })];
      mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
        const filePath = p.toString();
        // Budget file does not exist (use default $200)
        if (filePath.includes('budgets')) return false;
        // Ledger file exists
        return true;
      });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(records));

      const warnings: BudgetWarningEvent[] = [];
      tracker.onBudgetWarning((event) => warnings.push(event));

      tracker.canSubmit('client-1');

      expect(warnings).toHaveLength(1);
      expect(warnings[0].clientId).toBe('client-1');
      expect(warnings[0].percentUsed).toBeCloseTo(82.5, 1);
    });

    it('emits warning only ONCE per period', () => {
      const records = [makeCostRecord({ costUsd: 165 })];
      mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
        if (p.toString().includes('budgets')) return false;
        return true;
      });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(records));

      const warnings: BudgetWarningEvent[] = [];
      tracker.onBudgetWarning((event) => warnings.push(event));

      tracker.canSubmit('client-1');
      tracker.canSubmit('client-1');
      tracker.canSubmit('client-1');

      expect(warnings).toHaveLength(1);
    });
  });

  describe('canSubmit — 100% throttle', () => {
    it('throws BudgetExceededError at 100% budget', () => {
      const records = [makeCostRecord({ costUsd: 200 })];
      mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
        if (p.toString().includes('budgets')) return false;
        return true;
      });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(records));

      expect(() => tracker.canSubmit('client-1')).toThrow(BudgetExceededError);
    });

    it('BudgetExceededError has correct properties', () => {
      const records = [makeCostRecord({ costUsd: 250 })];
      mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
        if (p.toString().includes('budgets')) return false;
        return true;
      });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(records));

      try {
        tracker.canSubmit('client-1');
        fail('Expected BudgetExceededError');
      } catch (err) {
        expect(err).toBeInstanceOf(BudgetExceededError);
        expect((err as BudgetExceededError).clientId).toBe('client-1');
        expect((err as BudgetExceededError).currentSpend).toBe(250);
        expect((err as BudgetExceededError).budgetCap).toBe(200);
      }
    });

    it('returns true when under budget', () => {
      const records = [makeCostRecord({ costUsd: 50 })];
      mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
        if (p.toString().includes('budgets')) return false;
        return true;
      });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(records));

      expect(tracker.canSubmit('client-1')).toBe(true);
    });
  });

  describe('monthly reset', () => {
    it('only includes records from the specified period', () => {
      // Records for March
      const marchRecords = [makeCostRecord({ costUsd: 100 })];
      // Records for February (different file)
      const febRecords = [makeCostRecord({ costUsd: 500 })];

      mockFs.existsSync.mockImplementation((p: fs.PathLike) => {
        const filePath = p.toString();
        if (filePath.includes('budgets')) return false;
        if (filePath.includes('2026-03.json')) return true;
        if (filePath.includes('2026-02.json')) return true;
        return false;
      });

      mockFs.readFileSync.mockImplementation((p: fs.PathOrFileDescriptor) => {
        const filePath = p.toString();
        if (filePath.includes('2026-03.json')) return JSON.stringify(marchRecords);
        if (filePath.includes('2026-02.json')) return JSON.stringify(febRecords);
        return '[]';
      });

      // March summary should only include March records
      const marchSummary = tracker.getClientCost('client-1', { year: 2026, month: 3 });
      expect(marchSummary.totalCostUsd).toBe(100);

      // February summary should only include Feb records
      const febSummary = tracker.getClientCost('client-1', { year: 2026, month: 2 });
      expect(febSummary.totalCostUsd).toBe(500);
    });
  });
});

// ---------------------------------------------------------------------------
// Error Type Tests
// ---------------------------------------------------------------------------

describe('Error types', () => {
  it('UnknownModelError is instanceof Error', () => {
    const err = new UnknownModelError('test-model');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(UnknownModelError);
    expect(err.name).toBe('UnknownModelError');
  });

  it('BudgetExceededError is instanceof Error', () => {
    const err = new BudgetExceededError('client-1', 250, 200);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(BudgetExceededError);
    expect(err.name).toBe('BudgetExceededError');
    expect(err.code).toBe('BUDGET_EXCEEDED');
  });
});
