import { SelectHTMLAttributes, CSSProperties } from 'react';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';
import { spacing } from '@/tokens/spacing';
import { borders } from '@/tokens/borders';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Select = ({
  label,
  options,
  placeholder,
  error,
  helperText,
  fullWidth = false,
  size = 'md',
  disabled = false,
  className = '',
  style,
  id,
  ...props
}: SelectProps) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

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

  const selectStyle: CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    width: '100%',
    border: `${borders.borderWidth.DEFAULT} solid ${
      error ? colors.semantic.error.DEFAULT : colors.neutral[300]
    }`,
    borderRadius: borders.borderRadius.md,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: disabled ? colors.neutral[100] : colors.neutral.white,
    color: disabled ? colors.neutral[500] : colors.neutral[900],
    cursor: disabled ? 'not-allowed' : 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${spacing[3]} center`,
    paddingRight: spacing[10],
    ...sizeStyles[size],
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
        <label htmlFor={selectId} style={labelStyle}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        disabled={disabled}
        style={selectStyle}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
        }
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${selectId}-error`} role="alert" style={helperStyle}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${selectId}-helper`} style={helperStyle}>
          {helperText}
        </span>
      )}
    </div>
  );
};
