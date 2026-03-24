/**
 * WCAG conformance levels for contrast ratio results.
 */
export type WCAGLevel = 'AAA' | 'AA' | 'AA-large' | 'fail';

/**
 * Result of a contrast ratio check between two colors.
 */
export interface ContrastResult {
  /** The foreground color as normalized 6-digit hex (e.g., '#ff0000') */
  foreground: string;
  /** The background color as normalized 6-digit hex (e.g., '#ffffff') */
  background: string;
  /** The contrast ratio rounded to 2 decimal places (e.g., 4.51) */
  ratio: number;
  /** The highest WCAG conformance level met */
  level: WCAGLevel;
  /** Whether the contrast meets WCAG AA for normal text (>=4.5:1) */
  passesAA: boolean;
  /** Whether the contrast meets WCAG AA for large text (>=3:1) */
  passesAALarge: boolean;
  /** Whether the contrast meets WCAG AAA for normal text (>=7:1) */
  passesAAA: boolean;
}

/**
 * Result of a dimension check for an image or asset file.
 */
export interface DimensionResult {
  /** The file path that was checked */
  filePath: string;
  /** The expected dimensions string (e.g., '1080x1920') */
  expected: string;
  /** The actual dimensions string (e.g., '1080x1920'), or null if file could not be read */
  actual: string | null;
  /** Expected width in pixels */
  expectedWidth: number;
  /** Expected height in pixels */
  expectedHeight: number;
  /** Actual width in pixels, or null if not readable */
  actualWidth: number | null;
  /** Actual height in pixels, or null if not readable */
  actualHeight: number | null;
  /** Whether the actual dimensions match the expected dimensions */
  pass: boolean;
  /** Human-readable message describing the result */
  message: string;
}

/**
 * Supported image formats for dimension checking.
 */
export type SupportedImageFormat = 'png' | 'jpeg' | 'jpg' | 'gif' | 'bmp' | 'webp';
