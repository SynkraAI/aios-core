import { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';
import { spacing } from '@/tokens/spacing';
import { borders } from '@/tokens/borders';
import { shadows } from '@/tokens/shadows';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  style,
  ...props
}: ButtonProps) => {
  // Size styles
  const sizeStyles: Record<string, CSSProperties> = {
    sm: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.tight,
    },
    md: {
      padding: `${spacing[2.5]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
    },
    lg: {
      padding: `${spacing[3]} ${spacing[6]}`,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.normal,
    },
  };

  // Variant styles
  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      backgroundColor: colors.primary[500],
      color: colors.neutral.white,
      border: 'none',
    },
    secondary: {
      backgroundColor: colors.accent.yellow[500],
      color: colors.neutral[900],
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary[500],
      border: `${borders.borderWidth.DEFAULT} solid ${colors.primary[500]}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.primary[500],
      border: 'none',
    },
    danger: {
      backgroundColor: colors.semantic.error.DEFAULT,
      color: colors.neutral.white,
      border: 'none',
    },
  };

  const buttonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    borderRadius: borders.borderRadius.md,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    boxShadow: variant === 'primary' || variant === 'secondary' ? shadows.boxShadow.sm : 'none',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button
      disabled={disabled || loading}
      className={className}
      style={buttonStyle}
      {...props}
    >
      {loading && <span aria-label="Loading">⏳</span>}
      {!loading && icon && iconPosition === 'left' && <span>{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span>{icon}</span>}
    </button>
  );
};
