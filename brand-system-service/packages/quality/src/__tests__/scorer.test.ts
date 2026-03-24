/**
 * QualityScorer unit tests.
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline
 */

import { QualityScorer } from '../scorer';
import type { ScorerClientContext } from '../scorer';
import type { AIServiceProvider, AITextResponse } from '@brand-system/ai-service';

const mockClientContext: ScorerClientContext = {
  clientId: 'test-client',
  brandName: 'TestBrand',
  brandPersonality: ['bold', 'innovative'],
  toneSpectrum: 'casual-professional',
  platform: 'instagram',
};

function createMockAIService(responseText: string): AIServiceProvider {
  return {
    generateText: jest.fn().mockResolvedValue({
      text: responseText,
      provider: 'claude',
      model: 'claude-3-sonnet',
      inputTokens: 100,
      outputTokens: 50,
      costUsd: 0.001,
      latencyMs: 500,
    } as AITextResponse),
    generateImage: jest.fn(),
  };
}

describe('QualityScorer', () => {
  describe('score()', () => {
    it('should parse 5-dimension scores from AI response', async () => {
      const responseJson = JSON.stringify({
        brandVoiceAdherence: 4,
        factualAccuracy: 5,
        toneAppropriateness: 3,
        ctaEffectiveness: 4,
        creativity: 4,
        feedback: 'Tone is slightly formal for Instagram.',
      });

      const aiService = createMockAIService(responseJson);
      const scorer = new QualityScorer(aiService);

      const report = await scorer.score(
        'Test content here',
        mockClientContext,
        '1.0.0',
        'A',
        1,
      );

      expect(report.scores.brandVoiceAdherence).toBe(4);
      expect(report.scores.factualAccuracy).toBe(5);
      expect(report.scores.toneAppropriateness).toBe(3);
      expect(report.scores.ctaEffectiveness).toBe(4);
      expect(report.scores.creativity).toBe(4);
      expect(report.feedback).toBe('Tone is slightly formal for Instagram.');
      expect(report.promptVersion).toBe('1.0.0');
      expect(report.variant).toBe('A');
      expect(report.iteration).toBe(1);
    });

    it('should compute correct average score', async () => {
      const responseJson = JSON.stringify({
        brandVoiceAdherence: 4,
        factualAccuracy: 5,
        toneAppropriateness: 3,
        ctaEffectiveness: 4,
        creativity: 4,
        feedback: 'Good overall.',
      });

      const aiService = createMockAIService(responseJson);
      const scorer = new QualityScorer(aiService);

      const report = await scorer.score(
        'Test content',
        mockClientContext,
        '1.0.0',
        'A',
      );

      // (4 + 5 + 3 + 4 + 4) / 5 = 20 / 5 = 4.0
      expect(report.averageScore).toBe(4.0);
    });

    it('should mark content as approved when average >= 4.0', async () => {
      const responseJson = JSON.stringify({
        brandVoiceAdherence: 5,
        factualAccuracy: 5,
        toneAppropriateness: 4,
        ctaEffectiveness: 4,
        creativity: 4,
        feedback: 'Excellent quality.',
      });

      const aiService = createMockAIService(responseJson);
      const scorer = new QualityScorer(aiService);

      const report = await scorer.score(
        'Great content',
        mockClientContext,
        '1.0.0',
        'A',
      );

      // (5 + 5 + 4 + 4 + 4) / 5 = 4.4
      expect(report.averageScore).toBe(4.4);
      expect(report.approved).toBe(true);
    });

    it('should mark content as NOT approved when average < 4.0', async () => {
      const responseJson = JSON.stringify({
        brandVoiceAdherence: 2,
        factualAccuracy: 3,
        toneAppropriateness: 2,
        ctaEffectiveness: 3,
        creativity: 2,
        feedback: 'Needs significant improvement.',
      });

      const aiService = createMockAIService(responseJson);
      const scorer = new QualityScorer(aiService);

      const report = await scorer.score(
        'Poor content',
        mockClientContext,
        '1.0.0',
        'A',
      );

      // (2 + 3 + 2 + 3 + 2) / 5 = 2.4
      expect(report.averageScore).toBe(2.4);
      expect(report.approved).toBe(false);
    });

    it('should clamp scores to 1-5 range', async () => {
      const responseJson = JSON.stringify({
        brandVoiceAdherence: 10,
        factualAccuracy: -1,
        toneAppropriateness: 0,
        ctaEffectiveness: 6,
        creativity: 3,
        feedback: 'Clamped scores.',
      });

      const aiService = createMockAIService(responseJson);
      const scorer = new QualityScorer(aiService);

      const report = await scorer.score(
        'Content',
        mockClientContext,
        '1.0.0',
        'A',
      );

      expect(report.scores.brandVoiceAdherence).toBe(5);
      expect(report.scores.factualAccuracy).toBe(1);
      expect(report.scores.toneAppropriateness).toBe(1);
      expect(report.scores.ctaEffectiveness).toBe(5);
      expect(report.scores.creativity).toBe(3);
    });

    it('should fallback to score 1.0 on all dimensions when AI call fails', async () => {
      const aiService: AIServiceProvider = {
        generateText: jest.fn().mockRejectedValue(new Error('API timeout')),
        generateImage: jest.fn(),
      };

      const scorer = new QualityScorer(aiService);

      const report = await scorer.score(
        'Content',
        mockClientContext,
        '1.0.0',
        'A',
      );

      expect(report.scores.brandVoiceAdherence).toBe(1);
      expect(report.scores.factualAccuracy).toBe(1);
      expect(report.scores.toneAppropriateness).toBe(1);
      expect(report.scores.ctaEffectiveness).toBe(1);
      expect(report.scores.creativity).toBe(1);
      expect(report.averageScore).toBe(1);
      expect(report.approved).toBe(false);
      expect(report.feedback).toContain('API timeout');
    });

    it('should fallback to score 1.0 on all dimensions when JSON parse fails', async () => {
      const aiService = createMockAIService('This is not JSON at all');
      const scorer = new QualityScorer(aiService);

      const report = await scorer.score(
        'Content',
        mockClientContext,
        '1.0.0',
        'A',
      );

      expect(report.averageScore).toBe(1);
      expect(report.approved).toBe(false);
      expect(report.feedback).toContain('Evaluation failed');
    });
  });

  describe('computeAverage()', () => {
    it('should compute correct average with precision', () => {
      const aiService = createMockAIService('{}');
      const scorer = new QualityScorer(aiService);

      const avg = scorer.computeAverage({
        brandVoiceAdherence: 4,
        factualAccuracy: 3,
        toneAppropriateness: 5,
        ctaEffectiveness: 4,
        creativity: 3,
      });

      // (4 + 3 + 5 + 4 + 3) / 5 = 19 / 5 = 3.8
      expect(avg).toBe(3.8);
    });
  });
});
