/**
 * YouTube Thumbnail Template — 1280x720 (16:9)
 *
 * 5 layout variants mapped to SocialVariant types:
 *   'standard'       -> 'quote'        — Bold overlay text, brand color strip at bottom
 *   'face-focused'   -> 'tip'          — Person placeholder (left), text on right
 *   'bold-text'      -> 'statistic'    — Oversized 5-7 word text, minimal background
 *   'comparison'     -> 'question'     — Split 50/50, VS separator
 *   'branded-series' -> 'announcement' — Branded header 15-20% + title block
 *
 * Safe zone: content within inner 1024x576 (128px LR, 72px TB).
 *
 * CONSTRAINT: Flexbox only — no CSS Grid (ADR-005 / Satori).
 * CONSTRAINT: Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { SocialTemplateProps, SocialVariant } from '../../types';
import { tokenStr } from '../../types';
import { BrandBar } from '../shared/brand-bar';
import { Headline } from '../shared/headline';

const WIDTH = 1280;
const HEIGHT = 720;

/** Safe zone padding: 128px left/right, 72px top/bottom */
const SAFE_PADDING_H = 128;
const SAFE_PADDING_V = 72;

/**
 * Maps YouTube-specific variant names to SocialVariant types.
 * YouTube variants use the existing SocialVariant union for type safety.
 */
export const YT_VARIANT_MAP: Record<string, SocialVariant> = {
  standard: 'quote',
  'face-focused': 'tip',
  'bold-text': 'statistic',
  comparison: 'question',
  'branded-series': 'announcement',
} as const;

/**
 * Standard variant (mapped from 'quote') — Bold overlay text, brand color strip at bottom.
 * Composition: full primary background, centered headline, brand strip at bottom.
 */
function StandardVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const neutral = tokenStr(tokens.color, 'neutral50', '#f5f5f5');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary }}>
      {/* Safe zone wrapper */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `${SAFE_PADDING_V}px ${SAFE_PADDING_H}px` }}>
        <Headline tokens={tokens} text={content.headline} fontSize={56} color={neutral} align="center" />
        {content.body && (
          <span style={{ fontSize: 22, color: neutral, opacity: 0.8, marginTop: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      {/* Brand color strip at bottom */}
      <div style={{ display: 'flex', width: '100%', height: '8px', backgroundColor: tokenStr(tokens.color, 'secondary', '#e94560') }} />
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={48} />
    </div>
  );
}

/**
 * Face-Focused variant (mapped from 'tip') — Person placeholder box (left), text on right.
 * Composition: split layout, rounded placeholder on left, headline + body on right.
 */
function FaceFocusedVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      {/* Safe zone wrapper */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', padding: `${SAFE_PADDING_V}px ${SAFE_PADDING_H}px` }}>
        {/* Face placeholder — left half */}
        <div style={{ display: 'flex', width: '400px', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', width: '320px', height: '400px', borderRadius: '24px', border: `3px dashed ${secondary}`, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
            <span style={{ fontSize: 48, color: '#cccccc', fontFamily: 'sans-serif' }}>PHOTO</span>
          </div>
        </div>
        {/* Text — right half */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', paddingLeft: '40px' }}>
          <Headline tokens={tokens} text={content.headline} fontSize={44} color={primary} />
          {content.body && (
            <span style={{ fontSize: 20, color: '#555555', marginTop: '16px', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
        </div>
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={48} />
    </div>
  );
}

/**
 * Bold Text variant (mapped from 'statistic') — 5-7 word oversized text, minimal background.
 * Composition: centered oversized headline (60-80px), clean background.
 */
function BoldTextVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      {/* Safe zone wrapper */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `${SAFE_PADDING_V}px ${SAFE_PADDING_H}px` }}>
        {/* Accent dot */}
        <div style={{ display: 'flex', width: '16px', height: '16px', borderRadius: '8px', backgroundColor: secondary, marginBottom: '32px' }} />
        <Headline tokens={tokens} text={content.headline} fontSize={72} color={primary} align="center" />
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={48} />
    </div>
  );
}

/**
 * Comparison variant (mapped from 'question') — Split canvas 50/50, VS separator.
 * Composition: two halves with distinct backgrounds, VS badge in center.
 */
function ComparisonVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px` }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        {/* Left half */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: primary, padding: `${SAFE_PADDING_V}px 60px` }}>
          <Headline tokens={tokens} text={content.headline} fontSize={36} color="#ffffff" align="center" />
        </div>
        {/* VS separator */}
        <div style={{ display: 'flex', width: '80px', alignItems: 'center', justifyContent: 'center', backgroundColor: secondary }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', fontFamily: 'sans-serif' }}>VS</span>
        </div>
        {/* Right half */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', padding: `${SAFE_PADDING_V}px 60px` }}>
          {content.body ? (
            <Headline tokens={tokens} text={content.body} fontSize={36} color={primary} align="center" />
          ) : (
            <span style={{ fontSize: 28, color: '#999999', fontFamily: 'sans-serif' }}>Option B</span>
          )}
        </div>
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={48} />
    </div>
  );
}

/**
 * Branded Series variant (mapped from 'announcement') — Branded header + title block.
 * Composition: branded header bar (15-20%), title block below.
 */
function BrandedSeriesVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  // Header height: ~18% of 720 = ~130px
  const headerHeight = 130;

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      {/* Branded header bar */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', height: `${headerHeight}px`, backgroundColor: primary, padding: `0 ${SAFE_PADDING_H}px` }}>
        <img src={content.logoUrl} alt="Brand logo" width={60} height={60} style={{ objectFit: 'contain' }} />
        {content.stat && (
          <div style={{ display: 'flex', marginLeft: 'auto', backgroundColor: secondary, borderRadius: '6px', padding: '6px 16px' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>
              {content.stat}
            </span>
          </div>
        )}
      </div>
      {/* Title block */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: `${SAFE_PADDING_V}px ${SAFE_PADDING_H}px` }}>
        <Headline tokens={tokens} text={content.headline} fontSize={48} color={primary} />
        {content.body && (
          <span style={{ fontSize: 22, color: '#555555', marginTop: '16px', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * YouTubeThumbnail — Main template component for 1280x720.
 * Delegates to variant sub-components based on content.variant.
 *
 * Variant mapping (YouTube name -> SocialVariant):
 *   standard       -> quote
 *   face-focused   -> tip
 *   bold-text      -> statistic
 *   comparison     -> question
 *   branded-series -> announcement
 */
export function YouTubeThumbnail({ tokens, content }: SocialTemplateProps): React.ReactElement {
  switch (content.variant) {
    case 'quote':
      return <StandardVariant tokens={tokens} content={content} />;
    case 'tip':
      return <FaceFocusedVariant tokens={tokens} content={content} />;
    case 'statistic':
      return <BoldTextVariant tokens={tokens} content={content} />;
    case 'question':
      return <ComparisonVariant tokens={tokens} content={content} />;
    case 'announcement':
      return <BrandedSeriesVariant tokens={tokens} content={content} />;
    default:
      return <StandardVariant tokens={tokens} content={content} />;
  }
}

/** Platform spec for YouTube Thumbnail */
export const YOUTUBE_THUMBNAIL_SPEC = {
  platform: 'youtube',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
  maxFileSizeMB: 2,
} as const;
