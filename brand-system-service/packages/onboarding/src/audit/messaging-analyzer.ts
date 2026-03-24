/**
 * MessagingAnalyzer — Messaging consistency analysis (BSS-7.3, AC-4).
 *
 * Analyzes text content across all accessible pages to identify:
 * - Recurring value propositions
 * - Contradictions or inconsistencies
 * - Overall messaging consistency score
 *
 * @module onboarding/audit/messaging-analyzer
 */

import type {
  PageAnalysis,
  MessagingAnalysis,
  MessagingContradiction,
  ConfidenceLevel,
  AuditAIService,
  AuditLogger,
} from './audit-types';

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const MESSAGING_SYSTEM_PROMPT = `You are a brand messaging analyst. Analyze the provided text content from multiple pages of a client's web presence to assess messaging consistency. Focus on value propositions, key claims, and any contradictions between pages.`;

function buildMessagingPrompt(
  pageSamples: readonly { url: string; text: string }[],
): string {
  const combined = pageSamples
    .map(({ url, text }) => `--- ${url} ---\n${text.slice(0, 1500)}`)
    .join('\n\n');

  return `Analyze the following text content from different pages of a brand's web presence for messaging consistency. Provide your assessment as JSON with this exact structure:

{
  "recurringValuePropositions": ["<value prop 1>", "<value prop 2>"],
  "contradictions": [
    {
      "description": "<what is contradicted>",
      "sourceUrls": ["<url1>", "<url2>"]
    }
  ],
  "consistencyScore": <number 1-5, where 1=very inconsistent, 5=very consistent>,
  "reasoning": "<2-3 sentences explaining your assessment>"
}

Pages to analyze:

${combined}

Respond with ONLY the JSON object, no additional text.`;
}

// ---------------------------------------------------------------------------
// Confidence Calculation (AC-8)
// ---------------------------------------------------------------------------

/**
 * Determine confidence level for messaging analysis.
 * Messaging consistency is more meaningful with more pages.
 */
export function calculateMessagingConfidence(accessiblePageCount: number): ConfidenceLevel {
  if (accessiblePageCount >= 4) return 'High';
  if (accessiblePageCount >= 2) return 'Medium';
  return 'Low';
}

// ---------------------------------------------------------------------------
// MessagingAnalyzer Class
// ---------------------------------------------------------------------------

/**
 * Analyzes messaging consistency across all accessible pages using AI.
 */
export class MessagingAnalyzer {
  private readonly aiService: AuditAIService;
  private readonly logger?: AuditLogger;

  constructor(aiService: AuditAIService, logger?: AuditLogger) {
    this.aiService = aiService;
    this.logger = logger;
  }

  /**
   * Analyze messaging consistency from page analyses (AC-4).
   *
   * @param pages - All page analyses
   * @param clientId - Client identifier for AI service logging
   * @returns Messaging consistency analysis
   */
  async analyze(
    pages: readonly PageAnalysis[],
    clientId: string,
  ): Promise<MessagingAnalysis> {
    const accessiblePages = pages.filter(
      (p) => p.accessible && p.textContent.trim().length > 0,
    );

    if (accessiblePages.length === 0) {
      return this.buildDefaultAnalysis('No accessible pages with text content available.');
    }

    const pageSamples = accessiblePages.map((p) => ({
      url: p.url,
      text: p.textContent,
    }));

    const confidence = calculateMessagingConfidence(accessiblePages.length);

    try {
      const prompt = buildMessagingPrompt(pageSamples);
      const response = await this.aiService.generateText(prompt, {
        systemPrompt: MESSAGING_SYSTEM_PROMPT,
        maxTokens: 600,
        temperature: 0.3,
        clientId,
      });

      const parsed = this.parseAIResponse(response.text, accessiblePages);

      return {
        recurringValuePropositions: parsed.recurringValuePropositions,
        contradictions: parsed.contradictions,
        consistencyScore: parsed.consistencyScore,
        reasoning: parsed.reasoning,
        confidence,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger?.error(`Messaging analysis AI call failed: ${errorMessage}`);

      return this.buildDefaultAnalysis(`AI analysis failed: ${errorMessage}`);
    }
  }

  /** Parse AI response into structured messaging analysis. */
  private parseAIResponse(
    text: string,
    pages: readonly PageAnalysis[],
  ): {
    recurringValuePropositions: readonly string[];
    contradictions: readonly MessagingContradiction[];
    consistencyScore: number;
    reasoning: string;
  } {
    try {
      const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

      const valueProps = Array.isArray(parsed['recurringValuePropositions'])
        ? (parsed['recurringValuePropositions'] as string[]).filter(
            (v): v is string => typeof v === 'string',
          )
        : [];

      const rawContradictions = Array.isArray(parsed['contradictions'])
        ? (parsed['contradictions'] as Array<Record<string, unknown>>)
        : [];

      const contradictions: MessagingContradiction[] = rawContradictions
        .filter(
          (c) =>
            typeof c['description'] === 'string' &&
            Array.isArray(c['sourceUrls']),
        )
        .map((c) => ({
          description: c['description'] as string,
          sourceUrls: (c['sourceUrls'] as string[]).filter(
            (u): u is string => typeof u === 'string',
          ),
        }));

      const score =
        typeof parsed['consistencyScore'] === 'number'
          ? Math.min(5, Math.max(1, parsed['consistencyScore'] as number))
          : 3;

      const reasoning =
        typeof parsed['reasoning'] === 'string'
          ? (parsed['reasoning'] as string)
          : 'Unable to extract reasoning from AI response.';

      return {
        recurringValuePropositions: valueProps,
        contradictions,
        consistencyScore: score,
        reasoning,
      };
    } catch {
      this.logger?.warn('Failed to parse messaging analysis AI response as JSON');
      return {
        recurringValuePropositions: [],
        contradictions: [],
        consistencyScore: 3,
        reasoning: 'AI response could not be parsed.',
      };
    }
  }

  /** Build a default/fallback analysis. */
  private buildDefaultAnalysis(reasoning: string): MessagingAnalysis {
    return {
      recurringValuePropositions: [],
      contradictions: [],
      consistencyScore: 3,
      reasoning,
      confidence: 'Low',
    };
  }
}
