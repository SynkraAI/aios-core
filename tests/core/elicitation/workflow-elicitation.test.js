/**
 * Unit tests for workflow-elicitation module
 *
 * Tests the workflow elicitation steps configuration including
 * structure validation, conditional logic, and input validators.
 */

const workflowElicitationSteps = require('../../../.aios-core/core/elicitation/workflow-elicitation');

describe('workflow-elicitation', () => {
  // ============================================================
  // Structure
  // ============================================================
  describe('structure', () => {
    test('exports an array of steps', () => {
      expect(Array.isArray(workflowElicitationSteps)).toBe(true);
      expect(workflowElicitationSteps.length).toBeGreaterThan(0);
    });

    test('each step has title and description', () => {
      for (const step of workflowElicitationSteps) {
        expect(typeof step.title).toBe('string');
        expect(typeof step.description).toBe('string');
      }
    });

    test('each step has questions array', () => {
      for (const step of workflowElicitationSteps) {
        expect(Array.isArray(step.questions)).toBe(true);
      }
    });

    test('each question has type, name, and message', () => {
      for (const step of workflowElicitationSteps) {
        for (const q of step.questions) {
          expect(typeof q.type).toBe('string');
          expect(typeof q.name).toBe('string');
          expect(typeof q.message).toBe('string');
        }
      }
    });
  });

  // ============================================================
  // Step 1: Target Context
  // ============================================================
  describe('Target Context step', () => {
    const step = workflowElicitationSteps[0];

    test('has targetContext and squadName questions', () => {
      const names = step.questions.map(q => q.name);
      expect(names).toContain('targetContext');
      expect(names).toContain('squadName');
    });

    test('targetContext has core, squad, hybrid choices', () => {
      const q = step.questions.find(q => q.name === 'targetContext');
      const values = q.choices.map(c => c.value);
      expect(values).toContain('core');
      expect(values).toContain('squad');
      expect(values).toContain('hybrid');
    });

    test('squadName is only shown for squad or hybrid context', () => {
      const q = step.questions.find(q => q.name === 'squadName');
      expect(q.when({ targetContext: 'squad' })).toBe(true);
      expect(q.when({ targetContext: 'hybrid' })).toBe(true);
      expect(q.when({ targetContext: 'core' })).toBe(false);
    });

    test('squadName validation rejects empty input', () => {
      const q = step.questions.find(q => q.name === 'squadName');
      expect(q.validate('')).toContain('required');
    });

    test('squadName validation rejects uppercase', () => {
      const q = step.questions.find(q => q.name === 'squadName');
      expect(q.validate('MySquad')).toContain('kebab-case');
    });

    test('squadName validation accepts valid kebab-case', () => {
      const q = step.questions.find(q => q.name === 'squadName');
      expect(q.validate('my-squad')).toBe(true);
    });

    test('targetContext is required', () => {
      expect(step.required).toContain('targetContext');
    });
  });

  // ============================================================
  // Step 2: Basic Workflow Information
  // ============================================================
  describe('Basic Workflow Information step', () => {
    const step = workflowElicitationSteps[1];

    test('workflowId validation rejects empty', () => {
      const q = step.questions.find(q => q.name === 'workflowId');
      expect(q.validate('')).toContain('required');
    });

    test('workflowId validation rejects uppercase', () => {
      const q = step.questions.find(q => q.name === 'workflowId');
      expect(q.validate('MyWorkflow')).toContain('lowercase');
    });

    test('workflowId validation accepts valid id', () => {
      const q = step.questions.find(q => q.name === 'workflowId');
      expect(q.validate('data-pipeline')).toBe(true);
    });

    test('workflowName has smartDefault transform', () => {
      const q = step.questions.find(q => q.name === 'workflowName');
      expect(q.smartDefault.type).toBe('fromAnswer');
      expect(q.smartDefault.transform('data-pipeline')).toBe('Data Pipeline');
    });

    test('workflowDescription validation requires min length', () => {
      const q = step.questions.find(q => q.name === 'workflowDescription');
      expect(q.validate('short')).toContain('detailed');
      expect(q.validate('This is a sufficiently long description for a workflow')).toBe(true);
    });

    test('workflowType has sequential, parallel, conditional, hybrid', () => {
      const q = step.questions.find(q => q.name === 'workflowType');
      const values = q.choices.map(c => c.value);
      expect(values).toEqual(['sequential', 'parallel', 'conditional', 'hybrid']);
    });

    test('has required fields', () => {
      expect(step.required).toContain('workflowId');
      expect(step.required).toContain('workflowName');
      expect(step.required).toContain('workflowDescription');
      expect(step.required).toContain('workflowType');
    });
  });

  // ============================================================
  // Step 3: Workflow Triggers
  // ============================================================
  describe('Workflow Triggers step', () => {
    const step = workflowElicitationSteps[2];

    test('triggerTypes has all trigger options', () => {
      const q = step.questions.find(q => q.name === 'triggerTypes');
      const values = q.choices.map(c => c.value);
      expect(values).toContain('manual');
      expect(values).toContain('schedule');
      expect(values).toContain('event');
      expect(values).toContain('webhook');
    });

    test('schedulePattern shown only for schedule trigger', () => {
      const q = step.questions.find(q => q.name === 'schedulePattern');
      expect(q.when({ triggerTypes: ['schedule'] })).toBe(true);
      expect(q.when({ triggerTypes: ['manual'] })).toBe(false);
    });

    test('eventTriggers shown only for event trigger', () => {
      const q = step.questions.find(q => q.name === 'eventTriggers');
      expect(q.when({ triggerTypes: ['event'] })).toBe(true);
      expect(q.when({ triggerTypes: ['manual'] })).toBe(false);
    });

    test('eventTriggers filter splits comma-separated input', () => {
      const q = step.questions.find(q => q.name === 'eventTriggers');
      expect(q.filter('file.created, task.completed')).toEqual(['file.created', 'task.completed']);
    });

    test('eventTriggers filter handles empty input', () => {
      const q = step.questions.find(q => q.name === 'eventTriggers');
      expect(q.filter('')).toEqual([]);
    });
  });

  // ============================================================
  // Step 4: Workflow Inputs
  // ============================================================
  describe('Workflow Inputs step', () => {
    const step = workflowElicitationSteps[3];

    test('inputCount validation accepts valid range', () => {
      const q = step.questions.find(q => q.name === 'inputCount');
      expect(q.validate('5')).toBe(true);
      expect(q.validate('1')).toBe(true);
      expect(q.validate('10')).toBe(true);
    });

    test('inputCount validation rejects out of range', () => {
      const q = step.questions.find(q => q.name === 'inputCount');
      expect(q.validate('0')).toContain('1-10');
      expect(q.validate('11')).toContain('1-10');
    });

    test('inputCount filter converts to integer', () => {
      const q = step.questions.find(q => q.name === 'inputCount');
      expect(q.filter('5')).toBe(5);
    });

    test('inputCount shown only when hasInputs', () => {
      const q = step.questions.find(q => q.name === 'inputCount');
      expect(q.when({ hasInputs: true })).toBe(true);
      expect(q.when({ hasInputs: false })).toBe(false);
    });
  });

  // ============================================================
  // Step 5: Workflow Steps
  // ============================================================
  describe('Workflow Steps step', () => {
    const step = workflowElicitationSteps[4];

    test('stepCount validation accepts 1-20', () => {
      const q = step.questions.find(q => q.name === 'stepCount');
      expect(q.validate('1')).toBe(true);
      expect(q.validate('20')).toBe(true);
      expect(q.validate('0')).toContain('1-20');
      expect(q.validate('21')).toContain('1-20');
    });

    test('stepDefinitionMethod has quick, detailed, import', () => {
      const q = step.questions.find(q => q.name === 'stepDefinitionMethod');
      const values = q.choices.map(c => c.value);
      expect(values).toEqual(['quick', 'detailed', 'import']);
    });
  });

  // ============================================================
  // Step 6: Step Dependencies & Flow
  // ============================================================
  describe('Step Dependencies step', () => {
    const step = workflowElicitationSteps[5];

    test('has condition for non-sequential workflows', () => {
      expect(step.condition).toBeDefined();
      expect(step.condition.field).toBe('workflowType');
      expect(step.condition.operator).toBe('notEquals');
      expect(step.condition.value).toBe('sequential');
    });

    test('maxParallel validation accepts 1-10', () => {
      const q = step.questions.find(q => q.name === 'maxParallel');
      expect(q.validate('1')).toBe(true);
      expect(q.validate('10')).toBe(true);
      expect(q.validate('0')).toContain('1-10');
    });

    test('allowParallel shown only for non-sequential', () => {
      const q = step.questions.find(q => q.name === 'allowParallel');
      expect(q.when({ workflowType: 'parallel' })).toBe(true);
      expect(q.when({ workflowType: 'sequential' })).toBe(false);
    });
  });

  // ============================================================
  // Step 7: Error Handling
  // ============================================================
  describe('Error Handling step', () => {
    const step = workflowElicitationSteps[6];

    test('globalErrorStrategy has abort, continue, rollback, compensate', () => {
      const q = step.questions.find(q => q.name === 'globalErrorStrategy');
      const values = q.choices.map(c => c.value);
      expect(values).toEqual(['abort', 'continue', 'rollback', 'compensate']);
    });

    test('notificationEvents shown when notifications enabled', () => {
      const q = step.questions.find(q => q.name === 'notificationEvents');
      expect(q.when({ enableNotifications: true })).toBe(true);
      expect(q.when({ enableNotifications: false })).toBe(false);
    });
  });

  // ============================================================
  // Step 8: Outputs
  // ============================================================
  describe('Outputs step', () => {
    const step = workflowElicitationSteps[7];

    test('outputDescription validation requires min length', () => {
      const q = step.questions.find(q => q.name === 'outputDescription');
      expect(q.validate('short')).toContain('describe');
      expect(q.validate('A detailed description of the output')).toBe(true);
    });

    test('outputDescription is required', () => {
      expect(step.required).toContain('outputDescription');
    });
  });

  // ============================================================
  // Step 9: Security
  // ============================================================
  describe('Security step', () => {
    const step = workflowElicitationSteps[8];

    test('allowedRoles shown when auth required', () => {
      const q = step.questions.find(q => q.name === 'allowedRoles');
      expect(q.when({ requireAuth: true })).toBe(true);
      expect(q.when({ requireAuth: false })).toBe(false);
    });

    test('securityFeatures shown when auth required', () => {
      const q = step.questions.find(q => q.name === 'securityFeatures');
      expect(q.when({ requireAuth: true })).toBe(true);
      expect(q.when({ requireAuth: false })).toBe(false);
    });

    test('allowedRoles includes admin and developer', () => {
      const q = step.questions.find(q => q.name === 'allowedRoles');
      expect(q.choices).toContain('admin');
      expect(q.choices).toContain('developer');
    });
  });
});
