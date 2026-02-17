const ToolHelperExecutor = require('../../common/utils/tool-helper-executor');

describe('ToolHelperExecutor', () => {
  describe('Constructor and Helper Management', () => {
    test('should initialize with empty helpers array', () => {
      const executor = new ToolHelperExecutor([]);
      expect(executor.listHelpers()).toEqual([]);
      expect(executor.getStats().count).toBe(0);
    });

    test('should load helpers from constructor', () => {
      const helpers = [
        {
          id: 'test-helper',
          language: 'javascript',
          function: 'function test() { return "result"; }',
        },
      ];

      const executor = new ToolHelperExecutor(helpers);
      expect(executor.hasHelper('test-helper')).toBe(true);
      expect(executor.listHelpers()).toContain('test-helper');
    });

    test('should skip invalid helpers during construction', () => {
      const helpers = [
        { id: 'valid', function: 'function() {}' },
        { id: 'no-function' }, // Missing function
        { function: 'function() {}' }, // Missing id
      ];

      const executor = new ToolHelperExecutor(helpers);
      expect(executor.listHelpers()).toEqual(['valid']);
    });

    test('should add helper dynamically', () => {
      const executor = new ToolHelperExecutor([]);

      executor.addHelper({
        id: 'dynamic-helper',
        function: 'function() { return 42; }',
      });

      expect(executor.hasHelper('dynamic-helper')).toBe(true);
    });

    test('should throw error when adding duplicate helper', () => {
      const executor = new ToolHelperExecutor([
        { id: 'existing', function: 'function() {}' },
      ]);

      expect(() => {
        executor.addHelper({ id: 'existing', function: 'function() {}' });
      }).toThrow(/already exists/);
    });

    test('should replace existing helper', () => {
      const executor = new ToolHelperExecutor([
        { id: 'replaceable', function: 'function() { return 1; }' },
      ]);

      executor.replaceHelper({
        id: 'replaceable',
        function: 'function() { return 2; }',
      });

      expect(executor.hasHelper('replaceable')).toBe(true);
    });

    test('should remove helper', () => {
      const executor = new ToolHelperExecutor([
        { id: 'removable', function: 'function() {}' },
      ]);

      const removed = executor.removeHelper('removable');
      expect(removed).toBe(true);
      expect(executor.hasHelper('removable')).toBe(false);
    });

    test('should clear all helpers', () => {
      const executor = new ToolHelperExecutor([
        { id: 'helper1', function: 'function() {}' },
        { id: 'helper2', function: 'function() {}' },
      ]);

      executor.clearHelpers();
      expect(executor.getStats().count).toBe(0);
    });
  });

  describe('Helper Execution - Success Cases', () => {
    test('should execute simple helper successfully', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'simple-return',
          function: `
            function execute() {
              return 42;
            }
            execute();
          `,
        },
      ]);

      const result = await executor.execute('simple-return');
      expect(result).toBe(42);
    });

    test('should pass args to helper', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'args-helper',
          function: `
            function process() {
              return args.value * 2;
            }
            process();
          `,
        },
      ]);

      const result = await executor.execute('args-helper', { value: 21 });
      expect(result).toBe(42);
    });

    test('should handle complex data structures in args', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'complex-args',
          function: `
            function process() {
              return {
                name: args.user.name.toUpperCase(),
                count: args.items.length,
                total: args.items.reduce((sum, item) => sum + item.value, 0)
              };
            }
            process();
          `,
        },
      ]);

      const result = await executor.execute('complex-args', {
        user: { name: 'test' },
        items: [
          { value: 10 },
          { value: 20 },
          { value: 30 },
        ],
      });

      expect(result).toEqual({
        name: 'TEST',
        count: 3,
        total: 60,
      });
    });

    test('should execute helper with string manipulation', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'string-helper',
          function: `
            function format() {
              return args.text.split(' ').map(w =>
                w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
              ).join(' ');
            }
            format();
          `,
        },
      ]);

      const result = await executor.execute('string-helper', {
        text: 'hello WORLD from TEST',
      });
      expect(result).toBe('Hello World From Test');
    });

    test('should handle array operations', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'array-helper',
          function: `
            function process() {
              return args.numbers
                .filter(n => n % 2 === 0)
                .map(n => n * 2)
                .reduce((sum, n) => sum + n, 0);
            }
            process();
          `,
        },
      ]);

      const result = await executor.execute('array-helper', {
        numbers: [1, 2, 3, 4, 5, 6],
      });
      expect(result).toBe(24); // (2+4+6)*2 = 24
    });
  });

  describe('Timeout Enforcement (1000ms)', () => {
    test('should timeout helper exceeding 1s limit', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'slow-helper',
          function: `
            function slowOperation() {
              const start = Date.now();
              while (Date.now() - start < 2000) {
                // Busy wait for 2 seconds
              }
              return "completed";
            }
            slowOperation();
          `,
        },
      ]);

      await expect(executor.execute('slow-helper'))
        .rejects
        .toThrow(/exceeded 1s timeout/);
    }, 3000); // Test timeout higher than helper timeout

    test('should complete helper within timeout', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'fast-helper',
          function: `
            function fastOperation() {
              let sum = 0;
              for (let i = 0; i < 1000; i++) {
                sum += i;
              }
              return sum;
            }
            fastOperation();
          `,
        },
      ]);

      const result = await executor.execute('fast-helper');
      expect(result).toBe(499500);
    });

    test('should timeout on infinite loop', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'infinite-loop',
          function: `
            function infiniteLoop() {
              while (true) {
                // Infinite loop
              }
            }
            infiniteLoop();
          `,
        },
      ]);

      await expect(executor.execute('infinite-loop'))
        .rejects
        .toThrow(/exceeded 1s timeout/);
    }, 3000);
  });

  describe('Sandbox Isolation', () => {
    test('should not have access to require', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'require-test',
          function: `
            function attemptRequire() {
              try {
                const fs = require('fs');
                return "accessed fs";
              } catch (error) {
                return "require blocked";
              }
            }
            attemptRequire();
          `,
        },
      ]);

      const result = await executor.execute('require-test');
      expect(result).toBe('require blocked');
    });

    test('should not have access to process', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'process-test',
          function: `
            function attemptProcess() {
              try {
                return typeof process;
              } catch (error) {
                return "undefined";
              }
            }
            attemptProcess();
          `,
        },
      ]);

      const result = await executor.execute('process-test');
      expect(result).toBe('undefined');
    });

    test('should not have access to filesystem', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'fs-test',
          function: `
            function attemptFs() {
              try {
                const fs = require('fs');
                fs.readFileSync('/etc/passwd');
                return "file accessed";
              } catch (error) {
                return "fs blocked";
              }
            }
            attemptFs();
          `,
        },
      ]);

      const result = await executor.execute('fs-test');
      expect(result).toBe('fs blocked');
    });

    test('should not have access to global scope beyond sandbox', async () => {
      // Set a global variable outside sandbox
      global.testSecret = 'secret-value';

      const executor = new ToolHelperExecutor([
        {
          id: 'global-test',
          function: `
            function attemptGlobal() {
              try {
                return global.testSecret || "no access";
              } catch (error) {
                return "no access";
              }
            }
            attemptGlobal();
          `,
        },
      ]);

      const result = await executor.execute('global-test');
      expect(result).toBe('no access');

      // Cleanup
      delete global.testSecret;
    });

    test('should only have access to provided args', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'scope-test',
          function: `
            function checkScope() {
              const available = [];
              if (typeof args !== 'undefined') available.push('args');
              if (typeof require === 'undefined') available.push('no-require');
              if (typeof process === 'undefined') available.push('no-process');
              if (typeof fs === 'undefined') available.push('no-fs');
              return available;
            }
            checkScope();
          `,
        },
      ]);

      const result = await executor.execute('scope-test', { test: true });
      expect(result).toContain('args');
      expect(result).toContain('no-require');
      expect(result).toContain('no-process');
      expect(result).toContain('no-fs');
    });
  });

  describe('Error Handling', () => {
    test('should throw error for non-existent helper', async () => {
      const executor = new ToolHelperExecutor([]);

      await expect(executor.execute('nonexistent'))
        .rejects
        .toThrow(/not found/);
    });

    test('should provide helpful error with available helpers', async () => {
      const executor = new ToolHelperExecutor([
        { id: 'helper1', function: 'function() {}' },
        { id: 'helper2', function: 'function() {}' },
      ]);

      await expect(executor.execute('wrong-helper'))
        .rejects
        .toThrow(/Available helpers: helper1, helper2/);
    });

    test('should handle syntax errors in helper function', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'syntax-error',
          function: 'function invalid( { // Invalid syntax',
        },
      ]);

      await expect(executor.execute('syntax-error'))
        .rejects
        .toThrow(/execution failed/);
    });

    test('should handle runtime errors in helper', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'runtime-error',
          function: `
            function throwError() {
              throw new Error("Intentional error");
            }
            throwError();
          `,
        },
      ]);

      await expect(executor.execute('runtime-error'))
        .rejects
        .toThrow(/execution failed/);
    });

    test('should handle undefined variable access', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'undefined-var',
          function: `
            function accessUndefined() {
              return undefinedVariable.property;
            }
            accessUndefined();
          `,
        },
      ]);

      await expect(executor.execute('undefined-var'))
        .rejects
        .toThrow(/execution failed/);
    });

    test('should throw error for helper without function', async () => {
      const executor = new ToolHelperExecutor([]);
      executor.helpers.set('no-function', { id: 'no-function' });

      await expect(executor.execute('no-function'))
        .rejects
        .toThrow(/has no function defined/);
    });
  });

  describe('Helper Metadata', () => {
    test('should get helper info', () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'test-helper',
          language: 'javascript',
          runtime: 'isolated_vm',
          function: 'function() {}',
        },
      ]);

      const info = executor.getHelperInfo('test-helper');
      expect(info).toEqual({
        id: 'test-helper',
        language: 'javascript',
        runtime: 'isolated_vm',
        hasFunction: true,
      });
    });

    test('should return null for non-existent helper info', () => {
      const executor = new ToolHelperExecutor([]);
      const info = executor.getHelperInfo('nonexistent');
      expect(info).toBeNull();
    });

    test('should provide default language and runtime', () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'minimal-helper',
          function: 'function() {}',
        },
      ]);

      const info = executor.getHelperInfo('minimal-helper');
      expect(info.language).toBe('javascript');
      expect(info.runtime).toBe('isolated_vm');
    });

    test('should get statistics', () => {
      const executor = new ToolHelperExecutor([
        { id: 'helper1', function: 'function() {}' },
        { id: 'helper2', function: 'function() {}' },
        { id: 'helper3', function: 'function() {}' },
      ]);

      const stats = executor.getStats();
      expect(stats.count).toBe(3);
      expect(stats.helpers).toHaveLength(3);
      expect(stats.helpers).toContain('helper1');
      expect(stats.helpers).toContain('helper2');
      expect(stats.helpers).toContain('helper3');
    });
  });

  describe('Memory Management', () => {
    test('should dispose isolate after successful execution', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'dispose-test',
          function: '(function() { return "ok"; })();',
        },
      ]);

      const result = await executor.execute('dispose-test');
      expect(result).toBe('ok');
      // No way to directly test disposal, but it should not throw
    });

    test('should dispose isolate after failed execution', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'fail-dispose',
          function: 'throw new Error("test error");',
        },
      ]);

      await expect(executor.execute('fail-dispose'))
        .rejects
        .toThrow();
      // Isolate should still be disposed even on error
    });

    test('should dispose isolate after timeout', async () => {
      const executor = new ToolHelperExecutor([
        {
          id: 'timeout-dispose',
          function: 'while(true) {}',
        },
      ]);

      await expect(executor.execute('timeout-dispose'))
        .rejects
        .toThrow(/timeout/);
      // Isolate should be disposed even on timeout
    }, 3000);
  });
});
