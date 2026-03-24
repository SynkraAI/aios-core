/**
 * Instagram Story Template — 1080x1920
 *
 * 5 layout variants: quote, tip, statistic, question, announcement.
 * Each variant produces a meaningfully different visual composition.
 *
 * SAFE ZONE: 108px padding from all edges (10% of dimensions).
 * Content outside this zone may be clipped by Instagram platform UI.
 * Implemented as a flex container with padding.
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

const WIDTH = 1080;
const HEIGHT = 1920;
/** Safe zone padding — 10% from each edge. At 1080x1920: 108px all sides. */
const SAFE_ZONE = 108;

/**
 * SafeZoneWrapper — Enforces the 108px safe zone padding.
 * All story content must be inside this wrapper.
 */
function SafeZoneWrapper({
  children,
  backgroundColor,
}: {
  children: React.ReactNode;
  backgroundColor: string;
}): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: `${SAFE_ZONE}px` }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Quote variant — Full-screen dark background, centered quote with decorative marks.
 * Vertical composition leverages story height for dramatic whitespace.
 */
function QuoteVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <SafeZoneWrapper backgroundColor={primary}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Opening quote mark */}
        <span style={{ fontSize: 140, color: secondary, opacity: 0.6, fontFamily: 'serif', lineHeight: 1 }}>&ldquo;</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-20px', padding: '0 20px' }}>
          <Headline tokens={tokens} text={content.headline} fontSize={46} color="#ffffff" align="center" />
        </div>
        {content.body && (
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', marginTop: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
        {/* Closing quote mark */}
        <span style={{ fontSize: 140, color: secondary, opacity: 0.6, fontFamily: 'serif', lineHeight: 1, marginTop: '20px' }}>&rdquo;</span>
      </div>
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={50} />
    </SafeZoneWrapper>
  );
}

/**
 * Tip variant — Top-aligned tip card with step-by-step visual flow.
 * Uses the vertical space for a clean reading progression.
 */
function TipVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <SafeZoneWrapper backgroundColor="#ffffff">
      {/* Top accent strip */}
      <div style={{ display: 'flex', width: '100%', height: '6px', backgroundColor: secondary, borderRadius: '3px' }} />
      {/* Tip icon area */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '40px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', width: '56px', height: '56px', borderRadius: '14px', backgroundColor: primary, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', fontFamily: 'sans-serif' }}>!</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '16px', fontFamily: 'sans-serif' }}>Quick Tip</span>
      </div>
      {/* Content */}
      <Headline tokens={tokens} text={content.headline} fontSize={44} color={primary} />
      {content.body && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '32px' }}>
          <span style={{ fontSize: 24, color: '#555555', lineHeight: 1.6, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        </div>
      )}
      {/* Spacer + CTA at bottom */}
      <div style={{ display: 'flex', flex: 1 }} />
      {content.ctaText && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <CtaBadge tokens={tokens} text={content.ctaText} fontSize={18} />
        </div>
      )}
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={50} />
    </SafeZoneWrapper>
  );
}

/**
 * Statistic variant — Giant stat number in the center with radial glow effect.
 * Maximum visual impact with the tall story format.
 */
function StatisticVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <SafeZoneWrapper backgroundColor={primary}>
      {/* Top spacer */}
      <div style={{ display: 'flex', flex: 1 }} />
      {/* Stat area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Glow ring behind stat */}
        <div style={{ display: 'flex', width: '320px', height: '320px', borderRadius: '160px', border: `3px solid ${secondary}`, alignItems: 'center', justifyContent: 'center', opacity: 0.3, position: 'absolute' }} />
        <span style={{ fontSize: 180, fontWeight: 900, color: secondary, lineHeight: 1, fontFamily: 'sans-serif' }}>
          {content.stat ?? '0'}
        </span>
      </div>
      {/* Context text */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '48px' }}>
        <div style={{ display: 'flex', width: '60px', height: '3px', backgroundColor: secondary, marginBottom: '32px' }} />
        <Headline tokens={tokens} text={content.headline} fontSize={36} color="#ffffff" align="center" />
        {content.body && (
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', marginTop: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      {/* Bottom spacer */}
      <div style={{ display: 'flex', flex: 1 }} />
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={50} />
    </SafeZoneWrapper>
  );
}

/**
 * Question variant — Centered question with swipe-up prompt at bottom.
 * Full-screen engagement layout optimized for stories.
 */
function QuestionVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <SafeZoneWrapper backgroundColor={primary}>
      {/* Top spacer */}
      <div style={{ display: 'flex', flex: 1 }} />
      {/* Question bubble */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', width: '100px', height: '100px', borderRadius: '50px', backgroundColor: secondary, alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: 56, fontWeight: 900, color: '#ffffff', fontFamily: 'sans-serif' }}>?</span>
        </div>
        <Headline tokens={tokens} text={content.headline} fontSize={42} color="#ffffff" align="center" />
        {content.body && (
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)', marginTop: '28px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
      </div>
      {/* Bottom spacer */}
      <div style={{ display: 'flex', flex: 1 }} />
      {/* Swipe-up CTA area */}
      {content.ctaText && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: 24, color: secondary, marginBottom: '8px', fontFamily: 'sans-serif' }}>^</span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>{content.ctaText}</span>
        </div>
      )}
      <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={50} />
    </SafeZoneWrapper>
  );
}

/**
 * Announcement variant — Top banner with gradient, content card below.
 * Uses story height for a long-form announcement format.
 */
function AnnouncementVariant({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    <SafeZoneWrapper backgroundColor="#f5f5f5">
      {/* Announcement badge */}
      <div style={{ display: 'flex', alignSelf: 'flex-start', backgroundColor: secondary, borderRadius: '8px', padding: '8px 20px', marginBottom: '32px' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'sans-serif' }}>Announcement</span>
      </div>
      {/* Main content card */}
      <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: primary, borderRadius: '24px', padding: '48px', flex: 1 }}>
        <Headline tokens={tokens} text={content.headline} fontSize={44} color="#ffffff" />
        {content.body && (
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', marginTop: '32px', lineHeight: 1.6, fontFamily: 'sans-serif' }}>
            {content.body}
          </span>
        )}
        {content.stat && (
          <div style={{ display: 'flex', marginTop: '32px', padding: '20px 28px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: secondary, fontFamily: 'sans-serif' }}>{content.stat}</span>
          </div>
        )}
        {/* Spacer */}
        <div style={{ display: 'flex', flex: 1 }} />
        {content.ctaText && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CtaBadge tokens={tokens} text={content.ctaText} backgroundColor={secondary} fontSize={18} />
          </div>
        )}
      </div>
      {/* Brand bar at the bottom */}
      <div style={{ display: 'flex', marginTop: '24px' }}>
        <BrandBar tokens={tokens} logoUrl={content.logoUrl} height={50} />
      </div>
    </SafeZoneWrapper>
  );
}

/**
 * InstagramStory — Main template component for 1080x1920.
 * Delegates to variant sub-components based on content.variant.
 * All content respects the 108px safe zone.
 */
export function InstagramStory({ tokens, content }: SocialTemplateProps): React.ReactElement {
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

/** Platform spec for Instagram Story */
export const INSTAGRAM_STORY_SPEC = {
  platform: 'instagram',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
