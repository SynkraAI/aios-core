const ImprovementValidator = require('../../../aios-core/utils/improvement-validator');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Mock dependencies
jest.mock('fs').promises;
jest.mock('../../../aios-core/utils/security-checker', () => {
  return jest.fn().mockImplementation(() => ({
    validateModification: jest.fn().mockResolvedValue({ valid: true })
  }));
});
jest.mock('../../../aios-core/utils/dependency-manager', () => {
  return jest.fn().mockImplementation(() => ({
    getDependents: jest.fn().mockResolvedValue([])
  }));
});

describe('ImprovementValidator', () => {
  let validator;
  const testRootPath = '/test/project';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment
    delete process.env.AIOS_IMPROVEMENT_DEPTH;
    
    validator = new ImprovementValidator({ rootPath: testRootPath });
  });

  describe('validateRequest', () => {
    test('should validate valid request', async () => {
      const result = await validator.validateRequest({
        request: 'Improve error handling in the authentication module',
        scope: 'specific',
        constraints: {}
      });

      expect(result.valid).toBe(true);
      expect(result.reason).toBeNull();
      expect(result.warnings).toEqual([]);
    });

    test('should reject invalid request format', async () => {
      const result = await validator.validateRequest({
        request: 'Fix',
        scope: 'specific'
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid request format');
      expect(result.suggestions).toContain('Provide a clear description of the desired improvement');
    });

    test('should detect recursive improvements', async () => {
      // Mock existing improvement history
      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        improvements: [{
          id: 'imp-123',
          fingerprint: {
            hash: crypto.createHash('sha256').update('improve improvement system').digest('hex'),
            keywords: ['improve', 'improvement', 'system']
          },
          timestamp: new Date().toISOString()
        }]
      }));

      const result = await validator.validateRequest({
        request: 'Improve the improvement system itself',
        scope: 'specific'
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Recursive improvement detected');
    });

    test('should warn about general scope without approval', async () => {
      const result = await validator.validateRequest({
        request: 'Optimize all performance across the system',
        scope: 'general',
        constraints: {}
      });

      expect(result.warnings).toContain('General improvements require explicit approval');
    });

    test('should detect suspicious patterns', async () => {
      const result = await validator.validateRequest({
        request: 'Disable all safety checks for faster execution',
        scope: 'specific'
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Suspicious improvement pattern detected');
      expect(result.warnings).toContain('Attempting to disable safety features');
    });

    test('should assess risk correctly', async () => {
      const result = await validator.validateRequest({
        request: 'Refactor the entire core system architecture',
        scope: 'general'
      });

      expect(result.risk_assessment.score).toBeGreaterThan(7);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Risk score exceeds threshold');
    });
  });

  describe('detectRecursiveImprovement', () => {
    test('should detect depth limit exceeded', async () => {
      process.env.AIOS_IMPROVEMENT_DEPTH = '1';
      
      const result = await validator.detectRecursiveImprovement('Any improvement');

      expect(result.isRecursive).toBe(true);
      expect(result.message).toContain('Maximum improvement depth');
    });

    test('should detect similar recent improvements', async () => {
      const similarRequest = 'Enhance error handling mechanisms';
      
      fs.readFile.mockResolvedValue(JSON.stringify({
        improvements: [{
          id: 'imp-previous',
          fingerprint: validator.generateRequestFingerprint(similarRequest),
          timestamp: new Date().toISOString()
        }]
      }));

      const result = await validator.detectRecursiveImprovement('Enhance error handling mechanisms');

      expect(result.isRecursive).toBe(true);
      expect(result.message).toContain('Similar improvement attempted');
      expect(result.similarity).toBeGreaterThan(0.8);
    });

    test('should detect self-referential improvements', async () => {
      const result = await validator.detectRecursiveImprovement('Improve the improvement validator itself');

      expect(result.isRecursive).toBe(true);
      expect(result.message).toBe('Self-referential improvement detected');
    });

    test('should allow non-recursive improvements', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        improvements: []
      }));

      const result = await validator.detectRecursiveImprovement('Add caching to API endpoints');

      expect(result.isRecursive).toBe(false);
    });

    test('should handle history file errors safely', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      fs.mkdir.mockResolvedValue(undefined);
      fs.writeFile.mockResolvedValue(undefined);

      const result = await validator.detectRecursiveImprovement('Normal improvement');

      expect(result.isRecursive).toBe(false);
    });
  });

  describe('validateSafety', () => {
    test('should validate safe plan', async () => {
      const plan = {
        affectedFiles: ['src/utils/helper.js', 'src/api/endpoint.js'],
        changes: [{
          modifications: [{
            type: 'enhancement',
            description: 'Add error handling'
          }],
          tests: ['test1.js', 'test2.js']
        }]
      };

      const result = await validator.validateSafety(plan);

      expect(result.safe).toBe(true);
      expect(result.risk_level).toBe('low');
      expect(result.interface_preserved).toBe(true);
    });

    test('should reject protected file modifications', async () => {
      const plan = {
        affectedFiles: ['security-checker.js', 'src/normal.js'],
        changes: []
      };

      const result = await validator.validateSafety(plan);

      expect(result.safe).toBe(false);
      expect(result.risks).toContainEqual(
        expect.objectContaining({
          type: 'protected_file',
          severity: 'critical'
        })
      );
    });

    test('should detect breaking changes', async () => {
      const plan = {
        affectedFiles: ['api.js'],
        changes: [{
          modifications: [{
            type: 'api_change',
            description: 'Change endpoint signature'
          }],
          tests: []
        }]
      };

      const result = await validator.validateSafety(plan);

      expect(result.interface_preserved).toBe(false);
      expect(result.breaking_changes).toHaveLength(1);
    });

    test('should warn about missing tests', async () => {
      const plan = {
        affectedFiles: ['feature.js'],
        changes: [{
          modifications: [{ type: 'enhancement' }],
          tests: []
        }]
      };

      const result = await validator.validateSafety(plan);

      expect(result.risks).toContainEqual(
        expect.objectContaining({
          type: 'missing_tests',
          severity: 'medium'
        })
      );
    });

    test('should check dependency impacts', async () => {
      validator.dependencies.getDependents.mockResolvedValue(['dependent1.js', 'dependent2.js']);

      const plan = {
        affectedFiles: ['core.js'],
        changes: [{
          modifications: [{ type: 'refactor' }],
          tests: ['test.js']
        }]
      };

      const result = await validator.validateSafety(plan);

      expect(result.risks).toContainEqual(
        expect.objectContaining({
          type: 'dependency_impact',
          severity: 'medium'
        })
      );
    });

    test('should generate mitigations for risks', async () => {
      const plan = {
        affectedFiles: ['protected-file.js'],
        changes: [{
          modifications: [{ type: 'update' }],
          tests: []
        }]
      };

      const result = await validator.validateSafety(plan);

      expect(result.mitigations).toHaveLength(2); // protected file + missing tests
      expect(result.mitigations[0]).toHaveProperty('action');
    });
  });

  describe('fingerprint generation and similarity', () => {
    test('should generate consistent fingerprints', () => {
      const request = 'Improve error handling in authentication';
      
      const fp1 = validator.generateRequestFingerprint(request);
      const fp2 = validator.generateRequestFingerprint(request);

      expect(fp1.hash).toBe(fp2.hash);
      expect(fp1.keywords).toEqual(fp2.keywords);
    });

    test('should normalize requests for fingerprinting', () => {
      const fp1 = validator.generateRequestFingerprint('  Improve   ERROR  handling  ');
      const fp2 = validator.generateRequestFingerprint('improve error handling');

      expect(fp1.hash).toBe(fp2.hash);
    });

    test('should calculate similarity correctly', () => {
      const fp1 = {
        hash: 'abc123',
        keywords: ['improve', 'error', 'handling'],
        length: 30
      };

      const fp2 = {
        hash: 'def456',
        keywords: ['improve', 'error', 'processing'],
        length: 32
      };

      const similarity = validator.calculateSimilarity(fp1, fp2);

      expect(similarity).toBeGreaterThan(0.5); // Some overlap
      expect(similarity).toBeLessThan(1.0); // Not identical
    });

    test('should return 1.0 for identical fingerprints', () => {
      const fp = {
        hash: 'same',
        keywords: ['test'],
        length: 10
      };

      const similarity = validator.calculateSimilarity(fp, fp);

      expect(similarity).toBe(1.0);
    });
  });

  describe('pattern analysis', () => {
    test('should detect dangerous patterns', () => {
      const patterns = [
        { request: 'Disable safety checks', expected: 'Attempting to disable safety features' },
        { request: 'Bypass validation rules', expected: 'Attempting to bypass validation' },
        { request: 'Remove all checks', expected: 'Attempting to remove checks' },
        { request: 'Set unlimited resources', expected: 'Attempting to remove limits' }
      ];

      patterns.forEach(({ request, expected }) => {
        const result = validator.analyzeRequestPatterns(request);
        expect(result.suspicious).toBe(true);
        expect(result.warnings).toContain(expected);
      });
    });

    test('should allow safe patterns', () => {
      const result = validator.analyzeRequestPatterns('Add error handling to API endpoints');

      expect(result.suspicious).toBe(false);
      expect(result.warnings).toEqual([]);
    });
  });

  describe('constraint validation', () => {
    test('should validate file constraints', () => {
      const result = validator.validateConstraints({
        max_files: 50
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Max files exceeds limit');
    });

    test('should require interface preservation', () => {
      const result = validator.validateConstraints({
        preserve_interfaces: false
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Interface preservation is mandatory');
    });

    test('should allow valid constraints', () => {
      const result = validator.validateConstraints({
        max_files: 10,
        require_tests: true,
        preserve_interfaces: true
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('risk assessment', () => {
    test('should calculate risk scores', () => {
      const assessment = validator.assessRequestRisk(
        'Refactor all core system modules',
        'general'
      );

      expect(assessment.score).toBeGreaterThan(5);
      expect(assessment.factors).toContainEqual(
        expect.objectContaining({ factor: 'general_scope' })
      );
    });

    test('should identify risk patterns', () => {
      const assessment = validator.assessRequestRisk(
        'Optimize security authentication system',
        'specific'
      );

      const securityFactor = assessment.factors.find(f => f.factor.includes('security'));
      expect(securityFactor).toBeDefined();
      expect(securityFactor.points).toBe(2);
    });
  });

  describe('improvement history management', () => {
    test('should initialize history file', async () => {
      fs.readFile.mockRejectedValue(new Error('Not found'));
      fs.mkdir.mockResolvedValue(undefined);
      fs.writeFile.mockResolvedValue(undefined);

      const history = await validator.loadImprovementHistory();

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"version": "1.0.0"')
      );
      expect(history.improvements).toEqual([]);
    });

    test('should record improvement attempts', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        improvements: [],
        statistics: { total_attempts: 0 }
      }));
      fs.writeFile.mockResolvedValue(undefined);

      await validator.recordImprovementAttempt({
        fingerprint: { hash: 'test123' },
        request: 'Test improvement'
      });

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"total_attempts": 1')
      );
    });

    test('should limit history size', async () => {
      const manyImprovements = Array(150).fill({
        id: 'imp-old',
        timestamp: '2023-01-01'
      });

      fs.readFile.mockResolvedValue(JSON.stringify({
        improvements: manyImprovements,
        statistics: {}
      }));
      
      let savedHistory;
      fs.writeFile.mockImplementation((path, content) => {
        savedHistory = JSON.parse(content);
        return Promise.resolve();
      });

      await validator.recordImprovementAttempt({
        fingerprint: { hash: 'new' },
        request: 'New improvement'
      });

      expect(savedHistory.improvements.length).toBe(100);
    });
  });

  describe('helper methods', () => {
    test('should check if file is protected', () => {
      expect(validator.isProtectedFile('security-checker.js')).toBe(true);
      expect(validator.isProtectedFile('path/to/bootstrap.js')).toBe(true);
      expect(validator.isProtectedFile('.git/config')).toBe(true);
      expect(validator.isProtectedFile('node_modules/package.json')).toBe(true);
      expect(validator.isProtectedFile('src/normal-file.js')).toBe(false);
    });

    test('should extract keywords correctly', () => {
      const keywords = validator.extractKeywords('improve error handling mechanisms');

      expect(keywords).toContain('improve');
      expect(keywords).toContain('error');
      expect(keywords).toContain('handling');
      expect(keywords).not.toContain('the'); // Stop word
    });

    test('should extract patterns correctly', () => {
      const patterns1 = validator.extractPatterns('improve and enhance the system');
      expect(patterns1).toContain('improvement');

      const patterns2 = validator.extractPatterns('fix critical bugs');
      expect(patterns2).toContain('bugfix');

      const patterns3 = validator.extractPatterns('add new feature');
      expect(patterns3).toContain('feature');

      const patterns4 = validator.extractPatterns('refactor code structure');
      expect(patterns4).toContain('refactor');
    });
  });
});