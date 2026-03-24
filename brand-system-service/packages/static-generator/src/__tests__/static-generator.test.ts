import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  loadBrandConfig,
  injectColors,
  injectTypography,
  injectSpacing,
  injectComponents,
  buildSearchIndex,
  StaticGenerator,
  BRAND_BOOK_PAGES,
  type BrandConfig,
} from '../static-generator';

describe('loadBrandConfig', () => {
  const tmpDir = path.join(os.tmpdir(), `bss-test-config-${Date.now()}`);

  beforeAll(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should load a valid brand config', () => {
    const configPath = path.join(tmpDir, 'brand.config.json');
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        clientName: 'TestBrand',
        primaryColor: '#FF0000',
        logoPath: 'logo.svg',
        tagline: 'Test tagline',
        websiteUrl: 'https://test.com',
      }),
      'utf-8'
    );

    const config = loadBrandConfig(configPath);
    expect(config.clientName).toBe('TestBrand');
    expect(config.primaryColor).toBe('#FF0000');
    expect(config.brandBookTitle).toBe('TestBrand Brand Book');
  });

  it('should throw if file does not exist', () => {
    expect(() => loadBrandConfig('/nonexistent/path.json')).toThrow('Brand config not found');
  });

  it('should throw if clientName is missing', () => {
    const configPath = path.join(tmpDir, 'bad.json');
    fs.writeFileSync(configPath, JSON.stringify({ primaryColor: '#FFF' }), 'utf-8');
    expect(() => loadBrandConfig(configPath)).toThrow('clientName');
  });

  it('should use custom brandBookTitle if provided', () => {
    const configPath = path.join(tmpDir, 'custom-title.json');
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        clientName: 'Custom',
        primaryColor: '#000',
        logoPath: 'logo.svg',
        brandBookTitle: 'My Custom Title',
      }),
      'utf-8'
    );

    const config = loadBrandConfig(configPath);
    expect(config.brandBookTitle).toBe('My Custom Title');
  });
});

describe('injectColors', () => {
  it('should extract color groups with swatches from token data', () => {
    const tokens = {
      color: {
        primary: {
          '50': { $value: '#feceff', $type: 'color', $description: 'primary 50' },
          '100': { $value: '#f1c1ff', $type: 'color', $description: 'primary 100' },
          '500': { $value: '#7631e5', $type: 'color', $description: 'primary 500' },
        },
        neutral: {
          '50': { $value: '#f5f3ff', $type: 'color', $description: 'Neutral 50' },
        },
      },
    };

    const groups = injectColors(tokens);
    expect(groups).toHaveLength(2);
    expect(groups[0].name).toBe('primary');
    expect(groups[0].swatches).toHaveLength(3);
    expect(groups[0].swatches[0].hex).toBe('#feceff');
    expect(groups[0].swatches[0].step).toBe('50');
  });

  it('should sort swatches numerically', () => {
    const tokens = {
      color: {
        test: {
          '500': { $value: '#000', $type: 'color', $description: 'test 500' },
          '50': { $value: '#fff', $type: 'color', $description: 'test 50' },
          '100': { $value: '#aaa', $type: 'color', $description: 'test 100' },
        },
      },
    };

    const groups = injectColors(tokens);
    expect(groups[0].swatches[0].step).toBe('50');
    expect(groups[0].swatches[1].step).toBe('100');
    expect(groups[0].swatches[2].step).toBe('500');
  });

  it('should handle WCAG extension data', () => {
    const tokens = {
      color: {
        brand: {
          '500': {
            $value: '#7631e5',
            $type: 'color',
            $description: 'brand 500',
            $extensions: { wcag: { onWhite: 4.5, onBlack: 2.1, aa: true, aaLarge: true, aaa: false } },
          },
        },
      },
    };

    const groups = injectColors(tokens);
    expect(groups[0].swatches[0].wcag).toBeDefined();
    expect(groups[0].swatches[0].wcag!.aa).toBe(true);
  });

  it('should return empty array for empty tokens', () => {
    const groups = injectColors({});
    expect(groups).toHaveLength(0);
  });
});

describe('injectTypography', () => {
  it('should extract typography specimens from token data', () => {
    const tokens = {
      fontSize: {
        xs: { $value: '12px', $type: 'dimension', $description: 'xs' },
        sm: { $value: '14px', $type: 'dimension', $description: 'sm' },
        base: { $value: '16px', $type: 'dimension', $description: 'base' },
        '3xl': {
          $value: '30px',
          $type: 'dimension',
          $description: '3xl',
          $extensions: { clamp: 'clamp(24px, 0.56vw + 1.39rem, 30px)' },
        },
      },
      lineHeight: {
        normal: { $value: 1.5, $type: 'number', $description: 'normal' },
      },
    };

    const specimens = injectTypography(tokens);
    expect(specimens.length).toBeGreaterThanOrEqual(3);
    expect(specimens[0].name).toBe('xs');
    expect(specimens[0].fontSize).toBe('12px');

    const specimen3xl = specimens.find((s) => s.name === '3xl');
    expect(specimen3xl).toBeDefined();
    expect(specimen3xl!.clamp).toContain('clamp');
  });

  it('should return empty array for missing fontSize', () => {
    const specimens = injectTypography({});
    expect(specimens).toHaveLength(0);
  });
});

describe('injectSpacing', () => {
  it('should extract spacing blocks from token data', () => {
    const tokens = {
      spacing: {
        '0': { $value: '0', $type: 'dimension', $description: 'No spacing' },
        '1': { $value: '8px', $type: 'dimension', $description: '8px' },
        '2': { $value: '16px', $type: 'dimension', $description: '16px' },
        $description: 'Spacing scale',
      },
    };

    const blocks = injectSpacing(tokens);
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    expect(blocks[0].name).toBe('0');
    expect(blocks[0].value).toBe('0');
    expect(blocks[1].name).toBe('1');
    expect(blocks[1].value).toBe('8px');
  });
});

describe('injectComponents', () => {
  const tmpDir = path.join(os.tmpdir(), `bss-test-components-${Date.now()}`);

  beforeAll(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, 'button.json'),
      JSON.stringify({
        button: {
          primary: {
            background: { $value: '#7631e5', $type: 'color', $description: 'Primary bg' },
            text: { $value: '#ffffff', $type: 'color', $description: 'Primary text' },
          },
          secondary: {
            background: { $value: '#f0f0f0', $type: 'color', $description: 'Secondary bg' },
          },
        },
      }),
      'utf-8'
    );
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should extract component groups from token files', () => {
    const groups = injectComponents(tmpDir);
    expect(groups.length).toBeGreaterThanOrEqual(2);

    const primary = groups.find((g) => g.name === 'button' && g.variant === 'primary');
    expect(primary).toBeDefined();
    expect(primary!.properties).toHaveLength(2);
    expect(primary!.properties[0].property).toBe('background');
  });

  it('should return empty array for non-existent directory', () => {
    const groups = injectComponents('/nonexistent/path');
    expect(groups).toHaveLength(0);
  });
});

describe('buildSearchIndex', () => {
  it('should create search entries from section content', () => {
    const sections = new Map<string, string>();
    sections.set('colors', '<h1>Colors</h1><p>Brand palette with WCAG badges.</p>');
    sections.set('typography', '<h1>Typography</h1><p>Type scale from xs to 7xl.</p>');

    const index = buildSearchIndex(sections);
    expect(index).toHaveLength(2);
    expect(index[0].section).toBe('colors');
    expect(index[0].title).toBe('Colors');
    expect(index[0].content).toContain('Brand palette');
    // HTML tags should be stripped
    expect(index[0].content).not.toContain('<h1>');
  });

  it('should skip unknown sections', () => {
    const sections = new Map<string, string>();
    sections.set('unknown-page', 'Some content');
    const index = buildSearchIndex(sections);
    expect(index).toHaveLength(0);
  });
});

describe('StaticGenerator (integration)', () => {
  const tmpDir = path.join(os.tmpdir(), `bss-test-generate-${Date.now()}`);
  const outputDir = path.join(tmpDir, 'output');
  const tokenDir = path.join(tmpDir, 'tokens');

  beforeAll(() => {
    // Create token structure
    fs.mkdirSync(path.join(tokenDir, 'primitive'), { recursive: true });
    fs.mkdirSync(path.join(tokenDir, 'semantic'), { recursive: true });
    fs.mkdirSync(path.join(tokenDir, 'component'), { recursive: true });

    // Write token files
    fs.writeFileSync(
      path.join(tokenDir, 'primitive', 'colors.json'),
      JSON.stringify({
        color: {
          primary: {
            '50': { $value: '#feceff', $type: 'color', $description: 'primary 50' },
            '500': { $value: '#7631e5', $type: 'color', $description: 'primary 500' },
            '900': { $value: '#27006e', $type: 'color', $description: 'primary 900' },
          },
        },
      }),
      'utf-8'
    );

    fs.writeFileSync(
      path.join(tokenDir, 'primitive', 'typography.json'),
      JSON.stringify({
        fontFamily: {
          display: { $value: 'Inter, sans-serif', $type: 'fontFamily', $description: 'Display' },
          body: { $value: 'Inter, sans-serif', $type: 'fontFamily', $description: 'Body' },
          mono: { $value: 'JetBrains Mono, monospace', $type: 'fontFamily', $description: 'Mono' },
        },
        fontSize: {
          base: { $value: '16px', $type: 'dimension', $description: 'base' },
          lg: { $value: '18px', $type: 'dimension', $description: 'lg' },
        },
        lineHeight: {
          normal: { $value: 1.5, $type: 'number', $description: 'normal' },
        },
      }),
      'utf-8'
    );

    fs.writeFileSync(
      path.join(tokenDir, 'primitive', 'spacing.json'),
      JSON.stringify({
        spacing: {
          '0': { $value: '0', $type: 'dimension', $description: 'No spacing' },
          '1': { $value: '8px', $type: 'dimension', $description: '8px' },
        },
      }),
      'utf-8'
    );

    fs.writeFileSync(
      path.join(tokenDir, 'primitive', 'effects.json'),
      JSON.stringify({
        motion: {
          duration: {
            fast: { $value: '100ms', $type: 'duration', $description: 'Fast' },
          },
          easing: {
            default: { $value: 'ease-in-out', $type: 'cubicBezier', $description: 'Default' },
          },
        },
      }),
      'utf-8'
    );

    fs.writeFileSync(
      path.join(tokenDir, 'semantic', 'colors.json'),
      JSON.stringify({
        success: {
          '500': { $value: '#008229', $type: 'color', $description: 'success 500' },
        },
      }),
      'utf-8'
    );

    fs.writeFileSync(
      path.join(tokenDir, 'typography-meta.json'),
      JSON.stringify({
        embedTag: '<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">',
        fonts: [
          { family: 'Inter', license: 'OFL', sourceUrl: 'https://fonts.google.com/specimen/Inter', webEmbeddingPermitted: true },
        ],
      }),
      'utf-8'
    );

    fs.writeFileSync(
      path.join(tokenDir, 'grid.config.json'),
      JSON.stringify({ baseUnit: 8, maxWidth: 1280, breakpoints: { sm: 640, md: 768, lg: 1024 } }),
      'utf-8'
    );

    fs.writeFileSync(
      path.join(tokenDir, 'component', 'button.json'),
      JSON.stringify({
        button: {
          primary: {
            background: { $value: '#7631e5', $type: 'color', $description: 'Primary bg' },
          },
        },
      }),
      'utf-8'
    );
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should generate all 10 HTML pages', async () => {
    const generator = new StaticGenerator(false);
    const brandConfig: BrandConfig = {
      clientName: 'TestBrand',
      primaryColor: '#7631e5',
      logoPath: 'logo.svg',
      tagline: 'Test tagline',
      websiteUrl: 'https://test.com',
      brandBookTitle: 'TestBrand Brand Book',
    };

    const result = await generator.generateBrandBook({
      clientSlug: 'test',
      outputDir,
      tokenDir,
      brandConfig,
    });

    expect(result).toContain('test');
    expect(result).toContain('brand-book');

    // Verify all 10 pages exist
    for (const page of BRAND_BOOK_PAGES) {
      const filePath = path.join(result, `${page.slug}.html`);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  it('should generate HTML with correct title from brand config', async () => {
    const brandBookDir = path.join(outputDir, 'test', 'brand-book');
    const indexHtml = fs.readFileSync(path.join(brandBookDir, 'index.html'), 'utf-8');

    expect(indexHtml).toContain('<title>');
    expect(indexHtml).toContain('TestBrand Brand Book');
  });

  it('should generate search index with content from all sections', async () => {
    const brandBookDir = path.join(outputDir, 'test', 'brand-book');
    const searchIndexPath = path.join(brandBookDir, 'assets', 'search-index.json');

    expect(fs.existsSync(searchIndexPath)).toBe(true);

    const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf-8'));
    expect(searchIndex.length).toBe(BRAND_BOOK_PAGES.length);

    // Every section should have content
    for (const entry of searchIndex) {
      expect(entry.section).toBeTruthy();
      expect(entry.title).toBeTruthy();
      expect(entry.content.length).toBeGreaterThan(0);
    }
  });

  it('should generate style.css in assets', async () => {
    const brandBookDir = path.join(outputDir, 'test', 'brand-book');
    const cssPath = path.join(brandBookDir, 'assets', 'style.css');
    expect(fs.existsSync(cssPath)).toBe(true);

    const css = fs.readFileSync(cssPath, 'utf-8');
    expect(css).toContain('--brand-primary');
  });

  it('should generate search.js in assets', async () => {
    const brandBookDir = path.join(outputDir, 'test', 'brand-book');
    const jsPath = path.join(brandBookDir, 'assets', 'search.js');
    expect(fs.existsSync(jsPath)).toBe(true);

    const js = fs.readFileSync(jsPath, 'utf-8');
    expect(js.length).toBeLessThan(5120); // < 5KB
    expect(js).toContain('Fuse');
  });

  it('should use relative paths (no absolute URLs except Google Fonts)', async () => {
    const brandBookDir = path.join(outputDir, 'test', 'brand-book');

    for (const page of BRAND_BOOK_PAGES) {
      const html = fs.readFileSync(path.join(brandBookDir, `${page.slug}.html`), 'utf-8');

      // Find all http:// or https:// URLs
      const absoluteUrls = html.match(/https?:\/\/[^\s"'<>]+/g) || [];

      // Filter out allowed ones (Google Fonts, CDN)
      const disallowed = absoluteUrls.filter(
        (url) =>
          !url.includes('fonts.googleapis.com') &&
          !url.includes('fonts.gstatic.com') &&
          !url.includes('cdn.jsdelivr.net') &&
          !url.includes('fonts.google.com') &&
          !url.includes('test.com') &&
          !url.includes('example.com')
      );

      expect(disallowed).toHaveLength(0);
    }
  });

  it('should generate semantic HTML elements', async () => {
    const brandBookDir = path.join(outputDir, 'test', 'brand-book');
    const indexHtml = fs.readFileSync(path.join(brandBookDir, 'index.html'), 'utf-8');

    expect(indexHtml).toContain('<nav');
    expect(indexHtml).toContain('<main');
    expect(indexHtml).toContain('<footer');
    expect(indexHtml).toContain('<header');
    expect(indexHtml).toContain('role="navigation"');
    expect(indexHtml).toContain('role="main"');
  });

  it('should have alt text on all images', async () => {
    const brandBookDir = path.join(outputDir, 'test', 'brand-book');

    for (const page of BRAND_BOOK_PAGES) {
      const html = fs.readFileSync(path.join(brandBookDir, `${page.slug}.html`), 'utf-8');
      const imgTags = html.match(/<img[^>]+>/g) || [];

      for (const img of imgTags) {
        expect(img).toContain('alt=');
      }
    }
  });

  it('should include focus-visible CSS', async () => {
    const brandBookDir = path.join(outputDir, 'test', 'brand-book');
    const css = fs.readFileSync(path.join(brandBookDir, 'assets', 'style.css'), 'utf-8');
    expect(css).toContain(':focus-visible');
  });

  it('should generate logo.svg in assets', async () => {
    const brandBookDir = path.join(outputDir, 'test', 'brand-book');
    expect(fs.existsSync(path.join(brandBookDir, 'assets', 'logo.svg'))).toBe(true);
  });
});
