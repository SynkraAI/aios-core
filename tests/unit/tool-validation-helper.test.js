const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

describe('ToolValidationHelper', () => {
  describe('Constructor and Validator Management', () => {
    test('should initialize with empty validators array', () => {
      const helper = new ToolValidationHelper([]);
      expect(helper.listValidators()).toEqual([]);
      expect(helper.getStats().count).toBe(0);
    });

    test('should load validators from constructor', () => {
      const validators = [
        {
          validates: 'create_item',
          language: 'javascript',
          function: `
            (function() {
              return { valid: true, errors: [] };
            })();
          `,
        },
      ];

      const helper = new ToolValidationHelper(validators);
      expect(helper.hasValidator('create_item')).toBe(true);
      expect(helper.listValidators()).toContain('create_item');
    });

    test('should skip invalid validators during construction', () => {
      const validators = [
        { validates: 'valid', function: 'function() {}' },
        { validates: 'no-function' }, // Missing function
        { function: 'function() {}' }, // Missing validates
      ];

      const helper = new ToolValidationHelper(validators);
      expect(helper.listValidators()).toEqual(['valid']);
    });

    test('should add validator dynamically', () => {
      const helper = new ToolValidationHelper([]);

      helper.addValidator({
        validates: 'dynamic-command',
        function: '(function() { return { valid: true, errors: [] }; })();',
      });

      expect(helper.hasValidator('dynamic-command')).toBe(true);
    });

    test('should throw error when adding duplicate validator', () => {
      const helper = new ToolValidationHelper([
        { validates: 'existing', function: 'function() {}' },
      ]);

      expect(() => {
        helper.addValidator({ validates: 'existing', function: 'function() {}' });
      }).toThrow(/already exists/);
    });

    test('should replace existing validator', () => {
      const helper = new ToolValidationHelper([
        { validates: 'replaceable', function: '(function() { return { valid: true, errors: [] }; })();' },
      ]);

      helper.replaceValidator({
        validates: 'replaceable',
        function: '(function() { return { valid: false, errors: ["replaced"] }; })();',
      });

      expect(helper.hasValidator('replaceable')).toBe(true);
    });

    test('should remove validator', () => {
      const helper = new ToolValidationHelper([
        { validates: 'removable', function: 'function() {}' },
      ]);

      const removed = helper.removeValidator('removable');
      expect(removed).toBe(true);
      expect(helper.hasValidator('removable')).toBe(false);
    });

    test('should clear all validators', () => {
      const helper = new ToolValidationHelper([
        { validates: 'validator1', function: 'function() {}' },
        { validates: 'validator2', function: 'function() {}' },
      ]);

      helper.clearValidators();
      expect(helper.getStats().count).toBe(0);
    });
  });

  describe('Validation Success/Failure Cases', () => {
    test('should pass validation with valid args', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'create_item',
          function: `
            (function() {
              if (!args.args.name || !args.args.type) {
                return { valid: false, errors: ['Missing required fields'] };
              }
              return { valid: true, errors: [] };
            })();
          `,
        },
      ]);

      const result = await helper.validate('create_item', { name: 'Test', type: 'item' });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should fail validation with invalid args', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'create_item',
          function: `
            (function() {
              if (!args.args.name || !args.args.type) {
                return { valid: false, errors: ['Missing required fields: name, type'] };
              }
              return { valid: true, errors: [] };
            })();
          `,
        },
      ]);

      const result = await helper.validate('create_item', { name: 'Test' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required fields: name, type');
    });

    test('should handle complex validation logic', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'update_item',
          function: `
            (function() {
              const errors = [];
              const data = args.args;

              if (!data.id) errors.push('ID is required');
              if (data.priority && (data.priority < 1 || data.priority > 4)) {
                errors.push('Priority must be between 1 and 4');
              }
              if (data.tags && !Array.isArray(data.tags)) {
                errors.push('Tags must be an array');
              }

              return { valid: errors.length === 0, errors };
            })();
          `,
        },
      ]);

      const result = await helper.validate('update_item', {
        id: '123',
        priority: 5,
        tags: 'not-array',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Priority must be between 1 and 4');
      expect(result.errors).toContain('Tags must be an array');
    });

    test('should return standardized format from non-standard results', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'bad-format',
          function: '(function() { return { valid: "yes" }; })();', // Invalid format
        },
      ]);

      const result = await helper.validate('bad-format', {});
      expect(result.valid).toBe(true); // "yes" is truthy
      expect(result.errors).toEqual([]); // Standardized to empty array
    });
  });

  describe('No-Validator Pass-Through', () => {
    test('should auto-pass when no validator exists', async () => {
      const helper = new ToolValidationHelper([]);

      const result = await helper.validate('unknown_command', { test: 'data' });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result._note).toContain('No validator configured');
    });

    test('should only validate commands with validators', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'validated_command',
          function: '(function() { return { valid: false, errors: ["fail"] }; })();',
        },
      ]);

      const validatedResult = await helper.validate('validated_command', {});
      expect(validatedResult.valid).toBe(false);

      const unvalidatedResult = await helper.validate('unvalidated_command', {});
      expect(unvalidatedResult.valid).toBe(true);
    });
  });

  describe('Performance Target (<50ms)', () => {
    test('should complete simple validation in <50ms', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'fast_command',
          function: `
            (function() {
              return { valid: true, errors: [] };
            })();
          `,
        },
      ]);

      const result = await helper.validate('fast_command', {});
      expect(result._duration).toBeDefined();
      expect(result._duration).toBeLessThan(50);
    });

    test('should warn when validation exceeds 50ms', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const helper = new ToolValidationHelper([
        {
          validates: 'slow_command',
          function: `
            (function() {
              const start = Date.now();
              while (Date.now() - start < 100) {
                // Busy wait for 100ms
              }
              return { valid: true, errors: [] };
            })();
          `,
        },
      ]);

      await helper.validate('slow_command', {});
      expect(consoleSpy).toHaveBeenCalled();
      const warnCall = consoleSpy.mock.calls[0][0];
      expect(warnCall).toContain('took');
      expect(warnCall).toContain('ms');
      expect(warnCall).toContain('target: <50ms');

      consoleSpy.mockRestore();
    });

    test('should include duration in result', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'timed_command',
          function: '(function() { return { valid: true, errors: [] }; })();',
        },
      ]);

      const result = await helper.validate('timed_command', {});
      expect(result._duration).toBeDefined();
      expect(typeof result._duration).toBe('number');
      expect(result._duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Timeout Enforcement (500ms)', () => {
    test('should timeout validator exceeding 500ms limit', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'timeout_test',
          function: `
            (function() {
              const start = Date.now();
              while (Date.now() - start < 1000) {
                // Busy wait for 1 second
              }
              return { valid: true, errors: [] };
            })();
          `,
        },
      ]);

      const result = await helper.validate('timeout_test', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('exceeded 500ms timeout');
    }, 2000); // Test timeout higher than validator timeout

    test('should complete validator within timeout', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'quick_validator',
          function: `
            (function() {
              let sum = 0;
              for (let i = 0; i < 1000; i++) {
                sum += i;
              }
              return { valid: true, errors: [] };
            })();
          `,
        },
      ]);

      const result = await helper.validate('quick_validator', {});
      expect(result.valid).toBe(true);
    });
  });

  describe('Error Handling and Formatting', () => {
    test('should handle validator with no function', async () => {
      const helper = new ToolValidationHelper([]);
      helper.validators.set('no-function', { validates: 'no-function' });

      const result = await helper.validate('no-function', {});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('has no function defined');
    });

    test('should handle syntax errors in validator function', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'syntax-error',
          function: 'function invalid( { // Invalid syntax',
        },
      ]);

      const result = await helper.validate('syntax-error', {});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Validation error');
    });

    test('should handle runtime errors in validator', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'runtime-error',
          function: `
            (function() {
              throw new Error("Intentional error");
            })();
          `,
        },
      ]);

      const result = await helper.validate('runtime-error', {});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Validation error');
    });

    test('should handle validator returning non-object', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'returns-string',
          function: '(function() { return "not an object"; })();',
        },
      ]);

      const result = await helper.validate('returns-string', {});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('returned invalid format');
    });

    test('should handle validator returning null', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'returns-null',
          function: '(function() { return null; })();',
        },
      ]);

      const result = await helper.validate('returns-null', {});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('returned invalid format');
    });

    test('should format errors as array', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'error-format',
          function: '(function() { return { valid: false, errors: "single error" }; })();',
        },
      ]);

      const result = await helper.validate('error-format', {});
      expect(result.errors).toEqual([]); // Non-array errors become empty array
    });
  });

  describe('Batch Validation', () => {
    test('should validate multiple commands at once', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'cmd1',
          function: '(function() { return { valid: true, errors: [] }; })();',
        },
        {
          validates: 'cmd2',
          function: '(function() { return { valid: false, errors: ["cmd2 failed"] }; })();',
        },
      ]);

      const results = await helper.validateBatch([
        { command: 'cmd1', args: {} },
        { command: 'cmd2', args: {} },
        { command: 'cmd3', args: {} }, // No validator
      ]);

      expect(results).toHaveLength(3);
      expect(results[0].result.valid).toBe(true);
      expect(results[1].result.valid).toBe(false);
      expect(results[2].result.valid).toBe(true); // No validator = pass
    });

    test('should handle empty batch validation', async () => {
      const helper = new ToolValidationHelper([]);

      const results = await helper.validateBatch([]);
      expect(results).toEqual([]);
    });
  });

  describe('Declarative Validation', () => {
    test('should validate required fields declaratively', () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'create_user',
          checks: [
            { required_fields: ['name', 'email'] },
          ],
          function: 'function() {}',
        },
      ]);

      const result = helper.validateDeclarative('create_user', { name: 'John' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Required field 'email' is missing");
    });

    test('should pass when all required fields present', () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'create_user',
          checks: [
            { required_fields: ['name', 'email'] },
          ],
          function: 'function() {}',
        },
      ]);

      const result = helper.validateDeclarative('create_user', { name: 'John', email: 'john@example.com' });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should return pass when no checks defined', () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'no_checks',
          function: 'function() {}',
        },
      ]);

      const result = helper.validateDeclarative('no_checks', {});
      expect(result.valid).toBe(true);
      expect(result._note).toContain('No declarative checks');
    });
  });

  describe('Validator Metadata', () => {
    test('should get validator info', () => {
      const helper = new ToolValidationHelper([
        {
          id: 'val-1',
          validates: 'test_command',
          language: 'javascript',
          checks: [{ required_fields: ['id'] }],
          function: 'function() {}',
        },
      ]);

      const info = helper.getValidatorInfo('test_command');
      expect(info).toEqual({
        id: 'val-1',
        validates: 'test_command',
        language: 'javascript',
        checks: [{ required_fields: ['id'] }],
        hasFunction: true,
      });
    });

    test('should return null for non-existent validator info', () => {
      const helper = new ToolValidationHelper([]);
      const info = helper.getValidatorInfo('nonexistent');
      expect(info).toBeNull();
    });

    test('should provide default language', () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'minimal',
          function: 'function() {}',
        },
      ]);

      const info = helper.getValidatorInfo('minimal');
      expect(info.language).toBe('javascript');
    });

    test('should get statistics', () => {
      const helper = new ToolValidationHelper([
        { validates: 'validator1', function: 'function() {}' },
        { validates: 'validator2', function: 'function() {}' },
        { validates: 'validator3', function: 'function() {}' },
      ]);

      const stats = helper.getStats();
      expect(stats.count).toBe(3);
      expect(stats.validators).toHaveLength(3);
      expect(stats.validators).toContain('validator1');
      expect(stats.validators).toContain('validator2');
      expect(stats.validators).toContain('validator3');
    });
  });

  describe('Memory Management', () => {
    test('should dispose isolate after successful validation', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'dispose-test',
          function: '(function() { return { valid: true, errors: [] }; })();',
        },
      ]);

      const result = await helper.validate('dispose-test', {});
      expect(result.valid).toBe(true);
      // No way to directly test disposal, but it should not throw
    });

    test('should dispose isolate after failed validation', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'fail-dispose',
          function: '(function() { throw new Error("test error"); })();',
        },
      ]);

      const result = await helper.validate('fail-dispose', {});
      expect(result.valid).toBe(false);
      // Isolate should still be disposed even on error
    });

    test('should dispose isolate after timeout', async () => {
      const helper = new ToolValidationHelper([
        {
          validates: 'timeout-dispose',
          function: '(function() { while(true) {} })();',
        },
      ]);

      const result = await helper.validate('timeout-dispose', {});
      expect(result.valid).toBe(false);
      // Isolate should be disposed even on timeout
    }, 2000);
  });
});
