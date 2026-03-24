/**
 * CreativePipeline orchestrates creative asset generation using TemplateEngine.
 *
 * Replaces the placeholder implementation from BSS-1.x with the real
 * Satori + Sharp rendering pipeline per ADR-005.
 */

import type { ReactElement } from 'react';
import { createLogger, type Logger } from '@bss/core';
import { TemplateEngine } from './template-engine';
import type { PlatformSpec, TokenSet, FontConfig } from './types';

// ---------------------------------------------------------------------------
// Preserved interface — backward compatibility with BSS-1.x consumers
// ---------------------------------------------------------------------------

/**
 * Options for creative asset generation.
 * Preserved from original placeholder for backward compatibility.
 */
export interface CreativeOptions {
  /** Client identifier */
  readonly clientId: string;
  /** Template name to render */
  readonly template: string;
  /** Output format */
  readonly format: 'png' | 'jpg';
  /** Target platform */
  readonly platform?: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'youtube' | 'pinterest' | 'custom';
  /** Custom width (when platform is 'custom') */
  readonly width?: number;
  /** Custom height (when platform is 'custom') */
  readonly height?: number;
}

// ---------------------------------------------------------------------------
// Platform dimension defaults
// ---------------------------------------------------------------------------

const PLATFORM_SPECS: Record<string, Omit<PlatformSpec, 'format'>> = {
  instagram: { platform: 'instagram', width: 1080, height: 1080 },
  facebook: { platform: 'facebook', width: 1200, height: 630 },
  linkedin: { platform: 'linkedin', width: 1200, height: 644 },
  twitter: { platform: 'twitter', width: 1200, height: 675 },
  youtube: { platform: 'youtube', width: 1280, height: 720, maxFileSizeMB: 2 },
  pinterest: { platform: 'pinterest', width: 1000, height: 1500 },
};

// ---------------------------------------------------------------------------
// CreativePipeline
// ---------------------------------------------------------------------------

/**
 * CreativePipeline uses TemplateEngine internally to render JSX templates
 * into platform-specific image assets.
 */
export class CreativePipeline {
  private readonly logger: Logger;
  private readonly engine: TemplateEngine;

  constructor(debug = false) {
    this.logger = createLogger('CreativePipeline', debug);
    this.engine = new TemplateEngine(debug);
  }

  /**
   * Generate a creative asset from a JSX element.
   *
   * @param element - React JSX element to render
   * @param tokens - W3C DTCG token set for template injection
   * @param fonts - Font configurations loaded as ArrayBuffer
   * @param options - Creative options (platform, format, client info)
   * @returns Buffer containing the rendered image
   */
  async generate(
    element: ReactElement,
    tokens: TokenSet,
    fonts: readonly FontConfig[],
    options: CreativeOptions
  ): Promise<Buffer> {
    this.logger.info('Creative generation started', {
      clientId: options.clientId,
      template: options.template,
      format: options.format,
      platform: options.platform ?? 'custom',
    });

    const spec = this.resolvePlatformSpec(options);

    const result = await this.engine.render({
      element,
      tokens,
      spec,
      fonts,
      clientId: options.clientId,
    });

    this.logger.info('Creative generation completed', {
      clientId: options.clientId,
      template: options.template,
      output_size_bytes: result.length,
    });

    return result;
  }

  /**
   * Resolve a CreativeOptions platform to a full PlatformSpec.
   */
  private resolvePlatformSpec(options: CreativeOptions): PlatformSpec {
    const platform = options.platform ?? 'custom';

    if (platform !== 'custom' && platform in PLATFORM_SPECS) {
      const base = PLATFORM_SPECS[platform];
      return {
        ...base,
        format: options.format,
      };
    }

    // Custom platform requires explicit width/height
    if (!options.width || !options.height) {
      throw new Error(
        'Custom platform requires explicit width and height in CreativeOptions'
      );
    }

    return {
      platform: 'custom',
      width: options.width,
      height: options.height,
      format: options.format,
    };
  }
}
