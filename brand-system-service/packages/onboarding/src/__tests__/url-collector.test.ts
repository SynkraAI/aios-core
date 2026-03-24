/**
 * Tests for Audit-Assisted URL Collection (BSS-7.2).
 *
 * Covers all acceptance criteria:
 * - AC-1: URL category support
 * - AC-2: HTTP format validation
 * - AC-3: Graceful incomplete input, min 1 URL, warning < 3
 * - AC-4: R2 persistence, ClickUp update
 * - AC-5: High-value category indicators
 * - AC-6: Add/remove URLs, duplicate detection
 * - AC-7: Post-submission preview
 * - AC-8: Per-URL metadata in audit-urls.json
 */

import {
  URLCollector,
  buildAuditUrlsR2Key,
  validateUrl,
  isValidCategory,
  isDuplicateUrl,
  validateCategoryLimit,
  validateCollection,
  URL_CATEGORIES,
  HIGH_VALUE_CATEGORIES,
  MAX_OTHER_URLS,
  MAX_LANDING_PAGE_URLS,
  MIN_URLS_REQUIRED,
  LOW_URL_WARNING_THRESHOLD,
  LOW_URL_WARNING_MESSAGE,
  DUPLICATE_URL_MESSAGE,
  CON18_DISCLAIMER,
  START_AUDIT_CTA_LABEL,
} from '../audit';

import type {
  URLCollectorDeps,
  AuditUrl,
  URLCategory,
} from '../audit';

import type {
  ClickUpClient,
  R2StorageClient,
} from '../types';

// ---------------------------------------------------------------------------
// Mock Factories
// ---------------------------------------------------------------------------

function createMockR2Client(): R2StorageClient {
  return {
    uploadJson: jest.fn().mockResolvedValue({ key: 'mock-key' }),
    uploadFile: jest.fn().mockResolvedValue({ key: 'mock-key' }),
    getJson: jest.fn().mockResolvedValue(null),
  };
}

function createMockClickUpClient(): ClickUpClient {
  return {
    createTask: jest.fn().mockResolvedValue({
      taskId: 'task-123',
      taskUrl: 'https://app.clickup.com/t/task-123',
    }),
    updateTask: jest.fn().mockResolvedValue({
      taskId: 'task-123',
      taskUrl: 'https://app.clickup.com/t/task-123',
    }),
  };
}

function createDeps(overrides?: Partial<URLCollectorDeps>): URLCollectorDeps {
  return {
    r2Client: createMockR2Client(),
    clickUpClient: createMockClickUpClient(),
    clickUpTaskId: 'task-123',
    ...overrides,
  };
}

function createCollectorWithUrls(
  urls: Array<{ url: string; category: string }>,
): { collector: URLCollector; deps: URLCollectorDeps } {
  const deps = createDeps();
  const collector = new URLCollector('acme-corp', deps);
  for (const { url, category } of urls) {
    collector.addUrl(url, category);
  }
  return { collector, deps };
}

// ---------------------------------------------------------------------------
// URL Validation Tests (AC-2)
// ---------------------------------------------------------------------------

describe('validateUrl', () => {
  it('accepts valid https URLs', () => {
    expect(validateUrl('https://example.com').valid).toBe(true);
    expect(validateUrl('https://www.example.com').valid).toBe(true);
    expect(validateUrl('https://sub.domain.co.uk').valid).toBe(true);
    expect(validateUrl('https://example.com/path/to/page').valid).toBe(true);
    expect(validateUrl('https://example.com/path?query=1').valid).toBe(true);
  });

  it('accepts valid http URLs', () => {
    expect(validateUrl('http://example.com').valid).toBe(true);
    expect(validateUrl('http://www.example.com').valid).toBe(true);
  });

  it('rejects empty URLs', () => {
    const result = validateUrl('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('rejects whitespace-only URLs', () => {
    const result = validateUrl('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('rejects URLs without protocol', () => {
    const result = validateUrl('example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('https:// or http://');
  });

  it('rejects URLs with ftp protocol', () => {
    const result = validateUrl('ftp://files.example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('https:// or http://');
  });

  it('rejects URLs without valid domain', () => {
    const result = validateUrl('https://');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('valid domain');
  });

  it('rejects URLs with single-label domain (no TLD)', () => {
    const result = validateUrl('https://localhost');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('valid domain');
  });

  it('rejects URLs with single-char TLD', () => {
    const result = validateUrl('https://example.c');
    expect(result.valid).toBe(false);
  });

  it('accepts URLs with 2-char TLD', () => {
    expect(validateUrl('https://example.co').valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Category Validation Tests
// ---------------------------------------------------------------------------

describe('isValidCategory', () => {
  it('accepts all defined URL categories', () => {
    for (const cat of URL_CATEGORIES) {
      expect(isValidCategory(cat)).toBe(true);
    }
  });

  it('rejects unknown categories', () => {
    expect(isValidCategory('unknown')).toBe(false);
    expect(isValidCategory('')).toBe(false);
    expect(isValidCategory('Website')).toBe(false); // case-sensitive
  });
});

// ---------------------------------------------------------------------------
// Duplicate Detection Tests (AC-6)
// ---------------------------------------------------------------------------

describe('isDuplicateUrl', () => {
  const existingUrls: AuditUrl[] = [
    {
      url: 'https://example.com',
      category: 'website',
      submitted_at: '2026-03-23T10:00:00.000Z',
      validated: false,
    },
    {
      url: 'https://instagram.com/brand',
      category: 'instagram',
      submitted_at: '2026-03-23T10:01:00.000Z',
      validated: false,
    },
  ];

  it('detects exact duplicate URLs', () => {
    expect(isDuplicateUrl('https://example.com', existingUrls)).toBe(true);
  });

  it('detects case-insensitive duplicates', () => {
    expect(isDuplicateUrl('https://EXAMPLE.COM', existingUrls)).toBe(true);
  });

  it('trims whitespace for comparison', () => {
    expect(isDuplicateUrl('  https://example.com  ', existingUrls)).toBe(true);
  });

  it('does not flag different URLs as duplicates', () => {
    expect(isDuplicateUrl('https://different.com', existingUrls)).toBe(false);
  });

  it('returns false on empty collection', () => {
    expect(isDuplicateUrl('https://example.com', [])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Category Limit Tests
// ---------------------------------------------------------------------------

describe('validateCategoryLimit', () => {
  it('allows first entry for any single-entry category', () => {
    const result = validateCategoryLimit('website', []);
    expect(result.valid).toBe(true);
  });

  it('rejects second entry for single-entry categories', () => {
    const existing: AuditUrl[] = [
      {
        url: 'https://example.com',
        category: 'website',
        submitted_at: '2026-03-23T10:00:00.000Z',
        validated: false,
      },
    ];
    const result = validateCategoryLimit('website', existing);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Only one URL');
  });

  it('allows multiple landing page URLs up to limit', () => {
    const existing: AuditUrl[] = Array.from({ length: MAX_LANDING_PAGE_URLS - 1 }, (_, i) => ({
      url: `https://landing${i}.example.com`,
      category: 'landing_page' as URLCategory,
      submitted_at: '2026-03-23T10:00:00.000Z',
      validated: false,
    }));
    const result = validateCategoryLimit('landing_page', existing);
    expect(result.valid).toBe(true);
  });

  it('rejects landing page URLs exceeding limit', () => {
    const existing: AuditUrl[] = Array.from({ length: MAX_LANDING_PAGE_URLS }, (_, i) => ({
      url: `https://landing${i}.example.com`,
      category: 'landing_page' as URLCategory,
      submitted_at: '2026-03-23T10:00:00.000Z',
      validated: false,
    }));
    const result = validateCategoryLimit('landing_page', existing);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(`${MAX_LANDING_PAGE_URLS}`);
  });

  it('allows up to MAX_OTHER_URLS for "other" category', () => {
    const existing: AuditUrl[] = Array.from({ length: MAX_OTHER_URLS - 1 }, (_, i) => ({
      url: `https://other${i}.example.com`,
      category: 'other' as URLCategory,
      submitted_at: '2026-03-23T10:00:00.000Z',
      validated: false,
    }));
    const result = validateCategoryLimit('other', existing);
    expect(result.valid).toBe(true);
  });

  it('rejects "other" URLs exceeding MAX_OTHER_URLS', () => {
    const existing: AuditUrl[] = Array.from({ length: MAX_OTHER_URLS }, (_, i) => ({
      url: `https://other${i}.example.com`,
      category: 'other' as URLCategory,
      submitted_at: '2026-03-23T10:00:00.000Z',
      validated: false,
    }));
    const result = validateCategoryLimit('other', existing);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(`${MAX_OTHER_URLS}`);
  });
});

// ---------------------------------------------------------------------------
// Collection Validation Tests (AC-3)
// ---------------------------------------------------------------------------

describe('validateCollection', () => {
  it('rejects empty collection', () => {
    const result = validateCollection([]);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('At least');
  });

  it('passes with 1 valid URL', () => {
    const urls: AuditUrl[] = [
      {
        url: 'https://example.com',
        category: 'website',
        submitted_at: '2026-03-23T10:00:00.000Z',
        validated: false,
      },
    ];
    const result = validateCollection(urls);
    expect(result.valid).toBe(true);
  });

  it('warns when fewer than 3 URLs', () => {
    const urls: AuditUrl[] = [
      {
        url: 'https://example.com',
        category: 'website',
        submitted_at: '2026-03-23T10:00:00.000Z',
        validated: false,
      },
      {
        url: 'https://instagram.com/brand',
        category: 'instagram',
        submitted_at: '2026-03-23T10:01:00.000Z',
        validated: false,
      },
    ];
    const result = validateCollection(urls);
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toBe(LOW_URL_WARNING_MESSAGE);
  });

  it('no warning when 3 or more URLs', () => {
    const urls: AuditUrl[] = [
      {
        url: 'https://example.com',
        category: 'website',
        submitted_at: '2026-03-23T10:00:00.000Z',
        validated: false,
      },
      {
        url: 'https://instagram.com/brand',
        category: 'instagram',
        submitted_at: '2026-03-23T10:01:00.000Z',
        validated: false,
      },
      {
        url: 'https://linkedin.com/company/brand',
        category: 'linkedin_company',
        submitted_at: '2026-03-23T10:02:00.000Z',
        validated: false,
      },
    ];
    const result = validateCollection(urls);
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('catches invalid URLs in collection', () => {
    const urls: AuditUrl[] = [
      {
        url: 'not-a-url',
        category: 'website',
        submitted_at: '2026-03-23T10:00:00.000Z',
        validated: false,
      },
    ];
    const result = validateCollection(urls);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Invalid URL'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// R2 Key Construction Tests
// ---------------------------------------------------------------------------

describe('buildAuditUrlsR2Key', () => {
  it('builds correct R2 key for client', () => {
    expect(buildAuditUrlsR2Key('acme-corp')).toBe(
      'brand-assets/acme-corp/onboarding/audit-urls.json',
    );
  });

  it('builds key with complex client ID', () => {
    expect(buildAuditUrlsR2Key('client-123-abc')).toBe(
      'brand-assets/client-123-abc/onboarding/audit-urls.json',
    );
  });
});

// ---------------------------------------------------------------------------
// URLCollector Class Tests
// ---------------------------------------------------------------------------

describe('URLCollector', () => {
  describe('constructor', () => {
    it('creates instance with valid client ID', () => {
      const collector = new URLCollector('acme', createDeps());
      expect(collector.getUrlCount()).toBe(0);
      expect(collector.isSubmitted()).toBe(false);
    });

    it('throws on empty client ID', () => {
      expect(() => new URLCollector('', createDeps())).toThrow('Client ID is required');
    });

    it('throws on whitespace-only client ID', () => {
      expect(() => new URLCollector('   ', createDeps())).toThrow('Client ID is required');
    });
  });

  describe('addUrl (AC-1, AC-2, AC-5, AC-6)', () => {
    it('adds a valid URL', () => {
      const collector = new URLCollector('acme', createDeps());
      const result = collector.addUrl('https://example.com', 'website');

      expect(result.valid).toBe(true);
      expect(collector.getUrlCount()).toBe(1);
    });

    it('adds URLs across all categories (AC-1)', () => {
      const collector = new URLCollector('acme', createDeps());
      // Map categories to valid domain-friendly URL strings
      const categoryUrls: Record<string, string> = {
        website: 'https://acme-website.example.com',
        youtube: 'https://youtube.com/c/acme',
        linkedin_company: 'https://linkedin.com/company/acme',
        linkedin_personal: 'https://linkedin.com/in/john-doe',
        instagram: 'https://instagram.com/acme',
        facebook: 'https://facebook.com/acme',
        tiktok: 'https://tiktok.com/@acme',
        twitter: 'https://x.com/acme',
      };

      for (const [category, url] of Object.entries(categoryUrls)) {
        const result = collector.addUrl(url, category);
        expect(result.valid).toBe(true);
      }

      expect(collector.getUrlCount()).toBe(Object.keys(categoryUrls).length);
    });

    it('rejects invalid URL format (AC-2)', () => {
      const collector = new URLCollector('acme', createDeps());
      const result = collector.addUrl('not-a-url', 'website');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(collector.getUrlCount()).toBe(0);
    });

    it('rejects unknown category', () => {
      const collector = new URLCollector('acme', createDeps());
      const result = collector.addUrl('https://example.com', 'unknown-category');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unknown URL category');
    });

    it('rejects duplicate URL (AC-6)', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://example.com', 'website');
      const result = collector.addUrl('https://example.com', 'landing_page');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(DUPLICATE_URL_MESSAGE);
      expect(collector.getUrlCount()).toBe(1);
    });

    it('rejects duplicate URL case-insensitive (AC-6)', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://example.com', 'website');
      const result = collector.addUrl('https://EXAMPLE.COM', 'landing_page');

      expect(result.valid).toBe(false);
      expect(result.error).toBe(DUPLICATE_URL_MESSAGE);
    });

    it('rejects second entry for single-entry categories', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://example.com', 'website');
      const result = collector.addUrl('https://other-site.com', 'website');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Only one URL');
    });

    it('allows multiple landing page entries', () => {
      const collector = new URLCollector('acme', createDeps());
      const r1 = collector.addUrl('https://landing1.example.com', 'landing_page');
      const r2 = collector.addUrl('https://landing2.example.com', 'landing_page');

      expect(r1.valid).toBe(true);
      expect(r2.valid).toBe(true);
      expect(collector.getUrlCount()).toBe(2);
    });

    it('allows up to MAX_OTHER_URLS in "other" category', () => {
      const collector = new URLCollector('acme', createDeps());
      for (let i = 0; i < MAX_OTHER_URLS; i++) {
        const result = collector.addUrl(`https://other${i}.example.com`, 'other');
        expect(result.valid).toBe(true);
      }
      const overLimit = collector.addUrl('https://toomany.example.com', 'other');
      expect(overLimit.valid).toBe(false);
    });

    it('rejects adding after submission', async () => {
      const { collector } = createCollectorWithUrls([
        { url: 'https://example.com', category: 'website' },
      ]);
      await collector.submit();

      const result = collector.addUrl('https://new.example.com', 'landing_page');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('already been submitted');
    });

    it('stores correct metadata per URL (AC-8)', () => {
      const collector = new URLCollector('acme', createDeps());
      const beforeAdd = new Date().toISOString();
      collector.addUrl('https://example.com', 'website');
      const afterAdd = new Date().toISOString();

      const urls = collector.getUrls();
      expect(urls).toHaveLength(1);
      expect(urls[0]).toMatchObject({
        url: 'https://example.com',
        category: 'website',
        validated: false,
      });
      // submitted_at should be between beforeAdd and afterAdd
      expect(urls[0].submitted_at >= beforeAdd).toBe(true);
      expect(urls[0].submitted_at <= afterAdd).toBe(true);
    });

    it('trims whitespace from URLs', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('  https://example.com  ', 'website');

      const urls = collector.getUrls();
      expect(urls[0].url).toBe('https://example.com');
    });
  });

  describe('removeUrl (AC-6)', () => {
    it('removes an existing URL', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://example.com', 'website');
      collector.addUrl('https://instagram.com/brand', 'instagram');

      const removed = collector.removeUrl('https://example.com');
      expect(removed).toBe(true);
      expect(collector.getUrlCount()).toBe(1);
      expect(collector.getUrls()[0].category).toBe('instagram');
    });

    it('removes case-insensitive', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://example.com', 'website');

      const removed = collector.removeUrl('https://EXAMPLE.COM');
      expect(removed).toBe(true);
      expect(collector.getUrlCount()).toBe(0);
    });

    it('returns false for non-existent URL', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://example.com', 'website');

      const removed = collector.removeUrl('https://nonexistent.com');
      expect(removed).toBe(false);
      expect(collector.getUrlCount()).toBe(1);
    });

    it('returns false after submission', async () => {
      const { collector } = createCollectorWithUrls([
        { url: 'https://example.com', category: 'website' },
      ]);
      await collector.submit();

      const removed = collector.removeUrl('https://example.com');
      expect(removed).toBe(false);
    });
  });

  describe('removeUrlByIndex', () => {
    it('removes URL at valid index', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://a.example.com', 'website');
      collector.addUrl('https://b.example.com', 'instagram');

      expect(collector.removeUrlByIndex(0)).toBe(true);
      expect(collector.getUrlCount()).toBe(1);
      expect(collector.getUrls()[0].url).toBe('https://b.example.com');
    });

    it('returns false for out-of-range index', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://example.com', 'website');

      expect(collector.removeUrlByIndex(-1)).toBe(false);
      expect(collector.removeUrlByIndex(5)).toBe(false);
    });
  });

  describe('isHighValueCategory (AC-5)', () => {
    it('marks website as high-value', () => {
      const collector = new URLCollector('acme', createDeps());
      expect(collector.isHighValueCategory('website')).toBe(true);
    });

    it('marks linkedin_company as high-value', () => {
      const collector = new URLCollector('acme', createDeps());
      expect(collector.isHighValueCategory('linkedin_company')).toBe(true);
    });

    it('marks linkedin_personal as high-value', () => {
      const collector = new URLCollector('acme', createDeps());
      expect(collector.isHighValueCategory('linkedin_personal')).toBe(true);
    });

    it('marks instagram as high-value', () => {
      const collector = new URLCollector('acme', createDeps());
      expect(collector.isHighValueCategory('instagram')).toBe(true);
    });

    it('does not mark youtube as high-value', () => {
      const collector = new URLCollector('acme', createDeps());
      expect(collector.isHighValueCategory('youtube')).toBe(false);
    });

    it('does not mark tiktok as high-value', () => {
      const collector = new URLCollector('acme', createDeps());
      expect(collector.isHighValueCategory('tiktok')).toBe(false);
    });
  });

  describe('validate (AC-3)', () => {
    it('fails with no URLs', () => {
      const collector = new URLCollector('acme', createDeps());
      const result = collector.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('warns with 1 URL (fewer than 3)', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://example.com', 'website');

      const result = collector.validate();
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toBe(LOW_URL_WARNING_MESSAGE);
    });

    it('warns with 2 URLs (fewer than 3)', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://example.com', 'website');
      collector.addUrl('https://instagram.com/brand', 'instagram');

      const result = collector.validate();
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
    });

    it('no warning with 3+ URLs', () => {
      const { collector } = createCollectorWithUrls([
        { url: 'https://example.com', category: 'website' },
        { url: 'https://instagram.com/brand', category: 'instagram' },
        { url: 'https://linkedin.com/company/brand', category: 'linkedin_company' },
      ]);

      const result = collector.validate();
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('getCategoryStatus', () => {
    it('returns all categories with entry counts', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://example.com', 'website');
      collector.addUrl('https://instagram.com/brand', 'instagram');

      const status = collector.getCategoryStatus();
      expect(status).toHaveLength(URL_CATEGORIES.length);

      const websiteStatus = status.find((s) => s.category === 'website');
      expect(websiteStatus).toEqual({
        category: 'website',
        highValue: true,
        entryCount: 1,
      });

      const youtubeStatus = status.find((s) => s.category === 'youtube');
      expect(youtubeStatus).toEqual({
        category: 'youtube',
        highValue: false,
        entryCount: 0,
      });
    });
  });

  describe('getUrlsByCategory (AC-7)', () => {
    it('groups URLs by category', () => {
      const collector = new URLCollector('acme', createDeps());
      collector.addUrl('https://example.com', 'website');
      collector.addUrl('https://landing1.example.com', 'landing_page');
      collector.addUrl('https://landing2.example.com', 'landing_page');
      collector.addUrl('https://instagram.com/brand', 'instagram');

      const grouped = collector.getUrlsByCategory();
      expect(grouped.size).toBe(3);
      expect(grouped.get('website')).toHaveLength(1);
      expect(grouped.get('landing_page')).toHaveLength(2);
      expect(grouped.get('instagram')).toHaveLength(1);
      expect(grouped.has('youtube')).toBe(false);
    });
  });

  describe('submit (AC-4, AC-8)', () => {
    it('persists audit-urls.json to R2', async () => {
      const deps = createDeps();
      const collector = new URLCollector('acme-corp', deps);
      collector.addUrl('https://example.com', 'website');
      collector.addUrl('https://instagram.com/brand', 'instagram');

      const result = await collector.submit();

      expect(result.success).toBe(true);
      expect(result.clientId).toBe('acme-corp');
      expect(result.r2Key).toBe('brand-assets/acme-corp/onboarding/audit-urls.json');
      expect(result.urlCount).toBe(2);
      expect(result.auditUrls).toHaveLength(2);

      // Verify R2 upload called with correct key
      expect(deps.r2Client.uploadJson).toHaveBeenCalledWith(
        'brand-assets/acme-corp/onboarding/audit-urls.json',
        expect.objectContaining({
          version: '1.0',
          clientId: 'acme-corp',
          urls: expect.arrayContaining([
            expect.objectContaining({
              url: 'https://example.com',
              category: 'website',
              validated: false,
            }),
          ]),
          metadata: expect.objectContaining({
            totalUrls: 2,
            highValueCount: 2, // website + instagram are both high-value
          }),
        }),
      );
    });

    it('includes per-URL metadata in persisted document (AC-8)', async () => {
      const deps = createDeps();
      const collector = new URLCollector('acme', deps);
      collector.addUrl('https://example.com', 'website');

      await collector.submit();

      const uploadCall = (deps.r2Client.uploadJson as jest.Mock).mock.calls[0];
      const document = uploadCall[1];

      expect(document.urls[0]).toMatchObject({
        url: 'https://example.com',
        category: 'website',
        validated: false,
      });
      expect(typeof document.urls[0].submitted_at).toBe('string');
      // Check ISO 8601 format
      expect(new Date(document.urls[0].submitted_at).toISOString()).toBe(
        document.urls[0].submitted_at,
      );
    });

    it('includes category counts in metadata (AC-8)', async () => {
      const deps = createDeps();
      const collector = new URLCollector('acme', deps);
      collector.addUrl('https://example.com', 'website');
      collector.addUrl('https://landing1.example.com', 'landing_page');
      collector.addUrl('https://landing2.example.com', 'landing_page');

      await collector.submit();

      const uploadCall = (deps.r2Client.uploadJson as jest.Mock).mock.calls[0];
      const document = uploadCall[1];

      expect(document.metadata.categoryCounts).toEqual({
        website: 1,
        landing_page: 2,
      });
    });

    it('updates ClickUp task on submit (AC-4)', async () => {
      const deps = createDeps();
      const collector = new URLCollector('acme', deps);
      collector.addUrl('https://example.com', 'website');

      const result = await collector.submit();

      expect(deps.clickUpClient!.updateTask).toHaveBeenCalledWith(
        'task-123',
        expect.objectContaining({
          description: expect.stringContaining('https://example.com'),
        }),
      );
      expect(result.clickUpTaskId).toBe('task-123');
      expect(result.clickUpTaskUrl).toBe('https://app.clickup.com/t/task-123');
    });

    it('succeeds even if ClickUp update fails (non-critical)', async () => {
      const deps = createDeps();
      (deps.clickUpClient!.updateTask as jest.Mock).mockRejectedValue(
        new Error('ClickUp API error'),
      );

      const collector = new URLCollector('acme', deps);
      collector.addUrl('https://example.com', 'website');

      // Should not throw
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = await collector.submit();
      consoleSpy.mockRestore();

      expect(result.success).toBe(true);
      expect(result.clickUpTaskId).toBeUndefined();
    });

    it('works without ClickUp client', async () => {
      const deps = createDeps({
        clickUpClient: undefined,
        clickUpTaskId: undefined,
      });
      const collector = new URLCollector('acme', deps);
      collector.addUrl('https://example.com', 'website');

      const result = await collector.submit();

      expect(result.success).toBe(true);
      expect(result.clickUpTaskId).toBeUndefined();
    });

    it('throws on R2 upload failure', async () => {
      const deps = createDeps();
      (deps.r2Client.uploadJson as jest.Mock).mockRejectedValue(
        new Error('R2 connection failed'),
      );

      const collector = new URLCollector('acme', deps);
      collector.addUrl('https://example.com', 'website');

      await expect(collector.submit()).rejects.toThrow(
        'Failed to persist audit URLs to R2: R2 connection failed',
      );
    });

    it('throws on submission with 0 URLs (AC-3)', async () => {
      const collector = new URLCollector('acme', createDeps());

      await expect(collector.submit()).rejects.toThrow('Collection validation failed');
    });

    it('throws on double submission', async () => {
      const { collector } = createCollectorWithUrls([
        { url: 'https://example.com', category: 'website' },
      ]);

      await collector.submit();
      await expect(collector.submit()).rejects.toThrow('already been submitted');
    });

    it('marks collector as submitted after success', async () => {
      const { collector } = createCollectorWithUrls([
        { url: 'https://example.com', category: 'website' },
      ]);

      expect(collector.isSubmitted()).toBe(false);
      await collector.submit();
      expect(collector.isSubmitted()).toBe(true);
    });
  });

  describe('getSubmissionPreview (AC-7)', () => {
    it('returns preview with grouped URLs', () => {
      const { collector } = createCollectorWithUrls([
        { url: 'https://example.com', category: 'website' },
        { url: 'https://instagram.com/brand', category: 'instagram' },
        { url: 'https://youtube.com/c/brand', category: 'youtube' },
      ]);

      const preview = collector.getSubmissionPreview();

      expect(preview.totalCount).toBe(3);
      expect(preview.highValueCount).toBe(2); // website + instagram
      expect(preview.grouped.size).toBe(3);
      expect(preview.canStartAudit).toBe(false); // not submitted yet
      expect(preview.validation.valid).toBe(true);
      expect(preview.validation.warnings).toHaveLength(0);
    });

    it('canStartAudit is true only after submission', async () => {
      const { collector } = createCollectorWithUrls([
        { url: 'https://example.com', category: 'website' },
      ]);

      expect(collector.getSubmissionPreview().canStartAudit).toBe(false);

      await collector.submit();

      expect(collector.getSubmissionPreview().canStartAudit).toBe(true);
    });

    it('includes validation warnings in preview', () => {
      const { collector } = createCollectorWithUrls([
        { url: 'https://example.com', category: 'website' },
      ]);

      const preview = collector.getSubmissionPreview();
      expect(preview.validation.warnings).toHaveLength(1);
      expect(preview.validation.warnings[0]).toBe(LOW_URL_WARNING_MESSAGE);
    });
  });
});

// ---------------------------------------------------------------------------
// Constants Tests
// ---------------------------------------------------------------------------

describe('Constants', () => {
  it('HIGH_VALUE_CATEGORIES matches story AC-5', () => {
    expect(HIGH_VALUE_CATEGORIES).toContain('website');
    expect(HIGH_VALUE_CATEGORIES).toContain('linkedin_company');
    expect(HIGH_VALUE_CATEGORIES).toContain('linkedin_personal');
    expect(HIGH_VALUE_CATEGORIES).toContain('instagram');
  });

  it('URL_CATEGORIES covers all required categories (AC-1)', () => {
    const required = [
      'website',
      'landing_page',
      'youtube',
      'linkedin_company',
      'linkedin_personal',
      'instagram',
      'facebook',
      'tiktok',
      'twitter',
      'other',
    ];
    for (const cat of required) {
      expect(URL_CATEGORIES).toContain(cat);
    }
  });

  it('MIN_URLS_REQUIRED is 1 (AC-3)', () => {
    expect(MIN_URLS_REQUIRED).toBe(1);
  });

  it('LOW_URL_WARNING_THRESHOLD is 3 (AC-3)', () => {
    expect(LOW_URL_WARNING_THRESHOLD).toBe(3);
  });

  it('CON18_DISCLAIMER contains required text', () => {
    expect(CON18_DISCLAIMER).toContain('publicly accessible');
  });

  it('START_AUDIT_CTA_LABEL avoids "replace" or "skip" per CON-17', () => {
    expect(START_AUDIT_CTA_LABEL).toBe('Start Digital Presence Analysis');
    expect(START_AUDIT_CTA_LABEL).not.toContain('replace');
    expect(START_AUDIT_CTA_LABEL).not.toContain('skip');
  });
});
