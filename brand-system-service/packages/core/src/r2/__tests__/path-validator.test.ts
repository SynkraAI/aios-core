/**
 * Tests for R2 path validation — covers all 5 attack vectors plus file validation.
 * AC: 7, 9
 */
import { validatePath, buildR2Key, validateFile } from '../path-validator';
import { DEFAULT_FILE_VALIDATION } from '../types';

describe('validatePath', () => {
  const CLIENT_ID = 'acme-corp';

  describe('valid paths', () => {
    it('accepts a valid client-prefixed key', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp/01-brand-identity/logo.png');
      expect(result).toEqual({ valid: true });
    });

    it('accepts deeply nested paths within a valid folder', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp/01-brand-identity/variants/dark/logo.svg');
      expect(result).toEqual({ valid: true });
    });

    it('accepts alphanumeric client IDs with underscores', () => {
      const result = validatePath('client_123', 'client_123/01-brand-identity/file.png');
      expect(result).toEqual({ valid: true });
    });

    it('accepts single-char client IDs', () => {
      const result = validatePath('x', 'x/10-misc/file.png');
      expect(result).toEqual({ valid: true });
    });
  });

  describe('attack vector 1: path traversal (../)', () => {
    it('rejects ../ sequences', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp/../other-client/secret.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Path traversal');
    });

    it('rejects backslash traversal (..\\)', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp/..\\other-client/secret.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Path traversal');
    });

    it('rejects lone .. segment', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp/../secret.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Path traversal');
    });

    it('rejects . segment (current directory reference)', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp/./file.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Path traversal');
    });
  });

  describe('attack vector 2: absolute paths', () => {
    it('rejects keys starting with /', () => {
      const result = validatePath(CLIENT_ID, '/acme-corp/logo.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Absolute paths');
    });

    it('rejects keys starting with /etc/passwd style', () => {
      const result = validatePath(CLIENT_ID, '/etc/passwd');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Absolute paths');
    });
  });

  describe('attack vector 3: double slashes', () => {
    it('rejects double slashes in path', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp//logo.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Double slashes');
    });

    it('rejects triple slashes', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp///logo.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Double slashes');
    });
  });

  describe('attack vector 4: null bytes', () => {
    it('rejects null bytes in path', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp/logo\0.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('null bytes');
    });
  });

  describe('attack vector 5: wrong prefix', () => {
    it('rejects key without client-id prefix', () => {
      const result = validatePath(CLIENT_ID, 'other-client/logo.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('client prefix');
    });

    it('rejects key that partially matches client-id', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp-evil/logo.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('client prefix');
    });

    it('rejects empty key', () => {
      const result = validatePath(CLIENT_ID, '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('rejects whitespace-only key', () => {
      const result = validatePath(CLIENT_ID, '   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });
  });

  describe('folder membership enforcement (FR-8.8)', () => {
    it('accepts all 10 valid ASSET_FOLDERS', () => {
      const folders = [
        '01-brand-identity',
        '02-design-system',
        '03-social-media',
        '04-marketing',
        '05-documents',
        '06-video',
        '07-audio',
        '08-fonts',
        '09-templates',
        '10-misc',
      ];
      for (const folder of folders) {
        const result = validatePath(CLIENT_ID, `acme-corp/${folder}/file.png`);
        expect(result).toEqual({ valid: true });
      }
    });

    it('rejects keys with invalid folder names', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp/random-folder/file.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid folder');
      expect(result.error).toContain('random-folder');
    });

    it('rejects keys with numeric-only folder names', () => {
      const result = validatePath(CLIENT_ID, 'acme-corp/99-hacks/file.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid folder');
    });

    it('accepts key with only client prefix and trailing slash (no folder)', () => {
      // Edge case: `clientId/` with no further content — used in listing
      const result = validatePath(CLIENT_ID, 'acme-corp/01-brand-identity/logo.png');
      expect(result.valid).toBe(true);
    });
  });

  describe('client-id format validation', () => {
    it('rejects empty client-id', () => {
      const result = validatePath('', 'x/file.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid client-id');
    });

    it('rejects client-id with special characters', () => {
      const result = validatePath('client@evil', 'client@evil/file.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid client-id');
    });

    it('rejects client-id starting with hyphen', () => {
      const result = validatePath('-bad', '-bad/file.png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid client-id');
    });

    it('rejects client-id exceeding 64 chars', () => {
      const longId = 'a'.repeat(65);
      const result = validatePath(longId, `${longId}/file.png`);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid client-id');
    });

    it('accepts max-length client-id (64 chars)', () => {
      const maxId = 'a'.repeat(64);
      const result = validatePath(maxId, `${maxId}/01-brand-identity/file.png`);
      expect(result).toEqual({ valid: true });
    });
  });
});

describe('buildR2Key', () => {
  it('builds a key from components', () => {
    const key = buildR2Key('acme', '01-brand-identity', 'logo.png');
    expect(key).toBe('acme/01-brand-identity/logo.png');
  });

  it('sanitizes filename — removes path separators', () => {
    const key = buildR2Key('acme', '01-brand-identity', '../evil.png');
    expect(key).not.toContain('..');
  });

  it('sanitizes filename — removes null bytes', () => {
    const key = buildR2Key('acme', '01-brand-identity', 'file\0.png');
    expect(key).not.toContain('\0');
  });

  it('sanitizes filename — removes backslashes', () => {
    const key = buildR2Key('acme', '01-brand-identity', 'path\\file.png');
    expect(key).not.toContain('\\');
  });
});

describe('validateFile', () => {
  describe('allowed extensions', () => {
    it.each([
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.webp',
      '.avif',
      '.pdf',
      '.ai',
      '.eps',
      '.psd',
      '.mp4',
      '.webm',
      '.mov',
      '.woff',
      '.woff2',
      '.ttf',
      '.otf',
      '.json',
      '.yaml',
      '.yml',
      '.css',
    ])('accepts allowed extension %s', (ext) => {
      const result = validateFile(`file${ext}`, 1024, undefined, DEFAULT_FILE_VALIDATION);
      expect(result.valid).toBe(true);
    });
  });

  describe('denied extensions', () => {
    it.each(['.exe', '.sh', '.bat', '.js', '.php', '.html'])(
      'rejects disallowed extension %s',
      (ext) => {
        const result = validateFile(`file${ext}`, 1024, undefined, DEFAULT_FILE_VALIDATION);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('extension');
      },
    );
  });

  describe('size limits', () => {
    it('accepts file within size limit', () => {
      const result = validateFile('logo.png', 1024, 'image/png');
      expect(result.valid).toBe(true);
    });

    it('accepts file at exactly max size', () => {
      const result = validateFile('logo.png', 50 * 1024 * 1024, 'image/png');
      expect(result.valid).toBe(true);
    });

    it('rejects file exceeding max size', () => {
      const result = validateFile('logo.png', 50 * 1024 * 1024 + 1, 'image/png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('rejects zero-size file', () => {
      const result = validateFile('logo.png', 0, 'image/png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('greater than zero');
    });

    it('rejects negative-size file', () => {
      const result = validateFile('logo.png', -1, 'image/png');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('greater than zero');
    });
  });

  describe('MIME types', () => {
    it.each([
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/svg+xml',
      'image/webp',
      'image/avif',
      'application/pdf',
      'application/postscript',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'font/woff',
      'font/woff2',
      'font/ttf',
      'font/otf',
      'application/json',
      'text/yaml',
      'text/css',
    ])('accepts allowed MIME type %s', (mime) => {
      // Use a matching extension for the mime type
      const result = validateFile('file.png', 1024, mime);
      expect(result.valid).toBe(true);
    });

    it('rejects disallowed MIME type', () => {
      const result = validateFile('file.png', 1024, 'application/x-executable');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('MIME type');
    });

    it('allows undefined MIME type (no check)', () => {
      const result = validateFile('file.png', 1024);
      expect(result.valid).toBe(true);
    });
  });

  describe('extension edge cases', () => {
    it('rejects file without extension', () => {
      const result = validateFile('Makefile', 1024);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('extension');
    });
  });
});
