/**
 * Circle Design System - Design Tokens
 * Extracted from https://circle.so/br
 */

import { colors } from './colors';
import { typography, typographyPresets } from './typography';
import { spacing, container, breakpoints } from './spacing';
import { shadows, backdrop, opacity } from './shadows';
import { borders } from './borders';

export { colors } from './colors';
export type { Colors } from './colors';

export { typography, typographyPresets } from './typography';
export type { Typography, TypographyPresets } from './typography';

export { spacing, container, breakpoints } from './spacing';
export type { Spacing, Container, Breakpoints } from './spacing';

export { shadows, backdrop, opacity } from './shadows';
export type { Shadows, Backdrop, Opacity } from './shadows';

export { borders } from './borders';
export type { Borders } from './borders';

// Re-export all tokens as single object for convenience
export const tokens = {
  colors,
  typography,
  typographyPresets,
  spacing,
  container,
  breakpoints,
  shadows,
  backdrop,
  opacity,
  borders,
} as const;

export type Tokens = typeof tokens;
