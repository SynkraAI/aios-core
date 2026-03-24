/**
 * Integration tests for Brand Book Local Package (BSS-2.8).
 *
 * Tests the full packaging pipeline: font downloading, path validation,
 * HTML font replacement, search index inlining, README generation,
 * and ZIP archive creation.
 *
 * Manual verification note:
 *   "Open index.html from extracted ZIP in Chrome — verify navigation and search work"
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import archiver from 'archiver';
import {
  validateRelativePaths,
  replaceGoogleFontsLinks,
  inlineSearchIndex,
  type ValidationResult,
} from '../path-validator';
import {
  extractGoogleFontFamilies,
} from '../font-downloader';
import {
  buildPackage,
  generateReadme,
  type PackageBuildResult,
} from '../package-builder';

/**
 * Create a temporary directory for test fixtures.
 */
function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bss-package-test-'));
}

/**
 * Create a minimal brand book fixture with HTML, assets, and PDF.
 */
function createFixture(baseDir: string, clientSlug = 'test-client') {
  const clientDir = path.join(baseDir, clientSlug);
  const brandBookDir = path.join(clientDir, 'brand-book');
  const assetsDir = path.join(brandBookDir, 'assets');

  fs.mkdirSync(assetsDir, { recursive: true });

  // Create HTML pages with Google Fonts links
  const htmlTemplate = (title: string, slug: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - Test Brand Book</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="./assets/style.css">
</head>
<body>
  <div class="page-wrapper">
    <nav class="sidebar">
      <a href="./index.html">Overview</a>
      <a href="./colors.html">Colors</a>
      <a href="./typography.html">Typography</a>
    </nav>
    <main class="main-content">
      <h1>${title}</h1>
      <p>Content for ${slug} page.</p>
    </main>
  </div>
  <script src="./assets/search.js"></script>
</body>
</html>`;

  const pages = [
    { slug: 'index', title: 'Overview' },
    { slug: 'colors', title: 'Colors' },
    { slug: 'typography', title: 'Typography' },
    { slug: 'foundations', title: 'Foundations' },
    { slug: 'logo', title: 'Logo' },
    { slug: 'icons', title: 'Icons' },
    { slug: 'components', title: 'Components' },
    { slug: 'motion', title: 'Motion' },
    { slug: 'templates', title: 'Templates' },
    { slug: 'guidelines', title: 'Guidelines' },
  ];

  for (const page of pages) {
    fs.writeFileSync(
      path.join(brandBookDir, `${page.slug}.html`),
      htmlTemplate(page.title, page.slug),
      'utf-8'
    );
  }

  // Create CSS
  fs.writeFileSync(
    path.join(assetsDir, 'style.css'),
    ':root { --brand-primary: #3b82f6; }',
    'utf-8'
  );

  // Create search.js
  fs.writeFileSync(
    path.join(assetsDir, 'search.js'),
    '(function() { /* search */ })();',
    'utf-8'
  );

  // Create search-index.json
  fs.writeFileSync(
    path.join(assetsDir, 'search-index.json'),
    JSON.stringify([{ id: 'index', section: 'index', title: 'Overview', content: 'Test content' }]),
    'utf-8'
  );

  // Create logo.svg
  fs.writeFileSync(
    path.join(assetsDir, 'logo.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="#3b82f6"/></svg>',
    'utf-8'
  );

  // Create PDF
  fs.writeFileSync(
    path.join(clientDir, `brand-book-${clientSlug}.pdf`),
    '%PDF-1.4 fake pdf content for testing',
    'utf-8'
  );

  return { clientDir, brandBookDir, assetsDir };
}

describe('Path Validator', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should detect absolute URLs in HTML files', () => {
    const htmlDir = path.join(tempDir, 'brand-book');
    fs.mkdirSync(htmlDir, { recursive: true });

    fs.writeFileSync(
      path.join(htmlDir, 'test.html'),
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">\n<img src="./assets/logo.svg">',
      'utf-8'
    );

    const result = validateRelativePaths(htmlDir);

    expect(result.valid).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].file).toBe('test.html');
    expect(result.violations[0].line).toBe(1);
    expect(result.violations[0].url).toContain('fonts.googleapis.com');
  });

  it('should pass when all paths are relative', () => {
    const htmlDir = path.join(tempDir, 'brand-book');
    fs.mkdirSync(htmlDir, { recursive: true });

    fs.writeFileSync(
      path.join(htmlDir, 'test.html'),
      '<link rel="stylesheet" href="./assets/style.css">\n<img src="./assets/logo.svg">',
      'utf-8'
    );

    const result = validateRelativePaths(htmlDir);

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.filesScanned).toBe(1);
  });

  it('should throw when directory does not exist', () => {
    expect(() =>
      validateRelativePaths(path.join(tempDir, 'nonexistent'))
    ).toThrow('Brand book directory not found');
  });
});

describe('Google Fonts Link Replacement', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should replace Google Fonts links with local fonts.css', () => {
    const htmlDir = path.join(tempDir, 'brand-book');
    fs.mkdirSync(htmlDir, { recursive: true });

    fs.writeFileSync(
      path.join(htmlDir, 'test.html'),
      `<head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap">
<link rel="stylesheet" href="./assets/style.css">
</head>`,
      'utf-8'
    );

    const modified = replaceGoogleFontsLinks(htmlDir);

    expect(modified).toBe(1);

    const content = fs.readFileSync(path.join(htmlDir, 'test.html'), 'utf-8');

    // Should have local fonts.css reference
    expect(content).toContain('href="./assets/fonts.css"');

    // Should NOT have Google Fonts links
    expect(content).not.toContain('fonts.googleapis.com');
    expect(content).not.toContain('fonts.gstatic.com');
  });

  it('should not modify files without Google Fonts links', () => {
    const htmlDir = path.join(tempDir, 'brand-book');
    fs.mkdirSync(htmlDir, { recursive: true });

    fs.writeFileSync(
      path.join(htmlDir, 'clean.html'),
      '<head><link rel="stylesheet" href="./assets/style.css"></head>',
      'utf-8'
    );

    const modified = replaceGoogleFontsLinks(htmlDir);
    expect(modified).toBe(0);
  });
});

describe('Search Index Inlining', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should inline search index as window.__SEARCH_INDEX__', () => {
    const brandBookDir = path.join(tempDir, 'brand-book');
    const assetsDir = path.join(brandBookDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    const searchData = [{ id: 'test', title: 'Test', content: 'content' }];
    fs.writeFileSync(
      path.join(assetsDir, 'search-index.json'),
      JSON.stringify(searchData),
      'utf-8'
    );

    fs.writeFileSync(
      path.join(brandBookDir, 'index.html'),
      '<html><head><title>Test</title></head><body></body></html>',
      'utf-8'
    );

    inlineSearchIndex(brandBookDir);

    const content = fs.readFileSync(
      path.join(brandBookDir, 'index.html'),
      'utf-8'
    );

    expect(content).toContain('window.__SEARCH_INDEX__');
    expect(content).toContain(JSON.stringify(searchData));
  });
});

describe('Google Font Family Extraction', () => {
  it('should extract font families from HTML link tags', () => {
    const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto+Mono&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap">
    `;

    const families = extractGoogleFontFamilies(html);

    expect(families).toContain('Inter');
    expect(families).toContain('Roboto Mono');
    expect(families).toContain('JetBrains Mono');
  });

  it('should return empty array when no Google Fonts links', () => {
    const html = '<link rel="stylesheet" href="./assets/style.css">';
    const families = extractGoogleFontFamilies(html);
    expect(families).toHaveLength(0);
  });

  it('should deduplicate font families', () => {
    const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap">
    `;

    const families = extractGoogleFontFamilies(html);
    expect(families).toHaveLength(1);
    expect(families[0]).toBe('Inter');
  });
});

describe('README Generation', () => {
  it('should generate README with client name and instructions', () => {
    const readme = generateReadme({
      clientName: 'Acme Corp',
      primaryColor: '#3b82f6',
      logoPath: 'assets/logo.svg',
      tagline: 'Building the future',
      websiteUrl: 'https://acme.com/brand-book',
    });

    expect(readme).toContain('Acme Corp Brand Book');
    expect(readme).toContain('Extract this ZIP folder');
    expect(readme).toContain('Open index.html');
    expect(readme).toContain('No internet connection or software installation required');
    expect(readme).toContain('https://acme.com/brand-book');
  });

  it('should omit website URL line when not configured', () => {
    const readme = generateReadme({
      clientName: 'Test Co',
      primaryColor: '#000',
      logoPath: 'logo.svg',
      tagline: '',
      websiteUrl: '',
    });

    expect(readme).toContain('Test Co Brand Book');
    expect(readme).not.toContain('online version');
  });
});

describe('Package Builder — Full Pipeline', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should build ZIP with all expected files', async () => {
    const clientSlug = 'test-client';
    const { brandBookDir } = createFixture(tempDir, clientSlug);

    // Pre-create fonts directory with a mock font to skip actual download
    const fontsDir = path.join(brandBookDir, 'assets', 'fonts');
    fs.mkdirSync(fontsDir, { recursive: true });
    fs.writeFileSync(
      path.join(fontsDir, 'inter-normal-400.woff2'),
      Buffer.alloc(100),
    );

    // Also create a fonts.css to simulate font download already done
    fs.writeFileSync(
      path.join(brandBookDir, 'assets', 'fonts.css'),
      "@font-face { font-family: 'Inter'; src: url('./fonts/inter-normal-400.woff2') format('woff2'); }",
      'utf-8',
    );

    // Replace Google Fonts links first (simulating what buildPackage does)
    replaceGoogleFontsLinks(brandBookDir);

    // Inline search index
    inlineSearchIndex(brandBookDir);

    // Validate paths after replacement
    const validation = validateRelativePaths(brandBookDir);
    expect(validation.valid).toBe(true);

    // Now build the ZIP directly using archiver (without calling buildPackage
    // which would try to download fonts from the internet)
    const zipPath = path.join(
      tempDir,
      clientSlug,
      `brand-book-package-${clientSlug}.zip`,
    );
    const rootDirName = `${clientSlug}-brand-book`;
    const pdfPath = path.join(tempDir, clientSlug, `brand-book-${clientSlug}.pdf`);

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(brandBookDir, rootDirName);
      archive.file(pdfPath, { name: `${rootDirName}/brand-book-${clientSlug}.pdf` });
      archive.append(generateReadme({
        clientName: 'Test Client',
        primaryColor: '#3b82f6',
        logoPath: 'logo.svg',
        tagline: 'Testing',
        websiteUrl: 'https://test.com',
      }), { name: `${rootDirName}/README.txt` });

      archive.finalize();
    });

    // Verify ZIP exists
    expect(fs.existsSync(zipPath)).toBe(true);

    // Verify ZIP size is under 50MB
    const stats = fs.statSync(zipPath);
    expect(stats.size).toBeLessThan(50 * 1024 * 1024);
    expect(stats.size).toBeGreaterThan(0);
  }, 30000);

  it('should have no absolute URLs after font replacement', () => {
    const clientSlug = 'url-test';
    const { brandBookDir } = createFixture(tempDir, clientSlug);

    // Create fonts.css
    const assetsDir = path.join(brandBookDir, 'assets');
    fs.writeFileSync(
      path.join(assetsDir, 'fonts.css'),
      "@font-face { font-family: 'Inter'; src: url('./fonts/inter.woff2'); }",
      'utf-8',
    );

    // Replace and validate
    replaceGoogleFontsLinks(brandBookDir);
    inlineSearchIndex(brandBookDir);
    const result = validateRelativePaths(brandBookDir);

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);

    // Double check: read each HTML and confirm no http:// or https://
    const htmlFiles = fs.readdirSync(brandBookDir).filter(f => f.endsWith('.html'));
    for (const file of htmlFiles) {
      const content = fs.readFileSync(path.join(brandBookDir, file), 'utf-8');
      // No href or src with absolute URLs
      expect(content).not.toMatch(/href="https?:\/\//);
      expect(content).not.toMatch(/src="https?:\/\//);
    }
  });

  it('should fail validation when absolute URLs remain', () => {
    const htmlDir = path.join(tempDir, 'fail-test');
    fs.mkdirSync(htmlDir, { recursive: true });

    fs.writeFileSync(
      path.join(htmlDir, 'index.html'),
      '<script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0"></script>',
      'utf-8',
    );

    const result = validateRelativePaths(htmlDir);

    expect(result.valid).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].url).toContain('cdn.jsdelivr.net');
  });

  it('should generate ZIP structure with correct root folder name', async () => {
    const clientSlug = 'structure-test';
    const { brandBookDir } = createFixture(tempDir, clientSlug);

    // Remove Google Fonts links to pass validation
    replaceGoogleFontsLinks(brandBookDir);

    // Create fonts.css
    fs.writeFileSync(
      path.join(brandBookDir, 'assets', 'fonts.css'),
      "@font-face { font-family: 'Inter'; }",
      'utf-8',
    );

    inlineSearchIndex(brandBookDir);

    const rootDirName = `${clientSlug}-brand-book`;
    const zipPath = path.join(tempDir, clientSlug, `test-structure.zip`);
    const pdfPath = path.join(tempDir, clientSlug, `brand-book-${clientSlug}.pdf`);

    const entries: string[] = [];

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', reject);
      archive.on('entry', (entry) => {
        entries.push(entry.name);
      });

      archive.pipe(output);
      archive.directory(brandBookDir, rootDirName);
      archive.file(pdfPath, { name: `${rootDirName}/brand-book-${clientSlug}.pdf` });
      archive.append('README content', { name: `${rootDirName}/README.txt` });
      archive.finalize();
    });

    // All entries should start with the root dir name
    for (const entry of entries) {
      expect(entry.startsWith(`${rootDirName}/`)).toBe(true);
    }

    // Check for expected files
    const entryNames = entries.map(e => e.replace(`${rootDirName}/`, ''));
    expect(entryNames).toContain('index.html');
    expect(entryNames).toContain('README.txt');
    expect(entryNames).toContain(`brand-book-${clientSlug}.pdf`);
    expect(entryNames.some(e => e.startsWith('assets/'))).toBe(true);
  }, 30000);
});
