/**
 * LinkedIn Post Template — 1200x644
 *
 * 5 layout variants: quote, tip, statistic, question, announcement.
 * Professional tone: clean, minimal whitespace, brand credibility signals,
 * muted accent palette, professional typography weight choices.
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
const HEIGHT = 644;

/**
 * Quote variant — Centered quote with subtle attribution.
 * Professional: restrained palette, serif quotation mark accent, clean alignment.
 */
function QuoteVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const neutral = tokenStr(tokens.color, 'neutral50', '#f5f5f5');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 80px' }}>
        <span style={{ fontSize: 80, color: neutral, opacity: 0.2, fontFamily: 'serif', lineHeight: 1 }}>&ldquo;</span>
        <Headline tokens={tokens} text={content.headline} fontSize={36} color={neutral} align="center" />
        {content.body && (
          <span style={{ fontSize: 16, color: neutral, opacity: 0.65, marginTop: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={52} />
    </div>
  );
}

/**
 * Tip variant — Professional callout with numbered tip badge.
 * Clean white background, accent bar at top, structured layout.
 */
function TipVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');
  const spacing = tokenNum(tokens.spacing, 'md', 16);

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', width: '100%', height: '6px', backgroundColor: primary }} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', padding: `${spacing * 3}px` }}>
        {/* Left: tip badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: `${spacing * 2}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '12px', backgroundColor: secondary }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>TIP</span>
          </div>
        </div>
        {/* Right: content */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
          <Headline tokens={tokens} text={content.headline} fontSize={34} color={primary} />
          {content.body && (
            <span style={{ fontSize: 18, color: '#555555', marginTop: `${spacing}px`, lineHeight: 1.5, fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
        </div>
      </div>
      {content.ctaText && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', padding: `0 ${spacing * 3}px ${spacing * 2}px` }}>
          <CtaBadge tokens={tokens} text={content.ctaText} fontSize={14} />
        </div>
      )}
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={52} />
    </div>
  );
}

/**
 * Statistic variant — Bold stat number with professional context.
 * Centered stat, divider, headline beneath.
 */
function StatisticVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 80px' }}>
        <span style={{ fontSize: 100, fontWeight: 900, color: secondary, lineHeight: 1, letterSpacing: '-0.04em', fontFamily: 'sans-serif' }}>
          {content.stat ?? '0'}
        </span>
        <div style={{ display: 'flex', width: '60px', height: '3px', backgroundColor: primary, margin: '24px 0' }} />
        <Headline tokens={tokens} text={content.headline} fontSize={28} color={primary} align="center" />
        {content.body && (
          <span style={{ fontSize: 16, color: '#666666', marginTop: '12px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={52} />
    </div>
  );
}

/**
 * Question variant — Thought-provoking question, professional feel.
 * Dark background, question mark accent, headline as question.
 */
function QuestionVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', position: 'relative' }}>
        <div style={{ display: 'flex', position: 'absolute', right: '-20px', top: '-30px', opacity: 0.06 }}>
          <span style={{ fontSize: 400, fontWeight: 900, color: '#ffffff', fontFamily: 'sans-serif' }}>?</span>
        </div>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '48px 80px' }}>
          <div style={{ display: 'flex', width: '40px', height: '40px', borderRadius: '20px', backgroundColor: secondary, alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: 20, color: '#ffffff', fontWeight: 700 }}>?</span>
          </div>
          <Headline tokens={tokens} text={content.headline} fontSize={36} color="#ffffff" />
          {content.body && (
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', marginTop: '12px', fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
        </div>
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={52} />
    </div>
  );
}

/**
 * Announcement variant — Professional banner with structured detail block.
 * Top banner area, detail section below. Authoritative.
 */
function AnnouncementVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', backgroundColor: primary, padding: '40px 60px', height: '340px' }}>
        <div style={{ display: 'flex', backgroundColor: secondary, borderRadius: '6px', padding: '6px 16px', marginBottom: '16px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>Announcement</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={34} color="#ffffff" />
      </div>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '32px 60px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {content.body && (
            <span style={{ fontSize: 18, color: '#333333', lineHeight: 1.6, fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
          {content.stat && (
            <span style={{ fontSize: 15, color: primary, marginTop: '12px', fontWeight: 600, fontFamily: 'sans-serif' }}>
              {content.stat}
            </span>
          )}
        </div>
        {content.ctaText && (
          <div style={{ display: 'flex' }}>
            <CtaBadge tokens={tokens} text={content.ctaText} fontSize={14} />
          </div>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={52} />
    </div>
  );
}

/**
 * LinkedInPost — Main template component for 1200x644.
 * Delegates to variant sub-components based on content.variant.
 */
export function LinkedInPost({ tokens, content }: SocialTemplateProps): React.ReactElement {
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

/** Platform spec for LinkedIn Post */
export const LINKEDIN_POST_SPEC = {
  platform: 'linkedin',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
