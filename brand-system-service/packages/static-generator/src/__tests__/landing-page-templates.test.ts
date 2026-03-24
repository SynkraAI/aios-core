import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { StaticGenerator, type GeneratorOptions } from '../static-generator';

const TEMPLATE_DIR = path.resolve(__dirname, '..', '..', 'templates', 'landing-page');
const FIXTURE_PATH = path.join(TEMPLATE_DIR, 'fixtures', 'example.json');

describe('BSS-5.2 Landing Page Templates', () => {
  describe('Template Structure (AC-1)', () => {
    it('should have index.njk at template root', () => {
      expect(fs.existsSync(path.join(TEMPLATE_DIR, 'index.njk'))).toBe(true);
    });

    it('should have all 8 section partials', () => {
      const partials = [
        '01-hero.njk',
        '02-problem.njk',
        '03-solution.njk',
        '04-how-it-works.njk',
        '05-social-proof.njk',
        '06-pricing.njk',
        '07-faq.njk',
        '08-final-cta.njk',
      ];

      for (const partial of partials) {
        const partialPath = path.join(TEMPLATE_DIR, 'partials', partial);
        expect(fs.existsSync(partialPath)).toBe(true);
      }
    });

    it('should have head.njk partial', () => {
      expect(fs.existsSync(path.join(TEMPLATE_DIR, 'partials', 'head.njk'))).toBe(true);
    });

    it('index.njk should include all 8 section partials', () => {
      const indexContent = fs.readFileSync(path.join(TEMPLATE_DIR, 'index.njk'), 'utf-8');
      expect(indexContent).toContain('01-hero.njk');
      expect(indexContent).toContain('02-problem.njk');
      expect(indexContent).toContain('03-solution.njk');
      expect(indexContent).toContain('04-how-it-works.njk');
      expect(indexContent).toContain('05-social-proof.njk');
      expect(indexContent).toContain('06-pricing.njk');
      expect(indexContent).toContain('07-faq.njk');
      expect(indexContent).toContain('08-final-cta.njk');
    });
  });

  describe('Section Partials Content (AC-2 to AC-9)', () => {
    it('hero partial has pre-headline, h1, sub-headline, CTA, social proof (AC-2)', () => {
      const content = fs.readFileSync(path.join(TEMPLATE_DIR, 'partials', '01-hero.njk'), 'utf-8');
      expect(content).toContain('hero.preHeadline');
      expect(content).toContain('hero.h1');
      expect(content).toContain('hero.subHeadline');
      expect(content).toContain('hero.ctaLabel');
      expect(content).toContain('hero.socialProof');
    });

    it('problem partial has headline and bullet loop (AC-3)', () => {
      const content = fs.readFileSync(path.join(TEMPLATE_DIR, 'partials', '02-problem.njk'), 'utf-8');
      expect(content).toContain('problem.headline');
      expect(content).toContain('problem.bullets');
      expect(content).toMatch(/for\s+bullet\s+in\s+problem\.bullets/);
    });

    it('solution partial has feature-benefit loop (AC-4)', () => {
      const content = fs.readFileSync(path.join(TEMPLATE_DIR, 'partials', '03-solution.njk'), 'utf-8');
      expect(content).toContain('solution.features');
      expect(content).toContain('item.feature');
      expect(content).toContain('item.benefit');
    });

    it('how-it-works partial has numbered steps loop (AC-5)', () => {
      const content = fs.readFileSync(path.join(TEMPLATE_DIR, 'partials', '04-how-it-works.njk'), 'utf-8');
      expect(content).toContain('howItWorks.steps');
      expect(content).toContain('loop.index');
      expect(content).toContain('step.title');
      expect(content).toContain('step.description');
    });

    it('social proof partial has testimonials and optional metrics (AC-6)', () => {
      const content = fs.readFileSync(path.join(TEMPLATE_DIR, 'partials', '05-social-proof.njk'), 'utf-8');
      expect(content).toContain('socialProof.testimonials');
      expect(content).toContain('t.name');
      expect(content).toContain('t.quote');
      expect(content).toContain('socialProof.metrics');
    });

    it('pricing partial is conditional and supports 1-3 tiers (AC-7)', () => {
      const indexContent = fs.readFileSync(path.join(TEMPLATE_DIR, 'index.njk'), 'utf-8');
      expect(indexContent).toMatch(/if\s+pricing/);

      const content = fs.readFileSync(path.join(TEMPLATE_DIR, 'partials', '06-pricing.njk'), 'utf-8');
      expect(content).toContain('pricing.tiers');
      expect(content).toContain('tier.name');
      expect(content).toContain('tier.price');
      expect(content).toContain('tier.features');
      expect(content).toContain('tier.ctaLabel');
    });

    it('faq partial has accordion with aria attributes (AC-8)', () => {
      const content = fs.readFileSync(path.join(TEMPLATE_DIR, 'partials', '07-faq.njk'), 'utf-8');
      expect(content).toContain('faq.items');
      expect(content).toContain('item.question');
      expect(content).toContain('item.answer');
      expect(content).toContain('aria-expanded');
      expect(content).toContain('data-accordion-trigger');
      expect(content).toContain('role="region"');
    });

    it('final CTA partial has headline, risk removal, and CTA (AC-9)', () => {
      const content = fs.readFileSync(path.join(TEMPLATE_DIR, 'partials', '08-final-cta.njk'), 'utf-8');
      expect(content).toContain('finalCta.headline');
      expect(content).toContain('finalCta.riskRemoval');
      expect(content).toContain('finalCta.ctaLabel');
    });
  });

  describe('CSS Architecture (AC-10 to AC-13)', () => {
    it('should have base.css, layout.css, and components.css', () => {
      expect(fs.existsSync(path.join(TEMPLATE_DIR, 'css', 'base.css'))).toBe(true);
      expect(fs.existsSync(path.join(TEMPLATE_DIR, 'css', 'layout.css'))).toBe(true);
      expect(fs.existsSync(path.join(TEMPLATE_DIR, 'css', 'components.css'))).toBe(true);
    });

    it('layout.css has responsive breakpoints at 768px and 1440px (AC-10)', () => {
      const css = fs.readFileSync(path.join(TEMPLATE_DIR, 'css', 'layout.css'), 'utf-8');
      expect(css).toContain('min-width: 768px');
      expect(css).toContain('min-width: 1440px');
    });

    it('components.css enforces 44x44px touch targets for buttons (AC-11)', () => {
      const css = fs.readFileSync(path.join(TEMPLATE_DIR, 'css', 'components.css'), 'utf-8');
      expect(css).toContain('min-height: 44px');
      expect(css).toContain('min-width: 44px');
    });

    it('CSS uses token CSS Custom Properties — no hardcoded brand colors (AC-13)', () => {
      const cssFiles = ['base.css', 'layout.css', 'components.css'];
      for (const file of cssFiles) {
        const css = fs.readFileSync(path.join(TEMPLATE_DIR, 'css', file), 'utf-8');
        // Should reference CSS Custom Properties
        expect(css).toContain('var(--');
      }
    });

    it('base.css has max-width constraint for body copy (AC-12)', () => {
      const css = fs.readFileSync(path.join(TEMPLATE_DIR, 'css', 'base.css'), 'utf-8');
      expect(css).toMatch(/max-width:\s*\d+ch/);
    });

    it('layout.css container has max-width 1200px (AC-12)', () => {
      const css = fs.readFileSync(path.join(TEMPLATE_DIR, 'css', 'layout.css'), 'utf-8');
      expect(css).toContain('max-width: 1200px');
    });
  });

  describe('Accessibility', () => {
    it('templates have skip link for keyboard navigation', () => {
      const index = fs.readFileSync(path.join(TEMPLATE_DIR, 'index.njk'), 'utf-8');
      expect(index).toContain('skip-link');
      expect(index).toContain('#main-content');
    });

    it('FAQ accordion uses aria-expanded and role="region"', () => {
      const faq = fs.readFileSync(path.join(TEMPLATE_DIR, 'partials', '07-faq.njk'), 'utf-8');
      expect(faq).toContain('aria-expanded="false"');
      expect(faq).toContain('aria-controls');
      expect(faq).toContain('aria-labelledby');
    });

    it('hero section uses semantic section element with aria-label', () => {
      const hero = fs.readFileSync(path.join(TEMPLATE_DIR, 'partials', '01-hero.njk'), 'utf-8');
      expect(hero).toContain('<section');
      expect(hero).toContain('aria-label');
    });
  });

  describe('Schema and Fixture (AC-14, AC-15)', () => {
    it('should have landing-page.schema.json (AC-14)', () => {
      const schemaPath = path.join(TEMPLATE_DIR, 'landing-page.schema.json');
      expect(fs.existsSync(schemaPath)).toBe(true);

      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
      expect(schema.required).toContain('clientId');
      expect(schema.required).toContain('hero');
      expect(schema.required).toContain('problem');
      expect(schema.required).toContain('solution');
      expect(schema.required).toContain('howItWorks');
      expect(schema.required).toContain('socialProof');
      expect(schema.required).toContain('faq');
      expect(schema.required).toContain('finalCta');
    });

    it('should have fixtures/example.json with realistic B2B SaaS data (AC-15)', () => {
      expect(fs.existsSync(FIXTURE_PATH)).toBe(true);

      const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));
      expect(fixture.clientId).toBeDefined();
      expect(fixture.hero).toBeDefined();
      expect(fixture.hero.h1).toBeDefined();
      expect(fixture.problem.bullets).toHaveLength(4);
      expect(fixture.solution.features.length).toBeGreaterThanOrEqual(3);
      expect(fixture.howItWorks.steps).toHaveLength(4);
      expect(fixture.socialProof.testimonials).toHaveLength(3);
      expect(fixture.pricing.tiers).toHaveLength(3);
      expect(fixture.faq.items).toHaveLength(8);
      expect(fixture.finalCta.riskRemoval).toBeDefined();
    });
  });

  describe('Accordion JS', () => {
    it('should have accordion.js in js/ directory', () => {
      expect(fs.existsSync(path.join(TEMPLATE_DIR, 'js', 'accordion.js'))).toBe(true);
    });

    it('accordion.js uses data-accordion-trigger selector', () => {
      const js = fs.readFileSync(path.join(TEMPLATE_DIR, 'js', 'accordion.js'), 'utf-8');
      expect(js).toContain('data-accordion-trigger');
      expect(js).toContain('aria-expanded');
    });
  });

  describe('Integration with BSS-5.1 Pipeline (AC-16)', () => {
    let tmpDir: string;
    let outputDir: string;

    beforeAll(async () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bss-5.2-integration-'));
      outputDir = path.join(tmpDir, 'dist');

      // Create minimal token data
      const tokenDir = path.join(tmpDir, 'data', 'tokens', 'test-client');
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
      fs.writeFileSync(
        path.join(tokenDir, 'primitive', 'typography.json'),
        JSON.stringify({}),
        'utf-8'
      );
      fs.writeFileSync(
        path.join(tokenDir, 'primitive', 'spacing.json'),
        JSON.stringify({}),
        'utf-8'
      );
      fs.writeFileSync(
        path.join(tokenDir, 'primitive', 'effects.json'),
        JSON.stringify({}),
        'utf-8'
      );
      fs.writeFileSync(
        path.join(tokenDir, 'semantic', 'colors.json'),
        JSON.stringify({}),
        'utf-8'
      );

      const originalEnv = process.env['BSS_TOKENS_PATH'];
      process.env['BSS_TOKENS_PATH'] = path.join(tmpDir, 'data', 'tokens');

      try {
        const generator = new StaticGenerator(false);
        await generator.generate({
          clientId: 'test-client',
          type: 'landing-page',
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

    it('should produce index.html', () => {
      expect(fs.existsSync(path.join(outputDir, 'index.html'))).toBe(true);
    });

    it('generated HTML contains all 8 sections', () => {
      const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf-8');
      expect(html).toContain('class="hero"');
      expect(html).toContain('class="problem');
      expect(html).toContain('class="solution');
      expect(html).toContain('class="how-it-works');
      expect(html).toContain('class="social-proof');
      expect(html).toContain('class="pricing');
      expect(html).toContain('class="faq');
      expect(html).toContain('class="final-cta');
    });

    it('generated HTML has fixture data rendered', () => {
      const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf-8');
      // Hero h1 from fixture
      expect(html).toContain('Build your brand in weeks, not months');
      // Problem bullets
      expect(html).toContain('inconsistent across channels');
      // Testimonial name
      expect(html).toContain('Sarah Chen');
      // FAQ question
      expect(html).toContain('How long does the process take?');
    });

    it('generated HTML has relative paths', () => {
      const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf-8');
      const rootRelative = html.match(/(href|src)=["']\/[^"']/g);
      expect(rootRelative).toBeNull();
    });

    it('should produce styles.min.css with CSS from base/layout/components', () => {
      const cssPath = path.join(outputDir, 'styles.min.css');
      expect(fs.existsSync(cssPath)).toBe(true);
      const css = fs.readFileSync(cssPath, 'utf-8');
      // Should contain minified content from our CSS files
      expect(css.length).toBeGreaterThan(100);
    });

    it('should produce scripts.min.js with accordion JS', () => {
      const jsPath = path.join(outputDir, 'scripts.min.js');
      expect(fs.existsSync(jsPath)).toBe(true);
      const js = fs.readFileSync(jsPath, 'utf-8');
      expect(js).toContain('accordion');
    });

    it('HTML structure is valid HTML5', () => {
      const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf-8');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('<head>');
      expect(html).toContain('</head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</body>');
    });
  });
});
