const SandboxTester = require('../../../aios-core/utils/sandbox-tester');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const tmp = require('tmp-promise');

// Mock dependencies
jest.mock('fs').promises;
jest.mock('child_process');
jest.mock('tmp-promise');
jest.mock('chalk', () => ({
  blue: jest.fn(text => text),
  gray: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text)
}));

describe('SandboxTester', () => {
  let sandboxTester;
  let mockSpawn;
  const testRootPath = '/test/project';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock spawn
    mockSpawn = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn(),
      kill: jest.fn()
    };
    spawn.mockReturnValue(mockSpawn);
    
    // Mock tmp directory
    tmp.dir.mockResolvedValue({
      path: '/tmp/sandbox-123',
      cleanup: jest.fn()
    });
    
    sandboxTester = new SandboxTester({ rootPath: testRootPath });
  });

  describe('testImprovements', () => {
    test('should create sandbox and run tests successfully', async () => {
      const plan = {
        id: 'imp-123',
        affectedFiles: ['src/test.js'],
        changes: [{
          modifications: [{
            type: 'wrap_in_try_catch',
            file: 'src/test.js'
          }]
        }]
      };

      // Mock file operations
      fs.mkdir.mockResolvedValue(undefined);
      fs.readdir.mockResolvedValue([
        { name: 'src', isDirectory: () => true },
        { name: 'package.json', isDirectory: () => false }
      ]);
      fs.copyFile.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue('{}');
      fs.writeFile.mockResolvedValue(undefined);
      fs.rm.mockResolvedValue(undefined);

      // Mock successful test execution
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0);
        }
      });
      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('Tests: 10 passed, 10 total'));
        }
      });

      const results = await sandboxTester.testImprovements({
        plan,
        backupId: 'backup-123'
      });

      expect(results.success).toBe(true);
      expect(results.tests_passed).toBe(10);
      expect(results.tests_failed).toBe(0);
      expect(results.no_breaking_changes).toBe(true);
    });

    test('should handle test failures', async () => {
      const plan = {
        id: 'imp-456',
        affectedFiles: ['src/fail.js'],
        changes: [{
          modifications: [{
            type: 'enhance_error_message',
            file: 'src/fail.js'
          }]
        }]
      };

      fs.mkdir.mockResolvedValue(undefined);
      fs.readdir.mockResolvedValue([]);
      fs.writeFile.mockResolvedValue(undefined);
      fs.rm.mockResolvedValue(undefined);

      // Mock test failure
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(1);
        }
      });
      mockSpawn.stderr.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('Test failed'));
        }
      });

      const results = await sandboxTester.testImprovements({ plan });

      expect(results.success).toBe(false);
      expect(results.errors).toContain('unit tests failed');
    });

    test('should detect breaking changes', async () => {
      const plan = {
        id: 'imp-789',
        affectedFiles: ['src/api.js'],
        changes: [{
          modifications: [{
            type: 'api_change',
            file: 'src/api.js'
          }]
        }]
      };

      fs.mkdir.mockResolvedValue(undefined);
      fs.readdir.mockResolvedValue([]);
      fs.writeFile.mockResolvedValue(undefined);
      fs.rm.mockResolvedValue(undefined);
      
      // Mock file content for breaking change detection
      fs.readFile
        .mockResolvedValueOnce('module.exports = { oldFunc: () => {} }')
        .mockResolvedValueOnce('module.exports = { newFunc: () => {} }');

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      const results = await sandboxTester.testImprovements({ plan });

      expect(results.no_breaking_changes).toBe(false);
      expect(results.errors).toContainEqual(expect.stringContaining('Missing export'));
    });

    test('should measure performance impact', async () => {
      const plan = {
        id: 'imp-perf',
        affectedFiles: ['src/perf.js'],
        changes: []
      };

      fs.mkdir.mockResolvedValue(undefined);
      fs.readdir.mockResolvedValue([]);
      fs.writeFile.mockResolvedValue(undefined);
      fs.rm.mockResolvedValue(undefined);

      // Mock performance benchmark
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });
      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('baseline: 100\ncurrent: 105'));
        }
      });

      const results = await sandboxTester.testImprovements({ plan });

      expect(results.performance_impact).toBe('+5.0%');
    });

    test('should cleanup sandbox on error', async () => {
      const plan = { id: 'imp-error', affectedFiles: [] };

      fs.mkdir.mockRejectedValue(new Error('Disk full'));
      fs.rm.mockResolvedValue(undefined);

      const results = await sandboxTester.testImprovements({ plan });

      expect(results.success).toBe(false);
      expect(results.errors).toContainEqual(expect.stringContaining('Disk full'));
      expect(fs.rm).toHaveBeenCalled();
    });
  });

  describe('createSandbox', () => {
    test('should copy files excluding specified directories', async () => {
      fs.mkdir.mockResolvedValue(undefined);
      fs.readdir.mockResolvedValue([
        { name: 'src', isDirectory: () => true },
        { name: 'node_modules', isDirectory: () => true },
        { name: '.git', isDirectory: () => true },
        { name: 'file.js', isDirectory: () => false }
      ]);
      fs.copyFile.mockResolvedValue(undefined);
      fs.writeFile.mockResolvedValue(undefined);
      fs.access.mockResolvedValue(undefined);

      const sandboxPath = await sandboxTester.createSandbox({ id: 'test' });

      expect(fs.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('file.js'),
        expect.stringContaining('file.js')
      );
      expect(fs.copyFile).not.toHaveBeenCalledWith(
        expect.stringContaining('node_modules'),
        expect.any(String)
      );
    });

    test('should install dependencies if package.json exists', async () => {
      fs.mkdir.mockResolvedValue(undefined);
      fs.readdir.mockResolvedValue([
        { name: 'package.json', isDirectory: () => false }
      ]);
      fs.copyFile.mockResolvedValue(undefined);
      fs.writeFile.mockResolvedValue(undefined);
      
      // Mock package.json exists
      sandboxTester.fileExists = jest.fn().mockResolvedValue(true);
      
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      await sandboxTester.createSandbox({ id: 'test' });

      expect(spawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['ci']),
        expect.any(Object)
      );
    });
  });

  describe('applyModification', () => {
    test('should wrap function in try-catch', async () => {
      const content = `async function test() {
  await doSomething();
}`;

      fs.readFile.mockResolvedValue(content);
      fs.writeFile.mockResolvedValue(undefined);

      await sandboxTester.applyModification('/sandbox', {
        type: 'wrap_in_try_catch',
        file: 'test.js'
      });

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('try {')
      );
    });

    test('should enhance error messages', async () => {
      const content = `throw new Error('Failed');`;

      fs.readFile.mockResolvedValue(content);
      fs.writeFile.mockResolvedValue(undefined);

      await sandboxTester.applyModification('/sandbox', {
        type: 'enhance_error_message',
        file: 'error.js',
        pattern: "Error('Failed')"
      });

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('at error.js')
      );
    });

    test('should add retry logic', async () => {
      fs.readFile.mockResolvedValue('// existing code');
      fs.writeFile.mockResolvedValue(undefined);

      await sandboxTester.applyModification('/sandbox', {
        type: 'add_retry_logic',
        file: 'retry.js'
      });

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('retryOperation')
      );
    });
  });

  describe('runValidationTests', () => {
    test('should validate syntax', async () => {
      const plan = {
        affectedFiles: ['valid.js', 'invalid.js']
      };

      // Mock exec for syntax check
      const { exec } = require('child_process');
      const execMock = jest.fn()
        .mockImplementationOnce((cmd, cb) => cb(null, '', ''))
        .mockImplementationOnce((cmd, cb) => cb(new Error('Syntax error'), '', ''));
      
      require('util').promisify.mockReturnValue(execMock);

      const validation = await sandboxTester.runValidationTests('/sandbox', plan);

      expect(validation.success).toBe(false);
      expect(validation.checks.syntax.errors).toHaveLength(1);
    });

    test('should validate imports', async () => {
      const plan = {
        affectedFiles: ['module.js']
      };

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });

      const validation = await sandboxTester.runValidationTests('/sandbox', plan);

      expect(validation.checks.imports.passed).toBe(true);
    });
  });

  describe('runTestSuite', () => {
    test('should parse Jest test output', async () => {
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });
      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('Tests: 5 passed, 5 total'));
        }
      });

      fs.readFile.mockResolvedValue(JSON.stringify({
        scripts: { test: 'jest' }
      }));

      const result = await sandboxTester.runTestSuite(
        '/sandbox',
        'unit',
        { command: 'npm test' }
      );

      expect(result.success).toBe(true);
      expect(result.passed).toBe(5);
      expect(result.total).toBe(5);
    });

    test('should parse Mocha test output', async () => {
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });
      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('  8 passing\n  2 failing'));
        }
      });

      fs.readFile.mockResolvedValue(JSON.stringify({
        scripts: { test: 'mocha' }
      }));

      const result = await sandboxTester.runTestSuite(
        '/sandbox',
        'unit',
        { command: 'npm test' }
      );

      expect(result.passed).toBe(8);
      expect(result.failed).toBe(2);
      expect(result.total).toBe(10);
    });

    test('should handle missing test script', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        scripts: {}
      }));

      const result = await sandboxTester.runTestSuite(
        '/sandbox',
        'unit',
        { command: 'npm run test', required: true }
      );

      expect(result.success).toBe(false);
      expect(result.warnings).toContain('No unit test script found');
    });

    test('should handle test timeout', async () => {
      let timeoutId;
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          // Don't call callback - simulate hanging process
        }
      });
      spawn.mockImplementation(() => {
        const proc = {
          ...mockSpawn,
          kill: jest.fn()
        };
        
        // Simulate timeout
        timeoutId = setTimeout(() => {
          proc.kill('SIGTERM');
          proc.on.mock.calls.find(call => call[0] === 'close')[1](null);
        }, 10);
        
        return proc;
      });

      fs.readFile.mockResolvedValue(JSON.stringify({
        scripts: { test: 'jest' }
      }));

      const result = await sandboxTester.runTestSuite(
        '/sandbox',
        'unit',
        { command: 'npm test', timeout: 50 }
      );

      clearTimeout(timeoutId);
      expect(result.success).toBe(false);
    });
  });

  describe('checkBreakingChanges', () => {
    test('should detect missing exports', async () => {
      const plan = {
        affectedFiles: ['api.js']
      };

      fs.readFile
        .mockResolvedValueOnce('module.exports = { func1: x, func2: y };')
        .mockResolvedValueOnce('module.exports = { func1: x };');

      const changes = await sandboxTester.checkBreakingChanges('/sandbox', plan);

      expect(changes.found).toBe(true);
      expect(changes.changes).toContain('Missing export: func2 in api.js');
    });

    test('should handle ES6 exports', async () => {
      const plan = {
        affectedFiles: ['module.js']
      };

      fs.readFile
        .mockResolvedValueOnce('export function test() {}')
        .mockResolvedValueOnce('export function test() {}');

      const changes = await sandboxTester.checkBreakingChanges('/sandbox', plan);

      expect(changes.found).toBe(false);
    });
  });

  describe('measurePerformanceImpact', () => {
    test('should calculate performance change', async () => {
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      });
      mockSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('baseline: 1000\ncurrent: 1100'));
        }
      });

      const impact = await sandboxTester.measurePerformanceImpact('/sandbox');

      expect(impact.percentage).toBe(10);
      expect(impact.summary).toBe('+10.0%');
    });

    test('should handle missing benchmarks', async () => {
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') callback(1);
      });

      const impact = await sandboxTester.measurePerformanceImpact('/sandbox');

      expect(impact.summary).toBe('N/A');
    });
  });

  describe('runCommand', () => {
    test('should execute commands with timeout', async () => {
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          setTimeout(() => callback(0), 10);
        }
      });

      const result = await sandboxTester.runCommand(
        '/test',
        'echo test',
        { timeout: 1000 }
      );

      expect(spawn).toHaveBeenCalledWith(
        'echo',
        ['test'],
        expect.objectContaining({
          cwd: '/test',
          shell: true
        })
      );
    });

    test('should handle command errors', async () => {
      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(new Error('Command not found'));
        }
      });

      await expect(
        sandboxTester.runCommand('/test', 'invalid-command')
      ).rejects.toThrow('Command not found');
    });
  });
});