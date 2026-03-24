/**
 * Brand Book Package Builder — ZIP archive generation.
 *
 * Bundles the static brand book site + PDF export into a downloadable
 * ZIP archive with all assets embedded and no server dependencies.
 *
 * Per AC-1, AC-6, AC-7 (BSS-2.8): Uses the `archiver` library for
 * cross-platform ZIP creation with maximum compression.
 */

import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';
import { createLogger, BuildError, type Logger } from '@bss/core';
import type { BrandConfig } from './static-generator';
import { downloadGoogleFonts, extractGoogleFontFamilies } from './font-downloader';
import {
  validateRelativePaths,
  replaceGoogleFontsLinks,
  inlineSearchIndex,
} from './path-validator';

/**
 * Options for building a brand book package.
 */
export interface PackageBuildOptions {
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
 * Result of the package build.
 */
export interface PackageBuildResult {
  /** Full path to the generated ZIP file */
  readonly zipPath: string;
  /** ZIP file size in bytes */
  readonly fileSizeBytes: number;
  /** Number of files in the archive */
  readonly fileCount: number;
  /** Total build time in milliseconds */
  readonly buildTimeMs: number;
}

/**
 * Maximum allowed ZIP file size (50MB per AC-9).
 */
const MAX_ZIP_SIZE_BYTES = 50 * 1024 * 1024;

/**
 * Build a brand book local package (ZIP archive).
 *
 * Pipeline:
 *   1. Pre-flight checks (BSS-2.6 and BSS-2.7 outputs exist)
 *   2. Download Google Fonts for offline use
 *   3. Replace Google Fonts CDN links in HTML
 *   4. Inline search index for file:// compatibility
 *   5. Validate no absolute URLs remain
 *   6. Build ZIP archive
 *
 * @param options - Build options
 * @returns Build result with ZIP path and metadata
 */
export async function buildPackage(
  options: PackageBuildOptions
): Promise<PackageBuildResult> {
  const startTime = Date.now();
  const logger = createLogger('PackageBuilder', options.debug);

  const brandBookDir = path.join(
    options.outputDir,
    options.clientSlug,
    'brand-book'
  );
  const pdfPath = path.join(
    options.outputDir,
    options.clientSlug,
    `brand-book-${options.clientSlug}.pdf`
  );
  const zipPath = path.join(
    options.outputDir,
    options.clientSlug,
    `brand-book-package-${options.clientSlug}.zip`
  );

  // Step 1: Pre-flight checks
  logger.info('Step 1: Pre-flight checks');
  assertPrerequisites(brandBookDir, pdfPath, logger);

  // Step 2: Download Google Fonts
  logger.info('Step 2: Downloading Google Fonts for offline use');
  const fontFamilies = extractFontFamiliesFromBrandBook(brandBookDir, logger);
  if (fontFamilies.length > 0) {
    const fontResult = await downloadGoogleFonts(
      fontFamilies,
      brandBookDir,
      options.debug
    );
    logger.info('Font download complete', {
      downloaded: fontResult.filesDownloaded,
      cached: fontResult.filesSkipped,
    });
  } else {
    logger.info('No Google Fonts detected, skipping download');
  }

  // Step 3: Replace Google Fonts CDN links in HTML
  logger.info('Step 3: Replacing Google Fonts CDN links');
  const filesModified = replaceGoogleFontsLinks(
    brandBookDir,
    options.debug
  );
  logger.info(`Modified ${filesModified} HTML files`);

  // Step 4: Inline search index for file:// compatibility
  logger.info('Step 4: Inlining search index for file:// compatibility');
  inlineSearchIndex(brandBookDir, options.debug);

  // Step 5: Validate relative paths
  logger.info('Step 5: Validating relative paths');
  const validation = validateRelativePaths(brandBookDir, options.debug);

  if (!validation.valid) {
    const violationList = validation.violations
      .map((v) => `  ${v.file}:${v.line} — ${v.url}`)
      .join('\n');
    throw new BuildError(
      `Absolute URLs found in HTML files. Package build aborted.\n\nViolations:\n${violationList}`
    );
  }

  // Step 6: Build ZIP
  logger.info('Step 6: Building ZIP archive');
  const rootDirName = `${options.clientSlug}-brand-book`;
  const readmeTxt = generateReadme(options.brandConfig);

  const { fileCount } = await createZipArchive({
    zipPath,
    brandBookDir,
    pdfPath,
    readmeTxt,
    rootDirName,
    clientSlug: options.clientSlug,
    logger,
  });

  // Verify file size
  const stats = fs.statSync(zipPath);
  if (stats.size > MAX_ZIP_SIZE_BYTES) {
    logger.warn(
      `ZIP file exceeds 50MB limit: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`
    );
  }

  const buildTimeMs = Date.now() - startTime;

  logger.info('Package build complete', {
    zipPath,
    fileSizeMB: (stats.size / (1024 * 1024)).toFixed(2),
    fileCount,
    buildTimeMs,
  });

  return {
    zipPath,
    fileSizeBytes: stats.size,
    fileCount,
    buildTimeMs,
  };
}

/**
 * Assert that required BSS-2.6 and BSS-2.7 outputs exist.
 */
function assertPrerequisites(
  brandBookDir: string,
  pdfPath: string,
  logger: Logger
): void {
  const indexPath = path.join(brandBookDir, 'index.html');

  if (!fs.existsSync(indexPath)) {
    throw new BuildError(
      `Brand book static site not found at ${brandBookDir}. ` +
        'Run BSS-2.6 (build:brand-book) first.'
    );
  }

  if (!fs.existsSync(pdfPath)) {
    throw new BuildError(
      `Brand book PDF not found at ${pdfPath}. ` +
        'Run BSS-2.7 (build:brand-book-pdf) first.'
    );
  }

  logger.info('Pre-flight checks passed');
}

/**
 * Extract font families from the first HTML file in the brand book.
 */
function extractFontFamiliesFromBrandBook(
  brandBookDir: string,
  logger: Logger
): string[] {
  const indexPath = path.join(brandBookDir, 'index.html');

  if (!fs.existsSync(indexPath)) return [];

  const html = fs.readFileSync(indexPath, 'utf-8');
  const families = extractGoogleFontFamilies(html);

  logger.info(`Detected font families: ${families.join(', ') || '(none)'}`);
  return families;
}

/**
 * Generate README.txt content for the ZIP package.
 *
 * Per AC-5 (BSS-2.8): Plain text with opening instructions.
 */
export function generateReadme(brandConfig: BrandConfig): string {
  const lines: string[] = [
    `${brandConfig.clientName} Brand Book`,
    '='.repeat(brandConfig.clientName.length + ' Brand Book'.length),
    '',
    'Opening Instructions:',
    '  1. Extract this ZIP folder.',
    '  2. Open index.html in Chrome, Firefox, Safari, or Edge.',
    '  3. No internet connection or software installation required.',
    '',
    `Generated on: ${new Date().toISOString().split('T')[0]}`,
  ];

  if (brandConfig.websiteUrl) {
    lines.push(
      '',
      `For the best experience, view the online version at: ${brandConfig.websiteUrl}`
    );
  }

  lines.push('', `Generated by Brand System Service v0.1.0`);

  return lines.join('\n') + '\n';
}

/**
 * Create the ZIP archive using archiver.
 */
async function createZipArchive(params: {
  zipPath: string;
  brandBookDir: string;
  pdfPath: string;
  readmeTxt: string;
  rootDirName: string;
  clientSlug: string;
  logger: Logger;
}): Promise<{ fileCount: number }> {
  const {
    zipPath,
    brandBookDir,
    pdfPath,
    readmeTxt,
    rootDirName,
    clientSlug,
    logger,
  } = params;

  return new Promise<{ fileCount: number }>((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    let fileCount = 0;

    output.on('close', () => {
      resolve({ fileCount });
    });

    archive.on('error', (err: Error) => {
      reject(
        new BuildError(`ZIP archive creation failed: ${err.message}`)
      );
    });

    archive.on('entry', () => {
      fileCount++;
    });

    archive.pipe(output);

    // Add all brand book files under the root directory name
    archive.directory(brandBookDir, rootDirName);

    // Add PDF
    const pdfFilename = `brand-book-${clientSlug}.pdf`;
    archive.file(pdfPath, { name: `${rootDirName}/${pdfFilename}` });
    logger.info(`Added PDF: ${pdfFilename}`);

    // Add README.txt
    archive.append(readmeTxt, {
      name: `${rootDirName}/README.txt`,
    });
    logger.info('Added README.txt');

    archive.finalize();
  });
}
