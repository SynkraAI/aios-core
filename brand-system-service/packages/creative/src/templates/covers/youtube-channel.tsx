/**
 * YouTube Channel Cover Template — 2560x1440
 *
 * Safe area: 1546x423 centered (507px padding LR, 508px padding TB).
 * Brand logo and core text must stay within the safe zone.
 *
 * Single composition: primary color background, gradient accent,
 * logo + tagline within safe area.
 *
 * CONSTRAINT: Flexbox only — no CSS Grid (ADR-005 / Satori).
 * CONSTRAINT: Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { SocialTemplateProps } from '../../types';
import { tokenStr } from '../../types';
import { Headline } from '../shared/headline';

const WIDTH = 2560;
const HEIGHT = 1440;

/** Safe area padding: 507px left/right, 508px top/bottom */
const SAFE_PADDING_H = 507;
const SAFE_PADDING_V = 508;

/**
 * YouTubeChannelCover — Large banner with safe area constraint.
 * No variant system — single brand treatment.
 */
export function YouTubeChannelCover({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary }}>
      {/* Safe area wrapper — 1546x423 centered */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `${SAFE_PADDING_V}px ${SAFE_PADDING_H}px` }}>
        <img src={content.logoUrl} alt="Brand logo" width={120} height={120} style={{ objectFit: 'contain' }} />
        {content.headline && (
          <div style={{ display: 'flex', marginTop: '32px' }}>
            <Headline tokens={tokens} text={content.headline} fontSize={48} color="#ffffff" align="center" />
          </div>
        )}
        {/* Accent line */}
        <div style={{ display: 'flex', width: '120px', height: '4px', backgroundColor: secondary, marginTop: '24px' }} />
      </div>
    </div>
  );
}

/** Platform spec for YouTube Channel Cover */
export const YOUTUBE_CHANNEL_COVER_SPEC = {
  platform: 'youtube',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
