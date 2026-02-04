const typography = {
  // Font Families
  fontFamily: {
    sans: 'var(--font-inter), Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  // Font Sizes
  fontSize: {
    xs: "0.625rem",
    // 10px
    sm: "0.75rem",
    // 12px
    base: "0.875rem",
    // 14px
    lg: "1rem",
    // 16px
    xl: "1.125rem",
    // 18px
    "2xl": "1.25rem",
    // 20px
    "3xl": "1.5rem",
    // 24px
    "4xl": "2rem",
    // 32px
    "5xl": "2.5rem",
    // 40px
    "6xl": "3rem",
    // 48px
    "7xl": "4rem"
    // 64px
  },
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  // Line Heights
  lineHeight: {
    tightest: 1.1,
    tighter: 1.2,
    tight: 1.3,
    normal: 1.4,
    loose: 1.5,
    relaxed: 1.6
  },
  // Letter Spacing
  letterSpacing: {
    tightest: "-1.5px",
    tighter: "-1px",
    tight: "-0.25px",
    normal: "0",
    wide: "0.05em"
  }
};
const typographyPresets = {
  h1: {
    fontSize: typography.fontSize["7xl"],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tightest,
    letterSpacing: typography.letterSpacing.tightest
  },
  h2: {
    fontSize: typography.fontSize["6xl"],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tighter,
    letterSpacing: typography.letterSpacing.tighter
  },
  h3: {
    fontSize: typography.fontSize["5xl"],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tighter,
    letterSpacing: typography.letterSpacing.tighter
  },
  h4: {
    fontSize: typography.fontSize["4xl"],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight
  },
  h5: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight
  },
  h6: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal
  },
  bodyLarge: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.loose
  },
  body: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.loose
  },
  bodySmall: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal
  },
  button: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal
  },
  badge: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.tight
  }
};
export {
  typography,
  typographyPresets
};
//# sourceMappingURL=typography.js.map
