/**
 * Prompt Template Library Tests
 *
 * @see BSS-3.3: Prompt Template Library
 */

import * as path from 'path';
import { PromptRegistry, TemplateValidationError } from '../registry';
import { render, TemplateRenderError } from '../renderer';
import { loadTemplatesFromDir, createDefaultRegistry } from '../loader';
import type { PromptTemplate, ClientContext } from '../types';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

function createTestTemplate(overrides?: Partial<PromptTemplate>): PromptTemplate {
  return {
    id: 'test-template',
    deliverableType: 'social-post',
    version: '1.0.0',
    status: 'active',
    variant: 'A',
    changelog: [
      { version: '1.0.0', description: 'Initial version', date: '2026-03-16' },
    ],
    variables: {
      brandName: { type: 'string', required: true },
      brandPersonality: { type: 'string[]', required: true },
      industryVertical: { type: 'string', required: true },
      toneSpectrum: { type: 'string', required: true },
      postTopic: { type: 'string', required: true },
      platform: { type: 'string', required: true },
      vocabularyBank: { type: 'string[]', required: false, default: [] },
      forbiddenWords: { type: 'string[]', required: false, default: [] },
      competitorNames: { type: 'string[]', required: false, default: [] },
    },
    systemPrompt: 'You are a copywriter for {{brandName}} in {{industryVertical}}.',
    userPromptTemplate:
      'Write a {{platform}} post about {{postTopic}} with tone: {{toneSpectrum}}. Personality: {{#each brandPersonality}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}.',
    ...overrides,
  };
}

function createTestContext(overrides?: Partial<ClientContext>): ClientContext {
  return {
    clientId: 'test-client',
    brandName: 'TestBrand',
    brandPersonality: ['bold', 'innovative', 'friendly'],
    industryVertical: 'technology',
    toneSpectrum: 'professional-conversational',
    vocabularyBank: ['empower', 'transform'],
    forbiddenWords: ['cheap', 'basic'],
    competitorNames: ['CompetitorA'],
    postTopic: 'AI automation',
    platform: 'instagram',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// PromptRegistry Tests
// ---------------------------------------------------------------------------

describe('PromptRegistry', () => {
  let registry: PromptRegistry;

  beforeEach(() => {
    registry = new PromptRegistry();
  });

  describe('registerTemplate', () => {
    it('should register a valid template', () => {
      const template = createTestTemplate();
      registry.registerTemplate(template);

      const result = registry.getTemplate('social-post');
      expect(result).toBeDefined();
      expect(result!.id).toBe('test-template');
    });

    it('should reject invalid semver version', () => {
      const template = createTestTemplate({ version: 'v1' });

      expect(() => registry.registerTemplate(template)).toThrow(
        TemplateValidationError,
      );
    });

    it('should reject template missing changelog for current version (AC 7)', () => {
      const template = createTestTemplate({
        version: '2.0.0',
        changelog: [
          { version: '1.0.0', description: 'Old version', date: '2026-01-01' },
        ],
      });

      expect(() => registry.registerTemplate(template)).toThrow(
        TemplateValidationError,
      );
      expect(() => registry.registerTemplate(template)).toThrow(
        /missing a changelog entry/,
      );
    });
  });

  describe('getTemplate', () => {
    it('should return latest active version when version is omitted', () => {
      registry.registerTemplate(createTestTemplate({ version: '1.0.0', changelog: [{ version: '1.0.0', description: 'v1', date: '2026-01-01' }] }));
      registry.registerTemplate(createTestTemplate({ version: '2.0.0', changelog: [{ version: '2.0.0', description: 'v2', date: '2026-02-01' }] }));
      registry.registerTemplate(createTestTemplate({ version: '1.5.0', changelog: [{ version: '1.5.0', description: 'v1.5', date: '2026-01-15' }] }));

      const result = registry.getTemplate('social-post');
      expect(result!.version).toBe('2.0.0');
    });

    it('should return specific version when requested', () => {
      registry.registerTemplate(createTestTemplate({ version: '1.0.0', changelog: [{ version: '1.0.0', description: 'v1', date: '2026-01-01' }] }));
      registry.registerTemplate(createTestTemplate({ version: '2.0.0', changelog: [{ version: '2.0.0', description: 'v2', date: '2026-02-01' }] }));

      const result = registry.getTemplate('social-post', '1.0.0');
      expect(result!.version).toBe('1.0.0');
    });

    it('should return variant A by default', () => {
      registry.registerTemplate(createTestTemplate({ variant: 'A' }));
      registry.registerTemplate(createTestTemplate({ variant: 'B', id: 'test-b' }));

      const result = registry.getTemplate('social-post');
      expect(result!.variant).toBe('A');
    });

    it('should return specific variant when requested (AC 6)', () => {
      registry.registerTemplate(createTestTemplate({ variant: 'A' }));
      registry.registerTemplate(createTestTemplate({ variant: 'B', id: 'test-b' }));

      const result = registry.getTemplate('social-post', undefined, 'B');
      expect(result).toBeDefined();
      expect(result!.variant).toBe('B');
      expect(result!.id).toBe('test-b');
    });

    it('should return undefined for nonexistent deliverable type', () => {
      const result = registry.getTemplate('brand-voice-guide');
      expect(result).toBeUndefined();
    });

    it('should ignore deprecated templates', () => {
      registry.registerTemplate(
        createTestTemplate({ version: '2.0.0', status: 'deprecated', changelog: [{ version: '2.0.0', description: 'deprecated', date: '2026-02-01' }] }),
      );
      registry.registerTemplate(
        createTestTemplate({ version: '1.0.0', status: 'active', changelog: [{ version: '1.0.0', description: 'active', date: '2026-01-01' }] }),
      );

      const result = registry.getTemplate('social-post');
      expect(result!.version).toBe('1.0.0');
    });
  });

  describe('listTemplates', () => {
    it('should return summaries of all registered templates', () => {
      registry.registerTemplate(createTestTemplate());
      registry.registerTemplate(
        createTestTemplate({
          id: 'brand-voice',
          deliverableType: 'brand-voice-guide',
        }),
      );

      const list = registry.listTemplates();
      expect(list).toHaveLength(2);
      expect(list[0]).toHaveProperty('id');
      expect(list[0]).toHaveProperty('deliverableType');
      expect(list[0]).toHaveProperty('version');
      expect(list[0]).toHaveProperty('status');
      expect(list[0]).toHaveProperty('variant');
      // Should NOT have full prompt content
      expect(list[0]).not.toHaveProperty('systemPrompt');
    });
  });
});

// ---------------------------------------------------------------------------
// Renderer Tests
// ---------------------------------------------------------------------------

describe('render', () => {
  it('should substitute Handlebars variables in both prompts (AC 4)', () => {
    const template = createTestTemplate();
    const context = createTestContext();

    const result = render(template, context);

    expect(result.system).toContain('TestBrand');
    expect(result.system).toContain('technology');
    expect(result.user).toContain('instagram');
    expect(result.user).toContain('AI automation');
    expect(result.user).toContain('bold, innovative, friendly');
  });

  it('should throw TemplateRenderError for missing required variables', () => {
    const template = createTestTemplate();
    const context = createTestContext();
    // Remove a required field
    delete (context as Record<string, unknown>)['postTopic'];

    expect(() => render(template, context)).toThrow(TemplateRenderError);
    expect(() => render(template, context)).toThrow(/postTopic/);
  });

  it('should apply default values for optional variables', () => {
    const template = createTestTemplate({
      variables: {
        brandName: { type: 'string', required: true },
        optionalField: { type: 'string', required: false, default: 'default-value' },
      },
      userPromptTemplate: '{{brandName}} — {{optionalField}}',
    });

    const context: ClientContext = {
      clientId: 'c1',
      brandName: 'Test',
      brandPersonality: [],
      industryVertical: 'tech',
      toneSpectrum: 'neutral',
      vocabularyBank: [],
      forbiddenWords: [],
      competitorNames: [],
    };

    const result = render(template, context);
    expect(result.user).toContain('default-value');
  });
});

// ---------------------------------------------------------------------------
// Loader Tests
// ---------------------------------------------------------------------------

describe('loadTemplatesFromDir', () => {
  it('should load all 8 seed templates from templates/ directory', () => {
    const templatesDir = path.resolve(__dirname, '..', '..', 'templates');
    const registry = createDefaultRegistry(templatesDir);

    const list = registry.listTemplates();
    expect(list.length).toBeGreaterThanOrEqual(8);

    const types = list.map((t) => t.deliverableType);
    expect(types).toContain('brand-voice-guide');
    expect(types).toContain('social-post');
    expect(types).toContain('carousel-caption');
    expect(types).toContain('landing-page-copy');
    expect(types).toContain('email-sequence');
    expect(types).toContain('ad-copy');
    expect(types).toContain('video-script');
    expect(types).toContain('hashtag-set');
  });

  it('should handle nonexistent directory gracefully', () => {
    const registry = new PromptRegistry();
    expect(() =>
      loadTemplatesFromDir(registry, '/nonexistent/path'),
    ).not.toThrow();
  });

  it('should render loaded templates with context', () => {
    const templatesDir = path.resolve(__dirname, '..', '..', 'templates');
    const registry = createDefaultRegistry(templatesDir);

    const template = registry.getTemplate('social-post');
    expect(template).toBeDefined();

    const context = createTestContext();
    const result = render(template!, context);

    expect(result.system).toBeTruthy();
    expect(result.user).toBeTruthy();
    expect(result.user).toContain('TestBrand');
  });
});
