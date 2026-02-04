import { jsxs } from "react/jsx-runtime";
import { colors } from "../../tokens/colors.js";
import { typography } from "../../tokens/typography.js";
import { spacing } from "../../tokens/spacing.js";
import { borders } from "../../tokens/borders.js";
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
      padding: `0.125rem ${spacing[2]}`,
      // 2px 8px (0.5 * 4px = 2px)
      fontSize: typography.fontSize.xs,
      // 10px
      gap: spacing[1]
      // 4px
    },
    md: {
      padding: `${spacing[1]} ${spacing[2]}`,
      // 4px 8px
      fontSize: typography.fontSize.sm,
      // 12px
      gap: spacing[1]
      // 4px
    },
    lg: {
      padding: `${spacing[2]} ${spacing[3]}`,
      // 8px 12px
      fontSize: typography.fontSize.base,
      // 14px
      gap: spacing[2]
      // 8px
    }
  };
  const variantColors = {
    default: {
      solid: {
        background: colors.neutral[600],
        color: colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.neutral[100],
        color: colors.neutral[700],
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.neutral[700],
        border: `${borders.width.DEFAULT} solid ${colors.neutral[300]}`
      }
    },
    primary: {
      solid: {
        background: colors.primary.DEFAULT,
        color: colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.primary.light,
        color: colors.primary.DEFAULT,
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.primary.DEFAULT,
        border: `${borders.width.DEFAULT} solid ${colors.primary.DEFAULT}`
      }
    },
    success: {
      solid: {
        background: colors.semantic.success.DEFAULT,
        color: colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.semantic.success.light,
        color: colors.semantic.success.dark,
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.semantic.success.DEFAULT,
        border: `${borders.width.DEFAULT} solid ${colors.semantic.success.DEFAULT}`
      }
    },
    warning: {
      solid: {
        background: colors.semantic.warning.DEFAULT,
        color: colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.semantic.warning.light,
        color: colors.semantic.warning.dark,
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.semantic.warning.DEFAULT,
        border: `${borders.width.DEFAULT} solid ${colors.semantic.warning.DEFAULT}`
      }
    },
    danger: {
      solid: {
        background: colors.semantic.error.DEFAULT,
        color: colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.semantic.error.light,
        color: colors.semantic.error.dark,
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.semantic.error.DEFAULT,
        border: `${borders.width.DEFAULT} solid ${colors.semantic.error.DEFAULT}`
      }
    },
    info: {
      solid: {
        background: colors.semantic.info.DEFAULT,
        color: colors.neutral.white,
        border: "none"
      },
      subtle: {
        background: colors.semantic.info.light,
        color: colors.semantic.info.dark,
        border: "none"
      },
      outline: {
        background: "transparent",
        color: colors.semantic.info.DEFAULT,
        border: `${borders.width.DEFAULT} solid ${colors.semantic.info.DEFAULT}`
      }
    }
  };
  const styleConfig = variantColors[variant][badgeStyle];
  const baseStyles = {
    ...sizeStyles[size],
    ...styleConfig,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.tight,
    borderRadius: borders.radius.full,
    // Pill shape
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    userSelect: "none"
  };
  return /* @__PURE__ */ jsxs("span", { ...props, style: { ...baseStyles, ...customStyle }, children: [
    leftIcon,
    children,
    rightIcon
  ] });
};
export {
  Badge
};
//# sourceMappingURL=Badge.js.map
