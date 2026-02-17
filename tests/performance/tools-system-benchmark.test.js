const path = require('path');
const fs = require('fs-extra');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolHelperExecutor = require('../../common/utils/tool-helper-executor');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * Performance Benchmarks for Tools System
 *
 * Performance Targets:
 * - Cached tool resolution: <5ms
 * - Uncached tool resolution: <50ms
 * - Validation execution: <50ms (target, timeout at 500ms)
 * - Helper execution: <100ms (typical, timeout at 1000ms)
 */
describe('Tools System Performance Benchmarks', () => {
  let testToolsDir;
  const benchmarkResults = {
    toolResolution: { cached: [], uncached: [] },
    validation: [],
    helpers: [],
  };

  beforeAll(async () => {
    // Create test directory
    testToolsDir = path.join(__dirname, '../fixtures/benchmark-tools');
    await fs.ensureDir(testToolsDir);

    // Create benchmark tool with validator and helper
    const benchmarkTool = {
      id: 'benchmark_tool',
      type: 'local',
      name: 'benchmark_tool',
      version: '1.0.0',
      schema_version: 2.0,
      description: 'Tool for performance benchmarking',
      executable_knowledge: {
        validators: [
          {
            id: 'benchmark_validator',
            validates: 'benchmark_command',
            language: 'javascript',
            checks: ['required_fields'],
            function: `
              (function() {
                // Simple validation logic
                const errors = [];
                if (!args.args.value) {
                  errors.push('Value is required');
                }
                if (args.args.value && (args.args.value < 1 || args.args.value > 100)) {
                  errors.push('Value must be between 1 and 100');
                }
                return { valid: errors.length === 0, errors };
              })();
            `,
          },
        ],
        helpers: [
          {
            id: 'benchmark_helper',
            language: 'javascript',
            function: `
              (function() {
                // Simple computation
                let result = 0;
                for (let i = 0; i < 1000; i++) {
                  result += i;
                }
                return {
                  computed: result,
                  input: args.value,
                  timestamp: Date.now()
                };
              })();
            `,
          },
        ],
      },
    };

    await fs.writeJSON(path.join(testToolsDir, 'benchmark_tool.yaml'), benchmarkTool);

    // Configure resolver
    toolResolver.clearCache();
    toolResolver.setSearchPaths([testToolsDir]);
  });

  afterAll(async () => {
    // Cleanup
    await fs.remove(testToolsDir);
    toolResolver.resetSearchPaths();

    // Print benchmark summary
    console.log('\n=== Performance Benchmark Results ===\n');

    console.log('Tool Resolution (Uncached):');
    const uncachedAvg = average(benchmarkResults.toolResolution.uncached);
    const uncachedMax = Math.max(...benchmarkResults.toolResolution.uncached);
    console.log(`  Average: ${uncachedAvg.toFixed(2)}ms`);
    console.log(`  Max: ${uncachedMax.toFixed(2)}ms`);
    console.log(`  Target: <50ms - ${uncachedAvg < 50 ? '✓ PASS' : '✗ FAIL'}\n`);

    console.log('Tool Resolution (Cached):');
    const cachedAvg = average(benchmarkResults.toolResolution.cached);
    const cachedMax = Math.max(...benchmarkResults.toolResolution.cached);
    console.log(`  Average: ${cachedAvg.toFixed(2)}ms`);
    console.log(`  Max: ${cachedMax.toFixed(2)}ms`);
    console.log(`  Target: <5ms - ${cachedAvg < 5 ? '✓ PASS' : '✗ FAIL'}\n`);

    console.log('Validation Execution:');
    const validationAvg = average(benchmarkResults.validation);
    const validationMax = Math.max(...benchmarkResults.validation);
    console.log(`  Average: ${validationAvg.toFixed(2)}ms`);
    console.log(`  Max: ${validationMax.toFixed(2)}ms`);
    console.log(`  Target: <50ms - ${validationAvg < 50 ? '✓ PASS' : '✗ FAIL'}\n`);

    console.log('Helper Execution:');
    const helperAvg = average(benchmarkResults.helpers);
    const helperMax = Math.max(...benchmarkResults.helpers);
    console.log(`  Average: ${helperAvg.toFixed(2)}ms`);
    console.log(`  Max: ${helperMax.toFixed(2)}ms`);
    console.log(`  Target: <100ms - ${helperAvg < 100 ? '✓ PASS' : '✗ FAIL'}\n`);

    console.log('======================================\n');
  });

  describe('Tool Resolution Performance', () => {
    test('uncached resolution should complete in <50ms', async () => {
      const iterations = 10;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        // Clear cache before each iteration
        toolResolver.clearCache();

        const start = Date.now();
        await toolResolver.resolveTool('benchmark_tool');
        const duration = Date.now() - start;

        durations.push(duration);
        benchmarkResults.toolResolution.uncached.push(duration);
      }

      const avgDuration = average(durations);
      const maxDuration = Math.max(...durations);

      console.log(`\nUncached resolution: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      // Allow some variance - check that average is under target
      expect(avgDuration).toBeLessThan(50);
    });

    test('cached resolution should complete in <5ms', async () => {
      const iterations = 100; // More iterations for cached (faster)
      const durations = [];

      // First resolution to populate cache
      await toolResolver.resolveTool('benchmark_tool');

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await toolResolver.resolveTool('benchmark_tool');
        const duration = Date.now() - start;

        durations.push(duration);
        benchmarkResults.toolResolution.cached.push(duration);
      }

      const avgDuration = average(durations);
      const maxDuration = Math.max(...durations);

      console.log(`Cached resolution: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      // Cached should be very fast
      expect(avgDuration).toBeLessThan(5);
    });

    test('cached resolution should be significantly faster than uncached', async () => {
      // Uncached
      toolResolver.clearCache();
      const uncachedStart = Date.now();
      const tool1 = await toolResolver.resolveTool('benchmark_tool');
      const uncachedDuration = Date.now() - uncachedStart;

      // Cached
      const cachedStart = Date.now();
      const tool2 = await toolResolver.resolveTool('benchmark_tool');
      const cachedDuration = Date.now() - cachedStart;

      const speedup = cachedDuration === 0
        ? 'Instant'
        : `${(uncachedDuration / cachedDuration).toFixed(2)}x`;
      console.log(`Speedup: ${speedup}`);

      // Always verify caching works by checking same reference is returned
      expect(tool1).toBe(tool2);

      // Skip strict performance assertion if durations are too short to measure reliably
      // This can happen in CI environments with variable timing
      if (uncachedDuration < 5 || cachedDuration === 0) {
        // Durations too short to measure speedup reliably, but caching verified above
        console.log('⚠️ Durations too short to measure caching speedup reliably');
        return;
      }

      // Cached should be faster than uncached (relaxed threshold for CI environments)
      // Allow cached to be up to 90% of uncached duration (at least 10% faster)
      if (uncachedDuration > 10) {
        expect(cachedDuration).toBeLessThan(uncachedDuration * 0.9);
      } else {
        // For very short durations, just verify cached is not slower
        expect(cachedDuration).toBeLessThanOrEqual(uncachedDuration);
      }
    });
  });

  describe('Validation Performance', () => {
    let validator;

    beforeAll(async () => {
      const tool = await toolResolver.resolveTool('benchmark_tool');
      validator = new ToolValidationHelper(tool.executable_knowledge.validators);
    });

    test('validation should complete in <50ms', async () => {
      const iterations = 50;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await validator.validate('benchmark_command', { value: 50 });
        const duration = Date.now() - start;

        durations.push(duration);
        benchmarkResults.validation.push(duration);
      }

      const avgDuration = average(durations);
      const maxDuration = Math.max(...durations);

      console.log(`\nValidation: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(50);
    });

    test('successful validation should be fast', async () => {
      const start = Date.now();
      const result = await validator.validate('benchmark_command', { value: 75 });
      const duration = Date.now() - start;

      expect(result.valid).toBe(true);
      expect(duration).toBeLessThan(50);
    });

    test('failed validation should be equally fast', async () => {
      const start = Date.now();
      const result = await validator.validate('benchmark_command', { value: 150 }); // Out of range
      const duration = Date.now() - start;

      expect(result.valid).toBe(false);
      expect(duration).toBeLessThan(50);
    });

    test('validation with missing fields should be fast', async () => {
      const start = Date.now();
      const result = await validator.validate('benchmark_command', {}); // Missing value
      const duration = Date.now() - start;

      expect(result.valid).toBe(false);
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Helper Execution Performance', () => {
    let executor;

    beforeAll(async () => {
      const tool = await toolResolver.resolveTool('benchmark_tool');
      executor = new ToolHelperExecutor(tool.executable_knowledge.helpers);
    });

    test('helper execution should complete in <100ms', async () => {
      const iterations = 50;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await executor.execute('benchmark_helper', { value: i });
        const duration = Date.now() - start;

        durations.push(duration);
        benchmarkResults.helpers.push(duration);
      }

      const avgDuration = average(durations);
      const maxDuration = Math.max(...durations);

      console.log(`\nHelper execution: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(100);
    });

    test('helper with simple computation should be fast', async () => {
      const start = Date.now();
      const result = await executor.execute('benchmark_helper', { value: 42 });
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(result.computed).toBe(499500); // Sum of 0..999
      expect(duration).toBeLessThan(100);
    });

    test('multiple helper executions should maintain performance', async () => {
      const iterations = 20;
      let totalDuration = 0;

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await executor.execute('benchmark_helper', { value: i });
        totalDuration += Date.now() - start;
      }

      const avgDuration = totalDuration / iterations;

      console.log(`Sequential helper avg: ${avgDuration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(100);
    });
  });

  describe('End-to-End Workflow Performance', () => {
    test('complete workflow (resolve → validate → execute) should be efficient', async () => {
      const iterations = 10;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        // 1. Resolve tool (cached after first)
        const tool = await toolResolver.resolveTool('benchmark_tool');

        // 2. Validate
        const validator = new ToolValidationHelper(tool.executable_knowledge.validators);
        const validation = await validator.validate('benchmark_command', { value: 50 });

        // 3. Execute helper (only if valid)
        if (validation.valid) {
          const executor = new ToolHelperExecutor(tool.executable_knowledge.helpers);
          await executor.execute('benchmark_helper', { value: 50 });
        }

        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = average(durations);
      const maxDuration = Math.max(...durations);

      console.log(`\nEnd-to-end workflow: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      // Combined workflow should still be reasonably fast
      // Target: <200ms (50ms resolve + 50ms validate + 100ms execute)
      expect(avgDuration).toBeLessThan(200);
    });
  });
});

/**
 * Calculate average of an array of numbers
 */
function average(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}
