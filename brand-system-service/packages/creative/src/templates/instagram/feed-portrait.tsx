/**
 * Instagram Feed Portrait Template — 1080x1350
 *
 * 5 layout variants: quote, tip, statistic, question, announcement.
 * Each variant produces a meaningfully different visual composition.
 * Taller aspect ratio (4:5) allows for more vertical content stacking.
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
const HEIGHT = 1350;

/**
 * Quote variant — Vertical split: large quote top, attribution bottom.
 * Leverages the taller canvas for dramatic vertical spacing.
 */
function QuoteVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#f8f8f8' }}>
      {/* Top colored section with quote */}
      <div style={{ display: 'flex', flex: 2, flexDirection: 'column', backgroundColor: primary, padding: '80px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '24px' }}>
          <div style={{ display: 'flex', width: '60px', height: '4px', backgroundColor: secondary }} />
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={48} color="#ffffff" />
      </div>
      {/* Bottom section with attribution */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '60px 80px', justifyContent: 'center' }}>
        {content.body && (
          <span style={{ fontSize: 22, color: '#555555', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
        {content.ctaText && (
          <div style={{ display: 'flex', marginTop: '32px' }}>
            <CtaBadge tokens={tokens} text={content.ctaText} />
          </div>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} />
    </div>
  );
}

/**
 * Tip variant — Card-style with numbered steps stacked vertically.
 * Uses the height for a clear top-to-bottom reading flow.
 */
function TipVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');
  const spacing = tokenNum(tokens.spacing, 'md', 16);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      {/* Header area */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: `${spacing * 4}px`, paddingBottom: `${spacing * 2}px` }}>
        {/* Pill label */}
        <div style={{ display: 'flex', alignSelf: 'flex-start', backgroundColor: secondary, borderRadius: '20px', padding: '6px 18px', marginBottom: `${spacing * 2}px` }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>Pro Tip</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={44} color={primary} />
      </div>
      {/* Vertical divider line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `0 ${spacing * 4}px` }}>
        <div style={{ display: 'flex', flex: 1, height: '2px', backgroundColor: '#eeeeee' }} />
      </div>
      {/* Body content area */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: `${spacing * 3}px ${spacing * 4}px`, justifyContent: 'center' }}>
        {content.body && (
          <span style={{ fontSize: 24, color: '#444444', lineHeight: 1.6, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      {content.ctaText && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: `${spacing * 2}px` }}>
          <CtaBadge tokens={tokens} text={content.ctaText} fontSize={18} />
        </div>
      )}
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} />
    </div>
  );
}

/**
 * Statistic variant — Stat dominates the upper half, context fills lower.
 * Two-zone vertical split maximizes the stat's visual impact.
 */
function StatisticVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary }}>
      {/* Upper zone — stat */}
      <div style={{ display: 'flex', flex: 3, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <span style={{ fontSize: 200, fontWeight: 900, color: secondary, lineHeight: 1, fontFamily: 'sans-serif' }}>
          {content.stat ?? '0'}
        </span>
      </div>
      {/* Lower zone — context */}
      <div style={{ display: 'flex', flex: 2, flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.08)', padding: '48px 80px', justifyContent: 'center' }}>
        <Headline tokens={tokens} text={content.headline} fontSize={36} color="#ffffff" align="center" />
        {content.body && (
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', marginTop: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} />
    </div>
  );
}

/**
 * Question variant — Question anchored at bottom third, open space above.
 * Creates visual tension with negative space.
 */
function QuestionVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      {/* Open space with accent circle */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', width: '180px', height: '180px', borderRadius: '90px', border: `6px solid ${secondary}`, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 96, fontWeight: 900, color: primary, fontFamily: 'sans-serif' }}>?</span>
        </div>
      </div>
      {/* Question text at bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '60px 80px', backgroundColor: primary }}>
        <Headline tokens={tokens} text={content.headline} fontSize={40} color="#ffffff" align="center" />
        {content.body && (
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', marginTop: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} />
    </div>
  );
}

/**
 * Announcement variant — Full-width banner top, details card below.
 * Uses height for a newspaper-style above-the-fold layout.
 */
function AnnouncementVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#f0f0f0' }}>
      {/* Banner */}
      <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: primary, padding: '60px 80px', justifyContent: 'flex-end', height: '480px' }}>
        <div style={{ display: 'flex', backgroundColor: secondary, borderRadius: '6px', padding: '6px 16px', alignSelf: 'flex-start', marginBottom: '20px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'sans-serif' }}>New</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={46} color="#ffffff" />
      </div>
      {/* Detail card */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '48px 80px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {content.body && (
            <span style={{ fontSize: 22, color: '#333333', lineHeight: 1.6, fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
          {content.stat && (
            <div style={{ display: 'flex', marginTop: '24px', padding: '16px 24px', backgroundColor: '#ffffff', borderRadius: '12px', border: `2px solid ${primary}` }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: primary, fontFamily: 'sans-serif' }}>{content.stat}</span>
            </div>
          )}
        </div>
        {content.ctaText && (
          <div style={{ display: 'flex', alignSelf: 'flex-start' }}>
            <CtaBadge tokens={tokens} text={content.ctaText} fontSize={18} />
          </div>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} />
    </div>
  );
}

/**
 * InstagramFeedPortrait — Main template component for 1080x1350.
 * Delegates to variant sub-components based on content.variant.
 */
export function InstagramFeedPortrait({ tokens, content }: SocialTemplateProps): React.ReactElement {
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

/** Platform spec for Instagram Feed Portrait */
export const INSTAGRAM_FEED_PORTRAIT_SPEC = {
  platform: 'instagram',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
