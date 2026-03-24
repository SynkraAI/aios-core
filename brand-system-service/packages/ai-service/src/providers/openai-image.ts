/**
 * DALL-E 3 image generation provider (fallback for Flux).
 *
 * @module ai-service/providers/openai-image
 */

import OpenAI from 'openai';

import type { ImageGenerationOptions, AIImageResponse } from '../types';
import { AIServiceError, extractStatusCode, isRetryableStatus } from '../errors';

/** Default model for DALL-E image generation. */
const DEFAULT_MODEL = 'dall-e-3';

/** Default image dimensions. */
const DEFAULT_SIZE = '1024x1024';

/** Cost per image for DALL-E 3 (1024x1024 standard). */
const COST_PER_IMAGE = 0.04;

/**
 * Generate an image using the OpenAI DALL-E 3 API.
 *
 * CONSTRAINT CON-15: Do not use this method for logo generation.
 * Logos must be human-designed.
 *
 * Reads OPENAI_API_KEY from environment variables (AC 7).
 * Never logs or exposes the API key.
 */
export async function generateImageWithDalle(
  options: ImageGenerationOptions,
): Promise<AIImageResponse> {
  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    throw new AIServiceError('OPENAI_API_KEY environment variable is not set', 'dalle', 401, false);
  }

  const client = new OpenAI({ apiKey });
  const model = options.modelVersion ?? DEFAULT_MODEL;
  const startTime = Date.now();

  // Map width/height to DALL-E size string, default to 1024x1024
  const size =
    options.width && options.height
      ? (`${options.width}x${options.height}` as '1024x1024')
      : (DEFAULT_SIZE as '1024x1024');

  try {
    const response = await client.images.generate({
      model,
      prompt: options.prompt,
      n: 1,
      size,
    });

    const latencyMs = Date.now() - startTime;
    const imageUrl = response.data[0]?.url ?? '';

    return {
      imageUrl,
      provider: 'dalle',
      model,
      costUsd: COST_PER_IMAGE,
      latencyMs,
    };
  } catch (error) {
    const statusCode = extractStatusCode(error);
    const message = error instanceof Error ? error.message : 'Unknown DALL-E API error';
    throw new AIServiceError(
      `DALL-E API error: ${message}`,
      'dalle',
      statusCode,
      isRetryableStatus(statusCode),
    );
  }
}
