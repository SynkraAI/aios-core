/**
 * Cover Slide Template — Carousel first slide.
 *
 * Hook headline prominent, brand logo top-left, primary color background.
 * Includes continuity elements: slide number, swipe arrow, progress bar.
 *
 * CONSTRAINT: Flexbox only — no CSS Grid (ADR-005 / Satori).
 * CONSTRAINT: Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { SocialContent, TokenSet } from '../../types';
import { tokenStr } from '../../types';
import { Headline } from '../shared/headline';

const WIDTH = 1080;
const HEIGHT = 1350;

export interface SlideProps {
  readonly tokens: TokenSet;
  readonly content: SocialContent;
  readonly slideIndex: number;
  readonly totalSlides: number;
}

/**
 * CoverSlide — Hook headline, brand logo, primary color background.
 */
export function CoverSlide({ tokens, content, slideIndex, totalSlides }: SlideProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const isLastSlide = slideIndex === totalSlides - 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary, position: 'relative' }}>
      {/* Slide number — top-right */}
      <div style={{ display: 'flex', position: 'absolute', top: '24px', right: '24px' }}>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif' }}>
          {slideIndex + 1}/{totalSlides}
        </span>
      </div>

      {/* Brand logo — top-left */}
      <div style={{ display: 'flex', padding: '48px 60px 0 60px' }}>
        <img src={content.logoUrl} alt="Brand logo" width={80} height={80} style={{ objectFit: 'contain' }} />
      </div>

      {/* Main content — centered headline */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '0 60px' }}>
        <Headline tokens={tokens} text={content.headline} fontSize={56} color="#ffffff" />
        {content.body && (
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', marginTop: '24px', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>

      {/* Swipe arrow — right edge, vertically centered */}
      {!isLastSlide && (
        <div style={{ display: 'flex', position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)' }}>
          <span style={{ fontSize: 32, color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif' }}>&#x276F;</span>
        </div>
      )}

      {/* Progress bar — bottom 8px */}
      <div style={{ display: 'flex', width: '100%', height: '8px' }}>
        <div style={{ flex: slideIndex + 1, backgroundColor: '#ffffff' }} />
        <div style={{ flex: totalSlides - slideIndex - 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
      </div>
    </div>
  );
}
