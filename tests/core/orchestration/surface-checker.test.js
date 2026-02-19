/**
 * Unit tests for surface-checker module
 *
 * Tests the SurfaceChecker class that determines when Bob should
 * surface to ask the human for decisions.
 */

jest.mock('fs');
jest.mock('js-yaml');

const fs = require('fs');
const yaml = require('js-yaml');

const { SurfaceChecker, createSurfaceChecker, shouldSurface } = require('../../../.aios-core/core/orchestration/surface-checker');

const MOCK_CRITERIA = {
  version: '1.0.0',
  metadata: { author: 'test', description: 'Test criteria' },
  evaluation_order: ['cost_threshold', 'high_risk', 'error_threshold'],
  criteria: {
    cost_threshold: {
      id: 'SURF-1',
      name: 'Cost Threshold',
      condition: 'estimated_cost > 10',
      action: 'confirm_cost',
      message: 'Estimated cost: $${estimated_cost}. Proceed?',
      severity: 'warning',
      bypass: true,
    },
    high_risk: {
      id: 'SURF-2',
      name: 'High Risk',
      condition: 'risk_level == "HIGH"',
      action: 'confirm_risk',
      message: 'High risk detected: ${risk_details}',
      severity: 'critical',
      bypass: false,
    },
    error_threshold: {
      id: 'SURF-3',
      name: 'Error Threshold',
      condition: 'errors_in_task >= 3',
      action: 'ask_help',
      message: 'Multiple errors: ${error_summary}',
      severity: 'warning',
    },
    destructive_actions: ['delete', 'drop', 'reset', 'force-push'],
  },
  actions: {
    confirm_cost: {
      type: 'confirm',
      prompt_type: 'yes_no',
      default: null,
      timeout_seconds: 120,
      on_timeout: 'abort',
    },
    confirm_risk: {
      type: 'explicit_confirm',
      prompt_type: 'text',
      required_input: 'CONFIRM',
      timeout_seconds: 300,
      on_timeout: 'abort',
    },
  },
};

describe('SurfaceChecker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ============================================================
  // Constructor and Loading
  // ============================================================
  describe('constructor', () => {
    test('sets default criteria path', () => {
      const checker = new SurfaceChecker();
      expect(checker.criteriaPath).toContain('bob-surface-criteria.yaml');
      expect(checker._loaded).toBe(false);
    });

    test('accepts custom criteria path', () => {
      const checker = new SurfaceChecker('/custom/path.yaml');
      expect(checker.criteriaPath).toBe('/custom/path.yaml');
    });
  });

  describe('load', () => {
    test('loads criteria from YAML file successfully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('yaml content');
      yaml.load.mockReturnValue(MOCK_CRITERIA);

      const checker = new SurfaceChecker('/test/criteria.yaml');
      const result = checker.load();

      expect(result).toBe(true);
      expect(checker._loaded).toBe(true);
      expect(checker.criteria).toEqual(MOCK_CRITERIA);
    });

    test('returns false when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const checker = new SurfaceChecker('/test/missing.yaml');
      const result = checker.load();

      expect(result).toBe(false);
      expect(checker._loaded).toBe(false);
    });

    test('returns false on parse error', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => { throw new Error('parse error'); });

      const checker = new SurfaceChecker('/test/bad.yaml');
      const result = checker.load();

      expect(result).toBe(false);
    });

    test('_ensureLoaded calls load if not loaded', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('yaml content');
      yaml.load.mockReturnValue(MOCK_CRITERIA);

      const checker = new SurfaceChecker('/test/criteria.yaml');
      checker._ensureLoaded();

      expect(checker._loaded).toBe(true);
    });
  });

  // ============================================================
  // Condition Evaluation
  // ============================================================
  describe('evaluateCondition', () => {
    let checker;

    beforeEach(() => {
      checker = new SurfaceChecker();
      checker.criteria = MOCK_CRITERIA;
      checker._loaded = true;
    });

    test('evaluates greater than (>) correctly', () => {
      expect(checker.evaluateCondition('estimated_cost > 10', { estimated_cost: 15 })).toBe(true);
      expect(checker.evaluateCondition('estimated_cost > 10', { estimated_cost: 5 })).toBe(false);
      expect(checker.evaluateCondition('estimated_cost > 10', { estimated_cost: 10 })).toBe(false);
    });

    test('evaluates greater than or equal (>=) correctly', () => {
      expect(checker.evaluateCondition('errors_in_task >= 3', { errors_in_task: 3 })).toBe(true);
      expect(checker.evaluateCondition('errors_in_task >= 3', { errors_in_task: 5 })).toBe(true);
      expect(checker.evaluateCondition('errors_in_task >= 3', { errors_in_task: 2 })).toBe(false);
    });

    test('evaluates less than (<) correctly', () => {
      expect(checker.evaluateCondition('score < 50', { score: 30 })).toBe(true);
      expect(checker.evaluateCondition('score < 50', { score: 50 })).toBe(false);
      expect(checker.evaluateCondition('score < 50', { score: 70 })).toBe(false);
    });

    test('evaluates less than or equal (<=) correctly', () => {
      expect(checker.evaluateCondition('score <= 50', { score: 50 })).toBe(true);
      expect(checker.evaluateCondition('score <= 50', { score: 30 })).toBe(true);
      expect(checker.evaluateCondition('score <= 50', { score: 70 })).toBe(false);
    });

    test('evaluates string equality (==) correctly', () => {
      expect(checker.evaluateCondition('risk_level == "HIGH"', { risk_level: 'HIGH' })).toBe(true);
      expect(checker.evaluateCondition('risk_level == "HIGH"', { risk_level: 'LOW' })).toBe(false);
    });

    test('evaluates numeric equality (==) correctly', () => {
      expect(checker.evaluateCondition('valid_options_count == 0', { valid_options_count: 0 })).toBe(true);
      expect(checker.evaluateCondition('valid_options_count == 0', { valid_options_count: 1 })).toBe(false);
    });

    test('evaluates IN operator correctly', () => {
      expect(checker.evaluateCondition('action_type IN destructive_actions', { action_type: 'delete' })).toBe(true);
      expect(checker.evaluateCondition('action_type IN destructive_actions', { action_type: 'create' })).toBe(false);
    });

    test('evaluates scope comparison correctly', () => {
      expect(checker.evaluateCondition('requested_scope > approved_scope', {
        scope_expanded: true,
      })).toBe(true);

      expect(checker.evaluateCondition('requested_scope > approved_scope', {
        requested_scope: 'full project',
        approved_scope: 'module',
      })).toBe(true);

      expect(checker.evaluateCondition('requested_scope > approved_scope', {
        requested_scope: 'a',
        approved_scope: 'longer scope',
      })).toBe(false);
    });

    test('evaluates OR conditions correctly', () => {
      expect(checker.evaluateCondition('score > 90 OR risk_level == "HIGH"', {
        score: 95, risk_level: 'LOW',
      })).toBe(true);

      expect(checker.evaluateCondition('score > 90 OR risk_level == "HIGH"', {
        score: 50, risk_level: 'HIGH',
      })).toBe(true);

      expect(checker.evaluateCondition('score > 90 OR risk_level == "HIGH"', {
        score: 50, risk_level: 'LOW',
      })).toBe(false);
    });

    test('evaluates AND conditions correctly', () => {
      expect(checker.evaluateCondition('score > 50 AND risk_level == "HIGH"', {
        score: 80, risk_level: 'HIGH',
      })).toBe(true);

      expect(checker.evaluateCondition('score > 50 AND risk_level == "HIGH"', {
        score: 80, risk_level: 'LOW',
      })).toBe(false);
    });

    test('evaluates boolean field check correctly', () => {
      expect(checker.evaluateCondition('requires_api_key', { requires_api_key: true })).toBe(true);
      expect(checker.evaluateCondition('requires_api_key', { requires_api_key: false })).toBe(false);
      expect(checker.evaluateCondition('requires_api_key', {})).toBe(false);
    });

    test('handles missing field with default 0 for numeric comparisons', () => {
      expect(checker.evaluateCondition('missing_field > 10', {})).toBe(false);
      expect(checker.evaluateCondition('missing_field >= 0', {})).toBe(true);
    });

    test('returns false for unknown condition format', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect(checker.evaluateCondition('invalid %%% condition', {})).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown condition'));
      consoleSpy.mockRestore();
    });

    test('evaluates float values correctly', () => {
      expect(checker.evaluateCondition('estimated_cost > 9.99', { estimated_cost: 10 })).toBe(true);
      expect(checker.evaluateCondition('estimated_cost > 10.5', { estimated_cost: 10 })).toBe(false);
    });
  });

  // ============================================================
  // Message Interpolation
  // ============================================================
  describe('interpolateMessage', () => {
    let checker;

    beforeEach(() => {
      checker = new SurfaceChecker();
    });

    test('interpolates simple variables', () => {
      const result = checker.interpolateMessage(
        'Error in ${action_description}',
        { action_description: 'file deletion' },
      );
      expect(result).toBe('Error in file deletion');
    });

    test('formats cost values with 2 decimal places', () => {
      const result = checker.interpolateMessage(
        'Estimated cost: $${estimated_cost}',
        { estimated_cost: 10.5 },
      );
      expect(result).toBe('Estimated cost: $10.50');
    });

    test('keeps placeholder when variable not in context', () => {
      const result = checker.interpolateMessage(
        'Missing: ${unknown_var}',
        {},
      );
      expect(result).toBe('Missing: ${unknown_var}');
    });

    test('handles null/undefined values', () => {
      const result = checker.interpolateMessage(
        'Value: ${field}',
        { field: null },
      );
      expect(result).toBe('Value: ');
    });

    test('handles empty template', () => {
      expect(checker.interpolateMessage('', {})).toBe('');
      expect(checker.interpolateMessage(null, {})).toBe('');
    });

    test('interpolates multiple variables', () => {
      const result = checker.interpolateMessage(
        '${action_type} on ${affected_files}',
        { action_type: 'delete', affected_files: 'src/index.js' },
      );
      expect(result).toBe('delete on src/index.js');
    });
  });

  // ============================================================
  // shouldSurface
  // ============================================================
  describe('shouldSurface', () => {
    let checker;

    beforeEach(() => {
      checker = new SurfaceChecker();
      checker.criteria = MOCK_CRITERIA;
      checker._loaded = true;
    });

    test('returns no-surface when no criteria match', () => {
      const result = checker.shouldSurface({ estimated_cost: 5, risk_level: 'LOW', errors_in_task: 0 });

      expect(result.should_surface).toBe(false);
      expect(result.criterion_id).toBeNull();
      expect(result.can_bypass).toBe(true);
    });

    test('returns surface result when cost threshold exceeded', () => {
      const result = checker.shouldSurface({ estimated_cost: 25 });

      expect(result.should_surface).toBe(true);
      expect(result.criterion_id).toBe('SURF-1');
      expect(result.criterion_name).toBe('Cost Threshold');
      expect(result.severity).toBe('warning');
      expect(result.message).toContain('25.00');
      expect(result.can_bypass).toBe(true);
    });

    test('returns surface result for high risk', () => {
      const result = checker.shouldSurface({ risk_level: 'HIGH', risk_details: 'data loss possible' });

      expect(result.should_surface).toBe(true);
      expect(result.criterion_id).toBe('SURF-2');
      expect(result.message).toContain('data loss possible');
      expect(result.can_bypass).toBe(false);
    });

    test('returns surface result for error threshold', () => {
      const result = checker.shouldSurface({ errors_in_task: 5, error_summary: '5 timeouts' });

      expect(result.should_surface).toBe(true);
      expect(result.criterion_id).toBe('SURF-3');
      expect(result.message).toContain('5 timeouts');
    });

    test('first match wins (evaluation order)', () => {
      // Both cost and error thresholds are exceeded, but cost comes first
      const result = checker.shouldSurface({ estimated_cost: 20, errors_in_task: 10 });

      expect(result.criterion_id).toBe('SURF-1');
    });

    test('returns no-surface when criteria not loaded', () => {
      checker.criteria = null;
      const result = checker.shouldSurface({});

      expect(result.should_surface).toBe(false);
    });

    test('uses Object.keys when no evaluation_order', () => {
      checker.criteria = {
        criteria: {
          test_criterion: {
            id: 'TEST-1',
            condition: 'score > 50',
            action: 'confirm',
            message: 'Score: ${score}',
          },
        },
      };

      const result = checker.shouldSurface({ score: 80 });

      expect(result.should_surface).toBe(true);
      expect(result.criterion_id).toBe('TEST-1');
    });

    test('skips non-criterion entries like arrays', () => {
      checker.criteria = {
        criteria: {
          destructive_actions: ['delete', 'drop'],  // array, not criterion
          test_criterion: {
            id: 'TEST-1',
            condition: 'score > 50',
            action: 'confirm',
            message: 'Test',
          },
        },
      };

      const result = checker.shouldSurface({ score: 80 });
      expect(result.should_surface).toBe(true);
    });
  });

  // ============================================================
  // Helper Methods
  // ============================================================
  describe('getActionConfig', () => {
    let checker;

    beforeEach(() => {
      checker = new SurfaceChecker();
      checker.criteria = MOCK_CRITERIA;
      checker._loaded = true;
    });

    test('returns action config when found', () => {
      const config = checker.getActionConfig('confirm_cost');
      expect(config.type).toBe('confirm');
      expect(config.timeout_seconds).toBe(120);
    });

    test('returns null for unknown action', () => {
      expect(checker.getActionConfig('unknown')).toBeNull();
    });

    test('returns null when criteria not loaded', () => {
      checker.criteria = null;
      expect(checker.getActionConfig('confirm_cost')).toBeNull();
    });
  });

  describe('getCriteria', () => {
    test('returns criteria definitions', () => {
      const checker = new SurfaceChecker();
      checker.criteria = MOCK_CRITERIA;
      checker._loaded = true;

      const criteria = checker.getCriteria();
      expect(criteria.cost_threshold).toBeDefined();
      expect(criteria.high_risk).toBeDefined();
    });

    test('returns empty object when no criteria', () => {
      const checker = new SurfaceChecker();
      checker.criteria = null;
      checker._loaded = true;

      expect(checker.getCriteria()).toEqual({});
    });
  });

  describe('getDestructiveActions', () => {
    test('returns destructive actions list', () => {
      const checker = new SurfaceChecker();
      checker.criteria = MOCK_CRITERIA;
      checker._loaded = true;

      const actions = checker.getDestructiveActions();
      expect(actions).toEqual(['delete', 'drop', 'reset', 'force-push']);
    });

    test('returns empty array when no criteria', () => {
      const checker = new SurfaceChecker();
      checker.criteria = null;
      checker._loaded = true;

      expect(checker.getDestructiveActions()).toEqual([]);
    });
  });

  describe('isDestructiveAction', () => {
    test('returns true for destructive actions', () => {
      const checker = new SurfaceChecker();
      checker.criteria = MOCK_CRITERIA;
      checker._loaded = true;

      expect(checker.isDestructiveAction('delete')).toBe(true);
      expect(checker.isDestructiveAction('force-push')).toBe(true);
    });

    test('returns false for non-destructive actions', () => {
      const checker = new SurfaceChecker();
      checker.criteria = MOCK_CRITERIA;
      checker._loaded = true;

      expect(checker.isDestructiveAction('create')).toBe(false);
      expect(checker.isDestructiveAction('read')).toBe(false);
    });
  });

  describe('getMetadata', () => {
    test('returns metadata from criteria', () => {
      const checker = new SurfaceChecker();
      checker.criteria = MOCK_CRITERIA;
      checker._loaded = true;

      const meta = checker.getMetadata();
      expect(meta.author).toBe('test');
    });

    test('returns empty object when no criteria', () => {
      const checker = new SurfaceChecker();
      checker.criteria = null;
      checker._loaded = true;

      expect(checker.getMetadata()).toEqual({});
    });
  });

  // ============================================================
  // Validation
  // ============================================================
  describe('validate', () => {
    test('validates valid criteria', () => {
      const checker = new SurfaceChecker();
      checker.criteria = MOCK_CRITERIA;
      checker._loaded = true;

      const result = checker.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('reports missing criteria file', () => {
      const checker = new SurfaceChecker();
      checker.criteria = null;
      checker._loaded = true;

      const result = checker.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Criteria file not loaded');
    });

    test('reports missing version', () => {
      const checker = new SurfaceChecker();
      checker.criteria = { criteria: {}, actions: {} };
      checker._loaded = true;

      const result = checker.validate();
      expect(result.errors).toContain('Missing version field');
    });

    test('reports missing criteria section', () => {
      const checker = new SurfaceChecker();
      checker.criteria = { version: '1.0', actions: {} };
      checker._loaded = true;

      const result = checker.validate();
      expect(result.errors).toContain('Missing criteria section');
    });

    test('reports missing actions section', () => {
      const checker = new SurfaceChecker();
      checker.criteria = { version: '1.0', criteria: {} };
      checker._loaded = true;

      const result = checker.validate();
      expect(result.errors).toContain('Missing actions section');
    });

    test('reports invalid criterion fields', () => {
      const checker = new SurfaceChecker();
      checker.criteria = {
        version: '1.0',
        criteria: {
          bad_criterion: { name: 'missing id, condition, action, message' },
        },
        actions: {},
      };
      checker._loaded = true;

      const result = checker.validate();
      expect(result.errors).toContain("Criterion 'bad_criterion' missing id field");
      expect(result.errors).toContain("Criterion 'bad_criterion' missing condition field");
      expect(result.errors).toContain("Criterion 'bad_criterion' missing action field");
      expect(result.errors).toContain("Criterion 'bad_criterion' missing message field");
    });

    test('skips array entries in criteria', () => {
      const checker = new SurfaceChecker();
      checker.criteria = {
        version: '1.0',
        criteria: {
          destructive_actions: ['delete', 'drop'],
        },
        actions: {},
      };
      checker._loaded = true;

      const result = checker.validate();
      expect(result.valid).toBe(true);
    });
  });

  // ============================================================
  // Factory Functions
  // ============================================================
  describe('createSurfaceChecker', () => {
    test('creates and loads checker', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('yaml');
      yaml.load.mockReturnValue(MOCK_CRITERIA);

      const checker = createSurfaceChecker('/test/criteria.yaml');

      expect(checker).toBeInstanceOf(SurfaceChecker);
      expect(checker._loaded).toBe(true);
    });

    test('works with default path', () => {
      fs.existsSync.mockReturnValue(false);

      const checker = createSurfaceChecker();

      expect(checker).toBeInstanceOf(SurfaceChecker);
    });
  });

  describe('shouldSurface (convenience function)', () => {
    test('evaluates context and returns result', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('yaml');
      yaml.load.mockReturnValue(MOCK_CRITERIA);

      const result = shouldSurface({ estimated_cost: 25 }, '/test/criteria.yaml');

      expect(result.should_surface).toBe(true);
      expect(result.criterion_id).toBe('SURF-1');
    });

    test('returns no-surface when criteria file missing', () => {
      fs.existsSync.mockReturnValue(false);

      const result = shouldSurface({ estimated_cost: 25 });

      expect(result.should_surface).toBe(false);
    });
  });
});
