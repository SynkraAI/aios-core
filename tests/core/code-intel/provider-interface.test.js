'use strict';

/**
 * Tests for code-intel/providers/provider-interface.js module
 *
 * Test Coverage:
 * - CAPABILITIES array: correct length and exact members
 * - CodeIntelProvider constructor: name, options, default options
 * - Abstract methods: all 8 return null by default (async)
 * - Subclass extensibility: overriding methods works correctly
 */

const {
  CodeIntelProvider,
  CAPABILITIES,
} = require('../../../.aios-core/core/code-intel/providers/provider-interface');

// ---------------------------------------------------------------------------
// CAPABILITIES
// ---------------------------------------------------------------------------

describe('CAPABILITIES', () => {
  it('should be an array', () => {
    expect(Array.isArray(CAPABILITIES)).toBe(true);
  });

  it('should contain exactly 8 items', () => {
    expect(CAPABILITIES).toHaveLength(8);
  });

  it.each([
    'findDefinition',
    'findReferences',
    'findCallers',
    'findCallees',
    'analyzeDependencies',
    'analyzeComplexity',
    'analyzeCodebase',
    'getProjectStats',
  ])('should include "%s"', (cap) => {
    expect(CAPABILITIES).toContain(cap);
  });

  it('should contain only the expected capabilities in order', () => {
    expect(CAPABILITIES).toEqual([
      'findDefinition',
      'findReferences',
      'findCallers',
      'findCallees',
      'analyzeDependencies',
      'analyzeComplexity',
      'analyzeCodebase',
      'getProjectStats',
    ]);
  });

  it('should not contain duplicates', () => {
    const unique = new Set(CAPABILITIES);
    expect(unique.size).toBe(CAPABILITIES.length);
  });
});

// ---------------------------------------------------------------------------
// CodeIntelProvider - constructor
// ---------------------------------------------------------------------------

describe('CodeIntelProvider', () => {
  describe('constructor', () => {
    it('should store the provider name', () => {
      const provider = new CodeIntelProvider('test-provider');
      expect(provider.name).toBe('test-provider');
    });

    it('should store custom options', () => {
      const opts = { rootDir: '/tmp', timeout: 5000 };
      const provider = new CodeIntelProvider('custom', opts);
      expect(provider.options).toEqual(opts);
    });

    it('should default options to an empty object when omitted', () => {
      const provider = new CodeIntelProvider('defaults');
      expect(provider.options).toEqual({});
    });

    it('should default options to an empty object when undefined', () => {
      const provider = new CodeIntelProvider('defaults', undefined);
      expect(provider.options).toEqual({});
    });
  });

  // -------------------------------------------------------------------------
  // Abstract methods - default null return
  // -------------------------------------------------------------------------

  describe('abstract methods (default implementations)', () => {
    let provider;

    beforeEach(() => {
      provider = new CodeIntelProvider('base');
    });

    it.each([
      ['findDefinition', ['myFunc', {}]],
      ['findReferences', ['myVar', {}]],
      ['findCallers', ['handleClick', {}]],
      ['findCallees', ['processData', {}]],
      ['analyzeDependencies', ['/src/index.js', {}]],
      ['analyzeComplexity', ['/src/utils.js', {}]],
      ['analyzeCodebase', ['/src', {}]],
      ['getProjectStats', [{}]],
    ])('%s() should return null', async (method, args) => {
      const result = await provider[method](...args);
      expect(result).toBeNull();
    });

    it.each([
      'findDefinition',
      'findReferences',
      'findCallers',
      'findCallees',
      'analyzeDependencies',
      'analyzeComplexity',
      'analyzeCodebase',
      'getProjectStats',
    ])('%s() should return a Promise', (method) => {
      const result = provider[method]();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return null even when called with no arguments', async () => {
      expect(await provider.findDefinition()).toBeNull();
      expect(await provider.findReferences()).toBeNull();
      expect(await provider.findCallers()).toBeNull();
      expect(await provider.findCallees()).toBeNull();
      expect(await provider.analyzeDependencies()).toBeNull();
      expect(await provider.analyzeComplexity()).toBeNull();
      expect(await provider.analyzeCodebase()).toBeNull();
      expect(await provider.getProjectStats()).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Every CAPABILITY has a matching method
  // -------------------------------------------------------------------------

  describe('CAPABILITIES <-> methods alignment', () => {
    it('every capability should have a corresponding method on the prototype', () => {
      for (const cap of CAPABILITIES) {
        expect(typeof CodeIntelProvider.prototype[cap]).toBe('function');
      }
    });
  });

  // -------------------------------------------------------------------------
  // Subclass extensibility
  // -------------------------------------------------------------------------

  describe('subclass extensibility', () => {
    class MockProvider extends CodeIntelProvider {
      async findDefinition(symbol) {
        return { file: 'mock.js', line: 42, column: 0, context: symbol };
      }

      async getProjectStats() {
        return { files: 10, lines: 500, languages: { javascript: 500 } };
      }
    }

    let mock;

    beforeEach(() => {
      mock = new MockProvider('mock-provider', { rootDir: '/mock' });
    });

    it('should inherit name and options', () => {
      expect(mock.name).toBe('mock-provider');
      expect(mock.options).toEqual({ rootDir: '/mock' });
    });

    it('should be an instance of CodeIntelProvider', () => {
      expect(mock).toBeInstanceOf(CodeIntelProvider);
    });

    it('should override findDefinition', async () => {
      const result = await mock.findDefinition('hello');
      expect(result).toEqual({
        file: 'mock.js',
        line: 42,
        column: 0,
        context: 'hello',
      });
    });

    it('should override getProjectStats', async () => {
      const result = await mock.getProjectStats();
      expect(result).toEqual({
        files: 10,
        lines: 500,
        languages: { javascript: 500 },
      });
    });

    it('should still return null for non-overridden methods', async () => {
      expect(await mock.findReferences('x')).toBeNull();
      expect(await mock.findCallers('x')).toBeNull();
      expect(await mock.findCallees('x')).toBeNull();
      expect(await mock.analyzeDependencies('/src')).toBeNull();
      expect(await mock.analyzeComplexity('/src')).toBeNull();
      expect(await mock.analyzeCodebase('/src')).toBeNull();
    });
  });
});
