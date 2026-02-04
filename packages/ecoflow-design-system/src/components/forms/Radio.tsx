import { InputHTMLAttributes, ReactNode, CSSProperties } from 'react';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';
import { spacing } from '@/tokens/spacing';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Radio = ({
  label,
  error,
  size = 'md',
  disabled = false,
  checked,
  className = '',
  style,
  id,
  ...props
}: RadioProps) => {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

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

  const radioStyle: CSSProperties = {
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
      <label htmlFor={radioId} style={containerStyle}>
        <input
          type="radio"
          id={radioId}
          disabled={disabled}
          checked={checked}
          style={radioStyle}
          aria-invalid={!!error}
          aria-describedby={error ? `${radioId}-error` : undefined}
          {...props}
        />
        {label && <span style={labelStyle}>{label}</span>}
      </label>
      {error && (
        <div id={`${radioId}-error`} role="alert" style={errorStyle}>
          {error}
        </div>
      )}
    </div>
  );
};

// RadioGroup component
export interface RadioGroupProps {
  label?: string;
  name: string;
  options: Array<{ value: string; label: ReactNode; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

export const RadioGroup = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  orientation = 'vertical',
  size = 'md',
  className = '',
  style,
}: RadioGroupProps) => {
  const handleChange = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
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
    <div className={className} style={containerStyle} role="radiogroup" aria-label={label}>
      {label && <div style={labelStyle}>{label}</div>}
      <div style={optionsContainerStyle}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            label={option.label}
            value={option.value}
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => handleChange(option.value)}
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
