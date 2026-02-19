/**
 * Unit tests for manifest-validator
 *
 * Tests CSV parsing, header validation, row validation, file checks,
 * schema definitions, and result formatting.
 */

jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
    readdir: jest.fn(),
  },
}));

const fs = require('fs').promises;

const {
  ManifestValidator,
  createManifestValidator,
  parseCSV,
  parseCSVLine,
  parseCSVContent,
} = require('../../../.aios-core/core/manifest/manifest-validator');

describe('manifest-validator', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('parseCSVLine', () => {
    test('parses simple CSV line', () => {
      expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    test('handles quoted values', () => {
      expect(parseCSVLine('"hello","world"')).toEqual(['hello', 'world']);
    });

    test('handles escaped quotes', () => {
      expect(parseCSVLine('"he said ""hi"""')).toEqual(['he said "hi"']);
    });

    test('handles commas inside quotes', () => {
      expect(parseCSVLine('"a,b",c')).toEqual(['a,b', 'c']);
    });

    test('handles empty fields', () => {
      expect(parseCSVLine('a,,c')).toEqual(['a', '', 'c']);
    });
  });

  describe('parseCSVContent', () => {
    test('parses multi-line CSV content', () => {
      const content = 'a,b\n1,2\n3,4';
      const records = parseCSVContent(content);
      expect(records).toEqual([['a', 'b'], ['1', '2'], ['3', '4']]);
    });

    test('handles multi-line quoted values', () => {
      const content = 'a,b\n"line1\nline2",val';
      const records = parseCSVContent(content);
      expect(records).toHaveLength(2);
      expect(records[1][0]).toBe('line1\nline2');
    });

    test('handles Windows line endings', () => {
      const content = 'a,b\r\n1,2\r\n';
      const records = parseCSVContent(content);
      expect(records).toEqual([['a', 'b'], ['1', '2']]);
    });

    test('returns empty array for empty content', () => {
      expect(parseCSVContent('')).toEqual([]);
    });
  });

  describe('parseCSV', () => {
    test('returns header and rows', () => {
      const content = 'id,name\n1,foo\n2,bar';
      const result = parseCSV(content);
      expect(result.header).toEqual(['id', 'name']);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].id).toBe('1');
      expect(result.rows[0].name).toBe('foo');
    });

    test('adds _lineNumber to rows', () => {
      const content = 'id\n1\n2';
      const result = parseCSV(content);
      expect(result.rows[0]._lineNumber).toBe(2);
      expect(result.rows[1]._lineNumber).toBe(3);
    });

    test('returns empty for empty content', () => {
      const result = parseCSV('');
      expect(result.header).toEqual([]);
      expect(result.rows).toEqual([]);
    });
  });

  describe('ManifestValidator', () => {
    let validator;

    beforeEach(() => {
      validator = new ManifestValidator({ basePath: '/project' });
    });

    describe('constructor', () => {
      test('uses process.cwd() as default basePath', () => {
        const v = new ManifestValidator();
        expect(v.basePath).toBe(process.cwd());
      });

      test('sets verbose option', () => {
        const v = new ManifestValidator({ verbose: true });
        expect(v.verbose).toBe(true);
      });
    });

    describe('schemas', () => {
      test('getAgentsSchema has required fields', () => {
        const schema = validator.getAgentsSchema();
        expect(schema.required).toContain('id');
        expect(schema.required).toContain('name');
        expect(schema.required).toContain('file_path');
      });

      test('getWorkersSchema has required fields', () => {
        const schema = validator.getWorkersSchema();
        expect(schema.required).toContain('id');
        expect(schema.required).toContain('category');
      });

      test('getTasksSchema has required fields', () => {
        const schema = validator.getTasksSchema();
        expect(schema.required).toContain('id');
        expect(schema.required).toContain('file_path');
      });
    });

    describe('validateHeader', () => {
      test('returns no errors for valid header', () => {
        const schema = { required: ['id', 'name'] };
        expect(validator.validateHeader(['id', 'name', 'extra'], schema)).toEqual([]);
      });

      test('reports missing required columns', () => {
        const schema = { required: ['id', 'name'] };
        const errors = validator.validateHeader(['id'], schema);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('name');
      });
    });

    describe('validateManifest', () => {
      test('returns error when file not found', async () => {
        fs.access.mockRejectedValue(new Error('ENOENT'));
        const result = await validator.validateManifest('agents.csv', { required: ['id'] });
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('not found');
      });

      test('validates valid manifest', async () => {
        const csvContent = 'id,name,version,status,file_path\ndev,Dev,1.0,active,.aios-core/agents/dev.md';
        fs.access.mockResolvedValue(undefined);
        fs.readFile.mockResolvedValue(csvContent);
        fs.readdir.mockResolvedValue(['dev.md']);
        const schema = validator.getAgentsSchema();
        const result = await validator.validateManifest('agents.csv', schema);
        expect(result.valid).toBe(true);
        expect(result.rowCount).toBe(1);
      });

      test('detects duplicate IDs', async () => {
        const csvContent = 'id,name\nfoo,Foo\nfoo,Bar';
        fs.access.mockResolvedValue(undefined);
        fs.readFile.mockResolvedValue(csvContent);
        const result = await validator.validateManifest('test.csv', { required: ['id', 'name'] });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true);
      });

      test('detects missing required fields', async () => {
        const csvContent = 'id,name\nfoo,';
        fs.access.mockResolvedValue(undefined);
        fs.readFile.mockResolvedValue(csvContent);
        const result = await validator.validateManifest('test.csv', { required: ['id', 'name'] });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes("Missing required field 'name'"))).toBe(true);
      });

      test('warns about invalid status', async () => {
        const csvContent = 'id,status\nfoo,invalid-status';
        fs.access.mockResolvedValue(undefined);
        fs.readFile.mockResolvedValue(csvContent);
        const result = await validator.validateManifest('test.csv', { required: ['id'] });
        expect(result.warnings.some(w => w.includes('Invalid status'))).toBe(true);
      });
    });

    describe('formatResults', () => {
      test('formats valid results', () => {
        const results = {
          agents: { valid: true, filename: 'agents.csv', rowCount: 5, errors: [], warnings: [], missingFiles: [], orphanFiles: [] },
          summary: { valid: 1, invalid: 0, missing: [], orphan: [] },
        };
        const output = validator.formatResults(results);
        expect(output).toContain('✓');
        expect(output).toContain('agents.csv');
        expect(output).toContain('All manifests valid');
      });

      test('formats invalid results', () => {
        const results = {
          agents: { valid: false, filename: 'agents.csv', rowCount: 3, errors: ['Missing ID'], warnings: [], missingFiles: [], orphanFiles: [] },
          summary: { valid: 0, invalid: 1, missing: [{ id: '1', path: 'x' }], orphan: [] },
        };
        const output = validator.formatResults(results);
        expect(output).toContain('✗');
        expect(output).toContain('Validation failed');
        expect(output).toContain('missing file');
      });

      test('verbose mode includes error details', () => {
        const v = new ManifestValidator({ verbose: true });
        const results = {
          agents: { valid: false, filename: 'agents.csv', rowCount: 1, errors: ['Bad field'], warnings: ['Low prio'], missingFiles: [{ id: 'x', path: 'y' }], orphanFiles: [{ path: 'z' }] },
          summary: { valid: 0, invalid: 1, missing: [], orphan: [{ path: 'z' }] },
        };
        const output = v.formatResults(results);
        expect(output).toContain('Bad field');
        expect(output).toContain('Low prio');
        expect(output).toContain('Missing file');
        expect(output).toContain('Orphan file');
      });
    });
  });

  describe('createManifestValidator', () => {
    test('returns ManifestValidator instance', () => {
      const v = createManifestValidator();
      expect(v).toBeInstanceOf(ManifestValidator);
    });

    test('passes options to constructor', () => {
      const v = createManifestValidator({ verbose: true });
      expect(v.verbose).toBe(true);
    });
  });
});
