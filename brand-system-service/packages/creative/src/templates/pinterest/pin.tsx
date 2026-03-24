/**
 * Pinterest Pin Template — 1000x1500
 *
 * 5 layout variants: quote, tip, statistic, question, announcement.
 * Image-dominant vertical layout: top 750px for image placeholder,
 * bottom 750px for text content, brand bar at bottom 80px.
 * Save-friendly composition with minimal text overlay.
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

const WIDTH = 1000;
const HEIGHT = 1500;
const IMAGE_HEIGHT = 750;

/**
 * Image placeholder section — top half of pin.
 * Shows imageUrl if provided, otherwise a branded placeholder.
 */
function ImageSection({ tokens, imageUrl }: { tokens: SocialTemplateProps['tokens']; imageUrl?: string }): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');

  if (imageUrl) {
    return (
      <div style={{ display: 'flex', width: '100%', height: `${IMAGE_HEIGHT}px`, overflow: 'hidden' }}>
        <img src={imageUrl} alt="" width={WIDTH} height={IMAGE_HEIGHT} style={{ objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: `${IMAGE_HEIGHT}px`, backgroundColor: primary, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', width: '120px', height: '120px', borderRadius: '60px', border: '3px solid rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 40, color: 'rgba(255,255,255,0.2)', fontFamily: 'sans-serif' }}>IMG</span>
      </div>
    </div>
  );
}

/**
 * Quote variant — Image top, centered quote text bottom.
 * Clean, save-friendly with prominent quote.
 */
function QuoteVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const neutral = tokenStr(tokens.color, 'neutral50', '#f5f5f5');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      <ImageSection tokens={tokens} imageUrl={content.imageUrl} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
        <span style={{ fontSize: 64, color: primary, opacity: 0.15, fontFamily: 'serif', lineHeight: 1 }}>&ldquo;</span>
        <Headline tokens={tokens} text={content.headline} fontSize={36} color={primary} align="center" />
        {content.body && (
          <span style={{ fontSize: 18, color: '#666666', marginTop: '20px', textAlign: 'center', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={80} />
    </div>
  );
}

/**
 * Tip variant — Image top, tip content bottom with accent badge.
 * Clear visual hierarchy for pin scanning.
 */
function TipVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');
  const spacing = tokenNum(tokens.spacing, 'md', 16);

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      <ImageSection tokens={tokens} imageUrl={content.imageUrl} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: `${spacing * 3}px ${spacing * 4}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '32px', borderRadius: '6px', backgroundColor: secondary, marginBottom: `${spacing * 2}px` }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>TIP</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={34} color={primary} />
        {content.body && (
          <span style={{ fontSize: 18, color: '#555555', marginTop: `${spacing}px`, lineHeight: 1.5, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
        {content.ctaText && (
          <div style={{ display: 'flex', marginTop: `${spacing * 2}px` }}>
            <CtaBadge tokens={tokens} text={content.ctaText} fontSize={14} />
          </div>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={80} />
    </div>
  );
}

/**
 * Statistic variant — Image top, bold stat number bottom.
 * Visual impact with large centered number.
 */
function StatisticVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      <ImageSection tokens={tokens} imageUrl={content.imageUrl} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
        <span style={{ fontSize: 120, fontWeight: 900, color: secondary, lineHeight: 1, letterSpacing: '-0.04em', fontFamily: 'sans-serif' }}>
          {content.stat ?? '0'}
        </span>
        <div style={{ display: 'flex', width: '60px', height: '3px', backgroundColor: primary, margin: '24px 0' }} />
        <Headline tokens={tokens} text={content.headline} fontSize={28} color={primary} align="center" />
        {content.body && (
          <span style={{ fontSize: 16, color: '#666666', marginTop: '14px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={80} />
    </div>
  );
}

/**
 * Question variant — Image top, question content bottom.
 * Engaging question with branded accent.
 */
function QuestionVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      <ImageSection tokens={tokens} imageUrl={content.imageUrl} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '40px 60px' }}>
        <div style={{ display: 'flex', width: '44px', height: '44px', borderRadius: '22px', backgroundColor: secondary, alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: 22, color: '#ffffff', fontWeight: 700 }}>?</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={34} color={primary} />
        {content.body && (
          <span style={{ fontSize: 18, color: '#555555', marginTop: '14px', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={80} />
    </div>
  );
}

/**
 * Announcement variant — Image top, banner + detail bottom.
 * Structured announcement with call-to-action.
 */
function AnnouncementVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      <ImageSection tokens={tokens} imageUrl={content.imageUrl} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '40px 60px' }}>
        <div style={{ display: 'flex', backgroundColor: secondary, borderRadius: '6px', padding: '6px 16px', marginBottom: '16px', alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>Announcement</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={32} color={primary} />
        {content.body && (
          <span style={{ fontSize: 17, color: '#444444', marginTop: '14px', lineHeight: 1.6, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
        {content.stat && (
          <span style={{ fontSize: 14, color: primary, marginTop: '10px', fontWeight: 600, fontFamily: 'sans-serif' }}>
            {content.stat}
          </span>
        )}
        {content.ctaText && (
          <div style={{ display: 'flex', marginTop: '20px' }}>
            <CtaBadge tokens={tokens} text={content.ctaText} fontSize={14} />
          </div>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={80} />
    </div>
  );
}

/**
 * PinterestPin — Main template component for 1000x1500.
 * Delegates to variant sub-components based on content.variant.
 */
export function PinterestPin({ tokens, content }: SocialTemplateProps): React.ReactElement {
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

/** Platform spec for Pinterest Pin */
export const PINTEREST_PIN_SPEC = {
  platform: 'pinterest',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
