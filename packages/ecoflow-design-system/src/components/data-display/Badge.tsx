import { ReactNode, HTMLAttributes, CSSProperties } from 'react';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';
import { spacing } from '@/tokens/spacing';
import { borders } from '@/tokens/borders';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const Badge = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  style,
  ...props
}: BadgeProps) => {
  // Size styles
  const sizeStyles: Record<string, CSSProperties> = {
    sm: {
      padding: `${spacing[2]} ${spacing[6]}`,
      fontSize: typography.fontSize.xs,
    },
    md: {
      padding: `${spacing[4]} ${spacing[8]}`,
      fontSize: typography.fontSize.sm,
    },
    lg: {
      padding: `${spacing[6]} ${spacing[12]}`,
      fontSize: typography.fontSize.base,
    },
  };

  // Variant styles
  const variantStyles: Record<string, CSSProperties> = {
    default: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[700],
    },
    primary: {
      backgroundColor: colors.primary[100],
      color: colors.primary[700],
    },
    secondary: {
      backgroundColor: colors.accent.yellow[100],
      color: colors.neutral[900],
    },
    success: {
      backgroundColor: colors.semantic.success.light,
      color: colors.semantic.success.dark,
    },
    warning: {
      backgroundColor: colors.semantic.warning.light,
      color: colors.semantic.warning.dark,
    },
    error: {
      backgroundColor: colors.semantic.error.light,
      color: colors.semantic.error.dark,
    },
    info: {
      backgroundColor: colors.semantic.info.light,
      color: colors.semantic.info.dark,
    },
  };

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    borderRadius: borders.borderRadius.full,
    whiteSpace: 'nowrap',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <span className={className} style={badgeStyle} {...props}>
      {children}
    </span>
  );
};
