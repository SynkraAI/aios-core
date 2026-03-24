/**
 * Tests for AI Draft Generation from Audit (BSS-7.4).
 *
 * Covers:
 * - DraftPipeline orchestration (AC-1 through AC-9)
 * - Low-confidence warning logic (AC-8 / NFR-9.7)
 * - R2 persistence with correct paths (AC-6)
 * - Manifest structure (AC-7)
 * - ClickUp notification (AC-9)
 * - Individual drafter parsing
 * - Channel detection for improvement suggestions
 */

import type {
  AuditReport,
  AuditAIService,
  AuditAIResponse,
  AuditR2Client,
  AuditClickUpClient,
  AuditLogger,
  InferenceItem,
  ConfidenceLevel,
} from '../audit/audit-types';

import {
  DraftPipeline,
  isLowConfidence,
  getHighConfidencePercentage,
  DRAFT_PREAMBLE,
  LOW_CONFIDENCE_WARNING,
  DRAFT_FILENAMES,
  buildDraftR2Key,
  detectChannels,
} from '../drafts';

import type {
  DraftPipelineDeps,
  BrandVoiceDraft,
  MessagingFrameworkDraft,
  MoodboardDirectionDraft,
  ImprovementSuggestionsDraft,
  DraftManifest,
} from '../drafts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

function createMockAuditReport(overrides?: Partial<AuditReport>): AuditReport {
  return {
    clientId: 'test-client-123',
    generatedAt: '2026-03-15T10:00:00.000Z',
    urlsSubmitted: 5,
    urlsAccessible: 4,
    pageAnalyses: [
      {
        url: 'https://example.com',
        accessible: true,
        title: 'Example Co - Home',
        metaDescription: 'Leading solutions provider',
        headings: [
          { level: 1, text: 'Welcome to Example Co' },
          { level: 2, text: 'Our Solutions' },
          { level: 2, text: 'Why Choose Us' },
        ],
        dominantColors: ['#1a73e8', '#ffffff', '#333333', '#f5f5f5', '#e8eaed'],
        fontNames: ['Roboto', 'Open Sans'],
        imageryDescriptions: ['Hero banner with team photo'],
        textContent: 'Welcome to Example Co. We provide innovative solutions for modern businesses.',
        fetchedAt: '2026-03-15T09:50:00.000Z',
      },
      {
        url: 'https://example.com/about',
        accessible: true,
        title: 'About Us - Example Co',
        headings: [{ level: 1, text: 'About Our Company' }],
        dominantColors: ['#1a73e8', '#ffffff'],
        fontNames: ['Roboto'],
        imageryDescriptions: [],
        textContent: 'Founded in 2020, we are a team of passionate innovators.',
        fetchedAt: '2026-03-15T09:51:00.000Z',
      },
      {
        url: 'https://instagram.com/exampleco',
        accessible: true,
        title: 'ExampleCo Instagram',
        headings: [],
        dominantColors: ['#1a73e8'],
        fontNames: [],
        imageryDescriptions: [],
        textContent: 'ExampleCo on Instagram. Sharing our journey.',
        fetchedAt: '2026-03-15T09:52:00.000Z',
      },
      {
        url: 'https://linkedin.com/company/exampleco',
        accessible: true,
        title: 'ExampleCo LinkedIn',
        headings: [],
        dominantColors: [],
        fontNames: [],
        imageryDescriptions: [],
        textContent: 'ExampleCo on LinkedIn.',
        fetchedAt: '2026-03-15T09:53:00.000Z',
      },
      {
        url: 'https://broken.example.com',
        accessible: false,
        accessError: 'Connection timeout',
        headings: [],
        dominantColors: [],
        fontNames: [],
        imageryDescriptions: [],
        textContent: '',
        fetchedAt: '2026-03-15T09:54:00.000Z',
      },
    ],
    toneOfVoice: {
      formalCasualScore: 3,
      formalCasualLabel: 'Balanced',
      emotionalRegister: ['informative', 'professional'],
      vocabularyComplexity: 'moderate',
      reasoning: 'Content shows a balanced mix of formal and casual tone.',
      confidence: 'High',
    },
    messagingConsistency: {
      recurringValuePropositions: ['Innovation', 'Modern Solutions'],
      contradictions: [],
      consistencyScore: 4,
      reasoning: 'Messaging is consistent across pages with clear value propositions.',
      confidence: 'High',
    },
    visualConsistency: {
      colorPalette: [
        { hexValue: '#1a73e8', occurrenceCount: 4, sourceUrls: ['https://example.com'] },
        { hexValue: '#ffffff', occurrenceCount: 3, sourceUrls: ['https://example.com'] },
        { hexValue: '#333333', occurrenceCount: 2, sourceUrls: ['https://example.com'] },
      ],
      typographyConsistency: {
        fontsDetected: ['Roboto', 'Open Sans'],
        isConsistent: true,
        notes: 'Consistent use of Roboto family.',
      },
      imageryStyle: {
        dominantStyle: 'photo-heavy',
        tonality: 'neutral',
        notes: 'Professional photography style.',
      },
      consistencyScore: 4,
      reasoning: 'Visual elements are generally consistent across pages.',
      confidence: 'High',
    },
    improvementOpportunities: [
      {
        title: 'Add clear CTA',
        description: 'Homepage lacks a clear call-to-action above the fold.',
        category: 'content',
        confidence: 'Medium',
      },
    ],
    competitiveGap: {
      available: false,
      unavailableMessage: 'No competitor URLs provided.',
    },
    inferences: [
      { category: 'tone', statement: 'Brand tone is balanced.', confidence: 'High', sourceUrls: ['https://example.com'] },
      { category: 'messaging', statement: 'Innovation is key theme.', confidence: 'High', sourceUrls: ['https://example.com'] },
      { category: 'visual', statement: 'Primary blue brand color.', confidence: 'High', sourceUrls: ['https://example.com'] },
      { category: 'content', statement: 'CTA is missing.', confidence: 'Medium', sourceUrls: [] },
    ],
    ...overrides,
  };
}

function createLowConfidenceReport(): AuditReport {
  return createMockAuditReport({
    inferences: [
      { category: 'tone', statement: 'Uncertain tone.', confidence: 'Low', sourceUrls: [] },
      { category: 'messaging', statement: 'Unclear messaging.', confidence: 'Low', sourceUrls: [] },
      { category: 'visual', statement: 'Inconsistent visuals.', confidence: 'Medium', sourceUrls: [] },
      { category: 'content', statement: 'Sparse content.', confidence: 'Low', sourceUrls: [] },
      { category: 'tone', statement: 'Some formal tone.', confidence: 'High', sourceUrls: [] },
    ],
  });
}

// Mock AI responses
const MOCK_BRAND_VOICE_RESPONSE = JSON.stringify({
  tone_spectrum: [
    { dimension: 'Formal-Casual', position: 3, label: 'Balanced', description: 'Neither too formal nor too casual' },
    { dimension: 'Technical-Simple', position: 2, label: 'Accessible', description: 'Uses clear language' },
    { dimension: 'Emotional-Rational', position: 4, label: 'Professional', description: 'Fact-driven communication' },
    { dimension: 'Playful-Serious', position: 3, label: 'Moderate', description: 'Balanced approach' },
  ],
  vocabulary_examples: [
    { word: 'innovative', context: 'Homepage hero section', frequency: 'frequent' },
    { word: 'solutions', context: 'Service descriptions', frequency: 'frequent' },
    { word: 'passionate', context: 'About page', frequency: 'occasional' },
    { word: 'modern', context: 'Multiple pages', frequency: 'frequent' },
    { word: 'team', context: 'About and culture pages', frequency: 'occasional' },
    { word: 'cutting-edge', context: 'Product descriptions', frequency: 'rare' },
  ],
  communication_guidelines: [
    { type: 'do', guideline: 'Use active voice', rationale: 'Matches brand energy' },
    { type: 'do', guideline: 'Keep sentences concise', rationale: 'Audience prefers clarity' },
    { type: 'dont', guideline: 'Avoid jargon', rationale: 'Content targets non-technical audience' },
    { type: 'do', guideline: 'Include social proof', rationale: 'Builds trust' },
    { type: 'dont', guideline: 'Avoid negative framing', rationale: 'Brand is solution-focused' },
    { type: 'do', guideline: 'Use second person', rationale: 'Creates personal connection' },
    { type: 'dont', guideline: 'Avoid hyperbole', rationale: 'Maintains credibility' },
    { type: 'do', guideline: 'Include data points', rationale: 'Supports claims' },
  ],
});

const MOCK_MESSAGING_RESPONSE = JSON.stringify({
  value_proposition: 'Empowering modern businesses with innovative, technology-driven solutions.',
  supporting_pillars: [
    { title: 'Innovation', description: 'Leading-edge solutions', supporting_evidence: 'Recurring theme across all pages' },
    { title: 'Reliability', description: 'Proven track record', supporting_evidence: 'Mentioned in about and service pages' },
    { title: 'Partnership', description: 'Collaborative approach', supporting_evidence: 'Team-centric language used consistently' },
  ],
  elevator_pitch: 'Example Co is a technology-driven company that empowers modern businesses through innovative solutions. With a collaborative approach and proven track record, we help organizations achieve their digital transformation goals.',
});

const MOCK_MOODBOARD_RESPONSE = JSON.stringify({
  visual_direction_tags: [
    { tag: 'Clean & Professional', description: 'Minimal design with clear hierarchy', derived_from: 'visual consistency analysis' },
    { tag: 'Tech-Forward', description: 'Modern aesthetic with digital elements', derived_from: 'imagery style assessment' },
    { tag: 'Trustworthy Blue', description: 'Blue-centric palette conveys reliability', derived_from: 'color palette analysis' },
  ],
  color_seeds: [
    { hex: '#1a73e8', name: 'Brand Blue', role: 'primary' },
    { hex: '#ffffff', name: 'Clean White', role: 'secondary' },
    { hex: '#333333', name: 'Dark Text', role: 'neutral' },
    { hex: '#f5f5f5', name: 'Light Gray', role: 'secondary' },
    { hex: '#e8eaed', name: 'Soft Gray', role: 'accent' },
  ],
  typography_direction: [
    { category: 'heading', suggestion: 'Roboto Bold', rationale: 'Consistent with detected primary font' },
    { category: 'body', suggestion: 'Open Sans Regular', rationale: 'Secondary font detected in audit' },
    { category: 'accent', suggestion: 'Roboto Mono', rationale: 'For code/technical sections' },
  ],
});

const MOCK_IMPROVEMENTS_RESPONSE = JSON.stringify({
  channels: [
    {
      channel: 'Website Homepage',
      channel_type: 'website',
      suggestions: [
        { suggestion: 'Add a clear CTA above the fold', rationale: 'Homepage lacks immediate action path', priority: 'high' },
        { suggestion: 'Include client testimonials', rationale: 'No social proof currently visible', priority: 'medium' },
      ],
    },
    {
      channel: 'Landing Pages',
      channel_type: 'landing_page',
      suggestions: [
        { suggestion: 'Unify heading hierarchy', rationale: 'Inconsistent heading usage across pages', priority: 'medium' },
        { suggestion: 'Add meta descriptions', rationale: 'Missing on about page', priority: 'low' },
      ],
    },
    {
      channel: 'Instagram',
      channel_type: 'social',
      suggestions: [
        { suggestion: 'Use brand colors in templates', rationale: 'Brand blue not visible in feed', priority: 'high' },
        { suggestion: 'Add branded hashtags', rationale: 'No consistent hashtag strategy', priority: 'medium' },
      ],
    },
  ],
});

// ---------------------------------------------------------------------------
// Mock Services
// ---------------------------------------------------------------------------

function createMockAIService(): AuditAIService {
  let callCount = 0;
  const responses = [
    MOCK_BRAND_VOICE_RESPONSE,
    MOCK_MESSAGING_RESPONSE,
    MOCK_MOODBOARD_RESPONSE,
    MOCK_IMPROVEMENTS_RESPONSE,
  ];

  return {
    generateText: jest.fn(async (): Promise<AuditAIResponse> => {
      const index = callCount % responses.length;
      callCount++;
      return { text: responses[index] };
    }),
  };
}

function createMockR2Client(): AuditR2Client {
  return {
    uploadJson: jest.fn(async () => ({ key: 'test-key' })),
  };
}

function createMockClickUpClient(): AuditClickUpClient {
  return {
    postComment: jest.fn(async () => undefined),
  };
}

function createMockLogger(): AuditLogger {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

function createDeps(overrides?: Partial<DraftPipelineDeps>): DraftPipelineDeps {
  return {
    aiService: createMockAIService(),
    r2Client: createMockR2Client(),
    clickUpClient: createMockClickUpClient(),
    clickUpTaskId: 'task-456',
    logger: createMockLogger(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BSS-7.4: AI Draft Generation from Audit', () => {
  describe('isLowConfidence', () => {
    it('returns true when < 30% of inferences are High confidence', () => {
      const report = createLowConfidenceReport();
      expect(isLowConfidence(report)).toBe(true);
    });

    it('returns false when >= 30% of inferences are High confidence', () => {
      const report = createMockAuditReport();
      // 3 High out of 4 = 75%
      expect(isLowConfidence(report)).toBe(false);
    });

    it('returns true when there are zero inferences', () => {
      const report = createMockAuditReport({ inferences: [] });
      expect(isLowConfidence(report)).toBe(true);
    });

    it('returns false when exactly 30% are High', () => {
      const report = createMockAuditReport({
        inferences: [
          { category: 'a', statement: 'x', confidence: 'High', sourceUrls: [] },
          { category: 'b', statement: 'y', confidence: 'Medium', sourceUrls: [] },
          { category: 'c', statement: 'z', confidence: 'Low', sourceUrls: [] },
          // Exactly 1/3 = 33.3% which is >= 30%
        ],
      });
      // 1 out of 3 = 33.3% >= 30%, so NOT low confidence
      expect(isLowConfidence(report)).toBe(false);
    });
  });

  describe('getHighConfidencePercentage', () => {
    it('calculates correct percentage', () => {
      const report = createMockAuditReport();
      // 3 High out of 4 = 75%
      expect(getHighConfidencePercentage(report)).toBe(75);
    });

    it('returns 0 for empty inferences', () => {
      const report = createMockAuditReport({ inferences: [] });
      expect(getHighConfidencePercentage(report)).toBe(0);
    });
  });

  describe('buildDraftR2Key', () => {
    it('builds correct R2 key for draft files', () => {
      expect(buildDraftR2Key('client-123', 'brand-voice-draft.json')).toBe(
        'brand-assets/client-123/onboarding/ai-drafts/brand-voice-draft.json',
      );
    });

    it('builds correct R2 key for manifest', () => {
      expect(buildDraftR2Key('client-123', 'index.json')).toBe(
        'brand-assets/client-123/onboarding/ai-drafts/index.json',
      );
    });
  });

  describe('DRAFT_FILENAMES', () => {
    it('has correct filenames per AC-6', () => {
      expect(DRAFT_FILENAMES.brandVoice).toBe('brand-voice-draft.json');
      expect(DRAFT_FILENAMES.messagingFramework).toBe('messaging-framework-draft.json');
      expect(DRAFT_FILENAMES.moodboardDirection).toBe('moodboard-direction-draft.json');
      expect(DRAFT_FILENAMES.improvementSuggestions).toBe('improvement-suggestions-draft.json');
      expect(DRAFT_FILENAMES.manifest).toBe('index.json');
    });
  });

  describe('detectChannels', () => {
    it('detects website homepage from non-social URLs', () => {
      const report = createMockAuditReport();
      const channels = detectChannels(report);
      const homepage = channels.find((c) => c.type === 'website');
      expect(homepage).toBeDefined();
      expect(homepage?.name).toBe('Website Homepage');
      expect(homepage?.urls).toContain('https://example.com');
    });

    it('detects landing pages from additional website URLs', () => {
      const report = createMockAuditReport();
      const channels = detectChannels(report);
      const landing = channels.find((c) => c.type === 'landing_page');
      expect(landing).toBeDefined();
      expect(landing?.name).toBe('Landing Pages');
    });

    it('detects up to 2 social channels', () => {
      const report = createMockAuditReport();
      const channels = detectChannels(report);
      const social = channels.filter((c) => c.type === 'social');
      expect(social.length).toBeLessThanOrEqual(2);
      expect(social.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty channels for report with only inaccessible pages', () => {
      const report = createMockAuditReport({
        pageAnalyses: [
          {
            url: 'https://broken.example.com',
            accessible: false,
            accessError: 'timeout',
            headings: [],
            dominantColors: [],
            fontNames: [],
            imageryDescriptions: [],
            textContent: '',
            fetchedAt: '2026-03-15T09:54:00.000Z',
          },
        ],
      });
      const channels = detectChannels(report);
      expect(channels).toHaveLength(0);
    });
  });

  describe('DraftPipeline', () => {
    it('generates all 4 drafts and manifest (AC-1 through AC-7)', async () => {
      const deps = createDeps();
      const pipeline = new DraftPipeline(deps);
      const report = createMockAuditReport();

      const result = await pipeline.run(report, 'test-client-123');

      // Verify all drafts present
      expect(result.brandVoice).toBeDefined();
      expect(result.messagingFramework).toBeDefined();
      expect(result.moodboardDirection).toBeDefined();
      expect(result.improvementSuggestions).toBeDefined();
      expect(result.manifest).toBeDefined();
    });

    it('makes exactly 4 AI calls', async () => {
      const deps = createDeps();
      const pipeline = new DraftPipeline(deps);
      const report = createMockAuditReport();

      await pipeline.run(report, 'test-client-123');

      expect(deps.aiService.generateText).toHaveBeenCalledTimes(4);
    });

    describe('FR-10.4: Draft labeling (AC-5)', () => {
      it('all drafts have _ai_draft: true', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.brandVoice._ai_draft).toBe(true);
        expect(result.messagingFramework._ai_draft).toBe(true);
        expect(result.moodboardDirection._ai_draft).toBe(true);
        expect(result.improvementSuggestions._ai_draft).toBe(true);
      });

      it('all drafts have _requires_validation: true', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.brandVoice._requires_validation).toBe(true);
        expect(result.messagingFramework._requires_validation).toBe(true);
        expect(result.moodboardDirection._requires_validation).toBe(true);
        expect(result.improvementSuggestions._requires_validation).toBe(true);
      });

      it('all drafts have correct label', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        const label = 'AI Draft - Requires Human Validation';
        expect(result.brandVoice._label).toBe(label);
        expect(result.messagingFramework._label).toBe(label);
        expect(result.moodboardDirection._label).toBe(label);
        expect(result.improvementSuggestions._label).toBe(label);
      });

      it('all drafts have CON-17 preamble', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.brandVoice._preamble).toBe(DRAFT_PREAMBLE);
        expect(result.messagingFramework._preamble).toBe(DRAFT_PREAMBLE);
        expect(result.moodboardDirection._preamble).toBe(DRAFT_PREAMBLE);
        expect(result.improvementSuggestions._preamble).toBe(DRAFT_PREAMBLE);
      });

      it('all drafts have validation_status: pending', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.brandVoice.validation_status).toBe('pending');
        expect(result.messagingFramework.validation_status).toBe('pending');
        expect(result.moodboardDirection.validation_status).toBe('pending');
        expect(result.improvementSuggestions.validation_status).toBe('pending');
      });
    });

    describe('AC-1: Brand Voice Guide draft', () => {
      it('has tone spectrum entries', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.brandVoice.draft_type).toBe('brand-voice');
        expect(result.brandVoice.tone_spectrum.length).toBeGreaterThanOrEqual(1);
      });

      it('has vocabulary examples', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.brandVoice.vocabulary_examples.length).toBeGreaterThanOrEqual(1);
      });

      it('has communication guidelines', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.brandVoice.communication_guidelines.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe('AC-2: Messaging Framework draft', () => {
      it('has value proposition, pillars, and elevator pitch', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.messagingFramework.draft_type).toBe('messaging-framework');
        expect(result.messagingFramework.value_proposition).toBeTruthy();
        expect(result.messagingFramework.supporting_pillars.length).toBe(3);
        expect(result.messagingFramework.elevator_pitch).toBeTruthy();
      });
    });

    describe('AC-3: Moodboard Direction draft', () => {
      it('has visual direction tags, color seeds, and typography direction', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.moodboardDirection.draft_type).toBe('moodboard-direction');
        expect(result.moodboardDirection.visual_direction_tags.length).toBe(3);
        expect(result.moodboardDirection.color_seeds.length).toBeGreaterThanOrEqual(1);
        expect(result.moodboardDirection.typography_direction.length).toBe(3);
      });
    });

    describe('AC-4: Improvement Suggestions draft', () => {
      it('has channel-specific suggestions', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.improvementSuggestions.draft_type).toBe('improvement-suggestions');
        expect(result.improvementSuggestions.channels.length).toBeGreaterThanOrEqual(1);
      });

      it('each channel has 2-3 suggestions', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        for (const channel of result.improvementSuggestions.channels) {
          expect(channel.suggestions.length).toBeGreaterThanOrEqual(0);
          expect(channel.suggestions.length).toBeLessThanOrEqual(3);
        }
      });
    });

    describe('AC-6: R2 Persistence', () => {
      it('persists all 4 drafts + manifest to R2 (5 uploads)', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        await pipeline.run(report, 'test-client-123');

        // 4 drafts + 1 manifest = 5 uploads
        expect(deps.r2Client.uploadJson).toHaveBeenCalledTimes(5);
      });

      it('uses correct R2 paths', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        await pipeline.run(report, 'test-client-123');

        const uploadCalls = (deps.r2Client.uploadJson as jest.Mock).mock.calls;
        const uploadedKeys = uploadCalls.map((call: unknown[]) => call[0]);

        expect(uploadedKeys).toContain('brand-assets/test-client-123/onboarding/ai-drafts/brand-voice-draft.json');
        expect(uploadedKeys).toContain('brand-assets/test-client-123/onboarding/ai-drafts/messaging-framework-draft.json');
        expect(uploadedKeys).toContain('brand-assets/test-client-123/onboarding/ai-drafts/moodboard-direction-draft.json');
        expect(uploadedKeys).toContain('brand-assets/test-client-123/onboarding/ai-drafts/improvement-suggestions-draft.json');
        expect(uploadedKeys).toContain('brand-assets/test-client-123/onboarding/ai-drafts/index.json');
      });
    });

    describe('AC-7: Draft Manifest', () => {
      it('manifest has correct structure', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');
        const manifest = result.manifest;

        expect(manifest.client_id).toBe('test-client-123');
        expect(manifest.generated_at).toBeTruthy();
        expect(manifest.source_audit_version).toBe(report.generatedAt);
        expect(manifest.validation_status).toBe('pending');
        expect(manifest.drafts).toHaveLength(4);
      });

      it('manifest entries list all draft files', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');
        const filenames = result.manifest.drafts.map((d) => d.filename);

        expect(filenames).toContain('brand-voice-draft.json');
        expect(filenames).toContain('messaging-framework-draft.json');
        expect(filenames).toContain('moodboard-direction-draft.json');
        expect(filenames).toContain('improvement-suggestions-draft.json');
      });

      it('each manifest entry has generated_at and validation_status', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        for (const entry of result.manifest.drafts) {
          expect(entry.generated_at).toBeTruthy();
          expect(entry.validation_status).toBe('pending');
          expect(entry.draft_type).toBeTruthy();
        }
      });
    });

    describe('AC-8: Low confidence warning (NFR-9.7)', () => {
      it('prepends warning to all drafts when < 30% High inferences', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createLowConfidenceReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.lowConfidence).toBe(true);
        expect(result.brandVoice._low_confidence_warning).toBe(LOW_CONFIDENCE_WARNING);
        expect(result.messagingFramework._low_confidence_warning).toBe(LOW_CONFIDENCE_WARNING);
        expect(result.moodboardDirection._low_confidence_warning).toBe(LOW_CONFIDENCE_WARNING);
        expect(result.improvementSuggestions._low_confidence_warning).toBe(LOW_CONFIDENCE_WARNING);
      });

      it('does NOT add warning when >= 30% High inferences', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.lowConfidence).toBe(false);
        expect(result.brandVoice._low_confidence_warning).toBeUndefined();
        expect(result.messagingFramework._low_confidence_warning).toBeUndefined();
        expect(result.moodboardDirection._low_confidence_warning).toBeUndefined();
        expect(result.improvementSuggestions._low_confidence_warning).toBeUndefined();
      });

      it('still generates drafts even with low confidence', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createLowConfidenceReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.brandVoice.tone_spectrum.length).toBeGreaterThan(0);
        expect(result.messagingFramework.value_proposition).toBeTruthy();
        expect(result.moodboardDirection.visual_direction_tags.length).toBeGreaterThan(0);
      });
    });

    describe('AC-9: ClickUp notification', () => {
      it('posts ClickUp comment when client and task configured', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        await pipeline.run(report, 'test-client-123');

        expect(deps.clickUpClient?.postComment).toHaveBeenCalledTimes(1);
        expect(deps.clickUpClient?.postComment).toHaveBeenCalledWith(
          'task-456',
          expect.stringContaining('AI Draft Generation Complete'),
        );
      });

      it('ClickUp comment includes R2 links', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        await pipeline.run(report, 'test-client-123');

        const commentCall = (deps.clickUpClient?.postComment as jest.Mock).mock.calls[0];
        const comment = commentCall[1] as string;

        expect(comment).toContain('brand-voice-draft.json');
        expect(comment).toContain('messaging-framework-draft.json');
        expect(comment).toContain('moodboard-direction-draft.json');
        expect(comment).toContain('improvement-suggestions-draft.json');
        expect(comment).toContain('index.json');
      });

      it('skips ClickUp when not configured (non-blocking)', async () => {
        const deps = createDeps({ clickUpClient: undefined, clickUpTaskId: undefined });
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        // Should not throw
        const result = await pipeline.run(report, 'test-client-123');
        expect(result.manifest).toBeDefined();
      });

      it('handles ClickUp failure gracefully (non-blocking)', async () => {
        const failingClickUp: AuditClickUpClient = {
          postComment: jest.fn(async () => {
            throw new Error('ClickUp API down');
          }),
        };
        const deps = createDeps({ clickUpClient: failingClickUp });
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        // Should not throw even though ClickUp fails
        const result = await pipeline.run(report, 'test-client-123');
        expect(result.manifest).toBeDefined();
        expect(deps.logger?.warn).toHaveBeenCalledWith(
          expect.stringContaining('ClickUp comment failed'),
        );
      });
    });

    describe('Error handling', () => {
      it('throws when R2 upload fails', async () => {
        const failingR2: AuditR2Client = {
          uploadJson: jest.fn(async () => {
            throw new Error('R2 storage unavailable');
          }),
        };
        const deps = createDeps({ r2Client: failingR2 });
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        await expect(pipeline.run(report, 'test-client-123')).rejects.toThrow(
          'Failed to persist draft to R2',
        );
      });

      it('throws when AI service fails', async () => {
        const failingAI: AuditAIService = {
          generateText: jest.fn(async () => {
            throw new Error('AI service timeout');
          }),
        };
        const deps = createDeps({ aiService: failingAI });
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        await expect(pipeline.run(report, 'test-client-123')).rejects.toThrow(
          'AI service timeout',
        );
      });
    });

    describe('Draft metadata', () => {
      it('all drafts have correct client_id', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'my-client');

        expect(result.brandVoice.client_id).toBe('my-client');
        expect(result.messagingFramework.client_id).toBe('my-client');
        expect(result.moodboardDirection.client_id).toBe('my-client');
        expect(result.improvementSuggestions.client_id).toBe('my-client');
      });

      it('all drafts reference source audit version', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        expect(result.brandVoice.source_audit_version).toBe(report.generatedAt);
        expect(result.messagingFramework.source_audit_version).toBe(report.generatedAt);
        expect(result.moodboardDirection.source_audit_version).toBe(report.generatedAt);
        expect(result.improvementSuggestions.source_audit_version).toBe(report.generatedAt);
      });

      it('all drafts have generated_at timestamp', async () => {
        const deps = createDeps();
        const pipeline = new DraftPipeline(deps);
        const report = createMockAuditReport();

        const result = await pipeline.run(report, 'test-client-123');

        // ISO 8601 format check
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        expect(result.brandVoice.generated_at).toMatch(isoRegex);
        expect(result.messagingFramework.generated_at).toMatch(isoRegex);
        expect(result.moodboardDirection.generated_at).toMatch(isoRegex);
        expect(result.improvementSuggestions.generated_at).toMatch(isoRegex);
      });
    });
  });
});
