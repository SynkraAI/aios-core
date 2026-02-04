import { InputHTMLAttributes, ReactNode, CSSProperties, useState } from 'react';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';
import { spacing } from '@/tokens/spacing';
import { borders } from '@/tokens/borders';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  size = 'md',
  disabled = false,
  className = '',
  style,
  id,
  type = 'text',
  ...props
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Size styles
  const sizeStyles: Record<string, CSSProperties> = {
    sm: {
      padding: `${spacing[6]} ${spacing[2.5]}`,
      fontSize: typography.fontSize.sm,
    },
    md: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.base,
    },
    lg: {
      padding: `${spacing[2.5]} ${spacing[4]}`,
      fontSize: typography.fontSize.lg,
    },
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  const labelStyle: CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: error ? colors.semantic.error.DEFAULT : colors.neutral[700],
    marginBottom: spacing[2],
  };

  const inputWrapperStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  const inputStyle: CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    width: '100%',
    border: `${borders.borderWidth.DEFAULT} solid ${
      error
        ? colors.semantic.error.DEFAULT
        : isFocused
        ? colors.primary[500]
        : colors.neutral[300]
    }`,
    borderRadius: borders.borderRadius.md,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: disabled ? colors.neutral[100] : colors.neutral.white,
    color: disabled ? colors.neutral[500] : colors.neutral[900],
    cursor: disabled ? 'not-allowed' : 'text',
    paddingLeft: leftIcon ? spacing[10] : undefined,
    paddingRight: rightIcon ? spacing[10] : undefined,
    ...sizeStyles[size],
  };

  const iconStyle: CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.neutral[500],
    pointerEvents: 'none',
  };

  const leftIconStyle: CSSProperties = {
    ...iconStyle,
    left: spacing[3],
  };

  const rightIconStyle: CSSProperties = {
    ...iconStyle,
    right: spacing[3],
  };

  const helperStyle: CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs,
    color: error ? colors.semantic.error.DEFAULT : colors.neutral[600],
    marginTop: spacing[2],
  };

  return (
    <div className={className} style={containerStyle}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <div style={inputWrapperStyle}>
        {leftIcon && <span style={leftIconStyle}>{leftIcon}</span>}
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          style={inputStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {rightIcon && <span style={rightIconStyle}>{rightIcon}</span>}
      </div>
      {error && (
        <span id={`${inputId}-error`} role="alert" style={helperStyle}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} style={helperStyle}>
          {helperText}
        </span>
      )}
    </div>
  );
};
