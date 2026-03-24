/**
 * Color Palette Reviewer (BSS-7.7, AC 2).
 *
 * Validates colors, computes WCAG contrast ratios for all pairs,
 * and allows hex value adjustments with real-time accessibility feedback.
 *
 * Reuses WCAG contrast utilities from @brand-system/qa-tools.
 *
 * @module onboarding/review/color-reviewer
 */

import type { ColorPalette, PaletteColor, ColorValue, ColorRole } from '../analysis/analysis-types';
import type { ColorReviewData, ContrastPairResult } from './review-types';

// ---------------------------------------------------------------------------
// Hex Validation
// ---------------------------------------------------------------------------

const HEX_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Validates whether a string is a valid hex color. */
export function isValidHex(hex: string): boolean {
  return HEX_REGEX.test(hex);
}

/** Normalizes a hex color to 6-digit lowercase format with '#' prefix. */
export function normalizeHex(hex: string): string {
  let cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }
  return `#${cleaned.toLowerCase()}`;
}

/** Parses a hex string into RGB components. */
export function parseHexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }
  if (cleaned.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }
  return {
    r: parseInt(cleaned.substring(0, 2), 16),
    g: parseInt(cleaned.substring(2, 4), 16),
    b: parseInt(cleaned.substring(4, 6), 16),
  };
}

// ---------------------------------------------------------------------------
// WCAG Contrast (inline implementation matching qa-tools formula)
// ---------------------------------------------------------------------------

function linearize(channel: number): number {
  const sRGB = channel / 255;
  return sRGB <= 0.04045
    ? sRGB / 12.92
    : Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Calculates WCAG 2.1 contrast ratio between two hex colors. */
export function calculateContrastRatio(hexA: string, hexB: string): number {
  const rgbA = parseHexToRgb(hexA);
  const rgbB = parseHexToRgb(hexB);
  const l1 = relativeLuminance(rgbA.r, rgbA.g, rgbA.b);
  const l2 = relativeLuminance(rgbB.r, rgbB.g, rgbB.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

/** WCAG AA threshold for normal text. */
export const WCAG_AA_THRESHOLD = 4.5;

/** WCAG AA threshold for large text. */
export const WCAG_AA_LARGE_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// Color Reviewer
// ---------------------------------------------------------------------------

/** Generates all unique color pair contrast results. */
export function computeContrastPairs(colors: readonly PaletteColor[]): ContrastPairResult[] {
  const pairs: ContrastPairResult[] = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const hexA = colors[i].color.hex;
      const hexB = colors[j].color.hex;
      const ratio = calculateContrastRatio(hexA, hexB);
      pairs.push({
        colorA: normalizeHex(hexA),
        colorB: normalizeHex(hexB),
        roleA: colors[i].role,
        roleB: colors[j].role,
        ratio,
        passesAA: ratio >= WCAG_AA_THRESHOLD,
        passesAALarge: ratio >= WCAG_AA_LARGE_THRESHOLD,
      });
    }
  }
  return pairs;
}

/**
 * ColorReviewer manages color palette review state.
 *
 * - Initializes from a ColorPalette (standard or audit-assisted).
 * - Computes WCAG contrast ratios for all color pairs.
 * - Allows updating individual color hex values.
 * - Reports accessibility warnings.
 */
export class ColorReviewer {
  private editedColors: PaletteColor[];
  private readonly originalPalette: ColorPalette;

  constructor(palette: ColorPalette) {
    this.originalPalette = palette;
    // Create mutable copies
    this.editedColors = palette.colors.map((c) => ({ ...c }));
  }

  /** Returns the current review data snapshot. */
  getReviewData(): ColorReviewData {
    const contrastPairs = computeContrastPairs(this.editedColors);
    const hasAccessibilityWarnings = contrastPairs.some((p) => !p.passesAA);
    return {
      originalPalette: this.originalPalette,
      editedColors: [...this.editedColors],
      contrastPairs,
      hasAccessibilityWarnings,
    };
  }

  /**
   * Updates a color by role with a new hex value.
   * Returns true if the update was applied, false if role not found or hex invalid.
   */
  updateColor(role: ColorRole, newHex: string): boolean {
    if (!isValidHex(newHex)) {
      return false;
    }
    const index = this.editedColors.findIndex((c) => c.role === role);
    if (index === -1) {
      return false;
    }
    const normalized = normalizeHex(newHex);
    const rgb = parseHexToRgb(normalized);
    const newColorValue: ColorValue = {
      hex: normalized,
      rgb,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
    };
    this.editedColors[index] = {
      ...this.editedColors[index],
      color: newColorValue,
    };
    return true;
  }

  /** Returns the current edited palette as a ColorPalette. */
  getEditedPalette(): ColorPalette {
    return {
      colors: [...this.editedColors],
      generationRationale: this.originalPalette.generationRationale,
    };
  }

  /** Returns failing contrast pairs (ratio < 4.5:1 for AA text). */
  getFailingPairs(): ContrastPairResult[] {
    return computeContrastPairs(this.editedColors).filter((p) => !p.passesAA);
  }
}

// ---------------------------------------------------------------------------
// RGB to HSL Conversion Helper
// ---------------------------------------------------------------------------

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rNorm) {
    h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
  } else if (max === gNorm) {
    h = ((bNorm - rNorm) / d + 2) / 6;
  } else {
    h = ((rNorm - gNorm) / d + 4) / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
