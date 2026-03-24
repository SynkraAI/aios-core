/**
 * Relative Path Validator for Brand Book packaging.
 *
 * Scans all HTML files for absolute URLs (http://, https://) to ensure
 * the packaged brand book works fully offline via file:// protocol.
 *
 * Per AC-4 (BSS-2.8): Before creating the ZIP, validate that no absolute
 * URLs remain in any HTML file. Build fails if violations are found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createLogger } from '@bss/core';

/**
 * A single path violation found in an HTML file.
 */
export interface PathViolation {
  /** File name (relative to brand book directory) */
  readonly file: string;
  /** Line number where the violation was found */
  readonly line: number;
  /** The offending URL */
  readonly url: string;
  /** The full line content (trimmed) */
  readonly context: string;
}

/**
 * Result of path validation.
 */
export interface ValidationResult {
  /** Whether all files passed validation (no violations) */
  readonly valid: boolean;
  /** List of violations found */
  readonly violations: PathViolation[];
  /** Number of HTML files scanned */
  readonly filesScanned: number;
}

/**
 * Patterns that indicate absolute URLs in HTML attributes and CSS.
 */
const ABSOLUTE_URL_PATTERNS = [
  /href="(https?:\/\/[^"]+)"/g,
  /src="(https?:\/\/[^"]+)"/g,
  /url\((https?:\/\/[^)]+)\)/g,
  /href='(https?:\/\/[^']+)'/g,
  /src='(https?:\/\/[^']+)'/g,
];

/**
 * URLs that are allowed even though they are absolute.
 * These are informational links (e.g., in README text or metadata),
 * not asset references that would fail on file:// protocol.
 */
const ALLOWED_URL_PATTERNS = [
  // Meta tags with content URLs (og:url, canonical, etc.)
  /content="https?:\/\//,
  // Comments
  /<!--.*https?:\/\/.*-->/,
];

/**
 * Validate that all HTML files in a brand book directory use only relative paths.
 *
 * @param brandBookDir - Path to the brand book output directory
 * @param debug - Enable debug logging
 * @returns Validation result with any violations found
 */
export function validateRelativePaths(
  brandBookDir: string,
  debug = false
): ValidationResult {
  const logger = createLogger('PathValidator', debug);
  const violations: PathViolation[] = [];

  if (!fs.existsSync(brandBookDir)) {
    throw new Error(`Brand book directory not found: ${brandBookDir}`);
  }

  const htmlFiles = fs
    .readdirSync(brandBookDir)
    .filter((f) => f.endsWith('.html'));

  logger.info(`Scanning ${htmlFiles.length} HTML files for absolute URLs`);

  for (const file of htmlFiles) {
    const filePath = path.join(brandBookDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Skip if line matches an allowed pattern
      if (ALLOWED_URL_PATTERNS.some((pattern) => pattern.test(line))) {
        continue;
      }

      for (const pattern of ABSOLUTE_URL_PATTERNS) {
        // Reset regex lastIndex for each line
        pattern.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(line)) !== null) {
          const url = match[1];

          violations.push({
            file,
            line: lineIndex + 1,
            url,
            context: line.trim().substring(0, 120),
          });
        }
      }
    }
  }

  if (violations.length > 0) {
    logger.warn(`Found ${violations.length} absolute URL violations`);
  } else {
    logger.info('All HTML files use relative paths only');
  }

  return {
    valid: violations.length === 0,
    filesScanned: htmlFiles.length,
    violations,
  };
}

/**
 * Replace Google Fonts CDN <link> tags in HTML files with local fonts.css reference.
 *
 * Per AC-3 (BSS-2.8): Before packaging, replace Google Fonts links
 * with self-hosted fonts.css reference.
 *
 * @param brandBookDir - Path to the brand book output directory
 * @param debug - Enable debug logging
 * @returns Number of files modified
 */
export function replaceGoogleFontsLinks(
  brandBookDir: string,
  debug = false
): number {
  const logger = createLogger('FontReplacer', debug);
  let filesModified = 0;

  const htmlFiles = fs
    .readdirSync(brandBookDir)
    .filter((f) => f.endsWith('.html'));

  // Pattern to match Google Fonts <link> tags (both css and css2)
  const googleFontsLinkRegex =
    /<link[^>]*href="https:\/\/fonts\.googleapis\.com\/css2?[^"]*"[^>]*>/g;

  // Pattern to match Google Fonts preconnect tags
  const preconnectRegex =
    /<link[^>]*rel="preconnect"[^>]*href="https:\/\/fonts\.(googleapis|gstatic)\.com"[^>]*>/g;

  const localFontLink =
    '<link rel="stylesheet" href="./assets/fonts.css">';

  for (const file of htmlFiles) {
    const filePath = path.join(brandBookDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Remove preconnect tags for Google Fonts
    content = content.replace(preconnectRegex, '');

    // Replace Google Fonts stylesheet link with local reference
    // Only insert the local link once (on first replacement)
    let localLinkInserted = false;
    content = content.replace(googleFontsLinkRegex, () => {
      if (!localLinkInserted) {
        localLinkInserted = true;
        return localFontLink;
      }
      return ''; // Remove duplicate Google Fonts links
    });

    if (content !== originalContent) {
      // Clean up any resulting blank lines
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      fs.writeFileSync(filePath, content, 'utf-8');
      filesModified++;
      logger.info(`Updated font references in ${file}`);
    }
  }

  logger.info(`Modified ${filesModified} HTML files`);
  return filesModified;
}

/**
 * Inline the search index as window.__SEARCH_INDEX__ in HTML files.
 *
 * On file:// protocol, fetch() for local JSON fails in Chrome due to CORS.
 * This inlines the search index data so search works offline.
 *
 * @param brandBookDir - Path to the brand book output directory
 * @param debug - Enable debug logging
 */
export function inlineSearchIndex(
  brandBookDir: string,
  debug = false
): void {
  const logger = createLogger('SearchIndexInliner', debug);

  const searchIndexPath = path.join(
    brandBookDir,
    'assets',
    'search-index.json'
  );

  if (!fs.existsSync(searchIndexPath)) {
    logger.warn('search-index.json not found, skipping inline');
    return;
  }

  const searchIndexData = fs.readFileSync(searchIndexPath, 'utf-8');
  const inlineScript = `<script>window.__SEARCH_INDEX__ = ${searchIndexData};</script>`;

  const htmlFiles = fs
    .readdirSync(brandBookDir)
    .filter((f) => f.endsWith('.html'));

  for (const file of htmlFiles) {
    const filePath = path.join(brandBookDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Insert before closing </head> tag
    if (content.includes('</head>')) {
      content = content.replace('</head>', `${inlineScript}\n</head>`);
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  }

  logger.info(`Inlined search index in ${htmlFiles.length} HTML files`);
}
