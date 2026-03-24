/**
 * Pre-defined mood tiles for Visual Preferences step (AC-4).
 *
 * At minimum 12 mood tiles available for client selection.
 * Client selects 2-3 moods from the collection.
 *
 * @module onboarding/mood-tiles
 */

import type { MoodTile } from './types';

/** Pre-defined mood tile definitions — at least 12 per AC-4. */
export const MOOD_TILES: readonly MoodTile[] = [
  {
    id: 'bold-modern',
    name: 'Bold & Modern',
    description: 'Strong, confident design with contemporary aesthetics',
    keywords: ['bold', 'modern', 'strong', 'confident', 'contemporary'],
  },
  {
    id: 'warm-approachable',
    name: 'Warm & Approachable',
    description: 'Friendly, inviting, human-centered feel',
    keywords: ['warm', 'friendly', 'inviting', 'approachable', 'human'],
  },
  {
    id: 'clean-minimal',
    name: 'Clean & Minimal',
    description: 'Simple, uncluttered, with focus on white space',
    keywords: ['clean', 'minimal', 'simple', 'whitespace', 'uncluttered'],
  },
  {
    id: 'luxurious-premium',
    name: 'Luxurious & Premium',
    description: 'High-end, sophisticated, exclusive feeling',
    keywords: ['luxury', 'premium', 'sophisticated', 'exclusive', 'high-end'],
  },
  {
    id: 'playful-creative',
    name: 'Playful & Creative',
    description: 'Fun, colorful, imaginative design language',
    keywords: ['playful', 'creative', 'fun', 'colorful', 'imaginative'],
  },
  {
    id: 'professional-corporate',
    name: 'Professional & Corporate',
    description: 'Trustworthy, established, business-focused',
    keywords: ['professional', 'corporate', 'trustworthy', 'established', 'business'],
  },
  {
    id: 'natural-organic',
    name: 'Natural & Organic',
    description: 'Earthy tones, sustainable, nature-inspired',
    keywords: ['natural', 'organic', 'earthy', 'sustainable', 'nature'],
  },
  {
    id: 'tech-futuristic',
    name: 'Tech & Futuristic',
    description: 'Cutting-edge, innovative, digital-first',
    keywords: ['tech', 'futuristic', 'innovative', 'digital', 'cutting-edge'],
  },
  {
    id: 'vintage-retro',
    name: 'Vintage & Retro',
    description: 'Nostalgic, classic, heritage-inspired',
    keywords: ['vintage', 'retro', 'nostalgic', 'classic', 'heritage'],
  },
  {
    id: 'elegant-refined',
    name: 'Elegant & Refined',
    description: 'Graceful, polished, attention to detail',
    keywords: ['elegant', 'refined', 'graceful', 'polished', 'detailed'],
  },
  {
    id: 'edgy-disruptive',
    name: 'Edgy & Disruptive',
    description: 'Breaking conventions, provocative, standout',
    keywords: ['edgy', 'disruptive', 'provocative', 'unconventional', 'standout'],
  },
  {
    id: 'calm-serene',
    name: 'Calm & Serene',
    description: 'Peaceful, relaxing, balanced aesthetics',
    keywords: ['calm', 'serene', 'peaceful', 'relaxing', 'balanced'],
  },
  {
    id: 'artisanal-handcrafted',
    name: 'Artisanal & Handcrafted',
    description: 'Handmade feel, authentic, craft-focused',
    keywords: ['artisanal', 'handcrafted', 'authentic', 'craft', 'handmade'],
  },
  {
    id: 'geometric-structured',
    name: 'Geometric & Structured',
    description: 'Shapes, patterns, mathematical precision',
    keywords: ['geometric', 'structured', 'patterns', 'shapes', 'precise'],
  },
] as const;

/** Map of mood tile ID to mood tile definition for O(1) lookups. */
export const MOOD_TILE_MAP: ReadonlyMap<string, MoodTile> = new Map(
  MOOD_TILES.map((tile) => [tile.id, tile]),
);

/**
 * Get a mood tile by its ID.
 *
 * @param id - Mood tile identifier
 * @returns MoodTile or undefined if not found
 */
export function getMoodTileById(id: string): MoodTile | undefined {
  return MOOD_TILE_MAP.get(id);
}

/**
 * Validate that all selected mood IDs exist in the pre-defined collection.
 *
 * @param selectedIds - Array of mood tile IDs selected by user
 * @returns Array of invalid IDs (empty if all valid)
 */
export function getInvalidMoodIds(selectedIds: readonly string[]): readonly string[] {
  return selectedIds.filter((id) => !MOOD_TILE_MAP.has(id));
}
