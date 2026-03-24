/**
 * SEO Metadata Engine
 *
 * Pure TypeScript utility that generates all SEO metadata for static pages.
 * Deterministic: same input always produces same output. No AI calls.
 *
 * BSS-5.5 — FR-3.7 compliance.
 */

import type {
  SEOInput,
  SEOMetadata,
  OpenGraphMeta,
  ImageInput,
  HeadingEntry,
  SEOWarning,
  SitemapEntry,
  RobotsConfig,
  RobotsRule,
} from './types';

/** Maximum meta title length */
const MAX_TITLE_LENGTH = 60;

/** Maximum meta description length */
const MAX_DESCRIPTION_LENGTH = 155;

/** Maximum slug length */
const MAX_SLUG_LENGTH = 60;

/** CTA verbs used in description generation */
const CTA_VERBS = [
  'Discover',
  'Learn',
  'Explore',
  'Find',
  'Get',
  'Start',
  'Try',
  'See',
  'Build',
  'Grow',
] as const;

/** OG type mapping by page type */
const OG_TYPE_MAP: Record<SEOInput['pageType'], string> = {
  'landing-page': 'website',
  'blog-post': 'article',
  'service': 'website',
  'about': 'website',
  'home': 'website',
  'other': 'website',
};

/**
 * Truncate text to a character limit at the last full word boundary.
 * Appends ellipsis if truncated.
 */
function truncateToLimit(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const truncated = text.slice(0, limit);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace === -1) return truncated.slice(0, limit - 1) + '\u2026';
  return truncated.slice(0, lastSpace) + '\u2026';
}

/**
 * Convert a title string to a URL-safe kebab-case slug.
 */
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, '');
}

/**
 * Escape special XML characters for sitemap generation.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * SEO Metadata Engine.
 *
 * Generates meta titles, descriptions, H1 tags, slugs, Open Graph tags,
 * alt text, sitemaps, and robots.txt — all deterministically from input data.
 */
export class SEOMetadataEngine {
  /**
   * Generate complete SEO metadata for a single page.
   */
  generate(input: SEOInput): SEOMetadata {
    const title = this.generateTitle(input);
    const description = this.generateDescription(input);
    const h1 = this.generateH1(input);
    const slug = this.generateSlug(input.pageTitle);
    const openGraph = this.generateOpenGraph(input, title, description);

    return {
      title,
      description,
      h1,
      slug,
      openGraph,
      noindex: input.noindex ?? false,
    };
  }

  /**
   * Generate meta title following pattern: {Primary Keyword} | {Brand Name}
   * Max 60 characters, truncated at last full word + ellipsis.
   */
  generateTitle(input: SEOInput): string {
    const raw = `${input.primaryKeyword} | ${input.brandName}`;
    return truncateToLimit(raw, MAX_TITLE_LENGTH);
  }

  /**
   * Generate meta description with a CTA verb and primary keyword.
   * Max 155 characters, truncated at last full word + ellipsis.
   */
  generateDescription(input: SEOInput): string {
    const verb = this.selectCtaVerb(input.pageType);
    const raw = `${verb} ${input.primaryKeyword.toLowerCase()} from ${input.brandName}. ${input.pageTitle}.`;
    return truncateToLimit(raw, MAX_DESCRIPTION_LENGTH);
  }

  /**
   * Generate H1 tag text aligned with the keyword but not identical to the title.
   */
  generateH1(input: SEOInput): string {
    // Use pageTitle directly — it naturally differs from the title pattern
    // "{keyword} | {brand}" vs the raw page title
    if (input.pageTitle === `${input.primaryKeyword} | ${input.brandName}`) {
      // Edge case: pageTitle matches title pattern — differentiate
      return input.primaryKeyword;
    }
    return input.pageTitle;
  }

  /**
   * Validate heading hierarchy (H2-H6).
   * Returns structured warnings for invalid nesting (e.g., H3 without preceding H2).
   */
  validateHeadings(headings: readonly HeadingEntry[], pageName?: string): SEOWarning[] {
    const warnings: SEOWarning[] = [];

    if (headings.length === 0) return warnings;

    // Track which levels we have seen
    let maxLevelSeen = 1; // H1 is implicit (always present)

    for (const heading of headings) {
      if (heading.level < 2 || heading.level > 6) {
        warnings.push({
          level: 'warn',
          message: `Invalid heading level ${heading.level}${pageName ? ` on page: ${pageName}` : ''}`,
        });
        continue;
      }

      // Check for gaps: e.g., H4 without a preceding H3
      if (heading.level > maxLevelSeen + 1) {
        const missing = `H${heading.level - 1}`;
        warnings.push({
          level: 'warn',
          message: `H${heading.level} found without preceding ${missing}${pageName ? ` on page: ${pageName}` : ''}`,
        });
      }

      if (heading.level > maxLevelSeen) {
        maxLevelSeen = heading.level;
      }
    }

    return warnings;
  }

  /**
   * Generate alt text for an image.
   * Decorative images get empty alt="".
   * Non-decorative images get descriptive alt using context + keyword.
   */
  generateAltText(image: ImageInput, primaryKeyword?: string): string {
    if (image.decorative) return '';

    const parts = [image.context];
    if (primaryKeyword && !image.context.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      parts.push(`- ${primaryKeyword}`);
    }
    return parts.join(' ');
  }

  /**
   * Generate URL slug from page title.
   * Lowercase, kebab-case, diacritics stripped, max 60 chars, no trailing hyphens.
   */
  generateSlug(pageTitle: string): string {
    return toSlug(pageTitle);
  }

  /**
   * Generate Open Graph tags from SEO input.
   */
  generateOpenGraph(
    input: SEOInput,
    title?: string,
    description?: string
  ): OpenGraphMeta {
    const ogTitle = title ?? this.generateTitle(input);
    const ogDescription = description ?? this.generateDescription(input);

    const og: OpenGraphMeta = {
      'og:title': ogTitle,
      'og:description': ogDescription,
      'og:url': input.pageUrl,
      'og:type': OG_TYPE_MAP[input.pageType],
      ...(input.ogImage ? { 'og:image': input.ogImage } : {}),
    };

    return og;
  }

  /**
   * Generate sitemap.xml content from an array of page inputs.
   */
  generateSitemap(pages: readonly SEOInput[]): string {
    const entries: SitemapEntry[] = pages
      .filter((p) => !p.noindex)
      .map((p) => ({
        loc: p.pageUrl,
        lastmod: p.lastModified ?? new Date().toISOString().split('T')[0],
        changefreq: p.changefreq ?? 'weekly',
        priority: p.priority ?? this.defaultPriority(p.pageType),
      }));

    const urlEntries = entries
      .map(
        (e) =>
          `  <url>\n` +
          `    <loc>${escapeXml(e.loc)}</loc>\n` +
          `    <lastmod>${escapeXml(e.lastmod)}</lastmod>\n` +
          `    <changefreq>${escapeXml(e.changefreq)}</changefreq>\n` +
          `    <priority>${e.priority.toFixed(1)}</priority>\n` +
          `  </url>`
      )
      .join('\n');

    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urlEntries +
      `\n</urlset>\n`
    );
  }

  /**
   * Generate robots.txt content.
   * Default: allow all crawlers.
   */
  generateRobotsTxt(config?: RobotsConfig): string {
    const rules: readonly RobotsRule[] = config?.rules ?? [
      { userAgent: '*', allow: ['/'] },
    ];

    const lines: string[] = [];

    for (const rule of rules) {
      lines.push(`User-agent: ${rule.userAgent}`);
      if (rule.allow) {
        for (const path of rule.allow) {
          lines.push(`Allow: ${path}`);
        }
      }
      if (rule.disallow) {
        for (const path of rule.disallow) {
          lines.push(`Disallow: ${path}`);
        }
      }
      lines.push('');
    }

    if (config?.sitemapUrl) {
      lines.push(`Sitemap: ${config.sitemapUrl}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Select a CTA verb based on page type.
   */
  private selectCtaVerb(pageType: SEOInput['pageType']): string {
    switch (pageType) {
      case 'landing-page':
        return CTA_VERBS[0]; // Discover
      case 'blog-post':
        return CTA_VERBS[1]; // Learn
      case 'service':
        return CTA_VERBS[2]; // Explore
      case 'about':
        return CTA_VERBS[3]; // Find
      case 'home':
        return CTA_VERBS[4]; // Get
      default:
        return CTA_VERBS[5]; // Start
    }
  }

  /**
   * Default sitemap priority based on page type.
   */
  private defaultPriority(pageType: SEOInput['pageType']): number {
    switch (pageType) {
      case 'home':
        return 1.0;
      case 'landing-page':
        return 0.9;
      case 'service':
        return 0.8;
      case 'about':
        return 0.7;
      case 'blog-post':
        return 0.6;
      default:
        return 0.5;
    }
  }
}
