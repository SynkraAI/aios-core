/**
 * Summary Slide Template — Key takeaways with heavier visual weight.
 *
 * Displays key takeaways in a condensed list format with bolder styling
 * than the content slide. Uses primary color accents for emphasis.
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

/**
 * Parse body text into takeaway items. Split on newlines.
 */
function parseTakeaways(body: string | undefined): string[] {
  if (!body) return [];
  return body.split('\n').filter((line) => line.trim().length > 0);
}

/**
 * SummarySlide — Key takeaways, heavier visual weight than content slide.
 */
export function SummarySlide({ tokens, content, slideIndex, totalSlides }: SlideProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');
  const isLastSlide = slideIndex === totalSlides - 1;
  const takeaways = parseTakeaways(content.body);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary, position: 'relative' }}>
      {/* Slide number — top-right */}
      <div style={{ display: 'flex', position: 'absolute', top: '24px', right: '24px' }}>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif' }}>
          {slideIndex + 1}/{totalSlides}
        </span>
      </div>

      {/* Header badge + headline */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '60px 60px 32px 60px' }}>
        <div style={{ display: 'flex', backgroundColor: secondary, borderRadius: '8px', padding: '8px 20px', marginBottom: '24px', alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>Key Takeaways</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={44} color="#ffffff" />
      </div>

      {/* Takeaway items — bold check marks, heavier font weight */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '0 60px', gap: '28px' }}>
        {takeaways.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '16px' }}>
            {/* Checkmark accent */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', flexShrink: 0 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: secondary, fontFamily: 'sans-serif' }}>&#x2713;</span>
            </div>
            {/* Text — bolder than content slide */}
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', minHeight: '36px' }}>
              <span style={{ fontSize: 24, fontWeight: 600, color: '#ffffff', lineHeight: 1.4, fontFamily: 'sans-serif' }}>
                {item}
              </span>
            </div>
          </div>
        ))}
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
