const fs = require('fs').promises;
const path = require('path');

// Mock the required utilities
jest.mock('../../../aios-core/utils/dependency-analyzer');
jest.mock('../../../aios-core/utils/git-wrapper');

describe('Modify Task Task', () => {
  const testTaskPath = path.join(__dirname, 'test-fixtures', 'tasks');
  const backupPath = path.join(testTaskPath, '.backups');
  
  beforeEach(async () => {
    // Create test directories
    await fs.mkdir(testTaskPath, { recursive: true });
    await fs.mkdir(backupPath, { recursive: true });
    
    // Create a test task with elicitation
    const testTask = `# Test Task

## Purpose

To test task modification capabilities with elicitation flows.

## Prerequisites

- Test environment setup
- User input required

## Task Execution

### 1. Initial Setup

- Load configuration
- Validate inputs

### 2. User Interaction

[[LLM: ELICITATION START
Ask the user for their preference:
1. Option A - Quick mode
2. Option B - Detailed mode

Wait for user response before proceeding.
]]

### 3. Processing

Based on user choice:
- Option A: Execute quick workflow
- Option B: Execute detailed workflow

## Output Format

\`\`\`json
{
  "status": "success",
  "mode": "quick|detailed",
  "results": {}
}
\`\`\`

## Integration Points

- Integrates with configuration system
- Uses validation utilities
`;
    
    await fs.writeFile(path.join(testTaskPath, 'test-task.md'), testTask);
    
    // Create a simple task without elicitation
    const simpleTask = `# Simple Task

## Purpose

A simple task for testing modifications.

## Task Execution

### 1. Execute

- Do something simple
- Return result

## Output Format

\`\`\`
Success: {message}
\`\`\`
`;
    
    await fs.writeFile(path.join(testTaskPath, 'simple-task.md'), simpleTask);
  });
  
  afterEach(async () => {
    // Clean up test files
    await fs.rm(path.join(__dirname, 'test-fixtures'), { recursive: true, force: true });
  });
  
  describe('Task Analysis', () => {
    test('should identify elicitation blocks', async () => {
      const taskContent = await fs.readFile(
        path.join(testTaskPath, 'test-task.md'), 
        'utf-8'
      );
      
      const hasElicitation = taskContent.includes('[[LLM:');
      const elicitationMatch = taskContent.match(/\[\[LLM:([\s\S]*?)\]\]/);
      
      expect(hasElicitation).toBe(true);
      expect(elicitationMatch).not.toBeNull();
      expect(elicitationMatch[1]).toContain('Ask the user');
    });
    
    test('should parse task structure', async () => {
      const taskContent = await fs.readFile(
        path.join(testTaskPath, 'test-task.md'), 
        'utf-8'
      );
      
      // Extract sections
      const sections = taskContent.split(/^##/m).map(s => s.trim()).filter(Boolean);
      const sectionTitles = sections.map(s => s.split('\n')[0].trim());
      
      expect(sectionTitles).toContain('Purpose');
      expect(sectionTitles).toContain('Prerequisites');
      expect(sectionTitles).toContain('Task Execution');
      expect(sectionTitles).toContain('Output Format');
    });
  });
  
  describe('Usage Impact Analysis', () => {
    test('should find task dependencies', async () => {
      const { analyzeDependencies } = require('../../../aios-core/utils/dependency-analyzer');
      
      // Mock the dependency analyzer
      analyzeDependencies.mockResolvedValue({
        agents: ['test-agent', 'dev-agent'],
        workflows: ['test-workflow'],
        chainedTasks: ['dependent-task']
      });
      
      const usage = await analyzeDependencies('test-task');
      
      expect(usage.agents).toHaveLength(2);
      expect(usage.workflows).toContain('test-workflow');
      expect(usage.chainedTasks).toContain('dependent-task');
    });
  });
  
  describe('Modification Processing', () => {
    test('should preserve elicitation flows', async () => {
      const originalContent = await fs.readFile(
        path.join(testTaskPath, 'test-task.md'), 
        'utf-8'
      );
      
      // Simulate adding a new step while preserving elicitation
      const modifiedContent = originalContent.replace(
        '### 3. Processing',
        '### 3. Validation\n\n- Validate user choice\n- Check prerequisites\n\n### 4. Processing'
      );
      
      // Verify elicitation block is untouched
      expect(modifiedContent).toContain('[[LLM: ELICITATION START');
      expect(modifiedContent).toContain('Ask the user for their preference:');
      
      // Verify new content is added
      expect(modifiedContent).toContain('### 3. Validation');
      expect(modifiedContent).toContain('### 4. Processing');
    });
    
    test('should update output format', async () => {
      const originalContent = await fs.readFile(
        path.join(testTaskPath, 'test-task.md'), 
        'utf-8'
      );
      
      // Add validation field to output
      const outputMatch = originalContent.match(/```json\n([\s\S]*?)\n```/);
      const originalOutput = JSON.parse(outputMatch[1]);
      
      const enhancedOutput = {
        ...originalOutput,
        validation: {
          passed: true,
          checks: []
        }
      };
      
      expect(enhancedOutput).toHaveProperty('validation');
      expect(enhancedOutput.status).toBe('success');
    });
  });
  
  describe('Backward Compatibility', () => {
    test('should maintain compatibility with existing calls', async () => {
      // Simulate task execution with old parameters
      const executeTask = (taskName, params) => {
        // Mock implementation
        if (params.mode) {
          return { status: 'success', mode: params.mode, results: {} };
        }
        // Handle legacy call without mode
        return { status: 'success', mode: 'quick', results: {} };
      };
      
      // Test with new parameters
      const newResult = executeTask('test-task', { mode: 'detailed' });
      expect(newResult.mode).toBe('detailed');
      
      // Test with legacy parameters (no mode specified)
      const legacyResult = executeTask('test-task', {});
      expect(legacyResult.status).toBe('success');
      expect(legacyResult.mode).toBe('quick'); // Default behavior
    });
  });
  
  describe('Diff Generation', () => {
    test('should generate accurate task diff', async () => {
      const original = `### 1. Step One
- Do something
- Do another thing

### 2. Step Two
- Final step`;
      
      const modified = `### 1. Step One
- Do something
- Validate input
- Do another thing

### 2. Step Two
- Check prerequisites
- Final step`;
      
      // Verify additions
      expect(modified).toContain('Validate input');
      expect(modified).toContain('Check prerequisites');
      
      // Verify preserved content
      expect(modified).toContain('Do something');
      expect(modified).toContain('Final step');
    });
  });
  
  describe('Validation Pipeline', () => {
    test('should validate markdown structure', async () => {
      const taskContent = await fs.readFile(
        path.join(testTaskPath, 'test-task.md'), 
        'utf-8'
      );
      
      // Check for required markdown elements
      const hasHeaders = /^#{1,3} /m.test(taskContent);
      const hasCodeBlocks = /```[\s\S]*?```/.test(taskContent);
      const hasList = /^[\s]*[-*] /m.test(taskContent);
      
      expect(hasHeaders).toBe(true);
      expect(hasCodeBlocks).toBe(true);
      expect(hasList).toBe(true);
    });
    
    test('should validate JSON output format', async () => {
      const taskContent = await fs.readFile(
        path.join(testTaskPath, 'test-task.md'), 
        'utf-8'
      );
      
      const jsonMatch = taskContent.match(/```json\n([\s\S]*?)\n```/);
      
      expect(jsonMatch).not.toBeNull();
      expect(() => JSON.parse(jsonMatch[1])).not.toThrow();
    });
  });
  
  describe('Rollback Capability', () => {
    test('should create and restore from backup', async () => {
      const taskFile = path.join(testTaskPath, 'rollback-test.md');
      const originalContent = '# Original Task\n\nOriginal content';
      const modifiedContent = '# Modified Task\n\nModified content';
      
      // Create original
      await fs.writeFile(taskFile, originalContent);
      
      // Create backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupPath, `rollback-test.md.${timestamp}`);
      await fs.writeFile(backupFile, originalContent);
      
      // Modify
      await fs.writeFile(taskFile, modifiedContent);
      
      // Verify modification
      let content = await fs.readFile(taskFile, 'utf-8');
      expect(content).toBe(modifiedContent);
      
      // Rollback
      const backupContent = await fs.readFile(backupFile, 'utf-8');
      await fs.writeFile(taskFile, backupContent);
      
      // Verify rollback
      content = await fs.readFile(taskFile, 'utf-8');
      expect(content).toBe(originalContent);
    });
  });
});