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

import type {
  AIServiceProvider,
  AIProviderName,
  TextGenerationOptions,
  ImageGenerationOptions,
  AITextResponse,
  AIImageResponse,
  AICallLogEntry,
} from './types';
import { AIServiceError } from './errors';
import { withRetry } from './retry';
import { createCallLogger } from './call-logger';
import { generateTextWithClaude } from './providers/claude';
import { generateTextWithOpenAI } from './providers/openai-text';
import { generateImageWithFlux } from './providers/flux';
import { generateImageWithDalle } from './providers/openai-image';

/** Default text provider chain. */
const DEFAULT_TEXT_CHAIN: AIProviderName[] = ['claude', 'openai'];

/** Default image provider chain. */
const DEFAULT_IMAGE_CHAIN: AIProviderName[] = ['replicate', 'dalle'];

/** Text generation function signature. */
type TextGenerateFn = (options: TextGenerationOptions) => Promise<AITextResponse>;

/** Image generation function signature. */
type ImageGenerateFn = (options: ImageGenerationOptions) => Promise<AIImageResponse>;

/**
 * AI Service — unified orchestrator for all AI provider interactions.
 *
 * Implements provider fallback: when the primary provider fails all retries,
 * the service automatically switches to the next provider in the chain.
 */
export class AIService implements AIServiceProvider {
  private readonly textProviders: Map<AIProviderName, TextGenerateFn>;
  private readonly imageProviders: Map<AIProviderName, ImageGenerateFn>;
  private readonly callLogger: ReturnType<typeof createCallLogger>;

  constructor() {
    this.textProviders = new Map<AIProviderName, TextGenerateFn>([
      ['claude', generateTextWithClaude],
      ['openai', generateTextWithOpenAI],
    ]);

    this.imageProviders = new Map<AIProviderName, ImageGenerateFn>([
      ['replicate', generateImageWithFlux],
      ['dalle', generateImageWithDalle],
    ]);

    this.callLogger = createCallLogger();
  }

  /**
   * Generate text using the configured provider chain.
   *
   * @param options - Text generation options
   * @returns AI text response from the first successful provider
   */
  async generateText(options: TextGenerationOptions): Promise<AITextResponse> {
    const primaryProvider = options.provider ?? 'claude';
    const fallbackProviders =
      options.fallback ?? DEFAULT_TEXT_CHAIN.filter((p) => p !== primaryProvider);
    const chain = [primaryProvider, ...fallbackProviders];

    let lastError: unknown;

    for (const providerName of chain) {
      const generateFn = this.textProviders.get(providerName);
      if (!generateFn) continue;

      try {
        const response = await withRetry(() => generateFn(options));

        this.logTextCall(options, response, true);
        return response;
      } catch (error) {
        lastError = error;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        this.logTextCall(options, null, false, providerName, errorMessage);

        // Log fallback event if there are more providers to try
        const nextIndex = chain.indexOf(providerName) + 1;
        if (nextIndex < chain.length) {
          this.callLogger.logFallback(
            providerName,
            chain[nextIndex],
            `Primary provider ${providerName} exhausted all retries: ${errorMessage}`,
          );
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new AIServiceError('All providers failed', 'claude', 500, false);
  }

  /**
   * Generate an image using the configured provider chain.
   *
   * CONSTRAINT CON-15: Do not use this method for logo generation.
   * Logos must be human-designed.
   *
   * @param options - Image generation options
   * @returns AI image response from the first successful provider
   */
  async generateImage(options: ImageGenerationOptions): Promise<AIImageResponse> {
    const primaryProvider = options.provider ?? 'replicate';
    const fallbackProviders =
      options.fallback ?? DEFAULT_IMAGE_CHAIN.filter((p) => p !== primaryProvider);
    const chain = [primaryProvider, ...fallbackProviders];

    let lastError: unknown;

    for (const providerName of chain) {
      const generateFn = this.imageProviders.get(providerName);
      if (!generateFn) continue;

      try {
        const response = await withRetry(() => generateFn(options));

        this.logImageCall(options, response, true);
        return response;
      } catch (error) {
        lastError = error;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        this.logImageCall(options, null, false, providerName, errorMessage);

        const nextIndex = chain.indexOf(providerName) + 1;
        if (nextIndex < chain.length) {
          this.callLogger.logFallback(
            providerName,
            chain[nextIndex],
            `Primary provider ${providerName} exhausted all retries: ${errorMessage}`,
          );
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new AIServiceError('All image providers failed', 'replicate', 500, false);
  }

  /**
   * Log a text generation call result.
   */
  private logTextCall(
    options: TextGenerationOptions,
    response: AITextResponse | null,
    success: boolean,
    providerOverride?: AIProviderName,
    errorMessage?: string,
  ): void {
    const entry: AICallLogEntry = {
      timestamp: new Date().toISOString(),
      clientId: options.clientId ?? 'unknown',
      provider: response?.provider ?? providerOverride ?? 'claude',
      model: response?.model ?? options.modelVersion ?? 'unknown',
      inputTokens: response?.inputTokens ?? 0,
      outputTokens: response?.outputTokens ?? 0,
      costUsd: response?.costUsd ?? 0,
      latencyMs: response?.latencyMs ?? 0,
      success,
      ...(errorMessage ? { errorMessage } : {}),
    };

    this.callLogger.logCall(entry);
  }

  /**
   * Log an image generation call result.
   */
  private logImageCall(
    options: ImageGenerationOptions,
    response: AIImageResponse | null,
    success: boolean,
    providerOverride?: AIProviderName,
    errorMessage?: string,
  ): void {
    const entry: AICallLogEntry = {
      timestamp: new Date().toISOString(),
      clientId: options.clientId ?? 'unknown',
      provider: response?.provider ?? providerOverride ?? 'replicate',
      model: response?.model ?? options.modelVersion ?? 'unknown',
      inputTokens: 0,
      outputTokens: 0,
      costUsd: response?.costUsd ?? 0,
      latencyMs: response?.latencyMs ?? 0,
      success,
      ...(errorMessage ? { errorMessage } : {}),
    };

    this.callLogger.logCall(entry);
  }
}
