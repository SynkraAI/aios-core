import { HTMLAttributes, CSSProperties } from 'react';
import { colors } from '../../tokens';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

const sizeMap = {
  sm: { spinner: '1rem', dots: '0.375rem' },
  md: { spinner: '2rem', dots: '0.5rem' },
  lg: { spinner: '3rem', dots: '0.75rem' },
};

export const Loading = ({
  variant = 'spinner',
  size = 'md',
  color = colors.primary[500],
  label,
  style,
  ...props
}: LoadingProps) => {
  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    ...style,
  };

  const labelStyle: CSSProperties = {
    fontSize: '0.875rem',
    color: colors.neutral[600],
  };

  if (variant === 'spinner') {
    const spinnerSize = sizeMap[size].spinner;
    const spinnerStyle: CSSProperties = {
      width: spinnerSize,
      height: spinnerSize,
      border: `${size === 'sm' ? 2 : size === 'md' ? 3 : 4}px solid ${colors.neutral[200]}`,
      borderTop: `${size === 'sm' ? 2 : size === 'md' ? 3 : 4}px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    };

    return (
      <div style={containerStyle} role="status" aria-label={label || 'Loading'} {...props}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={spinnerStyle} />
        {label && <span style={labelStyle}>{label}</span>}
      </div>
    );
  }

  if (variant === 'dots') {
    const dotSize = sizeMap[size].dots;
    const dotsContainerStyle: CSSProperties = {
      display: 'flex',
      gap: size === 'sm' ? '0.25rem' : size === 'md' ? '0.375rem' : '0.5rem',
    };

    const dotStyle: CSSProperties = {
      width: dotSize,
      height: dotSize,
      borderRadius: '50%',
      backgroundColor: color,
      animation: 'bounce 1.4s ease-in-out infinite',
    };

    return (
      <div style={containerStyle} role="status" aria-label={label || 'Loading'} {...props}>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        <div style={dotsContainerStyle}>
          <div style={{ ...dotStyle, animationDelay: '0s' }} />
          <div style={{ ...dotStyle, animationDelay: '0.2s' }} />
          <div style={{ ...dotStyle, animationDelay: '0.4s' }} />
        </div>
        {label && <span style={labelStyle}>{label}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    const pulseSize = sizeMap[size].spinner;
    const pulseStyle: CSSProperties = {
      width: pulseSize,
      height: pulseSize,
      borderRadius: '50%',
      backgroundColor: color,
      animation: 'pulse 1.5s ease-in-out infinite',
    };

    return (
      <div style={containerStyle} role="status" aria-label={label || 'Loading'} {...props}>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.3; }
          }
        `}</style>
        <div style={pulseStyle} />
        {label && <span style={labelStyle}>{label}</span>}
      </div>
    );
  }

  return null;
};
