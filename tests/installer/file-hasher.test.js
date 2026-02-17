/**
 * Unit tests for file-hasher.js
 * @story 6.18 - Dynamic Manifest & Brownfield Upgrade System
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const {
  hashFile,
  hashString,
  hashesMatch,
  getFileMetadata,
  isBinaryFile,
  normalizeLineEndings,
  removeBOM,
} = require('../../packages/installer/src/installer/file-hasher');

describe('file-hasher', () => {
  let tempDir;

  beforeAll(() => {
    tempDir = path.join(os.tmpdir(), 'file-hasher-test-' + Date.now());
    fs.ensureDirSync(tempDir);
  });

  afterAll(() => {
    fs.removeSync(tempDir);
  });

  describe('normalizeLineEndings', () => {
    it('should convert CRLF to LF', () => {
      const input = 'line1\r\nline2\r\nline3';
      const expected = 'line1\nline2\nline3';
      expect(normalizeLineEndings(input)).toBe(expected);
    });

    it('should convert standalone CR to LF', () => {
      const input = 'line1\rline2\rline3';
      const expected = 'line1\nline2\nline3';
      expect(normalizeLineEndings(input)).toBe(expected);
    });

    it('should preserve LF', () => {
      const input = 'line1\nline2\nline3';
      expect(normalizeLineEndings(input)).toBe(input);
    });

    it('should handle mixed line endings', () => {
      const input = 'line1\r\nline2\rline3\nline4';
      const expected = 'line1\nline2\nline3\nline4';
      expect(normalizeLineEndings(input)).toBe(expected);
    });
  });

  describe('removeBOM', () => {
    it('should remove UTF-8 BOM', () => {
      const withBOM = '\uFEFFcontent';
      expect(removeBOM(withBOM)).toBe('content');
    });

    it('should not modify content without BOM', () => {
      const noBOM = 'content';
      expect(removeBOM(noBOM)).toBe('content');
    });
  });

  describe('isBinaryFile', () => {
    it('should identify image files as binary', () => {
      expect(isBinaryFile('image.png')).toBe(true);
      expect(isBinaryFile('photo.jpg')).toBe(true);
      expect(isBinaryFile('icon.gif')).toBe(true);
    });

    it('should identify archive files as binary', () => {
      expect(isBinaryFile('archive.zip')).toBe(true);
      expect(isBinaryFile('package.tar.gz')).toBe(true);
    });

    it('should identify text files as non-binary', () => {
      expect(isBinaryFile('readme.md')).toBe(false);
      expect(isBinaryFile('script.js')).toBe(false);
      expect(isBinaryFile('config.yaml')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isBinaryFile('IMAGE.PNG')).toBe(true);
      expect(isBinaryFile('Archive.ZIP')).toBe(true);
    });
  });

  describe('hashFile', () => {
    it('should hash a text file', () => {
      const testFile = path.join(tempDir, 'test.txt');
      fs.writeFileSync(testFile, 'Hello, World!');

      const hash = hashFile(testFile);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce consistent hashes for same content', () => {
      const file1 = path.join(tempDir, 'file1.txt');
      const file2 = path.join(tempDir, 'file2.txt');
      fs.writeFileSync(file1, 'same content');
      fs.writeFileSync(file2, 'same content');

      expect(hashFile(file1)).toBe(hashFile(file2));
    });

    it('should produce different hashes for different content', () => {
      const file1 = path.join(tempDir, 'diff1.txt');
      const file2 = path.join(tempDir, 'diff2.txt');
      fs.writeFileSync(file1, 'content A');
      fs.writeFileSync(file2, 'content B');

      expect(hashFile(file1)).not.toBe(hashFile(file2));
    });

    it('should normalize line endings for consistent cross-platform hashing', () => {
      const fileLF = path.join(tempDir, 'lf.txt');
      const fileCRLF = path.join(tempDir, 'crlf.txt');
      fs.writeFileSync(fileLF, 'line1\nline2\n');
      fs.writeFileSync(fileCRLF, 'line1\r\nline2\r\n');

      expect(hashFile(fileLF)).toBe(hashFile(fileCRLF));
    });

    it('should throw error for non-existent file', () => {
      expect(() => hashFile(path.join(tempDir, 'nonexistent.txt'))).toThrow('File not found');
    });

    it('should throw error for directory', () => {
      expect(() => hashFile(tempDir)).toThrow('Cannot hash directory');
    });
  });

  describe('hashString', () => {
    it('should hash a string', () => {
      const hash = hashString('test content');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce consistent hashes', () => {
      expect(hashString('same')).toBe(hashString('same'));
    });

    it('should produce different hashes for different strings', () => {
      expect(hashString('one')).not.toBe(hashString('two'));
    });
  });

  describe('hashesMatch', () => {
    it('should match identical hashes', () => {
      const hash = 'sha256:abc123';
      expect(hashesMatch(hash, hash)).toBe(true);
    });

    it('should match hashes regardless of case', () => {
      expect(hashesMatch('sha256:ABC123', 'sha256:abc123')).toBe(true);
    });

    it('should not match different hashes', () => {
      expect(hashesMatch('sha256:abc', 'sha256:def')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(hashesMatch(null, 'sha256:abc')).toBe(false);
      expect(hashesMatch('sha256:abc', null)).toBe(false);
      expect(hashesMatch(undefined, undefined)).toBe(false);
    });
  });

  describe('getFileMetadata', () => {
    it('should return correct metadata', () => {
      const testFile = path.join(tempDir, 'meta.txt');
      fs.writeFileSync(testFile, 'test content');

      const metadata = getFileMetadata(testFile, tempDir);

      expect(metadata.path).toBe('meta.txt');
      expect(metadata.hash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(metadata.size).toBeGreaterThan(0);
      expect(metadata.isBinary).toBe(false);
    });

    it('should use forward slashes in path', () => {
      const subDir = path.join(tempDir, 'sub');
      fs.ensureDirSync(subDir);
      const testFile = path.join(subDir, 'nested.txt');
      fs.writeFileSync(testFile, 'nested');

      const metadata = getFileMetadata(testFile, tempDir);
      expect(metadata.path).toBe('sub/nested.txt');
      expect(metadata.path).not.toContain('\\');
    });
  });
});
