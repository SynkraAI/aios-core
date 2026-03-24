/**
 * OpenAI GPT-4o text generation provider (fallback for Claude).
 *
 * @module ai-service/providers/openai-text
 */

import OpenAI from 'openai';

import type { TextGenerationOptions, AITextResponse } from '../types';
import { AIServiceError, extractStatusCode, isRetryableStatus } from '../errors';

/** Default model for OpenAI text generation. */
const DEFAULT_MODEL = 'gpt-4o';

/**
 * Generate text using the OpenAI GPT-4o API.
 *
 * Reads OPENAI_API_KEY from environment variables (AC 7).
 * Never logs or exposes the API key.
 */
export async function generateTextWithOpenAI(
  options: TextGenerationOptions,
): Promise<AITextResponse> {
  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    throw new AIServiceError(
      'OPENAI_API_KEY environment variable is not set',
      'openai',
      401,
      false,
    );
  }

  const client = new OpenAI({ apiKey });
  const model = options.modelVersion ?? DEFAULT_MODEL;
  const startTime = Date.now();

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: options.prompt });

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: options.maxTokens ?? 4096,
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    });

    const latencyMs = Date.now() - startTime;
    const text = response.choices[0]?.message?.content ?? '';
    const inputTokens = response.usage?.prompt_tokens ?? 0;
    const outputTokens = response.usage?.completion_tokens ?? 0;
    const costUsd = (inputTokens * 5.0 + outputTokens * 15.0) / 1_000_000;

    return {
      text,
      provider: 'openai',
      model,
      inputTokens,
      outputTokens,
      costUsd,
      latencyMs,
    };
  } catch (error) {
    const statusCode = extractStatusCode(error);
    const message = error instanceof Error ? error.message : 'Unknown OpenAI API error';
    throw new AIServiceError(
      `OpenAI API error: ${message}`,
      'openai',
      statusCode,
      isRetryableStatus(statusCode),
    );
  }
}
