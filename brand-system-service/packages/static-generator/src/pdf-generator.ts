import fs from 'node:fs';
import path from 'node:path';
import type { Browser, Page } from 'puppeteer';
import { createLogger, type Logger } from '@bss/core';
import { BRAND_BOOK_PAGES, type BrandConfig } from './static-generator';

/**
 * Configuration for PDF generation.
 */
export interface PdfGeneratorConfig {
  /** Client slug identifier */
  readonly clientSlug: string;
  /** Root output directory (contains {client}/brand-book/) */
  readonly outputDir: string;
  /** Brand configuration */
  readonly brandConfig: BrandConfig;
  /** Enable debug logging */
  readonly debug?: boolean;
}

/**
 * Result of PDF generation.
 */
export interface PdfGeneratorResult {
  /** Path to the generated PDF file */
  readonly pdfPath: string;
  /** PDF file size in bytes */
  readonly fileSizeBytes: number;
  /** Generation time in milliseconds */
  readonly elapsedMs: number;
}

/**
 * PDF margin configuration (A4 format).
 */
const PDF_MARGINS = {
  top: '20mm',
  bottom: '25mm',
  left: '15mm',
  right: '15mm',
} as const;

/**
 * Puppeteer launch arguments for WSL2/Linux environments.
 */
const PUPPETEER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
] as const;

/**
 * Font loading timeout in milliseconds.
 */
const FONT_LOAD_TIMEOUT = 10_000;

/**
 * PdfGenerator converts a static brand book HTML site into a
 * professional PDF document using Puppeteer headless Chrome.
 *
 * Features:
 * - Cover page with brand identity
 * - Table of contents
 * - All brand book sections with page breaks
 * - Print-optimized CSS for accurate color rendering
 * - Page numbers in footer
 * - Google Fonts loading with network idle wait
 */
export class PdfGenerator {
  private readonly logger: Logger;

  constructor(debug = false) {
    this.logger = createLogger('PdfGenerator', debug);
  }

  /**
   * Generate a PDF from an existing static brand book.
   *
   * @param config - PDF generation configuration
   * @returns Result with file path, size, and timing
   * @throws Error if static site doesn't exist or Puppeteer fails
   */
  async generate(config: PdfGeneratorConfig): Promise<PdfGeneratorResult> {
    const startTime = Date.now();
    const brandBookDir = path.join(config.outputDir, config.clientSlug, 'brand-book');
    const pdfPath = path.join(config.outputDir, config.clientSlug, `brand-book-${config.clientSlug}.pdf`);

    this.logger.info('PDF generation started', {
      clientSlug: config.clientSlug,
      brandBookDir,
      pdfPath,
    });

    // Pre-flight: verify static site exists
    this.verifyStaticSite(brandBookDir);

    // Load print CSS
    const printCss = this.loadPrintCss();

    // Build combined HTML document
    const combinedHtml = this.buildCombinedHtml(brandBookDir, config.brandConfig, printCss);

    // Launch Puppeteer and render PDF
    let browser: Browser | null = null;
    try {
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.default.launch({
        headless: true,
        args: [...PUPPETEER_ARGS],
      });

      const page = await browser.newPage();

      // Set content and wait for fonts to load
      await page.setContent(combinedHtml, {
        waitUntil: 'networkidle0',
        timeout: FONT_LOAD_TIMEOUT * 3,
      });

      // Additional wait for Google Fonts
      await this.waitForFonts(page);

      // Ensure output directory exists
      fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="font-size:9px;text-align:center;width:100%;padding:5px 0;color:#6b7280;font-family:Inter,system-ui,sans-serif;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `,
        margin: { ...PDF_MARGINS },
        preferCSSPageSize: false,
      });

      // Write PDF to disk
      fs.writeFileSync(pdfPath, pdfBuffer);

      const fileSizeBytes = pdfBuffer.length;
      const elapsedMs = Date.now() - startTime;

      this.logger.info('PDF generation completed', {
        pdfPath,
        fileSizeBytes,
        fileSizeMB: (fileSizeBytes / (1024 * 1024)).toFixed(2),
        elapsedMs,
      });

      return { pdfPath, fileSizeBytes, elapsedMs };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Verify that the static brand book site exists and is valid.
   *
   * @param brandBookDir - Path to the generated brand book directory
   * @throws Error if the directory or index.html doesn't exist
   */
  verifyStaticSite(brandBookDir: string): void {
    const indexPath = path.join(brandBookDir, 'index.html');

    if (!fs.existsSync(brandBookDir)) {
      throw new Error(
        `Static brand book not found at: ${brandBookDir}\n` +
        'Run "pnpm build:brand-book" first to generate the static site.'
      );
    }

    if (!fs.existsSync(indexPath)) {
      throw new Error(
        `index.html not found in brand book directory: ${brandBookDir}\n` +
        'The static site may be incomplete. Run "pnpm build:brand-book" to regenerate.'
      );
    }

    this.logger.info('Static site verified', { brandBookDir });
  }

  /**
   * Load the print CSS from templates directory.
   *
   * @returns Print CSS content string
   */
  loadPrintCss(): string {
    const printCssPath = path.join(__dirname, '..', 'templates', 'print.css');

    if (fs.existsSync(printCssPath)) {
      return fs.readFileSync(printCssPath, 'utf-8');
    }

    this.logger.warn('print.css not found, using minimal print styles');
    return `
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .sidebar, .search-container, .mobile-header, .hamburger-toggle { display: none !important; }
      .main-content { margin-left: 0 !important; padding: 0 !important; }
    `;
  }

  /**
   * Build a single combined HTML document with cover, TOC, and all sections.
   *
   * @param brandBookDir - Path to static brand book
   * @param brandConfig - Brand configuration
   * @param printCss - Print CSS styles
   * @returns Complete HTML string for PDF rendering
   */
  buildCombinedHtml(
    brandBookDir: string,
    brandConfig: BrandConfig,
    printCss: string
  ): string {
    const title = brandConfig.brandBookTitle || `${brandConfig.clientName} Brand Book`;
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Read the main CSS from the static site
    const mainCssPath = path.join(brandBookDir, 'assets', 'style.css');
    const mainCss = fs.existsSync(mainCssPath)
      ? fs.readFileSync(mainCssPath, 'utf-8')
      : '';

    // Read typography embed tag from any HTML file
    const embedTag = this.extractEmbedTag(brandBookDir);

    // Resolve logo path
    const logoPath = this.resolveLogoPath(brandBookDir);

    // Build cover page HTML
    const coverHtml = this.buildCoverSection(brandConfig, title, date, logoPath);

    // Build TOC HTML
    const tocHtml = this.buildTocSection(title, brandConfig.primaryColor);

    // Extract main content from each section page
    const sectionsHtml = this.extractSectionContents(brandBookDir);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  ${embedTag}
  <style>
    ${mainCss}
    ${printCss}

    /* PDF-specific overrides */
    .pdf-page-break {
      break-before: page;
      page-break-before: always;
    }

    .pdf-section {
      break-before: page;
      page-break-before: always;
      padding: 48px 40px;
    }

    .pdf-section:first-of-type {
      break-before: auto;
      page-break-before: auto;
    }
  </style>
</head>
<body>
  ${coverHtml}
  ${tocHtml}
  ${sectionsHtml}
</body>
</html>`;
  }

  /**
   * Build the cover page section HTML.
   */
  private buildCoverSection(
    brandConfig: BrandConfig,
    title: string,
    date: string,
    logoPath: string
  ): string {
    return `
    <div class="pdf-cover" style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: ${brandConfig.primaryColor};
      color: #ffffff;
      text-align: center;
      padding: 64px;
      break-after: page;
      page-break-after: always;
    ">
      <img src="${this.escapeHtml(logoPath)}" alt="${this.escapeHtml(brandConfig.clientName)} logo"
        style="max-width:180px;max-height:180px;margin-bottom:56px;filter:brightness(0) invert(1);"
        onerror="this.style.display='none'">
      <h1 style="font-size:48px;font-weight:700;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px;max-width:600px;">
        ${this.escapeHtml(title)}
      </h1>
      <div style="width:60px;height:2px;background:rgba(255,255,255,0.4);margin:0 auto 24px;"></div>
      <p style="font-size:22px;opacity:0.9;margin-bottom:64px;">
        ${this.escapeHtml(brandConfig.clientName)}
      </p>
      <p style="font-size:14px;opacity:0.7;letter-spacing:0.05em;text-transform:uppercase;">
        ${this.escapeHtml(date)}
      </p>
    </div>`;
  }

  /**
   * Build the Table of Contents section HTML.
   */
  private buildTocSection(title: string, primaryColor: string): string {
    const items = BRAND_BOOK_PAGES
      .map((page, index) => `
        <li style="display:flex;align-items:baseline;padding:16px 0;border-bottom:1px solid #e5e7eb;font-size:17px;">
          <span style="font-weight:600;min-width:48px;color:${primaryColor};font-size:15px;">${String(index + 1).padStart(2, '0')}</span>
          <span style="flex:1;font-weight:500;">${this.escapeHtml(page.title)}</span>
        </li>`)
      .join('\n');

    return `
    <div class="pdf-toc" style="padding:80px 40px;break-after:page;page-break-after:always;">
      <h1 style="font-size:36px;font-weight:700;letter-spacing:-0.025em;margin-bottom:48px;color:#1a1a2e;">
        Table of Contents
      </h1>
      <ol style="list-style:none;padding:0;margin:0;">
        ${items}
      </ol>
    </div>`;
  }

  /**
   * Extract main content from each brand book section HTML file.
   */
  private extractSectionContents(brandBookDir: string): string {
    const sections: string[] = [];

    for (const page of BRAND_BOOK_PAGES) {
      const filePath = path.join(brandBookDir, `${page.slug}.html`);

      if (!fs.existsSync(filePath)) {
        this.logger.warn(`Section HTML not found: ${filePath}`);
        continue;
      }

      const html = fs.readFileSync(filePath, 'utf-8');

      // Extract content between <main> tags
      const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      const content = mainMatch ? mainMatch[1] : '';

      sections.push(`
      <div class="pdf-section brand-book-section" data-section="${this.escapeHtml(page.slug)}">
        ${content}
      </div>`);
    }

    return sections.join('\n');
  }

  /**
   * Extract the font embed tag from an existing HTML file.
   */
  private extractEmbedTag(brandBookDir: string): string {
    const indexPath = path.join(brandBookDir, 'index.html');

    if (!fs.existsSync(indexPath)) return '';

    const html = fs.readFileSync(indexPath, 'utf-8');

    // Look for Google Fonts link tags
    const fontLinks = html.match(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi);
    if (fontLinks) {
      return fontLinks.join('\n');
    }

    return '';
  }

  /**
   * Resolve the logo path for use in the PDF.
   * Returns a file:// URI or data URI.
   */
  private resolveLogoPath(brandBookDir: string): string {
    const logoPath = path.join(brandBookDir, 'assets', 'logo.svg');

    if (fs.existsSync(logoPath)) {
      // Use file:// protocol for local file access in Puppeteer
      return `file://${path.resolve(logoPath).replace(/\\/g, '/')}`;
    }

    return '';
  }

  /**
   * Wait for fonts to finish loading in the page.
   */
  private async waitForFonts(page: Page): Promise<void> {
    try {
      await page.evaluate(() => {
        return document.fonts.ready;
      });

      // Additional network idle wait for Google Fonts
      await page.waitForNetworkIdle({ idleTime: 500, timeout: FONT_LOAD_TIMEOUT });
    } catch {
      this.logger.warn('Font loading timeout - proceeding with available fonts');
    }
  }

  /**
   * Escape HTML special characters.
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
