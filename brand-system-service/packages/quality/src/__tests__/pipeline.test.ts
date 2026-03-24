/**
 * QualityPipeline unit tests.
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline
 */

import { QualityPipeline } from '../pipeline';
import type { AIServiceProvider, AITextResponse } from '@brand-system/ai-service';
import type { PromptRegistry, ClientContext, PromptTemplate } from '@brand-system/prompts';

const mockTemplate: PromptTemplate = {
  id: 'social-post',
  deliverableType: 'social-post',
  version: '1.0.0',
  status: 'active',
  variant: 'A',
  changelog: [{ version: '1.0.0', description: 'Initial', date: '2026-03-17' }],
  variables: {
    brandName: { type: 'string', required: true },
    brandPersonality: { type: 'string[]', required: true },
    toneSpectrum: { type: 'string', required: true },
    industryVertical: { type: 'string', required: true },
  },
  systemPrompt: 'You are a copywriter.',
  userPromptTemplate: 'Write a post for {{brandName}}.',
};

const mockClientContext: ClientContext = {
  clientId: 'test-client',
  brandName: 'TestBrand',
  brandPersonality: ['bold'],
  industryVertical: 'tech',
  toneSpectrum: 'casual',
  vocabularyBank: [],
  forbiddenWords: [],
  competitorNames: [],
};

function makeAIResponse(text: string): AITextResponse {
  return {
    text,
    provider: 'claude',
    model: 'claude-3-sonnet',
    inputTokens: 100,
    outputTokens: 50,
    costUsd: 0.001,
    latencyMs: 500,
  };
}

function highScoresJson(): string {
  return JSON.stringify({
    brandVoiceAdherence: 5,
    factualAccuracy: 4,
    toneAppropriateness: 5,
    ctaEffectiveness: 4,
    creativity: 4,
    feedback: 'Great content overall.',
  });
}

function lowScoresJson(): string {
  return JSON.stringify({
    brandVoiceAdherence: 2,
    factualAccuracy: 3,
    toneAppropriateness: 2,
    ctaEffectiveness: 3,
    creativity: 2,
    feedback: 'Tone is too formal. Brand voice is off.',
  });
}

function createMockRegistry(template: PromptTemplate | undefined): PromptRegistry {
  return {
    getTemplate: jest.fn().mockReturnValue(template),
    registerTemplate: jest.fn(),
    listTemplates: jest.fn().mockReturnValue([]),
  } as unknown as PromptRegistry;
}

describe('QualityPipeline', () => {
  describe('runPipeline()', () => {
    it('should return approved content on first iteration when score >= 4.0', async () => {
      const generateText = jest.fn()
        // First call: content generation
        .mockResolvedValueOnce(makeAIResponse('Amazing post content'))
        // Second call: meta-evaluation
        .mockResolvedValueOnce(makeAIResponse(highScoresJson()));

      const aiService: AIServiceProvider = {
        generateText,
        generateImage: jest.fn(),
      };

      const registry = createMockRegistry(mockTemplate);
      const pipeline = new QualityPipeline(aiService, registry, { maxIterations: 3 });

      const result = await pipeline.runPipeline('social-post', mockClientContext, 'A');

      expect(result.content).toBe('Amazing post content');
      expect(result.report.approved).toBe(true);
      expect(result.report.maxIterationsReached).toBe(false);
      expect(result.iterationHistory).toHaveLength(1);
      expect(generateText).toHaveBeenCalledTimes(2); // 1 generation + 1 evaluation
    });

    it('should trigger regeneration when score < 4.0', async () => {
      const generateText = jest.fn()
        // Iteration 1: content + low score
        .mockResolvedValueOnce(makeAIResponse('Bad content'))
        .mockResolvedValueOnce(makeAIResponse(lowScoresJson()))
        // Iteration 2: content + high score
        .mockResolvedValueOnce(makeAIResponse('Improved content'))
        .mockResolvedValueOnce(makeAIResponse(highScoresJson()));

      const aiService: AIServiceProvider = {
        generateText,
        generateImage: jest.fn(),
      };

      const registry = createMockRegistry(mockTemplate);
      const pipeline = new QualityPipeline(aiService, registry, { maxIterations: 3 });

      const result = await pipeline.runPipeline('social-post', mockClientContext, 'A');

      expect(result.content).toBe('Improved content');
      expect(result.report.approved).toBe(true);
      expect(result.iterationHistory).toHaveLength(2);
      expect(generateText).toHaveBeenCalledTimes(4); // 2 iterations x (gen + eval)
    });

    it('should append feedback to regeneration prompt', async () => {
      const generateText = jest.fn()
        // Iteration 1: content + low score
        .mockResolvedValueOnce(makeAIResponse('Bad content'))
        .mockResolvedValueOnce(makeAIResponse(lowScoresJson()))
        // Iteration 2: content + high score
        .mockResolvedValueOnce(makeAIResponse('Better content'))
        .mockResolvedValueOnce(makeAIResponse(highScoresJson()));

      const aiService: AIServiceProvider = {
        generateText,
        generateImage: jest.fn(),
      };

      const registry = createMockRegistry(mockTemplate);
      const pipeline = new QualityPipeline(aiService, registry, { maxIterations: 3 });

      await pipeline.runPipeline('social-post', mockClientContext, 'A');

      // The second generation call (index 2) should include feedback
      const secondGenCall = generateText.mock.calls[2];
      expect(secondGenCall[0].prompt).toContain('[Previous feedback');
      expect(secondGenCall[0].prompt).toContain('Tone is too formal');
    });

    it('should return best result with maxIterationsReached when all iterations fail', async () => {
      // Slightly better scores for iteration 2 to test "best" tracking
      const mediumScoresJson = JSON.stringify({
        brandVoiceAdherence: 3,
        factualAccuracy: 3,
        toneAppropriateness: 3,
        ctaEffectiveness: 3,
        creativity: 3,
        feedback: 'Still needs improvement.',
      });

      const generateText = jest.fn()
        // Iteration 1: low
        .mockResolvedValueOnce(makeAIResponse('Content v1'))
        .mockResolvedValueOnce(makeAIResponse(lowScoresJson()))
        // Iteration 2: medium (best)
        .mockResolvedValueOnce(makeAIResponse('Content v2'))
        .mockResolvedValueOnce(makeAIResponse(mediumScoresJson))
        // Iteration 3: low again
        .mockResolvedValueOnce(makeAIResponse('Content v3'))
        .mockResolvedValueOnce(makeAIResponse(lowScoresJson()));

      const aiService: AIServiceProvider = {
        generateText,
        generateImage: jest.fn(),
      };

      const registry = createMockRegistry(mockTemplate);
      const pipeline = new QualityPipeline(aiService, registry, { maxIterations: 3 });

      const result = await pipeline.runPipeline('social-post', mockClientContext, 'A');

      // Best result is iteration 2 with average 3.0
      expect(result.content).toBe('Content v2');
      expect(result.report.maxIterationsReached).toBe(true);
      expect(result.report.approved).toBe(false);
      expect(result.iterationHistory).toHaveLength(3);
    });

    it('should throw when no template is found', async () => {
      const aiService: AIServiceProvider = {
        generateText: jest.fn(),
        generateImage: jest.fn(),
      };

      const registry = createMockRegistry(undefined);
      const pipeline = new QualityPipeline(aiService, registry);

      await expect(
        pipeline.runPipeline('social-post', mockClientContext, 'A'),
      ).rejects.toThrow('No active template found');
    });

    it('should respect QUALITY_MAX_ITERATIONS from options', async () => {
      const generateText = jest.fn()
        .mockResolvedValueOnce(makeAIResponse('Content'))
        .mockResolvedValueOnce(makeAIResponse(lowScoresJson()));

      const aiService: AIServiceProvider = {
        generateText,
        generateImage: jest.fn(),
      };

      const registry = createMockRegistry(mockTemplate);
      const pipeline = new QualityPipeline(aiService, registry, { maxIterations: 1 });

      const result = await pipeline.runPipeline('social-post', mockClientContext, 'A');

      expect(result.report.maxIterationsReached).toBe(true);
      expect(result.iterationHistory).toHaveLength(1);
      expect(generateText).toHaveBeenCalledTimes(2);
    });
  });
});
