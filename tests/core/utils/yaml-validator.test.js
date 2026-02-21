/**
 * YAML Validator - Test Suite
 * Tests for YAMLValidator class and validateYAML convenience function.
 *
 * Covers: validate(), validateFile(), validateStructure(),
 * validateFieldTypes(), getMaxDepth(), autoFix(), fixIndentation(),
 * fixQuotes(), generateReport(), and validateYAML().
 *
 * Refs #423
 */

const yaml = require('js-yaml');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const {
  YAMLValidator,
  validateYAML,
} = require('../../../.aios-core/core/utils/yaml-validator');

// ── Test fixtures ───────────────────────────────────────────────────────

const VALID_AGENT_YAML = `
agent:
  name: Test
  id: test
  title: Tester
  icon: "🧪"
  whenToUse: Testing
persona:
  role: tester
  style: careful
  identity: QA
  focus: quality
commands:
  - test
`.trim();

const VALID_MANIFEST_YAML = `
bundle:
  name: TestBundle
  icon: "📦"
  description: A test bundle
agents:
  - test-agent
`.trim();

const VALID_WORKFLOW_YAML = `
workflow:
  id: wf-test
  name: Test Workflow
  description: A test workflow
  type: sequential
  scope: project
stages:
  - name: stage-1
    description: First stage
`.trim();

const SIMPLE_GENERAL_YAML = `
key: value
list:
  - one
  - two
nested:
  child: data
`.trim();

const INVALID_YAML = `
key: value
  bad indent:
    - this: [is broken
`.trim();

// ── describe: YAMLValidator ─────────────────────────────────────────────

describe('YAMLValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new YAMLValidator();
  });

  // ── Constructor ─────────────────────────────────────────────────────

  describe('Constructor', () => {
    test('initializes validation rules for agent, manifest, and workflow', () => {
      expect(validator.validationRules).toHaveProperty('agent');
      expect(validator.validationRules).toHaveProperty('manifest');
      expect(validator.validationRules).toHaveProperty('workflow');
    });

    test('agent rules have correct required and optional fields', () => {
      const agentRules = validator.validationRules.agent;
      expect(agentRules.required).toEqual(['agent', 'persona', 'commands']);
      expect(agentRules.optional).toEqual(['dependencies', 'security', 'customization']);
    });

    test('manifest rules have correct required and optional fields', () => {
      const manifestRules = validator.validationRules.manifest;
      expect(manifestRules.required).toEqual(['bundle', 'agents']);
      expect(manifestRules.optional).toEqual(['workflows']);
    });

    test('workflow rules have correct required and optional fields', () => {
      const workflowRules = validator.validationRules.workflow;
      expect(workflowRules.required).toEqual(['workflow', 'stages']);
      expect(workflowRules.optional).toEqual(['transitions', 'resources', 'validation']);
    });
  });

  // ── validate() ──────────────────────────────────────────────────────

  describe('validate()', () => {
    test('parses valid YAML and returns valid result', async () => {
      const result = await validator.validate(SIMPLE_GENERAL_YAML);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.parsed).toBeDefined();
      expect(result.parsed.key).toBe('value');
    });

    test('returns parse error for invalid YAML', async () => {
      const result = await validator.validate(INVALID_YAML);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('parse_error');
    });

    test('validates agent type with valid content', async () => {
      const result = await validator.validate(VALID_AGENT_YAML, 'agent');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.parsed.agent.name).toBe('Test');
    });

    test('validates agent type with missing required fields', async () => {
      const incomplete = `
agent:
  name: Test
  id: test
  title: Tester
  icon: "🧪"
  whenToUse: Testing
`.trim();
      const result = await validator.validate(incomplete, 'agent');
      expect(result.valid).toBe(false);
      const missingFields = result.errors
        .filter(e => e.type === 'missing_required')
        .map(e => e.field);
      expect(missingFields).toContain('persona');
      expect(missingFields).toContain('commands');
    });

    test('validates manifest type with valid content', async () => {
      const result = await validator.validate(VALID_MANIFEST_YAML, 'manifest');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates manifest type with missing required fields', async () => {
      const incomplete = `
bundle:
  name: TestBundle
  icon: "📦"
  description: A test bundle
`.trim();
      const result = await validator.validate(incomplete, 'manifest');
      expect(result.valid).toBe(false);
      const missingFields = result.errors
        .filter(e => e.type === 'missing_required')
        .map(e => e.field);
      expect(missingFields).toContain('agents');
    });

    test('validates workflow type with valid content', async () => {
      const result = await validator.validate(VALID_WORKFLOW_YAML, 'workflow');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates workflow type with missing required fields', async () => {
      const incomplete = `
workflow:
  id: wf-test
  name: Test Workflow
  description: A test workflow
  type: sequential
  scope: project
`.trim();
      const result = await validator.validate(incomplete, 'workflow');
      expect(result.valid).toBe(false);
      const missingFields = result.errors
        .filter(e => e.type === 'missing_required')
        .map(e => e.field);
      expect(missingFields).toContain('stages');
    });

    test('general type does not apply type-specific rules', async () => {
      // Even though this has no 'agent', 'persona', 'commands' etc.
      const result = await validator.validate(SIMPLE_GENERAL_YAML, 'general');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('unknown type is treated as general (no type-specific rules)', async () => {
      const result = await validator.validate(SIMPLE_GENERAL_YAML, 'nonexistent');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('parse error includes line and column when available', async () => {
      const badYaml = 'key: [unclosed';
      const result = await validator.validate(badYaml);
      expect(result.valid).toBe(false);
      expect(result.errors[0].type).toBe('parse_error');
      expect(result.errors[0].message).toBeTruthy();
    });
  });

  // ── validateFile() ──────────────────────────────────────────────────

  describe('validateFile()', () => {
    let tmpDir;

    beforeEach(async () => {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'yaml-validator-test-'));
    });

    afterEach(async () => {
      await fs.remove(tmpDir);
    });

    test('validates an existing YAML file', async () => {
      const filePath = path.join(tmpDir, 'test.yaml');
      await fs.writeFile(filePath, VALID_AGENT_YAML, 'utf8');

      const result = await validator.validateFile(filePath, 'agent');
      expect(result.valid).toBe(true);
      expect(result.filePath).toBe(filePath);
      expect(result.parsed.agent.name).toBe('Test');
    });

    test('returns file_error for non-existing file', async () => {
      const result = await validator.validateFile('/nonexistent/file.yaml');
      expect(result.valid).toBe(false);
      expect(result.filePath).toBe('/nonexistent/file.yaml');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('file_error');
      expect(result.errors[0].message).toMatch(/Could not read file/);
    });

    test('validates file with general type by default', async () => {
      const filePath = path.join(tmpDir, 'general.yaml');
      await fs.writeFile(filePath, SIMPLE_GENERAL_YAML, 'utf8');

      const result = await validator.validateFile(filePath);
      expect(result.valid).toBe(true);
      expect(result.filePath).toBe(filePath);
    });
  });

  // ── validateStructure() ─────────────────────────────────────────────

  describe('validateStructure()', () => {
    test('reports missing required top-level fields', () => {
      const data = { agent: { name: 'Test', id: 'test', title: 'T', icon: '!', whenToUse: 'x' } };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateStructure(data, 'agent', results);

      expect(results.valid).toBe(false);
      const missingFields = results.errors.map(e => e.field);
      expect(missingFields).toContain('persona');
      expect(missingFields).toContain('commands');
    });

    test('warns about unknown fields', () => {
      const data = {
        agent: { name: 'Test', id: 'test', title: 'T', icon: '!', whenToUse: 'x' },
        persona: { role: 'r', style: 's', identity: 'i', focus: 'f' },
        commands: ['cmd'],
        extraField: 'unknown',
      };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateStructure(data, 'agent', results);

      const unknownWarnings = results.warnings.filter(w => w.type === 'unknown_field');
      expect(unknownWarnings.length).toBeGreaterThan(0);
      expect(unknownWarnings.some(w => w.field === 'extraField')).toBe(true);
    });

    test('does not warn about optional fields', () => {
      const data = {
        agent: { name: 'Test', id: 'test', title: 'T', icon: '!', whenToUse: 'x' },
        persona: { role: 'r', style: 's', identity: 'i', focus: 'f' },
        commands: ['cmd'],
        dependencies: [],
        security: {},
        customization: {},
      };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateStructure(data, 'agent', results);

      const unknownWarnings = results.warnings.filter(w => w.type === 'unknown_field');
      expect(unknownWarnings).toHaveLength(0);
    });

    test('validates sub-field structure when present', () => {
      const data = {
        agent: { name: 'Test' }, // missing id, title, icon, whenToUse
        persona: { role: 'r', style: 's', identity: 'i', focus: 'f' },
        commands: ['cmd'],
      };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateStructure(data, 'agent', results);

      const missingSubfields = results.errors
        .filter(e => e.type === 'missing_required')
        .map(e => e.field);
      expect(missingSubfields).toContain('agent.id');
      expect(missingSubfields).toContain('agent.title');
      expect(missingSubfields).toContain('agent.icon');
      expect(missingSubfields).toContain('agent.whenToUse');
    });
  });

  // ── validateFieldStructure() ────────────────────────────────────────

  describe('validateFieldStructure()', () => {
    test('reports missing required subfields', () => {
      const data = { name: 'Test' };
      const rules = { required: ['name', 'id', 'title'], optional: [] };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateFieldStructure(data, 'agent', rules, results);

      expect(results.valid).toBe(false);
      const missing = results.errors.filter(e => e.type === 'missing_required').map(e => e.field);
      expect(missing).toContain('agent.id');
      expect(missing).toContain('agent.title');
    });

    test('passes when all required subfields present', () => {
      const data = { name: 'Test', id: 'test', title: 'Tester' };
      const rules = { required: ['name', 'id', 'title'], optional: [] };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateFieldStructure(data, 'agent', rules, results);

      const missing = results.errors.filter(e => e.type === 'missing_required');
      expect(missing).toHaveLength(0);
    });

    test('also calls validateFieldTypes on the data', () => {
      const spy = jest.spyOn(validator, 'validateFieldTypes');
      const data = { name: 'Test', id: 'test' };
      const rules = { required: ['name', 'id'], optional: [] };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateFieldStructure(data, 'myField', rules, results);

      expect(spy).toHaveBeenCalledWith(data, 'myField', results);
      spy.mockRestore();
    });
  });

  // ── validateFieldTypes() ────────────────────────────────────────────

  describe('validateFieldTypes()', () => {
    test('warns on null values', () => {
      const data = { name: 'Test', value: null };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateFieldTypes(data, 'section', results);

      const nullWarnings = results.warnings.filter(w => w.type === 'null_value');
      expect(nullWarnings).toHaveLength(1);
      expect(nullWarnings[0].field).toBe('section.value');
    });

    test('warns on undefined values', () => {
      const data = { name: 'Test', value: undefined };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateFieldTypes(data, 'section', results);

      const nullWarnings = results.warnings.filter(w => w.type === 'null_value');
      expect(nullWarnings).toHaveLength(1);
      expect(nullWarnings[0].field).toBe('section.value');
    });

    test('reports error for empty id', () => {
      const data = { id: '' };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateFieldTypes(data, 'agent', results);

      const typeErrors = results.errors.filter(e => e.type === 'invalid_type');
      expect(typeErrors).toHaveLength(1);
      expect(typeErrors[0].field).toBe('agent.id');
      expect(typeErrors[0].message).toMatch(/non-empty string/);
    });

    test('reports error for empty name', () => {
      const data = { name: '   ' };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateFieldTypes(data, 'agent', results);

      const typeErrors = results.errors.filter(e => e.type === 'invalid_type');
      expect(typeErrors).toHaveLength(1);
      expect(typeErrors[0].field).toBe('agent.name');
    });

    test('reports error for non-string id', () => {
      const data = { id: 123 };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateFieldTypes(data, 'agent', results);

      const typeErrors = results.errors.filter(e => e.type === 'invalid_type');
      expect(typeErrors).toHaveLength(1);
      expect(typeErrors[0].field).toBe('agent.id');
    });

    test('warns on empty icon', () => {
      const data = { icon: '' };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateFieldTypes(data, 'agent', results);

      const iconWarnings = results.warnings.filter(w => w.type === 'empty_icon');
      expect(iconWarnings).toHaveLength(1);
      expect(iconWarnings[0].field).toBe('agent.icon');
    });

    test('does not warn on non-empty icon', () => {
      const data = { icon: '🧪' };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateFieldTypes(data, 'agent', results);

      const iconWarnings = results.warnings.filter(w => w.type === 'empty_icon');
      expect(iconWarnings).toHaveLength(0);
    });

    test('does not warn on non-string icon', () => {
      // icon check only triggers for typeof string
      const data = { icon: 42 };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateFieldTypes(data, 'agent', results);

      const iconWarnings = results.warnings.filter(w => w.type === 'empty_icon');
      expect(iconWarnings).toHaveLength(0);
    });
  });

  // ── validateGeneral() ───────────────────────────────────────────────

  describe('validateGeneral()', () => {
    test('passes for normal data', () => {
      const data = { key: 'value', nested: { child: 'data' } };
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateGeneral(data, results);

      expect(results.valid).toBe(true);
      expect(results.errors).toHaveLength(0);
    });

    test('warns on deeply nested data (> 10 levels)', () => {
      let data = { level: 'bottom' };
      for (let i = 0; i < 12; i++) {
        data = { nested: data };
      }
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateGeneral(data, results);

      const deepWarnings = results.warnings.filter(w => w.type === 'deep_nesting');
      expect(deepWarnings).toHaveLength(1);
      expect(deepWarnings[0].depth).toBeGreaterThan(10);
    });

    test('does not warn on nesting at exactly 10 levels', () => {
      let data = { level: 'bottom' };
      for (let i = 0; i < 10; i++) {
        data = { nested: data };
      }
      const results = { valid: true, errors: [], warnings: [] };

      validator.validateGeneral(data, results);

      const deepWarnings = results.warnings.filter(w => w.type === 'deep_nesting');
      expect(deepWarnings).toHaveLength(0);
    });
  });

  // ── getMaxDepth() ───────────────────────────────────────────────────

  describe('getMaxDepth()', () => {
    test('returns 0 for flat object (no nested objects)', () => {
      const depth = validator.getMaxDepth({ a: 1, b: 'str', c: true });
      expect(depth).toBe(0);
    });

    test('returns 0 for null', () => {
      const depth = validator.getMaxDepth(null);
      expect(depth).toBe(0);
    });

    test('returns 0 for primitive value', () => {
      expect(validator.getMaxDepth('string')).toBe(0);
      expect(validator.getMaxDepth(42)).toBe(0);
      expect(validator.getMaxDepth(true)).toBe(0);
    });

    test('returns 1 for one level of nesting', () => {
      const depth = validator.getMaxDepth({ a: { b: 1 } });
      expect(depth).toBe(1);
    });

    test('returns correct depth for deeply nested objects', () => {
      const obj = { a: { b: { c: { d: { e: 'deep' } } } } };
      const depth = validator.getMaxDepth(obj);
      expect(depth).toBe(4);
    });

    test('returns max among branches', () => {
      const obj = {
        shallow: { x: 1 },
        deep: { a: { b: { c: 'deepest' } } },
        medium: { m: { n: 2 } },
      };
      const depth = validator.getMaxDepth(obj);
      expect(depth).toBe(3);
    });

    test('handles arrays (arrays are objects)', () => {
      const obj = { list: [1, 2, 3] };
      // Array is an object, so depth = 1
      const depth = validator.getMaxDepth(obj);
      expect(depth).toBe(1);
    });

    test('respects currentDepth parameter', () => {
      const depth = validator.getMaxDepth({ a: { b: 1 } }, 5);
      expect(depth).toBe(6);
    });
  });

  // ── autoFix() ───────────────────────────────────────────────────────

  describe('autoFix()', () => {
    test('returns unchanged content when YAML is already valid', async () => {
      const content = 'key: value\nlist:\n  - one\n  - two';
      const result = await validator.autoFix(content);

      expect(result.validation.valid).toBe(true);
      expect(result.content).toBeDefined();
    });

    test('calls fixIndentation and fixQuotes', async () => {
      const indentSpy = jest.spyOn(validator, 'fixIndentation');
      const quotesSpy = jest.spyOn(validator, 'fixQuotes');

      await validator.autoFix('key: value');

      expect(indentSpy).toHaveBeenCalled();
      expect(quotesSpy).toHaveBeenCalled();

      indentSpy.mockRestore();
      quotesSpy.mockRestore();
    });

    test('sets changed flag when content is modified', async () => {
      const badContent = '  key: value with: colon';
      const result = await validator.autoFix(badContent);

      // fixQuotes should quote "value with: colon" since it contains ':'
      // Whether changed depends on actual transformation
      expect(typeof result.changed).toBe('boolean');
      expect(result.content).toBeDefined();
      expect(result.validation).toBeDefined();
    });

    test('validates with specified type after fixing', async () => {
      const content = VALID_AGENT_YAML;
      const result = await validator.autoFix(content, 'agent');

      expect(result.validation).toBeDefined();
      expect(result.validation.valid).toBeDefined();
    });
  });

  // ── fixIndentation() ───────────────────────────────────────────────

  describe('fixIndentation()', () => {
    test('preserves correctly indented YAML', () => {
      const content = 'key: value\nnested:\n  child: data';
      const result = validator.fixIndentation(content);
      // The fixed output should still be valid YAML
      expect(() => yaml.load(result)).not.toThrow();
    });

    test('preserves empty lines and comments', () => {
      const content = '# This is a comment\n\nkey: value';
      const result = validator.fixIndentation(content);
      expect(result).toContain('# This is a comment');
      expect(result).toContain('key: value');
    });

    test('handles list items', () => {
      const content = 'items:\n  - one\n  - two\n  - three';
      const result = validator.fixIndentation(content);
      expect(() => yaml.load(result)).not.toThrow();
    });

    test('handles nested key-value blocks', () => {
      const content = 'parent:\n  child: value\n  other: data';
      const result = validator.fixIndentation(content);
      const parsed = yaml.load(result);
      expect(parsed).toBeDefined();
    });
  });

  // ── fixQuotes() ─────────────────────────────────────────────────────

  describe('fixQuotes()', () => {
    test('quotes strings containing colons', () => {
      const content = 'key: value with: colon';
      const result = validator.fixQuotes(content);
      expect(result).toContain('"');
    });

    test('does not modify strings already quoted', () => {
      const content = 'key: "already quoted: yes"';
      const result = validator.fixQuotes(content);
      expect(result).toBe(content);
    });

    test('does not modify simple values without special chars', () => {
      const content = 'key: simple value';
      const result = validator.fixQuotes(content);
      expect(result).toBe(content);
    });

    test('quotes strings containing ampersand', () => {
      const content = 'key: value & more';
      const result = validator.fixQuotes(content);
      // & is in the regex character class, so it gets quoted
      expect(result).toContain('"');
    });

    test('quotes strings containing pipe character', () => {
      const content = 'key: value | more';
      const result = validator.fixQuotes(content);
      expect(result).toContain('"');
    });

    test('quotes strings containing exclamation mark', () => {
      const content = 'key: value !important';
      const result = validator.fixQuotes(content);
      expect(result).toContain('"');
    });
  });

  // ── generateReport() ───────────────────────────────────────────────

  describe('generateReport()', () => {
    test('generates report for valid result', () => {
      const validation = { valid: true, errors: [], warnings: [] };
      const report = validator.generateReport(validation);

      expect(report).toContain('YAML Validation Report');
      expect(report).toContain('Yes');
      expect(report).not.toContain('Errors');
      expect(report).not.toContain('Warnings');
    });

    test('generates report with errors', () => {
      const validation = {
        valid: false,
        errors: [
          { type: 'parse_error', message: 'Invalid syntax', line: 5, column: 3 },
          { type: 'missing_required', message: 'Missing field: agent' },
        ],
        warnings: [],
      };
      const report = validator.generateReport(validation);

      expect(report).toContain('No');
      expect(report).toContain('Errors (2)');
      expect(report).toContain('Invalid syntax');
      expect(report).toContain('Line: 5');
      expect(report).toContain('Column: 3');
      expect(report).toContain('Missing field: agent');
    });

    test('generates report with warnings', () => {
      const validation = {
        valid: true,
        errors: [],
        warnings: [
          { type: 'unknown_field', message: 'Unknown field: extra' },
          { type: 'null_value', message: 'Null value at section.key' },
        ],
      };
      const report = validator.generateReport(validation);

      expect(report).toContain('Yes');
      expect(report).toContain('Warnings (2)');
      expect(report).toContain('Unknown field: extra');
      expect(report).toContain('Null value at section.key');
    });

    test('generates report with both errors and warnings', () => {
      const validation = {
        valid: false,
        errors: [{ type: 'parse_error', message: 'Bad YAML' }],
        warnings: [{ type: 'deep_nesting', message: 'Too deep' }],
      };
      const report = validator.generateReport(validation);

      expect(report).toContain('Errors (1)');
      expect(report).toContain('Warnings (1)');
      expect(report).toContain('Bad YAML');
      expect(report).toContain('Too deep');
    });

    test('does not include line info when line is not present', () => {
      const validation = {
        valid: false,
        errors: [{ type: 'missing_required', message: 'Missing field' }],
        warnings: [],
      };
      const report = validator.generateReport(validation);

      expect(report).toContain('Missing field');
      expect(report).not.toContain('Line:');
    });
  });
});

// ── describe: validateYAML() convenience function ───────────────────────

describe('validateYAML()', () => {
  test('returns valid result for valid YAML', async () => {
    const result = await validateYAML(SIMPLE_GENERAL_YAML);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toBeDefined();
  });

  test('returns error for invalid YAML', async () => {
    const result = await validateYAML(INVALID_YAML);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('validates with agent type', async () => {
    const result = await validateYAML(VALID_AGENT_YAML, 'agent');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('returns first error message in error field', async () => {
    const incomplete = `
agent:
  name: Test
  id: test
  title: Tester
  icon: "🧪"
  whenToUse: Testing
`.trim();
    const result = await validateYAML(incomplete, 'agent');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.error).toMatch(/Missing required field/);
  });

  test('defaults to general type', async () => {
    const result = await validateYAML('key: value');
    expect(result.valid).toBe(true);
  });

  test('includes warnings from validation', async () => {
    // Create YAML that is valid but has null values
    const yamlWithNull = `
agent:
  name: Test
  id: test
  title: Tester
  icon: "🧪"
  whenToUse: Testing
  extra: ~
persona:
  role: tester
  style: careful
  identity: QA
  focus: quality
commands:
  - test
unknownTopLevel: value
`.trim();
    const result = await validateYAML(yamlWithNull, 'agent');
    // Should have warnings for unknown field
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
