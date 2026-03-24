/**
 * Tests for Static Package Exporter (BSS-5.8)
 *
 * Covers:
 * - ZIP created at correct path — AC-1, AC-3
 * - index.html verification pass/fail — AC-7
 * - README.txt content includes all 4 deployment methods — AC-4
 * - Asset deduplication — AC-8
 * - Sitemap and robots inclusion — AC-5, AC-6
 * - File count and size logging — AC-9
 * - CLI --export flag support — AC-10
 * - End-to-end: build → export → unzip → verify — AC-11
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Open } from 'unzipper';
import { StaticPackageExporter } from '../exporter/static-package-exporter';
import { ExportError } from '../exporter/types';
import type { ExportOptions } from '../exporter/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bss-export-test-'));
}

/**
 * Create a minimal static site structure for testing.
 */
function createMockSite(dir: string, options?: {
  withSitemap?: boolean;
  withRobots?: boolean;
  withDuplicates?: boolean;
}): void {
  const { withSitemap = true, withRobots = true } = options ?? {};

  // Create basic HTML
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1></body></html>',
    'utf-8'
  );

  // CSS
  fs.writeFileSync(
    path.join(dir, 'styles.min.css'),
    'body{margin:0}',
    'utf-8'
  );

  // JS
  fs.writeFileSync(
    path.join(dir, 'scripts.min.js'),
    'console.log("ok")',
    'utf-8'
  );

  // Tokens
  fs.writeFileSync(
    path.join(dir, 'tokens.css'),
    ':root{--color-primary:#3b82f6}',
    'utf-8'
  );

  // Assets
  fs.mkdirSync(path.join(dir, 'assets', 'images'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'assets', 'images', 'logo.png'),
    'PNG_PLACEHOLDER',
    'utf-8'
  );

  fs.mkdirSync(path.join(dir, 'assets', 'fonts'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'assets', 'fonts', 'body.woff2'),
    'WOFF2_PLACEHOLDER',
    'utf-8'
  );

  if (withSitemap) {
    fs.writeFileSync(
      path.join(dir, 'sitemap.xml'),
      '<?xml version="1.0"?><urlset><url><loc>https://example.com/</loc></url></urlset>',
      'utf-8'
    );
  }

  if (withRobots) {
    fs.writeFileSync(
      path.join(dir, 'robots.txt'),
      'User-agent: *\nAllow: /\n',
      'utf-8'
    );
  }
}

function createDefaultOptions(sourceDir: string, outputPath: string): ExportOptions {
  return {
    clientId: 'test-client',
    buildType: 'landing-page',
    sourceDir,
    outputPath,
  };
}

// ---------------------------------------------------------------------------
// Cleanup helper
// ---------------------------------------------------------------------------

const tempDirs: string[] = [];

afterAll(() => {
  for (const dir of tempDirs) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
});

function trackTempDir(): string {
  const dir = createTempDir();
  tempDirs.push(dir);
  return dir;
}

// ---------------------------------------------------------------------------
// AC-1, AC-3: ZIP creation
// ---------------------------------------------------------------------------

describe('StaticPackageExporter', () => {
  let exporter: StaticPackageExporter;

  beforeEach(() => {
    exporter = new StaticPackageExporter();
  });

  describe('export', () => {
    it('creates ZIP at the specified output path', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir);
      const outputDir = trackTempDir();
      const zipPath = path.join(outputDir, 'test.zip');

      await exporter.export(createDefaultOptions(sourceDir, zipPath));

      expect(fs.existsSync(zipPath)).toBe(true);
    });

    it('preserves directory structure in ZIP', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir);
      const outputDir = trackTempDir();
      const zipPath = path.join(outputDir, 'test.zip');

      await exporter.export(createDefaultOptions(sourceDir, zipPath));

      const directory = await Open.file(zipPath);
      const paths = directory.files.map((f) => f.path);

      expect(paths).toContain('index.html');
      expect(paths).toContain('styles.min.css');
      expect(paths).toContain('scripts.min.js');
      expect(paths).toContain('tokens.css');
      expect(paths.some((p) => p.includes('assets/images/logo.png'))).toBe(true);
      expect(paths.some((p) => p.includes('assets/fonts/body.woff2'))).toBe(true);
    });

    it('returns correct ExportResult', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir);
      const outputDir = trackTempDir();
      const zipPath = path.join(outputDir, 'test.zip');

      const result = await exporter.export(createDefaultOptions(sourceDir, zipPath));

      expect(result.zipPath).toBe(zipPath);
      expect(result.fileCount).toBeGreaterThan(0);
      expect(result.sizeBytes).toBeGreaterThan(0);
      expect(parseFloat(result.sizeKB)).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // AC-7: ZIP verification
  // ---------------------------------------------------------------------------

  describe('verification', () => {
    it('passes when index.html is present', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir);
      const outputDir = trackTempDir();
      const zipPath = path.join(outputDir, 'test.zip');

      // Should not throw
      await expect(
        exporter.export(createDefaultOptions(sourceDir, zipPath))
      ).resolves.toBeDefined();
    });

    it('throws ExportError when sourceDir does not exist', async () => {
      const zipPath = path.join(trackTempDir(), 'test.zip');

      await expect(
        exporter.export({
          ...createDefaultOptions('/nonexistent/path', zipPath),
        })
      ).rejects.toThrow(ExportError);
    });

    it('throws ExportError when sourceDir is empty', async () => {
      const sourceDir = trackTempDir();
      const zipPath = path.join(trackTempDir(), 'test.zip');

      await expect(
        exporter.export(createDefaultOptions(sourceDir, zipPath))
      ).rejects.toThrow(ExportError);
    });
  });

  // ---------------------------------------------------------------------------
  // AC-4: README.txt
  // ---------------------------------------------------------------------------

  describe('README.txt', () => {
    it('includes README.txt in ZIP when includeReadme is true', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir);
      const zipPath = path.join(trackTempDir(), 'test.zip');

      await exporter.export({ ...createDefaultOptions(sourceDir, zipPath), includeReadme: true });

      const directory = await Open.file(zipPath);
      const readmeEntry = directory.files.find((f) => f.path === 'README.txt');
      expect(readmeEntry).toBeDefined();
    });

    it('README.txt contains all 4 deployment methods', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir);
      const zipPath = path.join(trackTempDir(), 'test.zip');

      await exporter.export(createDefaultOptions(sourceDir, zipPath));

      const directory = await Open.file(zipPath);
      const readmeEntry = directory.files.find((f) => f.path === 'README.txt');
      expect(readmeEntry).toBeDefined();

      const content = (await readmeEntry!.buffer()).toString('utf-8');
      expect(content).toContain('HOW TO VIEW YOUR SITE LOCALLY');
      expect(content).toContain('DEPLOY TO VERCEL');
      expect(content).toContain('DEPLOY TO NETLIFY');
      expect(content).toContain('DEPLOY TO GITHUB PAGES');
      expect(content).toContain('Double-click index.html');
    });

    it('excludes README.txt when includeReadme is false', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir);
      const zipPath = path.join(trackTempDir(), 'test.zip');

      await exporter.export({
        ...createDefaultOptions(sourceDir, zipPath),
        includeReadme: false,
      });

      const directory = await Open.file(zipPath);
      const readmeEntry = directory.files.find((f) => f.path === 'README.txt');
      expect(readmeEntry).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // AC-5, AC-6: Sitemap and robots
  // ---------------------------------------------------------------------------

  describe('sitemap and robots', () => {
    it('includes sitemap.xml when present and includeSitemap is true', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir, { withSitemap: true });
      const zipPath = path.join(trackTempDir(), 'test.zip');

      await exporter.export(createDefaultOptions(sourceDir, zipPath));

      const directory = await Open.file(zipPath);
      const sitemapEntry = directory.files.find((f) => f.path === 'sitemap.xml');
      expect(sitemapEntry).toBeDefined();
    });

    it('excludes sitemap.xml when includeSitemap is false', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir, { withSitemap: true });
      const zipPath = path.join(trackTempDir(), 'test.zip');

      await exporter.export({
        ...createDefaultOptions(sourceDir, zipPath),
        includeSitemap: false,
      });

      const directory = await Open.file(zipPath);
      const sitemapEntry = directory.files.find((f) => f.path === 'sitemap.xml');
      expect(sitemapEntry).toBeUndefined();
    });

    it('always includes robots.txt when present', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir, { withRobots: true });
      const zipPath = path.join(trackTempDir(), 'test.zip');

      await exporter.export(createDefaultOptions(sourceDir, zipPath));

      const directory = await Open.file(zipPath);
      const robotsEntry = directory.files.find((f) => f.path === 'robots.txt');
      expect(robotsEntry).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // AC-8: Deduplication
  // ---------------------------------------------------------------------------

  describe('asset deduplication', () => {
    it('each file appears only once in ZIP', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir);
      const zipPath = path.join(trackTempDir(), 'test.zip');

      await exporter.export(createDefaultOptions(sourceDir, zipPath));

      const directory = await Open.file(zipPath);
      const paths = directory.files.map((f) => f.path);
      const uniquePaths = new Set(paths);
      expect(paths.length).toBe(uniquePaths.size);
    });
  });

  // ---------------------------------------------------------------------------
  // AC-10: CLI flag
  // ---------------------------------------------------------------------------

  describe('CLI --export flag', () => {
    it('cli.ts exists and contains --export handling', () => {
      const cliPath = path.resolve(__dirname, '..', 'cli.ts');
      const content = fs.readFileSync(cliPath, 'utf-8');
      expect(content).toContain('--export');
      expect(content).toContain('StaticPackageExporter');
    });
  });

  // ---------------------------------------------------------------------------
  // AC-11: End-to-end test
  // ---------------------------------------------------------------------------

  describe('end-to-end: build → export → unzip → verify', () => {
    it('creates a valid ZIP that contains index.html with expected HTML', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir);
      const zipPath = path.join(trackTempDir(), 'e2e-test.zip');

      // Export
      const result = await exporter.export(createDefaultOptions(sourceDir, zipPath));
      expect(fs.existsSync(result.zipPath)).toBe(true);

      // Unzip and verify
      const directory = await Open.file(zipPath);
      const indexEntry = directory.files.find((f) => f.path === 'index.html');
      expect(indexEntry).toBeDefined();

      const content = (await indexEntry!.buffer()).toString('utf-8');
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<h1>Hello</h1>');
      expect(content).toContain('</html>');
    });

    it('ZIP file count includes all source files + README', async () => {
      const sourceDir = trackTempDir();
      createMockSite(sourceDir);
      const zipPath = path.join(trackTempDir(), 'e2e-test.zip');

      const result = await exporter.export(createDefaultOptions(sourceDir, zipPath));

      // Source files: index.html, styles.min.css, scripts.min.js, tokens.css,
      //   assets/images/logo.png, assets/fonts/body.woff2, sitemap.xml, robots.txt
      // + README.txt
      expect(result.fileCount).toBe(9);
    });
  });
});
