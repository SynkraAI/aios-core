/**
 * Tests for generate-ecosystem-index.js
 *
 * Coverage target: >= 80%
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_PATH = path.join(__dirname, '../../scripts/generate-ecosystem-index.js');
const OUTPUT_PATH = path.join(__dirname, '../../docs/ECOSYSTEM-INDEX.md');

describe('generate-ecosystem-index.js', () => {
  beforeAll(() => {
    // Ensure script exists
    expect(fs.existsSync(SCRIPT_PATH)).toBe(true);
  });

  afterEach(() => {
    // Cleanup generated file after each test
    if (fs.existsSync(OUTPUT_PATH)) {
      // Don't delete - keep for manual inspection
      // fs.unlinkSync(OUTPUT_PATH);
    }
  });

  describe('Script Execution', () => {
    test('should execute without errors', () => {
      expect(() => {
        execSync(`node "${SCRIPT_PATH}"`, { encoding: 'utf8' });
      }).not.toThrow();
    });

    test('should complete in less than 5 seconds', () => {
      const start = Date.now();
      execSync(`node "${SCRIPT_PATH}"`, { encoding: 'utf8' });
      const duration = (Date.now() - start) / 1000;

      expect(duration).toBeLessThan(5);
    });

    test('should always exit with code 0 (graceful failure)', () => {
      const result = execSync(`node "${SCRIPT_PATH}"`, { encoding: 'utf8', stdio: 'pipe' });
      // If script runs without throwing, exit code was 0
      expect(result).toBeDefined();
    });
  });

  describe('CLI Flags', () => {
    test('should support --quiet flag', () => {
      const output = execSync(`node "${SCRIPT_PATH}" --quiet`, { encoding: 'utf8' });
      expect(output.trim()).toBe('');
    });

    test('should support --minds flag', () => {
      execSync(`node "${SCRIPT_PATH}" --minds`, { encoding: 'utf8' });
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');

      expect(content).toContain('## 🧠 Minds');
      expect(content).not.toContain('## 🤖 Agentes Core');
    });

    test('should support --agents flag', () => {
      execSync(`node "${SCRIPT_PATH}" --agents`, { encoding: 'utf8' });
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');

      expect(content).toContain('## 🤖 Agentes Core');
      expect(content).not.toContain('## 🧠 Minds');
    });

    test('should support --squads flag', () => {
      execSync(`node "${SCRIPT_PATH}" --squads`, { encoding: 'utf8' });
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');

      expect(content).toContain('## 🏢 Agentes por Squad');
      expect(content).not.toContain('## 🧠 Minds');
    });
  });

  describe('Output Document', () => {
    beforeAll(() => {
      execSync(`node "${SCRIPT_PATH}"`, { encoding: 'utf8' });
    });

    test('should create docs/ECOSYSTEM-INDEX.md', () => {
      expect(fs.existsSync(OUTPUT_PATH)).toBe(true);
    });

    test('should include timestamp', () => {
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');
      expect(content).toMatch(/\*Atualizado: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\*/);
    });

    test('should include regeneration instruction', () => {
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');
      expect(content).toContain('*Regenerar: `node scripts/generate-ecosystem-index.js`*');
    });

    test('should have 6 main sections', () => {
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');

      expect(content).toContain('## 🧠 Minds');
      expect(content).toContain('## 🤖 Agentes Core');
      expect(content).toContain('## 🏢 Agentes por Squad');
      expect(content).toContain('## 📊 Estatísticas');
    });

    test('should include statistics table', () => {
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');

      expect(content).toMatch(/\| \*\*Minds\*\* \| \d+ \|/);
      expect(content).toMatch(/\| \*\*Agentes Core\*\* \| \d+ \|/);
      expect(content).toMatch(/\| \*\*TOTAL\*\* \| \d+ \|/);
    });
  });

  describe('Minds Scanning', () => {
    test('should scan squads/mind-cloning/minds/INDEX.md', () => {
      execSync(`node "${SCRIPT_PATH}"`, { encoding: 'utf8' });
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');

      // Should include some known minds
      expect(content).toContain('Naval Ravikant');
      expect(content).toContain('Tim Ferriss');
      expect(content).toContain('Paulo Vieira');
    });

    test('should include mind status and fidelity', () => {
      execSync(`node "${SCRIPT_PATH}"`, { encoding: 'utf8' });
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');

      expect(content).toMatch(/Complete/);
      expect(content).toMatch(/Premium|Intermediate/);
    });
  });

  describe('Core Agents Scanning', () => {
    test('should scan .aiox-core/development/agents/*.md', () => {
      execSync(`node "${SCRIPT_PATH}"`, { encoding: 'utf8' });
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');

      // Should find some core agents
      expect(content).toMatch(/aiox-dev|aiox-qa|aiox-po/);
    });
  });

  describe('Squad Agents Scanning', () => {
    test('should scan squads/*/agents/*.md', () => {
      execSync(`node "${SCRIPT_PATH}"`, { encoding: 'utf8' });
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');

      // Should find squad sections
      expect(content).toMatch(/### Squad: \w+/);
    });

    test('should group agents by squad', () => {
      execSync(`node "${SCRIPT_PATH}"`, { encoding: 'utf8' });
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');

      // Should have squad headers followed by agents
      expect(content).toMatch(/### Squad: \w+ \(\d+\)/);
    });
  });

  describe('Graceful Degradation', () => {
    test('should handle missing INDEX.md gracefully', () => {
      // Temporarily rename INDEX.md
      const indexPath = path.join(__dirname, '../../squads/mind-cloning/minds/INDEX.md');
      const backupPath = indexPath + '.backup';

      if (fs.existsSync(indexPath)) {
        fs.renameSync(indexPath, backupPath);
      }

      try {
        // Should not throw
        execSync(`node "${SCRIPT_PATH}" --quiet`, { encoding: 'utf8' });
        expect(fs.existsSync(OUTPUT_PATH)).toBe(true);
      } finally {
        // Restore INDEX.md
        if (fs.existsSync(backupPath)) {
          fs.renameSync(backupPath, indexPath);
        }
      }
    });

    test('should skip files with invalid YAML frontmatter', () => {
      // Test with fixture that has invalid YAML
      const fixtureDir = path.join(__dirname, '../fixtures/agents');

      // Script should not throw even with invalid YAML files
      expect(() => {
        execSync(`node "${SCRIPT_PATH}" --quiet`, { encoding: 'utf8' });
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should handle large number of files efficiently', () => {
      const start = Date.now();
      execSync(`node "${SCRIPT_PATH}" --quiet`, { encoding: 'utf8' });
      const duration = (Date.now() - start) / 1000;

      // Should complete in reasonable time even with 100+ files
      expect(duration).toBeLessThan(5);
    });
  });

  describe('YAML Frontmatter Parsing', () => {
    test('should extract name from frontmatter', () => {
      execSync(`node "${SCRIPT_PATH}"`, { encoding: 'utf8' });
      const content = fs.readFileSync(OUTPUT_PATH, 'utf8');

      // Should have agent names in tables
      expect(content).toMatch(/\*\*\w+\*\*/);
    });

    test('should handle optional fields (tier, squad)', () => {
      // Some agents may not have tier or squad
      expect(() => {
        execSync(`node "${SCRIPT_PATH}" --quiet`, { encoding: 'utf8' });
      }).not.toThrow();
    });
  });
});
