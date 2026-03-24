/**
 * Hashtag Generator — generates 8-12 hashtags via AI.
 *
 * Uses a separate AI call with the hashtag-set prompt template
 * to produce a mix of niche (<50K), medium (50K-500K), and
 * broad (500K+) reach hashtags.
 *
 * @see BSS-3.7 AC 5
 * @module copy-pipeline/hashtag-generator
 */

import type { AIService } from '@brand-system/ai-service';
import type { PromptRegistry, ClientContext } from '@brand-system/prompts';
import { render } from '@brand-system/prompts';

/** Minimum hashtags to return. */
const MIN_HASHTAGS = 8;

/** Maximum hashtags to return. */
const MAX_HASHTAGS = 12;

/**
 * Parsed hashtag response from AI.
 * The AI may return hashtags grouped by tier or as a flat list.
 */
interface HashtagAIResponse {
  niche?: string[];
  medium?: string[];
  broad?: string[];
  hashtags?: string[];
}

/**
 * Generate a set of 8-12 hashtags for given content.
 *
 * @param aiService - AI provider service
 * @param promptRegistry - Template registry with hashtag-set template
 * @param clientContext - Client brand context
 * @param topic - Content topic for hashtag generation
 * @param platform - Target platform
 * @returns Array of 8-12 hashtag strings
 */
export async function generateHashtags(
  aiService: AIService,
  promptRegistry: PromptRegistry,
  clientContext: ClientContext,
  topic: string,
  platform: string,
): Promise<string[]> {
  const template = promptRegistry.getTemplate('hashtag-set');
  if (!template) {
    // Fallback: return empty array if no hashtag template registered
    return [];
  }

  // Inject topic and platform into client context for template rendering
  const enrichedContext: ClientContext = {
    ...clientContext,
    contentCategory: topic,
    platform,
  };

  const rendered = render(template, enrichedContext);

  const response = await aiService.generateText({
    prompt: rendered.user,
    systemPrompt: rendered.system,
    provider: 'claude',
    clientId: clientContext.clientId,
    maxTokens: 500,
  });

  return parseHashtags(response.text);
}

/**
 * Parse hashtags from AI response text.
 *
 * Attempts JSON parse first. Falls back to regex extraction
 * of #hashtag patterns from free-form text.
 *
 * @param text - Raw AI response text
 * @returns Array of 8-12 hashtag strings (with # prefix)
 */
export function parseHashtags(text: string): string[] {
  let hashtags: string[] = [];

  // Attempt 1: JSON parse
  try {
    // Extract JSON from potential markdown code block
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, text];
    const jsonText = jsonMatch[1] ?? text;
    const parsed = JSON.parse(jsonText.trim()) as HashtagAIResponse;

    if (parsed.hashtags && Array.isArray(parsed.hashtags)) {
      hashtags = parsed.hashtags;
    } else {
      // Combine tiered hashtags
      const niche = parsed.niche ?? [];
      const medium = parsed.medium ?? [];
      const broad = parsed.broad ?? [];
      hashtags = [...niche, ...medium, ...broad];
    }
  } catch {
    // Attempt 2: Regex extraction of #hashtag patterns
    const matches = text.match(/#[\w\u00C0-\u024F]+/g);
    if (matches) {
      hashtags = matches;
    }
  }

  // Normalize: ensure # prefix
  hashtags = hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`));

  // Remove duplicates
  hashtags = [...new Set(hashtags)];

  // Enforce 8-12 count: truncate if over, pad if under
  if (hashtags.length > MAX_HASHTAGS) {
    hashtags = hashtags.slice(0, MAX_HASHTAGS);
  }

  // If under minimum but we have some, return what we have
  // (better than padding with garbage)
  return hashtags.slice(0, MAX_HASHTAGS);
}
