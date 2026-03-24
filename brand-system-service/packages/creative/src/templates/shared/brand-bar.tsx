/**
 * BrandBar — Shared sub-component for social media templates.
 *
 * Renders a brand logo alongside a color strip at the bottom of templates.
 * Uses flexbox only (no CSS Grid — ADR-005 / Satori constraint).
 * Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { TokenSet } from '../../types';
import { tokenStr } from '../../types';

export interface BrandBarProps {
  readonly tokens: TokenSet;
  readonly logoUrl: string;
  /** Height of the brand bar in pixels (default: 60) */
  readonly height?: number;
}

/**
 * BrandBar component — logo + brand color strip.
 * Placed at the bottom of social media templates.
 */
export function BrandBar({ tokens, logoUrl, height = 60 }: BrandBarProps): React.ReactElement {
  const primaryColor = tokenStr(tokens.color, 'primary', '#333333');
  const secondaryColor = tokenStr(tokens.color, 'secondary', '#666666');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: `${height}px`,
        backgroundColor: '#ffffff',
      }}
    >
      {/* Brand color strip */}
      <div
        style={{
          display: 'flex',
          width: '6px',
          height: '100%',
          background: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})`,
        }}
      />
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 16px',
        }}
      >
        <img
          src={logoUrl}
          alt="Brand logo"
          width={height - 20}
          height={height - 20}
          style={{
            objectFit: 'contain',
          }}
        />
      </div>
    </div>
  );
}
