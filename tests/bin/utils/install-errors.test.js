/**
 * Tests for bin/utils/install-errors.js
 *
 * Covers error classification, message formatting, rollback messaging,
 * success messaging, error sanitization, and classification logic.
 *
 * @see Story 1.9 - Error Handling & Rollback
 */

const {
  ERROR_CLASSIFICATION,
  ERROR_MESSAGES,
  formatErrorMessage,
  formatRollbackMessage,
  formatSuccessMessage,
  sanitizeErrorForUser,
  getErrorClassification,
} = require('../../../bin/utils/install-errors');

// ---------------------------------------------------------------------------
// ERROR_CLASSIFICATION
// ---------------------------------------------------------------------------
describe('ERROR_CLASSIFICATION', () => {
  test('has exactly 3 levels: CRITICAL, RECOVERABLE, WARNING', () => {
    const keys = Object.keys(ERROR_CLASSIFICATION);
    expect(keys).toHaveLength(3);
    expect(keys).toContain('CRITICAL');
    expect(keys).toContain('RECOVERABLE');
    expect(keys).toContain('WARNING');
  });

  test.each(['CRITICAL', 'RECOVERABLE', 'WARNING'])(
    '%s has level, color (function), and icon properties',
    (level) => {
      const entry = ERROR_CLASSIFICATION[level];
      expect(entry).toBeDefined();
      expect(entry.level).toBe(level);
      expect(typeof entry.color).toBe('function');
      expect(typeof entry.icon).toBe('string');
      expect(entry.icon.length).toBeGreaterThan(0);
    },
  );
});

// ---------------------------------------------------------------------------
// ERROR_MESSAGES
// ---------------------------------------------------------------------------
describe('ERROR_MESSAGES', () => {
  const EXPECTED_CODES = [
    'EACCES',
    'ENOSPC',
    'EROFS',
    'ENOTDIR',
    'NETWORK_TIMEOUT',
    'NETWORK_ERROR',
    'DEPENDENCY_FAILED',
    'PACKAGE_CORRUPTION',
    'CONFIG_PARSE_ERROR',
    'CONFIG_WRITE_ERROR',
    'GIT_CORRUPTION',
    'GIT_CONFLICT',
    'UNKNOWN_ERROR',
  ];

  test('contains all expected error codes', () => {
    for (const code of EXPECTED_CODES) {
      expect(ERROR_MESSAGES).toHaveProperty(code);
    }
  });

  test('has at least 12 error codes', () => {
    expect(Object.keys(ERROR_MESSAGES).length).toBeGreaterThanOrEqual(12);
  });

  test.each(EXPECTED_CODES)(
    '%s has title (string), description (string), and recovery (non-empty array)',
    (code) => {
      const entry = ERROR_MESSAGES[code];
      expect(typeof entry.title).toBe('string');
      expect(entry.title.length).toBeGreaterThan(0);
      expect(typeof entry.description).toBe('string');
      expect(entry.description.length).toBeGreaterThan(0);
      expect(Array.isArray(entry.recovery)).toBe(true);
      expect(entry.recovery.length).toBeGreaterThan(0);
      entry.recovery.forEach((step) => {
        expect(typeof step).toBe('string');
        expect(step.length).toBeGreaterThan(0);
      });
    },
  );
});

// ---------------------------------------------------------------------------
// formatErrorMessage
// ---------------------------------------------------------------------------
describe('formatErrorMessage', () => {
  test('formats a known error code with its template', () => {
    const error = new Error('permission denied');
    const output = formatErrorMessage(error, 'EACCES');

    expect(output).toContain('Permission Denied');
    expect(output).toContain('insufficient file system permissions');
    expect(output).toContain('Recovery Steps');
  });

  test('includes recovery steps from the template', () => {
    const error = new Error('disk full');
    const output = formatErrorMessage(error, 'ENOSPC');

    // All 3 recovery steps from ENOSPC template
    expect(output).toContain('Free up disk space');
    expect(output).toContain('Delete unnecessary files');
    expect(output).toContain('Run the installer again');
  });

  test('falls back to UNKNOWN_ERROR for unrecognised codes', () => {
    const error = new Error('something weird');
    const output = formatErrorMessage(error, 'XYZZY_NOT_REAL');

    expect(output).toContain('Unknown Installation Error');
    expect(output).toContain('unexpected error');
  });

  test('uses error.code when errorCode is not provided', () => {
    const error = new Error('read-only');
    error.code = 'EROFS';
    const output = formatErrorMessage(error);

    expect(output).toContain('Read-Only File System');
  });

  test('defaults to UNKNOWN_ERROR when neither errorCode nor error.code exist', () => {
    const error = new Error('bare error');
    const output = formatErrorMessage(error);

    expect(output).toContain('Unknown Installation Error');
  });

  test('includes error details section with the error code', () => {
    const error = new Error('details test');
    const output = formatErrorMessage(error, 'NETWORK_TIMEOUT');

    expect(output).toContain('Error Details');
    expect(output).toContain('NETWORK_TIMEOUT');
  });

  test('includes error.message when it differs from the title', () => {
    const error = new Error('custom technical detail');
    const output = formatErrorMessage(error, 'EACCES');

    expect(output).toContain('custom technical detail');
  });

  test('omits error.message when it duplicates the title', () => {
    const error = new Error('Permission Denied');
    const output = formatErrorMessage(error, 'EACCES');

    // "Message:" line should not appear because message includes the title
    expect(output).not.toContain('Message: Permission Denied');
  });

  test('includes the installation log reference', () => {
    const error = new Error('test');
    const output = formatErrorMessage(error, 'EACCES');

    expect(output).toContain('.aios-install.log');
  });
});

// ---------------------------------------------------------------------------
// formatRollbackMessage
// ---------------------------------------------------------------------------
describe('formatRollbackMessage', () => {
  test('success message contains positive indicators', () => {
    const output = formatRollbackMessage(true);

    expect(output).toContain('Rollback Completed Successfully');
    expect(output).toContain('restored to its previous state');
    expect(output).toContain('No files were modified');
  });

  test('failure message contains warning indicators', () => {
    const output = formatRollbackMessage(false, ['config.json', 'package.json']);

    expect(output).toContain('Rollback Completed with Errors');
    expect(output).toContain('Manual Recovery Required');
    expect(output).toContain('config.json');
    expect(output).toContain('package.json');
  });

  test('failure message with empty failedFiles array still shows recovery steps', () => {
    const output = formatRollbackMessage(false, []);

    expect(output).toContain('Rollback Completed with Errors');
    expect(output).toContain('Recovery Steps');
    expect(output).toContain('.aios-backup/');
  });

  test('failure message without failedFiles argument shows recovery steps', () => {
    const output = formatRollbackMessage(false);

    expect(output).toContain('Rollback Completed with Errors');
    expect(output).toContain('Recovery Steps');
  });

  test('returns a string', () => {
    expect(typeof formatRollbackMessage(true)).toBe('string');
    expect(typeof formatRollbackMessage(false)).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// formatSuccessMessage
// ---------------------------------------------------------------------------
describe('formatSuccessMessage', () => {
  test('returns a non-empty string', () => {
    const output = formatSuccessMessage();
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
  });

  test('contains success indicators', () => {
    const output = formatSuccessMessage();
    expect(output).toContain('Installation Completed Successfully');
  });

  test('contains next steps section', () => {
    const output = formatSuccessMessage();
    expect(output).toContain('Next Steps');
    expect(output).toContain('.aios-install.log');
    expect(output).toContain('aios config --check');
    expect(output).toContain('aios validate');
  });

  test('mentions AIOS has been installed', () => {
    const output = formatSuccessMessage();
    expect(output).toContain('AIOS has been installed and configured');
  });
});

// ---------------------------------------------------------------------------
// sanitizeErrorForUser
// ---------------------------------------------------------------------------
describe('sanitizeErrorForUser', () => {
  test('returns fallback message for null input', () => {
    expect(sanitizeErrorForUser(null)).toBe('An unknown error occurred');
  });

  test('returns fallback message for undefined input', () => {
    expect(sanitizeErrorForUser(undefined)).toBe('An unknown error occurred');
  });

  test('extracts message from Error object', () => {
    const result = sanitizeErrorForUser(new Error('something broke'));
    expect(result).toBe('something broke');
  });

  test('removes Unix file paths with line:col references', () => {
    const error = new Error('Error at /Users/foo/bar/baz.js:42:13 happened');
    const result = sanitizeErrorForUser(error);
    expect(result).not.toContain('/Users/foo/bar/baz.js');
    expect(result).toContain('[file]');
  });

  test('removes Windows file paths with line:col references', () => {
    const error = new Error('Error at C:\\Users\\foo\\bar.js:10:5 happened');
    const result = sanitizeErrorForUser(error);
    expect(result).not.toContain('C:\\Users');
    expect(result).toContain('[file]');
  });

  test('removes stack traces (keeps only first line)', () => {
    const error = new Error('first line');
    error.message = 'first line\n    at Object.<anonymous> (/a/b.js:1:1)\n    at Module._compile';
    const result = sanitizeErrorForUser(error);
    expect(result).not.toContain('at Object');
    expect(result).not.toContain('Module._compile');
  });

  test('handles Error-like objects with toString()', () => {
    const obj = { toString: () => 'stringified error' };
    const result = sanitizeErrorForUser(obj);
    expect(result).toBe('stringified error');
  });

  test('handles Error with no message (uses toString)', () => {
    const error = new Error();
    error.message = '';
    const result = sanitizeErrorForUser(error);
    // Falls back to toString(), which returns "Error" for empty message
    expect(typeof result).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// getErrorClassification
// ---------------------------------------------------------------------------
describe('getErrorClassification', () => {
  describe('returns CRITICAL for critical error codes', () => {
    test.each(['EACCES', 'ENOSPC', 'EROFS', 'ENOTDIR', 'EISDIR'])(
      'returns CRITICAL for %s (from CRITICAL_ERRORS)',
      (code) => {
        const result = getErrorClassification(code);
        expect(result.level).toBe('CRITICAL');
        expect(result).toBe(ERROR_CLASSIFICATION.CRITICAL);
      },
    );

    test('returns CRITICAL for GIT_CORRUPTION (additional critical code)', () => {
      const result = getErrorClassification('GIT_CORRUPTION');
      expect(result.level).toBe('CRITICAL');
      expect(result).toBe(ERROR_CLASSIFICATION.CRITICAL);
    });
  });

  describe('returns RECOVERABLE for recoverable error codes', () => {
    test.each(['NETWORK_TIMEOUT', 'NETWORK_ERROR', 'DEPENDENCY_FAILED'])(
      'returns RECOVERABLE for %s',
      (code) => {
        const result = getErrorClassification(code);
        expect(result.level).toBe('RECOVERABLE');
        expect(result).toBe(ERROR_CLASSIFICATION.RECOVERABLE);
      },
    );
  });

  describe('returns WARNING for everything else', () => {
    test.each([
      'PACKAGE_CORRUPTION',
      'CONFIG_PARSE_ERROR',
      'CONFIG_WRITE_ERROR',
      'GIT_CONFLICT',
      'UNKNOWN_ERROR',
      'SOMETHING_RANDOM',
    ])('returns WARNING for %s', (code) => {
      const result = getErrorClassification(code);
      expect(result.level).toBe('WARNING');
      expect(result).toBe(ERROR_CLASSIFICATION.WARNING);
    });
  });
});
