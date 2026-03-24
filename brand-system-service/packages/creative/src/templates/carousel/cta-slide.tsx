/**
 * CTA Slide Template — Call-to-action / branding last slide.
 *
 * Brand logo centered, CTA text prominent, secondary color accent.
 * NO swipe arrow (this is always the last slide in a carousel).
 *
 * CONSTRAINT: Flexbox only — no CSS Grid (ADR-005 / Satori).
 * CONSTRAINT: Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { SlideProps } from './cover-slide';
import { tokenStr } from '../../types';
import { CtaBadge } from '../shared/cta-badge';

const WIDTH = 1080;
const HEIGHT = 1350;

/**
 * CtaSlide — Brand logo centered, CTA text, secondary accent.
 * No swipe arrow — this is always the final slide.
 */
export function CtaSlide({ tokens, content, slideIndex, totalSlides }: SlideProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff', position: 'relative' }}>
      {/* Slide number — top-right */}
      <div style={{ display: 'flex', position: 'absolute', top: '24px', right: '24px' }}>
        <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)', fontFamily: 'sans-serif' }}>
          {slideIndex + 1}/{totalSlides}
        </span>
      </div>

      {/* Main content — centered vertically */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
        {/* Brand logo — centered, large */}
        <img src={content.logoUrl} alt="Brand logo" width={160} height={160} style={{ objectFit: 'contain', marginBottom: '48px' }} />

        {/* Headline */}
        {content.headline && (
          <span style={{ fontSize: 36, fontWeight: 700, color: primary, textAlign: 'center', lineHeight: 1.3, marginBottom: '32px', fontFamily: 'sans-serif' }}>
            {content.headline}
          </span>
        )}

        {/* Secondary color accent divider */}
        <div style={{ display: 'flex', width: '80px', height: '4px', backgroundColor: secondary, marginBottom: '32px' }} />

        {/* CTA badge */}
        {content.ctaText && (
          <CtaBadge tokens={tokens} text={content.ctaText} backgroundColor={secondary} fontSize={18} />
        )}
      </div>

      {/* No swipe arrow — CTA is always last */}

      {/* Progress bar — bottom 8px (fully filled on last slide) */}
      <div style={{ display: 'flex', width: '100%', height: '8px' }}>
        <div style={{ flex: slideIndex + 1, backgroundColor: primary }} />
        <div style={{ flex: totalSlides - slideIndex - 1, backgroundColor: '#E0E0E0' }} />
      </div>
    </div>
  );
}
