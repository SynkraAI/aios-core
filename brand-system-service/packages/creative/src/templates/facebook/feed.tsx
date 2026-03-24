/**
 * Facebook Feed Template — 1200x630
 *
 * 5 layout variants: quote, tip, statistic, question, announcement.
 * Each variant produces a meaningfully different visual composition.
 * Landscape orientation (1.9:1) suits wide, horizontally-balanced layouts.
 *
 * CONSTRAINT: Flexbox only — no CSS Grid (ADR-005 / Satori).
 * CONSTRAINT: Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { SocialTemplateProps } from '../../types';
import { tokenStr } from '../../types';
import { BrandBar } from '../shared/brand-bar';
import { Headline } from '../shared/headline';
import { CtaBadge } from '../shared/cta-badge';

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Quote variant — Horizontal split: color block left, quote text right.
 * Landscape layout allows side-by-side composition.
 */
function QuoteVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
        {/* Left color block with quote mark */}
        <div style={{ display: 'flex', width: '280px', backgroundColor: primary, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 160, color: secondary, opacity: 0.5, fontFamily: 'serif', lineHeight: 1 }}>&ldquo;</span>
        </div>
        {/* Right content area */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '48px 60px' }}>
          <Headline tokens={tokens} text={content.headline} fontSize={36} color={primary} />
          {content.body && (
            <span style={{ fontSize: 18, color: '#666666', marginTop: '16px', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
        </div>
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={50} />
    </div>
  );
}

/**
 * Tip variant — Icon left-aligned, headline + body flowing right.
 * Compact horizontal reading flow suited for Facebook feed scanning.
 */
function TipVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      {/* Top accent bar */}
      <div style={{ display: 'flex', width: '100%', height: '6px', backgroundColor: primary }} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', padding: '40px 48px', alignItems: 'center' }}>
        {/* Tip icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '40px' }}>
          <div style={{ display: 'flex', width: '72px', height: '72px', borderRadius: '18px', backgroundColor: secondary, alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', fontFamily: 'sans-serif' }}>!</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: primary, textTransform: 'uppercase', marginTop: '8px', fontFamily: 'sans-serif' }}>Tip</span>
        </div>
        {/* Content */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          <Headline tokens={tokens} text={content.headline} fontSize={32} color={primary} />
          {content.body && (
            <span style={{ fontSize: 18, color: '#555555', marginTop: '12px', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
        </div>
        {/* CTA on right */}
        {content.ctaText && (
          <div style={{ display: 'flex', marginLeft: '32px' }}>
            <CtaBadge tokens={tokens} text={content.ctaText} fontSize={14} />
          </div>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={50} />
    </div>
  );
}

/**
 * Statistic variant — Large number left, context text right.
 * Horizontal layout balances the stat with explanatory text.
 */
function StatisticVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        {/* Left — stat */}
        <div style={{ display: 'flex', width: '480px', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 140, fontWeight: 900, color: secondary, lineHeight: 1, fontFamily: 'sans-serif' }}>
            {content.stat ?? '0'}
          </span>
        </div>
        {/* Divider */}
        <div style={{ display: 'flex', width: '3px', height: '60%', backgroundColor: 'rgba(255,255,255,0.2)' }} />
        {/* Right — context */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '0 48px' }}>
          <Headline tokens={tokens} text={content.headline} fontSize={30} color="#ffffff" />
          {content.body && (
            <span style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginTop: '12px', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
        </div>
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={50} />
    </div>
  );
}

/**
 * Question variant — Centered question with question mark overlay.
 * Compact landscape layout focused on a single engaging question.
 */
function QuestionVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
        {/* Watermark */}
        <div style={{ display: 'flex', position: 'absolute', right: '40px', top: '-20px', opacity: 0.06 }}>
          <span style={{ fontSize: 400, fontWeight: 900, color: '#ffffff', fontFamily: 'sans-serif' }}>?</span>
        </div>
        {/* Question badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '160px' }}>
          <div style={{ display: 'flex', width: '64px', height: '64px', borderRadius: '32px', backgroundColor: secondary, alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', fontFamily: 'sans-serif' }}>?</span>
          </div>
        </div>
        {/* Content */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '0 48px 0 0' }}>
          <Headline tokens={tokens} text={content.headline} fontSize={34} color="#ffffff" />
          {content.body && (
            <span style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginTop: '12px', fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
        </div>
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={50} />
    </div>
  );
}

/**
 * Announcement variant — Full-width banner with inline details.
 * Uses horizontal space for a clean, newspaper-headline feel.
 */
function AnnouncementVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#ffffff' }}>
      {/* Banner strip */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: primary, padding: '16px 48px', height: '56px' }}>
        <div style={{ display: 'flex', backgroundColor: secondary, borderRadius: '4px', padding: '4px 14px', marginRight: '16px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>Announcement</span>
        </div>
        {content.stat && (
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: 'sans-serif' }}>{content.stat}</span>
        )}
      </div>
      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', padding: '32px 48px' }}>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
          <Headline tokens={tokens} text={content.headline} fontSize={36} color={primary} />
          {content.body && (
            <span style={{ fontSize: 18, color: '#555555', marginTop: '16px', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
              {content.body}
            </span>
          )}
        </div>
        {/* CTA column */}
        {content.ctaText && (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '40px' }}>
            <CtaBadge tokens={tokens} text={content.ctaText} fontSize={15} />
          </div>
        )}
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={50} />
    </div>
  );
}

/**
 * FacebookFeed — Main template component for 1200x630.
 * Delegates to variant sub-components based on content.variant.
 */
export function FacebookFeed({ tokens, content }: SocialTemplateProps): React.ReactElement {
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

/** Platform spec for Facebook Feed */
export const FACEBOOK_FEED_SPEC = {
  platform: 'facebook',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
