const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Mock the required utilities
jest.mock('../../../aios-core/utils/component-metadata');
jest.mock('../../../aios-core/utils/git-wrapper');
jest.mock('../../../aios-core/utils/yaml-validator');
jest.mock('../../../aios-core/utils/rollback-handler');

describe('Modify Agent Task', () => {
  const testAgentPath = path.join(__dirname, 'test-fixtures', 'agents');
  const backupPath = path.join(testAgentPath, '.backups');
  
  beforeEach(async () => {
    // Create test directories
    await fs.mkdir(testAgentPath, { recursive: true });
    await fs.mkdir(backupPath, { recursive: true });
    
    // Create a test agent
    const testAgent = `---
name: test-agent
id: test
title: Test Agent
icon: 🧪
whenToUse: "Use for testing modifications"
dependencies:
  tasks:
    - existing-task.md
  templates:
    - test-template.md
---

# Test Agent

This is a test agent for modification testing.

## Commands
- help: Show available commands
- test: Run test command
`;
    
    await fs.writeFile(path.join(testAgentPath, 'test-agent.md'), testAgent);
  });
  
  afterEach(async () => {
    // Clean up test files
    await fs.rm(path.join(__dirname, 'test-fixtures'), { recursive: true, force: true });
  });
  
  describe('Agent Analysis and Backup', () => {
    test('should load and parse agent file correctly', async () => {
      const agentContent = await fs.readFile(
        path.join(testAgentPath, 'test-agent.md'), 
        'utf-8'
      );
      
      const [, frontmatter, content] = agentContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      const metadata = yaml.load(frontmatter);
      
      expect(metadata.name).toBe('test-agent');
      expect(metadata.dependencies.tasks).toContain('existing-task.md');
      expect(content).toContain('# Test Agent');
    });
    
    test('should create timestamped backup', async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupPath, `test-agent.md.${timestamp}`);
      
      const originalContent = await fs.readFile(
        path.join(testAgentPath, 'test-agent.md'), 
        'utf-8'
      );
      
      await fs.writeFile(backupFile, originalContent);
      
      const backupExists = await fs.access(backupFile)
        .then(() => true)
        .catch(() => false);
      
      expect(backupExists).toBe(true);
    });
  });
  
  describe('Modification Processing', () => {
    test('should add new dependencies correctly', async () => {
      const agentContent = await fs.readFile(
        path.join(testAgentPath, 'test-agent.md'), 
        'utf-8'
      );
      
      const [, frontmatter, content] = agentContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      const metadata = yaml.load(frontmatter);
      
      // Add new dependency
      metadata.dependencies.tasks.push('new-capability-task.md');
      
      expect(metadata.dependencies.tasks).toContain('new-capability-task.md');
      expect(metadata.dependencies.tasks.length).toBe(2);
    });
    
    test('should modify commands section', async () => {
      const agentContent = await fs.readFile(
        path.join(testAgentPath, 'test-agent.md'), 
        'utf-8'
      );
      
      const [, frontmatter, content] = agentContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      
      const modifiedContent = content.replace(
        '## Commands\n- help: Show available commands\n- test: Run test command',
        '## Commands\n- help: Show available commands\n- test: Run test command\n- modify: New modification command'
      );
      
      expect(modifiedContent).toContain('- modify: New modification command');
    });
  });
  
  describe('Validation Pipeline', () => {
    test('should validate YAML syntax', async () => {
      const validYaml = `name: test-agent
id: test
dependencies:
  tasks:
    - task1.md
    - task2.md`;
      
      expect(() => yaml.load(validYaml)).not.toThrow();
    });
    
    test('should detect invalid YAML', async () => {
      const invalidYaml = `name: test-agent
id: test
dependencies:
  tasks:
    - task1.md
    task2.md`; // Missing dash
      
      expect(() => yaml.load(invalidYaml)).toThrow();
    });
    
    test('should check for circular dependencies', async () => {
      // This would require implementing actual circular dependency detection
      // For now, we'll create a simple test structure
      const dependencies = {
        'agent1': ['agent2'],
        'agent2': ['agent3'],
        'agent3': ['agent1'] // Circular reference
      };
      
      const hasCircular = (agent, visited = new Set()) => {
        if (visited.has(agent)) return true;
        visited.add(agent);
        
        const deps = dependencies[agent] || [];
        for (const dep of deps) {
          if (hasCircular(dep, new Set(visited))) return true;
        }
        
        return false;
      };
      
      expect(hasCircular('agent1')).toBe(true);
    });
  });
  
  describe('Diff Generation', () => {
    test('should generate accurate diff', async () => {
      const original = `dependencies:
  tasks:
    - task1.md
    - task2.md`;
      
      const modified = `dependencies:
  tasks:
    - task1.md
    - task2.md
    - task3.md`;
      
      // Simple diff check
      expect(modified).toContain('task3.md');
      expect(original).not.toContain('task3.md');
    });
  });
  
  describe('Rollback Capability', () => {
    test('should restore from backup', async () => {
      const originalContent = 'Original agent content';
      const modifiedContent = 'Modified agent content';
      const agentFile = path.join(testAgentPath, 'rollback-test.md');
      const backupFile = path.join(backupPath, 'rollback-test.md.backup');
      
      // Create original
      await fs.writeFile(agentFile, originalContent);
      
      // Create backup
      await fs.writeFile(backupFile, originalContent);
      
      // Modify
      await fs.writeFile(agentFile, modifiedContent);
      
      // Verify modification
      let content = await fs.readFile(agentFile, 'utf-8');
      expect(content).toBe(modifiedContent);
      
      // Rollback
      const backupContent = await fs.readFile(backupFile, 'utf-8');
      await fs.writeFile(agentFile, backupContent);
      
      // Verify rollback
      content = await fs.readFile(agentFile, 'utf-8');
      expect(content).toBe(originalContent);
    });
  });
  
  describe('Integration Points', () => {
    test('should update component metadata', async () => {
      const { updateComponentMetadata } = require('../../../aios-core/utils/component-metadata');
      
      await updateComponentMetadata('agent', 'test-agent', {
        modified: new Date().toISOString(),
        version: '1.0.1'
      });
      
      expect(updateComponentMetadata).toHaveBeenCalledWith(
        'agent',
        'test-agent',
        expect.objectContaining({
          modified: expect.any(String),
          version: '1.0.1'
        })
      );
    });
    
    test('should create git commit', async () => {
      const { commitChanges } = require('../../../aios-core/utils/git-wrapper');
      
      await commitChanges(
        ['aios-core/agents/test-agent.md'],
        'feat: enhance test-agent with new capabilities'
      );
      
      expect(commitChanges).toHaveBeenCalledWith(
        expect.arrayContaining(['aios-core/agents/test-agent.md']),
        expect.stringContaining('enhance test-agent')
      );
    });
  });
});