import { InputHTMLAttributes, ReactNode, CSSProperties } from 'react';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';
import { spacing } from '@/tokens/spacing';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox = ({
  label,
  error,
  size = 'md',
  disabled = false,
  checked,
  className = '',
  style,
  id,
  ...props
}: CheckboxProps) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  // Size styles
  const sizeMap = {
    sm: { width: '16px', height: '16px', fontSize: typography.fontSize.sm },
    md: { width: '20px', height: '20px', fontSize: typography.fontSize.base },
    lg: { width: '24px', height: '24px', fontSize: typography.fontSize.lg },
  };

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[2],
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const checkboxStyle: CSSProperties = {
    width: sizeMap[size].width,
    height: sizeMap[size].height,
    cursor: disabled ? 'not-allowed' : 'pointer',
    accentColor: colors.primary[500],
  };

  const labelStyle: CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: sizeMap[size].fontSize,
    color: error ? colors.semantic.error.DEFAULT : colors.neutral[900],
    userSelect: 'none',
  };

  const errorStyle: CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs,
    color: colors.semantic.error.DEFAULT,
    marginTop: spacing[2],
  };

  return (
    <div className={className}>
      <label htmlFor={checkboxId} style={containerStyle}>
        <input
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          checked={checked}
          style={checkboxStyle}
          aria-invalid={!!error}
          aria-describedby={error ? `${checkboxId}-error` : undefined}
          {...props}
        />
        {label && <span style={labelStyle}>{label}</span>}
      </label>
      {error && (
        <div id={`${checkboxId}-error`} role="alert" style={errorStyle}>
          {error}
        </div>
      )}
    </div>
  );
};

// CheckboxGroup component
export interface CheckboxGroupProps {
  label?: string;
  options: Array<{ value: string; label: ReactNode; disabled?: boolean }>;
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

export const CheckboxGroup = ({
  label,
  options,
  value = [],
  onChange,
  error,
  orientation = 'vertical',
  size = 'md',
  className = '',
  style,
}: CheckboxGroupProps) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (!onChange) return;

    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    ...style,
  };

  const labelStyle: CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: error ? colors.semantic.error.DEFAULT : colors.neutral[700],
    marginBottom: spacing[4],
  };

  const optionsContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap: orientation === 'vertical' ? spacing[3] : spacing[4],
    flexWrap: orientation === 'horizontal' ? 'wrap' : undefined,
  };

  return (
    <div className={className} style={containerStyle} role="group" aria-label={label}>
      {label && <div style={labelStyle}>{label}</div>}
      <div style={optionsContainerStyle}>
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={value.includes(option.value)}
            disabled={option.disabled}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            size={size}
          />
        ))}
      </div>
      {error && (
        <div role="alert" style={{ fontSize: typography.fontSize.xs, color: colors.semantic.error.DEFAULT }}>
          {error}
        </div>
      )}
    </div>
  );
};
