/**
 * Typography Pairing Generator (BSS-7.6 AC-4).
 *
 * Generates 2 font pairings (heading + body) sourced from Google Fonts.
 * Each pairing includes a rationale explaining why the fonts complement
 * the brand personality.
 *
 * @module onboarding/analysis/typography-generator
 */

import type {
  AITextProvider,
  TypographyResult,
  TypographyPairing,
  FontSpec,
} from './analysis-types';
import type { BrandPersonality } from '../types';

/** System prompt for typography pairing generation. */
const TYPOGRAPHY_SYSTEM_PROMPT = `You are an expert typography designer. Generate 2 font pairings (heading + body) from Google Fonts based on the provided brand personality and industry context.

Rules:
- All fonts must be available on Google Fonts
- Each pairing has a heading font and a body font
- Heading fonts should be distinctive and match brand personality
- Body fonts should be highly readable at paragraph sizes
- Include a rationale for each pairing explaining the design choice
- Suggest appropriate font weights

Respond in valid JSON:
{
  "pairings": [
    {
      "heading": {
        "family": "Font Name",
        "weight": 700,
        "style": "normal"
      },
      "body": {
        "family": "Font Name",
        "weight": 400,
        "style": "normal"
      },
      "rationale": "Why this pairing works for this brand"
    }
  ]
}`;

/** Parsed AI response for typography generation. */
interface TypographyAIResponse {
  pairings: Array<{
    heading: { family: string; weight: number; style: string };
    body: { family: string; weight: number; style: string };
    rationale: string;
  }>;
}

/**
 * TypographyGenerator — creates Google Fonts pairings using AI.
 */
export class TypographyGenerator {
  private readonly textProvider: AITextProvider;
  private readonly clientId: string;

  constructor(textProvider: AITextProvider, clientId: string) {
    this.textProvider = textProvider;
    this.clientId = clientId;
  }

  /**
   * Generate 2 typography pairings.
   *
   * @param personality - Brand personality scales
   * @param industry - Industry from company basics
   * @param targetAudience - Target audience description
   * @returns 2 font pairings with rationale
   */
  async generate(
    personality: BrandPersonality,
    industry: string,
    targetAudience: string,
  ): Promise<TypographyResult> {
    const prompt = this.buildPrompt(personality, industry, targetAudience);

    const response = await this.textProvider.generateText({
      prompt,
      systemPrompt: TYPOGRAPHY_SYSTEM_PROMPT,
      provider: 'claude',
      clientId: this.clientId,
      temperature: 0.7,
    });

    return this.parseResponse(response.text);
  }

  /**
   * Build the user prompt with brand context.
   */
  private buildPrompt(
    personality: BrandPersonality,
    industry: string,
    targetAudience: string,
  ): string {
    return [
      '## Brand Context',
      `Industry: ${industry}`,
      `Target Audience: ${targetAudience}`,
      '',
      '## Brand Personality',
      `- Formal/Casual: ${personality.formalCasual}/5 (1=very formal, 5=very casual)`,
      `- Traditional/Innovative: ${personality.traditionalInnovative}/5`,
      `- Serious/Playful: ${personality.seriousPlayful}/5`,
      `- Minimal/Expressive: ${personality.minimalExpressive}/5`,
      `- Local/Global: ${personality.localGlobal}/5`,
      '',
      '## Task',
      'Generate 2 Google Fonts pairings (heading + body) that:',
      '1. Match the brand personality (e.g., formal brand = serif headings)',
      '2. Are appropriate for the industry and audience',
      '3. Have strong visual contrast between heading and body',
      '4. Are both available on Google Fonts',
      '5. Include a clear rationale for each pairing',
    ].join('\n');
  }

  /**
   * Parse the AI response into validated TypographyResult.
   */
  private parseResponse(text: string): TypographyResult {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from typography generation response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as TypographyAIResponse;

    if (!Array.isArray(parsed.pairings) || parsed.pairings.length < 2) {
      throw new Error(`Expected 2 pairings, received ${parsed.pairings?.length ?? 0}`);
    }

    const pairings: TypographyPairing[] = parsed.pairings.slice(0, 2).map((p) => ({
      heading: this.toFontSpec(p.heading),
      body: this.toFontSpec(p.body),
      rationale: p.rationale || '',
    }));

    return { pairings };
  }

  /**
   * Convert raw AI font data to a validated FontSpec.
   */
  private toFontSpec(raw: { family: string; weight: number; style: string }): FontSpec {
    return {
      family: raw.family,
      weight: typeof raw.weight === 'number' ? raw.weight : 400,
      style: raw.style === 'italic' ? 'italic' : 'normal',
      source: 'google-fonts',
    };
  }
}
