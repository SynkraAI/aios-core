/**
 * AI Service orchestrator — main entry point (AC 6).
 *
 * Implements the AIServiceProvider interface with:
 * - Provider registration and selection
 * - Retry with exponential backoff (AC 5)
 * - Automatic fallback on primary failure (AC 6)
 * - Structured logging per call (AC 8)
 * - Model version pinning (AC 4)
 *
 * Default chains:
 * - Text: claude -> openai
 * - Image: replicate (flux) -> dalle
 *
 * @module ai-service/ai-service
 */
import type { AIServiceProvider, TextGenerationOptions, ImageGenerationOptions, AITextResponse, AIImageResponse } from './types';
/**
 * AI Service — unified orchestrator for all AI provider interactions.
 *
 * Implements provider fallback: when the primary provider fails all retries,
 * the service automatically switches to the next provider in the chain.
 */
export declare class AIService implements AIServiceProvider {
    private readonly textProviders;
    private readonly imageProviders;
    private readonly callLogger;
    constructor();
    /**
     * Generate text using the configured provider chain.
     *
     * @param options - Text generation options
     * @returns AI text response from the first successful provider
     */
    generateText(options: TextGenerationOptions): Promise<AITextResponse>;
    /**
     * Generate an image using the configured provider chain.
     *
     * CONSTRAINT CON-15: Do not use this method for logo generation.
     * Logos must be human-designed.
     *
     * @param options - Image generation options
     * @returns AI image response from the first successful provider
     */
    generateImage(options: ImageGenerationOptions): Promise<AIImageResponse>;
    /**
     * Log a text generation call result.
     */
    private logTextCall;
    /**
     * Log an image generation call result.
     */
    private logImageCall;
}
//# sourceMappingURL=ai-service.d.ts.map