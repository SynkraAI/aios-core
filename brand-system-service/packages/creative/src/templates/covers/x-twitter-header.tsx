/**
 * X/Twitter Header Template — 1500x500
 *
 * Single composition: gradient background, brand logo centered in safe area,
 * optional tagline text using heading font.
 *
 * CONSTRAINT: Flexbox only — no CSS Grid (ADR-005 / Satori).
 * CONSTRAINT: Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { SocialTemplateProps } from '../../types';
import { tokenStr } from '../../types';
import { Headline } from '../shared/headline';

const WIDTH = 1500;
const HEIGHT = 500;

/**
 * XTwitterHeader — Wide header with gradient and centered branding.
 * No variant system — single brand treatment.
 */
export function XTwitterHeader({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, background: `linear-gradient(135deg, ${primary}, ${secondary})`, alignItems: 'center', justifyContent: 'center' }}>
      <img src={content.logoUrl} alt="Brand logo" width={100} height={100} style={{ objectFit: 'contain' }} />
      {content.headline && (
        <div style={{ display: 'flex', marginTop: '24px' }}>
          <Headline tokens={tokens} text={content.headline} fontSize={32} color="#ffffff" align="center" />
        </div>
      )}
    </div>
  );
}

/** Platform spec for X/Twitter Header */
export const X_TWITTER_HEADER_SPEC = {
  platform: 'x-twitter',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
