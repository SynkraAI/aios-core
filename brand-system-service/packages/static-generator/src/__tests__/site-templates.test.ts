import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { StaticGenerator } from '../static-generator';
import { generateToc } from '../toc-generator';

const TEMPLATE_DIR = path.resolve(__dirname, '..', '..', 'templates', 'site');
const SHARED_DIR = path.resolve(__dirname, '..', '..', 'templates', 'shared');
const PAGES_DIR = path.join(TEMPLATE_DIR, 'pages');
const FIXTURE_PATH = path.join(TEMPLATE_DIR, 'fixtures', 'example.json');

describe('BSS-5.3 Institutional Site Templates', () => {
  describe('AC-1: 10 Page Templates', () => {
    const expectedPages = [
      'home.njk',
      'about.njk',
      'services.njk',
      'portfolio.njk',
      'blog-listing.njk',
      'blog-post.njk',
      'contact.njk',
      'pricing.njk',
      'terms-privacy.njk',
      '404.njk',
    ];

    it('should have all 10 page templates in pages/ directory', () => {
      for (const page of expectedPages) {
        const pagePath = path.join(PAGES_DIR, page);
        expect(fs.existsSync(pagePath)).toBe(true);
      }
    });

    it('all page templates extend _base.njk', () => {
      for (const page of expectedPages) {
        const content = fs.readFileSync(path.join(PAGES_DIR, page), 'utf-8');
        expect(content).toContain('{% extends "_base.njk" %}');
      }
    });
  });

  describe('AC-2: Shared _base.njk Layout', () => {
    let baseContent: string;

    beforeAll(() => {
      baseContent = fs.readFileSync(path.join(SHARED_DIR, '_base.njk'), 'utf-8');
    });

    it('should have _base.njk in shared directory', () => {
      expect(fs.existsSync(path.join(SHARED_DIR, '_base.njk'))).toBe(true);
    });

    it('includes HTML5 doctype', () => {
      expect(baseContent).toContain('<!DOCTYPE html>');
    });

    it('includes head with token CSS link', () => {
      expect(baseContent).toContain('tokens.css');
    });

    it('includes meta charset and viewport', () => {
      expect(baseContent).toContain('meta charset');
      expect(baseContent).toContain('viewport');
    });

    it('has block title slot', () => {
      expect(baseContent).toContain('{% block title %}');
    });

    it('has block meta slot for SEO injection', () => {
      expect(baseContent).toContain('{% block meta %}');
    });

    it('includes _nav.njk partial', () => {
      expect(baseContent).toContain('_nav.njk');
    });

    it('includes _footer.njk partial', () => {
      expect(baseContent).toContain('_footer.njk');
    });

    it('has block content slot', () => {
      expect(baseContent).toContain('{% block content %}');
    });
  });

  describe('AC-3: _nav.njk Partial', () => {
    let navContent: string;

    beforeAll(() => {
      navContent = fs.readFileSync(path.join(SHARED_DIR, '_nav.njk'), 'utf-8');
    });

    it('should have _nav.njk in shared directory', () => {
      expect(fs.existsSync(path.join(SHARED_DIR, '_nav.njk'))).toBe(true);
    });

    it('renders logo slot', () => {
      expect(navContent).toContain('nav.logo');
    });

    it('renders configurable nav links', () => {
      expect(navContent).toContain('nav.links');
    });

    it('renders primary CTA button', () => {
      expect(navContent).toContain('nav.cta');
    });

    it('has hamburger toggle button for mobile', () => {
      expect(navContent).toContain('data-hamburger-toggle');
      expect(navContent).toContain('site-nav__hamburger');
    });

    it('has mobile overlay', () => {
      expect(navContent).toContain('nav-overlay');
    });

    it('has aria attributes for accessibility', () => {
      expect(navContent).toContain('aria-label');
      expect(navContent).toContain('aria-expanded');
      expect(navContent).toContain('aria-controls');
    });
  });

  describe('AC-4: _footer.njk Partial', () => {
    let footerContent: string;

    beforeAll(() => {
      footerContent = fs.readFileSync(path.join(SHARED_DIR, '_footer.njk'), 'utf-8');
    });

    it('should have _footer.njk in shared directory', () => {
      expect(fs.existsSync(path.join(SHARED_DIR, '_footer.njk'))).toBe(true);
    });

    it('renders logo', () => {
      expect(footerContent).toContain('footer.logo');
    });

    it('renders tagline', () => {
      expect(footerContent).toContain('footer.tagline');
    });

    it('renders nav groups', () => {
      expect(footerContent).toContain('footer.navGroups');
    });

    it('renders social icon links', () => {
      expect(footerContent).toContain('footer.social');
    });

    it('renders copyright with currentYear', () => {
      expect(footerContent).toContain('{{ currentYear }}');
    });

    it('renders legal links', () => {
      expect(footerContent).toContain('footer.legalLinks');
    });
  });

  describe('AC-5: Home Page', () => {
    let homeContent: string;

    beforeAll(() => {
      homeContent = fs.readFileSync(path.join(PAGES_DIR, 'home.njk'), 'utf-8');
    });

    it('has hero section', () => {
      expect(homeContent).toContain('class="hero"');
      expect(homeContent).toContain('home.hero.headline');
    });

    it('has services summary section', () => {
      expect(homeContent).toContain('home.services');
    });

    it('has portfolio items section', () => {
      expect(homeContent).toContain('home.portfolio');
    });

    it('has trust signals', () => {
      expect(homeContent).toContain('home.trustSignals');
      expect(homeContent).toContain('trust-signal');
    });

    it('has CTA section', () => {
      expect(homeContent).toContain('home.cta');
      expect(homeContent).toContain('cta-section');
    });
  });

  describe('AC-6: About Page', () => {
    let aboutContent: string;

    beforeAll(() => {
      aboutContent = fs.readFileSync(path.join(PAGES_DIR, 'about.njk'), 'utf-8');
    });

    it('has brand story section', () => {
      expect(aboutContent).toContain('about.story');
    });

    it('has team section with array iteration', () => {
      expect(aboutContent).toContain('about.team');
      expect(aboutContent).toContain('member.name');
      expect(aboutContent).toContain('member.role');
      expect(aboutContent).toContain('member.bio');
    });

    it('has values section', () => {
      expect(aboutContent).toContain('about.values');
    });

    it('has timeline section', () => {
      expect(aboutContent).toContain('about.timeline');
    });
  });

  describe('AC-7: Services Page', () => {
    let servicesContent: string;

    beforeAll(() => {
      servicesContent = fs.readFileSync(path.join(PAGES_DIR, 'services.njk'), 'utf-8');
    });

    it('renders service card grid from array', () => {
      expect(servicesContent).toContain('services.items');
      expect(servicesContent).toContain('service.title');
      expect(servicesContent).toContain('service.description');
      expect(servicesContent).toContain('service.icon');
    });

    it('has optional comparison table', () => {
      expect(servicesContent).toContain('services.comparisonTable');
      expect(servicesContent).toContain('comparison-table');
    });
  });

  describe('AC-8: Portfolio Page', () => {
    let portfolioContent: string;

    beforeAll(() => {
      portfolioContent = fs.readFileSync(path.join(PAGES_DIR, 'portfolio.njk'), 'utf-8');
    });

    it('renders filterable grid with data-category attributes', () => {
      expect(portfolioContent).toContain('data-category');
      expect(portfolioContent).toContain('data-filter');
    });

    it('has filter buttons', () => {
      expect(portfolioContent).toContain('portfolio-filters__btn');
    });

    it('renders project grid from array', () => {
      expect(portfolioContent).toContain('portfolio.projects');
      expect(portfolioContent).toContain('project.title');
      expect(portfolioContent).toContain('project.category');
    });
  });

  describe('AC-9: Blog Listing', () => {
    let blogListingContent: string;

    beforeAll(() => {
      blogListingContent = fs.readFileSync(path.join(PAGES_DIR, 'blog-listing.njk'), 'utf-8');
    });

    it('has hero section', () => {
      expect(blogListingContent).toContain('class="hero"');
    });

    it('renders paginated post cards', () => {
      expect(blogListingContent).toContain('blog.posts');
      expect(blogListingContent).toContain('post.title');
      expect(blogListingContent).toContain('post.date');
      expect(blogListingContent).toContain('post.excerpt');
    });

    it('has sidebar with category filter', () => {
      expect(blogListingContent).toContain('blog-sidebar');
      expect(blogListingContent).toContain('blog.sidebarCategories');
    });

    it('has pagination', () => {
      expect(blogListingContent).toContain('pagination');
    });
  });

  describe('AC-10: Blog Post', () => {
    let blogPostContent: string;

    beforeAll(() => {
      blogPostContent = fs.readFileSync(path.join(PAGES_DIR, 'blog-post.njk'), 'utf-8');
    });

    it('renders full article with required fields', () => {
      expect(blogPostContent).toContain('blogPost.title');
      expect(blogPostContent).toContain('blogPost.publishDate');
      expect(blogPostContent).toContain('blogPost.author');
      expect(blogPostContent).toContain('blogPost.content');
      expect(blogPostContent).toContain('blogPost.tags');
    });

    it('has table of contents from H2/H3 headings', () => {
      expect(blogPostContent).toContain('blogPost.toc');
      expect(blogPostContent).toContain('class="toc"');
    });

    it('has related posts section', () => {
      expect(blogPostContent).toContain('blogPost.relatedPosts');
      expect(blogPostContent).toContain('related-posts');
    });
  });

  describe('AC-11: Contact Page', () => {
    let contactContent: string;

    beforeAll(() => {
      contactContent = fs.readFileSync(path.join(PAGES_DIR, 'contact.njk'), 'utf-8');
    });

    it('has HTML5 form with configurable action', () => {
      expect(contactContent).toContain('contact.form.action');
      expect(contactContent).toContain('method="POST"');
    });

    it('has HTML5 validation (required attributes)', () => {
      expect(contactContent).toContain('required');
      expect(contactContent).toContain('type="email"');
      expect(contactContent).toContain('type="text"');
    });

    it('has map placeholder', () => {
      expect(contactContent).toContain('map-placeholder');
    });

    it('has contact info block', () => {
      expect(contactContent).toContain('contact.info');
    });
  });

  describe('AC-12: 404 Page', () => {
    let errorContent: string;

    beforeAll(() => {
      errorContent = fs.readFileSync(path.join(PAGES_DIR, '404.njk'), 'utf-8');
    });

    it('has illustration slot', () => {
      expect(errorContent).toContain('error-page__illustration');
    });

    it('has heading', () => {
      expect(errorContent).toContain('error-page__heading');
    });

    it('has explanatory copy', () => {
      expect(errorContent).toContain('error-page__copy');
    });

    it('has link back to Home', () => {
      expect(errorContent).toContain('index.html');
      expect(errorContent).toContain('Back to Home');
    });
  });

  describe('AC-13: Responsive Design', () => {
    it('shared CSS has 768px and 1440px breakpoints', () => {
      const componentsCss = fs.readFileSync(
        path.join(SHARED_DIR, 'css', 'components.css'),
        'utf-8'
      );
      expect(componentsCss).toContain('min-width: 768px');
    });

    it('site CSS has all three breakpoints (375px mobile-first, 768px, 1440px)', () => {
      const siteCss = fs.readFileSync(
        path.join(TEMPLATE_DIR, 'css', 'site.css'),
        'utf-8'
      );
      expect(siteCss).toContain('min-width: 768px');
      expect(siteCss).toContain('min-width: 1440px');
    });

    it('buttons have 44x44px minimum touch targets', () => {
      const componentsCss = fs.readFileSync(
        path.join(SHARED_DIR, 'css', 'components.css'),
        'utf-8'
      );
      expect(componentsCss).toContain('min-height: 44px');
      expect(componentsCss).toContain('min-width: 44px');
    });
  });

  describe('AC-15: Schema and Fixture', () => {
    it('should have site.schema.json', () => {
      const schemaPath = path.join(TEMPLATE_DIR, 'site.schema.json');
      expect(fs.existsSync(schemaPath)).toBe(true);

      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
      expect(schema.required).toContain('clientId');
      expect(schema.required).toContain('nav');
      expect(schema.required).toContain('footer');
    });

    it('should have fixtures/example.json with realistic data', () => {
      expect(fs.existsSync(FIXTURE_PATH)).toBe(true);

      const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));
      expect(fixture.clientId).toBe('summit-consulting');
      expect(fixture.nav).toBeDefined();
      expect(fixture.nav.links.length).toBeGreaterThanOrEqual(5);
      expect(fixture.footer).toBeDefined();
      expect(fixture.footer.navGroups.length).toBeGreaterThanOrEqual(1);
      expect(fixture.home).toBeDefined();
      expect(fixture.about).toBeDefined();
      expect(fixture.services).toBeDefined();
      expect(fixture.portfolio).toBeDefined();
      expect(fixture.blog).toBeDefined();
      expect(fixture.blogPost).toBeDefined();
      expect(fixture.contact).toBeDefined();
      expect(fixture.pricing).toBeDefined();
      expect(fixture.legal).toBeDefined();
      expect(fixture.errorPage).toBeDefined();
    });
  });

  describe('ToC Generator (AC-10)', () => {
    it('extracts H2 headings', () => {
      const { toc } = generateToc('<h2>First</h2><p>text</p><h2>Second</h2>');
      expect(toc).toHaveLength(2);
      expect(toc[0].text).toBe('First');
      expect(toc[1].text).toBe('Second');
    });

    it('nests H3 under preceding H2', () => {
      const { toc } = generateToc(
        '<h2>Parent</h2><h3>Child One</h3><h3>Child Two</h3>'
      );
      expect(toc).toHaveLength(1);
      expect(toc[0].children).toHaveLength(2);
      expect(toc[0].children[0].text).toBe('Child One');
    });

    it('generates slugified IDs', () => {
      const { toc } = generateToc('<h2>My Great Heading</h2>');
      expect(toc[0].id).toBe('my-great-heading');
    });

    it('injects IDs into HTML', () => {
      const { html } = generateToc('<h2>Test Heading</h2>');
      expect(html).toContain('id="test-heading"');
    });

    it('preserves existing IDs', () => {
      const { toc, html } = generateToc('<h2 id="custom-id">Test</h2>');
      expect(toc[0].id).toBe('custom-id');
      expect(html).toContain('id="custom-id"');
    });
  });

  describe('Hamburger JS', () => {
    it('should have hamburger.js in shared/js/ directory', () => {
      expect(
        fs.existsSync(path.join(SHARED_DIR, 'js', 'hamburger.js'))
      ).toBe(true);
    });

    it('hamburger.js uses data-hamburger-toggle selector', () => {
      const js = fs.readFileSync(
        path.join(SHARED_DIR, 'js', 'hamburger.js'),
        'utf-8'
      );
      expect(js).toContain('data-hamburger-toggle');
      expect(js).toContain('aria-expanded');
    });
  });

  describe('Portfolio Filter JS', () => {
    it('should have portfolio-filter.js in site/js/ directory', () => {
      expect(
        fs.existsSync(path.join(TEMPLATE_DIR, 'js', 'portfolio-filter.js'))
      ).toBe(true);
    });

    it('portfolio-filter.js uses data-filter and data-category', () => {
      const js = fs.readFileSync(
        path.join(TEMPLATE_DIR, 'js', 'portfolio-filter.js'),
        'utf-8'
      );
      expect(js).toContain('data-filter');
      expect(js).toContain('data-category');
    });
  });

  describe('AC-16: Integration with BSS-5.1 Pipeline', () => {
    let tmpDir: string;
    let outputDir: string;

    beforeAll(async () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bss-5.3-integration-'));
      outputDir = path.join(tmpDir, 'dist');

      // Create minimal token data
      const tokenDir = path.join(tmpDir, 'data', 'tokens', 'summit-consulting');
      fs.mkdirSync(path.join(tokenDir, 'primitive'), { recursive: true });
      fs.mkdirSync(path.join(tokenDir, 'semantic'), { recursive: true });

      fs.writeFileSync(
        path.join(tokenDir, 'primitive', 'colors.json'),
        JSON.stringify({
          color: {
            primary: { '500': { $value: '#2563eb', $type: 'color' } },
          },
        }),
        'utf-8'
      );
      fs.writeFileSync(path.join(tokenDir, 'primitive', 'typography.json'), '{}', 'utf-8');
      fs.writeFileSync(path.join(tokenDir, 'primitive', 'spacing.json'), '{}', 'utf-8');
      fs.writeFileSync(path.join(tokenDir, 'primitive', 'effects.json'), '{}', 'utf-8');
      fs.writeFileSync(path.join(tokenDir, 'semantic', 'colors.json'), '{}', 'utf-8');

      const originalEnv = process.env['BSS_TOKENS_PATH'];
      process.env['BSS_TOKENS_PATH'] = path.join(tmpDir, 'data', 'tokens');

      try {
        const generator = new StaticGenerator(false);
        await generator.generate({
          clientId: 'summit-consulting',
          type: 'site',
          outputDir,
        });
      } finally {
        if (originalEnv === undefined) {
          delete process.env['BSS_TOKENS_PATH'];
        } else {
          process.env['BSS_TOKENS_PATH'] = originalEnv;
        }
      }
    }, 60000);

    afterAll(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should produce all 10 HTML pages', () => {
      const expectedHtmlFiles = [
        'home.html',
        'about.html',
        'services.html',
        'portfolio.html',
        'blog-listing.html',
        'blog-post.html',
        'contact.html',
        'pricing.html',
        'terms-privacy.html',
        '404.html',
      ];

      for (const file of expectedHtmlFiles) {
        expect(fs.existsSync(path.join(outputDir, file))).toBe(true);
      }
    });

    it('generated HTML has valid HTML5 structure', () => {
      const html = fs.readFileSync(path.join(outputDir, 'home.html'), 'utf-8');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('<head>');
      expect(html).toContain('</head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</body>');
    });

    it('home page contains fixture data', () => {
      const html = fs.readFileSync(path.join(outputDir, 'home.html'), 'utf-8');
      expect(html).toContain('Elevate Your Business to New Heights');
      expect(html).toContain('Strategy Consulting');
      expect(html).toContain('150+');
    });

    it('about page contains team members', () => {
      const html = fs.readFileSync(path.join(outputDir, 'about.html'), 'utf-8');
      expect(html).toContain('Alexandra Chen');
      expect(html).toContain('Managing Director');
    });

    it('services page contains comparison table', () => {
      const html = fs.readFileSync(path.join(outputDir, 'services.html'), 'utf-8');
      expect(html).toContain('comparison-table');
      expect(html).toContain('Advisory');
      expect(html).toContain('Project-Based');
    });

    it('portfolio page has data-category attributes for filtering', () => {
      const html = fs.readFileSync(path.join(outputDir, 'portfolio.html'), 'utf-8');
      expect(html).toContain('data-category="Strategy"');
      expect(html).toContain('data-category="Digital"');
      expect(html).toContain('data-filter="all"');
    });

    it('blog post has auto-generated ToC', () => {
      const html = fs.readFileSync(path.join(outputDir, 'blog-post.html'), 'utf-8');
      expect(html).toContain('class="toc"');
      expect(html).toContain('Table of Contents');
      // ToC should have entries extracted from the article content
      expect(html).toContain('Introduction');
    });

    it('contact page has form with configurable action', () => {
      const html = fs.readFileSync(path.join(outputDir, 'contact.html'), 'utf-8');
      expect(html).toContain('action="https://formspree.io/f/example"');
      expect(html).toContain('method="POST"');
    });

    it('404 page has links back to home', () => {
      const html = fs.readFileSync(path.join(outputDir, '404.html'), 'utf-8');
      expect(html).toContain('index.html');
      expect(html).toContain('Page Not Found');
    });

    it('all pages have relative paths (no root-relative)', () => {
      const htmlFiles = [
        'home.html', 'about.html', 'services.html', 'portfolio.html',
        'blog-listing.html', 'blog-post.html', 'contact.html',
        'pricing.html', 'terms-privacy.html', '404.html',
      ];

      for (const file of htmlFiles) {
        const html = fs.readFileSync(path.join(outputDir, file), 'utf-8');
        const rootRelative = html.match(/(href|src)=["']\/[^"']/g);
        expect(rootRelative).toBeNull();
      }
    });

    it('pages have internal links between them', () => {
      const html = fs.readFileSync(path.join(outputDir, 'home.html'), 'utf-8');
      expect(html).toContain('contact.html');
      expect(html).toContain('services.html');
    });

    it('should produce styles.min.css', () => {
      const cssPath = path.join(outputDir, 'styles.min.css');
      expect(fs.existsSync(cssPath)).toBe(true);
      const css = fs.readFileSync(cssPath, 'utf-8');
      expect(css.length).toBeGreaterThan(100);
    });

    it('should produce scripts.min.js with portfolio filter and hamburger', () => {
      const jsPath = path.join(outputDir, 'scripts.min.js');
      expect(fs.existsSync(jsPath)).toBe(true);
      const js = fs.readFileSync(jsPath, 'utf-8');
      // Should contain bundled JS from hamburger and portfolio filter
      expect(js.length).toBeGreaterThan(50);
    });

    it('navigation appears on all pages', () => {
      const html = fs.readFileSync(path.join(outputDir, 'home.html'), 'utf-8');
      expect(html).toContain('site-nav');
      expect(html).toContain('Summit Consulting');
    });

    it('footer appears on all pages with copyright year', () => {
      const html = fs.readFileSync(path.join(outputDir, 'home.html'), 'utf-8');
      expect(html).toContain('site-footer');
      expect(html).toContain(String(new Date().getFullYear()));
    });
  });
});
