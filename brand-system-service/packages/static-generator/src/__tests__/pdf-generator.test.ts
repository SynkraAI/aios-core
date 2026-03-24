import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PdfGenerator, type PdfGeneratorConfig } from '../pdf-generator';
import { BRAND_BOOK_PAGES, type BrandConfig } from '../static-generator';

// Mock Puppeteer since headless Chrome may not be available in test environments
jest.mock('puppeteer', () => {
  const mockPdfBuffer = Buffer.from('%PDF-1.4 mock content for testing purposes'.repeat(100));

  const mockPage = {
    setContent: jest.fn().mockResolvedValue(undefined),
    evaluate: jest.fn().mockResolvedValue(undefined),
    waitForNetworkIdle: jest.fn().mockResolvedValue(undefined),
    pdf: jest.fn().mockResolvedValue(mockPdfBuffer),
  };

  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(undefined),
  };

  return {
    __esModule: true,
    default: {
      launch: jest.fn().mockResolvedValue(mockBrowser),
    },
    _mockPage: mockPage,
    _mockBrowser: mockBrowser,
  };
});

describe('PdfGenerator', () => {
  const tmpDir = path.join(os.tmpdir(), `bss-pdf-test-${Date.now()}`);
  const outputDir = path.join(tmpDir, 'output');
  const clientSlug = 'test-client';
  const brandBookDir = path.join(outputDir, clientSlug, 'brand-book');

  const brandConfig: BrandConfig = {
    clientName: 'TestBrand',
    primaryColor: '#7631e5',
    logoPath: 'logo.svg',
    tagline: 'A test brand',
    websiteUrl: 'https://test.com',
    brandBookTitle: 'TestBrand Brand Book',
  };

  const defaultConfig: PdfGeneratorConfig = {
    clientSlug,
    outputDir,
    brandConfig,
    debug: false,
  };

  beforeAll(() => {
    // Create a minimal static site structure for testing
    fs.mkdirSync(path.join(brandBookDir, 'assets'), { recursive: true });

    // Write main CSS
    fs.writeFileSync(
      path.join(brandBookDir, 'assets', 'style.css'),
      ':root { --brand-primary: #7631e5; }',
      'utf-8'
    );

    // Write logo
    fs.writeFileSync(
      path.join(brandBookDir, 'assets', 'logo.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#7631e5"/></svg>',
      'utf-8'
    );

    // Write section HTML files
    for (const page of BRAND_BOOK_PAGES) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${page.title} - TestBrand Brand Book</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./assets/style.css">
</head>
<body>
  <div class="page-wrapper">
    <aside class="sidebar"><nav><ul></ul></nav></aside>
    <main class="main-content" id="main-content" role="main">
      <h1>${page.title}</h1>
      <p>Content for the ${page.title} section of the brand book.</p>
    </main>
  </div>
</body>
</html>`;
      fs.writeFileSync(path.join(brandBookDir, `${page.slug}.html`), html, 'utf-8');
    }
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('constructor', () => {
    it('should create a PdfGenerator instance', () => {
      const generator = new PdfGenerator();
      expect(generator).toBeInstanceOf(PdfGenerator);
    });

    it('should accept debug flag', () => {
      const generator = new PdfGenerator(true);
      expect(generator).toBeInstanceOf(PdfGenerator);
    });
  });

  describe('verifyStaticSite', () => {
    it('should succeed when static site exists', () => {
      const generator = new PdfGenerator();
      expect(() => generator.verifyStaticSite(brandBookDir)).not.toThrow();
    });

    it('should throw when brand book directory does not exist', () => {
      const generator = new PdfGenerator();
      expect(() => generator.verifyStaticSite('/nonexistent/path')).toThrow(
        'Static brand book not found'
      );
    });

    it('should throw when index.html is missing', () => {
      const emptyDir = path.join(tmpDir, 'empty-brand-book');
      fs.mkdirSync(emptyDir, { recursive: true });

      const generator = new PdfGenerator();
      expect(() => generator.verifyStaticSite(emptyDir)).toThrow('index.html not found');

      fs.rmSync(emptyDir, { recursive: true, force: true });
    });
  });

  describe('loadPrintCss', () => {
    it('should load print CSS containing color-adjust', () => {
      const generator = new PdfGenerator();
      const css = generator.loadPrintCss();

      expect(css).toContain('-webkit-print-color-adjust');
      expect(css).toContain('print-color-adjust');
      expect(css).toContain('exact');
    });

    it('should include sidebar hiding rules', () => {
      const generator = new PdfGenerator();
      const css = generator.loadPrintCss();

      expect(css).toContain('.sidebar');
      expect(css).toContain('display: none');
    });

    it('should include page break rules', () => {
      const generator = new PdfGenerator();
      const css = generator.loadPrintCss();

      expect(css).toContain('break-before');
      expect(css).toContain('.brand-book-section');
    });
  });

  describe('buildCombinedHtml', () => {
    it('should include cover page with brand name', () => {
      const generator = new PdfGenerator();
      const printCss = generator.loadPrintCss();
      const html = generator.buildCombinedHtml(brandBookDir, brandConfig, printCss);

      expect(html).toContain('TestBrand');
      expect(html).toContain('TestBrand Brand Book');
    });

    it('should include Table of Contents with all sections', () => {
      const generator = new PdfGenerator();
      const printCss = generator.loadPrintCss();
      const html = generator.buildCombinedHtml(brandBookDir, brandConfig, printCss);

      expect(html).toContain('Table of Contents');
      for (const page of BRAND_BOOK_PAGES) {
        expect(html).toContain(page.title);
      }
    });

    it('should include cover with primary color background', () => {
      const generator = new PdfGenerator();
      const printCss = generator.loadPrintCss();
      const html = generator.buildCombinedHtml(brandBookDir, brandConfig, printCss);

      expect(html).toContain(brandConfig.primaryColor);
      expect(html).toContain('pdf-cover');
    });

    it('should include Google Fonts embed tag', () => {
      const generator = new PdfGenerator();
      const printCss = generator.loadPrintCss();
      const html = generator.buildCombinedHtml(brandBookDir, brandConfig, printCss);

      expect(html).toContain('fonts.googleapis.com');
    });

    it('should extract main content from section pages', () => {
      const generator = new PdfGenerator();
      const printCss = generator.loadPrintCss();
      const html = generator.buildCombinedHtml(brandBookDir, brandConfig, printCss);

      expect(html).toContain('pdf-section');
      expect(html).toContain('brand-book-section');
      // Should contain section content
      expect(html).toContain('Content for the');
    });

    it('should include print CSS in the combined HTML', () => {
      const generator = new PdfGenerator();
      const printCss = generator.loadPrintCss();
      const html = generator.buildCombinedHtml(brandBookDir, brandConfig, printCss);

      expect(html).toContain('-webkit-print-color-adjust');
    });

    it('should include a generation date', () => {
      const generator = new PdfGenerator();
      const printCss = generator.loadPrintCss();
      const html = generator.buildCombinedHtml(brandBookDir, brandConfig, printCss);

      const currentYear = new Date().getFullYear().toString();
      expect(html).toContain(currentYear);
    });

    it('should use default title when brandBookTitle is not set', () => {
      const configNoTitle: BrandConfig = {
        ...brandConfig,
        brandBookTitle: undefined,
      };
      const generator = new PdfGenerator();
      const printCss = generator.loadPrintCss();
      const html = generator.buildCombinedHtml(brandBookDir, configNoTitle, printCss);

      expect(html).toContain('TestBrand Brand Book');
    });
  });

  describe('generate', () => {
    it('should generate a PDF file', async () => {
      const generator = new PdfGenerator();
      const result = await generator.generate(defaultConfig);

      expect(result.pdfPath).toContain(`brand-book-${clientSlug}.pdf`);
      expect(result.fileSizeBytes).toBeGreaterThan(0);
      expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
    });

    it('should call Puppeteer with correct launch args', async () => {
      const puppeteer = await import('puppeteer');
      const generator = new PdfGenerator();
      await generator.generate(defaultConfig);

      expect(puppeteer.default.launch).toHaveBeenCalledWith(
        expect.objectContaining({
          headless: true,
          args: expect.arrayContaining(['--no-sandbox', '--disable-setuid-sandbox']),
        })
      );
    });

    it('should call page.pdf with A4 format and correct margins', async () => {
      const puppeteer = await import('puppeteer');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockPage = (puppeteer as any)._mockPage;

      const generator = new PdfGenerator();
      await generator.generate(defaultConfig);

      expect(mockPage.pdf).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'A4',
          printBackground: true,
          displayHeaderFooter: true,
          margin: expect.objectContaining({
            top: '20mm',
            bottom: '25mm',
            left: '15mm',
            right: '15mm',
          }),
        })
      );
    });

    it('should include page number template in footer', async () => {
      const puppeteer = await import('puppeteer');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockPage = (puppeteer as any)._mockPage;

      const generator = new PdfGenerator();
      await generator.generate(defaultConfig);

      const pdfCall = mockPage.pdf.mock.calls[0][0];
      expect(pdfCall.footerTemplate).toContain('pageNumber');
      expect(pdfCall.footerTemplate).toContain('totalPages');
    });

    it('should close browser after generation', async () => {
      const puppeteer = await import('puppeteer');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockBrowser = (puppeteer as any)._mockBrowser;

      const generator = new PdfGenerator();
      await generator.generate(defaultConfig);

      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should wait for fonts to load', async () => {
      const puppeteer = await import('puppeteer');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockPage = (puppeteer as any)._mockPage;

      const generator = new PdfGenerator();
      await generator.generate(defaultConfig);

      // Should call evaluate (for document.fonts.ready) and waitForNetworkIdle
      expect(mockPage.evaluate).toHaveBeenCalled();
      expect(mockPage.waitForNetworkIdle).toHaveBeenCalled();
    });

    it('should throw if static site does not exist', async () => {
      const generator = new PdfGenerator();
      const badConfig: PdfGeneratorConfig = {
        ...defaultConfig,
        clientSlug: 'nonexistent',
      };

      await expect(generator.generate(badConfig)).rejects.toThrow(
        'Static brand book not found'
      );
    });

    it('should write PDF buffer to disk', async () => {
      const generator = new PdfGenerator();
      const result = await generator.generate(defaultConfig);

      // The mock produces a buffer that gets written
      expect(fs.existsSync(result.pdfPath)).toBe(true);
      const fileSize = fs.statSync(result.pdfPath).size;
      expect(fileSize).toBeGreaterThan(0);
    });
  });
});

describe('print.css template', () => {
  const printCssPath = path.join(__dirname, '..', '..', 'templates', 'print.css');

  it('should exist as a file', () => {
    expect(fs.existsSync(printCssPath)).toBe(true);
  });

  it('should contain color-adjust rules', () => {
    const css = fs.readFileSync(printCssPath, 'utf-8');
    expect(css).toContain('-webkit-print-color-adjust: exact');
    expect(css).toContain('print-color-adjust: exact');
  });

  it('should hide sidebar and search elements', () => {
    const css = fs.readFileSync(printCssPath, 'utf-8');
    expect(css).toContain('.sidebar');
    expect(css).toContain('.search-container');
    expect(css).toContain('.mobile-header');
    expect(css).toContain('display: none');
  });

  it('should include page break rules for sections', () => {
    const css = fs.readFileSync(printCssPath, 'utf-8');
    expect(css).toContain('.brand-book-section');
    expect(css).toContain('break-before: page');
  });

  it('should include font rendering optimizations', () => {
    const css = fs.readFileSync(printCssPath, 'utf-8');
    expect(css).toContain('-webkit-font-smoothing');
    expect(css).toContain('text-rendering');
  });

  it('should reset main content margin for print', () => {
    const css = fs.readFileSync(printCssPath, 'utf-8');
    expect(css).toContain('.main-content');
    expect(css).toContain('margin-left: 0');
  });
});

describe('cover.html template', () => {
  const coverPath = path.join(__dirname, '..', '..', 'templates', 'cover.html');

  it('should exist as a file', () => {
    expect(fs.existsSync(coverPath)).toBe(true);
  });

  it('should contain template placeholders', () => {
    const html = fs.readFileSync(coverPath, 'utf-8');
    expect(html).toContain('{{title}}');
    expect(html).toContain('{{clientName}}');
    expect(html).toContain('{{primaryColor}}');
    expect(html).toContain('{{date}}');
    expect(html).toContain('{{logoPath}}');
  });

  it('should have cover structure with correct CSS classes', () => {
    const html = fs.readFileSync(coverPath, 'utf-8');
    expect(html).toContain('class="cover"');
    expect(html).toContain('class="cover__logo"');
    expect(html).toContain('class="cover__title"');
    expect(html).toContain('class="cover__client"');
    expect(html).toContain('class="cover__date"');
  });

  it('should include print color-adjust', () => {
    const html = fs.readFileSync(coverPath, 'utf-8');
    expect(html).toContain('-webkit-print-color-adjust: exact');
  });
});

describe('toc.html template', () => {
  const tocPath = path.join(__dirname, '..', '..', 'templates', 'toc.html');

  it('should exist as a file', () => {
    expect(fs.existsSync(tocPath)).toBe(true);
  });

  it('should contain title and sections placeholder', () => {
    const html = fs.readFileSync(tocPath, 'utf-8');
    expect(html).toContain('Table of Contents');
    expect(html).toContain('{{sections}}');
    expect(html).toContain('{{title}}');
  });

  it('should include print color-adjust', () => {
    const html = fs.readFileSync(tocPath, 'utf-8');
    expect(html).toContain('-webkit-print-color-adjust: exact');
  });
});

describe('CLI --pdf flag integration', () => {
  const cliPath = path.join(__dirname, '..', '..', 'bin', 'build-brand-book.ts');

  it('should contain --pdf argument parsing', () => {
    const cliSource = fs.readFileSync(cliPath, 'utf-8');
    expect(cliSource).toContain("'--pdf'");
    expect(cliSource).toContain('pdf: boolean');
  });

  it('should import PdfGenerator', () => {
    const cliSource = fs.readFileSync(cliPath, 'utf-8');
    expect(cliSource).toContain('PdfGenerator');
  });

  it('should have buildPdf function', () => {
    const cliSource = fs.readFileSync(cliPath, 'utf-8');
    expect(cliSource).toContain('async function buildPdf');
  });

  it('should include pre-flight logging', () => {
    const cliSource = fs.readFileSync(cliPath, 'utf-8');
    expect(cliSource).toContain('Generating PDF');
    expect(cliSource).toContain('may take up to 60 seconds');
  });
});
