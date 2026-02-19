/**
 * Unit tests for executor-assignment module
 *
 * Tests dynamic executor and quality gate assignment based on
 * keyword matching against story content.
 */

const {
  detectStoryType,
  assignExecutor,
  assignExecutorFromContent,
  validateExecutorAssignment,
  getStoryTypes,
  getStoryTypeConfig,
  getExecutorWorkTypes,
  EXECUTOR_ASSIGNMENT_TABLE,
  DEFAULT_ASSIGNMENT,
} = require('../../../.aios-core/core/orchestration/executor-assignment');

describe('executor-assignment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  // ============================================================
  // Constants
  // ============================================================
  describe('constants', () => {
    test('EXECUTOR_ASSIGNMENT_TABLE has all expected types', () => {
      const types = Object.keys(EXECUTOR_ASSIGNMENT_TABLE);
      expect(types).toContain('code_general');
      expect(types).toContain('database');
      expect(types).toContain('infrastructure');
      expect(types).toContain('ui_ux');
      expect(types).toContain('research');
      expect(types).toContain('architecture');
    });

    test('each type has required fields', () => {
      for (const [, config] of Object.entries(EXECUTOR_ASSIGNMENT_TABLE)) {
        expect(Array.isArray(config.keywords)).toBe(true);
        expect(config.keywords.length).toBeGreaterThan(0);
        expect(typeof config.executor).toBe('string');
        expect(typeof config.quality_gate).toBe('string');
        expect(Array.isArray(config.quality_gate_tools)).toBe(true);
      }
    });

    test('executor and quality_gate are different in each type', () => {
      for (const [, config] of Object.entries(EXECUTOR_ASSIGNMENT_TABLE)) {
        expect(config.executor).not.toBe(config.quality_gate);
      }
    });

    test('DEFAULT_ASSIGNMENT has required fields', () => {
      expect(DEFAULT_ASSIGNMENT.executor).toBe('@dev');
      expect(DEFAULT_ASSIGNMENT.quality_gate).toBe('@architect');
      expect(Array.isArray(DEFAULT_ASSIGNMENT.quality_gate_tools)).toBe(true);
    });
  });

  // ============================================================
  // detectStoryType
  // ============================================================
  describe('detectStoryType', () => {
    test('detects code_general from feature keywords', () => {
      expect(detectStoryType('Implement user authentication handler')).toBe('code_general');
    });

    test('detects database from schema keywords', () => {
      expect(detectStoryType('Create RLS policies for user table')).toBe('database');
    });

    test('detects infrastructure from deploy keywords', () => {
      expect(detectStoryType('Setup CI/CD pipeline for deployment')).toBe('infrastructure');
    });

    test('detects ui_ux from component keywords', () => {
      expect(detectStoryType('Build responsive UI component with accessibility')).toBe('ui_ux');
    });

    test('detects research from investigation keywords', () => {
      expect(detectStoryType('Research and analyze benchmark results')).toBe('research');
    });

    test('detects architecture from design keywords', () => {
      expect(detectStoryType('Architecture design decision for scalability pattern')).toBe('architecture');
    });

    test('defaults to code_general for null input', () => {
      expect(detectStoryType(null)).toBe('code_general');
    });

    test('defaults to code_general for undefined input', () => {
      expect(detectStoryType(undefined)).toBe('code_general');
    });

    test('defaults to code_general for empty string', () => {
      expect(detectStoryType('')).toBe('code_general');
    });

    test('defaults to code_general for non-string input', () => {
      expect(detectStoryType(42)).toBe('code_general');
      expect(detectStoryType({})).toBe('code_general');
    });

    test('is case insensitive', () => {
      expect(detectStoryType('CREATE RLS POLICIES FOR USER TABLE')).toBe('database');
    });

    test('picks type with highest keyword count', () => {
      // Multiple database keywords should win
      expect(detectStoryType('Create schema with table, migration, and query index')).toBe('database');
    });

    test('defaults to code_general for no keyword matches', () => {
      expect(detectStoryType('do something random here')).toBe('code_general');
    });
  });

  // ============================================================
  // assignExecutor
  // ============================================================
  describe('assignExecutor', () => {
    test('assigns correct executor for code_general', () => {
      const result = assignExecutor('code_general');
      expect(result.executor).toBe('@dev');
      expect(result.quality_gate).toBe('@architect');
    });

    test('assigns correct executor for database', () => {
      const result = assignExecutor('database');
      expect(result.executor).toBe('@data-engineer');
      expect(result.quality_gate).toBe('@dev');
    });

    test('assigns correct executor for infrastructure', () => {
      const result = assignExecutor('infrastructure');
      expect(result.executor).toBe('@devops');
      expect(result.quality_gate).toBe('@architect');
    });

    test('assigns correct executor for ui_ux', () => {
      const result = assignExecutor('ui_ux');
      expect(result.executor).toBe('@ux-design-expert');
      expect(result.quality_gate).toBe('@dev');
    });

    test('assigns correct executor for research', () => {
      const result = assignExecutor('research');
      expect(result.executor).toBe('@analyst');
      expect(result.quality_gate).toBe('@pm');
    });

    test('assigns correct executor for architecture', () => {
      const result = assignExecutor('architecture');
      expect(result.executor).toBe('@architect');
      expect(result.quality_gate).toBe('@pm');
    });

    test('returns default for unknown type', () => {
      const result = assignExecutor('unknown_type');
      expect(result.executor).toBe('@dev');
      expect(result.quality_gate).toBe('@architect');
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('unknown_type'));
    });

    test('returns copy of quality_gate_tools', () => {
      const result1 = assignExecutor('code_general');
      const result2 = assignExecutor('code_general');
      result1.quality_gate_tools.push('extra');
      expect(result2.quality_gate_tools).not.toContain('extra');
    });
  });

  // ============================================================
  // assignExecutorFromContent
  // ============================================================
  describe('assignExecutorFromContent', () => {
    test('combines detection and assignment', () => {
      const result = assignExecutorFromContent('Create database schema with migrations');
      expect(result.executor).toBe('@data-engineer');
      expect(result.quality_gate).toBe('@dev');
    });

    test('handles null content', () => {
      const result = assignExecutorFromContent(null);
      expect(result.executor).toBe('@dev');
    });
  });

  // ============================================================
  // validateExecutorAssignment
  // ============================================================
  describe('validateExecutorAssignment', () => {
    test('valid assignment passes', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate: '@architect',
        quality_gate_tools: ['code_review'],
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('missing executor fails', () => {
      const result = validateExecutorAssignment({
        quality_gate: '@architect',
        quality_gate_tools: ['code_review'],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('executor'));
    });

    test('missing quality_gate fails', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate_tools: ['code_review'],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('quality_gate'));
    });

    test('missing quality_gate_tools fails', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate: '@architect',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('quality_gate_tools'));
    });

    test('non-array quality_gate_tools fails', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate: '@architect',
        quality_gate_tools: 'not_array',
      });

      expect(result.isValid).toBe(false);
    });

    test('empty quality_gate_tools fails', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate: '@architect',
        quality_gate_tools: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('empty'));
    });

    test('same executor and quality_gate fails', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate: '@dev',
        quality_gate_tools: ['code_review'],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('cannot be the same'));
    });

    test('unknown executor warns', () => {
      const result = validateExecutorAssignment({
        executor: '@unknown-agent',
        quality_gate: '@architect',
        quality_gate_tools: ['code_review'],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('Unknown executor'));
    });

    test('unknown quality_gate warns', () => {
      const result = validateExecutorAssignment({
        executor: '@dev',
        quality_gate: '@unknown-reviewer',
        quality_gate_tools: ['code_review'],
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('Unknown quality_gate'));
    });

    test('@pm is accepted as quality_gate', () => {
      const result = validateExecutorAssignment({
        executor: '@analyst',
        quality_gate: '@pm',
        quality_gate_tools: ['research_validation'],
      });

      expect(result.isValid).toBe(true);
    });
  });

  // ============================================================
  // getStoryTypes
  // ============================================================
  describe('getStoryTypes', () => {
    test('returns all type keys', () => {
      const types = getStoryTypes();
      expect(types).toContain('code_general');
      expect(types).toContain('database');
      expect(types).toContain('infrastructure');
      expect(types).toContain('ui_ux');
      expect(types).toContain('research');
      expect(types).toContain('architecture');
    });
  });

  // ============================================================
  // getStoryTypeConfig
  // ============================================================
  describe('getStoryTypeConfig', () => {
    test('returns config for valid type', () => {
      const config = getStoryTypeConfig('database');
      expect(config.executor).toBe('@data-engineer');
      expect(config.keywords).toContain('schema');
    });

    test('returns null for unknown type', () => {
      expect(getStoryTypeConfig('nonexistent')).toBeNull();
    });
  });

  // ============================================================
  // getExecutorWorkTypes
  // ============================================================
  describe('getExecutorWorkTypes', () => {
    test('returns map of executors to work types', () => {
      const map = getExecutorWorkTypes();

      expect(map['@dev']).toContain('code_general');
      expect(map['@data-engineer']).toContain('database');
      expect(map['@devops']).toContain('infrastructure');
      expect(map['@analyst']).toContain('research');
    });

    test('each executor has at least one work type', () => {
      const map = getExecutorWorkTypes();

      for (const [, types] of Object.entries(map)) {
        expect(types.length).toBeGreaterThan(0);
      }
    });
  });
});
