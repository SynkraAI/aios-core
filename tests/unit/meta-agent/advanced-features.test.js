const { describe, it, expect, beforeEach, afterEach, jest } = require('@jest/globals');
const fs = require('fs').promises;
const path = require('path');
const PatternLearner = require('../../../aios-core/utils/pattern-learner');
const RefactoringSuggester = require('../../../aios-core/utils/refactoring-suggester');
const CodeQualityImprover = require('../../../aios-core/utils/code-quality-improver');
const DocumentationSynchronizer = require('../../../aios-core/utils/documentation-synchronizer');
const PerformanceOptimizer = require('../../../aios-core/utils/performance-optimizer');

describe('Advanced Features Integration Tests', () => {
  let tempDir;
  
  beforeEach(async () => {
    // Create temporary directory for test files
    tempDir = path.join(__dirname, 'temp-test-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
  });
  
  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('Pattern Learner', () => {
    let patternLearner;
    
    beforeEach(() => {
      patternLearner = new PatternLearner({ rootPath: tempDir });
    });
    
    it('should learn patterns from modification history', async () => {
      // Create modification history
      const modifications = [
        {
          type: 'code_transformation',
          before: 'var x = 5;',
          after: 'const x = 5;',
          file: 'test1.js',
          timestamp: new Date().toISOString(),
          success: true
        },
        {
          type: 'code_transformation',
          before: 'var y = 10;',
          after: 'const y = 10;',
          file: 'test2.js',
          timestamp: new Date().toISOString(),
          success: true
        },
        {
          type: 'code_transformation',
          before: 'var z = 15;',
          after: 'const z = 15;',
          file: 'test3.js',
          timestamp: new Date().toISOString(),
          success: true
        }
      ];
      
      // Learn from history
      for (const mod of modifications) {
        await patternLearner.recordModification(mod);
      }
      
      // Test pattern suggestion
      const suggestions = await patternLearner.suggestPatterns('var a = 20;');
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].pattern).toBe('Variable Declaration Modernization');
      expect(suggestions[0].confidence).toBeGreaterThan(0.8);
    });
    
    it('should identify similar patterns with high confidence', () => {
      const pattern1 = { before: 'function foo() {}', after: 'const foo = () => {}' };
      const pattern2 = { before: 'function bar() {}', after: 'const bar = () => {}' };
      
      const similarity = patternLearner.calculateSimilarity(pattern1, pattern2);
      
      expect(similarity).toBeGreaterThan(0.9);
    });
  });

  describe('Refactoring Suggester', () => {
    let refactoringSuggester;
    
    beforeEach(() => {
      refactoringSuggester = new RefactoringSuggester({ rootPath: tempDir });
    });
    
    it('should detect long methods', async () => {
      const testFile = path.join(tempDir, 'long-method.js');
      const code = `
        function processData(data) {
          // 50+ lines of code here
          ${Array(50).fill('console.log("processing...");').join('\n          ')}
          return data;
        }
      `;
      
      await fs.writeFile(testFile, code);
      
      const suggestions = await refactoringSuggester.suggestRefactorings(testFile);
      const extractMethod = suggestions.find(s => s.pattern === 'extract_method');
      
      expect(extractMethod).toBeDefined();
      expect(extractMethod.impact).toBe('high');
    });
    
    it('should detect code duplication', async () => {
      const testFile = path.join(tempDir, 'duplicate-code.js');
      const code = `
        function calculateTax(amount) {
          const taxRate = 0.2;
          const tax = amount * taxRate;
          return tax;
        }
        
        function calculateFee(amount) {
          const feeRate = 0.2;
          const fee = amount * feeRate;
          return fee;
        }
      `;
      
      await fs.writeFile(testFile, code);
      
      const suggestions = await refactoringSuggester.suggestRefactorings(testFile);
      const removeDuplication = suggestions.find(s => s.pattern === 'remove_duplication');
      
      expect(removeDuplication).toBeDefined();
    });
  });

  describe('Code Quality Improver', () => {
    let codeQualityImprover;
    
    beforeEach(() => {
      codeQualityImprover = new CodeQualityImprover({ rootPath: tempDir });
    });
    
    it('should improve code formatting', async () => {
      const testFile = path.join(tempDir, 'unformatted.js');
      const code = `function   test(  ){console.log('hello'  );  }`;
      
      await fs.writeFile(testFile, code);
      
      const analysis = await codeQualityImprover.analyzeFile(testFile, {
        patterns: ['formatting']
      });
      
      expect(analysis.improvements).toHaveLength(1);
      expect(analysis.improvements[0].pattern).toBe('formatting');
      expect(analysis.improvements[0].confidence).toBeGreaterThan(0.9);
    });
    
    it('should modernize syntax', async () => {
      const testFile = path.join(tempDir, 'old-syntax.js');
      const code = `
        var x = 5;
        var obj = { a: 1 };
        var a = obj.a;
        
        function oldFunction() {
          return arguments[0];
        }
      `;
      
      await fs.writeFile(testFile, code);
      
      const analysis = await codeQualityImprover.analyzeFile(testFile, {
        patterns: ['modern-syntax']
      });
      
      const modernizations = analysis.improvements.filter(i => i.pattern === 'modern-syntax');
      expect(modernizations.length).toBeGreaterThan(0);
    });
  });

  describe('Documentation Synchronizer', () => {
    let docSynchronizer;
    
    beforeEach(async () => {
      docSynchronizer = new DocumentationSynchronizer({ 
        rootPath: tempDir,
        autoSync: false
      });
      await docSynchronizer.initialize();
    });
    
    it('should detect out-of-sync documentation', async () => {
      // Create component file
      const componentFile = path.join(tempDir, 'component.js');
      const componentCode = `
        /**
         * @description Old description
         * @param {string} name - The name
         */
        function greet(name, age) {
          return \`Hello \${name}, you are \${age} years old\`;
        }
      `;
      
      // Create documentation file
      const docFile = path.join(tempDir, 'component.md');
      const docContent = `
        # Component Documentation
        
        ## greet(name)
        
        Old description
        
        Parameters:
        - name (string): The name
      `;
      
      await fs.writeFile(componentFile, componentCode);
      await fs.writeFile(docFile, docContent);
      
      // Register component
      await docSynchronizer.registerComponent(componentFile, docFile);
      
      // Check sync status
      const changes = await docSynchronizer.synchronizeComponent(componentFile, {
        strategies: ['jsdoc']
      });
      
      expect(changes.length).toBeGreaterThan(0);
      const jsdocChanges = changes.find(c => c.strategy === 'jsdoc');
      expect(jsdocChanges.changes.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Optimizer', () => {
    let performanceOptimizer;
    
    beforeEach(() => {
      performanceOptimizer = new PerformanceOptimizer({ rootPath: tempDir });
    });
    
    it('should detect high complexity algorithms', async () => {
      const testFile = path.join(tempDir, 'complex-algorithm.js');
      const code = `
        function findDuplicates(arr) {
          const duplicates = [];
          for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
              if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
                duplicates.push(arr[i]);
              }
            }
          }
          return duplicates;
        }
      `;
      
      await fs.writeFile(testFile, code);
      
      const analysis = await performanceOptimizer.analyzePerformance(testFile, {
        patterns: ['algorithm_complexity']
      });
      
      expect(analysis.issues.length).toBeGreaterThan(0);
      const complexityIssue = analysis.issues.find(i => i.type === 'nested_loops');
      expect(complexityIssue).toBeDefined();
      expect(complexityIssue.severity).toBe('high');
    });
    
    it('should detect sequential async operations', async () => {
      const testFile = path.join(tempDir, 'sequential-async.js');
      const code = `
        async function fetchData() {
          const user = await fetchUser();
          const profile = await fetchProfile();
          const settings = await fetchSettings();
          
          return { user, profile, settings };
        }
      `;
      
      await fs.writeFile(testFile, code);
      
      const analysis = await performanceOptimizer.analyzePerformance(testFile, {
        patterns: ['async_operations']
      });
      
      const asyncIssue = analysis.issues.find(i => i.type === 'sequential_awaits');
      expect(asyncIssue).toBeDefined();
      expect(analysis.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Between Features', () => {
    it('should learn from refactoring suggestions', async () => {
      const patternLearner = new PatternLearner({ rootPath: tempDir });
      const refactoringSuggester = new RefactoringSuggester({ rootPath: tempDir });
      
      // Create test file with refactoring opportunity
      const testFile = path.join(tempDir, 'refactor-test.js');
      const code = `
        var x = 5;
        var y = 10;
        
        function add(a, b) {
          return a + b;
        }
      `;
      
      await fs.writeFile(testFile, code);
      
      // Get refactoring suggestions
      const suggestions = await refactoringSuggester.suggestRefactorings(testFile);
      
      // Record successful refactoring
      const modernizeSuggestion = suggestions.find(s => s.pattern === 'modernize_syntax');
      if (modernizeSuggestion) {
        await patternLearner.recordModification({
          type: 'refactoring',
          pattern: modernizeSuggestion.pattern,
          before: 'var x = 5;',
          after: 'const x = 5;',
          file: testFile,
          success: true
        });
      }
      
      // Pattern learner should now suggest similar transformations
      const learnedSuggestions = await patternLearner.suggestPatterns('var z = 15;');
      expect(learnedSuggestions.length).toBeGreaterThan(0);
    });
    
    it('should sync documentation after code quality improvements', async () => {
      const codeQualityImprover = new CodeQualityImprover({ rootPath: tempDir });
      const docSynchronizer = new DocumentationSynchronizer({ 
        rootPath: tempDir,
        autoSync: false
      });
      
      // Create component with JSDoc
      const componentFile = path.join(tempDir, 'documented-component.js');
      const code = `
        /**
         * Adds two numbers
         * @param {number} a - First number
         * @param {number} b - Second number
         * @returns {number} Sum
         */
        var add = function(a, b) {
          return a + b;
        };
      `;
      
      await fs.writeFile(componentFile, code);
      
      // Apply code quality improvements
      const analysis = await codeQualityImprover.analyzeFile(componentFile, {
        patterns: ['modern-syntax']
      });
      
      if (analysis.improvements.length > 0) {
        await codeQualityImprover.applyImprovements(componentFile, analysis.improvements);
        
        // Check if documentation needs sync
        const syncNeeded = await docSynchronizer.checkSyncStatus(componentFile);
        expect(syncNeeded).toBeDefined();
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed code gracefully', async () => {
      const refactoringSuggester = new RefactoringSuggester({ rootPath: tempDir });
      const malformedFile = path.join(tempDir, 'malformed.js');
      const code = `function broken( { return "missing closing brace" }`;
      
      await fs.writeFile(malformedFile, code);
      
      await expect(
        refactoringSuggester.suggestRefactorings(malformedFile)
      ).rejects.toThrow();
    });
    
    it('should handle empty files', async () => {
      const performanceOptimizer = new PerformanceOptimizer({ rootPath: tempDir });
      const emptyFile = path.join(tempDir, 'empty.js');
      
      await fs.writeFile(emptyFile, '');
      
      const analysis = await performanceOptimizer.analyzePerformance(emptyFile);
      expect(analysis.issues).toHaveLength(0);
    });
  });
});

describe('Advanced Features Performance Tests', () => {
  let tempDir;
  
  beforeEach(async () => {
    tempDir = path.join(__dirname, 'perf-test-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
  });
  
  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });
  
  it('should handle large files efficiently', async () => {
    const performanceOptimizer = new PerformanceOptimizer({ rootPath: tempDir });
    const largeFile = path.join(tempDir, 'large.js');
    
    // Generate large file (1000 functions)
    const functions = Array(1000).fill(0).map((_, i) => `
      function func${i}(a, b) {
        const result = a + b;
        return result * ${i};
      }
    `).join('\n');
    
    await fs.writeFile(largeFile, functions);
    
    const startTime = Date.now();
    const analysis = await performanceOptimizer.analyzePerformance(largeFile, {
      patterns: ['algorithm_complexity']
    });
    const endTime = Date.now();
    
    // Should complete within reasonable time
    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    expect(analysis).toBeDefined();
  });
  
  it('should handle concurrent operations', async () => {
    const patternLearner = new PatternLearner({ rootPath: tempDir });
    
    // Record multiple modifications concurrently
    const modifications = Array(100).fill(0).map((_, i) => ({
      type: 'code_transformation',
      before: `var x${i} = ${i};`,
      after: `const x${i} = ${i};`,
      file: `test${i}.js`,
      success: true
    }));
    
    const startTime = Date.now();
    await Promise.all(
      modifications.map(mod => patternLearner.recordModification(mod))
    );
    const endTime = Date.now();
    
    // Should handle concurrent operations efficiently
    expect(endTime - startTime).toBeLessThan(1000); // 1 second
    expect(patternLearner.modificationHistory.length).toBe(100);
  });
});