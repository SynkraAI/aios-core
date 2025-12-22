/**
 * Unit tests for generate-install-manifest.js
 * @story 6.18 - Dynamic Manifest & Brownfield Upgrade System
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const {
  generateManifest,
  getFileType,
  scanDirectory,
  FOLDERS_TO_COPY,
  ROOT_FILES_TO_COPY,
} = require('../../scripts/generate-install-manifest');

describe('generate-install-manifest', () => {
  describe('FOLDERS_TO_COPY', () => {
    it('should include v2.1 modular structure folders', () => {
      expect(FOLDERS_TO_COPY).toContain('core');
      expect(FOLDERS_TO_COPY).toContain('development');
      expect(FOLDERS_TO_COPY).toContain('product');
      expect(FOLDERS_TO_COPY).toContain('infrastructure');
    });

    it('should include v2.0 legacy folders', () => {
      expect(FOLDERS_TO_COPY).toContain('agents');
      expect(FOLDERS_TO_COPY).toContain('tasks');
      expect(FOLDERS_TO_COPY).toContain('templates');
      expect(FOLDERS_TO_COPY).toContain('workflows');
    });
  });

  describe('ROOT_FILES_TO_COPY', () => {
    it('should include essential root files', () => {
      expect(ROOT_FILES_TO_COPY).toContain('index.js');
      expect(ROOT_FILES_TO_COPY).toContain('core-config.yaml');
    });
  });

  describe('getFileType', () => {
    it('should identify agent files', () => {
      expect(getFileType('development/agents/dev.md')).toBe('agent');
      expect(getFileType('agents/pm.md')).toBe('agent');
    });

    it('should identify task files', () => {
      expect(getFileType('development/tasks/create-story.md')).toBe('task');
      expect(getFileType('tasks/validate.md')).toBe('task');
    });

    it('should identify workflow files', () => {
      expect(getFileType('development/workflows/deploy.yaml')).toBe('workflow');
      expect(getFileType('workflows/test.yaml')).toBe('workflow');
    });

    it('should identify template files', () => {
      expect(getFileType('product/templates/story.md')).toBe('template');
      expect(getFileType('templates/readme.md')).toBe('template');
    });

    it('should identify checklist files', () => {
      expect(getFileType('product/checklists/deploy.md')).toBe('checklist');
      expect(getFileType('checklists/qa.md')).toBe('checklist');
    });

    it('should identify code files', () => {
      expect(getFileType('index.js')).toBe('code');
      expect(getFileType('utils.ts')).toBe('code');
    });

    it('should identify config files', () => {
      expect(getFileType('config.yaml')).toBe('config');
      expect(getFileType('settings.yml')).toBe('config');
    });

    it('should identify documentation files', () => {
      expect(getFileType('readme.md')).toBe('documentation');
      expect(getFileType('docs/guide.md')).toBe('documentation');
    });

    it('should handle Windows-style paths', () => {
      expect(getFileType('development\\agents\\dev.md')).toBe('agent');
    });
  });

  describe('scanDirectory', () => {
    let tempDir;

    beforeAll(() => {
      tempDir = path.join(os.tmpdir(), 'scan-test-' + Date.now());
      fs.ensureDirSync(tempDir);

      // Create test structure
      fs.ensureDirSync(path.join(tempDir, 'subdir'));
      fs.writeFileSync(path.join(tempDir, 'file1.txt'), 'content1');
      fs.writeFileSync(path.join(tempDir, 'file2.md'), 'content2');
      fs.writeFileSync(path.join(tempDir, 'subdir', 'nested.js'), 'content3');
    });

    afterAll(() => {
      fs.removeSync(tempDir);
    });

    it('should find all files recursively', () => {
      const files = scanDirectory(tempDir, tempDir);
      expect(files.length).toBe(3);
    });

    it('should return absolute paths', () => {
      const files = scanDirectory(tempDir, tempDir);
      files.forEach(file => {
        expect(path.isAbsolute(file)).toBe(true);
      });
    });

    it('should return empty array for non-existent directory', () => {
      const files = scanDirectory(path.join(tempDir, 'nonexistent'), tempDir);
      expect(files).toEqual([]);
    });

    it('should exclude node_modules', () => {
      const nodeModulesDir = path.join(tempDir, 'node_modules');
      fs.ensureDirSync(nodeModulesDir);
      fs.writeFileSync(path.join(nodeModulesDir, 'package.json'), '{}');

      const files = scanDirectory(tempDir, tempDir);
      const hasNodeModules = files.some(f => f.includes('node_modules'));
      expect(hasNodeModules).toBe(false);

      fs.removeSync(nodeModulesDir);
    });
  });

  describe('generateManifest', () => {
    it('should generate valid manifest structure', async () => {
      const manifest = await generateManifest();

      expect(manifest).toHaveProperty('version');
      expect(manifest).toHaveProperty('generated_at');
      expect(manifest).toHaveProperty('generator');
      expect(manifest).toHaveProperty('file_count');
      expect(manifest).toHaveProperty('files');
      expect(Array.isArray(manifest.files)).toBe(true);
    });

    it('should include file metadata', async () => {
      const manifest = await generateManifest();

      expect(manifest.files.length).toBeGreaterThan(0);

      const sampleFile = manifest.files[0];
      expect(sampleFile).toHaveProperty('path');
      expect(sampleFile).toHaveProperty('hash');
      expect(sampleFile).toHaveProperty('type');
      expect(sampleFile).toHaveProperty('size');
    });

    it('should have hash with sha256 prefix', async () => {
      const manifest = await generateManifest();
      const sampleFile = manifest.files[0];

      expect(sampleFile.hash).toMatch(/^sha256:[a-f0-9]{64}$/);
    });

    it('should use forward slashes in paths', async () => {
      const manifest = await generateManifest();

      manifest.files.forEach(file => {
        expect(file.path).not.toContain('\\');
      });
    });

    it('should have files in consistent order', async () => {
      const manifest = await generateManifest();
      const paths = manifest.files.map(f => f.path);

      // Verify there are no duplicates (consistent ordering requirement)
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);

      // Run twice and verify same order
      const manifest2 = await generateManifest();
      const paths2 = manifest2.files.map(f => f.path);
      expect(paths).toEqual(paths2);
    });
  });
});
