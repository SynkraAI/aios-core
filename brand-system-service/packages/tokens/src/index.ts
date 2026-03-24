/**
 * @bss/tokens - Design Token Engine
 *
 * Handles W3C DTCG token validation, Style Dictionary transforms,
 * and CSS Custom Properties generation for the Brand System Service.
 *
 * Key responsibilities:
 * - Token schema validation (W3C DTCG format)
 * - Color palette generation with WCAG contrast checking
 * - Typography scale with CSS clamp for fluid sizing
 * - Grid and spacing system (8px base grid)
 * - Style Dictionary build pipeline orchestration
 */

export { TokenEngine, type TokenBuildOptions } from './token-engine';
export { TokenValidator } from './validator';
export { GridEngine, type GridConfig, type SpacingScale, type SpacingEntry } from './grid-engine';
export {
  TypographyEngine,
  DEFAULT_FONT_CONFIG,
  DEFAULT_FONT_LICENSES,
  type FontConfig,
  type TypeScaleSize,
  type TypeScale,
  type FontLicense,
  type TypographyMetadata,
  type DTCGTokenFile,
} from './typography-engine';
export {
  generateScale,
  generateNeutral,
  generateSemantic,
  generateDarkVariants,
  relativeLuminance,
  contrastRatio,
  computeWCAG,
  validateWCAG,
  type DTCGTokenGroup,
  type WCAGData,
} from './color-engine';
export {
  type DTCGToken,
  type DTCGTokenType,
  type TokenGroup,
  type TokenSchema,
  type TokenValue,
  type TokenPath,
  type ValidationError,
  type FileValidationResult,
  type ValidationResult,
  type ClientConfig,
  getPrimitiveToken,
} from './types';
export { exportTokensAsCSS } from './css-exporter';
