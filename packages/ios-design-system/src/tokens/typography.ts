/**
 * iOS 16 Typography System
 * Based on SF Pro font family and Apple's text styles
 * https://developer.apple.com/design/human-interface-guidelines/typography
 */

/**
 * SF Pro Font Family Stack
 * Uses system fonts on Apple devices, with fallbacks for other platforms
 */
export const fontFamily = {
  /**
   * SF Pro Text - Used for text sizes ≤19pt
   */
  text: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif`,

  /**
   * SF Pro Display - Used for text sizes ≥20pt
   */
  display: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif`,

  /**
   * SF Pro Rounded - Optional rounded variant
   */
  rounded: `-apple-system, BlinkMacSystemFont, 'SF Pro Rounded', 'Helvetica Neue', Helvetica, Arial, sans-serif`,

  /**
   * SF Mono - Monospace font for code
   */
  mono: `'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace`,
} as const

/**
 * iOS Font Weights
 * Mapped to standard CSS font-weight values
 */
export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  heavy: 800,
  black: 900,
  ultraLight: 100,
  thin: 200,
  light: 300,
} as const

/**
 * iOS Text Style Interface
 */
export interface IOSTextStyle {
  fontSize: string
  lineHeight: string
  letterSpacing: string
  fontWeight: number
  fontFamily: string
}

/**
 * iOS Dynamic Type Text Styles
 * These are the standard text styles used across iOS
 */
export const textStyles = {
  /**
   * Large Title - 34pt
   * Used for large, prominent titles in navigation bars
   */
  largeTitle: {
    fontSize: '34px',
    lineHeight: '41px',
    letterSpacing: '0.37px',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.display,
  },

  /**
   * Title 1 - 28pt
   * Used for first-level hierarchical headings
   */
  title1: {
    fontSize: '28px',
    lineHeight: '34px',
    letterSpacing: '0.36px',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.display,
  },

  /**
   * Title 2 - 22pt
   * Used for second-level hierarchical headings
   */
  title2: {
    fontSize: '22px',
    lineHeight: '28px',
    letterSpacing: '0.35px',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.display,
  },

  /**
   * Title 3 - 20pt
   * Used for third-level hierarchical headings
   */
  title3: {
    fontSize: '20px',
    lineHeight: '25px',
    letterSpacing: '0.38px',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.display,
  },

  /**
   * Headline - 17pt Semibold
   * Used for headings and emphasized text
   */
  headline: {
    fontSize: '17px',
    lineHeight: '22px',
    letterSpacing: '-0.41px',
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.text,
  },

  /**
   * Body - 17pt Regular
   * The default text style for most content
   */
  body: {
    fontSize: '17px',
    lineHeight: '22px',
    letterSpacing: '-0.41px',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.text,
  },

  /**
   * Callout - 16pt Regular
   * Used for highlighted information or action items
   */
  callout: {
    fontSize: '16px',
    lineHeight: '21px',
    letterSpacing: '-0.32px',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.text,
  },

  /**
   * Subheadline - 15pt Regular
   * Used for secondary headings and labels
   */
  subheadline: {
    fontSize: '15px',
    lineHeight: '20px',
    letterSpacing: '-0.24px',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.text,
  },

  /**
   * Footnote - 13pt Regular
   * Used for footnotes, captions, and secondary information
   */
  footnote: {
    fontSize: '13px',
    lineHeight: '18px',
    letterSpacing: '-0.08px',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.text,
  },

  /**
   * Caption 1 - 12pt Regular
   * Used for small captions and labels
   */
  caption1: {
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0px',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.text,
  },

  /**
   * Caption 2 - 11pt Regular
   * Used for very small text and metadata
   */
  caption2: {
    fontSize: '11px',
    lineHeight: '13px',
    letterSpacing: '0.06px',
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.text,
  },
} as const satisfies Record<string, IOSTextStyle>

/**
 * Typography scale for custom text sizes
 * Based on iOS 8pt grid system
 */
export const fontSize = {
  xs: '11px', // caption2
  sm: '12px', // caption1
  md: '13px', // footnote
  base: '15px', // subheadline
  lg: '16px', // callout
  xl: '17px', // body, headline
  '2xl': '20px', // title3
  '3xl': '22px', // title2
  '4xl': '28px', // title1
  '5xl': '34px', // largeTitle
} as const

/**
 * Line height scale
 */
export const lineHeight = {
  tight: '1.2',
  normal: '1.3',
  relaxed: '1.5',
  loose: '1.7',
} as const

/**
 * Letter spacing scale
 */
export const letterSpacing = {
  tighter: '-0.41px',
  tight: '-0.32px',
  normal: '0px',
  wide: '0.35px',
  wider: '0.38px',
} as const

/**
 * Type utilities
 */
export type TextStyleName = keyof typeof textStyles
export type FontFamilyName = keyof typeof fontFamily
export type FontWeightName = keyof typeof fontWeight
