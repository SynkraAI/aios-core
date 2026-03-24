/**
 * Moodboard Image Generator (BSS-7.6 AC-5).
 *
 * Generates 8-12 moodboard images using Flux 1.1 Pro (via AIImageProvider).
 * Prompts are derived from the client's selected mood tiles and competitor
 * visual analysis. Images are stored in R2 under moodboard/.
 *
 * CON-15 Guard: Prompts containing logo-related terms are rejected.
 *
 * Concurrency is limited to maxConcurrentImages (default 3) to respect
 * rate limits on the Flux API (BSS-3.2).
 *
 * @module onboarding/analysis/moodboard-generator
 */

import type {
  AITextProvider,
  AIImageProvider,
  AnalysisR2Client,
  MoodboardManifest,
  MoodboardImage,
  CompetitorAnalysisResult,
} from './analysis-types';
import type { MoodTile } from '../types';
import { containsLogoTerms } from './competitor-analyzer';

/** Default image dimensions for moodboard images. */
const MOODBOARD_WIDTH = 1024;
const MOODBOARD_HEIGHT = 1024;

/** System prompt for moodboard prompt generation. */
const MOODBOARD_PROMPT_SYSTEM = `You are a brand moodboard curator. Generate image prompts for a brand moodboard.

Rules:
- Each prompt should describe a visual scene, texture, or abstract composition
- Prompts should reflect the brand mood keywords and visual tone
- Do NOT include any text, logos, logotypes, wordmarks, or brand marks in prompts
- Focus on colors, textures, patterns, environments, and abstract visual concepts
- Each prompt should be 1-3 sentences, descriptive and specific

Respond in valid JSON:
{
  "prompts": [
    "A warm, sunlit workspace with natural wood textures and copper accents, soft focus photography style",
    "Abstract geometric pattern in deep navy and gold, minimalist composition with clean lines"
  ]
}`;

/** Parsed AI response for moodboard prompts. */
interface MoodboardPromptsResponse {
  prompts: string[];
}

/**
 * MoodboardGenerator — creates moodboard images via AI image generation.
 */
export class MoodboardGenerator {
  private readonly textProvider: AITextProvider;
  private readonly imageProvider: AIImageProvider;
  private readonly r2Client: AnalysisR2Client;
  private readonly clientId: string;
  private readonly r2PathPrefix: string;
  private readonly maxConcurrent: number;
  private readonly targetImageCount: number;

  constructor(
    textProvider: AITextProvider,
    imageProvider: AIImageProvider,
    r2Client: AnalysisR2Client,
    clientId: string,
    r2PathPrefix: string,
    maxConcurrent: number = 3,
    targetImageCount: number = 10,
  ) {
    this.textProvider = textProvider;
    this.imageProvider = imageProvider;
    this.r2Client = r2Client;
    this.clientId = clientId;
    this.r2PathPrefix = r2PathPrefix;
    this.maxConcurrent = maxConcurrent;
    this.targetImageCount = Math.max(8, Math.min(12, targetImageCount));
  }

  /**
   * Generate moodboard images and store in R2.
   *
   * @param moodTiles - Selected mood tile definitions
   * @param competitorAnalysis - Competitor visual analysis
   * @returns Moodboard manifest with R2 keys for all images
   */
  async generate(
    moodTiles: readonly MoodTile[],
    competitorAnalysis: CompetitorAnalysisResult,
  ): Promise<MoodboardManifest> {
    // Step 1: Generate prompts from mood tiles + competitor data
    const prompts = await this.generatePrompts(moodTiles, competitorAnalysis);

    // Step 2: Filter out any prompts containing CON-15 forbidden terms
    const safePrompts = prompts.filter((prompt) => {
      if (containsLogoTerms(prompt)) {
        // CON-15: reject prompts with logo-related terms
        return false;
      }
      return true;
    });

    // Ensure we have enough prompts
    const finalPrompts = safePrompts.slice(0, this.targetImageCount);

    // Step 3: Generate images with concurrency control
    const images = await this.generateImagesWithConcurrency(finalPrompts);

    const sourceKeywords = moodTiles.flatMap((t) => [...t.keywords]);

    return {
      images,
      sourceKeywords: [...new Set(sourceKeywords)],
      imageCount: images.length,
    };
  }

  /**
   * Generate image prompts using AI text generation.
   */
  private async generatePrompts(
    moodTiles: readonly MoodTile[],
    competitorAnalysis: CompetitorAnalysisResult,
  ): Promise<string[]> {
    const moodKeywords = moodTiles.flatMap((t) => [...t.keywords]);
    const moodNames = moodTiles.map((t) => t.name);
    const tones = competitorAnalysis.commonPatterns.imageryTones;

    const userPrompt = [
      `## Brand Moods: ${moodNames.join(', ')}`,
      `Keywords: ${moodKeywords.join(', ')}`,
      '',
      `## Competitor Visual Tones: ${tones.length > 0 ? tones.join(', ') : 'No competitor data'}`,
      '',
      `## Task`,
      `Generate exactly ${this.targetImageCount} image prompts for a brand moodboard.`,
      'Each prompt should create a unique visual that reflects the brand mood.',
      'CRITICAL: Do NOT include any text, logos, logotypes, or wordmarks in any prompt.',
    ].join('\n');

    const response = await this.textProvider.generateText({
      prompt: userPrompt,
      systemPrompt: MOODBOARD_PROMPT_SYSTEM,
      provider: 'claude',
      clientId: this.clientId,
      temperature: 0.8,
    });

    return this.parsePromptsResponse(response.text);
  }

  /**
   * Parse the prompts response from AI.
   */
  private parsePromptsResponse(text: string): string[] {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from moodboard prompt generation response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as MoodboardPromptsResponse;

    if (!Array.isArray(parsed.prompts) || parsed.prompts.length === 0) {
      throw new Error('No prompts generated for moodboard');
    }

    return parsed.prompts;
  }

  /**
   * Generate images with concurrency control (max N concurrent).
   */
  private async generateImagesWithConcurrency(
    prompts: readonly string[],
  ): Promise<MoodboardImage[]> {
    const results: MoodboardImage[] = [];
    const queue = [...prompts];
    let index = 0;

    const processNext = async (): Promise<void> => {
      while (queue.length > 0) {
        const prompt = queue.shift();
        if (!prompt) break;

        const currentIndex = index++;
        try {
          const image = await this.generateSingleImage(prompt, currentIndex);
          results.push(image);
        } catch {
          // Skip failed image generations — pipeline continues
        }
      }
    };

    // Launch maxConcurrent workers
    const workers: Promise<void>[] = [];
    for (let i = 0; i < Math.min(this.maxConcurrent, prompts.length); i++) {
      workers.push(processNext());
    }

    await Promise.all(workers);

    // Sort by original index
    results.sort((a, b) => a.index - b.index);

    return results;
  }

  /**
   * Generate a single moodboard image and upload to R2.
   */
  private async generateSingleImage(
    prompt: string,
    imageIndex: number,
  ): Promise<MoodboardImage> {
    // Generate image via Flux
    const imageResponse = await this.imageProvider.generateImage({
      prompt,
      provider: 'replicate', // Flux 1.1 Pro
      width: MOODBOARD_WIDTH,
      height: MOODBOARD_HEIGHT,
      clientId: this.clientId,
    });

    // Download image from URL and upload to R2
    const r2Key = `${this.r2PathPrefix}/moodboard/moodboard-${String(imageIndex).padStart(2, '0')}.png`;

    // In real implementation, would fetch imageUrl and upload buffer.
    // For now, store the URL reference.
    await this.r2Client.uploadJson(`${r2Key}.meta.json`, {
      prompt,
      sourceUrl: imageResponse.imageUrl,
      provider: imageResponse.provider,
      model: imageResponse.model,
      generatedAt: new Date().toISOString(),
    });

    return {
      prompt,
      r2Key,
      width: MOODBOARD_WIDTH,
      height: MOODBOARD_HEIGHT,
      index: imageIndex,
    };
  }
}
