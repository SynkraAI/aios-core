/**
 * Dev Helper Tests
 *
 * Unit tests for the dev-helper code intelligence helper module.
 * Covers constants, risk calculation, suggestion formatting,
 * and all async functions with mocked code-intel dependencies.
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const mockClient = {
  findDefinition: jest.fn(),
  findReferences: jest.fn(),
};

const mockEnricher = {
  detectDuplicates: jest.fn(),
  getConventions: jest.fn(),
  assessImpact: jest.fn(),
};

jest.mock('../../../.aios-core/core/code-intel/index', () => ({
  isCodeIntelAvailable: jest.fn(() => false),
  getClient: jest.fn(() => mockClient),
  getEnricher: jest.fn(() => mockEnricher),
}));

const {
  isCodeIntelAvailable,
} = require('../../../.aios-core/core/code-intel/index');

const {
  checkBeforeWriting,
  suggestReuse,
  getConventionsForPath,
  assessRefactoringImpact,
  _formatSuggestion,
  _calculateRiskLevel,
  RISK_THRESHOLDS,
  REUSE_MIN_REFS,
} = require('../../../.aios-core/core/code-intel/helpers/dev-helper');

describe('Dev Helper Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isCodeIntelAvailable.mockReturnValue(false);
  });

  // --- Constants ---

  describe('Constants', () => {
    it('should export RISK_THRESHOLDS with correct values', () => {
      expect(RISK_THRESHOLDS).toBeDefined();
      expect(RISK_THRESHOLDS.LOW_MAX).toBe(4);
      expect(RISK_THRESHOLDS.MEDIUM_MAX).toBe(15);
    });

    it('should export REUSE_MIN_REFS as 2', () => {
      expect(REUSE_MIN_REFS).toBe(2);
    });
  });

  // --- _calculateRiskLevel ---

  describe('_calculateRiskLevel', () => {
    it('should return LOW for blastRadius 0', () => {
      expect(_calculateRiskLevel(0)).toBe('LOW');
    });

    it('should return LOW for blastRadius at LOW_MAX boundary (4)', () => {
      expect(_calculateRiskLevel(4)).toBe('LOW');
    });

    it('should return MEDIUM for blastRadius just above LOW_MAX (5)', () => {
      expect(_calculateRiskLevel(5)).toBe('MEDIUM');
    });

    it('should return MEDIUM for blastRadius at MEDIUM_MAX boundary (15)', () => {
      expect(_calculateRiskLevel(15)).toBe('MEDIUM');
    });

    it('should return HIGH for blastRadius just above MEDIUM_MAX (16)', () => {
      expect(_calculateRiskLevel(16)).toBe('HIGH');
    });

    it('should return HIGH for very large blastRadius', () => {
      expect(_calculateRiskLevel(1000)).toBe('HIGH');
    });

    it('should return LOW for negative blastRadius', () => {
      expect(_calculateRiskLevel(-1)).toBe('LOW');
    });
  });

  // --- _formatSuggestion ---

  describe('_formatSuggestion', () => {
    it('should include IDS Article IV-A note in all cases', () => {
      const result = _formatSuggestion(null, null);
      expect(result).toContain('IDS Article IV-A');
    });

    it('should format suggestion with duplicate matches only', () => {
      const dupes = {
        matches: [
          { file: 'src/utils/helper.js', line: 42 },
        ],
      };
      const result = _formatSuggestion(dupes, null);
      expect(result).toContain('Found 1 similar match(es)');
      expect(result).toContain('Closest: src/utils/helper.js:42');
      expect(result).toContain('IDS Article IV-A');
    });

    it('should format suggestion with name references only', () => {
      const nameRefs = [
        { file: 'src/index.js', line: 10 },
      ];
      const result = _formatSuggestion(null, nameRefs);
      expect(result).toContain('Symbol already referenced in 1 location(s)');
      expect(result).toContain('First ref: src/index.js:10');
    });

    it('should format suggestion with both dupes and refs', () => {
      const dupes = {
        matches: [
          { file: 'src/a.js', line: 1 },
          { file: 'src/b.js', line: 2 },
        ],
      };
      const nameRefs = [
        { file: 'src/c.js', line: 3 },
        { file: 'src/d.js', line: 4 },
        { file: 'src/e.js', line: 5 },
      ];
      const result = _formatSuggestion(dupes, nameRefs);
      expect(result).toContain('Found 2 similar match(es)');
      expect(result).toContain('Closest: src/a.js:1');
      expect(result).toContain('Symbol already referenced in 3 location(s)');
      expect(result).toContain('First ref: src/c.js:3');
    });

    it('should handle match without line number', () => {
      const dupes = {
        matches: [{ file: 'src/utils.js' }],
      };
      const result = _formatSuggestion(dupes, null);
      expect(result).toContain('Closest: src/utils.js');
      // Should NOT have a trailing colon without line number
      expect(result).not.toMatch(/Closest: src\/utils\.js:/);
    });

    it('should handle ref without line number', () => {
      const nameRefs = [{ file: 'src/index.js' }];
      const result = _formatSuggestion(null, nameRefs);
      expect(result).toContain('First ref: src/index.js');
      expect(result).not.toMatch(/First ref: src\/index\.js:/);
    });

    it('should handle empty matches array in dupes', () => {
      const dupes = { matches: [] };
      const result = _formatSuggestion(dupes, null);
      expect(result).not.toContain('similar match');
      expect(result).toContain('IDS Article IV-A');
    });

    it('should handle empty refs array', () => {
      const result = _formatSuggestion(null, []);
      expect(result).not.toContain('Symbol already referenced');
      expect(result).toContain('IDS Article IV-A');
    });

    it('should end with a period', () => {
      const result = _formatSuggestion(null, null);
      expect(result.endsWith('.')).toBe(true);
    });
  });

  // --- checkBeforeWriting ---

  describe('checkBeforeWriting', () => {
    it('should return null when code intel is not available', async () => {
      isCodeIntelAvailable.mockReturnValue(false);
      const result = await checkBeforeWriting('test.js', 'a helper');
      expect(result).toBeNull();
    });

    it('should return null when no duplicates and no references found', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.detectDuplicates.mockResolvedValue({ matches: [] });
      mockClient.findReferences.mockResolvedValue([]);

      const result = await checkBeforeWriting('test.js', 'a helper');
      expect(result).toBeNull();
    });

    it('should return null when dupes is null and refs is empty', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.detectDuplicates.mockResolvedValue(null);
      mockClient.findReferences.mockResolvedValue([]);

      const result = await checkBeforeWriting('test.js', 'a helper');
      expect(result).toBeNull();
    });

    it('should return result when duplicates are found', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      const dupes = {
        matches: [{ file: 'src/helper.js', line: 10 }],
      };
      mockEnricher.detectDuplicates.mockResolvedValue(dupes);
      mockClient.findReferences.mockResolvedValue([]);

      const result = await checkBeforeWriting('myHelper', 'a helper function');

      expect(result).not.toBeNull();
      expect(result.duplicates).toEqual(dupes);
      expect(result.references).toEqual([]);
      expect(result.suggestion).toContain('similar match');
    });

    it('should return result when references are found', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.detectDuplicates.mockResolvedValue({ matches: [] });
      const refs = [{ file: 'src/index.js', line: 5 }];
      mockClient.findReferences.mockResolvedValue(refs);

      const result = await checkBeforeWriting('myHelper', 'a helper');

      expect(result).not.toBeNull();
      expect(result.references).toEqual(refs);
      expect(result.suggestion).toContain('Symbol already referenced');
    });

    it('should call detectDuplicates with description and path option', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.detectDuplicates.mockResolvedValue({ matches: [] });
      mockClient.findReferences.mockResolvedValue([]);

      await checkBeforeWriting('test.js', 'some description');

      expect(mockEnricher.detectDuplicates).toHaveBeenCalledWith(
        'some description',
        { path: '.' },
      );
    });

    it('should call findReferences with the fileName', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.detectDuplicates.mockResolvedValue({ matches: [] });
      mockClient.findReferences.mockResolvedValue([]);

      await checkBeforeWriting('myModule', 'a module');

      expect(mockClient.findReferences).toHaveBeenCalledWith('myModule');
    });

    it('should return null when enricher throws', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.detectDuplicates.mockRejectedValue(new Error('provider error'));

      const result = await checkBeforeWriting('test.js', 'desc');
      expect(result).toBeNull();
    });

    it('should handle null nameRefs by defaulting references to empty array', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      const dupes = {
        matches: [{ file: 'src/a.js', line: 1 }],
      };
      mockEnricher.detectDuplicates.mockResolvedValue(dupes);
      mockClient.findReferences.mockResolvedValue(null);

      const result = await checkBeforeWriting('test.js', 'desc');

      expect(result).not.toBeNull();
      expect(result.references).toEqual([]);
    });
  });

  // --- suggestReuse ---

  describe('suggestReuse', () => {
    it('should return null when code intel is not available', async () => {
      isCodeIntelAvailable.mockReturnValue(false);
      const result = await suggestReuse('someSymbol');
      expect(result).toBeNull();
    });

    it('should return null when no definition and no refs', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockClient.findDefinition.mockResolvedValue(null);
      mockClient.findReferences.mockResolvedValue([]);

      const result = await suggestReuse('unknownSymbol');
      expect(result).toBeNull();
    });

    it('should return null when definition is null and refs is null', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockClient.findDefinition.mockResolvedValue(null);
      mockClient.findReferences.mockResolvedValue(null);

      const result = await suggestReuse('unknownSymbol');
      expect(result).toBeNull();
    });

    it('should suggest REUSE when refs exceed REUSE_MIN_REFS', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      const def = { file: 'src/utils.js', line: 10 };
      const refs = [
        { file: 'src/a.js', line: 1 },
        { file: 'src/b.js', line: 2 },
        { file: 'src/c.js', line: 3 },
      ];
      mockClient.findDefinition.mockResolvedValue(def);
      mockClient.findReferences.mockResolvedValue(refs);

      const result = await suggestReuse('myUtil');

      expect(result).toEqual({
        file: 'src/utils.js',
        line: 10,
        references: 3,
        suggestion: 'REUSE',
      });
    });

    it('should suggest ADAPT when refs equal REUSE_MIN_REFS', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      const def = { file: 'src/utils.js', line: 10 };
      const refs = [
        { file: 'src/a.js', line: 1 },
        { file: 'src/b.js', line: 2 },
      ];
      mockClient.findDefinition.mockResolvedValue(def);
      mockClient.findReferences.mockResolvedValue(refs);

      const result = await suggestReuse('myUtil');

      expect(result.suggestion).toBe('ADAPT');
      expect(result.references).toBe(2);
    });

    it('should suggest ADAPT when refs less than REUSE_MIN_REFS', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      const def = { file: 'src/utils.js', line: 5 };
      mockClient.findDefinition.mockResolvedValue(def);
      mockClient.findReferences.mockResolvedValue([{ file: 'src/a.js', line: 1 }]);

      const result = await suggestReuse('myUtil');

      expect(result.suggestion).toBe('ADAPT');
      expect(result.references).toBe(1);
    });

    it('should use first ref file/line when definition is null', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockClient.findDefinition.mockResolvedValue(null);
      const refs = [
        { file: 'src/ref.js', line: 20 },
        { file: 'src/other.js', line: 30 },
        { file: 'src/more.js', line: 40 },
      ];
      mockClient.findReferences.mockResolvedValue(refs);

      const result = await suggestReuse('mySymbol');

      expect(result.file).toBe('src/ref.js');
      expect(result.line).toBe(20);
      expect(result.suggestion).toBe('REUSE');
    });

    it('should call findDefinition and findReferences with the symbol', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockClient.findDefinition.mockResolvedValue(null);
      mockClient.findReferences.mockResolvedValue([]);

      await suggestReuse('targetSymbol');

      expect(mockClient.findDefinition).toHaveBeenCalledWith('targetSymbol');
      expect(mockClient.findReferences).toHaveBeenCalledWith('targetSymbol');
    });

    it('should return null when client throws', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockClient.findDefinition.mockRejectedValue(new Error('crash'));
      mockClient.findReferences.mockRejectedValue(new Error('crash'));

      const result = await suggestReuse('symbol');
      expect(result).toBeNull();
    });

    it('should handle null refs by counting 0 references', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      const def = { file: 'src/found.js', line: 1 };
      mockClient.findDefinition.mockResolvedValue(def);
      mockClient.findReferences.mockResolvedValue(null);

      const result = await suggestReuse('mySymbol');

      expect(result.references).toBe(0);
      expect(result.suggestion).toBe('ADAPT');
    });
  });

  // --- getConventionsForPath ---

  describe('getConventionsForPath', () => {
    it('should return null when code intel is not available', async () => {
      isCodeIntelAvailable.mockReturnValue(false);
      const result = await getConventionsForPath('src/components');
      expect(result).toBeNull();
    });

    it('should delegate to enricher.getConventions', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      const conventions = {
        patterns: [{ name: 'camelCase', count: 42 }],
        stats: { total: 100 },
      };
      mockEnricher.getConventions.mockResolvedValue(conventions);

      const result = await getConventionsForPath('src/components');

      expect(mockEnricher.getConventions).toHaveBeenCalledWith('src/components');
      expect(result).toEqual(conventions);
    });

    it('should return null when enricher throws', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.getConventions.mockRejectedValue(new Error('fail'));

      const result = await getConventionsForPath('src');
      expect(result).toBeNull();
    });
  });

  // --- assessRefactoringImpact ---

  describe('assessRefactoringImpact', () => {
    it('should return null when code intel is not available', async () => {
      isCodeIntelAvailable.mockReturnValue(false);
      const result = await assessRefactoringImpact(['src/a.js']);
      expect(result).toBeNull();
    });

    it('should return null when enricher.assessImpact returns null', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.assessImpact.mockResolvedValue(null);

      const result = await assessRefactoringImpact(['src/a.js']);
      expect(result).toBeNull();
    });

    it('should return impact with LOW risk level', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.assessImpact.mockResolvedValue({
        blastRadius: 3,
        references: [{ file: 'src/a.js' }],
        complexity: { cyclomatic: 5 },
      });

      const result = await assessRefactoringImpact(['src/a.js']);

      expect(result).toEqual({
        blastRadius: 3,
        riskLevel: 'LOW',
        references: [{ file: 'src/a.js' }],
        complexity: { cyclomatic: 5 },
      });
    });

    it('should return impact with MEDIUM risk level', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.assessImpact.mockResolvedValue({
        blastRadius: 10,
        references: [],
        complexity: { cyclomatic: 12 },
      });

      const result = await assessRefactoringImpact(['src/b.js']);

      expect(result.riskLevel).toBe('MEDIUM');
      expect(result.blastRadius).toBe(10);
    });

    it('should return impact with HIGH risk level', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.assessImpact.mockResolvedValue({
        blastRadius: 50,
        references: [],
        complexity: { cyclomatic: 30 },
      });

      const result = await assessRefactoringImpact(['src/core.js']);

      expect(result.riskLevel).toBe('HIGH');
      expect(result.blastRadius).toBe(50);
    });

    it('should call enricher.assessImpact with the files array', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.assessImpact.mockResolvedValue(null);

      const files = ['src/a.js', 'src/b.js', 'src/c.js'];
      await assessRefactoringImpact(files);

      expect(mockEnricher.assessImpact).toHaveBeenCalledWith(files);
    });

    it('should return null when enricher throws', async () => {
      isCodeIntelAvailable.mockReturnValue(true);
      mockEnricher.assessImpact.mockRejectedValue(new Error('timeout'));

      const result = await assessRefactoringImpact(['src/a.js']);
      expect(result).toBeNull();
    });

    it('should correctly map blastRadius at boundary values', async () => {
      isCodeIntelAvailable.mockReturnValue(true);

      // Boundary: 4 -> LOW
      mockEnricher.assessImpact.mockResolvedValue({
        blastRadius: 4, references: [], complexity: {},
      });
      let result = await assessRefactoringImpact(['f.js']);
      expect(result.riskLevel).toBe('LOW');

      // Boundary: 5 -> MEDIUM
      mockEnricher.assessImpact.mockResolvedValue({
        blastRadius: 5, references: [], complexity: {},
      });
      result = await assessRefactoringImpact(['f.js']);
      expect(result.riskLevel).toBe('MEDIUM');

      // Boundary: 15 -> MEDIUM
      mockEnricher.assessImpact.mockResolvedValue({
        blastRadius: 15, references: [], complexity: {},
      });
      result = await assessRefactoringImpact(['f.js']);
      expect(result.riskLevel).toBe('MEDIUM');

      // Boundary: 16 -> HIGH
      mockEnricher.assessImpact.mockResolvedValue({
        blastRadius: 16, references: [], complexity: {},
      });
      result = await assessRefactoringImpact(['f.js']);
      expect(result.riskLevel).toBe('HIGH');
    });
  });
});
