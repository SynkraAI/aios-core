/**
 * Tests for CMS Integration (BSS-5.6)
 *
 * Covers:
 * - PayloadCMSAdapter with mocked Payload local API — AC-3
 * - CMSToStaticAdapter mapping for all template types — AC-8
 * - RBAC access function logic (admin/editor/viewer) — AC-6
 * - Pages collection configuration — AC-4, AC-7
 * - MediaAssets collection configuration — AC-5
 * - Webhook on-publish stub — AC-9
 * - Package isolation — AC-1
 */

import { PayloadCMSAdapter } from '../payload-adapter';
import { CMSToStaticAdapter } from '../cms-to-static';
import {
  hasMinimumRole,
  adminAccess,
  editorReadAccess,
  editorWriteAccess,
  viewerAccess,
  mediaReadAccess,
  mediaWriteAccess,
} from '../access/roles';
import { Pages } from '../collections/Pages';
import { MediaAssets, ALLOWED_MIME_TYPES } from '../collections/MediaAssets';
import { createOnPublishHook } from '../webhooks/on-publish';
import type {
  CMSPage,
  CMSGlobalConfig,
  CMSUser,
  CMSTemplate,
} from '../types';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function createMockPage(overrides?: Partial<CMSPage>): CMSPage {
  return {
    id: 'page-1',
    slug: 'about-us',
    title: 'About Us',
    template: 'about',
    content: {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Our Story' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'We build great products.' }],
          },
        ],
      },
    },
    seoTitle: 'About Us | Example',
    seoDescription: 'Learn about our company.',
    status: 'published',
    publishedAt: '2026-03-20T10:00:00Z',
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
    ...overrides,
  };
}

function createMockLandingPage(): CMSPage {
  return createMockPage({
    id: 'page-2',
    slug: 'promo',
    title: 'Special Promotion',
    template: 'landing-page',
    content: {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h1',
            children: [{ type: 'text', text: 'Limited Time Offer' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Get 50% off today.' }],
          },
        ],
      },
    },
  });
}

function createMockGlobalConfig(overrides?: Partial<CMSGlobalConfig>): CMSGlobalConfig {
  return {
    siteName: 'Example Corp',
    siteUrl: 'https://example.com',
    clientId: 'test-client',
    logoUrl: '/assets/logo.svg',
    primaryColor: '#3b82f6',
    footerText: '2026 Example Corp. All rights reserved.',
    ...overrides,
  };
}

function createMockUser(role: CMSUser['role']): CMSUser {
  return { id: `user-${role}`, email: `${role}@example.com`, role };
}

// ---------------------------------------------------------------------------
// Mock Payload local API
// ---------------------------------------------------------------------------

function createMockPayload(pages: CMSPage[], globalConfig: CMSGlobalConfig) {
  return {
    find: jest.fn(async ({ collection, where }: {
      collection: string;
      where?: Record<string, unknown>;
    }) => {
      if (collection === 'pages' && where?.['slug']) {
        const slug = (where['slug'] as Record<string, string>)['equals'];
        const found = pages.filter((p) => p.slug === slug);
        return { docs: found, totalDocs: found.length };
      }
      return { docs: pages, totalDocs: pages.length };
    }),
    findByID: jest.fn(async ({ id }: { collection: string; id: string }) => {
      return pages.find((p) => p.id === id) ?? null;
    }),
    findGlobal: jest.fn(async () => globalConfig),
  };
}

// ===========================================================================
// PayloadCMSAdapter Tests (AC-3)
// ===========================================================================

describe('PayloadCMSAdapter', () => {
  const globalConfig = createMockGlobalConfig();
  const mockPages = [
    createMockPage(),
    createMockLandingPage(),
    createMockPage({ id: 'page-3', slug: 'contact', title: 'Contact', template: 'contact' }),
  ];

  let adapter: PayloadCMSAdapter;
  let mockPayload: ReturnType<typeof createMockPayload>;

  beforeEach(() => {
    mockPayload = createMockPayload(mockPages, globalConfig);
    adapter = new PayloadCMSAdapter(mockPayload);
  });

  it('getPage returns a page by slug', async () => {
    const page = await adapter.getPage('about-us');
    expect(page.slug).toBe('about-us');
    expect(page.title).toBe('About Us');
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: 'pages',
      where: { slug: { equals: 'about-us' } },
      limit: 1,
    });
  });

  it('getPage throws when page not found', async () => {
    await expect(adapter.getPage('nonexistent')).rejects.toThrow('Page not found: "nonexistent"');
  });

  it('getAllPages returns all pages sorted', async () => {
    const pages = await adapter.getAllPages();
    expect(pages).toHaveLength(3);
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: 'pages',
      limit: 1000,
      sort: '-updatedAt',
    });
  });

  it('getGlobalConfig returns global config', async () => {
    const config = await adapter.getGlobalConfig();
    expect(config.siteName).toBe('Example Corp');
    expect(config.clientId).toBe('test-client');
    expect(mockPayload.findGlobal).toHaveBeenCalledWith({ slug: 'site-config' });
  });
});

// ===========================================================================
// CMSToStaticAdapter Tests (AC-8)
// ===========================================================================

describe('CMSToStaticAdapter', () => {
  const globalConfig = createMockGlobalConfig();
  let adapter: CMSToStaticAdapter;

  beforeEach(() => {
    adapter = new CMSToStaticAdapter(globalConfig);
  });

  it('converts a page to StaticPageContext', () => {
    const page = createMockPage();
    const context = adapter.toStaticContext(page);

    expect(context.clientId).toBe('test-client');
    expect(context.title).toBe('About Us');
    expect(context.slug).toBe('about-us');
    expect(context.template).toBe('about');
    expect(context.seoTitle).toBe('About Us | Example');
    expect(context.seoDescription).toBe('Learn about our company.');
    expect(context.siteName).toBe('Example Corp');
    expect(context.siteUrl).toBe('https://example.com');
    expect(context.logoUrl).toBe('/assets/logo.svg');
    expect(context.primaryColor).toBe('#3b82f6');
  });

  it('renders Lexical content to HTML', () => {
    const page = createMockPage();
    const context = adapter.toStaticContext(page);

    expect(context.content).toContain('<h2>Our Story</h2>');
    expect(context.content).toContain('<p>We build great products.</p>');
  });

  it('handles empty content gracefully', () => {
    const page = createMockPage({ content: null });
    const context = adapter.toStaticContext(page);
    expect(context.content).toBe('');
  });

  it('handles string content', () => {
    const page = createMockPage({ content: '<p>Raw HTML</p>' as unknown });
    const context = adapter.toStaticContext(page);
    expect(context.content).toBe('<p>Raw HTML</p>');
  });

  it('uses title as seoTitle fallback when seoTitle is undefined', () => {
    const page = createMockPage({ seoTitle: undefined });
    const context = adapter.toStaticContext(page);
    expect(context.seoTitle).toBe('About Us');
  });

  it('converts landing page with hero extraction', () => {
    const page = createMockLandingPage();
    const context = adapter.toLandingPageContext(page);

    expect(context.hero).toBeDefined();
    expect(context.hero!.h1).toBe('Limited Time Offer');
    expect(context.hero!.subHeadline).toBe('Get 50% off today.');
  });

  it('convert dispatches to correct method by template', () => {
    const landingPage = createMockLandingPage();
    const result = adapter.convert(landingPage);
    expect('hero' in result).toBe(true);

    const aboutPage = createMockPage();
    const result2 = adapter.convert(aboutPage);
    expect('hero' in result2).toBe(false);
  });

  it('batch converts multiple pages', () => {
    const pages = [
      createMockPage(),
      createMockPage({ slug: 'services', template: 'services' }),
    ];
    const contexts = adapter.toStaticContextBatch(pages);
    expect(contexts).toHaveLength(2);
    expect(contexts[0].slug).toBe('about-us');
    expect(contexts[1].slug).toBe('services');
  });

  const ALL_TEMPLATES: CMSTemplate[] = [
    'landing-page', 'about', 'services', 'blog-post',
    'contact', 'pricing', 'terms-privacy', '404',
  ];

  it.each(ALL_TEMPLATES)(
    'maps template type "%s" without errors',
    (template) => {
      const page = createMockPage({ template });
      const context = adapter.convert(page);
      expect(context.template).toBe(template);
      expect(context.clientId).toBe('test-client');
    },
  );

  it('renders Lexical list nodes', () => {
    const page = createMockPage({
      content: {
        root: {
          children: [
            {
              type: 'list',
              listType: 'bullet',
              children: [
                { type: 'listitem', children: [{ type: 'text', text: 'Item 1' }] },
                { type: 'listitem', children: [{ type: 'text', text: 'Item 2' }] },
              ],
            },
          ],
        },
      },
    });
    const context = adapter.toStaticContext(page);
    expect(context.content).toContain('<ul>');
    expect(context.content).toContain('<li>Item 1</li>');
    expect(context.content).toContain('<li>Item 2</li>');
  });

  it('renders Lexical link nodes', () => {
    const page = createMockPage({
      content: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'link',
                  fields: { url: 'https://example.com' },
                  children: [{ type: 'text', text: 'Click here' }],
                },
              ],
            },
          ],
        },
      },
    });
    const context = adapter.toStaticContext(page);
    expect(context.content).toContain('<a href="https://example.com">Click here</a>');
  });

  it('escapes HTML in text nodes', () => {
    const page = createMockPage({
      content: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'A < B & C > D' }],
            },
          ],
        },
      },
    });
    const context = adapter.toStaticContext(page);
    expect(context.content).toContain('A &lt; B &amp; C &gt; D');
  });
});

// ===========================================================================
// RBAC Access Tests (AC-6)
// ===========================================================================

describe('RBAC Access Control', () => {
  describe('hasMinimumRole', () => {
    it('admin has access to all roles', () => {
      const admin = createMockUser('admin');
      expect(hasMinimumRole(admin, 'admin')).toBe(true);
      expect(hasMinimumRole(admin, 'editor')).toBe(true);
      expect(hasMinimumRole(admin, 'viewer')).toBe(true);
    });

    it('editor has access to editor and viewer', () => {
      const editor = createMockUser('editor');
      expect(hasMinimumRole(editor, 'admin')).toBe(false);
      expect(hasMinimumRole(editor, 'editor')).toBe(true);
      expect(hasMinimumRole(editor, 'viewer')).toBe(true);
    });

    it('viewer has access to viewer only', () => {
      const viewer = createMockUser('viewer');
      expect(hasMinimumRole(viewer, 'admin')).toBe(false);
      expect(hasMinimumRole(viewer, 'editor')).toBe(false);
      expect(hasMinimumRole(viewer, 'viewer')).toBe(true);
    });

    it('returns false for undefined user', () => {
      expect(hasMinimumRole(undefined, 'viewer')).toBe(false);
    });
  });

  describe('adminAccess', () => {
    it('grants admin access', () => {
      expect(adminAccess({ req: { user: createMockUser('admin') } })).toBe(true);
    });

    it('denies editor access', () => {
      expect(adminAccess({ req: { user: createMockUser('editor') } })).toBe(false);
    });

    it('denies viewer access', () => {
      expect(adminAccess({ req: { user: createMockUser('viewer') } })).toBe(false);
    });

    it('denies unauthenticated access', () => {
      expect(adminAccess({ req: {} })).toBe(false);
    });
  });

  describe('editorReadAccess', () => {
    it('grants admin and editor', () => {
      expect(editorReadAccess({ req: { user: createMockUser('admin') } })).toBe(true);
      expect(editorReadAccess({ req: { user: createMockUser('editor') } })).toBe(true);
    });

    it('denies viewer', () => {
      expect(editorReadAccess({ req: { user: createMockUser('viewer') } })).toBe(false);
    });
  });

  describe('editorWriteAccess', () => {
    it('grants admin full access (returns true)', () => {
      expect(editorWriteAccess({ req: { user: createMockUser('admin') } })).toBe(true);
    });

    it('grants editor draft-only access (returns query filter)', () => {
      const result = editorWriteAccess({ req: { user: createMockUser('editor') } });
      expect(result).toEqual({ status: { equals: 'draft' } });
    });

    it('denies viewer', () => {
      expect(editorWriteAccess({ req: { user: createMockUser('viewer') } })).toBe(false);
    });

    it('denies unauthenticated', () => {
      expect(editorWriteAccess({ req: {} })).toBe(false);
    });
  });

  describe('viewerAccess', () => {
    it('grants admin full access', () => {
      expect(viewerAccess({ req: { user: createMockUser('admin') } })).toBe(true);
    });

    it('grants editor full access', () => {
      expect(viewerAccess({ req: { user: createMockUser('editor') } })).toBe(true);
    });

    it('grants viewer published-only access', () => {
      const result = viewerAccess({ req: { user: createMockUser('viewer') } });
      expect(result).toEqual({ status: { equals: 'published' } });
    });

    it('denies unauthenticated', () => {
      expect(viewerAccess({ req: {} })).toBe(false);
    });
  });

  describe('media access', () => {
    it('mediaReadAccess allows viewer and above', () => {
      expect(mediaReadAccess({ req: { user: createMockUser('viewer') } })).toBe(true);
      expect(mediaReadAccess({ req: { user: createMockUser('editor') } })).toBe(true);
      expect(mediaReadAccess({ req: { user: createMockUser('admin') } })).toBe(true);
    });

    it('mediaWriteAccess allows editor and above', () => {
      expect(mediaWriteAccess({ req: { user: createMockUser('viewer') } })).toBe(false);
      expect(mediaWriteAccess({ req: { user: createMockUser('editor') } })).toBe(true);
      expect(mediaWriteAccess({ req: { user: createMockUser('admin') } })).toBe(true);
    });
  });
});

// ===========================================================================
// Collection Configuration Tests (AC-4, AC-5, AC-7)
// ===========================================================================

describe('Collection Configurations', () => {
  describe('Pages collection (AC-4)', () => {
    it('has correct slug', () => {
      expect(Pages.slug).toBe('pages');
    });

    it('uses title as admin display field', () => {
      expect(Pages.admin.useAsTitle).toBe('title');
    });

    it('has all required fields', () => {
      const fieldNames = Pages.fields.map((f) => f.name);
      expect(fieldNames).toContain('slug');
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('template');
      expect(fieldNames).toContain('content');
      expect(fieldNames).toContain('seoTitle');
      expect(fieldNames).toContain('seoDescription');
      expect(fieldNames).toContain('status');
      expect(fieldNames).toContain('publishedAt');
    });

    it('slug field is unique', () => {
      const slugField = Pages.fields.find((f) => f.name === 'slug');
      expect(slugField?.unique).toBe(true);
    });

    it('seoTitle has max length 60', () => {
      const field = Pages.fields.find((f) => f.name === 'seoTitle');
      expect(field?.maxLength).toBe(60);
    });

    it('seoDescription has max length 155', () => {
      const field = Pages.fields.find((f) => f.name === 'seoDescription');
      expect(field?.maxLength).toBe(155);
    });

    it('template field has all 8 options', () => {
      const field = Pages.fields.find((f) => f.name === 'template');
      expect(field?.options).toHaveLength(8);
      const values = (field?.options as Array<{ value: string }>)?.map((o) => o.value);
      expect(values).toContain('landing-page');
      expect(values).toContain('about');
      expect(values).toContain('services');
      expect(values).toContain('blog-post');
      expect(values).toContain('contact');
      expect(values).toContain('pricing');
      expect(values).toContain('terms-privacy');
      expect(values).toContain('404');
    });

    it('has versions with draft autosave (AC-7)', () => {
      expect(Pages.versions.drafts.autosave).toBe(true);
    });
  });

  describe('MediaAssets collection (AC-5)', () => {
    it('has correct slug', () => {
      expect(MediaAssets.slug).toBe('media-assets');
    });

    it('limits mime types to images only', () => {
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_MIME_TYPES).toContain('image/webp');
      expect(ALLOWED_MIME_TYPES).toContain('image/svg+xml');
      expect(ALLOWED_MIME_TYPES).toHaveLength(4);
    });

    it('has upload config with mimeTypes', () => {
      expect(MediaAssets.upload.mimeTypes).toEqual([...ALLOWED_MIME_TYPES]);
    });

    it('has alt text field', () => {
      const altField = MediaAssets.fields.find((f) => f.name === 'alt');
      expect(altField).toBeDefined();
      expect(altField?.type).toBe('text');
    });
  });
});

// ===========================================================================
// Webhook Stub Tests (AC-9)
// ===========================================================================

describe('Webhook on-publish', () => {
  const globalConfig = createMockGlobalConfig();

  it('triggers on publish (status changes to published)', async () => {
    const onBuildComplete = jest.fn();
    const hook = createOnPublishHook({
      globalConfig,
      outputDir: './output',
      onBuildComplete,
    });

    const result = await hook({
      doc: createMockPage({ status: 'published' }),
      previousDoc: createMockPage({ status: 'draft' }),
      operation: 'update',
    });

    expect(result.status).toBe('published');
    expect(onBuildComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSlug: 'about-us',
        template: 'about',
        outputDir: './output',
      }),
    );
  });

  it('does NOT trigger when status stays draft', async () => {
    const onBuildComplete = jest.fn();
    const hook = createOnPublishHook({
      globalConfig,
      outputDir: './output',
      onBuildComplete,
    });

    await hook({
      doc: createMockPage({ status: 'draft' }),
      previousDoc: createMockPage({ status: 'draft' }),
      operation: 'update',
    });

    expect(onBuildComplete).not.toHaveBeenCalled();
  });

  it('does NOT trigger when already published (no change)', async () => {
    const onBuildComplete = jest.fn();
    const hook = createOnPublishHook({
      globalConfig,
      outputDir: './output',
      onBuildComplete,
    });

    await hook({
      doc: createMockPage({ status: 'published' }),
      previousDoc: createMockPage({ status: 'published' }),
      operation: 'update',
    });

    expect(onBuildComplete).not.toHaveBeenCalled();
  });

  it('triggers on create with published status', async () => {
    const onBuildComplete = jest.fn();
    const hook = createOnPublishHook({
      globalConfig,
      outputDir: './output',
      onBuildComplete,
    });

    await hook({
      doc: createMockPage({ status: 'published' }),
      operation: 'create',
    });

    expect(onBuildComplete).toHaveBeenCalled();
  });

  it('works without onBuildComplete callback', async () => {
    const hook = createOnPublishHook({
      globalConfig,
      outputDir: './output',
    });

    // Should not throw
    const result = await hook({
      doc: createMockPage({ status: 'published' }),
      previousDoc: createMockPage({ status: 'draft' }),
      operation: 'update',
    });

    expect(result.status).toBe('published');
  });
});

// ===========================================================================
// Package Isolation Test (AC-1)
// ===========================================================================

describe('Package isolation', () => {
  it('index.ts contains opt-in warning comment', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const indexPath = path.resolve(__dirname, '..', 'index.ts');
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain('opt-in only');
    expect(content).toContain('Do not import from default static pipeline');
  });

  it('package.json declares payload as peerDependency', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const pkgPath = path.resolve(__dirname, '..', '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.peerDependencies['payload']).toBe('^3.0.0');
    expect(pkg.peerDependencies['next']).toBe('^15.0.0');
    expect(pkg.dependencies).toBeUndefined();
  });
});
