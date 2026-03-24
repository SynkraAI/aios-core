/**
 * QualityScorer — scores AI-generated content on 5 dimensions via meta-evaluation.
 *
 * Calls a secondary AI model (meta-evaluator) to assess content quality,
 * parses the JSON response, and computes the average score.
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline
 */

import type { AIServiceProvider } from '@brand-system/ai-service';
import type { DimensionScores, QualityReport } from './types';
import {
  DIMENSION_KEYS,
  DEFAULT_QUALITY_THRESHOLD,
} from './types';

/** Parsed response from the meta-evaluator AI call. */
interface EvaluatorResponse extends DimensionScores {
  readonly feedback: string;
}

/**
 * Client context subset needed for quality evaluation.
 */
export interface ScorerClientContext {
  readonly clientId: string;
  readonly brandName: string;
  readonly brandPersonality: string[];
  readonly toneSpectrum: string;
  readonly platform?: string;
}

/**
 * System prompt for the meta-evaluator.
 */
const EVALUATOR_SYSTEM_PROMPT =
  'You are an expert content quality assessor specializing in brand marketing. ' +
  'You evaluate AI-generated content with rigorous objectivity across 5 quality dimensions. ' +
  'You ALWAYS respond with valid JSON only — no markdown, no explanation, no extra text. ' +
  'Your response must be a single JSON object.';

/**
 * QualityScorer evaluates AI-generated content on 5 dimensions
 * by calling a meta-evaluator prompt via AIService.
 */
export class QualityScorer {
  private readonly aiService: AIServiceProvider;
  private readonly qualityThreshold: number;

  constructor(
    aiService: AIServiceProvider,
    qualityThreshold: number = DEFAULT_QUALITY_THRESHOLD,
  ) {
    this.aiService = aiService;
    this.qualityThreshold = qualityThreshold;
  }

  /**
   * Score content on 5 quality dimensions.
   *
   * @param content - The AI-generated content to evaluate
   * @param clientContext - Client brand context for evaluation
   * @param promptVersion - Version of the prompt that generated the content
   * @param variant - A/B variant identifier
   * @param iteration - Current iteration number
   * @returns QualityReport with scores, average, and approval status
   */
  async score(
    content: string,
    clientContext: ScorerClientContext,
    promptVersion: string,
    variant: string,
    iteration: number = 1,
  ): Promise<QualityReport> {
    const userPrompt = this.buildEvaluationPrompt(content, clientContext);

    let scores: DimensionScores;
    let feedback: string;

    try {
      const response = await this.aiService.generateText({
        prompt: userPrompt,
        systemPrompt: EVALUATOR_SYSTEM_PROMPT,
        provider: 'claude',
        clientId: clientContext.clientId,
      });

      const parsed = this.parseEvaluatorResponse(response.text);
      scores = {
        brandVoiceAdherence: parsed.brandVoiceAdherence,
        factualAccuracy: parsed.factualAccuracy,
        toneAppropriateness: parsed.toneAppropriateness,
        ctaEffectiveness: parsed.ctaEffectiveness,
        creativity: parsed.creativity,
      };
      feedback = parsed.feedback;
    } catch (error) {
      // Graceful fallback: score 1.0 on all dimensions on parse/call failure
      scores = {
        brandVoiceAdherence: 1,
        factualAccuracy: 1,
        toneAppropriateness: 1,
        ctaEffectiveness: 1,
        creativity: 1,
      };
      feedback = `Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}. All dimensions scored 1.0 as fallback.`;
    }

    const averageScore = this.computeAverage(scores);
    const approved = averageScore >= this.qualityThreshold;

    return {
      contentId: `${clientContext.clientId}-${Date.now()}`,
      iteration,
      scores,
      averageScore,
      approved,
      feedback,
      promptVersion,
      variant,
      maxIterationsReached: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Compute the average across all 5 dimension scores.
   */
  computeAverage(scores: DimensionScores): number {
    const total = DIMENSION_KEYS.reduce(
      (sum, key) => sum + scores[key],
      0,
    );
    return Math.round((total / DIMENSION_KEYS.length) * 100) / 100;
  }

  /**
   * Build the evaluation prompt for the meta-evaluator.
   */
  private buildEvaluationPrompt(
    content: string,
    clientContext: ScorerClientContext,
  ): string {
    const personality = clientContext.brandPersonality.join(', ');
    const platform = clientContext.platform ?? 'general';

    return (
      `Evaluate the following content for brand **${clientContext.brandName}**.\n\n` +
      `Brand personality: ${personality}.\n` +
      `Tone spectrum: ${clientContext.toneSpectrum}.\n` +
      `Target platform: ${platform}.\n\n` +
      `---\nCONTENT TO EVALUATE:\n${content}\n---\n\n` +
      `Score each dimension on a 1-5 integer scale:\n\n` +
      `1. **brandVoiceAdherence** (1-5): Does the content match the brand personality and tone spectrum?\n` +
      `2. **factualAccuracy** (1-5): Are all statements verifiable or appropriately hedged?\n` +
      `3. **toneAppropriateness** (1-5): Is the register correct for the platform and audience?\n` +
      `4. **ctaEffectiveness** (1-5): Is the call-to-action clear, compelling, and actionable?\n` +
      `5. **creativity** (1-5): Is the content original, engaging, and non-generic?\n\n` +
      `Respond with ONLY this JSON structure (no other text):\n` +
      `{\n` +
      `  "brandVoiceAdherence": <int>,\n` +
      `  "factualAccuracy": <int>,\n` +
      `  "toneAppropriateness": <int>,\n` +
      `  "ctaEffectiveness": <int>,\n` +
      `  "creativity": <int>,\n` +
      `  "feedback": "<one paragraph explaining any scores below 4 and how to improve>"\n` +
      `}`
    );
  }

  /**
   * Parse the evaluator JSON response with graceful fallback.
   */
  private parseEvaluatorResponse(text: string): EvaluatorResponse {
    const parsed = JSON.parse(text);

    // Validate and clamp dimension scores to 1-5
    const clamp = (value: unknown): number => {
      const num = typeof value === 'number' ? value : 1;
      return Math.max(1, Math.min(5, Math.round(num)));
    };

    return {
      brandVoiceAdherence: clamp(parsed.brandVoiceAdherence),
      factualAccuracy: clamp(parsed.factualAccuracy),
      toneAppropriateness: clamp(parsed.toneAppropriateness),
      ctaEffectiveness: clamp(parsed.ctaEffectiveness),
      creativity: clamp(parsed.creativity),
      feedback: typeof parsed.feedback === 'string'
        ? parsed.feedback
        : 'No feedback provided.',
    };
  }
}
