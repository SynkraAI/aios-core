/**
 * X/Twitter Post Template — 1200x675
 *
 * 5 layout variants: quote, tip, statistic, question, announcement.
 * Bold, high-contrast: dark/high-saturation backgrounds, short text blocks
 * optimized for feed skimming, large stat/quote text. High visual punch.
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

const WIDTH = 1200;
const HEIGHT = 675;

/**
 * Quote variant — Bold centered quote on dark background.
 * High contrast, large text, maximum visual punch.
 */
function QuoteVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#0a0a0a' }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 80px' }}>
        <span style={{ fontSize: 90, color: secondary, opacity: 0.4, fontFamily: 'serif', lineHeight: 1 }}>&ldquo;</span>
        <Headline tokens={tokens} text={content.headline} fontSize={40} color="#ffffff" align="center" />
        {content.body && (
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: '16px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      {/* Accent line */}
      <div style={{ display: 'flex', width: '100%', height: '4px', backgroundColor: secondary }} />
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={48} />
    </div>
  );
}

/**
 * Tip variant — Punchy tip with bold accent.
 * Dark background, bright tip badge, short and scannable.
 */
function TipVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');
  const spacing = tokenNum(tokens.spacing, 'md', 16);

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#111111' }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: `${spacing * 3}px ${spacing * 4}px` }}>
        {/* Tip badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '36px', borderRadius: '4px', backgroundColor: secondary, marginBottom: `${spacing * 2}px` }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>TIP</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={38} color="#ffffff" />
        {content.body && (
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginTop: `${spacing}px`, lineHeight: 1.4, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      {content.ctaText && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', padding: `0 ${spacing * 4}px ${spacing * 2}px` }}>
          <CtaBadge tokens={tokens} text={content.ctaText} backgroundColor={secondary} fontSize={14} />
        </div>
      )}
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={48} />
    </div>
  );
}

/**
 * Statistic variant — Dominant stat number on dark background.
 * Maximum visual impact with oversized number.
 */
function StatisticVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#0a0a0a' }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 80px' }}>
        <span style={{ fontSize: 140, fontWeight: 900, color: secondary, lineHeight: 1, letterSpacing: '-0.05em', fontFamily: 'sans-serif' }}>
          {content.stat ?? '0'}
        </span>
        <div style={{ display: 'flex', width: '60px', height: '3px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '20px 0' }} />
        <Headline tokens={tokens} text={content.headline} fontSize={28} color="#ffffff" align="center" />
        {content.body && (
          <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', marginTop: '10px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={48} />
    </div>
  );
}

/**
 * Question variant — Bold question on dark background.
 * Large question mark watermark, high contrast text.
 */
function QuestionVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#0d0d0d' }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', position: 'relative' }}>
        <div style={{ display: 'flex', position: 'absolute', right: '-30px', top: '-50px', opacity: 0.05 }}>
          <span style={{ fontSize: 500, fontWeight: 900, color: '#ffffff', fontFamily: 'sans-serif' }}>?</span>
        </div>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '48px 80px' }}>
          <div style={{ display: 'flex', width: '44px', height: '44px', borderRadius: '22px', backgroundColor: secondary, alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: 22, color: '#ffffff', fontWeight: 800 }}>?</span>
          </div>
          <Headline tokens={tokens} text={content.headline} fontSize={38} color="#ffffff" />
          {content.body && (
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: '12px', fontFamily: 'sans-serif' }}>
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
 * Announcement variant — High-impact banner announcement.
 * Bold accent color header, dark content area.
 */
function AnnouncementVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#0a0a0a' }}>
      {/* Bold accent banner */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', backgroundColor: secondary, padding: '32px 60px', height: '280px' }}>
        <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '4px 14px', marginBottom: '14px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'sans-serif' }}>NEW</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={34} color="#ffffff" />
      </div>
      {/* Content */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '28px 60px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {content.body && (
            <span style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
          {content.stat && (
            <span style={{ fontSize: 14, color: secondary, marginTop: '10px', fontWeight: 600, fontFamily: 'sans-serif' }}>
              {content.stat}
            </span>
          )}
        </div>
        {content.ctaText && (
          <div style={{ display: 'flex' }}>
            <CtaBadge tokens={tokens} text={content.ctaText} backgroundColor={secondary} fontSize={14} />
          </div>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={48} />
    </div>
  );
}

/**
 * XTwitterPost — Main template component for 1200x675.
 * Delegates to variant sub-components based on content.variant.
 */
export function XTwitterPost({ tokens, content }: SocialTemplateProps): React.ReactElement {
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

/** Platform spec for X/Twitter Post */
export const X_TWITTER_POST_SPEC = {
  platform: 'x-twitter',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
