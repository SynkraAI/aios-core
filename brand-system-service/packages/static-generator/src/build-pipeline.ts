/**
 * Static Site Build Pipeline
 *
 * Full build pipeline for landing-page and site build types.
 * Handles token injection, CSS bundling (LightningCSS), JS bundling (esbuild),
 * asset copying (fonts, images), and relative-path rewriting.
 *
 * This module is the core implementation for BSS-5.1.
 */

import fs from 'node:fs';
import path from 'node:path';
import nunjucks from 'nunjucks';
import { transform as lightningTransform, Features } from 'lightningcss';
import * as esbuild from 'esbuild';
import { createLogger, BuildError, type Logger } from '@bss/core';
import { exportTokensAsCSS } from '@bss/tokens';
import type { BuildType, GeneratorOptions } from './static-generator';
import { generateToc } from './toc-generator';
import { SEOMetadataEngine } from './seo';
import type { SEOInput } from './seo';

/**
 * Result of a build pipeline execution.
 */
export interface BuildResult {
  /** Absolute path to the output directory */
  readonly outputDir: string;
  /** Build duration in milliseconds */
  readonly durationMs: number;
  /** Number of HTML pages generated */
  readonly pageCount: number;
  /** Total number of assets copied */
  readonly assetCount: number;
}

/**
 * Run the full static site build pipeline.
 *
 * Steps:
 * 1. Resolve template directory for the build type
 * 2. Generate tokens.css via exportTokensAsCSS
 * 3. Render Nunjucks templates into HTML
 * 4. Collect and bundle CSS via LightningCSS
 * 5. Collect and bundle JS via esbuild
 * 6. Copy fonts into dist/assets/fonts/
 * 7. Copy images into dist/assets/images/
 * 8. Rewrite all paths to relative
 *
 * @param options - Generator options
 * @param logger - Logger instance
 * @returns Build result
 */
export async function runBuildPipeline(
  options: GeneratorOptions,
  logger: Logger
): Promise<BuildResult> {
  const startTime = Date.now();
  const { clientId, type, outputDir } = options;

  logger.info('Build pipeline started', { clientId, type, outputDir });

  // Resolve template directory
  const templateDir = resolveTemplateDir(type);
  if (!fs.existsSync(templateDir)) {
    throw new BuildError(
      `Template directory not found for build type "${type}": ${templateDir}`
    );
  }

  // Ensure output directories
  fs.mkdirSync(path.join(outputDir, 'assets', 'fonts'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'assets', 'images'), { recursive: true });

  // Step 1: Token injection (AC-2)
  logger.info('Injecting design tokens', { clientId });
  const tokenCSS = await exportTokensAsCSS(clientId);
  fs.writeFileSync(path.join(outputDir, 'tokens.css'), tokenCSS, 'utf-8');
  logger.info('tokens.css generated');

  // Step 2: Copy fonts (AC-5)
  const fontCount = copyFonts(options, logger);

  // Step 3: Copy images (AC-6)
  const imageCount = copyImages(options, templateDir, logger);

  // Step 4: Render Nunjucks templates (AC-1)
  const pageCount = renderTemplates(options, templateDir, logger);

  // Step 5: Bundle CSS (AC-3)
  await bundleCSS(options, templateDir, logger);

  // Step 6: Bundle JS (AC-4)
  await bundleJS(options, templateDir, logger);

  // Step 7: SEO metadata injection (BSS-5.5)
  injectSEOMetadata(options, outputDir, logger);

  // Step 8: Rewrite paths to relative (AC-4)
  rewriteRelativePaths(outputDir, logger);

  const durationMs = Date.now() - startTime;
  logger.info(`Build pipeline completed in ${durationMs}ms`, {
    clientId,
    type,
    durationMs,
    pageCount,
    assetCount: fontCount + imageCount,
  });

  return {
    outputDir,
    durationMs,
    pageCount,
    assetCount: fontCount + imageCount,
  };
}

/**
 * Resolve the template directory for a given build type.
 */
function resolveTemplateDir(type: BuildType): string {
  return path.resolve(__dirname, '..', 'templates', type);
}

/**
 * Resolve the shared template directory used across build types.
 */
function resolveSharedDir(): string {
  return path.resolve(__dirname, '..', 'templates', 'shared');
}

/**
 * Render Nunjucks templates into HTML files in the output directory.
 *
 * For "site" builds, page templates are read from the `pages/` subdirectory
 * and the Nunjucks loader searches both the template type directory and
 * the shared template directory so that shared partials (_base.njk, etc.)
 * are available via `{% extends %}` / `{% include %}`.
 */
function renderTemplates(
  options: GeneratorOptions,
  templateDir: string,
  logger: Logger
): number {
  const sharedDir = resolveSharedDir();

  // Nunjucks searches: template dir first, shared dir second, assets dir for SVG includes
  const searchPaths = [templateDir];
  if (fs.existsSync(sharedDir)) {
    searchPaths.push(sharedDir);
  }
  // Add package root so {% include "assets/icons/..." %} resolves (BSS-5.7)
  const pkgRoot = path.resolve(__dirname, '..');
  if (!searchPaths.includes(pkgRoot)) {
    searchPaths.push(pkgRoot);
  }

  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(searchPaths, { noCache: true }),
    { autoescape: true }
  );

  // Add currentYear as a global variable for footer copyright
  env.addGlobal('currentYear', new Date().getFullYear());

  // Base template data
  const baseData: Record<string, unknown> = {
    clientId: options.clientId,
    type: options.type,
    title: `${options.clientId} - ${options.type}`,
    heading: `Welcome to ${options.clientId}`,
    subheading: '',
    content: '',
    year: new Date().getFullYear(),
    currentYear: new Date().getFullYear(),
    site: { baseUrl: '' },
  };

  // Load fixture data if available (provides section content for templates)
  const fixtureData = loadFixtureData(templateDir, logger);

  // Merge: base < fixture < explicit templateData
  const templateData = {
    ...baseData,
    ...fixtureData,
    ...(options.templateData || {}),
    // Always preserve these from options
    clientId: options.clientId,
    type: options.type,
    year: new Date().getFullYear(),
    currentYear: new Date().getFullYear(),
  };

  // Generate ToC for blog post content (site builds only)
  if (options.type === 'site') {
    const data = templateData as Record<string, unknown>;
    const blogPost = data.blogPost as Record<string, unknown> | undefined;
    if (blogPost && typeof blogPost.content === 'string') {
      const { toc, html } = generateToc(blogPost.content);
      blogPost.toc = toc;
      blogPost.content = html;
      logger.info('Generated blog post ToC', { entries: toc.length });
    }
  }

  // Determine where page templates live:
  // - For "site" builds: templates/site/pages/*.njk
  // - For other builds: templates/{type}/*.njk (root level)
  const pagesDir = options.type === 'site'
    ? path.join(templateDir, 'pages')
    : templateDir;

  if (!fs.existsSync(pagesDir)) {
    throw new BuildError(
      `Page template directory not found: ${pagesDir}`
    );
  }

  // Find all .njk files (excluding partials prefixed with _)
  const njkFiles = fs
    .readdirSync(pagesDir)
    .filter((f) => f.endsWith('.njk') && !f.startsWith('_'));

  let pageCount = 0;
  for (const file of njkFiles) {
    const htmlName = file.replace('.njk', '.html');
    // For site builds, render relative to pagesDir
    const renderPath = options.type === 'site'
      ? `pages/${file}`
      : file;
    const rendered = env.render(renderPath, templateData);
    fs.writeFileSync(path.join(options.outputDir, htmlName), rendered, 'utf-8');
    logger.info(`Generated ${htmlName}`);
    pageCount++;
  }

  if (pageCount === 0) {
    throw new BuildError(
      `No .njk template files found in ${pagesDir}`
    );
  }

  return pageCount;
}

/**
 * Load fixture/example data from the template directory.
 * Looks for fixtures/example.json in the template dir.
 */
function loadFixtureData(
  templateDir: string,
  logger: Logger
): Record<string, unknown> {
  const fixturePath = path.join(templateDir, 'fixtures', 'example.json');
  if (fs.existsSync(fixturePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
      logger.info('Loaded fixture data from fixtures/example.json');
      return data as Record<string, unknown>;
    } catch (err) {
      logger.warn(`Failed to load fixture data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  return {};
}

/**
 * Collect CSS files from the template directory, bundle and minify via LightningCSS.
 * Also includes the generated tokens.css.
 */
async function bundleCSS(
  options: GeneratorOptions,
  templateDir: string,
  logger: Logger
): Promise<void> {
  const cssFiles: string[] = [];

  // Always include tokens.css first
  const tokensCssPath = path.join(options.outputDir, 'tokens.css');
  if (fs.existsSync(tokensCssPath)) {
    cssFiles.push(tokensCssPath);
  }

  // Collect shared CSS first (shared across build types)
  const sharedCssDir = resolveSharedDir();
  if (fs.existsSync(path.join(sharedCssDir, 'css'))) {
    collectFiles(path.join(sharedCssDir, 'css'), '.css', cssFiles);
  }

  // Collect *.css from template directory
  collectFiles(templateDir, '.css', cssFiles);

  if (cssFiles.length === 0) {
    // Create a minimal styles.min.css if no CSS source files exist
    fs.writeFileSync(
      path.join(options.outputDir, 'styles.min.css'),
      '/* No source CSS files */\n',
      'utf-8'
    );
    logger.info('No CSS source files found, created empty styles.min.css');
    return;
  }

  // Concatenate all CSS
  const combinedCSS = cssFiles
    .map((f) => fs.readFileSync(f, 'utf-8'))
    .join('\n');

  // Minify via LightningCSS
  const { code } = lightningTransform({
    filename: 'styles.css',
    code: Buffer.from(combinedCSS),
    minify: true,
    include: Features.Nesting,
  });

  fs.writeFileSync(
    path.join(options.outputDir, 'styles.min.css'),
    code,
    'utf-8'
  );
  logger.info('styles.min.css generated', { sourceFiles: cssFiles.length });
}

/**
 * Collect JS/TS files from the template directory, bundle and minify via esbuild.
 */
async function bundleJS(
  options: GeneratorOptions,
  templateDir: string,
  logger: Logger
): Promise<void> {
  const jsFiles: string[] = [];

  // Collect shared JS first
  const sharedJsDir = resolveSharedDir();
  if (fs.existsSync(path.join(sharedJsDir, 'js'))) {
    collectFiles(path.join(sharedJsDir, 'js'), '.js', jsFiles);
  }

  collectFiles(templateDir, '.js', jsFiles);
  collectFiles(templateDir, '.ts', jsFiles);

  if (jsFiles.length === 0) {
    // Create a minimal scripts.min.js
    fs.writeFileSync(
      path.join(options.outputDir, 'scripts.min.js'),
      '/* No source JS files */\n',
      'utf-8'
    );
    logger.info('No JS source files found, created empty scripts.min.js');
    return;
  }

  // Create a temporary entry file that imports all JS files
  const entryContent = jsFiles
    .map((f) => `import '${f.replace(/\\/g, '/')}';`)
    .join('\n');
  const entryPath = path.join(options.outputDir, '_entry.js');
  fs.writeFileSync(entryPath, entryContent, 'utf-8');

  try {
    await esbuild.build({
      entryPoints: [entryPath],
      bundle: true,
      minify: true,
      outfile: path.join(options.outputDir, 'scripts.min.js'),
      format: 'iife',
      target: 'es2020',
      logLevel: 'silent',
    });
    logger.info('scripts.min.js generated', { sourceFiles: jsFiles.length });
  } finally {
    // Clean up temp entry file
    if (fs.existsSync(entryPath)) {
      fs.unlinkSync(entryPath);
    }
  }
}

/**
 * Copy font files into dist/assets/fonts/.
 * Fonts are sourced from the project-level fonts directory or token-referenced fonts.
 */
function copyFonts(
  options: GeneratorOptions,
  logger: Logger
): number {
  const fontsSourceDirs = [
    path.resolve('assets', 'fonts'),
    path.resolve('fonts'),
    path.resolve('data', 'fonts'),
  ];

  let fontCount = 0;
  const destDir = path.join(options.outputDir, 'assets', 'fonts');

  for (const srcDir of fontsSourceDirs) {
    if (!fs.existsSync(srcDir)) continue;

    const files = fs.readdirSync(srcDir).filter((f) =>
      /\.(woff2?|ttf|otf|eot)$/i.test(f)
    );

    for (const file of files) {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
      fontCount++;
    }
  }

  if (fontCount > 0) {
    logger.info(`Copied ${fontCount} font files to assets/fonts/`);
  }

  return fontCount;
}

/**
 * Copy image files into dist/assets/images/.
 * Validates that all referenced images exist; throws BuildError if missing.
 */
function copyImages(
  options: GeneratorOptions,
  templateDir: string,
  logger: Logger
): number {
  const imageSourceDirs = [
    path.resolve('assets', 'images'),
    path.resolve('images'),
    path.join(templateDir, 'images'),
  ];

  let imageCount = 0;
  const destDir = path.join(options.outputDir, 'assets', 'images');

  for (const srcDir of imageSourceDirs) {
    if (!fs.existsSync(srcDir)) continue;

    const files = fs.readdirSync(srcDir).filter((f) =>
      /\.(png|jpe?g|gif|svg|webp|ico|avif)$/i.test(f)
    );

    for (const file of files) {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
      imageCount++;
    }
  }

  // Validate referenced images in templates
  validateReferencedImages(templateDir, destDir, logger);

  if (imageCount > 0) {
    logger.info(`Copied ${imageCount} image files to assets/images/`);
  }

  return imageCount;
}

/**
 * Scan template files for image references and verify they exist in the output.
 * Throws BuildError if a referenced image is not found (AC-6).
 */
function validateReferencedImages(
  templateDir: string,
  imageDestDir: string,
  logger: Logger
): void {
  const njkFiles: string[] = [];
  collectFiles(templateDir, '.njk', njkFiles);

  const imgPattern = /(?:src|href)=["'](?:.*?\/)?([^/"']+\.(?:png|jpe?g|gif|svg|webp|ico|avif))["']/gi;

  for (const file of njkFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    let match: RegExpExecArray | null;

    while ((match = imgPattern.exec(content)) !== null) {
      const imageName = match[1];
      // Skip template variables
      if (imageName.includes('{{') || imageName.includes('{%')) continue;

      const imagePath = path.join(imageDestDir, imageName);
      if (!fs.existsSync(imagePath)) {
        throw new BuildError(
          `Referenced image not found: "${imageName}" in template "${path.basename(file)}". ` +
          `Expected at: ${imagePath}`
        );
      }
    }
  }
}

/**
 * Post-process all HTML and CSS in the output directory, converting
 * absolute/root-relative paths to relative paths (AC-4).
 */
function rewriteRelativePaths(outputDir: string, logger: Logger): void {
  const htmlFiles = fs
    .readdirSync(outputDir)
    .filter((f) => f.endsWith('.html'));

  let rewriteCount = 0;

  for (const file of htmlFiles) {
    const filePath = path.join(outputDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Replace root-relative paths: /assets/ -> assets/
    content = content.replace(
      /((?:href|src|action)=["'])\/(?!\/)/g,
      '$1'
    );

    // Replace url() root-relative paths in inline styles
    content = content.replace(
      /(url\(["']?)\/(?!\/)/g,
      '$1'
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      rewriteCount++;
    }
  }

  // Also process CSS files
  const cssFiles = fs
    .readdirSync(outputDir)
    .filter((f) => f.endsWith('.css'));

  for (const file of cssFiles) {
    const filePath = path.join(outputDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Replace root-relative url() in CSS
    content = content.replace(
      /(url\(["']?)\/(?!\/)/g,
      '$1'
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      rewriteCount++;
    }
  }

  if (rewriteCount > 0) {
    logger.info(`Rewrote paths in ${rewriteCount} files to relative`);
  }
}

/**
 * Inject SEO metadata into rendered HTML pages and generate sitemap.xml + robots.txt.
 *
 * For each HTML file in outputDir, generates SEO metadata from templateData.seo
 * (if provided) and injects meta tags into the <head> section.
 * Also writes sitemap.xml and robots.txt to the output root.
 *
 * BSS-5.5 AC-10: Pipeline integration.
 */
function injectSEOMetadata(
  options: GeneratorOptions,
  outputDir: string,
  logger: Logger
): void {
  const seoEngine = new SEOMetadataEngine();
  const templateData = options.templateData as Record<string, unknown> | undefined;
  const seoPages = templateData?.seoPages as readonly SEOInput[] | undefined;

  if (!seoPages || seoPages.length === 0) {
    logger.info('No SEO pages configured, skipping SEO injection');
    return;
  }

  // Generate metadata per page and inject into HTML files
  for (const seoInput of seoPages) {
    const metadata = seoEngine.generate(seoInput);
    const slug = metadata.slug || 'index';
    const htmlFile = slug === 'index'
      ? path.join(outputDir, 'index.html')
      : path.join(outputDir, `${slug}.html`);

    if (!fs.existsSync(htmlFile)) {
      // Try matching by page title to filename
      const altFile = path.join(
        outputDir,
        `${seoInput.pageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.html`
      );
      if (!fs.existsSync(altFile)) {
        logger.warn(`SEO: No HTML file found for slug "${slug}"`);
        continue;
      }
      injectMetaIntoHtml(altFile, metadata, seoInput, logger);
      continue;
    }

    injectMetaIntoHtml(htmlFile, metadata, seoInput, logger);
  }

  // Generate sitemap.xml
  const sitemapXml = seoEngine.generateSitemap(seoPages);
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  logger.info('sitemap.xml generated', { pages: seoPages.length });

  // Generate robots.txt
  const baseUrl = seoPages[0]?.pageUrl
    ? new URL(seoPages[0].pageUrl).origin
    : undefined;
  const robotsTxt = seoEngine.generateRobotsTxt(
    baseUrl
      ? { sitemapUrl: `${baseUrl}/sitemap.xml` }
      : undefined
  );
  fs.writeFileSync(path.join(outputDir, 'robots.txt'), robotsTxt, 'utf-8');
  logger.info('robots.txt generated');
}

/**
 * Inject SEO meta tags into an HTML file's <head> section.
 * Replaces the {% block meta %} content with generated metadata.
 */
function injectMetaIntoHtml(
  htmlFile: string,
  metadata: import('./seo').SEOMetadata,
  seoInput: SEOInput,
  logger: Logger
): void {
  let html = fs.readFileSync(htmlFile, 'utf-8');

  // Build meta tags string
  const metaTags: string[] = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}">`,
  ];

  // Noindex
  if (metadata.noindex) {
    metaTags.push('<meta name="robots" content="noindex, nofollow">');
  }

  // Open Graph
  for (const [property, content] of Object.entries(metadata.openGraph)) {
    if (content) {
      metaTags.push(`<meta property="${escapeHtml(property)}" content="${escapeHtml(content)}">`);
    }
  }

  const metaBlock = metaTags.join('\n  ');

  // Replace <title> tag if exists
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(metadata.title)}</title>`
  );

  // Replace or insert meta description
  if (html.includes('name="description"')) {
    html = html.replace(
      /<meta\s+name="description"\s+content="[^"]*">/,
      `<meta name="description" content="${escapeHtml(metadata.description)}">`
    );
  } else {
    // Insert after <title>
    html = html.replace(
      /(<title>[^<]*<\/title>)/,
      `$1\n  <meta name="description" content="${escapeHtml(metadata.description)}">`
    );
  }

  // Insert OG tags before </head>
  const ogTags = Object.entries(metadata.openGraph)
    .filter(([, content]) => content)
    .map(([property, content]) => `  <meta property="${escapeHtml(property)}" content="${escapeHtml(content as string)}">`)
    .join('\n');

  if (ogTags) {
    html = html.replace('</head>', `${ogTags}\n</head>`);
  }

  // Insert noindex if needed
  if (metadata.noindex) {
    html = html.replace('</head>', '  <meta name="robots" content="noindex, nofollow">\n</head>');
  }

  fs.writeFileSync(htmlFile, html, 'utf-8');
  logger.info(`SEO metadata injected into ${path.basename(htmlFile)}`);
}

/**
 * Escape HTML special characters for safe attribute values.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Recursively collect files with a given extension from a directory.
 */
function collectFiles(dir: string, ext: string, result: string[]): void {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, ext, result);
    } else if (entry.name.endsWith(ext)) {
      result.push(fullPath);
    }
  }
}
