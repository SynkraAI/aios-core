import { HTMLAttributes, ReactNode } from 'react';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { borders } from '../../tokens/borders';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeStyle = 'solid' | 'subtle' | 'outline';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  /**
   * Badge color variant
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * Badge size
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Badge visual style
   * @default 'solid'
   */
  badgeStyle?: BadgeStyle;

  /**
   * Icon to display before the badge text
   */
  leftIcon?: ReactNode;

  /**
   * Icon to display after the badge text
   */
  rightIcon?: ReactNode;

  /**
   * Badge content
   */
  children: ReactNode;

  /**
   * Custom inline styles
   */
  style?: React.CSSProperties;
}

/**
 * Badge Component
 *
 * Small label for displaying status, categories, or counts.
 * Supports multiple variants, sizes, and styles.
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="primary" badgeStyle="subtle">New</Badge>
 * <Badge variant="warning" leftIcon={<Icon />}>Warning</Badge>
 * ```
 */
export const Badge = ({
  variant = 'default',
  size = 'md',
  badgeStyle = 'solid',
  leftIcon,
  rightIcon,
  children,
  style: customStyle,
  ...props
}: BadgeProps) => {
  const sizeStyles = {
    sm: {
      padding: `0.125rem ${spacing[2]}`, // 2px 8px (0.5 * 4px = 2px)
      fontSize: typography.fontSize.xs, // 10px
      gap: spacing[1], // 4px
    },
    md: {
      padding: `${spacing[1]} ${spacing[2]}`, // 4px 8px
      fontSize: typography.fontSize.sm, // 12px
      gap: spacing[1], // 4px
    },
    lg: {
      padding: `${spacing[2]} ${spacing[3]}`, // 8px 12px
      fontSize: typography.fontSize.base, // 14px
      gap: spacing[2], // 8px
    },
  };

  const variantColors = {
    default: {
      solid: {
        background: colors.neutral[600],
        color: colors.neutral.white,
        border: 'none',
      },
      subtle: {
        background: colors.neutral[100],
        color: colors.neutral[700],
        border: 'none',
      },
      outline: {
        background: 'transparent',
        color: colors.neutral[700],
        border: `${borders.width.DEFAULT} solid ${colors.neutral[300]}`,
      },
    },
    primary: {
      solid: {
        background: colors.primary.DEFAULT,
        color: colors.neutral.white,
        border: 'none',
      },
      subtle: {
        background: colors.primary.light,
        color: colors.primary.DEFAULT,
        border: 'none',
      },
      outline: {
        background: 'transparent',
        color: colors.primary.DEFAULT,
        border: `${borders.width.DEFAULT} solid ${colors.primary.DEFAULT}`,
      },
    },
    success: {
      solid: {
        background: colors.semantic.success.DEFAULT,
        color: colors.neutral.white,
        border: 'none',
      },
      subtle: {
        background: colors.semantic.success.light,
        color: colors.semantic.success.dark,
        border: 'none',
      },
      outline: {
        background: 'transparent',
        color: colors.semantic.success.DEFAULT,
        border: `${borders.width.DEFAULT} solid ${colors.semantic.success.DEFAULT}`,
      },
    },
    warning: {
      solid: {
        background: colors.semantic.warning.DEFAULT,
        color: colors.neutral.white,
        border: 'none',
      },
      subtle: {
        background: colors.semantic.warning.light,
        color: colors.semantic.warning.dark,
        border: 'none',
      },
      outline: {
        background: 'transparent',
        color: colors.semantic.warning.DEFAULT,
        border: `${borders.width.DEFAULT} solid ${colors.semantic.warning.DEFAULT}`,
      },
    },
    danger: {
      solid: {
        background: colors.semantic.error.DEFAULT,
        color: colors.neutral.white,
        border: 'none',
      },
      subtle: {
        background: colors.semantic.error.light,
        color: colors.semantic.error.dark,
        border: 'none',
      },
      outline: {
        background: 'transparent',
        color: colors.semantic.error.DEFAULT,
        border: `${borders.width.DEFAULT} solid ${colors.semantic.error.DEFAULT}`,
      },
    },
    info: {
      solid: {
        background: colors.semantic.info.DEFAULT,
        color: colors.neutral.white,
        border: 'none',
      },
      subtle: {
        background: colors.semantic.info.light,
        color: colors.semantic.info.dark,
        border: 'none',
      },
      outline: {
        background: 'transparent',
        color: colors.semantic.info.DEFAULT,
        border: `${borders.width.DEFAULT} solid ${colors.semantic.info.DEFAULT}`,
      },
    },
  };

  const styleConfig = variantColors[variant][badgeStyle];

  const baseStyles: React.CSSProperties = {
    ...sizeStyles[size],
    ...styleConfig,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.tight,
    borderRadius: borders.radius.full, // Pill shape
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  return (
    <span {...props} style={{ ...baseStyles, ...customStyle }}>
      {leftIcon}
      {children}
      {rightIcon}
    </span>
  );
};
