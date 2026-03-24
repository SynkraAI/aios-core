/**
 * CompetitiveAnalyzer — Competitive gap assessment (BSS-7.3, AC-7).
 *
 * Compares the client's audit data against competitor URLs (if provided
 * in BSS-7.1 intake). When no competitor URLs exist, produces a
 * "Not available" section.
 *
 * @module onboarding/audit/competitive-analyzer
 */

import type {
  PageAnalysis,
  CompetitiveGapAnalysis,
  CompetitiveGap,
  ConfidenceLevel,
  AuditAIService,
  AuditLogger,
} from './audit-types';

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const COMPETITIVE_SYSTEM_PROMPT = `You are a competitive brand analyst. Compare a client's digital presence against their competitors and identify specific gaps and opportunities.`;

function buildCompetitivePrompt(
  clientSummary: string,
  competitorSummaries: readonly { url: string; summary: string }[],
): string {
  const competitorSection = competitorSummaries
    .map(({ url, summary }) => `--- Competitor: ${url} ---\n${summary}`)
    .join('\n\n');

  return `Compare the following client's digital presence against their competitors. Identify specific gaps where the client is behind and opportunities for differentiation. Provide your assessment as JSON with this exact structure:

{
  "gaps": [
    {
      "area": "<area of gap, e.g. 'Social Proof', 'Visual Branding'>",
      "description": "<specific gap description>",
      "competitorUrls": ["<which competitors do this better>"]
    }
  ],
  "summary": "<2-3 sentence executive summary of competitive position>"
}

Client's Digital Presence:
${clientSummary}

Competitors:
${competitorSection}

Respond with ONLY the JSON object, no additional text.`;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const UNAVAILABLE_MESSAGE =
  'Not available — add competitor URLs in intake form.';

// ---------------------------------------------------------------------------
// CompetitiveAnalyzer Class
// ---------------------------------------------------------------------------

/**
 * Assesses competitive gaps when competitor URLs are available.
 */
export class CompetitiveAnalyzer {
  private readonly aiService: AuditAIService;
  private readonly logger?: AuditLogger;

  constructor(aiService: AuditAIService, logger?: AuditLogger) {
    this.aiService = aiService;
    this.logger = logger;
  }

  /**
   * Analyze competitive gaps (AC-7).
   *
   * @param clientPages - Client's page analyses
   * @param competitorPages - Competitor page analyses (empty array if none)
   * @param clientId - Client identifier for AI service logging
   * @returns Competitive gap analysis
   */
  async analyze(
    clientPages: readonly PageAnalysis[],
    competitorPages: readonly PageAnalysis[],
    clientId: string,
  ): Promise<CompetitiveGapAnalysis> {
    // If no competitor pages, return unavailable section (AC-7)
    if (competitorPages.length === 0) {
      return {
        available: false,
        unavailableMessage: UNAVAILABLE_MESSAGE,
      };
    }

    const accessibleClient = clientPages.filter((p) => p.accessible);
    const accessibleCompetitors = competitorPages.filter((p) => p.accessible);

    if (accessibleClient.length === 0) {
      return {
        available: false,
        unavailableMessage: 'No accessible client pages available for comparison.',
      };
    }

    if (accessibleCompetitors.length === 0) {
      return {
        available: false,
        unavailableMessage: 'No accessible competitor pages available for comparison.',
      };
    }

    try {
      const clientSummary = this.buildPageSummary(accessibleClient);
      const competitorSummaries = accessibleCompetitors.map((p) => ({
        url: p.url,
        summary: this.buildSinglePageSummary(p),
      }));

      const prompt = buildCompetitivePrompt(clientSummary, competitorSummaries);
      const response = await this.aiService.generateText(prompt, {
        systemPrompt: COMPETITIVE_SYSTEM_PROMPT,
        maxTokens: 600,
        temperature: 0.3,
        clientId,
      });

      const parsed = this.parseAIResponse(response.text);
      const confidence = this.calculateConfidence(
        accessibleClient.length,
        accessibleCompetitors.length,
      );

      return {
        available: true,
        gaps: parsed.gaps,
        summary: parsed.summary,
        confidence,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger?.error(`Competitive analysis AI call failed: ${errorMessage}`);

      return {
        available: true,
        gaps: [],
        summary: `Competitive analysis could not be completed: ${errorMessage}`,
        confidence: 'Low',
      };
    }
  }

  /** Build a text summary of multiple pages for the AI prompt. */
  private buildPageSummary(pages: readonly PageAnalysis[]): string {
    return pages
      .map((p) => this.buildSinglePageSummary(p))
      .join('\n\n');
  }

  /** Build a text summary of a single page. */
  private buildSinglePageSummary(page: PageAnalysis): string {
    const parts: string[] = [];
    parts.push(`URL: ${page.url}`);
    if (page.title) parts.push(`Title: ${page.title}`);
    if (page.metaDescription) parts.push(`Description: ${page.metaDescription}`);
    if (page.headings.length > 0) {
      parts.push(`Headings: ${page.headings.map((h) => h.text).join(', ')}`);
    }
    if (page.dominantColors.length > 0) {
      parts.push(`Colors: ${page.dominantColors.slice(0, 5).join(', ')}`);
    }
    if (page.fontNames.length > 0) {
      parts.push(`Fonts: ${page.fontNames.join(', ')}`);
    }
    if (page.textContent.length > 0) {
      parts.push(`Content preview: ${page.textContent.slice(0, 500)}`);
    }
    return parts.join('\n');
  }

  /** Parse AI response into competitive gap analysis. */
  private parseAIResponse(text: string): {
    gaps: readonly CompetitiveGap[];
    summary: string;
  } {
    try {
      const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

      const rawGaps = Array.isArray(parsed['gaps'])
        ? (parsed['gaps'] as Array<Record<string, unknown>>)
        : [];

      const gaps: CompetitiveGap[] = rawGaps
        .filter(
          (g) =>
            typeof g['area'] === 'string' && typeof g['description'] === 'string',
        )
        .map((g) => ({
          area: g['area'] as string,
          description: g['description'] as string,
          competitorUrls: Array.isArray(g['competitorUrls'])
            ? (g['competitorUrls'] as string[]).filter(
                (u): u is string => typeof u === 'string',
              )
            : [],
          confidence: 'Medium' as ConfidenceLevel,
        }));

      const summary =
        typeof parsed['summary'] === 'string'
          ? (parsed['summary'] as string)
          : 'Competitive analysis complete.';

      return { gaps, summary };
    } catch {
      this.logger?.warn('Failed to parse competitive analysis AI response as JSON');
      return {
        gaps: [],
        summary: 'AI response could not be parsed.',
      };
    }
  }

  /** Calculate confidence based on available data. */
  private calculateConfidence(
    clientPageCount: number,
    competitorPageCount: number,
  ): ConfidenceLevel {
    if (clientPageCount >= 3 && competitorPageCount >= 2) return 'High';
    if (clientPageCount >= 2 && competitorPageCount >= 1) return 'Medium';
    return 'Low';
  }
}
