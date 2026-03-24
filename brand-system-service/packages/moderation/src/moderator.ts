/**
 * ContentModerator — orchestrator for all moderation filters.
 * @module moderation/moderator
 */

import type { AIService } from '@brand-system/ai-service';
import type {
  ModerationContext,
  ModerationOptions,
  ModerationResult,
  ModerationFlag,
  ModerationSeverity,
  AIBatchCheckResponse,
} from './types';
import { checkProfanity, parseProfanityFromBatch } from './filters/profanity';
import { checkCompetitorMentions } from './filters/competitor';
import { checkForbiddenWords } from './filters/forbidden-words';
import { parseFactualClaimsFromBatch } from './filters/factual-claims';
import { parseLegalComplianceFromBatch } from './filters/legal-compliance';

/** Default moderation options — all filters enabled. */
const DEFAULT_OPTIONS: Required<ModerationOptions> = {
  enableProfanity: true,
  enableCompetitor: true,
  enableForbiddenWords: true,
  enableFactualClaims: true,
  enableLegalCompliance: true,
};

/**
 * Content moderation orchestrator.
 *
 * Runs all enabled filters and aggregates results.
 * AI-powered checks are batched into a single API call for efficiency.
 */
export class ContentModerator {
  private readonly aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * Moderate content through all enabled filters.
   *
   * @param content - Content text to moderate
   * @param context - Moderation context (client ID, forbidden words, competitors)
   * @param options - Filter enable/disable options
   * @returns Moderation result with all flags
   */
  async moderate(
    content: string,
    context: ModerationContext,
    options: ModerationOptions = {},
  ): Promise<ModerationResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const flags: ModerationFlag[] = [];

    // Phase 1: Word-list-based filters (synchronous, fast)
    if (opts.enableProfanity) {
      const profanityFlag = checkProfanity(content);
      if (profanityFlag) flags.push(profanityFlag);
    }

    if (opts.enableCompetitor) {
      const competitorFlag = checkCompetitorMentions(content, context.competitorNames);
      if (competitorFlag) flags.push(competitorFlag);
    }

    if (opts.enableForbiddenWords) {
      const forbiddenFlag = checkForbiddenWords(content, context.brandForbiddenWords);
      if (forbiddenFlag) flags.push(forbiddenFlag);
    }

    // Phase 2: AI-powered filters (batched into single call)
    const needsAICheck =
      opts.enableProfanity || opts.enableFactualClaims || opts.enableLegalCompliance;

    if (needsAICheck) {
      const batchResponse = await this.batchedAICheck(content);

      if (opts.enableProfanity) {
        const aiProfanityFlag = parseProfanityFromBatch(batchResponse);
        if (aiProfanityFlag) flags.push(aiProfanityFlag);
      }

      if (opts.enableFactualClaims) {
        const factualClaimsFlag = parseFactualClaimsFromBatch(batchResponse);
        if (factualClaimsFlag) flags.push(factualClaimsFlag);
      }

      if (opts.enableLegalCompliance) {
        const legalFlag = parseLegalComplianceFromBatch(batchResponse);
        if (legalFlag) flags.push(legalFlag);
      }
    }

    // Aggregate results
    const severity = this.computeSeverity(flags);
    const requiresHumanReview = flags.length > 0;
    const passed = flags.length === 0;

    return {
      passed,
      flags,
      requiresHumanReview,
      severity,
    };
  }

  /**
   * Run batched AI checks for profanity context, factual claims, and legal compliance.
   * Single API call with 3 questions to reduce latency and cost.
   *
   * @param content - Content to check
   * @returns Batch check response
   */
  private async batchedAICheck(
    content: string,
  ): Promise<AIBatchCheckResponse> {
    const model = process.env.MODERATION_AI_MODEL || 'claude-haiku-3-5';

    const prompt = `
You are a content moderation assistant for professional brand marketing content.
Analyze the following text and respond with JSON matching this exact schema:

{
  "offensiveLanguage": { "detected": boolean, "examples": string[] },
  "factualClaims": { "detected": boolean, "sentences": string[] },
  "legalRisks": { "detected": boolean, "phrases": string[] }
}

Instructions:
1. offensiveLanguage: Check if the text contains offensive, discriminatory, or inappropriate language in the context of professional brand marketing. Set "detected" to true if found, and list specific examples.
2. factualClaims: Identify any sentences making verifiable factual claims (statistics, percentages, specific product comparisons). Set "detected" to true if found, and list the sentences.
3. legalRisks: Identify any unsubstantiated health, financial, or legal claims (e.g., "guaranteed results", "100% safe", "scientifically proven", "legally protected"). Set "detected" to true if found, and list the phrases.

Respond ONLY with valid JSON, no other text.

Content to analyze:
${content}
`.trim();

    try {
      const response = await this.aiService.generateText({
        prompt,
        modelVersion: model,
        maxTokens: 500,
      });

      const parsed = JSON.parse(response.text) as AIBatchCheckResponse;
      return parsed;
    } catch (error) {
      // Graceful degradation: on parse error, assume no flags to avoid blocking content
      console.error('AI batch check failed, defaulting to no flags:', error);
      return {
        offensiveLanguage: { detected: false, examples: [] },
        factualClaims: { detected: false, sentences: [] },
        legalRisks: { detected: false, phrases: [] },
      };
    }
  }

  /**
   * Compute the most severe flag severity.
   * FAIL > WARN > PASS.
   *
   * @param flags - Array of moderation flags
   * @returns Most severe severity
   */
  private computeSeverity(flags: ModerationFlag[]): ModerationSeverity {
    if (flags.some((f) => f.severity === 'FAIL')) return 'FAIL';
    if (flags.some((f) => f.severity === 'WARN')) return 'WARN';
    return 'PASS';
  }
}
