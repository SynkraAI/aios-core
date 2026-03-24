/**
 * Tests for Automated Digital Presence Audit (BSS-7.3).
 *
 * Covers all acceptance criteria:
 * - AC-1: Process audit-urls.json, handle inaccessible gracefully
 * - AC-2: Per-URL extraction (title, meta, headings, colors, fonts, imagery)
 * - AC-3: Tone of voice analysis
 * - AC-4: Messaging consistency analysis
 * - AC-5: Visual consistency analysis
 * - AC-6: Improvement opportunities (3-5 gaps)
 * - AC-7: Competitive gap assessment (with/without competitor URLs)
 * - AC-8: Confidence levels per inference
 * - AC-9: Store audit-report.json in R2, post ClickUp summary
 * - AC-10: Polling endpoint for status
 */

import { AuditPipeline, buildAuditReportR2Key } from '../audit/audit-pipeline';
import {
  PageFetcher,
  extractTitle,
  extractMetaDescription,
  extractHeadings,
  extractColors,
  extractFonts,
  extractTextContent,
  parseRobotsTxtAllows,
  isAllowedByRobotsTxt,
} from '../audit/page-fetcher';
import { ToneAnalyzer, calculateToneConfidence } from '../audit/tone-analyzer';
import { MessagingAnalyzer, calculateMessagingConfidence } from '../audit/messaging-analyzer';
import {
  VisualAnalyzer,
  clusterColors,
  assessTypography,
  calculateVisualConfidence,
} from '../audit/visual-analyzer';
import { CompetitiveAnalyzer } from '../audit/competitive-analyzer';

import type {
  HttpFetcher,
  FetchResult,
  AuditAIService,
  AuditAIResponse,
  AuditR2Client,
  AuditClickUpClient,
  AuditPipelineDeps,
  PageAnalysis,
  AuditLogger,
} from '../audit/audit-types';

import type { AuditUrl } from '../audit/types';

// ---------------------------------------------------------------------------
// Mock Factories
// ---------------------------------------------------------------------------

function createMockFetchResult(overrides?: Partial<FetchResult>): FetchResult {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'text/html' },
    text: jest.fn().mockResolvedValue('<html><head><title>Test Page</title></head><body><h1>Hello</h1></body></html>'),
    ...overrides,
  };
}

function createMockHttpFetcher(overrides?: Partial<HttpFetcher>): HttpFetcher {
  return {
    fetch: jest.fn().mockResolvedValue(createMockFetchResult()),
    ...overrides,
  };
}

function createMockAIService(responseText?: string): AuditAIService {
  return {
    generateText: jest.fn().mockResolvedValue({
      text: responseText ?? '{}',
    } as AuditAIResponse),
  };
}

function createMockR2Client(): AuditR2Client {
  return {
    uploadJson: jest.fn().mockResolvedValue({ key: 'mock-key' }),
  };
}

function createMockClickUpClient(): AuditClickUpClient {
  return {
    postComment: jest.fn().mockResolvedValue(undefined),
  };
}

function createMockLogger(): AuditLogger {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

function createPipelineDeps(overrides?: Partial<AuditPipelineDeps>): AuditPipelineDeps {
  return {
    httpFetcher: createMockHttpFetcher(),
    aiService: createMockAIService(),
    r2Client: createMockR2Client(),
    clickUpClient: createMockClickUpClient(),
    clickUpTaskId: 'task-abc',
    logger: createMockLogger(),
    ...overrides,
  };
}

function createSampleAuditUrls(count: number = 3): AuditUrl[] {
  return Array.from({ length: count }, (_, i) => ({
    url: `https://example-${i}.com`,
    category: 'website' as const,
    submitted_at: '2026-03-23T10:00:00.000Z',
    validated: false,
  }));
}

function createSamplePageAnalysis(overrides?: Partial<PageAnalysis>): PageAnalysis {
  return {
    url: 'https://example.com',
    accessible: true,
    title: 'Example Page',
    metaDescription: 'A test page',
    headings: [{ level: 1, text: 'Welcome' }],
    dominantColors: ['#ff0000', '#00ff00', '#0000ff'],
    fontNames: ['Roboto', 'Arial'],
    imageryDescriptions: [],
    textContent: 'Welcome to our website. We provide excellent services for businesses.',
    fetchedAt: '2026-03-23T10:00:00.000Z',
    ...overrides,
  };
}

const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Acme Corp - Building the Future</title>
  <meta name="description" content="Acme Corp provides innovative solutions for modern businesses.">
  <style>
    body { font-family: 'Inter', 'Roboto', sans-serif; color: #333333; background: #ffffff; }
    h1 { color: #1a73e8; }
    .cta { background-color: rgb(26, 115, 232); color: #fff; }
    .accent { color: #ff6b35; }
  </style>
</head>
<body>
  <h1>Welcome to Acme Corp</h1>
  <h2>Our Services</h2>
  <h3>Cloud Solutions</h3>
  <p>We build amazing things for our clients. Our team of experts delivers excellence.</p>
  <h2>Why Choose Us</h2>
  <h3>Innovation First</h3>
  <script>console.log('should be stripped');</script>
</body>
</html>
`;

// ---------------------------------------------------------------------------
// HTML Content Extraction Tests (AC-2)
// ---------------------------------------------------------------------------

describe('HTML Content Extraction (AC-2)', () => {
  describe('extractTitle', () => {
    it('extracts page title from HTML', () => {
      expect(extractTitle(SAMPLE_HTML)).toBe('Acme Corp - Building the Future');
    });

    it('returns undefined when no title tag', () => {
      expect(extractTitle('<html><body>No title</body></html>')).toBeUndefined();
    });

    it('trims whitespace from title', () => {
      expect(extractTitle('<title>  Spaced Title  </title>')).toBe('Spaced Title');
    });
  });

  describe('extractMetaDescription', () => {
    it('extracts meta description', () => {
      expect(extractMetaDescription(SAMPLE_HTML)).toBe(
        'Acme Corp provides innovative solutions for modern businesses.',
      );
    });

    it('returns undefined when no meta description', () => {
      expect(extractMetaDescription('<html><head></head></html>')).toBeUndefined();
    });

    it('handles content-first attribute order', () => {
      const html = '<meta content="Reversed order" name="description">';
      expect(extractMetaDescription(html)).toBe('Reversed order');
    });
  });

  describe('extractHeadings', () => {
    it('extracts H1-H3 headings', () => {
      const headings = extractHeadings(SAMPLE_HTML);
      expect(headings).toHaveLength(5);
      expect(headings[0]).toEqual({ level: 1, text: 'Welcome to Acme Corp' });
      expect(headings[1]).toEqual({ level: 2, text: 'Our Services' });
      expect(headings[2]).toEqual({ level: 3, text: 'Cloud Solutions' });
      expect(headings[3]).toEqual({ level: 2, text: 'Why Choose Us' });
      expect(headings[4]).toEqual({ level: 3, text: 'Innovation First' });
    });

    it('strips HTML tags from heading content', () => {
      const html = '<h1><span class="bold">Styled</span> Heading</h1>';
      const headings = extractHeadings(html);
      expect(headings[0].text).toBe('Styled Heading');
    });

    it('ignores H4-H6 headings', () => {
      const html = '<h4>Not extracted</h4><h5>Also ignored</h5>';
      expect(extractHeadings(html)).toHaveLength(0);
    });
  });

  describe('extractColors', () => {
    it('extracts hex colors', () => {
      const colors = extractColors(SAMPLE_HTML);
      expect(colors).toContain('#333333');
      expect(colors).toContain('#ffffff');
      expect(colors).toContain('#1a73e8');
      expect(colors).toContain('#ff6b35');
    });

    it('normalizes 3-digit hex to 6-digit', () => {
      const html = 'color: #f00; background: #0af;';
      const colors = extractColors(html);
      expect(colors).toContain('#ff0000');
      expect(colors).toContain('#00aaff');
    });

    it('extracts rgb colors as hex', () => {
      const colors = extractColors(SAMPLE_HTML);
      // rgb(26, 115, 232) should be converted
      expect(colors).toContain('#1a73e8');
    });
  });

  describe('extractFonts', () => {
    it('extracts font names from font-family', () => {
      const fonts = extractFonts(SAMPLE_HTML);
      expect(fonts).toContain('Inter');
      expect(fonts).toContain('Roboto');
    });

    it('filters out generic font families', () => {
      const fonts = extractFonts(SAMPLE_HTML);
      expect(fonts).not.toContain('sans-serif');
    });

    it('handles quoted font names', () => {
      const html = "font-family: 'Open Sans', \"Helvetica Neue\", serif;";
      const fonts = extractFonts(html);
      expect(fonts).toContain('Open Sans');
      expect(fonts).toContain('Helvetica Neue');
    });
  });

  describe('extractTextContent', () => {
    it('extracts visible text', () => {
      const text = extractTextContent(SAMPLE_HTML);
      expect(text).toContain('Welcome to Acme Corp');
      expect(text).toContain('We build amazing things');
    });

    it('strips script content', () => {
      const text = extractTextContent(SAMPLE_HTML);
      expect(text).not.toContain('console.log');
      expect(text).not.toContain('should be stripped');
    });

    it('strips style content', () => {
      const text = extractTextContent(SAMPLE_HTML);
      expect(text).not.toContain('font-family');
    });

    it('decodes HTML entities', () => {
      const html = '<p>Hello &amp; welcome &lt;world&gt;</p>';
      const text = extractTextContent(html);
      expect(text).toContain('Hello & welcome <world>');
    });
  });
});

// ---------------------------------------------------------------------------
// robots.txt Tests (NFR-9.9)
// ---------------------------------------------------------------------------

describe('robots.txt Compliance (NFR-9.9)', () => {
  describe('parseRobotsTxtAllows', () => {
    it('allows when no Disallow rules for wildcard agent', () => {
      const robots = 'User-agent: *\nAllow: /';
      expect(parseRobotsTxtAllows(robots, '/page')).toBe(true);
    });

    it('blocks when Disallow: / for wildcard agent', () => {
      const robots = 'User-agent: *\nDisallow: /';
      expect(parseRobotsTxtAllows(robots, '/page')).toBe(false);
    });

    it('blocks specific path', () => {
      const robots = 'User-agent: *\nDisallow: /private/';
      expect(parseRobotsTxtAllows(robots, '/private/page')).toBe(false);
      expect(parseRobotsTxtAllows(robots, '/public/page')).toBe(true);
    });

    it('allows when only non-wildcard agents are restricted', () => {
      const robots = 'User-agent: Googlebot\nDisallow: /';
      expect(parseRobotsTxtAllows(robots, '/page')).toBe(true);
    });
  });

  describe('isAllowedByRobotsTxt', () => {
    it('allows when robots.txt is not accessible (404)', async () => {
      const fetcher = createMockHttpFetcher({
        fetch: jest.fn().mockResolvedValue(
          createMockFetchResult({ ok: false, status: 404, statusText: 'Not Found' }),
        ),
      });

      const allowed = await isAllowedByRobotsTxt('https://example.com/page', fetcher);
      expect(allowed).toBe(true);
    });

    it('blocks when robots.txt disallows path', async () => {
      const fetcher = createMockHttpFetcher({
        fetch: jest.fn().mockResolvedValue(
          createMockFetchResult({
            ok: true,
            text: jest.fn().mockResolvedValue('User-agent: *\nDisallow: /'),
          }),
        ),
      });

      const allowed = await isAllowedByRobotsTxt('https://example.com/page', fetcher);
      expect(allowed).toBe(false);
    });

    it('allows when fetch throws (graceful degradation)', async () => {
      const fetcher = createMockHttpFetcher({
        fetch: jest.fn().mockRejectedValue(new Error('Network error')),
      });

      const allowed = await isAllowedByRobotsTxt('https://example.com/page', fetcher);
      expect(allowed).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// PageFetcher Tests (AC-1, AC-2)
// ---------------------------------------------------------------------------

describe('PageFetcher (AC-1, AC-2)', () => {
  it('fetches and analyzes an accessible URL', async () => {
    const fetcher = createMockHttpFetcher({
      fetch: jest.fn()
        // First call: robots.txt check
        .mockResolvedValueOnce(createMockFetchResult({ ok: false, status: 404, statusText: 'Not Found' }))
        // Second call: actual page
        .mockResolvedValueOnce(
          createMockFetchResult({
            text: jest.fn().mockResolvedValue(SAMPLE_HTML),
          }),
        ),
    });

    const pageFetcher = new PageFetcher(fetcher);
    const result = await pageFetcher.fetchAndAnalyze('https://example.com');

    expect(result.accessible).toBe(true);
    expect(result.title).toBe('Acme Corp - Building the Future');
    expect(result.headings.length).toBeGreaterThan(0);
    expect(result.dominantColors.length).toBeGreaterThan(0);
    expect(result.fontNames.length).toBeGreaterThan(0);
    expect(result.textContent).toContain('Welcome to Acme Corp');
  });

  it('handles inaccessible URLs gracefully (AC-1)', async () => {
    const fetcher = createMockHttpFetcher({
      fetch: jest.fn()
        .mockResolvedValueOnce(createMockFetchResult({ ok: false, status: 404, statusText: 'Not Found' }))
        .mockResolvedValueOnce(
          createMockFetchResult({
            ok: false,
            status: 403,
            statusText: 'Forbidden',
          }),
        ),
    });

    const pageFetcher = new PageFetcher(fetcher);
    const result = await pageFetcher.fetchAndAnalyze('https://private.example.com');

    expect(result.accessible).toBe(false);
    expect(result.accessError).toContain('403');
    expect(result.headings).toHaveLength(0);
  });

  it('handles fetch timeout errors gracefully', async () => {
    const fetcher = createMockHttpFetcher({
      fetch: jest.fn()
        .mockResolvedValueOnce(createMockFetchResult({ ok: false, status: 404, statusText: 'Not Found' }))
        .mockRejectedValueOnce(new Error('The operation was aborted')),
    });

    const pageFetcher = new PageFetcher(fetcher);
    const result = await pageFetcher.fetchAndAnalyze('https://slow.example.com');

    expect(result.accessible).toBe(false);
    expect(result.accessError).toContain('aborted');
  });

  it('skips URL blocked by robots.txt', async () => {
    const fetcher = createMockHttpFetcher({
      fetch: jest.fn().mockResolvedValueOnce(
        createMockFetchResult({
          ok: true,
          text: jest.fn().mockResolvedValue('User-agent: *\nDisallow: /'),
        }),
      ),
    });

    const pageFetcher = new PageFetcher(fetcher);
    const result = await pageFetcher.fetchAndAnalyze('https://blocked.example.com');

    expect(result.accessible).toBe(false);
    expect(result.accessError).toContain('robots.txt');
    // Should only have called fetch once (for robots.txt), not for the page
    expect(fetcher.fetch).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Confidence Level Tests (AC-8)
// ---------------------------------------------------------------------------

describe('Confidence Levels (AC-8)', () => {
  describe('calculateToneConfidence', () => {
    it('returns High for >= 3 pages', () => {
      expect(calculateToneConfidence(3)).toBe('High');
      expect(calculateToneConfidence(10)).toBe('High');
    });

    it('returns Medium for 2 pages', () => {
      expect(calculateToneConfidence(2)).toBe('Medium');
    });

    it('returns Low for 0-1 pages', () => {
      expect(calculateToneConfidence(0)).toBe('Low');
      expect(calculateToneConfidence(1)).toBe('Low');
    });
  });

  describe('calculateMessagingConfidence', () => {
    it('returns High for >= 4 pages', () => {
      expect(calculateMessagingConfidence(4)).toBe('High');
    });

    it('returns Medium for 2-3 pages', () => {
      expect(calculateMessagingConfidence(2)).toBe('Medium');
      expect(calculateMessagingConfidence(3)).toBe('Medium');
    });

    it('returns Low for 0-1 pages', () => {
      expect(calculateMessagingConfidence(0)).toBe('Low');
      expect(calculateMessagingConfidence(1)).toBe('Low');
    });
  });

  describe('calculateVisualConfidence', () => {
    it('returns High for >= 3 pages', () => {
      expect(calculateVisualConfidence(3)).toBe('High');
    });

    it('returns Medium for 2 pages', () => {
      expect(calculateVisualConfidence(2)).toBe('Medium');
    });

    it('returns Low for 0-1 pages', () => {
      expect(calculateVisualConfidence(0)).toBe('Low');
      expect(calculateVisualConfidence(1)).toBe('Low');
    });
  });
});

// ---------------------------------------------------------------------------
// Visual Analysis Helper Tests (AC-5)
// ---------------------------------------------------------------------------

describe('Visual Analysis Helpers (AC-5)', () => {
  describe('clusterColors', () => {
    it('clusters colors across pages', () => {
      const pages: PageAnalysis[] = [
        createSamplePageAnalysis({
          url: 'https://page1.com',
          dominantColors: ['#ff0000', '#00ff00'],
        }),
        createSamplePageAnalysis({
          url: 'https://page2.com',
          dominantColors: ['#ff0000', '#0000ff'],
        }),
      ];

      const clusters = clusterColors(pages);
      const redCluster = clusters.find((c) => c.hexValue === '#ff0000');
      expect(redCluster).toBeDefined();
      expect(redCluster!.occurrenceCount).toBe(2);
      expect(redCluster!.sourceUrls).toHaveLength(2);
    });

    it('sorts by occurrence count descending', () => {
      const pages: PageAnalysis[] = [
        createSamplePageAnalysis({
          url: 'https://page1.com',
          dominantColors: ['#aaa', '#bbb', '#bbb'],
        }),
        createSamplePageAnalysis({
          url: 'https://page2.com',
          dominantColors: ['#bbb'],
        }),
      ];

      const clusters = clusterColors(pages);
      // Note: '#bbb' appears as '#bbbbbb' after normalization in real use,
      // but here we pass pre-normalized values
      expect(clusters[0].hexValue).toBe('#bbb');
    });

    it('ignores inaccessible pages', () => {
      const pages: PageAnalysis[] = [
        createSamplePageAnalysis({
          accessible: false,
          dominantColors: ['#ff0000'],
        }),
      ];

      expect(clusterColors(pages)).toHaveLength(0);
    });
  });

  describe('assessTypography', () => {
    it('reports consistent when <= 3 fonts', () => {
      const pages: PageAnalysis[] = [
        createSamplePageAnalysis({ fontNames: ['Roboto', 'Arial'] }),
        createSamplePageAnalysis({ fontNames: ['Roboto'] }),
      ];

      const result = assessTypography(pages);
      expect(result.isConsistent).toBe(true);
      expect(result.fontsDetected).toContain('Roboto');
      expect(result.fontsDetected).toContain('Arial');
    });

    it('reports inconsistent when > 3 fonts', () => {
      const pages: PageAnalysis[] = [
        createSamplePageAnalysis({ fontNames: ['Roboto', 'Arial'] }),
        createSamplePageAnalysis({ fontNames: ['Helvetica', 'Georgia'] }),
      ];

      const result = assessTypography(pages);
      expect(result.isConsistent).toBe(false);
    });

    it('handles no fonts detected', () => {
      const pages: PageAnalysis[] = [
        createSamplePageAnalysis({ fontNames: [] }),
      ];

      const result = assessTypography(pages);
      expect(result.isConsistent).toBe(true);
      expect(result.notes).toContain('No font information');
    });
  });
});

// ---------------------------------------------------------------------------
// ToneAnalyzer Tests (AC-3)
// ---------------------------------------------------------------------------

describe('ToneAnalyzer (AC-3)', () => {
  it('analyzes tone from accessible pages', async () => {
    const aiResponse = JSON.stringify({
      formalCasualScore: 2,
      formalCasualLabel: 'Moderately Formal',
      emotionalRegister: ['inspirational', 'informative'],
      vocabularyComplexity: 'moderate',
      reasoning: 'The brand uses professional language with an aspirational tone.',
    });

    const aiService = createMockAIService(aiResponse);
    const analyzer = new ToneAnalyzer(aiService);

    const pages = [
      createSamplePageAnalysis({ textContent: 'Professional brand content here.' }),
      createSamplePageAnalysis({ textContent: 'More formal content.' }),
      createSamplePageAnalysis({ textContent: 'Additional brand messaging.' }),
    ];

    const result = await analyzer.analyze(pages, 'client-1');

    expect(result.formalCasualScore).toBe(2);
    expect(result.formalCasualLabel).toBe('Moderately Formal');
    expect(result.emotionalRegister).toContain('inspirational');
    expect(result.vocabularyComplexity).toBe('moderate');
    expect(result.confidence).toBe('High');
    expect(aiService.generateText).toHaveBeenCalledTimes(1);
  });

  it('returns default analysis when no accessible pages', async () => {
    const aiService = createMockAIService();
    const analyzer = new ToneAnalyzer(aiService);

    const pages = [
      createSamplePageAnalysis({ accessible: false, textContent: '' }),
    ];

    const result = await analyzer.analyze(pages, 'client-1');

    expect(result.confidence).toBe('Low');
    expect(result.reasoning).toContain('No accessible pages');
    expect(aiService.generateText).not.toHaveBeenCalled();
  });

  it('handles AI service failure gracefully', async () => {
    const aiService = createMockAIService();
    (aiService.generateText as jest.Mock).mockRejectedValue(new Error('AI error'));

    const analyzer = new ToneAnalyzer(aiService, createMockLogger());
    const pages = [createSamplePageAnalysis()];

    const result = await analyzer.analyze(pages, 'client-1');

    expect(result.confidence).toBe('Low');
    expect(result.reasoning).toContain('AI analysis failed');
  });

  it('handles malformed AI response', async () => {
    const aiService = createMockAIService('This is not JSON');
    const analyzer = new ToneAnalyzer(aiService, createMockLogger());
    const pages = [createSamplePageAnalysis()];

    const result = await analyzer.analyze(pages, 'client-1');

    expect(result.formalCasualScore).toBe(3); // default
    expect(result.confidence).toBe('Low');
  });
});

// ---------------------------------------------------------------------------
// MessagingAnalyzer Tests (AC-4)
// ---------------------------------------------------------------------------

describe('MessagingAnalyzer (AC-4)', () => {
  it('identifies recurring value propositions and contradictions', async () => {
    const aiResponse = JSON.stringify({
      recurringValuePropositions: ['Innovation-driven solutions', 'Customer-first approach'],
      contradictions: [
        {
          description: 'Homepage claims "24/7 support" but pricing page says "business hours only"',
          sourceUrls: ['https://example.com', 'https://example.com/pricing'],
        },
      ],
      consistencyScore: 3,
      reasoning: 'Generally consistent messaging with one notable contradiction.',
    });

    const aiService = createMockAIService(aiResponse);
    const analyzer = new MessagingAnalyzer(aiService);

    const pages = [
      createSamplePageAnalysis({ url: 'https://example.com', textContent: 'Content 1' }),
      createSamplePageAnalysis({ url: 'https://example.com/pricing', textContent: 'Content 2' }),
      createSamplePageAnalysis({ url: 'https://example.com/about', textContent: 'Content 3' }),
      createSamplePageAnalysis({ url: 'https://example.com/services', textContent: 'Content 4' }),
    ];

    const result = await analyzer.analyze(pages, 'client-1');

    expect(result.recurringValuePropositions).toHaveLength(2);
    expect(result.contradictions).toHaveLength(1);
    expect(result.consistencyScore).toBe(3);
    expect(result.confidence).toBe('High'); // 4 pages
  });

  it('returns default when no accessible pages', async () => {
    const aiService = createMockAIService();
    const analyzer = new MessagingAnalyzer(aiService);

    const result = await analyzer.analyze([], 'client-1');

    expect(result.confidence).toBe('Low');
    expect(result.recurringValuePropositions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// VisualAnalyzer Tests (AC-5)
// ---------------------------------------------------------------------------

describe('VisualAnalyzer (AC-5)', () => {
  it('analyzes visual consistency', async () => {
    const aiResponse = JSON.stringify({
      imageryStyle: {
        dominantStyle: 'photo-heavy',
        tonality: 'warm',
        notes: 'Brand relies on warm photography.',
      },
      consistencyScore: 4,
      reasoning: 'Strong visual consistency with consistent color palette.',
    });

    const aiService = createMockAIService(aiResponse);
    const analyzer = new VisualAnalyzer(aiService);

    const pages = [
      createSamplePageAnalysis({
        url: 'https://example.com',
        dominantColors: ['#1a73e8', '#ff6b35'],
        fontNames: ['Inter'],
      }),
      createSamplePageAnalysis({
        url: 'https://example.com/about',
        dominantColors: ['#1a73e8', '#333333'],
        fontNames: ['Inter', 'Roboto'],
      }),
      createSamplePageAnalysis({
        url: 'https://example.com/services',
        dominantColors: ['#1a73e8'],
        fontNames: ['Inter'],
      }),
    ];

    const result = await analyzer.analyze(pages, 'client-1');

    expect(result.colorPalette.length).toBeGreaterThan(0);
    expect(result.typographyConsistency.fontsDetected).toContain('Inter');
    expect(result.imageryStyle.dominantStyle).toBe('photo-heavy');
    expect(result.consistencyScore).toBe(4);
    expect(result.confidence).toBe('High');
  });

  it('returns default when no accessible pages', async () => {
    const aiService = createMockAIService();
    const analyzer = new VisualAnalyzer(aiService);

    const result = await analyzer.analyze([], 'client-1');

    expect(result.confidence).toBe('Low');
    expect(result.colorPalette).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// CompetitiveAnalyzer Tests (AC-7)
// ---------------------------------------------------------------------------

describe('CompetitiveAnalyzer (AC-7)', () => {
  it('returns "Not available" when no competitor URLs', async () => {
    const aiService = createMockAIService();
    const analyzer = new CompetitiveAnalyzer(aiService);

    const result = await analyzer.analyze(
      [createSamplePageAnalysis()],
      [],
      'client-1',
    );

    expect(result.available).toBe(false);
    expect(result.unavailableMessage).toContain('Not available');
    expect(aiService.generateText).not.toHaveBeenCalled();
  });

  it('analyzes competitive gaps when competitor URLs provided', async () => {
    const aiResponse = JSON.stringify({
      gaps: [
        {
          area: 'Social Proof',
          description: 'Client lacks customer testimonials present on competitor sites',
          competitorUrls: ['https://competitor.com'],
        },
      ],
      summary: 'Client has room for improvement in social proof areas.',
    });

    const aiService = createMockAIService(aiResponse);
    const analyzer = new CompetitiveAnalyzer(aiService);

    const clientPages = [createSamplePageAnalysis()];
    const competitorPages = [
      createSamplePageAnalysis({ url: 'https://competitor.com' }),
    ];

    const result = await analyzer.analyze(clientPages, competitorPages, 'client-1');

    expect(result.available).toBe(true);
    expect(result.gaps).toHaveLength(1);
    expect(result.gaps![0].area).toBe('Social Proof');
    expect(result.summary).toContain('social proof');
  });

  it('returns unavailable when no accessible client pages', async () => {
    const aiService = createMockAIService();
    const analyzer = new CompetitiveAnalyzer(aiService);

    const clientPages = [createSamplePageAnalysis({ accessible: false })];
    const competitorPages = [createSamplePageAnalysis()];

    const result = await analyzer.analyze(clientPages, competitorPages, 'client-1');

    expect(result.available).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// R2 Key Construction Tests (AC-9)
// ---------------------------------------------------------------------------

describe('buildAuditReportR2Key (AC-9)', () => {
  it('builds correct R2 key', () => {
    expect(buildAuditReportR2Key('acme-corp')).toBe(
      'brand-assets/acme-corp/onboarding/audit-report.json',
    );
  });
});

// ---------------------------------------------------------------------------
// AuditPipeline Integration Tests (AC-1 through AC-10)
// ---------------------------------------------------------------------------

describe('AuditPipeline', () => {
  it('runs complete pipeline and produces audit report (AC-1 through AC-9)', async () => {
    // Setup: mock HTTP fetcher to return HTML for all URLs.
    // Each URL triggers 2 fetch calls: robots.txt (404) + page (200 with HTML).
    // With 3 URLs processed in parallel batch, that is 6 sequential mock calls.
    const fetchMock = jest.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('robots.txt')) {
        return createMockFetchResult({ ok: false, status: 404, statusText: 'Not Found' });
      }
      return createMockFetchResult({ text: jest.fn().mockResolvedValue(SAMPLE_HTML) });
    });

    // Mock AI responses for each analysis phase
    const aiMock = jest.fn()
      // Tone analysis
      .mockResolvedValueOnce({
        text: JSON.stringify({
          formalCasualScore: 2,
          formalCasualLabel: 'Moderately Formal',
          emotionalRegister: ['informative'],
          vocabularyComplexity: 'moderate',
          reasoning: 'Professional tone.',
        }),
      })
      // Messaging analysis
      .mockResolvedValueOnce({
        text: JSON.stringify({
          recurringValuePropositions: ['Innovation'],
          contradictions: [],
          consistencyScore: 4,
          reasoning: 'Consistent messaging.',
        }),
      })
      // Visual analysis
      .mockResolvedValueOnce({
        text: JSON.stringify({
          imageryStyle: {
            dominantStyle: 'photo-heavy',
            tonality: 'neutral',
            notes: 'Clean visual style.',
          },
          consistencyScore: 4,
          reasoning: 'Consistent visuals.',
        }),
      })
      // Competitive analysis — no competitors, so this won't be called
      // Improvement opportunities
      .mockResolvedValueOnce({
        text: JSON.stringify([
          {
            title: 'Add brand tagline',
            description: 'No consistent tagline found across pages.',
            category: 'branding',
          },
          {
            title: 'Improve SEO meta',
            description: 'Missing meta descriptions on 2 pages.',
            category: 'seo',
          },
          {
            title: 'Standardize colors',
            description: 'Inconsistent accent color usage.',
            category: 'visual',
          },
        ]),
      });

    const deps = createPipelineDeps({
      httpFetcher: { fetch: fetchMock },
      aiService: { generateText: aiMock },
    });

    const pipeline = new AuditPipeline('acme-corp', deps);
    const auditUrls = createSampleAuditUrls(3);

    const report = await pipeline.run(auditUrls);

    // AC-1: Report includes data from all URLs
    expect(report.urlsSubmitted).toBe(3);
    expect(report.urlsAccessible).toBe(3);
    expect(report.pageAnalyses).toHaveLength(3);

    // AC-2: Each accessible page has extracted data
    for (const page of report.pageAnalyses) {
      expect(page.accessible).toBe(true);
      expect(page.title).toBeDefined();
    }

    // AC-3: Tone of voice analysis present
    expect(report.toneOfVoice.formalCasualScore).toBe(2);
    expect(report.toneOfVoice.emotionalRegister).toContain('informative');

    // AC-4: Messaging consistency present
    expect(report.messagingConsistency.consistencyScore).toBe(4);

    // AC-5: Visual consistency present
    expect(report.visualConsistency.consistencyScore).toBe(4);

    // AC-6: Improvement opportunities present (3-5)
    expect(report.improvementOpportunities.length).toBeGreaterThanOrEqual(3);
    expect(report.improvementOpportunities.length).toBeLessThanOrEqual(5);

    // AC-7: Competitive gap — no competitors
    expect(report.competitiveGap.available).toBe(false);

    // AC-8: Inferences have confidence levels
    expect(report.inferences.length).toBeGreaterThan(0);
    for (const inference of report.inferences) {
      expect(['High', 'Medium', 'Low']).toContain(inference.confidence);
    }

    // AC-9: Report persisted to R2
    expect(deps.r2Client.uploadJson).toHaveBeenCalledWith(
      'brand-assets/acme-corp/onboarding/audit-report.json',
      expect.objectContaining({
        clientId: 'acme-corp',
      }),
    );

    // AC-9: ClickUp comment posted
    expect(deps.clickUpClient!.postComment).toHaveBeenCalledWith(
      'task-abc',
      expect.stringContaining('Digital Presence Audit Complete'),
    );
  });

  it('handles inaccessible URLs without aborting pipeline (AC-1, NFR-9.6, NFR-9.9)', async () => {
    // Both URLs are processed in parallel. Each checks robots.txt then fetches the page.
    const fetchMock = jest.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('robots.txt')) {
        return createMockFetchResult({ ok: false, status: 404, statusText: 'Not Found' });
      }
      // The private URL returns 403
      if (typeof url === 'string' && url.includes('private')) {
        return createMockFetchResult({ ok: false, status: 403, statusText: 'Forbidden' });
      }
      // The public URL returns HTML
      return createMockFetchResult({ text: jest.fn().mockResolvedValue(SAMPLE_HTML) });
    });

    const aiMock = jest.fn().mockResolvedValue({ text: '{}' });

    const deps = createPipelineDeps({
      httpFetcher: { fetch: fetchMock },
      aiService: { generateText: aiMock },
    });

    const pipeline = new AuditPipeline('acme-corp', deps);
    const auditUrls: AuditUrl[] = [
      { url: 'https://private.example.com', category: 'website', submitted_at: '2026-03-23T10:00:00.000Z', validated: false },
      { url: 'https://public.example.com', category: 'website', submitted_at: '2026-03-23T10:00:00.000Z', validated: false },
    ];

    const report = await pipeline.run(auditUrls);

    // Pipeline should complete despite inaccessible URL
    expect(report.urlsSubmitted).toBe(2);
    expect(report.urlsAccessible).toBe(1);

    // Inaccessible URL is logged
    const inaccessible = report.pageAnalyses.find((p) => !p.accessible);
    expect(inaccessible).toBeDefined();
    expect(inaccessible!.accessError).toContain('403');

    // Report is still persisted
    expect(deps.r2Client.uploadJson).toHaveBeenCalled();
  });

  it('provides progress updates via polling endpoint (AC-10)', async () => {
    const fetchMock = jest.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('robots.txt')) {
        return createMockFetchResult({ ok: false, status: 404, statusText: 'Not Found' });
      }
      return createMockFetchResult({ text: jest.fn().mockResolvedValue(SAMPLE_HTML) });
    });

    const aiMock = jest.fn().mockResolvedValue({ text: '{}' });

    const deps = createPipelineDeps({
      httpFetcher: { fetch: fetchMock },
      aiService: { generateText: aiMock },
    });

    const pipeline = new AuditPipeline('acme-corp', deps);
    const auditUrls = createSampleAuditUrls(1);

    // Check initial progress
    const initialProgress = pipeline.getProgress();
    expect(initialProgress.status).toBe('pending');
    expect(initialProgress.totalUrls).toBe(0);

    const report = await pipeline.run(auditUrls);

    // Check final progress
    const finalProgress = pipeline.getProgress();
    expect(finalProgress.status).toBe('complete');
    expect(finalProgress.totalUrls).toBe(1);
    expect(finalProgress.clientId).toBe('acme-corp');
  });

  it('succeeds without ClickUp client', async () => {
    const fetchMock = jest.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('robots.txt')) {
        return createMockFetchResult({ ok: false, status: 404, statusText: 'Not Found' });
      }
      return createMockFetchResult({ text: jest.fn().mockResolvedValue(SAMPLE_HTML) });
    });

    const aiMock = jest.fn().mockResolvedValue({ text: '{}' });

    const deps = createPipelineDeps({
      httpFetcher: { fetch: fetchMock },
      aiService: { generateText: aiMock },
      clickUpClient: undefined,
      clickUpTaskId: undefined,
    });

    const pipeline = new AuditPipeline('acme-corp', deps);
    const auditUrls = createSampleAuditUrls(1);

    const report = await pipeline.run(auditUrls);

    expect(report.clientId).toBe('acme-corp');
    expect(deps.r2Client.uploadJson).toHaveBeenCalled();
  });

  it('handles R2 upload failure with descriptive error', async () => {
    const fetchMock = jest.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('robots.txt')) {
        return createMockFetchResult({ ok: false, status: 404, statusText: 'Not Found' });
      }
      return createMockFetchResult({ text: jest.fn().mockResolvedValue(SAMPLE_HTML) });
    });

    const aiMock = jest.fn().mockResolvedValue({ text: '{}' });
    const r2Client = createMockR2Client();
    (r2Client.uploadJson as jest.Mock).mockRejectedValue(new Error('R2 timeout'));

    const deps = createPipelineDeps({
      httpFetcher: { fetch: fetchMock },
      aiService: { generateText: aiMock },
      r2Client,
    });

    const pipeline = new AuditPipeline('acme-corp', deps);
    const auditUrls = createSampleAuditUrls(1);

    await expect(pipeline.run(auditUrls)).rejects.toThrow(
      'Failed to persist audit report to R2: R2 timeout',
    );

    // Progress should reflect failure
    const progress = pipeline.getProgress();
    expect(progress.status).toBe('failed');
  });

  it('continues when ClickUp comment fails (non-blocking)', async () => {
    const fetchMock = jest.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('robots.txt')) {
        return createMockFetchResult({ ok: false, status: 404, statusText: 'Not Found' });
      }
      return createMockFetchResult({ text: jest.fn().mockResolvedValue(SAMPLE_HTML) });
    });

    const aiMock = jest.fn().mockResolvedValue({ text: '{}' });
    const clickUpClient = createMockClickUpClient();
    (clickUpClient.postComment as jest.Mock).mockRejectedValue(new Error('ClickUp error'));

    const deps = createPipelineDeps({
      httpFetcher: { fetch: fetchMock },
      aiService: { generateText: aiMock },
      clickUpClient,
    });

    const pipeline = new AuditPipeline('acme-corp', deps);
    const auditUrls = createSampleAuditUrls(1);

    // Should not throw
    const report = await pipeline.run(auditUrls);
    expect(report.clientId).toBe('acme-corp');
  });

  it('includes competitive gap when competitor URLs provided (AC-7)', async () => {
    const fetchMock = jest.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('robots.txt')) {
        return createMockFetchResult({ ok: false, status: 404, statusText: 'Not Found' });
      }
      return createMockFetchResult({ text: jest.fn().mockResolvedValue(SAMPLE_HTML) });
    });

    const aiMock = jest.fn()
      // Tone
      .mockResolvedValueOnce({ text: '{}' })
      // Messaging
      .mockResolvedValueOnce({ text: '{}' })
      // Visual
      .mockResolvedValueOnce({ text: '{}' })
      // Competitive
      .mockResolvedValueOnce({
        text: JSON.stringify({
          gaps: [{ area: 'SEO', description: 'Competitor has better SEO', competitorUrls: ['https://competitor.com'] }],
          summary: 'Gaps identified.',
        }),
      })
      // Improvements
      .mockResolvedValueOnce({ text: '[]' });

    const deps = createPipelineDeps({
      httpFetcher: { fetch: fetchMock },
      aiService: { generateText: aiMock },
    });

    const pipeline = new AuditPipeline('acme-corp', deps);
    const auditUrls = createSampleAuditUrls(1);

    const report = await pipeline.run(auditUrls, ['https://competitor.com']);

    expect(report.competitiveGap.available).toBe(true);
  });
});
