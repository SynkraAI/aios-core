/**
 * Tests for Bio Link, Thank You, and Microcopy Guide (BSS-5.7)
 *
 * Covers:
 * - MicrocopyGuide validation (all 9 sections required) — AC-6, AC-11
 * - MicrocopyGuide build produces structured data — AC-6
 * - Bio link template renders correct link blocks — AC-2, AC-11
 * - Thank you page renders tracking pixel safely — AC-4, AC-11
 * - BuildType includes new types — AC-8
 * - Integration: build all 3 templates — AC-12
 */

import fs from 'node:fs';
import path from 'node:path';
import nunjucks from 'nunjucks';
import { MicrocopyGuide } from '../microcopy/microcopy-guide';
import type { MicrocopyInput } from '../microcopy/types';
import type { BuildType } from '../static-generator';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function createValidMicrocopyInput(): MicrocopyInput {
  return {
    clientId: 'test-client',
    brandName: 'Test Brand',
    buttons: [{ context: 'CTA', copy: 'Get Started' }],
    formLabels: [{ context: 'Name', copy: 'Full Name' }],
    placeholders: [{ context: 'Email', copy: 'you@example.com' }],
    errorMessages: [{ context: 'Required', copy: 'This field is required' }],
    emptyStates: [{ context: 'No results', copy: 'Nothing found' }],
    loadingStates: [{ context: 'Page', copy: 'Loading...' }],
    successConfirmations: [{ context: 'Form', copy: 'Success!' }],
    notFoundCopy: [{ context: '404', copy: 'Page not found' }],
    cookieBanner: [{ context: 'Banner', copy: 'We use cookies' }],
  };
}

function createBioLinkFixture() {
  return {
    clientId: 'test-client',
    type: 'bio-link',
    bio: {
      avatar: 'avatar.jpg',
      name: 'Jane Smith',
      tagline: 'Brand Strategist',
      links: [
        { label: 'Website', url: 'https://example.com', style: 'primary' },
        { label: 'Blog', url: 'https://blog.example.com', style: 'secondary' },
        { label: 'Portfolio', url: 'https://portfolio.example.com', style: 'outline' },
      ],
      socials: [
        { platform: 'instagram', url: 'https://instagram.com/test' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/test' },
      ],
      footer: 'Powered by BrandForge',
    },
  };
}

function createThankYouFixture() {
  return {
    clientId: 'test-client',
    type: 'thank-you',
    thankYou: {
      headline: 'Thank You!',
      message: 'Your request has been received.',
      cta: { label: 'Back to Home', url: '/' },
      secondaryText: 'Check your email.',
    },
    analytics: {
      pixelHtml: '<img src="https://pixel.example.com/track" height="1" width="1" style="display:none">',
    },
  };
}

// ---------------------------------------------------------------------------
// Nunjucks Environment (for template rendering tests)
// ---------------------------------------------------------------------------

const templatesDir = path.resolve(__dirname, '..', '..', 'templates');
const assetsDir = path.resolve(__dirname, '..', '..');

function createNunjucksEnv(buildType: string): nunjucks.Environment {
  const typeDir = path.join(templatesDir, buildType);
  const sharedDir = path.join(templatesDir, 'shared');
  const searchPaths = [typeDir];
  if (fs.existsSync(sharedDir)) searchPaths.push(sharedDir);
  searchPaths.push(assetsDir);

  return new nunjucks.Environment(
    new nunjucks.FileSystemLoader(searchPaths, { noCache: true }),
    { autoescape: true }
  );
}

// ---------------------------------------------------------------------------
// MicrocopyGuide — Validation (AC-6, AC-11)
// ---------------------------------------------------------------------------

describe('MicrocopyGuide', () => {
  let guide: MicrocopyGuide;

  beforeEach(() => {
    guide = new MicrocopyGuide();
  });

  describe('validate', () => {
    it('returns no errors for valid input with all 9 sections', () => {
      const input = createValidMicrocopyInput();
      const errors = guide.validate(input);
      expect(errors).toHaveLength(0);
    });

    it('returns error when a section is empty', () => {
      const input = {
        ...createValidMicrocopyInput(),
        buttons: [],
      };
      const errors = guide.validate(input);
      expect(errors).toHaveLength(1);
      expect(errors[0].section).toBe('Button Labels');
      expect(errors[0].message).toContain('required');
    });

    it('returns errors for multiple missing sections', () => {
      const input = {
        ...createValidMicrocopyInput(),
        buttons: [],
        errorMessages: [],
        cookieBanner: [],
      };
      const errors = guide.validate(input);
      expect(errors).toHaveLength(3);
    });

    it('validates all 9 sections are required', () => {
      const emptyInput: MicrocopyInput = {
        clientId: 'test',
        brandName: 'Test',
        buttons: [],
        formLabels: [],
        placeholders: [],
        errorMessages: [],
        emptyStates: [],
        loadingStates: [],
        successConfirmations: [],
        notFoundCopy: [],
        cookieBanner: [],
      };
      const errors = guide.validate(emptyInput);
      expect(errors).toHaveLength(9);
    });
  });

  describe('build', () => {
    it('returns MicrocopyData with all 9 sections', () => {
      const input = createValidMicrocopyInput();
      const data = guide.build(input);

      expect(data.clientId).toBe('test-client');
      expect(data.brandName).toBe('Test Brand');
      expect(data.sections).toHaveLength(9);
      expect(data.totalItems).toBe(9);
    });

    it('sections have correct titles and slugs', () => {
      const data = guide.build(createValidMicrocopyInput());
      const titles = data.sections.map((s) => s.title);
      expect(titles).toContain('Button Labels');
      expect(titles).toContain('Form Labels');
      expect(titles).toContain('Error Messages');
      expect(titles).toContain('404 Copy');
      expect(titles).toContain('Cookie Banner Copy');
    });

    it('throws when validation fails', () => {
      const input = {
        ...createValidMicrocopyInput(),
        buttons: [],
      };
      expect(() => guide.build(input)).toThrow('Microcopy validation failed');
    });

    it('counts total items correctly', () => {
      const input = {
        ...createValidMicrocopyInput(),
        buttons: [
          { context: 'CTA', copy: 'Go' },
          { context: 'Submit', copy: 'Send' },
          { context: 'Cancel', copy: 'Cancel' },
        ],
      };
      const data = guide.build(input);
      // 3 buttons + 8 others (1 each) = 11
      expect(data.totalItems).toBe(11);
    });
  });
});

// ---------------------------------------------------------------------------
// Bio Link Template Rendering (AC-2, AC-11)
// ---------------------------------------------------------------------------

describe('Bio Link template', () => {
  const templatePath = path.join(templatesDir, 'bio-link', 'index.njk');

  it('template file exists', () => {
    expect(fs.existsSync(templatePath)).toBe(true);
  });

  it('renders correct number of link blocks from array', () => {
    const env = createNunjucksEnv('bio-link');
    const data = createBioLinkFixture();
    const html = env.render('index.njk', data);

    // Should have 3 link blocks (one per link in fixture)
    const linkMatches = html.match(/bio-link-btn/g);
    // Each link has the class twice (--variant), so count <a> tags with bio-link-btn
    const anchorMatches = html.match(/<a[^>]*class="bio-link-btn[^"]*"/g);
    expect(anchorMatches).toHaveLength(3);
  });

  it('renders all three link styles', () => {
    const env = createNunjucksEnv('bio-link');
    const data = createBioLinkFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('bio-link-btn--primary');
    expect(html).toContain('bio-link-btn--secondary');
    expect(html).toContain('bio-link-btn--outline');
  });

  it('renders link labels and URLs', () => {
    const env = createNunjucksEnv('bio-link');
    const data = createBioLinkFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('Website');
    expect(html).toContain('https://example.com');
    expect(html).toContain('Blog');
    expect(html).toContain('Portfolio');
  });

  it('renders avatar image', () => {
    const env = createNunjucksEnv('bio-link');
    const data = createBioLinkFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('bio-avatar');
    expect(html).toContain('avatar.jpg');
  });

  it('renders social links', () => {
    const env = createNunjucksEnv('bio-link');
    const data = createBioLinkFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('aria-label="instagram"');
    expect(html).toContain('aria-label="linkedin"');
    expect(html).toContain('https://instagram.com/test');
  });

  it('renders name and tagline', () => {
    const env = createNunjucksEnv('bio-link');
    const data = createBioLinkFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('Jane Smith');
    expect(html).toContain('Brand Strategist');
  });

  it('uses <a> elements for links (not buttons)', () => {
    const env = createNunjucksEnv('bio-link');
    const data = createBioLinkFixture();
    const html = env.render('index.njk', data);

    // Links should be <a> tags (class and href in any order)
    const anchors = html.match(/<a\s[^>]*bio-link-btn[^>]*>/g);
    expect(anchors).not.toBeNull();
    expect(anchors!.length).toBe(3);
    // All anchors should have href
    for (const anchor of anchors!) {
      expect(anchor).toContain('href=');
    }

    // No <button> elements for links
    expect(html).not.toMatch(/<button[^>]*bio-link-btn/);
  });

  it('has inline CSS (no external styles.min.css dependency)', () => {
    const env = createNunjucksEnv('bio-link');
    const data = createBioLinkFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('<style>');
    expect(html).not.toContain('styles.min.css');
  });

  it('renders with mobile-first max-width 480px', () => {
    const env = createNunjucksEnv('bio-link');
    const data = createBioLinkFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('max-width: 480px');
  });
});

// ---------------------------------------------------------------------------
// Thank You Page Template (AC-4, AC-11)
// ---------------------------------------------------------------------------

describe('Thank You template', () => {
  const templatePath = path.join(templatesDir, 'thank-you', 'index.njk');

  it('template file exists', () => {
    expect(fs.existsSync(templatePath)).toBe(true);
  });

  it('renders headline and message', () => {
    const env = createNunjucksEnv('thank-you');
    const data = createThankYouFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('Thank You!');
    expect(html).toContain('Your request has been received.');
  });

  it('renders CTA block', () => {
    const env = createNunjucksEnv('thank-you');
    const data = createThankYouFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('Back to Home');
    expect(html).toContain('href="/"');
  });

  it('renders tracking pixel HTML safely (unescaped)', () => {
    const env = createNunjucksEnv('thank-you');
    const data = createThankYouFixture();
    const html = env.render('index.njk', data);

    // The pixel HTML should be rendered unescaped (via | safe filter)
    expect(html).toContain('<img src="https://pixel.example.com/track"');
    // Should NOT be escaped
    expect(html).not.toContain('&lt;img');
  });

  it('includes security warning comment for pixel', () => {
    const env = createNunjucksEnv('thank-you');
    const data = createThankYouFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('Client-provided tracking pixel');
  });

  it('has inline CSS (self-contained)', () => {
    const env = createNunjucksEnv('thank-you');
    const data = createThankYouFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('<style>');
    expect(html).not.toContain('styles.min.css');
  });

  it('has noindex meta tag', () => {
    const env = createNunjucksEnv('thank-you');
    const data = createThankYouFixture();
    const html = env.render('index.njk', data);

    expect(html).toContain('noindex');
  });
});

// ---------------------------------------------------------------------------
// Microcopy Guide Template (AC-5)
// ---------------------------------------------------------------------------

describe('Microcopy Guide template', () => {
  const templatePath = path.join(templatesDir, 'microcopy-guide', 'index.njk');

  it('template file exists', () => {
    expect(fs.existsSync(templatePath)).toBe(true);
  });

  it('renders all 9 sections', () => {
    const env = createNunjucksEnv('microcopy-guide');
    const guide = new MicrocopyGuide();
    const data = guide.build(createValidMicrocopyInput());
    const html = env.render('index.njk', { microcopy: data, clientId: 'test' });

    expect(html).toContain('Button Labels');
    expect(html).toContain('Form Labels');
    expect(html).toContain('Placeholders');
    expect(html).toContain('Error Messages');
    expect(html).toContain('Empty States');
    expect(html).toContain('Loading States');
    expect(html).toContain('Success Confirmations');
    expect(html).toContain('404 Copy');
    expect(html).toContain('Cookie Banner Copy');
  });

  it('renders table of contents', () => {
    const env = createNunjucksEnv('microcopy-guide');
    const guide = new MicrocopyGuide();
    const data = guide.build(createValidMicrocopyInput());
    const html = env.render('index.njk', { microcopy: data, clientId: 'test' });

    expect(html).toContain('Table of Contents');
    expect(html).toContain('href="#button-labels"');
  });
});

// ---------------------------------------------------------------------------
// BuildType Extension (AC-8)
// ---------------------------------------------------------------------------

describe('BuildType', () => {
  it('includes bio-link type', () => {
    const type: BuildType = 'bio-link';
    expect(type).toBe('bio-link');
  });

  it('includes thank-you type', () => {
    const type: BuildType = 'thank-you';
    expect(type).toBe('thank-you');
  });

  it('includes microcopy-guide type', () => {
    const type: BuildType = 'microcopy-guide';
    expect(type).toBe('microcopy-guide');
  });
});

// ---------------------------------------------------------------------------
// Integration: All 3 templates build (AC-12)
// ---------------------------------------------------------------------------

describe('integration: build all three templates', () => {
  it('bio-link template renders to valid HTML', () => {
    const env = createNunjucksEnv('bio-link');
    const html = env.render('index.njk', createBioLinkFixture());

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
    expect(html.length).toBeGreaterThan(500);
  });

  it('thank-you template renders to valid HTML', () => {
    const env = createNunjucksEnv('thank-you');
    const html = env.render('index.njk', createThankYouFixture());

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
    expect(html.length).toBeGreaterThan(500);
  });

  it('microcopy-guide template renders to valid HTML', () => {
    const env = createNunjucksEnv('microcopy-guide');
    const guide = new MicrocopyGuide();
    const data = guide.build(createValidMicrocopyInput());
    const html = env.render('index.njk', { microcopy: data, clientId: 'test' });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
    expect(html.length).toBeGreaterThan(500);
  });

  it('all SVG social icons exist', () => {
    const iconsDir = path.resolve(__dirname, '..', '..', 'assets', 'icons', 'social');
    const expectedIcons = [
      'instagram.svg', 'facebook.svg', 'linkedin.svg', 'youtube.svg',
      'tiktok.svg', 'x.svg', 'website.svg', 'email.svg', 'whatsapp.svg',
    ];

    for (const icon of expectedIcons) {
      const iconPath = path.join(iconsDir, icon);
      expect(fs.existsSync(iconPath)).toBe(true);
    }
  });
});
