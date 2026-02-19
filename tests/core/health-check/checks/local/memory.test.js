/**
 * Unit tests for MemoryCheck
 *
 * Tests memory availability detection: total/free memory thresholds,
 * high usage percentage, formatMemory utility, and edge cases.
 */

const os = require('os');
const MemoryCheck = require('../../../../../.aios-core/core/health-check/checks/local/memory');

jest.mock('os');

describe('MemoryCheck', () => {
  let check;
  const MB = 1024 * 1024;
  const GB = 1024 * MB;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new MemoryCheck();
    // Default: healthy system
    os.totalmem.mockReturnValue(16 * GB);
    os.freemem.mockReturnValue(8 * GB);
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('local.memory');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });
  });

  describe('execute - healthy', () => {
    test('passes with plenty of free memory', async () => {
      const result = await check.execute({});
      expect(result.status).toBe('pass');
      expect(result.message).toContain('Memory OK');
    });
  });

  describe('execute - low memory (fail)', () => {
    test('fails when free memory below 512MB', async () => {
      os.totalmem.mockReturnValue(4 * GB);
      os.freemem.mockReturnValue(256 * MB);

      const result = await check.execute({});
      expect(result.status).toBe('fail');
      expect(result.message).toContain('Low memory');
    });
  });

  describe('execute - warning thresholds', () => {
    test('warns when free memory below 1GB', async () => {
      os.totalmem.mockReturnValue(8 * GB);
      os.freemem.mockReturnValue(800 * MB);

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('running low');
    });

    test('warns when usage above 90%', async () => {
      os.totalmem.mockReturnValue(16 * GB);
      os.freemem.mockReturnValue(1.5 * GB); // ~90.6% used but > 1GB free

      const result = await check.execute({});
      expect(result.status).toBe('warning');
      expect(result.message).toContain('High memory usage');
    });
  });

  describe('execute - details', () => {
    test('includes all memory details', async () => {
      const result = await check.execute({});
      expect(result.details).toBeDefined();
      const d = result.details.details || result.details;
      expect(d.total).toBeDefined();
      expect(d.free).toBeDefined();
      expect(d.used).toBeDefined();
      expect(d.usedPercent).toBeDefined();
      expect(d.nodeHeap).toBeDefined();
    });
  });

  describe('formatMemory', () => {
    test('formats MB values', () => {
      expect(check.formatMemory(512)).toBe('512 MB');
    });

    test('formats GB values', () => {
      expect(check.formatMemory(2048)).toBe('2.0 GB');
    });

    test('formats exact 1GB', () => {
      expect(check.formatMemory(1024)).toBe('1.0 GB');
    });
  });

  describe('getHealer', () => {
    test('returns manual guide with warning', () => {
      const healer = check.getHealer();
      expect(healer.action).toBe('manual');
      expect(healer.warning).toBeDefined();
      expect(healer.steps.length).toBeGreaterThan(0);
    });
  });
});
