/**
 * @brand-system/qa-tools — Automated QA Check Utilities
 *
 * Provides CLI-accessible tools for automated quality checks
 * used in the Brand System Service QA pipeline (BSS-8.2).
 *
 * Tools:
 * - check-contrast: WCAG 2.1 color contrast ratio validation
 * - check-dimensions: Image dimension validation against platform specs
 */

// Types
export type {
  WCAGLevel,
  ContrastResult,
  DimensionResult,
  SupportedImageFormat,
} from './types';

// Contrast checking
export {
  checkContrast,
  parseHex,
  relativeLuminance,
  contrastRatio,
  getWCAGLevel,
} from './check-contrast';

// Dimension checking
export {
  checkDimensions,
  parseDimensions,
  readImageDimensions,
} from './check-dimensions';
