/**
 * Flux 1.1 Pro image generation provider (via Replicate).
 *
 * @module ai-service/providers/flux
 */

import Replicate from 'replicate';

import type { ImageGenerationOptions, AIImageResponse } from '../types';
import { AIServiceError, extractStatusCode, isRetryableStatus } from '../errors';

/** Default Replicate model identifier for Flux 1.1 Pro. */
const DEFAULT_MODEL = 'black-forest-labs/flux-1.1-pro';

/** Cost per image for Flux 1.1 Pro. */
const COST_PER_IMAGE = 0.04;

/**
 * Generate an image using Flux 1.1 Pro via the Replicate API.
 *
 * CONSTRAINT CON-15: Do not use this method for logo generation.
 * Logos must be human-designed.
 *
 * Reads REPLICATE_API_TOKEN from environment variables (AC 7).
 * Never logs or exposes the API token.
 */
export async function generateImageWithFlux(
  options: ImageGenerationOptions,
): Promise<AIImageResponse> {
  const apiToken = process.env['REPLICATE_API_TOKEN'];
  if (!apiToken) {
    throw new AIServiceError(
      'REPLICATE_API_TOKEN environment variable is not set',
      'replicate',
      401,
      false,
    );
  }

  const replicate = new Replicate({ auth: apiToken });
  const model = options.modelVersion ?? DEFAULT_MODEL;
  const startTime = Date.now();

  try {
    const output = await replicate.run(model as `${string}/${string}`, {
      input: {
        prompt: options.prompt,
        ...(options.width ? { width: options.width } : {}),
        ...(options.height ? { height: options.height } : {}),
      },
    });

    const latencyMs = Date.now() - startTime;

    // Replicate may return a string URL or an array of URLs
    let imageUrl: string;
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (Array.isArray(output) && typeof output[0] === 'string') {
      imageUrl = output[0];
    } else {
      throw new Error('Unexpected Replicate output format');
    }

    return {
      imageUrl,
      provider: 'replicate',
      model,
      costUsd: COST_PER_IMAGE,
      latencyMs,
    };
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    const statusCode = extractStatusCode(error);
    const message = error instanceof Error ? error.message : 'Unknown Replicate API error';
    throw new AIServiceError(
      `Replicate API error: ${message}`,
      'replicate',
      statusCode,
      isRetryableStatus(statusCode),
    );
  }
}
