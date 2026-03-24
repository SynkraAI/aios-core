/**
 * Color Palette Engine
 *
 * Generates accessible color palettes with WCAG contrast validation.
 * Uses OKLCH color space for perceptually uniform scales.
 *
 * Features:
 * - Color scale generation (50-950 in 11 steps)
 * - Neutral gray scale with hue-derived or pure neutrals
 * - Semantic colors (success, warning, error, info) with 5 tones each
 * - Dark mode variants
 * - WCAG 2.1 contrast validation with AA/AAA compliance badges
 */

import { formatHex, converter, type Color } from 'culori';
import type { DTCGToken, TokenGroup } from './types';

/**
 * Color scale steps for 50-950 palette (11 steps).
 */
const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/**
 * Lightness values for OKLCH color space, mapping to scale steps.
 * Values optimized for perceptual uniformity and accessibility.
 */
const LIGHTNESS_VALUES = [0.97, 0.93, 0.87, 0.78, 0.66, 0.52, 0.42, 0.33, 0.25, 0.17, 0.11];

/**
 * Semantic color default seed values.
 */
const SEMANTIC_DEFAULTS = {
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#0057FF',
} as const;

/**
 * Semantic color tone steps (5 tones for light + dark mode usage).
 */
const SEMANTIC_TONES = [100, 300, 500, 700, 900] as const;

/**
 * WCAG contrast thresholds.
 */
const WCAG_THRESHOLDS = {
  aaLarge: 3.0,
  aa: 4.5,
  aaa: 7.0,
} as const;

/**
 * DTCG color token group — map of step/tone to token.
 */
export type DTCGTokenGroup = Record<string, DTCGToken>;

/**
 * WCAG compliance data attached to token $extensions.
 */
export interface WCAGData {
  onWhite: number;
  onBlack: number;
  aaLarge: boolean;
  aa: boolean;
  aaa: boolean;
}

/**
 * Convert hex to OKLCH color object.
 */
const toOklch = converter('oklch');

/**
 * Generate a full color scale (50-950) from a seed hex color.
 * Uses OKLCH color space to vary Lightness while preserving Chroma/Hue.
 *
 * @param seedHex - Seed color in hex format (e.g., "#0057FF")
 * @param name - Color name for descriptions (e.g., "blue")
 * @returns DTCG token group with 11 steps (50-950)
 */
export function generateScale(seedHex: string, name: string): DTCGTokenGroup {
  const base = toOklch(seedHex);
  if (!base) {
    throw new Error(`Invalid seed color: ${seedHex}`);
  }

  const scale: DTCGTokenGroup = {};

  SCALE_STEPS.forEach((step, index) => {
    const lightness = LIGHTNESS_VALUES[index];
    const color = { ...base, l: lightness };
    const hex = formatHex(color) ?? '#000000';

    scale[step.toString()] = {
      $value: hex,
      $type: 'color',
      $description: `${name} ${step} — L=${Math.round(lightness * 100)}%`,
    };
  });

  return scale;
}

/**
 * Generate neutral gray scale (50-950).
 * If primary color is provided, derives hue from it with low saturation (≤5%).
 * Otherwise, generates pure neutral (chroma=0).
 *
 * @param primaryHex - Optional primary color to derive hue from
 * @returns DTCG token group with 11 neutral steps
 */
export function generateNeutral(primaryHex?: string): DTCGTokenGroup {
  let baseHue = 0;
  let baseChroma = 0;

  if (primaryHex) {
    const primary = toOklch(primaryHex);
    if (primary && primary.h !== undefined) {
      baseHue = primary.h;
      baseChroma = Math.min(primary.c ?? 0, 0.02); // Max 5% saturation ≈ 0.02 chroma
    }
  }

  const scale: DTCGTokenGroup = {};

  SCALE_STEPS.forEach((step, index) => {
    const lightness = LIGHTNESS_VALUES[index];
    const color: Color = {
      mode: 'oklch',
      l: lightness,
      c: baseChroma,
      h: baseHue,
    };
    const hex = formatHex(color) ?? '#808080';

    scale[step.toString()] = {
      $value: hex,
      $type: 'color',
      $description: `Neutral ${step} — L=${Math.round(lightness * 100)}%`,
    };
  });

  return scale;
}

/**
 * Generate semantic colors (success, warning, error, info).
 * Each semantic group has 5 tones (100, 300, 500, 700, 900).
 *
 * @returns Object with semantic color groups
 */
export function generateSemantic(): Record<string, DTCGTokenGroup> {
  const semantic: Record<string, DTCGTokenGroup> = {};

  Object.entries(SEMANTIC_DEFAULTS).forEach(([name, seedHex]) => {
    const base = toOklch(seedHex);
    if (!base) {
      throw new Error(`Invalid semantic seed color for ${name}: ${seedHex}`);
    }

    const group: DTCGTokenGroup = {};

    // Map tones to lightness values (subset of full scale)
    const toneLightness: Record<number, number> = {
      100: 0.93,
      300: 0.78,
      500: 0.52,
      700: 0.33,
      900: 0.17,
    };

    SEMANTIC_TONES.forEach((tone) => {
      const lightness = toneLightness[tone];
      const color = { ...base, l: lightness };
      const hex = formatHex(color) ?? '#000000';

      group[tone.toString()] = {
        $value: hex,
        $type: 'color',
        $description: `${name} ${tone} — L=${Math.round(lightness * 100)}%`,
      };
    });

    semantic[name] = group;
  });

  return semantic;
}

/**
 * Generate dark mode variants for semantic tokens.
 * Inverts lightness for surface colors, lightens text colors.
 *
 * @param semanticTokens - Light mode semantic tokens
 * @returns Dark mode token group (same structure as light)
 */
export function generateDarkVariants(semanticTokens: TokenGroup): TokenGroup {
  const darkVariants: Record<string, unknown> = {};

  function processGroup(input: TokenGroup, output: Record<string, unknown>): void {
    Object.entries(input).forEach(([key, value]) => {
      if ('$value' in value && '$type' in value) {
        // This is a token leaf
        const token = value as DTCGToken;
        if (token.$type === 'color' && typeof token.$value === 'string') {
          const color = toOklch(token.$value);
          if (color && color.l !== undefined) {
            // Invert lightness for dark mode
            const invertedL = 1 - color.l;
            const darkColor = { ...color, l: invertedL };
            const darkHex = formatHex(darkColor) ?? token.$value;

            output[key] = {
              $value: darkHex,
              $type: 'color',
              $description: `${token.$description} (dark mode)`,
            };
          } else {
            // Fallback: keep original if conversion fails
            output[key] = value;
          }
        } else {
          output[key] = value;
        }
      } else {
        // This is a nested group
        output[key] = {};
        processGroup(value as TokenGroup, output[key] as Record<string, unknown>);
      }
    });
  }

  processGroup(semanticTokens, darkVariants);
  return darkVariants as TokenGroup;
}

/**
 * Compute relative luminance of a color per WCAG 2.1 spec.
 * Linearizes sRGB and applies weighted channel sum.
 *
 * @param hex - Color in hex format
 * @returns Relative luminance (0-1)
 */
export function relativeLuminance(hex: string): number {
  const color = toOklch(hex);
  if (!color) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  // Convert OKLCH back to sRGB for luminance calculation
  // culori provides 'rgb' mode converter
  const toRgb = converter('rgb');
  const rgb = toRgb(color);
  if (!rgb || rgb.r === undefined || rgb.g === undefined || rgb.b === undefined) {
    throw new Error(`Could not convert ${hex} to RGB`);
  }

  const linearize = (channel: number): number => {
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  const r = linearize(rgb.r);
  const g = linearize(rgb.g);
  const b = linearize(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Compute WCAG contrast ratio between two colors.
 *
 * @param fg - Foreground color hex
 * @param bg - Background color hex
 * @returns Contrast ratio (1-21)
 */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Compute WCAG compliance data for a color.
 *
 * @param hex - Color to check
 * @returns WCAG data with contrast ratios and compliance flags
 */
export function computeWCAG(hex: string): WCAGData {
  const onWhite = contrastRatio(hex, '#FFFFFF');
  const onBlack = contrastRatio(hex, '#000000');

  return {
    onWhite,
    onBlack,
    aaLarge: onWhite >= WCAG_THRESHOLDS.aaLarge,
    aa: onWhite >= WCAG_THRESHOLDS.aa,
    aaa: onWhite >= WCAG_THRESHOLDS.aaa,
  };
}

/**
 * Validate WCAG compliance for semantic text colors.
 * Only validates colors intended for text (excludes backgrounds and light tones).
 * Fails if any text color fails WCAG AA (4.5:1 for normal text).
 *
 * @param tokens - Token group to validate
 * @returns True if all text tokens pass AA, false otherwise
 * @throws Error with details if any text token fails AA
 */
export function validateWCAG(tokens: TokenGroup): boolean {
  const failures: string[] = [];

  function checkGroup(group: TokenGroup, path: string): void {
    Object.entries(group).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if ('$value' in value && '$type' in value) {
        const token = value as DTCGToken;
        if (token.$type === 'color' && typeof token.$value === 'string') {
          // Only validate text colors and semantic dark tones (500+)
          const isTextColor = currentPath.includes('text.');
          const isSemanticDarkTone =
            (currentPath.includes('.500') ||
              currentPath.includes('.700') ||
              currentPath.includes('.900')) &&
            (currentPath.includes('success') ||
              currentPath.includes('warning') ||
              currentPath.includes('error') ||
              currentPath.includes('info'));

          if (isTextColor || isSemanticDarkTone) {
            const wcag = computeWCAG(token.$value);
            if (!wcag.aa) {
              failures.push(
                `${currentPath} fails WCAG AA: ${wcag.onWhite.toFixed(2)}:1 (requires ≥4.5:1)`
              );
            }
          }
        }
      } else {
        checkGroup(value as TokenGroup, currentPath);
      }
    });
  }

  checkGroup(tokens, '');

  if (failures.length > 0) {
    throw new Error(`WCAG AA validation failed:\n${failures.join('\n')}`);
  }

  return true;
}
