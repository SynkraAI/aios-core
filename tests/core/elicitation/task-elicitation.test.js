/**
 * Unit tests for task-elicitation module
 *
 * Tests the task elicitation steps configuration including
 * structure validation, validators, filters, and conditionals.
 */

const taskElicitationSteps = require('../../../.aios-core/core/elicitation/task-elicitation');

describe('task-elicitation', () => {
  // ============================================================
  // Structure
  // ============================================================
  describe('structure', () => {
    test('exports an array of steps', () => {
      expect(Array.isArray(taskElicitationSteps)).toBe(true);
      expect(taskElicitationSteps.length).toBeGreaterThan(0);
    });

    test('each step has title and description', () => {
      for (const step of taskElicitationSteps) {
        expect(typeof step.title).toBe('string');
        expect(typeof step.description).toBe('string');
      }
    });

    test('each step has questions array', () => {
      for (const step of taskElicitationSteps) {
        expect(Array.isArray(step.questions)).toBe(true);
      }
    });
  });

  // ============================================================
  // Step 1: Basic Task Information
  // ============================================================
  describe('Basic Task Information', () => {
    const step = taskElicitationSteps[0];

    test('taskId validation rejects empty', () => {
      const q = step.questions.find(q => q.name === 'taskId');
      expect(q.validate('')).toContain('required');
    });

    test('taskId validation rejects uppercase', () => {
      const q = step.questions.find(q => q.name === 'taskId');
      expect(q.validate('MyTask')).toContain('lowercase');
    });

    test('taskId validation accepts valid kebab-case', () => {
      const q = step.questions.find(q => q.name === 'taskId');
      expect(q.validate('analyze-data')).toBe(true);
    });

    test('taskTitle smartDefault transforms id to title case', () => {
      const q = step.questions.find(q => q.name === 'taskTitle');
      expect(q.smartDefault.transform('analyze-data')).toBe('Analyze Data');
      expect(q.smartDefault.transform('generate-report')).toBe('Generate Report');
    });

    test('taskDescription validation requires min length', () => {
      const q = step.questions.find(q => q.name === 'taskDescription');
      expect(q.validate('short')).toContain('meaningful');
      expect(q.validate('This is a meaningful task description')).toBe(true);
    });

    test('has all required fields', () => {
      expect(step.required).toContain('taskId');
      expect(step.required).toContain('taskTitle');
      expect(step.required).toContain('agentName');
      expect(step.required).toContain('taskDescription');
    });
  });

  // ============================================================
  // Step 2: Task Context & Prerequisites
  // ============================================================
  describe('Task Context & Prerequisites', () => {
    const step = taskElicitationSteps[1];

    test('contextDescription shown when requiresContext is true', () => {
      const q = step.questions.find(q => q.name === 'contextDescription');
      expect(q.when({ requiresContext: true })).toBe(true);
      expect(q.when({ requiresContext: false })).toBe(false);
    });

    test('prerequisites has common options', () => {
      const q = step.questions.find(q => q.name === 'prerequisites');
      expect(q.choices).toContain('Valid file path provided');
      expect(q.choices).toContain('Dependencies installed');
    });

    test('customPrerequisites filter splits comma-separated', () => {
      const q = step.questions.find(q => q.name === 'customPrerequisites');
      expect(q.filter('API key, Database access')).toEqual(['API key', 'Database access']);
    });

    test('customPrerequisites filter handles empty', () => {
      const q = step.questions.find(q => q.name === 'customPrerequisites');
      expect(q.filter('')).toEqual([]);
    });
  });

  // ============================================================
  // Step 3: Task Workflow
  // ============================================================
  describe('Task Workflow', () => {
    const step = taskElicitationSteps[2];

    test('workflowType has sequential, conditional, iterative, parallel', () => {
      const q = step.questions.find(q => q.name === 'workflowType');
      const values = q.choices.map(c => c.value);
      expect(values).toEqual(['sequential', 'conditional', 'iterative', 'parallel']);
    });

    test('stepCount validation accepts 1-10', () => {
      const q = step.questions.find(q => q.name === 'stepCount');
      expect(q.validate('1')).toBe(true);
      expect(q.validate('10')).toBe(true);
    });

    test('stepCount validation rejects out of range', () => {
      const q = step.questions.find(q => q.name === 'stepCount');
      expect(q.validate('0')).toContain('1 and 10');
      expect(q.validate('11')).toContain('1 and 10');
    });

    test('stepCount filter converts to integer', () => {
      const q = step.questions.find(q => q.name === 'stepCount');
      expect(q.filter('5')).toBe(5);
    });
  });

  // ============================================================
  // Step 4: Define Task Steps
  // ============================================================
  describe('Define Task Steps', () => {
    const step = taskElicitationSteps[3];

    test('has validators array', () => {
      expect(Array.isArray(step.validators)).toBe(true);
    });

    test('custom validator returns true', () => {
      const validator = step.validators[0];
      expect(validator.validate({})).toBe(true);
    });
  });

  // ============================================================
  // Step 5: Output & Success Criteria
  // ============================================================
  describe('Output & Success Criteria', () => {
    const step = taskElicitationSteps[4];

    test('outputFormat has common formats', () => {
      const q = step.questions.find(q => q.name === 'outputFormat');
      expect(q.choices).toContain('JSON');
      expect(q.choices).toContain('YAML');
      expect(q.choices).toContain('CSV');
    });

    test('outputFormatCustom shown when Other selected', () => {
      const q = step.questions.find(q => q.name === 'outputFormatCustom');
      expect(q.when({ outputFormat: 'Other' })).toBe(true);
      expect(q.when({ outputFormat: 'JSON' })).toBe(false);
    });

    test('outputDescription is required', () => {
      expect(step.required).toContain('outputDescription');
    });
  });

  // ============================================================
  // Step 6: Error Handling
  // ============================================================
  describe('Error Handling', () => {
    const step = taskElicitationSteps[5];

    test('errorStrategy has fail-fast, collect, retry, fallback', () => {
      const q = step.questions.find(q => q.name === 'errorStrategy');
      const values = q.choices.map(c => c.value);
      expect(values).toEqual(['fail-fast', 'collect', 'retry', 'fallback']);
    });

    test('retryCount shown only for retry strategy', () => {
      const q = step.questions.find(q => q.name === 'retryCount');
      expect(q.when({ errorStrategy: 'retry' })).toBe(true);
      expect(q.when({ errorStrategy: 'fail-fast' })).toBe(false);
    });

    test('retryCount validation accepts 1-5', () => {
      const q = step.questions.find(q => q.name === 'retryCount');
      expect(q.validate('1')).toBe(true);
      expect(q.validate('5')).toBe(true);
      expect(q.validate('0')).toContain('1-5');
      expect(q.validate('6')).toContain('1-5');
    });
  });

  // ============================================================
  // Step 7: Security & Validation
  // ============================================================
  describe('Security & Validation', () => {
    const step = taskElicitationSteps[6];

    test('has condition for taskId existence', () => {
      expect(step.condition).toEqual({ field: 'taskId', operator: 'exists' });
    });

    test('securityChecks shown when enabled', () => {
      const q = step.questions.find(q => q.name === 'securityChecks');
      expect(q.when({ enableSecurityChecks: true })).toBe(true);
      expect(q.when({ enableSecurityChecks: false })).toBe(false);
    });

    test('securityChecks includes OWASP-relevant options', () => {
      const q = step.questions.find(q => q.name === 'securityChecks');
      expect(q.choices).toContain('Input sanitization');
      expect(q.choices).toContain('Path traversal prevention');
      expect(q.choices).toContain('Command injection prevention');
    });
  });
});
