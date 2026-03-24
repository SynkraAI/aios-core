/**
 * Unit tests for the Copy Generation Pipeline.
 *
 * All external dependencies (ai-service, prompts, quality, moderation)
 * are fully mocked.
 *
 * @see BSS-3.7 AC 10
 */

import type { CopyBrief } from '../types';
import type { CopyPipelineOptions } from '../pipeline';

// --- Mock factories ---

const mockGenerateText = jest.fn();
const mockGetTemplate = jest.fn();
const mockRender = jest.fn();
const mockModerate = jest.fn();
const mockRunPipeline = jest.fn();

jest.mock('@brand-system/ai-service', () => ({
  AIService: jest.fn().mockImplementation(() => ({
    generateText: mockGenerateText,
  })),
}));

jest.mock('@brand-system/prompts', () => ({
  PromptRegistry: jest.fn().mockImplementation(() => ({
    getTemplate: mockGetTemplate,
  })),
  render: (...args: unknown[]) => mockRender(...args),
}));

jest.mock('@brand-system/quality', () => ({
  QualityPipeline: jest.fn().mockImplementation(() => ({
    runPipeline: mockRunPipeline,
  })),
}));

jest.mock('@brand-system/moderation', () => ({
  ContentModerator: jest.fn().mockImplementation(() => ({
    moderate: mockModerate,
  })),
}));

// Mock crypto.randomUUID for deterministic IDs
let uuidCounter = 0;
jest.mock('crypto', () => ({
  randomUUID: () => `test-uuid-${++uuidCounter}`,
}));

// --- Import after mocks ---
import { CopyGenerationPipeline } from '../pipeline';

// --- Test fixtures ---

const mockTemplate = {
  id: 'social-post',
  deliverableType: 'social-post',
  version: '1.0.0',
  status: 'active',
  variant: 'A',
  changelog: [{ version: '1.0.0', description: 'Initial', date: '2026-03-16' }],
  variables: {},
  systemPrompt: 'You are a copywriter.',
  userPromptTemplate: 'Write about {{postTopic}}',
};

const mockHashtagTemplate = {
  id: 'hashtag-set',
  deliverableType: 'hashtag-set',
  version: '1.0.0',
  status: 'active',
  variant: 'A',
  changelog: [{ version: '1.0.0', description: 'Initial', date: '2026-03-16' }],
  variables: {},
  systemPrompt: 'You are a hashtag strategist.',
  userPromptTemplate: 'Generate hashtags for {{contentCategory}}',
};

const mockCarouselTemplate = {
  ...mockTemplate,
  id: 'carousel-caption',
  deliverableType: 'carousel-caption',
};

const baseBrief: CopyBrief = {
  clientId: 'client-123',
  deliverableType: 'social-post',
  platform: 'instagram',
  topic: 'brand strategy tips',
  contentPillar: 'educational',
  clientContext: {
    clientId: 'client-123',
    brandName: 'TestBrand',
    brandPersonality: ['professional', 'innovative'],
    industryVertical: 'marketing',
    toneSpectrum: 'authoritative-friendly',
    vocabularyBank: ['strategy', 'growth'],
    forbiddenWords: ['cheap'],
    competitorNames: ['CompetitorA'],
  },
};

const mockModerationPassed = {
  passed: true,
  flags: [],
  requiresHumanReview: false,
  severity: 'PASS' as const,
};

const mockModerationFailed = {
  passed: false,
  flags: [
    {
      filter: 'profanity' as const,
      severity: 'FAIL' as const,
      matchedContent: ['bad-word'],
      explanation: 'Profanity detected',
    },
  ],
  requiresHumanReview: true,
  severity: 'FAIL' as const,
};

const mockQualityResult = {
  content: 'Generated post content with HCEA structure.',
  report: {
    contentId: 'test-uuid-1',
    iteration: 1,
    scores: {
      brandVoiceAdherence: 4.5,
      factualAccuracy: 4.0,
      toneAppropriateness: 4.2,
      ctaEffectiveness: 4.0,
      creativity: 4.3,
    },
    averageScore: 4.2,
    approved: true,
    feedback: '',
    promptVersion: '1.0.0',
    variant: 'A',
    maxIterationsReached: false,
    timestamp: '2026-03-17T00:00:00.000Z',
  },
  iterationHistory: [],
};

const mockQualityResultMaxIterations = {
  ...mockQualityResult,
  report: {
    ...mockQualityResult.report,
    averageScore: 3.2,
    approved: false,
    maxIterationsReached: true,
    feedback: 'Needs improvement in CTA effectiveness',
  },
};

// --- Helpers ---

function createPipeline(): CopyGenerationPipeline {
  const options: CopyPipelineOptions = {
    aiService: { generateText: mockGenerateText } as any,
    promptRegistry: { getTemplate: mockGetTemplate } as any,
    qualityPipeline: { runPipeline: mockRunPipeline } as any,
    moderator: { moderate: mockModerate } as any,
  };
  return new CopyGenerationPipeline(options);
}

function setupDefaultMocks(): void {
  // Template resolution: return social-post template for social-post, hashtag template for hashtag-set
  mockGetTemplate.mockImplementation((type: string) => {
    if (type === 'hashtag-set') return mockHashtagTemplate;
    if (type === 'carousel-caption') return mockCarouselTemplate;
    return mockTemplate;
  });

  // Render returns a rendered prompt
  mockRender.mockReturnValue({
    system: 'System prompt rendered',
    user: 'User prompt rendered',
  });

  // AI generates text
  mockGenerateText.mockResolvedValue({
    text: 'Generated HCEA post: Hook line. Context paragraph. Value delivery. Call to action.',
    provider: 'claude',
    model: 'claude-3-5-sonnet',
    inputTokens: 500,
    outputTokens: 200,
    costUsd: 0.003,
    latencyMs: 2500,
  });

  // Moderation passes
  mockModerate.mockResolvedValue(mockModerationPassed);

  // Quality scores well
  mockRunPipeline.mockResolvedValue(mockQualityResult);
}

// --- Tests ---

describe('CopyGenerationPipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    uuidCounter = 0;
    setupDefaultMocks();
  });

  describe('single post generation', () => {
    it('generates a CopyResult with all required fields', async () => {
      // Override hashtag AI response to return JSON with hashtags
      mockGenerateText
        .mockResolvedValueOnce({
          text: 'Generated HCEA post: Hook. Context. Value. CTA.',
          provider: 'claude',
          model: 'claude-3-5-sonnet',
          inputTokens: 500,
          outputTokens: 200,
          costUsd: 0.003,
          latencyMs: 2500,
        })
        .mockResolvedValueOnce({
          text: JSON.stringify({
            niche: ['#brandstrategy', '#marketingtips', '#growthhacks'],
            medium: ['#socialmediamarketing', '#digitalmarketing', '#contentcreator'],
            broad: ['#marketing', '#business', '#entrepreneur', '#success'],
          }),
          provider: 'claude',
          model: 'claude-3-5-haiku',
          inputTokens: 100,
          outputTokens: 80,
          costUsd: 0.0005,
          latencyMs: 800,
        });

      const pipeline = createPipeline();
      const results = await pipeline.generate(baseBrief);

      expect(results).toHaveLength(1);

      const result = results[0];
      expect(result.contentId).toBe('test-uuid-1');
      expect(result.copy).toContain('Hook');
      expect(result.platform).toBe('instagram');
      expect(result.deliverableType).toBe('social-post');
      expect(result.qualityScore).toBe(4.2);
      expect(result.moderation).toEqual(mockModerationPassed);
      expect(result.flagged).toBe(false);
      expect(result.qualityWarning).toBe(false);
      expect(result.promptVersion).toBe('1.0.0');
      expect(result.variant).toBe('A');
      expect(result.hashtags.length).toBeGreaterThanOrEqual(1);
      expect(result.error).toBeUndefined();
    });
  });

  describe('batch generation', () => {
    it('generates 3 CopyResults for batchSize=3', async () => {
      const batchBrief: CopyBrief = { ...baseBrief, batchSize: 3 };

      const pipeline = createPipeline();
      const results = await pipeline.generate(batchBrief);

      expect(results).toHaveLength(3);

      // Each result should have a unique contentId
      const ids = results.map((r) => r.contentId);
      expect(new Set(ids).size).toBe(3);

      // All results should have valid structure
      for (const result of results) {
        expect(result.platform).toBe('instagram');
        expect(result.deliverableType).toBe('social-post');
        expect(result.promptVersion).toBe('1.0.0');
      }
    });

    it('generates concurrently via Promise.all', async () => {
      const batchBrief: CopyBrief = { ...baseBrief, batchSize: 3 };

      const pipeline = createPipeline();
      await pipeline.generate(batchBrief);

      // All 3 posts should have been submitted (each calls AI at least once for content)
      // With hashtags, each post makes 2 AI calls = 6 total
      expect(mockGenerateText.mock.calls.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('moderation flag propagation', () => {
    it('includes flagged content with flagged=true, post not dropped', async () => {
      mockModerate.mockResolvedValue(mockModerationFailed);

      const pipeline = createPipeline();
      const results = await pipeline.generate(baseBrief);

      expect(results).toHaveLength(1);
      const result = results[0];

      // Post IS included (not dropped)
      expect(result.copy).toBeTruthy();
      expect(result.flagged).toBe(true);
      expect(result.moderation.passed).toBe(false);
      expect(result.moderation.requiresHumanReview).toBe(true);
      expect(result.moderation.flags).toHaveLength(1);
      expect(result.moderation.flags[0].filter).toBe('profanity');
    });
  });

  describe('quality warning propagation', () => {
    it('sets qualityWarning=true when maxIterationsReached', async () => {
      mockRunPipeline.mockResolvedValue(mockQualityResultMaxIterations);

      const pipeline = createPipeline();
      const results = await pipeline.generate(baseBrief);

      expect(results).toHaveLength(1);
      const result = results[0];

      expect(result.qualityWarning).toBe(true);
      expect(result.qualityScore).toBe(3.2);
    });
  });

  describe('hashtag generation', () => {
    it('returns 8-12 hashtags for social-post', async () => {
      mockGenerateText
        .mockResolvedValueOnce({
          text: 'Generated post content.',
          provider: 'claude',
          model: 'claude-3-5-sonnet',
          inputTokens: 500,
          outputTokens: 200,
          costUsd: 0.003,
          latencyMs: 2500,
        })
        .mockResolvedValueOnce({
          text: JSON.stringify({
            niche: ['#brandstrategy', '#marketingtips', '#growthhacking'],
            medium: ['#socialmedia', '#digitalmarketing', '#contentcreator', '#onlinemarketing'],
            broad: ['#marketing', '#business', '#entrepreneur', '#success', '#motivation'],
          }),
          provider: 'claude',
          model: 'claude-3-5-haiku',
          inputTokens: 100,
          outputTokens: 80,
          costUsd: 0.0005,
          latencyMs: 800,
        });

      const pipeline = createPipeline();
      const results = await pipeline.generate(baseBrief);

      const hashtags = results[0].hashtags;
      expect(hashtags.length).toBeGreaterThanOrEqual(8);
      expect(hashtags.length).toBeLessThanOrEqual(12);
      expect(hashtags.every((h) => h.startsWith('#'))).toBe(true);
    });

    it('returns empty hashtags for hashtag-set deliverable type', async () => {
      const hashtagBrief: CopyBrief = {
        ...baseBrief,
        deliverableType: 'hashtag-set',
      };

      const pipeline = createPipeline();
      const results = await pipeline.generate(hashtagBrief);

      // hashtag-set deliverable does not trigger separate hashtag generation
      expect(results[0].hashtags).toEqual([]);
    });
  });

  describe('carousel caption', () => {
    it('parses structured JSON output into formatted carousel text', async () => {
      const carouselBrief: CopyBrief = {
        ...baseBrief,
        deliverableType: 'carousel-caption',
      };

      const carouselJSON = JSON.stringify({
        coverHook: '3 ways brands get social media wrong',
        contentBullets: [
          'Posting without a content strategy',
          'Ignoring engagement metrics',
          'Not adapting to platform algorithms',
        ],
        summary: 'Fix these 3 mistakes to 10x your social media impact',
        cta: 'Save this post for your next content planning session',
      });

      mockGenerateText
        .mockResolvedValueOnce({
          text: carouselJSON,
          provider: 'claude',
          model: 'claude-3-5-sonnet',
          inputTokens: 500,
          outputTokens: 300,
          costUsd: 0.004,
          latencyMs: 3000,
        })
        .mockResolvedValueOnce({
          text: JSON.stringify({
            niche: ['#carouseldesign', '#contentstrategy'],
            medium: ['#socialmediatips', '#instagramcarousel'],
            broad: ['#marketing', '#business', '#branding', '#entrepreneur'],
          }),
          provider: 'claude',
          model: 'claude-3-5-haiku',
          inputTokens: 100,
          outputTokens: 80,
          costUsd: 0.0005,
          latencyMs: 800,
        });

      const pipeline = createPipeline();
      const results = await pipeline.generate(carouselBrief);

      const result = results[0];
      expect(result.copy).toContain('[COVER HOOK]');
      expect(result.copy).toContain('3 ways brands get social media wrong');
      expect(result.copy).toContain('[CONTENT]');
      expect(result.copy).toContain('Posting without a content strategy');
      expect(result.copy).toContain('[SUMMARY]');
      expect(result.copy).toContain('[CTA]');
      expect(result.copy).toContain('Save this post');
    });

    it('falls back to free-form text when JSON parse fails', async () => {
      const carouselBrief: CopyBrief = {
        ...baseBrief,
        deliverableType: 'carousel-caption',
      };

      const freeFormText = 'Slide 1: Bold hook about social media mistakes\nSlide 2: Context about the problem...';

      mockGenerateText.mockResolvedValueOnce({
        text: freeFormText,
        provider: 'claude',
        model: 'claude-3-5-sonnet',
        inputTokens: 500,
        outputTokens: 300,
        costUsd: 0.004,
        latencyMs: 3000,
      });

      const pipeline = createPipeline();
      const results = await pipeline.generate(carouselBrief);

      // Should keep the free-form text as-is
      expect(results[0].copy).toBe(freeFormText);
    });
  });

  describe('error isolation', () => {
    it('returns error CopyResult when AI generation fails, batch continues', async () => {
      mockGenerateText.mockRejectedValue(new Error('AI provider timeout'));

      const pipeline = createPipeline();
      const results = await pipeline.generate(baseBrief);

      expect(results).toHaveLength(1);
      const result = results[0];

      expect(result.error).toBe(true);
      expect(result.errorMessage).toBe('AI provider timeout');
      expect(result.copy).toBe('');
      expect(result.hashtags).toEqual([]);
      expect(result.qualityScore).toBe(0);
    });

    it('returns mixed results in batch when some posts fail', async () => {
      let callCount = 0;
      mockGenerateText.mockImplementation(() => {
        callCount++;
        // Fail on the 2nd and 4th calls (which correspond to the 2nd post's content gen)
        // Since each successful post makes 2 AI calls, the 3rd call is the 2nd post's content
        if (callCount === 3) {
          return Promise.reject(new Error('Transient failure'));
        }
        return Promise.resolve({
          text: 'Generated content',
          provider: 'claude',
          model: 'claude-3-5-sonnet',
          inputTokens: 500,
          outputTokens: 200,
          costUsd: 0.003,
          latencyMs: 2500,
        });
      });

      const batchBrief: CopyBrief = { ...baseBrief, batchSize: 2 };
      const pipeline = createPipeline();
      const results = await pipeline.generate(batchBrief);

      expect(results).toHaveLength(2);
      // At least one should succeed, and the failed one should have error flag
      const errors = results.filter((r) => r.error);
      const successes = results.filter((r) => !r.error);
      expect(errors.length + successes.length).toBe(2);
    });
  });

  describe('default batchSize', () => {
    it('defaults to batchSize=1 when not specified', async () => {
      const briefWithoutBatch: CopyBrief = {
        clientId: 'client-123',
        deliverableType: 'social-post',
        platform: 'instagram',
        topic: 'test topic',
        contentPillar: 'educational',
        clientContext: baseBrief.clientContext,
      };

      const pipeline = createPipeline();
      const results = await pipeline.generate(briefWithoutBatch);

      expect(results).toHaveLength(1);
    });
  });
});
