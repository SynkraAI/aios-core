import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  TrainingGenerator,
  validateConfig,
  renderBrandUsageGuide,
  renderStaticSiteUpdateGuide,
  renderSocialMediaGuide,
  renderDeveloperOnboardingGuide,
  renderTrainingIndex,
  wrapLayout,
  loomSection,
  escapeHtml,
  DEFAULT_LOOM_PLACEHOLDERS,
  TRAINING_SIGNED_URL_EXPIRY,
} from '../index';
import type { TrainingConfig, LoomPlaceholder } from '../types';

// ============================================================
// Test Fixtures
// ============================================================

function createMockConfig(overrides: Partial<TrainingConfig> = {}): TrainingConfig {
  return {
    clientId: 'acme-corp',
    brandTokensPackage: '@brand-system/acme-corp-tokens',
    clientName: 'Acme Corporation',
    primaryColor: '#3B82F6',
    guides: {
      brand_usage: true,
      static_site_update: true,
      social_media: true,
      developer_onboarding: true,
    },
    loomPlaceholders: {
      brand_usage: '',
      static_site_update: '',
      social_media: '',
      developer_onboarding: '',
    },
    ...overrides,
  };
}

function createMockLoom(overrides: Partial<LoomPlaceholder> = {}): LoomPlaceholder {
  return {
    title: 'Test Video',
    duration: '3-5 min',
    outline: ['Step 1', 'Step 2', 'Step 3'],
    url: '',
    ...overrides,
  };
}

// ============================================================
// validateConfig tests
// ============================================================

describe('validateConfig', () => {
  it('should accept a valid config', () => {
    expect(() => validateConfig(createMockConfig())).not.toThrow();
  });

  it('should reject empty clientId', () => {
    expect(() => validateConfig(createMockConfig({ clientId: '' }))).toThrow('clientId');
  });

  it('should reject empty clientName', () => {
    expect(() => validateConfig(createMockConfig({ clientName: '' }))).toThrow('clientName');
  });

  it('should reject invalid primaryColor', () => {
    expect(() => validateConfig(createMockConfig({ primaryColor: 'red' }))).toThrow('primaryColor');
  });

  it('should reject 3-digit hex', () => {
    expect(() => validateConfig(createMockConfig({ primaryColor: '#F00' }))).toThrow('primaryColor');
  });

  it('should reject config with no guides enabled', () => {
    const config = createMockConfig({
      guides: {
        brand_usage: false,
        static_site_update: false,
        social_media: false,
        developer_onboarding: false,
      },
    });
    expect(() => validateConfig(config)).toThrow('at least one guide');
  });
});

// ============================================================
// Shared template helpers
// ============================================================

describe('Template helpers', () => {
  describe('escapeHtml', () => {
    it('should escape ampersands', () => {
      expect(escapeHtml('A & B')).toBe('A &amp; B');
    });

    it('should escape angle brackets', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("it's")).toBe('it&#039;s');
    });
  });

  describe('wrapLayout', () => {
    it('should produce valid HTML document', () => {
      const html = wrapLayout('Test', 'Client', '#FF0000', '<p>Hello</p>');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
      expect(html).toContain('<title>Test — Client</title>');
      expect(html).toContain('--color-primary: #FF0000');
      expect(html).toContain('<p>Hello</p>');
    });

    it('should include footer with client name', () => {
      const html = wrapLayout('T', 'Acme', '#000000', '');
      expect(html).toContain('Acme Brand System');
    });

    it('should include responsive meta tag', () => {
      const html = wrapLayout('T', 'C', '#000000', '');
      expect(html).toContain('viewport');
    });
  });

  describe('loomSection', () => {
    it('should render placeholder when no URL provided', () => {
      const html = loomSection('Test Video', '3 min', ['Step 1'], '');
      expect(html).toContain('Video Walkthrough: Test Video');
      expect(html).toContain('3 min');
      expect(html).toContain('Step 1');
      expect(html).toContain('not yet recorded');
      expect(html).not.toContain('Watch Video');
    });

    it('should render video link when URL provided', () => {
      const html = loomSection('Test', '5 min', ['A'], 'https://loom.com/share/abc');
      expect(html).toContain('Watch Video');
      expect(html).toContain('https://loom.com/share/abc');
      expect(html).not.toContain('not yet recorded');
    });

    it('should render multiple outline items', () => {
      const html = loomSection('T', '1 min', ['A', 'B', 'C'], '');
      expect(html).toContain('<li>A</li>');
      expect(html).toContain('<li>B</li>');
      expect(html).toContain('<li>C</li>');
    });
  });
});

// ============================================================
// Individual guide rendering
// ============================================================

describe('Guide templates', () => {
  const loom = createMockLoom();

  describe('Brand Usage Guide', () => {
    it('should render with all sections', () => {
      const html = renderBrandUsageGuide('Acme', '#3B82F6', loom);
      expect(html).toContain('Brand Usage Training');
      expect(html).toContain('Using the Brand Book');
      expect(html).toContain('Color');
      expect(html).toContain('Typography');
      expect(html).toContain('Logo Usage');
      expect(html).toContain('Tone of Voice');
      expect(html).toContain('Quick-Reference Card');
    });

    it('should include client name', () => {
      const html = renderBrandUsageGuide('TestCorp', '#000000', loom);
      expect(html).toContain('TestCorp');
    });

    it('should include Loom section', () => {
      const html = renderBrandUsageGuide('A', '#000000', loom);
      expect(html).toContain('Video Walkthrough');
    });
  });

  describe('Static Site Update Guide', () => {
    it('should render with all sections', () => {
      const html = renderStaticSiteUpdateGuide('Acme', '#3B82F6', loom);
      expect(html).toContain('Static Site Update Guide');
      expect(html).toContain('Updating Text Content');
      expect(html).toContain('Updating Images');
      expect(html).toContain('R2 Upload Path');
      expect(html).toContain('Self-Service vs. Developer');
    });

    it('should include code examples', () => {
      const html = renderStaticSiteUpdateGuide('A', '#000000', loom);
      expect(html).toContain('<pre>');
      expect(html).toContain('&lt;h2&gt;');
    });
  });

  describe('Social Media Guide', () => {
    it('should render with all sections', () => {
      const html = renderSocialMediaGuide('Acme', '#3B82F6', loom);
      expect(html).toContain('Social Media Training Guide');
      expect(html).toContain('Content Calendar');
      expect(html).toContain('Templates');
      expect(html).toContain('Hashtag Strategy');
      expect(html).toContain('Posting Cadence');
      expect(html).toContain('Brand Voice Reminders');
    });

    it('should include platform dimensions', () => {
      const html = renderSocialMediaGuide('A', '#000000', loom);
      expect(html).toContain('1080x1080');
      expect(html).toContain('1080x1920');
    });

    it('should include hashtag tiers', () => {
      const html = renderSocialMediaGuide('A', '#000000', loom);
      expect(html).toContain('Niche');
      expect(html).toContain('Medium');
      expect(html).toContain('Broad');
    });
  });

  describe('Developer Onboarding Guide', () => {
    it('should render with all sections', () => {
      const html = renderDeveloperOnboardingGuide(
        'Acme', 'acme', '#3B82F6', '@brand-system/acme-tokens', loom
      );
      expect(html).toContain('Design System Onboarding');
      expect(html).toContain('Installing the Token Package');
      expect(html).toContain('CSS Custom Properties');
      expect(html).toContain('Tailwind CSS');
      expect(html).toContain('Requesting Token Updates');
      expect(html).toContain('Troubleshooting');
    });

    it('should include package name in install command', () => {
      const html = renderDeveloperOnboardingGuide(
        'A', 'a', '#000000', '@brand-system/acme-tokens', loom
      );
      expect(html).toContain('npm install @brand-system/acme-tokens');
    });

    it('should include CSS custom properties list', () => {
      const html = renderDeveloperOnboardingGuide(
        'A', 'a', '#000000', '@bss/tokens', loom
      );
      expect(html).toContain('var(--color-primary)');
      expect(html).toContain('var(--font-heading)');
      expect(html).toContain('var(--spacing-md)');
    });
  });
});

// ============================================================
// Training Index
// ============================================================

describe('Training Index', () => {
  it('should render index with all guides enabled', () => {
    const html = renderTrainingIndex(createMockConfig());
    expect(html).toContain('Training &amp; Enablement');
    expect(html).toContain('Business Owner');
    expect(html).toContain('Content Team');
    expect(html).toContain('Developer');
    expect(html).toContain('brand-usage.html');
    expect(html).toContain('social-media.html');
    expect(html).toContain('developer-onboarding.html');
  });

  it('should only show enabled guides', () => {
    const config = createMockConfig({
      guides: {
        brand_usage: true,
        static_site_update: false,
        social_media: false,
        developer_onboarding: false,
      },
    });
    const html = renderTrainingIndex(config);
    expect(html).toContain('brand-usage.html');
    expect(html).not.toContain('social-media.html');
    expect(html).not.toContain('developer-onboarding.html');
  });

  it('should include Loom links when URLs are provided', () => {
    const config = createMockConfig({
      loomPlaceholders: {
        brand_usage: 'https://loom.com/share/abc',
        static_site_update: '',
        social_media: '',
        developer_onboarding: '',
      },
    });
    const html = renderTrainingIndex(config);
    expect(html).toContain('https://loom.com/share/abc');
    expect(html).toContain('Watch video walkthrough');
  });

  it('should not show Loom link when URL is empty', () => {
    const config = createMockConfig();
    const html = renderTrainingIndex(config);
    expect(html).not.toContain('Watch video walkthrough');
  });
});

// ============================================================
// TrainingGenerator class
// ============================================================

describe('TrainingGenerator', () => {
  it('should create with valid config', () => {
    const gen = new TrainingGenerator(createMockConfig());
    expect(gen).toBeDefined();
  });

  it('should throw on invalid config', () => {
    expect(() => new TrainingGenerator(createMockConfig({ clientId: '' }))).toThrow();
  });

  describe('generate()', () => {
    it('should generate all 4 guides when all enabled', () => {
      const gen = new TrainingGenerator(createMockConfig());
      const result = gen.generate();
      expect(result.clientId).toBe('acme-corp');
      expect(result.guides).toHaveLength(4);
      expect(result.successCount).toBe(4);
      expect(result.failCount).toBe(0);
    });

    it('should only generate enabled guides', () => {
      const config = createMockConfig({
        guides: {
          brand_usage: true,
          static_site_update: false,
          social_media: true,
          developer_onboarding: false,
        },
      });
      const gen = new TrainingGenerator(config);
      const result = gen.generate();
      expect(result.guides).toHaveLength(2);
      expect(result.guides[0].guideType).toBe('brand_usage');
      expect(result.guides[1].guideType).toBe('social_media');
    });

    it('should produce valid HTML for each guide', () => {
      const gen = new TrainingGenerator(createMockConfig());
      const result = gen.generate();
      for (const guide of result.guides) {
        expect(guide.html).toContain('<!DOCTYPE html>');
        expect(guide.html).toContain('</html>');
        expect(guide.success).toBe(true);
      }
    });

    it('should generate index page', () => {
      const gen = new TrainingGenerator(createMockConfig());
      const result = gen.generate();
      expect(result.indexHtml).toContain('<!DOCTYPE html>');
      expect(result.indexHtml).toContain('Training');
    });

    it('should set correct file names', () => {
      const gen = new TrainingGenerator(createMockConfig());
      const result = gen.generate();
      const fileNames = result.guides.map((g) => g.fileName);
      expect(fileNames).toContain('brand-usage.html');
      expect(fileNames).toContain('static-site-update.html');
      expect(fileNames).toContain('social-media.html');
      expect(fileNames).toContain('developer-onboarding.html');
    });
  });

  describe('generateToDir()', () => {
    let tmpDir: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'training-test-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should write all files to output directory', () => {
      const gen = new TrainingGenerator(createMockConfig());
      const outputDir = path.join(tmpDir, 'output');
      gen.generateToDir(outputDir);

      expect(fs.existsSync(path.join(outputDir, 'index.html'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'brand-usage.html'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'static-site-update.html'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'social-media.html'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'developer-onboarding.html'))).toBe(true);
    });

    it('should only write enabled guides', () => {
      const config = createMockConfig({
        guides: {
          brand_usage: true,
          static_site_update: false,
          social_media: false,
          developer_onboarding: false,
        },
      });
      const gen = new TrainingGenerator(config);
      const outputDir = path.join(tmpDir, 'output');
      gen.generateToDir(outputDir);

      expect(fs.existsSync(path.join(outputDir, 'brand-usage.html'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'social-media.html'))).toBe(false);
      expect(fs.existsSync(path.join(outputDir, 'index.html'))).toBe(true);
    });

    it('should write valid HTML content to files', () => {
      const gen = new TrainingGenerator(createMockConfig());
      const outputDir = path.join(tmpDir, 'output');
      gen.generateToDir(outputDir);

      const brandUsageHtml = fs.readFileSync(path.join(outputDir, 'brand-usage.html'), 'utf-8');
      expect(brandUsageHtml).toContain('Brand Usage Training');
      expect(brandUsageHtml).toContain('Acme Corporation');
    });

    it('should create output directory if it does not exist', () => {
      const gen = new TrainingGenerator(createMockConfig());
      const deepDir = path.join(tmpDir, 'a', 'b', 'c');
      gen.generateToDir(deepDir);
      expect(fs.existsSync(deepDir)).toBe(true);
    });
  });

  describe('R2 integration', () => {
    it('should return correct R2 upload path', () => {
      const gen = new TrainingGenerator(createMockConfig());
      expect(gen.getR2UploadPath()).toBe('brand-assets/acme-corp/training/');
    });

    it('should return 30-day signed URL expiry', () => {
      const gen = new TrainingGenerator(createMockConfig());
      expect(gen.getSignedUrlExpiry()).toBe(2592000);
      expect(gen.getSignedUrlExpiry()).toBe(TRAINING_SIGNED_URL_EXPIRY);
    });
  });
});

// ============================================================
// Constants and defaults
// ============================================================

describe('Constants', () => {
  it('should have default Loom placeholders for all guide types', () => {
    expect(DEFAULT_LOOM_PLACEHOLDERS.brand_usage).toBeDefined();
    expect(DEFAULT_LOOM_PLACEHOLDERS.static_site_update).toBeDefined();
    expect(DEFAULT_LOOM_PLACEHOLDERS.social_media).toBeDefined();
    expect(DEFAULT_LOOM_PLACEHOLDERS.developer_onboarding).toBeDefined();
  });

  it('should have non-empty outlines for all placeholders', () => {
    for (const [, loom] of Object.entries(DEFAULT_LOOM_PLACEHOLDERS)) {
      expect(loom.outline.length).toBeGreaterThan(0);
      expect(loom.title).toBeTruthy();
      expect(loom.duration).toBeTruthy();
    }
  });

  it('should set TRAINING_SIGNED_URL_EXPIRY to 30 days', () => {
    expect(TRAINING_SIGNED_URL_EXPIRY).toBe(30 * 24 * 60 * 60);
  });
});

// ============================================================
// Package structure
// ============================================================

describe('Package structure', () => {
  const pkgDir = path.resolve(__dirname, '../..');

  it('should have correct package name', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('@brand-system/training-generator');
  });

  it('should have eta as dependency', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'));
    expect(pkg.dependencies.eta).toBeDefined();
  });

  it('should export all public APIs from index', () => {
    const indexContent = fs.readFileSync(path.join(pkgDir, 'src', 'index.ts'), 'utf-8');
    expect(indexContent).toContain('TrainingGenerator');
    expect(indexContent).toContain('validateConfig');
    expect(indexContent).toContain('renderBrandUsageGuide');
    expect(indexContent).toContain('renderStaticSiteUpdateGuide');
    expect(indexContent).toContain('renderSocialMediaGuide');
    expect(indexContent).toContain('renderDeveloperOnboardingGuide');
    expect(indexContent).toContain('renderTrainingIndex');
    expect(indexContent).toContain('DEFAULT_LOOM_PLACEHOLDERS');
    expect(indexContent).toContain('TRAINING_SIGNED_URL_EXPIRY');
  });
});
