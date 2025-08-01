const CapabilityAnalyzer = require('../../../aios-core/utils/capability-analyzer');
const fs = require('fs').promises;
const path = require('path');

// Mock dependencies
jest.mock('fs').promises;
jest.mock('../../../aios-core/utils/security-checker', () => {
  return jest.fn().mockImplementation(() => ({
    validateModification: jest.fn().mockResolvedValue({ valid: true })
  }));
});

describe('CapabilityAnalyzer', () => {
  let analyzer;
  const testRootPath = '/test/project';

  beforeEach(() => {
    jest.clearAllMocks();
    analyzer = new CapabilityAnalyzer({ rootPath: testRootPath });
  });

  describe('analyzeCapabilities', () => {
    test('should analyze all default categories', async () => {
      // Mock file system for JavaScript files
      fs.readdir.mockImplementation((dir) => {
        if (dir.includes('aios-core')) {
          return Promise.resolve([
            { name: 'test1.js', isDirectory: () => false, isFile: () => true },
            { name: 'test2.js', isDirectory: () => false, isFile: () => true },
            { name: 'utils', isDirectory: () => true, isFile: () => false }
          ]);
        }
        return Promise.resolve([]);
      });

      fs.readFile.mockResolvedValue(`
        async function testFunction() {
          try {
            await doSomething();
          } catch (error) {
            console.error(error);
          }
        }
        
        async function untested() {
          await riskyOperation();
        }
      `);

      const analysis = await analyzer.analyzeCapabilities();

      expect(analysis).toHaveProperty('overall_score');
      expect(analysis).toHaveProperty('categories');
      expect(analysis).toHaveProperty('improvement_opportunities');
      expect(analysis).toHaveProperty('strengths');
      expect(analysis).toHaveProperty('weaknesses');
      expect(analysis.timestamp).toBeDefined();
    });

    test('should analyze specific target areas only', async () => {
      const analysis = await analyzer.analyzeCapabilities({
        target_areas: ['error_handling', 'performance']
      });

      expect(Object.keys(analysis.categories)).toEqual(['error_handling', 'performance']);
    });

    test('should identify strengths and weaknesses', async () => {
      // Mock good and bad scores
      analyzer.analyzeMetric = jest.fn()
        .mockResolvedValueOnce({ score: 8.5, description: 'Good coverage' }) // strength
        .mockResolvedValueOnce({ score: 4.2, description: 'Poor performance' }); // weakness

      const analysis = await analyzer.analyzeCapabilities({
        target_areas: ['error_handling']
      });

      expect(analysis.strengths).toHaveLength(1);
      expect(analysis.strengths[0].score).toBe(8.5);
      expect(analysis.weaknesses).toHaveLength(0); // Only one metric analyzed
    });
  });

  describe('error handling analysis', () => {
    test('should analyze try-catch coverage', async () => {
      fs.readdir.mockResolvedValue([
        { name: 'file1.js', isDirectory: () => false, isFile: () => true }
      ]);

      fs.readFile.mockResolvedValue(`
        async function covered() {
          try {
            await something();
          } catch (e) {
            console.error(e);
          }
        }
        
        async function uncovered() {
          await something();
        }
        
        function sync() {
          doSomething();
        }
      `);

      const result = await analyzer.analyzeErrorHandlingTryCatchCoverage();

      expect(result.score).toBeGreaterThan(0);
      expect(result.description).toContain('Try-catch coverage');
      expect(result.details.asyncWithoutTryCatch).toHaveLength(1);
    });

    test('should analyze error context quality', async () => {
      fs.readdir.mockResolvedValue([
        { name: 'errors.js', isDirectory: () => false, isFile: () => true }
      ]);

      fs.readFile.mockResolvedValue(`
        throw new Error('Generic error');
        throw new Error(\`Context: \${variable} failed\`);
        throw new Error('Another generic error');
      `);

      const result = await analyzer.analyzeErrorHandlingErrorContext();

      expect(result.score).toBeGreaterThan(0);
      expect(result.description).toContain('Error context quality');
      expect(result.details.poorErrors).toHaveLength(2);
    });

    test('should analyze retry logic implementation', async () => {
      fs.readdir.mockResolvedValue([
        { name: 'network.js', isDirectory: () => false, isFile: () => true }
      ]);

      fs.readFile.mockResolvedValue(`
        async function fetchWithRetry() {
          let retries = 3;
          while (retries > 0) {
            try {
              return await fetch(url);
            } catch (e) {
              retries--;
            }
          }
        }
        
        async function fetchWithoutRetry() {
          return await fetch(url);
        }
      `);

      const result = await analyzer.analyzeErrorHandlingRetryLogic();

      expect(result.score).toBeGreaterThan(3);
      expect(result.description).toContain('Retry logic found');
    });
  });

  describe('generateImprovementPlan', () => {
    test('should generate plan from analysis', async () => {
      const analysis = {
        improvement_opportunities: [
          {
            category: 'error_handling',
            metric: 'try_catch_coverage',
            description: 'Add try-catch blocks',
            impact: 3,
            effort: 'medium',
            risk: 'low'
          }
        ],
        categories: {
          error_handling: {
            metrics: {
              try_catch_coverage: {
                details: {
                  asyncWithoutTryCatch: [
                    { file: 'test.js', line: 10 }
                  ]
                }
              }
            }
          }
        }
      };

      const plan = await analyzer.generateImprovementPlan({
        analysis,
        request: 'Improve error handling',
        constraints: { max_files: 5 }
      });

      expect(plan).toHaveProperty('id');
      expect(plan.changes).toHaveLength(1);
      expect(plan.affectedFiles).toContain('test.js');
      expect(plan.estimatedImpact).toBe(3);
      expect(plan.riskLevel).toBe('low');
    });

    test('should respect file constraints', async () => {
      const analysis = {
        improvement_opportunities: Array(10).fill({
          category: 'error_handling',
          metric: 'error_context',
          impact: 1,
          risk: 'low'
        })
      };

      const plan = await analyzer.generateImprovementPlan({
        analysis,
        request: 'Improve all',
        constraints: { max_files: 3 }
      });

      expect(plan.changes).toHaveLength(3);
    });
  });

  describe('generateChange', () => {
    test('should generate try-catch wrapping changes', async () => {
      const opportunity = {
        category: 'error_handling',
        metric: 'try_catch_coverage',
        description: 'Add try-catch',
        impact: 2,
        risk: 'low'
      };

      const analysis = {
        categories: {
          error_handling: {
            metrics: {
              try_catch_coverage: {
                details: {
                  asyncWithoutTryCatch: [
                    { file: 'async.js', line: 15 },
                    { file: 'fetch.js', line: 22 }
                  ]
                }
              }
            }
          }
        }
      };

      const change = await analyzer.generateChange(opportunity, analysis);

      expect(change.files).toContain('async.js');
      expect(change.files).toContain('fetch.js');
      expect(change.modifications).toHaveLength(2);
      expect(change.modifications[0].type).toBe('wrap_in_try_catch');
      expect(change.tests).toHaveLength(2);
    });

    test('should generate error context enhancement changes', async () => {
      const opportunity = {
        category: 'error_handling',
        metric: 'error_context',
        description: 'Enhance errors',
        impact: 1.5,
        risk: 'low'
      };

      const analysis = {
        categories: {
          error_handling: {
            metrics: {
              error_context: {
                details: {
                  poorErrors: [
                    { file: 'validate.js', error: "throw new Error('Failed')" }
                  ]
                }
              }
            }
          }
        }
      };

      const change = await analyzer.generateChange(opportunity, analysis);

      expect(change.files).toContain('validate.js');
      expect(change.modifications[0].type).toBe('enhance_error_message');
    });
  });

  describe('helper methods', () => {
    test('should calculate overall score correctly', () => {
      const categories = {
        error_handling: { score: 8 },
        performance: { score: 6 },
        testing: { score: 7 }
      };

      const score = analyzer.calculateOverallScore(categories);

      // Weighted average based on category weights
      expect(parseFloat(score)).toBeGreaterThan(6);
      expect(parseFloat(score)).toBeLessThan(8);
    });

    test('should calculate effort correctly', () => {
      const changes = [
        { risk: 'low' },
        { risk: 'medium' },
        { risk: 'high' }
      ];

      const effort = analyzer.calculateEffort(changes);
      expect(effort).toBe('medium');
    });

    test('should calculate risk level correctly', () => {
      const highRiskChanges = [
        { risk: 'high' },
        { risk: 'medium' }
      ];

      const risk = analyzer.calculateRiskLevel(highRiskChanges);
      expect(risk).toBe('high');

      const lowRiskChanges = [
        { risk: 'low' },
        { risk: 'low' }
      ];

      const lowRisk = analyzer.calculateRiskLevel(lowRiskChanges);
      expect(lowRisk).toBe('low');
    });
  });

  describe('getJavaScriptFiles', () => {
    test('should recursively find JavaScript files', async () => {
      fs.readdir
        .mockResolvedValueOnce([
          { name: 'file1.js', isDirectory: () => false, isFile: () => true },
          { name: 'subdir', isDirectory: () => true, isFile: () => false },
          { name: 'file2.txt', isDirectory: () => false, isFile: () => true }
        ])
        .mockResolvedValueOnce([
          { name: 'file3.js', isDirectory: () => false, isFile: () => true }
        ]);

      const files = await analyzer.getJavaScriptFiles('/test');

      expect(files).toHaveLength(2);
      expect(files).toContain(path.join('/test', 'file1.js'));
      expect(files).toContain(path.join('/test', 'subdir', 'file3.js'));
    });

    test('should skip node_modules and hidden directories', async () => {
      fs.readdir.mockResolvedValueOnce([
        { name: 'node_modules', isDirectory: () => true, isFile: () => false },
        { name: '.git', isDirectory: () => true, isFile: () => false },
        { name: 'src', isDirectory: () => true, isFile: () => false }
      ]);

      const files = await analyzer.getJavaScriptFiles('/test');

      expect(fs.readdir).toHaveBeenCalledTimes(1); // Only called for root, not for excluded dirs
    });
  });
});