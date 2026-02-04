"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const colors = require("../../tokens/colors.cjs");
const typography = require("../../tokens/typography.cjs");
const spacing = require("../../tokens/spacing.cjs");
const shadows = require("../../tokens/shadows.cjs");
const borders = require("../../tokens/borders.cjs");
const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  style,
  ...props
}) => {
  const sizeStyles = {
    sm: {
      padding: `${spacing.spacing[2]} ${spacing.spacing[3]}`,
      // 8px 12px
      fontSize: typography.typography.fontSize.base,
      // 14px
      lineHeight: typography.typography.lineHeight.normal,
      fontWeight: typography.typography.fontWeight.semibold
    },
    md: {
      padding: `${spacing.spacing[3]} ${spacing.spacing[4]}`,
      // 12px 16px
      fontSize: typography.typography.fontSize.lg,
      // 16px
      lineHeight: typography.typography.lineHeight.normal,
      fontWeight: typography.typography.fontWeight.semibold
    },
    lg: {
      padding: `${spacing.spacing[4]} ${spacing.spacing[6]}`,
      // 16px 24px
      fontSize: typography.typography.fontSize.xl,
      // 18px
      lineHeight: typography.typography.lineHeight.normal,
      fontWeight: typography.typography.fontWeight.semibold
    }
  };
  const variantStyles = {
    primary: {
      backgroundColor: colors.colors.primary.DEFAULT,
      color: colors.colors.neutral.white,
      border: "none",
      boxShadow: shadows.shadows.boxShadow.button,
      hover: {
        backgroundColor: colors.colors.primary.hover
      },
      active: {
        backgroundColor: colors.colors.primary.active
      }
    },
    secondary: {
      backgroundColor: "transparent",
      color: colors.colors.neutral[700],
      border: `${borders.borders.width.DEFAULT} solid ${colors.colors.neutral[300]}`,
      boxShadow: "none",
      hover: {
        backgroundColor: colors.colors.neutral[50],
        borderColor: colors.colors.neutral[400]
      },
      active: {
        backgroundColor: colors.colors.neutral[100]
      }
    },
    ghost: {
      backgroundColor: "transparent",
      color: colors.colors.neutral[700],
      border: "none",
      boxShadow: "none",
      hover: {
        backgroundColor: colors.colors.neutral[50]
      },
      active: {
        backgroundColor: colors.colors.neutral[100]
      }
    },
    danger: {
      backgroundColor: colors.colors.semantic.error.DEFAULT,
      color: colors.colors.neutral.white,
      border: "none",
      boxShadow: shadows.shadows.boxShadow.button,
      hover: {
        backgroundColor: colors.colors.semantic.error.dark
      },
      active: {
        backgroundColor: colors.colors.semantic.error.dark
      }
    }
  };
  const baseStyles = {
    ...sizeStyles[size],
    ...variantStyles[variant],
    fontFamily: typography.typography.fontFamily.sans,
    borderRadius: borders.borders.radius.DEFAULT,
    // 8px
    cursor: disabled || loading ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.spacing[2],
    // 8px between icon and text
    width: fullWidth ? "100%" : "auto",
    opacity: disabled || loading ? opacity[60] : opacity[100],
    transition: "all 0.2s ease",
    textDecoration: "none",
    userSelect: "none"
  };
  const handleMouseEnter = (e) => {
    if (!disabled && !loading) {
      const hoverStyle = variantStyles[variant].hover;
      if (hoverStyle.backgroundColor) {
        e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor;
      }
      if ("borderColor" in hoverStyle && hoverStyle.borderColor) {
        e.currentTarget.style.borderColor = hoverStyle.borderColor;
      }
    }
  };
  const handleMouseLeave = (e) => {
    if (!disabled && !loading) {
      e.currentTarget.style.backgroundColor = variantStyles[variant].backgroundColor;
      if (variantStyles[variant].border) {
        const borderColor = variantStyles[variant].border.split(" ").pop() || "";
        e.currentTarget.style.borderColor = borderColor;
      }
    }
  };
  const LoadingSpinner = () => /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      style: {
        animation: "spin 1s linear infinite"
      },
      children: /* @__PURE__ */ jsxRuntime.jsx(
        "circle",
        {
          cx: "8",
          cy: "8",
          r: "6",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeDasharray: "31.4 31.4",
          strokeDashoffset: "10"
        }
      )
    }
  );
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("style", { children: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        ...props,
        disabled: disabled || loading,
        style: { ...baseStyles, ...style },
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        children: [
          loading ? /* @__PURE__ */ jsxRuntime.jsx(LoadingSpinner, {}) : leftIcon,
          children,
          !loading && rightIcon
        ]
      }
    )
  ] });
};
const opacity = {
  60: "0.6",
  100: "1"
};
exports.Button = Button;
//# sourceMappingURL=Button.cjs.map
