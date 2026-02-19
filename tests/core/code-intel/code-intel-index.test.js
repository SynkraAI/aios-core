'use strict';

/**
 * Tests for code-intel/index.js module
 *
 * Test Coverage:
 * - getClient() singleton behavior
 * - getEnricher() singleton wrapping getClient
 * - isCodeIntelAvailable() delegation and default behavior
 * - enrichWithCodeIntel() enrichment flow, timeout, error handling
 * - _resetForTesting() clears singletons
 * - Re-exports: CodeIntelClient, CodeIntelEnricher, CodeIntelProvider,
 *   CodeGraphProvider, CAPABILITIES, TOOL_MAP
 */

// ---- Mocks (must be before require) ----

const mockClient = {
  isCodeIntelAvailable: jest.fn(() => false),
  _activeProvider: null,
};

jest.mock('../../../.aios-core/core/code-intel/code-intel-client', () => ({
  CodeIntelClient: jest.fn(() => mockClient),
}));

const mockEnricherInstance = {
  _client: null,
  assessImpact: jest.fn(),
  detectDuplicates: jest.fn(),
  findTests: jest.fn(),
  getConventions: jest.fn(),
  describeProject: jest.fn(),
};

jest.mock('../../../.aios-core/core/code-intel/code-intel-enricher', () => ({
  CodeIntelEnricher: jest.fn((client) => {
    mockEnricherInstance._client = client;
    return mockEnricherInstance;
  }),
}));

jest.mock('../../../.aios-core/core/code-intel/providers/provider-interface', () => ({
  CodeIntelProvider: class CodeIntelProvider {},
  CAPABILITIES: ['findDefinition', 'findReferences', 'analyzeComplexity'],
}));

jest.mock('../../../.aios-core/core/code-intel/providers/code-graph-provider', () => ({
  CodeGraphProvider: class CodeGraphProvider {},
  TOOL_MAP: { find_definition: 'findDefinition', find_references: 'findReferences' },
}));

// ---- Require after mocks ----

const {
  getClient,
  getEnricher,
  isCodeIntelAvailable,
  enrichWithCodeIntel,
  _resetForTesting,
  CodeIntelClient,
  CodeIntelEnricher,
  CodeIntelProvider,
  CodeGraphProvider,
  CAPABILITIES,
  TOOL_MAP,
} = require('../../../.aios-core/core/code-intel/index');

// ---- Tests ----

describe('code-intel/index', () => {
  beforeEach(() => {
    _resetForTesting();
    jest.clearAllMocks();
    mockClient.isCodeIntelAvailable.mockReturnValue(false);
  });

  // --------------------------------------------------
  // Re-exports
  // --------------------------------------------------
  describe('re-exports', () => {
    test('exports CodeIntelClient constructor', () => {
      expect(CodeIntelClient).toBeDefined();
      expect(typeof CodeIntelClient).toBe('function');
    });

    test('exports CodeIntelEnricher constructor', () => {
      expect(CodeIntelEnricher).toBeDefined();
      expect(typeof CodeIntelEnricher).toBe('function');
    });

    test('exports CodeIntelProvider class', () => {
      expect(CodeIntelProvider).toBeDefined();
      expect(typeof CodeIntelProvider).toBe('function');
    });

    test('exports CodeGraphProvider class', () => {
      expect(CodeGraphProvider).toBeDefined();
      expect(typeof CodeGraphProvider).toBe('function');
    });

    test('exports CAPABILITIES array', () => {
      expect(Array.isArray(CAPABILITIES)).toBe(true);
      expect(CAPABILITIES).toContain('findDefinition');
    });

    test('exports TOOL_MAP object', () => {
      expect(typeof TOOL_MAP).toBe('object');
      expect(TOOL_MAP.find_definition).toBe('findDefinition');
    });
  });

  // --------------------------------------------------
  // getClient
  // --------------------------------------------------
  describe('getClient()', () => {
    test('creates a CodeIntelClient on first call', () => {
      const client = getClient({ root: '/project' });
      expect(CodeIntelClient).toHaveBeenCalledTimes(1);
      expect(CodeIntelClient).toHaveBeenCalledWith({ root: '/project' });
      expect(client).toBe(mockClient);
    });

    test('returns the same singleton on subsequent calls', () => {
      const first = getClient({ root: '/a' });
      const second = getClient({ root: '/b' });
      expect(first).toBe(second);
      expect(CodeIntelClient).toHaveBeenCalledTimes(1);
    });

    test('creates new instance after _resetForTesting', () => {
      getClient();
      _resetForTesting();
      getClient();
      expect(CodeIntelClient).toHaveBeenCalledTimes(2);
    });
  });

  // --------------------------------------------------
  // getEnricher
  // --------------------------------------------------
  describe('getEnricher()', () => {
    test('creates an enricher wrapping getClient on first call', () => {
      const enricher = getEnricher({ root: '/project' });
      expect(CodeIntelEnricher).toHaveBeenCalledTimes(1);
      expect(CodeIntelEnricher).toHaveBeenCalledWith(mockClient);
      expect(enricher._client).toBe(mockClient);
    });

    test('returns the same singleton on subsequent calls', () => {
      const first = getEnricher();
      const second = getEnricher();
      expect(first).toBe(second);
      expect(CodeIntelEnricher).toHaveBeenCalledTimes(1);
    });

    test('also initializes the client singleton', () => {
      getEnricher({ root: '/x' });
      expect(CodeIntelClient).toHaveBeenCalledTimes(1);
      expect(CodeIntelClient).toHaveBeenCalledWith({ root: '/x' });
    });

    test('creates new instance after _resetForTesting', () => {
      getEnricher();
      _resetForTesting();
      getEnricher();
      expect(CodeIntelEnricher).toHaveBeenCalledTimes(2);
    });
  });

  // --------------------------------------------------
  // isCodeIntelAvailable
  // --------------------------------------------------
  describe('isCodeIntelAvailable()', () => {
    test('returns false when no client has been created', () => {
      expect(isCodeIntelAvailable()).toBe(false);
    });

    test('delegates to client.isCodeIntelAvailable when client exists', () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      expect(isCodeIntelAvailable()).toBe(true);
      expect(mockClient.isCodeIntelAvailable).toHaveBeenCalled();
    });

    test('returns false when client says unavailable', () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(false);
      getClient();
      expect(isCodeIntelAvailable()).toBe(false);
    });
  });

  // --------------------------------------------------
  // enrichWithCodeIntel
  // --------------------------------------------------
  describe('enrichWithCodeIntel()', () => {
    const baseResult = { summary: 'test result', score: 42 };

    test('returns baseResult unchanged when code intel is not available', async () => {
      const result = await enrichWithCodeIntel(baseResult);
      expect(result).toBe(baseResult);
    });

    test('returns enriched result with _codeIntel when available', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();

      mockEnricherInstance.assessImpact.mockResolvedValue({ blastRadius: 3 });

      const result = await enrichWithCodeIntel(baseResult, {
        capabilities: ['assessImpact'],
        files: ['src/index.js'],
      });

      expect(result).toEqual({
        ...baseResult,
        _codeIntel: { assessImpact: { blastRadius: 3 } },
      });
    });

    test('passes correct arguments to assessImpact', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      mockEnricherInstance.assessImpact.mockResolvedValue(null);

      await enrichWithCodeIntel(baseResult, {
        capabilities: ['assessImpact'],
        files: ['a.js', 'b.js'],
      });

      expect(mockEnricherInstance.assessImpact).toHaveBeenCalledWith(['a.js', 'b.js']);
    });

    test('passes correct arguments to detectDuplicates', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      mockEnricherInstance.detectDuplicates.mockResolvedValue([]);

      await enrichWithCodeIntel(baseResult, {
        capabilities: ['detectDuplicates'],
        description: 'Add login feature',
      });

      expect(mockEnricherInstance.detectDuplicates).toHaveBeenCalledWith(
        'Add login feature',
        expect.objectContaining({ description: 'Add login feature' }),
      );
    });

    test('passes correct arguments to findTests', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      mockEnricherInstance.findTests.mockResolvedValue([]);

      await enrichWithCodeIntel(baseResult, {
        capabilities: ['findTests'],
        symbol: 'MyClass',
      });

      expect(mockEnricherInstance.findTests).toHaveBeenCalledWith('MyClass');
    });

    test('passes correct arguments to getConventions', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      mockEnricherInstance.getConventions.mockResolvedValue({});

      await enrichWithCodeIntel(baseResult, {
        capabilities: ['getConventions'],
        target: 'src/',
      });

      expect(mockEnricherInstance.getConventions).toHaveBeenCalledWith('src/');
    });

    test('passes correct arguments to describeProject', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      mockEnricherInstance.describeProject.mockResolvedValue({});

      await enrichWithCodeIntel(baseResult, {
        capabilities: ['describeProject'],
        target: 'packages/core',
      });

      expect(mockEnricherInstance.describeProject).toHaveBeenCalledWith('packages/core');
    });

    test('defaults target to "." when not provided for getConventions', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      mockEnricherInstance.getConventions.mockResolvedValue({});

      await enrichWithCodeIntel(baseResult, {
        capabilities: ['getConventions'],
      });

      expect(mockEnricherInstance.getConventions).toHaveBeenCalledWith('.');
    });

    test('defaults files to empty array when not provided for assessImpact', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      mockEnricherInstance.assessImpact.mockResolvedValue(null);

      await enrichWithCodeIntel(baseResult, {
        capabilities: ['assessImpact'],
      });

      expect(mockEnricherInstance.assessImpact).toHaveBeenCalledWith([]);
    });

    test('defaults description to empty string for detectDuplicates', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      mockEnricherInstance.detectDuplicates.mockResolvedValue([]);

      await enrichWithCodeIntel(baseResult, {
        capabilities: ['detectDuplicates'],
      });

      expect(mockEnricherInstance.detectDuplicates).toHaveBeenCalledWith(
        '',
        expect.objectContaining({ capabilities: ['detectDuplicates'] }),
      );
    });

    test('defaults symbol to empty string for findTests', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      mockEnricherInstance.findTests.mockResolvedValue([]);

      await enrichWithCodeIntel(baseResult, {
        capabilities: ['findTests'],
      });

      expect(mockEnricherInstance.findTests).toHaveBeenCalledWith('');
    });

    test('handles multiple capabilities in a single call', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();

      mockEnricherInstance.assessImpact.mockResolvedValue({ blastRadius: 1 });
      mockEnricherInstance.findTests.mockResolvedValue(['test.js']);

      const result = await enrichWithCodeIntel(baseResult, {
        capabilities: ['assessImpact', 'findTests'],
        files: ['src/a.js'],
        symbol: 'Foo',
      });

      expect(result._codeIntel.assessImpact).toEqual({ blastRadius: 1 });
      expect(result._codeIntel.findTests).toEqual(['test.js']);
    });

    test('skips unknown capabilities gracefully', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();

      const result = await enrichWithCodeIntel(baseResult, {
        capabilities: ['nonExistentCapability'],
      });

      expect(result).toEqual({ ...baseResult, _codeIntel: {} });
    });

    test('handles empty capabilities array', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();

      const result = await enrichWithCodeIntel(baseResult, {
        capabilities: [],
      });

      expect(result).toEqual({ ...baseResult, _codeIntel: {} });
    });

    test('respects custom timeout and rejects slow capabilities', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();

      mockEnricherInstance.assessImpact.mockImplementation(
        () => new Promise(() => {}),
      );

      const start = Date.now();
      const result = await enrichWithCodeIntel(baseResult, {
        capabilities: ['assessImpact'],
        files: ['a.js'],
        timeout: 50,
      });
      const elapsed = Date.now() - start;

      expect(result._codeIntel.assessImpact).toBeUndefined();
      expect(elapsed).toBeGreaterThanOrEqual(40);
      expect(elapsed).toBeLessThan(3000);
    });

    test('successful capability resolves before timeout', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();

      mockEnricherInstance.assessImpact.mockResolvedValue({ blastRadius: 5 });

      const result = await enrichWithCodeIntel(baseResult, {
        capabilities: ['assessImpact'],
        files: ['a.js'],
        timeout: 5000,
      });

      expect(result._codeIntel.assessImpact).toEqual({ blastRadius: 5 });
    });

    test('handles capability rejection gracefully via allSettled', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();

      mockEnricherInstance.assessImpact.mockRejectedValue(new Error('provider down'));
      mockEnricherInstance.findTests.mockResolvedValue(['test.js']);

      const result = await enrichWithCodeIntel(baseResult, {
        capabilities: ['assessImpact', 'findTests'],
        files: ['x.js'],
        symbol: 'Fn',
      });

      expect(result._codeIntel.assessImpact).toBeUndefined();
      expect(result._codeIntel.findTests).toEqual(['test.js']);
    });

    test('returns baseResult when options default to empty object', async () => {
      const result = await enrichWithCodeIntel(baseResult);
      expect(result).toBe(baseResult);
    });

    test('does not modify the original baseResult object', async () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      mockEnricherInstance.assessImpact.mockResolvedValue({ blastRadius: 1 });

      const original = { data: 'important' };
      const result = await enrichWithCodeIntel(original, {
        capabilities: ['assessImpact'],
        files: ['f.js'],
      });

      expect(original).toEqual({ data: 'important' });
      expect(original._codeIntel).toBeUndefined();
      expect(result._codeIntel).toBeDefined();
    });
  });

  // --------------------------------------------------
  // _resetForTesting
  // --------------------------------------------------
  describe('_resetForTesting()', () => {
    test('clears client singleton', () => {
      getClient();
      expect(CodeIntelClient).toHaveBeenCalledTimes(1);
      _resetForTesting();
      getClient();
      expect(CodeIntelClient).toHaveBeenCalledTimes(2);
    });

    test('clears enricher singleton', () => {
      getEnricher();
      expect(CodeIntelEnricher).toHaveBeenCalledTimes(1);
      _resetForTesting();
      getEnricher();
      expect(CodeIntelEnricher).toHaveBeenCalledTimes(2);
    });

    test('isCodeIntelAvailable returns false after reset', () => {
      mockClient.isCodeIntelAvailable.mockReturnValue(true);
      getClient();
      expect(isCodeIntelAvailable()).toBe(true);
      _resetForTesting();
      expect(isCodeIntelAvailable()).toBe(false);
    });
  });
});
