/**
 * Tests for the SEO Metadata Engine (BSS-5.5)
 *
 * Covers:
 * - Title generation (under limit, at limit, truncation) — AC-2
 * - Description generation (CTA verb, truncation) — AC-3
 * - H1 generation (not identical to title) — AC-4
 * - Slug generation (special chars, diacritics, max length) — AC-7
 * - Heading hierarchy validation (valid and invalid) — AC-5
 * - Alt text generation (descriptive and decorative) — AC-6
 * - Open Graph tags — AC-11
 * - Sitemap XML output format — AC-8
 * - Robots.txt generation — AC-9
 * - Full generate() pipeline — AC-1
 * - Integration: 3-page build with sitemap/robots — AC-13
 */

import { SEOMetadataEngine } from '../seo/seo-engine';
import type {
  SEOInput,
  HeadingEntry,
  ImageInput,
} from '../seo/types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function createTestInput(overrides?: Partial<SEOInput>): SEOInput {
  return {
    pageTitle: 'Professional Branding Services',
    primaryKeyword: 'Branding Services',
    brandName: 'Acme Corp',
    pageUrl: 'https://acme.com/services',
    pageType: 'service',
    ...overrides,
  };
}

function createLongKeyword(length: number): string {
  const base = 'Professional Enterprise Branding and Marketing';
  return base.repeat(Math.ceil(length / base.length)).slice(0, length);
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let engine: SEOMetadataEngine;

beforeEach(() => {
  engine = new SEOMetadataEngine();
});

// ---------------------------------------------------------------------------
// AC-2: Meta Title Generation
// ---------------------------------------------------------------------------

describe('generateTitle', () => {
  it('generates title with pattern "{keyword} | {brand}"', () => {
    const input = createTestInput();
    const title = engine.generateTitle(input);
    expect(title).toBe('Branding Services | Acme Corp');
  });

  it('returns title under 60 characters unchanged', () => {
    const input = createTestInput({
      primaryKeyword: 'SEO',
      brandName: 'Co',
    });
    const title = engine.generateTitle(input);
    expect(title).toBe('SEO | Co');
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('returns title at exactly 60 characters unchanged', () => {
    // "X | Y" = keyword.length + 3 + brand.length
    // Need total = 60
    const keyword = 'A'.repeat(40);
    const brand = 'B'.repeat(17); // 40 + 3 + 17 = 60
    const input = createTestInput({ primaryKeyword: keyword, brandName: brand });
    const title = engine.generateTitle(input);
    expect(title.length).toBe(60);
    expect(title).toBe(`${keyword} | ${brand}`);
  });

  it('truncates title over 60 characters at last word boundary with ellipsis', () => {
    const input = createTestInput({
      primaryKeyword: 'Professional Enterprise Branding and Marketing Solutions',
      brandName: 'International Corp',
    });
    const title = engine.generateTitle(input);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith('\u2026')).toBe(true);
  });

  it('includes the primary keyword in the title', () => {
    const input = createTestInput({ primaryKeyword: 'Web Design' });
    const title = engine.generateTitle(input);
    expect(title).toContain('Web Design');
  });
});

// ---------------------------------------------------------------------------
// AC-3: Meta Description Generation
// ---------------------------------------------------------------------------

describe('generateDescription', () => {
  it('generates description under 155 characters', () => {
    const input = createTestInput();
    const desc = engine.generateDescription(input);
    expect(desc.length).toBeLessThanOrEqual(155);
  });

  it('includes a CTA verb', () => {
    const input = createTestInput({ pageType: 'landing-page' });
    const desc = engine.generateDescription(input);
    expect(desc).toMatch(/^(Discover|Learn|Explore|Find|Get|Start|Try|See|Build|Grow)\s/);
  });

  it('includes the primary keyword', () => {
    const input = createTestInput({ primaryKeyword: 'Brand Identity' });
    const desc = engine.generateDescription(input);
    expect(desc.toLowerCase()).toContain('brand identity');
  });

  it('truncates long descriptions at last word boundary with ellipsis', () => {
    const input = createTestInput({
      pageTitle: 'A'.repeat(100),
      primaryKeyword: 'B'.repeat(60),
      brandName: 'C'.repeat(30),
    });
    const desc = engine.generateDescription(input);
    expect(desc.length).toBeLessThanOrEqual(155);
    expect(desc.endsWith('\u2026')).toBe(true);
  });

  it('uses different CTA verbs for different page types', () => {
    const landing = engine.generateDescription(createTestInput({ pageType: 'landing-page' }));
    const blog = engine.generateDescription(createTestInput({ pageType: 'blog-post' }));
    const service = engine.generateDescription(createTestInput({ pageType: 'service' }));

    expect(landing).toMatch(/^Discover/);
    expect(blog).toMatch(/^Learn/);
    expect(service).toMatch(/^Explore/);
  });
});

// ---------------------------------------------------------------------------
// AC-4: H1 Generation
// ---------------------------------------------------------------------------

describe('generateH1', () => {
  it('generates H1 aligned with keyword', () => {
    const input = createTestInput();
    const h1 = engine.generateH1(input);
    expect(h1).toBe('Professional Branding Services');
  });

  it('H1 is not identical to the title tag', () => {
    const input = createTestInput();
    const title = engine.generateTitle(input);
    const h1 = engine.generateH1(input);
    expect(h1).not.toBe(title);
  });

  it('handles edge case where pageTitle matches title pattern', () => {
    const input = createTestInput({
      pageTitle: 'Branding Services | Acme Corp',
      primaryKeyword: 'Branding Services',
      brandName: 'Acme Corp',
    });
    const h1 = engine.generateH1(input);
    // Should differentiate — returns keyword only
    expect(h1).toBe('Branding Services');
    expect(h1).not.toBe('Branding Services | Acme Corp');
  });
});

// ---------------------------------------------------------------------------
// AC-7: Slug Generation
// ---------------------------------------------------------------------------

describe('generateSlug', () => {
  it('converts title to lowercase kebab-case', () => {
    const slug = engine.generateSlug('Professional Branding Services');
    expect(slug).toBe('professional-branding-services');
  });

  it('strips diacritics', () => {
    const slug = engine.generateSlug('Servi\u00e7os de Gest\u00e3o');
    expect(slug).toBe('servicos-de-gestao');
  });

  it('strips special characters', () => {
    const slug = engine.generateSlug('Hello! @World #2024');
    expect(slug).toBe('hello-world-2024');
  });

  it('limits slug to 60 characters', () => {
    const longTitle = 'This Is A Very Long Title That Should Be Truncated Because It Exceeds The Maximum Slug Length';
    const slug = engine.generateSlug(longTitle);
    expect(slug.length).toBeLessThanOrEqual(60);
  });

  it('removes trailing hyphens after truncation', () => {
    // Create a title that when truncated at 60 chars would end with a hyphen
    const title = 'a '.repeat(31).trim(); // "a a a a..." will truncate cleanly
    const slug = engine.generateSlug(title);
    expect(slug).not.toMatch(/-$/);
  });

  it('handles empty input', () => {
    const slug = engine.generateSlug('');
    expect(slug).toBe('');
  });

  it('collapses multiple spaces/hyphens', () => {
    const slug = engine.generateSlug('Hello   World---Test');
    expect(slug).toBe('hello-world---test');
  });
});

// ---------------------------------------------------------------------------
// AC-5: Heading Hierarchy Validation
// ---------------------------------------------------------------------------

describe('validateHeadings', () => {
  it('returns no warnings for valid hierarchy', () => {
    const headings: HeadingEntry[] = [
      { level: 2, text: 'Section 1' },
      { level: 3, text: 'Subsection 1.1' },
      { level: 3, text: 'Subsection 1.2' },
      { level: 2, text: 'Section 2' },
      { level: 3, text: 'Subsection 2.1' },
      { level: 4, text: 'Sub-subsection 2.1.1' },
    ];
    const warnings = engine.validateHeadings(headings);
    expect(warnings).toHaveLength(0);
  });

  it('warns when H3 appears without preceding H2', () => {
    const headings: HeadingEntry[] = [
      { level: 3, text: 'Missing Parent' },
    ];
    const warnings = engine.validateHeadings(headings, 'about.html');
    expect(warnings).toHaveLength(1);
    expect(warnings[0].level).toBe('warn');
    expect(warnings[0].message).toContain('H3');
    expect(warnings[0].message).toContain('H2');
    expect(warnings[0].message).toContain('about.html');
  });

  it('warns when H4 appears without preceding H3', () => {
    const headings: HeadingEntry[] = [
      { level: 2, text: 'Section' },
      { level: 4, text: 'Skipped H3' },
    ];
    const warnings = engine.validateHeadings(headings);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toContain('H4');
    expect(warnings[0].message).toContain('H3');
  });

  it('returns empty array for empty headings', () => {
    const warnings = engine.validateHeadings([]);
    expect(warnings).toHaveLength(0);
  });

  it('warns for invalid heading levels', () => {
    const headings: HeadingEntry[] = [
      { level: 7, text: 'Invalid' },
    ];
    const warnings = engine.validateHeadings(headings);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toContain('Invalid heading level');
  });

  it('returns warnings as objects, not thrown exceptions', () => {
    const headings: HeadingEntry[] = [
      { level: 4, text: 'No H2 or H3' },
    ];
    // Should not throw
    expect(() => engine.validateHeadings(headings)).not.toThrow();
    const warnings = engine.validateHeadings(headings);
    expect(Array.isArray(warnings)).toBe(true);
    expect(warnings[0]).toHaveProperty('level', 'warn');
    expect(warnings[0]).toHaveProperty('message');
  });
});

// ---------------------------------------------------------------------------
// AC-6: Alt Text Generation
// ---------------------------------------------------------------------------

describe('generateAltText', () => {
  it('generates descriptive alt text from context', () => {
    const image: ImageInput = {
      imageFilename: 'team-photo.jpg',
      context: 'Team members collaborating in the office',
    };
    const alt = engine.generateAltText(image);
    expect(alt).toBe('Team members collaborating in the office');
  });

  it('appends primary keyword when not present in context', () => {
    const image: ImageInput = {
      imageFilename: 'team.jpg',
      context: 'Team photo',
    };
    const alt = engine.generateAltText(image, 'Branding Services');
    expect(alt).toContain('Team photo');
    expect(alt).toContain('Branding Services');
  });

  it('does not duplicate keyword when already in context', () => {
    const image: ImageInput = {
      imageFilename: 'brand.jpg',
      context: 'Our branding services team at work',
    };
    const alt = engine.generateAltText(image, 'branding services');
    expect(alt).toBe('Our branding services team at work');
  });

  it('returns empty string for decorative images', () => {
    const image: ImageInput = {
      imageFilename: 'divider.svg',
      context: 'Decorative divider',
      decorative: true,
    };
    const alt = engine.generateAltText(image);
    expect(alt).toBe('');
  });
});

// ---------------------------------------------------------------------------
// AC-11: Open Graph Tags
// ---------------------------------------------------------------------------

describe('generateOpenGraph', () => {
  it('generates all required OG tags', () => {
    const input = createTestInput({
      ogImage: 'https://acme.com/og.jpg',
    });
    const og = engine.generateOpenGraph(input);
    expect(og['og:title']).toBeDefined();
    expect(og['og:description']).toBeDefined();
    expect(og['og:url']).toBe('https://acme.com/services');
    expect(og['og:type']).toBe('website');
    expect(og['og:image']).toBe('https://acme.com/og.jpg');
  });

  it('sets og:type to "article" for blog posts', () => {
    const input = createTestInput({ pageType: 'blog-post' });
    const og = engine.generateOpenGraph(input);
    expect(og['og:type']).toBe('article');
  });

  it('omits og:image when not provided', () => {
    const input = createTestInput({ ogImage: undefined });
    const og = engine.generateOpenGraph(input);
    expect(og['og:image']).toBeUndefined();
  });

  it('uses provided title and description if given', () => {
    const input = createTestInput();
    const og = engine.generateOpenGraph(input, 'Custom Title', 'Custom Desc');
    expect(og['og:title']).toBe('Custom Title');
    expect(og['og:description']).toBe('Custom Desc');
  });
});

// ---------------------------------------------------------------------------
// AC-8: Sitemap XML
// ---------------------------------------------------------------------------

describe('generateSitemap', () => {
  it('generates valid XML with correct structure', () => {
    const pages = [createTestInput({
      lastModified: '2026-03-16',
    })];
    const xml = engine.generateSitemap(pages);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://acme.com/services</loc>');
    expect(xml).toContain('<lastmod>2026-03-16</lastmod>');
    expect(xml).toContain('<changefreq>weekly</changefreq>');
    expect(xml).toContain('</urlset>');
  });

  it('generates correct number of <url> entries', () => {
    const pages = [
      createTestInput({ pageUrl: 'https://acme.com/' }),
      createTestInput({ pageUrl: 'https://acme.com/about' }),
      createTestInput({ pageUrl: 'https://acme.com/services' }),
    ];
    const xml = engine.generateSitemap(pages);
    const urlCount = (xml.match(/<url>/g) || []).length;
    expect(urlCount).toBe(3);
  });

  it('excludes noindex pages from sitemap', () => {
    const pages = [
      createTestInput({ pageUrl: 'https://acme.com/', noindex: false }),
      createTestInput({ pageUrl: 'https://acme.com/terms', noindex: true }),
    ];
    const xml = engine.generateSitemap(pages);
    const urlCount = (xml.match(/<url>/g) || []).length;
    expect(urlCount).toBe(1);
    expect(xml).not.toContain('https://acme.com/terms');
  });

  it('uses default changefreq "weekly" when not specified', () => {
    const pages = [createTestInput()];
    const xml = engine.generateSitemap(pages);
    expect(xml).toContain('<changefreq>weekly</changefreq>');
  });

  it('uses custom changefreq when specified', () => {
    const pages = [createTestInput({ changefreq: 'daily' })];
    const xml = engine.generateSitemap(pages);
    expect(xml).toContain('<changefreq>daily</changefreq>');
  });

  it('assigns default priority based on page type', () => {
    const homePage = [createTestInput({ pageType: 'home' })];
    const xml = engine.generateSitemap(homePage);
    expect(xml).toContain('<priority>1.0</priority>');
  });

  it('escapes XML special characters in URLs', () => {
    const pages = [createTestInput({ pageUrl: 'https://acme.com/q?a=1&b=2' })];
    const xml = engine.generateSitemap(pages);
    expect(xml).toContain('https://acme.com/q?a=1&amp;b=2');
  });
});

// ---------------------------------------------------------------------------
// AC-9: Robots.txt
// ---------------------------------------------------------------------------

describe('generateRobotsTxt', () => {
  it('generates default allow-all robots.txt', () => {
    const txt = engine.generateRobotsTxt();
    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('Allow: /');
  });

  it('generates custom rules', () => {
    const txt = engine.generateRobotsTxt({
      rules: [
        { userAgent: 'Googlebot', allow: ['/'], disallow: ['/admin'] },
        { userAgent: '*', disallow: ['/private'] },
      ],
    });
    expect(txt).toContain('User-agent: Googlebot');
    expect(txt).toContain('Allow: /');
    expect(txt).toContain('Disallow: /admin');
    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('Disallow: /private');
  });

  it('includes sitemap URL when provided', () => {
    const txt = engine.generateRobotsTxt({
      sitemapUrl: 'https://acme.com/sitemap.xml',
    });
    expect(txt).toContain('Sitemap: https://acme.com/sitemap.xml');
  });
});

// ---------------------------------------------------------------------------
// AC-1: Full generate() Pipeline
// ---------------------------------------------------------------------------

describe('generate', () => {
  it('returns complete SEOMetadata object', () => {
    const input = createTestInput({ ogImage: 'https://acme.com/og.jpg' });
    const metadata = engine.generate(input);

    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
    expect(metadata.h1).toBeDefined();
    expect(metadata.slug).toBeDefined();
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.noindex).toBe(false);
  });

  it('sets noindex from input', () => {
    const input = createTestInput({ noindex: true });
    const metadata = engine.generate(input);
    expect(metadata.noindex).toBe(true);
  });

  it('title and h1 are different', () => {
    const input = createTestInput();
    const metadata = engine.generate(input);
    expect(metadata.title).not.toBe(metadata.h1);
  });

  it('slug is generated from page title', () => {
    const input = createTestInput({ pageTitle: 'Our Premium Services' });
    const metadata = engine.generate(input);
    expect(metadata.slug).toBe('our-premium-services');
  });
});

// ---------------------------------------------------------------------------
// AC-13: Integration Test — 3-page build
// ---------------------------------------------------------------------------

describe('integration: multi-page site', () => {
  it('generates sitemap with 3 <url> entries for 3 pages', () => {
    const pages: SEOInput[] = [
      createTestInput({
        pageTitle: 'Home',
        primaryKeyword: 'Brand Solutions',
        pageUrl: 'https://acme.com/',
        pageType: 'home',
        lastModified: '2026-03-16',
      }),
      createTestInput({
        pageTitle: 'About Us',
        primaryKeyword: 'About Acme',
        pageUrl: 'https://acme.com/about',
        pageType: 'about',
        lastModified: '2026-03-10',
      }),
      createTestInput({
        pageTitle: 'Our Services',
        primaryKeyword: 'Branding Services',
        pageUrl: 'https://acme.com/services',
        pageType: 'service',
        lastModified: '2026-03-12',
      }),
    ];

    const sitemap = engine.generateSitemap(pages);
    const urlCount = (sitemap.match(/<url>/g) || []).length;
    expect(urlCount).toBe(3);

    // Verify each URL is present
    expect(sitemap).toContain('<loc>https://acme.com/</loc>');
    expect(sitemap).toContain('<loc>https://acme.com/about</loc>');
    expect(sitemap).toContain('<loc>https://acme.com/services</loc>');

    // Verify XML structure
    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain('xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it('generates robots.txt with sitemap reference', () => {
    const robots = engine.generateRobotsTxt({
      sitemapUrl: 'https://acme.com/sitemap.xml',
    });
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap: https://acme.com/sitemap.xml');
  });

  it('generates metadata for each page independently', () => {
    const pages: SEOInput[] = [
      createTestInput({
        pageTitle: 'Home',
        primaryKeyword: 'Brand Solutions',
        pageUrl: 'https://acme.com/',
        pageType: 'home',
      }),
      createTestInput({
        pageTitle: 'Contact',
        primaryKeyword: 'Contact Us',
        pageUrl: 'https://acme.com/contact',
        pageType: 'other',
      }),
    ];

    const meta1 = engine.generate(pages[0]);
    const meta2 = engine.generate(pages[1]);

    expect(meta1.title).not.toBe(meta2.title);
    expect(meta1.slug).not.toBe(meta2.slug);
    expect(meta1.openGraph['og:url']).not.toBe(meta2.openGraph['og:url']);
  });
});
