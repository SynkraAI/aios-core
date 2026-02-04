import { HTMLAttributes, CSSProperties } from 'react';
import { colors } from '../../tokens';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'linear' | 'circular';
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  label?: string;
}

const linearSizeMap = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
};

const circularSizeMap = {
  sm: { size: '2rem', stroke: 3 },
  md: { size: '3rem', stroke: 4 },
  lg: { size: '4rem', stroke: 5 },
};

export const Progress = ({
  variant = 'linear',
  value,
  size = 'md',
  color = colors.primary[500],
  showLabel = false,
  label,
  style,
  ...props
}: ProgressProps) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  if (variant === 'linear') {
    const height = linearSizeMap[size];

    const containerStyle: CSSProperties = {
      width: '100%',
      ...style,
    };

    const trackStyle: CSSProperties = {
      width: '100%',
      height,
      backgroundColor: colors.neutral[200],
      borderRadius: '9999px',
      overflow: 'hidden',
      position: 'relative',
    };

    const barStyle: CSSProperties = {
      height: '100%',
      width: `${clampedValue}%`,
      backgroundColor: color,
      transition: 'width 0.3s ease',
      borderRadius: '9999px',
    };

    const labelContainerStyle: CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      color: colors.neutral[700],
    };

    return (
      <div style={containerStyle} role="progressbar" aria-valuenow={clampedValue} aria-valuemin={0} aria-valuemax={100} {...props}>
        {(showLabel || label) && (
          <div style={labelContainerStyle}>
            <span>{label}</span>
            <span style={{ fontWeight: 600 }}>{clampedValue}%</span>
          </div>
        )}
        <div style={trackStyle}>
          <div style={barStyle} />
        </div>
      </div>
    );
  }

  if (variant === 'circular') {
    const { size: circleSize, stroke } = circularSizeMap[size];
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedValue / 100) * circumference;

    const containerStyle: CSSProperties = {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      ...style,
    };

    const svgStyle: CSSProperties = {
      width: circleSize,
      height: circleSize,
      transform: 'rotate(-90deg)',
    };

    const labelStyle: CSSProperties = {
      fontSize: size === 'sm' ? '0.75rem' : size === 'md' ? '0.875rem' : '1rem',
      fontWeight: 600,
      color: colors.neutral[700],
    };

    return (
      <div style={containerStyle} role="progressbar" aria-valuenow={clampedValue} aria-valuemin={0} aria-valuemax={100} {...props}>
        <svg style={svgStyle}>
          {/* Background circle */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke={colors.neutral[200]}
            strokeWidth={stroke}
          />
          {/* Progress circle */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        {(showLabel || label) && (
          <div style={labelStyle}>
            {label ? `${label} ${clampedValue}%` : `${clampedValue}%`}
          </div>
        )}
      </div>
    );
  }

  return null;
};
