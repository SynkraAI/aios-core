/**
 * ToneAnalyzer — Tone of voice analysis (BSS-7.3, AC-3).
 *
 * Analyzes text content from all accessible pages to determine:
 * - Formal/casual spectrum
 * - Emotional register (inspirational, informative, urgent, etc.)
 * - Vocabulary complexity (simple/moderate/technical)
 *
 * @module onboarding/audit/tone-analyzer
 */

import type {
  PageAnalysis,
  ToneAnalysis,
  ConfidenceLevel,
  AuditAIService,
  AuditLogger,
} from './audit-types';

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const TONE_ANALYSIS_SYSTEM_PROMPT = `You are a brand voice analyst. Analyze the provided text content from a client's web presence and provide a structured tone of voice assessment. Be specific and evidence-based.`;

function buildToneAnalysisPrompt(textSamples: readonly string[]): string {
  const combined = textSamples
    .map((text, i) => `--- Page ${i + 1} ---\n${text.slice(0, 2000)}`)
    .join('\n\n');

  return `Analyze the following text content from a brand's web presence. Provide your assessment as JSON with this exact structure:

{
  "formalCasualScore": <number 1-5, where 1=very formal, 5=very casual>,
  "formalCasualLabel": "<descriptive label, e.g. 'Moderately Formal'>",
  "emotionalRegister": ["<primary register>", "<secondary register>"],
  "vocabularyComplexity": "<'simple' | 'moderate' | 'technical'>",
  "reasoning": "<2-3 sentences explaining your assessment with specific examples>"
}

Text content to analyze:

${combined}

Respond with ONLY the JSON object, no additional text.`;
}

// ---------------------------------------------------------------------------
// Confidence Calculation (AC-8)
// ---------------------------------------------------------------------------

/**
 * Determine confidence level based on number of accessible pages.
 * - High: >= 3 pages
 * - Medium: 2 pages
 * - Low: 1 page or less
 */
export function calculateToneConfidence(accessiblePageCount: number): ConfidenceLevel {
  if (accessiblePageCount >= 3) return 'High';
  if (accessiblePageCount === 2) return 'Medium';
  return 'Low';
}

// ---------------------------------------------------------------------------
// ToneAnalyzer Class
// ---------------------------------------------------------------------------

/**
 * Analyzes the tone of voice across all accessible pages using AI.
 */
export class ToneAnalyzer {
  private readonly aiService: AuditAIService;
  private readonly logger?: AuditLogger;

  constructor(aiService: AuditAIService, logger?: AuditLogger) {
    this.aiService = aiService;
    this.logger = logger;
  }

  /**
   * Analyze tone of voice from page analyses (AC-3).
   *
   * @param pages - All page analyses (accessible and inaccessible)
   * @param clientId - Client identifier for AI service logging
   * @returns Tone analysis result
   */
  async analyze(pages: readonly PageAnalysis[], clientId: string): Promise<ToneAnalysis> {
    const accessiblePages = pages.filter((p) => p.accessible && p.textContent.trim().length > 0);

    if (accessiblePages.length === 0) {
      return this.buildDefaultAnalysis('No accessible pages with text content available.');
    }

    const textSamples = accessiblePages.map((p) => p.textContent);
    const confidence = calculateToneConfidence(accessiblePages.length);

    try {
      const prompt = buildToneAnalysisPrompt(textSamples);
      const response = await this.aiService.generateText(prompt, {
        systemPrompt: TONE_ANALYSIS_SYSTEM_PROMPT,
        maxTokens: 500,
        temperature: 0.3,
        clientId,
      });

      const parsed = this.parseAIResponse(response.text);

      return {
        formalCasualScore: parsed.formalCasualScore,
        formalCasualLabel: parsed.formalCasualLabel,
        emotionalRegister: parsed.emotionalRegister,
        vocabularyComplexity: parsed.vocabularyComplexity,
        reasoning: parsed.reasoning,
        confidence,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger?.error(`Tone analysis AI call failed: ${errorMessage}`);

      return this.buildDefaultAnalysis(`AI analysis failed: ${errorMessage}`);
    }
  }

  /** Parse the AI response JSON string into a structured result. */
  private parseAIResponse(text: string): {
    formalCasualScore: number;
    formalCasualLabel: string;
    emotionalRegister: readonly string[];
    vocabularyComplexity: 'simple' | 'moderate' | 'technical';
    reasoning: string;
  } {
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

      const score = typeof parsed['formalCasualScore'] === 'number'
        ? Math.min(5, Math.max(1, parsed['formalCasualScore'] as number))
        : 3;

      const label = typeof parsed['formalCasualLabel'] === 'string'
        ? (parsed['formalCasualLabel'] as string)
        : 'Neutral';

      const register = Array.isArray(parsed['emotionalRegister'])
        ? (parsed['emotionalRegister'] as string[]).filter((r): r is string => typeof r === 'string')
        : ['informative'];

      const complexity = parsed['vocabularyComplexity'];
      const validComplexity = typeof complexity === 'string' && ['simple', 'moderate', 'technical'].includes(complexity)
        ? (complexity as 'simple' | 'moderate' | 'technical')
        : 'moderate';

      const reasoning = typeof parsed['reasoning'] === 'string'
        ? (parsed['reasoning'] as string)
        : 'Unable to extract reasoning from AI response.';

      return {
        formalCasualScore: score,
        formalCasualLabel: label,
        emotionalRegister: register,
        vocabularyComplexity: validComplexity,
        reasoning,
      };
    } catch {
      this.logger?.warn('Failed to parse tone analysis AI response as JSON');
      return {
        formalCasualScore: 3,
        formalCasualLabel: 'Unable to determine',
        emotionalRegister: ['unknown'],
        vocabularyComplexity: 'moderate',
        reasoning: 'AI response could not be parsed.',
      };
    }
  }

  /** Build a default/fallback analysis when AI is unavailable. */
  private buildDefaultAnalysis(reasoning: string): ToneAnalysis {
    return {
      formalCasualScore: 3,
      formalCasualLabel: 'Unable to determine',
      emotionalRegister: [],
      vocabularyComplexity: 'moderate',
      reasoning,
      confidence: 'Low',
    };
  }
}
