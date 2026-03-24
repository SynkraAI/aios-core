import type { ContrastResult, WCAGLevel } from './types';

/**
 * WCAG 2.1 contrast ratio thresholds.
 */
const WCAG_THRESHOLDS = {
  AAA: 7,
  AA: 4.5,
  AA_LARGE: 3,
} as const;

/**
 * Parses a hex color string into RGB components.
 * Supports 3-digit (#RGB) and 6-digit (#RRGGBB) formats, with or without '#'.
 *
 * @throws Error if the hex string is invalid.
 */
export function parseHex(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace(/^#/, '');

  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }

  if (cleaned.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    throw new Error(`Invalid hex color: "${hex}". Expected format: #RRGGBB or #RGB`);
  }

  return {
    r: parseInt(cleaned.substring(0, 2), 16),
    g: parseInt(cleaned.substring(2, 4), 16),
    b: parseInt(cleaned.substring(4, 6), 16),
  };
}

/**
 * Converts an sRGB color channel value (0-255) to its relative luminance component.
 * Uses the WCAG 2.1 formula for linearizing sRGB.
 */
function linearize(channel: number): number {
  const sRGB = channel / 255;
  return sRGB <= 0.04045
    ? sRGB / 12.92
    : Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

/**
 * Calculates the relative luminance of a color per WCAG 2.1.
 * Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Calculates the contrast ratio between two colors per WCAG 2.1.
 * Returns a value between 1 (no contrast) and 21 (maximum contrast).
 */
export function contrastRatio(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
): number {
  const l1 = relativeLuminance(fg.r, fg.g, fg.b);
  const l2 = relativeLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determines the highest WCAG conformance level for a given contrast ratio.
 */
export function getWCAGLevel(ratio: number): WCAGLevel {
  if (ratio >= WCAG_THRESHOLDS.AAA) {
    return 'AAA';
  }
  if (ratio >= WCAG_THRESHOLDS.AA) {
    return 'AA';
  }
  if (ratio >= WCAG_THRESHOLDS.AA_LARGE) {
    return 'AA-large';
  }
  return 'fail';
}

/**
 * Normalizes a hex color to 6-digit lowercase format with '#' prefix.
 */
function normalizeHex(hex: string): string {
  let cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }
  return `#${cleaned.toLowerCase()}`;
}

/**
 * Checks the contrast ratio between a foreground and background color.
 *
 * @param foregroundHex - Foreground color in hex format (#RGB or #RRGGBB)
 * @param backgroundHex - Background color in hex format (#RGB or #RRGGBB)
 * @returns ContrastResult with ratio, WCAG level, and pass/fail status
 * @throws Error if either hex color is invalid
 *
 * @example
 * ```ts
 * const result = checkContrast('#000000', '#ffffff');
 * // result.ratio === 21, result.level === 'AAA', result.passesAA === true
 * ```
 */
export function checkContrast(foregroundHex: string, backgroundHex: string): ContrastResult {
  const fg = parseHex(foregroundHex);
  const bg = parseHex(backgroundHex);

  const ratio = Math.round(contrastRatio(fg, bg) * 100) / 100;
  const level = getWCAGLevel(ratio);

  return {
    foreground: normalizeHex(foregroundHex),
    background: normalizeHex(backgroundHex),
    ratio,
    level,
    passesAA: ratio >= WCAG_THRESHOLDS.AA,
    passesAALarge: ratio >= WCAG_THRESHOLDS.AA_LARGE,
    passesAAA: ratio >= WCAG_THRESHOLDS.AAA,
  };
}
