/**
 * Unit tests for AIOS Developer Meta-Agent
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const SecurityChecker = require('../../../aios-core/utils/security-checker');
const YAMLValidator = require('../../../aios-core/utils/yaml-validator');

describe('AIOS Developer Meta-Agent', () => {
  const agentPath = path.join(__dirname, '../../../aios-core/agents/aios-developer.md');
  const manifestPath = path.join(__dirname, '../../../aios-core/agent-teams/team-all.yaml');
  
  let securityChecker;
  let yamlValidator;

  beforeAll(() => {
    securityChecker = new SecurityChecker();
    yamlValidator = new YAMLValidator();
  });

  describe('Agent Definition', () => {
    test('agent file exists', async () => {
      const exists = await fs.pathExists(agentPath);
      expect(exists).toBe(true);
    });

    test('agent file has valid structure', async () => {
      const content = await fs.readFile(agentPath, 'utf8');
      
      // Check for required sections
      expect(content).toContain('# aios-developer');
      expect(content).toContain('ACTIVATION-NOTICE:');
      expect(content).toContain('```yaml');
      expect(content).toContain('agent:');
      expect(content).toContain('persona:');
      expect(content).toContain('commands:');
    });

    test('agent YAML is valid', async () => {
      const content = await fs.readFile(agentPath, 'utf8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
      
      expect(yamlMatch).toBeTruthy();
      const yamlContent = yamlMatch[1];
      
      const validation = await yamlValidator.validate(yamlContent, 'agent');
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('agent has required commands', async () => {
      const content = await fs.readFile(agentPath, 'utf8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
      const yamlContent = yamlMatch[1];
      const parsed = yaml.load(yamlContent);
      
      const commands = parsed.commands;
      const commandNames = commands.map(cmd => 
        typeof cmd === 'string' ? cmd : Object.keys(cmd)[0]
      );
      
      expect(commandNames).toContain('help');
      expect(commandNames).toContain('create-agent');
      expect(commandNames).toContain('create-task');
      expect(commandNames).toContain('create-workflow');
      expect(commandNames).toContain('update-manifest');
    });

    test('agent has security configuration', async () => {
      const content = await fs.readFile(agentPath, 'utf8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
      const yamlContent = yamlMatch[1];
      const parsed = yaml.load(yamlContent);
      
      expect(parsed.security).toBeDefined();
      expect(parsed.security.authorization).toBeDefined();
      expect(parsed.security.validation).toBeDefined();
      expect(parsed.security['memory-access']).toBeDefined();
    });
  });

  describe('Task Files', () => {
    const taskFiles = [
      'create-agent.md',
      'create-task.md',
      'create-workflow.md',
      'update-manifest.md'
    ];

    test.each(taskFiles)('task file %s exists', async (taskFile) => {
      const taskPath = path.join(__dirname, '../../../aios-core/tasks', taskFile);
      const exists = await fs.pathExists(taskPath);
      expect(exists).toBe(true);
    });

    test.each(taskFiles)('task file %s has required sections', async (taskFile) => {
      const taskPath = path.join(__dirname, '../../../aios-core/tasks', taskFile);
      const content = await fs.readFile(taskPath, 'utf8');
      
      // Check required sections
      expect(content).toMatch(/^# .+/m);
      expect(content).toContain('## Purpose');
      expect(content).toContain('## Prerequisites');
      expect(content).toContain('## Implementation Steps');
      expect(content).toContain('## Validation Checklist');
      expect(content).toContain('## Error Handling');
    });

    test('create-agent task has elicitation process', async () => {
      const taskPath = path.join(__dirname, '../../../aios-core/tasks/create-agent.md');
      const content = await fs.readFile(taskPath, 'utf8');
      
      expect(content).toContain('## Interactive Elicitation Process');
      expect(content).toContain('### Step 1: Agent Identity');
      expect(content).toContain('### Step 2: Agent Persona');
      expect(content).toContain('### Step 3: Agent Commands');
      expect(content).toContain('### Step 4: Security and Access');
    });
  });

  describe('Manifest Registration', () => {
    test('manifest contains aios-developer', async () => {
      const content = await fs.readFile(manifestPath, 'utf8');
      const manifest = yaml.load(content);
      
      expect(manifest.agents).toContain('aios-developer');
    });

    test('manifest is valid YAML', async () => {
      const content = await fs.readFile(manifestPath, 'utf8');
      const validation = await yamlValidator.validate(content, 'manifest');
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('manifest has backup', async () => {
      const manifestDir = path.dirname(manifestPath);
      const files = await fs.readdir(manifestDir);
      const backups = files.filter(f => f.startsWith('team-all.yaml.backup-'));
      
      expect(backups.length).toBeGreaterThan(0);
    });
  });

  describe('Security Validation', () => {
    test('agent file has no dangerous patterns', async () => {
      const content = await fs.readFile(agentPath, 'utf8');
      const validation = securityChecker.validateCode(content);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test.each([
      'create-agent.md',
      'create-task.md',
      'create-workflow.md',
      'update-manifest.md'
    ])('task file %s has no security issues', async (taskFile) => {
      const taskPath = path.join(__dirname, '../../../aios-core/tasks', taskFile);
      const content = await fs.readFile(taskPath, 'utf8');
      const validation = securityChecker.validateCode(content, 'markdown');
      
      expect(validation.valid).toBe(true);
    });

    test('security checker detects eval', () => {
      const dangerousCode = `
        const userInput = req.body.code;
        eval(userInput);
      `;
      const validation = securityChecker.validateCode(dangerousCode);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].type).toBe('dangerous_pattern');
    });

    test('security checker allows safe patterns', () => {
      const safeCode = `
        // eval is dangerous, don't use it
        const result = JSON.parse(userInput);
      `;
      const validation = securityChecker.validateCode(safeCode);
      
      expect(validation.valid).toBe(true);
    });

    test('path validation detects traversal', () => {
      const validation = securityChecker.validatePath('../../etc/passwd');
      
      expect(validation.valid).toBe(false);
      expect(validation.errors[0].type).toBe('path_traversal');
    });

    test('input sanitization works correctly', () => {
      const dangerous = '<script>alert("xss")</script>';
      const sanitized = securityChecker.sanitizeInput(dangerous);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });
  });

  describe('YAML Validation', () => {
    test('validates agent YAML structure', async () => {
      const agentYAML = `
agent:
  name: test-agent
  id: test
  title: Test Agent
  icon: 🧪
  whenToUse: "For testing"
persona:
  role: Tester
  style: Precise
  identity: Test agent
  focus: Testing
commands:
  - help
`;
      const validation = await yamlValidator.validate(agentYAML, 'agent');
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('detects missing required fields', async () => {
      const incompleteYAML = `
agent:
  name: test-agent
  # missing required fields
persona:
  role: Tester
`;
      const validation = await yamlValidator.validate(incompleteYAML, 'agent');
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('auto-fix corrects indentation', async () => {
      const badIndent = `
agent:
name: test
  id: test
`;
      const result = await yamlValidator.autoFix(badIndent);
      
      expect(result.changed).toBe(true);
      expect(result.content).toContain('  name: test');
    });
  });

  describe('Documentation', () => {
    const docPath = path.join(__dirname, '../../../docs/aios-developer/README.md');

    test('documentation exists', async () => {
      const exists = await fs.pathExists(docPath);
      expect(exists).toBe(true);
    });

    test('documentation has required sections', async () => {
      const content = await fs.readFile(docPath, 'utf8');
      
      expect(content).toContain('# AIOS Developer - Meta-Agent Documentation');
      expect(content).toContain('## Overview');
      expect(content).toContain('## What is a Meta-Agent?');
      expect(content).toContain('## Core Capabilities');
      expect(content).toContain('## Security Architecture');
      expect(content).toContain('## Usage Guide');
      expect(content).toContain('## Best Practices');
      expect(content).toContain('## Troubleshooting');
    });

    test('documentation includes examples', async () => {
      const content = await fs.readFile(docPath, 'utf8');
      
      expect(content).toContain('### Example: Creating a New Agent');
      expect(content).toContain('*create-agent');
      expect(content).toContain('/aios-developer');
    });
  });

  describe('Memory Layer Integration', () => {
    test('agent includes memory operations', async () => {
      const content = await fs.readFile(agentPath, 'utf8');
      
      expect(content).toContain('test-memory');
      expect(content).toContain('list-components');
      expect(content).toContain('memory layer');
    });

    test('tasks include memory updates', async () => {
      const createAgentPath = path.join(__dirname, '../../../aios-core/tasks/create-agent.md');
      const content = await fs.readFile(createAgentPath, 'utf8');
      
      expect(content).toContain('memoryClient.addMemory');
      expect(content).toContain('type: \'agent_created\'');
    });
  });
});