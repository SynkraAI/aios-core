/**
 * AI Service Abstraction Layer — Type Definitions
 *
 * Defines the unified interface for all AI provider interactions.
 *
 * @module ai-service/types
 */

/** Supported AI provider identifiers. */
export type AIProviderName = 'claude' | 'openai' | 'replicate' | 'dalle';

/** Options for text generation requests. */
export interface TextGenerationOptions {
  /** The user prompt to send to the model. */
  readonly prompt: string;
  /** Optional system prompt for context/instructions. */
  readonly systemPrompt?: string;
  /** Preferred provider. Defaults to 'claude'. */
  readonly provider?: AIProviderName;
  /** Ordered fallback providers if the primary fails. */
  readonly fallback?: AIProviderName[];
  /** Exact model version string passed through to the SDK without modification (AC 4). */
  readonly modelVersion?: string;
  /** Maximum tokens to generate. */
  readonly maxTokens?: number;
  /** Sampling temperature (0-1). */
  readonly temperature?: number;
  /** Client identifier for logging and cost attribution. */
  readonly clientId?: string;
}

/** Options for image generation requests. */
export interface ImageGenerationOptions {
  /** The image generation prompt. */
  readonly prompt: string;
  /** Preferred provider. Defaults to 'replicate'. */
  readonly provider?: AIProviderName;
  /** Ordered fallback providers if the primary fails. */
  readonly fallback?: AIProviderName[];
  /** Exact model version string passed through to the SDK without modification (AC 4). */
  readonly modelVersion?: string;
  /** Image width in pixels. */
  readonly width?: number;
  /** Image height in pixels. */
  readonly height?: number;
  /** Client identifier for logging and cost attribution. */
  readonly clientId?: string;
}

/** Response from a text generation call. */
export interface AITextResponse {
  /** The generated text content. */
  readonly text: string;
  /** The provider that fulfilled the request. */
  readonly provider: AIProviderName;
  /** The exact model identifier used. */
  readonly model: string;
  /** Number of input tokens consumed. */
  readonly inputTokens: number;
  /** Number of output tokens generated. */
  readonly outputTokens: number;
  /** Estimated cost in USD. */
  readonly costUsd: number;
  /** Request latency in milliseconds. */
  readonly latencyMs: number;
}

/** Response from an image generation call. */
export interface AIImageResponse {
  /** URL of the generated image. */
  readonly imageUrl: string;
  /** The provider that fulfilled the request. */
  readonly provider: AIProviderName;
  /** The exact model identifier used. */
  readonly model: string;
  /** Estimated cost in USD. */
  readonly costUsd: number;
  /** Request latency in milliseconds. */
  readonly latencyMs: number;
}

/**
 * Unified AI service provider interface.
 * All AI interactions go through this contract.
 */
export interface AIServiceProvider {
  /** Generate text using an AI model. */
  generateText(options: TextGenerationOptions): Promise<AITextResponse>;

  /**
   * Generate an image using an AI model.
   *
   * CONSTRAINT CON-15: Do not use this method for logo generation.
   * Logos must be human-designed.
   */
  generateImage(options: ImageGenerationOptions): Promise<AIImageResponse>;
}

/** Options for the retry mechanism. */
export interface RetryOptions {
  /** Maximum number of retry attempts. Defaults to 3. */
  readonly maxRetries?: number;
  /** Base delay in milliseconds for exponential backoff. Defaults to 1000. */
  readonly baseDelayMs?: number;
}

/** Structured log entry for an AI API call (AC 8). */
export interface AICallLogEntry {
  readonly timestamp: string;
  readonly clientId: string;
  readonly provider: AIProviderName;
  readonly model: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly costUsd: number;
  readonly latencyMs: number;
  readonly success: boolean;
  readonly errorMessage?: string;
}
