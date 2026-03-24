/**
 * Competitor Screenshot Analysis (BSS-7.6 AC-2).
 *
 * Captures screenshots of competitor URLs via a pluggable ScreenshotProvider
 * (default: Playwright), then passes each screenshot to Claude Vision for
 * visual pattern extraction.
 *
 * Inaccessible URLs are skipped without failing the pipeline (NFR-9.6).
 *
 * @module onboarding/analysis/competitor-analyzer
 */

import type {
  ScreenshotProvider,
  AIVisionProvider,
  CompetitorVisualAnalysis,
  CompetitorAnalysisResult,
} from './analysis-types';

/** Words flagged by CON-15 — logo generation is forbidden. */
const CON15_FORBIDDEN_WORDS = ['logo', 'logotype', 'wordmark', 'brand mark', 'brandmark'] as const;

/** System prompt for Claude Vision competitor analysis. */
const VISION_SYSTEM_PROMPT = `You are a brand design analyst. Analyze the provided website screenshot and extract:
1. dominant_colors: Array of 3-5 hex color codes found in the design
2. layout_style: Brief description (e.g., "grid-based minimal", "hero-centric with sidebar")
3. imagery_tone: Brief description (e.g., "corporate photography", "abstract illustrations")
4. overall_impression: 1-2 sentence summary of the visual brand direction

Respond in valid JSON format:
{
  "dominant_colors": ["#hex1", "#hex2"],
  "layout_style": "description",
  "imagery_tone": "description",
  "overall_impression": "description"
}`;

/** Parsed response from Claude Vision. */
interface VisionAnalysisResponse {
  dominant_colors: string[];
  layout_style: string;
  imagery_tone: string;
  overall_impression: string;
}

/**
 * CompetitorAnalyzer — captures competitor screenshots and extracts visual patterns.
 */
export class CompetitorAnalyzer {
  private readonly screenshotProvider: ScreenshotProvider;
  private readonly visionProvider: AIVisionProvider;
  private readonly clientId: string;

  constructor(
    screenshotProvider: ScreenshotProvider,
    visionProvider: AIVisionProvider,
    clientId: string,
  ) {
    this.screenshotProvider = screenshotProvider;
    this.visionProvider = visionProvider;
    this.clientId = clientId;
  }

  /**
   * Analyze all competitor URLs.
   *
   * Inaccessible URLs are skipped without aborting (NFR-9.6).
   *
   * @param urls - Competitor URLs to analyze
   * @returns Aggregated competitor analysis
   */
  async analyze(urls: readonly string[]): Promise<CompetitorAnalysisResult> {
    const analyses: CompetitorVisualAnalysis[] = [];

    for (const url of urls) {
      const analysis = await this.analyzeUrl(url);
      analyses.push(analysis);
    }

    const successful = analyses.filter((a) => !a.skipped);
    const allColors = successful.flatMap((a) => [...a.dominantColors]);
    const allLayouts = successful.map((a) => a.layoutStyle).filter(Boolean);
    const allTones = successful.map((a) => a.imageryTone).filter(Boolean);

    return {
      analyses,
      commonPatterns: {
        dominantColors: [...new Set(allColors)],
        layoutStyles: [...new Set(allLayouts)],
        imageryTones: [...new Set(allTones)],
      },
      analyzedCount: successful.length,
      skippedCount: analyses.length - successful.length,
    };
  }

  /**
   * Analyze a single competitor URL.
   * Returns a skipped result if screenshot capture or vision analysis fails.
   */
  private async analyzeUrl(url: string): Promise<CompetitorVisualAnalysis> {
    // Step 1: Capture screenshot
    let screenshotBuffer: Buffer;
    try {
      screenshotBuffer = await this.screenshotProvider.capture(url);
    } catch (error) {
      return {
        url,
        dominantColors: [],
        layoutStyle: '',
        imageryTone: '',
        overallImpression: '',
        skipped: true,
        skipReason: `Screenshot capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // Step 2: Analyze with Claude Vision
    try {
      const visionResponse = await this.visionProvider.analyzeImage({
        imageBuffer: screenshotBuffer,
        prompt: VISION_SYSTEM_PROMPT,
        clientId: this.clientId,
      });

      const parsed = this.parseVisionResponse(visionResponse.text);

      return {
        url,
        dominantColors: parsed.dominant_colors,
        layoutStyle: parsed.layout_style,
        imageryTone: parsed.imagery_tone,
        overallImpression: parsed.overall_impression,
        skipped: false,
      };
    } catch (error) {
      return {
        url,
        dominantColors: [],
        layoutStyle: '',
        imageryTone: '',
        overallImpression: '',
        skipped: true,
        skipReason: `Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Parse the JSON response from Claude Vision.
   * Falls back to empty values if parsing fails.
   */
  private parseVisionResponse(text: string): VisionAnalysisResponse {
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.emptyVisionResponse();
      }

      const parsed = JSON.parse(jsonMatch[0]) as VisionAnalysisResponse;
      return {
        dominant_colors: Array.isArray(parsed.dominant_colors) ? parsed.dominant_colors : [],
        layout_style: typeof parsed.layout_style === 'string' ? parsed.layout_style : '',
        imagery_tone: typeof parsed.imagery_tone === 'string' ? parsed.imagery_tone : '',
        overall_impression: typeof parsed.overall_impression === 'string' ? parsed.overall_impression : '',
      };
    } catch {
      return this.emptyVisionResponse();
    }
  }

  private emptyVisionResponse(): VisionAnalysisResponse {
    return {
      dominant_colors: [],
      layout_style: '',
      imagery_tone: '',
      overall_impression: '',
    };
  }
}

/**
 * Guard: check if a prompt string contains CON-15 forbidden terms.
 * Exported for use in moodboard generation.
 *
 * @param text - Text to check
 * @returns true if forbidden terms are found
 */
export function containsLogoTerms(text: string): boolean {
  const lower = text.toLowerCase();
  return CON15_FORBIDDEN_WORDS.some((word) => lower.includes(word));
}
