/**
 * Unit tests for agent-elicitation module
 *
 * Tests the agent elicitation steps configuration including
 * structure validation, validators, filters, and conditionals.
 */

const agentElicitationSteps = require('../../../.aios-core/core/elicitation/agent-elicitation');

describe('agent-elicitation', () => {
  // ============================================================
  // Structure
  // ============================================================
  describe('structure', () => {
    test('exports an array of steps', () => {
      expect(Array.isArray(agentElicitationSteps)).toBe(true);
      expect(agentElicitationSteps.length).toBe(6);
    });

    test('each step has title, description, and questions', () => {
      for (const step of agentElicitationSteps) {
        expect(typeof step.title).toBe('string');
        expect(typeof step.description).toBe('string');
        expect(Array.isArray(step.questions)).toBe(true);
      }
    });
  });

  // ============================================================
  // Step 1: Basic Agent Information
  // ============================================================
  describe('Basic Agent Information', () => {
    const step = agentElicitationSteps[0];

    test('agentName validation rejects empty', () => {
      const q = step.questions.find(q => q.name === 'agentName');
      expect(q.validate('')).toContain('required');
    });

    test('agentName validation rejects uppercase', () => {
      const q = step.questions.find(q => q.name === 'agentName');
      expect(q.validate('MyAgent')).toContain('lowercase');
    });

    test('agentName validation accepts kebab-case', () => {
      const q = step.questions.find(q => q.name === 'agentName');
      expect(q.validate('data-analyst')).toBe(true);
    });

    test('agentTitle smartDefault transforms name to title', () => {
      const q = step.questions.find(q => q.name === 'agentTitle');
      expect(q.smartDefault.transform('code-reviewer')).toBe('Code Reviewer');
    });

    test('has required fields', () => {
      expect(step.required).toContain('agentName');
      expect(step.required).toContain('agentTitle');
      expect(step.required).toContain('whenToUse');
    });
  });

  // ============================================================
  // Step 2: Agent Persona & Style
  // ============================================================
  describe('Agent Persona & Style', () => {
    const step = agentElicitationSteps[1];

    test('personaFocusCustom shown when Other selected', () => {
      const q = step.questions.find(q => q.name === 'personaFocusCustom');
      expect(q.when({ personaFocus: 'Other (specify)' })).toBe(true);
      expect(q.when({ personaFocus: 'Technical implementation' })).toBe(false);
    });

    test('has required persona fields', () => {
      expect(step.required).toContain('personaRole');
      expect(step.required).toContain('personaStyle');
      expect(step.required).toContain('personaIdentity');
    });

    test('personaFocus has expected choices', () => {
      const q = step.questions.find(q => q.name === 'personaFocus');
      expect(q.choices).toContain('Technical implementation');
      expect(q.choices).toContain('Analysis and insights');
      expect(q.choices).toContain('Quality and standards');
    });
  });

  // ============================================================
  // Step 3: Agent Commands
  // ============================================================
  describe('Agent Commands', () => {
    const step = agentElicitationSteps[2];

    test('standardCommands has common actions', () => {
      const q = step.questions.find(q => q.name === 'standardCommands');
      const values = q.choices.map(c => c.value);
      expect(values).toContain('analyze');
      expect(values).toContain('create');
      expect(values).toContain('review');
      expect(values).toContain('validate');
    });

    test('customCommands shown when addCustomCommands is true', () => {
      const q = step.questions.find(q => q.name === 'customCommands');
      expect(q.when({ addCustomCommands: true })).toBe(true);
      expect(q.when({ addCustomCommands: false })).toBe(false);
    });

    test('customCommands filter splits comma-separated', () => {
      const q = step.questions.find(q => q.name === 'customCommands');
      expect(q.filter('optimize:Optimize, debug:Debug')).toEqual(['optimize:Optimize', 'debug:Debug']);
    });
  });

  // ============================================================
  // Step 4: Dependencies & Resources
  // ============================================================
  describe('Dependencies & Resources', () => {
    const step = agentElicitationSteps[3];

    test('dependencyTypes has tasks, templates, checklists, data', () => {
      const q = step.questions.find(q => q.name === 'dependencyTypes');
      const values = q.choices.map(c => c.value);
      expect(values).toEqual(['tasks', 'templates', 'checklists', 'data']);
    });

    test('taskDependencies shown when tasks selected', () => {
      const q = step.questions.find(q => q.name === 'taskDependencies');
      expect(q.when({ dependencyTypes: ['tasks'] })).toBe(true);
      expect(q.when({ dependencyTypes: ['templates'] })).toBe(false);
    });

    test('taskDependencies filter splits comma-separated', () => {
      const q = step.questions.find(q => q.name === 'taskDependencies');
      expect(q.filter('task1.md, task2.md')).toEqual(['task1.md', 'task2.md']);
      expect(q.filter('')).toEqual([]);
    });

    test('templateDependencies shown when templates selected', () => {
      const q = step.questions.find(q => q.name === 'templateDependencies');
      expect(q.when({ dependencyTypes: ['templates'] })).toBe(true);
      expect(q.when({ dependencyTypes: ['data'] })).toBe(false);
    });

    test('templateDependencies filter handles empty', () => {
      const q = step.questions.find(q => q.name === 'templateDependencies');
      expect(q.filter('')).toEqual([]);
    });
  });

  // ============================================================
  // Step 5: Security & Access Control
  // ============================================================
  describe('Security & Access Control', () => {
    const step = agentElicitationSteps[4];

    test('has condition for agentName existence', () => {
      expect(step.condition).toEqual({ field: 'agentName', operator: 'exists' });
    });

    test('securityLevel has standard, elevated, restricted, custom', () => {
      const q = step.questions.find(q => q.name === 'securityLevel');
      const values = q.choices.map(c => c.value);
      expect(values).toEqual(['standard', 'elevated', 'restricted', 'custom']);
    });

    test('requireAuthorization hidden for standard level', () => {
      const q = step.questions.find(q => q.name === 'requireAuthorization');
      expect(q.when({ securityLevel: 'standard' })).toBe(false);
      expect(q.when({ securityLevel: 'elevated' })).toBe(true);
    });

    test('enableAuditLogging hidden for standard level', () => {
      const q = step.questions.find(q => q.name === 'enableAuditLogging');
      expect(q.when({ securityLevel: 'standard' })).toBe(false);
      expect(q.when({ securityLevel: 'restricted' })).toBe(true);
    });

    test('allowedOperations shown only for custom level', () => {
      const q = step.questions.find(q => q.name === 'allowedOperations');
      expect(q.when({ securityLevel: 'custom' })).toBe(true);
      expect(q.when({ securityLevel: 'elevated' })).toBe(false);
    });

    test('allowedOperations has file and system operations', () => {
      const q = step.questions.find(q => q.name === 'allowedOperations');
      expect(q.choices).toContain('file_read');
      expect(q.choices).toContain('file_write');
      expect(q.choices).toContain('execute_commands');
      expect(q.choices).toContain('network_access');
    });
  });

  // ============================================================
  // Step 6: Advanced Options
  // ============================================================
  describe('Advanced Options', () => {
    const step = agentElicitationSteps[5];

    test('has condition for non-standard security', () => {
      expect(step.condition).toEqual({
        field: 'securityLevel',
        operator: 'notEquals',
        value: 'standard',
      });
    });

    test('corePrinciples filter splits comma-separated', () => {
      const q = step.questions.find(q => q.name === 'corePrinciples');
      expect(q.filter('validate data, follow security')).toEqual(['validate data', 'follow security']);
      expect(q.filter('')).toEqual([]);
    });

    test('has enableMemoryLayer question', () => {
      const q = step.questions.find(q => q.name === 'enableMemoryLayer');
      expect(q.type).toBe('confirm');
      expect(q.default).toBe(true);
    });
  });
});
