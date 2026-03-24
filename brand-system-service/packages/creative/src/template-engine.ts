/**
 * TemplateEngine — JSX-to-SVG (Satori) + SVG-to-PNG/JPG (Sharp) rendering pipeline.
 *
 * Architecture: ADR-005 mandates Satori + Sharp for creative rendering.
 * CONSTRAINT: Satori does NOT support CSS Grid — flexbox only.
 *
 * Usage:
 *   const engine = new TemplateEngine();
 *   const buffer = await engine.render({
 *     element: <MyTemplate tokens={tokens} />,
 *     tokens,
 *     spec: { platform: 'instagram', width: 1080, height: 1080, format: 'png' },
 *     fonts: [{ name: 'Inter', data: fontBuffer, weight: 400 }],
 *     clientId: 'client-123',
 *   });
 */

import satori from 'satori';
import sharp from 'sharp';
import { createLogger, type Logger } from '@bss/core';
import type { RenderOptions, FontConfig } from './types';
import { TemplateSizeError } from './types';

/**
 * TemplateEngine renders React JSX components to PNG or JPG images
 * via Satori (JSX -> SVG) and Sharp (SVG -> raster).
 */
export class TemplateEngine {
  private readonly logger: Logger;

  constructor(debug = false) {
    this.logger = createLogger('TemplateEngine', debug);
  }

  /**
   * Render a JSX element to a PNG or JPG buffer.
   *
   * @param options - Render options including element, tokens, spec, fonts
   * @returns Buffer containing the rendered image
   * @throws TemplateSizeError when output exceeds spec.maxFileSizeMB
   */
  async render(options: RenderOptions): Promise<Buffer> {
    const { element, spec, fonts, clientId } = options;
    const startTime = Date.now();

    this.logger.info('Render started', {
      client_id: clientId ?? 'unknown',
      platform: spec.platform,
      width: spec.width,
      height: spec.height,
      format: spec.format,
    });

    try {
      // Phase 1: JSX -> SVG via Satori
      const svg = await satori(element, {
        width: spec.width,
        height: spec.height,
        fonts: fonts.map((f: FontConfig) => ({
          name: f.name,
          data: f.data,
          weight: f.weight ?? 400,
          style: f.style ?? 'normal',
        })),
      });

      // Phase 2: SVG -> PNG/JPG via Sharp
      let pipeline = sharp(Buffer.from(svg)).resize(spec.width, spec.height);

      let outputBuffer: Buffer;
      if (spec.format === 'jpg') {
        outputBuffer = await pipeline.jpeg({ quality: 90 }).toBuffer();
      } else {
        outputBuffer = await pipeline.png().toBuffer();
      }

      // Phase 3: Size limit enforcement
      if (spec.maxFileSizeMB !== undefined) {
        const maxSizeBytes = spec.maxFileSizeMB * 1024 * 1024;
        if (outputBuffer.length > maxSizeBytes) {
          throw new TemplateSizeError(
            outputBuffer.length,
            maxSizeBytes,
            spec.platform
          );
        }
      }

      const latencyMs = Date.now() - startTime;
      this.logger.info('Render completed', {
        client_id: clientId ?? 'unknown',
        platform: spec.platform,
        width: spec.width,
        height: spec.height,
        format: spec.format,
        latency_ms: latencyMs,
        output_size_bytes: outputBuffer.length,
      });

      return outputBuffer;
    } catch (error) {
      const latencyMs = Date.now() - startTime;

      if (error instanceof TemplateSizeError) {
        this.logger.error('Render failed: size limit exceeded', {
          client_id: clientId ?? 'unknown',
          platform: spec.platform,
          latency_ms: latencyMs,
          error: error.message,
        });
        throw error;
      }

      this.logger.error('Render failed', {
        client_id: clientId ?? 'unknown',
        platform: spec.platform,
        latency_ms: latencyMs,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new Error(
        `Failed to render template for ${spec.platform}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
