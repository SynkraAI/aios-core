/**
 * LinkedIn Company Cover Template — 1128x191
 *
 * Very short banner: just logo + tagline centered.
 * Single composition: primary color background, centered content.
 *
 * CONSTRAINT: Flexbox only — no CSS Grid (ADR-005 / Satori).
 * CONSTRAINT: Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { SocialTemplateProps } from '../../types';
import { tokenStr } from '../../types';

const WIDTH = 1128;
const HEIGHT = 191;

/**
 * LinkedInCompanyCover — Narrow banner with logo and tagline.
 * No variant system — single brand treatment.
 */
export function LinkedInCompanyCover({ tokens, content }: SocialTemplateProps): React.ReactElement {
  const primary = tokenStr(tokens.color, 'primary', '#1a1a2e');

  return (
    // CONSTRAINT: Satori flexbox-only
    <div style={{ display: 'flex', flexDirection: 'row', width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: primary, alignItems: 'center', justifyContent: 'center' }}>
      <img src={content.logoUrl} alt="Brand logo" width={60} height={60} style={{ objectFit: 'contain' }} />
      {content.headline && (
        <span style={{ fontSize: 24, fontWeight: 600, color: '#ffffff', marginLeft: '24px', fontFamily: 'sans-serif' }}>
          {content.headline}
        </span>
      )}
    </div>
  );
}

/** Platform spec for LinkedIn Company Cover */
export const LINKEDIN_COMPANY_COVER_SPEC = {
  platform: 'linkedin',
  width: WIDTH,
  height: HEIGHT,
  format: 'png' as const,
} as const;
