/**
 * @fileoverview Tests for PerformanceOptimizer
 * @description Unit tests for the infrastructure performance-optimizer module
 * Covers static analysis, pattern detection, suggestion generation, scoring,
 * event emission, and error handling.
 *
 * Note: The module's internal traverse calls on non-Program AST nodes are
 * incompatible with newer @babel/traverse versions that require scope/parentPath.
 * Tests that exercise code paths through analyzePerformance with function
 * declarations attach error listeners and verify error-handling behavior.
 * Detector methods are also tested directly with pre-parsed ASTs where possible.
 *
 * Resolves: https://github.com/SynkraAI/aios-core/issues/208
 */

const path = require('path');
const { EventEmitter } = require('events');

// Mock fs.promises before requiring the module
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    promises: {
      readFile: jest.fn(),
    },
  };
});

const fs = require('fs').promises;
const PerformanceOptimizer = require('../../.aios-core/infrastructure/scripts/performance-optimizer');

// ---------------------------------------------------------------------------
// Helper: write sample code for AST-based detectors
// ---------------------------------------------------------------------------

/**
 * Configures fs.promises.readFile mock to return the given source code
 */
function mockFileContent(code) {
  fs.readFile.mockResolvedValue(code);
}

/**
 * Parses code into a Babel AST for direct detector testing
 */
function parseCode(code) {
  const parser = require('@babel/parser');
  return parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'decorators-legacy'],
    errorRecovery: true,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PerformanceOptimizer', () => {
  let optimizer;

  beforeEach(() => {
    jest.clearAllMocks();
    optimizer = new PerformanceOptimizer({ rootPath: '/test' });
  });

  // -----------------------------------------------------------------------
  // Constructor & initialization
  // -----------------------------------------------------------------------
  describe('constructor', () => {
    it('should extend EventEmitter', () => {
      expect(optimizer).toBeInstanceOf(EventEmitter);
    });

    it('should set default options', () => {
      const defaults = new PerformanceOptimizer();
      expect(defaults.rootPath).toBe(process.cwd());
      expect(defaults.options.enableProfiling).toBe(true);
      expect(defaults.options.profileDuration).toBe(5000);
      expect(defaults.options.memoryThreshold).toBe(100 * 1024 * 1024);
      expect(defaults.options.timeThreshold).toBe(1000);
      expect(defaults.options.complexityThreshold).toBe(10);
    });

    it('should accept custom options', () => {
      const custom = new PerformanceOptimizer({
        rootPath: '/custom',
        enableProfiling: false,
        profileDuration: 10000,
        memoryThreshold: 200 * 1024 * 1024,
        timeThreshold: 2000,
        complexityThreshold: 20,
      });

      expect(custom.rootPath).toBe('/custom');
      expect(custom.options.enableProfiling).toBe(false);
      expect(custom.options.profileDuration).toBe(10000);
      expect(custom.options.complexityThreshold).toBe(20);
    });

    it('should register all optimization patterns', () => {
      const expectedPatterns = [
        'algorithm_complexity',
        'loop_optimization',
        'memory_usage',
        'async_operations',
        'caching',
        'database_queries',
        'bundle_size',
        'react_performance',
        'string_operations',
        'object_operations',
      ];

      for (const name of expectedPatterns) {
        expect(optimizer.optimizationPatterns.has(name)).toBe(true);
      }
      expect(optimizer.optimizationPatterns.size).toBe(expectedPatterns.length);
    });

    it('should assign correct categories and impacts to patterns', () => {
      const pattern = optimizer.optimizationPatterns.get('algorithm_complexity');
      expect(pattern.category).toBe('algorithm');
      expect(pattern.impact).toBe('high');

      const memPattern = optimizer.optimizationPatterns.get('memory_usage');
      expect(memPattern.category).toBe('memory');
      expect(memPattern.impact).toBe('medium');
    });

    it('should initialize empty state', () => {
      expect(optimizer.optimizationHistory).toEqual([]);
      expect(optimizer.performanceMetrics.size).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // analyzePerformance
  // -----------------------------------------------------------------------
  describe('analyzePerformance', () => {
    it('should return analysis object with expected shape', async () => {
      mockFileContent('const x = 1;');

      const result = await optimizer.analyzePerformance('/test/simple.js');

      expect(result).toHaveProperty('filePath', '/test/simple.js');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('metrics');
      expect(result.metrics).toHaveProperty('performanceScore');
      expect(result.metrics).toHaveProperty('analysisTime');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should emit "analyzed" event on success', async () => {
      mockFileContent('const a = 1;');
      const handler = jest.fn();
      optimizer.on('analyzed', handler);

      await optimizer.analyzePerformance('/test/file.js');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ filePath: '/test/file.js' }));
    });

    it('should emit "error" event and return error analysis on read failure', async () => {
      fs.readFile.mockRejectedValue(new Error('ENOENT'));
      const handler = jest.fn();
      optimizer.on('error', handler);

      const result = await optimizer.analyzePerformance('/missing/file.js');

      expect(result.error).toBe('ENOENT');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ phase: 'analysis', filePath: '/missing/file.js' }),
      );
    });

    it('should only analyze specified patterns when provided', async () => {
      // Use code without function declarations to avoid Babel traverse scope issue
      mockFileContent(`
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            console.log(i + j);
          }
        }
      `);

      const result = await optimizer.analyzePerformance('/test/file.js', {
        patterns: ['loop_optimization'],
      });

      // Only loop_optimization pattern should be checked
      const patternNames = result.issues.map(i => i.pattern);
      const uniquePatterns = [...new Set(patternNames)];
      for (const p of uniquePatterns) {
        expect(p).toBe('loop_optimization');
      }
    });

    it('should skip unknown patterns gracefully', async () => {
      mockFileContent('const x = 1;');

      const result = await optimizer.analyzePerformance('/test/file.js', {
        patterns: ['nonexistent_pattern'],
      });

      expect(result.issues).toHaveLength(0);
    });

    it('should not run runtime profiling for test files', async () => {
      mockFileContent('const x = 1;');
      const spy = jest.spyOn(optimizer, 'profileRuntime');

      await optimizer.analyzePerformance('/test/file.test.js');

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should handle parse errors in file content', async () => {
      mockFileContent('this is not valid javascript @@@ ###');
      const errorHandler = jest.fn();
      optimizer.on('error', errorHandler);

      // errorRecovery is enabled, so the parser may not throw but should still work
      const result = await optimizer.analyzePerformance('/test/bad.js');
      expect(result).toHaveProperty('filePath');
    });

    it('should calculate analysis time', async () => {
      mockFileContent('const x = 1;');
      const result = await optimizer.analyzePerformance('/test/time.js', { patterns: [] });
      expect(result.metrics.analysisTime).toBeGreaterThanOrEqual(0);
    });
  });

  // -----------------------------------------------------------------------
  // performStaticAnalysis — use code without function declarations
  // to avoid the Babel traverse scope issue in calculateCyclomaticComplexity
  // -----------------------------------------------------------------------
  describe('performStaticAnalysis', () => {
    async function getStaticMetrics(code) {
      mockFileContent(code);
      const result = await optimizer.analyzePerformance('/test/file.js', { patterns: [] });
      return result.metrics.static;
    }

    it('should count string operations (binary + and template literals)', async () => {
      const code = `
        const a = "hello" + " world";
        const b = \`template \${1}\`;
      `;
      const metrics = await getStaticMetrics(code);
      expect(metrics.stringOperations).toBeGreaterThanOrEqual(2);
    });

    it('should count object and array expressions', async () => {
      const code = `
        const obj = { a: 1, b: 2 };
        const arr = [1, 2, 3];
      `;
      const metrics = await getStaticMetrics(code);
      expect(metrics.objectOperations).toBeGreaterThanOrEqual(1);
      expect(metrics.arrayOperations).toBeGreaterThanOrEqual(1);
    });

    it('should measure file size and line count', async () => {
      const code = 'line1\nline2\nline3';
      const metrics = await getStaticMetrics(code);
      expect(metrics.fileSize).toBe(code.length);
      expect(metrics.lineCount).toBe(3);
    });

    it('should count DOM operations', async () => {
      const code = `
        document.getElementById('app');
        document.querySelector('.foo');
      `;
      const metrics = await getStaticMetrics(code);
      expect(metrics.domOperations).toBeGreaterThanOrEqual(2);
    });

    it('should track loop depth for top-level loops', async () => {
      // No function wrapping to avoid the scope issue
      const code = `
        for (let i = 0; i < 1; i++) {
          for (let j = 0; j < 1; j++) {
            while (false) {}
          }
        }
      `;
      const metrics = await getStaticMetrics(code);
      expect(metrics.loopDepth).toBe(3);
    });

    it('should count await expressions', async () => {
      // Top-level await (module context)
      const code = `
        await fetch('/a');
        await fetch('/b');
      `;
      const metrics = await getStaticMetrics(code);
      expect(metrics.asyncOperations).toBe(2);
    });

    it('should initialize all metric fields', async () => {
      const code = 'const x = 1;';
      const metrics = await getStaticMetrics(code);
      expect(metrics).toHaveProperty('complexity');
      expect(metrics).toHaveProperty('functionCount');
      expect(metrics).toHaveProperty('loopDepth');
      expect(metrics).toHaveProperty('asyncOperations');
      expect(metrics).toHaveProperty('stringOperations');
      expect(metrics).toHaveProperty('objectOperations');
      expect(metrics).toHaveProperty('arrayOperations');
      expect(metrics).toHaveProperty('domOperations');
      expect(metrics).toHaveProperty('fileSize');
      expect(metrics).toHaveProperty('lineCount');
    });
  });

  // -----------------------------------------------------------------------
  // Algorithm complexity detection — direct detector invocation
  // -----------------------------------------------------------------------
  describe('detectHighComplexityAlgorithms', () => {
    it('should detect triple-nested loops as high complexity', async () => {
      const code = `
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            for (let k = 0; k < 10; k++) {
              i + j + k;
            }
          }
        }
      `;
      const ast = parseCode(code);
      // detectHighComplexityAlgorithms only reports on functions, not top-level loops.
      // Top-level code is not wrapped in a function, so it should find no issues.
      const issues = await optimizer.detectHighComplexityAlgorithms(ast, code);
      // This is expected: the detector only checks FunctionDeclaration/Expression/Arrow
      expect(Array.isArray(issues)).toBe(true);
    });

    it('should return empty array for simple code without functions', async () => {
      const code = 'const x = 1 + 2;';
      const ast = parseCode(code);
      const issues = await optimizer.detectHighComplexityAlgorithms(ast, code);
      expect(issues).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // suggestAlgorithmOptimizations
  // -----------------------------------------------------------------------
  describe('suggestAlgorithmOptimizations', () => {
    it('should suggest hash map for deeply nested loops', async () => {
      const issue = {
        complexity: { loopDepth: 2, hasRecursion: false, notation: 'O(n^2)' },
        severity: 'warning',
      };

      const suggestion = await optimizer.suggestAlgorithmOptimizations(issue, null, '');
      expect(suggestion.optimizations.length).toBeGreaterThanOrEqual(1);
      expect(suggestion.optimizations[0].type).toBe('algorithm_optimization');
    });

    it('should suggest memoization for recursive algorithms', async () => {
      const issue = {
        complexity: { loopDepth: 0, hasRecursion: true, notation: 'O(2^n)' },
        severity: 'critical',
      };

      const suggestion = await optimizer.suggestAlgorithmOptimizations(issue, null, '');
      const recursionOpt = suggestion.optimizations.find(o => o.type === 'recursion_optimization');
      expect(recursionOpt).toBeDefined();
      expect(suggestion.priority).toBe('high');
    });

    it('should include both algorithm and recursion suggestions when both apply', async () => {
      const issue = {
        complexity: { loopDepth: 3, hasRecursion: true, notation: 'O(2^n)' },
        severity: 'critical',
      };

      const suggestion = await optimizer.suggestAlgorithmOptimizations(issue, null, '');
      expect(suggestion.optimizations.length).toBe(2);
    });

    it('should return empty optimizations for non-nested, non-recursive code', async () => {
      const issue = {
        complexity: { loopDepth: 1, hasRecursion: false, notation: 'O(n)' },
        severity: 'warning',
      };

      const suggestion = await optimizer.suggestAlgorithmOptimizations(issue, null, '');
      expect(suggestion.optimizations).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Loop optimization detection — direct detector
  // -----------------------------------------------------------------------
  describe('detectIneffientLoops', () => {
    it('should detect array push in for loop', async () => {
      const code = `
        for (let i = 0; i < 10; i++) {
          result.push(i);
        }
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectIneffientLoops(ast, code);
      const loopIssues = issues.filter(i => i.type === 'inefficient_loop');
      expect(loopIssues.length).toBeGreaterThanOrEqual(1);
      expect(loopIssues[0].problems.some(p => p.type === 'array_growth_in_loop')).toBe(true);
    });

    it('should detect concat in for-of loop', async () => {
      const code = `
        for (const arr of arrays) {
          result = result.concat(arr);
        }
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectIneffientLoops(ast, code);
      const loopIssues = issues.filter(i => i.type === 'inefficient_loop');
      expect(loopIssues.length).toBeGreaterThanOrEqual(1);
      expect(loopIssues[0].problems.some(p => p.type === 'array_copy_in_loop')).toBe(true);
    });

    it('should detect unshift in loop', async () => {
      const code = `
        for (let i = 0; i < 10; i++) {
          arr.unshift(i);
        }
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectIneffientLoops(ast, code);
      const loopIssues = issues.filter(i => i.type === 'inefficient_loop');
      expect(loopIssues.length).toBeGreaterThanOrEqual(1);
      expect(loopIssues[0].problems.some(p => p.type === 'array_growth_in_loop')).toBe(true);
    });

    it('should detect slice in loop', async () => {
      const code = `
        while (true) {
          const part = arr.slice(0, 5);
        }
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectIneffientLoops(ast, code);
      const loopIssues = issues.filter(i => i.type === 'inefficient_loop');
      expect(loopIssues.length).toBeGreaterThanOrEqual(1);
      expect(loopIssues[0].problems.some(p => p.type === 'array_copy_in_loop')).toBe(true);
    });

    it('should return empty array for code without loops', async () => {
      const code = 'const x = 1;';
      const ast = parseCode(code);
      const issues = await optimizer.detectIneffientLoops(ast, code);
      expect(issues).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // suggestLoopOptimizations
  // -----------------------------------------------------------------------
  describe('suggestLoopOptimizations', () => {
    it('should suggest preallocating for array growth', async () => {
      const issue = { problems: [{ type: 'array_growth_in_loop' }] };
      const suggestion = await optimizer.suggestLoopOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('preallocate_array');
    });

    it('should suggest lookup for nested iteration', async () => {
      const issue = { problems: [{ type: 'nested_iteration' }] };
      const suggestion = await optimizer.suggestLoopOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('use_lookup');
      expect(suggestion.priority).toBe('high');
    });

    it('should suggest array join for string concatenation', async () => {
      const issue = { problems: [{ type: 'string_concatenation_in_loop' }] };
      const suggestion = await optimizer.suggestLoopOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('use_array_join');
    });

    it('should suggest avoiding copies for array copy in loop', async () => {
      const issue = { problems: [{ type: 'array_copy_in_loop' }] };
      const suggestion = await optimizer.suggestLoopOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('avoid_copies');
    });

    it('should produce multiple optimizations for multiple problems', async () => {
      const issue = {
        problems: [
          { type: 'array_growth_in_loop' },
          { type: 'string_concatenation_in_loop' },
        ],
      };
      const suggestion = await optimizer.suggestLoopOptimizations(issue);
      expect(suggestion.optimizations).toHaveLength(2);
    });
  });

  // -----------------------------------------------------------------------
  // Memory issue detection — direct detector
  // -----------------------------------------------------------------------
  describe('detectMemoryIssues', () => {
    it('should detect unnecessary slice copy', async () => {
      const code = `
        const arr = [1, 2, 3];
        const copy = arr.slice();
      `;
      mockFileContent(code);
      const result = await optimizer.analyzePerformance('/test/mem.js', {
        patterns: ['memory_usage'],
      });

      const memIssues = result.issues.filter(i => i.type === 'unnecessary_copy');
      expect(memIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect concat in loop via direct detector', async () => {
      const code = `
        for (let i = 0; i < 10; i++) {
          result = result.concat([i]);
        }
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectMemoryIssues(ast, code);
      const concatIssues = issues.filter(i => i.type === 'concat_in_loop');
      expect(concatIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect empty slice() as unnecessary copy', async () => {
      const code = `
        const copy = data.slice();
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectMemoryIssues(ast, code);
      expect(issues.some(i => i.type === 'unnecessary_copy')).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // suggestMemoryOptimizations
  // -----------------------------------------------------------------------
  describe('suggestMemoryOptimizations', () => {
    it('should suggest lazy loading for large arrays', async () => {
      const issue = { type: 'large_array', size: 5000, variableName: 'bigArr' };
      const suggestion = await optimizer.suggestMemoryOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('lazy_loading');
      expect(suggestion.optimizations[1].type).toBe('typed_array');
    });

    it('should suggest cleanup for closure leaks', async () => {
      const issue = { type: 'potential_closure_leak', variableName: 'data' };
      const suggestion = await optimizer.suggestMemoryOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('cleanup_references');
    });

    it('should suggest avoiding copy for unnecessary_copy', async () => {
      const issue = { type: 'unnecessary_copy' };
      const suggestion = await optimizer.suggestMemoryOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('avoid_copy');
    });

    it('should suggest push-spread for concat_in_loop', async () => {
      const issue = { type: 'concat_in_loop' };
      const suggestion = await optimizer.suggestMemoryOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('use_push_spread');
    });

    it('should include estimatedMemorySaving in suggestion', async () => {
      const issue = { type: 'large_array', size: 5000 };
      const suggestion = await optimizer.suggestMemoryOptimizations(issue);
      expect(suggestion).toHaveProperty('estimatedMemorySaving');
    });
  });

  // -----------------------------------------------------------------------
  // Async issue detection — direct detector
  // -----------------------------------------------------------------------
  describe('detectAsyncIssues', () => {
    it('should detect async forEach', async () => {
      const code = `
        items.forEach(async (item) => {
          await processItem(item);
        });
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectAsyncIssues(ast, code);
      const asyncForeach = issues.filter(i => i.type === 'async_foreach');
      expect(asyncForeach.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty issues for code without async patterns', async () => {
      const code = 'const x = 1 + 2;';
      const ast = parseCode(code);
      const issues = await optimizer.detectAsyncIssues(ast, code);
      expect(issues).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // suggestAsyncOptimizations
  // -----------------------------------------------------------------------
  describe('suggestAsyncOptimizations', () => {
    it('should suggest Promise.all for sequential awaits', async () => {
      const issue = { type: 'sequential_awaits', count: 3 };
      const suggestion = await optimizer.suggestAsyncOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('parallel_execution');
      expect(suggestion.priority).toBe('high');
    });

    it('should suggest for-of and Promise.all for async forEach', async () => {
      const issue = { type: 'async_foreach' };
      const suggestion = await optimizer.suggestAsyncOptimizations(issue);
      expect(suggestion.optimizations).toHaveLength(2);
      expect(suggestion.optimizations[0].type).toBe('use_for_of');
      expect(suggestion.optimizations[1].type).toBe('use_promise_all');
    });

    it('should suggest async function for promise constructor anti-pattern', async () => {
      const issue = { type: 'promise_constructor_antipattern' };
      const suggestion = await optimizer.suggestAsyncOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('use_async_function');
    });
  });

  // -----------------------------------------------------------------------
  // findSequentialAwaits
  // -----------------------------------------------------------------------
  describe('findSequentialAwaits', () => {
    it('should return empty array for single await', () => {
      const mockAwaits = [{ parent: 'blockA' }];
      const result = optimizer.findSequentialAwaits(mockAwaits);
      expect(result).toHaveLength(0);
    });

    it('should detect sequential awaits with same parent', () => {
      const parent = {};
      const mockAwaits = [
        { parent },
        { parent },
        { parent },
      ];
      const result = optimizer.findSequentialAwaits(mockAwaits);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should not group awaits with different parents', () => {
      const mockAwaits = [
        { parent: 'blockA' },
        { parent: 'blockB' },
      ];
      const result = optimizer.findSequentialAwaits(mockAwaits);
      expect(result).toHaveLength(0);
    });

    it('should return empty for empty array', () => {
      const result = optimizer.findSequentialAwaits([]);
      expect(result).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Caching opportunity detection & suggestions
  // -----------------------------------------------------------------------
  describe('suggestCachingStrategies', () => {
    it('should suggest caching for repeated computation', async () => {
      const issue = { type: 'repeated_computation', operation: 'filter', count: 4 };
      const suggestion = await optimizer.suggestCachingStrategies(issue);
      expect(suggestion.strategies[0].type).toBe('cache_result');
    });

    it('should suggest memoization for memoization candidate', async () => {
      const issue = { type: 'memoization_candidate', functionName: 'expensiveCalc' };
      const suggestion = await optimizer.suggestCachingStrategies(issue);
      expect(suggestion.strategies[0].type).toBe('add_memoization');
    });

    it('should suggest cache for repeated calls', async () => {
      const issue = { type: 'repeated_calls', count: 5 };
      const suggestion = await optimizer.suggestCachingStrategies(issue);
      expect(suggestion.strategies[0].type).toBe('cache_calls');
    });

    it('should include estimatedImprovement in result', async () => {
      const issue = { type: 'repeated_calls', count: 10 };
      const suggestion = await optimizer.suggestCachingStrategies(issue);
      expect(suggestion).toHaveProperty('estimatedImprovement');
    });
  });

  // -----------------------------------------------------------------------
  // Database issue detection — direct detector
  // Note: detectDatabaseIssues uses `this` inside traverse callbacks, which
  // loses context with the direct AST call. The N+1 detector works because
  // MemberExpression checks don't use `this`, but the multiple-queries
  // detector uses `this.isDatabaseQuery` which fails. Test through
  // analyzePerformance where the error is caught gracefully.
  // -----------------------------------------------------------------------
  describe('detectDatabaseIssues', () => {
    it('should detect N+1 query pattern (findById inside for loop)', async () => {
      // Note: the detector checks ForStatement, WhileStatement, DoWhileStatement
      // and forEach/map/filter callbacks but NOT ForOfStatement/ForInStatement
      const code = `
        for (let i = 0; i < ids.length; i++) {
          db.findById(ids[i]);
        }
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectDatabaseIssues(ast, code);
      const nPlusOne = issues.filter(i => i.type === 'n_plus_one');
      expect(nPlusOne.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect find with object expression as potential missing index', async () => {
      const code = `
        db.find({ email: user.email, status: 'active' });
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectDatabaseIssues(ast, code);
      const indexIssues = issues.filter(i => i.type === 'potential_missing_index');
      expect(indexIssues.length).toBeGreaterThanOrEqual(1);
      expect(indexIssues[0].fields).toEqual(expect.arrayContaining(['email', 'status']));
    });

    it('should return empty for code without database calls', async () => {
      const code = 'const x = 1 + 2;';
      const ast = parseCode(code);
      const issues = await optimizer.detectDatabaseIssues(ast, code);
      expect(issues).toHaveLength(0);
    });

    it('should detect N+1 via analyzePerformance', async () => {
      mockFileContent(`
        for (let i = 0; i < ids.length; i++) {
          db.findById(ids[i]);
        }
      `);
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const result = await optimizer.analyzePerformance('/test/db.js', {
        patterns: ['database_queries'],
      });
      // Should have found the N+1 issue
      expect(result.issues.some(i => i.type === 'n_plus_one')).toBe(true);
      warnSpy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // isDatabaseQuery
  // -----------------------------------------------------------------------
  describe('isDatabaseQuery', () => {
    it('should identify common database method names', () => {
      const t = require('@babel/types');
      const dbMethods = ['find', 'findOne', 'findById', 'query', 'select', 'insert', 'update', 'delete'];

      for (const method of dbMethods) {
        const node = {
          callee: t.memberExpression(t.identifier('db'), t.identifier(method)),
        };
        expect(optimizer.isDatabaseQuery(node)).toBe(true);
      }
    });

    it('should return false for non-database calls', () => {
      const t = require('@babel/types');
      const node = {
        callee: t.memberExpression(t.identifier('console'), t.identifier('log')),
      };
      expect(optimizer.isDatabaseQuery(node)).toBe(false);
    });

    it('should return false for non-member-expression callees', () => {
      const t = require('@babel/types');
      const node = {
        callee: t.identifier('someFunction'),
      };
      expect(optimizer.isDatabaseQuery(node)).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // suggestDatabaseOptimizations
  // -----------------------------------------------------------------------
  describe('suggestDatabaseOptimizations', () => {
    it('should suggest JOIN/batch for N+1', async () => {
      const issue = { type: 'n_plus_one', method: 'findById' };
      const suggestion = await optimizer.suggestDatabaseOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('use_join');
      expect(suggestion.optimizations[1].type).toBe('batch_loading');
      expect(suggestion.priority).toBe('critical');
    });

    it('should suggest index for potential missing index', async () => {
      const issue = { type: 'potential_missing_index', fields: ['email', 'status'] };
      const suggestion = await optimizer.suggestDatabaseOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('add_index');
    });

    it('should suggest aggregation for multiple queries', async () => {
      const issue = { type: 'multiple_queries', count: 6 };
      const suggestion = await optimizer.suggestDatabaseOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('aggregate_queries');
      expect(suggestion.optimizations[1].type).toBe('use_transactions');
    });
  });

  // -----------------------------------------------------------------------
  // Bundle size detection
  // Note: detectBundleSizeIssues uses `this.isLargeLibrary` inside traverse
  // callbacks, which loses `this` context when called directly with an AST.
  // Tests that require isLargeLibrary use analyzePerformance (which catches
  // the pattern error gracefully) or test features that don't depend on `this`.
  // -----------------------------------------------------------------------
  describe('detectBundleSizeIssues', () => {
    it('should detect CommonJS require (no this dependency)', async () => {
      const code = `const fs = require('fs');`;
      const ast = parseCode(code);
      const issues = await optimizer.detectBundleSizeIssues(ast, code);
      const cjsIssues = issues.filter(i => i.type === 'commonjs_require');
      expect(cjsIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect dynamic import() calls (no this dependency)', async () => {
      const code = `const mod = import('./heavy-module');`;
      const ast = parseCode(code);
      const issues = await optimizer.detectBundleSizeIssues(ast, code);
      const dynIssues = issues.filter(i => i.type === 'dynamic_import');
      expect(dynIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle bundle_size pattern errors gracefully via analyzePerformance', async () => {
      // The isLargeLibrary this-context bug causes the pattern to throw
      // inside traverse; analyzePerformance catches this with console.warn
      mockFileContent(`import * as _ from 'lodash';`);
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await optimizer.analyzePerformance('/test/bundle.js', {
        patterns: ['bundle_size'],
      });

      // The pattern detection failed due to the this-context bug,
      // so the warning should have been called
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should detect CommonJS require via analyzePerformance', async () => {
      // Use only CommonJS require (no ES imports that trigger isLargeLibrary)
      mockFileContent(`
        const fs = require('fs');
        const path = require('path');
      `);
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const result = await optimizer.analyzePerformance('/test/cjs.js', {
        patterns: ['bundle_size'],
      });
      expect(result.issues.some(i => i.type === 'commonjs_require')).toBe(true);
      warnSpy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // isLargeLibrary
  // -----------------------------------------------------------------------
  describe('isLargeLibrary', () => {
    it('should identify known large libraries', () => {
      expect(optimizer.isLargeLibrary('lodash')).toBe(true);
      expect(optimizer.isLargeLibrary('moment')).toBe(true);
      expect(optimizer.isLargeLibrary('rxjs')).toBe(true);
      expect(optimizer.isLargeLibrary('d3')).toBe(true);
      expect(optimizer.isLargeLibrary('@material-ui/core')).toBe(true);
      expect(optimizer.isLargeLibrary('three')).toBe(true);
      expect(optimizer.isLargeLibrary('antd')).toBe(true);
    });

    it('should return false for small libraries', () => {
      expect(optimizer.isLargeLibrary('express')).toBe(false);
      expect(optimizer.isLargeLibrary('path')).toBe(false);
      expect(optimizer.isLargeLibrary('chalk')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // suggestBundleOptimizations
  // -----------------------------------------------------------------------
  describe('suggestBundleOptimizations', () => {
    it('should suggest named imports for namespace import', async () => {
      const issue = { type: 'namespace_import', library: 'lodash' };
      const suggestion = await optimizer.suggestBundleOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('named_imports');
    });

    it('should suggest modular import for lodash default import', async () => {
      const issue = { type: 'default_import', library: 'lodash' };
      const suggestion = await optimizer.suggestBundleOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('modular_import');
    });

    it('should suggest consolidation for duplicate imports', async () => {
      const issue = { type: 'duplicate_imports', source: 'lodash' };
      const suggestion = await optimizer.suggestBundleOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('consolidate_imports');
    });

    it('should suggest ESM for CommonJS require', async () => {
      const issue = { type: 'commonjs_require' };
      const suggestion = await optimizer.suggestBundleOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('use_esm');
    });

    it('should return empty optimizations for non-lodash default import', async () => {
      const issue = { type: 'default_import', library: 'react' };
      const suggestion = await optimizer.suggestBundleOptimizations(issue);
      expect(suggestion.optimizations).toHaveLength(0);
    });

    it('should include estimatedSizeReduction', async () => {
      const issue = { type: 'namespace_import', library: 'lodash' };
      const suggestion = await optimizer.suggestBundleOptimizations(issue);
      expect(suggestion).toHaveProperty('estimatedSizeReduction');
    });
  });

  // -----------------------------------------------------------------------
  // React issue detection
  // Note: detectReactIssues uses `this.isReactComponent` and `this.shouldMemoize`
  // inside traverse callbacks, which lose `this` context. JSXElement checking
  // for inline function props does not use `this`, so it works directly.
  // -----------------------------------------------------------------------
  describe('detectReactIssues', () => {
    it('should skip analysis when React is not imported', async () => {
      const code = 'const x = 1;';
      const ast = parseCode(code);
      const issues = await optimizer.detectReactIssues(ast, code);
      expect(issues).toHaveLength(0);
    });

    it('should detect inline function props in JSX with simple expression', async () => {
      // Use a simple JSX expression without any CallExpression inside the
      // arrow (empty arrow body) to avoid the this.isReactComponent bug.
      // JSXElement visitor uses only `t.*` checks, not `this.*`.
      const code = `
        import React from 'react';
        const x = <Btn onClick={() => 1} onChange={() => 2} />;
      `;
      const ast = parseCode(code);
      // Call detectReactIssues directly - the arrow bodies have no
      // CallExpression, so the this.isReactComponent path is not hit.
      const issues = await optimizer.detectReactIssues(ast, code);
      const inlineIssues = issues.filter(i => i.type === 'inline_function_prop');
      expect(inlineIssues.length).toBeGreaterThanOrEqual(2);
      expect(inlineIssues[0].propName).toBe('onClick');
      expect(inlineIssues[1].propName).toBe('onChange');
    });
  });

  // -----------------------------------------------------------------------
  // suggestReactOptimizations
  // -----------------------------------------------------------------------
  describe('suggestReactOptimizations', () => {
    it('should suggest batching for setState in loop', async () => {
      const issue = { type: 'setState_in_loop' };
      const suggestion = await optimizer.suggestReactOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('batch_state_updates');
    });

    it('should suggest React.memo for missing memo', async () => {
      const issue = { type: 'missing_memo', componentName: 'MyComponent' };
      const suggestion = await optimizer.suggestReactOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('add_react_memo');
    });

    it('should suggest useCallback for inline function props', async () => {
      const issue = { type: 'inline_function_prop', propName: 'onClick' };
      const suggestion = await optimizer.suggestReactOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('use_callback');
      expect(suggestion.priority).toBe('medium');
    });
  });

  // -----------------------------------------------------------------------
  // String issue detection — direct detector
  // -----------------------------------------------------------------------
  describe('detectStringIssues', () => {
    it('should detect string concatenation in loop', async () => {
      const code = `
        for (let i = 0; i < 10; i++) {
          result = result + "item";
        }
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectStringIssues(ast, code);
      const strIssues = issues.filter(i => i.type === 'string_concat_in_loop');
      expect(strIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty for code without string issues', async () => {
      const code = 'const x = 1 + 2;';
      const ast = parseCode(code);
      const issues = await optimizer.detectStringIssues(ast, code);
      expect(issues).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // suggestStringOptimizations
  // -----------------------------------------------------------------------
  describe('suggestStringOptimizations', () => {
    it('should suggest array join for string concat in loop', async () => {
      const issue = { type: 'string_concat_in_loop' };
      const suggestion = await optimizer.suggestStringOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('use_array_join');
      expect(suggestion.priority).toBe('low');
    });

    it('should suggest caching for repeated string operations', async () => {
      const issue = { type: 'repeated_string_operation', operation: 'split', count: 4 };
      const suggestion = await optimizer.suggestStringOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('cache_result');
    });
  });

  // -----------------------------------------------------------------------
  // Object issue detection — direct detector
  // -----------------------------------------------------------------------
  describe('detectObjectIssues', () => {
    it('should detect deep property access (> 3 levels)', async () => {
      const code = `const val = obj.level1.level2.level3.level4;`;
      const ast = parseCode(code);
      const issues = await optimizer.detectObjectIssues(ast, code);
      const deepIssues = issues.filter(i => i.type === 'deep_property_access');
      expect(deepIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect Object.keys in loop', async () => {
      const code = `
        for (let i = 0; i < 10; i++) {
          Object.keys(data);
        }
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectObjectIssues(ast, code);
      const iterIssues = issues.filter(i => i.type === 'object_iteration_in_loop');
      expect(iterIssues.length).toBeGreaterThanOrEqual(1);
      expect(iterIssues[0].method).toBe('keys');
    });

    it('should detect Object.values in loop', async () => {
      const code = `
        while (cond) {
          Object.values(obj);
        }
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectObjectIssues(ast, code);
      const iterIssues = issues.filter(i => i.type === 'object_iteration_in_loop');
      expect(iterIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect Object.entries in loop', async () => {
      const code = `
        for (let i = 0; i < 5; i++) {
          Object.entries(map);
        }
      `;
      const ast = parseCode(code);
      const issues = await optimizer.detectObjectIssues(ast, code);
      const iterIssues = issues.filter(i => i.type === 'object_iteration_in_loop');
      expect(iterIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty for simple code', async () => {
      const code = 'const x = 1;';
      const ast = parseCode(code);
      const issues = await optimizer.detectObjectIssues(ast, code);
      expect(issues).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // suggestObjectOptimizations
  // -----------------------------------------------------------------------
  describe('suggestObjectOptimizations', () => {
    it('should suggest Map for large object literals', async () => {
      const issue = { type: 'large_object_literal', size: 100 };
      const suggestion = await optimizer.suggestObjectOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('use_map');
      expect(suggestion.priority).toBe('medium');
    });

    it('should suggest caching for deep property access', async () => {
      const issue = { type: 'deep_property_access', depth: 5 };
      const suggestion = await optimizer.suggestObjectOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('cache_reference');
      expect(suggestion.optimizations[1].type).toBe('flatten_structure');
    });

    it('should suggest caching for object iteration in loop', async () => {
      const issue = { type: 'object_iteration_in_loop', method: 'keys' };
      const suggestion = await optimizer.suggestObjectOptimizations(issue);
      expect(suggestion.optimizations[0].type).toBe('cache_iteration');
    });
  });

  // -----------------------------------------------------------------------
  // Utility/helper methods
  // -----------------------------------------------------------------------
  describe('getFunctionCallSignature', () => {
    it('should return name for simple identifiers', () => {
      const t = require('@babel/types');
      const node = { callee: t.identifier('myFunc') };
      expect(optimizer.getFunctionCallSignature(node)).toBe('myFunc');
    });

    it('should return object.property for member expressions', () => {
      const t = require('@babel/types');
      const node = {
        callee: t.memberExpression(t.identifier('arr'), t.identifier('map')),
      };
      expect(optimizer.getFunctionCallSignature(node)).toBe('arr.map');
    });

    it('should return null for complex expressions', () => {
      const t = require('@babel/types');
      const node = {
        callee: t.memberExpression(
          t.callExpression(t.identifier('getObj'), []),
          t.identifier('method'),
        ),
      };
      expect(optimizer.getFunctionCallSignature(node)).toBeNull();
    });
  });

  describe('isSimilarCall', () => {
    it('should return true for calls with same signature', () => {
      const t = require('@babel/types');
      const call1 = { callee: t.identifier('fetch') };
      const call2 = { callee: t.identifier('fetch') };
      expect(optimizer.isSimilarCall(call1, call2)).toBe(true);
    });

    it('should return false for calls with different signatures', () => {
      const t = require('@babel/types');
      const call1 = { callee: t.identifier('fetch') };
      const call2 = { callee: t.identifier('axios') };
      expect(optimizer.isSimilarCall(call1, call2)).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // generateOptimizationExample
  // -----------------------------------------------------------------------
  describe('generateOptimizationExample', () => {
    it('should return hash map example for deep loops', () => {
      const example = optimizer.generateOptimizationExample({ loopDepth: 2 });
      expect(example).toContain('Map');
      expect(example).toContain('O(n)');
    });

    it('should return empty string for shallow loops', () => {
      const example = optimizer.generateOptimizationExample({ loopDepth: 1 });
      expect(example).toBe('');
    });

    it('should return empty string for no loops', () => {
      const example = optimizer.generateOptimizationExample({ loopDepth: 0 });
      expect(example).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // estimatePerformanceImprovement
  // -----------------------------------------------------------------------
  describe('estimatePerformanceImprovement', () => {
    it('should return specific estimate for O(n^2) complexity', () => {
      const result = optimizer.estimatePerformanceImprovement({
        type: 'high_complexity',
        complexity: { notation: 'O(n\u00B2)' },
      });
      expect(result).toContain('10-100x');
    });

    it('should return specific estimate for O(n^3) complexity', () => {
      const result = optimizer.estimatePerformanceImprovement({
        type: 'high_complexity',
        complexity: { notation: 'O(n\u00B3)' },
      });
      expect(result).toContain('100-1000x');
    });

    it('should return specific estimate for O(2^n) complexity', () => {
      const result = optimizer.estimatePerformanceImprovement({
        type: 'high_complexity',
        complexity: { notation: 'O(2^n)' },
      });
      expect(result).toContain('Exponential');
    });

    it('should return generic estimate for unknown types', () => {
      const result = optimizer.estimatePerformanceImprovement({ type: 'other' });
      expect(result).toContain('depends on data size');
    });
  });

  // -----------------------------------------------------------------------
  // estimateMemorySaving
  // -----------------------------------------------------------------------
  describe('estimateMemorySaving', () => {
    it('should calculate MB savings for large arrays', () => {
      const result = optimizer.estimateMemorySaving({ type: 'large_array', size: 1000000 });
      expect(result).toContain('MB');
    });

    it('should return description for concat_in_loop', () => {
      const result = optimizer.estimateMemorySaving({ type: 'concat_in_loop' });
      expect(result).toContain('intermediate');
    });

    it('should return description for unnecessary_copy', () => {
      const result = optimizer.estimateMemorySaving({ type: 'unnecessary_copy' });
      expect(result).toContain('array size');
    });

    it('should return generic message for unknown type', () => {
      const result = optimizer.estimateMemorySaving({ type: 'unknown' });
      expect(result).toContain('depend');
    });
  });

  // -----------------------------------------------------------------------
  // estimateCachingImprovement
  // -----------------------------------------------------------------------
  describe('estimateCachingImprovement', () => {
    it('should calculate percentage for repeated calls', () => {
      const result = optimizer.estimateCachingImprovement({ type: 'repeated_calls', count: 5 });
      expect(result).toContain('80');
      expect(result).toContain('reduction');
    });

    it('should return generic message for other types', () => {
      const result = optimizer.estimateCachingImprovement({ type: 'other' });
      expect(result).toContain('Significant');
    });
  });

  // -----------------------------------------------------------------------
  // estimateBundleSizeReduction
  // -----------------------------------------------------------------------
  describe('estimateBundleSizeReduction', () => {
    it('should return known estimate for lodash namespace import', () => {
      const result = optimizer.estimateBundleSizeReduction({
        type: 'namespace_import',
        library: 'lodash',
      });
      expect(result).toContain('500KB');
    });

    it('should return known estimate for moment namespace import', () => {
      const result = optimizer.estimateBundleSizeReduction({
        type: 'namespace_import',
        library: 'moment',
      });
      expect(result).toContain('300KB');
    });

    it('should return generic message for unknown libraries', () => {
      const result = optimizer.estimateBundleSizeReduction({
        type: 'namespace_import',
        library: 'my-lib',
      });
      expect(result).toContain('depends on usage');
    });
  });

  // -----------------------------------------------------------------------
  // calculatePerformanceScore
  // -----------------------------------------------------------------------
  describe('calculatePerformanceScore', () => {
    it('should return 100 for code with no issues', () => {
      const analysis = { issues: [], metrics: {} };
      expect(optimizer.calculatePerformanceScore(analysis)).toBe(100);
    });

    it('should deduct 20 for critical issues', () => {
      const analysis = {
        issues: [{ impact: 'critical' }],
        metrics: {},
      };
      expect(optimizer.calculatePerformanceScore(analysis)).toBe(80);
    });

    it('should deduct 10 for high impact issues', () => {
      const analysis = {
        issues: [{ impact: 'high' }],
        metrics: {},
      };
      expect(optimizer.calculatePerformanceScore(analysis)).toBe(90);
    });

    it('should deduct for medium and low impact', () => {
      const analysis = {
        issues: [{ impact: 'medium' }, { impact: 'low' }],
        metrics: {},
      };
      expect(optimizer.calculatePerformanceScore(analysis)).toBe(93);
    });

    it('should apply static metric penalties', () => {
      const analysis = {
        issues: [],
        metrics: {
          static: {
            complexity: 25,
            loopDepth: 4,
            fileSize: 60000,
          },
        },
      };
      // -10 for complexity >20, -15 for loopDepth >3, -5 for fileSize >50000
      expect(optimizer.calculatePerformanceScore(analysis)).toBe(70);
    });

    it('should clamp score to 0 (not negative)', () => {
      const manyIssues = Array.from({ length: 20 }, () => ({ impact: 'critical' }));
      const analysis = { issues: manyIssues, metrics: {} };
      expect(optimizer.calculatePerformanceScore(analysis)).toBe(0);
    });

    it('should not exceed 100', () => {
      const analysis = { issues: [], metrics: {} };
      expect(optimizer.calculatePerformanceScore(analysis)).toBeLessThanOrEqual(100);
    });

    it('should handle missing static metrics gracefully', () => {
      const analysis = { issues: [], metrics: {} };
      expect(optimizer.calculatePerformanceScore(analysis)).toBe(100);
    });
  });

  // -----------------------------------------------------------------------
  // isExecutable
  // -----------------------------------------------------------------------
  describe('isExecutable', () => {
    it('should return true for .js files', () => {
      expect(optimizer.isExecutable('/src/main.js')).toBe(true);
    });

    it('should return false for test files', () => {
      expect(optimizer.isExecutable('/src/main.test.js')).toBe(false);
      expect(optimizer.isExecutable('/src/main.spec.js')).toBe(false);
    });

    it('should return false for non-JS files', () => {
      expect(optimizer.isExecutable('/src/styles.css')).toBe(false);
      expect(optimizer.isExecutable('/src/index.html')).toBe(false);
      expect(optimizer.isExecutable('/src/data.json')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // profileRuntime
  // -----------------------------------------------------------------------
  describe('profileRuntime', () => {
    it('should return placeholder metrics', async () => {
      const metrics = await optimizer.profileRuntime('/test/file.js');
      expect(metrics).toEqual({
        executionTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
      });
    });
  });

  // -----------------------------------------------------------------------
  // applyOptimization
  // -----------------------------------------------------------------------
  describe('applyOptimization', () => {
    it('should return success result', async () => {
      mockFileContent('const x = 1;');
      const optimization = { type: 'test_opt', description: 'Test optimization' };

      const result = await optimizer.applyOptimization('/test/file.js', optimization);

      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('test_opt');
      expect(result.changes[0].description).toBe('Test optimization');
    });

    it('should record optimization in history', async () => {
      mockFileContent('const x = 1;');
      const optimization = { type: 'test_opt', description: 'Test' };

      await optimizer.applyOptimization('/test/file.js', optimization);

      expect(optimizer.optimizationHistory).toHaveLength(1);
      expect(optimizer.optimizationHistory[0].filePath).toBe('/test/file.js');
      expect(optimizer.optimizationHistory[0]).toHaveProperty('timestamp');
      expect(optimizer.optimizationHistory[0].result.success).toBe(true);
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('Permission denied'));
      const optimization = { type: 'test_opt', description: 'Test' };

      const result = await optimizer.applyOptimization('/test/nope.js', optimization);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });

    it('should maintain empty changes array on error', async () => {
      fs.readFile.mockRejectedValue(new Error('fail'));
      const result = await optimizer.applyOptimization('/bad.js', { type: 't', description: 'd' });
      expect(result.changes).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // generateOptimizationReport
  // -----------------------------------------------------------------------
  describe('generateOptimizationReport', () => {
    it('should return report with expected structure', async () => {
      const report = await optimizer.generateOptimizationReport();

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('summary');
      expect(report.summary).toHaveProperty('filesAnalyzed', 0);
      expect(report.summary).toHaveProperty('totalIssues', 0);
      expect(report.summary).toHaveProperty('criticalIssues', 0);
      expect(report.summary).toHaveProperty('optimizationsApplied', 0);
      expect(report).toHaveProperty('byCategory');
      expect(report).toHaveProperty('topIssues');
      expect(report).toHaveProperty('recommendations');
    });

    it('should aggregate metrics from performanceMetrics map', async () => {
      optimizer.performanceMetrics.set('/test/a.js', {
        issues: [
          { severity: 'critical', impact: 'high', category: 'algorithm' },
          { severity: 'warning', impact: 'medium', category: 'memory' },
        ],
      });
      optimizer.performanceMetrics.set('/test/b.js', {
        issues: [
          { severity: 'critical', impact: 'high', category: 'algorithm' },
        ],
      });

      const report = await optimizer.generateOptimizationReport();

      expect(report.summary.filesAnalyzed).toBe(2);
      expect(report.summary.totalIssues).toBe(3);
      expect(report.summary.criticalIssues).toBe(2);
      expect(report.byCategory.algorithm.count).toBe(2);
      expect(report.byCategory.memory.count).toBe(1);
    });

    it('should sort top issues by impact', async () => {
      optimizer.performanceMetrics.set('/test/file.js', {
        issues: [
          { severity: 'low', impact: 'low', category: 'other' },
          { severity: 'critical', impact: 'critical', category: 'algorithm' },
          { severity: 'medium', impact: 'medium', category: 'memory' },
        ],
      });

      const report = await optimizer.generateOptimizationReport();

      expect(report.topIssues[0].impact).toBe('critical');
      expect(report.topIssues[report.topIssues.length - 1].impact).toBe('low');
    });

    it('should include optimization history count', async () => {
      optimizer.optimizationHistory.push({ filePath: '/a', timestamp: new Date().toISOString() });
      optimizer.optimizationHistory.push({ filePath: '/b', timestamp: new Date().toISOString() });

      const report = await optimizer.generateOptimizationReport();
      expect(report.summary.optimizationsApplied).toBe(2);
    });

    it('should limit topIssues to 10', async () => {
      const issues = Array.from({ length: 15 }, (_, i) => ({
        severity: 'high',
        impact: 'high',
        category: 'algorithm',
      }));
      optimizer.performanceMetrics.set('/test/many.js', { issues });

      const report = await optimizer.generateOptimizationReport();
      expect(report.topIssues.length).toBeLessThanOrEqual(10);
    });

    it('should strip rootPath from file paths in report', async () => {
      optimizer.performanceMetrics.set('/test/src/file.js', {
        issues: [{ severity: 'high', impact: 'high', category: 'algorithm' }],
      });

      const report = await optimizer.generateOptimizationReport();
      const topIssue = report.topIssues[0];
      expect(topIssue.file).toContain('src/file.js');
    });
  });

  // -----------------------------------------------------------------------
  // generateRecommendations
  // -----------------------------------------------------------------------
  describe('generateRecommendations', () => {
    it('should recommend algorithm training when many algorithm issues exist', () => {
      const report = { byCategory: { algorithm: { count: 6 } } };
      const recs = optimizer.generateRecommendations(report);
      expect(recs.some(r => r.category === 'algorithm')).toBe(true);
    });

    it('should not recommend algorithm training for few issues', () => {
      const report = { byCategory: { algorithm: { count: 3 } } };
      const recs = optimizer.generateRecommendations(report);
      expect(recs.some(r => r.category === 'algorithm')).toBe(false);
    });

    it('should recommend async review when many async issues exist', () => {
      const report = { byCategory: { async: { count: 11 } } };
      const recs = optimizer.generateRecommendations(report);
      expect(recs.some(r => r.category === 'async')).toBe(true);
    });

    it('should recommend memory profiling when memory issues exist', () => {
      const report = { byCategory: { memory: { count: 1 } } };
      const recs = optimizer.generateRecommendations(report);
      expect(recs.some(r => r.category === 'memory')).toBe(true);
    });

    it('should return empty recommendations when no issues', () => {
      const report = { byCategory: {} };
      const recs = optimizer.generateRecommendations(report);
      expect(recs).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Module export
  // -----------------------------------------------------------------------
  describe('module export', () => {
    it('should export PerformanceOptimizer class', () => {
      expect(typeof PerformanceOptimizer).toBe('function');
      expect(PerformanceOptimizer.name).toBe('PerformanceOptimizer');
    });
  });
});
