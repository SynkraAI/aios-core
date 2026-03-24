/**
 * CtaBadge — Shared sub-component for social media templates.
 *
 * Renders a rounded call-to-action badge with brand-colored background.
 * Uses flexbox only (no CSS Grid — ADR-005 / Satori constraint).
 * Inline styles only — no CSS classes, no Tailwind, no CSS modules.
 */

import React from 'react';
import type { TokenSet } from '../../types';
import { tokenStr } from '../../types';

export interface CtaBadgeProps {
  readonly tokens: TokenSet;
  readonly text: string;
  /** Override background color */
  readonly backgroundColor?: string;
  /** Override text color */
  readonly textColor?: string;
  /** Font size in pixels (default: 16) */
  readonly fontSize?: number;
}

/**
 * CtaBadge component — rounded CTA text badge.
 */
export function CtaBadge({
  tokens,
  text,
  backgroundColor,
  textColor,
  fontSize = 16,
}: CtaBadgeProps): React.ReactElement {
  const bgColor = backgroundColor ?? tokenStr(tokens.color, 'primary', '#333333');
  const fgColor = textColor ?? '#ffffff';

  const bodyGroup = tokens.typography
    ? (tokens.typography.body as Record<string, unknown>)
    : undefined;

  const fontFamily = bodyGroup
    ? tokenStr(bodyGroup as import('../../types').TokenGroup, 'fontFamily', 'sans-serif')
    : 'sans-serif';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        borderRadius: '999px',
        padding: `${Math.round(fontSize * 0.625)}px ${Math.round(fontSize * 1.5)}px`,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize,
          fontWeight: 600,
          color: fgColor,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {text}
      </span>
    </div>
  );
}
