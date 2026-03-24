/**
 * Color Palette Generator (BSS-7.6 AC-3).
 *
 * Generates a 6-color brand palette (primary, secondary, accent,
 * neutral-light, neutral-dark, background) from mood tiles, competitor
 * palette analysis, and brand color theory.
 *
 * Each color includes hex, RGB, and HSL values.
 *
 * @module onboarding/analysis/color-generator
 */

import type {
  AITextProvider,
  ColorPalette,
  PaletteColor,
  ColorValue,
  ColorRole,
  CompetitorAnalysisResult,
} from './analysis-types';
import type { BrandPersonality, VisualPreference, MoodTile } from '../types';

/** The 6 required color roles. */
const COLOR_ROLES: readonly ColorRole[] = [
  'primary',
  'secondary',
  'accent',
  'neutral-light',
  'neutral-dark',
  'background',
] as const;

/** System prompt for color palette generation. */
const COLOR_SYSTEM_PROMPT = `You are an expert brand color strategist. Generate a 6-color brand palette based on the provided brand personality, mood preferences, and competitor analysis.

Rules:
- Each color must have hex, rgb, and hsl values
- Colors must be harmonious and follow brand color theory
- The palette must include: primary, secondary, accent, neutral-light, neutral-dark, background
- Primary and secondary should be bold/distinctive
- Neutral-light should be very light (for backgrounds/cards)
- Neutral-dark should be very dark (for text/headers)
- Background should be a subtle, light color

Respond in valid JSON:
{
  "colors": [
    {
      "role": "primary",
      "hex": "#1A2B3C",
      "rgb": { "r": 26, "g": 43, "b": 60 },
      "hsl": { "h": 210, "s": 40, "l": 17 },
      "rationale": "why this color was chosen"
    }
  ],
  "generationRationale": "overall rationale for the palette"
}`;

/** Parsed AI response for color generation. */
interface ColorAIResponse {
  colors: Array<{
    role: string;
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
    rationale: string;
  }>;
  generationRationale: string;
}

/**
 * ColorGenerator — creates a 6-color brand palette using AI.
 */
export class ColorGenerator {
  private readonly textProvider: AITextProvider;
  private readonly clientId: string;

  constructor(textProvider: AITextProvider, clientId: string) {
    this.textProvider = textProvider;
    this.clientId = clientId;
  }

  /**
   * Generate a 6-color brand palette.
   *
   * @param personality - Brand personality scales
   * @param visualPreferences - Selected mood tile IDs
   * @param moodTiles - Full mood tile definitions for selected IDs
   * @param competitorAnalysis - Aggregated competitor visual analysis
   * @returns 6-color palette with hex/RGB/HSL
   */
  async generate(
    personality: BrandPersonality,
    visualPreferences: VisualPreference,
    moodTiles: readonly MoodTile[],
    competitorAnalysis: CompetitorAnalysisResult,
  ): Promise<ColorPalette> {
    const prompt = this.buildPrompt(personality, visualPreferences, moodTiles, competitorAnalysis);

    const response = await this.textProvider.generateText({
      prompt,
      systemPrompt: COLOR_SYSTEM_PROMPT,
      provider: 'claude',
      clientId: this.clientId,
      temperature: 0.7,
    });

    return this.parseResponse(response.text);
  }

  /**
   * Build the user prompt with all context inputs.
   */
  private buildPrompt(
    personality: BrandPersonality,
    visualPreferences: VisualPreference,
    moodTiles: readonly MoodTile[],
    competitorAnalysis: CompetitorAnalysisResult,
  ): string {
    const moodKeywords = moodTiles.flatMap((t) => [...t.keywords]);
    const moodNames = moodTiles.map((t) => t.name);
    const competitorColors = competitorAnalysis.commonPatterns.dominantColors.slice(0, 10);

    return [
      '## Brand Personality',
      `- Formal/Casual: ${personality.formalCasual}/5`,
      `- Traditional/Innovative: ${personality.traditionalInnovative}/5`,
      `- Serious/Playful: ${personality.seriousPlayful}/5`,
      `- Minimal/Expressive: ${personality.minimalExpressive}/5`,
      `- Local/Global: ${personality.localGlobal}/5`,
      '',
      '## Visual Mood Preferences',
      `Selected moods: ${moodNames.join(', ')}`,
      `Keywords: ${moodKeywords.join(', ')}`,
      '',
      '## Competitor Color Analysis',
      `Dominant colors found in competitors: ${competitorColors.length > 0 ? competitorColors.join(', ') : 'No competitor data available'}`,
      `Competitors analyzed: ${competitorAnalysis.analyzedCount}`,
      '',
      '## Task',
      'Generate a 6-color brand palette that:',
      '1. Reflects the brand personality scales',
      '2. Aligns with the selected visual moods',
      '3. Differentiates from competitor palettes (avoid direct copies)',
      '4. Follows brand color theory for the 6 required roles',
    ].join('\n');
  }

  /**
   * Parse the AI response into a validated ColorPalette.
   */
  private parseResponse(text: string): ColorPalette {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from color generation response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as ColorAIResponse;

    if (!Array.isArray(parsed.colors) || parsed.colors.length < 6) {
      throw new Error(`Expected 6 colors, received ${parsed.colors?.length ?? 0}`);
    }

    const colors: PaletteColor[] = COLOR_ROLES.map((role) => {
      const match = parsed.colors.find((c) => c.role === role);
      if (!match) {
        throw new Error(`Missing color role: ${role}`);
      }

      const colorValue: ColorValue = {
        hex: match.hex,
        rgb: { r: match.rgb.r, g: match.rgb.g, b: match.rgb.b },
        hsl: { h: match.hsl.h, s: match.hsl.s, l: match.hsl.l },
      };

      return {
        role,
        color: colorValue,
        rationale: match.rationale || '',
      };
    });

    return {
      colors,
      generationRationale: parsed.generationRationale || '',
    };
  }
}
