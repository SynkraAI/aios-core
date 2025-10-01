const CommitMessageGenerator = require('../../../aios-core/utils/commit-message-generator');
const yaml = require('js-yaml');

// Mock dependencies
jest.mock('../../../aios-core/utils/diff-generator');
jest.mock('../../../aios-core/utils/modification-validator');

describe('CommitMessageGenerator', () => {
  let generator;
  let mockDiffGenerator;
  let mockValidator;

  beforeEach(() => {
    generator = new CommitMessageGenerator();
    mockDiffGenerator = generator.diffGenerator;
    mockValidator = generator.validator;
    
    // Default mock implementations
    mockDiffGenerator.generateUnifiedDiff = jest.fn().mockReturnValue('');
    mockValidator.validateModification = jest.fn().mockResolvedValue({
      valid: true,
      breakingChanges: []
    });
  });

  describe('generateCommitMessage', () => {
    test('should generate basic commit message', async () => {
      const modification = {
        componentType: 'agent',
        componentName: 'test-agent',
        originalContent: '---\nname: test\n---\n# Test',
        modifiedContent: '---\nname: test\ntitle: Test Agent\n---\n# Test',
        userIntent: 'add title to agent'
      };

      mockDiffGenerator.generateUnifiedDiff.mockReturnValue(`
@@ -1,3 +1,4 @@
 ---
 name: test
+title: Test Agent
 ---`);

      const result = await generator.generateCommitMessage(modification);
      
      expect(result.message).toContain('feat(agent): add title to agent');
      expect(result.type).toBe('feat');
      expect(result.scope).toBe('agent');
    });

    test('should detect breaking changes', async () => {
      const modification = {
        componentType: 'agent',
        componentName: 'test-agent',
        originalContent: '---\nname: test\ncommands:\n  old: "Old command"\n---\n# Test',
        modifiedContent: '---\nname: test\ncommands:\n  new: "New command"\n---\n# Test',
        userIntent: 'update commands'
      };

      mockValidator.validateModification.mockResolvedValue({
        valid: true,
        breakingChanges: [{
          type: 'removed_commands',
          items: ['old'],
          impact: 'Users relying on these commands will need to update their workflows'
        }]
      });

      const result = await generator.generateCommitMessage(modification);
      
      expect(result.message).toContain('BREAKING CHANGE:');
      expect(result.message).toContain('Users relying on these commands');
      expect(result.breakingChanges).toHaveLength(1);
    });

    test('should include metadata in commit message', async () => {
      const modification = {
        componentType: 'task',
        componentName: 'test-task',
        originalContent: '# Task\n## Purpose\nOld purpose',
        modifiedContent: '# Task\n## Purpose\nNew purpose',
        metadata: {
          approvedBy: 'user-123',
          reason: 'Improve clarity',
          impact: 'Minor update to task description'
        }
      };

      const result = await generator.generateCommitMessage(modification);
      
      expect(result.message).toContain('Reason: Improve clarity');
      expect(result.message).toContain('Impact: Minor update');
      expect(result.message).toContain('Approved-by: user-123');
      expect(result.message).toContain('Generated-by: aios-developer meta-agent');
    });
  });

  describe('analyzeModification', () => {
    test('should analyze agent modifications', async () => {
      const originalAgent = `---
name: test-agent
commands:
  help: "Show help"
  test: "Run test"
---
# Test Agent`;

      const modifiedAgent = `---
name: test-agent
commands:
  help: "Show help"
  test: "Run test"
  new: "New command"
---
# Test Agent`;

      mockDiffGenerator.generateUnifiedDiff.mockReturnValue(`
+  new: "New command"`);

      const analysis = await generator.analyzeModification('agent', originalAgent, modifiedAgent);
      
      expect(analysis.componentType).toBe('agent');
      expect(analysis.statistics.linesAdded).toBeGreaterThan(0);
      expect(analysis.semanticChanges).toContainEqual({
        type: 'commands_added',
        items: ['new']
      });
    });

    test('should analyze task modifications', async () => {
      const originalTask = `# Task
## Purpose
Original purpose
## Task Execution
### 1. Step one
Do something`;

      const modifiedTask = `# Task
## Purpose
Updated purpose
## Task Execution
### 1. Step one
Do something
### 2. Step two
Do more`;

      const analysis = await generator.analyzeModification('task', originalTask, modifiedTask);
      
      expect(analysis.semanticChanges).toContainEqual({
        type: 'section_modified',
        section: 'Purpose',
        contentChanged: true
      });
      expect(analysis.semanticChanges).toContainEqual({
        type: 'steps_changed',
        from: 1,
        to: 2
      });
    });

    test('should analyze workflow modifications', async () => {
      const originalWorkflow = yaml.dump({
        name: 'test-workflow',
        phases: {
          planning: { sequence: 1, agents: ['pm'] },
          development: { sequence: 2, agents: ['dev'] }
        }
      });

      const modifiedWorkflow = yaml.dump({
        name: 'test-workflow',
        phases: {
          planning: { sequence: 1, agents: ['pm'] },
          development: { sequence: 2, agents: ['dev', 'qa'] },
          testing: { sequence: 3, agents: ['qa'] }
        }
      });

      const analysis = await generator.analyzeModification('workflow', originalWorkflow, modifiedWorkflow);
      
      expect(analysis.semanticChanges).toContainEqual({
        type: 'phases_added',
        items: ['testing']
      });
      expect(analysis.semanticChanges).toContainEqual(
        expect.objectContaining({
          type: 'phase_modified',
          phase: 'development'
        })
      );
    });
  });

  describe('determineCommitType', () => {
    test('should determine type from user intent', () => {
      const analysis = { semanticChanges: [] };
      
      expect(generator.determineCommitType(analysis, 'add new feature')).toBe('feat');
      expect(generator.determineCommitType(analysis, 'fix bug in agent')).toBe('fix');
      expect(generator.determineCommitType(analysis, 'refactor code')).toBe('refactor');
      expect(generator.determineCommitType(analysis, 'optimize performance')).toBe('perf');
      expect(generator.determineCommitType(analysis, 'update documentation')).toBe('docs');
    });

    test('should determine type from semantic changes', () => {
      const analysis = {
        semanticChanges: [{ type: 'commands_added', items: ['test'] }],
        changeType: 'addition'
      };
      
      expect(generator.determineCommitType(analysis, '')).toBe('feat');
    });

    test('should default to chore for unclear changes', () => {
      const analysis = {
        semanticChanges: [],
        changeType: 'modification'
      };
      
      expect(generator.determineCommitType(analysis, '')).toBe('chore');
    });
  });

  describe('generateSummary', () => {
    test('should use user intent if concise', () => {
      const analysis = { semanticChanges: [] };
      const summary = generator.generateSummary(
        'agent',
        'test-agent',
        'update',
        analysis,
        'update agent metadata'
      );
      
      expect(summary).toBe('update agent metadata');
    });

    test('should generate summary from semantic changes', () => {
      const analysis = {
        semanticChanges: [{
          type: 'commands_added',
          items: ['help', 'test']
        }]
      };
      
      const summary = generator.generateSummary(
        'agent',
        'test-agent',
        'enhance',
        analysis,
        ''
      );
      
      expect(summary).toBe('add help, test commands');
    });

    test('should handle single item changes', () => {
      const analysis = {
        semanticChanges: [{
          type: 'phases_removed',
          items: ['testing']
        }]
      };
      
      const summary = generator.generateSummary(
        'workflow',
        'test-workflow',
        'update',
        analysis,
        ''
      );
      
      expect(summary).toBe('remove testing phase');
    });
  });

  describe('generateBatchCommitMessage', () => {
    test('should generate message for multiple modifications', async () => {
      const modifications = [
        {
          componentType: 'agent',
          componentName: 'agent1',
          originalContent: '---\nname: agent1\n---\n# Agent 1',
          modifiedContent: '---\nname: agent1\ntitle: Agent 1\n---\n# Agent 1'
        },
        {
          componentType: 'task',
          componentName: 'task1',
          originalContent: '# Task 1\n## Purpose\nOld',
          modifiedContent: '# Task 1\n## Purpose\nNew'
        }
      ];

      const result = await generator.generateBatchCommitMessage(modifications);
      
      expect(result.message).toContain('chore: batch update 2 components');
      expect(result.message).toContain('- agent: ');
      expect(result.message).toContain('- task: ');
      expect(result.message).toContain('Summary:');
      expect(result.message).toContain('- 1 agent(s)');
      expect(result.message).toContain('- 1 task(s)');
    });

    test('should handle breaking changes in batch', async () => {
      mockValidator.validateModification.mockResolvedValue({
        valid: true,
        breakingChanges: [{
          type: 'removed_commands',
          impact: 'Breaking change detected'
        }]
      });

      const modifications = [{
        componentType: 'agent',
        componentName: 'agent1',
        originalContent: '---\nname: test\n---\n',
        modifiedContent: '---\nname: test\n---\n'
      }];

      const result = await generator.generateBatchCommitMessage(modifications);
      
      expect(result.message).toContain('feat!: batch update');
      expect(result.message).toContain('BREAKING CHANGES:');
      expect(result.message).toContain('Breaking change detected');
    });
  });

  describe('suggestImprovements', () => {
    test('should validate conventional commit format', () => {
      const result = generator.suggestImprovements('Add new feature');
      
      expect(result.valid).toBe(false);
      expect(result.suggestions).toContainEqual(
        expect.objectContaining({
          type: 'format',
          issue: 'Header doesn\'t follow conventional format'
        })
      );
    });

    test('should check subject capitalization', () => {
      const result = generator.suggestImprovements('feat(agent): Add new command');
      
      expect(result.suggestions).toContainEqual(
        expect.objectContaining({
          type: 'case',
          issue: 'Subject should not be capitalized'
        })
      );
    });

    test('should check subject punctuation', () => {
      const result = generator.suggestImprovements('feat(agent): add new command.');
      
      expect(result.suggestions).toContainEqual(
        expect.objectContaining({
          type: 'punctuation',
          issue: 'Subject should not end with period'
        })
      );
    });

    test('should check subject length', () => {
      const longSubject = 'a'.repeat(60);
      const result = generator.suggestImprovements(`feat(agent): ${longSubject}`);
      
      expect(result.suggestions).toContainEqual(
        expect.objectContaining({
          type: 'length',
          issue: 'Subject line too long'
        })
      );
    });

    test('should validate proper format', () => {
      const message = `feat(agent): add new command

This adds a new help command to the agent.

BREAKING CHANGE: Removed old command`;

      const result = generator.suggestImprovements(message);
      
      expect(result.valid).toBe(true);
      expect(result.suggestions).toHaveLength(0);
    });

    test('should apply improvements', () => {
      const message = 'feat(agent): Add new command.';
      const result = generator.suggestImprovements(message);
      
      expect(result.improvedMessage).toBe('feat(agent): add new command');
    });
  });

  describe('Utility methods', () => {
    test('should parse agent content correctly', () => {
      const content = `---
name: test
id: test
---

# Test Agent

Content here`;

      const parsed = generator.parseAgentContent(content);
      
      expect(parsed.yaml).toContain('name: test');
      expect(parsed.markdown).toContain('# Test Agent');
    });

    test('should extract sections from markdown', () => {
      const content = `# Document
## Section 1
Content 1
## Section 2
Content 2`;

      const section = generator.extractSection(content, '## Section 1');
      
      expect(section).toContain('## Section 1');
      expect(section).toContain('Content 1');
      expect(section).not.toContain('Content 2');
    });

    test('should compare dependencies', () => {
      const original = {
        tasks: ['task1.md', 'task2.md'],
        agents: ['agent1.md']
      };
      
      const modified = {
        tasks: ['task1.md', 'task3.md'],
        agents: ['agent1.md', 'agent2.md']
      };
      
      const changes = generator.compareDependencies(original, modified);
      
      expect(changes).toContainEqual({
        type: 'tasks_dependencies_added',
        items: ['task3.md']
      });
      expect(changes).toContainEqual({
        type: 'tasks_dependencies_removed',
        items: ['task2.md']
      });
      expect(changes).toContainEqual({
        type: 'agents_dependencies_added',
        items: ['agent2.md']
      });
    });
  });
});