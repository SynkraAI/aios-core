/**
 * Claude (Anthropic) text generation provider.
 *
 * @module ai-service/providers/claude
 */

import Anthropic from '@anthropic-ai/sdk';

import type { TextGenerationOptions, AITextResponse } from '../types';
import { AIServiceError, extractStatusCode, isRetryableStatus } from '../errors';

/** Default model for Claude text generation. */
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

/**
 * Generate text using the Anthropic Claude API.
 *
 * Reads ANTHROPIC_API_KEY from environment variables (AC 7).
 * Never logs or exposes the API key.
 */
export async function generateTextWithClaude(
  options: TextGenerationOptions,
): Promise<AITextResponse> {
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    throw new AIServiceError(
      'ANTHROPIC_API_KEY environment variable is not set',
      'claude',
      401,
      false,
    );
  }

  const client = new Anthropic({ apiKey });
  const model = options.modelVersion ?? DEFAULT_MODEL;
  const startTime = Date.now();

  try {
    const response = await client.messages.create({
      model,
      max_tokens: options.maxTokens ?? 4096,
      ...(options.systemPrompt ? { system: options.systemPrompt } : {}),
      messages: [{ role: 'user', content: options.prompt }],
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    });

    const latencyMs = Date.now() - startTime;
    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text ?? '')
      .join('');

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const costUsd = (inputTokens * 3.0 + outputTokens * 15.0) / 1_000_000;

    return {
      text,
      provider: 'claude',
      model,
      inputTokens,
      outputTokens,
      costUsd,
      latencyMs,
    };
  } catch (error) {
    const statusCode = extractStatusCode(error);
    const message = error instanceof Error ? error.message : 'Unknown Claude API error';
    throw new AIServiceError(
      `Claude API error: ${message}`,
      'claude',
      statusCode,
      isRetryableStatus(statusCode),
    );
  }
}
