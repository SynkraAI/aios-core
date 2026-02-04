"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const colors = require("../../tokens/colors.cjs");
const typography = require("../../tokens/typography.cjs");
const spacing = require("../../tokens/spacing.cjs");
const borders = require("../../tokens/borders.cjs");
const Badge = ({
  variant = "default",
  size = "md",
  badgeStyle = "solid",
  leftIcon,
  rightIcon,
  children,
  style: customStyle,
  ...props
}) => {
  const sizeStyles = {
    sm: {
      padding: `0.125rem ${spacing.spacing[2]}`,
      // 2px 8px (0.5 * 4px = 2px)
      fontSize: typography.typography.fontSize.xs,
      // 10px
      gap: spacing.spacing[1]
      // 4px
    },
    md: {
      padding: `${spacing.spacing[1]} ${spacing.spacing[2]}`,
      // 4px 8px
      fontSize: typography.typography.fontSize.sm,
      // 12px
      gap: spacing.spacing[1]
      // 4px
    },
    lg: {
      padding: `${spacing.spacing[2]} ${spacing.spacing[3]}`,
      // 8px 12px
      fontSize: typography.typography.fontSize.base,
      // 14px
      gap: spacing.spacing[2]
      // 8px
    }
  };
  const variantColors = {
    default: {
      solid: {
        background: colors.colors.neutral[600],
        color: colors.colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.colors.neutral[100],
        color: colors.colors.neutral[700],
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.colors.neutral[700],
        border: `${borders.borders.width.DEFAULT} solid ${colors.colors.neutral[300]}`
      }
    },
    primary: {
      solid: {
        background: colors.colors.primary.DEFAULT,
        color: colors.colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.colors.primary.light,
        color: colors.colors.primary.DEFAULT,
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.colors.primary.DEFAULT,
        border: `${borders.borders.width.DEFAULT} solid ${colors.colors.primary.DEFAULT}`
      }
    },
    success: {
      solid: {
        background: colors.colors.semantic.success.DEFAULT,
        color: colors.colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.colors.semantic.success.light,
        color: colors.colors.semantic.success.dark,
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.colors.semantic.success.DEFAULT,
        border: `${borders.borders.width.DEFAULT} solid ${colors.colors.semantic.success.DEFAULT}`
      }
    },
    warning: {
      solid: {
        background: colors.colors.semantic.warning.DEFAULT,
        color: colors.colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.colors.semantic.warning.light,
        color: colors.colors.semantic.warning.dark,
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.colors.semantic.warning.DEFAULT,
        border: `${borders.borders.width.DEFAULT} solid ${colors.colors.semantic.warning.DEFAULT}`
      }
    },
    danger: {
      solid: {
        background: colors.colors.semantic.error.DEFAULT,
        color: colors.colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.colors.semantic.error.light,
        color: colors.colors.semantic.error.dark,
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.colors.semantic.error.DEFAULT,
        border: `${borders.borders.width.DEFAULT} solid ${colors.colors.semantic.error.DEFAULT}`
      }
    },
    info: {
      solid: {
        background: colors.colors.semantic.info.DEFAULT,
        color: colors.colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.colors.semantic.info.light,
        color: colors.colors.semantic.info.dark,
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.colors.semantic.info.DEFAULT,
        border: `${borders.borders.width.DEFAULT} solid ${colors.colors.semantic.info.DEFAULT}`
      }
    }
  };
  const styleConfig = variantColors[variant][badgeStyle];
  const baseStyles = {
    ...sizeStyles[size],
    ...styleConfig,
    fontFamily: typography.typography.fontFamily.sans,
    fontWeight: typography.typography.fontWeight.medium,
    lineHeight: typography.typography.lineHeight.tight,
    borderRadius: borders.borders.radius.full,
    // Pill shape
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    userSelect: "none"
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("span", { ...props, style: { ...baseStyles, ...customStyle }, children: [
    leftIcon,
    children,
    rightIcon
  ] });
};
exports.Badge = Badge;
//# sourceMappingURL=Badge.cjs.map
