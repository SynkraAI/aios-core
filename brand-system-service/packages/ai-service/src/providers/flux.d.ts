/**
 * Flux 1.1 Pro image generation provider (via Replicate).
 *
 * @module ai-service/providers/flux
 */
import type { ImageGenerationOptions, AIImageResponse } from '../types';
/**
 * Generate an image using Flux 1.1 Pro via the Replicate API.
 *
 * CONSTRAINT CON-15: Do not use this method for logo generation.
 * Logos must be human-designed.
 *
 * Reads REPLICATE_API_TOKEN from environment variables (AC 7).
 * Never logs or exposes the API token.
 */
export declare function generateImageWithFlux(options: ImageGenerationOptions): Promise<AIImageResponse>;
//# sourceMappingURL=flux.d.ts.map