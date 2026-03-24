/**
 * Unit tests for ContentModerator.
 */

import { ContentModerator } from '../moderator';
import type { AIService } from '@brand-system/ai-service';
import type { ModerationContext } from '../types';

// Mock AIService
const createMockAIService = (responseText: string): AIService => {
  return {
    generateText: jest.fn().mockResolvedValue({
      text: responseText,
      provider: 'claude',
      model: 'claude-haiku-3-5',
      inputTokens: 100,
      outputTokens: 50,
      costUsd: 0.001,
      latencyMs: 500,
    }),
    generateImage: jest.fn(),
  } as unknown as AIService;
};

describe('ContentModerator', () => {
  const baseContext: ModerationContext = {
    clientId: 'test-client',
    brandForbiddenWords: ['cheap', 'discount'],
    competitorNames: ['CompetitorA', 'CompetitorB'],
  };

  describe('All filters pass', () => {
    it('should return passed: true when no flags are raised', async () => {
      const aiResponse = JSON.stringify({
        offensiveLanguage: { detected: false, examples: [] },
        factualClaims: { detected: false, sentences: [] },
        legalRisks: { detected: false, phrases: [] },
      });

      const mockAI = createMockAIService(aiResponse);
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate(
        'This is a clean, professional brand message.',
        baseContext,
      );

      expect(result.passed).toBe(true);
      expect(result.flags).toHaveLength(0);
      expect(result.requiresHumanReview).toBe(false);
      expect(result.severity).toBe('PASS');
    });
  });

  describe('Profanity word-list detection', () => {
    it('should flag profanity from word list with FAIL severity', async () => {
      const aiResponse = JSON.stringify({
        offensiveLanguage: { detected: false, examples: [] },
        factualClaims: { detected: false, sentences: [] },
        legalRisks: { detected: false, phrases: [] },
      });

      const mockAI = createMockAIService(aiResponse);
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate(
        'This is a fucking terrible product.',
        baseContext,
      );

      expect(result.passed).toBe(false);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].filter).toBe('profanity');
      expect(result.flags[0].severity).toBe('FAIL');
      expect(result.flags[0].matchedContent).toContain('fucking');
      expect(result.requiresHumanReview).toBe(true);
      expect(result.severity).toBe('FAIL');
    });

    it('should detect Portuguese profanity', async () => {
      const aiResponse = JSON.stringify({
        offensiveLanguage: { detected: false, examples: [] },
        factualClaims: { detected: false, sentences: [] },
        legalRisks: { detected: false, phrases: [] },
      });

      const mockAI = createMockAIService(aiResponse);
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate('Que porra é essa?', baseContext);

      expect(result.passed).toBe(false);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].filter).toBe('profanity');
      expect(result.flags[0].matchedContent).toContain('porra');
    });
  });

  describe('Competitor mention detection', () => {
    it('should flag competitor names with WARN severity', async () => {
      const aiResponse = JSON.stringify({
        offensiveLanguage: { detected: false, examples: [] },
        factualClaims: { detected: false, sentences: [] },
        legalRisks: { detected: false, phrases: [] },
      });

      const mockAI = createMockAIService(aiResponse);
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate(
        'Unlike CompetitorA, we offer better service.',
        baseContext,
      );

      expect(result.passed).toBe(false);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].filter).toBe('competitor');
      expect(result.flags[0].severity).toBe('WARN');
      expect(result.flags[0].matchedContent).toContain('CompetitorA');
      expect(result.requiresHumanReview).toBe(true);
      expect(result.severity).toBe('WARN');
    });

    it('should be case-insensitive', async () => {
      const aiResponse = JSON.stringify({
        offensiveLanguage: { detected: false, examples: [] },
        factualClaims: { detected: false, sentences: [] },
        legalRisks: { detected: false, phrases: [] },
      });

      const mockAI = createMockAIService(aiResponse);
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate(
        'competitora is not as good.',
        baseContext,
      );

      expect(result.flags[0].matchedContent).toContain('CompetitorA');
    });
  });

  describe('Forbidden words detection', () => {
    it('should flag brand-forbidden words with FAIL severity', async () => {
      const aiResponse = JSON.stringify({
        offensiveLanguage: { detected: false, examples: [] },
        factualClaims: { detected: false, sentences: [] },
        legalRisks: { detected: false, phrases: [] },
      });

      const mockAI = createMockAIService(aiResponse);
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate(
        'Get our cheap discount today!',
        baseContext,
      );

      expect(result.passed).toBe(false);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].filter).toBe('forbidden-words');
      expect(result.flags[0].severity).toBe('FAIL');
      expect(result.flags[0].matchedContent).toEqual(expect.arrayContaining(['cheap', 'discount']));
      expect(result.severity).toBe('FAIL');
    });
  });

  describe('AI-powered factual claims detection', () => {
    it('should flag factual claims from AI with WARN severity', async () => {
      const aiResponse = JSON.stringify({
        offensiveLanguage: { detected: false, examples: [] },
        factualClaims: {
          detected: true,
          sentences: ['Our product increases sales by 300%.'],
        },
        legalRisks: { detected: false, phrases: [] },
      });

      const mockAI = createMockAIService(aiResponse);
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate(
        'Our product increases sales by 300%.',
        baseContext,
      );

      expect(result.passed).toBe(false);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].filter).toBe('factual-claims');
      expect(result.flags[0].severity).toBe('WARN');
      expect(result.flags[0].matchedContent).toContain('Our product increases sales by 300%.');
      expect(result.severity).toBe('WARN');
    });
  });

  describe('AI-powered legal compliance detection', () => {
    it('should flag legal risks from AI with FAIL severity', async () => {
      const aiResponse = JSON.stringify({
        offensiveLanguage: { detected: false, examples: [] },
        factualClaims: { detected: false, sentences: [] },
        legalRisks: {
          detected: true,
          phrases: ['100% guaranteed safe', 'scientifically proven'],
        },
      });

      const mockAI = createMockAIService(aiResponse);
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate(
        'Our product is 100% guaranteed safe and scientifically proven.',
        baseContext,
      );

      expect(result.passed).toBe(false);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].filter).toBe('legal-compliance');
      expect(result.flags[0].severity).toBe('FAIL');
      expect(result.flags[0].matchedContent).toEqual(
        expect.arrayContaining(['100% guaranteed safe', 'scientifically proven']),
      );
      expect(result.severity).toBe('FAIL');
    });
  });

  describe('Multiple simultaneous flags', () => {
    it('should aggregate multiple flags and use highest severity', async () => {
      const aiResponse = JSON.stringify({
        offensiveLanguage: { detected: false, examples: [] },
        factualClaims: {
          detected: true,
          sentences: ['Our product is the best.'],
        },
        legalRisks: { detected: false, phrases: [] },
      });

      const mockAI = createMockAIService(aiResponse);
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate(
        'CompetitorA sucks. Our cheap product is the best.',
        baseContext,
      );

      expect(result.passed).toBe(false);
      expect(result.flags.length).toBeGreaterThan(1);

      // Should have: competitor (WARN), forbidden-words (FAIL), factual-claims (WARN)
      const filterTypes = result.flags.map((f) => f.filter);
      expect(filterTypes).toContain('competitor');
      expect(filterTypes).toContain('forbidden-words');
      expect(filterTypes).toContain('factual-claims');

      // Highest severity should be FAIL
      expect(result.severity).toBe('FAIL');
      expect(result.requiresHumanReview).toBe(true);
    });
  });

  describe('Filter disabling via ModerationOptions', () => {
    it('should skip disabled filters', async () => {
      const aiResponse = JSON.stringify({
        offensiveLanguage: { detected: false, examples: [] },
        factualClaims: { detected: false, sentences: [] },
        legalRisks: { detected: false, phrases: [] },
      });

      const mockAI = createMockAIService(aiResponse);
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate(
        'This cheap product mentions CompetitorA.',
        baseContext,
        {
          enableForbiddenWords: false,
          enableCompetitor: false,
        },
      );

      // Should pass because competitor and forbidden-words filters are disabled
      expect(result.passed).toBe(true);
      expect(result.flags).toHaveLength(0);
    });

    it('should skip AI calls if all AI filters are disabled', async () => {
      const mockAI = createMockAIService('SHOULD_NOT_BE_CALLED');
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate('Clean content.', baseContext, {
        enableProfanity: false,
        enableFactualClaims: false,
        enableLegalCompliance: false,
      });

      expect(result.passed).toBe(true);
      expect(mockAI.generateText).not.toHaveBeenCalled();
    });
  });

  describe('AI parsing error handling', () => {
    it('should gracefully degrade on AI response parse error', async () => {
      const mockAI = createMockAIService('INVALID JSON');
      const moderator = new ContentModerator(mockAI);

      const result = await moderator.moderate('Some content.', baseContext);

      // Should not throw, should default to no AI flags
      expect(result.passed).toBe(true);
      expect(result.flags).toHaveLength(0);
    });
  });
});
