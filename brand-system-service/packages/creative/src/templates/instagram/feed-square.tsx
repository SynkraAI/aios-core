/**
 * Instagram Feed Square Template — 1080x1080
 *
 * 5 layout variants: quote, tip, statistic, question, announcement.
 * Each variant produces a meaningfully different visual composition.
 *
 * CONSTRAINT: Flexbox only — no CSS Grid (ADR-005 / Satori).
 * CONSTRAINT: Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { SocialTemplateProps } from '../../types';
import { tokenStr, tokenNum } from '../../types';
import { BrandBar } from '../shared/brand-bar';
import { Headline } from '../shared/headline';
import { CtaBadge } from '../shared/cta-badge';

const WIDTH = 1080;
const HEIGHT = 1080;

/**
 * Quote variant — Large centered text, thin attribution line, minimal imagery.
 * Composition: vertical center, oversized quotation mark, headline as quote text.
 */
function QuoteVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const neutral = tokenStr(tokens.color, 'neutral50', '#f5f5f5');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
        <span style={{ fontSize: 120, color: neutral, opacity: 0.3, fontFamily: 'serif', lineHeight: 1 }}>&ldquo;</span>
        <Headline tokens={tokens} text={content.headline} fontSize={42} color={neutral} align="center" />
        {content.body && (
          <span style={{ fontSize: 18, color: neutral, opacity: 0.7, marginTop: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} />
    </div>
  );
}

/**
 * Tip variant — Numbered callout, short paragraphs, utilitarian layout.
 * Composition: top accent bar, icon-style number badge, headline + body stacked.
 */
function TipVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');
  const spacing = tokenNum(tokens.spacing, 'md', 16);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      {/* Top accent bar */}
      <div style={{ display: 'flex', width: '100%', height: '8px', backgroundColor: primary }} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: `${spacing * 4}px` }}>
        {/* Tip badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', backgroundColor: secondary, marginBottom: `${spacing * 2}px` }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#ffffff' }}>TIP</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={48} color={primary} />
        {content.body && (
          <span style={{ fontSize: 22, color: '#444444', marginTop: `${spacing * 2}px`, lineHeight: 1.5, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      {content.ctaText && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: `${spacing * 2}px` }}>
          <CtaBadge tokens={tokens} text={content.ctaText} />
        </div>
      )}
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} />
    </div>
  );
}

/**
 * Statistic variant — Dominant bold number, small context text.
 * Composition: oversized stat number centered, headline as context below.
 */
function StatisticVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
        {/* Large stat number */}
        <span style={{ fontSize: 160, fontWeight: 900, color: secondary, lineHeight: 1, letterSpacing: '-0.04em', fontFamily: 'sans-serif' }}>
          {content.stat ?? '0'}
        </span>
        {/* Divider line */}
        <div style={{ display: 'flex', width: '80px', height: '4px', backgroundColor: primary, margin: '32px 0' }} />
        <Headline tokens={tokens} text={content.headline} fontSize={32} color={primary} align="center" />
        {content.body && (
          <span style={{ fontSize: 18, color: '#666666', marginTop: '16px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} />
    </div>
  );
}

/**
 * Question variant — Oversized question mark, hook text, open composition.
 * Composition: large "?" watermark background, headline as question text.
 */
function QuestionVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', position: 'relative' }}>
        {/* Watermark question mark */}
        <div style={{ display: 'flex', position: 'absolute', right: '-40px', top: '-60px', opacity: 0.08 }}>
          <span style={{ fontSize: 600, fontWeight: 900, color: '#ffffff', fontFamily: 'sans-serif' }}>?</span>
        </div>
        {/* Content */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'flex-end', padding: '80px' }}>
          <div style={{ display: 'flex', width: '48px', height: '48px', borderRadius: '24px', backgroundColor: secondary, alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: 24, color: '#ffffff', fontWeight: 700 }}>?</span>
          </div>
          <Headline tokens={tokens} text={content.headline} fontSize={44} color="#ffffff" />
          {content.body && (
            <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', marginTop: '16px', fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
        </div>
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} />
    </div>
  );
}

/**
 * Announcement variant — Banner-style header, date/event detail block.
 * Composition: bold top banner, structured content area with details.
 */
function AnnouncementVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      {/* Banner header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', backgroundColor: primary, padding: '60px', height: '380px' }}>
        <div style={{ display: 'flex', backgroundColor: secondary, borderRadius: '8px', padding: '8px 20px', marginBottom: '20px' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>Announcement</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={44} color="#ffffff" />
      </div>
      {/* Detail block */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '48px 60px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {content.body && (
            <span style={{ fontSize: 22, color: '#333333', lineHeight: 1.6, fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
          {content.stat && (
            <span style={{ fontSize: 18, color: primary, marginTop: '16px', fontWeight: 600, fontFamily: 'sans-serif' }}>
              {content.stat}
            </span>
          )}
        </div>
        {content.ctaText && (
          <div style={{ display: 'flex' }}>
            <CtaBadge tokens={tokens} text={content.ctaText} />
          </div>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} />
    </div>
  );
}

/**
 * InstagramFeedSquare — Main template component for 1080x1080.
 * Delegates to variant sub-components based on content.variant.
 */
export function InstagramFeedSquare({ tokens, content }: SocialTemplateProps): React.ReactElement {
  switch (content.variant) {
    case 'quote':
      return <QuoteVariant tokens={tokens} content={content} />;
    case 'tip':
      return <TipVariant tokens={tokens} content={content} />;
    case 'statistic':
      return <StatisticVariant tokens={tokens} content={content} />;
    case 'question':
      return <QuestionVariant tokens={tokens} content={content} />;
    case 'announcement':
      return <AnnouncementVariant tokens={tokens} content={content} />;
    default:
      return <QuoteVariant tokens={tokens} content={content} />;
  }
}

/** Platform spec for Instagram Feed Square */
export const INSTAGRAM_FEED_SQUARE_SPEC = {
  platform: 'instagram',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
