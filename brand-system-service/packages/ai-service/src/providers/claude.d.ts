/**
 * Claude (Anthropic) text generation provider.
 *
 * @module ai-service/providers/claude
 */
import type { TextGenerationOptions, AITextResponse } from '../types';
/**
 * Generate text using the Anthropic Claude API.
 *
 * Reads ANTHROPIC_API_KEY from environment variables (AC 7).
 * Never logs or exposes the API key.
 */
export declare function generateTextWithClaude(options: TextGenerationOptions): Promise<AITextResponse>;
//# sourceMappingURL=claude.d.ts.map