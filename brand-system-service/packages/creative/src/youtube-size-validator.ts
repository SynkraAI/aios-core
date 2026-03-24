/**
 * YouTube Thumbnail Size Validator — 2MB enforcement with JPG fallback.
 *
 * YouTube thumbnails must be <= 2MB (2,097,152 bytes).
 * Strategy:
 *   1. Try PNG first
 *   2. If > 2MB, fallback to JPG (quality 85 via Sharp default)
 *   3. If JPG also > 2MB, throw TemplateSizeError
 */

import { TemplateEngine } from './template-engine';
import { TemplateSizeError } from './types';
import type { RenderOptions } from './types';

/** Maximum YouTube thumbnail size in bytes (2MB) */
export const MAX_YOUTUBE_BYTES = 2_097_152;

/**
 * Render a YouTube thumbnail with automatic PNG-to-JPG fallback
 * when the output exceeds the 2MB YouTube limit.
 *
 * @param engine - TemplateEngine instance for rendering
 * @param options - Render options (element, tokens, spec, fonts)
 * @returns Buffer containing the rendered image (PNG or JPG)
 * @throws TemplateSizeError when both formats exceed 2MB
 */
export async function renderYouTubeThumbnail(
  engine: TemplateEngine,
  options: RenderOptions
): Promise<Buffer> {
  // Try PNG first
  const pngBuffer = await engine.render(options);
  if (pngBuffer.length <= MAX_YOUTUBE_BYTES) return pngBuffer;

  // PNG exceeds 2MB — fallback to JPG
  console.warn(
    `[YouTube] PNG thumbnail exceeds 2MB (${(pngBuffer.length / (1024 * 1024)).toFixed(2)}MB), falling back to JPG`
  );

  const jpgOptions: RenderOptions = {
    ...options,
    spec: { ...options.spec, format: 'jpg' as const },
  };
  const jpgBuffer = await engine.render(jpgOptions);
  if (jpgBuffer.length <= MAX_YOUTUBE_BYTES) return jpgBuffer;

  // Both formats exceed 2MB — throw
  throw new TemplateSizeError(jpgBuffer.length, MAX_YOUTUBE_BYTES, 'youtube');
}
