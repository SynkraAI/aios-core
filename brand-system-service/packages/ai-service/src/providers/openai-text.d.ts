/**
 * OpenAI GPT-4o text generation provider (fallback for Claude).
 *
 * @module ai-service/providers/openai-text
 */
import type { TextGenerationOptions, AITextResponse } from '../types';
/**
 * Generate text using the OpenAI GPT-4o API.
 *
 * Reads OPENAI_API_KEY from environment variables (AC 7).
 * Never logs or exposes the API key.
 */
export declare function generateTextWithOpenAI(options: TextGenerationOptions): Promise<AITextResponse>;
//# sourceMappingURL=openai-text.d.ts.map