/**
 * DALL-E 3 image generation provider (fallback for Flux).
 *
 * @module ai-service/providers/openai-image
 */
import type { ImageGenerationOptions, AIImageResponse } from '../types';
/**
 * Generate an image using the OpenAI DALL-E 3 API.
 *
 * CONSTRAINT CON-15: Do not use this method for logo generation.
 * Logos must be human-designed.
 *
 * Reads OPENAI_API_KEY from environment variables (AC 7).
 * Never logs or exposes the API key.
 */
export declare function generateImageWithDalle(options: ImageGenerationOptions): Promise<AIImageResponse>;
//# sourceMappingURL=openai-image.d.ts.map