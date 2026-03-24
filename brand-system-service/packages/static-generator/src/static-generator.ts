import fs from 'node:fs';
import path from 'node:path';
import { Eta } from 'eta';
import { createLogger, type Logger } from '@bss/core';
import { runBuildPipeline } from './build-pipeline';

/**
 * Build types supported by the static generator.
 */
export type BuildType = 'brand-book' | 'landing-page' | 'site' | 'bio-link' | 'thank-you' | 'microcopy-guide';

/**
 * Options for static site generation.
 */
export interface GeneratorOptions {
  /** Client identifier for token resolution */
  readonly clientId: string;
  /** Type of static site to generate */
  readonly type: BuildType;
  /** Output directory */
  readonly outputDir: string;
  /** Use relative paths for local package portability (NFR-9.2) */
  readonly relativePaths?: boolean;
  /** Enable debug logging */
  readonly debug?: boolean;
  /** Custom template data (merged with defaults and fixture data) */
  readonly templateData?: Record<string, unknown>;
}

/**
 * Generator configuration for brand book builds.
 */
export interface GeneratorConfig {
  /** Client slug for output directory naming */
  readonly clientSlug: string;
  /** Output root directory */
  readonly outputDir: string;
  /** Path to tokens directory */
  readonly tokenDir: string;
  /** Brand configuration */
  readonly brandConfig: BrandConfig;
  /** Enable debug logging */
  readonly debug?: boolean;
}

/**
 * Brand configuration loaded from brand.config.json.
 */
export interface BrandConfig {
  /** Client display name */
  readonly clientName: string;
  /** Primary brand color in hex */
  readonly primaryColor: string;
  /** Path to logo SVG (relative to project root) */
  readonly logoPath: string;
  /** Brand tagline */
  readonly tagline: string;
  /** Client website URL */
  readonly websiteUrl: string;
  /** Brand book title (defaults to "{clientName} Brand Book") */
  readonly brandBookTitle?: string;
}

/**
 * Color swatch data for template rendering.
 */
export interface ColorSwatch {
  readonly name: string;
  readonly step: string;
  readonly hex: string;
  readonly wcag?: {
    readonly onWhite: number;
    readonly onBlack: number;
    readonly aa: boolean;
    readonly aaLarge: boolean;
    readonly aaa: boolean;
  };
}

/**
 * Color group for template rendering.
 */
export interface ColorGroup {
  readonly name: string;
  readonly swatches: ColorSwatch[];
}

/**
 * Typography specimen for template rendering.
 */
export interface TypographySpecimen {
  readonly name: string;
  readonly fontSize: string;
  readonly lineHeight?: string;
  readonly letterSpacing?: string;
  readonly clamp?: string;
}

/**
 * Spacing block for template rendering.
 */
export interface SpacingBlock {
  readonly name: string;
  readonly value: string;
  readonly description: string;
}

/**
 * Component spec table entry.
 */
export interface ComponentProperty {
  readonly property: string;
  readonly value: string;
  readonly type: string;
  readonly description: string;
}

/**
 * Component group for template rendering.
 */
export interface ComponentGroup {
  readonly name: string;
  readonly variant: string;
  readonly properties: ComponentProperty[];
}

/**
 * Search index entry for Fuse.js.
 */
export interface SearchIndexEntry {
  readonly id: string;
  readonly section: string;
  readonly title: string;
  readonly content: string;
}

/**
 * Brand book page definition.
 */
export interface BrandBookPage {
  readonly slug: string;
  readonly title: string;
  readonly template: string;
}

/**
 * All brand book pages in navigation order.
 */
export const BRAND_BOOK_PAGES: BrandBookPage[] = [
  { slug: 'index', title: 'Overview', template: 'index' },
  { slug: 'guidelines', title: 'Guidelines', template: 'guidelines' },
  { slug: 'foundations', title: 'Foundations', template: 'foundations' },
  { slug: 'logo', title: 'Logo', template: 'logo' },
  { slug: 'colors', title: 'Colors', template: 'colors' },
  { slug: 'typography', title: 'Typography', template: 'typography' },
  { slug: 'icons', title: 'Icons', template: 'icons' },
  { slug: 'components', title: 'Components', template: 'components' },
  { slug: 'motion', title: 'Motion', template: 'motion' },
  { slug: 'templates', title: 'Templates', template: 'templates' },
];

/**
 * Load and validate brand.config.json.
 *
 * @param configPath - Path to brand.config.json
 * @returns Validated BrandConfig
 * @throws Error if required fields are missing
 */
export function loadBrandConfig(configPath: string): BrandConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Brand config not found: ${configPath}`);
  }

  const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  if (!raw.clientName || typeof raw.clientName !== 'string') {
    throw new Error('brand.config.json: "clientName" is required and must be a string');
  }
  if (!raw.primaryColor || typeof raw.primaryColor !== 'string') {
    throw new Error('brand.config.json: "primaryColor" is required and must be a hex string');
  }
  if (!raw.logoPath || typeof raw.logoPath !== 'string') {
    throw new Error('brand.config.json: "logoPath" is required and must be a string');
  }

  const logger = createLogger('BrandConfig', false);

  if (!raw.tagline) {
    logger.warn('brand.config.json: "tagline" is missing, using empty string');
  }
  if (!raw.websiteUrl) {
    logger.warn('brand.config.json: "websiteUrl" is missing, using empty string');
  }

  return {
    clientName: raw.clientName,
    primaryColor: raw.primaryColor,
    logoPath: raw.logoPath,
    tagline: raw.tagline || '',
    websiteUrl: raw.websiteUrl || '',
    brandBookTitle: raw.brandBookTitle || `${raw.clientName} Brand Book`,
  };
}

/**
 * Extract color swatches from primitive color tokens.
 *
 * @param tokens - Parsed primitive colors.json
 * @returns Array of color groups with swatches
 */
export function injectColors(tokens: Record<string, unknown>): ColorGroup[] {
  const colorRoot = (tokens.color ?? tokens) as Record<string, unknown>;
  const groups: ColorGroup[] = [];

  for (const [groupName, groupData] of Object.entries(colorRoot)) {
    if (typeof groupData !== 'object' || groupData === null) continue;

    const swatches: ColorSwatch[] = [];
    const entries = groupData as Record<string, unknown>;

    for (const [step, tokenData] of Object.entries(entries)) {
      if (step.startsWith('$')) continue;
      if (typeof tokenData !== 'object' || tokenData === null) continue;

      const token = tokenData as Record<string, unknown>;
      if (!token.$value || !token.$type) continue;

      const swatch: ColorSwatch = {
        name: groupName,
        step,
        hex: token.$value as string,
        wcag: token.$extensions
          ? ((token.$extensions as Record<string, unknown>).wcag as ColorSwatch['wcag'])
          : undefined,
      };

      swatches.push(swatch);
    }

    if (swatches.length > 0) {
      // Sort numerically by step
      swatches.sort((a, b) => {
        const numA = parseInt(a.step, 10);
        const numB = parseInt(b.step, 10);
        if (isNaN(numA) || isNaN(numB)) return a.step.localeCompare(b.step);
        return numA - numB;
      });

      groups.push({ name: groupName, swatches });
    }
  }

  return groups;
}

/**
 * Extract typography specimens from primitive typography tokens.
 *
 * @param tokens - Parsed primitive typography.json
 * @returns Array of typography specimens
 */
export function injectTypography(tokens: Record<string, unknown>): TypographySpecimen[] {
  const specimens: TypographySpecimen[] = [];
  const fontSizes = tokens.fontSize as Record<string, unknown> | undefined;
  const lineHeights = tokens.lineHeight as Record<string, unknown> | undefined;

  if (!fontSizes) return specimens;

  const scaleOrder = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];

  for (const name of scaleOrder) {
    const sizeToken = fontSizes[name] as Record<string, unknown> | undefined;
    if (!sizeToken || !sizeToken.$value) continue;

    const specimen: TypographySpecimen = {
      name,
      fontSize: sizeToken.$value as string,
      lineHeight: lineHeights?.normal
        ? ((lineHeights.normal as Record<string, unknown>).$value as string)
        : undefined,
      letterSpacing: undefined,
      clamp: sizeToken.$extensions
        ? ((sizeToken.$extensions as Record<string, unknown>).clamp as string)
        : undefined,
    };

    specimens.push(specimen);
  }

  return specimens;
}

/**
 * Extract spacing blocks from primitive spacing tokens.
 *
 * @param tokens - Parsed primitive spacing.json
 * @returns Array of spacing blocks
 */
export function injectSpacing(tokens: Record<string, unknown>): SpacingBlock[] {
  const spacingRoot = (tokens.spacing ?? tokens) as Record<string, unknown>;
  const blocks: SpacingBlock[] = [];

  const sortOrder = ['0', 'px', '0.5', '1', '1.5', '2', '2.5', '3', '4', '5', '6', '7', '8', '10', '12', '14', '16'];

  for (const name of sortOrder) {
    const token = spacingRoot[name] as Record<string, unknown> | undefined;
    if (!token || !token.$value) continue;

    blocks.push({
      name,
      value: token.$value as string,
      description: (token.$description as string) || '',
    });
  }

  return blocks;
}

/**
 * Extract component specification tables from component token files.
 *
 * @param componentDir - Path to tokens/component/ directory
 * @returns Array of component groups
 */
export function injectComponents(componentDir: string): ComponentGroup[] {
  const groups: ComponentGroup[] = [];

  if (!fs.existsSync(componentDir)) return groups;

  const files = fs.readdirSync(componentDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(componentDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    for (const [componentName, componentData] of Object.entries(data)) {
      if (typeof componentData !== 'object' || componentData === null) continue;

      for (const [variantName, variantData] of Object.entries(componentData as Record<string, unknown>)) {
        if (typeof variantData !== 'object' || variantData === null) continue;

        const properties: ComponentProperty[] = [];

        for (const [propName, propData] of Object.entries(variantData as Record<string, unknown>)) {
          if (typeof propData !== 'object' || propData === null) continue;

          const token = propData as Record<string, unknown>;
          if (token.$value !== undefined) {
            properties.push({
              property: propName,
              value: token.$value as string,
              type: (token.$type as string) || 'unknown',
              description: (token.$description as string) || '',
            });
          } else {
            // Nested group (e.g., button.primary.label.fontSize)
            for (const [subProp, subData] of Object.entries(propData as Record<string, unknown>)) {
              if (typeof subData !== 'object' || subData === null) continue;
              const subToken = subData as Record<string, unknown>;
              if (subToken.$value !== undefined) {
                properties.push({
                  property: `${propName}.${subProp}`,
                  value: subToken.$value as string,
                  type: (subToken.$type as string) || 'unknown',
                  description: (subToken.$description as string) || '',
                });
              }
            }
          }
        }

        if (properties.length > 0) {
          groups.push({
            name: componentName,
            variant: variantName,
            properties,
          });
        }
      }
    }
  }

  return groups;
}

/**
 * Build search index from all generated section content.
 *
 * @param sections - Map of section slug to text content
 * @returns Array of search index entries
 */
export function buildSearchIndex(sections: Map<string, string>): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];

  for (const [slug, content] of sections) {
    const page = BRAND_BOOK_PAGES.find((p) => p.slug === slug);
    if (!page) continue;

    entries.push({
      id: slug,
      section: slug,
      title: page.title,
      content: content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    });
  }

  return entries;
}

/**
 * Static Generator builds HTML/CSS/JS brand books from templates and tokens.
 *
 * Per ADR-001, this is the DEFAULT build path. Templates are rendered
 * at build time with design tokens injected as CSS Custom Properties.
 */
export class StaticGenerator {
  private readonly logger: Logger;
  private readonly eta: Eta;

  constructor(debug = false) {
    this.logger = createLogger('StaticGenerator', debug);
    this.eta = new Eta({ views: path.join(__dirname, '..', 'templates'), autoEscape: false });
  }

  /**
   * Generate a static site.
   *
   * Routes to the appropriate build pipeline based on the build type:
   * - brand-book: Uses Eta templates and the existing brand book generation flow
   * - landing-page, site: Uses Nunjucks templates with LightningCSS + esbuild bundling
   */
  async generate(options: GeneratorOptions): Promise<string> {
    const startTime = Date.now();
    this.logger.info('Static generation started', {
      clientId: options.clientId,
      type: options.type,
      outputDir: options.outputDir,
    });

    if (options.type === 'brand-book') {
      return this.generateBrandBook({
        clientSlug: options.clientId,
        outputDir: options.outputDir,
        tokenDir: path.join(process.cwd(), 'tokens'),
        brandConfig: loadBrandConfig(path.join(process.cwd(), 'brand.config.json')),
        debug: options.debug,
      });
    }

    // Landing page and site types use the full build pipeline
    const result = await runBuildPipeline(options, this.logger);

    const elapsed = Date.now() - startTime;
    this.logger.info(`Static generation completed in ${elapsed}ms`, {
      clientId: options.clientId,
      type: options.type,
      durationMs: elapsed,
      pageCount: result.pageCount,
      assetCount: result.assetCount,
    });

    return result.outputDir;
  }

  /**
   * Generate a brand book from config, tokens, and templates.
   *
   * @param config - Generator configuration
   * @returns Output directory path
   */
  async generateBrandBook(config: GeneratorConfig): Promise<string> {
    const startTime = Date.now();
    const outputDir = path.join(config.outputDir, config.clientSlug, 'brand-book');

    this.logger.info('Brand book generation started', { clientSlug: config.clientSlug, outputDir });

    // Ensure output directories exist
    fs.mkdirSync(path.join(outputDir, 'assets'), { recursive: true });

    // Load token data
    const colorTokens = this.loadJsonSafe(path.join(config.tokenDir, 'primitive', 'colors.json'));
    const typographyTokens = this.loadJsonSafe(path.join(config.tokenDir, 'primitive', 'typography.json'));
    const spacingTokens = this.loadJsonSafe(path.join(config.tokenDir, 'primitive', 'spacing.json'));
    const effectsTokens = this.loadJsonSafe(path.join(config.tokenDir, 'primitive', 'effects.json'));
    const semanticColors = this.loadJsonSafe(path.join(config.tokenDir, 'semantic', 'colors.json'));
    const typographyMeta = this.loadJsonSafe(path.join(config.tokenDir, 'typography-meta.json'));
    const gridConfig = this.loadJsonSafe(path.join(config.tokenDir, 'grid.config.json'));

    // Inject token data
    const colorGroups = injectColors(colorTokens);
    const semanticColorGroups = injectColors(semanticColors);
    const typographySpecimens = injectTypography(typographyTokens);
    const spacingBlocks = injectSpacing(spacingTokens);
    const componentGroups = injectComponents(path.join(config.tokenDir, 'component'));

    // Build template data
    const templateData = {
      brand: config.brandConfig,
      title: config.brandConfig.brandBookTitle || `${config.brandConfig.clientName} Brand Book`,
      pages: BRAND_BOOK_PAGES,
      colors: { primitive: colorGroups, semantic: semanticColorGroups },
      typography: {
        specimens: typographySpecimens,
        fontFamilies: typographyTokens.fontFamily || {},
        meta: typographyMeta,
      },
      spacing: spacingBlocks,
      effects: effectsTokens,
      grid: gridConfig,
      components: componentGroups,
    };

    // Generate CSS
    const cssContent = this.generateCSS(config.brandConfig, typographyMeta);
    fs.writeFileSync(path.join(outputDir, 'assets', 'style.css'), cssContent, 'utf-8');

    // Generate pages and collect content for search index
    const sectionContent = new Map<string, string>();

    for (const page of BRAND_BOOK_PAGES) {
      const pageContent = this.renderPage(page, templateData);
      fs.writeFileSync(path.join(outputDir, `${page.slug}.html`), pageContent, 'utf-8');
      sectionContent.set(page.slug, pageContent);
      this.logger.info(`Generated ${page.slug}.html`);
    }

    // Generate search index
    const searchIndex = buildSearchIndex(sectionContent);
    fs.writeFileSync(
      path.join(outputDir, 'assets', 'search-index.json'),
      JSON.stringify(searchIndex, null, 2),
      'utf-8'
    );

    // Generate search.js
    const searchJs = this.generateSearchJs();
    fs.writeFileSync(path.join(outputDir, 'assets', 'search.js'), searchJs, 'utf-8');

    // Copy assets
    this.copyAssets(config, outputDir);

    const elapsed = Date.now() - startTime;
    this.logger.info(`Brand book generation completed in ${elapsed}ms`, {
      clientSlug: config.clientSlug,
      pages: BRAND_BOOK_PAGES.length,
      elapsed,
    });

    return outputDir;
  }

  /**
   * Render a single page using layout + section template.
   */
  private renderPage(
    page: BrandBookPage,
    data: Record<string, unknown>
  ): string {
    const sectionHtml = this.eta.render(page.template, {
      ...data,
      currentPage: page,
    });

    return this.eta.render('layout', {
      ...data,
      currentPage: page,
      content: sectionHtml,
    });
  }

  /**
   * Generate the main CSS file.
   */
  private generateCSS(brand: BrandConfig, typographyMeta: Record<string, unknown>): string {
    return `/* Brand Book Styles — Generated by @bss/static-generator */
:root {
  --brand-primary: ${brand.primaryColor};
  --sidebar-width: 260px;
  --content-max: 960px;
  --nav-height: 56px;
  --color-bg: #ffffff;
  --color-bg-subtle: #f8f9fa;
  --color-text: #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-focus: ${brand.primaryColor};
  --font-body: 'Inter', system-ui, sans-serif;
  --font-display: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html { font-size: 16px; scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Focus styles (WCAG AA) */
:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

a { color: var(--brand-primary); text-decoration: none; }
a:hover { text-decoration: underline; }

/* Layout */
.page-wrapper {
  display: flex;
  min-height: 100vh;
}

/* Sidebar Navigation */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--color-bg-subtle);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  z-index: 100;
  padding: 24px 0;
}

.sidebar__brand {
  padding: 0 24px 24px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}

.sidebar__brand-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.sidebar__brand-tagline {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.sidebar__logo {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
}

.sidebar nav a {
  display: block;
  padding: 10px 24px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.sidebar nav a:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--color-text);
  text-decoration: none;
}

.sidebar nav a.active {
  color: var(--brand-primary);
  background: rgba(0, 0, 0, 0.06);
  font-weight: 600;
  border-left: 3px solid var(--brand-primary);
}

/* Main Content */
.main-content {
  margin-left: var(--sidebar-width);
  flex: 1;
  padding: 48px 64px;
  max-width: calc(var(--content-max) + 128px);
}

.main-content h1 {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
}

.main-content h2 {
  font-size: 24px;
  font-weight: 600;
  margin-top: 48px;
  margin-bottom: 16px;
  letter-spacing: -0.015em;
}

.main-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin-top: 32px;
  margin-bottom: 12px;
}

.main-content p {
  margin-bottom: 16px;
  max-width: 680px;
}

/* Search */
.search-container {
  padding: 0 24px 16px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
}

.search-input:focus {
  border-color: var(--brand-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

.search-results {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 400px;
  overflow-y: auto;
  z-index: 200;
  margin-top: 4px;
}

.search-results.visible { display: block; }

.search-result-item {
  display: block;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.search-result-item:hover {
  background: var(--color-bg-subtle);
  text-decoration: none;
}

.search-result-item__title {
  font-weight: 600;
  font-size: 14px;
}

.search-result-item__snippet {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* Color Swatches */
.color-group { margin-bottom: 40px; }

.color-group__title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  text-transform: capitalize;
}

.color-swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.color-swatch {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.color-swatch__preview {
  height: 80px;
  width: 100%;
}

.color-swatch__info {
  padding: 8px 12px;
  font-size: 12px;
}

.color-swatch__name {
  font-weight: 600;
  font-family: var(--font-mono);
}

.color-swatch__hex {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

.wcag-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  margin-top: 4px;
}

.wcag-badge--pass { background: #dcfce7; color: #166534; }
.wcag-badge--fail { background: #fef2f2; color: #991b1b; }

/* Typography Specimens */
.type-specimen {
  margin-bottom: 24px;
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.type-specimen__label {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  margin-bottom: 8px;
}

.type-specimen__sample {
  margin-bottom: 8px;
}

.type-specimen__meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

/* Spacing Blocks */
.spacing-blocks { display: flex; flex-direction: column; gap: 8px; }

.spacing-block {
  display: flex;
  align-items: center;
  gap: 16px;
}

.spacing-block__visual {
  background: var(--brand-primary);
  opacity: 0.3;
  border-radius: 4px;
  min-width: 8px;
  height: 32px;
  flex-shrink: 0;
}

.spacing-block__label {
  font-family: var(--font-mono);
  font-size: 13px;
  min-width: 60px;
  font-weight: 600;
}

.spacing-block__value {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-secondary);
  min-width: 60px;
}

.spacing-block__desc {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* Component Spec Tables */
.component-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
  font-size: 14px;
}

.component-table th {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 2px solid var(--color-border);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

.component-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-mono);
  font-size: 13px;
}

/* Hamburger Menu (CSS-only for mobile) */
.hamburger-toggle { display: none; }
.hamburger-label { display: none; }

.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  z-index: 150;
  align-items: center;
  padding: 0 16px;
}

.mobile-header__title {
  font-weight: 700;
  font-size: 16px;
  margin-left: 12px;
}

/* Hamburger icon */
.hamburger-label span,
.hamburger-label span::before,
.hamburger-label span::after {
  display: block;
  background: var(--color-text);
  height: 2px;
  width: 24px;
  transition: transform 0.2s;
  position: relative;
}

.hamburger-label span::before,
.hamburger-label span::after {
  content: '';
  position: absolute;
}

.hamburger-label span::before { top: -7px; }
.hamburger-label span::after { top: 7px; }

.hamburger-toggle:checked ~ .sidebar {
  transform: translateX(0);
}

.hamburger-toggle:checked ~ .mobile-header .hamburger-label span {
  background: transparent;
}

.hamburger-toggle:checked ~ .mobile-header .hamburger-label span::before {
  transform: rotate(45deg);
  top: 0;
}

.hamburger-toggle:checked ~ .mobile-header .hamburger-label span::after {
  transform: rotate(-45deg);
  top: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .mobile-header { display: flex; }

  .hamburger-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px;
  }

  .main-content {
    margin-left: 0;
    padding: 80px 24px 48px;
  }
}

/* Section-specific */
.section-intro {
  font-size: 18px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
  max-width: 680px;
}

.font-family-card {
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 16px;
}

.font-family-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.font-family-card__sample {
  font-size: 32px;
  margin-bottom: 8px;
}

.logo-display {
  padding: 48px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-align: center;
  margin-bottom: 24px;
}

.logo-display img {
  max-width: 320px;
  max-height: 200px;
}

.motion-card {
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 16px;
}

.motion-card__label {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  margin-bottom: 8px;
}

.motion-card__value {
  font-family: var(--font-mono);
  font-weight: 600;
}
`;
  }

  /**
   * Generate the search.js client-side script.
   */
  private generateSearchJs(): string {
    return `/* Brand Book Search — Powered by Fuse.js */
(function() {
  'use strict';
  var searchInput = document.getElementById('brand-search');
  var resultsEl = document.getElementById('search-results');
  if (!searchInput || !resultsEl) return;

  var fuse = null;
  var indexLoaded = false;

  function loadIndex() {
    if (indexLoaded) return Promise.resolve();
    return fetch('./assets/search-index.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        fuse = new Fuse(data, {
          keys: ['title', 'content'],
          threshold: 0.3,
          includeMatches: true,
          minMatchCharLength: 2,
        });
        indexLoaded = true;
      });
  }

  searchInput.addEventListener('focus', function() {
    loadIndex();
  });

  var debounce;
  searchInput.addEventListener('input', function() {
    clearTimeout(debounce);
    var query = searchInput.value.trim();
    if (query.length < 2) {
      resultsEl.classList.remove('visible');
      resultsEl.innerHTML = '';
      return;
    }
    debounce = setTimeout(function() {
      loadIndex().then(function() {
        var results = fuse.search(query, { limit: 8 });
        if (results.length === 0) {
          resultsEl.innerHTML = '<div style="padding:16px;color:#6b7280;font-size:14px;">No results found.</div>';
          resultsEl.classList.add('visible');
          return;
        }
        var html = results.map(function(r) {
          var snippet = r.item.content.substring(0, 120) + '...';
          return '<a class="search-result-item" href="./' + r.item.section + '.html">' +
            '<div class="search-result-item__title">' + r.item.title + '</div>' +
            '<div class="search-result-item__snippet">' + snippet + '</div></a>';
        }).join('');
        resultsEl.innerHTML = html;
        resultsEl.classList.add('visible');
      });
    }, 150);
  });

  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !resultsEl.contains(e.target)) {
      resultsEl.classList.remove('visible');
    }
  });

  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      resultsEl.classList.remove('visible');
      searchInput.blur();
    }
  });
})();
`;
  }

  /**
   * Copy logo and other assets to output directory.
   */
  private copyAssets(config: GeneratorConfig, outputDir: string): void {
    // Copy logo if it exists
    const logoSrc = path.resolve(path.dirname(config.tokenDir), config.brandConfig.logoPath);
    const logoDest = path.join(outputDir, 'assets', 'logo.svg');

    if (fs.existsSync(logoSrc)) {
      fs.copyFileSync(logoSrc, logoDest);
      this.logger.info('Copied logo to assets/logo.svg');
    } else {
      // Create a placeholder SVG
      const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="${config.brandConfig.primaryColor}" rx="16"/>
  <text x="60" y="68" text-anchor="middle" fill="white" font-family="system-ui" font-size="48" font-weight="700">${config.brandConfig.clientName.charAt(0)}</text>
</svg>`;
      fs.writeFileSync(logoDest, placeholderSvg, 'utf-8');
      this.logger.warn('Logo not found, created placeholder SVG');
    }
  }

  /**
   * Safely load a JSON file, returning empty object if not found.
   */
  private loadJsonSafe(filePath: string): Record<string, unknown> {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    } catch (err) {
      this.logger.warn(`Failed to load ${filePath}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    return {};
  }
}
