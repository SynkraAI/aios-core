"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const colors = require("./tokens/colors.cjs");
const typography = require("./tokens/typography.cjs");
const spacing = require("./tokens/spacing.cjs");
const shadows = require("./tokens/shadows.cjs");
const borders = require("./tokens/borders.cjs");
const tokens = {
  colors: colors.colors,
  typography: typography.typography,
  typographyPresets: typography.typographyPresets,
  spacing: spacing.spacing,
  container: spacing.container,
  breakpoints: spacing.breakpoints,
  shadows: shadows.shadows,
  backdrop: shadows.backdrop,
  opacity: shadows.opacity,
  borders: borders.borders
};
exports.colors = colors.colors;
exports.typography = typography.typography;
exports.typographyPresets = typography.typographyPresets;
exports.breakpoints = spacing.breakpoints;
exports.container = spacing.container;
exports.spacing = spacing.spacing;
exports.backdrop = shadows.backdrop;
exports.opacity = shadows.opacity;
exports.shadows = shadows.shadows;
exports.borders = borders.borders;
exports.tokens = tokens;
//# sourceMappingURL=tokens.cjs.map
