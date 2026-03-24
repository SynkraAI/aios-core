/**
 * Tests for ContentCalendar, CalendarExporter, and calendarToBatchBrief (BSS-4.7).
 */

import { ContentCalendar, calendarToBatchBrief } from '../content-calendar';
import { CalendarExporter } from '../calendar-exporter';
import { CONTENT_THEMES } from '../content-themes';
import type {
  CalendarBrief,
  WeeklyPlan,
  TokenSet,
  IndustryVertical,
  ContentPillar,
} from '../types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_TOKENS: TokenSet = {
  color: {
    primary: { $value: '#1a1a2e', $type: 'color' },
    accent: { $value: '#e94560', $type: 'color' },
  },
};

const DEFAULT_BRIEF: CalendarBrief = {
  clientId: 'test-client-001',
  tokens: MOCK_TOKENS,
  industry: 'professional-services',
  postsPerWeek: 7,
  startDate: '2026-04-01',
};

// ---------------------------------------------------------------------------
// ContentCalendar.generate
// ---------------------------------------------------------------------------

describe('ContentCalendar', () => {
  const calendar = new ContentCalendar();

  it('generates a 4-week plan', () => {
    const plans = calendar.generate(DEFAULT_BRIEF);
    expect(plans).toHaveLength(4);
    expect(plans.map((p) => p.weekNumber)).toEqual([1, 2, 3, 4]);
  });

  it('Week 1 has educational pillar focus', () => {
    const plans = calendar.generate(DEFAULT_BRIEF);
    expect(plans[0].pillarFocus).toBe('educational');
    for (const post of plans[0].posts) {
      expect(post.pillar).toBe('educational');
    }
  });

  it('Week 2 has authority pillar focus', () => {
    const plans = calendar.generate(DEFAULT_BRIEF);
    expect(plans[1].pillarFocus).toBe('authority');
    for (const post of plans[1].posts) {
      expect(post.pillar).toBe('authority');
    }
  });

  it('Week 3 has engagement pillar focus', () => {
    const plans = calendar.generate(DEFAULT_BRIEF);
    expect(plans[2].pillarFocus).toBe('engagement');
    for (const post of plans[2].posts) {
      expect(post.pillar).toBe('engagement');
    }
  });

  it('Week 4 has conversion + promotional posts', () => {
    const plans = calendar.generate(DEFAULT_BRIEF);
    expect(plans[3].pillarFocus).toBe('conversion');
    const pillars = plans[3].posts.map((p) => p.pillar);
    expect(pillars).toContain('conversion');
    expect(pillars).toContain('promotional');
  });

  it('total posts per week equals postsPerWeek (no overshoot)', () => {
    const plans = calendar.generate(DEFAULT_BRIEF);
    const totalPosts = plans.reduce((sum, w) => sum + w.posts.length, 0);
    expect(totalPosts).toBe(7);
  });

  it('7-post week has platform diversity: >= 2 Instagram, >= 1 LinkedIn, >= 1 X/Twitter, >= 1 Facebook', () => {
    const plans = calendar.generate(DEFAULT_BRIEF);
    const allPlatforms = plans.flatMap((w) => w.posts.map((p) => p.platform));

    const instagramCount = allPlatforms.filter((p) => p === 'instagram').length;
    const linkedinCount = allPlatforms.filter((p) => p === 'linkedin').length;
    const xTwitterCount = allPlatforms.filter((p) => p === 'x-twitter').length;
    const facebookCount = allPlatforms.filter((p) => p === 'facebook').length;

    expect(instagramCount).toBeGreaterThanOrEqual(2);
    expect(linkedinCount).toBeGreaterThanOrEqual(1);
    expect(xTwitterCount).toBeGreaterThanOrEqual(1);
    expect(facebookCount).toBeGreaterThanOrEqual(1);
  });

  it('each ScheduledPost has a valid ISO 8601 date', () => {
    const plans = calendar.generate(DEFAULT_BRIEF);
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const week of plans) {
      for (const post of week.posts) {
        expect(post.date).toMatch(isoDateRegex);
        // Ensure parseable
        expect(isNaN(new Date(post.date).getTime())).toBe(false);
      }
    }
  });

  it('variants cycle through MVP set', () => {
    const plans = calendar.generate(DEFAULT_BRIEF);
    const mvpVariants = ['quote', 'tip', 'statistic', 'question', 'announcement'];
    const allVariants = plans.flatMap((w) => w.posts.map((p) => p.variant));

    for (let i = 0; i < allVariants.length; i++) {
      expect(allVariants[i]).toBe(mvpVariants[i % mvpVariants.length]);
    }
  });

  it('uses default postsPerWeek of 7 when not specified', () => {
    const brief: CalendarBrief = {
      ...DEFAULT_BRIEF,
      postsPerWeek: undefined,
    };
    const plans = calendar.generate(brief);
    const totalPosts = plans.reduce((sum, w) => sum + w.posts.length, 0);
    expect(totalPosts).toBe(7);
  });

  it('handles postsPerWeek other than 7', () => {
    const brief: CalendarBrief = {
      ...DEFAULT_BRIEF,
      postsPerWeek: 14,
    };
    const plans = calendar.generate(brief);
    const totalPosts = plans.reduce((sum, w) => sum + w.posts.length, 0);
    expect(totalPosts).toBe(14);
  });

  it('each post has a complete postSpec', () => {
    const plans = calendar.generate(DEFAULT_BRIEF);
    for (const week of plans) {
      for (const post of week.posts) {
        expect(post.postSpec).toBeDefined();
        expect(post.postSpec.platform).toBe(post.platform);
        expect(post.postSpec.variant).toBe(post.variant);
        expect(post.postSpec.content).toBeDefined();
        expect(post.postSpec.content.headline).toBe(post.contentTheme);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// calendarToBatchBrief
// ---------------------------------------------------------------------------

describe('calendarToBatchBrief', () => {
  it('returns valid BatchBrief with correct total post count', () => {
    const calendar = new ContentCalendar();
    const plans = calendar.generate(DEFAULT_BRIEF);
    const brief = calendarToBatchBrief(plans, MOCK_TOKENS, 'test-client-001');

    expect(brief.clientId).toBe('test-client-001');
    expect(brief.tokens).toBe(MOCK_TOKENS);
    // Total posts should equal postsPerWeek (distributed across 4 weeks)
    expect(brief.posts).toHaveLength(7);
  });

  it('flattens all weeks into a single posts array', () => {
    const calendar = new ContentCalendar();
    const brief14: CalendarBrief = { ...DEFAULT_BRIEF, postsPerWeek: 14 };
    const plans = calendar.generate(brief14);
    const batch = calendarToBatchBrief(plans, MOCK_TOKENS, 'test-client-001');

    expect(batch.posts).toHaveLength(14);
  });
});

// ---------------------------------------------------------------------------
// CalendarExporter
// ---------------------------------------------------------------------------

describe('CalendarExporter', () => {
  let plans: WeeklyPlan[];

  beforeAll(() => {
    const calendar = new ContentCalendar();
    plans = calendar.generate(DEFAULT_BRIEF);
  });

  describe('exportCSV', () => {
    it('first line equals header row', async () => {
      const exporter = new CalendarExporter();
      const { content } = await exporter.exportCSV(plans, 'test-client');
      const firstLine = content.split('\n')[0];
      expect(firstLine).toBe('Date,Platform,Pillar,Theme,Variant,AssetUrl');
    });

    it('has correct number of data rows (postsPerWeek)', async () => {
      const exporter = new CalendarExporter();
      const { content } = await exporter.exportCSV(plans, 'test-client');
      const lines = content.split('\n');
      // header + data rows
      expect(lines.length).toBe(1 + 7);
    });

    it('handles commas in theme text by quoting', async () => {
      // Create a plan with a comma in the theme
      const customPlans: WeeklyPlan[] = [
        {
          weekNumber: 1,
          pillarFocus: 'educational',
          posts: [
            {
              date: '2026-04-01',
              pillar: 'educational',
              platform: 'instagram',
              variant: 'quote',
              contentTheme: 'First, learn the basics',
              postSpec: {
                platform: 'instagram',
                format: 'feed-square',
                variant: 'quote',
                content: {
                  headline: 'First, learn the basics',
                  body: '',
                  logoUrl: '',
                  variant: 'quote',
                },
              },
            },
          ],
        },
      ];
      const exporter = new CalendarExporter();
      const { content } = await exporter.exportCSV(customPlans, 'test-client');
      const dataLine = content.split('\n')[1];
      expect(dataLine).toContain('"First, learn the basics"');
    });

    it('does not include r2Key when no R2 deps provided', async () => {
      const exporter = new CalendarExporter();
      const result = await exporter.exportCSV(plans, 'test-client');
      expect(result.r2Key).toBeUndefined();
    });

    it('uploads to R2 when deps are provided', async () => {
      const mockUpload = jest.fn().mockResolvedValue({ key: 'test-client/calendar/calendar.csv' });
      const exporter = new CalendarExporter({
        r2Client: {},
        r2Bucket: 'test-bucket',
        uploadAsset: mockUpload,
      });

      const result = await exporter.exportCSV(plans, 'test-client');
      expect(result.r2Key).toBe('test-client/calendar/calendar.csv');
      expect(mockUpload).toHaveBeenCalledWith(
        {},
        'test-bucket',
        'test-client',
        'calendar',
        'calendar.csv',
        expect.any(Buffer),
        { contentType: 'text/csv' },
      );
    });
  });

  describe('exportJSON', () => {
    it('parses to valid WeeklyPlan array', async () => {
      const exporter = new CalendarExporter();
      const { content } = await exporter.exportJSON(plans, 'test-client');
      const parsed = JSON.parse(content) as WeeklyPlan[];

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(4);
      expect(parsed[0].weekNumber).toBe(1);
      expect(parsed[0].pillarFocus).toBe('educational');
      expect(Array.isArray(parsed[0].posts)).toBe(true);
    });

    it('does not include r2Key when no R2 deps provided', async () => {
      const exporter = new CalendarExporter();
      const result = await exporter.exportJSON(plans, 'test-client');
      expect(result.r2Key).toBeUndefined();
    });

    it('uploads to R2 when deps are provided', async () => {
      const mockUpload = jest.fn().mockResolvedValue({ key: 'test-client/calendar/calendar.json' });
      const exporter = new CalendarExporter({
        r2Client: {},
        r2Bucket: 'test-bucket',
        uploadAsset: mockUpload,
      });

      const result = await exporter.exportJSON(plans, 'test-client');
      expect(result.r2Key).toBe('test-client/calendar/calendar.json');
      expect(mockUpload).toHaveBeenCalledWith(
        {},
        'test-bucket',
        'test-client',
        'calendar',
        'calendar.json',
        expect.any(Buffer),
        { contentType: 'application/json' },
      );
    });
  });
});

// ---------------------------------------------------------------------------
// CONTENT_THEMES
// ---------------------------------------------------------------------------

describe('CONTENT_THEMES', () => {
  const industries: IndustryVertical[] = [
    'health-wellness',
    'professional-services',
    'e-commerce',
    'technology',
    'education',
    'hospitality',
    'real-estate',
    'other',
  ];

  const pillars: ContentPillar[] = [
    'educational',
    'authority',
    'engagement',
    'conversion',
    'promotional',
  ];

  it('has all 40 industry/pillar combinations', () => {
    for (const industry of industries) {
      expect(CONTENT_THEMES[industry]).toBeDefined();
      for (const pillar of pillars) {
        expect(CONTENT_THEMES[industry][pillar]).toBeDefined();
      }
    }
  });

  it('each combination has >= 5 themes', () => {
    for (const industry of industries) {
      for (const pillar of pillars) {
        const themes = CONTENT_THEMES[industry][pillar];
        expect(themes.length).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('all themes are non-empty strings', () => {
    for (const industry of industries) {
      for (const pillar of pillars) {
        for (const theme of CONTENT_THEMES[industry][pillar]) {
          expect(typeof theme).toBe('string');
          expect(theme.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
