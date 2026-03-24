/**
 * ABTester unit tests.
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline (AC 5)
 */

import { ABTester } from '../ab-tester';
import type { AIServiceProvider, AITextResponse, TextGenerationOptions } from '@brand-system/ai-service';
import type { PromptRegistry, ClientContext, PromptTemplate } from '@brand-system/prompts';

function makeTemplate(variant: string): PromptTemplate {
  return {
    id: `social-post-${variant}`,
    deliverableType: 'social-post',
    version: '1.0.0',
    status: 'active',
    variant,
    changelog: [{ version: '1.0.0', description: 'Initial', date: '2026-03-17' }],
    variables: {
      brandName: { type: 'string', required: true },
      brandPersonality: { type: 'string[]', required: true },
      toneSpectrum: { type: 'string', required: true },
      industryVertical: { type: 'string', required: true },
    },
    systemPrompt: 'You are a copywriter.',
    userPromptTemplate: `Write a variant ${variant} post for {{brandName}}.`,
  };
}

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

describe('ABTester', () => {
  describe('compareVariants()', () => {
    it('should return variant B as winner when B scores higher', async () => {
      const variantAScores = JSON.stringify({
        brandVoiceAdherence: 4,
        factualAccuracy: 3,
        toneAppropriateness: 4,
        ctaEffectiveness: 4,
        creativity: 4,
        feedback: 'Factual accuracy could improve.',
      });

      const variantBScores = JSON.stringify({
        brandVoiceAdherence: 4,
        factualAccuracy: 5,
        toneAppropriateness: 4,
        ctaEffectiveness: 4,
        creativity: 4,
        feedback: 'Solid content.',
      });

      // Use prompt content to distinguish variant A vs B calls
      // Generation calls contain "variant A" or "variant B" in prompt
      // Evaluation calls contain "CONTENT TO EVALUATE" in prompt
      const perVariantGenCount: Record<string, number> = { A: 0, B: 0 };

      const generateText = jest.fn().mockImplementation((opts: TextGenerationOptions) => {
        const prompt = opts.prompt;

        if (prompt.includes('CONTENT TO EVALUATE')) {
          // Meta-evaluation call — check which content is being evaluated
          if (prompt.includes('Content A')) {
            return Promise.resolve(makeAIResponse(variantAScores));
          }
          return Promise.resolve(makeAIResponse(variantBScores));
        }

        // Content generation call — detect variant from prompt
        if (prompt.includes('variant A')) {
          perVariantGenCount['A']++;
          return Promise.resolve(makeAIResponse('Content A'));
        }
        perVariantGenCount['B']++;
        return Promise.resolve(makeAIResponse('Content B'));
      });

      const aiService: AIServiceProvider = {
        generateText,
        generateImage: jest.fn(),
      };

      const registry = {
        getTemplate: jest.fn().mockImplementation(
          (_type: string, _version: unknown, variant: string) => makeTemplate(variant),
        ),
        registerTemplate: jest.fn(),
        listTemplates: jest.fn().mockReturnValue([]),
      } as unknown as PromptRegistry;

      const tester = new ABTester(aiService, registry, { maxIterations: 1 });
      const report = await tester.compareVariants('social-post', mockClientContext);

      expect(report.winner).toBe('B');
      expect(report.variantA.report.averageScore).toBe(3.8);
      expect(report.variantB.report.averageScore).toBe(4.2);
      expect(report.scoreDifference).toBe(0.4);
      expect(report.clientId).toBe('test-client');
    });

    it('should return variant A as winner when scores are equal', async () => {
      const equalScores = JSON.stringify({
        brandVoiceAdherence: 4,
        factualAccuracy: 4,
        toneAppropriateness: 4,
        ctaEffectiveness: 4,
        creativity: 4,
        feedback: 'Good.',
      });

      const generateText = jest.fn().mockImplementation((opts: TextGenerationOptions) => {
        const prompt = opts.prompt;
        if (prompt.includes('CONTENT TO EVALUATE')) {
          return Promise.resolve(makeAIResponse(equalScores));
        }
        if (prompt.includes('variant A')) {
          return Promise.resolve(makeAIResponse('Content A'));
        }
        return Promise.resolve(makeAIResponse('Content B'));
      });

      const aiService: AIServiceProvider = {
        generateText,
        generateImage: jest.fn(),
      };

      const registry = {
        getTemplate: jest.fn().mockImplementation(
          (_type: string, _version: unknown, variant: string) => makeTemplate(variant),
        ),
        registerTemplate: jest.fn(),
        listTemplates: jest.fn().mockReturnValue([]),
      } as unknown as PromptRegistry;

      const tester = new ABTester(aiService, registry, { maxIterations: 1 });
      const report = await tester.compareVariants('social-post', mockClientContext);

      // Tie goes to A (>=)
      expect(report.winner).toBe('A');
      expect(report.scoreDifference).toBe(0);
    });

    it('should run both variants and return results for both', async () => {
      const scores = JSON.stringify({
        brandVoiceAdherence: 5,
        factualAccuracy: 5,
        toneAppropriateness: 5,
        ctaEffectiveness: 5,
        creativity: 5,
        feedback: 'Perfect.',
      });

      const generateText = jest.fn().mockResolvedValue(makeAIResponse(scores));

      const aiService: AIServiceProvider = {
        generateText,
        generateImage: jest.fn(),
      };

      const registry = {
        getTemplate: jest.fn().mockImplementation(
          (_type: string, _version: unknown, variant: string) => makeTemplate(variant),
        ),
        registerTemplate: jest.fn(),
        listTemplates: jest.fn().mockReturnValue([]),
      } as unknown as PromptRegistry;

      const tester = new ABTester(aiService, registry, { maxIterations: 1 });
      const report = await tester.compareVariants('social-post', mockClientContext);

      // Both variants should have been run (4 calls total: 2 gen + 2 eval)
      expect(generateText).toHaveBeenCalled();
      expect(report.variantA).toBeDefined();
      expect(report.variantB).toBeDefined();
      expect(report.deliverableType).toBe('social-post');
      expect(report.timestamp).toBeDefined();
    });
  });

  describe('getWinner()', () => {
    it('should return the winning variant result', () => {
      const aiService: AIServiceProvider = {
        generateText: jest.fn(),
        generateImage: jest.fn(),
      };

      const registry = {
        getTemplate: jest.fn(),
        registerTemplate: jest.fn(),
        listTemplates: jest.fn().mockReturnValue([]),
      } as unknown as PromptRegistry;

      const tester = new ABTester(aiService, registry);

      const mockReport = {
        deliverableType: 'social-post',
        clientId: 'test',
        variantA: { content: 'A content', report: { averageScore: 3.5 }, iterationHistory: [] },
        variantB: { content: 'B content', report: { averageScore: 4.5 }, iterationHistory: [] },
        winner: 'B' as const,
        scoreDifference: 1.0,
        timestamp: '2026-03-17T00:00:00.000Z',
      };

      const winner = tester.getWinner(mockReport as any);
      expect(winner.content).toBe('B content');
    });
  });
});
