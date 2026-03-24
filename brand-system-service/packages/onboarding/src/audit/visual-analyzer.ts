/**
 * VisualAnalyzer — Visual consistency analysis (BSS-7.3, AC-5).
 *
 * Analyzes visual elements across all accessible pages:
 * - Color palette consistency
 * - Typography consistency
 * - Imagery style patterns (photo-heavy vs illustration, warm vs cool)
 *
 * @module onboarding/audit/visual-analyzer
 */

import type {
  PageAnalysis,
  VisualAnalysis,
  ColorCluster,
  TypographyAssessment,
  ImageryStyleAssessment,
  ConfidenceLevel,
  AuditAIService,
  AuditLogger,
} from './audit-types';

// ---------------------------------------------------------------------------
// Color Clustering
// ---------------------------------------------------------------------------

/**
 * Cluster colors from multiple pages to identify consistent palette.
 *
 * Groups colors by similarity (exact match) and counts occurrences.
 */
export function clusterColors(pages: readonly PageAnalysis[]): ColorCluster[] {
  const colorMap = new Map<string, { count: number; urls: Set<string> }>();

  for (const page of pages) {
    if (!page.accessible) continue;

    for (const color of page.dominantColors) {
      const normalized = color.toLowerCase();
      const existing = colorMap.get(normalized);
      if (existing) {
        existing.count++;
        existing.urls.add(page.url);
      } else {
        colorMap.set(normalized, { count: 1, urls: new Set([page.url]) });
      }
    }
  }

  const clusters: ColorCluster[] = [];
  for (const [hex, data] of colorMap.entries()) {
    clusters.push({
      hexValue: hex,
      occurrenceCount: data.count,
      sourceUrls: Array.from(data.urls),
    });
  }

  // Sort by occurrence count descending
  clusters.sort((a, b) => b.occurrenceCount - a.occurrenceCount);

  return clusters;
}

// ---------------------------------------------------------------------------
// Typography Assessment
// ---------------------------------------------------------------------------

/**
 * Assess typography consistency across pages.
 */
export function assessTypography(pages: readonly PageAnalysis[]): TypographyAssessment {
  const allFonts = new Set<string>();
  const pageFontSets: string[][] = [];

  for (const page of pages) {
    if (!page.accessible) continue;
    pageFontSets.push([...page.fontNames]);
    for (const font of page.fontNames) {
      allFonts.add(font);
    }
  }

  const fontsDetected = Array.from(allFonts);

  if (fontsDetected.length === 0) {
    return {
      fontsDetected: [],
      isConsistent: true,
      notes: 'No font information could be extracted from CSS.',
    };
  }

  // Check if font sets across pages overlap significantly
  const isConsistent = fontsDetected.length <= 3;
  const notes = isConsistent
    ? `${fontsDetected.length} font(s) detected across all pages — consistent typography.`
    : `${fontsDetected.length} different fonts detected — potential typography inconsistency.`;

  return {
    fontsDetected,
    isConsistent,
    notes,
  };
}

// ---------------------------------------------------------------------------
// Confidence Calculation (AC-8)
// ---------------------------------------------------------------------------

export function calculateVisualConfidence(accessiblePageCount: number): ConfidenceLevel {
  if (accessiblePageCount >= 3) return 'High';
  if (accessiblePageCount === 2) return 'Medium';
  return 'Low';
}

// ---------------------------------------------------------------------------
// VisualAnalyzer Class
// ---------------------------------------------------------------------------

const VISUAL_SYSTEM_PROMPT = `You are a brand visual consistency analyst. Analyze the provided visual data from a client's web presence and assess consistency in color usage, typography, and imagery style.`;

function buildVisualPrompt(
  colorClusters: readonly ColorCluster[],
  typography: TypographyAssessment,
  imageryDescriptions: readonly { url: string; descriptions: readonly string[] }[],
): string {
  const colorSection = colorClusters.length > 0
    ? colorClusters
        .slice(0, 10)
        .map(
          (c) =>
            `  ${c.hexValue}: found ${c.occurrenceCount} time(s) across ${c.sourceUrls.length} page(s)`,
        )
        .join('\n')
    : '  No color data extracted';

  const fontSection = typography.fontsDetected.length > 0
    ? typography.fontsDetected.join(', ')
    : 'No font data extracted';

  const imagerySection = imageryDescriptions.length > 0
    ? imageryDescriptions
        .map(({ url, descriptions }) => `  ${url}: ${descriptions.join('; ')}`)
        .join('\n')
    : '  No imagery descriptions available';

  return `Analyze the following visual data from a brand's web presence. Provide your assessment as JSON with this exact structure:

{
  "imageryStyle": {
    "dominantStyle": "<'photo-heavy' | 'illustration-heavy' | 'mixed' | 'minimal'>",
    "tonality": "<'warm' | 'cool' | 'neutral' | 'mixed'>",
    "notes": "<brief assessment>"
  },
  "consistencyScore": <number 1-5, where 1=very inconsistent, 5=very consistent>,
  "reasoning": "<2-3 sentences explaining your visual consistency assessment>"
}

Visual Data:

Colors detected:
${colorSection}

Fonts detected: ${fontSection}
Typography consistent: ${typography.isConsistent}

Imagery:
${imagerySection}

Respond with ONLY the JSON object, no additional text.`;
}

/**
 * Analyzes visual consistency across all accessible pages.
 */
export class VisualAnalyzer {
  private readonly aiService: AuditAIService;
  private readonly logger?: AuditLogger;

  constructor(aiService: AuditAIService, logger?: AuditLogger) {
    this.aiService = aiService;
    this.logger = logger;
  }

  /**
   * Analyze visual consistency from page analyses (AC-5).
   *
   * @param pages - All page analyses
   * @param clientId - Client identifier for AI service logging
   * @returns Visual consistency analysis
   */
  async analyze(
    pages: readonly PageAnalysis[],
    clientId: string,
  ): Promise<VisualAnalysis> {
    const accessiblePages = pages.filter((p) => p.accessible);

    if (accessiblePages.length === 0) {
      return this.buildDefaultAnalysis('No accessible pages available for visual analysis.');
    }

    // Compute color clusters and typography assessment locally
    const colorPalette = clusterColors(accessiblePages);
    const typographyConsistency = assessTypography(accessiblePages);
    const confidence = calculateVisualConfidence(accessiblePages.length);

    // Collect imagery descriptions
    const imageryDescriptions = accessiblePages
      .filter((p) => p.imageryDescriptions.length > 0)
      .map((p) => ({ url: p.url, descriptions: p.imageryDescriptions }));

    try {
      const prompt = buildVisualPrompt(colorPalette, typographyConsistency, imageryDescriptions);
      const response = await this.aiService.generateText(prompt, {
        systemPrompt: VISUAL_SYSTEM_PROMPT,
        maxTokens: 400,
        temperature: 0.3,
        clientId,
      });

      const parsed = this.parseAIResponse(response.text);

      return {
        colorPalette,
        typographyConsistency,
        imageryStyle: parsed.imageryStyle,
        consistencyScore: parsed.consistencyScore,
        reasoning: parsed.reasoning,
        confidence,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger?.error(`Visual analysis AI call failed: ${errorMessage}`);

      return {
        colorPalette,
        typographyConsistency,
        imageryStyle: {
          dominantStyle: 'minimal',
          tonality: 'neutral',
          notes: 'AI analysis unavailable.',
        },
        consistencyScore: 3,
        reasoning: `AI analysis failed: ${errorMessage}`,
        confidence: 'Low',
      };
    }
  }

  /** Parse AI response into visual analysis components. */
  private parseAIResponse(text: string): {
    imageryStyle: ImageryStyleAssessment;
    consistencyScore: number;
    reasoning: string;
  } {
    try {
      const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

      const rawImagery = parsed['imageryStyle'] as Record<string, unknown> | undefined;

      const validStyles = ['photo-heavy', 'illustration-heavy', 'mixed', 'minimal'] as const;
      const validTonalities = ['warm', 'cool', 'neutral', 'mixed'] as const;

      const dominantStyle = rawImagery && typeof rawImagery['dominantStyle'] === 'string'
        && (validStyles as readonly string[]).includes(rawImagery['dominantStyle'] as string)
        ? (rawImagery['dominantStyle'] as ImageryStyleAssessment['dominantStyle'])
        : 'minimal';

      const tonality = rawImagery && typeof rawImagery['tonality'] === 'string'
        && (validTonalities as readonly string[]).includes(rawImagery['tonality'] as string)
        ? (rawImagery['tonality'] as ImageryStyleAssessment['tonality'])
        : 'neutral';

      const notes = rawImagery && typeof rawImagery['notes'] === 'string'
        ? (rawImagery['notes'] as string)
        : '';

      const score = typeof parsed['consistencyScore'] === 'number'
        ? Math.min(5, Math.max(1, parsed['consistencyScore'] as number))
        : 3;

      const reasoning = typeof parsed['reasoning'] === 'string'
        ? (parsed['reasoning'] as string)
        : 'Unable to extract reasoning from AI response.';

      return {
        imageryStyle: { dominantStyle, tonality, notes },
        consistencyScore: score,
        reasoning,
      };
    } catch {
      this.logger?.warn('Failed to parse visual analysis AI response as JSON');
      return {
        imageryStyle: {
          dominantStyle: 'minimal',
          tonality: 'neutral',
          notes: 'AI response could not be parsed.',
        },
        consistencyScore: 3,
        reasoning: 'AI response could not be parsed.',
      };
    }
  }

  /** Build a default/fallback analysis. */
  private buildDefaultAnalysis(reasoning: string): VisualAnalysis {
    return {
      colorPalette: [],
      typographyConsistency: {
        fontsDetected: [],
        isConsistent: true,
        notes: reasoning,
      },
      imageryStyle: {
        dominantStyle: 'minimal',
        tonality: 'neutral',
        notes: reasoning,
      },
      consistencyScore: 3,
      reasoning,
      confidence: 'Low',
    };
  }
}
