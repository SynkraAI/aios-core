import { InputHTMLAttributes, ReactNode, CSSProperties } from 'react';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';
import { spacing } from '@/tokens/spacing';
import { borders } from '@/tokens/borders';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  labelPosition?: 'left' | 'right';
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Switch = ({
  label,
  labelPosition = 'right',
  error,
  size = 'md',
  disabled = false,
  checked,
  className = '',
  style,
  id,
  ...props
}: SwitchProps) => {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  // Size styles
  const sizeMap = {
    sm: {
      width: '36px',
      height: '20px',
      thumbSize: '16px',
      thumbOffset: '2px',
      fontSize: typography.fontSize.sm,
    },
    md: {
      width: '44px',
      height: '24px',
      thumbSize: '20px',
      thumbOffset: '2px',
      fontSize: typography.fontSize.base,
    },
    lg: {
      width: '52px',
      height: '28px',
      thumbSize: '24px',
      thumbOffset: '2px',
      fontSize: typography.fontSize.lg,
    },
  };

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[3],
    flexDirection: labelPosition === 'left' ? 'row-reverse' : 'row',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const switchContainerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: sizeMap[size].width,
    height: sizeMap[size].height,
  };

  const inputStyle: CSSProperties = {
    opacity: 0,
    width: 0,
    height: 0,
    position: 'absolute',
  };

  const sliderStyle: CSSProperties = {
    position: 'absolute',
    cursor: disabled ? 'not-allowed' : 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: checked ? colors.primary[500] : colors.neutral[300],
    transition: 'background-color 0.2s ease',
    borderRadius: borders.borderRadius.full,
  };

  const thumbStyle: CSSProperties = {
    position: 'absolute',
    height: sizeMap[size].thumbSize,
    width: sizeMap[size].thumbSize,
    left: checked
      ? `calc(100% - ${sizeMap[size].thumbSize} - ${sizeMap[size].thumbOffset})`
      : sizeMap[size].thumbOffset,
    bottom: sizeMap[size].thumbOffset,
    backgroundColor: colors.neutral.white,
    transition: 'left 0.2s ease',
    borderRadius: borders.borderRadius.full,
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
      <label htmlFor={switchId} style={containerStyle}>
        <div style={switchContainerStyle}>
          <input
            type="checkbox"
            id={switchId}
            disabled={disabled}
            checked={checked}
            style={inputStyle}
            role="switch"
            aria-checked={checked}
            aria-invalid={!!error}
            aria-describedby={error ? `${switchId}-error` : undefined}
            {...props}
          />
          <span style={sliderStyle}>
            <span style={thumbStyle} />
          </span>
        </div>
        {label && <span style={labelStyle}>{label}</span>}
      </label>
      {error && (
        <div id={`${switchId}-error`} role="alert" style={errorStyle}>
          {error}
        </div>
      )}
    </div>
  );
};
