const ModificationValidator = require('../../../aios-core/utils/modification-validator');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Mock dependencies
jest.mock('../../../aios-core/utils/yaml-validator', () => ({
  validateYAML: jest.fn()
}));
jest.mock('../../../aios-core/utils/dependency-analyzer');
jest.mock('../../../aios-core/utils/security-checker');

describe('ModificationValidator', () => {
  let validator;
  let mockValidateYAML;

  beforeEach(() => {
    validator = new ModificationValidator();
    mockValidateYAML = require('../../../aios-core/utils/yaml-validator').validateYAML;
    mockValidateYAML.mockReturnValue({ valid: true });
    
    // Mock security checker
    validator.securityChecker.checkContent = jest.fn().mockResolvedValue([]);
  });

  describe('validateModification', () => {
    test('should reject empty content', async () => {
      const result = await validator.validateModification('agent', '', 'modified', {});
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Original or modified content is empty');
    });

    test('should run type-specific validation', async () => {
      const originalAgent = `---
name: test-agent
id: test
title: Test Agent
icon: 🧪
whenToUse: "Testing"
---

# Test Agent`;

      const modifiedAgent = `---
name: test-agent
id: test
title: Test Agent Modified
icon: 🧪
whenToUse: "Testing"
---

# Test Agent Modified`;

      const result = await validator.validateModification('agent', originalAgent, modifiedAgent);
      
      expect(result.valid).toBe(true);
    });

    test('should detect security issues', async () => {
      validator.securityChecker.checkContent = jest.fn().mockResolvedValue([
        { severity: 'high', message: 'Hardcoded API key detected' }
      ]);

      const result = await validator.validateModification('task', 'original', 'modified');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual('Security issue: Hardcoded API key detected');
    });
  });

  describe('validateAgentModification', () => {
    const validAgent = `---
name: test-agent
id: test
title: Test Agent
icon: 🧪
whenToUse: "Testing"
dependencies:
  tasks:
    - test-task.md
commands:
  help: "Show help"
  test: "Run test"
---

# Test Agent

Agent content here.`;

    test('should validate agent structure', async () => {
      const result = await validator.validateAgentModification(validAgent, validAgent, {});
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing required fields', async () => {
      const invalidAgent = `---
name: test-agent
# Missing id, title, icon, whenToUse
---

# Test Agent`;

      const result = await validator.validateAgentModification(validAgent, invalidAgent, {});
      
      expect(result.errors).toContain('Required field missing: id');
      expect(result.errors).toContain('Required field missing: title');
      expect(result.errors).toContain('Required field missing: icon');
      expect(result.errors).toContain('Required field missing: whenToUse');
    });

    test('should detect removed commands', async () => {
      const modifiedAgent = validAgent.replace('test: "Run test"', '');
      
      const result = await validator.validateAgentModification(validAgent, modifiedAgent, {});
      
      expect(result.warnings).toContainEqual('Commands removed: test');
    });

    test('should validate dependencies', async () => {
      // Mock file access to simulate missing dependency
      validator.validateDependencies = jest.fn().mockResolvedValue({
        valid: true,
        errors: [],
        warnings: ['Dependency not found: tasks/missing-task.md']
      });

      const agentWithMissingDep = validAgent.replace('test-task.md', 'missing-task.md');
      
      const result = await validator.validateAgentModification(validAgent, agentWithMissingDep, {});
      
      expect(result.warnings).toContain('Dependency not found: tasks/missing-task.md');
    });

    test('should handle invalid YAML', async () => {
      mockValidateYAML.mockReturnValueOnce({ 
        valid: false, 
        error: 'Invalid YAML syntax' 
      });

      const result = await validator.validateAgentModification(validAgent, validAgent, {});
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('YAML validation failed: Invalid YAML syntax');
    });
  });

  describe('validateTaskModification', () => {
    const validTask = `# Test Task

## Purpose

Test task for validation.

## Task Execution

### 1. First Step

Do something.

### 2. Second Step

[[LLM: ELICITATION
Ask user for input.
]]

Do something else.

## Output Format

\`\`\`json
{
  "status": "success",
  "result": {}
}
\`\`\`
`;

    test('should validate task structure', async () => {
      const result = await validator.validateTaskModification(validTask, validTask, {});
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing required sections', async () => {
      const invalidTask = `# Test Task

Some content without required sections.`;

      const result = await validator.validateTaskModification(validTask, invalidTask, {});
      
      expect(result.errors).toContain('Required section missing: ## Purpose');
      expect(result.errors).toContain('Required section missing: ## Task Execution');
    });

    test('should validate elicitation blocks', async () => {
      const taskWithUnclosedElicitation = validTask.replace(']]', '');
      
      const result = await validator.validateTaskModification(validTask, taskWithUnclosedElicitation, {});
      
      expect(result.errors).toContain('Unclosed elicitation block found');
    });

    test('should check task step numbering', async () => {
      const taskWithMissingStep = validTask.replace('### 2. Second Step', '### 3. Third Step');
      
      const result = await validator.validateTaskModification(validTask, taskWithMissingStep, {});
      
      expect(result.warnings).toContainEqual('Task step 2 appears to be missing or misnumbered');
    });

    test('should validate JSON output format', async () => {
      const taskWithInvalidJson = validTask.replace('"result": {}', '"result": {');
      
      const result = await validator.validateTaskModification(validTask, taskWithInvalidJson, {});
      
      expect(result.warnings).toContain('Output format contains invalid JSON example');
    });
  });

  describe('validateWorkflowModification', () => {
    const validWorkflow = yaml.dump({
      name: 'test-workflow',
      phases: {
        planning: {
          sequence: 1,
          agents: ['pm'],
          artifacts: ['prd']
        },
        development: {
          sequence: 2,
          agents: ['dev'],
          entry_criteria: ['PRD approved']
        }
      }
    });

    test('should validate workflow structure', async () => {
      const result = await validator.validateWorkflowModification(validWorkflow, validWorkflow, {});
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing workflow name', async () => {
      const workflowWithoutName = yaml.dump({
        phases: {
          start: { sequence: 1, agents: ['dev'] }
        }
      });

      const result = await validator.validateWorkflowModification(validWorkflow, workflowWithoutName, {});
      
      expect(result.errors).toContain('Workflow name is required');
    });

    test('should detect empty phases', async () => {
      const workflowWithoutPhases = yaml.dump({
        name: 'test-workflow',
        phases: {}
      });

      const result = await validator.validateWorkflowModification(validWorkflow, workflowWithoutPhases, {});
      
      expect(result.errors).toContain('Workflow must have at least one phase');
    });

    test('should validate phase structure', async () => {
      const workflowWithInvalidPhase = yaml.dump({
        name: 'test-workflow',
        phases: {
          planning: {
            // Missing sequence
            agents: ['pm']
          },
          development: {
            sequence: 2,
            // Missing agents
          }
        }
      });

      const result = await validator.validateWorkflowModification(
        validWorkflow, 
        workflowWithInvalidPhase, 
        {}
      );
      
      expect(result.errors).toContain("Phase 'planning' missing sequence number");
      expect(result.errors).toContain("Phase 'development' must have at least one agent");
    });

    test('should check for sequence gaps', async () => {
      const workflowWithGaps = yaml.dump({
        name: 'test-workflow',
        phases: {
          start: { sequence: 1, agents: ['pm'] },
          end: { sequence: 5, agents: ['qa'] }
        }
      });

      const result = await validator.validateWorkflowModification(validWorkflow, workflowWithGaps, {});
      
      expect(result.warnings).toContain('Large gap in phase sequences detected');
    });

    test('should validate agent references', async () => {
      validator.checkAgentExists = jest.fn()
        .mockResolvedValueOnce(true)  // pm exists
        .mockResolvedValueOnce(false); // nonexistent-agent doesn't exist

      const workflowWithBadAgent = yaml.dump({
        name: 'test-workflow',
        phases: {
          planning: { sequence: 1, agents: ['pm'] },
          testing: { sequence: 2, agents: ['nonexistent-agent'] }
        }
      });

      const result = await validator.validateWorkflowModification(
        validWorkflow, 
        workflowWithBadAgent, 
        {}
      );
      
      expect(result.warnings).toContainEqual(
        "Agent 'nonexistent-agent' referenced in phase 'testing' not found"
      );
    });
  });

  describe('detectBreakingChanges', () => {
    test('should detect removed agent commands', async () => {
      const originalAgent = `---
name: test
id: test
commands:
  help: "Help"
  test: "Test"
  run: "Run"
---
Content`;

      const modifiedAgent = `---
name: test
id: test
commands:
  help: "Help"
  test: "Test"
---
Content`;

      const changes = await validator.detectBreakingChanges('agent', originalAgent, modifiedAgent);
      
      expect(changes).toHaveLength(1);
      expect(changes[0]).toEqual({
        type: 'removed_commands',
        items: ['run'],
        impact: 'Users relying on these commands will need to update their workflows'
      });
    });

    test('should detect changed task output format', async () => {
      const originalTask = `# Task
## Output Format
\`\`\`json
{ "status": "ok" }
\`\`\``;

      const modifiedTask = `# Task
## Output Format
\`\`\`json
{ "result": "success" }
\`\`\``;

      const changes = await validator.detectBreakingChanges('task', originalTask, modifiedTask);
      
      expect(changes).toHaveLength(1);
      expect(changes[0]).toEqual({
        type: 'output_format_changed',
        impact: 'Components consuming this task output may need updates'
      });
    });

    test('should detect removed workflow phases', async () => {
      const originalWorkflow = yaml.dump({
        phases: {
          planning: { sequence: 1 },
          development: { sequence: 2 },
          testing: { sequence: 3 }
        }
      });

      const modifiedWorkflow = yaml.dump({
        phases: {
          planning: { sequence: 1 },
          development: { sequence: 2 }
        }
      });

      const changes = await validator.detectBreakingChanges(
        'workflow', 
        originalWorkflow, 
        modifiedWorkflow
      );
      
      expect(changes).toHaveLength(1);
      expect(changes[0]).toEqual({
        type: 'removed_phases',
        items: ['testing'],
        impact: 'Projects using this workflow may fail at removed phases'
      });
    });
  });

  describe('validateTemplateModification', () => {
    test('should identify placeholders', async () => {
      const template = `# {{ProjectName}} Template

Welcome to {{ProjectName}}!

[[LLM: Replace placeholders with actual values]]`;

      const result = await validator.validateTemplateModification('', template, {});
      
      expect(result.suggestions).toContainEqual(
        'Template contains 2 placeholders: {{ProjectName}}'
      );
    });

    test('should warn about long LLM blocks', async () => {
      const longLLMBlock = '[[LLM: ' + 'x'.repeat(1001) + ']]';
      const template = `# Template\n\n${longLLMBlock}`;

      const result = await validator.validateTemplateModification('', template, {});
      
      expect(result.warnings).toContain(
        'LLM instruction block exceeds recommended length (1000 chars)'
      );
    });
  });

  describe('validateMarkdown', () => {
    test('should detect broken internal links', async () => {
      const markdown = `# Document

See [this section](#missing-section) for details.

## Other Section

Content here.`;

      const result = validator.validateMarkdown(markdown);
      
      expect(result.warnings).toContainEqual(
        'Broken internal link: [this section](#missing-section)'
      );
    });

    test('should detect unclosed code blocks', async () => {
      const markdown = `# Document

\`\`\`javascript
const code = "unclosed";

No closing backticks`;

      const result = validator.validateMarkdown(markdown);
      
      expect(result.errors).toContain('Unclosed code block detected');
    });
  });
});