/**
 * SEO Metadata Engine — Type Definitions
 *
 * Pure TypeScript interfaces for BSS-5.5 SEO engine.
 * No external dependencies.
 */

/**
 * Input for generating SEO metadata for a single page.
 */
export interface SEOInput {
  /** Raw page title for keyword extraction */
  readonly pageTitle: string;
  /** Target keyword for this page */
  readonly primaryKeyword: string;
  /** Brand name for title pattern */
  readonly brandName: string;
  /** Absolute URL for og:url and sitemap */
  readonly pageUrl: string;
  /** Page type classification */
  readonly pageType: 'landing-page' | 'blog-post' | 'service' | 'about' | 'home' | 'other';
  /** Absolute URL to OG image */
  readonly ogImage?: string;
  /** ISO date for sitemap lastmod */
  readonly lastModified?: string;
  /** Sitemap change frequency */
  readonly changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /** Sitemap priority (0.0–1.0) */
  readonly priority?: number;
  /** If true, page gets noindex meta tag */
  readonly noindex?: boolean;
}

/**
 * Image input for alt text generation.
 */
export interface ImageInput {
  /** Original image filename */
  readonly imageFilename: string;
  /** Contextual description of the image */
  readonly context: string;
  /** If true, image is decorative and gets empty alt */
  readonly decorative?: boolean;
}

/**
 * Heading entry for hierarchy validation.
 */
export interface HeadingEntry {
  /** Heading level (2–6) */
  readonly level: number;
  /** Heading text */
  readonly text: string;
}

/**
 * Structured warning from SEO validation (not thrown as exception).
 */
export interface SEOWarning {
  /** Warning severity */
  readonly level: 'warn';
  /** Human-readable warning message */
  readonly message: string;
}

/**
 * Open Graph metadata.
 */
export interface OpenGraphMeta {
  readonly 'og:title': string;
  readonly 'og:description': string;
  readonly 'og:url': string;
  readonly 'og:type': string;
  readonly 'og:image'?: string;
}

/**
 * Complete SEO metadata output for a single page.
 */
export interface SEOMetadata {
  /** Meta title (max 60 chars) */
  readonly title: string;
  /** Meta description (max 155 chars) */
  readonly description: string;
  /** H1 tag text */
  readonly h1: string;
  /** URL slug */
  readonly slug: string;
  /** Open Graph tags */
  readonly openGraph: OpenGraphMeta;
  /** Whether page should be noindexed */
  readonly noindex: boolean;
}

/**
 * Entry for sitemap.xml generation.
 */
export interface SitemapEntry {
  /** Absolute page URL */
  readonly loc: string;
  /** Last modification date (ISO format) */
  readonly lastmod: string;
  /** Change frequency */
  readonly changefreq: string;
  /** Priority (0.0–1.0) */
  readonly priority: number;
}

/**
 * Configuration for robots.txt generation.
 */
export interface RobotsConfig {
  /** Rules per user-agent */
  readonly rules?: readonly RobotsRule[];
  /** Optional sitemap URL */
  readonly sitemapUrl?: string;
}

/**
 * A single robots.txt rule block.
 */
export interface RobotsRule {
  /** User-agent string (e.g., '*', 'Googlebot') */
  readonly userAgent: string;
  /** Allowed paths */
  readonly allow?: readonly string[];
  /** Disallowed paths */
  readonly disallow?: readonly string[];
}
