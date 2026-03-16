const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

describe('validate-structure.js', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-validate-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('--dry-run mode', () => {
    test('should pass for non-existing project path', () => {
      const testPath = path.join(tempDir, 'new-project');

      const result = execSync(
        `node tools/validate-structure.js --dry-run "${testPath}"`,
        { encoding: 'utf-8' }
      );

      expect(result).toContain('4 / 4 checks passaram');
      expect(result).toContain('Destino aprovado');
    });

    test('should fail if project already exists (INDEX.md found)', async () => {
      const testPath = path.join(tempDir, 'existing-project');
      await fs.ensureDir(testPath);
      await fs.writeFile(path.join(testPath, 'INDEX.md'), '# Test');

      expect(() => {
        execSync(
          `node tools/validate-structure.js --dry-run "${testPath}"`,
          { encoding: 'utf-8' }
        );
      }).toThrow();
    });

    test('should fail if parent directory does not exist', () => {
      const testPath = '/non/existent/path/project';

      expect(() => {
        execSync(
          `node tools/validate-structure.js --dry-run "${testPath}"`,
          { encoding: 'utf-8' }
        );
      }).toThrow();
    });

    test('should validate that path is absolute', () => {
      const result = execSync(
        `node tools/validate-structure.js --dry-run ${tempDir}/new-project`,
        { encoding: 'utf-8' }
      );

      expect(result).toContain('Path absoluto');
    });
  });

  describe('validation mode (post-creation)', () => {
    test('should pass for properly structured project', async () => {
      // Create minimal valid structure
      await fs.ensureDir(path.join(tempDir, 'docs/stories/active'));
      await fs.ensureDir(path.join(tempDir, 'docs/stories/done'));
      await fs.ensureDir(path.join(tempDir, 'docs/stories/epics'));
      await fs.ensureDir(path.join(tempDir, 'docs/sessions/2026-03'));
      await fs.writeFile(
        path.join(tempDir, 'docs/INDEX.md'),
        '# Project\n\n## Metrics\n\n**Last Updated:** 2026-03-16\n'
      );
      await fs.writeFile(
        path.join(tempDir, 'docs/HANDOFFS-INDEX.md'),
        '# Handoffs\n'
      );

      const result = execSync(
        `node tools/validate-structure.js "${tempDir}"`,
        { encoding: 'utf-8' }
      );

      expect(result).toContain('6 / 6 checks passaram');
    });

    test('should fail if required directories are missing', async () => {
      // Create incomplete structure (missing stories/epics)
      await fs.ensureDir(path.join(tempDir, 'docs/stories/active'));
      await fs.writeFile(
        path.join(tempDir, 'docs/INDEX.md'),
        '# Project\n\n## Metrics\n\n**Last Updated:** 2026-03-16\n'
      );

      expect(() => {
        execSync(
          `node tools/validate-structure.js "${tempDir}"`,
          { encoding: 'utf-8' }
        );
      }).toThrow();
    });
  });
});
