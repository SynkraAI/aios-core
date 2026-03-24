/**
 * Style Dictionary Build Pipeline Tests
 *
 * Tests run the build CLI via subprocess since Style Dictionary 4.x
 * is ESM-only and not compatible with ts-jest/CommonJS transform.
 *
 * @see BSS-2.2: Style Dictionary Build Pipeline
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const bssRoot = path.resolve(__dirname, '../../../..');
const outputDir = path.resolve(bssRoot, 'output');
const testOutputDir = path.resolve(outputDir, 'test-sd');
const tsxBin = path.resolve(bssRoot, 'node_modules/.bin/tsx');

function runBuild(clientSlug: string): void {
  execSync(
    `${tsxBin} packages/tokens/bin/build.ts --client=${clientSlug}`,
    { cwd: bssRoot, timeout: 30000 },
  );
}

// Build once for all tests
beforeAll(() => {
  if (fs.existsSync(testOutputDir)) {
    fs.rmSync(testOutputDir, { recursive: true });
  }
  runBuild('test-sd');
}, 60000);

afterAll(() => {
  for (const dir of ['test-sd', 'acme-isolation', 'perf-test']) {
    const d = path.resolve(outputDir, dir);
    if (fs.existsSync(d)) {
      fs.rmSync(d, { recursive: true });
    }
  }
});

describe('Style Dictionary Build Pipeline', () => {
  describe('Build Configuration (Task 1, AC 1)', () => {
    it('should generate all 4 output files', () => {
      expect(fs.existsSync(path.join(testOutputDir, 'tokens.css'))).toBe(true);
      expect(fs.existsSync(path.join(testOutputDir, 'tokens.scss'))).toBe(true);
      expect(fs.existsSync(path.join(testOutputDir, 'tailwind-tokens.ts'))).toBe(true);
      expect(fs.existsSync(path.join(testOutputDir, 'tokens.json'))).toBe(true);
    });
  });

  describe('CSS Custom Properties Output (Task 2, AC 2)', () => {
    let cssContent: string;

    beforeAll(() => {
      cssContent = fs.readFileSync(path.join(testOutputDir, 'tokens.css'), 'utf8');
    });

    it('should contain :root block', () => {
      expect(cssContent).toContain(':root {');
    });

    it('should generate CSS custom properties with -- prefix', () => {
      expect(cssContent).toContain('--color-primary-500:');
      expect(cssContent).toContain('--spacing-4:');
      expect(cssContent).toContain('--border-radius-md:');
    });

    it('should resolve token references to actual values', () => {
      expect(cssContent).toContain('#7631e5');
      expect(cssContent).toContain('16px');
    });

    it('should include primitive color tokens', () => {
      expect(cssContent).toContain('--color-primary-50:');
      expect(cssContent).toContain('--color-neutral-900:');
      expect(cssContent).toContain('--color-secondary-500:');
    });

    it('should include semantic color tokens', () => {
      expect(cssContent).toContain('--interactive-default:');
      expect(cssContent).toContain('--text-default:');
      expect(cssContent).toContain('--background-default:');
    });

    it('should include dark mode tokens', () => {
      expect(cssContent).toContain('--dark-');
    });

    it('should include component tokens', () => {
      expect(cssContent).toContain('--button-');
      expect(cssContent).toContain('--card-');
      expect(cssContent).toContain('--input-');
    });

    it('should include motion tokens', () => {
      expect(cssContent).toContain('--motion-duration-fast:');
      expect(cssContent).toContain('--motion-easing-default:');
    });
  });

  describe('SCSS Variables Output (Task 3, AC 3)', () => {
    let scssContent: string;

    beforeAll(() => {
      scssContent = fs.readFileSync(path.join(testOutputDir, 'tokens.scss'), 'utf8');
    });

    it('should contain SCSS variables with $ prefix', () => {
      expect(scssContent).toContain('$color-primary-500:');
      expect(scssContent).toContain('$spacing-4:');
    });

    it('should resolve references to actual values', () => {
      expect(scssContent).toContain('#7631e5');
    });

    it('should contain auto-generated header', () => {
      expect(scssContent).toContain('Do not edit directly');
    });
  });

  describe('Tailwind Config TypeScript Output (Task 4, AC 4)', () => {
    let tailwindContent: string;

    beforeAll(() => {
      tailwindContent = fs.readFileSync(
        path.join(testOutputDir, 'tailwind-tokens.ts'),
        'utf8',
      );
    });

    it('should export a default const object', () => {
      expect(tailwindContent).toContain('const tailwindTokens =');
      expect(tailwindContent).toContain('as const;');
      expect(tailwindContent).toContain('export default tailwindTokens;');
    });

    it('should contain colors mapping', () => {
      expect(tailwindContent).toContain('"colors"');
      expect(tailwindContent).toContain('"#7631e5"');
    });

    it('should contain fontFamily mapping', () => {
      expect(tailwindContent).toContain('"fontFamily"');
      expect(tailwindContent).toContain('Inter');
    });

    it('should contain fontSize mapping', () => {
      expect(tailwindContent).toContain('"fontSize"');
      expect(tailwindContent).toContain('"16px"');
    });

    it('should contain spacing mapping', () => {
      expect(tailwindContent).toContain('"spacing"');
    });

    it('should contain borderRadius mapping', () => {
      expect(tailwindContent).toContain('"borderRadius"');
    });

    it('should contain boxShadow mapping', () => {
      expect(tailwindContent).toContain('"boxShadow"');
    });

    it('should contain transitionDuration mapping', () => {
      expect(tailwindContent).toContain('"transitionDuration"');
      expect(tailwindContent).toContain('"100ms"');
    });

    it('should contain transitionTimingFunction mapping', () => {
      expect(tailwindContent).toContain('"transitionTimingFunction"');
      expect(tailwindContent).toContain('"ease-in-out"');
    });
  });

  describe('JSON Flat Export (Task 5, AC 5)', () => {
    let jsonContent: Record<string, unknown>;

    beforeAll(() => {
      const raw = fs.readFileSync(path.join(testOutputDir, 'tokens.json'), 'utf8');
      jsonContent = JSON.parse(raw);
    });

    it('should be a flat key-value map', () => {
      for (const value of Object.values(jsonContent)) {
        expect(['string', 'number'].includes(typeof value)).toBe(true);
      }
    });

    it('should contain resolved color values', () => {
      const hasPrimary500 = Object.values(jsonContent).includes('#7631e5');
      expect(hasPrimary500).toBe(true);
    });

    it('should not contain nested objects', () => {
      for (const value of Object.values(jsonContent)) {
        expect(typeof value).not.toBe('object');
      }
    });
  });

  describe('Client Isolation (Task 6, AC 6)', () => {
    const acmeDir = path.resolve(outputDir, 'acme-isolation');

    afterAll(() => {
      if (fs.existsSync(acmeDir)) {
        fs.rmSync(acmeDir, { recursive: true });
      }
    });

    it('should build to client-specific output directory', () => {
      runBuild('acme-isolation');

      expect(fs.existsSync(path.join(acmeDir, 'tokens.css'))).toBe(true);
      expect(fs.existsSync(path.join(acmeDir, 'tokens.scss'))).toBe(true);
      expect(fs.existsSync(path.join(acmeDir, 'tailwind-tokens.ts'))).toBe(true);
      expect(fs.existsSync(path.join(acmeDir, 'tokens.json'))).toBe(true);
    }, 30000);

    it('should not write to other client directories', () => {
      const phantomDir = path.resolve(outputDir, 'phantom-client');
      expect(fs.existsSync(phantomDir)).toBe(false);
    });
  });

  describe('Performance (Task 10, AC 9)', () => {
    it('should complete build in under 10 seconds (includes tsx startup)', () => {
      // AC 9 requires SD build < 5s. The SD build itself runs in ~300ms.
      // Subprocess tsx startup adds ~3-5s overhead in CI/WSL.
      // We use 10s as the subprocess-inclusive threshold.
      const start = Date.now();
      runBuild('perf-test');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(10000);
    }, 30000);
  });
});
