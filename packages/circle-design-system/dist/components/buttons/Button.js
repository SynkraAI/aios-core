import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { colors } from "../../tokens/colors.js";
import { typography } from "../../tokens/typography.js";
import { spacing } from "../../tokens/spacing.js";
import { shadows } from "../../tokens/shadows.js";
import { borders } from "../../tokens/borders.js";
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
      padding: `${spacing[2]} ${spacing[3]}`,
      // 8px 12px
      fontSize: typography.fontSize.base,
      // 14px
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.semibold
    },
    md: {
      padding: `${spacing[3]} ${spacing[4]}`,
      // 12px 16px
      fontSize: typography.fontSize.lg,
      // 16px
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.semibold
    },
    lg: {
      padding: `${spacing[4]} ${spacing[6]}`,
      // 16px 24px
      fontSize: typography.fontSize.xl,
      // 18px
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.semibold
    }
  };
  const variantStyles = {
    primary: {
      backgroundColor: colors.primary.DEFAULT,
      color: colors.neutral.white,
      border: "none",
      boxShadow: shadows.boxShadow.button,
      hover: {
        backgroundColor: colors.primary.hover
      },
      active: {
        backgroundColor: colors.primary.active
      }
    },
    secondary: {
      backgroundColor: "transparent",
      color: colors.neutral[700],
      border: `${borders.width.DEFAULT} solid ${colors.neutral[300]}`,
      boxShadow: "none",
      hover: {
        backgroundColor: colors.neutral[50],
        borderColor: colors.neutral[400]
      },
      active: {
        backgroundColor: colors.neutral[100]
      }
    },
    ghost: {
      backgroundColor: "transparent",
      color: colors.neutral[700],
      border: "none",
      boxShadow: "none",
      hover: {
        backgroundColor: colors.neutral[50]
      },
      active: {
        backgroundColor: colors.neutral[100]
      }
    },
    danger: {
      backgroundColor: colors.semantic.error.DEFAULT,
      color: colors.neutral.white,
      border: "none",
      boxShadow: shadows.boxShadow.button,
      hover: {
        backgroundColor: colors.semantic.error.dark
      },
      active: {
        backgroundColor: colors.semantic.error.dark
      }
    }
  };
  const baseStyles = {
    ...sizeStyles[size],
    ...variantStyles[variant],
    fontFamily: typography.fontFamily.sans,
    borderRadius: borders.radius.DEFAULT,
    // 8px
    cursor: disabled || loading ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
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
  const LoadingSpinner = () => /* @__PURE__ */ jsx(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      style: {
        animation: "spin 1s linear infinite"
      },
      children: /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        ...props,
        disabled: disabled || loading,
        style: { ...baseStyles, ...style },
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        children: [
          loading ? /* @__PURE__ */ jsx(LoadingSpinner, {}) : leftIcon,
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
export {
  Button
};
//# sourceMappingURL=Button.js.map
