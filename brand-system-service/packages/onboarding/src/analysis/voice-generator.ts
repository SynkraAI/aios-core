/**
 * Brand Voice Definition Generator (BSS-7.6 AC-6).
 *
 * Generates tone of voice, vocabulary guide (20 use / 10 avoid),
 * and communication guidelines (3-5 bullet points) from
 * Brand Personality scales and industry context.
 *
 * @module onboarding/analysis/voice-generator
 */

import type {
  AITextProvider,
  BrandVoiceDefinition,
  ToneScale,
  VocabularyGuide,
} from './analysis-types';
import type { BrandPersonality } from '../types';

/** System prompt for brand voice generation. */
const VOICE_SYSTEM_PROMPT = `You are a brand strategist specializing in brand voice and tone of voice. Generate a comprehensive brand voice definition based on the provided brand personality and industry context.

Requirements:
1. Tone scales: Position the brand on 5-point scales for formality, energy, humor, complexity, and warmth
2. Vocabulary guide: 20 words the brand should USE and 10 words to AVOID
3. Communication guidelines: 3-5 actionable bullet points for content creators

Rules:
- USE words should feel natural for the brand voice
- AVOID words should be those that contradict the brand personality
- Guidelines should be specific enough to be immediately actionable
- Tone positions must be integers 1-5

Respond in valid JSON:
{
  "toneScales": [
    { "dimension": "Formality", "leftPole": "Very Formal", "rightPole": "Very Casual", "position": 3 }
  ],
  "vocabularyGuide": {
    "useWords": ["word1", "word2"],
    "avoidWords": ["word1", "word2"]
  },
  "communicationGuidelines": [
    "Always lead with benefits, not features",
    "Use active voice and direct address"
  ]
}`;

/** Parsed AI response for brand voice generation. */
interface VoiceAIResponse {
  toneScales: Array<{
    dimension: string;
    leftPole: string;
    rightPole: string;
    position: number;
  }>;
  vocabularyGuide: {
    useWords: string[];
    avoidWords: string[];
  };
  communicationGuidelines: string[];
}

/**
 * VoiceGenerator — creates a brand voice definition using AI.
 */
export class VoiceGenerator {
  private readonly textProvider: AITextProvider;
  private readonly clientId: string;

  constructor(textProvider: AITextProvider, clientId: string) {
    this.textProvider = textProvider;
    this.clientId = clientId;
  }

  /**
   * Generate a brand voice definition.
   *
   * @param personality - Brand personality 5-point scales
   * @param industry - Industry context
   * @param targetAudience - Target audience description
   * @param companyName - Company name for contextual guidelines
   * @returns Complete brand voice definition
   */
  async generate(
    personality: BrandPersonality,
    industry: string,
    targetAudience: string,
    companyName: string,
  ): Promise<BrandVoiceDefinition> {
    const prompt = this.buildPrompt(personality, industry, targetAudience, companyName);

    const response = await this.textProvider.generateText({
      prompt,
      systemPrompt: VOICE_SYSTEM_PROMPT,
      provider: 'claude',
      clientId: this.clientId,
      temperature: 0.7,
    });

    return this.parseResponse(response.text);
  }

  /**
   * Build the user prompt with personality and industry context.
   */
  private buildPrompt(
    personality: BrandPersonality,
    industry: string,
    targetAudience: string,
    companyName: string,
  ): string {
    return [
      '## Brand Identity',
      `Company: ${companyName}`,
      `Industry: ${industry}`,
      `Target Audience: ${targetAudience}`,
      '',
      '## Brand Personality Scales (1-5)',
      `- Formal/Casual: ${personality.formalCasual}/5 (1=very formal, 5=very casual)`,
      `- Traditional/Innovative: ${personality.traditionalInnovative}/5`,
      `- Serious/Playful: ${personality.seriousPlayful}/5`,
      `- Minimal/Expressive: ${personality.minimalExpressive}/5`,
      `- Local/Global: ${personality.localGlobal}/5`,
      '',
      '## Task',
      'Generate a brand voice definition that:',
      '1. Positions the brand on tone scales matching the personality',
      '2. Provides exactly 20 words to USE that feel authentic to this brand',
      '3. Provides exactly 10 words to AVOID that would contradict the personality',
      '4. Gives 3-5 actionable communication guidelines for content creators',
      '5. Ensures consistency across all brand touchpoints',
    ].join('\n');
  }

  /**
   * Parse the AI response into a validated BrandVoiceDefinition.
   */
  private parseResponse(text: string): BrandVoiceDefinition {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from voice generation response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as VoiceAIResponse;

    // Validate tone scales
    if (!Array.isArray(parsed.toneScales) || parsed.toneScales.length === 0) {
      throw new Error('No tone scales in voice generation response');
    }

    const toneScales: ToneScale[] = parsed.toneScales.map((s) => ({
      dimension: s.dimension,
      leftPole: s.leftPole,
      rightPole: s.rightPole,
      position: Math.max(1, Math.min(5, Math.round(s.position))),
    }));

    // Validate vocabulary guide
    const useWords = Array.isArray(parsed.vocabularyGuide?.useWords)
      ? parsed.vocabularyGuide.useWords.slice(0, 20)
      : [];
    const avoidWords = Array.isArray(parsed.vocabularyGuide?.avoidWords)
      ? parsed.vocabularyGuide.avoidWords.slice(0, 10)
      : [];

    if (useWords.length < 10) {
      throw new Error(`Expected at least 10 use words, received ${useWords.length}`);
    }

    const vocabularyGuide: VocabularyGuide = { useWords, avoidWords };

    // Validate communication guidelines
    const communicationGuidelines = Array.isArray(parsed.communicationGuidelines)
      ? parsed.communicationGuidelines.slice(0, 5)
      : [];

    if (communicationGuidelines.length < 3) {
      throw new Error(`Expected at least 3 guidelines, received ${communicationGuidelines.length}`);
    }

    return { toneScales, vocabularyGuide, communicationGuidelines };
  }
}
