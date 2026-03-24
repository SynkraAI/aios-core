/**
 * Content Slide Template — Numbered list layout for carousel.
 *
 * Displays numbered content points (max 5) as flex rows.
 * Includes continuity elements: slide number, swipe arrow, progress bar.
 *
 * CONSTRAINT: Flexbox only — no CSS Grid (ADR-005 / Satori).
 * CONSTRAINT: Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { SlideProps } from './cover-slide';
import { tokenStr } from '../../types';
import { Headline } from '../shared/headline';

const WIDTH = 1080;
const HEIGHT = 1350;
const MAX_CONTENT_ITEMS = 5;

/**
 * Parse body text into numbered items. Split on newlines.
 * Truncates to MAX_CONTENT_ITEMS.
 */
function parseContentItems(body: string | undefined): string[] {
  if (!body) return [];
  const items = body.split('\n').filter((line) => line.trim().length > 0);
  return items.slice(0, MAX_CONTENT_ITEMS);
}

/**
 * ContentSlide — Numbered list content with flex rows.
 */
export function ContentSlide({ tokens, content, slideIndex, totalSlides }: SlideProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');
  const isLastSlide = slideIndex === totalSlides - 1;
  const items = parseContentItems(content.body);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff', position: 'relative' }}>
      {/* Slide number — top-right */}
      <div style={{ display: 'flex', position: 'absolute', top: '24px', right: '24px' }}>
        <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)', fontFamily: 'sans-serif' }}>
          {slideIndex + 1}/{totalSlides}
        </span>
      </div>

      {/* Headline */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '60px 60px 32px 60px' }}>
        <Headline tokens={tokens} text={content.headline} fontSize={40} color={primary} />
      </div>

      {/* Numbered list */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '0 60px', gap: '24px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '20px' }}>
            {/* Number badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '24px', backgroundColor: secondary, flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', fontFamily: 'sans-serif' }}>
                {idx + 1}
              </span>
            </div>
            {/* Text content */}
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', minHeight: '48px' }}>
              <span style={{ fontSize: 22, color: '#333333', lineHeight: 1.4, fontFamily: 'sans-serif' }}>
                {item}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Swipe arrow — right edge, vertically centered */}
      {!isLastSlide && (
        <div style={{ display: 'flex', position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)' }}>
          <span style={{ fontSize: 32, color: 'rgba(0,0,0,0.3)', fontFamily: 'sans-serif' }}>&#x276F;</span>
        </div>
      )}

      {/* Progress bar — bottom 8px */}
      <div style={{ display: 'flex', width: '100%', height: '8px' }}>
        <div style={{ flex: slideIndex + 1, backgroundColor: primary }} />
        <div style={{ flex: totalSlides - slideIndex - 1, backgroundColor: '#E0E0E0' }} />
      </div>
    </div>
  );
}
