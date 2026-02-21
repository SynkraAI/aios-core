/**
 * CodeIntelEnricher Tests
 *
 * Tests for the composite code intelligence enricher that builds
 * higher-level analysis on top of primitive CodeIntelClient capabilities.
 *
 * @version 1.0.0
 */

const {
  CodeIntelEnricher,
} = require('../../../.aios-core/core/code-intel/code-intel-enricher');

function createMockClient(overrides = {}) {
  return {
    findReferences: jest.fn().mockResolvedValue([]),
    analyzeComplexity: jest.fn().mockResolvedValue({ score: 0 }),
    analyzeCodebase: jest.fn().mockResolvedValue({ patterns: [] }),
    getProjectStats: jest.fn().mockResolvedValue({}),
    ...overrides,
  };
}

describe('CodeIntelEnricher', () => {
  let client;
  let enricher;

  beforeEach(() => {
    jest.resetAllMocks();
    client = createMockClient();
    enricher = new CodeIntelEnricher(client);
  });

  describe('constructor', () => {
    it('should store the client reference', () => {
      expect(enricher._client).toBe(client);
    });
  });

  // ---------------------------------------------------------------------------
  // assessImpact
  // ---------------------------------------------------------------------------
  describe('assessImpact', () => {
    it('should return null when files is null', async () => {
      const result = await enricher.assessImpact(null);
      expect(result).toBeNull();
    });

    it('should return null when files is an empty array', async () => {
      const result = await enricher.assessImpact([]);
      expect(result).toBeNull();
    });

    it('should return null when files is undefined', async () => {
      const result = await enricher.assessImpact(undefined);
      expect(result).toBeNull();
    });

    it('should call findReferences and analyzeComplexity for each file', async () => {
      const files = ['src/foo.js', 'src/bar.js'];
      client.findReferences.mockResolvedValue([]);
      client.analyzeComplexity.mockResolvedValue({ score: 5 });

      await enricher.assessImpact(files);

      expect(client.findReferences).toHaveBeenCalledTimes(2);
      expect(client.findReferences).toHaveBeenCalledWith('src/foo.js');
      expect(client.findReferences).toHaveBeenCalledWith('src/bar.js');
      expect(client.analyzeComplexity).toHaveBeenCalledTimes(2);
      expect(client.analyzeComplexity).toHaveBeenCalledWith('src/foo.js');
      expect(client.analyzeComplexity).toHaveBeenCalledWith('src/bar.js');
    });

    it('should aggregate references and compute average complexity', async () => {
      const refs1 = [{ file: 'a.js', line: 1 }];
      const refs2 = [{ file: 'b.js', line: 2 }, { file: 'c.js', line: 3 }];
      client.findReferences
        .mockResolvedValueOnce(refs1)
        .mockResolvedValueOnce(refs2);
      client.analyzeComplexity
        .mockResolvedValueOnce({ score: 4 })
        .mockResolvedValueOnce({ score: 8 });

      const result = await enricher.assessImpact(['x.js', 'y.js']);

      expect(result.references).toEqual([...refs1, ...refs2]);
      expect(result.complexity.average).toBe(6); // (4+8)/2
      expect(result.complexity.perFile).toHaveLength(2);
      expect(result.blastRadius).toBe(3); // total refs count
    });

    it('should handle per-file errors gracefully (references and complexity become null)', async () => {
      client.findReferences
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce([{ file: 'ok.js', line: 1 }]);
      client.analyzeComplexity
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({ score: 10 });

      const result = await enricher.assessImpact(['bad.js', 'good.js']);

      expect(result).not.toBeNull();
      // The failing file contributes null refs and null complexity
      expect(result.complexity.perFile[0].references).toBeNull();
      expect(result.complexity.perFile[0].complexity).toBeNull();
      // The working file is fine
      expect(result.complexity.perFile[1].references).toEqual([{ file: 'ok.js', line: 1 }]);
      expect(result.references).toEqual([{ file: 'ok.js', line: 1 }]);
      // average: (0 + 10) / 2 = 5
      expect(result.complexity.average).toBe(5);
      expect(result.blastRadius).toBe(1);
    });

    it('should handle null references from client (flatMap treats null as empty)', async () => {
      client.findReferences.mockResolvedValue(null);
      client.analyzeComplexity.mockResolvedValue({ score: 3 });

      const result = await enricher.assessImpact(['file.js']);

      expect(result.references).toEqual([]);
      expect(result.blastRadius).toBe(0);
      expect(result.complexity.average).toBe(3);
    });

    it('should handle complexity with no score property', async () => {
      client.findReferences.mockResolvedValue([]);
      client.analyzeComplexity.mockResolvedValue({});

      const result = await enricher.assessImpact(['file.js']);

      expect(result.complexity.average).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // detectDuplicates
  // ---------------------------------------------------------------------------
  describe('detectDuplicates', () => {
    it('should call findReferences with description and analyzeCodebase with default path', async () => {
      await enricher.detectDuplicates('some feature');

      expect(client.findReferences).toHaveBeenCalledWith('some feature', {});
      expect(client.analyzeCodebase).toHaveBeenCalledWith('.', {});
    });

    it('should pass options.path to analyzeCodebase', async () => {
      const options = { path: 'src/modules', extra: true };

      await enricher.detectDuplicates('feature', options);

      expect(client.findReferences).toHaveBeenCalledWith('feature', options);
      expect(client.analyzeCodebase).toHaveBeenCalledWith('src/modules', options);
    });

    it('should return matches and codebaseOverview', async () => {
      const refs = [{ file: 'dup.js', line: 5 }];
      const codebase = { summary: 'project info' };
      client.findReferences.mockResolvedValue(refs);
      client.analyzeCodebase.mockResolvedValue(codebase);

      const result = await enricher.detectDuplicates('feature');

      expect(result).toEqual({
        matches: refs,
        codebaseOverview: codebase,
      });
    });

    it('should return null when both refs and codebase are null', async () => {
      client.findReferences.mockResolvedValue(null);
      client.analyzeCodebase.mockResolvedValue(null);

      const result = await enricher.detectDuplicates('feature');

      expect(result).toBeNull();
    });

    it('should fallback to empty array/object when one result is null', async () => {
      client.findReferences.mockResolvedValue(null);
      client.analyzeCodebase.mockResolvedValue({ summary: 'info' });

      const result = await enricher.detectDuplicates('feature');

      expect(result).toEqual({
        matches: [],
        codebaseOverview: { summary: 'info' },
      });
    });

    it('should return null on error', async () => {
      client.findReferences.mockRejectedValue(new Error('network'));

      const result = await enricher.detectDuplicates('feature');

      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // getConventions
  // ---------------------------------------------------------------------------
  describe('getConventions', () => {
    it('should call analyzeCodebase with path and getProjectStats', async () => {
      await enricher.getConventions('src/');

      expect(client.analyzeCodebase).toHaveBeenCalledWith('src/');
      expect(client.getProjectStats).toHaveBeenCalledTimes(1);
    });

    it('should return patterns and stats', async () => {
      client.analyzeCodebase.mockResolvedValue({ patterns: ['semicolons', 'camelCase'] });
      client.getProjectStats.mockResolvedValue({ files: 100, lines: 5000 });

      const result = await enricher.getConventions('src/');

      expect(result).toEqual({
        patterns: ['semicolons', 'camelCase'],
        stats: { files: 100, lines: 5000 },
      });
    });

    it('should return null when both codebase and stats are null', async () => {
      client.analyzeCodebase.mockResolvedValue(null);
      client.getProjectStats.mockResolvedValue(null);

      const result = await enricher.getConventions('src/');

      expect(result).toBeNull();
    });

    it('should fallback to empty patterns when codebase is null', async () => {
      client.analyzeCodebase.mockResolvedValue(null);
      client.getProjectStats.mockResolvedValue({ files: 10 });

      const result = await enricher.getConventions('src/');

      expect(result).toEqual({
        patterns: [],
        stats: { files: 10 },
      });
    });

    it('should fallback to empty patterns when codebase has no patterns property', async () => {
      client.analyzeCodebase.mockResolvedValue({ summary: 'info' });
      client.getProjectStats.mockResolvedValue({});

      const result = await enricher.getConventions('src/');

      expect(result.patterns).toEqual([]);
    });

    it('should return null on error', async () => {
      client.analyzeCodebase.mockRejectedValue(new Error('fail'));

      const result = await enricher.getConventions('src/');

      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // findTests
  // ---------------------------------------------------------------------------
  describe('findTests', () => {
    it('should call findReferences with the symbol', async () => {
      await enricher.findTests('MyClass');

      expect(client.findReferences).toHaveBeenCalledWith('MyClass');
    });

    it('should filter results to only test/spec/__tests__ files', async () => {
      client.findReferences.mockResolvedValue([
        { file: 'src/foo.js', line: 1, context: 'import' },
        { file: 'tests/foo.test.js', line: 5, context: 'test' },
        { file: 'src/__tests__/foo.js', line: 10, context: 'test' },
        { file: 'src/foo.spec.js', line: 15, context: 'spec' },
        { file: 'src/bar.js', line: 20, context: 'usage' },
      ]);

      const result = await enricher.findTests('foo');

      expect(result).toHaveLength(3);
      expect(result.map((r) => r.file)).toEqual([
        'tests/foo.test.js',
        'src/__tests__/foo.js',
        'src/foo.spec.js',
      ]);
    });

    it('should return null when findReferences returns null', async () => {
      client.findReferences.mockResolvedValue(null);

      const result = await enricher.findTests('MyClass');

      expect(result).toBeNull();
    });

    it('should return empty array when no test files match', async () => {
      client.findReferences.mockResolvedValue([
        { file: 'src/foo.js', line: 1, context: 'code' },
      ]);

      const result = await enricher.findTests('foo');

      expect(result).toEqual([]);
    });

    it('should be case-insensitive for file path matching', async () => {
      client.findReferences.mockResolvedValue([
        { file: 'Tests/FOO.Test.js', line: 1, context: 'test' },
        { file: 'src/__TESTS__/bar.js', line: 2, context: 'test' },
        { file: 'foo.Spec.js', line: 3, context: 'spec' },
      ]);

      const result = await enricher.findTests('foo');

      expect(result).toHaveLength(3);
    });

    it('should handle refs with missing file property', async () => {
      client.findReferences.mockResolvedValue([
        { line: 1, context: 'test' },
        { file: 'tests/a.test.js', line: 2, context: 'test' },
      ]);

      const result = await enricher.findTests('foo');

      // First entry has no file so (ref.file || '') becomes '' which does not match
      expect(result).toHaveLength(1);
      expect(result[0].file).toBe('tests/a.test.js');
    });

    it('should return null on error', async () => {
      client.findReferences.mockRejectedValue(new Error('fail'));

      const result = await enricher.findTests('MyClass');

      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // describeProject
  // ---------------------------------------------------------------------------
  describe('describeProject', () => {
    it('should default path to "." when not provided', async () => {
      await enricher.describeProject();

      expect(client.analyzeCodebase).toHaveBeenCalledWith('.');
      expect(client.getProjectStats).toHaveBeenCalledTimes(1);
    });

    it('should pass custom path to analyzeCodebase', async () => {
      await enricher.describeProject('packages/core');

      expect(client.analyzeCodebase).toHaveBeenCalledWith('packages/core');
    });

    it('should return codebase and stats', async () => {
      const codebase = { languages: ['js', 'ts'] };
      const stats = { files: 200 };
      client.analyzeCodebase.mockResolvedValue(codebase);
      client.getProjectStats.mockResolvedValue(stats);

      const result = await enricher.describeProject('src/');

      expect(result).toEqual({ codebase, stats });
    });

    it('should return null when both codebase and stats are null', async () => {
      client.analyzeCodebase.mockResolvedValue(null);
      client.getProjectStats.mockResolvedValue(null);

      const result = await enricher.describeProject();

      expect(result).toBeNull();
    });

    it('should fallback to empty object when codebase is null', async () => {
      client.analyzeCodebase.mockResolvedValue(null);
      client.getProjectStats.mockResolvedValue({ lines: 1000 });

      const result = await enricher.describeProject();

      expect(result).toEqual({
        codebase: {},
        stats: { lines: 1000 },
      });
    });

    it('should fallback to empty object when stats is null', async () => {
      client.analyzeCodebase.mockResolvedValue({ languages: ['go'] });
      client.getProjectStats.mockResolvedValue(null);

      const result = await enricher.describeProject();

      expect(result).toEqual({
        codebase: { languages: ['go'] },
        stats: {},
      });
    });

    it('should return null on error', async () => {
      client.analyzeCodebase.mockRejectedValue(new Error('timeout'));

      const result = await enricher.describeProject();

      expect(result).toBeNull();
    });
  });
});
