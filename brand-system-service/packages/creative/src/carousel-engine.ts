/**
 * CarouselEngine — Orchestrates multi-slide carousel generation (2-10 slides).
 *
 * Maps SlideType to dedicated template components and calls TemplateEngine.render()
 * per slide. Returns slides in order: cover first, content in sequence, summary
 * if present, CTA last.
 *
 * Architecture: Higher-level orchestrator that wraps TemplateEngine per slide.
 * Carousel dimensions: 1080x1350 for both Instagram and LinkedIn (FR-2.2).
 */

import React from 'react';
import { createLogger, type Logger } from '@bss/core';
import { TemplateEngine } from './template-engine';
import type { CarouselBrief, CarouselResult, PlatformSpec, SlideType } from './types';
import { CarouselValidationError } from './types';
import { CoverSlide } from './templates/carousel/cover-slide';
import { ContentSlide } from './templates/carousel/content-slide';
import { SummarySlide } from './templates/carousel/summary-slide';
import { CtaSlide } from './templates/carousel/cta-slide';
import type { SlideProps } from './templates/carousel/cover-slide';

const MIN_SLIDES = 2;
const MAX_SLIDES = 10;
const CAROUSEL_WIDTH = 1080;
const CAROUSEL_HEIGHT = 1350;

/**
 * Map of SlideType to its template component function.
 */
const SLIDE_TEMPLATE_MAP: Record<SlideType, (props: SlideProps) => React.ReactElement> = {
  cover: CoverSlide,
  content: ContentSlide,
  summary: SummarySlide,
  cta: CtaSlide,
};

/**
 * CarouselEngine generates multi-slide carousels by orchestrating
 * TemplateEngine renders for each slide in sequence.
 */
export class CarouselEngine {
  private readonly engine: TemplateEngine;
  private readonly logger: Logger;

  constructor(engine?: TemplateEngine) {
    this.engine = engine ?? new TemplateEngine();
    this.logger = createLogger('CarouselEngine');
  }

  /**
   * Generate a carousel from a brief.
   *
   * @param brief - Carousel generation brief with slides, tokens, platform
   * @returns CarouselResult with ordered Buffer array and metadata
   * @throws CarouselValidationError when slide count is outside 2-10 range
   */
  async generate(brief: CarouselBrief): Promise<CarouselResult> {
    const { slides, tokens, platform, clientId } = brief;
    const slideCount = slides.length;

    // Validate slide count
    if (slideCount < MIN_SLIDES || slideCount > MAX_SLIDES) {
      throw new CarouselValidationError(slideCount);
    }

    this.logger.info('Carousel generation started', {
      client_id: clientId,
      platform,
      slide_count: slideCount,
    });

    const spec: PlatformSpec = {
      platform,
      width: CAROUSEL_WIDTH,
      height: CAROUSEL_HEIGHT,
      format: 'png',
    };

    const buffers: Buffer[] = [];

    for (let i = 0; i < slideCount; i++) {
      const slide = slides[i];
      const TemplateComponent = SLIDE_TEMPLATE_MAP[slide.type];

      if (!TemplateComponent) {
        this.logger.warn('Unknown slide type, skipping', {
          slide_type: slide.type,
          slide_index: i,
        });
        continue;
      }

      const element = React.createElement(TemplateComponent, {
        tokens,
        content: slide.content,
        slideIndex: i,
        totalSlides: slideCount,
      });

      const buffer = await this.engine.render({
        element,
        tokens,
        spec,
        fonts: [],
        clientId,
      });

      buffers.push(buffer);
    }

    this.logger.info('Carousel generation completed', {
      client_id: clientId,
      platform,
      slide_count: slideCount,
      buffer_count: buffers.length,
    });

    return {
      buffers,
      slideCount: buffers.length,
      platform,
      dimensions: { width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT },
    };
  }
}
