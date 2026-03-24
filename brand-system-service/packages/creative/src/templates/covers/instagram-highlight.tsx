/**
 * Instagram Highlight Cover Template — 1080x1920
 *
 * Single composition: primary color background, centered icon area (110x110),
 * brand logo positioned within icon area, optional tagline.
 *
 * CONSTRAINT: Flexbox only — no CSS Grid (ADR-005 / Satori).
 * CONSTRAINT: Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { SocialTemplateProps } from '../../types';
import { tokenStr } from '../../types';
import { Headline } from '../shared/headline';

const WIDTH = 1080;
const HEIGHT = 1920;
const ICON_SIZE = 110;

/**
 * InstagramHighlight — Full-screen cover with centered icon area.
 * No variant system — single brand treatment.
 */
export function InstagramHighlight({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary, alignItems: 'center', justifyContent: 'center' }}>
      {/* Icon area — 110x110 centered */}
      <div style={{ display: 'flex', width: `${ICON_SIZE}px`, height: `${ICON_SIZE}px`, borderRadius: `${ICON_SIZE / 2}px`, backgroundColor: secondary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src={content.logoUrl} alt="Brand logo" width={80} height={80} style={{ objectFit: 'contain' }} />
      </div>
      {/* Optional tagline */}
      {content.headline && (
        <div style={{ display: 'flex', marginTop: '24px', padding: '0 120px' }}>
          <Headline tokens={tokens} text={content.headline} fontSize={28} color="#ffffff" align="center" />
        </div>
      )}
    </div>
  );
}

/** Platform spec for Instagram Highlight Cover */
export const INSTAGRAM_HIGHLIGHT_SPEC = {
  platform: 'instagram',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
