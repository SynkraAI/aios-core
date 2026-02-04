"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const shadows = {
  // Box Shadows
  boxShadow: {
    none: "none",
    xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
    sm: "0 2px 4px rgba(169, 169, 169, 0.08)",
    DEFAULT: "0 4px 8px rgba(169, 169, 169, 0.08)",
    md: "0 6px 12px rgba(169, 169, 169, 0.1)",
    lg: "0 10px 20px rgba(169, 169, 169, 0.12)",
    xl: "0 20px 40px rgba(169, 169, 169, 0.15)",
    button: "0 2px 4px rgba(80, 108, 240, 0.2)"
  },
  // Z-Index Layers
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    tooltip: 60
  }
};
const backdrop = {
  blur: {
    sm: "blur(4px)",
    DEFAULT: "blur(6px)",
    lg: "blur(12px)"
  }
};
const opacity = {
  0: "0",
  10: "0.1",
  30: "0.3",
  60: "0.6",
  80: "0.8",
  100: "1"
};
exports.backdrop = backdrop;
exports.opacity = opacity;
exports.shadows = shadows;
//# sourceMappingURL=shadows.cjs.map
