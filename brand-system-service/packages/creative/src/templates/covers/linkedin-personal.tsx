/**
 * LinkedIn Personal Cover Template — 1584x396
 *
 * Single composition: gradient background (primary to secondary),
 * brand logo centered, optional tagline using heading font.
 *
 * CONSTRAINT: Flexbox only — no CSS Grid (ADR-005 / Satori).
 * CONSTRAINT: Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { SocialTemplateProps } from '../../types';
import { tokenStr } from '../../types';
import { Headline } from '../shared/headline';

const WIDTH = 1584;
const HEIGHT = 396;

/**
 * LinkedInPersonalCover — Wide banner with gradient and centered branding.
 * No variant system — single brand treatment.
 */
export function LinkedInPersonalCover({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');
  const secondary = tokenStr(tokens.color, 'secondary', '#e94560');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'column', width: `${WIDTH}px`, height: `${HEIGHT}px`, background: `linear-gradient(135deg, ${primary}, ${secondary})`, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <img src={content.logoUrl} alt="Brand logo" width={80} height={80} style={{ objectFit: 'contain' }} />
        {content.headline && (
          <div style={{ display: 'flex', marginLeft: '32px' }}>
            <Headline tokens={tokens} text={content.headline} fontSize={36} color="#ffffff" />
          </div>
        )}
      </div>
    </div>
  );
}

/** Platform spec for LinkedIn Personal Cover */
export const LINKEDIN_PERSONAL_COVER_SPEC = {
  platform: 'linkedin',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
